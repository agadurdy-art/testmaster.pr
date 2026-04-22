import React, { useEffect, useState } from "react";
import {
  Star,
  Share2,
  Edit3,
  ShieldCheck,
  ThumbsUp,
  Check,
  X,
  Link as LinkIcon,
  Loader2,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import { CATEGORY_TOKENS } from "../../evaluator/schemas/writingResult";
import {
  CRITERION_CODE,
  bandLabel,
} from "../../evaluator/utils/annotationMapping";
import BandRadarChart from "../../evaluator/components/BandRadarChart";
import LizTakeCard from "../../evaluator/components/LizTakeCard";

const API_URL = process.env.REACT_APP_BACKEND_URL;
const RATED_KEY = "evaluatorRated_v1";

/**
 * Right sidebar of the Sample Report. Contains:
 *   - Overall band hero (with gap-to-target chip)
 *   - Criteria bars
 *   - Radar chart (with Band 7 benchmark)
 *   - Primary action + "Rate this evaluator" (inline 1–5 star form) + Share
 *     (native share sheet with clipboard fallback)
 *   - Liz take
 *   - Cambridge trust micro-card
 *
 * Sticky on large screens. Rating + share are self-contained — no parent
 * handlers needed. localStorage key `evaluatorRated_v1` gates re-rates
 * on the same device.
 */
export default function PublicScoreCard({
  result,
  targetBand = 7.0,
  lizMessage,
  onScoreMyEssay,
  onShowRewrite,
  className,
}) {
  const { overall_band, criteria } = result;
  const gap = Math.max(0, Math.round((targetBand - overall_band) * 2) / 2);

  // ---- Rate this evaluator ----
  const [ratingOpen, setRatingOpen] = useState(false);
  const [ratingStars, setRatingStars] = useState(0);
  const [hoverStars, setHoverStars] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [hasRated, setHasRated] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(RATED_KEY) === "1") setHasRated(true);
    } catch {
      /* localStorage disabled — user can still rate, just no memory of it */
    }
  }, []);

  const submitRating = async () => {
    if (!ratingStars) return;
    setRatingSubmitting(true);
    try {
      await fetch(`${API_URL}/api/public/evaluator-rating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stars: ratingStars,
          comment: ratingComment.trim() || null,
          page_url:
            typeof window !== "undefined"
              ? window.location.pathname + window.location.search
              : null,
        }),
      });
    } catch {
      /* Best-effort — UX shouldn't hang on network. Still mark as rated. */
    } finally {
      try {
        localStorage.setItem(RATED_KEY, "1");
      } catch {
        /* ignore */
      }
      setHasRated(true);
      setRatingOpen(false);
      setRatingSubmitting(false);
    }
  };

  // ---- Share ----
  const [shareState, setShareState] = useState("idle"); // idle | copied | shared
  useEffect(() => {
    if (shareState === "idle") return;
    const t = setTimeout(() => setShareState("idle"), 2200);
    return () => clearTimeout(t);
  }, [shareState]);

  const handleShare = async () => {
    const url =
      typeof window !== "undefined" ? window.location.href : "";
    const shareData = {
      title: "IELTS Ace — writing evaluator",
      text: "Free inline IELTS writing feedback, rubric-aligned.",
      url,
    };
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        setShareState("shared");
        return;
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setShareState("copied");
    } catch {
      if (typeof window !== "undefined") window.prompt("Copy this link:", url);
    }
  };

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
            {/* Rate this evaluator (replaces the old dead PDF-report button). */}
            <button
              type="button"
              onClick={() => !hasRated && setRatingOpen((v) => !v)}
              disabled={hasRated}
              className={cn(
                "inline-flex items-center justify-center gap-1.5",
                "border rounded-xl px-3 py-2.5 text-[13.5px] transition-colors",
                hasRated
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800 cursor-default"
                  : ratingOpen
                    ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                    : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
              )}
            >
              {hasRated ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Thanks!
                </>
              ) : (
                <>
                  <ThumbsUp className="w-3.5 h-3.5" />
                  Rate this evaluator
                </>
              )}
            </button>

            {/* Share — native share sheet if available, clipboard fallback. */}
            <button
              type="button"
              onClick={handleShare}
              className={cn(
                "inline-flex items-center justify-center gap-1.5",
                "border rounded-xl px-3 py-2.5 text-[13.5px] transition-colors",
                shareState !== "idle"
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                  : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
              )}
            >
              {shareState === "copied" ? (
                <>
                  <LinkIcon className="w-3.5 h-3.5" />
                  Link copied
                </>
              ) : shareState === "shared" ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Shared
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  Share
                </>
              )}
            </button>
          </div>

          {/* Inline rating form — slides in under the action pair. */}
          {ratingOpen && !hasRated && (
            <div className="mt-1 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="text-[12.5px] font-medium text-slate-900">
                  How accurate did this feel?
                </div>
                <button
                  type="button"
                  onClick={() => setRatingOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                  aria-label="Close rating"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div
                className="flex items-center gap-1"
                onMouseLeave={() => setHoverStars(0)}
              >
                {[1, 2, 3, 4, 5].map((n) => {
                  const active = (hoverStars || ratingStars) >= n;
                  return (
                    <button
                      key={n}
                      type="button"
                      onMouseEnter={() => setHoverStars(n)}
                      onClick={() => setRatingStars(n)}
                      className="p-0.5"
                      aria-label={`${n} star${n > 1 ? "s" : ""}`}
                    >
                      <Star
                        className={cn(
                          "w-5 h-5 transition-colors",
                          active
                            ? "fill-amber-400 stroke-amber-500"
                            : "stroke-slate-300"
                        )}
                      />
                    </button>
                  );
                })}
                {ratingStars > 0 && (
                  <span className="ml-1.5 text-[12px] text-slate-500">
                    {ratingStars}/5
                  </span>
                )}
              </div>
              <textarea
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                maxLength={500}
                rows={2}
                placeholder="Anything specific? (optional)"
                className="mt-2 w-full text-[12.5px] px-2.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 resize-none"
              />
              <div className="mt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRatingOpen(false)}
                  className="text-[12px] text-slate-500 hover:text-slate-700 px-2 py-1"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitRating}
                  disabled={!ratingStars || ratingSubmitting}
                  className={cn(
                    "inline-flex items-center gap-1 text-[12.5px] font-medium px-3 py-1.5 rounded-lg transition-colors",
                    !ratingStars || ratingSubmitting
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  )}
                >
                  {ratingSubmitting ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    "Submit"
                  )}
                </button>
              </div>
            </div>
          )}
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
