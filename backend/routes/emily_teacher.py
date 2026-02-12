"""
Emily AI Teacher - Backend Routes
==================================
AI English teacher that provides personalized guidance, motivation,
grammar/vocab explanations, and interactive quizzes.
"""
import os
import uuid
import base64
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from emergentintegrations.llm.chat import LlmChat, UserMessage

router = APIRouter(prefix="/api/emily", tags=["emily-teacher"])

# MongoDB reference (set in server.py)
db = None

EMILY_SYSTEM_PROMPT = """You are Emily, a warm, encouraging, and knowledgeable IELTS English teacher. You work on an IELTS preparation platform called "IELTS Ace".

## Your Personality
- You're a young, energetic teacher who genuinely cares about each student's success
- You're patient, positive, and celebrate small wins
- You use a friendly but professional tone
- You occasionally use encouraging phrases like "Great job!", "You're making real progress!", "I believe in you!"
- Keep responses concise and focused (2-4 paragraphs max unless explaining something complex)
- Use simple, clear English appropriate for IELTS learners

## Your Capabilities
1. **Progress Guidance**: You know the student's test scores, practice history, and weak areas. Use this to give personalized advice.
2. **Grammar & Vocabulary**: Explain grammar rules clearly with examples. Teach vocabulary in context.
3. **Practice Recommendations**: Suggest specific practice areas based on the student's needs.
4. **Interactive Quizzes**: When asked, create mini quizzes (3-5 questions) on grammar, vocabulary, or IELTS topics. Format them clearly with numbered questions and options.
5. **Motivation**: Encourage students, help them set goals, and keep them engaged.
6. **IELTS Tips**: Share exam strategies, time management tips, and band score improvement advice.

## Quiz Format (when giving quizzes)
When creating a quiz, use this format:
📝 **Quick Quiz: [Topic]**

1. [Question]
   A) [Option]
   B) [Option]
   C) [Option]

After the student answers, provide feedback on each answer.

## Important Rules
- Always respond in English (you're an English teacher!)
- If the student writes in another language, gently encourage them to try in English
- Never make up test scores or progress data - only reference what's provided in the context
- Keep conversations educational but fun
- If you don't know something, be honest about it

## Student Context
{user_context}
"""


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    user_id: str


class NewSessionRequest(BaseModel):
    user_id: str


def get_api_key():
    return os.environ.get("EMERGENT_LLM_KEY", "")


async def get_user_context(user_id: str) -> str:
    """Fetch user's progress data to give Emily context."""
    if db is None:
        return "No progress data available yet."

    context_parts = []

    # Get user info
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "name": 1, "email": 1})
    if user:
        context_parts.append(f"Student name: {user.get('name', 'Student')}")

    # Get test completion stats
    completions = await db.user_completions.find({"user_id": user_id}).to_list(100)
    if completions:
        completed_count = len(completions)
        test_types = {}
        for c in completions:
            t = c.get("test_type", "unknown")
            test_types[t] = test_types.get(t, 0) + 1
        context_parts.append(f"Tests completed: {completed_count}")
        for t, count in test_types.items():
            context_parts.append(f"  - {t}: {count} tests")

    # Get recent test results
    results = await db.test_results.find(
        {"user_id": user_id},
        {"_id": 0, "score": 1, "skill": 1, "created_at": 1}
    ).sort("created_at", -1).to_list(5)
    if results:
        context_parts.append("Recent test scores:")
        for r in results:
            context_parts.append(f"  - {r.get('skill', 'General')}: {r.get('score', 'N/A')}")

    if not context_parts:
        return "This is a new student. No test history yet. Welcome them warmly and help them get started with IELTS preparation."

    return "\n".join(context_parts)


async def get_or_create_session(user_id: str, session_id: Optional[str] = None) -> dict:
    """Get existing session or create a new one."""
    if session_id:
        session = await db.emily_sessions.find_one(
            {"session_id": session_id, "user_id": user_id},
            {"_id": 0}
        )
        if session:
            return session

    # Create new session
    new_session = {
        "session_id": str(uuid.uuid4()),
        "user_id": user_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "messages": []
    }
    await db.emily_sessions.insert_one(new_session)
    return {k: v for k, v in new_session.items() if k != "_id"}


@router.post("/chat")
async def chat_with_emily(req: ChatRequest):
    """Send a message to Emily and get a response."""
    api_key = get_api_key()
    if not api_key:
        raise HTTPException(status_code=500, detail="LLM API key not configured")

    # Get or create session
    session = await get_or_create_session(req.user_id, req.session_id)
    session_id = session["session_id"]

    # Get user context for Emily
    user_context = await get_user_context(req.user_id)
    system_msg = EMILY_SYSTEM_PROMPT.replace("{user_context}", user_context)

    # Create LLM chat instance
    chat = LlmChat(
        api_key=api_key,
        session_id=f"emily_{session_id}",
        system_message=system_msg
    ).with_model("openai", "gpt-4o")

    # Replay previous messages for context
    prev_messages = session.get("messages", [])
    for msg in prev_messages[-20:]:  # Last 20 messages for context window
        if msg["role"] == "user":
            await chat.send_message(UserMessage(text=msg["content"]))
        # Assistant messages are automatically tracked by LlmChat

    # Send the new message
    response = await chat.send_message(UserMessage(text=req.message))

    # Store messages in MongoDB
    now = datetime.now(timezone.utc).isoformat()
    await db.emily_sessions.update_one(
        {"session_id": session_id},
        {"$push": {"messages": {
            "$each": [
                {"role": "user", "content": req.message, "timestamp": now},
                {"role": "assistant", "content": response, "timestamp": now}
            ]
        }}}
    )

    return {
        "success": True,
        "session_id": session_id,
        "response": response
    }


@router.post("/new-session")
async def create_new_session(req: NewSessionRequest):
    """Start a new chat session with Emily."""
    session = await get_or_create_session(req.user_id)
    return {
        "success": True,
        "session_id": session["session_id"]
    }


@router.get("/history/{session_id}")
async def get_chat_history(session_id: str, user_id: str):
    """Get chat history for a session."""
    session = await db.emily_sessions.find_one(
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
    sessions = await db.emily_sessions.find(
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
async def emily_speak(text: str = "", message: str = ""):
    """Convert Emily's response to speech."""
    content = text or message
    if not content:
        raise HTTPException(status_code=400, detail="No text provided")

    api_key = get_api_key()
    if not api_key:
        raise HTTPException(status_code=500, detail="TTS API key not configured")

    try:
        from emergentintegrations.llm.openai import OpenAITextToSpeech
        tts = OpenAITextToSpeech(api_key=api_key)
        audio_base64 = await tts.generate_speech_base64(
            text=content[:500],
            voice="nova",
            model="tts-1"
        )
        return {"audio": audio_base64, "format": "mp3"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
