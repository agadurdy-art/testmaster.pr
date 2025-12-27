"""
IELTS Question Bank - Database Models & Schemas
================================================
This module defines all database schemas for the IELTS Question Bank system.
Follows Cambridge IELTS standards with band-level scaling.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
from enum import Enum
from datetime import datetime

# ============ ENUMS ============

class Skill(str, Enum):
    READING = "reading"
    LISTENING = "listening"
    WRITING = "writing"
    SPEAKING = "speaking"
    GRAMMAR_VOCAB = "grammar_vocab"

class BandLevel(str, Enum):
    BAND_4_5 = "4.0-5.0"
    BAND_5_6 = "5.5-6.5"
    BAND_7_9 = "7.0-9.0"

class Topic(str, Enum):
    EDUCATION = "education"
    HEALTH = "health"
    TECHNOLOGY = "technology"
    ENVIRONMENT = "environment"
    WORK_EMPLOYMENT = "work_employment"
    TRAVEL_CULTURE = "travel_culture"
    SCIENCE_RESEARCH = "science_research"
    SOCIETY_GOVERNMENT = "society_government"
    MEDIA_ENTERTAINMENT = "media_entertainment"
    FOOD_NUTRITION = "food_nutrition"
    HOUSING_ARCHITECTURE = "housing_architecture"
    CRIME_LAW = "crime_law"
    MONEY_FINANCE = "money_finance"
    SPORTS_FITNESS = "sports_fitness"
    FAMILY_RELATIONSHIPS = "family_relationships"
    LANGUAGE_COMMUNICATION = "language_communication"
    ART_CULTURE = "art_culture"
    SHOPPING_CONSUMERISM = "shopping_consumerism"

# ============ READING QUESTION TYPES ============

class ReadingQuestionType(str, Enum):
    MULTIPLE_CHOICE = "multiple_choice"
    TRUE_FALSE_NG = "true_false_ng"
    YES_NO_NG = "yes_no_ng"
    MATCHING_HEADINGS = "matching_headings"
    MATCHING_INFORMATION = "matching_information"
    SENTENCE_COMPLETION = "sentence_completion"
    SUMMARY_COMPLETION = "summary_completion"
    DIAGRAM_TABLE_COMPLETION = "diagram_table_completion"
    SHORT_ANSWER = "short_answer"

# ============ LISTENING QUESTION TYPES ============

class ListeningQuestionType(str, Enum):
    MULTIPLE_CHOICE = "multiple_choice"
    FORM_COMPLETION = "form_completion"
    NOTE_COMPLETION = "note_completion"
    TABLE_COMPLETION = "table_completion"
    SENTENCE_COMPLETION = "sentence_completion"
    MATCHING = "matching"
    MAP_LABELING = "map_labeling"
    PLAN_LABELING = "plan_labeling"
    DIAGRAM_LABELING = "diagram_labeling"

# ============ WRITING TASK TYPES ============

class WritingTask1Type(str, Enum):
    LINE_GRAPH = "line_graph"
    BAR_CHART = "bar_chart"
    PIE_CHART = "pie_chart"
    TABLE = "table"
    MIXED_CHART = "mixed_chart"
    PROCESS_DIAGRAM = "process_diagram"
    MAP = "map"
    LETTER_FORMAL = "letter_formal"
    LETTER_SEMI_FORMAL = "letter_semi_formal"
    LETTER_INFORMAL = "letter_informal"

class WritingTask2Type(str, Enum):
    OPINION = "opinion"
    DISCUSSION = "discussion"
    ADVANTAGE_DISADVANTAGE = "advantage_disadvantage"
    PROBLEM_SOLUTION = "problem_solution"
    MIXED = "mixed"

# ============ SPEAKING PART TYPES ============

class SpeakingPartType(str, Enum):
    PART_1 = "part_1"  # Short personal questions
    PART_2 = "part_2"  # Cue card (1 min prep + 2 min talk)
    PART_3 = "part_3"  # Abstract discussion

# ============ QUESTION MODELS ============

class QuestionBase(BaseModel):
    """Base model for all questions"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    skill: Skill
    topic: Topic
    band_level: BandLevel
    time_recommendation: int  # seconds
    tags: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

class ReadingPassage(BaseModel):
    """Reading passage with questions"""
    id: str
    title: str
    passage_text: str
    word_count: int
    topic: Topic
    band_level: BandLevel
    source_note: Optional[str] = None  # For attribution

class ReadingQuestion(QuestionBase):
    """Individual reading question"""
    passage_id: str
    question_type: ReadingQuestionType
    question_text: str
    options: Optional[List[str]] = None  # For MC, matching
    correct_answer: Union[str, List[str]]
    explanation: str
    paragraph_reference: Optional[str] = None  # Which paragraph the answer is in

class ListeningSection(BaseModel):
    """Listening section (1 of 4 in a test)"""
    id: str
    section_number: int  # 1, 2, 3, or 4
    title: str
    audio_url: str
    audio_duration: int  # seconds
    transcript: str
    speakers: List[Dict[str, str]]  # [{"role": "Student", "voice_id": "xxx"}]
    topic: Topic
    band_level: BandLevel
    scenario_description: str

class ListeningQuestion(QuestionBase):
    """Individual listening question"""
    section_id: str
    question_type: ListeningQuestionType
    question_number: int  # Order in section
    question_text: str
    options: Optional[List[str]] = None
    correct_answer: Union[str, List[str]]
    explanation: str
    audio_timestamp: Optional[str] = None  # When answer appears

class WritingTask1Question(QuestionBase):
    """Writing Task 1 question"""
    task_type: WritingTask1Type
    question_text: str
    # For charts/graphs (SVG-based)
    visual_type: Optional[str] = None
    visual_data: Optional[Dict[str, Any]] = None  # Dataset for chart generation
    visual_url: Optional[str] = None  # Generated SVG/PNG URL
    # For letters
    letter_context: Optional[str] = None
    bullet_points: Optional[List[str]] = None
    # Model answers
    model_answer_band9: str
    model_answer_band6: str
    examiner_notes: Dict[str, Any]  # must_mention, common_mistakes, vocabulary
    key_features: List[str]  # Main points to cover

class WritingTask2Question(QuestionBase):
    """Writing Task 2 question"""
    task_type: WritingTask2Type
    question_text: str
    model_answer_band9: str
    model_answer_band6: str
    examiner_notes: Dict[str, Any]
    key_arguments: List[str]  # Main arguments to cover
    useful_vocabulary: List[str]
    common_mistakes: List[str]

class SpeakingQuestion(QuestionBase):
    """Speaking question"""
    part_type: SpeakingPartType
    question_text: str
    # For Part 2
    cue_card: Optional[str] = None
    bullet_points: Optional[List[str]] = None
    preparation_time: Optional[int] = 60  # seconds
    speaking_time: Optional[int] = 120  # seconds
    # For Part 3
    follow_up_questions: Optional[List[str]] = None
    # Model answers
    model_answer_band9: str
    model_answer_band6: str
    examiner_notes: Dict[str, Any]
    useful_phrases: List[str]

class GrammarVocabQuestion(QuestionBase):
    """Grammar and vocabulary questions"""
    question_type: str  # error_correction, fill_blank, synonym, collocation, etc.
    question_text: str
    options: Optional[List[str]] = None
    correct_answer: str
    explanation: str
    grammar_rule: Optional[str] = None
    vocabulary_note: Optional[str] = None
    related_topics: List[Topic] = []

# ============ TEST MODELS ============

class FullIELTSTest(BaseModel):
    """Complete IELTS test structure"""
    id: str
    title: str
    band_level: BandLevel
    created_at: datetime
    # Components
    listening_section_ids: List[str]  # 4 sections
    reading_passage_ids: List[str]  # 3 passages
    writing_task1_id: str
    writing_task2_id: str
    speaking_part1_ids: List[str]
    speaking_part2_id: str
    speaking_part3_ids: List[str]
    # Timing
    total_time: int = 170  # minutes (40+60+60+10)
    is_published: bool = False

class PracticeSet(BaseModel):
    """Custom practice set"""
    id: str
    title: str
    skill: Skill
    topic: Optional[Topic] = None
    band_level: Optional[BandLevel] = None
    question_ids: List[str]
    time_limit: Optional[int] = None
    is_timed: bool = False

# ============ USER PROGRESS MODELS ============

class QuestionAttempt(BaseModel):
    """Single question attempt"""
    question_id: str
    skill: Skill
    topic: Topic
    band_level: BandLevel
    user_answer: Any
    correct_answer: Any
    is_correct: bool
    time_taken: int  # seconds
    feedback: Optional[str] = None
    band_score: Optional[float] = None  # For writing/speaking
    attempted_at: datetime

class UserProgress(BaseModel):
    """User's overall progress"""
    user_id: str
    # Skill-wise stats
    reading_stats: Dict[str, Any] = {}
    listening_stats: Dict[str, Any] = {}
    writing_stats: Dict[str, Any] = {}
    speaking_stats: Dict[str, Any] = {}
    grammar_vocab_stats: Dict[str, Any] = {}
    # Topic-wise accuracy
    topic_accuracy: Dict[str, float] = {}
    # Question-type success rate
    question_type_accuracy: Dict[str, float] = {}
    # Band progression
    band_history: List[Dict[str, Any]] = []
    # Weak areas
    weak_topics: List[Topic] = []
    weak_question_types: List[str] = []
    # Total stats
    total_questions_attempted: int = 0
    total_time_spent: int = 0  # seconds
    last_activity: Optional[datetime] = None

# ============ AI EVALUATION MODELS ============

class WritingEvaluation(BaseModel):
    """AI evaluation for writing"""
    overall_band: float
    task_achievement: Dict[str, Any]  # score, feedback
    coherence_cohesion: Dict[str, Any]
    lexical_resource: Dict[str, Any]
    grammatical_range_accuracy: Dict[str, Any]
    detailed_feedback: str
    improvement_suggestions: List[str]
    improved_sample: Optional[str] = None
    mistakes_highlighted: List[Dict[str, str]] = []

class SpeakingEvaluation(BaseModel):
    """AI evaluation for speaking"""
    overall_band: float
    fluency_coherence: Dict[str, Any]
    lexical_resource: Dict[str, Any]
    grammatical_range_accuracy: Dict[str, Any]
    pronunciation: Dict[str, Any]
    detailed_feedback: str
    improvement_suggestions: List[str]
    vocabulary_to_use: List[str] = []
    grammar_corrections: List[Dict[str, str]] = []

# Import uuid for id generation
import uuid
