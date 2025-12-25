"""
Writing Module Evaluator for Comprehensive Level Test
Rubric-based evaluation for progressive writing tasks.

Evaluates:
- Task Response (TR)
- Coherence & Cohesion (CC)
- Lexical Resource (LR)
- Grammatical Range & Accuracy (GRA)

Outputs: Band score (2.0-9.0), brief feedback, 3 improvement tips
"""

import os
import json
import uuid
from typing import Dict, List, Any
from emergentintegrations.llm.chat import LlmChat, UserMessage

# Initialize LlmChat for evaluation
def get_llm_chat():
    return LlmChat(
        api_key=os.getenv("EMERGENT_LLM_KEY"),
        session_id=str(uuid.uuid4()),
        system_message="You are an IELTS writing examiner providing accurate band score assessments."
    ).with_model("openai", "gpt-4o-mini")

# Writing tasks with progressive difficulty
WRITING_TASKS = [
    # Task 1: Band 2-4 (Guided Writing - Sentence Building)
    {
        "id": "writing_task_1",
        "level": "Band 2-4",
        "type": "guided",
        "title": "Introduce Yourself",
        "instruction": "Complete the sentences about yourself. Write 3-5 simple sentences.",
        "prompts": [
            "My name is _____.",
            "I am _____ years old.",
            "I live in _____.",
            "I like _____.",
            "Every day, I _____."
        ],
        "min_words": 20,
        "max_words": 50,
        "time_minutes": 5
    },
    # Task 2: Band 4-6 (Short Paragraph)
    {
        "id": "writing_task_2",
        "level": "Band 4-6",
        "type": "paragraph",
        "title": "Describe Your Daily Routine",
        "instruction": "Write a short paragraph (60-90 words) describing what you do on a typical day. Include: when you wake up, what you do in the morning, afternoon, and evening.",
        "prompts": [],
        "min_words": 60,
        "max_words": 90,
        "time_minutes": 8
    },
    # Task 3: Band 6-7+ (Mini-Essay)
    {
        "id": "writing_task_3",
        "level": "Band 6-7+",
        "type": "essay",
        "title": "Opinion Essay",
        "instruction": "Some people believe that technology makes our lives easier, while others think it creates more problems. What is your opinion? Write a short essay (120-180 words) explaining your view with reasons and examples.",
        "prompts": [],
        "min_words": 120,
        "max_words": 200,
        "time_minutes": 12
    }
]


def get_writing_tasks() -> List[Dict]:
    """Return all writing tasks for the assessment."""
    return WRITING_TASKS


async def evaluate_writing_response(
    task_id: str,
    response_text: str,
    language: str = "en"
) -> Dict[str, Any]:
    """
    Evaluate a writing response using rubric-based criteria.
    
    Args:
        task_id: The writing task identifier
        response_text: User's written response
        language: Response language for feedback (en, vi, tr)
    
    Returns:
        Evaluation result with band score, feedback, and tips
    """
    # Find the task
    task = next((t for t in WRITING_TASKS if t["id"] == task_id), None)
    if not task:
        return {"error": "Task not found"}
    
    # Word count check
    word_count = len(response_text.strip().split()) if response_text else 0
    
    # Handle empty or very short responses
    if word_count < 5:
        return {
            "band_score": 2.0,
            "word_count": word_count,
            "criteria_scores": {
                "task_response": 2.0,
                "coherence_cohesion": 2.0,
                "lexical_resource": 2.0,
                "grammar": 2.0
            },
            "feedback": "Your response is too short. Please write more to demonstrate your English ability.",
            "tips": [
                "Try to write at least the minimum number of words required.",
                "Re-read the task instructions carefully.",
                "Practice writing simple sentences about the topic."
            ]
        }
    
    # Determine expected level from task
    task_level = task["level"]
    min_words = task["min_words"]
    max_words = task["max_words"]
    
    # Construct evaluation prompt
    evaluation_prompt = f"""
    You are an IELTS writing examiner. Evaluate the following writing response using official IELTS band descriptors.
    
    TASK TYPE: {task['type'].upper()}
    TASK LEVEL: {task_level}
    TASK INSTRUCTION: {task['instruction']}
    MIN WORDS: {min_words}
    MAX WORDS: {max_words}
    
    STUDENT'S RESPONSE:
    "{response_text}"
    
    WORD COUNT: {word_count}
    
    EVALUATION CRITERIA (Score each 0-9, can use .5 increments):
    1. Task Response (TR): Does it address all parts of the task? Is the position clear?
    2. Coherence & Cohesion (CC): Is it logically organized? Are linking words used?
    3. Lexical Resource (LR): Is vocabulary appropriate and varied?
    4. Grammatical Range & Accuracy (GRA): Is grammar accurate? Is there variety?
    
    IMPORTANT PENALTIES:
    - If response is OFF-TOPIC: Maximum band 4.0
    - If word count is below minimum: Reduce band by 0.5-1.0
    - If response is copied from the prompt: Maximum band 3.0
    
    For {task_level} level tasks, be calibrated:
    - Band 2-4 tasks: Expect basic sentence structures, simple vocabulary
    - Band 4-6 tasks: Expect coherent paragraphs, some linking words
    - Band 6-7+ tasks: Expect clear arguments, topic sentences, evidence
    
    Respond in JSON format:
    {{
        "task_response": <float 2.0-9.0>,
        "coherence_cohesion": <float 2.0-9.0>,
        "lexical_resource": <float 2.0-9.0>,
        "grammar": <float 2.0-9.0>,
        "overall_band": <float 2.0-9.0>,
        "feedback": "<2-3 sentences of constructive feedback>",
        "tips": ["<tip 1>", "<tip 2>", "<tip 3>"]
    }}
    
    Only output the JSON, nothing else.
    """
    
    try:
        # Call LLM for evaluation
        result = await llm.ask(
            question=evaluation_prompt,
            model="gpt-4o-mini",
            max_tokens=500
        )
        
        # Parse JSON response
        # Clean up potential markdown formatting
        result_text = result.strip()
        if result_text.startswith("```json"):
            result_text = result_text[7:]
        if result_text.startswith("```"):
            result_text = result_text[3:]
        if result_text.endswith("```"):
            result_text = result_text[:-3]
        
        evaluation = json.loads(result_text.strip())
        
        return {
            "band_score": evaluation.get("overall_band", 4.0),
            "word_count": word_count,
            "criteria_scores": {
                "task_response": evaluation.get("task_response", 4.0),
                "coherence_cohesion": evaluation.get("coherence_cohesion", 4.0),
                "lexical_resource": evaluation.get("lexical_resource", 4.0),
                "grammar": evaluation.get("grammar", 4.0)
            },
            "feedback": evaluation.get("feedback", "Good effort. Keep practicing."),
            "tips": evaluation.get("tips", [
                "Focus on answering all parts of the task.",
                "Use a variety of vocabulary.",
                "Check your grammar before submitting."
            ])
        }
        
    except json.JSONDecodeError as e:
        print(f"JSON parse error in writing evaluation: {e}")
        # Fallback evaluation based on word count
        base_band = 4.0
        if word_count >= min_words:
            base_band = 5.0
        if word_count >= max_words * 0.8:
            base_band = 5.5
        
        return {
            "band_score": base_band,
            "word_count": word_count,
            "criteria_scores": {
                "task_response": base_band,
                "coherence_cohesion": base_band,
                "lexical_resource": base_band,
                "grammar": base_band
            },
            "feedback": "Your response has been recorded. Keep practicing to improve your writing skills.",
            "tips": [
                "Make sure to address all parts of the question.",
                "Use linking words to connect your ideas.",
                "Proofread for grammar mistakes."
            ]
        }
    except Exception as e:
        print(f"Error in writing evaluation: {e}")
        return {
            "band_score": 4.0,
            "word_count": word_count,
            "criteria_scores": {
                "task_response": 4.0,
                "coherence_cohesion": 4.0,
                "lexical_resource": 4.0,
                "grammar": 4.0
            },
            "feedback": "Your response has been recorded.",
            "tips": [
                "Practice writing regularly.",
                "Read model answers to improve.",
                "Focus on one skill at a time."
            ]
        }


async def evaluate_all_writing_tasks(
    responses: List[Dict[str, str]],
    language: str = "en"
) -> Dict[str, Any]:
    """
    Evaluate all writing task responses and calculate overall score.
    
    Args:
        responses: List of {task_id, response_text} dictionaries
        language: Feedback language
    
    Returns:
        Combined evaluation with overall band score
    """
    evaluations = []
    total_band = 0
    
    for resp in responses:
        task_id = resp.get("task_id")
        response_text = resp.get("response_text", "")
        
        evaluation = await evaluate_writing_response(task_id, response_text, language)
        evaluations.append({
            "task_id": task_id,
            **evaluation
        })
        total_band += evaluation.get("band_score", 4.0)
    
    # Calculate overall writing band (average)
    overall_band = round(total_band / len(evaluations), 1) if evaluations else 4.0
    
    # Aggregate tips (unique)
    all_tips = []
    for ev in evaluations:
        all_tips.extend(ev.get("tips", []))
    unique_tips = list(dict.fromkeys(all_tips))[:3]
    
    return {
        "overall_band": overall_band,
        "task_evaluations": evaluations,
        "combined_feedback": f"Your overall writing band is {overall_band}. {evaluations[0].get('feedback', '') if evaluations else ''}",
        "top_tips": unique_tips
    }
