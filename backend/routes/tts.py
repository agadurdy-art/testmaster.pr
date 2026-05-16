"""
Text-to-Speech API Routes using ElevenLabs
For IELTS Speaking test question audio generation
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from typing import List, Optional
import os
import hashlib
import base64
from pathlib import Path

router = APIRouter(prefix="/api/tts", tags=["tts"])

# ElevenLabs client
ELEVENLABS_API_KEY = os.environ.get("ELEVENLABS_API_KEY")

# Cache directory for generated audio. Override via TTS_CACHE_DIR for local
# dev (macOS SIP makes /app/ unwritable); prod keeps default.
AUDIO_CACHE_DIR = Path(os.environ.get("TTS_CACHE_DIR", "/app/backend/static/audio/tts_cache"))
AUDIO_CACHE_DIR.mkdir(parents=True, exist_ok=True)

# Default voice settings for IELTS examiner.
# Override via LIZ_VOICE_ID env var. Default is Rachel (paid library voice);
# free tier accounts must set LIZ_VOICE_ID to a premade voice id (e.g. Sarah
# `EXAVITQu4vr4xnSDxMaL` or Bella `hpp4J3VqNfWAUOO0d1Us`).
DEFAULT_VOICE_ID = os.environ.get("LIZ_VOICE_ID", "21m00Tcm4TlvDq8ikWAM")
EXAMINER_VOICE_SETTINGS = {
    "stability": 0.7,
    "similarity_boost": 0.8,
    "style": 0.3,
    "use_speaker_boost": True
}

class TTSRequest(BaseModel):
    text: str
    voice_id: Optional[str] = DEFAULT_VOICE_ID
    email: Optional[str] = None  # required by soft-auth gate (pre-launch audit 2026-05-16)

class TTSBatchRequest(BaseModel):
    texts: List[str]
    voice_id: Optional[str] = DEFAULT_VOICE_ID
    include_transitions: bool = True
    email: Optional[str] = None  # required by soft-auth gate (pre-launch audit 2026-05-16)

class TTSResponse(BaseModel):
    audio_url: str
    cached: bool = False

def get_cache_path(text: str, voice_id: str) -> Path:
    """Generate cache file path based on text hash"""
    text_hash = hashlib.md5(f"{text}_{voice_id}".encode()).hexdigest()
    return AUDIO_CACHE_DIR / f"{text_hash}.mp3"

@router.post("/generate", response_model=TTSResponse)
async def generate_tts(request: TTSRequest):
    """Generate text-to-speech audio using ElevenLabs.

    Auth model (Codex audit P0, #93 — 2026-05-16):
      - Authenticated (email present + verified): full path — cache lookup,
        fall through to ElevenLabs generation if missing, write to cache.
      - Anonymous (no email): cache-only — return cached audio if the
        text+voice hash already exists on disk, otherwise 403. This makes
        /api/tts/generate cost-bomb-proof for anon traffic; bots cannot
        burn ElevenLabs minutes by sending novel text. The sample pages
        (/samples/speaking/band-6-5-part2 etc.) play a fixed handful of
        strings — once warmed (by an authed admin call or first signed-in
        user), anon clients just fetch the cached MP3.
    """
    is_anon = not request.email
    if request.email:
        from security_utils import require_known_user
        await require_known_user(request.email)
    # Bound per-request cost even for authed users. ElevenLabs charges by
    # character; an 800-char cap is well above any UI string we currently
    # synthesize but below pathological payloads.
    if len(request.text or "") > 800:
        raise HTTPException(status_code=413, detail="Text too long for TTS")
    try:
        from elevenlabs import ElevenLabs, VoiceSettings

        if not ELEVENLABS_API_KEY:
            raise HTTPException(status_code=500, detail="ElevenLabs API key not configured")

        # Check cache first
        cache_path = get_cache_path(request.text, request.voice_id)
        if cache_path.exists():
            return TTSResponse(
                audio_url=f"/api/static/audio/tts_cache/{cache_path.name}",
                cached=True
            )
        # Anonymous callers may only fetch already-cached audio. First
        # generation of any new string must come from an authed request;
        # this turns the anon path into a static-file fetch and removes
        # the ElevenLabs cost-bomb vector.
        if is_anon:
            raise HTTPException(
                status_code=403,
                detail="TTS generation requires authentication",
            )

        # Generate new audio
        client = ElevenLabs(api_key=ELEVENLABS_API_KEY)
        
        voice_settings = VoiceSettings(
            stability=EXAMINER_VOICE_SETTINGS["stability"],
            similarity_boost=EXAMINER_VOICE_SETTINGS["similarity_boost"],
            style=EXAMINER_VOICE_SETTINGS["style"],
            use_speaker_boost=EXAMINER_VOICE_SETTINGS["use_speaker_boost"]
        )
        
        audio_generator = client.text_to_speech.convert(
            text=request.text,
            voice_id=request.voice_id,
            model_id="eleven_multilingual_v2",
            voice_settings=voice_settings
        )
        
        # Collect audio data
        audio_data = b""
        for chunk in audio_generator:
            audio_data += chunk
        
        # Save to cache
        with open(cache_path, 'wb') as f:
            f.write(audio_data)
        
        return TTSResponse(
            audio_url=f"/api/static/audio/tts_cache/{cache_path.name}",
            cached=False
        )
        
    except Exception as e:
        print(f"TTS Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating TTS: {str(e)}")

@router.post("/speaking-questions")
async def generate_speaking_questions_audio(request: TTSBatchRequest):
    """Generate audio for multiple speaking questions with natural transitions"""
    from security_utils import require_known_user
    await require_known_user(request.email)
    try:
        from elevenlabs import ElevenLabs, VoiceSettings

        if not ELEVENLABS_API_KEY:
            raise HTTPException(status_code=500, detail="ElevenLabs API key not configured")
        
        client = ElevenLabs(api_key=ELEVENLABS_API_KEY)
        
        voice_settings = VoiceSettings(
            stability=EXAMINER_VOICE_SETTINGS["stability"],
            similarity_boost=EXAMINER_VOICE_SETTINGS["similarity_boost"],
            style=EXAMINER_VOICE_SETTINGS["style"],
            use_speaker_boost=EXAMINER_VOICE_SETTINGS["use_speaker_boost"]
        )
        
        results = []
        
        # Natural transitions for between questions
        transitions = [
            "Now, let me ask you...",
            "Moving on...",
            "And what about...",
            "Let's talk about...",
            "I'd like to ask you...",
            "Now tell me..."
        ]
        
        for idx, text in enumerate(request.texts):
            # Check cache
            cache_path = get_cache_path(text, request.voice_id)
            
            if cache_path.exists():
                results.append({
                    "text": text,
                    "audio_url": f"/api/static/audio/tts_cache/{cache_path.name}",
                    "cached": True
                })
                continue
            
            # Add natural transition for questions after the first one
            full_text = text
            if request.include_transitions and idx > 0:
                transition = transitions[idx % len(transitions)]
                full_text = f"{transition} {text}"
            
            # Generate audio
            audio_generator = client.text_to_speech.convert(
                text=full_text,
                voice_id=request.voice_id,
                model_id="eleven_multilingual_v2",
                voice_settings=voice_settings
            )
            
            audio_data = b""
            for chunk in audio_generator:
                audio_data += chunk
            
            # Save to cache (use original text for cache key)
            with open(cache_path, 'wb') as f:
                f.write(audio_data)
            
            results.append({
                "text": text,
                "audio_url": f"/api/static/audio/tts_cache/{cache_path.name}",
                "cached": False
            })
        
        return {"success": True, "questions": results}
        
    except Exception as e:
        print(f"TTS Batch Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating TTS: {str(e)}")

@router.get("/voices")
async def get_available_voices():
    """Get list of available ElevenLabs voices"""
    try:
        from elevenlabs import ElevenLabs
        
        if not ELEVENLABS_API_KEY:
            raise HTTPException(status_code=500, detail="ElevenLabs API key not configured")
        
        client = ElevenLabs(api_key=ELEVENLABS_API_KEY)
        voices_response = client.voices.get_all()
        
        # Return simplified voice list
        voices = []
        for voice in voices_response.voices:
            voices.append({
                "voice_id": voice.voice_id,
                "name": voice.name,
                "category": voice.category if hasattr(voice, 'category') else "unknown"
            })
        
        return {"success": True, "voices": voices}
        
    except Exception as e:
        print(f"Voices Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting voices: {str(e)}")

print("✅ TTS routes loaded")
