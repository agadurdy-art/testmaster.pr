"""
IELTS-Style Full Test Structure
================================
Defines the standard structure for full IELTS-style examinations.
This is the MASTER DATA SOURCE for all Question Bank content.

Copyright Notice:
- All content is 100% ORIGINAL
- Designed to match IELTS FORMAT, not Cambridge content
- No Cambridge materials are copied or paraphrased
"""

from typing import Dict, List, Any, Optional
from enum import Enum
from pydantic import BaseModel, Field
import uuid

# ============ ENUMS ============

class TestType(str, Enum):
    ACADEMIC = "academic"
    GENERAL = "general"


class SectionType(str, Enum):
    LISTENING = "listening"
    READING = "reading"
    WRITING = "writing"
    SPEAKING = "speaking"


class QuestionType(str, Enum):
    # Listening & Reading
    MULTIPLE_CHOICE = "multiple_choice"
    TRUE_FALSE_NG = "true_false_ng"
    YES_NO_NG = "yes_no_ng"
    MATCHING_HEADINGS = "matching_headings"
    MATCHING_INFO = "matching_info"
    MATCHING_FEATURES = "matching_features"
    SENTENCE_COMPLETION = "sentence_completion"
    SUMMARY_COMPLETION = "summary_completion"
    NOTE_COMPLETION = "note_completion"
    TABLE_COMPLETION = "table_completion"
    FORM_COMPLETION = "form_completion"
    DIAGRAM_LABELING = "diagram_labeling"
    FLOW_CHART = "flow_chart"
    SHORT_ANSWER = "short_answer"
    
    # Writing
    TASK1_DATA = "task1_data"  # Academic: describe data
    TASK1_PROCESS = "task1_process"  # Academic: describe process
    TASK1_LETTER = "task1_letter"  # General: write letter
    TASK2_ESSAY = "task2_essay"  # Both: argumentative essay


# ============ TIMING CONSTANTS (IELTS Standard) ============

TEST_TIMINGS = {
    "listening": {
        "audio_time": 30 * 60,  # ~30 min audio
        "transfer_time": 10 * 60,  # 10 min transfer (paper-based)
        "total_time": 40 * 60,  # 40 min total
        "questions": 40
    },
    "reading": {
        "total_time": 60 * 60,  # 60 min
        "questions": 40,
        "passages": 3
    },
    "writing": {
        "task1_time": 20 * 60,  # 20 min
        "task2_time": 40 * 60,  # 40 min
        "total_time": 60 * 60,  # 60 min
        "task1_words": 150,
        "task2_words": 250
    },
    "speaking": {
        "part1_time": 5 * 60,  # 4-5 min
        "part2_prep_time": 60,  # 1 min prep
        "part2_speak_time": 2 * 60,  # 1-2 min
        "part3_time": 5 * 60,  # 4-5 min
        "total_time": 14 * 60  # 11-14 min
    }
}


# ============ BAND SCORE MAPPING ============

LISTENING_BAND_MAP = {
    39: 9.0, 38: 9.0, 37: 8.5, 36: 8.5, 35: 8.0, 34: 8.0,
    33: 7.5, 32: 7.5, 31: 7.0, 30: 7.0, 29: 6.5, 28: 6.5,
    27: 6.5, 26: 6.0, 25: 6.0, 24: 6.0, 23: 5.5, 22: 5.5,
    21: 5.5, 20: 5.0, 19: 5.0, 18: 5.0, 17: 4.5, 16: 4.5,
    15: 4.5, 14: 4.0, 13: 4.0, 12: 4.0, 11: 3.5, 10: 3.5
}

READING_ACADEMIC_BAND_MAP = {
    39: 9.0, 38: 9.0, 37: 8.5, 36: 8.0, 35: 8.0, 34: 7.5,
    33: 7.5, 32: 7.0, 31: 7.0, 30: 6.5, 29: 6.5, 28: 6.5,
    27: 6.0, 26: 6.0, 25: 6.0, 24: 5.5, 23: 5.5, 22: 5.5,
    21: 5.0, 20: 5.0, 19: 5.0, 18: 4.5, 17: 4.5, 16: 4.5,
    15: 4.0, 14: 4.0, 13: 4.0, 12: 3.5, 11: 3.5, 10: 3.5
}

READING_GENERAL_BAND_MAP = {
    40: 9.0, 39: 9.0, 38: 8.5, 37: 8.0, 36: 8.0, 35: 7.5,
    34: 7.5, 33: 7.0, 32: 7.0, 31: 6.5, 30: 6.5, 29: 6.0,
    28: 6.0, 27: 6.0, 26: 5.5, 25: 5.5, 24: 5.5, 23: 5.0,
    22: 5.0, 21: 5.0, 20: 4.5, 19: 4.5, 18: 4.5, 17: 4.0,
    16: 4.0, 15: 4.0, 14: 3.5, 13: 3.5, 12: 3.5, 11: 3.0
}


# ============ QUESTION DISTRIBUTION PER PASSAGE ============

READING_QUESTION_DISTRIBUTION = {
    "academic": {
        "passage_1": {"questions": 13, "difficulty": "moderate"},
        "passage_2": {"questions": 13, "difficulty": "challenging"},
        "passage_3": {"questions": 14, "difficulty": "most_challenging"}
    },
    "general": {
        "section_1": {"questions": 14, "difficulty": "easier", "type": "social_survival"},
        "section_2": {"questions": 13, "difficulty": "moderate", "type": "workplace"},
        "section_3": {"questions": 13, "difficulty": "challenging", "type": "general_interest"}
    }
}

LISTENING_QUESTION_DISTRIBUTION = {
    "part_1": {"questions": 10, "difficulty": "easier", "context": "social_transaction"},
    "part_2": {"questions": 10, "difficulty": "moderate", "context": "social_monologue"},
    "part_3": {"questions": 10, "difficulty": "challenging", "context": "educational_discussion"},
    "part_4": {"questions": 10, "difficulty": "most_challenging", "context": "academic_lecture"}
}


# ============ HELPER FUNCTIONS ============

def calculate_listening_band(correct: int) -> float:
    """Calculate listening band score based on correct answers."""
    if correct >= 40:
        return 9.0
    return LISTENING_BAND_MAP.get(correct, max(1.0, correct * 0.2))


def calculate_reading_band(correct: int, test_type: str) -> float:
    """Calculate reading band score based on correct answers and test type."""
    if correct >= 40:
        return 9.0
    band_map = READING_ACADEMIC_BAND_MAP if test_type == "academic" else READING_GENERAL_BAND_MAP
    return band_map.get(correct, max(1.0, correct * 0.2))


def calculate_overall_band(listening: float, reading: float, writing: float, speaking: float) -> float:
    """Calculate overall band score (IELTS rounding rules)."""
    avg = (listening + reading + writing + speaking) / 4
    # IELTS rounds to nearest 0.5
    return round(avg * 2) / 2


def generate_test_id(test_type: str, set_letter: str, number: int) -> str:
    """Generate standardized test ID."""
    return f"{test_type}_set_{set_letter}_{str(number).zfill(2)}"


# ============ VALIDATION ============

def validate_full_test(test_data: Dict) -> List[str]:
    """Validate that a full test meets IELTS standards."""
    errors = []
    
    sections = test_data.get("sections", {})
    
    # Listening validation
    if "listening" in sections:
        listening = sections["listening"]
        total_q = sum(len(p.get("questions", [])) for p in listening.get("parts", []))
        if total_q != 40:
            errors.append(f"Listening must have 40 questions, found {total_q}")
        if len(listening.get("parts", [])) != 4:
            errors.append("Listening must have 4 parts")
    
    # Reading validation
    if "reading" in sections:
        reading = sections["reading"]
        total_q = sum(len(p.get("questions", [])) for p in reading.get("passages", []))
        if total_q != 40:
            errors.append(f"Reading must have 40 questions, found {total_q}")
        if len(reading.get("passages", [])) != 3:
            errors.append("Reading must have 3 passages/sections")
    
    # Writing validation
    if "writing" in sections:
        writing = sections["writing"]
        if len(writing.get("tasks", [])) != 2:
            errors.append("Writing must have 2 tasks")
    
    # Speaking validation
    if "speaking" in sections:
        speaking = sections["speaking"]
        if len(speaking.get("parts", [])) != 3:
            errors.append("Speaking must have 3 parts")
    
    return errors
