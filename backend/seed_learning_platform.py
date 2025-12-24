"""
LEARNING PLATFORM SEED DATA
Complete Cambridge YLE → CEFR → IELTS pathway with sample content
This is the foundation data structure - can be expanded with more detailed content
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

def generate_id():
    return str(uuid.uuid4())

# ============ LEVEL 1: Cambridge YLE Starters (Band 2.0-3.0) ============
yle_starters = {
    "id": "level_yle_starters",
    "level_code": "YLE_STARTERS",
    "level_name": "Cambridge YLE Starters",
    "level_order": 1,
    "description": "Perfect for complete beginners. Learn basic English through fun activities, simple conversations, and familiar topics.",
    "target_band_range": "2.0-3.0",
    "pathway": "cambridge_yle",
    "total_estimated_hours": 40,
    "units": [
        {
            "id": "unit_starters_1",
            "unit_number": 1,
            "title": "Hello & Introduction",
            "description": "Learn to introduce yourself, greet people, and talk about your name and age",
            "learning_objectives": [
                "Greet people and say goodbye",
                "Introduce yourself with name and age",
                "Use simple present tense with 'to be'",
                "Recognize basic classroom vocabulary"
            ],
            "estimated_hours": 8,
            "is_locked": False,
            "lessons": [
                {
                    "id": generate_id(),
                    "lesson_number": 1,
                    "title": "Greetings & Names",
                    "description": "Learn basic greetings and how to say your name",
                    "duration_minutes": 30,
                    "lesson_type": "mixed",
                    "required_for_next": True,
                    "content": {
                        "vocabulary": ["hello", "hi", "goodbye", "bye", "name", "my", "your"],
                        "grammar_focus": "Present tense 'to be' - I am, You are",
                        "example_sentences": [
                            "Hello! My name is Tom.",
                            "Hi! I am Sarah.",
                            "What is your name?"
                        ],
                        "exercises": [
                            {
                                "type": "fill_blank",
                                "prompt": "My name ___ Sarah.",
                                "options": ["is", "am", "are"],
                                "correct": "is"
                            },
                            {
                                "type": "matching",
                                "prompt": "Match the greeting to the response",
                                "pairs": [
                                    {"left": "Hello!", "right": "Hi!"},
                                    {"left": "Goodbye!", "right": "Bye!"}
                                ]
                            }
                        ]
                    }
                },
                {
                    "id": generate_id(),
                    "lesson_number": 2,
                    "title": "Numbers & Age",
                    "description": "Learn numbers 1-10 and how to say your age",
                    "duration_minutes": 30,
                    "lesson_type": "vocabulary",
                    "required_for_next": True,
                    "content": {
                        "vocabulary": ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "age", "old", "years"],
                        "grammar_focus": "How old are you? I am ___ years old.",
                        "example_sentences": [
                            "I am seven years old.",
                            "How old are you?",
                            "She is eight."
                        ],
                        "exercises": [
                            {
                                "type": "multiple_choice",
                                "prompt": "I am ___ years old. (7)",
                                "options": ["seven", "eight", "nine"],
                                "correct": "seven"
                            }
                        ]
                    }
                },
                {
                    "id": generate_id(),
                    "lesson_number": 3,
                    "title": "Colors & Objects",
                    "description": "Learn basic colors and classroom objects",
                    "duration_minutes": 30,
                    "lesson_type": "vocabulary",
                    "required_for_next": True,
                    "content": {
                        "vocabulary": ["red", "blue", "yellow", "green", "book", "pen", "desk", "chair", "bag"],
                        "grammar_focus": "This is a... / These are...",
                        "example_sentences": [
                            "This is a red book.",
                            "The pen is blue.",
                            "I have a yellow bag."
                        ],
                        "exercises": [
                            {
                                "type": "matching",
                                "prompt": "Match the color to the object",
                                "pairs": [
                                    {"left": "red", "right": "book"},
                                    {"left": "blue", "right": "pen"}
                                ]
                            }
                        ]
                    }
                }
            ],
            "unit_quiz": {
                "id": generate_id(),
                "title": "Unit 1 Quiz: Hello & Introduction",
                "description": "Test your knowledge of greetings, numbers, and colors",
                "quiz_type": "unit_quiz",
                "duration_minutes": 15,
                "passing_score": 70,
                "questions": [
                    {
                        "id": "q1",
                        "type": "multiple_choice",
                        "question": "Complete: My name ___ Sarah.",
                        "options": ["A) is", "B) am", "C) are"],
                        "correct_answer": "A"
                    },
                    {
                        "id": "q2",
                        "type": "multiple_choice",
                        "question": "How do you say 'goodbye' in English?",
                        "options": ["A) Hello", "B) Hi", "C) Bye"],
                        "correct_answer": "C"
                    },
                    {
                        "id": "q3",
                        "type": "multiple_choice",
                        "question": "Complete: I am ___ years old. (8)",
                        "options": ["A) seven", "B) eight", "C) nine"],
                        "correct_answer": "B"
                    },
                    {
                        "id": "q4",
                        "type": "multiple_choice",
                        "question": "What color is a banana?",
                        "options": ["A) Red", "B) Blue", "C) Yellow"],
                        "correct_answer": "C"
                    },
                    {
                        "id": "q5",
                        "type": "multiple_choice",
                        "question": "Complete: This is a ___ (book).",
                        "options": ["A) book", "B) books", "C) booking"],
                        "correct_answer": "A"
                    }
                ]
            }
        },
        {
            "id": "unit_starters_2",
            "unit_number": 2,
            "title": "Family & Friends",
            "description": "Learn to talk about your family members and friends",
            "learning_objectives": [
                "Name family members",
                "Describe people with simple adjectives",
                "Use possessive 's'",
                "Count to 20"
            ],
            "estimated_hours": 8,
            "is_locked": True,
            "lessons": [
                {
                    "id": generate_id(),
                    "lesson_number": 1,
                    "title": "My Family",
                    "description": "Learn family member vocabulary",
                    "duration_minutes": 30,
                    "lesson_type": "vocabulary",
                    "required_for_next": True,
                    "content": {
                        "vocabulary": ["mother", "father", "sister", "brother", "family", "grandma", "grandpa"],
                        "grammar_focus": "This is my mother. She is...",
                        "example_sentences": [
                            "This is my mother.",
                            "I have one sister and one brother.",
                            "My family is big."
                        ],
                        "exercises": []
                    }
                },
                {
                    "id": generate_id(),
                    "lesson_number": 2,
                    "title": "Describing People",
                    "description": "Learn simple adjectives to describe people",
                    "duration_minutes": 30,
                    "lesson_type": "grammar",
                    "required_for_next": True,
                    "content": {
                        "vocabulary": ["tall", "short", "big", "small", "happy", "sad", "young", "old"],
                        "grammar_focus": "He/She is + adjective",
                        "example_sentences": [
                            "My father is tall.",
                            "My sister is young.",
                            "Grandma is old."
                        ],
                        "exercises": []
                    }
                }
            ],
            "unit_quiz": {
                "id": generate_id(),
                "title": "Unit 2 Quiz: Family & Friends",
                "description": "Test your knowledge of family vocabulary and descriptions",
                "quiz_type": "unit_quiz",
                "duration_minutes": 15,
                "passing_score": 70,
                "questions": [
                    {
                        "id": "q1",
                        "type": "multiple_choice",
                        "question": "Who is your mother's mother?",
                        "options": ["A) Aunt", "B) Grandma", "C) Sister"],
                        "correct_answer": "B"
                    },
                    {
                        "id": "q2",
                        "type": "multiple_choice",
                        "question": "My father is ___. (opposite of short)",
                        "options": ["A) tall", "B) big", "C) old"],
                        "correct_answer": "A"
                    }
                ]
            }
        }
    ],
    "exit_test": {
        "id": generate_id(),
        "title": "YLE Starters Exit Test",
        "description": "Complete assessment to unlock next level",
        "quiz_type": "exit_test",
        "duration_minutes": 30,
        "passing_score": 75,
        "target_band": 3.0,
        "questions": [
            {
                "id": "q1",
                "type": "multiple_choice",
                "question": "Complete: Hello! My name ___ Tom.",
                "options": ["A) is", "B) am", "C) are"],
                "correct_answer": "A"
            },
            {
                "id": "q2",
                "type": "multiple_choice",
                "question": "What is 5 + 3?",
                "options": ["A) seven", "B) eight", "C) nine"],
                "correct_answer": "B"
            },
            {
                "id": "q3",
                "type": "multiple_choice",
                "question": "This is ___ book. (belonging to me)",
                "options": ["A) my", "B) I", "C) me"],
                "correct_answer": "A"
            }
        ]
    },
    "created_at": datetime.now(timezone.utc).isoformat()
}

# ============ LEVEL 2: A1 Elementary (Band 3.5-4.0) ============
a1_elementary = {
    "id": "level_a1",
    "level_code": "A1",
    "level_name": "A1 Elementary",
    "level_order": 2,
    "description": "Build on basics with simple conversations about daily life, work, and hobbies",
    "target_band_range": "3.5-4.0",
    "pathway": "cefr",
    "total_estimated_hours": 50,
    "units": [
        {
            "id": "unit_a1_1",
            "unit_number": 1,
            "title": "Daily Routines",
            "description": "Learn to talk about your daily activities and time",
            "learning_objectives": [
                "Describe daily routines",
                "Tell the time",
                "Use present simple for habits",
                "Use frequency adverbs"
            ],
            "estimated_hours": 10,
            "is_locked": True,
            "lessons": [
                {
                    "id": generate_id(),
                    "lesson_number": 1,
                    "title": "My Day",
                    "description": "Learn vocabulary for daily activities",
                    "duration_minutes": 40,
                    "lesson_type": "vocabulary",
                    "required_for_next": True,
                    "content": {
                        "vocabulary": ["wake up", "get up", "breakfast", "lunch", "dinner", "go to bed", "work", "school", "morning", "evening"],
                        "grammar_focus": "Present Simple: I wake up at 7am",
                        "example_sentences": [
                            "I wake up at 7 o'clock.",
                            "I eat breakfast in the morning.",
                            "I go to bed at 10 pm."
                        ],
                        "exercises": []
                    }
                },
                {
                    "id": generate_id(),
                    "lesson_number": 2,
                    "title": "Telling Time",
                    "description": "Learn to say and understand time expressions",
                    "duration_minutes": 40,
                    "lesson_type": "grammar",
                    "required_for_next": True,
                    "content": {
                        "vocabulary": ["o'clock", "half past", "quarter past", "quarter to", "am", "pm"],
                        "grammar_focus": "What time is it? It's 3 o'clock",
                        "example_sentences": [
                            "It's 9 o'clock.",
                            "It's half past three.",
                            "I start work at quarter to nine."
                        ],
                        "exercises": []
                    }
                }
            ],
            "unit_quiz": {
                "id": generate_id(),
                "title": "Unit 1 Quiz: Daily Routines",
                "description": "Test your understanding of daily activities and time",
                "quiz_type": "unit_quiz",
                "duration_minutes": 20,
                "passing_score": 70,
                "questions": [
                    {
                        "id": "q1",
                        "type": "multiple_choice",
                        "question": "I ___ up at 7am every day.",
                        "options": ["A) wake", "B) wakes", "C) waking"],
                        "correct_answer": "A"
                    },
                    {
                        "id": "q2",
                        "type": "multiple_choice",
                        "question": "What time is it if the clock shows 3:30?",
                        "options": ["A) Three o'clock", "B) Half past three", "C) Quarter past three"],
                        "correct_answer": "B"
                    }
                ]
            }
        }
    ],
    "exit_test": {
        "id": generate_id(),
        "title": "A1 Exit Test",
        "description": "Complete assessment to unlock B1 level",
        "quiz_type": "exit_test",
        "duration_minutes": 45,
        "passing_score": 75,
        "target_band": 4.0,
        "questions": [
            {
                "id": "q1",
                "type": "multiple_choice",
                "question": "She ___ to work by bus every day.",
                "options": ["A) go", "B) goes", "C) going"],
                "correct_answer": "B"
            },
            {
                "id": "q2",
                "type": "multiple_choice",
                "question": "I ___ coffee in the morning.",
                "options": ["A) drink", "B) drinks", "C) drinking"],
                "correct_answer": "A"
            }
        ]
    },
    "created_at": datetime.now(timezone.utc).isoformat()
}

# ============ LEVEL 3: B1 Pre-Intermediate (Band 4.5-5.5) ============
b1_preintermediate = {
    "id": "level_b1",
    "level_code": "B1",
    "level_name": "B1 Pre-Intermediate",
    "level_order": 3,
    "description": "Express opinions, handle common situations, and discuss familiar topics with more confidence",
    "target_band_range": "4.5-5.5",
    "pathway": "cefr",
    "total_estimated_hours": 60,
    "units": [
        {
            "id": "unit_b1_1",
            "unit_number": 1,
            "title": "Travel & Tourism",
            "description": "Learn to talk about travel, holidays, and directions",
            "learning_objectives": [
                "Describe past trips using past simple",
                "Give and understand directions",
                "Use travel-related vocabulary",
                "Make hotel reservations"
            ],
            "estimated_hours": 12,
            "is_locked": True,
            "lessons": [
                {
                    "id": generate_id(),
                    "lesson_number": 1,
                    "title": "Planning a Trip",
                    "description": "Learn vocabulary for travel planning",
                    "duration_minutes": 50,
                    "lesson_type": "mixed",
                    "required_for_next": True,
                    "content": {
                        "vocabulary": ["flight", "hotel", "booking", "reservation", "passport", "visa", "luggage", "journey"],
                        "grammar_focus": "Future plans with 'going to'",
                        "example_sentences": [
                            "I'm going to book a hotel for next week.",
                            "We need to check our passports.",
                            "The flight leaves at 6am."
                        ],
                        "exercises": []
                    }
                }
            ],
            "unit_quiz": {
                "id": generate_id(),
                "title": "Unit 1 Quiz: Travel & Tourism",
                "description": "Test your travel vocabulary and grammar",
                "quiz_type": "unit_quiz",
                "duration_minutes": 25,
                "passing_score": 70,
                "questions": [
                    {
                        "id": "q1",
                        "type": "multiple_choice",
                        "question": "I ___ to Paris next month.",
                        "options": ["A) go", "B) going", "C) am going"],
                        "correct_answer": "C"
                    }
                ]
            }
        }
    ],
    "exit_test": {
        "id": generate_id(),
        "title": "B1 Exit Test",
        "description": "Complete assessment to unlock B2 level",
        "quiz_type": "exit_test",
        "duration_minutes": 60,
        "passing_score": 75,
        "target_band": 5.5,
        "questions": [
            {
                "id": "q1",
                "type": "multiple_choice",
                "question": "If I ___ more time, I would visit more countries.",
                "options": ["A) have", "B) had", "C) will have"],
                "correct_answer": "B"
            }
        ]
    },
    "created_at": datetime.now(timezone.utc).isoformat()
}

# ============ LEVEL 4: B2 Intermediate (Band 6.0-6.5) ============
b2_intermediate = {
    "id": "level_b2",
    "level_code": "B2",
    "level_name": "B2 Intermediate",
    "level_order": 4,
    "description": "Engage in detailed discussions, understand complex texts, and express ideas fluently",
    "target_band_range": "6.0-6.5",
    "pathway": "cefr",
    "total_estimated_hours": 70,
    "units": [
        {
            "id": "unit_b2_1",
            "unit_number": 1,
            "title": "Work & Career",
            "description": "Professional English for job interviews and workplace communication",
            "learning_objectives": [
                "Describe work experience",
                "Prepare for job interviews",
                "Write professional emails",
                "Discuss career goals"
            ],
            "estimated_hours": 14,
            "is_locked": True,
            "lessons": [
                {
                    "id": generate_id(),
                    "lesson_number": 1,
                    "title": "Job Interview Skills",
                    "description": "Learn how to succeed in job interviews",
                    "duration_minutes": 60,
                    "lesson_type": "mixed",
                    "required_for_next": True,
                    "content": {
                        "vocabulary": ["experience", "qualification", "skills", "strengths", "weaknesses", "ambitious", "motivated"],
                        "grammar_focus": "Present Perfect for experience",
                        "example_sentences": [
                            "I have worked in marketing for 5 years.",
                            "My strengths include problem-solving and teamwork.",
                            "I am motivated to learn new skills."
                        ],
                        "exercises": []
                    }
                }
            ],
            "unit_quiz": {
                "id": generate_id(),
                "title": "Unit 1 Quiz: Work & Career",
                "description": "Test your professional English skills",
                "quiz_type": "unit_quiz",
                "duration_minutes": 30,
                "passing_score": 70,
                "questions": [
                    {
                        "id": "q1",
                        "type": "multiple_choice",
                        "question": "I ___ in this company since 2020.",
                        "options": ["A) work", "B) worked", "C) have worked"],
                        "correct_answer": "C"
                    }
                ]
            }
        }
    ],
    "exit_test": {
        "id": generate_id(),
        "title": "B2 Exit Test",
        "description": "Complete assessment to unlock C1 level",
        "quiz_type": "exit_test",
        "duration_minutes": 75,
        "passing_score": 75,
        "target_band": 6.5,
        "questions": [
            {
                "id": "q1",
                "type": "multiple_choice",
                "question": "The project ___ by the team before the deadline.",
                "options": ["A) completed", "B) was completed", "C) has completed"],
                "correct_answer": "B"
            }
        ]
    },
    "created_at": datetime.now(timezone.utc).isoformat()
}

# ============ LEVEL 5: IELTS 7.0 Target (Band 7.0-8.0) ============
ielts_7 = {
    "id": "level_ielts_7",
    "level_code": "IELTS_7",
    "level_name": "IELTS Band 7.0 Target",
    "level_order": 5,
    "description": "Advanced preparation for IELTS Band 7.0 - refine all four skills with exam strategies",
    "target_band_range": "7.0-8.0",
    "pathway": "ielts",
    "total_estimated_hours": 80,
    "units": [
        {
            "id": "unit_ielts7_1",
            "unit_number": 1,
            "title": "IELTS Reading Strategies",
            "description": "Master advanced reading techniques for Band 7+",
            "learning_objectives": [
                "Skim and scan effectively",
                "Identify writer's opinion vs facts",
                "Handle complex vocabulary",
                "Manage time in reading test"
            ],
            "estimated_hours": 16,
            "is_locked": True,
            "lessons": [
                {
                    "id": generate_id(),
                    "lesson_number": 1,
                    "title": "Skimming & Scanning",
                    "description": "Learn fast reading techniques for IELTS",
                    "duration_minutes": 60,
                    "lesson_type": "reading",
                    "required_for_next": True,
                    "content": {
                        "vocabulary": ["implicit", "explicit", "inference", "paraphrasing"],
                        "reading_passage": "Sample academic text about climate change...",
                        "techniques": [
                            "Read title and headings first",
                            "Look for keywords in questions",
                            "Don't read every word"
                        ],
                        "exercises": []
                    }
                }
            ],
            "unit_quiz": {
                "id": generate_id(),
                "title": "Unit 1 Quiz: Reading Strategies",
                "description": "Apply reading strategies to practice passages",
                "quiz_type": "unit_quiz",
                "duration_minutes": 40,
                "passing_score": 75,
                "questions": []
            }
        }
    ],
    "exit_test": {
        "id": generate_id(),
        "title": "IELTS 7.0 Final Assessment",
        "description": "Full IELTS practice test - all four skills",
        "quiz_type": "exit_test",
        "duration_minutes": 180,
        "passing_score": 80,
        "target_band": 7.0,
        "questions": []
    },
    "created_at": datetime.now(timezone.utc).isoformat()
}

async def seed_learning_platform():
    """Seed the learning platform with initial levels"""
    try:
        # Drop existing collection to start fresh
        await db.learning_levels.drop()
        print("✓ Dropped existing learning_levels collection")
        
        # Insert all levels
        levels = [yle_starters, a1_elementary, b1_preintermediate, b2_intermediate, ielts_7]
        result = await db.learning_levels.insert_many(levels)
        print(f"✓ Inserted {len(result.inserted_ids)} levels")
        
        # Print summary
        for level in levels:
            print(f"\n  📚 {level['level_name']} ({level['target_band_range']})")
            print(f"     - {len(level['units'])} units")
            total_lessons = sum(len(unit['lessons']) for unit in level['units'])
            print(f"     - {total_lessons} lessons")
            print(f"     - {level['total_estimated_hours']} estimated hours")
        
        print("\n✅ Learning platform seeded successfully!")
        print("\nNext steps:")
        print("1. Integrate routes into server.py")
        print("2. Build frontend components")
        print("3. Test complete user journey")
        
    except Exception as e:
        print(f"❌ Error seeding learning platform: {str(e)}")
        raise

if __name__ == "__main__":
    asyncio.run(seed_learning_platform())
