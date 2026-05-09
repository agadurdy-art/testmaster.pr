import React from "react";
import { cn } from "../../../lib/utils";

/**
 * Footer for public-facing pages. Four columns that collapse on mobile.
 */
export default function PublicFooter({ className }) {
  return (
    <footer
      className={cn(
        "print:hidden border-t border-slate-200/70 bg-white",
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-10 grid md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-8 text-[13.5px]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="relative w-8 h-8 rounded-lg bg-emerald-600 grid place-items-center">
              <span
                className="font-bold text-white text-lg leading-none"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                A
              </span>
            </span>
            <div
              className="font-bold"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              IELTS Ace
            </div>
          </div>
          <p className="mt-3 text-slate-500 max-w-xs leading-relaxed">
            AI-powered IELTS prep, mentored by a real teacher. Built for
            students across Vietnam &amp; South-East Asia.
          </p>
        </div>
        <div>
          <div className="font-semibold mb-2">Practice</div>
          <ul className="space-y-1.5 text-slate-500">
            <li><a className="hover:text-slate-900" href="/score-my-essay">Try writing</a></li>
            <li><a className="hover:text-slate-900" href="/score-my-speaking">Try speaking</a></li>
            <li><a className="hover:text-slate-900" href="/signup?intent=writing&path=ielts">Try your own essay</a></li>
            <li><a className="hover:text-slate-900" href="/signup">Start free</a></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-2">Samples</div>
          <ul className="space-y-1.5 text-slate-500">
            <li><a className="hover:text-slate-900" href="/#samples">All samples</a></li>
            <li><a className="hover:text-slate-900" href="/samples/reading/band-6-0-academic.html">Reading sample</a></li>
            <li><a className="hover:text-slate-900" href="/samples/listening/band-5-5-listening.html">Listening sample</a></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-2">Company</div>
          <ul className="space-y-1.5 text-slate-500">
            <li><a className="hover:text-slate-900" href="/pricing">Pricing</a></li>
            <li><a className="hover:text-slate-900" href="/contact">Contact</a></li>
            <li><a className="hover:text-slate-900" href="/privacy">Privacy</a></li>
            <li><a className="hover:text-slate-900" href="/share-your-story">Share your story</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-200/70">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-5 text-[12px] text-slate-500 flex flex-wrap gap-3 justify-between">
          <span>© 2026 IELTS Ace · testmaster.pro</span>
          <span>
            Not affiliated with Cambridge Assessment, IDP, or the British Council.
          </span>
        </div>
      </div>
    </footer>
  );
}
