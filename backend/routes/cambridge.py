"""
Cambridge IELTS Tests Router
Serves authentic Cambridge IELTS test content with full evaluation
"""

from fastapi import APIRouter, HTTPException, Body
from fastapi.responses import FileResponse
from typing import Optional, Dict, Any
from pathlib import Path
import os
import json
import uuid

router = APIRouter(prefix="/api/cambridge", tags=["cambridge"])

# Import test content
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
            "test3": None,  # Coming soon
            "test4": None,  # Coming soon
        },
        "available_tests": ["test1", "test2"],
        "coming_soon": ["test3", "test4"]
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
    response: str = Body(...)
):
    """
    Evaluate Cambridge Writing Task using detailed IELTS criteria.
    Returns band scores with detailed feedback like official Cambridge sample answers.
    """
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="Evaluation service not configured")
    
    try:
        from emergentintegrations.llm.openai import LlmChat, UserMessage
        
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
        
        # Parse response
        response_text = str(result)
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0]
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0]
        
        evaluation = json.loads(response_text.strip())
        
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
    user_plan: str = Body("free")
):
    """
    Comprehensive Cambridge Test Evaluation
    Returns: skill_breakdown, teacher_feedback, recommended_lessons
    Matches the existing QB Results page format
    """
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="Evaluation service not configured")
    
    try:
        from emergentintegrations.llm.openai import LlmChat, UserMessage
        
        # Get test data and answers
        book = CAMBRIDGE_TESTS.get(book_id, {})
        test_data = book.get("tests", {}).get(test_id)
        
        if not test_data:
            raise HTTPException(status_code=404, detail="Test not found")
        
        # Get answer key
        answer_key = test_data.get("answer_keys", {})
        
        # ============ CALCULATE SCORES ============
        listening_results = calculate_section_results("listening", answers, answer_key.get("listening", {}), test_data)
        reading_results = calculate_section_results("reading", answers, answer_key.get("reading", {}), test_data)
        
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
        
        feedback_prompt = f"""You are an experienced IELTS teacher providing feedback on a Cambridge IELTS practice test.

TEST RESULTS:
- Listening: {listening_results['correct']}/{listening_results['total']} ({listening_results['percentage']:.1f}%)
- Reading: {reading_results['correct']}/{reading_results['total']} ({reading_results['percentage']:.1f}%)
- Overall: {total_correct}/{total_questions} ({overall_percentage:.1f}%)

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
        
        feedback_response = await chat.send_message(user_message=UserMessage(text=feedback_prompt))
        
        response_text = str(feedback_response)
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0]
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0]
        
        teacher_feedback = json.loads(response_text.strip())
        
        # ============ RECOMMENDED LESSONS ============
        recommended_lessons = generate_lesson_recommendations(skill_breakdown, "academic")
        
        # ============ CALCULATE BAND SCORE ============
        overall_band = calculate_band_from_percentage(overall_percentage)
        listening_band = calculate_band_from_percentage(listening_results["percentage"])
        reading_band = calculate_band_from_percentage(reading_results["percentage"])
        
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
            }
        }
        
    except Exception as e:
        print(f"Full test evaluation error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


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
    
    if section == "listening":
        for part in section_data.get("parts", []):
            for qg in part.get("question_groups", []):
                qtype = qg.get("question_type", "note_completion")
                for q in qg.get("questions", []):
                    qnum = str(q.get("question_number"))
                    question_metadata[qnum] = {
                        "type": qtype,
                        "text": q.get("question_text", ""),
                        "part": part.get("part_number", 1)
                    }
    elif section == "reading":
        for passage in section_data.get("passages", []):
            for qg in passage.get("question_groups", []):
                qtype = qg.get("question_type", "multiple_choice")
                for q in qg.get("questions", []):
                    qnum = str(q.get("question_number"))
                    question_metadata[qnum] = {
                        "type": qtype,
                        "text": q.get("question_text", ""),
                        "passage": passage.get("passage_number", 1)
                    }
    
    # Evaluate each answer
    for qnum, correct_ans in correct_answers.items():
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
        results["details"].append({
            "question_id": qnum,
            "question_type": qtype,
            "question_text": meta.get("text", ""),
            "user_answer": user_ans or "-",
            "correct_answer": correct_ans if isinstance(correct_ans, str) else correct_ans[0] if isinstance(correct_ans, list) else str(correct_ans),
            "is_correct": is_correct,
            "passage_excerpt": None,  # Could be populated from test data
            "explanation": generate_explanation(qtype, correct_ans, is_correct),
            "skill_tip": get_skill_tip(section, qtype, 1 if is_correct else 0)
        })
    
    results["percentage"] = (results["correct"] / results["total"] * 100) if results["total"] > 0 else 0
    return results


def compare_answers(user_ans, correct_ans) -> bool:
    """Compare user answer with correct answer(s)"""
    if not user_ans or not correct_ans:
        return False
    
    def normalize(s):
        return str(s).lower().strip().replace(".", "").replace(",", "")
    
    user_normalized = normalize(user_ans)
    
    if isinstance(correct_ans, list):
        return any(normalize(ans) == user_normalized for ans in correct_ans)
    
    if "/" in str(correct_ans):
        return any(normalize(ans) == user_normalized for ans in str(correct_ans).split("/"))
    
    return normalize(correct_ans) == user_normalized


def calculate_band_from_percentage(percentage: float) -> float:
    """Convert percentage to IELTS band score"""
    if percentage >= 90:
        return 9.0
    elif percentage >= 82:
        return 8.5
    elif percentage >= 75:
        return 8.0
    elif percentage >= 68:
        return 7.5
    elif percentage >= 60:
        return 7.0
    elif percentage >= 52:
        return 6.5
    elif percentage >= 45:
        return 6.0
    elif percentage >= 38:
        return 5.5
    elif percentage >= 30:
        return 5.0
    elif percentage >= 22:
        return 4.5
    else:
        return 4.0


def get_skill_tip(section: str, qtype: str, accuracy: float) -> str:
    """Generate skill-specific tips"""
    tips = {
        "listening": {
            "note_completion": "Listen for keywords that signal the answer is coming. Write exactly what you hear - don't change the form of words.",
            "multiple_choice": "Read all options before the audio. Eliminate wrong answers as you listen. Be careful of distractors.",
            "matching": "Identify the key information for each item. Listen for synonyms and paraphrases.",
            "form_completion": "Predict the type of information needed (name, number, date). Listen for spelling clues."
        },
        "reading": {
            "true_false_ng": "Focus on the exact meaning. 'Not Given' means no information - don't infer or assume.",
            "yes_no_ng": "These test the writer's opinion, not facts. Look for opinion language.",
            "matching_headings": "Skim paragraphs for main ideas. Match the general meaning, not individual words.",
            "matching_information": "Scan for specific details. Underline keywords from the questions.",
            "sentence_completion": "The answer must be grammatically correct. Copy words exactly from the passage.",
            "summary_completion": "Read the summary first. Answers follow passage order.",
            "multiple_choice": "Read the question stem carefully. Find the relevant section before checking options."
        }
    }
    
    default_tip = "Practice more " + qtype.replace('_', ' ') + " questions to improve your accuracy."
    section_tips = tips.get(section, {})
    
    if accuracy >= 0.7:
        return f"Good work on {qtype.replace('_', ' ')}! {section_tips.get(qtype, default_tip)}"
    else:
        return section_tips.get(qtype, default_tip)


def generate_explanation(qtype: str, correct_ans, is_correct: bool) -> str:
    """Generate explanation for the answer"""
    ans_text = correct_ans if isinstance(correct_ans, str) else correct_ans[0] if isinstance(correct_ans, list) else str(correct_ans)
    
    if qtype in ["true_false_ng", "yes_no_ng"]:
        if ans_text.upper() == "TRUE" or ans_text.upper() == "YES":
            return f"The correct answer is '{ans_text}'. The statement agrees with the information in the passage."
        elif ans_text.upper() == "FALSE" or ans_text.upper() == "NO":
            return f"The correct answer is '{ans_text}'. The statement contradicts information in the passage."
        else:
            return f"The correct answer is 'NOT GIVEN'. There is no information about this in the passage."
    
    return f"The correct answer is '{ans_text}'. This can be found directly in the text/audio."


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


print("✅ Cambridge IELTS routes loaded")
