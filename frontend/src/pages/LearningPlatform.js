import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoBack } from '../hooks/useGoBack';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { 
  BookOpen, Lock, CheckCircle, Clock, Trophy, ArrowRight, ArrowLeft,
  GraduationCap, Target, Flame, Star, TrendingUp, Award
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function LearningPlatform({ user }) {
  const navigate = useNavigate();
  const goBack = useGoBack();
  const [levels, setLevels] = useState([]);
  const [userProgress, setUserProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !user.id) {
      console.error('No user found in LearningPlatform');
      navigate('/');
      return;
    }
    loadLearningPlatform();
  }, [user]);

  const loadLearningPlatform = async () => {
    try {
      const [levelsRes, progressRes] = await Promise.all([
        fetch(`${API_URL}/api/learning-platform/levels`),
        fetch(`${API_URL}/api/learning-platform/progress/${user.id}`)
      ]);

      const levelsData = await levelsRes.json();
      const progressData = await progressRes.json();

      setLevels(levelsData.levels);
      setUserProgress(progressData);
    } catch (error) {
      console.error('Failed to load learning platform:', error);
      toast.error('Failed to load learning platform');
    } finally {
      setLoading(false);
    }
  };

  const getLevelProgress = (levelId) => {
    if (!userProgress?.level_progress) return null;
    return userProgress.level_progress.find(lp => lp.level_id === levelId);
  };

  // Check if user is admin - all content unlocked for admins
  const isAdmin = user?.email && (
    user.email.toLowerCase().includes('admin@ieltsace') || 
    user.email.toLowerCase() === 'aga.durdy@gmail.com' ||
    user.email.toLowerCase() === 'ieltsace@testmaster.pro'
  );

  const isLevelUnlocked = (level) => {
    // Admin users have access to all levels
    if (isAdmin) return true;
    
    // First level is always unlocked
    if (level.level_order === 1) return true;
    
    // Check if previous level is completed
    const prevLevel = levels.find(l => l.level_order === level.level_order - 1);
    if (!prevLevel) return false;
    
    const prevProgress = getLevelProgress(prevLevel.id);
    return prevProgress?.completed || false;
  };

  const calculateLevelCompletion = (levelId) => {
    const levelProg = getLevelProgress(levelId);
    if (!levelProg) return 0;
    
    const level = levels.find(l => l.id === levelId);
    if (!level) return 0;
    
    const totalUnits = level.units.length;
    const completedUnits = levelProg.unit_progress?.filter(up => up.completed).length || 0;
    
    return Math.round((completedUnits / totalUnits) * 100);
  };

  const getPathwayColor = (pathway) => {
    const colors = {
      cambridge_yle: 'from-blue-500 to-cyan-500',
      cefr: 'from-purple-500 to-pink-500',
      ielts: 'from-amber-500 to-orange-500'
    };
    return colors[pathway] || 'from-gray-500 to-gray-600';
  };

  const getPathwayIcon = (pathway) => {
    const icons = {
      cambridge_yle: <GraduationCap className="w-6 h-6" />,
      cefr: <BookOpen className="w-6 h-6" />,
      ielts: <Trophy className="w-6 h-6" />
    };
    return icons[pathway] || <BookOpen className="w-6 h-6" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your learning path...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <Button 
            variant="ghost" 
            className="text-white hover:bg-white/20 mb-4"
            onClick={goBack}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                Your Learning Journey
              </h1>
              <p className="text-xl text-violet-100">
                From Cambridge YLE to IELTS Band 9.0
              </p>
            </div>
            
            {userProgress && (
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-6">
                <div className="text-center">
                  <Flame className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                  <p className="text-3xl font-bold">{Math.round(userProgress.total_hours_studied)}</p>
                  <p className="text-sm text-violet-100">Hours Studied</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      {userProgress?.current_level_id && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 p-6">
            <div className="flex items-center gap-4">
              <div className="bg-amber-500 text-white p-3 rounded-full">
                <Target className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Continue Learning</h3>
                <p className="text-slate-600">
                  {levels.find(l => l.id === userProgress.current_level_id)?.level_name}
                </p>
              </div>
              <Button 
                onClick={() => navigate(`/learning/level/${userProgress.current_level_id}`)}
                className="bg-amber-500 hover:bg-amber-600"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Levels Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-8">Learning Path</h2>
        
        <div className="space-y-6">
          {levels.map((level, index) => {
            const levelProg = getLevelProgress(level.id);
            const unlocked = isLevelUnlocked(level);
            const completion = calculateLevelCompletion(level.id);

            return (
              <Card 
                key={level.id}
                className={`overflow-hidden transition-all duration-300 ${
                  unlocked 
                    ? 'hover:shadow-xl cursor-pointer' 
                    : 'opacity-60'
                }`}
                onClick={() => unlocked && navigate(`/learning/level/${level.id}`)}
              >
                <div className="flex flex-col md:flex-row">
                  {/* Level Icon & Number */}
                  <div className={`bg-gradient-to-br ${getPathwayColor(level.pathway)} text-white p-8 flex items-center justify-center min-w-[200px]`}>
                    <div className="text-center">
                      <div className="mb-2">{getPathwayIcon(level.pathway)}</div>
                      <div className="text-6xl font-bold opacity-20">
                        {level.level_order}
                      </div>
                      <p className="text-sm uppercase tracking-wider mt-2">
                        {level.pathway.replace('_', ' ')}
                      </p>
                    </div>
                  </div>

                  {/* Level Details */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-bold">{level.level_name}</h3>
                          {levelProg?.completed && (
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" />
                              Completed
                            </span>
                          )}
                          {!unlocked && (
                            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                              <Lock className="w-4 h-4" />
                              Locked
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600">{level.description}</p>
                      </div>
                      
                      <div className="text-right">
                        <div className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full text-sm font-bold">
                          Band {level.target_band_range}
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <BookOpen className="w-4 h-4" />
                        <span className="text-sm">{level.units.length} Units</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{level.total_estimated_hours}h</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Award className="w-4 h-4" />
                        <span className="text-sm">Exit Test</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {unlocked && (
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-600">Progress</span>
                          <span className="font-semibold text-violet-600">{completion}%</span>
                        </div>
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full bg-gradient-to-r ${getPathwayColor(level.pathway)} transition-all duration-500`}
                            style={{ width: `${completion}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Call to Action */}
                    {unlocked && (
                      <div className="mt-4">
                        <Button 
                          className="w-full md:w-auto"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/learning/level/${level.id}`);
                          }}
                        >
                          {levelProg?.completed ? 'Review Level' : levelProg ? 'Continue Learning' : 'Start Level'}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    )}

                    {!unlocked && index > 0 && (
                      <div className="mt-4 text-sm text-slate-500">
                        Complete {levels[index - 1]?.level_name} to unlock this level
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
