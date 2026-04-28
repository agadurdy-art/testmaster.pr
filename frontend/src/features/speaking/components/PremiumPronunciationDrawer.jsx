import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertTriangle,
  Volume2,
  TrendingUp,
} from 'lucide-react';

/**
 * PremiumPronunciationDrawer
 *
 * Renders the Azure-Pronunciation-Assessment + Sonnet detail bundle that
 * the Premium QB submit endpoint returns. The base D7 ResultsState only
 * shows Sonnet's four-criteria scoring; this drawer surfaces the deluxe
 * pieces — Azure 5-score grid, phoneme-level issue lists, top problem
 * words and Liz's focused-practice plan — so a paying user actually sees
 * a different result, not just a Premium badge.
 *
 * Renders nothing if the payload doesn't include `azure_scores` (Free
 * tier or anonymous trial). Default open because the whole point is the
 * extra detail; user can collapse if they only care about the band.
 */
export default function PremiumPronunciationDrawer({
  pronunciationAnalysis = null,
  wordLevelResults = null,
  practiceFocus = null,
  tryThisNext = null,
  strengths = null,
  weaknesses = null,
  defaultOpen = true,
}) {
  const [open, setOpen] = useState(defaultOpen);

  const azure = pronunciationAnalysis?.azure_scores || null;
  // The endpoint sometimes hangs the analysis bands directly on the root
  // (main_issues etc.) and sometimes nests them — accept both.
  const mainIssues = pronunciationAnalysis?.main_issues || [];
  const swallowed = pronunciationAnalysis?.swallowed_sounds || [];
  const missingEndings = pronunciationAnalysis?.missing_endings || [];
  const stressIssues = pronunciationAnalysis?.stress_issues || [];

  const problemWords = Array.isArray(wordLevelResults)
    ? wordLevelResults
        .filter((w) => w && (w.accuracy_score < 80 || (w.error_type && w.error_type !== 'None')))
        .slice(0, 12)
    : [];

  const hasAnything =
    azure ||
    mainIssues.length ||
    swallowed.length ||
    missingEndings.length ||
    stressIssues.length ||
    problemWords.length ||
    (Array.isArray(practiceFocus) && practiceFocus.length) ||
    (Array.isArray(tryThisNext) && tryThisNext.length) ||
    (Array.isArray(strengths) && strengths.length) ||
    (Array.isArray(weaknesses) && weaknesses.length);

  if (!hasAnything) return null;

  return (
    <div className="mt-4 rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50/60 via-white to-indigo-50/40 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-purple-50/40"
      >
        <div className="flex items-center gap-3">
          <span className="inline-flex w-8 h-8 items-center justify-center rounded-full bg-purple-100 text-purple-700">
            <Sparkles className="w-4 h-4" />
          </span>
          <div>
            <div className="text-[14px] font-semibold text-slate-900">
              Premium pronunciation report
            </div>
            <div className="text-[12px] text-slate-500 mt-0.5">
              Azure phoneme-level analysis · Liz-curated practice plan
            </div>
          </div>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-slate-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-500" />
        )}
      </button>

      {open && (
        <div className="px-5 pb-6 pt-1 space-y-5 border-t border-purple-100">
          {azure && <AzureScoreGrid scores={azure} />}

          {(mainIssues.length > 0 ||
            swallowed.length > 0 ||
            missingEndings.length > 0 ||
            stressIssues.length > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {mainIssues.length > 0 && (
                <IssueCard
                  tone="amber"
                  icon={<AlertTriangle className="w-3.5 h-3.5" />}
                  label="Main issues"
                  items={mainIssues}
                />
              )}
              {swallowed.length > 0 && (
                <IssueCard
                  tone="rose"
                  icon={<Volume2 className="w-3.5 h-3.5" />}
                  label="Swallowed sounds"
                  items={swallowed}
                />
              )}
              {missingEndings.length > 0 && (
                <IssueCard
                  tone="rose"
                  icon={<Volume2 className="w-3.5 h-3.5" />}
                  label="Missing endings"
                  items={missingEndings}
                />
              )}
              {stressIssues.length > 0 && (
                <IssueCard
                  tone="amber"
                  icon={<TrendingUp className="w-3.5 h-3.5" />}
                  label="Stress / intonation"
                  items={stressIssues}
                />
              )}
            </div>
          )}

          {problemWords.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-purple-700 mb-2">
                Words to drill
              </div>
              <div className="flex flex-wrap gap-2">
                {problemWords.map((w, i) => (
                  <ProblemWordChip key={`${w.word}-${i}`} word={w} />
                ))}
              </div>
              <div className="text-[11px] text-slate-500 mt-2">
                Tap each word for the phoneme call-out · score reflects Azure accuracy.
              </div>
            </div>
          )}

          {((Array.isArray(strengths) && strengths.length > 0) ||
            (Array.isArray(weaknesses) && weaknesses.length > 0)) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Array.isArray(strengths) && strengths.length > 0 && (
                <BulletCard
                  tone="emerald"
                  label="What's working"
                  items={strengths}
                />
              )}
              {Array.isArray(weaknesses) && weaknesses.length > 0 && (
                <BulletCard
                  tone="amber"
                  label="To improve"
                  items={weaknesses}
                />
              )}
            </div>
          )}

          {((Array.isArray(practiceFocus) && practiceFocus.length > 0) ||
            (Array.isArray(tryThisNext) && tryThisNext.length > 0)) && (
            <div className="rounded-xl border border-indigo-100 bg-white p-4">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-indigo-700 mb-2">
                Liz's plan for next session
              </div>
              {Array.isArray(practiceFocus) && practiceFocus.length > 0 && (
                <div className="mb-3">
                  <div className="text-[12px] font-medium text-slate-700 mb-1">
                    Focus on
                  </div>
                  <ul className="text-[13px] text-slate-700 space-y-1 pl-4 list-disc">
                    {practiceFocus.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}
              {Array.isArray(tryThisNext) && tryThisNext.length > 0 && (
                <div>
                  <div className="text-[12px] font-medium text-slate-700 mb-1">
                    Try this next
                  </div>
                  <ul className="text-[13px] text-slate-700 space-y-1 pl-4 list-disc">
                    {tryThisNext.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AzureScoreGrid({ scores }) {
  const cells = [
    { key: 'pronunciation', label: 'Pronunciation', value: scores.pronunciation },
    { key: 'accuracy', label: 'Accuracy', value: scores.accuracy },
    { key: 'fluency', label: 'Fluency', value: scores.fluency },
    { key: 'completeness', label: 'Completeness', value: scores.completeness },
    { key: 'prosody', label: 'Prosody', value: scores.prosody },
  ].filter((c) => typeof c.value === 'number');
  if (cells.length === 0) return null;
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-purple-700 mb-2">
        Azure scores
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {cells.map((c) => (
          <div
            key={c.key}
            className="rounded-lg border border-slate-100 bg-white px-3 py-2 text-center"
          >
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
              {c.label}
            </div>
            <div className="text-[18px] font-semibold text-slate-900 mt-0.5">
              {Math.round(c.value)}
              <span className="text-[11px] text-slate-400 ml-0.5">/100</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const TONES = {
  amber: {
    bg: 'bg-amber-50/60',
    border: 'border-amber-100',
    text: 'text-amber-700',
  },
  rose: {
    bg: 'bg-rose-50/60',
    border: 'border-rose-100',
    text: 'text-rose-700',
  },
  emerald: {
    bg: 'bg-emerald-50/60',
    border: 'border-emerald-100',
    text: 'text-emerald-700',
  },
};

function IssueCard({ tone = 'amber', icon, label, items }) {
  const t = TONES[tone] || TONES.amber;
  return (
    <div className={`rounded-xl border ${t.border} ${t.bg} p-3.5`}>
      <div
        className={`text-[11px] font-semibold uppercase tracking-wider ${t.text} mb-1.5 flex items-center gap-1.5`}
      >
        {icon}
        {label}
      </div>
      <ul className="text-[13px] text-slate-700 space-y-1 pl-4 list-disc">
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    </div>
  );
}

function BulletCard({ tone = 'amber', label, items }) {
  const t = TONES[tone] || TONES.amber;
  return (
    <div className={`rounded-xl border ${t.border} ${t.bg} p-3.5`}>
      <div
        className={`text-[11px] font-semibold uppercase tracking-wider ${t.text} mb-1.5`}
      >
        {label}
      </div>
      <ul className="text-[13px] text-slate-700 space-y-1 pl-4 list-disc">
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    </div>
  );
}

function ProblemWordChip({ word }) {
  const [open, setOpen] = useState(false);
  const score = typeof word.accuracy_score === 'number' ? Math.round(word.accuracy_score) : null;
  const phonemes = Array.isArray(word.problem_phonemes) ? word.problem_phonemes : [];
  const errType = word.error_type && word.error_type !== 'None' ? word.error_type : null;
  const tone =
    score === null ? 'slate' : score < 60 ? 'rose' : score < 75 ? 'amber' : 'slate';
  const palette = {
    rose: 'bg-rose-50 border-rose-200 text-rose-800',
    amber: 'bg-amber-50 border-amber-200 text-amber-800',
    slate: 'bg-white border-slate-200 text-slate-700',
  };
  return (
    <button
      type="button"
      onClick={() => setOpen((v) => !v)}
      className={`text-left rounded-full border ${palette[tone]} px-3 py-1.5 text-[12px] hover:shadow-sm transition`}
    >
      <span className="font-semibold">{word.word}</span>
      {score !== null && (
        <span className="ml-1.5 text-[11px] opacity-70">{score}</span>
      )}
      {open && (errType || phonemes.length > 0) && (
        <span className="ml-2 text-[11px] opacity-80">
          {errType && <span>· {String(errType).toLowerCase()}</span>}
          {phonemes.length > 0 && (
            <span className="ml-1">
              · /{phonemes.map((p) => p.phoneme || '?').join(', /')}/
            </span>
          )}
        </span>
      )}
    </button>
  );
}
