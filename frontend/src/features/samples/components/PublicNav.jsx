import React from "react";
import { Globe, ArrowRight } from "lucide-react";
import { cn } from "../../../lib/utils";

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
        <a href="/" className="flex items-center gap-2.5">
          <span className="relative w-9 h-9 rounded-xl bg-emerald-600 grid place-items-center shadow-[0_6px_22px_-8px_hsl(160_84%_39%/_0.55)]">
            <span
              className="font-bold text-white text-xl leading-none"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              A
            </span>
            <span className="absolute -right-1 -top-1 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-slate-50" />
          </span>
          <div className="leading-tight">
            <div
              className="font-bold text-[17px] tracking-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              IELTS Ace
            </div>
            <div className="text-[11px] text-slate-500 -mt-0.5">
              testmaster.pro
            </div>
          </div>
        </a>

        <nav className="hidden md:flex items-center gap-7 text-[14px] text-slate-700">
          <a href="/writing-practice" className="hover:text-slate-900">
            Writing
          </a>
          <a href="/speaking-practice" className="hover:text-slate-900">
            Speaking
          </a>
          <a href="/question-bank/reading/practice" className="hover:text-slate-900">
            Reading
          </a>
          <a href="/samples/writing/band-6-5-task2" className="hover:text-slate-900">
            Samples
          </a>
          <a href="/pricing" className="hover:text-slate-900">
            Pricing
          </a>
        </nav>

        <div className="flex items-center gap-2.5">
          <a
            href="#"
            className="hidden sm:inline-flex items-center gap-1.5 text-[14px] text-slate-700 hover:text-slate-900 px-3 py-2 rounded-lg"
          >
            <Globe className="w-4 h-4" />
            EN
          </a>
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
