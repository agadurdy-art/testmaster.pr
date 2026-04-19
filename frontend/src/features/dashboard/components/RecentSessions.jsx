import React from "react";

/**
 * "The last three sessions." — editorial table of recent practice.
 * sessions: [{ title, subtitle, band }]
 */
export default function RecentSessions({
  sessions = [],
  eyebrow = "Recent",
  title = "The last three sessions.",
  viewAllHref = "#",
}) {
  return (
    <div>
      <div className="flex items-end justify-between mb-7">
        <div>
          <div className="label mb-3">{eyebrow}</div>
          <h2 className="display-l text-[30px] md:text-[36px]">{title}</h2>
        </div>
        <a
          href={viewAllHref}
          className="text-sm text-muted hover:text-fg underline underline-offset-4 shrink-0"
          style={{ textDecorationColor: "hsl(var(--rule))" }}
        >
          View all
        </a>
      </div>
      <ul
        className="divide-y border-t border-b hairline"
        style={{ borderColor: "hsl(var(--rule))" }}
      >
        {sessions.map((s, i) => (
          <li key={i} className="grid grid-cols-[1fr_auto] items-center gap-6 py-5 px-1">
            <div>
              <div className="font-display text-[19px]">{s.title}</div>
              <div className="text-sm text-muted mt-1">{s.subtitle}</div>
            </div>
            <div className="text-right tabular-nums">
              <div className="font-display text-[24px]">{s.band.toFixed(1)}</div>
              <div className="label text-[10px] mt-0.5">band</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
