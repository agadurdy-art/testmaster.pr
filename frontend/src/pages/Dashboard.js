import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { BookOpen, Headphones, Mic, PenTool, Trophy, TrendingUp, Target, BookMarked, LogOut } from 'lucide-react';
import { getTests, getUserProgress, getUser } from '../lib/api';
import { getBandScoreColor, getBandScoreBg } from '../lib/utils';
import { toast } from 'sonner';

export default function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user.id]);

  const loadData = async () => {
    try {
      const [testsData, progressData] = await Promise.all([
        getTests(),
        getUserProgress(user.id)
      ]);
      setTests(testsData);
      setProgress(progressData);
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
            <Button
              data-testid="tips-nav-btn"
              variant="ghost"
              onClick={() => navigate('/tips')}
              className="text-gray-600"
            >
              <BookMarked className="w-4 h-4 mr-2" />
              Tips
            </Button>
            <Button
              data-testid="courses-nav-btn"
              variant="ghost"
              onClick={() => navigate('/courses')}
              className="text-gray-600"
            >
              <Target className="w-4 h-4 mr-2" />
              Courses
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate('/pricing')}
              className="text-gray-600"
            >
              Pricing
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
              Logout
            </Button>
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

        {/* Progress Stats */}
        {progress && progress.total_tests > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-slide-in">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tests Completed</p>
                  <p className="text-3xl font-bold text-gray-900">{progress.total_tests}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Average Band Score</p>
                  <p className={`text-3xl font-bold ${getBandScoreColor(progress.average_band_score)}`}>
                    {progress.average_band_score}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-full ${getBandScoreBg(progress.average_band_score)} flex items-center justify-center`}>
                  <TrendingUp className={`w-6 h-6 ${getBandScoreColor(progress.average_band_score)}`} />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">This Week</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {progress.recent_attempts.filter(a => {
                      const attemptDate = new Date(a.completed_at);
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return attemptDate >= weekAgo;
                    }).length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </Card>
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
