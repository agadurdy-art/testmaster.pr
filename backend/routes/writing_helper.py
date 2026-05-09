"""
Writing helper endpoint — backs the four dynamic buttons in the floating
Liz coaching panel (frontend: features/writingHelper/WritingHelperPanel).

Two static buttons (Band 7+ structure / Common pitfalls) are served from
the frontend without ever hitting the backend; they are shipped in
features/writingHelper/staticContent.js. The four kinds handled here are:

    unpack   - Break down what the question is really asking. Prevents
               the most common Task Response failure: answering a
               different question than the one printed.
    ideas    - Two or three angles to explore. Deliberately small set so
               the student still has to think; this is not a sample
               answer.
    phrases  - Lexical phrases for the student's current paragraph
               intent (introduction / contrast / cause-effect / etc.).
               Driven by the student's essay-so-far, not a generic list.
    polish   - Take a single sentence the student selected and suggest
               a more precise verb / collocation / structure — without
               handing back a full rewrite.

Sample answer / model essay buttons are intentionally NOT here. They
encourage copy-paste behaviour that does not build skill, and the
existing model-answer panel on the page already covers that need.

Cost discipline (per locked memory feedback_helper_panels_text_only):
    * Model: claude-haiku-4-5-20251001 (Haiku 4.5, not Sonnet).
    * Output capped at ~250 tokens per response — these are short
      pedagogical nudges, not essays.
    * Caller (frontend) caches responses per (kind, prompt) inside the
      writing session so re-clicks do not re-call the LLM.
    * No per-tier gating — Free user is already capped by their writing
      quota (1 essay/week), so worst-case helper spend is ~$0.40/month.
"""
from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from services.llm_compat import LlmChat, UserMessage


HAIKU_MODEL = "claude-haiku-4-5-20251001"

# Examiner persona shared by all four kinds. Kept short so caching it
# (when prompt caching is enabled by the client) stays cheap.
SYSTEM_PROMPT = (
    "You are Liz, an IELTS writing coach with examiner-level calibration "
    "(Cambridge band descriptors). You give short, specific, pedagogical "
    "guidance — never sample answers, never full rewrites. Your tone is "
    "warm but precise. You always assume the student is mid-task and "
    "should still do the thinking. Output plain text only, no markdown "
    "headers, no bullet symbols inside paragraphs (line-break separated "
    "items are fine). Keep responses under 120 words."
)

# Per-kind instruction body. Composed with the student's task context at
# request time so the LLM has just enough to be specific.
KIND_INSTRUCTIONS = {
    "unpack": (
        "Break down what this question is really asking. Identify: "
        "(a) the core task, (b) any sub-questions or qualifiers the "
        "student must address, (c) the trap most candidates fall into. "
        "Do not give an opinion or sample answer. End with one short "
        "sentence the student can use as a self-check."
    ),
    "ideas": (
        "Suggest two or three distinct angles the student could explore "
        "for this prompt. One sentence per angle. Pick angles that lend "
        "themselves to specific examples (not abstractions). Do not "
        "write the paragraphs; just seed the thinking."
    ),
    "phrases": (
        "Suggest 4-6 useful phrases or collocations the student can "
        "deploy right now, given their current essay draft. Group them "
        "by purpose (e.g. CONCEDING:, CONTRASTING:, EXEMPLIFYING:). "
        "Pick band-7+ phrasing — avoid 'in conclusion to summarise' "
        "and other memorised filler."
    ),
    "polish": (
        "The student has selected one sentence from their draft. "
        "Suggest 2-3 specific upgrades — a more precise verb, a "
        "tighter collocation, a clearer subject-verb structure. Do "
        "NOT rewrite the full sentence; show one targeted edit at a "
        "time so the student sees the lever."
    ),
}


class HelperRequest(BaseModel):
    kind: str = Field(
        ..., description="One of: unpack, ideas, phrases, polish"
    )
    task_type: str = Field(
        ..., description="task1_academic | task1_general | task2"
    )
    subtype: Optional[str] = Field(
        None,
        description=(
            "Essay/chart subtype (e.g. opinion, discussion, bar_graph). "
            "Used by the LLM as context."
        ),
    )
    prompt: str = Field(..., description="The IELTS question / prompt.")
    essay: Optional[str] = Field(
        None,
        description=(
            "Student's current essay text. Used by phrases/polish; "
            "ignored by unpack/ideas."
        ),
    )
    selection: Optional[str] = Field(
        None,
        description=(
            "Student-selected sentence — required for kind=polish."
        ),
    )


class HelperResponse(BaseModel):
    text: str


router = APIRouter(prefix="/api/writing", tags=["writing-helper"])


def _build_user_prompt(req: HelperRequest) -> str:
    """Compose the per-request user prompt the LLM actually sees."""
    instruction = KIND_INSTRUCTIONS.get(req.kind)
    if not instruction:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown helper kind: {req.kind!r}",
        )

    parts = [
        f"Task type: {req.task_type}",
    ]
    if req.subtype:
        parts.append(f"Subtype: {req.subtype}")
    parts.append(f"Question / prompt:\n{req.prompt.strip()}")

    if req.kind in ("phrases", "polish") and req.essay:
        # Truncate to keep input cost predictable; helpers don't need the
        # full essay, just enough to ground the suggestion.
        snippet = req.essay.strip()[:1500]
        parts.append(f"Student's draft so far:\n{snippet}")

    if req.kind == "polish":
        if not req.selection or not req.selection.strip():
            raise HTTPException(
                status_code=400,
                detail="kind=polish requires `selection` (the sentence to upgrade).",
            )
        parts.append(f"Sentence the student wants polished:\n{req.selection.strip()}")

    parts.append(f"\nWhat to produce:\n{instruction}")
    return "\n\n".join(parts)


@router.post("/helper", response_model=HelperResponse)
async def writing_helper(req: HelperRequest) -> HelperResponse:
    user_prompt = _build_user_prompt(req)

    chat = (
        LlmChat(
            api_key="",
            session_id="writing-helper",
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
