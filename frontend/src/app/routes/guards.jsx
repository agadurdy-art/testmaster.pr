import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

// Unauthenticated user redirect — sends to /login with ?next= so we can
// bounce back to the originally requested page after sign-in. Previously
// every protected route fell back to the landing page, which forgot the
// user's target (Codex live-test #2).
function RedirectToLogin() {
  const location = useLocation();
  const next = `${location.pathname}${location.search}${location.hash}`;
  return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />;
}

export { RedirectToLogin };
