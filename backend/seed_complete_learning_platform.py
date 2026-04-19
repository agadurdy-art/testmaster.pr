"""
COMPLETE LEARNING PLATFORM - FULL CURRICULUM
Cambridge YLE → CEFR → IELTS pathway with comprehensive lessons
Band 2.0 to Band 9.0 complete journey
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
def create_yle_starters():
    return {
        "id": "level_yle_starters",
        "level_code": "YLE_STARTERS",
        "level_name": "Cambridge YLE Starters",
        "level_order": 1,
        "description": "Perfect for complete beginners. Learn basic English through fun activities, simple conversations, and familiar topics like family, animals, and daily routines.",
        "target_band_range": "2.0-3.0",
        "pathway": "cambridge_yle",
        "total_estimated_hours": 60,
        "units": [
            {
                "id": "unit_starters_1",
                "unit_number": 1,
                "title": "Hello & Introductions",
                "description": "Learn to introduce yourself, greet people, and talk about your name and age",
                "learning_objectives": [
                    "Greet people and say goodbye",
                    "Introduce yourself with name and age",
                    "Use simple present tense with 'to be'",
                    "Recognize basic classroom vocabulary"
                ],
                "estimated_hours": 12,
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
                            "vocabulary": ["hello", "hi", "goodbye", "bye", "name", "my", "your", "nice", "meet"],
                            "grammar_focus": "Present tense 'to be' - I am, You are",
                            "example_sentences": [
                                "Hello! My name is Tom.",
                                "Hi! I am Sarah.",
                                "What is your name?",
                                "Nice to meet you!"
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
                                        {"left": "What's your name?", "right": "My name is Tom."},
                                        {"left": "Goodbye!", "right": "Bye!"}
                                    ]
                                }
                            ]
                        }
                    },
                    {
                        "id": generate_id(),
                        "lesson_number": 2,
                        "title": "Numbers 1-10 & Age",
                        "description": "Learn numbers and how to say your age",
                        "duration_minutes": 30,
                        "lesson_type": "vocabulary",
                        "required_for_next": True,
                        "content": {
                            "vocabulary": ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "age", "old", "years", "how"],
                            "grammar_focus": "How old are you? I am ___ years old.",
                            "example_sentences": [
                                "I am seven years old.",
                                "How old are you?",
                                "She is eight.",
                                "He is ten years old."
                            ],
                            "exercises": [
                                {
                                    "type": "multiple_choice",
                                    "prompt": "I am ___ years old. (7)",
                                    "options": ["seven", "eight", "nine"],
                                    "correct": "seven"
                                },
                                {
                                    "type": "fill_blank",
                                    "prompt": "How ___ are you?",
                                    "options": ["old", "age", "years"],
                                    "correct": "old"
                                }
                            ]
                        }
                    },
                    {
                        "id": generate_id(),
                        "lesson_number": 3,
                        "title": "Colors & Classroom Objects",
                        "description": "Learn basic colors and things in the classroom",
                        "duration_minutes": 40,
                        "lesson_type": "vocabulary",
                        "required_for_next": True,
                        "content": {
                            "vocabulary": ["red", "blue", "yellow", "green", "orange", "purple", "black", "white", "book", "pen", "pencil", "desk", "chair", "bag", "door", "window"],
                            "grammar_focus": "This is a... / These are... / It is...",
                            "example_sentences": [
                                "This is a red book.",
                                "The pen is blue.",
                                "I have a yellow bag.",
                                "The door is brown."
                            ],
                            "exercises": [
                                {
                                    "type": "matching",
                                    "prompt": "Match the color to describe the object",
                                    "pairs": [
                                        {"left": "The sky is", "right": "blue"},
                                        {"left": "The grass is", "right": "green"},
                                        {"left": "The sun is", "right": "yellow"}
                                    ]
                                }
                            ]
                        }
                    },
                    {
                        "id": generate_id(),
                        "lesson_number": 4,
                        "title": "Simple Questions & Answers",
                        "description": "Practice asking and answering simple questions",
                        "duration_minutes": 40,
                        "lesson_type": "grammar",
                        "required_for_next": True,
                        "content": {
                            "vocabulary": ["what", "where", "who", "yes", "no", "please", "thank you"],
                            "grammar_focus": "Question formation with 'is' and 'are'",
                            "example_sentences": [
                                "What is your name?",
                                "Where is the book?",
                                "Is this your pen? Yes, it is.",
                                "Are you a student? Yes, I am."
                            ],
                            "exercises": []
                        }
                    }
                ],
                "unit_quiz": {
                    "id": generate_id(),
                    "title": "Unit 1 Quiz: Hello & Introductions",
                    "description": "Test your knowledge of greetings, numbers, colors, and simple questions",
                    "quiz_type": "unit_quiz",
                    "duration_minutes": 20,
                    "passing_score": 70,
                    "questions": [
                        {"id": "q1", "type": "multiple_choice", "question": "My name ___ Sarah.", "options": ["A) is", "B) am", "C) are"], "correct_answer": "A"},
                        {"id": "q2", "type": "multiple_choice", "question": "How do you say 'goodbye'?", "options": ["A) Hello", "B) Hi", "C) Bye"], "correct_answer": "C"},
                        {"id": "q3", "type": "multiple_choice", "question": "I am ___ years old. (8)", "options": ["A) seven", "B) eight", "C) nine"], "correct_answer": "B"},
                        {"id": "q4", "type": "multiple_choice", "question": "What color is a banana?", "options": ["A) Red", "B) Blue", "C) Yellow"], "correct_answer": "C"},
                        {"id": "q5", "type": "multiple_choice", "question": "This ___ a book.", "options": ["A) is", "B) am", "C) are"], "correct_answer": "A"}
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
                    "Use possessive 's and pronouns",
                    "Count to 20"
                ],
                "estimated_hours": 12,
                "is_locked": True,
                "lessons": [
                    {
                        "id": generate_id(),
                        "lesson_number": 1,
                        "title": "My Family",
                        "description": "Learn family member vocabulary",
                        "duration_minutes": 35,
                        "lesson_type": "vocabulary",
                        "required_for_next": True,
                        "content": {
                            "vocabulary": ["mother", "father", "mom", "dad", "sister", "brother", "family", "grandma", "grandpa", "baby", "parents"],
                            "grammar_focus": "This is my... / He is... / She is...",
                            "example_sentences": [
                                "This is my mother.",
                                "I have one sister and one brother.",
                                "My family is big.",
                                "She is my grandma."
                            ],
                            "exercises": [
                                {
                                    "type": "matching",
                                    "prompt": "Match family members",
                                    "pairs": [
                                        {"left": "Your father's mother", "right": "Grandma"},
                                        {"left": "Your mother and father", "right": "Parents"}
                                    ]
                                }
                            ]
                        }
                    },
                    {
                        "id": generate_id(),
                        "lesson_number": 2,
                        "title": "Describing People",
                        "description": "Learn adjectives to describe appearance and feelings",
                        "duration_minutes": 35,
                        "lesson_type": "vocabulary",
                        "required_for_next": True,
                        "content": {
                            "vocabulary": ["tall", "short", "big", "small", "happy", "sad", "young", "old", "nice", "funny"],
                            "grammar_focus": "He/She is + adjective",
                            "example_sentences": [
                                "My father is tall.",
                                "My sister is young.",
                                "Grandma is old but happy.",
                                "My brother is funny."
                            ],
                            "exercises": []
                        }
                    },
                    {
                        "id": generate_id(),
                        "lesson_number": 3,
                        "title": "Numbers 11-20",
                        "description": "Learn to count from eleven to twenty",
                        "duration_minutes": 30,
                        "lesson_type": "vocabulary",
                        "required_for_next": True,
                        "content": {
                            "vocabulary": ["eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"],
                            "grammar_focus": "Counting and basic addition",
                            "example_sentences": [
                                "I am twelve years old.",
                                "Ten plus five is fifteen.",
                                "There are twenty students."
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
                    "duration_minutes": 20,
                    "passing_score": 70,
                    "questions": [
                        {"id": "q1", "type": "multiple_choice", "question": "Who is your mother's mother?", "options": ["A) Aunt", "B) Grandma", "C) Sister"], "correct_answer": "B"},
                        {"id": "q2", "type": "multiple_choice", "question": "My father is ___. (opposite of short)", "options": ["A) tall", "B) big", "C) old"], "correct_answer": "A"},
                        {"id": "q3", "type": "multiple_choice", "question": "What is 10 + 5?", "options": ["A) fourteen", "B) fifteen", "C) sixteen"], "correct_answer": "B"}
                    ]
                }
            },
            {
                "id": "unit_starters_3",
                "unit_number": 3,
                "title": "Animals & Pets",
                "description": "Learn about common animals and describe pets",
                "learning_objectives": [
                    "Name common animals",
                    "Talk about pets and what they can do",
                    "Use 'have/has' correctly",
                    "Describe animal characteristics"
                ],
                "estimated_hours": 12,
                "is_locked": True,
                "lessons": [
                    {
                        "id": generate_id(),
                        "lesson_number": 1,
                        "title": "Common Animals",
                        "description": "Learn names of animals",
                        "duration_minutes": 35,
                        "lesson_type": "vocabulary",
                        "required_for_next": True,
                        "content": {
                            "vocabulary": ["dog", "cat", "bird", "fish", "mouse", "horse", "cow", "sheep", "chicken", "duck", "rabbit", "elephant", "lion", "tiger"],
                            "grammar_focus": "This is a... / These are...",
                            "example_sentences": [
                                "I have a dog.",
                                "This is a cat.",
                                "The bird is in the tree.",
                                "Elephants are big."
                            ],
                            "exercises": []
                        }
                    },
                    {
                        "id": generate_id(),
                        "lesson_number": 2,
                        "title": "My Pet",
                        "description": "Talk about pets and what they do",
                        "duration_minutes": 35,
                        "lesson_type": "mixed",
                        "required_for_next": True,
                        "content": {
                            "vocabulary": ["pet", "run", "jump", "swim", "fly", "eat", "sleep", "play", "love"],
                            "grammar_focus": "I have... / My pet can... / It likes...",
                            "example_sentences": [
                                "I have a pet dog.",
                                "My cat can jump.",
                                "The fish can swim.",
                                "My dog likes to play."
                            ],
                            "exercises": []
                        }
                    }
                ],
                "unit_quiz": {
                    "id": generate_id(),
                    "title": "Unit 3 Quiz: Animals & Pets",
                    "description": "Test your animal vocabulary",
                    "quiz_type": "unit_quiz",
                    "duration_minutes": 15,
                    "passing_score": 70,
                    "questions": [
                        {"id": "q1", "type": "multiple_choice", "question": "Which animal can fly?", "options": ["A) Dog", "B) Bird", "C) Fish"], "correct_answer": "B"},
                        {"id": "q2", "type": "multiple_choice", "question": "I ___ a pet cat.", "options": ["A) have", "B) has", "C) am"], "correct_answer": "A"}
                    ]
                }
            },
            {
                "id": "unit_starters_4",
                "unit_number": 4,
                "title": "Food & Drinks",
                "description": "Learn vocabulary for common foods and express likes/dislikes",
                "learning_objectives": [
                    "Name common foods and drinks",
                    "Express likes and dislikes",
                    "Use 'like/likes' correctly",
                    "Talk about meals"
                ],
                "estimated_hours": 12,
                "is_locked": True,
                "lessons": [
                    {
                        "id": generate_id(),
                        "lesson_number": 1,
                        "title": "Food Vocabulary",
                        "description": "Learn names of common foods",
                        "duration_minutes": 35,
                        "lesson_type": "vocabulary",
                        "required_for_next": True,
                        "content": {
                            "vocabulary": ["apple", "banana", "orange", "bread", "milk", "water", "juice", "egg", "cheese", "rice", "chicken", "fish", "cake", "ice cream"],
                            "grammar_focus": "I like... / I don't like...",
                            "example_sentences": [
                                "I like apples.",
                                "She likes ice cream.",
                                "I don't like fish.",
                                "Do you like bananas?"
                            ],
                            "exercises": []
                        }
                    },
                    {
                        "id": generate_id(),
                        "lesson_number": 2,
                        "title": "Meals & Drinks",
                        "description": "Talk about breakfast, lunch, and dinner",
                        "duration_minutes": 35,
                        "lesson_type": "mixed",
                        "required_for_next": True,
                        "content": {
                            "vocabulary": ["breakfast", "lunch", "dinner", "hungry", "thirsty", "eat", "drink", "food", "delicious"],
                            "grammar_focus": "I eat... for breakfast / I drink...",
                            "example_sentences": [
                                "I eat bread for breakfast.",
                                "I drink milk.",
                                "I am hungry.",
                                "The cake is delicious!"
                            ],
                            "exercises": []
                        }
                    }
                ],
                "unit_quiz": {
                    "id": generate_id(),
                    "title": "Unit 4 Quiz: Food & Drinks",
                    "description": "Test your food vocabulary and likes/dislikes",
                    "quiz_type": "unit_quiz",
                    "duration_minutes": 15,
                    "passing_score": 70,
                    "questions": [
                        {"id": "q1", "type": "multiple_choice", "question": "I ___ apples.", "options": ["A) like", "B) likes", "C) liking"], "correct_answer": "A"},
                        {"id": "q2", "type": "multiple_choice", "question": "What do you eat in the morning?", "options": ["A) Dinner", "B) Lunch", "C) Breakfast"], "correct_answer": "C"}
                    ]
                }
            }
        ],
        "exit_test": {
            "id": generate_id(),
            "title": "YLE Starters Exit Test",
            "description": "Complete assessment covering all units - pass to unlock A1 level",
            "quiz_type": "exit_test",
            "duration_minutes": 40,
            "passing_score": 75,
            "target_band": 3.0,
            "questions": [
                {"id": "q1", "type": "multiple_choice", "question": "Hello! My name ___ Tom.", "options": ["A) is", "B) am", "C) are"], "correct_answer": "A"},
                {"id": "q2", "type": "multiple_choice", "question": "I am ___ years old. (10)", "options": ["A) nine", "B) ten", "C) eleven"], "correct_answer": "B"},
                {"id": "q3", "type": "multiple_choice", "question": "This is ___ book. (my)", "options": ["A) my", "B) I", "C) me"], "correct_answer": "A"},
                {"id": "q4", "type": "multiple_choice", "question": "The sky is ___.", "options": ["A) red", "B) blue", "C) green"], "correct_answer": "B"},
                {"id": "q5", "type": "multiple_choice", "question": "Who is your father's mother?", "options": ["A) Mother", "B) Grandma", "C) Sister"], "correct_answer": "B"},
                {"id": "q6", "type": "multiple_choice", "question": "A bird can ___.", "options": ["A) swim", "B) fly", "C) run"], "correct_answer": "B"},
                {"id": "q7", "type": "multiple_choice", "question": "I ___ pizza.", "options": ["A) like", "B) likes", "C) am like"], "correct_answer": "A"},
                {"id": "q8", "type": "multiple_choice", "question": "What is 15 + 5?", "options": ["A) eighteen", "B) nineteen", "C) twenty"], "correct_answer": "C"}
            ]
        },
        "created_at": datetime.now(timezone.utc).isoformat()
    }

# Continue in next message due to length...
