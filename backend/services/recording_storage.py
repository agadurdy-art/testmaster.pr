"""
Runtime R2 uploader for user voice recordings.
================================================

Speaking answers are written to backend/static/recordings/<uuid>.webm, but that
disk is ephemeral on Railway — after a redeploy/instance change the file is gone
and the results page can't play the recording back. This mirrors each recording
to Cloudflare R2 (the same bucket the rest of static/ is served from), under the
key `recordings/<uuid>.webm` so it maps 1:1 to /static/recordings/<uuid>.webm and
the existing CDN-redirect middleware serves it in production.

Best-effort: never raises — the local disk copy remains the in-session fallback.
"""
from __future__ import annotations

import logging
import os
import threading

logger = logging.getLogger(__name__)

_client = None
_lock = threading.Lock()


def _get_client():
    global _client
    if _client is not None:
        return _client
    with _lock:
        if _client is None:
            endpoint = os.getenv("R2_ENDPOINT")
            if not (
                endpoint
                and os.getenv("R2_ACCESS_KEY_ID")
                and os.getenv("R2_SECRET_ACCESS_KEY")
                and os.getenv("R2_BUCKET")
            ):
                return None
            try:
                import boto3
                from botocore.config import Config

                _client = boto3.client(
                    "s3",
                    endpoint_url=endpoint,
                    aws_access_key_id=os.environ["R2_ACCESS_KEY_ID"],
                    aws_secret_access_key=os.environ["R2_SECRET_ACCESS_KEY"],
                    config=Config(signature_version="s3v4", region_name="auto"),
                )
            except Exception as exc:  # noqa: BLE001
                logger.warning("R2 client init failed: %s", exc)
                return None
    return _client


def upload_recording(key: str, data: bytes, content_type: str = "audio/webm") -> bool:
    """Upload `data` to R2 at `key` (relative to the static/ mirror root, e.g.
    "recordings/<uuid>.webm"). Returns True on success; never raises."""
    client = _get_client()
    if client is None:
        return False
    try:
        client.put_object(
            Bucket=os.environ["R2_BUCKET"],
            Key=key,
            Body=data,
            ContentType=content_type,
            CacheControl="public, max-age=31536000, immutable",
        )
        return True
    except Exception as exc:  # noqa: BLE001
        logger.warning("R2 recording upload failed for %s: %s", key, exc)
        return False
