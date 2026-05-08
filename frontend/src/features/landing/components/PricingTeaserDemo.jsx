import React from 'react';
import ArrowRightIcon from './ArrowRightIcon';

/**
 * PricingTeaserDemo — 4-plan teaser matching the live PricingPageV2 tiers
 * (Free / Weekly / Monthly / Exam Pack). Kept separate from the live
 * PricingTeaser so the demo can iterate without touching LandingPageV2.
 *
 * Prices mirror src/features/pricing/components/PlanCards.jsx — update there
 * first if tiers change, then reflect here.
 */

const PLANS = [
  {
    key: 'free',
    name: 'Free',
    price: '$0',
    unit: '',
    tag: 'Try Liz',
    feats: ['Limited evaluations', 'Liz preview (5 messages)'],
    href: '/signup',
    ctaLabel: 'Start free',
    ctaClass: 'btn btn-outline',
  },
  {
    key: 'weekly',
    name: 'Weekly',
    price: '$2.99',
    unit: '/ week',
    tag: 'Short sprint',
    feats: ['Unlimited writing + speaking', '20 Liz messages / week', 'Courses + progress'],
    href: '/signup?plan=weekly',
    ctaLabel: 'Choose Weekly',
    ctaClass: 'btn btn-outline',
  },
  {
    key: 'monthly',
    name: 'Monthly',
    price: '$8.99',
    unit: '/ month',
    tag: 'Most popular',
    feats: ['Everything in Weekly', '100 Liz messages / month', 'Priority AI queue'],
    href: '/signup?plan=monthly',
    ctaLabel: 'Choose Monthly',
    ctaClass: 'btn btn-primary',
    popular: true,
  },
  {
    key: 'exam',
    name: 'Exam Pack',
    price: '$14.99',
    unit: 'once',
    tag: '30 days',
    feats: ['One-time payment', '30 days · 200 Liz messages', 'No renewal'],
    href: '/signup?plan=exam',
    ctaLabel: 'Get Exam Pack',
    ctaClass: 'btn btn-outline',
  },
];

export default function PricingTeaserDemo() {
  return (
    <section id="pricing" className="pricing-teaser-demo">
      <div className="container">
        <div className="section-head">
          <div className="section-eyebrow">Pricing</div>
          <h2 className="section-title">Pick a plan that fits your timeline.</h2>
          <p className="section-sub">
            Start free. Upgrade when you want Liz full access and unlimited evaluations.
          </p>
        </div>
        <div className="pt-demo-grid">
          {PLANS.map((p) => (
            <div key={p.key} className={`pt-demo-card ${p.popular ? 'is-popular' : ''}`}>
              {p.popular && <div className="pt-demo-ribbon">{p.tag}</div>}
              {!p.popular && <div className="pt-demo-tag">{p.tag}</div>}
              <div className="pt-demo-name">{p.name}</div>
              <div className="pt-demo-price">
                <span className="pt-demo-amt">{p.price}</span>
                {p.unit && <span className="pt-demo-unit">{p.unit}</span>}
              </div>
              <ul className="pt-demo-feats">
                {p.feats.map((f) => (
                  <li key={f}><span className="fcheck">✓</span>{f}</li>
                ))}
              </ul>
              <a href={p.href} className={p.ctaClass}>
                {p.ctaLabel}
                <ArrowRightIcon size={14} />
              </a>
            </div>
          ))}
        </div>
        <div className="pt-demo-footer">
          <a href="/pricing#compare" className="btn btn-ghost">
            Compare prices
            <ArrowRightIcon size={14} />
          </a>
          <a href="/pricing#custom" className="btn btn-ghost">
            Custom
            <ArrowRightIcon size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}
