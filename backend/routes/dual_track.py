"""
Dual-Track Course API Routes
=============================
Provides endpoints for Academic and General Training track management.
"""

from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List


router = APIRouter(prefix="/api/courses", tags=["Dual-Track Courses"])


# ============ STATIC ROUTES FIRST (to avoid path conflicts) ============

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


@router.get("/language-boosters")
async def list_all_language_boosters():
    """List all available Module-Specific Language Boosters."""
    from services.dual_track_courses import DualTrackCourseManager
    
    boosters_summary = []
    for module, booster in DualTrackCourseManager.MODULE_LANGUAGE_BOOSTERS.items():
        boosters_summary.append({
            "module": module,
            "lesson_id": booster["lesson_id"],
            "band_range": booster["band_range"],
            "vocabulary_count": len(booster["key_vocabulary"]),
            "has_writing_task": "writing_task" in booster,
            "has_reading_task": "reading_task" in booster
        })
    
    return {
        "success": True,
        "total": len(boosters_summary),
        "boosters": boosters_summary
    }


@router.get("/language-booster/{module}")
async def get_module_language_booster(module: str):
    """
    Get Module-Specific Language Booster for General Training.
    
    This provides vocabulary and functional phrases specific to a module topic.
    Example: /api/courses/language-booster/education
    """
    from services.dual_track_courses import DualTrackCourseManager
    
    module_lower = module.lower()
    
    # Check if module has a language booster
    if module_lower not in DualTrackCourseManager.MODULE_LANGUAGE_BOOSTERS:
        available_modules = list(DualTrackCourseManager.MODULE_LANGUAGE_BOOSTERS.keys())
        return {
            "success": False,
            "error": f"No specific language booster for '{module}'",
            "available_modules": available_modules,
            "suggestion": "Use a generic language booster or check available modules"
        }
    
    booster = DualTrackCourseManager.MODULE_LANGUAGE_BOOSTERS[module_lower]
    
    return {
        "success": True,
        "module": module_lower,
        "language_booster": booster
    }


@router.get("/general-summary")
async def get_general_track_summary():
    """Get summary of all General Training content across courses."""
    from services.dual_track_courses import DualTrackCourseManager
    
    return {
        "success": True,
        "general_track_overview": {
            "beginner": {
                "band_target": "4.0-5.0",
                "lesson_count": len(DualTrackCourseManager.BEGINNER_GENERAL_LESSONS),
                "topics": ["Letter Basics", "Formal Letters", "Informal Letters", "Semi-formal Letters"]
            },
            "mastery": {
                "band_target": "5.5-6.5",
                "lesson_count": len(DualTrackCourseManager.MASTERY_GENERAL_LESSONS),
                "topics": ["Advanced Complaints", "Community Letters", "Workplace Documents"]
            },
            "advanced": {
                "band_target": "7.0-9.0",
                "lesson_count": len(DualTrackCourseManager.ADVANCED_GENERAL_LESSONS),
                "topics": ["Band 8-9 Techniques", "Nuanced Tone", "Persuasive Writing"]
            }
        },
        "module_boosters": list(DualTrackCourseManager.MODULE_LANGUAGE_BOOSTERS.keys()),
        "advanced_strategic_modules": list(DualTrackCourseManager.ADVANCED_MODULE_STRATEGIC_WRITING.keys()),
        "total_general_lessons": (
            len(DualTrackCourseManager.BEGINNER_GENERAL_LESSONS) +
            len(DualTrackCourseManager.MASTERY_GENERAL_LESSONS) +
            len(DualTrackCourseManager.ADVANCED_GENERAL_LESSONS)
        )
    }


@router.get("/advanced-strategic-writing/{module}")
async def get_advanced_strategic_writing(module: str):
    """
    Get Module-Specific Strategic Writing for Advanced General Training.
    
    Each module has a focused, professional writing scenario with:
    - Strategic focus (tone, purpose, argument)
    - Real-world context
    - Band 8 model answer
    
    Example: /api/courses/advanced-strategic-writing/digital_frontier
    """
    from services.dual_track_courses import DualTrackCourseManager
    
    module_lower = module.lower().replace('-', '_').replace(' ', '_')
    
    # Check if module has strategic writing content
    if module_lower not in DualTrackCourseManager.ADVANCED_MODULE_STRATEGIC_WRITING:
        available_modules = list(DualTrackCourseManager.ADVANCED_MODULE_STRATEGIC_WRITING.keys())
        return {
            "success": False,
            "error": f"No strategic writing content for '{module}'",
            "available_modules": available_modules,
            "suggestion": "Check available modules for advanced strategic writing"
        }
    
    strategic_content = DualTrackCourseManager.ADVANCED_MODULE_STRATEGIC_WRITING[module_lower]
    
    return {
        "success": True,
        "module": module_lower,
        "strategic_writing": strategic_content
    }


@router.get("/advanced-strategic-writing-summary")
async def get_advanced_strategic_writing_summary():
    """Get summary of all Advanced Strategic Writing modules."""
    from services.dual_track_courses import DualTrackCourseManager
    
    summary = []
    for module_id, content in DualTrackCourseManager.ADVANCED_MODULE_STRATEGIC_WRITING.items():
        summary.append({
            "module_id": module_id,
            "module_title": content.get("module_title"),
            "strategic_focus": content.get("strategic_focus"),
            "band_target": content.get("band_target"),
            "scenario_title": content.get("writing_scenario", {}).get("title")
        })
    
    return {
        "success": True,
        "total": len(summary),
        "modules": summary
    }


@router.get("/track-recommendations/{track}")
async def get_track_recommendations(
    track: str,
    band_level: str = Query(..., description="Target band level"),
    weaknesses: str = Query(..., description="Comma-separated weaknesses")
):
    """Get lesson recommendations for a specific track."""
    from server import db
    from services.dual_track_courses import get_dual_track_manager
    
    valid_tracks = ["academic", "general"]
    if track not in valid_tracks:
        raise HTTPException(status_code=400, detail="Invalid track")
    
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


# ============ DYNAMIC ROUTES (course level based) ============

@router.get("/{course_level}")
async def get_course_with_tracks(course_level: str):
    """Get course structure with both Academic and General tracks."""
    from server import db
    from services.dual_track_courses import get_dual_track_manager
    
    valid_levels = ["beginner", "mastery", "advanced"]
    if course_level not in valid_levels:
        raise HTTPException(status_code=400, detail="Invalid course level")
    
    manager = get_dual_track_manager(db)
    course_data = await manager.get_course_with_tracks(course_level)
    
    return {
        "success": True,
        **course_data
    }


@router.get("/{course_level}/{track}")
async def get_track_lessons(course_level: str, track: str):
    """Get lessons for a specific track within a course."""
    from server import db
    from services.dual_track_courses import get_dual_track_manager
    
    valid_levels = ["beginner", "mastery", "advanced"]
    valid_tracks = ["academic", "general"]
    
    if course_level not in valid_levels:
        raise HTTPException(status_code=400, detail="Invalid course level")
    if track not in valid_tracks:
        raise HTTPException(status_code=400, detail="Invalid track")
    
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
async def get_track_lesson_detail(course_level: str, track: str, lesson_id: str):
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
