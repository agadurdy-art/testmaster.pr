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
import shutil
import subprocess
import tempfile
import threading
import time
import uuid
from collections import Counter
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from pydantic import ValidationError

from schemas.speaking_evaluator import (
    FullTestPartInput,
    SpeakingEvaluationRequest,
    SpeakingEvaluationResult,
    SpeakingFullTestEvaluationRequest,
    SpeakingFullTestEvaluationResult,
    SpeakingPart,
)
from services import liz_llm

logger = logging.getLogger(__name__)

PROMPT_FILE = (
    Path(__file__).resolve().parent.parent
    / "prompts"
    / "speaking-evaluator-v2.md"
)

# Single-shot evaluator. Previously: 3 attempts × 90s = up to 270s, which blew
# past the FastAPI proxy timeout and produced 503s without ever returning a
# usable answer. Client safety on retry now comes from speaking_idempotency
# (Mongo TTL cache keyed by client_request_id) — a re-submitted request with
# the same id short-circuits before re-running Azure+Sonnet.
MAX_ATTEMPTS = 1
# Per-part speaking eval: 4 criteria + transcript_tokens + Azure pronunciation
# detail can reach ~2800 tokens on rich submissions. 5000 = ~40% headroom over
# observed p95 and matches the writing-eval-v2 reliability bar (2026-05-13).
# Single-shot policy means a truncation here = 502 to the user, so we prefer
# the few extra cents of output budget over an avoidable failure mode.
MAX_TOKENS = 5000
CALL_TIMEOUT_SECONDS = 75.0

# Each entry is (display label, regex pattern). Patterns tolerate trailing
# repetitions ("uhm", "ahhh", "errr") that Whisper / Azure occasionally leave
# in transcripts. Single-token fillers stay anchored with \b; multi-word ones
# match the whole phrase.
FILLER_PATTERNS: Tuple[Tuple[str, str], ...] = (
    ("um",         r"\bu+m+\b"),
    ("uh",         r"\bu+h+\b"),
    ("uhm",        r"\bu+h+m+\b"),
    ("er",         r"\be+r+\b"),
    ("erm",        r"\be+r+m+\b"),
    ("ah",         r"\ba+h+\b"),
    ("hmm",        r"\bh+m+\b"),
    ("well",       r"\bwell\b"),
    ("like",       r"\blike\b"),
    ("you know",   r"\byou know\b"),
    ("i mean",     r"\bi mean\b"),
    ("actually",   r"\bactually\b"),
    ("basically",  r"\bbasically\b"),
    ("sort of",    r"\bsort of\b"),
    ("kind of",    r"\bkind of\b"),
)

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


# Memoize the ffmpeg lookup; logged once at first transcode so deploy logs
# show clearly whether the binary is on PATH (and therefore whether we'll
# fall through to the pydub path on every request).
_ffmpeg_path_logged = False


def _resolve_ffmpeg_once() -> Optional[str]:
    """Locate an ffmpeg binary, preferring system PATH then the bundled
    static binary shipped by imageio-ffmpeg. The latter is included in
    requirements.txt as a deploy-image-independent fallback so transcode
    works even when the pod base image lacks ffmpeg.
    """
    global _ffmpeg_path_logged
    path = shutil.which("ffmpeg")
    source = "system PATH"
    if not path:
        try:
            import imageio_ffmpeg  # type: ignore

            path = imageio_ffmpeg.get_ffmpeg_exe()
            source = "imageio-ffmpeg bundled binary"
        except Exception as exc:  # pragma: no cover — package optional
            if not _ffmpeg_path_logged:
                logger.warning(
                    "Speaking transcode: ffmpeg unavailable on PATH and "
                    "imageio-ffmpeg fallback failed (%s). Pydub will also "
                    "fail because it shells out to the same binary.",
                    exc,
                )
                _ffmpeg_path_logged = True
            return None
    if not _ffmpeg_path_logged:
        logger.info("Speaking transcode: ffmpeg resolved via %s → %s", source, path)
        _ffmpeg_path_logged = True
    return path


async def transcode_to_wav(audio_bytes: bytes) -> bytes:
    """Convert arbitrary browser audio (webm/ogg/mp4) to 16kHz mono WAV.

    Tries ffmpeg first, falls back to pydub. Raises a clear RuntimeError on
    total failure so the caller can surface a useful message instead of
    bubbling a generic FileNotFoundError back to the user.
    """
    if not audio_bytes:
        raise RuntimeError("audio payload is empty")

    ffmpeg_bin = _resolve_ffmpeg_once()

    def _run_sync() -> bytes:
        tmp_in = Path(tempfile.mkstemp(suffix=".webm")[1])
        tmp_out = Path(tempfile.mkstemp(suffix=".wav")[1])
        try:
            tmp_in.write_bytes(audio_bytes)
            ffmpeg_err: Optional[str] = None
            if ffmpeg_bin:
                try:
                    subprocess.run(
                        [
                            ffmpeg_bin, "-y", "-i", str(tmp_in),
                            "-acodec", "pcm_s16le", "-ac", "1", "-ar", "16000",
                            str(tmp_out),
                        ],
                        capture_output=True,
                        check=True,
                    )
                except subprocess.CalledProcessError as exc:
                    ffmpeg_err = (
                        (exc.stderr or b"").decode("utf-8", errors="replace")[-400:]
                        or str(exc)
                    )
            if not ffmpeg_bin or ffmpeg_err is not None:
                try:
                    from pydub import AudioSegment  # type: ignore

                    # Point pydub at whichever ffmpeg we found (system or
                    # imageio-bundled) so it doesn't blow up looking for one
                    # on PATH.
                    if ffmpeg_bin:
                        AudioSegment.converter = ffmpeg_bin
                    audio = AudioSegment.from_file(str(tmp_in))
                    audio = audio.set_channels(1).set_frame_rate(16000)
                    audio.export(str(tmp_out), format="wav")
                except Exception as exc:  # pydub raises CouldntDecodeError etc.
                    raise RuntimeError(
                        "could not decode audio "
                        f"(ffmpeg: {'unavailable' if not ffmpeg_bin else ffmpeg_err}; "
                        f"pydub: {exc!r})"
                    ) from exc
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

            # Continuous recognition (NOT recognize_once): recognize_once
            # returns after a single utterance — it stops at the first ~0.5s
            # end-silence, so any recording with pauses between answers (IELTS
            # Part 1/3 sub-questions, a Full Test part take, even a long single
            # answer) was truncated to its first segment. Continuous recognition
            # accumulates every recognized segment across the whole file; we
            # merge the per-segment transcripts, words and pronunciation scores.
            segments: List[Dict[str, Any]] = []
            done = threading.Event()
            cancel_details: Dict[str, str] = {}

            def _on_recognized(evt):
                jr = evt.result.properties.get(
                    speechsdk.PropertyId.SpeechServiceResponse_JsonResult
                )
                if jr:
                    try:
                        segments.append(json.loads(jr))
                    except (ValueError, TypeError):
                        pass

            def _on_canceled(evt):
                cd = getattr(evt, "cancellation_details", None) or getattr(
                    evt.result, "cancellation_details", None
                )
                if cd is not None:
                    cancel_details["reason"] = str(getattr(cd, "reason", ""))
                    cancel_details["details"] = str(getattr(cd, "error_details", ""))
                done.set()

            def _on_stopped(evt):
                done.set()

            recognizer.recognized.connect(_on_recognized)
            recognizer.session_stopped.connect(_on_stopped)
            recognizer.canceled.connect(_on_canceled)

            recognizer.start_continuous_recognition()
            # Bound the wait so a stuck session can't hang the worker thread.
            done.wait(timeout=180)
            try:
                recognizer.stop_continuous_recognition()
            except Exception:  # pragma: no cover - defensive
                pass

            if not segments:
                return {
                    "error": "recognition: NoMatch",
                    "details": cancel_details.get("details", ""),
                }

            # Merge every segment's NBest[0] into one transcript + word list, and
            # compute word-count-weighted aggregate scores across all segments.
            text_parts: List[str] = []
            words: List[Dict[str, Any]] = []
            agg = {k: 0.0 for k in (
                "PronScore", "AccuracyScore", "FluencyScore",
                "ProsodyScore", "CompletenessScore",
            )}
            weight_total = 0

            for data in segments:
                nbest = data.get("NBest") or [{}]
                top = nbest[0]
                disp = top.get("Display") or data.get("DisplayText") or ""
                if disp:
                    text_parts.append(disp)
                seg_words = top.get("Words", []) or []
                for w in seg_words:
                    wp = w.get("PronunciationAssessment", {})
                    phonemes = []
                    for ph in w.get("Phonemes", []):
                        pa = ph.get("PronunciationAssessment", {})
                        phonemes.append({
                            "phoneme": ph.get("Phoneme", ""),
                            "score": pa.get("AccuracyScore", 0),
                        })
                    words.append({
                        "word": w.get("Word", ""),
                        "accuracy": wp.get("AccuracyScore", 0),
                        "error_type": wp.get("ErrorType", "None"),
                        "phonemes": phonemes,
                    })
                pron = top.get("PronunciationAssessment", {})
                # Weight by spoken-word count so a 2-word segment doesn't drag the
                # overall score as hard as a 30-word one. Fall back to weight 1.
                w_count = max(len([x for x in seg_words if x.get("Word")]), 1)
                if pron:
                    for k in agg:
                        agg[k] += float(pron.get(k, 0) or 0) * w_count
                    weight_total += w_count

            recognized_text = " ".join(p for p in text_parts if p).strip()
            if weight_total > 0:
                scores = {k: round(v / weight_total, 1) for k, v in agg.items()}
            else:
                scores = {k: 0 for k in agg}

            if not recognized_text:
                return {
                    "recognized_text": "",
                    "note": "no detailed assessment available",
                }

            return {
                "recognized_text": recognized_text,
                "pron_score": scores["PronScore"],
                "accuracy_score": scores["AccuracyScore"],
                "fluency_score": scores["FluencyScore"],
                "prosody_score": scores["ProsodyScore"],
                "completeness_score": scores["CompletenessScore"],
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
    for label, pattern in FILLER_PATTERNS:
        count = len(re.findall(pattern, lowered))
        if count:
            filler_hits[label] += count
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


def _build_deep_feedback_bundle(
    azure: Dict[str, Any],
) -> Tuple[Optional[Dict[str, Any]], Optional[List[Dict[str, Any]]]]:
    """Map the raw Azure pronunciation dict into the
    PremiumPronunciationDrawer contract (frontend reads
    `pronunciation_analysis.azure_scores` + `word_level_results[].accuracy_score`
    + `word_level_results[].problem_phonemes`).

    Returns (pronunciation_analysis, word_level_results). Either may be None
    if Azure data is unavailable / malformed."""
    if not azure or "error" in azure:
        return None, None

    azure_scores = {
        "pronunciation": float(azure.get("pron_score", 0) or 0),
        "accuracy": float(azure.get("accuracy_score", 0) or 0),
        "fluency": float(azure.get("fluency_score", 0) or 0),
        "prosody": float(azure.get("prosody_score", 0) or 0),
        "completeness": float(azure.get("completeness_score", 0) or 0),
    }
    pronunciation_analysis: Dict[str, Any] = {"azure_scores": azure_scores}

    raw_words = azure.get("word_results") or []
    word_level_results: List[Dict[str, Any]] = []
    for w in raw_words:
        # Only surface phonemes that scored low — the drawer renders these as
        # call-out chips, so a clean word doesn't need any phoneme detail.
        problem_phonemes = [
            {"phoneme": p.get("phoneme", ""), "score": p.get("score", 0)}
            for p in (w.get("phonemes") or [])
            if (p.get("score") or 0) < 60
        ]
        word_level_results.append(
            {
                "word": w.get("word", ""),
                "accuracy_score": float(w.get("accuracy", 0) or 0),
                "error_type": w.get("error_type", "None"),
                "problem_phonemes": problem_phonemes,
            }
        )

    return pronunciation_analysis, word_level_results


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
    "Not available in basic mode (no Azure phoneme assessment). Score PR "
    "from transcript-level cues using the public B4-9 descriptors above — do "
    "NOT assert specific phoneme errors and do NOT invent IPA. Use the full "
    "B4-9 range; transcript-only mode is not a reason to compress scores into "
    "a narrow band. Read fluency, lexical control, sentence-stress signaling, "
    "linker use, and obvious breakdown markers as PR proxies. If the "
    "transcript reads as natural, varied, well-paced English with rich "
    "lexis, B7-B8 PR is appropriate; reserve B9 for transcripts that are "
    "indistinguishable from a highly proficient speaker. Use B5 or below only "
    "when the transcript itself shows breakdown."
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
    started = time.monotonic()
    try:
        reply = await asyncio.wait_for(
            liz_llm.complete(
                system=system_prompt,
                user_message=user_prompt,
                model=model,
                max_tokens=MAX_TOKENS,
                task="eval",
                scope=f"speaking_eval_part{req.part.value}",
                cache_system=True,  # audit NEW-7: rubric is identical every call
            ),
            timeout=CALL_TIMEOUT_SECONDS,
        )
    except asyncio.TimeoutError:
        last_error = f"timeout after {CALL_TIMEOUT_SECONDS}s"
        logger.warning("Speaking eval timed out")
        raise SpeakingEvaluatorFailure(
            "Speaking evaluator timed out.",
            attempts=1,
            last_error=last_error,
        )
    except Exception as exc:
        last_error = f"llm_error: {exc!r}"
        logger.warning("Speaking eval LLM error: %s", exc)
        raise SpeakingEvaluatorFailure(
            "Speaking evaluator LLM call failed.",
            attempts=1,
            last_error=last_error,
        )

    latency = time.monotonic() - started
    payload = _extract_json(reply)
    try:
        data = json.loads(payload)
    except json.JSONDecodeError as exc:
        last_error = f"invalid_json: {exc}"
        logger.warning(
            "Speaking eval invalid JSON (%.1fs): %s", latency, exc,
        )
        raise SpeakingEvaluatorFailure(
            "Speaking evaluator returned invalid JSON.",
            attempts=1,
            last_error=last_error,
        )

    try:
        result = SpeakingEvaluationResult.model_validate(data)
    except ValidationError as exc:
        last_error = f"schema: {exc.errors()[:3]}"
        logger.warning("Speaking eval failed schema: %s", last_error)
        raise SpeakingEvaluatorFailure(
            "Speaking evaluator output failed schema validation.",
            attempts=1,
            last_error=last_error,
        )

    logger.info(
        "Speaking eval succeeded (%.1fs, overall %s)",
        latency, result.scores.overall,
    )
    return result


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

    result = await _run_evaluator_llm(
        req=req,
        transcript=transcript,
        fluency=fluency,
        azure_block=_build_azure_block(azure),
        mode_instruction="",
    )

    # Attach the Azure deep-feedback bundle so the frontend's
    # PremiumPronunciationDrawer can render the per-word + phoneme detail.
    # Sonnet's transcript_tokens already carry the highlighted summary;
    # this is the deluxe complement (5-score grid + drillable problem words).
    pron_analysis, word_results = _build_deep_feedback_bundle(azure)
    if pron_analysis is not None or word_results is not None:
        result = result.model_copy(
            update={
                "pronunciation_analysis": pron_analysis,
                "word_level_results": word_results,
            }
        )
    return result


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
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY not configured")
    from services.openai_compat import OpenAISpeechToText  # type: ignore
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


# ─── Full Test holistic evaluation ────────────────────────────────────────────

# IELTS examiner methodology: examiners observe Part 1 + Part 2 + Part 3 in
# one continuous test and award ONE band per criterion across the whole test
# (not per-part averaged). Per-part bands are informational only. This holistic
# pass implements that — concatenated transcripts, one Sonnet call, single
# FC/LR/GRA/PR.

_FULLTEST_USER_TEMPLATE = """## Context (Full Test holistic evaluation)
- Test parts: Part 1 (Introduction), Part 2 (Cue Card), Part 3 (Discussion)
- Target band: {target_band}
- Feedback language: {user_language}

You are evaluating a COMPLETE IELTS Speaking test. Award ONE holistic band per
criterion (FC, LR, GRA, PR) across the whole test, weighted by how each part
typically reveals the criterion (Part 1 = warmup; Part 2 = sustained monologue
under fluency pressure; Part 3 = abstract discussion + lexical/grammatical
flexibility). Per-part indicative_band fields are informational ONLY — do
NOT average them; the holistic band reflects the whole observation.

## Part 1 transcript
- Duration: {part1_duration:.1f}s · WPM: {part1_wpm} · Words: {part1_words}
- Cue/topic: {part1_cue}

{part1_transcript}

{part1_azure}

## Part 2 transcript
- Duration: {part2_duration:.1f}s · WPM: {part2_wpm} · Words: {part2_words}
- Cue card: {part2_cue}
- Bullets: {part2_bullets}

{part2_transcript}

{part2_azure}

## Part 3 transcript
- Duration: {part3_duration:.1f}s · WPM: {part3_wpm} · Words: {part3_words}
- Discussion theme: {part3_cue}

{part3_transcript}

{part3_azure}

## Required JSON shape (strict — no fences, no extras)

{{
  "scores": {{"overall": <0.5-step>, "target": {target_band}, "fc": <0.5-step>, "lr": <0.5-step>, "gra": <0.5-step>, "pr": <0.5-step>}},
  "criteria": {{
    "fc":  {{"band": <0.5-step>, "explanation": "<1-3 sentences citing evidence across all 3 parts>", "strengths": ["<observed>"], "weaknesses": ["<observed>"]}},
    "lr":  {{"band": <0.5-step>, "explanation": "<1-3 sentences citing evidence across all 3 parts>", "strengths": ["<observed>"], "weaknesses": ["<observed>"]}},
    "gra": {{"band": <0.5-step>, "explanation": "<1-3 sentences citing evidence across all 3 parts>", "strengths": ["<observed>"], "weaknesses": ["<observed>"]}},
    "pr":  {{"band": <0.5-step>, "explanation": "<1-3 sentences citing evidence across all 3 parts>", "strengths": ["<observed>"], "weaknesses": ["<observed>"]}}
  }},
  "parts": [
    {{"part": "part1", "transcript": "<verbatim Part 1 transcript>", "duration_seconds": {part1_duration:.1f}, "indicative_band": <0.5-step>, "observation": "<1-2 sentences specific to Part 1>"}},
    {{"part": "part2", "transcript": "<verbatim Part 2 transcript>", "duration_seconds": {part2_duration:.1f}, "indicative_band": <0.5-step>, "observation": "<1-2 sentences specific to Part 2>"}},
    {{"part": "part3", "transcript": "<verbatim Part 3 transcript>", "duration_seconds": {part3_duration:.1f}, "indicative_band": <0.5-step>, "observation": "<1-2 sentences specific to Part 3>"}}
  ],
  "liz_note": "<3-4 sentences naming ONE pattern observed across the whole test, with one concrete next step>",
  "feedback_language": "{user_language}"
}}

Output: one JSON object, nothing else.
"""


def _fulltest_system_prompt() -> str:
    """Reuse the v2 system prompt (descriptors + calibration discipline +
    anchor exemplars) but swap mode_instruction with a Full Test directive."""
    system_template, _ = _load_prompt_blocks()
    fulltest_mode = (
        "\n- FULL TEST MODE: You are scoring a complete 3-part IELTS Speaking "
        "test. Award ONE holistic band per criterion across all 3 parts. Per-"
        "part indicative_band entries in the output are informational only "
        "(not averaged into the overall). Scoring follows the same descriptors "
        "and calibration discipline above."
    )
    return _substitute(system_template, part="full_test", mode_instruction=fulltest_mode)


def _fulltest_user_prompt(
    *,
    target_band: float,
    user_language: str,
    part_data: Dict[SpeakingPart, Dict[str, Any]],
) -> str:
    p1 = part_data[SpeakingPart.part1]
    p2 = part_data[SpeakingPart.part2]
    p3 = part_data[SpeakingPart.part3]
    return _FULLTEST_USER_TEMPLATE.format(
        target_band=target_band,
        user_language=user_language,
        part1_duration=p1["duration"],
        part1_wpm=p1["fluency"]["wpm"],
        part1_words=p1["fluency"]["words_total"],
        part1_cue=p1["cue"],
        part1_transcript=p1["transcript"],
        part1_azure=p1["azure_block"],
        part2_duration=p2["duration"],
        part2_wpm=p2["fluency"]["wpm"],
        part2_words=p2["fluency"]["words_total"],
        part2_cue=p2["cue"],
        part2_bullets="; ".join(p2.get("bullets") or []) or "(none)",
        part2_transcript=p2["transcript"],
        part2_azure=p2["azure_block"],
        part3_duration=p3["duration"],
        part3_wpm=p3["fluency"]["wpm"],
        part3_words=p3["fluency"]["words_total"],
        part3_cue=p3["cue"],
        part3_transcript=p3["transcript"],
        part3_azure=p3["azure_block"],
    )


async def _run_fulltest_llm(
    *,
    target_band: float,
    user_language: str,
    part_data: Dict[SpeakingPart, Dict[str, Any]],
) -> SpeakingFullTestEvaluationResult:
    """One Sonnet call → SpeakingFullTestEvaluationResult."""
    system_prompt = _fulltest_system_prompt()
    user_prompt = _fulltest_user_prompt(
        target_band=target_band,
        user_language=user_language,
        part_data=part_data,
    )

    model = liz_llm.deep_model()
    started = time.monotonic()
    try:
        reply = await asyncio.wait_for(
            liz_llm.complete(
                system=system_prompt,
                user_message=user_prompt,
                model=model,
                # Holistic 3-part eval: per-part observations + 3 transcripts +
                # holistic criteria. Realistic ceiling ~4200 tokens; 6500 leaves
                # ~55% headroom so a heavy Part 2 monologue + dense Azure data
                # can't truncate (single-shot policy, see MAX_ATTEMPTS rationale).
                max_tokens=6500,
                task="eval",
                scope="speaking_eval_fulltest",
                cache_system=True,  # audit NEW-7: rubric is identical every call
            ),
            timeout=CALL_TIMEOUT_SECONDS,
        )
    except asyncio.TimeoutError:
        last_error = f"timeout after {CALL_TIMEOUT_SECONDS}s"
        logger.warning("Fulltest eval timed out")
        raise SpeakingEvaluatorFailure(
            "Fulltest evaluator timed out.",
            attempts=1,
            last_error=last_error,
        )
    except Exception as exc:
        last_error = f"llm_error: {exc!r}"
        logger.warning("Fulltest eval LLM error: %s", exc)
        raise SpeakingEvaluatorFailure(
            "Fulltest evaluator LLM call failed.",
            attempts=1,
            last_error=last_error,
        )

    latency = time.monotonic() - started
    payload = _extract_json(reply)
    try:
        data = json.loads(payload)
    except json.JSONDecodeError as exc:
        last_error = f"invalid_json: {exc}"
        logger.warning(
            "Fulltest eval invalid JSON (%.1fs): %s", latency, exc,
        )
        raise SpeakingEvaluatorFailure(
            "Fulltest evaluator returned invalid JSON.",
            attempts=1,
            last_error=last_error,
        )

    try:
        result = SpeakingFullTestEvaluationResult.model_validate(data)
    except ValidationError as exc:
        last_error = f"schema: {exc.errors()[:3]}"
        logger.warning("Fulltest eval failed schema: %s", last_error)
        raise SpeakingEvaluatorFailure(
            "Fulltest evaluator output failed schema validation.",
            attempts=1,
            last_error=last_error,
        )

    logger.info(
        "Fulltest eval succeeded (%.1fs, overall %s)",
        latency, result.scores.overall,
    )
    return result


async def _process_one_part_for_fulltest(
    part_input: FullTestPartInput,
    audio_bytes: bytes,
    *,
    use_azure: bool,
    transcribe_audio: Optional[Any] = None,
) -> Dict[str, Any]:
    """Transcribe + (optionally) Azure-score one part. Returns a dict the
    fulltest user prompt can consume."""
    if not audio_bytes:
        raise SpeakingEvaluatorFailure(
            f"empty audio for {part_input.part.value}", attempts=0
        )

    azure_block: str = _BASIC_AZURE_BLOCK
    transcript: str = ""

    if use_azure:
        try:
            wav_bytes = await transcode_to_wav(audio_bytes)
            azure = await run_azure_pronunciation(wav_bytes, reference_text="")
        except Exception as exc:
            logger.warning(
                "fulltest %s azure failed, falling back to whisper: %s",
                part_input.part.value, exc,
            )
            azure = None

        if azure and "error" not in azure and azure.get("recognized_text"):
            transcript = azure["recognized_text"]
            azure_block = _build_azure_block(azure)
        else:
            use_azure = False  # fall through to whisper

    if not transcript:
        if transcribe_audio is None:
            transcribe_audio = _default_whisper_transcribe
        transcript = await transcribe_audio(audio_bytes)
        if not transcript or not transcript.strip():
            raise SpeakingEvaluatorFailure(
                f"empty transcript for {part_input.part.value}", attempts=0
            )

    duration = float(part_input.duration_seconds or 0.0)
    fluency = compute_fluency(transcript, duration)

    return {
        "part": part_input.part,
        "transcript": transcript,
        "duration": duration,
        "fluency": fluency,
        "azure_block": azure_block,
        "cue": part_input.cue_card_prompt,
        "bullets": part_input.cue_card_bullets,
    }


async def evaluate_speaking_fulltest(
    req: SpeakingFullTestEvaluationRequest,
    audios_by_part: Dict[SpeakingPart, bytes],
    *,
    use_azure: bool = True,
    transcribe_audio: Optional[Any] = None,
) -> SpeakingFullTestEvaluationResult:
    """Holistic Full Test pipeline: 3 parallel transcribe+pron passes, then
    one Sonnet call. `use_azure=False` forces basic mode (Whisper-only).
    """
    expected_parts = {SpeakingPart.part1, SpeakingPart.part2, SpeakingPart.part3}
    missing = expected_parts - set(audios_by_part.keys())
    if missing:
        raise SpeakingEvaluatorFailure(
            f"missing audio for parts: {sorted(p.value for p in missing)}",
            attempts=0,
        )

    inputs = {p.part: p for p in req.parts}

    # Process all 3 parts concurrently — 3 transcode+azure passes in parallel.
    coros = [
        _process_one_part_for_fulltest(
            inputs[part],
            audios_by_part[part],
            use_azure=use_azure,
            transcribe_audio=transcribe_audio,
        )
        for part in (SpeakingPart.part1, SpeakingPart.part2, SpeakingPart.part3)
    ]
    processed = await asyncio.gather(*coros)
    part_data = {pd["part"]: pd for pd in processed}

    return await _run_fulltest_llm(
        target_band=float(req.target_band or 7.0),
        user_language=req.user_language,
        part_data=part_data,
    )
