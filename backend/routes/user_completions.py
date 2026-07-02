"""
User test-completion tracking.
==============================
Single job: record "user finished test X in category Y" events and serve the
completion/practice stats that power dashboard progress widgets.

Extracted verbatim from server.py (Faz 1 refactor, 2026-07-02).
Collections: user_completions, test_attempts.
"""

from datetime import datetime, timezone

from fastapi import APIRouter, Body, Depends, HTTPException

import auth_session

router = APIRouter()

db = None


def set_db(database):
    global db
    db = database


@router.post("/user/track-completion")
async def track_test_completion(
    user_id: str = Body(...),
    test_id: str = Body(...),
    category: str = Body(...),
    band_score: float = Body(default=0.0),
    caller: dict = Depends(auth_session.current_user),
):
    auth_session.require_self_or_admin(user_id, caller)
    """Track a test completion (full test or cambridge)."""
    valid_categories = ["cambridge", "ai_academic", "ai_general"]
    if category not in valid_categories:
        raise HTTPException(status_code=400, detail=f"Invalid category. Use: {valid_categories}")

    existing = await db.user_completions.find_one(
        {"user_id": user_id, "test_id": test_id, "category": category}, {"_id": 0}
    )
    record = {
        "user_id": user_id,
        "test_id": test_id,
        "category": category,
        "band_score": band_score,
        "completed_at": datetime.now(timezone.utc).isoformat(),
    }
    if existing:
        await db.user_completions.update_one(
            {"user_id": user_id, "test_id": test_id, "category": category},
            {"$set": record},
        )
    else:
        await db.user_completions.insert_one(record)

    return {"success": True, "message": "Completion tracked"}


@router.get("/user/{user_id}/completion-stats")
async def get_user_completion_stats(user_id: str, caller: dict = Depends(auth_session.current_user)):
    auth_session.require_self_or_admin(user_id, caller)
    """Get user's test completion stats with breakdown."""
    # Full test / Cambridge completions
    completions = await db.user_completions.find(
        {"user_id": user_id}, {"_id": 0}
    ).to_list(500)

    cambridge_ids = set()
    ai_academic_ids = set()
    ai_general_ids = set()
    for c in completions:
        cat = c.get("category")
        tid = c.get("test_id")
        if cat == "cambridge":
            cambridge_ids.add(tid)
        elif cat == "ai_academic":
            ai_academic_ids.add(tid)
        elif cat == "ai_general":
            ai_general_ids.add(tid)

    # Practice completions from test_attempts
    practice_skills = {}
    attempts = await db.test_attempts.find(
        {"user_id": user_id}, {"_id": 0, "test_type": 1}
    ).to_list(1000)
    for a in attempts:
        t = a.get("test_type", "unknown")
        practice_skills[t] = practice_skills.get(t, 0) + 1

    total_full_completed = len(cambridge_ids) + len(ai_academic_ids) + len(ai_general_ids)
    total_practice = sum(practice_skills.values())

    return {
        "cambridge": {"completed": len(cambridge_ids), "total": 8, "tests": list(cambridge_ids)},
        "ai_academic": {"completed": len(ai_academic_ids), "total": 8, "tests": list(ai_academic_ids)},
        "ai_general": {"completed": len(ai_general_ids), "total": 4, "tests": list(ai_general_ids)},
        "practice": practice_skills,
        "total_full_completed": total_full_completed,
        "total_full_available": 20,
        "total_practice": total_practice,
    }
