"""
Speaking Credits & Manual Admin Credit Module
=============================================
Single job: speaking-session credit consumption (free trial + examCredits)
and the admin-gated manual credit/plan top-up endpoints.
Extracted from routes/payments.py (Faz 1 refactor, 2026-07-02).
"""
import os
import logging
from typing import Optional, Dict, Any

from fastapi import HTTPException, Request, Depends
import auth_session  # audit F-01/F-05/IDOR: session-based ownership/admin gates
from pydantic import BaseModel

from routes.payments_common import (
    router,
    _get_user_by_email,
)

db = None
logger = logging.getLogger(__name__)


def set_db(database):
    global db
    db = database


# ============ Models ============

class ManualCreditRequest(BaseModel):
    email: str
    plan: Optional[str] = None
    exam_credits: Optional[int] = None
    admin_token: Optional[str] = None
    admin_email: Optional[str] = None  # required by manual-credit-simple (audit fix)


# ============ Speaking Session Credits ============

@router.post("/speaking/session/start")
async def start_speaking_session(request: Request, caller: dict = Depends(auth_session.current_user)):
    # Audit NEW-4: was trusting a spoofable x-user-email header (credit-grief IDOR).
    # Identity now comes from the session token.
    user = caller
    user_email = caller.get("email")
    FREE_TRIAL_SECONDS = 180
    free_used = int(user.get("ai_interview_free_seconds_used", 0) or 0)
    if free_used < FREE_TRIAL_SECONDS:
        atomic = await db.users.update_one(
            {"id": user["id"], "ai_interview_free_seconds_used": {"$lt": FREE_TRIAL_SECONDS}},
            {"$set": {"ai_interview_free_seconds_used": FREE_TRIAL_SECONDS}},
        )
        if atomic.modified_count > 0:
            updated = await db.users.find_one({"id": user["id"]}, {"_id": 0})
            return {
                "detail": "Free trial speaking session started",
                "remainingCredits": updated.get("examCredits", 0),
                "plan": updated.get("plan", "free"), "freeTrial": True,
                "freeTrialSecondsUsed": updated.get("ai_interview_free_seconds_used", FREE_TRIAL_SECONDS),
                "freeTrialSecondsTotal": FREE_TRIAL_SECONDS,
            }
    result = await db.users.update_one(
        {"id": user["id"], "examCredits": {"$gt": 0}},
        {"$inc": {"examCredits": -1}},
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=402, detail="No speaking credits left. Please purchase a plan.")
    updated = await db.users.find_one({"id": user["id"]}, {"_id": 0})
    return {
        "detail": "Speaking session started",
        "remainingCredits": updated.get("examCredits", 0),
        "plan": updated.get("plan", "free"), "freeTrial": False,
        "freeTrialSecondsUsed": updated.get("ai_interview_free_seconds_used", FREE_TRIAL_SECONDS),
        "freeTrialSecondsTotal": FREE_TRIAL_SECONDS,
    }


# ============ Manual Credit ============

@router.post("/payments/manual-credit-simple")
async def manual_credit_simple(req: ManualCreditRequest, _admin: dict = Depends(auth_session.require_admin)):
    """Admin-only top-up. Pre-launch audit (2026-05-16) flagged that this
    endpoint had no auth at all — any caller could grant master / exam credits
    to any email. Now requires admin_email in body and validates against the
    server-side allowlist (security_utils.require_admin_email).
    """
    # Audit F-05: was gated only by a spoofable body admin_email; now requires a
    # valid admin SESSION (Depends above). admin_email body field is ignored.
    user = await _get_user_by_email(req.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    update_fields: Dict[str, Any] = {}
    if req.plan:
        update_fields["plan"] = req.plan
    if req.exam_credits is not None:
        update_fields["examCredits"] = req.exam_credits
    if not update_fields:
        raise HTTPException(status_code=400, detail="Nothing to update")
    await db.users.update_one({"id": user["id"]}, {"$set": update_fields})
    return {"detail": "User updated", "email": req.email, "update": update_fields}


@router.post("/payments/manual-credit")
async def manual_credit(req: ManualCreditRequest):
    admin_token = os.getenv("MANUAL_CREDIT_ADMIN_TOKEN", "")
    if not admin_token or req.admin_token != admin_token:
        raise HTTPException(status_code=401, detail="Invalid admin token")
    user = await _get_user_by_email(req.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    update_fields: Dict[str, Any] = {}
    if req.plan:
        update_fields["plan"] = req.plan
    if req.exam_credits is not None:
        update_fields["examCredits"] = req.exam_credits
    if not update_fields:
        raise HTTPException(status_code=400, detail="Nothing to update")
    await db.users.update_one({"id": user["id"]}, {"$set": update_fields})
    return {"detail": "User updated", "email": req.email, "update": update_fields}
