import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { 
  BookOpen, Lock, CheckCircle, Clock, Trophy, ArrowRight, ArrowLeft,
  FileText, Star, Target, ChevronRight, Award
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function LevelDetail({ user }) {
  const { levelId } = useParams();
  const navigate = useNavigate();
  const [level, setLevel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !user.id) {
      console.error('No user found, redirecting to home');
      navigate('/');
      return;
    }
    loadLevel();
  }, [levelId, user]);

  const loadLevel = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/learning-platform/levels/${levelId}?user_id=${user.id}`
      );
      const data = await response.json();
      setLevel(data);
    } catch (error) {
      console.error('Failed to load level:', error);
      toast.error('Failed to load level details');
    } finally {
      setLoading(false);
    }
  };

  const getUnitProgress = (unitId) => {
    if (!level?.user_progress?.unit_progress) return null;
    return level.user_progress.unit_progress.find(up => up.unit_id === unitId);
  };

  // Check if user is admin - all content unlocked for admins
  const isAdmin = user?.email && (
    user.email.toLowerCase().includes('admin@ieltsace') || 
    user.email.toLowerCase() === 'aga.durdy@gmail.com' ||
    user.email.toLowerCase() === 'ieltsace@testmaster.pro'
  );

  const isUnitUnlocked = (unit) => {
    // Admin users have access to all units
    if (isAdmin) return true;
    
    // First unit is always unlocked
    if (unit.unit_number === 1) return true;
    
    // Check if previous unit is completed
    const prevUnit = level.units.find(u => u.unit_number === unit.unit_number - 1);
    if (!prevUnit) return false;
    
    const prevProgress = getUnitProgress(prevUnit.id);
    return prevProgress?.completed || false;
  };

  const calculateUnitCompletion = (unit) => {
    const unitProg = getUnitProgress(unit.id);
    if (!unitProg) return 0;
    
    const totalLessons = unit.lessons.length;
    const completedLessons = unitProg.lesson_progress?.filter(lp => lp.completed).length || 0;
    
    return Math.round((completedLessons / totalLessons) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading level...</p>
        </div>
      </div>
    );
  }

  if (!level) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-slate-600 mb-4">Level not found</p>
          <Button onClick={() => navigate('/learning')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Learning Platform
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <Button 
            variant="ghost" 
            className="text-white hover:bg-white/20 mb-4"
            onClick={() => navigate('/learning')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Learning Path
          </Button>
          
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">{level.level_name}</h1>
          <p className="text-xl text-violet-100 mb-4">{level.description}</p>
          
          <div className="flex flex-wrap gap-4">
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
              <p className="text-sm text-violet-100">Target Band</p>
              <p className="text-xl font-bold">{level.target_band_range}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
              <p className="text-sm text-violet-100">Total Hours</p>
              <p className="text-xl font-bold">{level.total_estimated_hours}h</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
              <p className="text-sm text-violet-100">Units</p>
              <p className="text-xl font-bold">{level.units?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Units */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Units</h2>
        
        <div className="space-y-4">
          {(level.units || []).map((unit) => {
            const unitProg = getUnitProgress(unit.id);
            const unlocked = isUnitUnlocked(unit);
            const completion = calculateUnitCompletion(unit);

            return (
              <Card 
                key={unit.id}
                className={`overflow-hidden transition-all ${
                  unlocked 
                    ? 'hover:shadow-lg cursor-pointer border-l-4 border-l-violet-500' 
                    : 'opacity-60 border-l-4 border-l-slate-300'
                }`}
                onClick={() => unlocked && navigate(`/learning/unit/${unit.id}`)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full text-sm font-bold">
                          Unit {unit.unit_number}
                        </div>
                        <h3 className="text-xl font-bold">{unit.title}</h3>
                        {unitProg?.completed && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                        {!unlocked && (
                          <Lock className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <p className="text-slate-600 mb-4">{unit.description}</p>
                      
                      {/* Learning Objectives */}
                      {unit.learning_objectives && unit.learning_objectives.length > 0 && (
                        <div className="mb-4">
                          <p className="font-semibold text-sm text-slate-700 mb-2">Learning Objectives:</p>
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {unit.learning_objectives.map((obj, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                                <CheckCircle className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />
                                <span>{obj}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Stats */}
                      <div className="flex flex-wrap gap-4 mb-4">
                        <div className="flex items-center gap-2 text-slate-600">
                          <BookOpen className="w-4 h-4" />
                          <span className="text-sm">{unit.lessons.length} Lessons</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">{unit.estimated_hours}h</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <FileText className="w-4 h-4" />
                          <span className="text-sm">Unit Quiz</span>
                        </div>
                      </div>

                      {/* Progress */}
                      {unlocked && (
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-600">Progress</span>
                            <span className="font-semibold text-violet-600">{completion}%</span>
                          </div>
                          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-500"
                              style={{ width: `${completion}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  {unlocked && (
                    <Button 
                      className="w-full sm:w-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/learning/unit/${unit.id}`);
                      }}
                    >
                      {unitProg?.completed ? 'Review Unit' : unitProg ? 'Continue Unit' : 'Start Unit'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}

                  {!unlocked && unit.unit_number > 1 && (
                    <p className="text-sm text-slate-500">
                      Complete Unit {unit.unit_number - 1} to unlock
                    </p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Exit Test Card */}
        {level.exit_test && (
          <Card className="mt-8 border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-amber-500 text-white p-3 rounded-full">
                  <Trophy className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold">Level Exit Test</h3>
                  <p className="text-slate-600">{level.exit_test.description}</p>
                </div>
                <div className="bg-amber-500 text-white px-4 py-2 rounded-lg text-center">
                  <p className="text-sm">Target</p>
                  <p className="text-xl font-bold">Band {level.exit_test.target_band}</p>
                </div>
              </div>

              <div className="flex gap-4 text-sm text-slate-600 mb-4">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {level.exit_test.duration_minutes} min
                </span>
                <span className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  Pass: {level.exit_test.passing_score}%
                </span>
              </div>

              {level.user_progress?.exit_test_attempts?.length > 0 && (
                <div className="mb-4 p-4 bg-white rounded-lg">
                  <p className="font-semibold text-sm mb-2">Previous Attempts:</p>
                  {level.user_progress.exit_test_attempts.slice(-3).map((attempt, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm py-2 border-b last:border-0">
                      <span>Attempt {attempt.attempt_number}</span>
                      <span className={`font-semibold ${attempt.passed ? 'text-green-600' : 'text-red-600'}`}>
                        {attempt.score.toFixed(1)}% {attempt.passed ? '✓' : '✗'}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <Button 
                className="bg-amber-500 hover:bg-amber-600"
                onClick={() => navigate(`/learning/lesson/${level.exit_test.id}`)}
                disabled={!level.user_progress?.completed}
              >
                {level.user_progress?.completed ? 'Passed! Review Test' : 'Complete all units first'}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
