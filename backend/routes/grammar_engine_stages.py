"""
Grammar Engine content generation — the 5 learning stages (learn /
practice / quiz / guided / free) built via LLM with Mongo cache.
Extracted from routes/grammar_engine.py (Faz 1 refactor, 2026-07-02).
"""

import json
import logging

from fastapi import HTTPException

from routes.grammar_engine_core import (
    router,
    call_llm,
    get_cached,
    set_cached,
    get_module_grammar,
)
from routes.grammar_engine_validators import _payload_is_valid

logger = logging.getLogger(__name__)

# ═══════════════════════════════════════════
# STAGE 1: LEARN
# ═══════════════════════════════════════════

@router.get("/{module_id}/learn")
async def get_grammar_learn(module_id: str):
    """Get rich Learn content for a grammar topic"""
    cached = await get_cached(module_id, "learn")
    if cached and _payload_is_valid("learn", cached):
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
        if not _payload_is_valid("learn", data):
            raise ValueError("Generated learn payload failed validation")
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
    if cached and _payload_is_valid("practice", cached):
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
- Make all options plausible (no obviously wrong answers)
- ALL options and sentences must be REAL, COMPLETE English text - NOT placeholders
- For transformation: make model_answer and acceptable_answers DIFFERENT from each other (no duplicates)
- Each acceptable_answer should express the idea in a slightly different but still correct way"""

    try:
        raw = await call_llm(system, prompt)
        text = raw.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1] if "\n" in text else text[3:]
            text = text.rsplit("```", 1)[0]
        data = json.loads(text)
        if not _payload_is_valid("practice", data):
            raise ValueError("Generated practice payload failed validation")
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
    if cached and _payload_is_valid("quiz", cached):
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
      "question": "Choose the grammatically correct sentence.",
      "options": ["A real English sentence using the grammar correctly", "A similar sentence with a grammar error", "Another sentence with a different error", "A fourth sentence with yet another error"],
      "correct_index": 0,
      "explanation": "Explain why the first option is correct and what errors the others have",
      "difficulty": "easy",
      "tests": "form"
    }},
    {{
      "id": "q2",
      "type": "multiple_choice",
      "question": "Which sentence correctly uses {grammar.get('title', '')}?",
      "options": ["Real sentence A with correct grammar", "Real sentence B with error", "Real sentence C with error", "Real sentence D with error"],
      "correct_index": 0,
      "explanation": "Explanation with grammar rule reference",
      "difficulty": "easy",
      "tests": "form"
    }},
    {{
      "id": "q3",
      "type": "gap_fill",
      "sentence": "A natural sentence about {module_title} with ___ blank for the target grammar.",
      "options": ["correct form", "wrong form 1", "wrong form 2", "wrong form 3"],
      "correct": "correct form",
      "explanation": "Why this form is correct in this context",
      "difficulty": "medium",
      "tests": "form"
    }},
    {{
      "id": "q4",
      "type": "gap_fill",
      "sentence": "Another context sentence about {module_title} where ___ requires the grammar.",
      "options": ["word1", "word2", "word3", "word4"],
      "correct": "word2",
      "explanation": "Why this word fits the grammar rule",
      "difficulty": "medium",
      "tests": "usage"
    }},
    {{
      "id": "q5",
      "type": "error_detection",
      "sentence": "A complete sentence about {module_title} that contains a subtle grammar error.",
      "has_error": true,
      "error_word": "the specific wrong word",
      "correct_word": "what it should be",
      "explanation": "Why this is an error and how to fix it",
      "difficulty": "medium",
      "tests": "form"
    }},
    {{
      "id": "q6",
      "type": "error_detection",
      "sentence": "A grammatically perfect sentence using {grammar.get('title', '')} correctly.",
      "has_error": false,
      "error_word": "",
      "correct_word": "",
      "explanation": "This sentence is correct because it properly uses...",
      "difficulty": "medium",
      "tests": "recognition"
    }},
    {{
      "id": "q7",
      "type": "multiple_choice",
      "question": "Read the context and choose the best completion: [A specific IELTS-like context about {module_title}]",
      "options": ["A complete sentence using one grammar form", "A complete sentence using a different grammar form", "A complete sentence using yet another form", "A complete sentence with a common error"],
      "correct_index": 0,
      "explanation": "Why this grammar form is most appropriate in this academic context",
      "difficulty": "hard",
      "tests": "usage"
    }},
    {{
      "id": "q8",
      "type": "multiple_choice",
      "question": "A nuanced question about when NOT to use {grammar.get('title', '')}",
      "options": ["Real sentence A", "Real sentence B", "Real sentence C", "Real sentence D"],
      "correct_index": 2,
      "explanation": "Detailed explanation of the grammatical nuance",
      "difficulty": "hard",
      "tests": "meaning"
    }},
    {{
      "id": "q9",
      "type": "gap_fill",
      "sentence": "In a formal IELTS essay about {module_title}, the writer states: ___.",
      "options": ["form1", "form2", "form3", "form4"],
      "correct": "form3",
      "explanation": "Why this form is needed in formal academic writing",
      "difficulty": "hard",
      "tests": "form"
    }},
    {{
      "id": "q10",
      "type": "multiple_choice",
      "question": "Which sentence would score highest in an IELTS Writing Task 2 about {module_title}?",
      "options": ["A Band 5.5 level sentence with basic grammar", "A Band 6.5 sentence with some complexity", "A Band 7.5 sentence using {grammar.get('title', '')} naturally and accurately"],
      "correct_index": 2,
      "explanation": "Why this demonstrates Band 7+ grammar control",
      "difficulty": "hard",
      "tests": "usage"
    }}
  ]
}}

IMPORTANT:
- EXACTLY 10 questions
- Mix of easy (2), medium (4), hard (4) 
- Test different aspects: form, meaning, usage, recognition
- All related to: {grammar.get('title', '')} in context of {module_title}
- Questions should be progressively harder
- Make distractors plausible
- ALL options must be REAL English sentences or words, NOT placeholder text like "Option A" or "Structure B"
- Every option should be a complete, natural English sentence or phrase
- Do NOT use labels like "grammar A", "grammar B" in the options"""

    try:
        raw = await call_llm(system, prompt)
        text = raw.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1] if "\n" in text else text[3:]
            text = text.rsplit("```", 1)[0]
        data = json.loads(text)
        if not _payload_is_valid("quiz", data):
            raise ValueError("Generated quiz payload failed validation")
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
    if cached and _payload_is_valid("guided", cached):
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
        if not _payload_is_valid("guided", data):
            raise ValueError("Generated guided payload failed validation")
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
    if cached and _payload_is_valid("free", cached):
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
        if not _payload_is_valid("free", data):
            raise ValueError("Generated free payload failed validation")
        await set_cached(module_id, "free", data)
        return data
    except json.JSONDecodeError:
        logger.error(f"Failed to parse Free JSON for {module_id}")
        raise HTTPException(status_code=500, detail="Failed to generate free prompts")
    except Exception as e:
        logger.error(f"LLM error for free prompts {module_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate free prompts")
