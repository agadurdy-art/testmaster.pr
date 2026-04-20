import React, { useState } from 'react';
import { useI18n } from '../../../lib/i18n';
import PlanCheckoutButton from './PlanCheckoutButton';

// Prices are keyed by currency so the toggle can swap both amount+unit display
// without touching layout. VND is rounded to friendly thousands (no cents).
// Display strings (tag/feats/cta/ribbon) come from i18n via the `key` — built
// inside the component so t() is available at render time.
const PLANS_STATIC = [
  {
    key: 'free',
    name: 'Free',
    tagKey: 'pricingV2PlanFreeTag',
    ctaKey: 'pricingV2PlanFreeCta',
    ctaCls: 'btn-outline',
    price: { USD: { amt: '0' }, VND: { amt: '0' } },
    sub: { USD: 'Always free. No card.', VND: 'Luôn miễn phí. Không cần thẻ.' },
    featKeys: [
      'pricingV2PlanFreeFeat1',
      'pricingV2PlanFreeFeat2',
      'pricingV2PlanFreeFeat3',
      'pricingV2PlanFreeFeat4',
    ],
    className: 'free',
  },
  {
    key: 'weekly',
    name: 'Weekly',
    tagKey: 'pricingV2PlanWeeklyTag',
    ctaKey: 'pricingV2PlanWeeklyCta',
    ctaCls: 'btn-outline',
    price: {
      USD: { amt: '2.99', unit: '/wk' },
      VND: { amt: '73.000', unit: '/tuần' },
    },
    sub: { USD: '≈ $0.43/day', VND: '≈ 10.000đ/ngày' },
    featKeys: [
      'pricingV2PlanWeeklyFeat1',
      'pricingV2PlanWeeklyFeat2',
      'pricingV2PlanWeeklyFeat3',
      'pricingV2PlanWeeklyFeat4',
    ],
    className: 'weekly',
  },
  {
    key: 'monthly',
    name: 'Monthly',
    tagKey: 'pricingV2PlanMonthlyTag',
    ctaKey: 'pricingV2PlanMonthlyCta',
    ctaCls: 'btn-primary',
    price: {
      USD: { amt: '8.99', unit: '/mo' },
      VND: { amt: '219.000', unit: '/tháng' },
    },
    sub: { USD: '≈ $0.30/day', VND: '≈ 7.300đ/ngày' },
    featKeys: [
      'pricingV2PlanMonthlyFeat1',
      'pricingV2PlanMonthlyFeat2',
      'pricingV2PlanMonthlyFeat3',
      'pricingV2PlanMonthlyFeat4',
      'pricingV2PlanMonthlyFeat5',
    ],
    className: 'popular',
    ribbonKey: 'pricingV2PlanMonthlyRibbon',
  },
  {
    key: 'exam',
    name: 'Exam Pack',
    tagKey: 'pricingV2PlanExamTag',
    ctaKey: 'pricingV2PlanExamCta',
    ctaCls: 'btn-dark',
    price: {
      USD: { amt: '14.99', unit: 'once' },
      VND: { amt: '365.000', unit: 'một lần' },
    },
    sub: { USD: '30 days · no renewal', VND: '30 ngày · không gia hạn' },
    featKeys: [
      'pricingV2PlanExamFeat1',
      'pricingV2PlanExamFeat2',
      'pricingV2PlanExamFeat3',
      'pricingV2PlanExamFeat4',
    ],
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
  const { t } = useI18n();
  return (
    <section>
      <div className="container">
        <div className="section-head center">
          <div className="section-eyebrow">{t('pricingV2PlansEyebrow')}</div>
          <h2 className="section-title">{t('pricingV2PlansTitle')}</h2>
          <p className="section-sub">
            {t('pricingV2PlansSub')}
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
          {PLANS_STATIC.map((p) => {
            const price = p.price[currency] || p.price.USD;
            const sub = p.sub[currency] || p.sub.USD;
            return (
              <div key={p.key} className={`plan ${p.className}`}>
                {p.ribbonKey && <div className="ribbon">{t(p.ribbonKey)}</div>}
                <div className="plan-name">{p.name}</div>
                <div className="plan-tag">{t(p.tagKey)}</div>
                <div className="plan-price">
                  <span className="cur">{CURRENCY_SYMBOL[currency]}</span>
                  <span className="amt">{price.amt}</span>
                  {price.unit && <span className="unit">{price.unit}</span>}
                </div>
                <div className="plan-price-sub">{sub}</div>
                <div className="plan-divider"></div>
                <ul className="plan-feats">
                  {p.featKeys.map((fk) => (
                    <li key={fk}>
                      <span className="fcheck">✓</span>
                      {t(fk)}
                    </li>
                  ))}
                </ul>
                <PlanCheckoutButton
                  planKey={p.key}
                  ctaLabel={t(p.ctaKey)}
                  ctaClass={p.ctaCls}
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
