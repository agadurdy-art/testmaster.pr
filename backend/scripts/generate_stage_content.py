"""
Stage Content Generator
Uses GPT-4o to generate full lesson content from vocabulary + grammar + context.
Outputs JSON matching Stage 1 template format.
"""

import os
import json
import re
import asyncio
import sys
from dotenv import load_dotenv

load_dotenv()
sys.path.insert(0, '/app/backend')

from emergentintegrations.llm.chat import LlmChat, UserMessage


EMOJI_MAP = {
    "hello": "👋", "hi": "🙋", "answer": "✋", "listen": "👂",
    "they": "👥", "name": "📛", "new": "✨", "old": "📅",
    "alphabet": "🔤", "spell": "✏️", "letter": "📝", "word": "💬",
    "eleven": "1️⃣1️⃣", "twelve": "1️⃣2️⃣", "thirteen": "1️⃣3️⃣", "fourteen": "1️⃣4️⃣", "fifteen": "1️⃣5️⃣",
    "sixteen": "1️⃣6️⃣", "seventeen": "1️⃣7️⃣", "eighteen": "1️⃣8️⃣", "nineteen": "1️⃣9️⃣", "twenty": "2️⃣0️⃣",
    "purple": "🟣", "grey": "⬜", "brown": "🟫", "white": "⚪", "black": "⚫", "rainbow": "🌈",
    "desk": "🪑", "chair": "💺", "board": "📋", "computer": "💻", "door": "🚪", "window": "🪟",
    "in": "📦", "on": "⬆️", "under": "⬇️", "behind": "🔙", "next to": "↔️", "wall": "🧱", "floor": "🏠",
    "shoulders": "💪", "knees": "🦵", "toes": "🦶", "arm": "💪", "leg": "🦵",
    "jump": "🤸", "run": "🏃", "sing": "🎤", "dance": "💃",
    "can": "✅", "can't": "❌", "swim": "🏊", "climb": "🧗",
    "giraffe": "🦒", "hippo": "🦛", "zebra": "🦓", "snake": "🐍",
    "spider": "🕷️", "frog": "🐸", "lizard": "🦎", "tail": "🐾",
    "long neck": "🦒", "big ears": "🐘", "scary": "😱", "funny": "😂",
    "son": "👦", "daughter": "👧", "baby": "👶", "parent": "👨‍👩‍👧",
    "uncle": "👨", "aunt": "👩", "cousin": "🧑",
    "man": "👨", "woman": "👩", "children": "👧👦", "person": "🧑",
    "chicken": "🍗", "rice": "🍚", "beans": "🫘", "bread": "🍞",
    "water": "💧", "juice": "🧃", "milk": "🥛", "hot": "🔥", "cold": "❄️",
    "like": "👍", "don't like": "👎", "favorite": "⭐", "fruit": "🍎",
    "kitchen": "🍳", "bathroom": "🚿", "bedroom": "🛏️", "living room": "🛋️",
    "mirror": "🪞", "clock": "🕐", "phone": "📱", "stairs": "🪜",
    "there is": "☝️", "there are": "✌️", "many": "📊", "some": "🔢",
    "eating": "🍽️", "drinking": "🥤", "playing": "⚽", "wearing": "👕",
    "sleeping": "😴", "drawing": "🎨", "watching TV": "📺", "listening to music": "🎧",
    "shirt": "👔", "skirt": "👗", "dress": "👗", "trousers": "👖",
    "shoes": "👟", "socks": "🧦", "jacket": "🧥", "hat": "🎩",
    "glasses": "👓", "handbag": "👜", "clean": "✨", "dirty": "🤢",
    "basketball": "🏀", "football": "⚽", "tennis": "🎾", "game": "🎮",
    "guitar": "🎸", "piano": "🎹", "paint": "🖌️", "photo": "📷",
    "always": "♾️", "never": "🚫", "sometimes": "🔄", "radio": "📻",
}


def get_emoji(word):
    return EMOJI_MAP.get(word.lower(), "📚")


async def generate_lesson_content(unit_data: dict, lesson_data: dict, stage_grammar: list) -> dict:
    """Generate full lesson content via GPT-4o."""
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    unit_num = unit_data["unit_num"]
    lesson_num = lesson_data["lesson_num"]
    lesson_id = f"stage_2_unit_{unit_num:02d}_lesson_{lesson_num:02d}"
    is_review = lesson_data.get("is_review", False)

    chat = LlmChat(
        api_key=api_key,
        session_id=f"gen_{lesson_id}",
        system_message="You are an expert ESL curriculum designer for young learners (ages 6-10). Return ONLY valid JSON."
    ).with_model("openai", "gpt-4o")

    if is_review:
        return await _generate_review_lesson(chat, unit_data, lesson_data, lesson_id)

    vocab_list = lesson_data.get("vocab", [])
    context = lesson_data.get("context", "")
    grammar = ", ".join(unit_data.get("grammar_focus", []))

    prompt = f"""Generate a complete ESL lesson for young learners (ages 6-10).

LESSON: {lesson_data['title']} (Unit {unit_num}: {unit_data['title']})
VOCABULARY: {', '.join(vocab_list)}
GRAMMAR: {grammar}
CONTEXT: {context}

Return this EXACT JSON structure:
{{
  "warm_up": {{
    "question_text": "An engaging opening question related to {context}",
    "correct_answer": "correct option",
    "options": ["opt1", "opt2", "opt3", "opt4"],
    "image_emoji": "relevant emoji",
    "hint": "A helpful hint"
  }},
  "vocabulary": {{
    "items": [
      {{"word": "WORD1", "ipa": "/phonetic/", "definition": "Simple definition", "example": "Example sentence", "image_emoji": "emoji"}},
      {{"word": "WORD2", "ipa": "/phonetic/", "definition": "Simple definition", "example": "Example sentence", "image_emoji": "emoji"}}
    ]
  }},
  "micro_game_vocab": {{
    "question_text": "Match the emoji to the word: [emoji]",
    "correct_answer": "word",
    "options": ["word", "distractor1", "distractor2", "distractor3"]
  }},
  "micro_reading": {{
    "title": "Short story title",
    "text": "A 3-5 sentence passage using the vocabulary words. Set in the context of {context}. Simple language for A1 learners.",
    "questions": [
      {{"question": "Comprehension question?", "answer": "answer", "options": ["opt1", "opt2", "opt3"]}}
    ]
  }},
  "grammar_focus": {{
    "rule_pattern": "The main grammar pattern with ___ for blanks",
    "explanation": "Simple explanation for children",
    "examples": ["Example sentence 1", "Example sentence 2"]
  }},
  "grammar_game": {{
    "mode": "word_order",
    "words": ["shuffled", "words", "of", "sentence"],
    "correct_sentence": "Correct sentence with words in order."
  }},
  "listening": {{
    "audio_text": "A short dialogue or narration (2-3 sentences) using vocab and grammar",
    "questions": [
      {{"question": "Question about the listening?", "answer": "answer", "options": ["opt1", "opt2", "opt3"]}}
    ]
  }},
  "production": {{
    "prompt": "Say: [A sentence using vocab and grammar]",
    "expected_text": "The expected spoken text",
    "mode": "speaking"
  }},
  "exit_ticket": {{
    "question_text": "A grammar/vocab check question",
    "correct_answer": "correct",
    "options": ["opt1", "opt2", "opt3"]
  }}
}}

RULES:
- Generate ONE vocabulary item for EACH word: {', '.join(vocab_list)} (total {len(vocab_list)} items required)
- Grammar pattern: {grammar}
- Context: {context}
- All content in English only
- Keep sentences SHORT (max 8 words) for young learners
- IPA must be accurate
- Every vocabulary item needs a definition and example sentence
- Return ONLY valid JSON"""

    response = await chat.send_message(UserMessage(text=prompt))
    text = response.strip() if isinstance(response, str) else str(response)

    match = re.search(r"\{[\s\S]*\}", text)
    if not match:
        raise ValueError(f"No JSON in response for {lesson_id}")

    data = json.loads(match.group())

    # Build lesson structure matching Stage 1 format
    steps = []
    step_num = 0

    # 1. warm_up
    wu = data.get("warm_up", {})
    step_num += 1
    steps.append({
        "step": step_num, "type": "warm_up",
        "question_text": wu.get("question_text", ""),
        "correct_answer": wu.get("correct_answer", ""),
        "options": wu.get("options", []),
        "image_emoji": wu.get("image_emoji", ""),
        "hint": wu.get("hint", ""),
        "video_url": ""
    })

    # 2. vocabulary
    vocab = data.get("vocabulary", {})
    items = vocab.get("items", [])
    for item in items:
        if not item.get("image_emoji"):
            item["image_emoji"] = get_emoji(item.get("word", ""))
    step_num += 1
    steps.append({"step": step_num, "type": "vocabulary", "items": items})

    # 3. micro_game_vocab
    mg = data.get("micro_game_vocab", {})
    step_num += 1
    steps.append({
        "step": step_num, "type": "micro_game_vocab",
        "question_text": mg.get("question_text", ""),
        "correct_answer": mg.get("correct_answer", ""),
        "options": mg.get("options", [])
    })

    # 4. micro_reading
    mr = data.get("micro_reading", {})
    step_num += 1
    steps.append({
        "step": step_num, "type": "micro_reading",
        "title": mr.get("title", lesson_data["title"]),
        "text": mr.get("text", ""),
        "questions": mr.get("questions", [])
    })

    # 5. grammar_focus
    gf = data.get("grammar_focus", {})
    step_num += 1
    steps.append({
        "step": step_num, "type": "grammar_focus",
        "rule_pattern": gf.get("rule_pattern", ""),
        "explanation": gf.get("explanation", ""),
        "examples": gf.get("examples", [])
    })

    # 6. grammar_game
    gg = data.get("grammar_game", {})
    step_num += 1
    steps.append({
        "step": step_num, "type": "grammar_game",
        "mode": gg.get("mode", "word_order"),
        "words": gg.get("words", []),
        "correct_sentence": gg.get("correct_sentence", "")
    })

    # 7. listening
    ls = data.get("listening", {})
    step_num += 1
    steps.append({
        "step": step_num, "type": "listening",
        "audio_text": ls.get("audio_text", ""),
        "questions": ls.get("questions", [])
    })

    # 8. production
    pr = data.get("production", {})
    step_num += 1
    steps.append({
        "step": step_num, "type": "production",
        "prompt": pr.get("prompt", ""),
        "expected_text": pr.get("expected_text", ""),
        "mode": pr.get("mode", "speaking")
    })

    # 9. exit_ticket
    et = data.get("exit_ticket", {})
    step_num += 1
    steps.append({
        "step": step_num, "type": "exit_ticket",
        "question_text": et.get("question_text", ""),
        "correct_answer": et.get("correct_answer", ""),
        "options": et.get("options", [])
    })

    return {
        "lesson_num": lesson_num,
        "lesson_id": lesson_id,
        "title": lesson_data["title"],
        "topic": lesson_data.get("topic", ""),
        "extra_links": [],
        "steps": steps
    }


async def _generate_review_lesson(chat, unit_data, lesson_data, lesson_id):
    """Generate a review lesson with vocabulary_review + grammar_review."""
    unit_num = unit_data["unit_num"]
    lesson_num = lesson_data["lesson_num"]

    # Collect all vocab from this unit's non-review lessons
    all_vocab = []
    for l in unit_data.get("lessons", []):
        if not l.get("is_review"):
            all_vocab.extend(l.get("vocab", []))

    grammar = ", ".join(unit_data.get("grammar_focus", []))
    context = lesson_data.get("context", "")

    prompt = f"""Generate a REVIEW lesson for young ESL learners (ages 6-10).

UNIT: {unit_data['title']}
ALL VOCABULARY TO REVIEW: {', '.join(all_vocab)}
GRAMMAR PATTERNS: {grammar}
CONTEXT: {context}

Return this EXACT JSON:
{{
  "warm_up": {{
    "question_text": "Review question mixing vocab from this unit",
    "correct_answer": "answer",
    "options": ["opt1", "opt2", "opt3", "opt4"],
    "image_emoji": "emoji",
    "hint": "hint"
  }},
  "vocabulary_review_items": {json.dumps(all_vocab)},
  "micro_game_vocab": {{
    "question_text": "Match: emoji",
    "correct_answer": "word",
    "options": ["word", "d1", "d2", "d3"]
  }},
  "micro_reading": {{
    "title": "Review story title",
    "text": "A passage using multiple vocabulary words from this unit",
    "questions": [{{"question": "Q?", "answer": "A", "options": ["A", "B", "C"]}}]
  }},
  "grammar_review_patterns": {json.dumps(unit_data.get('grammar_focus', []))},
  "grammar_game": {{
    "mode": "word_order",
    "words": ["scrambled", "words"],
    "correct_sentence": "Correct sentence."
  }},
  "listening": {{
    "audio_text": "Review listening text using all unit vocab",
    "questions": [{{"question": "Q?", "answer": "A", "options": ["A", "B", "C"]}}]
  }},
  "production": {{
    "prompt": "Say a sentence using words from this unit",
    "expected_text": "expected text",
    "mode": "speaking"
  }},
  "exit_ticket": {{
    "question_text": "Mastery check question",
    "correct_answer": "answer",
    "options": ["opt1", "opt2", "opt3"]
  }}
}}

Return ONLY valid JSON."""

    response = await chat.send_message(UserMessage(text=prompt))
    text = response.strip() if isinstance(response, str) else str(response)

    match = re.search(r"\{[\s\S]*\}", text)
    if not match:
        raise ValueError(f"No JSON for review {lesson_id}")

    data = json.loads(match.group())
    steps = []
    step_num = 0

    # warm_up
    wu = data.get("warm_up", {})
    step_num += 1
    steps.append({
        "step": step_num, "type": "warm_up",
        "question_text": wu.get("question_text", ""),
        "correct_answer": wu.get("correct_answer", ""),
        "options": wu.get("options", []),
        "image_emoji": wu.get("image_emoji", ""),
        "hint": wu.get("hint", ""),
        "video_url": ""
    })

    # vocabulary_review
    review_items = []
    for w in all_vocab:
        review_items.append({
            "word": w, "ipa": "", "definition": "",
            "example": "", "image_emoji": get_emoji(w)
        })
    step_num += 1
    steps.append({"step": step_num, "type": "vocabulary_review", "items": review_items})

    # micro_game_vocab
    mg = data.get("micro_game_vocab", {})
    step_num += 1
    steps.append({
        "step": step_num, "type": "micro_game_vocab",
        "question_text": mg.get("question_text", ""),
        "correct_answer": mg.get("correct_answer", ""),
        "options": mg.get("options", [])
    })

    # micro_reading
    mr = data.get("micro_reading", {})
    step_num += 1
    steps.append({
        "step": step_num, "type": "micro_reading",
        "title": mr.get("title", "Review"),
        "text": mr.get("text", ""),
        "questions": mr.get("questions", [])
    })

    # grammar_review
    step_num += 1
    steps.append({
        "step": step_num, "type": "grammar_review",
        "patterns": unit_data.get("grammar_focus", [])
    })

    # grammar_game
    gg = data.get("grammar_game", {})
    step_num += 1
    steps.append({
        "step": step_num, "type": "grammar_game",
        "mode": gg.get("mode", "word_order"),
        "words": gg.get("words", []),
        "correct_sentence": gg.get("correct_sentence", "")
    })

    # listening
    ls = data.get("listening", {})
    step_num += 1
    steps.append({
        "step": step_num, "type": "listening",
        "audio_text": ls.get("audio_text", ""),
        "questions": ls.get("questions", [])
    })

    # production
    pr = data.get("production", {})
    step_num += 1
    steps.append({
        "step": step_num, "type": "production",
        "prompt": pr.get("prompt", ""),
        "expected_text": pr.get("expected_text", ""),
        "mode": pr.get("mode", "speaking")
    })

    # exit_ticket
    et = data.get("exit_ticket", {})
    step_num += 1
    steps.append({
        "step": step_num, "type": "exit_ticket",
        "question_text": et.get("question_text", ""),
        "correct_answer": et.get("correct_answer", ""),
        "options": et.get("options", [])
    })

    return {
        "lesson_num": lesson_num,
        "lesson_id": lesson_id,
        "title": lesson_data["title"],
        "topic": lesson_data.get("topic", "review"),
        "extra_links": [],
        "steps": steps
    }


async def generate_unit(unit_data: dict):
    """Generate all 4 lessons for a unit."""
    unit_num = unit_data["unit_num"]
    unit_str = str(unit_num).zfill(2)
    output_path = f"/app/backend/content/stage2_unit{unit_str}.json"

    lessons = []
    for lesson_data in unit_data["lessons"]:
        print(f"  Generating lesson {lesson_data['lesson_num']}: {lesson_data['title']}...")
        try:
            lesson = await generate_lesson_content(unit_data, lesson_data, unit_data.get("grammar_focus", []))
            lessons.append(lesson)
            print(f"    ✅ {len(lesson['steps'])} steps generated")
        except Exception as e:
            print(f"    ❌ FAILED: {e}")
            raise
        await asyncio.sleep(1)

    result = {
        "stage": "stage_2",
        "stage_title": "Starters (A1)",
        "units": [{
            "unit_id": f"stage_2_unit_{unit_str}",
            "unit_num": unit_num,
            "title": unit_data["title"],
            "subtitle": unit_data.get("subtitle", ""),
            "phonics_focus": unit_data.get("phonics_focus", []),
            "grammar_focus": unit_data.get("grammar_focus", []),
            "lessons": lessons
        }]
    }

    with open(output_path, 'w') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    print(f"  ✅ Saved to {output_path}")
    return output_path


async def main():
    from content.stage2_master_data import STAGE_2_DATA

    unit_nums = [int(x) for x in sys.argv[1:]] if len(sys.argv) > 1 else [1]

    for unit_num in unit_nums:
        unit_data = next((u for u in STAGE_2_DATA["units"] if u["unit_num"] == unit_num), None)
        if not unit_data:
            print(f"Unit {unit_num} not found!")
            continue
        print(f"\n=== Generating Unit {unit_num}: {unit_data['title']} ===")
        await generate_unit(unit_data)


if __name__ == "__main__":
    asyncio.run(main())
