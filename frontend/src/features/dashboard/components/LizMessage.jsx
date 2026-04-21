import React from "react";
import LizAvatar from "../../landing/components/LizAvatar";

/**
 * Liz's daily message — editorial block-quote on violet liz-surface.
 * Renders the prompt copy with an emphasized key term and a primary CTA.
 */
export default function LizMessage({
  message,
  primaryCtaLabel = "Start today's task",
  secondaryCtaLabel = "Ask Liz something else",
  onPrimary,
  onSecondary,
}) {
  return (
    <section className="liz-surface px-6 md:px-10 py-8 md:py-10 mb-14 md:mb-20">
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 md:gap-10 items-start">
        <div className="flex items-center gap-3 md:block">
          <LizAvatar size={56} className="liz-avatar shrink-0" />
          <div className="md:mt-3 md:text-center">
            <div className="liz-ink text-[11px] font-medium tracking-[0.18em] uppercase">Liz</div>
            <div className="text-muted text-[11px] mt-0.5 hidden md:block">your coach</div>
          </div>
        </div>
        <div>
          <p className="display-l text-[24px] md:text-[30px] text-fg max-w-[40ch]">
            {message}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button type="button" className="btn btn-primary" onClick={onPrimary}>
              {primaryCtaLabel}
              <ArrowRight />
            </button>
            <button
              type="button"
              onClick={onSecondary}
              className="text-sm text-muted hover:text-fg underline underline-offset-4"
              style={{ textDecorationColor: "hsl(var(--rule))" }}
            >
              {secondaryCtaLabel}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function ArrowRight() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}
