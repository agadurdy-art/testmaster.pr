#!/usr/bin/env python3
"""
Enrich Advanced Mastery Modules with AI-Generated Content
Uses Emergent LLM Key with GPT-4o to generate comprehensive IELTS content
"""

import asyncio
import os
import json
import sys
from dotenv import load_dotenv

load_dotenv()

sys.path.insert(0, '/app/backend')

from emergentintegrations.llm.chat import LlmChat, UserMessage
from seed_advanced_mastery import ADVANCED_MODULES

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

async def enrich_module(module_num: int, module_data: dict) -> dict:
    """Enrich a single module with comprehensive content"""
    
    title = module_data['title']
    subtitle = module_data.get('subtitle', '')
    
    print(f"\n📚 Enriching Module {module_num}: {title}...")
    
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"advanced-mastery-module-{module_num}",
        system_message="""You are an expert IELTS instructor and curriculum designer. 
Your task is to create comprehensive, Band 7-9 level educational content.
Always respond with valid JSON only, no markdown formatting or extra text."""
    ).with_model("openai", "gpt-4o")
    
    prompt = f"""Create comprehensive IELTS Band 7-9 content for the topic: "{title}" ({subtitle})

Generate a JSON object with this EXACT structure:
{{
    "vocabulary": {{
        "advanced_terms": [
            {{"term": "...", "meaning": "...", "usage": "...", "example": "...", "collocations": ["...", "..."]}},
            // Generate 8 terms total
        ]
    }},
    "grammar": {{
        "title": "...",
        "explanation": "A detailed 400-500 word explanation of an advanced grammar point relevant to this topic...",
        "band_65_example": "A simple example sentence...",
        "band_75_example": "A sophisticated academic example...",
        "band_85_example": "An expert-level example with complex structures...",
        "practice_sentences": ["...", "...", "..."]
    }},
    "reading": {{
        "title": "...",
        "word_count": 450,
        "text": "A 400-500 word academic passage about {title}...",
        "questions": [
            {{"type": "multiple_choice", "question": "...", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "answer": "...", "explanation": "..."}},
            {{"type": "true_false_ng", "question": "...", "answer": "...", "explanation": "..."}},
            {{"type": "summary_completion", "question": "...", "answer": "...", "explanation": "..."}}
        ]
    }},
    "speaking": {{
        "part2": {{
            "cue_card": "Describe a [relevant topic to {title}]. You should say:\\n- what it is\\n- when/where you experienced it\\n- why it was significant\\nand explain how it affected you.",
            "model_answer": "A 200-word model answer...",
            "vocabulary_tips": ["...", "...", "..."],
            "structure_tips": ["...", "...", "..."]
        }},
        "part3": {{
            "questions": [
                {{"question": "...", "model_answer": "A 100-word sophisticated response..."}},
                {{"question": "...", "model_answer": "..."}},
                {{"question": "...", "model_answer": "..."}}
            ]
        }}
    }},
    "writing": {{
        "task_type": "Task 2",
        "prompt": "A full IELTS Writing Task 2 question about {title}...",
        "planning_tips": ["...", "...", "...", "..."],
        "model_essay": "A 280-320 word Band 8+ essay...",
        "examiner_analysis": {{
            "task_response": "Analysis of how the essay addresses the task...",
            "coherence_cohesion": "Analysis of structure and linking...",
            "lexical_resource": "Analysis of vocabulary used...",
            "grammatical_range": "Analysis of grammar structures..."
        }},
        "useful_phrases": ["...", "...", "...", "...", "..."]
    }},
    "examiner_tips": [
        "Tip 1 for Band 7+...",
        "Tip 2...",
        "Tip 3...",
        "Tip 4...",
        "Tip 5..."
    ]
}}

Make the content academically rigorous, suitable for Band 7-9 preparation.
Include sophisticated vocabulary, complex grammar structures, and nuanced arguments.
ONLY output the JSON, nothing else."""

    try:
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Clean response - remove markdown if present
        response = response.strip()
        if response.startswith('```'):
            response = response.split('\n', 1)[1]
        if response.endswith('```'):
            response = response.rsplit('```', 1)[0]
        response = response.strip()
        
        enriched_content = json.loads(response)
        
        # Merge with existing module data
        module_data['vocabulary'] = enriched_content.get('vocabulary', module_data.get('vocabulary', {}))
        module_data['grammar'] = enriched_content.get('grammar', module_data.get('grammar', {}))
        module_data['reading'] = enriched_content.get('reading', module_data.get('reading', {}))
        module_data['speaking'] = enriched_content.get('speaking', module_data.get('speaking', {}))
        module_data['writing'] = enriched_content.get('writing', module_data.get('writing', {}))
        module_data['examiner_tips'] = enriched_content.get('examiner_tips', module_data.get('examiner_tips', []))
        
        print(f"   ✅ Module {module_num} enriched successfully!")
        return module_data
        
    except json.JSONDecodeError as e:
        print(f"   ⚠️ JSON parse error for Module {module_num}: {e}")
        print(f"   Response preview: {response[:200]}...")
        return module_data
    except Exception as e:
        print(f"   ❌ Error enriching Module {module_num}: {e}")
        return module_data


async def main():
    print("=" * 70)
    print("ADVANCED MASTERY CONTENT ENRICHMENT")
    print("Using GPT-4o via Emergent LLM Key")
    print("=" * 70)
    
    enriched_modules = []
    
    for module in ADVANCED_MODULES:
        module_num = module['module_number']
        enriched = await enrich_module(module_num, module.copy())
        enriched_modules.append(enriched)
        
        # Small delay to avoid rate limits
        await asyncio.sleep(1)
    
    # Save enriched modules to new file
    print("\n\n📝 Saving enriched modules...")
    
    output_file = '/app/backend/seed_advanced_mastery_enriched.py'
    
    with open(output_file, 'w') as f:
        f.write('#!/usr/bin/env python3\n')
        f.write('"""\nAdvanced IELTS Mastery: Band 6.0-9.0 Full Course\n')
        f.write('20 Comprehensive Modules - AI-Enriched Content\n"""\n\n')
        f.write('import asyncio\nimport os\nfrom motor.motor_asyncio import AsyncIOMotorClient\n\n')
        f.write("MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')\n")
        f.write("DB_NAME = os.environ.get('DB_NAME', 'ielts_database')\n\n")
        f.write('ADVANCED_MODULES = ')
        f.write(repr(enriched_modules))
        f.write('\n\n')
        
        # Add seed function
        f.write('''
async def seed_advanced_mastery():
    """Seed all advanced mastery modules to database"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    await db.advanced_mastery_modules.delete_many({})
    
    for module in ADVANCED_MODULES:
        await db.advanced_mastery_modules.update_one(
            {"id": module["id"]},
            {"$set": module},
            upsert=True
        )
        print(f"✅ Seeded Module {module['module_number']}: {module['title']}")
    
    count = await db.advanced_mastery_modules.count_documents({})
    print(f"\\n✅ Total modules seeded: {count}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_advanced_mastery())
''')
    
    print(f"✅ Saved to {output_file}")
    
    # Also update the database
    print("\n📊 Updating database...")
    from motor.motor_asyncio import AsyncIOMotorClient
    
    client = AsyncIOMotorClient(os.environ.get('MONGO_URL', 'mongodb://localhost:27017'))
    db = client[os.environ.get('DB_NAME', 'ielts_database')]
    
    await db.advanced_mastery_modules.delete_many({})
    
    for module in enriched_modules:
        await db.advanced_mastery_modules.update_one(
            {"id": module["id"]},
            {"$set": module},
            upsert=True
        )
    
    count = await db.advanced_mastery_modules.count_documents({})
    print(f"✅ Database updated: {count} modules")
    
    client.close()
    
    print("\n" + "=" * 70)
    print("ENRICHMENT COMPLETE!")
    print("=" * 70)


if __name__ == "__main__":
    asyncio.run(main())
