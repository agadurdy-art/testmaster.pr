"""
GE V1 writing/speaking evaluation (Ray tutor)
=============================================
Single job: the legacy V1 /evaluate/writing + /evaluate/speaking endpoints
and their Ray General-English-tutor LLM evaluator (CEFR snapshot framing,
gpt-4o-mini). Quota-gated per user. GENERAL ENGLISH product surface.

Extracted verbatim from server.py (Faz 1 refactor, 2026-07-02).
"""

import json
import os
import uuid
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

import auth_session
from services.llm_compat import LlmChat, UserMessage
from services.evaluation_quota import claim_evaluation_quota, rollback_evaluation_claim

router = APIRouter()


class EvaluateWriting(BaseModel):
    user_id: str
    task_type: str  # task1 or task2
    question: str
    answer: str

class SpeakingTest(BaseModel):
    user_id: str
    part: int  # 1, 2, or 3
    question: str
    user_response: str



_GE_TUTOR_SYSTEM_PROMPT = """You are Ray, a warm, encouraging General English tutor — not an exam examiner.
Your job is to help adult learners gain real-world communicative confidence in
English, not to police them against Cambridge IELTS criteria.

Guiding principles:
- Celebrate what the learner is doing right *before* what they need to fix.
- Frame the score as a level snapshot (1=A0, 3=A2, 5=B1, 6=B2, 7=C1, 8-9=C2),
  not as a high-stakes exam band.
- Errors that *block communication* matter most. Cosmetic slips matter least.
- Keep feedback specific and actionable: name the structure, give the fix,
  show a short rewrite — never vague advice like "improve grammar".
- Use simple English the learner can understand. Avoid jargon.
- Always end on a forward-looking line (one thing to practise next).
"""


async def evaluate_with_ai(test_type: str, question: str, user_answer: str, model_answer: Optional[str] = None) -> Dict[str, Any]:
    """Evaluate answer for the General English (V1) product.

    Uses gpt-4o-mini with a friendly tutor persona — *not* IELTS Cambridge
    criteria. The JSON shape is preserved (band_score / criteria objects /
    overall_feedback) so existing V1 frontends keep rendering without
    changes, but the prompt reframes the score as a level snapshot rather
    than an exam band.

    Cost: ~$0.001 per eval (gpt-4o-mini at $0.15/M in, $0.60/M out) vs.
    ~$0.06 for GPT-4o or Sonnet. V1 is a learning surface, not an exam
    surface — sticky-but-cheap is the right trade-off.
    """

    api_key = os.getenv("OPENAI_API_KEY") or os.getenv("EMERGENT_LLM_KEY")

    chat = LlmChat(
        api_key=api_key,
        session_id=str(uuid.uuid4()),
        system_message=_GE_TUTOR_SYSTEM_PROMPT,
    ).with_model("openai", "gpt-4o-mini")

    if test_type == "writing":
        prompt = f"""Give this General English writing response a friendly, tutor-style review.

Prompt:
{question}

Learner's writing:
{user_answer}

BEFORE YOU SCORE:
1. Did the learner roughly address what was asked? (a sensible answer is enough — strict task fulfilment is not the goal)
2. Can a reader follow the meaning, even with errors?
3. Are there 2-3 specific things to celebrate, and 2-3 specific things to fix?

Score 1-9 maps to: 1=A0 beginner · 3=A2 elementary · 5=B1 intermediate · 6=B2 upper-intermediate · 7=C1 advanced · 8-9=C2 mastery.

Return ONLY a JSON object with this structure (no extra text, no markdown, no ``` fences):
{{
  "band_score": <overall band from 1 to 9 - be strict>,
  "task_achievement": {{
    "score": <band 1-9>,
    "feedback": "Direct assessment: Did the response fully address the task? What was missing or off-topic? Be specific about relevance issues."
  }},
  "coherence_cohesion": {{
    "score": <band 1-9>,
    "feedback": "Assessment of organization, paragraphing, and logical flow. Note any mechanical connector usage or poor transitions."
  }},
  "lexical_resource": {{
    "score": <band 1-9>,
    "feedback": "Assessment of vocabulary accuracy and range. Note any wrong word choices, awkward collocations, or memorized phrases."
  }},
  "grammatical_accuracy": {{
    "score": <band 1-9>,
    "feedback": "Assessment of grammar control and error frequency. Note errors that affect meaning comprehension."
  }},
  "major_issues": ["List 2-3 critical problems that justify the band score"],
  "overall_feedback": "4-5 sentences: What the student did well, what critically needs improvement, and specific actionable advice.",
  "band_justification": "1-2 sentences explaining why this band is appropriate and would survive Cambridge moderation"
}}
"""
    else:  # speaking
        prompt = f"""Give this General English speaking response a friendly, tutor-style review.

Question asked:
{question}

Learner's spoken response (transcribed):
{user_answer}

BEFORE YOU SCORE:
1. Did the learner reasonably answer the question? (a natural, on-topic reply is enough)
2. Are ideas understandable, even with some errors?
3. Are there 2-3 specific things to praise, and 2-3 concrete things to work on?

Score 1-9 maps to: 1=A0 beginner · 3=A2 elementary · 5=B1 intermediate · 6=B2 upper-intermediate · 7=C1 advanced · 8-9=C2 mastery.

Return ONLY a JSON object with this structure (no extra text, no markdown, no ``` fences):
{{
  "band_score": <overall band from 1 to 9 - be strict>,
  "fluency_coherence": {{
    "score": <band 1-9>,
    "feedback": "Assessment of natural flow, logical development, and whether ideas connect well. Note any memorized chunks or empty fluency."
  }},
  "lexical_resource": {{
    "score": <band 1-9>,
    "feedback": "Assessment of vocabulary range and accuracy. Note limited range, wrong word choices, or over-reliance on basic words."
  }},
  "grammatical_accuracy": {{
    "score": <band 1-9>,
    "feedback": "Assessment of sentence structures and error frequency. Note errors that impede communication."
  }},
  "pronunciation": {{
    "score": <band 1-9>,
    "feedback": "Assessment based on clarity of expression (from transcription context). Note any repeated unclear expressions."
  }},
  "major_issues": ["List 2-3 critical problems that justify the band score"],
  "overall_feedback": "4-5 sentences: What the student did well, what critically needs improvement, and specific actionable advice.",
  "band_justification": "1-2 sentences explaining why this band is appropriate and would survive Cambridge moderation",
  "model_answer": "Write a Band 7-8 model answer for this exact question (50-80 words). Show ideal vocabulary, grammar, and natural phrasing."
}}
"""
    
    message = UserMessage(text=prompt)
    response = await chat.send_message(message)

    # Normalise response to a Python dict
    if isinstance(response, dict):
        return response

    if isinstance(response, str):
        # Try to strip Markdown code fences if present
        cleaned = response.strip()
        if cleaned.startswith("```"):
            cleaned_lines = cleaned.splitlines()
            cleaned_lines = cleaned_lines[1:]
            if cleaned_lines and cleaned_lines[-1].strip().startswith("```"):
                cleaned_lines = cleaned_lines[:-1]
            cleaned = "\n".join(cleaned_lines).strip()
        try:
            return json.loads(cleaned)
        except Exception:
            return {"band_score": 5.0, "overall_feedback": response}

    return {"band_score": 5.0, "overall_feedback": str(response)}



@router.post("/evaluate/writing")
async def evaluate_writing(data: EvaluateWriting, caller: dict = Depends(auth_session.current_user)):
    auth_session.require_self_or_admin(data.user_id, caller)
    await claim_evaluation_quota(db, data.user_id, "evaluations")
    try:
        evaluation = await evaluate_with_ai(
            test_type="writing",
            question=data.question,
            user_answer=data.answer
        )
    except Exception as e:
        # Roll back the atomic claim so a failed AI call doesn't burn quota.
        await rollback_evaluation_claim(db, data.user_id, "evaluations")
        raise HTTPException(status_code=500, detail=str(e))
    return evaluation

@router.post("/evaluate/speaking")
async def evaluate_speaking(data: SpeakingTest, caller: dict = Depends(auth_session.current_user)):
    auth_session.require_self_or_admin(data.user_id, caller)
    await claim_evaluation_quota(db, data.user_id, "evaluations")
    try:
        evaluation = await evaluate_with_ai(
            test_type="speaking",
            question=data.question,
            user_answer=data.user_response
        )
    except Exception as e:
        await rollback_evaluation_claim(db, data.user_id, "evaluations")
        raise HTTPException(status_code=500, detail=str(e))
    return evaluation

# Progress tracking
