import React, { useEffect } from "react";
import { X, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "../../../lib/utils";
import { CATEGORY_TOKENS } from "../schemas/writingResult";
import { CRITERION_LABEL } from "../utils/annotationMapping";

/**
 * Floating modal that shows the full strengths / to-fix list for a single
 * criterion. Opened from CriteriaCardRow when a card is clicked.
 *
 * Props:
 *   open: boolean
 *   onClose: () => void
 *   code: "TA" | "CC" | "LR" | "GRA"
 *   crit: { band, explanation, strengths[], weaknesses[] }
 */
export default function CriteriaDetailsModal({ open, onClose, code, crit }) {
  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !crit) return null;

  const tokens = CATEGORY_TOKENS[code] || {};
  const label = CRITERION_LABEL[code] || code;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="criteria-modal-title"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
      />

      {/* Panel */}
      <div
        className={cn(
          "relative w-full max-w-2xl",
          "rounded-2xl bg-white shadow-2xl",
          "max-h-[90vh] flex flex-col",
          "animate-[fadeIn_0.15s_ease-out]"
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-5 border-b border-slate-100">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{ background: tokens.swatchHex }}
                aria-hidden
              />
              <span className="text-[11px] font-semibold tracking-widest text-slate-500">
                {code}
              </span>
            </div>
            <h2
              id="criteria-modal-title"
              className="text-lg sm:text-xl font-semibold text-slate-900 mt-0.5"
            >
              {label}
            </h2>
            {crit.explanation && (
              <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                {crit.explanation}
              </p>
            )}
          </div>
          <div className="flex items-start gap-3 shrink-0">
            <div
              className="font-bold text-emerald-700 leading-none"
              style={{ fontFamily: "'Playfair Display', serif", fontSize: "40px" }}
            >
              {crit.band.toFixed(1)}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body — scrollable */}
        <div className="overflow-y-auto p-5 space-y-6">
          {crit.strengths?.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold tracking-widest text-emerald-700 uppercase mb-2">
                Strengths
              </h3>
              <ul className="space-y-2.5">
                {crit.strengths.map((s, i) => (
                  <li
                    key={i}
                    className="flex gap-2.5 text-sm text-slate-700 leading-relaxed"
                  >
                    <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {crit.weaknesses?.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold tracking-widest text-rose-600 uppercase mb-2">
                To fix
              </h3>
              <ul className="space-y-2.5">
                {crit.weaknesses.map((w, i) => (
                  <li
                    key={i}
                    className="flex gap-2.5 text-sm text-slate-700 leading-relaxed"
                  >
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-500" />
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
