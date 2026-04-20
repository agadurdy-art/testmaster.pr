import React from "react";
import { useI18n } from "../../../lib/i18n";

/**
 * Minimal single-line streak display — "Seven days, unbroken." plus 8 dot
 * markers (7 past days + 1 upcoming). Each day is {label, state}, where
 * state is "on" | "today" | "off".
 */
export default function StreakStrip({
  title,
  eyebrow,
  subtitle,
  days = [],
}) {
  const { t } = useI18n();
  return (
    <section className="mb-14 md:mb-20">
      <div
        className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-6"
        style={{ borderBottom: "1px solid hsl(var(--rule))" }}
      >
        <div>
          <div className="label mb-3">{eyebrow ?? t("dashboardV2StreakEyebrow")}</div>
          <h2 className="display-m text-[24px] md:text-[28px]">{title}</h2>
          {subtitle && (
            <p className="text-sm text-muted mt-2 max-w-[44ch]">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2" role="list" aria-label="Past 7 days activity">
          {days.map((d, i) => (
            <div
              key={i}
              role="listitem"
              title={d.tooltip}
              className={`dot dot-${d.state}`}
              aria-current={d.state === "today" ? "true" : undefined}
            >
              {d.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
