// GENERAL ENGLISH product routes (Faz 1 refactor, 2026-07-03 — extracted
// VERBATIM from App.js). The GE dashboard, unified stage ladder + lesson
// player, Ray teacher, game bank, GE placement test, and the legacy
// mode-branched dashboard fallback.
// Product tag: GE — at repo-split time (roadmap Faz 3) the IELTS repo deletes
// this file; the GE repo keeps it. See [[project-ielts-ge-split]].

import React, { lazy } from 'react';
import { Route, Navigate } from 'react-router-dom';

import { RedirectToLogin } from './guards';

// Critical pages - loaded immediately
import Dashboard from '../../pages/Dashboard';

const GEDashboard = lazy(() => import('../../pages/GEDashboard'));
const ComprehensiveLevelTest = lazy(() => import('../../pages/ComprehensiveLevelTest'));
const RayTeacher = lazy(() => import('../../pages/RayTeacher'));
const GameBank = lazy(() => import('../../pages/GameBank'));
const GameDemo = lazy(() => import('../../pages/GameDemo'));
const UnifiedCoursePage = lazy(() => import('../../pages/UnifiedCoursePage'));
const UnifiedStagePage = lazy(() => import('../../pages/UnifiedStagePage'));
const UnifiedLessonPage = lazy(() => import('../../pages/UnifiedLessonPage'));
const DailyHabitPage = lazy(() => import('../../pages/DailyHabitPage'));

export function geRoutes({ user, handleLogout }) {
  return (
    <>
      <Route
        path="/ge/dashboard"
        element={
          user ? <GEDashboard user={user} onLogout={handleLogout} /> : <RedirectToLogin />
        }
      />
      {/* Legacy IELTS-flavored GE dashboard kept at /dashboard/legacy for fallback */}
      <Route
        path="/dashboard/legacy"
        element={
          user ? <Dashboard user={user} onLogout={handleLogout} /> : <RedirectToLogin />
        }
      />
      {/* GE placement test: same component, GE-flavoured framing. The
          current question pool is CEFR A1-A2 (Aga 2026-05-23: "mevcut
          sorular ielts ile alakali degil, GE icine koyulabilir"), so we
          rewire it as the GE English-level assessment until the real
          IELTS test content lands ([[project_level_test_redesign_backlog]]). */}
      <Route
        path="/ge/placement-test"
        element={<ComprehensiveLevelTest user={user} mode="ge" />}
      />
      {/* Unified Learning System Routes */}
      <Route
        path="/unified"
        element={user ? <UnifiedCoursePage user={user} /> : <RedirectToLogin />}
      />
      <Route
        path="/unified/stage/:stageId"
        element={user ? <UnifiedStagePage user={user} /> : <RedirectToLogin />}
      />
      <Route
        path="/unified/lesson/:lessonId"
        element={user ? <UnifiedLessonPage user={user} /> : <RedirectToLogin />}
      />
      <Route
        path="/unified/daily-habit"
        element={user ? <DailyHabitPage user={user} /> : <RedirectToLogin />}
      />
      {/* /daily-practice never had a page (2026-06-20 cleanup audit) but was
          linked from Ray's library — keep old links/bookmarks working. */}
      <Route path="/daily-practice" element={<Navigate to="/unified/daily-habit" replace />} />
      <Route
        path="/game-demo"
        element={<GameDemo />}
      />

      <Route
        path="/game-bank"
        element={<GameBank />}
      />
      <Route
        path="/ray"
        element={user ? <RayTeacher user={user} /> : <RedirectToLogin />}
      />
    </>
  );
}
