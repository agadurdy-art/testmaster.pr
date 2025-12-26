import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { 
  BookOpen, Lock, CheckCircle, Clock, ArrowRight, ArrowLeft, Play, FileText
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function UnitDetail({ user }) {
  const { unitId } = useParams();
  const navigate = useNavigate();
  const [unit, setUnit] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !user.id) {
      console.error('No user found, redirecting to home');
      navigate('/');
      return;
    }
    loadUnit();
  }, [unitId, user]);

  const loadUnit = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/learning-platform/units/${unitId}?user_id=${user.id}`
      );
      const data = await response.json();
      setUnit(data);
    } catch (error) {
      console.error('Failed to load unit:', error);
      toast.error('Failed to load unit details');
    } finally {
      setLoading(false);
    }
  };

  const getLessonProgress = (lessonId) => {
    if (!unit?.user_progress?.lesson_progress) return null;
    return unit.user_progress.lesson_progress.find(lp => lp.lesson_id === lessonId);
  };

  // Check if user is admin - all content unlocked for admins
  const isAdmin = user?.email && (
    user.email.toLowerCase().includes('admin@ieltsace') || 
    user.email.toLowerCase() === 'aga.durdy@gmail.com'
  );

  const isLessonUnlocked = (lesson) => {
    // Admin users have access to all lessons
    if (isAdmin) return true;
    
    // First lesson is always unlocked (Unit 1's first lesson should always be accessible)
    // Also unlock if the unit itself is marked as unlocked in user progress
    if (lesson.lesson_number === 1) {
      // For unit 1, first lesson is always unlocked
      // For other units, check if the unit is unlocked
      return unit.unit_number === 1 || unit?.user_progress?.is_unlocked || false;
    }
    
    // Check if previous lesson is completed
    const prevLesson = unit.lessons.find(l => l.lesson_number === lesson.lesson_number - 1);
    if (!prevLesson) return false;
    
    const prevProgress = getLessonProgress(prevLesson.id);
    return prevProgress?.completed || false;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading unit...</p>
        </div>
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-slate-600 mb-4">Unit not found</p>
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
        <div className="max-w-5xl mx-auto px-4">
          <Button 
            variant="ghost" 
            className="text-white hover:bg-white/20 mb-4"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold">
              Unit {unit.unit_number}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold">{unit.title}</h1>
          </div>
          <p className="text-xl text-violet-100">{unit.description}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Learning Objectives */}
        {unit.learning_objectives && unit.learning_objectives.length > 0 && (
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">What You'll Learn</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {unit.learning_objectives.map((obj, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-violet-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700">{obj}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Lessons */}
        <h2 className="text-2xl font-bold mb-4">Lessons</h2>
        <div className="space-y-4 mb-8">
          {(unit.lessons || []).map((lesson) => {
            const lessonProg = getLessonProgress(lesson.id);
            const unlocked = isLessonUnlocked(lesson);

            return (
              <Card 
                key={lesson.id}
                className={`p-6 transition-all ${
                  unlocked 
                    ? 'hover:shadow-lg cursor-pointer' 
                    : 'opacity-60'
                }`}
                onClick={() => unlocked && navigate(`/learning/lesson/${lesson.id}`)}
              >
                <div className="flex items-start gap-4">
                  {/* Lesson Number */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                    lessonProg?.completed 
                      ? 'bg-green-100 text-green-700' 
                      : unlocked
                      ? 'bg-violet-100 text-violet-700'
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    {lessonProg?.completed ? <CheckCircle className="w-6 h-6" /> : lesson.lesson_number}
                  </div>

                  {/* Lesson Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold">{lesson.title}</h3>
                      {!unlocked && <Lock className="w-4 h-4 text-slate-400" />}
                    </div>
                    <p className="text-slate-600 mb-3">{lesson.description}</p>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {lesson.duration_minutes} min
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {lesson.lesson_type.replace('_', ' ')}
                      </span>
                      {lessonProg?.completed && (
                        <span className="flex items-center gap-1 text-green-600 font-medium">
                          <CheckCircle className="w-4 h-4" />
                          Completed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  {unlocked && (
                    <Button
                      className="flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/learning/lesson/${lesson.id}`);
                      }}
                    >
                      {lessonProg?.completed ? 'Review' : 'Start'}
                      <Play className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Unit Quiz */}
        {unit.unit_quiz && (
          <Card className="p-6 border-2 border-violet-300 bg-gradient-to-r from-violet-50 to-purple-50">
            <div className="flex items-start gap-4">
              <div className="bg-violet-500 text-white p-3 rounded-full">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">{unit.unit_quiz.title}</h3>
                <p className="text-slate-600 mb-4">{unit.unit_quiz.description}</p>
                
                <div className="flex gap-4 text-sm text-slate-600 mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {unit.unit_quiz.duration_minutes} min
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Pass: {unit.unit_quiz.passing_score}%
                  </span>
                </div>

                {unit.user_progress?.quiz_attempts?.length > 0 && (
                  <div className="mb-4 p-3 bg-white rounded-lg">
                    <p className="font-semibold text-sm mb-2">Previous Attempts:</p>
                    {unit.user_progress.quiz_attempts.slice(-2).map((attempt, idx) => (
                      <div key={idx} className="flex justify-between text-sm py-1">
                        <span>Attempt {attempt.attempt_number}</span>
                        <span className={`font-semibold ${
                          attempt.passed ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {attempt.score.toFixed(1)}% {attempt.passed ? '✓' : '✗'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  className="bg-violet-500 hover:bg-violet-600"
                  onClick={() => navigate(`/learning/quiz/${unit.unit_quiz.id}`)}
                  disabled={!isAdmin && !unit.user_progress?.is_unlocked}
                >
                  {unit.user_progress?.completed ? 'Passed! Review Quiz' : 'Take Quiz'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
