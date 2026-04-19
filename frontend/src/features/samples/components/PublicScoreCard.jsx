import React from "react";
import { Star, Download, Share2, Edit3, ShieldCheck } from "lucide-react";
import { cn } from "../../../lib/utils";
import { CATEGORY_TOKENS } from "../../evaluator/schemas/writingResult";
import {
  CRITERION_CODE,
  bandLabel,
} from "../../evaluator/utils/annotationMapping";
import BandRadarChart from "../../evaluator/components/BandRadarChart";
import LizTakeCard from "../../evaluator/components/LizTakeCard";

/**
 * Right sidebar of the Sample Report. Contains:
 *   - Overall band hero (with gap-to-target chip)
 *   - Criteria bars
 *   - Radar chart (with Band 7 benchmark)
 *   - Primary action + PDF / Share
 *   - Liz take
 *   - Cambridge trust micro-card
 *
 * Sticky on large screens.
 */
export default function PublicScoreCard({
  result,
  targetBand = 7.0,
  lizMessage,
  onScoreMyEssay,
  onDownloadPdf,
  onShare,
  onShowRewrite,
  className,
}) {
  const { overall_band, criteria } = result;
  const gap = Math.max(0, Math.round((targetBand - overall_band) * 2) / 2);

  const criteriaBars = [
    { key: "task_achievement", crit: criteria.task_achievement },
    { key: "coherence_cohesion", crit: criteria.coherence_cohesion },
    { key: "lexical_resource", crit: criteria.lexical_resource },
    { key: "grammatical_range_accuracy", crit: criteria.grammatical_range_accuracy },
  ];

  const radarValues = [
    { code: "TA", value: criteria.task_achievement.band },
    { code: "CC", value: criteria.coherence_cohesion.band },
    { code: "LR", value: criteria.lexical_resource.band },
    { code: "GRA", value: criteria.grammatical_range_accuracy.band },
  ];

  return (
    <aside
      className={cn(
        "flex flex-col gap-6 lg:sticky lg:top-24 self-start",
        className
      )}
    >
      {/* ---- Score card ---- */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[11.5px] font-medium uppercase tracking-[0.12em] text-slate-500">
                Overall Band
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <div
                  className="font-bold text-emerald-800 tracking-tight"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "76px",
                    lineHeight: "0.85",
                  }}
                >
                  {overall_band.toFixed(1)}
                </div>
                <div className="text-[12px] text-slate-500">/ 9.0</div>
              </div>
              <div className="mt-1.5 text-[14px]">
                <span className="font-medium text-slate-900">
                  {bandLabel(overall_band)} User
                </span>
                {gap > 0 && (
                  <span className="text-slate-500">
                    {" "}
                    · within reach of {targetBand.toFixed(1)}
                  </span>
                )}
              </div>
            </div>

            {gap > 0 && (
              <div className="flex flex-col items-end gap-1">
                <span className="inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.1em] bg-amber-50 text-amber-800 px-2 py-1 rounded-md">
                  <Star className="w-3 h-3 fill-amber-500 stroke-none" />
                  +{gap.toFixed(1)} to {targetBand.toFixed(1)}
                </span>
                <span className="text-[11px] text-slate-500">
                  predicted after rewrite
                </span>
              </div>
            )}
          </div>

          {/* Criteria bars */}
          <div className="mt-5 space-y-3">
            {criteriaBars.map(({ key, crit }) => (
              <CriterionBar
                key={key}
                code={CRITERION_CODE[key]}
                crit={crit}
              />
            ))}
          </div>
        </div>

        {/* Radar chart */}
        <div className="p-5 pt-4">
          <div className="flex items-center justify-between mb-1">
            <div className="text-[11.5px] font-medium uppercase tracking-[0.12em] text-slate-500">
              Profile
            </div>
            <span className="text-[12px] text-slate-500">
              vs. Band {targetBand.toFixed(0)} benchmark
            </span>
          </div>
          <div className="flex justify-center">
            <BandRadarChart
              values={radarValues}
              size={260}
              benchmark={targetBand}
              benchmarkLabel={`Band ${targetBand.toFixed(0)}`}
              showLegend
            />
          </div>
        </div>

        {/* Actions */}
        <div className="p-5 pt-0 space-y-2.5">
          <button
            type="button"
            onClick={onScoreMyEssay}
            className={cn(
              "w-full inline-flex items-center justify-center gap-1.5",
              "bg-emerald-600 hover:bg-emerald-700 text-white",
              "font-medium text-[15px] px-4 py-3 rounded-xl",
              "shadow-[0_6px_22px_-8px_hsl(160_84%_39%/_0.55)]",
              "transition-colors"
            )}
          >
            <Edit3 className="w-4 h-4" />
            Score my own essay
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onDownloadPdf}
              className={cn(
                "inline-flex items-center justify-center gap-1.5",
                "border border-slate-200 bg-white hover:bg-slate-50",
                "text-slate-700 text-[13.5px] px-3 py-2.5 rounded-xl",
                "transition-colors"
              )}
            >
              <Download className="w-3.5 h-3.5" />
              PDF report
            </button>
            <button
              type="button"
              onClick={onShare}
              className={cn(
                "inline-flex items-center justify-center gap-1.5",
                "border border-slate-200 bg-white hover:bg-slate-50",
                "text-slate-700 text-[13.5px] px-3 py-2.5 rounded-xl",
                "transition-colors"
              )}
            >
              <Share2 className="w-3.5 h-3.5" />
              Share
            </button>
          </div>
        </div>
      </div>

      {/* ---- Liz card (reused from evaluator feature, adjusted copy) ---- */}
      {lizMessage && (
        <LizTakeCard
          message={lizMessage}
          primaryCta={{ label: "Show me the Band 7+ rewrite", href: "#" }}
          secondaryCta={{ label: "Practice body 2", href: "#" }}
          onPrimary={onShowRewrite}
        />
      )}

      {/* ---- Trust micro-card ---- */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center gap-3 text-[12.5px]">
        <div className="w-9 h-9 rounded-full bg-emerald-50 grid place-items-center text-emerald-800 shrink-0">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="leading-snug text-slate-500">
          Rubric aligned with{" "}
          <span className="font-medium text-slate-900">
            Cambridge Band Descriptors
          </span>
          . Reviewed by a real IELTS teacher.
        </div>
      </div>
    </aside>
  );
}

function CriterionBar({ code, crit }) {
  const tokens = CATEGORY_TOKENS[code];
  const pct = (crit.band / 9) * 100;
  return (
    <div>
      <div className="flex items-center justify-between text-[13.5px]">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-2 h-2 rounded-sm shrink-0"
            style={{ background: tokens.swatchHex }}
            aria-hidden
          />
          <span className="font-medium text-slate-900 truncate">
            {tokens.label}
          </span>
        </div>
        <div className="flex items-baseline gap-0.5 font-semibold">
          <span
            className="text-slate-900"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {crit.band.toFixed(1)}
          </span>
          <span className="text-[11px] text-slate-500">/9</span>
        </div>
      </div>
      <div className="mt-1.5 h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${tokens.swatchHex} 0%, ${tokens.swatchHex} 60%, hsl(160 84% 39%) 100%)`,
            opacity: 0.9,
          }}
        />
      </div>
    </div>
  );
}
