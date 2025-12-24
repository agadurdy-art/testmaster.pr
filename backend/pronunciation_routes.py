"""
PRONUNCIATION & PHONICS SYSTEM
Advanced speech recognition and pronunciation feedback for YLE learners
Special focus on Asian learners' challenges (final sounds, difficult consonants)
"""

from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
from emergentintegrations.llm.openai import OpenAISpeechToText
from emergentintegrations.llm.chat import LlmChat, UserMessage

router = APIRouter(prefix="/api/pronunciation", tags=["pronunciation"])

# Initialize Speech-to-Text
stt = OpenAISpeechToText(api_key=os.getenv("EMERGENT_LLM_KEY"))

# LLM will be initialized per request for pronunciation analysis

# ============ PHONICS LESSONS FOR ASIAN LEARNERS ============

PHONICS_LESSONS = {
    "final_consonants": {
        "title": "Final Consonant Sounds",
        "description": "Master ending sounds that are often silent in Asian languages",
        "challenge": "Many Asian languages don't emphasize final consonants, making words like 'cat' sound like 'ca'",
        "sounds": [
            {
                "sound": "/t/",
                "examples": ["cat", "hat", "sit", "hot", "not"],
                "tip": "Touch your tongue to the roof of your mouth and release air",
                "common_mistake": "Saying 'ca' instead of 'cat'",
                "practice": "Say: cat - CAT (stress the T)"
            },
            {
                "sound": "/d/",
                "examples": ["bed", "red", "had", "good", "did"],
                "tip": "Like /t/ but with voice - your throat vibrates",
                "common_mistake": "Silent or very soft /d/",
                "practice": "Say: bed - BED (feel the vibration)"
            },
            {
                "sound": "/p/",
                "examples": ["cup", "map", "stop", "up", "top"],
                "tip": "Press lips together and release with a small burst of air",
                "common_mistake": "Open mouth too early, sound becomes 'u'",
                "practice": "Hold: cu...P (burst at the end)"
            },
            {
                "sound": "/k/",
                "examples": ["book", "look", "back", "duck", "stick"],
                "tip": "Back of tongue touches soft palate, release air",
                "common_mistake": "Weak or missing /k/",
                "practice": "booK - feel the stop at the back"
            },
            {
                "sound": "/s/",
                "examples": ["bus", "yes", "miss", "grass", "face"],
                "tip": "Tongue behind teeth, continuous air flow",
                "common_mistake": "Adding extra vowel: 'bus-u'",
                "practice": "Extend: busssss (no extra sound)"
            },
            {
                "sound": "/z/",
                "examples": ["has", "is", "buzz", "quiz", "dogs"],
                "tip": "Like /s/ but with voice - throat vibrates",
                "common_mistake": "Pronouncing as /s/ without voice",
                "practice": "Feel vibration: haszzz"
            }
        ]
    },
    "consonant_clusters": {
        "title": "Consonant Clusters",
        "description": "Two or more consonants together - challenging for Asian learners",
        "challenge": "Asian languages rarely have consonant clusters, making words like 'stop' difficult",
        "sounds": [
            {
                "sound": "st-",
                "examples": ["stop", "star", "stand", "stick", "story"],
                "tip": "Say /s/ first, then add /t/ without pause",
                "common_mistake": "Adding vowel: 'su-top'",
                "practice": "Blend: sss-t-top (no gap)"
            },
            {
                "sound": "sp-",
                "examples": ["sport", "speak", "spell", "spider", "space"],
                "tip": "Press lips for /p/ while making /s/",
                "common_mistake": "Separating sounds: 'su-port'",
                "practice": "Quick: sp-ort (together)"
            },
            {
                "sound": "sk-",
                "examples": ["skip", "sky", "skate", "school", "ski"],
                "tip": "/s/ flows into /k/ - back of tongue ready",
                "common_mistake": "'su-kip' or missing /k/",
                "practice": "Continuous: ssskip"
            },
            {
                "sound": "-nd",
                "examples": ["hand", "stand", "friend", "and", "send"],
                "tip": "Tongue touches roof for /n/, stays for /d/",
                "common_mistake": "Only /n/ or /d/, not both",
                "practice": "han-d (both sounds clear)"
            },
            {
                "sound": "-ld",
                "examples": ["old", "cold", "told", "child", "field"],
                "tip": "/l/ tongue position, then /d/",
                "common_mistake": "Dropping the /l/ or /d/",
                "practice": "Feel: col-d (two movements)"
            }
        ]
    },
    "difficult_vowels": {
        "title": "English Vowel Sounds",
        "description": "English has more vowel sounds than many Asian languages",
        "challenge": "Distinguishing between similar vowels like /i/ (sheep) and /ɪ/ (ship)",
        "sounds": [
            {
                "sound": "/i:/ vs /ɪ/",
                "examples": ["sheep/ship", "seat/sit", "beat/bit", "feet/fit"],
                "tip": "/i:/ is long and tense, /ɪ/ is short and relaxed",
                "common_mistake": "Using same sound for both",
                "practice": "Long: sheeeep vs Short: ship"
            },
            {
                "sound": "/æ/ (cat)",
                "examples": ["cat", "bag", "hat", "map", "bad"],
                "tip": "Open mouth wide, tongue low and front",
                "common_mistake": "Saying /e/ like 'bet' instead of /æ/ like 'bat'",
                "practice": "Wide mouth: caaat"
            },
            {
                "sound": "/ʌ/ (cup)",
                "examples": ["cup", "bus", "run", "sun", "fun"],
                "tip": "Relaxed, mouth slightly open, tongue middle",
                "common_mistake": "Using /a/ or /o/ sound",
                "practice": "Relaxed: cuuup"
            },
            {
                "sound": "/ɔː/ (ball)",
                "examples": ["ball", "call", "fall", "tall", "small"],
                "tip": "Round lips, tongue back and low",
                "common_mistake": "Not rounding lips enough",
                "practice": "Round: baaall"
            }
        ]
    },
    "th_sounds": {
        "title": "The 'TH' Sounds",
        "description": "The most challenging sound for Asian learners",
        "challenge": "Most Asian languages don't have 'th' - often replaced with /s/, /t/, or /d/",
        "sounds": [
            {
                "sound": "/θ/ (voiceless)",
                "examples": ["think", "thank", "three", "bath", "math"],
                "tip": "Tongue between teeth, blow air (no voice)",
                "common_mistake": "Saying 'sink' instead of 'think'",
                "practice": "Tongue out: thththink"
            },
            {
                "sound": "/ð/ (voiced)",
                "examples": ["this", "that", "the", "mother", "brother"],
                "tip": "Same position but with voice - throat vibrates",
                "common_mistake": "Saying 'dis' instead of 'this'",
                "practice": "Voice on: thththis"
            }
        ]
    },
    "r_and_l": {
        "title": "R and L Sounds",
        "description": "Distinguishing /r/ and /l/ - common challenge for East Asian learners",
        "challenge": "Some languages don't distinguish between /r/ and /l/",
        "sounds": [
            {
                "sound": "/r/",
                "examples": ["red", "run", "right", "tree", "friend"],
                "tip": "Curl tongue back, don't touch roof",
                "common_mistake": "Using /l/ sound or rolling /r/",
                "practice": "Curl: rrrred (tongue back)"
            },
            {
                "sound": "/l/",
                "examples": ["light", "love", "like", "play", "blue"],
                "tip": "Tongue touches roof behind teeth",
                "common_mistake": "Keeping tongue in center",
                "practice": "Touch: llllight (feel the touch)"
            },
            {
                "sound": "r vs l practice",
                "examples": ["read/lead", "right/light", "rock/lock", "pray/play"],
                "tip": "For /r/ curl back, for /l/ touch front",
                "common_mistake": "Using same sound for both",
                "practice": "Contrast: read (curl) vs lead (touch)"
            }
        ]
    },
    "stress_and_rhythm": {
        "title": "Word Stress & Rhythm",
        "description": "English is a stress-timed language",
        "challenge": "Many Asian languages are syllable-timed, making English rhythm unnatural",
        "sounds": [
            {
                "sound": "Two-syllable stress",
                "examples": ["TEAcher", "STUdent", "HAPpy", "TAble"],
                "tip": "First syllable is STRONG and LONG, second is weak and short",
                "common_mistake": "Equal stress: tea-cher (wrong)",
                "practice": "Strong-weak: TEA-cher"
            },
            {
                "sound": "Three-syllable stress",
                "examples": ["FAMily", "BEAUtiful", "IMportant", "comPUter"],
                "tip": "One syllable is stressed, others are reduced",
                "common_mistake": "Stressing all syllables equally",
                "practice": "Find the stress: fam-i-ly (stress on 'fam')"
            }
        ]
    }
}

# ============ PRONUNCIATION ANALYSIS PROMPT ============

PRONUNCIATION_ANALYSIS_PROMPT = """You are an expert pronunciation teacher specializing in helping Asian English learners.

TASK: Analyze the pronunciation accuracy and provide detailed, actionable feedback.

TARGET TEXT: "{target_text}"
USER'S PRONUNCIATION: "{transcribed_text}"

ASIAN LEARNER CHALLENGES TO CHECK:
1. Final consonants (t, d, p, k, s, z) - Are they pronounced fully?
2. Consonant clusters (st, sp, sk, nd, ld) - Are they blended properly?
3. TH sounds - Is tongue between teeth?
4. R and L distinction - Are they clearly different?
5. Vowel sounds - Correct length and quality?
6. Word stress - Strong-weak pattern correct?

PROVIDE FEEDBACK IN THIS JSON FORMAT:
{{
  "overall_score": 0-100,
  "pronunciation_grade": "Excellent/Good/Fair/Needs Practice",
  "matched_words": ["list", "of", "correctly", "pronounced", "words"],
  "errors": [
    {{
      "word": "word_with_error",
      "issue": "specific_problem",
      "explanation": "why this is wrong",
      "correct_pronunciation": "how to say it",
      "tip": "actionable advice"
    }}
  ],
  "strengths": ["what was good"],
  "focus_areas": ["what to practice"],
  "phonics_lesson_recommended": "lesson_key_from_PHONICS_LESSONS or null"
}}

Be encouraging but honest. Focus on the 1-2 most important issues first.
If pronunciation is very different from target, recommend specific phonics lessons.
"""

# ============ REQUEST/RESPONSE MODELS ============

class PronunciationCheckRequest(BaseModel):
    user_id: str
    target_text: str
    audio_data: str  # Base64 encoded audio
    lesson_id: Optional[str] = None
    word_id: Optional[str] = None

class PronunciationFeedback(BaseModel):
    overall_score: int
    pronunciation_grade: str
    matched_words: List[str]
    errors: List[Dict[str, str]]
    strengths: List[str]
    focus_areas: List[str]
    phonics_lesson_recommended: Optional[str]
    transcribed_text: str
    target_text: str

class PhonicsLessonRequest(BaseModel):
    lesson_key: str  # e.g., "final_consonants", "th_sounds"

# ============ API ENDPOINTS ============

@router.post("/check")
async def check_pronunciation(audio_file: UploadFile, target_text: str, user_id: str):
    """
    Check pronunciation of recorded audio against target text
    Returns detailed feedback with specific issues and recommendations
    """
    try:
        # Read audio file
        audio_data = await audio_file.read()
        
        # Transcribe using Whisper
        transcription_result = await stt.transcribe(audio_data)
        transcribed_text = transcription_result.get("text", "")
        
        if not transcribed_text:
            raise HTTPException(status_code=400, detail="Could not transcribe audio")
        
        # Analyze pronunciation with LLM
        llm = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            session_id=f"pronunciation_{user_id}",
            system_message="You are an expert pronunciation teacher specializing in helping Asian English learners."
        )
        
        prompt = PRONUNCIATION_ANALYSIS_PROMPT.format(
            target_text=target_text,
            transcribed_text=transcribed_text
        )
        
        response = llm.chat([UserMessage(content=prompt)])
        
        # Parse JSON response
        import json
        import re
        feedback_text = response.content
        
        # Extract JSON from response
        json_match = re.search(r'\{[\s\S]*\}', feedback_text)
        if json_match:
            feedback_data = json.loads(json_match.group())
            feedback_data["transcribed_text"] = transcribed_text
            feedback_data["target_text"] = target_text
            
            return feedback_data
        else:
            # Fallback basic feedback
            return {
                "overall_score": 50,
                "pronunciation_grade": "Needs Practice",
                "matched_words": [],
                "errors": [{"word": "general", "issue": "Could not analyze in detail", "explanation": "", "correct_pronunciation": "", "tip": "Try speaking more clearly"}],
                "strengths": [],
                "focus_areas": ["clarity", "volume"],
                "phonics_lesson_recommended": None,
                "transcribed_text": transcribed_text,
                "target_text": target_text
            }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pronunciation check failed: {str(e)}")

@router.get("/phonics-lessons")
async def get_phonics_lessons():
    """Get all available phonics lessons"""
    return {
        "lessons": [
            {
                "key": key,
                "title": lesson["title"],
                "description": lesson["description"],
                "challenge": lesson["challenge"]
            }
            for key, lesson in PHONICS_LESSONS.items()
        ]
    }

@router.get("/phonics-lessons/{lesson_key}")
async def get_phonics_lesson_detail(lesson_key: str):
    """Get detailed phonics lesson content"""
    if lesson_key not in PHONICS_LESSONS:
        raise HTTPException(status_code=404, detail="Phonics lesson not found")
    
    return PHONICS_LESSONS[lesson_key]

@router.post("/practice-word")
async def practice_single_word(audio_file: UploadFile, word: str, user_id: str):
    """
    Practice pronunciation of a single word with instant feedback
    Simpler, faster feedback for individual word practice
    """
    try:
        audio_data = await audio_file.read()
        transcription_result = await stt.transcribe(audio_data)
        transcribed = transcription_result.get("text", "").strip().lower()
        target = word.strip().lower()
        
        # Simple comparison
        score = 100 if transcribed == target else 0
        
        # If not exact match, calculate similarity
        if score == 0:
            # Basic similarity check
            if transcribed in target or target in transcribed:
                score = 70
            else:
                # Check character overlap
                common_chars = set(transcribed) & set(target)
                score = int((len(common_chars) / len(target)) * 60)
        
        return {
            "word": word,
            "transcribed": transcribed,
            "score": score,
            "correct": score >= 80,
            "feedback": "Perfect!" if score == 100 else "Close! Try again." if score >= 70 else "Keep practicing!"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Word practice failed: {str(e)}")

# Export router
__all__ = ["router", "PHONICS_LESSONS"]
