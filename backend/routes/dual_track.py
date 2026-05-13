"""
Dual-Track Course API Routes
=============================
Provides endpoints for Academic and General Training track management.
"""

from fastapi import APIRouter, Query, HTTPException, Body
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


@router.get("/advanced-strategic-reading/{module}")
async def get_advanced_strategic_reading(module: str):
    """
    Get Module-Specific Strategic Reading for Advanced General Training.
    
    Each module has a complex, real-life reading scenario with:
    - Professional/official document types
    - Authentic text formats (policies, contracts, guidelines)
    - IELTS-style comprehension questions
    
    Example: /api/courses/advanced-strategic-reading/digital_frontier
    """
    from services.dual_track_courses import DualTrackCourseManager
    
    module_lower = module.lower().replace('-', '_').replace(' ', '_')
    
    # Check if module has strategic reading content
    if module_lower not in DualTrackCourseManager.ADVANCED_MODULE_STRATEGIC_READING:
        available_modules = list(DualTrackCourseManager.ADVANCED_MODULE_STRATEGIC_READING.keys())
        return {
            "success": False,
            "error": f"No strategic reading content for '{module}'",
            "available_modules": available_modules,
            "suggestion": "Check available modules for advanced strategic reading"
        }
    
    strategic_content = DualTrackCourseManager.ADVANCED_MODULE_STRATEGIC_READING[module_lower]
    
    return {
        "success": True,
        "module": module_lower,
        "strategic_reading": strategic_content
    }


@router.get("/advanced-strategic-reading-summary")
async def get_advanced_strategic_reading_summary():
    """Get summary of all Advanced Strategic Reading modules."""
    from services.dual_track_courses import DualTrackCourseManager
    
    summary = []
    for module_id, content in DualTrackCourseManager.ADVANCED_MODULE_STRATEGIC_READING.items():
        summary.append({
            "module_id": module_id,
            "module_title": content.get("module_title"),
            "strategic_focus": content.get("strategic_focus"),
            "band_target": content.get("band_target"),
            "text_type": content.get("reading_scenario", {}).get("text_type"),
            "scenario_title": content.get("reading_scenario", {}).get("title")
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


# ============ TRACK-SPECIFIC AI EVALUATION ENDPOINTS ============

@router.post("/evaluate/writing")
async def evaluate_writing_track_specific():
    """Retired in Faz 4 (2026-05-13).

    Original implementation: services.track_specific_evaluator, a parallel
    rubric path with its own LLM call that bypassed writing_idempotency and
    the single-shot retry policy. No frontend caller referenced this route
    on 2026-05-13.

    Use /api/writing-practice/evaluate/v2 for all writing evaluation.
    """
    raise HTTPException(
        status_code=410,
        detail={
            "code": "endpoint_retired",
            "message": "Use /api/writing-practice/evaluate/v2 instead.",
            "replacement": "/api/writing-practice/evaluate/v2",
        },
    )


@router.post("/evaluate/reading")
async def evaluate_reading_track_specific(
    answers: list = Body(...),  # List of {"answer": "user's answer"}
    questions: list = Body(...),  # List of {"answer": "correct", "type": "multiple_choice"}
    track: str = Body("general"),  # "academic" or "general"
    document_type: str = Body(None)  # For general: "policy_document", "contract_agreement", etc.
):
    """
    Evaluate reading comprehension with skill-based analysis.
    
    Returns:
    - Score and estimated band
    - Skill-by-skill performance breakdown
    - Specific feedback for each skill area
    - Document-type specific tips (General Training)
    """
    from services.track_specific_evaluator import track_evaluator, IELTSTrack
    
    try:
        track_enum = IELTSTrack.ACADEMIC if track == "academic" else IELTSTrack.GENERAL
        
        evaluation = track_evaluator.evaluate_reading_passage(
            answers=answers,
            questions=questions,
            track=track_enum,
            document_type=document_type
        )
        
        return {
            "success": True,
            "evaluation": evaluation
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


@router.get("/evaluation/rubrics/{track}")
async def get_evaluation_rubrics(track: str):
    """
    Get the evaluation rubrics for a specific track.
    Useful for showing users what criteria they'll be evaluated on.
    """
    from services.track_specific_evaluator import track_evaluator
    
    if track == "academic":
        return {
            "success": True,
            "track": "academic",
            "writing_rubrics": track_evaluator.ACADEMIC_WRITING_RUBRICS,
            "focus_areas": [
                "Formal academic register",
                "Data interpretation accuracy",
                "Academic vocabulary",
                "Objective analysis",
                "Hedging language"
            ]
        }
    elif track == "general":
        return {
            "success": True,
            "track": "general",
            "writing_rubrics": track_evaluator.GENERAL_WRITING_RUBRICS,
            "reading_skills": track_evaluator.READING_EVALUATION_CRITERIA,
            "document_types": track_evaluator.GT_DOCUMENT_EVALUATION,
            "focus_areas": [
                "Appropriate register (formal/semi-formal/informal)",
                "Practical communication effectiveness",
                "Purpose achievement",
                "Real-world document comprehension"
            ]
        }
    else:
        return {
            "success": False,
            "error": "Invalid track. Use 'academic' or 'general'."
        }


@router.get("/evaluation/reading-skills")
async def get_reading_skill_categories():
    """
    Get all reading skill categories with descriptions.
    Helps users understand what skills are being tested.
    """
    from services.track_specific_evaluator import track_evaluator
    
    return {
        "success": True,
        "skills": track_evaluator.READING_EVALUATION_CRITERIA
    }


@router.get("/model-answer/quality-guide")
async def get_model_answer_quality_guide():
    """
    Get the model answer quality standards and guidelines.
    Useful for understanding what makes a Band 9 vs Band 7 response.
    """
    from services.model_answer_quality import (
        WRITING_QUALITY_STANDARDS,
        SPEAKING_QUALITY_STANDARDS,
        GENERAL_TRAINING_LETTER_STANDARDS,
        TEMPLATE_PHRASES_TO_AVOID,
        NATURAL_ALTERNATIVES
    )
    
    return {
        "success": True,
        "writing_standards": WRITING_QUALITY_STANDARDS,
        "speaking_standards": SPEAKING_QUALITY_STANDARDS,
        "letter_standards": GENERAL_TRAINING_LETTER_STANDARDS,
        "avoid": TEMPLATE_PHRASES_TO_AVOID,
        "prefer": NATURAL_ALTERNATIVES
    }


@router.get("/model-answer/examples/{skill}/{band}")
async def get_model_answer_example(skill: str, band: str):
    """
    Get example model answers for specific skill and band level.
    
    skill: writing_academic, writing_general, speaking_part2, speaking_part3
    band: band_7, band_8, band_9
    """
    from services.model_answer_quality import ENHANCED_WRITING_MODELS, ENHANCED_SPEAKING_MODELS
    
    examples = {
        "writing_academic": {
            "band_9": ENHANCED_WRITING_MODELS.get("academic_task2", {}),
            "band_8": None  # Add as needed
        },
        "writing_general_formal": {
            "band_9": ENHANCED_WRITING_MODELS.get("general_task1_formal_complaint", {}),
        },
        "writing_general_informal": {
            "band_9": ENHANCED_WRITING_MODELS.get("general_task1_informal", {}),
        },
        "speaking_part2": {
            "band_9": ENHANCED_SPEAKING_MODELS.get("part2", {}),
        },
        "speaking_part3": {
            "band_9": ENHANCED_SPEAKING_MODELS.get("part3", {}),
        }
    }
    
    skill_examples = examples.get(skill, {})
    band_example = skill_examples.get(band)
    
    if not band_example:
        return {
            "success": False,
            "error": f"No example found for {skill} at {band}",
            "available_skills": list(examples.keys()),
            "available_bands": ["band_7", "band_8", "band_9"]
        }
    
    return {
        "success": True,
        "skill": skill,
        "band": band,
        "example": band_example
    }


# ============ NEW READING QUESTION BANK ENDPOINTS (BEFORE DYNAMIC ROUTES) ============

@router.get("/reading/academic/advanced")
async def get_academic_reading_advanced():
    """
    Get all Advanced Academic Reading modules from the new content structure.
    Returns module summaries for Academic track (Band 7.0-9.0).
    """
    from content.reading.academic.reading_academic_advanced import get_all_academic_reading_modules
    
    modules = get_all_academic_reading_modules()
    return {
        "success": True,
        "track": "academic",
        "level": "advanced",
        "band_target": "7.0-9.0",
        "total": len(modules),
        "modules": modules
    }


@router.get("/reading/academic/advanced/{module_id}")
async def get_academic_reading_module(module_id: str):
    """
    Get specific Academic Reading module content.
    Returns full reading passage, questions, vocabulary, and tips.
    """
    from content.reading.academic.reading_academic_advanced import get_academic_reading_by_module
    
    module = get_academic_reading_by_module(module_id)
    
    if not module:
        from content.reading.academic.reading_academic_advanced import get_all_academic_reading_modules
        available = [m["module_id"] for m in get_all_academic_reading_modules()]
        return {
            "success": False,
            "error": f"Module '{module_id}' not found",
            "available_modules": available
        }
    
    return {
        "success": True,
        "track": "academic",
        "module": module
    }


@router.get("/reading/general/advanced")
async def get_general_reading_advanced():
    """
    Get all Advanced General Training Reading modules from the new content structure.
    Returns module summaries for General Training track (Band 7.0-9.0).
    """
    from content.reading.general.reading_general_advanced import get_all_general_reading_modules
    
    modules = get_all_general_reading_modules()
    return {
        "success": True,
        "track": "general",
        "level": "advanced",
        "band_target": "7.0-9.0",
        "total": len(modules),
        "modules": modules
    }


@router.get("/reading/general/advanced/{module_id}")
async def get_general_reading_module(module_id: str):
    """
    Get specific General Training Reading module content.
    Returns full reading passage (policy/contract), questions, vocabulary, and tips.
    """
    from content.reading.general.reading_general_advanced import get_general_reading_by_module
    
    module = get_general_reading_by_module(module_id)
    
    if not module:
        from content.reading.general.reading_general_advanced import get_all_general_reading_modules
        available = [m["module_id"] for m in get_all_general_reading_modules()]
        return {
            "success": False,
            "error": f"Module '{module_id}' not found",
            "available_modules": available
        }
    
    return {
        "success": True,
        "track": "general",
        "module": module
    }


@router.get("/reading/skills")
async def get_reading_skill_categories_new():
    """
    Get all reading skill categories with descriptions.
    Used for skill-based feedback in reading evaluations.
    """
    from content.reading.academic.reading_academic_advanced import get_reading_skill_categories
    
    return {
        "success": True,
        "skills": get_reading_skill_categories()
    }


# ============ MASTERY READING QUESTION BANK ENDPOINTS ============

@router.get("/reading/question-types")
async def get_reading_question_types():
    """
    Get all IELTS Reading question types with descriptions.
    Used for question-type based filtering in Question Bank.
    """
    from content.reading.mastery.reading_mastery_academic import get_reading_question_types
    
    return {
        "success": True,
        "question_types": get_reading_question_types()
    }


@router.get("/reading/topics")
async def get_reading_topics():
    """
    Get all reading topics for filtering.
    """
    from content.reading.mastery.reading_mastery_academic import get_reading_topics
    
    return {
        "success": True,
        "topics": get_reading_topics()
    }


@router.get("/reading/band-levels")
async def get_reading_band_levels():
    """
    Get available band levels for Mastery Reading.
    """
    from content.reading.mastery.reading_mastery_academic import get_mastery_band_levels
    
    return {
        "success": True,
        "band_levels": get_mastery_band_levels()
    }


@router.get("/reading/mastery/academic")
async def get_mastery_academic_reading():
    """
    Get all Mastery Academic Reading modules.
    Supports filtering by topic, question_type, and band.
    """
    from content.reading.mastery.reading_mastery_academic import get_all_mastery_reading_modules
    
    modules = get_all_mastery_reading_modules()
    return {
        "success": True,
        "track": "academic",
        "level": "mastery",
        "band_target": "6.0-7.0",
        "total": len(modules),
        "modules": modules
    }


@router.get("/reading/mastery/academic/{module_id}")
async def get_mastery_academic_module(module_id: str):
    """
    Get specific Mastery Academic Reading module.
    """
    from content.reading.mastery.reading_mastery_academic import get_mastery_reading_by_id
    
    module = get_mastery_reading_by_id(module_id)
    
    if not module:
        from content.reading.mastery.reading_mastery_academic import get_all_mastery_reading_modules
        available = [m["module_id"] for m in get_all_mastery_reading_modules()]
        return {
            "success": False,
            "error": f"Module '{module_id}' not found",
            "available_modules": available
        }
    
    return {
        "success": True,
        "track": "academic",
        "level": "mastery",
        "module": module
    }


@router.get("/reading/mastery/academic/filter/topic/{topic}")
async def get_mastery_academic_by_topic(topic: str):
    """
    Get Mastery Academic Reading modules filtered by topic.
    """
    from content.reading.mastery.reading_mastery_academic import get_mastery_reading_by_topic
    
    modules = get_mastery_reading_by_topic(topic)
    return {
        "success": True,
        "track": "academic",
        "topic": topic,
        "total": len(modules),
        "modules": modules
    }


@router.get("/reading/mastery/academic/filter/question-type/{question_type}")
async def get_mastery_academic_by_question_type(question_type: str):
    """
    Get Mastery Academic Reading modules filtered by question type.
    """
    from content.reading.mastery.reading_mastery_academic import get_mastery_reading_by_question_type
    
    modules = get_mastery_reading_by_question_type(question_type)
    return {
        "success": True,
        "track": "academic",
        "question_type": question_type,
        "total": len(modules),
        "modules": modules
    }


@router.get("/reading/mastery/general")
async def get_mastery_general_reading():
    """
    Get all Mastery General Training Reading modules.
    """
    from content.reading.mastery.reading_mastery_general import get_all_mastery_general_modules
    
    modules = get_all_mastery_general_modules()
    return {
        "success": True,
        "track": "general",
        "level": "mastery",
        "band_target": "6.0-7.0",
        "total": len(modules),
        "modules": modules
    }


@router.get("/reading/mastery/general/{module_id}")
async def get_mastery_general_module(module_id: str):
    """
    Get specific Mastery General Training Reading module.
    """
    from content.reading.mastery.reading_mastery_general import get_mastery_general_by_id
    
    module = get_mastery_general_by_id(module_id)
    
    if not module:
        from content.reading.mastery.reading_mastery_general import get_all_mastery_general_modules
        available = [m["module_id"] for m in get_all_mastery_general_modules()]
        return {
            "success": False,
            "error": f"Module '{module_id}' not found",
            "available_modules": available
        }
    
    return {
        "success": True,
        "track": "general",
        "level": "mastery",
        "module": module
    }


@router.get("/reading/mastery/general/filter/topic/{topic}")
async def get_mastery_general_by_topic(topic: str):
    """
    Get Mastery General Reading modules filtered by topic.
    """
    from content.reading.mastery.reading_mastery_general import get_mastery_general_by_topic
    
    modules = get_mastery_general_by_topic(topic)
    return {
        "success": True,
        "track": "general",
        "topic": topic,
        "total": len(modules),
        "modules": modules
    }


@router.get("/reading/mastery/general/filter/question-type/{question_type}")
async def get_mastery_general_by_question_type(question_type: str):
    """
    Get Mastery General Reading modules filtered by question type.
    """
    from content.reading.mastery.reading_mastery_general import get_mastery_general_by_question_type
    
    modules = get_mastery_general_by_question_type(question_type)
    return {
        "success": True,
        "track": "general",
        "question_type": question_type,
        "total": len(modules),
        "modules": modules
    }


@router.get("/reading/document-types")
async def get_gt_document_types():
    """
    Get all General Training document types.
    """
    from content.reading.mastery.reading_mastery_general import get_gt_document_types as get_doc_types
    
    return {
        "success": True,
        "document_types": get_doc_types()
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
