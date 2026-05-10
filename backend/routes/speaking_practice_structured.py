"""
Smart Practice — structured per-question speaking evaluation route.

POST /api/speaking-practice/evaluate-structured

Multipart payload (variable N, 1..10 questions):
    user_id, part (part1|part2|part3), topic, user_language, target_band,
    client_request_id, set_id?, question_id?, book_id?, test_id?,
    question_q{i}      (str)
    audio_q{i}         (UploadFile)
    duration_q{i}      (float seconds)

Returns the structured per-question + overall result produced by
services.speaking_practice_structured.evaluate_speaking_practice_structured,
plus part / topic / audit metadata. Counts as ONE eval against the user's
quota (same `speaking_evals` counter as Liz Examiner / per-part flows).

This route does NOT replace /api/speaking/evaluate (Liz Examiner). Liz
Examiner stays on its single-audio-per-part pipeline.
"""
from __future__ import annotations

import logging
import time
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from starlette.datastructures import UploadFile as StarletteUploadFile

from services import speaking_idempotency
from services.audio_processor import persist_audio, validate_audio
from services.speaking_practice_structured import (
    StructuredEvaluatorFailure,
    evaluate_speaking_practice_structured,
)
from services.tier_resolver import (
    EvalDecision,
    record_speaking_eval,
    resolve_speaking_eval,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/speaking-practice", tags=["Speaking Practice (Structured)"])

MAX_QUESTIONS = 10  # safety cap; Smart Practice Part 1 = 5, Part 3 ≤ 6

db = None


def set_db(database) -> None:
    global db
    db = database


# ─── Telemetry ──────────────────────────────────────────────────────────────


async def _emit_telemetry(event: Dict[str, Any]) -> None:
    if db is None:
        return
    try:
        await db.telemetry_events.insert_one(event)
    except Exception as exc:
        logger.warning("Telemetry emit failed: %s", exc)


# ─── Persistence ────────────────────────────────────────────────────────────


async def _persist_structured_attempt(
    *,
    user_id: str,
    client_request_id: Optional[str],
    part: str,
    topic: str,
    user_language: str,
    target_band: float,
    questions_meta: List[Dict[str, Any]],   # [{question, audio_url, audio_filename, audio_bytes, duration_seconds}]
    result_dump: Dict[str, Any],
    decision: EvalDecision,
    set_id: Optional[str],
    book_id: Optional[str],
    test_id: Optional[str],
) -> None:
    if db is None:
        return
    try:
        await db.speaking_practice_structured_attempts.insert_one(
            {
                "_id": uuid.uuid4().hex,
                "user_id": user_id,
                "client_request_id": client_request_id,
                "created_at": datetime.now(timezone.utc),
                "context": "smart_practice_structured",
                "part": part,
                "topic": topic,
                "user_language": user_language,
                "target_band": target_band,
                "questions_meta": questions_meta,
                "result": result_dump,
                "evaluation_mode": decision.mode,
                "plan": decision.plan,
                "period_key": decision.period_key,
                "set_id": set_id,
                "book_id": book_id,
                "test_id": test_id,
            }
        )
    except Exception as exc:
        logger.warning("Failed to persist structured speaking attempt: %s", exc)


def _quota_headers(decision: EvalDecision) -> Dict[str, str]:
    return {
        "X-Speaking-Eval-Mode": decision.mode,
        "X-Speaking-Plan": decision.plan,
        "X-Speaking-Quota": str(decision.quota),
        "X-Speaking-Used": str(decision.used + 1),
        "X-Speaking-Remaining": str(max(decision.remaining - 1, 0)),
        "X-Speaking-Period": decision.period_key,
        "X-Speaking-Resets-At": decision.resets_at,
    }


# ─── Multipart parsing ──────────────────────────────────────────────────────


async def _parse_questions_from_form(form) -> List[Dict[str, Any]]:
    """Pull question_q{i} / audio_q{i} / duration_q{i} into a contiguous list.
    Returns [{question, audio_bytes, duration_seconds}], indices 1..N where
    every triple is present. Raises HTTPException(400) if nothing valid."""
    items: List[Dict[str, Any]] = []
    for i in range(1, MAX_QUESTIONS + 1):
        q_field = form.get(f"question_q{i}")
        a_field = form.get(f"audio_q{i}")
        d_field = form.get(f"duration_q{i}")
        if q_field is None and a_field is None:
            continue  # gap — stop scanning further indices
        if q_field is None or a_field is None:
            raise HTTPException(
                status_code=400,
                detail={
                    "code": "incomplete_question",
                    "message": f"question_q{i} and audio_q{i} must both be provided.",
                },
            )
        if not isinstance(a_field, StarletteUploadFile):
            raise HTTPException(
                status_code=400,
                detail={
                    "code": "invalid_audio_field",
                    "message": f"audio_q{i} must be an uploaded file.",
                },
            )
        try:
            duration = float(d_field) if d_field is not None else 0.0
        except (TypeError, ValueError):
            duration = 0.0
        audio_bytes = await a_field.read()
        items.append({
            "index": i,
            "question": str(q_field),
            "audio_bytes": audio_bytes,
            "duration_seconds": duration,
        })
    if not items:
        raise HTTPException(
            status_code=400,
            detail={
                "code": "no_questions",
                "message": "Provide at least one question_q1 + audio_q1 pair.",
            },
        )
    return items


# ─── Endpoint ───────────────────────────────────────────────────────────────


@router.post("/evaluate-structured")
async def evaluate_structured(request: Request):
    """Per-question Smart Practice evaluation. See module docstring."""
    if db is None:
        raise HTTPException(
            status_code=503,
            detail={"code": "db_unavailable", "message": "DB not initialised"},
        )

    form = await request.form()

    user_id = (form.get("user_id") or "").strip()
    if not user_id:
        raise HTTPException(
            status_code=400,
            detail={"code": "missing_user_id", "message": "user_id required"},
        )

    part = (form.get("part") or "part1").strip()
    if part not in {"part1", "part2", "part3"}:
        part = "part1"
    topic = (form.get("topic") or "").strip()
    user_language = (form.get("user_language") or "en").strip().lower().split("-")[0][:5] or "en"
    try:
        target_band = float(form.get("target_band") or 7.0)
    except (TypeError, ValueError):
        target_band = 7.0
    client_request_id = (form.get("client_request_id") or None)
    set_id = form.get("set_id") or None
    book_id = form.get("book_id") or None
    test_id = form.get("test_id") or None

    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(
            status_code=404,
            detail={"code": "user_not_found", "message": "User not found"},
        )

    # Idempotency check — replays return the cached structured payload.
    cached = await speaking_idempotency.lookup(
        db,
        user_id=user_id,
        anon_key=None,
        client_request_id=client_request_id,
    )
    if cached is not None:
        return JSONResponse(content=cached, headers={"X-Speaking-Cached": "1"})

    # Parse questions from multipart.
    questions = await _parse_questions_from_form(form)

    # Validate every audio (size + duration) before charging quota.
    for q in questions:
        validate_audio(q["audio_bytes"], q["duration_seconds"])

    # Quota / mode resolution. One structured session = one eval.
    decision = await resolve_speaking_eval(db, user)
    if not decision.allowed:
        await _emit_telemetry({
            "_id": uuid.uuid4().hex,
            "ts": datetime.now(timezone.utc),
            "event": "speaking_eval",
            "user_id": user_id,
            "plan": decision.plan,
            "mode": decision.mode,
            "context": "smart_practice_structured",
            "success": False,
            "error_code": "quota_exhausted",
            "quota_remaining": decision.remaining,
            "period_key": decision.period_key,
            "latency_ms": 0,
        })
        raise HTTPException(
            status_code=402,
            detail={
                "code": "quota_exhausted",
                "message": decision.message
                    or "You've used all evaluations for this period.",
                "quota": decision.quota,
                "used": decision.used,
                "period": decision.period_key,
                "resets_at": decision.resets_at,
                "upgrade_to": decision.upgrade_to,
                "current_plan": decision.plan,
            },
        )

    # Persist each question's audio so the results UI can play it back per-tab.
    questions_meta: List[Dict[str, Any]] = []
    for q in questions:
        meta = persist_audio(q["audio_bytes"])
        q["audio_url"] = meta["relative_url"]
        questions_meta.append({
            "index": q["index"],
            "question": q["question"],
            "audio_url": meta["relative_url"],
            "audio_filename": meta["filename"],
            "audio_bytes": meta["bytes"],
            "duration_seconds": q["duration_seconds"],
        })

    # Run the orchestrator (Whisper×N or Azure×N + Sonnet×1).
    started = time.monotonic()
    try:
        result = await evaluate_speaking_practice_structured(
            part=part,
            topic=topic,
            target_band=target_band,
            user_language=user_language,
            questions=[
                {
                    "question": q["question"],
                    "audio_bytes": q["audio_bytes"],
                    "audio_url": q["audio_url"],
                    "duration_seconds": q["duration_seconds"],
                }
                for q in questions
            ],
            mode=decision.mode,
        )
    except StructuredEvaluatorFailure as exc:
        latency_ms = int((time.monotonic() - started) * 1000)
        await _emit_telemetry({
            "_id": uuid.uuid4().hex,
            "ts": datetime.now(timezone.utc),
            "event": "speaking_eval",
            "user_id": user_id,
            "plan": decision.plan,
            "mode": decision.mode,
            "context": "smart_practice_structured",
            "success": False,
            "error_code": "evaluator_failed",
            "error_detail": exc.last_error,
            "attempts": exc.attempts,
            "quota_remaining": decision.remaining,
            "period_key": decision.period_key,
            "latency_ms": latency_ms,
        })
        raise HTTPException(
            status_code=502,
            detail={
                "code": "speaking_evaluator_failed",
                "message": str(exc),
                "attempts": exc.attempts,
                "last_error": exc.last_error,
            },
        )

    latency_ms = int((time.monotonic() - started) * 1000)

    # Surface metadata the UI header / results page need.
    result["part"] = part
    result["topic"] = topic
    result["target_band"] = target_band
    result["user_language"] = user_language

    # Persist + bump counters.
    await _persist_structured_attempt(
        user_id=user_id,
        client_request_id=client_request_id,
        part=part,
        topic=topic,
        user_language=user_language,
        target_band=target_band,
        questions_meta=questions_meta,
        result_dump=result,
        decision=decision,
        set_id=set_id,
        book_id=book_id,
        test_id=test_id,
    )

    # Mirror to test_attempts so Progress page sees Smart Practice sessions.
    try:
        from server import persist_attempt as _persist_test_attempt
        _band = float((result.get("scores") or {}).get("overall") or 0.0)
        await _persist_test_attempt(
            user_id=user_id,
            test_id=test_id or f"speaking_practice_{part}_{set_id or 'session'}",
            test_type="speaking",
            band_score=_band,
            feedback={
                "source": "speaking_practice_structured",
                "context": "smart_practice_structured",
                "part": part,
                "scores": result.get("scores") or {},
            },
        )
    except Exception as _e:
        logger.warning("persist_attempt mirror skipped (structured): %s", _e)

    await record_speaking_eval(db, user, decision)
    await speaking_idempotency.store(
        db,
        user_id=user_id,
        anon_key=None,
        client_request_id=client_request_id,
        result=result,
    )
    await _emit_telemetry({
        "_id": uuid.uuid4().hex,
        "ts": datetime.now(timezone.utc),
        "event": "speaking_eval",
        "user_id": user_id,
        "plan": decision.plan,
        "mode": decision.mode,
        "context": "smart_practice_structured",
        "success": True,
        "latency_ms": latency_ms,
        "quota_remaining": max(decision.remaining - 1, 0),
        "period_key": decision.period_key,
        "n_questions": len(questions),
    })

    return JSONResponse(content=result, headers=_quota_headers(decision))
