#!/usr/bin/env python3
"""
Update Advanced Mastery modules:
1. Grammar - More practical, Mastery-style with clear benefits
2. Quiz - 10-12 comprehensive questions
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

async def update_module_grammar_quiz(db, module_num: int, module_data: dict):
    """Update grammar and quiz for a single module"""
    
    title = module_data['title']
    print(f"\n📝 Updating Module {module_num}: {title}...")
    
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"update-grammar-quiz-{module_num}",
        system_message="You are an expert IELTS instructor. Return ONLY valid JSON, no markdown formatting."
    ).with_model("openai", "gpt-4o")
    
    # Get existing content for context
    existing_vocab = [t.get('term', '') for t in module_data.get('vocabulary', {}).get('advanced_terms', [])]
    
    prompt = f'''Update IELTS content for topic "{title}".

Context vocabulary: {existing_vocab}

Generate ONLY this JSON structure:
{{
    "grammar": {{
        "title": "A practical grammar point relevant to {title}",
        "explanation": "2-3 sentences explaining the grammar rule simply and clearly",
        "benefit": "1 sentence explaining WHY this grammar helps get Band 7+ in IELTS",
        "examples": [
            "Example sentence 1 using this grammar",
            "Example sentence 2 using this grammar"
        ],
        "band_examples": {{
            "band_5": "A basic example showing band 5 level usage",
            "band_6": "An improved example showing band 6 level",
            "band_7": "A sophisticated example showing band 7+ level"
        }},
        "common_mistakes": [
            "Common mistake 1 students make",
            "Common mistake 2 students make"
        ]
    }},
    "quiz": {{
        "questions": [
            {{"question": "Vocabulary: What does [term from topic] mean?", "type": "multiple_choice", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "answer": "A", "explanation": "..."}},
            {{"question": "Vocabulary: Choose the correct collocation...", "type": "multiple_choice", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "answer": "B", "explanation": "..."}},
            {{"question": "Grammar: Select the correct sentence...", "type": "multiple_choice", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "answer": "C", "explanation": "..."}},
            {{"question": "Grammar: Fill in the blank: ___", "type": "fill_blank", "answer": "...", "explanation": "..."}},
            {{"question": "Reading comprehension about {title}...", "type": "multiple_choice", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "answer": "A", "explanation": "..."}},
            {{"question": "True/False/Not Given question...", "type": "true_false_ng", "options": ["True", "False", "Not Given"], "answer": "True", "explanation": "..."}},
            {{"question": "Speaking: What would be the best response to...?", "type": "multiple_choice", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "answer": "D", "explanation": "..."}},
            {{"question": "Writing: Which thesis statement is strongest for...?", "type": "multiple_choice", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "answer": "B", "explanation": "..."}},
            {{"question": "Error correction: Find the mistake...", "type": "multiple_choice", "options": ["A) No error", "B) ...", "C) ...", "D) ..."], "answer": "C", "explanation": "..."}},
            {{"question": "Paraphrase: Which sentence has the same meaning?", "type": "multiple_choice", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "answer": "A", "explanation": "..."}},
            {{"question": "Vocabulary in context: In the sentence... the word X means...", "type": "multiple_choice", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "answer": "B", "explanation": "..."}},
            {{"question": "Cohesion: Which linking word best fits...?", "type": "multiple_choice", "options": ["A) However", "B) Therefore", "C) Moreover", "D) Nevertheless"], "answer": "A", "explanation": "..."}}
        ]
    }}
}}

Make questions challenging but fair for Band 7-9 preparation. Include variety: vocabulary, grammar, reading, writing, speaking skills. ALL 12 questions must be included.'''

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
            {"$set": {
                "grammar": content.get("grammar", module_data.get("grammar", {})),
                "quiz": content.get("quiz", {})
            }}
        )
        
        quiz_count = len(content.get("quiz", {}).get("questions", []))
        print(f"   ✅ Updated! Grammar: practical style, Quiz: {quiz_count} questions")
        return True
        
    except json.JSONDecodeError as e:
        print(f"   ⚠️ JSON error: {e}")
        return False
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False


async def main():
    print("=" * 70)
    print("UPDATING GRAMMAR & QUIZ FOR ALL MODULES")
    print("=" * 70)
    
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client['ielts_database']
    
    modules = await db.advanced_mastery_modules.find({}).sort('module_number', 1).to_list(None)
    
    success_count = 0
    for module in modules:
        success = await update_module_grammar_quiz(db, module['module_number'], module)
        if success:
            success_count += 1
        await asyncio.sleep(1)  # Rate limit
    
    print(f"\n✅ Updated {success_count}/{len(modules)} modules")
    
    # Verify
    print("\n=== VERIFICATION ===")
    modules = await db.advanced_mastery_modules.find({}).sort('module_number', 1).to_list(None)
    for m in modules[:3]:
        quiz_count = len(m.get('quiz', {}).get('questions', []))
        grammar_keys = list(m.get('grammar', {}).keys())
        print(f"Module {m['module_number']}: quiz={quiz_count} questions, grammar keys={grammar_keys}")
    
    client.close()
    
    print("\n" + "=" * 70)
    print("COMPLETE!")
    print("=" * 70)


if __name__ == "__main__":
    asyncio.run(main())
