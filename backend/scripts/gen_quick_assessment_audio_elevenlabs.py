#!/usr/bin/env python3
"""
ElevenLabs upgrade for the quick assessment audio.

Alex (test user) 2026-05-24: "audio almost unusable tbh too robotic ...
gowy text to speech tapmaly". Kokoro-82M voices (B-/C grade) are
acceptable but clearly not human. ElevenLabs voices (already wired into
the Listening QB infra at backend/routes/listening_qb.py) are
human-grade.

Cost: ~775 chars of TTS, well inside the free tier (10K chars/month).
Even on the paid plan it's ~$0.13 one-time.

Reuses IELTS_VOICE_PROFILES voice IDs already curated for Cambridge-style
listening realism:
- british_female_1 (Rachel)   → HELEN  (receptionist)
- british_male_1 (Antoni)     → MARCO  (caller / non-native student)
- british_male_2 (Arnold)     → LECTURER (deeper, authoritative academic)

Runs from the project root:
    backend/.venv/bin/python3 backend/scripts/gen_quick_assessment_audio_elevenlabs.py
"""
from __future__ import annotations
import os
import sys
import tempfile
from pathlib import Path

import boto3
from botocore.config import Config
from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs
from pydub import AudioSegment

REPO = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(REPO / "backend"))
load_dotenv(REPO / "backend" / ".env")

from level_test_quick.content.listening_clips import LISTENING_CLIPS  # noqa: E402

R2_PUBLIC_BASE = "https://pub-fcd31e7869f94c4896d039253b8f1646.r2.dev"
R2_PREFIX = "quick_assessment"
LOCAL_OUT_DIR = REPO / "backend" / "static" / "audio" / "quick_assessment"
LOCAL_OUT_DIR.mkdir(parents=True, exist_ok=True)

# Speaker-code → ElevenLabs voice mapping for the quick assessment.
# Speaker codes match what listening_clips.py uses in voices=[...].
# These IDs are pulled from IELTS_VOICE_PROFILES in listening_qb.py.
# 2026-06-02 (Aga): "AI olduğu anlaşılıyor" — the flat stability=0.85 / style=0.0
# settings made it robotic. Realistic Cambridge-mix personas + lower stability for
# natural variation. Each speaker = a consistent persona with an accent that fits
# the script (Marco IS a "native Spanish speaker" → Spanish-accented voice).
#   (voice_id, stability, similarity, style)
ELEVENLABS_VOICES = {
    # HELEN — British female receptionist (native, clear/professional)
    "HELEN":    ("Xb7hH8MSUJpSbSDYk0k2", 0.45, 0.80, 0.12),  # Alice — British F educator
    # MARCO — native Spanish speaker learning English → authentic L2 accent
    "MARCO":    ("yHD4CsKkghm19ToGLJEC", 0.45, 0.85, 0.10),  # Hernando — Colombian/Spanish M
    # LECTURER — British academic, steady authoritative delivery
    "LECTURER": ("onwK4e9ZLuTAKqWW03F9", 0.50, 0.80, 0.10),  # Daniel — British M broadcaster
}

# ElevenLabs model — multilingual_v2 has the most natural English voices and
# renders non-English-native accents (Hernando) cleanly.
MODEL_ID = "eleven_multilingual_v2"

# Bump when re-rendering: live audio is cached `immutable` on R2/CDN, so a new
# key is required for the new audio to actually reach users.
AUDIO_VERSION = "el2"


def _make_r2():
    return boto3.client(
        "s3",
        endpoint_url=os.environ["R2_ENDPOINT"],
        aws_access_key_id=os.environ["R2_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["R2_SECRET_ACCESS_KEY"],
        config=Config(signature_version="s3v4", region_name="auto"),
    )


def _render_turn(client: ElevenLabs, speaker: str, text: str) -> AudioSegment:
    voice_id, stability, similarity, style = ELEVENLABS_VOICES[speaker]
    audio_gen = client.text_to_speech.convert(
        text=text,
        voice_id=voice_id,
        model_id=MODEL_ID,
        voice_settings={
            "stability": stability,
            "similarity_boost": similarity,
            "style": style,
            "use_speaker_boost": True,
        },
        output_format="mp3_44100_128",
    )
    # `convert` returns a generator of bytes; consume into a single buffer.
    buf = b"".join(chunk for chunk in audio_gen)
    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as tmp:
        tmp.write(buf)
        tmp_path = tmp.name
    return AudioSegment.from_mp3(tmp_path)


def _render_clip(client: ElevenLabs, clip: dict, out_path: Path) -> float:
    turns = clip["transcript_for_tts"]
    print(f"  {clip['id']}: {len(turns)} turns")
    segments: list[AudioSegment] = []
    gap = AudioSegment.silent(duration=450)  # 0.45s between turns — natural conversational pace
    for i, (speaker, text) in enumerate(turns):
        seg = _render_turn(client, speaker, text)
        segments.append(seg)
        if i < len(turns) - 1:
            segments.append(gap)
        print(f"    Turn {i+1}/{len(turns)} ({speaker}) → {seg.duration_seconds:.1f}s")
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
    api_key = os.environ.get("ELEVENLABS_API_KEY")
    if not api_key:
        sys.exit("ELEVENLABS_API_KEY missing in backend/.env")
    client = ElevenLabs(api_key=api_key)
    r2 = _make_r2()

    print("Rendering with ElevenLabs (model: %s)…" % MODEL_ID)
    for clip in LISTENING_CLIPS:
        clip_id = clip["id"]
        local = LOCAL_OUT_DIR / f"{clip_id}.mp3"
        duration = _render_clip(client, clip, local)
        size_kb = local.stat().st_size / 1024
        print(f"  ✓ {clip_id} → {local} ({duration:.1f}s, {size_kb:.0f}KB)")
        key = f"{R2_PREFIX}/{clip_id}_{AUDIO_VERSION}.mp3"
        url = _upload_to_r2(r2, local, key)
        print(f"  ✓ uploaded → {url}")
        print(f"  >>> SET audio_url for {clip_id}: {url}")

    print("\nDone. Versioned keys — UPDATE the audio_url in listening_clips.py to "
          "the >>> URLs above, then commit + deploy so users get the new audio.")


if __name__ == "__main__":
    main()
