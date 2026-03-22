"""
Grammar Practice Engine - Backend Routes
5-Stage Grammar Learning System:
  1. Learn (Context Discovery + Rule + Common Mistakes + CCQ)
  2. Controlled Practice (Recognition, Gap-Fill, Transform, Order)
  3. Checkpoint Quiz (Mixed types, mastery scoring, diagnostics)
  4. Guided Production (Scaffolded sentence building + AI eval)
  5. Free Production (Open writing + AI evaluation)
"""

import os
import json
import uuid
import logging
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from emergentintegrations.llm.chat import LlmChat, UserMessage

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/grammar-engine", tags=["Grammar Engine"])

# Will be set from server.py
db = None

def set_db(database):
    global db
    db = database


CACHE_COLLECTION = "grammar_engine_cache"


async def get_cached(module_id: str, stage: str):
    """Get cached grammar engine content"""
    doc = await db[CACHE_COLLECTION].find_one(
        {"module_id": module_id, "stage": stage}, {"_id": 0}
    )
    return doc.get("data") if doc else None


async def set_cached(module_id: str, stage: str, data: dict):
    """Cache grammar engine content"""
    await db[CACHE_COLLECTION].update_one(
        {"module_id": module_id, "stage": stage},
        {"$set": {"module_id": module_id, "stage": stage, "data": data, "updated_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True,
    )


async def get_module_grammar(module_id: str):
    """Fetch grammar data from mastery or advanced module"""
    module = await db.mastery_course_modules.find_one({"id": module_id}, {"_id": 0})
    source = "mastery"
    if not module:
        module = await db.advanced_mastery_modules.find_one({"id": module_id}, {"_id": 0})
        source = "advanced"
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    grammar = module.get("grammar", {})
    if not grammar:
        raise HTTPException(status_code=404, detail="No grammar content for this module")
    return grammar, module.get("title", ""), source


async def call_llm(system_message: str, prompt: str) -> str:
    """Call LLM and return response text"""
    chat = LlmChat(
        api_key=os.getenv("EMERGENT_LLM_KEY"),
        session_id=str(uuid.uuid4()),
        system_message=system_message,
    ).with_model("openai", "gpt-4o")
    response = await chat.send_message(UserMessage(text=prompt))
    return response.text if hasattr(response, 'text') else str(response)


# ═══════════════════════════════════════════
# STAGE 1: LEARN
# ═══════════════════════════════════════════

@router.get("/{module_id}/learn")
async def get_grammar_learn(module_id: str):
    """Get rich Learn content for a grammar topic"""
    cached = await get_cached(module_id, "learn")
    if cached:
        return cached

    grammar, module_title, source = await get_module_grammar(module_id)

    system = """You are a PhD-level English grammar teacher creating learning materials for IELTS students (Band 5.5-7.0 level). 
You create clear, structured, and engaging grammar explanations. Your content follows the PPP+ methodology.
Always respond with valid JSON only, no markdown."""

    prompt = f"""Create comprehensive LEARN content for this grammar topic:

Grammar Title: {grammar.get('title', '')}
Module Topic: {module_title}
Existing Explanation: {grammar.get('explanation', '')}
Existing Examples: {json.dumps(grammar.get('examples', []))}
IELTS Benefit: {grammar.get('benefit', '')}

Generate a JSON object with this exact structure:
{{
  "title": "{grammar.get('title', '')}",
  "module_topic": "{module_title}",
  "slides": [
    {{
      "type": "context_discovery",
      "title": "Discover the Pattern",
      "instruction": "Read these sentences. What pattern do you notice?",
      "sentences": ["sentence 1 using target grammar (highlight target structure with **bold**)", "sentence 2", "sentence 3"],
      "discovery_question": "What do these sentences have in common?",
      "answer": "Brief explanation of the pattern they should notice"
    }},
    {{
      "type": "form",
      "title": "Form (Structure)",
      "formula": "e.g. Subject + have/has + past participle",
      "positive": "Full example of positive form",
      "negative": "Full example of negative form",
      "question": "Full example of question form",
      "notes": ["Important note about the form", "Another note"]
    }},
    {{
      "type": "meaning",
      "title": "Meaning & Use",
      "explanation": "Clear explanation of what this grammar expresses (2-3 sentences, simple English)",
      "when_to_use": ["Situation 1 when you use this", "Situation 2", "Situation 3"],
      "signal_words": ["word1", "word2", "word3"],
      "time_reference": "Description of time aspect (past/present/future connection)"
    }},
    {{
      "type": "examples",
      "title": "Examples in Context",
      "examples": [
        {{"sentence": "Example sentence 1", "explanation": "Why this grammar is used here"}},
        {{"sentence": "Example sentence 2", "explanation": "Why this grammar is used here"}},
        {{"sentence": "Example sentence 3", "explanation": "Why this grammar is used here"}},
        {{"sentence": "Example sentence 4", "explanation": "Why this grammar is used here"}}
      ]
    }},
    {{
      "type": "common_mistakes",
      "title": "Common Mistakes",
      "mistakes": [
        {{"wrong": "Incorrect sentence", "correct": "Correct sentence", "explanation": "Why this is wrong"}},
        {{"wrong": "Another incorrect sentence", "correct": "Correct version", "explanation": "Why this is wrong"}},
        {{"wrong": "Third incorrect sentence", "correct": "Correct version", "explanation": "Why this is wrong"}}
      ]
    }},
    {{
      "type": "ielts_tip",
      "title": "IELTS Application",
      "band_55_example": "A Band 5.5 level sentence using simple grammar",
      "band_70_example": "The same idea expressed at Band 7.0+ level using the target grammar",
      "tip": "How to use this grammar effectively in IELTS Writing/Speaking"
    }},
    {{
      "type": "concept_check",
      "title": "Quick Check",
      "questions": [
        {{"question": "Yes/No concept check question about the grammar", "answer": true}},
        {{"question": "Another concept check question", "answer": false}},
        {{"question": "Third concept check question", "answer": true}}
      ]
    }}
  ]
}}

IMPORTANT:
- All content in English
- Examples should relate to the module topic: {module_title}
- Keep explanations clear and concise - these are intermediate learners
- Use practical, everyday examples
- Make concept check questions test UNDERSTANDING, not just memory"""

    try:
        raw = await call_llm(system, prompt)
        # Parse JSON from response
        text = raw.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1] if "\n" in text else text[3:]
            text = text.rsplit("```", 1)[0]
        data = json.loads(text)
        await set_cached(module_id, "learn", data)
        return data
    except json.JSONDecodeError:
        logger.error(f"Failed to parse Learn JSON for {module_id}")
        # Return fallback from existing data
        return {
            "title": grammar.get("title", ""),
            "module_topic": module_title,
            "slides": [
                {
                    "type": "meaning",
                    "title": "Meaning & Use",
                    "explanation": grammar.get("explanation", ""),
                    "when_to_use": [],
                    "signal_words": [],
                    "time_reference": "",
                },
                {
                    "type": "examples",
                    "title": "Examples",
                    "examples": [{"sentence": ex, "explanation": ""} for ex in grammar.get("examples", [])],
                },
            ],
        }
    except Exception as e:
        logger.error(f"LLM error for grammar learn {module_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate learn content")


# ═══════════════════════════════════════════
# STAGE 2: CONTROLLED PRACTICE
# ═══════════════════════════════════════════

@router.get("/{module_id}/practice")
async def get_grammar_practice(module_id: str):
    """Get controlled practice exercises"""
    cached = await get_cached(module_id, "practice")
    if cached:
        return cached

    grammar, module_title, source = await get_module_grammar(module_id)

    system = """You are a PhD-level English grammar teacher creating practice exercises for IELTS students.
Create varied, engaging exercises that progress from easy to difficult.
Always respond with valid JSON only, no markdown."""

    prompt = f"""Create controlled practice exercises for:

Grammar: {grammar.get('title', '')}
Topic: {module_title}
Explanation: {grammar.get('explanation', '')}
Examples: {json.dumps(grammar.get('examples', []))}

Generate a JSON object with this EXACT structure:
{{
  "title": "{grammar.get('title', '')}",
  "module_topic": "{module_title}",
  "sections": [
    {{
      "type": "recognition",
      "title": "Spot the Grammar",
      "instruction": "Choose the correct sentence.",
      "items": [
        {{
          "id": "rec-1",
          "options": ["Correct sentence using target grammar", "Incorrect sentence with grammar error"],
          "correct_index": 0,
          "explanation": "Why option A is correct"
        }},
        {{
          "id": "rec-2",
          "options": ["Incorrect sentence", "Correct sentence"],
          "correct_index": 1,
          "explanation": "Why option B is correct"
        }},
        {{
          "id": "rec-3",
          "options": ["Correct sentence", "Incorrect sentence"],
          "correct_index": 0,
          "explanation": "Explanation"
        }},
        {{
          "id": "rec-4",
          "options": ["Incorrect", "Correct"],
          "correct_index": 1,
          "explanation": "Explanation"
        }}
      ]
    }},
    {{
      "type": "gap_fill",
      "title": "Fill the Gap",
      "instruction": "Choose the correct word to complete the sentence.",
      "items": [
        {{
          "id": "gap-1",
          "sentence": "She ___ to the office every day.",
          "options": ["go", "goes", "going", "gone"],
          "correct": "goes",
          "hint": "Think about subject-verb agreement"
        }},
        {{
          "id": "gap-2",
          "sentence": "Another sentence with ___.",
          "options": ["option1", "option2", "option3", "option4"],
          "correct": "correct_option",
          "hint": "A helpful hint"
        }},
        {{
          "id": "gap-3",
          "sentence": "Third sentence with ___.",
          "options": ["opt1", "opt2", "opt3", "opt4"],
          "correct": "correct_opt",
          "hint": "Hint"
        }},
        {{
          "id": "gap-4",
          "sentence": "Fourth sentence ___.",
          "options": ["opt1", "opt2", "opt3", "opt4"],
          "correct": "correct",
          "hint": "Hint"
        }},
        {{
          "id": "gap-5",
          "sentence": "Fifth sentence ___.",
          "options": ["opt1", "opt2", "opt3", "opt4"],
          "correct": "correct",
          "hint": "Hint"
        }}
      ]
    }},
    {{
      "type": "transformation",
      "title": "Transform the Sentence",
      "instruction": "Rewrite the sentence using the target grammar structure.",
      "items": [
        {{
          "id": "trans-1",
          "original": "Original sentence in a different form",
          "target_hint": "Rewrite using [target grammar]",
          "acceptable_answers": ["Correct transformation 1", "Alternative correct form"],
          "model_answer": "The best transformation"
        }},
        {{
          "id": "trans-2",
          "original": "Another sentence to transform",
          "target_hint": "Rewrite hint",
          "acceptable_answers": ["Answer1", "Answer2"],
          "model_answer": "Best answer"
        }},
        {{
          "id": "trans-3",
          "original": "Third sentence",
          "target_hint": "Hint",
          "acceptable_answers": ["Answer"],
          "model_answer": "Best answer"
        }}
      ]
    }},
    {{
      "type": "error_correction",
      "title": "Fix the Mistake",
      "instruction": "Find and correct the grammar error in each sentence.",
      "items": [
        {{
          "id": "err-1",
          "sentence": "Sentence with a grammar error",
          "error_word": "the wrong word",
          "correct_word": "the correct word",
          "corrected_sentence": "Full corrected sentence",
          "explanation": "Why this was wrong"
        }},
        {{
          "id": "err-2",
          "sentence": "Another error sentence",
          "error_word": "wrong",
          "correct_word": "right",
          "corrected_sentence": "Corrected",
          "explanation": "Why"
        }},
        {{
          "id": "err-3",
          "sentence": "Third error sentence",
          "error_word": "wrong",
          "correct_word": "right",
          "corrected_sentence": "Corrected",
          "explanation": "Why"
        }}
      ]
    }}
  ]
}}

IMPORTANT:
- All sentences must use the target grammar: {grammar.get('title', '')}
- Related to topic: {module_title}
- Progress from easy (recognition) to hard (error correction)
- Exactly the number of items shown above
- Keep sentences at IELTS Band 5.5-7.0 complexity
- Make all options plausible (no obviously wrong answers)"""

    try:
        raw = await call_llm(system, prompt)
        text = raw.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1] if "\n" in text else text[3:]
            text = text.rsplit("```", 1)[0]
        data = json.loads(text)
        await set_cached(module_id, "practice", data)
        return data
    except json.JSONDecodeError:
        logger.error(f"Failed to parse Practice JSON for {module_id}")
        raise HTTPException(status_code=500, detail="Failed to generate practice content")
    except Exception as e:
        logger.error(f"LLM error for grammar practice {module_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate practice content")


# ═══════════════════════════════════════════
# STAGE 3: CHECKPOINT QUIZ
# ═══════════════════════════════════════════

@router.get("/{module_id}/quiz")
async def get_grammar_quiz(module_id: str):
    """Get checkpoint quiz with mixed question types"""
    cached = await get_cached(module_id, "quiz")
    if cached:
        return cached

    grammar, module_title, source = await get_module_grammar(module_id)

    system = """You are creating a grammar assessment quiz for IELTS students.
The quiz tests deep understanding, not just memory. Mix different question types.
Always respond with valid JSON only, no markdown."""

    prompt = f"""Create a checkpoint quiz for:

Grammar: {grammar.get('title', '')}
Topic: {module_title}
Explanation: {grammar.get('explanation', '')}

Generate a JSON object with EXACTLY this structure:
{{
  "title": "Checkpoint: {grammar.get('title', '')}",
  "module_topic": "{module_title}",
  "time_limit_seconds": 300,
  "pass_threshold": 70,
  "questions": [
    {{
      "id": "q1",
      "type": "multiple_choice",
      "question": "Choose the correct sentence.",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_index": 0,
      "explanation": "Why A is correct",
      "difficulty": "easy",
      "tests": "form"
    }},
    {{
      "id": "q2",
      "type": "multiple_choice",
      "question": "Which sentence correctly uses {grammar.get('title', '')}?",
      "options": ["A", "B", "C", "D"],
      "correct_index": 1,
      "explanation": "Explanation",
      "difficulty": "easy",
      "tests": "form"
    }},
    {{
      "id": "q3",
      "type": "gap_fill",
      "sentence": "Complete: She ___ (verb form) ...",
      "options": ["opt1", "opt2", "opt3", "opt4"],
      "correct": "correct_option",
      "explanation": "Why",
      "difficulty": "medium",
      "tests": "form"
    }},
    {{
      "id": "q4",
      "type": "gap_fill",
      "sentence": "Another gap fill ___.",
      "options": ["a", "b", "c", "d"],
      "correct": "b",
      "explanation": "Why",
      "difficulty": "medium",
      "tests": "usage"
    }},
    {{
      "id": "q5",
      "type": "error_detection",
      "sentence": "Sentence with an error.",
      "has_error": true,
      "error_word": "wrong word",
      "correct_word": "right word",
      "explanation": "Why this is wrong",
      "difficulty": "medium",
      "tests": "form"
    }},
    {{
      "id": "q6",
      "type": "error_detection",
      "sentence": "A correct sentence (no error).",
      "has_error": false,
      "error_word": "",
      "correct_word": "",
      "explanation": "This sentence is grammatically correct because...",
      "difficulty": "medium",
      "tests": "recognition"
    }},
    {{
      "id": "q7",
      "type": "usage_choice",
      "context": "Describe a situation where you need to choose the right grammar",
      "question": "Which grammar structure is best here and why?",
      "options": ["Structure A", "Structure B", "Structure C"],
      "correct_index": 0,
      "explanation": "Why this structure fits the context",
      "difficulty": "hard",
      "tests": "usage"
    }},
    {{
      "id": "q8",
      "type": "multiple_choice",
      "question": "A harder question testing nuanced understanding",
      "options": ["A", "B", "C", "D"],
      "correct_index": 2,
      "explanation": "Explanation of nuance",
      "difficulty": "hard",
      "tests": "meaning"
    }},
    {{
      "id": "q9",
      "type": "gap_fill",
      "sentence": "A challenging gap fill ___.",
      "options": ["a", "b", "c", "d"],
      "correct": "c",
      "explanation": "Why",
      "difficulty": "hard",
      "tests": "form"
    }},
    {{
      "id": "q10",
      "type": "usage_choice",
      "context": "A real IELTS-like context",
      "question": "Which option best completes this paragraph?",
      "options": ["Option with grammar A", "Option with grammar B", "Option with grammar C"],
      "correct_index": 1,
      "explanation": "Why B is the most appropriate in this academic context",
      "difficulty": "hard",
      "tests": "usage"
    }}
  ]
}}

IMPORTANT:
- EXACTLY 10 questions
- Mix of easy (3), medium (3), hard (4) 
- Test different aspects: form, meaning, usage, recognition
- All related to: {grammar.get('title', '')} in context of {module_title}
- Questions should be progressively harder
- Make distractors plausible"""

    try:
        raw = await call_llm(system, prompt)
        text = raw.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1] if "\n" in text else text[3:]
            text = text.rsplit("```", 1)[0]
        data = json.loads(text)
        await set_cached(module_id, "quiz", data)
        return data
    except json.JSONDecodeError:
        logger.error(f"Failed to parse Quiz JSON for {module_id}")
        raise HTTPException(status_code=500, detail="Failed to generate quiz content")
    except Exception as e:
        logger.error(f"LLM error for grammar quiz {module_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate quiz content")


# ═══════════════════════════════════════════
# STAGE 4: GUIDED PRODUCTION
# ═══════════════════════════════════════════

@router.get("/{module_id}/guided-prompts")
async def get_guided_prompts(module_id: str):
    """Get guided production prompts with scaffolding"""
    cached = await get_cached(module_id, "guided")
    if cached:
        return cached

    grammar, module_title, source = await get_module_grammar(module_id)

    system = """You create scaffolded writing prompts for IELTS grammar practice.
Each prompt guides the student to produce sentences using a target grammar structure.
Always respond with valid JSON only, no markdown."""

    prompt = f"""Create guided production prompts for:

Grammar: {grammar.get('title', '')}
Topic: {module_title}

Generate JSON:
{{
  "title": "Guided Production: {grammar.get('title', '')}",
  "module_topic": "{module_title}",
  "instruction": "Write sentences using {grammar.get('title', '')}. Use the hints to help you.",
  "prompts": [
    {{
      "id": "gp-1",
      "type": "sentence_starter",
      "prompt": "Complete this sentence about {module_title}:",
      "starter": "A sentence beginning that requires target grammar to finish...",
      "word_bank": ["useful word 1", "useful word 2", "useful word 3", "useful word 4"],
      "model_answer": "A complete model answer using the target grammar correctly",
      "grammar_focus": "What specific aspect of the grammar this tests"
    }},
    {{
      "id": "gp-2",
      "type": "sentence_starter",
      "prompt": "Another prompt about {module_title}:",
      "starter": "Another sentence beginning...",
      "word_bank": ["word1", "word2", "word3", "word4"],
      "model_answer": "Model answer",
      "grammar_focus": "Focus"
    }},
    {{
      "id": "gp-3",
      "type": "picture_prompt",
      "prompt": "Describe this situation using {grammar.get('title', '')}:",
      "scenario": "A vivid description of a scenario related to {module_title} that the student should describe",
      "word_bank": ["word1", "word2", "word3", "word4", "word5"],
      "model_answer": "2-3 model sentences using the target grammar",
      "grammar_focus": "Focus"
    }},
    {{
      "id": "gp-4",
      "type": "question_response",
      "prompt": "Answer this question using {grammar.get('title', '')}:",
      "question": "An IELTS-style question that requires the target grammar to answer",
      "word_bank": ["word1", "word2", "word3"],
      "model_answer": "Model answer with 2-3 sentences",
      "grammar_focus": "Focus"
    }},
    {{
      "id": "gp-5",
      "type": "transformation",
      "prompt": "Rewrite the idea using {grammar.get('title', '')}:",
      "original_idea": "A simple sentence or idea expressed without the target grammar",
      "word_bank": ["word1", "word2", "word3"],
      "model_answer": "The idea rewritten with the target grammar",
      "grammar_focus": "Focus"
    }}
  ]
}}

Make prompts engaging and related to {module_title}. 
Each prompt should clearly require the target grammar structure."""

    try:
        raw = await call_llm(system, prompt)
        text = raw.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1] if "\n" in text else text[3:]
            text = text.rsplit("```", 1)[0]
        data = json.loads(text)
        await set_cached(module_id, "guided", data)
        return data
    except json.JSONDecodeError:
        logger.error(f"Failed to parse Guided JSON for {module_id}")
        raise HTTPException(status_code=500, detail="Failed to generate guided prompts")
    except Exception as e:
        logger.error(f"LLM error for guided prompts {module_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate guided prompts")


# ═══════════════════════════════════════════
# STAGE 5: FREE PRODUCTION
# ═══════════════════════════════════════════

@router.get("/{module_id}/free-prompts")
async def get_free_prompts(module_id: str):
    """Get free production prompts"""
    cached = await get_cached(module_id, "free")
    if cached:
        return cached

    grammar, module_title, source = await get_module_grammar(module_id)

    system = """You create open-ended writing/speaking prompts for IELTS grammar practice.
These prompts encourage natural, communicative use of target grammar.
Always respond with valid JSON only, no markdown."""

    prompt = f"""Create free production prompts for:

Grammar: {grammar.get('title', '')}
Topic: {module_title}

Generate JSON:
{{
  "title": "Free Production: {grammar.get('title', '')}",
  "module_topic": "{module_title}",
  "instruction": "Write your own responses using {grammar.get('title', '')}. Express your real opinions and experiences.",
  "prompts": [
    {{
      "id": "fp-1",
      "type": "personal_response",
      "question": "A personal question related to {module_title} that naturally requires the target grammar (e.g., 'Have you ever...?' for Present Perfect)",
      "min_sentences": 3,
      "grammar_target": "{grammar.get('title', '')}",
      "example_response": "A model response showing natural use of the grammar (3-4 sentences)"
    }},
    {{
      "id": "fp-2",
      "type": "personal_response",
      "question": "Another personal question",
      "min_sentences": 3,
      "grammar_target": "{grammar.get('title', '')}",
      "example_response": "Model response"
    }},
    {{
      "id": "fp-3",
      "type": "opinion",
      "question": "An IELTS Speaking Part 3 style opinion question about {module_title} that requires the grammar",
      "min_sentences": 4,
      "grammar_target": "{grammar.get('title', '')}",
      "example_response": "Model opinion response using the grammar naturally (4-5 sentences)"
    }}
  ]
}}

Make questions personal, engaging, and naturally eliciting the target grammar.
Relate to {module_title} topic."""

    try:
        raw = await call_llm(system, prompt)
        text = raw.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1] if "\n" in text else text[3:]
            text = text.rsplit("```", 1)[0]
        data = json.loads(text)
        await set_cached(module_id, "free", data)
        return data
    except json.JSONDecodeError:
        logger.error(f"Failed to parse Free JSON for {module_id}")
        raise HTTPException(status_code=500, detail="Failed to generate free prompts")
    except Exception as e:
        logger.error(f"LLM error for free prompts {module_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate free prompts")


# ═══════════════════════════════════════════
# AI EVALUATION (Stages 4 & 5)
# ═══════════════════════════════════════════

class EvaluateRequest(BaseModel):
    sentence: str
    grammar_title: str
    grammar_focus: Optional[str] = ""
    model_answer: Optional[str] = ""
    prompt_text: Optional[str] = ""


@router.post("/{module_id}/evaluate")
async def evaluate_production(module_id: str, req: EvaluateRequest):
    """AI evaluation for guided/free production"""
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
    except:
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


LANGUAGE_NAMES = {
    "vi": "Vietnamese",
    "tr": "Turkish",
    "ko": "Korean",
    "zh": "Chinese",
    "ja": "Japanese",
    "th": "Thai",
    "ar": "Arabic",
    "es": "Spanish",
    "pt": "Portuguese",
    "fr": "French",
    "de": "German",
    "id": "Indonesian",
}


@router.post("/translate")
async def translate_text(req: TranslateRequest):
    """Translate text to target language"""
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
# PROGRESS TRACKING
# ═══════════════════════════════════════════

class GrammarProgressRequest(BaseModel):
    user_id: str
    module_id: str
    stage: str  # learn, practice, quiz, guided, free
    completed: bool = True
    score: Optional[int] = None
    diagnostics: Optional[dict] = None


@router.post("/progress")
async def save_grammar_progress(req: GrammarProgressRequest):
    """Save grammar engine progress"""
    key = f"{req.module_id}_{req.stage}"
    update_data = {
        "user_id": req.user_id,
        "module_id": req.module_id,
        "stage": req.stage,
        "completed": req.completed,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    if req.score is not None:
        update_data["score"] = req.score
    if req.diagnostics:
        update_data["diagnostics"] = req.diagnostics

    await db.grammar_engine_progress.update_one(
        {"user_id": req.user_id, "key": key},
        {"$set": {**update_data, "key": key}},
        upsert=True,
    )
    return {"status": "saved"}


@router.get("/progress/{user_id}")
async def get_grammar_progress(user_id: str):
    """Get all grammar engine progress for a user"""
    progress = await db.grammar_engine_progress.find(
        {"user_id": user_id}, {"_id": 0}
    ).to_list(length=500)
    return {"progress": progress}


# ═══════════════════════════════════════════
# QUIZ SUBMISSION
# ═══════════════════════════════════════════

class QuizSubmitRequest(BaseModel):
    user_id: str
    module_id: str
    answers: list  # [{question_id, answer}]
    time_taken_seconds: Optional[int] = None


@router.post("/{module_id}/quiz/submit")
async def submit_grammar_quiz(module_id: str, req: QuizSubmitRequest):
    """Submit quiz answers and get diagnostic results"""
    cached = await get_cached(module_id, "quiz")
    if not cached:
        raise HTTPException(status_code=404, detail="Quiz not found. Generate quiz first.")

    questions = cached.get("questions", [])
    q_map = {q["id"]: q for q in questions}

    correct = 0
    total = len(questions)
    results = []
    diagnostics = {"form": 0, "meaning": 0, "usage": 0, "recognition": 0, "form_total": 0, "meaning_total": 0, "usage_total": 0, "recognition_total": 0}

    for ans in req.answers:
        q = q_map.get(ans.get("question_id"))
        if not q:
            continue

        tests_area = q.get("tests", "form")
        diagnostics[f"{tests_area}_total"] = diagnostics.get(f"{tests_area}_total", 0) + 1

        is_correct = False
        q_type = q.get("type")

        if q_type in ["multiple_choice", "usage_choice"]:
            is_correct = ans.get("answer") == q.get("correct_index")
        elif q_type == "gap_fill":
            is_correct = str(ans.get("answer", "")).lower().strip() == str(q.get("correct", "")).lower().strip()
        elif q_type == "error_detection":
            is_correct = ans.get("answer") == q.get("has_error")

        if is_correct:
            correct += 1
            diagnostics[tests_area] = diagnostics.get(tests_area, 0) + 1

        results.append({
            "question_id": q["id"],
            "correct": is_correct,
            "explanation": q.get("explanation", ""),
            "user_answer": ans.get("answer"),
        })

    score = round((correct / total) * 100) if total > 0 else 0
    mastery = "mastered" if score >= 90 else "good" if score >= 70 else "needs_review" if score >= 50 else "retry"
    stars = 3 if score >= 90 else 2 if score >= 70 else 1 if score >= 50 else 0

    # Build diagnostic message
    weak_areas = []
    for area in ["form", "meaning", "usage", "recognition"]:
        t = diagnostics.get(f"{area}_total", 0)
        c = diagnostics.get(area, 0)
        if t > 0 and c / t < 0.7:
            weak_areas.append(area)

    diagnostic_msg = ""
    if not weak_areas:
        diagnostic_msg = "Excellent! You have a strong understanding of all aspects."
    else:
        diagnostic_msg = f"Focus on improving: {', '.join(weak_areas)}."

    result = {
        "score": score,
        "correct": correct,
        "total": total,
        "mastery": mastery,
        "stars": stars,
        "diagnostic_message": diagnostic_msg,
        "weak_areas": weak_areas,
        "diagnostics": diagnostics,
        "results": results,
    }

    # Save progress
    await save_grammar_progress(GrammarProgressRequest(
        user_id=req.user_id,
        module_id=module_id,
        stage="quiz",
        completed=True,
        score=score,
        diagnostics={"weak_areas": weak_areas, "mastery": mastery},
    ))

    return result
