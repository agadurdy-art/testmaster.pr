"""
Seed missing activity data for Stage 1 lessons.
Adds: retrieval_warmup, grammar_focus, micro_game_grammar
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
import uuid

load_dotenv(Path(__file__).parent / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

LESSONS = [
    {
        "lesson_id": "stage_1_unit_01_lesson_01",
        "title": "Say Hello",
        "warmup": {
            "activity_id": f"warmup_{uuid.uuid4().hex[:8]}",
            "questions": [
                {
                    "question_id": "w1_q1",
                    "question_type": "image_recall",
                    "question_text": "Which picture shows people greeting each other?",
                    "options": ["Two people waving", "A person sleeping", "A person eating", "A person reading"],
                    "correct_answer": "Two people waving"
                },
                {
                    "question_id": "w1_q2",
                    "question_type": "word_meaning",
                    "question_text": "What do you say when you meet someone?",
                    "options": ["Goodbye", "Hello", "Sorry", "Thanks"],
                    "correct_answer": "Hello"
                },
                {
                    "question_id": "w1_q3",
                    "question_type": "word_meaning",
                    "question_text": "Which word means the same as 'hi'?",
                    "options": ["Hello", "Bye", "No", "Yes"],
                    "correct_answer": "Hello"
                }
            ],
            "time_limit_seconds": 120
        },
        "grammar": {
            "activity_id": f"grammar_{uuid.uuid4().hex[:8]}",
            "rules": [
                {
                    "rule_id": "g1_r1",
                    "rule_text": "Use 'I am' when talking about yourself.",
                    "pattern": "I am + name/adjective",
                    "examples": [
                        {"correct": "I am happy.", "incorrect": "I happy."},
                        {"correct": "I am a student.", "incorrect": "I a student."}
                    ]
                },
                {
                    "rule_id": "g1_r2",
                    "rule_text": "Use 'You are' when talking to someone.",
                    "pattern": "You are + name/adjective",
                    "examples": [
                        {"correct": "You are nice.", "incorrect": "You nice."},
                        {"correct": "You are my friend.", "incorrect": "You my friend."}
                    ]
                }
            ],
            "example_sentences": [
                "I am Tom.", "You are Sara.", "I am happy.", "You are welcome."
            ],
            "pattern_highlight": "Subject + am/are + ..."
        },
        "grammar_game": {
            "activity_id": f"ggame_{uuid.uuid4().hex[:8]}",
            "game_type": "error_hunter",
            "items": [
                {"sentence": "I am happy.", "has_error": False, "correct_sentence": "I am happy."},
                {"sentence": "You is my friend.", "has_error": True, "correct_sentence": "You are my friend."},
                {"sentence": "I are a student.", "has_error": True, "correct_sentence": "I am a student."},
                {"sentence": "You are nice.", "has_error": False, "correct_sentence": "You are nice."},
                {"sentence": "I am is Tom.", "has_error": True, "correct_sentence": "I am Tom."},
                {"sentence": "You are welcome.", "has_error": False, "correct_sentence": "You are welcome."}
            ],
            "time_limit_seconds": 180,
            "scoring": {"perfect": 90, "good": 70, "pass": 50}
        }
    },
    {
        "lesson_id": "stage_1_unit_01_lesson_02",
        "title": "What's Your Name?",
        "warmup": {
            "activity_id": f"warmup_{uuid.uuid4().hex[:8]}",
            "questions": [
                {
                    "question_id": "w2_q1",
                    "question_type": "word_meaning",
                    "question_text": "How do you say 'hello' in a friendly way?",
                    "options": ["Bye", "Hi", "No", "Go"],
                    "correct_answer": "Hi"
                },
                {
                    "question_id": "w2_q2",
                    "question_type": "sentence_complete",
                    "question_text": "Complete: I ___ Tom.",
                    "options": ["is", "am", "are", "be"],
                    "correct_answer": "am"
                },
                {
                    "question_id": "w2_q3",
                    "question_type": "word_meaning",
                    "question_text": "What word do we use to ask about a name?",
                    "options": ["Where", "What", "How", "Why"],
                    "correct_answer": "What"
                }
            ],
            "time_limit_seconds": 120
        },
        "grammar": {
            "activity_id": f"grammar_{uuid.uuid4().hex[:8]}",
            "rules": [
                {
                    "rule_id": "g2_r1",
                    "rule_text": "Use 'What is your name?' to ask someone's name.",
                    "pattern": "What + is + your + name?",
                    "examples": [
                        {"correct": "What is your name?", "incorrect": "What your name?"},
                        {"correct": "My name is Sara.", "incorrect": "My name Sara."}
                    ]
                },
                {
                    "rule_id": "g2_r2",
                    "rule_text": "Use 'My name is...' to tell your name.",
                    "pattern": "My name + is + [name]",
                    "examples": [
                        {"correct": "My name is Ali.", "incorrect": "My name Ali."},
                        {"correct": "My name is Teacher.", "incorrect": "Name is Teacher."}
                    ]
                }
            ],
            "example_sentences": [
                "What is your name?", "My name is Tom.", "His name is Ali.", "Her name is Sara."
            ],
            "pattern_highlight": "What is + possessive + name?"
        },
        "grammar_game": {
            "activity_id": f"ggame_{uuid.uuid4().hex[:8]}",
            "game_type": "error_hunter",
            "items": [
                {"sentence": "What is your name?", "has_error": False, "correct_sentence": "What is your name?"},
                {"sentence": "My name Tom.", "has_error": True, "correct_sentence": "My name is Tom."},
                {"sentence": "His name is Ali.", "has_error": False, "correct_sentence": "His name is Ali."},
                {"sentence": "What your name?", "has_error": True, "correct_sentence": "What is your name?"},
                {"sentence": "Her name is Sara.", "has_error": False, "correct_sentence": "Her name is Sara."},
                {"sentence": "My name are Tom.", "has_error": True, "correct_sentence": "My name is Tom."}
            ],
            "time_limit_seconds": 180,
            "scoring": {"perfect": 90, "good": 70, "pass": 50}
        }
    },
    {
        "lesson_id": "stage_1_unit_01_lesson_03",
        "title": "Nice to Meet You",
        "warmup": {
            "activity_id": f"warmup_{uuid.uuid4().hex[:8]}",
            "questions": [
                {
                    "question_id": "w3_q1",
                    "question_type": "word_meaning",
                    "question_text": "Complete: My name ___ Sara.",
                    "options": ["am", "is", "are", "be"],
                    "correct_answer": "is"
                },
                {
                    "question_id": "w3_q2",
                    "question_type": "word_meaning",
                    "question_text": "What do you say after someone tells you their name?",
                    "options": ["Goodbye", "Sorry", "Nice to meet you", "See you"],
                    "correct_answer": "Nice to meet you"
                },
                {
                    "question_id": "w3_q3",
                    "question_type": "sentence_complete",
                    "question_text": "Complete: ___ to meet you!",
                    "options": ["Good", "Nice", "Bad", "See"],
                    "correct_answer": "Nice"
                }
            ],
            "time_limit_seconds": 120
        },
        "grammar": {
            "activity_id": f"grammar_{uuid.uuid4().hex[:8]}",
            "rules": [
                {
                    "rule_id": "g3_r1",
                    "rule_text": "Use 'He is' for boys/men and 'She is' for girls/women.",
                    "pattern": "He/She + is + adjective/name",
                    "examples": [
                        {"correct": "He is my friend.", "incorrect": "He my friend."},
                        {"correct": "She is nice.", "incorrect": "She nice."}
                    ]
                },
                {
                    "rule_id": "g3_r2",
                    "rule_text": "Use short forms: He's = He is, She's = She is",
                    "pattern": "He's / She's + ...",
                    "examples": [
                        {"correct": "He's Tom.", "incorrect": "Hes Tom."},
                        {"correct": "She's a teacher.", "incorrect": "Shes a teacher."}
                    ]
                }
            ],
            "example_sentences": [
                "He is my friend.", "She is nice.", "He's Tom.", "She's a teacher."
            ],
            "pattern_highlight": "He/She + is (He's/She's) + ..."
        },
        "grammar_game": {
            "activity_id": f"ggame_{uuid.uuid4().hex[:8]}",
            "game_type": "error_hunter",
            "items": [
                {"sentence": "He is my friend.", "has_error": False, "correct_sentence": "He is my friend."},
                {"sentence": "She are nice.", "has_error": True, "correct_sentence": "She is nice."},
                {"sentence": "He's a student.", "has_error": False, "correct_sentence": "He's a student."},
                {"sentence": "She am a teacher.", "has_error": True, "correct_sentence": "She is a teacher."},
                {"sentence": "He's Tom.", "has_error": False, "correct_sentence": "He's Tom."},
                {"sentence": "She his Sara.", "has_error": True, "correct_sentence": "She is Sara."}
            ],
            "time_limit_seconds": 180,
            "scoring": {"perfect": 90, "good": 70, "pass": 50}
        }
    },
    {
        "lesson_id": "stage_1_unit_01_lesson_04",
        "title": "How Are You?",
        "warmup": {
            "activity_id": f"warmup_{uuid.uuid4().hex[:8]}",
            "questions": [
                {
                    "question_id": "w4_q1",
                    "question_type": "word_meaning",
                    "question_text": "Complete: She ___ my teacher.",
                    "options": ["am", "are", "is", "be"],
                    "correct_answer": "is"
                },
                {
                    "question_id": "w4_q2",
                    "question_type": "word_meaning",
                    "question_text": "What do you say when you ask about someone's feelings?",
                    "options": ["What's your name?", "How are you?", "Nice to meet you", "Where are you?"],
                    "correct_answer": "How are you?"
                },
                {
                    "question_id": "w4_q3",
                    "question_type": "sentence_complete",
                    "question_text": "Complete: I'm ___, thank you!",
                    "options": ["hello", "goodbye", "fine", "name"],
                    "correct_answer": "fine"
                }
            ],
            "time_limit_seconds": 120
        },
        "grammar": {
            "activity_id": f"grammar_{uuid.uuid4().hex[:8]}",
            "rules": [
                {
                    "rule_id": "g4_r1",
                    "rule_text": "Use 'How are you?' to ask about feelings.",
                    "pattern": "How + are + you?",
                    "examples": [
                        {"correct": "How are you?", "incorrect": "How you?"},
                        {"correct": "I'm fine, thank you.", "incorrect": "I fine, thank you."}
                    ]
                },
                {
                    "rule_id": "g4_r2",
                    "rule_text": "Use short forms: I'm = I am, You're = You are",
                    "pattern": "I'm / You're / He's / She's + ...",
                    "examples": [
                        {"correct": "I'm happy.", "incorrect": "Im happy."},
                        {"correct": "You're welcome.", "incorrect": "Youre welcome."}
                    ]
                }
            ],
            "example_sentences": [
                "How are you?", "I'm fine, thank you.", "I'm happy.", "You're welcome."
            ],
            "pattern_highlight": "Short forms: I'm, You're, He's, She's"
        },
        "grammar_game": {
            "activity_id": f"ggame_{uuid.uuid4().hex[:8]}",
            "game_type": "error_hunter",
            "items": [
                {"sentence": "How are you?", "has_error": False, "correct_sentence": "How are you?"},
                {"sentence": "Im fine.", "has_error": True, "correct_sentence": "I'm fine."},
                {"sentence": "I'm happy.", "has_error": False, "correct_sentence": "I'm happy."},
                {"sentence": "How you?", "has_error": True, "correct_sentence": "How are you?"},
                {"sentence": "You're welcome.", "has_error": False, "correct_sentence": "You're welcome."},
                {"sentence": "She are happy.", "has_error": True, "correct_sentence": "She is happy."}
            ],
            "time_limit_seconds": 180,
            "scoring": {"perfect": 90, "good": 70, "pass": 50}
        }
    }
]


async def seed():
    for lesson in LESSONS:
        lid = lesson["lesson_id"]
        print(f"\nSeeding activities for: {lesson['title']} ({lid})")

        # Warmup
        warmup = lesson["warmup"]
        await db.unified_warmup_activities.delete_many({"lesson_id": lid})
        await db.unified_warmup_activities.insert_one({
            "activity_id": warmup["activity_id"],
            "lesson_id": lid,
            "type": "retrieval_warmup",
            "questions": warmup["questions"],
            "time_limit_seconds": warmup["time_limit_seconds"]
        })
        print(f"  + retrieval_warmup ({len(warmup['questions'])} questions)")

        # Grammar Focus
        grammar = lesson["grammar"]
        await db.unified_grammar_activities.delete_many({"lesson_id": lid})
        await db.unified_grammar_activities.insert_one({
            "activity_id": grammar["activity_id"],
            "lesson_id": lid,
            "type": "grammar_focus",
            "rules": grammar["rules"],
            "example_sentences": grammar["example_sentences"],
            "pattern_highlight": grammar.get("pattern_highlight")
        })
        print(f"  + grammar_focus ({len(grammar['rules'])} rules)")

        # Grammar Game
        ggame = lesson["grammar_game"]
        await db.unified_game_activities.delete_many({"lesson_id": lid, "type": "micro_game_grammar"})
        await db.unified_game_activities.insert_one({
            "activity_id": ggame["activity_id"],
            "lesson_id": lid,
            "type": "micro_game_grammar",
            "game_type": ggame["game_type"],
            "items": ggame["items"],
            "time_limit_seconds": ggame["time_limit_seconds"],
            "scoring": ggame["scoring"]
        })
        print(f"  + micro_game_grammar ({len(ggame['items'])} items)")

    print("\nAll missing activities seeded!")


if __name__ == "__main__":
    asyncio.run(seed())
