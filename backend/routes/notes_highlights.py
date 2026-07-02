"""
User annotations: notes + text highlights.
==========================================
Single job: per-user, per-test annotations made inside test interfaces —
free-text notes and colored text highlights (create / list / delete).

Extracted verbatim from server.py (Faz 1 refactor, 2026-07-02).
Collections: user_notes, user_highlights.
"""

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

import auth_session

router = APIRouter()

db = None


def set_db(database):
    global db
    db = database


class NoteCreate(BaseModel):
    user_id: str
    test_id: str
    test_type: str
    content: str
    timestamp: str


@router.post("/notes")
async def create_note(note: NoteCreate, caller: dict = Depends(auth_session.current_user)):
    auth_session.require_self_or_admin(note.user_id, caller)
    """Create a new note for a test/module"""
    note_doc = {
        "id": str(uuid.uuid4()),
        "user_id": note.user_id,
        "test_id": note.test_id,
        "test_type": note.test_type,
        "content": note.content,
        "timestamp": note.timestamp or datetime.now(timezone.utc).isoformat()
    }
    await db.user_notes.insert_one(note_doc)
    return {k: v for k, v in note_doc.items() if k != '_id'}


@router.get("/notes/{user_id}/{test_id}")
async def get_notes(user_id: str, test_id: str, caller: dict = Depends(auth_session.current_user)):
    auth_session.require_self_or_admin(user_id, caller)
    """Get all notes for a user and test"""
    notes = await db.user_notes.find(
        {"user_id": user_id, "test_id": test_id},
        {"_id": 0}
    ).sort("timestamp", 1).to_list(100)
    return notes


@router.delete("/notes/{note_id}")
async def delete_note(note_id: str):
    """Delete a note"""
    result = await db.user_notes.delete_one({"id": note_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Note not found")
    return {"status": "deleted"}


# ============ Highlights API (Phase 2) ============

class HighlightCreate(BaseModel):
    user_id: str
    test_id: str
    test_type: str
    start_index: int
    end_index: int
    color: str
    highlighted_text: str
    timestamp: str


@router.post("/highlights")
async def create_highlight(highlight: HighlightCreate, caller: dict = Depends(auth_session.current_user)):
    auth_session.require_self_or_admin(highlight.user_id, caller)
    """Create a new text highlight"""
    highlight_doc = {
        "id": str(uuid.uuid4()),
        "user_id": highlight.user_id,
        "test_id": highlight.test_id,
        "test_type": highlight.test_type,
        "start_index": highlight.start_index,
        "end_index": highlight.end_index,
        "color": highlight.color,
        "highlighted_text": highlight.highlighted_text,
        "timestamp": highlight.timestamp or datetime.now(timezone.utc).isoformat()
    }
    await db.user_highlights.insert_one(highlight_doc)
    return {k: v for k, v in highlight_doc.items() if k != '_id'}


@router.get("/highlights/{user_id}/{test_id}")
async def get_highlights(user_id: str, test_id: str, caller: dict = Depends(auth_session.current_user)):
    auth_session.require_self_or_admin(user_id, caller)
    """Get all highlights for a user and test"""
    highlights = await db.user_highlights.find(
        {"user_id": user_id, "test_id": test_id},
        {"_id": 0}
    ).sort("start_index", 1).to_list(100)
    return highlights


@router.delete("/highlights/{highlight_id}")
async def delete_highlight(highlight_id: str):
    """Delete a highlight"""
    result = await db.user_highlights.delete_one({"id": highlight_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Highlight not found")
    return {"status": "deleted"}
