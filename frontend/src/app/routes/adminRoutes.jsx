// ADMIN routes (Faz 1 refactor, 2026-07-03 — extracted VERBATIM from App.js).
// Product tag: SHARED (admin tooling spans both products).

import React, { lazy } from 'react';
import { Route } from 'react-router-dom';

import { RedirectToLogin } from './guards';

const ContentAdmin = lazy(() => import('../../pages/ContentAdmin'));
const AdminPanel = lazy(() => import('../../pages/AdminPanel'));
const AdminFeedback = lazy(() => import('../../pages/AdminFeedback'));
const AdminCreditsPage = lazy(() => import('../../pages/AdminCreditsPage'));
const AdminDashboard = lazy(() => import('../../pages/AdminDashboard'));
const AdminLizAnalytics = lazy(() => import('../../pages/AdminLizAnalytics'));
const AdminOnboardingAnalytics = lazy(() => import('../../pages/AdminOnboardingAnalytics'));
const AdminLearningMode = lazy(() => import('../../pages/AdminLearningMode'));
const AdminTestimonials = lazy(() => import('../../pages/AdminTestimonials'));
const VocabularyImageManager = lazy(() => import('../../pages/VocabularyImageManager'));
const AdminOpsPage = lazy(() => import('../../pages/AdminOpsPage'));
const VisualGenerator = lazy(() => import('../../pages/VisualGenerator'));

export function adminRoutes({ user }) {
  return (
    <>
      <Route path="/admin/credits" element={<AdminCreditsPage user={user} />} />
      <Route path="/admin/feedback" element={<AdminFeedback user={user} />} />
      <Route path="/admin/users" element={<AdminPanel user={user} />} />
      <Route path="/admin/vocabulary-images" element={<VocabularyImageManager user={user} />} />
      <Route path="/admin" element={<AdminDashboard user={user} />} />
      <Route path="/admin/liz-analytics" element={<AdminLizAnalytics user={user} />} />
      <Route path="/admin/onboarding-analytics" element={<AdminOnboardingAnalytics user={user} />} />
      <Route path="/admin/learning-mode" element={<AdminLearningMode user={user} /> } />
      <Route path="/admin/testimonials" element={<AdminTestimonials user={user} />} />
      <Route
        path="/admin/content"
        element={<ContentAdmin />}
      />
      <Route path="/admin/ops" element={<AdminOpsPage />} />
      {/* Admin Tools */}
      <Route
        path="/admin/visual-generator"
        element={user ? <VisualGenerator /> : <RedirectToLogin />}
      />
    </>
  );
}
