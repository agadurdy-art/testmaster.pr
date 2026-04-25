import React from "react";
import { useNavigate } from "react-router-dom";

// Tab key -> route. Keep in sync with App.js routes. If a parent supplies its
// own `onNavigate`, we prefer that — otherwise fall back to this map so taps
// always go somewhere on mobile.
const ROUTE_MAP = {
  home: "/dashboard",
  practice: "/question-bank",
  liz: "/liz",
  courses: "/courses",
  profile: "/profile",
};

/**
 * Fixed mobile bottom nav. Hidden above 768px via the .dashboard-bottom-nav
 * visibility rule in dashboard.css. The center "Liz" button is raised and
 * filled with the primary color — it's the one-tap coach entry point.
 */
export default function DashboardBottomNav({ active = "home", onNavigate }) {
  const navigate = useNavigate();
  const go = (key) => {
    if (onNavigate) {
      onNavigate(key);
      return;
    }
    const target = ROUTE_MAP[key];
    if (target) navigate(target);
  };
  return (
    <nav
      className="dashboard-bottom-nav fixed bottom-0 left-0 right-0 z-40 border-t hairline"
      style={{
        background: "hsl(var(--surface) / .72)",
        backdropFilter: "blur(28px) saturate(180%)",
        WebkitBackdropFilter: "blur(28px) saturate(180%)",
      }}
    >
      <div className="flex items-end justify-around max-w-[520px] mx-auto px-2 pb-2 pt-1.5 relative">
        <BottomItem
          label="Home"
          active={active === "home"}
          onClick={() => go("home")}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <path d="M9 22V12h6v10" />
            </svg>
          }
        />
        <BottomItem
          label="Practice"
          active={active === "practice"}
          onClick={() => go("practice")}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4z" />
            </svg>
          }
        />
        <button
          type="button"
          onClick={() => go("liz")}
          className="relative -mt-5 w-14 h-14 rounded-full flex items-center justify-center text-white"
          style={{ background: "hsl(var(--primary))" }}
          aria-label="Ask Liz"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
        <BottomItem
          label="Courses"
          active={active === "courses"}
          onClick={() => go("courses")}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            </svg>
          }
        />
        <BottomItem
          label="Profile"
          active={active === "profile"}
          onClick={() => go("profile")}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21a8 8 0 0 1 16 0" />
            </svg>
          }
        />
      </div>
    </nav>
  );
}

function BottomItem({ label, icon, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-0.5 py-2 px-3"
      style={{ color: active ? "hsl(var(--primary-ink))" : "hsl(var(--muted-fg))" }}
    >
      {icon}
      <span className={`text-[10px] ${active ? "font-medium" : ""} mt-0.5`}>{label}</span>
    </button>
  );
}
