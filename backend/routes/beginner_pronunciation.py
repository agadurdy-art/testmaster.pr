"""
Beginner Pronunciation Assessment API
=====================================
Azure Speech SDK based pronunciation assessment for beginner learners.
Provides detailed feedback on sounds, stress, intonation, and word-level accuracy.
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional
import os
import tempfile
import json

router = APIRouter(prefix="/api/beginner", tags=["Beginner Pronunciation"])

# Azure Speech SDK
try:
    import azure.cognitiveservices.speech as speechsdk
    AZURE_AVAILABLE = True
except ImportError:
    AZURE_AVAILABLE = False
    print("⚠️  Azure Speech SDK not installed")

AZURE_SPEECH_KEY = os.environ.get("AZURE_SPEECH_KEY")
AZURE_SPEECH_REGION = os.environ.get("AZURE_SPEECH_REGION", "southeastasia")


def get_speech_config():
    """Get Azure Speech configuration"""
    if not AZURE_SPEECH_KEY:
        raise HTTPException(status_code=500, detail="Azure Speech key not configured")
    
    speech_config = speechsdk.SpeechConfig(
        subscription=AZURE_SPEECH_KEY,
        region=AZURE_SPEECH_REGION
    )
    return speech_config


def simplify_feedback(assessment_result: dict, target_text: str) -> dict:
    """
    Convert technical Azure feedback to beginner-friendly format.
    No complex terminology - simple, encouraging feedback.
    """
    accuracy = assessment_result.get("accuracy_score") or 0
    fluency = assessment_result.get("fluency_score") or 0
    prosody = assessment_result.get("prosody_score") or 0
    pronunciation = assessment_result.get("pronunciation_score") or 0
    
    # Overall score (average) - only count non-zero scores
    scores = [s for s in [accuracy, fluency, prosody, pronunciation] if s > 0]
    overall = sum(scores) / len(scores) if scores else 0
    
    # Simple star rating (1-5)
    stars = min(5, max(1, int(overall / 20) + 1))
    
    # Beginner-friendly messages
    if overall >= 80:
        main_feedback = "Excellent! You said it very well! 🌟"
        encouragement = "Keep practicing to get even better!"
    elif overall >= 60:
        main_feedback = "Good job! You're getting better! 👍"
        encouragement = "Try saying it a bit slower and clearer."
    elif overall >= 40:
        main_feedback = "Nice try! Let's practice more! 💪"
        encouragement = "Listen to how it sounds and try again."
    else:
        main_feedback = "Good effort! Practice makes perfect! 🎯"
        encouragement = "Try breaking the word into smaller parts."
    
    # Word-level feedback (simplified)
    word_feedback = []
    words = assessment_result.get("words", [])
    for word_data in words:
        word = word_data.get("word", "")
        word_score = word_data.get("accuracy_score", 0)
        
        if word_score >= 80:
            status = "perfect"
            tip = "Perfect!"
        elif word_score >= 50:
            status = "good"
            tip = "Almost there!"
        else:
            status = "practice"
            tip = "Try again"
        
        word_feedback.append({
            "word": word,
            "score": word_score,
            "status": status,
            "tip": tip
        })
    
    # Specific areas to work on (kid-friendly)
    tips = []
    if accuracy < 60:
        tips.append("Try to say each sound clearly")
    if fluency < 60:
        tips.append("Speak at a steady pace, not too fast")
    if prosody < 60:
        tips.append("Try to make it sound more natural")
    
    return {
        "overall_score": round(overall, 1),
        "stars": stars,
        "main_feedback": main_feedback,
        "encouragement": encouragement,
        "target_text": target_text,
        "word_feedback": word_feedback,
        "tips": tips if tips else ["Great work! Keep it up!"],
        "detailed_scores": {
            "accuracy": round(accuracy, 1),
            "fluency": round(fluency, 1),
            "rhythm": round(prosody, 1),
            "pronunciation": round(pronunciation, 1)
        }
    }


@router.post("/pronunciation/assess")
async def assess_pronunciation(
    audio: UploadFile = File(...),
    reference_text: str = Form(...),
    language: str = Form(default="en-US")
):
    """
    Assess pronunciation of spoken audio against reference text.
    Returns beginner-friendly feedback.
    
    Parameters:
    - audio: Audio file (wav, webm, mp3)
    - reference_text: The text the user is trying to pronounce
    - language: Language code (default: en-US)
    """
    if not AZURE_AVAILABLE:
        raise HTTPException(status_code=500, detail="Azure Speech SDK not available")
    
    # Save audio to temp file
    temp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
            content = await audio.read()
            temp_file.write(content)
            temp_path = temp_file.name
        
        # Configure pronunciation assessment
        speech_config = get_speech_config()
        audio_config = speechsdk.audio.AudioConfig(filename=temp_path)
        
        # Pronunciation assessment config
        pronunciation_config = speechsdk.PronunciationAssessmentConfig(
            reference_text=reference_text,
            grading_system=speechsdk.PronunciationAssessmentGradingSystem.HundredMark,
            granularity=speechsdk.PronunciationAssessmentGranularity.Word,
            enable_miscue=True
        )
        pronunciation_config.enable_prosody_assessment()
        
        # Create recognizer
        recognizer = speechsdk.SpeechRecognizer(
            speech_config=speech_config,
            language=language,
            audio_config=audio_config
        )
        
        # Apply pronunciation assessment
        pronunciation_config.apply_to(recognizer)
        
        # Perform recognition
        result = recognizer.recognize_once()
        
        if result.reason == speechsdk.ResultReason.RecognizedSpeech:
            # Get pronunciation assessment result
            pronunciation_result = speechsdk.PronunciationAssessmentResult(result)
            
            # Extract scores
            assessment_data = {
                "accuracy_score": pronunciation_result.accuracy_score,
                "fluency_score": pronunciation_result.fluency_score,
                "prosody_score": pronunciation_result.prosody_score if hasattr(pronunciation_result, 'prosody_score') else 0,
                "pronunciation_score": pronunciation_result.pronunciation_score,
                "recognized_text": result.text,
                "words": []
            }
            
            # Word-level details
            if hasattr(pronunciation_result, 'words'):
                for word in pronunciation_result.words:
                    assessment_data["words"].append({
                        "word": word.word,
                        "accuracy_score": word.accuracy_score,
                        "error_type": word.error_type if hasattr(word, 'error_type') else None
                    })
            
            # Simplify for beginners
            feedback = simplify_feedback(assessment_data, reference_text)
            
            return {
                "success": True,
                "feedback": feedback,
                "raw_scores": assessment_data
            }
        
        elif result.reason == speechsdk.ResultReason.NoMatch:
            return {
                "success": False,
                "error": "no_speech",
                "feedback": {
                    "main_feedback": "I couldn't hear you clearly. Let's try again! 🎤",
                    "encouragement": "Speak a bit louder and closer to the microphone.",
                    "tips": ["Make sure your microphone is working", "Speak clearly into the microphone"],
                    "stars": 0
                }
            }
        
        else:
            return {
                "success": False,
                "error": "recognition_failed",
                "feedback": {
                    "main_feedback": "Something went wrong. Let's try again! 🔄",
                    "encouragement": "Please try recording again.",
                    "tips": ["Check your microphone", "Try speaking more clearly"],
                    "stars": 0
                }
            }
    
    except Exception as e:
        print(f"Pronunciation assessment error: {e}")
        raise HTTPException(status_code=500, detail=f"Assessment failed: {str(e)}")
    
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)


@router.get("/pronunciation/words/{topic}")
async def get_practice_words(topic: str):
    """
    Get beginner-friendly practice words for a topic.
    """
    practice_words = {
        "family": [
            {"word": "mother", "phonetic": "/ˈmʌðər/", "simple": "MUH-ther"},
            {"word": "father", "phonetic": "/ˈfɑːðər/", "simple": "FAH-ther"},
            {"word": "sister", "phonetic": "/ˈsɪstər/", "simple": "SIS-ter"},
            {"word": "brother", "phonetic": "/ˈbrʌðər/", "simple": "BRUH-ther"},
            {"word": "grandma", "phonetic": "/ˈɡrænmɑː/", "simple": "GRAN-mah"}
        ],
        "food": [
            {"word": "apple", "phonetic": "/ˈæpəl/", "simple": "AP-ul"},
            {"word": "water", "phonetic": "/ˈwɔːtər/", "simple": "WAH-ter"},
            {"word": "bread", "phonetic": "/bred/", "simple": "BRED"},
            {"word": "orange", "phonetic": "/ˈɔːrɪndʒ/", "simple": "OR-inj"},
            {"word": "chicken", "phonetic": "/ˈtʃɪkɪn/", "simple": "CHIK-in"}
        ],
        "daily_life": [
            {"word": "morning", "phonetic": "/ˈmɔːrnɪŋ/", "simple": "MOR-ning"},
            {"word": "evening", "phonetic": "/ˈiːvnɪŋ/", "simple": "EEV-ning"},
            {"word": "school", "phonetic": "/skuːl/", "simple": "SKOOL"},
            {"word": "sleep", "phonetic": "/sliːp/", "simple": "SLEEP"},
            {"word": "breakfast", "phonetic": "/ˈbrekfəst/", "simple": "BREK-fust"}
        ],
        "greetings": [
            {"word": "hello", "phonetic": "/həˈloʊ/", "simple": "huh-LOH"},
            {"word": "goodbye", "phonetic": "/ɡʊdˈbaɪ/", "simple": "good-BYE"},
            {"word": "thank you", "phonetic": "/θæŋk juː/", "simple": "THANK yoo"},
            {"word": "please", "phonetic": "/pliːz/", "simple": "PLEEZ"},
            {"word": "sorry", "phonetic": "/ˈsɔːri/", "simple": "SOR-ee"}
        ]
    }
    
    return {
        "topic": topic,
        "words": practice_words.get(topic.lower(), practice_words.get("greetings", []))
    }


print("✅ Beginner Pronunciation routes loaded")
