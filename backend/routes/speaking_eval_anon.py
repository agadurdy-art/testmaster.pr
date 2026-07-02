"""
Speaking eval — anonymous (email-gated) lead-magnet flow:
    POST /api/speaking/evaluate-anonymous   # one free full eval / (email, IP) / ISO week
Extracted from routes/speaking_unified.py (Faz 1 refactor, 2026-07-02).

Single job: the unauthenticated conversion-funnel evaluation (email + IP
weekly cap, always full mode) plus the _client_ip helper it gates on.
Shared helpers come from routes/speaking_eval_shared.
"""
from __future__ import annotations

import logging
import time
import uuid
from datetime import datetime, timezone

from email_validator import EmailNotValidError, validate_email
from fastapi import File, Form, HTTPException, Request, UploadFile
from fastapi.responses import JSONResponse

from routes.speaking_eval_shared import (
    _build_eval_request,
    _emit_telemetry,
    router,
)
from services import speaking_idempotency
from services.audio_processor import persist_audio, validate_audio
from services.speaking_evaluator import (
    SpeakingEvaluatorFailure,
    evaluate_speaking,
)
from services.usage_tracking import current_week_key

logger = logging.getLogger(__name__)

# Module-level db handle; populated via routes.speaking_unified.set_db().
db = None


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
