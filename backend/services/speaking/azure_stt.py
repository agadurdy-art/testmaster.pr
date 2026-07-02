"""
Azure STT + pronunciation assessment for the speaking evaluator.

Continuous-recognition engine (word + phoneme level) and the Liz Live
user-audio slicer. Split out of services/speaking_evaluator.py (2026-07-02
refactor); behavior unchanged.
"""
from __future__ import annotations

import asyncio
import json
import logging
import os
import tempfile
import threading
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from services.speaking.transcode import _resolve_ffmpeg_once

logger = logging.getLogger(__name__)


def build_user_audio_from_turns(
    call_audio_bytes: bytes,
    turns: List[Dict[str, Any]],
    total_secs: float = 0.0,
) -> Optional[Dict[str, Any]]:
    """Cut the candidate's spans out of the full Liz call recording (a single
    mixed track) using the transcript turn timestamps, concatenate them, and
    return {"wav_bytes": 16kHz-mono-WAV, "user_secs": seconds}. This is how we
    get REAL pronunciation for Liz Live: ElevenLabs records the whole call
    server-side, so we don't depend on the flaky browser parallel recorder.
    Returns None when there are no user spans or slicing fails."""
    if not call_audio_bytes or not turns:
        return None
    sorted_turns = sorted(
        [t for t in turns if isinstance(t.get("time_in_call_secs"), (int, float))],
        key=lambda t: t["time_in_call_secs"],
    )
    spans: List[Tuple[float, float]] = []
    for i, t in enumerate(sorted_turns):
        if t.get("role") != "user":
            continue
        start = max(0.0, float(t["time_in_call_secs"]))
        if i + 1 < len(sorted_turns):
            end = float(sorted_turns[i + 1]["time_in_call_secs"])
        else:
            end = total_secs if total_secs and total_secs > start else start + 30.0
        if end > start:
            spans.append((start, end))
    if not spans:
        return None

    def _run_sync() -> Optional[Dict[str, Any]]:
        try:
            import io
            from pydub import AudioSegment  # type: ignore
            ffmpeg_bin = _resolve_ffmpeg_once()
            if ffmpeg_bin:
                AudioSegment.converter = ffmpeg_bin
            seg = AudioSegment.from_file(io.BytesIO(call_audio_bytes))
            out = AudioSegment.empty()
            user_secs = 0.0
            for start, end in spans:
                out += seg[int(start * 1000):int(end * 1000)]
                user_secs += end - start
            out = out.set_channels(1).set_frame_rate(16000)
            buf = io.BytesIO()
            out.export(buf, format="wav")
            data = buf.getvalue()
            if not data:
                return None
            return {"wav_bytes": data, "user_secs": round(user_secs, 1)}
        except Exception as exc:  # pragma: no cover - defensive
            logger.warning("build_user_audio_from_turns failed: %s", exc)
            return None

    return _run_sync()


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
            # Bound the wait well under the 110s route budget so a stuck/slow
            # session can't starve the Sonnet pass (and so the caller can fall
            # back to Whisper). Any segments collected before the cap are still
            # used. Tunable via AZURE_RECOGNITION_WAIT_S.
            wait_s = float(os.environ.get("AZURE_RECOGNITION_WAIT_S", "70"))
            done.wait(timeout=wait_s)
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
