"""
UNIFIED LEARNING SYSTEM - Data Models
Testmaster Complete English Program
8-Stage pathway from Foundations (Pre-A1) to IELTS Mastery (C2)
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from enum import Enum
import uuid


# ============ ENUMS ============

class StageId(str, Enum):
    FOUNDATIONS = "stage_1_foundations"
    STARTERS = "stage_2_starters"
    MOVERS = "stage_3_movers"
    FLYERS = "stage_4_flyers"
    B1_ACADEMIC = "stage_5_b1"
    B2_ACADEMIC = "stage_6_b2"
    IELTS_FOUNDATION = "stage_7_ielts_foundation"
    IELTS_MASTERY = "stage_8_ielts_mastery"


class ActivityType(str, Enum):
    RETRIEVAL_WARMUP = "retrieval_warmup"
    VOCABULARY = "vocabulary"
    MICRO_GAME_VOCAB = "micro_game_vocab"
    MICRO_READING = "micro_reading"
    GRAMMAR_FOCUS = "grammar_focus"
    MICRO_GAME_GRAMMAR = "micro_game_grammar"
    LISTENING = "listening"
    PRODUCTION = "production"
    EXIT_TICKET = "exit_ticket"
    AUTO_REVIEW = "auto_review"


class VisualStrategy(str, Enum):
    HEAVY = "heavy"  # Every word needs image (Stage 1-3)
    SELECTIVE = "selective"  # Some images (Stage 4-5)
    MINIMAL = "minimal"  # Few images (Stage 6-8)


class ToneStyle(str, Enum):
    PLAYFUL = "playful"  # Stage 1-3
    BALANCED = "balanced"  # Stage 4-6
    ACADEMIC = "academic"  # Stage 7-8


class ProductionType(str, Enum):
    SPEAKING = "speaking"
    WRITING = "writing"


# ============ STAGE MODEL ============

class Stage(BaseModel):
    """Main stage in the unified learning path (1 of 8)"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    stage_id: str  # e.g., "stage_1_foundations"
    number: int  # 1-8
    name: str  # e.g., "Foundations"
    cefr_level: str  # e.g., "Pre-A1"
    total_units: int
    lessons_per_unit: int
    description: str
    target_audience: str
    icon: str  # lucide icon name
    color: str  # hex color
    visual_strategy: str  # heavy | selective | minimal
    tone: str  # playful | balanced | academic
    substages: List[str] = ["A", "B"]
    has_certification_gate: bool = True
    has_booster_mode: bool = True
    unlock_requirements: Optional[Dict[str, Any]] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ============ UNIT MODEL ============

class Unit(BaseModel):
    """Unit within a stage (e.g., Unit 1: Hello!)"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    unit_id: str  # e.g., "stage_1_unit_01"
    stage_id: str  # Parent stage
    number: int
    substage: str  # "A" or "B"
    title: str
    description: str
    total_lessons: int
    order: int
    theme_color: Optional[str] = None
    thumbnail_url: Optional[str] = None
    unlock_requirements: Optional[Dict[str, Any]] = None
    spiral_review_topics: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ============ LESSON MODEL (10-STEP FLOW) ============

class ActivityStep(BaseModel):
    """Single activity step in the 10-step lesson flow"""
    order: int
    type: str  # ActivityType value
    activity_id: str
    icon: str
    label: str
    duration_minutes: int
    is_skippable: bool = False
    production_type: Optional[str] = None  # For production activities
    pass_threshold: Optional[int] = None  # For exit_ticket


class Lesson(BaseModel):
    """Lesson with 10-step scientific flow"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    lesson_id: str  # e.g., "stage_1_unit_01_lesson_01"
    unit_id: str
    stage_id: str
    number: int
    title: str
    description: str
    estimated_duration_minutes: int
    points_reward: int
    activity_flow: List[ActivityStep]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ============ ACTIVITY CONTENT MODELS ============

class VocabularyWord(BaseModel):
    """Single vocabulary word with all data"""
    word_id: str
    word: str
    ipa: str
    definition: str
    example_sentence: str
    image_url: Optional[str] = None
    audio_url: Optional[str] = None
    sentence_audio_url: Optional[str] = None
    difficulty: int = 1  # 1-5 scale


class VocabularyActivity(BaseModel):
    """Vocabulary activity content"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    activity_id: str
    lesson_id: str
    type: str = "vocabulary"
    words: List[VocabularyWord]
    requires_typing: bool = True
    requires_pronunciation: bool = True
    max_attempts: int = 3
    pass_threshold: int = 80
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class WarmupQuestion(BaseModel):
    """Single warmup question"""
    question_id: str
    question_type: str  # "image_recall", "word_meaning", "sentence_complete"
    question_text: str
    image_url: Optional[str] = None
    options: Optional[List[str]] = None
    correct_answer: str
    from_lesson_id: Optional[str] = None  # Reference to source lesson


class RetrievalWarmupActivity(BaseModel):
    """Retrieval warmup activity - activates prior knowledge"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    activity_id: str
    lesson_id: str
    type: str = "retrieval_warmup"
    questions: List[WarmupQuestion]
    time_limit_seconds: int = 180  # 3 minutes
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class MicroReadingActivity(BaseModel):
    """Micro reading activity - contextualize vocabulary"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    activity_id: str
    lesson_id: str
    type: str = "micro_reading"
    passage_text: str  # 60-120 words
    highlighted_words: List[str]  # Vocabulary words to highlight
    comprehension_questions: List[Dict[str, Any]]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class GrammarRule(BaseModel):
    """Grammar rule presentation"""
    rule_id: str
    rule_text: str
    pattern: str  # e.g., "Subject + am/is/are + noun"
    examples: List[Dict[str, str]]  # {"correct": "...", "incorrect": "..."}


class GrammarFocusActivity(BaseModel):
    """Grammar focus activity"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    activity_id: str
    lesson_id: str
    type: str = "grammar_focus"
    rules: List[GrammarRule]
    example_sentences: List[str]
    pattern_highlight: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class MicroGameActivity(BaseModel):
    """Micro game activity (vocab or grammar)"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    activity_id: str
    lesson_id: str
    type: str  # "micro_game_vocab" or "micro_game_grammar"
    game_type: str  # "matching", "active_recall", "speed_drill", "error_hunter"
    items: List[Dict[str, Any]]  # Game-specific items
    time_limit_seconds: int = 300  # 5 minutes max
    scoring: Dict[str, Any] = {"perfect": 90, "good": 70, "pass": 50}
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ListeningActivity(BaseModel):
    """Listening activity"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    activity_id: str
    lesson_id: str
    type: str = "listening"
    audio_url: str
    audio_duration_seconds: int
    transcript: Optional[str] = None
    questions: List[Dict[str, Any]]
    speed: str = "normal"  # "slow", "normal", "fast"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ProductionActivity(BaseModel):
    """Production activity (speaking or writing)"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    activity_id: str
    lesson_id: str
    type: str = "production"
    production_type: str  # "speaking" or "writing"
    prompt: str
    example_response: Optional[str] = None
    evaluation_criteria: List[str] = []
    min_words: Optional[int] = None  # For writing
    max_recording_seconds: Optional[int] = None  # For speaking
    ai_evaluation: bool = False  # Enable AI feedback
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ExitTicketQuestion(BaseModel):
    """Exit ticket question"""
    question_id: str
    question_type: str  # "multiple_choice", "fill_blank", "true_false"
    question_text: str
    options: Optional[List[str]] = None
    correct_answer: str
    covers_activity: str  # Which activity type this tests


class ExitTicketActivity(BaseModel):
    """Exit ticket - quick lesson mastery check"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    activity_id: str
    lesson_id: str
    type: str = "exit_ticket"
    questions: List[ExitTicketQuestion]
    pass_threshold: int = 70  # Must score 70%+ to pass
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ============ USER PROGRESS MODELS ============

class ActivityProgress(BaseModel):
    """Progress on single activity"""
    activity_type: str
    completed: bool = False
    score: Optional[int] = None
    crowns: Optional[int] = None  # 0-3 for games
    time_spent_seconds: int = 0
    skipped: bool = False
    completed_at: Optional[datetime] = None


class LessonProgress(BaseModel):
    """User progress on a lesson"""
    lesson_id: str
    completed: bool = False
    activities_completed: Dict[str, ActivityProgress] = {}
    total_score: Optional[int] = None
    points_earned: int = 0
    crowns: int = 0
    time_spent_minutes: int = 0
    completed_at: Optional[datetime] = None


class UnitProgress(BaseModel):
    """User progress on a unit"""
    unit_id: str
    lessons_completed: int = 0
    total_lessons: int
    average_score: Optional[float] = None
    unlocked: bool = False
    completed: bool = False


class StageProgress(BaseModel):
    """User progress on a stage"""
    stage_id: str
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    substage: str = "A"
    units_completed: int = 0
    lessons_completed: int = 0
    total_lessons: int
    average_score: float = 0
    certification_passed: bool = False


class ReviewQueueItem(BaseModel):
    """Item in spaced repetition queue"""
    item_type: str  # "vocabulary", "grammar"
    item_id: str
    lesson_id: str
    word: Optional[str] = None
    next_review_date: datetime
    review_count: int = 0
    ease_factor: float = 2.5
    interval_days: int = 1


class DailyHabitStats(BaseModel):
    """Daily habit mode stats"""
    today_completed: bool = False
    last_completed: Optional[datetime] = None
    items_reviewed_today: int = 0
    weak_areas: List[str] = []


class Achievement(BaseModel):
    """User achievement"""
    type: str
    earned_at: datetime
    count: int = 1


class UnifiedUserProgress(BaseModel):
    """Complete user progress in unified learning system"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    
    # Current position
    current_stage: int = 1
    current_unit: int = 1
    current_lesson: int = 1
    
    # Gamification
    total_points: int = 0
    global_rank: Optional[int] = None
    daily_streak: int = 0
    longest_streak: int = 0
    
    # Progress tracking
    stage_progress: Dict[str, StageProgress] = {}
    lesson_progress: Dict[str, LessonProgress] = {}
    
    # Spaced repetition
    review_queue: List[ReviewQueueItem] = []
    
    # Daily habit
    daily_habit: DailyHabitStats = DailyHabitStats()
    
    # Achievements
    achievements: List[Achievement] = []
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ============ REQUEST/RESPONSE MODELS ============

class StartLessonRequest(BaseModel):
    user_id: str
    lesson_id: str


class CompleteActivityRequest(BaseModel):
    user_id: str
    lesson_id: str
    activity_type: str
    score: Optional[int] = None
    crowns: Optional[int] = None
    time_spent_seconds: int = 0
    skipped: bool = False


class CompleteLessonRequest(BaseModel):
    user_id: str
    lesson_id: str


class GetProgressRequest(BaseModel):
    user_id: str
    stage_id: Optional[str] = None


class DailyHabitCompleteRequest(BaseModel):
    user_id: str
    items_reviewed: int


class ReviewItemUpdateRequest(BaseModel):
    user_id: str
    item_id: str
    recalled_correctly: bool
