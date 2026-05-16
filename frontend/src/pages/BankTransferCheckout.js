import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { initiateSepayPayment, getSepayStatus } from '../lib/api';

/**
 * SePay bank-transfer checkout.
 *
 * Flow:
 *   1. POST /payments/sepay/initiate -> receive reference code + bank info.
 *   2. Render instructions + VietQR code (SePay's qr.sepay.vn image service
 *      encodes bank + account + amount + memo into a scannable QR).
 *   3. Poll GET /payments/sepay/status/{ref} every 6s while open.
 *   4. When status flips to 'completed' (SePay webhook matched the bank
 *      transfer to our reference code), redirect to /dashboard.
 *
 * Route: /checkout/bank/:plan
 *   V2 IELTS plans: weekly | monthly | exam
 *   V1 GE legacy plans: explorer | learner | achiever | master
 *   (backend SePay /initiate + webhook accept both — see PLAN_DURATION_DAYS
 *   in routes/payments.py)
 */

const PLAN_LABELS = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  exam: 'Exam Pack',
  // V1 GE legacy — kept so PricingPage (GE) routes here instead of the
  // old self-managed bank-upload flow.
  explorer: 'Explorer',
  learner: 'Learner',
  achiever: 'Achiever',
  master: 'Master',
};

// Map MB Bank (full name) to SePay's VietQR bank code.
// qr.sepay.vn accepts the short bank code — "MB" for MB Bank.
const BANK_QR_CODE = {
  'MB Bank': 'MB',
  'Vietcombank': 'VCB',
  'Techcombank': 'TCB',
  'VPBank': 'VPB',
  'ACB': 'ACB',
  'BIDV': 'BIDV',
};

function formatVnd(amount) {
  const n = typeof amount === 'string' ? parseInt(amount, 10) : amount;
  if (!n || Number.isNaN(n)) return '0 ₫';
  return `${n.toLocaleString('vi-VN')} ₫`;
}

export default function BankTransferCheckout({ user }) {
  const { plan } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('pending');
  const [copied, setCopied] = useState(null);
  // Bumped by restart() to re-mint a reference code when the previous
  // session expired (or failed). Both effects depend on it.
  const [nonce, setNonce] = useState(0);
  const pollRef = useRef(null);

  const restart = () => {
    setSession(null);
    setError(null);
    setStatus('pending');
    setNonce((n) => n + 1);
  };

  // Guard: unknown plan keys bounce back to pricing.
  if (!PLAN_LABELS[plan]) {
    return <Navigate to="/pricing" replace />;
  }
  // Guard: must be logged in (reference code ties to user.id).
  if (!user) {
    return <Navigate to={`/signup?plan=${plan}`} replace />;
  }

  // Step 1: mint a reference code on mount. Only runs once per plan.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await initiateSepayPayment({
          planId: plan,
          email: user.email,
          currency: 'VND',
        });
        if (!cancelled) setSession(data);
      } catch (e) {
        if (!cancelled) setError(e?.response?.data?.detail || 'Failed to create payment');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [plan, user.email, nonce]);

  // Step 3: poll status every 6 seconds. Stops when completed/expired.
  useEffect(() => {
    if (!session?.reference_code || status !== 'pending') return;
    const tick = async () => {
      try {
        const s = await getSepayStatus(session.reference_code);
        setStatus(s.status);
        if (s.status === 'completed') {
          // Refresh user in localStorage so the dashboard shows the new plan.
          const stored = JSON.parse(localStorage.getItem('user') || 'null');
          if (stored) {
            localStorage.setItem(
              'user',
              JSON.stringify({ ...stored, plan: s.plan_id || plan })
            );
          }
          setTimeout(() => navigate('/dashboard'), 1200);
        }
      } catch (_) {
        /* transient poll errors are fine — next tick will retry */
      }
    };
    pollRef.current = setInterval(tick, 6000);
    return () => clearInterval(pollRef.current);
  }, [session?.reference_code, status, plan, navigate]);

  const handleCopy = (key, value) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    });
  };

  // ----- Render states -----

  if (error) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <h2 style={{ margin: 0, color: '#dc2626' }}>Payment setup failed</h2>
          <p style={{ color: '#4b5563', fontSize: 14 }}>{error}</p>
          <button style={primaryBtn} onClick={() => navigate('/pricing')}>
            Back to pricing
          </button>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <p style={{ color: '#6b7280', fontSize: 14 }}>Preparing your payment...</p>
        </div>
      </div>
    );
  }

  // Codex audit P0 (#98): bail out of the QR render if the bank info is
  // missing or the bank name is unknown to our VietQR mapping. Previously
  // the page silently fell back to 'MB' + an empty account number, which
  // produced a scannable-looking QR pointing to nowhere — users would scan,
  // get a bank-app error, and have no recourse. Backend /initiate now
  // returns 503 when env is incomplete (caught in setError); this is the
  // belt to that suspender in case bank_info comes back partial.
  const bankName = session.bank_info?.bank_name;
  const accountNumber = session.bank_info?.account_number;
  if (!bankName || !accountNumber || !BANK_QR_CODE[bankName]) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <h2 style={{ margin: 0, color: '#dc2626' }}>Bank transfer unavailable</h2>
          <p style={{ color: '#4b5563', fontSize: 14 }}>
            We can't generate a QR code right now. Please try PayPal or contact support.
          </p>
          <button style={primaryBtn} onClick={() => navigate('/pricing')}>
            Back to pricing
          </button>
        </div>
      </div>
    );
  }
  const bankCode = BANK_QR_CODE[bankName];
  const qrUrl =
    `https://qr.sepay.vn/img` +
    `?bank=${bankCode}` +
    `&acc=${accountNumber}` +
    `&amount=${session.amount_vnd}` +
    `&des=${encodeURIComponent(session.reference_code)}`;

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={{ fontSize: 13, color: '#6366f1', fontWeight: 600, marginBottom: 4 }}>
          {PLAN_LABELS[plan]} · Bank transfer
        </div>
        <h1 style={{ margin: '0 0 4px', fontSize: 24, lineHeight: 1.25 }}>
          Pay {formatVnd(session.amount_vnd)}
        </h1>
        <p style={{ color: '#6b7280', fontSize: 13, margin: '0 0 20px' }}>
          Scan with any Vietnamese banking app, or copy the details below.
          Your plan activates within ~10 seconds of transfer.
        </p>

        {status === 'completed' ? (
          <div style={bannerOk}>
            ✓ Payment received. Activating your plan...
          </div>
        ) : status === 'expired' || status === 'failed' ? (
          // Codex sweep #2 / #7: backend flips status to 'expired' after the
          // pending_payment window closes (see /payments/sepay/status). Before
          // this branch existed, the polling loop would stop on a non-pending
          // status but the UI kept showing the now-stale QR + "Waiting for
          // your transfer..." spinner forever.
          <div style={bannerExpired}>
            <strong style={{ fontSize: 15 }}>
              {status === 'expired' ? 'This transfer window expired' : 'Payment failed'}
            </strong>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: '#7c2d12' }}>
              The old reference code is no longer valid. Start a new transfer
              to get a fresh QR.
            </p>
            <button
              type="button"
              style={{ ...primaryBtn, marginTop: 14 }}
              onClick={restart}
            >
              Start new transfer
            </button>
          </div>
        ) : (
          <>
            <div style={qrWrap}>
              <img
                src={qrUrl}
                alt="VietQR payment code"
                style={{ width: 240, height: 240, display: 'block' }}
              />
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>
                VietQR · MoMo · ZaloPay · Any VN banking app
              </div>
            </div>

            <div style={detailsWrap}>
              <DetailRow
                label="Bank"
                value={session.bank_info?.bank_name || '—'}
                copyKey={null}
                copied={copied}
                onCopy={handleCopy}
              />
              <DetailRow
                label="Account number"
                value={session.bank_info?.account_number || '—'}
                copyKey="acc"
                copied={copied}
                onCopy={handleCopy}
              />
              <DetailRow
                label="Account holder"
                value={session.bank_info?.account_holder || '—'}
                copyKey={null}
                copied={copied}
                onCopy={handleCopy}
              />
              <DetailRow
                label="Amount"
                value={formatVnd(session.amount_vnd)}
                copyKey="amt"
                copyValue={String(session.amount_vnd)}
                copied={copied}
                onCopy={handleCopy}
              />
              <DetailRow
                label="Reference code"
                value={session.reference_code}
                copyKey="ref"
                copied={copied}
                onCopy={handleCopy}
                highlight
              />
            </div>

            <div style={warnBox}>
              <strong>Important:</strong> include{' '}
              <code style={{ background: '#fff', padding: '1px 6px', borderRadius: 4 }}>
                {session.reference_code}
              </code>{' '}
              in the transfer memo/note. Without it we cannot match your payment.
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16 }}>
              <div style={spinner} />
              <span style={{ fontSize: 13, color: '#6b7280' }}>
                Waiting for your transfer...
              </span>
            </div>
          </>
        )}

        <button
          style={{ ...secondaryBtn, marginTop: 20 }}
          onClick={() => navigate('/pricing')}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function DetailRow({ label, value, copyKey, copyValue, copied, onCopy, highlight }) {
  const canCopy = Boolean(copyKey);
  const display = copyValue || value;
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 0',
        borderBottom: '1px solid #f3f4f6',
      }}
    >
      <span style={{ fontSize: 12, color: '#6b7280' }}>{label}</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <code
          style={{
            fontSize: highlight ? 14 : 13,
            fontWeight: highlight ? 700 : 500,
            color: highlight ? '#111' : '#374151',
            background: highlight ? '#fef3c7' : 'transparent',
            padding: highlight ? '2px 8px' : 0,
            borderRadius: 4,
          }}
        >
          {value}
        </code>
        {canCopy && (
          <button
            type="button"
            style={copyBtn}
            onClick={() => onCopy(copyKey, display)}
          >
            {copied === copyKey ? '✓' : 'Copy'}
          </button>
        )}
      </span>
    </div>
  );
}

// ----- Styles -----

const pageStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(180deg, #f9fafb 0%, #eef2ff 100%)',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  padding: '40px 16px',
};

const cardStyle = {
  background: '#fff',
  borderRadius: 20,
  padding: 32,
  maxWidth: 460,
  width: '100%',
  boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
  color: '#111',
};

const qrWrap = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: 16,
  background: '#fafafa',
  borderRadius: 14,
  marginBottom: 16,
};

const detailsWrap = {
  border: '1px solid #f3f4f6',
  borderRadius: 10,
  padding: '0 14px',
};

const warnBox = {
  marginTop: 14,
  background: '#fffbeb',
  border: '1px solid #fde68a',
  color: '#92400e',
  borderRadius: 10,
  padding: 12,
  fontSize: 13,
  lineHeight: 1.45,
};

const bannerOk = {
  background: '#d1fae5',
  border: '1px solid #6ee7b7',
  color: '#065f46',
  padding: 16,
  borderRadius: 12,
  fontWeight: 600,
  textAlign: 'center',
};

const bannerExpired = {
  background: '#fef2f2',
  border: '1px solid #fecaca',
  color: '#991b1b',
  padding: 16,
  borderRadius: 12,
  textAlign: 'center',
};

const copyBtn = {
  fontSize: 11,
  padding: '3px 10px',
  border: '1px solid #e5e7eb',
  borderRadius: 6,
  background: '#fff',
  cursor: 'pointer',
  color: '#111',
  fontWeight: 500,
};

const primaryBtn = {
  width: '100%',
  padding: '12px 16px',
  background: '#111',
  color: '#fff',
  border: 'none',
  borderRadius: 10,
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
  marginTop: 12,
};

const secondaryBtn = {
  width: '100%',
  padding: '10px 16px',
  background: '#fff',
  color: '#111',
  border: '1px solid #e5e7eb',
  borderRadius: 10,
  fontSize: 13,
  fontWeight: 500,
  cursor: 'pointer',
};

const spinner = {
  width: 14,
  height: 14,
  border: '2px solid #e5e7eb',
  borderTopColor: '#6366f1',
  borderRadius: '50%',
  animation: 'tm-spin 0.8s linear infinite',
};

// Inject keyframes once.
if (typeof document !== 'undefined' && !document.getElementById('tm-spinner-kf')) {
  const style = document.createElement('style');
  style.id = 'tm-spinner-kf';
  style.innerHTML = '@keyframes tm-spin{to{transform:rotate(360deg)}}';
  document.head.appendChild(style);
}
