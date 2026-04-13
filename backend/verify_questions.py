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
    
    # List all tests
    tests = await db.tests.find({}, {'_id': 0, 'title': 1, 'type': 1}).to_list(100)
    print(f"Found {len(tests)} tests:")
    for t in tests:
        print(f"  - {t.get('title')} ({t.get('type')})")
    
    # Get reading test
    reading_test = await db.tests.find_one({"type": "reading"})
    if reading_test:
        print(f"\n📚 Reading Test: {reading_test.get('title')}")
        questions = reading_test.get('questions', [])
        print(f"Total questions: {len(questions)}")
        
        # Show questions 18-25
        print("\nQuestions 18-25:")
        for q in questions:
            q_id = q.get('id')
            if isinstance(q_id, (int, str)):
                id_str = str(q_id)
                # Check if question is in range 18-25
                try:
                    if '-' in id_str or ',' in id_str:
                        print(f"  ID: '{q_id}' (COMBINED), Type: {q.get('type')}")
                    elif int(id_str) >= 18 and int(id_str) <= 25:
                        print(f"  ID: {q_id}, Type: {q.get('type')}")
                except:
                    if any(num in id_str for num in ['18', '19', '20', '21', '22', '23', '24', '25']):
                        print(f"  ID: '{q_id}', Type: {q.get('type')}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
