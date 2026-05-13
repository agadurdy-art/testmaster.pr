import React from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingQuiz } from '../features/onboarding';
import {
  consumePendingPlan, pendingPlanRedirect,
  consumePendingIntent, pendingIntentRedirect,
} from '../lib/pendingPlan';
import '../features/onboarding/onboarding.css';

/**
 * D6 Onboarding Quiz — implemented from Claude Design handoff bundle
 * i0k1e4a13GnbyQoaZb7UzA (Onboarding Quiz.html).
 *
 * 5-step flow: Path (IELTS vs General English) → Target band + exam date →
 * Current level → Language preference → Liz intro with plan summary.
 *
 * Persists state to POST /api/users/{id}/onboarding and marks the user
 * onboarded before routing to the dashboard.
 */
export default function OnboardingPageV2({ user, onUserUpdate }) {
  const navigate = useNavigate();

  const handleFinish = async (state) => {
    // Best-effort persistence. If this fails we still route forward so the
    // user isn't stuck on a blank screen — the next session will simply
    // re-prompt the quiz.
    try {
      const userId = user?.id || JSON.parse(localStorage.getItem('user') || '{}')?.id;
      if (userId) {
        const base = process.env.REACT_APP_API_URL || '';
        const examDateIso =
          state.examDate instanceof Date
            ? state.examDate.toISOString().slice(0, 10)
            : state.examDate || null;
        const res = await fetch(`${base}/api/users/${encodeURIComponent(userId)}/onboarding`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: state.path,
            targetBand: state.targetBand,
            currentBand: state.currentBand,
            examDate: examDateIso,
            language: state.language,
            // B3 — "Liz remembers your goals". All optional; backend
            // (auth.py OnboardingPayload) tolerates nulls/empty strings.
            nativeLanguage: state.nativeLanguage,
            motivation: state.motivation || null,
            weakSkills: state.weakSkills,
          }),
        });
        // Critical: the backend response is the authoritative User object
        // with `learning_mode` set (e.g. 'general_english'). Without
        // propagating it to App state + localStorage, the subsequent
        // navigate('/dashboard') still sees a stale user object and
        // App.js isIeltsMode() falls through to IELTS — sending GE
        // onboardees to the IELTS dashboard.
        if (res.ok) {
          try {
            const updatedUser = await res.json();
            if (updatedUser && updatedUser.id) {
              localStorage.setItem('user', JSON.stringify(updatedUser));
              if (typeof onUserUpdate === 'function') onUserUpdate(updatedUser);
            }
          } catch (parseErr) {
            // eslint-disable-next-line no-console
            console.warn('[onboarding] response parse failed', parseErr);
          }
        }
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[onboarding] persist failed', err);
    }
    // Clear the landing-page path hand-off so a second onboarding run
    // (e.g. after a reset) doesn't silently inherit a stale selection.
    try {
      window.localStorage.removeItem('testmaster_onboarding_path');
    } catch (_) {
      /* non-fatal */
    }
    // Honor a pending plan from /signup?plan=X if the user picked a tier
    // before signing up — send them to pricing (paid) or dashboard (free).
    // Plan takes priority; fall back to a pending intent (e.g. ?intent=writing
    // from "Try your own essay") so users land on the evaluator they clicked.
    const planTarget = pendingPlanRedirect(consumePendingPlan());
    const intentTarget = pendingIntentRedirect(consumePendingIntent());
    // Route to /dashboard (not /dashboard/v2) so App.js's isIeltsMode-aware
    // conditional sends GE onboardees to the V1 Dashboard and IELTS onboardees
    // to DashboardPage. Hardcoding /dashboard/v2 stranded GE users on the V2
    // IELTS dashboard regardless of learning_mode.
    navigate(planTarget || intentTarget || '/dashboard');
  };

  return (
    <div className="onboarding-scope">
      <OnboardingQuiz onFinish={handleFinish} />
    </div>
  );
}
