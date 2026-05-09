import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { resolvePostCheckoutDestination } from '../../../lib/upgradeFlow';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const paypalClientId = process.env.REACT_APP_PAYPAL_CLIENT_ID;

// Plan key -> PayPal subscription plan ID. Sourced from Vercel env so we
// don't ship stale IDs after a PayPal account swap (mirrors the backend
// PAYPAL_*_PLAN_ID env vars in payments.py). Free and Exam aren't
// subscriptions — Exam goes through the one-time Orders API instead.
//
// If an env var is missing we treat that plan as "needs signup" and route
// the user to /signup with plan info in the query string, so a half-set
// configuration never renders a broken PayPal button.
const PAYPAL_SUBSCRIPTION_IDS = {
  weekly: process.env.REACT_APP_PAYPAL_WEEKLY_PLAN_ID || '',
  monthly: process.env.REACT_APP_PAYPAL_MONTHLY_PLAN_ID || '',
};

/**
 * Plan CTA on the IELTS pricing page.
 *
 * Logged-out users -> link to /signup?plan= so the onboarding flow knows
 * which plan they picked and can push them to checkout after signup.
 *
 * Logged-in users:
 *   weekly/monthly -> PayPal subscription button (createSubscription)
 *   exam           -> PayPal one-time order button (createOrder)
 *   free           -> straight to /dashboard
 */
export default function PlanCheckoutButton({
  planKey,
  ctaLabel,
  ctaClass,
  currency,
  user,
}) {
  const navigate = useNavigate();
  // Not logged in or PayPal SDK missing -> signup link (current behavior).
  const needsSignup = !user || !paypalClientId;
  if (planKey === 'free') {
    const href = user ? '/dashboard' : `/signup?plan=free&currency=${currency}`;
    return (
      <a href={href} className={`btn ${ctaClass} btn-lg btn-block plan-cta`}>
        {ctaLabel}
      </a>
    );
  }
  if (needsSignup) {
    return (
      <a
        href={`/signup?plan=${planKey}&currency=${currency}`}
        className={`btn ${ctaClass} btn-lg btn-block plan-cta`}
      >
        {ctaLabel}
      </a>
    );
  }
  // ----- logged-in, PayPal available -----
  if (planKey === 'exam') {
    return (
      <div className="plan-paypal-wrap" style={{ width: '100%' }}>
        <PayPalButtons
          style={{ layout: 'vertical', color: 'gold', shape: 'pill', label: 'pay', height: 40 }}
          fundingSource={undefined}
          createOrder={async () => {
            const res = await fetch(`${API_URL}/api/payments/paypal/create-order`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ planId: 'exam', email: user.email }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || 'Failed to create order');
            return data.orderId;
          }}
          onApprove={async (data) => {
            const res = await fetch(`${API_URL}/api/payments/paypal/capture-order`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: data.orderID, planId: 'exam', email: user.email,
              }),
            });
            const result = await res.json();
            if (res.ok) {
              const updatedUser = { ...user, plan: result.plan, subscription: result.subscription };
              localStorage.setItem('user', JSON.stringify(updatedUser));
              alert('Exam Pack activated. 30 days · 200 Liz · 25 essays · 15 speaking.');
              window.location.href = resolvePostCheckoutDestination();
            } else {
              alert(result.detail || 'Payment capture failed');
            }
          }}
        />
        <BankTransferAlt planKey={planKey} currency={currency} navigate={navigate} />
      </div>
    );
  }
  // weekly / monthly -> subscription
  const planId = PAYPAL_SUBSCRIPTION_IDS[planKey];
  if (!planId) {
    return (
      <a
        href={`/signup?plan=${planKey}&currency=${currency}`}
        className={`btn ${ctaClass} btn-lg btn-block plan-cta`}
      >
        {ctaLabel}
      </a>
    );
  }
  return (
    <div className="plan-paypal-wrap" style={{ width: '100%' }}>
      <PayPalButtons
        style={{ layout: 'vertical', color: 'gold', shape: 'pill', label: 'subscribe', height: 40 }}
        createSubscription={(_data, actions) =>
          actions.subscription.create({ plan_id: planId })
        }
        onApprove={async (data) => {
          const res = await fetch(`${API_URL}/api/payments/paypal/activate-subscription`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              subscriptionId: data.subscriptionID,
              planId: planKey,
              email: user.email,
            }),
          });
          const result = await res.json();
          if (res.ok) {
            const updatedUser = { ...user, plan: result.plan, subscription: result.subscription };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            alert(`${result.subscription} plan activated.`);
            window.location.href = resolvePostCheckoutDestination();
          } else {
            alert(result.detail || 'Activation failed');
          }
        }}
      />
      <BankTransferAlt planKey={planKey} currency={currency} navigate={navigate} />
    </div>
  );
}

// Secondary CTA rendered under every PayPal button: funnels VN users who
// prefer local bank transfer into the SePay flow. Shown only when the viewer
// is on VND pricing (local customers) — USD viewers see PayPal only to avoid
// confusing bank-transfer options for non-VN users.
function BankTransferAlt({ planKey, currency, navigate }) {
  if (currency !== 'VND') return null;
  return (
    <button
      type="button"
      onClick={() => navigate(`/checkout/bank/${planKey}`)}
      style={{
        marginTop: 10,
        width: '100%',
        padding: '10px 14px',
        background: '#fff',
        color: '#111',
        border: '1px solid #e5e7eb',
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
      }}
    >
      Chuyển khoản ngân hàng (VietQR)
    </button>
  );
}
