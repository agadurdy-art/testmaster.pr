"""
General English (GE) product route package.
===========================================
Faz 1 refactor (2026-07-02): GE-only backend surfaces are collected here so
the IELTS/GE repo split (roadmap Faz 3) can lift this package wholesale.

- beginner_english.py  Beginner English course (lessons + friendly evals + audio)
- tests_v1.py          legacy V1 test-taking surface (TestInterface.js)
- evaluate_v1.py       legacy V1 Ray-tutor writing/speaking evaluation
"""

from fastapi import APIRouter

from . import beginner_english, evaluate_v1, tests_v1

router = APIRouter()
for _mod in (beginner_english, tests_v1, evaluate_v1):
    router.include_router(_mod.router)


def set_db(database):
    for _mod in (beginner_english, tests_v1, evaluate_v1):
        if hasattr(_mod, "set_db"):
            _mod.set_db(database)
