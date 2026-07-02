"""
Speaking eval — holistic Full Test flow:
    POST /api/speaking/evaluate-fulltest    # 3 audio uploads, single Sonnet pass
Extracted from routes/speaking_unified.py (Faz 1 refactor, 2026-07-02).

Single job: the plan-restricted (Monthly/Exam) three-part Full Test
evaluation and its dedicated persistence helper. Shared helpers come from
routes/speaking_eval_shared.
"""
from __future__ import annotations

import logging
import time
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import Depends, File, Form, HTTPException, Request, UploadFile
import auth_session  # audit: speaking eval is user-owned (cost + IDOR)
from fastapi.responses import JSONResponse

from routes.speaking_eval_shared import (
    _emit_telemetry,
    _quota_headers,
    router,
)
from schemas.speaking_evaluator import (
    FullTestPartInput,
    SpeakingFullTestEvaluationRequest,
    SpeakingPart,
)
from services import speaking_idempotency
from services.audio_processor import persist_audio, validate_audio
from services.speaking_evaluator import (
    SpeakingEvaluatorFailure,
    evaluate_speaking_fulltest,
)
from services.tier_resolver import (
    EvalDecision,
    record_speaking_eval,
    resolve_speaking_eval,
)

logger = logging.getLogger(__name__)

# Module-level db handle; populated via routes.speaking_unified.set_db().
db = None


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
