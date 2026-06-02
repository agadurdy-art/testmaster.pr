"""ElevenLabs TTS proxy so the JARVIS voice key stays server-side. Returns MP3
bytes for short status narration spoken by the control room."""
from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
# Reuse the project's existing ElevenLabs key from backend/.env.
load_dotenv(REPO_ROOT / "backend" / ".env")
load_dotenv(Path(__file__).resolve().parent / ".env")  # jarvis-local overrides

# JARVIS voice: Daniel — British male broadcaster (calm, authoritative). Turbo
# model keeps the assistant snappy; override via env if you want a different one.
JARVIS_VOICE_ID = os.environ.get("JARVIS_VOICE_ID", "onwK4e9ZLuTAKqWW03F9")
JARVIS_TTS_MODEL = os.environ.get("JARVIS_TTS_MODEL", "eleven_turbo_v2_5")

_client: ElevenLabs | None = None


def _get_client() -> ElevenLabs:
    global _client
    if _client is None:
        key = os.environ.get("ELEVENLABS_API_KEY")
        if not key:
            raise RuntimeError("ELEVENLABS_API_KEY missing")
        _client = ElevenLabs(api_key=key)
    return _client


def synthesize(text: str) -> bytes:
    client = _get_client()
    audio = client.text_to_speech.convert(
        text=text[:800],
        voice_id=JARVIS_VOICE_ID,
        model_id=JARVIS_TTS_MODEL,
        voice_settings={
            "stability": 0.45,
            "similarity_boost": 0.8,
            "style": 0.25,
            "use_speaker_boost": True,
        },
        output_format="mp3_44100_128",
    )
    return b"".join(chunk for chunk in audio)
