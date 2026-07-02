"""
Evaluation quota claim/rollback.
================================
Single job: atomically claim one unit of a user's monthly evaluation quota
before running a paid LLM evaluation, and roll the claim back if the
downstream work fails (so errors never burn quota).

Extracted from server.py (Faz 1 refactor, 2026-07-02) so route modules
(writing_eval, GE evaluate, ...) can share it without importing server.
"""

import logging

from fastapi import HTTPException

from services.usage_tracking import claim_usage_atomic, current_period_key

logger = logging.getLogger(__name__)


async def claim_evaluation_quota(db, user_id: str, counter: str) -> dict:
    """Atomically claim one unit of `counter` quota for the user. Raises 402
    if exhausted. Returns the user doc on success.

    Caller MUST call rollback_evaluation_claim(db, user_id, counter) if the
    downstream work (e.g. AI call) fails, to avoid burning quota on errors.
    """
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    usage = await claim_usage_atomic(db, user, counter)
    if not usage["allowed"]:
        raise HTTPException(
            status_code=402,
            detail={
                "code": "quota_exceeded",
                "message": "Monthly evaluation quota reached. Upgrade to keep going.",
                "counter": counter,
                "used": usage["used"],
                "quota": usage["quota"],
                "period": usage["period"],
                "upgrade_url": "/pricing",
            },
        )
    return user


async def rollback_evaluation_claim(db, user_id: str, counter: str) -> None:
    """Decrement a previously-claimed quota unit. Bounded to monthly period
    counter; admin/custom plans use a different storage path and are
    no-ops here (claim_usage_atomic delegated to increment_usage for them,
    which is fine to leave as-is on failure for the rare custom-plan case)."""
    try:
        period = current_period_key()
        await db.users.update_one(
            {"id": user_id},
            {"$inc": {f"usage.{period}.{counter}": -1}},
        )
    except Exception as e:
        logger.warning(f"Quota rollback failed for {user_id}/{counter}: {e}")
