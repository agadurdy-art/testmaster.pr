// LandingV1Page — the legacy IELTS landing (route /landing/v1 only). Orchestrator
// extracted from pages/LandingPage.js (Faz1 wave 10); body verbatim. LevelTestAgent,
// COURSES, the 3-way comparison / how-AI-works / pricing sections and the two dialogs
// moved to sibling modules with closed-over values passed as same-named props.
// (The newer landing surfaces in features/landing/components/ are unrelated.)
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../../components/ui/dialog';
import { 
  BookOpen, Headphones, Mic, PenTool, CheckCircle, Target, Trophy,
  Sparkles, GraduationCap, Award, ArrowRight, Users, Zap,
  Brain, ShieldCheck, TrendingUp, XCircle, ChevronRight, Eye, EyeOff, MessageSquare,
  BarChart3, Lightbulb, Clock, FileText, AlertTriangle, Lock, Play, Mail
} from 'lucide-react';
import { registerUser, loginUser } from '../../../../lib/api';
import { toast } from 'sonner';
import LanguageSwitcher from '../../../../components/LanguageSwitcher';
import { useI18n } from '../../../../lib/i18n';
import ThemeToggle from '../../../../components/ThemeToggle';
import { useTheme, THEME_MODES } from '../../../../contexts/ThemeContext';
import FeedbackModal from '../../../../components/FeedbackModal';
import LevelTestAgent from './LevelTestAgent';
import ComparisonSection from './components/ComparisonSection';
import HowAiWorksSection from './components/HowAiWorksSection';
import PricingSection from './components/PricingSection';
import CourseSelectorDialog from './components/CourseSelectorDialog';
import AuthDialog from './components/AuthDialog';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const SUPPORT_EMAIL = 'support@testmaster.pro';

export default function LandingPage({ onLogin, user, showLogin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language } = useI18n();
  const { activeTheme } = useTheme();
  const isDark = activeTheme === THEME_MODES.DARK;
  const isNightShift = activeTheme === THEME_MODES.NIGHT_SHIFT;
  
  // Trilingual helper
  const getText = (en, vi, tr) => {
    if (language === 'vi') return vi;
    if (language === 'tr') return tr;
    return en;
  };
  
  // Theme-aware classes
  const bgMain = isDark ? 'bg-gray-900' : isNightShift ? 'bg-amber-50' : 'bg-gradient-to-b from-slate-50 via-violet-50/20 to-white';
  const bgCard = isDark ? 'bg-gray-800 border-gray-700' : isNightShift ? 'bg-amber-100/50 border-amber-200' : 'bg-white border-gray-200';
  const bgHeader = isDark ? 'bg-gray-800/90 border-gray-700' : isNightShift ? 'bg-amber-100/90 border-amber-200' : 'bg-white/90 border-gray-100';
  const textPrimary = isDark ? 'text-gray-100' : isNightShift ? 'text-amber-900' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : isNightShift ? 'text-amber-700' : 'text-gray-600';
  const bgSection = isDark ? 'bg-gray-800' : isNightShift ? 'bg-amber-100/50' : 'bg-white';
  
  const [showAuth, setShowAuth] = useState(showLogin || false);
  const [authMode, setAuthMode] = useState(showLogin ? 'login' : 'signup');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [processingSocial, setProcessingSocial] = useState(false);
  const [previewModules, setPreviewModules] = useState([]);
  const [showCourseSelector, setShowCourseSelector] = useState(false);
  const [courseLessons, setCourseLessons] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Feedback modal state
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackType, setFeedbackType] = useState('feedback');
  
  // Update showAuth when showLogin prop changes
  useEffect(() => {
    if (showLogin) {
      setShowAuth(true);
      setAuthMode('login');
    }
  }, [showLogin]);
  
  const handleStartFreePractice = () => {
    navigate('/comprehensive-level-test');
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    
    // Validate passwords match for signup
    if (authMode === 'signup' && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match. Please try again.');
      return;
    }
    
    setLoading(true);
    try {
      if (authMode === 'signup') {
        const { name, email, password } = formData;
        const userData = await registerUser({ name, email, password });
        // NEW: Log user in immediately after registration
        onLogin(userData);
        toast.success('Welcome! Check your email to verify and unlock all features.', { duration: 5000 });
        setShowAuth(false);
        navigate('/dashboard');
      } else {
        const { email, password } = formData;
        const userData = await loginUser({ email, password });
        onLogin(userData);
        if (!userData.verified && !userData.email_verified) {
          toast.success('Welcome back! Verify your email to unlock all features.', { duration: 5000 });
        } else {
          toast.success('Welcome back!');
        }
        navigate('/dashboard');
      }
    } catch (error) {
      const message = error?.response?.data?.detail || 'Authentication failed. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch preview modules for "Try Our Lessons" section
  useEffect(() => {
    const fetchAllCourseLessons = async () => {
      try {
        // Fetch lessons from the three remaining courses
        const [beginnerRes, masteryRes, advancedRes] = await Promise.all([
          fetch(`${API_URL}/api/beginner-english/lessons`).catch(() => ({ ok: false })),
          fetch(`${API_URL}/api/mastery-course/modules`).catch(() => ({ ok: false })),
          fetch(`${API_URL}/api/advanced-mastery/modules`).catch(() => ({ ok: false }))
        ]);

        const lessons = {};

        if (beginnerRes.ok) {
          const data = await beginnerRes.json();
          // Show 6 lessons: 3 free + 3 locked
          lessons.beginner = Array.isArray(data) ? data.slice(0, 6) : [];
        }

        if (masteryRes.ok) {
          const data = await masteryRes.json();
          // Show 6 modules: 3 free + 3 locked
          lessons.mastery = Array.isArray(data) ? data.slice(0, 6) : [];
        }
        
        if (advancedRes.ok) {
          const data = await advancedRes.json();
          // Show 6 modules: 3 free + 3 locked
          lessons.advanced = Array.isArray(data) ? data.slice(0, 6) : [];
          setPreviewModules(data); // For backwards compatibility
        }
        
        setCourseLessons(lessons);
      } catch (e) {
        console.error('Failed to fetch course lessons:', e);
      }
    };
    fetchAllCourseLessons();
  }, []);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Handle URL query params for opening auth modal (e.g., ?action=signup or ?action=login)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const action = params.get('action');
    if (action === 'signup') {
      setAuthMode('signup');
      setShowAuth(true);
      // Clean up the URL without reloading
      window.history.replaceState({}, '', '/');
    } else if (action === 'login') {
      setAuthMode('signin');
      setShowAuth(true);
      // Clean up the URL without reloading
      window.history.replaceState({}, '', '/');
    }
  }, [location.search]);

  if (user) {
    return null;
  }

  return (
    <div className={`min-h-screen ${bgMain} transition-colors duration-300`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 ${bgHeader} backdrop-blur-xl border-b shadow-sm transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-200">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className={`text-xl font-bold ${textPrimary}`}>{t('appName')}</h1>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full">
                  🧪 Beta
                </span>
              </div>
              <p className={`text-xs ${textSecondary}`}>Cambridge-Aligned AI</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <LanguageSwitcher compact />
            <Button variant="ghost" className={`${textSecondary} hover:text-violet-600 hidden sm:flex`} onClick={() => { setAuthMode('signin'); setShowAuth(true); }}>
              {t('landingSignIn')}
            </Button>
            <Button data-testid="get-started-btn" onClick={() => setShowAuth(true)} className="bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white shadow-lg shadow-purple-200 border-0">
              {t('getStarted')}
            </Button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="pt-20 pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            {/* Early Access Notice */}
            <div className={`mb-6 p-4 rounded-xl ${isDark ? 'bg-amber-900/30 border-amber-700' : 'bg-amber-50 border-amber-200'} border`}>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-lg">🧪</span>
                <span className={`font-semibold ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
                  {getText('Early Access · Beta Version', 'Early Access · Phiên bản Beta', 'Erken Erişim · Beta Sürümü')}
                </span>
              </div>
              <p className={`text-sm ${isDark ? 'text-amber-200/80' : 'text-amber-700'}`}>
                {getText(
                  'This platform is currently in beta. Some features are still being improved. Your feedback helps us build a better learning experience.',
                  'Nền tảng đang trong giai đoạn beta. Một số tính năng đang được cải thiện. Phản hồi của bạn giúp chúng tôi xây dựng trải nghiệm học tập tốt hơn.',
                  'Bu platform şu anda beta aşamasında. Bazı özellikler hâlâ geliştirilmektedir. Geri bildiriminiz daha iyi bir öğrenme deneyimi oluşturmamıza yardımcı oluyor.'
                )}
              </p>
            </div>
            
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${isDark ? 'bg-violet-900/50 text-violet-300' : 'bg-violet-100 text-violet-700'} text-sm font-medium mb-8`}>
              <Brain className="w-4 h-4" />
              <span>{t('landingBadge')}</span>
            </div>

            <h2 className={`text-4xl sm:text-5xl lg:text-6xl font-bold ${textPrimary} mb-6 leading-tight tracking-tight`}>
              {t('landingHeroTitle1')}
              <span className="block mt-2 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                {t('landingHeroTitle2')}
              </span>
            </h2>
            
            <p className={`text-xl ${textSecondary} mb-4 leading-relaxed max-w-3xl mx-auto`}>
              {t('landingHeroSubtitle')}
            </p>
            
            <p className={`text-lg ${isDark ? 'text-gray-500' : 'text-gray-500'} mb-10 max-w-2xl mx-auto`}>
              {t('landingHeroDesc')}
            </p>

            <div className="flex flex-wrap gap-4 justify-center mb-12">
              <Button 
                data-testid="start-practicing-btn"
                onClick={handleStartFreePractice} 
                size="lg" 
                className="bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white px-8 py-6 text-lg shadow-xl shadow-purple-200 border-0"
              >
                {t('landingStartLevelCheck')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                data-testid="try-lessons-btn"
                onClick={() => setShowCourseSelector(true)} 
                size="lg" 
                variant="outline"
                className={`border-2 border-amber-500 text-amber-600 ${isDark ? 'hover:bg-amber-900/30' : 'hover:bg-amber-50'} px-8 py-6 text-lg`}
              >
                <Play className="w-5 h-5 mr-2" />
                {t('landingTryOurLessons')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className={`py-20 px-6 ${bgSection} transition-colors duration-300`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-3xl sm:text-4xl font-bold ${textPrimary} mb-4`}>
              {t('landingWhyChooseUs')}
            </h2>
            <p className={`text-lg ${textSecondary}`}>{t('landingWhyChooseUsDesc')}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Brain, title: t('landingExaminerAI'), desc: t('landingExaminerAIDesc'), color: 'bg-violet-500', lightBg: isDark ? 'bg-violet-900/30' : 'bg-violet-50' },
              { icon: ShieldCheck, title: t('landingNoBandInflation'), desc: t('landingNoBandInflationDesc'), color: 'bg-red-500', lightBg: isDark ? 'bg-red-900/30' : 'bg-red-50' },
              { icon: Lightbulb, title: t('landingTeaching'), desc: t('landingTeachingDesc'), color: 'bg-amber-500', lightBg: isDark ? 'bg-amber-900/30' : 'bg-amber-50' },
              { icon: TrendingUp, title: t('landingPersonalPath'), desc: t('landingPersonalPathDesc'), color: 'bg-emerald-500', lightBg: isDark ? 'bg-emerald-900/30' : 'bg-emerald-50' }
            ].map((feature, idx) => (
              <Card key={idx} className={`p-6 ${feature.lightBg} border-0 rounded-2xl hover:shadow-lg transition-all duration-300`}>
                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className={`text-lg font-bold ${textPrimary} mb-2`}>{feature.title}</h3>
                <p className={`${textSecondary} text-sm leading-relaxed`}>{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* METHODOLOGY - Test → Diagnose → Study → Retry */}
      <section className="py-20 px-6 bg-gradient-to-r from-violet-600 to-purple-700">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              {t('landingMethodology')}
            </h2>
            <p className="text-lg text-violet-100">{t('landingMethodologyDesc')}</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '1', title: t('landingStepTest'), icon: FileText, desc: t('landingStepTestDesc'), color: 'bg-blue-500' },
              { step: '2', title: t('landingStepDiagnose'), icon: Brain, desc: t('landingStepDiagnoseDesc'), color: 'bg-amber-500' },
              { step: '3', title: t('landingStepStudy'), icon: BookOpen, desc: t('landingStepStudyDesc'), color: 'bg-emerald-500' },
              { step: '4', title: t('landingStepRetry'), icon: TrendingUp, desc: t('landingStepRetryDesc'), color: 'bg-pink-500' }
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <Card className="p-6 bg-white/10 backdrop-blur border border-white/20 rounded-2xl text-center h-full">
                  <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-xs font-bold text-violet-200 mb-1">STEP {item.step}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-violet-100 text-sm">{item.desc}</p>
                </Card>
                {idx < 3 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ChevronRight className="w-6 h-6 text-white/50" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-violet-100">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{t('landingRepeatUntil')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3-WAY COMPARISON */}
      <ComparisonSection t={t} />

      {/* PRACTICAL COURSES */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              {t('landingPracticalLearningBadge')}
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {t('landingPracticalTitle')}
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              {t('landingPracticalDesc')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: MessageSquare, title: t('landingSpeakingConfidence'), desc: t('landingSpeakingConfidenceDesc') },
              { icon: PenTool, title: t('landingAcademicWriting'), desc: t('landingAcademicWritingDesc') },
              { icon: BookOpen, title: t('landingCriticalReading'), desc: t('landingCriticalReadingDesc') },
              { icon: Headphones, title: t('landingActiveListening'), desc: t('landingActiveListeningDesc') },
              { icon: Brain, title: t('landingVocabMastery'), desc: t('landingVocabMasteryDesc') },
              { icon: Target, title: t('landingTimeManagement'), desc: t('landingTimeManagementDesc') }
            ].map((item, idx) => (
              <Card key={idx} className="p-6 bg-gray-50 border-0 rounded-2xl hover:bg-white hover:shadow-lg transition-all">
                <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center mb-4 shadow-lg">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </Card>
            ))}
          </div>

          <div className="mt-12 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
                  <Award className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{t('landingGuaranteed')}</h3>
                  <p className="text-gray-600">{t('landingGuaranteedDesc')}</p>
                </div>
              </div>
              <Button onClick={() => setShowAuth(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white whitespace-nowrap">
                {t('landingStartLearning')} <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* HOW OUR AI WORKS */}
      <HowAiWorksSection t={t} />

      {/* WHO IS THIS FOR */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {t('landingWhoFor')}
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Target, title: t('landingWhoFor1'), desc: t('landingWhoFor1Desc') },
              { icon: TrendingUp, title: t('landingWhoFor2'), desc: t('landingWhoFor2Desc') },
              { icon: BookOpen, title: t('landingWhoFor3'), desc: t('landingWhoFor3Desc') },
              { icon: MessageSquare, title: t('landingWhoFor4'), desc: t('landingWhoFor4Desc') }
            ].map((item, idx) => (
              <Card key={idx} className="p-6 bg-gray-50 border-0 rounded-2xl hover:shadow-lg transition-all text-center">
                <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-violet-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* COMPLETE FEATURES */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {t('landingCompletePrep')}
            </h2>
            <p className="text-lg text-gray-500">{t('landingCompletePrepDesc')}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: BookOpen, title: t('reading'), desc: t('landingReadingFeature'), color: 'bg-blue-500', shadow: 'shadow-blue-100' },
              { icon: Headphones, title: t('listening'), desc: t('landingListeningFeature'), color: 'bg-purple-500', shadow: 'shadow-purple-100' },
              { icon: PenTool, title: t('writing'), desc: t('landingWritingFeature'), color: 'bg-orange-500', shadow: 'shadow-orange-100' },
              { icon: Mic, title: t('speaking'), desc: t('landingSpeakingFeature'), color: 'bg-emerald-500', shadow: 'shadow-emerald-100' }
            ].map((module, idx) => (
              <Card key={idx} className={`p-6 bg-white border-0 shadow-lg ${module.shadow} hover:shadow-xl cursor-pointer group transition-all duration-300 hover:-translate-y-2 rounded-2xl`}>
                <div className={`w-14 h-14 rounded-2xl ${module.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <module.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{module.title}</h3>
                <p className="text-gray-500 text-sm">{module.desc}</p>
              </Card>
            ))}
          </div>

          <div className="mt-12 p-6 bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl border border-violet-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap className="w-5 h-5 text-violet-600" />
                  <span className="font-semibold text-violet-700">{t('landingAdvancedCourse')}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{t('landingBand6to9')}</h3>
                <p className="text-gray-600">{t('landingAdvancedCourseDesc')}</p>
              </div>
              <Button onClick={() => setShowAuth(true)} className="bg-violet-600 hover:bg-violet-700 text-white whitespace-nowrap">
                {t('landingExploreCourse')} <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* HONESTY PROMISE */}
      <section className="py-20 px-6 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-violet-600 flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            {t('landingHonestyTitle')}
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            {t('landingNoPromise')}
          </p>
          <div className="grid sm:grid-cols-3 gap-6 mb-10">
            {[
              { icon: CheckCircle, text: t('landingWePromise1') },
              { icon: FileText, text: t('landingWePromise2') },
              { icon: TrendingUp, text: t('landingWePromise3') }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-center gap-3 text-white">
                <item.icon className="w-5 h-5 text-green-400" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
          <p className="text-violet-300 text-lg">
            {t('landingHonestyEnd')}
          </p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 px-6 bg-gradient-to-br from-violet-600 to-purple-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {t('landingFinalCTA')}
          </h2>
          <p className="text-xl text-violet-100 mb-8">
            {t('landingFinalCTADesc')}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button 
              onClick={handleStartFreePractice}
              size="lg" 
              className="bg-white text-violet-700 hover:bg-gray-100 px-10 py-6 text-lg shadow-xl border-0"
            >
              {t('landingStartLevelCheck')}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing Section — setIsLogin intentionally not passed: pre-existing dangling
          reference in the original page (see note in components/PricingSection.jsx). */}
      <PricingSection getText={getText} setShowAuth={setShowAuth} />

      {/* Footer */}
      <footer className="bg-gray-900 py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white">{t('appName')}</h3>
            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-bold rounded-full">Beta</span>
          </div>
          <p className="text-gray-400 mb-2">{t('landingFooterTagline')}</p>
          <p className="text-violet-400 text-sm mb-4">{t('landingFooterMotto')}</p>
          
          {/* Feedback & Contact Links */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <button 
              onClick={() => { setFeedbackType('feedback'); setShowFeedbackModal(true); }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors text-sm"
            >
              <MessageSquare className="w-4 h-4" />
              {getText('Give Feedback', 'Gửi phản hồi', 'Geri Bildirim Ver')}
            </button>
            <button 
              onClick={() => { setFeedbackType('bug'); setShowFeedbackModal(true); }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors text-sm"
            >
              <AlertTriangle className="w-4 h-4" />
              {getText('Report an Issue', 'Báo lỗi', 'Sorun Bildir')}
            </button>
          </div>
          
          <p className="text-gray-500 text-sm">© 2025 IELTS Ace. All rights reserved.</p>
        </div>
      </footer>
      
      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        user={user}
        type={feedbackType}
      />

      {/* Course Selector Dialog */}
      <CourseSelectorDialog
        showCourseSelector={showCourseSelector}
        setShowCourseSelector={setShowCourseSelector}
        courseLessons={courseLessons}
        language={language}
        navigate={navigate}
        setShowAuth={setShowAuth}
        t={t}
      />

      {/* Auth Dialog */}
      <AuthDialog
        showAuth={showAuth}
        setShowAuth={setShowAuth}
        authMode={authMode}
        setAuthMode={setAuthMode}
        formData={formData}
        setFormData={setFormData}
        loading={loading}
        processingSocial={processingSocial}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        showConfirmPassword={showConfirmPassword}
        setShowConfirmPassword={setShowConfirmPassword}
        handleAuth={handleAuth}
        t={t}
      />

      {/* Level Test Agent - Shows for non-logged visitors once per device */}
      <LevelTestAgent 
        user={user} 
        onShowSignup={() => {
          setAuthMode('signup');
          setShowAuth(true);
        }} 
      />
    </div>
  );
}
