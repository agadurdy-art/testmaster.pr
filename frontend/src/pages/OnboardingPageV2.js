import React from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingQuiz } from '../features/onboarding';
import {
  consumePendingPlan, pendingPlanRedirect,
  consumePendingIntent, pendingIntentRedirect,
} from '../lib/pendingPlan';
import { homePath } from '../lib/learningMode';
import { authHeader } from '../lib/authToken';
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
    // Frontend-derived learning_mode — used as fallback if backend response
    // is missing the field, and applied to localStorage immediately so the
    // post-onboarding reload sees the correct mode regardless of network.
    const localLearningMode = state.path === 'general' ? 'general_english' : 'ielts';

    let updatedUser = null;
    try {
      const localUser = (() => {
        try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch (_) { return {}; }
      })();
      const userId = user?.id || localUser?.id;
      if (userId) {
        // Audit P1-2: the rest of the app uses REACT_APP_BACKEND_URL. Using
        // REACT_APP_API_URL here (unset in prod) made `base` empty → a relative
        // /api/users/{id}/onboarding that hits the SPA on the split Vercel+Railway
        // deploy, so learning_mode was NEVER written to the DB (users re-landed
        // on IELTS default on a fresh device). Use the canonical var.
        const base = process.env.REACT_APP_BACKEND_URL || '';
        const examDateIso =
          state.examDate instanceof Date
            ? state.examDate.toISOString().slice(0, 10)
            : state.examDate || null;
        const res = await fetch(`${base}/api/users/${encodeURIComponent(userId)}/onboarding`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeader() },
          body: JSON.stringify({
            path: state.path,
            targetBand: state.targetBand,
            currentBand: state.currentBand,
            examDate: examDateIso,
            language: state.language,
            nativeLanguage: state.nativeLanguage,
            motivation: state.motivation || null,
            weakSkills: state.weakSkills,
          }),
        });
        if (res.ok) {
          try {
            updatedUser = await res.json();
          } catch (parseErr) {
            // eslint-disable-next-line no-console
            console.warn('[onboarding] response parse failed', parseErr);
          }
        }
      }
      // Defensive merge: even if the backend response is missing,
      // synthesize a user object with the locally-known learning_mode +
      // onboarding_complete=true so isIeltsMode() on the next render sees
      // the correct mode.
      const baseUser = updatedUser && updatedUser.id ? updatedUser : (localUser || user || {});
      const mergedUser = {
        ...baseUser,
        learning_mode: (updatedUser && updatedUser.learning_mode) || localLearningMode,
        onboarding_complete: true,
      };
      localStorage.setItem('user', JSON.stringify(mergedUser));
      if (typeof onUserUpdate === 'function') onUserUpdate(mergedUser);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[onboarding] persist failed', err);
    }
    try {
      window.localStorage.removeItem('testmaster_onboarding_path');
    } catch (_) {
      /* non-fatal */
    }
    const planTarget = pendingPlanRedirect(consumePendingPlan());
    const intentTarget = pendingIntentRedirect(consumePendingIntent());
    // Land on the product's own home (IELTS → /dashboard, GE → /ge/dashboard)
    // based on the mode just written, so a GE user never finishes onboarding
    // on the IELTS dashboard.
    const target = planTarget || intentTarget || homePath(mergedUser);
    // Hard navigation (not react-router navigate) so the new route picks up
    // the freshly-written localStorage user. Avoids any race where the
    // /dashboard route renders before App state has committed the
    // updated user, sending the GE user to the IELTS dashboard.
    window.location.assign(target);
  };

  return (
    <div className="onboarding-scope">
      <OnboardingQuiz onFinish={handleFinish} />
    </div>
  );
}
