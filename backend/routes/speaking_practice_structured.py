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

import asyncio
import logging
import time
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Request, Depends
import auth_session  # audit: structured speaking eval is user-owned (cost + IDOR)
from fastapi.responses import JSONResponse
from starlette.datastructures import UploadFile as StarletteUploadFile

from services import speaking_idempotency
from services.audio_processor import persist_audio, validate_audio, RECORDINGS_DIR
from services.recording_storage import download_recording
from services.speaking_practice_structured import (
    StructuredEvaluatorFailure,
    evaluate_speaking_practice_structured,
)
from services.tier_resolver import (
    EvalDecision,
    record_speaking_eval,
    resolve_speaking_eval,
)
from services import speaking_result_email

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/speaking-practice", tags=["Speaking Practice (Structured)"])

MAX_QUESTIONS = 10  # safety cap; Smart Practice Part 1 = 5, Part 3 ≤ 6

# Durable background job queue for leave-safe evaluation (v2). The submit
# endpoint uploads the audio (persist_audio already mirrors it to R2) and
# enqueues a job here; a background worker grades it independently of the
# client connection, so closing the tab can no longer drop the test. A startup
# sweep re-runs anything left mid-flight by a pod restart.
JOBS_COLLECTION = "speaking_jobs"
# Don't email / auto-resume jobs older than this (stale, user long gone).
JOB_MAX_AGE_SECONDS = 24 * 60 * 60
# Grace period after completion before emailing — gives a still-watching client
# time to display the result and mark the job viewed (so we don't email someone
# who's already looking at their score).
EMAIL_GRACE_SECONDS = 90

# Keep strong refs to fire-and-forget worker tasks so the event loop doesn't GC
# them mid-run.
_BACKGROUND_TASKS: set = set()

db = None


def set_db(database) -> None:
    global db
    db = database


def _spawn(coro) -> None:
    """Schedule a detached background coroutine, retaining a strong reference."""
    task = asyncio.create_task(coro)
    _BACKGROUND_TASKS.add(task)
    task.add_done_callback(_BACKGROUND_TASKS.discard)


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


# ─── Durable background job queue (leave-safe v2) ───────────────────────────


async def ensure_job_indexes() -> None:
    if db is None:
        return
    try:
        await db[JOBS_COLLECTION].create_index([("user_id", 1), ("created_at", -1)])
        await db[JOBS_COLLECTION].create_index("status")
    except Exception as exc:  # noqa: BLE001
        logger.warning("speaking_jobs index init failed: %s", exc)


def _iso(dt: Any) -> Any:
    return dt.isoformat() if isinstance(dt, datetime) else dt


def _job_summary(job: Dict[str, Any]) -> Dict[str, Any]:
    """Slim shape for the history list (no full result payload)."""
    overall = None
    try:
        overall = (job.get("result") or {}).get("scores", {}).get("overall")
    except Exception:
        overall = None
    return {
        "job_id": job.get("_id"),
        "status": job.get("status"),
        "part": job.get("part"),
        "topic": job.get("topic"),
        "set_id": job.get("set_id"),
        "overall_band": overall,
        "created_at": _iso(job.get("created_at")),
        "error": job.get("error"),
    }


def _job_full(job: Dict[str, Any]) -> Dict[str, Any]:
    """Full shape (includes result) for poll / detail."""
    out = _job_summary(job)
    out["result"] = job.get("result")
    return out


def _read_job_audio(qmeta: Dict[str, Any]) -> bytes:
    """Re-read a question's recording bytes: local disk first, then the R2
    mirror (after a pod restart the ephemeral disk copy is gone)."""
    fn = qmeta.get("audio_filename")
    if not fn:
        return b""
    try:
        p = RECORDINGS_DIR / fn
        if p.exists():
            return p.read_bytes()
    except Exception:
        pass
    return download_recording(f"recordings/{fn}") or b""


async def _maybe_email_result(job_id: str) -> None:
    """After a grace period, email the result iff the user never viewed it
    (so a candidate who waited and saw their score isn't emailed too)."""
    try:
        await asyncio.sleep(EMAIL_GRACE_SECONDS)
        if db is None:
            return
        job = await db[JOBS_COLLECTION].find_one({"_id": job_id})
        if not job or job.get("status") != "completed":
            return
        if job.get("viewed_at") or job.get("email_sent") or not job.get("user_email"):
            return
        sent = await speaking_result_email.send_speaking_result_email(
            to_email=job.get("user_email"),
            name=job.get("user_name"),
            part=job.get("part") or "",
            result=job.get("result") or {},
            job_id=job_id,
        )
        if sent:
            await db[JOBS_COLLECTION].update_one({"_id": job_id}, {"$set": {"email_sent": True}})
    except Exception as exc:  # noqa: BLE001
        logger.warning("speaking result email check failed for %s: %s", job_id, exc)


async def process_structured_job(job_id: str) -> None:
    """Grade one enqueued job independently of the original request. Idempotent:
    completed jobs short-circuit, so the startup sweep can safely re-call it."""
    if db is None:
        return
    job = await db[JOBS_COLLECTION].find_one({"_id": job_id})
    if not job or job.get("status") == "completed":
        return
    await db[JOBS_COLLECTION].update_one(
        {"_id": job_id},
        {"$set": {"status": "processing", "updated_at": datetime.now(timezone.utc)}},
    )

    user_id = job["user_id"]
    part = job["part"]
    topic = job.get("topic") or ""
    user_language = job.get("user_language") or "en"
    target_band = job.get("target_band") or 7.0
    client_request_id = job.get("client_request_id")
    set_id = job.get("set_id")
    book_id = job.get("book_id")
    test_id = job.get("test_id")
    questions_meta = job.get("questions") or []

    try:
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            raise RuntimeError("user_not_found")

        decision = await resolve_speaking_eval(db, user)

        result = await evaluate_speaking_practice_structured(
            part=part,
            topic=topic,
            target_band=target_band,
            user_language=user_language,
            questions=[
                {
                    "question": qm.get("question") or "",
                    "audio_bytes": _read_job_audio(qm),
                    "audio_url": qm.get("audio_url"),
                    "duration_seconds": qm.get("duration_seconds") or 0,
                }
                for qm in questions_meta
            ],
            mode=decision.mode,
        )

        result["part"] = part
        result["topic"] = topic
        result["target_band"] = target_band
        result["user_language"] = user_language

        await _persist_structured_attempt(
            user_id=user_id, client_request_id=client_request_id, part=part, topic=topic,
            user_language=user_language, target_band=target_band, questions_meta=questions_meta,
            result_dump=result, decision=decision, set_id=set_id, book_id=book_id, test_id=test_id,
        )

        # Mirror to test_attempts so the Progress page sees this session too.
        try:
            from server import persist_attempt as _persist_test_attempt
            _band = float((result.get("scores") or {}).get("overall") or 0.0)
            await _persist_test_attempt(
                user_id=user_id,
                test_id=test_id or f"speaking_practice_{part}_{set_id or 'session'}",
                test_type="speaking",
                band_score=_band,
                feedback={"source": "speaking_practice_structured", "context": "smart_practice_structured",
                          "part": part, "scores": result.get("scores") or {}},
            )
        except Exception as _e:  # noqa: BLE001
            logger.warning("persist_attempt mirror skipped (job %s): %s", job_id, _e)

        # Charge quota only now (on success), matching the sync endpoint.
        await record_speaking_eval(db, user, decision)
        if client_request_id:
            await speaking_idempotency.store(
                db, user_id=user_id, anon_key=None,
                client_request_id=client_request_id, result=result,
            )

        await db[JOBS_COLLECTION].update_one(
            {"_id": job_id},
            {"$set": {"status": "completed", "result": result,
                      "updated_at": datetime.now(timezone.utc)}},
        )
        _spawn(_maybe_email_result(job_id))
    except Exception as exc:  # noqa: BLE001
        logger.exception("structured speaking job %s failed: %s", job_id, exc)
        await db[JOBS_COLLECTION].update_one(
            {"_id": job_id},
            {"$set": {"status": "failed", "error": str(exc),
                      "updated_at": datetime.now(timezone.utc)}},
        )


async def sweep_pending_jobs() -> None:
    """Startup recovery: re-run jobs a pod restart left mid-flight."""
    if db is None:
        return
    try:
        cutoff = datetime.now(timezone.utc).timestamp() - JOB_MAX_AGE_SECONDS
        n = 0
        async for job in db[JOBS_COLLECTION].find({"status": {"$in": ["queued", "processing"]}}):
            created = job.get("created_at")
            if isinstance(created, datetime) and created.timestamp() < cutoff:
                continue
            _spawn(process_structured_job(job["_id"]))
            n += 1
        if n:
            logger.info("speaking_jobs sweep re-enqueued %d job(s)", n)
    except Exception as exc:  # noqa: BLE001
        logger.warning("speaking_jobs sweep failed: %s", exc)


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
async def evaluate_structured(request: Request, caller: dict = Depends(auth_session.current_user)):
    """Per-question Smart Practice evaluation. See module docstring."""
    if db is None:
        raise HTTPException(
            status_code=503,
            detail={"code": "db_unavailable", "message": "DB not initialised"},
        )

    form = await request.form()

    user_id = (form.get("user_id") or "").strip()
    auth_session.require_self_or_admin(user_id, caller)
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


# ─── Leave-safe async submit + history endpoints (v2) ───────────────────────


@router.post("/evaluate-structured-async")
async def evaluate_structured_async(request: Request, caller: dict = Depends(auth_session.current_user)):
    """Leave-safe variant of /evaluate-structured. Uploads the audio (durably
    mirrored to R2 by persist_audio), enqueues a job, and returns its job_id
    immediately. A background worker grades it independent of this connection,
    so closing the tab can no longer drop the test. Poll GET /jobs/{job_id}."""
    if db is None:
        raise HTTPException(status_code=503, detail={"code": "db_unavailable", "message": "DB not initialised"})

    form = await request.form()
    user_id = (form.get("user_id") or "").strip()
    auth_session.require_self_or_admin(user_id, caller)
    if not user_id:
        raise HTTPException(status_code=400, detail={"code": "missing_user_id", "message": "user_id required"})

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
        raise HTTPException(status_code=404, detail={"code": "user_not_found", "message": "User not found"})

    # Idempotency: a replay returns the already-graded result as a completed job.
    cached = await speaking_idempotency.lookup(
        db, user_id=user_id, anon_key=None, client_request_id=client_request_id,
    )
    if cached is not None:
        return JSONResponse(content={"status": "completed", "job_id": None, "result": cached},
                            headers={"X-Speaking-Cached": "1"})

    questions = await _parse_questions_from_form(form)
    for q in questions:
        validate_audio(q["audio_bytes"], q["duration_seconds"])

    # Quota gate up front (so the user gets an immediate 402), but the charge
    # itself happens in the worker on success — matching the sync endpoint.
    decision = await resolve_speaking_eval(db, user)
    if not decision.allowed:
        raise HTTPException(
            status_code=402,
            detail={
                "code": "quota_exhausted",
                "message": decision.message or "You've used all evaluations for this period.",
                "quota": decision.quota, "used": decision.used, "period": decision.period_key,
                "resets_at": decision.resets_at, "upgrade_to": decision.upgrade_to,
                "current_plan": decision.plan,
            },
        )

    # Persist audio (disk + R2 mirror) so the worker can re-read it even after a
    # pod restart, then enqueue.
    questions_meta: List[Dict[str, Any]] = []
    for q in questions:
        meta = persist_audio(q["audio_bytes"])
        questions_meta.append({
            "index": q["index"], "question": q["question"],
            "audio_url": meta["relative_url"], "audio_filename": meta["filename"],
            "audio_bytes": meta["bytes"], "duration_seconds": q["duration_seconds"],
        })

    job_id = uuid.uuid4().hex
    now = datetime.now(timezone.utc)
    await db[JOBS_COLLECTION].insert_one({
        "_id": job_id,
        "user_id": user_id,
        "user_email": user.get("email"),
        "user_name": user.get("first_name") or user.get("name"),
        "client_request_id": client_request_id,
        "status": "queued",
        "part": part, "topic": topic,
        "user_language": user_language, "target_band": target_band,
        "set_id": set_id, "book_id": book_id, "test_id": test_id,
        "questions": questions_meta,
        "created_at": now, "updated_at": now,
        "result": None, "error": None, "viewed_at": None, "email_sent": False,
    })
    _spawn(process_structured_job(job_id))

    return JSONResponse(content={"status": "queued", "job_id": job_id}, headers=_quota_headers(decision))


@router.get("/jobs/{job_id}")
async def get_speaking_job(job_id: str, caller: dict = Depends(auth_session.current_user)):
    """Poll a single job. Marks it viewed on first completed read so the worker
    skips the redundant 'result ready' email."""
    if db is None:
        raise HTTPException(status_code=503, detail={"code": "db_unavailable", "message": "DB not initialised"})
    job = await db[JOBS_COLLECTION].find_one({"_id": job_id})
    if not job:
        raise HTTPException(status_code=404, detail={"code": "job_not_found", "message": "Job not found"})
    auth_session.require_self_or_admin(job.get("user_id"), caller)
    if job.get("status") == "completed" and not job.get("viewed_at"):
        await db[JOBS_COLLECTION].update_one(
            {"_id": job_id}, {"$set": {"viewed_at": datetime.now(timezone.utc)}}
        )
    return _job_full(job)


@router.get("/attempts")
async def list_speaking_attempts(
    user_id: str, limit: int = 30, caller: dict = Depends(auth_session.current_user)
):
    """History list for the 'My results' page — every speaking job (queued /
    processing / completed / failed), newest first, slimmed (no full result)."""
    if db is None:
        raise HTTPException(status_code=503, detail={"code": "db_unavailable", "message": "DB not initialised"})
    auth_session.require_self_or_admin(user_id, caller)
    limit = max(1, min(int(limit or 30), 100))
    cursor = db[JOBS_COLLECTION].find({"user_id": user_id}).sort("created_at", -1).limit(limit)
    attempts = [_job_summary(job) async for job in cursor]
    return {"attempts": attempts}
