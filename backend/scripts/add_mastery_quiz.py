#!/usr/bin/env python3
"""
Add Quiz questions to Mastery Course modules (17 modules)
Each module will have 12 comprehensive quiz questions
"""

import asyncio
import os
import json
from motor.motor_asyncio import AsyncIOMotorClient

# Load env
with open('/app/backend/.env', 'r') as f:
    for line in f:
        if '=' in line:
            key, value = line.strip().split('=', 1)
            os.environ[key] = value.strip('"')

from emergentintegrations.llm.chat import LlmChat, UserMessage

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

async def add_quiz_to_module(db, module_num: int, module_data: dict):
    """Add quiz to a single Mastery module"""
    
    title = module_data['title']
    print(f"\n📝 Adding quiz to Module {module_num}: {title}...")
    
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"mastery-quiz-{module_num}",
        system_message="You are an expert IELTS instructor. Return ONLY valid JSON, no markdown."
    ).with_model("openai", "gpt-4o")
    
    # Get vocabulary terms for context
    vocab_terms = [t.get('term', '') for t in module_data.get('vocabulary', {}).get('terms', [])]
    
    prompt = f'''Create 12 IELTS quiz questions for the topic "{title}" (Band 4.5-6.5 level).

Context vocabulary: {vocab_terms[:5]}

Return ONLY this JSON:
{{
    "questions": [
        {{"question": "Vocabulary: What does [term] mean?", "type": "multiple_choice", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "answer": "A", "explanation": "..."}},
        {{"question": "Vocabulary: Complete the sentence: The ___", "type": "multiple_choice", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "answer": "B", "explanation": "..."}},
        {{"question": "Grammar: Choose the correct form...", "type": "multiple_choice", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "answer": "C", "explanation": "..."}},
        {{"question": "Grammar: Fill in the blank with the correct word.", "type": "fill_blank", "answer": "...", "explanation": "..."}},
        {{"question": "Reading: According to the topic, what is...?", "type": "multiple_choice", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "answer": "A", "explanation": "..."}},
        {{"question": "Reading: True/False/Not Given - Statement about {title}", "type": "true_false_ng", "options": ["True", "False", "Not Given"], "answer": "True", "explanation": "..."}},
        {{"question": "Speaking: What would be the best way to start answering...?", "type": "multiple_choice", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "answer": "D", "explanation": "..."}},
        {{"question": "Writing: Which sentence is more appropriate for IELTS writing?", "type": "multiple_choice", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "answer": "B", "explanation": "..."}},
        {{"question": "Error correction: Find the mistake in this sentence.", "type": "multiple_choice", "options": ["A) No error", "B) ...", "C) ...", "D) ..."], "answer": "C", "explanation": "..."}},
        {{"question": "Vocabulary: Which word is a synonym of...?", "type": "multiple_choice", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "answer": "A", "explanation": "..."}},
        {{"question": "Collocation: Which phrase is correct?", "type": "multiple_choice", "options": ["A) make a decision", "B) do a decision", "C) take a decision", "D) have a decision"], "answer": "A", "explanation": "..."}},
        {{"question": "Comprehension: What is the main idea of...?", "type": "multiple_choice", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "answer": "B", "explanation": "..."}}
    ]
}}

Make questions appropriate for Band 4.5-6.5 IELTS preparation. Include variety of question types.'''

    try:
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Clean response
        response = response.strip()
        if '```json' in response:
            response = response.split('```json')[1].split('```')[0]
        elif '```' in response:
            response = response.split('```')[1].split('```')[0]
        response = response.strip()
        
        content = json.loads(response)
        
        # Update in database
        await db.mastery_course_modules.update_one(
            {"module_number": module_num},
            {"$set": {"quiz": content}}
        )
        
        quiz_count = len(content.get("questions", []))
        print(f"   ✅ Added {quiz_count} quiz questions")
        return True
        
    except json.JSONDecodeError as e:
        print(f"   ⚠️ JSON error: {e}")
        return False
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False


async def main():
    print("=" * 70)
    print("ADDING QUIZ TO MASTERY COURSE (17 modules)")
    print("=" * 70)
    
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client['ielts_database']
    
    modules = await db.mastery_course_modules.find({}).sort('module_number', 1).to_list(None)
    
    print(f"Found {len(modules)} modules")
    
    success_count = 0
    for module in modules:
        success = await add_quiz_to_module(db, module['module_number'], module)
        if success:
            success_count += 1
        await asyncio.sleep(1)  # Rate limit
    
    print(f"\n✅ Added quiz to {success_count}/{len(modules)} modules")
    
    # Verify
    print("\n=== VERIFICATION ===")
    modules = await db.mastery_course_modules.find({}).sort('module_number', 1).to_list(None)
    for m in modules[:5]:
        quiz_count = len(m.get('quiz', {}).get('questions', []))
        print(f"Module {m['module_number']}: {quiz_count} quiz questions")
    
    client.close()
    
    print("\n" + "=" * 70)
    print("COMPLETE!")
    print("=" * 70)


if __name__ == "__main__":
    asyncio.run(main())
