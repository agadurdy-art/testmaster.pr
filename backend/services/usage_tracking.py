"""
Monthly usage counters for tier-based quota enforcement.

Design notes
------------
* Per-user, per-period counters live on the user doc under `usage.{period_key}`.
  A period key is `YYYY-MM` so we don't need a cron to reset — the first write
  of each month allocates a fresh bucket and the API only ever reads the
  current period's value.
* We deliberately avoid Stripe webhooks for period anchoring in this pass; the
  memory doc project_pricing_backlog.md explicitly notes rollover = NO, so a
  calendar-month boundary is an acceptable approximation until billing anchors
  land.
* Admin users (plan_access.is_admin_user) bypass all quotas.

Public surface (three functions) — keep it tight so callers don't reach into
the Mongo doc directly:

    async def check_usage(db, user, counter) -> dict
    async def increment_usage(db, user, counter, amount=1) -> dict
    async def get_all_counters(db, user) -> dict
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, Optional

from plan_access import (
    get_plan_features,
    is_admin_user,
    normalize_plan_name,
)

# Per-tier monthly quotas. Counter name → quota, or None for unlimited.
# Names intentionally match the pricing page copy so the meter text on the
# frontend can be derived directly from the key.
#
# Tier naming here follows the *current* plan_access tiers (free / explorer /
# learner / achiever / master) rather than the forthcoming marketing names
# (Starter / Complete / Band 7+). When billing renames the tiers, update this
# map — the counter keys are stable.
MONTHLY_QUOTAS: Dict[str, Dict[str, Optional[int]]] = {
    "free":     {"evaluations": 1,    "mocks": 0,  "speaking_minutes": 0},
    "explorer": {"evaluations": 20,   "mocks": 1,  "speaking_minutes": 10},
    "learner":  {"evaluations": 100,  "mocks": 4,  "speaking_minutes": 45},
    "achiever": {"evaluations": None, "mocks": None, "speaking_minutes": None},
    "master":   {"evaluations": None, "mocks": None, "speaking_minutes": None},
    # IELTS-Ace tiers (pricing page promises "unlimited evaluations"). Without
    # these entries the .get() fallback below dropped paid users onto `free`
    # and raised 402 "Monthly quota reached" on the second eval — directly
    # contradicting marketing copy (bug report 2026-04-20).
    "weekly":   {"evaluations": None, "mocks": 1,  "speaking_minutes": None},
    "monthly":  {"evaluations": None, "mocks": None, "speaking_minutes": None},
    "exam":     {"evaluations": None, "mocks": None, "speaking_minutes": None},
}

# Human-readable reset label for the meter UI. Pure cosmetic — the boundary
# logic uses the period key below.
def current_period_key(now: Optional[datetime] = None) -> str:
    now = now or datetime.now(timezone.utc)
    return f"{now.year:04d}-{now.month:02d}"


def _quota_for(user: Dict[str, Any], counter: str) -> Optional[int]:
    if user.get("email") and is_admin_user(user["email"]):
        return None  # unlimited
    plan = normalize_plan_name(user.get("plan"))
    quotas = MONTHLY_QUOTAS.get(plan, MONTHLY_QUOTAS["free"])
    return quotas.get(counter, 0)


def _usage_path(counter: str, period: str) -> str:
    # Dotted path into user.usage.{period}.{counter}
    return f"usage.{period}.{counter}"


async def check_usage(db, user: Dict[str, Any], counter: str) -> Dict[str, Any]:
    """Return {allowed, used, quota, remaining, period, unlimited} for a
    (user, counter) pair. Does not mutate.
    """
    period = current_period_key()
    bucket = (user.get("usage") or {}).get(period) or {}
    used = int(bucket.get(counter, 0) or 0)
    quota = _quota_for(user, counter)
    unlimited = quota is None
    remaining = None if unlimited else max(quota - used, 0)
    allowed = unlimited or used < quota
    return {
        "counter": counter,
        "period": period,
        "used": used,
        "quota": quota,
        "remaining": remaining,
        "unlimited": unlimited,
        "allowed": allowed,
    }


async def increment_usage(
    db,
    user: Dict[str, Any],
    counter: str,
    amount: int = 1,
) -> Dict[str, Any]:
    """Atomically $inc the counter on the user doc and return the fresh
    check_usage payload. Callers should check `allowed` before doing the
    expensive work — this function always increments, so the pattern is:

        usage = await check_usage(db, user, "evaluations")
        if not usage["allowed"]:
            raise HTTPException(402, detail=...)
        # ... do the work ...
        await increment_usage(db, user, "evaluations")
    """
    if amount <= 0:
        return await check_usage(db, user, counter)
    period = current_period_key()
    path = _usage_path(counter, period)
    await db.users.update_one(
        {"id": user["id"]},
        {"$inc": {path: amount}},
    )
    # Reflect the increment locally so the caller doesn't need a re-read.
    usage = dict(user.get("usage") or {})
    bucket = dict(usage.get(period) or {})
    bucket[counter] = int(bucket.get(counter, 0) or 0) + amount
    usage[period] = bucket
    user["usage"] = usage
    return await check_usage(db, user, counter)


async def get_all_counters(db, user: Dict[str, Any]) -> Dict[str, Any]:
    """Return every known counter for the current period. Handy for the
    /api/usage endpoint the dashboard meter reads."""
    counters = ["evaluations", "mocks", "speaking_minutes"]
    results = {}
    for c in counters:
        results[c] = await check_usage(db, user, c)
    return {
        "plan": normalize_plan_name(user.get("plan")),
        "period": current_period_key(),
        "counters": results,
    }
