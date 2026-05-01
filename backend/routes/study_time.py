"""
Study Time Tracking
-------------------
Tracks time the user spends on the site, broken down by route + category, so
the dashboard StreakDial can show real "Total Study" minutes (not just summed
test attempts) and a click-through drilldown can show where the time went.

Frontend posts a heartbeat every ~30s while the tab is visible AND the user
has been active in the last 60s. Backend caps writes at 8 hours/day per user
to bound runaway writers (sleeping tab, dev console open, etc.).
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime, timezone, timedelta, time

router = APIRouter(prefix="/api/study-time", tags=["study-time"])

# Daily safety cap — anything past this on a single calendar day (UTC) for
# one user is silently dropped. 8h matches a maxed-out study day; anything
# more is almost certainly a stuck tab.
DAILY_CAP_SECONDS = 8 * 60 * 60

# Per-heartbeat cap. Frontend ticks every 30s; reject anything claiming more
# than 2 minutes per hop (e.g. a tab that came back from sleep and tried to
# flush a giant delta).
PER_HEARTBEAT_CAP_SECONDS = 120


def _categorize(route: str) -> str:
    """Map a frontend route to a high-level study category."""
    if not route:
        return "Other"
    r = route.lower()
    # Order matters: more specific first.
    if r.startswith("/cambridge-test") or r.startswith("/full-test"):
        return "Tests"
    if r.startswith("/question-bank") or r.startswith("/qb"):
        return "Practice"
    if (
        r.startswith("/courses")
        or r.startswith("/course/")
        or r.startswith("/beginner-course")
        or r.startswith("/mastery-course")
        or r.startswith("/advanced-mastery")
        or r.startswith("/lesson")
    ):
        return "Courses"
    if (
        r.startswith("/liz")
        or r.startswith("/speaking-premium")
        or r.startswith("/score-my-speaking")
    ):
        return "Liz"
    if r.startswith("/vocabulary") or r.startswith("/grammar") or r.startswith("/tips"):
        return "Tools"
    if r.startswith("/results") or r.startswith("/progress"):
        return "Review"
    if r.startswith("/dashboard") or r.startswith("/profile") or r == "/":
        return "Browsing"
    return "Other"


class HeartbeatBody(BaseModel):
    user_id: str
    route: str
    seconds: int = Field(..., ge=1)


@router.post("/heartbeat")
async def heartbeat(body: HeartbeatBody):
    """Record a chunk of active time for a user on a given route."""
    from server import db  # local import keeps router import-cheap

    secs = min(int(body.seconds), PER_HEARTBEAT_CAP_SECONDS)
    if secs <= 0:
        return {"success": True, "accepted_seconds": 0}

    now = datetime.now(timezone.utc)
    day_start = datetime.combine(now.date(), time.min, tzinfo=timezone.utc)
    day_end = day_start + timedelta(days=1)

    # Enforce daily cap by checking how much we've already accepted today.
    pipeline = [
        {"$match": {"user_id": body.user_id, "ts": {"$gte": day_start, "$lt": day_end}}},
        {"$group": {"_id": None, "total": {"$sum": "$seconds"}}},
    ]
    cursor = db.study_time_intervals.aggregate(pipeline)
    today_total = 0
    async for row in cursor:
        today_total = int(row.get("total", 0))
    remaining = max(0, DAILY_CAP_SECONDS - today_total)
    accepted = min(secs, remaining)
    if accepted <= 0:
        return {"success": True, "accepted_seconds": 0, "capped": True}

    await db.study_time_intervals.insert_one(
        {
            "user_id": body.user_id,
            "route": body.route or "/",
            "category": _categorize(body.route or "/"),
            "seconds": accepted,
            "ts": now,
        }
    )
    return {"success": True, "accepted_seconds": accepted}


def _week_start(now: datetime) -> datetime:
    """Monday 00:00 UTC of the current ISO week."""
    today = now.date()
    monday = today - timedelta(days=today.weekday())
    return datetime.combine(monday, time.min, tzinfo=timezone.utc)


@router.get("/summary")
async def summary(user_id: str, scope: str = "week"):
    """Return total study time + category + top-pages breakdown.

    scope: "week" (default, Monday→now) or "today".
    """
    from server import db

    now = datetime.now(timezone.utc)
    if scope == "today":
        start = datetime.combine(now.date(), time.min, tzinfo=timezone.utc)
    else:
        start = _week_start(now)

    match = {"user_id": user_id, "ts": {"$gte": start, "$lte": now}}

    # Total
    total_seconds = 0
    async for row in db.study_time_intervals.aggregate(
        [{"$match": match}, {"$group": {"_id": None, "total": {"$sum": "$seconds"}}}]
    ):
        total_seconds = int(row.get("total", 0))

    # By category
    by_category: Dict[str, int] = {}
    async for row in db.study_time_intervals.aggregate(
        [
            {"$match": match},
            {"$group": {"_id": "$category", "total": {"$sum": "$seconds"}}},
            {"$sort": {"total": -1}},
        ]
    ):
        by_category[row["_id"] or "Other"] = int(row["total"])

    # Top routes (5)
    top_routes: List[Dict] = []
    async for row in db.study_time_intervals.aggregate(
        [
            {"$match": match},
            {
                "$group": {
                    "_id": "$route",
                    "seconds": {"$sum": "$seconds"},
                    "category": {"$first": "$category"},
                }
            },
            {"$sort": {"seconds": -1}},
            {"$limit": 5},
        ]
    ):
        top_routes.append(
            {
                "route": row["_id"] or "/",
                "category": row.get("category") or _categorize(row["_id"] or "/"),
                "seconds": int(row["seconds"]),
                "minutes": int(row["seconds"]) // 60,
            }
        )

    return {
        "success": True,
        "scope": scope,
        "since": start.isoformat(),
        "total_seconds": total_seconds,
        "total_minutes": total_seconds // 60,
        "by_category": {k: v // 60 for k, v in by_category.items()},
        "by_category_seconds": by_category,
        "top_routes": top_routes,
    }


print("✅ Study time routes loaded")
