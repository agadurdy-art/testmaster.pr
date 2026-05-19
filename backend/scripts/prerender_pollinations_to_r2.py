#!/usr/bin/env python3
"""
Replace every Pollinations.ai URL inside Stage 3 enriched JSON files with
a stable Cloudflare R2 URL. Pollinations re-renders on cold cache and is
intermittent in production; pre-rendering once to R2 makes every vocab
image instant + reliable on every page load.

For each unique pollinations URL found in an enriched JSON:
  1. fetch it (Pollinations) with generous timeout + retry
  2. upload to R2 as vocab/<word_slug>.png (deterministic key)
  3. rewrite every occurrence of the URL in the JSON to the R2 URL

Run from repo root:
    python3 backend/scripts/prerender_pollinations_to_r2.py --all
"""

import argparse
import json
import os
import re
import sys
import time
import urllib.parse
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from threading import Lock

import boto3
import requests
from botocore.config import Config

PRINT_LOCK = Lock()
def log(msg):
    with PRINT_LOCK:
        print(msg, flush=True)

# Load .env so the script picks up R2 creds the same way the backend does.
try:
    from dotenv import load_dotenv  # type: ignore
    load_dotenv(Path(__file__).resolve().parent.parent / ".env")
except Exception:
    pass

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
ENRICHED = REPO_ROOT / "backend" / "content" / "enriched"

R2_PUBLIC_BASE = "https://pub-fcd31e7869f94c4896d039253b8f1646.r2.dev"
R2_KEY_PREFIX = "vocab"  # → https://pub-…r2.dev/vocab/<slug>.png

POLLINATIONS_HOST = "image.pollinations.ai"


def slugify(word: str) -> str:
    s = word.lower().strip()
    s = re.sub(r"[^a-z0-9]+", "_", s)
    return s.strip("_") or "word"


def make_r2_client():
    endpoint = os.environ["R2_ENDPOINT"]
    return boto3.client(
        "s3",
        endpoint_url=endpoint,
        aws_access_key_id=os.environ["R2_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["R2_SECRET_ACCESS_KEY"],
        config=Config(signature_version="s3v4", region_name="auto"),
    )


def fetch_pollinations(url: str, max_attempts: int = 4) -> bytes:
    """Pollinations cold-renders → first hit can take 10-30s and fail. Retry
    with exponential backoff and a longer timeout per attempt."""
    last_err = None
    for attempt in range(max_attempts):
        try:
            timeout = 30 + attempt * 30  # 30s, 60s, 90s, 120s
            r = requests.get(url, timeout=timeout)
            if r.status_code == 200 and r.content and len(r.content) > 1000:
                return r.content
            last_err = f"HTTP {r.status_code} len={len(r.content) if r.content else 0}"
        except Exception as e:
            last_err = str(e)
        time.sleep(2 ** attempt)
    raise RuntimeError(f"pollinations fetch failed: {last_err}")


def collect_url_words(data) -> dict:
    """Walk a unit-shaped JSON and collect {pollinations_url: word_used_for_slug}.
    If the same URL appears with different words (rare), the first wins."""
    out = {}

    def visit(obj):
        if isinstance(obj, dict):
            url = obj.get("image_url") or ""
            word = obj.get("word") or obj.get("prompt") or ""
            if POLLINATIONS_HOST in url and word and url not in out:
                out[url] = word
            for v in obj.values():
                visit(v)
        elif isinstance(obj, list):
            for v in obj:
                visit(v)

    visit(data)
    return out


def rewrite_urls(data, mapping: dict) -> int:
    """Walk the JSON and replace every old → new URL. Returns count."""
    count = 0

    def visit(obj):
        nonlocal count
        if isinstance(obj, dict):
            if isinstance(obj.get("image_url"), str) and obj["image_url"] in mapping:
                obj["image_url"] = mapping[obj["image_url"]]
                count += 1
            for v in obj.values():
                visit(v)
        elif isinstance(obj, list):
            for v in obj:
                visit(v)

    visit(data)
    return count


def already_uploaded(client, bucket: str, key: str) -> bool:
    try:
        client.head_object(Bucket=bucket, Key=key)
        return True
    except client.exceptions.ClientError:
        return False
    except Exception:
        return False


def upload_one(url: str, word: str, client, bucket: str, force_upload: bool):
    """Fetch one Pollinations URL → upload to R2. Returns (url, public_url, err)."""
    slug = slugify(word)
    key = f"{R2_KEY_PREFIX}/{slug}.png"
    public_url = f"{R2_PUBLIC_BASE}/{key}"
    if not force_upload and already_uploaded(client, bucket, key):
        log(f"    = {slug} (already on R2)")
        return (url, public_url, None)
    try:
        log(f"    → {slug} fetching…")
        blob = fetch_pollinations(url)
        client.put_object(
            Bucket=bucket,
            Key=key,
            Body=blob,
            ContentType="image/png",
            CacheControl="public, max-age=31536000, immutable",
        )
        log(f"    ✓ {slug} uploaded ({len(blob)//1024} KB)")
        return (url, public_url, None)
    except Exception as e:
        log(f"    !! {slug} FAIL: {e}")
        return (url, public_url, str(e))


def process_unit(unit_num: int, client, bucket: str, force_upload: bool, workers: int) -> int:
    p = ENRICHED / f"stage3_unit{unit_num:02d}_enriched.json"
    if not p.exists():
        log(f"  skip — {p.name} missing")
        return 0
    data = json.loads(p.read_text())
    url_to_word = collect_url_words(data)
    log(f"  {p.name}: {len(url_to_word)} unique Pollinations URLs (parallel x{workers})")

    mapping = {}
    failed = []
    with ThreadPoolExecutor(max_workers=workers) as ex:
        futures = [ex.submit(upload_one, u, w, client, bucket, force_upload)
                   for u, w in url_to_word.items()]
        for fut in as_completed(futures):
            url, public_url, err = fut.result()
            if err is None:
                mapping[url] = public_url
            else:
                failed.append((url, err))

    n = rewrite_urls(data, mapping)
    p.write_text(json.dumps(data, indent=2, ensure_ascii=False))
    log(f"  ✓ {p.name}: {n} URL refs rewritten · {len(failed)} failed")
    return n


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--unit", type=int)
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--force", action="store_true",
                    help="re-upload even if R2 already has the key")
    ap.add_argument("--workers", type=int, default=8,
                    help="parallel fetch workers (default 8)")
    args = ap.parse_args()

    bucket = os.environ.get("R2_BUCKET") or "testmaster-static"
    client = make_r2_client()

    if args.all:
        total = 0
        for n in range(1, 21):
            total += process_unit(n, client, bucket, args.force, args.workers)
        log(f"Done. {total} URL references rewritten.")
    elif args.unit is not None:
        process_unit(args.unit, client, bucket, args.force, args.workers)
    else:
        ap.error("pass --unit NN or --all")


if __name__ == "__main__":
    main()
