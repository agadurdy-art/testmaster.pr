"""
PayPal Orders API Module
========================
Single job: PayPal one-time Orders API — payment-order lookup, create-order,
and capture-order (incl. Custom slider and mock-credit top-ups).
Extracted from routes/payments.py (Faz 1 refactor, 2026-07-02).
"""
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any

import httpx
from fastapi import HTTPException
from pydantic import BaseModel

from plan_access import (
    resolve_custom_tier,
    custom_pools,
)
from routes.payments_common import (
    router,
    PAYPAL_API_BASE,
    PAYPAL_PLAN_PRICES,
    PAYPAL_PLAN_MAPPING,
    get_paypal_access_token,
    _get_user_by_email,
    _mock_credit_amount,
)

db = None
logger = logging.getLogger(__name__)


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
    # mock_credits only — number of $3 mock-credit packages to buy.
    quantity: Optional[int] = None


class PaypalCaptureOrderRequest(BaseModel):
    orderId: str
    planId: str
    email: str
    # Custom slider only; same semantics as create-order. Capture re-derives
    # the pool sizes server-side so the client can't tamper with them.
    priceUsd: Optional[str] = None
    durationDays: Optional[int] = None
    # mock_credits only — recomputed server-side at capture (anti-tamper).
    quantity: Optional[int] = None


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
    elif plan_id == "mock_credits":
        qty, amount_value = _mock_credit_amount(req.quantity)
        order_description = f"IELTS Ace — {qty} Full Mock Test credit{'s' if qty != 1 else ''}"
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
    elif plan_id == "mock_credits":
        _mock_credit_amount(req.quantity)  # validates quantity range
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
    elif plan_id == "mock_credits":
        _qty, expected_value = _mock_credit_amount(req.quantity)
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

    # Mock-credit top-up: not a plan change — just increment the user's balance
    # by the purchased quantity and record the (idempotent) capture.
    if plan_id == "mock_credits":
        qty, _amt = _mock_credit_amount(req.quantity)
        updated = await db.users.find_one_and_update(
            {"id": user["id"]},
            {"$inc": {"mockCredits": qty}, "$set": {"lastPayment": now.isoformat()}},
            return_document=True,
        )
        await db.kofi_events.insert_one({
            "provider": "paypal", "kind": "capture-order", "order_id": req.orderId,
            "capture_id": capture_id,
            "plan_id": "mock_credits", "email": email, "amount_usd": captured_value,
            "mock_credits_added": qty, "payload": data,
            "processed_at": now.isoformat(),
        })
        return {
            "detail": "Mock credits added",
            "mock_credits_added": qty,
            "mock_credits_balance": (updated or {}).get("mockCredits", qty),
        }

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
        # Exam Pack is a one-time purchase that must auto-expire after 30 days
        # (PLAN_FEATURES["exam"].auto_expires_30d). Without an expiry it granted
        # Exam tier forever; _check_plan_expiry reaps it once this passes.
        if plan_name == "exam":
            update_fields["plan_expires_at"] = (now + timedelta(days=30)).isoformat()
            update_fields["payment_method"] = "paypal"
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
