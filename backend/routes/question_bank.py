"""
IELTS Question Bank - API Routes (aggregator shim)
==================================================
Split into single-responsibility modules in the Faz 1 refactor
(2026-07-02):

- routes/question_bank_meta.py           static metadata + stats
- routes/question_bank_practice.py       practice-mode extraction
- routes/question_bank_tests_progress.py test start/submit + user progress
- routes/question_bank_writing.py        writing task1/task2 + general

This module keeps the original import path working: server.py mounts
`from routes.question_bank import router`, and all previously module-level
names are re-exported below.
"""

from fastapi import APIRouter

from routes.question_bank_meta import router as _meta_router
from routes.question_bank_practice import (
    router as _practice_router,
    get_questions_from_cambridge_tests,
    extract_relevant_context,
    get_questions_from_full_tests,
)
from routes.question_bank_tests_progress import router as _tests_progress_router
from routes.question_bank_writing import (
    router as _writing_router,
    _task_cache,
    CURATED_TASK1_PROCESS_VISUALS,
    CURATED_TASK1_MAP_VISUALS,
    _build_curated_task1_visual,
    WritingEvaluationRequest,
    GENERAL_TASK2_PROMPTS,
)

router = APIRouter(prefix="/api/question-bank", tags=["Question Bank"])
router.include_router(_meta_router)
router.include_router(_practice_router)
router.include_router(_tests_progress_router)
router.include_router(_writing_router)
