// PUBLIC + MARKETING routes (Faz 1 refactor, 2026-07-03 — extracted VERBATIM
// from App.js). Landing pages, auth entries, legal, pricing, lead magnets,
// sample reports, demo/sandbox surfaces and dev-only routes.
// Product tag: PUBLIC (mixed-brand marketing; /landing/ge + /pricing/ge are
// the GE-branded marketing surfaces — they move with GE at repo-split time).

import React, { lazy } from 'react';
import { Route, Navigate, useLocation } from 'react-router-dom';

import LandingPage from '../../pages/LandingPage';
import {
  stashPendingPlan, consumePendingPlan, pendingPlanRedirect,
  stashPendingIntent, consumePendingIntent, pendingIntentRedirect,
  stashPendingCustomMeta,
} from '../../lib/pendingPlan';
import { homePath, normalizeProduct } from '../../lib/learningMode';

const LoginPage = lazy(() => import('../../pages/LoginPage'));
const StartLanding = lazy(() => import('../../pages/StartLanding'));
const PrivacyPage = lazy(() => import('../../pages/PrivacyPage'));
const TermsPage = lazy(() => import('../../pages/TermsPage'));
const ContactPage = lazy(() => import('../../pages/ContactPage'));
const StatusPage = lazy(() => import('../../pages/StatusPage'));
const AboutPage = lazy(() => import('../../pages/AboutPage'));
const VerifyEmailPage = lazy(() => import('../../pages/VerifyEmailPage'));
const ResetPasswordPage = lazy(() => import('../../pages/ResetPasswordPage'));
const ShareYourStoryPage = lazy(() => import('../../pages/ShareYourStoryPage'));
const PricingPage = lazy(() => import('../../pages/PricingPage'));
const PricingPageV2 = lazy(() => import('../../pages/PricingPageV2'));
const LandingPageV2 = lazy(() => import('../../pages/LandingPageV2'));
const LandingPageGE = lazy(() => import('../../pages/LandingPageGE'));
const LandingPageDemo = lazy(() => import('../../pages/LandingPageDemo'));
const EvaluatorResultPreview = lazy(() => import('../../pages/EvaluatorResultPreview'));
const DevGePreview = lazy(() => import('../../pages/DevGePreview'));
const SampleReportBand65Task2 = lazy(() => import('../../pages/SampleReportBand65Task2'));
const SampleReportBand80Task2 = lazy(() => import('../../pages/SampleReportBand80Task2'));
const SampleReportBand50Task2 = lazy(() => import('../../pages/SampleReportBand50Task2'));
const SampleReportSpeakingPart2 = lazy(() => import('../../pages/SampleReportSpeakingPart2'));
const PublicEssayEvaluator = lazy(() => import('../../pages/PublicEssayEvaluator'));
const AnonEvalReportPage = lazy(() => import('../../pages/AnonEvalReportPage'));
const PublicSpeakingTrial = lazy(() => import('../../pages/PublicSpeakingTrial'));
const LessonPreview = lazy(() => import('../../pages/LessonPreview'));
const FeatureShowcase = lazy(() => import('../../pages/FeatureShowcase'));
const WritingTask1Practice = lazy(() => import('../../pages/WritingTask1Practice'));
const WritingTask2Practice = lazy(() => import('../../pages/WritingTask2Practice'));
const GeneralTask1Practice = lazy(() => import('../../pages/GeneralTask1Practice'));
const GeneralTask2Practice = lazy(() => import('../../pages/GeneralTask2Practice'));

// Landing CTAs point here with `?path=ielts|general`. We stash the choice in
// localStorage so the onboarding hook can pre-select Step 1 after signup, then
// redirect to `/login?action=signup` (or `/onboarding` if the user is already
// authenticated — they got linked a signup URL in error, just skip ahead).
//
// Pricing CTAs point here with `?plan=weekly|monthly|exam|free`. We stash the
// plan so that after signup/onboarding completes we can bounce the user back
// to /pricing (paid plans) where their chosen tier is ready to check out, or
// /dashboard (free) — without losing the conversion.
function SignupBridge({ user }) {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const path = (params.get('path') || '').trim().toLowerCase();
  const plan = (params.get('plan') || '').trim().toLowerCase();
  const intent = (params.get('intent') || '').trim().toLowerCase();
  // Canonicalize product intent so every downstream reader (login brand,
  // onboarding start step) agrees. Store the normalized slug, not the raw param.
  const product = normalizeProduct(path);
  if (product) {
    try {
      window.localStorage.setItem('testmaster_onboarding_path', product);
    } catch (_) {
      // non-fatal — user will re-select on step 1
    }
  }
  stashPendingPlan(plan);
  stashPendingIntent(intent);
  // Custom slider: capture price + days too so post-signup we can re-prime
  // the slider to the user's pre-auth selection.
  if (plan === 'custom') {
    const price = (params.get('price') || '').trim();
    const days = (params.get('days') || '').trim();
    if (price && days) stashPendingCustomMeta(price, parseInt(days, 10));
  }
  if (user) {
    // Already logged in — honor the pending plan / intent immediately.
    // Treat users with an explicit learning_mode as already-onboarded so
    // legacy accounts (mode set, onboarding_complete=false) don't loop.
    const mode = (user.learning_mode || '').toLowerCase();
    const hasMode = mode === 'ielts' || mode === 'general_english' || mode === 'both';
    if (!user.onboarding_complete && !hasMode) {
      return <Navigate to="/onboarding" replace />;
    }
    const pendingPlan = consumePendingPlan();
    const planTarget = pendingPlanRedirect(pendingPlan);
    if (planTarget) return <Navigate to={planTarget} replace />;
    const intentTarget = pendingIntentRedirect(consumePendingIntent());
    return <Navigate to={intentTarget || homePath(user)} replace />;
  }
  // Logged-out: bounce to the auth page but PRESERVE the product intent in the
  // URL so login branding + post-signup onboarding pick the right product even
  // if the localStorage hint is stale/cleared.
  const loginQuery = product ? `/login?action=signup&path=${product}` : '/login?action=signup';
  return <Navigate to={loginQuery} replace />;
}

export function publicRoutes({ user, setUser, handleLogin }) {
  return (
    <>
      <Route path="/" element={<LandingPageDemo user={user} setUser={setUser} />} />
      <Route path="/landing/v1" element={<LandingPage onLogin={handleLogin} user={user} />} />
      <Route path="/login" element={<LoginPage user={user} onLogin={handleLogin} />} />
      <Route path="/start" element={<StartLanding user={user} onLogin={handleLogin} />} />
      <Route path="/signup" element={<SignupBridge user={user} />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/status" element={<StatusPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/share-your-story" element={<ShareYourStoryPage user={user} />} />
      <Route
        path="/pricing"
        element={<PricingPageV2 user={user} />}
      />
      {/* Legacy General English pricing (Explorer/Learner/Achiever/Master)
         kept accessible for existing GE customers who still need it, but
         no longer the default — every upgrade prompt routes to /pricing. */}
      <Route
        path="/pricing/ge"
        element={<PricingPage user={user} />}
      />
      <Route path="/pricing/v1" element={<PricingPage user={user} />} />
      {/* Codex audit P0 (#96): gate /dev/* routes to non-production
          builds. /dev/ge bypasses both auth and onboarding, /dev/evaluator-result
          renders raw evaluator output — neither belongs in the prod bundle.
          React-Router treats nulls as no-route, so prod requests fall through
          to the 404 catch-all. */}
      {process.env.NODE_ENV !== 'production' && (
        <>
          <Route
            path="/dev/evaluator-result"
            element={<EvaluatorResultPreview />}
          />
          <Route path="/dev/ge" element={<DevGePreview />} />
        </>
      )}
      {/* Writing/Speaking sample report pages — re-enabled 2026-05-10.
          Reading/Listening have static HTML "full report" pages, so writing
          and speaking need the same surface (parity for switcher CTAs and
          PublicNav cross-nav). Specific slugs render their report; unknown
          slugs fall back to the canonical band-6.5 sample. */}
      <Route path="/samples/writing/band-6-5-task2" element={<SampleReportBand65Task2 />} />
      <Route path="/samples/writing/band-8-0-task2" element={<SampleReportBand80Task2 />} />
      <Route path="/samples/writing/band-5-0-task2" element={<SampleReportBand50Task2 />} />
      <Route path="/samples/writing" element={<Navigate to="/samples/writing/band-6-5-task2" replace />} />
      <Route path="/samples/writing/:slug" element={<Navigate to="/samples/writing/band-6-5-task2" replace />} />
      <Route path="/samples/speaking/band-6-5-part2" element={<SampleReportSpeakingPart2 />} />
      <Route path="/samples/speaking/:slug" element={<Navigate to="/samples/speaking/band-6-5-part2" replace />} />
      <Route path="/score-my-essay" element={<PublicEssayEvaluator />} />
      <Route path="/r/:token" element={<AnonEvalReportPage />} />
      <Route path="/score-my-speaking" element={<PublicSpeakingTrial />} />
      <Route path="/landing/v2" element={<LandingPageV2 />} />
      <Route path="/landing/ge" element={<LandingPageGE />} />
      <Route path="/landing/demo" element={<LandingPageDemo user={user} setUser={setUser} />} />
      <Route path="/pricing/v2" element={<PricingPageV2 user={user} />} />
      <Route
        path="/lesson-preview/:courseType/:lessonId"
        element={<LessonPreview />}
      />
      <Route
        path="/feature-showcase"
        element={<FeatureShowcase />}
      />
      <Route
        path="/demo/writing-task1"
        element={<WritingTask1Practice user={{id: 'demo', name: 'Demo User', email: 'demo@test.com'}} />}
      />
      <Route
        path="/demo/writing-task2"
        element={<WritingTask2Practice user={{id: 'demo', name: 'Demo User', email: 'demo@test.com'}} />}
      />
      <Route
        path="/demo/general-task1"
        element={<GeneralTask1Practice user={{id: 'demo', name: 'Demo User', email: 'demo@test.com'}} />}
      />
      <Route
        path="/demo/general-task2"
        element={<GeneralTask2Practice user={{id: 'demo', name: 'Demo User', email: 'demo@test.com'}} />}
      />
    </>
  );
}
