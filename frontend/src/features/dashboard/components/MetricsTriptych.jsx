import React from "react";
import { useI18n } from "../../../lib/i18n";

/**
 * Editorial metrics triptych — current band / target / days remaining.
 * Hairline divider between columns instead of cards; large Playfair numbers.
 */
export default function MetricsTriptych({
  currentBand,
  currentBandTrend,
  targetBand,
  targetProgressPct,
  targetProgressLabel,
  daysRemaining,
  examDateLabel,
}) {
  const { t } = useI18n();
  const clampedPct = Math.max(0, Math.min(100, targetProgressPct ?? 0));
  return (
    <section className="mb-14 md:mb-20">
      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-0 md:divide-x"
        style={{ borderColor: "hsl(var(--rule))" }}
      >
        <div className="md:pr-10">
          <div className="label mb-5">{t("dashboardV2MetricsCurrentBand")}</div>
          <div className="display-xxl text-[68px] md:text-[84px]">{currentBand}</div>
          {currentBandTrend && (
            <div className="mt-3 text-sm text-muted">
              {currentBandTrend.label}{" "}
              <span className={`${trendClass(currentBandTrend.direction)} font-medium ml-1`}>
                {trendGlyph(currentBandTrend.direction)}
              </span>
            </div>
          )}
        </div>
        <div className="md:px-10">
          <div className="label mb-5">{t("dashboardV2MetricsTarget")}</div>
          <div className="display-xxl text-[68px] md:text-[84px]">{targetBand}</div>
          <div className="mt-4 progress max-w-[220px]">
            <div style={{ width: `${clampedPct}%`, background: "hsl(var(--primary))" }} />
          </div>
          {targetProgressLabel && (
            <div className="mt-3 text-sm text-muted">{targetProgressLabel}</div>
          )}
        </div>
        <div className="md:pl-10">
          <div className="label mb-5">{t("dashboardV2MetricsDaysRemaining")}</div>
          <div className="display-xxl text-[68px] md:text-[84px]">{daysRemaining}</div>
          {examDateLabel && <div className="mt-3 text-sm text-muted">{examDateLabel}</div>}
        </div>
      </div>
    </section>
  );
}

function trendClass(dir) {
  if (dir === "up") return "trend-up";
  if (dir === "down") return "trend-down";
  return "trend-flat";
}
function trendGlyph(dir) {
  if (dir === "up") return "↑";
  if (dir === "down") return "↓";
  return "→";
}
