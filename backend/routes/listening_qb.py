"""
Listening Question Bank API Routes
==================================
Provides endpoints for Listening practice in the Question Bank.
"""

from fastapi import APIRouter, Query, HTTPException, Body
from typing import Optional, List, Dict, Any
import os
import base64
import asyncio
from elevenlabs import ElevenLabs, VoiceSettings

router = APIRouter(prefix="/api/listening", tags=["Listening Question Bank"])

# ElevenLabs client
ELEVENLABS_API_KEY = os.environ.get("ELEVENLABS_API_KEY")

# Voice mappings for different speaker types
VOICE_MAPPING = {
    # British voices
    "female_british": "21m00Tcm4TlvDq8ikWAM",  # Rachel
    "male_british": "ErXwobaYiN019PkySvjV",    # Antoni
    # American voices
    "female_american": "EXAVITQu4vr4xnSDxMaL",  # Bella
    "male_american": "VR6AewLTigWG4xSOukaG",   # Arnold
    # Australian voices
    "male_australian": "pNInz6obpgDQGcFmaJgB",  # Adam
    "female_australian": "jBpfuIE2acCO8z3wKNLl", # Gigi
}

# Default voice for fallback
DEFAULT_VOICE = "21m00Tcm4TlvDq8ikWAM"  # Rachel


def get_voice_id(speaker: Dict[str, str]) -> str:
    """Get ElevenLabs voice ID for a speaker."""
    gender = speaker.get("gender", "female")
    accent = speaker.get("accent", "british")
    key = f"{gender}_{accent}"
    return VOICE_MAPPING.get(key, DEFAULT_VOICE)


async def generate_audio_for_transcript(transcript: str, speakers: List[Dict]) -> Optional[str]:
    """
    Generate audio using ElevenLabs TTS.
    Returns base64 encoded audio data.
    """
    if not ELEVENLABS_API_KEY:
        return None
    
    try:
        client = ElevenLabs(api_key=ELEVENLABS_API_KEY)
        
        # For simplicity, use the first speaker's voice for the whole transcript
        # In production, you'd want to split by speaker and concatenate
        voice_id = get_voice_id(speakers[0]) if speakers else DEFAULT_VOICE
        
        voice_settings = VoiceSettings(
            stability=0.7,
            similarity_boost=0.8,
            style=0.5,
            use_speaker_boost=True
        )
        
        audio_generator = client.text_to_speech.convert(
            text=transcript,
            voice_id=voice_id,
            model_id="eleven_multilingual_v2",
            voice_settings=voice_settings
        )
        
        # Collect audio data
        audio_data = b""
        for chunk in audio_generator:
            audio_data += chunk
        
        # Convert to base64
        audio_b64 = base64.b64encode(audio_data).decode()
        return f"data:audio/mpeg;base64,{audio_b64}"
        
    except Exception as e:
        print(f"Error generating audio: {str(e)}")
        return None


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
    
    # Create summary
    modules = [{
        "set_id": s["set_id"],
        "title": s["title"],
        "band_range": s["band_range"],
        "part": s["part"],
        "topic": s["topic"],
        "question_types": s["question_types"],
        "duration_seconds": s["duration_seconds"],
        "question_count": len(s["questions"])
    } for s in sets]
    
    return {
        "success": True,
        "total": len(modules),
        "modules": modules
    }


@router.get("/set/{set_id}")
async def get_listening_set(
    set_id: str,
    include_audio: bool = Query(True, description="Generate audio for the set")
):
    """
    Get a specific listening set with questions (no answers until submit).
    Optionally generates audio using ElevenLabs.
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
    
    # Generate audio if requested
    audio_url = None
    if include_audio:
        audio_url = await generate_audio_for_transcript(
            listening_set["transcript"],
            listening_set.get("speakers", [])
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
            # Include transcript for "show transcript" feature (after submit or for lower bands)
            "transcript": listening_set["transcript"]
        }
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
