import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import './App.css';
import './styles/rtl.css';
import { loginWithGoogleSession } from './lib/api';
import { installFetchAuth } from './lib/authToken';

// Attach the session token to all raw fetch() calls to /api/* (audit Faz 2).
// Runs once at module load, before any component fetches.
installFetchAuth();
import { toast } from 'sonner';
import { Toaster } from './components/ui/sonner';
import MobileBottomNav from './components/MobileBottomNav';
import useStudyTimeTracking from './hooks/useStudyTimeTracking';
import { ThemeProvider, useTheme, THEME_MODES } from './contexts/ThemeContext';
import { AudioProvider } from './contexts/AudioContext';
import { useI18n } from './lib/i18n';
import { scanDomForLanguageLeaks } from './lib/leakDetection';
import { isEnglishLockedRoute, getEffectiveLanguage } from './lib/languageLock';
import ErrorBoundary from './components/ErrorBoundary';
import QuotaExceededModal from './components/QuotaExceededModal';
import {
  consumePendingPlan, pendingPlanRedirect,
  consumePendingIntent, pendingIntentRedirect,
} from './lib/pendingPlan';
import { isIeltsMode, homePath } from './lib/learningMode';
import { track } from './lib/analytics';

// Route groups (Faz 1 refactor, 2026-07-03): every <Route> now lives in a
// product-tagged module under src/app/routes/ — PUBLIC / ADMIN / SHARED /
// IELTS / GE. The grouping is the frontend half of the IELTS/GE split map
// (roadmap Faz 3): each repo keeps its own group file and deletes the other's.
// Route paths/elements/guards are byte-identical to the pre-split App.js.
import { publicRoutes } from './app/routes/publicRoutes';
import { adminRoutes } from './app/routes/adminRoutes';
import { sharedRoutes } from './app/routes/sharedRoutes';
import { ieltsRoutes } from './app/routes/ieltsRoutes';
import { geRoutes } from './app/routes/geRoutes';

const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const LizFloatingButton = lazy(() => import('./components/LizFloatingButton'));
const FeedbackLauncher = lazy(() => import('./components/FeedbackLauncher'));
const DashboardSideNav = lazy(() => import('./features/dashboard/components/DashboardSideNav'));

// Page loading fallback — skeleton-based to avoid empty-screen flash during
// lazy route chunks. Neutral layout that reads as "something is coming" on
// any page, not a specific one.
function PageLoader() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-background px-4 py-10" role="status" aria-live="polite" aria-label={t('loadingLabel')}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="animate-pulse rounded-lg bg-primary/10 h-8 w-2/3" />
        <div className="animate-pulse rounded-lg bg-primary/10 h-4 w-5/6" />
        <div className="animate-pulse rounded-lg bg-primary/10 h-4 w-4/6" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          <div className="animate-pulse rounded-xl bg-primary/10 h-28" />
          <div className="animate-pulse rounded-xl bg-primary/10 h-28" />
          <div className="animate-pulse rounded-xl bg-primary/10 h-28" />
        </div>
        <span className="sr-only">{t('loadingLabel')}</span>
      </div>
    </div>
  );
}


// Language Leak Watcher Component (Development Only)
function LanguageLeakWatcher() {
  const { language } = useI18n();
  const location = useLocation();

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const id = setTimeout(() => {
      // Get effective language based on route
      const effectiveLang = getEffectiveLanguage(location.pathname, language);
      const leak = scanDomForLanguageLeaks(effectiveLang);

      if (leak) {
        const routeInfo = isEnglishLockedRoute(location.pathname)
          ? '(English-locked route)'
          : `(System: ${language})`;
        console.error(`🚨 LANGUAGE LEAK DETECTED ${routeInfo}:`, leak);
        // Uncomment to break on leak detection:
        // throw new Error(`${leak.type}: ${leak.sample}`);
      }
    }, 500);

    return () => clearTimeout(id);
  }, [language, location.pathname]);

  return null;
}


function MobileNavWrapper({ user }) {
  const location = useLocation();

  // Decide whether to show the legacy global MobileBottomNav.
  let visible = true;
  if (!user) {
    visible = false;
  } else if (
    location.pathname === '/' ||
    location.pathname === '/verify-email' ||
    location.pathname === '/reset-password'
  ) {
    visible = false;
  } else if (location.pathname.startsWith('/dashboard')) {
    // Dashboard V2 ships its own DashboardBottomNav inside DashboardLayout.
    // Suppress the legacy MobileBottomNav on those routes so we don't stack
    // two bars on mobile (bug report 2026-04-20).
    visible = false;
  } else if (location.pathname.startsWith('/onboarding')) {
    // Onboarding has its own sticky-bottom StickyActions Continue button.
    // The global MobileBottomNav was stacking on top of it on mobile, hiding
    // the Continue control — user reported "ilerlemiyor, giris basarisiz"
    // on 2026-05-19 GE onboarding.
    visible = false;
  }

  // Reserve scroll room (88px + safe-area) on the body whenever the bar is
  // mounted — otherwise the last line of any page (quiz submit buttons,
  // evaluator CTAs) sits behind the fixed bar on mobile. Pairs with the
  // `body.has-mobile-bottom-nav` rule in App.css.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const cls = 'has-mobile-bottom-nav';
    if (visible) {
      document.body.classList.add(cls);
    } else {
      document.body.classList.remove(cls);
    }
    return () => document.body.classList.remove(cls);
  }, [visible]);

  if (!visible) return null;
  return <MobileBottomNav currentPath={location.pathname} mode={user?.learning_mode} />;
}

function AppWithSessionHandler() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { activeTheme } = useTheme();

  // Heartbeat-based study-time tracking. Mounted once at the top of the
  // routed app so every authenticated route is counted toward Total Study.
  useStudyTimeTracking(user?.id);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const hash = window.location.hash || '';
    if (hash.startsWith('#session_id=')) {
      const sessionId = hash.replace('#session_id=', '').trim();
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      if (!sessionId) return;
      (async () => {
        let userData = null;
        try {
          userData = await loginWithGoogleSession(sessionId);
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          toast.success('Logged in with Google');
        } catch (err) {
          const message = err?.response?.data?.detail || 'Google login failed. Please try again.';
          toast.error(message);
        }
        // Route off the response. Mirror handleLogin's logic so Google
        // and email login send users to the same places — including
        // /onboarding when the user hasn't completed it yet. Without
        // this, a fresh Google signup skipped onboarding entirely and
        // landed on /dashboard with learning_mode=null → isIeltsMode()
        // fell through to the IELTS dashboard regardless of the path
        // the user picked on the landing.
        if (!userData) {
          navigate('/');
          return;
        }
        // Mirror handleLogin's quick-assessment attach
        try {
          const qaSession = localStorage.getItem('quick_assessment_session_id');
          if (qaSession && userData?.id) {
            const base = process.env.REACT_APP_BACKEND_URL || '';
            fetch(`${base}/api/quick-assessment/attach`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ session_id: qaSession, user_id: userData.id }),
            }).finally(() => {
              try { localStorage.removeItem('quick_assessment_session_id'); } catch (_) {}
            });
          }
        } catch (_) { /* non-fatal */ }
        // Mirror handleLogin: sync learning_mode → localStorage hint, and
        // treat users with a path on file as already-onboarded so legacy
        // Google accounts (onboarding_complete=false but learning_mode set)
        // don't get bounced into the picker on every login.
        const mode = (userData.learning_mode || '').toLowerCase();
        const hasMode = mode === 'ielts' || mode === 'general_english' || mode === 'both';
        if (mode === 'ielts' || mode === 'general_english') {
          try {
            localStorage.setItem('testmaster_onboarding_path', mode === 'ielts' ? 'ielts' : 'general');
          } catch (_) { /* non-fatal */ }
        }
        if (userData.onboarding_complete === false && !hasMode) {
          // Brand-new Google account → count it as a conversion (mirrors the
          // email sign_up fired on /start). UTM persists in sessionStorage so
          // the OAuth round-trip doesn't lose campaign attribution.
          track('sign_up', { method: 'google' });
          navigate('/onboarding');
          return;
        }
        const planTarget = pendingPlanRedirect(consumePendingPlan());
        if (planTarget) { navigate(planTarget); return; }
        const intentTarget = pendingIntentRedirect(consumePendingIntent());
        // Consume `?next=` stashed by LoginPage before the OAuth round-trip
        // so unauthenticated users redirected from a protected route end up
        // back on that route after Google sign-in. Same-origin guard mirrors
        // LoginPage's safeNext.
        let nextTarget = null;
        try {
          const raw = window.sessionStorage.getItem('postLoginNext');
          window.sessionStorage.removeItem('postLoginNext');
          if (raw && raw.startsWith('/') && !raw.startsWith('//')) {
            nextTarget = raw;
          }
        } catch (_) { /* non-fatal */ }
        navigate(intentTarget || nextTarget || homePath(userData));
      })();
    }
  }, [location, navigate]);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));

    // Quick assessment funnel attach: if the user took the 15-min level
    // test as a guest and just signed up, link their anonymous result to
    // the new account. Fire-and-forget — non-fatal if backend rejects.
    try {
      const qaSession = localStorage.getItem('quick_assessment_session_id');
      if (qaSession && userData?.id) {
        const base = process.env.REACT_APP_BACKEND_URL || '';
        fetch(`${base}/api/quick-assessment/attach`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: qaSession, user_id: userData.id }),
        }).finally(() => {
          try { localStorage.removeItem('quick_assessment_session_id'); } catch (_) {}
        });
      }
    } catch (_) { /* non-fatal */ }

    // Sync learning_mode → localStorage path hint so isIeltsMode() doesn't
    // fall back to a stale picker hint, and onboarding (if it does trigger)
    // skips Step 1. Returning users with any explicit mode are treated as
    // already-onboarded even if the DB flag is false (legacy accounts where
    // onboarding_complete was never written). "both" counts as onboarded
    // too — it only gets set after a user has been through onboarding for
    // each path at least once.
    const mode = (userData?.learning_mode || '').toLowerCase();
    const hasMode = mode === 'ielts' || mode === 'general_english' || mode === 'both';
    // localStorage hint only takes a concrete path — "both" is intentionally
    // skipped so the most recent path picker selection wins the next render.
    if (mode === 'ielts' || mode === 'general_english') {
      try {
        localStorage.setItem('testmaster_onboarding_path', mode === 'ielts' ? 'ielts' : 'general');
      } catch (_) { /* non-fatal */ }
    }
    // If the user hasn't finished onboarding yet AND has no path on file,
    // route them there so the landing-page path selection isn't silently
    // dropped. Onboarding will consume the pending plan (if any) on finish.
    if (userData && userData.onboarding_complete === false && !hasMode) {
      navigate('/onboarding');
      return;
    }
    // Already-onboarded user came in via /signup?plan=X or ?intent=Y —
    // honor the plan first (checkout is priority), then the intent
    // (lands them on the evaluator they were promised). Without this,
    // "Try your own essay" signups stranded users on /dashboard.
    const planTarget = pendingPlanRedirect(consumePendingPlan());
    if (planTarget) { navigate(planTarget); return; }
    const intentTarget = pendingIntentRedirect(consumePendingIntent());
    if (intentTarget) navigate(intentTarget);
  };

  const handleLogout = () => {
    setUser(null);
    // Clear all per-user cached state (mockExamDate, weekly_pace, targetBand,
    // onboarding_path, audio-progress:*, draft_*, etc.) to prevent leakage to
    // the next user on shared devices. Preserve only the device-level i18n
    // language preference so the next visitor sees their browser language.
    const preservedLang = localStorage.getItem('ieltsace_language');
    localStorage.clear();
    if (preservedLang) localStorage.setItem('ieltsace_language', preservedLang);
    // PathPickerGate caches the prior track choice in sessionStorage
    // (`tm_demo_path`). If we don't drop it on logout, the next "/" visit
    // skips the picker and lands straight on whichever surface the user
    // chose last — meaning both IELTS and GE logouts always show the IELTS
    // landing. Clearing the session forces the gate to ask again.
    try { sessionStorage.clear(); } catch (_) {}
    // Hard-redirect to "/" so PathPickerGate remounts with an empty choice
    // and the visitor sees the IELTS/GE picker again instead of landing
    // straight on whichever flavour they picked last session.
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  // Show loading state while checking localStorage
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // ── Global navigation rail ────────────────────────────────────────────────
  // The left rail (DashboardSideNav) used to live only inside DashboardLayout,
  // so it vanished on Speaking / Question Bank / Full Test and most other app
  // pages — the user wanted it everywhere for fast navigation. We now render it
  // once here for every *authenticated app* route. Excluded: public/marketing
  // pages (their own headers) and the sealed full-test runner (focus mode while
  // a timed exam is in progress). The rail is `hidden lg:flex`, so phones are
  // unaffected and keep their existing bottom nav / back buttons.
  const PUBLIC_PREFIXES = [
    '/login', '/signup', '/start', '/landing', '/privacy', '/terms', '/contact',
    '/status', '/about', '/verify-email', '/reset-password', '/samples',
    '/share-your-story', '/dev', '/admin',
    // Marketing pricing pages own a full standalone layout (their own nav +
    // footer + language selector) — forcing the app rail on top doubled the
    // navigation and broke the rail logo. Let them render standalone.
    '/pricing',
  ];
  const path = location.pathname;
  const isPublicRoute = path === '/' || PUBLIC_PREFIXES.some((p) => path === p || path.startsWith(p + '/'));
  // Focus mode = immersive activities that run full-screen with their OWN
  // header/timer: the sealed full-test runner and the Reading/Listening/Writing
  // practice surfaces. Forcing the rail on these double-headed them and cramped
  // the test layout. (Question Bank home + the speaking picker keep the rail.)
  const isFocusMode = path.startsWith('/full-test/take')
    || /^\/question-bank\/(reading|listening|writing)(\/|$)/.test(path);
  const showRail = !!user && !isPublicRoute && !isFocusMode;
  const railThemeClass =
    activeTheme === THEME_MODES.DARK ? 'theme-dark'
    : activeTheme === THEME_MODES.NIGHT_SHIFT ? 'theme-night'
    : '';

  return (
    <>
      {/* Wrapped in .dashboard-scope so the rail's CSS variables (--primary,
          --fg, theme tokens) resolve; bg/min-height neutralised inline so the
          scope's full-screen paint doesn't cover the page. */}
      {showRail && (
        <Suspense fallback={null}>
          <div className={`dashboard-scope ${railThemeClass}`} style={{ background: 'none', minHeight: 0 }}>
            <DashboardSideNav user={user} />
          </div>
        </Suspense>
      )}
      <div className={showRail ? 'lg:pl-[264px]' : ''}>
      <Suspense fallback={<PageLoader />}>
      <Routes>
        {publicRoutes({ user, setUser, handleLogin })}
        {adminRoutes({ user })}
        {sharedRoutes({ user, setUser, handleLogout })}
        {ieltsRoutes({ user, handleLogout })}
        {geRoutes({ user, handleLogout })}
        {/* Catch-all 404 — must be last */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </Suspense>
      </div>
      {user && isIeltsMode(user) && location.pathname.startsWith('/dashboard') && (
        <Suspense fallback={null}><LizFloatingButton user={user} /></Suspense>
      )}
      {user && (
        <Suspense fallback={null}><FeedbackLauncher user={user} railVisible={showRail} /></Suspense>
      )}
      <MobileNavWrapper user={user} />
      <Toaster position="top-right" />
    </>
  );
}



function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <AudioProvider>
            <div className="App min-h-screen bg-background text-foreground">
              <LanguageLeakWatcher />
              <QuotaExceededModal />
              <AppWithSessionHandler />
            </div>
          </AudioProvider>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
