#!/usr/bin/env python3
"""
Upload Aga's Codex-generated Unit 2 vocab images to R2.

Source folder: ~/Desktop/Stage3_Unit2_My_family_Images/
Filenames: NN-<word>.png (numeric prefix is dropped for the R2 key).

After upload, walks every Stage 3 enriched JSON and rewrites image_url
fields to the new R2 URL so vocab cards + games render the Codex art.
"""

import json
import os
import re
import sys
from pathlib import Path

import boto3
from botocore.config import Config
from dotenv import load_dotenv

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
load_dotenv(REPO_ROOT / "backend" / ".env")

SRC = Path.home() / "Desktop" / "Stage3_Unit2_My_family_Images"
ENRICHED = REPO_ROOT / "backend" / "content" / "enriched"
R2_PUBLIC_BASE = "https://pub-fcd31e7869f94c4896d039253b8f1646.r2.dev"
R2_PREFIX = "vocab"

# No special filename → wordlist mapping needed for Unit 2 (all stems
# match the vocab word verbatim).
FILENAME_TO_WORD: dict[str, str] = {}


def slugify(word: str) -> str:
    s = word.lower().strip()
    s = re.sub(r"[^a-z0-9]+", "_", s)
    return s.strip("_") or "word"


def make_client():
    return boto3.client(
        "s3",
        endpoint_url=os.environ["R2_ENDPOINT"],
        aws_access_key_id=os.environ["R2_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["R2_SECRET_ACCESS_KEY"],
        config=Config(signature_version="s3v4", region_name="auto"),
    )


def main():
    if not SRC.exists():
        sys.exit(f"source folder missing: {SRC}")

    client = make_client()
    bucket = os.environ.get("R2_BUCKET", "testmaster-static")

    word_to_url: dict[str, str] = {}
    files = sorted(SRC.glob("*.png"))
    print(f"Found {len(files)} files in {SRC}")
    for f in files:
        stem = re.sub(r"^\d+[-_]", "", f.stem)
        word = FILENAME_TO_WORD.get(stem, stem)
        slug = slugify(word)
        key = f"{R2_PREFIX}/{slug}.png"
        url = f"{R2_PUBLIC_BASE}/{key}"
        with open(f, "rb") as fh:
            client.put_object(
                Bucket=bucket,
                Key=key,
                Body=fh.read(),
                ContentType="image/png",
                CacheControl="public, max-age=31536000, immutable",
            )
        print(f"  ✓ {f.name} → {key}")
        word_to_url[word.lower()] = url

    total_refs = 0
    for json_path in sorted(ENRICHED.glob("stage3_unit*_enriched.json")):
        data = json.loads(json_path.read_text())
        local = 0

        def visit(obj):
            nonlocal local
            if isinstance(obj, dict):
                w = (obj.get("word") or "").lower().strip()
                if w and w in word_to_url:
                    new_url = word_to_url[w]
                    if obj.get("image_url") != new_url:
                        obj["image_url"] = new_url
                        local += 1
                for v in obj.values():
                    visit(v)
            elif isinstance(obj, list):
                for v in obj:
                    visit(v)

        visit(data)
        if local:
            json_path.write_text(json.dumps(data, indent=2, ensure_ascii=False))
            print(f"  ↻ {json_path.name}: {local} image_url refs rewritten")
            total_refs += local
    print(f"\nDone. Uploaded {len(word_to_url)} images, rewrote {total_refs} JSON refs.")


if __name__ == "__main__":
    main()
