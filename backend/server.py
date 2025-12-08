from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Request
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

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

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
        # Build a lookup from question_id -> correct answer for robust matching
        answer_key_map = {}
        for item in test.get("answer_key", []):
            qid = item.get("question_id")
            if qid is not None:
                try:
                    qid_int = int(qid)
                except (TypeError, ValueError):
                    continue
                answer_key_map[qid_int] = str(item.get("answer", ""))

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
            if str(user_answer).strip().lower() == str(correct_answer).strip().lower():
                correct += 1

        score_percentage = (correct / total * 100) if total > 0 else 0
        band_score = calculate_band_score(score_percentage)

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


# ================== Payments: SePay + Manual Credit ==================


async def _get_user_by_email(email: str) -> Optional[dict]:
    user = await db.users.find_one({"email": email.lower().strip()}, {"_id": 0})
    return user


@api_router.post("/payments/sepay/create")
async def create_sepay_payment(req: CreatePaymentRequest, request: Request):
    """Create a payment order for a pricing plan and return bank transfer instructions.

    For now we keep it simple:
    - Trust the amount sent from the frontend for the selected plan
    - Create a pending PaymentOrder document
    - Return static bank details + a unique transfer content code
    """

    user_email = request.headers.get("x-user-email")
    if not user_email:
        raise HTTPException(status_code=401, detail="Missing user context")

    user = await _get_user_by_email(user_email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    order = PaymentOrder(
        user_id=user["id"],
        plan_id=req.plan_id,
        amount_vnd=req.amount_vnd,
    )

    # Generate a simple unique payment code and store it on the order
    payment_code = f"IELTS{order.id[:8].upper()}"

    order_doc = order.model_dump()
    order_doc["created_at"] = order_doc["created_at"].isoformat()
    await db.payment_orders.insert_one(order_doc)

    # Use env vars when available; fall back to the MB Bank details you configured
    bank_account = os.getenv("SEPAY_BANK_ACCOUNT_NUMBER") or "038578587"
    bank_name = os.getenv("SEPAY_BANK_NAME") or "MB Bank"
    account_name = os.getenv("SEPAY_ACCOUNT_NAME") or "NGUYEN HUYEN THIEN KIEU"

    # Build VietQR image URL if bank details are configured
    qr_url = None
    if bank_account:
        # Use official VietQR image format for MB Bank via BIN 970422.
        # Pattern: https://img.vietqr.io/image/970422|<ACCOUNT>-compact.png?amount=...&addInfo=...&accountName=...
        base_qr = f"https://img.vietqr.io/image/970422|{bank_account}-compact.png"
        params = {
            "amount": req.amount_vnd,
            "addInfo": payment_code,
        }
        if account_name:
            params["accountName"] = account_name
        qr_url = base_qr + "?" + urllib.parse.urlencode(params)

    instructions = {
        "bank_name": bank_name,
        "account_number": bank_account,
        "account_name": account_name,
        "amount_vnd": req.amount_vnd,
        "payment_code": payment_code,
        "note": "Scan the QR or transfer EXACT amount and include payment code in description",
        "qr_image_url": qr_url,
    }

    return {
        "order_id": order.id,
        "plan_id": req.plan_id,
        "status": order.status,
        "instructions": instructions,
    }

@api_router.get("/payments/orders/{order_id}")
async def get_payment_order(order_id: str):
    order = await db.payment_orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order




@api_router.post("/speaking/session/start")
async def start_speaking_session(request: Request):
    """Consume 1 speaking credit when the user starts an AI speaking session.

    Expects header `x-user-email` from the frontend to identify the user.
    """
    user_email = request.headers.get("x-user-email")
    if not user_email:
        raise HTTPException(status_code=401, detail="Missing user context")

    user = await _get_user_by_email(user_email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Atomically decrement examCredits if > 0
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


@api_router.post("/payments/sepay/ipn")
async def sepay_ipn(request: Request):
    """Handle SePay webhook.

    We currently verify via a static API key header configured on SePay side.
    """

    api_key_header = request.headers.get("x-sepay-api-key")
    expected = os.getenv("SEPAY_WEBHOOK_API_KEY")
    if not expected or api_key_header != expected:
        logger.warning("Invalid SePay webhook API key")
        raise HTTPException(status_code=401, detail="Unauthorized")

    payload = await request.json()

    try:
        transfer_type = payload.get("transferType") or payload.get("transfer_type")
        amount = int(payload.get("transferAmount") or 0)
        content = (payload.get("content") or "").upper()
        sepay_tx_id = str(payload.get("id"))
        reference_code = payload.get("referenceCode")
        logger.info(f"SePay webhook content: {content}")
    except Exception as e:
        logger.error(f"Invalid SePay payload: {e}")
        raise HTTPException(status_code=400, detail="Invalid payload")

    # Only process incoming money
    if transfer_type != "in":
        return {"detail": "Ignoring non-income transaction"}

    # Try to find an order for this amount that is still pending
    matching_order = await db.payment_orders.find_one(
        {"status": "pending", "amount_vnd": amount},
        {"_id": 0},
    )

    if not matching_order:
        logger.warning(f"No matching order for SePay txn {sepay_tx_id} amount={amount}")
        return {"detail": "No matching order"}

    # Mark order completed
    await db.payment_orders.update_one(
        {"id": matching_order["id"]},
        {
            "$set": {
                "status": "completed",
                "sepay_transaction_id": sepay_tx_id,
                "sepay_reference_code": reference_code,
                "completed_at": datetime.now(timezone.utc).isoformat(),
            }
        },
    )

    # Upgrade user plan / credits
    user = await db.users.find_one({"id": matching_order["user_id"]}, {"_id": 0})
    if user:
        plan_id = matching_order.get("plan_id")
        update_fields: Dict[str, Any] = {}
        if plan_id == "single":
            update_fields["plan"] = "pro"
            update_fields["examCredits"] = user.get("examCredits", 0) + 1
        elif plan_id == "starter":
            update_fields["plan"] = "pro"
            update_fields["examCredits"] = user.get("examCredits", 0) + 2
        elif plan_id == "booster":
            update_fields["plan"] = "pro"
            update_fields["examCredits"] = user.get("examCredits", 0) + 5
        elif plan_id == "pro":
            update_fields["plan"] = "pro"
            update_fields["examCredits"] = user.get("examCredits", 0) + 8

        if update_fields:
            await db.users.update_one({"id": user["id"]}, {"$set": update_fields})


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