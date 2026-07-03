// Extracted verbatim from pages/DashboardPage.js (Faz1 refactor).
import React from "react";

// Week-ring donut — port of Claude Design "Days Circle" handoff.
// Sun→Sat wedges, soft pastel fills, today gets a bright emerald gradient,
// glass center holds the headline (streak count) on a frosted disc.
const WEEK_DAYS = [
  { name: "Sunday",    abbr: "S", fill: "#FCE8DD" }, // peach
  { name: "Monday",    abbr: "M", fill: "#FBEFD8" }, // apricot
  { name: "Tuesday",   abbr: "T", fill: "#F4F1D9" }, // butter
  { name: "Wednesday", abbr: "W", fill: "#E2F0E3" }, // mint
  { name: "Thursday",  abbr: "T", fill: "#DFEBF1" }, // sky
  { name: "Friday",    abbr: "F", fill: "#E5E3F2" }, // periwinkle
  { name: "Saturday",  abbr: "S", fill: "#EFE4F1" }, // lilac
];

export default function StreakDial({ minutes = 0, empty, onClick }) {
  const safeMins = Math.max(0, Math.round(minutes || 0));
  const hours = Math.floor(safeMins / 60);
  const mins = safeMins % 60;
  // Geometry mirrors the prototype: viewBox 0..100, outer r=46, inner r=36.
  const cx = 50;
  const cy = 50;
  const rOuter = 46;
  const rInner = 36;
  const rMid = (rOuter + rInner) / 2;
  const total = WEEK_DAYS.length;
  const slice = (Math.PI * 2) / total;
  // Start so Sunday's wedge is centred at 12 o'clock.
  const startOffset = -Math.PI / 2 - slice / 2;
  const now = new Date();
  const todayIdx = now.getDay(); // 0=Sun..6=Sat
  const todayName = WEEK_DAYS[todayIdx].name.toUpperCase();
  // ISO week number — same algorithm as the prototype.
  const weekNumber = (() => {
    const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const dayNum = (d.getUTCDay() + 6) % 7;
    d.setUTCDate(d.getUTCDate() - dayNum + 3);
    const firstThu = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
    const diff = (d - firstThu) / 86400000;
    return 1 + Math.round((diff - 3 + ((firstThu.getUTCDay() + 6) % 7)) / 7);
  })();

  const pt = (a, r) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  const wedgePath = (i) => {
    const a0 = startOffset + i * slice;
    const a1 = a0 + slice;
    const [x0, y0] = pt(a0, rOuter + 1);
    const [x1, y1] = pt(a1, rOuter + 1);
    return `M ${cx} ${cy} L ${x0.toFixed(3)} ${y0.toFixed(3)} A ${rOuter + 1} ${rOuter + 1} 0 0 1 ${x1.toFixed(3)} ${y1.toFixed(3)} Z`;
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={empty ? "Begin a streak" : `${hours}h ${mins}m studied this week — ${WEEK_DAYS[todayIdx].name}`}
      className="mx-auto md:mx-0 hover:-translate-y-0.5 transition-transform"
      style={{
        width: "100%",
        maxWidth: 240,
        background:
          "linear-gradient(180deg, hsl(var(--surface) / .55) 0%, hsl(var(--surface) / .25) 100%)",
        border: "none",
        borderRadius: 22,
        padding: "14px 14px 12px",
        display: "block",
        textAlign: "left",
      }}
    >
      <div style={{ position: "relative", width: "100%", aspectRatio: "1 / 1" }}>
      <svg
        viewBox="0 0 100 100"
        width="100%"
        height="100%"
        style={{
          display: "block",
          overflow: "visible",
          filter:
            "drop-shadow(0 18px 30px rgba(31,42,55,0.10)) drop-shadow(0 2px 6px rgba(31,42,55,0.06))",
        }}
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="streakRingGloss" cx="50%" cy="38%" r="60%">
            <stop offset="0%" stopColor="white" stopOpacity="0.55" />
            <stop offset="55%" stopColor="white" stopOpacity="0.05" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="streakTodayFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1FC998" />
            <stop offset="100%" stopColor="#0E8C6D" />
          </linearGradient>
          <mask id="streakRingMask">
            <rect width="100" height="100" fill="black" />
            <circle cx={cx} cy={cy} r={rOuter} fill="white" />
            <circle cx={cx} cy={cy} r={rInner} fill="black" />
          </mask>
        </defs>

        {/* Wedges, clipped to the donut profile */}
        <g mask="url(#streakRingMask)">
          {WEEK_DAYS.map((d, i) => {
            const isToday = i === todayIdx;
            return (
              <path
                key={d.name}
                d={wedgePath(i)}
                fill={isToday ? "url(#streakTodayFill)" : d.fill}
                style={{
                  transition: "filter .25s ease, transform .25s ease",
                  transformOrigin: "50% 50%",
                  transform: isToday ? "scale(1.06)" : "none",
                  filter: isToday
                    ? "drop-shadow(0 6px 14px rgba(16,163,127,0.55)) drop-shadow(0 1px 2px rgba(16,163,127,0.35))"
                    : "none",
                }}
              />
            );
          })}
        </g>

        {/* Inner gloss highlight */}
        <g mask="url(#streakRingMask)" pointerEvents="none">
          <rect x="0" y="0" width="100" height="100" fill="url(#streakRingGloss)" />
        </g>

        {/* Hairline rims */}
        <circle cx={cx} cy={cy} r={rOuter} fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="0.35" />
        <circle cx={cx} cy={cy} r={rOuter} fill="none" stroke="rgba(31,42,55,0.10)" strokeWidth="0.16" />
        <circle cx={cx} cy={cy} r={rInner} fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="0.3" />
        <circle cx={cx} cy={cy} r={rInner} fill="none" stroke="rgba(31,42,55,0.12)" strokeWidth="0.16" />

        {/* Single-letter wedge labels at midradius */}
        {WEEK_DAYS.map((d, i) => {
          const isToday = i === todayIdx;
          const a = startOffset + i * slice + slice / 2;
          const [lx, ly] = pt(a, rMid);
          return (
            <text
              key={`l-${d.name}`}
              x={lx.toFixed(3)}
              y={ly.toFixed(3)}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{
                fontFamily: "Inter, system-ui, sans-serif",
                fontWeight: 600,
                letterSpacing: "0.06em",
                fontSize: "3.6px",
                fill: isToday ? "#FFFFFF" : "#6B7484",
                pointerEvents: "none",
                userSelect: "none",
              }}
            >
              {d.abbr}
            </text>
          );
        })}
      </svg>

      {/* Glass center disc with the headline streak count */}
      <div
        className="absolute inset-0 grid place-items-center text-center pointer-events-none"
      >
        <div
          className="grid place-items-center"
          style={{
            width: "56%",
            height: "56%",
            borderRadius: "50%",
            background:
              "radial-gradient(120% 120% at 30% 20%, hsl(var(--surface) / .9), hsl(var(--surface) / .15) 60%), hsl(var(--surface) / .65)",
            backdropFilter: "blur(22px) saturate(180%)",
            WebkitBackdropFilter: "blur(22px) saturate(180%)",
            boxShadow:
              "inset 0 1px 0 hsl(var(--surface) / .9), inset 0 -1px 0 hsl(var(--fg) / .08), 0 18px 40px -18px hsl(var(--fg) / .25)",
            border: "1px solid hsl(var(--surface) / .7)",
          }}
        >
          <div style={{ padding: "0 6px" }}>
            <div
              style={{
                fontSize: 7,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "hsl(var(--muted-fg))",
                fontWeight: 500,
                marginBottom: 4,
              }}
            >
              Total Study
            </div>
            <div
              className="font-display tabular-nums"
              style={{
                fontWeight: 500,
                fontSize: "clamp(22px, 6.4vmin, 34px)",
                letterSpacing: "-0.03em",
                lineHeight: 0.95,
                color: "hsl(var(--fg))",
                display: "flex",
                alignItems: "baseline",
                justifyContent: "center",
                gap: 2,
              }}
            >
              <span>{hours}</span>
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.32em",
                  fontWeight: 500,
                  letterSpacing: "0.04em",
                  color: "hsl(var(--muted-fg))",
                }}
              >
                h
              </span>
              <span style={{ marginLeft: 4 }}>{mins}</span>
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.32em",
                  fontWeight: 500,
                  letterSpacing: "0.04em",
                  color: "hsl(var(--muted-fg))",
                }}
              >
                m
              </span>
            </div>
            <div
              style={{
                marginTop: 4,
                fontSize: 7,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "hsl(var(--muted-fg))",
                fontWeight: 500,
              }}
            >
              {empty ? "Start today" : "This week"}
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Caption chips — Week number on the left, today's name on the right */}
      <div
        style={{
          marginTop: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 9px",
            borderRadius: 999,
            background: "hsl(var(--surface) / .75)",
            backdropFilter: "blur(14px) saturate(180%)",
            WebkitBackdropFilter: "blur(14px) saturate(180%)",
            border: "1px solid hsl(var(--rule))",
            boxShadow:
              "inset 0 1px 0 hsl(var(--surface) / .9), 0 4px 12px -6px hsl(var(--fg) / .25)",
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "hsl(var(--fg))",
            fontWeight: 500,
          }}
        >
          Week · <b style={{ fontWeight: 600 }}>W{weekNumber}</b>
        </span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "4px 9px",
            borderRadius: 999,
            background: "hsl(var(--surface) / .75)",
            backdropFilter: "blur(14px) saturate(180%)",
            WebkitBackdropFilter: "blur(14px) saturate(180%)",
            border: "1px solid hsl(var(--rule))",
            boxShadow:
              "inset 0 1px 0 hsl(var(--surface) / .9), 0 4px 12px -6px hsl(var(--fg) / .25)",
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "hsl(var(--fg))",
            fontWeight: 500,
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "hsl(var(--primary))",
              boxShadow: "0 0 0 3px hsl(var(--surface) / .8)",
            }}
          />
          {todayName}
        </span>
      </div>
    </button>
  );
}
