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

export default function Progress({ user }) {
  const navigate = useNavigate();
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
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-violet-50/30 to-gray-100 flex items-center justify-center">
        <Card className="p-8 text-center bg-white border-0 shadow-lg rounded-2xl">
          <p className="text-gray-500 mb-4">Please login to view your progress</p>
          <Button onClick={() => navigate('/')} className="bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0">
            Go to Login
          </Button>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-violet-50/30 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-violet-50/30 to-gray-100 py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-6 text-gray-600 hover:text-violet-600">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Progress</h1>
          <p className="text-gray-500">Track your IELTS journey and improvement</p>
        </div>

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
            <Card className="p-6 bg-gradient-to-br from-red-50 to-orange-50 border-red-200 rounded-2xl">
              <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Areas to Improve
              </h3>
              <div className="space-y-2">
                {Object.entries(stats.byType)
                  .filter(([_, data]) => (data.avg_score || data.avgBand || 0) > 0 && (data.avg_score || data.avgBand || 0) < 6)
                  .sort((a, b) => (a[1].avg_score || a[1].avgBand || 0) - (b[1].avg_score || b[1].avgBand || 0))
                  .slice(0, 3)
                  .map(([type, data]) => (
                    <div key={type} className="flex items-center justify-between p-2 bg-white rounded-lg">
                      <span className="capitalize font-medium text-gray-900">{type}</span>
                      <span className={`px-2 py-0.5 rounded ${getBandBgColor(data.avg_score || data.avgBand || 0)}`}>
                        Band {(data.avg_score || data.avgBand || 0).toFixed(1)}
                      </span>
                    </div>
                  ))}
                {Object.entries(stats.byType).filter(([_, data]) => (data.avg_score || data.avgBand || 0) > 0 && (data.avg_score || data.avgBand || 0) < 6).length === 0 && (
                  <p className="text-sm text-gray-500">Great job! Keep practicing to maintain your level.</p>
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
                  .map(([type, data]) => (
                    <div key={type} className="flex items-center justify-between p-2 bg-white rounded-lg">
                      <span className="capitalize font-medium text-gray-900">{type}</span>
                      <span className={`px-2 py-0.5 rounded ${getBandBgColor(data.avg_score || data.avgBand || 0)}`}>
                        Band {(data.avg_score || data.avgBand || 0).toFixed(1)}
                      </span>
                    </div>
                  ))}
                {Object.entries(stats.byType).filter(([_, data]) => (data.avg_score || data.avgBand || 0) >= 6).length === 0 && (
                  <p className="text-sm text-gray-500">Keep practicing! You'll develop strengths with more practice.</p>
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
