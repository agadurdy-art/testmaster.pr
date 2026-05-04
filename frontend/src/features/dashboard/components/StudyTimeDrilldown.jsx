/**
 * StudyTimeDrilldown
 * ------------------
 * Modal that opens when the user clicks the StreakDial. Shows:
 *   - Total minutes for the chosen scope (today / week)
 *   - Per-category breakdown (Tests / Practice / Courses / Liz / Tools / ...)
 *   - Top 5 routes the user spent time on
 *
 * Data comes from GET /api/study-time/summary?user_id=...&scope=...
 */
import React, { useEffect, useState } from "react";
import api from "../../../lib/api";

const ROUTE_LABEL_OVERRIDES = {
  "/dashboard": "Dashboard",
  "/profile": "Profile",
  "/progress": "Progress",
  "/liz": "Liz tutor",
  "/question-bank": "Question Bank",
  "/question-bank/listening": "Listening practice",
  "/question-bank/reading": "Reading practice",
  "/question-bank/writing": "Writing practice",
  "/question-bank/speaking": "Speaking practice",
  "/full-test": "Full mocks",
  "/courses": "Courses",
  "/speaking-premium": "Liz Live",
  "/score-my-essay": "Essay scorer",
  "/score-my-speaking": "Speaking scorer",
};

function labelForRoute(route) {
  if (!route) return "—";
  if (ROUTE_LABEL_OVERRIDES[route]) return ROUTE_LABEL_OVERRIDES[route];
  // Cambridge tests have IDs in the path → collapse to a friendlier name.
  if (route.startsWith("/cambridge-test/")) return "Cambridge test";
  if (route.startsWith("/full-test/")) return "Full mock";
  if (route.startsWith("/lesson/")) return "Lesson";
  if (route.startsWith("/course/")) return "Course chapter";
  if (route.startsWith("/question-bank/")) {
    return "QB · " + route.split("/").slice(2).join(" / ");
  }
  return route;
}

function fmt(mins) {
  const m = Math.max(0, Math.round(mins || 0));
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h && r) return `${h}h ${r}m`;
  if (h) return `${h}h`;
  return `${r}m`;
}

export default function StudyTimeDrilldown({ userId, open, onClose }) {
  const [scope, setScope] = useState("week");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !userId) return;
    let cancelled = false;
    setLoading(true);
    api
      .get("/study-time/summary", { params: { user_id: userId, scope } })
      .then((resp) => {
        if (!cancelled) setData(resp.data);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, userId, scope]);

  // ESC closes.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const total = data?.total_minutes ?? 0;
  const byCat = data?.by_category || {};
  const catEntries = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
  const topRoutes = data?.top_routes || [];
  const maxCatMins = catEntries.reduce((acc, [, m]) => Math.max(acc, m), 0) || 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Study time breakdown"
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "rgba(15, 23, 42, 0.45)", backdropFilter: "blur(2px)" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
      >
        <header className="px-6 pt-6 pb-3 flex items-start justify-between gap-3 border-b border-gray-100">
          <div>
            <div className="text-[11px] font-semibold tracking-[0.18em] text-gray-500">
              STUDY TIME
            </div>
            <div className="font-display text-3xl font-semibold mt-0.5">
              {loading ? "…" : fmt(total)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {scope === "today" ? "Today" : "This week (Mon → now)"}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setScope("today")}
              className={`text-xs px-2.5 py-1 rounded-full border ${
                scope === "today"
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-700 border-gray-300"
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setScope("week")}
              className={`text-xs px-2.5 py-1 rounded-full border ${
                scope === "week"
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-700 border-gray-300"
              }`}
            >
              Week
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="ml-2 w-8 h-8 rounded-full hover:bg-gray-100 text-gray-500"
            >
              ×
            </button>
          </div>
        </header>

        <section className="px-6 py-5">
          <h3 className="text-[11px] font-semibold tracking-[0.18em] text-gray-500 mb-3">
            BY CATEGORY
          </h3>
          {catEntries.length === 0 ? (
            <p className="text-sm text-gray-500">
              {loading ? "Loading…" : "No tracked time yet — open a few practice pages and check back."}
            </p>
          ) : (
            <ul className="space-y-2.5">
              {catEntries.map(([cat, mins]) => (
                <li key={cat}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-900">{cat}</span>
                    <span className="text-gray-600 tabular-nums">{fmt(mins)}</span>
                  </div>
                  <div className="h-1.5 mt-1 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.max(2, (mins / maxCatMins) * 100)}%`,
                        background: categoryTone(cat),
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {topRoutes.length > 0 && (
          <section className="px-6 pb-6">
            <h3 className="text-[11px] font-semibold tracking-[0.18em] text-gray-500 mb-3">
              TOP PAGES
            </h3>
            <ul className="space-y-1.5">
              {topRoutes.map((r) => (
                <li
                  key={r.route}
                  className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50 last:border-b-0"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <div className="font-medium text-gray-900 truncate">
                      {labelForRoute(r.route)}
                    </div>
                    <div className="text-[11px] text-gray-500 truncate">{r.route}</div>
                  </div>
                  <div className="text-gray-700 tabular-nums">{fmt(r.minutes)}</div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}

function categoryTone(cat) {
  switch (cat) {
    case "Tests":
      return "hsl(var(--gold-ink, 38 70% 45%))";
    case "Practice":
      return "hsl(var(--sky, 200 80% 55%))";
    case "Courses":
      return "hsl(var(--primary, 158 60% 45%))";
    case "Liz":
      return "hsl(var(--liz, 280 60% 55%))";
    case "Tools":
      return "hsl(220 10% 50%)";
    case "Review":
      return "hsl(280 50% 55%)";
    case "Browsing":
      return "hsl(200 10% 60%)";
    default:
      return "hsl(220 10% 60%)";
  }
}
