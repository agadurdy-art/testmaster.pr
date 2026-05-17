#!/usr/bin/env python3
"""
Free image generation via Pollinations.ai (Flux Schnell backend).
No API key, no cost, just GET requests.

Usage:
    python3 backend/scripts/generate_images_pollinations.py --unit 02 --style photoreal

Default style is "photoreal" (photo-realistic, soft natural lighting).
Pass `--style cartoon` for kid-friendly cartoon style.
"""

import argparse
import hashlib
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent.parent

POLLINATIONS_URL = "https://image.pollinations.ai/prompt/{prompt}?width=1024&height=1024&nologo=true&model=flux&seed={seed}"

STYLE_RULES = {
    "photoreal": (
        "photograph, photo-realistic, soft natural lighting, shallow depth of field, "
        "warm tones, sharp focus on subject, vibrant but natural colours, "
        "clean uncluttered background, family-friendly, no text, no watermark, "
        "no logos, square composition"
    ),
    "cartoon": (
        "cartoon flat illustration, bright friendly colors, kid-friendly, "
        "soft shading, white or very light cream background, no text or letters, "
        "no logos, simple clear composition for a vocabulary card"
    ),
}

UNIT_PROMPTS = {
    "02": {
        # Lesson 1 — extended family
        "grandparent": "two friendly elderly Vietnamese grandparents (grandfather and grandmother) standing side by side outdoors near a small house, warm smile, three-quarter portrait, soft afternoon light",
        "grandfather": "a kind elderly Vietnamese man with thin grey hair and gentle smile, head-and-shoulders portrait, friendly eyes, traditional simple clothing, soft natural light",
        "grandmother": "a kind elderly Vietnamese woman with short grey hair and a warm smile, head-and-shoulders portrait, ao ba ba shirt, soft natural light",
        "son": "a happy 9-year-old boy in casual school clothes, head-and-shoulders portrait, looking at the camera with a small smile, neutral background",
        "daughter": "a happy 9-year-old girl in casual school clothes, head-and-shoulders portrait, looking at the camera with a bright smile, neutral background",
        "grandson": "a smiling 8-year-old boy hugging his elderly grandfather, both looking happy, family portrait, soft natural light",
        "granddaughter": "a smiling 8-year-old girl hugging her elderly grandmother, both looking happy, family portrait, soft natural light",
        "cousin": "two cheerful 9-year-old cousins standing together in a park, casual clothes, both smiling, three-quarter portrait, soft sunlight",
        "twin": "two identical 8-year-old twin boys standing side by side wearing the same outfit, smiling at the camera, clearly matching faces, neutral background",
        # Lesson 2 — descriptions
        "tall": "a tall slim young teenage boy standing next to a shorter friend for comparison, both smiling, natural setting, height clearly visible",
        "short": "a short young child standing next to a taller adult to show height comparison, both smiling, natural setting",
        "young": "a young happy child around 5 years old playing outside, candid moment, soft daylight",
        "old": "an elderly grandfather with kind eyes and gentle expression, portrait, deep wrinkles showing age, warm lighting",
        "blonde": "a portrait of a young girl with bright blonde curly hair, soft natural lighting, focused on her hair, neutral background",
        "curly": "a close-up portrait of a young child with very curly hair, soft natural light, focus on hair texture, neutral background",
        "fair": "a close-up portrait of a young girl with very fair pale skin and light hair, soft natural daylight, gentle expression",
        "thin": "a slim young boy in casual clothes standing for a portrait, side-on so build is visible, natural light, neutral background",
        "fat": "a friendly chubby young cat sitting on a windowsill, close-up portrait, soft daylight, no people, cute composition",
        # Lesson 3 — face features
        "moustache": "a close-up portrait of a friendly young Vietnamese man with a neat thin moustache, soft natural light, focus on his face, kind smile",
        "beard": "a close-up portrait of a friendly older man with a short well-kept grey beard, gentle smile, soft natural light, focus on his face",
        "hair": "a close-up of long dark hair flowing on a young woman, soft natural light, focus on hair only, side profile, no face",
        "eyes": "an extreme close-up of a child's bright brown eyes looking at the camera, soft natural daylight, sharp focus on the eyes only",
        "smile": "a close-up portrait of a young child showing a wide happy smile with bright teeth, soft natural daylight, focus on the mouth and smile",
        "photo": "a close-up of two hands holding a printed family photograph, soft natural light, the photo shows a happy family group, focus on the photograph itself",
        "look_like": "a side-by-side portrait of a young 9-year-old daughter and her mother showing clear facial resemblance, both smiling, soft natural light",
        "kind": "a close-up portrait of a smiling Vietnamese grandmother with a very warm and kind expression, soft natural light, gentle eyes, neutral background",
    },
}


def safe_seed(word: str) -> int:
    """Stable seed per word so re-runs give the same image."""
    h = hashlib.sha256(word.encode("utf-8")).hexdigest()
    return int(h[:8], 16) % 999983


def gen_one(prompt_text: str, out_path: Path, seed: int) -> bool:
    prompt_enc = urllib.parse.quote(prompt_text, safe="")
    url = POLLINATIONS_URL.format(prompt=prompt_enc, seed=seed)
    req = urllib.request.Request(url, headers={"User-Agent": "TestMaster/1.0"})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=120) as resp:
                data = resp.read()
                if not data or len(data) < 1024:
                    raise RuntimeError(f"response too small ({len(data)} bytes)")
                out_path.write_bytes(data)
                return True
        except urllib.error.HTTPError as exc:
            print(f"    [{exc.code}] {exc.reason}", file=sys.stderr)
            if exc.code in (429, 500, 502, 503, 504) and attempt < 2:
                time.sleep(5 * (attempt + 1))
                continue
            return False
        except (urllib.error.URLError, RuntimeError) as exc:
            print(f"    network/empty: {exc}", file=sys.stderr)
            if attempt < 2:
                time.sleep(5 * (attempt + 1))
                continue
            return False
    return False


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--unit", default="02", help="Unit number (02, 03, ...)")
    parser.add_argument("--style", default="photoreal", choices=list(STYLE_RULES.keys()))
    parser.add_argument("--out-dir", default=None)
    parser.add_argument("--only", default=None, help="Comma-separated words to (re)generate")
    parser.add_argument("--force", action="store_true", help="Overwrite existing files")
    args = parser.parse_args()

    style_rule = STYLE_RULES[args.style]
    prompts = UNIT_PROMPTS.get(args.unit)
    if not prompts:
        print(f"ERROR: no prompts defined for unit {args.unit}", file=sys.stderr)
        sys.exit(1)

    out_dir = Path(args.out_dir) if args.out_dir else (REPO_ROOT / "backend" / "static" / "vocab_images" / "stage3")
    out_dir.mkdir(parents=True, exist_ok=True)

    only = set()
    if args.only:
        only = {w.strip().lower() for w in args.only.split(",")}

    total = len(prompts) if not only else len(only)
    done = 0
    failed = []
    skipped = 0
    for word, core_prompt in prompts.items():
        if only and word.lower() not in only:
            continue
        out_path = out_dir / f"{word}.png"
        if out_path.exists() and not args.force and out_path.stat().st_size > 1024:
            print(f"[skip] {word}.png already exists ({out_path.stat().st_size // 1024} KB)")
            skipped += 1
            continue

        full_prompt = f"{core_prompt}. {style_rule}"
        seed = safe_seed(word)
        print(f"[{done + 1}/{total - skipped}] {word}: generating...")
        ok = gen_one(full_prompt, out_path, seed)
        if ok:
            size_kb = out_path.stat().st_size / 1024
            print(f"  ✓ saved {out_path.name} ({size_kb:.0f} KB)")
            done += 1
        else:
            failed.append(word)
            print(f"  ✗ {word} failed", file=sys.stderr)
        time.sleep(1.5)  # gentle on Pollinations rate limits

    print()
    print(f"Generated: {done}, skipped existing: {skipped}, failed: {len(failed)}")
    if failed:
        print("Failed words:", ", ".join(failed))


if __name__ == "__main__":
    main()
