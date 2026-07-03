// SHARED product routes (Faz 1 refactor, 2026-07-03 — extracted VERBATIM from
// App.js). Surfaces both products use: profile, onboarding, checkout,
// placement/level tests, the mode-branched /speaking-practice, learning-tools,
// and the legacy V1 test platform (predates the IELTS/GE split).
// Product tag: SHARED — at repo-split time these are copied to both repos (or
// assigned in Faz 3a's data/auth decision).

import React, { lazy } from 'react';
import { Route } from 'react-router-dom';

import { RedirectToLogin } from './guards';
import { isIeltsMode } from '../../lib/learningMode';

const Profile = lazy(() => import('../../pages/Profile'));
const BankTransferCheckout = lazy(() => import('../../pages/BankTransferCheckout'));
const OnboardingPageV2 = lazy(() => import('../../pages/OnboardingPageV2'));
const LevelTest = lazy(() => import('../../pages/LevelTest'));
const ComprehensiveLevelTest = lazy(() => import('../../pages/ComprehensiveLevelTest'));
const AdaptiveLevelTest = lazy(() => import('../../pages/AdaptiveLevelTest'));
const SpeakingPracticeV2 = lazy(() => import('../../pages/SpeakingPracticeV2'));
const SpeakingPractice = lazy(() => import('../../pages/SpeakingPractice'));
const LearningToolsIndex = lazy(() => import('../../pages/LearningToolsIndex'));
const TestInterface = lazy(() => import('../../pages/TestInterface'));
const Results = lazy(() => import('../../pages/Results'));
const LearningPlatform = lazy(() => import('../../pages/LearningPlatform'));
const LevelDetail = lazy(() => import('../../pages/LevelDetail'));
const UnitDetail = lazy(() => import('../../pages/UnitDetail'));
const LessonView = lazy(() => import('../../pages/LessonView'));

export function sharedRoutes({ user, setUser, handleLogout }) {
  return (
    <>
      <Route
        path="/profile"
        element={user ? <Profile user={user} onLogout={handleLogout} /> : <RedirectToLogin />}
      />
      <Route
        path="/checkout/bank/:plan"
        element={user ? <BankTransferCheckout user={user} /> : <RedirectToLogin />}
      />
      <Route
        path="/onboarding"
        element={user ? <OnboardingPageV2 user={user} onUserUpdate={setUser} /> : <RedirectToLogin />}
      />
      <Route path="/onboarding/v2" element={<OnboardingPageV2 user={user} onUserUpdate={setUser} />} />
      <Route
        path="/level-test"
        element={<LevelTest user={user} />}
      />
      <Route
        path="/comprehensive-level-test"
        element={<ComprehensiveLevelTest user={user} />}
      />
      <Route
        path="/adaptive-level-test"
        element={<AdaptiveLevelTest user={user} />}
      />
      <Route
        path="/speaking-practice"
        element={
          user
            ? (isIeltsMode(user)
                ? <SpeakingPracticeV2 user={user} />
                : <SpeakingPractice user={user} />)
            : <RedirectToLogin />
        }
      />
      <Route
        path="/learning-tools"
        element={user ? <LearningToolsIndex user={user} /> : <RedirectToLogin />}
      />
      {/* Legacy V1 test platform (predates the IELTS/GE split): band-scored
          tests served by the old /api/tests backend with the Ray GE-tutor
          evaluator. Kept until V1 users are migrated. */}
      <Route
        path="/test/:testType"
        element={user ? <TestInterface user={user} /> : <RedirectToLogin />}
      />
      <Route
        path="/results/:attemptId"
        element={user ? <Results user={user} /> : <RedirectToLogin />}
      />
      <Route
        path="/learning"
        element={user ? <LearningPlatform user={user} /> : <RedirectToLogin />}
      />
      <Route
        path="/learning/level/:levelId"
        element={user ? <LevelDetail user={user} /> : <RedirectToLogin />}
      />
      <Route
        path="/learning/unit/:unitId"
        element={user ? <UnitDetail user={user} /> : <RedirectToLogin />}
      />
      <Route
        path="/learning/lesson/:lessonId"
        element={user ? <LessonView user={user} /> : <RedirectToLogin />}
      />
    </>
  );
}
