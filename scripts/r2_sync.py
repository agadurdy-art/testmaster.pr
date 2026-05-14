#!/usr/bin/env python3
"""Cloudflare R2 incremental sync.

Reusable helper for uploading local files into the `testmaster-static` R2
bucket. Reads credentials from `backend/.env` (R2_ACCOUNT_ID,
R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_ENDPOINT). Uses S3-
compatible API via boto3 with the R2 endpoint.

Behavior:
  * Walks `--src DIR` recursively (default: backend/static/).
  * For each file, computes MD5 and compares against the R2 object's ETag.
    Only uploads if the file is new or content-changed (idempotent — safe to
    re-run).
  * Sets `Content-Type` from the file extension so the browser doesn't
    download MP3s as octet-stream.
  * `--key-prefix` prepends a path on the remote side (default: derive
    from src dir name, e.g. `static/audio/foo.mp3` for src=backend/static).

Usage:
  # First-time / catch-up sync of everything under backend/static:
  python scripts/r2_sync.py --src backend/static --key-prefix static

  # Sync a subdir:
  python scripts/r2_sync.py --src backend/static/audio --key-prefix static/audio

  # Dry-run (preview what would upload):
  python scripts/r2_sync.py --src backend/static --key-prefix static --dry-run

Credentials setup (one-time):
  1. Cloudflare dashboard → R2 → Manage R2 API Tokens → Create token
  2. Permissions: Object Read & Write
  3. Specify bucket: testmaster-static
  4. Paste the resulting Access Key ID + Secret into backend/.env:
       R2_ACCESS_KEY_ID=...
       R2_SECRET_ACCESS_KEY=...
  5. R2_ENDPOINT and R2_BUCKET are already in .env.example; copy if missing.
"""
from __future__ import annotations

import argparse
import hashlib
import mimetypes
import os
import sys
from pathlib import Path
from typing import Optional

try:
    import boto3
    from botocore.config import Config
    from botocore.exceptions import ClientError
except ImportError:
    print("boto3 not installed. Run: pip install boto3", file=sys.stderr)
    sys.exit(1)


REPO_ROOT = Path(__file__).resolve().parent.parent
BACKEND_ENV = REPO_ROOT / "backend" / ".env"


def load_env() -> dict[str, str]:
    """Read backend/.env into a dict. No external deps (avoid python-dotenv)."""
    env: dict[str, str] = {}
    if not BACKEND_ENV.exists():
        print(f"⚠️  {BACKEND_ENV} not found", file=sys.stderr)
        return env
    for line in BACKEND_ENV.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, _, v = line.partition("=")
        env[k.strip()] = v.strip().strip("\"'")
    return env


def _ct_for(path: Path) -> str:
    """Best-effort Content-Type. Falls back to octet-stream."""
    # Force a few common ones since `mimetypes` is platform-dependent.
    overrides = {
        ".mp3": "audio/mpeg",
        ".webm": "audio/webm",
        ".m4a": "audio/mp4",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".webp": "image/webp",
        ".svg": "image/svg+xml",
        ".json": "application/json",
        ".html": "text/html",
        ".css": "text/css",
        ".js": "application/javascript",
    }
    ext = path.suffix.lower()
    if ext in overrides:
        return overrides[ext]
    guess, _ = mimetypes.guess_type(str(path))
    return guess or "application/octet-stream"


def _md5(path: Path) -> str:
    h = hashlib.md5()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(64 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def _make_client(env: dict[str, str]):
    endpoint = env.get("R2_ENDPOINT") or os.getenv("R2_ENDPOINT")
    access_key = env.get("R2_ACCESS_KEY_ID") or os.getenv("R2_ACCESS_KEY_ID")
    secret_key = env.get("R2_SECRET_ACCESS_KEY") or os.getenv("R2_SECRET_ACCESS_KEY")
    if not (endpoint and access_key and secret_key):
        print(
            "R2 credentials missing. Set R2_ENDPOINT + R2_ACCESS_KEY_ID + "
            "R2_SECRET_ACCESS_KEY in backend/.env (see script docstring).",
            file=sys.stderr,
        )
        sys.exit(2)
    return boto3.client(
        "s3",
        endpoint_url=endpoint,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        config=Config(signature_version="s3v4", retries={"max_attempts": 3}),
    )


def _remote_etag(client, bucket: str, key: str) -> Optional[str]:
    try:
        head = client.head_object(Bucket=bucket, Key=key)
        return (head.get("ETag") or "").strip('"')
    except ClientError as exc:
        if exc.response.get("Error", {}).get("Code") in {"404", "NoSuchKey", "NotFound"}:
            return None
        raise


def sync(src: Path, key_prefix: str, *, dry_run: bool, env: dict[str, str]) -> int:
    bucket = env.get("R2_BUCKET", "testmaster-static")
    client = _make_client(env)

    src = src.resolve()
    if not src.is_dir():
        print(f"--src must be a directory; got {src}", file=sys.stderr)
        return 2

    prefix = key_prefix.strip("/")
    uploaded = skipped = failed = 0
    for path in sorted(src.rglob("*")):
        if not path.is_file():
            continue
        rel = path.relative_to(src).as_posix()
        key = f"{prefix}/{rel}" if prefix else rel

        local_md5 = _md5(path)
        remote_etag = _remote_etag(client, bucket, key)
        # R2 single-part uploads use the MD5 as the ETag — direct compare works.
        if remote_etag == local_md5:
            skipped += 1
            continue

        size = path.stat().st_size
        print(f"  UP {key}  ({size:,} bytes, {_ct_for(path)})")
        if dry_run:
            uploaded += 1
            continue
        try:
            client.upload_file(
                str(path),
                bucket,
                key,
                ExtraArgs={"ContentType": _ct_for(path)},
            )
            uploaded += 1
        except Exception as exc:
            print(f"  FAIL {key}: {exc}", file=sys.stderr)
            failed += 1

    action = "would upload" if dry_run else "uploaded"
    print(
        f"\nDone. {action}={uploaded}, skipped (already current)={skipped}, "
        f"failed={failed}. Bucket={bucket}."
    )
    return 0 if failed == 0 else 1


def main() -> int:
    p = argparse.ArgumentParser(description="Sync a local directory to R2.")
    p.add_argument("--src", required=True, help="Local directory to sync")
    p.add_argument(
        "--key-prefix",
        required=True,
        help="Remote key prefix (e.g. 'static' so files land at static/audio/...)",
    )
    p.add_argument("--dry-run", action="store_true", help="Preview only, no upload")
    args = p.parse_args()

    env = load_env()
    return sync(Path(args.src), args.key_prefix, dry_run=args.dry_run, env=env)


if __name__ == "__main__":
    sys.exit(main())
