"""
PayPal Subscriptions & Webhooks Module
======================================
Single job: PayPal recurring subscriptions — activate/cancel endpoints, the
subscription webhook, and the PayPal IPN handler (signature-verified).
Extracted from routes/payments.py (Faz 1 refactor, 2026-07-02).
"""
import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any

import httpx
from fastapi import HTTPException, Request, Depends
import auth_session  # audit F-01/F-05/IDOR: session-based ownership/admin gates
from pydantic import BaseModel

from routes.payments_common import (
    router,
    PAYPAL_API_BASE,
    PAYPAL_PLAN_MAPPING,
    PAYPAL_SUBSCRIPTION_PLAN_IDS,
    get_paypal_access_token,
    verify_paypal_webhook_signature,
    _get_user_by_email,
)

db = None
logger = logging.getLogger(__name__)


def set_db(database):
    global db
    db = database


# ============ Models ============

class ActivateSubscriptionRequest(BaseModel):
    subscriptionId: str
    planId: str
    email: str


class CancelSubscriptionRequest(BaseModel):
    email: str
    reason: Optional[str] = None


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
async def cancel_subscription(req: CancelSubscriptionRequest, caller: dict = Depends(auth_session.current_user)):
    # Audit F-01: was an IDOR — anyone could cancel a victim's PayPal sub by email.
    if (caller.get("email") or "").lower() != req.email.strip().lower() and not auth_session.is_admin(caller):
        raise HTTPException(status_code=403, detail="Forbidden")
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
