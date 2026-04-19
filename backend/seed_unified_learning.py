"""
UNIFIED LEARNING SYSTEM - Stage 1 Seed Data
Unit 1: Hello! (Greetings & Introductions)
"""

import asyncio
import os
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from pathlib import Path
from dotenv import load_dotenv

# Load environment
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')


# ============ STAGE 1: FOUNDATIONS ============

STAGE_1 = {
    "stage_id": "stage_1_foundations",
    "number": 1,
    "name": "Foundations",
    "cefr_level": "Pre-A1",
    "total_units": 12,
    "lessons_per_unit": 4,
    "description": "Basic English for absolute beginners. Start your English journey here!",
    "target_audience": "Kindergarten / Ages 4-7 / Absolute beginners",
    "icon": "rocket",
    "color": "#FF6B6B",
    "visual_strategy": "heavy",
    "tone": "playful",
    "substages": ["A", "B"],
    "has_certification_gate": True,
    "has_booster_mode": True,
    "unlock_requirements": None,
    "created_at": datetime.now(timezone.utc).isoformat()
}


# ============ UNIT 1: HELLO! ============

UNIT_1 = {
    "unit_id": "stage_1_unit_01",
    "stage_id": "stage_1_foundations",
    "number": 1,
    "substage": "A",
    "title": "Hello!",
    "description": "Learn basic greetings and introductions",
    "total_lessons": 4,
    "order": 1,
    "theme_color": "#FF6B6B",
    "thumbnail_url": None,
    "unlock_requirements": None,
    "spiral_review_topics": [],
    "created_at": datetime.now(timezone.utc).isoformat()
}


# ============ LESSON 1: SAY HELLO ============

LESSON_1_1 = {
    "lesson_id": "stage_1_unit_01_lesson_01",
    "unit_id": "stage_1_unit_01",
    "stage_id": "stage_1_foundations",
    "number": 1,
    "title": "Say Hello",
    "description": "Learn to say hello and goodbye",
    "estimated_duration_minutes": 25,
    "points_reward": 50,
    "activity_flow": [
        {
            "order": 1,
            "type": "retrieval_warmup",
            "activity_id": "warmup_s1u1l1",
            "icon": "refresh-cw",
            "label": "Warm-up",
            "duration_minutes": 2,
            "is_skippable": True  # First lesson has no prior content
        },
        {
            "order": 2,
            "type": "vocabulary",
            "activity_id": "vocab_s1u1l1",
            "icon": "book-open",
            "label": "Vocabulary",
            "duration_minutes": 6,
            "is_skippable": False
        },
        {
            "order": 3,
            "type": "micro_game_vocab",
            "activity_id": "game_vocab_s1u1l1",
            "icon": "gamepad-2",
            "label": "Vocab Game",
            "duration_minutes": 4,
            "is_skippable": False
        },
        {
            "order": 4,
            "type": "micro_reading",
            "activity_id": "reading_s1u1l1",
            "icon": "file-text",
            "label": "Micro Reading",
            "duration_minutes": 3,
            "is_skippable": True
        },
        {
            "order": 5,
            "type": "grammar_focus",
            "activity_id": "grammar_s1u1l1",
            "icon": "edit-3",
            "label": "Grammar",
            "duration_minutes": 0,
            "is_skippable": True  # No grammar in Stage 1 Lesson 1
        },
        {
            "order": 6,
            "type": "micro_game_grammar",
            "activity_id": "game_grammar_s1u1l1",
            "icon": "gamepad-2",
            "label": "Grammar Game",
            "duration_minutes": 0,
            "is_skippable": True
        },
        {
            "order": 7,
            "type": "listening",
            "activity_id": "listening_s1u1l1",
            "icon": "headphones",
            "label": "Listening",
            "duration_minutes": 4,
            "is_skippable": False
        },
        {
            "order": 8,
            "type": "production",
            "activity_id": "production_s1u1l1",
            "icon": "mic",
            "label": "Speaking",
            "duration_minutes": 4,
            "is_skippable": False,
            "production_type": "speaking"
        },
        {
            "order": 9,
            "type": "exit_ticket",
            "activity_id": "exit_s1u1l1",
            "icon": "check-circle",
            "label": "Exit Quiz",
            "duration_minutes": 2,
            "is_skippable": False,
            "pass_threshold": 70
        },
        {
            "order": 10,
            "type": "auto_review",
            "activity_id": "review_s1u1l1",
            "icon": "repeat",
            "label": "Review Scheduled",
            "duration_minutes": 0,
            "is_skippable": False
        }
    ],
    "created_at": datetime.now(timezone.utc).isoformat()
}


# ============ VOCABULARY ACTIVITY - LESSON 1 ============

VOCAB_LESSON_1 = {
    "activity_id": "vocab_s1u1l1",
    "lesson_id": "stage_1_unit_01_lesson_01",
    "type": "vocabulary",
    "words": [
        {
            "word_id": "word_hello",
            "word": "hello",
            "ipa": "/həˈləʊ/",
            "definition": "A greeting you say when you meet someone",
            "example_sentence": "Hello! How are you?",
            "image_url": None,  # To be added
            "audio_url": None,  # To be generated
            "sentence_audio_url": None,
            "difficulty": 1
        },
        {
            "word_id": "word_hi",
            "word": "hi",
            "ipa": "/haɪ/",
            "definition": "A friendly, informal greeting",
            "example_sentence": "Hi! Nice to see you!",
            "image_url": None,
            "audio_url": None,
            "sentence_audio_url": None,
            "difficulty": 1
        },
        {
            "word_id": "word_goodbye",
            "word": "goodbye",
            "ipa": "/ɡʊdˈbaɪ/",
            "definition": "What you say when leaving someone",
            "example_sentence": "Goodbye! See you tomorrow!",
            "image_url": None,
            "audio_url": None,
            "sentence_audio_url": None,
            "difficulty": 1
        },
        {
            "word_id": "word_bye",
            "word": "bye",
            "ipa": "/baɪ/",
            "definition": "A short way to say goodbye",
            "example_sentence": "Bye! Have a nice day!",
            "image_url": None,
            "audio_url": None,
            "sentence_audio_url": None,
            "difficulty": 1
        },
        {
            "word_id": "word_good_morning",
            "word": "good morning",
            "ipa": "/ɡʊd ˈmɔːnɪŋ/",
            "definition": "A greeting you use in the morning",
            "example_sentence": "Good morning, teacher!",
            "image_url": None,
            "audio_url": None,
            "sentence_audio_url": None,
            "difficulty": 1
        },
        {
            "word_id": "word_good_night",
            "word": "good night",
            "ipa": "/ɡʊd naɪt/",
            "definition": "What you say before going to sleep",
            "example_sentence": "Good night, Mom and Dad!",
            "image_url": None,
            "audio_url": None,
            "sentence_audio_url": None,
            "difficulty": 1
        },
        {
            "word_id": "word_good_afternoon",
            "word": "good afternoon",
            "ipa": "/ɡʊd ˌɑːftəˈnuːn/",
            "definition": "A greeting you use in the afternoon",
            "example_sentence": "Good afternoon! How was your lunch?",
            "image_url": None,
            "audio_url": None,
            "sentence_audio_url": None,
            "difficulty": 2
        },
        {
            "word_id": "word_see_you",
            "word": "see you",
            "ipa": "/siː juː/",
            "definition": "A casual way to say goodbye",
            "example_sentence": "See you later!",
            "image_url": None,
            "audio_url": None,
            "sentence_audio_url": None,
            "difficulty": 1
        }
    ],
    "requires_typing": True,
    "requires_pronunciation": True,
    "max_attempts": 3,
    "pass_threshold": 80,
    "created_at": datetime.now(timezone.utc).isoformat()
}


# ============ MICRO READING ACTIVITY - LESSON 1 ============

READING_LESSON_1 = {
    "activity_id": "reading_s1u1l1",
    "lesson_id": "stage_1_unit_01_lesson_01",
    "type": "micro_reading",
    "passage_text": """
Hello! My name is Tom. Good morning! I go to school. 
I see my friend. I say "Hi!" to my friend. 
My friend says "Hello!" to me. 
At night, I say "Good night" to my mom. 
Goodbye, see you tomorrow!
    """.strip(),
    "highlighted_words": ["hello", "hi", "goodbye", "good morning", "good night", "see you"],
    "comprehension_questions": [
        {
            "question_id": "q1",
            "question": "What does Tom say to his friend?",
            "type": "multiple_choice",
            "options": ["Good night", "Hi", "Goodbye"],
            "correct_answer": "Hi"
        },
        {
            "question_id": "q2",
            "question": "What does Tom say to his mom at night?",
            "type": "multiple_choice",
            "options": ["Hello", "Good morning", "Good night"],
            "correct_answer": "Good night"
        }
    ],
    "created_at": datetime.now(timezone.utc).isoformat()
}


# ============ MICRO GAME (VOCAB) - LESSON 1 ============

GAME_VOCAB_LESSON_1 = {
    "activity_id": "game_vocab_s1u1l1",
    "lesson_id": "stage_1_unit_01_lesson_01",
    "type": "micro_game_vocab",
    "game_type": "matching",
    "items": [
        {"word": "hello", "match": "A greeting when you meet someone"},
        {"word": "goodbye", "match": "What you say when leaving"},
        {"word": "good morning", "match": "A greeting in the morning"},
        {"word": "good night", "match": "What you say before sleeping"},
        {"word": "hi", "match": "A friendly, informal greeting"},
        {"word": "bye", "match": "A short way to say goodbye"}
    ],
    "time_limit_seconds": 180,
    "scoring": {"perfect": 90, "good": 70, "pass": 50},
    "created_at": datetime.now(timezone.utc).isoformat()
}


# ============ LISTENING ACTIVITY - LESSON 1 ============

LISTENING_LESSON_1 = {
    "activity_id": "listening_s1u1l1",
    "lesson_id": "stage_1_unit_01_lesson_01",
    "type": "listening",
    "audio_url": None,  # To be generated
    "audio_duration_seconds": 30,
    "transcript": """
Speaker 1: Hello!
Speaker 2: Hi! Good morning!
Speaker 1: How are you?
Speaker 2: I'm fine. And you?
Speaker 1: I'm good. Goodbye!
Speaker 2: Bye! See you later!
    """.strip(),
    "questions": [
        {
            "question_id": "lq1",
            "question": "What does Speaker 1 say first?",
            "type": "multiple_choice",
            "options": ["Goodbye", "Hello", "Good night"],
            "correct_answer": "Hello"
        },
        {
            "question_id": "lq2",
            "question": "What does Speaker 2 say at the end?",
            "type": "multiple_choice",
            "options": ["Good morning", "Bye! See you later!", "Hello"],
            "correct_answer": "Bye! See you later!"
        }
    ],
    "speed": "slow",
    "created_at": datetime.now(timezone.utc).isoformat()
}


# ============ PRODUCTION ACTIVITY - LESSON 1 ============

PRODUCTION_LESSON_1 = {
    "activity_id": "production_s1u1l1",
    "lesson_id": "stage_1_unit_01_lesson_01",
    "type": "production",
    "production_type": "speaking",
    "prompt": "Say 'Hello' and 'Goodbye' to your friend.",
    "example_response": "Hello! How are you? ... Goodbye! See you!",
    "evaluation_criteria": ["Correct pronunciation", "Clear voice"],
    "max_recording_seconds": 30,
    "ai_evaluation": False,  # Simple for Stage 1
    "created_at": datetime.now(timezone.utc).isoformat()
}


# ============ EXIT TICKET - LESSON 1 ============

EXIT_TICKET_LESSON_1 = {
    "activity_id": "exit_s1u1l1",
    "lesson_id": "stage_1_unit_01_lesson_01",
    "type": "exit_ticket",
    "questions": [
        {
            "question_id": "et1",
            "question_type": "multiple_choice",
            "question_text": "What do you say when you meet someone?",
            "options": ["Goodbye", "Hello", "Good night"],
            "correct_answer": "Hello",
            "covers_activity": "vocabulary"
        },
        {
            "question_id": "et2",
            "question_type": "multiple_choice",
            "question_text": "What do you say in the morning?",
            "options": ["Good night", "Goodbye", "Good morning"],
            "correct_answer": "Good morning",
            "covers_activity": "vocabulary"
        },
        {
            "question_id": "et3",
            "question_type": "multiple_choice",
            "question_text": "What do you say before you go to sleep?",
            "options": ["Good morning", "Good night", "Hello"],
            "correct_answer": "Good night",
            "covers_activity": "vocabulary"
        },
        {
            "question_id": "et4",
            "question_type": "fill_blank",
            "question_text": "______! See you tomorrow!",
            "options": None,
            "correct_answer": "Goodbye",
            "covers_activity": "vocabulary"
        }
    ],
    "pass_threshold": 70,
    "created_at": datetime.now(timezone.utc).isoformat()
}


# ============ ADDITIONAL LESSONS FOR UNIT 1 ============

# Lesson 2: What's Your Name?
LESSON_1_2 = {
    "lesson_id": "stage_1_unit_01_lesson_02",
    "unit_id": "stage_1_unit_01",
    "stage_id": "stage_1_foundations",
    "number": 2,
    "title": "What's Your Name?",
    "description": "Learn to ask and answer about names",
    "estimated_duration_minutes": 25,
    "points_reward": 50,
    "activity_flow": [
        {"order": 1, "type": "retrieval_warmup", "activity_id": "warmup_s1u1l2", "icon": "refresh-cw", "label": "Warm-up", "duration_minutes": 3, "is_skippable": False},
        {"order": 2, "type": "vocabulary", "activity_id": "vocab_s1u1l2", "icon": "book-open", "label": "Vocabulary", "duration_minutes": 6, "is_skippable": False},
        {"order": 3, "type": "micro_game_vocab", "activity_id": "game_vocab_s1u1l2", "icon": "gamepad-2", "label": "Vocab Game", "duration_minutes": 4, "is_skippable": False},
        {"order": 4, "type": "micro_reading", "activity_id": "reading_s1u1l2", "icon": "file-text", "label": "Micro Reading", "duration_minutes": 3, "is_skippable": True},
        {"order": 5, "type": "grammar_focus", "activity_id": "grammar_s1u1l2", "icon": "edit-3", "label": "Grammar", "duration_minutes": 3, "is_skippable": False},
        {"order": 6, "type": "micro_game_grammar", "activity_id": "game_grammar_s1u1l2", "icon": "gamepad-2", "label": "Grammar Game", "duration_minutes": 3, "is_skippable": False},
        {"order": 7, "type": "listening", "activity_id": "listening_s1u1l2", "icon": "headphones", "label": "Listening", "duration_minutes": 4, "is_skippable": False},
        {"order": 8, "type": "production", "activity_id": "production_s1u1l2", "icon": "mic", "label": "Speaking", "duration_minutes": 4, "is_skippable": False, "production_type": "speaking"},
        {"order": 9, "type": "exit_ticket", "activity_id": "exit_s1u1l2", "icon": "check-circle", "label": "Exit Quiz", "duration_minutes": 2, "is_skippable": False, "pass_threshold": 70},
        {"order": 10, "type": "auto_review", "activity_id": "review_s1u1l2", "icon": "repeat", "label": "Review Scheduled", "duration_minutes": 0, "is_skippable": False}
    ],
    "created_at": datetime.now(timezone.utc).isoformat()
}

VOCAB_LESSON_2 = {
    "activity_id": "vocab_s1u1l2",
    "lesson_id": "stage_1_unit_01_lesson_02",
    "type": "vocabulary",
    "words": [
        {"word_id": "word_name", "word": "name", "ipa": "/neɪm/", "definition": "What people call you", "example_sentence": "My name is Tom.", "difficulty": 1},
        {"word_id": "word_my", "word": "my", "ipa": "/maɪ/", "definition": "Belonging to me", "example_sentence": "This is my book.", "difficulty": 1},
        {"word_id": "word_your", "word": "your", "ipa": "/jɔːr/", "definition": "Belonging to you", "example_sentence": "What is your name?", "difficulty": 1},
        {"word_id": "word_i", "word": "I", "ipa": "/aɪ/", "definition": "The person speaking (me)", "example_sentence": "I am happy.", "difficulty": 1},
        {"word_id": "word_am", "word": "am", "ipa": "/æm/", "definition": "Used with 'I' to say something about yourself", "example_sentence": "I am a student.", "difficulty": 1},
        {"word_id": "word_is", "word": "is", "ipa": "/ɪz/", "definition": "Used with he/she/it to describe", "example_sentence": "She is my friend.", "difficulty": 1},
        {"word_id": "word_what", "word": "what", "ipa": "/wɒt/", "definition": "Used to ask about something", "example_sentence": "What is this?", "difficulty": 1},
        {"word_id": "word_you", "word": "you", "ipa": "/juː/", "definition": "The person I am talking to", "example_sentence": "You are nice!", "difficulty": 1}
    ],
    "requires_typing": True,
    "requires_pronunciation": True,
    "max_attempts": 3,
    "pass_threshold": 80,
    "created_at": datetime.now(timezone.utc).isoformat()
}

GRAMMAR_LESSON_2 = {
    "activity_id": "grammar_s1u1l2",
    "lesson_id": "stage_1_unit_01_lesson_02",
    "type": "grammar_focus",
    "rules": [
        {
            "rule_id": "rule_1",
            "rule_text": "Use 'I am' to talk about yourself",
            "pattern": "I am + name/adjective",
            "examples": [
                {"correct": "I am Tom.", "incorrect": "I is Tom."},
                {"correct": "I am happy.", "incorrect": "I are happy."}
            ]
        },
        {
            "rule_id": "rule_2",
            "rule_text": "Use 'My name is' to introduce yourself",
            "pattern": "My name is + name",
            "examples": [
                {"correct": "My name is Sara.", "incorrect": "My name am Sara."},
                {"correct": "My name is Tom.", "incorrect": "My name are Tom."}
            ]
        }
    ],
    "example_sentences": [
        "I am Tom.",
        "My name is Sara.",
        "What is your name?",
        "I am a student."
    ],
    "pattern_highlight": "I am... / My name is...",
    "created_at": datetime.now(timezone.utc).isoformat()
}

# Lesson 3: Nice to Meet You
LESSON_1_3 = {
    "lesson_id": "stage_1_unit_01_lesson_03",
    "unit_id": "stage_1_unit_01",
    "stage_id": "stage_1_foundations",
    "number": 3,
    "title": "Nice to Meet You",
    "description": "Learn polite phrases for meeting people",
    "estimated_duration_minutes": 25,
    "points_reward": 50,
    "activity_flow": [
        {"order": 1, "type": "retrieval_warmup", "activity_id": "warmup_s1u1l3", "icon": "refresh-cw", "label": "Warm-up", "duration_minutes": 3, "is_skippable": False},
        {"order": 2, "type": "vocabulary", "activity_id": "vocab_s1u1l3", "icon": "book-open", "label": "Vocabulary", "duration_minutes": 6, "is_skippable": False},
        {"order": 3, "type": "micro_game_vocab", "activity_id": "game_vocab_s1u1l3", "icon": "gamepad-2", "label": "Vocab Game", "duration_minutes": 4, "is_skippable": False},
        {"order": 4, "type": "micro_reading", "activity_id": "reading_s1u1l3", "icon": "file-text", "label": "Micro Reading", "duration_minutes": 3, "is_skippable": True},
        {"order": 5, "type": "grammar_focus", "activity_id": "grammar_s1u1l3", "icon": "edit-3", "label": "Grammar", "duration_minutes": 0, "is_skippable": True},
        {"order": 6, "type": "micro_game_grammar", "activity_id": "game_grammar_s1u1l3", "icon": "gamepad-2", "label": "Grammar Game", "duration_minutes": 0, "is_skippable": True},
        {"order": 7, "type": "listening", "activity_id": "listening_s1u1l3", "icon": "headphones", "label": "Listening", "duration_minutes": 4, "is_skippable": False},
        {"order": 8, "type": "production", "activity_id": "production_s1u1l3", "icon": "mic", "label": "Speaking", "duration_minutes": 4, "is_skippable": False, "production_type": "speaking"},
        {"order": 9, "type": "exit_ticket", "activity_id": "exit_s1u1l3", "icon": "check-circle", "label": "Exit Quiz", "duration_minutes": 2, "is_skippable": False, "pass_threshold": 70},
        {"order": 10, "type": "auto_review", "activity_id": "review_s1u1l3", "icon": "repeat", "label": "Review Scheduled", "duration_minutes": 0, "is_skippable": False}
    ],
    "created_at": datetime.now(timezone.utc).isoformat()
}

VOCAB_LESSON_3 = {
    "activity_id": "vocab_s1u1l3",
    "lesson_id": "stage_1_unit_01_lesson_03",
    "type": "vocabulary",
    "words": [
        {"word_id": "word_nice", "word": "nice", "ipa": "/naɪs/", "definition": "Pleasant, good", "example_sentence": "Nice to meet you!", "difficulty": 1},
        {"word_id": "word_meet", "word": "meet", "ipa": "/miːt/", "definition": "To see someone for the first time", "example_sentence": "I want to meet my teacher.", "difficulty": 1},
        {"word_id": "word_friend", "word": "friend", "ipa": "/frend/", "definition": "Someone you like and enjoy being with", "example_sentence": "She is my friend.", "difficulty": 1},
        {"word_id": "word_teacher", "word": "teacher", "ipa": "/ˈtiːtʃər/", "definition": "Someone who teaches you", "example_sentence": "My teacher is kind.", "difficulty": 1},
        {"word_id": "word_student", "word": "student", "ipa": "/ˈstjuːdənt/", "definition": "Someone who learns at school", "example_sentence": "I am a student.", "difficulty": 1},
        {"word_id": "word_please", "word": "please", "ipa": "/pliːz/", "definition": "A polite word when asking for something", "example_sentence": "Please help me.", "difficulty": 1},
        {"word_id": "word_thank_you", "word": "thank you", "ipa": "/θæŋk juː/", "definition": "What you say to show you are grateful", "example_sentence": "Thank you for your help!", "difficulty": 1},
        {"word_id": "word_too", "word": "too", "ipa": "/tuː/", "definition": "Also, as well", "example_sentence": "Nice to meet you too!", "difficulty": 1}
    ],
    "requires_typing": True,
    "requires_pronunciation": True,
    "max_attempts": 3,
    "pass_threshold": 80,
    "created_at": datetime.now(timezone.utc).isoformat()
}

# Lesson 4: How Are You?
LESSON_1_4 = {
    "lesson_id": "stage_1_unit_01_lesson_04",
    "unit_id": "stage_1_unit_01",
    "stage_id": "stage_1_foundations",
    "number": 4,
    "title": "How Are You?",
    "description": "Learn to ask and answer about feelings",
    "estimated_duration_minutes": 25,
    "points_reward": 50,
    "activity_flow": [
        {"order": 1, "type": "retrieval_warmup", "activity_id": "warmup_s1u1l4", "icon": "refresh-cw", "label": "Warm-up", "duration_minutes": 3, "is_skippable": False},
        {"order": 2, "type": "vocabulary", "activity_id": "vocab_s1u1l4", "icon": "book-open", "label": "Vocabulary", "duration_minutes": 6, "is_skippable": False},
        {"order": 3, "type": "micro_game_vocab", "activity_id": "game_vocab_s1u1l4", "icon": "gamepad-2", "label": "Vocab Game", "duration_minutes": 4, "is_skippable": False},
        {"order": 4, "type": "micro_reading", "activity_id": "reading_s1u1l4", "icon": "file-text", "label": "Micro Reading", "duration_minutes": 3, "is_skippable": True},
        {"order": 5, "type": "grammar_focus", "activity_id": "grammar_s1u1l4", "icon": "edit-3", "label": "Grammar", "duration_minutes": 3, "is_skippable": False},
        {"order": 6, "type": "micro_game_grammar", "activity_id": "game_grammar_s1u1l4", "icon": "gamepad-2", "label": "Grammar Game", "duration_minutes": 3, "is_skippable": False},
        {"order": 7, "type": "listening", "activity_id": "listening_s1u1l4", "icon": "headphones", "label": "Listening", "duration_minutes": 4, "is_skippable": False},
        {"order": 8, "type": "production", "activity_id": "production_s1u1l4", "icon": "mic", "label": "Speaking", "duration_minutes": 4, "is_skippable": False, "production_type": "speaking"},
        {"order": 9, "type": "exit_ticket", "activity_id": "exit_s1u1l4", "icon": "check-circle", "label": "Exit Quiz", "duration_minutes": 2, "is_skippable": False, "pass_threshold": 70},
        {"order": 10, "type": "auto_review", "activity_id": "review_s1u1l4", "icon": "repeat", "label": "Review Scheduled", "duration_minutes": 0, "is_skippable": False}
    ],
    "created_at": datetime.now(timezone.utc).isoformat()
}

VOCAB_LESSON_4 = {
    "activity_id": "vocab_s1u1l4",
    "lesson_id": "stage_1_unit_01_lesson_04",
    "type": "vocabulary",
    "words": [
        {"word_id": "word_how", "word": "how", "ipa": "/haʊ/", "definition": "Used to ask about something", "example_sentence": "How are you?", "difficulty": 1},
        {"word_id": "word_fine", "word": "fine", "ipa": "/faɪn/", "definition": "Good, okay", "example_sentence": "I am fine.", "difficulty": 1},
        {"word_id": "word_good", "word": "good", "ipa": "/ɡʊd/", "definition": "Nice, positive", "example_sentence": "I am good!", "difficulty": 1},
        {"word_id": "word_happy", "word": "happy", "ipa": "/ˈhæpi/", "definition": "Feeling joy", "example_sentence": "I am happy today!", "difficulty": 1},
        {"word_id": "word_sad", "word": "sad", "ipa": "/sæd/", "definition": "Not happy, feeling down", "example_sentence": "She is sad.", "difficulty": 1},
        {"word_id": "word_okay", "word": "okay", "ipa": "/əʊˈkeɪ/", "definition": "Fine, acceptable", "example_sentence": "I am okay.", "difficulty": 1},
        {"word_id": "word_and", "word": "and", "ipa": "/ænd/", "definition": "Joins two things together", "example_sentence": "Mom and Dad", "difficulty": 1},
        {"word_id": "word_are", "word": "are", "ipa": "/ɑːr/", "definition": "Used with you/we/they", "example_sentence": "You are nice!", "difficulty": 1}
    ],
    "requires_typing": True,
    "requires_pronunciation": True,
    "max_attempts": 3,
    "pass_threshold": 80,
    "created_at": datetime.now(timezone.utc).isoformat()
}

GRAMMAR_LESSON_4 = {
    "activity_id": "grammar_s1u1l4",
    "lesson_id": "stage_1_unit_01_lesson_04",
    "type": "grammar_focus",
    "rules": [
        {
            "rule_id": "rule_1",
            "rule_text": "Use 'How are you?' to ask about feelings",
            "pattern": "How + are + you?",
            "examples": [
                {"correct": "How are you?", "incorrect": "How is you?"},
                {"correct": "How are you today?", "incorrect": "How am you?"}
            ]
        },
        {
            "rule_id": "rule_2",
            "rule_text": "Answer with 'I am' + feeling",
            "pattern": "I am + fine/good/happy/sad",
            "examples": [
                {"correct": "I am fine.", "incorrect": "I are fine."},
                {"correct": "I am happy!", "incorrect": "I is happy!"}
            ]
        }
    ],
    "example_sentences": [
        "How are you?",
        "I am fine, thank you.",
        "I am happy!",
        "I am a little sad."
    ],
    "pattern_highlight": "How are you? → I am fine.",
    "created_at": datetime.now(timezone.utc).isoformat()
}


# ============ ALL STAGES (PLACEHOLDER) ============

ALL_STAGES = [
    STAGE_1,
    {
        "stage_id": "stage_2_starters",
        "number": 2,
        "name": "Starters",
        "cefr_level": "A1",
        "total_units": 12,
        "lessons_per_unit": 4,
        "description": "Build basic English communication skills",
        "target_audience": "Primary school (ages 6-8)",
        "icon": "star",
        "color": "#4ECDC4",
        "visual_strategy": "heavy",
        "tone": "playful",
        "substages": ["A", "B"],
        "has_certification_gate": True,
        "has_booster_mode": True,
        "unlock_requirements": {"previous_stage": "stage_1_foundations"},
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "stage_id": "stage_3_movers",
        "number": 3,
        "name": "Movers",
        "cefr_level": "A1-A2",
        "total_units": 10,
        "lessons_per_unit": 4,
        "description": "Expand vocabulary and basic grammar",
        "target_audience": "Primary school (ages 8-10)",
        "icon": "trending-up",
        "color": "#45B7D1",
        "visual_strategy": "selective",
        "tone": "playful",
        "substages": ["A", "B"],
        "has_certification_gate": True,
        "has_booster_mode": True,
        "unlock_requirements": {"previous_stage": "stage_2_starters"},
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "stage_id": "stage_4_flyers",
        "number": 4,
        "name": "Flyers",
        "cefr_level": "A2-B1",
        "total_units": 10,
        "lessons_per_unit": 4,
        "description": "Develop fluency and confidence",
        "target_audience": "Late primary / early middle school",
        "icon": "plane",
        "color": "#96CEB4",
        "visual_strategy": "selective",
        "tone": "balanced",
        "substages": ["A", "B"],
        "has_certification_gate": True,
        "has_booster_mode": True,
        "unlock_requirements": {"previous_stage": "stage_3_movers"},
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "stage_id": "stage_5_b1",
        "number": 5,
        "name": "B1 Academic",
        "cefr_level": "B1",
        "total_units": 8,
        "lessons_per_unit": 4,
        "description": "Intermediate English for academic purposes",
        "target_audience": "Middle school / academic prep",
        "icon": "book",
        "color": "#778899",
        "visual_strategy": "minimal",
        "tone": "balanced",
        "substages": ["A", "B"],
        "has_certification_gate": True,
        "has_booster_mode": True,
        "unlock_requirements": {"previous_stage": "stage_4_flyers"},
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "stage_id": "stage_6_b2",
        "number": 6,
        "name": "B2 Academic",
        "cefr_level": "B2",
        "total_units": 8,
        "lessons_per_unit": 4,
        "description": "Upper-intermediate English mastery",
        "target_audience": "High school / pre-IELTS",
        "icon": "award",
        "color": "#6B7B8C",
        "visual_strategy": "minimal",
        "tone": "academic",
        "substages": ["A", "B"],
        "has_certification_gate": True,
        "has_booster_mode": True,
        "unlock_requirements": {"previous_stage": "stage_5_b1"},
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "stage_id": "stage_7_ielts_foundation",
        "number": 7,
        "name": "IELTS Foundation",
        "cefr_level": "B2-C1",
        "total_units": 6,
        "lessons_per_unit": 5,
        "description": "Introduction to IELTS exam format and strategies",
        "target_audience": "IELTS beginners",
        "icon": "target",
        "color": "#4A5568",
        "visual_strategy": "minimal",
        "tone": "academic",
        "substages": ["A", "B"],
        "has_certification_gate": True,
        "has_booster_mode": True,
        "unlock_requirements": {"previous_stage": "stage_6_b2"},
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "stage_id": "stage_8_ielts_mastery",
        "number": 8,
        "name": "IELTS Mastery",
        "cefr_level": "C1-C2",
        "total_units": 6,
        "lessons_per_unit": 5,
        "description": "Advanced IELTS preparation for Band 7+",
        "target_audience": "Band 7+ preparation",
        "icon": "crown",
        "color": "#2D3748",
        "visual_strategy": "minimal",
        "tone": "academic",
        "substages": ["A", "B"],
        "has_certification_gate": True,
        "has_booster_mode": True,
        "unlock_requirements": {"previous_stage": "stage_7_ielts_foundation"},
        "created_at": datetime.now(timezone.utc).isoformat()
    }
]


async def seed_unified_learning():
    """Seed the unified learning system with Stage 1 Unit 1 data"""
    
    mongo_url = os.environ.get('MONGO_URL')
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ.get('DB_NAME', 'ielts_ace')]
    
    print("🚀 Seeding Unified Learning System...")
    
    # Clear existing data (optional - comment out in production)
    await db.unified_stages.delete_many({})
    await db.unified_units.delete_many({})
    await db.unified_lessons.delete_many({})
    await db.unified_vocabulary_activities.delete_many({})
    await db.unified_grammar_activities.delete_many({})
    await db.unified_reading_activities.delete_many({})
    await db.unified_game_activities.delete_many({})
    await db.unified_listening_activities.delete_many({})
    await db.unified_production_activities.delete_many({})
    await db.unified_exit_activities.delete_many({})
    
    print("📦 Inserting stages...")
    await db.unified_stages.insert_many(ALL_STAGES)
    print(f"   ✅ {len(ALL_STAGES)} stages inserted")
    
    print("📦 Inserting Unit 1...")
    await db.unified_units.insert_one(UNIT_1)
    print("   ✅ Unit 1 inserted")
    
    print("📦 Inserting Lessons...")
    lessons = [LESSON_1_1, LESSON_1_2, LESSON_1_3, LESSON_1_4]
    await db.unified_lessons.insert_many(lessons)
    print(f"   ✅ {len(lessons)} lessons inserted")
    
    print("📦 Inserting Vocabulary Activities...")
    vocab_activities = [VOCAB_LESSON_1, VOCAB_LESSON_2, VOCAB_LESSON_3, VOCAB_LESSON_4]
    await db.unified_vocabulary_activities.insert_many(vocab_activities)
    print(f"   ✅ {len(vocab_activities)} vocabulary activities inserted")
    
    print("📦 Inserting Grammar Activities...")
    grammar_activities = [GRAMMAR_LESSON_2, GRAMMAR_LESSON_4]
    await db.unified_grammar_activities.insert_many(grammar_activities)
    print(f"   ✅ {len(grammar_activities)} grammar activities inserted")
    
    print("📦 Inserting Reading Activities...")
    await db.unified_reading_activities.insert_one(READING_LESSON_1)
    print("   ✅ 1 reading activity inserted")
    
    print("📦 Inserting Game Activities...")
    await db.unified_game_activities.insert_one(GAME_VOCAB_LESSON_1)
    print("   ✅ 1 game activity inserted")
    
    print("📦 Inserting Listening Activities...")
    await db.unified_listening_activities.insert_one(LISTENING_LESSON_1)
    print("   ✅ 1 listening activity inserted")
    
    print("📦 Inserting Production Activities...")
    await db.unified_production_activities.insert_one(PRODUCTION_LESSON_1)
    print("   ✅ 1 production activity inserted")
    
    print("📦 Inserting Exit Ticket Activities...")
    await db.unified_exit_activities.insert_one(EXIT_TICKET_LESSON_1)
    print("   ✅ 1 exit ticket activity inserted")
    
    print("\n✨ Unified Learning System seeded successfully!")
    print(f"   Total Stages: {len(ALL_STAGES)}")
    print(f"   Total Units: 1 (Stage 1 Unit 1)")
    print(f"   Total Lessons: {len(lessons)}")
    
    client.close()


if __name__ == "__main__":
    asyncio.run(seed_unified_learning())
