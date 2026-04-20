import React from "react";
import { useI18n } from "../../../lib/i18n";

/**
 * Table-style list of the four IELTS skills with current band, progress bar,
 * and trend arrow. The weakest skill is visually flagged (warn-ink label
 * + destructive-colored progress fill).
 *
 * Each skill: { name, band, pctOfTarget, trend: "up"|"down"|"flat", isWeakest }
 */
export default function SkillsTable({
  skills = [],
  eyebrow,
  title,
  fullReportHref = "#",
  onSkillClick,
}) {
  const { t } = useI18n();
  return (
    <div>
      <div className="flex items-end justify-between mb-7">
        <div>
          <div className="label mb-3">{eyebrow ?? t("dashboardV2SkillsEyebrow")}</div>
          <h3 className="display-l text-[30px] md:text-[36px]">
            {title ?? t("dashboardV2SkillsTitle")}
          </h3>
        </div>
        <a
          href={fullReportHref}
          className="text-sm text-muted hover:text-fg underline underline-offset-4 shrink-0"
          style={{ textDecorationColor: "hsl(var(--rule))" }}
        >
          {t("dashboardV2FullReport")}
        </a>
      </div>
      <div
        className="divide-y border-t border-b hairline"
        style={{ borderColor: "hsl(var(--rule))" }}
      >
        {skills.map((skill) => (
          <SkillRow key={skill.name} skill={skill} onClick={onSkillClick} t={t} />
        ))}
      </div>
    </div>
  );
}

function SkillRow({ skill, onClick, t }) {
  const { name, band, pctOfTarget, trend, isWeakest } = skill;
  const fillColor = isWeakest ? "hsl(var(--destruct))" : "hsl(var(--primary))";
  const pctLabel =
    pctOfTarget >= 100
      ? t("dashboardV2AtTarget")
      : pctOfTarget != null
      ? t("dashboardV2PctOfTarget", { pct: pctOfTarget })
      : null;
  return (
    <button
      type="button"
      onClick={() => onClick?.(skill)}
      className="w-full grid grid-cols-[1fr_auto_auto] items-center gap-6 py-5 text-left transition-colors px-1"
      style={{ background: "transparent" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(var(--fg) / 0.02)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <div>
        <div className="font-display text-[20px] flex items-baseline gap-3">
          {name}
          {isWeakest && (
            <span className="warn-ink text-[11px] tracking-[0.12em] uppercase font-sans font-medium">
              {t("dashboardV2Weakest")}
            </span>
          )}
        </div>
        <div className="progress mt-3 max-w-[220px]">
          <div style={{ width: `${Math.min(100, pctOfTarget ?? 0)}%`, background: fillColor }} />
        </div>
      </div>
      {pctLabel && (
        <div className="text-[11px] text-muted tabular-nums w-24 text-right hidden sm:block">
          {pctLabel}
        </div>
      )}
      <div className="flex items-baseline gap-2 tabular-nums">
        <span className="font-display text-[28px]">{band.toFixed(1)}</span>
        <span className={`text-sm ${trendClass(trend)}`}>{trendGlyph(trend)}</span>
      </div>
    </button>
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
