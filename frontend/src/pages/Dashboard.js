import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { BookOpen, Headphones, Mic, PenTool, Trophy, TrendingUp, Target, BookMarked, LogOut, Menu } from 'lucide-react';
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
      description: '60 minutes • 40 questions',
      color: 'from-blue-500 to-indigo-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      type: 'listening',
      icon: Headphones,
      title: 'Listening',
      description: '40 minutes • 40 questions',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      type: 'writing',
      icon: PenTool,
      title: 'Writing',
      description: '60 minutes • 2 tasks',
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    },
    {
      type: 'speaking',
      icon: Mic,
      title: 'Speaking',
      description: '15 minutes • AI interview',
      color: 'from-green-500 to-teal-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    }
  ];

  const startTest = (testType) => {
    // Speaking Test 1 is always accessible for practice (without AI examiner),
    // so we don't block navigation here. Paywall is enforced when starting
    // the live AI speaking session instead.
    navigate(`/test/${testType}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  // Derived progress stats for richer dashboard
  const hasProgress = !!(progress && progress.total_tests > 0);
  const skillOrder = ['listening', 'reading', 'writing', 'speaking'];

  let perSkillStats = null;
  let bestAttempt = null;
  let totalTimeSeconds = 0;
  let last30Tests = 0;
  let prev30Tests = 0;

  if (hasProgress && Array.isArray(progress.recent_attempts)) {
    const bySkill = {};
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const sixtyDaysAgo = new Date(now);
    sixtyDaysAgo.setDate(now.getDate() - 60);

    progress.recent_attempts.forEach((attempt) => {
      const band = typeof attempt.band_score === 'number' ? attempt.band_score : 0;
      const type = attempt.test_type;
      const dt = attempt.completed_at ? new Date(attempt.completed_at) : null;

      if (dt instanceof Date && !Number.isNaN(dt.getTime())) {
        if (dt >= thirtyDaysAgo) {
          last30Tests += 1;
        } else if (dt >= sixtyDaysAgo && dt < thirtyDaysAgo) {
          prev30Tests += 1;
        }
      }

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

      if (!bestAttempt || band > (bestAttempt.band_score ?? 0)) {
        bestAttempt = attempt;
      }
    });

    perSkillStats = {};
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
  const lastTest = hasProgress && progress.recent_attempts.length > 0 ? progress.recent_attempts[0] : null;
  const lastTestDate = lastTest && lastTest.completed_at
    ? new Date(lastTest.completed_at).toLocaleDateString()
    : null;



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">IELTS Ace</h1>
          </div>
          <nav className="flex items-center space-x-2">
            <LanguageSwitcher compact />
            {/* Desktop nav */}
            <div className="hidden md:flex items-center space-x-2">
              <Button
                data-testid="tips-nav-btn"
                variant="ghost"
                onClick={() => navigate('/tips')}
                className="text-gray-600"
              >
                <BookMarked className="w-4 h-4 mr-2" />
                {t('navTips')}
              </Button>
              <Button
                data-testid="courses-nav-btn"
                variant="ghost"
                onClick={() => navigate('/courses')}
                className="text-gray-600"
              >
                <Target className="w-4 h-4 mr-2" />
                {t('navCourses')}
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate('/pricing')}
                className="text-gray-600"
              >
                {t('navPricing')}
              </Button>
              <Button
                data-testid="profile-nav-btn"
                variant="ghost"
                onClick={() => navigate('/profile')}
                className="text-gray-600"
              >
                {user.name}
              </Button>
              <Button
                data-testid="logout-btn"
                variant="outline"
                onClick={onLogout}
                className="text-red-600 border-red-200"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {t('navLogout')}
              </Button>
            </div>
            {/* Mobile menu toggle */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </nav>
        </div>

      {/* Mobile top menu (Dashboard, Tips, Courses, Pricing, Profile, Logout) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-gray-200 bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col space-y-1">
            <Button
              variant="ghost"
              className="justify-start text-gray-700"
              onClick={() => {
                navigate('/dashboard');
                setMobileMenuOpen(false);
              }}
            >
              Dashboard
            </Button>
            {/* Test sections inside mobile menu for quick access */}
            <Button
              variant="ghost"
              className="justify-start text-gray-700"
              onClick={() => {
                navigate('/test/listening');
                setMobileMenuOpen(false);
              }}
            >
              Listening
            </Button>
            <Button
              variant="ghost"
              className="justify-start text-gray-700"
              onClick={() => {
                navigate('/test/reading');
                setMobileMenuOpen(false);
              }}
            >
              Reading
            </Button>
            <Button
              variant="ghost"
              className="justify-start text-gray-700"
              onClick={() => {
                navigate('/test/writing');
                setMobileMenuOpen(false);
              }}
            >
              Writing
            </Button>
            <Button
              variant="ghost"
              className="justify-start text-gray-700"
              onClick={() => {
                navigate('/test/speaking');
                setMobileMenuOpen(false);
              }}
            >
              Speaking
            </Button>
            <Button
              variant="ghost"
              className="justify-start text-gray-700"
              onClick={() => {
                navigate('/tips');
                setMobileMenuOpen(false);
              }}
            >
              {t('navTips')}
            </Button>
            <Button
              variant="ghost"
              className="justify-start text-gray-700"
              onClick={() => {
                navigate('/courses');
                setMobileMenuOpen(false);
              }}
            >
              {t('navCourses')}
            </Button>
            <Button
              variant="ghost"
              className="justify-start text-gray-700"
              onClick={() => {
                navigate('/pricing');
                setMobileMenuOpen(false);
              }}
            >
              {t('navPricing')}
            </Button>
            <Button
              variant="ghost"
              className="justify-start text-gray-700"
              onClick={() => {
                navigate('/profile');
                setMobileMenuOpen(false);
              }}
            >
              {user.name}
            </Button>
            <Button
              variant="outline"
              className="justify-start text-red-600 border-red-200"
              onClick={() => {
                onLogout();
                setMobileMenuOpen(false);
              }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t('navLogout')}
            </Button>
          </div>
        </div>
      )}

            </div>
            {/* Mobile menu toggle */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name}! 👋
          </h2>
          <p className="text-xl text-gray-600">
            Ready to continue your IELTS preparation journey?
          </p>
        </div>

        {/* Tiny quick stats strip so it doesn't dominate the layout */}
        {hasProgress && (
          <div className="mb-4 text-xs text-gray-600 flex flex-wrap gap-4">
            <span>
              Tests completed:{' '}
              <span className="font-semibold text-gray-900">{progress.total_tests}</span>
            </span>
            <span>
              Average band:{' '}
              <span className={`font-semibold ${getBandScoreColor(progress.average_band_score)}`}>
                {progress.average_band_score}
              </span>
            </span>
            <span>
              This week:{' '}
              <span className="font-semibold text-gray-900">
                {progress.recent_attempts.filter((a) => {
                  const attemptDate = new Date(a.completed_at);
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return attemptDate >= weekAgo;
                }).length}
              </span>
            </span>
          </div>
        )}

        {/* Plan, credits & user info row. Quick stats moved into a small widget. */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 md:col-span-2 flex flex-col justify-between bg-white/80 border-sky-100">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-sky-600 uppercase tracking-wide mb-1">Current Plan</p>
                <p className="text-2xl font-bold text-gray-900 capitalize">{userDetails?.plan || 'free'}</p>
                {userDetails?.subscription && (
                  <p className="text-xs text-gray-600 mt-1">{userDetails.subscription}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Speaking Credits</p>
                <p className="text-3xl font-extrabold text-sky-700">{userDetails?.examCredits ?? 0}</p>
                <p className="text-[11px] text-gray-500 mt-1">Each AI Speaking exam session uses 1 credit.</p>
                {((userDetails?.ai_interview_free_seconds_used ?? user.ai_interview_free_seconds_used ?? 0) < 180) && (
                  <p className="text-[11px] text-sky-700 mt-1 font-semibold">
                    {t('speakingFreeTrialAvailable')}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                onClick={() => navigate('/pricing')}
              >
                View / Upgrade Plan
              </Button>
              {userDetails?.email?.includes('aga.durdy') && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto border-dashed border-sky-300"
                  onClick={() => navigate('/admin/credits')}
                >
                  Admin: Top Up Credits
                </Button>
              )}
            </div>
          </Card>

          {/* User info card */}
          <Card className="p-4 flex flex-col justify-between bg-white/80 border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Your Info</p>
                <p className="text-sm font-semibold text-gray-900">{userDetails?.name || user.name}</p>
                <p className="text-xs text-gray-600 break-all">{userDetails?.email || user.email}</p>
              </div>
            </div>
            <div className="mt-1 text-xs text-gray-500 space-y-1">
              <p>
                Current plan:
                <span className="font-semibold text-gray-900 ml-1 capitalize">{userDetails?.plan || 'free'}</span>
              </p>
              <p>
                Speaking credits:
                <span className="font-semibold text-gray-900 ml-1">{userDetails?.examCredits ?? 0}</span>
              </p>
            </div>
          </Card>


          {userDetails?.email?.includes('aga.durdy') && (
            <Card className="p-4 flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Admin Tools</p>
                <p className="text-sm text-gray-700">Top up credits or change plan for any user.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 w-full"
                onClick={() => navigate('/admin/credits')}
              >
                Open Admin Credits
              </Button>
            </Card>
          )}
        </div>

        {/* Parent overview + Study summary */}
        {hasProgress && (
          <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="p-5 bg-white/80 border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Overview for Parents</h3>
              <p className="text-sm text-gray-700 mb-1">
                Your child has completed{' '}
                <span className="font-semibold">{progress.total_tests}</span> practice test
                {progress.total_tests === 1 ? '' : 's'} with an average band score of{' '}
                <span className="font-semibold">{progress.average_band_score}</span>.
              </p>
              {lastTestDate && (
                <p className="text-xs text-gray-600">
                  Last practice:{' '}
                  <span className="font-semibold">{lastTestDate}</span>
                </p>
              )}
              {bestAttempt && (
                <p className="text-xs text-gray-600 mt-1">
                  Best band so far:{' '}
                  <span className="font-semibold">{bestAttempt.band_score}</span> in{' '}
                  <span className="capitalize">{bestAttempt.test_type}</span>.
                </p>
              )}
            </Card>

            <Card className="p-5 bg-white/80 border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Study summary</h3>
              <p className="text-sm text-gray-700 mb-1">
                Total practice time:{' '}
                <span className="font-semibold">
                  {totalHours > 0 ? `${totalHours}h ` : ''}
                  {totalMinutes}m
                </span>
              </p>
              <p className="text-xs text-gray-600">
                Tests in last 30 days:{' '}
                <span className="font-semibold">{last30Tests}</span>
                {prev30Tests > 0 && (
                  <>
                    {' '}
                    (previous 30 days:{' '}
                    <span className="font-semibold">{prev30Tests}</span>)
                  </>
                )}
              </p>
            </Card>
          </div>
        )}

        {/* Per-skill performance */}
        {hasProgress && perSkillStats && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Skill performance</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {skillOrder.map((skill) => {
                const stat = perSkillStats[skill];
                const label = skill.charAt(0).toUpperCase() + skill.slice(1);
                return (
                  <Card key={skill} className="p-3 bg-white/80 border-gray-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</p>
                    <p className="text-sm text-gray-700">
                      Avg band:{' '}
                      <span className="font-semibold">
                        {stat.avg != null ? stat.avg : '—'}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500">
                      Best:{' '}
                      <span className="font-semibold">
                        {stat.best != null ? stat.best : '—'}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500">
                      Tests:{' '}
                      <span className="font-semibold">{stat.count}</span>
                    </p>
                  </Card>
                );
              })}
            </div>
          </div>
        )}


        {/* Test Modules */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Choose Your Test</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testModules.map((module) => (
              <Card
                key={module.type}
                data-testid={`test-module-${module.type}`}
                className="p-6 hover-lift cursor-pointer group"
                onClick={() => startTest(module.type)}
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <module.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{module.title}</h3>
                <p className="text-gray-600 mb-4">{module.description}</p>
                <Button
                  data-testid={`start-${module.type}-btn`}
                  className={`w-full ${module.bgColor} ${module.textColor} hover:opacity-90`}
                >
                  Start Test
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        {progress && progress.recent_attempts && progress.recent_attempts.length > 0 && (
          <div className="animate-fade-in">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h3>
            <Card className="p-6">
              <div className="space-y-4">
                {progress.recent_attempts.slice(0, 5).map((attempt, idx) => (
                  <div
                    key={idx}
                    data-testid={`recent-attempt-${idx}`}
                    className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full ${
                        attempt.test_type === 'reading' ? 'bg-blue-100' :
                        attempt.test_type === 'listening' ? 'bg-purple-100' :
                        attempt.test_type === 'writing' ? 'bg-orange-100' :
                        'bg-green-100'
                      } flex items-center justify-center`}>
                        {attempt.test_type === 'reading' && <BookOpen className="w-6 h-6 text-blue-600" />}
                        {attempt.test_type === 'listening' && <Headphones className="w-6 h-6 text-purple-600" />}
                        {attempt.test_type === 'writing' && <PenTool className="w-6 h-6 text-orange-600" />}
                        {attempt.test_type === 'speaking' && <Mic className="w-6 h-6 text-green-600" />}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 capitalize">{attempt.test_type} Test</p>
                        <p className="text-sm text-gray-600">
                          {new Date(attempt.completed_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {attempt.band_score > 0 && (
                        <p className={`text-2xl font-bold ${getBandScoreColor(attempt.band_score)}`}>
                          {attempt.band_score}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">
                        {Math.round(attempt.score)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Empty State */}
        {(!progress || progress.total_tests === 0) && (
          <Card className="p-12 text-center animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Start Your First Test
            </h3>
            <p className="text-gray-600 mb-6">
              Choose a test module above to begin your IELTS preparation
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
