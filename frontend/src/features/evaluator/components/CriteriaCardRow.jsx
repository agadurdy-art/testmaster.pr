import React, { useState } from "react";
import { ChevronDown, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "../../../lib/utils";
import { CATEGORY_TOKENS } from "../schemas/writingResult";
import { CRITERION_CODE, CRITERION_LABEL } from "../utils/annotationMapping";

/**
 * Horizontal row of four compact criterion cards. Clicking a card expands it
 * to reveal strengths/weaknesses. Designed for the V4 score strip.
 */
export default function CriteriaCardRow({ criteria, className }) {
  const items = [
    { key: "task_achievement", crit: criteria.task_achievement },
    { key: "coherence_cohesion", crit: criteria.coherence_cohesion },
    { key: "lexical_resource", crit: criteria.lexical_resource },
    { key: "grammatical_range_accuracy", crit: criteria.grammatical_range_accuracy },
  ];

  return (
    <div
      className={cn(
        "grid grid-cols-2 lg:grid-cols-4 gap-3 w-full",
        className
      )}
    >
      {items.map(({ key, crit }) => (
        <CriterionCard key={key} code={CRITERION_CODE[key]} crit={crit} />
      ))}
    </div>
  );
}

function CriterionCard({ code, crit }) {
  const [open, setOpen] = useState(false);
  const tokens = CATEGORY_TOKENS[code];

  return (
    <div
      className={cn(
        "rounded-2xl bg-white border border-slate-200 p-4",
        "transition-all duration-200",
        "hover:shadow-md hover:-translate-y-0.5",
        open && "shadow-md"
      )}
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

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "mt-3 inline-flex items-center gap-1 text-[11px] font-semibold",
          "text-slate-500 hover:text-slate-900"
        )}
        aria-expanded={open}
      >
        <ChevronDown
          className={cn(
            "w-3 h-3 transition-transform",
            open && "rotate-180"
          )}
        />
        {open ? "Hide details" : `${crit.strengths.length} strengths · ${crit.weaknesses.length} to fix`}
      </button>

      {open && (
        <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
          <ul className="space-y-1">
            {crit.strengths.map((s, i) => (
              <li
                key={i}
                className="flex gap-2 text-[12px] text-slate-700 leading-snug"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0 text-emerald-600" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
          <ul className="space-y-1">
            {crit.weaknesses.map((w, i) => (
              <li
                key={i}
                className="flex gap-2 text-[12px] text-slate-700 leading-snug"
              >
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-rose-500" />
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
