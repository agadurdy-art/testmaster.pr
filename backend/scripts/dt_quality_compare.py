#!/usr/bin/env python3
"""
Run the SAME word + SAME seed through 4 different DT quality profiles so
Aga can compare side-by-side which knob actually moves the needle.

Settings under test (FLUX 2 klein 4B f16):
  A baseline      : steps=20,  size=768,  guidance_embed=3.5, hires_fix=off
  B hires_fix     : steps=20,  size=768→1024 refine, hires_fix=on @ 0.7
  C guidance_up   : steps=20,  size=768,  guidance_embed=6.0, hires_fix=off
  D heavy         : steps=40,  size=1024, guidance_embed=5.0, hires_fix=on

Why these four and not more: each isolates one variable except "heavy"
which stacks. Same seed = differences are purely setting-driven.
"""
from __future__ import annotations
import base64
import hashlib
import json
import time
import urllib.request
from pathlib import Path

OUT = Path.home() / "Desktop" / "Stage3_Quality_Compare"
HOST = "http://localhost:7860"

WORD = "bedroom"
DETAIL = (
    "a cozy children's bedroom interior, single neatly-made bed with a "
    "soft blanket and a stuffed teddy bear on the pillow, small wooden "
    "desk with a glowing reading lamp and an open book, a window with "
    "white curtains, warm morning sunlight streaming in casting soft "
    "shadows, pastel blue and cream walls, wooden floor, hero wide-angle "
    "composition"
)

STYLE = (
    "warm contemporary children's storybook illustration with a soft "
    "cel-shaded 3D feel, hand-painted brushwork visible in textures, "
    "gentle organic lines, cozy editorial color palette, Bluey + Sarah "
    "and Duck + Pixar Short Films aesthetic, natural soft daylight, "
    "painterly shading, feels hand-made by a real illustrator"
)

NEGATIVE = (
    "AI generated, AI art look, synthetic, plastic surface, over-rendered, "
    "glossy, oversaturated, uncanny valley, stock illustration, Midjourney "
    "style, generic Pinterest art, "
    "text, letters, words, watermark, logo, signature, captions, "
    "blurry, low quality, distorted, photorealistic, harsh shadows, "
    "scary, dark mood, deformed anatomy, broken hands, extra fingers, "
    "extra limbs, missing leg, three legs, wrong number of legs, "
    "cluttered background, jpeg artifacts"
)

PROFILES = [
    ("A_baseline",     {"steps": 20, "width": 768,  "height": 768,  "guidance_embed": 3.5, "hires_fix": False}),
    ("B_hires_fix",    {"steps": 20, "width": 768,  "height": 768,  "guidance_embed": 3.5, "hires_fix": True,  "hires_fix_width": 1024, "hires_fix_height": 1024, "hires_fix_strength": 0.7}),
    ("C_guidance_up",  {"steps": 20, "width": 768,  "height": 768,  "guidance_embed": 6.0, "hires_fix": False}),
    ("D_heavy",        {"steps": 40, "width": 1024, "height": 1024, "guidance_embed": 5.0, "hires_fix": True,  "hires_fix_width": 1280, "hires_fix_height": 1280, "hires_fix_strength": 0.6}),
]


def gen(prompt: str, negative: str, seed: int, extra: dict) -> bytes:
    payload = {
        "prompt": prompt,
        "negative_prompt": negative,
        "seed": seed,
        "n_iter": 1,
        "batch_size": 1,
        **extra,
    }
    req = urllib.request.Request(
        f"{HOST}/sdapi/v1/txt2img",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=300) as r:
        resp = json.load(r)
    return base64.b64decode(resp["images"][0])


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    print(f"Quality compare → {OUT}\n")
    seed = int(hashlib.md5(WORD.encode()).hexdigest()[:8], 16) & 0x7FFFFFFF
    prompt = f"{DETAIL}, {STYLE}"
    t_total = time.time()
    for label, settings in PROFILES:
        out = OUT / f"{label}_{WORD}.png"
        t0 = time.time()
        try:
            out.write_bytes(gen(prompt, NEGATIVE, seed, settings))
            print(f"  ✓ {label}: {time.time()-t0:.1f}s  →  {out.name}")
        except Exception as e:
            print(f"  !! {label} FAIL: {e}")
    print(f"\nDone in {time.time()-t_total:.0f}s. Open {OUT} and compare A vs B vs C vs D.")


if __name__ == "__main__":
    main()
