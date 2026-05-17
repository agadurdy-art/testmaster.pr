#!/usr/bin/env python3
"""
Upload Stage 3 Unit 1 static assets (vocab images + listening audio) to
Cloudflare R2. Backend's /static/* redirects to the configured R2 bucket,
so any new local files must be mirrored to R2 to render in production.

Reads R2 credentials from backend/.env. Walks the stage3 asset folders
and uploads any file that's newer than its current R2 object (or missing).

Run from project root:
    python3 backend/scripts/upload_stage3_assets_to_r2.py
"""

import os
import sys
from pathlib import Path

import boto3
from botocore.config import Config


REPO_ROOT = Path(__file__).resolve().parent.parent.parent

ASSET_FOLDERS = [
    # (local relative path under backend/static, R2 key prefix)
    ("vocab_images/stage3", "vocab_images/stage3"),
    ("audio/stage3/unit01", "audio/stage3/unit01"),
    ("audio/stage3/unit02", "audio/stage3/unit02"),
]


def make_client():
    endpoint = os.environ.get("R2_ENDPOINT")
    access_key = os.environ.get("R2_ACCESS_KEY_ID")
    secret_key = os.environ.get("R2_SECRET_ACCESS_KEY")
    if not (endpoint and access_key and secret_key):
        print("ERROR: R2_ENDPOINT / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY missing", file=sys.stderr)
        sys.exit(1)
    return boto3.client(
        "s3",
        endpoint_url=endpoint,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        config=Config(signature_version="s3v4", region_name="auto"),
    )


def content_type_for(name: str) -> str:
    n = name.lower()
    if n.endswith(".png"):
        return "image/png"
    if n.endswith(".jpg") or n.endswith(".jpeg"):
        return "image/jpeg"
    if n.endswith(".mp3"):
        return "audio/mpeg"
    if n.endswith(".webp"):
        return "image/webp"
    return "application/octet-stream"


def main():
    bucket = os.environ.get("R2_BUCKET")
    if not bucket:
        print("ERROR: R2_BUCKET env var missing", file=sys.stderr)
        sys.exit(1)

    client = make_client()

    uploaded = 0
    skipped = 0
    failed = 0
    for local_rel, r2_prefix in ASSET_FOLDERS:
        local_dir = REPO_ROOT / "backend" / "static" / local_rel
        if not local_dir.exists():
            print(f"[skip] no local folder: {local_dir}")
            continue
        for fpath in sorted(local_dir.iterdir()):
            if not fpath.is_file() or fpath.name.startswith("."):
                continue
            key = f"{r2_prefix}/{fpath.name}"
            ct = content_type_for(fpath.name)
            size_kb = fpath.stat().st_size / 1024
            try:
                client.upload_file(
                    Filename=str(fpath),
                    Bucket=bucket,
                    Key=key,
                    ExtraArgs={"ContentType": ct, "CacheControl": "public, max-age=86400"},
                )
                print(f"  ✓ {key} ({size_kb:.0f} KB, {ct})")
                uploaded += 1
            except Exception as exc:
                print(f"  ✗ {key}: {exc}", file=sys.stderr)
                failed += 1

    print()
    print(f"Uploaded: {uploaded}, skipped: {skipped}, failed: {failed}")


if __name__ == "__main__":
    main()
