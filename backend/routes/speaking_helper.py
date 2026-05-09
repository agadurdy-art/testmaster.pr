"""
Speaking helper endpoint — backs the four dynamic buttons in the floating
Liz coaching panel during speaking practice (frontend:
features/speakingHelper/SpeakingHelperPanel).

Two static buttons (Part X structure / Part X pitfalls) are served from
the frontend without ever hitting the backend; they are shipped in
features/speakingHelper/staticContent.js. The four kinds handled here:

    unpack   - Break down what the question / cue card is really asking.
               Surfaces the implicit angle, hidden time-frame, or comparison
               examiners want the candidate to address.
    ideas    - Two or three concrete angles the candidate could pull from
               (people / places / examples). Deliberately small so the
               candidate still has to shape the response.
    phrases  - Band 7+ collocations & connectors specific to this question
               and Part. Grouped by purpose (HEDGING:, CONTRASTING:, etc.).
    opener   - A confident first sentence template so the candidate does
               not freeze on the first beat. Replaces "polish" from the
               writing helper because speaking has no draft to highlight.

Sample-answer / model-response buttons are deliberately NOT here — they
encourage memorisation and the band descriptors penalise that.

Cost discipline (per locked memory feedback_helper_panels_text_only):
    * Model: claude-haiku-4-5-20251001 (Haiku 4.5).
    * Output capped at ~250 tokens per response — short pedagogical
      nudges, not monologues.
    * Caller (frontend) caches responses per (kind, question) so re-clicks
      do not re-call the LLM.
    * No per-tier gating — speaking quota (1 / 2 / 10 / 15 per month)
      already caps worst-case helper spend.
"""
from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from services.llm_compat import LlmChat, UserMessage


HAIKU_MODEL = "claude-haiku-4-5-20251001"

# Examiner persona shared by all four kinds. Identical voice to the writing
# helper so students experience one consistent Liz across surfaces.
SYSTEM_PROMPT = (
    "You are Liz, an IELTS speaking coach with examiner-level calibration "
    "(Cambridge band descriptors). You give short, specific, pedagogical "
    "guidance — never sample answers, never full scripted responses. Your "
    "tone is warm but precise. You always assume the candidate is mid-task "
    "or in the prep minute and should still do the thinking. Output plain "
    "text only, no markdown headers, no bullet symbols inside paragraphs "
    "(line-break separated items are fine). Keep responses under 120 words."
)

# Per-kind instruction body. Composed with the candidate's question + Part
# context at request time so the LLM has just enough to be specific.
KIND_INSTRUCTIONS = {
    "unpack": (
        "Break down what this speaking question (or cue card) is really "
        "asking. Identify: (a) the core task, (b) the time-frame / scope "
        "the examiner expects, (c) the trap most candidates fall into "
        "(e.g. drifting, listing without colour, generalising). Do not "
        "give a model answer. End with one short sentence the candidate "
        "can use as a self-check while speaking."
    ),
    "ideas": (
        "Suggest two or three distinct angles the candidate could speak "
        "to for this question. One sentence per angle. Pick angles that "
        "lend themselves to specific personal examples (a person, a "
        "place, a moment) — not abstractions. Do not write the answer; "
        "just seed the thinking."
    ),
    "phrases": (
        "Suggest 4–6 useful phrases or collocations the candidate can "
        "deploy for this question. Group them by purpose (e.g. HEDGING:, "
        "CONTRASTING:, EXEMPLIFYING:, EVALUATING:). Pick band-7+ phrasing "
        "— avoid memorised filler like 'in my humble opinion' or 'I would "
        "like to talk about'. Match the register to the Part."
    ),
    "opener": (
        "Suggest 2–3 confident first-sentence templates the candidate "
        "could use to start their answer to this question. Each template "
        "should buy them 3–5 seconds of thinking time without sounding "
        "memorised. Show one as a fill-in-the-blank pattern. Do NOT write "
        "their full answer."
    ),
}


class HelperRequest(BaseModel):
    kind: str = Field(
        ..., description="One of: unpack, ideas, phrases, opener"
    )
    part: str = Field(
        ..., description="Speaking part: '1', '2', or '3'."
    )
    question: str = Field(
        ...,
        description=(
            "The Part 1/3 question or the Part 2 cue card text "
            "(topic + bullets, formatted by the client)."
        ),
    )
    topic: Optional[str] = Field(
        None,
        description=(
            "Optional broader theme (e.g. 'environment', 'technology'). "
            "Used by the LLM as light context, not required."
        ),
    )


class HelperResponse(BaseModel):
    text: str


router = APIRouter(prefix="/api/speaking", tags=["speaking-helper"])


def _normalize_part(raw: str) -> str:
    """Accept 1, '1', 'part1' — return canonical '1' / '2' / '3'."""
    if raw is None:
        return "1"
    s = str(raw).strip().lower().lstrip("part").strip()
    return s if s in ("1", "2", "3") else "1"


def _build_user_prompt(req: HelperRequest) -> str:
    """Compose the per-request user prompt the LLM actually sees."""
    instruction = KIND_INSTRUCTIONS.get(req.kind)
    if not instruction:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown helper kind: {req.kind!r}",
        )

    part = _normalize_part(req.part)
    parts = [f"Speaking Part: {part}"]
    if req.topic:
        parts.append(f"Topic / theme: {req.topic}")

    if part == "2":
        parts.append(f"Cue card:\n{req.question.strip()}")
    else:
        parts.append(f"Question:\n{req.question.strip()}")

    parts.append(f"\nWhat to produce:\n{instruction}")
    return "\n\n".join(parts)


@router.post("/helper", response_model=HelperResponse)
async def speaking_helper(req: HelperRequest) -> HelperResponse:
    user_prompt = _build_user_prompt(req)

    chat = (
        LlmChat(
            api_key="",
            session_id="speaking-helper",
            system_message=SYSTEM_PROMPT,
        )
        .with_model("anthropic", HAIKU_MODEL)
        .with_max_tokens(300)
    )

    try:
        text = await chat.send_message(UserMessage(text=user_prompt))
    except Exception as exc:  # pragma: no cover — surface a clean 502
        raise HTTPException(
            status_code=502,
            detail=f"Helper LLM call failed: {exc}",
        ) from exc

    if not text:
        raise HTTPException(
            status_code=502, detail="Helper returned empty response."
        )

    return HelperResponse(text=text.strip())
