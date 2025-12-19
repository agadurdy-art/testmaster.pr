import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { 
  BookOpen, Headphones, Mic, PenTool, Trophy, TrendingUp, Target, BookMarked, 
  LogOut, Menu, MessageSquare, ChevronRight, Clock, Award, Sparkles, 
  GraduationCap, BarChart3, Flame, Star, X, User, Zap, LayoutDashboard, FileText, CreditCard
} from 'lucide-react';
import { getTests, getUserProgress, getUser } from '../lib/api';
import { toast } from 'sonner';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useI18n } from '../lib/i18n';

export default function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [tests, setTests] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState(user);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => { loadData(); }, [user.id]);

  const loadData = async () => {
    try {
      const [testsData, progressData, freshUser] = await Promise.all([getTests(), getUserProgress(user.id), getUser(user.id)]);
      setTests(testsData);
      setProgress(progressData);
      if (freshUser) { setUserDetails(freshUser); localStorage.setItem('user', JSON.stringify(freshUser)); }
    } catch (error) { toast.error('Failed to load dashboard data'); }
    finally { setLoading(false); }
  };

  const testModules = [
    { type: 'reading', icon: BookOpen, title: 'Reading', description: '60 min • 40 questions', color: 'bg-blue-500', lightBg: 'bg-blue-50', shadow: 'shadow-blue-100' },
    { type: 'listening', icon: Headphones, title: 'Listening', description: '40 min • 40 questions', color: 'bg-purple-500', lightBg: 'bg-purple-50', shadow: 'shadow-purple-100' },
    { type: 'writing', icon: PenTool, title: 'Writing', description: '60 min • 2 tasks', color: 'bg-orange-500', lightBg: 'bg-orange-50', shadow: 'shadow-orange-100' },
    { type: 'speaking', icon: Mic, title: 'Speaking', description: '15 min • AI interview', color: 'bg-emerald-500', lightBg: 'bg-emerald-50', shadow: 'shadow-emerald-100' }
  ];

  const startTest = (testType) => { navigate(`/test/${testType}`); };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-orange-50/30 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading dashboard...</p>
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
              <Button variant="ghost" onClick={() => navigate('/tips')} className="text-gray-600 hover:text-violet-600 hover:bg-violet-50">
                <BookMarked className="w-4 h-4 mr-2" />{t('navTips')}
              </Button>
              <Button variant="ghost" onClick={() => navigate('/courses')} className="text-gray-600 hover:text-violet-600 hover:bg-violet-50">
                <Target className="w-4 h-4 mr-2" />{t('navCourses')}
              </Button>
              <Button variant="ghost" onClick={() => navigate('/pricing')} className="text-gray-600 hover:text-violet-600 hover:bg-violet-50">{t('navPricing')}</Button>
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
              {/* Main Navigation */}
              <Button variant="ghost" className="w-full justify-start text-gray-600 font-medium" onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }}>
                <LayoutDashboard className="w-4 h-4 mr-3" />Dashboard
              </Button>
              <hr className="my-2" />
              {/* Test Modules */}
              <p className="text-xs text-gray-400 px-3 py-1">Practice Tests</p>
              {testModules.map((m) => (
                <Button key={m.type} variant="ghost" className="w-full justify-start text-gray-600" onClick={() => { startTest(m.type); setMobileMenuOpen(false); }}>
                  <m.icon className="w-4 h-4 mr-3" />{m.title}
                </Button>
              ))}
              <hr className="my-2" />
              {/* Learning & Resources */}
              <p className="text-xs text-gray-400 px-3 py-1">Learning</p>
              <Button variant="ghost" className="w-full justify-start text-gray-600" onClick={() => { navigate('/vocab-grammar'); setMobileMenuOpen(false); }}>
                <BookOpen className="w-4 h-4 mr-3" />Vocab & Grammar
              </Button>
              <Button variant="ghost" className="w-full justify-start text-gray-600" onClick={() => { navigate('/writing-practice'); setMobileMenuOpen(false); }}>
                <FileText className="w-4 h-4 mr-3" />Writing Practice
              </Button>
              <Button variant="ghost" className="w-full justify-start text-gray-600" onClick={() => { navigate('/speaking-practice'); setMobileMenuOpen(false); }}>
                <MessageSquare className="w-4 h-4 mr-3" />Speaking Practice
              </Button>
              <Button variant="ghost" className="w-full justify-start text-gray-600" onClick={() => { navigate('/tips'); setMobileMenuOpen(false); }}>
                <Sparkles className="w-4 h-4 mr-3" />Tips & Strategies
              </Button>
              <Button variant="ghost" className="w-full justify-start text-gray-600" onClick={() => { navigate('/courses'); setMobileMenuOpen(false); }}>
                <Award className="w-4 h-4 mr-3" />Courses
              </Button>
              <hr className="my-2" />
              {/* Account */}
              <p className="text-xs text-gray-400 px-3 py-1">Account</p>
              <Button variant="ghost" className="w-full justify-start text-gray-600" onClick={() => { navigate('/pricing'); setMobileMenuOpen(false); }}>
                <CreditCard className="w-4 h-4 mr-3" />Pricing
              </Button>
              <Button variant="ghost" className="w-full justify-start text-gray-600" onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }}>
                <User className="w-4 h-4 mr-3" />Profile
              </Button>
              <Button variant="ghost" className="w-full justify-start text-red-500" onClick={onLogout}>
                <LogOut className="w-4 h-4 mr-3" />Logout
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name?.split(' ')[0] || 'Student'}! 👋
          </h1>
          <p className="text-gray-500">Continue your IELTS preparation journey</p>
        </div>

        {/* My Progress Card - Prominent CTA */}
        <Card 
          className="p-5 mb-8 bg-gradient-to-r from-violet-600 to-purple-600 border-0 shadow-xl shadow-purple-200 rounded-2xl cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
          onClick={() => navigate('/progress')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-1">My Progress</h2>
                <p className="text-violet-200 text-sm">Track your journey, view all feedback & improve</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-3xl font-bold text-white">{progress?.total_tests || 0}</p>
                <p className="text-violet-200 text-xs">Tests Completed</p>
              </div>
              <ChevronRight className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: BarChart3, label: 'Tests Taken', value: progress?.total_tests || 0, color: 'bg-blue-500', lightBg: 'bg-blue-50', lightText: 'text-blue-600' },
            { icon: Award, label: 'Avg. Band', value: progress?.average_band?.toFixed(1) || '-', color: 'bg-purple-500', lightBg: 'bg-purple-50', lightText: 'text-purple-600' },
            { icon: Clock, label: 'Study Time', value: `${totalHours}h ${totalMinutes}m`, color: 'bg-orange-500', lightBg: 'bg-orange-50', lightText: 'text-orange-600' },
            { icon: Flame, label: 'Best Score', value: progress?.best_band?.toFixed(1) || '-', color: 'bg-emerald-500', lightBg: 'bg-emerald-50', lightText: 'text-emerald-600' }
          ].map((stat, idx) => (
            <Card key={idx} className="p-4 bg-white border-0 shadow-lg shadow-gray-100 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center shadow-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Practice Tests Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-200">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Practice Tests</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {testModules.map((module) => (
              <Card key={module.type} className={`p-5 bg-white border-0 shadow-lg ${module.shadow} hover:shadow-xl cursor-pointer group transition-all duration-300 hover:-translate-y-1 rounded-2xl`} onClick={() => startTest(module.type)}>
                <div className={`w-14 h-14 rounded-2xl ${module.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <module.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{module.title}</h3>
                <p className="text-sm text-gray-500 mb-3">{module.description}</p>
                {perSkillStats[module.type]?.best && (
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-gray-600">Best: {perSkillStats[module.type].best}</span>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Learning Tools Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-200">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Learning Tools</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Level Test */}
            <Card className="p-5 bg-gradient-to-br from-cyan-50 to-blue-50 border-0 shadow-lg shadow-cyan-100 hover:shadow-xl cursor-pointer group transition-all duration-300 hover:-translate-y-1 rounded-2xl" onClick={() => navigate('/level-test')}>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-cyan-200 group-hover:scale-110 transition-transform">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Level Test</h3>
              <p className="text-sm text-gray-600">Find your current level</p>
              <ChevronRight className="w-5 h-5 text-cyan-500 mt-3 group-hover:translate-x-1 transition-transform" />
            </Card>

            {/* Vocabulary & Grammar */}
            <Card className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 border-0 shadow-lg shadow-emerald-100 hover:shadow-xl cursor-pointer group transition-all duration-300 hover:-translate-y-1 rounded-2xl" onClick={() => navigate('/vocab-grammar')}>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4 shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform">
                <BookMarked className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Vocab & Grammar</h3>
              <p className="text-sm text-gray-600">Build your foundation</p>
              <ChevronRight className="w-5 h-5 text-emerald-500 mt-3 group-hover:translate-x-1 transition-transform" />
            </Card>

            {/* Writing Practice */}
            <Card className="p-5 bg-gradient-to-br from-orange-50 to-amber-50 border-0 shadow-lg shadow-orange-100 hover:shadow-xl cursor-pointer group transition-all duration-300 hover:-translate-y-1 rounded-2xl" onClick={() => navigate('/writing-practice')}>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center mb-4 shadow-lg shadow-orange-200 group-hover:scale-110 transition-transform">
                <PenTool className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Writing Practice</h3>
              <p className="text-sm text-gray-600">Task 1 & 2 with AI feedback</p>
              <ChevronRight className="w-5 h-5 text-orange-500 mt-3 group-hover:translate-x-1 transition-transform" />
            </Card>

            {/* Speaking Practice */}
            <Card className="p-5 bg-gradient-to-br from-violet-50 to-purple-50 border-0 shadow-lg shadow-violet-100 hover:shadow-xl cursor-pointer group transition-all duration-300 hover:-translate-y-1 rounded-2xl" onClick={() => navigate('/speaking-practice')}>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg shadow-violet-200 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Speaking Practice</h3>
              <p className="text-sm text-gray-600">Parts 1-3 with evaluation</p>
              <ChevronRight className="w-5 h-5 text-violet-500 mt-3 group-hover:translate-x-1 transition-transform" />
            </Card>

            {/* Beginner English Course */}
            <Card className="p-5 bg-gradient-to-br from-green-50 to-lime-50 border-0 shadow-lg shadow-green-100 hover:shadow-xl cursor-pointer group transition-all duration-300 hover:-translate-y-1 rounded-2xl" onClick={() => navigate('/beginner-course')}>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-lime-600 flex items-center justify-center mb-4 shadow-lg shadow-green-200 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Beginner English</h3>
              <p className="text-sm text-gray-600">14 lessons for Band 4.5-</p>
              <ChevronRight className="w-5 h-5 text-green-500 mt-3 group-hover:translate-x-1 transition-transform" />
            </Card>

            {/* IELTS Mastery Course */}
            <Card className="p-5 bg-gradient-to-br from-violet-50 to-purple-50 border-0 shadow-lg shadow-violet-100 hover:shadow-xl cursor-pointer group transition-all duration-300 hover:-translate-y-1 rounded-2xl" onClick={() => navigate('/mastery-course')}>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg shadow-violet-200 group-hover:scale-110 transition-transform">
                <Trophy className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">IELTS Mastery</h3>
              <p className="text-sm text-gray-600">17 modules for Band 4.5-6.5</p>
              <ChevronRight className="w-5 h-5 text-violet-500 mt-3 group-hover:translate-x-1 transition-transform" />
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        {hasProgress && progress.recent_attempts?.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-200">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/progress')}
                className="text-violet-600 border-violet-200 hover:bg-violet-50"
              >
                View All Progress
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <Card className="bg-white border-0 shadow-lg shadow-gray-100 rounded-2xl overflow-hidden">
              <div className="divide-y divide-gray-100">
                {progress.recent_attempts.slice(0, 5).map((attempt, idx) => {
                  const moduleConfig = testModules.find(m => m.type === attempt.test_type);
                  const Icon = moduleConfig?.icon || BookOpen;
                  return (
                    <div 
                      key={idx} 
                      className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => attempt.id && navigate(`/results/${attempt.id}`)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl ${moduleConfig?.color || 'bg-gray-500'} flex items-center justify-center shadow-lg`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 capitalize">{attempt.test_type} Test</p>
                          <p className="text-sm text-gray-500">{attempt.completed_at ? new Date(attempt.completed_at).toLocaleDateString() : 'Recently'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`px-4 py-2 rounded-xl font-bold ${
                          attempt.band_score >= 7 ? 'bg-green-100 text-green-700' :
                          attempt.band_score >= 6 ? 'bg-blue-100 text-blue-700' :
                          attempt.band_score >= 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                        }`}>
                          Band {attempt.band_score?.toFixed(1) || '-'}
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
