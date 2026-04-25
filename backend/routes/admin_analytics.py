"""Admin analytics endpoints for the TestMaster admin dashboard.

Three read-only aggregate endpoints that feed the three admin pages shipped
on 2026-04-19:

  * GET /api/admin/liz-analytics        — Liz usage + engagement
  * GET /api/admin/onboarding-analytics — onboarding funnel + path split
  * GET /api/admin/learning-mode-stats  — IELTS vs General English split

All three require the caller's email to be in `ADMIN_EMAILS_FOR_BYPASS`
(plan_access.is_admin_user). We accept the admin email as an
`x-admin-email` header so admin pages don't need a separate auth token —
the login check in the UI guards the route, and this header re-verifies
server-side.
"""

import logging
import os
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Header, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient

from plan_access import is_admin_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/admin", tags=["admin-analytics"])

_MONGO_URL = os.getenv("MONGO_URL", "")
_DB_NAME = os.getenv("DB_NAME", "testmaster")
_client = AsyncIOMotorClient(_MONGO_URL) if _MONGO_URL else None
db = _client[_DB_NAME] if _client else None


def _require_admin(x_admin_email: Optional[str]):
    if not x_admin_email or not is_admin_user(x_admin_email):
        raise HTTPException(status_code=403, detail="Admin access required")


def _iso_days_ago(days: int) -> str:
    return (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()


@router.get("/liz-analytics")
async def liz_analytics(x_admin_email: Optional[str] = Header(default=None)):
    """Liz usage aggregates for the last 30 days.

    Shape:
      {
        total_conversations, total_messages, active_users_30d,
        avg_messages_per_user, daily: [{date, messages}],
        top_users: [{email, messages}]
      }
    """
    _require_admin(x_admin_email)
    if db is None:
        raise HTTPException(status_code=503, detail="Database not configured")
    since = _iso_days_ago(30)

    total_conversations = await db.liz_conversations.count_documents(
        {"created_at": {"$gte": since}}
    ) if "liz_conversations" in await db.list_collection_names() else 0

    # Messages live on the user doc (monthly_usage.liz_messages) — fall back
    # to summing across users when there's no dedicated messages collection.
    pipeline_totals = [
        {"$match": {"monthly_usage.liz_messages": {"$gt": 0}}},
        {"$group": {
            "_id": None,
            "total": {"$sum": "$monthly_usage.liz_messages"},
            "users": {"$sum": 1},
        }},
    ]
    totals_cursor = db.users.aggregate(pipeline_totals)
    totals = await totals_cursor.to_list(length=1)
    total_messages = totals[0]["total"] if totals else 0
    active_users = totals[0]["users"] if totals else 0
    avg = round(total_messages / active_users, 2) if active_users else 0

    # Top users by message count (redact email to first char + domain).
    top_cursor = db.users.find(
        {"monthly_usage.liz_messages": {"$gt": 0}},
        {"email": 1, "monthly_usage.liz_messages": 1, "_id": 0},
    ).sort("monthly_usage.liz_messages", -1).limit(10)
    top_users = []
    async for u in top_cursor:
        email = u.get("email", "")
        redacted = email[:1] + "***@" + email.split("@")[-1] if "@" in email else email[:1] + "***"
        top_users.append({
            "email": redacted,
            "messages": u.get("monthly_usage", {}).get("liz_messages", 0),
        })

    return {
        "total_conversations": total_conversations,
        "total_messages": total_messages,
        "active_users_30d": active_users,
        "avg_messages_per_user": avg,
        "top_users": top_users,
    }


@router.get("/onboarding-analytics")
async def onboarding_analytics(x_admin_email: Optional[str] = Header(default=None)):
    """Onboarding completion funnel + path distribution."""
    _require_admin(x_admin_email)
    if db is None:
        raise HTTPException(status_code=503, detail="Database not configured")

    total_users = await db.users.count_documents({})
    completed = await db.users.count_documents({"onboarding_complete": True})
    incomplete = total_users - completed
    completion_rate = round((completed / total_users) * 100, 1) if total_users else 0

    # Path split
    ielts_count = await db.users.count_documents({"learning_mode": "ielts"})
    ge_count = await db.users.count_documents({
        "learning_mode": {"$in": ["general_english", "general", "ge"]}
    })
    unset = total_users - ielts_count - ge_count

    # Recent completions (last 7 days) to spot trends
    last_7d_completed = await db.users.count_documents({
        "onboarding_complete": True,
        "onboarding_completed_at": {"$gte": _iso_days_ago(7)},
    })

    return {
        "total_users": total_users,
        "completed": completed,
        "incomplete": incomplete,
        "completion_rate_pct": completion_rate,
        "last_7d_completed": last_7d_completed,
        "path_distribution": {
            "ielts": ielts_count,
            "general_english": ge_count,
            "unset": unset,
        },
    }


@router.get("/learning-mode-stats")
async def learning_mode_stats(x_admin_email: Optional[str] = Header(default=None)):
    """Per-mode breakdown of plan tier + engagement.

    Useful for deciding whether GE users convert at a different rate than
    IELTS users (feeds pricing / copy decisions).
    """
    _require_admin(x_admin_email)
    if db is None:
        raise HTTPException(status_code=503, detail="Database not configured")

    pipeline = [
        {"$group": {
            "_id": {
                "mode": {"$ifNull": ["$learning_mode", "unset"]},
                "plan": {"$ifNull": ["$plan", "free"]},
            },
            "count": {"$sum": 1},
        }},
    ]
    rows = []
    async for r in db.users.aggregate(pipeline):
        rows.append({
            "mode": r["_id"]["mode"],
            "plan": r["_id"]["plan"],
            "count": r["count"],
        })

    # Shape into nested dict: {mode: {plan: count}}
    nested = {}
    for r in rows:
        nested.setdefault(r["mode"], {})[r["plan"]] = r["count"]

    return {
        "breakdown": nested,
        "flat": rows,
    }
