import React from "react";
import { cn } from "../../../lib/utils";

/**
 * Inline OpenGraph image concept — 1200×630 preview for the social share
 * image. The band number is always the hero. Displayed at the bottom of
 * sample pages as a visual aside showing what will be rendered server-side.
 *
 * Props:
 *   url: string shown above the preview (e.g. "testmaster.pro/samples/...")
 *   ogImagePath: string (e.g. "/og/writing-band-6-5-task2.png")
 *   result: WritingEvaluationResult (for band + criteria)
 *   taskTag: string (e.g. "Task 2 · Opinion")
 *   quote: string (Liz's one-line take for the card)
 */
export default function OgPreviewCard({
  url,
  ogImagePath,
  result,
  taskTag,
  quote,
  className,
}) {
  const { overall_band, criteria } = result;

  const bars = [
    { label: "Task Achievement", band: criteria.task_achievement.band },
    { label: "Coherence & Cohesion", band: criteria.coherence_cohesion.band },
    { label: "Lexical Resource", band: criteria.lexical_resource.band },
    { label: "Grammar", band: criteria.grammatical_range_accuracy.band },
  ];

  return (
    <section
      className={cn(
        "print:hidden mx-auto max-w-7xl px-5 sm:px-8 pb-20",
        className
      )}
    >
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-4">
        <div>
          <div className="text-[11.5px] font-medium uppercase tracking-[0.14em] text-slate-500">
            Preview
          </div>
          <h2
            className="mt-1 font-bold text-[24px] leading-tight text-slate-900"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            When someone shares this page
          </h2>
        </div>
        <div className="text-[13px] text-slate-500 md:max-w-md">
          OpenGraph image concept — 1200×630, rendered at build time from the
          score card on an emerald-to-sky gradient. The band number is always
          the hero.
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
        {/* Fake browser chrome */}
        <div className="flex items-center gap-2 text-[12px] text-slate-500 mb-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </span>
          <span className="font-mono">{url}</span>
        </div>

        {/* The 1200x630 preview */}
        <div
          className="relative overflow-hidden rounded-2xl text-white"
          style={{
            aspectRatio: "1200/630",
            background:
              "radial-gradient(ellipse 600px 260px at 80% 30%, hsl(199 89% 60% / 0.28), transparent 60%), radial-gradient(ellipse 700px 400px at 15% 80%, hsl(160 84% 39% / 0.55), transparent 60%), linear-gradient(135deg, hsl(160 70% 28%) 0%, hsl(170 60% 22%) 40%, hsl(199 60% 30%) 100%)",
          }}
        >
          {/* Grain overlay */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-50"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 1px)",
              backgroundSize: "4px 4px",
            }}
          />

          {/* Brand mark */}
          <div className="absolute top-6 left-6 sm:top-8 sm:left-8 flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-white/95 grid place-items-center">
              <span
                className="font-bold text-emerald-800 text-[18px]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                A
              </span>
            </span>
            <div>
              <div
                className="font-bold text-[16px] leading-none"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                IELTS Ace
              </div>
              <div className="text-[11px] opacity-80 mt-0.5">
                Sample Evaluation
              </div>
            </div>
          </div>

          {/* Task tag */}
          <div className="absolute top-6 right-6 sm:top-8 sm:right-8 flex items-center gap-1.5 bg-white/10 border border-white/20 backdrop-blur px-3 py-1.5 rounded-full text-[11px] font-medium uppercase tracking-[0.12em]">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            {taskTag}
          </div>

          {/* Score */}
          <div className="absolute left-8 sm:left-12 bottom-8 sm:bottom-12 right-[38%]">
            <div className="text-[12px] uppercase tracking-[0.2em] opacity-80">
              Overall Band
            </div>
            <div className="flex items-baseline gap-3 mt-1">
              <div
                className="font-bold tracking-tight drop-shadow"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "clamp(80px, 14vw, 160px)",
                  lineHeight: "0.85",
                }}
              >
                {overall_band.toFixed(1)}
              </div>
              <div className="text-[18px] opacity-70 translate-y-2">/ 9.0</div>
            </div>
            {quote && (
              <div
                className="italic mt-1 max-w-md leading-tight"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "clamp(18px, 2.2vw, 28px)",
                }}
              >
                &ldquo;{quote}&rdquo;
              </div>
            )}
            <div className="mt-2 text-[12px] opacity-80">
              — Liz, your AI IELTS coach
            </div>
          </div>

          {/* Mini score card */}
          <div className="absolute right-8 sm:right-12 bottom-8 sm:bottom-12 w-[34%] rounded-2xl bg-white/10 border border-white/20 backdrop-blur p-4 sm:p-5">
            <div className="space-y-2 sm:space-y-3">
              {bars.map((b) => (
                <div key={b.label}>
                  <div className="flex justify-between text-[11px] opacity-90">
                    <span>{b.label}</span>
                    <span className="font-semibold">{b.band.toFixed(1)}</span>
                  </div>
                  <div className="mt-1 h-1 rounded-full bg-white/15">
                    <div
                      className="h-full rounded-full bg-white"
                      style={{ width: `${(b.band / 9) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {ogImagePath && (
          <div className="mt-3 text-[12px] text-slate-500 font-mono">
            og:image → {ogImagePath} · 1200 × 630
          </div>
        )}
      </div>
    </section>
  );
}
