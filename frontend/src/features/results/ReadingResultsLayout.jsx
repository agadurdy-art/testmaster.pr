import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft, Search, AlertTriangle, TrendingUp, GraduationCap, Map as MapIcon, Eye,
  Clock, Award, BookOpen, Target, Zap, Repeat, X, Play,
  HelpCircle, ArrowRight, ListChecks, Shuffle, Edit3, Heading,
} from 'lucide-react';
import ReadingListeningDrilldown from './ReadingListeningDrilldown';
import { LIZ_AVATAR_URL } from '../../lib/brand';

// =============================================================================
// HELPERS — passage stats, skill counts, fallback insights
// =============================================================================

const SKILL_LABELS = {
  tfng:    { name: 'T/F/NG · Y/N/NG',    icon: HelpCircle },
  mc:      { name: 'Multiple Choice',    icon: ListChecks },
  fill:    { name: 'Fill in the Blanks', icon: Edit3 },
  match:   { name: 'Matching',           icon: Shuffle },
  heading: { name: 'Headings',           icon: Heading },
  other:   { name: 'Other',              icon: BookOpen },
};

function categorizeSkill(question_type) {
  const t = String(question_type || '').toLowerCase();
  if (t.includes('true') || t.includes('false') || t.includes('yes_no') || t.includes('tfng') || t.includes('ynng') || t.includes('y_n_ng')) return 'tfng';
  if (t.includes('multiple') || t === 'mc' || t === 'mcq') return 'mc';
  if (t.includes('fill') || t.includes('blank') || t.includes('completion') || t.includes('summary') || t.includes('sentence_completion')) return 'fill';
  if (t.includes('match')) return 'match';
  if (t.includes('heading')) return 'heading';
  return 'other';
}

function bandTier(band) {
  const b = Number(band) || 0;
  if (b >= 9)   return 'Expert User';
  if (b >= 8)   return 'Very Good User';
  if (b >= 7)   return 'Good User';
  if (b >= 6)   return 'Competent User';
  if (b >= 5)   return 'Modest User';
  if (b >= 4)   return 'Limited User';
  return 'Extremely Limited';
}

function computePassageStats(question_results) {
  const groups = new Map();
  question_results.forEach((q) => {
    const k = q.passage ?? 1;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(q);
  });
  const sortedKeys = [...groups.keys()].sort(
    (a, b) => (Number(a) || 99) - (Number(b) || 99)
  );
  return sortedKeys.map((k, idx) => {
    const items = groups.get(k);
    const correct = items.filter((q) => q.is_correct).length;
    const total = items.length;
    const skills = {};
    items.forEach((q) => {
      const sk = categorizeSkill(q.question_type);
      if (!skills[sk]) skills[sk] = { correct: 0, total: 0 };
      skills[sk].total += 1;
      if (q.is_correct) skills[sk].correct += 1;
    });
    return {
      n: k,
      idx,
      correct,
      total,
      percent: total ? Math.round((correct / total) * 100) : 0,
      skills,
    };
  });
}

function computeSkillCounts(question_results) {
  const counts = {};
  question_results.forEach((q) => {
    const k = categorizeSkill(q.question_type);
    if (!counts[k]) counts[k] = { correct: 0, wrong: 0, total: 0 };
    counts[k].total += 1;
    if (q.is_correct) counts[k].correct += 1;
    else counts[k].wrong += 1;
  });
  return counts;
}

function priorityFromCounts(skillCounts) {
  const sorted = Object.entries(skillCounts)
    .filter(([k]) => k !== 'other')
    .sort((a, b) => b[1].wrong - a[1].wrong);
  if (!sorted.length || sorted[0][1].wrong === 0) return null;
  const [key, c] = sorted[0];
  return { key, ...SKILL_LABELS[key], wrong: c.wrong, total: c.total };
}

// Heuristic +band lift if we collapse the priority skill's wrongs by 70%
function fastestGainEstimate(question_results, skillCounts, currentBand) {
  const priority = priorityFromCounts(skillCounts);
  if (!priority) return null;
  const wrong = priority.wrong;
  const recoverable = Math.max(1, Math.round(wrong * 0.7));
  const newCorrect = (question_results.filter((q) => q.is_correct).length) + recoverable;
  // Simple band approximation: 40 questions, +1 correct ≈ +0.1 band, capped between 4–9
  const lift = Math.min(2, Math.max(0.5, recoverable * 0.1));
  const projected = Math.min(9, Math.max(4, Number(currentBand || 6) + lift));
  return {
    skillName: priority.name,
    recoverable,
    projectedBand: Math.round(projected * 2) / 2, // round to .5
    newCorrect,
    totalQuestions: question_results.length,
  };
}

// =============================================================================
// SUBCOMPONENTS
// =============================================================================

function BandDial({ band, size = 140 }) {
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, Math.max(0, (Number(band) || 0) / 9));
  const dash = c * pct;
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#e5e7eb" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#bandGrad)"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${dash} ${c}`}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="bandGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-4xl font-bold text-gray-900">{Number(band || 0).toFixed(1)}</span>
      </div>
    </div>
  );
}

function LizShimmerAvatar({ size = 64 }) {
  return (
    <div className="liz-shimmer-wrap" style={{ width: size, height: size }}>
      <style>{`
        .liz-shimmer-wrap {
          position: relative;
          display: inline-block;
          border-radius: 50%;
          isolation: isolate;
        }
        .liz-shimmer-wrap::before, .liz-shimmer-wrap::after {
          content: '';
          position: absolute;
          border-radius: 50%;
          background: conic-gradient(
            hsl(160, 84%, 45%), hsl(199, 89%, 60%), hsl(260, 55%, 62%),
            hsl(290, 70%, 60%), hsl(160, 84%, 45%)
          );
          animation: liz-spin 3s linear infinite;
        }
        .liz-shimmer-wrap::before { inset: -3px; z-index: -1; }
        .liz-shimmer-wrap::after  { inset: -8px; filter: blur(12px); opacity: 0.5; z-index: -2; }
        .liz-shimmer-wrap > img {
          position: relative;
          display: block;
          width: 100%; height: 100%;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid white;
          z-index: 1;
        }
        @keyframes liz-spin { to { transform: rotate(360deg); } }
        .questions-window::-webkit-scrollbar { width: 8px; }
        .questions-window::-webkit-scrollbar-track { background: transparent; }
        .questions-window::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.3);
          border-radius: 4px;
        }
      `}</style>
      <img src={LIZ_AVATAR_URL} alt="Liz" />
    </div>
  );
}

function PassageStatCard({ stats, color, topic }) {
  const TONE = {
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', num: 'text-emerald-700', text: 'text-emerald-900', chipBg: 'bg-emerald-100', chipText: 'text-emerald-800' },
    amber:   { bg: 'bg-amber-50',   border: 'border-amber-200',   num: 'text-amber-700',   text: 'text-amber-900',   chipBg: 'bg-amber-100',   chipText: 'text-amber-800'   },
    rose:    { bg: 'bg-rose-50',    border: 'border-rose-200',    num: 'text-rose-700',    text: 'text-rose-900',    chipBg: 'bg-rose-100',    chipText: 'text-rose-800'    },
  }[color];
  const skillEntries = Object.entries(stats.skills).slice(0, 3);
  return (
    <div className={`rounded-2xl ${TONE.bg} border-l-4 ${TONE.border} p-5 flex flex-col justify-between min-h-[140px]`}>
      <div className="flex items-start justify-between">
        <div>
          <div className={`text-sm font-semibold ${TONE.text}`}>Passage {stats.n}</div>
          {topic ? <div className="text-xs text-gray-500 mt-0.5">{topic}</div> : null}
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${TONE.num}`}>{stats.correct}/{stats.total}</div>
          <div className="text-xs text-gray-500">{stats.percent}%</div>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-3">
        {skillEntries.map(([k, v]) => (
          <span key={k} className={`text-[10px] px-2 py-0.5 rounded-full ${TONE.chipBg} ${TONE.chipText}`}>
            {SKILL_LABELS[k]?.name || k}: {v.correct}/{v.total}
          </span>
        ))}
      </div>
    </div>
  );
}

function TargetCard({ targetBand = 7.0 }) {
  return (
    <div className="rounded-2xl bg-sky-50 border-l-4 border-sky-200 p-5 flex flex-col justify-between min-h-[140px]">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-semibold text-sky-900">Target</div>
          <div className="text-xs text-gray-500 mt-0.5">Next Level</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-sky-700">{Number(targetBand).toFixed(1)}</div>
        </div>
      </div>
      <div className="text-[11px] text-sky-700 mt-3">
        Tap any insight tile to see the path.
      </div>
    </div>
  );
}

function InsightTile({ icon: Icon, title, subtitle, gradient, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-2xl p-5 text-white transition-transform hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 ${gradient}`}
    >
      <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center mb-3">
        <Icon className="w-5 h-5" />
      </div>
      <div className="font-bold text-base">{title}</div>
      <div className="text-xs opacity-90 mt-0.5">{subtitle}</div>
    </button>
  );
}

function TimeManagementCard({ durationMin, allowedMin = 60, perSection }) {
  const pct = allowedMin ? Math.round((durationMin / allowedMin) * 100) : 0;
  return (
    <div className="rounded-2xl bg-white border border-gray-200 p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
          <Clock className="w-4 h-4 text-blue-600" />
        </div>
        <h4 className="font-bold text-gray-900">Time Management</h4>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Overall</span>
        <span className="font-bold text-emerald-600">{pct}%</span>
      </div>
      <div className="text-xs text-gray-500 mb-3">
        {durationMin} min / {allowedMin} min
      </div>
      {perSection?.length ? (
        <div className="space-y-1.5 text-sm">
          {perSection.map((row, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-gray-700">{row.label}</span>
              <span className="text-gray-900 font-medium">{row.minutes} min</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function PriorityFixCard({ priority, onOpen }) {
  if (!priority) {
    return (
      <div className="rounded-2xl bg-emerald-50 border-2 border-emerald-200 p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No Weak Spots</h3>
        </div>
        <p className="text-sm text-emerald-800">Strong performance across every skill type. Push for higher band by trying a harder test.</p>
      </div>
    );
  }
  const Icon = priority.icon || HelpCircle;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full text-left rounded-2xl bg-rose-50 border-2 border-rose-200 p-5 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all group"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Priority Fix</h3>
      </div>
      <div className="text-center">
        <div className="w-14 h-14 mx-auto mb-2 bg-rose-100 rounded-2xl flex items-center justify-center">
          <Icon className="w-7 h-7 text-rose-600" />
        </div>
        <h4 className="font-bold text-rose-900 mb-1">Master {priority.name}</h4>
        <p className="text-sm text-rose-700 mb-2">{priority.wrong} of {priority.total} wrong — biggest opportunity</p>
        <div className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 group-hover:gap-2 transition-all">
          Learn the strategy <ArrowRight className="w-3 h-3" />
        </div>
      </div>
    </button>
  );
}

function QuickActionsCard({ onRetry, onPracticePriority, priorityName }) {
  return (
    <div className="rounded-2xl bg-white border border-gray-200 p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
          <Zap className="w-4 h-4 text-emerald-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
      </div>
      <div className="space-y-2.5">
        {onRetry && (
          <button onClick={onRetry} className="w-full bg-emerald-600 text-white py-2.5 px-4 rounded-xl font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 text-sm">
            <Repeat className="w-4 h-4" /> Retry This Test
          </button>
        )}
        {onPracticePriority && priorityName && (
          <button onClick={onPracticePriority} className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm">
            <Target className="w-4 h-4" /> Practice {priorityName}
          </button>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// MODAL — generic overlay
// =============================================================================

function Modal({ open, onClose, title, children, maxWidth = 'max-w-3xl' }) {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${maxWidth} max-h-[90vh] flex flex-col`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN LAYOUT
// =============================================================================

const TILE_GRADIENTS = {
  rootCause:    'bg-gradient-to-br from-rose-500 to-pink-600',
  whyLost:      'bg-gradient-to-br from-orange-500 to-red-500',
  fastestGain:  'bg-gradient-to-br from-emerald-500 to-teal-600',
  lessons:      'bg-gradient-to-br from-indigo-500 to-purple-600',
  roadmap:      'bg-gradient-to-br from-violet-500 to-purple-600',
  modelAnswers: 'bg-gradient-to-br from-teal-500 to-cyan-600',
};

export default function ReadingResultsLayout({
  feedback,
  band,
  user,
  testMeta = {},
  insights = {},
  onBack,
  backHref = '/',
  onRetry,
  onPracticePriority,
}) {
  const [activeModal, setActiveModal] = useState(null);
  const closeModal = () => setActiveModal(null);

  const questionResults = Array.isArray(feedback?.question_results) ? feedback.question_results : [];
  const correct = feedback?.correct ?? questionResults.filter((q) => q.is_correct).length;
  const total = feedback?.total ?? questionResults.length;
  const pct = total ? Math.round((correct / total) * 100) : 0;

  const passageStats = useMemo(() => computePassageStats(questionResults), [questionResults]);
  const skillCounts = useMemo(() => computeSkillCounts(questionResults), [questionResults]);
  const priority = useMemo(() => priorityFromCounts(skillCounts), [skillCounts]);
  const fastestGain = useMemo(
    () => insights.fastestGain || fastestGainEstimate(questionResults, skillCounts, band),
    [insights.fastestGain, questionResults, skillCounts, band]
  );

  const displayName = user?.firstName || user?.first_name || user?.name || 'Student';
  const tier = bandTier(band);

  const wrongQuestions = useMemo(() => questionResults.filter((q) => !q.is_correct), [questionResults]);

  const reasonSummary = insights.reasonSummary || null;
  const recommendedLessons = insights.recommendedLessons || null;
  const rootCauseAnalysis = insights.rootCauseAnalysis || null;
  const teacherShort = feedback?.teacher_feedback?.short || insights.teacherShort || null;
  const teacherDetailed = feedback?.teacher_feedback?.detailed || insights.teacherDetailed || null;

  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* Top header row (back + title) */}
      {(onBack || backHref || testMeta.title) && (
        <div className="flex items-center justify-between flex-wrap gap-3">
          {(onBack || backHref) && (
            onBack ? (
              <button onClick={onBack} className="flex items-center gap-3 text-gray-600 hover:text-emerald-600 transition-colors group">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
                  <ArrowLeft className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="font-medium">Back to samples</span>
              </button>
            ) : (
              <a href={backHref} className="flex items-center gap-3 text-gray-600 hover:text-emerald-600 transition-colors group">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
                  <ArrowLeft className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="font-medium">Back</span>
              </a>
            )
          )}
          {testMeta.title && (
            <div className="text-right">
              <h1 className="text-xl font-bold text-gray-900">Reading Analysis</h1>
              <p className="text-sm text-gray-500">{testMeta.title}{testMeta.subtitle ? ` • ${testMeta.subtitle}` : ''}</p>
            </div>
          )}
        </div>
      )}

      {/* Greeting + Liz card */}
      <div className="rounded-3xl bg-white border border-gray-200 shadow-sm p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          <div className="flex items-center gap-5 p-4 rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-sky-50 border border-emerald-100/60">
            <BandDial band={band} size={120} />
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 via-sky-700 to-violet-700 bg-clip-text text-transparent">
                {displayName}
              </h2>
              <div className="flex items-center gap-2 mt-1 mb-1">
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <Award className="w-3 h-3" />
                  Band {Number(band || 0).toFixed(1)} · {tier}
                </span>
              </div>
              <div className="text-sm text-gray-700">
                {correct}/{total} Correct ({pct}%)
              </div>
              {testMeta.durationMin != null && (
                <div className="text-xs text-amber-700 mt-0.5">
                  {testMeta.durationMin} minutes
                  {testMeta.allowedMin ? ` • ${testMeta.durationMin > testMeta.allowedMin ? `+${testMeta.durationMin - testMeta.allowedMin} over` : `${testMeta.allowedMin - testMeta.durationMin} min under time`}` : ''}
                </div>
              )}
            </div>
          </div>
          {teacherShort ? (
            <div className="flex items-center gap-4">
              <LizShimmerAvatar size={72} />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">Liz · AI Tutor</h3>
                <p className="text-sm text-gray-700 italic mt-1">"{teacherShort}"</p>
                {teacherDetailed && (
                  <button
                    type="button"
                    onClick={() => setActiveModal('teacher')}
                    className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-violet-700 hover:text-violet-900"
                  >
                    View full analysis <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Passage cards row */}
      {passageStats.length > 0 && (
        <div className={`grid gap-4 ${passageStats.length >= 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
          {passageStats.map((s, i) => (
            <PassageStatCard key={s.n} stats={s} color={['emerald', 'amber', 'rose'][i % 3]} />
          ))}
          {passageStats.length >= 3 && <TargetCard targetBand={testMeta.targetBand || 7.0} />}
        </div>
      )}

      {/* Performance Insights section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-600" /> Performance Insights
          </h3>
          <span className="text-xs text-gray-500">Click any card for detailed analysis</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <InsightTile
            icon={Search}
            title="Root Cause Analysis"
            subtitle={rootCauseAnalysis?.length ? `${rootCauseAnalysis.length} patterns flagged` : 'Find your blind spots'}
            gradient={TILE_GRADIENTS.rootCause}
            onClick={() => setActiveModal('rootCause')}
          />
          <InsightTile
            icon={AlertTriangle}
            title="Why You Lost Marks"
            subtitle={`${wrongQuestions.length} mistakes — tap to retry`}
            gradient={TILE_GRADIENTS.whyLost}
            onClick={() => setActiveModal('whyLost')}
          />
          <InsightTile
            icon={TrendingUp}
            title="Fastest Score Gain"
            subtitle={fastestGain ? `${fastestGain.skillName} mastery → +${(fastestGain.projectedBand - (Number(band) || 0)).toFixed(1)} band` : 'Path to higher band'}
            gradient={TILE_GRADIENTS.fastestGain}
            onClick={() => setActiveModal('fastestGain')}
          />
          <InsightTile
            icon={GraduationCap}
            title="Recommended Lessons"
            subtitle={recommendedLessons?.length ? `${recommendedLessons.length} lessons for weak areas` : 'Tailored to your gaps'}
            gradient={TILE_GRADIENTS.lessons}
            onClick={() => setActiveModal('lessons')}
          />
          <InsightTile
            icon={MapIcon}
            title="Study Roadmap"
            subtitle="3-week improvement plan"
            gradient={TILE_GRADIENTS.roadmap}
            onClick={() => setActiveModal('roadmap')}
          />
          <InsightTile
            icon={Eye}
            title="Model Answers"
            subtitle="Compare your responses"
            gradient={TILE_GRADIENTS.modelAnswers}
            onClick={() => setActiveModal('modelAnswers')}
          />
          <div className="lg:col-span-2">
            <TimeManagementCard
              durationMin={testMeta.durationMin || 0}
              allowedMin={testMeta.allowedMin || 60}
              perSection={testMeta.perSection}
            />
          </div>
        </div>
      </div>

      {/* Question Analysis row — sidebar + drilldown */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-5">
          <PriorityFixCard priority={priority} onOpen={() => setActiveModal('priorityFix')} />
          <QuickActionsCard
            onRetry={onRetry}
            onPracticePriority={onPracticePriority ? () => onPracticePriority(priority) : null}
            priorityName={priority?.name}
          />
        </div>
        <div className="lg:col-span-3">
          <ReadingListeningDrilldown testType="reading" feedback={feedback} />
        </div>
      </div>

      {/* ====================== MODALS ====================== */}

      <Modal open={activeModal === 'teacher'} onClose={closeModal} title="Liz — Detailed Analysis">
        <div className="space-y-3 text-gray-800 whitespace-pre-line text-sm leading-relaxed">
          {teacherDetailed}
        </div>
      </Modal>

      <Modal open={activeModal === 'rootCause'} onClose={closeModal} title="Root Cause Analysis">
        {rootCauseAnalysis && rootCauseAnalysis.length ? (
          <div className="space-y-4">
            {rootCauseAnalysis.map((p, i) => (
              <div key={i} className="p-4 rounded-xl border-2 border-rose-200 bg-rose-50">
                <h4 className="font-bold text-rose-900 mb-1">{p.title || p.label}</h4>
                <p className="text-sm text-rose-800 mb-2">{p.description || p.detail}</p>
                {p.fix && <p className="text-xs text-rose-700"><strong>Rule of thumb:</strong> {p.fix}</p>}
              </div>
            ))}
          </div>
        ) : reasonSummary && Object.keys(reasonSummary).length ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 mb-3">Mistake patterns detected across your wrong answers:</p>
            {Object.entries(reasonSummary).map(([reason, count]) => (
              <div key={reason} className="flex items-center justify-between p-3 rounded-xl border border-rose-200 bg-rose-50">
                <span className="text-sm font-medium text-rose-900">{String(reason).replace(/_/g, ' ').toLowerCase()}</span>
                <span className="text-sm font-bold text-rose-700">{count}× </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-600">No recurring patterns detected. Your mistakes are spread across different question types — keep practicing for consistency.</p>
        )}
      </Modal>

      <Modal open={activeModal === 'whyLost'} onClose={closeModal} title="Why You Lost Marks">
        <p className="text-gray-600 mb-4 text-sm">Breakdown of your {wrongQuestions.length} incorrect answers by skill type.</p>
        <div className="space-y-2">
          {Object.entries(skillCounts).filter(([, c]) => c.wrong > 0).sort((a, b) => b[1].wrong - a[1].wrong).map(([k, c]) => {
            const Icon = SKILL_LABELS[k]?.icon || BookOpen;
            return (
              <div key={k} className="p-3 rounded-xl border border-red-200 bg-red-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-red-600" />
                  <span className="font-semibold text-red-900">{SKILL_LABELS[k]?.name || k}</span>
                </div>
                <span className="text-sm font-bold text-red-700">{c.wrong} wrong / {c.total} total</span>
              </div>
            );
          })}
        </div>
      </Modal>

      <Modal open={activeModal === 'fastestGain'} onClose={closeModal} title="Fastest Score Gain">
        {fastestGain ? (
          <div>
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 mb-4">
              <h4 className="font-bold text-emerald-900 mb-2">Master {fastestGain.skillName}</h4>
              <p className="text-sm text-emerald-800">
                Recovering ~{fastestGain.recoverable} of your wrong answers in this skill could lift your band to{' '}
                <strong>Band {fastestGain.projectedBand.toFixed(1)}</strong>.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">{correct}/{total}</div>
                <div className="text-xs text-gray-500">Now</div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="text-2xl font-bold text-emerald-900">{fastestGain.newCorrect}/{fastestGain.totalQuestions}</div>
                <div className="text-xs text-emerald-700">Projected</div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-600">All skills are balanced — no single quick win identified.</p>
        )}
      </Modal>

      <Modal open={activeModal === 'lessons'} onClose={closeModal} title="Recommended Lessons">
        {recommendedLessons && recommendedLessons.length ? (
          <div className="space-y-3">
            {recommendedLessons.map((l, i) => (
              <div key={i} className="p-4 rounded-xl border-2 border-indigo-200 bg-indigo-50 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-200 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-5 h-5 text-indigo-700" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-indigo-900">{l.title}</h4>
                    {l.priority && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        l.priority === 'high' ? 'bg-rose-100 text-rose-700' :
                        l.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>{l.priority}</span>
                    )}
                  </div>
                  <p className="text-sm text-indigo-800 mt-1">{l.reason}</p>
                  {l.course_name && <p className="text-xs text-indigo-600 mt-1">From: {l.course_name}</p>}
                </div>
              </div>
            ))}
          </div>
        ) : priority ? (
          <div className="space-y-3">
            <div className="p-4 rounded-xl border-2 border-indigo-200 bg-indigo-50">
              <h4 className="font-bold text-indigo-900 mb-1">{priority.name} Strategy</h4>
              <p className="text-sm text-indigo-800">Your weakest skill — start here for the fastest impact.</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-600">No specific lessons recommended — try the next harder test.</p>
        )}
      </Modal>

      <Modal open={activeModal === 'roadmap'} onClose={closeModal} title="3-Week Study Roadmap">
        <div className="space-y-4">
          <div className="p-4 rounded-xl border-2 border-violet-200 bg-violet-50">
            <h4 className="font-bold text-violet-900">Week 1 — Diagnose & drill</h4>
            <ul className="text-sm text-violet-800 mt-2 list-disc pl-5 space-y-1">
              <li>Master the {priority?.name || 'weakest'} strategy</li>
              <li>3 short timed sets per day (15 min each)</li>
              <li>Review every wrong answer with the explanation</li>
            </ul>
          </div>
          <div className="p-4 rounded-xl border-2 border-violet-200 bg-violet-50">
            <h4 className="font-bold text-violet-900">Week 2 — Volume & speed</h4>
            <ul className="text-sm text-violet-800 mt-2 list-disc pl-5 space-y-1">
              <li>1 full passage per day under timed conditions</li>
              <li>Build vocabulary list from passages</li>
              <li>Practice paraphrase recognition daily</li>
            </ul>
          </div>
          <div className="p-4 rounded-xl border-2 border-violet-200 bg-violet-50">
            <h4 className="font-bold text-violet-900">Week 3 — Full tests</h4>
            <ul className="text-sm text-violet-800 mt-2 list-disc pl-5 space-y-1">
              <li>2 full mock tests with strict timing</li>
              <li>Target band: {((Number(band) || 0) + 0.5).toFixed(1)}+</li>
              <li>Review only wrong + low-confidence questions</li>
            </ul>
          </div>
        </div>
      </Modal>

      <Modal open={activeModal === 'modelAnswers'} onClose={closeModal} title={`Model Answers — Your ${wrongQuestions.length} Mistakes`}>
        {wrongQuestions.length ? (
          <div className="space-y-3">
            {wrongQuestions.map((q, i) => (
              <div key={i} className="p-4 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {q.question_number || q.question_id || i + 1}
                    </div>
                    <span className="text-xs font-semibold text-gray-700">{q.question_type}</span>
                    {q.passage != null && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">P{q.passage}</span>
                    )}
                  </div>
                </div>
                {q.question_text && <div className="text-sm text-gray-700 mb-2">{q.question_text}</div>}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-red-50 rounded border border-red-100"><span className="text-red-700">Your: {String(q.user_answer ?? '—')}</span></div>
                  <div className="p-2 bg-emerald-50 rounded border border-emerald-100"><span className="text-emerald-700">Correct: {String(q.correct_answer ?? '—')}</span></div>
                </div>
                {q.explanation && (
                  <p className="text-xs text-gray-600 mt-2 italic">{q.explanation}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-emerald-700">No mistakes — perfect score!</p>
        )}
      </Modal>

      <Modal open={activeModal === 'priorityFix'} onClose={closeModal} title={`Master ${priority?.name || 'Strategy'}`}>
        {priority && (
          <div>
            <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-200 mb-5">
              <p className="text-sm text-rose-900">
                <strong>Your weak spot:</strong> {priority.wrong} of {priority.total} questions wrong on {priority.name}.
              </p>
            </div>
            <h4 className="font-bold text-gray-900 mb-3">Strategy tips</h4>
            <ul className="text-sm text-gray-700 list-disc pl-5 space-y-2 mb-6">
              {priority.key === 'tfng' && (
                <>
                  <li><strong>TRUE</strong>: passage confirms the statement (often paraphrased)</li>
                  <li><strong>FALSE</strong>: passage contradicts the statement directly</li>
                  <li><strong>NOT GIVEN</strong>: passage doesn't address the claim — don't infer</li>
                </>
              )}
              {priority.key === 'fill' && (
                <>
                  <li>Fill-ins almost always require the <strong>exact word</strong> from the passage</li>
                  <li>Never paraphrase — synonyms count as wrong</li>
                  <li>Watch the word limit (usually NO MORE THAN TWO/THREE WORDS)</li>
                </>
              )}
              {priority.key === 'mc' && (
                <>
                  <li>Eliminate clearly wrong distractors first</li>
                  <li>Watch for absolute words (always, never, only) in distractors</li>
                  <li>The correct answer paraphrases the passage — wrong ones often quote it directly</li>
                </>
              )}
              {priority.key === 'match' && (
                <>
                  <li>Scan for keywords first, then verify by reading around the keyword</li>
                  <li>Some options can be used twice — others not at all</li>
                </>
              )}
              {priority.key === 'heading' && (
                <>
                  <li>Headings summarize the <strong>main idea</strong>, not a single detail</li>
                  <li>Skim the first and last sentence of each paragraph</li>
                </>
              )}
            </ul>
            {onPracticePriority && (
              <div className="p-5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Ready to practice?</h4>
                  <p className="text-sm text-gray-600">Targeted drill on this skill type.</p>
                </div>
                <button onClick={() => { closeModal(); onPracticePriority(priority); }} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
                  <Play className="w-4 h-4" /> Practice Now
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
