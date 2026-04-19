"""
Audio Streaming API Routes
Serve audio files for IELTS tests
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path
import os

router = APIRouter(prefix="/api/audio", tags=["audio"])

# Audio directory
AUDIO_DIR = Path("/app/backend/static/audio")

@router.get("/cambridge/{book}/{filename}")
async def get_cambridge_audio(book: str, filename: str):
    """Serve Cambridge IELTS audio files"""
    # Sanitize inputs
    book = book.replace("..", "").replace("/", "")
    filename = filename.replace("..", "").replace("/", "")
    
    audio_path = AUDIO_DIR / "cambridge" / book / filename
    
    if not audio_path.exists():
        raise HTTPException(status_code=404, detail=f"Audio file not found: {filename}")
    
    return FileResponse(
        path=str(audio_path),
        media_type="audio/mpeg",
        filename=filename
    )

@router.get("/tts/{filename}")
async def get_tts_audio(filename: str):
    """Serve TTS cached audio files"""
    filename = filename.replace("..", "").replace("/", "")
    
    audio_path = AUDIO_DIR / "tts_cache" / filename
    
    if not audio_path.exists():
        raise HTTPException(status_code=404, detail=f"TTS audio not found: {filename}")
    
    return FileResponse(
        path=str(audio_path),
        media_type="audio/mpeg",
        filename=filename
    )

@router.get("/recordings/{user_id}/{test_id}/{filename}")
async def get_user_recording(user_id: str, test_id: str, filename: str):
    """Serve user recording files"""
    # Sanitize inputs
    user_id = user_id.replace("..", "").replace("/", "")
    test_id = test_id.replace("..", "").replace("/", "")
    filename = filename.replace("..", "").replace("/", "")
    
    audio_path = AUDIO_DIR / "user_recordings" / user_id / test_id / filename
    
    if not audio_path.exists():
        raise HTTPException(status_code=404, detail="Recording not found")
    
    return FileResponse(
        path=str(audio_path),
        media_type="audio/webm",
        filename=filename
    )

print("✅ Audio routes loaded")
