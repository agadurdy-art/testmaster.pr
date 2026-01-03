"""
IELTS Test Data Contract - Canonical Schema
============================================
Single source of truth for all test data structures.
All tests MUST conform to this schema to be valid.
"""

from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field, validator
from datetime import datetime
from enum import Enum


# ============ ENUMS ============

class ListeningQuestionType(str, Enum):
    NOTE_COMPLETION = "note_completion"
    MULTIPLE_CHOICE = "multiple_choice"
    MULTIPLE_SELECTION = "multiple_selection"
    MATCHING = "matching"
    TABLE_COMPLETION = "table_completion"
    MAP_LABELING = "map_labeling"


class ReadingQuestionType(str, Enum):
    TFNG = "tfng"
    TRUE_FALSE_NOT_GIVEN = "true_false_not_given"
    YES_NO_NOT_GIVEN = "yes_no_not_given"
    SECTION_MATCHING = "section_matching"
    MATCHING_FEATURES = "matching_features"
    SENTENCE_COMPLETION = "sentence_completion"
    SUMMARY_COMPLETION = "summary_completion"
    MULTIPLE_CHOICE = "multiple_choice"
    MULTIPLE_SELECTION = "multiple_selection"
    NOTE_COMPLETION = "note_completion"


# ============ LISTENING SCHEMA ============

class AudioSpan(BaseModel):
    """Timestamp span for micro-based practice audio"""
    start_ms: int = Field(..., ge=0)
    end_ms: int = Field(..., ge=0)


class MediaRef(BaseModel):
    """Optional media reference for questions (maps, diagrams)"""
    image_src: Optional[str] = None


class ListeningQuestion(BaseModel):
    """Single listening question"""
    qid: str
    number: int = Field(..., ge=1, le=40)
    type: str  # ListeningQuestionType
    prompt: str
    options: Optional[List[str]] = None
    answer: Any  # str or List[str]
    explanation: Optional[str] = None
    media: Optional[MediaRef] = None
    answer_span: Optional[AudioSpan] = None  # For micro practice


class ListeningAudio(BaseModel):
    """Audio file reference"""
    src: str


class ListeningSection(BaseModel):
    """Single listening section (Part 1-4)"""
    section_id: Literal["S1", "S2", "S3", "S4"]
    title: Optional[str] = None
    transcript: Optional[str] = None
    audio: ListeningAudio
    questions: List[ListeningQuestion] = Field(..., min_items=1)


class ListeningPackage(BaseModel):
    """Complete listening section"""
    sections: List[ListeningSection] = Field(..., min_items=4, max_items=4)
    total_questions: int = 40


# ============ READING SCHEMA ============

class PassageSpan(BaseModel):
    """Character span for micro-based practice reading"""
    start_char: int = Field(..., ge=0)
    end_char: int = Field(..., ge=0)


class ReadingPassage(BaseModel):
    """Single reading passage"""
    pid: Literal["P1", "P2", "P3"]
    title: str
    text: str = Field(..., min_length=500)  # MUST be substantial
    subtitle: Optional[str] = None
    headings: Optional[List[str]] = None  # For paragraph headings (A, B, C...)


class ReadingQuestion(BaseModel):
    """Single reading question"""
    qid: str
    number: int = Field(..., ge=1, le=40)
    pid: Literal["P1", "P2", "P3"]
    type: str  # ReadingQuestionType
    prompt: str
    options: Optional[List[str]] = None
    answer: Any  # str or List[str]
    explanation: Optional[str] = None
    passage_span: Optional[PassageSpan] = None  # For micro practice


class ReadingPackage(BaseModel):
    """Complete reading section"""
    passages: List[ReadingPassage] = Field(..., min_items=3, max_items=3)
    questions: List[ReadingQuestion] = Field(..., min_items=40, max_items=40)
    total_questions: int = 40


# ============ WRITING SCHEMA ============

class WritingVisual(BaseModel):
    """Visual reference for Writing Task 1"""
    type: str  # chart, graph, map, process, table
    image_src: str = Field(..., min_length=1)
    description: Optional[str] = None
    data: Optional[Dict[str, Any]] = None


class WritingTask1(BaseModel):
    """Writing Task 1 - Report/Letter"""
    prompt: str = Field(..., min_length=20)
    visual: WritingVisual  # REQUIRED for Task 1
    minimum_words: int = 150
    time_recommendation: str = "20 minutes"


class WritingTask2(BaseModel):
    """Writing Task 2 - Essay"""
    prompt: str = Field(..., min_length=20)
    minimum_words: int = 250
    time_recommendation: str = "40 minutes"


class WritingPackage(BaseModel):
    """Complete writing section"""
    task1: WritingTask1
    task2: WritingTask2
    total_tasks: int = 2


# ============ SPEAKING SCHEMA ============

class SpeakingQuestion(BaseModel):
    """Single speaking question (for TTS generation)"""
    qid: str
    text: str
    audio_url: Optional[str] = None  # Generated TTS audio


class CueCard(BaseModel):
    """Speaking Part 2 cue card - VISIBLE to user"""
    topic: str = Field(..., min_length=10)
    bullets: List[str] = Field(..., min_items=3)
    timing_note: str = "You will have to talk about this topic for one to two minutes. You have one minute to think about what you are going to say. You can make some notes to help you if you wish."


class SpeakingPart1(BaseModel):
    """Speaking Part 1 - Interview (AUDIO ONLY)"""
    audio_only: bool = True
    topic: Optional[str] = None
    questions: List[SpeakingQuestion] = Field(..., min_items=1)


class SpeakingPart2(BaseModel):
    """Speaking Part 2 - Long Turn (CUE CARD VISIBLE)"""
    cue_card: CueCard


class SpeakingPart3(BaseModel):
    """Speaking Part 3 - Discussion (AUDIO ONLY)"""
    audio_only: bool = True
    topics: Optional[List[str]] = None
    questions: List[SpeakingQuestion] = Field(..., min_items=1)


class SpeakingPackage(BaseModel):
    """Complete speaking section"""
    part1: SpeakingPart1
    part2: SpeakingPart2
    part3: SpeakingPart3
    total_parts: int = 3


# ============ PRACTICE INDEX ============

class WritingPracticeIndex(BaseModel):
    task1: bool = False
    task2: bool = False


class SpeakingPracticeIndex(BaseModel):
    part1_count: int = 0
    part2: bool = False
    part3_count: int = 0


class PracticeIndex(BaseModel):
    """Auto-generated index for practice mode"""
    listening: List[str] = []  # qid list
    reading: List[str] = []  # qid list
    writing: WritingPracticeIndex = WritingPracticeIndex()
    speaking: SpeakingPracticeIndex = SpeakingPracticeIndex()


# ============ STATS SNAPSHOT ============

class QuestionCounts(BaseModel):
    listening: int = 0
    reading: int = 0
    writing: int = 0
    speaking: int = 0


class StatsSnapshot(BaseModel):
    """Auto-computed stats for the test"""
    total_questions: QuestionCounts
    by_type: Dict[str, int] = {}


# ============ META ============

class TestMeta(BaseModel):
    """Test metadata"""
    book: str  # "Cambridge IELTS 17"
    test_number: str  # "Test 3"
    skill_set: Literal["full"] = "full"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    validated_at: Optional[datetime] = None
    status: Literal["VALID", "FAILED_VALIDATION", "PENDING"] = "PENDING"
    validation_errors: List[str] = []


# ============ MAIN TEST PACKAGE ============

class TestPackage(BaseModel):
    """
    CANONICAL TEST SCHEMA
    =====================
    Single source of truth for all IELTS test data.
    A test is ONLY valid if ALL fields pass validation.
    """
    test_id: str = Field(..., min_length=1)
    meta: TestMeta
    listening: ListeningPackage
    reading: ReadingPackage
    writing: WritingPackage
    speaking: SpeakingPackage
    practice_index: PracticeIndex = PracticeIndex()
    stats_snapshot: StatsSnapshot = StatsSnapshot(total_questions=QuestionCounts())
    
    class Config:
        extra = "forbid"  # No extra fields allowed


# ============ VALIDATION RESULT ============

class ValidationResult(BaseModel):
    """Result of test validation"""
    valid: bool
    test_id: str
    errors: List[str] = []
    warnings: List[str] = []
    stats: Optional[StatsSnapshot] = None


# ============ VALIDATOR CLASS ============

class TestPackageValidator:
    """
    VALIDATION GATE (HARD STOP)
    ===========================
    Validates a TestPackage against the canonical schema.
    If ANY validation fails, the test is marked FAILED_VALIDATION.
    """
    
    @staticmethod
    def validate(pkg: Dict[str, Any]) -> ValidationResult:
        """
        Validate a test package dictionary.
        Returns ValidationResult with valid=True/False and any errors.
        """
        errors = []
        warnings = []
        test_id = pkg.get("test_id", "unknown")
        
        # 1) Check required top-level keys
        required_keys = ["test_id", "meta", "listening", "reading", "writing", "speaking"]
        for key in required_keys:
            if key not in pkg:
                errors.append(f"Missing required key: {key}")
        
        if errors:
            return ValidationResult(valid=False, test_id=test_id, errors=errors)
        
        # 2) Validate Listening
        listening = pkg.get("listening", {})
        listening_errors = TestPackageValidator._validate_listening(listening)
        errors.extend(listening_errors)
        
        # 3) Validate Reading
        reading = pkg.get("reading", {})
        reading_errors = TestPackageValidator._validate_reading(reading)
        errors.extend(reading_errors)
        
        # 4) Validate Writing
        writing = pkg.get("writing", {})
        writing_errors = TestPackageValidator._validate_writing(writing)
        errors.extend(writing_errors)
        
        # 5) Validate Speaking
        speaking = pkg.get("speaking", {})
        speaking_errors = TestPackageValidator._validate_speaking(speaking)
        errors.extend(speaking_errors)
        
        # 6) Compute stats if valid
        stats = None
        if not errors:
            stats = TestPackageValidator._compute_stats(pkg)
        
        return ValidationResult(
            valid=len(errors) == 0,
            test_id=test_id,
            errors=errors,
            warnings=warnings,
            stats=stats
        )
    
    @staticmethod
    def _validate_listening(listening: Dict) -> List[str]:
        errors = []
        
        sections = listening.get("sections", [])
        if len(sections) != 4:
            errors.append(f"Listening must have exactly 4 sections, found {len(sections)}")
            return errors
        
        question_numbers = []
        for i, section in enumerate(sections):
            section_id = section.get("section_id", f"S{i+1}")
            
            # Check audio
            audio = section.get("audio", {})
            if not audio.get("src"):
                errors.append(f"Listening {section_id}: Missing audio.src")
            
            # Check questions
            questions = section.get("questions", [])
            if not questions:
                errors.append(f"Listening {section_id}: No questions found")
            
            for q in questions:
                num = q.get("number")
                if num:
                    question_numbers.append(num)
                if not q.get("qid"):
                    errors.append(f"Listening Q{num}: Missing qid")
                if not q.get("type"):
                    errors.append(f"Listening Q{num}: Missing type")
        
        # Verify 40 questions, 1-40 contiguous
        if len(question_numbers) != 40:
            errors.append(f"Listening must have 40 questions, found {len(question_numbers)}")
        
        return errors
    
    @staticmethod
    def _validate_reading(reading: Dict) -> List[str]:
        errors = []
        
        # Check passages
        passages = reading.get("passages", [])
        if len(passages) != 3:
            errors.append(f"Reading must have exactly 3 passages, found {len(passages)}")
        
        for i, passage in enumerate(passages):
            pid = passage.get("pid", f"P{i+1}")
            text = passage.get("text", "")
            
            if len(text) < 500:
                errors.append(f"Reading {pid}: Text too short ({len(text)} chars, need 500+)")
            
            if not passage.get("title"):
                errors.append(f"Reading {pid}: Missing title")
        
        # Check questions
        questions = reading.get("questions", [])
        if len(questions) != 40:
            errors.append(f"Reading must have 40 questions, found {len(questions)}")
        
        # Verify numbers 1-40 (handle string numbers)
        def safe_int(x):
            try:
                return int(x)
            except (ValueError, TypeError):
                return 0
        
        numbers = sorted([safe_int(q.get("number", 0)) for q in questions])
        expected = list(range(1, 41))
        if numbers != expected:
            errors.append(f"Reading question numbers not contiguous 1-40: got {numbers[:5]}...{numbers[-5:]}")
        
        for q in questions:
            num = q.get("number")
            if not q.get("qid"):
                errors.append(f"Reading Q{num}: Missing qid")
            if not q.get("pid"):
                errors.append(f"Reading Q{num}: Missing pid")
            if not q.get("type"):
                errors.append(f"Reading Q{num}: Missing type")
        
        return errors
    
    @staticmethod
    def _validate_writing(writing: Dict) -> List[str]:
        errors = []
        
        # Task 1
        task1 = writing.get("task1", {})
        if not task1.get("prompt"):
            errors.append("Writing Task 1: Missing prompt")
        elif len(task1.get("prompt", "")) < 20:
            errors.append("Writing Task 1: Prompt too short")
        
        visual = task1.get("visual", {})
        if not visual.get("image_src"):
            errors.append("Writing Task 1: Missing visual.image_src (REQUIRED)")
        
        # Task 2
        task2 = writing.get("task2", {})
        if not task2.get("prompt"):
            errors.append("Writing Task 2: Missing prompt")
        elif len(task2.get("prompt", "")) < 20:
            errors.append("Writing Task 2: Prompt too short")
        
        return errors
    
    @staticmethod
    def _validate_speaking(speaking: Dict) -> List[str]:
        errors = []
        
        # Part 1
        part1 = speaking.get("part1", {})
        questions1 = part1.get("questions", [])
        if not questions1:
            errors.append("Speaking Part 1: No questions found")
        if not part1.get("audio_only", True):
            errors.append("Speaking Part 1: Must be audio_only=True")
        
        # Part 2
        part2 = speaking.get("part2", {})
        cue_card = part2.get("cue_card", {})
        if not cue_card.get("topic"):
            errors.append("Speaking Part 2: Missing cue_card.topic")
        if not cue_card.get("bullets") or len(cue_card.get("bullets", [])) < 3:
            errors.append("Speaking Part 2: cue_card must have at least 3 bullets")
        
        # Part 3
        part3 = speaking.get("part3", {})
        questions3 = part3.get("questions", [])
        if not questions3:
            errors.append("Speaking Part 3: No questions found")
        if not part3.get("audio_only", True):
            errors.append("Speaking Part 3: Must be audio_only=True")
        
        return errors
    
    @staticmethod
    def _compute_stats(pkg: Dict) -> StatsSnapshot:
        """Compute stats snapshot for a valid test"""
        by_type = {}
        
        # Listening
        listening_count = 0
        for section in pkg.get("listening", {}).get("sections", []):
            for q in section.get("questions", []):
                listening_count += 1
                qtype = f"listening_{q.get('type', 'unknown')}"
                by_type[qtype] = by_type.get(qtype, 0) + 1
        
        # Reading
        reading_count = 0
        for q in pkg.get("reading", {}).get("questions", []):
            reading_count += 1
            qtype = f"reading_{q.get('type', 'unknown')}"
            by_type[qtype] = by_type.get(qtype, 0) + 1
        
        # Writing
        writing_count = 2
        
        # Speaking
        speaking_count = 0
        part1 = pkg.get("speaking", {}).get("part1", {})
        part3 = pkg.get("speaking", {}).get("part3", {})
        speaking_count += len(part1.get("questions", []))
        speaking_count += 1  # Part 2 cue card
        speaking_count += len(part3.get("questions", []))
        
        return StatsSnapshot(
            total_questions=QuestionCounts(
                listening=listening_count,
                reading=reading_count,
                writing=writing_count,
                speaking=speaking_count
            ),
            by_type=by_type
        )


# ============ EXPORTS ============

__all__ = [
    "TestPackage",
    "TestPackageValidator",
    "ValidationResult",
    "ListeningPackage",
    "ReadingPackage",
    "WritingPackage",
    "SpeakingPackage",
    "PracticeIndex",
    "StatsSnapshot"
]
