"""
Payment Routes Module (thin shim)
=================================
Extracted from routes/payments.py (Faz 1 refactor, 2026-07-02).
Single job: keep the historical `routes.payments` import path working.
The actual code now lives in single-responsibility modules:

- routes/payments_common.py        — shared router, PayPal env/client, plan
                                     tables, webhook verification, user helpers
- routes/payments_paypal_orders.py — PayPal Orders API create/capture + lookup
- routes/payments_subscriptions.py — subscriptions activate/cancel/webhook + IPN
- routes/payments_plans.py         — plan-info/pricing + bank upload + SePay VND
- routes/payments_credits.py       — speaking-session credits + manual admin credit

Importing the sub-modules below registers every route on the shared router
(same paths + methods as before the split). server.py keeps calling
`from routes.payments import router, set_db` unchanged.
"""
# Shared infra (defines the router all sub-modules register on).
from routes import payments_common as _common

# Import order mirrors the original file's route declaration order.
from routes import payments_paypal_orders as _paypal_orders
from routes import payments_subscriptions as _subscriptions
from routes import payments_plans as _plans
from routes import payments_credits as _credits

# ---- Re-exports: everything the original module exposed publicly ----

from routes.payments_common import (
    router,
    logger,
    PAYPAL_CLIENT_ID,
    PAYPAL_CLIENT_SECRET,
    PAYPAL_API_BASE,
    PAYPAL_WEBHOOK_ID,
    PAYPAL_PLAN_PRICES,
    PAYPAL_PLAN_MAPPING,
    PAYPAL_SUBSCRIPTION_PLAN_IDS,
    MOCK_CREDIT_UNIT_PRICE,
    MOCK_CREDIT_MAX_QTY,
    _mock_credit_amount,
    get_paypal_access_token,
    verify_paypal_webhook_signature,
    _check_plan_expiry,
    _get_user_by_email,
)
from routes.payments_paypal_orders import (
    PaypalCreateOrderRequest,
    PaypalCaptureOrderRequest,
    get_payment_order,
    paypal_create_order,
    paypal_capture_order,
)
from routes.payments_subscriptions import (
    ActivateSubscriptionRequest,
    CancelSubscriptionRequest,
    activate_subscription,
    cancel_subscription,
    paypal_subscription_webhook,
    paypal_ipn,
)
from routes.payments_plans import (
    SEPAY_BANK_INFO,
    SEPAY_API_KEY,
    IS_PRODUCTION,
    PLAN_DURATION_DAYS,
    SepayInitiateRequest,
    _generate_sepay_reference,
    get_user_plan_info,
    get_all_plan_features,
    get_pricing_plans,
    upload_bank_payment,
    sepay_initiate,
    sepay_status,
    sepay_webhook,
)
from routes.payments_credits import (
    ManualCreditRequest,
    start_speaking_session,
    manual_credit_simple,
    manual_credit,
)

# Kept for backward compatibility with the original module-level global.
db = None


def set_db(database):
    """Fan the DB handle out to every payments sub-module (server.py mount)."""
    global db
    db = database
    _common.set_db(database)
    _paypal_orders.set_db(database)
    _subscriptions.set_db(database)
    _plans.set_db(database)
    _credits.set_db(database)
