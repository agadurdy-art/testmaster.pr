"""Testimonials: user-submitted quotes + admin moderation.

Design decisions (2026-04-19):
  * Submissions land with status="pending" — they are NOT rendered publicly
    until an admin approves them. Keeps the landing page clean and avoids
    abuse (spam, slurs, ads).
  * Public GET /api/testimonials returns ONLY approved rows, sorted newest
    first, capped at 20. Good enough for a landing-page rail.
  * Admin auth re-uses the x-admin-email header pattern used in
    routes/admin_analytics.py. Not as strong as a full JWT check, but the
    admin UI already guards the route and the header re-verifies
    server-side with is_admin_user().
  * We store the submitter's email so we can dedupe / follow up, but the
    public endpoint strips it. Only `name`, `role`, `quote`, `rating`,
    `avatar_url` go out to the landing page.
"""

import logging
import os
import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Header, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, field_validator

from plan_access import is_admin_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["testimonials"])

_MONGO_URL = os.getenv("MONGO_URL", "")
_DB_NAME = os.getenv("DB_NAME", "testmaster")
_client = AsyncIOMotorClient(_MONGO_URL) if _MONGO_URL else None
db = _client[_DB_NAME] if _client else None


def _require_admin(x_admin_email: Optional[str]):
    if not x_admin_email or not is_admin_user(x_admin_email):
        raise HTTPException(status_code=403, detail="Admin access required")


class TestimonialSubmit(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    email: EmailStr
    role: Optional[str] = Field(default=None, max_length=120)
    quote: str = Field(min_length=10, max_length=600)
    rating: int = Field(ge=1, le=5, default=5)
    # Optional band / target score context for IELTS testimonials.
    band_achieved: Optional[float] = Field(default=None, ge=0, le=9)
    avatar_url: Optional[str] = Field(default=None, max_length=500)

    @field_validator("quote")
    @classmethod
    def _strip_quote(cls, v: str) -> str:
        return v.strip()


def _public_shape(doc: dict) -> dict:
    """Only expose fields safe for public consumption."""
    return {
        "id": doc.get("id"),
        "name": doc.get("name"),
        "role": doc.get("role"),
        "quote": doc.get("quote"),
        "rating": doc.get("rating", 5),
        "band_achieved": doc.get("band_achieved"),
        "avatar_url": doc.get("avatar_url"),
        "created_at": doc.get("created_at"),
    }


@router.post("/testimonials")
async def submit_testimonial(payload: TestimonialSubmit):
    """Anyone can submit; it goes into the pending queue."""
    if db is None:
        raise HTTPException(status_code=503, detail="Database not configured")

    # Light rate-limit: at most one pending submission per email at a time.
    existing = await db.testimonials.find_one({
        "email": payload.email.lower(),
        "status": "pending",
    })
    if existing:
        raise HTTPException(
            status_code=429,
            detail="You already have a testimonial awaiting review. Thank you!",
        )

    doc = {
        "id": str(uuid.uuid4()),
        "name": payload.name,
        "email": payload.email.lower(),
        "role": payload.role,
        "quote": payload.quote,
        "rating": payload.rating,
        "band_achieved": payload.band_achieved,
        "avatar_url": payload.avatar_url,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "approved_at": None,
    }
    await db.testimonials.insert_one(doc)
    return {"ok": True, "id": doc["id"], "status": "pending"}


@router.get("/testimonials")
async def list_public_testimonials(limit: int = 20):
    """Public — approved testimonials only, newest first."""
    if db is None:
        raise HTTPException(status_code=503, detail="Database not configured")
    limit = max(1, min(limit, 50))
    cursor = db.testimonials.find({"status": "approved"}) \
        .sort("approved_at", -1).limit(limit)
    out = []
    async for doc in cursor:
        out.append(_public_shape(doc))
    return {"testimonials": out}


@router.get("/admin/testimonials")
async def list_admin_testimonials(
    status: Optional[str] = None,
    x_admin_email: Optional[str] = Header(default=None),
):
    """Admin — all testimonials, optionally filtered by status."""
    _require_admin(x_admin_email)
    if db is None:
        raise HTTPException(status_code=503, detail="Database not configured")
    q = {}
    if status in {"pending", "approved", "rejected"}:
        q["status"] = status
    cursor = db.testimonials.find(q).sort("created_at", -1).limit(200)
    out = []
    async for doc in cursor:
        out.append({
            "id": doc.get("id"),
            "name": doc.get("name"),
            "email": doc.get("email"),
            "role": doc.get("role"),
            "quote": doc.get("quote"),
            "rating": doc.get("rating", 5),
            "band_achieved": doc.get("band_achieved"),
            "avatar_url": doc.get("avatar_url"),
            "status": doc.get("status"),
            "created_at": doc.get("created_at"),
            "approved_at": doc.get("approved_at"),
        })
    return {"testimonials": out}


@router.post("/admin/testimonials/{testimonial_id}/approve")
async def approve_testimonial(
    testimonial_id: str,
    x_admin_email: Optional[str] = Header(default=None),
):
    _require_admin(x_admin_email)
    if db is None:
        raise HTTPException(status_code=503, detail="Database not configured")
    res = await db.testimonials.update_one(
        {"id": testimonial_id},
        {"$set": {
            "status": "approved",
            "approved_at": datetime.now(timezone.utc).isoformat(),
        }},
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    return {"ok": True, "status": "approved"}


@router.post("/admin/testimonials/{testimonial_id}/reject")
async def reject_testimonial(
    testimonial_id: str,
    x_admin_email: Optional[str] = Header(default=None),
):
    _require_admin(x_admin_email)
    if db is None:
        raise HTTPException(status_code=503, detail="Database not configured")
    res = await db.testimonials.update_one(
        {"id": testimonial_id},
        {"$set": {"status": "rejected"}},
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    return {"ok": True, "status": "rejected"}


@router.delete("/admin/testimonials/{testimonial_id}")
async def delete_testimonial(
    testimonial_id: str,
    x_admin_email: Optional[str] = Header(default=None),
):
    _require_admin(x_admin_email)
    if db is None:
        raise HTTPException(status_code=503, detail="Database not configured")
    res = await db.testimonials.delete_one({"id": testimonial_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    return {"ok": True}
