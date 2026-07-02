"""
Listening QB — shared router + audio-cache configuration
=========================================================
Single job: define the shared APIRouter, ElevenLabs key, and audio-cache
directory every listening_qb sub-module registers on / reads from.
Extracted from routes/listening_qb.py (Faz 1 refactor, 2026-07-02).
"""

from fastapi import APIRouter
import os
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/listening", tags=["Listening Question Bank"])

# ElevenLabs client
ELEVENLABS_API_KEY = os.environ.get("ELEVENLABS_API_KEY")

# Audio cache directory. Resolve relative to this file so the router boots in
# any environment (Emergent pod = /app/backend, local dev = /private/tmp/...)
# without import-time mkdir failures that silently 404 every QB endpoint.
_BACKEND_DIR = Path(__file__).resolve().parent.parent
AUDIO_CACHE_DIR = Path(os.environ.get(
    "LISTENING_AUDIO_CACHE_DIR",
    str(_BACKEND_DIR / "static/audio/listening"),
))
AUDIO_CACHE_DIR.mkdir(parents=True, exist_ok=True)
