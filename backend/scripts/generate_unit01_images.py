#!/usr/bin/env python3
"""
Generate Stage 3 Unit 1 vocab images via OpenAI gpt-image-1 API.

One-shot pilot script. Stage 3-8 batch production will use a different
pipeline; this script is for the Unit 1 v2 pilot only.

Run from project root:
    python3 backend/scripts/generate_unit01_images.py
"""

import base64
import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

API_KEY = os.environ.get("OPENAI_API_KEY")
API_URL = "https://api.openai.com/v1/images/generations"
MODEL = "gpt-image-1"
SIZE = "1024x1024"  # gpt-image-1 minimum
QUALITY = "low"     # cheapest tier — ~$0.011/image at low

STYLE_RULE = (
    "Cartoon flat illustration, bright friendly colors, kid-friendly, "
    "soft shading, white or very light cream background, no text or letters, "
    "no logos, simple clear composition for a vocabulary card."
)

VOCAB_PROMPTS = {
    "age": "A small birthday cake with the candle in the shape of a question mark, "
           "to show the concept of age. " + STYLE_RULE,
    "live": "A friendly cartoon family inside a cozy home, looking out from a "
            "window with hearts above the roof — the concept of 'to live in a place'. "
            + STYLE_RULE,
    "address": "A cartoon letter envelope with a clear visible address line "
               "(no readable text, just lines showing it's an address). " + STYLE_RULE,
    "born": "A cartoon baby in a soft blanket with a stork flying above carrying "
            "a small bundle — the concept of being born. " + STYLE_RULE,
    "be_called": "A friendly cartoon kid pointing at a name tag on their chest, "
                 "the name tag is blank to represent 'I am called [name]'. " + STYLE_RULE,
    "country": "A cartoon map of a generic country with a small flag on top, "
               "rolling hills and a sun in the background. " + STYLE_RULE,
    "city": "A bright cartoon skyline of a busy modern city with skyscrapers, "
            "a few small clouds and warm sunshine. " + STYLE_RULE,
    "town": "A cartoon small town with a few houses, one short street, "
            "a small clock tower, and trees. " + STYLE_RULE,
    "village": "A cartoon tiny village in the countryside with three small houses, "
               "green fields, a winding path and a friendly cow. " + STYLE_RULE,
    "aunt": "A friendly cartoon adult woman in casual clothes, smiling and waving — "
            "representing an aunt. Warm Asian features but ambiguous so kids relate. "
            + STYLE_RULE,
    "uncle": "A friendly cartoon adult man in casual clothes, smiling and giving "
             "a thumbs up — representing an uncle. " + STYLE_RULE,
    "parent": "A cartoon mom and dad standing together holding hands, smiling. "
              + STYLE_RULE,
    "grown_up": "A friendly cartoon adult next to a smaller child, the adult is "
                "taller and wearing work clothes — representing a grown-up. "
                + STYLE_RULE,
    "say": "A cartoon child with a speech bubble that has a small smiley face "
           "inside — the concept of 'to say'. " + STYLE_RULE,
    "tell": "Two cartoon kids facing each other, one is gesturing while speaking, "
            "the other is listening with attention — the concept of 'to tell'. "
            + STYLE_RULE,
}


def gen_image(prompt: str) -> bytes:
    payload = {
        "model": MODEL,
        "prompt": prompt,
        "size": SIZE,
        "quality": QUALITY,
        "n": 1,
        "output_format": "png",
    }
    body = json.dumps(payload).encode("utf-8")
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }
    for attempt in range(3):
        try:
            req = urllib.request.Request(API_URL, data=body, headers=headers, method="POST")
            with urllib.request.urlopen(req, timeout=120) as resp:
                data = json.loads(resp.read())
                b64 = data["data"][0]["b64_json"]
                return base64.b64decode(b64)
        except urllib.error.HTTPError as exc:
            err_body = exc.read().decode("utf-8", "replace")[:400]
            print(f"    [{exc.code}] {err_body}", file=sys.stderr)
            if exc.code in (429, 500, 502, 503, 504) and attempt < 2:
                time.sleep(3 * (attempt + 1))
                continue
            raise
        except urllib.error.URLError as exc:
            print(f"    network error: {exc}", file=sys.stderr)
            if attempt < 2:
                time.sleep(3 * (attempt + 1))
                continue
            raise
    raise RuntimeError("Image generation failed after retries")


def main():
    if not API_KEY:
        print("ERROR: OPENAI_API_KEY env var not set.", file=sys.stderr)
        sys.exit(1)

    repo_root = Path(__file__).resolve().parent.parent.parent
    out_dir = repo_root / "backend" / "static" / "vocab_images" / "stage3"
    out_dir.mkdir(parents=True, exist_ok=True)

    total = len(VOCAB_PROMPTS)
    done = 0
    skipped = 0
    failed = []
    for word, prompt in VOCAB_PROMPTS.items():
        out_path = out_dir / f"{word}.png"
        if out_path.exists() and out_path.stat().st_size > 0:
            print(f"[skip] {word}.png exists ({out_path.stat().st_size // 1024} KB)")
            skipped += 1
            continue
        print(f"[{done + 1}/{total}] {word}: generating...")
        try:
            png = gen_image(prompt)
            out_path.write_bytes(png)
            size_kb = out_path.stat().st_size / 1024
            print(f"  ✓ saved {out_path.name} ({size_kb:.0f} KB)")
            done += 1
            time.sleep(0.3)
        except Exception as exc:
            print(f"  ✗ {word} failed: {exc}", file=sys.stderr)
            failed.append(word)

    print()
    print(f"Generated: {done}, skipped existing: {skipped}, failed: {len(failed)}")
    if failed:
        print("Failed words:", ", ".join(failed))


if __name__ == "__main__":
    main()
