// Extracted verbatim from pages/DashboardPage.js (Faz1 refactor).
import React from "react";
import Arrow from "./Arrow";

export default function FullMockCard({ tone = "gold", eyebrow, title, description, onClick }) {
  const toneMap = { gold: "var(--gold)", sky: "var(--sky)", liz: "var(--liz)" };
  const inkMap = { gold: "var(--gold-ink)", sky: "var(--sky)", liz: "var(--liz)" };
  const toneToken = toneMap[tone] || toneMap.gold;
  const inkToken = inkMap[tone] || inkMap.gold;
  return (
    <button
      type="button"
      onClick={onClick}
      className="card text-left p-6 hover:-translate-y-0.5 transition-transform flex items-center justify-between gap-4"
      style={{
        background: `linear-gradient(135deg, hsl(${toneToken} / .14) 0%, hsl(var(--surface) / .9) 65%)`,
        borderColor: `hsl(${toneToken} / .35)`,
      }}
    >
      <div>
        <div className="eyebrow mb-2" style={{ color: `hsl(${inkToken})` }}>
          {eyebrow}
        </div>
        <div className="display-m text-[20px] mb-1">{title}</div>
        <div className="text-sm text-muted">{description}</div>
      </div>
      <Arrow />
    </button>
  );
}
