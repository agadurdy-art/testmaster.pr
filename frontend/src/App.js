import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import './App.css';
import './styles/rtl.css';
import LandingPage from './pages/LandingPage';
import { loginWithGoogleSession } from './lib/api';
import { installFetchAuth } from './lib/authToken';

// Attach the session token to all raw fetch() calls to /api/* (audit Faz 2).
// Runs once at module load, before any component fetches.
installFetchAuth();
import { toast } from 'sonner';
import { Toaster } from './components/ui/sonner';
import MobileBottomNav from './components/MobileBottomNav';
import useStudyTimeTracking from './hooks/useStudyTimeTracking';
import { ThemeProvider } from './contexts/ThemeContext';
import { AudioProvider } from './contexts/AudioContext';
import { useI18n } from './lib/i18n';
import { scanDomForLanguageLeaks } from './lib/leakDetection';
import { isEnglishLockedRoute, getEffectiveLanguage } from './lib/languageLock';
import ErrorBoundary from './components/ErrorBoundary';
import QuotaExceededModal from './components/QuotaExceededModal';
import {
  stashPendingPlan, consumePendingPlan, pendingPlanRedirect,
  stashPendingIntent, consumePendingIntent, pendingIntentRedirect,
  stashPendingCustomMeta,
} from './lib/pendingPlan';
import { isIeltsMode, homePath, normalizeProduct } from './lib/learningMode';

// Critical pages - loaded immediately
import Dashboard from './pages/Dashboard';

// All other pages - lazy loaded on demand
const TestInterface = lazy(() => import('./pages/TestInterface'));
const Results = lazy(() => import('./pages/Results'));
const StrategiesGuide = lazy(() => import('./features/strategies/StrategiesGuide'));
const CoursesPage = lazy(() => import('./pages/CoursesPage'));
const CourseDetail = lazy(() => import('./pages/CourseDetail'));
const Profile = lazy(() => import('./pages/Profile'));
const ContentAdmin = lazy(() => import('./pages/ContentAdmin'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const AdminFeedback = lazy(() => import('./pages/AdminFeedback'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const AdminCreditsPage = lazy(() => import('./pages/AdminCreditsPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminLizAnalytics = lazy(() => import('./pages/AdminLizAnalytics'));
const AdminOnboardingAnalytics = lazy(() => import('./pages/AdminOnboardingAnalytics'));
const AdminLearningMode = lazy(() => import('./pages/AdminLearningMode'));
const AdminTestimonials = lazy(() => import('./pages/AdminTestimonials'));
const ShareYourStoryPage = lazy(() => import('./pages/ShareYourStoryPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const StatusPage = lazy(() => import('./pages/StatusPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const VocabularyImageManager = lazy(() => import('./pages/VocabularyImageManager'));
const LevelTest = lazy(() => import('./pages/LevelTest'));
const ComprehensiveLevelTest = lazy(() => import('./pages/ComprehensiveLevelTest'));
const QuickAssessment = lazy(() => import('./pages/QuickAssessment'));
const AdaptiveLevelTest = lazy(() => import('./pages/AdaptiveLevelTest'));
const WritingPractice = lazy(() => import('./pages/WritingPractice'));
const EvaluatorResultPreview = lazy(() => import('./pages/EvaluatorResultPreview'));
const SampleReportsHub = lazy(() => import('./pages/SampleReportsHub'));
const PublicEssayEvaluator = lazy(() => import('./pages/PublicEssayEvaluator'));
const AnonEvalReportPage = lazy(() => import('./pages/AnonEvalReportPage'));
const AdminOpsPage = lazy(() => import('./pages/AdminOpsPage'));
const PublicSpeakingTrial = lazy(() => import('./pages/PublicSpeakingTrial'));
const SampleReportBand65Task2 = lazy(() => import('./pages/SampleReportBand65Task2'));
const SampleReportBand80Task2 = lazy(() => import('./pages/SampleReportBand80Task2'));
const SampleReportBand50Task2 = lazy(() => import('./pages/SampleReportBand50Task2'));
const SampleReportSpeakingPart2 = lazy(() => import('./pages/SampleReportSpeakingPart2'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const GEDashboard = lazy(() => import('./pages/GEDashboard'));
const DevGePreview = lazy(() => import('./pages/DevGePreview'));
const LandingPageV2 = lazy(() => import('./pages/LandingPageV2'));
const LandingPageGE = lazy(() => import('./pages/LandingPageGE'));
const LandingPageDemo = lazy(() => import('./pages/LandingPageDemo'));
const PricingPageV2 = lazy(() => import('./pages/PricingPageV2'));
const BankTransferCheckout = lazy(() => import('./pages/BankTransferCheckout'));
const OnboardingPageV2 = lazy(() => import('./pages/OnboardingPageV2'));
const SpeakingPracticeV2 = lazy(() => import('./pages/SpeakingPracticeV2'));
const SpeakingPractice = lazy(() => import('./pages/SpeakingPractice'));
const SpeakingPremium = lazy(() => import('./pages/SpeakingPremium'));
const Progress = lazy(() => import('./pages/Progress'));
const BeginnerCourse = lazy(() => import('./pages/BeginnerCourse'));
const MasteryCourse = lazy(() => import('./pages/MasteryCourse'));
const AdvancedMasteryCourse = lazy(() => import('./pages/AdvancedMasteryCourse'));
const LessonPreview = lazy(() => import('./pages/LessonPreview'));
const FeatureShowcase = lazy(() => import('./pages/FeatureShowcase'));
const LearningPlatform = lazy(() => import('./pages/LearningPlatform'));
const LevelDetail = lazy(() => import('./pages/LevelDetail'));
const UnitDetail = lazy(() => import('./pages/UnitDetail'));
const LessonView = lazy(() => import('./pages/LessonView'));
const QuestionBank = lazy(() => import('./pages/QuestionBank'));
const WritingTask1Practice = lazy(() => import('./pages/WritingTask1Practice'));
const GameBank = lazy(() => import('./pages/GameBank'));
const WritingTask2Practice = lazy(() => import('./pages/WritingTask2Practice'));
const GeneralTask1Practice = lazy(() => import('./pages/GeneralTask1Practice'));
const GeneralTask2Practice = lazy(() => import('./pages/GeneralTask2Practice'));
const ReadingPracticeAcademic = lazy(() => import('./pages/ReadingPracticeAcademic'));
const ReadingPracticeGeneral = lazy(() => import('./pages/ReadingPracticeGeneral'));
const ReadingPracticeMasteryAcademic = lazy(() => import('./pages/ReadingPracticeMasteryAcademic'));
const ReadingPracticeMasteryGeneral = lazy(() => import('./pages/ReadingPracticeMasteryGeneral'));
const ReadingPracticeByType = lazy(() => import('./pages/ReadingPracticeByType'));
const ListeningPractice = lazy(() => import('./pages/ListeningPractice'));
const SpeakingPracticeQB = lazy(() => import('./pages/SpeakingPracticeQB'));
const PracticeMode = lazy(() => import('./pages/PracticeMode'));
const LearningToolsIndex = lazy(() => import('./pages/LearningToolsIndex'));
const FullTestMode = lazy(() => import('./pages/FullTestMode'));
const FullTestInterface = lazy(() => import('./pages/FullTestInterface'));
const FullTestResults = lazy(() => import('./pages/FullTestResults'));
const VisualGenerator = lazy(() => import('./pages/VisualGenerator'));
const CambridgeTestInterface = lazy(() => import('./pages/CambridgeTestInterface'));
const CambridgeTestResults = lazy(() => import('./pages/CambridgeTestResults'));
const FocusPlan = lazy(() => import('./pages/FocusPlan'));
const LizTeacher = lazy(() => import('./pages/LizTeacher'));
const RayTeacher = lazy(() => import('./pages/RayTeacher'));
const LizFloatingButton = lazy(() => import('./components/LizFloatingButton'));
const FeedbackLauncher = lazy(() => import('./components/FeedbackLauncher'));
const VocabularyLearnMode = lazy(() => import('./pages/VocabularyLearnMode'));
const VocabularyPracticeMode = lazy(() => import('./pages/VocabularyPracticeMode'));
const VocabularyQuizMode = lazy(() => import('./pages/VocabularyQuizMode'));
const VocabularyProductionMode = lazy(() => import('./pages/VocabularyProductionMode'));
const GrammarLearnMode = lazy(() => import('./pages/GrammarLearnMode'));
const GrammarPracticeMode = lazy(() => import('./pages/GrammarPracticeMode'));
const GrammarQuizMode = lazy(() => import('./pages/GrammarQuizMode'));
const GrammarProductionMode = lazy(() => import('./pages/GrammarProductionMode'));
const GrammarSmartReview = lazy(() => import('./pages/GrammarSmartReview'));
const GrammarBlueprint = lazy(() => import('./pages/GrammarBlueprint'));
const VocabularyBrowse = lazy(() => import('./pages/VocabularyBrowse'));
const ReviewBank = lazy(() => import('./pages/ReviewBank'));
const UnifiedCoursePage = lazy(() => import('./pages/UnifiedCoursePage'));
const UnifiedStagePage = lazy(() => import('./pages/UnifiedStagePage'));
const UnifiedLessonPage = lazy(() => import('./pages/UnifiedLessonPage'));
const DailyHabitPage = lazy(() => import('./pages/DailyHabitPage'));
const GameDemo = lazy(() => import('./pages/GameDemo'));

// Unauthenticated user redirect — sends to /login with ?next= so we can
// bounce back to the originally requested page after sign-in. Previously
// every protected route fell back to the landing page, which forgot the
// user's target (Codex live-test #2).
function RedirectToLogin() {
  const location = useLocation();
  const next = `${location.pathname}${location.search}${location.hash}`;
  return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />;
}

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

function AppWithSessionHandler() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

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

  return (
    <>
      <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<LandingPageDemo user={user} setUser={setUser} />} />
        <Route path="/landing/v1" element={<LandingPage onLogin={handleLogin} user={user} />} />
        <Route path="/login" element={<LoginPage user={user} onLogin={handleLogin} />} />
        <Route path="/signup" element={<SignupBridge user={user} />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/status" element={<StatusPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/admin/credits" element={<AdminCreditsPage user={user} />} />
        <Route path="/admin/feedback" element={<AdminFeedback user={user} />} />
        <Route path="/admin/users" element={<AdminPanel user={user} />} />
        <Route path="/admin/vocabulary-images" element={<VocabularyImageManager user={user} />} />
        <Route path="/admin" element={<AdminDashboard user={user} />} />
        <Route path="/admin/liz-analytics" element={<AdminLizAnalytics user={user} />} />
        <Route path="/admin/onboarding-analytics" element={<AdminOnboardingAnalytics user={user} />} />
        <Route path="/admin/learning-mode" element={<AdminLearningMode user={user} /> } />
        <Route path="/admin/testimonials" element={<AdminTestimonials user={user} />} />
        <Route path="/share-your-story" element={<ShareYourStoryPage user={user} />} />
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
        <Route 
          path="/test/:testType" 
          element={user ? <TestInterface user={user} /> : <RedirectToLogin />} 
        />
        <Route 
          path="/results/:attemptId" 
          element={user ? <Results user={user} /> : <RedirectToLogin />} 
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
        <Route 
          path="/profile" 
          element={user ? <Profile user={user} onLogout={handleLogout} /> : <RedirectToLogin />} 
        />
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
        <Route
          path="/checkout/bank/:plan"
          element={user ? <BankTransferCheckout user={user} /> : <RedirectToLogin />}
        />
        <Route path="/pricing/v1" element={<PricingPage user={user} />} />
        <Route
          path="/onboarding"
          element={user ? <OnboardingPageV2 user={user} onUserUpdate={setUser} /> : <RedirectToLogin />}
        />
        <Route 
          path="/admin/content" 
          element={<ContentAdmin />} 
        />
        <Route 
          path="/level-test" 
          element={<LevelTest user={user} />} 
        />
        <Route
          path="/comprehensive-level-test"
          element={<ComprehensiveLevelTest user={user} />}
        />
        {/* New 15-18 min adaptive onboarding test for IELTS guests.
            Zero-cost backend at /api/quick-assessment/*. Replaces the
            comprehensive level test as the primary onboarding funnel —
            see project_quick_assessment_spec. */}
        <Route
          path="/quick-assessment"
          element={<QuickAssessment user={user} />}
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
        <Route 
          path="/adaptive-level-test" 
          element={<AdaptiveLevelTest user={user} />} 
        />
        <Route
          path="/writing-practice"
          element={user ? <WritingPractice user={user} /> : <RedirectToLogin />}
        />
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
        <Route path="/admin/ops" element={<AdminOpsPage />} />
        <Route path="/score-my-speaking" element={<PublicSpeakingTrial />} />
        <Route
          path="/sample-reports"
          element={user ? <SampleReportsHub /> : <RedirectToLogin />}
        />
        <Route
          path="/dashboard/v2"
          element={user ? <DashboardPage /> : <RedirectToLogin />}
        />
        <Route path="/landing/v2" element={<LandingPageV2 />} />
        <Route path="/landing/ge" element={<LandingPageGE />} />
        <Route path="/landing/demo" element={<LandingPageDemo user={user} setUser={setUser} />} />
        <Route path="/pricing/v2" element={<PricingPageV2 user={user} />} />
        <Route path="/onboarding/v2" element={<OnboardingPageV2 user={user} onUserUpdate={setUser} />} />
        <Route path="/speaking/v2" element={<SpeakingPracticeV2 />} />
        <Route
          path="/speaking-premium"
          element={user ? <SpeakingPremium user={user} /> : <RedirectToLogin />}
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
        <Route 
          path="/game-demo" 
          element={<GameDemo />} 
        />
        
        <Route 
          path="/game-bank" 
          element={<GameBank />} 
        />
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
          path="/learning-tools"
          element={user ? <LearningToolsIndex user={user} /> : <RedirectToLogin />}
        />
        <Route
          path="/liz"
          element={user ? <LizTeacher user={user} /> : <RedirectToLogin />}
        />
        <Route
          path="/ray"
          element={user ? <RayTeacher user={user} /> : <RedirectToLogin />}
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
        {/* Admin Tools */}
        <Route
          path="/admin/visual-generator"
          element={user ? <VisualGenerator /> : <RedirectToLogin />}
        />
        {/* Zombie slug redirects — these URLs surface from browser history /
            external referrers (no source in code or git). Bounce to the real
            practice routes so users don't hit a 404. */}
        <Route path="/dashboard-header-practice-reading" element={<Navigate to="/question-bank/reading" replace />} />
        <Route path="/dashboard-header-practice-writing" element={<Navigate to="/question-bank/writing" replace />} />
        <Route path="/dashboard-header-practice-listening" element={<Navigate to="/question-bank/listening" replace />} />
        <Route path="/dashboard-header-practice-speaking" element={<Navigate to="/question-bank/speaking" replace />} />
        {/* Catch-all 404 — must be last */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </Suspense>
      {user && isIeltsMode(user) && location.pathname.startsWith('/dashboard') && (
        <Suspense fallback={null}><LizFloatingButton user={user} /></Suspense>
      )}
      {user && (
        <Suspense fallback={null}><FeedbackLauncher user={user} /></Suspense>
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