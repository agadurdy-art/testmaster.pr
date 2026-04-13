"""
Stage 2 Vocabulary Enrichment Script
Generates definitions, example sentences, emojis and IPA for all Stage 2 words using AI.
Updates both JSON content files and MongoDB database.
"""
import asyncio
import json
import glob
import os
import pymongo
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage

load_dotenv()

async def generate_vocab_data(words_list):
    """Use AI to generate vocabulary data for a batch of words"""
    chat = LlmChat(
        api_key=os.environ.get("EMERGENT_LLM_KEY"),
        session_id=f"vocab-enrich-{words_list[0]}",
        system_message="You are an English language teacher for young learners (ages 6-8, A1 level). Generate vocabulary data in JSON format."
    )
    chat.with_model("openai", "gpt-4o-mini")
    
    words_str = ", ".join(words_list)
    msg = UserMessage(text=f"""Generate vocabulary data for these A1-level English words: {words_str}

Return ONLY a valid JSON object (no markdown, no code blocks) where each key is the word and value is an object with:
- "definition": Simple 5-8 word definition a child can understand
- "example": Short example sentence (6-10 words) using the word
- "image_emoji": One relevant emoji for the word
- "ipa": IPA pronunciation (e.g., /həˈloʊ/)

Example format:
{{"hello": {{"definition": "A friendly word to greet someone", "example": "Hello! How are you today?", "image_emoji": "👋", "ipa": "/həˈloʊ/"}}}}""")
    
    response = await chat.send_message(msg)
    # Parse JSON from response
    text = response.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1].rsplit("```", 1)[0]
    return json.loads(text)


async def main():
    # Collect all unique words from Stage 2
    all_words = set()
    for fpath in sorted(glob.glob("/app/backend/content/stage2_unit*.json")):
        with open(fpath) as f:
            d = json.load(f)
        for unit in d["units"]:
            for lesson in unit["lessons"]:
                for step in lesson["steps"]:
                    if step["type"] in ("vocabulary", "vocabulary_review"):
                        for item in step.get("items", []):
                            word = item["word"] if isinstance(item, dict) else item
                            all_words.add(word)
    
    all_words = sorted(all_words)
    print(f"Total unique words to enrich: {len(all_words)}")
    
    # Generate vocab data in batches
    vocab_data = {}
    batch_size = 25
    for i in range(0, len(all_words), batch_size):
        batch = all_words[i:i+batch_size]
        print(f"  Generating batch {i//batch_size + 1}: {batch[:3]}...")
        try:
            result = await generate_vocab_data(batch)
            vocab_data.update(result)
            print(f"    Got {len(result)} words")
        except Exception as e:
            print(f"    Error: {e}")
            # Fallback: create basic data
            for w in batch:
                if w not in vocab_data:
                    vocab_data[w] = {
                        "definition": f"The English word '{w}'",
                        "example": f"I know the word {w}.",
                        "image_emoji": "📖",
                        "ipa": ""
                    }
    
    print(f"\nTotal vocab data generated: {len(vocab_data)}")
    
    # Save the generated data for reference
    with open("/app/backend/content/stage2_vocab_enrichment.json", "w") as f:
        json.dump(vocab_data, f, indent=2, ensure_ascii=False)
    print("Saved to stage2_vocab_enrichment.json")
    
    # Update JSON content files
    updated_files = 0
    for fpath in sorted(glob.glob("/app/backend/content/stage2_unit*.json")):
        with open(fpath) as f:
            d = json.load(f)
        
        changed = False
        for unit in d["units"]:
            for lesson in unit["lessons"]:
                for step in lesson["steps"]:
                    if step["type"] in ("vocabulary", "vocabulary_review"):
                        for item in step.get("items", []):
                            if isinstance(item, dict):
                                word = item["word"]
                                if word in vocab_data:
                                    vd = vocab_data[word]
                                    if not item.get("definition", "").strip():
                                        item["definition"] = vd.get("definition", "")
                                        changed = True
                                    if not item.get("example", "").strip():
                                        item["example"] = vd.get("example", "")
                                        changed = True
                                    if not item.get("image_emoji", "").strip():
                                        item["image_emoji"] = vd.get("image_emoji", "")
                                        changed = True
                                    if not item.get("ipa", "").strip():
                                        item["ipa"] = vd.get("ipa", "")
                                        changed = True
        
        if changed:
            with open(fpath, "w") as f:
                json.dump(d, f, indent=2, ensure_ascii=False)
            updated_files += 1
            print(f"  Updated: {os.path.basename(fpath)}")
    
    print(f"\nUpdated {updated_files} JSON files")
    
    # Also update enriched files
    for fpath in sorted(glob.glob("/app/backend/content/enriched/stage2_unit*_enriched.json")):
        with open(fpath) as f:
            d = json.load(f)
        changed = False
        for unit in d["units"]:
            for lesson in unit["lessons"]:
                for step in lesson["steps"]:
                    if step["type"] in ("vocabulary", "vocabulary_review"):
                        for item in step.get("items", []):
                            if isinstance(item, dict):
                                word = item["word"]
                                if word in vocab_data:
                                    vd = vocab_data[word]
                                    if not item.get("definition", "").strip():
                                        item["definition"] = vd.get("definition", "")
                                        changed = True
                                    if not item.get("example", "").strip():
                                        item["example"] = vd.get("example", "")
                                        changed = True
                                    if not item.get("image_emoji", "").strip():
                                        item["image_emoji"] = vd.get("image_emoji", "")
                                        changed = True
                                    if not item.get("ipa", "").strip():
                                        item["ipa"] = vd.get("ipa", "")
                                        changed = True
        if changed:
            with open(fpath, "w") as f:
                json.dump(d, f, indent=2, ensure_ascii=False)
            print(f"  Updated enriched: {os.path.basename(fpath)}")
    
    # Update MongoDB
    print("\nUpdating MongoDB...")
    client = pymongo.MongoClient(os.environ.get("MONGO_URL"))
    db = client["ielts_database"]
    
    updated_lessons = 0
    for lesson_doc in db.unified_lessons.find({"stage_id": "stage_2_starters"}, {"_id": 1, "lesson_id": 1, "activity_flow": 1}):
        af = lesson_doc.get("activity_flow", [])
        changed = False
        for act in af:
            if act.get("type") == "vocabulary" and act.get("data", {}).get("words"):
                for w in act["data"]["words"]:
                    word = w.get("word", "")
                    if word in vocab_data:
                        vd = vocab_data[word]
                        if not w.get("definition", "").strip():
                            w["definition"] = vd.get("definition", "")
                            changed = True
                        if not w.get("example", "").strip():
                            w["example"] = vd.get("example", "")
                            changed = True
                        if not w.get("image_emoji", "").strip():
                            w["image_emoji"] = vd.get("image_emoji", "")
                            changed = True
                        if not w.get("ipa", "").strip():
                            w["ipa"] = vd.get("ipa", "")
                            changed = True
        
        if changed:
            db.unified_lessons.update_one(
                {"_id": lesson_doc["_id"]},
                {"$set": {"activity_flow": af}}
            )
            updated_lessons += 1
    
    print(f"Updated {updated_lessons} lessons in MongoDB")
    
    # Verify
    total = 0
    empty = 0
    for lesson_doc in db.unified_lessons.find({"stage_id": "stage_2_starters"}, {"_id": 0, "activity_flow": 1}):
        for act in lesson_doc.get("activity_flow", []):
            if act.get("type") == "vocabulary" and act.get("data", {}).get("words"):
                for w in act["data"]["words"]:
                    total += 1
                    if not w.get("definition", "").strip():
                        empty += 1
    
    print(f"\nVerification: {total} total vocab words, {empty} still empty ({(total-empty)/total*100:.0f}% filled)")
    client.close()


if __name__ == "__main__":
    asyncio.run(main())
