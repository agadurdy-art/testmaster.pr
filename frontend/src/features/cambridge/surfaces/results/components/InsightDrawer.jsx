import React from 'react';
import { Card } from '../../../../../components/ui/card';
import { Button } from '../../../../../components/ui/button';
import { Badge } from '../../../../../components/ui/badge';
import {
  CheckCircle, BookOpen, TrendingUp, Award, Target, Lightbulb,
  GraduationCap, RefreshCw, MapPin, ChevronRight, AlertTriangle, Zap, X,
} from 'lucide-react';
import { getRecommendedLessonPath } from '../../../../../lib/recommendationRouting';
import { T } from '../constants';

// Insight Drawer — slide-in panel that holds the full content of whichever
// holistic card the user opened (Root Cause, Why You Lost Marks, Fastest
// Gain, Personal Feedback, Recommended Lessons, Study Roadmap). Each card
// body renders only when openInsight matches its id.
// JSX extracted verbatim from pages/CambridgeTestResults.js (Faz2 refactor);
// the `{openInsight && (...)}` guard stays in the orchestrator.

export default function InsightDrawer({
  openInsight,
  setOpenInsight,
  rootCauseAnalysis,
  reasonSummary,
  questionResults,
  fastestGain,
  teacherFeedback,
  strengths,
  weaknesses,
  skillBreakdown,
  recommendedLessons,
  studyPlan,
  computedOverall,
  navigate,
  bookId,
  testId,
  testData,
}) {
  return (
          <div
            data-testid="insight-drawer"
            className="fixed inset-0 z-50 flex"
            style={{
              animation: 'fadeIn 300ms ease-out',
            }}
          >
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
              style={{
                transition: 'opacity 300ms ease-out',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
              onClick={() => setOpenInsight(null)}
            />
            <aside
              className="relative ml-auto h-full w-full sm:max-w-2xl bg-gray-50 overflow-y-auto shadow-2xl rounded-l-3xl"
              style={{
                animation: 'slideInRight 400ms cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '-20px 0 60px rgba(0,0,0,0.20), -10px 0 30px rgba(0,0,0,0.10)',
                background: 'linear-gradient(135deg, rgba(249,250,251,0.98) 0%, rgba(243,244,246,0.98) 100%)',
              }}
            >
              <div
                className="sticky top-0 z-10 flex items-center justify-between px-5 py-3 backdrop-blur-xl"
                style={{
                  borderBottom: `1px solid hsl(${T.border})`,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                }}
              >
                <p className="text-sm font-semibold text-gray-700">Insight detail</p>
                <button
                  data-testid="insight-drawer-close"
                  onClick={() => setOpenInsight(null)}
                  className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-all duration-200 hover:scale-105"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5">
              <style jsx>{`
                @keyframes fadeIn {
                  from { opacity: 0; }
                  to { opacity: 1; }
                }
                @keyframes slideInRight {
                  from { transform: translateX(100%); }
                  to { transform: translateX(0); }
                }
              `}</style>

        {openInsight === 'root_cause' && rootCauseAnalysis.length > 0 && (
          <Card className="p-6 mb-6 bg-gradient-to-br from-rose-50 to-orange-50 border-rose-200 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-rose-900">Root Cause Analysis</h3>
                <p className="text-sm text-rose-600">Why marks were lost, not just where.</p>
              </div>
            </div>
            <div className="space-y-3">
              {rootCauseAnalysis.map((cause, idx) => (
                <div key={idx} className="bg-white rounded-xl p-4 border border-rose-100">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{cause.label}</h4>
                    <Badge className={cause.impact === 'high' ? 'bg-red-100 text-red-700' : cause.impact === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}>
                      {cause.count}x
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{cause.what_it_means}</p>
                  {cause.sample_question_type && (
                    <p className="text-xs text-rose-600 mt-2">Sample pattern: {cause.sample_question_type.replace(/_/g, ' ')}</p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Mistake Analysis & Targeted Retry (merged) */}
        {openInsight === 'why_lost' && Object.keys(reasonSummary).length > 0 && (
          <Card data-testid="reason-summary-card" className="p-6 mb-6 bg-white border-0 shadow-lg rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Why You Lost Marks</h3>
                <p className="text-sm text-gray-500">Mistake patterns — click any to retry those questions</p>
              </div>
            </div>

            {/* Reason chips with counts (clickable for retry) */}
            {(() => {
              const allWrong = [...(questionResults.listening || []), ...(questionResults.reading || [])].filter(q => !q.is_correct);
              const byReason = {};
              allWrong.forEach(q => {
                const r = q.reason_code || 'WRONG_ANSWER';
                if (!byReason[r]) byReason[r] = [];
                byReason[r].push(q);
              });
              const buildWrongMap = (items) => {
                const map = {};
                items.forEach(q => {
                  const section = (questionResults.listening || []).includes(q) ? 'listening' : 'reading';
                  map[`${section}_${q.question_id}`] = true;
                });
                return map;
              };

              return (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(byReason)
                      .sort(([,a],[,b]) => b.length - a.length)
                      .map(([code, items]) => {
                        const reasonMeta = {
                          UNANSWERED: { color: 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200', icon: '—' },
                          TFNG_CONFUSION: { color: 'bg-orange-50 text-orange-700 border-orange-300 hover:bg-orange-100', icon: 'T/F' },
                          YNNG_CONFUSION: { color: 'bg-orange-50 text-orange-700 border-orange-300 hover:bg-orange-100', icon: 'Y/N' },
                          SPELLING_ERROR: { color: 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100', icon: 'Abc' },
                          DISTRACTOR_TRAP: { color: 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100', icon: '!?' },
                          NEAR_MISS: { color: 'bg-yellow-50 text-yellow-700 border-yellow-300 hover:bg-yellow-100', icon: '~' },
                          WRONG_ANSWER: { color: 'bg-red-50 text-red-700 border-red-300 hover:bg-red-100', icon: 'X' },
                        };
                        const meta = reasonMeta[code] || reasonMeta.WRONG_ANSWER;
                        const isUnanswered = code === 'UNANSWERED';
                        return (
                          <button
                            key={code}
                            data-testid={`reason-summary-${code}`}
                            onClick={() => !isUnanswered && navigate(`/cambridge-test/${bookId}/${testId}`, {
                              state: { retryWrongOnly: true, wrongQuestions: buildWrongMap(items), retryLabel: code.replace(/_/g, ' '), testData }
                            })}
                            disabled={isUnanswered}
                            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors ${meta.color} ${isUnanswered ? 'opacity-60 cursor-default' : 'cursor-pointer'}`}
                          >
                            <span className="text-lg font-bold">{meta.icon}</span>
                            <div className="text-left">
                              <p className="text-sm font-bold">{items.length}</p>
                              <p className="text-[10px] font-medium leading-tight">{code.replace(/_/g, ' ')}</p>
                            </div>
                            {!isUnanswered && <RefreshCw className="w-3 h-3 opacity-40" />}
                          </button>
                        );
                      })}
                  </div>

                  {/* By Question Type row */}
                  {(() => {
                    const byType = {};
                    allWrong.forEach(q => { const t = q.question_type || 'unknown'; if (!byType[t]) byType[t] = []; byType[t].push(q); });
                    return Object.keys(byType).length > 1 ? (
                      <div className="pt-3 border-t border-gray-100">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">By Question Type</p>
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(byType).sort(([,a],[,b]) => b.length - a.length).map(([type, items]) => (
                            <button
                              key={type}
                              data-testid={`retry-type-${type}`}
                              onClick={() => navigate(`/cambridge-test/${bookId}/${testId}`, {
                                state: { retryWrongOnly: true, wrongQuestions: buildWrongMap(items), retryLabel: type.replace(/_/g, ' '), testData }
                              })}
                              className="text-xs px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors"
                            >
                              {type.replace(/_/g, ' ')} <span className="font-bold">{items.length}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
              );
            })()}
          </Card>
        )}

        {/* Fastest Score Gain Card */}
        {openInsight === 'fastest_gain' && fastestGain.length > 0 && (
          <Card data-testid="fastest-gain-card" className="p-6 mb-6 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-emerald-900">Fastest Score Gain</h3>
                <p className="text-sm text-emerald-600">Fix these areas for the biggest improvement</p>
              </div>
            </div>

            <div className="space-y-3">
              {fastestGain.map((item, idx) => (
                <div key={idx} className="p-4 bg-white rounded-xl border border-emerald-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                        idx === 0 ? 'bg-red-500' : idx === 1 ? 'bg-amber-500' : 'bg-blue-500'
                      }`}>{idx + 1}</span>
                      <span className="font-medium text-gray-900 text-sm">{item.label}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-red-600 font-bold text-sm">+{item.wrong_count} possible</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          item.accuracy >= 70 ? 'bg-green-500' : item.accuracy >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${item.accuracy}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-8">{item.accuracy}%</span>
                  </div>
                  {item.tip && <p className="text-xs text-gray-600 leading-relaxed">{item.tip}</p>}
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-emerald-100/50 rounded-lg">
              <p className="text-sm text-emerald-800 font-medium flex items-center gap-1.5">
                <Target className="w-4 h-4" />
                Focus on #{1}: fixing {fastestGain[0]?.wrong_count || 0} questions here could boost your band by ~0.5
              </p>
            </div>
          </Card>
        )}

        {/* AI Teacher Feedback Card — Overview's centerpiece (Liz holistic) */}
        {openInsight === 'feedback' && teacherFeedback && (
          <Card className="p-6 mb-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900">Your Personal Feedback</h3>
                <p className="text-sm text-blue-600">AI-powered analysis of your performance</p>
              </div>
            </div>

            {/* Quick Summary */}
            <div className="bg-white/60 rounded-xl p-4 mb-4">
              <p className="text-gray-800 leading-relaxed">{teacherFeedback.short}</p>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              {/* Strengths */}
              <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-green-800">Your Strengths</h4>
                </div>
                <div className="space-y-2">
                  {strengths.slice(0, 3).map((skill, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-green-700">{skill.label}</span>
                      <span className="font-medium text-green-800">{Math.round((skill.correct / skill.total) * 100)}%</span>
                    </div>
                  ))}
                  {strengths.length === 0 && (
                    <p className="text-sm text-green-600">Keep practicing to identify your strengths!</p>
                  )}
                </div>
              </div>

              {/* Areas to Improve */}
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-amber-600" />
                  <h4 className="font-semibold text-amber-800">Areas to Improve</h4>
                </div>
                <div className="space-y-2">
                  {weaknesses.slice(0, 3).map((skill, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-amber-700">{skill.label}</span>
                      <span className="font-medium text-amber-800">{Math.round((skill.correct / skill.total) * 100)}%</span>
                    </div>
                  ))}
                  {weaknesses.length === 0 && (
                    <p className="text-sm text-amber-600">Great job! No major weaknesses identified.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Detailed Tips */}
            <div className="bg-violet-50 rounded-xl p-4 border border-violet-100">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-violet-600" />
                <h4 className="font-semibold text-violet-800">Tips to Improve</h4>
              </div>
              <p className="text-gray-700 leading-relaxed text-sm">{teacherFeedback.detailed}</p>
            </div>

            {/* Skill-specific Tips */}
            {skillBreakdown.filter(s => s.tip && s.total > 0 && (s.correct / s.total) < 0.7).length > 0 && (
              <div className="mt-4 space-y-3">
                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Practice Recommendations
                </h4>
                {skillBreakdown.filter(s => s.tip && s.total > 0 && (s.correct / s.total) < 0.7).slice(0, 3).map((skill, idx) => (
                  <div key={idx} className="bg-white/60 rounded-lg p-3 border border-gray-100">
                    <p className="font-medium text-gray-800 text-sm mb-1">{skill.label}</p>
                    <p className="text-gray-600 text-sm">{skill.tip}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Recommended Lessons Card */}
        {openInsight === 'lessons' && recommendedLessons.length > 0 && (
          <Card className="p-6 mb-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-indigo-900">Recommended Lessons</h3>
                <p className="text-sm text-indigo-600">Based on your weak areas</p>
              </div>
            </div>

            <div className="space-y-3">
              {recommendedLessons.map((lesson, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-4 bg-white rounded-xl hover:bg-indigo-50 cursor-pointer transition-all border border-indigo-100"
                  onClick={() => navigate(getRecommendedLessonPath(lesson))}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    lesson.priority === 'high' ? 'bg-red-100' : 'bg-indigo-100'
                  }`}>
                    <BookOpen className={`w-5 h-5 ${
                      lesson.priority === 'high' ? 'text-red-600' : 'text-indigo-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                    <p className="text-sm text-gray-500">{lesson.reason}</p>
                    <p className="text-xs text-indigo-600 mt-1">{lesson.course || lesson.course_name}</p>
                  </div>
                  {lesson.priority === 'high' && (
                    <Badge className="bg-red-100 text-red-700 text-xs">Priority</Badge>
                  )}
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              ))}
            </div>
          </Card>
        )}

        {openInsight === 'roadmap' && studyPlan?.roadmap_steps?.length > 0 && (
          <Card className="p-6 mb-6 bg-gradient-to-br from-violet-50 to-indigo-50 border-violet-200 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shadow-lg">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-violet-900">Study Roadmap</h3>
                <p className="text-sm text-violet-600">A concrete path from Band {computedOverall?.toFixed?.(1) || computedOverall || '-'} toward Band {studyPlan.target_band}</p>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-3 mb-4">
              <div className="bg-white rounded-xl p-4 border border-violet-100">
                <p className="text-xs uppercase tracking-wide text-gray-500">Priority Skill</p>
                <p className="text-lg font-bold text-violet-700">{studyPlan.priority_skill || 'N/A'}</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-violet-100">
                <p className="text-xs uppercase tracking-wide text-gray-500">Expected Mark Recovery</p>
                <p className="text-lg font-bold text-violet-700">+{studyPlan.expected_mark_recovery || 0}</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-violet-100">
                <p className="text-xs uppercase tracking-wide text-gray-500">Estimated Recovery Window</p>
                <p className="text-lg font-bold text-violet-700">{studyPlan.estimated_weeks || 0} weeks</p>
              </div>
            </div>
            <div className="space-y-3 mb-4">
              {studyPlan.roadmap_steps.map((step, idx) => (
                <div key={idx} className="bg-white rounded-xl p-4 border border-violet-100">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{idx + 1}. {step.title}</h4>
                    {step.lesson_path && (
                      <Button size="sm" variant="outline" onClick={() => navigate(step.lesson_path)}>
                        Open Lesson
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{step.why_now}</p>
                  <p className="text-sm text-gray-700"><strong>Action:</strong> {step.action}</p>
                  <p className="text-xs text-violet-700 mt-2">{step.expected_gain}</p>
                </div>
              ))}
            </div>
            {studyPlan.three_day_plan?.length > 0 && (
              <div className="bg-white rounded-xl p-4 border border-violet-100">
                <h4 className="font-semibold text-gray-900 mb-3">3-Day Recovery Plan</h4>
                <div className="space-y-3">
                  {studyPlan.three_day_plan.map((day) => (
                    <div key={day.day}>
                      <p className="font-medium text-violet-700">Day {day.day}: {day.title}</p>
                      <ul className="text-sm text-gray-600 mt-1 space-y-1">
                        {day.tasks.map((task, idx) => <li key={idx}>• {task}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

              </div>
            </aside>
          </div>
  );
}
