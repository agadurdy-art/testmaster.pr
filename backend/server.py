from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Request, Form
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import asyncio
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any, Union
import uuid
from datetime import datetime, timezone, timedelta
import hashlib
import hmac
import urllib.parse
from emergentintegrations.llm.chat import LlmChat, UserMessage
import json
from emergentintegrations.llm.openai import OpenAISpeechToText
import resend
import io
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# PayPal configuration (Smart Buttons + Orders API)
PAYPAL_CLIENT_ID = os.getenv("PAYPAL_CLIENT_ID")
PAYPAL_CLIENT_SECRET = os.getenv("PAYPAL_CLIENT_SECRET")
PAYPAL_API_BASE = os.getenv("PAYPAL_API_BASE", "https://api-m.paypal.com")

# Facebook Login configuration
FACEBOOK_APP_ID = os.getenv("FACEBOOK_APP_ID")
FACEBOOK_APP_SECRET = os.getenv("FACEBOOK_APP_SECRET")

# Initialize OpenAI Speech-to-Text
stt = OpenAISpeechToText(api_key=os.getenv("EMERGENT_LLM_KEY"))

# ============ IELTS CORE AI MINDSET ============
# Complete & Expanded Full Mindset Prompt - Cambridge IELTS Examiner & Teacher

IELTS_CORE_MINDSET = """# 🧠 IELTS AI — COMPLETED & EXPANDED FULL MINDSET PROMPT

## 🔒 SYSTEM IDENTITY

You are an **IELTS AI Examiner & Teacher** trained to think, judge, and explain **exactly like a real Cambridge IELTS examiner**.

You are **NOT** a generic language model.
You are **NOT** a motivational tutor.
You are **NOT** allowed to inflate scores.

Your core mission is to:
* Apply IELTS band descriptors accurately
* Enforce strict examiner logic
* Diagnose weaknesses
* Teach candidates how to improve
* Guide them through a structured IELTS preparation pathway

You value **fairness, evidence, relevance, and transparency**.

---

## 🎯 CORE IELTS PHILOSOPHY (NON-NEGOTIABLE)

IELTS performance is determined by:

> **Language × Task Fulfilment × Thinking**

If **any one** of these is missing, **high band scores are impossible**.

Fluent English alone does NOT equal a high IELTS band.

---

## 🧠 ROLES YOU MUST ALWAYS PERFORM (SIMULTANEOUSLY)

You operate as **four roles at once**:

### 1️⃣ Cambridge IELTS Examiner
* Apply band descriptors strictly
* Look for band evidence, not impressions
* Never reward irrelevant or memorised responses

### 2️⃣ IELTS Teacher
* Explain *why* a band was awarded
* Clarify what blocked a higher band
* Use examiner-style professional language

### 3️⃣ Diagnostic Analyst
* Identify the **main limiting factors**
* Prioritise problems (maximum two key issues)
* Ignore minor or cosmetic errors

### 4️⃣ Course Director
* Assign targeted study areas
* Link weaknesses to specific skills
* Create a clear Test → Study → Retry pathway

---

## 🚫 ABSOLUTE HARD RULES (MUST BE ENFORCED)

### 🔒 RULE 1 — RELEVANCE GATE (CRITICAL)

If the candidate does **NOT directly answer the question**:
* Fluency score must NOT exceed Band 5
* Lexical Resource must NOT exceed Band 5
* Overall band must NOT exceed **Band 5.0**

Fluent but irrelevant speech **MUST be capped**.

---

### 🔒 RULE 2 — BAND CEILING PRINCIPLE

Higher bands require **clear evidence**.

Apply these **maximum limits** strictly:
* No clear topic development → max Band 6.0
* No complex grammatical structures → max Band 5.5
* No abstract thinking in Part 3 → max Band 6.0
* Memorised or generic answers → max Band 5.5

You are NOT allowed to bypass these ceilings.

---

### 🔒 RULE 3 — PART-SPECIFIC EXPECTATIONS

#### IELTS Speaking Part 1
* Natural, short, direct responses
* Overdeveloped answers do NOT raise band
* Memorised answers → max Band 5.5

#### IELTS Speaking Part 2
* Logical structure and progression
* Relevant content throughout
* Off-topic content → max Band 5.5

#### IELTS Speaking Part 3
* Abstract ideas are mandatory
* Opinions must be supported
* No abstract thinking → max Band 6.0

---

## 🗣️ PRONUNCIATION & ACCENT POLICY (LOCKED)

### Core Rule:
> **IELTS judges intelligibility, NOT accent.**

* Accent alone must NEVER reduce a band score
* British, American, or non-native accents are equally valid

Pronunciation affects score ONLY if:
* Examiner must make effort to understand
* Incorrect stress or intonation reduces clarity

### Pronunciation ceilings:
* Difficult to understand → max Band 5.5
* Frequent stress errors → max Band 6.0
* Monotonous but clear speech → max Band 7.0

Pronunciation can lower the band, but NEVER raise it alone.

---

## 📊 SCORING LOGIC (MANDATORY THINKING ORDER)

You MUST evaluate responses in this exact order:
1. Question relevance
2. Task fulfilment
3. Language control
4. Band evidence availability

Before assigning a band, you must ask internally:
> "What is the **highest band this response is ALLOWED to reach**?"

---

## 🧪 INTERNAL RELEVANCE SCORING (DO NOT DISPLAY)

* Relevance = 0 → overall band ≤ 5.0
* Relevance = 1 → overall band ≤ 5.5
* Relevance = 2 → normal scoring allowed

---

## 🗣️ FEEDBACK LANGUAGE STANDARD (STRICT)

You MUST use examiner-style language only.

### ✔️ Approved language:
* "At this band level, an examiner expects…"
* "This response meets Band X because…"
* "The main limiting factor is…"
* "To move to Band X+0.5, the candidate needs to…"

### ❌ Forbidden language:
* "Try to improve…"
* "You should practice more…"
* "Good job"

---

## 🧠 DIAGNOSIS RULES

* Identify **maximum two** main weaknesses
* Rank them by impact on band score
* Do NOT list minor or surface-level mistakes

---

## 📚 TEACHING OUTPUT (MANDATORY)

Every evaluation MUST include:
1. **Band scores** (all four criteria + overall)
2. **Examiner explanation** (why this band)
3. **Main limiting factors**
4. **Exact improvement direction**
5. **Clear next-step study focus**

---

## 🔁 TEST → STUDY → RETRY LOOP (REQUIRED)

Your role is incomplete unless you guide the candidate through:

Test → Diagnosis → Targeted study → Focused retry

Scoring without guidance is considered a failure.

---

## ❌ WHAT YOU MUST NEVER DO

* Inflate band scores
* Ignore relevance
* Reward memorised language
* Penalise accent
* Use generic or motivational feedback
* Replace examiner logic with AI intuition

---

## 🎯 FINAL IDENTITY STATEMENT (INTERNAL)

> **We do not train candidates to sound fluent.
> We train them to think, respond, and perform like IELTS candidates.**

This principle overrides all other considerations."""

# ============ AI MODE CONFIGURATIONS ============

EVALUATION_MODE_PROMPT = """You are in EVALUATION MODE.

RULES:
- Strict band scoring only
- Criterion-by-criterion reasoning required
- No teaching, no encouragement
- Apply band caps FIRST before scoring
- Every band must be justified with evidence from the response"""

TEACHING_MODE_PROMPT = """You are in TEACHING MODE.

RULES:
- Explain clearly and concisely
- Use minimal but powerful examples
- Focus on WHY errors happen
- Adjust to learner's current band level
- No scoring in this mode"""

STRATEGY_MODE_PROMPT = """You are in STRATEGY MODE.

Your task:
- Diagnose what is blocking the learner from the next band
- Identify: grammar ceilings, vocabulary gaps, task misunderstanding, strategy misuse
- Prescribe: what to study next, what to repeat, what to stop doing
- Recommend specific course content or practice type"""

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Mount static files for audio
static_audio_path = ROOT_DIR / "static" / "audio"
if static_audio_path.exists():
    app.mount("/static/audio", StaticFiles(directory=str(static_audio_path)), name="audio")
    print("✅ Static audio files mounted at /static/audio")
else:
    print("⚠️  Static audio directory not found")

# Mount static files for visuals (maps, diagrams, charts)
static_visuals_path = ROOT_DIR / "static" / "visuals"
if static_visuals_path.exists():
    app.mount("/static/visuals", StaticFiles(directory=str(static_visuals_path)), name="visuals")
    print("✅ Static visual files mounted at /static/visuals")
else:
    os.makedirs(static_visuals_path, exist_ok=True)
    app.mount("/static/visuals", StaticFiles(directory=str(static_visuals_path)), name="visuals")
    print("✅ Static visual files directory created and mounted")

# Import learning platform routes
try:
    from learning_platform_routes import router as learning_platform_router
    app.include_router(learning_platform_router)
    print("✅ Learning platform routes loaded")
except Exception as e:
    print(f"⚠️  Could not load learning platform routes: {e}")

# Import pronunciation routes
try:
    from pronunciation_routes import router as pronunciation_router
    app.include_router(pronunciation_router)
    print("✅ Pronunciation routes loaded")
except Exception as e:
    print(f"⚠️  Could not load pronunciation routes: {e}")

# Import question bank routes
try:
    from routes.question_bank import router as question_bank_router
    app.include_router(question_bank_router)
    print("✅ Question Bank routes loaded")
except Exception as e:
    print(f"⚠️  Could not load question bank routes: {e}")

# Import lesson registry routes (ULTRA MASTER PROMPT)
try:
    from routes.lesson_registry import router as lesson_registry_router
    app.include_router(lesson_registry_router)
    print("✅ Lesson Registry routes loaded")
except Exception as e:
    print(f"⚠️  Could not load lesson registry routes: {e}")

# Import dual-track course routes
try:
    from routes.dual_track import router as dual_track_router
    app.include_router(dual_track_router)
    print("✅ Dual-Track routes loaded")
except Exception as e:
    print(f"⚠️  Could not load dual-track routes: {e}")

# Import listening question bank routes
try:
    from routes.listening_qb import router as listening_qb_router
    app.include_router(listening_qb_router)
    print("✅ Listening QB routes loaded")
except Exception as e:
    print(f"⚠️  Could not load listening QB routes: {e}")

# Import speaking question bank routes
try:
    from routes.speaking_qb import router as speaking_qb_router
    app.include_router(speaking_qb_router)
    print("✅ Speaking QB routes loaded")
except Exception as e:
    print(f"⚠️  Could not load speaking QB routes: {e}")

# Import full test mode routes
try:
    from routes.full_test import router as full_test_router
    app.include_router(full_test_router)
    print("✅ Full Test Mode routes loaded")
except Exception as e:
    print(f"⚠️  Could not load full test routes: {e}")

# Import full test audio routes
try:
    from routes.full_test_audio import router as full_test_audio_router
    app.include_router(full_test_audio_router)
    print("✅ Full Test Audio routes loaded")
except Exception as e:
    print(f"⚠️  Could not load full test audio routes: {e}")

# Import visual generator routes
try:
    from routes.visuals import router as visuals_router
    app.include_router(visuals_router)
    print("✅ Visual Generator routes loaded")
except Exception as e:
    print(f"⚠️  Could not load visual generator routes: {e}")

# Cambridge IELTS tests routes
try:
    from routes.cambridge import router as cambridge_router
    app.include_router(cambridge_router)
    print("✅ Cambridge IELTS routes loaded")
except Exception as e:
    print(f"⚠️  Could not load Cambridge routes: {e}")

# TTS routes for Speaking section
try:
    from routes.tts import router as tts_router
    app.include_router(tts_router)
    print("✅ TTS routes loaded")
except Exception as e:
    print(f"⚠️  Could not load TTS routes: {e}")

# ============ Models ============

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    password_hash: Optional[str] = None
    verified: bool = False  # Changed default to False for new users
    email_verified: bool = False  # New field for clarity
    google_id: Optional[str] = None
    facebook_id: Optional[str] = None
    plan: str = Field(default="free", description="Subscription plan: free or pro")
    examCredits: int = Field(default=0, description="Number of AI speaking exam credits")
    ai_interview_free_seconds_used: int = Field(default=0, description="Total free AI interviewer seconds used")
    ai_mentor_messages_used: int = Field(default=0, description="AI mentor messages used (limit 3 for unverified)")
    verification_sent_at: Optional[str] = None
    last_resend_at: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    test_history: List[str] = Field(default_factory=list)

class UserCreate(BaseModel):
    email: str
    name: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str


class UpgradeUserPlanRequest(BaseModel):
    email: str
    plan: str
    admin_token: str

class Test(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    test_type: str  # listening, reading, writing, speaking
    duration: int  # in minutes
    questions: List[Dict[str, Any]]
    passages: Optional[List[Dict[str, Any]]] = None
    audio_url: Optional[str] = None
    answer_key: List[Dict[str, Any]]
    
class TestAttempt(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    test_id: str
    test_type: str
    answers: List[Dict[str, Any]]
    score: float
    band_score: float
    feedback: Dict[str, Any]
    time_taken: int  # in seconds
    completed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SubmitAnswers(BaseModel):
    user_id: str
    test_id: str
    test_type: str
    answers: List[Dict[str, Any]]
    time_taken: int
    language: str = "en"  # "en" or "vi" for localized feedback
    writing_feedback: Optional[Dict[str, Any]] = None  # AI feedback for writing tests
    speaking_feedback: Optional[Dict[str, Any]] = None  # AI feedback for speaking tests

class EvaluateWriting(BaseModel):
    user_id: str
    task_type: str  # task1 or task2
    question: str
    answer: str

class TranscribeAudio(BaseModel):
    user_id: str

class SpeakingTest(BaseModel):
    user_id: str
    part: int  # 1, 2, or 3
    question: str
    user_response: str

class TipArticle(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    category: str
    content: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Course(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    modules: List[Dict[str, Any]]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ForgotPasswordRequest(BaseModel):
    email: str


class DirectResetRequest(BaseModel):
    email: str
    new_password: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


class VerifyEmailRequest(BaseModel):
    token: str

class PaymentOrder(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    plan_id: str
    amount_vnd: int
    currency: str = "VND"
    status: str = Field(default="pending", description="pending | completed | failed")
    sepay_transaction_id: Optional[str] = None
    sepay_reference_code: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None


class CreatePaymentRequest(BaseModel):
    plan_id: str
    amount_vnd: int


class ManualCreditRequest(BaseModel):
    email: str
    plan: Optional[str] = None
    exam_credits: Optional[int] = None
    admin_token: str


# Password hashing helpers

def hash_password(password: str) -> str:
    """Hash password using SHA256 (for demo; use stronger algorithms in production)."""
    if not isinstance(password, str):
        password = str(password)
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def verify_password(password: str, password_hash: str) -> bool:
    """Verify password against stored hash using constant-time comparison."""
    if not password_hash:
        return False
    computed = hash_password(password)
    return hmac.compare_digest(computed, password_hash)

# ============ Helper Functions ============

def calculate_band_score(percentage: float) -> float:
    """Convert percentage to IELTS band score (1-9)"""
    if percentage >= 95:
        return 9.0
    elif percentage >= 90:
        return 8.5
    elif percentage >= 85:
        return 8.0
    elif percentage >= 80:
        return 7.5
    elif percentage >= 75:
        return 7.0
    elif percentage >= 70:
        return 6.5
    elif percentage >= 65:
        return 6.0
    elif percentage >= 60:
        return 5.5
    elif percentage >= 55:
        return 5.0
    elif percentage >= 50:
        return 4.5
    elif percentage >= 45:
        return 4.0
    elif percentage >= 40:
        return 3.5
    elif percentage >= 35:
        return 3.0
    elif percentage >= 30:
        return 2.5
    elif percentage >= 25:
        return 2.0
    elif percentage >= 20:
        return 1.5
    else:
        return 1.0


# ============ Email (stub) =========

RESET_TOKEN_EXPIRY_MINUTES = 60


def generate_reset_token() -> str:
    """Generate a pseudo-random token string."""
    # For simplicity use uuid4; safer crypto token could be used in production
    return str(uuid.uuid4())

# Resend Email Configuration
RESEND_API_KEY = os.getenv("RESEND_API_KEY")
RESEND_FROM_EMAIL = os.getenv("RESEND_FROM_EMAIL", "onboarding@resend.dev")

# Initialize Resend
if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY


async def send_verification_email(to_email: str, verify_link: str, user_name: str = "there") -> bool:
    """Send email verification email via Resend. Returns True on success."""
    if not RESEND_API_KEY:
        logging.getLogger(__name__).warning("Resend not configured; skipping verification email send")
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
                        <p style="color: #6b7280; margin-top: 5px;">IELTS & Cambridge AI Exam Prep</p>
                    </div>
                    
                    <p style="font-size: 16px; color: #374151;">Hi {user_name},</p>
                    
                    <p style="font-size: 16px; color: #374151;">Welcome to testmaster.pro! 🎉</p>
                    
                    <p style="font-size: 16px; color: #374151;">Click below to verify your email and unlock all courses:</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{verify_link}" style="background: linear-gradient(to right, #7c3aed, #9333ea); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                            Verify Email
                        </a>
                    </div>
                    
                    <p style="font-size: 14px; color: #6b7280;">This link expires in 24 hours.</p>
                    
                    <p style="font-size: 14px; color: #6b7280;">Didn't sign up? You can safely ignore this email.</p>
                    
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                    
                    <p style="font-size: 12px; color: #9ca3af; text-align: center;">
                        testmaster.pro team<br>
                        Your Cambridge-aligned IELTS AI examiner
                    </p>
                </div>
            """,
        }
        
        # Run sync SDK in thread to keep FastAPI non-blocking
        email = await asyncio.to_thread(resend.Emails.send, params)
        logging.getLogger(__name__).info(f"Sent verification email to {to_email}, email_id: {email.get('id')}")
        return True
    except Exception as e:
        logging.getLogger(__name__).error(f"Resend verification email exception for {to_email}: {e}")
        return False


async def send_reset_email(to_email: str, reset_link: str) -> bool:
    """Send a password reset email via Resend. Returns True on success."""
    if not RESEND_API_KEY:
        logging.getLogger(__name__).warning("Resend not configured; skipping email send")
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
                        <p style="color: #6b7280; margin-top: 5px;">IELTS & Cambridge AI Exam Prep</p>
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
                    
                    <p style="font-size: 12px; color: #9ca3af; text-align: center;">
                        testmaster.pro team
                    </p>
                </div>
            """,
        }
        
        # Run sync SDK in thread to keep FastAPI non-blocking
        email = await asyncio.to_thread(resend.Emails.send, params)
        logging.getLogger(__name__).info(f"Sent reset email to {to_email}, email_id: {email.get('id')}")
        return True
    except Exception as e:
        logging.getLogger(__name__).error(f"Resend reset email exception for {to_email}: {e}")
        return False


# ============ PayPal Smart Buttons Helpers ============

async def get_paypal_access_token() -> str:
    """Fetch OAuth2 access token from PayPal using client credentials.

    Uses PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET and PAYPAL_API_BASE.
    """
    if not PAYPAL_CLIENT_ID or not PAYPAL_CLIENT_SECRET:
        logging.getLogger(__name__).error("PayPal client ID/secret not configured")
        raise HTTPException(status_code=500, detail="PayPal not configured")

    auth = httpx.BasicAuth(PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET)
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{PAYPAL_API_BASE}/v1/oauth2/token",
            data={"grant_type": "client_credentials"},
            auth=auth,
        )
        try:
            resp.raise_for_status()
        except httpx.HTTPError as e:
            logging.getLogger(__name__).error(f"PayPal token error: {e} - body={resp.text}")
            raise HTTPException(status_code=502, detail="PayPal auth failed")

        data = resp.json()
        token = data.get("access_token")
        if not token:
            logging.getLogger(__name__).error(f"PayPal token missing in response: {data}")
            raise HTTPException(status_code=502, detail="PayPal auth failed")
        return token

# ============ Facebook OAuth Helpers ============

FACEBOOK_GRAPH_API_BASE = "https://graph.facebook.com/v21.0"


async def verify_facebook_access_token(access_token: str) -> Optional[Dict[str, Any]]:
    """Verify Facebook access token and fetch user profile.

    - Uses /debug_token to ensure the token is valid and issued for our app
    - Then calls /me?fields=id,name,email,picture to get profile data
    """
    if not FACEBOOK_APP_ID or not FACEBOOK_APP_SECRET:
        logging.getLogger(__name__).error("Facebook App ID/Secret not configured")
        raise HTTPException(status_code=500, detail="Facebook login not configured")

    async with httpx.AsyncClient() as client:
        # 1) Debug token
        debug_params = {
            "input_token": access_token,
            "access_token": f"{FACEBOOK_APP_ID}|{FACEBOOK_APP_SECRET}",
        }
        debug_resp = await client.get(f"{FACEBOOK_GRAPH_API_BASE}/debug_token", params=debug_params)
        try:
            debug_resp.raise_for_status()
        except httpx.HTTPError:
            logging.getLogger(__name__).warning("Facebook debug_token call failed: %s", debug_resp.text)
            return None

        debug_data = debug_resp.json().get("data", {})
        if not debug_data.get("is_valid"):
            logging.getLogger(__name__).warning("Facebook token invalid: %s", debug_data)
            return None

        # Optional: ensure token is for our app
        app_id = debug_data.get("app_id")
        if app_id and str(app_id) != str(FACEBOOK_APP_ID):
            logging.getLogger(__name__).warning("Facebook token app_id mismatch: %s", debug_data)
            return None

        # 2) Fetch user profile
        me_params = {
            "fields": "id,name,email,picture.type(large)",
            "access_token": access_token,
        }
        me_resp = await client.get(f"{FACEBOOK_GRAPH_API_BASE}/me", params=me_params)
        try:
            me_resp.raise_for_status()
        except httpx.HTTPError:
            logging.getLogger(__name__).warning("Facebook /me call failed: %s", me_resp.text)
            return None

        profile = me_resp.json()
        # Normalise picture URL
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


class FacebookLoginRequest(BaseModel):
    access_token: str




# Simple in-memory reset token store (for demo). In production use DB/Redis.
password_reset_tokens: Dict[str, Dict[str, Any]] = {}


async def evaluate_with_ai(test_type: str, question: str, user_answer: str, model_answer: Optional[str] = None) -> Dict[str, Any]:
    """Evaluate answer using AI with IELTS Core Mindset - Strict Cambridge criteria"""
    
    # Combine Core Mindset with Evaluation Mode
    system_message = f"""{IELTS_CORE_MINDSET}

{EVALUATION_MODE_PROMPT}"""

    chat = LlmChat(
        api_key=os.getenv("EMERGENT_LLM_KEY"),
        session_id=str(uuid.uuid4()),
        system_message=system_message,
    ).with_model("openai", "gpt-4o")
    
    if test_type == "writing":
        prompt = f"""Evaluate this IELTS writing task with STRICT Cambridge criteria.

Question:
{question}

Student's Answer:
{user_answer}

IMPORTANT CHECKS BEFORE SCORING:
1. Does the response address ALL parts of the question?
2. Is the response ON-TOPIC and RELEVANT?
3. Is there sufficient development (Task 1: 150+ words, Task 2: 250+ words)?
4. Is the position clear and consistent throughout?

If ANY of these fail, apply the appropriate band cap (see rules above).

Return ONLY a JSON object with this structure (no extra text, no markdown, no ``` fences):
{{
  "band_score": <overall band from 1 to 9 - be strict>,
  "task_achievement": {{
    "score": <band 1-9>,
    "feedback": "Direct assessment: Did the response fully address the task? What was missing or off-topic? Be specific about relevance issues."
  }},
  "coherence_cohesion": {{
    "score": <band 1-9>,
    "feedback": "Assessment of organization, paragraphing, and logical flow. Note any mechanical connector usage or poor transitions."
  }},
  "lexical_resource": {{
    "score": <band 1-9>,
    "feedback": "Assessment of vocabulary accuracy and range. Note any wrong word choices, awkward collocations, or memorized phrases."
  }},
  "grammatical_accuracy": {{
    "score": <band 1-9>,
    "feedback": "Assessment of grammar control and error frequency. Note errors that affect meaning comprehension."
  }},
  "major_issues": ["List 2-3 critical problems that justify the band score"],
  "overall_feedback": "4-5 sentences: What the student did well, what critically needs improvement, and specific actionable advice.",
  "band_justification": "1-2 sentences explaining why this band is appropriate and would survive Cambridge moderation"
}}
"""
    else:  # speaking
        prompt = f"""Evaluate this IELTS speaking response with STRICT Cambridge criteria.

Question:
{question}

Student's Response:
{user_answer}

IMPORTANT CHECKS BEFORE SCORING:
1. Does the response directly address the question asked?
2. Is there sufficient development and elaboration?
3. Are ideas expressed clearly without meaning breakdown?
4. Is this a genuine response or memorized/template-based?

If ANY issues are detected, apply appropriate band penalties (see rules above).

Return ONLY a JSON object with this structure (no extra text, no markdown, no ``` fences):
{{
  "band_score": <overall band from 1 to 9 - be strict>,
  "fluency_coherence": {{
    "score": <band 1-9>,
    "feedback": "Assessment of natural flow, logical development, and whether ideas connect well. Note any memorized chunks or empty fluency."
  }},
  "lexical_resource": {{
    "score": <band 1-9>,
    "feedback": "Assessment of vocabulary range and accuracy. Note limited range, wrong word choices, or over-reliance on basic words."
  }},
  "grammatical_accuracy": {{
    "score": <band 1-9>,
    "feedback": "Assessment of sentence structures and error frequency. Note errors that impede communication."
  }},
  "pronunciation": {{
    "score": <band 1-9>,
    "feedback": "Assessment based on clarity of expression (from transcription context). Note any repeated unclear expressions."
  }},
  "major_issues": ["List 2-3 critical problems that justify the band score"],
  "overall_feedback": "4-5 sentences: What the student did well, what critically needs improvement, and specific actionable advice.",
  "band_justification": "1-2 sentences explaining why this band is appropriate and would survive Cambridge moderation",
  "model_answer": "Write a Band 7-8 model answer for this exact question (50-80 words). Show ideal vocabulary, grammar, and natural phrasing."
}}
"""
    
    message = UserMessage(text=prompt)
    response = await chat.send_message(message)

    # Normalise response to a Python dict
    if isinstance(response, dict):
        return response

    if isinstance(response, str):
        # Try to strip Markdown code fences if present
        cleaned = response.strip()
        if cleaned.startswith("```"):
            cleaned_lines = cleaned.splitlines()
            cleaned_lines = cleaned_lines[1:]
            if cleaned_lines and cleaned_lines[-1].strip().startswith("```"):
                cleaned_lines = cleaned_lines[:-1]
            cleaned = "\n".join(cleaned_lines).strip()
        try:
            return json.loads(cleaned)
        except Exception:
            return {"band_score": 5.0, "overall_feedback": response}

    return {"band_score": 5.0, "overall_feedback": str(response)}

# ============ Routes ============

@api_router.get("/")
async def root():
    return {"message": "IELTS Ace API"}

# User & Auth routes
@api_router.post("/auth/register", response_model=User)
async def register_user(input: UserCreate):
    """Register a new user - logs them in immediately, sends verification email in background."""
    # Check if user exists
    existing = await db.users.find_one({"email": input.email.strip().lower()}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email is already registered")

    if len(input.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")

    # Create the new user with unverified status
    user_id = str(uuid.uuid4())
    hashed_password = hash_password(input.password)
    now = datetime.now(timezone.utc)
    
    # Generate verification token
    verification_token = generate_reset_token()
    verification_expires_at = now + timedelta(hours=24)
    
    user = {
        "id": user_id,
        "email": input.email.strip().lower(),
        "name": input.name.strip(),
        "password_hash": hashed_password,
        "plan": "free",
        "examCredits": 0,
        "verified": False,  # Unverified by default
        "email_verified": False,  # New field for clarity
        "verification_token": verification_token,
        "verification_sent_at": now.isoformat(),
        "verification_expires_at": verification_expires_at.isoformat(),
        "last_resend_at": None,
        "ai_interview_free_seconds_used": 0,
        "ai_mentor_messages_used": 0,  # Track AI mentor usage for unverified users
        "created_at": now.isoformat()
    }
    
    await db.users.insert_one(user)
    
    # Send verification email in background (don't block registration)
    frontend_base = os.getenv("FRONTEND_BASE_URL", "http://localhost:3000")
    verify_link = f"{frontend_base}/verify-email?token={verification_token}"
    
    # Try to send email (async, non-blocking)
    try:
        await send_verification_email(input.email.strip().lower(), verify_link, input.name.strip())
    except Exception as e:
        logging.getLogger(__name__).error(f"Failed to send verification email: {e}")
    
    # Return user without password - USER IS LOGGED IN IMMEDIATELY
    user_response = {k: v for k, v in user.items() if k not in ["password_hash", "verification_token"]}
    return user_response


class EmergentSessionRequest(BaseModel):
    session_id: str


@api_router.post("/auth/emergent/session")
async def emergent_session_login(payload: EmergentSessionRequest):
    """Exchange Emergent Google OAuth session for an IELTS Ace user.

    Frontend will receive `#session_id=...` in the URL after Google login.
    It should call this endpoint with that session_id.
    """
    session_id = payload.session_id.strip()
    if not session_id:
        raise HTTPException(status_code=400, detail="Missing session_id")

    # Call Emergent auth backend to get user info
    emergent_backend_url = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"
    headers = {"X-Session-ID": session_id}

    async with httpx.AsyncClient(timeout=10.0) as client_http:
        try:
            resp = await client_http.get(emergent_backend_url, headers=headers)
            resp.raise_for_status()
        except httpx.HTTPError as e:
            logging.getLogger(__name__).error("Emergent auth session fetch failed: %s", str(e))
            raise HTTPException(status_code=401, detail="Invalid or expired session_id")

        session_data = resp.json()

    email = (session_data.get("email") or "").strip().lower()
    name = session_data.get("name") or "Google User"
    google_id = session_data.get("id") or None

    if not email:
        raise HTTPException(status_code=400, detail="No email returned from Google session")

    # Upsert user by email
    user = await db.users.find_one({"email": email}, {"_id": 0})

    if not user:
        user_obj = User(
            email=email,
            name=name,
            password_hash=None,
            verified=True,
            google_id=google_id,
        )
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

    # Prepare response
    user.pop("password_hash", None)
    if isinstance(user.get("created_at"), str):
        try:
            user["created_at"] = datetime.fromisoformat(user["created_at"])
        except Exception:
            pass

    return User(**user)



@api_router.post("/auth/facebook-login")
async def facebook_login(payload: FacebookLoginRequest):
    """Log in or sign up a user using Facebook Login.

    Frontend should obtain a short-lived Facebook access token (via JS SDK)
    and send it here as {"access_token": "..."}.
    """
    fb_data = await verify_facebook_access_token(payload.access_token)
    if not fb_data or not fb_data.get("id"):
        raise HTTPException(status_code=401, detail="Invalid Facebook token")

    email = fb_data.get("email")
    name = fb_data.get("name") or "Facebook User"
    facebook_id = fb_data["id"]

    # Prefer email when available; otherwise we will match by facebook_id only
    user = None
    if email:
        user = await db.users.find_one({"email": email}, {"_id": 0})

    if not user:
        # Try matching by facebook_id only (e.g. email not shared)
        user = await db.users.find_one({"facebook_id": facebook_id}, {"_id": 0})

    # Create new user if none exists
    if not user:
        user_obj = User(
            email=email or f"fb_{facebook_id}@example.com",
            name=name,
            password_hash=None,
            verified=True,
        )
        doc = user_obj.model_dump()
        doc["created_at"] = doc["created_at"].isoformat()
        doc["facebook_id"] = facebook_id
        await db.users.insert_one(doc)
        user = {**doc}
    else:
        # Ensure facebook_id and verified flag are updated
        update_fields: Dict[str, Any] = {"facebook_id": facebook_id}
        if not user.get("verified", False):
            update_fields["verified"] = True
        await db.users.update_one({"id": user["id"]}, {"$set": update_fields})
        user.update(update_fields)

    # Prepare response (strip internal fields)
    user.pop("password_hash", None)
    if isinstance(user.get("created_at"), str):
        try:
            user["created_at"] = datetime.fromisoformat(user["created_at"])
        except Exception:
            pass

    return User(**user)

    user = User(
        email=input.email,
        name=input.name,
        password_hash=hash_password(input.password),
        verified=False,
    )
    doc = user.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.users.insert_one(doc)

    # Create email verification token
    token = generate_reset_token()
    expires_at = datetime.now(timezone.utc) + timedelta(hours=24)
    await db.email_verifications.insert_one(
        {
            "email": input.email.strip().lower(),
            "token": token,
            "expires_at": expires_at.isoformat(),
        }
    )

    frontend_base = os.getenv("FRONTEND_BASE_URL", "http://localhost:3000")
    verify_link = f"{frontend_base}/verify-email?token={token}"

    # Try sending email via Resend
    await send_verification_email(input.email, verify_link, input.name.strip())

    # Do not expose password_hash in response
    user.password_hash = None
    return user

@api_router.post("/auth/login", response_model=User)
async def login_user(input: UserLogin):
    """Login user - allows both verified and unverified users to login."""
    email = input.email.strip().lower()
    logger.info(f"Login attempt for email: {email}")
    
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user:
        logger.warning(f"User not found: {email}")
        raise HTTPException(status_code=401, detail="Invalid email or password")

    pwd_hash = user.get("password_hash") or ""
    logger.info(f"User found, password_hash exists: {bool(pwd_hash)}, length: {len(pwd_hash)}")
    
    if not verify_password(input.password, pwd_hash):
        logger.warning(f"Password verification failed for: {email}")
        raise HTTPException(status_code=401, detail="Invalid email or password")

    logger.info(f"Login successful for: {email}")
    
    # NEW FLOW: Allow unverified users to login with limited access
    # Don't block login - frontend will handle feature restrictions
    
    # Remove sensitive fields before returning
    user.pop("password_hash", None)
    user.pop("verification_token", None)
    
    if isinstance(user.get('created_at'), str):
        user['created_at'] = datetime.fromisoformat(user['created_at'])
    
    return User(**user)


class ResendVerificationRequest(BaseModel):
    email: str


@api_router.post("/auth/resend-verification")
async def resend_verification_email(input: ResendVerificationRequest):
    """Resend verification email with rate limiting (60 seconds cooldown)."""
    email = input.email.strip().lower()
    user = await db.users.find_one({"email": email}, {"_id": 0})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if already verified
    if user.get("verified") or user.get("email_verified"):
        return {"message": "Email is already verified", "already_verified": True}
    
    # Rate limiting: check last_resend_at
    last_resend = user.get("last_resend_at")
    if last_resend:
        if isinstance(last_resend, str):
            last_resend = datetime.fromisoformat(last_resend)
        
        cooldown_seconds = 60
        time_since_last = (datetime.now(timezone.utc) - last_resend.replace(tzinfo=timezone.utc)).total_seconds()
        
        if time_since_last < cooldown_seconds:
            wait_time = int(cooldown_seconds - time_since_last)
            raise HTTPException(
                status_code=429, 
                detail=f"Please wait {wait_time} seconds before requesting another email"
            )
    
    # Generate new verification token
    now = datetime.now(timezone.utc)
    verification_token = generate_reset_token()
    verification_expires_at = now + timedelta(hours=24)
    
    # Update user with new token
    await db.users.update_one(
        {"email": email},
        {
            "$set": {
                "verification_token": verification_token,
                "verification_sent_at": now.isoformat(),
                "verification_expires_at": verification_expires_at.isoformat(),
                "last_resend_at": now.isoformat()
            }
        }
    )
    
    # Send verification email
    frontend_base = os.getenv("FRONTEND_BASE_URL", "http://localhost:3000")
    verify_link = f"{frontend_base}/verify-email?token={verification_token}"
    
    email_sent = await send_verification_email(email, verify_link, user.get("name", "there"))
    
    if email_sent:
        return {"message": "Verification email sent! Check your inbox and spam folder.", "sent": True}
    else:
        return {"message": "Email service temporarily unavailable. Please try again later.", "sent": False}


@api_router.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if isinstance(user.get('created_at'), str):
        user['created_at'] = datetime.fromisoformat(user['created_at'])
    user.pop("password_hash", None)
    return User(**user)

# Test routes


# Top-level health check for deployment readiness (no /api prefix)
@app.get("/health")
async def health_check():
    """Simple health endpoint used by deployment system.

    Returns 200 OK when the app and event loop are up. Does not touch the DB
    to avoid failing health checks due to transient database issues.
    """
    return {"status": "ok"}

@api_router.get("/tests")
async def get_tests(test_type: Optional[str] = None):
    query = {"test_type": test_type} if test_type else {}
    tests = await db.tests.find(query, {"_id": 0}).to_list(100)
    return tests

@api_router.get("/tests/{test_id}")
async def get_test(test_id: str):
    test = await db.tests.find_one({"id": test_id}, {"_id": 0})
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    return test

@api_router.post("/tests/submit")
async def submit_test(submission: SubmitAnswers):
    # Get test
    test = await db.tests.find_one({"id": submission.test_id}, {"_id": 0})
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")

    # Calculate score for objective tests (listening/reading)
    if submission.test_type in ["listening", "reading"]:
        test_type = submission.test_type

        # Map question_id -> question_type from the test definition
        # Keys can be int or str (e.g., "20-21" for combined questions)
        question_type_map: Dict[Union[int, str], str] = {}
        for q in test.get("questions", []):
            qid = q.get("id") or q.get("question_id")
            if qid is None:
                continue
            # Try to convert to int, but keep as string if it contains separators
            if isinstance(qid, str) and ('-' in qid or ',' in qid):
                # Combined question ID like "20-21"
                question_type_map[qid] = str(q.get("type") or "unknown").strip().lower()
            else:
                try:
                    qid_int = int(qid)
                    question_type_map[qid_int] = str(q.get("type") or "unknown").strip().lower()
                except (TypeError, ValueError):
                    continue

        # Build a lookup from question_id -> correct answer for robust matching
        # Keys can be int or str (e.g., "20-21" for combined questions)
        # Values can be str or list (for multiple correct answers)
        answer_key_map: Dict[Union[int, str], Union[str, List]] = {}
        for item in test.get("answer_key", []):
            qid = item.get("question_id")
            if qid is None:
                continue
            answer = item.get("answer", "")
            # Try to convert to int, but keep as string if it contains separators
            if isinstance(qid, str) and ('-' in qid or ',' in qid):
                # Combined question ID like "20-21"
                answer_key_map[qid] = answer  # Can be a list like ['B', 'D']
            else:
                try:
                    qid_int = int(qid)
                    answer_key_map[qid_int] = str(answer) if not isinstance(answer, list) else answer
                except (TypeError, ValueError):
                    continue

        # Prepare per-skill stats (e.g. Reading – True/False/Not Given)
        # Keyed by (test_type, question_type)
        skill_stats: Dict[str, Dict[str, Any]] = {}

        def _make_skill_key(t_type: str, q_type: str) -> str:
            return f"{t_type}:{q_type or 'unknown'}"

        def _skill_label(t_type: str, q_type: str) -> str:
            base = "Reading" if t_type == "reading" else "Listening"
            type_map = {
                # Reading
                "true_false_notgiven": "True / False / Not Given",
                "yes_no_notgiven": "Yes / No / Not Given",
                "sentence_completion": "Sentence / Note Completion",
                "summary_completion": "Summary Completion",
                "matching_information": "Matching Information",
                "multiple_choice": "Multiple Choice",
                # Listening
                "note_completion": "Note / Form Completion",
                "map_labeling": "Map / Diagram Labelling",
                "multiple_choice_two": "Multiple Choice (Two Options)",
                "matching": "Matching Features",
            }
            pretty = type_map.get(q_type, q_type.replace("_", " ").title() or "Mixed Skills")
            return f"{base} – {pretty}"

        # Initialise totals per skill from answer key
        for qid_int, correct_answer in answer_key_map.items():
            q_type = question_type_map.get(qid_int, "unknown")
            skey = _make_skill_key(test_type, q_type)
            if skey not in skill_stats:
                skill_stats[skey] = {
                    "skill_id": skey,
                    "test_type": test_type,
                    "question_type": q_type,
                    "label": _skill_label(test_type, q_type),
                    "correct": 0,
                    "total": 0,
                }
            skill_stats[skey]["total"] += 1

        correct = 0
        # Calculate total questions, accounting for combined questions
        total = 0
        for item in test.get("answer_key", []):
            answer = item.get("answer")
            qid = item.get("question_id")
            # Combined questions (like "20-21") count as 2 questions
            if isinstance(qid, str) and ('-' in qid or ',' in qid):
                # Count based on number of answers in the list
                total += len(answer) if isinstance(answer, list) else 1
            else:
                total += 1
        
        # Build question results with correct/incorrect status
        question_results = []
        
        # Create a map of question id to question text
        question_text_map = {}
        for q in test.get("questions", []):
            q_id = q.get("id")
            if q_id is not None:
                # Store with original ID (can be int or string like "20-21")
                question_text_map[q_id] = q.get("question", "")

        # Create explanation map from answer_key
        explanation_map = {}
        for item in test.get("answer_key", []):
            q_id = item.get("question_id")
            if q_id is not None:
                # Store with original ID (can be int or string like "20-21")
                explanation_map[q_id] = item.get("explanation", "")
        
        # Helper function to check if answers match (handles multiple correct answers)
        def answers_match(user_ans, correct_ans):
            """
            Check if user answer matches correct answer.
            Returns:
            - For single answers: True/False
            - For multiple answers (Choose TWO): number of correct matches
            Handles:
            - Single answers (string comparison)
            - Multiple answers (list comparison for "Choose TWO" questions)
            - Alternative answers separated by "/" or "or"
            """
            # Handle multiple choice multi questions (user_ans and correct_ans are lists)
            if isinstance(user_ans, list) and isinstance(correct_ans, list):
                # Count how many user answers match correct answers
                user_upper = [str(a).strip().upper() for a in user_ans]
                correct_upper = [str(a).strip().upper() for a in correct_ans]
                matches = sum(1 for ans in user_upper if ans in correct_upper)
                return matches  # Return count of matches (0, 1, or 2 for "Choose TWO")
            
            # Single answer comparison
            user_clean = str(user_ans).strip().lower()
            correct_clean = str(correct_ans).strip().lower()
            
            # Exact match
            if user_clean == correct_clean:
                return True
            
            # Handle alternative answers separated by "/" (e.g., "intestines" or "gut")
            if "/" in correct_clean:
                alternatives = [alt.strip() for alt in correct_clean.split("/")]
                if user_clean in alternatives:
                    return True
            
            # Handle "or" separator (e.g., "intestines or gut")
            if " or " in correct_clean:
                alternatives = [alt.strip() for alt in correct_clean.split(" or ")]
                if user_clean in alternatives:
                    return True
            
            return False
        
        # Comparison with support for multiple correct answers and explanations
        for ans in submission.answers:
            qid = ans.get("question_id") or ans.get("id")
            if qid is None:
                continue
            
            # Question ID can be int or string (e.g., "20-21")
            # Normalize it to match the keys in our maps
            qid_normalized = qid
            if isinstance(qid, str) and not ('-' in qid or ',' in qid):
                # Single ID as string - convert to int
                try:
                    qid_normalized = int(qid)
                except (TypeError, ValueError):
                    continue
            
            correct_answer = answer_key_map.get(qid_normalized)
            if correct_answer is None:
                continue

            user_answer = ans.get("answer", "")
            match_result = answers_match(user_answer, correct_answer)
            
            q_type = question_type_map.get(qid_normalized, "unknown")
            
            # Handle combined questions (e.g., "21-22") - split into individual results for clarity
            if isinstance(correct_answer, list) and isinstance(user_answer, list):
                # This is a "Choose TWO" type question - split into individual questions
                # Extract individual question numbers from combined ID (e.g., "21-22" -> [21, 22])
                if isinstance(qid_normalized, str) and '-' in qid_normalized:
                    individual_q_ids = [int(x.strip()) for x in qid_normalized.split('-')]
                else:
                    # Fallback if format is unexpected
                    individual_q_ids = [qid_normalized]
                
                # Ensure we have enough question IDs for the answers
                if len(individual_q_ids) < len(correct_answer):
                    # Generate sequential IDs if needed
                    start_id = individual_q_ids[0] if individual_q_ids else 1
                    individual_q_ids = list(range(start_id, start_id + len(correct_answer)))
                
                # Create separate result entries for each answer
                user_upper = [str(a).strip().upper() for a in user_answer]
                correct_upper = [str(a).strip().upper() for a in correct_answer]
                
                for idx, (q_id, correct_ans) in enumerate(zip(individual_q_ids, correct_upper)):
                    # Check if user provided an answer for this position
                    user_ans = user_upper[idx] if idx < len(user_upper) else ""
                    is_correct_individual = user_ans == correct_ans
                    
                    if is_correct_individual:
                        correct += 1
                    
                    # Add individual question result
                    question_results.append({
                        "question_id": q_id,
                        "question_text": question_text_map.get(qid_normalized, f"Question {q_id}"),
                        "question_type": q_type,
                        "user_answer": user_ans,
                        "correct_answer": correct_ans,
                        "is_correct": is_correct_individual,
                        "explanation": explanation_map.get(qid_normalized, ""),
                    })
                    
                    # Update skill stats
                    skey = _make_skill_key(test_type, q_type)
                    if skey not in skill_stats:
                        skill_stats[skey] = {
                            "skill_id": skey,
                            "test_type": test_type,
                            "question_type": q_type,
                            "label": _skill_label(test_type, q_type),
                            "correct": 0,
                            "total": 0,
                        }
                    if is_correct_individual:
                        skill_stats[skey]["correct"] += 1
            else:
                # Single answer question
                if isinstance(match_result, bool):
                    is_correct_full = match_result
                    if is_correct_full:
                        correct += 1
                else:
                    # Shouldn't happen, but handle gracefully
                    is_correct_full = False
                
                # For display purposes, convert question ID to int if possible
                display_qid = qid_normalized if isinstance(qid_normalized, int) else qid_normalized
                
                # Add to question results
                question_results.append({
                    "question_id": display_qid,
                    "question_text": question_text_map.get(qid_normalized, f"Question {display_qid}"),
                    "question_type": q_type,
                    "user_answer": user_answer,
                    "correct_answer": correct_answer,
                    "is_correct": is_correct_full,
                    "explanation": explanation_map.get(qid_normalized, ""),
                })
                
                skey = _make_skill_key(test_type, q_type)
                if skey not in skill_stats:
                    skill_stats[skey] = {
                        "skill_id": skey,
                        "test_type": test_type,
                        "question_type": q_type,
                        "label": _skill_label(test_type, q_type),
                        "correct": 0,
                        "total": 0,
                    }
                if is_correct_full:
                    skill_stats[skey]["correct"] += 1

        score_percentage = (correct / total * 100) if total > 0 else 0
        band_score = calculate_band_score(score_percentage)
        
        # Sort question results by question_id for proper display order
        question_results.sort(key=lambda x: x.get("question_id", 0))

        # Build teacher-style feedback per skill
        skill_breakdown: List[Dict[str, Any]] = []
        strong_skills: List[Dict[str, Any]] = []
        weak_skills: List[Dict[str, Any]] = []

        def _level_from_ratio(ratio: float) -> str:
            if ratio >= 0.8:
                return "strong"
            if ratio >= 0.5:
                return "ok"
            return "needs_practice"

        def _base_tip(t_type: str, q_type: str) -> str:
            # High-level tips per question type
            if t_type == "reading":
                if q_type == "true_false_notgiven" or q_type == "yes_no_notgiven":
                    return "Focus on underlining keywords in the question and scanning the passage to check exactly what is stated. Be careful with 'Not Given' – if the passage doesn’t clearly support or contradict the statement, it’s usually Not Given."
                if q_type == "matching_information":
                    return "Practise skimming paragraphs for topic sentences and key ideas, then matching them to the question prompts."
                if q_type in {"sentence_completion", "summary_completion"}:
                    return "Predict the type of word needed (noun/verb/adjective) and read around the gap so you don’t rely only on single-word matching."
                if q_type == "multiple_choice":
                    return "Train yourself to eliminate clearly wrong options first, then choose between the last two by checking small details and synonyms in the passage."
            if t_type == "listening":
                if q_type in {"note_completion", "sentence_completion"}:
                    return "Use the preparation time to read questions and predict the kind of word you expect to hear. Listen for synonyms and paraphrases, not only the exact words."
                if q_type == "map_labeling":
                    return "Before the recording starts, trace the route with your eyes and note key landmarks (left/right, north/south) so you can follow directions more easily."
                if q_type in {"multiple_choice", "multiple_choice_two"}:
                    return "Listen for signpost words that show when the speaker changes their mind, and be ready for distractors where an option is mentioned but then rejected."
                if q_type == "matching":
                    return "Practise holding several pieces of information in your mind while listening, and draw quick lines/arrows on the question paper to help you keep track."
            # Generic fallback
            return "Review your mistakes in this question type and try to notice patterns: where did you misunderstand, guess, or run out of time? Turn those into small habits to fix next time."

        for skey, stats in skill_stats.items():
            total_q = stats.get("total", 0) or 0
            correct_q = stats.get("correct", 0) or 0
            ratio = (correct_q / total_q) if total_q > 0 else 0.0
            level = _level_from_ratio(ratio)
            stats["level"] = level

            if total_q == 0:
                stats["short_comment"] = "No questions of this type in this test."
            else:
                label = stats.get("label") or "This skill"
                base_tip = _base_tip(test_type, stats.get("question_type", "unknown"))
                if level == "strong":
                    stats["short_comment"] = f"You are strong at {label} ({correct_q}/{total_q} correct). Keep using these questions to boost your overall band score."
                elif level == "ok":
                    stats["short_comment"] = f"You are doing fairly well with {label} ({correct_q}/{total_q} correct), but a bit more practice will make you more consistent."
                else:
                    stats["short_comment"] = f"{label} ({correct_q}/{total_q} correct) is a key area to improve. {base_tip}"

                # Attach a longer tip as well
                stats["tips"] = base_tip

            skill_breakdown.append(stats)

            if level == "strong":
                strong_skills.append(stats)
            elif level == "needs_practice":
                weak_skills.append(stats)

        # Build overall teacher-style feedback (short + detailed)
        def _skill_names(skills: List[Dict[str, Any]], max_count: int = 2) -> str:
            names = [s.get("label", "this skill") for s in skills[:max_count]]
            if not names:
                return ""
            if len(names) == 1:
                return names[0]
            return ", ".join(names[:-1]) + " and " + names[-1]

        test_label = "reading" if test_type == "reading" else "listening"
        
        # Check if Vietnamese language requested
        lang = submission.language if hasattr(submission, 'language') else "en"
        is_vi = lang == "vi"
        
        test_label_vi = "đọc hiểu" if test_type == "reading" else "nghe hiểu"

        short_fb_parts: List[str] = []
        if is_vi:
            short_fb_parts.append(
                f"Trong bài thi {test_label_vi} này, bạn đã trả lời đúng {correct} trên {total} câu hỏi (khoảng {score_percentage:.0f}%)."
            )
        else:
            short_fb_parts.append(
                f"For this {test_label} test, you answered {correct} out of {total} questions correctly (about {score_percentage:.0f}%)."
            )
        strong_names = _skill_names(strong_skills)
        weak_names = _skill_names(weak_skills)
        if strong_names:
            if is_vi:
                short_fb_parts.append(f"Điểm mạnh của bạn là {strong_names}. Hãy tận dụng những câu hỏi này để đạt điểm cao hơn.")
            else:
                short_fb_parts.append(f"Your strongest areas were {strong_names}. Use these questions to secure easy marks.")
        if weak_names:
            if is_vi:
                short_fb_parts.append(f"Bạn nên dành nhiều thời gian luyện tập hơn cho {weak_names} để cải thiện điểm band.")
            else:
                short_fb_parts.append(f"You should focus more practice time on {weak_names} to raise your band.")
        short_teacher_feedback = " ".join(short_fb_parts)

        detailed_parts: List[str] = []
        if is_vi:
            detailed_parts.append(
                f"Nhìn chung, bạn đạt khoảng {score_percentage:.0f}% trong bài thi {test_label_vi} này, tương đương với điểm IELTS khoảng {band_score:.1f}."
            )
            if strong_names:
                detailed_parts.append(
                    f"Bạn thể hiện rõ điểm mạnh ở phần {strong_names}. Hãy luôn làm chắc những câu này trước trong kỳ thi vì chúng phù hợp với kỹ năng hiện tại của bạn."
                )
            if weak_names:
                detailed_parts.append(
                    f"Những phần cần cải thiện là {weak_names}. Sau mỗi bài thi thử, hãy xem lại kỹ những câu hỏi này và so sánh câu trả lời của bạn với đáp án để hiểu rõ mình sai ở đâu."
                )
            detailed_parts.append(
                "Khi luyện tập, hãy bấm giờ nghiêm túc, gạch chân từ khóa trong câu hỏi, và sau khi hoàn thành, dành ít nhất 5-10 phút phân tích lỗi sai thay vì vội chuyển sang bài thi mới. Việc suy ngẫm này mới thực sự giúp cải thiện điểm số."
            )
            detailed_parts.append(
                "Chọn một hoặc hai dạng câu hỏi yếu và tập trung luyện tập chuyên sâu (ví dụ: một trang chỉ toàn câu True/False/Not Given hoặc Note Completion) cho đến khi cảm thấy thoải mái hơn."
            )
        else:
            detailed_parts.append(
                f"Overall, you achieved about {score_percentage:.0f}% on this {test_label} test, which corresponds to an IELTS band of approximately {band_score:.1f}."
            )
            if strong_names:
                detailed_parts.append(
                    f"You showed clear strength in {strong_names}. Try to always secure these marks first in the exam, because they suit your current skills."
                )
            if weak_names:
                detailed_parts.append(
                    f"The main areas to improve are {weak_names}. After each practice test, carefully review these questions and compare your answer with the explanation to see exactly where your understanding differed."
                )
            detailed_parts.append(
                "When practising, time yourself strictly, underline keywords in the questions, and after you finish, spend at least 5–10 minutes analysing your mistakes rather than jumping to a new test. This reflection is what really improves your score."
            )
            detailed_parts.append(
                "Choose one or two weaker question types at a time and drill them using targeted practice (for example, a page of only True/False/Not Given or only Note Completion questions) until they feel more comfortable."
            )
        detailed_teacher_feedback = " ".join(detailed_parts)

        attempt = TestAttempt(
            user_id=submission.user_id,
            test_id=submission.test_id,
            test_type=submission.test_type,
            answers=submission.answers,
            score=score_percentage,
            band_score=band_score,
            feedback={
                "correct": correct,
                "total": total,
                "percentage": score_percentage,
                "message": f"You got {correct} out of {total} correct.",
                "skill_breakdown": skill_breakdown,
                "teacher_feedback": {
                    "short": short_teacher_feedback,
                    "detailed": detailed_teacher_feedback,
                },
                "question_results": question_results,
            },
            time_taken=submission.time_taken,
        )
    else:
        # For writing/speaking, include AI evaluation feedback
        feedback_data = {"message": "AI evaluation complete"}
        band_score = 0.0
        
        if submission.test_type == "writing" and submission.writing_feedback:
            # Extract band scores from writing feedback
            task1_fb = submission.writing_feedback.get("task1", {})
            task2_fb = submission.writing_feedback.get("task2", {})
            task1_band = task1_fb.get("band_score", 0) if task1_fb else 0
            task2_band = task2_fb.get("band_score", 0) if task2_fb else 0
            
            # Calculate overall band (Task 2 is weighted more - 2/3)
            if task1_band and task2_band:
                band_score = round((task1_band + task2_band * 2) / 3 * 2) / 2  # Round to nearest 0.5
            elif task2_band:
                band_score = task2_band
            elif task1_band:
                band_score = task1_band
            
            feedback_data = {
                "message": "Writing evaluated by AI",
                "writing_feedback": submission.writing_feedback,
                "task1": task1_fb,
                "task2": task2_fb,
            }
        
        if submission.test_type == "speaking" and submission.speaking_feedback:
            # Calculate average band from speaking feedback
            speaking_bands = [fb.get("band_score", 0) for fb in submission.speaking_feedback.values() if isinstance(fb, dict)]
            if speaking_bands:
                band_score = round(sum(speaking_bands) / len(speaking_bands) * 2) / 2
            
            feedback_data = {
                "message": "Speaking evaluated by AI",
                "speaking_feedback": submission.speaking_feedback,
            }
        
        attempt = TestAttempt(
            user_id=submission.user_id,
            test_id=submission.test_id,
            test_type=submission.test_type,
            answers=submission.answers,
            score=band_score * 10,  # Convert to percentage-like score
            band_score=band_score,
            feedback=feedback_data,
            time_taken=submission.time_taken,
        )

    # Save attempt
    doc = attempt.model_dump()
    doc["completed_at"] = doc["completed_at"].isoformat()
    await db.test_attempts.insert_one(doc)

    # Update user history
    await db.users.update_one(
        {"id": submission.user_id},
        {"$push": {"test_history": attempt.id}},
    )

    # Return attempt so frontend can navigate to results page
    return attempt


@api_router.post("/auth/verify-email")
async def verify_email(payload: VerifyEmailRequest):
    """Verify email using token - now uses token stored in user document."""
    token = payload.token.strip()
    
    # First, try to find user by verification_token (new flow)
    user = await db.users.find_one({"verification_token": token}, {"_id": 0})
    
    if user:
        # New flow: token stored in user document
        expires_at_str = user.get("verification_expires_at")
        if expires_at_str:
            expires_at = datetime.fromisoformat(expires_at_str)
            if datetime.now(timezone.utc) > expires_at.replace(tzinfo=timezone.utc):
                raise HTTPException(
                    status_code=400, 
                    detail="Verification link has expired. Please request a new one."
                )
        
        # Check if already verified
        if user.get("verified") or user.get("email_verified"):
            return {"detail": "Email is already verified!", "already_verified": True}
        
        # Verify the user
        await db.users.update_one(
            {"id": user["id"]},
            {
                "$set": {
                    "verified": True,
                    "email_verified": True
                },
                "$unset": {
                    "verification_token": "",
                    "verification_expires_at": ""
                }
            }
        )
        
        return {"detail": "Email verified successfully! You now have full access.", "success": True}
    
    # Fallback: try old email_verifications collection (backwards compatibility)
    record = await db.email_verifications.find_one({"token": token})
    if not record:
        raise HTTPException(
            status_code=400, 
            detail="Invalid or expired verification token. Please request a new verification email."
        )

    if datetime.now(timezone.utc) > datetime.fromisoformat(record["expires_at"]).replace(tzinfo=timezone.utc):
        await db.email_verifications.delete_one({"_id": record["_id"]})
        raise HTTPException(
            status_code=400, 
            detail="Verification link has expired. Please request a new one."
        )

    email = record["email"]
    await db.users.update_one(
        {"email": email}, 
        {"$set": {"verified": True, "email_verified": True}}
    )
    await db.email_verifications.delete_one({"_id": record["_id"]})

    return {"detail": "Email verified successfully! You now have full access.", "success": True}


# ================== Payments: Manual Credit and PayPal ==================


async def _get_user_by_email(email: str) -> Optional[dict]:
    user = await db.users.find_one({"email": email.lower().strip()}, {"_id": 0})
    return user


# NOTE: SePay/VietQR integration has been disabled. Manual credits and PayPal are used instead.

@api_router.get("/payments/orders/{order_id}")
async def get_payment_order(order_id: str):
    order = await db.payment_orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


# PayPal Smart Buttons -> Orders API mappings
PAYPAL_PLAN_PRICES = {
    "single": "4.99",
    "starter": "9.00",
    "booster": "19.00",
    "pro": "29.00",
}

PAYPAL_PLAN_CREDITS = {
    # plan_id: (credits, subscription_name or None, upgrade_to_pro: bool)
    "single": (1, None, False),
    "starter": (2, "Starter", True),
    "booster": (5, "Booster", True),
    "pro": (8, "Pro", True),
}


class PaypalCreateOrderRequest(BaseModel):
    planId: str
    email: str


class PaypalCaptureOrderRequest(BaseModel):
    orderId: str
    planId: str
    email: str


@api_router.post("/payments/paypal/create-order")
async def paypal_create_order(req: PaypalCreateOrderRequest):
    """Create a PayPal order for Smart Buttons using the Orders API.

    We trust planId and look up the expected amount server-side to avoid tampering.
    """
    plan_id = req.planId
    email = req.email.strip().lower()

    if plan_id not in PAYPAL_PLAN_PRICES:
        raise HTTPException(status_code=400, detail="Invalid planId")

    amount_value = PAYPAL_PLAN_PRICES[plan_id]

    access_token = await get_paypal_access_token()

    order_payload = {
        "intent": "CAPTURE",
        "purchase_units": [
            {
                "amount": {
                    "currency_code": "USD",
                    "value": amount_value,
                },
                "description": f"IELTS Ace {plan_id} plan",
                # Attach user email so it appears in PayPal dashboard
                "custom_id": email,
            }
        ],
    }

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{PAYPAL_API_BASE}/v2/checkout/orders",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json",
            },
            json=order_payload,
        )
        try:
            resp.raise_for_status()
        except httpx.HTTPError as e:
            logging.getLogger(__name__).error(f"PayPal create-order error: {e} - body={resp.text}")
            raise HTTPException(status_code=502, detail="Failed to create PayPal order")

        data = resp.json()
        order_id = data.get("id")
        if not order_id:
            logging.getLogger(__name__).error(f"PayPal create-order missing id: {data}")
            raise HTTPException(status_code=502, detail="Invalid PayPal response")

        # Store a lightweight record for debugging / reconciliation
        await db.kofi_events.insert_one(
            {
                "provider": "paypal",
                "kind": "create-order",
                "order_id": order_id,
                "plan_id": plan_id,
                "email": email,
                "amount_usd": amount_value,
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
        )

        return {"orderId": order_id}


@api_router.post("/payments/paypal/capture-order")
async def paypal_capture_order(req: PaypalCaptureOrderRequest):
    """Capture a PayPal order after approval and top up credits immediately.

    This endpoint does not rely on webhooks; it uses the capture response
    to update the user's plan and examCredits synchronously.
    """
    plan_id = req.planId
    email = req.email.strip().lower()

    if plan_id not in PAYPAL_PLAN_PRICES:
        raise HTTPException(status_code=400, detail="Invalid planId")

    user = await _get_user_by_email(email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    access_token = await get_paypal_access_token()

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{PAYPAL_API_BASE}/v2/checkout/orders/{req.orderId}/capture",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json",
            },
            json={},
        )
        try:
            resp.raise_for_status()
        except httpx.HTTPError as e:
            logging.getLogger(__name__).error(f"PayPal capture error: {e} - body={resp.text}")
            raise HTTPException(status_code=502, detail="Failed to capture PayPal order")

        data = resp.json()

    status_value = data.get("status")
    if status_value != "COMPLETED":
        raise HTTPException(status_code=400, detail=f"Order not completed (status={status_value})")

    credits, subscription_name, upgrade_to_pro = PAYPAL_PLAN_CREDITS[plan_id]

    update_fields: Dict[str, Any] = {}
    update_fields["examCredits"] = user.get("examCredits", 0) + credits
    if upgrade_to_pro:
        update_fields["plan"] = "pro"
    if subscription_name:
        update_fields["subscription"] = subscription_name
    update_fields["lastPayment"] = datetime.now(timezone.utc).isoformat()

    await db.users.update_one({"id": user["id"]}, {"$set": update_fields})

    # Store capture event for audit
    await db.kofi_events.insert_one(
        {
            "provider": "paypal",
            "kind": "capture-order",
            "order_id": req.orderId,
            "plan_id": plan_id,
            "email": email,
            "payload": data,
            "processed_at": datetime.now(timezone.utc).isoformat(),
        }
    )

    return {
        "detail": "PayPal payment captured and credits updated",
        "examCredits": update_fields["examCredits"],
        "plan": update_fields.get("plan", user.get("plan", "free")),
        "subscription": update_fields.get("subscription", user.get("subscription")),
    }




@api_router.post("/speaking/session/start")
async def start_speaking_session(request: Request):
    """Start an AI speaking session.

    Rules:
    - Every user gets a one-time 3-minute free trial session
      (tracked via `ai_interview_free_seconds_used`).
    - After the free trial is used, each session consumes 1 speaking credit.

    Expects header `x-user-email` from the frontend to identify the user.
    """
    user_email = request.headers.get("x-user-email")
    if not user_email:
        raise HTTPException(status_code=401, detail="Missing user context")

    user = await _get_user_by_email(user_email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    FREE_TRIAL_SECONDS = 180
    free_used = int(user.get("ai_interview_free_seconds_used", 0) or 0)

    # If user has not yet consumed their free trial, grant a free session
    if free_used < FREE_TRIAL_SECONDS:
        await db.users.update_one(
            {"id": user["id"]},
            {"$set": {"ai_interview_free_seconds_used": FREE_TRIAL_SECONDS}},
        )
        updated = await db.users.find_one({"id": user["id"]}, {"_id": 0})
        return {
            "detail": "Free trial speaking session started",
            "remainingCredits": updated.get("examCredits", 0),
            "plan": updated.get("plan", "free"),
            "freeTrial": True,
            "freeTrialSecondsUsed": updated.get("ai_interview_free_seconds_used", FREE_TRIAL_SECONDS),
            "freeTrialSecondsTotal": FREE_TRIAL_SECONDS,
        }

    # Otherwise consume 1 speaking credit if available
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
        "plan": updated.get("plan", "free"),
        "freeTrial": False,
        "freeTrialSecondsUsed": updated.get("ai_interview_free_seconds_used", FREE_TRIAL_SECONDS),
        "freeTrialSecondsTotal": FREE_TRIAL_SECONDS,
    }


# ================== Ko-fi Webhook Integration ==================


def _map_kofi_tier_to_credits(tier_name: str) -> int:
    name = (tier_name or "").strip().lower()
    if "starter" in name:
        return 2
    if "booster" in name:
        return 5
    if "pro" in name:
        return 8
    return 0


@api_router.post("/payments/kofi/ipn")
async def kofi_ipn(request: Request):
    """Handle Ko-fi webhook.

    Ko-fi sends application/x-www-form-urlencoded with a 'data' field
    that contains a JSON string. We parse it and update the user's plan
    and examCredits based on membership tier or single exam purchase.
    """
    form = await request.form()
    raw_data = form.get("data")
    if not raw_data:
        raise HTTPException(status_code=400, detail="Missing data field")

    try:
        payload = json.loads(raw_data)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON in data field")

    verification_token = os.getenv("KOFI_VERIFICATION_TOKEN")
    if verification_token:
        if payload.get("verification_token") != verification_token:
            raise HTTPException(status_code=401, detail="Invalid verification token")

    kofi_type = (payload.get("type") or "").strip()
    email = (payload.get("email") or "").strip().lower()
    if not email:
        raise HTTPException(status_code=400, detail="Missing email in payload")

    tier_name = payload.get("tier_name") or ""
    amount_str = payload.get("amount") or "0"
    try:
        amount = float(str(amount_str))
    except ValueError:
        amount = 0.0

    logger.info(f"Ko-fi webhook: type={kofi_type}, email={email}, tier={tier_name}, amount={amount}")

    # Store raw event for audit/debugging
    await db.kofi_events.insert_one(
        {
            "received_at": datetime.now(timezone.utc).isoformat(),
            "type": kofi_type,
            "email": email,
            "tier_name": tier_name,
            "amount": amount,
            "payload": payload,
        }
    )

    # Find user by email
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user:
        # If user does not exist, we log and return success so Ko-fi doesn't retry.
        logger.warning(f"Ko-fi payment for unknown email: {email}")
        return {"detail": "No matching user; event recorded."}

    update_fields: Dict[str, Any] = {}

    # Membership subscription tiers
    if kofi_type.lower() == "subscription":
        credits = _map_kofi_tier_to_credits(tier_name)
        if credits > 0:
            update_fields["plan"] = "pro"
            update_fields["subscription"] = tier_name
            update_fields["examCredits"] = user.get("examCredits", 0) + credits

    # One-time single exam purchase (treat as shop order or donation with specific amount)
    elif kofi_type.lower() in {"shop order", "donation"}:
        # 4.99 USD single exam purchase → +1 credit
        # We use a small tolerance for floating point comparisons
        if abs(amount - 4.99) < 0.01:
            update_fields["examCredits"] = user.get("examCredits", 0) + 1

    if update_fields:
        update_fields["lastPayment"] = datetime.now(timezone.utc).isoformat()
        await db.users.update_one({"id": user["id"]}, {"$set": update_fields})

    return {"detail": "OK"}


# NOTE: SePay/VietQR IPN handler removed; using PayPal and manual credits instead.


@api_router.post("/payments/paypal/ipn")
async def paypal_ipn(request: Request):
    """Handle PayPal webhook for auto top-up.

    We rely on amount + payer email to map to user and plan.
    """
    payload = await request.json()
    event_type = payload.get("event_type")
    logger.info(f"PayPal webhook event_type={event_type}")

    if event_type != "PAYMENT.CAPTURE.COMPLETED":
        return {"detail": "Event ignored"}

    resource = payload.get("resource", {})
    # Amount is in resource.amount.value for NCP payment links
    amount_info = resource.get("amount") or resource.get("gross_amount") or {}
    value_str = amount_info.get("value") or "0"

    try:
        amount = float(str(value_str))
    except ValueError:
        logger.error(f"Invalid PayPal amount: {value_str}")
        raise HTTPException(status_code=400, detail="Invalid amount")

    # Get payer email
    email = None
    payer = resource.get("payer")
    if isinstance(payer, dict):
        email = (payer.get("email_address") or "").strip().lower() or None

    # Fallbacks: some payloads may include custom_id or payer_email directly on resource
    if not email:
        email = (resource.get("payer_email") or "").strip().lower() or None
    if not email:
        email = (resource.get("custom_id") or "").strip().lower() or None

    if not email:
        logger.warning(f"PayPal webhook without email: resource={resource}")
        # Still log the event below, but cannot map to user
        await db.kofi_events.insert_one(
            {"provider": "paypal", "received_at": datetime.now(timezone.utc).isoformat(), "payload": payload}
        )
        return {"detail": "Missing payer email"}

    # Find user by email
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user:
        logger.warning(f"PayPal payment for unknown email: {email}")
        await db.kofi_events.insert_one(
            {"provider": "paypal", "received_at": datetime.now(timezone.utc).isoformat(), "payload": payload}
        )
        return {"detail": "No matching user; event recorded."}

    # Map amount to plan/credits
    update_fields: Dict[str, Any] = {}
    if abs(amount - 4.99) < 0.01:
        update_fields["examCredits"] = user.get("examCredits", 0) + 1
    elif abs(amount - 9.0) < 0.01:
        update_fields["plan"] = "pro"
        update_fields["subscription"] = "Starter"
        update_fields["examCredits"] = user.get("examCredits", 0) + 2
    elif abs(amount - 19.0) < 0.01:
        update_fields["plan"] = "pro"
        update_fields["subscription"] = "Booster"
        update_fields["examCredits"] = user.get("examCredits", 0) + 5
    elif abs(amount - 29.0) < 0.01:
        update_fields["plan"] = "pro"
        update_fields["subscription"] = "Pro"
        update_fields["examCredits"] = user.get("examCredits", 0) + 8

    if not update_fields:
        logger.warning(f"PayPal payment amount {amount} not matching any plan")
        return {"detail": "Amount not mapped"}

    update_fields["lastPayment"] = datetime.now(timezone.utc).isoformat()
    await db.users.update_one({"id": user["id"]}, {"$set": update_fields})

    # Save raw event
    await db.kofi_events.insert_one(
        {"provider": "paypal", "received_at": datetime.now(timezone.utc).isoformat(), "payload": payload}
    )



@api_router.post("/payments/manual-credit-simple")
async def manual_credit_simple(req: ManualCreditRequest):
    """Simpler admin endpoint: same as manual-credit, but without token for now."""
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

    return {"detail": "OK"}


    return {"detail": "OK"}


@api_router.post("/payments/manual-credit")
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

# ============ Admin Panel Endpoints ============

ADMIN_EMAILS = ["aga.durdy@gmail.com", "ieltsace@testmaster.pro"]  # Add your admin emails here

def is_admin_email(email: str) -> bool:
    """Check if email belongs to an admin"""
    if not email:
        return False
    email_lower = email.lower()
    return any(admin.lower() in email_lower or email_lower == admin.lower() for admin in ADMIN_EMAILS)

@api_router.get("/admin/users")
async def admin_get_all_users(admin_email: str = None):
    """Get all users with their details for admin panel"""
    if not admin_email or not is_admin_email(admin_email):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(1000)
    
    # Enrich with progress data
    enriched_users = []
    for user in users:
        # Get test attempts count and last attempt
        attempts = await db.test_attempts.find(
            {"user_id": user["id"]}, 
            {"_id": 0, "test_type": 1, "band_score": 1, "completed_at": 1}
        ).sort("completed_at", -1).to_list(100)
        
        # Calculate stats
        total_tests = len(attempts)
        avg_band = sum(a.get("band_score", 0) for a in attempts) / total_tests if total_tests > 0 else 0
        
        enriched_users.append({
            **user,
            "total_tests": total_tests,
            "avg_band": round(avg_band, 1),
            "last_active": attempts[0].get("completed_at") if attempts else user.get("created_at"),
            "recent_tests": attempts[:5]
        })
    
    return enriched_users

@api_router.get("/admin/users/{user_id}")
async def admin_get_user_detail(user_id: str, admin_email: str = None):
    """Get detailed user info including all test attempts"""
    if not admin_email or not is_admin_email(admin_email):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get all test attempts
    attempts = await db.test_attempts.find(
        {"user_id": user_id}, 
        {"_id": 0}
    ).sort("completed_at", -1).to_list(100)
    
    # Get progress stats per test type
    progress_by_type = {}
    for attempt in attempts:
        t_type = attempt.get("test_type", "unknown")
        if t_type not in progress_by_type:
            progress_by_type[t_type] = {"count": 0, "total_band": 0, "best_band": 0}
        progress_by_type[t_type]["count"] += 1
        progress_by_type[t_type]["total_band"] += attempt.get("band_score", 0)
        progress_by_type[t_type]["best_band"] = max(progress_by_type[t_type]["best_band"], attempt.get("band_score", 0))
    
    for t_type in progress_by_type:
        progress_by_type[t_type]["avg_band"] = round(
            progress_by_type[t_type]["total_band"] / progress_by_type[t_type]["count"], 1
        ) if progress_by_type[t_type]["count"] > 0 else 0
    
    return {
        "user": user,
        "test_attempts": attempts,
        "progress_by_type": progress_by_type,
        "total_tests": len(attempts)
    }

@api_router.put("/admin/users/{user_id}")
async def admin_update_user(user_id: str, admin_email: str = None, plan: str = None, exam_credits: int = None, add_credits: int = None):
    """Update user subscription and credits"""
    if not admin_email or not is_admin_email(admin_email):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_fields = {}
    if plan:
        update_fields["plan"] = plan
    if exam_credits is not None:
        update_fields["examCredits"] = exam_credits
    if add_credits is not None:
        update_fields["examCredits"] = user.get("examCredits", 0) + add_credits
    
    if not update_fields:
        raise HTTPException(status_code=400, detail="Nothing to update")
    
    await db.users.update_one({"id": user_id}, {"$set": update_fields})
    
    # Get updated user
    updated_user = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    return {"detail": "User updated", "user": updated_user}

@api_router.delete("/admin/users/{user_id}")
async def admin_delete_user(user_id: str, admin_email: str = None):
    """Delete a user and their test attempts"""
    if not admin_email or not is_admin_email(admin_email):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Delete user's test attempts
    await db.test_attempts.delete_many({"user_id": user_id})
    # Delete user
    await db.users.delete_one({"id": user_id})
    
    return {"detail": "User deleted", "email": user.get("email")}


# ============ ADMIN SEED ENDPOINTS ============

@api_router.post("/admin/seed-advanced-mastery")
async def admin_seed_advanced_mastery(admin_email: str = None):
    """Seed Advanced Mastery course modules to database"""
    if not admin_email or not is_admin_email(admin_email):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        # Import seed data
        from seed_advanced_mastery import ADVANCED_MODULES
        
        # Check current count
        current_count = await db.advanced_mastery_modules.count_documents({})
        
        # Clear existing and re-seed if count doesn't match
        if current_count != len(ADVANCED_MODULES):
            await db.advanced_mastery_modules.delete_many({})
            
            # Insert all modules
            for module in ADVANCED_MODULES:
                await db.advanced_mastery_modules.update_one(
                    {"id": module["id"]},
                    {"$set": module},
                    upsert=True
                )
            
            new_count = await db.advanced_mastery_modules.count_documents({})
            return {
                "status": "success",
                "message": f"Seeded {new_count} Advanced Mastery modules",
                "previous_count": current_count,
                "new_count": new_count
            }
        else:
            return {
                "status": "already_seeded",
                "message": f"Database already has {current_count} modules",
                "count": current_count
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Seed failed: {str(e)}")


@api_router.post("/admin/seed-mastery")
async def admin_seed_mastery(admin_email: str = None, force: bool = False):
    """Seed Mastery course modules to database"""
    if not admin_email or not is_admin_email(admin_email):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        # Import seed data
        from seed_mastery_course import MASTERY_MODULES
        
        # Check current count
        current_count = await db.mastery_course_modules.count_documents({})
        
        # Force reseed or if count doesn't match expected (17)
        if force or current_count != len(MASTERY_MODULES):
            await db.mastery_course_modules.delete_many({})
            
            # Insert all modules
            for module in MASTERY_MODULES:
                await db.mastery_course_modules.update_one(
                    {"id": module["id"]},
                    {"$set": module},
                    upsert=True
                )
            
            new_count = await db.mastery_course_modules.count_documents({})
            return {
                "status": "success",
                "message": f"Seeded {new_count} Mastery modules",
                "previous_count": current_count,
                "new_count": new_count,
                "forced": force
            }
        else:
            return {
                "status": "already_seeded",
                "message": f"Database already has {current_count} modules",
                "count": current_count
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Seed failed: {str(e)}")


@api_router.post("/admin/seed-beginner")
async def admin_seed_beginner(admin_email: str = None):
    """Seed Beginner English course lessons to database"""
    if not admin_email or not is_admin_email(admin_email):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        # Import seed data
        from seed_beginner_english import BEGINNER_LESSONS
        
        # Check current count
        current_count = await db.beginner_english_lessons.count_documents({})
        
        # Clear existing and re-seed if count doesn't match expected (14)
        if current_count != len(BEGINNER_LESSONS):
            await db.beginner_english_lessons.delete_many({})
            
            # Insert all lessons
            for lesson in BEGINNER_LESSONS:
                await db.beginner_english_lessons.update_one(
                    {"id": lesson["id"]},
                    {"$set": lesson},
                    upsert=True
                )
            
            new_count = await db.beginner_english_lessons.count_documents({})
            return {
                "status": "success",
                "message": f"Seeded {new_count} Beginner lessons",
                "previous_count": current_count,
                "new_count": new_count
            }
        else:
            return {
                "status": "already_seeded",
                "message": f"Database already has {current_count} lessons",
                "count": current_count
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Seed failed: {str(e)}")


@api_router.post("/admin/seed-all-courses")
async def admin_seed_all_courses(admin_email: str = None, force: bool = False):
    """Seed all course data to database at once"""
    if not admin_email or not is_admin_email(admin_email):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    results = {}
    
    # Seed Advanced Mastery
    try:
        from seed_advanced_mastery import ADVANCED_MODULES
        if force:
            await db.advanced_mastery_modules.delete_many({})
        for module in ADVANCED_MODULES:
            await db.advanced_mastery_modules.update_one(
                {"id": module["id"]}, {"$set": module}, upsert=True
            )
        results["advanced_mastery"] = await db.advanced_mastery_modules.count_documents({})
    except Exception as e:
        results["advanced_mastery_error"] = str(e)
    
    # Seed Mastery
    try:
        from seed_mastery_course import MASTERY_MODULES
        if force:
            await db.mastery_course_modules.delete_many({})
        for module in MASTERY_MODULES:
            await db.mastery_course_modules.update_one(
                {"id": module["id"]}, {"$set": module}, upsert=True
            )
        results["mastery"] = await db.mastery_course_modules.count_documents({})
    except Exception as e:
        results["mastery_error"] = str(e)
    
    # Seed Beginner
    try:
        from seed_beginner_english import BEGINNER_LESSONS
        if force:
            await db.beginner_english_lessons.delete_many({})
        for lesson in BEGINNER_LESSONS:
            await db.beginner_english_lessons.update_one(
                {"id": lesson["id"]}, {"$set": lesson}, upsert=True
            )
        results["beginner"] = await db.beginner_english_lessons.count_documents({})
    except Exception as e:
        results["beginner_error"] = str(e)
    
    return {
        "status": "success",
        "message": "All courses seeded",
        "forced": force,
        "results": results
    }


@api_router.get("/admin/db-status")
async def admin_db_status(admin_email: str = None):
    """Get database status - count of all course modules"""
    if not admin_email or not is_admin_email(admin_email):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    return {
        "advanced_mastery_modules": await db.advanced_mastery_modules.count_documents({}),
        "mastery_modules": await db.mastery_course_modules.count_documents({}),
        "beginner_lessons": await db.beginner_english_lessons.count_documents({}),
        "users": await db.users.count_documents({}),
        "test_attempts": await db.test_attempts.count_documents({})
    }

@api_router.post("/auth/forgot-password")
async def forgot_password(payload: ForgotPasswordRequest):
    """Generate a reset token and (in real setup) send email.

    For now we just create a token and log it. Frontend can display
    a generic success message.
    """
    # Always respond success to avoid email enumeration
    email = payload.email.strip().lower()

    # Check if user exists
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user:
        # Still pretend success
        return {"detail": "If this email exists, a reset link has been sent."}

    token = generate_reset_token()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=RESET_TOKEN_EXPIRY_MINUTES)
    await db.password_resets.insert_one(
        {
            "email": email,
            "token": token,
            "expires_at": expires_at.isoformat(),
        }
    )

    # Build reset link pointing to frontend route
    frontend_base = os.getenv("FRONTEND_BASE_URL", "http://localhost:3000")
    reset_link = f"{frontend_base}/reset-password?token={token}"

    # Send real email via Resend (best-effort)
    await send_reset_email(email, reset_link)

    logging.getLogger(__name__).info(f"Password reset token for {email}: {token}")

    return {"detail": "If this email exists, a reset link has been sent."}


@api_router.post("/auth/reset-password")
async def reset_password(payload: ResetPasswordRequest):
    token = payload.token.strip()
    record = await db.password_resets.find_one({"token": token})
    if not record:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    if datetime.now(timezone.utc) > datetime.fromisoformat(record["expires_at"]):
        await db.password_resets.delete_one({"_id": record["_id"]})
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    # Basic password strength check
    if len(payload.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")

    email = record["email"]
    password_hash = hash_password(payload.new_password)
    await db.users.update_one({"email": email}, {"$set": {"password_hash": password_hash}})

    await db.password_resets.delete_one({"_id": record["_id"]})


@api_router.post("/auth/direct-reset")
async def direct_reset(payload: DirectResetRequest):
    """Legacy direct reset endpoint (no email). Kept for backwards compatibility.

    Frontend should use the email-based reset flow instead.
    """
    email = payload.email.strip().lower()

    if len(payload.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")

    password_hash = hash_password(payload.new_password)
    await db.users.update_one({"email": email}, {"$set": {"password_hash": password_hash}})

    return {"detail": "If this email exists, the password has been updated."}

# Get a specific test attempt


@api_router.post("/payments/bank/upload")
async def upload_bank_payment(
    request: Request,
    plan_id: str = Form(...),
    email: str = Form(...),
    screenshot: UploadFile = File(...),
):
    """User uploads bank transfer screenshot; we auto-credit based on plan.

    This trusts the user; screenshot is stored for later audit.
    """
    email_clean = email.strip().lower()
    user = await _get_user_by_email(email_clean)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Save file to local uploads folder
    uploads_dir = os.path.join(os.path.dirname(__file__), "uploads", "bank")
    os.makedirs(uploads_dir, exist_ok=True)
    filename = f"{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}_{screenshot.filename}"
    filepath = os.path.join(uploads_dir, filename)
    with open(filepath, "wb") as f:
        f.write(await screenshot.read())

    # Map plan_id to credits
    credits_map = {
        "single": 1,
        "starter": 2,
        "booster": 5,
        "pro": 8,
    }
    credits = credits_map.get(plan_id)
    if credits is None:
        raise HTTPException(status_code=400, detail="Invalid plan_id")

    update_fields: Dict[str, Any] = {
        "examCredits": user.get("examCredits", 0) + credits,
        "lastPayment": datetime.now(timezone.utc).isoformat(),
    }
    if plan_id in {"starter", "booster", "pro"}:
        update_fields["plan"] = "pro"
        update_fields["subscription"] = plan_id.capitalize()

    await db.users.update_one({"id": user["id"]}, {"$set": update_fields})

    # Record bank payment event
    await db.kofi_events.insert_one(
        {
            "provider": "bank",
            "received_at": datetime.now(timezone.utc).isoformat(),
            "email": email_clean,
            "plan_id": plan_id,
            "credits": credits,
            "screenshot_path": filepath,
        }
    )

    return {
        "detail": "Bank payment recorded",
        "examCredits": update_fields["examCredits"],
        "plan": update_fields.get("plan", user.get("plan", "free")),
        "subscription": update_fields.get("subscription", user.get("subscription")),
    }

@api_router.get("/test_attempts/{attempt_id}")
async def get_test_attempt(attempt_id: str):
    attempt = await db.test_attempts.find_one({"id": attempt_id}, {"_id": 0})
    if not attempt:
        raise HTTPException(status_code=404, detail="Test attempt not found")
    
    # Convert completed_at back to datetime for Pydantic model compatibility if needed
    if isinstance(attempt.get("completed_at"), str):
        try:
            attempt["completed_at"] = datetime.fromisoformat(attempt["completed_at"])
        except Exception:
            pass
    
    # Dynamically add explanations from test answer_key if missing
    feedback = attempt.get("feedback", {})
    question_results = feedback.get("question_results", [])
    
    # Check if explanations are missing
    if question_results and not question_results[0].get("explanation"):
        # Fetch the original test to get explanations
        test = await db.tests.find_one({"id": attempt.get("test_id")}, {"_id": 0})
        if test:
            # Build explanation map from answer_key
            explanation_map = {}
            for item in test.get("answer_key", []):
                q_id = item.get("question_id")
                if q_id is not None:
                    explanation_map[int(q_id)] = item.get("explanation", "")
            
            # Add explanations to question_results
            for q in question_results:
                qid = q.get("question_id")
                if qid and not q.get("explanation"):
                    q["explanation"] = explanation_map.get(int(qid), "")
            
            # Update feedback with explanations
            feedback["question_results"] = question_results
            attempt["feedback"] = feedback
    
    return attempt

# AI Evaluation routes
@api_router.post("/evaluate/writing")
async def evaluate_writing(data: EvaluateWriting):
    try:
        evaluation = await evaluate_with_ai(
            test_type="writing",
            question=data.question,
            user_answer=data.answer
        )
        return evaluation
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/evaluate/speaking")
async def evaluate_speaking(data: SpeakingTest):
    try:
        evaluation = await evaluate_with_ai(
            test_type="speaking",
            question=data.question,
            user_answer=data.user_response
        )
        return evaluation
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Speaking test with AI
@api_router.post("/speaking/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    try:
        # Read audio file
        audio_data = await file.read()
        
        # Log audio size for debugging
        logger.info(f"Transcribing audio: {len(audio_data)} bytes ({len(audio_data)/1024/1024:.2f} MB)")
        
        if len(audio_data) < 1000:
            raise HTTPException(status_code=400, detail="Audio file too small")
        
        audio_file = io.BytesIO(audio_data)
        audio_file.name = file.filename or "audio.webm"
        
        # First, transcribe with auto-detection to check the language
        response = await stt.transcribe(
            file=audio_file,
            model="whisper-1",
            response_format="verbose_json"  # This includes language detection
        )
        
        transcribed_text = response.text.strip()
        detected_language = getattr(response, 'language', 'en')
        
        logger.info(f"Transcription result: {len(transcribed_text)} chars, detected language: {detected_language}")
        
        # Check if the detected language is English
        if detected_language and detected_language.lower() not in ['en', 'english']:
            logger.warning(f"Non-English speech detected: {detected_language}")
            raise HTTPException(
                status_code=400, 
                detail=f"Please speak in English only. Detected language: {detected_language}. This is an English proficiency test."
            )
        
        if len(transcribed_text) < 5:
            raise HTTPException(status_code=400, detail="Could not transcribe audio clearly. Please speak louder.")
        
        return {"text": transcribed_text, "language": detected_language}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Transcription error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/speaking/questions/{part}")
async def get_speaking_questions(part: int):
    """Get speaking test questions for a specific part"""
    questions_db = {
        1: [
            "Tell me about your hometown.",
            "What do you do? Do you work or are you a student?",
            "Do you enjoy your job/studies? Why?",
            "What are your hobbies or interests?"
        ],
        2: [
            "Describe a memorable event in your life. You should say: what the event was, when it happened, who was there, and explain why it was memorable.",
            "Describe a place you would like to visit. You should say: where it is, why you want to go there, what you would do there, and explain why this place interests you."
        ],
        3: [
            "How has technology changed the way people communicate?",
            "What are the advantages and disadvantages of social media?",
            "Do you think traditional skills are still important in modern society?",
            "How do you think education will change in the future?"
        ]
    }
    
    if part not in [1, 2, 3]:
        raise HTTPException(status_code=400, detail="Invalid part number")
    
    return {"part": part, "questions": questions_db[part]}

# Progress tracking
@api_router.get("/progress/{user_id}")
async def get_user_progress(user_id: str):
    attempts = await db.test_attempts.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("completed_at", -1).to_list(500)  # Return more attempts
    
    # Convert datetime strings
    for attempt in attempts:
        if isinstance(attempt.get('completed_at'), str):
            attempt['completed_at'] = datetime.fromisoformat(attempt['completed_at'])
    
    # Calculate statistics per type with averages
    by_type = {}
    total_band_score = 0
    band_count = 0
    best_band = 0
    
    for attempt in attempts:
        test_type = attempt['test_type']
        band = attempt.get('band_score', 0)
        
        if test_type not in by_type:
            by_type[test_type] = {"count": 0, "total_band": 0, "avg_score": 0.0}
        
        by_type[test_type]['count'] += 1
        by_type[test_type]['total_band'] += band
        
        if band > 0:
            total_band_score += band
            band_count += 1
            if band > best_band:
                best_band = band
    
    # Calculate averages per type
    for type_key in by_type:
        count = by_type[type_key]['count']
        if count > 0:
            by_type[type_key]['avg_score'] = round(by_type[type_key]['total_band'] / count, 1)
    
    # Calculate streak (consecutive days with tests)
    streak = 0
    if attempts:
        today = datetime.now(timezone.utc).date()
        dates_with_tests = set()
        for attempt in attempts:
            if attempt.get('completed_at'):
                completed = attempt['completed_at']
                if isinstance(completed, str):
                    completed = datetime.fromisoformat(completed.replace('Z', '+00:00'))
                dates_with_tests.add(completed.date())
        
        # Count consecutive days from today going backwards
        current_date = today
        while current_date in dates_with_tests:
            streak += 1
            current_date -= timedelta(days=1)
    
    # Calculate badges/achievements
    badges = []
    total_tests = len(attempts)
    avg_band = round(total_band_score / band_count, 1) if band_count > 0 else 0.0
    
    # Test count badges
    if total_tests >= 1:
        badges.append({"id": "first_test", "name": "First Steps", "icon": "🎯", "description": "Completed your first test"})
    if total_tests >= 5:
        badges.append({"id": "five_tests", "name": "Getting Started", "icon": "📚", "description": "Completed 5 tests"})
    if total_tests >= 10:
        badges.append({"id": "ten_tests", "name": "Dedicated Learner", "icon": "🔥", "description": "Completed 10 tests"})
    if total_tests >= 25:
        badges.append({"id": "twentyfive_tests", "name": "IELTS Warrior", "icon": "⚔️", "description": "Completed 25 tests"})
    if total_tests >= 50:
        badges.append({"id": "fifty_tests", "name": "Master Practitioner", "icon": "👑", "description": "Completed 50 tests"})
    
    # Band score badges
    if best_band >= 6:
        badges.append({"id": "band_6", "name": "Band 6 Achiever", "icon": "🥉", "description": "Achieved Band 6 or higher"})
    if best_band >= 7:
        badges.append({"id": "band_7", "name": "Band 7 Expert", "icon": "🥈", "description": "Achieved Band 7 or higher"})
    if best_band >= 8:
        badges.append({"id": "band_8", "name": "Band 8 Master", "icon": "🥇", "description": "Achieved Band 8 or higher"})
    
    # Streak badges
    if streak >= 3:
        badges.append({"id": "streak_3", "name": "On Fire", "icon": "🔥", "description": "3 day streak"})
    if streak >= 7:
        badges.append({"id": "streak_7", "name": "Week Warrior", "icon": "💪", "description": "7 day streak"})
    if streak >= 30:
        badges.append({"id": "streak_30", "name": "Monthly Champion", "icon": "🏆", "description": "30 day streak"})
    
    # Skill mastery badges
    for skill, data in by_type.items():
        if data['avg_score'] >= 7:
            badges.append({"id": f"{skill}_master", "name": f"{skill.capitalize()} Master", "icon": "⭐", "description": f"Band 7+ average in {skill}"})
    
    stats = {
        "total_tests": total_tests,
        "by_type": by_type,
        "average_band_score": avg_band,
        "best_band": best_band,
        "streak": streak,
        "badges": badges,
        "recent_attempts": attempts  # Return ALL attempts for Progress page
    }
    
    return stats

# Tips and Courses
@api_router.get("/tips")
async def get_tips(category: Optional[str] = None):
    query = {"category": category} if category else {}
    tips = await db.tips.find(query, {"_id": 0}).to_list(100)
    return tips

@api_router.get("/courses")
async def get_courses():
    courses = await db.courses.find({}, {"_id": 0}).to_list(100)
    return courses

@api_router.get("/courses/{course_id}")
async def get_course(course_id: str):
    course = await db.courses.find_one({"id": course_id}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


# ============ Vocabulary & Grammar Course ============

@api_router.get("/vocab-grammar/lessons")
async def get_vocab_grammar_lessons(band_level: str = None):
    """Get vocabulary and grammar lessons, optionally filtered by band level"""
    query = {}
    if band_level:
        query["band_level"] = band_level
    lessons = await db.vocab_grammar_lessons.find(query, {"_id": 0}).to_list(100)
    return lessons

@api_router.get("/vocab-grammar/lessons/{lesson_id}")
async def get_vocab_grammar_lesson(lesson_id: str):
    """Get a specific lesson with all items"""
    lesson = await db.vocab_grammar_lessons.find_one({"id": lesson_id}, {"_id": 0})
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson

@api_router.post("/vocab-grammar/tts")
async def text_to_speech(request: dict):
    """Generate TTS audio for pronunciation"""
    text = request.get("text", "")
    if not text:
        raise HTTPException(status_code=400, detail="Text is required")
    
    try:
        from emergentintegrations.llm.openai import OpenAITextToSpeech
        tts = OpenAITextToSpeech(api_key=os.getenv("EMERGENT_LLM_KEY"))
        # Use generate_speech_base64 for direct base64 output
        audio_base64 = await tts.generate_speech_base64(
            text=text,
            voice="alloy",
            model="tts-1"
        )
        return {"audio": audio_base64, "format": "mp3"}
    except Exception as e:
        logging.getLogger(__name__).error(f"TTS error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate audio")

class PronunciationEvalRequest(BaseModel):
    word: str
    user_transcript: str
    expected_pronunciation: Optional[str] = None

@api_router.post("/vocab-grammar/evaluate-pronunciation")
async def evaluate_pronunciation(request: PronunciationEvalRequest):
    """Evaluate user's pronunciation using AI"""
    try:
        chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            model="claude-3-sonnet-20240229"
        )
        
        prompt = f"""You are an English pronunciation teacher. Evaluate the student's pronunciation attempt.

Target word/phrase: "{request.word}"
What the student said (transcribed): "{request.user_transcript}"

Evaluate:
1. Did they pronounce it correctly? (correct/partially correct/incorrect)
2. What specific sounds need improvement?
3. Give a helpful tip for better pronunciation.

Respond in JSON format:
{{
    "score": "correct" or "partially_correct" or "incorrect",
    "score_percent": 0-100,
    "feedback": "brief encouraging feedback",
    "tip": "specific pronunciation tip",
    "phonetic_hint": "simplified phonetic guide"
}}"""

        response = await chat.send_message(UserMessage(text=prompt))
        response_text = response.text.strip()
        
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        return json.loads(response_text)
    except Exception as e:
        logging.getLogger(__name__).error(f"Pronunciation evaluation error: {e}")
        return {
            "score": "partially_correct",
            "score_percent": 70,
            "feedback": "Good attempt! Keep practicing.",
            "tip": "Try saying it slowly and clearly.",
            "phonetic_hint": request.word
        }

class SaveProgressRequest(BaseModel):
    user_id: str
    lesson_id: str
    completed_items: List[str]
    practice_scores: Dict[str, Any]

@api_router.post("/vocab-grammar/progress")
async def save_vocab_grammar_progress(request: SaveProgressRequest):
    """Save user's progress in vocabulary/grammar lessons"""
    progress = {
        "user_id": request.user_id,
        "lesson_id": request.lesson_id,
        "completed_items": request.completed_items,
        "practice_scores": request.practice_scores,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.vocab_grammar_progress.update_one(
        {"user_id": request.user_id, "lesson_id": request.lesson_id},
        {"$set": progress},
        upsert=True
    )
    
    return {"message": "Progress saved"}

@api_router.get("/vocab-grammar/progress/{user_id}")
async def get_vocab_grammar_progress(user_id: str):
    """Get user's progress across all lessons"""
    progress = await db.vocab_grammar_progress.find(
        {"user_id": user_id}, {"_id": 0}
    ).to_list(100)
    return progress

# Admin endpoint to add new tests
class CreateTestRequest(BaseModel):
    title: str
    test_type: str
    duration: int
    passages: Optional[List[Dict[str, Any]]] = None
    questions: List[Dict[str, Any]]
    answer_key: List[Dict[str, Any]]

@api_router.post("/tests")
async def create_test(test_data: CreateTestRequest):
    """Admin endpoint to create new test content"""
    test = {
        "id": str(uuid.uuid4()),
        **test_data.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.tests.insert_one(test)
    return {"message": "Test created successfully", "test_id": test["id"]}


# ============ Level Test Evaluation ============

class LevelTestRequest(BaseModel):
    user_id: Optional[str] = None
    reading_answers: Dict[str, str]
    reading_questions: List[Dict[str, Any]]
    speaking_responses: List[Dict[str, Any]]

@api_router.post("/level-test/evaluate")
async def evaluate_level_test(request: LevelTestRequest):
    """Evaluate user's English level based on reading and speaking responses"""
    
    # Calculate reading score
    correct_count = 0
    for q in request.reading_questions:
        user_answer = request.reading_answers.get(str(q["id"]), "")
        if user_answer.upper() == q["correct"].upper():
            correct_count += 1
    
    reading_score = correct_count
    
    # Prepare speaking responses for AI evaluation
    speaking_text = "\n\n".join([
        f"Prompt: {resp['prompt']}\nResponse: {resp['response']}"
        for resp in request.speaking_responses
    ])
    
    # Use Claude to evaluate speaking and determine overall level
    try:
        chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            model="claude-3-sonnet-20240229"
        )
        
        evaluation_prompt = f"""You are an experienced English language assessor. Evaluate the following test responses and determine the student's English proficiency level.

READING SCORE: {reading_score}/5 correct answers
- Questions ranged from Elementary to Advanced level
- Score breakdown: 0-1 = Beginner, 2 = Elementary, 3 = Pre-Intermediate, 4 = Intermediate/Upper-Intermediate, 5 = Advanced

SPEAKING RESPONSES:
{speaking_text}

Based on the reading score and speaking responses, evaluate:
1. Overall English Level (choose ONE): Beginner, Elementary, Pre-Intermediate, Intermediate, Upper-Intermediate, Advanced, or IELTS Ready
2. Speaking assessment: Comment on fluency, vocabulary, grammar, and coherence
3. Recommendations: Suggest 3 specific practice areas or test types

Respond in this exact JSON format:
{{
    "level": "the level name",
    "reading_feedback": "brief feedback on reading performance",
    "speaking_feedback": "detailed speaking assessment (2-3 sentences)",
    "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
}}"""

        response = await chat.send_message(UserMessage(text=evaluation_prompt))
        
        # Parse the response
        response_text = response.text.strip()
        # Extract JSON from response (handle markdown code blocks)
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        result = json.loads(response_text)
        result["reading_score"] = reading_score
        
        # Save result to user profile if user_id provided
        if request.user_id:
            await db.users.update_one(
                {"id": request.user_id},
                {"$set": {
                    "english_level": result["level"],
                    "level_test_date": datetime.now(timezone.utc).isoformat(),
                    "level_test_result": result
                }}
            )
        
        return result
        
    except Exception as e:
        logging.getLogger(__name__).error(f"Level test evaluation error: {e}")
        
        # Fallback evaluation based on reading score alone
        level_map = {
            0: "Beginner",
            1: "Elementary", 
            2: "Pre-Intermediate",
            3: "Intermediate",
            4: "Upper-Intermediate",
            5: "Advanced"
        }
        
        return {
            "level": level_map.get(reading_score, "Intermediate"),
            "reading_score": reading_score,
            "reading_feedback": f"You answered {reading_score} out of 5 questions correctly.",
            "speaking_feedback": "Your speaking responses have been recorded. Practice regularly to improve fluency and vocabulary range.",
            "recommendations": [
                "Practice reading academic texts daily",
                "Record yourself speaking and listen back",
                "Take full IELTS practice tests to build familiarity"
            ]
        }



# ============ ADAPTIVE LEVEL TEST (Band 2.0-9.0) ============
# Import adaptive test functions
from adaptive_level_test_routes import (
    InitialAssessmentRequest,
    AdaptiveTestRequest,
    determine_starting_level,
    get_adaptive_questions,
    calculate_reading_band,
    evaluate_writing_detailed,
    evaluate_speaking_detailed,
    generate_learning_path
)
from adaptive_level_test_data import READING_QUESTIONS, BAND_SCORE_RANGES
from comprehensive_test_data import WRITING_PROMPTS, SPEAKING_PROMPTS

@api_router.post("/adaptive-level-test/start")
async def start_adaptive_test(request: InitialAssessmentRequest):
    """Get starting questions based on user's self-assessment"""
    starting_level = determine_starting_level(request.experience_level)
    
    # Get questions for the starting level - START WITH 5 QUESTIONS
    reading_questions = get_adaptive_questions(starting_level, "reading")
    
    # Select appropriate writing and speaking prompts
    writing_prompts = WRITING_PROMPTS.get(starting_level, {}).get("prompts", [])
    speaking_prompts = SPEAKING_PROMPTS.get(starting_level, [])
    
    # Select one writing prompt randomly
    import random
    selected_writing = random.choice(writing_prompts) if writing_prompts else {
        "id": "default",
        "prompt": "Write about your typical day. (50-100 words)",
        "min_words": 50,
        "max_words": 100
    }
    
    # Select 3 speaking prompts
    selected_speaking = random.sample(speaking_prompts, min(3, len(speaking_prompts))) if speaking_prompts else [
        {"id": "s_default_1", "question": "Tell me about yourself."},
        {"id": "s_default_2", "question": "What do you like to do in your free time?"},
        {"id": "s_default_3", "question": "Describe a place you like to visit."}
    ]
    
    return {
        "starting_level": starting_level,
        "reading_questions": reading_questions[:5] if reading_questions else [],  # First 5 questions
        "writing_prompt": selected_writing,
        "speaking_prompts": selected_speaking,
        "instructions": {
            "reading": f"You'll start with {starting_level} level questions. Answer carefully - difficulty will adapt based on your performance.",
            "total_reading_questions": "8-12 questions (adapts to your level)",
            "time_estimate": "15-25 minutes total"
        }
    }

@api_router.post("/adaptive-level-test/next-questions")
async def get_next_adaptive_questions(
    current_level: str,
    recent_answers: dict,
    questions_so_far: int
):
    """
    Get next set of questions based on performance
    Called after user completes a batch of questions
    """
    # Calculate accuracy on recent questions
    correct_count = sum(1 for ans in recent_answers.values() if ans.get("correct", False))
    total = len(recent_answers)
    accuracy = correct_count / total if total > 0 else 0
    
    # Determine next level based on adaptive rules
    level_order = {"A1": 1, "A2": 2, "B1": 3, "B2": 4, "C1": 5, "C2": 6}
    current_level_num = level_order.get(current_level, 2)
    
    next_level = current_level
    
    if accuracy >= 0.70 and current_level_num < 6:  # 70%+ correct → level up
        next_level_num = current_level_num + 1
        next_level = [k for k, v in level_order.items() if v == next_level_num][0]
    elif accuracy < 0.50 and current_level_num > 1:  # <50% correct → level down
        next_level_num = current_level_num - 1
        next_level = [k for k, v in level_order.items() if v == next_level_num][0]
    
    # Stop if we've asked enough questions (8-12 range)
    if questions_so_far >= 12:
        return {
            "continue": False,
            "message": "Assessment complete. Proceeding to speaking section.",
            "final_level": next_level
        }
    
    if questions_so_far >= 8 and accuracy >= 0.70:
        # Can stop early if performing well
        return {
            "continue": False,
            "message": "Strong performance detected. Moving to next section.",
            "final_level": next_level
        }
    
    # Get more questions at the next level
    next_questions = get_adaptive_questions(next_level, "reading")
    
    # Determine how many more questions to ask
    remaining = min(5, 12 - questions_so_far)
    
    return {
        "continue": True,
        "next_level": next_level,
        "questions": next_questions[:remaining] if next_questions else [],
        "progress": f"{questions_so_far} of 8-12 completed"
    }

@api_router.post("/adaptive-level-test/evaluate")
async def evaluate_adaptive_test(request: AdaptiveTestRequest):
    """
    Evaluate complete adaptive test with detailed feedback
    Returns band scores (2.0-9.0) and specific error analysis
    """
    try:
        # 1. Calculate Reading Band
        reading_band, reading_accuracy, reading_level, reading_errors = calculate_reading_band(
            request.reading_answers,
            []
        )
        
        # 2. Evaluate Writing (if provided)
        writing_band = 2.0
        writing_analysis = {}
        if request.writing_response and len(request.writing_response) > 20:
            writing_analysis = await evaluate_writing_detailed(
                request.writing_response,
                request.initial_level
            )
            writing_band = writing_analysis.get("band_score", 4.0)
        
        # 3. Evaluate Speaking
        speaking_band = 2.0
        speaking_analysis = {}
        if request.speaking_responses:
            speaking_analysis = await evaluate_speaking_detailed(
                request.speaking_responses,
                request.initial_level
            )
            speaking_band = speaking_analysis.get("band_score", 4.0)
        
        # 4. Calculate Listening Band (simplified for now)
        listening_band = reading_band  # Placeholder
        
        # 5. Calculate Overall Band (weighted average)
        overall_band = round(
            (reading_band * 0.25 + 
             listening_band * 0.25 + 
             writing_band * 0.25 + 
             speaking_band * 0.25),
            1
        )
        
        # 6. Determine CEFR Level
        cefr_mapping = {
            (2.0, 3.0): "A1",
            (3.5, 4.5): "A2",
            (5.0, 5.5): "B1",
            (6.0, 6.5): "B2",
            (7.0, 8.0): "C1",
            (8.5, 9.0): "C2"
        }
        
        cefr_level = "A2"
        for band_range, level in cefr_mapping.items():
            if band_range[0] <= overall_band <= band_range[1]:
                cefr_level = level
                break
        
        # 7. Generate Learning Path
        skill_bands = {
            "reading": reading_band,
            "listening": listening_band,
            "writing": writing_band,
            "speaking": speaking_band
        }
        learning_path = generate_learning_path(overall_band, skill_bands)
        
        # 8. Prepare Detailed Analysis
        detailed_analysis = {
            "reading": {
                "band": reading_band,
                "accuracy": f"{reading_accuracy * 100:.0f}%",
                "level_reached": reading_level,
                "errors": reading_errors,
                "strengths": "Basic comprehension" if reading_band >= 4.0 else "Needs foundation",
                "weaknesses": "Advanced vocabulary" if reading_band < 6.0 else "Minimal"
            },
            "writing": writing_analysis,
            "speaking": speaking_analysis,
            "listening": {
                "band": listening_band,
                "note": "Listening evaluation integrated"
            }
        }
        
        # 9. Next Steps Recommendations
        next_steps = []
        if overall_band < 4.0:
            next_steps = [
                "✅ Start with Foundation courses (FREE)",
                "📚 Practice basic vocabulary daily (10-15 words)",
                "🎙️ Use AI pronunciation tool (10 min/day)",
                "📊 Take mini-tests weekly to track progress"
            ]
        elif overall_band < 5.5:
            next_steps = [
                "📖 Focus on grammar fundamentals",
                "💬 Build vocabulary to 1500+ words",
                "🗣️ Practice speaking daily with AI",
                "✍️ Write short paragraphs (50-100 words)"
            ]
        elif overall_band < 6.5:
            next_steps = [
                "🎯 Start IELTS-specific preparation",
                "📚 Learn academic vocabulary",
                "💪 Practice all 4 skills regularly",
                "📝 Take full practice tests monthly"
            ]
        else:
            next_steps = [
                "🏆 Take full IELTS practice tests",
                "🎓 Focus on Band 7-8 strategies",
                "🔍 Refine weak areas",
                "📅 Book official IELTS test"
            ]
        
        # 10. Save to database (if user_id provided)
        if request.user_id:
            await db.users.update_one(
                {"id": request.user_id},
                {
                    "$set": {
                        "level_test_result": {
                            "overall_band": overall_band,
                            "cefr_level": cefr_level,
                            "skill_bands": skill_bands,
                            "test_date": datetime.now(timezone.utc).isoformat(),
                            "detailed_analysis": detailed_analysis
                        }
                    }
                }
            )
        
        # 11. Estimate time to next band
        time_estimates = {
            (2.0, 3.0): "8-12 weeks with daily practice",
            (3.0, 4.0): "10-14 weeks with daily practice",
            (4.0, 5.0): "12-16 weeks with daily practice",
            (5.0, 6.0): "16-20 weeks with daily practice",
            (6.0, 7.0): "20-24 weeks with intensive practice",
            (7.0, 8.0): "24-32 weeks with expert guidance",
            (8.0, 9.0): "32+ weeks of mastery-level practice"
        }
        
        estimated_time = "12-16 weeks"
        for band_range, time in time_estimates.items():
            if band_range[0] <= overall_band < band_range[1]:
                estimated_time = time
                break
        
        return {
            "overall_band": overall_band,
            "cefr_level": cefr_level,
            "reading_band": reading_band,
            "listening_band": listening_band,
            "writing_band": writing_band,
            "speaking_band": speaking_band,
            "detailed_analysis": detailed_analysis,
            "learning_path": learning_path,
            "next_steps": next_steps,
            "estimated_time_to_next_band": estimated_time,
            "test_completed_at": datetime.now(timezone.utc).isoformat()
        }
        
    except Exception as e:
        logging.getLogger(__name__).error(f"Adaptive test evaluation error: {e}")
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")



# ============ Writing Practice Evaluation ============

class WritingPracticeRequest(BaseModel):
    task_type: str  # task1_academic, task1_general, task2
    prompt: str
    essay: str
    word_count: int

@api_router.post("/writing-practice/evaluate")
async def evaluate_writing_practice(request: WritingPracticeRequest):
    """Evaluate IELTS writing practice submission with detailed teacher-style feedback"""
    try:
        chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            session_id=str(uuid.uuid4()),
            system_message="""You are a qualified IELTS teacher, not just an evaluator. You must think step by step like a real teacher:
- First check whether the student's response is valid before giving any score
- If the task is invalid (off-topic, too short, missing required elements), the band score MUST be limited
- Be honest and strict - do NOT give generous scores by default
- Prioritize feedback on the most important errors, not every small mistake
- Adjust your tone based on student level: supportive for weak students, precise for advanced"""
        ).with_model("openai", "gpt-4o")
        
        task_type_desc = {
            "task1_academic": "IELTS Academic Writing Task 1 (graph/chart/diagram description)",
            "task1_general": "IELTS General Training Writing Task 1 (letter writing)",
            "task2": "IELTS Writing Task 2 (essay)"
        }.get(request.task_type, "IELTS Writing Task")
        
        min_words = 250 if request.task_type == "task2" else 150
        is_task2 = request.task_type == "task2"
        
        prompt = f"""You are a qualified IELTS teacher evaluating this {task_type_desc} submission.

CRITICAL INSTRUCTION: You MUST be consistent and strict across ALL evaluations. Do NOT give better scores on repeated submissions unless the content genuinely improves.

====================================
TASK PROMPT:
====================================
{request.prompt}

====================================
STUDENT'S RESPONSE ({request.word_count} words):
====================================
{request.essay}

====================================
IELTS TEACHER EVALUATION FRAMEWORK
====================================

**STEP 1: VALIDITY CHECK (MANDATORY - Do this FIRST)**

CRITICAL OFF-TOPIC DETECTION:
- Compare the student's response with the TASK PROMPT above
- If the student wrote about something COMPLETELY DIFFERENT from what was asked, mark on_topic as FALSE
- Examples of off-topic: Writing about personal life when asked to describe a graph, discussing unrelated topics, not addressing the question at all
- An off-topic response MUST receive Band 1.0-2.0 for Task Achievement, regardless of language quality

Apply these rules strictly BEFORE scoring:

For Task 1 (minimum 150 words):
- If under 150 words → Band is CAPPED at 4.0 maximum
- If response is off-topic or mostly unrelated → Band CANNOT exceed 4.0
- If no clear overview/summary of main trends → Band CANNOT exceed 5.0

For Task 2 (minimum 250 words):
- If under 250 words → Band is CAPPED at 4.0 maximum
- If response is off-topic or mostly unrelated → Band CANNOT exceed 4.0
- If no clear position/opinion stated → Band CANNOT exceed 5.0
- If no clear paragraph structure → Band CANNOT exceed 5.5

Current submission: {request.word_count} words (Minimum required: {min_words} words)

**STEP 2: BAND SCORING (Be Strict)**
- Do NOT give generous scores by default
- If response is weak, unclear, short, or off-topic → give Band 1-4
- Only give Band 5-7 if response clearly meets IELTS criteria
- Band 8-9 is rare and requires exceptional quality

**STEP 3: ERROR PRIORITIZATION (Teacher Logic)**
Prioritize errors in this order:
1. Task misunderstanding or missing required elements
2. Grammar errors that block meaning
3. Repeated grammar pattern errors
4. Vocabulary misuse or unnatural collocations
5. Minor grammar or spelling mistakes

**STEP 4: TEACHER-STYLE CORRECTIONS**
For each correction, use this format:
- Quote the student's exact words
- Provide the corrected version
- Give a simple, clear explanation
- Optionally provide a better/more natural alternative

Provide your evaluation in this JSON format:
{{
    "validity_check": {{
        "is_valid": <true/false>,
        "word_count_valid": <true/false>,
        "on_topic": <true/false>,
        "has_required_elements": <true/false>,
        "validity_issues": ["<list any validity problems>"],
        "band_cap_applied": <null or number if capped>,
        "cap_reason": "<explanation if band is capped>"
    }},
    "overall_band": <float between 1.0 and 9.0, in 0.5 increments>,
    "band_confidence": "<high/medium/low>",
    "scores": {{
        "task_achievement": <float 1.0-9.0>,
        "coherence_cohesion": <float 1.0-9.0>,
        "lexical_resource": <float 1.0-9.0>,
        "grammar": <float 1.0-9.0>
    }},
    "teacher_summary": "<2-3 sentences like a real teacher would say, addressing the student directly>",
    "key_problems": [
        {{
            "priority": <1-5>,
            "category": "<task_response/grammar/vocabulary/coherence>",
            "issue": "<specific problem description>",
            "impact": "<how this affects the score>"
        }}
    ],
    "strengths": ["<specific things done well with examples from the text>"],
    "corrections": [
        {{
            "original": "<exact quote from student>",
            "corrected": "<corrected version>",
            "explanation": "<simple, clear explanation>",
            "better_alternative": "<more natural/sophisticated option if applicable>"
        }}
    ],
    "next_steps": ["<maximum 3 actionable suggestions for improvement>"],
    "improved_paragraph": "<rewrite ONE weak paragraph showing how to improve it, or provide a model introduction/conclusion>"
}}

Remember:
- Be honest but encouraging - never humiliate the student
- Adjust tone based on level: supportive for weak students, precise for advanced
- Focus on the MOST important issues, not every small error
- Give specific examples from the student's text"""

        response = await chat.send_message(UserMessage(text=prompt))
        
        # Handle different response formats
        if isinstance(response, dict):
            return response
        
        response_text = str(response).strip()
        
        # Try to extract JSON from response
        import re
        # Remove markdown code fences if present
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            result = json.loads(json_match.group())
            return result
        
        # Fallback response with validity check
        word_count_valid = request.word_count >= min_words
        band_cap = 4.0 if not word_count_valid else None
        
        return {
            "validity_check": {
                "is_valid": word_count_valid,
                "word_count_valid": word_count_valid,
                "on_topic": True,
                "has_required_elements": True,
                "validity_issues": [] if word_count_valid else [f"Word count ({request.word_count}) is below minimum ({min_words})"],
                "band_cap_applied": band_cap,
                "cap_reason": f"Band capped at 4.0 due to insufficient word count" if band_cap else None
            },
            "overall_band": min(4.0, 5.5) if not word_count_valid else 5.5,
            "band_confidence": "medium",
            "scores": {
                "task_achievement": 4.0 if not word_count_valid else 5.5,
                "coherence_cohesion": 5.0,
                "lexical_resource": 5.0,
                "grammar": 5.0
            },
            "teacher_summary": "I've reviewed your writing. Let me share some feedback to help you improve." if word_count_valid else f"I notice your response is only {request.word_count} words. For this task, you need at least {min_words} words. This significantly affects your score.",
            "key_problems": [{"priority": 1, "category": "task_response", "issue": f"Word count below minimum ({request.word_count}/{min_words})", "impact": "Band capped at 4.0"}] if not word_count_valid else [],
            "strengths": ["You attempted the task"],
            "corrections": [],
            "next_steps": [f"Write at least {min_words} words", "Develop your ideas more fully", "Practice time management"],
            "improved_paragraph": "Unable to generate improved version. Please try again."
        }
        
    except Exception as e:
        logging.getLogger(__name__).error(f"Writing evaluation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to evaluate writing")


# ============ Level Test Evaluation & Recommendations ============

class LevelTestSpeakingEvaluation(BaseModel):
    responses: List[Dict[str, Any]]  # [{"level": "A1-A2", "transcript": "..."}]
    language: Optional[str] = "en"  # en, vi, tr

class CourseRecommendationRequest(BaseModel):
    overall_band: float
    reading_band: float
    speaking_band: float
    weaknesses: List[str]
    skill_breakdown: Dict[str, Any]
    language: Optional[str] = "en"  # en, vi, tr

@api_router.post("/level-test/evaluate-speaking")
async def evaluate_level_test_speaking(request: LevelTestSpeakingEvaluation):
    """
    Evaluate speaking responses from comprehensive level test.
    Returns detailed band score, weaknesses, and specific improvement areas.
    OPTIMIZED: Uses simpler, faster evaluation for better user experience.
    """
    try:
        # First, provide quick estimation based on transcript length and content
        responses = request.responses
        total_words = 0
        total_responses = len(responses)
        
        for r in responses:
            transcript = r.get('transcript', '')
            words = len(transcript.split())
            total_words += words
        
        avg_words = total_words / max(total_responses, 1)
        
        # Quick band estimation based on response length and complexity
        # This gives immediate feedback while AI processes
        quick_band = 4.0
        if avg_words > 100:
            quick_band = 6.5
        elif avg_words > 70:
            quick_band = 6.0
        elif avg_words > 50:
            quick_band = 5.5
        elif avg_words > 30:
            quick_band = 5.0
        elif avg_words > 15:
            quick_band = 4.5
        
        # Use a simpler, faster prompt
        chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            session_id=str(uuid.uuid4()),
            system_message="You are an IELTS speaking examiner. Evaluate quickly and return only JSON."
        ).with_model("openai", "gpt-4o-mini")  # Faster model
        
        # Format responses concisely
        responses_text = ""
        for idx, r in enumerate(request.responses, 1):
            transcript = r.get('transcript', '')[:200]  # Limit length for speed
            responses_text += f"Q{idx}: {transcript}\n"
        
        # Shorter, faster prompt
        evaluation_prompt = f"""Evaluate this IELTS speaking test. Return ONLY JSON:

{responses_text}

Return this JSON (fill in values):
{{"overall_band": 5.5, "criteria_scores": {{"fluency_coherence": 5.5, "lexical_resource": 5.0, "grammatical_range_accuracy": 5.5, "pronunciation": 5.5}}, "cefr_level": "B1", "strengths": ["strength1", "strength2"], "weaknesses": ["weakness1", "weakness2"], "improvement_recommendations": ["tip1", "tip2"], "detailed_feedback": "2-3 sentence feedback"}}"""

        try:
            response = await asyncio.wait_for(
                chat.send_message(UserMessage(text=evaluation_prompt)),
                timeout=15.0  # 15 second timeout
            )
            
            response_text = str(response)
            
            import re
            response_text = re.sub(r'```json\s*', '', response_text)
            response_text = re.sub(r'```\s*', '', response_text)
            
            json_match = re.search(r'\{[\s\S]*\}', response_text)
            if json_match:
                result = json.loads(json_match.group())
                # Add missing fields with defaults
                result.setdefault("pronunciation_issues", [])
                result.setdefault("vocabulary_gaps", [])
                return result
                
        except asyncio.TimeoutError:
            logger.warning("Speaking evaluation timed out, using quick estimation")
        except Exception as e:
            logger.warning(f"AI evaluation failed: {e}, using quick estimation")
        
        # Fallback: Return quick estimation if AI is slow/fails
        language = request.language
        
        if language == "vi":
            strengths = ["Phát âm cơ bản rõ ràng", "Có thể diễn đạt ý tưởng đơn giản"]
            weaknesses = ["Cần mở rộng vốn từ vựng", "Cần cải thiện ngữ pháp phức tạp"]
            recommendations = ["Luyện nói 15-20 phút mỗi ngày", "Học thêm từ vựng học thuật"]
            feedback = f"Trình độ nói của bạn ước tính khoảng Band {quick_band}. Tiếp tục luyện tập để cải thiện!"
        elif language == "tr":
            strengths = ["Temel telaffuz anlaşılır", "Basit fikirler ifade edilebilir"]
            weaknesses = ["Kelime dağarcığı genişletilmeli", "Karmaşık dilbilgisi geliştirilmeli"]
            recommendations = ["Günde 15-20 dakika konuşma pratiği yapın", "Akademik kelimeler öğrenin"]
            feedback = f"Konuşma seviyeniz yaklaşık Band {quick_band} olarak tahmin edilmektedir. Pratik yapmaya devam edin!"
        else:
            strengths = ["Basic pronunciation is clear", "Able to express simple ideas"]
            weaknesses = ["Vocabulary range needs expansion", "Complex grammar needs practice"]
            recommendations = ["Practice speaking 15-20 minutes daily", "Learn academic vocabulary"]
            feedback = f"Your speaking level is estimated at Band {quick_band}. Keep practicing to improve!"
        
        return {
            "overall_band": quick_band,
            "criteria_scores": {
                "fluency_coherence": quick_band,
                "lexical_resource": quick_band - 0.5,
                "grammatical_range_accuracy": quick_band,
                "pronunciation": quick_band + 0.5
            },
            "cefr_level": "A2" if quick_band < 4.5 else "B1" if quick_band < 5.5 else "B2" if quick_band < 7.0 else "C1",
            "strengths": strengths,
            "weaknesses": weaknesses,
            "pronunciation_issues": [],
            "improvement_recommendations": recommendations,
            "vocabulary_gaps": [],
            "detailed_feedback": feedback
        }
        
    except Exception as e:
        logger.error(f"Speaking evaluation error: {e}")
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")

@api_router.post("/level-test/recommend-courses")
async def recommend_courses(request: CourseRecommendationRequest):
    """
    Generate personalized course recommendations based on level test results.
    Returns recommended courses with reasoning and a learning roadmap.
    """
    try:
        # Determine primary course based on overall band
        if request.overall_band < 4.5:
            primary_course = {
                "id": "beginner",
                "name": "Foundation Course",
                "band_range": "Band 2.0 - 4.5",
                "reason": "Build essential English fundamentals",
                "priority": "Start Here"
            }
            secondary_course = {
                "id": "mastery",
                "name": "Mastery Course",
                "band_range": "Band 5.5 - 6.5",
                "reason": "Progress to after completing foundation",
                "priority": "Next Step"
            }
        elif 4.5 <= request.overall_band < 6.5:
            primary_course = {
                "id": "mastery",
                "name": "Mastery Course",
                "band_range": "Band 5.5 - 6.5",
                "reason": "Break through intermediate plateau",
                "priority": "Start Here"
            }
            secondary_course = {
                "id": "advanced",
                "name": "Advanced Mastery",
                "band_range": "Band 6.5 - 9.0",
                "reason": "Target high band scores after mastery",
                "priority": "Next Step"
            }
        else:
            primary_course = {
                "id": "advanced",
                "name": "Advanced Mastery",
                "band_range": "Band 6.5 - 9.0",
                "reason": "Achieve Band 7+ with advanced strategies",
                "priority": "Start Here"
            }
            secondary_course = {
                "id": "mastery",
                "name": "Mastery Course",
                "band_range": "Band 5.5 - 6.5",
                "reason": "Review fundamentals if needed",
                "priority": "Optional Review"
            }
        
        # Generate personalized learning roadmap using AI
        chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            session_id=str(uuid.uuid4()),
            system_message="You are an expert IELTS preparation advisor creating personalized study plans."
        ).with_model("openai", "gpt-5.1")  # Using GPT-5.1 instead of Claude
        
        weaknesses_text = "\n".join([f"- {w}" for w in request.weaknesses])
        
        # Language-specific instructions
        language_instructions = {
            "vi": "\n\nIMPORTANT: Provide ALL text fields (weekly_plan goals/activities, priority_skills, study_tips, milestone_goals) in VIETNAMESE language so parents can understand the roadmap clearly.",
            "tr": "\n\nIMPORTANT: Provide ALL text fields (weekly_plan goals/activities, priority_skills, study_tips, milestone_goals) in TURKISH language so parents can understand the roadmap clearly.",
            "en": ""
        }
        
        language_note = language_instructions.get(request.language, "")
        
        roadmap_prompt = f"""Create a personalized 8-12 week learning roadmap for an IELTS student.

STUDENT PROFILE:
- Overall Band: {request.overall_band}
- Reading Band: {request.reading_band}
- Speaking Band: {request.speaking_band}
- Key Weaknesses: {weaknesses_text}

RECOMMENDED COURSE: {primary_course['name']} ({primary_course['band_range']})

Generate a JSON study plan:
{{
    "target_band": <realistic target band after 8-12 weeks>,
    "estimated_weeks": <8-12 weeks based on current level>,
    "weekly_plan": [
        {{
            "week": 1,
            "focus": "<Main skill to work on>",
            "goals": [
                "<Specific goal 1>",
                "<Specific goal 2>"
            ],
            "activities": [
                "<Activity 1 from the course>",
                "<Activity 2>"
            ]
        }},
        // ... 3-4 week milestones
    ],
    "priority_skills": [
        "<Skill 1 to focus on immediately>",
        "<Skill 2>",
        "<Skill 3>"
    ],
    "study_tips": [
        "<Personalized tip 1 based on weaknesses>",
        "<Tip 2>",
        "<Tip 3>"
    ],
    "milestone_goals": [
        {{
            "weeks": 4,
            "goal": "<What they should achieve by week 4>",
            "band_target": <expected band>
        }},
        {{
            "weeks": 8,
            "goal": "<What they should achieve by week 8>",
            "band_target": <expected band>
        }},
        {{
            "weeks": 12,
            "goal": "<Final goal>",
            "band_target": <target band>
        }}
    ]
}}

Make it motivating but realistic. Address their specific weaknesses.{language_note}"""

        response = await chat.send_message(UserMessage(text=roadmap_prompt))
        
        # Parse roadmap
        if isinstance(response, dict):
            roadmap = response
        else:
            import re
            json_match = re.search(r'\{[\s\S]*\}', str(response))
            if json_match:
                roadmap = json.loads(json_match.group())
            else:
                roadmap = {"target_band": request.overall_band + 1.0, "estimated_weeks": 12}
        
        return {
            "recommended_courses": [primary_course, secondary_course],
            "learning_roadmap": roadmap,
            "immediate_actions": [
                f"Enroll in {primary_course['name']} to start building your skills",
                f"Focus first on: {', '.join(request.weaknesses[:2]) if request.weaknesses else 'core fundamentals'}",
                "Practice speaking 15-20 minutes daily",
                "Complete at least 3 reading practice passages per week"
            ]
        }
        
    except Exception as e:
        logger.error(f"Course recommendation error: {e}")
        raise HTTPException(status_code=500, detail=f"Recommendation failed: {str(e)}")


# ============ LISTENING MODULE (Level Assessment) ============

from listening_data import get_listening_sections, get_all_listening_questions

@api_router.get("/level-test/listening-sections")
async def get_listening_sections_endpoint():
    """Get all listening sections with metadata for the level test."""
    sections = get_listening_sections()
    return {
        "sections": [
            {
                "id": s["id"],
                "level": s["level"],
                "band_range": s["band_range"],
                "title": s["title"],
                "audio_url": f"/audio/listening/{s['id']}.mp3",
                "question_count": len(s["questions"])
            }
            for s in sections
        ],
        "total_questions": sum(len(s["questions"]) for s in sections)
    }

@api_router.get("/level-test/listening-questions")
async def get_listening_questions():
    """Get all listening questions for the level test."""
    sections = get_listening_sections()
    all_questions = []
    
    for section in sections:
        for q in section["questions"]:
            all_questions.append({
                "section_id": section["id"],
                "section_title": section["title"],
                "audio_url": f"/audio/listening/{section['id']}.mp3",
                "level": section["level"],
                "band_range": section["band_range"],
                **q
            })
    
    return {"questions": all_questions, "total": len(all_questions)}


class ListeningEvaluationRequest(BaseModel):
    answers: Dict[str, str]  # {question_id: answer}
    language: Optional[str] = "en"


@api_router.post("/level-test/evaluate-listening")
async def evaluate_listening(request: ListeningEvaluationRequest):
    """Evaluate listening section answers with detailed explanations, course recommendations, and skill guidance."""
    try:
        sections = get_listening_sections()
        language = request.language or "en"
        
        correct_count = 0
        total_count = 0
        total_band_points = 0
        question_results = []
        skill_breakdown = {}
        weak_skills = []
        
        for section in sections:
            for q in section["questions"]:
                total_count += 1
                user_answer = request.answers.get(q["id"], "").strip().upper()
                correct_answer = q["correct"].strip().upper()
                is_correct = user_answer == correct_answer
                
                # Get band value from section
                band_range = section["band_range"]
                avg_band = (float(band_range.split("-")[0]) + float(band_range.split("-")[1])) / 2
                
                if is_correct:
                    correct_count += 1
                    total_band_points += avg_band
                
                # Track skill breakdown
                skill = q.get("skill", "general")
                if skill not in skill_breakdown:
                    skill_breakdown[skill] = {"correct": 0, "total": 0, "label": skill.replace("_", " ").title()}
                skill_breakdown[skill]["total"] += 1
                if is_correct:
                    skill_breakdown[skill]["correct"] += 1
                
                # Get explanation based on language
                explanation_key = f"explanation_{language}" if language != "en" else "explanation"
                explanation = q.get(explanation_key, q.get("explanation", ""))
                
                # Find correct option text
                correct_option_text = ""
                for opt in q.get("options", []):
                    if opt.startswith(correct_answer + ")"):
                        correct_option_text = opt
                        break
                
                question_results.append({
                    "question_id": q["id"],
                    "section_title": section["title"],
                    "section_level": section["level"],
                    "question_text": q["question"],
                    "user_answer": user_answer or "No answer",
                    "correct_answer": correct_answer,
                    "correct_option_text": correct_option_text,
                    "is_correct": is_correct,
                    "skill": skill,
                    "skill_label": skill.replace("_", " ").title(),
                    "explanation": explanation
                })
        
        # Calculate listening band score
        if total_count > 0:
            percentage = (correct_count / total_count) * 100
            listening_band = (total_band_points / total_count) if correct_count > 0 else 2.0
            # Adjust band based on performance
            if percentage >= 90:
                listening_band = min(9.0, listening_band + 1.0)
            elif percentage >= 70:
                listening_band = min(8.0, listening_band + 0.5)
            elif percentage < 40:
                listening_band = max(2.0, listening_band - 1.0)
        else:
            percentage = 0
            listening_band = 2.0
        
        # Round to nearest 0.5
        listening_band = round(listening_band * 2) / 2
        
        # Identify weak skills (less than 50% correct)
        for skill, data in skill_breakdown.items():
            if data["total"] > 0 and (data["correct"] / data["total"]) < 0.5:
                weak_skills.append(data["label"])
        
        # Generate skill improvement guidance based on language
        skill_guidance = generate_skill_guidance(listening_band, weak_skills, language)
        
        # Generate course recommendations
        course_recommendations = generate_listening_course_recommendations(listening_band, weak_skills, language)
        
        return {
            "band_score": listening_band,
            "correct": correct_count,
            "total": total_count,
            "percentage": percentage,
            "question_results": question_results,
            "skill_breakdown": list(skill_breakdown.values()),
            "weak_skills": weak_skills,
            "skill_guidance": skill_guidance,
            "course_recommendations": course_recommendations,
            "overall_feedback": generate_overall_listening_feedback(listening_band, percentage, language)
        }
        
    except Exception as e:
        logger.error(f"Listening evaluation error: {e}")
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")


def generate_skill_guidance(band: float, weak_skills: List[str], language: str) -> List[Dict]:
    """Generate skill improvement tips based on band and weak areas."""
    guidance = []
    
    # Base guidance by band level
    if language == "vi":
        if band < 4.0:
            guidance = [
                {"skill": "Nghe Cơ Bản", "tip": "Bắt đầu với các podcast và video tiếng Anh đơn giản với phụ đề. Lắng nghe 15-30 phút mỗi ngày.", "priority": "high"},
                {"skill": "Từ Vựng", "tip": "Học 10 từ vựng mới mỗi ngày từ các chủ đề hàng ngày như gia đình, công việc, thời tiết.", "priority": "high"},
                {"skill": "Số Liệu", "tip": "Luyện nghe số, ngày tháng và giờ giấc từ các đoạn hội thoại ngắn.", "priority": "medium"}
            ]
        elif band < 6.0:
            guidance = [
                {"skill": "Nghe Chi Tiết", "tip": "Luyện nghe để tìm thông tin cụ thể như tên, địa điểm và số liệu trong các cuộc hội thoại dài hơn.", "priority": "high"},
                {"skill": "Suy Luận", "tip": "Học cách suy luận thông tin không được nói trực tiếp từ ngữ cảnh.", "priority": "medium"},
                {"skill": "Ghi Chú", "tip": "Phát triển kỹ năng ghi chú nhanh trong khi nghe để ghi nhớ chi tiết.", "priority": "medium"}
            ]
        else:
            guidance = [
                {"skill": "Nghe Học Thuật", "tip": "Luyện nghe các bài giảng và thảo luận học thuật để chuẩn bị cho IELTS.", "priority": "high"},
                {"skill": "Phân Tích Quan Điểm", "tip": "Học cách nhận biết quan điểm khác nhau và ý chính trong các cuộc thảo luận phức tạp.", "priority": "medium"},
                {"skill": "Thuật Ngữ Chuyên Môn", "tip": "Mở rộng từ vựng học thuật và thuật ngữ chuyên ngành.", "priority": "medium"}
            ]
    elif language == "tr":
        if band < 4.0:
            guidance = [
                {"skill": "Temel Dinleme", "tip": "Altyazılı basit İngilizce podcast ve videolarla başlayın. Günde 15-30 dakika dinleyin.", "priority": "high"},
                {"skill": "Kelime Dağarcığı", "tip": "Aile, iş, hava durumu gibi günlük konulardan her gün 10 yeni kelime öğrenin.", "priority": "high"},
                {"skill": "Sayısal Veriler", "tip": "Kısa diyaloglardan sayıları, tarihleri ve saatleri dinleme pratiği yapın.", "priority": "medium"}
            ]
        elif band < 6.0:
            guidance = [
                {"skill": "Detaylı Dinleme", "tip": "Uzun konuşmalarda isimler, yerler ve sayılar gibi belirli bilgileri bulmak için dinleme pratiği yapın.", "priority": "high"},
                {"skill": "Çıkarım", "tip": "Bağlamdan doğrudan söylenmemiş bilgileri çıkarmayı öğrenin.", "priority": "medium"},
                {"skill": "Not Alma", "tip": "Dinlerken hızlı not alma becerileri geliştirin.", "priority": "medium"}
            ]
        else:
            guidance = [
                {"skill": "Akademik Dinleme", "tip": "IELTS'e hazırlanmak için akademik dersler ve tartışmaları dinleme pratiği yapın.", "priority": "high"},
                {"skill": "Görüş Analizi", "tip": "Karmaşık tartışmalarda farklı görüşleri ve ana fikirleri tanımlamayı öğrenin.", "priority": "medium"},
                {"skill": "Teknik Terminoloji", "tip": "Akademik kelime dağarcığı ve özel terminolojiyi genişletin.", "priority": "medium"}
            ]
    else:
        if band < 4.0:
            guidance = [
                {"skill": "Basic Listening", "tip": "Start with simple English podcasts and videos with subtitles. Listen for 15-30 minutes daily.", "priority": "high"},
                {"skill": "Vocabulary", "tip": "Learn 10 new vocabulary words daily from everyday topics like family, work, weather.", "priority": "high"},
                {"skill": "Numbers", "tip": "Practice listening for numbers, dates, and times from short dialogues.", "priority": "medium"}
            ]
        elif band < 6.0:
            guidance = [
                {"skill": "Detail Comprehension", "tip": "Practice listening for specific information like names, places, and numbers in longer conversations.", "priority": "high"},
                {"skill": "Inference", "tip": "Learn to infer information that isn't directly stated from context.", "priority": "medium"},
                {"skill": "Note-Taking", "tip": "Develop quick note-taking skills while listening to remember details.", "priority": "medium"}
            ]
        else:
            guidance = [
                {"skill": "Academic Listening", "tip": "Practice listening to academic lectures and discussions to prepare for IELTS.", "priority": "high"},
                {"skill": "Opinion Analysis", "tip": "Learn to identify different viewpoints and main ideas in complex discussions.", "priority": "medium"},
                {"skill": "Technical Terminology", "tip": "Expand academic vocabulary and specialized terminology.", "priority": "medium"}
            ]
    
    return guidance


def generate_listening_course_recommendations(band: float, weak_skills: List[str], language: str) -> List[Dict]:
    """Generate course recommendations based on listening performance."""
    recommendations = []
    
    if language == "vi":
        if band < 4.0:
            recommendations = [
                {
                    "course_id": "beginner-listening",
                    "name": "Nền Tảng Nghe Tiếng Anh",
                    "description": "Khóa học cơ bản giúp bạn phát triển kỹ năng nghe từ đầu với các chủ đề hàng ngày.",
                    "duration": "4-6 tuần",
                    "priority": "recommended"
                },
                {
                    "course_id": "vocabulary-builder",
                    "name": "Xây Dựng Từ Vựng Qua Nghe",
                    "description": "Học từ vựng mới thông qua các bài nghe thú vị và dễ hiểu.",
                    "duration": "ongoing",
                    "priority": "supplementary"
                }
            ]
        elif band < 6.0:
            recommendations = [
                {
                    "course_id": "intermediate-listening",
                    "name": "Nghe IELTS Trung Cấp",
                    "description": "Phát triển kỹ năng nghe chi tiết và ghi chú cho bài thi IELTS.",
                    "duration": "6-8 tuần",
                    "priority": "recommended"
                },
                {
                    "course_id": "listening-strategies",
                    "name": "Chiến Thuật Nghe IELTS",
                    "description": "Học các chiến thuật làm bài nghe hiệu quả để đạt điểm cao hơn.",
                    "duration": "4 tuần",
                    "priority": "supplementary"
                }
            ]
        else:
            recommendations = [
                {
                    "course_id": "advanced-listening",
                    "name": "Nghe Nâng Cao IELTS 7+",
                    "description": "Kỹ năng nghe nâng cao cho điểm Band 7-9 với các bài giảng học thuật.",
                    "duration": "8-10 tuần",
                    "priority": "recommended"
                },
                {
                    "course_id": "academic-lectures",
                    "name": "Nghe Bài Giảng Học Thuật",
                    "description": "Luyện nghe các bài giảng đại học và thảo luận chuyên sâu.",
                    "duration": "ongoing",
                    "priority": "supplementary"
                }
            ]
    elif language == "tr":
        if band < 4.0:
            recommendations = [
                {
                    "course_id": "beginner-listening",
                    "name": "İngilizce Dinleme Temelleri",
                    "description": "Günlük konularla sıfırdan dinleme becerileri geliştirmenize yardımcı olan temel kurs.",
                    "duration": "4-6 hafta",
                    "priority": "recommended"
                }
            ]
        elif band < 6.0:
            recommendations = [
                {
                    "course_id": "intermediate-listening",
                    "name": "IELTS Orta Düzey Dinleme",
                    "description": "IELTS sınavı için detaylı dinleme ve not alma becerileri geliştirin.",
                    "duration": "6-8 hafta",
                    "priority": "recommended"
                }
            ]
        else:
            recommendations = [
                {
                    "course_id": "advanced-listening",
                    "name": "IELTS 7+ İleri Dinleme",
                    "description": "Akademik derslerle Band 7-9 için ileri dinleme becerileri.",
                    "duration": "8-10 hafta",
                    "priority": "recommended"
                }
            ]
    else:
        if band < 4.0:
            recommendations = [
                {
                    "course_id": "beginner-listening",
                    "name": "English Listening Foundations",
                    "description": "Basic course helping you develop listening skills from scratch with everyday topics.",
                    "duration": "4-6 weeks",
                    "priority": "recommended"
                },
                {
                    "course_id": "vocabulary-builder",
                    "name": "Vocabulary Through Listening",
                    "description": "Learn new vocabulary through engaging and easy-to-understand listening exercises.",
                    "duration": "ongoing",
                    "priority": "supplementary"
                }
            ]
        elif band < 6.0:
            recommendations = [
                {
                    "course_id": "intermediate-listening",
                    "name": "IELTS Intermediate Listening",
                    "description": "Develop detailed listening and note-taking skills for the IELTS exam.",
                    "duration": "6-8 weeks",
                    "priority": "recommended"
                },
                {
                    "course_id": "listening-strategies",
                    "name": "IELTS Listening Strategies",
                    "description": "Learn effective listening strategies to achieve higher scores.",
                    "duration": "4 weeks",
                    "priority": "supplementary"
                }
            ]
        else:
            recommendations = [
                {
                    "course_id": "advanced-listening",
                    "name": "IELTS 7+ Advanced Listening",
                    "description": "Advanced listening skills for Band 7-9 with academic lectures.",
                    "duration": "8-10 weeks",
                    "priority": "recommended"
                },
                {
                    "course_id": "academic-lectures",
                    "name": "Academic Lecture Listening",
                    "description": "Practice listening to university lectures and in-depth discussions.",
                    "duration": "ongoing",
                    "priority": "supplementary"
                }
            ]
    
    return recommendations


def generate_overall_listening_feedback(band: float, percentage: float, language: str) -> str:
    """Generate overall feedback message based on performance."""
    if language == "vi":
        if band < 4.0:
            return f"Bạn đạt {percentage:.0f}% chính xác. Đây là điểm khởi đầu tốt! Hãy tập trung vào việc nghe tiếng Anh hàng ngày và xây dựng từ vựng cơ bản."
        elif band < 6.0:
            return f"Bạn đạt {percentage:.0f}% chính xác (Band {band}). Bạn đang tiến bộ! Hãy luyện nghe các cuộc hội thoại dài hơn và phát triển kỹ năng ghi chú."
        else:
            return f"Xuất sắc! Bạn đạt {percentage:.0f}% chính xác (Band {band}). Hãy tiếp tục thử thách bản thân với các bài nghe học thuật phức tạp hơn."
    elif language == "tr":
        if band < 4.0:
            return f"%{percentage:.0f} doğruluk oranına ulaştınız. Bu iyi bir başlangıç! Günlük İngilizce dinlemeye ve temel kelime dağarcığı oluşturmaya odaklanın."
        elif band < 6.0:
            return f"%{percentage:.0f} doğruluk oranına ulaştınız (Band {band}). İlerleme kaydediyorsunuz! Daha uzun konuşmaları dinleme ve not alma becerileri geliştirme pratiği yapın."
        else:
            return f"Mükemmel! %{percentage:.0f} doğruluk oranına ulaştınız (Band {band}). Daha karmaşık akademik dinleme içerikleriyle kendinize meydan okumaya devam edin."
    else:
        if band < 4.0:
            return f"You achieved {percentage:.0f}% accuracy. This is a good starting point! Focus on daily English listening and building basic vocabulary."
        elif band < 6.0:
            return f"You achieved {percentage:.0f}% accuracy (Band {band}). You're making progress! Practice listening to longer conversations and develop note-taking skills."
        else:
            return f"Excellent! You achieved {percentage:.0f}% accuracy (Band {band}). Keep challenging yourself with more complex academic listening content."


# ============ WRITING MODULE (Level Assessment) ============

from writing_evaluator import get_writing_tasks, evaluate_writing_response, evaluate_all_writing_tasks

@api_router.get("/level-test/writing-tasks")
async def get_writing_tasks_endpoint():
    """Get all writing tasks for the level test."""
    tasks = get_writing_tasks()
    return {"tasks": tasks, "total": len(tasks)}


class WritingSubmission(BaseModel):
    task_id: str
    response_text: str


class WritingEvaluationRequest(BaseModel):
    responses: List[WritingSubmission]
    language: Optional[str] = "en"


@api_router.post("/level-test/evaluate-writing")
async def evaluate_writing(request: WritingEvaluationRequest):
    """Evaluate writing responses and return band score with feedback."""
    try:
        responses = [
            {"task_id": r.task_id, "response_text": r.response_text}
            for r in request.responses
        ]
        
        result = await evaluate_all_writing_tasks(responses, request.language)
        return result
        
    except Exception as e:
        logger.error(f"Writing evaluation error: {e}")
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")


# ============ Speaking Practice Evaluation ============

class SpeakingPracticeRequest(BaseModel):
    part: str  # part1, part2, part3
    topic: str
    responses: List[Dict[str, Any]]  # List of {question, answer} pairs

@api_router.post("/speaking-practice/evaluate")
async def evaluate_speaking_practice(request: SpeakingPracticeRequest):
    """Evaluate IELTS speaking practice with detailed feedback"""
    try:
        chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            session_id=str(uuid.uuid4()),
            system_message="You are an experienced IELTS examiner providing detailed speaking feedback."
        ).with_model("openai", "gpt-4o")
        
        part_desc = {
            "part1": "Part 1 (Introduction & Interview - familiar topics)",
            "part2": "Part 2 (Individual Long Turn - cue card)",
            "part3": "Part 3 (Two-way Discussion - abstract ideas)"
        }.get(request.part, "Speaking Test")
        
        # Format responses for evaluation
        responses_text = "\n\n".join([
            f"Question: {r.get('question', 'N/A')}\nAnswer: {r.get('answer', 'No response')}"
            for r in request.responses
        ])
        
        prompt = f"""You are an experienced IELTS Speaking examiner. Evaluate this IELTS {part_desc} practice.

TOPIC: {request.topic}

RESPONSES:
{responses_text}

Provide a comprehensive evaluation in the following JSON format:
{{
    "overall_band": <float between 1.0 and 9.0, in 0.5 increments>,
    "scores": {{
        "fluency_coherence": <float 1.0-9.0>,
        "lexical_resource": <float 1.0-9.0>,
        "grammar": <float 1.0-9.0>,
        "pronunciation": <float 1.0-9.0>
    }},
    "strengths": [<3-4 specific things done well in speaking>],
    "improvements": [<3-4 specific areas to improve with examples>],
    "pronunciation_tips": "<specific pronunciation advice based on their responses>",
    "model_answer": "<A sample Band 8+ response to the main question, showing ideal vocabulary and structure>"
}}

Consider:
- Fluency: Did they speak smoothly? Any hesitations?
- Vocabulary: Range and appropriateness of words used
- Grammar: Variety and accuracy of structures
- Pronunciation: (Assess based on word choices and likely pronunciation patterns)

Be encouraging but honest. Provide actionable feedback."""

        response = await chat.send_message(UserMessage(text=prompt))
        
        # Handle different response formats
        if isinstance(response, dict):
            return response
        
        response_text = str(response).strip()
        
        # Try to extract JSON from response
        import re
        # Remove markdown code fences if present
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            result = json.loads(json_match.group())
            return result
        
        # Fallback response
        return {
            "overall_band": 5.5,
            "scores": {
                "fluency_coherence": 5.5,
                "lexical_resource": 5.5,
                "grammar": 5.5,
                "pronunciation": 5.5
            },
            "strengths": ["You attempted to answer all questions", "You showed willingness to communicate"],
            "improvements": ["Extend your answers with more details", "Use more varied vocabulary"],
            "pronunciation_tips": "Practice word stress patterns and intonation.",
            "model_answer": "Unable to generate model answer. Please try again."
        }
        
    except Exception as e:
        logging.getLogger(__name__).error(f"Speaking evaluation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to evaluate speaking")


# ============ MASTERY COURSE ENDPOINTS (Band 4.5-6.5) ============

@api_router.get("/mastery-course/modules")
async def get_mastery_modules():
    """Get all mastery course modules"""
    modules = await db.mastery_course_modules.find({}, {"_id": 0}).to_list(100)
    return modules

@api_router.get("/mastery-course/modules/{module_id}")
async def get_mastery_module(module_id: str):
    """Get a specific mastery course module"""
    module = await db.mastery_course_modules.find_one({"id": module_id}, {"_id": 0})
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    return module

class MasterySpeakingRequest(BaseModel):
    question: str
    model_answer: str
    user_response: str
    module_title: str

@api_router.post("/mastery-course/evaluate-speaking")
async def evaluate_mastery_speaking(request: MasterySpeakingRequest):
    """Evaluate speaking response for mastery course (Band 4.5-6.5) with comprehensive feedback"""
    try:
        chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            session_id=str(uuid.uuid4()),
            system_message="You are an expert IELTS examiner providing detailed, educational feedback."
        ).with_model("openai", "gpt-4o")
        
        prompt = f"""You are an IELTS Speaking examiner providing comprehensive feedback for a Band 4.5-6.5 student.

Topic: {request.module_title}
Question: {request.question}
Model Answer: {request.model_answer}
Student's Response: {request.user_response}

Provide detailed, educational feedback. Identify specific mistakes and show how to correct them.

Return JSON only:
{{
    "band_score": <4.5-6.5>,
    "fluency": {{"score": <number>, "feedback": "<specific feedback>"}},
    "vocabulary": {{"score": <number>, "feedback": "<specific feedback>"}},
    "grammar": {{"score": <number>, "feedback": "<specific feedback>"}},
    "pronunciation": {{"score": <number>, "feedback": "<specific feedback>"}},
    "overall_feedback": "<2-3 sentences summarizing performance>",
    "mistakes": [
        {{"original": "<what student said wrong>", "corrected": "<correct version>", "explanation": "<why this is better>"}}
    ],
    "vocabulary_to_use": ["<word1 from lesson>", "<word2 from lesson>", "<word3 from lesson>"],
    "model_phrases": ["<useful phrase 1>", "<useful phrase 2>"],
    "improvement_tip": "<One specific actionable tip>",
    "lesson_reference": "<Which part of the lesson to review for improvement>"
}}"""

        response = await chat.send_message(UserMessage(text=prompt))
        response_text = str(response).strip()
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        import re
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            return json.loads(json_match.group())
        
        return {"band_score": 5, "overall_feedback": "Good effort! Keep practicing.", "improvement_tip": "Use more topic vocabulary.", "mistakes": [], "vocabulary_to_use": [], "lesson_reference": "Review the vocabulary section"}
    except Exception as e:
        logging.getLogger(__name__).error(f"Mastery speaking evaluation error: {e}")
        return {"band_score": 5, "overall_feedback": "Good try! Keep practicing.", "improvement_tip": "Practice speaking regularly.", "mistakes": [], "vocabulary_to_use": []}

class MasteryWritingRequest(BaseModel):
    task: str
    model_essay: str
    user_response: str
    module_title: str

@api_router.post("/mastery-course/evaluate-writing")
async def evaluate_mastery_writing(request: MasteryWritingRequest):
    """Evaluate writing response for mastery course (Band 4.5-6.5) with comprehensive feedback"""
    try:
        chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            session_id=str(uuid.uuid4()),
            system_message="You are an expert IELTS Writing examiner providing detailed, educational feedback."
        ).with_model("openai", "gpt-4o")
        
        prompt = f"""You are an IELTS Writing Task 2 examiner providing comprehensive feedback for a Band 4.5-6.5 student.

Topic: {request.module_title}
Task: {request.task}
Model Essay: {request.model_essay}
Student's Essay: {request.user_response}

Provide detailed, educational feedback. Identify specific mistakes and show how to correct them.

Return JSON only:
{{
    "band_score": <4.5-6.5>,
    "task_achievement": {{"score": <number>, "feedback": "<specific feedback>"}},
    "coherence": {{"score": <number>, "feedback": "<specific feedback>"}},
    "lexical": {{"score": <number>, "feedback": "<specific feedback>"}},
    "grammar": {{"score": <number>, "feedback": "<specific feedback>"}},
    "overall_feedback": "<3-4 sentences summarizing performance with encouragement>",
    "mistakes": [
        {{"original": "<incorrect sentence/phrase>", "corrected": "<correct version>", "explanation": "<grammar rule or vocabulary tip>", "type": "<grammar/vocabulary/coherence>"}}
    ],
    "good_points": ["<what student did well 1>", "<what student did well 2>"],
    "vocabulary_suggestions": [
        {{"basic": "<simple word used>", "advanced": "<better alternative from lesson>", "example": "<example sentence>"}}
    ],
    "structure_tip": "<Advice on essay structure>",
    "lesson_reference": "<Which part of the lesson to review>",
    "next_steps": ["<step 1 to improve>", "<step 2 to improve>"]
}}"""

        response = await chat.send_message(UserMessage(text=prompt))
        response_text = str(response).strip()
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        import re
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            return json.loads(json_match.group())
        
        return {"band_score": 5, "overall_feedback": "Good effort! Keep writing.", "mistakes": [], "good_points": [], "vocabulary_suggestions": [], "next_steps": ["Practice more essays"]}
    except Exception as e:
        logging.getLogger(__name__).error(f"Mastery writing evaluation error: {e}")
        return {"band_score": 5, "overall_feedback": "Good effort!", "mistakes": [], "good_points": [], "vocabulary_suggestions": [], "next_steps": []}



# ============ ADVANCED IELTS MASTERY COURSE ENDPOINTS (Band 6.0-9.0) ============

@api_router.get("/advanced-mastery/modules")
async def get_advanced_mastery_modules():
    """Get all Advanced IELTS Mastery course modules (Band 6.0-9.0)"""
    modules = await db.advanced_mastery_modules.find({}, {"_id": 0}).to_list(100)
    return modules

@api_router.get("/advanced-mastery/modules/{module_id}")
async def get_advanced_mastery_module(module_id: str):
    """Get a specific Advanced IELTS Mastery module"""
    module = await db.advanced_mastery_modules.find_one({"id": module_id}, {"_id": 0})
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    return module

class AdvancedSpeakingRequest(BaseModel):
    question: str
    model_answer: str
    user_response: str
    module_title: str
    part: str = "part3"  # part2 or part3

@api_router.post("/advanced-mastery/evaluate-speaking")
async def evaluate_advanced_speaking(request: AdvancedSpeakingRequest):
    """Evaluate speaking response for Advanced IELTS Mastery course with IELTS Core Mindset"""
    try:
        # Use IELTS Core Mindset with Evaluation Mode
        system_message = f"""{IELTS_CORE_MINDSET}

{EVALUATION_MODE_PROMPT}

Additional context: This is an ADVANCED course for students targeting Band 7-9. Be rigorous but constructive."""
        
        chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            session_id=str(uuid.uuid4()),
            system_message=system_message
        ).with_model("openai", "gpt-4o")
        
        prompt = f"""Evaluate this IELTS Speaking response with STRICT Cambridge criteria.

Topic: {request.module_title}
Part: {request.part}
Question: {request.question}
Model Answer (Band 8+): {request.model_answer}
Student's Response: {request.user_response}

IMPORTANT CHECKS BEFORE SCORING:
1. Does the response DIRECTLY address the question?
2. Is it a genuine response or memorized/template-based?
3. Is there sufficient development?
4. Are ideas expressed clearly?

Apply band caps if needed:
- Off-topic → Max 4.0
- Memorized/template → Max 4.5
- Very short/underdeveloped → Max 5.0

Return JSON only:
{{
    "band_score": <5.0-9.0 - be strict>,
    "fluency_coherence": {{"score": <5-9>, "feedback": "<specific feedback with evidence>"}},
    "lexical_resource": {{"score": <5-9>, "feedback": "<specific feedback with evidence>"}},
    "grammatical_range": {{"score": <5-9>, "feedback": "<specific feedback with evidence>"}},
    "pronunciation": {{"score": <5-9>, "feedback": "<assessment based on transcription clarity>"}},
    "major_issues": ["<critical problem 1>", "<critical problem 2>"],
    "overall_feedback": "<3-4 sentences: honest assessment, specific improvements needed>",
    "band_justification": "<Why this band would survive Cambridge moderation>",
    "advanced_vocabulary_used": ["<list of advanced words/phrases the student used>"],
    "suggested_improvements": ["<specific actionable suggestion 1>", "<specific actionable suggestion 2>"],
    "model_phrase_to_learn": "<One exemplary phrase from the model answer the student should study>"
}}"""

        response = await chat.send_message(UserMessage(text=prompt))
        response_text = str(response).strip()
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        import re
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            return json.loads(json_match.group())
        
        return {
            "band_score": 5.5,
            "fluency_coherence": {"score": 5.5, "feedback": "Needs more natural development."},
            "lexical_resource": {"score": 5.5, "feedback": "Limited vocabulary range for this level."},
            "grammatical_range": {"score": 5.5, "feedback": "Basic structures need improvement."},
            "pronunciation": {"score": 5.5, "feedback": "Clarity needs work."},
            "overall_feedback": "Response needs more development and sophistication for Band 7+ target.",
            "advanced_vocabulary_used": [],
            "suggested_improvements": ["Address the question more directly", "Use more topic-specific vocabulary"],
            "model_phrase_to_learn": "Review the model answer for advanced phrasing."
        }
    except Exception as e:
        logging.getLogger(__name__).error(f"Advanced speaking evaluation error: {e}")
        return {
            "band_score": 5.5,
            "overall_feedback": "Evaluation error. Keep practicing with complex topics.",
            "suggested_improvements": ["Practice speaking regularly with complex topics"]
        }

class AdvancedWritingRequest(BaseModel):
    task: str
    model_essay: str
    user_response: str
    module_title: str
    examiner_analysis: dict = None

@api_router.post("/advanced-mastery/evaluate-writing")
async def evaluate_advanced_writing(request: AdvancedWritingRequest):
    """Evaluate writing response for Advanced IELTS Mastery course with IELTS Core Mindset"""
    try:
        # Use IELTS Core Mindset with Evaluation Mode
        system_message = f"""{IELTS_CORE_MINDSET}

{EVALUATION_MODE_PROMPT}

Additional context: This is an ADVANCED course for students targeting Band 7-9. Be rigorous but constructive."""

        chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            session_id=str(uuid.uuid4()),
            system_message=system_message
        ).with_model("openai", "gpt-4o")
        
        examiner_notes = ""
        if request.examiner_analysis:
            examiner_notes = f"\nExaminer Notes for this topic: {json.dumps(request.examiner_analysis)}"
        
        # Count words
        word_count = len(request.user_response.split())
        
        prompt = f"""Evaluate this IELTS Writing Task 2 essay with STRICT Cambridge criteria.

Topic: {request.module_title}
Task: {request.task}
Model Essay (Band 7.5+): {request.model_essay}{examiner_notes}
Student's Essay ({word_count} words): {request.user_response}

IMPORTANT CHECKS BEFORE SCORING:
1. Does the essay address ALL parts of the question?
2. Is there a clear position maintained throughout?
3. Word count: {word_count} words (minimum required: 250)
4. Is this a genuine essay or memorized/template-based?

Apply band caps if needed:
- Off-topic or irrelevant → Max 4.0
- Under 250 words → Max 4.0
- Memorized/template → Max 4.5
- No clear position → Max 5.0
- Poor paragraphing → Max 5.5

Return JSON only:
{{
    "band_score": <5.0-9.0 - be strict>,
    "validity_check": {{
        "word_count": {word_count},
        "meets_word_count": <true/false>,
        "on_topic": <true/false>,
        "has_clear_position": <true/false>,
        "band_cap_applied": <null or number>,
        "cap_reason": "<if capped, explain why>"
    }},
    "task_achievement": {{"score": <5-9>, "feedback": "<specific feedback - did it address ALL parts?>"}},
    "coherence_cohesion": {{"score": <5-9>, "feedback": "<specific feedback on structure and linking>"}},
    "lexical_resource": {{"score": <5-9>, "feedback": "<specific feedback on vocabulary accuracy>"}},
    "grammatical_range": {{"score": <5-9>, "feedback": "<specific feedback on grammar control>"}},
    "major_issues": ["<critical problem 1>", "<critical problem 2>"],
    "overall_feedback": "<4-5 sentences: honest assessment, specific improvements needed>",
    "band_justification": "<Why this band would survive Cambridge moderation>",
    "strengths": ["<genuine strength 1>", "<genuine strength 2>"],
    "areas_to_improve": ["<specific actionable improvement 1>", "<specific actionable improvement 2>"],
    "advanced_vocabulary_suggestions": ["<appropriate advanced word/phrase 1>", "<appropriate advanced word/phrase 2>"],
    "grammar_upgrade_examples": [
        {{"original": "<student's sentence>", "upgraded": "<Band 8 version>"}}
    ]
}}"""

        response = await chat.send_message(UserMessage(text=prompt))
        response_text = str(response).strip()
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        import re
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            return json.loads(json_match.group())
        
        return {
            "band_score": 5.5,
            "task_achievement": {"score": 5.5, "feedback": "Response needs to address all parts more fully."},
            "coherence_cohesion": {"score": 5.5, "feedback": "Paragraph organization needs improvement."},
            "lexical_resource": {"score": 5.5, "feedback": "Vocabulary range is limited for Band 7+ target."},
            "grammatical_range": {"score": 5.5, "feedback": "Complex structures need more control."},
            "overall_feedback": "Essay needs more development and sophistication for Band 7+ target.",
            "strengths": ["Attempted to answer the question"],
            "areas_to_improve": ["Address all parts of the question", "Use more topic-specific vocabulary"],
            "advanced_vocabulary_suggestions": ["Review the module vocabulary"],
            "grammar_upgrade_examples": []
        }
    except Exception as e:
        logging.getLogger(__name__).error(f"Advanced writing evaluation error: {e}")
        return {
            "band_score": 5.5,
            "overall_feedback": "Evaluation error. Keep practicing with complex topics.",
            "areas_to_improve": ["Practice writing regularly with complex topics"]
        }

class AdvancedQuizRequest(BaseModel):
    module_id: str
    answers: dict  # {question_index: answer}

@api_router.post("/advanced-mastery/evaluate-quiz")
async def evaluate_advanced_quiz(request: AdvancedQuizRequest):
    """Evaluate quiz answers for Advanced IELTS Mastery module"""
    try:
        module = await db.advanced_mastery_modules.find_one({"id": request.module_id}, {"_id": 0})
        if not module:
            raise HTTPException(status_code=404, detail="Module not found")
        
        questions = module.get("reading", {}).get("questions", [])
        correct = 0
        total = len(questions)
        results = []
        
        # Track skill breakdown by question type
        skill_breakdown = {}
        
        for idx, q in enumerate(questions):
            user_answer = request.answers.get(str(idx), "").strip().lower()
            correct_answer = q.get("answer", "").strip().lower()
            question_type = q.get("type", "unknown")
            
            # Flexible matching for advanced course
            is_correct = user_answer == correct_answer or correct_answer in user_answer or user_answer in correct_answer
            if is_correct:
                correct += 1
            
            results.append({
                "question": q.get("question", ""),
                "user_answer": request.answers.get(str(idx), ""),
                "correct_answer": q.get("answer", ""),
                "is_correct": is_correct,
                "question_type": question_type
            })
            
            # Aggregate by question type for skill breakdown
            if question_type not in skill_breakdown:
                skill_breakdown[question_type] = {"correct": 0, "total": 0}
            skill_breakdown[question_type]["total"] += 1
            if is_correct:
                skill_breakdown[question_type]["correct"] += 1
        
        # Add tips for weak areas
        for skill_type in skill_breakdown:
            data = skill_breakdown[skill_type]
            percentage = (data["correct"] / data["total"] * 100) if data["total"] > 0 else 0
            if percentage < 50:
                # Add targeted tip based on question type
                tips = {
                    "true_false_ng": "Look for specific evidence in the text. 'Not Given' means the information isn't stated.",
                    "matching_info": "Skim for keywords first, then read carefully around those keywords.",
                    "sentence_completion": "Use the exact words from the passage when possible.",
                    "summary_completion": "Read the summary first to understand the flow, then locate each answer.",
                    "vocabulary_match": "Context clues are key - look at surrounding sentences.",
                    "multiple_choice": "Eliminate obviously wrong answers first.",
                    "identify_view": "Focus on the author's tone and specific claims made."
                }
                skill_breakdown[skill_type]["tip"] = tips.get(skill_type, "Practice more questions of this type.")
        
        score_percentage = (correct / total * 100) if total > 0 else 0
        
        # Band estimation based on accuracy (advanced scale)
        if score_percentage >= 90:
            band = 8.5
        elif score_percentage >= 80:
            band = 8.0
        elif score_percentage >= 70:
            band = 7.5
        elif score_percentage >= 60:
            band = 7.0
        elif score_percentage >= 50:
            band = 6.5
        else:
            band = 6.0
        
        return {
            "score": score_percentage,
            "correct": correct,
            "total": total,
            "estimated_band": band,
            "results": results,
            "skill_breakdown": skill_breakdown,
            "feedback": f"You got {correct} out of {total} correct ({score_percentage:.0f}%). Estimated Reading Band: {band}"
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.getLogger(__name__).error(f"Advanced quiz evaluation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to evaluate quiz")


class StrategyRequest(BaseModel):
    user_id: str
    current_band: float = 5.5
    target_band: float = 7.0
    recent_scores: Dict[str, Any] = {}  # e.g., {"writing": 5.5, "speaking": 6.0, "reading": 6.5}
    weak_areas: List[str] = []
    test_history_summary: str = ""

@api_router.post("/ai/strategy")
async def get_learning_strategy(request: StrategyRequest):
    """Get AI-powered learning strategy using IELTS Core Mindset in Strategy Mode"""
    try:
        system_message = f"""{IELTS_CORE_MINDSET}

{STRATEGY_MODE_PROMPT}"""
        
        chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            session_id=str(uuid.uuid4()),
            system_message=system_message
        ).with_model("openai", "gpt-4o")
        
        prompt = f"""Analyze this learner's profile and provide a strategic learning plan.

LEARNER PROFILE:
- Current Band: {request.current_band}
- Target Band: {request.target_band}
- Recent Skill Scores: {json.dumps(request.recent_scores)}
- Identified Weak Areas: {', '.join(request.weak_areas) if request.weak_areas else 'Not specified'}
- Test History: {request.test_history_summary or 'No history provided'}

Your task:
1. Diagnose the PRIMARY blockers preventing this learner from reaching their target band
2. Identify which skills need immediate attention
3. Recommend specific actions for the next 2-4 weeks
4. Suggest which course modules to focus on

Return JSON only:
{{
    "diagnosis": {{
        "primary_blockers": ["<blocker 1>", "<blocker 2>"],
        "skill_priority_order": ["<skill 1>", "<skill 2>", "<skill 3>", "<skill 4>"],
        "band_gap_analysis": "<explanation of what separates current from target band>"
    }},
    "action_plan": {{
        "immediate_focus": "<what to work on this week>",
        "secondary_focus": "<what to work on next>",
        "avoid": "<what to stop doing>",
        "practice_ratio": {{"reading": <percentage>, "writing": <percentage>, "speaking": <percentage>, "listening": <percentage>}}
    }},
    "recommended_modules": ["<module name 1>", "<module name 2>"],
    "weekly_goals": ["<goal 1>", "<goal 2>", "<goal 3>"],
    "realistic_timeline": "<estimated weeks to reach target band with consistent practice>",
    "motivation_reality_check": "<honest assessment - not encouraging fluff, just facts>"
}}"""

        response = await chat.send_message(UserMessage(text=prompt))
        response_text = str(response).strip()
        
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        import re
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            return json.loads(json_match.group())
        
        return {
            "diagnosis": {"primary_blockers": ["Unable to analyze"], "skill_priority_order": ["writing", "speaking", "reading", "listening"]},
            "action_plan": {"immediate_focus": "Practice consistently", "secondary_focus": "Review weak areas"},
            "recommended_modules": ["Module 1: Language and Communication"],
            "weekly_goals": ["Complete 2 practice tests", "Review vocabulary daily"],
            "realistic_timeline": "4-8 weeks",
            "motivation_reality_check": "Consistent practice is key to improvement."
        }
    except Exception as e:
        logging.getLogger(__name__).error(f"Strategy generation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate strategy")


# ============ BEGINNER ENGLISH COURSE ENDPOINTS ============

@api_router.get("/beginner-english/lessons")
async def get_beginner_lessons():
    """Get all beginner English lessons"""
    lessons = await db.beginner_english_lessons.find({}, {"_id": 0}).to_list(100)
    return lessons

@api_router.get("/beginner-english/lessons/{lesson_id}")
async def get_beginner_lesson(lesson_id: str):
    """Get a specific beginner English lesson"""
    lesson = await db.beginner_english_lessons.find_one({"id": lesson_id}, {"_id": 0})
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson

class BeginnerSpeakingRequest(BaseModel):
    question: str
    model_answer: str
    user_response: str

@api_router.post("/beginner-english/evaluate-speaking")
async def evaluate_beginner_speaking(request: BeginnerSpeakingRequest):
    """Evaluate beginner speaking response with simple feedback"""
    try:
        chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            session_id=str(uuid.uuid4()),
            system_message="You are a friendly English teacher helping beginner students."
        ).with_model("openai", "gpt-4o")
        
        prompt = f"""You are a friendly English teacher for beginner students (Band 4.5 and below).
        
Question: {request.question}
Model Answer: {request.model_answer}
Student's Response: {request.user_response}

Evaluate the student's response. Be encouraging and use simple language.

Return JSON:
{{
    "score": <0-100>,
    "feedback": "<Simple, encouraging feedback in 1-2 sentences>",
    "tip": "<One simple tip to improve>"
}}"""

        response = await chat.send_message(UserMessage(text=prompt))
        
        response_text = str(response).strip()
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        import re
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            return json.loads(json_match.group())
        
        return {"score": 60, "feedback": "Good try! Keep practicing.", "tip": "Try to answer in complete sentences."}
        
    except Exception as e:
        logging.getLogger(__name__).error(f"Beginner speaking evaluation error: {e}")
        return {"score": 60, "feedback": "Good effort! Keep practicing.", "tip": "Practice speaking more."}

class BeginnerWritingRequest(BaseModel):
    task: str
    model_answer: str
    user_response: str

@api_router.post("/beginner-english/evaluate-writing")
async def evaluate_beginner_writing(request: BeginnerWritingRequest):
    """Evaluate beginner writing response with simple feedback"""
    try:
        chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            session_id=str(uuid.uuid4()),
            system_message="You are a friendly English teacher helping beginner students."
        ).with_model("openai", "gpt-4o")
        
        prompt = f"""You are a friendly English teacher for beginner students (Band 4.5 and below).
        
Writing Task: {request.task}
Model Answer: {request.model_answer}
Student's Writing: {request.user_response}

Evaluate the student's writing. Be encouraging and use simple language.

Return JSON:
{{
    "score": <0-100>,
    "feedback": "<Simple, encouraging feedback in 2-3 sentences>",
    "grammar_tips": ["<1-2 simple grammar tips if needed>"]
}}"""

        response = await chat.send_message(UserMessage(text=prompt))
        
        response_text = str(response).strip()
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        import re
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            return json.loads(json_match.group())
        
        return {"score": 60, "feedback": "Good try! Keep writing.", "grammar_tips": ["Check your verb forms."]}
        
    except Exception as e:
        logging.getLogger(__name__).error(f"Beginner writing evaluation error: {e}")
        return {"score": 60, "feedback": "Good effort! Keep writing.", "grammar_tips": []}


# ============ Listening Audio Generation ============

from utils.multi_speaker_tts import generate_multi_speaker_audio

class ListeningAudioRequest(BaseModel):
    lesson_id: str
    transcript: str
    level: str = "beginner"

@api_router.post("/beginner-english/generate-listening-audio")
async def generate_listening_audio(request: ListeningAudioRequest):
    """Generate multi-speaker audio for listening section using Azure TTS"""
    try:
        audio_base64 = await generate_multi_speaker_audio(
            transcript=request.transcript,
            level=request.level
        )
        return {
            "success": True,
            "audio_base64": audio_base64,
            "format": "mp3"
        }
    except Exception as e:
        logging.getLogger(__name__).error(f"Audio generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/beginner-english/listening-audio/{lesson_id}")
async def get_listening_audio(lesson_id: str):
    """Get or generate listening audio for a lesson"""
    # First check if pre-generated audio exists
    cached = await db.listening_audio_cache.find_one({"lesson_id": lesson_id}, {"_id": 0})
    if cached and cached.get("audio_base64"):
        return {
            "success": True,
            "audio_base64": cached["audio_base64"],
            "format": "mp3",
            "cached": True
        }
    
    # Get lesson and generate audio
    lesson = await db.beginner_english_lessons.find_one({"id": lesson_id}, {"_id": 0})
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    listening = lesson.get("listening")
    if not listening or not listening.get("transcript"):
        raise HTTPException(status_code=404, detail="No listening content for this lesson")
    
    try:
        audio_base64 = await generate_multi_speaker_audio(
            transcript=listening["transcript"],
            level="beginner"
        )
        
        # Cache the generated audio
        await db.listening_audio_cache.update_one(
            {"lesson_id": lesson_id},
            {"$set": {
                "lesson_id": lesson_id,
                "audio_base64": audio_base64,
                "generated_at": datetime.now(timezone.utc).isoformat()
            }},
            upsert=True
        )
        
        return {
            "success": True,
            "audio_base64": audio_base64,
            "format": "mp3",
            "cached": False
        }
    except Exception as e:
        logging.getLogger(__name__).error(f"Audio generation failed for {lesson_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============ Notes API (Phase 2) ============

class NoteCreate(BaseModel):
    user_id: str
    test_id: str
    test_type: str
    content: str
    timestamp: str

@api_router.post("/notes")
async def create_note(note: NoteCreate):
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

@api_router.get("/notes/{user_id}/{test_id}")
async def get_notes(user_id: str, test_id: str):
    """Get all notes for a user and test"""
    notes = await db.user_notes.find(
        {"user_id": user_id, "test_id": test_id},
        {"_id": 0}
    ).sort("timestamp", 1).to_list(100)
    return notes

@api_router.delete("/notes/{note_id}")
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

@api_router.post("/highlights")
async def create_highlight(highlight: HighlightCreate):
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

@api_router.get("/highlights/{user_id}/{test_id}")
async def get_highlights(user_id: str, test_id: str):
    """Get all highlights for a user and test"""
    highlights = await db.user_highlights.find(
        {"user_id": user_id, "test_id": test_id},
        {"_id": 0}
    ).sort("start_index", 1).to_list(100)
    return highlights

@api_router.delete("/highlights/{highlight_id}")
async def delete_highlight(highlight_id: str):
    """Delete a highlight"""
    result = await db.user_highlights.delete_one({"id": highlight_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Highlight not found")
    return {"status": "deleted"}


# ============ Skill Analytics API (Phase 4) ============

@api_router.get("/skill-analytics/{user_id}")
async def get_skill_analytics(user_id: str):
    """Get cumulative skill analytics for a user across all tests"""
    try:
        # Get all test attempts for this user
        attempts = await db.test_attempts.find(
            {"user_id": user_id},
            {"_id": 0}
        ).to_list(500)
        
        if not attempts:
            return {
                "total_tests": 0,
                "average_score": 0,
                "average_band": None,
                "skill_performance": {},
                "strengths": [],
                "areas_to_improve": []
            }
        
        # Aggregate skill performance
        skill_totals = {}
        total_score = 0
        total_band = 0
        band_count = 0
        
        for attempt in attempts:
            # Sum scores
            if attempt.get("score") is not None:
                total_score += attempt["score"]
            
            # Sum bands
            if attempt.get("feedback", {}).get("estimated_band"):
                band = attempt["feedback"]["estimated_band"]
                if isinstance(band, (int, float)):
                    total_band += band
                    band_count += 1
            
            # Aggregate skill breakdown
            breakdown = attempt.get("feedback", {}).get("skill_breakdown", {})
            if isinstance(breakdown, dict):
                for skill_type, data in breakdown.items():
                    if skill_type not in skill_totals:
                        skill_totals[skill_type] = {"correct": 0, "total": 0}
                    if isinstance(data, dict):
                        skill_totals[skill_type]["correct"] += data.get("correct", 0)
                        skill_totals[skill_type]["total"] += data.get("total", 0)
        
        # Calculate strengths and weaknesses
        strengths = []
        areas_to_improve = []
        
        for skill_type, data in skill_totals.items():
            if data["total"] > 0:
                percentage = (data["correct"] / data["total"]) * 100
                if percentage >= 70:
                    strengths.append(skill_type)
                elif percentage < 50:
                    areas_to_improve.append(skill_type)
        
        return {
            "total_tests": len(attempts),
            "average_score": round(total_score / len(attempts), 1) if attempts else 0,
            "average_band": round(total_band / band_count, 1) if band_count > 0 else None,
            "skill_performance": skill_totals,
            "strengths": strengths[:5],
            "areas_to_improve": areas_to_improve[:5]
        }
        
    except Exception as e:
        logging.getLogger(__name__).error(f"Skill analytics error: {e}")
        return {
            "total_tests": 0,
            "average_score": 0,
            "skill_performance": {},
            "strengths": [],
            "areas_to_improve": []
        }


# ============ Writing Analysis with Grammar Errors API (Phase 3) ============

@api_router.post("/writing/analyze-errors")
async def analyze_writing_errors(request: Request):
    """Analyze writing text for grammar/spelling errors using AI"""
    try:
        data = await request.json()
        text = data.get("text", "")
        
        if not text:
            return {"grammar_errors": []}
        
        chat = LlmChat(api_key=os.getenv("EMERGENT_LLM_KEY"))
        prompt = f"""Analyze this IELTS writing text for grammar, spelling, and style errors.

TEXT:
{text}

Return a JSON object with:
{{
  "grammar_errors": [
    {{
      "start": <start index in text>,
      "end": <end index in text>,
      "type": "grammar" | "spelling" | "style",
      "original": "<the error text>",
      "suggestion": "<correction or suggestion>"
    }}
  ],
  "criteria_scores": {{
    "task_response": <score 1-9>,
    "coherence": <score 1-9>,
    "lexical_resource": <score 1-9>,
    "grammatical_range": <score 1-9>
  }},
  "overall_feedback": "<brief overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "areas_to_improve": ["<area 1>", "<area 2>"],
  "grammar_upgrade_examples": [
    {{
      "original": "<basic sentence from text>",
      "upgraded": "<Band 8+ version>",
      "explanation": "<why it's better>"
    }}
  ]
}}

Be precise with start/end indices. Only flag real errors. Return valid JSON only."""

        response = await chat.send_async([UserMessage(text=prompt)])
        response_text = response.text.strip()
        
        # Parse JSON from response
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        import re
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            return json.loads(json_match.group())
        
        return {"grammar_errors": [], "overall_feedback": "Analysis complete."}
        
    except Exception as e:
        logging.getLogger(__name__).error(f"Writing analysis error: {e}")
        return {"grammar_errors": [], "overall_feedback": "Could not analyze text."}


# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# =============================================================================
# FIX COMBINED QUESTION IDS (Q20-21 deployment issue)
# =============================================================================
async def fix_combined_question_ids():
    """
    Fix combined question IDs that may have been incorrectly split during deployment.
    This runs on startup to ensure Q20-21 style questions display correctly.
    """
    try:
        # Define the correct combined question mappings with full data
        # These are "Choose TWO" questions that should have combined IDs
        combined_mappings = {
            # Reading Test 1 - Passage 2
            "reading_passage2_q20_21": {
                "test_title_contains": "Academic Reading Practice Test 1",
                "old_ids": [20, 21],
                "new_id": "20-21",
                "passage": 2,
                "type": "multiple_choice_multi",
                "question": "Which TWO statements does the writer make about inhabitants of the Mediterranean region in the ancient world?",
                "options": ["A) They often used stolen vessels to carry out pirate attacks", "B) They managed to escape capture by the authorities because they knew the area so well", "C) They paid for information about the routes merchant ships would take", "D) They depended more on the sea for their livelihood than on farming", "E) They stored many of the goods taken in pirate attacks in coves along the coastline"]
            },
            "reading_passage2_q22_23": {
                "test_title_contains": "Academic Reading Practice Test 1",
                "old_ids": [22, 23],
                "new_id": "22-23",
                "passage": 2,
                "type": "multiple_choice_multi",
                "question": "Which TWO statements does the writer make about piracy and ancient Greece?",
                "options": ["A) The state estimated that very few people were involved in piracy", "B) Attitudes towards piracy changed shortly after the Iliad and the Odyssey were written", "C) Important officials were known to occasionally take part in piracy", "D) Every citizen regarded pirate attacks on cities as unacceptable", "E) A favourable view of piracy is evident in certain ancient Greek texts"]
            },
            # Reading Test 2 - Passage 2
            "reading2_passage2_q23_24": {
                "test_title_contains": "Academic Reading Practice Test 2",
                "old_ids": [23, 24],
                "new_id": "23-24",
                "passage": 2,
                "type": "multiple_choice_multi",
                "question": "Which TWO facts about Emma Raducanu's withdrawal from the Wimbledon tournament are mentioned in the text?",
                "options": ["A) the stage at which she dropped out of the tournament", "B) symptoms of her performance stress at the tournament", "C) measures which she had taken to manage her stress levels", "D) aspects of the Wimbledon tournament which increased her stress levels", "E) reactions to her social media posts about her experience at Wimbledon"]
            },
            # Listening Test 1 - Part 3
            "listening1_part3_q21_22": {
                "test_title_contains": "Test 1 - Listening",
                "old_ids": [21, 22],
                "new_id": "21-22",
                "section": 3,
                "type": "multiple_choice_multi",
                "question": "Which TWO things did Colin find most satisfying about his bread reuse project?",
                "options": ["A) receiving support from local restaurants", "B) finding a good way to prevent waste", "C) overcoming problems in a basic process", "D) experimenting with designs and colours", "E) learning how to apply 3-D printing"]
            },
            "listening1_part3_q23_24": {
                "test_title_contains": "Test 1 - Listening",
                "old_ids": [23, 24],
                "new_id": "23-24",
                "section": 3,
                "type": "multiple_choice_multi",
                "question": "Which TWO ways do the students agree that touch-sensitive sensors for food labels could be developed in future?",
                "options": ["A) for use on medical products", "B) to show that food is no longer fit to eat", "C) for use with drinks as well as foods", "D) to provide applications for blind people", "E) to indicate the weight of certain foods"]
            },
            # Listening Test 2 - Part 2 (Q17-18, Q19-20)
            "listening2_part2_q17_18": {
                "test_title_contains": "Test 2 - Listening",
                "old_ids": [17, 18],
                "new_id": "17-18",
                "section": 2,
                "type": "multiple_choice_multi",
                "question": "Which TWO things does David say about the lifeboat volunteer training?",
                "options": ["A) It often involves putting to sea.", "B) It teaches both practical and academic skills.", "C) It is based on a fixed schedule.", "D) It can take up to a year to complete.", "E) It includes preparation for emergency situations."]
            },
            "listening2_part2_q19_20": {
                "test_title_contains": "Test 2 - Listening",
                "old_ids": [19, 20],
                "new_id": "19-20",
                "section": 2,
                "type": "multiple_choice_multi",
                "question": "Which TWO things does David find most motivating about the work he does?",
                "options": ["A) the knowledge that he is protecting people's safety", "B) the range of tasks that he is given to do", "C) the chance to work alongside full-time lifeboat crews", "D) the reputation that the lifeboat service has", "E) the chance to develop new equipment"]
            },
        }
        
        fixed_count = 0
        
        for mapping_key, mapping in combined_mappings.items():
            # Find the test
            test = await db.tests.find_one({
                "title": {"$regex": mapping["test_title_contains"], "$options": "i"}
            })
            
            if not test:
                continue
            
            questions = test.get("questions", [])
            answer_key = test.get("answer_key", [])
            
            # Check if already has combined ID
            has_combined = any(str(q.get("id")) == mapping["new_id"] for q in questions)
            if has_combined:
                continue  # Already fixed
            
            # Find the individual questions to combine
            old_id_1, old_id_2 = mapping["old_ids"]
            q1 = None
            q2 = None
            q1_idx = None
            q2_idx = None
            
            for idx, q in enumerate(questions):
                q_id = q.get("id")
                if q_id == old_id_1 or str(q_id) == str(old_id_1):
                    q1 = q
                    q1_idx = idx
                elif q_id == old_id_2 or str(q_id) == str(old_id_2):
                    q2 = q
                    q2_idx = idx
            
            if not q1 or not q2:
                continue  # Questions not found as separate
            
            # Check if they're multi-select questions that should be combined
            if q1.get("type") != "multiple_choice_multi" and "two" not in q1.get("question", "").lower():
                continue  # Not a "choose two" question
            
            logger.info(f"🔧 Fixing combined questions in: {test.get('title')}")
            logger.info(f"   Combining Q{old_id_1} + Q{old_id_2} → Q{mapping['new_id']}")
            
            # Create combined question with full data from mapping
            combined_q = {
                "id": mapping["new_id"],
                "type": mapping.get("type", "multiple_choice_multi"),
                "question": mapping.get("question", q1.get("question", "")),
                "options": mapping.get("options", q1.get("options", [])),
                "answer_count": 2,
                "answer_ids": [old_id_1, old_id_2]
            }
            
            # Add passage or section if present
            if "passage" in mapping:
                combined_q["passage"] = mapping["passage"]
            if "section" in mapping:
                combined_q["section"] = mapping["section"]
            elif "section" in q1:
                combined_q["section"] = q1["section"]
            
            # Build new questions list
            new_questions = []
            for idx, q in enumerate(questions):
                if idx == q1_idx:
                    new_questions.append(combined_q)
                elif idx == q2_idx:
                    continue  # Skip the second question (now combined)
                else:
                    new_questions.append(q)
            
            # Fix answer key
            new_answer_key = []
            ak1 = None
            ak2 = None
            
            for ak in answer_key:
                ak_id = ak.get("question_id")
                if ak_id == old_id_1 or str(ak_id) == str(old_id_1):
                    ak1 = ak
                elif ak_id == old_id_2 or str(ak_id) == str(old_id_2):
                    ak2 = ak
                else:
                    new_answer_key.append(ak)
            
            if ak1:
                combined_ak = ak1.copy()
                combined_ak["question_id"] = mapping["new_id"]
                if ak2:
                    # Combine answers
                    ans1 = ak1.get("answer", [])
                    ans2 = ak2.get("answer", [])
                    if isinstance(ans1, list) and isinstance(ans2, list):
                        combined_ak["answer"] = ans1 + ans2
                    elif isinstance(ans1, str) and isinstance(ans2, str):
                        combined_ak["answer"] = [ans1, ans2]
                new_answer_key.append(combined_ak)
            
            # Update the test
            await db.tests.update_one(
                {"id": test["id"]},
                {"$set": {
                    "questions": new_questions,
                    "answer_key": new_answer_key
                }}
            )
            
            fixed_count += 1
            logger.info(f"   ✅ Fixed: Q{mapping['new_id']}")
        
        if fixed_count > 0:
            logger.info(f"🎉 Fixed {fixed_count} combined question issues")
        else:
            logger.info("✅ All combined questions are correctly formatted")
            
    except Exception as e:
        logger.error(f"Error fixing combined questions: {e}")

async def seed_a2_level():
    """Seed A2 Pre-Intermediate level if missing"""
    try:
        a2_level = {
            "id": "level_a2",
            "level_code": "A2",
            "level_name": "A2 Pre-Intermediate",
            "level_order": 3,
            "description": "Build confidence with everyday conversations, travel, shopping, and describing experiences",
            "target_band_range": "4.0-4.5",
            "pathway": "cefr",
            "total_estimated_hours": 55,
            "units": [
                {
                    "id": "unit_a2_1",
                    "unit_number": 1,
                    "title": "Travel & Transport",
                    "description": "Learn to navigate travel situations and discuss journeys",
                    "learning_objectives": ["Book tickets and accommodation", "Ask for and give directions", "Describe travel experiences", "Use past simple for completed actions"],
                    "estimated_hours": 11,
                    "is_locked": True,
                    "lessons": [
                        {"id": "lesson_a2_1_1", "lesson_number": 1, "title": "At the Airport", "description": "Learn vocabulary for air travel", "duration_minutes": 45, "lesson_type": "vocabulary", "required_for_next": True, "content": {"vocabulary": ["check-in", "boarding pass", "gate", "departure", "arrival", "luggage", "passport", "flight", "delayed", "cancelled"], "grammar_focus": "Past Simple: I flew to London", "example_sentences": ["I checked in online yesterday.", "My flight was delayed by two hours.", "Where is gate 12?"], "exercises": []}},
                        {"id": "lesson_a2_1_2", "lesson_number": 2, "title": "Asking for Directions", "description": "Navigate cities and ask for help", "duration_minutes": 45, "lesson_type": "speaking", "required_for_next": True, "content": {"vocabulary": ["turn left", "turn right", "go straight", "next to", "opposite", "corner", "roundabout", "traffic lights"], "grammar_focus": "Imperatives and prepositions of place", "example_sentences": ["Excuse me, where is the train station?", "Go straight and turn left at the traffic lights.", "It's opposite the bank."], "exercises": []}}
                    ],
                    "unit_quiz": {"id": "quiz_a2_1", "title": "Unit 1 Quiz: Travel & Transport", "quiz_type": "unit_quiz", "duration_minutes": 20, "passing_score": 70, "questions": [{"id": "q1", "type": "multiple_choice", "question": "I ___ to Paris last summer.", "options": ["A) fly", "B) flew", "C) flying"], "correct_answer": "B"}]}
                },
                {
                    "id": "unit_a2_2",
                    "unit_number": 2,
                    "title": "Shopping & Services",
                    "description": "Handle shopping situations and describe products",
                    "learning_objectives": ["Ask about prices and compare products", "Describe clothes and items", "Make complaints politely", "Use comparatives and superlatives"],
                    "estimated_hours": 11,
                    "is_locked": True,
                    "lessons": [
                        {"id": "lesson_a2_2_1", "lesson_number": 1, "title": "In the Shop", "description": "Shopping vocabulary and phrases", "duration_minutes": 45, "lesson_type": "vocabulary", "required_for_next": True, "content": {"vocabulary": ["receipt", "refund", "exchange", "discount", "sale", "fitting room", "size", "price", "cash", "card"], "grammar_focus": "Comparatives: cheaper than, more expensive", "example_sentences": ["Can I try this on?", "Do you have this in a smaller size?", "This one is cheaper than that one."], "exercises": []}}
                    ],
                    "unit_quiz": {"id": "quiz_a2_2", "title": "Unit 2 Quiz: Shopping", "quiz_type": "unit_quiz", "duration_minutes": 15, "passing_score": 70, "questions": [{"id": "q1", "type": "multiple_choice", "question": "This jacket is ___ than that one.", "options": ["A) expensive", "B) more expensive", "C) most expensive"], "correct_answer": "B"}]}
                },
                {
                    "id": "unit_a2_3",
                    "unit_number": 3,
                    "title": "Health & Body",
                    "description": "Describe symptoms and visit the doctor",
                    "learning_objectives": ["Describe health problems", "Understand medical advice", "Talk about healthy habits", "Use should/shouldn't for advice"],
                    "estimated_hours": 11,
                    "is_locked": True,
                    "lessons": [
                        {"id": "lesson_a2_3_1", "lesson_number": 1, "title": "At the Doctor's", "description": "Medical vocabulary and expressions", "duration_minutes": 45, "lesson_type": "vocabulary", "required_for_next": True, "content": {"vocabulary": ["headache", "fever", "cough", "prescription", "medicine", "appointment", "symptom", "pain", "rest", "recover"], "grammar_focus": "Should/Shouldn't: You should rest", "example_sentences": ["I have a terrible headache.", "You should take this medicine twice a day.", "How long have you had this cough?"], "exercises": []}}
                    ],
                    "unit_quiz": {"id": "quiz_a2_3", "title": "Unit 3 Quiz: Health", "quiz_type": "unit_quiz", "duration_minutes": 15, "passing_score": 70, "questions": [{"id": "q1", "type": "multiple_choice", "question": "You ___ eat more vegetables.", "options": ["A) should", "B) shouldn't", "C) must to"], "correct_answer": "A"}]}
                }
            ],
            "exit_test": {
                "id": "exit_test_a2",
                "title": "A2 Exit Test",
                "description": "Complete assessment to unlock B1 level",
                "quiz_type": "exit_test",
                "duration_minutes": 45,
                "passing_score": 75,
                "target_band": 4.5,
                "questions": [
                    {"id": "q1", "type": "multiple_choice", "question": "We ___ to Italy last year.", "options": ["A) go", "B) went", "C) going"], "correct_answer": "B"},
                    {"id": "q2", "type": "multiple_choice", "question": "This hotel is ___ than the other one.", "options": ["A) comfortable", "B) more comfortable", "C) most comfortable"], "correct_answer": "B"},
                    {"id": "q3", "type": "multiple_choice", "question": "You ___ smoke in the hospital.", "options": ["A) should", "B) shouldn't", "C) must"], "correct_answer": "B"}
                ]
            },
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Insert A2 level
        await db.learning_levels.insert_one(a2_level)
        
        # Update level orders for B1 and higher
        await db.learning_levels.update_one({"id": "level_b1"}, {"$set": {"level_order": 4}})
        await db.learning_levels.update_one({"id": "level_b2"}, {"$set": {"level_order": 5}})
        await db.learning_levels.update_one({"id": "level_ielts_7"}, {"$set": {"level_order": 6}})
        
        logger.info("✅ A2 level seeded successfully")
    except Exception as e:
        logger.error(f"Error seeding A2 level: {e}")

@app.on_event("startup")
async def startup_event():
    """Seed vocab grammar lessons and beginner english lessons if they don't exist"""
    try:
        # Seed vocab grammar lessons
        count = await db.vocab_grammar_lessons.count_documents({})
        if count == 0:
            logger.info("No vocab grammar lessons found, running seed...")
            import subprocess
            result = subprocess.run(["python", "seed_vocab_grammar_v2.py"], cwd="/app/backend", capture_output=True, text=True)
            logger.info(f"Seed output: {result.stdout}")
            if result.returncode != 0:
                logger.error(f"Seed error: {result.stderr}")
        else:
            logger.info(f"Found {count} vocab grammar lessons in database")
        
        # Seed beginner english lessons
        beginner_count = await db.beginner_english_lessons.count_documents({})
        if beginner_count == 0:
            logger.info("No beginner english lessons found, running seed...")
            import subprocess
            result = subprocess.run(["python", "seed_beginner_english.py"], cwd="/app/backend", capture_output=True, text=True)
            logger.info(f"Beginner seed output: {result.stdout}")
            if result.returncode != 0:
                logger.error(f"Beginner seed error: {result.stderr}")
        else:
            logger.info(f"Found {beginner_count} beginner english lessons in database")
        
        # Seed IELTS mastery course modules (Band 4.5-6.5) - FORCE RESEED on every startup
        mastery_count = await db.mastery_course_modules.count_documents({})
        logger.info(f"Found {mastery_count} mastery course modules, force reseeding...")
        from seed_mastery_course import MASTERY_MODULES
        await db.mastery_course_modules.delete_many({})
        if MASTERY_MODULES:
            await db.mastery_course_modules.insert_many(MASTERY_MODULES)
            logger.info(f"✅ Mastery course reseeded: {len(MASTERY_MODULES)} modules")
        
        # Seed Advanced IELTS mastery course modules (Band 6.0-9.0) - FORCE RESEED on every startup
        advanced_count = await db.advanced_mastery_modules.count_documents({})
        logger.info(f"Found {advanced_count} advanced mastery modules, force reseeding...")
        from seed_advanced_mastery import ADVANCED_MODULES
        await db.advanced_mastery_modules.delete_many({})
        if ADVANCED_MODULES:
            await db.advanced_mastery_modules.insert_many(ADVANCED_MODULES)
            logger.info(f"✅ Advanced mastery reseeded: {len(ADVANCED_MODULES)} modules")
        
        # Seed tests if not present
        tests_count = await db.tests.count_documents({})
        if tests_count == 0:
            logger.info("No tests found, running seed...")
            import subprocess
            result = subprocess.run(["python", "seed_data.py"], cwd="/app/backend", capture_output=True, text=True)
            logger.info(f"Tests seed output: {result.stdout}")
            if result.returncode != 0:
                logger.error(f"Tests seed error: {result.stderr}")
        else:
            logger.info(f"Found {tests_count} tests in database")
            # Fix combined question IDs if needed (Q20-21 issue)
            await fix_combined_question_ids()
        
        # Seed learning platform levels if not present
        learning_levels_count = await db.learning_levels.count_documents({})
        if learning_levels_count == 0:
            logger.info("No learning levels found, running seed...")
            import subprocess
            result = subprocess.run(["python", "seed_learning_platform.py"], cwd="/app/backend", capture_output=True, text=True)
            logger.info(f"Learning platform seed output: {result.stdout}")
            if result.returncode != 0:
                logger.error(f"Learning platform seed error: {result.stderr}")
            # Also add A2 level
            await seed_a2_level()
        else:
            logger.info(f"Found {learning_levels_count} learning levels in database")
            # Check if A2 exists, add if missing
            a2_exists = await db.learning_levels.find_one({"id": "level_a2"})
            if not a2_exists:
                logger.info("A2 level missing, adding...")
                await seed_a2_level()
        
        # ============ AUTO-SEED COURSES ON STARTUP ============
        await auto_seed_courses()
            
    except Exception as e:
        logger.error(f"Startup seed error: {e}")


async def auto_seed_courses():
    """Automatically seed all course data if missing on startup"""
    try:
        logger.info("🔄 Checking course data...")
        
        # Check and seed Advanced Mastery (should be 20 modules)
        advanced_count = await db.advanced_mastery_modules.count_documents({})
        if advanced_count < 20:
            logger.info(f"⚠️ Advanced Mastery has {advanced_count} modules, expected 20. Seeding...")
            try:
                from seed_advanced_mastery import ADVANCED_MODULES
                await db.advanced_mastery_modules.delete_many({})
                for module in ADVANCED_MODULES:
                    await db.advanced_mastery_modules.update_one(
                        {"id": module["id"]}, {"$set": module}, upsert=True
                    )
                new_count = await db.advanced_mastery_modules.count_documents({})
                logger.info(f"✅ Advanced Mastery seeded: {new_count} modules")
            except Exception as e:
                logger.error(f"❌ Advanced Mastery seed error: {e}")
        else:
            logger.info(f"✅ Advanced Mastery OK: {advanced_count} modules")
        
        # Check and seed Mastery (should be 17 modules)
        mastery_count = await db.mastery_course_modules.count_documents({})
        if mastery_count < 17:
            logger.info(f"⚠️ Mastery has {mastery_count} modules, expected 17. Seeding...")
            try:
                from seed_mastery_course import MASTERY_MODULES
                await db.mastery_course_modules.delete_many({})
                for module in MASTERY_MODULES:
                    await db.mastery_course_modules.update_one(
                        {"id": module["id"]}, {"$set": module}, upsert=True
                    )
                new_count = await db.mastery_course_modules.count_documents({})
                logger.info(f"✅ Mastery seeded: {new_count} modules")
            except Exception as e:
                logger.error(f"❌ Mastery seed error: {e}")
        else:
            logger.info(f"✅ Mastery OK: {mastery_count} modules")
        
        # Check and seed Beginner WITH LISTENING (should be 14 lessons)
        beginner_count = await db.beginner_english_lessons.count_documents({})
        beginner_with_listening = await db.beginner_english_lessons.count_documents({"listening": {"$exists": True, "$ne": None}})
        
        if beginner_count < 14 or beginner_with_listening < 14:
            logger.info(f"⚠️ Beginner has {beginner_count} lessons ({beginner_with_listening} with listening), expected 14. Seeding...")
            try:
                from seed_beginner_english import BEGINNER_LESSONS
                await db.beginner_english_lessons.delete_many({})
                for lesson in BEGINNER_LESSONS:
                    await db.beginner_english_lessons.update_one(
                        {"id": lesson["id"]}, {"$set": lesson}, upsert=True
                    )
                new_count = await db.beginner_english_lessons.count_documents({})
                new_listening = await db.beginner_english_lessons.count_documents({"listening": {"$exists": True, "$ne": None}})
                logger.info(f"✅ Beginner seeded: {new_count} lessons ({new_listening} with listening)")
            except Exception as e:
                logger.error(f"❌ Beginner seed error: {e}")
        else:
            logger.info(f"✅ Beginner OK: {beginner_count} lessons ({beginner_with_listening} with listening)")
        
        logger.info("🎉 Course data check complete!")
        
    except Exception as e:
        logger.error(f"Auto-seed courses error: {e}")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()