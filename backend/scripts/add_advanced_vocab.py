#!/usr/bin/env python3
"""
Add advanced vocabulary features to Advanced Mastery modules:
- Idioms (5-6 per module)
- Collocations (8-10 per module)
- Phrasal Verbs (5-6 per module)
- Pronunciation Guide (difficult words with IPA)
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

async def add_advanced_vocab(db, module_num: int, module_data: dict):
    """Add idioms, collocations, phrasal verbs, pronunciation to a module"""
    
    title = module_data['title']
    print(f"\n📚 Enhancing Module {module_num}: {title}...")
    
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"vocab-enhance-{module_num}",
        system_message="You are an expert IELTS vocabulary instructor. Return ONLY valid JSON."
    ).with_model("openai", "gpt-4o")
    
    prompt = f'''Create advanced IELTS vocabulary content for the topic "{title}".

Return ONLY this JSON (no markdown):
{{
    "idioms": [
        {{"idiom": "the tip of the iceberg", "meaning": "A small visible part of a much larger problem", "example": "The reported cases are just the tip of the iceberg.", "usage_context": "Academic writing, Speaking Part 3"}},
        {{"idiom": "idiom 2", "meaning": "...", "example": "...", "usage_context": "..."}},
        {{"idiom": "idiom 3", "meaning": "...", "example": "...", "usage_context": "..."}},
        {{"idiom": "idiom 4", "meaning": "...", "example": "...", "usage_context": "..."}},
        {{"idiom": "idiom 5", "meaning": "...", "example": "...", "usage_context": "..."}},
        {{"idiom": "idiom 6", "meaning": "...", "example": "...", "usage_context": "..."}}
    ],
    "collocations": [
        {{"collocation": "raise awareness", "type": "verb + noun", "example": "Campaigns aim to raise awareness about climate change.", "alternatives": ["increase awareness", "heighten awareness"]}},
        {{"collocation": "collocation 2", "type": "...", "example": "...", "alternatives": ["...", "..."]}},
        {{"collocation": "collocation 3", "type": "...", "example": "...", "alternatives": ["...", "..."]}},
        {{"collocation": "collocation 4", "type": "...", "example": "...", "alternatives": ["...", "..."]}},
        {{"collocation": "collocation 5", "type": "...", "example": "...", "alternatives": ["...", "..."]}},
        {{"collocation": "collocation 6", "type": "...", "example": "...", "alternatives": ["...", "..."]}},
        {{"collocation": "collocation 7", "type": "...", "example": "...", "alternatives": ["...", "..."]}},
        {{"collocation": "collocation 8", "type": "...", "example": "...", "alternatives": ["...", "..."]}}
    ],
    "phrasal_verbs": [
        {{"phrasal_verb": "bring about", "meaning": "To cause something to happen", "example": "Technology has brought about significant changes.", "formal_alternative": "cause, initiate, precipitate"}},
        {{"phrasal_verb": "phrasal verb 2", "meaning": "...", "example": "...", "formal_alternative": "..."}},
        {{"phrasal_verb": "phrasal verb 3", "meaning": "...", "example": "...", "formal_alternative": "..."}},
        {{"phrasal_verb": "phrasal verb 4", "meaning": "...", "example": "...", "formal_alternative": "..."}},
        {{"phrasal_verb": "phrasal verb 5", "meaning": "...", "example": "...", "formal_alternative": "..."}},
        {{"phrasal_verb": "phrasal verb 6", "meaning": "...", "example": "...", "formal_alternative": "..."}}
    ],
    "pronunciation_guide": [
        {{"word": "phenomenon", "ipa": "/fɪˈnɒmɪnən/", "stress": "fe-NOM-e-non", "common_mistake": "Often mispronounced as 'fee-no-MEE-non'", "audio_tip": "Stress on second syllable"}},
        {{"word": "word 2", "ipa": "...", "stress": "...", "common_mistake": "...", "audio_tip": "..."}},
        {{"word": "word 3", "ipa": "...", "stress": "...", "common_mistake": "...", "audio_tip": "..."}},
        {{"word": "word 4", "ipa": "...", "stress": "...", "common_mistake": "...", "audio_tip": "..."}},
        {{"word": "word 5", "ipa": "...", "stress": "...", "common_mistake": "...", "audio_tip": "..."}},
        {{"word": "word 6", "ipa": "...", "stress": "...", "common_mistake": "...", "audio_tip": "..."}},
        {{"word": "word 7", "ipa": "...", "stress": "...", "common_mistake": "...", "audio_tip": "..."}},
        {{"word": "word 8", "ipa": "...", "stress": "...", "common_mistake": "...", "audio_tip": "..."}}
    ],
    "word_formation": [
        {{"root": "sustain", "noun": "sustainability, sustenance", "verb": "sustain", "adjective": "sustainable, sustained", "adverb": "sustainably"}},
        {{"root": "root 2", "noun": "...", "verb": "...", "adjective": "...", "adverb": "..."}},
        {{"root": "root 3", "noun": "...", "verb": "...", "adjective": "...", "adverb": "..."}},
        {{"root": "root 4", "noun": "...", "verb": "...", "adjective": "...", "adverb": "..."}},
        {{"root": "root 5", "noun": "...", "verb": "...", "adjective": "...", "adverb": "..."}}
    ]
}}

Make ALL content relevant to "{title}" and appropriate for Band 7-9 IELTS preparation.'''

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
        
        # Update vocabulary section in database
        current_vocab = module_data.get('vocabulary', {})
        current_vocab['idioms'] = content.get('idioms', [])
        current_vocab['collocations'] = content.get('collocations', [])
        current_vocab['phrasal_verbs'] = content.get('phrasal_verbs', [])
        current_vocab['pronunciation_guide'] = content.get('pronunciation_guide', [])
        current_vocab['word_formation'] = content.get('word_formation', [])
        
        await db.advanced_mastery_modules.update_one(
            {"module_number": module_num},
            {"$set": {"vocabulary": current_vocab}}
        )
        
        idiom_count = len(content.get('idioms', []))
        colloc_count = len(content.get('collocations', []))
        pv_count = len(content.get('phrasal_verbs', []))
        pron_count = len(content.get('pronunciation_guide', []))
        
        print(f"   ✅ Added: {idiom_count} idioms, {colloc_count} collocations, {pv_count} phrasal verbs, {pron_count} pronunciations")
        return True
        
    except json.JSONDecodeError as e:
        print(f"   ⚠️ JSON error: {e}")
        return False
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False


async def main():
    print("=" * 70)
    print("ADDING ADVANCED VOCABULARY FEATURES")
    print("Idioms | Collocations | Phrasal Verbs | Pronunciation")
    print("=" * 70)
    
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client['ielts_database']
    
    modules = await db.advanced_mastery_modules.find({}).sort('module_number', 1).to_list(None)
    
    success_count = 0
    for module in modules:
        success = await add_advanced_vocab(db, module['module_number'], module)
        if success:
            success_count += 1
        await asyncio.sleep(1)  # Rate limit
    
    print(f"\n✅ Enhanced {success_count}/{len(modules)} modules")
    
    # Verification
    print("\n=== VERIFICATION ===")
    sample = await db.advanced_mastery_modules.find_one({"module_number": 1})
    vocab = sample.get('vocabulary', {})
    print(f"Module 1 vocabulary now includes:")
    print(f"  - Advanced terms: {len(vocab.get('advanced_terms', []))}")
    print(f"  - Idioms: {len(vocab.get('idioms', []))}")
    print(f"  - Collocations: {len(vocab.get('collocations', []))}")
    print(f"  - Phrasal verbs: {len(vocab.get('phrasal_verbs', []))}")
    print(f"  - Pronunciation guide: {len(vocab.get('pronunciation_guide', []))}")
    print(f"  - Word formation: {len(vocab.get('word_formation', []))}")
    
    client.close()
    
    print("\n" + "=" * 70)
    print("COMPLETE!")
    print("=" * 70)


if __name__ == "__main__":
    asyncio.run(main())
