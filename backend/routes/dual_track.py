"""
Dual-Track Course API Routes
=============================
Provides endpoints for Academic and General Training track management.
"""

from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List


router = APIRouter(prefix="/api/courses", tags=["Dual-Track Courses"])


# ============ TRACK INFO ============

@router.get("/tracks")
async def get_track_info():
    """Get information about available tracks."""
    return {
        "success": True,
        "tracks": {
            "academic": {
                "id": "academic",
                "name": "Academic IELTS",
                "description": "For university admission and professional registration",
                "writing_task1": "Graph, chart, table, diagram description",
                "writing_task2": "Academic essay",
                "reading": "Academic texts from books, journals, newspapers",
                "suitable_for": ["University applicants", "Professional registration", "Immigration (some countries)"]
            },
            "general": {
                "id": "general",
                "name": "General Training IELTS",
                "description": "For work experience, training programs, migration",
                "writing_task1": "Letter writing (formal, semi-formal, informal)",
                "writing_task2": "Essay on general topics",
                "reading": "Everyday texts: notices, advertisements, workplace documents",
                "suitable_for": ["Work visa applicants", "Training programs", "Immigration", "Secondary education"]
            }
        },
        "shared_components": ["Speaking", "Listening"]
    }


# ============ COURSE WITH TRACKS ============

@router.get("/{course_level}")
async def get_course_with_tracks(course_level: str):
    """
    Get course structure with both Academic and General tracks.
    
    course_level: beginner, mastery, or advanced
    """
    from server import db
    from services.dual_track_courses import get_dual_track_manager
    
    valid_levels = ["beginner", "mastery", "advanced"]
    if course_level not in valid_levels:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid course level. Use: {', '.join(valid_levels)}"
        )
    
    manager = get_dual_track_manager(db)
    course_data = await manager.get_course_with_tracks(course_level)
    
    return {
        "success": True,
        **course_data
    }


@router.get("/{course_level}/{track}")
async def get_track_lessons(
    course_level: str,
    track: str
):
    """
    Get lessons for a specific track within a course.
    
    course_level: beginner, mastery, or advanced
    track: academic or general
    """
    from server import db
    from services.dual_track_courses import get_dual_track_manager
    
    valid_levels = ["beginner", "mastery", "advanced"]
    valid_tracks = ["academic", "general"]
    
    if course_level not in valid_levels:
        raise HTTPException(status_code=400, detail=f"Invalid course level")
    if track not in valid_tracks:
        raise HTTPException(status_code=400, detail=f"Invalid track. Use: academic or general")
    
    manager = get_dual_track_manager(db)
    lessons = await manager.get_lessons_by_track(course_level, track)
    
    return {
        "success": True,
        "course_level": course_level,
        "track": track,
        "lessons": lessons,
        "total": len(lessons)
    }


@router.get("/{course_level}/{track}/lesson/{lesson_id}")
async def get_track_lesson_detail(
    course_level: str,
    track: str,
    lesson_id: str
):
    """Get detailed lesson content."""
    from server import db
    from services.dual_track_courses import get_dual_track_manager
    
    manager = get_dual_track_manager(db)
    lesson = await manager.get_lesson_by_id(lesson_id)
    
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    return {
        "success": True,
        "lesson": lesson
    }


# ============ RECOMMENDATIONS BY TRACK ============

@router.get("/recommendations/{track}")
async def get_track_recommendations(
    track: str,
    band_level: str = Query(..., description="Target band level"),
    weaknesses: str = Query(..., description="Comma-separated weaknesses")
):
    """
    Get lesson recommendations for a specific track.
    
    For General Training students practicing letter writing.
    """
    from server import db
    from services.dual_track_courses import get_dual_track_manager
    
    valid_tracks = ["academic", "general"]
    if track not in valid_tracks:
        raise HTTPException(status_code=400, detail=f"Invalid track")
    
    weakness_list = [w.strip() for w in weaknesses.split(",") if w.strip()]
    
    manager = get_dual_track_manager(db)
    recommendations = await manager.get_recommended_lessons_by_track(
        track=track,
        weaknesses=weakness_list,
        band_level=band_level
    )
    
    return {
        "success": True,
        "track": track,
        "band_level": band_level,
        "weaknesses": weakness_list,
        "recommended_lessons": recommendations,
        "total": len(recommendations)
    }


# ============ GENERAL TRACK SUMMARY ============

@router.get("/general/summary")
async def get_general_track_summary():
    """Get summary of all General Training content across courses."""
    from services.dual_track_courses import DualTrackCourseManager
    
    return {
        "success": True,
        "general_track_overview": {
            "beginner": {
                "band_target": "4.0-5.0",
                "lesson_count": len(DualTrackCourseManager.BEGINNER_GENERAL_LESSONS),
                "topics": [
                    "Letter Basics & Structure",
                    "Formal Letter Writing",
                    "Informal Letters to Friends & Family",
                    "Semi-formal Letters",
                    "Reading Everyday Texts"
                ]
            },
            "mastery": {
                "band_target": "5.5-6.5",
                "lesson_count": len(DualTrackCourseManager.MASTERY_GENERAL_LESSONS),
                "topics": [
                    "Advanced Formal Complaints",
                    "Neighbour & Community Letters",
                    "Softening Language & Diplomacy",
                    "Requests & Apology Letters",
                    "Workplace Documents"
                ]
            },
            "advanced": {
                "band_target": "7.0-9.0",
                "lesson_count": len(DualTrackCourseManager.ADVANCED_GENERAL_LESSONS),
                "topics": [
                    "Band 8-9 Letter Techniques",
                    "Nuanced Tone Control",
                    "Persuasive & Diplomatic Writing",
                    "Legal & Civic Texts"
                ]
            }
        },
        "total_general_lessons": (
            len(DualTrackCourseManager.BEGINNER_GENERAL_LESSONS) +
            len(DualTrackCourseManager.MASTERY_GENERAL_LESSONS) +
            len(DualTrackCourseManager.ADVANCED_GENERAL_LESSONS)
        )
    }
