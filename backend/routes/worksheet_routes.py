"""Worksheet generation endpoint - GPT-4o powered PDF exercises."""

import os
import json
import hashlib
from typing import Optional
from fastapi import APIRouter, Query
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/api/worksheet", tags=["worksheet"])

CACHE_DIR = "/app/backend/content/worksheets"
os.makedirs(CACHE_DIR, exist_ok=True)

mongo_url = os.environ.get("MONGO_URL")
db_name = os.environ.get("DB_NAME", "ielts_ace")
client = AsyncIOMotorClient(mongo_url)
db = client[db_name]


def _cache_key(lesson_id: str, mode: str) -> str:
    return hashlib.md5(f"{lesson_id}_{mode}".encode()).hexdigest()


async def _get_cached(lesson_id: str, mode: str):
    path = f"{CACHE_DIR}/{_cache_key(lesson_id, mode)}.json"
    if os.path.exists(path):
        with open(path, "r") as f:
            return json.load(f)
    return None


def _save_cache(lesson_id: str, mode: str, data: dict):
    path = f"{CACHE_DIR}/{_cache_key(lesson_id, mode)}.json"
    with open(path, "w") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


async def _collect_words_and_rules(lesson_id: str, max_words: int = 20):
    """Collect vocabulary and grammar from lessons up to lesson_id."""
    import random

    parts = lesson_id.split("_")
    stage_id = f"{parts[0]}_{parts[1]}"
    unit_num = int(parts[3])
    lesson_num = int(parts[5])

    lesson_ids = []
    for u in range(1, unit_num + 1):
        max_l = lesson_num if u == unit_num else 4
        for l in range(1, max_l + 1):
            lesson_ids.append(f"{stage_id}_unit_{u:02d}_lesson_{l:02d}")

    lessons = await db.unified_lessons.find(
        {"lesson_id": {"$in": lesson_ids}},
        {"_id": 0, "lesson_id": 1, "activity_flow": 1},
    ).to_list(length=200)

    all_words, seen = [], set()
    all_rules, seen_r = [], set()

    for doc in lessons:
        for act in doc.get("activity_flow", []):
            if act.get("type") == "vocabulary":
                for w in act.get("data", {}).get("words", []):
                    wk = w.get("word", "").lower()
                    if wk and wk not in seen:
                        seen.add(wk)
                        all_words.append(w)
            elif act.get("type") == "grammar_focus":
                d = act.get("data", {})
                r = d.get("rule", "")
                if r and r not in seen_r:
                    seen_r.add(r)
                    all_rules.append({"pattern": r, "explanation": d.get("explanation", ""), "examples": d.get("examples", [])})

    if len(all_words) > max_words:
        all_words = random.sample(all_words, max_words)

    return all_words, all_rules, len(lesson_ids)


async def _generate_exercises_gpt4o(words: list, rules: list, lesson_title: str) -> dict:
    """Use GPT-4o to generate teacher-quality worksheet exercises."""
    from emergentintegrations.llm.chat import LlmChat, UserMessage

    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        return _generate_exercises_local(words, rules)

    word_list = ", ".join(w.get("word", "") for w in words)
    rule_list = "; ".join(r.get("pattern", "") for r in rules)

    prompt = f"""You are an expert ESL teacher creating a printable worksheet for young English learners (ages 5-10).

VOCABULARY ({len(words)} words): {word_list}
GRAMMAR PATTERNS ({len(rules)}): {rule_list}

Generate a worksheet with these EXACT sections in JSON:
{{
  "vocabulary_section": {{
    "matching": [
      {{"word": "...", "definition": "...", "distractor_definitions": ["...", "..."]}}
    ],
    "fill_blank": [
      {{"sentence": "I see a ___.", "answer": "cat", "hint": "an animal"}}
    ],
    "true_false": [
      {{"statement": "A 'cat' is an animal.", "answer": true}}
    ]
  }},
  "grammar_section": {{
    "reorder": [
      {{"scrambled": "is / It / a / cat", "answer": "It is a cat."}}
    ],
    "correct_mistake": [
      {{"sentence": "It a cat is.", "corrected": "It is a cat."}}
    ],
    "complete_pattern": [
      {{"pattern": "I am a ___.", "answer": "student", "options": ["student", "am", "the"]}}
    ]
  }},
  "mixed_review": [
    {{"type": "multiple_choice", "question": "What does 'hello' mean?", "options": ["A greeting", "A food", "A color"], "answer": "A greeting"}}
  ]
}}

Rules:
- Use ONLY the vocabulary words provided, no other words
- Create 5-8 items per section (matching, fill_blank, true_false, reorder, correct_mistake, complete_pattern)
- mixed_review: 5 questions mixing vocab and grammar
- Keep language simple for young learners
- Every item must have a clear, unambiguous answer
- Return ONLY valid JSON, no markdown"""

    try:
        chat = LlmChat(
            api_key=api_key,
            session_id=f"worksheet_{lesson_title}",
            system_message="You are an expert ESL teacher. Return ONLY valid JSON."
        ).with_model("openai", "gpt-4o")

        response = await chat.send_message(UserMessage(text=prompt))
        text = response.strip() if isinstance(response, str) else str(response)

        # Parse JSON
        import re
        match = re.search(r"\{[\s\S]*\}", text)
        if match:
            return json.loads(match.group())
    except Exception as e:
        print(f"GPT-4o worksheet generation failed: {e}")

    return _generate_exercises_local(words, rules)


def _generate_exercises_local(words: list, rules: list) -> dict:
    """Fallback: generate basic exercises without AI."""
    import random

    matching = []
    for w in words[:8]:
        matching.append({
            "word": w.get("word", ""),
            "definition": w.get("definition", w.get("meaning", "")),
            "distractor_definitions": []
        })

    fill_blank = []
    for w in words[:8]:
        ex = w.get("example", w.get("example_sentence", f"This is a {w.get('word', '')}."))
        blanked = ex.replace(w.get("word", ""), "___")
        fill_blank.append({"sentence": blanked, "answer": w.get("word", ""), "hint": ""})

    reorder = []
    for r in rules[:5]:
        pat = r.get("pattern", "")
        if pat:
            words_list = pat.replace("___", "student").split()
            random.shuffle(words_list)
            reorder.append({"scrambled": " / ".join(words_list), "answer": pat.replace("___", "student")})

    return {
        "vocabulary_section": {"matching": matching, "fill_blank": fill_blank, "true_false": []},
        "grammar_section": {"reorder": reorder, "correct_mistake": [], "complete_pattern": []},
        "mixed_review": []
    }


@router.get("/generate/{lesson_id}")
async def generate_worksheet(
    lesson_id: str,
    mode: str = Query("current", description="current or cumulative"),
    max_words: int = Query(20, description="Max vocabulary words to include"),
    force_refresh: bool = Query(False, description="Force regenerate (skip cache)")
):
    """Generate a teacher-quality worksheet with GPT-4o exercises.
    Results are cached locally so repeated calls don't use credits."""

    # Check cache first
    if not force_refresh:
        cached = await _get_cached(lesson_id, mode)
        if cached:
            return cached

    # Get lesson info
    lesson = await db.unified_lessons.find_one(
        {"lesson_id": lesson_id}, {"_id": 0, "title": 1, "unit_id": 1}
    )
    title = lesson.get("title", "Lesson") if lesson else "Lesson"

    if mode == "cumulative":
        words, rules, total_lessons = await _collect_words_and_rules(lesson_id, max_words)
    else:
        # Current lesson only
        lesson_doc = await db.unified_lessons.find_one(
            {"lesson_id": lesson_id}, {"_id": 0, "activity_flow": 1}
        )
        words, rules = [], []
        if lesson_doc:
            for act in lesson_doc.get("activity_flow", []):
                if act.get("type") == "vocabulary":
                    words = act.get("data", {}).get("words", [])
                elif act.get("type") == "grammar_focus":
                    d = act.get("data", {})
                    r = d.get("rule", "")
                    if r:
                        rules.append({"pattern": r, "explanation": d.get("explanation", ""), "examples": d.get("examples", [])})
        total_lessons = 1

    exercises = await _generate_exercises_gpt4o(words, rules, title)

    result = {
        "lesson_id": lesson_id,
        "lesson_title": title,
        "mode": mode,
        "words": words,
        "grammar_rules": rules,
        "exercises": exercises,
        "total_lessons": total_lessons,
        "word_count": len(words),
    }

    _save_cache(lesson_id, mode, result)
    return result
