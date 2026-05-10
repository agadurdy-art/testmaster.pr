"""
Smart Practice — structured per-question speaking evaluator.

Used by the per-question Smart Practice flow (NOT Liz Live / Liz Examiner;
that surface uses a single audio per part and lives in
services/speaking_evaluator.evaluate_speaking[_basic]).

Pipeline:
  For each question (in parallel):
    * transcode webm → 16kHz mono WAV
    * full mode  → Azure pronunciation assessment (transcript + word/phoneme)
      basic mode → Whisper transcript only
    * compute fluency metrics locally (WPM / pauses / fillers / unique)
  Single Sonnet call:
    * input  = all transcripts + per-question fluency + (full) Azure blocks
    * output = overall band + 4 criteria + per-question indicative_band +
               observation + liz_note
  Compose final result:
    * inject transcript + audio_url + fluency back into each question
    * (full mode) attach per-question pronunciation_analysis + word_level_results
    * (full mode) attach test-level pronunciation_analysis aggregated

Counts as ONE eval against the user's quota (not N).
"""
from __future__ import annotations

import asyncio
import json
import logging
import time
from typing import Any, Dict, List, Optional

from services import liz_llm
from services.speaking_evaluator import (
    _BASIC_AZURE_BLOCK,
    _build_azure_block,
    _build_deep_feedback_bundle,
    _default_whisper_transcribe,
    _extract_json,
    compute_fluency,
    run_azure_pronunciation,
    transcode_to_wav,
)

logger = logging.getLogger(__name__)

MAX_ATTEMPTS = 3
BACKOFF_SCHEDULE = (1.0, 3.0)
MAX_TOKENS = 4500
CALL_TIMEOUT_SECONDS = 120.0


class StructuredEvaluatorFailure(RuntimeError):
    def __init__(self, message: str, *, attempts: int, last_error: Optional[str] = None):
        super().__init__(message)
        self.attempts = attempts
        self.last_error = last_error


# ─── Per-question STT ────────────────────────────────────────────────────────


async def _transcribe_one_full(audio_bytes: bytes) -> Dict[str, Any]:
    """Full mode: transcode + Azure. Returns the full Azure dict on success
    or raises StructuredEvaluatorFailure with a clear message."""
    try:
        wav_bytes = await transcode_to_wav(audio_bytes)
    except Exception as exc:
        raise StructuredEvaluatorFailure(
            f"audio transcode failed: {exc!r}", attempts=0
        ) from exc

    azure = await run_azure_pronunciation(wav_bytes, reference_text="")
    if "error" in azure or not azure.get("recognized_text"):
        raise StructuredEvaluatorFailure(
            f"azure failed: {azure.get('error', 'no transcript')}",
            attempts=0,
            last_error=str(azure.get("details") or azure.get("error") or ""),
        )
    return azure


async def _transcribe_one_basic(audio_bytes: bytes) -> str:
    """Basic mode: Whisper transcript only."""
    try:
        text = await _default_whisper_transcribe(audio_bytes)
    except Exception as exc:
        raise StructuredEvaluatorFailure(
            f"transcription failed: {exc!r}", attempts=0
        ) from exc
    if not text or not text.strip():
        raise StructuredEvaluatorFailure("empty transcript from whisper", attempts=0)
    return text


# ─── Sonnet prompt for the structured per-question shape ─────────────────────


_SYSTEM_PROMPT = """You are a senior IELTS Speaking examiner. You will evaluate
a Smart Practice session in which a candidate answered a sequence of questions
within a single Speaking Part. Award ONE holistic band per criterion (FC, LR,
GRA, PR) over the whole session AND give a per-question indicative_band plus a
short observation. Per-question indicative bands are informational; the holistic
session band is what the student is graded on.

Style:
- Be direct, calibrated to public IELTS B4-9 descriptors. Do not inflate.
- Strengths/weaknesses must cite evidence visible in transcripts (or, in full
  mode, the Azure pronunciation block).
- Reply in the requested feedback language for explanations / observations /
  liz_note. Keep band numbers in numeric form.
- Output STRICT JSON. No markdown fences. No preamble.
{mode_instruction}
"""

_BASIC_MODE_INSTRUCTION = (
    "\n- BASIC MODE: You do not have Azure phoneme data. Score PR from "
    "transcript-level cues using public B4-9 descriptors (do NOT invent IPA, "
    "do NOT assert specific phoneme errors). Use the full B4-9 range; "
    "transcript-only mode is not a reason to compress scores."
)


_USER_TEMPLATE = """## Context
- Part: {part}
- Topic: {topic}
- Target band: {target_band}
- Feedback language: {user_language}
- Number of questions: {n_questions}

## Aggregate fluency (across the whole session)
- duration_total: {total_duration:.1f}s · words_total: {total_words} · WPM: {agg_wpm}
- pauses: {total_pauses} · filled_pauses: {total_filled}
- unique/total: {total_unique}/{total_words}

## Per-question transcripts
{per_question_block}

## Required JSON shape (strict — no fences, no extras)

{{
  "feedback_language": "{user_language}",
  "scores": {{"overall": <0.5-step>, "target": {target_band}, "fc": <0.5-step>, "lr": <0.5-step>, "gra": <0.5-step>, "pr": <0.5-step>}},
  "criteria": {{
    "fc":  {{"band": <0.5-step>, "explanation": "<1-3 sentences citing evidence across questions>", "strengths": ["<observed>"], "weaknesses": ["<observed>"]}},
    "lr":  {{"band": <0.5-step>, "explanation": "<1-3 sentences>", "strengths": ["<observed>"], "weaknesses": ["<observed>"]}},
    "gra": {{"band": <0.5-step>, "explanation": "<1-3 sentences>", "strengths": ["<observed>"], "weaknesses": ["<observed>"]}},
    "pr":  {{"band": <0.5-step>, "explanation": "<1-3 sentences>", "strengths": ["<observed>"], "weaknesses": ["<observed>"]}}
  }},
  "questions": [
    {{"index": 1, "indicative_band": <0.5-step>, "observation": "<1-2 sentences specific to this answer>"}}
    {extra_question_examples}
  ],
  "liz_note": "<3-4 sentences naming ONE pattern across the session and ONE concrete next step>"
}}
"""


def _format_per_question_block(
    questions: List[Dict[str, Any]],
    *,
    full_mode: bool,
) -> str:
    lines: List[str] = []
    for i, q in enumerate(questions, start=1):
        flu = q["fluency"]
        lines.append(f"### Q{i}: {q['question']}")
        lines.append(
            f"- Duration: {flu['duration_display']} · WPM: {flu['wpm']} · Words: {flu['words_total']}"
        )
        lines.append(f"- Transcript: {q['transcript']}")
        if full_mode and q.get("azure_block"):
            lines.append(q["azure_block"])
        lines.append("")
    return "\n".join(lines)


def _build_extra_examples(n: int) -> str:
    if n <= 1:
        return ""
    return "".join(
        f',\n    {{"index": {i}, "indicative_band": <0.5-step>, "observation": "<1-2 sentences>"}}'
        for i in range(2, n + 1)
    )


# ─── Result composition / validation ─────────────────────────────────────────


def _coerce_band(v: Any, *, default: float = 5.5) -> float:
    try:
        n = float(v)
    except (TypeError, ValueError):
        return default
    if n < 0:
        n = 0.0
    if n > 9:
        n = 9.0
    # round to 0.5
    return round(n * 2) / 2


def _validate_payload(data: Dict[str, Any], n_questions: int) -> Dict[str, Any]:
    if not isinstance(data, dict):
        raise ValueError("payload is not an object")
    scores = data.get("scores") or {}
    criteria = data.get("criteria") or {}
    questions = data.get("questions") or []
    if not isinstance(questions, list):
        raise ValueError("questions must be a list")
    if len(questions) != n_questions:
        # Sonnet sometimes returns extra/short — pad or truncate but flag.
        logger.warning(
            "Sonnet returned %d question entries, expected %d — adjusting.",
            len(questions), n_questions,
        )
    for key in ("fc", "lr", "gra", "pr"):
        if key not in criteria:
            raise ValueError(f"criteria.{key} missing")
        c = criteria[key]
        if "band" not in c or "explanation" not in c:
            raise ValueError(f"criteria.{key} missing band/explanation")

    return {
        "feedback_language": (data.get("feedback_language") or "en")[:5],
        "scores": {
            "overall": _coerce_band(scores.get("overall")),
            "target": _coerce_band(scores.get("target"), default=7.0),
            "fc": _coerce_band(scores.get("fc")),
            "lr": _coerce_band(scores.get("lr")),
            "gra": _coerce_band(scores.get("gra")),
            "pr": _coerce_band(scores.get("pr")),
        },
        "criteria": {
            k: {
                "band": _coerce_band(criteria[k].get("band")),
                "explanation": str(criteria[k].get("explanation", "")).strip()[:600],
                "strengths": [
                    str(s).strip()[:240]
                    for s in (criteria[k].get("strengths") or [])
                ][:4],
                "weaknesses": [
                    str(w).strip()[:240]
                    for w in (criteria[k].get("weaknesses") or [])
                ][:4],
            }
            for k in ("fc", "lr", "gra", "pr")
        },
        "questions": [
            {
                "index": int(q.get("index") or i + 1),
                "indicative_band": _coerce_band(q.get("indicative_band")),
                "observation": str(q.get("observation", "")).strip()[:600],
            }
            for i, q in enumerate(questions[:n_questions])
        ],
        "liz_note": str(data.get("liz_note", "")).strip()[:1500],
    }


# ─── Public entry ────────────────────────────────────────────────────────────


async def evaluate_speaking_practice_structured(
    *,
    part: str,
    topic: str,
    target_band: float,
    user_language: str,
    questions: List[Dict[str, Any]],   # [{question, audio_bytes, audio_url, duration_seconds}]
    mode: str,                         # "full" | "basic"
) -> Dict[str, Any]:
    """Orchestrate per-question STT + single Sonnet pass. Returns a dict
    suitable for direct JSON response + Mongo persistence."""
    if not questions:
        raise StructuredEvaluatorFailure("no questions provided", attempts=0)

    full_mode = (mode == "full")

    # Per-question STT in parallel.
    if full_mode:
        stt_tasks = [_transcribe_one_full(q["audio_bytes"]) for q in questions]
    else:
        stt_tasks = [_transcribe_one_basic(q["audio_bytes"]) for q in questions]

    stt_results = await asyncio.gather(*stt_tasks, return_exceptions=True)

    enriched: List[Dict[str, Any]] = []
    for q, stt in zip(questions, stt_results):
        if isinstance(stt, Exception):
            # Graceful degradation: a single failed question shouldn't kill the
            # whole eval — we surface an empty transcript so Sonnet can still
            # score the rest. Front-end shows a small notice on that tab.
            logger.warning("STT failed for question: %s", stt)
            transcript = ""
            azure: Dict[str, Any] = {}
        elif full_mode:
            azure = stt  # type: ignore[assignment]
            transcript = azure.get("recognized_text", "")
        else:
            azure = {}
            transcript = stt  # type: ignore[assignment]

        duration = float(q.get("duration_seconds") or 0.0)
        fluency = compute_fluency(transcript, duration)

        item = {
            "question": q["question"],
            "audio_url": q["audio_url"],
            "duration_seconds": duration,
            "transcript": transcript,
            "fluency": fluency,
        }
        if full_mode and azure:
            item["azure_block"] = _build_azure_block(azure)
            pron, word_results = _build_deep_feedback_bundle(azure)
            if pron is not None:
                item["pronunciation_analysis"] = pron
            if word_results is not None:
                item["word_level_results"] = word_results
        enriched.append(item)

    # Aggregate fluency for the prompt header.
    total_duration = sum(q["duration_seconds"] for q in enriched)
    total_words = sum(q["fluency"]["words_total"] for q in enriched)
    total_unique = sum(q["fluency"]["unique_count"] for q in enriched)
    total_pauses = sum(q["fluency"]["pauses"] for q in enriched)
    total_filled = sum(q["fluency"]["filled_pauses"] for q in enriched)
    minutes = total_duration / 60.0 if total_duration > 0 else 0.0
    agg_wpm = int(round(total_words / minutes)) if minutes > 0 else 0

    # Build prompts.
    n = len(enriched)
    user_prompt = _USER_TEMPLATE.format(
        part=part,
        topic=topic,
        target_band=target_band,
        user_language=user_language,
        n_questions=n,
        total_duration=total_duration,
        total_words=total_words,
        total_unique=total_unique,
        total_pauses=total_pauses,
        total_filled=total_filled,
        agg_wpm=agg_wpm,
        per_question_block=_format_per_question_block(enriched, full_mode=full_mode),
        extra_question_examples=_build_extra_examples(n),
    )
    system_prompt = _SYSTEM_PROMPT.format(
        mode_instruction=("" if full_mode else _BASIC_MODE_INSTRUCTION),
    )

    model = liz_llm.deep_model()
    last_error: Optional[str] = None
    parsed: Optional[Dict[str, Any]] = None

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
            logger.warning("Structured eval attempt %d timed out", attempt)
        except Exception as exc:
            last_error = f"llm_error: {exc!r}"
            logger.warning("Structured eval attempt %d LLM error: %s", attempt, exc)
        else:
            latency = time.monotonic() - started
            payload = _extract_json(reply)
            try:
                data = json.loads(payload)
            except json.JSONDecodeError as exc:
                last_error = f"invalid_json: {exc}"
                logger.warning(
                    "Structured eval attempt %d invalid JSON (%.1fs): %s",
                    attempt, latency, exc,
                )
            else:
                try:
                    parsed = _validate_payload(data, n_questions=n)
                except Exception as exc:
                    last_error = f"schema: {exc}"
                    logger.warning(
                        "Structured eval attempt %d failed schema: %s",
                        attempt, last_error,
                    )
                else:
                    logger.info(
                        "Structured eval succeeded attempt %d (%.1fs, overall %s)",
                        attempt, latency, parsed["scores"]["overall"],
                    )
                    break

        if attempt < MAX_ATTEMPTS:
            await asyncio.sleep(BACKOFF_SCHEDULE[min(attempt - 1, len(BACKOFF_SCHEDULE) - 1)])

    if parsed is None:
        raise StructuredEvaluatorFailure(
            "structured speaking evaluator failed to produce a valid result.",
            attempts=MAX_ATTEMPTS,
            last_error=last_error,
        )

    # Compose final per-question payload by merging Sonnet's per-question
    # judgement with our locally-known transcript / audio_url / fluency / pron.
    questions_out: List[Dict[str, Any]] = []
    sonnet_by_index = {q["index"]: q for q in parsed["questions"]}
    for i, item in enumerate(enriched, start=1):
        sjudge = sonnet_by_index.get(i, {})
        out: Dict[str, Any] = {
            "index": i,
            "question": item["question"],
            "audio_url": item["audio_url"],
            "duration_seconds": item["duration_seconds"],
            "transcript": item["transcript"],
            "fluency": _public_fluency(item["fluency"]),
            "indicative_band": sjudge.get("indicative_band", 5.5),
            "observation": sjudge.get("observation", ""),
        }
        if "pronunciation_analysis" in item:
            out["pronunciation_analysis"] = item["pronunciation_analysis"]
        if "word_level_results" in item:
            out["word_level_results"] = item["word_level_results"]
        questions_out.append(out)

    return {
        "mode": mode,
        "feedback_language": parsed["feedback_language"],
        "scores": parsed["scores"],
        "criteria": parsed["criteria"],
        "liz_note": parsed["liz_note"],
        "questions": questions_out,
        "aggregate_fluency": {
            "wpm": agg_wpm,
            "words_total": total_words,
            "unique_count": total_unique,
            "duration_seconds": total_duration,
            "pauses": total_pauses,
            "filled_pauses": total_filled,
        },
    }


def _public_fluency(flu: Dict[str, Any]) -> Dict[str, Any]:
    """Strip internal raw fields, keep the display shape the UI expects."""
    return {
        "wpm": flu["wpm"],
        "words": flu["words_total"],
        "unique": flu["unique_display"],
        "pauses": flu["pauses_display"],
        "fillers": flu["fillers_display"],
        "duration": flu["duration_display"],
    }
