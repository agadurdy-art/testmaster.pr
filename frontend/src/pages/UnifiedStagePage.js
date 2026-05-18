import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, ChevronRight, Lock, CheckCircle, BookOpen, 
  Clock, Zap, Star, Play
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const ADMIN_EMAILS = ['aga.durdy@gmail.com', 'stemhousebenluc@gmail.com'];

// Unit card component - iOS 26 Glass Style
function UnitCard({ unit, lessons, userProgress, onLessonClick, isUnitUnlocked, isAdmin, getPrevUnitName }) {
  const completedLessons = lessons.filter(l => 
    userProgress?.lesson_progress?.[l.lesson_id]?.completed
  ).length;
  const completionPercent = lessons.length > 0 ? Math.round((completedLessons / lessons.length) * 100) : 0;
  
  return (
    <div 
      className={`overflow-hidden rounded-3xl ${!isUnitUnlocked ? 'opacity-60' : ''}`}
      style={{
        background: 'rgba(255, 255, 255, 0.70)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.50)',
        boxShadow: '0 8px 32px rgba(31, 38, 135, 0.07)'
      }}
      data-testid={`unit-card-${unit.number}`}
    >
      {/* Unit header */}
      <div 
        className="p-4 text-white relative"
        style={{ backgroundColor: unit.theme_color || '#FF6B6B' }}
      >
        {!isUnitUnlocked && (
          <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center z-10 backdrop-blur-sm">
            <div className="text-center">
              <Lock className="w-6 h-6 mx-auto mb-1" />
              <p className="text-xs font-medium px-2">Complete {getPrevUnitName()} first</p>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="bg-white/20 text-white border-0 rounded-full">
            Unit {unit.number}
          </Badge>
          {!isUnitUnlocked && <Lock className="w-5 h-5" />}
          {isUnitUnlocked && completionPercent === 100 && (
            <CheckCircle className="w-5 h-5" />
          )}
        </div>
        <h3 className="text-xl font-bold mt-2">{unit.title}</h3>
        <p className="text-sm text-white/80 mt-1">{unit.description}</p>
      </div>
      
      {/* Progress bar */}
      <div className="px-4 py-2" style={{ background: 'rgba(249, 250, 251, 0.5)' }}>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-600">{completedLessons}/{lessons.length} Lessons</span>
          <span className="font-medium text-gray-900">{completionPercent}%</span>
        </div>
        <div className="h-1.5 bg-gray-200/80 rounded-full overflow-hidden">
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
      <div className="divide-y divide-gray-100/50">
        {lessons.map((lesson, index) => {
          // Smart lock: first lesson in unit is unlocked if unit is unlocked, rest need previous lesson completed
          const isFirstInUnit = index === 0;
          const prevLessonCompleted = index > 0 
            ? userProgress?.lesson_progress?.[lessons[index - 1].lesson_id]?.completed 
            : true;
          const isLessonUnlocked = isAdmin || (isUnitUnlocked && (isFirstInUnit || prevLessonCompleted));
          const isCompleted = userProgress?.lesson_progress?.[lesson.lesson_id]?.completed;
          const lessonProgress = userProgress?.lesson_progress?.[lesson.lesson_id];
          
          return (
            <div 
              key={lesson.lesson_id}
              className={`p-4 flex items-center justify-between cursor-pointer transition-all ${
                isLessonUnlocked ? 'hover:bg-white/50' : 'opacity-50 cursor-not-allowed'
              }`}
              onClick={() => {
                if (isLessonUnlocked) {
                  onLessonClick(lesson);
                } else {
                  toast.error('Complete the previous lesson first!');
                }
              }}
              data-testid={`lesson-${lesson.lesson_id}`}
            >
              <div className="flex items-center gap-3">
                {/* Status indicator */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isCompleted ? 'bg-green-100' : isLessonUnlocked ? 'bg-gray-100/80' : 'bg-gray-100/80'
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
    </div>
  );
}

function checkUnitUnlocked(unit, units, userProgress, isAdmin) {
  if (isAdmin) return true;
  // First unit is always unlocked
  const unitIndex = units.findIndex(u => u.unit_id === unit.unit_id);
  if (unitIndex === 0) return true;
  
  // Check if all lessons in the previous unit are completed
  const prevUnit = units[unitIndex - 1];
  const prevLessons = prevUnit.lessons || [];
  if (prevLessons.length === 0) return true;
  
  return prevLessons.every(l => userProgress?.lesson_progress?.[l.lesson_id]?.completed);
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

  const isAdmin = ADMIN_EMAILS.includes(user?.email?.toLowerCase());
  const units = stage?.units || [];
  
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
    <div 
      className="min-h-screen"
      style={{
        background: 'radial-gradient(at 0% 0%, hsla(152,100%,90%,1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(190,100%,92%,1) 0, transparent 50%), radial-gradient(at 100% 100%, hsla(37,100%,91%,1) 0, transparent 50%), #F8FAFC'
      }}
    >
      {/* Header - Glass Style */}
      <div 
        className="text-white py-8"
        style={{ backgroundColor: stage.color }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <Button
            variant="ghost"
            className="text-white hover:bg-white/20 mb-4 rounded-full"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-white/20 text-white text-lg px-4 py-2 rounded-full border-0">
              Stage {stage.number}
            </Badge>
            <Badge variant="outline" className="border-white/50 text-white rounded-full">
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
          {(stage.units || []).map((unit, idx) => {
            const isUnitUnlocked = checkUnitUnlocked(unit, stage.units || [], userProgress, isAdmin);
            const prevUnit = idx > 0 ? (stage.units || [])[idx - 1] : null;
            return (
              <UnitCard
                key={unit.unit_id}
                unit={unit}
                lessons={unit.lessons || []}
                userProgress={userProgress}
                onLessonClick={handleLessonClick}
                isUnitUnlocked={isUnitUnlocked}
                isAdmin={isAdmin}
                getPrevUnitName={() => prevUnit ? `Unit ${prevUnit.unit_number || prevUnit.number}` : ''}
              />
            );
          })}
        </div>
        
        {(!stage.units || stage.units.length === 0) && (
          <div 
            className="p-12 text-center rounded-3xl"
            style={{
              background: 'rgba(255, 255, 255, 0.70)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.50)'
            }}
          >
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Coming Soon</h3>
            <p className="text-gray-600">
              Content for this stage is being prepared. Check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
