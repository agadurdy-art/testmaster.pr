"""
AI Content Cache Generator - Generates content in batches and saves to JSON cache.
Run this ONCE per curriculum update. The seed script reads from the cache.
Usage: python ai_generate_cache.py [start_unit] [end_unit]
"""
import asyncio
import json
import os
import sys
from dotenv import load_dotenv
load_dotenv()

from ai_content_generator import generate_grammar_exercises, generate_exit_questions, generate_warmup_questions
from seed_stage1_full import UNITS

CACHE_FILE = "/app/backend/ai_content_cache.json"


def load_cache():
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE, 'r') as f:
            return json.load(f)
    return {}


def save_cache(cache):
    with open(CACHE_FILE, 'w') as f:
        json.dump(cache, f, indent=2, ensure_ascii=False)


async def generate_for_unit(u, lesson_num):
    """Generate AI content for a single unit+lesson"""
    words = u["words"]
    half = len(words) // 2
    
    if lesson_num == 1:
        grammar_words = words[:half]
        warmup_words = words[:half]
        exit_words = words[:2]
    elif lesson_num == 2:
        grammar_words = words[half:]
        warmup_words = words[half:]
        exit_words = words[half:half + 2]
    elif lesson_num == 3:
        grammar_words = [words[0], words[2], words[4]] if len(words) > 4 else words[:3]
        warmup_words = grammar_words
        exit_words = [words[0], words[-1]]
    else:
        grammar_words = words[:3]
        warmup_words = [words[1], words[3], words[5]] if len(words) > 5 else words[:3]
        exit_words = [words[2], words[4]] if len(words) > 4 else words[:2]

    result = {}
    
    # Grammar game
    try:
        grammar = await generate_grammar_exercises(u, lesson_num, grammar_words)
        result["grammar_game"] = grammar
        print(f"    Grammar: {len(grammar.get('fill_blank_items',[]))} fill, {len(grammar.get('word_order_items',[]))} word_order")
    except Exception as e:
        print(f"    Grammar FAILED: {e}")
        result["grammar_game"] = None

    # Exit ticket
    try:
        exit_q = await generate_exit_questions(u, lesson_num, exit_words)
        result["exit_ticket"] = exit_q
        print(f"    Exit: {len(exit_q.get('questions',[]))} questions")
    except Exception as e:
        print(f"    Exit FAILED: {e}")
        result["exit_ticket"] = None

    # Warmup
    try:
        warmup = await generate_warmup_questions(u, lesson_num, warmup_words)
        result["warmup"] = warmup
        print(f"    Warmup: {len(warmup.get('questions',[]))} questions")
    except Exception as e:
        print(f"    Warmup FAILED: {e}")
        result["warmup"] = None

    return result


async def main():
    start = int(sys.argv[1]) if len(sys.argv) > 1 else 1
    end = int(sys.argv[2]) if len(sys.argv) > 2 else min(start + 2, 12)
    
    cache = load_cache()
    
    print(f"Generating AI content for Units {start}-{end}")
    print("=" * 50)
    
    for u in UNITS:
        if u["num"] < start or u["num"] > end:
            continue
        print(f"\nUnit {u['num']}: {u['title']}")
        unit_key = f"unit_{u['num']:02d}"
        if unit_key not in cache:
            cache[unit_key] = {}
        
        for ln in range(1, 5):
            lesson_key = f"lesson_{ln:02d}"
            if lesson_key in cache[unit_key] and cache[unit_key][lesson_key].get("grammar_game"):
                print(f"  L{ln}: Already cached, skipping")
                continue
            
            print(f"  L{ln}: Generating...")
            result = await generate_for_unit(u, ln)
            cache[unit_key][lesson_key] = result
            save_cache(cache)  # Save after each lesson
    
    print("\n" + "=" * 50)
    print(f"Cache saved to {CACHE_FILE}")
    
    # Summary
    total = sum(1 for uk in cache.values() for lk in uk.values() if lk.get("grammar_game"))
    print(f"Total cached lessons: {total}/48")


if __name__ == "__main__":
    asyncio.run(main())
