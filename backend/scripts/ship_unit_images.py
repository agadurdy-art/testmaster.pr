#!/usr/bin/env python3
"""
End-to-end vocab image pipeline for Stage 3+ units. One command,
zero manual labor:

    python3 backend/scripts/ship_unit_images.py --unit 02

It:
  1. reads backend/content/enriched/stage3_unit<NN>_enriched.json
     and collects every unique vocab-step word in that unit
  2. expands each word into a child-friendly FLUX prompt (from the
     shared WORD_PROMPTS dict — extend it as new units ship)
  3. calls `mflux-generate` (Apple Silicon-native FLUX, free,
     local) once per missing image — outputs to a temp folder
  4. uploads the new PNGs to R2 as vocab/<slug>.png
  5. rewrites every image_url ref inside the unit's enriched JSON
     to point at the R2 URL
  6. pings api.testmaster.pro to re-merge so the live DB picks up
     the new pictures immediately

Setup once:
    source backend/.venv/bin/activate
    pip install mflux
    huggingface-cli login   # accept FLUX terms on HF first

Then for any unit you ship:
    python3 backend/scripts/ship_unit_images.py --unit 02

Default model is FLUX.1-dev at full bf16 precision (48 GB RAM is
plenty). Override with --model schnell for faster but slightly
less polished output.
"""

import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import urllib.request
from pathlib import Path


def _mflux_bin() -> str:
    """Resolve mflux-generate CLI. When invoked via `backend/.venv/bin/python3
    backend/scripts/ship_unit_images.py`, the venv's bin/ is NOT on PATH for
    the subprocess. Look it up next to the running interpreter first."""
    cand = Path(sys.executable).parent / "mflux-generate"
    if cand.exists():
        return str(cand)
    found = shutil.which("mflux-generate")
    if found:
        return found
    sys.exit(
        "mflux-generate not found. Install with:\n"
        f"  {sys.executable} -m pip install mflux"
    )

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
ENRICHED = REPO_ROOT / "backend" / "content" / "enriched"

R2_PUBLIC_BASE = "https://pub-fcd31e7869f94c4896d039253b8f1646.r2.dev"
R2_PREFIX = "vocab"
API_BASE = "https://api.testmaster.pro"

STYLE_SUFFIX = (
    # LOCKED 2026-05-21 — see memory/project_vocab_image_style.md
    "modern Disney-Pixar 3D animation render style, polished educational "
    "children's illustration, soft Pixar cinematic studio lighting, rounded "
    "friendly forms, clean bold composition with ONE dominant subject, "
    "bright clean color palette, gentle soft drop shadow, smooth professional "
    "studio render, looks like a frame from a modern Pixar short film aimed "
    "at preschoolers"
)

# Locked negative prompt baseline. dt_gen_unit_images.py imports this so
# any update here propagates to every batch.
NEGATIVE_SUFFIX = (
    "hybrid creature, mixed animal, animal with wrong head, child-headed "
    "duck, two-headed, three-headed, extra heads, extra characters, "
    "background characters, faces in posters, faces in pictures, "
    "decorative posters with figures, decorative artwork on walls, "
    "extra animals, secondary subjects, wrong scale, oversized subject, "
    "undersized subject, "
    "AI generated, AI art look, generic AI illustration, synthetic, "
    "plastic surface, over-rendered, glossy, oversaturated, uncanny valley, "
    "stock illustration, sterile, lifeless, perfect symmetry, Midjourney "
    "style, generic Pinterest art, "
    "text, letters, words, watermark, logo, signature, signs, captions, "
    "blurry, low quality, distorted, photorealistic, harsh shadows, scary, "
    "dark mood, ugly faces, deformed anatomy, broken hands, extra fingers, "
    "extra limbs, missing leg, three legs, wrong number of legs, "
    "cluttered background, busy scene, jpeg artifacts"
)

# Per-word descriptive prompts. Anything not listed falls back to
# "a single <word>, single subject" which FLUX usually handles fine.
# Extend this dict as new units ship — keep the gender + context
# anchors explicit so FLUX doesn't drift (e.g. "rubber eraser, not
# tire", "watch wristwatch, not the verb").
WORD_PROMPTS = {
    # Stage 3 Unit 02 — Family + feelings
    "mum":      "a happy young WOMAN, female mother in her 30s with long hair, smiling, holding a coffee cup, head-and-shoulders portrait, plain background",
    "dad":      "a happy MAN, male father in his 30s with short hair and small stubble, smiling, head-and-shoulders portrait, plain background",
    "mother":   "a smiling young WOMAN, female mother, long hair, casual clothes, head-and-shoulders portrait, plain background",
    "father":   "a smiling young MAN, male father, short hair, casual shirt, head-and-shoulders portrait, plain background",
    "brother":  "a smiling BOY aged 9, male child, school clothes, brown hair, head-and-shoulders portrait, plain background",
    "sister":   "a smiling GIRL aged 9, female child, school clothes, long hair, head-and-shoulders portrait, plain background",
    "husband":  "a young MAN in a wedding suit holding hands with his wife who is a WOMAN in a dress, the man on the LEFT looking at the camera and smiling",
    "wife":     "a young WOMAN in a wedding dress holding hands with her husband who is a MAN in a suit, the woman on the RIGHT looking at the camera and smiling",
    "son":      "a smiling BOY aged 10, male child, plain background, head-and-shoulders portrait",
    "daughter": "a smiling GIRL aged 10, female child, plain background, head-and-shoulders portrait",
    "baby":     "a happy human BABY smiling, baby clothes, plain background",
    "parents":  "a MOTHER and FATHER standing together — one woman with long hair on the LEFT and one man with short hair on the RIGHT, both smiling, head-and-shoulders",
    "children": "three smiling children standing together — two boys and one girl, school clothes, ages 8-10",
    "family":   "a happy family of four — a mother woman, a father man, a son boy 10 and a daughter girl 8 — all smiling at the camera",
    "bored":    "a child looking bored, leaning on a desk with head on hand, droopy eyes",
    "clever":   "a happy clever child holding a book, lightbulb above the head",
    "funny":    "a child laughing hard, making a funny face, big smile",
    "happy":    "a child smiling big, both thumbs up, sunny background",
    "hot":      "a child fanning their face, tongue out, sweat drops, feeling hot in summer",
    "hungry":   "a child holding their stomach, looking at a sandwich, hungry",
    "sad":      "a child with a small frown, looking down sadly, single tear on cheek",
    "thirsty":  "a child holding an empty glass, asking for water, thirsty look",
    "tired":    "a child yawning, eyes half closed, sleepy",

    # Stage 3 Unit 03 — Rooms + things + prepositions
    # All revised 2026-05-21 after Aga reviewed initial set: rooms get
    # scene composition, single objects get hero shots, prepositions use
    # a consistent animate character (kitten/puppy) at correct scale so
    # the spatial concept reads at a glance. Furniture prompts spell out
    # leg/door counts so FLUX doesn't drift (3-legged chair = unusable).
    "bathroom":    "a cozy children's bathroom interior with a clean white bathtub, a wooden stool, a small sink with a mirror, and a fluffy towel hanging on a hook, bright pastel tiles, warm morning light through a window",
    "bedroom":     "a cozy children's bedroom interior, single neatly-made bed with a stuffed teddy bear on the pillow, small wooden desk with a glowing reading lamp, window with white curtains, warm morning sunlight, pastel walls",
    "dining room": "a warm dining room with a wooden table set for dinner with plates and cups, four matching wooden chairs around the table, a window in the background, soft daylight, cozy family atmosphere",
    "garden":      "a small home garden with green grass, colorful flowers in a bed, a single small tree, a wooden fence at the back, bright friendly daylight, no people",
    "hall":        "a small entrance hall of a family home with a wooden coat rack holding a small jacket, a front door slightly open showing warm light from outside, a doormat, pastel wall",
    "kitchen":     "a bright children's kitchen scene with a white cooker, a friendly fridge with a magnet, a wooden countertop with a fruit bowl, and a window with curtains, cozy daylight",
    "living room": "a cozy living room interior with a soft grey sofa, a wooden coffee table, a switched-off TV on a low cabinet, a potted plant in the corner, warm afternoon light",
    "bed":         "a single neatly-made child's bed with a soft pillow, a folded blanket and a small teddy bear, hero shot of the bed as the single subject, simple pastel bedroom background",
    "chair":       "a single wooden children's chair with EXACTLY FOUR LEGS clearly visible on the floor, a flat seat and a simple backrest, hero shot of the chair as the single subject, plain pastel background, all four legs symmetrical",
    "computer":    "a single desktop computer on a wooden desk — flat-screen monitor showing a friendly cartoon screensaver, a keyboard and a mouse in front, the computer is the single hero subject, plain pastel background",
    "cupboard":    "a wall-mounted KITCHEN cupboard for FOOD storage, set inside a kitchen above a countertop, TWO closed wooden doors with small round knobs, you can see a small tiled kitchen wall and a tiny edge of countertop below to anchor the kitchen context, single hero subject, NOT a clothes wardrobe, NOT in a bedroom, NOT freestanding",
    "desk":        "a child's wooden study desk with a small reading lamp, an open notebook and a yellow pencil on top, the desk is the hero single subject, plain pastel background, four visible desk legs",
    "lamp":        "a single beautiful reading lamp on a polished wooden desk, the lamp is ON and emitting a warm glowing yellow light, fabric lampshade with subtle texture, hero studio composition, soft cream background to make the glow pop",
    # 'table' deliberately overridden after Aga 2026-05-21 saw a plate
    # under the original table render. EMPTY top, no objects, no place
    # settings — the table itself is the lesson, not table-with-stuff.
    "table":       "ONE single empty wooden coffee table, completely BARE, no plates, no dishes, no glasses, no cups, no books, no flowers, no objects of any kind on top, just polished wood surface, four visible legs, hero shot of the table as the single clear subject, plain pastel background, NOTHING on the table top",
    "mirror":      "a single round wall mirror with a wooden frame, hanging on a pastel wall, the mirror reflects soft daylight from a window we can imply, hero single subject composition",
    "shelf":       "a single wooden wall shelf mounted on a pastel blue wall, three colorful children's storybooks standing on it, a small potted green plant and a tiny toy car, soft side daylight, single hero subject",
    "sofa":        "a single cozy three-seat sofa with two soft cushions, warm fabric upholstery, single hero subject on a plain pastel living-room background, no people",
    "TV":          "a single modern flat-screen television, SWITCHED OFF showing a black screen, sitting on a low wooden cabinet, single hero subject, plain pastel wall behind",
    "wardrobe":    "a tall full-height BEDROOM wardrobe for CLOTHES, freestanding on a bedroom floor, TWO closed doors and one door has a tall MIRROR panel, a long handle on each door, single hero subject, NOT a kitchen cupboard, NOT wall-mounted, NOT in a kitchen, a hint of pastel bedroom wallpaper behind",
    "poster":      "a single colorful children's poster of a friendly cartoon animal pinned on a pastel bedroom wall, the poster has NO TEXT visible, just bright illustrated artwork, single hero subject",
    # Prepositions — same kitten/puppy throughout for consistency and
    # scale clarity. Side-view cameras. Each prompt repeats the key
    # spatial word and adds "NOT on top / NOT inside / NOT behind"
    # negation hints to keep FLUX from drifting.
    "in":          "a small grey tabby kitten sitting INSIDE a brown cardboard box, the box is clearly larger than the kitten, only the kitten's head and front paws peek over the rim of the box, side view camera at eye level, plain pastel background, the kitten is NOT next to the box, NOT on top, NOT behind",
    "on":          "a small grey tabby kitten sitting ON TOP of a small wooden table, the kitten is clearly centered on the table surface with all four paws on the table top, the table is the lower larger object, side view camera, plain pastel background, the kitten is NOT under the table, NOT next to the table",
    "under":       "a SMALL grey tabby kitten — clearly much smaller than a large wooden coffee table — curled up in the shaded gap UNDERNEATH the table. The big table top fills the upper third of the frame and casts a soft shadow on the kitten. Side view at floor level. The kitten is NOT on top, NOT as tall as the table, NOT next to the table",
    "behind":      "a small brown puppy peeking out from BEHIND a half-open wooden door, only the puppy's head and one front paw are visible past the edge of the door, the rest of the puppy is hidden behind the door, side view camera, plain pastel hallway background, the puppy is NOT in front of the door, NOT inside the door",
    "next to":     "a small brown puppy standing on grass right NEXT TO a small red wooden doghouse, the puppy is on the LEFT and the doghouse is on the RIGHT at the SAME ground level with a small clear gap between them, both roughly the same height, side view, pastel blue sky background, the puppy is NOT inside the doghouse, NOT on top, NOT behind",

    # Stage 3 Unit 04 — School things + adjectives
    "schoolbag":   "a single school backpack, blue and red, standing upright",
    "book":        "a single closed paperback book on a desk",
    "notebook":    "a small spiral-bound notebook lying on a desk",
    "pen":         "a single blue ballpoint pen, close-up on white surface",
    "pencil":      "a single yellow wooden pencil with a sharp tip",
    "rubber":      "a single pink ERASER for pencil marks, school stationery, NOT a tire, on a white surface",
    "ruler":       "a single straight school ruler with cm markings",
    "pencil case": "a small zipped pencil case bag holding pens and pencils, NOT a backpack",
    # Unit 4 adjective set — single-subject only after Aga 2026-05-21
    # rejected the comparison-based renders (elephant+mouse, two pencils):
    # FLUX 2 [klein] 4B drops a leg or misses an obvious feature when it
    # has to render two animals in one frame. One subject + filling the
    # frame + tight anatomy hints is much more reliable.
    "big":         "ONE single huge healthy adult elephant filling most of the frame, full body in side view, with a clearly visible LONG curly trunk hanging in front, two big floppy ears, a small tail, FOUR legs (no extras), small tusks, plain pastel savannah background, the elephant looks GIGANTIC dominating the whole image, NO mouse, NO other animals, NO comparison",
    "small":       "ONE single tiny grey mouse standing on a green leaf, full body in side view, FOUR legs only (count carefully — NO extra legs, NO five legs), small pointy nose, two round ears, long thin tail, the mouse is the clear single hero filling the centre of the frame, plain pastel background, NO elephant, NO other animals, NO comparison",
    "new":         "ONE single brand-new shiny shiny school backpack, fresh bright colors, NO scratches, NO patches, NO worn marks, hero shot on a clean pastel background, NO comparison",
    "old":         "ONE single visibly old worn school backpack with faded color, a small patch sewn on one side, the strap slightly frayed, hero shot on a clean pastel background, NO comparison",
    "beautiful":   "ONE single beautiful red rose flower in full bloom with bright red petals, a green stem and two green leaves, plain pastel garden background with soft natural light, the rose is the clear single hero subject filling the centre of the frame, NO birds, NO insects, NO other flowers, NO multiple roses",
    "good":        "ONE single smiling friendly child giving a big confident THUMBS-UP gesture with one hand raised, the hand is in clear view, plain pastel background, hero shot, NO other people, NO other gestures",
    "nice":        "ONE single smiling friendly child gently holding a small wrapped GIFT BOX with a ribbon, both hands on the box, plain pastel background, hero shot, NO other people",
    "ugly":        "ONE single kid-friendly cartoon green monster with a funny grumpy face — bumpy skin, crooked teeth, one tooth missing, wobbly antennae — clearly UGLY but still safe and cute for a 5-year-old, plain pastel background, hero shot, NO other monsters",
    "long":        "ONE single long red rectangular ribbon stretched flat across the entire width of the frame, both ends touching the left and right edges, demonstrating exaggerated LENGTH, the ribbon is the clear single subject, plain pastel background, NO other objects, NO short objects, NO comparison",
    "short":       "ONE single very short stubby yellow pencil — only a few centimetres long — lying horizontally on a plain pastel desk, the pencil looks chunky and unusually SHORT, the pencil is the clear single subject filling the centre of the frame, NO other pencils, NO long objects, NO comparison",
    "favourite":   "ONE single beloved fluffy teddy bear with a small red heart on its chest, sitting upright as the clear single hero subject filling the centre of the frame, plain pastel background, NO child, NO multiple bears, NO other toys",

    # Tighter calculator prompt to defeat FLUX number-hallucination
    # (Aga 2026-05-21: 'calculator sayilar dogru degil'). Force the
    # buttons to read as flat colored shapes with NO digit shapes.
    "calculator":  "ONE single small modern kid's pocket calculator, the keypad has clean ROUNDED COLORED BUTTONS with NO printed digits, NO numbers, NO operators, NO symbols, NO text — the buttons are deliberately blank colored circles in a 4×4 grid; the display screen at the top is also COMPLETELY BLANK and shows nothing, hero shot of the calculator centered in the frame, plain pastel background, NO other school supplies",

    # Stage 3 Unit 04 — school things additions
    "dictionary":  "ONE single thick wooden-bound illustrated children's dictionary book lying open on a desk, pages visible with simple word entries (no real readable text), the book is the clear single hero subject, plain pastel desk background, NO other books, NO clutter",
    "tablet":      "ONE single modern children's tablet computer, slim, with a colorful friendly home-screen showing simple shape icons (no readable text or logos), hero shot of the tablet, plain pastel background, NO stylus, NO keyboard, NO case",
    "water bottle":"ONE single reusable kid's water bottle with a colorful body and a sport cap, standing upright as the clear single hero subject, plain pastel background, NO labels, NO text, NO other bottles",
}


def slugify(word: str) -> str:
    s = word.lower().strip()
    s = re.sub(r"[^a-z0-9]+", "_", s)
    return s.strip("_") or "word"


def prompt_for(word: str) -> str:
    base = WORD_PROMPTS.get(word) or WORD_PROMPTS.get(word.lower()) or f"a single {word}, simple clear composition"
    return f"{base}, {STYLE_SUFFIX}"


def collect_unit_words(unit_num: int):
    """Return [(word, slug), ...] for every unique vocab-step word in the unit."""
    p = ENRICHED / f"stage3_unit{unit_num:02d}_enriched.json"
    if not p.exists():
        sys.exit(f"enriched JSON missing: {p}")
    data = json.loads(p.read_text())
    seen = set()
    rows = []
    for u in data.get("units", []):
        for L in u.get("lessons", []):
            for s in L.get("steps", []):
                if s.get("type") not in ("vocabulary", "vocabulary_review"):
                    continue
                for it in s.get("items", []) or []:
                    if not isinstance(it, dict):
                        continue
                    w = (it.get("word") or "").strip()
                    k = w.lower()
                    if not w or k in seen:
                        continue
                    seen.add(k)
                    rows.append((w, slugify(w)))
    return rows, p, data


def already_on_r2(client, bucket: str, key: str) -> bool:
    try:
        client.head_object(Bucket=bucket, Key=key)
        return True
    except Exception:
        return False


def make_r2_client():
    import boto3
    from botocore.config import Config
    from dotenv import load_dotenv
    load_dotenv(REPO_ROOT / "backend" / ".env")
    return boto3.client(
        "s3",
        endpoint_url=os.environ["R2_ENDPOINT"],
        aws_access_key_id=os.environ["R2_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["R2_SECRET_ACCESS_KEY"],
        config=Config(signature_version="s3v4", region_name="auto"),
    )


def mflux_generate(prompt: str, out_path: Path, model_arg: str, steps: int, seed: int, size: int):
    """Invoke mflux CLI. Raises on non-zero exit.

    mflux 0.17+ exposes FLUX variants via --base-model (flux2-klein-4b,
    schnell, dev, etc.). Earlier versions used --model; we pin to
    --base-model so the script keeps working on the latest mflux.
    """
    cmd = [
        _mflux_bin(),
        "--base-model", model_arg,
        "--prompt", prompt,
        "--output", str(out_path),
        "--steps", str(steps),
        "--seed", str(seed),
        "--width", str(size),
        "--height", str(size),
    ]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(f"mflux failed: {r.stderr[-400:] or r.stdout[-400:]}")


def rewrite_unit_urls(json_path: Path, data: dict, slug_to_url: dict) -> int:
    """Walk the JSON and stamp image_url everywhere a word in slug_to_url
    appears (vocab items, game items, distractors, options_full)."""
    count = 0

    def visit(obj):
        nonlocal count
        if isinstance(obj, dict):
            w = (obj.get("word") or "").lower().strip()
            slug = slugify(w) if w else ""
            if slug and slug in slug_to_url:
                new_url = slug_to_url[slug]
                if obj.get("image_url") != new_url:
                    obj["image_url"] = new_url
                    count += 1
            for v in obj.values():
                visit(v)
        elif isinstance(obj, list):
            for v in obj:
                visit(v)

    visit(data)
    json_path.write_text(json.dumps(data, indent=2, ensure_ascii=False))
    return count


def trigger_merge():
    import requests
    r = requests.post(
        f"{API_BASE}/api/admin/content/merge-and-seed",
        params={"stage": "stage3"},
        json=[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
        timeout=300,
    )
    return r.status_code, r.text[:200]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--unit", type=int, required=True, help="Stage 3 unit number (1-20)")
    ap.add_argument("--model", default="klein-4b", choices=["klein-4b", "schnell", "dev"],
                    help=(
                        "FLUX variant. klein-4b = FLUX.2 [klein] 4B (Apache 2.0, commercial OK, ~10s/image on M-series, 48GB plenty); "
                        "schnell = FLUX.1-schnell (Apache 2.0, distilled, ~5s/image, slightly older); "
                        "dev = FLUX.1-dev or FLUX.2-dev (NON-COMMERCIAL license — do NOT use for testmaster.pro paid product). "
                        "Default klein-4b."
                    ))
    ap.add_argument("--steps", type=int, default=None, help="override inference steps")
    ap.add_argument("--size", type=int, default=512)
    ap.add_argument("--force", action="store_true", help="re-generate even if R2 already has it")
    ap.add_argument("--no-merge", action="store_true", help="skip the live merge trigger")
    ap.add_argument(
        "--dest", type=Path, default=None,
        help=(
            "If set, write PNGs to this folder and SKIP R2 upload + JSON rewrite. "
            "Used for human review before shipping. After Aga signs off, run "
            "upload_codex_unitNN.py to push the approved folder to R2."
        ),
    )
    args = ap.parse_args()

    # Default steps per model. Klein 4B and FLUX.1-dev want ~20 inference
    # steps; Schnell is distilled and 4 steps is enough.
    default_steps = {"schnell": 4, "klein-4b": 20, "dev": 20}
    steps = args.steps if args.steps is not None else default_steps[args.model]

    # Map our friendly --model arg to the actual mflux-generate --base-model
    # flag. mflux 0.17+ supports "schnell", "dev", and "flux2-klein-4b" for
    # FLUX.2 [klein] 4B Apache-2.0 weights.
    mflux_model_arg = {"schnell": "schnell", "dev": "dev", "klein-4b": "flux2-klein-4b"}[args.model]

    rows, json_path, data = collect_unit_words(args.unit)
    print(f"Unit {args.unit:02d}: {len(rows)} unique vocab words")

    # --dest mode: write to a fixed folder Aga can review, no R2, no DB write.
    if args.dest is not None:
        args.dest.mkdir(parents=True, exist_ok=True)
        print(f"DEST mode → {args.dest} (R2 + JSON rewrite skipped)")
        for idx, (word, slug) in enumerate(rows, 1):
            out_path = args.dest / f"{idx:02d}-{slug}.png"
            if out_path.exists() and not args.force:
                print(f"  = [{idx:02d}/{len(rows)}] {slug}.png exists, skip")
                continue
            prompt = prompt_for(word)
            seed = int(hashlib.md5(slug.encode()).hexdigest()[:8], 16) & 0x7FFFFFFF
            print(f"  → [{idx:02d}/{len(rows)}] {slug}.png (seed={seed})…", flush=True)
            try:
                mflux_generate(prompt, out_path, mflux_model_arg, steps, seed, args.size)
                print(f"  ✓ [{idx:02d}/{len(rows)}] {slug}.png")
            except Exception as e:
                print(f"  !! {slug} FAIL: {e}")
        print(f"\nDone. Review {args.dest}, then run upload_codex_unit{args.unit:02d}.py to push approved set to R2.")
        return

    bucket = os.environ.get("R2_BUCKET", "testmaster-static")
    client = make_r2_client()

    tmp = Path(tempfile.mkdtemp(prefix=f"flux_u{args.unit:02d}_"))
    print(f"Temp dir: {tmp}")

    slug_to_url = {}
    for word, slug in rows:
        key = f"{R2_PREFIX}/{slug}.png"
        url = f"{R2_PUBLIC_BASE}/{key}"
        if not args.force and already_on_r2(client, bucket, key):
            print(f"  = {slug}.png — already on R2, skip")
            slug_to_url[slug] = url
            continue
        out_path = tmp / f"{slug}.png"
        prompt = prompt_for(word)
        # Deterministic seed per word so re-runs reproduce.
        seed = int(hashlib.md5(slug.encode()).hexdigest()[:8], 16) & 0x7FFFFFFF
        print(f"  → {slug}.png (generating, seed={seed})…", flush=True)
        try:
            mflux_generate(prompt, out_path, mflux_model_arg, steps, seed, args.size)
        except Exception as e:
            print(f"  !! {slug} generation FAIL: {e}")
            continue
        # Upload
        with open(out_path, "rb") as fh:
            client.put_object(
                Bucket=bucket,
                Key=key,
                Body=fh.read(),
                ContentType="image/png",
                CacheControl="public, max-age=31536000, immutable",
            )
        print(f"  ✓ {slug}.png uploaded")
        slug_to_url[slug] = url

    rewrites = rewrite_unit_urls(json_path, data, slug_to_url)
    print(f"\nRewrote {rewrites} image_url refs in {json_path.name}")

    if not args.no_merge:
        code, body = trigger_merge()
        print(f"Merge trigger: HTTP {code} {body}")
    print("Done. Commit the JSON change + push, then refresh the lesson page.")


if __name__ == "__main__":
    main()
