"""
Cambridge IELTS Tests Router
Serves authentic Cambridge IELTS test content with full evaluation
"""

from fastapi import APIRouter, HTTPException, Body
from typing import Optional, Dict, Any
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
            "test2": None,  # Coming soon
            "test3": None,  # Coming soon
            "test4": None,  # Coming soon
        },
        "available_tests": ["test1"],
        "coming_soon": ["test2", "test3", "test4"]
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


print("✅ Cambridge IELTS routes loaded")
