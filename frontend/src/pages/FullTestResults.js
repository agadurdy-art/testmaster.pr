import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  ArrowLeft, BookOpen, Headphones, PenTool, Mic,
  CheckCircle, TrendingUp, Target, Info,
  Lightbulb, Loader2, Award,
  AlertTriangle, Zap, GraduationCap, ChevronRight, X, MapPin, MessageCircle,
  Link2, Check
} from 'lucide-react';
import { getRecommendedLessonPath } from '../lib/recommendationRouting';
import {
  ResultsState as SpeakingResultsState,
  adaptSpeakingResult,
  LegacySpeakingDetailDrawer,
} from '../features/speaking';
import { ReadingListeningDrilldown, ReadingResultsLayout, ListeningResultsLayout } from '../features/results';
import WritingEvaluatorResult from '../features/evaluator/components/WritingEvaluatorResult';
import '../features/speaking/speaking.css';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// iOS 26 design tokens — same vocabulary as D9 Question Bank.
const T = {
  brand: '160 84% 39%',
  brandDark: '160 84% 28%',
  muted: '220 10% 45%',
  border: '210 30% 92%',
};

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
  const [searchParams, setSearchParams] = useSearchParams();

  const [results, setResults] = useState(location.state?.results || null);
  const [loading, setLoading] = useState(!location.state?.results);
  const [showBandTooltip, setShowBandTooltip] = useState(false);
  // Holistic insight cards collapse to a tile grid; clicking a tile opens
  // the full card content in a slide-in drawer. Same pattern as
  // CambridgeTestResults — keeps Overview scannable.
  const [openInsight, setOpenInsight] = useState(null);

  // SceneBar tab state — persisted in URL so refresh survives.
  const validTabs = ['overview', 'reading', 'listening', 'writing', 'speaking'];
  const requestedTab = searchParams.get('tab');
  const activeTab = validTabs.includes(requestedTab) ? requestedTab : 'overview';
  const setActiveTab = (t) => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', t);
    setSearchParams(next, { replace: true });
  };

  // Share link copy state — sessionId (uuid4) is the share token. The
  // /full-test/results/:sessionId route is public so an unauthenticated
  // viewer can open the link and see the same payload.
  const [shareCopied, setShareCopied] = useState(false);
  const copyShareLink = async () => {
    try {
      const url = `${window.location.origin}/full-test/results/${sessionId}`;
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const ta = document.createElement('textarea');
        ta.value = url;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2200);
    } catch (e) {
      console.error('Share link copy failed:', e);
    }
  };
  // Writing sub-tab state (T1/T2) for the Writing tab. URL-synced so refresh
  // keeps the user on the same task. Defaults to task 1.
  const requestedWtask = searchParams.get('wtask');
  const activeWtask = (requestedWtask === '2' ? 2 : 1);
  const setActiveWtask = (n) => {
    const next = new URLSearchParams(searchParams);
    next.set('wtask', String(n));
    setSearchParams(next, { replace: true });
  };

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
          <Button onClick={() => navigate('/question-bank')}>Back to Question Bank</Button>
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

  // Reading no longer early-returns — it renders inside the standard
  // FullTestResults shell so the SceneBar stays visible across all skill
  // tabs (consistent navigation). The hero card is hidden on non-overview
  // tabs so each skill layout's own band dial isn't duplicated.

  return (
    <div data-testid="full-test-results" className="min-h-screen bg-gradient-to-b from-gray-50 via-slate-50/30 to-gray-100 py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6 gap-3">
          <Button data-testid="back-to-qb-btn" variant="ghost" onClick={() => navigate('/question-bank')} className="text-gray-600 hover:text-slate-600">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Question Bank
          </Button>
          <Button
            data-testid="copy-share-link-btn"
            variant="outline"
            size="sm"
            onClick={copyShareLink}
            className="text-gray-600 hover:text-slate-700 border-gray-200"
          >
            {shareCopied ? (
              <><Check className="w-4 h-4 mr-2 text-green-600" /> Link copied</>
            ) : (
              <><Link2 className="w-4 h-4 mr-2" /> Copy share link</>
            )}
          </Button>
        </div>

        {/* Compact Hero — band score + per-skill mini cards in one row.
            iOS 26 glass card; no oversized icons or vertical empty space.
            ONLY shown on Overview tab — skill tabs render their layout's own
            band dial, so duplicating the FullTest hero would clutter the UI. */}
        {activeTab === 'overview' && (
        <Card data-testid="overall-score-card" className="px-5 py-4 mb-5 bg-white border-0 shadow-sm rounded-2xl" style={{ border: `1px solid hsl(${T.border})` }}>
          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-5 items-center">
            {/* Band block */}
            <div className="flex items-center gap-4 md:pr-5 md:border-r md:border-gray-100">
              <div className={`w-14 h-14 rounded-2xl ${getBandBgClass(overallBand)} flex items-center justify-center shadow-md flex-shrink-0`}>
                <Award className="w-7 h-7 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">Estimated Band</p>
                <p data-testid="overall-band-score" className={`text-5xl font-bold leading-none ${getBandColorClass(overallBand)}`}>{overallBand || '-'}</p>
                <p className="text-xs text-gray-500 truncate mt-1">IELTS-Style Academic Full Test</p>
                <button
                  data-testid="band-transparency-toggle"
                  onClick={() => setShowBandTooltip(!showBandTooltip)}
                  className="mt-1 text-[11px] text-gray-400 hover:text-slate-600 transition-colors inline-flex items-center gap-1"
                >
                  <Info className="w-3 h-3" /> How is this calculated?
                </button>
              </div>
            </div>

            {/* Skill mini cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'listening', label: 'Listening', band: results.sections?.listening?.band, pct: results.sections?.listening?.percentage, icon: Headphones, color: 'blue', correct: results.sections?.listening?.correct, total: results.sections?.listening?.total },
                { id: 'reading', label: 'Reading', band: results.sections?.reading?.band, pct: results.sections?.reading?.percentage, icon: BookOpen, color: 'green', correct: results.sections?.reading?.correct, total: results.sections?.reading?.total },
                { id: 'writing', label: 'Writing', band: results.sections?.writing?.band, icon: PenTool, color: 'purple' },
                { id: 'speaking', label: 'Speaking', band: results.sections?.speaking?.band, icon: Mic, color: 'orange' },
              ].map(s => {
                const Icon = s.icon;
                const isActive = activeTab === s.id;
                return (
                  <button
                    key={s.label}
                    data-testid={`section-score-${s.label.toLowerCase()}`}
                    onClick={() => setActiveTab(s.id)}
                    className={`text-left px-2.5 py-2 rounded-xl bg-${s.color}-50/50 border border-${s.color}-100 cursor-pointer hover:shadow-sm hover:-translate-y-0.5 transition-all ${
                      isActive ? `ring-2 ring-${s.color}-400` : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div className={`w-5 h-5 rounded-md bg-${s.color}-500 flex items-center justify-center flex-shrink-0`}>
                          <Icon className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-[11px] font-medium text-gray-500 truncate">{s.label}</span>
                      </div>
                      <p className={`text-lg font-bold leading-none ${getBandColorClass(s.band || 0)}`}>{s.band || '-'}</p>
                    </div>
                    {s.pct != null ? (
                      <div className="flex items-center gap-1.5">
                        <div className="h-1 flex-1 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full bg-${s.color}-500 rounded-full transition-all duration-700`} style={{width: `${Math.round(s.pct)}%`}} />
                        </div>
                        <p className="text-[9px] text-gray-400 whitespace-nowrap">{s.correct}/{s.total}</p>
                      </div>
                    ) : (
                      <p className="text-[9px] text-gray-400">{s.band ? '\u00a0' : 'Not scored'}</p>
                    )}
                    <p className={`text-[9px] mt-1 font-semibold text-${s.color}-700 flex items-center gap-0.5`}>
                      Detail <ChevronRight className="w-2.5 h-2.5" />
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Band Calculation Tooltip — collapsed by default */}
          {showBandTooltip && (
            <div data-testid="band-calculation-breakdown" className="mt-3 bg-gray-50 rounded-xl p-3 text-left border">
              <h4 className="font-semibold text-gray-800 text-xs mb-2">Band Score Mapping</h4>
              <div className="space-y-1.5 text-xs">
                {results.sections?.listening && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 flex items-center gap-1.5"><Headphones className="w-3 h-3 text-blue-500" /> Listening</span>
                    <span className="text-gray-800">{results.sections.listening.correct}/{results.sections.listening.total} ({Math.round(results.sections.listening.percentage)}%) <span className="font-bold text-blue-600 ml-1">= Band {results.sections.listening.band}</span></span>
                  </div>
                )}
                {results.sections?.reading && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 flex items-center gap-1.5"><BookOpen className="w-3 h-3 text-green-500" /> Reading</span>
                    <span className="text-gray-800">{results.sections.reading.correct}/{results.sections.reading.total} ({Math.round(results.sections.reading.percentage)}%) <span className="font-bold text-green-600 ml-1">= Band {results.sections.reading.band}</span></span>
                  </div>
                )}
                {results.sections?.writing?.band > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 flex items-center gap-1.5"><PenTool className="w-3 h-3 text-purple-500" /> Writing</span>
                    <span className="font-bold text-purple-600">Band {results.sections.writing.band}</span>
                  </div>
                )}
                {results.sections?.speaking?.band > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 flex items-center gap-1.5"><Mic className="w-3 h-3 text-orange-500" /> Speaking</span>
                    <span className="font-bold text-orange-600">Band {results.sections.speaking.band}</span>
                  </div>
                )}
                <div className="pt-1.5 mt-1.5 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-gray-800 font-medium">Overall (average, rounded to 0.5)</span>
                  <span className={`font-bold ${getBandColorClass(overallBand)}`}>Band {overallBand}</span>
                </div>
              </div>
            </div>
          )}
        </Card>
        )}

        {/* SceneBar — iOS 26 segmented pill (D9 pattern) */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <div style={{
            display: 'inline-flex', gap: 4,
            padding: 6, borderRadius: 20,
            background: 'hsl(210 40% 97%)',
            border: '1px solid hsl(210 30% 92%)',
            boxShadow: '0 1px 2px hsl(210 30% 50% / 0.04)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            maxWidth: '100%', overflowX: 'auto',
          }}>
            {[
              { id: 'overview', label: 'Overview', icon: Award },
              { id: 'reading', label: 'Reading', icon: BookOpen },
              { id: 'listening', label: 'Listening', icon: Headphones },
              { id: 'writing', label: 'Writing', icon: PenTool },
              { id: 'speaking', label: 'Speaking', icon: Mic },
            ].map((tab) => {
              const Icon = tab.icon;
              const selected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  data-testid={`results-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 14,
                    fontSize: 14, fontWeight: selected ? 600 : 500,
                    color: selected ? `hsl(${T.brandDark})` : `hsl(${T.muted})`,
                    background: selected ? 'white' : 'transparent',
                    border: selected ? '1px solid hsl(210 30% 90%)' : '1px solid transparent',
                    cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    whiteSpace: 'nowrap',
                    boxShadow: selected ? '0 1px 3px hsl(210 30% 50% / 0.10), 0 0 0 1px hsl(210 30% 95%)' : 'none',
                    transition: 'all 180ms ease',
                  }}
                >
                  <Icon style={{ width: 14, height: 14 }} strokeWidth={selected ? 2 : 1.8} /> {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Integrity Warnings */}
        {activeTab === 'overview' && integrityWarnings.length > 0 && (
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

        {/* Holistic insights — tile grid (collapsed) + drawer (full content).
            Same pattern as CambridgeTestResults: tap a tile to open the
            full body in a slide-in drawer. */}
        {activeTab === 'overview' && (() => {
          const allWrong = [...(questionResults.listening || []), ...(questionResults.reading || [])].filter(q => !q.is_correct);
          const wrongCount = allWrong.length;
          const tiles = [
            { id: 'root_cause', label: 'Root Cause Analysis', summary: rootCauseAnalysis.length ? `${rootCauseAnalysis.length} pattern${rootCauseAnalysis.length === 1 ? '' : 's'} flagged` : null, icon: AlertTriangle, brand: 'rose', available: rootCauseAnalysis.length > 0 },
            { id: 'why_lost', label: 'Why You Lost Marks', summary: wrongCount ? `${wrongCount} mistake${wrongCount === 1 ? '' : 's'}` : null, icon: AlertTriangle, brand: 'orange', available: Object.keys(reasonSummary).length > 0 },
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
            <Card data-testid="insights-tile-grid" className="p-4 mb-5 bg-white border-0 shadow-sm rounded-2xl" style={{ border: `1px solid hsl(${T.border})` }}>
              <div className="flex items-center justify-between mb-3 px-1">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Insights</h3>
                  <p className="text-xs text-gray-500">Tap any card to open the full breakdown.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {tiles.map(tile => {
                  const Icon = tile.icon;
                  const c = brandClasses[tile.brand] || brandClasses.blue;
                  return (
                    <button
                      key={tile.id}
                      data-testid={`insight-tile-${tile.id}`}
                      onClick={() => setOpenInsight(tile.id)}
                      className={`text-left p-3 rounded-xl ${c.bg} border ${c.border} hover:shadow-sm hover:-translate-y-0.5 transition-all flex items-start gap-2.5`}
                    >
                      <div className={`w-8 h-8 rounded-lg ${c.iconBg} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-semibold ${c.text} leading-tight`}>{tile.label}</p>
                        {tile.summary && <p className="text-xs text-gray-600 mt-0.5 leading-snug line-clamp-2">{tile.summary}</p>}
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                    </button>
                  );
                })}
              </div>
            </Card>
          );
        })()}

        {/* Insight Drawer — slide-in panel that holds the full content of
            whichever holistic card the user opened. */}
        {openInsight && (
          <div data-testid="insight-drawer" className="fixed inset-0 z-50 flex">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setOpenInsight(null)}
            />
            <aside className="relative ml-auto h-full w-full sm:max-w-2xl bg-gray-50 overflow-y-auto shadow-2xl">
              <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3 bg-white/90 backdrop-blur" style={{ borderBottom: `1px solid hsl(${T.border})` }}>
                <p className="text-sm font-semibold text-gray-700">Insight detail</p>
                <button
                  data-testid="insight-drawer-close"
                  onClick={() => setOpenInsight(null)}
                  className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5">

        {openInsight === 'root_cause' && rootCauseAnalysis.length > 0 && (
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
        {openInsight === 'why_lost' && Object.keys(reasonSummary).length > 0 && (
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

        {/* AI Teacher Feedback — Overview's centerpiece (Liz holistic) */}
        {openInsight === 'feedback' && teacherFeedback && (
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
        {openInsight === 'lessons' && recommendedLessons.length > 0 && (
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

        {openInsight === 'roadmap' && studyPlan?.roadmap_steps?.length > 0 && (
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

              </div>
            </aside>
          </div>
        )}
        {/* End insight drawer */}

        {/* Listening Results - Detailed (rich layout, mirror of Reading) */}
        {activeTab === 'listening' && questionResults.listening?.length > 0 && (
          <ListeningResultsLayout
            feedback={{
              question_results: questionResults.listening,
              correct: results.sections?.listening?.correct ?? 0,
              total: results.sections?.listening?.total ?? 0,
              percentage: results.sections?.listening?.percentage ?? 0,
              transcript: results.sections?.listening?.transcript,
              teacher_feedback: teacherFeedback,
            }}
            band={results.sections?.listening?.band ?? results.overall_band}
            user={(() => { try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; } })()}
            testMeta={{
              title: 'Full Test',
              subtitle: results.session_id ? `Session ${String(results.session_id).slice(0, 8)}` : '',
              durationMin: results.sections?.listening?.duration_minutes,
              allowedMin: 30,
              targetBand: results?.target_band || 7.0,
            }}
            insights={{
              rootCauseAnalysis,
              fastestGain,
              reasonSummary,
              recommendedLessons,
            }}
            onPracticePriority={(p) => {
              const typeMap = { note: 'note_completion', mc: 'multiple_choice', match: 'matching', multi: 'multi_select', short: 'short_answer' };
              const qtype = typeMap[p?.key];
              navigate(qtype ? `/question-bank/listening/practice?type=${qtype}` : '/question-bank/listening');
            }}
          />
        )}

        {/* Reading Results - Detailed */}
        {activeTab === 'reading' && questionResults.reading?.length > 0 && (
          <ReadingResultsLayout
            feedback={{
              question_results: questionResults.reading,
              correct: results.sections?.reading?.correct ?? 0,
              total: results.sections?.reading?.total ?? 0,
              percentage: results.sections?.reading?.percentage ?? 0,
              teacher_feedback: teacherFeedback,
            }}
            band={results.sections?.reading?.band ?? results.overall_band}
            user={(() => { try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; } })()}
            testMeta={{
              title: 'Full Test',
              subtitle: results.session_id ? `Session ${String(results.session_id).slice(0, 8)}` : '',
              durationMin: results.sections?.reading?.duration_minutes,
              allowedMin: 60,
              targetBand: results?.target_band || 7.0,
            }}
            insights={{
              rootCauseAnalysis,
              fastestGain,
              reasonSummary,
              recommendedLessons,
            }}
            onPracticePriority={(p) => {
          const typeMap = { tfng: 'true_false_ng', fill: 'sentence_completion', mc: 'multiple_choice', match: 'matching_information', heading: 'matching_headings' };
          const qtype = typeMap[p?.key];
          navigate(qtype ? `/question-bank/reading/practice?type=${qtype}` : '/question-bank/reading/academic');
        }}
            backHref="/dashboard"
          />
        )}

        {/* Writing Results — V4 "Liz's Margin" per task, with sub-tabs for T1/T2.
            Each task renders the full WritingEvaluatorResult component
            (ScoreStrip + annotated essay + margin notes + CoachingPanel +
            Liz Take). Falls back to a pending card when the eval payload is
            absent (e.g. backend still scoring). */}
        {activeTab === 'writing' && results.sections?.writing && (() => {
          const writingTasks = Array.isArray(results.sections.writing.tasks)
            ? results.sections.writing.tasks
            : [];
          if (writingTasks.length === 0) {
            return (
              <Card data-testid="writing-pending-card" className="p-6 mb-6 bg-white border-0 shadow-lg rounded-2xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center shadow-lg">
                    <PenTool className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Writing</h3>
                    <p className="text-sm text-gray-500">{results.sections.writing.error || 'Liz is still scoring your essays…'}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Hang tight — V4 evaluation usually takes ~30 seconds per task.
                </div>
              </Card>
            );
          }

          // Pick active task; default to first available.
          const t1 = writingTasks.find((t) => t.task === 1);
          const t2 = writingTasks.find((t) => t.task === 2);
          const activeTask = (activeWtask === 2 ? t2 : t1) || writingTasks[0];

          const buildLizMessage = (task) => {
            const v4 = task?.evaluator_v2;
            if (v4?.response_diagnosis?.main_issue) {
              return `Main issue: ${v4.response_diagnosis.main_issue}. Quick win: ${v4.response_diagnosis.quick_win || 'see margin notes'}.`;
            }
            return task?.feedback || 'Liz reviewed your essay — see annotations and coaching plan below.';
          };

          return (
            <div data-testid="writing-results-card">
              {/* Sub-tabs for Task 1 / Task 2 (only show when both exist) */}
              {writingTasks.length > 1 && (
                <div className="flex gap-2 mb-4 px-1">
                  {writingTasks.map((task) => {
                    const isActive = activeTask?.task === task.task;
                    const taskColor = task.task === 1 ? 'orange' : 'violet';
                    return (
                      <button
                        key={task.task}
                        data-testid={`writing-subtab-${task.task}`}
                        onClick={() => setActiveWtask(task.task)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                          isActive
                            ? `bg-${taskColor}-500 text-white shadow-sm`
                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        Task {task.task}
                        {task.band > 0 && <span className="ml-1.5 opacity-90">· Band {task.band}</span>}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Active task body */}
              {activeTask?.evaluator_v2 ? (
                <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                  <WritingEvaluatorResult
                    result={activeTask.evaluator_v2}
                    essayText={activeTask.essay_text || ''}
                    prompt={activeTask.prompt || ''}
                    lizMessage={buildLizMessage(activeTask)}
                    onRewrite={() => navigate('/writing-practice')}
                    onPracticeMore={() => navigate('/writing-practice')}
                    className="bg-transparent"
                  />
                </div>
              ) : (
                <Card className="p-6 mb-6 bg-white border-0 shadow-lg rounded-2xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center shadow-lg">
                      <PenTool className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Task {activeTask?.task} — Pending</h3>
                      <p className="text-sm text-gray-500">{activeTask?.feedback || activeTask?.error || 'No evaluation data available.'}</p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          );
        })()}

        {/* Speaking Results — D7 ResultsState + drawer with legacy examiner detail.
             When the eval hasn't returned yet (band missing) we show a pending
             card so users see the speaking section is in progress instead of
             nothing at all. */}
        {activeTab === 'speaking' && results.sections?.speaking && (() => {
          const speaking = results.sections.speaking;
          const hasBand = (speaking.band || 0) > 0;
          if (!hasBand) {
            return (
              <Card
                data-testid="speaking-pending-card"
                className="p-6 mb-6 bg-white border-0 shadow-lg rounded-2xl"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
                    <Mic className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Speaking
                    </h3>
                    <p className="text-sm text-gray-500">
                      {speaking.error
                        ? speaking.error
                        : 'Liz is still scoring your speaking responses…'}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Hang tight — band scoring usually takes a few seconds.
                </div>
              </Card>
            );
          }
          const adapted = adaptSpeakingResult(speaking);
          if (!adapted) return null;
          return (
            <div
              data-testid="speaking-results-card"
              className="mb-6"
            >
              <div className="speaking-scope rounded-2xl overflow-hidden border border-orange-100 shadow-lg">
                <SpeakingResultsState
                  data={adapted}
                  onRetryCard={() => navigate('/speaking-practice')}
                  onNewCard={() => navigate('/dashboard')}
                />
              </div>
              <LegacySpeakingDetailDrawer evaluation={speaking} />
            </div>
          );
        })()}

        {/* Summary — overview only */}
        {activeTab === 'overview' && results.summary && (
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
          <Button data-testid="back-btn" variant="outline" onClick={() => navigate('/question-bank')}>
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

