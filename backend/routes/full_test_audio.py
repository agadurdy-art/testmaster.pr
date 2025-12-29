"""
Full Test Mode Audio API Routes
================================
Endpoints for generating and serving audio files for Full Test Mode.
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse, StreamingResponse
from typing import Dict, Optional
import os
from pathlib import Path

router = APIRouter(prefix="/api/full-test/audio", tags=["Full Test Audio"])

# Import the audio generator service
try:
    from services.audio_generator import audio_generator
except ImportError:
    audio_generator = None
    print("Warning: audio_generator service not available")

# Import test data
try:
    from content.full_tests.academic.set_a import ACADEMIC_SET_A
    from content.full_tests.academic.set_a_reading import ACADEMIC_SET_A_READING
except ImportError:
    ACADEMIC_SET_A = None
    ACADEMIC_SET_A_READING = None

AUDIO_BASE_PATH = Path("/app/backend/static/audio/full_tests")


@router.get("/stream/{test_id}/listening/{part_number}")
async def stream_listening_audio(test_id: str, part_number: int):
    """
    Stream listening audio for a specific part.
    This endpoint serves the audio file directly.
    """
    audio_path = AUDIO_BASE_PATH / test_id / "listening" / f"listening_part{part_number}.mp3"
    
    if not audio_path.exists():
        raise HTTPException(status_code=404, detail=f"Audio file not found for part {part_number}")
    
    return FileResponse(
        path=str(audio_path),
        media_type="audio/mpeg",
        filename=f"listening_part{part_number}.mp3"
    )


@router.get("/stream/{test_id}/speaking/{question_id}")
async def stream_speaking_audio(test_id: str, question_id: str):
    """
    Stream speaking question audio.
    """
    # Search for the audio file
    speaking_path = AUDIO_BASE_PATH / test_id / "speaking"
    
    if not speaking_path.exists():
        raise HTTPException(status_code=404, detail="Speaking audio directory not found")
    
    # Find matching file
    for file in speaking_path.iterdir():
        if question_id in file.name:
            return FileResponse(
                path=str(file),
                media_type="audio/mpeg",
                filename=file.name
            )
    
    raise HTTPException(status_code=404, detail=f"Audio file not found for question {question_id}")


@router.get("/status/{test_id}")
async def get_audio_status(test_id: str):
    """
    Check the status of audio files for a test.
    
    Returns which audio files exist and which need to be generated.
    """
    base_path = f"/app/backend/static/audio/full_tests/{test_id}"
    
    listening_path = os.path.join(base_path, "listening")
    speaking_path = os.path.join(base_path, "speaking")
    
    listening_files = []
    speaking_files = []
    
    if os.path.exists(listening_path):
        listening_files = os.listdir(listening_path)
    
    if os.path.exists(speaking_path):
        speaking_files = os.listdir(speaking_path)
    
    return {
        "success": True,
        "test_id": test_id,
        "listening": {
            "files_count": len(listening_files),
            "files": listening_files
        },
        "speaking": {
            "files_count": len(speaking_files),
            "files": speaking_files
        },
        "fully_cached": len(listening_files) >= 4 and len(speaking_files) >= 10
    }


@router.post("/generate/listening/{test_id}")
async def generate_listening_audio(
    test_id: str,
    background_tasks: BackgroundTasks,
    part: Optional[int] = None
):
    """
    Generate listening audio for a test.
    
    Can generate all parts or a specific part.
    Uses background task for long-running generation.
    """
    if not audio_generator:
        raise HTTPException(status_code=503, detail="Audio generator service not available")
    
    if test_id != "academic_set_a_01" or not ACADEMIC_SET_A:
        raise HTTPException(status_code=404, detail="Test not found")
    
    # Merge test data
    test_data = ACADEMIC_SET_A.copy()
    test_data["sections"]["reading"] = ACADEMIC_SET_A_READING
    
    if part:
        # Generate specific part
        listening = test_data["sections"]["listening"]
        target_part = next((p for p in listening["parts"] if p["part_number"] == part), None)
        
        if not target_part:
            raise HTTPException(status_code=404, detail=f"Part {part} not found")
        
        result = await audio_generator.generate_listening_part_audio(
            test_id=test_id,
            part_number=part,
            audio_script=target_part.get("audio_script", ""),
            speakers=target_part.get("speakers", ["Narrator"]),
            context=target_part.get("context", "")
        )
        
        return {
            "success": True,
            "test_id": test_id,
            "part": part,
            "result": result
        }
    else:
        # Generate all parts
        results = await audio_generator.generate_all_listening_audio(test_data)
        
        return {
            "success": True,
            "test_id": test_id,
            "results": results
        }


@router.post("/generate/speaking/{test_id}")
async def generate_speaking_audio(
    test_id: str,
    part: Optional[int] = None
):
    """
    Generate speaking question audio for a test.
    """
    if not audio_generator:
        raise HTTPException(status_code=503, detail="Audio generator service not available")
    
    if test_id != "academic_set_a_01" or not ACADEMIC_SET_A:
        raise HTTPException(status_code=404, detail="Test not found")
    
    test_data = ACADEMIC_SET_A.copy()
    
    results = await audio_generator.generate_all_speaking_audio(test_data)
    
    return {
        "success": True,
        "test_id": test_id,
        "results": results
    }


@router.get("/listening/{test_id}/part/{part_number}")
async def get_listening_part_info(test_id: str, part_number: int):
    """
    Get information about a specific listening part's audio.
    """
    base_path = f"/app/backend/static/audio/full_tests/{test_id}/listening"
    
    if not os.path.exists(base_path):
        return {
            "success": False,
            "message": "Audio not yet generated",
            "test_id": test_id,
            "part_number": part_number
        }
    
    # Find matching audio file
    for filename in os.listdir(base_path):
        if f"part{part_number}" in filename:
            return {
                "success": True,
                "audio_url": f"/static/audio/full_tests/{test_id}/listening/{filename}",
                "test_id": test_id,
                "part_number": part_number
            }
    
    return {
        "success": False,
        "message": f"Audio for part {part_number} not found",
        "test_id": test_id,
        "part_number": part_number
    }
