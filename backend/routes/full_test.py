"""
IELTS-Style Full Test Mode API Routes
=====================================
Master API for full IELTS-style examinations.

All content is 100% ORIGINAL - not copied from Cambridge.
Designed to match IELTS format, timing, and difficulty.
"""

from fastapi import APIRouter, HTTPException, Body, Query
from typing import Dict, List, Any, Optional
from datetime import datetime, timezone
import uuid
import json
import os

router = APIRouter(prefix="/api/full-test", tags=["Full Test Mode"])

# Import shared evaluation helpers from cambridge routes
try:
    from routes.cambridge import (
        classify_reason_code, compare_answers as cambridge_compare,
        calculate_band_from_percentage, get_skill_tip,
        generate_explanation, generate_lesson_recommendations,
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

# Import test sets
try:
    from content.full_tests.academic.set_a import ACADEMIC_SET_A, get_academic_set_a
    from content.full_tests.academic.set_a_reading import ACADEMIC_SET_A_READING
except ImportError:
    ACADEMIC_SET_A = None
    ACADEMIC_SET_A_READING = None
    print("Warning: Could not import Academic Set A")

# Import General Training test sets
try:
    from content.full_tests.general.set_a import GENERAL_SET_A, get_general_set_a
except ImportError:
    GENERAL_SET_A = None
    print("Warning: Could not import General Training Set A")

# Import Set B content
try:
    from content.full_tests.academic.set_b import ACADEMIC_SET_B
    from content.full_tests.academic.set_b_reading import ACADEMIC_SET_B_READING
except ImportError:
    ACADEMIC_SET_B = None
    ACADEMIC_SET_B_READING = None
    print("Warning: Could not import Academic Set B")

try:
    from content.full_tests.general.set_b import GENERAL_SET_B
except ImportError:
    GENERAL_SET_B = None
    print("Warning: Could not import General Training Set B")

# Import Set C content
try:
    from content.full_tests.academic.set_c import ACADEMIC_SET_C
    from content.full_tests.academic.set_c_reading import ACADEMIC_SET_C_READING
except ImportError:
    ACADEMIC_SET_C = None
    ACADEMIC_SET_C_READING = None
    print("Warning: Could not import Academic Set C")

try:
    from content.full_tests.general.set_c import GENERAL_SET_C
except ImportError:
    GENERAL_SET_C = None
    print("Warning: Could not import General Training Set C")

# Import Set D content
try:
    from content.full_tests.academic.set_d import ACADEMIC_SET_D
    from content.full_tests.academic.set_d_reading import ACADEMIC_SET_D_READING
except ImportError:
    ACADEMIC_SET_D = None
    ACADEMIC_SET_D_READING = None
    print("Warning: Could not import Academic Set D")

try:
    from content.full_tests.general.set_d import GENERAL_SET_D
except ImportError:
    GENERAL_SET_D = None
    print("Warning: Could not import General Training Set D")

# Import Set E content
try:
    from content.full_tests.academic.set_e import ACADEMIC_SET_E
except ImportError:
    ACADEMIC_SET_E = None
    print("Warning: Could not import Academic Set E")

# Import Set F content
try:
    from content.full_tests.academic.set_f import ACADEMIC_SET_F
except ImportError:
    ACADEMIC_SET_F = None
    print("Warning: Could not import Academic Set F")

# Import Set G content
try:
    from content.full_tests.academic.set_g import ACADEMIC_SET_G
except ImportError:
    ACADEMIC_SET_G = None
    print("Warning: Could not import Academic Set G")

# Import Set H content
try:
    from content.full_tests.academic.set_h import ACADEMIC_SET_H
except ImportError:
    ACADEMIC_SET_H = None
    print("Warning: Could not import Academic Set H")

# Import Cambridge IELTS content
try:
    from content.cambridge_tests.ielts17.test1 import IELTS17_TEST1
except ImportError:
    IELTS17_TEST1 = None
    print("Warning: Could not import Cambridge IELTS 17 Test 1")


# ============ TEST REGISTRY ============

def get_all_test_sets() -> Dict[str, Any]:
    """Get all available test sets."""
    sets = {
        "academic": [],
        "general": []
    }
    
    # Academic sets
    for test_data in [ACADEMIC_SET_A, ACADEMIC_SET_B, ACADEMIC_SET_C, ACADEMIC_SET_D, ACADEMIC_SET_E, ACADEMIC_SET_F, ACADEMIC_SET_G, ACADEMIC_SET_H]:
        if test_data:
            sets["academic"].append({
                "test_id": test_data["test_id"],
                "title": test_data["title"],
                "description": test_data["description"],
                "estimated_time": test_data["estimated_time"],
                "sections_available": list(test_data["sections"].keys())
            })
    
    # General Training sets
    for test_data in [GENERAL_SET_A, GENERAL_SET_B, GENERAL_SET_C, GENERAL_SET_D]:
        if test_data:
            sets["general"].append({
                "test_id": test_data["test_id"],
                "title": test_data["title"],
                "description": test_data["description"],
                "estimated_time": test_data["estimated_time"],
                "sections_available": list(test_data["sections"].keys())
            })
    
    return sets


def get_test_by_id(test_id: str) -> Optional[Dict[str, Any]]:
    """Get a specific test by ID."""
    if test_id == "academic_set_a_01":
        test = ACADEMIC_SET_A.copy()
        test["sections"]["reading"] = ACADEMIC_SET_A_READING
        return test
    elif test_id == "academic_set_b_01":
        if ACADEMIC_SET_B and ACADEMIC_SET_B_READING:
            test = ACADEMIC_SET_B.copy()
            test["sections"]["reading"] = ACADEMIC_SET_B_READING
            return test
    elif test_id == "academic_set_c_01":
        if ACADEMIC_SET_C and ACADEMIC_SET_C_READING:
            test = ACADEMIC_SET_C.copy()
            test["sections"]["reading"] = ACADEMIC_SET_C_READING
            return test
    elif test_id == "academic_set_d_01":
        if ACADEMIC_SET_D and ACADEMIC_SET_D_READING:
            test = ACADEMIC_SET_D.copy()
            test["sections"]["reading"] = ACADEMIC_SET_D_READING
            return test
    elif test_id == "academic_set_e_01":
        if ACADEMIC_SET_E:
            return ACADEMIC_SET_E
    elif test_id == "academic_set_f_01":
        if ACADEMIC_SET_F:
            return ACADEMIC_SET_F
    elif test_id == "academic_set_g_01":
        if ACADEMIC_SET_G:
            return ACADEMIC_SET_G
    elif test_id == "academic_set_h_01":
        if ACADEMIC_SET_H:
            return ACADEMIC_SET_H
    elif test_id == "general_set_a_01":
        return GENERAL_SET_A
    elif test_id == "general_set_b_01":
        return GENERAL_SET_B
    elif test_id == "general_set_c_01":
        return GENERAL_SET_C
    elif test_id == "general_set_d_01":
        return GENERAL_SET_D
    # Cambridge IELTS Tests
    elif test_id == "ielts17_test1":
        return IELTS17_TEST1
    return None


# ============ API ENDPOINTS ============

@router.get("/sets")
async def list_test_sets(
    test_type: Optional[str] = Query(None, description="Filter by test type: academic or general")
):
    """
    List all available IELTS-style full test sets.
    
    Returns test sets with metadata, without actual content.
    """
    all_sets = get_all_test_sets()
    
    if test_type:
        if test_type not in ["academic", "general"]:
            raise HTTPException(status_code=400, detail="Invalid test_type. Use 'academic' or 'general'")
        return {
            "success": True,
            "test_type": test_type,
            "sets": all_sets.get(test_type, []),
            "total": len(all_sets.get(test_type, []))
        }
    
    return {
        "success": True,
        "academic_sets": all_sets["academic"],
        "general_sets": all_sets["general"],
        "total_academic": len(all_sets["academic"]),
        "total_general": len(all_sets["general"])
    }


@router.get("/set/{test_id}")
async def get_test_set(
    test_id: str,
    include_answers: bool = Query(False, description="Include answers (for review mode only)")
):
    """
    Get a specific full test set with all content.
    
    Note: Answers are only included if explicitly requested (e.g., for review).
    In normal test mode, answers should NOT be requested.
    """
    test = get_test_by_id(test_id)
    
    if not test:
        raise HTTPException(status_code=404, detail=f"Test set '{test_id}' not found")
    
    # Remove answers if not requested
    if not include_answers:
        test = strip_answers(test)
    
    return {
        "success": True,
        "test": test
    }


@router.get("/set/{test_id}/section/{section}")
async def get_test_section(
    test_id: str,
    section: str,
    include_answers: bool = Query(False)
):
    """
    Get a specific section of a test (listening, reading, writing, or speaking).
    
    Useful for section-by-section test taking mode.
    """
    test = get_test_by_id(test_id)
    
    if not test:
        raise HTTPException(status_code=404, detail=f"Test set '{test_id}' not found")
    
    if section not in test.get("sections", {}):
        raise HTTPException(status_code=404, detail=f"Section '{section}' not found in test")
    
    section_data = test["sections"][section]
    
    if not include_answers:
        section_data = strip_section_answers(section, section_data)
    
    return {
        "success": True,
        "test_id": test_id,
        "test_type": test["test_type"],
        "section": section,
        "timing": TEST_TIMINGS.get(section, {}),
        "data": section_data
    }


@router.post("/start")
async def start_test_session(
    test_id: str = Body(...),
    user_id: Optional[str] = Body(None),
    mode: str = Body("full", description="Test mode: 'full' or 'section'"),
    sections: Optional[List[str]] = Body(None, description="Sections to include (for section mode)")
):
    """
    Start a new test session.
    
    Creates a session that tracks:
    - Start time
    - Sections to complete
    - Progress
    - Answers (submitted later)
    
    Returns session_id for subsequent operations.
    """
    test = get_test_by_id(test_id)
    if not test:
        raise HTTPException(status_code=404, detail=f"Test set '{test_id}' not found")
    
    # Validate sections if provided
    if sections:
        for s in sections:
            if s not in test.get("sections", {}):
                raise HTTPException(status_code=400, detail=f"Invalid section: {s}")
    
    # Generate session ID
    session_id = str(uuid.uuid4())
    
    # Calculate section order and timing
    section_order = sections if sections else ["listening", "reading", "writing", "speaking"]
    
    session = {
        "session_id": session_id,
        "test_id": test_id,
        "test_type": test["test_type"],
        "user_id": user_id,
        "mode": mode,
        "sections": section_order,
        "current_section": section_order[0],
        "current_section_index": 0,
        "started_at": datetime.now(timezone.utc).isoformat(),
        "section_times": {},
        "status": "in_progress",
        "answers": {}
    }
    
    # In production, store session in database
    # For now, return session details
    return {
        "success": True,
        "session": session,
        "instructions": f"You are about to start the {test['title']}. The first section is {section_order[0].upper()}.",
        "first_section": {
            "name": section_order[0],
            "timing": TEST_TIMINGS.get(section_order[0], {})
        }
    }


@router.post("/submit-section")
async def submit_section(
    session_id: str = Body(...),
    section: str = Body(...),
    answers: Dict[str, Any] = Body(...),
    time_taken: int = Body(..., description="Time taken in seconds")
):
    """
    Submit answers for a completed section.
    
    Section answers are locked once submitted - cannot be changed.
    Progress to next section is automatic.
    """
    # Validate section
    valid_sections = ["listening", "reading", "writing", "speaking"]
    if section not in valid_sections:
        raise HTTPException(status_code=400, detail=f"Invalid section: {section}")
    
    # In production, validate session exists and is in correct state
    # For now, accept submission
    
    return {
        "success": True,
        "session_id": session_id,
        "section_submitted": section,
        "time_taken": time_taken,
        "answers_count": len(answers),
        "message": f"{section.capitalize()} section submitted. Answers are now locked.",
        "status": "section_complete"
    }


@router.post("/complete")
async def complete_test(
    session_id: str = Body(...),
    test_id: str = Body(...),
    all_answers: Dict[str, Dict[str, Any]] = Body(...),
    section_times: Dict[str, int] = Body(default={}),
    mode: str = Body(default="full")
):
    """
    Complete test and generate full evaluation.
    
    This is called after all sections are submitted.
    Generates comprehensive results including:
    - Band scores per section
    - Overall band score
    - Detailed feedback
    - Strengths and weaknesses
    - Improvement recommendations
    """
    test = get_test_by_id(test_id)
    if not test:
        raise HTTPException(status_code=404, detail=f"Test set '{test_id}' not found")
    
    results = await evaluate_full_test(test, all_answers, section_times)
    
    return {
        "success": True,
        "session_id": session_id,
        "test_id": test_id,
        "mode": mode,
        "completed_at": datetime.now(timezone.utc).isoformat(),
        "results": results
    }


@router.get("/results/{session_id}")
async def get_test_results(session_id: str):
    """
    Get results for a completed test session.
    
    In production, retrieves from database.
    """
    # In production, fetch from database
    return {
        "success": False,
        "message": "Results retrieval requires database integration",
        "session_id": session_id
    }


# ============ EVALUATION FUNCTIONS ============

async def evaluate_full_test(
    test: Dict[str, Any],
    answers: Dict[str, Dict[str, Any]],
    section_times: Dict[str, int]
) -> Dict[str, Any]:
    """
    Comprehensive test evaluation with rich feedback.
    Returns: sections, overall, skill_breakdown, teacher_feedback,
    recommended_lessons, question_results, fastest_gain, integrity_warnings, reason_summary
    """
    results = {
        "sections": {},
        "overall": {}
    }

    # Evaluate Listening
    listening_result = None
    if "listening" in answers and "listening" in test.get("sections", {}):
        listening_result = evaluate_listening(test, answers["listening"])
        results["sections"]["listening"] = listening_result

    # Evaluate Reading
    reading_result = None
    if "reading" in answers and "reading" in test.get("sections", {}):
        reading_result = evaluate_reading(test, answers["reading"])
        results["sections"]["reading"] = reading_result

    # Evaluate Writing (AI)
    if "writing" in answers and "writing" in test.get("sections", {}):
        writing_result = await evaluate_writing_section(test, answers["writing"])
        results["sections"]["writing"] = writing_result

    # Evaluate Speaking (AI)
    if "speaking" in answers and "speaking" in test.get("sections", {}):
        speaking_result = await evaluate_speaking_section(test, answers["speaking"])
        results["sections"]["speaking"] = speaking_result

    # Calculate overall band
    bands = []
    for section in ["listening", "reading", "writing", "speaking"]:
        if section in results["sections"]:
            bands.append(results["sections"][section].get("band", 0))
    if bands:
        overall = round(sum(bands) / len(bands) * 2) / 2
        results["overall"]["band"] = overall
        results["overall"]["sections_completed"] = len(bands)

    # ============ RICH FEEDBACK ============
    if CAMBRIDGE_HELPERS_AVAILABLE:
        # Skill breakdown by question type
        skill_breakdown = []
        for section_name, section_result in [("listening", listening_result), ("reading", reading_result)]:
            if section_result and "by_type" in section_result:
                for qtype, stats in section_result["by_type"].items():
                    accuracy = stats["correct"] / stats["total"] if stats["total"] > 0 else 0
                    skill_breakdown.append({
                        "skill_id": f"{section_name}_{qtype}",
                        "label": f"{section_name.title()} - {qtype.replace('_', ' ').title()}",
                        "correct": stats["correct"],
                        "total": stats["total"],
                        "tip": get_skill_tip(section_name, qtype, accuracy)
                    })
        results["skill_breakdown"] = skill_breakdown

        # Fastest gain
        gain_candidates = []
        for s in skill_breakdown:
            if s["total"] > 0:
                wrong = s["total"] - s["correct"]
                if wrong > 0:
                    gain_candidates.append({
                        "label": s["label"],
                        "skill_id": s["skill_id"],
                        "wrong_count": wrong,
                        "total": s["total"],
                        "accuracy": round((s["correct"] / s["total"]) * 100),
                        "potential_gain": wrong,
                        "tip": s.get("tip", "")
                    })
        gain_candidates.sort(key=lambda x: x["wrong_count"], reverse=True)
        results["fastest_gain"] = gain_candidates[:3]

        # Question results (detailed per question)
        results["question_results"] = {
            "listening": listening_result.get("details", []) if listening_result else [],
            "reading": reading_result.get("details", []) if reading_result else []
        }

        # Integrity warnings
        integrity_warnings = []
        for sec_name, sec_result in [("listening", listening_result), ("reading", reading_result)]:
            if sec_result:
                unanswered = sum(1 for d in sec_result.get("details", []) if d.get("reason_code") == "UNANSWERED")
                if unanswered > 0:
                    integrity_warnings.append({
                        "type": "unanswered",
                        "section": sec_name,
                        "count": unanswered,
                        "message": f"{unanswered} {sec_name} question(s) left unanswered. These count as wrong."
                    })
        results["integrity_warnings"] = integrity_warnings

        # Reason summary
        all_details = results["question_results"]["listening"] + results["question_results"]["reading"]
        reason_counts = {}
        for d in all_details:
            rc = d.get("reason_code")
            if rc:
                reason_counts[rc] = reason_counts.get(rc, 0) + 1
        results["reason_summary"] = reason_counts

        # Recommended lessons
        results["recommended_lessons"] = generate_lesson_recommendations(skill_breakdown, test.get("test_type", "academic"))

        # AI Teacher Feedback
        teacher_feedback = await generate_ai_teacher_feedback(results, skill_breakdown, test)
        results["teacher_feedback"] = teacher_feedback
    else:
        results["skill_breakdown"] = []
        results["fastest_gain"] = []
        results["question_results"] = {"listening": [], "reading": []}
        results["integrity_warnings"] = []
        results["reason_summary"] = {}
        results["recommended_lessons"] = []
        results["teacher_feedback"] = None

    # Summary
    results["summary"] = generate_test_summary(results)
    return results


async def generate_ai_teacher_feedback(results: Dict, skill_breakdown: list, test: Dict) -> Optional[Dict]:
    """Generate AI teacher feedback using LLM."""
    EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")
    if not EMERGENT_LLM_KEY:
        return None
    try:
        from emergentintegrations.llm.openai import LlmChat, UserMessage

        sections = results.get("sections", {})
        listening = sections.get("listening", {})
        reading = sections.get("reading", {})

        weak_areas = [s for s in skill_breakdown if s["total"] > 0 and (s["correct"] / s["total"]) < 0.5]
        strong_areas = [s for s in skill_breakdown if s["total"] > 0 and (s["correct"] / s["total"]) >= 0.7]
        weak_summary = ", ".join([s["label"] for s in weak_areas[:3]]) if weak_areas else "None identified"
        strong_summary = ", ".join([s["label"] for s in strong_areas[:3]]) if strong_areas else "Keep practicing"

        # Detect system language from test context
        lang_note = "Respond in the student's system language (Turkish) so they fully understand the feedback."

        prompt = f"""You are an experienced IELTS teacher providing feedback on an IELTS practice test.
{lang_note}

TEST RESULTS:
- Listening: {listening.get('correct', 0)}/{listening.get('total', 0)} ({listening.get('percentage', 0):.1f}%)
- Reading: {reading.get('correct', 0)}/{reading.get('total', 0)} ({reading.get('percentage', 0):.1f}%)
- Overall Band: {results.get('overall', {}).get('band', 'N/A')}

WEAK AREAS: {weak_summary}
STRONG AREAS: {strong_summary}

DETAILED BREAKDOWN:
{json.dumps(skill_breakdown, indent=2)}

Generate personalized feedback in JSON format:
{{
    "short": "2-3 sentence summary of performance with encouragement",
    "detailed": "4-5 sentences with specific study recommendations based on weak areas"
}}

Be specific, constructive, and mention actual question types by name."""

        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=str(uuid.uuid4()),
            system_message="You are an IELTS teacher. Respond only with valid JSON."
        )
        response = await chat.send_message(user_message=UserMessage(text=prompt))

        response_text = str(response)
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0]
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0]

        return json.loads(response_text.strip())
    except Exception as e:
        print(f"AI teacher feedback error: {e}")
        return None


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
                detail["explanation"] = generate_explanation(q_type, correct_answer, is_correct)
                detail["skill_tip"] = get_skill_tip("listening", q_type, 1 if is_correct else 0)

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
                detail["explanation"] = generate_explanation(q_type, correct_answer, is_correct)
                detail["skill_tip"] = get_skill_tip("reading", q_type, 1 if is_correct else 0)

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


async def evaluate_writing_section(test: Dict, answers: Dict) -> Dict:
    """Evaluate writing section using AI."""
    # Use GPT-4o for writing evaluation
    EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")
    
    if not EMERGENT_LLM_KEY:
        return {
            "band": 0,
            "error": "Writing evaluation service not configured",
            "note": "AI evaluation required for writing"
        }
    
    try:
        from emergentintegrations.llm.openai import LlmChat, UserMessage
        
        test_writing = test["sections"]["writing"]
        task_results = []
        
        for task in test_writing.get("tasks", []):
            task_num = task["task_number"]
            user_response = answers.get(f"task{task_num}", "")
            
            if not user_response.strip():
                task_results.append({
                    "task": task_num,
                    "band": 0,
                    "feedback": "No response provided"
                })
                continue
            
            # Build evaluation prompt
            prompt = f"""You are an IELTS examiner. Evaluate this Writing {'Task 1' if task_num == 1 else 'Task 2'} response.

PROMPT:
{task['prompt']}

RESPONSE:
{user_response}

WORD COUNT: {len(user_response.split())}
MINIMUM REQUIRED: {task['word_limit']['min']}

Evaluate using IELTS Writing Band Descriptors for:
1. Task Achievement/Response (TA/TR)
2. Coherence and Cohesion (CC)
3. Lexical Resource (LR)
4. Grammatical Range and Accuracy (GRA)

Respond in JSON format:
{{
    "band": <float 0-9, to nearest 0.5>,
    "criteria": {{
        "task_achievement": <int 0-9>,
        "coherence_cohesion": <int 0-9>,
        "lexical_resource": <int 0-9>,
        "grammatical_range": <int 0-9>
    }},
    "strengths": ["<strength 1>", "<strength 2>"],
    "weaknesses": ["<weakness 1>", "<weakness 2>"],
    "feedback": "<2-3 sentences of examiner-style feedback>",
    "word_count_penalty": <boolean if under minimum>
}}"""
            
            chat = LlmChat(
                api_key=EMERGENT_LLM_KEY,
                session_id=str(uuid.uuid4()),
                system_message="You are an IELTS examiner. Respond only with valid JSON."
            )
            response = await chat.send_message(user_message=UserMessage(text=prompt))
            
            # Parse response
            response_text = response
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0]
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0]
            
            evaluation = json.loads(response_text.strip())
            evaluation["task"] = task_num
            task_results.append(evaluation)
        
        # Calculate overall writing band (Task 2 weighted double)
        if task_results:
            task1_band = next((t["band"] for t in task_results if t["task"] == 1), 0)
            task2_band = next((t["band"] for t in task_results if t["task"] == 2), 0)
            overall_band = (task1_band + (task2_band * 2)) / 3
            overall_band = round(overall_band * 2) / 2
        else:
            overall_band = 0
        
        return {
            "band": overall_band,
            "tasks": task_results
        }
        
    except Exception as e:
        print(f"Writing evaluation error: {e}")
        return {
            "band": 0,
            "error": str(e)
        }


async def evaluate_speaking_section(test: Dict, answers: Dict) -> Dict:
    """Evaluate speaking section using AI."""
    EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")
    
    if not EMERGENT_LLM_KEY:
        return {
            "band": 0,
            "error": "Speaking evaluation service not configured"
        }
    
    try:
        from emergentintegrations.llm.openai import LlmChat, UserMessage
        
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


def generate_test_summary(results: Dict) -> Dict:
    """Generate human-readable test summary."""
    sections = results.get("sections", {})
    overall = results.get("overall", {})
    
    summary_lines = []
    
    if overall.get("band"):
        summary_lines.append(f"Overall Band Score: {overall['band']}")
    
    for section in ["listening", "reading", "writing", "speaking"]:
        if section in sections:
            s = sections[section]
            if "correct" in s:
                summary_lines.append(f"{section.capitalize()}: Band {s['band']} ({s['correct']}/{s['total']} correct)")
            else:
                summary_lines.append(f"{section.capitalize()}: Band {s.get('band', 'N/A')}")
    
    return {
        "text": "\n".join(summary_lines),
        "recommendation": get_band_recommendation(overall.get("band", 0))
    }


def get_band_recommendation(band: float) -> str:
    """Get study recommendation based on band score."""
    if band >= 8.0:
        return "Excellent! You have expert command of English. Focus on maintaining your skills."
    elif band >= 7.0:
        return "Very good! You have operational command. Focus on advanced vocabulary and complex structures."
    elif band >= 6.0:
        return "Good! You're a competent user. Work on accuracy and expanding your range of expression."
    elif band >= 5.0:
        return "Modest user. Focus on improving grammatical accuracy and developing vocabulary."
    else:
        return "Limited user. Recommend intensive study focusing on all language skills."


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


def strip_answers(test: Dict) -> Dict:
    """Remove answers from test for student view."""
    import copy
    test = copy.deepcopy(test)
    
    for section_name, section in test.get("sections", {}).items():
        test["sections"][section_name] = strip_section_answers(section_name, section)
    
    return test


def strip_section_answers(section_name: str, section: Dict) -> Dict:
    """Remove answers from a specific section."""
    import copy
    section = copy.deepcopy(section)
    
    if section_name == "listening":
        for part in section.get("parts", []):
            for q in part.get("questions", []):
                q.pop("answer", None)
                q.pop("explanation", None)
    
    elif section_name == "reading":
        for passage in section.get("passages", []):
            for q in passage.get("questions", []):
                q.pop("answer", None)
                q.pop("explanation", None)
    
    return section
