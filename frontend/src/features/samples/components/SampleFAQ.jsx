import React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../../lib/utils";

/**
 * FAQ accordion. Uses native <details>/<summary> so it works without JS
 * (important for SEO on a public page). First item starts open.
 *
 * Props:
 *   items: [{ q: string, a: ReactNode }]
 */
export default function SampleFAQ({ items, className }) {
  return (
    <section className={cn("mx-auto max-w-3xl px-5 sm:px-8 pb-20", className)}>
      <div className="text-center mb-8">
        <div className="text-[11.5px] font-medium uppercase tracking-[0.14em] text-emerald-800">
          Common questions
        </div>
        <h2
          className="mt-2 font-bold text-[32px] leading-tight text-slate-900"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Before you start
        </h2>
      </div>

      <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white overflow-hidden">
        {items.map((item, i) => (
          <details key={i} className="group" open={i === 0}>
            <summary
              className={cn(
                "cursor-pointer flex items-center justify-between gap-4",
                "px-6 py-5 hover:bg-slate-50/60 transition-colors",
                "list-none [&::-webkit-details-marker]:hidden"
              )}
            >
              <span
                className="text-[18px] font-semibold text-slate-900"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {item.q}
              </span>
              <ChevronDown
                className="shrink-0 text-slate-500 w-4 h-4 transition-transform group-open:rotate-180"
                aria-hidden
              />
            </summary>
            <div className="px-6 pb-6 text-[15px] text-slate-600 leading-relaxed">
              {item.a}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

/** Default copy used on the Band 6.5 Task 2 sample page. */
export const DEFAULT_SAMPLE_FAQ = [
  {
    q: "Is this AI accurate?",
    a: (
      <>
        Within ±0.5 of a human IELTS examiner on{" "}
        <span className="font-semibold text-slate-900">92%</span> of essays
        we've benchmarked against a Cambridge-certified teacher's scores. The
        rubric uses the official{" "}
        <span className="font-medium">Band Descriptors</span> published by
        Cambridge — the same instrument examiners use. Where it disagrees, it
        tends to be slightly stricter on Task Achievement, which is what you
        want before exam day.
      </>
    ),
  },
  {
    q: "What languages are supported?",
    a: (
      <>
        Your essay is always graded in English (as the real test demands), but
        every explanation from Liz can be delivered in{" "}
        <span className="font-medium text-slate-900">
          Vietnamese, Thai, Indonesian, Mandarin, Arabic, Spanish, Portuguese
        </span>
        , and twelve more. Students consistently say reading feedback in their
        first language is what finally makes a grammar rule stick.
      </>
    ),
  },
  {
    q: "How is this different from Grammarly?",
    a: (
      <>
        Grammarly is a proofreader — it'll smooth your English, which is not
        what you need. IELTS Ace is an{" "}
        <span className="font-medium text-slate-900">examiner and a coach</span>
        : it grades against the 4 IELTS criteria, predicts your band, explains
        what's costing you marks, and drills the fixes. A proofreader will hide
        your weaknesses; we make them obvious so you can actually improve them.
      </>
    ),
  },
];
