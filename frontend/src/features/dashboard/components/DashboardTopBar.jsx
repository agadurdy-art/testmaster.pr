import React from "react";

/**
 * Sticky top bar for the authenticated dashboard.
 * Uses the dashboard-scope glass styling; desktop only — mobile users see the
 * DashboardBottomNav instead (this bar still renders, with the hamburger
 * toggle visible).
 */
export default function DashboardTopBar({
  activeSection = "dashboard",
  user,
  onOpenMenu,
  onOpenNotifications,
}) {
  return (
    <header
      className="sticky top-0 z-40 border-b hairline"
      style={{
        background: "hsl(var(--bg) / .7)",
        backdropFilter: "blur(24px) saturate(160%)",
        WebkitBackdropFilter: "blur(24px) saturate(160%)",
      }}
    >
      <div className="max-w-[1160px] mx-auto px-6 md:px-10 h-[68px] flex items-center justify-between">
        <div className="flex items-center gap-10">
          <a href="/dashboard" className="flex items-center gap-2.5">
            <div className="logomark" aria-hidden="true">
              <img src="/brand/ielts-ace-logo.jpg" alt="IELTS Ace" />
            </div>
            <div className="leading-tight">
              <div className="font-display text-[17px] font-semibold tracking-tight">
                IELTS Ace
              </div>
            </div>
          </a>
          <nav className="desktop-nav items-center gap-8 flex">
            <NavLink href="/dashboard" active={activeSection === "dashboard"}>
              Dashboard
            </NavLink>
            <NavLink href="/question-bank" active={activeSection === "practice"}>
              Practice
            </NavLink>
            <NavLink href="/courses" active={activeSection === "courses"}>
              Courses
            </NavLink>
            <NavLink href="/liz" active={activeSection === "liz"}>
              Liz
            </NavLink>
            <NavLink href="/progress" active={activeSection === "progress"}>
              Progress
            </NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label="Notifications"
            onClick={onOpenNotifications}
            className="p-2 rounded-lg hover:bg-black/5 text-muted"
          >
            <BellIcon />
          </button>
          <button
            type="button"
            aria-label="Menu"
            onClick={onOpenMenu}
            className="md:hidden p-2 rounded-lg hover:bg-black/5"
          >
            <MenuIcon />
          </button>
          <button
            type="button"
            className="hidden md:flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-full hover:bg-black/5"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-medium"
              style={{
                background: "hsl(var(--sky) / 0.15)",
                color: "hsl(var(--sky))",
                border: "1px solid hsl(var(--sky) / .3)",
              }}
            >
              {user?.initials || "AG"}
            </div>
            <span className="text-sm font-medium">{user?.firstName || "Aga"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, active, children }) {
  return (
    <a className={`nav-link ${active ? "active" : "muted"}`} href={href}>
      {children}
    </a>
  );
}

function BellIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}
