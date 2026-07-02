"""
Auth — shared router, config, models, password/token helpers, email senders
===========================================================================
Single job: shared APIRouter + DB handle, env/OAuth configuration, Pydantic
models, bcrypt/sha256 password + reset-token helpers, Resend email senders,
and the plan-expiry helper used by the user endpoints.
Extracted from routes/auth.py (Faz 1 refactor, 2026-07-02).

SECURITY-CRITICAL: the hash/verify/token logic below was moved verbatim —
do not modify it here without a dedicated security review.
"""
import os
import logging
import uuid
import hashlib
import hmac
import asyncio
from datetime import datetime, timezone
from typing import Optional, Dict, Any

import bcrypt
import resend
from fastapi import APIRouter
from pydantic import BaseModel, Field, ConfigDict

router = APIRouter(prefix="/api", tags=["auth"])

db = None
logger = logging.getLogger(__name__)

RESET_TOKEN_EXPIRY_MINUTES = 60
RESEND_API_KEY = os.getenv("RESEND_API_KEY")
RESEND_FROM_EMAIL = os.getenv("RESEND_FROM_EMAIL", "onboarding@resend.dev")
FACEBOOK_APP_ID = os.getenv("FACEBOOK_APP_ID")
FACEBOOK_APP_SECRET = os.getenv("FACEBOOK_APP_SECRET")
FACEBOOK_GRAPH_API_BASE = "https://graph.facebook.com/v21.0"

# Google OAuth (own client — replaces Emergent proxy as of 2026-05-08).
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv(
    "GOOGLE_REDIRECT_URI",
    "https://api.testmaster.pro/api/auth/google/callback",
)
GOOGLE_AUTH_BASE = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"
FRONTEND_BASE_URL = os.getenv("FRONTEND_BASE_URL", "https://www.testmaster.pro")
OAUTH_STATE_TTL_SECONDS = 600   # 10 min — Google consent window
OAUTH_SESSION_TTL_SECONDS = 300  # 5 min — frontend exchange window

# Allowed return_to schemes/prefixes for /auth/google/start. The web flow
# uses the default (None → FRONTEND_BASE_URL). Mobile clients pass their
# own custom scheme so the in-app browser can auto-close on redirect.
# Anything not on this allow-list is silently dropped — never trust the
# raw query value as a redirect target (open-redirect risk).
#
# `exp://` covers Expo Go during development: Linking.createURL() in
# Expo Go returns `exp://<lan-ip>:<port>/--/<path>` because the host app
# owns the URL scheme (not our custom `ieltsace://`). Without this entry
# the OAuth round-trip can't auto-close the in-app browser when we're
# testing through Expo Go. Production / EAS dev-client builds use the
# `ieltsace://` scheme registered in app.json.
ALLOWED_OAUTH_RETURN_SCHEMES = ("ieltsace://", "ielts-ace://", "exp://", FRONTEND_BASE_URL)

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY


def set_db(database):
    global db
    db = database


# ============ Models ============

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    password_hash: Optional[str] = Field(default=None, exclude=True)
    verified: bool = False
    email_verified: bool = False
    google_id: Optional[str] = None
    facebook_id: Optional[str] = None
    plan: str = Field(default="free", description="Subscription plan")
    plan_expires_at: Optional[str] = Field(
        default=None,
        description="ISO-8601 UTC timestamp; None for free or non-expiring plans",
    )
    examCredits: int = Field(default=0)
    mockCredits: int = Field(default=0)  # Full Mock Test credits (1 credit = 1 mock)
    ai_interview_free_seconds_used: int = Field(default=0)
    ai_mentor_messages_used: int = Field(default=0)
    verification_sent_at: Optional[str] = None
    last_resend_at: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    test_history: list = Field(default_factory=list)
    # Onboarding + personalization (set via /api/users/{id}/onboarding)
    learning_mode: Optional[str] = None  # "ielts" | "general_english"
    onboarding_complete: bool = False
    onboarding_completed_at: Optional[str] = None
    target_band: Optional[float] = None
    current_band: Optional[float] = None
    exam_date: Optional[str] = None
    feedback_language: Optional[str] = None
    # Opaque session token minted on login/register/OAuth (audit F01/F03).
    # Not persisted on the user doc — only returned in the auth response.
    token: Optional[str] = None


class UserCreate(BaseModel):
    email: str
    name: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class GoogleSessionRequest(BaseModel):
    session_id: str


class FacebookLoginRequest(BaseModel):
    access_token: str


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


class VerifyEmailRequest(BaseModel):
    token: str


class ResendVerificationRequest(BaseModel):
    email: str


# ============ Password Helpers ============

def hash_password(password: str) -> str:
    if not isinstance(password, str):
        password = str(password)
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def _hash_password_sha256(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def verify_password(password: str, password_hash: str) -> bool:
    if not password_hash:
        return False
    if password_hash.startswith("$2"):
        try:
            return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
        except Exception:
            return False
    computed = _hash_password_sha256(password)
    return hmac.compare_digest(computed, password_hash)


def generate_reset_token() -> str:
    return str(uuid.uuid4())


# ============ Email Helpers ============

async def send_verification_email(to_email: str, verify_link: str, user_name: str = "there") -> bool:
    if not RESEND_API_KEY:
        logger.warning("Resend not configured; skipping verification email send")
        return False
    try:
        params = {
            "from": RESEND_FROM_EMAIL,
            "to": [to_email],
            "subject": "Verify your email - testmaster.pro",
            "html": f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #7c3aed; margin: 0;">testmaster.pro</h1>
                        <p style="color: #6b7280; margin-top: 5px;">IELTS &amp; Cambridge AI Exam Prep</p>
                    </div>
                    <p style="font-size: 16px; color: #374151;">Hi {user_name},</p>
                    <p style="font-size: 16px; color: #374151;">Welcome to testmaster.pro!</p>
                    <p style="font-size: 16px; color: #374151;">Click below to verify your email and unlock all courses:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{verify_link}" style="background: linear-gradient(to right, #7c3aed, #9333ea); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                            Verify Email
                        </a>
                    </div>
                    <p style="font-size: 14px; color: #6b7280;">This link expires in 24 hours.</p>
                    <p style="font-size: 14px; color: #6b7280;">Didn't sign up? You can safely ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                    <p style="font-size: 12px; color: #9ca3af; text-align: center;">testmaster.pro team</p>
                </div>
            """,
        }
        email = await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Sent verification email to {to_email}, email_id: {email.get('id')}")
        return True
    except Exception as e:
        logger.error(f"Resend verification email exception for {to_email}: {e}")
        return False


async def send_reset_email(to_email: str, reset_link: str) -> bool:
    if not RESEND_API_KEY:
        logger.warning("Resend not configured; skipping email send")
        return False
    try:
        params = {
            "from": RESEND_FROM_EMAIL,
            "to": [to_email],
            "subject": "IELTS Ace - Password Reset",
            "html": f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #7c3aed; margin: 0;">testmaster.pro</h1>
                        <p style="color: #6b7280; margin-top: 5px;">IELTS &amp; Cambridge AI Exam Prep</p>
                    </div>
                    <p style="font-size: 16px; color: #374151;">Hello,</p>
                    <p style="font-size: 16px; color: #374151;">We received a request to reset the password for your account.</p>
                    <p style="font-size: 16px; color: #374151;">Click the link below to set a new password (valid for 60 minutes):</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{reset_link}" style="background: linear-gradient(to right, #7c3aed, #9333ea); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                            Reset Password
                        </a>
                    </div>
                    <p style="font-size: 14px; color: #6b7280;">If you did not request this, you can safely ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                    <p style="font-size: 12px; color: #9ca3af; text-align: center;">testmaster.pro team</p>
                </div>
            """,
        }
        email = await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Sent reset email to {to_email}, email_id: {email.get('id')}")
        return True
    except Exception as e:
        logger.error(f"Resend reset email exception for {to_email}: {e}")
        return False


# ============ Plan Expiry Helper ============

async def _check_plan_expiry(user: dict) -> dict:
    expires_at = user.get("plan_expires_at")
    if expires_at and user.get("payment_method") == "bank_transfer":
        try:
            exp_dt = datetime.fromisoformat(expires_at) if isinstance(expires_at, str) else expires_at
            if exp_dt < datetime.now(timezone.utc):
                await db.users.update_one(
                    {"id": user["id"]},
                    {"$set": {"plan": "free", "subscription": None, "plan_expires_at": None, "payment_method": None}}
                )
                user["plan"] = "free"
                user["subscription"] = None
                user["plan_expires_at"] = None
                user["payment_method"] = None
        except (ValueError, TypeError):
            pass
    return user
