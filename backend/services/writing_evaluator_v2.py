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
  7. Fail fast on the first error — callers return HTTP 502 with detail.
     RATIONALE: prior policy retried 3 × 90s timeouts, allowing worst case
     ~274s to pass through the FastAPI proxy and surface as a 503 to the
     browser. Each attempt was an independent Sonnet call (~$0.05 input +
     ~$0.03 output cached). A flaky network triggering browser-side retry
     on top of three server-side attempts multiplied the bill 9×. We now
     run one attempt; transient rate-limit errors are surfaced for the
     client to retry with the same `client_request_id` (idempotency cache
     short-circuits double-billing). See `writing_idempotency.py`.
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

# Single-shot: see module docstring rationale. The evaluator is fail-fast.
# Callers (route layer) wrap us with an idempotency cache so the *client*
# can retry on transient errors without re-billing the LLM.
MAX_ATTEMPTS = 1
# Real-world payloads (4 criteria + ~12 annotations + improved_version + coaching)
# land around 1500–2200 output tokens *on average*, but heavy-feedback essays
# (long improved_version, more annotations) reach ~2800–3200. Production
# observed truncation at char ~10033 ≈ 2866 tokens on 2026-05-13 with the
# previous 2500 cap → invalid_json → 502. 4000 leaves ~25% headroom over the
# observed truncation point while still bounding cost (~38% above mean usage).
MAX_TOKENS = 4000
# 75s leaves comfortable headroom under typical FastAPI/proxy 120s timeouts.
# Sonnet p99 for this prompt is ~35s; if we're past 75s the call is dead
# and we should surface failure to the user, not keep waiting.
CALL_TIMEOUT_SECONDS = 75.0


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
    """Run a single Sonnet evaluation. Fail-fast: any error (timeout, LLM
    error, malformed JSON, schema mismatch, offset drift) raises
    EvaluatorFailure immediately so the route can return a structured 502.

    The route layer is responsible for idempotency (so a client retrying
    with the same `client_request_id` reuses any prior success) and for
    surfacing a retry-friendly error to the UI."""
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
    started = time.monotonic()

    try:
        reply = await asyncio.wait_for(
            liz_llm.complete(
                system=system_prompt,
                user_message=user_prompt,
                model=model,
                max_tokens=MAX_TOKENS,
                task="eval",
                # The 230-line IELTS rubric is identical across every
                # evaluation; caching it drops repeat-call input cost
                # ~10×. First call seeds the cache (~5 min ephemeral).
                cache_system=True,
                scope="writing_eval_v2",
            ),
            timeout=CALL_TIMEOUT_SECONDS,
        )
    except asyncio.TimeoutError:
        last_error = f"timeout after {CALL_TIMEOUT_SECONDS}s"
        logger.warning("Evaluator timed out (%.1fs)", CALL_TIMEOUT_SECONDS)
        raise EvaluatorFailure(
            "Writing evaluator timed out.",
            attempts=1, last_error=last_error,
        )
    except Exception as exc:
        last_error = f"llm_error: {exc!r}"
        logger.warning("Evaluator LLM error: %s", exc)
        raise EvaluatorFailure(
            "Writing evaluator LLM call failed.",
            attempts=1, last_error=last_error,
        )

    latency = time.monotonic() - started
    payload = _extract_json(reply)
    try:
        data = json.loads(payload)
    except json.JSONDecodeError as exc:
        last_error = f"invalid_json: {exc}"
        logger.warning(
            "Evaluator produced invalid JSON (latency %.1fs): %s", latency, exc,
        )
        raise EvaluatorFailure(
            "Writing evaluator returned malformed JSON.",
            attempts=1, last_error=last_error,
        )

    try:
        result = WritingEvaluationResult.model_validate(data)
    except ValidationError as exc:
        last_error = f"schema: {exc.errors()[:3]}"
        logger.warning("Evaluator failed schema: %s", last_error)
        raise EvaluatorFailure(
            "Writing evaluator output failed schema validation.",
            attempts=1, last_error=last_error,
        )

    # Repair model-side offset drift (UTF-16 vs grapheme counts, smart
    # quotes, CRLF, …) before the strict verifier runs.
    _, dropped = _realign_annotations(result, req.essay_text)
    if dropped:
        logger.info(
            "Evaluator dropped %d unalignable annotations: %s",
            len(dropped), dropped[:5],
        )
    offset_errors = verify_annotation_offsets(result, req.essay_text)
    if offset_errors:
        last_error = "offsets: " + "; ".join(offset_errors[:3])
        logger.warning("Evaluator offset errors after realign: %s", last_error)
        raise EvaluatorFailure(
            "Writing evaluator produced unalignable annotations.",
            attempts=1, last_error=last_error,
        )

    logger.info(
        "Evaluator succeeded (latency %.1fs, band %s, %d annotations, %d dropped)",
        latency, result.overall_band,
        len(result.inline_annotations), len(dropped),
    )
    return result


def health() -> dict:
    """Lightweight status — intentionally does NOT hit the LLM."""
    return {
        "prompt_file_exists": PROMPT_FILE.exists(),
        "model": liz_llm.deep_model(),
        "provider": liz_llm.active_provider(),
    }
