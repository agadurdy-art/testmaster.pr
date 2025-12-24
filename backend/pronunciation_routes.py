"""
PRONUNCIATION EVALUATION MODULE
Site-wide 3-layer pronunciation evaluation stack

Layer A: Audio Quality Gate
Layer B: Content Gate (Whisper STT)
Layer C: Pronunciation Scoring (Phase 2: Azure/MFA integration)

Output schema is consistent across all lesson types.
"""

from fastapi import APIRouter, HTTPException, UploadFile
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
import io
import asyncio
import re
import struct
import math
from emergentintegrations.llm.openai import OpenAISpeechToText

router = APIRouter(prefix="/api/pronunciation", tags=["pronunciation"])

# Initialize Speech-to-Text
stt = OpenAISpeechToText(api_key=os.getenv("EMERGENT_LLM_KEY"))

# =============================================================================
# CONFIGURATION
# =============================================================================

# Quality Gate thresholds
QUALITY_CONFIG = {
    "min_duration_word_ms": 600,      # 0.6s for single word
    "min_duration_sentence_ms": 1200,  # 1.2s for sentence
    "min_blob_size_word": 8000,        # 8KB for word
    "min_blob_size_sentence": 15000,   # 15KB for sentence
    "max_silence_ratio": 0.85,         # Max 85% silence
}

# Content Gate thresholds
CONTENT_CONFIG = {
    "max_edit_distance_word": 2,       # Allow edit distance of 2 for words
    "max_wer_sentence": 0.40,          # 40% WER threshold for sentences
}

# Scoring thresholds
SCORE_TO_STARS = [
    (90, 5, "Excellent!"),
    (75, 4, "Good!"),
    (60, 3, "Okay"),
    (40, 2, "Needs work"),
    (0, 1, "Try again"),
]

# Similar sounding words (Whisper commonly mishears these)
SIMILAR_SOUNDS = {
    "eye": ["i", "ice", "aye", "ai", "eyes"],
    "hair": ["here", "hare", "air", "yeah", "her", "hear", "hairs"],
    "ear": ["here", "year", "air", "e", "ears", "ear"],
    "mouth": ["mouse", "math", "moth", "mouths"],
    "face": ["phase", "faith", "bass", "base", "faces"],
    "nose": ["knows", "nos", "no", "noes", "noses"],
    "head": ["had", "ed", "hid", "bed", "heads", "dead"],
    "hand": ["and", "had", "hound", "hands", "hanged"],
    "arm": ["om", "am", "arms", "harm"],
    "leg": ["lake", "lag", "lack", "legs", "like"],
    "foot": ["food", "put", "full", "feet"],
    "toe": ["tow", "to", "though", "toes", "two"],
    "finger": ["figure", "fingers"],
    "thumb": ["some", "sum", "come", "thumbs"],
    "body": ["buddy", "boddy", "bodies"],
    "neck": ["nick", "knack", "next"],
    "shoulder": ["shoulders", "older"],
    "knee": ["need", "knees", "me", "key"],
    "ankle": ["uncle", "angle", "ankles"],
}

# =============================================================================
# OUTPUT SCHEMA
# =============================================================================

class PronunciationError(BaseModel):
    type: str  # "phoneme", "stress", "fluency"
    expected: Optional[str] = None
    got: Optional[str] = None
    hint: str

class PronunciationSubscores(BaseModel):
    accuracy: int = 0
    fluency: int = 0
    prosody: int = 0
    completeness: int = 0

class PronunciationResult(BaseModel):
    status: str  # "success", "fail_quality", "fail_content", "fail_system"
    score: Optional[int] = None
    stars: Optional[int] = None
    subscores: Optional[PronunciationSubscores] = None
    transcript: str = ""
    target: str = ""
    errors: List[Dict[str, Any]] = []
    feedback_short: str = ""
    feedback_long: str = ""
    should_count_attempt: bool = False  # Only True for content/pronunciation outcomes

# =============================================================================
# LAYER A: AUDIO QUALITY GATE
# =============================================================================

def analyze_audio_quality(audio_data: bytes, is_sentence: bool = False) -> Dict[str, Any]:
    """
    Analyze audio quality before processing.
    Returns quality metrics and pass/fail status.
    """
    result = {
        "passed": False,
        "reason": "",
        "metrics": {
            "size_bytes": len(audio_data),
            "estimated_duration_ms": 0,
        }
    }
    
    size = len(audio_data)
    min_size = QUALITY_CONFIG["min_blob_size_sentence" if is_sentence else "min_blob_size_word"]
    
    # Check blob size
    if size < min_size:
        result["reason"] = "Recording too short or too quiet. Please try again."
        return result
    
    # Estimate duration from file size (rough approximation for webm/opus)
    # webm/opus typically ~6-12 KB per second
    estimated_duration_ms = (size / 8) # Very rough estimate
    result["metrics"]["estimated_duration_ms"] = estimated_duration_ms
    
    min_duration = QUALITY_CONFIG["min_duration_sentence_ms" if is_sentence else "min_duration_word_ms"]
    if estimated_duration_ms < min_duration * 0.5:  # Allow some tolerance
        result["reason"] = "Recording too short. Please speak for longer."
        return result
    
    # For more accurate quality checks, we would analyze the actual audio
    # For now, size-based validation is sufficient for Phase 1
    
    result["passed"] = True
    return result

# =============================================================================
# LAYER B: CONTENT GATE
# =============================================================================

def levenshtein_distance(s1: str, s2: str) -> int:
    """Calculate Levenshtein edit distance between two strings."""
    if len(s1) < len(s2):
        return levenshtein_distance(s2, s1)
    if len(s2) == 0:
        return len(s1)
    
    prev_row = list(range(len(s2) + 1))
    for i, c1 in enumerate(s1):
        curr_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = prev_row[j + 1] + 1
            deletions = curr_row[j] + 1
            substitutions = prev_row[j] + (c1 != c2)
            curr_row.append(min(insertions, deletions, substitutions))
        prev_row = curr_row
    return prev_row[-1]

def calculate_wer(reference: str, hypothesis: str) -> float:
    """Calculate Word Error Rate between reference and hypothesis."""
    ref_words = reference.lower().split()
    hyp_words = hypothesis.lower().split()
    
    if not ref_words:
        return 1.0 if hyp_words else 0.0
    
    # Simple WER calculation
    distance = levenshtein_distance(' '.join(ref_words), ' '.join(hyp_words))
    return distance / len(' '.join(ref_words))

def normalize_text(text: str) -> str:
    """Normalize text for comparison."""
    # Lowercase, remove punctuation, strip whitespace
    text = text.lower()
    text = re.sub(r'[^\w\s]', '', text)
    text = ' '.join(text.split())  # Normalize whitespace
    return text

def check_content_match(target: str, transcript: str, is_sentence: bool = False) -> Dict[str, Any]:
    """
    Check if the spoken content matches the target.
    Returns match result with details.
    """
    result = {
        "passed": False,
        "reason": "",
        "normalized_target": "",
        "normalized_transcript": "",
        "match_type": "none",  # "exact", "similar", "partial", "none"
        "similarity_score": 0,
    }
    
    # Normalize both
    norm_target = normalize_text(target)
    norm_transcript = normalize_text(transcript)
    
    result["normalized_target"] = norm_target
    result["normalized_transcript"] = norm_transcript
    
    if not norm_transcript:
        result["reason"] = "Couldn't hear you clearly. Please speak louder."
        return result
    
    if is_sentence:
        # Sentence matching using WER
        wer = calculate_wer(norm_target, norm_transcript)
        result["similarity_score"] = int((1 - wer) * 100)
        
        if wer <= CONTENT_CONFIG["max_wer_sentence"]:
            result["passed"] = True
            result["match_type"] = "exact" if wer < 0.1 else "partial"
        else:
            result["reason"] = "You said something different. Listen and try again."
    else:
        # Single word matching
        target_words = norm_target.split()
        transcript_words = norm_transcript.split()
        
        # Get first word of transcript
        first_word = transcript_words[0] if transcript_words else ""
        target_word = target_words[0] if target_words else ""
        
        # Check exact match
        if first_word == target_word:
            result["passed"] = True
            result["match_type"] = "exact"
            result["similarity_score"] = 100
        # Check if target appears anywhere in transcript
        elif target_word in transcript_words:
            result["passed"] = True
            result["match_type"] = "exact"
            result["similarity_score"] = 95
        # Check similar sounds (Whisper mishears)
        elif target_word in SIMILAR_SOUNDS and first_word in SIMILAR_SOUNDS[target_word]:
            result["passed"] = True
            result["match_type"] = "similar"
            result["similarity_score"] = 85
        else:
            # Check edit distance
            edit_dist = levenshtein_distance(first_word, target_word)
            max_edit = CONTENT_CONFIG["max_edit_distance_word"]
            
            if edit_dist <= max_edit:
                result["passed"] = True
                result["match_type"] = "partial"
                result["similarity_score"] = max(60, 100 - (edit_dist * 15))
            else:
                # Check character similarity
                if first_word and target_word:
                    common = sum(1 for a, b in zip(first_word, target_word) if a == b)
                    sim = common / max(len(first_word), len(target_word))
                    result["similarity_score"] = int(sim * 50)
                
                result["reason"] = f"You said '{first_word}'. Try saying '{target_word}' again."
    
    return result

# =============================================================================
# LAYER C: PRONUNCIATION SCORING (Phase 1 - Simplified)
# =============================================================================

def calculate_pronunciation_score(content_result: Dict[str, Any], is_sentence: bool = False) -> Dict[str, Any]:
    """
    Calculate pronunciation score based on content match.
    
    Phase 1: Simplified scoring based on STT confidence and match quality.
    Phase 2: Will integrate Azure Pronunciation Assessment or MFA.
    """
    base_score = content_result.get("similarity_score", 0)
    match_type = content_result.get("match_type", "none")
    
    # Adjust score based on match type
    if match_type == "exact":
        score = max(85, base_score)  # Minimum 85 for exact match
    elif match_type == "similar":
        score = max(75, min(85, base_score))  # 75-85 for similar sounds
    elif match_type == "partial":
        score = max(60, min(75, base_score))  # 60-75 for partial match
    else:
        score = min(40, base_score)  # Max 40 for no match
    
    # Calculate subscores (simplified for Phase 1)
    subscores = {
        "accuracy": score,
        "fluency": min(100, score + 10) if match_type in ["exact", "similar"] else score,
        "prosody": score,  # Will be calculated properly in Phase 2
        "completeness": 100 if match_type == "exact" else 80 if match_type == "similar" else 50,
    }
    
    # Get stars and feedback
    stars = 1
    feedback_short = "Try again"
    for threshold, star_count, feedback in SCORE_TO_STARS:
        if score >= threshold:
            stars = star_count
            feedback_short = feedback
            break
    
    # Generate errors/tips (simplified for Phase 1)
    errors = []
    if match_type == "similar":
        errors.append({
            "type": "phoneme",
            "expected": content_result.get("normalized_target", ""),
            "got": content_result.get("normalized_transcript", ""),
            "hint": "Good attempt! The sound is close."
        })
    elif match_type == "partial":
        errors.append({
            "type": "phoneme",
            "hint": "Focus on pronouncing each sound clearly."
        })
    
    return {
        "score": score,
        "stars": stars,
        "subscores": subscores,
        "errors": errors,
        "feedback_short": feedback_short,
    }

# =============================================================================
# WHISPER TRANSCRIPTION HELPER
# =============================================================================

async def transcribe_audio(audio_data: bytes, timeout: float = 12.0) -> Dict[str, Any]:
    """
    Transcribe audio using Whisper with proper response parsing.
    """
    result = {
        "success": False,
        "transcript": "",
        "error": "",
    }
    
    audio_file = io.BytesIO(audio_data)
    audio_file.name = "recording.webm"
    
    try:
        transcription_result = await asyncio.wait_for(
            stt.transcribe(
                file=audio_file,
                model="whisper-1",
                response_format="text"
            ),
            timeout=timeout
        )
        
        # Parse the response properly
        transcript = ""
        if transcription_result:
            if hasattr(transcription_result, 'text'):
                transcript = transcription_result.text
            elif isinstance(transcription_result, dict) and 'text' in transcription_result:
                transcript = transcription_result['text']
            elif isinstance(transcription_result, str):
                # Check if it's a repr string
                if 'text=' in transcription_result or 'text:' in transcription_result:
                    # Extract text from repr
                    match = re.search(r"text[=:]\s*['\"]?([^'\"}\]]+)['\"]?", transcription_result)
                    if match:
                        transcript = match.group(1).strip()
                else:
                    transcript = transcription_result
            else:
                transcript = str(transcription_result)
        
        result["success"] = True
        result["transcript"] = transcript.strip()
        
    except asyncio.TimeoutError:
        result["error"] = "timeout"
    except Exception as e:
        result["error"] = str(e)
    
    return result

# =============================================================================
# MAIN EVALUATION ENDPOINT
# =============================================================================

@router.post("/evaluate")
async def evaluate_pronunciation(
    audio_file: UploadFile,
    target: str,
    user_id: str,
    is_sentence: bool = False
):
    """
    Main pronunciation evaluation endpoint.
    Implements 3-layer evaluation: Quality Gate -> Content Gate -> Pronunciation Scoring
    
    Returns consistent schema across all lesson types.
    """
    print(f"[Pronunciation] Evaluating: target='{target}', is_sentence={is_sentence}")
    
    # Read audio data
    audio_data = await audio_file.read()
    print(f"[Pronunciation] Audio size: {len(audio_data)} bytes")
    
    # =================================
    # LAYER A: Quality Gate
    # =================================
    quality_result = analyze_audio_quality(audio_data, is_sentence)
    
    if not quality_result["passed"]:
        print(f"[Pronunciation] Quality gate failed: {quality_result['reason']}")
        return {
            "status": "fail_quality",
            "score": None,
            "stars": None,
            "subscores": None,
            "transcript": "",
            "target": target,
            "errors": [],
            "feedback_short": quality_result["reason"],
            "feedback_long": "Please ensure you're in a quiet environment and speak clearly into the microphone.",
            "should_count_attempt": False  # Don't count quality failures
        }
    
    # =================================
    # LAYER B: Content Gate (Whisper STT)
    # =================================
    transcription = await transcribe_audio(audio_data)
    
    if not transcription["success"]:
        print(f"[Pronunciation] Transcription failed: {transcription['error']}")
        return {
            "status": "fail_system",
            "score": None,
            "stars": None,
            "subscores": None,
            "transcript": "",
            "target": target,
            "errors": [],
            "feedback_short": "Could not analyze your recording. Please try again.",
            "feedback_long": "There was a technical issue. Please try recording again.",
            "should_count_attempt": False  # Don't count system failures
        }
    
    transcript = transcription["transcript"]
    print(f"[Pronunciation] Transcript: '{transcript}'")
    
    # Check content match
    content_result = check_content_match(target, transcript, is_sentence)
    print(f"[Pronunciation] Content check: passed={content_result['passed']}, type={content_result['match_type']}")
    
    if not content_result["passed"]:
        # Content gate failed - they said something different
        return {
            "status": "fail_content",
            "score": content_result["similarity_score"],
            "stars": 1,
            "subscores": {
                "accuracy": content_result["similarity_score"],
                "fluency": 0,
                "prosody": 0,
                "completeness": 0
            },
            "transcript": content_result["normalized_transcript"],
            "target": target,
            "errors": [{
                "type": "content",
                "expected": content_result["normalized_target"],
                "got": content_result["normalized_transcript"],
                "hint": "Listen to the correct pronunciation and try again."
            }],
            "feedback_short": content_result["reason"],
            "feedback_long": f"You said '{content_result['normalized_transcript']}' but the target was '{target}'. Listen to the model audio and try again.",
            "should_count_attempt": True  # Count content failures as attempts
        }
    
    # =================================
    # LAYER C: Pronunciation Scoring
    # =================================
    scoring_result = calculate_pronunciation_score(content_result, is_sentence)
    
    # Determine status based on score
    score = scoring_result["score"]
    if score >= 75:
        status = "success"
    elif score >= 50:
        status = "partial"
    else:
        status = "needs_practice"
    
    print(f"[Pronunciation] Final score: {score}, stars: {scoring_result['stars']}, status: {status}")
    
    return {
        "status": status,
        "score": score,
        "stars": scoring_result["stars"],
        "subscores": scoring_result["subscores"],
        "transcript": content_result["normalized_transcript"],
        "target": target,
        "errors": scoring_result["errors"],
        "feedback_short": scoring_result["feedback_short"],
        "feedback_long": f"You said the word correctly! " if score >= 75 else "Keep practicing for better pronunciation.",
        "should_count_attempt": True  # Count evaluated pronunciations
    }

# =============================================================================
# BACKWARD COMPATIBLE ENDPOINT (for existing frontend)
# =============================================================================

@router.post("/practice-word")
async def practice_word(audio_file: UploadFile, word: str, user_id: str):
    """
    Backward compatible endpoint for single word practice.
    Wraps the new evaluation system.
    """
    result = await evaluate_pronunciation(
        audio_file=audio_file,
        target=word,
        user_id=user_id,
        is_sentence=False
    )
    
    # Convert to old format for backward compatibility
    return {
        "status": result["status"] if result["status"] != "partial" else "needs_practice",
        "word": word,
        "transcribed": result["transcript"],
        "score": result["score"] or 0,
        "correct": result["status"] == "success",
        "feedback": result["feedback_short"],
        "should_count_attempt": result["should_count_attempt"]
    }

# =============================================================================
# LEGACY ENDPOINTS (kept for compatibility)
# =============================================================================

@router.post("/check")
async def check_pronunciation(audio_file: UploadFile, target_text: str, user_id: str):
    """Legacy endpoint for sentence pronunciation check."""
    result = await evaluate_pronunciation(
        audio_file=audio_file,
        target=target_text,
        user_id=user_id,
        is_sentence=True
    )
    return result

# Phonics lessons data (simplified)
PHONICS_LESSONS = {
    "final_consonants": {
        "title": "Final Consonant Sounds",
        "description": "Practice pronouncing final consonants clearly",
        "challenge": "Asian language speakers often drop final consonants",
        "sounds": ["/t/", "/d/", "/s/", "/z/"]
    },
    "th_sounds": {
        "title": "TH Sounds",
        "description": "Practice the voiced and voiceless TH sounds",
        "challenge": "TH sounds don't exist in many Asian languages",
        "sounds": ["/θ/", "/ð/"]
    },
    "vowel_length": {
        "title": "Vowel Length",
        "description": "Practice distinguishing long and short vowels",
        "challenge": "Vowel length changes meaning in English",
        "sounds": ["/iː/", "/ɪ/", "/uː/", "/ʊ/"]
    },
}

@router.get("/phonics-lessons")
async def get_phonics_lessons():
    """Get all available phonics lessons"""
    return {
        "lessons": [
            {"key": key, **{k: v for k, v in lesson.items() if k != "sounds"}}
            for key, lesson in PHONICS_LESSONS.items()
        ]
    }

@router.get("/phonics-lessons/{lesson_key}")
async def get_phonics_lesson_detail(lesson_key: str):
    """Get detailed phonics lesson content"""
    if lesson_key not in PHONICS_LESSONS:
        raise HTTPException(status_code=404, detail="Phonics lesson not found")
    return PHONICS_LESSONS[lesson_key]
