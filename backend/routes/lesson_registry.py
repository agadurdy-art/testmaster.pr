"""
Lesson Registry API Routes
==========================
ULTRA MASTER PROMPT Implementation

Provides endpoints for:
- Band-based topic gating
- Lesson-anchored task queries
- Course-driven recommendations
"""

from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List
from pydantic import BaseModel


router = APIRouter(prefix="/api/lesson-registry", tags=["Lesson Registry"])


# ============ TOPIC GATING ENDPOINTS ============

@router.get("/topics")
async def get_topics(
    band_level: Optional[str] = Query(None, description="Filter topics by band level (4.0-5.0, 5.5-6.5, 7.0-9.0)")
):
    """
    Get topics with band-based gating.
    
    Topic Gating Rules:
    - Band 4.0-5.0: Topics from Beginner Course only
    - Band 5.5-6.5: Topics from Beginner + Mastery Courses
    - Band 7.0-9.0: Topics from all three courses
    
    Returns list of topics with stage info and icons.
    """
    from server import db
    from services.lesson_registry import LessonRegistry
    
    registry = LessonRegistry(db)
    
    if band_level:
        topics = await registry.get_topics_by_band(band_level)
    else:
        topics = await registry.get_all_topics()
    
    return {
        "success": True,
        "band_level": band_level,
        "topics": topics,
        "total": len(topics)
    }


@router.get("/topics/by-stage")
async def get_topics_by_stage(
    stage: str = Query(..., description="Course stage: beginner, mastery, or advanced")
):
    """Get topics for a specific course stage."""
    from server import db
    from services.lesson_registry import LessonRegistry
    
    stage_to_band = {
        "beginner": "4.0-5.0",
        "mastery": "5.5-6.5",
        "advanced": "7.0-9.0"
    }
    
    if stage not in stage_to_band:
        raise HTTPException(status_code=400, detail="Invalid stage. Use: beginner, mastery, or advanced")
    
    registry = LessonRegistry(db)
    
    # Get topics for this specific band only
    all_topics = await registry.get_topics_by_band(stage_to_band[stage])
    
    # Filter to only topics from this stage
    stage_topics = [t for t in all_topics if stage in t.get("stages", [])]
    
    return {
        "success": True,
        "stage": stage,
        "band_level": stage_to_band[stage],
        "topics": stage_topics,
        "total": len(stage_topics)
    }


# ============ LESSON QUERY ENDPOINTS ============

@router.get("/lessons")
async def get_lessons(
    topic: Optional[str] = Query(None, description="Filter by topic"),
    band_level: Optional[str] = Query(None, description="Filter by band level"),
    skill: Optional[str] = Query(None, description="Filter by skill: reading, writing, speaking, listening")
):
    """
    Get lessons filtered by topic, band level, and/or skill.
    
    Returns lessons with learning objectives and stage info.
    """
    from server import db
    from services.lesson_registry import LessonRegistry
    
    if not topic and not band_level:
        raise HTTPException(status_code=400, detail="Please provide at least topic or band_level filter")
    
    registry = LessonRegistry(db)
    
    if topic:
        lessons = await registry.get_lessons_by_topic(topic, band_level, skill)
    else:
        # Get all lessons for band level
        lessons = await registry.get_lessons_by_topic("", band_level, skill)
    
    # Simplify response (don't return full lesson content)
    simplified = []
    for lesson in lessons:
        simplified.append({
            "id": lesson.get("id"),
            "title": lesson.get("topic") or lesson.get("title"),
            "stage": lesson.get("stage"),
            "band_level": lesson.get("band_level"),
            "lesson_number": lesson.get("lesson_number") or lesson.get("module_number"),
            "learning_goals": lesson.get("learning_goals", []),
            "learning_objectives": lesson.get("learning_objectives", []),
            "has_vocabulary": "vocabulary" in lesson,
            "has_grammar": "grammar" in lesson,
            "has_reading": "reading" in lesson,
            "has_writing": "writing" in lesson,
            "has_speaking": "speaking" in lesson,
            "has_listening": "listening" in lesson
        })
    
    return {
        "success": True,
        "filters": {
            "topic": topic,
            "band_level": band_level,
            "skill": skill
        },
        "lessons": simplified,
        "total": len(simplified)
    }


@router.get("/lessons/{lesson_id}")
async def get_lesson_detail(lesson_id: str):
    """
    Get full details of a specific lesson.
    
    Returns complete lesson content including all skills.
    """
    from server import db
    from services.lesson_registry import LessonRegistry
    
    registry = LessonRegistry(db)
    lesson = await registry.get_lesson_by_id(lesson_id)
    
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    return {
        "success": True,
        "lesson": lesson
    }


# ============ SKILL OBJECTIVES ENDPOINTS ============

@router.get("/objectives/{skill}")
async def get_skill_objectives(
    skill: str,
    band_level: Optional[str] = Query(None, description="Filter by band level")
):
    """
    Get learning objectives for a specific skill across courses.
    
    Useful for generating lesson-anchored tasks.
    """
    valid_skills = ["reading", "writing", "speaking", "listening", "vocabulary", "grammar"]
    
    if skill.lower() not in valid_skills:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid skill. Use one of: {', '.join(valid_skills)}"
        )
    
    from server import db
    from services.lesson_registry import LessonRegistry
    
    registry = LessonRegistry(db)
    objectives = await registry.get_skill_objectives(skill.lower(), band_level)
    
    return {
        "success": True,
        "skill": skill,
        "band_level": band_level,
        "objectives": objectives,
        "total": len(objectives)
    }


# ============ RECOMMENDATION ENDPOINTS ============

class RecommendationRequest(BaseModel):
    weaknesses: List[str]
    current_band: float
    skill: Optional[str] = None


@router.post("/recommendations")
async def get_recommendations(request: RecommendationRequest):
    """
    Get recommended lessons based on identified weaknesses.
    
    Used by AI evaluation to suggest lessons for improvement.
    
    Example weaknesses: ["vocabulary", "grammar", "coherence", "task_achievement"]
    """
    from server import db
    from services.lesson_registry import LessonRegistry
    
    registry = LessonRegistry(db)
    recommendations = await registry.get_recommended_lessons(
        weaknesses=request.weaknesses,
        current_band=request.current_band,
        skill=request.skill
    )
    
    return {
        "success": True,
        "current_band": request.current_band,
        "weaknesses": request.weaknesses,
        "recommendations": recommendations,
        "total": len(recommendations)
    }


@router.get("/recommendations/for-evaluation")
async def get_evaluation_recommendations(
    band_score: float = Query(..., description="User's band score from evaluation"),
    weaknesses: str = Query(..., description="Comma-separated list of weaknesses"),
    skill: Optional[str] = Query(None, description="Skill being evaluated")
):
    """
    GET endpoint for recommendations - used after AI evaluation.
    
    Example: /api/lesson-registry/recommendations/for-evaluation?band_score=5.5&weaknesses=vocabulary,grammar&skill=writing
    """
    from server import db
    from services.lesson_registry import LessonRegistry
    
    weakness_list = [w.strip() for w in weaknesses.split(",") if w.strip()]
    
    registry = LessonRegistry(db)
    recommendations = await registry.get_recommended_lessons(
        weaknesses=weakness_list,
        current_band=band_score,
        skill=skill
    )
    
    return {
        "success": True,
        "band_score": band_score,
        "weaknesses": weakness_list,
        "skill": skill,
        "recommended_lessons": recommendations,
        "total": len(recommendations)
    }


# ============ BAND GATING INFO ============

@router.get("/band-gating-info")
async def get_band_gating_info():
    """
    Get information about band-based topic gating rules.
    
    Returns the mapping of band levels to available course stages.
    """
    return {
        "success": True,
        "gating_rules": {
            "4.0-5.0": {
                "stages": ["beginner"],
                "courses": ["Beginner English Course"],
                "description": "Topics from Beginner Course only"
            },
            "5.5-6.5": {
                "stages": ["beginner", "mastery"],
                "courses": ["Beginner English Course", "IELTS Mastery Blueprint"],
                "description": "Topics from Beginner + Mastery Courses"
            },
            "7.0-9.0": {
                "stages": ["beginner", "mastery", "advanced"],
                "courses": ["Beginner English Course", "IELTS Mastery Blueprint", "Advanced IELTS Mastery"],
                "description": "Topics from all three courses"
            }
        },
        "stage_info": {
            "beginner": {
                "name": "Beginner English Course",
                "band_range": "4.0-5.0",
                "collection": "beginner_english_lessons",
                "lesson_count": 14
            },
            "mastery": {
                "name": "IELTS Mastery Blueprint",
                "band_range": "5.5-6.5",
                "collection": "mastery_course_modules",
                "module_count": 17
            },
            "advanced": {
                "name": "Advanced IELTS Mastery",
                "band_range": "7.0-9.0",
                "collection": "advanced_mastery_modules",
                "module_count": 20
            }
        }
    }
