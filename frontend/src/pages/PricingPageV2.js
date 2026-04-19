import React, { useRef } from 'react';
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
} from '../features/pricing';
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
 * Tier structure: Free / Weekly $2.99/wk / Monthly $8.99/mo (popular) /
 * Exam Pack $14.99 once (30 days, no renewal). No human teacher commitments
 * — scalable features only (see project_pricing_backlog.md).
 */
export default function PricingPageV2({ user }) {
  const rootRef = useRef(null);
  useLiquidGlass(rootRef);

  return (
    <div ref={rootRef} className="pricing-scope">
      <PricingNav />
      <PricingHero />
      <DaySlider />
      <PlanCards user={user} />
      <CompareTable />
      {/* Social proof — wrapped in .landing-scope so the landing CSS tokens apply. */}
      <div className="landing-scope">
        <Testimonials />
      </div>
      <PaymentRow />
      <PricingFAQ />
      <PricingFinalBanner />
      <PricingFooter />
    </div>
  );
}
