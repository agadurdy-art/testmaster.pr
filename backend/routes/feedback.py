"""
User feedback + admin moderation
================================
Single job: the feedback widget API — anonymous submit + admin list/resolve/
delete. NOTE: paths carry the explicit /api prefix (these were @app routes);
mounted with app.include_router, NOT api_router. Collections: feedbacks.

Extracted verbatim from server.py (Faz 1 refactor, 2026-07-02).
"""

import logging
import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

import auth_session

router = APIRouter()

db = None


def set_db(database):
    global db
    db = database

logger = logging.getLogger(__name__)


class FeedbackCreate(BaseModel):
    user_id: Optional[str] = None
    user_email: Optional[str] = None
    user_name: Optional[str] = None
    type: str = "general"  # general, bug, feature, content, ui
    message: str
    rating: Optional[int] = None
    page_url: Optional[str] = None
    user_agent: Optional[str] = None




@router.post("/api/feedback")
async def submit_feedback(feedback: FeedbackCreate):
    """Submit user feedback (public endpoint - no auth required)"""
    try:
        feedback_doc = {
            "id": str(uuid.uuid4()),
            "user_id": feedback.user_id,
            "user_email": feedback.user_email,
            "user_name": feedback.user_name,
            "type": feedback.type,
            "message": feedback.message,
            "rating": feedback.rating,
            "page_url": feedback.page_url,
            "user_agent": feedback.user_agent,
            "resolved": False,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        
        await db.feedbacks.insert_one(feedback_doc)
        logger.info(f"📝 New feedback submitted: {feedback.type} from {feedback.user_email}")
        
        return {"success": True, "message": "Feedback submitted successfully", "id": feedback_doc["id"]}
    except Exception as e:
        logger.error(f"Error submitting feedback: {e}")
        raise HTTPException(status_code=500, detail="Failed to submit feedback")


@router.get("/api/admin/feedbacks")
async def get_all_feedbacks(admin_email: Optional[str] = Query(None), _admin: dict = Depends(auth_session.require_admin)):
    """Get all feedbacks (admin only)"""
    from security_utils import require_admin_email
    require_admin_email(admin_email)
    try:
        feedbacks = await db.feedbacks.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
        return feedbacks
    except Exception as e:
        logger.error(f"Error fetching feedbacks: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch feedbacks")


@router.put("/api/admin/feedbacks/{feedback_id}/resolve")
async def resolve_feedback(feedback_id: str, admin_email: Optional[str] = Query(None), _admin: dict = Depends(auth_session.require_admin)):
    """Mark feedback as resolved (admin only)"""
    from security_utils import require_admin_email
    require_admin_email(admin_email)
    try:
        result = await db.feedbacks.update_one(
            {"id": feedback_id},
            {"$set": {"resolved": True, "resolved_at": datetime.now(timezone.utc).isoformat()}}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Feedback not found")
        return {"success": True, "message": "Feedback marked as resolved"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error resolving feedback: {e}")
        raise HTTPException(status_code=500, detail="Failed to resolve feedback")


@router.delete("/api/admin/feedbacks/{feedback_id}")
async def delete_feedback(feedback_id: str, admin_email: Optional[str] = Query(None), _admin: dict = Depends(auth_session.require_admin)):
    """Delete feedback (admin only)"""
    from security_utils import require_admin_email
    require_admin_email(admin_email)
    try:
        result = await db.feedbacks.delete_one({"id": feedback_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Feedback not found")
        return {"success": True, "message": "Feedback deleted"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting feedback: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete feedback")
