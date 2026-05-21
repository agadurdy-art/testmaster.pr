#!/usr/bin/env python3
"""
Preposition image readability test.

Aga 2026-05-21: "under ve next to gercekci durmuyor — kedi ve kopek cok
buyuk. ben image baktigimda under/next to anlamlarini almiyorum."

Problem with the first attempt was scale + camera angle. A kitten the
same height as a table is not "under" the table; a puppy as big as a
doghouse is not "next to" it. For a 5-year-old to read the spatial
concept on sight, the prompt must enforce:
  - dramatic size hierarchy (subject << container for "under")
  - clear visible gap / shadow line above the smaller subject
  - side-view camera so the layout reads instantly
  - no overlap of the two objects with framing edges

This script generates two variants per preposition (animate vs
inanimate subjects) so Aga can pick which framing reads best.

Run:
  backend/.venv/bin/python3 backend/scripts/dt_preposition_test.py
  → ~/Desktop/Stage3_Prepositions_Test/
"""
from __future__ import annotations
import base64
import hashlib
import json
import time
import urllib.request
from pathlib import Path

OUT = Path.home() / "Desktop" / "Stage3_Prepositions_Test"
HOST = "http://localhost:7860"

ITEMS = [
    # === UNDER ===
    (
        "under_A_kitten_table",
        # Aggressive scale + framing instructions
        "A SMALL grey kitten — clearly much smaller than a large wooden "
        "coffee table — curled up in the shaded gap UNDERNEATH the table. "
        "The big table top fills the upper third of the frame and casts a "
        "soft shadow on the kitten. The kitten is in the lower half, "
        "framed by the four table legs on either side. Side view camera "
        "at floor level so the kitten-under-table relationship is "
        "instantly readable. Empty wood floor below the kitten. Plain "
        "pastel cream wall behind. The kitten must NOT be on top of the "
        "table, NOT next to the table, NOT as tall as the table."
    ),
    (
        "under_B_ball_chair",
        # Simpler inanimate composition
        "A bright red soccer ball resting on the wooden floor UNDERNEATH "
        "a single wooden chair. The chair seat and back are clearly above "
        "the ball with visible empty space between them. Side view camera "
        "at floor level. The chair is the larger upper object, the ball "
        "is the smaller lower object, the gap above the ball is obvious. "
        "Plain pastel background. The ball is NOT on the chair seat, NOT "
        "next to the chair, NOT covered by the chair — it sits in the "
        "shadow under the seat."
    ),
    # === NEXT TO ===
    (
        "next_to_A_puppy_doghouse",
        # Two adjacent objects, equal eye level
        "A small brown puppy standing on grass right NEXT TO a small red "
        "wooden doghouse. The puppy is on the LEFT, the doghouse is on "
        "the RIGHT, both standing on the same patch of green grass at the "
        "SAME ground level, separated by a small clear gap. They are NOT "
        "overlapping, the puppy is NOT inside the doghouse, NOT on top, "
        "NOT behind. Both objects are roughly the same height in the "
        "frame. Side view camera so the side-by-side adjacency is the "
        "first thing the eye sees. Pastel blue sky background, soft "
        "daylight."
    ),
    (
        "next_to_B_apple_pear",
        # Simple inanimate side-by-side
        "A red apple sitting NEXT TO a green pear on a clean white "
        "wooden kitchen counter, both fruits placed side by side at the "
        "same level with a small visible gap between them. The apple is "
        "on the LEFT, the pear is on the RIGHT. Side view camera. They "
        "are NOT stacked, NOT overlapping, NOT one in front of the "
        "other — they are simply side by side. Soft pastel kitchen wall "
        "behind. Clean uncluttered composition."
    ),
]

STYLE = (
    "warm contemporary children's storybook illustration with a soft "
    "cel-shaded 3D feel, hand-painted brushwork visible in textures, "
    "gentle organic lines, cozy editorial color palette, Bluey + Sarah "
    "and Duck + Pixar Short Films aesthetic, natural soft daylight, "
    "painterly shading, feels hand-made by a real illustrator"
)

NEGATIVE = (
    "wrong scale, subject as large as container, oversized subject, "
    "subject on top, subject inside, subject behind, overlapping objects, "
    "ambiguous spatial relationship, "
    "AI generated, AI art look, synthetic, plastic surface, over-rendered, "
    "uncanny valley, stock illustration, Midjourney style, generic, "
    "text, letters, words, watermark, logo, signature, captions, "
    "blurry, low quality, distorted, photorealistic, harsh shadows, "
    "scary, dark mood, deformed anatomy, broken hands, extra fingers, "
    "multiple subjects, cluttered background"
)


def gen(prompt: str, negative: str, seed: int) -> bytes:
    payload = {
        "prompt": prompt,
        "negative_prompt": negative,
        "steps": 20,
        "width": 768,
        "height": 768,
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
    return base64.b64decode(resp["images"][0])


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    print(f"Preposition test → {OUT}\n")
    t_total = time.time()
    for i, (name, detail) in enumerate(ITEMS, 1):
        out = OUT / f"{i:02d}-{name}.png"
        prompt = f"{detail}, {STYLE}"
        seed = int(hashlib.md5(name.encode()).hexdigest()[:8], 16) & 0x7FFFFFFF
        t0 = time.time()
        try:
            out.write_bytes(gen(prompt, NEGATIVE, seed))
            print(f"  ✓ [{i}/{len(ITEMS)}] {name} ({time.time()-t0:.1f}s)")
        except Exception as e:
            print(f"  !! [{i}/{len(ITEMS)}] {name} FAIL: {e}")
    print(f"\nDone in {time.time()-t_total:.0f}s. Review {OUT}.")


if __name__ == "__main__":
    main()
