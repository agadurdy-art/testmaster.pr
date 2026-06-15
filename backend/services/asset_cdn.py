"""
Shared static-asset serving with R2 CDN fallback.
=================================================

Single source of truth for "serve a file that lives under backend/static/".

Why this exists
---------------
In production the static assets (~679 MB of audio/images/visuals) are NOT in the
deploy image — `backend/.dockerignore` excludes `static/audio`, `static/images`,
`static/visuals`, etc. They live on the Cloudflare R2 CDN instead, mirrored at the
SAME relative layout: a file at `backend/static/audio/cambridge/ielts17/x.mp3`
is served from `{STATIC_BASE_URL}/audio/cambridge/ielts17/x.mp3`.

Any route that served those files with a bare `FileResponse` from local disk
therefore returned **404 in production** (the file isn't on the pod). That was the
root cause of the speaking / Cambridge-listening / full-test / writing-image
outages. This helper makes the rule impossible to get wrong:

    return serve_static_asset(local_path, "audio/mpeg")

- local dev (no STATIC_BASE_URL): serves the bytes off disk.
- production: if the file isn't on the pod, 307-redirects to the R2 copy,
  deriving the CDN key automatically from the path's position under `static/`.

The invariant to preserve: **R2 mirrors the `static/` tree 1:1.** Upload assets so
that `static/<X>` is reachable at `{STATIC_BASE_URL}/<X>` and every route works.
"""

import os
from pathlib import Path
from typing import Optional

from fastapi import HTTPException
from fastapi.responses import FileResponse, RedirectResponse

STATIC_BASE_URL = (os.getenv("STATIC_BASE_URL") or "").rstrip("/")

# backend/static — the mirror root. backend/services/asset_cdn.py -> parents[1] = backend
_STATIC_ROOT = Path(__file__).resolve().parents[1] / "static"


def _cdn_key(local_path: Path, cdn_rel: Optional[str]) -> Optional[str]:
    if cdn_rel:
        return cdn_rel.lstrip("/")
    try:
        return local_path.resolve().relative_to(_STATIC_ROOT).as_posix()
    except (ValueError, OSError):
        return None


def serve_static_asset(
    local_path: Path,
    media_type: str,
    *,
    cdn_rel: Optional[str] = None,
    filename: Optional[str] = None,
    detail: str = "Asset not found",
):
    """Serve `local_path` from disk, or 307-redirect to its R2 CDN copy.

    Args:
        local_path: the on-disk path under backend/static/ (canonical location).
        media_type: e.g. "audio/mpeg", "image/png".
        cdn_rel: optional explicit R2 key (relative to STATIC_BASE_URL). If omitted,
            it's derived from `local_path`'s position under `static/`.
        filename: optional download filename for the local FileResponse.
        detail: 404 message when neither disk nor CDN can serve it.
    """
    if local_path and local_path.exists():
        return FileResponse(str(local_path), media_type=media_type, filename=filename)

    key = _cdn_key(local_path, cdn_rel)
    if STATIC_BASE_URL and key:
        return RedirectResponse(url=f"{STATIC_BASE_URL}/{key}", status_code=307)

    raise HTTPException(status_code=404, detail=detail)
