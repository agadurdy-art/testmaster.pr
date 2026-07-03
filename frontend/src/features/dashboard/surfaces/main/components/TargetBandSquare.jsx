// Extracted verbatim from pages/DashboardPage.js (Faz1 refactor).
import React from "react";

export default function TargetBandSquare({ target, gap, onSet }) {
  const has = typeof target === "number";
  return (
    <div
      className="card p-5 md:p-6 flex flex-col justify-between"
      style={{
        background:
          "linear-gradient(135deg, hsl(var(--gold) / .12) 0%, hsl(var(--surface) / .85) 60%)",
        borderColor: "hsl(var(--gold) / .35)",
      }}
    >
      <div className="label" style={{ color: "hsl(var(--gold-ink))" }}>
        Target band
      </div>
      <div className="display-xxl text-[48px] md:text-[56px] tabular-nums leading-none mt-2">
        {has ? target.toFixed(1) : "—"}
      </div>
      <div className="text-sm text-muted mt-3">
        {!has ? (
          <button
            type="button"
            onClick={onSet}
            className="underline underline-offset-4"
            style={{ textDecorationColor: "hsl(var(--rule))" }}
          >
            Set a target band
          </button>
        ) : gap == null ? (
          "Take a test to see the gap"
        ) : gap === 0 ? (
          <span style={{ color: "hsl(var(--primary-ink))" }}>At target</span>
        ) : (
          <span>
            <span className="tabular-nums font-medium" style={{ color: "hsl(var(--gold-ink))" }}>
              −{gap.toFixed(1)}
            </span>{" "}
            band{gap === 1 ? "" : "s"} to go
          </span>
        )}
      </div>
    </div>
  );
}
