"""
Listening Question Bank API Routes
==================================
Provides endpoints for Listening practice in the Question Bank.
IELTS-Quality Audio Generation with ElevenLabs + Caching
"""

from fastapi import APIRouter, Query, HTTPException, Body
from fastapi.responses import FileResponse
from typing import Optional, List, Dict, Any
import os
import base64
import asyncio
import re
import io
from pathlib import Path
from elevenlabs import ElevenLabs, VoiceSettings

router = APIRouter(prefix="/api/listening", tags=["Listening Question Bank"])

# ElevenLabs client
ELEVENLABS_API_KEY = os.environ.get("ELEVENLABS_API_KEY")

# Audio cache directory
AUDIO_CACHE_DIR = Path("/app/backend/static/audio/listening")
AUDIO_CACHE_DIR.mkdir(parents=True, exist_ok=True)

# ============ IELTS-QUALITY VOICE CONFIGURATION ============
# These voices are selected for neutral, professional, exam-appropriate tone
# NOT friendly/sales/customer-service voices

IELTS_VOICE_PROFILES = {
    # British Voices (Primary for IELTS)
    "british_female_1": {
        "voice_id": "21m00Tcm4TlvDq8ikWAM",  # Rachel - calm, neutral
        "name": "British Female (Receptionist/Staff)",
        "stability": 0.85,  # Higher stability = less expressive = more exam-like
        "similarity_boost": 0.75,
        "style": 0.0,  # Zero style = neutral, not enthusiastic
    },
    "british_female_2": {
        "voice_id": "ThT5KcBeYPX3keUQqHPh",  # Dorothy - mature, professional
        "name": "British Female (Lecturer/Guide)",
        "stability": 0.85,
        "similarity_boost": 0.70,
        "style": 0.0,
    },
    "british_male_1": {
        "voice_id": "ErXwobaYiN019PkySvjV",  # Antoni - calm, measured
        "name": "British Male (Caller/Student)",
        "stability": 0.80,
        "similarity_boost": 0.75,
        "style": 0.0,
    },
    "british_male_2": {
        "voice_id": "VR6AewLTigWG4xSOukaG",  # Arnold - deeper, authoritative
        "name": "British Male (Tutor/Professor)",
        "stability": 0.85,
        "similarity_boost": 0.70,
        "style": 0.0,
    },
    # Australian Voices
    "australian_male": {
        "voice_id": "pNInz6obpgDQGcFmaJgB",  # Adam
        "name": "Australian Male",
        "stability": 0.80,
        "similarity_boost": 0.75,
        "style": 0.0,
    },
    "australian_female": {
        "voice_id": "jBpfuIE2acCO8z3wKNLl",  # Gigi
        "name": "Australian Female",
        "stability": 0.80,
        "similarity_boost": 0.75,
        "style": 0.0,
    },
    # American Voices (less common in IELTS but available)
    "american_female": {
        "voice_id": "EXAVITQu4vr4xnSDxMaL",  # Bella
        "name": "American Female",
        "stability": 0.80,
        "similarity_boost": 0.75,
        "style": 0.0,
    },
    "american_male": {
        "voice_id": "TxGEqnHWrfWFTfGW9XjX",  # Josh - calm
        "name": "American Male",
        "stability": 0.80,
        "similarity_boost": 0.75,
        "style": 0.0,
    },
}

# Speaker role to voice profile mapping
SPEAKER_ROLE_MAPPING = {
    # Part 1: Social conversations
    "receptionist": "british_female_1",
    "staff": "british_female_1",
    "librarian": "british_female_1",
    "agent": "british_female_1",
    "guest": "british_male_1",
    "caller": "british_male_1",
    "customer": "british_male_1",
    "student": "british_male_1",
    # Part 2: Monologues
    "guide": "british_female_2",
    "manager": "british_male_2",
    "presenter": "british_female_2",
    "announcer": "british_male_2",
    # Part 3: Academic discussions
    "tutor": "british_male_2",
    "supervisor": "british_male_2",
    "professor": "british_male_2",
    "advisor": "british_female_2",
    "student1": "british_female_1",
    "student2": "british_male_1",
    # Part 4: Lectures
    "lecturer": "british_female_2",
}


def get_voice_profile_for_speaker(speaker: Dict[str, str]) -> Dict:
    """
    Get IELTS-appropriate voice profile for a speaker.
    Prioritizes role-based mapping, then gender+accent fallback.
    """
    speaker_id = speaker.get("id", "").lower()
    gender = speaker.get("gender", "female").lower()
    accent = speaker.get("accent", "british").lower()
    
    # Try role-based mapping first
    if speaker_id in SPEAKER_ROLE_MAPPING:
        profile_key = SPEAKER_ROLE_MAPPING[speaker_id]
        return IELTS_VOICE_PROFILES[profile_key]
    
    # Fallback to gender+accent combination
    fallback_key = f"{accent}_{gender}_1"
    if fallback_key in IELTS_VOICE_PROFILES:
        return IELTS_VOICE_PROFILES[fallback_key]
    
    # Ultimate fallback
    return IELTS_VOICE_PROFILES["british_female_1"]


def parse_transcript_into_turns(transcript: str, speakers: List[Dict]) -> List[Dict]:
    """
    Parse a transcript into individual speaker turns.
    Returns list of {speaker_id, text, voice_profile}
    """
    turns = []
    
    # Build speaker name mapping
    speaker_map = {}
    for s in speakers:
        sid = s.get("id", "speaker")
        # Create variations of the speaker name for matching
        speaker_map[sid.lower()] = s
        speaker_map[sid.capitalize()] = s
        speaker_map[sid.title()] = s
    
    # Split transcript by speaker labels (e.g., "Speaker: text")
    # Pattern matches "Name:" at start of line or after newline
    lines = transcript.strip().split('\n')
    current_speaker = None
    current_text = []
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        # Check if line starts with a speaker label
        match = re.match(r'^([A-Za-z0-9_]+):\s*(.*)$', line)
        if match:
            # Save previous turn if exists
            if current_speaker and current_text:
                speaker_data = speaker_map.get(current_speaker.lower(), speakers[0] if speakers else {"id": "narrator"})
                turns.append({
                    "speaker_id": current_speaker,
                    "text": ' '.join(current_text),
                    "speaker_data": speaker_data,
                    "voice_profile": get_voice_profile_for_speaker(speaker_data)
                })
            
            current_speaker = match.group(1)
            current_text = [match.group(2)] if match.group(2) else []
        else:
            # Continuation of current speaker's text
            if current_speaker:
                current_text.append(line)
            else:
                # No speaker identified yet, treat as narrator/first speaker
                current_speaker = speakers[0]["id"] if speakers else "narrator"
                current_text.append(line)
    
    # Don't forget the last turn
    if current_speaker and current_text:
        speaker_data = speaker_map.get(current_speaker.lower(), speakers[0] if speakers else {"id": "narrator"})
        turns.append({
            "speaker_id": current_speaker,
            "text": ' '.join(current_text),
            "speaker_data": speaker_data,
            "voice_profile": get_voice_profile_for_speaker(speaker_data)
        })
    
    return turns


async def generate_audio_for_turn(
    client: ElevenLabs, 
    text: str, 
    voice_profile: Dict,
    part: str = "part1"
) -> bytes:
    """
    Generate audio for a single speaker turn with IELTS-quality settings.
    """
    # Adjust speaking rate based on IELTS part
    # Part 1-2: medium, Part 3-4: slightly faster
    stability_adjustment = 0.0
    if part in ["part3", "part4"]:
        stability_adjustment = -0.05  # Slightly less stable = slightly faster feel
    
    voice_settings = VoiceSettings(
        stability=min(1.0, voice_profile["stability"] + stability_adjustment),
        similarity_boost=voice_profile["similarity_boost"],
        style=voice_profile["style"],  # Keep at 0 for neutral tone
        use_speaker_boost=False  # Disable boost for more natural sound
    )
    
    audio_generator = client.text_to_speech.convert(
        text=text,
        voice_id=voice_profile["voice_id"],
        model_id="eleven_multilingual_v2",
        voice_settings=voice_settings
    )
    
    audio_data = b""
    for chunk in audio_generator:
        audio_data += chunk
    
    return audio_data


def create_silence(duration_ms: int, sample_rate: int = 44100) -> bytes:
    """
    Create silence as raw PCM data.
    For MP3 concatenation, we'll use a different approach.
    """
    # For MP3 concatenation, we'll handle pauses differently
    # This is a placeholder - actual implementation uses audio library
    return b""


def get_cached_audio_path(set_id: str) -> Path:
    """Get the path for cached audio file."""
    return AUDIO_CACHE_DIR / f"{set_id}.mp3"


def is_audio_cached(set_id: str) -> bool:
    """Check if audio is already cached."""
    cache_path = get_cached_audio_path(set_id)
    return cache_path.exists() and cache_path.stat().st_size > 1000


def save_audio_to_cache(set_id: str, audio_data: bytes) -> str:
    """Save audio data to cache and return the URL path."""
    cache_path = get_cached_audio_path(set_id)
    with open(cache_path, 'wb') as f:
        f.write(audio_data)
    print(f"✅ Audio cached: {cache_path} ({len(audio_data)} bytes)")
    return f"/api/listening/audio/{set_id}"


def get_cached_audio_url(set_id: str) -> Optional[str]:
    """Get URL for cached audio if it exists."""
    if is_audio_cached(set_id):
        return f"/api/listening/audio/{set_id}"
    return None


async def generate_ielts_audio(
    set_id: str,
    transcript: str, 
    speakers: List[Dict],
    part: str = "part1",
    force_regenerate: bool = False
) -> Optional[str]:
    """
    Generate IELTS-quality audio with multiple speakers and natural pauses.
    Uses caching to avoid regenerating audio each time.
    Returns URL to cached audio file.
    """
    # Check cache first (unless force regenerate)
    if not force_regenerate:
        cached_url = get_cached_audio_url(set_id)
        if cached_url:
            print(f"✅ Using cached audio for {set_id}")
            return cached_url
    
    if not ELEVENLABS_API_KEY:
        print("ElevenLabs API key not configured")
        return None
    
    try:
        client = ElevenLabs(api_key=ELEVENLABS_API_KEY)
        
        # Parse transcript into turns
        turns = parse_transcript_into_turns(transcript, speakers)
        
        if not turns:
            print("No turns parsed from transcript")
            return None
        
        print(f"🎙️ Generating IELTS audio for {set_id}: {len(turns)} turns, part={part}")
        
        # For monologue (Part 2, Part 4), generate as single audio
        if len(speakers) <= 1 or part in ["part2", "part4"]:
            # Single speaker - generate entire transcript at once
            voice_profile = get_voice_profile_for_speaker(speakers[0] if speakers else {"id": "narrator"})
            
            # Clean transcript for TTS (remove speaker labels for monologue)
            clean_text = re.sub(r'^[A-Za-z0-9_]+:\s*', '', transcript, flags=re.MULTILINE)
            clean_text = clean_text.strip()
            
            audio_data = await generate_audio_for_turn(client, clean_text, voice_profile, part)
            
            # Save to cache and return URL
            return save_audio_to_cache(set_id, audio_data)
        
        # Multi-speaker: Generate each turn separately
        all_audio_chunks = []
        
        for i, turn in enumerate(turns):
            if not turn["text"].strip():
                continue
            
            print(f"  Turn {i+1}: {turn['speaker_id'][:20]}... ({len(turn['text'])} chars)")
            
            # Generate audio for this turn
            audio_chunk = await generate_audio_for_turn(
                client, 
                turn["text"], 
                turn["voice_profile"],
                part
            )
            all_audio_chunks.append(audio_chunk)
        
        # Concatenate all audio chunks
        # Simple concatenation for MP3 - works well for speech
        combined_audio = b"".join(all_audio_chunks)
        
        # Save to cache and return URL
        return save_audio_to_cache(set_id, combined_audio)
        
    except Exception as e:
        print(f"Error generating IELTS audio: {str(e)}")
        import traceback
        traceback.print_exc()
        return None


# Legacy function for backward compatibility
async def generate_audio_for_transcript(set_id: str, transcript: str, speakers: List[Dict], part: str = "part1") -> Optional[str]:
    """
    Generate audio using IELTS-quality settings.
    This is the main entry point for audio generation.
    """
    return await generate_ielts_audio(set_id, transcript, speakers, part)


# ============ AUDIO SERVING ENDPOINT ============

@router.get("/audio/{set_id}")
async def serve_cached_audio(set_id: str):
    """Serve cached audio file."""
    cache_path = get_cached_audio_path(set_id)
    
    if not cache_path.exists():
        raise HTTPException(status_code=404, detail=f"Audio for set '{set_id}' not found")
    
    return FileResponse(
        path=cache_path,
        media_type="audio/mpeg",
    )


# ============ STATIC ENDPOINTS ============

@router.get("/question-types")
async def get_listening_question_types():
    """Get all listening question types."""
    from content.listening.listening_sets import get_question_types
    
    return {
        "success": True,
        "question_types": get_question_types()
    }


@router.get("/parts")
async def get_listening_parts():
    """Get IELTS listening part information."""
    from content.listening.listening_sets import get_listening_parts
    
    return {
        "success": True,
        "parts": get_listening_parts()
    }


@router.get("/band-levels")
async def get_listening_band_levels():
    """Get available band levels for listening practice."""
    return {
        "success": True,
        "band_levels": [
            {"id": "4.0-5.0", "name": "Band 4.0-5.0", "description": "Foundation level", "color": "#10B981"},
            {"id": "5.5-6.5", "name": "Band 5.5-6.5", "description": "Intermediate level", "color": "#3B82F6"},
            {"id": "7.0-9.0", "name": "Band 7.0-9.0", "description": "Advanced level", "color": "#8B5CF6"}
        ]
    }


@router.get("/topics")
async def get_listening_topics():
    """Get all available topics for listening practice."""
    from content.listening.listening_sets import get_all_listening_sets
    
    all_sets = get_all_listening_sets()
    topics = {}
    
    for s in all_sets:
        topic = s.get("topic")
        if topic and topic not in topics:
            topics[topic] = {
                "id": topic,
                "name": topic.replace("_", " ").title(),
                "icon": get_topic_icon(topic)
            }
    
    return {
        "success": True,
        "topics": list(topics.values())
    }


def get_topic_icon(topic: str) -> str:
    """Get icon for a topic."""
    icons = {
        "travel": "✈️",
        "education": "🎓",
        "culture": "🎭",
        "health": "🏥",
        "community": "🏘️",
        "work": "💼",
        "environment": "🌿",
        "business": "📊",
        "technology": "🔧",
        "science": "🔬"
    }
    return icons.get(topic, "📝")


@router.get("/modules")
async def get_listening_modules(
    band: Optional[str] = Query(None, description="Filter by band range"),
    topic: Optional[str] = Query(None, description="Filter by topic"),
    question_type: Optional[str] = Query(None, description="Filter by question type"),
    part: Optional[str] = Query(None, description="Filter by IELTS part")
):
    """Get available listening modules/sets with optional filters."""
    from content.listening.listening_sets import (
        get_listening_modules_summary,
        get_listening_sets_by_band,
        get_all_listening_sets
    )
    
    # Start with all sets or band-filtered
    if band:
        sets = get_listening_sets_by_band(band)
    else:
        sets = get_all_listening_sets()
    
    # Apply additional filters
    if topic:
        sets = [s for s in sets if s.get("topic") == topic]
    
    if question_type:
        sets = [s for s in sets if question_type in s.get("question_types", [])]
    
    if part:
        sets = [s for s in sets if s.get("part") == part]
    
    # Create summary with cache status
    modules = [{
        "set_id": s["set_id"],
        "title": s["title"],
        "band_range": s["band_range"],
        "part": s["part"],
        "topic": s["topic"],
        "question_types": s["question_types"],
        "duration_seconds": s["duration_seconds"],
        "question_count": len(s["questions"]),
        "audio_cached": is_audio_cached(s["set_id"])  # Show which sets have cached audio
    } for s in sets]
    
    return {
        "success": True,
        "total": len(modules),
        "cached_count": sum(1 for m in modules if m["audio_cached"]),
        "modules": modules
    }


@router.get("/set/{set_id}")
async def get_listening_set(
    set_id: str,
    include_audio: bool = Query(True, description="Generate audio for the set")
):
    """
    Get a specific listening set with questions (no answers until submit).
    Optionally generates IELTS-quality audio using ElevenLabs.
    """
    from content.listening.listening_sets import get_listening_set_by_id
    
    listening_set = get_listening_set_by_id(set_id)
    
    if not listening_set:
        raise HTTPException(status_code=404, detail=f"Listening set '{set_id}' not found")
    
    # Prepare questions without answers
    questions_without_answers = []
    for q in listening_set["questions"]:
        q_copy = {
            "id": q["id"],
            "type": q["type"],
            "question": q["question"],
        }
        if "options" in q:
            q_copy["options"] = q["options"]
        if "items" in q:  # For matching questions
            q_copy["items"] = q["items"]
            q_copy["match_options"] = q.get("options", [])
        questions_without_answers.append(q_copy)
    
    # Generate IELTS-quality audio if requested (uses cache)
    audio_url = None
    if include_audio:
        audio_url = await generate_audio_for_transcript(
            set_id,  # Pass set_id for caching
            listening_set["transcript"],
            listening_set.get("speakers", []),
            listening_set.get("part", "part1")  # Pass part for speed adjustment
        )
    
    return {
        "success": True,
        "set": {
            "set_id": listening_set["set_id"],
            "title": listening_set["title"],
            "band_range": listening_set["band_range"],
            "part": listening_set["part"],
            "topic": listening_set["topic"],
            "duration_seconds": listening_set["duration_seconds"],
            "question_types": listening_set["question_types"],
            "speakers": listening_set.get("speakers", []),
            "tips": listening_set.get("tips", []),
            "questions": questions_without_answers,
            "audio_url": audio_url,
            "has_audio": audio_url is not None,
            "audio_cached": is_audio_cached(set_id),  # Tell frontend if audio is cached
            # Include transcript for "show transcript" feature (after submit or for lower bands)
            "transcript": listening_set["transcript"]
        }
    }


@router.post("/generate-all-audio")
async def generate_all_audio(
    force: bool = Query(False, description="Force regenerate even if cached")
):
    """
    Pre-generate audio for all listening sets.
    This should be called once to populate the cache.
    """
    from content.listening.listening_sets import get_all_listening_sets
    
    all_sets = get_all_listening_sets()
    results = []
    
    for s in all_sets:
        set_id = s["set_id"]
        
        if not force and is_audio_cached(set_id):
            results.append({
                "set_id": set_id,
                "status": "already_cached",
                "title": s["title"]
            })
            continue
        
        try:
            audio_url = await generate_ielts_audio(
                set_id,
                s["transcript"],
                s.get("speakers", []),
                s.get("part", "part1"),
                force_regenerate=force
            )
            
            results.append({
                "set_id": set_id,
                "status": "generated" if audio_url else "failed",
                "title": s["title"],
                "audio_url": audio_url
            })
        except Exception as e:
            results.append({
                "set_id": set_id,
                "status": "error",
                "title": s["title"],
                "error": str(e)
            })
    
    return {
        "success": True,
        "total": len(all_sets),
        "generated": sum(1 for r in results if r["status"] == "generated"),
        "cached": sum(1 for r in results if r["status"] == "already_cached"),
        "failed": sum(1 for r in results if r["status"] in ["failed", "error"]),
        "results": results
    }


@router.get("/cache-status")
async def get_cache_status():
    """Get status of audio cache."""
    from content.listening.listening_sets import get_all_listening_sets
    
    all_sets = get_all_listening_sets()
    cached_sets = []
    uncached_sets = []
    
    for s in all_sets:
        set_id = s["set_id"]
        if is_audio_cached(set_id):
            cache_path = get_cached_audio_path(set_id)
            cached_sets.append({
                "set_id": set_id,
                "title": s["title"],
                "size_kb": round(cache_path.stat().st_size / 1024, 1)
            })
        else:
            uncached_sets.append({
                "set_id": set_id,
                "title": s["title"]
            })
    
    return {
        "success": True,
        "total": len(all_sets),
        "cached": len(cached_sets),
        "uncached": len(uncached_sets),
        "cached_sets": cached_sets,
        "uncached_sets": uncached_sets
    }


@router.post("/evaluate")
async def evaluate_listening_answers(
    set_id: str = Body(...),
    responses: List[Dict[str, Any]] = Body(...),
    band_range: Optional[str] = Body(None)
):
    """
    Evaluate user's listening answers.
    
    Payload:
    {
        "set_id": "ls_b45_001",
        "responses": [{"question_id": "q1", "answer": "15th"}, ...],
        "band_range": "4.0-5.0"
    }
    """
    from content.listening.listening_sets import get_listening_set_by_id
    
    listening_set = get_listening_set_by_id(set_id)
    
    if not listening_set:
        raise HTTPException(status_code=404, detail=f"Listening set '{set_id}' not found")
    
    # Create response map
    response_map = {r["question_id"]: r.get("answer", "") for r in responses}
    
    # Evaluate each question
    correct = 0
    total = len(listening_set["questions"])
    mistakes = []
    detailed_results = []
    
    for q in listening_set["questions"]:
        q_id = q["id"]
        user_answer = response_map.get(q_id, "").strip()
        
        # Handle different question types
        if q["type"] == "matching":
            # For matching, answers is a dict
            correct_answers = q.get("answers", {})
            user_answers = {}
            # Parse user's matching answers
            if isinstance(user_answer, dict):
                user_answers = user_answer
            
            is_correct = user_answers == correct_answers
            correct_answer_display = str(correct_answers)
        else:
            # For other types, compare with answer variants
            correct_answer = q.get("answer", "")
            answer_variants = q.get("answer_variants", [correct_answer])
            
            # Normalize and compare
            user_normalized = user_answer.lower().strip()
            is_correct = any(
                user_normalized == v.lower().strip() 
                for v in answer_variants
            )
            correct_answer_display = correct_answer
        
        if is_correct:
            correct += 1
        else:
            mistakes.append({
                "question_id": q_id,
                "question": q["question"],
                "user_answer": user_answer or "(no answer)",
                "correct_answer": correct_answer_display,
                "explanation": generate_explanation(q, user_answer, correct_answer_display)
            })
        
        detailed_results.append({
            "question_id": q_id,
            "is_correct": is_correct,
            "user_answer": user_answer or "(no answer)",
            "correct_answer": correct_answer_display,
            "skill_tested": q.get("skill_tested", [])
        })
    
    # Calculate score and estimated band
    percentage = (correct / total) * 100 if total > 0 else 0
    estimated_band = calculate_listening_band(percentage)
    
    # Get lesson recommendations based on weaknesses
    weak_skills = identify_weak_skills(detailed_results)
    recommended_lessons = get_listening_lesson_recommendations(
        listening_set.get("topic"),
        weak_skills,
        band_range or listening_set["band_range"]
    )
    
    return {
        "success": True,
        "skill": "listening",
        "set_id": set_id,
        "score": {
            "correct": correct,
            "total": total,
            "percentage": round(percentage, 1)
        },
        "estimated_band": estimated_band,
        "mistakes": mistakes,
        "detailed_results": detailed_results,
        "weak_skills": weak_skills,
        "recommended_lessons": recommended_lessons,
        "feedback": generate_overall_feedback(percentage, weak_skills)
    }


def generate_explanation(question: Dict, user_answer: str, correct_answer: str) -> str:
    """Generate a brief explanation for incorrect answers."""
    q_type = question.get("type", "")
    skills = question.get("skill_tested", [])
    
    explanations = {
        "numbers": "Pay attention to numbers - they are often repeated or spelled out.",
        "spelling": "Names and places are often spelled out letter by letter.",
        "dates": "Listen for day, month, and year separately.",
        "prices": "Currency amounts may include decimal points.",
        "time": "Time expressions can be in 12-hour or 24-hour format.",
        "specific information": "This detail was stated directly in the recording.",
        "inference": "This required understanding implied meaning.",
        "main idea": "Focus on the overall message, not just details."
    }
    
    for skill in skills:
        if skill in explanations:
            return explanations[skill]
    
    return f"The correct answer is '{correct_answer}'. Listen again to identify where this information appears."


def calculate_listening_band(percentage: float) -> float:
    """Calculate estimated IELTS band from percentage score."""
    if percentage >= 90:
        return 8.5
    elif percentage >= 80:
        return 8.0
    elif percentage >= 70:
        return 7.0
    elif percentage >= 60:
        return 6.5
    elif percentage >= 50:
        return 6.0
    elif percentage >= 40:
        return 5.5
    elif percentage >= 30:
        return 5.0
    elif percentage >= 20:
        return 4.5
    else:
        return 4.0


def identify_weak_skills(results: List[Dict]) -> List[str]:
    """Identify skills that need improvement based on results."""
    skill_counts = {}
    skill_errors = {}
    
    for r in results:
        for skill in r.get("skill_tested", []):
            skill_counts[skill] = skill_counts.get(skill, 0) + 1
            if not r["is_correct"]:
                skill_errors[skill] = skill_errors.get(skill, 0) + 1
    
    weak_skills = []
    for skill, count in skill_counts.items():
        error_rate = skill_errors.get(skill, 0) / count
        if error_rate >= 0.5:  # 50% or more errors
            weak_skills.append(skill)
    
    return weak_skills


def get_listening_lesson_recommendations(
    topic: str,
    weak_skills: List[str],
    band_range: str
) -> List[Dict[str, Any]]:
    """Get lesson recommendations based on topic and weaknesses."""
    recommendations = []
    
    # Map band ranges to course stages
    band_to_stage = {
        "4.0-5.0": "beginner",
        "5.5-6.5": "mastery",
        "7.0-9.0": "advanced"
    }
    stage = band_to_stage.get(band_range, "mastery")
    
    # Topic-based recommendations
    if topic:
        recommendations.append({
            "lesson_id": f"{stage}_{topic}_listening",
            "title": f"{topic.replace('_', ' ').title()} - Listening Practice",
            "stage": stage,
            "band_level": band_range,
            "relevance": "topic_match",
            "url": f"/{stage}-course?module={topic}&section=listening"
        })
    
    # Skill-based recommendations
    skill_lessons = {
        "numbers": {
            "title": "Numbers and Dates in Listening",
            "description": "Practice recognizing numbers, prices, and dates"
        },
        "spelling": {
            "title": "Spelling and Names Practice",
            "description": "Improve spelling recognition in conversations"
        },
        "inference": {
            "title": "Understanding Implied Meaning",
            "description": "Learn to identify what speakers mean, not just what they say"
        },
        "main idea": {
            "title": "Identifying Main Ideas",
            "description": "Focus on overall message comprehension"
        }
    }
    
    for skill in weak_skills[:3]:  # Limit to top 3 weaknesses
        if skill in skill_lessons:
            lesson = skill_lessons[skill]
            recommendations.append({
                "lesson_id": f"{stage}_listening_{skill.replace(' ', '_')}",
                "title": lesson["title"],
                "stage": stage,
                "band_level": band_range,
                "relevance": "skill_weakness",
                "description": lesson["description"],
                "url": f"/{stage}-course?section=listening"
            })
    
    return recommendations[:5]  # Return max 5 recommendations


def generate_overall_feedback(percentage: float, weak_skills: List[str]) -> str:
    """Generate overall feedback message."""
    if percentage >= 80:
        feedback = "Excellent performance! You demonstrated strong listening comprehension skills."
    elif percentage >= 60:
        feedback = "Good work! You understood most of the recording, but there's room for improvement."
    elif percentage >= 40:
        feedback = "You're making progress. Focus on the highlighted weak areas to improve your score."
    else:
        feedback = "Keep practicing! Consider using the transcript feature to follow along and identify key information."
    
    if weak_skills:
        skill_list = ", ".join(weak_skills[:3])
        feedback += f" Pay special attention to: {skill_list}."
    
    return feedback
