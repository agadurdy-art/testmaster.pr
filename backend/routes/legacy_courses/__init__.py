"""
Legacy IELTS course-track route package.
========================================
Mastery (Band 4.5-6.5), Advanced Mastery (Band 6.0-9.0), the Vocabulary
Engine + Review Bank that serve them, and the /ai/strategy advisor.
Extracted from server.py (Faz 1 refactor, 2026-07-02); route paths are
byte-identical to the pre-refactor /api/* routes.
"""

from fastapi import APIRouter

from . import advanced, ai_strategy, mastery, review_bank, vocabulary_engine

router = APIRouter()
for _mod in (mastery, vocabulary_engine, review_bank, advanced, ai_strategy):
    router.include_router(_mod.router)


def set_db(database):
    for _mod in (mastery, vocabulary_engine, review_bank, advanced):
        if hasattr(_mod, "set_db"):
            _mod.set_db(database)
