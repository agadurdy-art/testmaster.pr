import React, { useMemo } from 'react';
import {
  AlertTriangle, X, Check, ThumbsUp, BarChart3,
} from 'lucide-react';
import { LIZ_AVATAR_URL } from '../../../../lib/brand';
import { SKILL_LABELS } from '../lib';

// =============================================================================
// LIZ DETAILED ANALYSIS — rich modal body (sample-mockup parity)
// Skill breakdown bars + Strengths + Areas to Improve + Recommendation card.
// =============================================================================

const SKILL_BAR_TONES = {
  tfng:    { wrap: 'bg-red-50',     text: 'text-red-800',     pct: 'text-red-600',     track: 'bg-red-100',     fill: 'bg-red-500' },
  mc:      { wrap: 'bg-emerald-50', text: 'text-emerald-800', pct: 'text-emerald-600', track: 'bg-emerald-100', fill: 'bg-emerald-500' },
  fill:    { wrap: 'bg-amber-50',   text: 'text-amber-800',   pct: 'text-amber-600',   track: 'bg-amber-100',   fill: 'bg-amber-500' },
  match:   { wrap: 'bg-blue-50',    text: 'text-blue-800',    pct: 'text-blue-600',    track: 'bg-blue-100',    fill: 'bg-blue-500' },
  heading: { wrap: 'bg-violet-50',  text: 'text-violet-800',  pct: 'text-violet-600',  track: 'bg-violet-100',  fill: 'bg-violet-500' },
  other:   { wrap: 'bg-gray-50',    text: 'text-gray-800',    pct: 'text-gray-600',    track: 'bg-gray-200',    fill: 'bg-gray-500' },
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
      out.push(`Solid time management — finished ${allowedMin - durationMin} minutes early without rushing.`);
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
    if (durationMin != null && allowedMin && durationMin >= allowedMin) {
      out.push('Pacing pressure — you used the full time window. Drill scanning to free up minutes.');
    }
    return out;
  }, [skillRows, durationMin, allowedMin]);

  // Prefer the long-form `teacher_feedback.detailed` so the rich Liz analysis
  // surfaces at the TOP (instead of a thin gray box at the bottom). Fall back
  // through the short message and a generic greeting only when the backend
  // didn't supply anything richer.
  const intro = teacherDetailed || teacherShort
    || "Hi! I've analyzed your reading performance in detail. You have a solid foundation with clear opportunities for strategic improvement. Here's my complete assessment:";

  return (
    <div className="space-y-6">
      {/* Header */}
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
          <p className="text-sm text-gray-500">Complete Performance Analysis</p>
        </div>
      </div>

      {/* Liz primary message — colored, at the top */}
      <div className="bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 border border-purple-200 rounded-xl p-6 shadow-sm">
        <p className="text-purple-900 text-sm leading-relaxed whitespace-pre-line">{intro}</p>
        {teacherShort && teacherDetailed && teacherShort !== teacherDetailed && (
          <p className="text-purple-700 text-xs italic mt-3 pt-3 border-t border-purple-200">
            "{teacherShort}"
          </p>
        )}
      </div>

      {/* Skill Breakdown */}
      {skillRows.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            Skill Breakdown
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

      {/* Strengths */}
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

      {/* Areas to Improve */}
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

      {/* Recommendation */}
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

export { LizDetailedAnalysis };
