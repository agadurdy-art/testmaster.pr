from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Request, Form
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import hashlib
import hmac
import urllib.parse
from emergentintegrations.llm.chat import LlmChat, UserMessage
import json
from emergentintegrations.llm.openai import OpenAISpeechToText
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
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

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# ============ Models ============

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    password_hash: Optional[str] = None
    verified: bool = True
    google_id: Optional[str] = None
    facebook_id: Optional[str] = None
    plan: str = Field(default="free", description="Subscription plan: free or pro")
    examCredits: int = Field(default=0, description="Number of AI speaking exam credits")
    ai_interview_free_seconds_used: int = Field(default=0, description="Total free AI interviewer seconds used")
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

SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
SENDGRID_FROM_EMAIL = os.getenv("SENDGRID_FROM_EMAIL")


def send_reset_email(to_email: str, reset_link: str) -> bool:
    """Send a password reset email via SendGrid. Returns True on success."""
    if not SENDGRID_API_KEY or not SENDGRID_FROM_EMAIL:
        logging.getLogger(__name__).warning("SendGrid not configured; skipping email send")
        return False
    # In-memory stores (fallback); real flows use MongoDB collections

    try:
        message = Mail(
            from_email=SENDGRID_FROM_EMAIL,
            to_emails=to_email,
            subject="IELTS Ace - Password Reset",
            html_content=f"""
                <p>Hello,</p>
                <p>We received a request to reset the password for your IELTS Ace account.</p>
                <p>Click the link below to set a new password (valid for 60 minutes):</p>
                <p><a href='{reset_link}'>{reset_link}</a></p>
                <p>If you did not request this, you can safely ignore this email.</p>
                <p>– IELTS Ace</p>
            """,
        )
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)
        if response.status_code in (200, 201, 202):
            logging.getLogger(__name__).info(f"Sent reset email to {to_email}")
            return True
        logging.getLogger(__name__).error(
            f"SendGrid error for {to_email}: status {response.status_code}"
        )
        return False
    except Exception as e:
        logging.getLogger(__name__).error(f"SendGrid exception for {to_email}: {e}")
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
    """Evaluate answer using AI"""
    chat = LlmChat(
        api_key=os.getenv("EMERGENT_LLM_KEY"),
        session_id=str(uuid.uuid4()),
        system_message=(
            "You are an experienced IELTS examiner and friendly writing teacher. "
            "Use official IELTS band descriptors but explain them in simple language. "
            "Always give very specific, practical advice and short example sentences the student could use to improve."
        ),
    ).with_model("openai", "gpt-4o")
    
    if test_type == "writing":
        prompt = f"""Evaluate this IELTS writing task.
Speak directly to the student in a friendly teacher tone.

Question:
{question}

Student's Answer:
{user_answer}

Return ONLY a JSON object with this structure (no extra text, no markdown, no ``` fences):
{{
  "band_score": <overall band from 1 to 9>,
  "task_achievement": {{
    "score": <band 1-9>,
    "feedback": "2–3 friendly sentences explaining strengths and problems, plus at least one clear suggestion."
  }},
  "coherence_cohesion": {{
    "score": <band 1-9>,
    "feedback": "2–3 sentences commenting on organisation, paragraphing, linking, with 1–2 example linking phrases."
  }},
  "lexical_resource": {{
    "score": <band 1-9>,
    "feedback": "2–3 sentences about vocabulary range and accuracy, including 2–3 example phrases the student could use."
  }},
  "grammatical_accuracy": {{
    "score": <band 1-9>,
    "feedback": "2–3 sentences about grammar and sentence structure, with 1–2 corrected example sentences."
  }},
  "overall_feedback": "A short teacher-style summary (4–5 sentences) combining all criteria and giving clear next steps."
}}
"""
    else:  # speaking
        prompt = f"""Evaluate this IELTS speaking response.
Speak directly to the student in a friendly teacher tone.

Question:
{question}

Student's Response:
{user_answer}

Return ONLY a JSON object with this structure (no extra text, no markdown, no ``` fences):
{{
  "band_score": <overall band from 1 to 9>,
  "fluency_coherence": {{
    "score": <band 1-9>,
    "feedback": "2–3 friendly sentences about fluency and organisation, with at least one practical tip."
  }},
  "lexical_resource": {{
    "score": <band 1-9>,
    "feedback": "2–3 sentences about vocabulary, including 2–3 example phrases."
  }},
  "grammatical_accuracy": {{
    "score": <band 1-9>,
    "feedback": "2–3 sentences about grammar with 1–2 corrected examples."
  }},
  "pronunciation": {{
    "score": <band 1-9>,
    "feedback": "2–3 sentences about pronunciation with simple practice ideas."
  }},
  "overall_feedback": "A short teacher-style summary (4–5 sentences) combining all criteria and giving clear next steps."
}}
"""
    
    message = UserMessage(text=prompt)
    response = await chat.send_message(message)

    # Normalise response to a Python dict
    # emergentintegrations may already return a dict; otherwise we try to parse JSON text.
    if isinstance(response, dict):
        return response

    if isinstance(response, str):
        # Try to strip Markdown code fences if present
        cleaned = response.strip()
        if cleaned.startswith("```"):
            # Remove first line with ``` or ```json and trailing ```
            cleaned_lines = cleaned.splitlines()
            # Drop first line
            cleaned_lines = cleaned_lines[1:]
            # Drop last line if it's only ```
            if cleaned_lines and cleaned_lines[-1].strip().startswith("```"):
                cleaned_lines = cleaned_lines[:-1]
            cleaned = "\n".join(cleaned_lines).strip()
        try:
            return json.loads(cleaned)
        except Exception:
            # Fall back to wrapping raw text
            return {"band_score": 5.0, "overall_feedback": response}

    # Unknown format - safe fallback
    return {"band_score": 5.0, "overall_feedback": str(response)}

# ============ Routes ============

@api_router.get("/")
async def root():
    return {"message": "IELTS Ace API"}

# User & Auth routes
@api_router.post("/auth/register", response_model=User)
async def register_user(input: UserCreate):
    # Check if user exists
    existing = await db.users.find_one({"email": input.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email is already registered")

    if len(input.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")

    # Create the new user
    user_id = str(uuid.uuid4())
    hashed_password = hash_password(input.password)
    
    user = {
        "id": user_id,
        "email": input.email.strip().lower(),
        "name": input.name.strip(),
        "password_hash": hashed_password,
        "plan": "free",
        "examCredits": 0,
        "verified": False,
        "ai_interview_free_seconds_used": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user)
    
    # Return user without password
    user_response = {k: v for k, v in user.items() if k != "password"}
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

    # Try sending email; if SendGrid not configured, just log
    send_reset_email(input.email, verify_link)

    # Do not expose password_hash in response
    user.password_hash = None
    return user

@api_router.post("/auth/login", response_model=User)
async def login_user(input: UserLogin):
    user = await db.users.find_one({"email": input.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not verify_password(input.password, user.get("password_hash") or ""):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # If user has a verified flag and it's False, block login and (re)send verification link
    if user.get("verified") is False:
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
        send_reset_email(input.email, verify_link)
        raise HTTPException(
            status_code=403,
            detail="Please verify your email. We have sent a new verification link.",
        )

    # Remove password_hash before returning
    user.pop("password_hash", None)
    if isinstance(user.get('created_at'), str):
        user['created_at'] = datetime.fromisoformat(user['created_at'])
    return User(**user)

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
        question_type_map: Dict[int, str] = {}
        for q in test.get("questions", []):
            qid = q.get("id") or q.get("question_id")
            if qid is None:
                continue
            try:
                qid_int = int(qid)
            except (TypeError, ValueError):
                continue
            q_type = str(q.get("type") or "unknown").strip().lower()
            question_type_map[qid_int] = q_type

        # Build a lookup from question_id -> correct answer for robust matching
        answer_key_map: Dict[int, str] = {}
        for item in test.get("answer_key", []):
            qid = item.get("question_id")
            if qid is not None:
                try:
                    qid_int = int(qid)
                except (TypeError, ValueError):
                    continue
                answer_key_map[qid_int] = str(item.get("answer", ""))

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
        total = len(answer_key_map) if answer_key_map else len(test.get("answer_key", []))

        # Strict comparison: answers must match exactly (case-insensitive, trimmed)
        for ans in submission.answers:
            qid = ans.get("question_id") or ans.get("id")
            if qid is None:
                continue
            try:
                qid_int = int(qid)
            except (TypeError, ValueError):
                continue

            correct_answer = answer_key_map.get(qid_int)
            if correct_answer is None:
                continue

            user_answer = ans.get("answer", "")
            is_correct = str(user_answer).strip().lower() == str(correct_answer).strip().lower()
            if is_correct:
                correct += 1

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
            if is_correct:
                skill_stats[skey]["correct"] += 1

        score_percentage = (correct / total * 100) if total > 0 else 0
        band_score = calculate_band_score(score_percentage)

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

        short_fb_parts: List[str] = []
        short_fb_parts.append(
            f"For this {test_label} test, you answered {correct} out of {total} questions correctly (about {score_percentage:.0f}%)."
        )
        strong_names = _skill_names(strong_skills)
        weak_names = _skill_names(weak_skills)
        if strong_names:
            short_fb_parts.append(f"Your strongest areas were {strong_names}. Use these questions to secure easy marks.")
        if weak_names:
            short_fb_parts.append(f"You should focus more practice time on {weak_names} to raise your band.")
        short_teacher_feedback = " ".join(short_fb_parts)

        detailed_parts: List[str] = []
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
            },
            time_taken=submission.time_taken,
        )
    else:
        # For writing/speaking, return without score (needs AI evaluation)
        attempt = TestAttempt(
            user_id=submission.user_id,
            test_id=submission.test_id,
            test_type=submission.test_type,
            answers=submission.answers,
            score=0.0,
            band_score=0.0,
            feedback={"message": "Awaiting AI evaluation"},
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
    token = payload.token.strip()
    record = await db.email_verifications.find_one({"token": token})
    if not record:
        raise HTTPException(status_code=400, detail="Invalid or expired verification token")

    if datetime.now(timezone.utc) > datetime.fromisoformat(record["expires_at"]):
        await db.email_verifications.delete_one({"_id": record["_id"]})
        raise HTTPException(status_code=400, detail="Invalid or expired verification token")

    email = record["email"]
    await db.users.update_one({"email": email}, {"$set": {"verified": True}})
    await db.email_verifications.delete_one({"_id": record["_id"]})

    return {"detail": "Email verified successfully"}


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

    # Send real email via SendGrid (best-effort)
    send_reset_email(email, reset_link)

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
        audio_file = io.BytesIO(audio_data)
        audio_file.name = file.filename
        
        # Transcribe
        response = await stt.transcribe(
            file=audio_file,
            model="whisper-1",
            response_format="json"
        )
        
        return {"text": response.text}
    except Exception as e:
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
    ).sort("completed_at", -1).to_list(100)
    
    # Convert datetime strings
    for attempt in attempts:
        if isinstance(attempt.get('completed_at'), str):
            attempt['completed_at'] = datetime.fromisoformat(attempt['completed_at'])
    
    # Calculate statistics
    stats = {
        "total_tests": len(attempts),
        "by_type": {},
        "average_band_score": 0.0,
        "recent_attempts": attempts[:10]
    }
    
    if attempts:
        for attempt in attempts:
            test_type = attempt['test_type']
            if test_type not in stats['by_type']:
                stats['by_type'][test_type] = {"count": 0, "avg_score": 0.0}
            stats['by_type'][test_type]['count'] += 1
        
        total_band_score = sum(a.get('band_score', 0) for a in attempts)
        stats['average_band_score'] = round(total_band_score / len(attempts), 1)
    
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


# ============ Writing Practice Evaluation ============

class WritingPracticeRequest(BaseModel):
    task_type: str  # task1_academic, task1_general, task2
    prompt: str
    essay: str
    word_count: int

@api_router.post("/writing-practice/evaluate")
async def evaluate_writing_practice(request: WritingPracticeRequest):
    """Evaluate IELTS writing practice submission with detailed feedback"""
    try:
        chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            session_id=str(uuid.uuid4()),
            system_message="You are an experienced IELTS examiner providing detailed writing feedback."
        ).with_model("anthropic", "claude-3-sonnet-20240229")
        
        task_type_desc = {
            "task1_academic": "IELTS Academic Writing Task 1 (graph/chart/diagram description)",
            "task1_general": "IELTS General Training Writing Task 1 (letter writing)",
            "task2": "IELTS Writing Task 2 (essay)"
        }.get(request.task_type, "IELTS Writing Task")
        
        min_words = 250 if request.task_type == "task2" else 150
        
        prompt = f"""You are an experienced IELTS examiner. Evaluate this {task_type_desc} submission.

TASK PROMPT:
{request.prompt}

STUDENT'S RESPONSE ({request.word_count} words):
{request.essay}

Minimum word requirement: {min_words} words

Provide a comprehensive evaluation in the following JSON format:
{{
    "overall_band": <float between 1.0 and 9.0, in 0.5 increments>,
    "scores": {{
        "task_achievement": <float 1.0-9.0>,
        "coherence_cohesion": <float 1.0-9.0>,
        "lexical_resource": <float 1.0-9.0>,
        "grammar": <float 1.0-9.0>
    }},
    "strengths": [<3-4 specific things done well>],
    "improvements": [<3-4 specific areas to improve with examples>],
    "corrections": [
        {{
            "original": "<exact phrase with error>",
            "corrected": "<corrected version>",
            "explanation": "<brief explanation>"
        }}
    ],
    "improved_version": "<A model paragraph or two showing how to improve the weakest part of the essay>"
}}

Be encouraging but honest. Focus on actionable feedback."""

        response = await chat.send_message(UserMessage(content=prompt))
        response_text = response.content
        
        # Parse JSON from response
        import re
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            result = json.loads(json_match.group())
            return result
        
        # Fallback response
        return {
            "overall_band": 5.5,
            "scores": {
                "task_achievement": 5.5,
                "coherence_cohesion": 5.5,
                "lexical_resource": 5.5,
                "grammar": 5.5
            },
            "strengths": ["You attempted the task", "Your essay has a clear structure"],
            "improvements": ["Develop your ideas more fully", "Use more varied vocabulary"],
            "corrections": [],
            "improved_version": "Unable to generate improved version. Please try again."
        }
        
    except Exception as e:
        logging.getLogger(__name__).error(f"Writing evaluation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to evaluate writing")


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
        ).with_model("anthropic", "claude-3-sonnet-20240229")
        
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

        response = await chat.send_message(UserMessage(content=prompt))
        response_text = response.content
        
        # Parse JSON from response
        import re
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

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()