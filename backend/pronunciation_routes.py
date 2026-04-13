"""
Pronunciation Check API
- /check  : OpenAI Whisper word-match (existing)
- /assess : Azure Pronunciation Assessment — AccuracyScore, FluencyScore, ProsodyScore
"""
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from emergentintegrations.llm.openai import OpenAISpeechToText
import os
import tempfile
import asyncio
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


@router.post("/assess")
async def azure_pronunciation_assess(
    audio: UploadFile = File(...),
    reference_text: str = Form(...)
):
    """
    Azure Pronunciation Assessment — returns AccuracyScore, FluencyScore,
    ProsodyScore, CompletenessScore and per-word details.
    Audio: WebM/WAV from browser. Converted to WAV via pydub before Azure SDK.
    """
    azure_key = os.getenv("AZURE_SPEECH_KEY")
    azure_region = os.getenv("AZURE_SPEECH_REGION", "southeastasia")
    if not azure_key:
        raise HTTPException(status_code=500, detail="Azure Speech key not configured")

    content = await audio.read()
    if len(content) < 200:
        raise HTTPException(status_code=400, detail="Audio too short")

    # Detect input format
    suffix = ".webm"
    if audio.content_type:
        ext_map = {"audio/webm": ".webm", "audio/wav": ".wav", "audio/ogg": ".ogg", "audio/mp4": ".mp4"}
        suffix = ext_map.get(audio.content_type, ".webm")

    def _assess():
        import azure.cognitiveservices.speech as speechsdk
        from pydub import AudioSegment
        import io

        # Write original audio to temp file
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
            tmp.write(content)
            src_path = tmp.name

        wav_path = src_path + ".wav"
        try:
            # Convert to WAV (PCM 16kHz mono) — Azure SDK requirement
            seg = AudioSegment.from_file(src_path)
            seg = seg.set_frame_rate(16000).set_channels(1).set_sample_width(2)
            seg.export(wav_path, format="wav")

            speech_config = speechsdk.SpeechConfig(subscription=azure_key, region=azure_region)
            speech_config.speech_recognition_language = "en-US"
            audio_config = speechsdk.AudioConfig(filename=wav_path)

            pronunciation_config = speechsdk.PronunciationAssessmentConfig(
                reference_text=reference_text,
                grading_system=speechsdk.PronunciationAssessmentGradingSystem.HundredMark,
                granularity=speechsdk.PronunciationAssessmentGranularity.Word,
                enable_miscue=True
            )

            recognizer = speechsdk.SpeechRecognizer(
                speech_config=speech_config,
                audio_config=audio_config
            )
            pronunciation_config.apply_to(recognizer)

            result = recognizer.recognize_once()

            if result.reason == speechsdk.ResultReason.RecognizedSpeech:
                pa_result = speechsdk.PronunciationAssessmentResult(result)
                # Word-level scores
                word_scores = []
                for word in pa_result.words:
                    word_scores.append({
                        "word": word.word,
                        "accuracy_score": round(word.accuracy_score),
                        "error_type": word.error_type  # None / Omission / Insertion / Mispronunciation
                    })
                return {
                    "success": True,
                    "recognized_text": result.text,
                    "accuracy_score": round(pa_result.accuracy_score),
                    "fluency_score": round(pa_result.fluency_score),
                    "completeness_score": round(pa_result.completeness_score),
                    "prosody_score": round(pa_result.prosody_score) if hasattr(pa_result, 'prosody_score') else None,
                    "word_scores": word_scores
                }
            elif result.reason == speechsdk.ResultReason.NoMatch:
                return {"success": False, "error": "No speech detected. Please speak clearly."}
            else:
                return {"success": False, "error": f"Recognition failed: {result.reason}"}
        finally:
            for p in [src_path, wav_path]:
                try:
                    os.unlink(p)
                except Exception:
                    pass

    try:
        result = await asyncio.to_thread(_assess)
        if not result["success"]:
            raise HTTPException(status_code=422, detail=result["error"])
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Azure pronunciation assess error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
