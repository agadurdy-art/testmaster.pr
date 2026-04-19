import React, { useMemo, useRef, useEffect } from "react";
import { cn } from "../../../lib/utils";
import { CATEGORY_TOKENS } from "../schemas/writingResult";
import {
  buildNumberedAnnotations,
  sliceEssayByAnnotations,
} from "../utils/annotationMapping";
import { useAnnotationSync } from "./AnnotationSyncContext";

/**
 * V4 left panel: the essay rendered with numbered superscript markers for
 * each annotation, color-coded by category. Paragraph breaks come from
 * blank lines in the source text.
 *
 * Props:
 *   essayText: string (the original submission)
 *   annotations: InlineAnnotation[] (from the evaluation result)
 *   prompt: string (shown above the essay)
 *   className
 */
export default function AnnotatedEssayWithNumbers({
  essayText,
  annotations,
  prompt,
  className,
}) {
  const numbered = useMemo(
    () => buildNumberedAnnotations(annotations || []),
    [annotations]
  );

  const paragraphs = useMemo(() => {
    // Split on blank lines; preserve offsets into essayText by accumulating.
    const result = [];
    let cursor = 0;
    const parts = essayText.split(/\n\s*\n/);
    for (const p of parts) {
      const start = essayText.indexOf(p, cursor);
      const end = start + p.length;
      result.push({ text: p, start, end });
      cursor = end;
    }
    return result;
  }, [essayText]);

  const paragraphTokens = useMemo(() => {
    return paragraphs.map((p) => {
      const local = numbered.filter((a) => a.start >= p.start && a.end <= p.end);
      const shifted = local.map((a) => ({
        ...a,
        start: a.start - p.start,
        end: a.end - p.start,
      }));
      return sliceEssayByAnnotations(p.text, shifted);
    });
  }, [paragraphs, numbered]);

  return (
    <article
      className={cn(
        "rounded-2xl bg-white border border-slate-200 shadow-sm p-6 lg:p-8",
        className
      )}
      aria-label="Your submitted essay with annotations"
    >
      {prompt && (
        <div className="mb-5 pb-4 border-b border-slate-100">
          <div className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase mb-2">
            Task Prompt
          </div>
          <p className="text-sm text-slate-600 leading-relaxed italic">
            {prompt}
          </p>
        </div>
      )}

      <div
        className="space-y-5 text-slate-800"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {paragraphTokens.map((tokens, i) => (
          <p
            key={i}
            className="text-[16px] leading-[1.85]"
          >
            {tokens.map((tok, j) =>
              tok.kind === "text" ? (
                <TextSpan key={j} text={tok.text} />
              ) : (
                <AnnotationSpan key={j} annotation={tok.annotation} />
              )
            )}
          </p>
        ))}
      </div>
    </article>
  );
}

/** Preserves single line breaks inside a paragraph by replacing them with spaces. */
function TextSpan({ text }) {
  return <>{text}</>;
}

function AnnotationSpan({ annotation }) {
  const ref = useRef(null);
  const {
    activeId,
    focusId,
    clearActive,
    registerEssayRef,
  } = useAnnotationSync();
  const tokens = CATEGORY_TOKENS[annotation.category];
  const isActive = activeId === annotation.id;

  useEffect(() => {
    registerEssayRef(annotation.id, ref.current);
    return () => registerEssayRef(annotation.id, null);
  }, [annotation.id, registerEssayRef]);

  return (
    <span
      ref={ref}
      tabIndex={0}
      role="button"
      aria-label={`Annotation ${annotation.n}: ${tokens.label}. Original "${annotation.original}", suggested "${annotation.suggested}".`}
      onMouseEnter={() => focusId(annotation.id, "essay")}
      onMouseLeave={clearActive}
      onFocus={() => focusId(annotation.id, "essay")}
      onBlur={clearActive}
      className={cn(
        "relative cursor-pointer rounded-sm px-0.5 -mx-0.5",
        "underline decoration-2 underline-offset-4",
        tokens.underline,
        "transition-colors duration-150",
        isActive ? cn(tokens.bg, tokens.text) : "hover:bg-slate-50",
        "focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1"
      )}
    >
      {annotation.original}
      <sup
        className={cn(
          "ml-0.5 inline-flex items-center justify-center",
          "text-[10px] font-bold rounded-full",
          "w-[14px] h-[14px] leading-none",
          "align-super"
        )}
        style={{
          background: tokens.swatchHex,
          color: "white",
        }}
        aria-hidden
      >
        {annotation.n}
      </sup>
    </span>
  );
}
