"""
Visual Generator API Routes
Handles saving and loading generated visuals (maps, charts, diagrams, floor plans)
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import os
import json
import base64
from datetime import datetime

router = APIRouter(prefix="/api/visuals", tags=["visuals"])

# Directory for storing visuals
VISUALS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "static", "visuals")
VISUALS_JSON_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "content", "visuals")

# Ensure directories exist
os.makedirs(VISUALS_DIR, exist_ok=True)
os.makedirs(VISUALS_JSON_DIR, exist_ok=True)

class VisualSaveRequest(BaseModel):
    name: str
    json_data: Dict[str, Any]
    image_data: str  # Base64 encoded PNG

class VisualResponse(BaseModel):
    success: bool
    message: str
    filename: Optional[str] = None
    url: Optional[str] = None

@router.post("/save", response_model=VisualResponse)
async def save_visual(request: VisualSaveRequest):
    """
    Save a generated visual (PNG + JSON)
    """
    try:
        # Sanitize filename
        safe_name = "".join(c for c in request.name if c.isalnum() or c in ('_', '-')).lower()
        if not safe_name:
            safe_name = f"visual_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Save PNG image
        if request.image_data.startswith('data:image/png;base64,'):
            image_data = request.image_data.split(',')[1]
        else:
            image_data = request.image_data
        
        png_filename = f"{safe_name}.png"
        png_path = os.path.join(VISUALS_DIR, png_filename)
        
        with open(png_path, 'wb') as f:
            f.write(base64.b64decode(image_data))
        
        # Save JSON data
        json_filename = f"{safe_name}.json"
        json_path = os.path.join(VISUALS_JSON_DIR, json_filename)
        
        visual_metadata = {
            "name": request.name,
            "type": request.json_data.get("type", "unknown"),
            "created_at": datetime.now().isoformat(),
            "png_file": png_filename,
            "data": request.json_data
        }
        
        with open(json_path, 'w') as f:
            json.dump(visual_metadata, f, indent=2)
        
        return VisualResponse(
            success=True,
            message=f"Visual '{request.name}' saved successfully",
            filename=png_filename,
            url=f"/static/visuals/{png_filename}"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/list")
async def list_visuals():
    """
    List all saved visuals
    """
    try:
        visuals = []
        
        if os.path.exists(VISUALS_JSON_DIR):
            for filename in os.listdir(VISUALS_JSON_DIR):
                if filename.endswith('.json'):
                    json_path = os.path.join(VISUALS_JSON_DIR, filename)
                    with open(json_path, 'r') as f:
                        data = json.load(f)
                        visuals.append({
                            "name": data.get("name", filename),
                            "type": data.get("type", "unknown"),
                            "created_at": data.get("created_at"),
                            "png_url": f"/static/visuals/{data.get('png_file', '')}"
                        })
        
        return {"success": True, "visuals": visuals}
        
    except Exception as e:
        return {"success": False, "visuals": [], "error": str(e)}

@router.get("/image/{name}")
async def get_visual_image(name: str):
    """
    Serve a visual PNG image through the API (for ingress compatibility)
    """
    from pathlib import Path
    from services.asset_cdn import serve_static_asset

    try:
        safe_name = "".join(c for c in name if c.isalnum() or c in ('_', '-')).lower()
        # Remove .png extension if present
        if safe_name.endswith('png'):
            safe_name = safe_name[:-3]
        if safe_name.endswith('.'):
            safe_name = safe_name[:-1]

        png_path = Path(VISUALS_DIR) / f"{safe_name}.png"

        # Local in dev; in production redirects to the R2 CDN copy (static/ is
        # dockerignored so the file isn't on the pod).
        return serve_static_asset(
            png_path, "image/png", detail=f"Image not found: {safe_name}.png",
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/get/{name}")
async def get_visual(name: str):
    """
    Get a specific visual by name
    """
    try:
        safe_name = "".join(c for c in name if c.isalnum() or c in ('_', '-')).lower()
        json_path = os.path.join(VISUALS_JSON_DIR, f"{safe_name}.json")
        
        if not os.path.exists(json_path):
            raise HTTPException(status_code=404, detail="Visual not found")
        
        with open(json_path, 'r') as f:
            data = json.load(f)
        
        return {
            "success": True,
            "visual": data,
            "png_url": f"/static/visuals/{data.get('png_file', '')}"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/delete/{name}")
async def delete_visual(name: str):
    """
    Delete a visual by name
    """
    try:
        safe_name = "".join(c for c in name if c.isalnum() or c in ('_', '-')).lower()
        json_path = os.path.join(VISUALS_JSON_DIR, f"{safe_name}.json")
        
        if not os.path.exists(json_path):
            raise HTTPException(status_code=404, detail="Visual not found")
        
        # Get PNG filename from JSON
        with open(json_path, 'r') as f:
            data = json.load(f)
            png_file = data.get('png_file')
        
        # Delete JSON
        os.remove(json_path)
        
        # Delete PNG if exists
        if png_file:
            png_path = os.path.join(VISUALS_DIR, png_file)
            if os.path.exists(png_path):
                os.remove(png_path)
        
        return {"success": True, "message": f"Visual '{name}' deleted"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

print("✅ Visual Generator routes loaded")
