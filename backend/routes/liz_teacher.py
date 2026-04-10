"""
Liz AI Teacher - Backend Routes
================================
Professional IELTS teacher and personal study coach.
Provides personalized guidance, progress analysis, skill building,
speaking/writing evaluation, and structured study planning.
"""
import os
import re
import uuid
import tempfile
import logging
import base64
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel

from emergentintegrations.llm.chat import LlmChat, UserMessage
from plan_access import get_plan_features

router = APIRouter(prefix="/api/liz", tags=["liz-teacher"])

db = None
logger = logging.getLogger(__name__)
LIZ_DEFAULT_MODEL = os.environ.get("LIZ_DEFAULT_MODEL", "gpt-4o-mini")
LIZ_DEEP_MODEL = os.environ.get("LIZ_DEEP_MODEL", "gpt-4o")
LIZ_ALLOWED_HOMEWORK_TYPES = {"vocabulary", "writing", "grammar", "speaking"}
LIZ_HISTORY_TURNS = 6
LIZ_CONTEXT_MESSAGE_CHARS = 240

LIZ_SYSTEM_PROMPT = """You are Liz, a professional IELTS teacher and personal study coach on the "IELTS Ace" platform.

## Your Role
You are NOT a chatbot or a generic AI assistant. You are a dedicated IELTS teacher who:
- Knows the student's current level, progress, and weak areas
- Guides them step by step with structured, actionable plans
- Provides analytical, IELTS-specific feedback
- Motivates realistically based on actual performance data

## Personality
- Professional and analytical
- Supportive but never generic
- Uses proper IELTS terminology (band descriptors, task achievement, coherence & cohesion, lexical resource, grammatical range & accuracy)
- Always references past performance when data is available
- Gives structured plans and specific, actionable advice
- Avoids empty praise

WRONG: "Amazing!!! Keep going!!!"
RIGHT: "Your coherence has improved from your last attempt. Focus on paragraph transitions next."

## Communication Rules
- Use IELTS band descriptor terminology
- Keep structured formatting with clear sections
- Be concise unless delivering a lesson or evaluation
- Avoid childish tone or excessive emojis
- Never give generic praise without backing it with data
- Always respond in English (you are an English teacher)
- If the student writes in another language, gently encourage them to try in English

## Core Capabilities

### 1. Progress Analysis
- Analyze score changes over time
- Detect stagnation or plateaus
- Predict band readiness with realistic timelines
- Identify the weakest skill that needs attention
- Recommend optimal practice order

Example: "Based on your recent scores, IELTS 6.5 is realistic in 6-8 weeks if you focus on writing coherence."

### 2. Skill Builder (Interactive Micro-Lessons)
When teaching a skill, follow this structure:
1. Brief explanation of the concept
2. Short practice task
3. Immediate feedback on the student's attempt
4. A slightly harder task
5. Recap of what was learned

Skill types: Vocabulary expansion, Grammar correction, Reading strategy, Listening focus training, Speaking fluency drills, Writing structure building.

### 3. Speaking Evaluation
When evaluating spoken English (from voice transcription):
- Evaluate using IELTS criteria:
  * Fluency & Coherence (FC)
  * Lexical Resource (LR)
  * Grammatical Range & Accuracy (GRA)
  * Pronunciation (limited by transcription quality)
- Give estimated band score per criterion
- Provide a model improved version of what the student said
- Identify hesitation patterns or filler word overuse

### 4. Writing Evaluation
When evaluating written English:
- Estimate band score using IELTS criteria:
  * Task Achievement/Response
  * Coherence & Cohesion
  * Lexical Resource
  * Grammatical Range & Accuracy
- Highlight weak areas specifically
- Suggest vocabulary upgrades with examples
- Provide model corrections for 1-2 weak paragraphs
- TEACH improvement, do not rewrite everything

### 5. Study Planning
- Create short-term study plans (daily/weekly)
- Recommend specific practice activities
- Detect inactivity and give accountability reminders
- Adjust difficulty based on performance

### 6. Motivation Engine
- Give accountability reminders when student is inactive
- Provide performance-based encouragement (backed by data)
- Give realistic timeline predictions
- Never use empty motivational phrases

Example: "You haven't practiced writing in 4 days. This may slow your progress toward Band 7."

## Student Profile
{user_context}

{homework_context}

## Homework Assignment
At the end of lessons or when appropriate, you can assign homework to the student. Use this EXACT format:

[HOMEWORK]
type: vocabulary
title: Academic Word List Practice
task: Learn these 10 words and write one sentence for each. Be ready for a quiz next session.
due: 2
[/HOMEWORK]

Available homework types: vocabulary, writing, grammar, speaking
The [HOMEWORK] block is automatically detected and tracked as an assignment.
After the block, briefly tell the student what you've assigned.
Only assign 1 homework per response. Make tasks specific and achievable.

When a student submits homework or says they completed it, evaluate their work thoroughly using IELTS criteria.

## Boundaries
- Focus exclusively on English learning and IELTS preparation
- No medical advice, life coaching, or unrelated topics
- Never encourage cheating or break academic integrity
- Only reference actual data - never fabricate scores or progress
- If you don't know something, be honest about it"""


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    user_id: str
    is_voice: bool = False
    audio_data: Optional[str] = None


class NewSessionRequest(BaseModel):
    user_id: str


class TTSRequest(BaseModel):
    text: str


class HomeworkSubmitRequest(BaseModel):
    user_id: str
    submission: str


class HomeworkAssignRequest(BaseModel):
    user_id: str
    hw_type: str = "vocabulary"
    title: str = ""
    task: str = ""
    due_days: int = 2


HOMEWORK_PATTERN = re.compile(r'\[HOMEWORK\](.*?)\[/HOMEWORK\]', re.DOTALL)


def _sanitize_homework_text(value: str, max_length: int) -> str:
    cleaned = re.sub(r"\s+", " ", (value or "")).strip()
    return cleaned[:max_length]


def build_recent_conversation_context(messages: List[Dict[str, Any]]) -> str:
    """Compress recent turns into a bounded prompt block."""
    if not messages:
        return ""

    recent = messages[-(LIZ_HISTORY_TURNS * 2):]
    history_lines = []
    for msg in recent:
        role = "Student" if msg.get("role") == "user" else "Liz"
        content = _sanitize_homework_text(msg.get("content", ""), LIZ_CONTEXT_MESSAGE_CHARS)
        if content:
            history_lines.append(f"{role}: {content}")

    if not history_lines:
        return ""

    return "\n\n## Recent Conversation:\n" + "\n".join(history_lines)


def parse_homework_from_response(response: str, user_id: str, session_id: str):
    """Parse [HOMEWORK] blocks from Liz's response. Returns (cleaned_response, homework_list)."""
    matches = HOMEWORK_PATTERN.findall(response)
    homework_list = []
    for match in matches[:1]:
        hw = {"user_id": user_id, "session_id": session_id, "status": "pending",
              "homework_id": str(uuid.uuid4()), "created_at": datetime.now(timezone.utc).isoformat()}
        for line in match.strip().split("\n"):
            line = line.strip()
            if line.lower().startswith("type:"):
                hw_type = line.split(":", 1)[1].strip().lower()
                hw["type"] = hw_type if hw_type in LIZ_ALLOWED_HOMEWORK_TYPES else "vocabulary"
            elif line.lower().startswith("title:"):
                hw["title"] = _sanitize_homework_text(line.split(":", 1)[1], 120)
            elif line.lower().startswith("task:"):
                hw["task"] = _sanitize_homework_text(line.split(":", 1)[1], 500)
            elif line.lower().startswith("due:"):
                try:
                    days = int(line.split(":", 1)[1].strip())
                except ValueError:
                    days = 2
                days = min(max(days, 1), 14)
                hw["due_date"] = (datetime.now(timezone.utc) + timedelta(days=days)).isoformat()
        if hw.get("title") and hw.get("task"):
            hw.setdefault("type", "vocabulary")
            hw.setdefault("due_date", (datetime.now(timezone.utc) + timedelta(days=2)).isoformat())
            homework_list.append(hw)

    cleaned = HOMEWORK_PATTERN.sub("", response).strip()
    return cleaned, homework_list


async def get_homework_context(user_id: str) -> str:
    """Get pending homework info for system prompt."""
    if db is None:
        return ""
    pending = await db.liz_homework.find(
        {"user_id": user_id, "status": {"$in": ["pending", "submitted"]}},
        {"_id": 0}
    ).sort("due_date", 1).to_list(10)
    if not pending:
        return ""
    lines = ["## Student's Pending Homework:"]
    for hw in pending:
        status_text = "awaiting submission" if hw["status"] == "pending" else "submitted - needs your review"
        overdue = ""
        if hw.get("due_date"):
            due = datetime.fromisoformat(hw["due_date"])
            if due < datetime.now(timezone.utc) and hw["status"] == "pending":
                overdue = " (OVERDUE)"
        lines.append(f"- [{hw.get('type', 'general').upper()}] {hw.get('title', 'Untitled')} - {status_text}{overdue}")
        if hw["status"] == "submitted":
            lines.append(f"  Student's submission: \"{hw.get('submission', '')[:200]}\"")
    return "\n".join(lines)


def get_api_key():
    return os.environ.get("EMERGENT_LLM_KEY", "")


def get_liz_model(task: str = "chat") -> str:
    """Return the default model for Liz tasks.

    Keep everyday teacher interactions on a cheaper model and reserve the
    heavier model for future deep-analysis surfaces.
    """
    if task in {"chat", "greet", "homework_review"}:
        return LIZ_DEFAULT_MODEL
    return LIZ_DEEP_MODEL


def select_chat_model(message: str, is_voice: bool = False) -> str:
    """Route heavier teacher tasks to the stronger model."""
    normalized = (message or "").lower()
    deep_keywords = [
        "study plan", "analyze my progress", "weekly plan", "band prediction",
        "evaluate my writing", "evaluate my speaking", "detailed feedback",
        "essay", "cue card", "part 3", "homework review"
    ]
    if is_voice or any(keyword in normalized for keyword in deep_keywords):
        return LIZ_DEEP_MODEL
    return LIZ_DEFAULT_MODEL


async def get_liz_user_access(user_id: str) -> dict:
    """Resolve the student's current plan and whether Liz is enabled."""
    if db is None:
        return {
            "user": None,
            "plan": "free",
            "features": get_plan_features("free"),
            "has_access": False,
        }

    user = await db.users.find_one({"id": user_id}, {"_id": 0, "id": 1, "name": 1, "email": 1, "plan": 1})
    plan = (user or {}).get("plan", "free")
    email = (user or {}).get("email")
    features = get_plan_features(plan, email)
    has_access = int(features.get("max_liz_messages", 0) or 0) > 0

    return {
        "user": user,
        "plan": plan,
        "features": features,
        "has_access": has_access,
    }


async def get_liz_usage_stats(user_id: str, max_messages: int) -> dict:
    """Count user-originated Liz messages for the current UTC month."""
    if db is None:
        return {"used_messages": 0, "remaining_messages": max_messages, "resets_at": None}

    now = datetime.now(timezone.utc)
    month_start = datetime(now.year, now.month, 1, tzinfo=timezone.utc)
    next_month = datetime(now.year + (1 if now.month == 12 else 0), 1 if now.month == 12 else now.month + 1, 1, tzinfo=timezone.utc)

    sessions = await db.liz_sessions.find(
        {"user_id": user_id, "created_at": {"$gte": month_start.isoformat()}},
        {"_id": 0, "messages": 1}
    ).to_list(200)

    used = 0
    for session in sessions:
        for msg in session.get("messages", []):
            if msg.get("role") == "user":
                timestamp = msg.get("timestamp") or session.get("created_at")
                if timestamp and timestamp >= month_start.isoformat():
                    used += 1

    remaining = max(max_messages - used, 0)
    return {
        "used_messages": used,
        "remaining_messages": remaining,
        "resets_at": next_month.isoformat(),
    }


async def ensure_liz_access(user_id: str) -> dict:
    access = await get_liz_user_access(user_id)
    if not access["has_access"]:
        raise HTTPException(status_code=403, detail="Liz Teacher is available on Learner, Achiever, and Master plans.")
    access["usage"] = await get_liz_usage_stats(user_id, int(access["features"].get("max_liz_messages", 0) or 0))
    return access


async def build_voice_pronunciation_context(audio_data_b64: Optional[str]) -> tuple[str, Optional[dict]]:
    """Optional Azure pronunciation analysis for Liz voice turns."""
    if not audio_data_b64 or not os.getenv("AZURE_SPEECH_KEY"):
        return "", None

    try:
        from routes.speaking_qb import azure_pronunciation_assessment

        audio_bytes = base64.b64decode(audio_data_b64)
        azure_result = await azure_pronunciation_assessment(audio_bytes, reference_text=None, language="en-US")
        if not azure_result or not azure_result.get("success"):
            return "", None

        azure_scores = {
            "pronunciation": round(float(azure_result.get("pronunciation_score", 0)), 1),
            "accuracy": round(float(azure_result.get("accuracy_score", 0)), 1),
            "fluency": round(float(azure_result.get("fluency_score", 0)), 1),
            "completeness": round(float(azure_result.get("completeness_score", 0)), 1),
            "prosody": round(float(azure_result.get("prosody_score", 0)), 1),
        }
        azure_context = (
            "\n\n## Acoustic Pronunciation Signals\n"
            f"- Pronunciation: {azure_scores['pronunciation']}/100\n"
            f"- Accuracy: {azure_scores['accuracy']}/100\n"
            f"- Fluency: {azure_scores['fluency']}/100\n"
            f"- Completeness: {azure_scores['completeness']}/100\n"
            f"- Prosody: {azure_scores['prosody']}/100\n"
            "Use these scores when you comment on pronunciation and fluency."
        )
        return azure_context, azure_scores
    except Exception as exc:
        logger.warning("Liz Azure pronunciation unavailable: %s", exc)
        return "", None


async def get_user_context(user_id: str) -> str:
    """Build comprehensive student profile for Liz's context injection."""
    if db is None:
        return "No student data available. This appears to be a new student."

    profile = {}

    # 1. Basic user info
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "name": 1, "email": 1, "plan": 1, "created_at": 1})
    if user:
        profile["name"] = user.get("name", "Student")
        profile["plan"] = user.get("plan", "free")
        created = user.get("created_at")
        if created:
            profile["member_since"] = str(created)[:10] if isinstance(created, str) else created.strftime("%Y-%m-%d")

    # 2. Test completions with scores
    completions = await db.user_completions.find(
        {"user_id": user_id}, {"_id": 0}
    ).sort("completed_at", -1).to_list(50)

    skill_scores = {"listening": [], "reading": [], "writing": [], "speaking": []}
    all_scores = []
    last_5_scores = []

    for c in completions:
        score = c.get("band_score")
        if score:
            all_scores.append({
                "score": score,
                "test_id": c.get("test_id", ""),
                "category": c.get("category", ""),
                "date": str(c.get("completed_at", ""))[:10]
            })
            # Categorize by skill if available
            skill = c.get("skill")
            if skill and skill in skill_scores:
                skill_scores[skill].append(score)

    if all_scores:
        last_5_scores = all_scores[:5]
        profile["tests_completed"] = len(all_scores)

    # 3. Calculate level and trends
    if all_scores:
        recent_avg = sum(s["score"] for s in all_scores[:5]) / min(len(all_scores), 5)
        profile["current_estimated_level"] = round(recent_avg, 1)
        profile["target_band"] = min(round(recent_avg + 1.0, 1), 9.0)

        if len(all_scores) >= 3:
            recent_3 = sum(s["score"] for s in all_scores[:3]) / 3
            older_3 = sum(s["score"] for s in all_scores[-3:]) / min(len(all_scores), 3)
            if recent_3 > older_3 + 0.3:
                profile["improvement_trend"] = "improving"
            elif recent_3 < older_3 - 0.3:
                profile["improvement_trend"] = "declining"
            else:
                profile["improvement_trend"] = "stable"

    # 4. Identify weak and strong skills
    weak_skills = []
    strong_skills = []
    skill_averages = {}

    for skill, scores in skill_scores.items():
        if scores:
            avg = sum(scores) / len(scores)
            skill_averages[skill] = round(avg, 1)

    if skill_averages:
        sorted_skills = sorted(skill_averages.items(), key=lambda x: x[1])
        weak_skills = [s[0] for s in sorted_skills[:2] if s[1] < 7.0]
        strong_skills = [s[0] for s in sorted_skills[-2:] if s[1] >= 6.0]

    # 5. Study streak and last active
    activity_dates = set()
    for c in completions:
        dt = c.get("completed_at")
        if dt:
            date_str = str(dt)[:10]
            activity_dates.add(date_str)

    # Check Liz sessions for activity
    sessions = await db.liz_sessions.find(
        {"user_id": user_id}, {"_id": 0, "created_at": 1}
    ).to_list(50)

    for s in sessions:
        dt = s.get("created_at")
        if dt:
            date_str = str(dt)[:10]
            activity_dates.add(date_str)

    if activity_dates:
        sorted_dates = sorted(activity_dates, reverse=True)
        profile["last_active"] = sorted_dates[0]

        # Calculate streak
        streak = 0
        today = datetime.now(timezone.utc).date()
        check_date = today
        for _ in range(30):
            if check_date.isoformat() in activity_dates:
                streak += 1
                check_date -= timedelta(days=1)
            else:
                break
        profile["study_streak_days"] = streak

        # Detect inactivity
        last_date = datetime.fromisoformat(sorted_dates[0]).date() if sorted_dates[0] else today
        days_inactive = (today - last_date).days
        if days_inactive > 2:
            profile["days_inactive"] = days_inactive

    # 6. Learning progress
    learning_progress = await db.user_learning_progress.find(
        {"user_id": user_id}, {"_id": 0}
    ).to_list(50)
    if learning_progress:
        profile["completed_lessons"] = len(learning_progress)

    # 7. Vocab/grammar quiz progress
    quiz_progress = await db.vocab_grammar_quiz_progress.find(
        {"user_id": user_id}, {"_id": 0, "score": 1, "topic": 1}
    ).to_list(20)
    if quiz_progress:
        profile["grammar_quizzes_completed"] = len(quiz_progress)
        avg_quiz = sum(q.get("score", 0) for q in quiz_progress) / len(quiz_progress)
        profile["avg_grammar_score"] = round(avg_quiz, 1)

    # 8. Build recommended next step
    if weak_skills:
        profile["recommended_focus"] = f"Practice {weak_skills[0]} - this is currently your weakest area"
    elif not all_scores:
        profile["recommended_focus"] = "Take a practice test to establish your baseline level"
    else:
        profile["recommended_focus"] = "Continue balanced practice across all skills"

    # Format as readable context
    lines = []
    lines.append(f"Student: {profile.get('name', 'Unknown')}")
    lines.append(f"Plan: {profile.get('plan', 'free')}")

    if "current_estimated_level" in profile:
        lines.append(f"Current estimated level: Band {profile['current_estimated_level']}")
        lines.append(f"Target band: {profile['target_band']}")

    if "improvement_trend" in profile:
        lines.append(f"Improvement trend: {profile['improvement_trend']}")

    if "tests_completed" in profile:
        lines.append(f"Tests completed: {profile['tests_completed']}")

    if skill_averages:
        lines.append("Skill breakdown:")
        for skill, avg in sorted(skill_averages.items(), key=lambda x: x[1]):
            lines.append(f"  - {skill.capitalize()}: Band {avg}")

    if weak_skills:
        lines.append(f"Weak skills: {', '.join(s.capitalize() for s in weak_skills)}")
    if strong_skills:
        lines.append(f"Strong skills: {', '.join(s.capitalize() for s in strong_skills)}")

    if last_5_scores:
        lines.append("Recent scores:")
        for s in last_5_scores:
            lines.append(f"  - {s['test_id']} ({s['category']}): Band {s['score']} on {s['date']}")

    if "study_streak_days" in profile:
        lines.append(f"Study streak: {profile['study_streak_days']} days")

    if "days_inactive" in profile:
        lines.append(f"WARNING: Student has been inactive for {profile['days_inactive']} days")

    if "last_active" in profile:
        lines.append(f"Last active: {profile['last_active']}")

    if "completed_lessons" in profile:
        lines.append(f"Lessons completed: {profile['completed_lessons']}")

    if "grammar_quizzes_completed" in profile:
        lines.append(f"Grammar quizzes: {profile['grammar_quizzes_completed']} (avg score: {profile.get('avg_grammar_score', 'N/A')})")

    if "recommended_focus" in profile:
        lines.append(f"Recommended next step: {profile['recommended_focus']}")

    if not lines or len(lines) <= 2:
        return "This is a new student with no test history yet. Welcome them and help them get started with IELTS preparation. Suggest taking a diagnostic test first."

    return "\n".join(lines)


async def get_or_create_session(user_id: str, session_id: Optional[str] = None) -> dict:
    """Get existing session or create a new one."""
    if session_id:
        session = await db.liz_sessions.find_one(
            {"session_id": session_id, "user_id": user_id},
            {"_id": 0}
        )
        if session:
            return session

    new_session = {
        "session_id": str(uuid.uuid4()),
        "user_id": user_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "messages": []
    }
    await db.liz_sessions.insert_one(new_session)
    return {k: v for k, v in new_session.items() if k != "_id"}


@router.post("/chat")
async def chat_with_liz(req: ChatRequest):
    """Send a message to Liz and get a response."""
    api_key = get_api_key()
    if not api_key:
        raise HTTPException(status_code=500, detail="LLM API key not configured")
    access = await ensure_liz_access(req.user_id)
    if access["usage"]["remaining_messages"] <= 0:
        raise HTTPException(status_code=402, detail="You have reached your Liz Teacher monthly message limit for this plan.")

    session = await get_or_create_session(req.user_id, req.session_id)
    session_id = session["session_id"]

    user_context = await get_user_context(req.user_id)
    hw_context = await get_homework_context(req.user_id)
    system_msg = LIZ_SYSTEM_PROMPT.replace("{user_context}", user_context).replace("{homework_context}", hw_context)

    # Add voice context if this is a spoken message
    if req.is_voice:
        system_msg += "\n\n## Voice Mode Active\nThe student is speaking to you via voice. Their message was transcribed from speech. When evaluating, consider natural speech patterns. Keep your response conversational but still structured. This is similar to an IELTS Speaking test scenario."
        azure_context, azure_scores = await build_voice_pronunciation_context(req.audio_data)
        if azure_context:
            system_msg += azure_context
    else:
        azure_scores = None

    # Build conversation context from history
    prev_messages = session.get("messages", [])
    system_msg += build_recent_conversation_context(prev_messages)

    chat = LlmChat(
        api_key=api_key,
        session_id=f"liz_{session_id}_{datetime.now(timezone.utc).strftime('%H%M%S')}",
        system_message=system_msg
    ).with_model("openai", select_chat_model(req.message, req.is_voice))

    response = await chat.send_message(UserMessage(text=req.message))

    # Parse homework assignments from response
    cleaned_response, hw_list = parse_homework_from_response(response, req.user_id, session_id)
    for hw in hw_list:
        await db.liz_homework.insert_one(hw)
    display_response = cleaned_response if cleaned_response else response

    now = datetime.now(timezone.utc).isoformat()
    await db.liz_sessions.update_one(
        {"session_id": session_id},
        {"$push": {"messages": {
            "$each": [
                {"role": "user", "content": req.message, "timestamp": now, "is_voice": req.is_voice},
                {"role": "assistant", "content": display_response, "timestamp": now}
            ]
        }}}
    )

    return {
        "success": True,
        "session_id": session_id,
        "response": display_response,
        "homework_assigned": [{"homework_id": h["homework_id"], "title": h["title"], "type": h["type"]} for h in hw_list],
        "voice_pronunciation": azure_scores,
        "usage": await get_liz_usage_stats(req.user_id, int(access["features"].get("max_liz_messages", 0) or 0)),
    }


@router.post("/new-session")
async def create_new_session(req: NewSessionRequest):
    """Start a new chat session."""
    await ensure_liz_access(req.user_id)
    session = await get_or_create_session(req.user_id)
    return {"success": True, "session_id": session["session_id"]}


@router.get("/status/{user_id}")
async def get_liz_status(user_id: str):
    """Return Liz availability, plan info, and monthly usage."""
    access = await get_liz_user_access(user_id)
    max_messages = int(access["features"].get("max_liz_messages", 0) or 0)
    usage = await get_liz_usage_stats(user_id, max_messages)
    return {
        "success": True,
        "plan": access["plan"],
        "has_access": access["has_access"],
        "max_messages": max_messages,
        "used_messages": usage["used_messages"],
        "remaining_messages": usage["remaining_messages"],
        "resets_at": usage["resets_at"],
        "default_model": LIZ_DEFAULT_MODEL,
        "deep_model": LIZ_DEEP_MODEL,
        "azure_pronunciation_enabled": bool(os.getenv("AZURE_SPEECH_KEY")),
    }


@router.post("/greet")
async def greet_student(req: NewSessionRequest):
    """Generate a personalized greeting when the student opens a lesson.
    Returns greeting text + TTS audio in a single call."""
    api_key = get_api_key()
    if not api_key:
        raise HTTPException(status_code=500, detail="LLM API key not configured")
    await ensure_liz_access(req.user_id)

    session = await get_or_create_session(req.user_id)
    user_context = await get_user_context(req.user_id)
    hw_context = await get_homework_context(req.user_id)

    hw_note = ""
    if hw_context:
        hw_note = f"\n\nIMPORTANT - The student has pending homework. Briefly remind them.\n{hw_context}"

    greeting_system = f"""You are Liz, a professional IELTS teacher. Generate a brief, warm greeting (2-3 sentences max) for your student who just opened their lesson.
Based on their profile, mention something specific about their progress and suggest what to work on today. Be warm but professional. Speak naturally as if you're face-to-face.{hw_note}

Student Profile:
{user_context}"""

    chat = LlmChat(
        api_key=api_key,
        session_id=f"liz_greet_{session['session_id']}",
        system_message=greeting_system
    ).with_model("openai", get_liz_model("greet"))

    greeting = await chat.send_message(UserMessage(text="Greet me and suggest today's lesson."))

    # Store greeting in session
    now = datetime.now(timezone.utc).isoformat()
    await db.liz_sessions.update_one(
        {"session_id": session["session_id"]},
        {"$push": {"messages": {"role": "assistant", "content": greeting, "timestamp": now}}}
    )

    # Generate TTS audio
    audio_base64 = None
    try:
        from emergentintegrations.llm.openai import OpenAITextToSpeech
        tts = OpenAITextToSpeech(api_key=api_key)
        audio_base64 = await tts.generate_speech_base64(
            text=greeting[:500], voice="nova", model="tts-1"
        )
    except Exception:
        pass

    return {
        "success": True,
        "session_id": session["session_id"],
        "greeting": greeting,
        "audio": audio_base64
    }


@router.get("/history/{session_id}")
async def get_chat_history(session_id: str, user_id: str):
    """Get chat history for a session."""
    await ensure_liz_access(user_id)
    session = await db.liz_sessions.find_one(
        {"session_id": session_id, "user_id": user_id},
        {"_id": 0}
    )
    if not session:
        return {"success": True, "messages": [], "session_id": session_id}
    return {
        "success": True,
        "session_id": session_id,
        "messages": session.get("messages", [])
    }


@router.get("/sessions/{user_id}")
async def get_user_sessions(user_id: str):
    """Get all chat sessions for a user."""
    await ensure_liz_access(user_id)
    sessions = await db.liz_sessions.find(
        {"user_id": user_id},
        {"_id": 0, "session_id": 1, "created_at": 1, "messages": {"$slice": 1}}
    ).sort("created_at", -1).to_list(20)

    result = []
    for s in sessions:
        first_msg = s.get("messages", [{}])[0] if s.get("messages") else {}
        result.append({
            "session_id": s["session_id"],
            "created_at": s.get("created_at", ""),
            "preview": first_msg.get("content", "New conversation")[:60]
        })

    return {"success": True, "sessions": result}


@router.post("/tts")
async def liz_speak(req: TTSRequest):
    """Convert Liz's response to speech."""
    if not req.text:
        raise HTTPException(status_code=400, detail="No text provided")

    api_key = get_api_key()
    if not api_key:
        raise HTTPException(status_code=500, detail="TTS API key not configured")

    try:
        from emergentintegrations.llm.openai import OpenAITextToSpeech
        tts = OpenAITextToSpeech(api_key=api_key)
        audio_base64 = await tts.generate_speech_base64(
            text=req.text[:500],
            voice="nova",
            model="tts-1"
        )
        return {"audio": audio_base64, "format": "mp3"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/stt")
async def speech_to_text(file: UploadFile = File(...)):
    """Transcribe audio from the student's microphone."""
    api_key = get_api_key()
    if not api_key:
        raise HTTPException(status_code=500, detail="STT API key not configured")

    try:
        from emergentintegrations.llm.openai import OpenAISpeechToText
        stt = OpenAISpeechToText(api_key=api_key)

        suffix = ".webm"
        if file.filename:
            ext = os.path.splitext(file.filename)[1]
            if ext:
                suffix = ext

        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name

        with open(tmp_path, "rb") as audio_file:
            response = await stt.transcribe(
                file=audio_file,
                model="whisper-1",
                language="en",
                response_format="json"
            )

        os.unlink(tmp_path)
        return {"success": True, "text": response.text}
    except Exception as e:
        if 'tmp_path' in locals():
            try:
                os.unlink(tmp_path)
            except OSError:
                pass
        raise HTTPException(status_code=500, detail=str(e))



# ── Homework Endpoints ──

@router.get("/homework/{user_id}")
async def get_homework(user_id: str, status: Optional[str] = None):
    """Get student's homework list."""
    await ensure_liz_access(user_id)
    query = {"user_id": user_id}
    if status:
        query["status"] = status
    homework = await db.liz_homework.find(
        query, {"_id": 0}
    ).sort("created_at", -1).to_list(20)
    return {"success": True, "homework": homework}


@router.post("/homework/assign")
async def assign_homework(req: HomeworkAssignRequest):
    """Manually assign homework (fallback if auto-detection missed it)."""
    await ensure_liz_access(req.user_id)
    hw = {
        "homework_id": str(uuid.uuid4()),
        "user_id": req.user_id,
        "session_id": "",
        "type": req.hw_type,
        "title": req.title or f"{req.hw_type.capitalize()} Practice",
        "task": req.task or "Complete the assigned practice.",
        "due_date": (datetime.now(timezone.utc) + timedelta(days=req.due_days)).isoformat(),
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.liz_homework.insert_one(hw)
    return {"success": True, "homework": {k: v for k, v in hw.items() if k != "_id"}}


@router.post("/homework/{homework_id}/submit")
async def submit_homework(homework_id: str, req: HomeworkSubmitRequest):
    """Student submits their homework answer."""
    await ensure_liz_access(req.user_id)
    hw = await db.liz_homework.find_one(
        {"homework_id": homework_id, "user_id": req.user_id}, {"_id": 0}
    )
    if not hw:
        raise HTTPException(status_code=404, detail="Homework not found")

    await db.liz_homework.update_one(
        {"homework_id": homework_id},
        {"$set": {
            "submission": req.submission,
            "submitted_at": datetime.now(timezone.utc).isoformat(),
            "status": "submitted"
        }}
    )

    # Auto-review with Liz
    api_key = get_api_key()
    feedback = ""
    score = None
    if api_key:
        try:
            review_prompt = f"""Review this student's homework submission using IELTS criteria.

Homework: [{hw.get('type', 'general').upper()}] {hw.get('title', '')}
Task: {hw.get('task', '')}
Student's Submission: {req.submission}

Provide:
1. Score out of 10
2. What they did well
3. What needs improvement
4. Corrected version or model answer (if applicable)
Keep feedback concise but specific."""

            chat = LlmChat(
                api_key=api_key,
                session_id=f"liz_review_{homework_id}",
                system_message="You are Liz, a professional IELTS teacher reviewing a student's homework. Be specific and constructive."
            ).with_model("openai", get_liz_model("homework_review"))
            feedback = await chat.send_message(UserMessage(text=review_prompt))

            # Try to extract score
            score_match = re.search(r'(\d+)\s*(?:/|out of)\s*10', feedback)
            if score_match:
                score = float(score_match.group(1))
        except Exception:
            feedback = "I'll review this in our next session."

    await db.liz_homework.update_one(
        {"homework_id": homework_id},
        {"$set": {"feedback": feedback, "score": score, "status": "reviewed"}}
    )

    return {
        "success": True,
        "feedback": feedback,
        "score": score,
        "status": "reviewed"
    }


@router.delete("/homework/{homework_id}")
async def delete_homework(homework_id: str, user_id: str):
    """Remove a homework assignment."""
    await ensure_liz_access(user_id)
    result = await db.liz_homework.delete_one(
        {"homework_id": homework_id, "user_id": user_id}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Homework not found")
    return {"success": True}
