"""
FastAPI routes for the quick onboarding assessment.

Endpoints:
- GET  /api/quick-assessment/start        → session_id + Stage 1 content
- POST /api/quick-assessment/stage1       → evaluate Stage 1, return Stage 2 content
- POST /api/quick-assessment/stage2       → evaluate Stage 2, return writing + speaking prompts
- POST /api/quick-assessment/writing      → score writing micro-task
- POST /api/quick-assessment/speaking     → score speaking prompt response (one per call)
- POST /api/quick-assessment/finalise     → aggregate band + comparisons + milestones

Persistence: every step appends to `quickAssessmentRuns` collection
(anonymous, keyed by session_id UUID). On user signup, the dashboard
flow attaches the most recent unattached run to the user.

NO LLM calls anywhere in this router. Sonnet / Azure live behind the paid
plan, not here.
"""
from __future__ import annotations
import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from .content.reading_passages import READING_PASSAGES, get_passage as get_reading_passage
from .content.listening_clips import LISTENING_CLIPS, get_clip as get_listening_clip
from .content.writing_prompts import get_prompt as get_writing_prompt
from .content.speaking_prompts import get_prompt as get_speaking_prompt
from .adaptive import pick_stage2_difficulty, pick_writing_prompt, pick_speaking_prompts
from .scoring import (
    score_reading_raw,
    score_listening_raw,
    score_writing_heuristic,
    score_speaking_heuristic,
    aggregate_band,
)
from .benchmarks import compare_to_cambridge, exam_date_milestones

# Optional Mongo persistence — falls back to in-memory if motor isn't
# importable (e.g. running scoring tests offline).
try:
    from motor.motor_asyncio import AsyncIOMotorClient
    import os
    _MONGO_URL = os.environ.get("MONGO_URL") or os.environ.get("DATABASE_URL")
    # Audit NEW-6: the rest of the app uses DB_NAME. Using MONGO_DB_NAME (unset
    # in prod) wrote quick-assessment runs to a SEPARATE "testmaster" DB, invisible
    # to the app/admin. Prefer the canonical DB_NAME.
    _MONGO_DB = os.environ.get("DB_NAME") or os.environ.get("MONGO_DB_NAME", "testmaster")
    _client = AsyncIOMotorClient(_MONGO_URL) if _MONGO_URL else None
    _COLLECTION = _client[_MONGO_DB]["quickAssessmentRuns"] if _client else None
except Exception:
    _COLLECTION = None


router = APIRouter(prefix="/api/quick-assessment", tags=["quick-assessment"])


# ── Pydantic models ───────────────────────────────────────────────────

class StartPayload(BaseModel):
    exam_date: Optional[str] = None  # ISO date, optional intro field
    target_band: Optional[float] = None
    locale: Optional[str] = "en"


class StageAnswers(BaseModel):
    session_id: str
    reading_answers: dict = Field(default_factory=dict)   # {qid: chosen_key or text}
    listening_answers: dict = Field(default_factory=dict)


class WritingSubmit(BaseModel):
    session_id: str
    prompt_id: str
    text: str
    elapsed_sec: Optional[float] = None


class SpeakingSubmit(BaseModel):
    session_id: str
    prompt_id: str
    transcript: str
    duration_sec: float


class FinalisePayload(BaseModel):
    session_id: str


# ── In-memory session store ───────────────────────────────────────────
# Production should persist to Mongo (`quickAssessmentRuns` collection).
# Day 1 ships an in-memory dict for the scoring smoke test; Day 4 wires
# Mongo for guest-→signup attachment.

_SESSIONS: dict[str, dict] = {}


async def _persist(session: dict) -> None:
    """Mirror in-memory session to Mongo for guest→signup attach."""
    if _COLLECTION is None:
        return
    try:
        await _COLLECTION.update_one(
            {"session_id": session["session_id"]},
            {"$set": session},
            upsert=True,
        )
    except Exception:
        # Non-fatal — in-memory copy still serves the active request
        pass


async def attach_to_user(session_id: str, user_id: str) -> Optional[dict]:
    """Called from the signup flow once the user is created — links the
    anonymous test run to their account."""
    if _COLLECTION is None:
        return _SESSIONS.get(session_id)
    try:
        doc = await _COLLECTION.find_one_and_update(
            {"session_id": session_id, "user_id": {"$exists": False}},
            {"$set": {"user_id": user_id, "attached_at": datetime.now(timezone.utc).isoformat()}},
            return_document=True,
        )
        return doc
    except Exception:
        return None


def _new_session(exam_date: Optional[str], target_band: Optional[float]) -> dict:
    sid = str(uuid.uuid4())
    session = {
        "session_id": sid,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "exam_date": exam_date,
        "target_band": target_band,
        "stage1": {
            "passage_id": "R_B2_OCTOPUS",   # B2 anchor
            "clip_id": "L_S1_LANG_EXCHANGE",  # B1 anchor
            "score": None,
        },
        "stage2": None,
        "writing": None,
        "speaking": [],
        "final": None,
    }
    _SESSIONS[sid] = session
    return session


# ── Helpers ───────────────────────────────────────────────────────────

def _public_passage(passage: dict) -> dict:
    """Strip answer keys + rationale from a passage before sending to client."""
    if not passage:
        return None
    return {
        "id": passage["id"],
        "level": passage["level"],
        "title": passage["title"],
        "body": passage["body"],
        "questions": [_public_question(q) for q in passage["questions"]],
    }


def _public_clip(clip: dict) -> dict:
    if not clip:
        return None
    return {
        "id": clip["id"],
        "level": clip["level"],
        "section": clip["section"],
        "audio_url": clip.get("audio_url"),
        "duration_estimate_sec": clip.get("duration_estimate_sec"),
        "questions": [_public_question(q) for q in clip["questions"]],
    }


def _public_question(q: dict) -> dict:
    """Public question shape — strip the `correct` flag + rationale."""
    payload = {
        "qid": q["qid"],
        "type": q["type"],
        "skill_tag": q.get("skill_tag"),
        "stem": q["stem"],
    }
    if q["type"] == "mcq":
        payload["options"] = [
            {"key": o["key"], "text": o["text"]} for o in q["options"]
        ]
    return payload


def _grade_mcq(question: dict, answer_key: str) -> bool:
    for o in question.get("options", []):
        if o.get("correct"):
            return o["key"] == answer_key
    return False


def _grade_tfng(question: dict, answer_text: str) -> bool:
    expected = (question.get("answer") or "").strip().upper()
    given = (answer_text or "").strip().upper()
    # Accept common variants
    if expected == "NOT GIVEN":
        return given in {"NOT GIVEN", "NOTGIVEN", "NG", "NOT_GIVEN"}
    return expected == given


def _grade_fill(question: dict, answer_text: str) -> bool:
    given = (answer_text or "").strip().lower()
    if not given:
        return False
    main = (question.get("answer_text") or "").strip().lower()
    if given == main:
        return True
    for v in question.get("answer_variants", []):
        if given == v.strip().lower():
            return True
    return False


def _grade_questions(questions: list[dict], answers: dict) -> tuple[int, list[dict]]:
    """Returns (correct_count, per-question results)."""
    correct = 0
    results = []
    for q in questions:
        ans = answers.get(q["qid"])
        if q["type"] == "mcq":
            ok = _grade_mcq(q, ans)
        elif q["type"] == "tfng":
            ok = _grade_tfng(q, ans)
        elif q["type"] == "fill":
            ok = _grade_fill(q, ans)
        else:
            ok = False
        if ok:
            correct += 1
        results.append({"qid": q["qid"], "correct": ok})
    return correct, results


# ── Endpoints ─────────────────────────────────────────────────────────

@router.post("/start")
async def start_assessment(payload: StartPayload):
    session = _new_session(payload.exam_date, payload.target_band)
    await _persist(session)
    return {
        "session_id": session["session_id"],
        "exam_date": session["exam_date"],
        "target_band": session["target_band"],
        "stage": "stage1",
        "passage": _public_passage(get_reading_passage(session["stage1"]["passage_id"])),
        "clip": _public_clip(get_listening_clip(session["stage1"]["clip_id"])),
        "estimated_minutes": 5,
    }


@router.post("/stage1")
async def submit_stage1(payload: StageAnswers):
    session = _SESSIONS.get(payload.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    passage = get_reading_passage(session["stage1"]["passage_id"])
    clip = get_listening_clip(session["stage1"]["clip_id"])

    r_correct, r_results = _grade_questions(passage["questions"], payload.reading_answers)
    l_correct, l_results = _grade_questions(clip["questions"], payload.listening_answers)

    # Stage 1 is 2 reading + 2 listening = 4 items. Cap correctness ≤4
    # because the source passage may have more questions than the test
    # actually displayed (we surface only first 2 per skill in Stage 1).
    s1_correct = min(r_correct, 2) + min(l_correct, 2)

    session["stage1"]["score"] = {
        "reading_correct": r_correct,
        "listening_correct": l_correct,
        "total": s1_correct,
        "results": r_results + l_results,
    }

    # Pick Stage 2 difficulty
    s2_pick = pick_stage2_difficulty(s1_correct)
    session["stage2"] = {
        "level": s2_pick["level"],
        "passage_id": s2_pick["passage_id"],
        "clip_id": s2_pick["clip_id"],
        "score": None,
    }
    await _persist(session)

    # Partial reveal: rough band from Stage 1 alone
    partial_reading = score_reading_raw(min(r_correct, 2), 2)
    partial_listening = score_listening_raw(min(l_correct, 2), 2)

    return {
        "session_id": payload.session_id,
        "stage": "stage2",
        "partial": {
            "reading": partial_reading,
            "listening": partial_listening,
            "label": s2_pick["level_label"],
        },
        "passage": _public_passage(get_reading_passage(s2_pick["passage_id"])),
        "clip": _public_clip(get_listening_clip(s2_pick["clip_id"])),
        "estimated_minutes": 5,
    }


@router.post("/stage2")
async def submit_stage2(payload: StageAnswers):
    session = _SESSIONS.get(payload.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if not session.get("stage2"):
        raise HTTPException(status_code=400, detail="Stage 1 not completed")

    passage = get_reading_passage(session["stage2"]["passage_id"])
    clip = get_listening_clip(session["stage2"]["clip_id"])

    r_correct, r_results = _grade_questions(passage["questions"], payload.reading_answers)
    l_correct, l_results = _grade_questions(clip["questions"], payload.listening_answers)

    s2_correct = min(r_correct, 2) + min(l_correct, 2)
    session["stage2"]["score"] = {
        "reading_correct": r_correct,
        "listening_correct": l_correct,
        "total": s2_correct,
        "results": r_results + l_results,
    }

    # Combined reading + listening
    s1 = session["stage1"]["score"]
    total_correct = s1["total"] + s2_correct

    # Skill-level bands scored on the ACTUAL number of questions the candidate
    # answered across both stages (not the old min-2-per-stage cap, which made the
    # band jump 2 steps per wrong answer — e.g. 3/4 listening dropped to band 7).
    # All questions in each passage/clip are shown to the candidate, so we count
    # them all and project onto Cambridge's 40-question table for fine granularity.
    s1_passage = get_reading_passage(session["stage1"]["passage_id"])
    s1_clip = get_listening_clip(session["stage1"]["clip_id"])
    total_reading_q = len(s1_passage["questions"]) + len(passage["questions"])
    total_listening_q = len(s1_clip["questions"]) + len(clip["questions"])
    reading_band = score_reading_raw(
        s1["reading_correct"] + r_correct, max(total_reading_q, 1)
    )
    listening_band = score_listening_raw(
        s1["listening_correct"] + l_correct, max(total_listening_q, 1)
    )

    session["reading_band"] = reading_band
    session["listening_band"] = listening_band
    await _persist(session)

    writing_prompt = pick_writing_prompt(total_correct, 8)
    speaking_ids = pick_speaking_prompts(total_correct, 8)

    return {
        "session_id": payload.session_id,
        "stage": "productive",
        "partial": {
            "reading": reading_band,
            "listening": listening_band,
        },
        "writing_prompt": writing_prompt,
        "speaking_prompts": [get_speaking_prompt(pid) for pid in speaking_ids],
        "estimated_minutes": 8,
    }


@router.post("/writing")
async def submit_writing(payload: WritingSubmit):
    session = _SESSIONS.get(payload.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    prompt = get_writing_prompt(payload.prompt_id)
    target = prompt.get("expected_words", (60, 100)) if prompt else (60, 100)
    result = score_writing_heuristic(payload.text, target_words=target)
    session["writing"] = {
        "prompt_id": payload.prompt_id,
        "text": payload.text,
        "elapsed_sec": payload.elapsed_sec,
        **result,
    }
    await _persist(session)
    return {"session_id": payload.session_id, "band": result["band"]}


@router.post("/speaking")
async def submit_speaking(payload: SpeakingSubmit):
    session = _SESSIONS.get(payload.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    result = score_speaking_heuristic(payload.transcript, payload.duration_sec)
    session["speaking"].append({
        "prompt_id": payload.prompt_id,
        "transcript": payload.transcript,
        "duration_sec": payload.duration_sec,
        **result,
    })
    await _persist(session)
    return {"session_id": payload.session_id, "band": result["band"]}


@router.post("/finalise")
async def finalise(payload: FinalisePayload):
    session = _SESSIONS.get(payload.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    reading = session.get("reading_band")
    listening = session.get("listening_band")
    writing_block = session.get("writing") or {}
    speaking_blocks = session.get("speaking") or []
    writing = writing_block.get("band")
    speaking = (
        sum(s.get("band", 0) for s in speaking_blocks) / len(speaking_blocks)
        if speaking_blocks else None
    )

    overall = aggregate_band(reading, listening, writing, speaking)

    # Build the WOW comparisons + milestones
    writing_comparisons = (
        compare_to_cambridge(writing, writing_block.get("metrics", {}), "writing")
        if writing else []
    )
    speaking_comparisons: list[dict] = []
    if speaking_blocks and speaking is not None:
        # Use first prompt metrics (most representative — Part 1 personal)
        speaking_comparisons = compare_to_cambridge(
            speaking, speaking_blocks[0].get("metrics", {}), "speaking"
        )

    target_band = session.get("target_band") or (overall["band"] + 1.0 if overall["band"] else 6.5)
    milestones = exam_date_milestones(
        overall["band"], target_band, session.get("exam_date")
    )

    session["final"] = {
        "completed_at": datetime.now(timezone.utc).isoformat(),
        "overall": overall,
        "skills": {
            "reading": reading,
            "listening": listening,
            "writing": writing,
            "speaking": speaking,
        },
        "writing_strengths": writing_block.get("strengths", []),
        "writing_weaknesses": writing_block.get("weaknesses", []),
        "speaking_strengths": [
            s for sb in speaking_blocks for s in sb.get("strengths", [])
        ],
        "speaking_weaknesses": [
            w for sb in speaking_blocks for w in sb.get("weaknesses", [])
        ],
        "comparisons": writing_comparisons + speaking_comparisons,
        "milestones": milestones,
        "target_band": target_band,
    }
    await _persist(session)

    return session["final"]


@router.get("/session/{session_id}")
async def get_session(session_id: str):
    session = _SESSIONS.get(session_id)
    if not session:
        if _COLLECTION is None:
            raise HTTPException(status_code=404, detail="Session not found")
        # Fall back to Mongo for guests who refreshed
        doc = await _COLLECTION.find_one({"session_id": session_id})
        if not doc:
            raise HTTPException(status_code=404, detail="Session not found")
        return doc
    return session


class AttachPayload(BaseModel):
    session_id: str
    user_id: str


@router.post("/attach")
async def attach_session(payload: AttachPayload):
    """Called from the signup flow once a fresh user is created — links
    the most recent anonymous test run to their account so the new user's
    first dashboard load can show 'Your quick assessment is saved on your
    profile.'"""
    result = await attach_to_user(payload.session_id, payload.user_id)
    if not result:
        # Mongo unavailable or session not found — still acknowledge so the
        # signup flow doesn't error.
        return {"attached": False}
    return {"attached": True, "session_id": payload.session_id}
