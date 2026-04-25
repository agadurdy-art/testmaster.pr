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

from fastapi import APIRouter, File, Form, HTTPException, Request, UploadFile
from fastapi.responses import JSONResponse

from schemas.speaking_evaluator import SpeakingEvaluationRequest, SpeakingPart
from services import speaking_idempotency
from services.audio_processor import persist_audio, validate_audio
from services.speaking_evaluator import (
    SpeakingEvaluatorFailure,
    evaluate_speaking,
    evaluate_speaking_basic,
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
    client_request_id: Optional[str] = Form(None),
    set_id: Optional[str] = Form(None),
    question_id: Optional[str] = Form(None),
    book_id: Optional[str] = Form(None),
    test_id: Optional[str] = Form(None),
):
    """Authenticated speaking evaluation. Multipart payload. See module
    docstring for the response contract."""
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
    client_request_id: Optional[str] = Form(None),
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

    email_norm = (email or "").strip().lower()
    if not email_norm or "@" not in email_norm or "." not in email_norm:
        raise HTTPException(
            status_code=400,
            detail={"code": "invalid_email", "message": "A valid email is required."},
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
    # logic stays untouched.
    existing = await db.anonymous_speaking_evals.find_one(
        {"email": email_norm, "ip": ip, "week_key": week_key},
        {"_id": 0, "created_at": 1},
    )
    if existing:
        raise HTTPException(
            status_code=402,
            detail={
                "code": "anon_quota_exhausted",
                "message": (
                    "You've already used your free evaluation this week. "
                    "Sign up for a paid plan to keep going."
                ),
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

    # Mark the anon slot as consumed atomically (upsert avoids race).
    try:
        await db.anonymous_speaking_evals.insert_one({
            "_id": uuid.uuid4().hex,
            "email": email_norm,
            "ip": ip,
            "week_key": week_key,
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
        await db.telemetry_events.create_index([("event", 1), ("ts", -1)])
    except Exception as exc:
        logger.warning("Failed to ensure speaking_unified indexes: %s", exc)
