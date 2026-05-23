import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  PricingNav,
  PricingHero,
  DaySlider,
  PlanCards,
  CompareTable,
  PaymentRow,
  PricingFAQ,
  PricingFinalBanner,
  PricingFooter,
  useLiquidGlass,
  usePricingSlider,
} from '../features/pricing';
import { consumePendingCustomMeta } from '../lib/pendingPlan';
import '../features/pricing/pricing.css';
// Testimonials live in the landing feature (styles keyed to .landing-scope);
// we wrap them in a minimal landing-scope container below so the shared
// social-proof treatment renders correctly on the Pricing page too.
import { Testimonials } from '../features/landing';
import '../features/landing/landing.css';

/**
 * D4 Pricing Page — implemented from Claude Design handoff bundle
 * U4GSHTG7kba-c5YQ_mQAkA (Pricing.html, v1 refined per chat7).
 *
 * Scoped under .pricing-scope so the design-system tokens don't leak into
 * the shared Tailwind theme. Mounted at /pricing/v2.
 *
 * Tier structure (locked 2026-05-08): Free $0 (5L/1W/1S) / Weekly $2.99/wk
 * (20/3/2) / Monthly $9.99/mo popular (100/10/10) / Exam Pack $19.99 once
 * (30 days · 200/25/15) / Custom slider (3 pools, expires_at). No human
 * teacher commitments — scalable features only (see project_pricing_backlog.md).
 */
export default function PricingPageV2({ user }) {
  const rootRef = useRef(null);
  useLiquidGlass(rootRef);
  const location = useLocation();
  // Lifted so PricingHero + DaySlider share the same `days` value — the hero's
  // "Your exam is in N days" copy tracks the slider in real time.
  const slider = usePricingSlider(30);

  // Resume Custom selection: post-signup redirect lands here with
  // ?plan=custom&days=N&price=X (or only the localStorage meta if URL was
  // stripped). Prime the slider so the user sees their original choice and
  // can confirm with the inline PayPal button.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const plan = (params.get('plan') || '').toLowerCase();
    if (plan !== 'custom') return;
    let days = parseInt(params.get('days') || '', 10);
    if (!days) {
      const meta = consumePendingCustomMeta();
      if (meta && meta.days) days = parseInt(meta.days, 10);
    }
    if (days && days >= slider.MIN_DAYS && days <= slider.MAX_DAYS) {
      slider.setDays(days);
    }
    // Scroll to the slider so the user immediately sees the resumed selection.
    const el = document.getElementById('custom');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  return (
    <div ref={rootRef} className="pricing-scope">
      <PricingNav />
      <PricingHero days={slider.days} />
      <DaySlider slider={slider} user={user} />
      <PlanCards user={user} />
      <CompareTable />
      {/* Testimonials hidden 2026-05-23 until we have real student quotes —
          Aga: "gercek testimonials yok kaldir simdilik". The Testimonials
          component + .landing-scope wrapper stay imported so we can restore
          this block once we collect real social proof. */}
      {/* <div className="landing-scope"><Testimonials /></div> */}
      <PaymentRow />
      <PricingFAQ />
      <PricingFinalBanner />
      <PricingFooter />
    </div>
  );
}
