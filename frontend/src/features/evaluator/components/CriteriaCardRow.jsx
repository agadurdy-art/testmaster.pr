import React, { useState } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "../../../lib/utils";
import { CATEGORY_TOKENS } from "../schemas/writingResult";
import { CRITERION_CODE, CRITERION_LABEL } from "../utils/annotationMapping";
import CriteriaDetailsModal from "./CriteriaDetailsModal";

/**
 * Horizontal row of four compact criterion cards. Clicking a card opens a
 * floating modal with full strengths/weaknesses (the inline expand was
 * unreadable inside the narrow column).
 */
export default function CriteriaCardRow({ criteria, className }) {
  const items = [
    { key: "task_achievement", crit: criteria.task_achievement },
    { key: "coherence_cohesion", crit: criteria.coherence_cohesion },
    { key: "lexical_resource", crit: criteria.lexical_resource },
    { key: "grammatical_range_accuracy", crit: criteria.grammatical_range_accuracy },
  ];

  const [activeCode, setActiveCode] = useState(null);
  const active = items.find((it) => CRITERION_CODE[it.key] === activeCode);

  return (
    <>
      <div
        className={cn(
          "grid grid-cols-2 lg:grid-cols-4 gap-3 w-full",
          className
        )}
      >
        {items.map(({ key, crit }) => (
          <CriterionCard
            key={key}
            code={CRITERION_CODE[key]}
            crit={crit}
            onOpen={() => setActiveCode(CRITERION_CODE[key])}
          />
        ))}
      </div>

      <CriteriaDetailsModal
        open={!!active}
        onClose={() => setActiveCode(null)}
        code={activeCode}
        crit={active?.crit}
      />
    </>
  );
}

function CriterionCard({ code, crit, onOpen }) {
  const tokens = CATEGORY_TOKENS[code];

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "text-left rounded-2xl bg-white border border-slate-200 p-4",
        "transition-all duration-200",
        "hover:shadow-md hover:-translate-y-0.5",
        "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
      )}
      aria-label={`${CRITERION_LABEL[code]} details`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ background: tokens.swatchHex }}
              aria-hidden
            />
            <span className="text-[11px] font-semibold tracking-widest text-slate-500">
              {code}
            </span>
          </div>
          <div className="text-sm font-medium text-slate-700 mt-0.5 truncate">
            {CRITERION_LABEL[code]}
          </div>
        </div>
        <div
          className="font-serif text-3xl leading-none font-bold text-emerald-700"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {crit.band.toFixed(1)}
        </div>
      </div>

      <p className="mt-2 text-[13px] leading-snug text-slate-600 line-clamp-2">
        {crit.explanation}
      </p>

      <div className="mt-3 flex items-center gap-3 text-[11px] font-semibold text-slate-500">
        <span className="inline-flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          {crit.strengths.length} strengths
        </span>
        <span className="inline-flex items-center gap-1">
          <AlertCircle className="w-3 h-3 text-rose-500" />
          {crit.weaknesses.length} to fix
        </span>
      </div>
    </button>
  );
}
