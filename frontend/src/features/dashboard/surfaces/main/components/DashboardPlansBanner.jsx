// Extracted verbatim from pages/DashboardPage.js (Faz1 refactor).
import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { PlanCards } from "../../../../pricing";
import Arrow from "./Arrow";

// ──────────────────────────────────────────────────────────────────────────
// DashboardPlansBanner
//
// Slim collapsed strip that shows the user's current plan and lets them
// expand the live PlanCards grid in place — same component the /pricing
// page renders, wrapped in .pricing-scope so the design-system tokens
// stay isolated from the Dashboard theme. A "See full pricing" link
// jumps to /pricing for the complete page (FAQ, slider, compare table).
//
// Accordion is closed by default to keep the dashboard quiet for paid
// users; one click expands it for upgrade browsing without a full
// page navigation.
// ──────────────────────────────────────────────────────────────────────────
// Mirrors AppShellNav.planLabel + Profile.js — V1 GE plan IDs map to the
// closest V2 IELTS Ace tier so the badge stays V2-pure across the surface.
const LEGACY_PLAN_ALIAS_DASH = {
  explorer: "free",
  learner: "weekly",
  achiever: "monthly",
  master: "monthly",
  pro: "monthly",
};
const PLAN_LABEL_DASH = {
  free: "Free",
  weekly: "Weekly",
  monthly: "Monthly",
  exam: "Exam Pack",
  exam_pack: "Exam Pack",
  custom: "Custom",
};

export default function DashboardPlansBanner({ user }) {
  const [open, setOpen] = useState(false);
  const rawPlan = (user?.plan || "free").toLowerCase();
  const planKey = LEGACY_PLAN_ALIAS_DASH[rawPlan] || rawPlan;
  const planLabel = PLAN_LABEL_DASH[planKey] || planKey;

  return (
    <section className="mb-14 md:mb-20" aria-label="Plans">
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full px-5 py-4 flex items-center justify-between gap-4 hover:bg-gray-50 transition"
          aria-expanded={open}
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-[10px] uppercase tracking-wide font-bold text-gray-500">
              Current plan
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-sky-100 to-indigo-100 text-indigo-800 border border-indigo-200">
              {planLabel}
            </span>
            <span className="hidden sm:inline text-xs text-gray-500 truncate">
              · Compare plans or upgrade without leaving this page
            </span>
          </div>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 flex-shrink-0">
            {open ? "Hide plans" : "View plans"}
            {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        </button>

        {open && (
          <div className="border-t border-gray-100 bg-gradient-to-b from-gray-50/60 to-white">
            {/* pricing-scope keeps the design-system tokens local to the cards */}
            <div className="pricing-scope px-2 sm:px-4 py-4">
              <PlanCards user={user} />
            </div>
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-end">
              <a
                href="/pricing"
                className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 inline-flex items-center gap-1"
              >
                See full pricing page
                <Arrow small />
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
