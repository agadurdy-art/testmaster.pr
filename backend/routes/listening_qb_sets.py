"""
Listening QB — module/set serving endpoints
===========================================
Single job: static metadata endpoints (question types, parts, bands,
topics) plus the modules list, set fetch, bulk audio pre-generation and
cache-status endpoints.
Extracted from routes/listening_qb.py (Faz 1 refactor, 2026-07-02).
"""

from fastapi import Query, HTTPException
from typing import Optional

from routes.listening_qb_common import router
from routes.listening_qb_audio import (
    is_audio_cached,
    get_cached_audio_path,
    generate_ielts_audio,
    generate_audio_for_transcript,
)


# ============ STATIC ENDPOINTS ============

@router.get("/question-types")
async def get_listening_question_types():
    """Get all listening question types."""
    from content.listening.listening_sets import get_question_types

    return {
        "success": True,
        "question_types": get_question_types()
    }


@router.get("/parts")
async def get_listening_parts():
    """Get IELTS listening part information."""
    from content.listening.listening_sets import get_listening_parts

    return {
        "success": True,
        "parts": get_listening_parts()
    }


@router.get("/band-levels")
async def get_listening_band_levels():
    """Get available band levels for listening practice."""
    return {
        "success": True,
        "band_levels": [
            {"id": "4.0-5.0", "name": "Band 4.0-5.0", "description": "Foundation level", "color": "#10B981"},
            {"id": "5.5-6.5", "name": "Band 5.5-6.5", "description": "Intermediate level", "color": "#3B82F6"},
            {"id": "7.0-9.0", "name": "Band 7.0-9.0", "description": "Advanced level", "color": "#8B5CF6"}
        ]
    }


@router.get("/topics")
async def get_listening_topics():
    """Get all available topics for listening practice."""
    from content.listening.listening_sets import get_all_listening_sets

    all_sets = get_all_listening_sets()
    topics = {}

    for s in all_sets:
        topic = s.get("topic")
        if topic and topic not in topics:
            topics[topic] = {
                "id": topic,
                "name": topic.replace("_", " ").title(),
                "icon": get_topic_icon(topic)
            }

    return {
        "success": True,
        "topics": list(topics.values())
    }


def get_topic_icon(topic: str) -> str:
    """Get icon for a topic."""
    icons = {
        "travel": "✈️",
        "education": "🎓",
        "culture": "🎭",
        "health": "🏥",
        "community": "🏘️",
        "work": "💼",
        "environment": "🌿",
        "business": "📊",
        "technology": "🔧",
        "science": "🔬"
    }
    return icons.get(topic, "📝")


@router.get("/modules")
async def get_listening_modules(
    band: Optional[str] = Query(None, description="Filter by band range"),
    topic: Optional[str] = Query(None, description="Filter by topic"),
    question_type: Optional[str] = Query(None, description="Filter by question type"),
    part: Optional[str] = Query(None, description="Filter by IELTS part")
):
    """Get available listening modules/sets with optional filters."""
    from content.listening.listening_sets import (
        get_listening_modules_summary,
        get_listening_sets_by_band,
        get_all_listening_sets
    )

    # Start with all sets or band-filtered
    if band:
        sets = get_listening_sets_by_band(band)
    else:
        sets = get_all_listening_sets()

    # Apply additional filters
    if topic:
        sets = [s for s in sets if s.get("topic") == topic]

    if question_type:
        sets = [s for s in sets if question_type in s.get("question_types", [])]

    if part:
        sets = [s for s in sets if s.get("part") == part]

    # Create summary with cache status
    modules = [{
        "set_id": s["set_id"],
        "title": s["title"],
        "band_range": s["band_range"],
        "part": s["part"],
        "topic": s["topic"],
        "question_types": s["question_types"],
        "duration_seconds": s["duration_seconds"],
        "question_count": len(s["questions"]),
        "audio_cached": is_audio_cached(s["set_id"])  # Show which sets have cached audio
    } for s in sets]

    return {
        "success": True,
        "total": len(modules),
        "cached_count": sum(1 for m in modules if m["audio_cached"]),
        "modules": modules
    }


@router.get("/set/{set_id}")
async def get_listening_set(
    set_id: str,
    include_audio: bool = Query(True, description="Generate audio for the set"),
    mode: str = Query("test", description="test → transcript stripped; review → transcript included"),
):
    """
    Get a specific listening set with questions (no answers until submit).
    Optionally generates IELTS-quality audio using ElevenLabs.

    Pre-launch audit 2026-05-16: transcript was always included → anyone
    could read the audioscript without listening. Now stripped when
    mode=test; clients pass mode=review to fetch it after submission.
    """
    from content.listening.listening_sets import get_listening_set_by_id

    listening_set = get_listening_set_by_id(set_id)

    if not listening_set:
        raise HTTPException(status_code=404, detail=f"Listening set '{set_id}' not found")

    # Prepare questions without answers
    questions_without_answers = []
    for q in listening_set["questions"]:
        q_copy = {
            "id": q["id"],
            "type": q["type"],
            "question": q["question"],
        }
        if "options" in q:
            q_copy["options"] = q["options"]
        if "items" in q:  # For matching questions
            q_copy["items"] = q["items"]
            q_copy["match_options"] = q.get("options", [])
        questions_without_answers.append(q_copy)

    # Generate IELTS-quality audio if requested (uses cache)
    audio_url = None
    if include_audio:
        audio_url = await generate_audio_for_transcript(
            set_id,  # Pass set_id for caching
            listening_set["transcript"],
            listening_set.get("speakers", []),
            listening_set.get("part", "part1")  # Pass part for speed adjustment
        )

    return {
        "success": True,
        "set": {
            "set_id": listening_set["set_id"],
            "title": listening_set["title"],
            "band_range": listening_set["band_range"],
            "part": listening_set["part"],
            "topic": listening_set["topic"],
            "duration_seconds": listening_set["duration_seconds"],
            "question_types": listening_set["question_types"],
            "speakers": listening_set.get("speakers", []),
            "tips": listening_set.get("tips", []),
            "questions": questions_without_answers,
            "audio_url": audio_url,
            "has_audio": audio_url is not None,
            "audio_cached": is_audio_cached(set_id),  # Tell frontend if audio is cached
            # Pre-launch audit 2026-05-16: only ship the transcript when the
            # caller explicitly asks for review mode (post-submission).
            "transcript": listening_set["transcript"] if mode == "review" else None,
        }
    }


@router.post("/generate-all-audio")
async def generate_all_audio(
    force: bool = Query(False, description="Force regenerate even if cached")
):
    """
    Pre-generate audio for all listening sets.
    This should be called once to populate the cache.
    """
    from content.listening.listening_sets import get_all_listening_sets

    all_sets = get_all_listening_sets()
    results = []

    for s in all_sets:
        set_id = s["set_id"]

        if not force and is_audio_cached(set_id):
            results.append({
                "set_id": set_id,
                "status": "already_cached",
                "title": s["title"]
            })
            continue

        try:
            audio_url = await generate_ielts_audio(
                set_id,
                s["transcript"],
                s.get("speakers", []),
                s.get("part", "part1"),
                force_regenerate=force
            )

            results.append({
                "set_id": set_id,
                "status": "generated" if audio_url else "failed",
                "title": s["title"],
                "audio_url": audio_url
            })
        except Exception as e:
            results.append({
                "set_id": set_id,
                "status": "error",
                "title": s["title"],
                "error": str(e)
            })

    return {
        "success": True,
        "total": len(all_sets),
        "generated": sum(1 for r in results if r["status"] == "generated"),
        "cached": sum(1 for r in results if r["status"] == "already_cached"),
        "failed": sum(1 for r in results if r["status"] in ["failed", "error"]),
        "results": results
    }


@router.get("/cache-status")
async def get_cache_status():
    """Get status of audio cache."""
    from content.listening.listening_sets import get_all_listening_sets

    all_sets = get_all_listening_sets()
    cached_sets = []
    uncached_sets = []

    for s in all_sets:
        set_id = s["set_id"]
        if is_audio_cached(set_id):
            cache_path = get_cached_audio_path(set_id)
            cached_sets.append({
                "set_id": set_id,
                "title": s["title"],
                "size_kb": round(cache_path.stat().st_size / 1024, 1)
            })
        else:
            uncached_sets.append({
                "set_id": set_id,
                "title": s["title"]
            })

    return {
        "success": True,
        "total": len(all_sets),
        "cached": len(cached_sets),
        "uncached": len(uncached_sets),
        "cached_sets": cached_sets,
        "uncached_sets": uncached_sets
    }
