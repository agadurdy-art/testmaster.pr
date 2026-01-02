"""
Cambridge IELTS Tests Router
Serves authentic Cambridge IELTS test content
"""

from fastapi import APIRouter, HTTPException
from typing import Optional

router = APIRouter(prefix="/api/cambridge", tags=["cambridge"])

# Import test content
try:
    from content.cambridge_tests.ielts17.test1 import IELTS17_TEST1
except ImportError:
    IELTS17_TEST1 = None
    print("Warning: Could not import IELTS 17 Test 1")


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


@router.get("/audio/{book_id}/{test_id}/{part}")
async def get_audio_path(book_id: str, test_id: str, part: int):
    """Get audio file path for a listening part"""
    audio_path = f"/static/audio/cambridge/{book_id}/{test_id}_part{part}.mp3"
    return {"success": True, "audio_path": audio_path}


print("✅ Cambridge IELTS routes loaded")
