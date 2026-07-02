"""
User progress summary
=====================
Single job: GET /progress/{user_id} — aggregate a user's test_attempts into
the Progress page payload. Collections: test_attempts (read-only).

Extracted verbatim from server.py (Faz 1 refactor, 2026-07-02).
"""

import logging
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends

import auth_session

router = APIRouter()

db = None


def set_db(database):
    global db
    db = database


@router.get("/progress/{user_id}")
async def get_user_progress(user_id: str, caller: dict = Depends(auth_session.current_user)):
    auth_session.require_self_or_admin(user_id, caller)
    attempts = await db.test_attempts.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("completed_at", -1).to_list(500)  # Return more attempts
    
    # Convert datetime strings
    for attempt in attempts:
        if isinstance(attempt.get('completed_at'), str):
            attempt['completed_at'] = datetime.fromisoformat(attempt['completed_at'])
    
    # Calculate statistics per type with averages
    by_type = {}
    total_band_score = 0
    band_count = 0
    best_band = 0
    
    # Failed / aborted sessions get persisted with a band of 0-2 (e.g. a mic
    # that didn't capture, an evaluator error). Excluding band <= 2 keeps those
    # from dragging the per-skill averages and counts down (was showing
    # Speaking 1.3 across 24 "tests" when only a couple were genuine).
    MIN_VALID_BAND = 2.0
    for attempt in attempts:
        test_type = attempt['test_type']
        band = attempt.get('band_score', 0) or 0

        if band <= MIN_VALID_BAND:
            continue

        if test_type not in by_type:
            by_type[test_type] = {"count": 0, "total_band": 0, "avg_score": 0.0}

        by_type[test_type]['count'] += 1
        by_type[test_type]['total_band'] += band

        total_band_score += band
        band_count += 1
        if band > best_band:
            best_band = band
    
    # Calculate averages per type
    for type_key in by_type:
        count = by_type[type_key]['count']
        if count > 0:
            by_type[type_key]['avg_score'] = round(by_type[type_key]['total_band'] / count, 1)
    
    # Calculate streak (consecutive days with tests)
    streak = 0
    if attempts:
        today = datetime.now(timezone.utc).date()
        dates_with_tests = set()
        for attempt in attempts:
            if attempt.get('completed_at'):
                completed = attempt['completed_at']
                if isinstance(completed, str):
                    completed = datetime.fromisoformat(completed.replace('Z', '+00:00'))
                dates_with_tests.add(completed.date())
        
        # Count consecutive days from today going backwards
        current_date = today
        while current_date in dates_with_tests:
            streak += 1
            current_date -= timedelta(days=1)
    
    # Calculate badges/achievements
    badges = []
    total_tests = len(attempts)
    avg_band = round(total_band_score / band_count, 1) if band_count > 0 else 0.0
    
    # Test count badges
    if total_tests >= 1:
        badges.append({"id": "first_test", "name": "First Steps", "icon": "🎯", "description": "Completed your first test"})
    if total_tests >= 5:
        badges.append({"id": "five_tests", "name": "Getting Started", "icon": "📚", "description": "Completed 5 tests"})
    if total_tests >= 10:
        badges.append({"id": "ten_tests", "name": "Dedicated Learner", "icon": "🔥", "description": "Completed 10 tests"})
    if total_tests >= 25:
        badges.append({"id": "twentyfive_tests", "name": "IELTS Warrior", "icon": "⚔️", "description": "Completed 25 tests"})
    if total_tests >= 50:
        badges.append({"id": "fifty_tests", "name": "Master Practitioner", "icon": "👑", "description": "Completed 50 tests"})
    
    # Band score badges
    if best_band >= 6:
        badges.append({"id": "band_6", "name": "Band 6 Achiever", "icon": "🥉", "description": "Achieved Band 6 or higher"})
    if best_band >= 7:
        badges.append({"id": "band_7", "name": "Band 7 Expert", "icon": "🥈", "description": "Achieved Band 7 or higher"})
    if best_band >= 8:
        badges.append({"id": "band_8", "name": "Band 8 Master", "icon": "🥇", "description": "Achieved Band 8 or higher"})
    
    # Streak badges
    if streak >= 3:
        badges.append({"id": "streak_3", "name": "On Fire", "icon": "🔥", "description": "3 day streak"})
    if streak >= 7:
        badges.append({"id": "streak_7", "name": "Week Warrior", "icon": "💪", "description": "7 day streak"})
    if streak >= 30:
        badges.append({"id": "streak_30", "name": "Monthly Champion", "icon": "🏆", "description": "30 day streak"})
    
    # Skill mastery badges
    for skill, data in by_type.items():
        if data['avg_score'] >= 7:
            badges.append({"id": f"{skill}_master", "name": f"{skill.capitalize()} Master", "icon": "⭐", "description": f"Band 7+ average in {skill}"})
    
    stats = {
        "total_tests": total_tests,
        "by_type": by_type,
        "average_band_score": avg_band,
        "best_band": best_band,
        "streak": streak,
        "badges": badges,
        "recent_attempts": attempts  # Return ALL attempts for Progress page
    }

    return stats
