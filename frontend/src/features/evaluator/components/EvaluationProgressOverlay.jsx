import React, { useEffect, useState, useRef } from "react";
import { Sparkles, BookOpen, Highlighter, Target, MessageSquareHeart } from "lucide-react";

/**
 * Full-screen overlay shown while a writing evaluation is in flight.
 *
 * Sonnet evaluations take 25–60s and the only previous feedback was a tiny
 * spinning "Evaluating..." button label, which felt like a hang. This overlay
 * narrates progress through synthetic stages on a timer (we don't have
 * streaming progress from the backend, but users don't need to know that —
 * they need to know *something* is happening).
 *
 * Stages cycle automatically every ~7s. The elapsed timer is real, so even if
 * the eval takes longer than the scripted stages, the user still sees the
 * counter ticking.
 *
 * Props:
 *   open: boolean — controls visibility
 *   tip:  optional string — a rotating IELTS tip shown at the bottom
 */
const STAGES = [
  { icon: BookOpen,         title: "Reading your essay",         hint: "Liz is taking in your full response — task response, structure, and flow." },
  { icon: Highlighter,      title: "Checking grammar & vocabulary", hint: "Marking up tense agreement, collocations, and academic register." },
  { icon: Target,           title: "Calibrating IELTS bands",     hint: "Cross-checking your writing against Cambridge band descriptors 4–9." },
  { icon: MessageSquareHeart, title: "Drafting coaching notes",   hint: "Picking the highest-leverage fixes and a stage-appropriate next lesson." },
];

const TIPS = [
  "Task 2 essays are scored on Task Response, Coherence, Lexical Resource, and Grammar — equally weighted.",
  "Examiners reward range over rare words. Use precise everyday vocabulary correctly before reaching for fancy ones.",
  "Cohesion ≠ linking words. Repeating 'Furthermore / Moreover' in every paragraph hurts your CC band.",
  "A clear thesis in the introduction sets the ceiling for Task Response. State your position plainly.",
  "Don't memorise model essays — examiners spot it instantly and your TR band drops.",
];

export default function EvaluationProgressOverlay({ open, tip }) {
  const [stageIdx, setStageIdx] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [tipIdx, setTipIdx] = useState(() => Math.floor(Math.random() * TIPS.length));
  const startedAtRef = useRef(null);

  useEffect(() => {
    if (!open) {
      setStageIdx(0);
      setElapsedSec(0);
      startedAtRef.current = null;
      return undefined;
    }
    startedAtRef.current = Date.now();
    // Lock body scroll while the overlay is up — and ALWAYS restore it on close.
    // (Previously the lock was set as a side-effect in the render body, which
    // never ran its restore because `if (!open) return null` short-circuits
    // first. The result: after grading finished, body.overflow stayed "hidden"
    // and the entire results page could no longer scroll.)
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const stageTimer = setInterval(() => {
      setStageIdx((i) => Math.min(i + 1, STAGES.length - 1));
    }, 7000);
    const elapsedTimer = setInterval(() => {
      const ms = Date.now() - (startedAtRef.current || Date.now());
      setElapsedSec(Math.floor(ms / 1000));
    }, 250);
    const tipTimer = setInterval(() => {
      setTipIdx((i) => (i + 1) % TIPS.length);
    }, 9000);
    return () => {
      clearInterval(stageTimer);
      clearInterval(elapsedTimer);
      clearInterval(tipTimer);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  if (!open) return null;

  const Stage = STAGES[stageIdx];
  const StageIcon = Stage.icon;

  return (
    <div className="fixed inset-0 z-[80] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header strip */}
        <div className="bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-lg leading-tight">Liz is grading your essay</h2>
              <p className="text-xs text-white/80 mt-0.5">This usually takes 25–60 seconds.</p>
            </div>
            <div className="ml-auto text-right shrink-0">
              <div className="text-2xl font-bold tabular-nums">{elapsedSec}s</div>
              <div className="text-[10px] uppercase tracking-wide text-white/70">elapsed</div>
            </div>
          </div>
        </div>

        {/* Stages list */}
        <div className="p-6 space-y-3">
          {STAGES.map((s, i) => {
            const Icon = s.icon;
            const done = i < stageIdx;
            const active = i === stageIdx;
            return (
              <div
                key={s.title}
                className={`flex items-start gap-3 rounded-lg p-3 transition-all ${
                  active
                    ? "bg-indigo-50 ring-1 ring-indigo-200"
                    : done
                      ? "opacity-60"
                      : "opacity-40"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
                    active
                      ? "bg-indigo-600 text-white"
                      : done
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {active ? (
                    <Icon className="w-4 h-4 animate-pulse" />
                  ) : done ? (
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <div className="min-w-0">
                  <div
                    className={`text-sm font-medium ${
                      active ? "text-indigo-900" : "text-slate-700"
                    }`}
                  >
                    {s.title}
                  </div>
                  {active && (
                    <div className="text-xs text-slate-600 mt-0.5">{Stage.hint}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Tip */}
        <div className="border-t border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">
            Tip while you wait
          </div>
          <p className="text-xs text-slate-700 leading-snug">{tip || TIPS[tipIdx]}</p>
        </div>
      </div>
    </div>
  );
}
