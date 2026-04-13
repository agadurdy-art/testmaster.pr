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
from datetime import datetime, timezone, timedelta
from typing import Optional, List
from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel

from emergentintegrations.llm.chat import LlmChat, UserMessage

router = APIRouter(prefix="/api/liz", tags=["liz-teacher"])

db = None

LIZ_SYSTEM_PROMPT = """You are Liz, a personal IELTS teacher on IELTS Ace. You are not a chatbot — you are a real teacher with a specific student in front of you.

## Response Rules (STRICT)
- Maximum 4-5 lines per response, then ONE clear action
- No filler: never say "Great question!", "Amazing!", "Of course!", or "Certainly!"
- No generic praise without data behind it
- Be direct, warm, specific — like a real teacher in a one-on-one session
- Always end with exactly ONE next step (not a list of options)
- If the student writes in their native language, respond briefly in that language then switch to English

## Navigation — Use These Buttons
When recommending practice, include a navigation button using EXACTLY this format:
[NAVIGATE: /route | Button Label]

Available routes:
- Writing Task 2: [NAVIGATE: /writing-practice/task2 | Practice Writing Task 2]
- Writing Task 1: [NAVIGATE: /writing-practice/task1 | Practice Writing Task 1]
- Speaking: [NAVIGATE: /speaking-practice | Practice Speaking]
- Reading (Academic): [NAVIGATE: /reading-practice/academic | Practice Reading]
- Listening: [NAVIGATE: /listening-practice | Practice Listening]
- Question Bank: [NAVIGATE: /question-bank | Open Question Bank]
- Full Mock Test: [NAVIGATE: /full-test | Take a Full Mock Test]
- Level Test: [NAVIGATE: /adaptive-level-test | Take Level Test]
- Mastery Course: [NAVIGATE: /mastery-course | Open Mastery Course]
- Advanced Course: [NAVIGATE: /advanced-mastery | Open Advanced Course]
- Unified Journey: [NAVIGATE: /unified | Continue Learning Journey]

## Session Opening (No Waiting)
When starting a new session, immediately:
1. Reference the student's last activity or weakness (from their profile)
2. State today's focus in ONE sentence
3. Give ONE navigate button to start

Example opening:
"Your writing is your weakest skill at Band 5.5. Today, let's work on Task Achievement — examiners say your main position isn't clear enough.
[NAVIGATE: /writing-practice/task2 | Start Writing Practice]"

## Student Profile
{user_context}

{homework_context}

## Homework Assignment
When appropriate, assign homework using this format:
[HOMEWORK]
type: writing
title: Task 2 — Opinion Essay
task: Write a 250-word essay on: "Should universities be free?" Focus on clear position in opening sentence.
due: 2
[/HOMEWORK]
Only assign 1 homework per session. Be specific.

## Evaluation Discussions
When discussing a student's evaluation result:
- Reference their EXACT words and sentences
- Give the ONE most important fix first
- Show a corrected version of their weakest sentence
- End with a practice button

## Boundaries
- IELTS and English learning only
- Never fabricate scores or invent progress data
- Never encourage academic dishonesty"""


class EvaluationContext(BaseModel):
    skill: str  # "writing" | "speaking" | "reading"
    user_text: Optional[str] = None
    overall_band: Optional[str] = None
    criteria_scores: Optional[dict] = None
    feedback: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    user_id: str
    is_voice: bool = False
    evaluation_context: Optional[EvaluationContext] = None


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


def parse_homework_from_response(response: str, user_id: str, session_id: str):
    """Parse [HOMEWORK] blocks from Liz's response. Returns (cleaned_response, homework_list)."""
    matches = HOMEWORK_PATTERN.findall(response)
    homework_list = []
    for match in matches:
        hw = {"user_id": user_id, "session_id": session_id, "status": "pending",
              "homework_id": str(uuid.uuid4()), "created_at": datetime.now(timezone.utc).isoformat()}
        for line in match.strip().split("\n"):
            line = line.strip()
            if line.lower().startswith("type:"):
                hw["type"] = line.split(":", 1)[1].strip().lower()
            elif line.lower().startswith("title:"):
                hw["title"] = line.split(":", 1)[1].strip()
            elif line.lower().startswith("task:"):
                hw["task"] = line.split(":", 1)[1].strip()
            elif line.lower().startswith("due:"):
                try:
                    days = int(line.split(":", 1)[1].strip())
                except ValueError:
                    days = 2
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


async def get_user_context(user_id: str) -> str:
    """Build comprehensive student profile for Liz's context injection."""
    if db is None:
        return "No student data available. This appears to be a new student."

    profile = {}

    # 1. Basic user info
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "name": 1, "email": 1, "plan": 1, "created_at": 1, "onboarding": 1, "learning_mode": 1})
    if user:
        profile["name"] = user.get("name", "Student")
        profile["plan"] = user.get("plan", "free")
        profile["learning_mode"] = user.get("learning_mode", "ielts")
        created = user.get("created_at")
        if created:
            profile["member_since"] = str(created)[:10] if isinstance(created, str) else created.strftime("%Y-%m-%d")
        # Onboarding quiz data
        onboarding = user.get("onboarding") or {}
        if onboarding:
            if onboarding.get("target_band"):
                profile["stated_target_band"] = onboarding["target_band"]
            if onboarding.get("exam_date"):
                profile["stated_exam_date"] = onboarding["exam_date"]
            if onboarding.get("weakest_skill"):
                profile["stated_weakest_skill"] = onboarding["weakest_skill"]
            if onboarding.get("current_band"):
                profile["stated_current_band"] = onboarding["current_band"]

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

    # Check chat sessions for activity
    sessions = await db.liz_sessions.find(
        {"user_id": user_id}, {"_id": 0, "created_at": 1}
    ).to_list(50)
    # Also check old emily sessions
    emily_sessions = await db.emily_sessions.find(
        {"user_id": user_id}, {"_id": 0, "created_at": 1}
    ).to_list(50)

    for s in sessions + emily_sessions:
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
    lines.append(f"Learning mode: {profile.get('learning_mode', 'ielts')}")

    if profile.get("stated_target_band"):
        lines.append(f"Student's stated target: Band {profile['stated_target_band']}")
    if profile.get("stated_exam_date"):
        lines.append(f"Student's exam date: {profile['stated_exam_date']}")
    if profile.get("stated_weakest_skill"):
        lines.append(f"Student's stated weakest skill: {profile['stated_weakest_skill']}")
    if profile.get("stated_current_band"):
        lines.append(f"Student's stated current band: {profile['stated_current_band']}")

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

    session = await get_or_create_session(req.user_id, req.session_id)
    session_id = session["session_id"]

    user_context = await get_user_context(req.user_id)
    hw_context = await get_homework_context(req.user_id)
    system_msg = LIZ_SYSTEM_PROMPT.replace("{user_context}", user_context).replace("{homework_context}", hw_context)

    # Add evaluation context if discussing a specific submission
    if req.evaluation_context:
        ctx = req.evaluation_context
        eval_section = f"""

## Active Evaluation Discussion
The student wants to discuss their recent {ctx.skill} evaluation.
Answer questions specifically about THIS submission. Reference exact phrases from their text.
Do NOT re-evaluate from scratch unless asked. Build on the existing evaluation.

Skill: {ctx.skill}
Overall Band: {ctx.overall_band or 'N/A'}
Criteria Scores: {ctx.criteria_scores or {}}
AI Feedback Given: {(ctx.feedback or '')[:800]}
Student's Submission (first 1500 chars): {(ctx.user_text or '')[:1500]}
"""
        system_msg += eval_section

    # Add voice context if this is a spoken message
    if req.is_voice:
        system_msg += "\n\n## Voice Mode Active\nThe student is speaking to you via voice. Their message was transcribed from speech. When evaluating, consider natural speech patterns. Keep your response conversational but still structured. This is similar to an IELTS Speaking test scenario."

    # Build conversation context from history
    prev_messages = session.get("messages", [])
    if prev_messages:
        recent = prev_messages[-16:]
        history_lines = []
        for msg in recent:
            role = "Student" if msg["role"] == "user" else "Liz"
            history_lines.append(f"{role}: {msg['content']}")
        system_msg += "\n\n## Recent Conversation:\n" + "\n".join(history_lines)

    # Use Haiku for regular chat (fast, concise), Sonnet for evaluation discussions
    chat_model = "claude-sonnet-4-6" if req.evaluation_context else "claude-haiku-4-5-20251001"
    chat = LlmChat(
        api_key=api_key,
        session_id=f"liz_{session_id}_{datetime.now(timezone.utc).strftime('%H%M%S')}",
        system_message=system_msg
    ).with_model("anthropic", chat_model)

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
        "homework_assigned": [{"homework_id": h["homework_id"], "title": h["title"], "type": h["type"]} for h in hw_list]
    }


@router.post("/new-session")
async def create_new_session(req: NewSessionRequest):
    """Start a new chat session."""
    session = await get_or_create_session(req.user_id)
    return {"success": True, "session_id": session["session_id"]}


@router.post("/greet")
async def greet_student(req: NewSessionRequest):
    """Generate a personalized greeting when the student opens a lesson.
    Returns greeting text + TTS audio in a single call."""
    api_key = get_api_key()
    if not api_key:
        raise HTTPException(status_code=500, detail="LLM API key not configured")

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
    ).with_model("openai", "gpt-4o")

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
            ).with_model("openai", "gpt-4o")
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
    result = await db.liz_homework.delete_one(
        {"homework_id": homework_id, "user_id": user_id}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Homework not found")
    return {"success": True}
