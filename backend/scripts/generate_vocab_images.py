"""
Batch AI Image Generator for Vocabulary Words
Uses Nano Banana 2 (Gemini 3.1 Flash Image) via Emergent Integrations
Generates child-friendly illustration-style images for all vocabulary words.
"""

import asyncio
import os
import json
import base64
import hashlib
from pathlib import Path
from dotenv import load_dotenv

load_dotenv('/app/backend/.env')

from emergentintegrations.llm.chat import LlmChat, UserMessage

# Output directory
IMG_DIR = Path("/app/backend/static/vocab_images")
IMG_DIR.mkdir(parents=True, exist_ok=True)

# Progress tracking
PROGRESS_FILE = Path("/tmp/image_gen_progress.json")


def load_progress():
    if PROGRESS_FILE.exists():
        with open(PROGRESS_FILE) as f:
            return json.load(f)
    return {}


def save_progress(progress):
    with open(PROGRESS_FILE, 'w') as f:
        json.dump(progress, f)


async def generate_image(word: str, definition: str, session_num: int) -> str:
    """Generate a single vocabulary image using Nano Banana 2"""
    api_key = os.getenv("EMERGENT_LLM_KEY")
    if not api_key:
        raise ValueError("EMERGENT_LLM_KEY not set")

    # Create a unique session for each image
    chat = LlmChat(
        api_key=api_key,
        session_id=f"vocab-img-{session_num}",
        system_message="You are an educational illustration artist for children aged 6-8."
    )
    chat.with_model("gemini", "gemini-3-pro-image-preview").with_params(modalities=["image", "text"])

    # Build prompt for child-friendly illustration
    context = f" ({definition})" if definition else ""
    prompt = f"""Create a single, simple, colorful cartoon illustration for the English vocabulary word: "{word}"{context}.

Style requirements:
- Bright, cheerful children's book illustration style
- Simple clean background (white or soft pastel)
- Clear, recognizable subject centered in the image
- Age-appropriate for 6-8 year old children
- No text or words in the image
- Friendly and inviting style"""

    try:
        text, images = await chat.send_message_multimodal_response(UserMessage(text=prompt))

        if images and len(images) > 0:
            img_data = base64.b64decode(images[0]['data'])
            # Save with word-based filename
            safe_name = hashlib.md5(word.lower().encode()).hexdigest()
            filepath = IMG_DIR / f"{safe_name}.png"
            filepath.write_bytes(img_data)
            return f"/static/vocab_images/{safe_name}.png"
    except Exception as e:
        print(f"  ERROR generating '{word}': {str(e)[:80]}")
    return ""


async def batch_generate(words_file: str = "/tmp/all_vocab_words.json", batch_size: int = 5):
    """Generate images for all vocabulary words in batches"""
    with open(words_file) as f:
        words_map = json.load(f)

    progress = load_progress()
    total = len(words_map)
    done = len([k for k, v in progress.items() if v])
    print(f"\n{'='*60}")
    print(f"  VOCABULARY IMAGE GENERATION")
    print(f"  Total: {total} words, Already done: {done}")
    print(f"{'='*60}\n")

    words_list = sorted(words_map.items())
    session_num = done

    for i in range(0, len(words_list), batch_size):
        batch = words_list[i:i + batch_size]
        tasks = []

        for word_key, word_info in batch:
            if word_key in progress and progress[word_key]:
                continue  # Skip already generated
            session_num += 1
            tasks.append((word_key, word_info, session_num))

        if not tasks:
            continue

        # Process batch sequentially to avoid rate limits
        for word_key, word_info, snum in tasks:
            word = word_info['word']
            definition = word_info.get('definition', '')
            done += 1
            print(f"  [{done}/{total}] Generating: {word}...", end=" ", flush=True)

            url = await generate_image(word, definition, snum)
            if url:
                progress[word_key] = url
                print(f"OK")
            else:
                progress[word_key] = ""
                print(f"FAILED")

            save_progress(progress)
            # Small delay between images
            await asyncio.sleep(1)

    # Summary
    success = len([k for k, v in progress.items() if v])
    failed = len([k for k, v in progress.items() if not v])
    print(f"\n{'='*60}")
    print(f"  COMPLETE: {success} generated, {failed} failed")
    print(f"{'='*60}")

    return progress


async def update_db_with_images():
    """Update MongoDB with generated image URLs"""
    from pymongo import MongoClient
    progress = load_progress()
    if not progress:
        print("No images to update")
        return

    client = MongoClient('mongodb://localhost:27017')
    db = client['ielts_database']

    # Build word -> url map
    word_to_url = {}
    for word_key, url in progress.items():
        if url:
            word_to_url[word_key.lower()] = url

    updated = 0
    for stage_id in ['stage_1', 'stage_2_starters']:
        for lesson in db.unified_lessons.find({'stage_id': stage_id}, {'_id': 0, 'lesson_id': 1, 'activity_flow': 1}):
            changed = False
            for a in lesson['activity_flow']:
                if a['type'] == 'vocabulary':
                    for w in a.get('data', {}).get('words', []):
                        word = w.get('word', '').strip().lower()
                        if word in word_to_url:
                            w['image_url'] = word_to_url[word]
                            changed = True

            if changed:
                db.unified_lessons.update_one(
                    {'lesson_id': lesson['lesson_id']},
                    {'$set': {'activity_flow': lesson['activity_flow']}}
                )
                updated += 1

    print(f"Updated {updated} lessons with vocabulary images")
    client.close()


async def main():
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "update-db":
        await update_db_with_images()
    else:
        await batch_generate()
        await update_db_with_images()


if __name__ == "__main__":
    asyncio.run(main())
