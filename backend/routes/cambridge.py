"""
Cambridge IELTS Tests Router
Serves authentic Cambridge IELTS test content with full evaluation
"""

from fastapi import APIRouter, HTTPException, Body
from fastapi.responses import FileResponse
from typing import Optional, Dict, Any
from pathlib import Path
import os
import re
import json
import uuid
import asyncio
from functools import lru_cache

router = APIRouter(prefix="/api/cambridge", tags=["cambridge"])

# Simple cache for teacher feedback based on performance patterns
_feedback_cache = {}

# Import test content - IELTS 17
try:
    from content.cambridge_tests.ielts17.test1 import IELTS17_TEST1
except ImportError:
    IELTS17_TEST1 = None
    print("Warning: Could not import IELTS 17 Test 1")

try:
    from content.cambridge_tests.ielts17.test2 import IELTS17_TEST2
except ImportError:
    IELTS17_TEST2 = None
    print("Warning: Could not import IELTS 17 Test 2")

try:
    from content.cambridge_tests.ielts17.test3 import IELTS17_TEST3
except ImportError:
    IELTS17_TEST3 = None
    print("Warning: Could not import IELTS 17 Test 3")

try:
    from content.cambridge_tests.ielts17.test4 import IELTS17_TEST4
except ImportError:
    IELTS17_TEST4 = None
    print("Warning: Could not import IELTS 17 Test 4")

# Import test content - IELTS 18
try:
    from content.cambridge_tests.ielts18.test1 import IELTS18_TEST1
except (ImportError, SyntaxError) as e:
    IELTS18_TEST1 = None
    print(f"Warning: Could not import IELTS 18 Test 1: {e}")

try:
    from content.cambridge_tests.ielts18.test2 import IELTS18_TEST2
except (ImportError, SyntaxError) as e:
    IELTS18_TEST2 = None
    print(f"Warning: Could not import IELTS 18 Test 2: {e}")

try:
    from content.cambridge_tests.ielts18.test3 import IELTS18_TEST3
except (ImportError, SyntaxError) as e:
    IELTS18_TEST3 = None
    print(f"Warning: Could not import IELTS 18 Test 3: {e}")

try:
    from content.cambridge_tests.ielts18.test4 import IELTS18_TEST4
except (ImportError, SyntaxError) as e:
    IELTS18_TEST4 = None
    print(f"Warning: Could not import IELTS 18 Test 4: {e}")

# LLM Key for evaluation
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")


# Available Cambridge tests registry
CAMBRIDGE_TESTS = {
    "ielts17": {
        "book_id": "ielts17",
        "title": "Cambridge IELTS 17",
        "description": "Official Cambridge IELTS 17 Academic practice tests",
        "tests": {
            "test1": IELTS17_TEST1,
            "test2": IELTS17_TEST2,
            "test3": IELTS17_TEST3,
            "test4": IELTS17_TEST4,
        },
        "available_tests": ["test1", "test2", "test3", "test4"],
        "coming_soon": []
    },
    "ielts18": {
        "book_id": "ielts18",
        "title": "Cambridge IELTS 18",
        "description": "Official Cambridge IELTS 18 Academic practice tests",
        "tests": {
            "test1": IELTS18_TEST1,
            "test2": IELTS18_TEST2,
            "test3": IELTS18_TEST3,
            "test4": IELTS18_TEST4,
        },
        "available_tests": ["test1", "test2", "test3", "test4"],
        "coming_soon": []
    }
}


@router.get("/books")
async def list_cambridge_books():
    """List all available Cambridge IELTS books"""
    books = []
    for book_id, book_data in CAMBRIDGE_TESTS.items():
        available_count = len([t for t in book_data["tests"].values() if t is not None])
        books.append({
            "book_id": book_id,
            "title": book_data["title"],
            "description": book_data["description"],
            "total_tests": len(book_data["tests"]),
            "available_tests": available_count,
            "coming_soon": len(book_data["coming_soon"])
        })
    return {"success": True, "books": books}


# Serve static images for Cambridge tests
@router.get("/images/{book_id}/{test_id}/{filename}")
async def get_cambridge_image(book_id: str, test_id: str, filename: str):
    """Serve Cambridge test images"""
    base_path = Path(__file__).parent.parent / "static" / "images" / "cambridge" / book_id / test_id
    file_path = base_path / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail=f"Image not found: {filename}")
    
    return FileResponse(file_path, media_type="image/png")



@router.get("/books/{book_id}")
async def get_cambridge_book(book_id: str):
    """Get details of a specific Cambridge book"""
    if book_id not in CAMBRIDGE_TESTS:
        raise HTTPException(status_code=404, detail=f"Book '{book_id}' not found")
    
    book = CAMBRIDGE_TESTS[book_id]
    tests = []
    
    for test_id, test_data in book["tests"].items():
        if test_data:
            tests.append({
                "test_id": test_data["test_id"],
                "test_number": test_data["test_number"],
                "title": test_data["title"],
                "description": test_data["description"],
                "test_type": test_data["test_type"],
                "estimated_time": test_data["estimated_time"],
                "available": True,
                "sections": list(test_data["sections"].keys())
            })
        else:
            test_num = int(test_id.replace("test", ""))
            tests.append({
                "test_id": f"{book_id}_{test_id}",
                "test_number": test_num,
                "title": f"Test {test_num}",
                "description": "Coming soon",
                "available": False,
                "coming_soon": True
            })
    
    return {
        "success": True,
        "book": {
            "book_id": book_id,
            "title": book["title"],
            "description": book["description"],
            "tests": tests
        }
    }


@router.get("/test/{book_id}/{test_id}")
async def get_cambridge_test(book_id: str, test_id: str):
    """Get full test content"""
    if book_id not in CAMBRIDGE_TESTS:
        raise HTTPException(status_code=404, detail=f"Book '{book_id}' not found")
    
    book = CAMBRIDGE_TESTS[book_id]
    
    if test_id not in book["tests"]:
        raise HTTPException(status_code=404, detail=f"Test '{test_id}' not found in {book_id}")
    
    test_data = book["tests"][test_id]
    
    if test_data is None:
        raise HTTPException(status_code=404, detail=f"Test '{test_id}' is coming soon")
    
    return {"success": True, "test": test_data}


@router.get("/test/{book_id}/{test_id}/section/{section}")
async def get_cambridge_test_section(book_id: str, test_id: str, section: str):
    """Get specific section of a test"""
    if book_id not in CAMBRIDGE_TESTS:
        raise HTTPException(status_code=404, detail=f"Book '{book_id}' not found")
    
    book = CAMBRIDGE_TESTS[book_id]
    
    if test_id not in book["tests"]:
        raise HTTPException(status_code=404, detail=f"Test '{test_id}' not found")
    
    test_data = book["tests"][test_id]
    
    if test_data is None:
        raise HTTPException(status_code=404, detail=f"Test '{test_id}' is coming soon")
    
    if section not in test_data["sections"]:
        raise HTTPException(status_code=404, detail=f"Section '{section}' not found")
    
    return {
        "success": True,
        "test_id": test_data["test_id"],
        "section": section,
        "data": test_data["sections"][section]
    }


@router.get("/answers/{book_id}/{test_id}")
async def get_answer_key(book_id: str, test_id: str):
    """Get answer key for a test"""
    if book_id not in CAMBRIDGE_TESTS:
        raise HTTPException(status_code=404, detail=f"Book '{book_id}' not found")
    
    book = CAMBRIDGE_TESTS[book_id]
    
    if test_id not in book["tests"]:
        raise HTTPException(status_code=404, detail=f"Test '{test_id}' not found")
    
    test_data = book["tests"][test_id]
    
    if test_data is None:
        raise HTTPException(status_code=404, detail=f"Test '{test_id}' is coming soon")
    
    # Get answers directly from answer_keys if available
    if "answer_keys" in test_data:
        return {"success": True, "answers": test_data["answer_keys"]}
    
    # Fallback: Extract answers from test content
    answers = {
        "listening": {},
        "reading": {}
    }
    
    # Listening answers
    listening_data = test_data.get("sections", {}).get("listening", {})
    for part in listening_data.get("parts", []):
        for q_group in part.get("question_groups", []):
            for q in q_group.get("questions", []):
                q_num = q.get("question_number")
                answer = q.get("answer") or q.get("correct_answer")
                if q_num and answer:
                    answers["listening"][str(q_num)] = answer
    
    # Reading answers
    reading_data = test_data.get("sections", {}).get("reading", {})
    for passage in reading_data.get("passages", []):
        for q_group in passage.get("question_groups", []):
            for q in q_group.get("questions", []):
                q_num = q.get("question_number")
                answer = q.get("answer") or q.get("correct_answer")
                if q_num and answer:
                    answers["reading"][str(q_num)] = answer
    
    return {"success": True, "answers": answers}


@router.get("/sample-answers/{book_id}/{test_id}")
async def get_sample_answers(book_id: str, test_id: str):
    """Get sample writing answers for reference"""
    if book_id not in CAMBRIDGE_TESTS:
        raise HTTPException(status_code=404, detail=f"Book '{book_id}' not found")
    
    book = CAMBRIDGE_TESTS[book_id]
    test_data = book["tests"].get(test_id)
    
    if test_data is None:
        raise HTTPException(status_code=404, detail=f"Test '{test_id}' not found")
    
    sample_answers = test_data.get("sample_answers", {})
    return {"success": True, "samples": sample_answers}


@router.post("/evaluate/writing")
async def evaluate_cambridge_writing(
    book_id: str = Body(...),
    test_id: str = Body(...),
    task_number: int = Body(...),  # 1 or 2
    response: str = Body(...),
    user_id: Optional[str] = Body(None),
):
    """
    Evaluate Cambridge Writing Task using detailed IELTS criteria.
    Returns band scores with detailed feedback like official Cambridge sample answers.
    """
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="Evaluation service not configured")
    
    try:
        from services.llm_compat import LlmChat, UserMessage
        
        # Get task details
        book = CAMBRIDGE_TESTS.get(book_id, {})
        test_data = book.get("tests", {}).get(test_id)
        
        if not test_data:
            raise HTTPException(status_code=404, detail="Test not found")
        
        writing_section = test_data.get("sections", {}).get("writing", {})
        tasks = writing_section.get("tasks", [])
        task = next((t for t in tasks if t.get("task_number") == task_number), None)
        
        # Word count
        word_count = len(response.split()) if response else 0
        min_words = 150 if task_number == 1 else 250
        
        # Get sample answers for reference (if available)
        sample_answers = test_data.get("sample_answers", {}).get("writing", {})
        task_key = f"task{task_number}"
        reference_samples = sample_answers.get(task_key, {})
        
        # Build evaluation prompt
        task_type = "Task 1 (Report/Description)" if task_number == 1 else "Task 2 (Essay)"
        
        evaluation_prompt = f"""You are a senior IELTS examiner evaluating a Cambridge IELTS {task_type} response.

## TASK DETAILS
- Task Type: Academic Writing {task_type}
- Minimum Words: {min_words}
- Candidate's Word Count: {word_count}

## CANDIDATE'S RESPONSE
{response}

## EVALUATION INSTRUCTIONS
Evaluate using official IELTS Writing Band Descriptors:

1. **Task Achievement/Response (TA/TR)**
   - Task 1: Does it describe the key features? Is there an overview?
   - Task 2: Does it address all parts? Is the position clear throughout?

2. **Coherence and Cohesion (CC)**
   - Is information logically organized?
   - Are paragraphs well-structured?
   - Are cohesive devices used effectively?

3. **Lexical Resource (LR)**
   - Is vocabulary range adequate?
   - Are words used accurately?
   - Are there spelling errors?

4. **Grammatical Range and Accuracy (GRA)**
   - Is there sentence variety?
   - Are structures used accurately?
   - Are there punctuation errors?

## OUTPUT FORMAT (JSON only)
{{
    "overall_band": <float 1.0-9.0, to nearest 0.5>,
    "task_achievement": <float 1.0-9.0>,
    "coherence_cohesion": <float 1.0-9.0>,
    "lexical_resource": <float 1.0-9.0>,
    "grammatical_range": <float 1.0-9.0>,
    "examiner_comment": "<Detailed 3-4 sentence feedback in Cambridge examiner style>",
    "strengths": ["<strength 1>", "<strength 2>"],
    "areas_for_improvement": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
    "vocabulary_notes": "<Specific vocabulary feedback with examples from the text>",
    "grammar_notes": "<Specific grammar feedback with examples from the text>",
    "word_count_penalty": <true/false if under minimum>
}}

Provide honest, calibrated scoring. Be specific with examples from the candidate's text."""

        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=str(uuid.uuid4()),
            system_message="You are a Cambridge IELTS Writing examiner. Respond only with valid JSON."
        )
        
        result = await chat.send_message(
            user_message=UserMessage(text=evaluation_prompt)
        )
        # Rate limiting: prevent Claude API Usage Policy violations
        await asyncio.sleep(1.0)
        
        # Parse response
        response_text = str(result)
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0]
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0]
        
        evaluation = json.loads(response_text.strip())

        # Persist to test_attempts so Progress page + Liz see this writing task.
        try:
            from server import persist_attempt
            await persist_attempt(
                user_id=user_id,
                test_id=f"{book_id}_{test_id}_writing_task{task_number}",
                test_type="writing",
                band_score=float(evaluation.get("overall_band", 0.0) or 0.0),
                feedback={
                    "source": "cambridge",
                    "task_number": task_number,
                    "evaluation": evaluation,
                },
            )
        except Exception as _e:
            print(f"persist_attempt skipped (writing): {_e}")

        return {
            "success": True,
            "task_number": task_number,
            "word_count": word_count,
            "minimum_words": min_words,
            "evaluation": evaluation,
            "overall_band": evaluation.get("overall_band", 5.0),
            "criteria": {
                "task_achievement": evaluation.get("task_achievement", 5.0),
                "coherence_cohesion": evaluation.get("coherence_cohesion", 5.0),
                "lexical_resource": evaluation.get("lexical_resource", 5.0),
                "grammatical_range": evaluation.get("grammatical_range", 5.0)
            },
            "feedback": {
                "examiner_comment": evaluation.get("examiner_comment", ""),
                "strengths": evaluation.get("strengths", []),
                "improvements": evaluation.get("areas_for_improvement", []),
                "vocabulary_notes": evaluation.get("vocabulary_notes", ""),
                "grammar_notes": evaluation.get("grammar_notes", "")
            },
            "reference_samples": reference_samples  # Include band 6 and band 8 samples
        }
        
    except json.JSONDecodeError as e:
        print(f"JSON parse error: {e}")
        raise HTTPException(status_code=500, detail="Failed to parse evaluation response")
    except Exception as e:
        print(f"Writing evaluation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/audio/{book_id}/{test_id}/{part}")
async def get_audio_path(book_id: str, test_id: str, part: int):
    """Get audio file path for a listening part"""
    audio_path = f"/static/audio/cambridge/{book_id}/{test_id}_part{part}.mp3"
    return {"success": True, "audio_path": audio_path}


@router.post("/evaluate/full-test")
async def evaluate_cambridge_full_test(
    book_id: str = Body(...),
    test_id: str = Body(...),
    answers: Dict[str, Any] = Body(...),
    user_plan: str = Body("free"),
    skill: Optional[str] = Body(None),
    user_id: Optional[str] = Body(None),
):
    """
    Comprehensive Cambridge Test Evaluation
    Returns: skill_breakdown, teacher_feedback, recommended_lessons
    Matches the existing QB Results page format

    `skill` is an optional filter:
      - "reading"   → only the reading section is scored / returned
      - "listening" → only the listening section is scored / returned
      - None / ""   → both sections (legacy full-test behaviour)
    The response shape stays the same; the skipped section gets zeroed
    scores and an empty details list so the frontend can detect it.
    """
    # LLM is OPTIONAL: deterministic scoring + per-question results
    # (drilldown data) all work without it. Only `teacher_feedback`
    # depends on the LLM. Without a key we still return scores +
    # question_results so the frontend renders the full drilldown
    # instead of falling back to a basic-only path that hides it.
    llm_available = bool(EMERGENT_LLM_KEY)

    try:
        from services.llm_compat import LlmChat, UserMessage
        
        # Get test data and answers
        book = CAMBRIDGE_TESTS.get(book_id, {})
        test_data = book.get("tests", {}).get(test_id)
        
        if not test_data:
            raise HTTPException(status_code=404, detail="Test not found")
        
        # Get answer key - extract from test data if not provided directly
        answer_key = test_data.get("answer_keys", {})
        
        # If answer_keys not present, extract from questions
        if not answer_key:
            answer_key = extract_answer_keys_from_test(test_data)
        
        # ============ CALCULATE SCORES ============
        # Empty-section sentinel — used for the skipped half when `skill`
        # is set so downstream code (band, breakdown, study plan) keeps the
        # same shape without extra branches.
        _empty_section = {
            "correct": 0,
            "total": 0,
            "percentage": 0,
            "by_type": {},
            "details": [],
        }

        # Tolerate non-string defaults (e.g. when this function is invoked
        # directly in tests with the FastAPI Body() sentinel as default).
        skill_norm = skill.strip().lower() if isinstance(skill, str) else ""
        do_listening = skill_norm in ("", "listening", "all", "both")
        do_reading = skill_norm in ("", "reading", "all", "both")

        listening_results = (
            calculate_section_results("listening", answers, answer_key.get("listening", {}), test_data)
            if do_listening else dict(_empty_section)
        )
        reading_results = (
            calculate_section_results("reading", answers, answer_key.get("reading", {}), test_data)
            if do_reading else dict(_empty_section)
        )
        
        # Combine results
        total_correct = listening_results["correct"] + reading_results["correct"]
        total_questions = listening_results["total"] + reading_results["total"]
        overall_percentage = (total_correct / total_questions * 100) if total_questions > 0 else 0
        
        # ============ SKILL BREAKDOWN BY QUESTION TYPE ============
        skill_breakdown = []
        
        # Listening breakdown
        for qtype, stats in listening_results.get("by_type", {}).items():
            skill_breakdown.append({
                "skill_id": f"listening_{qtype}",
                "label": f"Listening - {qtype.replace('_', ' ').title()}",
                "correct": stats["correct"],
                "total": stats["total"],
                "tip": get_skill_tip("listening", qtype, stats["correct"] / stats["total"] if stats["total"] > 0 else 0)
            })
        
        # Reading breakdown
        for qtype, stats in reading_results.get("by_type", {}).items():
            skill_breakdown.append({
                "skill_id": f"reading_{qtype}",
                "label": f"Reading - {qtype.replace('_', ' ').title()}",
                "correct": stats["correct"],
                "total": stats["total"],
                "tip": get_skill_tip("reading", qtype, stats["correct"] / stats["total"] if stats["total"] > 0 else 0)
            })
        
        # ============ GENERATE AI TEACHER FEEDBACK ============
        # Find weakest areas
        weak_areas = [s for s in skill_breakdown if s["total"] > 0 and (s["correct"] / s["total"]) < 0.5]
        strong_areas = [s for s in skill_breakdown if s["total"] > 0 and (s["correct"] / s["total"]) >= 0.7]
        
        weak_summary = ", ".join([s["label"] for s in weak_areas[:3]]) if weak_areas else "None identified"
        strong_summary = ", ".join([s["label"] for s in strong_areas[:3]]) if strong_areas else "Keep practicing"
        
        # Build section-aware results lines so we don't tell the LLM about
        # a section the user never took (e.g. reading-only test).
        section_lines = []
        if listening_results['total'] > 0:
            section_lines.append(f"- Listening: {listening_results['correct']}/{listening_results['total']} ({listening_results['percentage']:.1f}%)")
        if reading_results['total'] > 0:
            section_lines.append(f"- Reading: {reading_results['correct']}/{reading_results['total']} ({reading_results['percentage']:.1f}%)")
        if listening_results['total'] > 0 and reading_results['total'] > 0:
            section_lines.append(f"- Overall: {total_correct}/{total_questions} ({overall_percentage:.1f}%)")
        section_block = "\n".join(section_lines) if section_lines else "(no sections completed)"

        skill_label = (
            "Reading" if skill_norm == "reading" else
            "Listening" if skill_norm == "listening" else
            "Reading + Listening"
        )

        feedback_prompt = f"""You are Liz, an experienced IELTS teacher giving warm, specific feedback on a Cambridge IELTS {skill_label} practice test.

TEST RESULTS:
{section_block}

WEAK AREAS: {weak_summary}
STRONG AREAS: {strong_summary}

DETAILED BREAKDOWN:
{json.dumps(skill_breakdown, indent=2)}

Write feedback as Liz speaking directly to the student. Mention only the section(s) above — do NOT reference any section that isn't listed. Reference the specific question types they struggled with by name (T/F/NG, matching headings, MCQ, etc.).

Respond with ONLY a JSON object, no prose, no markdown:
{{
    "short": "2-3 sentences. Open with the actual score in plain words, name the strongest pattern, name the next thing to fix.",
    "detailed": "4-5 sentences. Explain what the wrong-answer pattern shows, give one concrete drill for the weakest question type, end with how to verify the gain."
}}"""

        teacher_feedback: Dict[str, str]
        # Previously we skipped LLM for free reading/listening tests; that
        # produced templated stub text the user complained about. We now
        # always run the LLM when available so the feedback feels real.
        skip_llm_for_rl = False

        # Simple caching based on performance pattern
        cache_key = f"{listening_results['percentage']:.0f}L_{reading_results['percentage']:.0f}R_{len(weak_areas)}W"
        cached_feedback = _feedback_cache.get(cache_key) if len(_feedback_cache) < 100 else None

        if llm_available and not skip_llm_for_rl and not cached_feedback:
            try:
                chat = LlmChat(
                    api_key=EMERGENT_LLM_KEY,
                    session_id=str(uuid.uuid4()),
                    system_message="You are an IELTS teacher. Respond only with valid JSON."
                )
                feedback_response = await chat.send_message(user_message=UserMessage(text=feedback_prompt))
                # Rate limiting: prevent Claude API Usage Policy violations
                await asyncio.sleep(1.0)
                response_text = str(feedback_response)
                if "```json" in response_text:
                    response_text = response_text.split("```json")[1].split("```")[0]
                elif "```" in response_text:
                    response_text = response_text.split("```")[1].split("```")[0]
                teacher_feedback = json.loads(response_text.strip())
                # Cache successful response
                if len(_feedback_cache) < 100:  # Prevent memory bloat
                    _feedback_cache[cache_key] = teacher_feedback
            except Exception as llm_exc:
                # LLM failure shouldn't break the whole evaluation — fall back
                # to a deterministic short summary so the page still renders.
                print(f"Cambridge teacher_feedback LLM failed (non-fatal): {llm_exc}")
                teacher_feedback = _stub_teacher_feedback(
                    listening_results, reading_results, weak_summary, strong_summary,
                )
        elif cached_feedback:
            # Use cached response
            teacher_feedback = cached_feedback
        else:
            # No LLM key configured, skipped for free R/L, or no cache — return deterministic summary
            teacher_feedback = _stub_teacher_feedback(
                listening_results, reading_results, weak_summary, strong_summary,
            )
        
        # ============ RECOMMENDED LESSONS ============
        recommended_lessons = generate_lesson_recommendations(skill_breakdown, "academic")
        
        # ============ CALCULATE BAND SCORE ============
        # Per-section bands use the official Cambridge raw-score tables.
        # Overall band is the average of the bands the candidate actually
        # took (round to nearest 0.5), NOT a percentage average — averaging
        # percentages then re-bucketing produces a different number from
        # averaging the published bands, and IELTS scores the latter.
        track = (test_data.get("track") or "academic").lower()
        listening_band = calculate_band_from_raw(
            listening_results["correct"], listening_results["total"], "listening"
        ) if listening_results["total"] > 0 else 0.0
        reading_band = calculate_band_from_raw(
            reading_results["correct"], reading_results["total"], "reading", track
        ) if reading_results["total"] > 0 else 0.0
        taken_bands = [b for b in (listening_band, reading_band) if b > 0]
        if taken_bands:
            overall_band = round(sum(taken_bands) / len(taken_bands) * 2) / 2
        else:
            overall_band = 0.0
        
        # ============ FASTEST SCORE GAIN ============
        fastest_gain = []
        # Sort skill areas by: most wrong answers that are easiest to fix
        gain_candidates = []
        for s in skill_breakdown:
            if s["total"] > 0:
                wrong = s["total"] - s["correct"]
                accuracy = s["correct"] / s["total"]
                if wrong > 0:
                    gain_candidates.append({
                        "label": s["label"],
                        "skill_id": s["skill_id"],
                        "wrong_count": wrong,
                        "total": s["total"],
                        "accuracy": round(accuracy * 100),
                        "potential_gain": wrong,  # how many more correct answers possible
                        "tip": s.get("tip", "")
                    })
        # Sort by most wrong answers (biggest potential gain)
        gain_candidates.sort(key=lambda x: x["wrong_count"], reverse=True)
        fastest_gain = gain_candidates[:3]
        
        # ============ INTEGRITY WARNINGS ============
        integrity_warnings = []
        # Check for unanswered questions
        listening_answers = answers.get("listening", {})
        reading_answers = answers.get("reading", {})
        
        unanswered_listening = sum(1 for k in answer_key.get("listening", {}) if not listening_answers.get(f"listening_{k}", "").strip() if isinstance(listening_answers.get(f"listening_{k}", ""), str)) if isinstance(listening_answers, dict) else 0
        unanswered_reading = sum(1 for k in answer_key.get("reading", {}) if not reading_answers.get(f"reading_{k}", "").strip() if isinstance(reading_answers.get(f"reading_{k}", ""), str)) if isinstance(reading_answers, dict) else 0
        
        # Count unanswered from flat answers dict (only for sections we
        # actually scored — when skill="reading" we don't want to flag
        # listening as "all unanswered").
        unanswered_l = 0
        unanswered_r = 0
        if do_listening:
            for qnum in answer_key.get("listening", {}):
                key = f"listening_{qnum}"
                val = answers.get(key, "")
                if not val or (isinstance(val, str) and not val.strip()):
                    unanswered_l += 1
        if do_reading:
            for qnum in answer_key.get("reading", {}):
                key = f"reading_{qnum}"
                val = answers.get(key, "")
                if not val or (isinstance(val, str) and not val.strip()):
                    unanswered_r += 1

        if unanswered_l > 0:
            integrity_warnings.append({
                "type": "unanswered",
                "section": "listening",
                "count": unanswered_l,
                "message": f"{unanswered_l} listening question(s) left unanswered. These count as wrong."
            })
        if unanswered_r > 0:
            integrity_warnings.append({
                "type": "unanswered",
                "section": "reading",
                "count": unanswered_r,
                "message": f"{unanswered_r} reading question(s) left unanswered. These count as wrong."
            })
        
        # ============ REASON CODE SUMMARY ============
        all_details = listening_results.get("details", []) + reading_results.get("details", [])
        reason_counts = {}
        for d in all_details:
            rc = d.get("reason_code")
            if rc:
                reason_counts[rc] = reason_counts.get(rc, 0) + 1

        # Persist to test_attempts so Progress page + Liz see this attempt.
        # test_type follows skill filter; section-only mode preserves which
        # half the user actually practiced.
        try:
            from server import persist_attempt
            if skill_norm == "reading":
                _attempt_type = "reading"
                _attempt_band = float(reading_band or 0.0)
            elif skill_norm == "listening":
                _attempt_type = "listening"
                _attempt_band = float(listening_band or 0.0)
            else:
                _attempt_type = "mixed"
                _attempt_band = float(overall_band or 0.0)
            await persist_attempt(
                user_id=user_id,
                test_id=f"{book_id}_{test_id}",
                test_type=_attempt_type,
                band_score=_attempt_band,
                score=float(overall_percentage or 0.0),
                feedback={
                    "source": "cambridge",
                    "skill": skill_norm or "all",
                    "scores": {
                        "listening": {"correct": listening_results["correct"], "total": listening_results["total"], "band": listening_band},
                        "reading": {"correct": reading_results["correct"], "total": reading_results["total"], "band": reading_band},
                        "overall": {"correct": total_correct, "total": total_questions, "band": overall_band},
                    },
                },
            )
        except Exception as _e:
            print(f"persist_attempt skipped (cambridge full-test): {_e}")

        return {
            "success": True,
            "test_id": test_id,
            "book_id": book_id,
            "scores": {
                "listening": {
                    "correct": listening_results["correct"],
                    "total": listening_results["total"],
                    "percentage": listening_results["percentage"],
                    "band": listening_band
                },
                "reading": {
                    "correct": reading_results["correct"],
                    "total": reading_results["total"],
                    "percentage": reading_results["percentage"],
                    "band": reading_band
                },
                "overall": {
                    "correct": total_correct,
                    "total": total_questions,
                    "percentage": overall_percentage,
                    "band": overall_band
                }
            },
            "skill_breakdown": skill_breakdown,
            "teacher_feedback": teacher_feedback,
            "recommended_lessons": recommended_lessons,
            "question_results": {
                "listening": listening_results.get("details", []),
                "reading": reading_results.get("details", [])
            },
            "fastest_gain": fastest_gain,
            "integrity_warnings": integrity_warnings,
            "reason_summary": reason_counts,
            "root_cause_analysis": build_root_cause_analysis(
                reason_counts,
                {"listening": listening_results.get("details", []), "reading": reading_results.get("details", [])}
            ),
            "study_plan": build_study_plan(
                overall_band=overall_band,
                skill_breakdown=skill_breakdown,
                fastest_gain=fastest_gain,
                recommended_lessons=recommended_lessons,
                reason_summary=reason_counts,
                question_results={"listening": listening_results.get("details", []), "reading": reading_results.get("details", [])},
            ),
        }
        
    except Exception as e:
        print(f"Full test evaluation error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


def extract_answer_keys_from_test(test_data: Dict) -> Dict:
    """Extract answer keys from test questions"""
    answer_keys = {
        "listening": {},
        "reading": {}
    }
    
    sections = test_data.get("sections", {})
    
    # Extract listening answers
    listening = sections.get("listening", {})
    for part in listening.get("parts", []):
        for q in part.get("questions", []):
            qnum = str(q.get("number", ""))
            qtype = q.get("type", "")
            
            # Handle matching questions with separate answers dict
            if qtype == "matching" and "answers" in q:
                for qn, ans in q.get("answers", {}).items():
                    answer_keys["listening"][str(qn)] = ans
            # Handle compound question numbers like "14-15"
            elif "-" in qnum:
                answer = q.get("answer", [])
                answer_keys["listening"][qnum] = answer if isinstance(answer, list) else [answer]
            else:
                if q.get("answer"):
                    answer_keys["listening"][qnum] = q.get("answer")
    
    # Extract reading answers
    reading = sections.get("reading", {})
    for passage in reading.get("passages", []):
        for q in passage.get("questions", []):
            qtype = q.get("type", "")
            qnum = str(q.get("number", ""))
            
            # Handle questions with "items" array (sentence_completion, table_completion, matching_*, summary_completion)
            if "items" in q:
                for item in q.get("items", []):
                    inum = str(item.get("number", ""))
                    if item.get("answer"):
                        answer_keys["reading"][inum] = item.get("answer")
            # Handle true_false_not_given with statements
            elif qtype in ["true_false_not_given", "true_false_ng", "yes_no_ng"] and "statements" in q:
                for stmt in q.get("statements", []):
                    stnum = str(stmt.get("number", ""))
                    if stmt.get("answer"):
                        answer_keys["reading"][stnum] = stmt.get("answer")
            # Handle table_completion with rows (legacy format)
            elif qtype == "table_completion" and "rows" in q:
                for row in q.get("rows", []):
                    for cell in row.get("cells", []):
                        if isinstance(cell, dict) and cell.get("number"):
                            cnum = str(cell.get("number"))
                            if cell.get("answer"):
                                answer_keys["reading"][cnum] = cell.get("answer")
            # Handle sentence_completion with sentences (legacy format)
            elif "sentences" in q:
                for sent in q.get("sentences", []):
                    snum = str(sent.get("number", ""))
                    if sent.get("answer"):
                        answer_keys["reading"][snum] = sent.get("answer")
            # Handle compound question numbers
            elif "-" in qnum:
                answer = q.get("answer", [])
                if answer:
                    answer_keys["reading"][qnum] = answer if isinstance(answer, list) else [answer]
            # Standard question with direct answer
            else:
                if q.get("answer"):
                    answer_keys["reading"][qnum] = q.get("answer")
    
    return answer_keys


def _get_passage_texts(section_data: dict) -> dict:
    """Build mapping from passage_number to passage_text for reading sections"""
    texts = {}
    for passage in section_data.get("passages", []):
        pnum = passage.get("passage_number", 1)
        texts[pnum] = passage.get("passage_text", "") or passage.get("text", "") or ""
    return texts


def _stub_teacher_feedback(
    listening_results: Dict,
    reading_results: Dict,
    weak_summary: str,
    strong_summary: str,
) -> Dict[str, str]:
    """Deterministic teacher_feedback stub used when the LLM key is missing
    or the call fails. Same shape as the LLM JSON response so the frontend
    template renders unchanged. Section-aware: only mention sections that
    were actually taken (total > 0)."""
    l_total = listening_results.get("total", 0) or 0
    r_total = reading_results.get("total", 0) or 0
    l_correct = listening_results.get("correct", 0) or 0
    r_correct = reading_results.get("correct", 0) or 0
    l_pct = listening_results.get("percentage", 0)
    r_pct = reading_results.get("percentage", 0)

    # Build section-aware score line — skip sections with 0 questions.
    parts = []
    if l_total > 0:
        parts.append(f"Listening {l_correct}/{l_total} ({l_pct:.0f}%)")
    if r_total > 0:
        parts.append(f"Reading {r_correct}/{r_total} ({r_pct:.0f}%)")
    score_line = " and ".join(parts) if parts else "No sections completed"

    # Pick a tone based on the dominant section's accuracy.
    if r_total > 0 and l_total == 0:
        primary_pct = r_pct
        primary_name = "reading"
    elif l_total > 0 and r_total == 0:
        primary_pct = l_pct
        primary_name = "listening"
    else:
        primary_pct = (l_pct + r_pct) / 2 if (l_total or r_total) else 0
        primary_name = "test"

    if primary_pct >= 75:
        opener = f"Strong {primary_name} performance — you scored {score_line}."
    elif primary_pct >= 55:
        opener = f"Decent {primary_name} run at {score_line} — there's clear room to push higher."
    elif primary_pct > 0:
        opener = f"This {primary_name} attempt landed at {score_line} — let's pinpoint what tripped you up."
    else:
        opener = f"Your {primary_name} result: {score_line}."

    strong_clause = f" You handled {strong_summary} well." if strong_summary and strong_summary != "Keep practicing" else ""
    weak_clause = f" The biggest gain will come from working on {weak_summary}." if weak_summary and weak_summary != "None identified" else ""
    short = f"{opener}{strong_clause}{weak_clause}".strip()

    # Pull the single weakest skill name (first in the comma list) for a
    # tighter, less list-y sentence. The stub is intentionally short — the
    # rich drilldown + Skill Breakdown panel already shows the numbers.
    primary_weak = (weak_summary.split(",")[0].strip() if weak_summary and weak_summary != "None identified" else "")
    if primary_weak:
        detailed = (
            f"The pattern in your wrong answers points to {primary_weak} as the single biggest leak. "
            f"Open one wrong item at a time, read the evidence sentence, and decide whether you missed a paraphrase, a synonym, or a number/word-form clue. "
            f"Once you can name the cause for each one, retry a fresh passage and you should see the score move."
        )
    else:
        detailed = (
            "Open each wrong item one at a time, read the evidence sentence, and decide whether you missed a paraphrase, a synonym, or a word-form clue. "
            "Once you can name the cause for each one, a fresh passage should show the score move."
        )
    return {"short": short, "detailed": detailed}


def _build_multi_selection_groups(section: str, section_data: Dict, correct_answers: Dict) -> tuple:
    """Pre-scan a section's questions for multi_selection groups (IELTS
    "Choose TWO/THREE" style). Returns (group_for_qnum, multi_groups) where:

      group_for_qnum: maps a question number string → group_id
      multi_groups:   maps group_id → {user_key, correct_set, qnums}

    Why this exists
    ---------------
    The frontend stores ALL selections in a multi_selection group under ONE
    key (the first item's number, e.g. answers["reading_23"] = ["C","D"]).
    Without this pre-pass the per-question loop would:
      - score Q23 against just "C" → False (list vs scalar branch)
      - score Q24 against just "D" → empty (no answers["reading_24"])
    losing both points. The pre-pass lets us treat the whole group as a
    single set-equality check (mirrors task #140 fix in listening_qb /
    reading_qb), so a correct paired selection scores both items correct.
    """
    group_for_qnum: Dict[str, str] = {}
    multi_groups: Dict[str, Dict[str, Any]] = {}

    multi_types = ("multiple_selection", "multi_mcq", "select_two", "select_three")

    def _norm(x: Any) -> str:
        return str(x).strip().lower().replace(".", "").replace(",", "")

    def _add_to_set(target: set, value: Any) -> None:
        if isinstance(value, list):
            for v in value:
                if v:
                    target.add(_norm(v))
        elif value:
            target.add(_norm(value))

    if section == "reading":
        question_iter = (
            q
            for passage in section_data.get("passages", [])
            for q in passage.get("questions", [])
        )
    else:  # listening
        question_iter = (
            q
            for part in section_data.get("parts", [])
            for q in part.get("questions", [])
        )

    for q in question_iter:
        if q.get("type") not in multi_types:
            continue
        items = q.get("items") or []
        qnum = str(q.get("number", ""))
        # Collect this group's question numbers from items[] or expand a
        # compound number like "14-15" used by listening multi-MCQs.
        if items:
            qnums = [str(it.get("number")) for it in items if it.get("number") is not None]
        elif "-" in qnum:
            try:
                start, end = qnum.split("-")
                qnums = [str(n) for n in range(int(start), int(end) + 1)]
            except ValueError:
                qnums = [qnum]
        else:
            qnums = [qnum]
        if len(qnums) < 2:
            continue
        group_id = ",".join(qnums)
        user_key = f"{section}_{qnums[0]}"
        cset: set = set()
        # Pull correct letters from per-item entries AND from a compound key
        # so we cover both reading-style ("23":"C","24":"D") and listening-
        # style ("14-15":["A","B"]) answer-key shapes.
        compound = correct_answers.get(qnum) or correct_answers.get(group_id)
        _add_to_set(cset, compound)
        for qn in qnums:
            _add_to_set(cset, correct_answers.get(qn))
        multi_groups[group_id] = {
            "user_key": user_key,
            "correct_set": cset,
            "qnums": qnums,
        }
        for qn in qnums:
            group_for_qnum[qn] = group_id
        if "-" in qnum:
            group_for_qnum[qnum] = group_id

    return group_for_qnum, multi_groups


def calculate_section_results(section: str, user_answers: Dict, correct_answers: Dict, test_data: Dict) -> Dict:
    """Calculate detailed results for a section"""
    results = {
        "correct": 0,
        "total": 0,
        "percentage": 0,
        "by_type": {},
        "details": []
    }

    if not correct_answers:
        return results

    # Get question metadata from test data
    question_metadata = {}
    section_data = test_data.get("sections", {}).get(section, {})

    # Pre-scan for multi_selection groups so we can score them as a single
    # set-equality unit instead of two independent comparisons (which loses
    # both items when the frontend stores both selections under one key).
    group_for_qnum, multi_groups = _build_multi_selection_groups(
        section, section_data, correct_answers
    )
    
    if section == "listening":
        for part in section_data.get("parts", []):
            part_num = part.get("part_number", 1)
            for q in part.get("questions", []):
                qtype = q.get("type", "unknown")
                qnum = str(q.get("number", ""))
                
                # Handle grouped questions with items
                if "items" in q:
                    for item in q.get("items", []):
                        inum = str(item.get("number", ""))
                        if inum:
                            question_metadata[inum] = {"type": qtype, "text": item.get("question_text", ""), "part": part_num}
                # Handle matching with answers dict
                elif qtype == "matching" and "answers" in q:
                    for qn in q.get("answers", {}):
                        question_metadata[str(qn)] = {"type": qtype, "text": q.get("question_text", ""), "part": part_num}
                # Handle individual questions
                elif qnum and "-" not in qnum:
                    question_metadata[qnum] = {"type": qtype, "text": q.get("question_text", ""), "part": part_num}
                # Handle range questions like "11-12"
                elif "-" in qnum:
                    try:
                        start, end = qnum.split("-")
                        for n in range(int(start), int(end) + 1):
                            question_metadata[str(n)] = {"type": qtype, "text": q.get("question_text", ""), "part": part_num}
                        # Also store compound key for answer_key matching
                        question_metadata[qnum] = {"type": qtype, "text": q.get("question_text", ""), "part": part_num}
                    except ValueError:
                        question_metadata[qnum] = {"type": qtype, "text": q.get("question_text", ""), "part": part_num}
    
    elif section == "reading":
        for passage in section_data.get("passages", []):
            passage_num = passage.get("passage_number", 1)
            for q in passage.get("questions", []):
                qtype = q.get("type", "unknown")
                qnum = str(q.get("number", ""))

                # Handle questions with items array (matching / section_matching).
                # Cambridge JSON stores the prompt under "item"; older content
                # used "question_text"; we keep "text" as a final fallback.
                if "items" in q:
                    for item in q.get("items", []):
                        inum = str(item.get("number", ""))
                        if inum:
                            text = (
                                item.get("item")
                                or item.get("question_text")
                                or item.get("text")
                                or ""
                            )
                            question_metadata[inum] = {"type": qtype, "text": text, "passage": passage_num}
                # Handle TFNG/YNNG with statements (Cambridge uses "statement")
                elif "statements" in q:
                    for stmt in q.get("statements", []):
                        snum = str(stmt.get("number", ""))
                        if snum:
                            text = stmt.get("statement") or stmt.get("text") or ""
                            question_metadata[snum] = {"type": qtype, "text": text, "passage": passage_num}
                # Sentence-completion with per-sentence text
                elif "sentences" in q:
                    for sent in q.get("sentences", []):
                        snum = str(sent.get("number", ""))
                        if snum:
                            text = sent.get("text") or sent.get("sentence") or ""
                            question_metadata[snum] = {"type": qtype, "text": text, "passage": passage_num}
                # Nested questions array (e.g. multiple_choice 36-40)
                elif "questions" in q and isinstance(q.get("questions"), list):
                    for sub in q["questions"]:
                        snum = str(sub.get("number", ""))
                        if snum:
                            text = sub.get("question") or sub.get("question_text") or sub.get("text") or ""
                            question_metadata[snum] = {"type": qtype, "text": text, "passage": passage_num}
                # Handle table_completion with rows
                elif "rows" in q:
                    for row in q.get("rows", []):
                        for cell in row.get("cells", []):
                            if isinstance(cell, dict) and cell.get("number"):
                                question_metadata[str(cell["number"])] = {"type": qtype, "text": "", "passage": passage_num}
                # Handle individual or range questions
                elif qnum and "-" not in qnum:
                    md = {"type": qtype, "text": q.get("question_text", q.get("question", "")), "passage": passage_num}
                    if isinstance(q.get("options"), list) and q.get("options"):
                        md["options"] = [str(o) for o in q["options"]]
                    question_metadata[qnum] = md
                elif "-" in qnum:
                    try:
                        start, end = qnum.split("-")
                        # For summary_completion, surface the summary block so
                        # users see the surrounding context for each gap.
                        parent_text = q.get("question_text") or q.get("question", "")
                        if not parent_text and isinstance(q.get("summary"), dict):
                            parent_text = q["summary"].get("text", "")
                        opts = [str(o) for o in q["options"]] if isinstance(q.get("options"), list) and q.get("options") else None
                        for n in range(int(start), int(end) + 1):
                            md = {"type": qtype, "text": parent_text, "passage": passage_num}
                            if opts:
                                md["options"] = opts
                            question_metadata[str(n)] = md
                        md_compound = {"type": qtype, "text": parent_text, "passage": passage_num}
                        if opts:
                            md_compound["options"] = opts
                        question_metadata[qnum] = md_compound
                    except ValueError:
                        question_metadata[qnum] = {"type": qtype, "text": q.get("question_text", ""), "passage": passage_num}
    
    # Track which compound multi-MCQ keys we've already expanded so we
    # don't emit duplicate per-sub-id rows when both the compound key
    # AND per-sub keys are present in correct_answers.
    _expanded_groups: set = set()

    # Evaluate each answer
    for qnum, correct_ans in correct_answers.items():
        qnum_str = str(qnum)
        group_id = group_for_qnum.get(qnum_str)
        if group_id is not None:
            # Multi-MCQ group: per-item SET-MEMBERSHIP scoring (Aga
            # 2026-05-02). Each correct option = 1 mark IF user picked
            # that letter — regardless of click order. Replaces the old
            # all-or-nothing rule: clicking [D,E] vs correct [B,E] now
            # yields Q26 ✓ (E matched) + Q25 ✗ (B missed) instead of 0/2.
            grp = multi_groups[group_id]
            raw_user = user_answers.get(grp["user_key"], [])
            if isinstance(raw_user, list):
                user_list = [x for x in raw_user if x not in (None, "")]
            elif raw_user:
                user_list = [raw_user]
            else:
                user_list = []
            user_set = {str(x).strip().lower().replace(".", "").replace(",", "") for x in user_list}

            # Compound key like "25-26" with list answer ["B","E"] — emit
            # ONE row per sub-id, each scored on its own letter.
            if isinstance(correct_ans, list) and ("-" in qnum_str or "," in qnum_str):
                if group_id in _expanded_groups:
                    continue
                _expanded_groups.add(group_id)
                try:
                    sub_ids = [str(n) for n in (
                        range(int(qnum_str.split("-")[0]), int(qnum_str.split("-")[1]) + 1)
                        if "-" in qnum_str else
                        [int(x.strip()) for x in qnum_str.split(",")]
                    )]
                except (ValueError, IndexError):
                    sub_ids = [qnum_str]
                user_display = ", ".join(str(x).upper() for x in user_list) if user_list else "-"
                for idx, sub_id in enumerate(sub_ids):
                    sub_correct_letter = correct_ans[idx] if idx < len(correct_ans) else ""
                    sub_correct_norm = str(sub_correct_letter).strip().lower().replace(".", "").replace(",", "")
                    is_correct_sub = bool(sub_correct_norm) and sub_correct_norm in user_set

                    sub_meta = question_metadata.get(sub_id) or question_metadata.get(qnum_str, {})
                    sub_qtype = sub_meta.get("type", "unknown")

                    results["total"] += 1
                    if is_correct_sub:
                        results["correct"] += 1
                    if sub_qtype not in results["by_type"]:
                        results["by_type"][sub_qtype] = {"correct": 0, "total": 0}
                    results["by_type"][sub_qtype]["total"] += 1
                    if is_correct_sub:
                        results["by_type"][sub_qtype]["correct"] += 1

                    sub_reason = None
                    if not is_correct_sub:
                        sub_reason = classify_reason_code(user_list, sub_correct_letter, sub_qtype)
                    sub_evidence = ""
                    if section == "reading":
                        passage_num = sub_meta.get("passage", 1)
                        passage_texts = _get_passage_texts(section_data)
                        p_text = passage_texts.get(passage_num, "")
                        if p_text:
                            search_input = _resolve_mcq_search_input(
                                sub_correct_letter, sub_meta.get("options"),
                            ) if "multiple" in (sub_qtype or "") else sub_correct_letter
                            sub_evidence = extract_evidence_text(search_input, p_text)

                    results["details"].append({
                        "question_id": int(sub_id) if str(sub_id).isdigit() else sub_id,
                        "question_type": sub_qtype,
                        "question_text": sub_meta.get("text", ""),
                        "user_answer": user_display,
                        "correct_answer": str(sub_correct_letter).upper(),
                        "is_correct": is_correct_sub,
                        "reason_code": sub_reason.get("code") if sub_reason else None,
                        "reason_label": sub_reason.get("label") if sub_reason else None,
                        "evidence_text": sub_evidence if sub_evidence else None,
                        "explanation": generate_explanation(
                            sub_qtype, sub_correct_letter, is_correct_sub,
                            user_answer=user_list,
                            question_text=sub_meta.get("text", ""),
                            reason_code=sub_reason.get("code") if sub_reason else None,
                        ),
                        "skill_tip": get_skill_tip(
                            section, sub_qtype, 1 if is_correct_sub else 0,
                            question_text=sub_meta.get("text", ""),
                            correct_ans=sub_correct_letter,
                            user_answer=user_list,
                            reason_code=sub_reason.get("code") if sub_reason else None,
                        ),
                    })
                continue  # compound-key branch fully emitted its rows

            # Per-qnum entry inside a multi-MCQ group. Two sub-shapes:
            #   (a) Scalar: {"23":"C", "24":"D"} → correct_ans is "C" / "D"
            #   (b) Mirrored list: {"23":["C","D"], "24":["C","D"]} → list
            # For (b), pick THIS qnum's expected letter via position in the
            # group's ordered qnums (Q23 → idx 0 → "C", Q24 → idx 1 → "D").
            qnums_list = grp.get("qnums") or []
            if isinstance(correct_ans, list):
                try:
                    pos = qnums_list.index(qnum_str)
                except ValueError:
                    pos = 0
                this_letter = correct_ans[pos] if 0 <= pos < len(correct_ans) else ""
            else:
                this_letter = correct_ans
            this_correct_norm = str(this_letter).strip().lower().replace(".", "").replace(",", "") if this_letter else ""
            is_correct = bool(this_correct_norm) and this_correct_norm in user_set
            user_ans = list(user_list) if user_list else ""
            # Override iteration var so display_correct shows just THIS row's
            # letter (e.g. "D") not the combined list ("C, D").
            correct_ans = str(this_letter).upper() if this_letter else correct_ans
        else:
            user_key = f"{section}_{qnum}"
            user_ans = user_answers.get(user_key, "")
            is_correct = compare_answers(user_ans, correct_ans)
        results["total"] += 1
        if is_correct:
            results["correct"] += 1
        
        # Get question type
        meta = question_metadata.get(str(qnum), {})
        qtype = meta.get("type", "unknown")
        
        # Update by_type stats
        if qtype not in results["by_type"]:
            results["by_type"][qtype] = {"correct": 0, "total": 0}
        results["by_type"][qtype]["total"] += 1
        if is_correct:
            results["by_type"][qtype]["correct"] += 1
        
        # Add to details
        # Safely get correct answer for display
        if isinstance(correct_ans, list) and len(correct_ans) > 0:
            display_correct = ", ".join(str(a) for a in correct_ans)
        elif isinstance(correct_ans, str):
            display_correct = correct_ans
        else:
            display_correct = str(correct_ans) if correct_ans else "-"
        
        # Reason code for wrong answers
        reason = None
        if not is_correct:
            reason = classify_reason_code(user_ans, correct_ans, qtype)
        
        # Evidence: extract passage excerpt for ALL reading questions (not
        # just wrong ones). Aga: "evidence in passage olmali butun sorular
        # icin reading kisminda" — so users can see the textual basis for
        # the correct answer regardless of whether they got it right.
        evidence_text = ""
        if section == "reading":
            passage_num = meta.get("passage", 1)
            passage_texts = _get_passage_texts(section_data)
            p_text = passage_texts.get(passage_num, "")
            if p_text:
                search_input = _resolve_mcq_search_input(
                    correct_ans, meta.get("options"),
                ) if "multiple" in (qtype or "") else correct_ans
                evidence_text = extract_evidence_text(search_input, p_text)
            
        results["details"].append({
            "question_id": qnum,
            "question_type": qtype,
            "question_text": meta.get("text", ""),
            "user_answer": user_ans if user_ans else "-",
            "correct_answer": display_correct,
            "is_correct": is_correct,
            "reason_code": reason.get("code") if reason else None,
            "reason_label": reason.get("label") if reason else None,
            "evidence_text": evidence_text if evidence_text else None,
            "explanation": generate_explanation(
                qtype, correct_ans, is_correct,
                user_answer=user_ans,
                question_text=meta.get("text", ""),
                reason_code=reason.get("code") if reason else None,
            ),
            "skill_tip": get_skill_tip(
                section, qtype, 1 if is_correct else 0,
                question_text=meta.get("text", ""),
                correct_ans=correct_ans,
                user_answer=user_ans,
                reason_code=reason.get("code") if reason else None,
            ),
        })
    
    results["percentage"] = (results["correct"] / results["total"] * 100) if results["total"] > 0 else 0
    return results


def classify_reason_code(user_ans, correct_ans, qtype: str) -> dict:
    """Assign a high-signal reason code for an incorrect answer"""
    
    REASON_LABELS = {
        "UNANSWERED": "No answer provided",
        "TFNG_CONFUSION": "T/F/NG mix-up",
        "YNNG_CONFUSION": "Y/N/NG mix-up",
        "SPELLING_ERROR": "Spelling mistake",
        "DISTRACTOR_TRAP": "Distractor selected",
        "NEAR_MISS": "Close but incorrect",
        "WRONG_ANSWER": "Incorrect answer",
    }
    
    def normalize(s):
        return str(s).lower().strip().replace(".", "").replace(",", "")
    
    # 1. Unanswered
    if not user_ans or (isinstance(user_ans, str) and not user_ans.strip()):
        return {"code": "UNANSWERED", "label": REASON_LABELS["UNANSWERED"]}
    
    user_norm = normalize(user_ans)
    
    # 2. TFNG confusion
    if qtype in ("true_false_ng", "true_false_not_given"):
        tfng_set = {"true", "false", "not given"}
        if user_norm in tfng_set:
            return {"code": "TFNG_CONFUSION", "label": REASON_LABELS["TFNG_CONFUSION"]}
    
    # 3. YNNG confusion
    if qtype in ("yes_no_ng",):
        ynng_set = {"yes", "no", "not given"}
        if user_norm in ynng_set:
            return {"code": "YNNG_CONFUSION", "label": REASON_LABELS["YNNG_CONFUSION"]}
    
    # 4. Spelling error — check Levenshtein-like similarity
    correct_norms = []
    if isinstance(correct_ans, list):
        correct_norms = [normalize(a) for a in correct_ans]
    elif isinstance(correct_ans, str):
        correct_norms = [normalize(a) for a in correct_ans.split("/")]
    
    for cn in correct_norms:
        if cn and user_norm and len(user_norm) > 2 and len(cn) > 2:
            # Simple ratio: shared chars / max length
            common = sum(1 for a, b in zip(user_norm, cn) if a == b)
            ratio = common / max(len(user_norm), len(cn))
            if ratio >= 0.7 and ratio < 1.0:
                return {"code": "SPELLING_ERROR", "label": REASON_LABELS["SPELLING_ERROR"]}
    
    # 5. Distractor trap — for multiple choice
    if qtype in ("multiple_choice", "multiple_selection"):
        return {"code": "DISTRACTOR_TRAP", "label": REASON_LABELS["DISTRACTOR_TRAP"]}
    
    # 6. Near miss — user wrote something that shares a root with correct answer
    for cn in correct_norms:
        if cn and user_norm and len(cn) > 3 and len(user_norm) > 3:
            if cn[:3] == user_norm[:3] or cn in user_norm or user_norm in cn:
                return {"code": "NEAR_MISS", "label": REASON_LABELS["NEAR_MISS"]}
    
    return {"code": "WRONG_ANSWER", "label": REASON_LABELS["WRONG_ANSWER"]}


def _find_letter_paragraph(passage_text: str, letter: str) -> str:
    """Cambridge passages for matching/section_matching use letter-prefixed
    paragraphs ("A: Stadiums...", "B: ..."). Return that paragraph's body
    trimmed to a sensible excerpt length so it fits the evidence card."""
    if not passage_text or not letter:
        return ""
    target = letter.strip().upper()
    if len(target) != 1 or not target.isalpha():
        return ""
    for para in re.split(r"\n\s*\n", passage_text):
        m = re.match(r"^\s*([A-Z])\s*[:.\-)]\s*(.+)$", para, re.DOTALL)
        if m and m.group(1).upper() == target:
            body = m.group(2).strip()
            if len(body) > 320:
                cut = body.rfind(". ", 0, 320)
                if cut > 120:
                    body = body[: cut + 1]
                else:
                    body = body[:320].rstrip() + "…"
            return body
    return ""


def _resolve_mcq_search_input(correct_ans, options):
    """For MCQ questions whose correct answer is just an option LETTER,
    return the option's TEXT so extract_evidence_text can locate it in
    the passage. Returns the original `correct_ans` when options aren't
    available or the answer doesn't look like a single-letter pick.
    """
    if not options or not isinstance(options, list):
        return correct_ans
    label_re = re.compile(r"^\s*([A-Za-z])\s*[:.\-)]\s*(.+)$")

    def _text_for(letter: str) -> str:
        L = str(letter).strip().upper()
        if not L:
            return ""
        # Match "B: text", "B. text", "B) text", etc.
        for o in options:
            s = str(o).strip()
            m = label_re.match(s)
            if m and m.group(1).upper() == L:
                return m.group(2).strip()
        # Fallback: positional (A=index 0, B=1, …)
        idx = ord(L) - ord("A")
        if 0 <= idx < len(options):
            s = str(options[idx]).strip()
            m = label_re.match(s)
            return (m.group(2).strip() if m else s)
        return ""

    if isinstance(correct_ans, list):
        expanded = [t for t in (_text_for(c) for c in correct_ans) if t]
        return expanded if expanded else correct_ans
    if isinstance(correct_ans, str) and len(correct_ans.strip()) == 1 and correct_ans.strip().isalpha():
        t = _text_for(correct_ans)
        return t if t else correct_ans
    return correct_ans


def extract_evidence_text(correct_ans, passage_text: str) -> str:
    """Return a passage excerpt that justifies `correct_ans`.

    Strategy:
      1. Single-letter answer + letter-prefixed passage paragraphs → return
         that paragraph (matching / section_matching / summary_completion).
      2. Otherwise locate the correct phrase verbatim and return ±80 chars.
    """
    if not passage_text or not correct_ans:
        return ""

    # Build search terms (handling list answers and "/" alternation).
    search_terms = []
    if isinstance(correct_ans, list):
        search_terms = [str(a) for a in correct_ans]
    elif isinstance(correct_ans, str):
        search_terms = [a.strip() for a in correct_ans.split("/")]

    # Letter-paragraph anchor — only meaningful for single-string answers
    # (matching / section_matching / summary_completion). Multi-MCQ answers
    # are letter LISTS but those letters are MCQ option labels, not passage
    # paragraph labels — anchoring on paragraph "C" is misleading there.
    if isinstance(correct_ans, str):
        t = correct_ans.strip()
        candidate = t
        m = _LABEL_PREFIX_RE.match(t)
        if m:
            candidate = m.group(1)
        if len(candidate) == 1 and candidate.isalpha():
            para = _find_letter_paragraph(passage_text, candidate)
            if para:
                return para

    # Verbatim phrase fallback.
    text_lower = passage_text.lower()
    for term in search_terms:
        term_lower = term.lower().strip()
        if not term_lower or len(term_lower) < 2:
            continue
        # Skip pure single letters here — already handled above.
        if len(term_lower) == 1 and term_lower.isalpha():
            continue
        idx = text_lower.find(term_lower)
        if idx >= 0:
            start = max(0, idx - 80)
            end = min(len(passage_text), idx + len(term_lower) + 80)
            excerpt = passage_text[start:end].strip()
            if start > 0:
                space_idx = excerpt.find(" ")
                if space_idx > 0 and space_idx < 15:
                    excerpt = excerpt[space_idx + 1:]
            if end < len(passage_text):
                space_idx = excerpt.rfind(" ")
                if space_idx > len(excerpt) - 15:
                    excerpt = excerpt[:space_idx]
            return excerpt
    return ""


_LABEL_PREFIX_RE = re.compile(r"^\s*([A-Za-z]{1,3})\s*[:.\-)]\s*(.+)$")


def _normalize_answer(s) -> str:
    return str(s).lower().strip().replace(".", "").replace(",", "")


def _label_variants(s) -> list:
    """Return [original_normalized, label_only_if_present] so a frontend value
    like "H: strategic alliance" matches answer-key entries like "H".
    Used by both compare_answers and classify_reason_code so the two stay in
    sync (otherwise a labelled match still ranked as DISTRACTOR_TRAP)."""
    norm = _normalize_answer(s)
    out = [norm]
    m = _LABEL_PREFIX_RE.match(str(s))
    if m:
        label_only = _normalize_answer(m.group(1))
        if label_only and label_only != norm:
            out.append(label_only)
    return out


def compare_answers(user_ans, correct_ans) -> bool:
    """Compare user answer with correct answer(s).

    Tolerances:
      - case / trailing punctuation (".", ",")
      - "/" alternation in correct answers ("hot/warm")
      - list user_ans vs list correct_ans → set equality (multi-MCQ)
      - label-prefix forms: "H: strategic alliance" matches "H" in either
        direction (frontend dropdowns store the full option string while
        answer keys store only the label letter for matching qtypes).
    """
    if not user_ans or not correct_ans:
        return False

    # Multi-MCQ: list-vs-list set equality.
    if isinstance(user_ans, list):
        if isinstance(correct_ans, list):
            user_set = {_normalize_answer(a) for a in user_ans}
            correct_set = {_normalize_answer(a) for a in correct_ans}
            return user_set == correct_set
        return False

    user_variants = _label_variants(user_ans)

    # Build the candidate correct-answer pool (handles list + "/" alternation).
    if isinstance(correct_ans, list):
        correct_pool = list(correct_ans)
    elif "/" in str(correct_ans):
        correct_pool = str(correct_ans).split("/")
    else:
        correct_pool = [correct_ans]

    correct_variants: list = []
    for c in correct_pool:
        correct_variants.extend(_label_variants(c))

    # Match if any normalized form intersects.
    return any(uv in correct_variants for uv in user_variants)


def calculate_band_from_percentage(percentage: float, section: str = "reading", track: str = "academic") -> float:
    """Backwards-compatible shim. Routes through the official IELTS raw-score
    tables in services.ielts_band_tables instead of equal-width percentage
    buckets — the old buckets were ~one full band off in the 22-29/40 range
    (26/40 Academic Reading was emitting 7.0 instead of the official 6.0).
    Prefer `calculate_band_from_raw(correct, total, section, track)` at new
    call sites."""
    from services.ielts_band_tables import band_for_listening_pct, band_for_reading_pct
    if section == "listening":
        return band_for_listening_pct(percentage)
    return band_for_reading_pct(percentage, track)


def calculate_band_from_raw(correct: int, total: int, section: str = "reading", track: str = "academic") -> float:
    """Preferred entry point for IELTS band conversion. Uses the official
    Cambridge raw-score → band tables. `section` is "reading" or "listening";
    `track` is "academic" or "general" (only consulted for reading)."""
    from services.ielts_band_tables import band_for_listening, band_for_reading
    if section == "listening":
        return band_for_listening(correct, total)
    return band_for_reading(correct, total, track)


def _format_answer_text(ans) -> str:
    """Render a possibly list/None/empty answer as a readable string.
    Returns empty string for blanks so callers can distinguish "no answer"
    from "answer was the empty string", which matters for the explanation
    contrast templates ("you answered X" vs "you left this blank")."""
    if ans is None or ans == "" or ans == []:
        return ""
    if isinstance(ans, list):
        parts = [str(a) for a in ans if a not in (None, "")]
        return ", ".join(parts)
    return str(ans)


def get_skill_tip(
    section: str,
    qtype: str,
    accuracy: float,
    *,
    question_text: str = "",
    correct_ans=None,
    user_answer=None,
    reason_code: str = None,
) -> str:
    """Section + qtype tip, optionally enriched with the user's actual
    mistake. Legacy callers (skill_breakdown aggregates) pass only the
    first three positionals and get a type-level tip; per-question callers
    pass keyword args for a contextual, mistake-aware tip that names the
    specific reason code or the correct answer."""

    qt = (qtype or "").lower()
    is_correct = accuracy >= 0.7
    correct_text = _format_answer_text(correct_ans)
    user_text = _format_answer_text(user_answer)

    # ---- Reason-code aware tips for wrong answers (most specific) ----
    rc = (reason_code or "").upper()
    if not is_correct and rc:
        if rc == "TFNG_CONFUSION":
            upper = correct_text.upper()
            if upper == "NOT GIVEN":
                return ("NOT GIVEN means the passage doesn't address the claim either way. If you can't find a sentence "
                        "that confirms or contradicts it, the answer is NOT GIVEN — don't infer.")
            if upper == "FALSE":
                return ("FALSE means the passage actively contradicts the statement. NOT GIVEN means the passage is "
                        "silent. Re-read: did the text say the opposite, or just not mention it?")
            return ("Watch the line between TRUE / FALSE / NOT GIVEN. The passage must directly support (TRUE) or "
                    "contradict (FALSE) — anything else is NOT GIVEN.")
        if rc == "YNNG_CONFUSION":
            return ("Yes/No tests the writer's stance, not facts. NOT GIVEN means the writer doesn't express an "
                    "opinion either way — don't infer their view from neutral statements.")
        if rc == "SPELLING_ERROR":
            return (f"Your spelling differed from the passage. The correct form is '{correct_text}' — copy it "
                    f"exactly, even if it looks unusual. IELTS marks misspellings wrong.")
        if rc == "DISTRACTOR_TRAP":
            return ("You picked an option that shares vocabulary with the passage but not its meaning. Read each "
                    "option against the question stem before deciding — distractors are designed to look right.")
        if rc == "NEAR_MISS":
            return (f"You were close — your answer shared a root with '{correct_text}'. Check the exact word form "
                    f"(singular/plural, verb tense, derivation) and copy from the passage exactly.")
        if rc == "UNANSWERED":
            return ("You left this blank. Even a guess is better than blank in IELTS — never skip an answer, "
                    "especially on T/F/NG and multiple-choice where you have a 33–50% chance of being right.")

    # ---- Per-qtype tips (legacy shape, no extra context) ----
    base_tips = {
        "listening": {
            "note_completion": "Listen for keywords that signal the answer is coming. Write exactly what you hear — don't change the form of words.",
            "multiple_choice": "Read all options before the audio. Eliminate wrong answers as you listen. Be careful of distractors.",
            "matching": "Identify the key information for each item. Listen for synonyms and paraphrases.",
            "form_completion": "Predict the type of information needed (name, number, date). Listen for spelling clues.",
        },
        "reading": {
            "true_false_ng": "Focus on exact meaning. NOT GIVEN means the passage is silent — don't infer or assume.",
            "yes_no_ng": "These test the writer's opinion, not facts. Look for opinion language.",
            "matching_headings": "Skim paragraphs for main ideas. Match the general meaning, not individual words.",
            "matching_information": "Scan for specific details. Underline keywords from the questions.",
            "sentence_completion": "The answer must be grammatically correct. Copy words exactly from the passage.",
            "summary_completion": "Read the summary first. Answers follow passage order.",
            "multiple_choice": "Read the question stem carefully. Find the relevant section before checking options.",
        },
    }
    section_tips = base_tips.get(section, {})
    default_tip = f"Practice more {qt.replace('_', ' ')} questions to improve your accuracy."
    base = section_tips.get(qt, default_tip)

    if is_correct:
        return f"Good work on {qt.replace('_', ' ')}! {base}"

    if correct_text:
        return f"{base} For this question the answer was '{correct_text}'."
    return base


def generate_explanation(
    qtype: str,
    correct_ans,
    is_correct: bool,
    *,
    user_answer=None,
    question_text: str = "",
    reason_code: str = None,
) -> str:
    """Per-question explanation, optionally grounded in the user's actual
    answer. Legacy positional callers still work (templates fall back to
    generic 'The correct answer is X' phrasing); keyword callers get a
    contrast like "You answered X, but the answer is Y because ..."."""

    correct_text = _format_answer_text(correct_ans) or "N/A"
    user_text = _format_answer_text(user_answer)
    has_user = bool(user_text) and user_text not in ("(no answer)", "-")

    qt = (qtype or "").lower()
    upper = correct_text.upper()
    user_upper = user_text.upper() if has_user else ""

    your = f"You answered '{user_text}'" if has_user else "You left this blank"

    # ===== TRUE / FALSE / NOT GIVEN =====
    if qt in ("true_false_ng", "true_false_not_given"):
        if is_correct:
            if upper == "NOT GIVEN":
                return ("Correct — 'NOT GIVEN'. The passage neither confirms nor contradicts this; you spotted "
                        "that absence rather than inferring beyond the text.")
            if upper == "FALSE":
                return "Correct — 'FALSE'. The passage actively contradicts the statement (it isn't silent on this point)."
            return "Correct — 'TRUE'. The passage explicitly supports this statement."
        if upper == "NOT GIVEN":
            return (f"{your}, but the answer is 'NOT GIVEN'. The passage doesn't address this claim — it's neither "
                    f"confirmed nor contradicted. NOT GIVEN ≠ FALSE; FALSE means the text says the opposite.")
        if upper == "FALSE":
            if user_upper == "NOT GIVEN":
                return (f"{your}, but the answer is 'FALSE'. The passage states the opposite of this claim — "
                        f"it's actively contradicted, not silent.")
            if user_upper == "TRUE":
                return (f"{your}, but the answer is 'FALSE'. Re-read the relevant section: the passage contradicts "
                        f"what's claimed here.")
            return f"{your}, but the answer is 'FALSE'. The passage states something that contradicts this."
        if upper == "TRUE":
            if user_upper == "NOT GIVEN":
                return (f"{your}, but the answer is 'TRUE'. The passage explicitly supports this — you may have "
                        f"missed the relevant sentence.")
            if user_upper == "FALSE":
                return (f"{your}, but the answer is 'TRUE'. The passage confirms this rather than contradicting it.")
            return f"{your}, but the answer is 'TRUE'. The passage explicitly supports this statement."
        return f"{your}, but the answer is '{correct_text}'."

    # ===== YES / NO / NOT GIVEN =====
    if qt in ("yes_no_ng", "yes_no_not_given"):
        if is_correct:
            if upper == "NOT GIVEN":
                return "Correct — 'NOT GIVEN'. The writer doesn't express an opinion on this either way."
            stance = "this view" if upper == "YES" else "the opposite view"
            return f"Correct — '{correct_text}'. The writer expresses {stance} in the passage."
        if upper == "NOT GIVEN":
            return (f"{your}, but the answer is 'NOT GIVEN'. The writer doesn't state an opinion on this — don't "
                    f"infer their view from neutral facts they mention.")
        if upper == "YES":
            return f"{your}, but the answer is 'YES'. The writer expresses this view in the passage."
        if upper == "NO":
            return f"{your}, but the answer is 'NO'. The writer takes the opposite stance."
        return f"{your}, but the answer is '{correct_text}'."

    # ===== MULTIPLE SELECTION (set-equality) =====
    if qt in ("multiple_selection", "multi_mcq", "select_two", "select_three"):
        if is_correct:
            return f"Correct — '{correct_text}'. You picked the full set."
        if not has_user:
            return (f"You didn't pick any options. The full set is '{correct_text}' — multi-select needs every "
                    f"required answer, no partial credit.")
        return (f"{your}, but the full set is '{correct_text}'. Multi-select scores 0 unless every required "
                f"option is chosen — no partial credit.")

    # ===== MULTIPLE CHOICE =====
    if qt == "multiple_choice":
        if is_correct:
            return (f"Correct — '{correct_text}'. You picked the option that matches the question's meaning, "
                    f"not just shared vocabulary.")
        if has_user:
            return (f"{your}, but the answer is '{correct_text}'. The other options are distractors — they share "
                    f"vocabulary with the passage but don't match the question's meaning.")
        return (f"You didn't choose. The answer is '{correct_text}' — distractors share words with the passage "
                f"but not its meaning.")

    # ===== MATCHING HEADINGS =====
    if qt == "matching_headings":
        if is_correct:
            return f"Correct — '{correct_text}'. That heading captures the paragraph's main idea (not just one detail)."
        return (f"{your}, but the answer is '{correct_text}'. Headings test the paragraph's overall idea — "
                f"eliminate options that fit a single sentence only.")

    # ===== MATCHING INFORMATION / SECTION =====
    if qt in ("matching_information", "section_matching"):
        if is_correct:
            return f"Correct — '{correct_text}'. You matched on meaning, not just shared vocabulary."
        return (f"{your}, but the answer is '{correct_text}'. Match on meaning, not just words the question "
                f"and paragraph share.")

    # ===== COMPLETION (summary / sentence / note / table / form / diagram / flow) =====
    if qt in ("summary_completion", "sentence_completion", "note_completion",
              "table_completion", "form_completion", "diagram_labelling",
              "flow_chart_completion"):
        if is_correct:
            return f"Correct — '{correct_text}'. You copied the word(s) from the passage exactly."
        if has_user and user_text.strip().lower() == correct_text.strip().lower():
            return (f"{your}, the answer is '{correct_text}'. Capitalisation/spelling difference — copy exactly "
                    f"as in the passage.")
        if has_user:
            return (f"{your}, but the answer is '{correct_text}'. Completion answers must come straight from the "
                    f"text — don't paraphrase or change the form.")
        return f"You left this blank. The answer is '{correct_text}' — copy it exactly from the passage."

    # ===== MATCHING (listening) =====
    if qt == "matching":
        if is_correct:
            return f"Correct — '{correct_text}'. You caught the paraphrase — speakers rarely use the question's exact words."
        return (f"{your}, but the answer is '{correct_text}'. The speaker rephrased the idea — listen for "
                f"synonyms, not exact words.")

    # ===== SHORT ANSWER =====
    if qt == "short_answer":
        if is_correct:
            return f"Correct — '{correct_text}'."
        return (f"{your}, but the answer is '{correct_text}'. Stay within the word limit and use the passage's wording.")

    # ===== FALLBACK =====
    if is_correct:
        return f"Correct — '{correct_text}'."
    return f"{your}, but the answer is '{correct_text}'."


def generate_lesson_recommendations(skill_breakdown: list, track: str) -> list:
    """Generate lesson recommendations based on weak areas"""
    recommendations = []
    
    # Find weakest skills
    weak_skills = [s for s in skill_breakdown if s["total"] > 0 and (s["correct"] / s["total"]) < 0.6]
    weak_skills.sort(key=lambda x: x["correct"] / x["total"] if x["total"] > 0 else 0)
    
    # Map question types to course lessons
    lesson_mapping = {
        "true_false_ng": {
            "lesson_id": "tfng-mastery",
            "title": "True/False/Not Given Mastery",
            "route": "/mastery?section=reading&lesson=tfng",
            "course": "IELTS Reading Mastery"
        },
        "yes_no_ng": {
            "lesson_id": "ynng-mastery",
            "title": "Yes/No/Not Given Strategies",
            "route": "/mastery?section=reading&lesson=ynng",
            "course": "IELTS Reading Mastery"
        },
        "matching_headings": {
            "lesson_id": "headings-mastery",
            "title": "Matching Headings Technique",
            "route": "/mastery?section=reading&lesson=headings",
            "course": "IELTS Reading Mastery"
        },
        "matching_information": {
            "lesson_id": "matching-info",
            "title": "Matching Information Practice",
            "route": "/mastery?section=reading&lesson=matching",
            "course": "IELTS Reading Mastery"
        },
        "sentence_completion": {
            "lesson_id": "sentence-comp",
            "title": "Sentence Completion Skills",
            "route": "/mastery?section=reading&lesson=sentence",
            "course": "IELTS Reading Mastery"
        },
        "summary_completion": {
            "lesson_id": "summary-comp",
            "title": "Summary Completion Strategy",
            "route": "/mastery?section=reading&lesson=summary",
            "course": "IELTS Reading Mastery"
        },
        "note_completion": {
            "lesson_id": "note-comp",
            "title": "Note Completion Listening",
            "route": "/mastery?section=listening&lesson=notes",
            "course": "IELTS Listening Mastery"
        },
        "form_completion": {
            "lesson_id": "form-comp",
            "title": "Form Completion Skills",
            "route": "/mastery?section=listening&lesson=forms",
            "course": "IELTS Listening Mastery"
        },
        "multiple_choice": {
            "lesson_id": "mc-strategy",
            "title": "Multiple Choice Strategy",
            "route": "/mastery?section=skills&lesson=mc",
            "course": "IELTS Skills Mastery"
        }
    }
    
    for skill in weak_skills[:5]:
        qtype = skill["skill_id"].split("_", 1)[-1] if "_" in skill["skill_id"] else skill["skill_id"]
        
        if qtype in lesson_mapping:
            lesson = lesson_mapping[qtype]
            recommendations.append({
                "lesson_id": lesson["lesson_id"],
                "title": lesson["title"],
                "course": lesson["course"],
                "route": lesson["route"],
                "reason": f"Your {skill['label']} accuracy is {skill['correct']}/{skill['total']} ({int(skill['correct']/skill['total']*100) if skill['total'] > 0 else 0}%)",
                "priority": "high" if (skill["correct"] / skill["total"] if skill["total"] > 0 else 0) < 0.4 else "medium"
            })
    
    return recommendations


def build_root_cause_analysis(reason_summary, question_results):
    """Summarize the main root causes behind wrong answers."""
    cause_labels = {
        "SPELLING_ERROR": "Spelling accuracy",
        "DISTRACTOR_TRAP": "Distractor trap",
        "NEAR_MISS": "Precision gap",
        "UNANSWERED": "Time management",
        "WRONG_ANSWER": "Core comprehension error",
    }
    sample_by_reason = {}
    all_details = (question_results.get("listening") or []) + (question_results.get("reading") or [])
    for detail in all_details:
        code = detail.get("reason_code")
        if code and code not in sample_by_reason and not detail.get("is_correct"):
            question_type = detail.get("question_type") or detail.get("type") or "question"
            sample_by_reason[code] = {
                "question_type": question_type,
                "question_id": detail.get("question_id"),
            }
    analysis = []
    for code, count in sorted(reason_summary.items(), key=lambda item: item[1], reverse=True):
        label = cause_labels.get(code, code.replace("_", " ").title())
        sample = sample_by_reason.get(code, {})
        analysis.append({
            "code": code,
            "label": label,
            "count": count,
            "impact": "high" if count >= 4 else "medium" if count >= 2 else "low",
            "what_it_means": {
                "SPELLING_ERROR": "You likely heard the right answer but wrote it inaccurately.",
                "DISTRACTOR_TRAP": "You followed an early tempting answer instead of the final evidence.",
                "NEAR_MISS": "Your answer was close, but not precise enough for IELTS marking.",
                "UNANSWERED": "You lost marks without giving yourself a chance to score them.",
                "WRONG_ANSWER": "The main idea or evidence was misunderstood."
            }.get(code, "This error pattern is costing you repeated marks."),
            "sample_question_type": sample.get("question_type"),
            "sample_question_id": sample.get("question_id"),
        })
    return analysis


def build_study_plan(overall_band, skill_breakdown, fastest_gain, recommended_lessons, reason_summary, question_results):
    """Build a prescriptive roadmap from the diagnostic data."""
    weakest_skills = [item for item in skill_breakdown if item.get("total", 0) > 0]
    weakest_skills.sort(key=lambda item: (item.get("correct", 0) / item.get("total", 1)))
    priority_skill = weakest_skills[0] if weakest_skills else None
    top_reason = next(iter(sorted(reason_summary.items(), key=lambda item: item[1], reverse=True)), None)
    target_band = min(9.0, round((overall_band + 0.5) * 2) / 2)
    expected_gain = sum(item.get("wrong_count", 0) for item in fastest_gain[:2])
    primary_lessons = recommended_lessons[:3]

    roadmap_steps = []
    if priority_skill:
        roadmap_steps.append({
            "title": f"Fix {priority_skill['label']}",
            "focus": priority_skill["label"],
            "why_now": "This is currently your lowest-performing question family.",
            "action": "Review the linked lesson, then revisit only the wrong questions from this skill.",
            "expected_gain": f"Recover up to {priority_skill['total'] - priority_skill['correct']} marks here.",
        })
    if top_reason:
        roadmap_steps.append({
            "title": f"Break the {top_reason[0].replace('_', ' ').title()} pattern",
            "focus": top_reason[0].replace("_", " ").title(),
            "why_now": f"This mistake pattern appeared {top_reason[1]} times.",
            "action": "Study the explanation pattern, then retry those items under timed conditions.",
            "expected_gain": f"Removing this pattern could recover up to {top_reason[1]} marks.",
        })
    for lesson in primary_lessons:
        roadmap_steps.append({
            "title": f"Study {lesson.get('title', 'Recommended Lesson')}",
            "focus": lesson.get("course_name") or lesson.get("course"),
            "why_now": lesson.get("reason") or "This lesson directly targets your current weaknesses.",
            "action": f"Open {lesson.get('unit_label', 'the lesson')} and complete the section tied to your weak skill.",
            "expected_gain": lesson.get("why_now") or "Build accuracy before retesting.",
            "lesson_path": lesson.get("lesson_path") or lesson.get("route") or lesson.get("url"),
        })

    day_plan = [
        {"day": 1, "title": "Audit your mistakes", "tasks": [
            "Review every wrong answer and group them by question type.",
            "Read the root-cause section and mark repeated patterns."
        ]},
        {"day": 2, "title": "Study the highest-impact lesson", "tasks": [
            primary_lessons[0]["title"] if primary_lessons else "Study the top recommended lesson.",
            "Write down 3 rules you will apply in the next test."
        ]},
        {"day": 3, "title": "Targeted retest", "tasks": [
            "Retry only the wrong questions from your weakest skill.",
            "Do one short timed set to check whether the same pattern repeats."
        ]},
    ]

    return {
        "target_band": target_band,
        "estimated_weeks": 2 if overall_band >= 6.5 else 3,
        "priority_skill": priority_skill["label"] if priority_skill else None,
        "top_root_cause": top_reason[0] if top_reason else None,
        "expected_mark_recovery": expected_gain,
        "roadmap_steps": roadmap_steps[:5],
        "three_day_plan": day_plan,
        "retest_strategy": {
            "immediate": "Retry only the question types with the highest wrong count after lesson review.",
            "timed_recheck": "Run a short timed mini-test after 2-3 focused sessions.",
            "full_retake": "Take a full test only after your top two weak areas stabilize."
        }
    }


print("✅ Cambridge IELTS routes loaded")
