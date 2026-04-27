import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle2, AlertCircle } from 'lucide-react';

/**
 * LegacySpeakingDetailDrawer
 *
 * Collapsible drawer that surfaces the older Cambridge-style per-criterion
 * grid + strengths/weaknesses/feedback under the new D7 ResultsState. Used
 * by FullTestResults and CambridgeTestResults so the rich legacy feedback
 * is preserved without cluttering the polished D7 surface.
 *
 * Accepts either:
 *   - `evaluation`: a single { band, criteria, strengths, weaknesses, feedback }
 *   - `responses`:  an array of { id, label, ...evaluation } for per-prompt detail
 *
 * Renders nothing if neither has any usable content.
 */
export default function LegacySpeakingDetailDrawer({
  evaluation = null,
  responses = null,
  defaultOpen = false,
}) {
  const [open, setOpen] = useState(defaultOpen);

  const hasEvaluation =
    evaluation &&
    (evaluation.feedback ||
      (evaluation.strengths && evaluation.strengths.length > 0) ||
      (evaluation.weaknesses && evaluation.weaknesses.length > 0) ||
      evaluation.criteria);
  const hasResponses = Array.isArray(responses) && responses.length > 0;

  if (!hasEvaluation && !hasResponses) return null;

  return (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50"
      >
        <div>
          <div className="text-[14px] font-semibold text-slate-900">
            Examiner detail
          </div>
          <div className="text-[12px] text-slate-500 mt-0.5">
            Per-criterion breakdown, strengths and improvement notes
          </div>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-slate-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-500" />
        )}
      </button>

      {open && (
        <div className="px-5 pb-5 pt-1 space-y-5 border-t border-slate-100">
          {hasEvaluation && (
            <EvaluationBlock evaluation={evaluation} />
          )}
          {hasResponses && (
            <div className="space-y-4">
              {responses.map((r, idx) => (
                <div
                  key={r.id ?? idx}
                  className="rounded-xl border border-slate-100 bg-slate-50/40 p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-[13px] font-semibold text-slate-800">
                      {r.label || `Response ${idx + 1}`}
                    </div>
                    {typeof r.overall_band === 'number' && (
                      <span className="text-[12px] font-medium text-slate-700 bg-white border border-slate-200 rounded-full px-2.5 py-0.5">
                        Band {r.overall_band}
                      </span>
                    )}
                  </div>
                  <EvaluationBlock evaluation={r} compact />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EvaluationBlock({ evaluation, compact = false }) {
  const c = evaluation?.criteria || {};
  return (
    <div>
      {(c.fluency_coherence ||
        c.lexical_resource ||
        c.grammatical_range ||
        c.pronunciation) && (
        <div
          className={`grid grid-cols-2 ${
            compact ? '' : 'sm:grid-cols-4'
          } gap-2 mb-4`}
        >
          <CriterionPill label="Fluency" value={c.fluency_coherence} />
          <CriterionPill label="Vocab" value={c.lexical_resource} />
          <CriterionPill label="Grammar" value={c.grammatical_range} />
          <CriterionPill label="Pronunciation" value={c.pronunciation} />
        </div>
      )}

      {evaluation?.strengths?.length > 0 && (
        <div className="mb-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 mb-1.5 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Strengths
          </div>
          <ul className="text-[13px] text-slate-700 space-y-1 pl-4 list-disc">
            {evaluation.strengths.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}

      {evaluation?.weaknesses?.length > 0 && (
        <div className="mb-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-700 mb-1.5 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> To improve
          </div>
          <ul className="text-[13px] text-slate-700 space-y-1 pl-4 list-disc">
            {evaluation.weaknesses.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {evaluation?.feedback && (
        <div className="rounded-xl bg-slate-50 border border-slate-100 px-3.5 py-3 text-[13px] text-slate-700 leading-relaxed">
          {evaluation.feedback}
        </div>
      )}
    </div>
  );
}

function CriterionPill({ label, value }) {
  if (value == null) return <div />;
  return (
    <div className="rounded-lg border border-slate-100 bg-white px-2.5 py-2 text-center">
      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
        {label}
      </div>
      <div className="text-[15px] font-semibold text-slate-900 mt-0.5">
        {value}
      </div>
    </div>
  );
}
