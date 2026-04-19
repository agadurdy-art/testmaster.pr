import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { 
  BookOpen, Headphones, Mic, PenTool, Trophy, TrendingUp, Target, BookMarked, 
  LogOut, Menu, MessageSquare, ChevronRight, Clock, Award, Sparkles, 
  GraduationCap, BarChart3, Flame, Star, X, User, Zap, LayoutDashboard, FileText, CreditCard,
  Play, ArrowRight, History, Lightbulb, CheckCircle, Mail, HelpCircle, Lock, Gamepad2, AlertTriangle
} from 'lucide-react';
import { getTests, getUserProgress, getUser } from '../lib/api';
import { toast } from 'sonner';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useI18n } from '../lib/i18n';
import SkillBreakdown from '../components/SkillBreakdown';
import VerificationBanner, { LockedContentModal, canAccessFeature } from '../components/VerificationBanner';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme, THEME_MODES } from '../contexts/ThemeContext';
import FeedbackModal from '../components/FeedbackModal';
import UsageMeter from '../components/UsageMeter';
import SubscriptionCard from '../components/SubscriptionCard';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const SUPPORT_EMAIL = 'support@testmaster.pro';

// Days between today (UTC) and an ISO YYYY-MM-DD exam date. Returns null when
// the date is missing / unparseable; negative numbers mean the exam has passed.
function daysUntilExam(isoDate) {
  if (!isoDate) return null;
  const exam = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(exam.getTime())) return null;
  const today = new Date();
  const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return Math.round((exam.getTime() - todayUtc) / 86400000);
}

// Personalized welcome subtitle. Uses onboarding fields (target_band,
// exam_date, learning_mode) when available and falls back to the generic
// IELTS copy otherwise, so users who signed up before onboarding launched
// still see something sensible.
function buildWelcomeSubtitle(profile, getText) {
  const mode = profile?.learning_mode;
  const targetBand = profile?.target_band;
  const days = daysUntilExam(profile?.exam_date);

  // Mode-aware base line
  const baseIelts = getText(
    'Continue your IELTS preparation journey',
    'Tiếp tục hành trình IELTS của bạn',
    'IELTS hazırlık yolculuğunuza devam edin'
  );
  const baseGeneral = getText(
    'Continue building your English, one session at a time',
    'Tiếp tục cải thiện tiếng Anh của bạn',
    'İngilizcenizi adım adım geliştirmeye devam edin'
  );
  const parts = [];

  if (mode === 'general_english') {
    parts.push(baseGeneral);
  } else if (targetBand) {
    parts.push(
      getText(
        `Targeting Band ${targetBand}`,
        `Mục tiêu Band ${targetBand}`,
        `Hedef Band ${targetBand}`
      )
    );
  } else {
    parts.push(baseIelts);
  }

  if (typeof days === 'number') {
    if (days > 0) {
      parts.push(
        getText(
          `${days} day${days === 1 ? '' : 's'} until your exam`,
          `Còn ${days} ngày đến kỳ thi`,
          `Sınavına ${days} gün kaldı`
        )
      );
    } else if (days === 0) {
      parts.push(
        getText('Exam day — you\'ve got this.', 'Ngày thi — bạn làm được!', 'Sınav günü — başaracaksın!')
      );
    }
  }

  return parts.join(' · ');
}

export default function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const { t, language } = useI18n();
  const { activeTheme } = useTheme();
  const isDark = activeTheme === THEME_MODES.DARK;
  const isNightShift = activeTheme === THEME_MODES.NIGHT_SHIFT;
  
  const [tests, setTests] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState(user);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [continueData, setContinueData] = useState(null);
  
  // Verification modal state - must be at top level
  const [showLockedModal, setShowLockedModal] = useState(false);
  const [lockedFeatureName, setLockedFeatureName] = useState('');
  
  // Feedback modal state
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackType, setFeedbackType] = useState('feedback');
  
  // Theme-aware class helpers
  const bgMain = isDark ? 'bg-gray-900' : isNightShift ? 'bg-amber-50' : 'bg-gradient-to-br from-slate-50 to-purple-50';
  const bgCard = isDark ? 'bg-gray-800 border-gray-700' : isNightShift ? 'bg-amber-100/50 border-amber-200' : 'bg-white border-gray-200';
  const textPrimary = isDark ? 'text-gray-100' : isNightShift ? 'text-amber-900' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : isNightShift ? 'text-amber-700' : 'text-gray-600';
  const bgHeader = isDark ? 'bg-gray-800/95 border-gray-700' : isNightShift ? 'bg-amber-100/95 border-amber-200' : 'bg-white/80 border-gray-100';

  useEffect(() => { loadData(); }, [user.id]);

  const loadData = async () => {
    try {
      const [testsData, progressData, freshUser] = await Promise.all([getTests(), getUserProgress(user.id), getUser(user.id)]);
      setTests(testsData);
      setProgress(progressData);
      if (freshUser) { setUserDetails(freshUser); localStorage.setItem('user', JSON.stringify(freshUser)); }
      
      // Determine "Continue Learning" suggestion
      determineContinueSuggestion(progressData);
    } catch (error) { toast.error('Failed to load dashboard data'); }
    finally { setLoading(false); }
  };

  // Translation helper for inline texts
  const getText = (en, vi, tr) => {
    if (language === 'vi') return vi;
    if (language === 'tr') return tr;
    return en;
  };

  const determineContinueSuggestion = (progressData) => {
    // Logic to suggest what to do next based on user's progress
    if (!progressData || progressData.total_tests === 0) {
      setContinueData({
        type: 'start',
        title: getText('Start Your IELTS Journey', 'Bắt đầu hành trình IELTS', 'IELTS Yolculuğunuza Başlayın'),
        description: getText('Take a level test to determine your starting point', 'Làm bài kiểm tra trình độ để xác định điểm xuất phát', 'Başlangıç noktanızı belirlemek için seviye testi yapın'),
        action: () => navigate('/level-test'),
        actionLabel: getText('Take Level Test', 'Kiểm tra trình độ', 'Seviye Testi Yap'),
        icon: Target,
        color: 'from-cyan-500 to-blue-600'
      });
      return;
    }

    const recentAttempts = progressData.recent_attempts || [];
    const lastAttempt = recentAttempts[0];
    
    // Find weakest skill
    const skillScores = {};
    recentAttempts.forEach(a => {
      if (!skillScores[a.test_type]) skillScores[a.test_type] = [];
      if (typeof a.band_score === 'number') skillScores[a.test_type].push(a.band_score);
    });
    
    let weakestSkill = null;
    let lowestAvg = 10;
    Object.entries(skillScores).forEach(([skill, scores]) => {
      if (scores.length > 0) {
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        if (avg < lowestAvg) {
          lowestAvg = avg;
          weakestSkill = skill;
        }
      }
    });

    // Skill name translations
    const skillNames = {
      reading: getText('Reading', 'Đọc', 'Okuma'),
      listening: getText('Listening', 'Nghe', 'Dinleme'),
      writing: getText('Writing', 'Viết', 'Yazma'),
      speaking: getText('Speaking', 'Nói', 'Konuşma')
    };

    // Suggest based on last activity and weakest skill
    if (lastAttempt && weakestSkill) {
      const skillConfig = {
        reading: { icon: BookOpen, color: 'from-blue-500 to-indigo-600', route: '/test/reading' },
        listening: { icon: Headphones, color: 'from-purple-500 to-violet-600', route: '/test/listening' },
        writing: { icon: PenTool, color: 'from-orange-500 to-amber-600', route: '/writing-practice' },
        speaking: { icon: Mic, color: 'from-emerald-500 to-teal-600', route: '/speaking-practice' }
      };
      
      const config = skillConfig[weakestSkill] || skillConfig.reading;
      const skillName = skillNames[weakestSkill] || weakestSkill;
      
      setContinueData({
        type: 'improve',
        title: getText(`Improve Your ${skillName}`, `Cải thiện kỹ năng ${skillName}`, `${skillName} Becerinizi Geliştirin`),
        description: getText(
          `Your current average: Band ${lowestAvg.toFixed(1)}. Let's practice more!`,
          `Điểm trung bình hiện tại: Band ${lowestAvg.toFixed(1)}. Hãy luyện tập thêm!`,
          `Mevcut ortalamanız: Band ${lowestAvg.toFixed(1)}. Daha fazla pratik yapalım!`
        ),
        action: () => navigate(config.route),
        actionLabel: getText('Continue Practice', 'Tiếp tục luyện tập', 'Pratiğe Devam Et'),
        icon: config.icon,
        color: config.color,
        lastAttempt: lastAttempt
      });
    } else {
      // No clear weakness, suggest taking a test
      setContinueData({
        type: 'explore',
        title: getText('Continue Practicing', 'Tiếp tục luyện tập', 'Pratik Yapmaya Devam Et'),
        description: getText('Choose a skill to practice today', 'Chọn một kỹ năng để luyện tập hôm nay', 'Bugün pratik yapmak için bir beceri seçin'),
        action: () => navigate('/test/reading'),
        actionLabel: getText('Take a Test', 'Làm bài kiểm tra', 'Test Yap'),
        icon: GraduationCap,
        color: 'from-violet-500 to-purple-600'
      });
    }
  };

  const testModules = [
    { type: 'reading', icon: BookOpen, title: getText('Reading', 'Đọc', 'Okuma'), description: '60 min • 40 questions', color: 'bg-blue-500', lightBg: 'bg-blue-50', shadow: 'shadow-blue-100' },
    { type: 'listening', icon: Headphones, title: getText('Listening', 'Nghe', 'Dinleme'), description: '40 min • 40 questions', color: 'bg-purple-500', lightBg: 'bg-purple-50', shadow: 'shadow-purple-100' },
    { type: 'writing', icon: PenTool, title: getText('Writing', 'Viết', 'Yazma'), description: '60 min • 2 tasks', color: 'bg-orange-500', lightBg: 'bg-orange-50', shadow: 'shadow-orange-100' },
    { type: 'speaking', icon: Mic, title: getText('Speaking', 'Nói', 'Konuşma'), description: '15 min • AI interview', color: 'bg-emerald-500', lightBg: 'bg-emerald-50', shadow: 'shadow-emerald-100' }
  ];

  const courses = [
    { id: 'beginner', name: getText('Beginner Course', 'Khóa Cơ bản', 'Başlangıç Kursu'), band: 'Band 2.0-4.5', icon: '🌱', color: 'from-emerald-500 to-teal-600', route: '/beginner-course', lessons: 14 },
    { id: 'mastery', name: getText('Mastery Course', 'Khóa Trung cấp', 'Ustalık Kursu'), band: 'Band 4.5-6.5', icon: '📚', color: 'from-blue-500 to-indigo-600', route: '/mastery-course', lessons: 17 },
    { id: 'advanced', name: getText('Advanced Mastery', 'Khóa Nâng cao', 'İleri Düzey Ustalık'), band: 'Band 6.5-9.0', icon: '🏆', color: 'from-amber-500 to-orange-600', route: '/advanced-mastery', lessons: 20 }
  ];

  const allLearningTools = [
    { name: getText('Question Bank', 'Ngân hàng câu hỏi', 'Soru Bankası'), icon: LayoutDashboard, color: 'from-indigo-500 to-purple-600', route: '/question-bank', badge: 'NEW', ieltsOnly: true },
    { name: getText('Vocab & Grammar', 'Từ vựng & Ngữ pháp', 'Kelime & Dilbilgisi'), icon: BookMarked, color: 'from-emerald-500 to-teal-600', route: '/vocab-grammar' },
    { name: getText('Writing Practice', 'Luyện viết', 'Yazma Pratiği'), icon: FileText, color: 'from-orange-500 to-amber-600', route: '/writing-practice' },
    { name: getText('Speaking Practice', 'Luyện nói', 'Konuşma Pratiği'), icon: MessageSquare, color: 'from-violet-500 to-purple-600', route: '/speaking-practice', requiredPlan: 'Speaking Practice' },
    { name: getText('Tips & Strategies', 'Mẹo & Chiến lược', 'İpuçları & Stratejiler'), icon: Lightbulb, color: 'from-pink-500 to-rose-600', route: '/tips', ieltsOnly: true }
  ];
  // Filter IELTS-specific tools out for General English mode. Unknown / null
  // mode (pre-onboarding users) sees the full set — safer default.
  const learningMode = userDetails?.learning_mode || user?.learning_mode || null;
  const learningTools = learningMode === 'general_english'
    ? allLearningTools.filter((t) => !t.ieltsOnly)
    : allLearningTools;

  const startTest = (testType) => { navigate(`/test/${testType}`); };

  if (loading) {
    return (
      <div className={`min-h-screen ${bgMain} flex items-center justify-center transition-colors duration-300`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={textSecondary}>{getText('Loading dashboard...', 'Đang tải...', 'Gösterge paneli yükleniyor...')}</p>
        </div>
      </div>
    );
  }

  const hasProgress = !!(progress && progress.total_tests > 0);
  const skillOrder = ['listening', 'reading', 'writing', 'speaking'];
  let perSkillStats = {};
  let totalTimeSeconds = 0;
  
  // Check if user is verified
  const isVerified = user?.verified || user?.email_verified;
  const userPlan = user?.plan || 'free';
  
  // Plan-based feature access check
  const PLAN_TIER = { free: 0, explorer: 1, learner: 2, achiever: 3, master: 4 };
  const FEATURE_MIN_PLAN = {
    'Learning Stages': 'explorer',
    'Liz AI Teacher': 'learner',
    'Mastery Course': 'learner',
    'Advanced Mastery': 'achiever',
    'Speaking Practice': 'explorer',
  };
  
  const canAccessByPlan = (featureName) => {
    const minPlan = FEATURE_MIN_PLAN[featureName];
    if (!minPlan) return true;
    return (PLAN_TIER[userPlan] || 0) >= (PLAN_TIER[minPlan] || 0);
  };
  
  // Handler for locked content
  const handleLockedContent = (featureName) => {
    if (!isVerified) {
      setLockedFeatureName(featureName);
      setShowLockedModal(true);
      return true;
    }
    if (!canAccessByPlan(featureName)) {
      navigate(`/pricing?from=${encodeURIComponent(featureName)}`);
      return true;
    }
    return false;
  };

  if (hasProgress && Array.isArray(progress.recent_attempts)) {
    const bySkill = {};
    progress.recent_attempts.forEach((attempt) => {
      const band = typeof attempt.band_score === 'number' ? attempt.band_score : 0;
      const type = attempt.test_type;
      if (typeof attempt.time_taken === 'number') totalTimeSeconds += attempt.time_taken;
      if (skillOrder.includes(type)) {
        if (!bySkill[type]) bySkill[type] = { sum: 0, count: 0, best: 0 };
        bySkill[type].sum += band;
        bySkill[type].count += 1;
        if (band > bySkill[type].best) bySkill[type].best = band;
      }
    });
    skillOrder.forEach((skill) => {
      const stat = bySkill[skill];
      perSkillStats[skill] = !stat || stat.count === 0 ? { avg: null, count: 0, best: null } : { avg: Math.round((stat.sum / stat.count) * 10) / 10, count: stat.count, best: stat.best };
    });
  }

  const totalHours = Math.floor(totalTimeSeconds / 3600);
  const totalMinutes = Math.round((totalTimeSeconds % 3600) / 60);

  return (
    <div className={`min-h-screen ${bgMain} transition-colors duration-300`}>
      {/* Verification Banner for Unverified Users */}
      {!isVerified && <VerificationBanner user={user} />}
      
      {/* Locked Content Modal */}
      <LockedContentModal 
        isOpen={showLockedModal} 
        onClose={() => setShowLockedModal(false)} 
        user={user}
        featureName={lockedFeatureName}
      />
      
      {/* Header */}
      <header className={`sticky top-0 z-50 ${bgHeader} backdrop-blur-xl border-b shadow-sm transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-200">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">IELTS Ace</h1>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full">🧪 Beta</span>
              </div>
            </div>
          </div>
          
          <nav className="flex items-center space-x-2">
            <ThemeToggle />
            <LanguageSwitcher compact />
            <div className="hidden md:flex items-center space-x-1">
              <Button variant="ghost" onClick={() => navigate('/progress')} className={`${textSecondary} hover:text-violet-600 ${isDark ? 'hover:bg-violet-900/30' : 'hover:bg-violet-50'}`}>
                <BarChart3 className="w-4 h-4 mr-2" />{getText('Progress', 'Tiến độ', 'İlerleme')}
              </Button>
              <Button variant="ghost" onClick={() => navigate('/pricing')} className={`${textSecondary} hover:text-violet-600 ${isDark ? 'hover:bg-violet-900/30' : 'hover:bg-violet-50'}`}>{t('navPricing')}</Button>
              <Button 
                variant="ghost" 
                onClick={() => window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('IELTS Ace - Support Request')}&body=${encodeURIComponent(`Hi IELTS Ace Team,\n\nUser: ${user.name}\nEmail: ${user.email}\n\nMy question/issue:\n\n`)}`}
                className={`${textSecondary} hover:text-emerald-600 ${isDark ? 'hover:bg-emerald-900/30' : 'hover:bg-emerald-50'}`}
              >
                <Mail className="w-4 h-4 mr-2" />{getText('Contact', 'Liên hệ', 'İletişim')}
              </Button>
              <Button variant="ghost" onClick={() => navigate('/profile')} className={`${textSecondary} hover:text-violet-600 ${isDark ? 'hover:bg-violet-900/30' : 'hover:bg-violet-50'}`}>
                <User className="w-4 h-4 mr-2" />{user.name}
              </Button>
              <Button variant="ghost" onClick={onLogout} className={`text-red-500 hover:text-red-600 ${isDark ? 'hover:bg-red-900/30' : 'hover:bg-red-50'}`}>
                <LogOut className="w-4 h-4 mr-2" />{t('navLogout')}
              </Button>
            </div>
            <button type="button" className={`md:hidden p-2 rounded-lg border ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : isNightShift ? 'border-amber-200 text-amber-700 hover:bg-amber-100' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </nav>
        </div>

        {mobileMenuOpen && (
          <div className={`md:hidden border-t ${isDark ? 'border-gray-700 bg-gray-800' : isNightShift ? 'border-amber-200 bg-amber-50' : 'border-gray-100 bg-white'} shadow-lg`}>
            <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
              <Button variant="ghost" className={`w-full justify-start ${textSecondary} font-medium`} onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }}>
                <LayoutDashboard className="w-4 h-4 mr-3" />{getText('Dashboard', 'Bảng điều khiển', 'Gösterge Paneli')}
              </Button>
              <Button variant="ghost" className={`w-full justify-start ${textSecondary}`} onClick={() => { navigate('/progress'); setMobileMenuOpen(false); }}>
                <BarChart3 className="w-4 h-4 mr-3" />{getText('Progress', 'Tiến độ', 'İlerleme')}
              </Button>
              {learningMode !== 'general_english' && (
                <>
                  <hr className={`my-2 ${isDark ? 'border-gray-700' : isNightShift ? 'border-amber-200' : 'border-gray-200'}`} />
                  <p className={`text-xs ${textSecondary} px-3 py-1`}>{getText('Tests', 'Bài kiểm tra', 'Testler')}</p>
                  {testModules.map((m) => (
                    <Button key={m.type} variant="ghost" className={`w-full justify-start ${textSecondary}`} onClick={() => { startTest(m.type); setMobileMenuOpen(false); }}>
                      <m.icon className="w-4 h-4 mr-3" />{m.title}
                    </Button>
                  ))}
                </>
              )}
              <hr className={`my-2 ${isDark ? 'border-gray-700' : isNightShift ? 'border-amber-200' : 'border-gray-200'}`} />
              <p className={`text-xs ${textSecondary} px-3 py-1`}>{getText('Courses', 'Khóa học', 'Kurslar')}</p>
              <Button variant="ghost" className={`w-full justify-start text-blue-600 font-semibold`} onClick={() => { navigate('/unified'); setMobileMenuOpen(false); }}>
                <GraduationCap className="w-4 h-4 mr-3" />{getText('Learning Path', 'Lộ trình học', 'Öğrenme Yolu')}
              </Button>
              {courses.map((c) => (
                <Button key={c.id} variant="ghost" className={`w-full justify-start ${textSecondary}`} onClick={() => { navigate(c.route); setMobileMenuOpen(false); }}>
                  <span className="mr-3">{c.icon}</span>{c.name}
                </Button>
              ))}
              <hr className={`my-2 ${isDark ? 'border-gray-700' : isNightShift ? 'border-amber-200' : 'border-gray-200'}`} />
              <p className={`text-xs ${textSecondary} px-3 py-1`}>{getText('Account', 'Tài khoản', 'Hesap')}</p>
              <Button variant="ghost" className={`w-full justify-start ${textSecondary}`} onClick={() => { navigate('/pricing'); setMobileMenuOpen(false); }}>
                <CreditCard className="w-4 h-4 mr-3" />{getText('Pricing', 'Giá cả', 'Fiyatlandırma')}
              </Button>
              <Button variant="ghost" className={`w-full justify-start ${textSecondary}`} onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }}>
                <User className="w-4 h-4 mr-3" />{getText('Profile', 'Hồ sơ', 'Profil')}
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-emerald-600" 
                onClick={() => {
                  window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('IELTS Ace - Support Request')}&body=${encodeURIComponent(`Hi IELTS Ace Team,\n\nUser: ${user.name}\nEmail: ${user.email}\n\nMy question/issue:\n\n`)}`;
                  setMobileMenuOpen(false);
                }}
              >
                <Mail className="w-4 h-4 mr-3" />{getText('Contact Support', 'Liên hệ hỗ trợ', 'Destek ile İletişim')}
              </Button>
              <Button variant="ghost" className="w-full justify-start text-red-500" onClick={onLogout}>
                <LogOut className="w-4 h-4 mr-3" />{getText('Logout', 'Đăng xuất', 'Çıkış Yap')}
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24">
        
        {/* Welcome + Continue Section — personalized from onboarding */}
        <div className="mb-6">
          <h1 className={`text-2xl sm:text-3xl font-bold ${textPrimary} mb-1`}>
            {getText(
              `Welcome back, ${userDetails?.name?.split(' ')[0] || user.name?.split(' ')[0] || 'Student'}!`,
              `Chào mừng trở lại, ${userDetails?.name?.split(' ')[0] || user.name?.split(' ')[0] || 'Học viên'}!`,
              `Tekrar hoş geldin, ${userDetails?.name?.split(' ')[0] || user.name?.split(' ')[0] || 'Öğrenci'}!`
            )} 👋
          </h1>
          <p className={`${textSecondary} text-sm`}>
            {buildWelcomeSubtitle(userDetails || user, getText)}
          </p>
        </div>


        {/* Quick Stats Row - Always visible */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          {[
            { icon: BarChart3, label: getText('Tests', 'Bài thi', 'Testler'), value: progress?.total_tests || 0, color: 'text-blue-600', bg: isDark ? 'bg-blue-900/30' : 'bg-blue-50' },
            { icon: Award, label: getText('Avg Band', 'TB Band', 'Ort. Band'), value: progress?.average_band?.toFixed(1) || '-', color: 'text-purple-600', bg: isDark ? 'bg-purple-900/30' : 'bg-purple-50' },
            { icon: Flame, label: getText('Best', 'Cao nhất', 'En İyi'), value: progress?.best_band?.toFixed(1) || '-', color: 'text-orange-600', bg: isDark ? 'bg-orange-900/30' : 'bg-orange-50' },
            { icon: Zap, label: getText('Streak', 'Streak', 'Seri'), value: `${progress?.streak || 0}🔥`, color: 'text-red-600', bg: isDark ? 'bg-red-900/30' : 'bg-red-50' },
            { icon: Star, label: getText('Badges', 'Huy hiệu', 'Rozetler'), value: progress?.badges?.length || 0, color: 'text-amber-600', bg: isDark ? 'bg-amber-900/30' : 'bg-amber-50' }
          ].map((stat, idx) => (
            <Card key={idx} className={`p-3 ${stat.bg} border-0 rounded-xl text-center transition-colors duration-300`}>
              <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-1`} />
              <p className={`text-lg font-bold ${textPrimary}`}>{stat.value}</p>
              <p className={`text-xs ${textSecondary}`}>{stat.label}</p>
            </Card>
          ))}
        </div>


        <UsageMeter
          userId={user?.id}
          getText={getText}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          bgCard={bgCard}
        />

        <SubscriptionCard
          user={user}
          getText={getText}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          bgCard={bgCard}
        />

        {/* Continue Learning Card - Prominent CTA */}
        {continueData && (
          <Card 
            className={`p-5 mb-6 bg-gradient-to-r ${continueData.color} border-0 shadow-xl rounded-2xl cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}
            onClick={continueData.action}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                  <continueData.icon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Play className="w-4 h-4 text-white/80" />
                    <span className="text-white/80 text-xs font-medium uppercase tracking-wide">
                      {getText('Continue Learning', 'Tiếp tục học', 'Öğrenmeye Devam Et')}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white">{continueData.title}</h2>
                  <p className="text-white/80 text-sm">{continueData.description}</p>
                </div>
              </div>
              <Button className="bg-white/20 hover:bg-white/30 text-white border-0 hidden sm:flex">
                {continueData.actionLabel}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        )}


        {/* ── Section 1: Practice & Test ──
            Hidden for General English users — "Practice & Test" here means
            IELTS mock tests (60 min reading, 40 questions, etc.). GE users
            don't need that surface. */}
        {learningMode !== 'general_english' && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-5 bg-violet-500 rounded-full" />
            <h2 className={`text-sm font-bold uppercase tracking-wide ${textPrimary}`}>{getText('Practice & Test', 'Luyện thi', 'Pratik & Test')}</h2>
          </div>
          <Card className={`p-5 ${bgCard} border shadow-lg rounded-2xl transition-colors duration-300`}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {testModules.map((module) => (
                <div
                  key={module.type}
                  onClick={() => startTest(module.type)}
                  className={`p-4 ${isDark ? 'bg-gray-700/50 hover:bg-gray-700' : module.lightBg} rounded-xl cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 group`}
                >
                  <div className={`w-10 h-10 rounded-lg ${module.color} flex items-center justify-center group-hover:scale-110 transition-transform mb-2`}>
                    <module.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className={`font-semibold ${textPrimary} text-sm`}>{module.title}</p>
                  <p className={`text-xs ${textSecondary}`}>{module.description}</p>
                  {perSkillStats[module.type]?.best && (
                    <div className={`flex items-center gap-1 mt-2 text-xs ${textSecondary}`}>
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span>Best: {perSkillStats[module.type].best}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {learningMode !== 'general_english' && (
              <div className={`flex gap-3 mt-4 pt-4 border-t ${isDark ? "border-gray-700" : "border-gray-100"}`}>
                <div
                  onClick={() => navigate('/question-bank')}
                  className={`flex-1 p-3 ${isDark ? "bg-gray-700/50 hover:bg-gray-700" : "bg-violet-50 hover:bg-violet-100"} rounded-xl cursor-pointer transition-all flex items-center gap-3 group`}
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className={`font-semibold text-sm ${textPrimary}`}>{getText("Question Bank", "Ngân hàng câu hỏi", "Soru Bankası")}</p>
                    <p className={`text-xs ${textSecondary}`}>{getText("1420+ questions", "1420+ câu hỏi", "1420+ soru")}</p>
                  </div>
                </div>
                <div
                  onClick={() => navigate('/quick-practice')}
                  className={`flex-1 p-3 ${isDark ? "bg-gray-700/50 hover:bg-gray-700" : "bg-purple-50 hover:bg-purple-100"} rounded-xl cursor-pointer transition-all flex items-center gap-3 group`}
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className={`font-semibold text-sm ${textPrimary}`}>{getText("Quick Practice", "Luyện nhanh", "Hızlı Pratik")}</p>
                    <p className={`text-xs ${textSecondary}`}>{getText("Short practice sets", "Bài tập ngắn", "Kısa pratik setleri")}</p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
        )}

        {/* ── Section 2: Learn & Grow ── */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-5 bg-blue-500 rounded-full" />
            <h2 className={`text-sm font-bold uppercase tracking-wide ${textPrimary}`}>{getText('Learn & Grow', 'Học & Phát triển', 'Öğren & Geliş')}</h2>
          </div>
        {/* Learning Platform CTA */}
        <Card 
          className="p-5 mb-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white border-0 shadow-xl rounded-2xl cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
          onClick={() => navigate('/unified')}
          data-testid="unified-course-cta"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white mb-1">
                  {getText('Complete Learning Path', 'Lộ trình học tập hoàn chỉnh', 'Tam Öğrenme Yolu')}
                </h2>
                <p className="text-white/80 text-sm">
                  {learningMode === 'general_english'
                    ? getText(
                        'Pre-A1 → A1 → A2 → B1 → B2 → Advanced',
                        'Pre-A1 → A1 → A2 → B1 → B2 → Nâng cao',
                        'Pre-A1 → A1 → A2 → B1 → B2 → İleri Düzey'
                      )
                    : getText(
                        'Pre-A1 → A1 → A2 → B1 → B2 → IELTS Mastery',
                        'Pre-A1 → A1 → A2 → B1 → B2 → IELTS Mastery',
                        'Pre-A1 → A1 → A2 → B1 → B2 → IELTS Ustalık'
                      )}
                </p>
              </div>
            </div>
            <Button className="bg-white/20 hover:bg-white/30 text-white border-0 hidden sm:flex">
              {getText('Start Learning', 'Bắt đầu', 'Başla')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>

          <div className="grid lg:grid-cols-2 gap-4">
          {/* Lessons/Courses Section */}
          <Card className={`p-5 ${bgCard} border shadow-lg rounded-2xl transition-colors duration-300`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-200">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className={`text-lg font-bold ${textPrimary}`}>{getText('Lessons & Courses', 'Khóa học', 'Dersler & Kurslar')}</h2>
                <p className={`text-xs ${textSecondary}`}>{getText('Choose course for your level', 'Chọn khóa phù hợp với trình độ', 'Seviyenize uygun kurs seçin')}</p>
              </div>
            </div>
            <div className="space-y-3">
              {courses.map((course) => {
                const featureMap = { mastery: 'Mastery Course', advanced: 'Advanced Mastery' };
                const locked = featureMap[course.id] && !canAccessByPlan(featureMap[course.id]);
                return (
                <div
                  key={course.id}
                  onClick={() => {
                    if (locked) { handleLockedContent(featureMap[course.id]); return; }
                    navigate(course.route);
                  }}
                  className={`p-4 ${isDark ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50'} rounded-xl cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 group flex items-center justify-between ${locked ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${course.color} flex items-center justify-center text-lg group-hover:scale-110 transition-transform`}>
                      {locked ? <Lock className="w-5 h-5 text-white" /> : course.icon}
                    </div>
                    <div>
                      <p className={`font-semibold ${textPrimary}`}>{course.name}</p>
                      <p className={`text-xs ${textSecondary}`}>{locked ? getText('Upgrade to unlock', 'Nâng cấp để mở', 'Kilidini açmak için yükseltin') : `${course.band} • ${course.lessons} ${getText('lessons', 'bài', 'ders')}`}</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 ${textSecondary} group-hover:translate-x-1 transition-transform`} />
                </div>
                );
              })}
            </div>
          </Card>
          {/* Learning Tools */}
          <Card className={`p-5 ${bgCard} border shadow-lg rounded-2xl transition-colors duration-300`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-200">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className={`text-lg font-bold ${textPrimary}`}>{getText('Learning Tools', 'Công cụ học tập', 'Öğrenme Araçları')}</h2>
                <p className={`text-xs ${textSecondary}`}>{getText('Boost your skills', 'Nâng cao kỹ năng của bạn', 'Becerilerinizi geliştirin')}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {learningTools.map((tool, idx) => {
                const toolLocked = tool.requiredPlan && !canAccessByPlan(tool.requiredPlan);
                return (
                <div
                  key={idx}
                  onClick={() => {
                    if (toolLocked) { handleLockedContent(tool.requiredPlan); return; }
                    navigate(tool.route);
                  }}
                  className={`p-4 ${isDark ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50'} rounded-xl cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 group relative ${toolLocked ? 'opacity-60' : ''}`}
                >
                  {tool.badge && (
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-[10px] font-bold rounded-full">
                      {tool.badge}
                    </span>
                  )}
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                    <tool.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className={`font-semibold ${textPrimary} text-sm`}>{tool.name}</p>
                  {toolLocked && <p className={`text-[10px] ${textSecondary}`}>Upgrade</p>}
                </div>
                );
              })}
            </div>
            {/* NEW Adaptive Level Test CTA */}
            <div 
              onClick={() => navigate('/comprehensive-level-test')}
              className="mt-4 p-5 bg-gradient-to-r from-violet-600 to-purple-700 rounded-xl cursor-pointer hover:shadow-2xl hover:scale-[1.02] transition-all border-2 border-violet-400 flex items-center justify-between relative overflow-hidden group"
            >
              {/* Animated background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-violet-400/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-yellow-400 text-yellow-900 text-[10px] font-bold rounded uppercase tracking-wide">
                      🆕 New
                    </span>
                    <p className="font-bold text-white">{getText('Adaptive Level Test', 'Kiểm tra trình độ thích ứng', 'Uyarlanabilir Seviye Testi')}</p>
                  </div>
                  <p className="text-xs text-violet-100">{getText('Band 2.0-9.0 | Detailed feedback with errors | Learning path', 'Band 2.0-9.0 | Phản hồi chi tiết | Lộ trình học tập', 'Band 2.0-9.0 | Detaylı geri bildirim | Öğrenme yolu')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 relative z-10">
                <span className="text-white/80 text-sm font-semibold hidden sm:inline">
                  {getText('Start Now', 'Bắt đầu', 'Şimdi Başla')}
                </span>
                <ChevronRight className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Old Level Test CTA */}
            <div 
              onClick={() => navigate('/level-test')}
              className={`mt-3 p-4 ${isDark ? 'bg-gradient-to-r from-gray-700 to-gray-600 border-gray-600' : 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200'} rounded-xl cursor-pointer hover:shadow-md transition-all border flex items-center justify-between`}
            >
              <div className="flex items-center gap-3">
                <Target className={`w-6 h-6 ${textSecondary}`} />
                <div>
                  <p className={`font-semibold ${textPrimary} text-sm`}>{getText('Quick Level Test', 'Kiểm tra nhanh', 'Hızlı Seviye Testi')}</p>
                  <p className={`text-xs ${textSecondary}`}>{getText('Simple & fast assessment', 'Đánh giá nhanh', 'Basit ve hızlı')}</p>
                </div>
              </div>
              <ChevronRight className={`w-5 h-5 ${textSecondary}`} />
            </div>
          </Card>
          </div>
        </div>

        {/* ── Section 3: Play & Fun ── */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-5 bg-purple-500 rounded-full" />
            <h2 className={`text-sm font-bold uppercase tracking-wide ${textPrimary}`}>{getText('Play & Fun', 'Chơi & Vui', 'Oyna & Eğlen')}</h2>
          </div>
          {/* Quick Games Section */}
          <Card className={`p-5 ${bgCard} border shadow-lg rounded-2xl transition-colors duration-300 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="flex items-center justify-between mb-4 relative">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-200 animate-pulse">
                  <Gamepad2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className={`text-lg font-bold ${textPrimary}`}>{getText('Quick Games', 'Trò chơi nhanh', 'Hızlı Oyunlar')}</h2>
                  <p className={`text-xs ${textSecondary}`}>{getText('Learn vocabulary while having fun!', 'Học từ vựng vui vẻ!', 'Eğlenerek kelime öğren!')}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/game-bank')}
                className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
              >
                {getText('See All', 'Xem tất cả', 'Tümünü Gör')} <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-3 relative">
              {[
                { type: 'matching_pairs', name: getText('Matching', 'Ghép cặp', 'Eşleştirme'), icon: '🎯', color: 'from-blue-500 to-cyan-500', topic: 'family' },
                { type: 'spelling_bee', name: getText('Spelling', 'Đánh vần', 'Heceleme'), icon: '🐝', color: 'from-amber-500 to-yellow-500', topic: 'animals' },
                { type: 'word_race', name: getText('Word Race', 'Đua từ', 'Kelime Yarışı'), icon: '🏎️', color: 'from-green-500 to-emerald-500', topic: 'food' },
              ].map((game) => (
                <div
                  key={game.type}
                  onClick={() => navigate(`/game-bank?game=${game.type}&topic=${game.topic}`)}
                  className={`p-4 ${isDark ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gradient-to-br from-gray-50 to-white'} rounded-xl cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 group text-center border ${isDark ? 'border-gray-600' : 'border-gray-100'}`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${game.color} flex items-center justify-center text-2xl mx-auto mb-2 group-hover:scale-110 transition-transform shadow-lg`}>
                    {game.icon}
                  </div>
                  <p className={`font-semibold text-sm ${textPrimary}`}>{game.name}</p>
                </div>
              ))}
            </div>
            <div 
              onClick={() => navigate('/game-bank')}
              className={`mt-4 p-3 ${isDark ? 'bg-gradient-to-r from-purple-900/50 to-pink-900/50' : 'bg-gradient-to-r from-purple-50 to-pink-50'} rounded-xl cursor-pointer hover:shadow-md transition-all group flex items-center justify-between`}
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">🎮</div>
                <div>
                  <p className={`font-semibold text-sm ${textPrimary}`}>{getText('Daily Challenge', 'Thử thách hàng ngày', 'Günlük Meydan Okuma')}</p>
                  <p className={`text-xs ${textSecondary}`}>{getText('Complete 3 games to earn bonus XP!', 'Hoàn thành 3 trò chơi để nhận XP thưởng!', '3 oyun tamamla, bonus XP kazan!')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1">
                  <div className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center text-xs">⭐</div>
                  <div className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center text-xs">⭐</div>
                  <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs">⭐</div>
                </div>
                <ChevronRight className={`w-5 h-5 ${textSecondary} group-hover:translate-x-1 transition-transform`} />
              </div>
            </div>
          </Card>
        </div>

        {/* ── Section 4: Your Progress ── */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-5 bg-emerald-500 rounded-full" />
            <h2 className={`text-sm font-bold uppercase tracking-wide ${textPrimary}`}>{getText('Your Progress', 'Tiến độ của bạn', 'İlerlemeniz')}</h2>
          </div>
          {/* Badges Section */}
          {progress?.badges?.length > 0 && (
            <Card className={`p-4 mb-4 ${isDark ? 'bg-gradient-to-r from-amber-900/30 to-yellow-900/30 border-amber-700' : 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200'} rounded-2xl transition-colors duration-300`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className={`font-semibold ${textPrimary} flex items-center gap-2`}>
                  <Trophy className="w-5 h-5 text-amber-500" />
                  {getText('Your Achievements', 'Thành tích của bạn', 'Başarılarınız')}
                </h3>
                <span className={`text-sm ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>{progress.badges.length} {getText('badges', 'huy hiệu', 'rozet')}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {progress.badges.slice(0, 8).map((badge, idx) => (
                  <div key={idx} className={`flex items-center gap-2 ${isDark ? 'bg-gray-700' : 'bg-white'} px-3 py-2 rounded-lg shadow-sm`} title={badge.description}>
                    <span className="text-xl">{badge.icon}</span>
                    <span className={`text-sm font-medium ${textPrimary}`}>{badge.name}</span>
                  </div>
                ))}
                {progress.badges.length > 8 && (
                  <button onClick={() => navigate('/progress')} className={`text-sm ${isDark ? 'text-amber-400 hover:text-amber-300' : 'text-amber-700 hover:text-amber-800'} font-medium px-3 py-2`}>
                    +{progress.badges.length - 8} {getText('more', 'khác', 'daha fazla')}
                  </button>
                )}
              </div>
            </Card>
          )}
          <div className="grid lg:grid-cols-2 gap-4">
          <Card className={`p-5 ${bgCard} border shadow-lg rounded-2xl transition-colors duration-300`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-200">
                  <History className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className={`text-lg font-bold ${textPrimary}`}>{getText('Recent Tests', 'Bài thi gần đây', 'Son Testler')}</h2>
                  <p className={`text-xs ${textSecondary}`}>{getText('Review your results', 'Xem lại kết quả', 'Sonuçlarınızı inceleyin')}</p>
                </div>
              </div>
              {hasProgress && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/progress')}
                  className={`text-violet-600 ${isDark ? 'hover:bg-violet-900/30' : 'hover:bg-violet-50'} text-xs`}
                >
                  {getText('View All', 'Xem tất cả', 'Tümünü Gör')}
                </Button>
              )}
            </div>
            
            {hasProgress && progress.recent_attempts?.length > 0 ? (
              <div className="space-y-2">
                {progress.recent_attempts.slice(0, 4).map((attempt, idx) => {
                  const moduleConfig = testModules.find(m => m.type === attempt.test_type);
                  const Icon = moduleConfig?.icon || BookOpen;
                  return (
                    <div 
                      key={idx}
                      onClick={() => attempt.id && navigate(`/results/${attempt.id}`)}
                      className={`p-3 ${isDark ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'} rounded-xl flex items-center justify-between cursor-pointer transition-colors`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg ${moduleConfig?.color || 'bg-gray-500'} flex items-center justify-center`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className={`font-medium ${textPrimary} text-sm capitalize`}>{attempt.test_type}</p>
                          <p className={`text-xs ${textSecondary}`}>{attempt.completed_at ? new Date(attempt.completed_at).toLocaleDateString() : 'Recently'}</p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-lg text-sm font-bold ${
                        attempt.band_score >= 7 ? 'bg-green-100 text-green-700' :
                        attempt.band_score >= 6 ? 'bg-blue-100 text-blue-700' :
                        attempt.band_score >= 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {attempt.band_score?.toFixed(1) || '-'}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className={`w-16 h-16 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center mx-auto mb-3`}>
                  <GraduationCap className={`w-8 h-8 ${textSecondary}`} />
                </div>
                <p className={`${textSecondary} text-sm mb-3`}>{getText('No tests yet', 'Chưa có bài thi nào', 'Henüz test yok')}</p>
                <Button onClick={() => navigate('/test/reading')} size="sm" className="bg-violet-600 hover:bg-violet-700 text-white">
                  {getText('Take Your First Test', 'Làm bài thi đầu tiên', 'İlk Testinizi Yapın')}
                </Button>
              </div>
            )}
          </Card>
          <Card 
            className="p-5 bg-gradient-to-r from-violet-600 to-purple-600 border-0 shadow-xl rounded-2xl cursor-pointer hover:shadow-2xl transition-all"
            onClick={() => navigate('/progress')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{getText('View Full Progress', 'Xem tiến độ đầy đủ', 'Tüm İlerlemeyi Gör')}</h3>
                  <p className="text-violet-200 text-sm">{getText('Detailed analytics & AI feedback', 'Phân tích chi tiết & phản hồi AI', 'Detaylı analitik & AI geri bildirimi')}</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-white" />
            </div>
          </Card>
          </div>
        {/* Skill Breakdown (if user has enough tests) */}
        {hasProgress && progress.total_tests > 2 && (
          <div className="mt-6">
            <SkillBreakdown
              showCumulative={true}
              userId={user?.id}
              expanded={false}
            />
          </div>
        )}
        
        </div>

        {/* Beta Feedback CTA */}
        <div className="mt-6 mb-6">
          <Card className={`p-4 ${bgCard} border shadow-sm rounded-2xl`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <span className="text-lg">🧪</span>
                </div>
                <div>
                  <p className={`font-semibold ${textPrimary} text-sm`}>
                    {getText('Help us improve!', 'Giúp chúng tôi cải thiện!', 'Gelişmemize yardım edin!')}
                  </p>
                  <p className={`text-xs ${textSecondary}`}>
                    {getText('This platform is in beta. Your feedback matters.', 'Nền tảng đang trong beta. Phản hồi của bạn rất quan trọng.', 'Bu platform beta aşamasında. Geri bildiriminiz önemli.')}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { setFeedbackType('bug'); setShowFeedbackModal(true); }}
                  className="text-xs border-gray-300"
                >
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {getText('Report Issue', 'Báo lỗi', 'Sorun Bildir')}
                </Button>
                <Button
                  size="sm"
                  onClick={() => { setFeedbackType('feedback'); setShowFeedbackModal(true); }}
                  className="text-xs bg-violet-600 hover:bg-violet-700 text-white"
                >
                  <MessageSquare className="w-3 h-3 mr-1" />
                  {getText('Give Feedback', 'Gửi phản hồi', 'Geri Bildirim')}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>
      
      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        user={user}
        type={feedbackType}
      />
    </div>
  );
}
