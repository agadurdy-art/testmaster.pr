import React, { useState } from 'react';
import PlanCheckoutButton from './PlanCheckoutButton';

// Prices are keyed by currency so the toggle can swap both amount+unit display
// without touching layout. VND is rounded to friendly thousands (no cents).
const PLANS = [
  {
    key: 'free',
    name: 'Free',
    tag: 'Dip your toe. Forever.',
    price: { USD: { amt: '0' }, VND: { amt: '0' } },
    sub: { USD: 'Always free. No card.', VND: 'Luôn miễn phí. Không cần thẻ.' },
    feats: [
      '1 Writing evaluation / day',
      '1 Speaking evaluation / day',
      'Unlimited Reading & Listening',
      'Vietnamese translations',
    ],
    cta: { label: 'Start free', cls: 'btn-outline' },
    className: 'free',
  },
  {
    key: 'weekly',
    name: 'Weekly',
    tag: 'For the steady learner.',
    price: {
      USD: { amt: '2.99', unit: '/wk' },
      VND: { amt: '73.000', unit: '/tuần' },
    },
    sub: { USD: '≈ $0.43/day', VND: '≈ 10.000đ/ngày' },
    feats: [
      'Unlimited evaluations',
      'Progress charts & history',
      'Band rewrite on every essay',
      'Email reminders',
    ],
    cta: { label: 'Start weekly', cls: 'btn-outline' },
    className: 'weekly',
  },
  {
    key: 'monthly',
    name: 'Monthly',
    tag: 'Everything, including Liz.',
    price: {
      USD: { amt: '8.99', unit: '/mo' },
      VND: { amt: '219.000', unit: '/tháng' },
    },
    sub: { USD: '≈ $0.30/day', VND: '≈ 7.300đ/ngày' },
    feats: [
      'Everything in Weekly',
      'AI Tutor (Liz) unlimited',
      'Sample library & past papers',
      'Priority evaluation queue',
      'Teacher & student reports',
    ],
    cta: { label: 'Choose monthly', cls: 'btn-primary' },
    className: 'popular',
    ribbon: 'Most popular',
  },
  {
    key: 'exam',
    name: 'Exam Pack',
    tag: 'One-time. Test-day focus.',
    price: {
      USD: { amt: '14.99', unit: 'once' },
      VND: { amt: '365.000', unit: 'một lần' },
    },
    sub: { USD: '30 days · no renewal', VND: '30 ngày · không gia hạn' },
    feats: [
      '30 days unlimited access',
      'Full mock tests with timing',
      'All four skills covered',
      'Expires automatically',
    ],
    cta: { label: 'Buy exam pack', cls: 'btn-dark' },
    className: 'exam',
  },
];

const CURRENCY_SYMBOL = { USD: '$', VND: '₫' };

// Default to VND when the browser reports a Vietnamese locale — the bulk of
// our traffic is from HCMC. Users can still toggle.
function detectInitialCurrency() {
  if (typeof navigator === 'undefined') return 'USD';
  const lang = (navigator.language || '').toLowerCase();
  return lang.startsWith('vi') ? 'VND' : 'USD';
}

export default function PlanCards({ user }) {
  const [currency, setCurrency] = useState(detectInitialCurrency);
  return (
    <section>
      <div className="container">
        <div className="section-head center">
          <div className="section-eyebrow">Or choose a plan</div>
          <h2 className="section-title">Not racing a test? Pick a rhythm.</h2>
          <p className="section-sub">
            Four ways to use testmaster — from free daily practice to full-feature
            monthly coaching.
          </p>
          <div
            role="tablist"
            aria-label="Currency"
            style={{
              display: 'inline-flex',
              gap: 0,
              marginTop: 12,
              border: '1px solid rgba(0,0,0,0.12)',
              borderRadius: 999,
              overflow: 'hidden',
              background: 'rgba(255,255,255,0.6)',
              backdropFilter: 'blur(6px)',
            }}
          >
            {['USD', 'VND'].map((c) => {
              const active = currency === c;
              return (
                <button
                  key={c}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setCurrency(c)}
                  style={{
                    padding: '6px 16px',
                    fontSize: 13,
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    background: active ? '#111' : 'transparent',
                    color: active ? '#fff' : '#111',
                    transition: 'all .15s ease',
                  }}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>
        <div className="plans">
          {PLANS.map((p) => {
            const price = p.price[currency] || p.price.USD;
            const sub = p.sub[currency] || p.sub.USD;
            return (
              <div key={p.key} className={`plan ${p.className}`}>
                {p.ribbon && <div className="ribbon">{p.ribbon}</div>}
                <div className="plan-name">{p.name}</div>
                <div className="plan-tag">{p.tag}</div>
                <div className="plan-price">
                  <span className="cur">{CURRENCY_SYMBOL[currency]}</span>
                  <span className="amt">{price.amt}</span>
                  {price.unit && <span className="unit">{price.unit}</span>}
                </div>
                <div className="plan-price-sub">{sub}</div>
                <div className="plan-divider"></div>
                <ul className="plan-feats">
                  {p.feats.map((f) => (
                    <li key={f}>
                      <span className="fcheck">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <PlanCheckoutButton
                  planKey={p.key}
                  ctaLabel={p.cta.label}
                  ctaClass={p.cta.cls}
                  currency={currency}
                  user={user}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
