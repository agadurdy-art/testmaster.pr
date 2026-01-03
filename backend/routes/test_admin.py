"""
Test Admin Routes
=================
Debug and validation endpoints for test management.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional

router = APIRouter(prefix="/api/admin/tests", tags=["Test Admin"])

# Import services
from services.practice_service import PracticeService
from services.stats_aggregator import StatsAggregator
from schemas.test_package import TestPackageValidator

# Lazy-loaded services
_practice_service = None
_stats_aggregator = None


def get_practice_service():
    global _practice_service
    if _practice_service is None:
        from routes.cambridge import CAMBRIDGE_TESTS
        _practice_service = PracticeService(CAMBRIDGE_TESTS)
    return _practice_service


def get_stats_aggregator():
    global _stats_aggregator
    if _stats_aggregator is None:
        from routes.cambridge import CAMBRIDGE_TESTS
        _stats_aggregator = StatsAggregator(CAMBRIDGE_TESTS)
    return _stats_aggregator


# ============ DEBUG ENDPOINTS ============

@router.get("/debug/{test_id}")
async def debug_test(test_id: str):
    """
    ADMIN DEBUG PAGE DATA
    Get detailed debug info for a specific test.
    Shows: validation status, missing fields, counts per skill.
    """
    aggregator = get_stats_aggregator()
    return aggregator.get_test_debug_info(test_id)


@router.get("/validate/{test_id}")
async def validate_test(test_id: str):
    """
    Run validation on a specific test.
    Returns validation result with errors/warnings.
    """
    from routes.cambridge import CAMBRIDGE_TESTS
    from services.test_normalizer import TestNormalizer
    
    # Find the test
    for book_id, book_data in CAMBRIDGE_TESTS.items():
        for tid, test_data in book_data.get("tests", {}).items():
            if f"{book_id}_{tid}" == test_id:
                if test_data is None:
                    return {
                        "valid": False,
                        "test_id": test_id,
                        "errors": ["Test data is None"],
                        "warnings": []
                    }
                
                # Normalize first
                normalized = TestNormalizer.normalize(test_data, book_id, tid)
                
                # Validate
                result = TestPackageValidator.validate(normalized)
                
                return {
                    "valid": result.valid,
                    "test_id": result.test_id,
                    "errors": result.errors,
                    "warnings": result.warnings,
                    "stats": result.stats.dict() if result.stats else None
                }
    
    raise HTTPException(status_code=404, detail=f"Test {test_id} not found")


@router.get("/list")
async def list_all_tests():
    """
    List all tests with their validation status.
    """
    aggregator = get_stats_aggregator()
    stats = aggregator.get_stats()
    
    return {
        "total_tests": stats["total_tests"],
        "valid_tests": stats["valid_tests"],
        "failed_tests": stats["failed_tests"],
        "tests": stats["tests"]
    }


@router.get("/stats")
async def get_aggregated_stats():
    """
    Get auto-computed stats for all tests.
    Updates automatically when tests are added/removed.
    """
    aggregator = get_stats_aggregator()
    return aggregator.get_stats()


@router.post("/refresh-stats")
async def refresh_stats():
    """
    Force refresh of stats cache.
    """
    aggregator = get_stats_aggregator()
    stats = aggregator.refresh()
    
    return {
        "success": True,
        "message": "Stats refreshed",
        "stats": stats
    }


# ============ PRACTICE MODE ENDPOINTS ============

@router.get("/practice/pool-stats")
async def get_practice_pool_stats():
    """
    Get practice pool statistics.
    Shows how many questions available for each skill/type.
    """
    service = get_practice_service()
    return service.get_pool_stats()


@router.get("/practice/random")
async def get_practice_questions(
    skill: str = Query(..., description="Skill: listening, reading, writing, speaking"),
    count: int = Query(10, ge=1, le=50),
    question_type: Optional[str] = Query(None, description="Filter by question type")
):
    """
    Get random MICRO-BASED practice questions.
    - Reading: Returns only relevant paragraph (micro_context)
    - Listening: Returns questions with answer_span for audio trimming
    - Speaking Part 1 & 3: Returns questions for TTS (NOT for display)
    - Speaking Part 2: Returns visible cue card
    """
    service = get_practice_service()
    return service.get_random_practice(skill, count, question_type)


@router.post("/practice/refresh")
async def refresh_practice_pool():
    """
    Rebuild practice pool from all tests.
    Call after adding/removing tests.
    """
    global _practice_service
    from routes.cambridge import CAMBRIDGE_TESTS
    _practice_service = PracticeService(CAMBRIDGE_TESTS)
    
    return {
        "success": True,
        "message": "Practice pool refreshed",
        "stats": _practice_service.get_pool_stats()
    }


# ============ CANONICAL PREVIEW ============

@router.get("/canonical/{test_id}")
async def get_canonical_preview(test_id: str):
    """
    Get canonical (normalized) preview of a test.
    Shows how the test data looks after normalization.
    """
    from routes.cambridge import CAMBRIDGE_TESTS
    from services.test_normalizer import TestNormalizer
    
    for book_id, book_data in CAMBRIDGE_TESTS.items():
        for tid, test_data in book_data.get("tests", {}).items():
            if f"{book_id}_{tid}" == test_id:
                if test_data is None:
                    raise HTTPException(status_code=404, detail="Test data not available")
                
                normalized = TestNormalizer.normalize(test_data, book_id, tid)
                
                # Return summary (not full content to save bandwidth)
                return {
                    "test_id": normalized["test_id"],
                    "meta": normalized["meta"],
                    "listening_sections": len(normalized["listening"]["sections"]),
                    "reading_passages": len(normalized["reading"]["passages"]),
                    "reading_questions": len(normalized["reading"]["questions"]),
                    "writing_task1_prompt_length": len(normalized["writing"]["task1"].get("prompt", "")),
                    "writing_task2_prompt_length": len(normalized["writing"]["task2"].get("prompt", "")),
                    "speaking_part1_questions": len(normalized["speaking"]["part1"]["questions"]),
                    "speaking_part2_has_cue_card": bool(normalized["speaking"]["part2"]["cue_card"]["topic"]),
                    "speaking_part3_questions": len(normalized["speaking"]["part3"]["questions"]),
                    "practice_index": normalized["practice_index"]
                }
    
    raise HTTPException(status_code=404, detail=f"Test {test_id} not found")


print("✅ Test Admin routes loaded")
