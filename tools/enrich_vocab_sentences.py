#!/usr/bin/env python3
"""
Generate example sentences and definitions for all vocabulary words
that are missing them, using Claude via Emergent LLM Key.
"""
import os
import json
import asyncio
from pymongo import MongoClient
from emergentintegrations.llm.chat import LlmChat, UserMessage

MONGO_URL = open('/app/backend/.env').read().split('MONGO_URL="')[1].split('"')[0]
DB_NAME = open('/app/backend/.env').read().split('DB_NAME="')[1].split('"')[0]
API_KEY = open('/app/backend/.env').read().split('EMERGENT_LLM_KEY=')[1].split('\n')[0]

client = MongoClient(MONGO_URL)
db = client[DB_NAME]


async def generate_for_batch(words):
    """Generate example sentences and definitions for a batch of words."""
    word_list = ", ".join(words)
    
    prompt = f"""Generate simple example sentences and definitions for these English vocabulary words. 
These are for 6-year-old children learning English (Pre-A1/A1 level).

Rules:
- Sentences must be very simple (3-8 words)
- Use only basic vocabulary a 6-year-old would know
- Definitions must be 1 simple sentence
- Return ONLY valid JSON, no markdown

Words: {word_list}

Return JSON format:
{{"word1": {{"example": "I have a red ball.", "definition": "A round toy you can throw."}}, "word2": {{"example": "...", "definition": "..."}}}}"""

    chat = LlmChat(
        api_key=API_KEY,
        session_id=f"vocab-enrich-{words[0]}",
        system_message="You are a children's English vocabulary expert. Return ONLY valid JSON."
    ).with_model("openai", "gpt-4o")

    response = await chat.send_message(UserMessage(text=prompt))
    
    text = response if isinstance(response, str) else str(response)
    if "```json" in text:
        text = text.split("```json")[1].split("```")[0]
    elif "```" in text:
        text = text.split("```")[1].split("```")[0]
    
    return json.loads(text.strip())


async def main():
    # Get all unique words missing examples
    pipeline = [
        {"$unwind": "$activity_flow"},
        {"$match": {"activity_flow.type": "vocabulary"}},
        {"$unwind": "$activity_flow.data.words"},
        {"$match": {"$or": [
            {"activity_flow.data.words.example": ""},
            {"activity_flow.data.words.example": {"$exists": False}}
        ]}},
        {"$project": {"_id": 0, "word": "$activity_flow.data.words.word"}}
    ]
    results = list(db.unified_lessons.aggregate(pipeline))
    missing_words = sorted(set(r["word"] for r in results))
    print(f"Words missing examples: {len(missing_words)}")
    
    # Process in batches of 20
    all_data = {}
    batch_size = 20
    for i in range(0, len(missing_words), batch_size):
        batch = missing_words[i:i+batch_size]
        print(f"  Batch {i//batch_size + 1}/{(len(missing_words)+batch_size-1)//batch_size}: {batch[:3]}...")
        try:
            result = await generate_for_batch(batch)
            all_data.update(result)
            print(f"    Got {len(result)} results")
        except Exception as e:
            print(f"    ERROR: {e}")
    
    print(f"\nTotal generated: {len(all_data)}")
    
    # Save to file
    with open("/app/tools/vocab_enrichment.json", "w") as f:
        json.dump(all_data, f, indent=2)
    
    # Update database
    lessons = list(db.unified_lessons.find({}))
    updated = 0
    for lesson in lessons:
        modified = False
        for step in lesson.get("activity_flow", []):
            if step.get("type") != "vocabulary":
                continue
            for word_data in step.get("data", {}).get("words", []):
                w = word_data.get("word", "").lower().strip()
                if w in all_data and not word_data.get("example"):
                    word_data["example"] = all_data[w].get("example", "")
                    word_data["definition"] = all_data[w].get("definition", "")
                    modified = True
                    updated += 1
                # Also check case-insensitive
                elif w.capitalize() in all_data and not word_data.get("example"):
                    word_data["example"] = all_data[w.capitalize()].get("example", "")
                    word_data["definition"] = all_data[w.capitalize()].get("definition", "")
                    modified = True
                    updated += 1
        
        if modified:
            db.unified_lessons.update_one(
                {"_id": lesson["_id"]},
                {"$set": {"activity_flow": lesson["activity_flow"]}}
            )
    
    print(f"Updated {updated} word entries in DB")


if __name__ == "__main__":
    asyncio.run(main())
