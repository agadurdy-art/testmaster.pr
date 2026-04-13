#!/usr/bin/env python3
"""Fix failed Advanced Mastery modules"""

import asyncio
import os
import json
from dotenv import load_dotenv

load_dotenv()

from motor.motor_asyncio import AsyncIOMotorClient
from emergentintegrations.llm.chat import LlmChat, UserMessage

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'ielts_database')
API_KEY = os.environ.get('EMERGENT_LLM_KEY')

FAILED_MODULES = ["Culture and Tradition", "Media and Advertising", "Future Perspectives"]

SYSTEM_PROMPT = "You are an IELTS expert. Return ONLY valid JSON with no special characters or line breaks in strings."

async def generate_part(module_title: str, part: str) -> dict:
    chat = LlmChat(api_key=API_KEY, session_id=f"fix-{part}-{module_title[:10]}", system_message=SYSTEM_PROMPT).with_model("openai", "gpt-5.1")
    
    prompts = {
        "reading": f'Generate IELTS reading about "{module_title}". JSON: {{"title": "title", "passage": "400 word passage no line breaks", "questions": [{{"id": 1, "type": "true_false_ng", "question": "stmt", "answer": "TRUE", "explanation": "why"}}, {{"id": 2, "type": "multiple_choice", "question": "q?", "options": ["A) a", "B) b", "C) c", "D) d"], "answer": "B", "explanation": "why"}}]}} Include 12 questions.',
        "writing": f'Generate IELTS writing about "{module_title}". JSON: {{"task_type": "Task 2 Essay", "question": "IELTS question", "tips": ["t1", "t2", "t3"], "model_essay": "280 word essay no line breaks", "useful_phrases": ["p1", "p2", "p3"]}}',
        "speaking": f'Generate IELTS speaking about "{module_title}". JSON: {{"part2": {{"cue_card": "Describe...", "follow_up_questions": ["q1?", "q2?"], "model_answer": "2min response", "tips": ["t1", "t2"]}}, "part3": {{"questions": [{{"question": "q?", "model_answer": "ans"}}]}}}}',
        "quiz": f'Generate 10 IELTS quiz questions about "{module_title}". JSON: {{"questions": [{{"id": 1, "question": "q?", "options": ["A) a", "B) b", "C) c", "D) d"], "correct": "B", "explanation": "why"}}]}}'
    }
    
    response = await chat.send_message(UserMessage(text=prompts[part] + " JSON only, no markdown."))
    clean = response.strip()
    if clean.startswith('```'): clean = clean.split('\n', 1)[1]
    if clean.endswith('```'): clean = clean.rsplit('```', 1)[0]
    if clean.startswith('json'): clean = clean[4:].strip()
    return json.loads(clean)

async def main():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    for title in FAILED_MODULES:
        print(f"\nFixing: {title}")
        
        try:
            print("  Reading...")
            reading = await generate_part(title, "reading")
            await asyncio.sleep(1)
            
            print("  Writing...")
            writing = await generate_part(title, "writing")
            await asyncio.sleep(1)
            
            print("  Speaking...")
            speaking = await generate_part(title, "speaking")
            await asyncio.sleep(1)
            
            print("  Quiz...")
            quiz = await generate_part(title, "quiz")
            
            result = await db.advanced_mastery_modules.update_one(
                {"title": title},
                {"$set": {"reading": reading, "writing": writing, "speaking": speaking, "quiz": quiz, "content_complete": True}}
            )
            
            print(f"  ✓ Fixed!" if result.modified_count > 0 else "  ✗ DB update failed")
        except Exception as e:
            print(f"  ✗ Error: {e}")
    
    print("\nDone!")
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
