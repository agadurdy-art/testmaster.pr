import React, { useEffect, useMemo, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "../../../lib/utils";
import { CATEGORY_TOKENS } from "../schemas/writingResult";
import { buildNumberedAnnotations } from "../utils/annotationMapping";
import { useAnnotationSync } from "./AnnotationSyncContext";

/**
 * V4 right panel: scrollable list of "teacher's margin" note cards.
 * Each card mirrors one annotation in the essay and is lightly rotated to
 * give the teacher's-notes feel. Hover/focus syncs with the essay panel.
 */
export default function MarginNotesList({ annotations, className }) {
  const numbered = useMemo(
    () => buildNumberedAnnotations(annotations || []),
    [annotations]
  );

  return (
    <aside
      className={cn(
        "flex flex-col gap-3",
        "max-h-[calc(100vh-220px)] overflow-y-auto pr-2",
        className
      )}
      aria-label="Teacher's margin notes"
    >
      <div className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase px-1 sticky top-0 bg-slate-50 py-2 -mt-2 -mx-1 z-10">
        Notes · {numbered.length} suggestions
      </div>
      {numbered.map((ann, i) => (
        <MarginCard key={ann.id} annotation={ann} index={i} />
      ))}
    </aside>
  );
}

function MarginCard({ annotation, index }) {
  const ref = useRef(null);
  const {
    activeId,
    focusId,
    clearActive,
    registerMarginRef,
  } = useAnnotationSync();

  const tokens = CATEGORY_TOKENS[annotation.category];
  const isActive = activeId === annotation.id;
  // Alternate slight rotation for teacher's-notes feel.
  const tilt = index % 2 === 0 ? "-0.4deg" : "0.4deg";

  useEffect(() => {
    registerMarginRef(annotation.id, ref.current);
    return () => registerMarginRef(annotation.id, null);
  }, [annotation.id, registerMarginRef]);

  return (
    <div
      ref={ref}
      tabIndex={0}
      role="button"
      onMouseEnter={() => focusId(annotation.id, "margin")}
      onMouseLeave={clearActive}
      onFocus={() => focusId(annotation.id, "margin")}
      onBlur={clearActive}
      style={{
        transform: isActive ? "rotate(0deg) scale(1.02)" : `rotate(${tilt})`,
        borderLeftColor: tokens.swatchHex,
      }}
      className={cn(
        "relative rounded-2xl bg-white p-4 shadow-sm",
        "border border-slate-200 border-l-4",
        "transition-all duration-200 ease-out",
        "cursor-pointer",
        "hover:shadow-md",
        "focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1",
        isActive && "shadow-lg ring-2 ring-emerald-300 ring-offset-1"
      )}
    >
      {/* Header: number badge + category */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold text-white"
            style={{ background: tokens.swatchHex }}
          >
            {annotation.n}
          </span>
          <span
            className="text-[10px] font-semibold tracking-widest uppercase"
            style={{ color: tokens.swatchHex }}
          >
            {annotation.category}
          </span>
        </div>
        {annotation.severity === "major" ? (
          <span className="text-[10px] font-semibold text-rose-600 uppercase tracking-wider">
            Major
          </span>
        ) : (
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
            Minor
          </span>
        )}
      </div>

      {/* Diff: original → suggested */}
      <div className="flex flex-wrap items-baseline gap-2 mb-2">
        <span className="text-sm text-slate-500 line-through decoration-slate-400">
          {annotation.original}
        </span>
        <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="text-sm font-semibold text-emerald-700">
          {annotation.suggested}
        </span>
      </div>

      {/* Explanation */}
      <p className="text-[13px] leading-snug text-slate-600">
        {annotation.explanation}
      </p>
    </div>
  );
}
