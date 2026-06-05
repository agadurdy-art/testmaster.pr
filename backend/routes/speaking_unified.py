"""
Unified speaking evaluation endpoint
====================================
Single backend surface for speaking-eval calls from every UI surface
(question bank, full test, Cambridge, sample player, dashboard practice).
Replaces four legacy routes that diverged on schema, LLM, and quota
behaviour. See memory/project_speaking_unified_endpoint_design.md for
the locked design decisions this implementation follows.

Public endpoints:
    POST /api/speaking/evaluate                # authenticated
    POST /api/speaking/evaluate-anonymous      # email-gated, weekly limit

Both return a SpeakingEvaluationResult JSON payload (the same shape
WritingEvaluatorResult-equivalent for speaking) plus the X-Speaking-* headers
the frontend reads to render the basic-mode banner / quota meter.
"""
from __future__ import annotations

import logging
import time
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from email_validator import EmailNotValidError, validate_email
from fastapi import APIRouter, File, Form, HTTPException, Request, UploadFile, Depends
import auth_session  # audit: speaking eval is user-owned (cost + IDOR)
from fastapi.responses import JSONResponse

from schemas.speaking_evaluator import (
    FullTestPartInput,
    SpeakingEvaluationRequest,
    SpeakingFullTestEvaluationRequest,
    SpeakingPart,
)
from services import speaking_idempotency
from services.audio_processor import persist_audio, validate_audio
from services.speaking_evaluator import (
    SpeakingEvaluatorFailure,
    build_user_audio_from_turns,
    evaluate_speaking,
    evaluate_speaking_basic,
    evaluate_speaking_from_transcript,
    evaluate_speaking_fulltest,
)
from services.tier_resolver import (
    EvalDecision,
    record_speaking_eval,
    resolve_speaking_eval,
)
from services.usage_tracking import current_week_key

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/speaking", tags=["Speaking Evaluation (Unified)"])

# Module-level db handle; populated by server.py on startup via set_db().
db = None


def set_db(database) -> None:
    global db
    db = database


# ─── Telemetry ───────────────────────────────────────────────────────────────


async def _emit_telemetry(event: Dict[str, Any]) -> None:
    """Insert a row into db.telemetry_events. Best-effort — telemetry
    failures must never break the user-visible response."""
    if db is None:
        return
    try:
        await db.telemetry_events.insert_one(event)
    except Exception as exc:
        logger.warning("Telemetry emit failed: %s", exc)


# ─── Persistence helpers ─────────────────────────────────────────────────────


async def _persist_attempt(
    *,
    user_id: Optional[str],
    client_request_id: Optional[str],
    audio_meta: Dict[str, Any],
    req: SpeakingEvaluationRequest,
    result_dump: Dict[str, Any],
    decision: EvalDecision,
    context: str,
    set_id: Optional[str],
    question_id: Optional[str],
    book_id: Optional[str],
    test_id: Optional[str],
) -> None:
    if db is None:
        return
    try:
        await db.speaking_attempts.insert_one(
            {
                "_id": uuid.uuid4().hex,
                "user_id": user_id,
                "client_request_id": client_request_id,
                "created_at": datetime.now(timezone.utc),
                "context": context,
                "part": req.part.value,
                "cue_card_prompt": req.cue_card_prompt,
                "cue_card_bullets": list(req.cue_card_bullets),
                "duration_seconds": req.duration_seconds,
                "audio_url": audio_meta["relative_url"],
                "audio_filename": audio_meta["filename"],
                "audio_bytes": audio_meta["bytes"],
                "result": result_dump,
                "evaluation_mode": decision.mode,
                "plan": decision.plan,
                "period_key": decision.period_key,
                "set_id": set_id,
                "question_id": question_id,
                "book_id": book_id,
                "test_id": test_id,
            }
        )
    except Exception as exc:
        logger.warning("Failed to persist speaking attempt: %s", exc)


# ─── Request shaping ─────────────────────────────────────────────────────────


_VALID_CONTEXTS = {"practice", "qb", "full_test", "cambridge"}


def _build_eval_request(
    *,
    part: str,
    cue_card_prompt: str,
    cue_card_bullets: str,
    user_language: str,
    target_band: float,
    duration_seconds: float,
) -> SpeakingEvaluationRequest:
    try:
        part_enum = SpeakingPart(part) if part else SpeakingPart.part2
    except ValueError:
        part_enum = SpeakingPart.part2

    bullets: List[str] = []
    if cue_card_bullets:
        bullets = [
            b.strip()
            for b in cue_card_bullets.replace("\r", "").split("\n")
            if b.strip()
        ]

    try:
        return SpeakingEvaluationRequest(
            part=part_enum,
            cue_card_prompt=cue_card_prompt,
            cue_card_bullets=bullets,
            user_language=user_language,
            target_band=target_band,
            duration_seconds=duration_seconds if duration_seconds > 0 else None,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail={"code": "invalid_request", "message": str(exc)},
        )


# ─── Headers ─────────────────────────────────────────────────────────────────


def _quota_headers(decision: EvalDecision) -> Dict[str, str]:
    return {
        "X-Speaking-Eval-Mode": decision.mode,
        "X-Speaking-Plan": decision.plan,
        "X-Speaking-Quota": str(decision.quota),
        "X-Speaking-Used": str(decision.used + 1),  # post-increment
        "X-Speaking-Remaining": str(max(decision.remaining - 1, 0)),
        "X-Speaking-Period": decision.period_key,
        "X-Speaking-Resets-At": decision.resets_at,
    }


# ─── Topic catalogue ─────────────────────────────────────────────────────────


@router.get("/topics")
async def list_speaking_topics(band_level: Optional[str] = None) -> Dict[str, Any]:
    """Return the course-driven topic catalogue used to seed Liz Live and
    cue-card draws. Pulls from beginner / mastery / advanced lesson collections
    via LessonRegistry — single source of truth so /question-bank, /speaking
    and /liz-live all see the same ~47 topics.

    Optional ``band_level`` (one of "4.0-5.0", "5.5-6.5", "7.0-9.0") narrows
    the result to topics permitted at that band per the standard topic gate.
    """
    if db is None:
        raise HTTPException(
            status_code=503,
            detail={"code": "db_unavailable", "message": "Topic catalogue unavailable."},
        )
    from services.lesson_registry import LessonRegistry

    registry = LessonRegistry(db)
    if band_level:
        topics = await registry.get_topics_by_band(band_level)
    else:
        topics = await registry.get_all_topics()
    # Stable order: alphabetic by name so the chip rail doesn't reshuffle
    # between requests (Mongo ordering is not guaranteed across collections).
    topics.sort(key=lambda t: (t.get("name") or "").lower())
    return {"topics": topics, "count": len(topics)}


# ─── Authenticated endpoint ──────────────────────────────────────────────────


@router.post("/evaluate")
async def evaluate(
    request: Request,
    audio: UploadFile = File(...),
    user_id: str = Form(...),
    part: str = Form("part2"),
    cue_card_prompt: str = Form(...),
    cue_card_bullets: str = Form(""),
    user_language: str = Form("en"),
    target_band: float = Form(7.0),
    duration_seconds: float = Form(0.0),
    context: str = Form("practice"),
    # Required by Faz 3 so every paid Sonnet+Azure pass has an idempotency
    # anchor. A missing/blank id used to silently disable the cache, leaving
    # network retries to double-bill the user.
    client_request_id: str = Form(..., min_length=1, max_length=128),
    set_id: Optional[str] = Form(None),
    question_id: Optional[str] = Form(None),
    book_id: Optional[str] = Form(None),
    test_id: Optional[str] = Form(None),
    caller: dict = Depends(auth_session.current_user),
):
    """Authenticated speaking evaluation. Multipart payload. See module
    docstring for the response contract."""
    auth_session.require_self_or_admin(user_id, caller)
    if db is None:
        raise HTTPException(
            status_code=503,
            detail={"code": "db_unavailable", "message": "DB not initialised"},
        )

    if context not in _VALID_CONTEXTS:
        context = "practice"

    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(
            status_code=404,
            detail={"code": "user_not_found", "message": "User not found"},
        )

    # Idempotency check before any heavy work.
    cached = await speaking_idempotency.lookup(
        db,
        user_id=user_id,
        anon_key=None,
        client_request_id=client_request_id,
    )
    if cached is not None:
        return JSONResponse(content=cached, headers={"X-Speaking-Cached": "1"})

    audio_bytes = await audio.read()
    validate_audio(audio_bytes, duration_seconds)

    req = _build_eval_request(
        part=part,
        cue_card_prompt=cue_card_prompt,
        cue_card_bullets=cue_card_bullets,
        user_language=user_language,
        target_band=target_band,
        duration_seconds=duration_seconds,
    )

    decision = await resolve_speaking_eval(db, user)
    if not decision.allowed:
        await _emit_telemetry({
            "_id": uuid.uuid4().hex,
            "ts": datetime.now(timezone.utc),
            "event": "speaking_eval",
            "user_id": user_id,
            "plan": decision.plan,
            "mode": decision.mode,
            "context": context,
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

    audio_meta = persist_audio(audio_bytes)

    started = time.monotonic()
    try:
        if decision.mode == "full":
            result = await evaluate_speaking(req, audio_bytes)
        else:
            result = await evaluate_speaking_basic(req, audio_bytes)
    except SpeakingEvaluatorFailure as exc:
        latency_ms = int((time.monotonic() - started) * 1000)
        await _emit_telemetry({
            "_id": uuid.uuid4().hex,
            "ts": datetime.now(timezone.utc),
            "event": "speaking_eval",
            "user_id": user_id,
            "plan": decision.plan,
            "mode": decision.mode,
            "context": context,
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
    result_dump = result.model_dump()
    # Surface audio_url + part metadata so the results UI can render a real
    # playback element and a data-driven header instead of fixtures.
    result_dump["audio_url"] = audio_meta["relative_url"]
    result_dump["part"] = req.part.value
    result_dump["cue_card_prompt"] = req.cue_card_prompt
    if question_id:
        result_dump["question_id"] = question_id

    # Persist the attempt + bump counters only on success.
    await _persist_attempt(
        user_id=user_id,
        client_request_id=client_request_id,
        audio_meta=audio_meta,
        req=req,
        result_dump=result_dump,
        decision=decision,
        context=context,
        set_id=set_id,
        question_id=question_id,
        book_id=book_id,
        test_id=test_id,
    )
    # Mirror to test_attempts so Progress page + Liz see speaking practice.
    try:
        from server import persist_attempt as _persist_test_attempt
        _scores = (result_dump or {}).get("scores") or {}
        _band = float(_scores.get("overall") or 0.0)
        await _persist_test_attempt(
            user_id=user_id,
            test_id=test_id or f"speaking_{req.part.value}_{question_id or set_id or 'practice'}",
            test_type="speaking",
            band_score=_band,
            feedback={
                "source": "speaking_unified",
                "context": context,
                "part": req.part.value,
                "scores": _scores,
            },
        )
    except Exception as _e:
        logger.warning("persist_attempt mirror skipped (speaking /evaluate): %s", _e)
    await record_speaking_eval(db, user, decision)
    await speaking_idempotency.store(
        db,
        user_id=user_id,
        anon_key=None,
        client_request_id=client_request_id,
        result=result_dump,
    )
    await _emit_telemetry({
        "_id": uuid.uuid4().hex,
        "ts": datetime.now(timezone.utc),
        "event": "speaking_eval",
        "user_id": user_id,
        "plan": decision.plan,
        "mode": decision.mode,
        "context": context,
        "success": True,
        "latency_ms": latency_ms,
        "quota_remaining": max(decision.remaining - 1, 0),
        "period_key": decision.period_key,
    })

    return JSONResponse(content=result_dump, headers=_quota_headers(decision))


@router.post("/evaluate-transcript")
async def evaluate_transcript(
    request: Request,
    user_id: str = Form(...),
    part: str = Form("part1"),
    transcript: str = Form(...),
    cue_card_prompt: str = Form(""),
    cue_card_bullets: str = Form(""),
    user_language: str = Form("en"),
    target_band: float = Form(7.0),
    duration_seconds: float = Form(0.0),
    context: str = Form("practice"),
    client_request_id: str = Form(..., min_length=1, max_length=128),
    set_id: Optional[str] = Form(None),
    question_id: Optional[str] = Form(None),
    book_id: Optional[str] = Form(None),
    test_id: Optional[str] = Form(None),
    caller: dict = Depends(auth_session.current_user),
):
    """Transcript-only speaking evaluation (no audio).

    Liz Live (Part 1/3) provides a reliable user-only transcript from
    ElevenLabs even when the parallel mic recording fails. Grade from that so
    the candidate always gets a band; pronunciation detail is omitted. Counts
    as one eval, same quota path as /evaluate.
    """
    auth_session.require_self_or_admin(user_id, caller)
    if db is None:
        raise HTTPException(status_code=503, detail={"code": "db_unavailable", "message": "DB not initialised"})
    if context not in _VALID_CONTEXTS:
        context = "practice"
    if not transcript or not transcript.strip():
        raise HTTPException(status_code=422, detail={"code": "empty_transcript", "message": "No transcript to grade."})

    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail={"code": "user_not_found", "message": "User not found"})

    cached = await speaking_idempotency.lookup(db, user_id=user_id, anon_key=None, client_request_id=client_request_id)
    if cached is not None:
        return JSONResponse(content=cached, headers={"X-Speaking-Cached": "1"})

    req = _build_eval_request(
        part=part,
        cue_card_prompt=cue_card_prompt or f"IELTS Speaking — {part}",
        cue_card_bullets=cue_card_bullets,
        user_language=user_language,
        target_band=target_band,
        duration_seconds=duration_seconds,
    )

    decision = await resolve_speaking_eval(db, user)
    if not decision.allowed:
        raise HTTPException(
            status_code=402,
            detail={
                "code": "quota_exhausted",
                "message": decision.message or "You've used all evaluations for this period.",
                "quota": decision.quota, "used": decision.used, "period": decision.period_key,
                "resets_at": decision.resets_at, "upgrade_to": decision.upgrade_to, "current_plan": decision.plan,
            },
        )

    started = time.monotonic()
    try:
        result = await evaluate_speaking_from_transcript(req, transcript)
    except SpeakingEvaluatorFailure as exc:
        raise HTTPException(
            status_code=502,
            detail={"code": "speaking_evaluator_failed", "message": str(exc), "last_error": exc.last_error},
        )
    latency_ms = int((time.monotonic() - started) * 1000)

    result_dump = result.model_dump()
    result_dump["part"] = req.part.value
    result_dump["cue_card_prompt"] = req.cue_card_prompt
    if question_id:
        result_dump["question_id"] = question_id

    await _persist_attempt(
        user_id=user_id, client_request_id=client_request_id,
        audio_meta={"relative_url": None, "filename": None, "bytes": 0},
        req=req, result_dump=result_dump, decision=decision, context=context,
        set_id=set_id, question_id=question_id, book_id=book_id, test_id=test_id,
    )
    try:
        from server import persist_attempt as _persist_test_attempt
        _scores = (result_dump or {}).get("scores") or {}
        await _persist_test_attempt(
            user_id=user_id,
            test_id=test_id or f"speaking_{req.part.value}_{question_id or set_id or 'practice'}",
            test_type="speaking", band_score=float(_scores.get("overall") or 0.0),
            feedback={"source": "speaking_unified_transcript", "context": context, "part": req.part.value, "scores": _scores},
        )
    except Exception as _e:
        logger.warning("persist_attempt mirror skipped (evaluate-transcript): %s", _e)
    await record_speaking_eval(db, user, decision)
    await speaking_idempotency.store(db, user_id=user_id, anon_key=None, client_request_id=client_request_id, result=result_dump)
    await _emit_telemetry({
        "_id": uuid.uuid4().hex, "ts": datetime.now(timezone.utc), "event": "speaking_eval",
        "user_id": user_id, "plan": decision.plan, "mode": "transcript", "context": context,
        "success": True, "latency_ms": latency_ms, "quota_remaining": max(decision.remaining - 1, 0),
        "period_key": decision.period_key,
    })
    return JSONResponse(content=result_dump, headers=_quota_headers(decision))


@router.post("/evaluate-liz")
async def evaluate_liz(
    request: Request,
    user_id: str = Form(...),
    conversation_id: str = Form(...),
    part: str = Form("part1"),
    cue_card_prompt: str = Form(""),
    cue_card_bullets: str = Form(""),
    user_language: str = Form("en"),
    target_band: float = Form(7.0),
    context: str = Form("practice"),
    client_request_id: str = Form(..., min_length=1, max_length=128),
    set_id: Optional[str] = Form(None),
    question_id: Optional[str] = Form(None),
    caller: dict = Depends(auth_session.current_user),
):
    """Grade a Liz Live (Part 1/3) conversation using the call recording that
    ElevenLabs already stored server-side — reliable, unlike the browser's
    parallel mic recorder. We fetch the recording + transcript, cut the
    candidate's spans into a user-only WAV, and run the full Azure pipeline so
    Part 1/3 get REAL word-level pronunciation. Falls back to transcript-only
    grading if the audio can't be fetched/sliced."""
    auth_session.require_self_or_admin(user_id, caller)
    if db is None:
        raise HTTPException(status_code=503, detail={"code": "db_unavailable", "message": "DB not initialised"})
    if context not in _VALID_CONTEXTS:
        context = "practice"

    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail={"code": "user_not_found", "message": "User not found"})

    cached = await speaking_idempotency.lookup(db, user_id=user_id, anon_key=None, client_request_id=client_request_id)
    if cached is not None:
        return JSONResponse(content=cached, headers={"X-Speaking-Cached": "1"})

    # Fetch the call recording + transcript from ElevenLabs.
    from routes.liz_eleven import fetch_liz_conversation
    try:
        convo = await fetch_liz_conversation(conversation_id)
    except Exception as exc:
        logger.warning("fetch_liz_conversation failed: %s", exc)
        convo = {"turns": [], "user_transcript": "", "audio_bytes": None, "total_secs": 0.0}

    turns = convo.get("turns") or []
    user_transcript = (convo.get("user_transcript") or "").strip()
    user_audio = build_user_audio_from_turns(
        convo.get("audio_bytes"), turns, convo.get("total_secs") or 0.0,
    ) if convo.get("audio_bytes") else None

    # Candidate speaking seconds for WPM (audio path gives it exactly; else sum
    # user spans from the turns).
    if user_audio:
        user_secs = float(user_audio.get("user_secs") or 0.0)
    else:
        st = sorted([t for t in turns if isinstance(t.get("time_in_call_secs"), (int, float))], key=lambda t: t["time_in_call_secs"])
        user_secs = 0.0
        for i, t in enumerate(st):
            if t.get("role") != "user":
                continue
            start = float(t["time_in_call_secs"])
            end = float(st[i + 1]["time_in_call_secs"]) if i + 1 < len(st) else (convo.get("total_secs") or start)
            if end > start:
                user_secs += end - start

    if not user_audio and not user_transcript:
        raise HTTPException(status_code=422, detail={"code": "empty_conversation", "message": "We couldn't capture your speech from the conversation. Please try again."})

    decision = await resolve_speaking_eval(db, user)
    if not decision.allowed:
        raise HTTPException(
            status_code=402,
            detail={
                "code": "quota_exhausted",
                "message": decision.message or "You've used all evaluations for this period.",
                "quota": decision.quota, "used": decision.used, "period": decision.period_key,
                "resets_at": decision.resets_at, "upgrade_to": decision.upgrade_to, "current_plan": decision.plan,
            },
        )

    req = _build_eval_request(
        part=part,
        cue_card_prompt=cue_card_prompt or f"IELTS Speaking — {part}",
        cue_card_bullets=cue_card_bullets or user_transcript,
        user_language=user_language,
        target_band=target_band,
        duration_seconds=user_secs,
    )

    audio_meta = {"relative_url": None, "filename": None, "bytes": 0}
    started = time.monotonic()
    try:
        if user_audio and user_audio.get("wav_bytes"):
            # Real audio → full Azure pipeline (word-level pronunciation).
            result = await evaluate_speaking(req, user_audio["wav_bytes"])
            audio_meta = persist_audio(user_audio["wav_bytes"])
        else:
            # No usable audio → grade from the ElevenLabs transcript.
            result = await evaluate_speaking_from_transcript(req, user_transcript)
    except SpeakingEvaluatorFailure as exc:
        # Last-ditch: if the audio path failed but we have a transcript, grade it.
        if user_transcript:
            try:
                result = await evaluate_speaking_from_transcript(req, user_transcript)
                audio_meta = {"relative_url": None, "filename": None, "bytes": 0}
            except SpeakingEvaluatorFailure as exc2:
                raise HTTPException(status_code=502, detail={"code": "speaking_evaluator_failed", "message": str(exc2)})
        else:
            raise HTTPException(status_code=502, detail={"code": "speaking_evaluator_failed", "message": str(exc)})
    latency_ms = int((time.monotonic() - started) * 1000)

    result_dump = result.model_dump()
    result_dump["part"] = req.part.value
    result_dump["cue_card_prompt"] = req.cue_card_prompt
    if audio_meta.get("relative_url"):
        result_dump["audio_url"] = audio_meta["relative_url"]
    if question_id:
        result_dump["question_id"] = question_id

    await _persist_attempt(
        user_id=user_id, client_request_id=client_request_id, audio_meta=audio_meta,
        req=req, result_dump=result_dump, decision=decision, context=context,
        set_id=set_id, question_id=question_id, book_id=None, test_id=None,
    )
    try:
        from server import persist_attempt as _persist_test_attempt
        _scores = (result_dump or {}).get("scores") or {}
        await _persist_test_attempt(
            user_id=user_id, test_id=f"speaking_{req.part.value}_{set_id or 'liz'}",
            test_type="speaking", band_score=float(_scores.get("overall") or 0.0),
            feedback={"source": "speaking_unified_liz", "context": context, "part": req.part.value, "scores": _scores},
        )
    except Exception as _e:
        logger.warning("persist_attempt mirror skipped (evaluate-liz): %s", _e)
    await record_speaking_eval(db, user, decision)
    await speaking_idempotency.store(db, user_id=user_id, anon_key=None, client_request_id=client_request_id, result=result_dump)
    await _emit_telemetry({
        "_id": uuid.uuid4().hex, "ts": datetime.now(timezone.utc), "event": "speaking_eval",
        "user_id": user_id, "plan": decision.plan, "mode": ("full" if user_audio else "transcript"),
        "context": context, "success": True, "latency_ms": latency_ms,
        "quota_remaining": max(decision.remaining - 1, 0), "period_key": decision.period_key,
    })
    return JSONResponse(content=result_dump, headers=_quota_headers(decision))


# ─── Anonymous endpoint (email-gated) ────────────────────────────────────────


def _client_ip(request: Request) -> str:
    # Trust X-Forwarded-For only if present (set by ingress); otherwise use
    # request.client. Avoids spoofing in single-tier dev setups.
    fwd = request.headers.get("x-forwarded-for")
    if fwd:
        return fwd.split(",")[0].strip()
    if request.client:
        return request.client.host
    return "unknown"


@router.post("/evaluate-anonymous")
async def evaluate_anonymous(
    request: Request,
    audio: UploadFile = File(...),
    email: str = Form(...),
    part: str = Form("part2"),
    cue_card_prompt: str = Form(...),
    cue_card_bullets: str = Form(""),
    user_language: str = Form("en"),
    target_band: float = Form(7.0),
    duration_seconds: float = Form(0.0),
    # Required by Faz 3 (see /evaluate for rationale).
    client_request_id: str = Form(..., min_length=1, max_length=128),
):
    """One free full-mode eval per (email, IP) per ISO week. Mirrors the
    /score-my-essay anon writing flow so the conversion funnel is the same.

    Anonymous calls always run in `full` mode (it's the lead-magnet promise);
    they don't share counters with the authenticated free tier."""
    if db is None:
        raise HTTPException(
            status_code=503,
            detail={"code": "db_unavailable", "message": "DB not initialised"},
        )

    # Real validation: syntax + DNS MX lookup. Catches typos like "gmail.ru"
    # and throwaway addresses without MX records, since these emails feed the
    # marketing follow-up pipeline.
    email_raw = (email or "").strip()
    try:
        info = validate_email(email_raw, check_deliverability=True)
        email_norm = info.normalized.lower()
    except EmailNotValidError as exc:
        raise HTTPException(
            status_code=400,
            detail={"code": "invalid_email", "message": str(exc)},
        )
    ip = _client_ip(request)
    week_key = current_week_key()
    anon_key = f"anon:{ip}|{email_norm}"

    # Idempotency lookup (per anon key).
    cached = await speaking_idempotency.lookup(
        db,
        user_id=None,
        anon_key=anon_key,
        client_request_id=client_request_id,
    )
    if cached is not None:
        return JSONResponse(content=cached, headers={"X-Speaking-Cached": "1"})

    # Weekly cap enforcement: separate collection so authenticated quota
    # logic stays untouched. We also fetch the previously-used `part` so the
    # frontend can tailor the conversion prompt — per the per-part flow
    # decision, anon gets one trial total but we surface which part they
    # already tried so the login CTA reads as
    # "You already tried Part 2 — sign in to try Part 1 too" rather than a
    # generic block.
    existing = await db.anonymous_speaking_evals.find_one(
        {"email": email_norm, "ip": ip, "week_key": week_key},
        {"_id": 0, "created_at": 1, "part": 1},
    )
    if existing:
        part_used = existing.get("part")
        raise HTTPException(
            status_code=402,
            detail={
                "code": "anon_quota_exhausted",
                "message": (
                    "You've already used your free evaluation this week. "
                    "Sign up for a paid plan to keep going."
                ),
                "part_used": part_used,
                "period": week_key,
                "upgrade_to": ["weekly", "monthly", "exam"],
            },
        )

    audio_bytes = await audio.read()
    validate_audio(audio_bytes, duration_seconds)

    req = _build_eval_request(
        part=part,
        cue_card_prompt=cue_card_prompt,
        cue_card_bullets=cue_card_bullets,
        user_language=user_language,
        target_band=target_band,
        duration_seconds=duration_seconds,
    )

    audio_meta = persist_audio(audio_bytes)

    started = time.monotonic()
    try:
        result = await evaluate_speaking(req, audio_bytes)
    except SpeakingEvaluatorFailure as exc:
        latency_ms = int((time.monotonic() - started) * 1000)
        await _emit_telemetry({
            "_id": uuid.uuid4().hex,
            "ts": datetime.now(timezone.utc),
            "event": "speaking_eval",
            "anon_email": email_norm,
            "anon_ip": ip,
            "plan": "anonymous",
            "mode": "full",
            "context": "anonymous",
            "success": False,
            "error_code": "evaluator_failed",
            "error_detail": exc.last_error,
            "attempts": exc.attempts,
            "latency_ms": latency_ms,
            "period_key": week_key,
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
    result_dump = result.model_dump()
    # Same surface contract as the authed endpoint — audio + part metadata
    # lets the anon results page render a real player and accurate header.
    result_dump["audio_url"] = audio_meta["relative_url"]
    result_dump["part"] = part
    result_dump["cue_card_prompt"] = cue_card_prompt

    # Mark the anon slot as consumed atomically (upsert avoids race).
    # `part` is recorded (not part of the unique key) so the 402 path on the
    # next request can tell the frontend which part was already used.
    try:
        await db.anonymous_speaking_evals.insert_one({
            "_id": uuid.uuid4().hex,
            "email": email_norm,
            "ip": ip,
            "week_key": week_key,
            "part": part,
            "created_at": datetime.now(timezone.utc),
            "audio_url": audio_meta["relative_url"],
        })
    except Exception as exc:
        # If the cap-marker insert races with a duplicate, we still served
        # one eval; log but don't fail the request. The TTL/unique compound
        # index (created in ensure_indexes) will dedupe future retries.
        logger.warning("anon cap marker insert failed: %s", exc)

    await speaking_idempotency.store(
        db,
        user_id=None,
        anon_key=anon_key,
        client_request_id=client_request_id,
        result=result_dump,
    )
    await _emit_telemetry({
        "_id": uuid.uuid4().hex,
        "ts": datetime.now(timezone.utc),
        "event": "speaking_eval",
        "anon_email": email_norm,
        "anon_ip": ip,
        "plan": "anonymous",
        "mode": "full",
        "context": "anonymous",
        "success": True,
        "latency_ms": latency_ms,
        "period_key": week_key,
    })

    return JSONResponse(
        content=result_dump,
        headers={
            "X-Speaking-Eval-Mode": "full",
            "X-Speaking-Plan": "anonymous",
            "X-Speaking-Period": week_key,
        },
    )


# ─── Authenticated Full Test endpoint (holistic) ─────────────────────────────


async def _persist_fulltest_attempt(
    *,
    user_id: str,
    client_request_id: Optional[str],
    audio_meta_by_part: Dict[str, Dict[str, Any]],
    req: SpeakingFullTestEvaluationRequest,
    result_dump: Dict[str, Any],
    decision: EvalDecision,
    test_id: Optional[str],
) -> None:
    if db is None:
        return
    try:
        await db.speaking_fulltest_attempts.insert_one(
            {
                "_id": uuid.uuid4().hex,
                "user_id": user_id,
                "client_request_id": client_request_id,
                "created_at": datetime.now(timezone.utc),
                "context": "full_test",
                "user_language": req.user_language,
                "target_band": req.target_band,
                "audio_by_part": {
                    part_value: {
                        "audio_url": meta["relative_url"],
                        "audio_filename": meta["filename"],
                        "audio_bytes": meta["bytes"],
                    }
                    for part_value, meta in audio_meta_by_part.items()
                },
                "result": result_dump,
                "evaluation_mode": decision.mode,
                "plan": decision.plan,
                "period_key": decision.period_key,
                "test_id": test_id,
            }
        )
    except Exception as exc:
        logger.warning("Failed to persist fulltest attempt: %s", exc)


@router.post("/evaluate-fulltest")
async def evaluate_fulltest(
    request: Request,
    user_id: str = Form(...),
    user_language: str = Form("en"),
    target_band: float = Form(7.0),
    # Required by Faz 3 (see /evaluate for rationale).
    client_request_id: str = Form(..., min_length=1, max_length=128),
    test_id: Optional[str] = Form(None),
    # Part 1
    part1_audio: UploadFile = File(...),
    part1_cue_card_prompt: str = Form(...),
    part1_cue_card_bullets: str = Form(""),
    part1_duration_seconds: float = Form(0.0),
    # Part 2
    part2_audio: UploadFile = File(...),
    part2_cue_card_prompt: str = Form(...),
    part2_cue_card_bullets: str = Form(""),
    part2_duration_seconds: float = Form(0.0),
    # Part 3
    part3_audio: UploadFile = File(...),
    part3_cue_card_prompt: str = Form(...),
    part3_cue_card_bullets: str = Form(""),
    part3_duration_seconds: float = Form(0.0),
    caller: dict = Depends(auth_session.current_user),
):
    auth_session.require_self_or_admin(user_id, caller)
    """Holistic Full Test evaluation. 3 audio uploads, single Sonnet pass.

    IELTS examiner methodology: one band per criterion across the whole
    test, NOT averaged from per-part bands. Per-part insights are
    informational only. Quota cost: 1 attempt (the test is one unit).
    """
    if db is None:
        raise HTTPException(
            status_code=503,
            detail={"code": "db_unavailable", "message": "DB not initialised"},
        )

    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(
            status_code=404,
            detail={"code": "user_not_found", "message": "User not found"},
        )

    # Idempotency: same user + client_request_id replays the cached result.
    cached = await speaking_idempotency.lookup(
        db,
        user_id=user_id,
        anon_key=None,
        client_request_id=client_request_id,
    )
    if cached is not None:
        return JSONResponse(content=cached, headers={"X-Speaking-Cached": "1"})

    # Build the request envelope. Splits each part's bullets line-by-line
    # mirroring _build_eval_request(); validates ordering [part1, part2, part3].
    def _split_bullets(raw: str) -> List[str]:
        if not raw:
            return []
        return [b.strip() for b in raw.replace("\r", "").split("\n") if b.strip()]

    try:
        req = SpeakingFullTestEvaluationRequest(
            user_language=user_language,
            target_band=target_band,
            parts=[
                FullTestPartInput(
                    part=SpeakingPart.part1,
                    cue_card_prompt=part1_cue_card_prompt,
                    cue_card_bullets=_split_bullets(part1_cue_card_bullets),
                    duration_seconds=part1_duration_seconds,
                ),
                FullTestPartInput(
                    part=SpeakingPart.part2,
                    cue_card_prompt=part2_cue_card_prompt,
                    cue_card_bullets=_split_bullets(part2_cue_card_bullets),
                    duration_seconds=part2_duration_seconds,
                ),
                FullTestPartInput(
                    part=SpeakingPart.part3,
                    cue_card_prompt=part3_cue_card_prompt,
                    cue_card_bullets=_split_bullets(part3_cue_card_bullets),
                    duration_seconds=part3_duration_seconds,
                ),
            ],
        )
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail={"code": "invalid_request", "message": str(exc)},
        )

    # Tier gate — Full Test costs 1 attempt regardless of part count, AND is
    # plan-restricted to Monthly + Exam Pack (resolve_speaking_eval enforces
    # the plan check when context='full_test').
    decision = await resolve_speaking_eval(db, user, context="full_test")
    if not decision.allowed:
        # Distinguish "you don't have this feature" from "you're out of quota"
        # so the frontend can route to /pricing instead of "wait until reset".
        is_plan_locked = decision.plan not in {"monthly", "exam", "master"}
        error_code = "fulltest_locked" if is_plan_locked else "quota_exhausted"
        await _emit_telemetry({
            "_id": uuid.uuid4().hex,
            "ts": datetime.now(timezone.utc),
            "event": "speaking_fulltest_eval",
            "user_id": user_id,
            "plan": decision.plan,
            "mode": decision.mode,
            "context": "full_test",
            "success": False,
            "error_code": error_code,
            "quota_remaining": decision.remaining,
            "period_key": decision.period_key,
            "latency_ms": 0,
        })
        raise HTTPException(
            status_code=402,
            detail={
                "code": error_code,
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

    # Read + validate audio per part, persist each.
    audio_files = {
        SpeakingPart.part1: (part1_audio, part1_duration_seconds),
        SpeakingPart.part2: (part2_audio, part2_duration_seconds),
        SpeakingPart.part3: (part3_audio, part3_duration_seconds),
    }
    audios_by_part: Dict[SpeakingPart, bytes] = {}
    audio_meta_by_part: Dict[str, Dict[str, Any]] = {}
    valid_part_count = 0
    for part, (upload, duration) in audio_files.items():
        audio_bytes = await upload.read()
        # Per-part validation is tolerant for the Full Test: a single empty/too
        # short part must NOT reject the whole submission. The evaluator scores
        # the parts that recorded and flags the missing one. We only require
        # that at least ONE part is valid (checked after the loop).
        try:
            validate_audio(audio_bytes, duration)
            valid_part_count += 1
        except HTTPException:
            audio_bytes = b""  # treat as uncaptured downstream
        audios_by_part[part] = audio_bytes
        if audio_bytes:
            audio_meta_by_part[part.value] = persist_audio(audio_bytes)
    if valid_part_count == 0:
        raise HTTPException(
            status_code=422,
            detail={
                "code": "audio_too_short",
                "message": "We couldn't hear you on any part. Check your microphone is selected and not muted, then record again.",
            },
        )

    started = time.monotonic()
    try:
        result = await evaluate_speaking_fulltest(
            req,
            audios_by_part,
            use_azure=(decision.mode == "full"),
        )
    except SpeakingEvaluatorFailure as exc:
        latency_ms = int((time.monotonic() - started) * 1000)
        await _emit_telemetry({
            "_id": uuid.uuid4().hex,
            "ts": datetime.now(timezone.utc),
            "event": "speaking_fulltest_eval",
            "user_id": user_id,
            "plan": decision.plan,
            "mode": decision.mode,
            "context": "full_test",
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
    result_dump = result.model_dump()

    # Surface per-part audio_url so the orchestrator UI can play back each
    # part on the results screen.
    for part_insight in result_dump.get("parts", []):
        meta = audio_meta_by_part.get(part_insight["part"])
        if meta:
            part_insight["audio_url"] = meta["relative_url"]
    result_dump["test_id"] = test_id

    await _persist_fulltest_attempt(
        user_id=user_id,
        client_request_id=client_request_id,
        audio_meta_by_part=audio_meta_by_part,
        req=req,
        result_dump=result_dump,
        decision=decision,
        test_id=test_id,
    )
    # Mirror to test_attempts so Progress + Liz see the holistic full test.
    try:
        from server import persist_attempt as _persist_test_attempt
        _scores = (result_dump or {}).get("scores") or {}
        _band = float(_scores.get("overall") or 0.0)
        await _persist_test_attempt(
            user_id=user_id,
            test_id=test_id or "speaking_full_test",
            test_type="speaking",
            band_score=_band,
            feedback={
                "source": "speaking_fulltest",
                "scores": _scores,
                "target_band": req.target_band,
            },
        )
    except Exception as _e:
        logger.warning("persist_attempt mirror skipped (speaking fulltest): %s", _e)
    await record_speaking_eval(db, user, decision)
    await speaking_idempotency.store(
        db,
        user_id=user_id,
        anon_key=None,
        client_request_id=client_request_id,
        result=result_dump,
    )
    await _emit_telemetry({
        "_id": uuid.uuid4().hex,
        "ts": datetime.now(timezone.utc),
        "event": "speaking_fulltest_eval",
        "user_id": user_id,
        "plan": decision.plan,
        "mode": decision.mode,
        "context": "full_test",
        "success": True,
        "latency_ms": latency_ms,
        "quota_remaining": max(decision.remaining - 1, 0),
        "period_key": decision.period_key,
    })

    return JSONResponse(content=result_dump, headers=_quota_headers(decision))


# ─── Index bootstrap ─────────────────────────────────────────────────────────


async def init_indexes() -> None:
    """Idempotent index setup. Called once at server startup."""
    if db is None:
        return
    await speaking_idempotency.ensure_indexes(db)
    try:
        await db.anonymous_speaking_evals.create_index(
            [("email", 1), ("ip", 1), ("week_key", 1)], unique=True
        )
        await db.speaking_attempts.create_index([("user_id", 1), ("created_at", -1)])
        await db.speaking_fulltest_attempts.create_index([("user_id", 1), ("created_at", -1)])
        await db.telemetry_events.create_index([("event", 1), ("ts", -1)])
    except Exception as exc:
        logger.warning("Failed to ensure speaking_unified indexes: %s", exc)
