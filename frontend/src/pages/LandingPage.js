import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { 
  BookOpen, Headphones, Mic, PenTool, CheckCircle, Target, Trophy,
  Sparkles, GraduationCap, Award, ArrowRight, Users, Zap,
  Brain, ShieldCheck, TrendingUp, XCircle, ChevronRight, Eye, EyeOff, MessageSquare,
  BarChart3, Lightbulb, Clock, FileText, AlertTriangle, Lock, Play, Mail
} from 'lucide-react';
import { registerUser, loginUser } from '../lib/api';
import { toast } from 'sonner';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useI18n } from '../lib/i18n';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme, THEME_MODES } from '../contexts/ThemeContext';
import FeedbackModal from '../components/FeedbackModal';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const SUPPORT_EMAIL = 'support@testmaster.pro';

// Level Test Agent Component - Shows once per device for non-logged visitors
function LevelTestAgent({ user, onShowSignup }) {
  const [callStarted, setCallStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(240); // 4 minutes = 240 seconds
  const [callEnded, setCallEnded] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);
  const { language } = useI18n();

  // Check if should show on mount
  useEffect(() => {
    // Only show for non-logged in visitors who haven't seen it before
    const hasSeenAgent = localStorage.getItem('ielts_level_test_agent_shown');
    if (!user && !hasSeenAgent) {
      setShouldShow(true);
      // Mark as shown on this device
      localStorage.setItem('ielts_level_test_agent_shown', 'true');
    }
  }, [user]);

  // Show/hide widget based on shouldShow state
  useEffect(() => {
    const widget = document.getElementById('ielts-level-test-agent');
    if (!widget) return;
    
    if (shouldShow) {
      widget.style.display = 'block';
    } else {
      widget.style.display = 'none';
    }

    return () => {
      if (widget) {
        widget.style.display = 'none';
      }
    };
  }, [shouldShow]);

  // 4-minute countdown timer when call starts
  useEffect(() => {
    if (!callStarted || callEnded) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setCallEnded(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [callStarted, callEnded]);

  // Listen for call start (when user clicks the phone button)
  useEffect(() => {
    if (!shouldShow) return;

    const checkCallStatus = () => {
      const widget = document.querySelector('#ielts-level-test-agent elevenlabs-convai');
      if (widget && widget.shadowRoot) {
        // Check if call is active by looking for active call indicators
        const activeCall = widget.shadowRoot.querySelector('[data-state="open"], .call-active, [aria-label*="End"]');
        if (activeCall && !callStarted) {
          setCallStarted(true);
        }
      }
    };

    const interval = setInterval(checkCallStatus, 1000);
    return () => clearInterval(interval);
  }, [shouldShow, callStarted]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getText = (en, vi, tr) => {
    if (language === 'vi') return vi;
    if (language === 'tr') return tr;
    return en;
  };

  if (!shouldShow) return null;

  return (
    <>
      {/* Timer overlay when call is active */}
      {callStarted && !callEnded && (
        <div className="fixed bottom-24 right-4 z-[10000] bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-2 rounded-full shadow-lg animate-pulse">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="font-bold">{formatTime(timeRemaining)}</span>
            <span className="text-xs opacity-80">
              {getText('remaining', 'còn lại', 'kalan')}
            </span>
          </div>
        </div>
      )}

      {/* Sign-up prompt after call ends */}
      {callEnded && (
        <div className="fixed inset-0 bg-black/50 z-[10001] flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 bg-white rounded-2xl shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {getText(
                  'Great conversation!',
                  'Cuộc trò chuyện tuyệt vời!',
                  'Harika konuşma!'
                )}
              </h3>
              <p className="text-gray-600 mb-6">
                {getText(
                  'Ready to take your IELTS preparation to the next level? Sign up now for full access to AI-powered practice tests, personalized feedback, and comprehensive courses.',
                  'Sẵn sàng nâng cao kỹ năng IELTS của bạn? Đăng ký ngay để truy cập đầy đủ các bài kiểm tra AI, phản hồi cá nhân hóa và các khóa học toàn diện.',
                  'IELTS hazırlığınızı bir sonraki seviyeye taşımaya hazır mısınız? AI destekli pratik testlere, kişiselleştirilmiş geri bildirimlere ve kapsamlı kurslara tam erişim için şimdi kaydolun.'
                )}
              </p>
              <div className="space-y-3">
                <Button 
                  className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white py-3 text-lg"
                  onClick={() => {
                    setCallEnded(false);
                    onShowSignup();
                  }}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  {getText('Sign Up Free', 'Đăng ký miễn phí', 'Ücretsiz Kaydol')}
                </Button>
                <button 
                  className="text-gray-500 text-sm hover:text-gray-700"
                  onClick={() => setCallEnded(false)}
                >
                  {getText('Maybe later', 'Để sau', 'Belki sonra')}
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}

// Course configurations with band ranges
const COURSES = [
  {
    id: 'beginner',
    name: 'Beginner Course',
    nameVi: 'Khóa học Cơ bản',
    nameTr: 'Başlangıç Kursu',
    bandRange: 'Band 2.0 - 4.5',
    description: 'Essential English fundamentals with interactive lessons',
    descriptionVi: 'Kiến thức tiếng Anh cơ bản với bài học tương tác',
    descriptionTr: 'Etkileşimli derslerle temel İngilizce',
    color: 'from-emerald-500 to-teal-600',
    lightBg: 'bg-emerald-50',
    icon: '🌱',
    apiEndpoint: '/api/beginner-english/lessons',
    previewRoute: '/beginner-course',
    directAccess: true
  },
  {
    id: 'vocab-grammar',
    name: 'Vocabulary & Grammar',
    nameVi: 'Từ vựng & Ngữ pháp',
    nameTr: 'Kelime & Dilbilgisi',
    bandRange: 'Band 4.5 - 7.0+',
    description: '30 units with 250+ vocabulary and grammar items',
    descriptionVi: '30 bài học với 250+ từ vựng và ngữ pháp',
    descriptionTr: '250+ kelime ve dilbilgisi öğesiyle 30 ünite',
    color: 'from-pink-500 to-rose-600',
    lightBg: 'bg-pink-50',
    icon: '📖',
    apiEndpoint: '/api/vocab-grammar/lessons',
    previewRoute: '/vocab-grammar',
    directAccess: true
  },
  {
    id: 'mastery',
    name: 'Mastery Course',
    nameVi: 'Khóa học Trung cấp',
    nameTr: 'Ustalık Kursu',
    bandRange: 'Band 5.5 - 6.5',
    description: 'Intermediate IELTS skills with AI feedback',
    descriptionVi: 'Kỹ năng IELTS trung cấp với phản hồi AI',
    descriptionTr: 'AI geri bildirimi ile orta düzey IELTS becerileri',
    color: 'from-blue-500 to-indigo-600',
    lightBg: 'bg-blue-50',
    icon: '📚',
    apiEndpoint: '/api/mastery-course/modules',
    previewRoute: '/mastery-course',
    directAccess: true
  },
  {
    id: 'advanced',
    name: 'Advanced Mastery',
    nameVi: 'Khóa học Nâng cao',
    nameTr: 'İleri Düzey Ustalık',
    bandRange: 'Band 6.5 - 9.0',
    description: 'Advanced strategies with expert AI evaluation',
    descriptionVi: 'Chiến lược nâng cao với đánh giá AI chuyên gia',
    descriptionTr: 'Uzman AI değerlendirmesiyle ileri stratejiler',
    color: 'from-amber-500 to-orange-600',
    lightBg: 'bg-amber-50',
    icon: '🏆',
    apiEndpoint: '/api/advanced-mastery/modules',
    previewRoute: '/advanced-mastery',
    directAccess: true
  }
];

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
        // Fetch lessons from all 4 courses
        const [beginnerRes, vocabRes, masteryRes, advancedRes] = await Promise.all([
          fetch(`${API_URL}/api/beginner-english/lessons`).catch(() => ({ ok: false })),
          fetch(`${API_URL}/api/vocab-grammar/lessons`).catch(() => ({ ok: false })),
          fetch(`${API_URL}/api/mastery-course/modules`).catch(() => ({ ok: false })),
          fetch(`${API_URL}/api/advanced-mastery/modules`).catch(() => ({ ok: false }))
        ]);
        
        const lessons = {};
        
        if (beginnerRes.ok) {
          const data = await beginnerRes.json();
          // Show 6 lessons: 3 free + 3 locked
          lessons.beginner = Array.isArray(data) ? data.slice(0, 6) : [];
        }
        
        if (vocabRes.ok) {
          const data = await vocabRes.json();
          // Get 6 lessons from different band levels for variety (3 free + 3 locked)
          const foundation = data.filter(l => l.band_level === 'foundation').slice(0, 2);
          const development = data.filter(l => l.band_level === 'development').slice(0, 2);
          const advanced = data.filter(l => l.band_level === 'advanced').slice(0, 2);
          lessons['vocab-grammar'] = [...foundation, ...development, ...advanced];
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
      <section className="py-20 px-6 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              {t('landingCompareTitle')}
            </h2>
            <p className="text-lg text-gray-400">{t('landingCompareDesc')}</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Traditional Methods */}
            <Card className="p-6 bg-gray-800 border border-gray-700 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                  <Users className="w-5 h-5 text-gray-300" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{t('landingTraditional')}</h3>
                  <span className="text-xs text-gray-400">{t('landingTraditionalSub')}</span>
                </div>
              </div>
              <ul className="space-y-3 mb-6">
                {[t('landingTradItem1'), t('landingTradItem2'), t('landingTradItem3'), t('landingTradItem4'), t('landingTradItem5')].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-300 text-sm">
                    <XCircle className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-4 border-t border-gray-700">
                <p className="text-gray-400 text-xs">{t('landingTraditionalBestFor')}</p>
              </div>
            </Card>

            {/* Other AI Platforms */}
            <Card className="p-6 bg-gray-800 border border-gray-700 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{t('landingOtherAI')}</h3>
                  <span className="text-xs text-gray-400">{t('landingOtherAISub')}</span>
                </div>
              </div>
              <ul className="space-y-3 mb-6">
                {[
                  { text: t('landingOtherAIItem1'), good: true },
                  { text: t('landingOtherAIItem2'), good: false },
                  { text: t('landingOtherAIItem3'), good: false },
                  { text: t('landingOtherAIItem4'), good: false },
                  { text: t('landingOtherAIItem5'), good: false }
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-300 text-sm">
                    {item.good ? (
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                    )}
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-4 border-t border-gray-700">
                <p className="text-gray-400 text-xs">{t('landingOtherAIBestFor')}</p>
              </div>
            </Card>

            {/* IELTS Ace */}
            <Card className="p-6 bg-gradient-to-br from-violet-600/20 to-purple-600/20 border-2 border-violet-500 rounded-2xl relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="px-3 py-1 bg-violet-500 text-white text-xs font-bold rounded-full">{t('landingRecommended')}</span>
              </div>
              <div className="flex items-center gap-3 mb-6 mt-2">
                <div className="w-10 h-10 rounded-full bg-violet-500 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{t('landingIELTSAce')}</h3>
                  <span className="text-xs text-violet-300">{t('landingIELTSAceSub')}</span>
                </div>
              </div>
              <ul className="space-y-3 mb-6">
                {[t('landingAceItem1'), t('landingAceItem2'), t('landingAceItem3'), t('landingAceItem4'), t('landingAceItem5')].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-white text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-4 border-t border-violet-500/30">
                <p className="text-violet-200 text-xs">{t('landingIELTSAceBestFor')}</p>
              </div>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <p className="text-xl text-gray-300 italic">
              "{t('landingQuote1')}<br/>
              <span className="text-white font-semibold">{t('landingQuote2')}</span>"
            </p>
          </div>
        </div>
      </section>

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
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-sm font-medium mb-6">
                <Eye className="w-4 h-4" />
                {t('landingHowAIWorks')}
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                {t('landingHowAIWorksTitle')}
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                {t('landingHowAIWorksDesc')}
              </p>
              
              <div className="space-y-4">
                {[
                  { num: '1', title: t('landingAIStep1'), desc: t('landingAIStep1Desc') },
                  { num: '2', title: t('landingAIStep2'), desc: t('landingAIStep2Desc') },
                  { num: '3', title: t('landingAIStep3'), desc: t('landingAIStep3Desc') },
                  { num: '4', title: t('landingAIStep4'), desc: t('landingAIStep4Desc') }
                ].map((step, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">{step.num}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{step.title}</h4>
                      <p className="text-sm text-gray-600">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-amber-800 text-sm">
                  <strong>{t('landingKeyRule')}</strong> {t('landingKeyRuleDesc')}
                  <span className="block mt-1 text-amber-600">{t('landingKeyRuleDesc2')}</span>
                </p>
              </div>
            </div>

            {/* Screenshot Preview */}
            <div className="relative">
              <div className="bg-gradient-to-br from-violet-100 to-purple-100 rounded-2xl p-6 shadow-xl">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="p-4 border-b bg-gradient-to-r from-violet-50 to-purple-50">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-violet-600" />
                      <span className="font-semibold text-gray-900">AI Evaluation Result</span>
                    </div>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Overall Band</span>
                      <span className="text-2xl font-bold text-violet-600">5.5</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="p-2 bg-gray-50 rounded-lg">
                        <span className="text-gray-500">Task Achievement</span>
                        <span className="block font-semibold">5.0</span>
                      </div>
                      <div className="p-2 bg-gray-50 rounded-lg">
                        <span className="text-gray-500">Coherence</span>
                        <span className="block font-semibold">5.5</span>
                      </div>
                      <div className="p-2 bg-gray-50 rounded-lg">
                        <span className="text-gray-500">Vocabulary</span>
                        <span className="block font-semibold">6.0</span>
                      </div>
                      <div className="p-2 bg-gray-50 rounded-lg">
                        <span className="text-gray-500">Grammar</span>
                        <span className="block font-semibold">5.5</span>
                      </div>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                      <p className="text-sm text-red-800 font-medium">Main Limiting Factor:</p>
                      <p className="text-sm text-red-600">Response does not fully address all parts of the question.</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-sm text-blue-800 font-medium">Next Step:</p>
                      <p className="text-sm text-blue-600">Focus on task response strategies in Module 2.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              {getText('Choose Your Learning Plan', 'Chọn gói học tập', 'Öğrenme Planınızı Seçin')}
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              {getText('Start free with Stage 1. Upgrade anytime to unlock more.', 'Bắt đầu miễn phí với Giai đoạn 1.', 'Stage 1 ile ücretsiz başlayın. Daha fazlası için yükseltin.')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { name: 'Explorer', price: '$4.99', period: '/mo', color: 'from-sky-500 to-blue-600', border: 'border-sky-500/30', features: [
                getText('All 8 Learning Stages', 'Tất cả 8 giai đoạn', 'Tüm 8 Öğrenme Aşaması'),
                getText('Vocabulary & grammar games', 'Trò chơi từ vựng', 'Kelime & dilbilgisi oyunları'),
                getText('Listening & reading', 'Nghe & đọc', 'Dinleme & okuma'),
                getText('1 AI Speaking test/mo', '1 bài kiểm tra nói AI', '1 AI Konuşma testi/ay'),
              ]},
              { name: 'Learner', price: '$9', period: '/mo', color: 'from-violet-500 to-purple-600', border: 'border-violet-500/30', features: [
                getText('Everything in Explorer', 'Tất cả trong Explorer', 'Explorer dahil'),
                getText('Liz AI Teacher', 'Giáo viên AI Liz', 'Liz AI Öğretmen'),
                getText('Mastery Course (IELTS)', 'Khóa Mastery', 'Mastery Kursu (IELTS)'),
                getText('5 AI Speaking tests/mo', '5 bài kiểm tra nói AI', '5 AI Konuşma testi/ay'),
              ]},
              { name: 'Achiever', price: '$19', period: '/mo', color: 'from-amber-500 to-orange-600', border: 'border-amber-400/40', highlight: true, features: [
                getText('Everything in Learner', 'Tất cả trong Learner', 'Learner dahil'),
                getText('Advanced Mastery', 'Mastery nâng cao', 'İleri Mastery'),
                getText('Unlimited Speaking tests', 'Không giới hạn nói', 'Sınırsız Konuşma testi'),
                getText('Unlimited Liz messages', 'Tin nhắn Liz không giới hạn', 'Sınırsız Liz mesajı'),
              ]},
              { name: 'Master', price: '$29', period: '/mo', color: 'from-rose-500 to-red-600', border: 'border-rose-500/30', features: [
                getText('Everything in Achiever', 'Tất cả trong Achiever', 'Achiever dahil'),
                getText('AI Speaking Agent', 'Tác nhân nói AI', 'AI Konuşma Ajanı'),
                getText('Full mock exam mode', 'Chế độ thi thử', 'Tam sınav modu'),
                getText('Priority support', 'Hỗ trợ ưu tiên', 'Öncelikli destek'),
              ]},
            ].map((plan, idx) => (
              <div
                key={idx}
                className={`relative bg-gray-900/80 border rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-2xl ${plan.highlight ? 'ring-2 ring-amber-400/60 ' + plan.border : 'border-gray-800'}`}
              >
                {plan.highlight && <div className="absolute -top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-t-2xl" />}
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-3`}>
                  {idx === 0 ? <Target className="w-5 h-5 text-white" /> : idx === 1 ? <BookOpen className="w-5 h-5 text-white" /> : idx === 2 ? <Award className="w-5 h-5 text-white" /> : <Trophy className="w-5 h-5 text-white" />}
                </div>
                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                <div className="mt-1 mb-4">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-500 text-sm">{plan.period}</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f, fi) => (
                    <li key={fi} className="flex items-start gap-2 text-sm text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => { setShowAuth(true); setIsLogin(false); }}
                  className={`w-full bg-gradient-to-r ${plan.color} text-white border-0 hover:opacity-90`}
                  data-testid={`landing-plan-${plan.name.toLowerCase()}`}
                >
                  {getText('Get Started', 'Bắt đầu', 'Başla')}
                </Button>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-500 text-sm mt-6">
            {getText('Stage 1 is always free. No credit card required.', 'Giai đoạn 1 luôn miễn phí.', 'Stage 1 her zaman ücretsiz. Kredi kartı gerekmez.')}
          </p>
        </div>
      </section>

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
      <Dialog open={showCourseSelector} onOpenChange={setShowCourseSelector}>
        <DialogContent className="bg-white border-gray-200 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-gray-900 flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-violet-600" />
              {t('landingChooseCourse')}
            </DialogTitle>
          </DialogHeader>
          
          <p className="text-gray-600 mb-6">{t('landingChooseCourseDesc')}</p>
          
          <div className="space-y-6">
            {COURSES.map((course) => {
              const lessons = courseLessons[course.id] || [];
              const courseName = language === 'vi' ? course.nameVi : language === 'tr' ? course.nameTr : course.name;
              const courseDesc = language === 'vi' ? course.descriptionVi : language === 'tr' ? course.descriptionTr : course.description;
              return (
                <Card key={course.id} className={`p-6 ${course.lightBg} border-0 rounded-2xl`}>
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${course.color} flex items-center justify-center shadow-lg text-2xl`}>
                      {course.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-xl font-bold text-gray-900">
                          {courseName}
                        </h3>
                        <span className="px-3 py-1 bg-white rounded-full text-sm font-bold text-gray-700 shadow-sm">
                          {course.bandRange}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        {courseDesc}
                      </p>
                    </div>
                  </div>
                  
                  {lessons.length > 0 ? (
                    <div className="grid sm:grid-cols-3 gap-3">
                      {lessons.map((lesson, idx) => {
                        const isLocked = idx >= 3;
                        const lockText = {
                          en: 'Sign up to unlock',
                          vi: 'Đăng ký để mở khóa',
                          tr: 'Açmak için kayıt olun'
                        };
                        
                        return (
                          <Card
                            key={lesson.id || idx}
                            onClick={() => {
                              if (isLocked) {
                                // Show signup prompt for locked lessons
                                setShowCourseSelector(false);
                                navigate('/?signup=true');
                                return;
                              }
                              setShowCourseSelector(false);
                              // Navigate directly to the real course page with lesson parameter
                              if (course.id === 'vocab-grammar') {
                                navigate(`/vocab-grammar?lesson=${lesson.id}&preview=true`);
                              } else if (course.id === 'beginner') {
                                navigate(`/beginner-course?lesson=${lesson.id}&preview=true`);
                              } else if (course.id === 'mastery') {
                                navigate(`/mastery-course?lesson=${lesson.module_number || idx + 1}&preview=true`);
                              } else if (course.id === 'advanced') {
                                navigate(`/advanced-mastery?lesson=${lesson.id || lesson.module_number || idx + 1}&preview=true`);
                              } else {
                                navigate(`${course.previewRoute}?preview=true`);
                              }
                            }}
                            className={`p-4 border-0 shadow-sm transition-all rounded-xl relative ${
                              isLocked 
                                ? 'bg-gray-100 cursor-pointer hover:bg-gray-200 opacity-75' 
                                : 'bg-white hover:shadow-lg cursor-pointer hover:-translate-y-1'
                            }`}
                          >
                            {/* Lock overlay for locked lessons */}
                            {isLocked && (
                              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/5 rounded-xl">
                                <div className="flex flex-col items-center">
                                  <svg className="w-6 h-6 text-gray-500 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                  </svg>
                                  <span className="text-xs font-medium text-gray-600">{lockText[language] || lockText.en}</span>
                                </div>
                              </div>
                            )}
                            <div className="flex items-center gap-2 mb-2">
                              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${isLocked ? 'from-gray-400 to-gray-500' : course.color} flex items-center justify-center text-white font-bold text-sm`}>
                                {lesson.module_number || lesson.unit_number || idx + 1}
                              </div>
                              {!isLocked && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                  {t('landingFreePreview')}
                                </span>
                              )}
                            </div>
                            <h4 className={`font-semibold text-sm truncate ${isLocked ? 'text-gray-500' : 'text-gray-900'}`}>
                              {lesson.title || lesson.topic || `Lesson ${idx + 1}`}
                            </h4>
                            <p className="text-xs text-gray-500 truncate mt-1">
                              {lesson.subtitle || lesson.description || lesson.band_level || ''}
                            </p>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      {t('loading')}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
          
          <div className="mt-6 p-4 bg-violet-50 rounded-xl border border-violet-200">
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6 text-violet-600" />
              <div>
                <p className="text-violet-800 font-medium">{t('landingMoreLessonsAvailable')}</p>
                <p className="text-violet-600 text-sm">{t('landingSignUpForMore')}</p>
              </div>
              <Button 
                onClick={() => { setShowCourseSelector(false); setShowAuth(true); }}
                className="ml-auto bg-violet-600 hover:bg-violet-700 text-white"
              >
                {t('getStarted')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Auth Dialog */}
      <Dialog open={showAuth} onOpenChange={setShowAuth}>
        <DialogContent data-testid="auth-dialog" className="bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-2xl text-gray-900">
              {authMode === 'signup' ? t('landingCreateAccount') : t('landingWelcomeBack')}
            </DialogTitle>
          </DialogHeader>
          
          {authMode === 'signup' && (
            <>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 py-5" 
                disabled={loading || processingSocial} 
                onClick={() => { window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(window.location.origin)}`; }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                {t('landingSignUpGoogle')}
              </Button>
              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400">{t('landingSignUpEmail')}</span></div>
              </div>
            </>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {authMode === 'signup' && (
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Name</label>
                <Input data-testid="name-input" type="text" placeholder={t('landingEnterName')} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required={authMode === 'signup'} className="border-gray-300" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Email</label>
              <Input data-testid="email-input" type="email" placeholder={t('landingEnterEmail')} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required className="border-gray-300" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Password</label>
              <div className="relative">
                <Input 
                  data-testid="password-input" 
                  type={showPassword ? "text" : "password"} 
                  placeholder={authMode === 'signup' ? t('landingCreatePassword') : t('landingEnterPassword')} 
                  value={formData.password} 
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                  required 
                  minLength={8} 
                  className="border-gray-300 pr-10" 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {authMode === 'signup' && (
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Confirm Password</label>
                <div className="relative">
                  <Input 
                    data-testid="confirm-password-input" 
                    type={showConfirmPassword ? "text" : "password"} 
                    placeholder="Re-enter your password" 
                    value={formData.confirmPassword} 
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} 
                    required 
                    minLength={8} 
                    className={`border-gray-300 pr-10 ${formData.confirmPassword && formData.password !== formData.confirmPassword ? 'border-red-300 focus:ring-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
                {formData.confirmPassword && formData.password === formData.confirmPassword && formData.password.length >= 8 && (
                  <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Passwords match
                  </p>
                )}
              </div>
            )}
            {authMode === 'signin' && (
              <div className="text-right text-xs">
                <button type="button" className="text-violet-600 hover:underline" onClick={async () => {
                  if (!formData.email) { toast.error('Please enter your email first'); return; }
                  try {
                    const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/forgot-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: formData.email }) });
                    if (!res.ok) throw new Error('Reset failed');
                    toast.success('Reset link sent to your email.');
                  } catch (err) { toast.error('Failed to send reset link.'); }
                }}>{t('landingForgotPassword')}</button>
              </div>
            )}
            
            {authMode === 'signup' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">{t('landingEmailWarning')}</p>
              </div>
            )}
            
            <Button data-testid="submit-auth-btn" type="submit" className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0" disabled={loading || (authMode === 'signup' && formData.password !== formData.confirmPassword)}>
              {loading ? t('loading') : authMode === 'signup' ? t('landingCreateAccount') : t('landingSignIn')}
            </Button>
          </form>
          <div className="text-center text-sm text-gray-500">
            <button onClick={() => setAuthMode(authMode === 'signup' ? 'signin' : 'signup')} className="text-violet-600 hover:underline">
              {authMode === 'signup' ? t('landingAlreadyAccount') : t('landingNeedAccount')}
            </button>
          </div>
          
          {authMode === 'signin' && (
            <>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400">{t('landingContinueWith')}</span></div>
              </div>
              <Button type="button" variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2" disabled={loading || processingSocial} onClick={() => { window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(window.location.origin)}`; }}>
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                {t('landingContinueGoogle')}
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>

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
