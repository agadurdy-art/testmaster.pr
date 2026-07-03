import React from 'react';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import {
  ArrowLeft, Globe, Award, Loader2, CheckCircle, ChevronRight
} from 'lucide-react';
import ThemeToggle from '../../../../components/ThemeToggle';
import { getLessonProgress, isLessonCompleted } from '../../../../lib/progressTracker';
import { MODULE_CONFIG } from '../constants';

export default function ModulesListView({
  navigate,
  language,
  englishNotice,
  textPrimary,
  textSecondary,
  bgCard,
  isDark,
  hasFullCourseAccess,
  loading,
  modules,
  canAccessModule,
  selectModule,
}) {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className={textSecondary}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Button>
        <ThemeToggle />
      </div>
      
      {/* English-only notice for non-EN users */}
      {language !== 'en' && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
          <Globe className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <div>
            <span className="font-medium text-blue-800">{englishNotice.title}: </span>
            <span className="text-blue-700 text-sm">{englishNotice.message}</span>
          </div>
        </div>
      )}
      
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Award className="w-10 h-10 text-white" />
        </div>
        <h1 className={`text-3xl font-bold ${textPrimary} mb-2`}>IELTS Mastery Blueprint</h1>
        <p className={textSecondary}>Band 4.5-6.5 Full Course • 17 Comprehensive Modules</p>
        <p className={`text-sm ${textSecondary} mt-2 max-w-2xl mx-auto`}>
          Master vocabulary, grammar, reading, speaking, and writing skills across all core IELTS topics.
        </p>
        {!hasFullCourseAccess && (
          <p className="text-sm text-violet-600 mt-3">
            Free preview: Lesson 1 is open. Upgrade to Learner for the full course.
          </p>
        )}
      </div>
      
      {loading ? (
        <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto text-violet-500" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((module) => {
            const config = MODULE_CONFIG[module.title] || { icon: '📚', color: 'from-gray-500 to-gray-600' };
            const moduleProgress = getLessonProgress('mastery', module.module_number);
            const isComplete = isLessonCompleted('mastery', module.module_number);
            const isLocked = !canAccessModule(module);
            
            return (
              <Card 
                key={module.id}
                className={`p-5 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 border shadow-md relative ${bgCard} ${isComplete ? 'ring-2 ring-green-400' : ''} ${isLocked ? 'opacity-70' : ''}`}
                onClick={() => selectModule(module)}
              >
                {isLocked && (
                  <div className="absolute inset-0 rounded-xl bg-white/50 flex items-center justify-center">
                    <div className="px-3 py-1.5 rounded-full bg-white shadow text-xs font-medium text-gray-700">
                      Upgrade to unlock
                    </div>
                  </div>
                )}
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
                      <span className={`text-xs font-medium text-violet-600 ${isDark ? 'bg-violet-900/30' : 'bg-violet-50'} px-2 py-0.5 rounded-full`}>
                        Module {module.module_number}
                      </span>
                      {moduleProgress > 0 && !isComplete && (
                        <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                          {moduleProgress}%
                        </span>
                      )}
                    </div>
                    <h3 className={`font-bold ${textPrimary} mt-1`}>{module.title}</h3>
                    <p className={`text-xs ${textSecondary} mt-1 line-clamp-2`}>
                      {module.learning_goals?.[0]}
                    </p>
                    {/* Progress Bar */}
                    {moduleProgress > 0 && (
                      <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${isComplete ? 'bg-green-500' : 'bg-violet-500'} transition-all`}
                          style={{ width: `${moduleProgress}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <ChevronRight className={`w-5 h-5 ${textSecondary} flex-shrink-0`} />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
