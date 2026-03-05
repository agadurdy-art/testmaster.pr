"""
Pronunciation Check API - Uses OpenAI Whisper for speech-to-text
"""
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from emergentintegrations.llm.openai import OpenAISpeechToText
import os
import tempfile
import logging
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/unified/pronunciation", tags=["Pronunciation"])

stt = OpenAISpeechToText(api_key=os.environ.get("EMERGENT_LLM_KEY"))


@router.post("/check")
async def check_pronunciation(
    audio: UploadFile = File(...),
    target_word: str = Form(...),
    target_sentence: str = Form(default="")
):
    """Check pronunciation by transcribing audio and comparing to target"""
    try:
        suffix = ".webm"
        if audio.content_type:
            ext_map = {"audio/webm": ".webm", "audio/wav": ".wav", "audio/mp3": ".mp3", "audio/mpeg": ".mp3", "audio/ogg": ".ogg"}
            suffix = ext_map.get(audio.content_type, ".webm")

        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
            content = await audio.read()
            if len(content) < 100:
                raise HTTPException(status_code=400, detail="Audio too short")
            tmp.write(content)
            tmp_path = tmp.name

        try:
            with open(tmp_path, "rb") as audio_file:
                response = await stt.transcribe(
                    file=audio_file,
                    model="whisper-1",
                    response_format="json",
                    language="en",
                    temperature=0.0,
                    prompt=f"The speaker is practicing English pronunciation of the word: {target_word}"
                )
            transcribed = response.text.strip().lower().rstrip('.')
        finally:
            os.unlink(tmp_path)

        target = target_word.strip().lower()
        target_sent = target_sentence.strip().lower() if target_sentence else ""

        word_match = target in transcribed or transcribed in target
        sent_match = target_sent and (target_sent in transcribed or transcribed in target_sent)

        from difflib import SequenceMatcher
        word_ratio = SequenceMatcher(None, target, transcribed).ratio()
        is_correct = word_match or word_ratio >= 0.7 or sent_match

        return {
            "transcribed_text": response.text.strip(),
            "target_word": target_word,
            "is_correct": is_correct,
            "similarity_score": round(word_ratio * 100),
            "feedback": "Excellent pronunciation!" if word_ratio >= 0.9 else
                       "Good job!" if is_correct else
                       f"Try again. You said: \"{response.text.strip()}\""
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Pronunciation check error: {e}")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")
