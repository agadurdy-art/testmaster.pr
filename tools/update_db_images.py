#!/usr/bin/env python3
"""
Step 2: Create close-match mappings and copy images for near-matches.
Then update MongoDB with all available image URLs.
"""
import os
import json
import shutil
from pathlib import Path
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv(Path("/app/backend/.env"))

SAVE_DIR = Path("/app/backend/static/vocab_images")

# Manual near-match mapping: DB_word -> existing_downloaded_image_filename
NEAR_MATCHES = {
    "angry": "angry_man.png",
    "man": "angry_man.png",
    "chair": "armchair.png",
    "hat": "black_hat.png",
    "jacket": "blue_jacket.png",
    "bag": "brown_bag.png",
    "dress": "orange_dress.png",
    "glasses": "purple_glasses.png",
    "handbag": "pink_handbag.png",
    "shirt": "yellow_shirt.png",
    "shoes": "shoe.png",
    "socks": "sock.png",
    "trousers": "grey_trousers.png",
    "paint": "painting.png",
    "sing": "sing_a_song.png",
    "running": "run.png",
    "ball": "hit_a_ball.png",
    "apple": "pineapple.png",
    "book": "bookcase.png",
    "football": "foot.png",
    "board": "cupboard.png",
}


def build_full_mapping():
    """Build complete word -> image_path mapping."""
    # Start with scraped exact matches
    mapping = json.load(open("/app/tools/image_mapping.json"))
    
    # Add near matches
    for word, src_file in NEAR_MATCHES.items():
        src_path = SAVE_DIR / src_file
        if src_path.exists() and word not in mapping:
            # Copy to clean name
            safe_name = word.replace(" ", "_").replace("'", "")
            dest_file = f"{safe_name}.png"
            dest_path = SAVE_DIR / dest_file
            if not dest_path.exists():
                shutil.copy2(src_path, dest_path)
            mapping[word] = f"/static/vocab_images/{dest_file}"
            print(f"  Near-match: {word} <- {src_file}")
    
    return mapping


def update_database(mapping):
    """Update MongoDB unified_lessons with image URLs."""
    client = MongoClient(os.environ["MONGO_URL"])
    db = client[os.environ["DB_NAME"]]
    
    lessons = list(db.unified_lessons.find({}))
    total_updated = 0
    
    for lesson in lessons:
        modified = False
        for step in lesson.get("activity_flow", []):
            if step.get("type") != "vocabulary":
                continue
            for word_data in step.get("data", {}).get("words", []):
                w = word_data.get("word", "").lower().strip()
                if w in mapping:
                    new_url = mapping[w]
                    if word_data.get("image_url") != new_url:
                        word_data["image_url"] = new_url
                        modified = True
                        total_updated += 1
        
        if modified:
            db.unified_lessons.update_one(
                {"_id": lesson["_id"]},
                {"$set": {"activity_flow": lesson["activity_flow"]}}
            )
    
    print(f"\nDatabase updated: {total_updated} word entries updated across lessons")
    return total_updated


def report_missing(mapping):
    """Report which words still have no image."""
    client = MongoClient(os.environ["MONGO_URL"])
    db = client[os.environ["DB_NAME"]]
    
    pipeline = [
        {"$unwind": "$activity_flow"},
        {"$match": {"activity_flow.type": "vocabulary"}},
        {"$unwind": "$activity_flow.data.words"},
        {"$project": {"_id": 0, "word": "$activity_flow.data.words.word"}}
    ]
    results = list(db.unified_lessons.aggregate(pipeline))
    db_words = set(r["word"].lower().strip() for r in results)
    
    still_missing = sorted(db_words - set(mapping.keys()))
    print(f"\nStill missing images: {len(still_missing)} words")
    print(f"Missing: {still_missing}")
    return still_missing


def main():
    print("=" * 60)
    print("Building full image mapping (exact + near matches)...")
    print("=" * 60)
    
    mapping = build_full_mapping()
    print(f"\nTotal mapped words: {len(mapping)}")
    
    print("\n" + "=" * 60)
    print("Updating database...")
    print("=" * 60)
    update_database(mapping)
    
    print("\n" + "=" * 60)
    print("Missing words report...")
    print("=" * 60)
    still_missing = report_missing(mapping)
    
    # Save updated mapping
    with open("/app/tools/image_mapping.json", "w") as f:
        json.dump(mapping, f, indent=2, sort_keys=True)
    
    # Save missing words list
    with open("/app/tools/missing_words.json", "w") as f:
        json.dump(still_missing, f, indent=2)
    
    print(f"\nDone! Updated mapping: {len(mapping)} entries")
    print(f"Missing words saved to /app/tools/missing_words.json")


if __name__ == "__main__":
    main()
