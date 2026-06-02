"""
User Recordings API Routes
Save and manage user voice recordings for Speaking tests
"""

import re
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from fastapi.responses import FileResponse
from pydantic import BaseModel
import auth_session  # audit AUTHBE-7: recordings are user-owned (incl. delete)
from typing import Optional
import os
from pathlib import Path
from datetime import datetime
import uuid

router = APIRouter(prefix="/api/recordings", tags=["recordings"])

# Directory for user recordings. Resolve relative to this file so the router
# boots in any environment (Emergent pod = /app/backend, local dev =
# /private/tmp/.../backend) without import-time mkdir failures.
_BACKEND_DIR = Path(__file__).resolve().parent.parent
RECORDINGS_DIR = Path(os.environ.get(
    "USER_RECORDINGS_DIR",
    str(_BACKEND_DIR / "static/audio/user_recordings"),
))
RECORDINGS_DIR.mkdir(parents=True, exist_ok=True)
RECORDINGS_ROOT = RECORDINGS_DIR.resolve()

# Pre-launch audit (2026-05-16) flagged that user_id / test_id / filename
# came straight from form/path params and were joined onto RECORDINGS_DIR
# with no validation, so a caller could escape the directory with `..`
# segments (e.g. user_id="../../etc", filename="passwd"). These regexes
# reject anything that's not a safe identifier shape.
_SAFE_ID_RE = re.compile(r"^[A-Za-z0-9_.-]{1,128}$")
_SAFE_FILENAME_RE = re.compile(r"^[A-Za-z0-9_.-]{1,200}$")


def _safe_user_test(user_id: str, test_id: str) -> None:
    if not _SAFE_ID_RE.match(user_id) or not _SAFE_ID_RE.match(test_id):
        raise HTTPException(status_code=400, detail="Invalid user_id or test_id")
    if user_id.startswith(".") or test_id.startswith("."):
        raise HTTPException(status_code=400, detail="Invalid user_id or test_id")


def _resolve_inside_root(path: Path) -> Path:
    resolved = path.resolve()
    try:
        resolved.relative_to(RECORDINGS_ROOT)
    except ValueError:
        raise HTTPException(status_code=400, detail="Path traversal blocked")
    return resolved

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
    question_index: Optional[int] = Form(None),
    caller: dict = Depends(auth_session.current_user),
):
    auth_session.require_self_or_admin(user_id, caller)
    """Save a user's voice recording"""
    _safe_user_test(user_id, test_id)
    try:
        # Generate unique filename
        recording_id = str(uuid.uuid4())[:8]
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        # Create user directory if not exists (path-traversal blocked above)
        user_dir = _resolve_inside_root(RECORDINGS_DIR / user_id / test_id)
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
async def list_recordings(user_id: str, test_id: str, caller: dict = Depends(auth_session.current_user)):
    auth_session.require_self_or_admin(user_id, caller)
    """List all recordings for a user's test session"""
    _safe_user_test(user_id, test_id)
    try:
        user_dir = _resolve_inside_root(RECORDINGS_DIR / user_id / test_id)

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
async def delete_recording(user_id: str, test_id: str, filename: str, caller: dict = Depends(auth_session.current_user)):
    auth_session.require_self_or_admin(user_id, caller)
    """Delete a specific recording"""
    _safe_user_test(user_id, test_id)
    if not _SAFE_FILENAME_RE.match(filename):
        raise HTTPException(status_code=400, detail="Invalid filename")
    try:
        filepath = _resolve_inside_root(RECORDINGS_DIR / user_id / test_id / filename)

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
