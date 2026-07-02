"""
Shared state for the routes/speaking_practice package.

ONE APIRouter and ONE db handle that both submodules (structured.py — sync
endpoint; jobs.py — durable job queue) register against / read from, so
server.py wiring (`set_db(db)` then `include_router(router)`) behaves exactly
like the former single-file routes/speaking_practice_structured.py.

Submodules must access the handle as `_state.db` (attribute lookup), never
`from ._state import db`, so a set_db() call after import is visible to all.
"""
from __future__ import annotations

from fastapi import APIRouter

router = APIRouter(prefix="/api/speaking-practice", tags=["Speaking Practice (Structured)"])

db = None


def set_db(database) -> None:
    global db
    db = database
