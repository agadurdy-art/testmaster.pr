"""
Payments Common Module
======================
Single job: shared payments infrastructure — the shared APIRouter, PayPal
client/env config, plan price/mapping tables, webhook signature verification,
and user/plan-expiry lookup helpers used by every payments sub-module.
Extracted from routes/payments.py (Faz 1 refactor, 2026-07-02).
"""
import os
import logging
from datetime import datetime, timezone
from typing import Optional

import httpx
from fastapi import APIRouter, HTTPException

from plan_access import (
    PLAN_PRICES_USD,
)

router = APIRouter(prefix="/api", tags=["payments"])

db = None
logger = logging.getLogger(__name__)

PAYPAL_CLIENT_ID = os.getenv("PAYPAL_CLIENT_ID")
PAYPAL_CLIENT_SECRET = os.getenv("PAYPAL_CLIENT_SECRET")
PAYPAL_API_BASE = os.getenv("PAYPAL_API_BASE", "https://api-m.paypal.com")
PAYPAL_WEBHOOK_ID = os.getenv("PAYPAL_WEBHOOK_ID", "")

PAYPAL_PLAN_PRICES = {
    # Legacy GE plans
    "explorer": PLAN_PRICES_USD["explorer"],
    "learner": PLAN_PRICES_USD["learner"],
    "achiever": PLAN_PRICES_USD["achiever"],
    "master": PLAN_PRICES_USD["master"],
    # New IELTS plans
    "weekly": PLAN_PRICES_USD["weekly"],
    "monthly": PLAN_PRICES_USD["monthly"],
    "exam": PLAN_PRICES_USD["exam"],
}

PAYPAL_PLAN_MAPPING = {
    # Legacy GE plans
    "explorer": ("explorer", "Explorer"),
    "learner": ("learner", "Learner"),
    "achiever": ("achiever", "Achiever"),
    "master": ("master", "Master"),
    # New IELTS plans
    "weekly": ("weekly", "Weekly"),
    "monthly": ("monthly", "Monthly"),
    "exam": ("exam", "Exam Pack"),
    # Custom slider purchase: price + days come from the request body, not the
    # static price tables. Pool sizes derived in capture-order via custom_pools().
    "custom": ("custom", "Custom"),
}

# Reverse lookup: PayPal plan ID (P-XXX...) -> our internal plan key.
# Weekly + Monthly are subscriptions (recurring). Exam Pack is one-time
# (Orders API, no subscription plan ID).
PAYPAL_SUBSCRIPTION_PLAN_IDS = {
    # Legacy GE subscriptions
    os.getenv("PAYPAL_EXPLORER_PLAN_ID", ""): "explorer",
    os.getenv("PAYPAL_LEARNER_PLAN_ID", ""): "learner",
    os.getenv("PAYPAL_ACHIEVER_PLAN_ID", ""): "achiever",
    os.getenv("PAYPAL_MASTER_PLAN_ID", ""): "master",
    # New IELTS subscriptions
    os.getenv("PAYPAL_WEEKLY_PLAN_ID", ""): "weekly",
    os.getenv("PAYPAL_MONTHLY_PLAN_ID", ""): "monthly",
}


def set_db(database):
    global db
    db = database


# Full Mock Test credits — one-time top-up, separate from plans. 1 credit = 1
# full ElevenLabs mock exam (≈$1.2–1.5 cost, capped). Sold as $3 packages; the
# user buys however many they want (quantity). Stored on user.mockCredits.
MOCK_CREDIT_UNIT_PRICE = "3.00"
MOCK_CREDIT_MAX_QTY = 50


def _mock_credit_amount(quantity: Optional[int]) -> tuple:
    """Validate quantity and return (qty, amount_string) for mock-credit orders."""
    try:
        qty = int(quantity or 0)
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail="Invalid quantity")
    if qty < 1 or qty > MOCK_CREDIT_MAX_QTY:
        raise HTTPException(status_code=400, detail="quantity out of range")
    from decimal import Decimal, ROUND_HALF_UP
    total = (Decimal(MOCK_CREDIT_UNIT_PRICE) * qty).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    return qty, format(total, "f")


# ============ Helpers ============

async def get_paypal_access_token() -> str:
    if not PAYPAL_CLIENT_ID or not PAYPAL_CLIENT_SECRET:
        logger.error("PayPal client ID/secret not configured")
        raise HTTPException(status_code=500, detail="PayPal not configured")
    auth = httpx.BasicAuth(PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET)
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{PAYPAL_API_BASE}/v1/oauth2/token",
            data={"grant_type": "client_credentials"},
            auth=auth,
        )
        try:
            resp.raise_for_status()
        except httpx.HTTPError as e:
            logger.error(f"PayPal token error: {e} - body={resp.text}")
            raise HTTPException(status_code=502, detail="PayPal auth failed")
        data = resp.json()
        token = data.get("access_token")
        if not token:
            logger.error(f"PayPal token missing in response: {data}")
            raise HTTPException(status_code=502, detail="PayPal auth failed")
        return token


async def verify_paypal_webhook_signature(headers: dict, body: dict) -> bool:
    """
    Calls PayPal's /v1/notifications/verify-webhook-signature to validate
    a webhook's authenticity. Returns True only if PayPal returns
    verification_status == "SUCCESS".

    Fails closed: returns False on any error (missing config, non-2xx, etc.)
    so the webhook handler can reject the event.
    """
    if not PAYPAL_WEBHOOK_ID:
        logger.error("PAYPAL_WEBHOOK_ID not configured — cannot verify webhook")
        return False
    required_headers = [
        "paypal-auth-algo", "paypal-cert-url", "paypal-transmission-id",
        "paypal-transmission-sig", "paypal-transmission-time",
    ]
    # headers from Starlette are case-insensitive but dict() lowercases them
    lc = {k.lower(): v for k, v in headers.items()}
    for h in required_headers:
        if h not in lc:
            logger.warning(f"PayPal webhook missing header: {h}")
            return False
    try:
        access_token = await get_paypal_access_token()
    except HTTPException:
        return False
    verify_payload = {
        "auth_algo": lc["paypal-auth-algo"],
        "cert_url": lc["paypal-cert-url"],
        "transmission_id": lc["paypal-transmission-id"],
        "transmission_sig": lc["paypal-transmission-sig"],
        "transmission_time": lc["paypal-transmission-time"],
        "webhook_id": PAYPAL_WEBHOOK_ID,
        "webhook_event": body,
    }
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(
                f"{PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature",
                headers={"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"},
                json=verify_payload,
                timeout=10.0,
            )
            resp.raise_for_status()
            result = resp.json()
            return result.get("verification_status") == "SUCCESS"
        except Exception as e:
            logger.error(f"PayPal webhook verify error: {e}")
            return False


async def _check_plan_expiry(user: dict) -> dict:
    expires_at = user.get("plan_expires_at")
    # Downgrade ANY finite plan whose window has passed. Only one-time/period
    # plans ever set plan_expires_at (PayPal exam & custom, SePay, bank transfer);
    # recurring PayPal weekly/monthly subscriptions never set it, so they are
    # untouched here and renew via PayPal. (Previously this was gated to
    # payment_method=="bank_transfer", so PayPal Exam packs never expired and
    # granted Exam tier forever.)
    if expires_at:
        try:
            exp_dt = datetime.fromisoformat(expires_at) if isinstance(expires_at, str) else expires_at
            if exp_dt < datetime.now(timezone.utc):
                await db.users.update_one(
                    {"id": user["id"]},
                    {"$set": {"plan": "free", "subscription": None, "plan_expires_at": None, "payment_method": None}}
                )
                user["plan"] = "free"
                user["subscription"] = None
                user["plan_expires_at"] = None
                user["payment_method"] = None
        except (ValueError, TypeError):
            pass
    return user


async def _get_user_by_email(email: str) -> Optional[dict]:
    user = await db.users.find_one({"email": email.lower().strip()}, {"_id": 0})
    if user:
        user = await _check_plan_expiry(user)
    return user
