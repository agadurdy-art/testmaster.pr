"""
Generic speech TTS helper endpoint.
===================================
Single job: `/speech/tts` — generate base64 MP3 for arbitrary text via the
OpenAI-compatible TTS shim. Used by BeginnerCourse, MasteryCourse and
PracticeMode (Quick Practice). Previously mounted under `/vocab-grammar/tts`;
renamed 2026-04-23 when the old band-tiered Vocab/Grammar course was retired.

Extracted verbatim from server.py (Faz 1 refactor, 2026-07-02). Stateless.
"""

import logging
import os

from fastapi import APIRouter, HTTPException

router = APIRouter()


@router.post("/speech/tts")
async def text_to_speech(request: dict):
    """Generate TTS audio for pronunciation"""
    text = request.get("text", "")
    if not text:
        raise HTTPException(status_code=400, detail="Text is required")

    try:
        from services.openai_compat import OpenAITextToSpeech
        tts = OpenAITextToSpeech(api_key=os.getenv("OPENAI_API_KEY") or os.getenv("EMERGENT_LLM_KEY"))
        # Use generate_speech_base64 for direct base64 output
        audio_base64 = await tts.generate_speech_base64(
            text=text,
            voice="alloy",
            model="tts-1"
        )
        return {"audio": audio_base64, "format": "mp3"}
    except Exception as e:
        logging.getLogger(__name__).error(f"TTS error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate audio")
