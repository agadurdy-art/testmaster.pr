"""
Prompt loading / template substitution / JSON extraction for the speaking
evaluator, plus the SpeakingEvaluatorFailure error type they raise.

Split out of services/speaking_evaluator.py (2026-07-02 refactor); behavior
unchanged. PROMPT_FILE still points at backend/prompts/speaking-evaluator-v2.md
(one extra `.parent` because this module sits one level deeper).
"""
from __future__ import annotations

import re
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, Optional, Tuple

from schemas.speaking_evaluator import SpeakingPart

PROMPT_FILE = (
    Path(__file__).resolve().parent.parent.parent
    / "prompts"
    / "speaking-evaluator-v2.md"
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


# ─── Response parsing ────────────────────────────────────────────────────────


def _extract_json(text: str) -> str:
    stripped = (text or "").strip()
    if stripped.startswith("```"):
        fence = _FENCE_RE.search(stripped)
        if fence:
            return fence.group(1).strip()
    match = _JSON_BLOCK_RE.search(stripped)
    return (match.group(0) if match else stripped).strip()


# ─── Full Test prompt rendering ──────────────────────────────────────────────

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

If a part's transcript reads exactly "[No response was recorded for this part.]",
that part was NOT attempted: base the holistic band ONLY on the parts that were
recorded, set that part's indicative_band to 0, and note in liz_note that the
score reflects the recorded parts and the missing part should be re-recorded for
a complete result. Never penalise the recorded parts for the missing one.

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
