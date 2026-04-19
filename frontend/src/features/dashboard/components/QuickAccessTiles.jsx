import React from "react";

/**
 * "Elsewhere" quick-access grid — 4-column on desktop. Each item is an icon
 * tile + short label; icon tints rotate through emerald / sky / gold / liz
 * to signal information type (not a gamification palette).
 *
 * items: [{ label, href, icon, tint? ("default"|"sky"|"gold"|"liz") }]
 */
export default function QuickAccessTiles({ items = [], eyebrow = "Elsewhere" }) {
  return (
    <section className="mb-14">
      <div className="label mb-6">{eyebrow}</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-5">
        {items.map((item) => (
          <a
            key={item.label}
            href={item.href || "#"}
            className="elsewhere-item flex items-center gap-3 group"
          >
            <div className={`icon-tile ${item.tint && item.tint !== "default" ? item.tint : ""}`}>
              {item.icon}
            </div>
            <span
              className="text-[14px] font-medium"
              onMouseEnter={(e) => (e.currentTarget.style.color = "hsl(var(--primary-ink))")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "")}
            >
              {item.label}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

/** Icon set lifted from the prototype — SF-Symbols-style line icons. */
export const QuickAccessIcons = {
  BeginnerCourse: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 14l9-5-9-5-9 5 9 5z" />
      <path d="M12 14l6.16-3.422A12 12 0 0 1 19 15.5V17" />
      <path d="M6 12.5V17c0 1.657 2.686 3 6 3s6-1.343 6-3v-4.5" />
    </svg>
  ),
  Trophy: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  ),
  Zap: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  ),
  Settings: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  SearchPlus: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
      <path d="M11 8v6M8 11h6" />
    </svg>
  ),
  Book: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
      <path d="M8 7h8M8 11h5" />
    </svg>
  ),
  Brackets: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7V5a2 2 0 0 1 2-2h2M4 17v2a2 2 0 0 0 2 2h2M20 7V5a2 2 0 0 0-2-2h-2M20 17v2a2 2 0 0 1-2 2h-2M9 12h6M12 8v8" />
    </svg>
  ),
  Mic: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0M12 19v3" />
    </svg>
  ),
};

/** Default 8-item set matching the design handoff. */
export const DEFAULT_QUICK_ACCESS = [
  { label: "Beginner Course", href: "/beginner-course",       tint: "default", icon: QuickAccessIcons.BeginnerCourse },
  { label: "Mastery Course",  href: "/mastery-course",        tint: "gold",    icon: QuickAccessIcons.Trophy },
  { label: "Advanced",        href: "/advanced-mastery",      tint: "default", icon: QuickAccessIcons.Zap },
  { label: "Learning Tools",  href: "/learning-tools",        tint: "sky",     icon: QuickAccessIcons.Settings },
  { label: "Question Bank",   href: "/question-bank",         tint: "default", icon: QuickAccessIcons.SearchPlus },
  { label: "Vocabulary",      href: "/vocab-grammar",         tint: "liz",     icon: QuickAccessIcons.Book },
  { label: "Grammar",         href: "/vocab-grammar",         tint: "sky",     icon: QuickAccessIcons.Brackets },
  { label: "Speaking Topics", href: "/question-bank/speaking",tint: "gold",    icon: QuickAccessIcons.Mic },
];
