import React, { useRef, useEffect } from 'react';
import {
  LandingNav,
  LandingHeroDemo,
  HowItWorks,
  HeadToHead,
  PricingTeaserDemo,
  FinalCTA,
  LandingFooter,
  MobileStickyCTA,
  MeetLiz,
  TrustBlock,
  LizLauncher,
  useLiquidGlass,
} from '../features/landing';
import '../features/landing/landing.css';
import '../features/landing/landing-demo.css';

/**
 * Demo landing — iteration sandbox mounted at /landing/demo alongside the live
 * landing at / (LandingPageV2). Differences from live:
 *   • Pre-signup PathPickerGate asks for IELTS vs General English.
 *   • Hero uses a 4-tab skill switcher (Writing / Speaking / Reading / Listening)
 *     with a Liz chip showing cycling coach messages.
 *   • Sample reports surface as compact chips inside the Writing tab only.
 *   • A Meet Liz section explains her three roles (evaluator / partner / companion).
 *   • A sticky Liz launcher sits bottom-right with quick actions.
 *   • Testimonial wall and long testimonial section omitted for a lighter feel.
 *
 * The .landing-demo class opt-in layer activates styles in landing-demo.css
 * without touching the live landing.
 */
export default function LandingPageDemo({ user, setUser }) {
  const rootRef = useRef(null);
  useLiquidGlass(rootRef);

  // The landing is now the IELTS landing directly — no path-picker modal
  // interrupting visitors (Aga 2026-06-21; GE gets its own entry later). Default
  // the onboarding path hint to IELTS so signup/onboarding follow the same track.
  useEffect(() => {
    try { localStorage.setItem('testmaster_onboarding_path', 'ielts'); } catch (_) { /* non-fatal */ }
  }, []);

  return (
    <div ref={rootRef} className="landing-scope landing-demo has-mobile-cta">
      <LandingNav />
      <LandingHeroDemo />
      <TrustBlock />
      <MeetLiz />
      <HowItWorks />
      <HeadToHead />
      <PricingTeaserDemo />
      <FinalCTA />
      <LandingFooter />
      <MobileStickyCTA />
      <LizLauncher />
    </div>
  );
}
