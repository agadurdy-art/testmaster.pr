#!/usr/bin/env python3
"""
One-off restore: push the 12 Listening Question-Bank MP3s that survived in
the local cache (backend/static/audio/listening/) up to R2 so the Railway
pod stops 404-ing on uncached sets after every redeploy.

Why this exists
---------------
The audio for every QB set was generated on Emergent via ElevenLabs and
cached to /app/backend/static/audio/listening/. The DNS cutover from
Emergent → Vercel+Railway+Atlas+R2 (2026-05-08) didn't migrate that disk
volume, so Railway's pod boots with an empty cache. We have the files
locally (Aga 2026-05-23: "Listening kisminda her audio zaten uretilmisti.
migration sirasinda kayip olmus") — this script puts them in R2 once so
the backend can pull from there forever after.

Reads R2_* env vars from backend/.env (same pattern as upload_codex_unit3).
Idempotent: re-running just overwrites the same keys.

Usage:
  backend/.venv/bin/python3 backend/scripts/upload_listening_audio_r2.py
"""
from __future__ import annotations
import os
import sys
from pathlib import Path

import boto3
from botocore.config import Config
from dotenv import load_dotenv

REPO = Path(__file__).resolve().parent.parent.parent
load_dotenv(REPO / "backend" / ".env")

SRC_DIR = REPO / "backend" / "static" / "audio" / "listening"
R2_PUBLIC_BASE = "https://pub-fcd31e7869f94c4896d039253b8f1646.r2.dev"
R2_PREFIX = "listening/audio"


def make_client():
    return boto3.client(
        "s3",
        endpoint_url=os.environ["R2_ENDPOINT"],
        aws_access_key_id=os.environ["R2_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["R2_SECRET_ACCESS_KEY"],
        config=Config(signature_version="s3v4", region_name="auto"),
    )


def main() -> None:
    if not SRC_DIR.exists():
        sys.exit(f"source folder missing: {SRC_DIR}")

    files = sorted(SRC_DIR.glob("*.mp3"))
    if not files:
        sys.exit(f"no .mp3 files in {SRC_DIR}")

    client = make_client()
    bucket = os.environ.get("R2_BUCKET", "testmaster-static")

    print(f"Uploading {len(files)} audio files to r2://{bucket}/{R2_PREFIX}/")
    for f in files:
        key = f"{R2_PREFIX}/{f.name}"
        url = f"{R2_PUBLIC_BASE}/{key}"
        with open(f, "rb") as fh:
            client.put_object(
                Bucket=bucket,
                Key=key,
                Body=fh.read(),
                ContentType="audio/mpeg",
                CacheControl="public, max-age=31536000, immutable",
            )
        size_kb = round(f.stat().st_size / 1024, 1)
        print(f"  ✓ {f.name} ({size_kb} KB) → {url}")

    print(f"\nDone. {len(files)} files now live at {R2_PUBLIC_BASE}/{R2_PREFIX}/")
    print("Next: deploy the listening_qb.py R2-fallback patch so the backend serves them.")


if __name__ == "__main__":
    main()
