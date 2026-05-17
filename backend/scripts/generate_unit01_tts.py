#!/usr/bin/env python3
"""
Generate listening audio MP3s for Stage 3 Unit 1 using ElevenLabs TTS.

Reads `stage3_unit01_enriched.json`, parses each lesson's step 9 audio_text
into speaker turns, calls ElevenLabs per turn with a per-persona voice ID,
and writes one concatenated MP3 per lesson to `backend/static/audio/stage3/unit01/`.

Run from project root:
    python3 backend/scripts/generate_unit01_tts.py
"""

import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path


# ─── Persona → ElevenLabs voice ID ────────────────────────────────────────────
# Voice IDs from the ElevenLabs voice library (stock voices). Adjust as needed.
VOICES = {
    "narrator": "pFZP5JQG7iQjIQuC4Bku",  # Lily — warm female narrator (default)
    "linh":     "pFZP5JQG7iQjIQuC4Bku",  # Lily — Vietnamese girl, 9 yrs
    "mai":      "XB0fDUnXU5powFXDhCwa",  # Charlotte — Vietnamese girl, Linh's best friend
    "minh":     "IKne3meq5aSn9XLyUdCD",  # Charlie — Vietnamese boy, 7 yrs (Linh's brother)
    "ray":      "pqHfZKP75CvOlQylNhV4",  # Bill — young male English teacher
    "tom":      "nPczCjzI2devNBz1zQrb",  # Brian — American boy
    "sophie":   "Xb7hH8MSUJpSbSDYk0k2",  # Alice — British girl
    "lucas":    "TX3LPaxmHKxFdv7VOQHJ",  # Liam — Brazilian boy
}

# A1 learner pace: slightly slower than natural conversational rate.
SPEED = 0.92  # ElevenLabs allows speed in [0.7, 1.2]

# Per-voice settings tuned for clear, friendly children's content.
VOICE_SETTINGS = {
    "stability": 0.55,
    "similarity_boost": 0.75,
    "style": 0.25,
    "use_speaker_boost": True,
    "speed": SPEED,
}

MODEL = "eleven_multilingual_v2"
API_KEY = os.environ.get("ELEVENLABS_API_KEY")
API_BASE = "https://api.elevenlabs.io/v1"

SPEAKER_PATTERN = re.compile(
    r"\b(Ray|Linh|Mai|Minh|Tom|Sophie|Lucas|Narrator)\s*:\s*",
    re.IGNORECASE,
)


def parse_dialogue(text: str):
    """Split a multi-speaker audio_text into [(speaker_lower, content), ...]."""
    parts = SPEAKER_PATTERN.split(text)
    result = []
    # parts[0] = leading content (if any) before first speaker tag
    if parts[0].strip():
        result.append(("narrator", parts[0].strip()))
    for i in range(1, len(parts), 2):
        speaker = parts[i].lower()
        content = parts[i + 1].strip() if i + 1 < len(parts) else ""
        if content:
            result.append((speaker, content))
    if not result:
        # Fallback: single narrator
        result.append(("narrator", text.strip()))
    return result


def tts_segment(text: str, voice_id: str) -> bytes:
    """Call ElevenLabs TTS for one speaker turn. Returns MP3 bytes."""
    url = f"{API_BASE}/text-to-speech/{voice_id}"
    headers = {
        "xi-api-key": API_KEY,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg",
    }
    payload = {
        "text": text,
        "model_id": MODEL,
        "voice_settings": VOICE_SETTINGS,
    }
    body = json.dumps(payload).encode("utf-8")
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, data=body, headers=headers, method="POST")
            with urllib.request.urlopen(req, timeout=60) as resp:
                return resp.read()
        except urllib.error.HTTPError as exc:
            err_body = exc.read().decode("utf-8", "replace")[:200]
            print(f"    [{exc.code}] {err_body}", file=sys.stderr)
            if exc.code in (429, 500, 502, 503, 504) and attempt < 2:
                time.sleep(2 * (attempt + 1))
                continue
            raise
        except urllib.error.URLError as exc:
            print(f"    request error: {exc}", file=sys.stderr)
            if attempt < 2:
                time.sleep(2 * (attempt + 1))
                continue
            raise
    raise RuntimeError("TTS request failed after retries")


def main():
    if not API_KEY:
        print("ERROR: ELEVENLABS_API_KEY env var not set.", file=sys.stderr)
        sys.exit(1)

    repo_root = Path(__file__).resolve().parent.parent.parent
    unit_path = repo_root / "backend" / "content" / "enriched" / "stage3_unit01_enriched.json"
    out_dir = repo_root / "backend" / "static" / "audio" / "stage3" / "unit01"
    out_dir.mkdir(parents=True, exist_ok=True)

    data = json.loads(unit_path.read_text())
    unit = data["units"][0]

    summary = []
    for lesson in unit["lessons"]:
        lnum = lesson["lesson_num"]
        listening = next((s for s in lesson["steps"] if s.get("type") == "listening"), None)
        if not listening:
            print(f"L{lnum}: no listening step, skip")
            continue

        audio_text = listening.get("audio_text", "")
        if not audio_text.strip():
            print(f"L{lnum}: empty audio_text, skip")
            continue

        print(f"L{lnum} '{lesson['title']}' — generating...")
        segments = parse_dialogue(audio_text)

        mp3_parts = []
        for speaker, content in segments:
            voice_id = VOICES.get(speaker, VOICES["narrator"])
            print(f"  · {speaker:8s} ({voice_id[:10]}…): {content[:60]!r}")
            mp3 = tts_segment(content, voice_id)
            mp3_parts.append(mp3)
            # Small pause between speakers (silent MP3 frame would need ffmpeg;
            # ElevenLabs handles natural pauses inside text).
            time.sleep(0.2)

        out_path = out_dir / f"lesson_{lnum:02d}.mp3"
        with out_path.open("wb") as f:
            for part in mp3_parts:
                f.write(part)

        size_kb = out_path.stat().st_size / 1024
        url_path = f"/static/audio/stage3/unit01/lesson_{lnum:02d}.mp3"
        summary.append((lnum, url_path, size_kb, len(segments)))
        print(f"  ✓ Saved {out_path.name} ({size_kb:.1f} KB, {len(segments)} segments)")

    print()
    print("Summary:")
    print(f"{'L':3s} {'URL':50s} {'Size':>10s} {'Segs':>5s}")
    for lnum, url_path, size_kb, segs in summary:
        print(f"{lnum:3d} {url_path:50s} {size_kb:>8.1f}KB {segs:>5d}")

    print()
    print("Next step: update enriched JSON `listening.audio_url` for each lesson.")


if __name__ == "__main__":
    main()
