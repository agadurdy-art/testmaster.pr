"""
Speaking misc routes — simple transcription + static question bank.

Moved verbatim out of server.py (2026-07-02 refactor, zero behavior change):

    POST /api/transcribe-audio            (was server.py transcribe_audio_simple)
    GET  /api/speaking/questions/{part}   (was server.py get_speaking_questions)

The router carries NO prefix — paths are declared in full so they stay exactly
/api/transcribe-audio and /api/speaking/questions/{part} (server.py's own
api_router uses prefix="/api"; this module keeps the same effective paths).
server.py injects its module globals via set_db / set_stt, mirroring the
routes/speaking_unified.py pattern.
"""
from __future__ import annotations

import io
import logging
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile

import auth_session

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Speaking Misc"])

# Module-level handles; populated by server.py on startup via set_db/set_stt.
db = None
stt = None


def set_db(database) -> None:
    global db
    db = database


def set_stt(stt_client) -> None:
    global stt
    stt = stt_client


# Speaking test with AI - simple transcribe endpoint
@router.post("/api/transcribe-audio")
async def transcribe_audio_simple(
    request: Request,
    file: UploadFile = File(...),
    caller: Optional[dict] = Depends(auth_session.current_user_optional),
):
    """Simple transcription endpoint for beginner course and other uses.

    Faz 0 (2026-07-02): this hits Whisper (paid) but must stay reachable from
    public surfaces (level tests, course previews). Logged-in users pass via
    their session token (attached by the frontend fetch wrapper); anonymous
    callers are capped per IP per day instead of being blocked outright.
    """
    if caller is None:
        from routes.speaking_unified import _client_ip
        from security_utils import enforce_anon_daily_limit

        await enforce_anon_daily_limit(
            db, scope="transcribe_audio", ip=_client_ip(request), limit=20
        )
    try:
        # Read audio file
        audio_data = await file.read()

        # Log audio size for debugging
        logger.info(f"Transcribing audio: {len(audio_data)} bytes ({len(audio_data)/1024/1024:.2f} MB)")

        if len(audio_data) < 1000:
            raise HTTPException(status_code=400, detail="Audio file too small")

        audio_file = io.BytesIO(audio_data)
        audio_file.name = file.filename or "audio.webm"

        # First, transcribe with auto-detection to check the language
        response = await stt.transcribe(
            file=audio_file,
            model="whisper-1",
            response_format="verbose_json"  # This includes language detection
        )

        transcribed_text = response.text.strip()
        detected_language = getattr(response, 'language', 'en')

        logger.info(f"Transcription result: {len(transcribed_text)} chars, detected language: {detected_language}")

        # Check if the detected language is English
        if detected_language and detected_language.lower() not in ['en', 'english']:
            logger.warning(f"Non-English speech detected: {detected_language}")
            raise HTTPException(
                status_code=400,
                detail=f"Please speak in English only. Detected language: {detected_language}. This is an English proficiency test."
            )

        if len(transcribed_text) < 5:
            raise HTTPException(status_code=400, detail="Could not transcribe audio clearly. Please speak louder.")

        return {"text": transcribed_text, "language": detected_language}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Transcription error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/speaking/questions/{part}")
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
