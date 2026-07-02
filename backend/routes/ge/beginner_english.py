"""
Beginner English course endpoints (GE)
======================================
Single job: serve beginner_english_lessons and run the beginner-friendly
(no band descriptors) speaking/writing evaluations + listening audio
generation/cache. GENERAL ENGLISH product surface.

Extracted verbatim from server.py (Faz 1 refactor, 2026-07-02).
"""

import json
import logging
import os
import uuid
from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel

import auth_session
from services.llm_compat import LlmChat, UserMessage

router = APIRouter()

db = None


def set_db(database):
    global db
    db = database


@router.get("/beginner-english/lessons")
async def get_beginner_lessons():
    """Get all beginner English lessons"""
    lessons = await db.beginner_english_lessons.find({}, {"_id": 0}).to_list(100)
    return lessons

@router.get("/beginner-english/lessons/{lesson_id}")
async def get_beginner_lesson(lesson_id: str):
    """Get a specific beginner English lesson"""
    lesson = await db.beginner_english_lessons.find_one({"id": lesson_id}, {"_id": 0})
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson

class BeginnerSpeakingRequest(BaseModel):
    question: str
    model_answer: str
    user_response: str

@router.post("/beginner-english/evaluate-speaking")
async def evaluate_beginner_speaking(request: BeginnerSpeakingRequest, _caller: dict = Depends(auth_session.current_user)):
    """Evaluate beginner speaking response with simple feedback"""
    try:
        chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            session_id=str(uuid.uuid4()),
            system_message="You are a friendly English teacher helping beginner students."
        ).with_model("openai", "gpt-4o")
        
        prompt = f"""You are a friendly English teacher for beginner students (Band 4.5 and below).
        
Question: {request.question}
Model Answer: {request.model_answer}
Student's Response: {request.user_response}

Evaluate the student's response. Be encouraging and use simple language.

Return JSON:
{{
    "score": <0-100>,
    "feedback": "<Simple, encouraging feedback in 1-2 sentences>",
    "tip": "<One simple tip to improve>"
}}"""

        response = await chat.send_message(UserMessage(text=prompt))
        
        response_text = str(response).strip()
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        import re
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            return json.loads(json_match.group())
        
        return {"score": 60, "feedback": "Good try! Keep practicing.", "tip": "Try to answer in complete sentences."}
        
    except Exception as e:
        logging.getLogger(__name__).error(f"Beginner speaking evaluation error: {e}")
        return {"score": 60, "feedback": "Good effort! Keep practicing.", "tip": "Practice speaking more."}

class BeginnerWritingRequest(BaseModel):
    task: str
    model_answer: str
    user_response: str

@router.post("/beginner-english/evaluate-writing")
async def evaluate_beginner_writing(request: BeginnerWritingRequest, _caller: dict = Depends(auth_session.current_user)):
    """Evaluate beginner writing response with simple feedback"""
    try:
        chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            session_id=str(uuid.uuid4()),
            system_message="You are a friendly English teacher helping beginner students."
        ).with_model("openai", "gpt-4o")
        
        prompt = f"""You are a friendly English teacher for beginner students (Band 4.5 and below).
        
Writing Task: {request.task}
Model Answer: {request.model_answer}
Student's Writing: {request.user_response}

Evaluate the student's writing. Be encouraging and use simple language.

Return JSON:
{{
    "score": <0-100>,
    "feedback": "<Simple, encouraging feedback in 2-3 sentences>",
    "grammar_tips": ["<1-2 simple grammar tips if needed>"]
}}"""

        response = await chat.send_message(UserMessage(text=prompt))
        
        response_text = str(response).strip()
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        import re
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            return json.loads(json_match.group())
        
        return {"score": 60, "feedback": "Good try! Keep writing.", "grammar_tips": ["Check your verb forms."]}
        
    except Exception as e:
        logging.getLogger(__name__).error(f"Beginner writing evaluation error: {e}")
        return {"score": 60, "feedback": "Good effort! Keep writing.", "grammar_tips": []}


# ============ Listening Audio Generation ============

from utils.multi_speaker_tts import generate_multi_speaker_audio

class ListeningAudioRequest(BaseModel):
    lesson_id: str
    transcript: str
    level: str = "beginner"

@router.post("/beginner-english/generate-listening-audio")
async def generate_listening_audio(request: ListeningAudioRequest):
    """Generate multi-speaker audio for listening section using Azure TTS"""
    try:
        audio_base64 = await generate_multi_speaker_audio(
            transcript=request.transcript,
            level=request.level
        )
        return {
            "success": True,
            "audio_base64": audio_base64,
            "format": "mp3"
        }
    except Exception as e:
        logging.getLogger(__name__).error(f"Audio generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/beginner-english/listening-audio/{lesson_id}")
async def get_listening_audio(lesson_id: str):
    """Get or generate listening audio for a lesson"""
    # First check if pre-generated audio exists
    cached = await db.listening_audio_cache.find_one({"lesson_id": lesson_id}, {"_id": 0})
    if cached and cached.get("audio_base64"):
        return {
            "success": True,
            "audio_base64": cached["audio_base64"],
            "format": "mp3",
            "cached": True
        }
    
    # Get lesson and generate audio
    lesson = await db.beginner_english_lessons.find_one({"id": lesson_id}, {"_id": 0})
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    listening = lesson.get("listening")
    if not listening or not listening.get("transcript"):
        raise HTTPException(status_code=404, detail="No listening content for this lesson")
    
    try:
        audio_base64 = await generate_multi_speaker_audio(
            transcript=listening["transcript"],
            level="beginner"
        )
        
        # Cache the generated audio
        await db.listening_audio_cache.update_one(
            {"lesson_id": lesson_id},
            {"$set": {
                "lesson_id": lesson_id,
                "audio_base64": audio_base64,
                "generated_at": datetime.now(timezone.utc).isoformat()
            }},
            upsert=True
        )
        
        return {
            "success": True,
            "audio_base64": audio_base64,
            "format": "mp3",
            "cached": False
        }
    except Exception as e:
        logging.getLogger(__name__).error(f"Audio generation failed for {lesson_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


