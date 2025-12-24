"""
Fix for deployed database: Ensure combined question IDs are preserved correctly.

This script checks and fixes questions that should have combined IDs like "20-21"
but may have been incorrectly stored or split during deployment.

Run this script on the deployed environment to fix the Q20-21 display issue.
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os

async def fix_deployed_questions():
    """
    Fix combined question IDs in the deployed database.
    
    The issue: After deployment, questions like "20-21" are showing as separate "20" and "21".
    This could be due to:
    1. Old seeded data before the combined fix
    2. Data transformation during deployment
    """
    
    mongo_url = os.getenv("MONGO_URL")
    db_name = os.getenv("DB_NAME", "ieltsace")
    
    if not mongo_url:
        print("❌ MONGO_URL not set")
        return
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print("🔍 Checking deployed database for combined question issues...")
    
    # Find all reading and listening tests
    tests = await db.tests.find({
        "test_type": {"$in": ["reading", "listening"]}
    }).to_list(100)
    
    print(f"📋 Found {len(tests)} reading/listening tests")
    
    fixed_count = 0
    
    for test in tests:
        test_title = test.get('title', 'Untitled')
        questions = test.get('questions', [])
        answer_key = test.get('answer_key', [])
        
        # Check for split questions that should be combined
        # Look for patterns like Q20 + Q21 that are both "multiple_choice_multi" 
        # with "Which TWO" in the question
        
        questions_to_combine = []
        i = 0
        while i < len(questions):
            q = questions[i]
            q_id = q.get('id')
            q_type = q.get('type', '')
            q_text = q.get('question', '')
            
            # Check if this question should be combined with the next one
            if (q_type == 'multiple_choice_multi' or 
                'two' in q_text.lower() or 
                'select two' in q_text.lower()):
                
                # Check if the next question is a continuation (same type and similar structure)
                if i + 1 < len(questions):
                    next_q = questions[i + 1]
                    next_id = next_q.get('id')
                    
                    # If both are numeric IDs that should be combined
                    if (isinstance(q_id, int) and isinstance(next_id, int) and 
                        next_id == q_id + 1 and
                        q_type == next_q.get('type', '')):
                        
                        # These should be combined
                        combined_id = f"{q_id}-{next_id}"
                        print(f"  🔧 Found questions to combine: Q{q_id} + Q{next_id} → Q{combined_id}")
                        questions_to_combine.append({
                            'first_idx': i,
                            'second_idx': i + 1,
                            'combined_id': combined_id,
                            'first_q': q,
                            'second_q': next_q
                        })
                        i += 2  # Skip the next question since we're combining
                        continue
            
            i += 1
        
        # Apply fixes
        if questions_to_combine:
            print(f"\n📝 Fixing test: {test_title}")
            
            # Create new questions list with combined questions
            new_questions = []
            skip_indices = set()
            
            for combo in questions_to_combine:
                skip_indices.add(combo['first_idx'])
                skip_indices.add(combo['second_idx'])
            
            for i, q in enumerate(questions):
                if i in skip_indices:
                    # Check if this is the first question of a combo
                    combo = next((c for c in questions_to_combine if c['first_idx'] == i), None)
                    if combo:
                        # Create combined question
                        combined_q = combo['first_q'].copy()
                        combined_q['id'] = combo['combined_id']
                        combined_q['answer_ids'] = [combo['first_q']['id'], combo['second_q']['id']]
                        combined_q['answer_count'] = 2
                        new_questions.append(combined_q)
                        print(f"    ✅ Combined Q{combo['first_q']['id']} + Q{combo['second_q']['id']} → Q{combo['combined_id']}")
                else:
                    new_questions.append(q)
            
            # Update answer key too
            new_answer_key = []
            combined_ids = {c['combined_id']: c for c in questions_to_combine}
            skip_answer_ids = set()
            
            for combo in questions_to_combine:
                skip_answer_ids.add(combo['first_q']['id'])
                skip_answer_ids.add(combo['second_q']['id'])
            
            for ak in answer_key:
                ak_id = ak.get('question_id')
                if ak_id in skip_answer_ids:
                    # Check if this is the first answer of a combo
                    combo = next((c for c in questions_to_combine if c['first_q']['id'] == ak_id), None)
                    if combo:
                        # Find the answer for the second question
                        second_answer = next((a for a in answer_key if a.get('question_id') == combo['second_q']['id']), None)
                        
                        # Create combined answer
                        combined_ak = ak.copy()
                        combined_ak['question_id'] = combo['combined_id']
                        
                        # Combine answers
                        first_ans = ak.get('answer', '')
                        second_ans = second_answer.get('answer', '') if second_answer else ''
                        combined_ak['answer'] = [first_ans, second_ans] if isinstance(first_ans, str) else first_ans + second_ans
                        
                        new_answer_key.append(combined_ak)
                else:
                    new_answer_key.append(ak)
            
            # Update the test in database
            result = await db.tests.update_one(
                {"id": test['id']},
                {"$set": {
                    "questions": new_questions,
                    "answer_key": new_answer_key
                }}
            )
            
            if result.modified_count > 0:
                fixed_count += 1
                print(f"    ✅ Updated test: {test_title}")
            else:
                print(f"    ⚠️ No changes made to: {test_title}")
    
    print(f"\n🎉 Fixed {fixed_count} tests")
    
    # Also verify the current state
    print("\n📊 Current question ID status:")
    for test in tests[:5]:
        title = test.get('title', 'Untitled')[:40]
        questions = test.get('questions', [])
        combined_ids = [q['id'] for q in questions if isinstance(q.get('id'), str) and '-' in str(q.get('id'))]
        if combined_ids:
            print(f"  ✅ {title}: Has combined IDs {combined_ids}")
        else:
            # Check for potential issues
            multi_q = [q['id'] for q in questions if q.get('type') == 'multiple_choice_multi']
            if multi_q:
                print(f"  ⚠️ {title}: Multi-select questions at IDs {multi_q} - may need combining")

if __name__ == "__main__":
    asyncio.run(fix_deployed_questions())
