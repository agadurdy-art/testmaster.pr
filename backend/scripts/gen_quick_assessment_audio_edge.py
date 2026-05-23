#!/usr/bin/env python3
"""
Edge-TTS upgrade for the quick assessment audio.

Alex 2026-05-24: "audio almost unusable tbh too robotic ... gowy text to
speech tapmaly". Kokoro-82M (B-/C grade) sounds robotic. ElevenLabs is
out of quota on this account. Edge-TTS uses Microsoft's Azure Neural
voices for free via the Edge browser endpoint — quality is essentially
identical to ElevenLabs for narrative content. Zero per-render cost.

Voice picks (British Neural, sound natural for Cambridge listening):
- HELEN    → en-GB-SoniaNeural   (British female, professional)
- MARCO    → en-GB-RyanNeural    (British male, conversational)
- LECTURER → en-GB-ThomasNeural  (British male, deeper, academic)

Run from project root:
    backend/.venv/bin/python3 backend/scripts/gen_quick_assessment_audio_edge.py
"""
from __future__ import annotations
import asyncio
import os
import sys
import tempfile
from pathlib import Path

import boto3
from botocore.config import Config
from dotenv import load_dotenv
from pydub import AudioSegment
import edge_tts

REPO = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(REPO / "backend"))
load_dotenv(REPO / "backend" / ".env")

from level_test_quick.content.listening_clips import LISTENING_CLIPS  # noqa: E402

R2_PUBLIC_BASE = "https://pub-fcd31e7869f94c4896d039253b8f1646.r2.dev"
R2_PREFIX = "quick_assessment"
LOCAL_OUT_DIR = REPO / "backend" / "static" / "audio" / "quick_assessment"
LOCAL_OUT_DIR.mkdir(parents=True, exist_ok=True)

EDGE_VOICES = {
    "HELEN":    "en-GB-SoniaNeural",
    "MARCO":    "en-GB-RyanNeural",
    "LECTURER": "en-GB-ThomasNeural",
}

# Subtle prosody — natural conversational pace, slight pitch variety
# per speaker so they sound distinct without being theatrical.
PROSODY = {
    "HELEN":    {"rate": "+0%",  "pitch": "+0Hz"},
    "MARCO":    {"rate": "-5%",  "pitch": "-2Hz"},   # slightly slower + lower → reads as a slightly different speaker
    "LECTURER": {"rate": "-3%",  "pitch": "-2Hz"},   # measured academic pace
}


def _make_r2():
    return boto3.client(
        "s3",
        endpoint_url=os.environ["R2_ENDPOINT"],
        aws_access_key_id=os.environ["R2_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["R2_SECRET_ACCESS_KEY"],
        config=Config(signature_version="s3v4", region_name="auto"),
    )


async def _render_turn(speaker: str, text: str) -> AudioSegment:
    voice = EDGE_VOICES[speaker]
    pros = PROSODY[speaker]
    comm = edge_tts.Communicate(
        text=text,
        voice=voice,
        rate=pros["rate"],
        pitch=pros["pitch"],
    )
    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as tmp:
        await comm.save(tmp.name)
        tmp_path = tmp.name
    return AudioSegment.from_mp3(tmp_path)


async def _render_clip(clip: dict, out_path: Path) -> float:
    turns = clip["transcript_for_tts"]
    print(f"  {clip['id']}: {len(turns)} turns")
    segments: list[AudioSegment] = []
    gap = AudioSegment.silent(duration=450)
    for i, (speaker, text) in enumerate(turns):
        seg = await _render_turn(speaker, text)
        segments.append(seg)
        if i < len(turns) - 1:
            segments.append(gap)
        print(f"    Turn {i+1}/{len(turns)} ({speaker}/{EDGE_VOICES[speaker]}) → {seg.duration_seconds:.1f}s")
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


async def main():
    r2 = _make_r2()
    print("Rendering with Microsoft Edge Neural TTS (free)…")
    for clip in LISTENING_CLIPS:
        clip_id = clip["id"]
        local = LOCAL_OUT_DIR / f"{clip_id}.mp3"
        duration = await _render_clip(clip, local)
        size_kb = local.stat().st_size / 1024
        print(f"  ✓ {clip_id} → {local} ({duration:.1f}s, {size_kb:.0f}KB)")
        url = _upload_to_r2(r2, local, f"{R2_PREFIX}/{clip_id}.mp3")
        print(f"  ✓ uploaded → {url}")
    print("\nDone. R2 URLs overwrote previous Kokoro renders — no listening_clips.py edit needed.")


if __name__ == "__main__":
    asyncio.run(main())
