"""
Audio validation + persistence for the unified speaking eval endpoint.

Responsibilities:
  * Reject obviously-bad uploads early (size, duration) with a clear
    HTTP 400 detail. Do this *before* charging quota or invoking Azure.
  * Persist the raw recording to disk under a UUID filename so the
    speaking_attempts row can reference it. Storage path is relative to
    the repo so the same code works in dev (./backend/static/recordings)
    and prod (/app/backend/static/recordings — symlinked).
  * Stay agnostic of evaluation mode. Both `full` and `basic` paths
    persist the same webm; only Azure transcoding is tied to mode.
"""
from __future__ import annotations

import logging
import uuid
from pathlib import Path
from typing import Any, Dict

from fastapi import HTTPException

logger = logging.getLogger(__name__)

# Tunable limits. Values chosen for IELTS Speaking realities:
#   * Part 1 answers ≈ 15-30s; Part 2 monologue ≈ 60-120s; Part 3 ≈ 45-75s.
#   * Browser MediaRecorder webm/opus is ~16-32 KB/s, so a 2-min monologue
#     is ~2-4 MB. 8 MB headroom covers Part 3 + buffer + any 32 kbps slack.
MIN_BYTES = 1000          # below this is almost certainly a corrupt/empty blob
MAX_BYTES = 8 * 1024 * 1024
MIN_DURATION_SECONDS = 5.0
MAX_DURATION_SECONDS = 600.0  # mirrors schema field constraint

# Storage layout. We deliberately keep recordings on disk (not S3) until
# storage growth justifies the complexity. ~360 KB/eval × 1000/month = ~350
# MB/month — comfortably within the backend volume.
RECORDINGS_DIR = (
    Path(__file__).resolve().parent.parent / "static" / "recordings"
)


def _ensure_dir() -> Path:
    RECORDINGS_DIR.mkdir(parents=True, exist_ok=True)
    return RECORDINGS_DIR


def validate_audio(audio_bytes: bytes, duration_seconds: float) -> None:
    """Raise HTTPException(400) if the upload is clearly bad. Cheap checks
    only — we don't transcode or re-encode here."""
    size = len(audio_bytes or b"")
    if size < MIN_BYTES:
        raise HTTPException(
            status_code=400,
            detail={
                "code": "audio_too_small",
                "message": "Recording is empty or too short to evaluate.",
                "min_bytes": MIN_BYTES,
                "got_bytes": size,
            },
        )
    if size > MAX_BYTES:
        raise HTTPException(
            status_code=413,
            detail={
                "code": "audio_too_large",
                "message": "Recording exceeds the maximum allowed size.",
                "max_bytes": MAX_BYTES,
                "got_bytes": size,
            },
        )

    duration = float(duration_seconds or 0.0)
    if duration < MIN_DURATION_SECONDS:
        raise HTTPException(
            status_code=400,
            detail={
                "code": "audio_too_short",
                "message": (
                    f"Please record at least {int(MIN_DURATION_SECONDS)} "
                    "seconds before submitting."
                ),
                "min_seconds": MIN_DURATION_SECONDS,
                "got_seconds": duration,
            },
        )
    if duration > MAX_DURATION_SECONDS:
        raise HTTPException(
            status_code=400,
            detail={
                "code": "audio_too_long",
                "message": "Recording exceeds the maximum allowed duration.",
                "max_seconds": MAX_DURATION_SECONDS,
                "got_seconds": duration,
            },
        )


def persist_audio(audio_bytes: bytes, *, suffix: str = ".webm") -> Dict[str, Any]:
    """Write the raw recording to disk. Returns absolute path + relative
    URL for client playback. Filename uses a UUID so collisions are
    impossible and the path itself doesn't leak ordering metadata."""
    _ensure_dir()
    name = f"{uuid.uuid4().hex}{suffix}"
    path = RECORDINGS_DIR / name
    try:
        path.write_bytes(audio_bytes)
    except OSError as exc:
        logger.exception("Failed to persist speaking recording: %s", exc)
        raise HTTPException(
            status_code=500,
            detail={
                "code": "recording_persist_failed",
                "message": "Could not save the recording. Please try again.",
            },
        )
    # Static is mounted at /static; downstream consumers (UI playback,
    # /api/recordings/{name}) compose the public URL.
    return {
        "filename": name,
        "absolute_path": str(path),
        "relative_url": f"/static/recordings/{name}",
        "bytes": len(audio_bytes),
    }
