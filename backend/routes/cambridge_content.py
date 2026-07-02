"""
Cambridge test/book content serving + answer stripping: books registry,
test/section payloads, answer keys, sample answers, images and audio paths.
Defines the shared /api/cambridge APIRouter that cambridge_eval extends.
Extracted from routes/cambridge.py (Faz 1 refactor, 2026-07-02).
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from typing import Optional
from pathlib import Path

router = APIRouter(prefix="/api/cambridge", tags=["cambridge"])


# Pre-launch audit (2026-05-16): answer keys + listening transcripts were
# served via plain GETs with no gating — any anonymous client could scrape
# the entire test bank. We strip those fields from the live-test response
# and keep the raw payloads behind /answers/* (admin/post-submission only).
ANSWER_KEYS_BLACKLIST = {
    "answer_keys",
    "correct_answer",
    "correct_answers",
    "answer",
    "answers",
    "explanation",
    "explanations",
    "audioscript",
    "audio_script",
    "transcript",
    "transcripts",
    "model_answer",
    "model_answers",
    "sample_answer",
    "sample_answers",
}


def _strip_answers(node):
    """Recursively remove answer-key / transcript fields from a test payload.

    Returns a *new* structure so the original CAMBRIDGE_TESTS module data
    is not mutated (those dicts are imported once and shared across reqs).
    """
    if isinstance(node, dict):
        return {
            k: _strip_answers(v)
            for k, v in node.items()
            if k not in ANSWER_KEYS_BLACKLIST
        }
    if isinstance(node, list):
        return [_strip_answers(item) for item in node]
    return node

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

    # Local in dev; in production the file isn't on the pod (static/ is dockerignored)
    # so this 307-redirects to the R2 CDN copy at the mirrored path.
    from services.asset_cdn import serve_static_asset
    return serve_static_asset(file_path, "image/png", detail=f"Image not found: {filename}")



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
    """Get full test content with answer keys + transcripts stripped.

    Pre-launch audit 2026-05-16: anonymous GET previously leaked correct
    answers and listening audioscripts. Both are now stripped from the
    response — clients fetch them from /answers/* after submission.
    """
    if book_id not in CAMBRIDGE_TESTS:
        raise HTTPException(status_code=404, detail=f"Book '{book_id}' not found")

    book = CAMBRIDGE_TESTS[book_id]

    if test_id not in book["tests"]:
        raise HTTPException(status_code=404, detail=f"Test '{test_id}' not found in {book_id}")

    test_data = book["tests"][test_id]

    if test_data is None:
        raise HTTPException(status_code=404, detail=f"Test '{test_id}' is coming soon")

    return {"success": True, "test": _strip_answers(test_data)}


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
        # Pre-launch audit 2026-05-16: strip answer keys / transcripts here
        # too — the per-section endpoint had the same exposure.
        "data": _strip_answers(test_data["sections"][section])
    }


@router.get("/answers/{book_id}/{test_id}")
async def get_answer_key(book_id: str, test_id: str, email: Optional[str] = None):
    """Get answer key for a test.

    Pre-launch audit 2026-05-16: was anonymous → trivially scrapable.
    Now requires a known user email; clients call this post-submission.
    """
    from security_utils import require_known_user
    await require_known_user(email)
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


@router.get("/audio/{book_id}/{test_id}/{part}")
async def get_audio_path(book_id: str, test_id: str, part: int):
    """Get audio file path for a listening part"""
    audio_path = f"/static/audio/cambridge/{book_id}/{test_id}_part{part}.mp3"
    return {"success": True, "audio_path": audio_path}
