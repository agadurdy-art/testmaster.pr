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

try:
    from content.full_tests.general.set_a import GENERAL_SET_A
except ImportError:
    GENERAL_SET_A = None

# Import Set B content
try:
    from content.full_tests.academic.set_b import ACADEMIC_SET_B
    from content.full_tests.academic.set_b_reading import ACADEMIC_SET_B_READING
except ImportError:
    ACADEMIC_SET_B = None
    ACADEMIC_SET_B_READING = None

try:
    from content.full_tests.general.set_b import GENERAL_SET_B
except ImportError:
    GENERAL_SET_B = None

# Import Set C content
try:
    from content.full_tests.academic.set_c import ACADEMIC_SET_C
    from content.full_tests.academic.set_c_reading import ACADEMIC_SET_C_READING
except ImportError:
    ACADEMIC_SET_C = None
    ACADEMIC_SET_C_READING = None

try:
    from content.full_tests.general.set_c import GENERAL_SET_C
except ImportError:
    GENERAL_SET_C = None

# Import Set D content
try:
    from content.full_tests.academic.set_d import ACADEMIC_SET_D
    from content.full_tests.academic.set_d_reading import ACADEMIC_SET_D_READING
except ImportError:
    ACADEMIC_SET_D = None
    ACADEMIC_SET_D_READING = None

try:
    from content.full_tests.general.set_d import GENERAL_SET_D
except ImportError:
    GENERAL_SET_D = None

# Import Set E content
try:
    from content.full_tests.academic.set_e import ACADEMIC_SET_E
except ImportError:
    ACADEMIC_SET_E = None

# Import Set F content
try:
    from content.full_tests.academic.set_f import ACADEMIC_SET_F
except ImportError:
    ACADEMIC_SET_F = None

# Import Set G content
try:
    from content.full_tests.academic.set_g import ACADEMIC_SET_G
except ImportError:
    ACADEMIC_SET_G = None

# Import Set H content
try:
    from content.full_tests.academic.set_h import ACADEMIC_SET_H
except ImportError:
    ACADEMIC_SET_H = None

AUDIO_BASE_PATH = Path("/app/backend/static/audio/full_tests")


@router.get("/stream/{test_id}/listening/{part_number}")
async def stream_listening_audio(test_id: str, part_number: int):
    """
    Stream listening audio for a specific part.
    This endpoint serves the audio file directly.
    """
    listening_path = AUDIO_BASE_PATH / test_id / "listening"
    
    if not listening_path.exists():
        raise HTTPException(status_code=404, detail=f"Listening audio directory not found for {test_id}")
    
    # Search for file matching the part number (files have hash suffix)
    for file in listening_path.iterdir():
        if file.name.startswith(f"listening_part{part_number}_") and file.suffix == ".mp3":
            return FileResponse(
                path=str(file),
                media_type="audio/mpeg",
                filename=f"listening_part{part_number}.mp3"
            )
    
    raise HTTPException(status_code=404, detail=f"Audio file not found for part {part_number}")


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
    
    # Get the appropriate test data
    test_data = None
    test_type = "academic"
    
    if test_id == "academic_set_a_01" and ACADEMIC_SET_A:
        test_data = ACADEMIC_SET_A.copy()
        test_data["sections"]["reading"] = ACADEMIC_SET_A_READING
    elif test_id == "academic_set_b_01" and ACADEMIC_SET_B:
        test_data = ACADEMIC_SET_B.copy()
        if ACADEMIC_SET_B_READING:
            test_data["sections"]["reading"] = ACADEMIC_SET_B_READING
    elif test_id == "academic_set_c_01" and ACADEMIC_SET_C:
        test_data = ACADEMIC_SET_C.copy()
        if ACADEMIC_SET_C_READING:
            test_data["sections"]["reading"] = ACADEMIC_SET_C_READING
    elif test_id == "academic_set_d_01" and ACADEMIC_SET_D:
        test_data = ACADEMIC_SET_D.copy()
        if ACADEMIC_SET_D_READING:
            test_data["sections"]["reading"] = ACADEMIC_SET_D_READING
    elif test_id == "general_set_a_01" and GENERAL_SET_A:
        test_data = GENERAL_SET_A.copy()
        test_type = "general"
    elif test_id == "general_set_b_01" and GENERAL_SET_B:
        test_data = GENERAL_SET_B.copy()
        test_type = "general"
    elif test_id == "general_set_c_01" and GENERAL_SET_C:
        test_data = GENERAL_SET_C.copy()
        test_type = "general"
    elif test_id == "general_set_d_01" and GENERAL_SET_D:
        test_data = GENERAL_SET_D.copy()
        test_type = "general"
    elif test_id == "academic_set_e_01" and ACADEMIC_SET_E:
        test_data = ACADEMIC_SET_E.copy()
    elif test_id == "academic_set_f_01" and ACADEMIC_SET_F:
        test_data = ACADEMIC_SET_F.copy()
    elif test_id == "academic_set_g_01" and ACADEMIC_SET_G:
        test_data = ACADEMIC_SET_G.copy()
    elif test_id == "academic_set_h_01" and ACADEMIC_SET_H:
        test_data = ACADEMIC_SET_H.copy()
    else:
        raise HTTPException(status_code=404, detail="Test not found")
    
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
            context=target_part.get("context", ""),
            test_type=test_type
        )
        
        return {
            "success": True,
            "test_id": test_id,
            "part": part,
            "result": result
        }
    else:
        # Generate all parts - add test_type to test_data
        test_data["test_type"] = test_type
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
