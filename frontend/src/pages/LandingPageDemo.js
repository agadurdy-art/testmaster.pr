import React, { useRef } from 'react';
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
  PathPickerGate,
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
export default function LandingPageDemo() {
  const rootRef = useRef(null);
  useLiquidGlass(rootRef);

  return (
    <PathPickerGate>
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
    </PathPickerGate>
  );
}
