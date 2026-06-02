"""
Opaque DB-backed session tokens (audit F01 + F03).

Closes:
  - F03: /api/users/{id}/* were unauthenticated (IDOR). `current_user` +
    `require_self_or_admin` enforce that the caller owns the resource.
  - F01: admin endpoints trusted a spoofable `admin_email` query param.
    `require_admin` requires a real session whose email is in the allowlist.

Why opaque tokens (not JWT): no signing-secret env var to configure in Railway,
and tokens are revocable (logout / compromise) by deleting the DB row. We store
only sha256(token) so a DB leak does not expose live tokens.

Token transport: `Authorization: Bearer <token>` header.
"""

import hashlib
import secrets
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any

from fastapi import Header, HTTPException

try:
    # is_admin_email lives in security_utils (same allowlist the old admin
    # routes used). Import lazily-safe so this module imports even if the path
    # changes during refactors.
    from security_utils import is_admin_email
except Exception:  # pragma: no cover
    def is_admin_email(_email: Optional[str]) -> bool:
        return False

SESSION_TTL_DAYS = 60
_COLLECTION = "sessions"

db = None


def set_db(database):
    global db
    db = database


def _hash(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


async def create_session(user_id: str) -> str:
    """Mint a new opaque session token for user_id and persist its hash."""
    token = secrets.token_urlsafe(32)
    now = datetime.now(timezone.utc)
    await db[_COLLECTION].insert_one(
        {
            "token_hash": _hash(token),
            "user_id": user_id,
            "created_at": now.isoformat(),
            "expires_at": (now + timedelta(days=SESSION_TTL_DAYS)).isoformat(),
        }
    )
    return token


async def delete_session(token: str) -> None:
    """Revoke a single session (logout). Best-effort."""
    try:
        await db[_COLLECTION].delete_one({"token_hash": _hash(token)})
    except Exception:
        pass


def _extract_token(authorization: Optional[str]) -> Optional[str]:
    if not authorization:
        return None
    parts = authorization.split(" ", 1)
    if len(parts) == 2 and parts[0].lower() == "bearer":
        return parts[1].strip() or None
    return None


async def _resolve_user(token: str) -> Optional[Dict[str, Any]]:
    sess = await db[_COLLECTION].find_one({"token_hash": _hash(token)})
    if not sess:
        return None
    exp = sess.get("expires_at")
    if exp:
        try:
            if datetime.fromisoformat(exp) < datetime.now(timezone.utc):
                await db[_COLLECTION].delete_one({"token_hash": _hash(token)})
                return None
        except Exception:
            pass
    user = await db.users.find_one({"id": sess["user_id"]}, {"_id": 0})
    return user


async def current_user(authorization: Optional[str] = Header(default=None)) -> Dict[str, Any]:
    """FastAPI dependency: resolve the authenticated user or 401."""
    token = _extract_token(authorization)
    if not token:
        raise HTTPException(status_code=401, detail="Authentication required")
    user = await _resolve_user(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    return user


async def current_user_optional(authorization: Optional[str] = Header(default=None)) -> Optional[Dict[str, Any]]:
    """Like current_user but returns None instead of raising (for mixed routes)."""
    token = _extract_token(authorization)
    if not token:
        return None
    return await _resolve_user(token)


def is_admin(user: Optional[Dict[str, Any]]) -> bool:
    return bool(user) and is_admin_email(user.get("email"))


def require_self_or_admin(user_id: str, caller: Dict[str, Any]) -> None:
    """Raise 403 unless the caller owns user_id (or is an admin)."""
    if caller.get("id") == user_id or is_admin(caller):
        return
    raise HTTPException(status_code=403, detail="Forbidden")


async def require_admin(authorization: Optional[str] = Header(default=None)) -> Dict[str, Any]:
    """FastAPI dependency for admin routes: valid session + admin email."""
    user = await current_user(authorization)
    if not is_admin(user):
        raise HTTPException(status_code=403, detail="Admin access required")
    return user
