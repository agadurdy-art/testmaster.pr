#!/usr/bin/env python3
"""Unit 2 listening TTS — same persona mapping as Unit 1, output to unit02 folder."""

import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

VOICES = {
    "narrator": "pFZP5JQG7iQjIQuC4Bku",
    "linh":     "pFZP5JQG7iQjIQuC4Bku",
    "mai":      "XB0fDUnXU5powFXDhCwa",
    "minh":     "IKne3meq5aSn9XLyUdCD",
    "ray":      "pqHfZKP75CvOlQylNhV4",
    "tom":      "nPczCjzI2devNBz1zQrb",
    "sophie":   "Xb7hH8MSUJpSbSDYk0k2",
    "lucas":    "TX3LPaxmHKxFdv7VOQHJ",
}
SPEED = 0.92
VOICE_SETTINGS = {"stability": 0.55, "similarity_boost": 0.75, "style": 0.25, "use_speaker_boost": True, "speed": SPEED}
MODEL = "eleven_multilingual_v2"
API_KEY = os.environ.get("ELEVENLABS_API_KEY")
API_BASE = "https://api.elevenlabs.io/v1"
SPEAKER_PATTERN = re.compile(r"\b(Ray|Linh|Mai|Minh|Tom|Sophie|Lucas|Narrator)\s*:\s*", re.IGNORECASE)


def parse_dialogue(text):
    parts = SPEAKER_PATTERN.split(text)
    result = []
    if parts[0].strip():
        result.append(("narrator", parts[0].strip()))
    for i in range(1, len(parts), 2):
        sp = parts[i].lower()
        content = parts[i + 1].strip() if i + 1 < len(parts) else ""
        if content:
            result.append((sp, content))
    if not result:
        result.append(("narrator", text.strip()))
    return result


def tts_segment(text, voice_id):
    url = f"{API_BASE}/text-to-speech/{voice_id}"
    headers = {"xi-api-key": API_KEY, "Content-Type": "application/json", "Accept": "audio/mpeg"}
    payload = {"text": text, "model_id": MODEL, "voice_settings": VOICE_SETTINGS}
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
                time.sleep(2 * (attempt + 1)); continue
            raise
        except urllib.error.URLError as exc:
            print(f"    {exc}", file=sys.stderr)
            if attempt < 2:
                time.sleep(2 * (attempt + 1)); continue
            raise
    raise RuntimeError("TTS failed")


def main():
    if not API_KEY:
        print("ERROR: ELEVENLABS_API_KEY missing", file=sys.stderr); sys.exit(1)
    repo_root = Path(__file__).resolve().parent.parent.parent
    unit_path = repo_root / "backend" / "content" / "enriched" / "stage3_unit02_enriched.json"
    out_dir = repo_root / "backend" / "static" / "audio" / "stage3" / "unit02"
    out_dir.mkdir(parents=True, exist_ok=True)
    data = json.loads(unit_path.read_text())
    unit = data["units"][0]
    for lesson in unit["lessons"]:
        lnum = lesson["lesson_num"]
        listening = next((s for s in lesson["steps"] if s.get("type") == "listening"), None)
        if not listening:
            print(f"L{lnum}: no listening, skip"); continue
        audio_text = listening.get("audio_text", "")
        if not audio_text.strip():
            continue
        print(f"L{lnum} '{lesson['title']}' — generating...")
        segments = parse_dialogue(audio_text)
        mp3_parts = []
        for speaker, content in segments:
            voice_id = VOICES.get(speaker, VOICES["narrator"])
            print(f"  · {speaker:8s}: {content[:55]!r}")
            mp3_parts.append(tts_segment(content, voice_id))
            time.sleep(0.2)
        out_path = out_dir / f"lesson_{lnum:02d}.mp3"
        with out_path.open("wb") as f:
            for part in mp3_parts:
                f.write(part)
        size_kb = out_path.stat().st_size / 1024
        print(f"  ✓ Saved {out_path.name} ({size_kb:.0f} KB)")


if __name__ == "__main__":
    main()
