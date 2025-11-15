"""
Seed script to populate MongoDB with sample IELTS test data
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
import uuid

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def seed_database():
    # Connect to MongoDB
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    print("🌱 Seeding database...")
    
    # Clear existing data
    await db.tests.delete_many({})
    await db.tips.delete_many({})
    await db.courses.delete_many({})
    
    # Sample Reading Test
    reading_test = {
        "id": str(uuid.uuid4()),
        "title": "Academic Reading Test 1",
        "test_type": "reading",
        "duration": 60,
        "passages": [
            {
                "id": 1,
                "title": "The Impact of Artificial Intelligence on Modern Society",
                "text": """Artificial Intelligence (AI) has emerged as one of the most transformative technologies of the 21st century. From healthcare to transportation, AI systems are revolutionizing how we live and work. Machine learning algorithms can now diagnose diseases with accuracy rivaling human doctors, while autonomous vehicles promise to reshape urban transportation.

However, the rapid advancement of AI also raises important questions about employment, privacy, and ethics. As machines become capable of performing tasks once thought to require human intelligence, millions of jobs may be displaced. Moreover, the collection and analysis of vast amounts of personal data by AI systems has sparked concerns about privacy and surveillance.

Despite these challenges, many experts remain optimistic about AI's potential to solve complex global problems. From climate change modeling to drug discovery, AI is enabling breakthroughs that were previously impossible. The key lies in developing appropriate regulations and ethical frameworks to guide AI development while fostering innovation."""
            }
        ],
        "questions": [
            {"id": 1, "type": "multiple_choice", "question": "According to the passage, AI systems can:", "options": ["A) Only work in healthcare", "B) Diagnose diseases accurately", "C) Replace all human jobs", "D) Solve all global problems"], "passage": 1},
            {"id": 2, "type": "true_false", "question": "The passage suggests that AI development has no negative consequences.", "passage": 1},
            {"id": 3, "type": "fill_blank", "question": "AI is enabling breakthroughs in areas such as climate change modeling and _______.", "passage": 1},
            {"id": 4, "type": "matching", "question": "Match the AI application: Autonomous vehicles relate to which sector?", "options": ["A) Healthcare", "B) Transportation", "C) Education", "D) Agriculture"], "passage": 1}
        ],
        "answer_key": [
            {"question_id": 1, "answer": "B"},
            {"question_id": 2, "answer": "False"},
            {"question_id": 3, "answer": "drug discovery"},
            {"question_id": 4, "answer": "B"}
        ]
    }
    
    # Sample Listening Test
    listening_test = {
        "id": str(uuid.uuid4()),
        "title": "Academic Listening Test 1",
        "test_type": "listening",
        "duration": 40,
        "audio_url": "/audio/listening-test-1.mp3",
        "questions": [
            {"id": 1, "type": "fill_blank", "question": "The conference will take place in _______.", "part": 1},
            {"id": 2, "type": "multiple_choice", "question": "What time does the registration start?", "options": ["A) 8:00 AM", "B) 9:00 AM", "C) 10:00 AM", "D) 11:00 AM"], "part": 1},
            {"id": 3, "type": "fill_blank", "question": "Participants need to bring their _______.", "part": 1},
            {"id": 4, "type": "true_false", "question": "Lunch will be provided for all attendees.", "part": 2}
        ],
        "answer_key": [
            {"question_id": 1, "answer": "London"},
            {"question_id": 2, "answer": "B"},
            {"question_id": 3, "answer": "ID card"},
            {"question_id": 4, "answer": "True"}
        ]
    }
    
    # Sample Writing Test
    writing_test = {
        "id": str(uuid.uuid4()),
        "title": "Academic Writing Test 1",
        "test_type": "writing",
        "duration": 60,
        "questions": [
            {
                "id": 1,
                "task": "task1",
                "type": "graph_description",
                "question": "The graph below shows the consumption of renewable energy in different countries from 2010 to 2020. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.",
                "word_limit": 150,
                "image_url": "/images/graph-renewable-energy.png"
            },
            {
                "id": 2,
                "task": "task2",
                "type": "essay",
                "question": "Some people believe that the internet has brought people closer together, while others think it has made people more isolated. Discuss both views and give your own opinion.",
                "word_limit": 250
            }
        ],
        "answer_key": []
    }
    
    # Sample Speaking Test (structure only, no answer key)
    speaking_test = {
        "id": str(uuid.uuid4()),
        "title": "Speaking Test 1",
        "test_type": "speaking",
        "duration": 15,
        "questions": [
            {"id": 1, "part": 1, "question": "Tell me about your hometown."},
            {"id": 2, "part": 1, "question": "What do you do? Do you work or are you a student?"},
            {"id": 3, "part": 2, "question": "Describe a memorable event in your life. You should say: what the event was, when it happened, who was there, and explain why it was memorable."},
            {"id": 4, "part": 3, "question": "How has technology changed the way people communicate?"}
        ],
        "answer_key": []
    }
    
    # Insert tests
    await db.tests.insert_many([reading_test, listening_test, writing_test, speaking_test])
    print("✅ Tests seeded")
    
    # Sample Tips
    tips = [
        {
            "id": str(uuid.uuid4()),
            "title": "Time Management in Reading Test",
            "category": "reading",
            "content": """**Time Management Tips:**

1. **Skim First**: Spend 2-3 minutes skimming through all passages before starting questions
2. **Read Questions First**: Understanding what you need to find makes reading more efficient
3. **Don't Spend Too Long**: If stuck, move on and return later
4. **Allocate Time**: Aim for 20 minutes per passage including questions
5. **Leave Time for Transfer**: Keep 3-5 minutes at the end to transfer answers"""
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Writing Task 2 Structure",
            "category": "writing",
            "content": """**Essay Structure:**

**Introduction (50 words)**
- Paraphrase the question
- State your position

**Body Paragraph 1 (80-100 words)**
- Main idea
- Supporting details
- Example

**Body Paragraph 2 (80-100 words)**
- Second main idea
- Supporting details
- Example

**Conclusion (40 words)**
- Summarize main points
- Restate position"""
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Listening Test Strategies",
            "category": "listening",
            "content": """**Key Strategies:**

1. **Use Preparation Time**: Read questions before audio starts
2. **Listen for Keywords**: Focus on names, numbers, dates
3. **Watch for Distractors**: Be careful of information that sounds right but isn't
4. **Spelling Matters**: Write clearly and check spelling
5. **Don't Panic**: If you miss an answer, keep listening for the next one"""
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Speaking Test Confidence",
            "category": "speaking",
            "content": """**Building Confidence:**

1. **Practice Daily**: Speak English for 10 minutes every day
2. **Record Yourself**: Listen back to identify areas for improvement
3. **Expand Answers**: Don't give one-word responses
4. **Use Discourse Markers**: Words like 'however', 'moreover', 'in addition'
5. **Stay Calm**: Take a breath before answering if needed"""
        }
    ]
    
    await db.tips.insert_many(tips)
    print("✅ Tips seeded")
    
    # Sample Courses
    courses = [
        {
            "id": str(uuid.uuid4()),
            "title": "IELTS Academic Complete Preparation",
            "description": "Comprehensive course covering all four modules of IELTS Academic test with practice materials and strategies.",
            "modules": [
                {
                    "id": 1,
                    "title": "Reading Module",
                    "lessons": [
                        {"id": 1, "title": "Understanding Question Types", "duration": "30 min"},
                        {"id": 2, "title": "Skimming and Scanning Techniques", "duration": "45 min"},
                        {"id": 3, "title": "Time Management Strategies", "duration": "20 min"}
                    ]
                },
                {
                    "id": 2,
                    "title": "Writing Module",
                    "lessons": [
                        {"id": 1, "title": "Task 1: Graph Description", "duration": "40 min"},
                        {"id": 2, "title": "Task 2: Essay Writing", "duration": "50 min"},
                        {"id": 3, "title": "Grammar and Vocabulary", "duration": "35 min"}
                    ]
                },
                {
                    "id": 3,
                    "title": "Listening Module",
                    "lessons": [
                        {"id": 1, "title": "Understanding Accents", "duration": "25 min"},
                        {"id": 2, "title": "Note-Taking Skills", "duration": "30 min"},
                        {"id": 3, "title": "Practice Tests", "duration": "60 min"}
                    ]
                },
                {
                    "id": 4,
                    "title": "Speaking Module",
                    "lessons": [
                        {"id": 1, "title": "Part 1: Introduction", "duration": "20 min"},
                        {"id": 2, "title": "Part 2: Long Turn", "duration": "30 min"},
                        {"id": 3, "title": "Part 3: Discussion", "duration": "25 min"}
                    ]
                }
            ]
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Band 7+ Intensive Course",
            "description": "Advanced strategies and techniques to achieve Band 7 or higher in IELTS.",
            "modules": [
                {
                    "id": 1,
                    "title": "Advanced Writing Techniques",
                    "lessons": [
                        {"id": 1, "title": "Complex Sentence Structures", "duration": "40 min"},
                        {"id": 2, "title": "Advanced Vocabulary Usage", "duration": "35 min"},
                        {"id": 3, "title": "Coherence and Cohesion", "duration": "30 min"}
                    ]
                },
                {
                    "id": 2,
                    "title": "Speaking Fluency",
                    "lessons": [
                        {"id": 1, "title": "Natural Conversation Flow", "duration": "25 min"},
                        {"id": 2, "title": "Idiomatic Expressions", "duration": "30 min"},
                        {"id": 3, "title": "Mock Interviews", "duration": "45 min"}
                    ]
                }
            ]
        }
    ]
    
    await db.courses.insert_many(courses)
    print("✅ Courses seeded")
    
    print("\\n🎉 Database seeded successfully!")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
