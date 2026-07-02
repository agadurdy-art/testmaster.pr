"""
Auth Routes Module (thin shim)
==============================
Extracted from routes/auth.py (Faz 1 refactor, 2026-07-02).
Single job: keep the historical `routes.auth` import path working.
The actual code now lives in single-responsibility modules:

- routes/auth_common.py      — shared router/db, config, models,
                               password/token helpers, email senders
- routes/auth_credentials.py — register/login/verify/reset endpoints
- routes/auth_oauth.py       — Google OAuth (3 flows) + Facebook login
- routes/auth_users.py       — user profile/usage/onboarding endpoints

Importing the sub-modules below registers every route on the shared router
(same paths + methods as before the split). server.py keeps calling
`from routes.auth import router, set_db` unchanged.

SECURITY-CRITICAL: all token/hash/verification logic was moved verbatim;
review the sub-modules before changing any of it.
"""
# Shared infra (defines the router all sub-modules register on).
from routes import auth_common as _common

# Import order mirrors the original file's route declaration order.
from routes import auth_credentials as _credentials
from routes import auth_oauth as _oauth
from routes import auth_users as _users

# ---- Re-exports: everything the original module exposed publicly ----

from routes.auth_common import (
    router,
    logger,
    RESET_TOKEN_EXPIRY_MINUTES,
    RESEND_API_KEY,
    RESEND_FROM_EMAIL,
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
    User,
    UserCreate,
    UserLogin,
    GoogleSessionRequest,
    FacebookLoginRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    VerifyEmailRequest,
    ResendVerificationRequest,
    hash_password,
    _hash_password_sha256,
    verify_password,
    generate_reset_token,
    send_verification_email,
    send_reset_email,
    _check_plan_expiry,
)
from routes.auth_credentials import (
    register_user,
    login_user,
    resend_verification_email,
    verify_email,
    forgot_password,
    reset_password,
)
from routes.auth_oauth import (
    verify_facebook_access_token,
    _google_upsert_user,
    google_oauth_start,
    google_oauth_callback,
    google_session_exchange,
    facebook_login,
)
from routes.auth_users import (
    OnboardingPayload,
    _normalize_language_code,
    _normalize_native_language,
    _normalize_motivation,
    _normalize_weak_skills,
    _normalize_learning_mode,
    _normalize_exam_date,
    get_user_usage,
    get_user,
    save_onboarding,
)

# Kept for backward compatibility with the original module-level global.
db = None


def set_db(database):
    """Fan the DB handle out to every auth sub-module (server.py mount)."""
    global db
    db = database
    _common.set_db(database)
    _credentials.set_db(database)
    _oauth.set_db(database)
    _users.set_db(database)
