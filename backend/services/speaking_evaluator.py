"""
Speaking Evaluator v2
=====================
Claude Sonnet-backed IELTS Speaking evaluator. Fuses:

  1. Azure STT + pronunciation assessment (word + phoneme level)
  2. Local fluency metrics (WPM, pauses, fillers, unique/total)
  3. Claude Sonnet post-analysis (4 criteria + Liz coach notes)

and emits a `SpeakingEvaluationResult` shaped to match the D7 UI contract.

Public entry points:
  transcode_to_wav(audio_bytes) -> bytes
  run_azure_pronunciation(wav_bytes, reference_text) -> dict
  compute_fluency(transcript, duration_seconds) -> dict
  evaluate_speaking(req, audio_bytes) -> SpeakingEvaluationResult
  health() -> dict
"""
from __future__ import annotations

import asyncio
import json
import logging
import os
import re
import subprocess
import tempfile
import time
import uuid
from collections import Counter
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from pydantic import ValidationError

from schemas.speaking_evaluator import (
    SpeakingEvaluationRequest,
    SpeakingEvaluationResult,
)
from services import liz_llm

logger = logging.getLogger(__name__)

PROMPT_FILE = (
    Path(__file__).resolve().parent.parent
    / "prompts"
    / "speaking-evaluator-v2.md"
)

MAX_ATTEMPTS = 3
BACKOFF_SCHEDULE = (1.0, 3.0)
MAX_TOKENS = 3500
CALL_TIMEOUT_SECONDS = 90.0

FILLER_WORDS = {
    "um", "uh", "er", "erm", "ah", "hmm", "like", "you know",
    "i mean", "actually", "basically", "sort of", "kind of",
}

_FENCE_RE = re.compile(r"```(?:[a-zA-Z0-9_-]*)\s*\n(.*?)\n```", re.DOTALL)
_JSON_BLOCK_RE = re.compile(r"\{[\s\S]*\}")


class SpeakingEvaluatorFailure(RuntimeError):
    def __init__(
        self,
        message: str,
        *,
        attempts: int,
        last_error: Optional[str] = None,
    ):
        super().__init__(message)
        self.attempts = attempts
        self.last_error = last_error


# ─── Prompt loading ──────────────────────────────────────────────────────────


@lru_cache(maxsize=1)
def _load_prompt_blocks() -> Tuple[str, str]:
    if not PROMPT_FILE.exists():
        raise SpeakingEvaluatorFailure(
            f"Prompt file missing: {PROMPT_FILE}", attempts=0
        )
    text = PROMPT_FILE.read_text(encoding="utf-8")
    system_marker = "## System Prompt Template"
    user_marker = "## User Prompt Template"
    if system_marker not in text or user_marker not in text:
        raise SpeakingEvaluatorFailure(
            "Prompt file missing expected section headers", attempts=0
        )
    _, _, rest = text.partition(system_marker)
    parts = rest.split(user_marker, 1)
    if len(parts) != 2:
        raise SpeakingEvaluatorFailure(
            "User prompt section not found", attempts=0
        )

    def _first_fence(block: str) -> str:
        match = _FENCE_RE.search(block)
        if not match:
            raise SpeakingEvaluatorFailure(
                "Prompt section has no fenced code block", attempts=0
            )
        return match.group(1).strip()

    return _first_fence(parts[0]), _first_fence(parts[1])


def _substitute(template: str, **values: Any) -> str:
    result = template
    for key, val in values.items():
        result = result.replace(f"{{{{{key}}}}}", str(val))
    return result


# ─── Audio transcoding ───────────────────────────────────────────────────────


async def transcode_to_wav(audio_bytes: bytes) -> bytes:
    """Convert arbitrary browser audio (webm/ogg/mp4) to 16kHz mono WAV.

    Tries ffmpeg first, falls back to pydub. Raises on total failure.
    """
    def _run_sync() -> bytes:
        tmp_in = Path(tempfile.mkstemp(suffix=".webm")[1])
        tmp_out = Path(tempfile.mkstemp(suffix=".wav")[1])
        try:
            tmp_in.write_bytes(audio_bytes)
            try:
                subprocess.run(
                    [
                        "ffmpeg", "-y", "-i", str(tmp_in),
                        "-acodec", "pcm_s16le", "-ac", "1", "-ar", "16000",
                        str(tmp_out),
                    ],
                    capture_output=True,
                    check=True,
                )
            except (FileNotFoundError, subprocess.CalledProcessError):
                from pydub import AudioSegment  # type: ignore
                audio = AudioSegment.from_file(str(tmp_in))
                audio = audio.set_channels(1).set_frame_rate(16000)
                audio.export(str(tmp_out), format="wav")
            return tmp_out.read_bytes()
        finally:
            tmp_in.unlink(missing_ok=True)
            tmp_out.unlink(missing_ok=True)

    return await asyncio.to_thread(_run_sync)


# ─── Azure pronunciation assessment ──────────────────────────────────────────


async def run_azure_pronunciation(
    wav_bytes: bytes,
    reference_text: str = "",
) -> Dict[str, Any]:
    """Run word- and phoneme-level pronunciation assessment via Azure.

    Returns a dict with `recognized_text`, aggregate scores, and
    `word_results`. Returns `{"error": ...}` on failure.
    """
    key = os.environ.get("AZURE_SPEECH_KEY")
    region = os.environ.get("AZURE_SPEECH_REGION", "southeastasia")
    if not key:
        return {"error": "Azure Speech not configured"}

    def _run_sync() -> Dict[str, Any]:
        try:
            import azure.cognitiveservices.speech as speechsdk  # type: ignore
        except ImportError:
            return {"error": "azure-cognitiveservices-speech not installed"}

        tmp_wav = Path(tempfile.mkstemp(suffix=".wav")[1])
        try:
            tmp_wav.write_bytes(wav_bytes)

            speech_config = speechsdk.SpeechConfig(
                subscription=key, region=region
            )
            audio_config = speechsdk.AudioConfig(filename=str(tmp_wav))
            recognizer = speechsdk.SpeechRecognizer(
                speech_config=speech_config, audio_config=audio_config
            )
            pron_config = speechsdk.PronunciationAssessmentConfig(
                reference_text=reference_text,
                grading_system=speechsdk.PronunciationAssessmentGradingSystem.HundredMark,
                granularity=speechsdk.PronunciationAssessmentGranularity.Phoneme,
                enable_miscue=bool(reference_text),
            )
            pron_config.enable_prosody_assessment()
            pron_config.apply_to(recognizer)

            result = recognizer.recognize_once()

            if result.reason != speechsdk.ResultReason.RecognizedSpeech:
                return {
                    "error": f"recognition: {result.reason}",
                    "details": getattr(
                        getattr(result, "cancellation_details", None),
                        "error_details",
                        "",
                    ),
                }

            json_result = result.properties.get(
                speechsdk.PropertyId.SpeechServiceResponse_JsonResult
            )
            if not json_result:
                return {
                    "recognized_text": result.text,
                    "note": "no detailed assessment available",
                }

            data = json.loads(json_result)
            nbest = data.get("NBest") or [{}]
            top = nbest[0]
            pron = top.get("PronunciationAssessment", {})
            words: List[Dict[str, Any]] = []
            for w in top.get("Words", []):
                wp = w.get("PronunciationAssessment", {})
                phonemes = []
                for ph in w.get("Phonemes", []):
                    pa = ph.get("PronunciationAssessment", {})
                    phonemes.append(
                        {
                            "phoneme": ph.get("Phoneme", ""),
                            "score": pa.get("AccuracyScore", 0),
                        }
                    )
                words.append(
                    {
                        "word": w.get("Word", ""),
                        "accuracy": wp.get("AccuracyScore", 0),
                        "error_type": wp.get("ErrorType", "None"),
                        "phonemes": phonemes,
                    }
                )

            return {
                "recognized_text": top.get("Display") or result.text,
                "pron_score": pron.get("PronScore", 0),
                "accuracy_score": pron.get("AccuracyScore", 0),
                "fluency_score": pron.get("FluencyScore", 0),
                "prosody_score": pron.get("ProsodyScore", 0),
                "completeness_score": pron.get("CompletenessScore", 0),
                "word_results": words,
            }
        except Exception as exc:  # pragma: no cover - defensive
            logger.exception("Azure assessment crashed")
            return {"error": f"exception: {exc!r}"}
        finally:
            tmp_wav.unlink(missing_ok=True)

    return await asyncio.to_thread(_run_sync)


# ─── Local fluency metrics ───────────────────────────────────────────────────


def compute_fluency(transcript: str, duration_seconds: float) -> Dict[str, Any]:
    """Compute simple fluency metrics. Duration in seconds (float)."""
    duration_seconds = max(0.0, float(duration_seconds or 0.0))
    cleaned = (transcript or "").strip()
    words = re.findall(r"[A-Za-z'']+", cleaned.lower())
    words_total = len(words)

    minutes = duration_seconds / 60.0 if duration_seconds > 0 else 0.0
    wpm = int(round(words_total / minutes)) if minutes > 0 else 0

    lowered = cleaned.lower()
    filler_hits: Counter[str] = Counter()
    for f in FILLER_WORDS:
        pattern = r"\b" + re.escape(f) + r"\b"
        count = len(re.findall(pattern, lowered))
        if count:
            filler_hits[f] += count
    filler_total = sum(filler_hits.values())

    # Pauses: count runs of ".", "…", "--" and long comma breaks.
    pauses = len(re.findall(r"\.{2,}|…|—|--", cleaned))
    # Rough heuristic: each sentence-ending period ≈ 1 pause.
    pauses += len(re.findall(r"[.!?](?=\s|$)", cleaned))
    filled_pauses = filler_total

    unique_count = len({w for w in words})

    mm = int(duration_seconds // 60)
    ss = int(round(duration_seconds - mm * 60))
    duration_str = f"{mm} min {ss:02d} s"

    fillers_label = ", ".join(f'"{w}"' for w, _ in filler_hits.most_common(3))
    fillers_display = (
        f"{filler_total} · {fillers_label}" if filler_total else "0"
    )

    return {
        "wpm": wpm,
        "words_total": words_total,
        "unique_count": unique_count,
        "pauses": pauses,
        "filled_pauses": filled_pauses,
        "fillers_detected": list(filler_hits.keys()),
        "pauses_display": f"{pauses} · {filled_pauses} filled",
        "fillers_display": fillers_display,
        "unique_display": f"{unique_count} / {words_total}",
        "duration_display": duration_str,
    }


# ─── Response parsing ────────────────────────────────────────────────────────


def _extract_json(text: str) -> str:
    stripped = (text or "").strip()
    if stripped.startswith("```"):
        fence = _FENCE_RE.search(stripped)
        if fence:
            return fence.group(1).strip()
    match = _JSON_BLOCK_RE.search(stripped)
    return (match.group(0) if match else stripped).strip()


def _format_problem_words(word_results: List[Dict[str, Any]]) -> str:
    problems = [
        w for w in word_results
        if w.get("accuracy", 100) < 70 or w.get("error_type", "None") != "None"
    ]
    if not problems:
        return "(no notable pronunciation issues detected)"
    lines = []
    for w in problems[:12]:
        phoneme_list = ", ".join(
            f"{p['phoneme']}({p['score']:.0f})"
            for p in w.get("phonemes", [])
            if p.get("score", 100) < 60
        ) or "—"
        lines.append(
            f"- '{w['word']}': accuracy={w.get('accuracy', 0):.0f}, "
            f"error={w.get('error_type', 'None')}, weak_phonemes={phoneme_list}"
        )
    return "\n".join(lines)


# ─── Public entry point ──────────────────────────────────────────────────────


def _build_azure_block(azure: Dict[str, Any]) -> str:
    return (
        "## Azure word-level pronunciation (top problem words)\n"
        f"{_format_problem_words(azure.get('word_results') or [])}\n"
        "\n"
        "## Azure aggregate scores (0-100)\n"
        f"- pronunciation: {azure.get('pron_score', 0):.1f}\n"
        f"- accuracy: {azure.get('accuracy_score', 0):.1f}\n"
        f"- fluency: {azure.get('fluency_score', 0):.1f}\n"
        f"- prosody: {azure.get('prosody_score', 0):.1f}\n"
        f"- completeness: {azure.get('completeness_score', 0):.1f}"
    )


_BASIC_AZURE_BLOCK = (
    "## Pronunciation analysis\n"
    "Not available in basic mode (no Azure phoneme assessment). Score "
    "pronunciation conservatively from transcript-level cues only — do not "
    "assert specific phoneme errors. If the transcript reads cleanly, a band "
    "in the 5.5–6.5 range is appropriate; reserve 7+ for clearly fluent, "
    "well-stressed delivery and use 5 or below only when the transcript "
    "itself shows breakdown."
)

_BASIC_MODE_INSTRUCTION = (
    "\n- BASIC MODE: You do not have Azure phoneme data. In transcript_tokens, "
    "you may still mark a word with `pron: \"ok\"` or `\"bad\"` if the "
    "transcript shows obvious lexical/grammatical breakdown around it, but do "
    "NOT invent IPA strings or phoneme-level notes. Most tokens should be "
    "neutral runs; emit at most 2 problem words with brief, transcript-grounded "
    "notes."
)


async def _run_evaluator_llm(
    *,
    req: SpeakingEvaluationRequest,
    transcript: str,
    fluency: Dict[str, Any],
    azure_block: str,
    mode_instruction: str,
) -> SpeakingEvaluationResult:
    """Shared inner loop: render prompts, call Sonnet, retry, validate."""
    system_template, user_template = _load_prompt_blocks()
    duration = float(req.duration_seconds or 0.0)

    user_prompt = _substitute(
        user_template,
        part=req.part.value,
        cue_card_prompt=req.cue_card_prompt,
        cue_card_bullets="; ".join(req.cue_card_bullets) or "(none)",
        target_band=str(req.target_band if req.target_band is not None else 7.0),
        user_language=req.user_language,
        transcript=transcript,
        words_total=fluency["words_total"],
        unique_count=fluency["unique_count"],
        duration_seconds=f"{duration:.1f}",
        wpm=fluency["wpm"],
        pause_count=fluency["pauses"],
        filled_pause_count=fluency["filled_pauses"],
        fillers_detected=", ".join(fluency["fillers_detected"]) or "(none)",
        azure_block=azure_block,
    )
    system_prompt = _substitute(
        system_template,
        part=req.part.value,
        mode_instruction=mode_instruction,
    )

    model = liz_llm.deep_model()
    last_error: Optional[str] = None

    for attempt in range(1, MAX_ATTEMPTS + 1):
        started = time.monotonic()
        try:
            reply = await asyncio.wait_for(
                liz_llm.complete(
                    system=system_prompt,
                    user_message=user_prompt,
                    model=model,
                    max_tokens=MAX_TOKENS,
                    task="eval",
                ),
                timeout=CALL_TIMEOUT_SECONDS,
            )
        except asyncio.TimeoutError:
            last_error = f"timeout after {CALL_TIMEOUT_SECONDS}s"
            logger.warning("Speaking eval attempt %d timed out", attempt)
        except Exception as exc:
            last_error = f"llm_error: {exc!r}"
            logger.warning("Speaking eval attempt %d LLM error: %s", attempt, exc)
        else:
            latency = time.monotonic() - started
            payload = _extract_json(reply)
            try:
                data = json.loads(payload)
            except json.JSONDecodeError as exc:
                last_error = f"invalid_json: {exc}"
                logger.warning(
                    "Speaking eval attempt %d invalid JSON (%.1fs): %s",
                    attempt, latency, exc,
                )
            else:
                try:
                    result = SpeakingEvaluationResult.model_validate(data)
                except ValidationError as exc:
                    last_error = f"schema: {exc.errors()[:3]}"
                    logger.warning(
                        "Speaking eval attempt %d failed schema: %s",
                        attempt, last_error,
                    )
                else:
                    logger.info(
                        "Speaking eval succeeded attempt %d (%.1fs, overall %s)",
                        attempt, latency, result.scores.overall,
                    )
                    return result

        if attempt < MAX_ATTEMPTS:
            delay = BACKOFF_SCHEDULE[
                min(attempt - 1, len(BACKOFF_SCHEDULE) - 1)
            ]
            await asyncio.sleep(delay)

    raise SpeakingEvaluatorFailure(
        "Speaking evaluator failed to produce a valid result.",
        attempts=MAX_ATTEMPTS,
        last_error=last_error,
    )


async def evaluate_speaking(
    req: SpeakingEvaluationRequest,
    audio_bytes: bytes,
) -> SpeakingEvaluationResult:
    """Full pipeline: Azure STT + pronunciation + Sonnet. Raises on failure."""
    if not audio_bytes:
        raise SpeakingEvaluatorFailure("empty audio payload", attempts=0)

    try:
        wav_bytes = await transcode_to_wav(audio_bytes)
    except Exception as exc:
        raise SpeakingEvaluatorFailure(
            f"audio transcode failed: {exc!r}", attempts=0
        ) from exc

    azure = await run_azure_pronunciation(wav_bytes, reference_text="")
    if "error" in azure or not azure.get("recognized_text"):
        raise SpeakingEvaluatorFailure(
            f"azure failed: {azure.get('error', 'no transcript')}",
            attempts=0,
            last_error=str(azure.get("details") or azure.get("error") or ""),
        )

    transcript = azure["recognized_text"]
    duration = float(req.duration_seconds or 0.0)
    fluency = compute_fluency(transcript, duration)

    return await _run_evaluator_llm(
        req=req,
        transcript=transcript,
        fluency=fluency,
        azure_block=_build_azure_block(azure),
        mode_instruction="",
    )


async def evaluate_speaking_basic(
    req: SpeakingEvaluationRequest,
    audio_bytes: bytes,
    *,
    transcribe_audio: Optional[Any] = None,
) -> SpeakingEvaluationResult:
    """Basic pipeline: Whisper STT + Sonnet (no Azure pronunciation).

    Used for the free-tier weekly cycle after the first "taste" eval is
    consumed. `transcribe_audio` is an injectable async callable accepting
    raw audio bytes and returning a transcript string; defaults to the
    OpenAI Whisper helper. Injection keeps tests offline.
    """
    if not audio_bytes:
        raise SpeakingEvaluatorFailure("empty audio payload", attempts=0)

    if transcribe_audio is None:
        transcribe_audio = _default_whisper_transcribe

    try:
        transcript = await transcribe_audio(audio_bytes)
    except Exception as exc:
        raise SpeakingEvaluatorFailure(
            f"transcription failed: {exc!r}", attempts=0
        ) from exc

    if not transcript or not transcript.strip():
        raise SpeakingEvaluatorFailure(
            "empty transcript from whisper", attempts=0
        )

    duration = float(req.duration_seconds or 0.0)
    fluency = compute_fluency(transcript, duration)

    return await _run_evaluator_llm(
        req=req,
        transcript=transcript,
        fluency=fluency,
        azure_block=_BASIC_AZURE_BLOCK,
        mode_instruction=_BASIC_MODE_INSTRUCTION,
    )


async def _default_whisper_transcribe(audio_bytes: bytes) -> str:
    """Default Whisper transcription via emergentintegrations. Lazy-imported
    so unit tests that inject a fake transcribe_audio don't pay for the
    SDK import or require EMERGENT_LLM_KEY."""
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        raise RuntimeError("EMERGENT_LLM_KEY not configured")
    from emergentintegrations.llm.openai import OpenAISpeechToText  # type: ignore
    import io

    stt = OpenAISpeechToText(api_key=api_key)
    buf = io.BytesIO(audio_bytes)
    buf.name = f"audio-{uuid.uuid4().hex}.webm"
    response = await stt.transcribe(
        file=buf,
        model="whisper-1",
        response_format="json",
    )
    return getattr(response, "text", "") or ""


def health() -> Dict[str, Any]:
    return {
        "prompt_file_exists": PROMPT_FILE.exists(),
        "model": liz_llm.deep_model(),
        "provider": liz_llm.active_provider(),
        "azure_configured": bool(os.environ.get("AZURE_SPEECH_KEY")),
    }
