"""
Writing Evaluator v2
====================
Claude Sonnet-backed IELTS Writing evaluator that emits the structured
`WritingEvaluationResult` payload: 4-criterion bands, inline annotations
with UTF-16 offsets, an improved_version rewrite, multilingual feedback.

Pipeline:
  1. Load the system+user prompt templates from
     backend/prompts/writing-evaluator-v2.md
  2. Substitute variables; wrap essay in <user_submission> tags
     (prompt injection defense)
  3. Call the deep Liz LLM (Claude Sonnet) with a high token budget
  4. Extract JSON from the reply (tolerates occasional fences)
  5. Validate via Pydantic (WritingEvaluationResult)
  6. Verify annotation offsets point into the original essay (UTF-16)
  7. Retry up to MAX_ATTEMPTS times with exponential backoff on failure
  8. On persistent failure raise EvaluatorFailure — callers return HTTP 502
"""
from __future__ import annotations

import asyncio
import json
import logging
import os
import re
import time
from functools import lru_cache
from pathlib import Path
from typing import Optional, Tuple

from pydantic import ValidationError

from schemas.writing_evaluator import (
    WritingEvaluationRequest,
    WritingEvaluationResult,
    verify_annotation_offsets,
)
from services import liz_llm

logger = logging.getLogger(__name__)

PROMPT_FILE = (
    Path(__file__).resolve().parent.parent / "prompts" / "writing-evaluator-v2.md"
)

MAX_ATTEMPTS = 3
BACKOFF_SCHEDULE = (1.0, 3.0)  # seconds between attempts 1→2 and 2→3
MAX_TOKENS = 4096               # annotations + improved_version can be long
CALL_TIMEOUT_SECONDS = 90.0


class EvaluatorFailure(RuntimeError):
    """Raised when the evaluator cannot produce a valid payload."""

    def __init__(self, message: str, *, attempts: int, last_error: Optional[str] = None):
        super().__init__(message)
        self.attempts = attempts
        self.last_error = last_error


# ─── Prompt loading ──────────────────────────────────────────────────────────

_FENCE_RE = re.compile(r"```(?:[a-zA-Z0-9_-]*)\s*\n(.*?)\n```", re.DOTALL)


@lru_cache(maxsize=1)
def _load_prompt_blocks() -> Tuple[str, str]:
    """Parse prompt file, returning (system_template, user_template).

    The markdown file has the system prompt in the first fenced code block
    under '## System Prompt Template' and the user prompt in the first fenced
    block under '## User Prompt Template'. If the file format changes, this
    parser will surface a clear error.
    """
    if not PROMPT_FILE.exists():
        raise EvaluatorFailure(
            f"Prompt file missing: {PROMPT_FILE}", attempts=0
        )
    text = PROMPT_FILE.read_text(encoding="utf-8")
    system_marker = "## System Prompt Template"
    user_marker = "## User Prompt Template"
    if system_marker not in text or user_marker not in text:
        raise EvaluatorFailure(
            "Prompt file missing expected section headers", attempts=0
        )
    after_system, _, rest = text.partition(system_marker)
    user_part = rest.split(user_marker, 1)
    if len(user_part) != 2:
        raise EvaluatorFailure("User prompt section not found", attempts=0)
    system_section = user_part[0]
    user_section = user_part[1]

    def _first_fence(block: str) -> str:
        match = _FENCE_RE.search(block)
        if not match:
            raise EvaluatorFailure(
                "Prompt section has no fenced code block", attempts=0
            )
        return match.group(1).strip()

    return _first_fence(system_section), _first_fence(user_section)


def _substitute(template: str, **values: str) -> str:
    """Jinja-lite `{{var}}` substitution, safe against stray braces in user data."""
    result = template
    for key, val in values.items():
        result = result.replace(f"{{{{{key}}}}}", str(val))
    return result


# ─── Response parsing ────────────────────────────────────────────────────────

_JSON_BLOCK_RE = re.compile(r"\{[\s\S]*\}")


def _extract_json(text: str) -> str:
    """Pull the JSON payload out of a model reply that may include code fences."""
    stripped = text.strip()
    if stripped.startswith("```"):
        fence = _FENCE_RE.search(stripped)
        if fence:
            return fence.group(1).strip()
    # Otherwise take the outermost {...} block
    match = _JSON_BLOCK_RE.search(stripped)
    return (match.group(0) if match else stripped).strip()


# ─── Annotation realignment ──────────────────────────────────────────────────


def _utf16_len(s: str) -> int:
    """Length in UTF-16 code units (matches JS string indexing + frontend)."""
    return len(s.encode("utf-16-le")) // 2


def _utf16_slice(essay: str, start: int, end: int) -> str:
    """Slice an essay by UTF-16 code-unit offsets."""
    buf = essay.encode("utf-16-le")
    return buf[start * 2 : end * 2].decode("utf-16-le", errors="replace")


def _utf16_index(essay: str, needle: str, start_hint: int = 0) -> int:
    """Find `needle` in `essay` and return its start offset in UTF-16 code
    units, preferring the occurrence closest to `start_hint`. Returns -1 if
    not found."""
    if not needle:
        return -1
    # Naive linear scan on the Python string, then convert the match offset
    # into UTF-16 code units. Good enough for essay-sized inputs.
    best = -1
    best_distance = 10**9
    search_from = 0
    while True:
        idx = essay.find(needle, search_from)
        if idx < 0:
            break
        u16_idx = _utf16_len(essay[:idx])
        distance = abs(u16_idx - start_hint)
        if distance < best_distance:
            best = u16_idx
            best_distance = distance
        search_from = idx + 1
    return best


def _realign_annotations(result, essay_text: str) -> Tuple[list, list]:
    """For each annotation, make sure UTF-16[start:end] == original_text.

    If it doesn't match, try to find `original_text` in the essay (preferring
    the occurrence closest to the model's claimed offset) and rewrite the
    offsets. If we still can't line it up, drop the annotation.

    Returns (kept_annotations, dropped_ids) for logging.
    """
    kept = []
    dropped: list = []
    essay_u16_len = _utf16_len(essay_text)

    for ann in result.inline_annotations:
        # Fast path: offsets already land on original_text.
        if ann.end_offset <= essay_u16_len:
            sliced = _utf16_slice(essay_text, ann.start_offset, ann.end_offset)
            if sliced == ann.original_text:
                kept.append(ann)
                continue

        # Try to re-find original_text in the essay.
        found = _utf16_index(essay_text, ann.original_text, start_hint=ann.start_offset)
        if found >= 0:
            new_end = found + _utf16_len(ann.original_text)
            if new_end <= essay_u16_len:
                ann.start_offset = found
                ann.end_offset = new_end
                kept.append(ann)
                continue

        # Unrecoverable — drop it rather than fail the whole evaluation.
        dropped.append(ann.id)

    # Renumber ids so the UI's ann_1, ann_2, ... stays contiguous after drops.
    for i, ann in enumerate(kept, start=1):
        ann.id = f"ann_{i}"

    result.inline_annotations = kept
    return kept, dropped


# ─── Public entry point ──────────────────────────────────────────────────────


async def evaluate_writing(req: WritingEvaluationRequest) -> WritingEvaluationResult:
    """Run a single evaluation with retries. Raises EvaluatorFailure on persistent
    error. Returns a validated WritingEvaluationResult with annotation offsets
    checked against the submitted essay."""
    system_template, user_template = _load_prompt_blocks()

    # Decide target word count from the hint (or default 250 for task2, 150 for task1).
    task_hint = req.task_type_hint.value if req.task_type_hint else "task2_opinion"
    word_count_target = 150 if task_hint.startswith("task1_") else 250

    system_prompt = _substitute(system_template, user_language=req.user_language)
    user_prompt = _substitute(
        user_template,
        task_type_hint=task_hint,
        word_count_target=str(word_count_target),
        user_language=req.user_language,
        task_prompt=req.task_prompt,
        essay_text=req.essay_text,
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
            logger.warning("Evaluator attempt %d timed out", attempt)
        except Exception as exc:
            last_error = f"llm_error: {exc!r}"
            logger.warning("Evaluator attempt %d LLM error: %s", attempt, exc)
        else:
            latency = time.monotonic() - started
            payload = _extract_json(reply)
            try:
                data = json.loads(payload)
            except json.JSONDecodeError as exc:
                last_error = f"invalid_json: {exc}"
                logger.warning(
                    "Evaluator attempt %d produced invalid JSON (latency %.1fs): %s",
                    attempt, latency, exc,
                )
            else:
                try:
                    result = WritingEvaluationResult.model_validate(data)
                except ValidationError as exc:
                    last_error = f"schema: {exc.errors()[:3]}"
                    logger.warning("Evaluator attempt %d failed schema: %s", attempt, last_error)
                else:
                    # Repair model-side offset drift (UTF-16 vs grapheme counts,
                    # smart quotes, CRLF, …) before the strict verifier runs.
                    _, dropped = _realign_annotations(result, req.essay_text)
                    if dropped:
                        logger.info(
                            "Evaluator attempt %d dropped %d unalignable annotations: %s",
                            attempt, len(dropped), dropped[:5],
                        )
                    offset_errors = verify_annotation_offsets(result, req.essay_text)
                    if offset_errors:
                        # Should be empty after realignment. If any survive,
                        # something is very wrong with this attempt — retry.
                        last_error = "offsets: " + "; ".join(offset_errors[:3])
                        logger.warning("Evaluator attempt %d offset errors after realign: %s", attempt, last_error)
                    else:
                        logger.info(
                            "Evaluator succeeded on attempt %d (latency %.1fs, band %s, %d annotations, %d dropped)",
                            attempt, latency, result.overall_band,
                            len(result.inline_annotations), len(dropped),
                        )
                        return result

        if attempt < MAX_ATTEMPTS:
            delay = BACKOFF_SCHEDULE[min(attempt - 1, len(BACKOFF_SCHEDULE) - 1)]
            await asyncio.sleep(delay)

    raise EvaluatorFailure(
        "Writing evaluator failed to produce a valid result.",
        attempts=MAX_ATTEMPTS,
        last_error=last_error,
    )


def health() -> dict:
    """Lightweight status — intentionally does NOT hit the LLM."""
    return {
        "prompt_file_exists": PROMPT_FILE.exists(),
        "model": liz_llm.deep_model(),
        "provider": liz_llm.active_provider(),
    }
