"""
Speaking eval — shared helpers (router, telemetry, persistence, request
shaping, quota headers) + the /topics catalogue endpoint.
Extracted from routes/speaking_unified.py (Faz 1 refactor, 2026-07-02).

Single job: hold the APIRouter + the cross-endpoint helpers every speaking
evaluation endpoint uses. Endpoint handlers live in speaking_eval_authed /
speaking_eval_anon / speaking_eval_fulltest; index bootstrap in
speaking_eval_indexes; routes/speaking_unified.py is the compat shim that
wires them together (set_db fan-out + re-exports).
"""
from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException

from schemas.speaking_evaluator import (
    SpeakingEvaluationRequest,
    SpeakingPart,
)
from services.tier_resolver import EvalDecision

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
