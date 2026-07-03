import React from 'react';
import {
  AlertTriangle, Clock, Award, Target, Zap, Repeat,
  HelpCircle, ArrowRight, Download, Share2,
} from 'lucide-react';
import { LIZ_AVATAR_URL } from '../../../../lib/brand';
import { SKILL_LABELS } from '../lib';

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

function InsightTile({ icon: Icon, title, subtitle, gradient, onClick, statusTone = 'neutral' }) {
  // Status dot signals at-a-glance how urgent this tile is.
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

export {
  BandDial,
  LizShimmerAvatar,
  PassageStatCard,
  TargetCard,
  InsightTile,
  TimeManagementCard,
  PriorityFixCard,
  QuickActionsCard,
};
