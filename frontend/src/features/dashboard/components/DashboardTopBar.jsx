import React, { useEffect, useRef, useState } from "react";
import ThemeToggle from "../../../components/ThemeToggle";
import LanguageSwitcher from "../../../components/LanguageSwitcher";
import BrandLogo from "../../../components/BrandLogo";
import ProductSwitcher from "../../../components/ProductSwitcher";
import { isAdminUser } from "../../../lib/planAccess";

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
  theme = "light",
  onThemeChange,
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
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 h-[68px] flex items-center justify-between">
        {/* Brand + section nav live in the left sidebar on desktop (≥ lg); hide
            them here to avoid a duplicate brand/nav. Tools stay on the right. */}
        <div className="flex items-center gap-10 lg:hidden">
          <BrandLogo size="sm" href="/dashboard" />
          <nav className="desktop-nav items-center gap-6 flex">
            <NavLink href="/dashboard" active={activeSection === "dashboard"}>
              Dashboard
            </NavLink>
            <NavDropdown
              label="Practice"
              active={activeSection === "practice"}
              items={[
                { label: "Listening", hint: "Section drills + audio", href: "/question-bank/listening" },
                { label: "Reading", hint: "Passage drills by type", href: "/question-bank/reading" },
                { label: "Writing", hint: "Task 1 + Task 2", href: "/question-bank/writing" },
                { label: "Speaking", hint: "Parts 1–3 with Liz", href: "/question-bank/speaking" },
                { label: "All practice", hint: "Browse the question bank", href: "/question-bank" },
              ]}
            />
            <NavDropdown
              label="Full tests"
              active={activeSection === "full-tests"}
              items={[
                {
                  label: "Cambridge full mocks",
                  hint: "Real past papers · full timing",
                  href: "/question-bank?fulltests=cambridge",
                },
                {
                  label: "AI fresh mocks",
                  hint: "New prompts · weak-skill calibrated",
                  href: "/question-bank?fulltests=ai",
                },
              ]}
            />
            <NavDropdown
              label="Courses"
              active={activeSection === "courses"}
              items={[
                { label: "Beginner", hint: "Band 2.0–4.5", href: "/beginner-course" },
                { label: "Mastery", hint: "Band 4.5–6.5", href: "/mastery-course" },
                { label: "Advanced", hint: "Band 6.5–9.0", href: "/advanced-mastery" },
                { label: "All courses", hint: "Browse the catalogue", href: "/courses" },
              ]}
            />
            <NavDropdown
              label="Tools"
              active={activeSection === "tools"}
              items={[
                { label: "Strategies", hint: "Tips per skill", href: "/tips" },
                { label: "Vocabulary", hint: "Topical word lists", href: "/vocabulary" },
                { label: "Grammar", hint: "Targeted refreshers", href: "/grammar" },
              ]}
            />
            <NavLink href="/liz" active={activeSection === "liz"}>
              Liz
            </NavLink>
            <NavLink href="/progress" active={activeSection === "progress"}>
              Progress
            </NavLink>
            <NavLink href="/pricing" active={activeSection === "pricing"}>
              Pricing
            </NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {isAdminUser(user) && (
            <ProductSwitcher
              user={user}
              to="general"
              className="hidden md:inline-flex items-center px-3 py-1.5 rounded-full text-[13px] font-medium text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 transition-colors"
            >
              ⇄ General English
            </ProductSwitcher>
          )}
          <LanguageSwitcher iconOnly />
          <ThemeToggle className="hidden md:inline-flex" />
          {/* Notifications bell removed — the feature doesn't exist yet and a
              dead button looks broken. Add back as a dropdown or /notifications
              route when the feature ships. */}
          <button
            type="button"
            aria-label="Menu"
            onClick={onOpenMenu}
            className="md:hidden p-2 rounded-lg hover:bg-black/5"
          >
            <MenuIcon />
          </button>
          {/* Avatar chip → profile. Previously a bare <button> with no onClick,
              so clicking did nothing ("tepki vermiyor"). Anchor keeps native
              nav + middle-click + right-click "Open in new tab" behavior. */}
          <a
            href="/profile"
            className="hidden md:flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-full hover:bg-black/5 no-underline"
            aria-label="Open profile"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-medium"
              style={{
                background: "hsl(var(--sky) / 0.15)",
                color: "hsl(var(--sky))",
                border: "1px solid hsl(var(--sky) / .3)",
              }}
            >
              {user?.initials || (user?.firstName?.[0] || user?.name?.[0] || "S").toUpperCase()}
            </div>
            <span className="text-sm font-medium">{user?.firstName || user?.name?.split(' ')[0] || "Student"}</span>
          </a>
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

function NavDropdown({ label, active, items = [] }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  // Close when clicking outside or pressing Escape.
  useEffect(() => {
    if (!open) return;
    function onDoc(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        className={`nav-link ${active ? "active" : "muted"} flex items-center gap-1`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {label}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transition: "transform .18s ease",
            transform: open ? "rotate(180deg)" : "none",
          }}
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute left-0 mt-3 z-50"
          style={{
            minWidth: 280,
            padding: 8,
            borderRadius: 16,
            background: "hsl(var(--bg) / .92)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            border: "1px solid hsl(var(--rule))",
            boxShadow:
              "0 14px 40px -12px rgba(31,42,55,0.22), inset 0 1px 0 rgba(255,255,255,0.6)",
          }}
        >
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              role="menuitem"
              className="block px-3 py-2.5 rounded-xl no-underline transition-colors"
              style={{ color: "hsl(var(--fg))" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "hsl(var(--fg) / 0.04)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <div className="font-display text-[15px] leading-tight">
                {item.label}
              </div>
              {item.hint && (
                <div className="text-xs text-muted mt-0.5">{item.hint}</div>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function ThemeSegmented({ theme, onChange }) {
  // Keys match THEME_MODES in contexts/ThemeContext.js so the same selection
  // travels across every page that consumes useTheme().
  const options = [
    { key: "light",       label: "Light", icon: SunIcon },
    { key: "dark",        label: "Dark",  icon: MoonIcon },
    { key: "night-shift", label: "Night", icon: SepiaIcon },
    { key: "auto",        label: "Auto",  icon: AutoIcon },
  ];
  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="hidden md:inline-flex items-center"
      style={{
        padding: 3,
        borderRadius: 999,
        background: "hsl(var(--surface) / .6)",
        border: "1px solid hsl(var(--rule))",
        backdropFilter: "blur(14px) saturate(180%)",
        WebkitBackdropFilter: "blur(14px) saturate(180%)",
      }}
    >
      {options.map((o) => {
        const on = theme === o.key;
        const Icon = o.icon;
        return (
          <button
            key={o.key}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={o.label}
            title={o.label}
            onClick={() => onChange(o.key)}
            className="flex items-center justify-center"
            style={{
              width: 28,
              height: 28,
              borderRadius: 999,
              border: "none",
              background: on ? "hsl(var(--primary) / .15)" : "transparent",
              color: on ? "hsl(var(--primary-ink))" : "hsl(var(--muted-fg))",
              transition: "background-color .15s ease, color .15s ease",
            }}
          >
            <Icon />
          </button>
        );
      })}
    </div>
  );
}

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
    </svg>
  );
}

function SepiaIcon() {
  // "Night" / sepia — a warm reading-mode glyph (book-like)
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z" />
      <path d="M4 19.5V21h16" />
    </svg>
  );
}

function AutoIcon() {
  // Clock-style glyph for auto / time-based theme.
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
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
