import React, { useRef } from 'react';
import {
  LandingNav,
  LandingHero,
  DualPathCards,
  SampleReportsStrip,
  Testimonials,
  HowItWorks,
  PricingTeaser,
  FinalCTA,
  LandingFooter,
  MobileStickyCTA,
  useLiquidGlass,
} from '../features/landing';
import TestimonialWall from '../components/TestimonialWall';
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
      <Testimonials />
      {/* Live user-submitted testimonials (approved-only, DB-backed). Renders
          nothing while the queue is empty so the page stays tight. */}
      <TestimonialWall title="More student stories" />
      <HowItWorks />
      <PricingTeaser />
      <FinalCTA />
      <LandingFooter />
      <MobileStickyCTA />
    </div>
  );
}
