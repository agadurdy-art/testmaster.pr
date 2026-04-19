"""
LEARNING PLATFORM API ROUTES
Endpoints for the complete Cambridge YLE → CEFR → IELTS learning platform
"""

from fastapi import APIRouter, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import os
from dotenv import load_dotenv
from pathlib import Path

from learning_platform_models import (
    Level, Unit, Lesson, Quiz,
    UserLearningProgress, LevelProgress, UnitProgress, LessonProgress, QuizAttempt,
    StartLessonRequest, CompleteLessonRequest, SubmitQuizRequest, GetProgressRequest, UnlockNextRequest
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

router = APIRouter(prefix="/api/learning-platform", tags=["learning_platform"])

# ============ LEVEL & CURRICULUM ENDPOINTS ============

@router.get("/levels")
async def get_all_levels():
    """Get all learning levels in the pathway"""
    try:
        levels = await db.learning_levels.find({}, {"_id": 0}).sort("level_order", 1).to_list(1000)
        return {"levels": levels}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch levels: {str(e)}")

@router.get("/levels/{level_id}")
async def get_level_details(level_id: str, user_id: Optional[str] = None):
    """Get detailed information about a specific level including units"""
    try:
        level = await db.learning_levels.find_one({"id": level_id}, {"_id": 0})
        if not level:
            raise HTTPException(status_code=404, detail="Level not found")
        
        # If user_id provided, include user's progress for this level
        if user_id:
            user_progress = await db.user_learning_progress.find_one({"user_id": user_id}, {"_id": 0})
            if user_progress:
                # Find this level's progress
                level_prog = next((lp for lp in user_progress.get("level_progress", []) if lp["level_id"] == level_id), None)
                level["user_progress"] = level_prog
        
        return level
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch level details: {str(e)}")

@router.get("/units/{unit_id}")
async def get_unit_details(unit_id: str, user_id: Optional[str] = None):
    """Get detailed information about a specific unit including lessons"""
    try:
        # Find the level that contains this unit
        level = await db.learning_levels.find_one({"units.id": unit_id}, {"_id": 0})
        if not level:
            raise HTTPException(status_code=404, detail="Unit not found")
        
        # Extract the specific unit
        unit = next((u for u in level["units"] if u["id"] == unit_id), None)
        if not unit:
            raise HTTPException(status_code=404, detail="Unit not found")
        
        # If user_id provided, include user's progress for this unit
        if user_id:
            user_progress = await db.user_learning_progress.find_one({"user_id": user_id}, {"_id": 0})
            if user_progress:
                level_prog = next((lp for lp in user_progress.get("level_progress", []) if lp["level_id"] == level["id"]), None)
                if level_prog:
                    unit_prog = next((up for up in level_prog.get("unit_progress", []) if up["unit_id"] == unit_id), None)
                    unit["user_progress"] = unit_prog
        
        return unit
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch unit details: {str(e)}")

@router.get("/lessons/{lesson_id}")
async def get_lesson_content(lesson_id: str, user_id: Optional[str] = None):
    """Get detailed content for a specific lesson"""
    try:
        # Find the level and unit that contains this lesson
        level = await db.learning_levels.find_one({"units.lessons.id": lesson_id}, {"_id": 0})
        if not level:
            raise HTTPException(status_code=404, detail="Lesson not found")
        
        # Extract the specific lesson
        lesson = None
        unit_id = None
        for unit in level["units"]:
            for les in unit["lessons"]:
                if les["id"] == lesson_id:
                    lesson = les
                    unit_id = unit["id"]
                    break
            if lesson:
                break
        
        if not lesson:
            raise HTTPException(status_code=404, detail="Lesson not found")
        
        # Check if user has access to this lesson
        if user_id:
            user_progress = await db.user_learning_progress.find_one({"user_id": user_id}, {"_id": 0})
            if user_progress:
                # Check if lesson is unlocked
                level_prog = next((lp for lp in user_progress.get("level_progress", []) if lp["level_id"] == level["id"]), None)
                if level_prog:
                    unit_prog = next((up for up in level_prog.get("unit_progress", []) if up["unit_id"] == unit_id), None)
                    if unit_prog:
                        lesson_prog = next((lsp for lsp in unit_prog.get("lesson_progress", []) if lsp["lesson_id"] == lesson_id), None)
                        lesson["user_progress"] = lesson_prog
                        lesson["is_unlocked"] = unit_prog.get("is_unlocked", False)
        
        return lesson
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch lesson content: {str(e)}")

@router.get("/quizzes/{quiz_id}")
async def get_quiz(quiz_id: str):
    """Get quiz details"""
    try:
        # Find quiz in levels structure
        level = await db.learning_levels.find_one({
            "$or": [
                {"units.unit_quiz.id": quiz_id},
                {"exit_test.id": quiz_id}
            ]
        }, {"_id": 0})
        
        if not level:
            raise HTTPException(status_code=404, detail="Quiz not found")
        
        # Extract quiz
        quiz = None
        if level.get("exit_test", {}).get("id") == quiz_id:
            quiz = level["exit_test"]
        else:
            for unit in level["units"]:
                if unit.get("unit_quiz", {}).get("id") == quiz_id:
                    quiz = unit["unit_quiz"]
                    break
        
        if not quiz:
            raise HTTPException(status_code=404, detail="Quiz not found")
        
        # Don't send answers in the response
        quiz_copy = quiz.copy()
        if "questions" in quiz_copy:
            for q in quiz_copy["questions"]:
                if "correct_answer" in q:
                    del q["correct_answer"]
        
        return quiz_copy
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch quiz: {str(e)}")


# ============ USER PROGRESS ENDPOINTS ============

@router.get("/progress/{user_id}")
async def get_user_progress(user_id: str, level_id: Optional[str] = None):
    """Get user's learning progress"""
    try:
        user_progress = await db.user_learning_progress.find_one({"user_id": user_id}, {"_id": 0})
        
        if not user_progress:
            # Initialize progress for new user
            user_progress = {
                "user_id": user_id,
                "current_level_id": None,
                "current_unit_id": None,
                "current_lesson_id": None,
                "level_progress": [],
                "total_hours_studied": 0.0,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "last_updated": datetime.now(timezone.utc).isoformat()
            }
            await db.user_learning_progress.insert_one(user_progress)
            user_progress.pop("_id", None)
        
        # If specific level requested, filter to that level
        if level_id and user_progress.get("level_progress"):
            level_prog = next((lp for lp in user_progress["level_progress"] if lp["level_id"] == level_id), None)
            return {"level_progress": level_prog} if level_prog else {"level_progress": None}
        
        return user_progress
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch user progress: {str(e)}")

@router.post("/lessons/start")
async def start_lesson(request: StartLessonRequest):
    """Mark a lesson as started"""
    try:
        user_progress = await db.user_learning_progress.find_one({"user_id": request.user_id})
        
        if not user_progress:
            raise HTTPException(status_code=404, detail="User progress not found")
        
        # Update last_updated
        await db.user_learning_progress.update_one(
            {"user_id": request.user_id},
            {
                "$set": {
                    "current_lesson_id": request.lesson_id,
                    "last_updated": datetime.now(timezone.utc).isoformat()
                }
            }
        )
        
        return {"message": "Lesson started", "lesson_id": request.lesson_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start lesson: {str(e)}")

@router.post("/lessons/complete")
async def complete_lesson(request: CompleteLessonRequest):
    """Mark a lesson as completed and unlock next content"""
    try:
        # Find the lesson in the curriculum
        level = await db.learning_levels.find_one({"units.lessons.id": request.lesson_id}, {"_id": 0})
        if not level:
            raise HTTPException(status_code=404, detail="Lesson not found")
        
        # Find unit and lesson
        unit_id = None
        lesson = None
        lesson_index = None
        for unit in level["units"]:
            for idx, les in enumerate(unit["lessons"]):
                if les["id"] == request.lesson_id:
                    unit_id = unit["id"]
                    lesson = les
                    lesson_index = idx
                    break
            if lesson:
                break
        
        # Get or create user progress
        user_progress = await db.user_learning_progress.find_one({"user_id": request.user_id})
        if not user_progress:
            # Initialize new progress
            user_progress = {
                "user_id": request.user_id,
                "current_level_id": level["id"],
                "current_unit_id": unit_id,
                "current_lesson_id": request.lesson_id,
                "level_progress": [],
                "total_hours_studied": 0.0,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "last_updated": datetime.now(timezone.utc).isoformat()
            }
            await db.user_learning_progress.insert_one(user_progress)
        
        # Update lesson progress
        level_prog = next((lp for lp in user_progress.get("level_progress", []) if lp["level_id"] == level["id"]), None)
        if not level_prog:
            level_prog = {
                "level_id": level["id"],
                "is_unlocked": True,
                "unlocked_at": datetime.now(timezone.utc).isoformat(),
                "unit_progress": [],
                "exit_test_attempts": [],
                "completed": False,
                "current_unit_number": 1
            }
            user_progress.setdefault("level_progress", []).append(level_prog)
        
        unit_prog = next((up for up in level_prog.get("unit_progress", []) if up["unit_id"] == unit_id), None)
        if not unit_prog:
            unit_prog = {
                "unit_id": unit_id,
                "is_unlocked": True,
                "unlocked_at": datetime.now(timezone.utc).isoformat(),
                "lesson_progress": [],
                "quiz_attempts": [],
                "completed": False
            }
            level_prog.setdefault("unit_progress", []).append(unit_prog)
        
        # Mark lesson as completed
        lesson_prog = next((lsp for lsp in unit_prog.get("lesson_progress", []) if lsp["lesson_id"] == request.lesson_id), None)
        if not lesson_prog:
            lesson_prog = {
                "lesson_id": request.lesson_id,
                "completed": False,
                "completion_date": None,
                "score": None,
                "time_spent_minutes": 0,
                "notes": None
            }
            unit_prog.setdefault("lesson_progress", []).append(lesson_prog)
        
        lesson_prog["completed"] = True
        lesson_prog["completion_date"] = datetime.now(timezone.utc).isoformat()
        lesson_prog["time_spent_minutes"] = request.time_spent_minutes
        lesson_prog["score"] = request.score
        lesson_prog["notes"] = request.notes
        
        # Update total hours
        user_progress["total_hours_studied"] = user_progress.get("total_hours_studied", 0) + (request.time_spent_minutes / 60)
        user_progress["last_updated"] = datetime.now(timezone.utc).isoformat()
        
        # Unlock next lesson if this lesson requires completion for next
        if lesson.get("required_for_next", True) and lesson_index is not None:
            # Get the unit containing this lesson
            current_unit = next((u for u in level["units"] if u["id"] == unit_id), None)
            if current_unit and lesson_index < len(current_unit["lessons"]) - 1:
                # There's a next lesson - mark as started
                next_lesson_id = current_unit["lessons"][lesson_index + 1]["id"]
                user_progress["current_lesson_id"] = next_lesson_id
        
        # Save updated progress
        await db.user_learning_progress.update_one(
            {"user_id": request.user_id},
            {"$set": user_progress}
        )
        
        return {
            "message": "Lesson completed",
            "lesson_id": request.lesson_id,
            "next_lesson_unlocked": lesson.get("required_for_next", True)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to complete lesson: {str(e)}")

@router.post("/quizzes/submit")
async def submit_quiz(request: SubmitQuizRequest):
    """Submit quiz and evaluate"""
    try:
        # Find the quiz
        level = await db.learning_levels.find_one({
            "$or": [
                {"units.unit_quiz.id": request.quiz_id},
                {"exit_test.id": request.quiz_id}
            ]
        }, {"_id": 0})
        
        if not level:
            raise HTTPException(status_code=404, detail="Quiz not found")
        
        # Extract quiz
        quiz = None
        is_exit_test = False
        unit_id = None
        
        if level.get("exit_test", {}).get("id") == request.quiz_id:
            quiz = level["exit_test"]
            is_exit_test = True
        else:
            for unit in level["units"]:
                if unit.get("unit_quiz", {}).get("id") == request.quiz_id:
                    quiz = unit["unit_quiz"]
                    unit_id = unit["id"]
                    break
        
        if not quiz:
            raise HTTPException(status_code=404, detail="Quiz not found")
        
        # Evaluate answers
        correct_count = 0
        total_questions = len(quiz["questions"])
        feedback = []
        
        for answer in request.answers:
            question_id = answer.get("question_id")
            user_answer = answer.get("answer")
            
            question = next((q for q in quiz["questions"] if q.get("id") == question_id), None)
            if question:
                correct_answer = question.get("correct_answer")
                is_correct = user_answer == correct_answer
                if is_correct:
                    correct_count += 1
                
                feedback.append({
                    "question_id": question_id,
                    "correct": is_correct,
                    "user_answer": user_answer,
                    "correct_answer": correct_answer
                })
        
        score = (correct_count / total_questions * 100) if total_questions > 0 else 0
        passed = score >= quiz.get("passing_score", 70)
        
        # Get user progress
        user_progress = await db.user_learning_progress.find_one({"user_id": request.user_id})
        if not user_progress:
            raise HTTPException(status_code=404, detail="User progress not found")
        
        # Create quiz attempt
        quiz_attempt = {
            "quiz_id": request.quiz_id,
            "attempt_number": 1,  # We'll calculate this
            "score": score,
            "passed": passed,
            "attempted_at": datetime.now(timezone.utc).isoformat(),
            "answers": request.answers,
            "feedback": f"You scored {correct_count}/{total_questions} ({score:.1f}%). " + ("You passed!" if passed else "Keep practicing!")
        }
        
        # Update progress based on quiz type
        level_prog = next((lp for lp in user_progress.get("level_progress", []) if lp["level_id"] == level["id"]), None)
        if not level_prog:
            raise HTTPException(status_code=400, detail="Level not unlocked yet")
        
        if is_exit_test:
            # Exit test - add attempt
            level_prog.setdefault("exit_test_attempts", []).append(quiz_attempt)
            if passed:
                level_prog["completed"] = True
                level_prog["completion_date"] = datetime.now(timezone.utc).isoformat()
                
                # Unlock next level
                next_level = await db.learning_levels.find_one({"level_order": level["level_order"] + 1}, {"_id": 0})
                if next_level:
                    # Check if next level progress exists
                    next_level_prog = next((lp for lp in user_progress.get("level_progress", []) if lp["level_id"] == next_level["id"]), None)
                    if not next_level_prog:
                        next_level_prog = {
                            "level_id": next_level["id"],
                            "is_unlocked": True,
                            "unlocked_at": datetime.now(timezone.utc).isoformat(),
                            "unit_progress": [{
                                "unit_id": next_level["units"][0]["id"],
                                "is_unlocked": True,
                                "unlocked_at": datetime.now(timezone.utc).isoformat(),
                                "lesson_progress": [],
                                "quiz_attempts": [],
                                "completed": False
                            }],
                            "exit_test_attempts": [],
                            "completed": False,
                            "current_unit_number": 1
                        }
                        user_progress["level_progress"].append(next_level_prog)
                        user_progress["current_level_id"] = next_level["id"]
        else:
            # Unit quiz
            unit_prog = next((up for up in level_prog.get("unit_progress", []) if up["unit_id"] == unit_id), None)
            if not unit_prog:
                raise HTTPException(status_code=400, detail="Unit not unlocked yet")
            
            # Calculate attempt number
            quiz_attempt["attempt_number"] = len(unit_prog.get("quiz_attempts", [])) + 1
            unit_prog.setdefault("quiz_attempts", []).append(quiz_attempt)
            
            if passed:
                unit_prog["completed"] = True
                unit_prog["completion_date"] = datetime.now(timezone.utc).isoformat()
                
                # Unlock next unit
                current_unit_number = next((u["unit_number"] for u in level["units"] if u["id"] == unit_id), None)
                if current_unit_number:
                    next_unit = next((u for u in level["units"] if u["unit_number"] == current_unit_number + 1), None)
                    if next_unit:
                        # Check if next unit progress exists
                        next_unit_prog = next((up for up in level_prog.get("unit_progress", []) if up["unit_id"] == next_unit["id"]), None)
                        if not next_unit_prog:
                            next_unit_prog = {
                                "unit_id": next_unit["id"],
                                "is_unlocked": True,
                                "unlocked_at": datetime.now(timezone.utc).isoformat(),
                                "lesson_progress": [],
                                "quiz_attempts": [],
                                "completed": False
                            }
                            level_prog["unit_progress"].append(next_unit_prog)
                            user_progress["current_unit_id"] = next_unit["id"]
                            level_prog["current_unit_number"] = current_unit_number + 1
        
        # Update user progress
        user_progress["last_updated"] = datetime.now(timezone.utc).isoformat()
        await db.user_learning_progress.update_one(
            {"user_id": request.user_id},
            {"$set": user_progress}
        )
        
        return {
            "score": score,
            "passed": passed,
            "correct": correct_count,
            "total": total_questions,
            "feedback": feedback,
            "attempt_number": quiz_attempt["attempt_number"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit quiz: {str(e)}")


# Export router for integration in server.py
__all__ = ["router"]
