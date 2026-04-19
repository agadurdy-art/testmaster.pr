import React from "react";

/**
 * Compact Liz note surface — pairs with RecentSessions in the 7/5 split.
 * Renders a short actionable nudge (display-m) + yes/no CTAs.
 */
export default function LizNote({
  message,
  eyebrow = "A note from Liz",
  primaryCtaLabel = "Yes, plan it",
  secondaryCtaLabel = "Not now",
  onAccept,
  onDismiss,
}) {
  return (
    <aside className="liz-surface p-8 md:p-10 self-start">
      <div className="flex items-center gap-3 mb-5">
        <div className="liz-avatar w-9 h-9 rounded-full" aria-hidden="true" />
        <span className="liz-ink text-[11px] font-medium tracking-[0.18em] uppercase">
          {eyebrow}
        </span>
      </div>
      <p className="display-m text-[22px] md:text-[24px] max-w-[28ch]">{message}</p>
      <div className="mt-7 flex flex-wrap gap-3">
        <button
          type="button"
          className="btn btn-primary text-sm"
          style={{ padding: "0.625rem 1rem" }}
          onClick={onAccept}
        >
          {primaryCtaLabel}
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="text-sm text-muted hover:text-fg underline underline-offset-4"
          style={{ textDecorationColor: "hsl(var(--rule))" }}
        >
          {secondaryCtaLabel}
        </button>
      </div>
    </aside>
  );
}
