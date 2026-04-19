#!/usr/bin/env python3
"""Fix failed modules with simpler JSON structure"""

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

FAILED_MODULES = ["Media and Advertising", "Crime and Law"]

SYSTEM_PROMPT = """You are an IELTS content expert. Generate educational content in valid JSON format only.
IMPORTANT: Ensure all JSON is properly formatted with correct escaping of special characters.
Do not use line breaks within string values - use \\n instead."""

async def generate_reading(module_title: str) -> dict:
    chat = LlmChat(api_key=API_KEY, session_id=f"reading-{module_title}", system_message=SYSTEM_PROMPT).with_model("openai", "gpt-5.1")
    
    prompt = f"""Generate an IELTS Reading section about "{module_title}".
Return JSON:
{{"title": "Passage title", "passage": "350-400 word academic passage about {module_title}. No line breaks in text.", "questions": [{{"id": 1, "type": "true_false_ng", "question": "Statement", "answer": "TRUE", "explanation": "Why"}}, {{"id": 2, "type": "multiple_choice", "question": "Question?", "options": ["A) opt1", "B) opt2", "C) opt3", "D) opt4"], "answer": "B", "explanation": "Why"}}]}}
Include 12 questions total mixing true_false_ng, multiple_choice, and fill_blank types. JSON only."""
    
    response = await chat.send_message(UserMessage(text=prompt))
    clean = response.strip().replace('```json', '').replace('```', '').strip()
    return json.loads(clean)

async def generate_writing(module_title: str) -> dict:
    chat = LlmChat(api_key=API_KEY, session_id=f"writing-{module_title}", system_message=SYSTEM_PROMPT).with_model("openai", "gpt-5.1")
    
    prompt = f"""Generate IELTS Writing Task 2 content about "{module_title}".
Return JSON:
{{"task_type": "Task 2 Essay", "question": "IELTS essay question about {module_title}", "tips": ["tip1", "tip2", "tip3"], "model_essay": "250-280 word Band 6.5 model essay. No line breaks.", "useful_phrases": ["phrase1", "phrase2", "phrase3"]}}
JSON only."""
    
    response = await chat.send_message(UserMessage(text=prompt))
    clean = response.strip().replace('```json', '').replace('```', '').strip()
    return json.loads(clean)

async def generate_speaking(module_title: str) -> dict:
    chat = LlmChat(api_key=API_KEY, session_id=f"speaking-{module_title}", system_message=SYSTEM_PROMPT).with_model("openai", "gpt-5.1")
    
    prompt = f"""Generate IELTS Speaking content about "{module_title}".
Return JSON:
{{"part2": {{"cue_card": "Describe something about {module_title}. You should say: what it is, when it happened, why important.", "follow_up_questions": ["q1?", "q2?"], "model_answer": "2-minute response", "tips": ["tip1", "tip2"]}}, "part3": {{"questions": [{{"question": "Discussion q1?", "model_answer": "Response"}}, {{"question": "Discussion q2?", "model_answer": "Response"}}, {{"question": "Discussion q3?", "model_answer": "Response"}}]}}}}
JSON only."""
    
    response = await chat.send_message(UserMessage(text=prompt))
    clean = response.strip().replace('```json', '').replace('```', '').strip()
    return json.loads(clean)

async def generate_quiz(module_title: str) -> dict:
    chat = LlmChat(api_key=API_KEY, session_id=f"quiz-{module_title}", system_message=SYSTEM_PROMPT).with_model("openai", "gpt-5.1")
    
    prompt = f"""Generate 10 IELTS quiz questions about "{module_title}".
Return JSON:
{{"questions": [{{"id": 1, "question": "Question about vocabulary or grammar?", "options": ["A) opt1", "B) opt2", "C) opt3", "D) opt4"], "correct": "B", "explanation": "Why B"}}]}}
Include 10 questions. JSON only."""
    
    response = await chat.send_message(UserMessage(text=prompt))
    clean = response.strip().replace('```json', '').replace('```', '').strip()
    return json.loads(clean)

async def main():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    for module_title in FAILED_MODULES:
        print(f"\nProcessing: {module_title}")
        
        module = await db.mastery_course_modules.find_one({"title": module_title}, {"_id": 0})
        if not module:
            print(f"  Module not found!")
            continue
        
        try:
            print("  Generating reading...")
            reading = await generate_reading(module_title)
            await asyncio.sleep(1)
            
            print("  Generating writing...")
            writing = await generate_writing(module_title)
            await asyncio.sleep(1)
            
            print("  Generating speaking...")
            speaking = await generate_speaking(module_title)
            await asyncio.sleep(1)
            
            print("  Generating quiz...")
            quiz = await generate_quiz(module_title)
            
            # Update database
            result = await db.mastery_course_modules.update_one(
                {"title": module_title},
                {"$set": {
                    "reading": reading,
                    "writing": writing,
                    "speaking": speaking,
                    "quiz": quiz,
                    "content_complete": True
                }}
            )
            
            if result.modified_count > 0:
                print(f"  ✓ {module_title} completed!")
            else:
                print(f"  ✗ Failed to update database")
                
        except Exception as e:
            print(f"  ✗ Error: {e}")
    
    print("\nDone!")
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
