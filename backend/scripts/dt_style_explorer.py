#!/usr/bin/env python3
"""
Style explorer: render the same 3 words in two alternative house styles
so Aga can choose before committing the whole Unit 3 batch.

Reference style for comparison: Pixar+GPT 3D (already in
~/Desktop/Stage3_PixarGPT_Sample/). This script generates:

  - Studio Ghibli watercolor   (soft hand-painted, Miyazaki aesthetic)
  - Disney 2D classic          (hand-drawn cel animation, bold outlines)

Three test words:
  - bedroom : multi-element scene
  - lamp    : single object hero
  - under   : abstract preposition (animate, scale-corrected)

Output:
  ~/Desktop/Stage3_Style_Explorer/
    ghibli_bedroom.png   disney_bedroom.png
    ghibli_lamp.png      disney_lamp.png
    ghibli_under.png     disney_under.png
"""
from __future__ import annotations
import base64
import hashlib
import json
import time
import urllib.request
from pathlib import Path

OUT = Path.home() / "Desktop" / "Stage3_Style_Explorer"
HOST = "http://localhost:7860"

WORDS = [
    (
        "bedroom",
        "ONE single neatly-made child's bed in the centre, with a soft "
        "pillow and a folded blanket. Behind the bed there is just a "
        "single tall window with white curtains and warm morning light. "
        "Plain pastel wall. Light wooden floor. NO posters, NO teddy "
        "bears, NO books, NO plants, NO other furniture."
    ),
    (
        "lamp",
        "ONE single beautiful reading lamp on a plain wooden desk, the "
        "lamp is ON and emits a warm glowing yellow light from under its "
        "fabric shade. Plain cream wall behind. NO other objects, NO "
        "books, NO papers, NO plants, NO posters."
    ),
    (
        "under",
        "ONE small grey tabby kitten — clearly much smaller than a single "
        "large wooden coffee table — curled up in the shaded gap "
        "UNDERNEATH the table. Side view at floor level. Plain pastel "
        "cream wall behind. NO other animals, NO furniture, NO clutter."
    ),
]

STYLES = {
    "ghibli": (
        "Studio Ghibli watercolor illustration style, hand-painted soft "
        "watercolor textures and visible brush strokes, organic gentle "
        "brushwork, Hayao Miyazaki aesthetic, warm pastel palette, "
        "painterly natural daylight, dreamy and serene atmosphere, "
        "gentle washes of color, like a frame from My Neighbor Totoro "
        "or Kiki's Delivery Service, traditional cel painting feel"
    ),
    "disney": (
        "classic 1990s Disney 2D hand-drawn cel animation style, bold "
        "confident ink outlines, flat color fills with subtle gradient "
        "shading, expressive simplified forms, Disney Renaissance "
        "aesthetic like Beauty and the Beast or Aladdin, warm storybook "
        "feel, traditional ink and gouache look, no 3D rendering, no "
        "photoreal shading"
    ),
}

NEGATIVE = (
    "hybrid creature, mixed animal, animal with wrong head, two-headed, "
    "extra characters, faces in posters, decorative artwork with figures, "
    "extra animals, secondary subjects, wrong scale, oversized subject, "
    "AI generated, AI art look, synthetic, plastic surface, over-rendered, "
    "glossy, oversaturated, uncanny valley, Midjourney style, generic "
    "Pinterest art, "
    "text, letters, words, watermark, logo, signature, captions, "
    "blurry, low quality, distorted, photorealistic, harsh shadows, "
    "scary, dark mood, deformed anatomy, broken hands, extra fingers, "
    "extra limbs, missing leg, three legs, wrong number of legs, "
    "cluttered background, jpeg artifacts"
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
    print(f"Style explorer → {OUT}\n")
    t_total = time.time()
    for style_name, style_text in STYLES.items():
        for word, detail in WORDS:
            slug = word.replace(" ", "_")
            out = OUT / f"{style_name}_{slug}.png"
            prompt = f"{detail}, {style_text}"
            seed = int(hashlib.md5(slug.encode()).hexdigest()[:8], 16) & 0x7FFFFFFF
            t0 = time.time()
            try:
                out.write_bytes(gen(prompt, NEGATIVE, seed))
                print(f"  ✓ {style_name}_{slug}.png ({time.time()-t0:.1f}s)")
            except Exception as e:
                print(f"  !! {style_name}_{slug} FAIL: {e}")
    print(f"\nDone in {time.time()-t_total:.0f}s. Compare {OUT} with Stage3_PixarGPT_Sample.")


if __name__ == "__main__":
    main()
