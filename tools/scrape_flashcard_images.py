#!/usr/bin/env python3
"""
Scrape vocabulary flashcard images from bestflashcard.com
Downloads images for Cambridge YLE Pre A1 Starters vocabulary words.
"""

import os
import sys
import json
import time
import re
import requests
from bs4 import BeautifulSoup
from pathlib import Path
from pymongo import MongoClient
from dotenv import load_dotenv

BASE_URL = "https://bestflashcard.com"
IMAGE_BASE = f"{BASE_URL}/images/vocabulary/english"
SAVE_DIR = Path("/app/backend/static/vocab_images")
SAVE_DIR.mkdir(parents=True, exist_ok=True)

TOPIC_SLUGS = [
    "cambridge-yle-pre-a1-starters-1-my-body",
    "cambridge-yle-pre-a1-starters-2-at-the-zoo",
    "cambridge-yle-pre-a1-starters-3-at-the-clothes-shop",
    "cambridge-yle-pre-a1-starters-4-my-friend-s-birthday",
    "cambridge-yle-pre-a1-starters-5-my-favourite-food",
    "cambridge-yle-pre-a1-starters-6-at-home",
    "cambridge-yle-pre-a1-starters-7-at-school",
    "cambridge-yle-pre-a1-starters-8-at-the-beach",
    "cambridge-yle-pre-a1-starters-9-my-street",
    "cambridge-yle-pre-a1-starters-10-young-learners",
    "cambridge-yle-pre-a1-starters-11-colours",
    "cambridge-yle-pre-a1-starters-12-numbers",
    "cambridge-yle-pre-a1-starters-13-where-is-monkey",
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}


def get_words_from_topic(slug):
    """Parse a topic page and extract words + image filenames from JS variable."""
    url = f"{BASE_URL}/learning-english-vocabulary/{slug}"
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        resp.raise_for_status()
        
        # Extract listwordsstr from JavaScript
        match = re.search(r'var listwordsstr\s*=\s*"([^"]+)"', resp.text)
        if not match:
            print(f"  ERROR: listwordsstr not found in {slug}")
            return []
        
        raw = match.group(1)
        # Format: word|||image.PNG|#|word2|||image2.PNG|#|...
        entries = raw.split("|#|")
        words = []
        for entry in entries:
            if not entry.strip():
                continue
            parts = entry.split("|||")
            if len(parts) >= 2:
                word = parts[0].strip().lower()
                img_file = parts[-1].strip()
                words.append({"word": word, "image_file": img_file})
        
        print(f"  Topic '{slug}': {len(words)} words")
        return words
    except Exception as e:
        print(f"  ERROR fetching {slug}: {e}")
        return []


def download_image(slug, img_file, save_filename):
    """Download a single image."""
    img_url = f"{IMAGE_BASE}/{slug}/{img_file}"
    try:
        resp = requests.get(img_url, headers=HEADERS, timeout=15)
        if resp.status_code == 200 and len(resp.content) > 500:
            save_path = SAVE_DIR / save_filename
            with open(save_path, "wb") as f:
                f.write(resp.content)
            size_kb = len(resp.content) / 1024
            print(f"    OK: {save_filename} ({size_kb:.1f} KB)")
            return True
    except Exception as e:
        print(f"    NETWORK ERROR: {img_file}: {e}")
    
    print(f"    FAILED: {img_file}")
    return False


def get_all_db_vocab_words():
    """Get all unique vocabulary words from MongoDB."""
    load_dotenv(Path("/app/backend/.env"))
    client = MongoClient(os.environ["MONGO_URL"])
    db = client[os.environ["DB_NAME"]]
    
    pipeline = [
        {"$unwind": "$activity_flow"},
        {"$match": {"activity_flow.type": "vocabulary"}},
        {"$unwind": "$activity_flow.data.words"},
        {"$project": {"_id": 0, "word": "$activity_flow.data.words.word"}}
    ]
    results = list(db.unified_lessons.aggregate(pipeline))
    return set(r["word"].lower().strip() for r in results)


def main():
    print("=" * 60)
    print("STEP 1: Collecting words from bestflashcard.com...")
    print("=" * 60)
    
    # word -> {slug, image_file}
    website_words = {}
    for slug in TOPIC_SLUGS:
        words = get_words_from_topic(slug)
        for w in words:
            website_words[w["word"]] = {"slug": slug, "image_file": w["image_file"]}
        time.sleep(0.3)
    
    print(f"\nTotal words on website: {len(website_words)}")
    print(f"Words: {sorted(website_words.keys())}")
    
    print("\n" + "=" * 60)
    print("STEP 2: Getting vocabulary words from database...")
    print("=" * 60)
    
    db_words = get_all_db_vocab_words()
    print(f"Total unique words in DB: {len(db_words)}")
    
    matching = db_words & set(website_words.keys())
    not_on_site = db_words - set(website_words.keys())
    
    print(f"\nMatching words (will download): {len(matching)}")
    print(f"Words NOT on website: {len(not_on_site)}")
    if not_on_site:
        print(f"  Missing: {sorted(not_on_site)}")
    
    print("\n" + "=" * 60)
    print("STEP 3: Downloading images...")
    print("=" * 60)
    
    success = 0
    failed = []
    mapping = {}
    
    for word in sorted(matching):
        info = website_words[word]
        safe_name = word.replace(" ", "_").replace("'", "")
        filename = f"{safe_name}.png"
        
        if download_image(info["slug"], info["image_file"], filename):
            mapping[word] = f"/static/vocab_images/{filename}"
            success += 1
        else:
            failed.append(word)
        time.sleep(0.2)
    
    # Also download all available images from website even if not exact match
    # (for words that might differ slightly)
    extra = set(website_words.keys()) - matching
    print(f"\n--- Downloading {len(extra)} extra images from website (not exact DB match) ---")
    for word in sorted(extra):
        info = website_words[word]
        safe_name = word.replace(" ", "_").replace("'", "")
        filename = f"{safe_name}.png"
        if download_image(info["slug"], info["image_file"], filename):
            mapping[word] = f"/static/vocab_images/{filename}"
            success += 1
        time.sleep(0.2)
    
    print(f"\n{'=' * 60}")
    print(f"RESULTS: {success} downloaded, {len(failed)} failed from DB matches")
    if failed:
        print(f"Failed words: {failed}")
    print(f"{'=' * 60}")
    
    mapping_path = Path("/app/tools/image_mapping.json")
    with open(mapping_path, "w") as f:
        json.dump(mapping, f, indent=2, sort_keys=True)
    print(f"\nMapping saved to {mapping_path} ({len(mapping)} entries)")


if __name__ == "__main__":
    main()
