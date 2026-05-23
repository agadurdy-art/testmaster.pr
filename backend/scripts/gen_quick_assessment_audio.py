#!/usr/bin/env python3
"""
Render the quick assessment listening clips with Kokoro-82M (Apache 2.0)
on Mac MPS, concatenate per-turn audio with short gaps, and push the
resulting MP3s to R2.

One-time job. Re-run only when transcripts change.

Setup (Mac):
    pip install kokoro-onnx soundfile numpy pydub
    brew install ffmpeg   # for pydub MP3 encoding

Usage:
    backend/.venv/bin/python3 backend/scripts/gen_quick_assessment_audio.py

Writes:
    Local: backend/static/audio/quick_assessment/<clip_id>.mp3
    R2:    r2://testmaster-static/quick_assessment/<clip_id>.mp3 (public)
    Then updates LISTENING_CLIPS[*]['audio_url'] in
    backend/level_test_quick/content/listening_clips.py via a small patch
    (see _patch_audio_urls below).
"""
from __future__ import annotations
import os
import sys
import tempfile
from pathlib import Path

import boto3
from botocore.config import Config
from dotenv import load_dotenv

REPO = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(REPO / "backend"))
load_dotenv(REPO / "backend" / ".env")

# Lazy imports — Kokoro is optional, only needed when actually rendering.
try:
    from kokoro_onnx import Kokoro  # type: ignore
    import soundfile as sf
    from pydub import AudioSegment
    import numpy as np
except ImportError as e:
    print(f"Kokoro pipeline deps missing: {e}", file=sys.stderr)
    print("Install: pip install kokoro-onnx soundfile numpy pydub")
    print("        brew install ffmpeg")
    sys.exit(1)


from level_test_quick.content.listening_clips import LISTENING_CLIPS  # noqa: E402

R2_PUBLIC_BASE = "https://pub-fcd31e7869f94c4896d039253b8f1646.r2.dev"
R2_PREFIX = "quick_assessment"
LOCAL_OUT_DIR = REPO / "backend" / "static" / "audio" / "quick_assessment"
LOCAL_OUT_DIR.mkdir(parents=True, exist_ok=True)


def _make_r2():
    return boto3.client(
        "s3",
        endpoint_url=os.environ["R2_ENDPOINT"],
        aws_access_key_id=os.environ["R2_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["R2_SECRET_ACCESS_KEY"],
        config=Config(signature_version="s3v4", region_name="auto"),
    )


def _render_clip(kokoro, clip: dict, out_path: Path) -> float:
    """
    Render all turns of a clip into a single MP3.
    Returns total duration in seconds.
    """
    voice_map = dict(clip["voices"])
    turns = clip["transcript_for_tts"]
    print(f"  Rendering {clip['id']}: {len(turns)} turns, voices={voice_map}")

    segments: list[AudioSegment] = []
    gap = AudioSegment.silent(duration=400)  # 0.4s between turns
    for i, (speaker, text) in enumerate(turns):
        voice = voice_map[speaker]
        samples, sample_rate = kokoro.create(text, voice=voice, speed=1.0, lang="en-us")
        # Save to temp wav, then load as AudioSegment
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            sf.write(tmp.name, samples, sample_rate)
            seg = AudioSegment.from_wav(tmp.name)
        segments.append(seg)
        if i < len(turns) - 1:
            segments.append(gap)
        print(f"    Turn {i+1}/{len(turns)} ({speaker}/{voice}) → {seg.duration_seconds:.1f}s")

    full = sum(segments[1:], segments[0]) if len(segments) > 1 else segments[0]
    full.export(out_path, format="mp3", bitrate="128k")
    return full.duration_seconds


def _upload_to_r2(r2, local_path: Path, key: str) -> str:
    bucket = os.environ.get("R2_BUCKET", "testmaster-static")
    with open(local_path, "rb") as fh:
        r2.put_object(
            Bucket=bucket,
            Key=key,
            Body=fh.read(),
            ContentType="audio/mpeg",
            CacheControl="public, max-age=31536000, immutable",
        )
    return f"{R2_PUBLIC_BASE}/{key}"


def main():
    # Initialise Kokoro once. Will download weights on first run (~80MB).
    print("Loading Kokoro-82M…")
    kokoro = Kokoro("kokoro-v1.0.onnx", "voices-v1.0.bin")

    r2 = _make_r2()
    results = []

    for clip in LISTENING_CLIPS:
        clip_id = clip["id"]
        local = LOCAL_OUT_DIR / f"{clip_id}.mp3"
        duration = _render_clip(kokoro, clip, local)
        size_kb = local.stat().st_size / 1024
        print(f"  ✓ {clip_id} → {local} ({duration:.1f}s, {size_kb:.0f}KB)")

        key = f"{R2_PREFIX}/{clip_id}.mp3"
        url = _upload_to_r2(r2, local, key)
        print(f"  ✓ uploaded → {url}")
        results.append((clip_id, url, duration))

    print("\nDone. Audio URLs:")
    for cid, url, dur in results:
        print(f"  {cid}: {url} ({dur:.1f}s)")
    print("\nNext: paste these URLs into LISTENING_CLIPS[*]['audio_url'] "
          "in backend/level_test_quick/content/listening_clips.py.")


if __name__ == "__main__":
    main()
