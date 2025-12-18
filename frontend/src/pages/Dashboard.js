import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { 
  BookOpen, Headphones, Mic, PenTool, Trophy, TrendingUp, Target, BookMarked, 
  LogOut, Menu, MessageSquare, ChevronRight, Clock, Award, Sparkles, 
  GraduationCap, BarChart3, Flame, Star, X, User
} from 'lucide-react';
import { getTests, getUserProgress, getUser } from '../lib/api';
import { getBandScoreColor, getBandScoreBg } from '../lib/utils';
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

  useEffect(() => {
    loadData();
  }, [user.id]);

  const loadData = async () => {
    try {
      const [testsData, progressData, freshUser] = await Promise.all([
        getTests(),
        getUserProgress(user.id),
        getUser(user.id)
      ]);
      setTests(testsData);
      setProgress(progressData);
      if (freshUser) {
        setUserDetails(freshUser);
        localStorage.setItem('user', JSON.stringify(freshUser));
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const testModules = [
    {
      type: 'reading',
      icon: BookOpen,
      title: 'Reading',
      description: '60 min • 40 questions',
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-500/10',
      iconBg: 'bg-blue-500'
    },
    {
      type: 'listening',
      icon: Headphones,
      title: 'Listening',
      description: '40 min • 40 questions',
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-500/10',
      iconBg: 'bg-purple-500'
    },
    {
      type: 'writing',
      icon: PenTool,
      title: 'Writing',
      description: '60 min • 2 tasks',
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-500/10',
      iconBg: 'bg-orange-500'
    },
    {
      type: 'speaking',
      icon: Mic,
      title: 'Speaking',
      description: '15 min • AI interview',
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-500/10',
      iconBg: 'bg-emerald-500'
    }
  ];

  const startTest = (testType) => {
    navigate(`/test/${testType}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Progress calculations
  const hasProgress = !!(progress && progress.total_tests > 0);
  const skillOrder = ['listening', 'reading', 'writing', 'speaking'];

  let perSkillStats = {};
  let totalTimeSeconds = 0;

  if (hasProgress && Array.isArray(progress.recent_attempts)) {
    const bySkill = {};
    progress.recent_attempts.forEach((attempt) => {
      const band = typeof attempt.band_score === 'number' ? attempt.band_score : 0;
      const type = attempt.test_type;
      if (typeof attempt.time_taken === 'number') {
        totalTimeSeconds += attempt.time_taken;
      }
      if (skillOrder.includes(type)) {
        if (!bySkill[type]) {
          bySkill[type] = { sum: 0, count: 0, best: 0 };
        }
        bySkill[type].sum += band;
        bySkill[type].count += 1;
        if (band > bySkill[type].best) {
          bySkill[type].best = band;
        }
      }
    });

    skillOrder.forEach((skill) => {
      const stat = bySkill[skill];
      if (!stat || stat.count === 0) {
        perSkillStats[skill] = { avg: null, count: 0, best: null };
      } else {
        perSkillStats[skill] = {
          avg: Math.round((stat.sum / stat.count) * 10) / 10,
          count: stat.count,
          best: stat.best,
        };
      }
    });
  }

  const totalHours = Math.floor(totalTimeSeconds / 3600);
  const totalMinutes = Math.round((totalTimeSeconds % 3600) / 60);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-50 border-b border-white/10 backdrop-blur-xl bg-white/5 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white hidden sm:block">IELTS Ace</h1>
          </div>
          
          <nav className="flex items-center space-x-2">
            <LanguageSwitcher compact />
            {/* Desktop nav */}
            <div className="hidden md:flex items-center space-x-1">
              <Button variant="ghost" onClick={() => navigate('/tips')} className="text-gray-300 hover:text-white hover:bg-white/10">
                <BookMarked className="w-4 h-4 mr-2" />
                {t('navTips')}
              </Button>
              <Button variant="ghost" onClick={() => navigate('/courses')} className="text-gray-300 hover:text-white hover:bg-white/10">
                <Target className="w-4 h-4 mr-2" />
                {t('navCourses')}
              </Button>
              <Button variant="ghost" onClick={() => navigate('/pricing')} className="text-gray-300 hover:text-white hover:bg-white/10">
                {t('navPricing')}
              </Button>
              <Button variant="ghost" onClick={() => navigate('/profile')} className="text-gray-300 hover:text-white hover:bg-white/10">
                <User className="w-4 h-4 mr-2" />
                {user.name}
              </Button>
              <Button variant="ghost" onClick={onLogout} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                <LogOut className="w-4 h-4 mr-2" />
                {t('navLogout')}
              </Button>
            </div>
            {/* Mobile menu toggle */}
            <button
              type="button"
              className="md:hidden p-2 rounded-lg border border-white/20 text-white hover:bg-white/10"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </nav>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-slate-900/95 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
              {testModules.map((m) => (
                <Button
                  key={m.type}
                  variant="ghost"
                  className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10"
                  onClick={() => { startTest(m.type); setMobileMenuOpen(false); }}
                >
                  <m.icon className="w-4 h-4 mr-3" />
                  {m.title}
                </Button>
              ))}
              <hr className="border-white/10 my-2" />
              <Button variant="ghost" className="w-full justify-start text-gray-300" onClick={() => { navigate('/tips'); setMobileMenuOpen(false); }}>
                <BookMarked className="w-4 h-4 mr-3" /> Tips
              </Button>
              <Button variant="ghost" className="w-full justify-start text-gray-300" onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }}>
                <User className="w-4 h-4 mr-3" /> Profile
              </Button>
              <Button variant="ghost" className="w-full justify-start text-red-400" onClick={onLogout}>
                <LogOut className="w-4 h-4 mr-3" /> Logout
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Welcome back, {user.name?.split(' ')[0] || 'Student'}! 👋
          </h1>
          <p className="text-gray-400">Continue your IELTS preparation journey</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 bg-white/5 backdrop-blur-xl border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Tests Taken</p>
                <p className="text-xl font-bold text-white">{progress?.total_tests || 0}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-white/5 backdrop-blur-xl border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Award className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Avg. Band</p>
                <p className="text-xl font-bold text-white">{progress?.average_band?.toFixed(1) || '-'}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-white/5 backdrop-blur-xl border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Study Time</p>
                <p className="text-xl font-bold text-white">{totalHours}h {totalMinutes}m</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-white/5 backdrop-blur-xl border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Flame className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Best Score</p>
                <p className="text-xl font-bold text-white">{progress?.best_band?.toFixed(1) || '-'}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Practice Tests Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-cyan-400" />
              Practice Tests
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {testModules.map((module) => (
              <Card
                key={module.type}
                className="p-5 bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 cursor-pointer group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                onClick={() => startTest(module.type)}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <module.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">{module.title}</h3>
                <p className="text-sm text-gray-400 mb-3">{module.description}</p>
                {perSkillStats[module.type]?.avg && (
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-gray-300">Best: {perSkillStats[module.type].best}</span>
                  </div>
                )}
                <Button
                  size="sm"
                  className={`w-full mt-4 bg-gradient-to-r ${module.color} text-white border-0 opacity-0 group-hover:opacity-100 transition-opacity`}
                >
                  Start Test <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Learning Tools Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Learning Tools
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Level Test Card */}
            <Card className="p-5 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-xl border-cyan-500/30 hover:border-cyan-400/50 cursor-pointer group transition-all duration-300 hover:-translate-y-1"
              onClick={() => navigate('/level-test')}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/30">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">Level Test</h3>
              <p className="text-sm text-gray-300">Find your current level</p>
              <ChevronRight className="w-5 h-5 text-cyan-400 mt-3 group-hover:translate-x-1 transition-transform" />
            </Card>

            {/* Vocabulary & Grammar Card */}
            <Card className="p-5 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-xl border-emerald-500/30 hover:border-emerald-400/50 cursor-pointer group transition-all duration-300 hover:-translate-y-1"
              onClick={() => navigate('/vocab-grammar')}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30">
                <BookMarked className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">Vocab & Grammar</h3>
              <p className="text-sm text-gray-300">Build your foundation</p>
              <ChevronRight className="w-5 h-5 text-emerald-400 mt-3 group-hover:translate-x-1 transition-transform" />
            </Card>

            {/* Writing Practice Card */}
            <Card className="p-5 bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-xl border-orange-500/30 hover:border-orange-400/50 cursor-pointer group transition-all duration-300 hover:-translate-y-1"
              onClick={() => navigate('/writing-practice')}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mb-4 shadow-lg shadow-orange-500/30">
                <PenTool className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">Writing Practice</h3>
              <p className="text-sm text-gray-300">Task 1 & 2 with AI feedback</p>
              <ChevronRight className="w-5 h-5 text-orange-400 mt-3 group-hover:translate-x-1 transition-transform" />
            </Card>

            {/* Speaking Practice Card */}
            <Card className="p-5 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl border-purple-500/30 hover:border-purple-400/50 cursor-pointer group transition-all duration-300 hover:-translate-y-1"
              onClick={() => navigate('/speaking-practice')}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-4 shadow-lg shadow-purple-500/30">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">Speaking Practice</h3>
              <p className="text-sm text-gray-300">Parts 1-3 with evaluation</p>
              <ChevronRight className="w-5 h-5 text-purple-400 mt-3 group-hover:translate-x-1 transition-transform" />
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        {hasProgress && progress.recent_attempts?.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Recent Activity
              </h2>
            </div>
            <Card className="bg-white/5 backdrop-blur-xl border-white/10 overflow-hidden">
              <div className="divide-y divide-white/10">
                {progress.recent_attempts.slice(0, 5).map((attempt, idx) => {
                  const moduleConfig = testModules.find(m => m.type === attempt.test_type);
                  const Icon = moduleConfig?.icon || BookOpen;
                  return (
                    <div key={idx} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${moduleConfig?.color || 'from-gray-500 to-gray-600'} flex items-center justify-center`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-white capitalize">{attempt.test_type} Test</p>
                          <p className="text-sm text-gray-400">
                            {attempt.completed_at ? new Date(attempt.completed_at).toLocaleDateString() : 'Recently'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${
                          attempt.band_score >= 7 ? 'text-green-400' :
                          attempt.band_score >= 6 ? 'text-cyan-400' :
                          attempt.band_score >= 5 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          Band {attempt.band_score?.toFixed(1) || '-'}
                        </p>
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
