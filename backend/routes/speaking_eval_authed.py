"""
Speaking eval — authenticated endpoints:
    POST /api/speaking/evaluate             # audio, multipart
    POST /api/speaking/evaluate-transcript  # transcript-only (Liz fallback)
    POST /api/speaking/evaluate-liz         # Liz Live conversation grading
    POST /api/speaking/evaluate-exam        # holistic mock-exam grading
Extracted from routes/speaking_unified.py (Faz 1 refactor, 2026-07-02).

Single job: the four user-owned (quota-metered, session-authenticated)
evaluation flows. Shared helpers come from routes/speaking_eval_shared.
"""
from __future__ import annotations

import logging
import time
import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import Depends, File, Form, HTTPException, Request, UploadFile
import auth_session  # audit: speaking eval is user-owned (cost + IDOR)
from fastapi.responses import JSONResponse

from routes.speaking_eval_shared import (
    _VALID_CONTEXTS,
    _build_eval_request,
    _emit_telemetry,
    _persist_attempt,
    _quota_headers,
    router,
)
from services import speaking_idempotency
from services.audio_processor import persist_audio, validate_audio
from services.speaking_evaluator import (
    SpeakingEvaluatorFailure,
    build_user_audio_from_turns,
    evaluate_exam_from_transcript,
    evaluate_speaking,
    evaluate_speaking_basic,
    evaluate_speaking_from_transcript,
)
from services.tier_resolver import (
    record_speaking_eval,
    resolve_speaking_eval,
)

logger = logging.getLogger(__name__)

# Module-level db handle; populated via routes.speaking_unified.set_db().
db = None


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


@router.post("/evaluate-exam")
async def evaluate_exam(
    request: Request,
    user_id: str = Form(...),
    conversation_id: str = Form(...),
    user_language: str = Form("en"),
    target_band: float = Form(7.0),
    context: str = Form("exam"),
    client_request_id: str = Form(..., min_length=1, max_length=128),
    caller: dict = Depends(auth_session.current_user),
):
    """Holistic mock-exam grading from a single continuous Liz exam conversation.
    Fetches the ElevenLabs transcript and runs ONE Sonnet pass over the whole
    3-part test — no audio/Azure (too slow/expensive/fragile on a 10-15 min
    recording). Counts as one speaking eval."""
    auth_session.require_self_or_admin(user_id, caller)
    if db is None:
        raise HTTPException(status_code=503, detail={"code": "db_unavailable", "message": "DB not initialised"})

    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail={"code": "user_not_found", "message": "User not found"})

    cached = await speaking_idempotency.lookup(db, user_id=user_id, anon_key=None, client_request_id=client_request_id)
    if cached is not None:
        return JSONResponse(content=cached, headers={"X-Speaking-Cached": "1"})

    from routes.liz_eleven import fetch_liz_conversation
    try:
        convo = await fetch_liz_conversation(conversation_id)
    except Exception as exc:
        logger.warning("fetch_liz_conversation (exam) failed: %s", exc)
        raise HTTPException(status_code=502, detail={"code": "transcript_unavailable", "message": "Couldn't fetch the exam transcript. Please try again."})

    turns = convo.get("turns") or []
    user_transcript = (convo.get("user_transcript") or "").strip()
    if not user_transcript:
        raise HTTPException(status_code=422, detail={"code": "empty_conversation", "message": "We couldn't capture your speech in the exam. Please try again."})

    # Candidate speaking seconds (for WPM) from the user spans.
    st = sorted([t for t in turns if isinstance(t.get("time_in_call_secs"), (int, float))], key=lambda t: t["time_in_call_secs"])
    user_secs = 0.0
    for i, t in enumerate(st):
        if t.get("role") != "user":
            continue
        start = float(t["time_in_call_secs"])
        end = float(st[i + 1]["time_in_call_secs"]) if i + 1 < len(st) else (convo.get("total_secs") or start)
        if end > start:
            user_secs += end - start

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
        part="part2",  # holistic; mode instruction overrides per-part calibration
        cue_card_prompt="IELTS Speaking — Full mock exam (Parts 1-3 with Liz)",
        cue_card_bullets="",
        user_language=user_language,
        target_band=target_band,
        duration_seconds=user_secs,
    )

    started = time.monotonic()
    try:
        result = await evaluate_exam_from_transcript(req, user_transcript)
    except SpeakingEvaluatorFailure as exc:
        raise HTTPException(status_code=502, detail={"code": "speaking_evaluator_failed", "message": str(exc)})
    latency_ms = int((time.monotonic() - started) * 1000)

    result_dump = result.model_dump()
    result_dump["part"] = "exam"
    result_dump["cue_card_prompt"] = req.cue_card_prompt
    # Carry the full exchange so the results screen can show it even on replay.
    result_dump["conversation_turns"] = turns

    await _persist_attempt(
        user_id=user_id, client_request_id=client_request_id,
        audio_meta={"relative_url": None, "filename": None, "bytes": 0},
        req=req, result_dump=result_dump, decision=decision, context="exam",
        set_id=None, question_id=None, book_id=None, test_id=None,
    )
    try:
        from server import persist_attempt as _persist_test_attempt
        _scores = (result_dump or {}).get("scores") or {}
        await _persist_test_attempt(
            user_id=user_id, test_id="speaking_full_exam",
            test_type="speaking", band_score=float(_scores.get("overall") or 0.0),
            feedback={"source": "speaking_unified_exam", "context": "exam", "part": "exam", "scores": _scores},
        )
    except Exception as _e:
        logger.warning("persist_attempt mirror skipped (evaluate-exam): %s", _e)
    await record_speaking_eval(db, user, decision)
    await speaking_idempotency.store(db, user_id=user_id, anon_key=None, client_request_id=client_request_id, result=result_dump)
    await _emit_telemetry({
        "_id": uuid.uuid4().hex, "ts": datetime.now(timezone.utc), "event": "speaking_eval",
        "user_id": user_id, "plan": decision.plan, "mode": "exam", "context": "exam",
        "success": True, "latency_ms": latency_ms, "quota_remaining": max(decision.remaining - 1, 0),
        "period_key": decision.period_key,
    })
    return JSONResponse(content=result_dump, headers=_quota_headers(decision))
