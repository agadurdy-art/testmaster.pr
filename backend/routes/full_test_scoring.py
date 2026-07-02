"""
Per-skill evaluators for Full Test mode: listening/reading answer checking
with rich per-question feedback, writing (V4 evaluator) and speaking (LLM)
evaluation, plus answer normalization.

Extracted from routes/full_test.py (Faz 1 refactor, 2026-07-02).
"""

from typing import Dict, List, Any, Optional
import asyncio
import uuid
import json
import os

# Import shared evaluation helpers from cambridge routes
try:
    from routes.cambridge import (
        classify_reason_code, compare_answers as cambridge_compare,
        calculate_band_from_percentage, get_skill_tip,
        generate_explanation, generate_lesson_recommendations,
        build_root_cause_analysis, build_study_plan,
        extract_evidence_text
    )
    CAMBRIDGE_HELPERS_AVAILABLE = True
except ImportError:
    CAMBRIDGE_HELPERS_AVAILABLE = False
    print("Warning: Could not import cambridge evaluation helpers")

# Import test structure utilities
try:
    from content.full_tests.test_structure import (
        TestType, SectionType, TEST_TIMINGS,
        calculate_listening_band, calculate_reading_band,
        calculate_overall_band, validate_full_test
    )
except ImportError:
    print("Warning: Could not import test_structure")


# ============ HELPER FUNCTIONS ============

def check_answer(user_answer: str, correct_answer: str) -> bool:
    """Check if user answer matches correct answer."""
    if not user_answer or not correct_answer:
        return False
    
    # Normalize answers
    user = user_answer.strip().lower()
    
    # Handle multiple correct answers (separated by /)
    correct_options = [c.strip().lower() for c in str(correct_answer).split("/")]
    
    return user in correct_options


def evaluate_listening(test: Dict, answers: Dict) -> Dict:
    """Evaluate listening section with rich per-question feedback."""
    test_listening = test["sections"]["listening"]
    correct = 0
    total = 0
    details = []
    by_type = {}

    for part in test_listening.get("parts", []):
        part_num = part.get("part_number", 1)
        for q in part.get("questions", []):
            q_id = q["id"]
            q_type = q.get("type", "unknown")
            total += 1
            user_answer = answers.get(q_id, "")
            correct_answer = q.get("answer", "")

            is_correct = check_answer(user_answer, correct_answer)
            if is_correct:
                correct += 1

            # Track by question type
            if q_type not in by_type:
                by_type[q_type] = {"correct": 0, "total": 0}
            by_type[q_type]["total"] += 1
            if is_correct:
                by_type[q_type]["correct"] += 1

            # Rich detail
            detail = {
                "question_id": q_id,
                "question_type": q_type,
                "question_text": q.get("question", ""),
                "user_answer": user_answer if user_answer else "-",
                "correct_answer": correct_answer,
                "is_correct": is_correct,
                "part": part_num,
                "reason_code": None,
                "reason_label": None,
                "explanation": None,
                "skill_tip": None
            }

            if CAMBRIDGE_HELPERS_AVAILABLE:
                if not is_correct:
                    reason = classify_reason_code(user_answer, correct_answer, q_type)
                    detail["reason_code"] = reason.get("code")
                    detail["reason_label"] = reason.get("label")
                detail["explanation"] = generate_explanation(
                    q_type, correct_answer, is_correct,
                    user_answer=user_answer,
                    question_text=detail["question_text"],
                    reason_code=detail["reason_code"],
                )
                detail["skill_tip"] = get_skill_tip(
                    "listening", q_type, 1 if is_correct else 0,
                    question_text=detail["question_text"],
                    correct_ans=correct_answer,
                    user_answer=user_answer,
                    reason_code=detail["reason_code"],
                )

            details.append(detail)

    band = calculate_listening_band(correct)

    return {
        "band": band,
        "correct": correct,
        "total": total,
        "percentage": round((correct / total) * 100, 1) if total > 0 else 0,
        "details": details,
        "by_type": by_type
    }


def evaluate_reading(test: Dict, answers: Dict) -> Dict:
    """Evaluate reading section with rich per-question feedback."""
    test_reading = test["sections"]["reading"]
    correct = 0
    total = 0
    details = []
    by_type = {}

    # Build passage texts for evidence extraction
    passage_texts = {}
    for passage in test_reading.get("passages", []):
        p_num = passage.get("passage_number", 1)
        passage_texts[p_num] = passage.get("text", "")

    for passage in test_reading.get("passages", []):
        p_num = passage.get("passage_number", 1)
        for q in passage.get("questions", []):
            q_id = q["id"]
            q_type = q.get("type", "unknown")
            total += 1
            user_answer = answers.get(q_id, "")
            correct_answer = q.get("answer", "")

            is_correct = check_answer(user_answer, correct_answer)
            if is_correct:
                correct += 1

            # Track by type
            if q_type not in by_type:
                by_type[q_type] = {"correct": 0, "total": 0}
            by_type[q_type]["total"] += 1
            if is_correct:
                by_type[q_type]["correct"] += 1

            detail = {
                "question_id": q_id,
                "question_type": q_type,
                "question_text": q.get("question", q.get("statement", "")),
                "user_answer": user_answer if user_answer else "-",
                "correct_answer": correct_answer,
                "is_correct": is_correct,
                "passage": p_num,
                "reason_code": None,
                "reason_label": None,
                "evidence_text": None,
                "explanation": None,
                "skill_tip": None
            }

            if CAMBRIDGE_HELPERS_AVAILABLE:
                if not is_correct:
                    reason = classify_reason_code(user_answer, correct_answer, q_type)
                    detail["reason_code"] = reason.get("code")
                    detail["reason_label"] = reason.get("label")
                    # Extract evidence from passage
                    p_text = passage_texts.get(p_num, "")
                    if p_text:
                        detail["evidence_text"] = extract_evidence_text(correct_answer, p_text)
                detail["explanation"] = generate_explanation(
                    q_type, correct_answer, is_correct,
                    user_answer=user_answer,
                    question_text=detail["question_text"],
                    reason_code=detail["reason_code"],
                )
                detail["skill_tip"] = get_skill_tip(
                    "reading", q_type, 1 if is_correct else 0,
                    question_text=detail["question_text"],
                    correct_ans=correct_answer,
                    user_answer=user_answer,
                    reason_code=detail["reason_code"],
                )

            details.append(detail)

    test_type = test.get("test_type", "academic")
    band = calculate_reading_band(correct, test_type)

    return {
        "band": band,
        "correct": correct,
        "total": total,
        "percentage": round((correct / total) * 100, 1) if total > 0 else 0,
        "details": details,
        "by_type": by_type
    }


def _classify_task_type_v4(task: Dict) -> str:
    """Map a Full Test writing task dict to a V4 TaskType enum value."""
    task_num = task.get("task_number") or 1
    ttype = (task.get("type") or "").lower()
    subtype = (task.get("subtype") or "").lower()
    tone = (task.get("tone") or "").lower()

    if task_num == 2:
        # Coarse classification — V4 default is opinion; could be refined later.
        if "discuss" in ttype or "discuss" in subtype:
            return "task2_discussion"
        if "problem" in ttype or "solution" in ttype:
            return "task2_problem_solution"
        if "advantage" in ttype or "disadvantage" in ttype:
            return "task2_advantages_disadvantages"
        if "direct" in ttype:
            return "task2_direct_question"
        return "task2_opinion"

    # Task 1
    if ttype == "letter" or "letter" in ttype:
        if "informal" in subtype or "informal" in tone:
            return "task1_general_informal"
        if "semi" in subtype or "semi" in tone:
            return "task1_general_semiformal"
        return "task1_general_formal"

    if "map" in ttype:
        return "task1_academic_map"
    if "process" in ttype:
        return "task1_academic_process"
    if "diagram" in ttype:
        return "task1_academic_diagram"
    return "task1_academic_chart"


async def evaluate_writing_section(test: Dict, answers: Dict) -> Dict:
    """Evaluate writing section using the V4 evaluator (Liz's Margin).

    Each task result includes the full V4 payload under ``evaluator_v2`` plus
    the original ``essay_text`` and ``prompt`` so the frontend can render the
    rich annotated essay UI. Legacy keys (``criteria``/``feedback``) are kept
    for back-compat with older results consumers.
    """
    try:
        from services.writing_evaluator_v2 import (
            evaluate_writing as evaluate_writing_v4,
            EvaluatorFailure,
        )
        from schemas.writing_evaluator import WritingEvaluationRequest, TaskType
    except ImportError as exc:
        return {
            "band": 0,
            "error": f"Writing evaluator unavailable: {exc}",
            "tasks": [],
        }

    test_writing = (test.get("sections") or {}).get("writing") or {}
    tasks = list(test_writing.get("tasks", []))

    async def _eval_one(task: Dict[str, Any]) -> Dict[str, Any]:
        task_num = task.get("task_number") or 0
        user_response = (answers or {}).get(f"task{task_num}", "") or ""
        prompt_text = task.get("prompt") or task.get("question") or ""

        if not user_response.strip():
            return {
                "task": task_num,
                "band": 0,
                "essay_text": "",
                "prompt": prompt_text,
                "evaluator_v2": None,
                "feedback": "No response provided",
            }

        try:
            task_type_value = _classify_task_type_v4(task)
            task_type_enum = TaskType(task_type_value)
        except ValueError:
            task_type_enum = TaskType.task2_opinion if task_num == 2 else TaskType.task1_academic_chart

        try:
            req = WritingEvaluationRequest(
                essay_text=user_response,
                task_type_hint=task_type_enum,
                task_prompt=prompt_text,
                user_language="en",
            )
            v4_result = await evaluate_writing_v4(req)
            v4_dict = (
                v4_result.model_dump()
                if hasattr(v4_result, "model_dump")
                else v4_result.dict()
            )

            crit = v4_result.criteria
            return {
                "task": task_num,
                "band": v4_result.overall_band,
                "essay_text": user_response,
                "prompt": prompt_text,
                "evaluator_v2": v4_dict,
                "criteria": {
                    "task_achievement": crit.task_achievement.band,
                    "coherence_cohesion": crit.coherence_cohesion.band,
                    "lexical_resource": crit.lexical_resource.band,
                    "grammatical_range": crit.grammatical_range_accuracy.band,
                },
                "strengths": list(crit.task_achievement.strengths or []),
                "weaknesses": list(crit.task_achievement.weaknesses or []),
                "feedback": crit.task_achievement.explanation,
                "word_count_penalty": v4_result.word_count < v4_result.word_count_target,
            }
        except EvaluatorFailure as exc:
            print(f"Writing V4 evaluator failed for task {task_num}: {exc.last_error}")
            return {
                "task": task_num,
                "band": 0,
                "essay_text": user_response,
                "prompt": prompt_text,
                "evaluator_v2": None,
                "feedback": f"Evaluation failed after {exc.attempts} attempts",
                "error": str(exc.last_error or exc),
            }
        except Exception as exc:
            print(f"Writing evaluation error for task {task_num}: {exc}")
            return {
                "task": task_num,
                "band": 0,
                "essay_text": user_response,
                "prompt": prompt_text,
                "evaluator_v2": None,
                "feedback": "Evaluation failed",
                "error": str(exc),
            }

    # Run Task 1 + Task 2 in parallel — each Sonnet call is ~25-35s; serial
    # totals push past the 60s K8s ingress timeout. Parallel keeps wall-clock
    # bounded by the slower task instead of summing both.
    task_results: List[Dict[str, Any]] = (
        list(await asyncio.gather(*[_eval_one(t) for t in tasks])) if tasks else []
    )

    # Overall writing band: Task 2 weighted double (matching IELTS scoring)
    if task_results:
        t1 = next((t["band"] for t in task_results if t["task"] == 1), 0) or 0
        t2 = next((t["band"] for t in task_results if t["task"] == 2), 0) or 0
        if t1 and t2:
            overall_band = round((t1 + t2 * 2) / 3 * 2) / 2
        else:
            overall_band = t2 or t1 or 0
    else:
        overall_band = 0

    return {
        "band": overall_band,
        "tasks": task_results,
    }


async def evaluate_speaking_section(test: Dict, answers: Dict) -> Dict:
    """Evaluate speaking section using AI."""
    EMERGENT_LLM_KEY = os.environ.get("OPENAI_API_KEY")
    
    if not EMERGENT_LLM_KEY:
        return {
            "band": 0,
            "error": "Speaking evaluation service not configured"
        }
    
    try:
        from services.llm_compat import LlmChat, UserMessage
        
        # Combine all transcripts
        transcripts = []
        for key, value in answers.items():
            if isinstance(value, dict) and "transcript" in value:
                transcripts.append(f"{key}: {value['transcript']}")
            elif isinstance(value, str):
                transcripts.append(f"{key}: {value}")
        
        all_transcripts = "\n".join(transcripts)
        
        prompt = f"""You are an IELTS examiner. Evaluate this Speaking test based on transcripts.

TRANSCRIPTS:
{all_transcripts}

Evaluate using IELTS Speaking Band Descriptors:
1. Fluency and Coherence (FC)
2. Lexical Resource (LR)
3. Grammatical Range and Accuracy (GRA)
4. Pronunciation (P)

Respond in JSON format:
{{
    "band": <float 0-9, to nearest 0.5>,
    "criteria": {{
        "fluency_coherence": <int 0-9>,
        "lexical_resource": <int 0-9>,
        "grammatical_range": <int 0-9>,
        "pronunciation": <int 0-9>
    }},
    "strengths": ["<strength 1>", "<strength 2>"],
    "weaknesses": ["<weakness 1>", "<weakness 2>"],
    "feedback": "<examiner-style feedback>"
}}"""
        
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=str(uuid.uuid4()),
            system_message="You are an IELTS examiner. Respond only with valid JSON."
        )
        response = await chat.send_message(user_message=UserMessage(text=prompt))
        
        response_text = response
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0]
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0]
        
        return json.loads(response_text.strip())
        
    except Exception as e:
        print(f"Speaking evaluation error: {e}")
        return {
            "band": 0,
            "error": str(e)
        }
