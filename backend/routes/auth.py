"""
Auth Routes Module
==================
Extracted from server.py for deploy-readiness refactoring.
Handles: register, login, verify-email, forgot/reset password,
         Emergent Google OAuth, Facebook OAuth.
"""
import os
import logging
import uuid
import hashlib
import hmac
import asyncio
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any

import bcrypt
import httpx
import resend
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, ConfigDict

from services.usage_tracking import get_all_counters

router = APIRouter(prefix="/api", tags=["auth"])

db = None
logger = logging.getLogger(__name__)

RESET_TOKEN_EXPIRY_MINUTES = 60
RESEND_API_KEY = os.getenv("RESEND_API_KEY")
RESEND_FROM_EMAIL = os.getenv("RESEND_FROM_EMAIL", "onboarding@resend.dev")
FACEBOOK_APP_ID = os.getenv("FACEBOOK_APP_ID")
FACEBOOK_APP_SECRET = os.getenv("FACEBOOK_APP_SECRET")
FACEBOOK_GRAPH_API_BASE = "https://graph.facebook.com/v21.0"

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


class UserCreate(BaseModel):
    email: str
    name: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class EmergentSessionRequest(BaseModel):
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


# ============ Facebook OAuth ============

async def verify_facebook_access_token(access_token: str) -> Optional[Dict[str, Any]]:
    if not FACEBOOK_APP_ID or not FACEBOOK_APP_SECRET:
        logger.error("Facebook App ID/Secret not configured")
        raise HTTPException(status_code=500, detail="Facebook login not configured")
    async with httpx.AsyncClient() as client:
        debug_params = {"input_token": access_token, "access_token": f"{FACEBOOK_APP_ID}|{FACEBOOK_APP_SECRET}"}
        debug_resp = await client.get(f"{FACEBOOK_GRAPH_API_BASE}/debug_token", params=debug_params)
        try:
            debug_resp.raise_for_status()
        except httpx.HTTPError:
            logger.warning("Facebook debug_token call failed: %s", debug_resp.text)
            return None
        debug_data = debug_resp.json().get("data", {})
        if not debug_data.get("is_valid"):
            return None
        app_id = debug_data.get("app_id")
        if app_id and str(app_id) != str(FACEBOOK_APP_ID):
            return None
        me_params = {"fields": "id,name,email,picture.type(large)", "access_token": access_token}
        me_resp = await client.get(f"{FACEBOOK_GRAPH_API_BASE}/me", params=me_params)
        try:
            me_resp.raise_for_status()
        except httpx.HTTPError:
            return None
        profile = me_resp.json()
        picture_url = None
        picture = profile.get("picture", {}).get("data") if isinstance(profile.get("picture"), dict) else None
        if isinstance(picture, dict):
            picture_url = picture.get("url")
        return {
            "id": profile.get("id"),
            "email": (profile.get("email") or "").strip().lower() or None,
            "name": profile.get("name"),
            "picture": picture_url,
        }


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


# ============ Auth Routes ============

@router.post("/auth/register", response_model=User)
async def register_user(input: UserCreate):
    existing = await db.users.find_one({"email": input.email.strip().lower()}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email is already registered")
    if len(input.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")
    user_id = str(uuid.uuid4())
    hashed_password = hash_password(input.password)
    now = datetime.now(timezone.utc)
    verification_token = generate_reset_token()
    verification_expires_at = now + timedelta(hours=24)
    user = {
        "id": user_id,
        "email": input.email.strip().lower(),
        "name": input.name.strip(),
        "password_hash": hashed_password,
        "plan": "free",
        "examCredits": 0,
        "verified": False,
        "email_verified": False,
        "verification_token": verification_token,
        "verification_sent_at": now.isoformat(),
        "verification_expires_at": verification_expires_at.isoformat(),
        "last_resend_at": None,
        "ai_interview_free_seconds_used": 0,
        "ai_mentor_messages_used": 0,
        "created_at": now.isoformat()
    }
    await db.users.insert_one(user)
    frontend_base = os.getenv("FRONTEND_BASE_URL", "http://localhost:3000")
    verify_link = f"{frontend_base}/verify-email?token={verification_token}"
    try:
        await send_verification_email(input.email.strip().lower(), verify_link, input.name.strip())
    except Exception as e:
        logger.error(f"Failed to send verification email: {e}")
    user_response = {k: v for k, v in user.items() if k not in ["password_hash", "verification_token"]}
    return user_response


@router.post("/auth/emergent/session")
async def emergent_session_login(payload: EmergentSessionRequest):
    session_id = payload.session_id.strip()
    if not session_id:
        raise HTTPException(status_code=400, detail="Missing session_id")
    emergent_backend_url = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"
    headers = {"X-Session-ID": session_id}
    async with httpx.AsyncClient(timeout=10.0) as client_http:
        try:
            resp = await client_http.get(emergent_backend_url, headers=headers)
            resp.raise_for_status()
        except httpx.HTTPError as e:
            logger.error("Emergent auth session fetch failed: %s", str(e))
            raise HTTPException(status_code=401, detail="Invalid or expired session_id")
        session_data = resp.json()
    email = (session_data.get("email") or "").strip().lower()
    name = session_data.get("name") or "Google User"
    google_id = session_data.get("id") or None
    if not email:
        raise HTTPException(status_code=400, detail="No email returned from Google session")
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user:
        user_obj = User(email=email, name=name, password_hash=None, verified=True, google_id=google_id)
        doc = user_obj.model_dump()
        doc["created_at"] = doc["created_at"].isoformat()
        await db.users.insert_one(doc)
        user = {**doc}
    else:
        update_fields: Dict[str, Any] = {"verified": True}
        if google_id:
            update_fields["google_id"] = google_id
        await db.users.update_one({"id": user["id"]}, {"$set": update_fields})
        user.update(update_fields)
    user.pop("password_hash", None)
    if isinstance(user.get("created_at"), str):
        try:
            user["created_at"] = datetime.fromisoformat(user["created_at"])
        except Exception:
            pass
    return User(**user)


@router.post("/auth/facebook-login")
async def facebook_login(payload: FacebookLoginRequest):
    fb_data = await verify_facebook_access_token(payload.access_token)
    if not fb_data or not fb_data.get("id"):
        raise HTTPException(status_code=401, detail="Invalid Facebook token")
    email = fb_data.get("email")
    name = fb_data.get("name") or "Facebook User"
    facebook_id = fb_data["id"]
    user = None
    if email:
        user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user:
        user = await db.users.find_one({"facebook_id": facebook_id}, {"_id": 0})
    if not user:
        user_obj = User(email=email or f"fb_{facebook_id}@example.com", name=name, password_hash=None, verified=True)
        doc = user_obj.model_dump()
        doc["created_at"] = doc["created_at"].isoformat()
        doc["facebook_id"] = facebook_id
        await db.users.insert_one(doc)
        user = {**doc}
    else:
        update_fields: Dict[str, Any] = {"facebook_id": facebook_id}
        if not user.get("verified", False):
            update_fields["verified"] = True
        await db.users.update_one({"id": user["id"]}, {"$set": update_fields})
        user.update(update_fields)
    user.pop("password_hash", None)
    if isinstance(user.get("created_at"), str):
        try:
            user["created_at"] = datetime.fromisoformat(user["created_at"])
        except Exception:
            pass
    return User(**user)


@router.post("/auth/login", response_model=User)
async def login_user(input: UserLogin):
    email = input.email.strip().lower()
    logger.info(f"Login attempt for email: {email}")
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user:
        logger.warning(f"User not found: {email}")
        raise HTTPException(status_code=401, detail="Invalid email or password")
    pwd_hash = user.get("password_hash") or ""
    if not verify_password(input.password, pwd_hash):
        logger.warning(f"Password verification failed for: {email}")
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if pwd_hash and not pwd_hash.startswith("$2"):
        new_hash = hash_password(input.password)
        await db.users.update_one({"email": email}, {"$set": {"password_hash": new_hash}})
        logger.info(f"Migrated password hash to bcrypt for: {email}")
    logger.info(f"Login successful for: {email}")
    user.pop("password_hash", None)
    user.pop("verification_token", None)
    if isinstance(user.get('created_at'), str):
        user['created_at'] = datetime.fromisoformat(user['created_at'])
    return User(**user)


@router.post("/auth/resend-verification")
async def resend_verification_email(input: ResendVerificationRequest):
    email = input.email.strip().lower()
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.get("verified") or user.get("email_verified"):
        return {"message": "Email is already verified", "already_verified": True}
    last_resend = user.get("last_resend_at")
    if last_resend:
        if isinstance(last_resend, str):
            last_resend = datetime.fromisoformat(last_resend)
        cooldown_seconds = 60
        time_since_last = (datetime.now(timezone.utc) - last_resend.replace(tzinfo=timezone.utc)).total_seconds()
        if time_since_last < cooldown_seconds:
            wait_time = int(cooldown_seconds - time_since_last)
            raise HTTPException(status_code=429, detail=f"Please wait {wait_time} seconds before requesting another email")
    now = datetime.now(timezone.utc)
    verification_token = generate_reset_token()
    verification_expires_at = now + timedelta(hours=24)
    await db.users.update_one(
        {"email": email},
        {"$set": {
            "verification_token": verification_token,
            "verification_sent_at": now.isoformat(),
            "verification_expires_at": verification_expires_at.isoformat(),
            "last_resend_at": now.isoformat()
        }}
    )
    frontend_base = os.getenv("FRONTEND_BASE_URL", "http://localhost:3000")
    verify_link = f"{frontend_base}/verify-email?token={verification_token}"
    email_sent = await send_verification_email(email, verify_link, user.get("name", "there"))
    if email_sent:
        return {"message": "Verification email sent! Check your inbox and spam folder.", "sent": True}
    else:
        return {"message": "Email service temporarily unavailable. Please try again later.", "sent": False}


@router.get("/users/{user_id}/usage")
async def get_user_usage(user_id: str):
    """Return the current-period quota + used counts for every tracked counter.

    Response shape:
        {
          "plan": "learner",
          "period": "2026-04",
          "counters": {
            "evaluations": {"used": 12, "quota": 100, "remaining": 88, "unlimited": false, "allowed": true, ...},
            "mocks": {...},
            "speaking_minutes": {...}
          }
        }
    The dashboard usage meter consumes this verbatim.
    """
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return await get_all_counters(db, user)


@router.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user = await _check_plan_expiry(user)
    if isinstance(user.get('created_at'), str):
        user['created_at'] = datetime.fromisoformat(user['created_at'])
    user.pop("password_hash", None)
    return User(**user)


# ─── Onboarding persistence ──────────────────────────────────────────────────

_ALLOWED_LANGS = {"en", "vi", "tr", "zh", "ar", "ko", "th", "ja", "es", "pt", "ru", "id"}
_ALLOWED_MODES = {"ielts", "general_english"}


class OnboardingPayload(BaseModel):
    """Accepts the OnboardingQuiz state. Tolerant of extra fields so the
    frontend can evolve without breaking this contract."""
    model_config = ConfigDict(extra="ignore")
    path: Optional[str] = None  # "ielts" | "general"
    targetBand: Optional[float] = None
    currentBand: Optional[float] = None
    examDate: Optional[str] = None  # ISO string or free-text
    language: Optional[Dict[str, Any]] = None  # {name, code?}


def _normalize_language_code(lang_field: Any) -> Optional[str]:
    """Extract ISO 639-1 code from the quiz's language object."""
    if not lang_field:
        return None
    if isinstance(lang_field, str):
        candidate = lang_field
    elif isinstance(lang_field, dict):
        candidate = lang_field.get("code") or lang_field.get("name") or ""
    else:
        candidate = str(lang_field)
    code = candidate.strip().lower().split("-")[0][:2]
    return code if code in _ALLOWED_LANGS else None


def _normalize_learning_mode(path: Optional[str]) -> Optional[str]:
    if not path:
        return None
    p = path.strip().lower()
    if p in {"ielts", "ielts_ace", "ielts-ace"}:
        return "ielts"
    if p in {"general", "general_english", "general-english", "ge"}:
        return "general_english"
    return None


def _normalize_exam_date(value: Any) -> Optional[str]:
    """Accept Date-ish inputs, return ISO YYYY-MM-DD when possible."""
    if not value:
        return None
    if isinstance(value, str):
        # Already a string — store as-is (trim length to something safe)
        return value.strip()[:32] or None
    # Frontend may JSON-serialize Date objects as ISO strings; other shapes we
    # just stringify defensively.
    return str(value)[:32]


@router.post("/users/{user_id}/onboarding", response_model=User)
async def save_onboarding(user_id: str, payload: OnboardingPayload):
    """Persist OnboardingQuiz completion and mark the user onboarded.

    Idempotent: posting again simply overwrites with the latest values.
    """
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    update: Dict[str, Any] = {}
    mode = _normalize_learning_mode(payload.path)
    if mode:
        update["learning_mode"] = mode
    if payload.targetBand is not None:
        try:
            tb = float(payload.targetBand)
            if 0 <= tb <= 9:
                update["target_band"] = round(tb * 2) / 2
        except (TypeError, ValueError):
            pass
    if payload.currentBand is not None:
        try:
            cb = float(payload.currentBand)
            if 0 <= cb <= 9:
                update["current_band"] = round(cb * 2) / 2
        except (TypeError, ValueError):
            pass
    exam_date = _normalize_exam_date(payload.examDate)
    if exam_date:
        update["exam_date"] = exam_date
    lang = _normalize_language_code(payload.language)
    if lang:
        update["feedback_language"] = lang

    # First completion only — subsequent partial patches (e.g. the Progress
    # page updating just targetBand) must not re-flip the completion timestamp.
    if not user.get("onboarding_complete"):
        update["onboarding_complete"] = True
        update["onboarding_completed_at"] = datetime.now(timezone.utc).isoformat()

    if not update:
        # No-op patch — avoid an empty $set which Mongo rejects.
        refreshed = user
    else:
        await db.users.update_one({"id": user_id}, {"$set": update})
        refreshed = None  # force a re-read below

    if refreshed is None:
        refreshed = await db.users.find_one({"id": user_id}, {"_id": 0})
    if isinstance(refreshed.get("created_at"), str):
        refreshed["created_at"] = datetime.fromisoformat(refreshed["created_at"])
    refreshed.pop("password_hash", None)
    return User(**refreshed)


@router.post("/auth/verify-email")
async def verify_email(payload: VerifyEmailRequest):
    token = payload.token.strip()
    user = await db.users.find_one({"verification_token": token}, {"_id": 0})
    if user:
        expires_at_str = user.get("verification_expires_at")
        if expires_at_str:
            expires_at = datetime.fromisoformat(expires_at_str)
            if datetime.now(timezone.utc) > expires_at.replace(tzinfo=timezone.utc):
                raise HTTPException(status_code=400, detail="Verification link has expired. Please request a new one.")
        if user.get("verified") or user.get("email_verified"):
            return {"detail": "Email is already verified!", "already_verified": True}
        await db.users.update_one(
            {"id": user["id"]},
            {"$set": {"verified": True, "email_verified": True}, "$unset": {"verification_token": "", "verification_expires_at": ""}}
        )
        return {"detail": "Email verified successfully! You now have full access.", "success": True}
    record = await db.email_verifications.find_one({"token": token})
    if not record:
        raise HTTPException(status_code=400, detail="Invalid or expired verification token. Please request a new verification email.")
    if datetime.now(timezone.utc) > datetime.fromisoformat(record["expires_at"]).replace(tzinfo=timezone.utc):
        await db.email_verifications.delete_one({"_id": record["_id"]})
        raise HTTPException(status_code=400, detail="Verification link has expired. Please request a new one.")
    email = record["email"]
    await db.users.update_one({"email": email}, {"$set": {"verified": True, "email_verified": True}})
    await db.email_verifications.delete_one({"_id": record["_id"]})
    return {"detail": "Email verified successfully! You now have full access.", "success": True}


@router.post("/auth/forgot-password")
async def forgot_password(payload: ForgotPasswordRequest):
    email = payload.email.strip().lower()
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user:
        return {"detail": "If this email exists, a reset link has been sent."}
    token = generate_reset_token()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=RESET_TOKEN_EXPIRY_MINUTES)
    await db.password_resets.insert_one({"email": email, "token": token, "expires_at": expires_at.isoformat()})
    frontend_base = os.getenv("FRONTEND_BASE_URL", "http://localhost:3000")
    reset_link = f"{frontend_base}/reset-password?token={token}"
    await send_reset_email(email, reset_link)
    logger.info(f"Password reset token for {email}: {token}")
    return {"detail": "If this email exists, a reset link has been sent."}


@router.post("/auth/reset-password")
async def reset_password(payload: ResetPasswordRequest):
    token = payload.token.strip()
    record = await db.password_resets.find_one({"token": token})
    if not record:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    if datetime.now(timezone.utc) > datetime.fromisoformat(record["expires_at"]):
        await db.password_resets.delete_one({"_id": record["_id"]})
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    if len(payload.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")
    email = record["email"]
    password_hash = hash_password(payload.new_password)
    await db.users.update_one({"email": email}, {"$set": {"password_hash": password_hash}})
    await db.password_resets.delete_one({"_id": record["_id"]})
    return {"detail": "Password has been reset successfully."}
