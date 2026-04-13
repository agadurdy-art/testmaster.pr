"""
Seed enriched grammar games with 3 game types:
- error_hunter: Is this sentence correct?
- word_order: Arrange words into correct sentence
- fill_blank: Choose the correct word for the blank
"""
import asyncio
import os
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# ═══ LESSON 1: Say Hello (Greetings) ═══
GRAMMAR_GAME_L1 = {
    "activity_id": "game_grammar_s1u1l1",
    "lesson_id": "stage_1_unit_01_lesson_01",
    "type": "micro_game_grammar",
    "game_type": "mixed",
    "items": [
        {"sentence": "Hello! How are you?", "has_error": False, "correct_sentence": "Hello! How are you?"},
        {"sentence": "Good morning teacher!", "has_error": True, "correct_sentence": "Good morning, teacher!"},
        {"sentence": "Goodbye! See you!", "has_error": False, "correct_sentence": "Goodbye! See you!"},
        {"sentence": "Good night, Mom Dad!", "has_error": True, "correct_sentence": "Good night, Mom and Dad!"},
    ],
    "word_order_items": [
        {"words": ["Hello", "How", "are", "you?"], "correct_sentence": "Hello How are you?", "hint": "Greet someone and ask how they are"},
        {"words": ["Good", "morning", "teacher!"], "correct_sentence": "Good morning teacher!", "hint": "Morning greeting"},
        {"words": ["See", "you", "tomorrow!"], "correct_sentence": "See you tomorrow!", "hint": "Say goodbye"},
        {"words": ["Good", "night", "Mom!"], "correct_sentence": "Good night Mom!", "hint": "Bedtime greeting"},
    ],
    "fill_blank_items": [
        {"sentence": "_____ morning, teacher!", "options": ["Good", "Bye", "Night", "See"], "correct_answer": "Good"},
        {"sentence": "Goodbye! _____ you later!", "options": ["Good", "See", "Hello", "Night"], "correct_answer": "See"},
        {"sentence": "Good _____, Mom and Dad!", "options": ["morning", "hello", "night", "bye"], "correct_answer": "night"},
        {"sentence": "_____, how are you?", "options": ["Goodbye", "Night", "Hello", "See"], "correct_answer": "Hello"},
    ],
    "time_limit_seconds": 300,
    "scoring": {"perfect": 90, "good": 70, "pass": 50},
    "created_at": datetime.now(timezone.utc).isoformat()
}

# ═══ LESSON 2: What's Your Name? ═══
GRAMMAR_GAME_L2 = {
    "activity_id": "game_grammar_s1u1l2",
    "lesson_id": "stage_1_unit_01_lesson_02",
    "type": "micro_game_grammar",
    "game_type": "mixed",
    "items": [
        {"sentence": "What is your name?", "has_error": False, "correct_sentence": "What is your name?"},
        {"sentence": "My name Tom.", "has_error": True, "correct_sentence": "My name is Tom."},
        {"sentence": "His name is Ali.", "has_error": False, "correct_sentence": "His name is Ali."},
        {"sentence": "What your name?", "has_error": True, "correct_sentence": "What is your name?"},
        {"sentence": "My name are Tom.", "has_error": True, "correct_sentence": "My name is Tom."},
    ],
    "word_order_items": [
        {"words": ["My", "name", "is", "Tom."], "correct_sentence": "My name is Tom.", "hint": "Introduce yourself"},
        {"words": ["What", "is", "your", "name?"], "correct_sentence": "What is your name?", "hint": "Ask someone's name"},
        {"words": ["I", "am", "a", "student."], "correct_sentence": "I am a student.", "hint": "Tell about yourself"},
        {"words": ["She", "is", "my", "friend."], "correct_sentence": "She is my friend.", "hint": "Talk about someone"},
    ],
    "fill_blank_items": [
        {"sentence": "My name _____ Sara.", "options": ["is", "am", "are", "be"], "correct_answer": "is"},
        {"sentence": "I _____ a student.", "options": ["is", "am", "are", "be"], "correct_answer": "am"},
        {"sentence": "What _____ your name?", "options": ["am", "are", "is", "be"], "correct_answer": "is"},
        {"sentence": "_____ is my friend.", "options": ["I", "She", "My", "Am"], "correct_answer": "She"},
    ],
    "time_limit_seconds": 300,
    "scoring": {"perfect": 90, "good": 70, "pass": 50},
    "created_at": datetime.now(timezone.utc).isoformat()
}

# ═══ LESSON 3: Nice to Meet You ═══
GRAMMAR_GAME_L3 = {
    "activity_id": "game_grammar_s1u1l3",
    "lesson_id": "stage_1_unit_01_lesson_03",
    "type": "micro_game_grammar",
    "game_type": "mixed",
    "items": [
        {"sentence": "Nice to meet you!", "has_error": False, "correct_sentence": "Nice to meet you!"},
        {"sentence": "Please help I.", "has_error": True, "correct_sentence": "Please help me."},
        {"sentence": "Thank you for your help!", "has_error": False, "correct_sentence": "Thank you for your help!"},
        {"sentence": "She is my a friend.", "has_error": True, "correct_sentence": "She is my friend."},
    ],
    "word_order_items": [
        {"words": ["Nice", "to", "meet", "you!"], "correct_sentence": "Nice to meet you!", "hint": "Polite greeting"},
        {"words": ["Thank", "you", "for", "your", "help!"], "correct_sentence": "Thank you for your help!", "hint": "Show gratitude"},
        {"words": ["She", "is", "my", "teacher."], "correct_sentence": "She is my teacher.", "hint": "Talk about someone"},
        {"words": ["Please", "help", "me."], "correct_sentence": "Please help me.", "hint": "Ask for help politely"},
    ],
    "fill_blank_items": [
        {"sentence": "Nice to _____ you!", "options": ["meet", "see", "help", "name"], "correct_answer": "meet"},
        {"sentence": "_____ you for your help!", "options": ["Please", "Thank", "Nice", "Good"], "correct_answer": "Thank"},
        {"sentence": "She is my _____.", "options": ["friend", "please", "thank", "meet"], "correct_answer": "friend"},
        {"sentence": "_____ help me.", "options": ["Thank", "Nice", "Please", "Good"], "correct_answer": "Please"},
    ],
    "time_limit_seconds": 300,
    "scoring": {"perfect": 90, "good": 70, "pass": 50},
    "created_at": datetime.now(timezone.utc).isoformat()
}

# ═══ LESSON 4: How Are You? ═══
GRAMMAR_GAME_L4 = {
    "activity_id": "game_grammar_s1u1l4",
    "lesson_id": "stage_1_unit_01_lesson_04",
    "type": "micro_game_grammar",
    "game_type": "mixed",
    "items": [
        {"sentence": "How are you?", "has_error": False, "correct_sentence": "How are you?"},
        {"sentence": "Im fine.", "has_error": True, "correct_sentence": "I'm fine."},
        {"sentence": "I'm happy.", "has_error": False, "correct_sentence": "I'm happy."},
        {"sentence": "How you?", "has_error": True, "correct_sentence": "How are you?"},
        {"sentence": "She are happy.", "has_error": True, "correct_sentence": "She is happy."},
    ],
    "word_order_items": [
        {"words": ["How", "are", "you", "today?"], "correct_sentence": "How are you today?", "hint": "Ask about feelings"},
        {"words": ["I", "am", "fine,", "thank", "you."], "correct_sentence": "I am fine, thank you.", "hint": "Answer about your feeling"},
        {"words": ["She", "is", "happy", "today."], "correct_sentence": "She is happy today.", "hint": "Talk about someone's feeling"},
        {"words": ["We", "are", "good!"], "correct_sentence": "We are good!", "hint": "Talk about a group"},
    ],
    "fill_blank_items": [
        {"sentence": "How _____ you?", "options": ["is", "am", "are", "be"], "correct_answer": "are"},
        {"sentence": "I _____ fine, thank you.", "options": ["is", "am", "are", "be"], "correct_answer": "am"},
        {"sentence": "She _____ happy today.", "options": ["am", "are", "is", "be"], "correct_answer": "is"},
        {"sentence": "_____ are good!", "options": ["I", "She", "We", "He"], "correct_answer": "We"},
    ],
    "time_limit_seconds": 300,
    "scoring": {"perfect": 90, "good": 70, "pass": 50},
    "created_at": datetime.now(timezone.utc).isoformat()
}


async def seed_grammar_games():
    mongo_url = os.environ.get('MONGO_URL')
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ.get('DB_NAME', 'ielts_ace')]

    print("Updating grammar games with multi-type content...")

    all_games = [GRAMMAR_GAME_L1, GRAMMAR_GAME_L2, GRAMMAR_GAME_L3, GRAMMAR_GAME_L4]

    for game in all_games:
        result = await db.unified_game_activities.update_one(
            {"lesson_id": game["lesson_id"], "type": "micro_game_grammar"},
            {"$set": game},
            upsert=True
        )
        action = "updated" if result.matched_count > 0 else "inserted"
        print(f"  {action}: {game['lesson_id']}")

    print(f"Done! {len(all_games)} grammar games ready with 3 game types each.")
    client.close()


if __name__ == "__main__":
    asyncio.run(seed_grammar_games())
