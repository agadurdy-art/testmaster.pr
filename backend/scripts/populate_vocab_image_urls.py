#!/usr/bin/env python3
"""
Set image_url on every vocab item in a Stage 3 enriched JSON to a
deterministic Pollinations.ai URL. Pollinations is free, key-less, and
deterministic with a seed, so the same URL always returns the same image
(browser + CDN can cache normally). No upload to R2 needed; the <img> tag
just loads from Pollinations.

Aga's call 2026-05-19: vocab games must show REAL pictures, not just
emoji. Emoji stays as on-card fallback while the Pollinations image
loads.

Usage:
    python3 backend/scripts/populate_vocab_image_urls.py --unit 01
    python3 backend/scripts/populate_vocab_image_urls.py --unit 02 --force  # overwrite existing URLs
    python3 backend/scripts/populate_vocab_image_urls.py --all
"""

import argparse
import hashlib
import json
import urllib.parse
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
ENRICHED = REPO_ROOT / "backend/content/enriched"

STYLE_SUFFIX = (
    "cartoon flat illustration, kid-friendly, bright friendly colors, "
    "soft shading, white background, simple clear composition for a vocabulary card, "
    "no text, no letters, no watermark, no logos"
)

# Per-word descriptive prompts. Anything not listed falls back to
# "<word>, single subject" which Pollinations Flux usually handles fine.
WORD_PROMPTS = {
    # Unit 01 — Objects + people + countries
    "bag":     "a single school backpack, blue and red, standing upright",
    "camera":  "a small modern camera, black, single object on table",
    "chair":   "a single wooden classroom chair, simple shape",
    "phone":   "a smartphone, single object, screen facing camera",
    "photo":   "a printed photograph in a small frame, single object",
    "table":   "a single small wooden classroom table, top view slightly tilted",
    "watch":   "a child's wristwatch, single object on plain surface",
    "student": "a happy primary-school student wearing a backpack, big smile",
    "friend":  "two children smiling and high-fiving, classroom background",
    "teacher": "a friendly female teacher pointing at a whiteboard, smiling",
    "classmate":"two students sitting at a desk together, both smiling",
    "Argentina":"the country of Argentina shown as a stylised map outline with national colors",
    "Argentinian":"a young Argentinian person wearing a friendly smile",
    "Brazil":"the country of Brazil shown as a stylised map outline with green-yellow national colors",
    "Brazilian":"a young Brazilian person smiling warmly",
    "China":"the country of China shown as a stylised map outline with red color",
    "Chinese":"a young Chinese student smiling friendly",
    "Italy":"the country of Italy shown as a stylised boot-shaped map outline",
    "Italian":"a young Italian person smiling warmly",
    "Japan":"the country of Japan shown as a stylised map outline of islands",
    "Japanese":"a young Japanese student smiling friendly",
    "Mexico":"the country of Mexico shown as a stylised map outline with national colors",
    "Mexican":"a young Mexican person smiling friendly",
    "Russia":"the country of Russia shown as a wide stylised map outline",
    "Russian":"a young Russian student smiling friendly",
    "Spain":"the country of Spain shown as a stylised map outline with red and yellow",
    "Spanish":"a young Spanish person smiling warmly",
    "Turkey":"the country of Turkey shown as a stylised map outline between Europe and Asia",
    "Turkish":"a young Turkish person smiling warmly",
    "the UK":"the United Kingdom shown as a stylised map outline with Union Jack accents",
    "British":"a young British student smiling warmly",
    "the USA":"the United States shown as a stylised map outline with stars and stripes accents",
    "American":"a young American student smiling friendly",
    "Vietnam":"the country of Vietnam shown as a stylised S-shaped map outline with red and yellow",
    "Vietnamese":"a young Vietnamese student smiling warmly, wearing a school uniform",

    # Unit 02 — Families + feelings
    "mum":      "a kind mother smiling warmly, head-and-shoulders portrait, friendly eyes",
    "dad":      "a kind father smiling warmly, head-and-shoulders portrait, friendly eyes",
    "mother":   "a young mother smiling at the camera, head-and-shoulders portrait",
    "father":   "a young father smiling at the camera, head-and-shoulders portrait",
    "brother":  "a smiling boy aged 9, school clothes, head-and-shoulders",
    "sister":   "a smiling girl aged 9, school clothes, head-and-shoulders",
    "husband":  "a young husband and wife smiling, the husband looking at the camera",
    "wife":     "a young husband and wife smiling, the wife looking at the camera",
    "son":      "a happy son hugging his parents, head-and-shoulders, son smiling",
    "daughter": "a happy daughter standing with her parents, daughter smiling",
    "baby":     "a happy baby smiling, plain background",
    "parents":  "two parents standing together, both smiling, head-and-shoulders portrait",
    "children": "three smiling children standing together, school clothes",
    "family":   "a happy family of four (mum, dad, son, daughter) smiling together",
    "bored":   "a child looking bored, leaning on a desk, head on hand",
    "clever":  "a happy clever child holding a book, lightbulb above the head",
    "funny":   "a child laughing hard, making a funny face",
    "happy":   "a child smiling big, both thumbs up, sunny background",
    "hot":     "a child fanning their face, tongue out, feeling hot in summer",
    "hungry":  "a child holding their stomach, looking at a sandwich, hungry",
    "sad":     "a child with a small frown, looking down sadly",
    "thirsty": "a child holding an empty glass, asking for water, thirsty look",
    "tired":   "a child yawning, eyes half closed, sleepy",

    # Unit 03 — Rooms + things in room + prepositions
    "bathroom":    "a clean bathroom with a bath, sink and toilet, bright tiles",
    "bedroom":     "a tidy children's bedroom with a single bed and desk, sunny",
    "dining room": "a small dining room with a table set for dinner, four chairs",
    "garden":      "a small home garden with grass, flowers and a tree",
    "hall":        "a small entrance hall with a coat hook and a front door",
    "kitchen":     "a bright small kitchen with cooker, fridge and a countertop",
    "living room": "a cozy living room with a sofa, TV and a small coffee table",
    "bed":         "a single neatly-made child's bed with a pillow and a blanket",
    "computer":    "a desktop computer with monitor, keyboard, mouse on a desk",
    "cupboard":    "a tall wooden kitchen cupboard with two doors closed",
    "desk":        "a child's study desk with a lamp, book and pencil",
    "lamp":        "a small reading lamp turned on, single object on a desk",
    "mirror":      "a round mirror hanging on a wall reflecting daylight",
    "shelf":       "a wooden wall shelf with three books and a small plant",
    "sofa":        "a comfortable grey sofa for three people in a living room",
    "TV":          "a flat-screen television on a low cabinet, switched off",
    "wardrobe":    "a tall wooden wardrobe with two doors closed, single object",
    "poster":      "a colorful sport poster on a bedroom wall",
    "in":          "a cat sitting INSIDE a cardboard box, only head visible",
    "on":          "a book lying ON TOP of a wooden table",
    "under":       "a soccer ball UNDER a wooden chair",
    "behind":      "a small dog peeking out BEHIND a door",
    "next to":     "a chair standing NEXT TO a desk, side by side",
}


def prompt_for(word):
    base = WORD_PROMPTS.get(word, f"a single {word}, simple clear composition")
    return f"{base}, {STYLE_SUFFIX}"


def url_for(word):
    p = prompt_for(word)
    # Deterministic seed from word so the same word always renders the
    # same image — browser cache stays warm across page loads.
    seed = int(hashlib.md5(word.encode()).hexdigest()[:6], 16) % 100000
    quoted = urllib.parse.quote(p, safe="")
    return (
        f"https://image.pollinations.ai/prompt/{quoted}"
        f"?width=512&height=512&seed={seed}&model=flux&nologo=true"
    )


def patch_unit(unit_num, force=False):
    p = ENRICHED / f"stage3_unit{unit_num:02d}_enriched.json"
    if not p.exists():
        print(f"  skip — {p.name} not found")
        return 0
    data = json.loads(p.read_text())
    patched = 0
    for u in data.get("units", []):
        for lesson in u.get("lessons", []):
            for step in lesson.get("steps", []):
                if step.get("type") not in ("vocabulary", "vocabulary_review"):
                    continue
                for item in step.get("items", []) or []:
                    if isinstance(item, dict) and item.get("word"):
                        if force or not item.get("image_url"):
                            item["image_url"] = url_for(item["word"])
                            patched += 1

        # Also patch game items: image_word_match, look_write, memory_game,
        # flashcard_match, listen_choose_picture, listen_choose_word reuse
        # vocab cards via {word, emoji, image_url}. Pack runs before
        # populate, so image_url is empty there; backfill now.
        for lesson in u.get("lessons", []):
            for step in lesson.get("steps", []):
                if step.get("type") not in ("vocab_games", "grammar_games"):
                    continue
                for g in step.get("games", []) or []:
                    for item in g.get("items", []) or []:
                        if isinstance(item, dict) and item.get("word") and not item.get("image_url"):
                            item["image_url"] = url_for(item["word"])
                            patched += 1
                        # distractors are nested
                        for d in (item.get("distractors") or []):
                            if isinstance(d, dict) and d.get("word") and not d.get("image_url"):
                                d["image_url"] = url_for(d["word"])
                                patched += 1
                        # 'options_full' in word_race etc.
                        for o in (item.get("options_full") or []):
                            if isinstance(o, dict) and o.get("word") and not o.get("image_url"):
                                o["image_url"] = url_for(o["word"])
                                patched += 1
    p.write_text(json.dumps(data, indent=2, ensure_ascii=False))
    print(f"  ✓ {p.name}: patched {patched} vocab image URLs")
    return patched


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--unit", type=int)
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--force", action="store_true")
    args = ap.parse_args()
    if args.all:
        total = 0
        for n in range(1, 21):
            total += patch_unit(n, args.force)
        print(f"Done. Total URLs set: {total}")
    elif args.unit is not None:
        patch_unit(args.unit, args.force)
    else:
        ap.error("Pass --unit NN or --all")


if __name__ == "__main__":
    main()
