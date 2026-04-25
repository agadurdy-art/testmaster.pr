import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  ArrowLeft, Trophy, BookOpen, Headphones, PenTool, Mic,
  CheckCircle, XCircle, TrendingUp, Target, Info,
  Lightbulb, ChevronDown, ChevronUp, Loader2, Award,
  AlertTriangle, Zap, GraduationCap, ChevronRight, Eye, RefreshCw
} from 'lucide-react';
import { getRecommendedLessonPath } from '../lib/recommendationRouting';
import { useGoBack } from '../hooks/useGoBack';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const SECTION_ICONS = {
  listening: Headphones,
  reading: BookOpen,
  writing: PenTool,
  speaking: Mic
};

const getBandColorClass = (score) => score >= 7 ? 'text-green-600' : score >= 6 ? 'text-blue-600' : score >= 5 ? 'text-yellow-600' : 'text-red-600';
const getBandBgClass = (score) => score >= 7 ? 'bg-green-500' : score >= 6 ? 'bg-blue-500' : score >= 5 ? 'bg-yellow-500' : 'bg-red-500';
const getBandLightBg = (score) => score >= 7 ? 'bg-green-100 text-green-700' : score >= 6 ? 'bg-blue-100 text-blue-700' : score >= 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';

export default function FullTestResults() {
  const { sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const goBack = useGoBack();

  const [results, setResults] = useState(location.state?.results || null);
  const [loading, setLoading] = useState(!location.state?.results);
  const [expandedSection, setExpandedSection] = useState(null);
  const [showBandTooltip, setShowBandTooltip] = useState(false);

  useEffect(() => {
    if (!results) {
      loadResults();
    }
  }, [sessionId]);

  const loadResults = async () => {
    try {
      const res = await fetch(`${API_URL}/api/full-test/results/${sessionId}`);
      const data = await res.json();
      if (data.success) {
        setResults(data.results);
      }
    } catch (error) {
      console.error('Error loading results:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-slate-50/30 to-gray-100 py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="h-8 w-40 bg-gray-200 rounded-lg animate-pulse mb-6" />
          <div className="text-center mb-8">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-200 rounded-3xl animate-pulse" />
            <div className="h-10 w-64 mx-auto bg-gray-200 rounded-lg animate-pulse mb-2" />
          </div>
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-lg mb-4">
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-3" />
              <div className="h-4 w-full bg-gray-100 rounded animate-pulse mb-2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Results Not Available</h2>
          <p className="text-slate-600 mb-6">The results for this test session could not be found.</p>
          <Button onClick={goBack}>Back to Question Bank</Button>
        </Card>
      </div>
    );
  }

  const overallBand = results.overall?.band || 0;
  const skillBreakdown = results.skill_breakdown || [];
  const teacherFeedback = results.teacher_feedback || null;
  const recommendedLessons = results.recommended_lessons || [];
  const questionResults = results.question_results || { listening: [], reading: [] };
  const fastestGain = results.fastest_gain || [];
  const integrityWarnings = results.integrity_warnings || [];
  const reasonSummary = results.reason_summary || {};
  const rootCauseAnalysis = results.root_cause_analysis || [];
  const studyPlan = results.study_plan || null;

  const strengths = skillBreakdown.filter(s => s.total > 0 && (s.correct / s.total) >= 0.7);
  const weaknesses = skillBreakdown.filter(s => s.total > 0 && (s.correct / s.total) < 0.5);

  return (
    <div data-testid="full-test-results" className="min-h-screen bg-gradient-to-b from-gray-50 via-slate-50/30 to-gray-100 py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <Button data-testid="back-to-qb-btn" variant="ghost" onClick={goBack} className="mb-6 text-gray-600 hover:text-slate-600">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Question Bank
        </Button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className={`w-24 h-24 mx-auto mb-6 rounded-3xl ${getBandBgClass(overallBand)} flex items-center justify-center shadow-2xl`}>
            <Award className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Test Complete!</h1>
          <p className="text-lg text-gray-500">IELTS-Style Academic Full Test</p>
        </div>

        {/* Main Score Card */}
        <Card data-testid="overall-score-card" className="p-8 mb-6 bg-white border-0 shadow-lg rounded-2xl text-center">
          <p className="text-gray-500 mb-2 text-lg">Your Estimated Band Score</p>
          <p data-testid="overall-band-score" className={`text-8xl font-bold mb-4 ${getBandColorClass(overallBand)}`}>{overallBand || '-'}</p>
          
          {/* Band Calculation Tooltip */}
          <div className="mb-6">
            <button 
              data-testid="band-transparency-toggle"
              onClick={() => setShowBandTooltip(!showBandTooltip)} 
              className="text-sm text-gray-400 hover:text-slate-600 transition-colors flex items-center gap-1 mx-auto"
            >
              <Info className="w-3.5 h-3.5" /> How is this calculated?
            </button>
            {showBandTooltip && (
              <div data-testid="band-calculation-breakdown" className="mt-3 mx-auto max-w-md bg-gray-50 rounded-xl p-4 text-left border">
                <h4 className="font-semibold text-gray-800 text-sm mb-3">Band Score Mapping</h4>
                <div className="space-y-2 text-sm">
                  {results.sections?.listening && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 flex items-center gap-1.5"><Headphones className="w-3.5 h-3.5 text-blue-500" /> Listening</span>
                      <span className="text-gray-800">{results.sections.listening.correct}/{results.sections.listening.total} ({Math.round(results.sections.listening.percentage)}%) <span className="font-bold text-blue-600 ml-1">= Band {results.sections.listening.band}</span></span>
                    </div>
                  )}
                  {results.sections?.reading && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5 text-green-500" /> Reading</span>
                      <span className="text-gray-800">{results.sections.reading.correct}/{results.sections.reading.total} ({Math.round(results.sections.reading.percentage)}%) <span className="font-bold text-green-600 ml-1">= Band {results.sections.reading.band}</span></span>
                    </div>
                  )}
                  {results.sections?.writing?.band > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 flex items-center gap-1.5"><PenTool className="w-3.5 h-3.5 text-purple-500" /> Writing</span>
                      <span className="font-bold text-purple-600">Band {results.sections.writing.band}</span>
                    </div>
                  )}
                  {results.sections?.speaking?.band > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 flex items-center gap-1.5"><Mic className="w-3.5 h-3.5 text-orange-500" /> Speaking</span>
                      <span className="font-bold text-orange-600">Band {results.sections.speaking.band}</span>
                    </div>
                  )}
                  <div className="pt-2 mt-2 border-t border-gray-200 flex justify-between items-center">
                    <span className="text-gray-800 font-medium">Overall (average, rounded to 0.5)</span>
                    <span className={`font-bold text-lg ${getBandColorClass(overallBand)}`}>Band {overallBand}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-gray-100">
            {[
              { label: 'Listening', band: results.sections?.listening?.band, pct: results.sections?.listening?.percentage, icon: Headphones, color: 'blue', correct: results.sections?.listening?.correct, total: results.sections?.listening?.total },
              { label: 'Reading', band: results.sections?.reading?.band, pct: results.sections?.reading?.percentage, icon: BookOpen, color: 'green', correct: results.sections?.reading?.correct, total: results.sections?.reading?.total },
              { label: 'Writing', band: results.sections?.writing?.band, icon: PenTool, color: 'purple' },
              { label: 'Speaking', band: results.sections?.speaking?.band, icon: Mic, color: 'orange' },
            ].map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} data-testid={`section-score-${s.label.toLowerCase()}`} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-lg bg-${s.color}-500 flex items-center justify-center`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-500">{s.label}</span>
                  </div>
                  <p className={`text-2xl font-bold ${getBandColorClass(s.band || 0)}`}>{s.band || '-'}</p>
                  {s.pct != null && (
                    <div className="mt-1.5">
                      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full bg-${s.color}-500 rounded-full transition-all duration-700`} style={{width: `${Math.round(s.pct)}%`}} />
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5">{s.correct}/{s.total} correct</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Integrity Warnings */}
        {integrityWarnings.length > 0 && (
          <Card data-testid="integrity-warnings" className="p-4 mb-6 bg-amber-50 border border-amber-200 rounded-2xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-amber-800 text-sm">Submission Integrity</h3>
                <div className="mt-1 space-y-1">
                  {integrityWarnings.map((w, idx) => (
                    <p key={idx} className="text-sm text-amber-700">{w.message}</p>
                  ))}
                </div>
                <p className="text-xs text-amber-500 mt-2">Tip: Always review unanswered questions before submitting.</p>
              </div>
            </div>
          </Card>
        )}

        {rootCauseAnalysis.length > 0 && (
          <Card className="p-6 mb-6 bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-200 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-rose-900">Root Cause Analysis</h3>
                <p className="text-sm text-rose-600">The repeated error patterns behind your score.</p>
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

        {/* Mistake Analysis & Reason Summary */}
        {Object.keys(reasonSummary).length > 0 && (
          <Card data-testid="reason-summary-card" className="p-6 mb-6 bg-white border-0 shadow-lg rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Why You Lost Marks</h3>
                <p className="text-sm text-gray-500">Mistake patterns across your test</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {Object.entries(reasonSummary)
                .sort(([,a],[,b]) => b - a)
                .map(([code, count]) => {
                  const reasonMeta = {
                    UNANSWERED: { color: 'bg-gray-100 text-gray-700 border-gray-300', icon: '\u2014' },
                    TFNG_CONFUSION: { color: 'bg-orange-50 text-orange-700 border-orange-300', icon: 'T/F' },
                    YNNG_CONFUSION: { color: 'bg-orange-50 text-orange-700 border-orange-300', icon: 'Y/N' },
                    SPELLING_ERROR: { color: 'bg-amber-50 text-amber-700 border-amber-300', icon: 'Abc' },
                    DISTRACTOR_TRAP: { color: 'bg-rose-50 text-rose-700 border-rose-300', icon: '!?' },
                    NEAR_MISS: { color: 'bg-yellow-50 text-yellow-700 border-yellow-300', icon: '~' },
                    WRONG_ANSWER: { color: 'bg-red-50 text-red-700 border-red-300', icon: 'X' },
                  };
                  const meta = reasonMeta[code] || reasonMeta.WRONG_ANSWER;
                  return (
                    <div
                      key={code}
                      data-testid={`reason-summary-${code}`}
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border ${meta.color}`}
                    >
                      <span className="text-lg font-bold">{meta.icon}</span>
                      <div className="text-left">
                        <p className="text-sm font-bold">{count}</p>
                        <p className="text-[10px] font-medium leading-tight">{code.replace(/_/g, ' ')}</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </Card>
        )}

        {/* Fastest Score Gain */}
        {fastestGain.length > 0 && (
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
                    <span className="text-red-600 font-bold text-sm">+{item.wrong_count} possible</span>
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
              
              <div className="mt-4 p-3 bg-emerald-100/50 rounded-lg">
                <p className="text-sm text-emerald-800 font-medium flex items-center gap-1.5">
                  <Target className="w-4 h-4" />
                  Focus on #{1}: fixing {fastestGain[0]?.wrong_count || 0} questions here could boost your band by ~0.5
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* AI Teacher Feedback */}
        {teacherFeedback && (
          <Card data-testid="teacher-feedback-card" className="p-6 mb-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 rounded-2xl">
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
                  {strengths.length === 0 && <p className="text-sm text-green-600">Keep practicing to identify your strengths!</p>}
                </div>
              </div>

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
                  {weaknesses.length === 0 && <p className="text-sm text-amber-600">Great job! No major weaknesses identified.</p>}
                </div>
              </div>
            </div>

            {/* Detailed Tips */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-slate-600" />
                <h4 className="font-semibold text-slate-800">Tips to Improve</h4>
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

        {/* Recommended Lessons */}
        {recommendedLessons.length > 0 && (
          <Card data-testid="recommended-lessons-card" className="p-6 mb-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 rounded-2xl">
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
                    <BookOpen className={`w-5 h-5 ${lesson.priority === 'high' ? 'text-red-600' : 'text-indigo-600'}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                    <p className="text-sm text-gray-500">{lesson.reason}</p>
                    <p className="text-xs text-indigo-600 mt-1">{lesson.course || lesson.course_name}</p>
                  </div>
                  {lesson.priority === 'high' && <Badge className="bg-red-100 text-red-700 text-xs">Priority</Badge>}
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              ))}
            </div>
          </Card>
        )}

        {studyPlan?.roadmap_steps?.length > 0 && (
          <Card className="p-6 mb-6 bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-200 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shadow-lg">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-violet-900">Study Roadmap</h3>
                <p className="text-sm text-violet-600">A concrete path to move from Band {overallBand} toward Band {studyPlan.target_band}</p>
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

        {/* Listening Results - Detailed */}
        {questionResults.listening?.length > 0 && (
          <QuestionResultsSection
            title="Listening"
            icon={Headphones}
            color="blue"
            sectionResult={results.sections?.listening}
            questions={questionResults.listening}
            expanded={expandedSection === 'listening'}
            onToggle={() => setExpandedSection(expandedSection === 'listening' ? null : 'listening')}
          />
        )}

        {/* Reading Results - Detailed */}
        {questionResults.reading?.length > 0 && (
          <QuestionResultsSection
            title="Reading"
            icon={BookOpen}
            color="green"
            sectionResult={results.sections?.reading}
            questions={questionResults.reading}
            expanded={expandedSection === 'reading'}
            onToggle={() => setExpandedSection(expandedSection === 'reading' ? null : 'reading')}
            showEvidence
          />
        )}

        {/* Writing Results */}
        {results.sections?.writing && results.sections.writing.band > 0 && (
          <Card data-testid="writing-results-card" className="p-6 mb-6 bg-white border-0 shadow-lg rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center shadow-lg">
                <PenTool className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Writing</h3>
                <p className="text-sm text-gray-500">Band {results.sections.writing.band}</p>
              </div>
            </div>
            
            {results.sections.writing.tasks?.map((task) => (
              <div key={task.task} className="mb-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Task {task.task}</h4>
                  <Badge className={getBandLightBg(task.band)}>Band {task.band}</Badge>
                </div>
                
                {task.criteria && (
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {Object.entries(task.criteria).map(([key, value]) => (
                      <div key={key} className="text-sm">
                        <span className="text-gray-500 capitalize">{key.replace(/_/g, ' ')}: </span>
                        <span className="font-medium text-gray-900">{value}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {task.strengths?.length > 0 && (
                  <div className="mb-2">
                    <p className="text-sm font-medium text-green-600 mb-1">Strengths:</p>
                    <ul className="text-sm text-gray-600 list-disc list-inside">
                      {task.strengths.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}
                
                {task.weaknesses?.length > 0 && (
                  <div className="mb-2">
                    <p className="text-sm font-medium text-amber-600 mb-1">Areas for Improvement:</p>
                    <ul className="text-sm text-gray-600 list-disc list-inside">
                      {task.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  </div>
                )}
                
                {task.feedback && (
                  <div className="p-3 bg-white rounded border"><p className="text-sm text-gray-700">{task.feedback}</p></div>
                )}
              </div>
            ))}
          </Card>
        )}

        {/* Speaking Results */}
        {results.sections?.speaking && results.sections.speaking.band > 0 && (
          <Card data-testid="speaking-results-card" className="p-6 mb-6 bg-white border-0 shadow-lg rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
                <Mic className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Speaking</h3>
                <p className="text-sm text-gray-500">Band {results.sections.speaking.band}</p>
              </div>
            </div>
            
            {results.sections.speaking.criteria && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                {Object.entries(results.sections.speaking.criteria).map(([key, value]) => (
                  <div key={key} className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-xs text-gray-500 capitalize mb-1">{key.replace(/_/g, ' ')}</div>
                    <div className="text-xl font-bold text-gray-900">{value}</div>
                  </div>
                ))}
              </div>
            )}
            
            {results.sections.speaking.strengths?.length > 0 && (
              <div className="mb-3">
                <p className="text-sm font-medium text-green-600 mb-1">Strengths:</p>
                <ul className="text-sm text-gray-600 list-disc list-inside">
                  {results.sections.speaking.strengths.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}
            
            {results.sections.speaking.weaknesses?.length > 0 && (
              <div className="mb-3">
                <p className="text-sm font-medium text-amber-600 mb-1">Areas for Improvement:</p>
                <ul className="text-sm text-gray-600 list-disc list-inside">
                  {results.sections.speaking.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </div>
            )}
            
            {results.sections.speaking.feedback && (
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-gray-700">{results.sections.speaking.feedback}</p>
              </div>
            )}
          </Card>
        )}

        {/* Summary */}
        {results.summary && (
          <Card className="p-6 mt-8 mb-8 bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200 rounded-2xl">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Mentor Notes</h3>
                <p className="text-slate-700 mb-4">{results.summary.recommendation}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8 pb-12">
          <Button data-testid="back-btn" variant="outline" onClick={goBack}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Question Bank
          </Button>
          <Button data-testid="take-another-btn" className="bg-slate-900 hover:bg-slate-800" onClick={() => navigate('/full-test')}>
            Take Another Test
          </Button>
        </div>
      </div>
    </div>
  );
}

/* Reusable component for Listening/Reading per-question details */
function QuestionResultsSection({ title, icon: Icon, color, sectionResult, questions, expanded, onToggle, showEvidence }) {
  if (!sectionResult) return null;
  
  return (
    <Card data-testid={`${title.toLowerCase()}-results-card`} className="p-6 mb-6 bg-white border-0 shadow-lg rounded-2xl">
      <div className="flex items-center justify-between cursor-pointer" onClick={onToggle}>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-${color}-500 to-${color === 'blue' ? 'cyan' : 'emerald'}-500 flex items-center justify-center shadow-lg flex-shrink-0`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="h-1.5 flex-1 max-w-[120px] bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full bg-${color}-500 rounded-full`} style={{width: `${Math.round(sectionResult.percentage || 0)}%`}} />
              </div>
              <span className="text-xs text-gray-500">{sectionResult.correct}/{sectionResult.total}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`text-sm px-2.5 py-0.5 ${getBandLightBg(sectionResult.band || 5)}`}>
            {sectionResult.band || '-'}
          </Badge>
          {expanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </div>
      </div>
      
      {expanded && (
        <div className="mt-6 space-y-3 max-h-[500px] overflow-y-auto pr-2">
          {questions.map((q, idx) => (
            <div 
              key={idx}
              data-testid={`question-detail-${title.toLowerCase()}-${q.question_id}`}
              className={`p-4 rounded-xl border-l-4 ${q.is_correct ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}
            >
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                  q.is_correct ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {String(q.question_id).replace(/[^\d]/g, '') || idx + 1}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-gray-200 text-gray-600">
                  {q.question_type?.replace(/_/g, ' ') || 'Question'}
                </span>
                {q.is_correct ? <CheckCircle className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-red-600" />}
                {q.reason_code && !q.is_correct && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    q.reason_code === 'UNANSWERED' ? 'bg-gray-200 text-gray-700' :
                    q.reason_code === 'TFNG_CONFUSION' || q.reason_code === 'YNNG_CONFUSION' ? 'bg-orange-100 text-orange-700' :
                    q.reason_code === 'SPELLING_ERROR' ? 'bg-amber-100 text-amber-700' :
                    q.reason_code === 'DISTRACTOR_TRAP' ? 'bg-rose-100 text-rose-700' :
                    q.reason_code === 'NEAR_MISS' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {q.reason_label}
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm mb-2">
                <div>
                  <span className="text-gray-500">Your Answer: </span>
                  <span className={`font-semibold ${q.is_correct ? 'text-green-700' : 'text-red-700'}`}>
                    {q.user_answer || 'No answer'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Correct: </span>
                  <span className="font-semibold text-green-700">{q.correct_answer}</span>
                </div>
              </div>
              
              {/* Evidence from passage (reading only) */}
              {showEvidence && q.evidence_text && !q.is_correct && (
                <div className="mt-3 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                  <div className="flex items-start gap-2">
                    <Eye className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-yellow-700 mb-1">Evidence in Passage</p>
                      <p className="text-sm text-gray-700 italic leading-relaxed">"...{q.evidence_text}..."</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Explanation */}
              {q.explanation && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-blue-700 mb-1">Explanation</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{q.explanation}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Skill Tip */}
              {q.skill_tip && !q.is_correct && (
                <div className="mt-3 p-3 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                  <div className="flex items-start gap-2">
                    <GraduationCap className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-purple-700 mb-1">Skill Tip</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{q.skill_tip}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
