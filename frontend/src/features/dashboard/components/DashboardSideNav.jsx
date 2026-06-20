import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
// The rail is now rendered globally (App.js) on every app page, but its colours
// + logo gradient read .dashboard-scope CSS variables that live in dashboard.css.
// That file used to load only on DashboardLayout pages, so on other pages
// (Liz, Question Bank, etc.) the vars were undefined and the logo tile rendered
// blank. Importing it here ships the scope tokens wherever the rail loads.
// (All rules are scoped under .dashboard-scope, so this can't leak elsewhere.)
import "../dashboard.css";
import BrandLogo from "../../../components/BrandLogo";
import {
  LayoutGrid, PenLine, ClipboardCheck, BookOpen, Type, Lightbulb,
  Sparkles, TrendingUp, CreditCard, Settings, BookA, ChevronRight, Mic, ClipboardList,
} from "lucide-react";

/**
 * Persistent left navigation rail for the authenticated dashboard shell
 * (desktop ≥ lg only; below lg the existing DashboardBottomNav / mobile drawer
 * take over). Mirrors the section set of DashboardTopBar so navigation is the
 * same everywhere, but always-visible instead of hidden behind dropdowns —
 * this is what fills the previously-empty left gutter the user flagged.
 *
 * Styling rides the dashboard-scope CSS variables (theme-aware: light / dark /
 * night), so it recolours automatically with the user's theme.
 */
const GROUPS = [
  {
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutGrid, match: ["/dashboard"] },
      {
        label: "Practice", icon: PenLine, match: ["/question-bank"],
        children: [
          { label: "Listening", href: "/question-bank/listening", match: ["/question-bank/listening"] },
          { label: "Reading", href: "/question-bank/reading", match: ["/question-bank/reading"] },
          { label: "Writing", href: "/question-bank/writing", match: ["/question-bank/writing"] },
          { label: "Speaking", href: "/question-bank/speaking", match: ["/question-bank/speaking"] },
          { label: "All practice", href: "/question-bank", match: ["/question-bank"] },
        ],
      },
      { label: "Full tests", href: "/question-bank?fulltests=cambridge", icon: ClipboardCheck, match: ["/full-test", "/cambridge"] },
      {
        label: "Courses", icon: BookOpen, match: ["/courses", "/beginner-course", "/mastery-course", "/advanced-mastery"],
        children: [
          { label: "Beginner", href: "/beginner-course", match: ["/beginner-course"] },
          { label: "Mastery", href: "/mastery-course", match: ["/mastery-course"] },
          { label: "Advanced", href: "/advanced-mastery", match: ["/advanced-mastery"] },
          { label: "All courses", href: "/courses", match: ["/courses"] },
        ],
      },
    ],
  },
  {
    title: "Prepare",
    items: [
      { label: "Vocabulary", href: "/vocabulary", icon: BookA, match: ["/vocabulary"] },
      { label: "Grammar", href: "/grammar", icon: Type, match: ["/grammar"] },
      { label: "Strategies", href: "/tips", icon: Lightbulb, match: ["/tips"] },
      { label: "Full Mock Test", href: "/full-mock", icon: Mic, match: ["/full-mock", "/speaking-premium"], badge: "Live" },
      { label: "Liz · coach", href: "/liz", icon: Sparkles, match: ["/liz"], badge: "Live" },
    ],
  },
  {
    title: "You",
    items: [
      { label: "Progress", href: "/progress", icon: TrendingUp, match: ["/progress"] },
      { label: "My results", href: "/my-results", icon: ClipboardList, match: ["/my-results"] },
      { label: "Plans & pricing", href: "/pricing", icon: CreditCard, match: ["/pricing"] },
    ],
  },
];

function planLabel(user) {
  const p = String(user?.plan || "free").toLowerCase();
  return { exam: "Exam plan", monthly: "Monthly plan", weekly: "Weekly plan", custom: "Custom plan" }[p] || "Free plan";
}

export default function DashboardSideNav({ user }) {
  const { pathname } = useLocation();
  const isActive = (m) => m.some((p) => pathname === p || pathname.startsWith(p + "/"));
  const childActive = (it) => Array.isArray(it.children) && it.children.some((c) => isActive(c.match));
  const initial = (user?.firstName || user?.first_name || user?.name || "U").trim().charAt(0).toUpperCase();

  // Expandable parents (Practice / Courses) start open when one of their
  // children is the current route; the user can toggle from there.
  const [open, setOpen] = useState(() => {
    const o = {};
    GROUPS.forEach((g) => g.items.forEach((it) => {
      if (it.children && childActive(it)) o[it.label] = true;
    }));
    return o;
  });
  const toggle = (label) => setOpen((o) => ({ ...o, [label]: !o[label] }));

  return (
    <aside
      className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-[264px] z-40 px-4 py-5 border-r hairline"
      style={{
        background: "linear-gradient(180deg, hsl(var(--surface) / .92), hsl(var(--bg) / .92))",
        backdropFilter: "blur(20px) saturate(160%)",
        WebkitBackdropFilter: "blur(20px) saturate(160%)",
      }}
    >
      {/* Real brand lockup (the actual /brand logo mark + wordmark), shared with
          every other nav via BrandLogo — replaces the old placeholder "IA" tile. */}
      <Link to="/dashboard" className="block px-2 pb-4 mb-3 border-b hairline no-underline" style={{ color: "hsl(var(--fg))" }}>
        <BrandLogo size="md" href={null} />
      </Link>

      <nav className="flex-1 overflow-y-auto -mx-1 px-1 space-y-0.5">
        {GROUPS.map((g, gi) => (
          <div key={gi} className={gi > 0 ? "mt-3" : ""}>
            {g.title && (
              <div className="px-3 pt-2 pb-1 text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: "hsl(var(--muted-fg))" }}>
                {g.title}
              </div>
            )}
            {g.items.map((it) => {
              const Icon = it.icon;
              const rowStyle = (active) => ({
                color: active ? "hsl(var(--primary-ink))" : "hsl(215 20% 42%)",
                background: active ? "hsl(var(--primary) / .12)" : "transparent",
              });
              const rowCls = "relative flex items-center gap-3 h-[42px] px-3 rounded-xl text-[14.5px] font-semibold no-underline transition-colors w-full text-left";

              // Expandable parent (Practice / Courses)
              if (it.children) {
                const expanded = !!open[it.label];
                const parentActive = childActive(it);
                return (
                  <div key={it.label}>
                    <button type="button" onClick={() => toggle(it.label)} className={rowCls} style={rowStyle(parentActive && !expanded)}>
                      <Icon className="w-[18px] h-[18px] shrink-0" />
                      <span className="truncate">{it.label}</span>
                      <ChevronRight className="w-4 h-4 ml-auto shrink-0 transition-transform" style={{ transform: expanded ? "rotate(90deg)" : "none", color: "hsl(var(--muted-fg))" }} />
                    </button>
                    {expanded && (
                      <div className="ml-[23px] pl-3 mt-0.5 mb-1 space-y-px border-l" style={{ borderColor: "hsl(var(--rule) / .7)" }}>
                        {it.children.map((c) => {
                          const ca = isActive(c.match);
                          return (
                            <Link key={c.label} to={c.href} className="flex items-center h-[34px] px-3 rounded-lg text-[13.5px] no-underline transition-colors"
                              style={{ color: ca ? "hsl(var(--primary-ink))" : "hsl(215 18% 46%)", background: ca ? "hsl(var(--primary) / .1)" : "transparent", fontWeight: ca ? 600 : 500 }}>
                              <span className="truncate">{c.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              // Plain link
              const active = isActive(it.match);
              return (
                <Link key={it.label} to={it.href} className={rowCls} style={rowStyle(active)}>
                  {active && (
                    <span className="absolute -left-4 top-[11px] bottom-[11px] w-[3px] rounded-r" style={{ background: "hsl(var(--primary))" }} />
                  )}
                  <Icon className="w-[18px] h-[18px] shrink-0" />
                  <span className="truncate">{it.label}</span>
                  {it.badge && (
                    <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: "hsl(var(--gold-ink))", background: "hsl(var(--gold) / .2)" }}>
                      {it.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <Link
        to="/profile"
        className="flex items-center gap-3 mt-2 p-2.5 rounded-2xl no-underline border hairline"
        style={{ background: "hsl(var(--bg) / .8)" }}
      >
        <span
          className="w-9 h-9 rounded-full grid place-items-center text-white font-bold shrink-0"
          style={{ background: "linear-gradient(140deg, hsl(var(--sky)), hsl(var(--primary)))" }}
        >
          {initial}
        </span>
        <span className="leading-tight min-w-0">
          <span className="block text-[13px] font-bold truncate" style={{ color: "hsl(var(--fg))" }}>
            {user?.firstName || user?.first_name || user?.name || "Your account"}
          </span>
          <span className="block text-[11.5px]" style={{ color: "hsl(var(--primary-ink))" }}>{planLabel(user)}</span>
        </span>
        <Settings className="w-4 h-4 ml-auto shrink-0" style={{ color: "hsl(var(--muted-fg))" }} />
      </Link>
    </aside>
  );
}
