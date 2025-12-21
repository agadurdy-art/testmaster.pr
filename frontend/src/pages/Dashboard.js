import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { 
  BookOpen, Headphones, Mic, PenTool, Trophy, TrendingUp, Target, BookMarked, 
  LogOut, Menu, MessageSquare, ChevronRight, Clock, Award, Sparkles, 
  GraduationCap, BarChart3, Flame, Star, X, User, Zap, LayoutDashboard, FileText, CreditCard,
  Play, ArrowRight, History, Lightbulb, CheckCircle, Mail, HelpCircle
} from 'lucide-react';
import { getTests, getUserProgress, getUser } from '../lib/api';
import { toast } from 'sonner';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useI18n } from '../lib/i18n';
import SkillBreakdown from '../components/SkillBreakdown';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const SUPPORT_EMAIL = 'testmaster.edu.ai@proton.me';

export default function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const { t, language } = useI18n();
  const [tests, setTests] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState(user);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [continueData, setContinueData] = useState(null);

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
    { id: 'beginner', name: getText('Beginner Course', 'Khóa Cơ bản', 'Başlangıç Kursu'), band: 'Band 4.0-5.0', icon: '🌱', color: 'from-emerald-500 to-teal-600', route: '/beginner-course', lessons: 14 },
    { id: 'mastery', name: getText('Mastery Course', 'Khóa Trung cấp', 'Ustalık Kursu'), band: 'Band 5.5-6.5', icon: '📚', color: 'from-blue-500 to-indigo-600', route: '/mastery-course', lessons: 17 },
    { id: 'advanced', name: getText('Advanced Mastery', 'Khóa Nâng cao', 'İleri Düzey Ustalık'), band: 'Band 6.5-9.0', icon: '🏆', color: 'from-amber-500 to-orange-600', route: '/advanced-mastery', lessons: 20 }
  ];

  const learningTools = [
    { name: getText('Vocab & Grammar', 'Từ vựng & Ngữ pháp', 'Kelime & Dilbilgisi'), icon: BookMarked, color: 'from-emerald-500 to-teal-600', route: '/vocab-grammar' },
    { name: getText('Writing Practice', 'Luyện viết', 'Yazma Pratiği'), icon: FileText, color: 'from-orange-500 to-amber-600', route: '/writing-practice' },
    { name: getText('Speaking Practice', 'Luyện nói', 'Konuşma Pratiği'), icon: MessageSquare, color: 'from-violet-500 to-purple-600', route: '/speaking-practice' },
    { name: getText('Tips & Strategies', 'Mẹo & Chiến lược', 'İpuçları & Stratejiler'), icon: Lightbulb, color: 'from-pink-500 to-rose-600', route: '/tips' }
  ];

  const startTest = (testType) => { navigate(`/test/${testType}`); };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-orange-50/30 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">{getText('Loading dashboard...', 'Đang tải...', 'Gösterge paneli yükleniyor...')}</p>
        </div>
      </div>
    );
  }

  const hasProgress = !!(progress && progress.total_tests > 0);
  const skillOrder = ['listening', 'reading', 'writing', 'speaking'];
  let perSkillStats = {};
  let totalTimeSeconds = 0;

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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-orange-50/30 to-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-200">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent hidden sm:block">IELTS Ace</h1>
          </div>
          
          <nav className="flex items-center space-x-2">
            <LanguageSwitcher compact />
            <div className="hidden md:flex items-center space-x-1">
              <Button variant="ghost" onClick={() => navigate('/progress')} className="text-gray-600 hover:text-violet-600 hover:bg-violet-50">
                <BarChart3 className="w-4 h-4 mr-2" />{getText('Progress', 'Tiến độ', 'İlerleme')}
              </Button>
              <Button variant="ghost" onClick={() => navigate('/pricing')} className="text-gray-600 hover:text-violet-600 hover:bg-violet-50">{t('navPricing')}</Button>
              <Button 
                variant="ghost" 
                onClick={() => window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('IELTS Ace - Support Request')}&body=${encodeURIComponent(`Hi IELTS Ace Team,\n\nUser: ${user.name}\nEmail: ${user.email}\n\nMy question/issue:\n\n`)}`}
                className="text-gray-600 hover:text-emerald-600 hover:bg-emerald-50"
              >
                <Mail className="w-4 h-4 mr-2" />{getText('Contact', 'Liên hệ', 'İletişim')}
              </Button>
              <Button variant="ghost" onClick={() => navigate('/profile')} className="text-gray-600 hover:text-violet-600 hover:bg-violet-50">
                <User className="w-4 h-4 mr-2" />{user.name}
              </Button>
              <Button variant="ghost" onClick={onLogout} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                <LogOut className="w-4 h-4 mr-2" />{t('navLogout')}
              </Button>
            </div>
            <button type="button" className="md:hidden p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </nav>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
              <Button variant="ghost" className="w-full justify-start text-gray-600 font-medium" onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }}>
                <LayoutDashboard className="w-4 h-4 mr-3" />{getText('Dashboard', 'Bảng điều khiển', 'Gösterge Paneli')}
              </Button>
              <Button variant="ghost" className="w-full justify-start text-gray-600" onClick={() => { navigate('/progress'); setMobileMenuOpen(false); }}>
                <BarChart3 className="w-4 h-4 mr-3" />{getText('Progress', 'Tiến độ', 'İlerleme')}
              </Button>
              <hr className="my-2" />
              <p className="text-xs text-gray-400 px-3 py-1">{getText('Tests', 'Bài kiểm tra', 'Testler')}</p>
              {testModules.map((m) => (
                <Button key={m.type} variant="ghost" className="w-full justify-start text-gray-600" onClick={() => { startTest(m.type); setMobileMenuOpen(false); }}>
                  <m.icon className="w-4 h-4 mr-3" />{m.title}
                </Button>
              ))}
              <hr className="my-2" />
              <p className="text-xs text-gray-400 px-3 py-1">{getText('Courses', 'Khóa học', 'Kurslar')}</p>
              {courses.map((c) => (
                <Button key={c.id} variant="ghost" className="w-full justify-start text-gray-600" onClick={() => { navigate(c.route); setMobileMenuOpen(false); }}>
                  <span className="mr-3">{c.icon}</span>{c.name}
                </Button>
              ))}
              <hr className="my-2" />
              <p className="text-xs text-gray-400 px-3 py-1">{getText('Account', 'Tài khoản', 'Hesap')}</p>
              <Button variant="ghost" className="w-full justify-start text-gray-600" onClick={() => { navigate('/pricing'); setMobileMenuOpen(false); }}>
                <CreditCard className="w-4 h-4 mr-3" />{getText('Pricing', 'Giá cả', 'Fiyatlandırma')}
              </Button>
              <Button variant="ghost" className="w-full justify-start text-gray-600" onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }}>
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
                <Mail className="w-4 h-4 mr-3" />{language === 'vi' ? 'Liên hệ hỗ trợ' : language === 'tr' ? 'Destek ile İletişim' : 'Contact Support'}
              </Button>
              <Button variant="ghost" className="w-full justify-start text-red-500" onClick={onLogout}>
                <LogOut className="w-4 h-4 mr-3" />{language === 'vi' ? 'Đăng xuất' : language === 'tr' ? 'Çıkış Yap' : 'Logout'}
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24">
        
        {/* Welcome + Continue Section */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
            {language === 'vi' ? `Chào mừng trở lại, ${user.name?.split(' ')[0] || 'Học viên'}!` : 
             language === 'tr' ? `Tekrar hoş geldin, ${user.name?.split(' ')[0] || 'Öğrenci'}!` :
             `Welcome back, ${user.name?.split(' ')[0] || 'Student'}!`} 👋
          </h1>
          <p className="text-gray-500 text-sm">
            {language === 'vi' ? 'Tiếp tục hành trình IELTS của bạn' : 
             language === 'tr' ? 'IELTS hazırlık yolculuğunuza devam edin' :
             'Continue your IELTS preparation journey'}
          </p>
        </div>

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

        {/* Quick Stats Row - Always visible */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { icon: BarChart3, label: getText('Tests', 'Bài thi', 'Testler'), value: progress?.total_tests || 0, color: 'text-blue-600', bg: 'bg-blue-50' },
            { icon: Award, label: getText('Avg Band', 'TB Band', 'Ort. Band'), value: progress?.average_band?.toFixed(1) || '-', color: 'text-purple-600', bg: 'bg-purple-50' },
            { icon: Flame, label: getText('Best', 'Cao nhất', 'En İyi'), value: progress?.best_band?.toFixed(1) || '-', color: 'text-orange-600', bg: 'bg-orange-50' },
            { icon: Clock, label: getText('Time', 'Thời gian', 'Süre'), value: `${totalHours}h${totalMinutes}m`, color: 'text-emerald-600', bg: 'bg-emerald-50' }
          ].map((stat, idx) => (
            <Card key={idx} className={`p-3 ${stat.bg} border-0 rounded-xl text-center`}>
              <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-1`} />
              <p className="text-lg font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </Card>
          ))}
        </div>

        {/* Main Navigation Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          
          {/* Tests Section */}
          <Card className="p-5 bg-white border-0 shadow-lg rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-200">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{getText('Practice Tests', 'Bài kiểm tra', 'Pratik Testler')}</h2>
                <p className="text-xs text-gray-500">{getText('Practice all 4 IELTS skills', 'Luyện tập 4 kỹ năng IELTS', '4 IELTS becerisini pratik yapın')}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {testModules.map((module) => (
                <div
                  key={module.type}
                  onClick={() => startTest(module.type)}
                  className={`p-4 ${module.lightBg} rounded-xl cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 group`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${module.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <module.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{module.title}</p>
                      <p className="text-xs text-gray-500">{module.description}</p>
                    </div>
                  </div>
                  {perSkillStats[module.type]?.best && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span>Best: {perSkillStats[module.type].best}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Lessons/Courses Section */}
          <Card className="p-5 bg-white border-0 shadow-lg rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-200">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{language === 'vi' ? 'Khóa học' : 'Lessons & Courses'}</h2>
                <p className="text-xs text-gray-500">{language === 'vi' ? 'Chọn khóa phù hợp với trình độ' : 'Choose course for your level'}</p>
              </div>
            </div>
            <div className="space-y-3">
              {courses.map((course) => (
                <div
                  key={course.id}
                  onClick={() => navigate(course.route)}
                  className="p-4 bg-gray-50 rounded-xl cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 group flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${course.color} flex items-center justify-center text-lg group-hover:scale-110 transition-transform`}>
                      {course.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{course.name}</p>
                      <p className="text-xs text-gray-500">{course.band} • {course.lessons} {language === 'vi' ? 'bài' : 'lessons'}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Learning Tools + Recent Tests Row */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          
          {/* Learning Tools */}
          <Card className="p-5 bg-white border-0 shadow-lg rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-200">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{language === 'vi' ? 'Công cụ học tập' : 'Learning Tools'}</h2>
                <p className="text-xs text-gray-500">{language === 'vi' ? 'Nâng cao kỹ năng của bạn' : 'Boost your skills'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {learningTools.map((tool, idx) => (
                <div
                  key={idx}
                  onClick={() => navigate(tool.route)}
                  className="p-4 bg-gray-50 rounded-xl cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 group"
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                    <tool.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="font-semibold text-gray-900 text-sm">{tool.name}</p>
                </div>
              ))}
            </div>
            {/* Level Test CTA */}
            <div 
              onClick={() => navigate('/level-test')}
              className="mt-4 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl cursor-pointer hover:shadow-md transition-all border border-cyan-200 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Target className="w-6 h-6 text-cyan-600" />
                <div>
                  <p className="font-semibold text-gray-900">{language === 'vi' ? 'Kiểm tra trình độ' : 'Level Test'}</p>
                  <p className="text-xs text-gray-500">{language === 'vi' ? 'Xác định điểm xuất phát' : 'Find your starting point'}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-cyan-500" />
            </div>
          </Card>

          {/* Recent Tests */}
          <Card className="p-5 bg-white border-0 shadow-lg rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-200">
                  <History className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{language === 'vi' ? 'Bài thi gần đây' : 'Recent Tests'}</h2>
                  <p className="text-xs text-gray-500">{language === 'vi' ? 'Xem lại kết quả' : 'Review your results'}</p>
                </div>
              </div>
              {hasProgress && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/progress')}
                  className="text-violet-600 hover:bg-violet-50 text-xs"
                >
                  {language === 'vi' ? 'Xem tất cả' : 'View All'}
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
                      className="p-3 bg-gray-50 rounded-xl flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg ${moduleConfig?.color || 'bg-gray-500'} flex items-center justify-center`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm capitalize">{attempt.test_type}</p>
                          <p className="text-xs text-gray-500">{attempt.completed_at ? new Date(attempt.completed_at).toLocaleDateString() : 'Recently'}</p>
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
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <GraduationCap className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm mb-3">{language === 'vi' ? 'Chưa có bài thi nào' : 'No tests yet'}</p>
                <Button onClick={() => navigate('/test/reading')} size="sm" className="bg-violet-600 hover:bg-violet-700 text-white">
                  {language === 'vi' ? 'Làm bài thi đầu tiên' : 'Take Your First Test'}
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Progress Overview - Click to see full progress */}
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
                <h3 className="text-lg font-bold text-white">{language === 'vi' ? 'Xem tiến độ đầy đủ' : 'View Full Progress'}</h3>
                <p className="text-violet-200 text-sm">{language === 'vi' ? 'Phân tích chi tiết & phản hồi AI' : 'Detailed analytics & AI feedback'}</p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-white" />
          </div>
        </Card>

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
      </main>
    </div>
  );
}
