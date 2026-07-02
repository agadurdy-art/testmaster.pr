"""
Test-attempt store.
===================
Single job: the TestAttempt document model and persist_attempt() — the single
writer for db.test_attempts. Every evaluate endpoint (cambridge, reading_qb,
listening_qb, speaking_*, full_test, writing v2, liz_eleven, GE tests) mirrors
attempts through here so Progress + Liz read one collection.

Extracted verbatim from server.py (Faz 1 refactor, 2026-07-02); server.py
re-exports persist_attempt/TestAttempt so `from server import persist_attempt`
keeps working in existing route modules.
"""

import logging
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field

db = None


def set_db(database):
    global db
    db = database


logger = logging.getLogger(__name__)


class TestAttempt(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    test_id: str
    test_type: str
    answers: List[Dict[str, Any]]
    score: float
    band_score: float
    feedback: Dict[str, Any]
    time_taken: int  # in seconds
    completed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ---------------------------------------------------------------------------
# persist_attempt — single writer for db.test_attempts
#
# All evaluate endpoints (cambridge, reading_qb, listening_qb, speaking_qb,
# speaking_unified, full_test, cambridge_speaking) call this after computing
# scores so the Progress page + Liz can read every practice/test attempt from
# a single collection. Returns the inserted attempt id, or None if skipped.
# Skips silently when user_id is missing/empty (anonymous practice).
# ---------------------------------------------------------------------------
async def persist_attempt(
    *,
    user_id: Optional[str],
    test_id: str,
    test_type: str,
    band_score: float = 0.0,
    score: float = 0.0,
    answers: Optional[List[Dict[str, Any]]] = None,
    feedback: Optional[Dict[str, Any]] = None,
    time_taken: int = 0,
) -> Optional[str]:
    if not user_id:
        return None
    try:
        attempt = TestAttempt(
            user_id=str(user_id),
            test_id=str(test_id or "unknown"),
            test_type=str(test_type or "mixed"),
            answers=answers or [],
            score=float(score or 0.0),
            band_score=float(band_score or 0.0),
            feedback=feedback or {},
            time_taken=int(time_taken or 0),
        )
        doc = attempt.model_dump()
        doc["completed_at"] = doc["completed_at"].isoformat()
        await db.test_attempts.insert_one(doc)
        try:
            await db.users.update_one(
                {"id": str(user_id)},
                {"$push": {"test_history": attempt.id}},
            )
        except Exception:
            pass  # user history mirror is best-effort
        return attempt.id
    except Exception as e:
        logger.warning(f"persist_attempt failed for user={user_id} type={test_type}: {e}")
        return None
