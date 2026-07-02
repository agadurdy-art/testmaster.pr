"""
Full Test session lifecycle endpoints: start, submit-section, complete
(evaluation + persistence mirrors), and results rehydration.

Extracted from routes/full_test.py (Faz 1 refactor, 2026-07-02).
"""

from fastapi import HTTPException, Body
from typing import Dict, List, Any, Optional
from datetime import datetime, timezone
import uuid

from routes.full_test_registry import router, get_test_by_id
from routes.full_test_feedback import evaluate_full_test

# Import test structure utilities
try:
    from content.full_tests.test_structure import (
        TestType, SectionType, TEST_TIMINGS,
        calculate_listening_band, calculate_reading_band,
        calculate_overall_band, validate_full_test
    )
except ImportError:
    print("Warning: Could not import test_structure")


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
    mode: str = Body(default="full"),
    user_id: Optional[str] = Body(default=None)
):
    """
    Complete test and generate full evaluation.
    """
    test = get_test_by_id(test_id)
    if not test:
        raise HTTPException(status_code=404, detail=f"Test set '{test_id}' not found")
    
    results = await evaluate_full_test(test, all_answers, section_times)

    # Track completion in DB
    if user_id:
        try:
            from server import db
            category = "ai_academic" if test_id.startswith("academic_") else "ai_general"
            band = results.get("overall_band", 0) if isinstance(results, dict) else 0
            existing = await db.user_completions.find_one(
                {"user_id": user_id, "test_id": test_id, "category": category}, {"_id": 0}
            )
            record = {
                "user_id": user_id,
                "test_id": test_id,
                "category": category,
                "band_score": band,
                "completed_at": datetime.now(timezone.utc).isoformat(),
            }
            if existing:
                await db.user_completions.update_one(
                    {"user_id": user_id, "test_id": test_id, "category": category},
                    {"$set": record},
                )
            else:
                await db.user_completions.insert_one(record)
        except Exception as e:
            print(f"Warning: Could not track full test completion: {e}")

    # Mirror to test_attempts so Progress page + Liz see this full test.
    try:
        from server import persist_attempt
        _band = float((results.get("overall_band", 0) if isinstance(results, dict) else 0) or 0.0)
        await persist_attempt(
            user_id=user_id,
            test_id=test_id,
            test_type="mixed",
            band_score=_band,
            feedback={
                "source": "full_test",
                "session_id": session_id,
                "mode": mode,
                "section_times": section_times,
                "overall": (results.get("overall") if isinstance(results, dict) else None),
            },
        )
    except Exception as e:
        print(f"persist_attempt mirror skipped (full_test): {e}")

    completed_at = datetime.now(timezone.utc).isoformat()

    # Persist full result snapshot so the GET endpoint (and any share link)
    # can rehydrate the page after refresh / bookmark / new device.
    try:
        from server import db
        await db.full_test_results.update_one(
            {"session_id": session_id},
            {
                "$set": {
                    "session_id": session_id,
                    "test_id": test_id,
                    "user_id": user_id,
                    "mode": mode,
                    "section_times": section_times,
                    "results": results,
                    "completed_at": completed_at,
                }
            },
            upsert=True,
        )
    except Exception as e:
        print(f"full_test_results persist skipped: {e}")

    return {
        "success": True,
        "session_id": session_id,
        "test_id": test_id,
        "mode": mode,
        "completed_at": completed_at,
        "results": results
    }


@router.get("/results/{session_id}")
async def get_test_results(session_id: str):
    """
    Get results for a completed test session. Reads from db.full_test_results
    (written by /complete). Public read — session_id is uuid4 and acts as the
    share token. No PII is included in the persisted payload beyond the
    user_id reference (omitted from response).
    """
    try:
        from server import db
        doc = await db.full_test_results.find_one(
            {"session_id": session_id}, {"_id": 0, "user_id": 0}
        )
    except Exception as e:
        print(f"get_test_results db error: {e}")
        raise HTTPException(status_code=500, detail="Results lookup failed")

    if not doc:
        raise HTTPException(status_code=404, detail="Results not found")

    return {
        "success": True,
        "session_id": session_id,
        "test_id": doc.get("test_id"),
        "mode": doc.get("mode"),
        "completed_at": doc.get("completed_at"),
        "results": doc.get("results") or {},
    }
