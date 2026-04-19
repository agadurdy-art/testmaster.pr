#!/usr/bin/env python3
"""
Fix combined question IDs in Academic Reading Practice Test 1
Combines Q20-21 and Q22-23 as they should be displayed together
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def fix_combined_questions():
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    print("🔧 Fixing combined question IDs in Reading Test...")
    
    # Find the Academic Reading Practice Test 1
    test = await db.tests.find_one({"type": "reading", "title": "Academic Reading Practice Test 1"})
    
    if not test:
        print("❌ Academic Reading Practice Test 1 not found")
        return
    
    print(f"✅ Found test: {test['title']}")
    
    questions = test.get('questions', [])
    print(f"   Total questions: {len(questions)}")
    
    # Check current state of questions 20-23
    print("\n📋 Current state of questions 20-23:")
    q_20_23 = [q for q in questions if isinstance(q.get('id'), (int, str)) and 
               (str(q.get('id')) in ['20', '21', '22', '23', '20-21', '22-23'])]
    for q in q_20_23:
        print(f"   ID: {q.get('id')}, Type: {q.get('type')}, Passage: {q.get('passage')}")
    
    # Create new questions list with combined IDs
    new_questions = []
    skip_next = False
    
    for i, q in enumerate(questions):
        if skip_next:
            skip_next = False
            continue
        
        q_id = q.get('id')
        
        # Check if this is Q20 or Q22 that needs to be combined
        if q_id == 20 or q_id == '20':
            # Look for Q21
            next_q = questions[i + 1] if i + 1 < len(questions) else None
            if next_q and (next_q.get('id') == 21 or next_q.get('id') == '21'):
                # Combine Q20-21
                combined_q = {
                    "id": "20-21",
                    "passage": q.get('passage', 2),
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
                print(f"   ✅ Combined Q20 and Q21 into Q20-21")
                continue
        
        elif q_id == 22 or q_id == '22':
            # Look for Q23
            next_q = questions[i + 1] if i + 1 < len(questions) else None
            if next_q and (next_q.get('id') == 23 or next_q.get('id') == '23'):
                # Combine Q22-23
                combined_q = {
                    "id": "22-23",
                    "passage": q.get('passage', 2),
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
                print(f"   ✅ Combined Q22 and Q23 into Q22-23")
                continue
        
        # Keep the question as-is
        new_questions.append(q)
    
    # Update the answer key as well
    answer_key = test.get('answer_key', [])
    new_answer_key = []
    skip_next = False
    
    for i, answer in enumerate(answer_key):
        if skip_next:
            skip_next = False
            continue
        
        q_id = answer.get('question_id')
        
        # Combine answer keys for Q20-21 and Q22-23
        if q_id == 20 or q_id == '20':
            next_answer = answer_key[i + 1] if i + 1 < len(answer_key) else None
            if next_answer and (next_answer.get('question_id') == 21 or next_answer.get('question_id') == '21'):
                # Combine into Q20-21 answer
                combined_answer = {
                    "question_id": "20-21",
                    "answer": ["B", "D"],
                    "explanation": "B is correct as the final sentence in Paragraph B states that 'knowledge of the local area helped the pirates to avoid retaliation once a state fleet arrived'. D is correct as Paragraph B states that 'the inhabitants of these areas relied heavily on marine resources, including fish and salt', meaning that they depended on resources from the sea more than farming."
                }
                new_answer_key.append(combined_answer)
                skip_next = True
                print(f"   ✅ Combined answer key for Q20-21")
                continue
        
        elif q_id == 22 or q_id == '22':
            next_answer = answer_key[i + 1] if i + 1 < len(answer_key) else None
            if next_answer and (next_answer.get('question_id') == 23 or next_answer.get('question_id') == '23'):
                # Combine into Q22-23 answer
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
    
    print(f"\n✅ Updated test with {len(new_questions)} questions (was {len(questions)})")
    print(f"✅ Updated answer key with {len(new_answer_key)} entries (was {len(answer_key)})")
    
    # Verify the changes
    updated_test = await db.tests.find_one({"_id": test['_id']})
    updated_questions = updated_test.get('questions', [])
    
    print("\n📋 Updated state of questions 20-23:")
    q_20_23_new = [q for q in updated_questions if isinstance(q.get('id'), (int, str)) and 
                   (str(q.get('id')) in ['20', '21', '22', '23', '20-21', '22-23'])]
    for q in q_20_23_new:
        print(f"   ID: {q.get('id')}, Type: {q.get('type')}, Passage: {q.get('passage')}")
    
    client.close()
    print("\n✅ Done! The questions should now display as Q20-21 and Q22-23")

if __name__ == "__main__":
    asyncio.run(fix_combined_questions())
