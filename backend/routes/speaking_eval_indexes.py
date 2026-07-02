"""
Speaking eval — Mongo index bootstrap (called once at server startup via the
routes/speaking_unified shim's init_indexes export).
Extracted from routes/speaking_unified.py (Faz 1 refactor, 2026-07-02).

Single job: idempotent index creation for the speaking-eval collections.
"""
from __future__ import annotations

import logging

from services import speaking_idempotency

logger = logging.getLogger(__name__)

# Module-level db handle; populated via routes.speaking_unified.set_db().
db = None


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
