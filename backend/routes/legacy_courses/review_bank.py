"""
Review Bank (spaced repetition) endpoints
=========================================
Single job: the vocabulary review-bank add/list/review spaced-repetition API.

Extracted verbatim from server.py (Faz 1 refactor, 2026-07-02).
"""

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from pydantic import BaseModel

import auth_session

router = APIRouter()

db = None


def set_db(database):
    global db
    db = database


class ReviewBankAdd(BaseModel):
    user_id: str
    module_id: str
    word: str
    meaning: str = ""
    category: str = ""
    source: str = "quiz"  # quiz, practice, manual

@router.post("/vocabulary-engine/review-bank/add")
async def add_to_review_bank(item: ReviewBankAdd, caller: dict = Depends(auth_session.current_user)):
    auth_session.require_self_or_admin(item.user_id, caller)
    """Add a word to user's review bank"""
    existing = await db.review_bank.find_one(
        {"user_id": item.user_id, "word": item.word, "module_id": item.module_id}, {"_id": 0}
    )
    if existing:
        await db.review_bank.update_one(
            {"user_id": item.user_id, "word": item.word, "module_id": item.module_id},
            {"$inc": {"mistake_count": 1}, "$set": {"last_seen": datetime.now(timezone.utc).isoformat()}}
        )
    else:
        await db.review_bank.insert_one({
            "user_id": item.user_id,
            "module_id": item.module_id,
            "word": item.word,
            "meaning": item.meaning,
            "category": item.category,
            "source": item.source,
            "mistake_count": 1,
            "review_count": 0,
            "mastery_status": "learning",
            "next_review": datetime.now(timezone.utc).isoformat(),
            "last_seen": datetime.now(timezone.utc).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    return {"success": True}


@router.get("/vocabulary-engine/review-bank/{user_id}")
async def get_review_bank(user_id: str, caller: dict = Depends(auth_session.current_user)):
    auth_session.require_self_or_admin(user_id, caller)
    """Get user's review bank words sorted by next review date"""
    words = await db.review_bank.find(
        {"user_id": user_id, "mastery_status": {"$ne": "mastered"}},
        {"_id": 0}
    ).sort("next_review", 1).to_list(200)
    
    mastered = await db.review_bank.count_documents({"user_id": user_id, "mastery_status": "mastered"})
    total = await db.review_bank.count_documents({"user_id": user_id})
    
    return {"words": words, "total": total, "mastered": mastered, "to_review": len(words)}


class ReviewBankUpdate(BaseModel):
    user_id: str
    word: str
    module_id: str
    knew_it: bool

@router.post("/vocabulary-engine/review-bank/review")
async def review_bank_word(item: ReviewBankUpdate, caller: dict = Depends(auth_session.current_user)):
    auth_session.require_self_or_admin(item.user_id, caller)
    """Mark a word as reviewed. Implements spaced repetition intervals."""
    doc = await db.review_bank.find_one(
        {"user_id": item.user_id, "word": item.word, "module_id": item.module_id}
    )
    if not doc:
        return {"success": False, "message": "Word not found"}
    
    review_count = doc.get("review_count", 0) + 1
    now = datetime.now(timezone.utc)
    
    if item.knew_it:
        # Spaced repetition: 1d -> 3d -> 7d -> 14d -> mastered
        intervals = [1, 3, 7, 14]
        idx = min(review_count - 1, len(intervals) - 1)
        if review_count >= len(intervals) + 1:
            mastery = "mastered"
            next_dt = now
        else:
            mastery = "learning"
            next_dt = now + timedelta(days=intervals[idx])
    else:
        # Reset: go back to 1 day
        mastery = "learning"
        next_dt = now + timedelta(days=1)
        review_count = max(0, review_count - 1)
    
    await db.review_bank.update_one(
        {"_id": doc["_id"]},
        {"$set": {
            "review_count": review_count,
            "mastery_status": mastery,
            "next_review": next_dt.isoformat(),
            "last_seen": now.isoformat(),
        }}
    )
    return {"success": True, "mastery_status": mastery, "next_review": next_dt.isoformat()}




