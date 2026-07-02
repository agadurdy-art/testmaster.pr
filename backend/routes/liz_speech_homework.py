"""
Liz Teacher — TTS/STT + homework endpoints.

Single job: the audio pipeline (/tts via liz_tts, /stt via OpenAI
Whisper) and the homework lifecycle endpoints (list, assign, submit
with auto-review, delete).

Extracted from routes/liz_teacher.py (Faz 1 refactor, 2026-07-02).
`db` is injected via routes/liz_teacher.py (server.py sets
`liz_teacher.db = db`, which fans out to every liz_* module).
"""
import os
import re
import uuid
import tempfile
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import HTTPException, UploadFile, File, Form, Depends
import auth_session  # audit F-02: session ownership on Liz user-scoped routes
from pydantic import BaseModel

from services import liz_llm, liz_tts
from routes.liz_access import router

db = None
logger = logging.getLogger(__name__)


class TTSRequest(BaseModel):
    text: str
    email: Optional[str] = None  # soft-auth gate (pre-launch audit 2026-05-16)


class HomeworkSubmitRequest(BaseModel):
    user_id: str
    submission: str


class HomeworkAssignRequest(BaseModel):
    user_id: str
    hw_type: str = "vocabulary"
    title: str = ""
    task: str = ""
    due_days: int = 2


@router.post("/tts")
async def liz_speak(req: TTSRequest):
    """Convert Liz's response to speech (Azure SoniaNeural primary, OpenAI fallback)."""
    from security_utils import require_known_user
    await require_known_user(req.email)
    if not req.text:
        raise HTTPException(status_code=400, detail="No text provided")

    result = await liz_tts.synthesize(req.text)
    if not result["audio"]:
        raise HTTPException(status_code=503, detail="TTS provider not configured")
    return {"audio": result["audio"], "format": result["format"], "provider": result["provider"]}


@router.post("/stt")
async def speech_to_text(
    file: UploadFile = File(...),
    email: Optional[str] = Form(default=None),
):
    """Transcribe audio from the student's microphone."""
    from security_utils import require_known_user
    await require_known_user(email)
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="STT API key not configured")

    try:
        from services.openai_compat import OpenAISpeechToText
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
async def get_homework(user_id: str, status: Optional[str] = None, caller: dict = Depends(auth_session.current_user)):
    auth_session.require_self_or_admin(user_id, caller)
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
async def submit_homework(homework_id: str, req: HomeworkSubmitRequest, caller: dict = Depends(auth_session.current_user)):
    auth_session.require_self_or_admin(req.user_id, caller)
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

    # Auto-review with Liz (deep model)
    feedback = ""
    score = None
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

        feedback = await liz_llm.complete(
            system="You are Liz, a professional IELTS teacher reviewing a student's homework. Be specific and constructive.",
            user_message=review_prompt,
            session_id=f"liz_review_{homework_id}",
            task="homework_review",
            max_tokens=1200,
        )

        # Try to extract score
        score_match = re.search(r'(\d+)\s*(?:/|out of)\s*10', feedback)
        if score_match:
            score = float(score_match.group(1))
    except Exception:
        logger.exception("Homework auto-review failed")
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
async def delete_homework(homework_id: str, user_id: str, caller: dict = Depends(auth_session.current_user)):
    auth_session.require_self_or_admin(user_id, caller)
    """Remove a homework assignment."""
    result = await db.liz_homework.delete_one(
        {"homework_id": homework_id, "user_id": user_id}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Homework not found")
    return {"success": True}
