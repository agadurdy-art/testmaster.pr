"""
Auth — Google OAuth (3-leg flow) + Facebook login endpoints
===========================================================
Single job: the Google consent start/callback/session-exchange dance and
the Facebook access-token login flow, including profile verification and
user upsert helpers.
Extracted from routes/auth.py (Faz 1 refactor, 2026-07-02).

SECURITY-CRITICAL: state/ticket/token verification flows were moved
verbatim — do not modify them here without a dedicated security review.
"""
import logging
import secrets
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any
from urllib.parse import urlencode

import httpx
from fastapi import HTTPException
from fastapi.responses import RedirectResponse

import auth_session  # opaque session tokens (audit F01/F03)

from routes.auth_common import (
    router,
    User,
    GoogleSessionRequest,
    FacebookLoginRequest,
    FACEBOOK_APP_ID,
    FACEBOOK_APP_SECRET,
    FACEBOOK_GRAPH_API_BASE,
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI,
    GOOGLE_AUTH_BASE,
    GOOGLE_TOKEN_URL,
    GOOGLE_USERINFO_URL,
    FRONTEND_BASE_URL,
    OAUTH_STATE_TTL_SECONDS,
    OAUTH_SESSION_TTL_SECONDS,
    ALLOWED_OAUTH_RETURN_SCHEMES,
)

db = None
logger = logging.getLogger(__name__)


def set_db(database):
    global db
    db = database


# ============ Facebook OAuth ============

async def verify_facebook_access_token(access_token: str) -> Optional[Dict[str, Any]]:
    if not FACEBOOK_APP_ID or not FACEBOOK_APP_SECRET:
        logger.error("Facebook App ID/Secret not configured")
        raise HTTPException(status_code=500, detail="Facebook login not configured")
    async with httpx.AsyncClient() as client:
        debug_params = {"input_token": access_token, "access_token": f"{FACEBOOK_APP_ID}|{FACEBOOK_APP_SECRET}"}
        debug_resp = await client.get(f"{FACEBOOK_GRAPH_API_BASE}/debug_token", params=debug_params)
        try:
            debug_resp.raise_for_status()
        except httpx.HTTPError:
            logger.warning("Facebook debug_token call failed: %s", debug_resp.text)
            return None
        debug_data = debug_resp.json().get("data", {})
        if not debug_data.get("is_valid"):
            return None
        app_id = debug_data.get("app_id")
        if app_id and str(app_id) != str(FACEBOOK_APP_ID):
            return None
        me_params = {"fields": "id,name,email,picture.type(large)", "access_token": access_token}
        me_resp = await client.get(f"{FACEBOOK_GRAPH_API_BASE}/me", params=me_params)
        try:
            me_resp.raise_for_status()
        except httpx.HTTPError:
            return None
        profile = me_resp.json()
        picture_url = None
        picture = profile.get("picture", {}).get("data") if isinstance(profile.get("picture"), dict) else None
        if isinstance(picture, dict):
            picture_url = picture.get("url")
        return {
            "id": profile.get("id"),
            "email": (profile.get("email") or "").strip().lower() or None,
            "name": profile.get("name"),
            "picture": picture_url,
        }


# ============ Google OAuth (own client) ============
# Replaces the Emergent proxy flow. Three-leg dance:
#   1. GET  /api/auth/google/start     → 302 to Google consent screen
#   2. GET  /api/auth/google/callback  → handles ?code=&state=, upserts user,
#      redirects browser to FRONTEND_BASE_URL/#session_id=<short_token>
#   3. POST /api/auth/google/session   → frontend exchanges short_token for
#      the User payload (single-use, 5min TTL)


async def _google_upsert_user(email: str, name: str, google_id: Optional[str]) -> Dict[str, Any]:
    """Find-or-create the user from a verified Google profile."""
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user:
        user_obj = User(email=email, name=name, password_hash=None, verified=True, google_id=google_id)
        doc = user_obj.model_dump()
        doc["created_at"] = doc["created_at"].isoformat()
        await db.users.insert_one(doc)
        user = {**doc}
    else:
        update_fields: Dict[str, Any] = {"verified": True}
        if google_id:
            update_fields["google_id"] = google_id
        await db.users.update_one({"id": user["id"]}, {"$set": update_fields})
        user.update(update_fields)
    user.pop("password_hash", None)
    return user


@router.get("/auth/google/start")
async def google_oauth_start(return_to: Optional[str] = None):
    """Kick off the Google consent dance.

    `return_to` is an optional client-controlled URL the callback will
    redirect to after upserting the user (with `#session_id=...` appended).
    Web flow omits it → callback uses FRONTEND_BASE_URL. Mobile passes its
    own custom scheme (e.g. `ieltsace://oauth`) so the in-app browser can
    auto-close on match. Untrusted values are dropped to prevent open
    redirect.
    """
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=503, detail="Google OAuth not configured")
    state = secrets.token_urlsafe(32)
    now = datetime.now(timezone.utc)
    safe_return_to: Optional[str] = None
    if return_to and any(return_to.startswith(p) for p in ALLOWED_OAUTH_RETURN_SCHEMES):
        safe_return_to = return_to
    await db.oauth_states.insert_one({
        "state": state,
        "created_at": now,
        "expires_at": now + timedelta(seconds=OAUTH_STATE_TTL_SECONDS),
        "return_to": safe_return_to,
    })
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "state": state,
        "access_type": "online",
        "prompt": "select_account",
    }
    return RedirectResponse(url=f"{GOOGLE_AUTH_BASE}?{urlencode(params)}", status_code=302)


@router.get("/auth/google/callback")
async def google_oauth_callback(code: Optional[str] = None, state: Optional[str] = None, error: Optional[str] = None):
    failure_redirect = f"{FRONTEND_BASE_URL}/login?error=google_auth"

    if error or not code or not state:
        logger.warning("Google OAuth callback missing fields error=%s code=%s state=%s",
                       error, bool(code), bool(state))
        return RedirectResponse(url=failure_redirect, status_code=302)

    # Single-use state — pop it before doing any work
    state_doc = await db.oauth_states.find_one_and_delete({"state": state})
    if not state_doc:
        logger.warning("Google OAuth: unknown or expired state")
        return RedirectResponse(url=failure_redirect, status_code=302)
    expires_at = state_doc.get("expires_at")
    if expires_at and expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        logger.warning("Google OAuth: state expired")
        return RedirectResponse(url=failure_redirect, status_code=302)

    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        logger.error("Google OAuth callback hit but credentials are not configured")
        return RedirectResponse(url=failure_redirect, status_code=302)

    # Exchange code → access_token + id_token
    token_payload = {
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "grant_type": "authorization_code",
    }
    async with httpx.AsyncClient(timeout=10.0) as client_http:
        try:
            tok_resp = await client_http.post(GOOGLE_TOKEN_URL, data=token_payload)
            tok_resp.raise_for_status()
            tok_json = tok_resp.json()
            access_token = tok_json.get("access_token")
            if not access_token:
                raise ValueError("No access_token in token response")
            ui_resp = await client_http.get(
                GOOGLE_USERINFO_URL,
                headers={"Authorization": f"Bearer {access_token}"},
            )
            ui_resp.raise_for_status()
            profile = ui_resp.json()
        except (httpx.HTTPError, ValueError) as e:
            logger.error("Google OAuth token/userinfo fetch failed: %s", str(e))
            return RedirectResponse(url=failure_redirect, status_code=302)

    email = (profile.get("email") or "").strip().lower()
    if not email or not profile.get("email_verified", True):
        logger.warning("Google OAuth: missing or unverified email")
        return RedirectResponse(url=failure_redirect, status_code=302)
    name = profile.get("name") or "Google User"
    google_id = profile.get("sub")

    user = await _google_upsert_user(email, name, google_id)

    # Hand the frontend a short-lived single-use ticket
    ticket = secrets.token_urlsafe(32)
    now = datetime.now(timezone.utc)
    await db.oauth_sessions.insert_one({
        "ticket": ticket,
        "user_id": user["id"],
        "created_at": now,
        "expires_at": now + timedelta(seconds=OAUTH_SESSION_TTL_SECONDS),
    })

    # Pick the redirect target the client asked for. Custom-scheme returns
    # land via `?session_id=` (query) since fragments don't survive every
    # in-app browser. Web stays on fragment for back-compat.
    return_to = state_doc.get("return_to") if state_doc else None
    if return_to:
        joiner = "&" if "?" in return_to else "?"
        return RedirectResponse(url=f"{return_to}{joiner}session_id={ticket}", status_code=302)
    return RedirectResponse(url=f"{FRONTEND_BASE_URL}/#session_id={ticket}", status_code=302)


@router.post("/auth/google/session")
async def google_session_exchange(payload: GoogleSessionRequest):
    """Frontend posts the short-lived ticket from the URL fragment and
    receives the full User payload. Ticket is single-use and TTL-bound."""
    ticket = payload.session_id.strip()
    if not ticket:
        raise HTTPException(status_code=400, detail="Missing session_id")
    sess = await db.oauth_sessions.find_one_and_delete({"ticket": ticket})
    if not sess:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    expires_at = sess.get("expires_at")
    if expires_at and expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    user = await db.users.find_one({"id": sess["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    user.pop("password_hash", None)
    if isinstance(user.get("created_at"), str):
        try:
            user["created_at"] = datetime.fromisoformat(user["created_at"])
        except Exception:
            pass
    u = User(**user)
    u.token = await auth_session.create_session(user["id"])
    return u


@router.post("/auth/facebook-login")
async def facebook_login(payload: FacebookLoginRequest):
    fb_data = await verify_facebook_access_token(payload.access_token)
    if not fb_data or not fb_data.get("id"):
        raise HTTPException(status_code=401, detail="Invalid Facebook token")
    email = fb_data.get("email")
    name = fb_data.get("name") or "Facebook User"
    facebook_id = fb_data["id"]
    user = None
    if email:
        user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user:
        user = await db.users.find_one({"facebook_id": facebook_id}, {"_id": 0})
    if not user:
        user_obj = User(email=email or f"fb_{facebook_id}@example.com", name=name, password_hash=None, verified=True)
        doc = user_obj.model_dump()
        doc["created_at"] = doc["created_at"].isoformat()
        doc["facebook_id"] = facebook_id
        await db.users.insert_one(doc)
        user = {**doc}
    else:
        update_fields: Dict[str, Any] = {"facebook_id": facebook_id}
        if not user.get("verified", False):
            update_fields["verified"] = True
        await db.users.update_one({"id": user["id"]}, {"$set": update_fields})
        user.update(update_fields)
    user.pop("password_hash", None)
    if isinstance(user.get("created_at"), str):
        try:
            user["created_at"] = datetime.fromisoformat(user["created_at"])
        except Exception:
            pass
    u = User(**user)
    u.token = await auth_session.create_session(user["id"])
    return u
