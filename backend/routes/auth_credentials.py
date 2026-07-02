"""
Auth — register / login / verify-email / password-reset endpoints
=================================================================
Single job: the email+password credential endpoints (register, login,
resend-verification, verify-email, forgot-password, reset-password).
Extracted from routes/auth.py (Faz 1 refactor, 2026-07-02).

SECURITY-CRITICAL: token/hash/verification flows were moved verbatim —
do not modify them here without a dedicated security review.
"""
import os
import logging
import uuid
from datetime import datetime, timezone, timedelta

from fastapi import HTTPException

import auth_session  # opaque session tokens (audit F01/F03)

from routes.auth_common import (
    router,
    RESET_TOKEN_EXPIRY_MINUTES,
    User,
    UserCreate,
    UserLogin,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    VerifyEmailRequest,
    ResendVerificationRequest,
    hash_password,
    verify_password,
    generate_reset_token,
    send_verification_email,
    send_reset_email,
)

db = None
logger = logging.getLogger(__name__)


def set_db(database):
    global db
    db = database


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
    user_response["token"] = await auth_session.create_session(user_id)
    return user_response


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
    u = User(**user)
    u.token = await auth_session.create_session(user["id"])
    return u


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
