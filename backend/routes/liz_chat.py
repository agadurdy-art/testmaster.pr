"""
Liz Teacher — chat + streaming endpoints & session management.

Single job: the conversational surface — /chat, /chat/stream (SSE),
/new-session, /status/{user_id}, /greet, /history/{session_id},
/sessions/{user_id} — plus session helpers, chat-model selection, and
the mode classifier that drives the LizTeacher D8 canvas tint.

Extracted from routes/liz_teacher.py (Faz 1 refactor, 2026-07-02).
`db` is injected via routes/liz_teacher.py (server.py sets
`liz_teacher.db = db`, which fans out to every liz_* module).
"""
import os
import json
import uuid
import logging
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import HTTPException, Depends
from fastapi.responses import StreamingResponse
import auth_session  # audit F-02: session ownership on Liz user-scoped routes
from pydantic import BaseModel

from services import liz_llm, liz_tts
from routes.liz_access import (
    router,
    ensure_liz_access,
    get_liz_user_access,
    get_liz_usage_stats,
    _liz_quota_402_payload,
)
from routes.liz_context import (
    LIZ_SYSTEM_PROMPT,
    get_user_context,
    get_homework_context,
    build_recent_conversation_context,
    build_voice_pronunciation_context,
    parse_homework_from_response,
    parse_navigate_links,
    _normalize_feedback_language,
    _language_directive,
    _get_minimal_profile,
    get_or_create_study_plan,
    _recommended_course_for_band,
)

db = None
logger = logging.getLogger(__name__)


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    user_id: str
    is_voice: bool = False
    audio_data: Optional[str] = None
    feedback_language: Optional[str] = None  # ISO 639-1; see LIZ_SUPPORTED_FEEDBACK_LANGUAGES


class NewSessionRequest(BaseModel):
    user_id: str


def get_api_key():
    """Legacy helper kept for callers; real auth is inside liz_llm."""
    return os.environ.get("ANTHROPIC_API_KEY", "")


def get_liz_model(task: str = "chat") -> str:
    return liz_llm.deep_model() if task not in {"chat", "greet"} else liz_llm.default_model()


def select_chat_model(message: str, is_voice: bool = False) -> str:
    return liz_llm.select_model(message, is_voice=is_voice)


def detect_liz_mode(user_message: str, response: str, is_voice: bool, has_pronunciation: bool) -> str:
    """Classify the current Liz turn into one of: teaching, listening, reviewing,
    coaching, default. Drives the canvas tint on the LizTeacher D8 surface
    (no badge is shown to the user — internal signal only).

    Heuristics, in priority order:
    - Pronunciation feedback turn (Azure scores returned) → reviewing
    - User spoke (is_voice) → listening
    - Response references homework / feedback / review → reviewing
    - Response gives praise + tip / motivation → coaching
    - Otherwise → teaching (the default for an explanatory turn)
    """
    if has_pronunciation:
        return "reviewing"
    if is_voice:
        return "listening"
    resp_lower = (response or "").lower()
    user_lower = (user_message or "").lower()
    review_kw = ("homework", "review", "feedback on your", "let's go over", "your last answer")
    if any(kw in resp_lower for kw in review_kw) or any(kw in user_lower for kw in review_kw):
        return "reviewing"
    coach_kw = ("great job", "well done", "nice work", "keep it up", "you can do this", "remember to")
    if any(kw in resp_lower for kw in coach_kw):
        return "coaching"
    return "teaching"


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


async def _prepare_chat_context(req: ChatRequest):
    """Shared setup for both /chat and /chat/stream. Runs access checks,
    builds the system prompt, and returns everything the LLM call needs."""
    access = await ensure_liz_access(req.user_id)
    if access["usage"]["remaining_messages"] <= 0:
        # Structured 402 so the frontend paywall can render plan/remaining
        # /total/upgrade options. See project_pricing_backlog.md for the
        # upgrade-resume flow this payload feeds into.
        raise HTTPException(status_code=402, detail=_liz_quota_402_payload(access))

    session = await get_or_create_session(req.user_id, req.session_id)
    session_id = session["session_id"]

    user_context = await get_user_context(req.user_id)
    hw_context = await get_homework_context(req.user_id)
    system_msg = LIZ_SYSTEM_PROMPT.replace("{user_context}", user_context).replace("{homework_context}", hw_context)

    azure_scores = None
    if req.is_voice:
        system_msg += (
            "\n\n## Voice Mode Active\nThe student is speaking to you via voice. "
            "Their message was transcribed from speech. When evaluating, consider "
            "natural speech patterns. Keep your response conversational but still "
            "structured. This is similar to an IELTS Speaking test scenario."
        )
        azure_context, azure_scores = await build_voice_pronunciation_context(req.audio_data)
        if azure_context:
            system_msg += azure_context

    lang = _normalize_feedback_language(req.feedback_language)
    if not lang:
        # Fall back to the user's stored onboarding preference.
        try:
            profile = await db.users.find_one(
                {"id": req.user_id}, {"_id": 0, "feedback_language": 1}
            )
            if profile:
                lang = _normalize_feedback_language(profile.get("feedback_language"))
        except Exception:
            pass
    system_msg += _language_directive(lang)

    system_msg += build_recent_conversation_context(session.get("messages", []))

    return {
        "access": access, "session_id": session_id, "system_msg": system_msg,
        "azure_scores": azure_scores,
    }


@router.post("/chat")
async def chat_with_liz(req: ChatRequest, caller: dict = Depends(auth_session.current_user)):
    auth_session.require_self_or_admin(req.user_id, caller)
    """Send a message to Liz and get a response (non-streaming)."""
    ctx = await _prepare_chat_context(req)
    session_id = ctx["session_id"]

    response = await liz_llm.complete(
        system=ctx["system_msg"],
        user_message=req.message,
        session_id=f"liz_{session_id}_{datetime.now(timezone.utc).strftime('%H%M%S')}",
        is_voice=req.is_voice,
    )

    # Parse homework + navigation markers
    response_after_hw, hw_list = parse_homework_from_response(response, req.user_id, session_id)
    display_response, nav_links = parse_navigate_links(response_after_hw)
    for hw in hw_list:
        await db.liz_homework.insert_one(hw)

    now = datetime.now(timezone.utc).isoformat()
    await db.liz_sessions.update_one(
        {"session_id": session_id},
        {"$push": {"messages": {
            "$each": [
                {"role": "user", "content": req.message, "timestamp": now, "is_voice": req.is_voice},
                {"role": "assistant", "content": display_response, "timestamp": now,
                 "navigate_links": nav_links or None}
            ]
        }}}
    )

    return {
        "success": True,
        "session_id": session_id,
        "response": display_response,
        "mode": detect_liz_mode(
            req.message, display_response, req.is_voice, ctx["azure_scores"] is not None
        ),
        "navigate_links": nav_links,
        "homework_assigned": [{"homework_id": h["homework_id"], "title": h["title"], "type": h["type"]} for h in hw_list],
        "voice_pronunciation": ctx["azure_scores"],
        "usage": await get_liz_usage_stats(
            req.user_id,
            int(ctx["access"]["quota"].get("total") or 0),
            user=ctx["access"].get("user"),
        ),
    }


@router.post("/chat/stream")
async def chat_with_liz_stream(req: ChatRequest, caller: dict = Depends(auth_session.current_user)):
    auth_session.require_self_or_admin(req.user_id, caller)
    """SSE streaming variant. Emits token deltas, then a final JSON payload
    carrying homework + navigation links + usage. Frontend parses:

        data: {"type":"delta","text":"..."}
        data: {"type":"done","response":"...","navigate_links":[...], ...}
    """
    ctx = await _prepare_chat_context(req)
    session_id = ctx["session_id"]

    async def event_stream():
        collected = []
        try:
            async for delta in liz_llm.stream(
                system=ctx["system_msg"],
                user_message=req.message,
                is_voice=req.is_voice,
            ):
                collected.append(delta)
                yield f"data: {json.dumps({'type': 'delta', 'text': delta})}\n\n"
        except Exception as exc:
            logger.exception("Liz stream failed")
            yield f"data: {json.dumps({'type': 'error', 'detail': str(exc)})}\n\n"
            return

        full = "".join(collected)
        response_after_hw, hw_list = parse_homework_from_response(full, req.user_id, session_id)
        display_response, nav_links = parse_navigate_links(response_after_hw)
        for hw in hw_list:
            await db.liz_homework.insert_one(hw)

        now = datetime.now(timezone.utc).isoformat()
        await db.liz_sessions.update_one(
            {"session_id": session_id},
            {"$push": {"messages": {
                "$each": [
                    {"role": "user", "content": req.message, "timestamp": now, "is_voice": req.is_voice},
                    {"role": "assistant", "content": display_response, "timestamp": now,
                     "navigate_links": nav_links or None}
                ]
            }}}
        )

        usage = await get_liz_usage_stats(
            req.user_id,
            int(ctx["access"]["quota"].get("total") or 0),
            user=ctx["access"].get("user"),
        )
        final = {
            "type": "done",
            "session_id": session_id,
            "response": display_response,
            "mode": detect_liz_mode(
                req.message, display_response, req.is_voice, ctx["azure_scores"] is not None
            ),
            "navigate_links": nav_links,
            "homework_assigned": [
                {"homework_id": h["homework_id"], "title": h["title"], "type": h["type"]}
                for h in hw_list
            ],
            "voice_pronunciation": ctx["azure_scores"],
            "usage": usage,
        }
        yield f"data: {json.dumps(final)}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@router.post("/new-session")
async def create_new_session(req: NewSessionRequest):
    """Start a new chat session."""
    await ensure_liz_access(req.user_id)
    session = await get_or_create_session(req.user_id)
    return {"success": True, "session_id": session["session_id"]}


@router.get("/status/{user_id}")
async def get_liz_status(user_id: str, caller: dict = Depends(auth_session.current_user)):
    auth_session.require_self_or_admin(user_id, caller)
    """Return Liz availability, plan info, and monthly usage."""
    access = await get_liz_user_access(user_id)
    max_messages = int(access["quota"].get("total") or 0)
    usage = await get_liz_usage_stats(user_id, max_messages, user=access.get("user"))
    llm_health = liz_llm.health()
    tts_health = liz_tts.health()

    # D8 study-plan hookups: minimal profile + cached/refreshed Sonnet plan.
    # Failures are non-fatal — frontend has fallbacks for all of these fields.
    profile: dict = {}
    plan: Optional[dict] = None
    try:
        profile = await _get_minimal_profile(user_id)
    except Exception as e:
        logger.warning("Liz status profile fetch failed: %s", e)
    try:
        if access["has_access"]:
            plan = await get_or_create_study_plan(user_id, profile or None)
    except Exception as e:
        logger.warning("Liz status plan fetch failed: %s", e)

    plan_day = None
    plan_days = None
    week_plan: List[dict] = []
    focus_steps: List[str] = []
    focus_note = None
    if plan:
        plan_day = plan.get("plan_day")
        plan_days = plan.get("plan_days", 7)
        week_plan = plan.get("week_plan") or []
        focus_note = plan.get("focus_note")
        if isinstance(plan_day, int) and 1 <= plan_day <= len(week_plan):
            today = week_plan[plan_day - 1] or {}
            steps = today.get("steps") or []
            if isinstance(steps, list):
                focus_steps = [str(s) for s in steps if s]

    current_band = profile.get("current_estimated_level") if profile else None
    target_band = (plan or {}).get("target_band") or (profile.get("target_band") if profile else None)
    streak_days = profile.get("study_streak_days", 0) if profile else 0
    recommended_course = _recommended_course_for_band(current_band)

    return {
        "success": True,
        "plan": access["plan"],
        "has_access": access["has_access"],
        "max_messages": max_messages,
        "used_messages": usage["used_messages"],
        "remaining_messages": usage["remaining_messages"],
        "resets_at": usage["resets_at"],
        "provider": llm_health["provider"],
        "default_model": llm_health["default_model"],
        "deep_model": llm_health["deep_model"],
        "azure_pronunciation_enabled": bool(os.getenv("AZURE_SPEECH_KEY")),
        "tts": tts_health,
        # D8 LizD8 surface fields
        "plan_day": plan_day,
        "plan_days": plan_days,
        "week_plan": week_plan,
        "focus_steps": focus_steps,
        "focus_note": focus_note,
        "recommended_course": recommended_course,
        "streak_days": streak_days,
        "target_band": target_band,
        "current_estimated_level": current_band,
    }


@router.post("/greet")
async def greet_student(req: NewSessionRequest):
    """Generate a personalized greeting when the student opens a lesson.
    Returns greeting text + TTS audio in a single call."""
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

    greeting = await liz_llm.complete(
        system=greeting_system,
        user_message="Greet me and suggest today's lesson.",
        session_id=f"liz_greet_{session['session_id']}",
        task="chat",
        max_tokens=400,
    )

    # Store greeting in session
    now = datetime.now(timezone.utc).isoformat()
    await db.liz_sessions.update_one(
        {"session_id": session["session_id"]},
        {"$push": {"messages": {"role": "assistant", "content": greeting, "timestamp": now}}}
    )

    # Generate TTS audio (Azure SoniaNeural primary, OpenAI fallback)
    tts_result = await liz_tts.synthesize(greeting)

    return {
        "success": True,
        "session_id": session["session_id"],
        "greeting": greeting,
        "mode": "teaching",  # greeting always opens in teaching tint
        "audio": tts_result["audio"],
        "audio_provider": tts_result["provider"],
    }


@router.get("/history/{session_id}")
async def get_chat_history(session_id: str, user_id: str, caller: dict = Depends(auth_session.current_user)):
    auth_session.require_self_or_admin(user_id, caller)
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
async def get_user_sessions(user_id: str, caller: dict = Depends(auth_session.current_user)):
    auth_session.require_self_or_admin(user_id, caller)
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
