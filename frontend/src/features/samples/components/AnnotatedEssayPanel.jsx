import React, { useEffect, useMemo, useRef, useState } from "react";
import { FileText, Square, Clock, PenLine } from "lucide-react";
import { cn } from "../../../lib/utils";
import { CATEGORY_TOKENS } from "../../evaluator/schemas/writingResult";
import {
  buildNumberedAnnotations,
  sliceEssayByAnnotations,
} from "../../evaluator/utils/annotationMapping";

/**
 * Left panel of the Sample Report: legend header + annotated essay body
 * with click-to-open popovers for each highlight, plus a footer strip of
 * meta info (# highlights, word count, read time).
 *
 * Public-page annotation style differs from the authenticated D5 V4:
 * no numbered superscripts, no margin cards — just an inline underline
 * with a click-popover (simpler + self-contained for a marketing page).
 *
 * Props:
 *   essayText: string (original submission)
 *   annotations: InlineAnnotation[]
 *   taskBadge: string ("Task 2 · Opinion")
 *   topicLabel: string ("Technology & society")
 *   timeTarget: string ("40 min target")
 *   prompt: string (the question the essay responds to)
 *   readTimeMinutes: number
 */
export default function AnnotatedEssayPanel({
  essayText,
  annotations,
  taskBadge,
  topicLabel,
  timeTarget,
  prompt,
  wordCount,
  wordCountTarget,
  readTimeMinutes = 2,
  className,
}) {
  const numbered = useMemo(
    () => buildNumberedAnnotations(annotations || []),
    [annotations]
  );

  const paragraphs = useMemo(() => {
    const parts = essayText.split(/\n\s*\n/);
    const out = [];
    let cursor = 0;
    for (const p of parts) {
      const start = essayText.indexOf(p, cursor);
      const end = start + p.length;
      out.push({ text: p, start, end });
      cursor = end;
    }
    return out;
  }, [essayText]);

  const paragraphTokens = useMemo(() => {
    return paragraphs.map((p) => {
      const local = numbered
        .filter((a) => a.start >= p.start && a.end <= p.end)
        .map((a) => ({ ...a, start: a.start - p.start, end: a.end - p.start }));
      return sliceEssayByAnnotations(p.text, local);
    });
  }, [paragraphs, numbered]);

  return (
    <article
      className={cn(
        "bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden",
        className
      )}
    >
      <header className="px-6 sm:px-8 pt-7 pb-5 border-b border-slate-100">
        <div className="flex flex-wrap items-center gap-2 text-[12px] font-medium uppercase tracking-[0.08em] text-slate-500">
          <span className="inline-flex items-center gap-1.5 bg-sky-50 text-sky-800 px-2 py-0.5 rounded-md">
            <FileText className="w-3 h-3" />
            {taskBadge}
          </span>
          <span>·</span>
          <span>{topicLabel}</span>
          <span>·</span>
          <span>{timeTarget}</span>
        </div>
        <h2
          className="mt-3 text-[22px] leading-[1.25] text-slate-900 max-w-3xl"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          &ldquo;{prompt}&rdquo;
        </h2>

        {/* Legend */}
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px]">
          <span className="text-slate-500 font-medium">Highlights:</span>
          {["TA", "CC", "LR", "GRA"].map((code) => (
            <span key={code} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-sm"
                style={{ background: CATEGORY_TOKENS[code].swatchHex }}
                aria-hidden
              />
              {CATEGORY_TOKENS[code].label}
            </span>
          ))}
        </div>
      </header>

      {/* Essay body */}
      <EssayBody paragraphTokens={paragraphTokens} />

      {/* Footer strip */}
      <footer className="px-6 sm:px-8 py-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60 text-[13px] text-slate-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <PenLine className="w-3.5 h-3.5" />
            <span>
              <span className="font-semibold text-slate-900">
                {numbered.length}
              </span>{" "}
              highlights
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <Square className="w-3.5 h-3.5" />
            <span>
              <span className="font-semibold text-slate-900">{wordCount}</span>{" "}
              / {wordCountTarget} target words
            </span>
          </span>
          <span className="hidden sm:flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Read in ~{readTimeMinutes} min</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span>Sample essay</span>
          <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.08em] bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded">
            Read-only
          </span>
        </div>
      </footer>
    </article>
  );
}

/** Essay body with click-to-open popovers on each annotation. */
function EssayBody({ paragraphTokens }) {
  const [openId, setOpenId] = useState(null);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!openId) return;
    const onDocClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpenId(null);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpenId(null);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [openId]);

  return (
    <div
      ref={rootRef}
      className="px-6 sm:px-10 py-8 text-[17px] leading-[1.85] text-slate-800"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {paragraphTokens.map((tokens, i) => (
        <p key={i} className="mb-[1.15em] last:mb-0">
          {tokens.map((tok, j) =>
            tok.kind === "text" ? (
              <React.Fragment key={j}>{tok.text}</React.Fragment>
            ) : (
              <AnnotationPill
                key={j}
                annotation={tok.annotation}
                isOpen={openId === tok.annotation.id}
                onToggle={(id) =>
                  setOpenId((prev) => (prev === id ? null : id))
                }
              />
            )
          )}
        </p>
      ))}
    </div>
  );
}

function AnnotationPill({ annotation, isOpen, onToggle }) {
  const spanRef = useRef(null);
  const popRef = useRef(null);
  const [flipRight, setFlipRight] = useState(false);
  const tokens = CATEGORY_TOKENS[annotation.category];
  const color = tokens.swatchHex;

  useEffect(() => {
    if (!isOpen) return;
    const pop = popRef.current;
    if (!pop) return;
    // Flip popover if it would overflow the viewport right edge.
    const r = pop.getBoundingClientRect();
    if (r.right > window.innerWidth - 12) setFlipRight(true);
    else setFlipRight(false);
  }, [isOpen]);

  return (
    <span
      ref={spanRef}
      role="button"
      tabIndex={0}
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      aria-label={`${tokens.label} — ${annotation.category} feedback. Click to open.`}
      onClick={(e) => {
        e.stopPropagation();
        onToggle(annotation.id);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle(annotation.id);
        }
      }}
      className={cn(
        "relative cursor-pointer rounded-[3px] px-0.5 -mx-0.5",
        "transition-colors duration-150",
        "focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1"
      )}
      style={{
        backgroundImage: `linear-gradient(to top, ${color} 0, ${color} 2px, transparent 2px, transparent 100%)`,
        backgroundRepeat: "no-repeat",
        backgroundColor: isOpen
          ? `color-mix(in oklab, ${color} 12%, transparent)`
          : undefined,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = `color-mix(in oklab, ${color} 12%, transparent)`;
      }}
      onMouseLeave={(e) => {
        if (!isOpen) e.currentTarget.style.backgroundColor = "";
      }}
    >
      {annotation.original}
      {isOpen && (
        <span
          ref={popRef}
          role="dialog"
          className={cn(
            "absolute z-40 block text-left",
            "min-w-[280px] max-w-[320px]",
            "bg-white border border-slate-200 rounded-xl",
            "shadow-[0_12px_32px_-8px_rgba(15,23,42,0.18)]",
            "px-3.5 py-3"
          )}
          style={{
            left: flipRight ? "auto" : 0,
            right: flipRight ? 0 : "auto",
            top: "calc(100% + 8px)",
            animation: "annFadeIn 180ms ease-out both",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Caret */}
          <span
            aria-hidden
            className="absolute -top-1.5 w-2.5 h-2.5 bg-white border-l border-t border-slate-200 rotate-45"
            style={{ left: flipRight ? "auto" : 18, right: flipRight ? 18 : "auto" }}
          />
          <span className="flex items-center justify-between mb-2">
            <span
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em]"
              style={{ color }}
            >
              <span
                className="w-2 h-2 rounded-sm"
                style={{ background: color }}
              />
              {annotation.category} · {tokens.label}
            </span>
          </span>
          <span className="block text-[14px] font-medium text-slate-900">
            <span className="line-through text-slate-400">
              {annotation.original}
            </span>
            <span className="mx-1 text-slate-400">→</span>
            <span className="text-emerald-800">{annotation.suggested}</span>
          </span>
          <span className="block mt-2 text-[12.5px] text-slate-600 leading-relaxed">
            {annotation.explanation}
          </span>
        </span>
      )}
      <style>{`
        @keyframes annFadeIn {
          0% { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </span>
  );
}
