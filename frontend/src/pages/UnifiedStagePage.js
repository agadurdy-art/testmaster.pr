import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, ChevronRight, Lock, CheckCircle, BookOpen, 
  Clock, Zap, Star, Play
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Unit card component
function UnitCard({ unit, lessons, userProgress, onLessonClick }) {
  const isUnlocked = true; // All units unlocked for testing
  const completedLessons = lessons.filter(l => 
    userProgress?.lesson_progress?.[l.lesson_id]?.completed
  ).length;
  const completionPercent = Math.round((completedLessons / lessons.length) * 100);
  
  return (
    <Card className={`overflow-hidden ${!isUnlocked ? 'opacity-60' : ''}`}>
      {/* Unit header */}
      <div 
        className="p-4 text-white"
        style={{ backgroundColor: unit.theme_color || '#FF6B6B' }}
      >
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="bg-white/20 text-white">
            Unit {unit.number}
          </Badge>
          {!isUnlocked && <Lock className="w-5 h-5" />}
          {isUnlocked && completionPercent === 100 && (
            <CheckCircle className="w-5 h-5" />
          )}
        </div>
        <h3 className="text-xl font-bold mt-2">{unit.title}</h3>
        <p className="text-sm text-white/80 mt-1">{unit.description}</p>
      </div>
      
      {/* Progress bar */}
      <div className="px-4 py-2 bg-gray-50">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-600">{completedLessons}/{lessons.length} Lessons</span>
          <span className="font-medium text-gray-900">{completionPercent}%</span>
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{ 
              width: `${completionPercent}%`,
              backgroundColor: unit.theme_color || '#FF6B6B'
            }}
          />
        </div>
      </div>
      
      {/* Lesson list */}
      <div className="divide-y">
        {lessons.map((lesson, index) => {
          const isLessonUnlocked = isUnlocked && (index === 0 || 
            userProgress?.lesson_progress?.[lessons[index - 1]?.lesson_id]?.completed);
          const isCompleted = userProgress?.lesson_progress?.[lesson.lesson_id]?.completed;
          const lessonProgress = userProgress?.lesson_progress?.[lesson.lesson_id];
          
          return (
            <div 
              key={lesson.lesson_id}
              className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                isLessonUnlocked ? 'hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'
              }`}
              onClick={() => isLessonUnlocked && onLessonClick(lesson)}
            >
              <div className="flex items-center gap-3">
                {/* Status indicator */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isCompleted ? 'bg-green-100' : isLessonUnlocked ? 'bg-gray-100' : 'bg-gray-100'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : isLessonUnlocked ? (
                    <Play className="w-4 h-4 text-gray-600" />
                  ) : (
                    <Lock className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                
                {/* Lesson info */}
                <div>
                  <h4 className="font-medium text-gray-900">
                    {lesson.number}. {lesson.title}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {lesson.estimated_duration_minutes} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      {lesson.points_reward} pts
                    </span>
                    {lessonProgress?.crowns > 0 && (
                      <span className="flex items-center gap-1 text-yellow-500">
                        {Array(lessonProgress.crowns).fill(0).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function checkUnitUnlocked(unit, userProgress) {
  // Simplified - just check if any previous lessons are done
  return true;
}

export default function UnifiedStagePage({ user }) {
  const navigate = useNavigate();
  const { stageId } = useParams();
  const [stage, setStage] = useState(null);
  const [userProgress, setUserProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadData();
  }, [stageId, user]);
  
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load stage with units
      const stageRes = await fetch(`${API_URL}/api/unified/stages/${stageId}`);
      const stageData = await stageRes.json();
      
      // Load lessons for each unit
      if (stageData.units) {
        for (const unit of stageData.units) {
          const unitRes = await fetch(`${API_URL}/api/unified/units/${unit.unit_id}`);
          const unitData = await unitRes.json();
          unit.lessons = unitData.lessons || [];
        }
      }
      
      setStage(stageData);
      
      // Load user progress
      if (user?.id) {
        const progressRes = await fetch(`${API_URL}/api/unified/progress/${user.id}`);
        const progressData = await progressRes.json();
        setUserProgress(progressData);
      }
    } catch (error) {
      console.error('Error loading stage data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleLessonClick = (lesson) => {
    navigate(`/unified/lesson/${lesson.lesson_id}`);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }
  
  if (!stage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Stage not found</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div 
        className="text-white py-8"
        style={{ backgroundColor: stage.color }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <Button 
            variant="ghost" 
            className="text-white hover:bg-white/20 mb-4"
            onClick={() => navigate('/unified')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            All Stages
          </Button>
          
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-white/20 text-white text-lg px-4 py-2">
              Stage {stage.number}
            </Badge>
            <Badge variant="outline" className="border-white/50 text-white">
              {stage.cefr_level}
            </Badge>
          </div>
          
          <h1 className="text-4xl font-bold mt-4">{stage.name}</h1>
          <p className="text-lg text-white/80 mt-2 max-w-2xl">{stage.description}</p>
          
          <div className="flex items-center gap-6 mt-4 text-sm text-white/80">
            <span>{stage.total_units} Units</span>
            <span>•</span>
            <span>{stage.total_units * stage.lessons_per_unit} Lessons</span>
            <span>•</span>
            <span>Target: {stage.target_audience}</span>
          </div>
        </div>
      </div>
      
      {/* Units */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {(stage.units || []).map((unit) => (
            <UnitCard
              key={unit.unit_id}
              unit={unit}
              lessons={unit.lessons || []}
              userProgress={userProgress}
              onLessonClick={handleLessonClick}
            />
          ))}
        </div>
        
        {(!stage.units || stage.units.length === 0) && (
          <Card className="p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Coming Soon</h3>
            <p className="text-gray-600">
              Content for this stage is being prepared. Check back soon!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
