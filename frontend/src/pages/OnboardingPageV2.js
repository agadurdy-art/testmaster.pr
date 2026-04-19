import React from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingQuiz } from '../features/onboarding';
import { consumePendingPlan, pendingPlanRedirect } from '../lib/pendingPlan';
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
export default function OnboardingPageV2({ user }) {
  const navigate = useNavigate();

  const handleFinish = async (state) => {
    // Best-effort persistence. If this fails we still route forward so the
    // user isn't stuck on a blank screen — the next session will simply
    // re-prompt the quiz.
    try {
      const userId = user?.id || JSON.parse(localStorage.getItem('testmaster_user') || '{}')?.id;
      if (userId) {
        const base = process.env.REACT_APP_API_URL || '';
        const examDateIso =
          state.examDate instanceof Date
            ? state.examDate.toISOString().slice(0, 10)
            : state.examDate || null;
        await fetch(`${base}/api/users/${encodeURIComponent(userId)}/onboarding`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: state.path,
            targetBand: state.targetBand,
            currentBand: state.currentBand,
            examDate: examDateIso,
            language: state.language,
          }),
        });
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
    const target = pendingPlanRedirect(consumePendingPlan()) || '/dashboard/v2';
    navigate(target);
  };

  return (
    <div className="onboarding-scope">
      <OnboardingQuiz onFinish={handleFinish} />
    </div>
  );
}
