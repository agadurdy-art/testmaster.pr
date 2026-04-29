"""
ElevenLabs Conversational Liz — quota helper
============================================
Live-conversation seconds are a separate axis from /api/speaking/evaluate
quotas (those count Sonnet eval calls, not real-time minutes). This module
owns the second-counting half:

    user.liz_live_seconds_remaining: int   # decrements on every /finalize
    user.liz_live_seconds_granted:   int   # last grant amount (audit only)
    user.liz_live_grant_period:      str   # period key (one grant per period)

Per Aga 2026-04-29 plan lock:
    weekly  → 15 min  (900 s)
    monthly → 45 min  (2700 s)
    exam    → 75 min  (4500 s)
    free / GE plans → 0 (live conversation locked)

Grants are top-up on resolve: if the user's `liz_live_grant_period` doesn't
match the current plan period, we bump remaining to the plan grant. This
mirrors how /api/speaking/evaluate's tier_resolver enforces plan expiry on
read instead of trusting webhooks.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, Tuple

from plan_access import is_admin_user, normalize_plan_name
from services.usage_tracking import speaking_period_key_for_plan


LIZ_LIVE_GRANTS_SECONDS: Dict[str, int] = {
    "weekly":  15 * 60,
    "monthly": 45 * 60,
    "exam":    75 * 60,
    # Free + legacy GE plans intentionally absent → 0 / locked.
}

ADMIN_FALLBACK_SECONDS = 60 * 60  # 1 h pseudo-budget for admins (never deducted)


@dataclass
class LizLiveGrant:
    allowed: bool
    plan: str
    seconds_remaining: int
    seconds_granted: int        # the grant for this period
    period_key: str
    is_admin: bool
    message: str | None = None


async def resolve_liz_live_grant(db, user: Dict[str, Any]) -> LizLiveGrant:
    """Read-only check + lazy grant top-up. Persists the top-up to disk so
    a concurrent call sees the same remaining count."""
    plan_norm = normalize_plan_name(user.get("plan") or "free")
    is_admin = bool(user.get("email")) and is_admin_user(user["email"])

    if is_admin:
        return LizLiveGrant(
            allowed=True,
            plan=plan_norm,
            seconds_remaining=ADMIN_FALLBACK_SECONDS,
            seconds_granted=ADMIN_FALLBACK_SECONDS,
            period_key="admin",
            is_admin=True,
        )

    grant = LIZ_LIVE_GRANTS_SECONDS.get(plan_norm, 0)
    if grant <= 0:
        return LizLiveGrant(
            allowed=False,
            plan=plan_norm,
            seconds_remaining=0,
            seconds_granted=0,
            period_key="",
            is_admin=False,
            message=(
                "Live conversation with Liz is included in Weekly, Monthly, "
                "and Exam Pack plans."
            ),
        )

    period_key = speaking_period_key_for_plan(plan_norm, user)
    stored_period = user.get("liz_live_grant_period")
    remaining = int(user.get("liz_live_seconds_remaining") or 0)

    if stored_period != period_key:
        # New period (or first ever) → top up. Reset remaining to grant
        # rather than adding so users can't bank unused minutes.
        remaining = grant
        if db is not None and user.get("id"):
            await db.users.update_one(
                {"id": user["id"]},
                {"$set": {
                    "liz_live_seconds_remaining": grant,
                    "liz_live_seconds_granted": grant,
                    "liz_live_grant_period": period_key,
                }},
            )

    if remaining <= 0:
        return LizLiveGrant(
            allowed=False,
            plan=plan_norm,
            seconds_remaining=0,
            seconds_granted=grant,
            period_key=period_key,
            is_admin=False,
            message=(
                f"You've used all {grant // 60} minutes of live conversation "
                "with Liz for this period."
            ),
        )

    return LizLiveGrant(
        allowed=True,
        plan=plan_norm,
        seconds_remaining=remaining,
        seconds_granted=grant,
        period_key=period_key,
        is_admin=False,
    )


async def deduct_liz_live_seconds(
    db, user: Dict[str, Any], elapsed_seconds: int,
) -> int:
    """Atomically decrement remaining seconds. Returns the new remaining count
    (clamped at 0). No-op for admins."""
    if elapsed_seconds <= 0:
        return int(user.get("liz_live_seconds_remaining") or 0)

    is_admin = bool(user.get("email")) and is_admin_user(user["email"])
    if is_admin or db is None or not user.get("id"):
        return int(user.get("liz_live_seconds_remaining") or 0)

    # $inc with negative; then clamp via a follow-up update if we went under 0.
    res = await db.users.find_one_and_update(
        {"id": user["id"]},
        {"$inc": {"liz_live_seconds_remaining": -elapsed_seconds}},
        return_document=True,
        projection={"_id": 0, "liz_live_seconds_remaining": 1},
    )
    new_remaining = int((res or {}).get("liz_live_seconds_remaining") or 0)
    if new_remaining < 0:
        await db.users.update_one(
            {"id": user["id"]},
            {"$set": {"liz_live_seconds_remaining": 0}},
        )
        new_remaining = 0
    return new_remaining
