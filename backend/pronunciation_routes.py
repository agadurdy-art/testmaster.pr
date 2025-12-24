"""
PRONUNCIATION EVALUATION MODULE - AZURE SPEECH INTEGRATION
Professional pronunciation assessment using Azure Cognitive Services Speech SDK.

Layer A: Audio Quality Gate (basic validation)
Layer B: Azure Speech Pronunciation Assessment (professional scoring)

Output schema is consistent across all lesson types.
"""

from fastapi import APIRouter, HTTPException, UploadFile
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
import io
import asyncio
import tempfile
import subprocess
import re
from concurrent.futures import ThreadPoolExecutor
from emergentintegrations.llm.openai import OpenAISpeechToText

router = APIRouter(prefix="/api/pronunciation", tags=["pronunciation"])

# Initialize Whisper STT for Content Gate
stt = OpenAISpeechToText(api_key=os.getenv("EMERGENT_LLM_KEY"))

# Azure Speech configuration
AZURE_SPEECH_KEY = os.getenv("AZURE_SPEECH_KEY")
AZURE_SPEECH_REGION = os.getenv("AZURE_SPEECH_REGION", "southeastasia")

# Thread pool for Azure SDK calls (SDK is synchronous)
executor = ThreadPoolExecutor(max_workers=4)

# =============================================================================
# CONFIGURATION
# =============================================================================

QUALITY_CONFIG = {
    "min_blob_size_word": 5000,        # 5KB for word
    "min_blob_size_sentence": 10000,   # 10KB for sentence
}

SCORE_TO_STARS = [
    (90, 5, "Excellent!"),
    (75, 4, "Good!"),
    (60, 3, "Okay"),
    (40, 2, "Needs work"),
    (0, 1, "Try again"),
]

# =============================================================================
# OUTPUT SCHEMA
# =============================================================================

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
    should_count_attempt: bool = False

# =============================================================================
# AUDIO CONVERSION
# =============================================================================

def convert_to_wav(input_data: bytes) -> bytes:
    """
    Convert audio to WAV format (16kHz mono PCM) for Azure Speech SDK.
    Uses ffmpeg for reliable conversion.
    """
    with tempfile.NamedTemporaryFile(suffix='.webm', delete=False) as input_file:
        input_file.write(input_data)
        input_path = input_file.name
    
    output_path = input_path.replace('.webm', '.wav')
    
    try:
        # Convert to 16kHz mono WAV
        cmd = [
            'ffmpeg', '-y', '-i', input_path,
            '-ar', '16000',  # 16kHz sample rate
            '-ac', '1',      # Mono
            '-f', 'wav',
            output_path
        ]
        result = subprocess.run(cmd, capture_output=True, timeout=30)
        
        if result.returncode != 0:
            print(f"[Azure] FFmpeg error: {result.stderr.decode()}")
            raise Exception("Audio conversion failed")
        
        with open(output_path, 'rb') as f:
            wav_data = f.read()
        
        return wav_data
    
    finally:
        # Cleanup temp files
        if os.path.exists(input_path):
            os.unlink(input_path)
        if os.path.exists(output_path):
            os.unlink(output_path)

# =============================================================================
# AZURE PRONUNCIATION ASSESSMENT
# =============================================================================

def azure_assess_pronunciation(wav_data: bytes, reference_text: str, granularity: str = "Phoneme") -> Dict[str, Any]:
    """
    Perform pronunciation assessment using Azure Speech SDK.
    
    Args:
        wav_data: Audio data in WAV format (16kHz mono)
        reference_text: The expected text/word
        granularity: "Word", "Phoneme", or "FullText"
    
    Returns:
        Assessment results including accuracy, fluency, prosody scores
    """
    import azure.cognitiveservices.speech as speechsdk
    
    if not AZURE_SPEECH_KEY:
        raise Exception("Azure Speech key not configured")
    
    result_data = {
        "success": False,
        "transcript": "",
        "accuracy_score": 0,
        "fluency_score": 0,
        "prosody_score": 0,
        "completeness_score": 0,
        "pronunciation_score": 0,
        "words": [],
        "error": ""
    }
    
    try:
        # Configure speech
        speech_config = speechsdk.SpeechConfig(
            subscription=AZURE_SPEECH_KEY,
            region=AZURE_SPEECH_REGION
        )
        speech_config.speech_recognition_language = "en-US"
        
        # Create pronunciation assessment config
        pronunciation_config = speechsdk.PronunciationAssessmentConfig(
            reference_text=reference_text,
            grading_system=speechsdk.PronunciationAssessmentGradingSystem.HundredMark,
            granularity=speechsdk.PronunciationAssessmentGranularity.Phoneme if granularity == "Phoneme" 
                else speechsdk.PronunciationAssessmentGranularity.Word if granularity == "Word"
                else speechsdk.PronunciationAssessmentGranularity.FullText,
            enable_miscue=True
        )
        pronunciation_config.enable_prosody_assessment()
        
        # Create audio stream from WAV data
        audio_stream = speechsdk.audio.PushAudioInputStream()
        audio_config = speechsdk.audio.AudioConfig(stream=audio_stream)
        
        # Create recognizer
        recognizer = speechsdk.SpeechRecognizer(
            speech_config=speech_config,
            audio_config=audio_config
        )
        pronunciation_config.apply_to(recognizer)
        
        # Push audio data
        audio_stream.write(wav_data)
        audio_stream.close()
        
        # Perform recognition
        result = recognizer.recognize_once()
        
        if result.reason == speechsdk.ResultReason.RecognizedSpeech:
            # Get pronunciation assessment result
            pronunciation_result = speechsdk.PronunciationAssessmentResult(result)
            
            result_data["success"] = True
            result_data["transcript"] = result.text
            result_data["accuracy_score"] = pronunciation_result.accuracy_score or 0
            result_data["fluency_score"] = pronunciation_result.fluency_score or 0
            result_data["prosody_score"] = pronunciation_result.prosody_score or 0
            result_data["completeness_score"] = pronunciation_result.completeness_score or 0
            result_data["pronunciation_score"] = pronunciation_result.pronunciation_score or 0
            
            # Get word-level details if available
            if hasattr(pronunciation_result, 'words') and pronunciation_result.words:
                for word_result in pronunciation_result.words:
                    word_data = {
                        "word": word_result.word,
                        "accuracy_score": word_result.accuracy_score,
                        "error_type": word_result.error_type if hasattr(word_result, 'error_type') else None
                    }
                    
                    # Get phoneme details if available
                    if hasattr(word_result, 'phonemes') and word_result.phonemes:
                        word_data["phonemes"] = [
                            {
                                "phoneme": p.phoneme,
                                "accuracy_score": p.accuracy_score
                            }
                            for p in word_result.phonemes
                        ]
                    
                    result_data["words"].append(word_data)
            
            print(f"[Azure] Assessment complete: accuracy={result_data['accuracy_score']}, "
                  f"fluency={result_data['fluency_score']}, prosody={result_data['prosody_score']}")
        
        elif result.reason == speechsdk.ResultReason.NoMatch:
            no_match_detail = result.no_match_details
            result_data["error"] = f"No speech recognized: {no_match_detail.reason}"
            print(f"[Azure] No match: {no_match_detail.reason}")
        
        elif result.reason == speechsdk.ResultReason.Canceled:
            cancellation = result.cancellation_details
            result_data["error"] = f"Recognition canceled: {cancellation.reason}"
            if cancellation.reason == speechsdk.CancellationReason.Error:
                result_data["error"] += f" - {cancellation.error_details}"
            print(f"[Azure] Canceled: {result_data['error']}")
    
    except Exception as e:
        result_data["error"] = str(e)
        print(f"[Azure] Exception: {e}")
    
    return result_data

# =============================================================================
# LAYER A: QUALITY GATE
# =============================================================================

def analyze_audio_quality(audio_data: bytes, is_sentence: bool = False) -> Dict[str, Any]:
    """Basic audio quality validation."""
    result = {
        "passed": False,
        "reason": "",
        "metrics": {"size_bytes": len(audio_data)}
    }
    
    min_size = QUALITY_CONFIG["min_blob_size_sentence" if is_sentence else "min_blob_size_word"]
    
    if len(audio_data) < min_size:
        result["reason"] = "Recording too short or too quiet. Please try again."
        return result
    
    result["passed"] = True
    return result

# =============================================================================
# HELPER: GET STARS AND FEEDBACK
# =============================================================================

def get_stars_and_feedback(score: int) -> tuple:
    """Get star rating and feedback message based on score."""
    for threshold, stars, feedback in SCORE_TO_STARS:
        if score >= threshold:
            return stars, feedback
    return 1, "Try again"

def generate_pronunciation_feedback(azure_result: Dict[str, Any], target: str) -> Dict[str, Any]:
    """Generate user-friendly feedback from Azure result."""
    errors = []
    feedback_parts = []
    
    # Check word-level errors
    for word_data in azure_result.get("words", []):
        word = word_data.get("word", "")
        accuracy = word_data.get("accuracy_score", 0)
        error_type = word_data.get("error_type")
        
        if error_type and error_type != "None":
            errors.append({
                "type": error_type.lower(),
                "expected": target,
                "got": word,
                "hint": f"Focus on pronouncing '{word}' more clearly."
            })
        
        # Check phonemes with low scores
        for phoneme_data in word_data.get("phonemes", []):
            phoneme = phoneme_data.get("phoneme", "")
            p_score = phoneme_data.get("accuracy_score", 100)
            
            if p_score < 60:
                errors.append({
                    "type": "phoneme",
                    "expected": phoneme,
                    "got": None,
                    "hint": f"The '{phoneme}' sound needs practice."
                })
    
    # Generate feedback message
    accuracy = azure_result.get("accuracy_score", 0)
    fluency = azure_result.get("fluency_score", 0)
    prosody = azure_result.get("prosody_score", 0)
    
    if accuracy >= 80:
        feedback_parts.append("Great pronunciation!")
    elif accuracy >= 60:
        feedback_parts.append("Good attempt.")
    else:
        feedback_parts.append("Keep practicing.")
    
    if fluency < 60:
        feedback_parts.append("Try speaking more smoothly.")
    
    if prosody < 60 and prosody > 0:
        feedback_parts.append("Work on your rhythm and intonation.")
    
    return {
        "errors": errors[:3],  # Limit to 3 errors
        "feedback_long": " ".join(feedback_parts)
    }

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
    Main pronunciation evaluation endpoint using Azure Speech.
    """
    print(f"[Pronunciation] Evaluating: target='{target}', is_sentence={is_sentence}")
    
    # Read audio data
    audio_data = await audio_file.read()
    print(f"[Pronunciation] Audio size: {len(audio_data)} bytes")
    
    # LAYER A: Quality Gate
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
            "feedback_long": "Please ensure you're in a quiet environment and speak clearly.",
            "should_count_attempt": False
        }
    
    # Convert audio to WAV for Azure
    try:
        wav_data = await asyncio.get_event_loop().run_in_executor(
            executor, convert_to_wav, audio_data
        )
        print(f"[Pronunciation] Converted to WAV: {len(wav_data)} bytes")
    except Exception as e:
        print(f"[Pronunciation] Conversion failed: {e}")
        return {
            "status": "fail_system",
            "score": None,
            "stars": None,
            "subscores": None,
            "transcript": "",
            "target": target,
            "errors": [],
            "feedback_short": "Could not process audio. Please try again.",
            "feedback_long": "There was a technical issue with the audio format.",
            "should_count_attempt": False
        }
    
    # LAYER B: Azure Pronunciation Assessment
    try:
        azure_result = await asyncio.get_event_loop().run_in_executor(
            executor,
            azure_assess_pronunciation,
            wav_data,
            target,
            "Phoneme" if not is_sentence else "FullText"
        )
    except Exception as e:
        print(f"[Pronunciation] Azure assessment failed: {e}")
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
            "should_count_attempt": False
        }
    
    if not azure_result["success"]:
        # No speech detected or recognition failed
        error_msg = azure_result.get("error", "")
        print(f"[Pronunciation] Azure error: {error_msg}")
        
        return {
            "status": "fail_content",
            "score": 0,
            "stars": 1,
            "subscores": {"accuracy": 0, "fluency": 0, "prosody": 0, "completeness": 0},
            "transcript": "",
            "target": target,
            "errors": [],
            "feedback_short": "Couldn't hear you clearly. Please speak louder.",
            "feedback_long": "Make sure your microphone is working and speak clearly.",
            "should_count_attempt": True
        }
    
    # Process Azure results
    transcript = azure_result.get("transcript", "")
    accuracy = int(azure_result.get("accuracy_score", 0))
    fluency = int(azure_result.get("fluency_score", 0))
    prosody = int(azure_result.get("prosody_score", 0))
    completeness = int(azure_result.get("completeness_score", 0))
    overall_score = int(azure_result.get("pronunciation_score", 0))
    
    # If no overall score, calculate from components
    if overall_score == 0 and (accuracy > 0 or fluency > 0):
        overall_score = int((accuracy * 0.4 + fluency * 0.3 + prosody * 0.2 + completeness * 0.1))
    
    # Generate feedback
    feedback_data = generate_pronunciation_feedback(azure_result, target)
    stars, feedback_short = get_stars_and_feedback(overall_score)
    
    # Determine status
    if overall_score >= 75:
        status = "success"
    elif overall_score >= 50:
        status = "partial"
    else:
        status = "needs_practice"
    
    print(f"[Pronunciation] Final: score={overall_score}, stars={stars}, status={status}")
    
    return {
        "status": status,
        "score": overall_score,
        "stars": stars,
        "subscores": {
            "accuracy": accuracy,
            "fluency": fluency,
            "prosody": prosody,
            "completeness": completeness
        },
        "transcript": transcript,
        "target": target,
        "errors": feedback_data["errors"],
        "feedback_short": feedback_short,
        "feedback_long": feedback_data["feedback_long"],
        "should_count_attempt": True
    }

# =============================================================================
# BACKWARD COMPATIBLE ENDPOINT
# =============================================================================

@router.post("/practice-word")
async def practice_word(audio_file: UploadFile, word: str, user_id: str):
    """
    Backward compatible endpoint for single word practice.
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
# SENTENCE PRONUNCIATION ENDPOINT
# =============================================================================

@router.post("/check")
async def check_pronunciation(audio_file: UploadFile, target_text: str, user_id: str):
    """Endpoint for sentence pronunciation check."""
    result = await evaluate_pronunciation(
        audio_file=audio_file,
        target=target_text,
        user_id=user_id,
        is_sentence=True
    )
    return result

# =============================================================================
# PHONICS LESSONS DATA
# =============================================================================

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
