"""
Cumulative skill analytics.
===========================
Single job: `/skill-analytics/{user_id}` — aggregate a user's test_attempts
into per-skill strengths / weaknesses for the progress dashboard.

Extracted verbatim from server.py (Faz 1 refactor, 2026-07-02).
Collections: test_attempts (read-only).
"""

import logging

from fastapi import APIRouter, Depends

import auth_session

router = APIRouter()

db = None


def set_db(database):
    global db
    db = database


@router.get("/skill-analytics/{user_id}")
async def get_skill_analytics(user_id: str, caller: dict = Depends(auth_session.current_user)):
    auth_session.require_self_or_admin(user_id, caller)
    """Get cumulative skill analytics for a user across all tests"""
    try:
        # Get all test attempts for this user
        attempts = await db.test_attempts.find(
            {"user_id": user_id},
            {"_id": 0}
        ).to_list(500)

        if not attempts:
            return {
                "total_tests": 0,
                "average_score": 0,
                "average_band": None,
                "skill_performance": {},
                "strengths": [],
                "areas_to_improve": []
            }

        # Aggregate skill performance
        skill_totals = {}
        total_score = 0
        total_band = 0
        band_count = 0

        for attempt in attempts:
            # Sum scores
            if attempt.get("score") is not None:
                total_score += attempt["score"]

            # Sum bands
            if attempt.get("feedback", {}).get("estimated_band"):
                band = attempt["feedback"]["estimated_band"]
                if isinstance(band, (int, float)):
                    total_band += band
                    band_count += 1

            # Aggregate skill breakdown
            breakdown = attempt.get("feedback", {}).get("skill_breakdown", {})
            if isinstance(breakdown, dict):
                for skill_type, data in breakdown.items():
                    if skill_type not in skill_totals:
                        skill_totals[skill_type] = {"correct": 0, "total": 0}
                    if isinstance(data, dict):
                        skill_totals[skill_type]["correct"] += data.get("correct", 0)
                        skill_totals[skill_type]["total"] += data.get("total", 0)

        # Calculate strengths and weaknesses
        strengths = []
        areas_to_improve = []

        for skill_type, data in skill_totals.items():
            if data["total"] > 0:
                percentage = (data["correct"] / data["total"]) * 100
                if percentage >= 70:
                    strengths.append(skill_type)
                elif percentage < 50:
                    areas_to_improve.append(skill_type)

        return {
            "total_tests": len(attempts),
            "average_score": round(total_score / len(attempts), 1) if attempts else 0,
            "average_band": round(total_band / band_count, 1) if band_count > 0 else None,
            "skill_performance": skill_totals,
            "strengths": strengths[:5],
            "areas_to_improve": areas_to_improve[:5]
        }

    except Exception as e:
        logging.getLogger(__name__).error(f"Skill analytics error: {e}")
        return {
            "total_tests": 0,
            "average_score": 0,
            "skill_performance": {},
            "strengths": [],
            "areas_to_improve": []
        }
