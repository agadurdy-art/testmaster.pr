"""
Payment Routes Module
=====================
Extracted from server.py for deploy-readiness refactoring.
Handles: PayPal orders/subscriptions, Ko-fi IPN, bank upload, manual credits,
         plan info, speaking session credits.
"""
import os
import json
import logging
import secrets
import string
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any

import httpx
from fastapi import APIRouter, HTTPException, Request, UploadFile, File, Form
from pydantic import BaseModel

from plan_access import (
    PLAN_PRICES_USD,
    PLAN_PRICES_VND,
    SUPPORTED_CURRENCIES,
    get_plan_features,
    get_plan_price,
    PLAN_FEATURES,
    resolve_custom_tier,
    custom_pools,
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


# ============ Models ============

class PaypalCreateOrderRequest(BaseModel):
    planId: str
    email: str
    # Custom slider only -- one-time purchase with dynamic price + duration.
    # Ignored for fixed plans (weekly/monthly/exam read PLAN_PRICES_USD).
    priceUsd: Optional[str] = None
    durationDays: Optional[int] = None


class PaypalCaptureOrderRequest(BaseModel):
    orderId: str
    planId: str
    email: str
    # Custom slider only; same semantics as create-order. Capture re-derives
    # the pool sizes server-side so the client can't tamper with them.
    priceUsd: Optional[str] = None
    durationDays: Optional[int] = None


class ActivateSubscriptionRequest(BaseModel):
    subscriptionId: str
    planId: str
    email: str


class CancelSubscriptionRequest(BaseModel):
    email: str
    reason: Optional[str] = None


class ManualCreditRequest(BaseModel):
    email: str
    plan: Optional[str] = None
    exam_credits: Optional[int] = None
    admin_token: Optional[str] = None
    admin_email: Optional[str] = None  # required by manual-credit-simple (audit fix)


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
    if expires_at and user.get("payment_method") == "bank_transfer":
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


# ============ Payment Order Retrieval ============

@router.get("/payments/orders/{order_id}")
async def get_payment_order(order_id: str):
    order = await db.payment_orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


# ============ PayPal Orders API ============

@router.post("/payments/paypal/create-order")
async def paypal_create_order(req: PaypalCreateOrderRequest):
    plan_id = req.planId
    email = req.email.strip().lower()
    # Custom slider: dynamic price + duration come from the request body.
    # Validate against the slider's documented bounds ($3.60 floor / 365-day
    # ceiling, locked 2026-05-08) so tampered clients can't sneak through.
    if plan_id == "custom":
        # Pre-launch audit 2026-05-16: float arithmetic on money is a known
        # source of off-by-a-cent bugs (e.g. 14.99 stored as 14.9899999…).
        # PayPal accepts strings, so we keep money in Decimal end-to-end and
        # only stringify at the API boundary.
        from decimal import Decimal, ROUND_HALF_UP, InvalidOperation
        try:
            price_dec = Decimal(str(req.priceUsd or "0")).quantize(
                Decimal("0.01"), rounding=ROUND_HALF_UP
            )
        except (InvalidOperation, TypeError, ValueError):
            raise HTTPException(status_code=400, detail="Invalid priceUsd")
        days = int(req.durationDays or 0)
        if price_dec < Decimal("3.00") or price_dec > Decimal("500.00"):
            raise HTTPException(status_code=400, detail="priceUsd out of range")
        if days < 3 or days > 365:
            raise HTTPException(status_code=400, detail="durationDays out of range")
        amount_value = format(price_dec, "f")
        order_description = f"IELTS Ace Custom — {days} days"
    elif plan_id in PAYPAL_PLAN_PRICES:
        amount_value = PAYPAL_PLAN_PRICES[plan_id]
        order_description = f"IELTS Ace {plan_id} plan"
    else:
        raise HTTPException(status_code=400, detail="Invalid planId")
    access_token = await get_paypal_access_token()
    order_payload = {
        "intent": "CAPTURE",
        "purchase_units": [{
            "amount": {"currency_code": "USD", "value": amount_value},
            "description": order_description,
            "custom_id": email,
        }],
    }
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{PAYPAL_API_BASE}/v2/checkout/orders",
            headers={"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"},
            json=order_payload,
        )
        try:
            resp.raise_for_status()
        except httpx.HTTPError as e:
            logger.error(f"PayPal create-order error: {e} - body={resp.text}")
            raise HTTPException(status_code=502, detail="Failed to create PayPal order")
        data = resp.json()
        order_id = data.get("id")
        if not order_id:
            logger.error(f"PayPal create-order missing id: {data}")
            raise HTTPException(status_code=502, detail="Invalid PayPal response")
        await db.kofi_events.insert_one({
            "provider": "paypal", "kind": "create-order", "order_id": order_id,
            "plan_id": plan_id, "email": email, "amount_usd": amount_value,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        return {"orderId": order_id}


@router.post("/payments/paypal/capture-order")
async def paypal_capture_order(req: PaypalCaptureOrderRequest):
    plan_id = req.planId
    email = req.email.strip().lower()
    # Validate up-front; Custom needs the same body fields capture-side so the
    # pool sizes are recomputed server-side (prevents tampering).
    if plan_id == "custom":
        try:
            price = float(req.priceUsd or 0)
        except (TypeError, ValueError):
            raise HTTPException(status_code=400, detail="Invalid priceUsd")
        days = int(req.durationDays or 0)
        if price < 3.0 or price > 500.0:
            raise HTTPException(status_code=400, detail="priceUsd out of range")
        if days < 3 or days > 365:
            raise HTTPException(status_code=400, detail="durationDays out of range")
    elif plan_id not in PAYPAL_PLAN_PRICES:
        raise HTTPException(status_code=400, detail="Invalid planId")
    user = await _get_user_by_email(email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    access_token = await get_paypal_access_token()
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{PAYPAL_API_BASE}/v2/checkout/orders/{req.orderId}/capture",
            headers={"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"},
            json={},
        )
        try:
            resp.raise_for_status()
        except httpx.HTTPError as e:
            logger.error(f"PayPal capture error: {e} - body={resp.text}")
            raise HTTPException(status_code=502, detail="Failed to capture PayPal order")
        data = resp.json()
    status_value = data.get("status")
    if status_value != "COMPLETED":
        raise HTTPException(status_code=400, detail=f"Order not completed (status={status_value})")
    # Codex audit P0 (#92): cross-validate capture payload against the
    # request. PayPal v2 returns purchase_units[0] with custom_id (the email
    # we stamped at create-order time) and the captured amount. Without
    # checking these, a $3 Custom order can be replayed to activate a $19.99
    # Exam plan, or another user's capture can be claimed against an
    # arbitrary email.
    purchase_units = data.get("purchase_units") or []
    if not purchase_units:
        logger.warning(f"PayPal capture missing purchase_units: order={req.orderId}")
        raise HTTPException(status_code=400, detail="Capture payload missing purchase units")
    unit = purchase_units[0]
    captured_custom_id = (unit.get("custom_id") or "").strip().lower()
    if captured_custom_id and captured_custom_id != email:
        logger.warning(
            f"PayPal capture custom_id mismatch: order={req.orderId} "
            f"custom_id={captured_custom_id} request_email={email}"
        )
        raise HTTPException(status_code=400, detail="Order does not belong to this account")
    # Amount lives under payments.captures[0].amount for v2 captures.
    captures = (unit.get("payments") or {}).get("captures") or []
    if not captures:
        logger.warning(f"PayPal capture missing captures array: order={req.orderId}")
        raise HTTPException(status_code=400, detail="Capture payload missing capture record")
    capture_amount = captures[0].get("amount") or {}
    captured_value = str(capture_amount.get("value") or "")
    captured_currency = capture_amount.get("currency_code") or ""
    capture_id = captures[0].get("id") or ""
    if captured_currency != "USD":
        logger.warning(
            f"PayPal capture currency mismatch: order={req.orderId} "
            f"currency={captured_currency}"
        )
        raise HTTPException(status_code=400, detail="Unexpected capture currency")
    # Fixed plans: expected value is PAYPAL_PLAN_PRICES[plan_id] (already a
    # string like "9.99"). Custom: expected value is the Decimal-quantized
    # priceUsd from the request, recomputed server-side so a tampered client
    # can't claim a different price than was captured.
    if plan_id == "custom":
        from decimal import Decimal, ROUND_HALF_UP, InvalidOperation
        try:
            expected_dec = Decimal(str(req.priceUsd or "0")).quantize(
                Decimal("0.01"), rounding=ROUND_HALF_UP
            )
        except (InvalidOperation, TypeError, ValueError):
            raise HTTPException(status_code=400, detail="Invalid priceUsd")
        expected_value = format(expected_dec, "f")
    else:
        expected_value = PAYPAL_PLAN_PRICES[plan_id]
    if captured_value != expected_value:
        logger.warning(
            f"PayPal capture amount mismatch: order={req.orderId} "
            f"captured={captured_value} expected={expected_value} plan={plan_id}"
        )
        raise HTTPException(status_code=400, detail="Captured amount does not match plan price")
    # Capture-id idempotency: a single capture must not upgrade multiple
    # users. kofi_events already has a row per processed capture; bail if
    # this capture_id was already booked.
    if capture_id:
        already = await db.kofi_events.find_one(
            {"provider": "paypal", "kind": "capture-order", "capture_id": capture_id},
            {"_id": 1},
        )
        if already:
            logger.info(f"PayPal capture {capture_id} already processed; ignoring replay")
            raise HTTPException(status_code=409, detail="Capture already processed")
    now = datetime.now(timezone.utc)
    plan_name, subscription_label = PAYPAL_PLAN_MAPPING[plan_id]

    # Custom: write subscription doc with effective_tier + 3 pools; expires_at
    # is computed from durationDays. Period counters (monthly_usage) stay zero
    # since Custom uses pool semantics, not period.
    if plan_id == "custom":
        pools = custom_pools(price)
        effective_tier = resolve_custom_tier(price)
        expires_at = (now + timedelta(days=days)).isoformat()
        subscription_doc = {
            "label": "Custom",
            "effective_tier": effective_tier,
            "purchase_price_usd": f"{price:.2f}",
            "duration_days": days,
            "expires_at": expires_at,
            "liz_pool_total": pools["liz"],
            "liz_pool_used": 0,
            "writing_pool_total": pools["writing"],
            "writing_pool_used": 0,
            "speaking_pool_total": pools["speaking"],
            "speaking_pool_used": 0,
            "started_at": now.isoformat(),
        }
        update_fields: Dict[str, Any] = {
            "plan": "custom",
            "subscription": subscription_doc,
            "plan_expires_at": expires_at,
            "lastPayment": now.isoformat(),
        }
    else:
        update_fields = {
            "plan": plan_name, "subscription": subscription_label,
            "lastPayment": now.isoformat(),
            "monthly_usage": {"liz_messages": 0, "speaking_evals": 0, "reset_date": now.isoformat()},
        }
    await db.users.update_one({"id": user["id"]}, {"$set": update_fields})
    await db.kofi_events.insert_one({
        "provider": "paypal", "kind": "capture-order", "order_id": req.orderId,
        "capture_id": capture_id,  # Codex P0 (#92): idempotency anchor
        "plan_id": plan_id, "email": email, "amount_usd": captured_value,
        "payload": data,
        "processed_at": now.isoformat(),
    })
    response: Dict[str, Any] = {
        "detail": "PayPal payment captured and plan updated",
        "plan": plan_name,
        "subscription": update_fields["subscription"],
    }
    if plan_id == "custom":
        response["pools"] = pools
        response["effective_tier"] = effective_tier
        response["expires_at"] = expires_at
    return response


# ============ PayPal Subscriptions ============

@router.post("/payments/paypal/activate-subscription")
async def activate_subscription(req: ActivateSubscriptionRequest):
    email = req.email.strip().lower()
    plan_id = req.planId
    if plan_id not in PAYPAL_PLAN_MAPPING:
        raise HTTPException(status_code=400, detail="Invalid planId")
    user = await _get_user_by_email(email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # Codex audit P0 (#91): sub ID uniqueness — refuse if a *different* user
    # already owns this subscription. Without this, a valid sub ID can be
    # replayed against any email/plan combo. Same user re-activating is fine.
    duplicate = await db.users.find_one(
        {"paypal_subscription_id": req.subscriptionId, "id": {"$ne": user["id"]}},
        {"_id": 1, "id": 1},
    )
    if duplicate:
        logger.warning(
            f"PayPal sub {req.subscriptionId} already bound to a different user; "
            f"refusing to rebind for {email}"
        )
        raise HTTPException(status_code=409, detail="Subscription already linked to another account")
    access_token = await get_paypal_access_token()
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{PAYPAL_API_BASE}/v1/billing/subscriptions/{req.subscriptionId}",
            headers={"Authorization": f"Bearer {access_token}"},
        )
    # Codex audit P0 (#91): fail closed when PayPal verify endpoint errors —
    # previous code just logged a warning and continued, which meant any
    # subscriptionId string activated a plan if PayPal happened to 4xx/5xx.
    if resp.status_code != 200:
        logger.warning(f"PayPal sub verify failed: {resp.status_code} {resp.text}")
        raise HTTPException(status_code=502, detail="PayPal subscription verification failed")
    sub_data = resp.json()
    sub_status = sub_data.get("status", "")
    if sub_status not in ("ACTIVE", "APPROVED"):
        raise HTTPException(status_code=400, detail=f"Subscription not active (status={sub_status})")
    # Codex audit P0 (#91): plan_id cross-validation. PayPal's plan_id maps to
    # an internal tier via PAYPAL_SUBSCRIPTION_PLAN_IDS; that tier must equal
    # the requested planId. Otherwise a valid Weekly sub could be claimed as
    # Monthly. Skip the check only if the env mapping is unconfigured (empty
    # string keys mean the env var wasn't set in this environment).
    paypal_plan_id = sub_data.get("plan_id", "")
    expected_tier = PAYPAL_SUBSCRIPTION_PLAN_IDS.get(paypal_plan_id)
    if paypal_plan_id and expected_tier and expected_tier != plan_id:
        logger.warning(
            f"PayPal sub plan mismatch for {email}: paypal_plan_id={paypal_plan_id} "
            f"resolves to {expected_tier}, but request asked for {plan_id}"
        )
        raise HTTPException(status_code=400, detail="Subscription plan does not match requested plan")
    # Codex audit P0 (#91): subscriber email cross-validation. The PayPal
    # subscriber's email must match the account being upgraded — otherwise
    # someone else's sub can be replayed against an arbitrary email.
    subscriber = sub_data.get("subscriber") or {}
    subscriber_email = (subscriber.get("email_address") or "").strip().lower()
    if subscriber_email and subscriber_email != email:
        logger.warning(
            f"PayPal subscriber email mismatch: subscriber={subscriber_email} "
            f"vs request={email} (sub={req.subscriptionId})"
        )
        raise HTTPException(status_code=400, detail="Subscriber email does not match account email")
    plan_name, subscription_label = PAYPAL_PLAN_MAPPING[plan_id]
    update_fields = {
        "plan": plan_name, "subscription": subscription_label,
        "paypal_subscription_id": req.subscriptionId,
        "lastPayment": datetime.now(timezone.utc).isoformat(),
        "monthly_usage": {"liz_messages": 0, "speaking_evals": 0, "reset_date": datetime.now(timezone.utc).isoformat()},
    }
    await db.users.update_one({"id": user["id"]}, {"$set": update_fields})
    await db.kofi_events.insert_one({
        "provider": "paypal", "kind": "subscription-activated",
        "subscription_id": req.subscriptionId, "plan_id": plan_id,
        "email": email, "processed_at": datetime.now(timezone.utc).isoformat(),
    })
    return {"detail": "Subscription activated", "plan": plan_name, "subscription": subscription_label}


@router.post("/payments/paypal/cancel-subscription")
async def cancel_subscription(req: CancelSubscriptionRequest):
    """Cancel the user's active PayPal subscription.

    Calls PayPal /v1/billing/subscriptions/{id}/cancel. We do NOT immediately
    flip the user back to free — PayPal keeps the sub active until the end of
    the current billing period and fires BILLING.SUBSCRIPTION.CANCELLED /
    EXPIRED webhook events. The user keeps paid features until then. What we
    DO set is `subscription_cancelled_at` so the dashboard can show the
    pending-cancellation banner.
    """
    email = req.email.strip().lower()
    user = await _get_user_by_email(email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    sub_id = user.get("paypal_subscription_id")
    if not sub_id:
        raise HTTPException(status_code=400, detail="No active subscription to cancel")
    access_token = await get_paypal_access_token()
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{PAYPAL_API_BASE}/v1/billing/subscriptions/{sub_id}/cancel",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json",
            },
            json={"reason": req.reason or "Customer requested cancellation"},
        )
        # 204 No Content is success; 422 with ALREADY_CANCELLED we also
        # treat as success so the UI settles even if PayPal is ahead of us.
        if resp.status_code not in (204, 200):
            body_text = resp.text
            if resp.status_code == 422 and "ALREADY_CANCELLED" in body_text:
                logger.info(f"Subscription {sub_id} already cancelled upstream")
            else:
                logger.warning(f"PayPal cancel failed {resp.status_code}: {body_text}")
                raise HTTPException(status_code=502, detail="PayPal cancel call failed")
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {
            "subscription_cancelled_at": datetime.now(timezone.utc).isoformat(),
            "subscription_cancel_reason": req.reason or "",
        }},
    )
    await db.kofi_events.insert_one({
        "provider": "paypal", "kind": "subscription-cancelled-by-user",
        "subscription_id": sub_id, "email": email,
        "reason": req.reason or "",
        "processed_at": datetime.now(timezone.utc).isoformat(),
    })
    return {
        "detail": "Subscription cancelled. You keep paid access until the end of the current period.",
        "subscription_id": sub_id,
    }


@router.post("/payments/paypal/subscription-webhook")
async def paypal_subscription_webhook(request: Request):
    body = await request.json()
    # 1. Verify signature — reject unverified events with 401.
    verified = await verify_paypal_webhook_signature(dict(request.headers), body)
    if not verified:
        logger.warning(f"PayPal webhook signature verification FAILED: event_id={body.get('id')}")
        raise HTTPException(status_code=401, detail="Webhook signature verification failed")
    event_id = body.get("id") or ""
    event_type = body.get("event_type", "")
    resource = body.get("resource", {})
    # 2. Idempotency — skip if we've already processed this event.
    if event_id:
        existing = await db.kofi_events.find_one(
            {"provider": "paypal", "kind": "webhook", "event_id": event_id},
            {"_id": 1},
        )
        if existing:
            logger.info(f"PayPal webhook duplicate event_id={event_id}, skipping")
            return {"status": "ok", "duplicate": True}
    logger.info(f"PayPal webhook verified: {event_type} id={event_id}")
    await db.kofi_events.insert_one({
        "provider": "paypal", "kind": "webhook", "event_id": event_id,
        "event_type": event_type, "payload": body,
        "received_at": datetime.now(timezone.utc).isoformat(),
    })
    if event_type == "PAYMENT.SALE.COMPLETED":
        billing_agreement_id = resource.get("billing_agreement_id", "")
        if billing_agreement_id:
            user = await db.users.find_one({"paypal_subscription_id": billing_agreement_id})
            if user:
                await db.users.update_one(
                    {"id": user["id"]},
                    {"$set": {
                        "lastPayment": datetime.now(timezone.utc).isoformat(),
                        "monthly_usage": {"liz_messages": 0, "speaking_evals": 0, "reset_date": datetime.now(timezone.utc).isoformat()},
                    }}
                )
                logger.info(f"Renewed subscription for {user.get('email')}")
    elif event_type in ("BILLING.SUBSCRIPTION.CANCELLED", "BILLING.SUBSCRIPTION.SUSPENDED"):
        sub_id = resource.get("id", "")
        if sub_id:
            user = await db.users.find_one({"paypal_subscription_id": sub_id})
            if user:
                await db.users.update_one(
                    {"id": user["id"]},
                    {"$set": {"plan": "free", "subscription": None, "paypal_subscription_id": None}}
                )
                logger.info(f"Cancelled/suspended subscription for {user.get('email')}")
    elif event_type == "BILLING.SUBSCRIPTION.ACTIVATED":
        # Safety net: if the frontend /activate-subscription call failed or
        # was bypassed, PayPal's webhook still activates the user. Resolve
        # plan tier from the subscription's plan_id via PAYPAL_SUBSCRIPTION_PLAN_IDS.
        sub_id = resource.get("id", "")
        paypal_plan_id = resource.get("plan_id", "")
        subscriber = resource.get("subscriber") or {}
        email = (subscriber.get("email_address") or "").strip().lower()
        tier_key = PAYPAL_SUBSCRIPTION_PLAN_IDS.get(paypal_plan_id)
        if not tier_key:
            logger.warning(f"Subscription activated for unknown plan_id={paypal_plan_id}")
        elif not email:
            logger.warning(f"Subscription activated without subscriber email: sub={sub_id}")
        else:
            plan_name, subscription_label = PAYPAL_PLAN_MAPPING[tier_key]
            result = await db.users.update_one(
                {"email": email},
                {"$set": {
                    "plan": plan_name,
                    "subscription": subscription_label,
                    "paypal_subscription_id": sub_id,
                    "lastPayment": datetime.now(timezone.utc).isoformat(),
                }},
            )
            if result.matched_count:
                logger.info(f"Webhook activated {plan_name} for {email} (sub={sub_id})")
            else:
                logger.warning(f"Subscription activated but user not found: {email}")
    return {"status": "ok"}


# ============ Plan Info ============

@router.get("/user/plan-info/{user_email}")
async def get_user_plan_info(user_email: str):
    user = await _get_user_by_email(user_email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    plan = user.get("plan", "free")
    features = get_plan_features(plan)
    usage = user.get("monthly_usage", {"liz_messages": 0, "speaking_evals": 0})
    return {
        "plan": plan, "subscription": user.get("subscription"),
        "features": features, "monthly_usage": usage,
        "plan_expires_at": user.get("plan_expires_at"),
        "payment_method": user.get("payment_method"),
    }


@router.get("/plan/features")
async def get_all_plan_features():
    return {
        "plans": PLAN_FEATURES,
        "prices": PLAN_PRICES_USD,  # kept for backward compatibility
        "prices_usd": PLAN_PRICES_USD,
        "prices_vnd": PLAN_PRICES_VND,
        "currencies": list(SUPPORTED_CURRENCIES),
    }


@router.get("/pricing/plans")
async def get_pricing_plans(currency: str = "USD"):
    """Pricing page endpoint — returns plans with prices in the requested
    currency. Currency query param: USD (default) or VND.
    Frontend currency toggle hits this with ?currency=VND.
    """
    cur = (currency or "USD").upper()
    if cur not in SUPPORTED_CURRENCIES:
        cur = "USD"
    plans = []
    for plan_id in ("explorer", "learner", "achiever", "master"):
        plans.append({
            "id": plan_id,
            "features": PLAN_FEATURES[plan_id],
            "price": get_plan_price(plan_id, cur),
            "price_usd": PLAN_PRICES_USD[plan_id],
            "price_vnd": PLAN_PRICES_VND[plan_id],
        })
    return {"currency": cur, "plans": plans, "currencies": list(SUPPORTED_CURRENCIES)}


# ============ Speaking Session Credits ============

@router.post("/speaking/session/start")
async def start_speaking_session(request: Request):
    user_email = request.headers.get("x-user-email")
    if not user_email:
        raise HTTPException(status_code=401, detail="Missing user context")
    user = await _get_user_by_email(user_email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    FREE_TRIAL_SECONDS = 180
    free_used = int(user.get("ai_interview_free_seconds_used", 0) or 0)
    if free_used < FREE_TRIAL_SECONDS:
        atomic = await db.users.update_one(
            {"id": user["id"], "ai_interview_free_seconds_used": {"$lt": FREE_TRIAL_SECONDS}},
            {"$set": {"ai_interview_free_seconds_used": FREE_TRIAL_SECONDS}},
        )
        if atomic.modified_count > 0:
            updated = await db.users.find_one({"id": user["id"]}, {"_id": 0})
            return {
                "detail": "Free trial speaking session started",
                "remainingCredits": updated.get("examCredits", 0),
                "plan": updated.get("plan", "free"), "freeTrial": True,
                "freeTrialSecondsUsed": updated.get("ai_interview_free_seconds_used", FREE_TRIAL_SECONDS),
                "freeTrialSecondsTotal": FREE_TRIAL_SECONDS,
            }
    result = await db.users.update_one(
        {"id": user["id"], "examCredits": {"$gt": 0}},
        {"$inc": {"examCredits": -1}},
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=402, detail="No speaking credits left. Please purchase a plan.")
    updated = await db.users.find_one({"id": user["id"]}, {"_id": 0})
    return {
        "detail": "Speaking session started",
        "remainingCredits": updated.get("examCredits", 0),
        "plan": updated.get("plan", "free"), "freeTrial": False,
        "freeTrialSecondsUsed": updated.get("ai_interview_free_seconds_used", FREE_TRIAL_SECONDS),
        "freeTrialSecondsTotal": FREE_TRIAL_SECONDS,
    }


# ============ Ko-fi IPN — REMOVED (only PayPal and bank transfer are active) ============


# ============ PayPal IPN ============

@router.post("/payments/paypal/ipn")
async def paypal_ipn(request: Request):
    payload = await request.json()
    # SECURITY (audit F02): verify the PayPal webhook signature before trusting
    # anything. Without this, anyone could POST a fake PAYMENT.CAPTURE.COMPLETED
    # with a victim's email + an amount to grant a paid plan for free. Fail
    # closed, mirroring /payments/paypal/subscription-webhook.
    verified = await verify_paypal_webhook_signature(dict(request.headers), payload)
    if not verified:
        logger.warning(f"PayPal IPN signature verification FAILED: id={payload.get('id')}")
        raise HTTPException(status_code=401, detail="Webhook signature verification failed")
    event_type = payload.get("event_type")
    logger.info(f"PayPal webhook event_type={event_type}")
    if event_type != "PAYMENT.CAPTURE.COMPLETED":
        return {"detail": "Event ignored"}
    resource = payload.get("resource", {})
    # Idempotency (audit F02): never grant twice for the same capture/event.
    capture_id = (resource.get("id") or payload.get("id") or "").strip() or None
    if capture_id:
        already = await db.kofi_events.find_one(
            {"provider": "paypal", "capture_id": capture_id, "processed": True}
        )
        if already:
            return {"detail": "Already processed"}
    amount_info = resource.get("amount") or resource.get("gross_amount") or {}
    value_str = amount_info.get("value") or "0"
    # Pre-launch audit 2026-05-16: parse PayPal's string amount as Decimal so
    # the plan-bucket comparisons below are exact (2.99 / 9.99 / 19.99 etc.)
    # instead of `abs(amount - 2.99) < 0.01` float dance.
    from decimal import Decimal, InvalidOperation
    try:
        amount_dec = Decimal(str(value_str))
    except (InvalidOperation, ValueError):
        logger.error(f"Invalid PayPal amount: {value_str}")
        raise HTTPException(status_code=400, detail="Invalid amount")
    amount = float(amount_dec)  # legacy float kept for the comparisons below
    email = None
    payer = resource.get("payer")
    if isinstance(payer, dict):
        email = (payer.get("email_address") or "").strip().lower() or None
    if not email:
        email = (resource.get("payer_email") or "").strip().lower() or None
    if not email:
        email = (resource.get("custom_id") or "").strip().lower() or None
    if not email:
        logger.warning(f"PayPal webhook without email: resource={resource}")
        await db.kofi_events.insert_one(
            {"provider": "paypal", "received_at": datetime.now(timezone.utc).isoformat(), "payload": payload}
        )
        return {"detail": "Missing payer email"}
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user:
        logger.warning(f"PayPal payment for unknown email: {email}")
        await db.kofi_events.insert_one(
            {"provider": "paypal", "received_at": datetime.now(timezone.utc).isoformat(), "payload": payload}
        )
        return {"detail": "No matching user; event recorded."}
    update_fields: Dict[str, Any] = {}
    # Fallback amount→plan mapping for IPN events that arrive without an
    # order/subscription context. Primary activation happens via
    # capture-order or the subscription webhook; this is a safety net.
    # Locked 2026-05-08 cap matrix: $2.99/$9.99/$19.99. Legacy GE amounts
    # (4.99/9/19/29) kept for old subscriptions still in the wild.
    if abs(amount - 2.99) < 0.01:
        update_fields["plan"] = "weekly"
        update_fields["subscription"] = "Weekly"
    elif abs(amount - 9.99) < 0.01:
        update_fields["plan"] = "monthly"
        update_fields["subscription"] = "Monthly"
    elif abs(amount - 19.99) < 0.01:
        update_fields["plan"] = "exam"
        update_fields["subscription"] = "Exam Pack"
    elif abs(amount - 4.99) < 0.01:
        update_fields["examCredits"] = user.get("examCredits", 0) + 1
    elif abs(amount - 9.0) < 0.01:
        update_fields["plan"] = "learner"
        update_fields["subscription"] = "Learner"
        update_fields["examCredits"] = user.get("examCredits", 0) + 2
    elif abs(amount - 19.0) < 0.01:
        update_fields["plan"] = "achiever"
        update_fields["subscription"] = "Achiever"
        update_fields["examCredits"] = user.get("examCredits", 0) + 5
    elif abs(amount - 29.0) < 0.01:
        update_fields["plan"] = "master"
        update_fields["subscription"] = "Master"
        update_fields["examCredits"] = user.get("examCredits", 0) + 8
    if not update_fields:
        logger.warning(f"PayPal payment amount {amount} not matching any plan")
        return {"detail": "Amount not mapped"}
    update_fields["lastPayment"] = datetime.now(timezone.utc).isoformat()
    await db.users.update_one({"id": user["id"]}, {"$set": update_fields})
    await db.kofi_events.insert_one(
        {
            "provider": "paypal",
            "capture_id": capture_id,
            "processed": True,
            "received_at": datetime.now(timezone.utc).isoformat(),
            "payload": payload,
        }
    )
    return {"detail": "OK"}


# ============ Manual Credit ============

@router.post("/payments/manual-credit-simple")
async def manual_credit_simple(req: ManualCreditRequest):
    """Admin-only top-up. Pre-launch audit (2026-05-16) flagged that this
    endpoint had no auth at all — any caller could grant master / exam credits
    to any email. Now requires admin_email in body and validates against the
    server-side allowlist (security_utils.require_admin_email).
    """
    from security_utils import require_admin_email
    require_admin_email(req.admin_email)
    user = await _get_user_by_email(req.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    update_fields: Dict[str, Any] = {}
    if req.plan:
        update_fields["plan"] = req.plan
    if req.exam_credits is not None:
        update_fields["examCredits"] = req.exam_credits
    if not update_fields:
        raise HTTPException(status_code=400, detail="Nothing to update")
    await db.users.update_one({"id": user["id"]}, {"$set": update_fields})
    return {"detail": "User updated", "email": req.email, "update": update_fields}


@router.post("/payments/manual-credit")
async def manual_credit(req: ManualCreditRequest):
    admin_token = os.getenv("MANUAL_CREDIT_ADMIN_TOKEN", "")
    if not admin_token or req.admin_token != admin_token:
        raise HTTPException(status_code=401, detail="Invalid admin token")
    user = await _get_user_by_email(req.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    update_fields: Dict[str, Any] = {}
    if req.plan:
        update_fields["plan"] = req.plan
    if req.exam_credits is not None:
        update_fields["examCredits"] = req.exam_credits
    if not update_fields:
        raise HTTPException(status_code=400, detail="Nothing to update")
    await db.users.update_one({"id": user["id"]}, {"$set": update_fields})
    return {"detail": "User updated", "email": req.email, "update": update_fields}


# ============ Bank Transfer Upload ============

@router.post("/payments/bank/upload")
async def upload_bank_payment(
    request: Request,
    plan_id: str = Form(...),
    email: str = Form(...),
    screenshot: UploadFile = File(...),
):
    """Accept a payment screenshot and queue it for admin review.

    Pre-launch audit (2026-05-16) flagged that this endpoint auto-granted
    30 days of any tier to anyone who uploaded any PNG — no admin approval.
    Now: stores the screenshot + creates a pending_bank_payments row, and
    returns "awaiting review". An admin runs /payments/manual-credit-simple
    (allowlist-gated) to activate the plan after verifying the transfer.

    SePay webhook (/payments/sepay/webhook) remains the auto-activation
    path because bank notifications there are signed by the SePay relay.
    """
    from security_utils import validate_upload_filename
    validate_upload_filename(screenshot.filename)
    email_clean = email.strip().lower()
    user = await _get_user_by_email(email_clean)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    uploads_dir = os.path.join(os.path.dirname(__file__), "..", "uploads", "bank")
    os.makedirs(uploads_dir, exist_ok=True)
    filename = f"{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}_{screenshot.filename}"
    filepath = os.path.join(uploads_dir, filename)
    with open(filepath, "wb") as f:
        f.write(await screenshot.read())
    if plan_id not in PAYPAL_PLAN_MAPPING:
        raise HTTPException(status_code=400, detail="Invalid plan_id")
    plan_name, subscription_label = PAYPAL_PLAN_MAPPING[plan_id]
    await db.pending_bank_payments.insert_one({
        "provider": "bank_upload",
        "submitted_at": datetime.now(timezone.utc).isoformat(),
        "email": email_clean,
        "user_id": user["id"],
        "plan_id": plan_id,
        "plan_name": plan_name,
        "subscription_label": subscription_label,
        "screenshot_path": filepath,
        "status": "pending_review",
    })
    return {
        "detail": "Payment proof received. Our team will activate your subscription within 24 hours.",
        "status": "pending_review",
        "plan": plan_name,
        "subscription": subscription_label,
    }


# ============ SePay (Vietnamese bank webhook) ============
#
# Flow: user picks a plan on the pricing page and elects "bank transfer".
# Frontend calls /payments/sepay/initiate to mint a short reference code
# (e.g. TM-A1B2C3-MONTHLY-7K9P). Backend stores a pending_payments row.
# User transfers the VND amount with that code in the memo/description.
# SePay relays the bank notification to /payments/sepay/webhook — we match
# on the reference code, activate the plan, and mark the row processed.
#
# Signature/API-key verification on the webhook is added once the user
# provides the SePay credentials (pending).

SEPAY_BANK_INFO = {
    "bank_name": os.getenv("SEPAY_BANK_NAME", ""),
    "account_number": os.getenv("SEPAY_ACCOUNT_NUMBER", ""),
    "account_holder": os.getenv("SEPAY_ACCOUNT_HOLDER", ""),
}
SEPAY_API_KEY = os.getenv("SEPAY_API_KEY", "")

# Codex audit P0 (#97): production hardening. When ENVIRONMENT=production
# is set in the deploy env (Railway), the SePay webhook hard-fails with 503
# if SEPAY_API_KEY is missing — otherwise an unauthenticated webhook can
# activate plans for free. Dev/staging still accepts missing key with a
# warning so local testing isn't blocked.
IS_PRODUCTION = os.getenv("ENVIRONMENT", "").strip().lower() == "production"

# Loud at import time if any SePay credential is missing — otherwise the QR
# code in BankTransferCheckout.js renders against an empty bank/account and the
# user has no way to pay. The route still serves (returns "" fields) so dev
# environments without VND config don't crash; it's purely a visibility nudge
# for production.
_sepay_missing = [k for k, v in SEPAY_BANK_INFO.items() if not v]
if _sepay_missing:
    logger.warning(
        "SePay env incomplete — missing %s. VND bank transfer flow will return "
        "empty bank_info and the QR code will fail. Set SEPAY_BANK_NAME, "
        "SEPAY_ACCOUNT_NUMBER, SEPAY_ACCOUNT_HOLDER (and SEPAY_API_KEY for "
        "webhook auth) on the deploy environment.",
        ", ".join(_sepay_missing),
    )
elif not SEPAY_API_KEY:
    if IS_PRODUCTION:
        logger.error(
            "SePay bank info set but SEPAY_API_KEY missing in PRODUCTION — "
            "webhook will return 503 until the key is configured."
        )
    else:
        logger.warning(
            "SePay bank info set but SEPAY_API_KEY missing — webhook will accept "
            "unauthenticated callbacks. Acceptable in staging; set the key in prod."
        )

PLAN_DURATION_DAYS = {
    "explorer": 30, "learner": 30, "achiever": 30, "master": 30,
    # Design-handoff plan keys (consumer-facing)
    "weekly": 7, "monthly": 30, "exam": 30,
}


def _generate_sepay_reference(user_id: str, plan_id: str) -> str:
    """Produce a short, human-transcribable reference code.
    Format: TM-{user6}-{plan3}-{nonce4}. The user6 slug lets support trace
    a code back to a user without the DB; the nonce prevents collisions if
    the same user initiates multiple pending payments."""
    user_short = (user_id or "").replace("-", "")[:6].upper() or "ANON00"
    plan_short = (plan_id or "").upper()[:3] or "XXX"
    alphabet = string.ascii_uppercase + string.digits
    nonce = "".join(secrets.choice(alphabet) for _ in range(4))
    return f"TM-{user_short}-{plan_short}-{nonce}"


class SepayInitiateRequest(BaseModel):
    planId: str
    email: str
    currency: Optional[str] = "VND"


@router.post("/payments/sepay/initiate")
async def sepay_initiate(req: SepayInitiateRequest):
    # Codex audit P0 (#98): refuse to mint a reference code when the SePay
    # bank credentials aren't fully configured. Previously the route still
    # returned with empty bank_info fields → BankTransferCheckout.js would
    # render a VietQR against a blank account number (falling back to "MB"
    # bank code) and the user couldn't pay. 503 surfaces the misconfig as
    # a hard error so the frontend can show "payment temporarily unavailable"
    # instead of a broken QR.
    if not all(SEPAY_BANK_INFO.values()):
        missing = [k for k, v in SEPAY_BANK_INFO.items() if not v]
        logger.error(f"SePay initiate refused: missing config {missing}")
        raise HTTPException(
            status_code=503,
            detail="Bank transfer temporarily unavailable",
        )
    plan_id = (req.planId or "").strip().lower()
    if plan_id not in PLAN_DURATION_DAYS:
        raise HTTPException(status_code=400, detail="Invalid planId")
    email = req.email.strip().lower()
    user = await _get_user_by_email(email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # All IELTS V2 plans now have a canonical VND entry in PLAN_PRICES_VND
    # (locked 2026-05-08). No fallback table -- if a plan key is missing here
    # it's a config error, not a translation gap.
    amount_vnd = PLAN_PRICES_VND.get(plan_id, "0")
    reference_code = _generate_sepay_reference(user["id"], plan_id)
    # Expire pending payments after 24h -- prevents stale codes stacking up.
    expires_at = (datetime.now(timezone.utc) + timedelta(hours=24)).isoformat()
    await db.pending_payments.insert_one({
        "provider": "sepay",
        "reference_code": reference_code,
        "user_id": user["id"],
        "email": email,
        "plan_id": plan_id,
        "amount_vnd": amount_vnd,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "expires_at": expires_at,
    })
    return {
        "reference_code": reference_code,
        "amount_vnd": amount_vnd,
        "bank_info": SEPAY_BANK_INFO,
        "expires_at": expires_at,
        "instructions": (
            "Chuyen khoan voi noi dung giao dich chua dung ma "
            f"{reference_code}. Goi se kich hoat tu dong sau khi nhan duoc chuyen khoan."
        ),
    }


@router.get("/payments/sepay/status/{reference_code}")
async def sepay_status(reference_code: str):
    row = await db.pending_payments.find_one(
        {"provider": "sepay", "reference_code": reference_code},
        {"_id": 0},
    )
    if not row:
        raise HTTPException(status_code=404, detail="Reference not found")
    status_value = row.get("status", "pending")
    # Codex audit P0 (#97): compute expiry on read. Without this, a pending
    # row whose expires_at has passed still reports "pending" to the polling
    # checkout page, so the spinner spins forever. Surface "expired" so the
    # UI can prompt the user to start a new transfer.
    expires_at_raw = row.get("expires_at")
    if status_value == "pending" and expires_at_raw:
        try:
            exp_dt = (
                datetime.fromisoformat(expires_at_raw)
                if isinstance(expires_at_raw, str)
                else expires_at_raw
            )
            if exp_dt < datetime.now(timezone.utc):
                status_value = "expired"
                # Best-effort write so subsequent polls/webhooks skip the row.
                try:
                    await db.pending_payments.update_one(
                        {"provider": "sepay", "reference_code": reference_code, "status": "pending"},
                        {"$set": {"status": "expired"}},
                    )
                except Exception as e:
                    logger.warning(f"Failed to persist SePay expiry for {reference_code}: {e}")
        except (ValueError, TypeError):
            pass
    return {
        "reference_code": reference_code,
        "status": status_value,
        "plan_id": row.get("plan_id"),
        "processed_at": row.get("processed_at"),
    }


@router.post("/payments/sepay/webhook")
async def sepay_webhook(request: Request):
    """SePay relays a bank transaction notification here. Expected payload
    shape (per SePay docs): transferAmount, content (memo), gateway, etc.

    Signature / API key verification is enforced once SEPAY_API_KEY is set.
    Until then the handler logs + processes (dev/staging only -- do NOT
    deploy without SEPAY_API_KEY in production env)."""
    # 1. Codex audit P0 (#97): in production, SEPAY_API_KEY is mandatory.
    #    Missing key → 503 (instead of silently fail-open). Dev/staging
    #    still accepts unauthenticated webhooks so local testing works.
    if IS_PRODUCTION and not SEPAY_API_KEY:
        logger.error("SePay webhook called in production but SEPAY_API_KEY not configured")
        raise HTTPException(status_code=503, detail="SePay webhook auth not configured")
    # 2. API key gate (header-based). When SEPAY_API_KEY is set,
    #    require matching Authorization: Apikey <key>.
    if SEPAY_API_KEY:
        auth_hdr = request.headers.get("authorization", "")
        expected = f"Apikey {SEPAY_API_KEY}"
        if auth_hdr != expected:
            logger.warning("SePay webhook: bad or missing API key")
            raise HTTPException(status_code=401, detail="Invalid API key")
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON body")
    # SePay payload fields: id, gateway, transactionDate, accountNumber,
    # content, transferAmount (VND, integer), referenceCode, description.
    # Codex audit P0 (#97): idempotency by SePay transaction id. SePay can
    # auto-retry deliveries on transient failures, and we don't want a single
    # transfer to flip the user's plan twice (resetting monthly_usage on each
    # replay). If we've already booked this transaction id, ack and exit.
    sepay_txn_id = payload.get("id") or payload.get("transactionId") or ""
    if sepay_txn_id:
        existing = await db.kofi_events.find_one(
            {"provider": "sepay", "kind": "webhook", "sepay_txn_id": str(sepay_txn_id)},
            {"_id": 1},
        )
        if existing:
            logger.info(f"SePay webhook duplicate transaction id={sepay_txn_id}, skipping")
            return {"status": "ok", "duplicate": True}
    content = (payload.get("content") or payload.get("description") or "")
    amount = payload.get("transferAmount") or 0
    try:
        amount_int = int(amount)
    except (TypeError, ValueError):
        amount_int = 0
    # Extract our reference code (TM-XXXXXX-XXX-XXXX) from the memo.
    # Search rather than split -- SePay includes bank-added prefixes.
    import re
    match = re.search(r"TM-[A-Z0-9]{4,8}-[A-Z]{2,4}-[A-Z0-9]{4}", content.upper())
    await db.kofi_events.insert_one({
        "provider": "sepay",
        "kind": "webhook",
        "sepay_txn_id": str(sepay_txn_id) if sepay_txn_id else None,
        "payload": payload,
        "reference_match": match.group(0) if match else None,
        "received_at": datetime.now(timezone.utc).isoformat(),
    })
    if not match:
        logger.info(f"SePay webhook: no reference code in content='{content}'")
        return {"status": "ok", "matched": False}
    reference_code = match.group(0)
    pending = await db.pending_payments.find_one({
        "provider": "sepay",
        "reference_code": reference_code,
        "status": "pending",
    })
    if not pending:
        logger.warning(f"SePay webhook: reference {reference_code} not pending")
        return {"status": "ok", "matched": False, "reason": "not_pending"}
    # Amount sanity check -- allow a small tolerance (some banks deduct a
    # tiny fee on inbound VND transfers).
    expected_amount = int(pending.get("amount_vnd") or "0")
    if amount_int and expected_amount and amount_int < expected_amount * 0.98:
        logger.warning(
            f"SePay amount mismatch for {reference_code}: got {amount_int}, expected {expected_amount}"
        )
        return {"status": "ok", "matched": True, "reason": "amount_too_low"}
    plan_id = pending.get("plan_id")
    days = PLAN_DURATION_DAYS.get(plan_id, 30)
    # plan_id is already a canonical tier (weekly/monthly/exam or legacy GE
    # key). The old handoff→GE translation (weekly→explorer, etc.) was a V1
    # stop-gap and is no longer needed; gating reads V2 caps directly.
    if plan_id not in PAYPAL_PLAN_MAPPING:
        logger.warning(f"SePay webhook: pending row has unknown plan_id={plan_id}")
        return {"status": "ok", "matched": True, "reason": "unknown_plan"}
    plan_name, subscription_label = PAYPAL_PLAN_MAPPING[plan_id]
    now = datetime.now(timezone.utc)
    expires_at = (now + timedelta(days=days)).isoformat()
    # `monthly_usage` must be reset on every plan activation, otherwise the
    # new SePay user inherits whatever Liz/speaking counters were on their
    # free row and hits 402s on a fresh paid plan. PayPal/bank-upload paths
    # already do this (routes/payments.py:370,419,521,805); SePay was the
    # missing one.
    await db.users.update_one(
        {"id": pending["user_id"]},
        {"$set": {
            "plan": plan_name,
            "subscription": subscription_label,
            "plan_expires_at": expires_at,
            "payment_method": "sepay",
            "lastPayment": now.isoformat(),
            "monthly_usage": {
                "liz_messages": 0,
                "speaking_evals": 0,
                "reset_date": now.isoformat(),
            },
        }},
    )
    await db.pending_payments.update_one(
        {"_id": pending["_id"]},
        {"$set": {
            "status": "completed",
            "processed_at": datetime.now(timezone.utc).isoformat(),
            "sepay_transaction_id": payload.get("id"),
            "sepay_amount_received": amount_int,
        }},
    )
    logger.info(f"SePay activated plan={plan_name} for user={pending['user_id']} ref={reference_code}")
    return {"status": "ok", "matched": True, "plan": plan_name}
