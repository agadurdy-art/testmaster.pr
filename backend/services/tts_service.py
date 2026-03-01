"""
ElevenLabs Text-to-Speech Service
Generates child-friendly, slow-paced audio for vocabulary and listening activities.
"""

import os
import hashlib
import base64
from pathlib import Path
from elevenlabs import ElevenLabs, VoiceSettings

# Audio cache directory
AUDIO_DIR = Path("/app/backend/static/audio")
AUDIO_DIR.mkdir(parents=True, exist_ok=True)


class TTSService:
    """ElevenLabs TTS service for generating lesson audio"""
    
    def __init__(self):
        api_key = os.environ.get('ELEVENLABS_API_KEY')
        if not api_key:
            raise ValueError("ELEVENLABS_API_KEY not found")
        self.client = ElevenLabs(api_key=api_key)
        # Rachel voice - clear, friendly female voice good for kids
        self.voice_id = "21m00Tcm4TlvDq8ikWAM"
    
    def _cache_key(self, text: str) -> str:
        return hashlib.md5(text.lower().strip().encode()).hexdigest()
    
    def _cached_path(self, text: str) -> Path:
        return AUDIO_DIR / f"{self._cache_key(text)}.mp3"
    
    def generate_audio(self, text: str) -> str:
        """Generate TTS audio and return relative URL path. Uses cache."""
        cached = self._cached_path(text)
        if cached.exists():
            return f"/static/audio/{cached.name}"
        
        try:
            audio_generator = self.client.text_to_speech.convert(
                text=text,
                voice_id=self.voice_id,
                model_id="eleven_multilingual_v2",
                voice_settings=VoiceSettings(
                    stability=0.75,
                    similarity_boost=0.75,
                    style=0.0,
                    use_speaker_boost=True,
                ),
            )
            
            audio_data = b""
            for chunk in audio_generator:
                audio_data += chunk
            
            if not audio_data:
                return ""
            
            cached.write_bytes(audio_data)
            return f"/static/audio/{cached.name}"
        except Exception as e:
            print(f"TTS generation failed for '{text[:30]}': {e}")
            return ""
    
    def generate_audio_base64(self, text: str) -> str:
        """Generate TTS audio and return as base64 data URL"""
        cached = self._cached_path(text)
        if cached.exists():
            audio_data = cached.read_bytes()
        else:
            try:
                audio_generator = self.client.text_to_speech.convert(
                    text=text,
                    voice_id=self.voice_id,
                    model_id="eleven_multilingual_v2",
                    voice_settings=VoiceSettings(
                        stability=0.75,
                        similarity_boost=0.75,
                        style=0.0,
                        use_speaker_boost=True,
                    ),
                )
                audio_data = b""
                for chunk in audio_generator:
                    audio_data += chunk
                if not audio_data:
                    return ""
                cached.write_bytes(audio_data)
            except Exception as e:
                print(f"TTS generation failed: {e}")
                return ""
        
        b64 = base64.b64encode(audio_data).decode()
        return f"data:audio/mpeg;base64,{b64}"


# Singleton
_tts_service = None

def get_tts_service() -> TTSService:
    global _tts_service
    if _tts_service is None:
        _tts_service = TTSService()
    return _tts_service
