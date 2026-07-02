"""
Liz Teacher — plan access & quota resolution.

Single job: resolve a user's Liz access (plan, features, quota), compute
message-usage stats for the meter UI, and build the structured 402/403
payloads the frontend paywall consumes. Also owns the shared /api/liz
APIRouter that the other liz_* endpoint modules register onto.

Extracted from routes/liz_teacher.py (Faz 1 refactor, 2026-07-02).
`db` is injected via routes/liz_teacher.py (server.py sets
`liz_teacher.db = db`, which fans out to every liz_* module).
"""
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import APIRouter, HTTPException

from plan_access import (
    get_plan_features,
    get_effective_plan,
    get_quota,
    normalize_plan_name,
)
from services.plan_expiry import enforce_plan_expiry

router = APIRouter(prefix="/api/liz", tags=["liz-teacher"])

db = None
logger = logging.getLogger(__name__)


async def get_liz_user_access(user_id: str) -> dict:
    if db is None:
        return {
            "user": None,
            "plan": "free",
            "effective_plan": "free",
            "features": get_plan_features("free"),
            "has_access": False,
            "quota": {"kind": "period", "total": 0, "remaining": 0, "tier": "free"},
        }
    user = await db.users.find_one(
        {"id": user_id},
        {"_id": 0, "id": 1, "name": 1, "email": 1, "plan": 1, "subscription": 1, "plan_expires_at": 1},
    )
    # Lazy expiry: a Custom package whose expires_at has passed (or a legacy
    # plan_expires_at gate) collapses to free here, before any feature gate
    # reads user.plan. Webhook misses won't strand a user on a dead plan.
    user = await enforce_plan_expiry(db, user)
    plan = normalize_plan_name((user or {}).get("plan", "free"))
    email = (user or {}).get("email")
    # Custom resolves to its effective tier (weekly/monthly/exam) for feature
    # gating; the actual remaining message count comes from the pool, not
    # the plan_features cap.
    effective_plan = get_effective_plan(user) if user else plan
    features = get_plan_features(effective_plan, email)
    quota = get_quota(user, "liz") if user else {"kind": "period", "total": 0, "remaining": 0, "tier": "free"}
    has_access = int(quota.get("total") or 0) > 0
    return {
        "user": user,
        "plan": plan,
        "effective_plan": effective_plan,
        "features": features,
        "has_access": has_access,
        "quota": quota,
    }


async def get_liz_usage_stats(user_id: str, max_messages: int, *, user: Optional[dict] = None) -> dict:
    """Liz message usage for the meter UI. Period plans count user messages
    in the current month. Custom plans report pool consumption (remaining
    derives from subscription.liz_pool_total - liz_pool_used)."""
    if db is None:
        return {"used_messages": 0, "remaining_messages": max_messages, "resets_at": None}
    if user is None:
        user = await db.users.find_one(
            {"id": user_id},
            {"_id": 0, "id": 1, "plan": 1, "subscription": 1, "plan_expires_at": 1},
        )
    plan = normalize_plan_name((user or {}).get("plan", "free"))
    if plan == "custom":
        q = get_quota(user, "liz")
        total = int(q.get("total") or 0)
        remaining = int(q.get("remaining") or 0)
        used = max(total - remaining, 0)
        sub = (user or {}).get("subscription") or {}
        return {
            "used_messages": used,
            "remaining_messages": remaining,
            "resets_at": sub.get("expires_at"),
        }

    # Pre-launch audit 2026-05-16: this path counted weekly-tier users on a
    # monthly window — they got 7× the intended quota. Pick the period based
    # on the actual plan so Weekly resets every Monday and Monthly resets
    # on the 1st.
    now = datetime.now(timezone.utc)
    if plan == "weekly":
        # Week starts Monday 00:00 UTC.
        week_start = (now - timedelta(days=now.weekday())).replace(
            hour=0, minute=0, second=0, microsecond=0
        )
        period_start = week_start
        period_end = week_start + timedelta(days=7)
    else:
        period_start = datetime(now.year, now.month, 1, tzinfo=timezone.utc)
        period_end = datetime(
            now.year + (1 if now.month == 12 else 0),
            1 if now.month == 12 else now.month + 1,
            1,
            tzinfo=timezone.utc,
        )
    sessions = await db.liz_sessions.find(
        {"user_id": user_id, "created_at": {"$gte": period_start.isoformat()}},
        {"_id": 0, "messages": 1}
    ).to_list(200)
    used = 0
    for session in sessions:
        for msg in session.get("messages", []):
            if msg.get("role") == "user":
                timestamp = msg.get("timestamp") or session.get("created_at")
                if timestamp and timestamp >= period_start.isoformat():
                    used += 1
    remaining = max(max_messages - used, 0)
    return {"used_messages": used, "remaining_messages": remaining, "resets_at": period_end.isoformat()}


# Upgrade target tables — first match wins; mirrors tier_resolver.UPGRADE_TARGETS
# but lives here so the Liz 402 payload doesn't depend on the speaking module.
LIZ_UPGRADE_TARGETS = {
    "free":     ["weekly", "monthly", "exam"],
    "weekly":   ["monthly", "exam"],
    "monthly":  ["exam"],
    "exam":     [],
    "explorer": ["weekly", "monthly", "exam"],
    "learner":  ["monthly", "exam"],
    "achiever": ["monthly", "exam"],
    "master":   [],
}


def _liz_quota_402_payload(access: dict) -> dict:
    """Structured 402 body so the frontend paywall can render plan/remaining
    /total/upgrade options without parsing free-text. See PricingPageV2 +
    upgrade-success flow (project_pricing_backlog.md)."""
    quota = access.get("quota") or {}
    usage = access.get("usage") or {}
    eff = access.get("effective_tier") or quota.get("tier") or access.get("effective_plan") or access.get("plan") or "free"
    return {
        "code": "quota_exceeded",
        "detail": "You have reached your Liz Teacher message limit for this plan.",
        "plan": access.get("plan") or "free",
        "effective_plan": access.get("effective_plan") or "free",
        "kind": "liz",
        "quota_kind": quota.get("kind", "period"),
        "remaining": int(usage.get("remaining_messages") or 0),
        "total": int(quota.get("total") or 0),
        "resets_at": usage.get("resets_at"),
        "upgrade_targets": LIZ_UPGRADE_TARGETS.get(eff, ["weekly", "monthly", "exam"]),
    }


async def ensure_liz_access(user_id: str) -> dict:
    access = await get_liz_user_access(user_id)
    if not access["has_access"]:
        raise HTTPException(
            status_code=403,
            detail={
                "code": "plan_locked",
                "detail": "Liz Teacher requires a paid plan.",
                "plan": access.get("plan") or "free",
                "kind": "liz",
                "upgrade_targets": LIZ_UPGRADE_TARGETS.get(
                    access.get("effective_plan") or "free",
                    ["weekly", "monthly", "exam"],
                ),
            },
        )
    access["usage"] = await get_liz_usage_stats(
        user_id,
        int(access["quota"].get("total") or 0),
        user=access.get("user"),
    )
    return access
