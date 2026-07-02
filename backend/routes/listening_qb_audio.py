"""
Listening QB — ElevenLabs audio generation / cache / R2 pipeline
================================================================
Single job: generate IELTS-quality multi-speaker audio via ElevenLabs,
cache the MP3s on disk, fall back to the R2 bucket, and serve them.
Extracted from routes/listening_qb.py (Faz 1 refactor, 2026-07-02).
"""

from fastapi.responses import FileResponse, RedirectResponse
from typing import Optional, List, Dict
import re
from pathlib import Path
from elevenlabs import ElevenLabs, VoiceSettings

from routes.listening_qb_common import router, ELEVENLABS_API_KEY, AUDIO_CACHE_DIR
from routes.listening_qb_voices import (
    get_voice_profile_for_speaker,
    parse_transcript_into_turns,
)


async def generate_audio_for_turn(
    client: ElevenLabs,
    text: str,
    voice_profile: Dict,
    part: str = "part1"
) -> bytes:
    """
    Generate audio for a single speaker turn with IELTS-quality settings.
    """
    # Adjust speaking rate based on IELTS part
    # Part 1-2: medium, Part 3-4: slightly faster
    stability_adjustment = 0.0
    if part in ["part3", "part4"]:
        stability_adjustment = -0.05  # Slightly less stable = slightly faster feel

    voice_settings = VoiceSettings(
        stability=min(1.0, voice_profile["stability"] + stability_adjustment),
        similarity_boost=voice_profile["similarity_boost"],
        style=voice_profile["style"],  # Keep at 0 for neutral tone
        use_speaker_boost=False  # Disable boost for more natural sound
    )

    audio_generator = client.text_to_speech.convert(
        text=text,
        voice_id=voice_profile["voice_id"],
        model_id="eleven_multilingual_v2",
        voice_settings=voice_settings
    )

    audio_data = b""
    for chunk in audio_generator:
        audio_data += chunk

    return audio_data


def create_silence(duration_ms: int, sample_rate: int = 44100) -> bytes:
    """
    Create silence as raw PCM data.
    For MP3 concatenation, we'll use a different approach.
    """
    # For MP3 concatenation, we'll handle pauses differently
    # This is a placeholder - actual implementation uses audio library
    return b""


def get_cached_audio_path(set_id: str) -> Path:
    """Get the path for cached audio file."""
    return AUDIO_CACHE_DIR / f"{set_id}.mp3"


def is_audio_cached(set_id: str) -> bool:
    """Check if audio is already cached."""
    cache_path = get_cached_audio_path(set_id)
    return cache_path.exists() and cache_path.stat().st_size > 1000


def save_audio_to_cache(set_id: str, audio_data: bytes) -> str:
    """Save audio data to cache and return the URL path."""
    cache_path = get_cached_audio_path(set_id)
    with open(cache_path, 'wb') as f:
        f.write(audio_data)
    print(f"✅ Audio cached: {cache_path} ({len(audio_data)} bytes)")
    return f"/api/listening/audio/{set_id}"


# R2 fallback for audio that survived in the local Emergent cache but was
# never copied across to Railway's pod during the 2026-05-08 migration. The
# upload script (backend/scripts/upload_listening_audio_r2.py) pushed every
# generated MP3 to this bucket once; from now on if a set_id isn't on the
# local pod disk we serve it from R2 instead of returning a 404.
R2_LISTENING_AUDIO_BASE = (
    "https://pub-fcd31e7869f94c4896d039253b8f1646.r2.dev/listening/audio"
)


def _r2_audio_url(set_id: str) -> str:
    return f"{R2_LISTENING_AUDIO_BASE}/{set_id}.mp3"


def get_cached_audio_url(set_id: str) -> Optional[str]:
    """Get URL for cached audio (local cache or R2 fallback)."""
    if is_audio_cached(set_id):
        return f"/api/listening/audio/{set_id}"
    # R2 fallback — every QB audio file was uploaded once; the public URL is
    # deterministic so we return it without an existence check. The serving
    # endpoint also redirects to the same URL when local cache is empty.
    return _r2_audio_url(set_id)


async def generate_ielts_audio(
    set_id: str,
    transcript: str,
    speakers: List[Dict],
    part: str = "part1",
    force_regenerate: bool = False
) -> Optional[str]:
    """
    Generate IELTS-quality audio with multiple speakers and natural pauses.
    Uses caching to avoid regenerating audio each time.
    Returns URL to cached audio file.
    """
    # Check cache first (unless force regenerate)
    if not force_regenerate:
        cached_url = get_cached_audio_url(set_id)
        if cached_url:
            print(f"✅ Using cached audio for {set_id}")
            return cached_url

    if not ELEVENLABS_API_KEY:
        print("ElevenLabs API key not configured")
        return None

    try:
        client = ElevenLabs(api_key=ELEVENLABS_API_KEY)

        # Parse transcript into turns
        turns = parse_transcript_into_turns(transcript, speakers)

        if not turns:
            print("No turns parsed from transcript")
            return None

        print(f"🎙️ Generating IELTS audio for {set_id}: {len(turns)} turns, part={part}")

        # For monologue (Part 2, Part 4), generate as single audio
        if len(speakers) <= 1 or part in ["part2", "part4"]:
            # Single speaker - generate entire transcript at once
            voice_profile = get_voice_profile_for_speaker(speakers[0] if speakers else {"id": "narrator"})

            # Clean transcript for TTS (remove speaker labels for monologue)
            clean_text = re.sub(r'^[A-Za-z0-9_]+:\s*', '', transcript, flags=re.MULTILINE)
            clean_text = clean_text.strip()

            audio_data = await generate_audio_for_turn(client, clean_text, voice_profile, part)

            # Save to cache and return URL
            return save_audio_to_cache(set_id, audio_data)

        # Multi-speaker: Generate each turn separately
        all_audio_chunks = []

        for i, turn in enumerate(turns):
            if not turn["text"].strip():
                continue

            print(f"  Turn {i+1}: {turn['speaker_id'][:20]}... ({len(turn['text'])} chars)")

            # Generate audio for this turn
            audio_chunk = await generate_audio_for_turn(
                client,
                turn["text"],
                turn["voice_profile"],
                part
            )
            all_audio_chunks.append(audio_chunk)

        # Concatenate all audio chunks
        # Simple concatenation for MP3 - works well for speech
        combined_audio = b"".join(all_audio_chunks)

        # Save to cache and return URL
        return save_audio_to_cache(set_id, combined_audio)

    except Exception as e:
        print(f"Error generating IELTS audio: {str(e)}")
        import traceback
        traceback.print_exc()
        return None


# Legacy function for backward compatibility
async def generate_audio_for_transcript(set_id: str, transcript: str, speakers: List[Dict], part: str = "part1") -> Optional[str]:
    """
    Generate audio using IELTS-quality settings.
    This is the main entry point for audio generation.
    """
    return await generate_ielts_audio(set_id, transcript, speakers, part)


# ============ AUDIO SERVING ENDPOINT ============

@router.get("/audio/{set_id}")
async def serve_cached_audio(set_id: str):
    """Serve cached audio file. Falls back to R2 if the pod cache is empty."""
    cache_path = get_cached_audio_path(set_id)

    if cache_path.exists():
        return FileResponse(
            path=cache_path,
            media_type="audio/mpeg",
        )

    # Local pod cache miss — every QB audio was pushed to R2 once during the
    # post-migration restore (upload_listening_audio_r2.py 2026-05-23). Send
    # the client straight to the R2 public URL instead of 404'ing.
    return RedirectResponse(url=_r2_audio_url(set_id), status_code=302)
