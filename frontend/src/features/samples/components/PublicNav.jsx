import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "../../../lib/utils";
import BrandLogo from "../../../components/BrandLogo";

/**
 * Public top nav shown above unauthenticated sample pages.
 * Sticky with a translucent backdrop-blur so the content below reads through.
 */
export default function PublicNav({ className, ctaHref = "/signup" }) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 border-b border-slate-200/70",
        "bg-slate-50/85 backdrop-blur",
        "print:hidden",
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 h-16 flex items-center justify-between">
        <BrandLogo size="sm" href="/" />

        {/* All four skill links point at their canonical "full report"
            sample page. This way, when a visitor is already inside one
            sample (e.g. Reading), clicking Writing cross-navigates to the
            writing sample report instead of jumping back to the live
            evaluator landing — which is the behavior reported on 2026-05-10.
            The live evaluator entry points live inside each sample report
            page (e.g. PublicScoreCard's "Score my essay" button). */}
        <nav className="hidden md:flex items-center gap-7 text-[14px] text-slate-700">
          <a href="/samples/writing/band-6-5-task2" className="hover:text-slate-900">
            Writing
          </a>
          <a href="/samples/speaking/band-6-5-part2" className="hover:text-slate-900">
            Speaking
          </a>
          <a href="/samples/reading/band-6-0-academic" className="hover:text-slate-900">
            Reading
          </a>
          <a href="/samples/listening/band-5-5-listening" className="hover:text-slate-900">
            Listening
          </a>
          {/* "Samples" is the hub/switcher — sends users to the carousel on
              the landing page where they can pick any writing or speaking
              sample. Previously this linked to a specific writing sample,
              which broke when users were already on that page. */}
          <a href="/#samples" className="hover:text-slate-900">
            Samples
          </a>
          <a href="/pricing" className="hover:text-slate-900">
            Pricing
          </a>
        </nav>

        <div className="flex items-center gap-2.5">
          <a
            href="/login"
            className="hidden sm:inline-flex items-center text-[14px] text-slate-700 hover:text-slate-900 px-3 py-2 rounded-lg"
          >
            Log in
          </a>
          <a
            href={ctaHref}
            className={cn(
              "inline-flex items-center gap-1.5",
              "bg-emerald-600 hover:bg-emerald-700 text-white",
              "font-medium text-[14px] px-4 py-2 rounded-xl",
              "shadow-[0_6px_22px_-8px_hsl(160_84%_39%/_0.55)]",
              "transition-colors"
            )}
          >
            Try free
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </header>
  );
}
