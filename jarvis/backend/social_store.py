"""Persistent social-draft storage for the JARVIS Social Studio.

The store is intentionally local-first: draft metadata is JSON and uploaded media
is kept under jarvis/data/social/. Platform credentials are not needed because the
first release exports content to the iOS share sheet for manual publishing.
"""
from __future__ import annotations

import json
import mimetypes
import os
import re
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from threading import RLock
from typing import Any, BinaryIO
from uuid import uuid4


REPO_ROOT = Path(__file__).resolve().parent.parent.parent
DATA_ROOT = Path(
    os.environ.get("JARVIS_SOCIAL_DATA_DIR", REPO_ROOT / "jarvis" / "data" / "social")
).resolve()
DRAFTS_FILE = DATA_ROOT / "drafts.json"
MEDIA_ROOT = DATA_ROOT / "media"
MAX_MEDIA_BYTES = int(os.environ.get("JARVIS_MAX_MEDIA_MB", "100")) * 1024 * 1024

ALLOWED_MEDIA_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "video/mp4": ".mp4",
    "video/quicktime": ".mov",
    "video/webm": ".webm",
    "audio/mpeg": ".mp3",
    "audio/mp4": ".m4a",
    "audio/wav": ".wav",
    "application/pdf": ".pdf",
}
ALLOWED_PLATFORMS = {
    "facebook", "instagram", "x", "tiktok", "youtube", "linkedin", "zalo", "other",
}
ALLOWED_STATUSES = {"draft", "ready", "shared", "archived"}

_lock = RLock()


class SocialStoreError(ValueError):
    pass


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _ensure_dirs() -> None:
    MEDIA_ROOT.mkdir(parents=True, exist_ok=True)


def _read_all() -> list[dict[str, Any]]:
    _ensure_dirs()
    if not DRAFTS_FILE.exists():
        return []
    try:
        raw = json.loads(DRAFTS_FILE.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError) as exc:
        raise SocialStoreError(f"draft store is unreadable: {exc}") from exc
    if not isinstance(raw, list):
        raise SocialStoreError("draft store has an invalid shape")
    return raw


def _write_all(drafts: list[dict[str, Any]]) -> None:
    _ensure_dirs()
    fd, temp_name = tempfile.mkstemp(prefix="drafts-", suffix=".json", dir=DATA_ROOT)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as handle:
            json.dump(drafts, handle, ensure_ascii=False, indent=2)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temp_name, DRAFTS_FILE)
    finally:
        try:
            os.unlink(temp_name)
        except FileNotFoundError:
            pass


def _clean_text(value: Any, *, limit: int) -> str:
    return str(value or "").replace("\x00", "").strip()[:limit]


def _clean_platforms(value: Any) -> list[str]:
    if not isinstance(value, list):
        return []
    result: list[str] = []
    for item in value:
        platform = _clean_text(item, limit=30).lower()
        if platform in ALLOWED_PLATFORMS and platform not in result:
            result.append(platform)
    return result


def _clean_hashtags(value: Any) -> list[str]:
    if isinstance(value, str):
        value = re.split(r"[\s,]+", value)
    if not isinstance(value, list):
        return []
    result: list[str] = []
    for item in value[:40]:
        tag = re.sub(r"[^\w\u0080-\uffff]", "", str(item or "").lstrip("#"))
        if tag and tag not in result:
            result.append(tag[:80])
    return result


def _find(drafts: list[dict[str, Any]], draft_id: str) -> tuple[int, dict[str, Any]]:
    for index, draft in enumerate(drafts):
        if draft.get("id") == draft_id:
            return index, draft
    raise SocialStoreError("draft not found")


def list_drafts() -> list[dict[str, Any]]:
    with _lock:
        return sorted(_read_all(), key=lambda item: item.get("updated_at", ""), reverse=True)


def get_draft(draft_id: str) -> dict[str, Any]:
    with _lock:
        _, draft = _find(_read_all(), draft_id)
        return draft


def create_draft(payload: dict[str, Any]) -> dict[str, Any]:
    now = _now()
    draft = {
        "id": uuid4().hex,
        "title": _clean_text(payload.get("title"), limit=160) or "Untitled social draft",
        "caption": _clean_text(payload.get("caption"), limit=20_000),
        "hashtags": _clean_hashtags(payload.get("hashtags")),
        "platforms": _clean_platforms(payload.get("platforms")),
        "notes": _clean_text(payload.get("notes"), limit=5_000),
        "source": _clean_text(payload.get("source"), limit=80) or "manual",
        "status": "draft",
        "media": [],
        "created_at": now,
        "updated_at": now,
        "shared_at": None,
    }
    with _lock:
        drafts = _read_all()
        drafts.append(draft)
        _write_all(drafts)
    return draft


def update_draft(draft_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    with _lock:
        drafts = _read_all()
        index, draft = _find(drafts, draft_id)
        if "title" in payload:
            draft["title"] = _clean_text(payload.get("title"), limit=160) or draft["title"]
        if "caption" in payload:
            draft["caption"] = _clean_text(payload.get("caption"), limit=20_000)
        if "hashtags" in payload:
            draft["hashtags"] = _clean_hashtags(payload.get("hashtags"))
        if "platforms" in payload:
            draft["platforms"] = _clean_platforms(payload.get("platforms"))
        if "notes" in payload:
            draft["notes"] = _clean_text(payload.get("notes"), limit=5_000)
        if "status" in payload:
            status = _clean_text(payload.get("status"), limit=30).lower()
            if status not in ALLOWED_STATUSES:
                raise SocialStoreError("invalid draft status")
            draft["status"] = status
            if status == "shared":
                draft["shared_at"] = _now()
        draft["updated_at"] = _now()
        drafts[index] = draft
        _write_all(drafts)
        return draft


def delete_draft(draft_id: str) -> None:
    with _lock:
        drafts = _read_all()
        index, draft = _find(drafts, draft_id)
        for media in draft.get("media", []):
            _delete_media_file(draft_id, media)
        drafts.pop(index)
        _write_all(drafts)
        draft_dir = MEDIA_ROOT / draft_id
        try:
            draft_dir.rmdir()
        except OSError:
            pass


def add_media(
    draft_id: str,
    stream: BinaryIO,
    *,
    filename: str,
    content_type: str | None,
) -> dict[str, Any]:
    # Validate the parent before writing so an invalid draft id cannot leave
    # orphaned media on disk.
    get_draft(draft_id)
    media_type = (content_type or "").split(";", 1)[0].lower().strip()
    if media_type not in ALLOWED_MEDIA_TYPES:
        guessed, _ = mimetypes.guess_type(filename)
        media_type = guessed or media_type
    if media_type not in ALLOWED_MEDIA_TYPES:
        raise SocialStoreError("unsupported media type")

    media_id = uuid4().hex
    suffix = ALLOWED_MEDIA_TYPES[media_type]
    safe_stem = re.sub(r"[^A-Za-z0-9._-]+", "-", Path(filename or "media").stem).strip(".-")
    safe_name = f"{safe_stem[:80] or 'media'}-{media_id[:8]}{suffix}"
    draft_dir = MEDIA_ROOT / draft_id
    draft_dir.mkdir(parents=True, exist_ok=True)
    target = draft_dir / safe_name

    size = 0
    try:
        with target.open("xb") as handle:
            while chunk := stream.read(1024 * 1024):
                size += len(chunk)
                if size > MAX_MEDIA_BYTES:
                    raise SocialStoreError(
                        f"media exceeds {MAX_MEDIA_BYTES // (1024 * 1024)} MB limit"
                    )
                handle.write(chunk)
    except Exception:
        target.unlink(missing_ok=True)
        raise

    item = {
        "id": media_id,
        "filename": safe_name,
        "original_name": _clean_text(filename, limit=255) or safe_name,
        "content_type": media_type,
        "size": size,
        "created_at": _now(),
    }
    with _lock:
        drafts = _read_all()
        index, draft = _find(drafts, draft_id)
        try:
            draft.setdefault("media", []).append(item)
            draft["updated_at"] = _now()
            drafts[index] = draft
            _write_all(drafts)
        except Exception:
            target.unlink(missing_ok=True)
            raise
    return item


def _media_path(draft_id: str, media: dict[str, Any]) -> Path:
    target = (MEDIA_ROOT / draft_id / str(media.get("filename", ""))).resolve()
    allowed_root = (MEDIA_ROOT / draft_id).resolve()
    if allowed_root not in target.parents:
        raise SocialStoreError("invalid media path")
    return target


def get_media(draft_id: str, media_id: str) -> tuple[dict[str, Any], Path]:
    draft = get_draft(draft_id)
    for media in draft.get("media", []):
        if media.get("id") == media_id:
            target = _media_path(draft_id, media)
            if not target.is_file():
                raise SocialStoreError("media file not found")
            return media, target
    raise SocialStoreError("media not found")


def _delete_media_file(draft_id: str, media: dict[str, Any]) -> None:
    try:
        _media_path(draft_id, media).unlink(missing_ok=True)
    except SocialStoreError:
        pass


def delete_media(draft_id: str, media_id: str) -> None:
    with _lock:
        drafts = _read_all()
        index, draft = _find(drafts, draft_id)
        media_items = draft.get("media", [])
        for media_index, media in enumerate(media_items):
            if media.get("id") == media_id:
                _delete_media_file(draft_id, media)
                media_items.pop(media_index)
                draft["updated_at"] = _now()
                drafts[index] = draft
                _write_all(drafts)
                return
        raise SocialStoreError("media not found")
