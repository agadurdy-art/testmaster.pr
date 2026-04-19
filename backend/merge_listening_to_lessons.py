#!/usr/bin/env python3
"""
Merge listening content into BEGINNER_LESSONS
"""

import sys
sys.path.insert(0, '/app/backend')

# Import both
from seed_beginner_english import BEGINNER_LESSONS
from scripts.update_all_listening import ALL_LISTENING_CONTENT

# Update each lesson with its listening data
for lesson in BEGINNER_LESSONS:
    lesson_num = lesson.get('lesson_number')
    if lesson_num in ALL_LISTENING_CONTENT:
        listening_data = ALL_LISTENING_CONTENT[lesson_num]
        lesson['listening'] = {
            'title': listening_data['title'],
            'transcript': listening_data['transcript'],
            'questions': listening_data['questions'],
            'tips': listening_data.get('tips', [])
        }
        print(f"✅ Added listening to Lesson {lesson_num}")
    else:
        print(f"⚠️ No listening data for Lesson {lesson_num}")

# Now let's regenerate the seed file with complete data
print("\nGenerating complete seed file...")

with open('/app/backend/seed_beginner_english_complete.py', 'w') as f:
    f.write('#!/usr/bin/env python3\n')
    f.write('"""\nSeed data for the 14-lesson Beginner English Course (Band 4.5 and below)\nThis course is for students who want to start learning for the IELTS exam.\nIncludes listening sections for all 14 lessons.\n"""\n\n')
    f.write('import asyncio\nimport os\nfrom motor.motor_asyncio import AsyncIOMotorClient\n\n')
    f.write("MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')\n")
    f.write("DB_NAME = os.environ.get('DB_NAME', 'ielts_database')\n\n")
    f.write('BEGINNER_LESSONS = ')
    f.write(repr(BEGINNER_LESSONS))
    f.write('\n\n')
    
    # Add the seed function
    f.write('''
async def seed_beginner_lessons():
    """Seed all beginner lessons to database"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Clear existing lessons
    await db.beginner_english_lessons.delete_many({})
    
    # Insert all lessons
    for lesson in BEGINNER_LESSONS:
        await db.beginner_english_lessons.update_one(
            {"id": lesson["id"]},
            {"$set": lesson},
            upsert=True
        )
        print(f"✅ Seeded Lesson {lesson['lesson_number']}: {lesson['title']}")
    
    count = await db.beginner_english_lessons.count_documents({})
    print(f"\\n✅ Total lessons seeded: {count}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_beginner_lessons())
''')

print("✅ Complete seed file created: seed_beginner_english_complete.py")
