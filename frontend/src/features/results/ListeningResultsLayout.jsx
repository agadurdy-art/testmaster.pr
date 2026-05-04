import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft, Search, AlertTriangle, TrendingUp, GraduationCap, Map as MapIcon, Eye,
  Clock, Award, Headphones, Target, Zap, Repeat, X, Play,
  HelpCircle, ArrowRight, ListChecks, Shuffle, Edit3, CheckSquare,
  Download, Share2, List as ListIcon, Info,
  Check, ChevronDown, Lightbulb, MapPin, Inbox,
  ThumbsUp, BarChart3, FileText,
} from 'lucide-react';
import { LIZ_AVATAR_URL } from '../../lib/brand';

// =============================================================================
// HELPERS — listening: part stats, skill counts, fallback insights
// =============================================================================

const SKILL_LABELS = {
  note:    { name: 'Note / Form Completion', icon: Edit3 },
  mc:      { name: 'Multiple Choice',         icon: ListChecks },
  match:   { name: 'Matching',                icon: Shuffle },
  multi:   { name: 'Multi-Select',            icon: CheckSquare },
  short:   { name: 'Short Answer',            icon: Edit3 },
  other:   { name: 'Other',                   icon: Headphones },
};

function categorizeSkill(question_type) {
  const t = String(question_type || '').toLowerCase();
  if (t.includes('multi_select') || t.includes('multi-select') || t.includes('multiselect') || t.includes('select_two') || t.includes('select_three')) return 'multi';
  if (t.includes('multiple') || t === 'mc' || t === 'mcq') return 'mc';
  if (t.includes('match')) return 'match';
  if (t.includes('short_answer') || t.includes('short-answer')) return 'short';
  if (t.includes('note') || t.includes('form') || t.includes('table') || t.includes('flow') || t.includes('summary') || t.includes('completion') || t.includes('fill') || t.includes('blank')) return 'note';
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

// IELTS listening: 4 parts, 10 questions each (Q1-10, Q11-20, Q21-30, Q31-40)
function resolvePartNumber(q, total) {
  if (q.part != null && !Number.isNaN(Number(q.part))) return Number(q.part);
  if (q.part_number != null) return Number(q.part_number);
  const qid = Number(q.question_id ?? q.question_number ?? 0);
  if (!qid) return 1;
  const t = Number(total) || 40;
  const quarter = Math.ceil(t / 4);
  if (qid <= quarter)     return 1;
  if (qid <= 2 * quarter) return 2;
  if (qid <= 3 * quarter) return 3;
  return 4;
}

function computePartStats(question_results) {
  const total = question_results.length;
  const groups = new Map();
  question_results.forEach((q) => {
    const k = resolvePartNumber(q, total);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(q);
  });
  const sortedKeys = [...groups.keys()].sort(
    (a, b) => (Number(a) || 99) - (Number(b) || 99)
  );
  return sortedKeys.map((k, idx) => {
    const items = groups.get(k);
    const correct = items.filter((q) => q.is_correct).length;
    const tot = items.length;
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
      total: tot,
      percent: tot ? Math.round((correct / tot) * 100) : 0,
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

function fastestGainEstimate(question_results, skillCounts, currentBand) {
  const priority = priorityFromCounts(skillCounts);
  if (!priority) return null;
  const wrong = priority.wrong;
  const recoverable = Math.max(1, Math.round(wrong * 0.7));
  const newCorrect = (question_results.filter((q) => q.is_correct).length) + recoverable;
  const lift = Math.min(2, Math.max(0.5, recoverable * 0.1));
  const projected = Math.min(9, Math.max(4, Number(currentBand || 6) + lift));
  return {
    skillName: priority.name,
    recoverable,
    projectedBand: Math.round(projected * 2) / 2,
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
          stroke="url(#bandGradL)"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${dash} ${c}`}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="bandGradL" x1="0" y1="0" x2="1" y2="1">
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
        .questions-window-l::-webkit-scrollbar { width: 8px; }
        .questions-window-l::-webkit-scrollbar-track { background: transparent; }
        .questions-window-l::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.3);
          border-radius: 4px;
        }
      `}</style>
      <img src={LIZ_AVATAR_URL} alt="Liz" />
    </div>
  );
}

// Per-part color tones — listening sample mockup uses emerald/amber/orange/red
// for parts 1-4 to signal increasing difficulty.
const PART_COLOR_KEYS = ['emerald', 'amber', 'orange', 'rose'];

const PART_TONES = {
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', num: 'text-emerald-700', text: 'text-emerald-900', chipBg: 'bg-emerald-100', chipText: 'text-emerald-800', chip: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  amber:   { bg: 'bg-amber-50',   border: 'border-amber-200',   num: 'text-amber-700',   text: 'text-amber-900',   chipBg: 'bg-amber-100',   chipText: 'text-amber-800',   chip: 'bg-amber-100 text-amber-700 border-amber-200' },
  orange:  { bg: 'bg-orange-50',  border: 'border-orange-200',  num: 'text-orange-700',  text: 'text-orange-900',  chipBg: 'bg-orange-100',  chipText: 'text-orange-800',  chip: 'bg-orange-100 text-orange-700 border-orange-200' },
  rose:    { bg: 'bg-rose-50',    border: 'border-rose-200',    num: 'text-rose-700',    text: 'text-rose-900',    chipBg: 'bg-rose-100',    chipText: 'text-rose-800',    chip: 'bg-rose-100 text-rose-700 border-rose-200' },
};

const PART_TOPICS = {
  1: 'Conversation · everyday context',
  2: 'Monologue · social context',
  3: 'Discussion · academic/training',
  4: 'Lecture · academic',
};

function PartStatCard({ stats }) {
  const colorKey = PART_COLOR_KEYS[(stats.n - 1) % 4];
  const TONE = PART_TONES[colorKey];
  const skillEntries = Object.entries(stats.skills).slice(0, 3);
  return (
    <div className={`rounded-2xl ${TONE.bg} border-l-4 ${TONE.border} p-5 flex flex-col justify-between min-h-[140px]`}>
      <div className="flex items-start justify-between">
        <div>
          <div className={`text-sm font-semibold ${TONE.text}`}>Part {stats.n}</div>
          <div className="text-xs text-gray-500 mt-0.5">{PART_TOPICS[stats.n] || ''}</div>
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

function InsightTile({ icon: Icon, title, subtitle, gradient, onClick, statusTone = 'neutral' }) {
  const dotClass = {
    urgent: 'bg-white shadow-[0_0_0_3px_rgba(255,255,255,0.25)]',
    warn: 'bg-white/80',
    ok: 'bg-emerald-200',
    neutral: 'bg-white/50',
  }[statusTone] || 'bg-white/50';
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-2xl p-5 text-white transition-transform hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 ${gradient}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
          <Icon className="w-5 h-5" />
        </div>
        <span className={`w-2 h-2 rounded-full ${dotClass}`} />
      </div>
      <div className="font-bold text-base">{title}</div>
      <div className="text-xs opacity-90 mt-0.5">{subtitle}</div>
    </button>
  );
}

function TimeManagementCard({ durationMin, allowedMin = 30, perSection }) {
  const pct = allowedMin ? Math.round((durationMin / allowedMin) * 100) : 0;
  return (
    <div className="rounded-2xl bg-white border border-gray-200 p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
          <Clock className="w-4 h-4 text-blue-600" />
        </div>
        <h4 className="font-bold text-gray-900">Audio Pacing</h4>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Listening time</span>
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
        <p className="text-sm text-emerald-800">Strong listening across every question type. Push for higher band by trying a harder test.</p>
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

function QuickActionsCard({ onRetry, onPracticePriority, priorityName, onDownload, onShare }) {
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
        <button
          onClick={onDownload}
          className="w-full bg-gray-100 text-gray-700 py-2.5 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <Download className="w-4 h-4" /> Download Report
        </button>
        <button
          onClick={onShare}
          className="w-full bg-gray-100 text-gray-700 py-2.5 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <Share2 className="w-4 h-4" /> Share Results
        </button>
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
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${maxWidth} max-h-[90vh] flex flex-col`} onClick={(e) => e.stopPropagation()}>
        {title ? (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onClose}
            className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 z-10"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        )}
        <div className="px-6 py-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

// =============================================================================
// LIZ DETAILED ANALYSIS — modal body
// =============================================================================

const SKILL_BAR_TONES = {
  note:  { wrap: 'bg-emerald-50', text: 'text-emerald-800', pct: 'text-emerald-600', track: 'bg-emerald-100', fill: 'bg-emerald-500' },
  mc:    { wrap: 'bg-blue-50',    text: 'text-blue-800',    pct: 'text-blue-600',    track: 'bg-blue-100',    fill: 'bg-blue-500' },
  match: { wrap: 'bg-amber-50',   text: 'text-amber-800',   pct: 'text-amber-600',   track: 'bg-amber-100',   fill: 'bg-amber-500' },
  multi: { wrap: 'bg-violet-50',  text: 'text-violet-800',  pct: 'text-violet-600',  track: 'bg-violet-100',  fill: 'bg-violet-500' },
  short: { wrap: 'bg-rose-50',    text: 'text-rose-800',    pct: 'text-rose-600',    track: 'bg-rose-100',    fill: 'bg-rose-500' },
  other: { wrap: 'bg-gray-50',    text: 'text-gray-800',    pct: 'text-gray-600',    track: 'bg-gray-200',    fill: 'bg-gray-500' },
};

function LizDetailedAnalysis({ teacherShort, teacherDetailed, skillCounts, priority, targetBand, durationMin, allowedMin }) {
  const skillRows = useMemo(() => (
    Object.entries(skillCounts || {})
      .filter(([, c]) => (c.total || 0) > 0)
      .sort((a, b) => (b[1].total || 0) - (a[1].total || 0))
      .map(([k, c]) => {
        const total = c.total || 0;
        const correct = total - (c.wrong || 0);
        const pct = total ? Math.round((correct / total) * 100) : 0;
        return { key: k, name: SKILL_LABELS[k]?.name || k, pct, correct, total };
      })
  ), [skillCounts]);

  const strengths = useMemo(() => {
    const out = [];
    skillRows
      .filter((s) => s.pct >= 75 && s.total >= 2)
      .slice(0, 2)
      .forEach((s) => out.push(`Strong ${s.name} performance — ${s.correct}/${s.total} correct (${s.pct}%).`));
    if (durationMin != null && allowedMin && durationMin <= allowedMin - 5) {
      out.push(`Solid pacing — finished ${allowedMin - durationMin} minutes early.`);
    }
    if (out.length === 0 && skillRows.length) {
      const top = [...skillRows].sort((a, b) => b.pct - a.pct)[0];
      if (top) out.push(`Best area so far: ${top.name} (${top.pct}%). Build on this.`);
    }
    return out;
  }, [skillRows, durationMin, allowedMin]);

  const improvements = useMemo(() => {
    const out = [];
    skillRows
      .filter((s) => s.pct < 60 && s.total >= 2)
      .sort((a, b) => a.pct - b.pct)
      .slice(0, 3)
      .forEach((s) => {
        const wrong = s.total - s.correct;
        out.push(`${s.name} needs work — ${wrong}/${s.total} wrong (${s.pct}%).`);
      });
    return out;
  }, [skillRows]);

  const intro = teacherDetailed || teacherShort
    || "Hi! I've analyzed your listening performance in detail. You have a solid foundation with clear opportunities for strategic improvement. Here's my complete assessment:";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 rounded-full p-[2px] bg-[conic-gradient(from_180deg_at_50%_50%,#a78bfa,#22d3ee,#a78bfa)] animate-pulse">
          <img
            src={LIZ_AVATAR_URL}
            alt="Liz AI Tutor"
            className="w-full h-full rounded-full object-cover bg-white"
          />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Liz AI Tutor</h3>
          <p className="text-sm text-gray-500">Complete Listening Analysis</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 border border-purple-200 rounded-xl p-6 shadow-sm">
        <p className="text-purple-900 text-sm leading-relaxed whitespace-pre-line">{intro}</p>
        {teacherShort && teacherDetailed && teacherShort !== teacherDetailed && (
          <p className="text-purple-700 text-xs italic mt-3 pt-3 border-t border-purple-200">
            "{teacherShort}"
          </p>
        )}
      </div>

      {skillRows.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            Audio Skill Breakdown
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {skillRows.map((s) => {
              const tone = SKILL_BAR_TONES[s.key] || SKILL_BAR_TONES.other;
              return (
                <div key={s.key} className={`rounded-lg p-3 ${tone.wrap}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-medium ${tone.text}`}>{s.name}</span>
                    <span className={`text-sm font-bold ${tone.pct}`}>{s.pct}%</span>
                  </div>
                  <div className={`w-full rounded-full h-2 ${tone.track}`}>
                    <div className={`h-2 rounded-full ${tone.fill}`} style={{ width: `${s.pct}%` }} />
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1">{s.correct}/{s.total} correct</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {strengths.length > 0 && (
        <div className="bg-emerald-50 rounded-xl p-6">
          <h4 className="font-semibold text-emerald-900 mb-3 flex items-center gap-2">
            <ThumbsUp className="w-5 h-5" />
            Your Strengths
          </h4>
          <ul className="space-y-2 text-emerald-800">
            {strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 text-emerald-600 flex-shrink-0" />
                <span className="text-sm">{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {improvements.length > 0 && (
        <div className="bg-red-50 rounded-xl p-6">
          <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Areas to Improve
          </h4>
          <ul className="space-y-2 text-red-800">
            {improvements.map((s, i) => (
              <li key={i} className="flex items-start gap-2">
                <X className="w-4 h-4 mt-0.5 text-red-600 flex-shrink-0" />
                <span className="text-sm">{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {priority && (
        <div className="bg-blue-50 rounded-xl p-6 text-center">
          <h4 className="font-semibold text-blue-900 mb-3">My Recommendation</h4>
          <p className="text-sm text-blue-800 mb-4">
            Focus on <strong>{priority.name}</strong> mastery first — that alone can lift your score and push you toward <strong>Band {Number(targetBand).toFixed(1)}</strong> within 3–4 weeks.
          </p>
          <div className="text-2xl font-bold text-blue-600">Band {Number(targetBand).toFixed(1)}</div>
          <div className="text-xs text-blue-600">Achievable with focused practice</div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// QUESTION ROW + LIST
// =============================================================================

function buildEvidenceSnippet(transcriptText, evidence) {
  if (!transcriptText || !evidence) return null;
  const idx = transcriptText.indexOf(evidence);
  if (idx === -1) return { before: '', match: evidence, after: '', truncated: false };
  const beforeStart = Math.max(0, idx - 120);
  const afterEnd = Math.min(transcriptText.length, idx + evidence.length + 120);
  return {
    before: (beforeStart > 0 ? '… ' : '') + transcriptText.slice(beforeStart, idx),
    match: evidence,
    after: transcriptText.slice(idx + evidence.length, afterEnd) + (afterEnd < transcriptText.length ? ' …' : ''),
    truncated: true,
  };
}

function QuestionRow({ q, partNum, idx, expanded, onToggle, transcript }) {
  const isCorrect = !!q.is_correct;
  const skillKey = categorizeSkill(q.question_type);
  const skillName = SKILL_LABELS[skillKey]?.name || (q.question_type || 'Question').replace(/_/g, ' ');
  const userAns = q.user_answer ?? '—';
  const correctAns = q.correct_answer ?? '—';
  const evidenceText = q.evidence_text || q.transcript_excerpt || '';
  const strategy = q.skill_tip || q.explanation || '';
  const options = q.options;
  const colorKey = PART_COLOR_KEYS[(partNum - 1) % 4];
  const tone = PART_TONES[colorKey];
  const snippet = expanded ? buildEvidenceSnippet(transcript || '', evidenceText) : null;
  const qNumber = q.question_number ?? q.question_id ?? idx + 1;

  return (
    <div className={`border-2 rounded-2xl bg-white transition-all ${expanded ? 'border-emerald-500 shadow-sm' : 'border-gray-200'}`}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left p-4 flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${isCorrect ? 'bg-emerald-500' : 'bg-red-500'}`}>
            {qNumber}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="font-semibold text-gray-900">{skillName}</div>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${tone.chip}`}>Part {partNum}</span>
            </div>
            {q.question_text ? (
              <div className="text-sm text-gray-600 truncate">{q.question_text}</div>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            {isCorrect ? (
              <div className="text-sm font-medium text-emerald-600 flex items-center gap-1 justify-end"><Check className="w-4 h-4" />Correct</div>
            ) : (
              <div className="text-sm font-medium text-red-600 flex items-center gap-1 justify-end"><X className="w-4 h-4" />Wrong</div>
            )}
            <div className="text-xs text-gray-500">
              {isCorrect ? `Your: ${String(userAns)}` : `Your: ${String(userAns)} | Correct: ${String(correctAns)}`}
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </button>
      {expanded && (
        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Model Answer</h4>
              <div className="space-y-3">
                {options ? (
                  <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-700 leading-relaxed">
                    <strong>Options:</strong> {String(options)}
                  </div>
                ) : null}
                <div className={`p-3 rounded-lg ${isCorrect ? 'bg-emerald-50 border-l-4 border-emerald-500' : 'bg-red-50 border-l-4 border-red-500'}`}>
                  <div className={`text-sm font-medium flex items-center gap-2 ${isCorrect ? 'text-emerald-800' : 'text-red-800'}`}>
                    {isCorrect ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    Your Answer: {String(userAns)}
                  </div>
                </div>
                {!isCorrect && (
                  <div className="p-3 bg-emerald-50 rounded-lg border-l-4 border-emerald-500">
                    <div className="text-sm font-medium text-emerald-800 flex items-center gap-2">
                      <Check className="w-4 h-4" />Correct Answer: {String(correctAns)}
                    </div>
                  </div>
                )}
              </div>
              {strategy ? (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <h5 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-1"><Lightbulb className="w-4 h-4" /> Strategy</h5>
                  <p className="text-xs text-blue-700 leading-relaxed">{strategy}</p>
                </div>
              ) : null}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">
                Locate in Audioscript — Part {partNum}
              </h4>
              <div className="p-4 bg-gray-50 rounded-lg text-sm leading-relaxed">
                {snippet ? (
                  <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                    {snippet.before}
                    <span className="bg-emerald-100 px-1.5 py-0.5 rounded font-medium">{snippet.match}</span>
                    {snippet.after}
                  </p>
                ) : evidenceText ? (
                  <p className="text-gray-800 leading-relaxed">{evidenceText}</p>
                ) : (
                  <p className="text-gray-500 italic">Audioscript excerpt not available for this question.</p>
                )}
              </div>
              {evidenceText ? (
                <div className="mt-2 p-2 bg-emerald-100 rounded-lg">
                  <span className="text-xs text-emerald-800 font-medium flex items-center gap-1"><MapPin className="w-3 h-3" /> Where the answer was said</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function QuestionList({ items, transcripts, totalCount, autoOpenFirst = true }) {
  const annotated = useMemo(
    () => items.map((q, i) => ({
      q,
      idx: i,
      partNum: resolvePartNumber(q, totalCount),
    })),
    [items, totalCount]
  );
  const [openId, setOpenId] = useState(() => (autoOpenFirst && annotated[0] ? annotated[0].q.question_id ?? 0 : null));
  useEffect(() => {
    if (!annotated.length) { setOpenId(null); return; }
    const stillThere = annotated.some(({ q }) => (q.question_id ?? null) === openId);
    if (!stillThere) setOpenId(autoOpenFirst ? annotated[0].q.question_id ?? null : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [annotated.length]);

  if (!annotated.length) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Inbox className="w-10 h-10 mx-auto mb-3 text-gray-300" />
        <p>No questions match this filter.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/40">
      <div
        className="space-y-3 p-3 overflow-y-auto questions-window-l"
        style={{ maxHeight: 560 }}
      >
        {annotated.map(({ q, idx, partNum }) => {
          const id = q.question_id ?? idx;
          const expanded = id === openId;
          const tx = transcripts ? (transcripts[partNum] || transcripts[`part${partNum}`] || transcripts.full) : '';
          return (
            <QuestionRow
              key={id}
              q={q}
              idx={idx}
              partNum={partNum}
              expanded={expanded}
              onToggle={() => setOpenId(expanded ? null : id)}
              transcript={tx || ''}
            />
          );
        })}
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

// Normalize transcript prop into a {1,2,3,4} part-keyed map.
// Accepts: string (full transcript) | {1,2,3,4} | {part1,part2...} | array of strings | array of {part, text}
function normalizeTranscript(raw) {
  if (!raw) return null;
  if (typeof raw === 'string') return { full: raw };
  if (Array.isArray(raw)) {
    const map = {};
    raw.forEach((entry, i) => {
      if (typeof entry === 'string') {
        map[i + 1] = entry;
      } else if (entry && typeof entry === 'object') {
        const p = Number(entry.part ?? entry.part_number ?? i + 1);
        map[p] = entry.text ?? entry.transcript ?? '';
      }
    });
    return map;
  }
  if (typeof raw === 'object') {
    const map = {};
    Object.entries(raw).forEach(([k, v]) => {
      if (typeof v !== 'string') return;
      const m = String(k).match(/(\d+)/);
      if (m) map[Number(m[1])] = v;
      else map[k] = v;
    });
    return map;
  }
  return null;
}

export default function ListeningResultsLayout({
  feedback,
  band,
  user,
  testMeta = {},
  insights = {},
  onBack,
  backHref = '/',
  onRetry,
  onPracticePriority,
  standalone = false,
}) {
  const [activeModal, setActiveModal] = useState(null);
  const [questionFilter, setQuestionFilter] = useState('all');
  const closeModal = () => setActiveModal(null);

  const questionResults = Array.isArray(feedback?.question_results) ? feedback.question_results : [];
  const correct = feedback?.correct ?? questionResults.filter((q) => q.is_correct).length;
  const total = feedback?.total ?? questionResults.length;
  const pct = total ? Math.round((correct / total) * 100) : 0;
  const transcripts = useMemo(() => normalizeTranscript(feedback?.transcript ?? feedback?.transcripts), [feedback?.transcript, feedback?.transcripts]);

  const filteredResults = useMemo(() => {
    if (!questionFilter || questionFilter === 'all') return questionResults;
    return questionResults.filter((q) => {
      if (questionFilter === 'correct') return q.is_correct;
      if (questionFilter === 'incorrect') return !q.is_correct;
      if (questionFilter.startsWith('p')) {
        const n = Number(questionFilter.slice(1));
        const pNum = resolvePartNumber(q, questionResults.length);
        return pNum === n;
      }
      return categorizeSkill(q.question_type) === questionFilter;
    });
  }, [questionResults, questionFilter]);

  const handleDownload = () => {
    if (typeof window !== 'undefined' && typeof window.print === 'function') {
      window.print();
    }
  };
  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (typeof navigator !== 'undefined' && navigator.share) {
      try { await navigator.share({ title: 'IELTS Listening Result', url }); return; } catch (_) {}
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try { await navigator.clipboard.writeText(url); } catch (_) {}
    }
  };

  const partStats = useMemo(() => computePartStats(questionResults), [questionResults]);
  const skillCounts = useMemo(() => computeSkillCounts(questionResults), [questionResults]);
  const priority = useMemo(() => priorityFromCounts(skillCounts), [skillCounts]);
  const fastestGain = useMemo(() => {
    const raw = insights.fastestGain;
    if (Array.isArray(raw) && raw.length > 0) {
      const top = raw[0];
      const wrong = Number(top?.wrong_count ?? top?.potential_gain ?? 0) || 0;
      const recoverable = Math.max(1, Math.round(wrong * 0.7));
      const correctNow = questionResults.filter((q) => q.is_correct).length;
      const lift = Math.min(2, Math.max(0.5, recoverable * 0.1));
      const projected = Math.min(9, Math.max(4, (Number(band) || 6) + lift));
      return {
        skillName: top?.label || top?.skill_id || 'this skill',
        recoverable,
        projectedBand: Math.round(projected * 2) / 2,
        newCorrect: correctNow + recoverable,
        totalQuestions: questionResults.length,
      };
    }
    if (raw && typeof raw === 'object' && raw.projectedBand != null) {
      return raw;
    }
    return fastestGainEstimate(questionResults, skillCounts, band);
  }, [insights.fastestGain, questionResults, skillCounts, band]);

  const displayName = user?.firstName || user?.first_name || user?.name || 'Student';
  const tier = bandTier(band);

  const wrongQuestions = useMemo(() => questionResults.filter((q) => !q.is_correct), [questionResults]);

  const reasonSummary = insights.reasonSummary || null;
  const recommendedLessons = insights.recommendedLessons || null;
  const rootCauseAnalysis = insights.rootCauseAnalysis || null;
  const teacherShort = feedback?.teacher_feedback?.short || insights.teacherShort || null;
  const teacherDetailed = feedback?.teacher_feedback?.detailed || insights.teacherDetailed || null;

  const headerRow = (onBack || backHref || testMeta.title) ? (
    <div className="flex items-center justify-between flex-wrap gap-3">
      {(onBack || backHref) && (
        onBack ? (
          <button onClick={onBack} className="flex items-center gap-3 text-gray-600 hover:text-emerald-600 transition-colors group">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
              <ArrowLeft className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="font-medium">Back</span>
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
          <h1 className="text-xl font-bold text-gray-900">Listening Analysis</h1>
          <p className="text-sm text-gray-500">{testMeta.title}{testMeta.subtitle ? ` • ${testMeta.subtitle}` : ''}</p>
        </div>
      )}
    </div>
  ) : null;

  const Wrapper = ({ children }) => standalone ? (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-violet-50/20">
      {headerRow ? (
        <header className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 py-4">{headerRow}</div>
        </header>
      ) : null}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  ) : (
    <div className="space-y-6">
      {headerRow}
      {children}
    </div>
  );

  const hasTranscripts = transcripts && Object.values(transcripts).some((v) => v);

  return (
    <Wrapper>

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
              <button
                type="button"
                onClick={() => setActiveModal('bandBreakdown')}
                className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-900 mt-0.5"
              >
                <Info className="w-3.5 h-3.5" />
                Band breakdown
              </button>
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
                    className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold shadow-sm hover:from-violet-700 hover:to-purple-700 transition-all"
                  >
                    View full analysis <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Part cards row — emerald/amber/orange/rose for Parts 1-4 */}
      {partStats.length > 0 && (
        <div className={`grid gap-4 ${partStats.length >= 4 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
          {partStats.map((s) => (
            <PartStatCard key={s.n} stats={s} />
          ))}
          {partStats.length < 4 && <TargetCard targetBand={testMeta.targetBand || 7.0} />}
        </div>
      )}

      {/* Performance Insights — 6 tiles + Time Management sidebar */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-600" /> Performance Insights
          </h3>
          <span className="text-xs text-gray-500">Click any card for detailed analysis</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <InsightTile
                icon={Search}
                title="Root Cause Analysis"
                subtitle={rootCauseAnalysis?.length ? `${rootCauseAnalysis.length} patterns flagged` : 'Find your blind spots'}
                gradient={TILE_GRADIENTS.rootCause}
                statusTone={rootCauseAnalysis?.length >= 3 ? 'urgent' : rootCauseAnalysis?.length ? 'warn' : 'neutral'}
                onClick={() => setActiveModal('rootCause')}
              />
              <InsightTile
                icon={AlertTriangle}
                title="Why You Lost Marks"
                subtitle={`${wrongQuestions.length} mistakes — tap to retry`}
                gradient={TILE_GRADIENTS.whyLost}
                statusTone={wrongQuestions.length >= 10 ? 'urgent' : wrongQuestions.length ? 'warn' : 'ok'}
                onClick={() => setActiveModal('whyLost')}
              />
              <InsightTile
                icon={TrendingUp}
                title="Fastest Score Gain"
                subtitle={fastestGain ? `${fastestGain.skillName} mastery → +${(fastestGain.projectedBand - (Number(band) || 0)).toFixed(1)} band` : 'Path to higher band'}
                gradient={TILE_GRADIENTS.fastestGain}
                statusTone={fastestGain ? 'warn' : 'ok'}
                onClick={() => setActiveModal('fastestGain')}
              />
              <InsightTile
                icon={GraduationCap}
                title="Recommended Lessons"
                subtitle={recommendedLessons?.length ? `${recommendedLessons.length} lessons for weak areas` : 'Tailored to your gaps'}
                gradient={TILE_GRADIENTS.lessons}
                statusTone={recommendedLessons?.length ? 'warn' : 'neutral'}
                onClick={() => setActiveModal('lessons')}
              />
              <InsightTile
                icon={MapIcon}
                title="Study Roadmap"
                subtitle="3-week improvement plan"
                gradient={TILE_GRADIENTS.roadmap}
                statusTone="neutral"
                onClick={() => setActiveModal('roadmap')}
              />
              <InsightTile
                icon={Eye}
                title="Model Answers"
                subtitle="Compare your responses"
                gradient={TILE_GRADIENTS.modelAnswers}
                statusTone={wrongQuestions.length ? 'warn' : 'ok'}
                onClick={() => setActiveModal('modelAnswers')}
              />
            </div>
          </div>
          <div className="lg:col-span-1">
            <TimeManagementCard
              durationMin={testMeta.durationMin || 0}
              allowedMin={testMeta.allowedMin || 30}
              perSection={testMeta.perSection}
            />
          </div>
        </div>
      </div>

      {/* Question Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-5">
          <PriorityFixCard priority={priority} onOpen={() => setActiveModal('priorityFix')} />
          <QuickActionsCard
            onRetry={onRetry}
            onPracticePriority={onPracticePriority ? () => onPracticePriority(priority) : null}
            priorityName={priority?.name}
            onDownload={handleDownload}
            onShare={handleShare}
          />
        </div>
        <div className="lg:col-span-3">
          <div className="rounded-2xl bg-white border border-gray-200 p-5 mb-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <ListIcon className="w-5 h-5 text-emerald-600" />
                Question Analysis
                <span className="text-sm font-normal text-gray-500">
                  ({filteredResults.length} of {total})
                </span>
              </h3>
              <div className="flex items-center gap-3">
                <select
                  value={questionFilter}
                  onChange={(e) => setQuestionFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                >
                  <option value="all">All Questions</option>
                  <option value="correct">Correct Only</option>
                  <option value="incorrect">Incorrect Only</option>
                  <option value="note">Note / Form Completion</option>
                  <option value="mc">Multiple Choice</option>
                  <option value="match">Matching</option>
                  <option value="multi">Multi-Select</option>
                  <option value="short">Short Answer</option>
                  {partStats.map((s) => (
                    <option key={s.n} value={`p${s.n}`}>Part {s.n}</option>
                  ))}
                </select>
                {hasTranscripts && (
                  <button
                    type="button"
                    onClick={() => setActiveModal('transcripts')}
                    className="bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Show Audioscript
                  </button>
                )}
              </div>
            </div>
          </div>
          <QuestionList
            items={filteredResults}
            transcripts={transcripts}
            totalCount={total}
            autoOpenFirst
          />
        </div>
      </div>

      {/* ====================== MODALS ====================== */}

      <Modal open={activeModal === 'teacher'} onClose={closeModal} title={null}>
        <LizDetailedAnalysis
          teacherShort={teacherShort}
          teacherDetailed={teacherDetailed}
          skillCounts={skillCounts}
          priority={priority}
          targetBand={Number(testMeta?.targetBand) || 7}
          durationMin={Number(testMeta?.durationMin) || null}
          allowedMin={Number(testMeta?.allowedMin) || 30}
        />
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
            const Icon = SKILL_LABELS[k]?.icon || Headphones;
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

      <Modal open={activeModal === 'roadmap'} onClose={closeModal} title="3-Week Listening Roadmap">
        <div className="space-y-4">
          <div className="p-4 rounded-xl border-2 border-violet-200 bg-violet-50">
            <h4 className="font-bold text-violet-900">Week 1 — Diagnose & drill</h4>
            <ul className="text-sm text-violet-800 mt-2 list-disc pl-5 space-y-1">
              <li>Master the {priority?.name || 'weakest'} strategy</li>
              <li>15 min/day — short Part-1 / Part-2 audio with note completion</li>
              <li>Replay any line you missed; transcribe verbatim</li>
            </ul>
          </div>
          <div className="p-4 rounded-xl border-2 border-violet-200 bg-violet-50">
            <h4 className="font-bold text-violet-900">Week 2 — Volume & speed</h4>
            <ul className="text-sm text-violet-800 mt-2 list-disc pl-5 space-y-1">
              <li>Daily Part 3 academic discussions — focus on speaker-attitude</li>
              <li>Listen at 1.0× then 1.25× for the same audio</li>
              <li>Build distractor / paraphrase recognition</li>
            </ul>
          </div>
          <div className="p-4 rounded-xl border-2 border-violet-200 bg-violet-50">
            <h4 className="font-bold text-violet-900">Week 3 — Full tests</h4>
            <ul className="text-sm text-violet-800 mt-2 list-disc pl-5 space-y-1">
              <li>2 full mock tests with no pause</li>
              <li>Target band: {((Number(band) || 0) + 0.5).toFixed(1)}+</li>
              <li>Review only wrong + low-confidence questions</li>
            </ul>
          </div>
        </div>
      </Modal>

      <Modal open={activeModal === 'modelAnswers'} onClose={closeModal} title={`Model Answers — Your ${wrongQuestions.length} Mistakes`}>
        {wrongQuestions.length ? (
          <div className="space-y-3">
            {wrongQuestions.map((q, i) => {
              const partNum = resolvePartNumber(q, total);
              return (
                <div key={i} className="p-4 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {q.question_number || q.question_id || i + 1}
                      </div>
                      <span className="text-xs font-semibold text-gray-700">{q.question_type}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">Part {partNum}</span>
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
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-emerald-700">No mistakes — perfect score!</p>
        )}
      </Modal>

      <Modal open={activeModal === 'bandBreakdown'} onClose={closeModal} title="Band Score Breakdown" maxWidth="max-w-md">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Your Score:</span>
            <span className="font-bold text-lg text-emerald-700">{Number(band || 0).toFixed(1)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Questions Correct:</span>
            <span className="font-medium">{correct}/{total} ({pct}%)</span>
          </div>
          {testMeta?.targetBand && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Target Band:</span>
              <span className="font-medium text-sky-700">{Number(testMeta.targetBand).toFixed(1)}</span>
            </div>
          )}
          <div className="border-t pt-3">
            <div className="text-xs text-gray-500 mb-2">Band {Number(band || 0).toFixed(1)} ({tier}):</div>
            <p className="text-sm text-gray-700">
              {(() => {
                const b = Number(band) || 0;
                if (b >= 8) return '"Very good command of English with only occasional unsystematic inaccuracies."';
                if (b >= 7) return '"Operational command of English. Generally accurate and detailed comprehension."';
                if (b >= 6) return '"Generally effective command of the language despite some inaccuracies, inappropriacies and misunderstandings."';
                if (b >= 5) return '"Modest command — partial comprehension with frequent inaccuracies."';
                return '"Limited command — basic comprehension only."';
              })()}
            </p>
          </div>
        </div>
      </Modal>

      <Modal open={activeModal === 'transcripts'} onClose={closeModal} title="Audioscript" maxWidth="max-w-4xl">
        {hasTranscripts ? (
          <div className="space-y-6">
            {[1, 2, 3, 4].map((p) => {
              const text = transcripts[p] || transcripts[`part${p}`];
              if (!text) return null;
              return (
                <div key={p} className="rounded-xl border border-gray-200 bg-white">
                  <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                    <h4 className="font-semibold text-gray-900">Part {p} — {PART_TOPICS[p]}</h4>
                  </div>
                  <div className="px-4 py-3 text-sm text-gray-700 whitespace-pre-line leading-relaxed max-h-[420px] overflow-y-auto">
                    {text}
                  </div>
                </div>
              );
            })}
            {transcripts.full && Object.keys(transcripts).length === 1 && (
              <div className="rounded-xl border border-gray-200 bg-white">
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                  <h4 className="font-semibold text-gray-900">Full Audioscript</h4>
                </div>
                <div className="px-4 py-3 text-sm text-gray-700 whitespace-pre-line leading-relaxed max-h-[520px] overflow-y-auto">
                  {transcripts.full}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-600">Audioscript isn't available for this attempt.</p>
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
              {priority.key === 'note' && (
                <>
                  <li>Read the question first — predict the <strong>part of speech</strong> for each blank</li>
                  <li>Watch the word limit (ONE / TWO / THREE WORDS — exactly as written in the audio)</li>
                  <li>Listen for signpost words ("first", "the main one") to track the speaker's order</li>
                </>
              )}
              {priority.key === 'mc' && (
                <>
                  <li>Eliminate clearly wrong distractors first as you listen</li>
                  <li>Watch for <strong>contrast markers</strong> ("but", "actually", "however") — answers often follow them</li>
                  <li>Wrong options often <em>quote</em> the audio directly; the correct one paraphrases</li>
                </>
              )}
              {priority.key === 'match' && (
                <>
                  <li>Read all options before audio starts so you can flag them by keyword</li>
                  <li>Some options can be used twice — check the rubric</li>
                  <li>Speakers often <em>change their mind</em> mid-answer; the final stance counts</li>
                </>
              )}
              {priority.key === 'multi' && (
                <>
                  <li>Multi-select means TWO (or THREE) answers — partial credit is rare</li>
                  <li>Listen for the speaker's <strong>preference / agreement</strong>, not the first thing they mention</li>
                  <li>Cross out distractors immediately as you hear them dismissed</li>
                </>
              )}
              {priority.key === 'short' && (
                <>
                  <li>Spell every word — listening tests mark spelling strictly</li>
                  <li>Numbers / dates: write digits, not words, unless the rubric says otherwise</li>
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
    </Wrapper>
  );
}
