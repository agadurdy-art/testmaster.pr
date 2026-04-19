import React from "react";

/**
 * Gold-bordered editorial spread for the full mock test.
 * Intentionally visually isolated from daily practice — the .mock-frame CSS
 * adds the gold top edge, gold-tinted shadow, and liquid-glass surface.
 */
export default function MockTestFrame({
  eyebrow = "The full test",
  title = "Take a complete mock.",
  description,
  durationLabel = "2h 45m, timed",
  lastMock,
  nextRecommended,
  ctaLabel = "Start full test",
  onStart,
  onSchedule,
}) {
  return (
    <section className="mock-frame p-8 md:p-12 mb-14 md:mb-20">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-10 items-end">
        <div className="max-w-[52ch]">
          <div className="eyebrow mb-4" style={{ color: "hsl(var(--gold-ink))" }}>
            {eyebrow}
          </div>
          <h2 className="display-xl text-[36px] md:text-[48px]">{title}</h2>
          {description && <p className="mt-6 editorial-body">{description}</p>}
          <div className="mt-7 text-sm text-muted flex flex-wrap items-center">
            <span>{durationLabel}</span>
            {lastMock && (
              <>
                <span className="divider-dot" />
                <span>
                  Last mock: <span className="text-fg">{lastMock}</span>
                </span>
              </>
            )}
            {nextRecommended && (
              <>
                <span className="divider-dot" />
                <span>
                  Next recommended: <span className="text-fg">{nextRecommended}</span>
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-col items-start md:items-end gap-3">
          <button type="button" className="btn btn-gold" onClick={onStart}>
            {ctaLabel}
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onSchedule}
            className="text-sm text-muted hover:text-fg underline underline-offset-4"
            style={{ textDecorationColor: "hsl(var(--rule))" }}
          >
            Schedule for later
          </button>
        </div>
      </div>
    </section>
  );
}
