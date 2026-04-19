#!/usr/bin/env python3
"""
Generate vocabulary flashcard images using GPT Image 1 (OpenAI).
Generates simple, colorful illustrations for children's vocabulary.
"""

import os
import sys
import json
import asyncio
import hashlib
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path("/app/backend/.env"))

from emergentintegrations.llm.openai.image_generation import OpenAIImageGeneration

SAVE_DIR = Path("/app/backend/static/vocab_images")
SAVE_DIR.mkdir(parents=True, exist_ok=True)

API_KEY = os.environ["EMERGENT_LLM_KEY"]


def get_prompt(word):
    """Create a child-friendly flashcard prompt for a word."""
    base = (
        "A simple, colorful flashcard illustration for a 6-year-old child learning English. "
        "Clean white background. Cartoon style, friendly and clear. "
        "No text or letters in the image. "
    )
    
    # Custom prompts for abstract/tricky words
    custom = {
        "she": "A friendly cartoon girl pointing at herself",
        "they": "A small group of 3 happy cartoon children standing together",
        "there are": "Three cartoon apples sitting on a table",
        "there is": "One cartoon cat sitting on a chair",
        "some": "A few cartoon cookies on a plate",
        "sometimes": "A cartoon child with a thought bubble showing sun and rain",
        "short": "A short cartoon child standing next to a tall giraffe",
        "small": "A tiny cartoon mouse next to a big cartoon elephant",
        "smile": "A happy cartoon child with a big bright smile",
        "spell": "A cartoon child writing letters A B C on a chalkboard",
        "stomp": "A cartoon child stomping feet on the ground with motion lines",
        "thirsty": "A cartoon child looking thirsty reaching for a glass of water",
        "wearing": "A cartoon child wearing a colorful hat and scarf",
        "white": "A white fluffy cartoon cat on a light grey background",
        "word": "A cartoon open book with colorful letters floating above it",
        "write": "A cartoon child writing with a pencil on paper",
        "yes": "A cartoon child nodding happily with a thumbs up",
        "watching tv": "A cartoon child sitting on a sofa watching a TV screen",
        "sleepy": "A cartoon child yawning with droopy eyes",
        "sleeping": "A cartoon child sleeping peacefully in bed",
        "singing": "A cartoon child singing with musical notes around",
        "playing": "A cartoon child playing with colorful toys",
        "reading": "A cartoon child reading a book",
        "running": "A cartoon child running happily",
        "paint": "A cartoon child painting on an easel with a paintbrush",
        "sad": "A cartoon child with a sad face and a small tear",
        "scary": "A cartoon friendly ghost saying boo",
    }
    
    if word in custom:
        return base + custom[word]
    return base + f"A clear illustration of: {word}"


async def generate_single(image_gen, word, index, total):
    """Generate image for a single word."""
    safe_name = word.replace(" ", "_").replace("'", "")
    filename = f"gpt_{safe_name}.png"
    filepath = SAVE_DIR / filename
    
    if filepath.exists() and filepath.stat().st_size > 500:
        print(f"  [{index}/{total}] SKIP (exists): {word}")
        return word, filename, True
    
    prompt = get_prompt(word)
    try:
        images = await image_gen.generate_images(
            prompt=prompt,
            model="gpt-image-1",
            number_of_images=1,
        )
        if images and len(images) > 0:
            with open(filepath, "wb") as f:
                f.write(images[0])
            size_kb = len(images[0]) / 1024
            print(f"  [{index}/{total}] OK: {word} -> {filename} ({size_kb:.1f} KB)")
            return word, filename, True
        else:
            print(f"  [{index}/{total}] FAIL (no image): {word}")
            return word, filename, False
    except Exception as e:
        print(f"  [{index}/{total}] ERROR: {word}: {e}")
        return word, filename, False


async def main():
    words = json.load(open("/app/tools/needs_gpt_image.json"))
    print(f"Generating GPT Images for {len(words)} words...")
    print("=" * 60)
    
    image_gen = OpenAIImageGeneration(api_key=API_KEY)
    
    results = {"success": [], "failed": []}
    mapping = {}
    
    for i, word in enumerate(words, 1):
        word_lower, filename, ok = await generate_single(image_gen, word, i, len(words))
        if ok:
            results["success"].append(word_lower)
            mapping[word_lower] = f"/static/vocab_images/{filename}"
        else:
            results["failed"].append(word_lower)
    
    print(f"\n{'=' * 60}")
    print(f"DONE: {len(results['success'])} success, {len(results['failed'])} failed")
    if results["failed"]:
        print(f"Failed: {results['failed']}")
    
    # Save mapping
    mapping_path = Path("/app/tools/gpt_image_mapping.json")
    with open(mapping_path, "w") as f:
        json.dump(mapping, f, indent=2, sort_keys=True)
    print(f"Mapping saved to {mapping_path}")


if __name__ == "__main__":
    asyncio.run(main())
