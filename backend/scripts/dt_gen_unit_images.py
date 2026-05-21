#!/usr/bin/env python3
"""
Generate vocab images via the LOCAL Draw Things HTTP API (A1111-compatible).

Why: mflux + Apache 2.0 model configs are broken (no VAE download URL) and
FLUX.1-schnell on HuggingFace is gated. Draw Things is already installed
on Aga's Mac with FLUX 2 weights downloaded — its HTTP API can be hit
directly from this script, no logins or downloads needed.

Setup once (in Draw Things app):
  Settings → API Server → Protocol: HTTP, Port: 7860, Server Online: ON.

Run:
  backend/.venv/bin/python3 backend/scripts/dt_gen_unit_images.py \\
      --unit 3 --dest ~/Desktop/Stage3_Unit3_DT

Reuses WORD_PROMPTS from ship_unit_images so prompt vocabulary stays
consistent across pipelines.
"""
from __future__ import annotations
import argparse
import base64
import hashlib
import json
import sys
import time
import urllib.request
from pathlib import Path

# Import shared word prompt dict + locked style/negative from sibling script
REPO = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(REPO / "backend" / "scripts"))
from ship_unit_images import (  # noqa: E402
    WORD_PROMPTS, STYLE_SUFFIX, NEGATIVE_SUFFIX, slugify, collect_unit_words,
)

DEFAULT_NEGATIVE = NEGATIVE_SUFFIX


def dt_txt2img(prompt: str, seed: int, size: int, steps: int, host: str, secret: str | None, negative: str = "") -> bytes:
    """POST to DT's A1111-compatible /sdapi/v1/txt2img and return PNG bytes."""
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
    body = json.dumps(payload).encode("utf-8")
    headers = {"Content-Type": "application/json"}
    if secret:
        headers["Authorization"] = f"Bearer {secret}"
    req = urllib.request.Request(
        f"{host.rstrip('/')}/sdapi/v1/txt2img",
        data=body,
        headers=headers,
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=180) as r:
        resp = json.load(r)
    imgs = resp.get("images") or []
    if not imgs:
        raise RuntimeError(f"empty images[] from DT: {str(resp)[:200]}")
    return base64.b64decode(imgs[0])


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--unit", type=int, required=True, help="Stage 3 unit number")
    ap.add_argument("--dest", type=Path, required=True, help="output folder for PNGs")
    ap.add_argument("--host", default="http://localhost:7860")
    ap.add_argument("--secret", default=None, help="DT shared secret (only needed if enabled)")
    ap.add_argument("--steps", type=int, default=20, help="inference steps (default 20 for quality)")
    ap.add_argument("--size", type=int, default=768, help="square image side (default 768)")
    ap.add_argument("--negative", default=DEFAULT_NEGATIVE, help="negative prompt (default: full anti-AI-look + anti-anatomy set)")
    ap.add_argument("--force", action="store_true")
    args = ap.parse_args()

    rows, _, _ = collect_unit_words(args.unit)
    args.dest.mkdir(parents=True, exist_ok=True)
    print(f"Unit {args.unit:02d}: {len(rows)} vocab words → {args.dest}")
    print(f"DT host: {args.host}\n")

    t_total = time.time()
    for i, (word, slug) in enumerate(rows, 1):
        out = args.dest / f"{i:02d}-{slug}.png"
        if out.exists() and not args.force:
            print(f"  = [{i:02d}/{len(rows)}] {slug}.png exists, skip")
            continue
        base = WORD_PROMPTS.get(word.lower(), f"a single {word}, simple clear composition")
        prompt = f"{base}, {STYLE_SUFFIX}"
        seed = int(hashlib.md5(slug.encode()).hexdigest()[:8], 16) & 0x7FFFFFFF
        t0 = time.time()
        try:
            png = dt_txt2img(prompt, seed, args.size, args.steps, args.host, args.secret, args.negative)
            out.write_bytes(png)
            print(f"  ✓ [{i:02d}/{len(rows)}] {slug}.png ({time.time()-t0:.1f}s)")
        except Exception as e:
            print(f"  !! [{i:02d}/{len(rows)}] {slug} FAIL: {e}")
    print(f"\nDone in {time.time()-t_total:.0f}s. Review {args.dest}, then run upload_codex_unit{args.unit:02d}.py to ship.")


if __name__ == "__main__":
    main()
