"""
Level-test route package.
=========================
All placement-assessment HTTP surfaces extracted from server.py
(Faz 1 refactor, 2026-07-02). One job per module:

- reading.py          simple + comprehensive reading questions/scoring
- adaptive.py         adaptive Band 2.0-9.0 placement flow
- speaking.py         speaking transcript evaluation
- listening.py        listening sections + scoring + guidance
- writing.py          writing tasks + evaluation
- recommendations.py  course picks + LLM study roadmap

Route paths are byte-identical to the pre-refactor /api/* routes.
"""

from fastapi import APIRouter

from . import adaptive, listening, reading, recommendations, speaking, writing

router = APIRouter()
for _mod in (reading, adaptive, speaking, recommendations, listening, writing):
    router.include_router(_mod.router)


def set_db(database):
    """Inject the Mongo database into the submodules that persist results."""
    reading.set_db(database)
    adaptive.set_db(database)
