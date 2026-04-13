#!/usr/bin/env python3
"""
DEPLOYMENT FIX: Update production database with combined question IDs

This script updates the production database to combine Q20-21 and Q22-23
in the Academic Reading Practice Test 1, which is the correct IELTS format.

RUN THIS ON YOUR PRODUCTION/DEPLOYED ENVIRONMENT to fix the Q21-22 display issue.
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def fix_production_questions():
    mongo_url = os.environ['MONGO_URL']
    db_name = os.environ.get('DB_NAME', 'ielts_database').strip('"')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print("🔧 PRODUCTION FIX: Updating Reading Test Questions")
    print("=" * 60)
    
    # Find the Academic Reading Practice Test 1
    test = await db.tests.find_one({"test_type": "reading", "title": "Academic Reading Practice Test 1"})
    
    if not test:
        print("❌ Academic Reading Practice Test 1 not found")
        print("   Make sure the seed script has been run first!")
        client.close()
        return
    
    print(f"✅ Found test: {test['title']}")
    
    questions = test.get('questions', [])
    print(f"   Current question count: {len(questions)}")
    
    # Check if questions are already combined
    q20_21_exists = any(q.get('id') == '20-21' for q in questions)
    q22_23_exists = any(q.get('id') == '22-23' for q in questions)
    
    if q20_21_exists and q22_23_exists:
        print("\n✅ Questions are already properly combined!")
        print("   Q20-21 and Q22-23 are correctly formatted.")
        print("\n💡 If the issue persists in production:")
        print("   1. Clear your browser cache")
        print("   2. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)")
        print("   3. Check if you're looking at the correct deployed URL")
        client.close()
        return
    
    print("\n⚠️  Questions need to be combined. Processing...")
    
    # Create new questions list with combined IDs
    new_questions = []
    skip_next = False
    changes_made = 0
    
    for i, q in enumerate(questions):
        if skip_next:
            skip_next = False
            continue
        
        q_id = q.get('id')
        
        # Check if this is Q20 or Q22 that needs to be combined
        if q_id in [20, '20']:
            # Look for Q21
            next_q = questions[i + 1] if i + 1 < len(questions) else None
            if next_q and next_q.get('id') in [21, '21']:
                # Combine Q20-21
                combined_q = {
                    "id": "20-21",
                    "passage": 2,
                    "type": "multiple_choice_multi",
                    "question": "Which TWO statements does the writer make about inhabitants of the Mediterranean region in the ancient world?",
                    "options": [
                        "A) They often used stolen vessels to carry out pirate attacks",
                        "B) They managed to escape capture by the authorities because they knew the area so well",
                        "C) They paid for information about the routes merchant ships would take",
                        "D) They depended more on the sea for their livelihood than on farming",
                        "E) They stored many of the goods taken in pirate attacks in coves along the coastline"
                    ],
                    "answer_count": 2,
                    "answer_ids": [20, 21]
                }
                new_questions.append(combined_q)
                skip_next = True
                changes_made += 1
                print(f"   ✅ Combined Q20 and Q21 → Q20-21")
                continue
        
        elif q_id in [22, '22']:
            # Look for Q23
            next_q = questions[i + 1] if i + 1 < len(questions) else None
            if next_q and next_q.get('id') in [23, '23']:
                # Combine Q22-23
                combined_q = {
                    "id": "22-23",
                    "passage": 2,
                    "type": "multiple_choice_multi",
                    "question": "Which TWO statements does the writer make about piracy and ancient Greece?",
                    "options": [
                        "A) The state estimated that very few people were involved in piracy",
                        "B) Attitudes towards piracy changed shortly after the Iliad and the Odyssey were written",
                        "C) Important officials were known to occasionally take part in piracy",
                        "D) Every citizen regarded pirate attacks on cities as unacceptable",
                        "E) A favourable view of piracy is evident in certain ancient Greek texts"
                    ],
                    "answer_count": 2,
                    "answer_ids": [22, 23]
                }
                new_questions.append(combined_q)
                skip_next = True
                changes_made += 1
                print(f"   ✅ Combined Q22 and Q23 → Q22-23")
                continue
        
        # Keep the question as-is
        new_questions.append(q)
    
    # Update answer key as well
    answer_key = test.get('answer_key', [])
    new_answer_key = []
    skip_next = False
    
    for i, answer in enumerate(answer_key):
        if skip_next:
            skip_next = False
            continue
        
        q_id = answer.get('question_id')
        
        # Check if answer key already has combined IDs
        if q_id in ['20-21', '22-23']:
            new_answer_key.append(answer)
            continue
        
        # Combine answer keys for Q20-21 and Q22-23
        if q_id in [20, '20']:
            next_answer = answer_key[i + 1] if i + 1 < len(answer_key) else None
            if next_answer and next_answer.get('question_id') in [21, '21']:
                combined_answer = {
                    "question_id": "20-21",
                    "answer": ["B", "D"],
                    "explanation": "B is correct as the final sentence in Paragraph B states that 'knowledge of the local area helped the pirates to avoid retaliation once a state fleet arrived'. D is correct as Paragraph B states that 'the inhabitants of these areas relied heavily on marine resources, including fish and salt', meaning that they depended on resources from the sea more than farming."
                }
                new_answer_key.append(combined_answer)
                skip_next = True
                print(f"   ✅ Combined answer key for Q20-21")
                continue
        
        elif q_id in [22, '22']:
            next_answer = answer_key[i + 1] if i + 1 < len(answer_key) else None
            if next_answer and next_answer.get('question_id') in [23, '23']:
                combined_answer = {
                    "question_id": "22-23",
                    "answer": ["C", "E"],
                    "explanation": "C is correct: According to Paragraph E, in ancient Greece 'Even high-ranking members of the state were not beyond engaging in such activities'. E is correct: Paragraph E says that in his works the Iliad and the Odyssey, Homer 'not only condones (accepts), but praises the lifestyle and actions of pirates'."
                }
                new_answer_key.append(combined_answer)
                skip_next = True
                print(f"   ✅ Combined answer key for Q22-23")
                continue
        
        # Keep the answer as-is
        new_answer_key.append(answer)
    
    if changes_made == 0:
        print("\n⚠️  No changes were needed. Questions may already be in correct format.")
        client.close()
        return
    
    # Update the test in database
    result = await db.tests.update_one(
        {"_id": test['_id']},
        {
            "$set": {
                "questions": new_questions,
                "answer_key": new_answer_key
            }
        }
    )
    
    print(f"\n✅ SUCCESS! Database updated")
    print(f"   Questions: {len(questions)} → {len(new_questions)}")
    print(f"   Answer key: {len(answer_key)} → {len(new_answer_key)}")
    print(f"   Changes made: {changes_made}")
    
    # Verify the changes
    updated_test = await db.tests.find_one({"_id": test['_id']})
    updated_questions = updated_test.get('questions', [])
    
    print("\n📋 Verification - Questions 18-25:")
    for q in updated_questions:
        q_id = q.get('id')
        if isinstance(q_id, (int, str)):
            id_str = str(q_id)
            try:
                if '-' in id_str and any(num in id_str for num in ['20', '21', '22', '23']):
                    print(f"   ✅ {q_id} (COMBINED) - {q.get('type')}")
                elif id_str.isdigit() and 18 <= int(id_str) <= 25:
                    print(f"   {q_id} - {q.get('type')}")
            except:
                pass
    
    client.close()
    print("\n" + "=" * 60)
    print("✅ DONE! The questions should now display correctly.")
    print("\n💡 Next steps:")
    print("   1. Redeploy your application to production")
    print("   2. Clear browser cache and hard refresh")
    print("   3. Verify Q20-21 and Q22-23 display correctly")

if __name__ == "__main__":
    asyncio.run(fix_production_questions())
