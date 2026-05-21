#!/usr/bin/env python3
"""
Quality sample test for Draw Things vocab image gen.

Aga 2026-05-21: standard 4-step / 512px / generic prompt images "fena
degil ama daha cok pixar style". The pipeline is so fast (~4s/image)
that there's headroom to spend on quality. This script generates 5
deliberately-tested words with:

  - hand-crafted per-word prompts that nail the educational meaning
  - higher inference steps (20 vs the default 4) for crisper render
  - larger output (768 vs 512) for clearer detail
  - strong negative prompt (no text, no broken anatomy, no scary,
    no photoreal blur)
  - generous Pixar-style anchors (Renderman, subsurface scattering,
    studio lighting, hero shot)

The 5 words are chosen to stress-test the pipeline:
  - bedroom : richer scene, multiple objects
  - lamp    : single object glow + atmosphere
  - shelf   : detailed surface + props
  - under   : abstract preposition — must convey spatial relation
  - next to : abstract preposition — must convey adjacency

Run:
  backend/.venv/bin/python3 backend/scripts/dt_quality_sample.py
  → ~/Desktop/Stage3_Unit3_Quality_Sample/
"""
from __future__ import annotations
import base64
import hashlib
import json
import sys
import time
import urllib.request
from pathlib import Path

OUT = Path.home() / "Desktop" / "Stage3_Unit3_Quality_Sample"
HOST = "http://localhost:7860"

# Per-word, hand-crafted prompts. Each one is built to make the word's
# meaning visually unambiguous (especially the prepositions).
WORDS = [
    (
        "bedroom",
        "a cozy children's bedroom interior, single neatly-made bed with a "
        "soft blanket and a stuffed teddy bear on the pillow, small wooden "
        "desk with a glowing reading lamp and an open book, a window with "
        "white curtains, warm morning sunlight streaming in casting soft "
        "shadows, pastel blue and cream walls, wooden floor, hero wide-angle "
        "composition"
    ),
    (
        "lamp",
        "a single beautiful reading lamp on a polished wooden desk, the lamp "
        "is switched ON and emitting a warm glowing yellow light that pools "
        "softly onto the desk surface, fabric lampshade with subtle texture, "
        "shallow depth of field, hero studio shot of the lamp as the clear "
        "single subject, dark cream background to make the glow pop"
    ),
    (
        "shelf",
        "a wooden wall shelf mounted on a pastel-blue wall, on the shelf sit "
        "three colorful children's storybooks standing upright, a small "
        "potted green plant, and a tiny toy car, soft daylight from the side, "
        "the shelf is the clear single subject filling the frame, slight "
        "wood grain texture visible"
    ),
    (
        "under",
        "a cute round orange tabby kitten sitting UNDER a small wooden table, "
        "the whole kitten clearly visible in the space below the table top, "
        "the table legs framing the kitten on both sides, big wide friendly "
        "eyes looking at the viewer, the spatial relationship UNDER must be "
        "instantly obvious to a 5-year-old, plain pastel background, no "
        "objects on top of the table to keep the composition clean"
    ),
    (
        "next to",
        "a friendly cartoon brown puppy standing NEXT TO a small red "
        "doghouse, the puppy and the doghouse are side by side at the same "
        "ground level with a small visible gap between them, both subjects "
        "centered and equally sized in the frame, demonstrating the spatial "
        "concept of adjacency NEXT TO, soft grass under both, pastel sky "
        "background, clear and uncluttered composition"
    ),
]

STYLE = (
    "warm contemporary children's storybook illustration with a soft "
    "cel-shaded 3D feel, hand-painted brushwork visible in textures, "
    "gentle organic lines, cozy editorial color palette, Bluey + Sarah "
    "and Duck + Pixar Short Films aesthetic, kind expressive subject, "
    "natural soft daylight, gentle painterly shading, clear focused "
    "composition with a single subject and simple uncluttered background, "
    "feels hand-made by a real illustrator"
)

NEGATIVE = (
    "AI generated, AI art look, generic AI illustration, synthetic, "
    "plastic surface, over-rendered, glossy, oversaturated, uncanny valley, "
    "stock illustration, sterile, lifeless, perfect symmetry, CGI demo, "
    "Midjourney style, generic Pinterest art, "
    "text, letters, words, watermark, logo, signature, signs, captions, "
    "blurry, low quality, distorted, photorealistic, harsh shadows, scary, "
    "dark mood, ugly faces, deformed anatomy, broken hands, extra fingers, "
    "extra limbs, multiple subjects, cluttered background, jpeg artifacts"
)


def gen(prompt: str, negative: str, seed: int, steps: int, size: int) -> bytes:
    payload = {
        "prompt": prompt,
        "negative_prompt": negative,
        "steps": steps,
        "width": size,
        "height": size,
        "seed": seed,
        "n_iter": 1,
        "batch_size": 1,
    }
    req = urllib.request.Request(
        f"{HOST}/sdapi/v1/txt2img",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=240) as r:
        resp = json.load(r)
    imgs = resp.get("images") or []
    if not imgs:
        raise RuntimeError(f"empty images[] from DT: {str(resp)[:200]}")
    return base64.b64decode(imgs[0])


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    print(f"Quality sample → {OUT}")
    print("Settings: steps=20, size=768, negative prompt ON, hand-crafted per-word prompts\n")

    t_total = time.time()
    for i, (word, detail) in enumerate(WORDS, 1):
        slug = word.replace(" ", "_")
        out = OUT / f"{i:02d}-{slug}.png"
        prompt = f"{detail}, {STYLE}"
        seed = int(hashlib.md5(slug.encode()).hexdigest()[:8], 16) & 0x7FFFFFFF
        t0 = time.time()
        try:
            png = gen(prompt, NEGATIVE, seed, steps=20, size=768)
            out.write_bytes(png)
            print(f"  ✓ [{i}/{len(WORDS)}] {slug}.png ({time.time()-t0:.1f}s)")
        except Exception as e:
            print(f"  !! [{i}/{len(WORDS)}] {slug} FAIL: {e}")
    print(f"\nDone in {time.time()-t_total:.0f}s. Review {OUT}.")


if __name__ == "__main__":
    main()
