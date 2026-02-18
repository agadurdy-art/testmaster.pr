"""Speech evaluation endpoint - records audio, transcribes with Whisper, evaluates."""

import os
import tempfile
from fastapi import APIRouter, UploadFile, File, Form
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/api/speech", tags=["speech"])


def compute_similarity(transcription: str, expected: str) -> dict:
    """Simple word-level similarity scoring for young learners."""
    t_words = set(transcription.lower().strip().split())
    e_words = set(expected.lower().strip().split())

    if not e_words:
        return {"score": 100, "matched_words": [], "missing_words": []}

    matched = t_words & e_words
    missing = e_words - t_words
    score = int((len(matched) / len(e_words)) * 100) if e_words else 0

    return {
        "score": min(score, 100),
        "matched_words": sorted(matched),
        "missing_words": sorted(missing),
    }


@router.post("/evaluate")
async def evaluate_speech(
    audio: UploadFile = File(...),
    expected_text: str = Form(""),
    prompt_text: str = Form(""),
):
    """Transcribe audio with Whisper and evaluate against expected text."""
    from emergentintegrations.llm.openai import OpenAISpeechToText

    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        return {"error": "EMERGENT_LLM_KEY not configured", "transcription": "", "score": 0}

    # Save uploaded audio to temp file
    suffix = ".webm"
    if audio.content_type and "wav" in audio.content_type:
        suffix = ".wav"
    elif audio.content_type and "mp3" in audio.content_type:
        suffix = ".mp3"

    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    try:
        content = await audio.read()
        tmp.write(content)
        tmp.flush()
        tmp.close()

        stt = OpenAISpeechToText(api_key=api_key)

        with open(tmp.name, "rb") as f:
            response = await stt.transcribe(
                file=f,
                model="whisper-1",
                language="en",
                response_format="json",
                prompt=prompt_text or expected_text or "Young English learner speaking practice.",
            )

        transcription = response.text.strip() if response and response.text else ""
        similarity = compute_similarity(transcription, expected_text)

        return {
            "transcription": transcription,
            "expected_text": expected_text,
            "score": similarity["score"],
            "matched_words": similarity["matched_words"],
            "missing_words": similarity["missing_words"],
        }

    except Exception as e:
        return {
            "error": str(e),
            "transcription": "",
            "score": 0,
            "matched_words": [],
            "missing_words": [],
        }
    finally:
        os.unlink(tmp.name)
