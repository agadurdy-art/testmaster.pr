"""
ElevenLabs Conversational Liz routes
====================================
Replaces the legacy Gemini Live pipeline (deleted 2026-04-29 in Phase A).
The browser uses @elevenlabs/react WebRTC SDK; this server handles two
sensitive operations the SDK shouldn't touch directly:

    POST /api/liz_eleven/token
        Validate the user has a Premium plan + remaining seconds, mint a
        short-lived signed URL for the agent, return it with dynamic
        variables (mode/part/student_name/target_band/cue_card_*) that
        ElevenLabs will substitute into the agent system prompt.

    POST /api/liz_eleven/finalize
        Called after the user ends the call. Post-fetches the full
        transcript via the Conversation API, deducts elapsed seconds from
        the user's quota, and (for Part 2) stores `part2_theme` so a
        subsequent Part 3 session can be primed with connected questions.

Why server-side mint instead of letting the browser hit ElevenLabs:
    1. xi-api-key never reaches the browser
    2. Quota / plan check happens before the agent is reachable
    3. We can short-circuit free-tier users with a clean 402

Agent (set 2026-04-29):
    ELEVENLABS_AGENT_ID=agent_7201kqae0mapeajtk70hcmth8bj0
    LLM=GPT-5.1, TTS=Flash, voice=Liz (Jeanette)
"""
from __future__ import annotations

import asyncio
import logging
import os
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

import httpx
from fastapi import APIRouter, HTTPException, Depends
import auth_session  # audit F-03: gate ElevenLabs token/finalize by session
from pydantic import BaseModel, Field

from services.liz_eleven_quota import (
    LizLiveGrant,
    deduct_liz_live_seconds,
    resolve_liz_live_grant,
)


logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/liz_eleven", tags=["Liz ElevenLabs Conversational"])

ELEVENLABS_API_BASE = "https://api.elevenlabs.io/v1"
ELEVEN_AGENT_ID = os.getenv("ELEVENLABS_AGENT_ID")
# Dedicated agent that runs a COMPLETE 3-part mock IELTS Speaking exam in one
# continuous conversation (created via the ElevenLabs API 2026-06-05). Falls
# back to the created id so it works before the Railway env var is set.
ELEVEN_EXAM_AGENT_ID = os.getenv(
    "ELEVENLABS_EXAM_AGENT_ID", "agent_2401ktbhb8w1ev18xskqy2hqqmve"
)
ELEVEN_API_KEY = os.getenv("ELEVENLABS_API_KEY")
SIGNED_URL_TIMEOUT = 12.0  # seconds — ElevenLabs returns in ~200ms typically
TRANSCRIPT_TIMEOUT = 15.0


db = None


def set_db(database) -> None:
    global db
    db = database


# ─── Request / response models ───────────────────────────────────────────────


class TokenRequest(BaseModel):
    user_id: str
    part: str = Field(default="part1", description="part1 | part3")
    # kind="exam" routes to the full-mock-exam agent (one continuous 3-part
    # session); otherwise the per-part Liz Live agent is used.
    kind: Optional[str] = None
    # Optional Part 2 hand-off so Part 3 can ask connected questions.
    part2_theme: Optional[str] = None
    part2_transcript: Optional[str] = None
    # Cue card metadata (Part 1/3 conversational don't normally use a card,
    # but the agent prompt accepts these as dynamic vars so the same payload
    # shape works for any part).
    cue_card_topic: Optional[str] = None
    cue_card_bullets: Optional[List[str]] = None


class TokenResponse(BaseModel):
    # WebRTC path (preferred — lower latency, used by @elevenlabs/react SDK
    # with `connectionType: 'webrtc'`).
    conversation_token: str
    # WebSocket fallback (only populated if WebRTC mint fails). Frontend can
    # pass this to `startSession({ signedUrl, connectionType: 'websocket' })`.
    signed_url: Optional[str] = None
    connection_type: str = "webrtc"
    agent_id: str
    conversation_dynamic_variables: Dict[str, Any]
    quota: Dict[str, Any]


class FinalizeRequest(BaseModel):
    user_id: str
    conversation_id: str
    part: str = "part1"
    elapsed_seconds: int = 0


class FinalizeResponse(BaseModel):
    transcript: str
    transcript_turns: List[Dict[str, Any]]
    part2_theme: Optional[str] = None
    quota: Dict[str, Any]


# ─── Helpers ─────────────────────────────────────────────────────────────────


def _quota_payload(grant: LizLiveGrant) -> Dict[str, Any]:
    return {
        "plan": grant.plan,
        "seconds_remaining": grant.seconds_remaining,
        "seconds_granted": grant.seconds_granted,
        "period_key": grant.period_key,
        "is_admin": grant.is_admin,
    }


def _greeting_for_now() -> str:
    """Time-of-day greeting in user-local terms. Uses server local time as a
    proxy — close enough for a single English word."""
    h = datetime.now().hour
    if h < 12:
        return "Good morning"
    if h < 18:
        return "Good afternoon"
    return "Good evening"


def _build_dynamic_variables(
    user: Dict[str, Any], req: TokenRequest,
) -> Dict[str, Any]:
    """ElevenLabs substitutes these into the agent system prompt + first
    message. Keys must mirror the placeholders configured in the dashboard
    (see project_elevenlabs_liz_migration.md — 11 dynamic vars)."""
    weak = user.get("weak_areas") or []
    if isinstance(weak, list):
        weak_str = ", ".join(str(w) for w in weak[:5])
    else:
        weak_str = str(weak)
    recent = user.get("recent_topics") or []
    if isinstance(recent, list):
        recent_str = ", ".join(str(t) for t in recent[:5])
    else:
        recent_str = str(recent)
    return {
        "mode": "live_conversation",
        "part": req.part,
        "greeting": _greeting_for_now(),
        "student_name": (user.get("name") or "there").split()[0],
        "target_band": float(user.get("target_band") or 7.0),
        "last_band": float(user.get("last_band") or 0) or "",
        "weak_areas": weak_str,
        "native_language": user.get("feedback_language") or "en",
        "recent_topics": recent_str,
        "cue_card_topic": req.cue_card_topic or "",
        "cue_card_bullets": "; ".join(req.cue_card_bullets or []),
        "part2_theme": req.part2_theme or "",
        "part2_transcript": (req.part2_transcript or "")[:1500],
    }


async def _fetch_conversation_token(agent_id: str) -> str:
    """Mint a short-lived WebRTC conversation token. The frontend SDK passes
    this to `startSession({ conversationToken, connectionType: 'webrtc' })`.

    Endpoint reference: GET /v1/convai/conversation/token?agent_id=... — same
    URL the @elevenlabs/client SDK calls internally, but proxied through the
    backend so xi-api-key never reaches the browser AND we can gate on plan.
    """
    if not ELEVEN_API_KEY:
        raise HTTPException(
            status_code=500,
            detail={"code": "eleven_unconfigured",
                    "message": "ELEVENLABS_API_KEY not set on server"},
        )

    url = f"{ELEVENLABS_API_BASE}/convai/conversation/token"
    headers = {"xi-api-key": ELEVEN_API_KEY}
    params = {"agent_id": agent_id}

    try:
        async with httpx.AsyncClient(timeout=SIGNED_URL_TIMEOUT) as client:
            r = await client.get(url, headers=headers, params=params)
    except httpx.HTTPError as exc:
        logger.warning("ElevenLabs token fetch failed: %s", exc)
        raise HTTPException(
            status_code=502,
            detail={"code": "eleven_upstream",
                    "message": "Could not reach ElevenLabs"},
        )

    if r.status_code != 200:
        logger.warning("ElevenLabs token %s: %s", r.status_code, r.text[:200])
        raise HTTPException(
            status_code=502,
            detail={"code": "eleven_upstream",
                    "message": f"ElevenLabs returned {r.status_code}"},
        )

    payload = r.json() if r.headers.get("content-type", "").startswith("application/json") else {}
    token = payload.get("token") or payload.get("conversation_token")
    if not token:
        raise HTTPException(
            status_code=502,
            detail={"code": "eleven_no_token",
                    "message": "ElevenLabs response missing token field"},
        )
    return token


async def _fetch_signed_url(agent_id: str) -> str:
    """Mint a short-lived WebSocket signed URL. Used as the WebRTC fallback
    when LiveKit /v1/validate 404s on the conversation_token (observed
    2026-04-29 — agent room spawn race in WebRTC path). The signed URL points
    at wss://api.elevenlabs.io/v1/convai/conversation and the agent reliably
    answers there."""
    if not ELEVEN_API_KEY:
        raise HTTPException(
            status_code=500,
            detail={"code": "eleven_unconfigured",
                    "message": "ELEVENLABS_API_KEY not set on server"},
        )

    url = f"{ELEVENLABS_API_BASE}/convai/conversation/get_signed_url"
    headers = {"xi-api-key": ELEVEN_API_KEY}
    params = {"agent_id": agent_id}

    try:
        async with httpx.AsyncClient(timeout=SIGNED_URL_TIMEOUT) as client:
            r = await client.get(url, headers=headers, params=params)
    except httpx.HTTPError as exc:
        logger.warning("ElevenLabs signed_url fetch failed: %s", exc)
        raise HTTPException(
            status_code=502,
            detail={"code": "eleven_upstream",
                    "message": "Could not reach ElevenLabs"},
        )

    if r.status_code != 200:
        logger.warning("ElevenLabs signed_url %s: %s", r.status_code, r.text[:200])
        raise HTTPException(
            status_code=502,
            detail={"code": "eleven_upstream",
                    "message": f"ElevenLabs returned {r.status_code}"},
        )

    payload = r.json() if r.headers.get("content-type", "").startswith("application/json") else {}
    signed_url = payload.get("signed_url")
    if not signed_url:
        raise HTTPException(
            status_code=502,
            detail={"code": "eleven_no_signed_url",
                    "message": "ElevenLabs response missing signed_url field"},
        )
    return signed_url


async def _fetch_conversation(conversation_id: str) -> Dict[str, Any]:
    if not ELEVEN_API_KEY:
        raise HTTPException(
            status_code=500,
            detail={"code": "eleven_unconfigured",
                    "message": "ELEVENLABS_API_KEY not set on server"},
        )

    url = f"{ELEVENLABS_API_BASE}/convai/conversations/{conversation_id}"
    headers = {"xi-api-key": ELEVEN_API_KEY}

    try:
        async with httpx.AsyncClient(timeout=TRANSCRIPT_TIMEOUT) as client:
            r = await client.get(url, headers=headers)
    except httpx.HTTPError as exc:
        logger.warning("ElevenLabs conversation fetch failed: %s", exc)
        raise HTTPException(
            status_code=502,
            detail={"code": "eleven_upstream",
                    "message": "Could not fetch conversation transcript"},
        )

    if r.status_code != 200:
        raise HTTPException(
            status_code=502,
            detail={"code": "eleven_upstream",
                    "message": f"ElevenLabs returned {r.status_code} on transcript fetch"},
        )
    return r.json()


async def _fetch_conversation_audio(conversation_id: str) -> Optional[bytes]:
    """Download the full call recording from ElevenLabs (server-side, reliable —
    no dependence on a flaky browser parallel recorder). Returns raw audio bytes
    (mp3) or None if unavailable."""
    if not ELEVEN_API_KEY:
        return None
    url = f"{ELEVENLABS_API_BASE}/convai/conversations/{conversation_id}/audio"
    headers = {"xi-api-key": ELEVEN_API_KEY}
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            r = await client.get(url, headers=headers)
    except httpx.HTTPError as exc:
        logger.warning("ElevenLabs conversation audio fetch failed: %s", exc)
        return None
    if r.status_code != 200 or not r.content:
        logger.warning("ElevenLabs audio fetch returned %s", r.status_code)
        return None
    return r.content


async def fetch_liz_conversation(conversation_id: str) -> Dict[str, Any]:
    """One-shot fetch for grading a Liz Live part: polled transcript + the call
    audio. Returns {transcript, turns, user_transcript, audio_bytes,
    total_secs}. audio_bytes may be None (then caller grades from transcript)."""
    payload = await _fetch_conversation_ready(conversation_id)
    transcript, turns = _flatten_transcript(payload)
    total_secs = float(
        (payload.get("metadata") or {}).get("call_duration_secs") or 0
    )
    audio_bytes = await _fetch_conversation_audio(conversation_id)
    return {
        "transcript": transcript,
        "turns": turns,
        "user_transcript": userTranscriptFromTurns(turns),
        "audio_bytes": audio_bytes,
        "total_secs": total_secs,
    }


def userTranscriptFromTurns(turns: List[Dict[str, Any]]) -> str:
    return " ".join(
        (t.get("message") or "").strip()
        for t in (turns or [])
        if t.get("role") == "user" and (t.get("message") or "").strip()
    )


def _has_user_turn(payload: Dict[str, Any]) -> bool:
    for t in (payload.get("transcript") or []):
        if t.get("role") == "user" and (t.get("message") or "").strip():
            return True
    return False


async def _fetch_conversation_ready(
    conversation_id: str, *, max_attempts: int = 8, delay: float = 1.5,
) -> Dict[str, Any]:
    """Poll the ElevenLabs conversation until the transcript is populated.

    The Conversation API needs a few seconds to process a just-ended call;
    fetching once returns an empty `transcript`, which left Liz Live with no
    audio AND no transcript to grade (dead-end to the part selector). Retry
    until user turns appear or the conversation reaches a terminal status."""
    payload: Dict[str, Any] = {}
    for attempt in range(max_attempts):
        payload = await _fetch_conversation(conversation_id)
        status = str(payload.get("status") or "").lower()
        if _has_user_turn(payload):
            return payload
        if status in {"done", "processed", "completed", "failed"}:
            # Terminal but still no user turns — nothing more to wait for.
            return payload
        if attempt < max_attempts - 1:
            await asyncio.sleep(delay)
    return payload


def _flatten_transcript(payload: Dict[str, Any]) -> tuple[str, List[Dict[str, Any]]]:
    """ElevenLabs Conversation API returns a `transcript` array of turns:
        { role: 'user' | 'agent', message: '...', time_in_call_secs: N, ... }
    Flatten to a plain text + lightly-shaped turns list for storage."""
    raw_turns = payload.get("transcript") or []
    turns: List[Dict[str, Any]] = []
    lines: List[str] = []
    for t in raw_turns:
        role = t.get("role") or "agent"
        text = (t.get("message") or "").strip()
        if not text:
            continue
        turns.append({
            "role": role,
            "message": text,
            "time_in_call_secs": t.get("time_in_call_secs"),
        })
        speaker = "Liz" if role == "agent" else "You"
        lines.append(f"{speaker}: {text}")
    return "\n".join(lines), turns


# ─── Endpoints ───────────────────────────────────────────────────────────────


@router.post("/token", response_model=TokenResponse)
async def mint_token(req: TokenRequest, caller: dict = Depends(auth_session.current_user)):
    """Server-side mint of a signed agent URL after quota validation."""
    auth_session.require_self_or_admin(req.user_id, caller)
    if db is None:
        raise HTTPException(
            status_code=503,
            detail={"code": "db_unavailable", "message": "DB not initialised"},
        )
    agent_id = ELEVEN_EXAM_AGENT_ID if req.kind == "exam" else ELEVEN_AGENT_ID
    if not agent_id:
        raise HTTPException(
            status_code=500,
            detail={"code": "agent_unconfigured",
                    "message": "ELEVENLABS agent id not set on server"},
        )

    user = await db.users.find_one({"id": req.user_id}, {"_id": 0})
    if not user:
        raise HTTPException(
            status_code=404,
            detail={"code": "user_not_found", "message": "User not found"},
        )

    grant = await resolve_liz_live_grant(db, user)
    is_exam = req.kind == "exam"
    if is_exam:
        # Full Mock is credit-gated (1 credit per mock), independent of plan.
        # Admins run free. We only CHECK here; the decrement happens below once a
        # working session token is secured, so a failed mint costs nothing.
        if not grant.is_admin and int(user.get("mockCredits") or 0) < 1:
            raise HTTPException(
                status_code=402,
                detail={
                    "code": "no_mock_credits",
                    "message": "You need a Full Mock Test credit to start. Each mock is one $3 credit.",
                    "mock_credits": int(user.get("mockCredits") or 0),
                },
            )
    elif not grant.allowed:
        raise HTTPException(
            status_code=402,
            detail={
                "code": "liz_live_locked",
                "message": grant.message
                    or "Live conversation with Liz is not available on your plan.",
                "quota": _quota_payload(grant),
            },
        )

    # WebSocket is the primary path: the WebRTC token mint succeeds upstream
    # but LiveKit /v1/validate returns 404 (agent room not spawned in time).
    # signed_url → wss://api.elevenlabs.io/v1/convai/conversation answers
    # reliably. We still mint a conversation_token for clients that prefer
    # WebRTC and can tolerate the validate 404 race.
    signed_url = await _fetch_signed_url(agent_id)
    conversation_token = ""
    try:
        conversation_token = await _fetch_conversation_token(agent_id)
    except HTTPException as exc:
        # Token mint is best-effort now; WS path is what the SDK uses.
        logger.info("conversation_token mint skipped: %s", exc.detail)
    dynamic_vars = _build_dynamic_variables(user, req)

    # Charge the mock credit now that we have a working session token. The
    # atomic guard (mockCredits >= 1) re-checks the balance to avoid a race or
    # double-spend between the early check and here.
    if is_exam and not grant.is_admin:
        deducted = await db.users.find_one_and_update(
            {"id": req.user_id, "mockCredits": {"$gte": 1}},
            {"$inc": {"mockCredits": -1}},
        )
        if not deducted:
            raise HTTPException(
                status_code=402,
                detail={
                    "code": "no_mock_credits",
                    "message": "You need a Full Mock Test credit to start. Each mock is one $3 credit.",
                    "mock_credits": 0,
                },
            )

    return TokenResponse(
        conversation_token=conversation_token,
        signed_url=signed_url,
        connection_type="websocket",
        agent_id=agent_id,
        conversation_dynamic_variables=dynamic_vars,
        quota=_quota_payload(grant),
    )


@router.post("/finalize", response_model=FinalizeResponse)
async def finalize_conversation(req: FinalizeRequest, caller: dict = Depends(auth_session.current_user)):
    """Post-fetch the transcript and deduct quota. Idempotent on
    conversation_id — repeated calls don't double-deduct."""
    auth_session.require_self_or_admin(req.user_id, caller)
    if db is None:
        raise HTTPException(
            status_code=503,
            detail={"code": "db_unavailable", "message": "DB not initialised"},
        )

    user = await db.users.find_one({"id": req.user_id}, {"_id": 0})
    if not user:
        raise HTTPException(
            status_code=404,
            detail={"code": "user_not_found", "message": "User not found"},
        )

    # Idempotency: if we've already finalized this conversation, return the
    # cached row instead of re-fetching + re-deducting.
    existing = await db.liz_live_sessions.find_one(
        {"conversation_id": req.conversation_id},
        {"_id": 0},
    )
    if existing:
        grant = await resolve_liz_live_grant(db, user)
        return FinalizeResponse(
            transcript=existing.get("transcript", ""),
            transcript_turns=existing.get("transcript_turns", []),
            part2_theme=existing.get("part2_theme"),
            quota=_quota_payload(grant),
        )

    payload = await _fetch_conversation_ready(req.conversation_id)
    transcript, turns = _flatten_transcript(payload)

    # ElevenLabs reports duration server-side; trust it over the client clock.
    duration_secs = int(
        (payload.get("metadata") or {}).get("call_duration_secs")
        or req.elapsed_seconds
        or 0
    )

    new_remaining = await deduct_liz_live_seconds(db, user, duration_secs)

    # Persist the session row. Part 2 conversations populate part2_theme so a
    # follow-up Part 3 session can ask connected questions.
    part2_theme = None
    if req.part == "part2" and turns:
        # Use the first user turn as a coarse theme proxy (cheap heuristic;
        # avoids an LLM call). The frontend can still override by passing an
        # explicit part2_theme in /token next session.
        first_user = next((t["message"] for t in turns if t["role"] == "user"), "")
        part2_theme = first_user[:240]

    await db.liz_live_sessions.insert_one({
        "_id": req.conversation_id,
        "conversation_id": req.conversation_id,
        "user_id": req.user_id,
        "part": req.part,
        "duration_secs": duration_secs,
        "transcript": transcript,
        "transcript_turns": turns,
        "part2_theme": part2_theme,
        "created_at": datetime.now(timezone.utc),
    })

    # Mirror to test_attempts so Progress page + Liz tutor see this session.
    try:
        from server import persist_attempt
        await persist_attempt(
            user_id=req.user_id,
            test_id=req.conversation_id,
            test_type="speaking",
            time_taken=duration_secs,
            feedback={
                "source": "liz_live",
                "part": req.part,
                "duration_secs": duration_secs,
                "turns_count": len(turns),
                "part2_theme": part2_theme,
                "transcript_preview": transcript[:600],
            },
        )
    except Exception as exc:
        logger.warning("persist_attempt mirror skipped (liz_live finalize): %s", exc)

    grant_after = await resolve_liz_live_grant(db, user)
    # Override remaining with the freshly deducted value to avoid a stale
    # read between deduct + resolve.
    grant_after.seconds_remaining = new_remaining

    return FinalizeResponse(
        transcript=transcript,
        transcript_turns=turns,
        part2_theme=part2_theme,
        quota=_quota_payload(grant_after),
    )


async def init_indexes() -> None:
    if db is None:
        return
    try:
        await db.liz_live_sessions.create_index("conversation_id", unique=True)
        await db.liz_live_sessions.create_index([("user_id", 1), ("created_at", -1)])
    except Exception as exc:
        logger.warning("liz_live_sessions index init failed: %s", exc)
