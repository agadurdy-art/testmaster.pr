"""
Strategies Guide API Routes
===========================
Serves the IELTS Strategies Guide content (faithful port of the
Complete IELTS Preparation Guide PDF).

Content lives in: backend/content/strategies_guide/{skill}/{chapter_id}.json

Endpoints:
- GET /api/strategies/index            → list all chapters available
- GET /api/strategies/chapter/{id}     → full chapter (lessons + slides)
"""

import json
import logging
from pathlib import Path
from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/strategies", tags=["Strategies Guide"])

CONTENT_ROOT = Path(__file__).resolve().parent.parent / "content" / "strategies_guide"


# Authoritative chapter map. Skills → list of chapter file paths (relative to CONTENT_ROOT).
# Add new chapters here as they are extracted.
CHAPTER_FILES: List[Dict[str, str]] = [
    {"skill": "listening", "file": "listening/segment_slides.json"},
    {"skill": "listening", "file": "listening/a_to_z.json"},
    {"skill": "reading",   "file": "reading/segment_slides.json"},
    {"skill": "reading",   "file": "reading/a_to_z.json"},
    {"skill": "speaking",  "file": "speaking/segment_slides.json"},
    {"skill": "writing",   "file": "writing/segment_slides.json"},
    {"skill": "writing",   "file": "writing/a_to_z.json"},
    {"skill": "vocabulary","file": "vocabulary/improvement_plan.json"},
]


def _load_chapter(file_rel: str) -> Dict[str, Any]:
    path = CONTENT_ROOT / file_rel
    if not path.exists():
        raise HTTPException(status_code=404, detail=f"Chapter file not found: {file_rel}")
    try:
        with path.open("r", encoding="utf-8") as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        logger.error("strategies: failed to parse %s: %s", file_rel, e)
        raise HTTPException(status_code=500, detail=f"Invalid chapter JSON: {file_rel}")


@router.get("/index")
async def get_strategies_index() -> Dict[str, Any]:
    """
    Lightweight index of all available chapters — used by the TOC view.
    Returns chapter metadata only (not the full slide payload).
    """
    chapters = []
    for entry in CHAPTER_FILES:
        try:
            data = _load_chapter(entry["file"])
        except HTTPException:
            # Skip missing files silently in the index — they may not be extracted yet.
            continue
        chapters.append({
            "chapter_id": data.get("chapter_id"),
            "chapter_number": data.get("chapter_number"),
            "skill": data.get("skill", entry["skill"]),
            "title": data.get("title"),
            "subtitle": data.get("subtitle"),
            "source_pages": data.get("source_pages"),
            "lesson_count": len(data.get("lessons", [])),
            "extraction_status": data.get("extraction_status", "unknown"),
        })
    chapters.sort(key=lambda c: c.get("chapter_number") or 99)
    return {"chapters": chapters}


@router.get("/chapter/{chapter_id}")
async def get_strategies_chapter(chapter_id: str) -> Dict[str, Any]:
    """
    Full chapter payload (all lessons + slides). Loaded from disk on each call —
    the content is small enough that in-memory caching is unnecessary in dev.
    """
    for entry in CHAPTER_FILES:
        data = _load_chapter(entry["file"])
        if data.get("chapter_id") == chapter_id:
            return data
    raise HTTPException(status_code=404, detail=f"Chapter not found: {chapter_id}")
