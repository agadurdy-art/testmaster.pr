"""
Grammar Engine production endpoints — AI evaluation of student output,
translation helper, and diagnostics-driven smart review generation.
Extracted from routes/grammar_engine.py (Faz 1 refactor, 2026-07-02).
"""

import json
import logging
from typing import Optional

from fastapi import HTTPException
from pydantic import BaseModel

from routes.grammar_engine_core import (
    router,
    call_llm,
    get_cached,
    set_cached,
    get_module_grammar,
)

logger = logging.getLogger(__name__)

# ═══════════════════════════════════════════
# AI EVALUATION (Stages 4 & 5)
# ═══════════════════════════════════════════

class EvaluateRequest(BaseModel):
    sentence: str
    grammar_title: str
    grammar_focus: Optional[str] = ""
    model_answer: Optional[str] = ""
    prompt_text: Optional[str] = ""
    email: Optional[str] = None  # soft-auth gate (pre-launch audit 2026-05-16)


@router.post("/{module_id}/evaluate")
async def evaluate_production(module_id: str, req: EvaluateRequest):
    """AI evaluation for guided/free production"""
    from security_utils import require_known_user
    await require_known_user(req.email)
    system = """You are a strict but encouraging IELTS grammar coach.
Evaluate the student's sentence for grammar accuracy and correct use of the target grammar structure.
Be concise and helpful. Respond with valid JSON only."""

    prompt = f"""Evaluate this student's sentence:

Target Grammar: {req.grammar_title}
Grammar Focus: {req.grammar_focus}
Prompt: {req.prompt_text}
Student's Answer: {req.sentence}
{f"Model Answer: {req.model_answer}" if req.model_answer else ""}

Respond with JSON:
{{
  "score": <1-5 where 5 is perfect>,
  "grammar_correct": <true/false>,
  "target_grammar_used": <true/false>,
  "feedback": "1-2 sentence feedback on grammar and usage",
  "corrected_sentence": "The corrected version if there are errors, or the original if correct",
  "improvement_tip": "One specific tip to improve"
}}

Scoring guide:
5 = Perfect grammar + natural use of target structure
4 = Minor errors but target grammar used correctly
3 = Target grammar attempted but with errors
2 = Major grammar errors or target grammar barely used
1 = Target grammar not used or completely wrong"""

    try:
        raw = await call_llm(system, prompt)
        text = raw.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1] if "\n" in text else text[3:]
            text = text.rsplit("```", 1)[0]
        return json.loads(text)
    except Exception:
        return {
            "score": 3,
            "grammar_correct": False,
            "target_grammar_used": False,
            "feedback": "Could not evaluate. Please try again.",
            "corrected_sentence": req.sentence,
            "improvement_tip": "Try to use the target grammar structure clearly.",
        }


# ═══════════════════════════════════════════
# TRANSLATION
# ═══════════════════════════════════════════

class TranslateRequest(BaseModel):
    text: str
    target_language: str  # e.g. "vi", "tr", "ko", "zh"
    context: Optional[str] = "grammar explanation"
    email: Optional[str] = None  # soft-auth gate (pre-launch audit 2026-05-16)


LANGUAGE_NAMES = {
    "vi": "Vietnamese",
    "tr": "Turkish",
    "ko": "Korean",
    "zh": "Mandarin Chinese",
    "ja": "Japanese",
    "th": "Thai",
    "ar": "Arabic",
    "es": "Spanish",
    "pt": "Portuguese",
    "ru": "Russian",
    "fr": "French",
    "de": "German",
    "id": "Indonesian",
}


@router.post("/translate")
async def translate_text(req: TranslateRequest):
    """Translate text to target language"""
    from security_utils import require_known_user
    await require_known_user(req.email)
    lang_name = LANGUAGE_NAMES.get(req.target_language, req.target_language)

    system = f"You are a professional translator. Translate the given English text to {lang_name}. Keep grammar terminology in English where appropriate (e.g., 'Present Perfect', 'Past Simple'). Respond with ONLY the translated text, nothing else."

    prompt = f"""Translate this {req.context} to {lang_name}:

{req.text}"""

    try:
        translation = await call_llm(system, prompt)
        return {"translation": translation.strip(), "source_language": "en", "target_language": req.target_language}
    except Exception as e:
        logger.error(f"Translation error: {e}")
        raise HTTPException(status_code=500, detail="Translation failed")


# ═══════════════════════════════════════════
# SMART REVIEW (Targeted Practice)
# ═══════════════════════════════════════════

class SmartReviewRequest(BaseModel):
    weak_areas: list  # e.g. ["form", "usage"]
    quiz_score: Optional[int] = None
    email: Optional[str] = None  # soft-auth gate (pre-launch audit 2026-05-16)


@router.post("/{module_id}/smart-review")
async def generate_smart_review(module_id: str, req: SmartReviewRequest):
    """Generate targeted practice exercises based on weak areas from quiz diagnostics"""
    from security_utils import require_known_user
    await require_known_user(req.email)
    if not req.weak_areas:
        raise HTTPException(status_code=400, detail="No weak areas provided")

    # Build cache key from sorted weak areas
    cache_key = f"smart_review_{'_'.join(sorted(req.weak_areas))}"
    cached = await get_cached(module_id, cache_key)
    if cached:
        return cached

    grammar, module_title, source = await get_module_grammar(module_id)

    area_descriptions = {
        "form": "sentence structure, word order, verb forms, subject-verb agreement",
        "meaning": "what the grammar expresses, the difference between similar structures, when NOT to use it",
        "usage": "choosing the right grammar for the right context, real-world application, IELTS task situations",
        "recognition": "identifying the grammar in text, distinguishing it from similar structures",
    }

    weak_desc = "\n".join([f"- {a}: {area_descriptions.get(a, a)}" for a in req.weak_areas])

    system = """You are a PhD-level English grammar teacher creating TARGETED review exercises.
The student has taken a quiz and struggled with specific areas. Create focused exercises that directly address their weaknesses.
Make exercises progressively harder. Be precise and diagnostic.
Always respond with valid JSON only, no markdown."""

    prompt = f"""The student scored {req.quiz_score or 'unknown'}% on the quiz for:

Grammar: {grammar.get('title', '')}
Topic: {module_title}
Explanation: {grammar.get('explanation', '')}

Their WEAK AREAS are:
{weak_desc}

Generate TARGETED review exercises focusing ONLY on these weak areas.

Return JSON:
{{
  "title": "Smart Review: {grammar.get('title', '')}",
  "module_topic": "{module_title}",
  "weak_areas": {json.dumps(req.weak_areas)},
  "review_message": "A 1-2 sentence encouraging message explaining what they'll practice and why",
  "exercises": [
    {{
      "id": "sr-1",
      "type": "multiple_choice",
      "targets_area": "{req.weak_areas[0]}",
      "difficulty": "easy",
      "question": "A clear question testing the weak area",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_index": 0,
      "explanation": "Detailed explanation of WHY this is correct, specifically addressing the weak area",
      "tip": "A specific learning tip for this weak area"
    }},
    {{
      "id": "sr-2",
      "type": "gap_fill",
      "targets_area": "{req.weak_areas[0]}",
      "difficulty": "easy",
      "sentence": "Sentence with ___ to fill.",
      "options": ["opt1", "opt2", "opt3", "opt4"],
      "correct": "correct_option",
      "explanation": "Why this is correct",
      "tip": "Tip"
    }},
    {{
      "id": "sr-3",
      "type": "multiple_choice",
      "targets_area": "{req.weak_areas[-1]}",
      "difficulty": "medium",
      "question": "A medium difficulty question",
      "options": ["A", "B", "C", "D"],
      "correct_index": 1,
      "explanation": "Explanation",
      "tip": "Tip"
    }},
    {{
      "id": "sr-4",
      "type": "error_detection",
      "targets_area": "{req.weak_areas[0]}",
      "difficulty": "medium",
      "sentence": "A sentence that may or may not have an error",
      "has_error": true,
      "error_word": "the wrong word",
      "correct_word": "the right word",
      "explanation": "Explanation focusing on the weak area",
      "tip": "Tip"
    }},
    {{
      "id": "sr-5",
      "type": "gap_fill",
      "targets_area": "{req.weak_areas[-1]}",
      "difficulty": "medium",
      "sentence": "Another gap fill ___.",
      "options": ["a", "b", "c", "d"],
      "correct": "b",
      "explanation": "Why",
      "tip": "Tip"
    }},
    {{
      "id": "sr-6",
      "type": "multiple_choice",
      "targets_area": "{req.weak_areas[0]}",
      "difficulty": "hard",
      "question": "A challenging question that really tests deep understanding",
      "options": ["A", "B", "C", "D"],
      "correct_index": 2,
      "explanation": "Detailed explanation of the nuance",
      "tip": "Advanced tip"
    }},
    {{
      "id": "sr-7",
      "type": "context_choice",
      "targets_area": "{req.weak_areas[-1]}",
      "difficulty": "hard",
      "context": "A real IELTS-like paragraph or situation",
      "question": "Which option best fits this context?",
      "options": ["Option using grammar A", "Option using grammar B", "Option using grammar C"],
      "correct_index": 0,
      "explanation": "Why this grammar fits best in this academic/professional context",
      "tip": "IELTS strategy tip"
    }},
    {{
      "id": "sr-8",
      "type": "sentence_correction",
      "targets_area": "{req.weak_areas[0]}",
      "difficulty": "hard",
      "wrong_sentence": "A sentence with a subtle grammar error in the weak area",
      "correct_sentence": "The corrected version",
      "explanation": "Detailed explanation of the subtle error",
      "tip": "How to avoid this in IELTS writing"
    }}
  ],
  "summary_tips": [
    "Key tip 1 for improving {req.weak_areas[0]}",
    "Key tip 2 for improving {req.weak_areas[-1] if len(req.weak_areas) > 1 else req.weak_areas[0]}",
    "General strategy tip for mastering this grammar"
  ]
}}

IMPORTANT:
- Generate EXACTLY 8 exercises
- Focus exercises on the WEAK AREAS: {', '.join(req.weak_areas)}
- Progress from easy (2) -> medium (3) -> hard (3)
- Each exercise must have a specific learning tip
- All content relates to: {grammar.get('title', '')} in context of {module_title}
- Make explanations teach, not just tell"""

    try:
        raw = await call_llm(system, prompt)
        text = raw.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1] if "\n" in text else text[3:]
            text = text.rsplit("```", 1)[0]
        data = json.loads(text)
        await set_cached(module_id, cache_key, data)
        return data
    except json.JSONDecodeError:
        logger.error(f"Failed to parse Smart Review JSON for {module_id}")
        raise HTTPException(status_code=500, detail="Failed to generate smart review")
    except Exception as e:
        logger.error(f"LLM error for smart review {module_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate smart review")
