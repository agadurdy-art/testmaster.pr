"""
AI-Powered Exercise Generator for Testmaster
Uses GPT to generate pedagogically correct exercises from curriculum data.
Runs ONCE during seed - no per-user cost.
"""
import asyncio
import json
import os
import uuid
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage

load_dotenv()

API_KEY = os.environ.get("EMERGENT_LLM_KEY")

SYSTEM_PROMPT = """You are an expert ESL (English as a Second Language) teacher specializing in young learners (ages 4-12). 
You create pedagogically perfect exercises. Your rules:

1. FILL-IN-THE-BLANK: The sentence MUST have exactly one blank (______). The blank replaces ONE specific word.
   - The correct answer must be the ONLY word that fits grammatically AND contextually.
   - Distractors must be real English words but WRONG for this sentence (different category or meaning).
   - If the target word has plural/singular forms, use the CORRECT form in the answer.
   - Add a short hint that helps identify the answer without giving it away.

2. MULTIPLE CHOICE: Exactly ONE correct answer. Other options must be plausible English words but clearly wrong in context.
   - Never put two synonyms or interchangeable words as options.

3. WORD ORDER: Provide scrambled words that form exactly one correct sentence. Include punctuation in the correct_sentence but NOT in the words array.

You MUST return valid JSON only. No markdown, no explanation outside JSON."""


async def generate_grammar_exercises(unit_data, lesson_num, words_for_lesson):
    """Generate fill-blank and word-order exercises for a grammar game"""
    
    words_info = "\n".join([
        f"- {w['word']} ({w['definition']}), example: \"{w['example']}\""
        for w in words_for_lesson
    ])
    
    rules_info = "\n".join([
        f"- Pattern: {r['pattern']}, Examples: {', '.join(r['examples'][:2])}"
        for r in unit_data.get("grammar_rules", unit_data.get("grammar", []))
        if isinstance(r, dict)
    ])
    
    all_unit_words = "\n".join([f"- {w['word']}" for w in unit_data.get("words", [])])

    prompt = f"""Generate exercises for an English lesson.

UNIT TOPIC: {unit_data['title']} - {unit_data.get('subtitle', '')}
LESSON {lesson_num} VOCABULARY:
{words_info}

GRAMMAR RULES:
{rules_info}

ALL UNIT VOCABULARY (for context): 
{all_unit_words}

Generate EXACTLY this JSON structure:
{{
  "fill_blank_items": [
    {{
      "sentence": "I have two ______.",
      "correct_answer": "eyes",
      "options": ["eyes", "books", "chairs", "cats"],
      "hint": "We see with these"
    }},
    // Generate 3 fill-blank items using the lesson vocabulary
  ],
  "word_order_items": [
    {{
      "words": ["I", "have", "two", "eyes"],
      "correct_sentence": "I have two eyes."
    }},
    // Generate 2 word-order items
  ]
}}

CRITICAL RULES:
- Fill-blank: sentence must have ______ where the answer goes. The answer must be the ONLY correct option.
- Fill-blank: distractors must be from DIFFERENT categories (not same semantic group as the answer).
- Fill-blank: if the answer is plural (eyes, ears), the options must also be plural. Match the form.
- Word-order: words array must NOT include periods/punctuation. correct_sentence includes period.
- All content must be age-appropriate and match the unit topic.
- Return ONLY valid JSON, nothing else."""

    chat = LlmChat(
        api_key=API_KEY,
        session_id=f"seed_grammar_{unit_data['num']}_{lesson_num}_{uuid.uuid4().hex[:6]}",
        system_message=SYSTEM_PROMPT
    ).with_model("openai", "gpt-4.1-mini")

    response = await chat.send_message(UserMessage(text=prompt))
    
    # Parse JSON from response
    text = response.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    
    return json.loads(text)


async def generate_exit_questions(unit_data, lesson_num, words_for_lesson):
    """Generate exit quiz questions"""
    
    words_info = "\n".join([
        f"- {w['word']} ({w['definition']}), example: \"{w['example']}\""
        for w in words_for_lesson
    ])
    
    rules_info = "\n".join([
        f"- Pattern: {r['pattern']}, Examples: {', '.join(r['examples'][:2])}"
        for r in unit_data.get("grammar_rules", unit_data.get("grammar", []))
        if isinstance(r, dict)
    ])

    prompt = f"""Generate exit quiz questions for an English lesson.

UNIT TOPIC: {unit_data['title']} - {unit_data.get('subtitle', '')}
LESSON {lesson_num} VOCABULARY:
{words_info}

GRAMMAR RULES:
{rules_info}

Generate EXACTLY this JSON:
{{
  "questions": [
    {{
      "question_text": "What is 'a greeting when you meet someone'?",
      "correct_answer": "hello",
      "options": ["hello", "chair", "run", "blue"],
      "question_type": "multiple_choice"
    }},
    {{
      "question_text": "What is 'a person who teaches'?",
      "correct_answer": "teacher", 
      "options": ["teacher", "apple", "fast", "green"],
      "question_type": "multiple_choice"
    }},
    {{
      "question_text": "Complete: I have two ______.",
      "correct_answer": "eyes",
      "options": ["eyes", "tables", "songs", "colors"],
      "question_type": "multiple_choice",
      "hint": "We see with these"
    }},
    {{
      "question_text": "Write the missing word: She is my ______...",
      "correct_answer": "friend",
      "acceptable_answers": ["friend"],
      "question_type": "fill_blank"
    }}
  ]
}}

Generate exactly 4 questions:
- Q1: Vocabulary definition (multiple_choice) - test word 1
- Q2: Vocabulary definition (multiple_choice) - test word 2  
- Q3: Grammar pattern completion (multiple_choice) with hint
- Q4: Write the missing word (fill_blank) with acceptable_answers list

RULES:
- Multiple choice: exactly ONE correct answer. Distractors from DIFFERENT categories.
- Fill blank: include acceptable_answers array with ALL valid answers.
- All content age-appropriate for the unit topic.
- Return ONLY valid JSON."""

    chat = LlmChat(
        api_key=API_KEY,
        session_id=f"seed_exit_{unit_data['num']}_{lesson_num}_{uuid.uuid4().hex[:6]}",
        system_message=SYSTEM_PROMPT
    ).with_model("openai", "gpt-4.1-mini")

    response = await chat.send_message(UserMessage(text=prompt))
    
    text = response.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    
    return json.loads(text)


async def generate_warmup_questions(unit_data, lesson_num, words_for_lesson):
    """Generate warmup quiz questions with hints"""
    
    words_info = "\n".join([
        f"- {w['word']} ({w['definition']}), emoji: {w.get('emoji', '')}"
        for w in words_for_lesson
    ])

    prompt = f"""Generate warm-up review questions for an English lesson.

UNIT TOPIC: {unit_data['title']}
LESSON {lesson_num} VOCABULARY:
{words_info}

Generate EXACTLY this JSON:
{{
  "questions": [
    {{
      "question_text": "What does 'a round red fruit' mean?",
      "correct_answer": "apple",
      "options": ["apple", "chair", "fast", "blue"],
      "hint": "You can eat this fruit",
      "image_emoji": "🍎"
    }}
  ]
}}

Generate one question per vocabulary word ({len(words_for_lesson)} questions total).
RULES:
- Question asks for the WORD given the DEFINITION.
- Distractors must be from DIFFERENT categories than the correct answer.
- Include a helpful hint and the emoji for the word.
- Return ONLY valid JSON."""

    chat = LlmChat(
        api_key=API_KEY,
        session_id=f"seed_warmup_{unit_data['num']}_{lesson_num}_{uuid.uuid4().hex[:6]}",
        system_message=SYSTEM_PROMPT
    ).with_model("openai", "gpt-4.1-mini")

    response = await chat.send_message(UserMessage(text=prompt))
    
    text = response.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    
    return json.loads(text)


# Test function
async def test_generation():
    """Quick test to verify AI generation works"""
    test_unit = {
        "num": 6, "title": "Body Parts", "subtitle": "My Body",
        "words": [
            {"word": "eye", "definition": "The body part we see with", "example": "I have two eyes.", "emoji": "👁️"},
            {"word": "ear", "definition": "The body part we hear with", "example": "I have two ears.", "emoji": "👂"},
            {"word": "nose", "definition": "The body part we smell with", "example": "I have one nose.", "emoji": "👃"},
        ],
        "grammar": [{"pattern": "I have ___ ___.", "examples": ["I have two eyes.", "I have one nose."]}]
    }
    
    result = await generate_grammar_exercises(test_unit, 1, test_unit["words"])
    print("=== GRAMMAR EXERCISES ===")
    print(json.dumps(result, indent=2))
    return result


if __name__ == "__main__":
    asyncio.run(test_generation())
