from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File
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
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage
from emergentintegrations.llm.openai import OpenAISpeechToText
import json
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
    google_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    test_history: List[str] = Field(default_factory=list)

class UserCreate(BaseModel):
    email: str
    name: str
    google_id: Optional[str] = None

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

# ============ Helper Functions ============

def calculate_band_score(percentage: float) -> float:
    """Convert percentage to IELTS band score (1-9)"""
    if percentage >= 95: return 9.0
    elif percentage >= 90: return 8.5
    elif percentage >= 85: return 8.0
    elif percentage >= 80: return 7.5
    elif percentage >= 75: return 7.0
    elif percentage >= 70: return 6.5
    elif percentage >= 65: return 6.0
    elif percentage >= 60: return 5.5
    elif percentage >= 55: return 5.0
    elif percentage >= 50: return 4.5
    elif percentage >= 45: return 4.0
    elif percentage >= 40: return 3.5
    elif percentage >= 35: return 3.0
    elif percentage >= 30: return 2.5
    elif percentage >= 25: return 2.0
    elif percentage >= 20: return 1.5
    else: return 1.0

async def evaluate_with_ai(test_type: str, question: str, user_answer: str, model_answer: Optional[str] = None) -> Dict[str, Any]:
    """Evaluate answer using AI"""
    chat = LlmChat(
        api_key=os.getenv("EMERGENT_LLM_KEY"),
        session_id=str(uuid.uuid4()),
        system_message="You are an IELTS examiner expert. Provide detailed, constructive feedback."
    ).with_model("openai", "gpt-4o")
    
    if test_type == "writing":
        prompt = f"""Evaluate this IELTS writing task:

Question: {question}

Student's Answer:
{user_answer}

Provide evaluation in JSON format with:
- band_score (1-9)
- task_achievement (score and feedback)
- coherence_cohesion (score and feedback)
- lexical_resource (score and feedback)
- grammatical_accuracy (score and feedback)
- overall_feedback (detailed)
"""
    else:  # speaking
        prompt = f"""Evaluate this IELTS speaking response:

Question: {question}

Student's Response:
{user_answer}

Provide evaluation in JSON format with:
- band_score (1-9)
- fluency_coherence (score and feedback)
- lexical_resource (score and feedback)
- grammatical_accuracy (score and feedback)
- pronunciation (score and feedback)
- overall_feedback (detailed)
"""
    
    message = UserMessage(text=prompt)
    response = await chat.send_message(message)
    
    try:
        return json.loads(response)
    except:
        return {"band_score": 5.0, "overall_feedback": response}

# ============ Routes ============

@api_router.get("/")
async def root():
    return {"message": "IELTS Ace API"}

# User routes
@api_router.post("/users", response_model=User)
async def create_user(input: UserCreate):
    # Check if user exists
    existing = await db.users.find_one({"email": input.email}, {"_id": 0})
    if existing:
        return User(**existing)
    
    user = User(**input.model_dump())
    doc = user.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.users.insert_one(doc)
    return user

@api_router.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if isinstance(user.get('created_at'), str):
        user['created_at'] = datetime.fromisoformat(user['created_at'])
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
    
    # Calculate score for MCQ tests (listening/reading)
    if submission.test_type in ["listening", "reading"]:
        correct = 0
        total = len(test['answer_key'])
        
        for i, answer in enumerate(submission.answers):
            if i < len(test['answer_key']):
                correct_answer = test['answer_key'][i].get('answer', '')
                user_answer = answer.get('answer', '')
                if str(user_answer).lower().strip() == str(correct_answer).lower().strip():
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
                "message": f"You got {correct} out of {total} correct."
            },
            time_taken=submission.time_taken
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
            time_taken=submission.time_taken
        )
    
    # Save attempt
    doc = attempt.model_dump()
    doc['completed_at'] = doc['completed_at'].isoformat()
    await db.test_attempts.insert_one(doc)
    
    # Update user history
    await db.users.update_one(
        {"id": submission.user_id},
        {"$push": {"test_history": attempt.id}}
    )
    
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

# Include router
app.include_router(api_router)

# Admin routes
from admin_routes import admin_router
admin_api = APIRouter(prefix="/api")
admin_api.include_router(admin_router)

@admin_api.middleware("http")
async def add_db_to_admin(request, call_next):
    request.state.db = db
    response = await call_next(request)
    return response

app.include_router(admin_api)

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