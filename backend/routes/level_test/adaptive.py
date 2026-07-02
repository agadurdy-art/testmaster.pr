"""
Adaptive level test (Band 2.0-9.0)
==================================
Single job: the 3-step adaptive placement flow — start from self-assessment,
serve difficulty-adapting question batches, and produce the final banded
evaluation + learning path. Scoring/LLM logic lives in
adaptive_level_test_routes; this module is the HTTP surface.
Collections: users (writes level_test_result).

Extracted verbatim from server.py (Faz 1 refactor, 2026-07-02).
"""

import logging
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

router = APIRouter()

db = None


def set_db(database):
    global db
    db = database


from adaptive_level_test_routes import (
    InitialAssessmentRequest,
    AdaptiveTestRequest,
    determine_starting_level,
    get_adaptive_questions,
    calculate_reading_band,
    evaluate_writing_detailed,
    evaluate_speaking_detailed,
    generate_learning_path
)
from comprehensive_test_data import WRITING_PROMPTS, SPEAKING_PROMPTS

@router.post("/adaptive-level-test/start")
async def start_adaptive_test(request: InitialAssessmentRequest):
    """Get starting questions based on user's self-assessment"""
    starting_level = determine_starting_level(request.experience_level)
    
    # Get questions for the starting level - START WITH 5 QUESTIONS
    reading_questions = get_adaptive_questions(starting_level, "reading")
    
    # Select appropriate writing and speaking prompts
    writing_prompts = WRITING_PROMPTS.get(starting_level, {}).get("prompts", [])
    speaking_prompts = SPEAKING_PROMPTS.get(starting_level, [])
    
    # Select one writing prompt randomly
    import random
    selected_writing = random.choice(writing_prompts) if writing_prompts else {
        "id": "default",
        "prompt": "Write about your typical day. (50-100 words)",
        "min_words": 50,
        "max_words": 100
    }
    
    # Select 3 speaking prompts
    selected_speaking = random.sample(speaking_prompts, min(3, len(speaking_prompts))) if speaking_prompts else [
        {"id": "s_default_1", "question": "Tell me about yourself."},
        {"id": "s_default_2", "question": "What do you like to do in your free time?"},
        {"id": "s_default_3", "question": "Describe a place you like to visit."}
    ]
    
    return {
        "starting_level": starting_level,
        "reading_questions": reading_questions[:5] if reading_questions else [],  # First 5 questions
        "writing_prompt": selected_writing,
        "speaking_prompts": selected_speaking,
        "instructions": {
            "reading": f"You'll start with {starting_level} level questions. Answer carefully - difficulty will adapt based on your performance.",
            "total_reading_questions": "8-12 questions (adapts to your level)",
            "time_estimate": "15-25 minutes total"
        }
    }

@router.post("/adaptive-level-test/next-questions")
async def get_next_adaptive_questions(
    current_level: str,
    recent_answers: dict,
    questions_so_far: int
):
    """
    Get next set of questions based on performance
    Called after user completes a batch of questions
    """
    # Calculate accuracy on recent questions
    correct_count = sum(1 for ans in recent_answers.values() if ans.get("correct", False))
    total = len(recent_answers)
    accuracy = correct_count / total if total > 0 else 0
    
    # Determine next level based on adaptive rules
    level_order = {"A1": 1, "A2": 2, "B1": 3, "B2": 4, "C1": 5, "C2": 6}
    current_level_num = level_order.get(current_level, 2)
    
    next_level = current_level
    
    if accuracy >= 0.70 and current_level_num < 6:  # 70%+ correct → level up
        next_level_num = current_level_num + 1
        next_level = [k for k, v in level_order.items() if v == next_level_num][0]
    elif accuracy < 0.50 and current_level_num > 1:  # <50% correct → level down
        next_level_num = current_level_num - 1
        next_level = [k for k, v in level_order.items() if v == next_level_num][0]
    
    # Stop if we've asked enough questions (8-12 range)
    if questions_so_far >= 12:
        return {
            "continue": False,
            "message": "Assessment complete. Proceeding to speaking section.",
            "final_level": next_level
        }
    
    if questions_so_far >= 8 and accuracy >= 0.70:
        # Can stop early if performing well
        return {
            "continue": False,
            "message": "Strong performance detected. Moving to next section.",
            "final_level": next_level
        }
    
    # Get more questions at the next level
    next_questions = get_adaptive_questions(next_level, "reading")
    
    # Determine how many more questions to ask
    remaining = min(5, 12 - questions_so_far)
    
    return {
        "continue": True,
        "next_level": next_level,
        "questions": next_questions[:remaining] if next_questions else [],
        "progress": f"{questions_so_far} of 8-12 completed"
    }

@router.post("/adaptive-level-test/evaluate")
async def evaluate_adaptive_test(request: AdaptiveTestRequest):
    """
    Evaluate complete adaptive test with detailed feedback
    Returns band scores (2.0-9.0) and specific error analysis
    """
    try:
        # 1. Calculate Reading Band
        reading_band, reading_accuracy, reading_level, reading_errors = calculate_reading_band(
            request.reading_answers,
            []
        )
        
        # 2. Evaluate Writing (if provided)
        writing_band = 2.0
        writing_analysis = {}
        if request.writing_response and len(request.writing_response) > 20:
            writing_analysis = await evaluate_writing_detailed(
                request.writing_response,
                request.initial_level
            )
            writing_band = writing_analysis.get("band_score", 4.0)
        
        # 3. Evaluate Speaking
        speaking_band = 2.0
        speaking_analysis = {}
        if request.speaking_responses:
            speaking_analysis = await evaluate_speaking_detailed(
                request.speaking_responses,
                request.initial_level
            )
            speaking_band = speaking_analysis.get("band_score", 4.0)
        
        # 4. Calculate Listening Band (simplified for now)
        listening_band = reading_band  # Placeholder
        
        # 5. Calculate Overall Band (weighted average)
        overall_band = round(
            (reading_band * 0.25 + 
             listening_band * 0.25 + 
             writing_band * 0.25 + 
             speaking_band * 0.25),
            1
        )
        
        # 6. Determine CEFR Level
        cefr_mapping = {
            (2.0, 3.0): "A1",
            (3.5, 4.5): "A2",
            (5.0, 5.5): "B1",
            (6.0, 6.5): "B2",
            (7.0, 8.0): "C1",
            (8.5, 9.0): "C2"
        }
        
        cefr_level = "A2"
        for band_range, level in cefr_mapping.items():
            if band_range[0] <= overall_band <= band_range[1]:
                cefr_level = level
                break
        
        # 7. Generate Learning Path
        skill_bands = {
            "reading": reading_band,
            "listening": listening_band,
            "writing": writing_band,
            "speaking": speaking_band
        }
        learning_path = generate_learning_path(overall_band, skill_bands)
        
        # 8. Prepare Detailed Analysis
        detailed_analysis = {
            "reading": {
                "band": reading_band,
                "accuracy": f"{reading_accuracy * 100:.0f}%",
                "level_reached": reading_level,
                "errors": reading_errors,
                "strengths": "Basic comprehension" if reading_band >= 4.0 else "Needs foundation",
                "weaknesses": "Advanced vocabulary" if reading_band < 6.0 else "Minimal"
            },
            "writing": writing_analysis,
            "speaking": speaking_analysis,
            "listening": {
                "band": listening_band,
                "note": "Listening evaluation integrated"
            }
        }
        
        # 9. Next Steps Recommendations
        next_steps = []
        if overall_band < 4.0:
            next_steps = [
                "✅ Start with Foundation courses (FREE)",
                "📚 Practice basic vocabulary daily (10-15 words)",
                "🎙️ Use AI pronunciation tool (10 min/day)",
                "📊 Take mini-tests weekly to track progress"
            ]
        elif overall_band < 5.5:
            next_steps = [
                "📖 Focus on grammar fundamentals",
                "💬 Build vocabulary to 1500+ words",
                "🗣️ Practice speaking daily with AI",
                "✍️ Write short paragraphs (50-100 words)"
            ]
        elif overall_band < 6.5:
            next_steps = [
                "🎯 Start IELTS-specific preparation",
                "📚 Learn academic vocabulary",
                "💪 Practice all 4 skills regularly",
                "📝 Take full practice tests monthly"
            ]
        else:
            next_steps = [
                "🏆 Take full IELTS practice tests",
                "🎓 Focus on Band 7-8 strategies",
                "🔍 Refine weak areas",
                "📅 Book official IELTS test"
            ]
        
        # 10. Save to database (if user_id provided)
        if request.user_id:
            await db.users.update_one(
                {"id": request.user_id},
                {
                    "$set": {
                        "level_test_result": {
                            "overall_band": overall_band,
                            "cefr_level": cefr_level,
                            "skill_bands": skill_bands,
                            "test_date": datetime.now(timezone.utc).isoformat(),
                            "detailed_analysis": detailed_analysis
                        }
                    }
                }
            )
        
        # 11. Estimate time to next band
        time_estimates = {
            (2.0, 3.0): "8-12 weeks with daily practice",
            (3.0, 4.0): "10-14 weeks with daily practice",
            (4.0, 5.0): "12-16 weeks with daily practice",
            (5.0, 6.0): "16-20 weeks with daily practice",
            (6.0, 7.0): "20-24 weeks with intensive practice",
            (7.0, 8.0): "24-32 weeks with expert guidance",
            (8.0, 9.0): "32+ weeks of mastery-level practice"
        }
        
        estimated_time = "12-16 weeks"
        for band_range, time in time_estimates.items():
            if band_range[0] <= overall_band < band_range[1]:
                estimated_time = time
                break
        
        return {
            "overall_band": overall_band,
            "cefr_level": cefr_level,
            "reading_band": reading_band,
            "listening_band": listening_band,
            "writing_band": writing_band,
            "speaking_band": speaking_band,
            "detailed_analysis": detailed_analysis,
            "learning_path": learning_path,
            "next_steps": next_steps,
            "estimated_time_to_next_band": estimated_time,
            "test_completed_at": datetime.now(timezone.utc).isoformat()
        }
        
    except Exception as e:
        logging.getLogger(__name__).error(f"Adaptive test evaluation error: {e}")
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")



