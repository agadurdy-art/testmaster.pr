#!/usr/bin/env python3
"""
Pixar + GPT-image-style sample test.

Lesson from the previous round: FLUX 2 [klein] 4B silently fabricates
hybrid creatures (duck-child head on a poster) when the prompt loads
the frame with many decorative elements (posters, plants, teddy bears,
books). For a vocab card a single dominant subject on a clean background
is BOTH easier for FLUX to render correctly AND more pedagogically
readable.

This sample sweeps 5 words at the new style baseline:
  - subject ONE, big, centered, with explicit "no other characters"
  - background MINIMAL, plain pastel, no posters/plants/books
  - style: Disney-Pixar 3D animation + soft cinematic studio render
  - aggressive anti-hybrid negative

Run:
  backend/.venv/bin/python3 backend/scripts/dt_pixar_gpt_sample.py
  → ~/Desktop/Stage3_PixarGPT_Sample/
"""
from __future__ import annotations
import base64
import hashlib
import json
import time
import urllib.request
from pathlib import Path

OUT = Path.home() / "Desktop" / "Stage3_PixarGPT_Sample"
HOST = "http://localhost:7860"

# 5 words: 2 single objects (easy for FLUX), 1 scene (hard), 2 prepositions
WORDS = [
    (
        "bedroom",
        "ONE single neatly-made child's bed in the centre of the room, with "
        "a soft pillow and a folded blanket. Behind the bed there is just a "
        "single tall window with white curtains letting in warm morning "
        "light. Plain pastel wall. Light wooden floor. NO posters on the "
        "wall, NO teddy bears, NO books, NO plants, NO other furniture. "
        "The bed is the clear single hero of the frame."
    ),
    (
        "lamp",
        "ONE single beautiful reading lamp standing on a plain wooden desk, "
        "the lamp is switched ON and emits a warm glowing yellow light from "
        "under its fabric shade. The lamp fills most of the frame as the "
        "clear single hero subject. Behind the desk is a plain soft cream "
        "wall. NO other objects on the desk, NO books, NO papers, NO plants, "
        "NO posters."
    ),
    (
        "shelf",
        "ONE single wooden wall shelf mounted on a plain pastel blue wall. "
        "On the shelf sit just THREE colorful children's storybooks "
        "standing upright side by side. The shelf is the clear single hero "
        "subject filling the centre of the frame. NO plants, NO toys, NO "
        "extra objects, NO posters, NO other shelves, NO other furniture."
    ),
    (
        "under",
        "ONE small grey tabby kitten — clearly much smaller than a single "
        "large wooden coffee table — curled up in the shaded gap "
        "UNDERNEATH the table. The table top fills the upper third of the "
        "frame; the kitten sits in the lower half, framed by the four "
        "table legs. Side view at floor level. Plain pastel cream wall "
        "behind. NO other animals, NO other furniture, NO toys, NO posters."
    ),
    (
        "next to",
        "ONE small brown puppy standing on grass right NEXT TO one small "
        "red wooden doghouse. Puppy on the LEFT, doghouse on the RIGHT, "
        "same ground level, small clear gap between them. Both roughly the "
        "same height in the frame. Side view. Pastel blue sky behind. NO "
        "other animals, NO trees, NO fences, NO other buildings, NO clutter."
    ),
]

STYLE = (
    "modern Disney-Pixar 3D animation render style, polished educational "
    "children's illustration, soft Pixar cinematic studio lighting, "
    "rounded friendly forms, clean bold composition with ONE dominant "
    "subject, bright clean color palette, gentle soft drop shadow, smooth "
    "professional studio render, looks like a frame from a modern Pixar "
    "short film aimed at preschoolers"
)

# Aggressive anti-hybrid + anti-clutter negative — the duck-child poster
# incident showed FLUX will hallucinate creatures inside decorative
# elements, so we explicitly forbid both.
NEGATIVE = (
    "hybrid creature, mixed animal, animal with wrong head, child-headed "
    "duck, two-headed, three-headed, extra heads, extra characters, "
    "background characters, faces in posters, faces in pictures, "
    "decorative posters with figures, decorative artwork on walls, "
    "extra animals, secondary subjects, "
    "wrong scale, oversized subject, undersized subject, "
    "AI generated, AI art look, synthetic, plastic surface, over-rendered, "
    "glossy, oversaturated, uncanny valley, stock illustration, "
    "Midjourney style, generic Pinterest art, "
    "text, letters, words, watermark, logo, signature, captions, "
    "blurry, low quality, distorted, photorealistic, harsh shadows, "
    "scary, dark mood, deformed anatomy, broken hands, extra fingers, "
    "extra limbs, missing leg, three legs, wrong number of legs, "
    "cluttered background, busy scene, jpeg artifacts"
)


def gen(prompt: str, negative: str, seed: int) -> bytes:
    payload = {
        "prompt": prompt,
        "negative_prompt": negative,
        "steps": 30,
        "width": 1024,
        "height": 1024,
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
    with urllib.request.urlopen(req, timeout=300) as r:
        resp = json.load(r)
    return base64.b64decode(resp["images"][0])


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    print(f"Pixar+GPT style sample → {OUT}")
    print("Settings: steps=30, size=1024, anti-hybrid negative, single-subject prompts\n")

    t_total = time.time()
    for i, (word, detail) in enumerate(WORDS, 1):
        slug = word.replace(" ", "_")
        out = OUT / f"{i:02d}-{slug}.png"
        prompt = f"{detail}, {STYLE}"
        seed = int(hashlib.md5(slug.encode()).hexdigest()[:8], 16) & 0x7FFFFFFF
        t0 = time.time()
        try:
            out.write_bytes(gen(prompt, NEGATIVE, seed))
            print(f"  ✓ [{i}/{len(WORDS)}] {slug}.png ({time.time()-t0:.1f}s)")
        except Exception as e:
            print(f"  !! [{i}/{len(WORDS)}] {slug} FAIL: {e}")
    print(f"\nDone in {time.time()-t_total:.0f}s. Review {OUT}.")


if __name__ == "__main__":
    main()
