"""
LEARNING PLATFORM MODELS
Complete database schema for Cambridge YLE → CEFR → IELTS pathway
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
import uuid

# ============ LEVEL MODELS ============

class Lesson(BaseModel):
    """Individual lesson within a unit"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    lesson_number: int
    title: str
    description: str
    duration_minutes: int  # Estimated completion time
    content: Dict[str, Any]  # Flexible structure for different lesson types
    # content includes: vocabulary, grammar, reading_passages, listening_audio, exercises, etc.
    lesson_type: str  # vocabulary, grammar, reading, listening, speaking, writing, mixed
    required_for_next: bool = True  # Must complete to unlock next lesson
    
class Quiz(BaseModel):
    """Quiz or exit test"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    quiz_type: str  # unit_quiz, exit_test, mini_assessment
    duration_minutes: int
    passing_score: float  # Percentage needed to pass (0-100)
    questions: List[Dict[str, Any]]
    target_band: Optional[float] = None
    
class Unit(BaseModel):
    """Unit within a level - contains multiple lessons and a quiz"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    unit_number: int
    title: str
    description: str
    learning_objectives: List[str]
    lessons: List[Lesson]
    unit_quiz: Quiz
    estimated_hours: int
    is_locked: bool = True  # Starts locked, unlocked by completing previous unit
    
class Level(BaseModel):
    """Main learning level (e.g., Cambridge YLE Starters, A1, IELTS 5.0)"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    level_code: str  # e.g., "YLE_STARTERS", "A1", "B1", "IELTS_5"
    level_name: str
    level_order: int  # Sequential order in pathway
    description: str
    target_band_range: str  # e.g., "2.0-3.0", "4.0-5.0"
    pathway: str  # "cambridge_yle", "cefr", "ielts"
    units: List[Unit]
    exit_test: Quiz  # Must pass to unlock next level
    total_estimated_hours: int
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    

# ============ USER PROGRESS MODELS ============

class LessonProgress(BaseModel):
    """Tracks user's progress on a specific lesson"""
    lesson_id: str
    completed: bool = False
    completion_date: Optional[datetime] = None
    score: Optional[float] = None  # If lesson has assessment
    time_spent_minutes: int = 0
    notes: Optional[str] = None
    
class QuizAttempt(BaseModel):
    """Tracks quiz attempt"""
    quiz_id: str
    attempt_number: int
    score: float
    passed: bool
    attempted_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    answers: List[Dict[str, Any]]
    feedback: Optional[str] = None
    
class UnitProgress(BaseModel):
    """Tracks user's progress on a specific unit"""
    unit_id: str
    is_unlocked: bool = False
    unlocked_at: Optional[datetime] = None
    lesson_progress: List[LessonProgress] = []
    quiz_attempts: List[QuizAttempt] = []
    completed: bool = False
    completion_date: Optional[datetime] = None
    
class LevelProgress(BaseModel):
    """Tracks user's progress on a specific level"""
    level_id: str
    is_unlocked: bool = False
    unlocked_at: Optional[datetime] = None
    unit_progress: List[UnitProgress] = []
    exit_test_attempts: List[QuizAttempt] = []
    completed: bool = False
    completion_date: Optional[datetime] = None
    current_unit_number: int = 1
    
class UserLearningProgress(BaseModel):
    """Complete user learning progress across all levels"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    current_level_id: Optional[str] = None
    current_unit_id: Optional[str] = None
    current_lesson_id: Optional[str] = None
    level_progress: List[LevelProgress] = []
    total_hours_studied: float = 0.0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_updated: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ============ REQUEST/RESPONSE MODELS ============

class StartLessonRequest(BaseModel):
    user_id: str
    lesson_id: str
    
class CompleteLessonRequest(BaseModel):
    user_id: str
    lesson_id: str
    time_spent_minutes: int
    score: Optional[float] = None
    notes: Optional[str] = None
    
class SubmitQuizRequest(BaseModel):
    user_id: str
    quiz_id: str
    answers: List[Dict[str, Any]]
    time_taken_minutes: int
    
class GetProgressRequest(BaseModel):
    user_id: str
    level_id: Optional[str] = None
    
class UnlockNextRequest(BaseModel):
    user_id: str
    completed_item_id: str  # lesson_id, unit_id, or level_id
    completed_item_type: str  # "lesson", "unit", "level"
