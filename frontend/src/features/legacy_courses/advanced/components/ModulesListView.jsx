import React from 'react';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import {
  Globe, ChevronLeft, Award, Target, CheckCircle, Zap
} from 'lucide-react';
import ThemeToggle from '../../../../components/ThemeToggle';
import { getLessonProgress, isLessonCompleted } from '../../../../lib/progressTracker';

export default function ModulesListView({
  goBack,
  language,
  englishNotice,
  hasFullCourseAccess,
  modules,
  canAccessModule,
  selectModule,
}) {
  return (
    <div className="space-y-6">
      {/* English-only notice for non-EN users */}
      {language !== 'en' && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3">
          <Globe className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div>
            <span className="font-medium text-amber-800">{englishNotice.title}: </span>
            <span className="text-amber-700 text-sm">{englishNotice.message}</span>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={goBack} className="p-2">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Advanced IELTS Mastery</h1>
            <p className="text-gray-500">Band 6.0-9.0 • Cambridge-Aligned</p>
          </div>
        </div>
        <ThemeToggle />
      </div>

      {/* Course Description */}
      <Card className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-0 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg flex-shrink-0">
            <Target className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Master Band 7-9 Skills</h2>
            <p className="text-gray-600 text-sm">
              This comprehensive curriculum is designed for learners at Band 6.0-6.5 targeting Band 7.0-9.0. 
              Master sophisticated vocabulary, complex grammar structures, and examiner-level execution across all IELTS themes.
            </p>
            {!hasFullCourseAccess && (
              <p className="text-sm text-amber-700 mt-2">
                Free preview: Lesson 1 is open. Upgrade to Achiever for the full course.
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Modules Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {modules.map((module) => {
          const moduleProgress = getLessonProgress('advanced', module.module_number);
          const isComplete = isLessonCompleted('advanced', module.module_number);
          const isLocked = !canAccessModule(module);
          
          return (
            <Card 
              key={module.id}
              className={`p-5 bg-white border-0 shadow-lg hover:shadow-xl cursor-pointer group transition-all duration-300 hover:-translate-y-1 rounded-2xl relative ${isComplete ? 'ring-2 ring-green-400' : ''} ${isLocked ? 'opacity-70' : ''}`}
              onClick={() => selectModule(module)}
            >
              {isLocked && (
                <div className="absolute inset-0 rounded-2xl bg-white/50 flex items-center justify-center">
                  <div className="px-3 py-1.5 rounded-full bg-white shadow text-xs font-medium text-gray-700">
                    Upgrade to unlock
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform relative">
                  {module.module_number}
                  {isComplete && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">{module.title}</h3>
                  <p className="text-xs text-gray-500 truncate">{module.subtitle}</p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 text-xs text-amber-600">
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  <span>Band 7-9 Focus</span>
                </div>
                {moduleProgress > 0 && !isComplete && (
                  <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                    {moduleProgress}%
                  </span>
                )}
              </div>
              {/* Progress Bar */}
              {moduleProgress > 0 && (
                <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${isComplete ? 'bg-green-500' : 'bg-amber-500'} transition-all`}
                    style={{ width: `${moduleProgress}%` }}
                  />
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
