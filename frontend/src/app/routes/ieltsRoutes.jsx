// IELTS product routes (Faz 1 refactor, 2026-07-03 — extracted VERBATIM from
// App.js). Everything IELTS-only: the Liz dashboard, question bank, full
// mocks, Cambridge tests, writing/speaking practice, legacy band-labelled
// courses, vocabulary/grammar engines, progress.
// Product tag: IELTS — at repo-split time (roadmap Faz 3) the GE repo deletes
// this file; the IELTS repo keeps it.

import React, { lazy } from 'react';
import { Route, Navigate } from 'react-router-dom';

import { RedirectToLogin } from './guards';

const DashboardPage = lazy(() => import('../../pages/DashboardPage'));
const MyResults = lazy(() => import('../../pages/MyResults'));
const StrategiesGuide = lazy(() => import('../../features/strategies/StrategiesGuide'));
const CoursesPage = lazy(() => import('../../pages/CoursesPage'));
const CourseDetail = lazy(() => import('../../pages/CourseDetail'));
const QuickAssessment = lazy(() => import('../../pages/QuickAssessment'));
const WritingPractice = lazy(() => import('../../pages/WritingPractice'));
const SampleReportsHub = lazy(() => import('../../pages/SampleReportsHub'));
const SpeakingPracticeV2 = lazy(() => import('../../pages/SpeakingPracticeV2'));
const SpeakingPremium = lazy(() => import('../../pages/SpeakingPremium'));
const Progress = lazy(() => import('../../pages/Progress'));
const BeginnerCourse = lazy(() => import('../../pages/BeginnerCourse'));
const MasteryCourse = lazy(() => import('../../pages/MasteryCourse'));
const AdvancedMasteryCourse = lazy(() => import('../../pages/AdvancedMasteryCourse'));
const QuestionBank = lazy(() => import('../../pages/QuestionBank'));
const WritingTask1Practice = lazy(() => import('../../pages/WritingTask1Practice'));
const WritingTask2Practice = lazy(() => import('../../pages/WritingTask2Practice'));
const GeneralTask1Practice = lazy(() => import('../../pages/GeneralTask1Practice'));
const GeneralTask2Practice = lazy(() => import('../../pages/GeneralTask2Practice'));
const ReadingPracticeAcademic = lazy(() => import('../../pages/ReadingPracticeAcademic'));
const ReadingPracticeGeneral = lazy(() => import('../../pages/ReadingPracticeGeneral'));
const ReadingPracticeMasteryAcademic = lazy(() => import('../../pages/ReadingPracticeMasteryAcademic'));
const ReadingPracticeMasteryGeneral = lazy(() => import('../../pages/ReadingPracticeMasteryGeneral'));
const ReadingPracticeByType = lazy(() => import('../../pages/ReadingPracticeByType'));
const ListeningPractice = lazy(() => import('../../pages/ListeningPractice'));
const SpeakingPracticeQB = lazy(() => import('../../pages/SpeakingPracticeQB'));
const PracticeMode = lazy(() => import('../../pages/PracticeMode'));
const FullTestMode = lazy(() => import('../../pages/FullTestMode'));
const FullTestInterface = lazy(() => import('../../pages/FullTestInterface'));
const FullTestResults = lazy(() => import('../../pages/FullTestResults'));
const CambridgeTestInterface = lazy(() => import('../../pages/CambridgeTestInterface'));
const CambridgeTestResults = lazy(() => import('../../pages/CambridgeTestResults'));
const FocusPlan = lazy(() => import('../../pages/FocusPlan'));
const LizTeacher = lazy(() => import('../../pages/LizTeacher'));
const VocabularyLearnMode = lazy(() => import('../../pages/VocabularyLearnMode'));
const VocabularyPracticeMode = lazy(() => import('../../pages/VocabularyPracticeMode'));
const VocabularyQuizMode = lazy(() => import('../../pages/VocabularyQuizMode'));
const VocabularyProductionMode = lazy(() => import('../../pages/VocabularyProductionMode'));
const GrammarLearnMode = lazy(() => import('../../pages/GrammarLearnMode'));
const GrammarPracticeMode = lazy(() => import('../../pages/GrammarPracticeMode'));
const GrammarQuizMode = lazy(() => import('../../pages/GrammarQuizMode'));
const GrammarProductionMode = lazy(() => import('../../pages/GrammarProductionMode'));
const GrammarSmartReview = lazy(() => import('../../pages/GrammarSmartReview'));
const GrammarBlueprint = lazy(() => import('../../pages/GrammarBlueprint'));
const VocabularyBrowse = lazy(() => import('../../pages/VocabularyBrowse'));
const ReviewBank = lazy(() => import('../../pages/ReviewBank'));

export function ieltsRoutes({ user, handleLogout }) {
  return (
    <>
      <Route path="/my-results" element={user ? <MyResults user={user} /> : <Navigate to="/login" replace />} />
      {/* Strict URL separation (2026-06-01): /dashboard is ALWAYS the IELTS
          Ace (Liz) home, regardless of learning_mode. General English lives
          at /ge/dashboard. Post-login + GE "Back to Dashboard" links route
          GE users to /ge/dashboard (see lib/learningMode.homePath), so a GE
          student never lands here, and an IELTS login never leaks into GE. */}
      <Route
        path="/dashboard"
        element={
          user
            ? <DashboardPage user={user} onLogout={handleLogout} />
            : <RedirectToLogin />
        }
      />
      <Route
        path="/dashboard/v2"
        element={user ? <DashboardPage /> : <RedirectToLogin />}
      />
      <Route
        path="/tips"
        element={user ? <StrategiesGuide user={user} onLogout={handleLogout} /> : <RedirectToLogin />}
      />
      <Route
        path="/strategies"
        element={user ? <StrategiesGuide user={user} onLogout={handleLogout} /> : <RedirectToLogin />}
      />
      <Route
        path="/courses"
        element={user ? <CoursesPage user={user} onLogout={handleLogout} /> : <RedirectToLogin />}
      />
      <Route
        path="/courses/:courseId"
        element={user ? <CourseDetail user={user} onLogout={handleLogout} /> : <RedirectToLogin />}
      />
      {/* New 15-18 min adaptive onboarding test for IELTS guests.
          Zero-cost backend at /api/quick-assessment/*. Replaces the
          comprehensive level test as the primary onboarding funnel —
          see project_quick_assessment_spec. */}
      <Route
        path="/quick-assessment"
        element={<QuickAssessment user={user} />}
      />
      <Route
        path="/writing-practice"
        element={user ? <WritingPractice user={user} /> : <RedirectToLogin />}
      />
      <Route
        path="/sample-reports"
        element={user ? <SampleReportsHub /> : <RedirectToLogin />}
      />
      <Route path="/speaking/v2" element={<SpeakingPracticeV2 user={user} />} />
      {/* Full Mock Test (ElevenLabs). Renamed from the old "Liz Examiner" /
          speaking-premium surface; the old path now redirects here so existing
          links keep working. */}
      <Route
        path="/full-mock"
        element={user ? <SpeakingPremium user={user} /> : <RedirectToLogin />}
      />
      <Route path="/speaking-premium" element={<Navigate to="/full-mock" replace />} />
      <Route
        path="/progress"
        element={user ? <Progress user={user} /> : <RedirectToLogin />}
      />
      <Route
        path="/beginner-course"
        element={<BeginnerCourse user={user} />}
      />
      <Route
        path="/mastery-course"
        element={<MasteryCourse user={user} />}
      />
      <Route
        path="/advanced-mastery"
        element={<AdvancedMasteryCourse user={user} />}
      />
      {/* Vocabulary theme browser — deep-links into Advanced Mastery */}
      <Route path="/vocabulary" element={<VocabularyBrowse />} />
      <Route
        path="/vocabulary/learn/:moduleId"
        element={user ? <VocabularyLearnMode user={user} /> : <RedirectToLogin />}
      />
      <Route
        path="/vocabulary/practice/:moduleId"
        element={user ? <VocabularyPracticeMode user={user} /> : <RedirectToLogin />}
      />
      <Route
        path="/vocabulary/quiz/:moduleId"
        element={user ? <VocabularyQuizMode user={user} /> : <RedirectToLogin />}
      />
      <Route
        path="/vocabulary/production/:moduleId"
        element={user ? <VocabularyProductionMode user={user} /> : <RedirectToLogin />}
      />
      <Route
        path="/review-bank"
        element={user ? <ReviewBank user={user} /> : <RedirectToLogin />}
      />

      {/* Grammar Engine Routes */}
      <Route
        path="/grammar/learn/:moduleId"
        element={user ? <GrammarLearnMode user={user} /> : <RedirectToLogin />}
      />
      <Route
        path="/grammar/practice/:moduleId"
        element={user ? <GrammarPracticeMode user={user} /> : <RedirectToLogin />}
      />
      <Route
        path="/grammar/quiz/:moduleId"
        element={user ? <GrammarQuizMode user={user} /> : <RedirectToLogin />}
      />
      <Route
        path="/grammar/guided/:moduleId"
        element={user ? <GrammarProductionMode user={user} stage="guided" /> : <RedirectToLogin />}
      />
      <Route
        path="/grammar/free/:moduleId"
        element={user ? <GrammarProductionMode user={user} stage="free" /> : <RedirectToLogin />}
      />
      <Route
        path="/grammar/smart-review/:moduleId"
        element={user ? <GrammarSmartReview user={user} /> : <RedirectToLogin />}
      />

      {/* Grammar Blueprint — curated IELTS 8 curriculum */}
      <Route path="/grammar" element={<GrammarBlueprint user={user} />} />
      <Route path="/grammar/:slug" element={<GrammarBlueprint user={user} />} />

      {/* Bare-skill redirects so /question-bank/reading + /question-bank/writing
          (linked from the dashboard TopBar Practice dropdown and the legacy
          /dashboard-header-practice-* redirects) land on a real page instead
          of 404. Reading → Academic (most demanded), Writing → Task 2. */}
      <Route path="/question-bank/reading" element={<Navigate to="/question-bank/reading/academic" replace />} />
      <Route path="/question-bank/writing" element={<Navigate to="/question-bank/writing/task2" replace />} />
      <Route
        path="/question-bank/writing/task1"
        element={user ? <WritingTask1Practice user={user} /> : <RedirectToLogin />}
      />
      <Route
        path="/question-bank/writing/task2"
        element={user ? <WritingTask2Practice user={user} /> : <RedirectToLogin />}
      />
      <Route
        path="/question-bank/writing/general/task1"
        element={user ? <GeneralTask1Practice user={user} /> : <RedirectToLogin />}
      />
      <Route
        path="/question-bank/writing/general/task2"
        element={user ? <GeneralTask2Practice user={user} /> : <RedirectToLogin />}
      />
      <Route
        path="/question-bank/reading/academic"
        element={user ? <ReadingPracticeAcademic user={user} /> : <RedirectToLogin />}
      />
      <Route
        path="/question-bank/reading/general"
        element={user ? <ReadingPracticeGeneral user={user} /> : <RedirectToLogin />}
      />
      <Route
        path="/question-bank/reading/mastery/academic"
        element={user ? <ReadingPracticeMasteryAcademic user={user} /> : <RedirectToLogin />}
      />
      <Route
        path="/question-bank/reading/mastery/general"
        element={user ? <ReadingPracticeMasteryGeneral user={user} /> : <RedirectToLogin />}
      />
      <Route
        path="/question-bank/reading/practice"
        element={user ? <ReadingPracticeByType user={user} /> : <RedirectToLogin />}
      />
      <Route
        path="/question-bank/listening"
        element={user ? <ListeningPractice user={user} /> : <RedirectToLogin />}
      />
      <Route
        path="/question-bank/speaking"
        element={user ? <SpeakingPracticeQB user={user} /> : <RedirectToLogin />}
      />
      <Route
        path="/question-bank/practice"
        element={user ? <PracticeMode user={user} /> : <RedirectToLogin />}
      />
      <Route
        path="/quick-practice"
        element={user ? <PracticeMode user={user} /> : <RedirectToLogin />}
      />
      <Route
        path="/liz"
        element={user ? <LizTeacher user={user} /> : <RedirectToLogin />}
      />
      <Route
        path="/question-bank"
        element={user ? <QuestionBank user={user} /> : <RedirectToLogin />}
      />
      {/* Full Test Mode Routes */}
      <Route
        path="/full-test"
        element={user ? <FullTestMode user={user} /> : <RedirectToLogin />}
      />
      <Route
        path="/full-test/take/:testId"
        element={user ? <FullTestInterface user={user} /> : <RedirectToLogin />}
      />
      <Route
        path="/full-test/results/:sessionId"
        element={<FullTestResults user={user} />}
      />
      {/* Cambridge IELTS Tests */}
      <Route
        path="/cambridge-test/:bookId/:testId"
        element={user ? <CambridgeTestInterface user={user} /> : <RedirectToLogin />}
      />
      <Route
        path="/cambridge-test/:bookId/:testId/results"
        element={user ? <CambridgeTestResults user={user} /> : <RedirectToLogin />}
      />
      <Route
        path="/focus-plan"
        element={user ? <FocusPlan /> : <RedirectToLogin />}
      />
      {/* Zombie slug redirects — these URLs surface from browser history /
          external referrers (no source in code or git). Bounce to the real
          practice routes so users don't hit a 404. */}
      <Route path="/dashboard-header-practice-reading" element={<Navigate to="/question-bank/reading" replace />} />
      <Route path="/dashboard-header-practice-writing" element={<Navigate to="/question-bank/writing" replace />} />
      <Route path="/dashboard-header-practice-listening" element={<Navigate to="/question-bank/listening" replace />} />
      <Route path="/dashboard-header-practice-speaking" element={<Navigate to="/question-bank/speaking" replace />} />
    </>
  );
}
