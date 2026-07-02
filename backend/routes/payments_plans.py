"""
Plan Info, Pricing & VND Bank Transfer Module
=============================================
Single job: plan-info/pricing endpoints plus the VND bank-transfer flows —
manual bank screenshot upload and the SePay initiate/status/webhook trio.
Extracted from routes/payments.py (Faz 1 refactor, 2026-07-02).
"""
import os
import logging
import secrets
import string
from datetime import datetime, timezone, timedelta
from typing import Optional

from fastapi import HTTPException, Request, UploadFile, File, Form, Depends
import auth_session  # audit F-01/F-05/IDOR: session-based ownership/admin gates
from pydantic import BaseModel

from plan_access import (
    PLAN_PRICES_USD,
    PLAN_PRICES_VND,
    SUPPORTED_CURRENCIES,
    get_plan_features,
    get_plan_price,
    PLAN_FEATURES,
)
from routes.payments_common import (
    router,
    PAYPAL_PLAN_MAPPING,
    _get_user_by_email,
)

db = None
logger = logging.getLogger(__name__)


def set_db(database):
    global db
    db = database


# ============ Plan Info ============

@router.get("/user/plan-info/{user_email}")
async def get_user_plan_info(user_email: str, caller: dict = Depends(auth_session.current_user)):
    # Audit: plan/subscription disclosure by email enumeration — now self/admin only.
    if (caller.get("email") or "").lower() != user_email.strip().lower() and not auth_session.is_admin(caller):
        raise HTTPException(status_code=403, detail="Forbidden")
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
