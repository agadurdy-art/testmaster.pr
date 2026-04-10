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
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any

import httpx
from fastapi import APIRouter, HTTPException, Request, UploadFile, File, Form
from pydantic import BaseModel

from plan_access import PLAN_PRICES_USD, get_plan_features, PLAN_FEATURES

router = APIRouter(prefix="/api", tags=["payments"])

db = None
logger = logging.getLogger(__name__)

PAYPAL_CLIENT_ID = os.getenv("PAYPAL_CLIENT_ID")
PAYPAL_CLIENT_SECRET = os.getenv("PAYPAL_CLIENT_SECRET")
PAYPAL_API_BASE = os.getenv("PAYPAL_API_BASE", "https://api-m.paypal.com")

PAYPAL_PLAN_PRICES = {
    "explorer": PLAN_PRICES_USD["explorer"],
    "learner": PLAN_PRICES_USD["learner"],
    "achiever": PLAN_PRICES_USD["achiever"],
    "master": PLAN_PRICES_USD["master"],
}

PAYPAL_PLAN_MAPPING = {
    "explorer": ("explorer", "Explorer"),
    "learner": ("learner", "Learner"),
    "achiever": ("achiever", "Achiever"),
    "master": ("master", "Master"),
}

PAYPAL_SUBSCRIPTION_PLAN_IDS = {
    os.getenv("PAYPAL_EXPLORER_PLAN_ID", ""): "explorer",
    os.getenv("PAYPAL_LEARNER_PLAN_ID", ""): "learner",
    os.getenv("PAYPAL_ACHIEVER_PLAN_ID", ""): "achiever",
    os.getenv("PAYPAL_MASTER_PLAN_ID", ""): "master",
}


def set_db(database):
    global db
    db = database


# ============ Models ============

class PaypalCreateOrderRequest(BaseModel):
    planId: str
    email: str


class PaypalCaptureOrderRequest(BaseModel):
    orderId: str
    planId: str
    email: str


class ActivateSubscriptionRequest(BaseModel):
    subscriptionId: str
    planId: str
    email: str


class ManualCreditRequest(BaseModel):
    email: str
    plan: Optional[str] = None
    exam_credits: Optional[int] = None
    admin_token: Optional[str] = None


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
    if plan_id not in PAYPAL_PLAN_PRICES:
        raise HTTPException(status_code=400, detail="Invalid planId")
    amount_value = PAYPAL_PLAN_PRICES[plan_id]
    access_token = await get_paypal_access_token()
    order_payload = {
        "intent": "CAPTURE",
        "purchase_units": [{
            "amount": {"currency_code": "USD", "value": amount_value},
            "description": f"IELTS Ace {plan_id} plan",
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
    if plan_id not in PAYPAL_PLAN_PRICES:
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
    plan_name, subscription_label = PAYPAL_PLAN_MAPPING[plan_id]
    update_fields: Dict[str, Any] = {
        "plan": plan_name, "subscription": subscription_label,
        "lastPayment": datetime.now(timezone.utc).isoformat(),
        "monthly_usage": {"liz_messages": 0, "speaking_evals": 0, "reset_date": datetime.now(timezone.utc).isoformat()},
    }
    await db.users.update_one({"id": user["id"]}, {"$set": update_fields})
    await db.kofi_events.insert_one({
        "provider": "paypal", "kind": "capture-order", "order_id": req.orderId,
        "plan_id": plan_id, "email": email, "payload": data,
        "processed_at": datetime.now(timezone.utc).isoformat(),
    })
    return {"detail": "PayPal payment captured and plan updated", "plan": plan_name, "subscription": subscription_label}


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
    access_token = await get_paypal_access_token()
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{PAYPAL_API_BASE}/v1/billing/subscriptions/{req.subscriptionId}",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        if resp.status_code == 200:
            sub_data = resp.json()
            sub_status = sub_data.get("status", "")
            if sub_status not in ("ACTIVE", "APPROVED"):
                raise HTTPException(status_code=400, detail=f"Subscription not active (status={sub_status})")
        else:
            logger.warning(f"PayPal sub verify failed: {resp.status_code} {resp.text}")
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


@router.post("/payments/paypal/subscription-webhook")
async def paypal_subscription_webhook(request: Request):
    body = await request.json()
    event_type = body.get("event_type", "")
    resource = body.get("resource", {})
    logger.info(f"PayPal webhook: {event_type}")
    await db.kofi_events.insert_one({
        "provider": "paypal", "kind": "webhook", "event_type": event_type,
        "payload": body, "received_at": datetime.now(timezone.utc).isoformat(),
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
    return {"plans": PLAN_FEATURES, "prices": PLAN_PRICES_USD}


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
    event_type = payload.get("event_type")
    logger.info(f"PayPal webhook event_type={event_type}")
    if event_type != "PAYMENT.CAPTURE.COMPLETED":
        return {"detail": "Event ignored"}
    resource = payload.get("resource", {})
    amount_info = resource.get("amount") or resource.get("gross_amount") or {}
    value_str = amount_info.get("value") or "0"
    try:
        amount = float(str(value_str))
    except ValueError:
        logger.error(f"Invalid PayPal amount: {value_str}")
        raise HTTPException(status_code=400, detail="Invalid amount")
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
    if abs(amount - 4.99) < 0.01:
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
        {"provider": "paypal", "received_at": datetime.now(timezone.utc).isoformat(), "payload": payload}
    )
    return {"detail": "OK"}


# ============ Manual Credit ============

@router.post("/payments/manual-credit-simple")
async def manual_credit_simple(req: ManualCreditRequest):
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
    expires_at = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
    update_fields: Dict[str, Any] = {
        "plan": plan_name, "subscription": subscription_label,
        "plan_expires_at": expires_at, "payment_method": "bank_transfer",
        "lastPayment": datetime.now(timezone.utc).isoformat(),
        "monthly_usage": {"liz_messages": 0, "speaking_evals": 0, "reset_date": datetime.now(timezone.utc).isoformat()},
    }
    await db.users.update_one({"id": user["id"]}, {"$set": update_fields})
    await db.kofi_events.insert_one({
        "provider": "bank", "received_at": datetime.now(timezone.utc).isoformat(),
        "email": email_clean, "plan_id": plan_id, "plan_name": plan_name,
        "expires_at": expires_at, "screenshot_path": filepath,
    })
    return {"detail": "Bank payment recorded. Plan active for 30 days.", "plan": plan_name, "subscription": subscription_label, "expires_at": expires_at}
