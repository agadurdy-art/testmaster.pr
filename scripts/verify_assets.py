#!/usr/bin/env python3
"""
Asset CDN health check — "are all the files we reference actually servable?"
===========================================================================

Invariant we rely on: the Cloudflare R2 CDN mirrors backend/static/ 1:1, and
every asset route redirects local-misses there (see services/asset_cdn.py).
This script proves the invariant holds, so a broken/missing upload is caught
here instead of by a student mid-test.

What it does
------------
Takes the canonical list of committed assets (git-tracked files under
backend/static/, minus the pod-local dirs that are deliberately NOT on R2),
and checks each is reachable (HTTP 200) on the CDN. Reports anything missing.

Usage
-----
  python scripts/verify_assets.py                 # fast: sample per folder
  python scripts/verify_assets.py --full          # check every file
  python scripts/verify_assets.py --only speaking,cambridge
  CDN_BASE=https://pub-xxxx.r2.dev python scripts/verify_assets.py

Exit code is non-zero if any asset is missing — so it can gate a deploy or run
on a schedule (cron / CI) for "düzenli kontrol".
"""
import argparse
import subprocess
import sys
import time
import urllib.request
import urllib.error
from concurrent.futures import ThreadPoolExecutor
from collections import defaultdict
import os

# Default to the prod R2 public base. Override with CDN_BASE / STATIC_BASE_URL.
CDN_BASE = (os.getenv("CDN_BASE") or os.getenv("STATIC_BASE_URL")
            or "https://pub-fcd31e7869f94c4896d039253b8f1646.r2.dev").rstrip("/")

# Directories under static/ that are POD-LOCAL by design (written just-in-time,
# never uploaded to R2). Skipping them avoids false alarms.
SKIP_DIRS = ("audio/tts_cache", "audio/user_recordings", "recordings")

STATIC_PREFIX = "backend/static/"


def tracked_assets():
    out = subprocess.run(
        ["git", "ls-files", "backend/static/"],
        capture_output=True, text=True, check=True,
    ).stdout.splitlines()
    files = []
    for line in out:
        line = line.strip()
        if not line.startswith(STATIC_PREFIX):
            continue
        rel = line[len(STATIC_PREFIX):]            # e.g. "audio/cambridge/ielts17/x.mp3"
        if any(rel.startswith(s) for s in SKIP_DIRS):
            continue
        files.append(rel)
    return files


def top_group(rel):
    parts = rel.split("/")
    return "/".join(parts[:2]) if parts[0] == "audio" else parts[0]


def check(rel):
    url = f"{CDN_BASE}/{rel}"
    # Retry on 429 (CDN rate-limit) with backoff so a burst doesn't look like a
    # missing file. 429 is inconclusive, never counted as missing.
    for attempt in range(4):
        req = urllib.request.Request(url, method="HEAD", headers={"User-Agent": "asset-verify/1.0"})
        try:
            with urllib.request.urlopen(req, timeout=20) as r:
                return rel, r.status
        except urllib.error.HTTPError as e:
            if e.code == 429 and attempt < 3:
                time.sleep(1.5 * (attempt + 1))
                continue
            return rel, e.code
        except Exception as e:
            return rel, f"ERR {type(e).__name__}"
    return rel, 429


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--full", action="store_true", help="check every file, not a sample")
    ap.add_argument("--sample", type=int, default=4, help="files per folder when not --full")
    ap.add_argument("--only", default="", help="comma list of top groups to check")
    ap.add_argument("--workers", type=int, default=16)
    args = ap.parse_args()

    all_files = tracked_assets()
    groups = defaultdict(list)
    for rel in all_files:
        groups[top_group(rel)].append(rel)

    only = {s.strip() for s in args.only.split(",") if s.strip()}
    targets = []
    for g, files in sorted(groups.items()):
        if only and not any(g.startswith(o) or o in g for o in only):
            continue
        targets.extend(files if args.full else files[: args.sample])

    print(f"CDN: {CDN_BASE}")
    print(f"Checking {len(targets)} / {len(all_files)} assets across {len(groups)} groups "
          f"({'full' if args.full else f'sample {args.sample}/folder'})\n")

    missing, ratelimited = [], []
    with ThreadPoolExecutor(max_workers=args.workers) as ex:
        for rel, status in ex.map(check, targets):
            if status == 200:
                continue
            if status == 429:
                ratelimited.append((rel, status))   # inconclusive, not a failure
            else:
                missing.append((rel, status))

    by_group = defaultdict(lambda: [0, 0])  # group -> [checked, ok]
    checked_set = set(targets)
    miss_set = {m[0] for m in missing}
    for rel in targets:
        by_group[top_group(rel)][0] += 1
        if rel not in miss_set:
            by_group[top_group(rel)][1] += 1

    for g in sorted(by_group):
        chk, ok = by_group[g]
        mark = "OK " if ok == chk else "!! "
        print(f"  {mark}{g:28} {ok}/{chk}")

    if ratelimited:
        print(f"\n  {len(ratelimited)} inconclusive (429 rate-limited) — rerun with --workers 4 to confirm")

    if missing:
        print(f"\n MISSING ({len(missing)}):")
        for rel, status in missing[:50]:
            print(f"   [{status}] {rel}")
        if len(missing) > 50:
            print(f"   ... and {len(missing) - 50} more")
        print("\nFAIL — some referenced assets are not on the CDN.")
        sys.exit(1)

    print("\nPASS — every checked asset resolves on the CDN.")


if __name__ == "__main__":
    main()
