"""
Advanced Mastery (IELTS Band 6.0-9.0) endpoints
===============================================
Single job: serve advanced_mastery_modules and run the module
speaking/writing/quiz LLM evaluations (Core Mindset prompts).

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
from services.ielts_prompts import IELTS_CORE_MINDSET, EVALUATION_MODE_PROMPT

router = APIRouter()

db = None


def set_db(database):
    global db
    db = database


@router.get("/advanced-mastery/modules")
async def get_advanced_mastery_modules():
    """Get all Advanced IELTS Mastery course modules (Band 6.0-9.0)"""
    modules = await db.advanced_mastery_modules.find({}, {"_id": 0}).to_list(100)
    return modules

@router.get("/advanced-mastery/modules/{module_id}")
async def get_advanced_mastery_module(module_id: str):
    """Get a specific Advanced IELTS Mastery module"""
    module = await db.advanced_mastery_modules.find_one({"id": module_id}, {"_id": 0})
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    return module

class AdvancedSpeakingRequest(BaseModel):
    question: str
    model_answer: str
    user_response: str
    module_title: str
    part: str = "part3"  # part2 or part3

@router.post("/advanced-mastery/evaluate-speaking")
async def evaluate_advanced_speaking(request: AdvancedSpeakingRequest, _caller: dict = Depends(auth_session.current_user)):
    """Evaluate speaking response for Advanced IELTS Mastery course with IELTS Core Mindset"""
    try:
        # Use IELTS Core Mindset with Evaluation Mode
        system_message = f"""{IELTS_CORE_MINDSET}

{EVALUATION_MODE_PROMPT}

Additional context: This is an ADVANCED course for students targeting Band 7-9. Be rigorous but constructive."""
        
        chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            session_id=str(uuid.uuid4()),
            system_message=system_message
        ).with_model("openai", "gpt-4o")
        
        prompt = f"""Evaluate this IELTS Speaking response with STRICT Cambridge criteria.

Topic: {request.module_title}
Part: {request.part}
Question: {request.question}
Model Answer (Band 8+): {request.model_answer}
Student's Response: {request.user_response}

IMPORTANT CHECKS BEFORE SCORING:
1. Does the response DIRECTLY address the question?
2. Is it a genuine response or memorized/template-based?
3. Is there sufficient development?
4. Are ideas expressed clearly?

Apply band caps if needed:
- Off-topic → Max 4.0
- Memorized/template → Max 4.5
- Very short/underdeveloped → Max 5.0

Return JSON only:
{{
    "band_score": <5.0-9.0 - be strict>,
    "fluency_coherence": {{"score": <5-9>, "feedback": "<specific feedback with evidence>"}},
    "lexical_resource": {{"score": <5-9>, "feedback": "<specific feedback with evidence>"}},
    "grammatical_range": {{"score": <5-9>, "feedback": "<specific feedback with evidence>"}},
    "pronunciation": {{"score": <5-9>, "feedback": "<assessment based on transcription clarity>"}},
    "major_issues": ["<critical problem 1>", "<critical problem 2>"],
    "overall_feedback": "<3-4 sentences: honest assessment, specific improvements needed>",
    "band_justification": "<Why this band would survive Cambridge moderation>",
    "advanced_vocabulary_used": ["<list of advanced words/phrases the student used>"],
    "suggested_improvements": ["<specific actionable suggestion 1>", "<specific actionable suggestion 2>"],
    "model_phrase_to_learn": "<One exemplary phrase from the model answer the student should study>"
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
        
        return {
            "band_score": 5.5,
            "fluency_coherence": {"score": 5.5, "feedback": "Needs more natural development."},
            "lexical_resource": {"score": 5.5, "feedback": "Limited vocabulary range for this level."},
            "grammatical_range": {"score": 5.5, "feedback": "Basic structures need improvement."},
            "pronunciation": {"score": 5.5, "feedback": "Clarity needs work."},
            "overall_feedback": "Response needs more development and sophistication for Band 7+ target.",
            "advanced_vocabulary_used": [],
            "suggested_improvements": ["Address the question more directly", "Use more topic-specific vocabulary"],
            "model_phrase_to_learn": "Review the model answer for advanced phrasing."
        }
    except Exception as e:
        logging.getLogger(__name__).error(f"Advanced speaking evaluation error: {e}")
        return {
            "band_score": 5.5,
            "overall_feedback": "Evaluation error. Keep practicing with complex topics.",
            "suggested_improvements": ["Practice speaking regularly with complex topics"]
        }

class AdvancedWritingRequest(BaseModel):
    task: str
    model_essay: str
    user_response: str
    module_title: str
    examiner_analysis: dict = None

@router.post("/advanced-mastery/evaluate-writing")
async def evaluate_advanced_writing(request: AdvancedWritingRequest, _caller: dict = Depends(auth_session.current_user)):
    """Evaluate writing response for Advanced IELTS Mastery course with IELTS Core Mindset"""
    try:
        # Use IELTS Core Mindset with Evaluation Mode
        system_message = f"""{IELTS_CORE_MINDSET}

{EVALUATION_MODE_PROMPT}

Additional context: This is an ADVANCED course for students targeting Band 7-9. Be rigorous but constructive."""

        chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            session_id=str(uuid.uuid4()),
            system_message=system_message
        ).with_model("openai", "gpt-4o")
        
        examiner_notes = ""
        if request.examiner_analysis:
            examiner_notes = f"\nExaminer Notes for this topic: {json.dumps(request.examiner_analysis)}"
        
        # Count words
        word_count = len(request.user_response.split())
        
        prompt = f"""Evaluate this IELTS Writing Task 2 essay with STRICT Cambridge criteria.

Topic: {request.module_title}
Task: {request.task}
Model Essay (Band 7.5+): {request.model_essay}{examiner_notes}
Student's Essay ({word_count} words): {request.user_response}

IMPORTANT CHECKS BEFORE SCORING:
1. Does the essay address ALL parts of the question?
2. Is there a clear position maintained throughout?
3. Word count: {word_count} words (minimum required: 250)
4. Is this a genuine essay or memorized/template-based?

Apply band caps if needed:
- Off-topic or irrelevant → Max 4.0
- Under 250 words → Max 4.0
- Memorized/template → Max 4.5
- No clear position → Max 5.0
- Poor paragraphing → Max 5.5

Return JSON only:
{{
    "band_score": <5.0-9.0 - be strict>,
    "validity_check": {{
        "word_count": {word_count},
        "meets_word_count": <true/false>,
        "on_topic": <true/false>,
        "has_clear_position": <true/false>,
        "band_cap_applied": <null or number>,
        "cap_reason": "<if capped, explain why>"
    }},
    "task_achievement": {{"score": <5-9>, "feedback": "<specific feedback - did it address ALL parts?>"}},
    "coherence_cohesion": {{"score": <5-9>, "feedback": "<specific feedback on structure and linking>"}},
    "lexical_resource": {{"score": <5-9>, "feedback": "<specific feedback on vocabulary accuracy>"}},
    "grammatical_range": {{"score": <5-9>, "feedback": "<specific feedback on grammar control>"}},
    "major_issues": ["<critical problem 1>", "<critical problem 2>"],
    "overall_feedback": "<4-5 sentences: honest assessment, specific improvements needed>",
    "band_justification": "<Why this band would survive Cambridge moderation>",
    "strengths": ["<genuine strength 1>", "<genuine strength 2>"],
    "areas_to_improve": ["<specific actionable improvement 1>", "<specific actionable improvement 2>"],
    "advanced_vocabulary_suggestions": ["<appropriate advanced word/phrase 1>", "<appropriate advanced word/phrase 2>"],
    "grammar_upgrade_examples": [
        {{"original": "<student's sentence>", "upgraded": "<Band 8 version>"}}
    ]
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
        
        return {
            "band_score": 5.5,
            "task_achievement": {"score": 5.5, "feedback": "Response needs to address all parts more fully."},
            "coherence_cohesion": {"score": 5.5, "feedback": "Paragraph organization needs improvement."},
            "lexical_resource": {"score": 5.5, "feedback": "Vocabulary range is limited for Band 7+ target."},
            "grammatical_range": {"score": 5.5, "feedback": "Complex structures need more control."},
            "overall_feedback": "Essay needs more development and sophistication for Band 7+ target.",
            "strengths": ["Attempted to answer the question"],
            "areas_to_improve": ["Address all parts of the question", "Use more topic-specific vocabulary"],
            "advanced_vocabulary_suggestions": ["Review the module vocabulary"],
            "grammar_upgrade_examples": []
        }
    except Exception as e:
        logging.getLogger(__name__).error(f"Advanced writing evaluation error: {e}")
        return {
            "band_score": 5.5,
            "overall_feedback": "Evaluation error. Keep practicing with complex topics.",
            "areas_to_improve": ["Practice writing regularly with complex topics"]
        }

class AdvancedQuizRequest(BaseModel):
    module_id: str
    answers: dict  # {question_index: answer}

@router.post("/advanced-mastery/evaluate-quiz")
async def evaluate_advanced_quiz(request: AdvancedQuizRequest, _caller: dict = Depends(auth_session.current_user)):
    """Evaluate quiz answers for Advanced IELTS Mastery module"""
    try:
        module = await db.advanced_mastery_modules.find_one({"id": request.module_id}, {"_id": 0})
        if not module:
            raise HTTPException(status_code=404, detail="Module not found")
        
        questions = module.get("reading", {}).get("questions", [])
        correct = 0
        total = len(questions)
        results = []
        
        # Track skill breakdown by question type
        skill_breakdown = {}
        
        for idx, q in enumerate(questions):
            user_answer = request.answers.get(str(idx), "").strip().lower()
            correct_answer = q.get("answer", "").strip().lower()
            question_type = q.get("type", "unknown")
            
            # Flexible matching for advanced course
            is_correct = user_answer == correct_answer or correct_answer in user_answer or user_answer in correct_answer
            if is_correct:
                correct += 1
            
            results.append({
                "question": q.get("question", ""),
                "user_answer": request.answers.get(str(idx), ""),
                "correct_answer": q.get("answer", ""),
                "is_correct": is_correct,
                "question_type": question_type
            })
            
            # Aggregate by question type for skill breakdown
            if question_type not in skill_breakdown:
                skill_breakdown[question_type] = {"correct": 0, "total": 0}
            skill_breakdown[question_type]["total"] += 1
            if is_correct:
                skill_breakdown[question_type]["correct"] += 1
        
        # Add tips for weak areas
        for skill_type in skill_breakdown:
            data = skill_breakdown[skill_type]
            percentage = (data["correct"] / data["total"] * 100) if data["total"] > 0 else 0
            if percentage < 50:
                # Add targeted tip based on question type
                tips = {
                    "true_false_ng": "Look for specific evidence in the text. 'Not Given' means the information isn't stated.",
                    "matching_info": "Skim for keywords first, then read carefully around those keywords.",
                    "sentence_completion": "Use the exact words from the passage when possible.",
                    "summary_completion": "Read the summary first to understand the flow, then locate each answer.",
                    "vocabulary_match": "Context clues are key - look at surrounding sentences.",
                    "multiple_choice": "Eliminate obviously wrong answers first.",
                    "identify_view": "Focus on the author's tone and specific claims made."
                }
                skill_breakdown[skill_type]["tip"] = tips.get(skill_type, "Practice more questions of this type.")
        
        score_percentage = (correct / total * 100) if total > 0 else 0
        
        # Band estimation based on accuracy (advanced scale)
        if score_percentage >= 90:
            band = 8.5
        elif score_percentage >= 80:
            band = 8.0
        elif score_percentage >= 70:
            band = 7.5
        elif score_percentage >= 60:
            band = 7.0
        elif score_percentage >= 50:
            band = 6.5
        else:
            band = 6.0
        
        return {
            "score": score_percentage,
            "correct": correct,
            "total": total,
            "estimated_band": band,
            "results": results,
            "skill_breakdown": skill_breakdown,
            "feedback": f"You got {correct} out of {total} correct ({score_percentage:.0f}%). Estimated Reading Band: {band}"
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.getLogger(__name__).error(f"Advanced quiz evaluation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to evaluate quiz")


