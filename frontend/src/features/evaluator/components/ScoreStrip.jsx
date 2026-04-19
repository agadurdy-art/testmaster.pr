import React from "react";
import { Sparkles, FileText } from "lucide-react";
import { cn } from "../../../lib/utils";
import BandRadarChart from "./BandRadarChart";
import CriteriaCardRow from "./CriteriaCardRow";
import {
  CRITERION_CODE,
  bandLabel,
  wordCountStatus,
} from "../utils/annotationMapping";

/**
 * V4 score strip — the top band above the essay.
 * Overall score + label on the left, mini radar, criteria cards, rewrite CTA.
 */
export default function ScoreStrip({ result, onRewrite, className }) {
  const { overall_band, criteria, word_count, word_count_target } = result;
  const { pct, status } = wordCountStatus(word_count, word_count_target);

  const radarValues = [
    { code: "TA", value: criteria.task_achievement.band },
    { code: "CC", value: criteria.coherence_cohesion.band },
    { code: "LR", value: criteria.lexical_resource.band },
    { code: "GRA", value: criteria.grammatical_range_accuracy.band },
  ];

  return (
    <section
      className={cn(
        "rounded-2xl bg-white border border-slate-200 shadow-sm",
        "p-5 lg:p-6",
        className
      )}
      aria-label="Band score summary"
    >
      <div className="flex flex-col lg:flex-row lg:items-center gap-5 lg:gap-6">
        {/* Overall */}
        <div className="flex items-center gap-4 lg:min-w-[240px]">
          <div>
            <div className="text-[11px] font-semibold tracking-widest text-slate-500 uppercase">
              Overall Band
            </div>
            <div
              className="font-bold leading-none text-emerald-700"
              style={{ fontFamily: "'Playfair Display', serif", fontSize: "64px" }}
            >
              {overall_band.toFixed(1)}
            </div>
            <div className="text-sm text-slate-600 mt-1">
              {bandLabel(overall_band)}
            </div>
          </div>

          {/* Word count pill */}
          <div className="flex flex-col gap-2">
            <WordCountPill
              count={word_count}
              target={word_count_target}
              pct={pct}
              status={status}
            />
          </div>
        </div>

        {/* Radar */}
        <div className="shrink-0 flex justify-center lg:border-l lg:border-slate-100 lg:pl-5">
          <BandRadarChart values={radarValues} size={160} />
        </div>

        {/* Criteria */}
        <div className="flex-1 min-w-0">
          <CriteriaCardRow criteria={criteria} />
        </div>

        {/* Rewrite CTA */}
        <div className="shrink-0 lg:self-stretch lg:flex lg:items-stretch">
          <button
            type="button"
            onClick={onRewrite}
            className={cn(
              "group rounded-2xl px-4 py-3",
              "bg-gradient-to-br from-emerald-500 to-emerald-600",
              "text-white font-medium shadow-sm",
              "hover:from-emerald-600 hover:to-emerald-700",
              "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2",
              "transition-all",
              "flex flex-col items-start gap-1 lg:w-[200px]"
            )}
          >
            <span className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="w-4 h-4" />
              Band 7+ rewrite
            </span>
            <span className="text-[11px] text-emerald-100 text-left leading-snug">
              See an improved version of your essay
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}

function WordCountPill({ count, target, pct, status }) {
  const ring =
    status === "on_target"
      ? "border-emerald-200 text-emerald-700 bg-emerald-50"
      : status === "under"
      ? "border-amber-200 text-amber-700 bg-amber-50"
      : "border-sky-200 text-sky-700 bg-sky-50";
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5",
        "text-xs font-medium",
        ring
      )}
      title={`${count} words (${pct}% of ${target} target)`}
    >
      <FileText className="w-3.5 h-3.5" />
      <span className="tabular-nums">{count}</span>
      <span className="text-slate-400">/</span>
      <span className="tabular-nums text-slate-500">{target}</span>
      <span className="text-slate-400">·</span>
      <span className="tabular-nums">{pct}%</span>
    </div>
  );
}
