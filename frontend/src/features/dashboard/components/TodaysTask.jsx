import React from "react";
import { useI18n } from "../../../lib/i18n";

/**
 * "Today's task" editorial column — left side of the 5/7 split with SkillsTable.
 * Renders an eyebrow, a display-l title, an editorial blurb, a numbered
 * agenda (Roman numerals via Playfair italic), and a primary CTA.
 */
export default function TodaysTask({
  eyebrow,
  title,
  description,
  steps = [],
  ctaLabel,
  onStart,
}) {
  const { t } = useI18n();
  return (
    <div>
      <div className="label mb-5">{eyebrow}</div>
      <h3 className="display-l text-[30px] md:text-[36px] max-w-[14ch]">{title}</h3>
      <p className="mt-5 editorial-body max-w-[42ch]">{description}</p>
      {steps.length > 0 && (
        <ol className="mt-7 space-y-4 text-sm max-w-[42ch]">
          {steps.map((step, i) => (
            <li key={i} className="grid grid-cols-[20px_1fr] gap-3">
              <span className="font-display text-[15px] text-muted">{ROMAN[i] || `${i + 1}.`}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      )}
      <button type="button" className="btn btn-primary mt-9" onClick={onStart}>
        {ctaLabel ?? t("dashboardV2BeginDrill")}
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
          <path d="M5 12h14M13 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

const ROMAN = ["i.", "ii.", "iii.", "iv.", "v.", "vi.", "vii."];
