import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import './App.css';
import LandingPage from './pages/LandingPage';
import { loginWithEmergentSession } from './lib/api';
import { toast } from 'sonner';
import Dashboard from './pages/Dashboard';
import TestInterface from './pages/TestInterface';
import Results from './pages/Results';
import TipsPage from './pages/TipsPage';
import CoursesPage from './pages/CoursesPage';
import CourseDetail from './pages/CourseDetail';
import Profile from './pages/Profile';
import ContentAdmin from './pages/ContentAdmin';
import AdminPanel from './pages/AdminPanel';
import PricingPage from './pages/PricingPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AdminCreditsPage from './pages/AdminCreditsPage';
import LevelTest from './pages/LevelTest';
import ComprehensiveLevelTest from './pages/ComprehensiveLevelTest';
import AdaptiveLevelTest from './pages/AdaptiveLevelTest';
import VocabGrammarCourse from './pages/VocabGrammarCourse';
import WritingPractice from './pages/WritingPractice';
import SpeakingPractice from './pages/SpeakingPractice';
import Progress from './pages/Progress';
import BeginnerCourse from './pages/BeginnerCourse';
import MasteryCourse from './pages/MasteryCourse';
import AdvancedMasteryCourse from './pages/AdvancedMasteryCourse';
import LessonPreview from './pages/LessonPreview';
import FeatureShowcase from './pages/FeatureShowcase';
import { Toaster } from './components/ui/sonner';
import MobileBottomNav from './components/MobileBottomNav';
import LearningPlatform from './pages/LearningPlatform';
import LevelDetail from './pages/LevelDetail';
import UnitDetail from './pages/UnitDetail';
import LessonView from './pages/LessonView';
import { ThemeProvider } from './contexts/ThemeContext';
import QuestionBank from './pages/QuestionBank';
import WritingTask1Practice from './pages/WritingTask1Practice';
import GameBank from './pages/GameBank';
import WritingTask2Practice from './pages/WritingTask2Practice';
import GeneralTask1Practice from './pages/GeneralTask1Practice';
import GeneralTask2Practice from './pages/GeneralTask2Practice';
import ReadingPracticeAcademic from './pages/ReadingPracticeAcademic';
import ReadingPracticeGeneral from './pages/ReadingPracticeGeneral';
import ReadingPracticeMasteryAcademic from './pages/ReadingPracticeMasteryAcademic';
import ReadingPracticeMasteryGeneral from './pages/ReadingPracticeMasteryGeneral';
import ReadingPracticeByType from './pages/ReadingPracticeByType';
import ListeningPractice from './pages/ListeningPractice';
import SpeakingPracticeQB from './pages/SpeakingPracticeQB';
import PracticeMode from './pages/PracticeMode';
import FullTestMode from './pages/FullTestMode';
import FullTestInterface from './pages/FullTestInterface';
import FullTestResults from './pages/FullTestResults';
import VisualGenerator from './pages/VisualGenerator';
import CambridgeTestInterface from './pages/CambridgeTestInterface';
import CambridgeTestResults from './pages/CambridgeTestResults';
import { useI18n } from './lib/i18n';
import { scanDomForLanguageLeaks } from './lib/leakDetection';

// Language Leak Watcher Component (Development Only)
function LanguageLeakWatcher() {
  const { language } = useI18n();
  
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    
    const id = setTimeout(() => {
      const leak = scanDomForLanguageLeaks(language);
      if (leak) {
        console.error('🚨 LANGUAGE LEAK DETECTED:', leak);
        // Uncomment to break on leak detection:
        // throw new Error(`${leak.type}: ${leak.sample}`);
      }
    }, 500);
    
    return () => clearTimeout(id);
  }, [language]);
  
  return null;
}


function EmergentBadgeWrapper() {
  const location = useLocation();

  // Only show badge (and allow ElevenLabs widget) when user is on speaking test AND logged in
  const isSpeakingTest = location.pathname.startsWith('/test/speaking');

  if (!isSpeakingTest) return null;

  return (
    <a
      id="emergent-badge"
      target="_blank"
      rel="noreferrer"
      href="https://app.emergent.sh/?utm_source=emergent-badge"
      style={{
        display: 'flex',
        alignItems: 'center',
        position: 'fixed',
        bottom: 20,
        left: 20,
        textDecoration: 'none',
        padding: '6px 10px',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
        fontSize: 12,
        zIndex: 9999,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        borderRadius: 8,
        backgroundColor: '#ffffff',
        border: '1px solid rgba(255, 255, 255, 0.25)'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        <img
          style={{ width: 20, height: 20, marginRight: 8 }}
          src="https://avatars.githubusercontent.com/in/1201222?s=120&u=2686cf91179bbafbc7a71bfbc43004cf9ae1acea&v=4"
          alt="Emergent avatar"
        />
        <p
          style={{
            color: '#000000',
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
            fontSize: 12,
            alignItems: 'center',
            marginBottom: 0
          }}
        >
          Made with Emergent
        </p>
      </div>
    </a>
  );
}

function MobileNavWrapper({ user }) {
  const location = useLocation();

  // Only show bottom nav when logged in and not on landing/auth-only pages
  if (!user) return null;
  if (
    location.pathname === '/' ||
    location.pathname === '/verify-email' ||
    location.pathname === '/reset-password'
  ) {
    return null;
  }

  return <MobileBottomNav currentPath={location.pathname} />;
}
function AppWithSessionHandler() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

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
        try {
          const userData = await loginWithEmergentSession(sessionId);
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          toast.success('Logged in with Google');
        } catch (err) {
          const message = err?.response?.data?.detail || 'Google login failed. Please try again.';
          toast.error(message);
        } finally {
          // Always send user to dashboard (if login worked, they will see it; if not, they stay unauthenticated)
          navigate('/dashboard');
        }
      })();
    }
  }, [location, navigate]);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
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
      <Routes>
        <Route path="/" element={<LandingPage onLogin={handleLogin} user={user} />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LandingPage onLogin={handleLogin} user={user} showLogin={true} />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/admin/credits" element={<AdminCreditsPage user={user} />} />
        <Route path="/admin" element={<AdminPanel user={user} />} />
        <Route 
          path="/dashboard" 
          element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/test/:testType" 
          element={user ? <TestInterface user={user} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/results/:attemptId" 
          element={user ? <Results user={user} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/tips" 
          element={user ? <TipsPage user={user} onLogout={handleLogout} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/courses" 
          element={user ? <CoursesPage user={user} onLogout={handleLogout} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/courses/:courseId" 
          element={user ? <CourseDetail user={user} onLogout={handleLogout} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/learning" 
          element={user ? <LearningPlatform user={user} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/learning/level/:levelId" 
          element={user ? <LevelDetail user={user} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/learning/unit/:unitId" 
          element={user ? <UnitDetail user={user} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/learning/lesson/:lessonId" 
          element={user ? <LessonView user={user} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/profile" 
          element={user ? <Profile user={user} onLogout={handleLogout} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/pricing" 
          element={user ? <PricingPage user={user} /> : <Navigate to="/" />} 
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
        <Route 
          path="/adaptive-level-test" 
          element={<AdaptiveLevelTest user={user} />} 
        />
        <Route 
          path="/vocab-grammar" 
          element={user ? <VocabGrammarCourse user={user} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/writing-practice" 
          element={user ? <WritingPractice user={user} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/speaking-practice" 
          element={user ? <SpeakingPractice user={user} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/progress" 
          element={user ? <Progress user={user} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/beginner-course" 
          element={user ? <BeginnerCourse user={user} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/mastery-course" 
          element={user ? <MasteryCourse user={user} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/advanced-mastery" 
          element={user ? <AdvancedMasteryCourse user={user} /> : <Navigate to="/" />} 
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
        <Route 
          path="/question-bank/writing/task1" 
          element={user ? <WritingTask1Practice user={user} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/question-bank/writing/task2" 
          element={user ? <WritingTask2Practice user={user} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/question-bank/writing/general/task1" 
          element={user ? <GeneralTask1Practice user={user} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/question-bank/writing/general/task2" 
          element={user ? <GeneralTask2Practice user={user} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/question-bank/reading/academic" 
          element={user ? <ReadingPracticeAcademic user={user} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/question-bank/reading/general" 
          element={user ? <ReadingPracticeGeneral user={user} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/question-bank/reading/mastery/academic" 
          element={user ? <ReadingPracticeMasteryAcademic user={user} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/question-bank/reading/mastery/general" 
          element={user ? <ReadingPracticeMasteryGeneral user={user} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/question-bank/reading/practice" 
          element={user ? <ReadingPracticeByType user={user} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/question-bank/listening" 
          element={user ? <ListeningPractice user={user} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/question-bank/speaking" 
          element={user ? <SpeakingPracticeQB user={user} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/question-bank/practice" 
          element={user ? <PracticeMode user={user} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/question-bank" 
          element={user ? <QuestionBank user={user} /> : <Navigate to="/" />} 
        />
        {/* Full Test Mode Routes */}
        <Route 
          path="/full-test" 
          element={user ? <FullTestMode user={user} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/full-test/take/:testId" 
          element={user ? <FullTestInterface user={user} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/full-test/results/:sessionId" 
          element={user ? <FullTestResults user={user} /> : <Navigate to="/" />} 
        />
        {/* Cambridge IELTS Tests */}
        <Route 
          path="/cambridge-test/:bookId/:testId" 
          element={user ? <CambridgeTestInterface user={user} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/cambridge-test/:bookId/:testId/results" 
          element={user ? <CambridgeTestResults user={user} /> : <Navigate to="/" />} 
        />
        {/* Admin Tools */}
        <Route 
          path="/admin/visual-generator" 
          element={user ? <VisualGenerator /> : <Navigate to="/" />} 
        />
      </Routes>
      <EmergentBadgeWrapper />
      <MobileNavWrapper user={user} />
      <Toaster position="top-right" />
    </>
  );
}



function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="App min-h-screen bg-background text-foreground">
          <LanguageLeakWatcher />
          <AppWithSessionHandler />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;