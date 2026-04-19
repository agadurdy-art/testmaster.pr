#!/usr/bin/env python3
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def main():
    mongo_url = os.environ['MONGO_URL']
    db_name = os.environ.get('DB_NAME', 'ielts_database').strip('"')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Get reading test using test_type field
    reading_test = await db.tests.find_one({"test_type": "reading"})
    if reading_test:
        print(f"📚 Reading Test: {reading_test.get('title')}")
        questions = reading_test.get('questions', [])
        print(f"Total questions: {len(questions)}\n")
        
        # Show questions 18-27
        print("Questions 18-27:")
        for q in questions:
            q_id = q.get('id')
            if isinstance(q_id, (int, str)):
                id_str = str(q_id)
                # Check if question contains numbers 18-27
                relevant = False
                try:
                    if '-' in id_str:
                        # Combined question like "20-21"
                        parts = id_str.split('-')
                        nums = [int(p) for p in parts if p.isdigit()]
                        if any(18 <= n <= 27 for n in nums):
                            relevant = True
                            print(f"  ✅ ID: '{q_id}' (COMBINED), Type: {q.get('type')}, Passage: {q.get('passage')}")
                    elif id_str.isdigit():
                        num = int(id_str)
                        if 18 <= num <= 27:
                            relevant = True
                            print(f"  ID: {q_id}, Type: {q.get('type')}, Passage: {q.get('passage')}")
                except:
                    pass
        
        # Check answer key
        print("\nAnswer Key for Q18-27:")
        answer_key = reading_test.get('answer_key', [])
        for ans in answer_key:
            q_id = str(ans.get('question_id'))
            if any(num in q_id for num in ['18', '19', '20', '21', '22', '23', '24', '25', '26', '27']):
                print(f"  Q{q_id}: {ans.get('answer')}")
    else:
        print("❌ No reading test found")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
