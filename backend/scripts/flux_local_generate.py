#!/usr/bin/env python3
"""
Local FLUX Schnell batch image generation on Apple Silicon.

Reads a prompts file with the format:
    [01-mum] <prompt text>
    [02-dad] <prompt text>
    ...

Generates one PNG per line into the output folder using filenames
that match the bracketed label (e.g. 01-mum.png). The upload helper
(upload_codex_unit1.py) already understands that naming convention,
so the same R2-upload + JSON-rewrite step works for FLUX output too.

Usage:
    python3 backend/scripts/flux_local_generate.py \\
        --prompts ~/Desktop/Stage3_Unit2_prompts.txt \\
        --out ~/Desktop/Stage3_Unit2_My_family_Images

Setup (one-time, in the backend venv):
    pip install diffusers transformers accelerate sentencepiece protobuf
    # PyTorch with Apple MPS is already in the venv usually; if not:
    #     pip install torch torchvision

Notes for Apple Silicon (M1/M2/M3/M4):
- Uses the `mps` device.
- FLUX.1-schnell is gated on Hugging Face. First run will prompt for
  `huggingface-cli login`. The model is Apache-2.0 (commercial OK).
- First generation downloads ~24 GB; subsequent runs are cached.
- 4 inference steps is enough for FLUX Schnell (it's distilled for fast
  inference). ~5-15 s/image on M-series, depending on chip + RAM.
"""

import argparse
import re
import sys
import time
from pathlib import Path


def parse_prompts(path: Path):
    """Yield (filename_stem, prompt) tuples from a [label] prompt file."""
    pat = re.compile(r"^\[([^\]]+)\]\s+(.+?)\s*$")
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        m = pat.match(line)
        if not m:
            print(f"  ! skip malformed line: {line[:60]}…")
            continue
        yield m.group(1), m.group(2)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--prompts", required=True, type=Path)
    ap.add_argument("--out", required=True, type=Path)
    ap.add_argument("--size", type=int, default=512, help="square image side (default 512)")
    ap.add_argument("--steps", type=int, default=4, help="inference steps (default 4 for Schnell)")
    ap.add_argument("--seed", type=int, default=None, help="optional fixed seed for reproducibility")
    args = ap.parse_args()

    args.out.mkdir(parents=True, exist_ok=True)

    try:
        import torch
        from diffusers import FluxPipeline
    except ImportError as e:
        sys.exit(
            "Missing deps. In your venv run:\n"
            "  pip install diffusers transformers accelerate sentencepiece protobuf torch\n"
            f"(import error: {e})"
        )

    device = "mps" if torch.backends.mps.is_available() else "cpu"
    dtype = torch.bfloat16 if device == "mps" else torch.float32
    print(f"Loading FLUX.1-schnell on {device}…")
    pipe = FluxPipeline.from_pretrained(
        "black-forest-labs/FLUX.1-schnell",
        torch_dtype=dtype,
    )
    pipe = pipe.to(device)
    # Save VRAM on M-series; minor speed cost.
    pipe.enable_attention_slicing()

    items = list(parse_prompts(args.prompts))
    print(f"Generating {len(items)} images → {args.out}")

    for i, (stem, prompt) in enumerate(items, 1):
        out_path = args.out / f"{stem}.png"
        if out_path.exists():
            print(f"  [{i}/{len(items)}] {stem} — exists, skip")
            continue
        t0 = time.time()
        gen = torch.Generator(device=device).manual_seed(args.seed or hash(stem) & 0xFFFFFFFF)
        image = pipe(
            prompt,
            num_inference_steps=args.steps,
            guidance_scale=0.0,  # FLUX Schnell is CFG-free
            height=args.size,
            width=args.size,
            generator=gen,
            max_sequence_length=256,
        ).images[0]
        image.save(out_path)
        dt = time.time() - t0
        print(f"  [{i}/{len(items)}] {stem} → {out_path.name} ({dt:.1f}s)")

    print("Done.")


if __name__ == "__main__":
    main()
