"""
Legacy tips + courses catalog endpoints.
========================================
Single job: read-only listing of the `tips` and `courses` Mongo collections
(legacy content catalog; the modern course systems live in their own routers).

Extracted verbatim from server.py (Faz 1 refactor, 2026-07-02).
Collections: tips, courses.
"""

from typing import Optional

from fastapi import APIRouter, HTTPException

router = APIRouter()

db = None


def set_db(database):
    global db
    db = database


@router.get("/tips")
async def get_tips(category: Optional[str] = None):
    query = {"category": category} if category else {}
    tips = await db.tips.find(query, {"_id": 0}).to_list(100)
    return tips


@router.get("/courses")
async def get_courses():
    courses = await db.courses.find({}, {"_id": 0}).to_list(100)
    return courses


@router.get("/courses/{course_id}")
async def get_course(course_id: str):
    course = await db.courses.find_one({"id": course_id}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course
