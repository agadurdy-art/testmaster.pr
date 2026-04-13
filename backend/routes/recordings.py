"""
User Recordings API Routes
Save and manage user voice recordings for Speaking tests
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional
import os
from pathlib import Path
from datetime import datetime
import uuid

router = APIRouter(prefix="/api/recordings", tags=["recordings"])

# Directory for user recordings
RECORDINGS_DIR = Path("/app/backend/static/audio/user_recordings")
RECORDINGS_DIR.mkdir(parents=True, exist_ok=True)

class RecordingMetadata(BaseModel):
    recording_id: str
    user_id: str
    test_id: str
    section: str
    part: int
    question_index: Optional[int] = None
    filename: str
    created_at: str
    duration: Optional[float] = None

@router.post("/save")
async def save_recording(
    audio: UploadFile = File(...),
    user_id: str = Form(...),
    test_id: str = Form(...),
    section: str = Form(...),
    part: int = Form(...),
    question_index: Optional[int] = Form(None)
):
    """Save a user's voice recording"""
    try:
        # Generate unique filename
        recording_id = str(uuid.uuid4())[:8]
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Create user directory if not exists
        user_dir = RECORDINGS_DIR / user_id / test_id
        user_dir.mkdir(parents=True, exist_ok=True)
        
        # Determine file extension from content type
        ext = "webm"
        if audio.content_type:
            if "mp3" in audio.content_type:
                ext = "mp3"
            elif "wav" in audio.content_type:
                ext = "wav"
            elif "ogg" in audio.content_type:
                ext = "ogg"
        
        filename = f"{section}_part{part}_{timestamp}_{recording_id}.{ext}"
        filepath = user_dir / filename
        
        # Save the file
        content = await audio.read()
        with open(filepath, 'wb') as f:
            f.write(content)
        
        # Return metadata
        return {
            "success": True,
            "recording_id": recording_id,
            "filename": filename,
            "path": f"/static/audio/user_recordings/{user_id}/{test_id}/{filename}",
            "size": len(content)
        }
        
    except Exception as e:
        print(f"Recording save error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error saving recording: {str(e)}")

@router.get("/list/{user_id}/{test_id}")
async def list_recordings(user_id: str, test_id: str):
    """List all recordings for a user's test session"""
    try:
        user_dir = RECORDINGS_DIR / user_id / test_id
        
        if not user_dir.exists():
            return {"success": True, "recordings": []}
        
        recordings = []
        for file in user_dir.iterdir():
            if file.is_file():
                # Parse filename: section_partN_timestamp_id.ext
                parts = file.stem.split('_')
                recordings.append({
                    "filename": file.name,
                    "section": parts[0] if len(parts) > 0 else "unknown",
                    "part": int(parts[1].replace('part', '')) if len(parts) > 1 else 0,
                    "path": f"/static/audio/user_recordings/{user_id}/{test_id}/{file.name}",
                    "size": file.stat().st_size,
                    "created_at": datetime.fromtimestamp(file.stat().st_mtime).isoformat()
                })
        
        # Sort by creation time
        recordings.sort(key=lambda x: x['created_at'], reverse=True)
        
        return {"success": True, "recordings": recordings}
        
    except Exception as e:
        print(f"List recordings error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error listing recordings: {str(e)}")

@router.delete("/{user_id}/{test_id}/{filename}")
async def delete_recording(user_id: str, test_id: str, filename: str):
    """Delete a specific recording"""
    try:
        filepath = RECORDINGS_DIR / user_id / test_id / filename
        
        if not filepath.exists():
            raise HTTPException(status_code=404, detail="Recording not found")
        
        os.remove(filepath)
        
        return {"success": True, "message": "Recording deleted"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Delete recording error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error deleting recording: {str(e)}")

print("✅ Recording routes loaded")
