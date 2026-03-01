"""
UNIFIED LEARNING SYSTEM - API Routes
Testmaster Complete English Program
"""

from fastapi import APIRouter, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
import os
import logging

from unified_learning_models import (
    Stage, Unit, Lesson, ActivityStep,
    VocabularyActivity, RetrievalWarmupActivity, MicroReadingActivity,
    GrammarFocusActivity, MicroGameActivity, ListeningActivity,
    ProductionActivity, ExitTicketActivity,
    UnifiedUserProgress, StageProgress, LessonProgress, ActivityProgress,
    ReviewQueueItem, Achievement,
    StartLessonRequest, CompleteActivityRequest, CompleteLessonRequest,
    DailyHabitCompleteRequest, ReviewItemUpdateRequest
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/unified", tags=["Unified Learning"])

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'ielts_ace')]


# ============ STAGE ROUTES ============

@router.get("/stages")
async def get_all_stages():
    """Get all 8 stages in the unified learning path"""
    stages = await db.unified_stages.find({}, {"_id": 0}).sort("number", 1).to_list(10)
    return {"stages": stages, "total": len(stages)}


@router.get("/stages/{stage_id}")
async def get_stage(stage_id: str):
    """Get a specific stage with its units"""
    stage = await db.unified_stages.find_one({"stage_id": stage_id}, {"_id": 0})
    if not stage:
        raise HTTPException(status_code=404, detail="Stage not found")
    
    # Get units for this stage
    units = await db.unified_units.find(
        {"stage_id": stage_id}, {"_id": 0}
    ).sort("order", 1).to_list(20)
    
    stage["units"] = units
    return stage


@router.get("/stages/{stage_id}/units")
async def get_stage_units(stage_id: str):
    """Get all units in a stage"""
    units = await db.unified_units.find(
        {"stage_id": stage_id}, {"_id": 0}
    ).sort("unit_number", 1).to_list(20)
    return {"units": units, "total": len(units)}


# ============ UNIT ROUTES ============

@router.get("/units/{unit_id}")
async def get_unit(unit_id: str):
    """Get a specific unit with its lessons"""
    unit = await db.unified_units.find_one({"unit_id": unit_id}, {"_id": 0})
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")
    
    # Get lessons for this unit
    lessons = await db.unified_lessons.find(
        {"unit_id": unit_id}, {"_id": 0}
    ).sort("number", 1).to_list(10)
    
    unit["lessons"] = lessons
    return unit


# ============ LESSON ROUTES ============

@router.get("/lessons/{lesson_id}")
async def get_lesson(lesson_id: str):
    """Get a lesson with its 10-step activity flow"""
    lesson = await db.unified_lessons.find_one({"lesson_id": lesson_id}, {"_id": 0})
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson


@router.get("/lessons/{lesson_id}/activity/{activity_type}")
async def get_activity_content(lesson_id: str, activity_type: str):
    """Get content for a specific activity in a lesson.
    First checks embedded data in activity_flow, then falls back to separate collections."""
    
    # 1) Try embedded data from lesson's activity_flow
    lesson = await db.unified_lessons.find_one(
        {"lesson_id": lesson_id}, 
        {"_id": 0, "activity_flow": 1}
    )
    if lesson and lesson.get("activity_flow"):
        for act in lesson["activity_flow"]:
            if act.get("type") == activity_type and act.get("data"):
                data = act["data"]
                # Check data has actual content (not all empty)
                if any(v for v in data.values() if v):
                    return data
    
    # 2) Fallback: read from separate collections
    collection_map = {
        "retrieval_warmup": "unified_warmup_activities",
        "vocabulary": "unified_vocabulary_activities",
        "micro_game_vocab": "unified_game_activities",
        "micro_reading": "unified_reading_activities",
        "grammar_focus": "unified_grammar_activities",
        "micro_game_grammar": "unified_game_activities",
        "listening": "unified_listening_activities",
        "listening_task": "unified_listening_activities",
        "production": "unified_production_activities",
        "exit_ticket": "unified_exit_activities",
    }
    
    collection_name = collection_map.get(activity_type)
    if not collection_name:
        raise HTTPException(status_code=400, detail=f"Unknown activity type: {activity_type}")
    
    query = {"lesson_id": lesson_id}
    if activity_type in ["micro_game_vocab", "micro_game_grammar"]:
        query["type"] = activity_type
    
    activity = await db[collection_name].find_one(query, {"_id": 0})
    if not activity:
        raise HTTPException(status_code=404, detail=f"Activity not found: {activity_type} for lesson {lesson_id}")
    
    return activity


@router.get("/cumulative-vocab/{lesson_id}")
async def get_cumulative_vocabulary(lesson_id: str, max_words: int = 20, max_rules: int = 10):
    """Get vocabulary from all lessons up to and including the given lesson_id.
    Randomly selects max_words from previous units for review diversity."""
    import random
    
    parts = lesson_id.split('_')
    stage_id = f"{parts[0]}_{parts[1]}"
    unit_num = int(parts[3])
    lesson_num = int(parts[5])
    
    lesson_ids = []
    for u in range(1, unit_num + 1):
        max_l = lesson_num if u == unit_num else 4
        for l in range(1, max_l + 1):
            lid = f"{stage_id}_unit_{u:02d}_lesson_{l:02d}"
            lesson_ids.append(lid)
    
    # Read from embedded activity_flow data
    lessons = await db.unified_lessons.find(
        {"lesson_id": {"$in": lesson_ids}},
        {"_id": 0, "lesson_id": 1, "activity_flow": 1}
    ).to_list(length=200)
    
    all_words = []
    seen_words = set()
    all_rules = []
    seen_patterns = set()
    
    for lesson_doc in lessons:
        for act in lesson_doc.get("activity_flow", []):
            if act.get("type") == "vocabulary":
                for w in act.get("data", {}).get("words", []):
                    word_key = w.get("word", "").lower()
                    if word_key and word_key not in seen_words:
                        seen_words.add(word_key)
                        all_words.append(w)
            elif act.get("type") == "grammar_focus":
                data = act.get("data", {})
                rule = data.get("rule", "")
                if rule and rule not in seen_patterns:
                    seen_patterns.add(rule)
                    all_rules.append({
                        "pattern": rule,
                        "explanation": data.get("explanation", ""),
                        "examples": data.get("examples", [])
                    })
    
    # Randomly select max_words for review diversity
    total_available = len(all_words)
    if len(all_words) > max_words:
        all_words = random.sample(all_words, max_words)
    if len(all_rules) > max_rules:
        all_rules = random.sample(all_rules, max_rules)
    
    return {
        "words": all_words,
        "grammar_rules": all_rules,
        "total_lessons": len(lesson_ids),
        "total_vocab_available": total_available,
        "selected_count": len(all_words)
    }


# ============ PROGRESS ROUTES ============

@router.get("/progress/{user_id}")
async def get_user_progress(user_id: str):
    """Get user's overall progress in unified learning system"""
    progress = await db.unified_user_progress.find_one({"user_id": user_id}, {"_id": 0})
    
    if not progress:
        # Create new progress record
        progress = UnifiedUserProgress(user_id=user_id).model_dump()
        progress["created_at"] = progress["created_at"].isoformat()
        progress["updated_at"] = progress["updated_at"].isoformat()
        await db.unified_user_progress.insert_one(progress)
        progress.pop("_id", None)
    
    return progress


@router.post("/progress/activity")
async def complete_activity(request: CompleteActivityRequest):
    """Mark an activity as complete and update progress"""
    
    # Get or create user progress
    progress = await db.unified_user_progress.find_one({"user_id": request.user_id})
    if not progress:
        progress = UnifiedUserProgress(user_id=request.user_id).model_dump()
        progress["created_at"] = progress["created_at"].isoformat()
        progress["updated_at"] = progress["updated_at"].isoformat()
        await db.unified_user_progress.insert_one(progress)
    
    # Update lesson progress
    lesson_key = request.lesson_id
    lesson_progress = progress.get("lesson_progress", {}).get(lesson_key, {
        "lesson_id": request.lesson_id,
        "completed": False,
        "activities_completed": {},
        "points_earned": 0,
        "crowns": 0,
        "time_spent_minutes": 0
    })
    
    # Update activity
    activity_progress = {
        "activity_type": request.activity_type,
        "completed": not request.skipped,
        "score": request.score,
        "crowns": request.crowns,
        "time_spent_seconds": request.time_spent_seconds,
        "skipped": request.skipped,
        "completed_at": datetime.now(timezone.utc).isoformat()
    }
    
    lesson_progress["activities_completed"][request.activity_type] = activity_progress
    lesson_progress["time_spent_minutes"] += request.time_spent_seconds // 60
    
    # Calculate crowns from games
    if request.crowns:
        lesson_progress["crowns"] = max(lesson_progress.get("crowns", 0), request.crowns)
    
    # Update in DB
    await db.unified_user_progress.update_one(
        {"user_id": request.user_id},
        {
            "$set": {
                f"lesson_progress.{lesson_key}": lesson_progress,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    return {"success": True, "lesson_progress": lesson_progress}


@router.post("/progress/lesson")
async def complete_lesson(request: CompleteLessonRequest):
    """Mark a lesson as complete"""
    
    # Get lesson to get points reward
    lesson = await db.unified_lessons.find_one({"lesson_id": request.lesson_id}, {"_id": 0})
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    points_reward = lesson.get("points_reward", 50)
    
    # Update user progress
    now = datetime.now(timezone.utc).isoformat()
    
    result = await db.unified_user_progress.update_one(
        {"user_id": request.user_id},
        {
            "$set": {
                f"lesson_progress.{request.lesson_id}.completed": True,
                f"lesson_progress.{request.lesson_id}.completed_at": now,
                f"lesson_progress.{request.lesson_id}.points_earned": points_reward,
                "updated_at": now
            },
            "$inc": {
                "total_points": points_reward
            }
        }
    )
    
    # Add vocabulary words to review queue
    vocab_activity = await db.unified_vocabulary_activities.find_one(
        {"lesson_id": request.lesson_id}, {"_id": 0}
    )
    
    if vocab_activity and vocab_activity.get("words"):
        review_items = []
        for word_data in vocab_activity["words"]:
            review_items.append({
                "item_type": "vocabulary",
                "item_id": word_data["word_id"],
                "lesson_id": request.lesson_id,
                "word": word_data["word"],
                "next_review_date": (datetime.now(timezone.utc) + timedelta(days=1)).isoformat(),
                "review_count": 0,
                "ease_factor": 2.5,
                "interval_days": 1
            })
        
        await db.unified_user_progress.update_one(
            {"user_id": request.user_id},
            {"$push": {"review_queue": {"$each": review_items}}}
        )
    
    return {"success": True, "points_awarded": points_reward}


# ============ GAMIFICATION ROUTES ============

@router.get("/leaderboard")
async def get_leaderboard(limit: int = 50):
    """Get global leaderboard"""
    leaders = await db.unified_user_progress.find(
        {}, {"_id": 0, "user_id": 1, "total_points": 1, "daily_streak": 1}
    ).sort("total_points", -1).limit(limit).to_list(limit)
    
    # Enrich with user names
    for i, leader in enumerate(leaders):
        user = await db.users.find_one({"id": leader["user_id"]}, {"_id": 0, "name": 1})
        leader["rank"] = i + 1
        leader["name"] = user.get("name", "Anonymous") if user else "Anonymous"
    
    return {"leaderboard": leaders}


@router.get("/leaderboard/stage/{stage_id}")
async def get_stage_leaderboard(stage_id: str, limit: int = 50):
    """Get leaderboard for a specific stage"""
    # This would require more complex aggregation based on stage progress
    # For now, return global leaderboard filtered by users in that stage
    leaders = await db.unified_user_progress.find(
        {f"stage_progress.{stage_id}": {"$exists": True}},
        {"_id": 0, "user_id": 1, "total_points": 1}
    ).sort("total_points", -1).limit(limit).to_list(limit)
    
    for i, leader in enumerate(leaders):
        user = await db.users.find_one({"id": leader["user_id"]}, {"_id": 0, "name": 1})
        leader["rank"] = i + 1
        leader["name"] = user.get("name", "Anonymous") if user else "Anonymous"
    
    return {"leaderboard": leaders, "stage_id": stage_id}


@router.get("/achievements/{user_id}")
async def get_user_achievements(user_id: str):
    """Get user's achievements"""
    progress = await db.unified_user_progress.find_one(
        {"user_id": user_id},
        {"_id": 0, "achievements": 1}
    )
    
    if not progress:
        return {"achievements": []}
    
    return {"achievements": progress.get("achievements", [])}


# ============ DAILY HABIT ROUTES ============

@router.get("/daily-habit/{user_id}/today")
async def get_daily_habit_items(user_id: str):
    """Get today's daily habit practice items"""
    progress = await db.unified_user_progress.find_one(
        {"user_id": user_id},
        {"_id": 0, "review_queue": 1, "daily_habit": 1}
    )
    
    if not progress:
        return {"items": [], "already_completed": False}
    
    # Check if already completed today
    daily_habit = progress.get("daily_habit", {})
    if daily_habit.get("today_completed"):
        last_completed = daily_habit.get("last_completed")
        if last_completed:
            last_date = datetime.fromisoformat(last_completed.replace("Z", "+00:00"))
            if last_date.date() == datetime.now(timezone.utc).date():
                return {"items": [], "already_completed": True}
    
    # Get items due for review
    now = datetime.now(timezone.utc)
    review_queue = progress.get("review_queue", [])
    
    due_items = []
    for item in review_queue:
        next_review = datetime.fromisoformat(item["next_review_date"].replace("Z", "+00:00"))
        if next_review <= now:
            due_items.append(item)
    
    # Limit to 5-10 items
    due_items = due_items[:10]
    
    return {
        "items": due_items,
        "already_completed": False,
        "streak": progress.get("daily_streak", 0)
    }


@router.post("/daily-habit/complete")
async def complete_daily_habit(request: DailyHabitCompleteRequest):
    """Mark daily habit as complete"""
    now = datetime.now(timezone.utc)
    
    # Get current progress
    progress = await db.unified_user_progress.find_one({"user_id": request.user_id})
    
    if not progress:
        raise HTTPException(status_code=404, detail="User progress not found")
    
    # Calculate streak
    current_streak = progress.get("daily_streak", 0)
    longest_streak = progress.get("longest_streak", 0)
    
    daily_habit = progress.get("daily_habit", {})
    last_completed = daily_habit.get("last_completed")
    
    if last_completed:
        last_date = datetime.fromisoformat(last_completed.replace("Z", "+00:00")).date()
        today = now.date()
        yesterday = today - timedelta(days=1)
        
        if last_date == yesterday:
            # Continuing streak
            current_streak += 1
        elif last_date < yesterday:
            # Streak broken
            current_streak = 1
        # If last_date == today, don't change streak
    else:
        current_streak = 1
    
    longest_streak = max(longest_streak, current_streak)
    
    # Award streak bonus points
    bonus_points = 0
    if current_streak == 7:
        bonus_points = 50
    elif current_streak == 30:
        bonus_points = 200
    elif current_streak == 100:
        bonus_points = 500
    
    # Update progress
    await db.unified_user_progress.update_one(
        {"user_id": request.user_id},
        {
            "$set": {
                "daily_habit.today_completed": True,
                "daily_habit.last_completed": now.isoformat(),
                "daily_habit.items_reviewed_today": request.items_reviewed,
                "daily_streak": current_streak,
                "longest_streak": longest_streak,
                "updated_at": now.isoformat()
            },
            "$inc": {
                "total_points": bonus_points
            }
        }
    )
    
    return {
        "success": True,
        "streak": current_streak,
        "longest_streak": longest_streak,
        "bonus_points": bonus_points
    }


@router.get("/daily-habit/{user_id}/streak")
async def get_streak_info(user_id: str):
    """Get user's streak information"""
    progress = await db.unified_user_progress.find_one(
        {"user_id": user_id},
        {"_id": 0, "daily_streak": 1, "longest_streak": 1, "daily_habit": 1}
    )
    
    if not progress:
        return {"daily_streak": 0, "longest_streak": 0}
    
    return {
        "daily_streak": progress.get("daily_streak", 0),
        "longest_streak": progress.get("longest_streak", 0),
        "last_completed": progress.get("daily_habit", {}).get("last_completed")
    }


# ============ SPACED REPETITION ROUTES ============

@router.get("/review-queue/{user_id}")
async def get_review_queue(user_id: str):
    """Get items due for review"""
    progress = await db.unified_user_progress.find_one(
        {"user_id": user_id},
        {"_id": 0, "review_queue": 1}
    )
    
    if not progress:
        return {"items": [], "total_due": 0}
    
    now = datetime.now(timezone.utc)
    review_queue = progress.get("review_queue", [])
    
    due_items = []
    upcoming_items = []
    
    for item in review_queue:
        next_review = datetime.fromisoformat(item["next_review_date"].replace("Z", "+00:00"))
        if next_review <= now:
            due_items.append(item)
        elif next_review <= now + timedelta(days=7):
            upcoming_items.append(item)
    
    return {
        "due_items": due_items,
        "upcoming_items": upcoming_items[:10],
        "total_due": len(due_items)
    }


@router.post("/review-queue/update")
async def update_review_item(request: ReviewItemUpdateRequest):
    """Update a review item after practice (spaced repetition algorithm)"""
    
    progress = await db.unified_user_progress.find_one({"user_id": request.user_id})
    if not progress:
        raise HTTPException(status_code=404, detail="User progress not found")
    
    review_queue = progress.get("review_queue", [])
    
    # Find the item
    item_index = None
    for i, item in enumerate(review_queue):
        if item["item_id"] == request.item_id:
            item_index = i
            break
    
    if item_index is None:
        raise HTTPException(status_code=404, detail="Review item not found")
    
    item = review_queue[item_index]
    
    # Apply SM-2 algorithm
    ease_factor = item.get("ease_factor", 2.5)
    interval = item.get("interval_days", 1)
    review_count = item.get("review_count", 0)
    
    if request.recalled_correctly:
        if review_count == 0:
            interval = 1
        elif review_count == 1:
            interval = 6
        else:
            interval = int(interval * ease_factor)
        
        ease_factor = ease_factor + 0.1
        review_count += 1
    else:
        interval = 1
        ease_factor = max(1.3, ease_factor - 0.2)
    
    # Update item
    now = datetime.now(timezone.utc)
    next_review = now + timedelta(days=interval)
    
    await db.unified_user_progress.update_one(
        {"user_id": request.user_id, "review_queue.item_id": request.item_id},
        {
            "$set": {
                "review_queue.$.next_review_date": next_review.isoformat(),
                "review_queue.$.ease_factor": ease_factor,
                "review_queue.$.interval_days": interval,
                "review_queue.$.review_count": review_count,
                "updated_at": now.isoformat()
            }
        }
    )
    
    return {
        "success": True,
        "next_review_date": next_review.isoformat(),
        "interval_days": interval
    }



# ============ TTS ROUTES ============

from pydantic import BaseModel as PydanticBaseModel

class TTSRequest(PydanticBaseModel):
    text: str

@router.post("/tts/generate")
async def generate_tts(request: TTSRequest):
    """Generate TTS audio for a given text using ElevenLabs"""
    try:
        from services.tts_service import get_tts_service
        tts = get_tts_service()
        audio_url = tts.generate_audio(request.text)
        if not audio_url:
            raise HTTPException(status_code=500, detail="TTS generation failed")
        return {"audio_url": audio_url, "text": request.text}
    except ImportError:
        raise HTTPException(status_code=500, detail="TTS service not available")
    except Exception as e:
        logger.error(f"TTS error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
