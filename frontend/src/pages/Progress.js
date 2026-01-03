import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { 
  ArrowLeft, Trophy, TrendingUp, BarChart3, BookOpen, Headphones, 
  Mic, PenTool, Target, ChevronRight, Calendar, Clock, AlertTriangle,
  CheckCircle, XCircle, Award
} from 'lucide-react';
import api from '../lib/api';
import { useTheme, THEME_MODES } from '../contexts/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

export default function Progress({ user }) {
  const navigate = useNavigate();
  
  // Theme support
  const { activeTheme } = useTheme();
  const isDark = activeTheme === THEME_MODES.DARK;
  const isNightShift = activeTheme === THEME_MODES.NIGHT_SHIFT;
  
  // Theme-aware classes
  const bgMain = isDark ? 'bg-gray-900' : isNightShift ? 'bg-amber-50' : 'bg-gradient-to-br from-slate-50 to-purple-50';
  const bgCard = isDark ? 'bg-gray-800 border-gray-700' : isNightShift ? 'bg-amber-100/50 border-amber-200' : 'bg-white border-gray-200';
  const bgHeader = isDark ? 'bg-gray-800 border-gray-700' : isNightShift ? 'bg-amber-100 border-amber-200' : 'bg-white border-gray-200';
  const textPrimary = isDark ? 'text-gray-100' : isNightShift ? 'text-amber-900' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : isNightShift ? 'text-amber-700' : 'text-gray-600';
  
  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState([]);
  const [stats, setStats] = useState({
    totalTests: 0,
    avgBand: 0,
    byType: {},
    recentTrend: []
  });
  const [filter, setFilter] = useState('all');
  const [targetBand, setTargetBand] = useState(() => {
    const saved = localStorage.getItem('targetBand');
    return saved ? parseFloat(saved) : 7.0;
  });
  const [showTargetModal, setShowTargetModal] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadProgress();
    }
  }, [user]);

  const loadProgress = async () => {
    try {
      const response = await api.get(`/progress/${user.id}`);
      const data = response.data || response;
      
      // recent_attempts contains the test attempts
      const testAttempts = data.recent_attempts || [];
      
      setAttempts(testAttempts);
      
      // Use stats from API response
      setStats({
        totalTests: data.total_tests || 0,
        avgBand: data.average_band_score || 0,
        byType: data.by_type || {},
        recentTrend: testAttempts.slice(0, 5).map(a => ({ 
          date: a.completed_at, 
          band: a.band_score, 
          type: a.test_type 
        }))
      });
    } catch (error) {
      console.error('Failed to load progress', error);
    } finally {
      setLoading(false);
    }
  };

  // Stats are now calculated by the backend API

  const getTypeIcon = (type) => {
    switch (type) {
      case 'reading': return <BookOpen className="w-5 h-5" />;
      case 'listening': return <Headphones className="w-5 h-5" />;
      case 'writing': return <PenTool className="w-5 h-5" />;
      case 'speaking': return <Mic className="w-5 h-5" />;
      default: return <Target className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'reading': return 'bg-blue-500';
      case 'listening': return 'bg-purple-500';
      case 'writing': return 'bg-orange-500';
      case 'speaking': return 'bg-emerald-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeLightColor = (type) => {
    switch (type) {
      case 'reading': return 'bg-blue-100 text-blue-700';
      case 'listening': return 'bg-purple-100 text-purple-700';
      case 'writing': return 'bg-orange-100 text-orange-700';
      case 'speaking': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getBandColor = (band) => {
    if (band >= 7) return 'text-green-600';
    if (band >= 6) return 'text-blue-600';
    if (band >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBandBgColor = (band) => {
    if (band >= 7) return 'bg-green-100 text-green-700';
    if (band >= 6) return 'bg-blue-100 text-blue-700';
    if (band >= 5) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Unknown';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredAttempts = filter === 'all' 
    ? attempts 
    : attempts.filter(a => a.test_type === filter);

  // Calculate weekly comparison
  const getWeeklyComparison = () => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    
    const thisWeek = attempts.filter(a => new Date(a.completed_at) > oneWeekAgo);
    const lastWeek = attempts.filter(a => new Date(a.completed_at) > twoWeeksAgo && new Date(a.completed_at) <= oneWeekAgo);
    
    const thisWeekAvg = thisWeek.length > 0 
      ? thisWeek.reduce((acc, a) => acc + (a.band_score || 0), 0) / thisWeek.length 
      : 0;
    const lastWeekAvg = lastWeek.length > 0 
      ? lastWeek.reduce((acc, a) => acc + (a.band_score || 0), 0) / lastWeek.length 
      : 0;
    
    return {
      thisWeek: { count: thisWeek.length, avg: thisWeekAvg },
      lastWeek: { count: lastWeek.length, avg: lastWeekAvg },
      change: thisWeekAvg - lastWeekAvg
    };
  };

  // Get study plan recommendation
  const getStudyPlan = () => {
    const weakest = Object.entries(stats.byType)
      .filter(([_, data]) => (data.avg_score || data.avgBand || 0) > 0)
      .sort((a, b) => (a[1].avg_score || a[1].avgBand || 0) - (b[1].avg_score || b[1].avgBand || 0))[0];
    
    const gap = targetBand - stats.avgBand;
    
    if (!weakest || stats.totalTests === 0) {
      return {
        focus: 'Start with Level Test',
        recommendation: 'Take a comprehensive level test to identify your current IELTS band and areas for improvement.',
        weeklyGoal: '2-3 practice tests',
        icon: Target
      };
    }
    
    if (gap <= 0) {
      return {
        focus: 'Maintain & Polish',
        recommendation: `Great job! You've reached your target. Focus on maintaining your level and polishing weak areas like ${weakest[0]}.`,
        weeklyGoal: '1-2 full tests + review',
        icon: Award
      };
    }
    
    return {
      focus: `Focus on ${weakest[0].charAt(0).toUpperCase() + weakest[0].slice(1)}`,
      recommendation: `Your ${weakest[0]} score (${(weakest[1].avg_score || weakest[1].avgBand || 0).toFixed(1)}) needs the most improvement. Practice ${weakest[0]} daily to boost your overall band.`,
      weeklyGoal: gap > 1 ? '5-7 focused sessions' : '3-4 practice tests',
      icon: TrendingUp
    };
  };

  const handleSetTarget = (band) => {
    setTargetBand(band);
    localStorage.setItem('targetBand', band.toString());
    setShowTargetModal(false);
  };

  const weeklyData = getWeeklyComparison();
  const studyPlan = getStudyPlan();

  if (!user) {
    return (
      <div className={`min-h-screen ${bgMain} flex items-center justify-center transition-colors duration-300`}>
        <Card className={`p-8 text-center ${bgCard} shadow-lg rounded-2xl`}>
          <p className={`${textSecondary} mb-4`}>Please login to view your progress</p>
          <Button onClick={() => navigate('/')} className="bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0">
            Go to Login
          </Button>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`min-h-screen ${bgMain} flex items-center justify-center transition-colors duration-300`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={textSecondary}>Loading your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgMain} py-8 px-4 sm:px-6 transition-colors duration-300`}>
      <div className="max-w-5xl mx-auto">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className={`mb-6 ${textSecondary} hover:text-violet-600`}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${textPrimary} mb-2`}>My Progress</h1>
          <p className={textSecondary}>Track your IELTS journey and improvement</p>
        </div>

        {/* Target Band & Weekly Comparison */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {/* Target Band Card */}
          <Card className="p-6 bg-gradient-to-br from-violet-500 to-purple-600 border-0 shadow-xl rounded-2xl text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                <span className="font-semibold">Target Band Score</span>
              </div>
              <button 
                onClick={() => setShowTargetModal(true)}
                className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-all"
              >
                Change
              </button>
            </div>
            <div className="flex items-end gap-4">
              <span className="text-5xl font-bold">{targetBand.toFixed(1)}</span>
              <div className="flex-1 mb-2">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Current: {stats.avgBand > 0 ? stats.avgBand.toFixed(1) : '-'}</span>
                  <span>Gap: {stats.avgBand > 0 ? (targetBand - stats.avgBand).toFixed(1) : '-'}</span>
                </div>
                <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((stats.avgBand / targetBand) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Weekly Comparison Card */}
          <Card className="p-6 bg-white border-0 shadow-xl rounded-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-violet-500" />
              <span className="font-semibold text-gray-900">Weekly Comparison</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">This Week</p>
                <p className="text-2xl font-bold text-gray-900">{weeklyData.thisWeek.count} tests</p>
                <p className="text-sm text-gray-600">Avg: {weeklyData.thisWeek.avg > 0 ? weeklyData.thisWeek.avg.toFixed(1) : '-'}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Last Week</p>
                <p className="text-2xl font-bold text-gray-900">{weeklyData.lastWeek.count} tests</p>
                <p className="text-sm text-gray-600">Avg: {weeklyData.lastWeek.avg > 0 ? weeklyData.lastWeek.avg.toFixed(1) : '-'}</p>
              </div>
            </div>
            {weeklyData.change !== 0 && weeklyData.thisWeek.avg > 0 && weeklyData.lastWeek.avg > 0 && (
              <div className={`mt-3 p-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                weeklyData.change > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {weeklyData.change > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingUp className="w-4 h-4 transform rotate-180" />}
                {weeklyData.change > 0 ? '+' : ''}{weeklyData.change.toFixed(1)} band from last week
              </div>
            )}
          </Card>
        </div>

        {/* Study Plan Recommendation */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 shadow-lg rounded-2xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg flex-shrink-0">
              <studyPlan.icon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-lg mb-1">📚 Study Plan: {studyPlan.focus}</h3>
              <p className="text-gray-700 mb-3">{studyPlan.recommendation}</p>
              <div className="flex items-center gap-4">
                <span className="text-sm bg-amber-200 text-amber-800 px-3 py-1 rounded-full font-medium">
                  Weekly Goal: {studyPlan.weeklyGoal}
                </span>
                <Button 
                  onClick={() => navigate('/test/reading')}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-sm"
                >
                  Start Practice
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Target Band Modal */}
        {showTargetModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="p-6 bg-white rounded-2xl w-full max-w-md shadow-2xl">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Set Your Target Band</h3>
              <p className="text-gray-600 mb-4">What IELTS band score are you aiming for?</p>
              <div className="grid grid-cols-4 gap-2 mb-6">
                {[5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5].map(band => (
                  <button
                    key={band}
                    onClick={() => handleSetTarget(band)}
                    className={`p-3 rounded-xl font-bold transition-all ${
                      targetBand === band 
                        ? 'bg-violet-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-violet-100'
                    }`}
                  >
                    {band}
                  </button>
                ))}
              </div>
              <Button 
                onClick={() => setShowTargetModal(false)} 
                variant="outline" 
                className="w-full"
              >
                Cancel
              </Button>
            </Card>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="p-5 bg-white border-0 shadow-lg rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTests}</p>
                <p className="text-sm text-gray-500">Total Tests</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-white border-0 shadow-lg rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${getBandColor(stats.avgBand)}`}>
                  {stats.avgBand > 0 ? stats.avgBand.toFixed(1) : '-'}
                </p>
                <p className="text-sm text-gray-500">Avg Band</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-white border-0 shadow-lg rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.byType.reading?.count || 0}
                </p>
                <p className="text-sm text-gray-500">Reading Tests</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-white border-0 shadow-lg rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg">
                <PenTool className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.byType.writing?.count || 0}
                </p>
                <p className="text-sm text-gray-500">Writing Tests</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Skill Breakdown */}
        {Object.keys(stats.byType).length > 0 && (
          <Card className="p-6 mb-8 bg-white border-0 shadow-lg rounded-2xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-violet-500" />
              Skill Breakdown
            </h2>
            <div className="grid md:grid-cols-4 gap-4">
              {['reading', 'listening', 'writing', 'speaking'].map(type => {
                const data = stats.byType[type];
                if (!data) return (
                  <div key={type} className="p-4 bg-gray-50 rounded-xl text-center">
                    <div className={`w-10 h-10 rounded-xl ${getTypeColor(type)} flex items-center justify-center mx-auto mb-2 opacity-30`}>
                      {getTypeIcon(type)}
                    </div>
                    <p className="font-medium text-gray-400 capitalize">{type}</p>
                    <p className="text-sm text-gray-400">No tests yet</p>
                  </div>
                );
                return (
                  <div key={type} className="p-4 bg-gray-50 rounded-xl text-center">
                    <div className={`w-10 h-10 rounded-xl ${getTypeColor(type)} flex items-center justify-center mx-auto mb-2 text-white`}>
                      {getTypeIcon(type)}
                    </div>
                    <p className="font-medium text-gray-900 capitalize">{type}</p>
                    <p className={`text-2xl font-bold ${getBandColor(data.avgBand)}`}>
                      {data.avgBand > 0 ? data.avgBand.toFixed(1) : '-'}
                    </p>
                    <p className="text-xs text-gray-500">{data.count} test{data.count !== 1 ? 's' : ''}</p>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Weaknesses & Strengths */}
        {stats.avgBand > 0 && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="p-6 bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200 rounded-2xl">
              <h3 className="font-semibold text-violet-800 mb-3 flex items-center gap-2">
                <Target className="w-5 h-5" /> Recommended Courses
              </h3>
              <div className="space-y-3">
                {Object.entries(stats.byType)
                  .filter(([_, data]) => (data.avg_score || data.avgBand || 0) > 0 && (data.avg_score || data.avgBand || 0) < 6)
                  .sort((a, b) => (a[1].avg_score || a[1].avgBand || 0) - (b[1].avg_score || b[1].avgBand || 0))
                  .slice(0, 3)
                  .map(([type, data]) => {
                    const score = data.avg_score || data.avgBand || 0;
                    const courses = {
                      reading: { name: 'Reading Mastery Course', path: '/mastery-course', icon: '📖', level: score < 4 ? 'Beginner' : 'Intermediate' },
                      listening: { name: 'Listening Skills Course', path: '/beginner-course', icon: '🎧', level: score < 4 ? 'Beginner' : 'Intermediate' },
                      writing: { name: 'Writing Excellence Course', path: '/advanced-mastery', icon: '✍️', level: score < 4 ? 'Beginner' : 'Advanced' },
                      speaking: { name: 'Speaking Confidence Course', path: '/speaking-practice', icon: '🎤', level: score < 4 ? 'Beginner' : 'Intermediate' }
                    };
                    const course = courses[type] || { name: `${type} Course`, path: '/mastery-course', icon: '📚', level: 'All Levels' };
                    return (
                      <div key={type} className="p-3 bg-white rounded-lg shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{course.icon}</span>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{course.name}</p>
                              <p className="text-xs text-gray-500">{course.level} • Band {score.toFixed(1)} → {targetBand}</p>
                            </div>
                          </div>
                        </div>
                        <Button 
                          onClick={() => navigate(course.path)}
                          size="sm"
                          className="w-full bg-violet-600 hover:bg-violet-700 text-white text-xs"
                        >
                          Start Course →
                        </Button>
                      </div>
                    );
                  })}
                {Object.entries(stats.byType).filter(([_, data]) => (data.avg_score || data.avgBand || 0) > 0 && (data.avg_score || data.avgBand || 0) < 6).length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-sm text-green-600 font-medium mb-2">🎉 All skills at Band 6+!</p>
                    <Button 
                      onClick={() => navigate('/advanced-mastery')}
                      variant="outline"
                      size="sm"
                      className="text-violet-600 border-violet-300"
                    >
                      Try Advanced Course
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 rounded-2xl">
              <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" /> Your Strengths
              </h3>
              <div className="space-y-2">
                {Object.entries(stats.byType)
                  .filter(([_, data]) => (data.avg_score || data.avgBand || 0) >= 6)
                  .sort((a, b) => (b[1].avg_score || b[1].avgBand || 0) - (a[1].avg_score || a[1].avgBand || 0))
                  .slice(0, 3)
                  .map(([type, data]) => {
                    const score = data.avg_score || data.avgBand || 0;
                    const strengths = {
                      reading: '📖 Strong comprehension and analysis',
                      listening: '🎧 Good at understanding spoken English',
                      writing: '✍️ Clear and structured writing',
                      speaking: '🎤 Confident verbal communication'
                    };
                    return (
                      <div key={type} className="p-3 bg-white rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="capitalize font-medium text-gray-900">{type}</span>
                          <span className={`px-2 py-0.5 rounded text-sm ${getBandBgColor(score)}`}>
                            Band {score.toFixed(1)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {strengths[type] || '⭐ Strong performance'}
                        </p>
                      </div>
                    );
                  })}
                {Object.entries(stats.byType).filter(([_, data]) => (data.avg_score || data.avgBand || 0) >= 6).length === 0 && (
                  <p className="text-sm text-gray-500">Keep practicing! Band 6+ achievements will appear here.</p>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {['all', 'reading', 'listening', 'writing', 'speaking'].map(type => (
            <Button
              key={type}
              variant={filter === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(type)}
              className={filter === type ? 'bg-violet-600 text-white' : ''}
            >
              {type === 'all' ? 'All Tests' : type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          ))}
        </div>

        {/* Test History with Feedback Preview */}
        <Card className="p-6 bg-white border-0 shadow-lg rounded-2xl">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Test History with Feedback</h2>
          
          {filteredAttempts.length === 0 ? (
            <div className="text-center py-12">
              <Target className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 mb-4">No tests taken yet</p>
              <Button onClick={() => navigate('/dashboard')} className="bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0">
                Start Practicing
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAttempts.map((attempt, idx) => {
                // Extract feedback summary for preview
                const feedback = attempt.feedback || {};
                const hasWritingFeedback = feedback.writing_feedback || feedback.task1 || feedback.task2;
                const hasSpeakingFeedback = feedback.speaking_feedback;
                const hasTeacherFeedback = feedback.teacher_feedback;
                
                // Get preview text
                let feedbackPreview = '';
                if (attempt.test_type === 'writing' && hasWritingFeedback) {
                  const task1Fb = feedback.task1?.overall_feedback || '';
                  const task2Fb = feedback.task2?.overall_feedback || '';
                  feedbackPreview = (task2Fb || task1Fb).substring(0, 150);
                  if (feedbackPreview.length === 150) feedbackPreview += '...';
                } else if (attempt.test_type === 'speaking' && hasSpeakingFeedback) {
                  const firstFeedback = Object.values(feedback.speaking_feedback)[0];
                  feedbackPreview = (firstFeedback?.feedback || '').substring(0, 150);
                  if (feedbackPreview.length === 150) feedbackPreview += '...';
                } else if (hasTeacherFeedback) {
                  feedbackPreview = (feedback.teacher_feedback.short || '').substring(0, 150);
                  if (feedbackPreview.length === 150) feedbackPreview += '...';
                }
                
                return (
                  <div 
                    key={attempt.id || idx}
                    className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors border-l-4"
                    style={{ borderLeftColor: attempt.band_score >= 6 ? '#10b981' : attempt.band_score >= 5 ? '#f59e0b' : '#ef4444' }}
                    onClick={() => navigate(`/results/${attempt.id}`)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${getTypeColor(attempt.test_type)} flex items-center justify-center text-white`}>
                          {getTypeIcon(attempt.test_type)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 capitalize">{attempt.test_type} Test</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="w-3 h-3" />
                            {formatDate(attempt.completed_at)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className={`text-2xl font-bold ${getBandColor(attempt.band_score)}`}>
                            {attempt.band_score > 0 ? attempt.band_score.toFixed(1) : '-'}
                          </p>
                          <p className="text-xs text-gray-500">Band Score</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                    
                    {/* Feedback Preview */}
                    {feedbackPreview && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-sm text-gray-600 italic">
                          "{feedbackPreview}"
                        </p>
                        <p className="text-xs text-violet-600 mt-1 font-medium">Click to see full feedback →</p>
                      </div>
                    )}
                    
                    {/* Score breakdown for writing */}
                    {attempt.test_type === 'writing' && (feedback.task1 || feedback.task2) && (
                      <div className="mt-3 pt-3 border-t border-gray-200 flex gap-4">
                        {feedback.task1?.band_score && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Task 1:</span>
                            <span className={`text-sm font-bold ${getBandColor(feedback.task1.band_score)}`}>
                              {feedback.task1.band_score}
                            </span>
                          </div>
                        )}
                        {feedback.task2?.band_score && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Task 2:</span>
                            <span className={`text-sm font-bold ${getBandColor(feedback.task2.band_score)}`}>
                              {feedback.task2.band_score}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Score breakdown for reading/listening */}
                    {(attempt.test_type === 'reading' || attempt.test_type === 'listening') && feedback.correct !== undefined && (
                      <div className="mt-3 pt-3 border-t border-gray-200 flex gap-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-gray-700">{feedback.correct}/{feedback.total} correct</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">({Math.round(feedback.percentage || 0)}%)</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
