import React from 'react';
import { CheckCircle, Lock, Play } from 'lucide-react';
import { STAGE_THEMES, ACTIVITY_ICONS, ACTIVITY_LABELS } from '../lib/constants';

// ═══════ LESSON PATH SIDEBAR (Wavy Visual Path) ═══════
function LessonPath({ activities, currentActivity, completedActivities, onActivityClick, theme }) {
  const t = theme || STAGE_THEMES.stage_1;
  return (
    <div className={`rounded-2xl p-5 shadow-sm border ${t.cardBorder} bg-white`}>
      <h3 className="text-base font-bold text-gray-900 mb-5" data-testid="lesson-progress-title">Lesson Path</h3>
      <div className="relative">
        {/* Wavy path SVG background */}
        <svg className="absolute left-5 top-0 w-1 h-full" style={{ overflow: 'visible' }}>
          {activities.map((_, i) => i < activities.length - 1 && (
            <line key={i} x1="0" y1={i * 64 + 20} x2="0" y2={(i + 1) * 64 + 20}
              stroke={completedActivities.includes(activities[i].type) ? t.accent : '#E5E7EB'}
              strokeWidth="3" strokeDasharray={completedActivities.includes(activities[i].type) ? '0' : '6 4'} />
          ))}
        </svg>

        <div className="space-y-2 relative">
          {activities.map((activity, index) => {
            const Icon = ACTIVITY_ICONS[activity.type] || Play;
            const isCompleted = completedActivities.includes(activity.type);
            const isCurrent = currentActivity === activity.type;
            const isAccessible = true; // All activities accessible

            return (
              <div key={activity.activity_id} data-testid={`activity-step-${activity.type}`}>
                <button
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left ${
                    isCurrent ? `${t.activeBg} ring-2 ${t.activeRing}` :
                    isCompleted ? 'bg-green-50' :
                    isAccessible ? 'hover:bg-gray-50' : 'opacity-40 cursor-not-allowed'
                  }`}
                  onClick={() => isAccessible && onActivityClick(activity)}
                  disabled={!isAccessible}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    isCompleted ? 'bg-green-500 text-white shadow-md' :
                    isCurrent ? `${t.completedBg} text-white shadow-lg scale-110` :
                    isAccessible ? 'bg-gray-100 text-gray-500' : 'bg-gray-100 text-gray-300'
                  }`}>
                    {isCompleted ? <CheckCircle className="w-5 h-5" /> : !isAccessible ? <Lock className="w-4 h-4" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm font-medium truncate block ${isCurrent ? t.accentText : 'text-gray-900'}`}>{ACTIVITY_LABELS[activity.type] || activity.label}</span>
                    <span className="text-xs text-gray-400">{activity.duration_minutes} min</span>
                  </div>
                  {isCurrent && !isCompleted && <div className="w-2 h-2 rounded-full animate-pulse shrink-0" style={{ background: t.accent }} />}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default LessonPath;
