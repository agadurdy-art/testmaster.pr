"""
Mastery Course (IELTS Band 4.5-6.5) endpoints
=============================================
Single job: serve mastery_course_modules and run the module speaking/writing
LLM evaluations for the legacy Mastery course track.

Extracted verbatim from server.py (Faz 1 refactor, 2026-07-02).
"""

import json
import logging
import os
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel

import auth_session
from services.llm_compat import LlmChat, UserMessage

router = APIRouter()

db = None


def set_db(database):
    global db
    db = database


@router.get("/mastery-course/modules")
async def get_mastery_modules():
    """Get all mastery course modules"""
    modules = await db.mastery_course_modules.find({}, {"_id": 0}).to_list(100)
    return modules

@router.get("/mastery-course/modules/{module_id}")
async def get_mastery_module(module_id: str):
    """Get a specific mastery course module"""
    module = await db.mastery_course_modules.find_one({"id": module_id}, {"_id": 0})
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    return module

class MasterySpeakingRequest(BaseModel):
    question: str
    model_answer: str
    user_response: str
    module_title: str

@router.post("/mastery-course/evaluate-speaking")
async def evaluate_mastery_speaking(request: MasterySpeakingRequest, _caller: dict = Depends(auth_session.current_user)):
    """Evaluate speaking response for mastery course (Band 4.5-6.5) with comprehensive feedback"""
    try:
        chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            session_id=str(uuid.uuid4()),
            system_message="You are an expert IELTS examiner providing detailed, educational feedback."
        ).with_model("openai", "gpt-4o")
        
        prompt = f"""You are an IELTS Speaking examiner providing comprehensive feedback for a Band 4.5-6.5 student.

Topic: {request.module_title}
Question: {request.question}
Model Answer: {request.model_answer}
Student's Response: {request.user_response}

Provide detailed, educational feedback. Identify specific mistakes and show how to correct them.

Return JSON only:
{{
    "band_score": <4.5-6.5>,
    "fluency": {{"score": <number>, "feedback": "<specific feedback>"}},
    "vocabulary": {{"score": <number>, "feedback": "<specific feedback>"}},
    "grammar": {{"score": <number>, "feedback": "<specific feedback>"}},
    "pronunciation": {{"score": <number>, "feedback": "<specific feedback>"}},
    "overall_feedback": "<2-3 sentences summarizing performance>",
    "mistakes": [
        {{"original": "<what student said wrong>", "corrected": "<correct version>", "explanation": "<why this is better>"}}
    ],
    "vocabulary_to_use": ["<word1 from lesson>", "<word2 from lesson>", "<word3 from lesson>"],
    "model_phrases": ["<useful phrase 1>", "<useful phrase 2>"],
    "improvement_tip": "<One specific actionable tip>",
    "lesson_reference": "<Which part of the lesson to review for improvement>"
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
        
        return {"band_score": 5, "overall_feedback": "Good effort! Keep practicing.", "improvement_tip": "Use more topic vocabulary.", "mistakes": [], "vocabulary_to_use": [], "lesson_reference": "Review the vocabulary section"}
    except Exception as e:
        logging.getLogger(__name__).error(f"Mastery speaking evaluation error: {e}")
        return {"band_score": 5, "overall_feedback": "Good try! Keep practicing.", "improvement_tip": "Practice speaking regularly.", "mistakes": [], "vocabulary_to_use": []}

class MasteryWritingRequest(BaseModel):
    task: str
    model_essay: str
    user_response: str
    module_title: str

@router.post("/mastery-course/evaluate-writing")
async def evaluate_mastery_writing(request: MasteryWritingRequest, _caller: dict = Depends(auth_session.current_user)):
    """Evaluate writing response for mastery course (Band 4.5-6.5) with comprehensive feedback"""
    try:
        chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            session_id=str(uuid.uuid4()),
            system_message="You are an expert IELTS Writing examiner providing detailed, educational feedback."
        ).with_model("openai", "gpt-4o")
        
        prompt = f"""You are an IELTS Writing Task 2 examiner providing comprehensive feedback for a Band 4.5-6.5 student.

Topic: {request.module_title}
Task: {request.task}
Model Essay: {request.model_essay}
Student's Essay: {request.user_response}

Provide detailed, educational feedback. Identify specific mistakes and show how to correct them.

Return JSON only:
{{
    "band_score": <4.5-6.5>,
    "task_achievement": {{"score": <number>, "feedback": "<specific feedback>"}},
    "coherence": {{"score": <number>, "feedback": "<specific feedback>"}},
    "lexical": {{"score": <number>, "feedback": "<specific feedback>"}},
    "grammar": {{"score": <number>, "feedback": "<specific feedback>"}},
    "overall_feedback": "<3-4 sentences summarizing performance with encouragement>",
    "mistakes": [
        {{"original": "<incorrect sentence/phrase>", "corrected": "<correct version>", "explanation": "<grammar rule or vocabulary tip>", "type": "<grammar/vocabulary/coherence>"}}
    ],
    "good_points": ["<what student did well 1>", "<what student did well 2>"],
    "vocabulary_suggestions": [
        {{"basic": "<simple word used>", "advanced": "<better alternative from lesson>", "example": "<example sentence>"}}
    ],
    "structure_tip": "<Advice on essay structure>",
    "lesson_reference": "<Which part of the lesson to review>",
    "next_steps": ["<step 1 to improve>", "<step 2 to improve>"]
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
        
        return {"band_score": 5, "overall_feedback": "Good effort! Keep writing.", "mistakes": [], "good_points": [], "vocabulary_suggestions": [], "next_steps": ["Practice more essays"]}
    except Exception as e:
        logging.getLogger(__name__).error(f"Mastery writing evaluation error: {e}")
        return {"band_score": 5, "overall_feedback": "Good effort!", "mistakes": [], "good_points": [], "vocabulary_suggestions": [], "next_steps": []}




