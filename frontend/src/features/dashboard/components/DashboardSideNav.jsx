import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutGrid, PenLine, ClipboardCheck, BookOpen, Type, Lightbulb,
  Sparkles, TrendingUp, CreditCard, Settings, BookA,
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
      { label: "Practice", href: "/question-bank", icon: PenLine, match: ["/question-bank"] },
      { label: "Full tests", href: "/question-bank?fulltests=cambridge", icon: ClipboardCheck, match: ["/full-test", "/cambridge"] },
      { label: "Courses", href: "/courses", icon: BookOpen, match: ["/courses", "/beginner-course", "/mastery-course", "/advanced-mastery"] },
    ],
  },
  {
    title: "Prepare",
    items: [
      { label: "Vocabulary", href: "/vocabulary", icon: BookA, match: ["/vocabulary"] },
      { label: "Grammar", href: "/grammar", icon: Type, match: ["/grammar"] },
      { label: "Strategies", href: "/tips", icon: Lightbulb, match: ["/tips"] },
      { label: "Liz · coach", href: "/liz", icon: Sparkles, match: ["/liz"], badge: "Live" },
    ],
  },
  {
    title: "You",
    items: [
      { label: "Progress", href: "/progress", icon: TrendingUp, match: ["/progress"] },
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
  const initial = (user?.firstName || user?.first_name || user?.name || "U").trim().charAt(0).toUpperCase();

  return (
    <aside
      className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-[264px] z-40 px-4 py-5 border-r hairline"
      style={{
        background: "linear-gradient(180deg, hsl(var(--surface) / .92), hsl(var(--bg) / .92))",
        backdropFilter: "blur(20px) saturate(160%)",
        WebkitBackdropFilter: "blur(20px) saturate(160%)",
      }}
    >
      <Link to="/dashboard" className="flex items-center gap-3 px-2 pb-4 mb-3 border-b hairline no-underline">
        <span
          className="w-10 h-10 rounded-xl grid place-items-center text-white font-extrabold text-sm shrink-0"
          style={{ background: "linear-gradient(140deg, hsl(var(--primary)), hsl(var(--primary-ink)))" }}
        >
          IA
        </span>
        <span className="leading-tight">
          <span className="block text-[15px] font-extrabold" style={{ color: "hsl(var(--fg))" }}>IELTS Ace</span>
          <span className="block text-[11px] font-semibold" style={{ color: "hsl(var(--primary-ink))" }}>by testmaster.pro</span>
        </span>
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
              const active = isActive(it.match);
              return (
                <Link
                  key={it.label}
                  to={it.href}
                  className="relative flex items-center gap-3 h-[42px] px-3 rounded-xl text-[14.5px] font-semibold no-underline transition-colors"
                  style={{
                    color: active ? "hsl(var(--primary-ink))" : "hsl(215 20% 42%)",
                    background: active ? "hsl(var(--primary) / .12)" : "transparent",
                  }}
                >
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
