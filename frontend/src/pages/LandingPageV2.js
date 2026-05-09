import React, { useRef } from 'react';
import {
  LandingNav,
  LandingHero,
  DualPathCards,
  SampleReportsStrip,
  Testimonials,
  HowItWorks,
  HeadToHead,
  PricingTeaser,
  FinalCTA,
  LandingFooter,
  MobileStickyCTA,
  useLiquidGlass,
} from '../features/landing';
import '../features/landing/landing.css';

/**
 * D1 Landing Page — implemented from Claude Design handoff bundle 53PGW3UEwj6Rm_lRB1jZ-w.
 * Scoped under .landing-scope so the design-system tokens don't leak into the
 * shared Tailwind theme. Mounted at /landing/v2 alongside the existing /
 * landing route for A/B comparison.
 */
export default function LandingPageV2() {
  const rootRef = useRef(null);
  useLiquidGlass(rootRef);

  return (
    <div ref={rootRef} className="landing-scope has-mobile-cta">
      <LandingNav />
      <LandingHero />
      <DualPathCards />
      <SampleReportsStrip />
      {/* Single testimonials section. Pulls live approved rows from
          /api/testimonials, falls back to seed examples until we have ≥3. */}
      <Testimonials />
      <HowItWorks />
      <HeadToHead />
      <PricingTeaser />
      <FinalCTA />
      <LandingFooter />
      <MobileStickyCTA />
    </div>
  );
}
