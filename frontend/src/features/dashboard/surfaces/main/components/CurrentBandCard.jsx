// Extracted verbatim from pages/DashboardPage.js (Faz1 refactor).
import React from "react";
import { SKILL_TONE } from "../constants";

export default function CurrentBandCard({ band, skills, targetBand, onSkillClick }) {
  const has = typeof band === "number";
  return (
    <div
      className="card p-6 md:p-8"
      style={{
        background:
          "linear-gradient(135deg, hsl(var(--primary) / .08) 0%, hsl(var(--surface) / .85) 55%)",
        borderColor: "hsl(var(--primary) / .25)",
      }}
    >
      <div className="flex items-end justify-between gap-6">
        <div>
          <div className="label mb-2" style={{ color: "hsl(var(--primary-ink))" }}>
            Current band
          </div>
          <div className="display-xxl text-[64px] md:text-[80px] tabular-nums leading-none">
            {has ? band.toFixed(1) : "—"}
          </div>
        </div>
        {!has && (
          <div className="text-sm text-muted max-w-[18ch] text-right">
            Take your first test to start tracking.
          </div>
        )}
      </div>
      <hr className="my-5" style={{ borderColor: "hsl(var(--rule))" }} />
      <div className="eyebrow mb-3">Where you stand</div>
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-0 border-t border-b hairline"
        style={{ borderColor: "hsl(var(--rule))" }}
      >
        {skills.map((s, i) => (
          <SkillCellInline
            key={s.key}
            skill={s}
            targetBand={targetBand}
            onClick={onSkillClick}
            isLast={i === skills.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

function SkillCellInline({ skill, targetBand, onClick, isLast }) {
  const { name, band, isWeakest, pctOfTarget } = skill;
  const has = typeof band === "number";
  const tone = SKILL_TONE[skill.key] || "var(--primary)";
  const fill = isWeakest ? "var(--destruct)" : tone;
  const pct = has
    ? Math.max(0, Math.min(100, pctOfTarget || (targetBand ? Math.round((band / targetBand) * 100) : 0)))
    : 0;
  return (
    <button
      type="button"
      onClick={() => onClick?.(skill)}
      className="text-left py-4 px-3 transition-colors flex flex-col gap-2"
      style={{
        borderRight: isLast ? "none" : "1px solid hsl(var(--rule))",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(var(--fg) / 0.02)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          style={{
            width: 4,
            height: 14,
            borderRadius: 4,
            background: `hsl(${tone})`,
            flexShrink: 0,
          }}
        />
        <span className="label" style={{ color: `hsl(${tone})` }}>
          {name}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-display text-[28px] tabular-nums leading-none">
          {has ? band.toFixed(1) : "—"}
        </span>
        {isWeakest && (
          <span
            className="text-[9px] tracking-[0.16em] uppercase font-medium"
            style={{ color: "hsl(var(--destruct))" }}
          >
            Focus
          </span>
        )}
      </div>
      <div
        className="progress"
        style={{ background: "hsl(var(--rule))", height: 3, borderRadius: 999 }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            borderRadius: 999,
            background: `hsl(${fill})`,
            transition: "width 600ms ease",
          }}
        />
      </div>
    </button>
  );
}
