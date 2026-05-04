"""
Sonnet-powered root_cause_analysis + study_plan refinement for Reading and
Listening question-bank evaluations.

Background
----------
listening_qb.py and reading_qb.py compute deterministic, keyword-based
`root_cause_analysis` and `study_plan` blocks from each missed item's
`skill_tested` tags. Those builders are fast and reliable but generic — they
can only describe a broad sub-skill (e.g. "matching"), not WHY the candidate
got specific items wrong.

This module wraps a single Sonnet call that re-reads the actual mistakes
(question stem, user answer, correct answer, evidence text) and emits a
candidate-specific narrative in the SAME schema as the deterministic builders.
The route handlers then merge: Sonnet output replaces the deterministic blocks
when the call succeeds, and the deterministic output is kept when Sonnet
fails (timeout, schema mismatch, key missing) so a slow/broken LLM never
breaks an evaluation response.

Gating
------
Disabled by default. Enable via env `SONNET_QB_ANALYSIS_ENABLED=true`.
This avoids latency regression on every QB submission and lets us A/B the
narrative quality before flipping the default.
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
import re
import time
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

# Single retry — this is best-effort enrichment, not the primary signal.
MAX_ATTEMPTS = 2
MAX_TOKENS = 1500
CALL_TIMEOUT_SECONDS = 30.0

_FENCE_RE = re.compile(r"```(?:json)?\s*(\{.*?\})\s*```", re.DOTALL)
_JSON_BLOCK_RE = re.compile(r"\{.*\}", re.DOTALL)


def is_enabled() -> bool:
    """Feature gate. Default off so we don't add latency to every submission."""
    raw = os.environ.get("SONNET_QB_ANALYSIS_ENABLED", "")
    return raw.strip().lower() in {"1", "true", "yes", "on"}


def _extract_json(text: str) -> str:
    stripped = (text or "").strip()
    if stripped.startswith("```"):
        fence = _FENCE_RE.search(stripped)
        if fence:
            return fence.group(1).strip()
    match = _JSON_BLOCK_RE.search(stripped)
    return (match.group(0) if match else stripped).strip()


_SYSTEM_PROMPT = """You are an IELTS examiner reviewing a candidate's mistakes on a {skill} question bank set. Produce a tight, candidate-specific diagnosis in the JSON shape requested. Do NOT invent mistakes the candidate did not make. Reason ONLY from the supplied data. Keep language plain, neutral, and actionable — no praise, no judgement, no IELTS jargon beyond standard sub-skill names."""


_USER_TEMPLATE = """## Candidate result
- Skill: {skill}
- Score: {correct}/{total} ({percentage:.0f}%) → estimated band {band}
- Weak sub-skills (auto-tagged from mistakes): {weak}

## Mistakes (verbatim, up to 12 most recent)
{mistakes_block}

## Required JSON shape (strict — no fences, no extras)

{{
  "root_cause_analysis": [
    {{
      "code": "<lowercase_snake_case e.g. specific_information>",
      "label": "<Title Case>",
      "count": <integer count of mistakes attributable>,
      "impact": "<high|medium|targeted>",
      "what_it_means": "<1-2 sentences specific to THIS candidate's mistakes, not generic. Cite the pattern you saw.>"
    }}
  ],
  "study_plan": {{
    "target_band": <number, e.g. 6.5>,
    "priority_skill": "<the single sub-skill most worth fixing first>",
    "top_root_cause": "<code from root_cause_analysis[0]>",
    "roadmap_steps": [
      {{"title": "<short imperative>", "why_now": "<1 sentence tied to the candidate's mistake pattern>"}},
      {{"title": "<short imperative>", "why_now": "<1 sentence>"}},
      {{"title": "<short imperative>", "why_now": "<1 sentence>"}}
    ],
    "three_day_plan": [
      "Day 1: <concrete action grounded in their actual misses>",
      "Day 2: <concrete action>",
      "Day 3: <concrete action>"
    ],
    "retest_strategy": "<1-2 sentences on how to verify improvement>"
  }}
}}

Rules:
- Up to 4 root_cause entries, ordered by impact (most damaging first).
- impact = high if count >= 3, medium if count == 2, otherwise targeted.
- target_band = current band + 0.5 if band < 6.5 else current band + 1.0, capped at 9.0, in 0.5 increments.
- Reference the candidate's actual wrong answers / evidence in `what_it_means` and `why_now`.
- Output: one JSON object, nothing else.
"""


def _format_mistakes(mistakes: List[Dict[str, Any]]) -> str:
    """Compact verbatim mistake block for the prompt. Keeps the call cheap."""
    if not mistakes:
        return "(no mistakes — all answers correct)"
    lines: List[str] = []
    for i, m in enumerate(mistakes[:12], 1):
        question = (m.get("question") or m.get("question_text") or "").strip()
        if len(question) > 220:
            question = question[:217] + "..."
        ua = m.get("user_answer", "")
        if isinstance(ua, list):
            ua = ", ".join(str(x) for x in ua)
        ca = m.get("correct_answer", "")
        if isinstance(ca, list):
            ca = ", ".join(str(x) for x in ca)
        evidence = (
            m.get("passage_excerpt")
            or m.get("evidence_text")
            or m.get("explanation")
            or ""
        ).strip()
        if len(evidence) > 240:
            evidence = evidence[:237] + "..."
        skill = m.get("skill_tested") or m.get("skills") or []
        if isinstance(skill, list):
            skill = ", ".join(str(s) for s in skill)
        reason = m.get("reason_label") or m.get("reason_code") or ""
        lines.append(
            f"{i}. Q: {question}\n   user_answer: {ua!s}\n   correct: {ca!s}"
            + (f"\n   tagged_skill: {skill}" if skill else "")
            + (f"\n   reason: {reason}" if reason else "")
            + (f"\n   evidence: {evidence}" if evidence else "")
        )
    return "\n".join(lines)


def _validate_payload(data: Any) -> Optional[Dict[str, Any]]:
    """Soft-validate the Sonnet JSON. Returns the dict if it has the required
    shape, otherwise None — callers fall back to deterministic builders."""
    if not isinstance(data, dict):
        return None

    rca = data.get("root_cause_analysis")
    plan = data.get("study_plan")
    if not isinstance(rca, list) or not isinstance(plan, dict):
        return None

    cleaned_rca: List[Dict[str, Any]] = []
    for entry in rca[:4]:
        if not isinstance(entry, dict):
            continue
        code = str(entry.get("code") or "").strip().lower()
        label = str(entry.get("label") or "").strip()
        what = str(entry.get("what_it_means") or "").strip()
        if not (code and label and what):
            continue
        try:
            count = int(entry.get("count") or 0)
        except (TypeError, ValueError):
            count = 0
        impact = str(entry.get("impact") or "").strip().lower()
        if impact not in {"high", "medium", "targeted"}:
            impact = "high" if count >= 3 else "medium" if count == 2 else "targeted"
        cleaned_rca.append({
            "code": code,
            "label": label,
            "count": count,
            "impact": impact,
            "what_it_means": what,
        })
    if not cleaned_rca:
        return None

    roadmap = plan.get("roadmap_steps") or []
    if not isinstance(roadmap, list):
        roadmap = []
    cleaned_roadmap: List[Dict[str, Any]] = []
    for step in roadmap[:5]:
        if not isinstance(step, dict):
            continue
        title = str(step.get("title") or "").strip()
        why = str(step.get("why_now") or "").strip()
        if not title or not why:
            continue
        out: Dict[str, Any] = {"title": title, "why_now": why}
        if step.get("route"):
            out["route"] = str(step["route"])
        cleaned_roadmap.append(out)
    if not cleaned_roadmap:
        return None

    three_day = plan.get("three_day_plan") or []
    if not isinstance(three_day, list) or len(three_day) < 1:
        return None
    three_day = [str(x).strip() for x in three_day[:3] if str(x).strip()]
    if not three_day:
        return None

    try:
        target_band = float(plan.get("target_band"))
    except (TypeError, ValueError):
        target_band = 0.0

    cleaned_plan = {
        "target_band": target_band,
        "priority_skill": str(plan.get("priority_skill") or cleaned_rca[0]["label"]),
        "top_root_cause": str(plan.get("top_root_cause") or cleaned_rca[0]["code"]),
        "roadmap_steps": cleaned_roadmap,
        "three_day_plan": three_day,
        "retest_strategy": str(plan.get("retest_strategy") or "").strip()
            or "Retake a fresh set and compare the same weak skill before and after focused review.",
    }

    return {
        "root_cause_analysis": cleaned_rca,
        "study_plan": cleaned_plan,
    }


async def sonnet_root_cause_and_plan(
    *,
    skill: str,
    mistakes: List[Dict[str, Any]],
    weak_skills: List[str],
    correct: int,
    total: int,
    percentage: float,
    estimated_band: float,
) -> Optional[Dict[str, Any]]:
    """Best-effort Sonnet enrichment for root_cause_analysis + study_plan.

    Returns a dict with keys `root_cause_analysis` and `study_plan` matching
    the deterministic builders' shape, or None if Sonnet is disabled, the
    call fails, or the response cannot be validated. Callers MUST keep the
    deterministic block as a fallback.
    """
    if not is_enabled():
        return None
    if not mistakes:
        # Nothing to diagnose — the deterministic builders already return
        # empty blocks in this case, no need to spend a call.
        return None

    try:
        from services import liz_llm  # local import — keeps test envs lean
    except Exception as exc:  # pragma: no cover
        logger.warning("sonnet_qb_advisor: liz_llm unavailable (%s)", exc)
        return None

    user_prompt = _USER_TEMPLATE.format(
        skill=skill,
        correct=correct,
        total=total,
        percentage=percentage,
        band=estimated_band,
        weak=", ".join(weak_skills) or "(none auto-tagged)",
        mistakes_block=_format_mistakes(mistakes),
    )
    system_prompt = _SYSTEM_PROMPT.format(skill=skill)

    last_error: Optional[str] = None
    for attempt in range(1, MAX_ATTEMPTS + 1):
        started = time.monotonic()
        try:
            reply = await asyncio.wait_for(
                liz_llm.complete(
                    system=system_prompt,
                    user_message=user_prompt,
                    model=liz_llm.deep_model(),
                    max_tokens=MAX_TOKENS,
                    task="qb_advice",
                ),
                timeout=CALL_TIMEOUT_SECONDS,
            )
        except asyncio.TimeoutError:
            last_error = f"timeout after {CALL_TIMEOUT_SECONDS}s"
            logger.warning("sonnet_qb_advisor attempt %d timed out", attempt)
            continue
        except Exception as exc:
            last_error = f"llm_error: {exc!r}"
            logger.warning("sonnet_qb_advisor attempt %d LLM error: %s", attempt, exc)
            continue

        latency = time.monotonic() - started
        try:
            data = json.loads(_extract_json(reply))
        except json.JSONDecodeError as exc:
            last_error = f"invalid_json: {exc}"
            logger.warning(
                "sonnet_qb_advisor attempt %d invalid JSON (%.1fs): %s",
                attempt, latency, exc,
            )
            continue

        cleaned = _validate_payload(data)
        if cleaned is None:
            last_error = "schema_mismatch"
            logger.warning(
                "sonnet_qb_advisor attempt %d failed schema (%.1fs)",
                attempt, latency,
            )
            continue

        logger.info(
            "sonnet_qb_advisor (%s) succeeded attempt %d (%.1fs, %d causes)",
            skill, attempt, latency, len(cleaned["root_cause_analysis"]),
        )
        return cleaned

    logger.warning(
        "sonnet_qb_advisor (%s) gave up after %d attempts: %s",
        skill, MAX_ATTEMPTS, last_error,
    )
    return None
