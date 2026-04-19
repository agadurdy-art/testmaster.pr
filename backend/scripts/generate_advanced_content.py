#!/usr/bin/env python3
"""
Advanced Mastery Course Content Generator
Generates complete Band 7.0+ IELTS content for all 20 modules
"""

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

SYSTEM_PROMPT = """You are an expert IELTS instructor creating Band 7.0+ level content. 
Your content must be challenging, sophisticated, and use advanced vocabulary.
Always respond with valid JSON only, no markdown."""

async def generate_reading(module_title: str, vocab_words: list) -> dict:
    chat = LlmChat(api_key=API_KEY, session_id=f"adv-reading-{module_title[:20]}", system_message=SYSTEM_PROMPT).with_model("openai", "gpt-5.1")
    
    prompt = f"""Generate an advanced IELTS Academic Reading passage about "{module_title}".
Use vocabulary: {', '.join(vocab_words[:5]) if vocab_words else 'sophisticated academic vocabulary'}

Return JSON:
{{"title": "Academic title", "passage": "400-450 word sophisticated academic passage with complex arguments, research citations, and nuanced perspectives. No line breaks.", "questions": [{{"id": 1, "type": "true_false_ng", "question": "Complex statement", "answer": "TRUE/FALSE/NOT GIVEN", "explanation": "Why"}}, {{"id": 2, "type": "multiple_choice", "question": "Inference question?", "options": ["A) opt1", "B) opt2", "C) opt3", "D) opt4"], "answer": "C", "explanation": "Why"}}, {{"id": 3, "type": "matching", "question": "Match the paragraph with the main idea", "answer": "B", "explanation": "Found in paragraph X"}}, {{"id": 4, "type": "fill_blank", "question": "Complete using ONE WORD from the passage", "answer": "word", "explanation": "Why"}}]}}

Include 12 questions total: 4 T/F/NG, 4 Multiple Choice, 2 Matching, 2 Fill-blank.
JSON only."""
    
    response = await chat.send_message(UserMessage(text=prompt))
    clean = response.strip().replace('```json', '').replace('```', '').strip()
    return json.loads(clean)

async def generate_writing(module_title: str) -> dict:
    chat = LlmChat(api_key=API_KEY, session_id=f"adv-writing-{module_title[:20]}", system_message=SYSTEM_PROMPT).with_model("openai", "gpt-5.1")
    
    prompt = f"""Generate Band 7.0+ IELTS Writing Task 2 content about "{module_title}".

Return JSON:
{{"task_type": "Task 2 Essay", "question": "Challenging IELTS essay question requiring nuanced argumentation about {module_title}. Use formats like 'To what extent...', 'Discuss both views...', or 'Some argue... while others contend...'", "tips": ["Advanced tip 1 for coherence", "Sophisticated vocabulary tip", "Complex sentence structure tip"], "model_essay": "Band 7.5 model essay (280-300 words) demonstrating sophisticated vocabulary, complex sentences, and well-developed arguments. No line breaks.", "useful_phrases": ["Academic phrase 1", "Hedging language", "Contrast expression"]}}
JSON only."""
    
    response = await chat.send_message(UserMessage(text=prompt))
    clean = response.strip().replace('```json', '').replace('```', '').strip()
    return json.loads(clean)

async def generate_speaking(module_title: str) -> dict:
    chat = LlmChat(api_key=API_KEY, session_id=f"adv-speaking-{module_title[:20]}", system_message=SYSTEM_PROMPT).with_model("openai", "gpt-5.1")
    
    prompt = f"""Generate Band 7.0+ IELTS Speaking content about "{module_title}".

Return JSON:
{{"part2": {{"cue_card": "Describe [abstract concept related to {module_title}]. You should say: what it is, why it is significant, how it affects society, and explain your personal perspective on this issue.", "follow_up_questions": ["Challenging follow-up 1?", "Follow-up 2?"], "model_answer": "Sophisticated 2-minute response with idiomatic expressions and complex ideas", "tips": ["Advanced fluency tip", "Coherence tip"]}}, "part3": {{"questions": [{{"question": "Complex analytical question about {module_title}?", "model_answer": "Nuanced response with examples"}}, {{"question": "Philosophical/ethical question?", "model_answer": "Response demonstrating critical thinking"}}, {{"question": "Future implications question?", "model_answer": "Speculative response with hedging"}}]}}}}
JSON only."""
    
    response = await chat.send_message(UserMessage(text=prompt))
    clean = response.strip().replace('```json', '').replace('```', '').strip()
    return json.loads(clean)

async def generate_quiz(module_title: str, vocab_words: list) -> dict:
    chat = LlmChat(api_key=API_KEY, session_id=f"adv-quiz-{module_title[:20]}", system_message=SYSTEM_PROMPT).with_model("openai", "gpt-5.1")
    
    vocab_context = f"Use these vocabulary words: {', '.join(vocab_words[:8])}" if vocab_words else ""
    
    prompt = f"""Generate 10 advanced IELTS quiz questions about "{module_title}".
{vocab_context}

Return JSON:
{{"questions": [{{"id": 1, "question": "Advanced vocabulary/collocations question?", "options": ["A) opt1", "B) opt2", "C) opt3", "D) opt4"], "correct": "B", "explanation": "Why B - include etymology or usage note"}}]}}

Mix question types: vocabulary, collocations, grammar, inference.
JSON only."""
    
    response = await chat.send_message(UserMessage(text=prompt))
    clean = response.strip().replace('```json', '').replace('```', '').strip()
    return json.loads(clean)

async def main():
    print("=" * 60)
    print("ADVANCED MASTERY CONTENT GENERATOR")
    print("=" * 60)
    
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    modules = await db.advanced_mastery_modules.find({}, {"_id": 0}).to_list(100)
    modules = sorted(modules, key=lambda x: x.get('module_number', 0))
    
    print(f"\nFound {len(modules)} modules to process\n")
    
    success_count = 0
    failed = []
    
    for i, module in enumerate(modules):
        module_id = module.get('id')
        module_title = module.get('title')
        
        # Extract vocab words
        vocab_words = []
        vocab = module.get('vocabulary', {})
        for cat in ['nouns', 'verbs', 'adjectives', 'adverbs']:
            if cat in vocab:
                vocab_words.extend([item.get('word', '') for item in vocab[cat][:3]])
        
        print(f"[{i+1}/{len(modules)}] {module_title}")
        
        if module.get('content_complete'):
            print(f"  ✓ Already complete")
            success_count += 1
            continue
        
        try:
            print("  → Reading...")
            reading = await generate_reading(module_title, vocab_words)
            await asyncio.sleep(0.5)
            
            print("  → Writing...")
            writing = await generate_writing(module_title)
            await asyncio.sleep(0.5)
            
            print("  → Speaking...")
            speaking = await generate_speaking(module_title)
            await asyncio.sleep(0.5)
            
            print("  → Quiz...")
            quiz = await generate_quiz(module_title, vocab_words)
            
            result = await db.advanced_mastery_modules.update_one(
                {"id": module_id},
                {"$set": {
                    "reading": reading,
                    "writing": writing,
                    "speaking": speaking,
                    "quiz": quiz,
                    "content_complete": True
                }}
            )
            
            if result.modified_count > 0:
                print(f"  ✓ Saved")
                success_count += 1
            else:
                print(f"  ✗ DB update failed")
                failed.append(module_title)
                
        except Exception as e:
            print(f"  ✗ Error: {str(e)[:50]}")
            failed.append(module_title)
        
        await asyncio.sleep(1)
    
    print("\n" + "=" * 60)
    print(f"Complete: {success_count}/{len(modules)}")
    if failed:
        print(f"Failed: {', '.join(failed)}")
    print("=" * 60)
    
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
