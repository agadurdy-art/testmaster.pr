import React from "react";
import { useI18n } from "../../../lib/i18n";
import LizAvatar from "../../landing/components/LizAvatar";

/**
 * Compact Liz note surface — pairs with RecentSessions in the 7/5 split.
 * Renders a short actionable nudge (display-m) + yes/no CTAs.
 */
export default function LizNote({
  message,
  eyebrow,
  primaryCtaLabel,
  secondaryCtaLabel,
  onAccept,
  onDismiss,
}) {
  const { t } = useI18n();
  return (
    <aside className="liz-surface p-8 md:p-10 self-start">
      <div className="flex items-center gap-3 mb-5">
        <LizAvatar size={36} className="liz-avatar shrink-0" />
        <span className="liz-ink text-[11px] font-medium tracking-[0.18em] uppercase">
          {eyebrow ?? t("dashboardV2LizNoteEyebrow")}
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
          {primaryCtaLabel ?? t("dashboardV2LizNoteYes")}
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="text-sm text-muted hover:text-fg underline underline-offset-4"
          style={{ textDecorationColor: "hsl(var(--rule))" }}
        >
          {secondaryCtaLabel ?? t("dashboardV2LizNoteNo")}
        </button>
      </div>
    </aside>
  );
}
