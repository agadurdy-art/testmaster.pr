import React from 'react';
import { AlertTriangle, Zap, MessageCircle, GraduationCap, MapPin, ChevronRight } from 'lucide-react';

// Holistic insights — tile grid (collapsed). Clicking a tile opens the full
// card content in the InsightDrawer. Tile is hidden when its data is empty so
// the grid never renders empty placeholders.
// Extracted verbatim from pages/CambridgeTestResults.js (Faz2 refactor); the
// `(activeTab === 'overview' || (rlOnly && skill !== 'reading'))` guard stays
// in the orchestrator (originally an inline IIFE).

export default function InsightsTileGrid({
  questionResults,
  rootCauseAnalysis,
  reasonSummary,
  fastestGain,
  teacherFeedback,
  recommendedLessons,
  studyPlan,
  setOpenInsight,
}) {
          const allWrong = [...(questionResults.listening || []), ...(questionResults.reading || [])].filter(q => !q.is_correct);
          const wrongCount = allWrong.length;
          const tiles = [
            { id: 'root_cause', label: 'Root Cause Analysis', summary: rootCauseAnalysis.length ? `${rootCauseAnalysis.length} pattern${rootCauseAnalysis.length === 1 ? '' : 's'} flagged` : null, icon: AlertTriangle, brand: 'rose', available: rootCauseAnalysis.length > 0 },
            { id: 'why_lost', label: 'Why You Lost Marks', summary: wrongCount ? `${wrongCount} mistake${wrongCount === 1 ? '' : 's'} — tap to retry` : null, icon: AlertTriangle, brand: 'orange', available: Object.keys(reasonSummary).length > 0 },
            { id: 'fastest_gain', label: 'Fastest Score Gain', summary: fastestGain.length ? `+${fastestGain.reduce((a, x) => a + (x.wrong_count || 0), 0)} possible across ${fastestGain.length} area${fastestGain.length === 1 ? '' : 's'}` : null, icon: Zap, brand: 'emerald', available: fastestGain.length > 0 },
            { id: 'feedback', label: 'Your Personal Feedback', summary: teacherFeedback ? (teacherFeedback.short || 'AI analysis ready').slice(0, 90) + ((teacherFeedback.short || '').length > 90 ? '…' : '') : null, icon: MessageCircle, brand: 'blue', available: !!teacherFeedback },
            { id: 'lessons', label: 'Recommended Lessons', summary: recommendedLessons.length ? `${recommendedLessons.length} lesson${recommendedLessons.length === 1 ? '' : 's'} for your weak areas` : null, icon: GraduationCap, brand: 'indigo', available: recommendedLessons.length > 0 },
            { id: 'roadmap', label: 'Study Roadmap', summary: studyPlan?.roadmap_steps?.length ? `${studyPlan.roadmap_steps.length}-step path · target Band ${studyPlan.target_band}` : null, icon: MapPin, brand: 'violet', available: studyPlan?.roadmap_steps?.length > 0 },
          ].filter(t => t.available);

          if (tiles.length === 0) return null;

          const brandClasses = {
            rose:    { bg: 'bg-rose-50',    border: 'border-rose-100',    iconBg: 'bg-rose-500',    text: 'text-rose-700' },
            orange:  { bg: 'bg-orange-50',  border: 'border-orange-100',  iconBg: 'bg-orange-500',  text: 'text-orange-700' },
            emerald: { bg: 'bg-emerald-50', border: 'border-emerald-100', iconBg: 'bg-emerald-500', text: 'text-emerald-700' },
            blue:    { bg: 'bg-blue-50',    border: 'border-blue-100',    iconBg: 'bg-blue-500',    text: 'text-blue-700' },
            indigo:  { bg: 'bg-indigo-50',  border: 'border-indigo-100',  iconBg: 'bg-indigo-500',  text: 'text-indigo-700' },
            violet:  { bg: 'bg-violet-50',  border: 'border-violet-100',  iconBg: 'bg-violet-500',  text: 'text-violet-700' },
          };

          return (
            <div
              data-testid="insights-tile-grid"
              className="p-6 mb-6 rounded-2xl border border-white/20"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Performance Insights</h3>
                  <p className="text-sm text-white/70">Tap any card for detailed analysis</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {tiles.map((tile, index) => {
                  const Icon = tile.icon;
                  const gradientColors = {
                    rose: 'from-rose-400 to-pink-500',
                    orange: 'from-orange-400 to-red-500',
                    emerald: 'from-emerald-400 to-teal-500',
                    blue: 'from-blue-400 to-indigo-500',
                    indigo: 'from-indigo-400 to-purple-500',
                    violet: 'from-violet-400 to-purple-600',
                  };
                  const gradientClass = gradientColors[tile.brand] || gradientColors.blue;

                  return (
                    <button
                      key={tile.id}
                      data-testid={`insight-tile-${tile.id}`}
                      onClick={() => setOpenInsight(tile.id)}
                      className="group relative p-4 rounded-xl border border-white/20 backdrop-blur-md transition-all duration-500 hover:scale-105 hover:bg-white/20 text-left"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        animationDelay: `${index * 100}ms`,
                        animation: 'fadeInUp 600ms ease-out forwards'
                      }}
                    >
                      <div className="relative z-10">
                        <div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}
                          style={{
                            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                          }}
                        >
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="text-white font-semibold text-sm mb-1 group-hover:text-white transition-colors">
                          {tile.label}
                        </h4>
                        {tile.summary && (
                          <p className="text-white/70 text-xs leading-relaxed mb-2 group-hover:text-white/80 transition-colors">
                            {tile.summary}
                          </p>
                        )}
                        <div className="flex items-center text-xs text-white/60 group-hover:text-white/80 transition-colors">
                          <span>View Details</span>
                          <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                        </div>
                      </div>

                      {/* Hover glow effect */}
                      <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${gradientClass} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                    </button>
                  );
                })}
              </div>

              <style jsx>{`
                @keyframes fadeInUp {
                  0% { opacity: 0; transform: translateY(20px); }
                  100% { opacity: 1; transform: translateY(0); }
                }
              `}</style>
            </div>
          );
}
