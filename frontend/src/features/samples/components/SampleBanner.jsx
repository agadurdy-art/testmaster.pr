import React from "react";
import { PenLine } from "lucide-react";
import { cn } from "../../../lib/utils";

/**
 * Thin emerald-tinted banner sits directly under the public nav on sample
 * pages to remind visitors this is a read-only preview. `noun` lets the
 * speaking trial swap "essay" for "speaking response" without forking the
 * component (Codex live-test #5).
 */
export default function SampleBanner({
  className,
  ctaHref = "#cta",
  noun = "essay",
  ctaLabel = "Score my essay",
}) {
  return (
    <div
      className={cn(
        "print:hidden border-b border-emerald-200/70",
        className
      )}
      style={{
        background:
          "linear-gradient(90deg, hsl(160 60% 96%) 0%, hsl(160 60% 97%) 40%, hsl(199 90% 97%) 100%)",
      }}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-2.5 flex items-center gap-3 text-[13.5px]">
        <span className="inline-flex items-center gap-1.5 font-medium text-emerald-800">
          <PenLine className="w-4 h-4" />
          Sample Evaluation
        </span>
        <span className="text-slate-600">
          — see exactly how{" "}
          <em className="not-italic font-medium text-slate-900">your</em>{" "}
          {noun} will be scored. Nothing here is editable.
        </span>
        <span className="ml-auto hidden sm:inline-flex items-center gap-2">
          <a
            href={ctaHref}
            className="text-emerald-800 font-medium hover:underline"
          >
            {ctaLabel} →
          </a>
        </span>
      </div>
    </div>
  );
}
