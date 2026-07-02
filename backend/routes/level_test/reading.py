"""
Level test — reading questions + simple-test evaluation
=======================================================
Single job: serve answer-key-stripped reading questions for the simple and
comprehensive level tests, score reading server-side, and run the legacy
simple level-test (reading + speaking transcript) LLM evaluation.
Collections: users (writes english_level / level_test_result).

Extracted verbatim from server.py (Faz 1 refactor, 2026-07-02).
"""

import json
import logging
import os
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Body
from pydantic import BaseModel

from services.llm_compat import LlmChat, UserMessage

router = APIRouter()

db = None


def set_db(database):
    global db
    db = database


# Secure endpoint: serve reading questions WITHOUT answer keys
@router.get("/level-test/reading-questions")
async def get_level_test_reading_questions():
    """Return reading questions without correct answers for the simple level test."""
    from level_test_reading_data import LEVEL_TEST_READING_QUESTIONS, strip_answer_keys
    return {"questions": strip_answer_keys(LEVEL_TEST_READING_QUESTIONS)}


@router.get("/comprehensive-level-test/reading-questions")
async def get_comprehensive_reading_questions():
    """Return reading questions without correct answers for the comprehensive level test."""
    from level_test_reading_data import COMPREHENSIVE_READING_QUESTIONS, strip_answer_keys
    return {"questions": strip_answer_keys(COMPREHENSIVE_READING_QUESTIONS)}


@router.post("/comprehensive-level-test/evaluate-reading")
async def evaluate_comprehensive_reading(payload: Dict[str, Any] = Body(...)):
    """Evaluate reading answers server-side and return results with correct answers."""
    from level_test_reading_data import COMPREHENSIVE_READING_QUESTIONS
    answers = payload.get("answers", {})
    results = []
    total_points = 0
    correct_count = 0
    skill_breakdown = {}
    for q in COMPREHENSIVE_READING_QUESTIONS:
        user_answer = answers.get(str(q["id"]), "")
        is_correct = user_answer.upper() == q["correct"].upper() if user_answer else False
        if is_correct:
            correct_count += 1
            total_points += q.get("band", 0)
        skill = q.get("skill", "general")
        if skill not in skill_breakdown:
            skill_breakdown[skill] = {"correct": 0, "total": 0}
        skill_breakdown[skill]["total"] += 1
        if is_correct:
            skill_breakdown[skill]["correct"] += 1
        results.append({
            "id": q["id"],
            "is_correct": is_correct,
            "user_answer": user_answer,
            "correct_answer": q["correct"],
            "band": q.get("band", 0),
            "skill": skill,
            "passage": q.get("passage", ""),
            "question": q.get("question", ""),
            "options": q.get("options", []),
            "passageExcerpt": q.get("passageExcerpt", ""),
            "explanation": q.get("explanation", ""),
            "skillTip": q.get("skillTip", ""),
        })
    # Audit BE-1: the old math summed each correct question's *difficulty band*
    # and divided by the question count — not a band score (10/10 → 5.5). Use the
    # official Cambridge Academic Reading raw→band table, projecting the N-question
    # score onto the standard 40-question scale. (`total_points` kept for callers
    # that still read it, but the band now comes from the real table.)
    from services.ielts_band_tables import band_for_reading
    n = len(COMPREHENSIVE_READING_QUESTIONS)
    band = band_for_reading(correct_count, total=n, track="academic") if n else 0
    return {
        "correct_count": correct_count,
        "total": n,
        "band": band,
        "skill_breakdown": skill_breakdown,
        "questions": results,
    }


class LevelTestRequest(BaseModel):
    user_id: Optional[str] = None
    reading_answers: Dict[str, str]
    reading_questions: Optional[List[Dict[str, Any]]] = None
    speaking_responses: List[Dict[str, Any]]

@router.post("/level-test/evaluate")
async def evaluate_level_test(request: LevelTestRequest):
    """Evaluate user's English level based on reading and speaking responses"""
    from level_test_reading_data import LEVEL_TEST_READING_QUESTIONS
    
    # Use server-side answer keys (ignore any frontend-supplied questions)
    correct_count = 0
    for q in LEVEL_TEST_READING_QUESTIONS:
        user_answer = request.reading_answers.get(str(q["id"]), "")
        if user_answer.upper() == q["correct"].upper():
            correct_count += 1
    
    reading_score = correct_count
    
    # Prepare speaking responses for AI evaluation
    speaking_text = "\n\n".join([
        f"Prompt: {resp['prompt']}\nResponse: {resp['response']}"
        for resp in request.speaking_responses
    ])
    
    # Use Claude to evaluate speaking and determine overall level
    try:
        chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            model="claude-3-sonnet-20240229"
        )
        
        evaluation_prompt = f"""You are an experienced English language assessor. Evaluate the following test responses and determine the student's English proficiency level.

READING SCORE: {reading_score}/5 correct answers
- Questions ranged from Elementary to Advanced level
- Score breakdown: 0-1 = Beginner, 2 = Elementary, 3 = Pre-Intermediate, 4 = Intermediate/Upper-Intermediate, 5 = Advanced

SPEAKING RESPONSES:
{speaking_text}

Based on the reading score and speaking responses, evaluate:
1. Overall English Level (choose ONE): Beginner, Elementary, Pre-Intermediate, Intermediate, Upper-Intermediate, Advanced, or IELTS Ready
2. Speaking assessment: Comment on fluency, vocabulary, grammar, and coherence
3. Recommendations: Suggest 3 specific practice areas or test types

Respond in this exact JSON format:
{{
    "level": "the level name",
    "reading_feedback": "brief feedback on reading performance",
    "speaking_feedback": "detailed speaking assessment (2-3 sentences)",
    "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
}}"""

        response = await chat.send_message(UserMessage(text=evaluation_prompt))
        
        # Parse the response
        response_text = response.text.strip()
        # Extract JSON from response (handle markdown code blocks)
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        result = json.loads(response_text)
        result["reading_score"] = reading_score
        
        # Save result to user profile if user_id provided
        if request.user_id:
            await db.users.update_one(
                {"id": request.user_id},
                {"$set": {
                    "english_level": result["level"],
                    "level_test_date": datetime.now(timezone.utc).isoformat(),
                    "level_test_result": result
                }}
            )
        
        return result
        
    except Exception as e:
        logging.getLogger(__name__).error(f"Level test evaluation error: {e}")
        
        # Fallback evaluation based on reading score alone
        level_map = {
            0: "Beginner",
            1: "Elementary", 
            2: "Pre-Intermediate",
            3: "Intermediate",
            4: "Upper-Intermediate",
            5: "Advanced"
        }
        
        return {
            "level": level_map.get(reading_score, "Intermediate"),
            "reading_score": reading_score,
            "reading_feedback": f"You answered {reading_score} out of 5 questions correctly.",
            "speaking_feedback": "Your speaking responses have been recorded. Practice regularly to improve fluency and vocabulary range.",
            "recommendations": [
                "Practice reading academic texts daily",
                "Record yourself speaking and listen back",
                "Take full IELTS practice tests to build familiarity"
            ]
        }



