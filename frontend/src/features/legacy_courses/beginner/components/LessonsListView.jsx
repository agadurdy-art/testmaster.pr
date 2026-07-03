import React from 'react';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import {
  ArrowLeft, Loader2, CheckCircle, ChevronRight
} from 'lucide-react';
import ThemeToggle from '../../../../components/ThemeToggle';
import { getLessonProgress, isLessonCompleted } from '../../../../lib/progressTracker';
import { TOPIC_CONFIG } from '../constants';

export default function LessonsListView({
  navigate,
  getText,
  loading,
  lessons,
  selectLesson,
}) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> {getText('backToDashboard')}
        </Button>
        <ThemeToggle />
      </div>
      
      <div className="text-center mb-8">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-200 animate-bounce">
          <span className="text-5xl">🌟</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{getText('title')}</h1>
        <p className="text-gray-600 text-lg">{getText('subtitle')}</p>
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mt-4 max-w-xl mx-auto border border-green-100">
          <p className="text-sm text-green-800">
            {getText('welcomeMsg')}
          </p>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-green-500" />
          <p className="mt-2 text-green-600">{getText('loading')}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {lessons.map((lesson) => {
            const config = TOPIC_CONFIG[lesson.topic] || { icon: '📖', color: 'from-gray-500 to-gray-600', lightBg: 'bg-gray-50' };
            const lessonProgress = getLessonProgress('beginner', lesson.lesson_number);
            const isComplete = isLessonCompleted('beginner', lesson.lesson_number);
            
            return (
              <Card 
                key={lesson.id}
                className={`p-5 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 border-0 shadow-md ${config.lightBg} ${isComplete ? 'ring-2 ring-green-400' : ''}`}
                onClick={() => selectLesson(lesson)}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center text-2xl shadow-lg flex-shrink-0 relative`}>
                    {config.icon}
                    {isComplete && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-gray-500 bg-white/80 px-2 py-0.5 rounded-full">
                        {getText('lesson')} {lesson.lesson_number}
                      </span>
                      {lessonProgress > 0 && !isComplete && (
                        <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                          {lessonProgress}%
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">{lesson.topic}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{lesson.learning_goals}</p>
                    {/* Progress Bar */}
                    {lessonProgress > 0 && (
                      <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${isComplete ? 'bg-green-500' : 'bg-green-400'} transition-all`}
                          style={{ width: `${lessonProgress}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
