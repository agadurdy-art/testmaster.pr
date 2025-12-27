#!/usr/bin/env python3
"""
Add Listening sections to Advanced Mastery Course (20 modules)
Each module gets:
- Academic lecture transcript (300-400 words)
- 6 comprehension questions
- Speaker info for audio generation
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

async def add_listening_to_module(db, module_num: int, module_data: dict):
    """Add listening section to a single Advanced Mastery module"""
    
    title = module_data['title']
    print(f"\n🎧 Adding listening to Module {module_num}: {title}...")
    
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"advanced-listening-{module_num}",
        system_message="You are an expert IELTS instructor creating Band 7-9 listening content. Return ONLY valid JSON."
    ).with_model("openai", "gpt-4o")
    
    prompt = f'''Create an IELTS Band 7-9 academic listening section for "{title}".

Return ONLY this JSON structure:
{{
    "listening": {{
        "title": "Academic Lecture: [Specific topic related to {title}]",
        "level": "C1",
        "duration": "3 minutes",
        "format": "academic_lecture",
        "speakers": [
            {{"role": "Lecturer", "voice": "british_male", "name": "Professor"}}
        ],
        "introduction": "You will hear a lecture about [topic]. Listen carefully and answer questions 1-6.",
        "transcript": "Good morning everyone. Today I want to discuss [topic]... [Write a 350-400 word academic lecture transcript about {title}. Use sophisticated vocabulary, complex sentence structures, and include statistics, examples, and expert opinions. The content should be challenging but clear, suitable for IELTS Band 7-9 listening practice.]",
        "questions": [
            {{"number": 1, "type": "multiple_choice", "question": "According to the lecturer, what is the main...", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "answer": "B", "explanation": "The lecturer states that..."}},
            {{"number": 2, "type": "completion", "question": "The research found that _____ percent of participants...", "answer": "...", "word_limit": 2, "explanation": "..."}},
            {{"number": 3, "type": "multiple_choice", "question": "What does the speaker suggest about...?", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "answer": "C", "explanation": "..."}},
            {{"number": 4, "type": "true_false", "question": "The lecturer believes that...", "answer": "False", "explanation": "..."}},
            {{"number": 5, "type": "completion", "question": "According to experts, the key factor is _____.", "answer": "...", "word_limit": 3, "explanation": "..."}},
            {{"number": 6, "type": "multiple_choice", "question": "What is the lecturer's conclusion about...?", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "answer": "A", "explanation": "..."}}
        ],
        "vocabulary_focus": [
            {{"word": "...", "definition": "...", "context": "Used in the lecture when discussing..."}},
            {{"word": "...", "definition": "...", "context": "..."}},
            {{"word": "...", "definition": "...", "context": "..."}}
        ],
        "listening_tips": [
            "Listen for signpost language like 'firstly', 'however', 'in conclusion'",
            "Pay attention to stressed words for key information",
            "Note down numbers and statistics as you hear them"
        ]
    }}
}}

Make the transcript academically rigorous and relevant to {title}. Include real-world examples and data.'''

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
        await db.advanced_mastery_modules.update_one(
            {"module_number": module_num},
            {"$set": {"listening": content.get("listening", {})}}
        )
        
        transcript_len = len(content.get("listening", {}).get("transcript", ""))
        questions_count = len(content.get("listening", {}).get("questions", []))
        print(f"   ✅ Added listening: {transcript_len} chars, {questions_count} questions")
        return True
        
    except json.JSONDecodeError as e:
        print(f"   ⚠️ JSON error: {e}")
        return False
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False


async def main():
    print("=" * 70)
    print("ADDING LISTENING TO ADVANCED MASTERY (20 modules)")
    print("=" * 70)
    
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client['ielts_database']
    
    modules = await db.advanced_mastery_modules.find({}).sort('module_number', 1).to_list(None)
    
    print(f"Found {len(modules)} modules")
    
    success_count = 0
    for module in modules:
        success = await add_listening_to_module(db, module['module_number'], module)
        if success:
            success_count += 1
        await asyncio.sleep(1)  # Rate limit
    
    print(f"\n✅ Added listening to {success_count}/{len(modules)} modules")
    
    # Verify
    print("\n=== VERIFICATION ===")
    modules = await db.advanced_mastery_modules.find({}).sort('module_number', 1).to_list(None)
    for m in modules[:3]:
        listening = m.get('listening', {})
        has_listening = bool(listening.get('transcript'))
        q_count = len(listening.get('questions', []))
        print(f"Module {m['module_number']}: listening={'✅' if has_listening else '❌'}, questions={q_count}")
    
    client.close()
    
    print("\n" + "=" * 70)
    print("COMPLETE!")
    print("=" * 70)


if __name__ == "__main__":
    asyncio.run(main())
