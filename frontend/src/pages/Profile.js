import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoBack } from '../hooks/useGoBack';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Trophy, User, Mail, Calendar, Award, ArrowLeft } from 'lucide-react';
import { getUserProgress } from '../lib/api';
import { getBandScoreColor } from '../lib/utils';
import { toast } from 'sonner';
import { useTheme, THEME_MODES } from '../contexts/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

export default function Profile({ user, onLogout }) {
  const navigate = useNavigate();
  const goBack = useGoBack();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Theme support
  const { activeTheme } = useTheme();
  const isDark = activeTheme === THEME_MODES.DARK;
  const isNightShift = activeTheme === THEME_MODES.NIGHT_SHIFT;
  
  // Theme-aware classes
  const bgMain = isDark ? 'bg-gray-900' : isNightShift ? 'bg-amber-50' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50';
  const bgCard = isDark ? 'bg-gray-800 border-gray-700' : isNightShift ? 'bg-amber-100/50 border-amber-200' : 'bg-white border-gray-200';
  const bgHeader = isDark ? 'bg-gray-800 border-gray-700' : isNightShift ? 'bg-amber-100 border-amber-200' : 'bg-white border-gray-200';
  const textPrimary = isDark ? 'text-gray-100' : isNightShift ? 'text-amber-900' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : isNightShift ? 'text-amber-700' : 'text-gray-600';

  useEffect(() => {
    loadProgress();
  }, [user.id]);

  const loadProgress = async () => {
    try {
      const data = await getUserProgress(user.id);
      setProgress(data);
    } catch (error) {
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${bgMain} transition-colors duration-300`}>
      <header className={`${bgHeader} border-b sticky top-0 z-50 shadow-sm transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <h1 className={`text-2xl font-bold ${textPrimary}`}>IELTS Ace</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="outline"
              onClick={goBack}
              className={isDark ? 'border-gray-600' : ''}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <Card className="p-8">
          <div className="flex items-center space-x-6 mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-1">{user.name}</h2>
              <div className="flex items-center text-gray-600">
                <Mail className="w-4 h-4 mr-2" />
                <span>{user.email}</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading profile...</p>
            </div>
          ) : progress ? (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-600">Total Tests</p>
                    <Trophy className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-4xl font-bold text-blue-600">{progress.total_tests}</p>
                </div>

                <div className="bg-green-50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-600">Average Band Score</p>
                    <Award className="w-5 h-5 text-green-600" />
                  </div>
                  <p className={`text-4xl font-bold ${getBandScoreColor(progress.average_band_score)}`}>
                    {progress.average_band_score}
                  </p>
                </div>
              </div>

              {Object.keys(progress.by_type).length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Tests by Module</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(progress.by_type).map(([type, data]) => (
                      <div key={type} className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-600 capitalize mb-1">{type}</p>
                        <p className="text-2xl font-bold text-gray-900">{data.count}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-6 border-t">
                <div className="flex items-center text-gray-600 mb-4">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Member since {new Date(user.created_at).toLocaleDateString()}</span>
                </div>
                <Button
                  variant="outline"
                  onClick={onLogout}
                  className="text-red-600 border-red-200 w-full"
                >
                  Logout
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-600 py-12">No progress data available</p>
          )}
        </Card>
      </div>
    </div>
  );
}
