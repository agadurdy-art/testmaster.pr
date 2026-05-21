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
    "cartoon flat illustration, kid-friendly, bright friendly colors, "
    "soft shading, white background, simple clear composition for a "
    "vocabulary card, no text, no letters, no watermark, no logos"
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
    "bathroom":    "a clean bathroom with a bath, sink and toilet, bright tiles",
    "bedroom":     "a tidy children bedroom with a single bed and desk, sunny",
    "dining room": "a small dining room with a table set for dinner, four chairs",
    "garden":      "a small home garden with grass, flowers and a tree",
    "hall":        "a small entrance hall with a coat hook and a front door",
    "kitchen":     "a bright small kitchen with cooker, fridge and a countertop",
    "living room": "a cozy living room with a sofa, TV and a small coffee table",
    "bed":         "a single neatly-made child's bed with a pillow and a blanket",
    "computer":    "a desktop computer with monitor, keyboard and mouse on a desk",
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

    # Stage 3 Unit 04 — School things + adjectives
    "schoolbag":   "a single school backpack, blue and red, standing upright",
    "book":        "a single closed paperback book on a desk",
    "notebook":    "a small spiral-bound notebook lying on a desk",
    "pen":         "a single blue ballpoint pen, close-up on white surface",
    "pencil":      "a single yellow wooden pencil with a sharp tip",
    "rubber":      "a single pink ERASER for pencil marks, school stationery, NOT a tire, on a white surface",
    "ruler":       "a single straight school ruler with cm markings",
    "pencil case": "a small zipped pencil case bag holding pens and pencils, NOT a backpack",
    "big":         "a big elephant next to a tiny mouse, size comparison",
    "small":       "a small mouse next to a big elephant, size comparison",
    "new":         "a brand new shiny school backpack with price tag",
    "old":         "a faded worn-out backpack with patches",
    "beautiful":   "a beautiful colorful flower garden in sunlight",
    "good":        "a happy child holding a thumbs-up sign, GOOD gesture",
    "nice":        "a smiling child holding a small gift box",
    "ugly":        "a cartoon monster with a funny grumpy face, kid-friendly",
    "long":        "a long winding road going into the distance",
    "short":       "a short pencil next to a long pencil, length comparison",
    "favourite":   "a child hugging their favourite teddy bear with a big smile",
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
