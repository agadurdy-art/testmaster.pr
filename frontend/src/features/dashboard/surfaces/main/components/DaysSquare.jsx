// Extracted verbatim from pages/DashboardPage.js (Faz1 refactor).
import React from "react";

export default function DaysSquare({
  daysRemaining,
  examDate,
  today,
  languageWireCode,
  streakCount,
  onSet,
  mockDate,
  mockDaysRemaining,
}) {
  // Three states:
  // (a) Exam date set & in future → show countdown
  // (b) No exam date → show today's date as a calendar tile
  // (c) Exam date passed → show today + nudge
  const lc = languageWireCode || "en-US";
  const monthShort = today.toLocaleDateString(lc, { month: "short" }).toUpperCase();
  const weekday = today.toLocaleDateString(lc, { weekday: "long" });
  const dayNum = today.getDate();
  const mockLabel =
    mockDate && !Number.isNaN(mockDate.getTime()) && mockDaysRemaining != null
      ? `Mock · ${mockDate.toLocaleDateString(lc, {
          month: "short",
          day: "numeric",
        })} · in ${mockDaysRemaining} ${mockDaysRemaining === 1 ? "day" : "days"}`
      : null;

  if (daysRemaining != null && daysRemaining > 0) {
    const examMonth = examDate
      ? examDate.toLocaleDateString(lc, { month: "short", day: "numeric" })
      : null;
    return (
      <div
        className="card p-5 md:p-6 flex flex-col justify-between"
        style={{
          background:
            "linear-gradient(135deg, hsl(var(--sky) / .12) 0%, hsl(var(--surface) / .85) 60%)",
          borderColor: "hsl(var(--sky) / .35)",
        }}
      >
        <div className="label" style={{ color: "hsl(var(--sky))" }}>
          Days remaining
        </div>
        <div className="flex items-baseline gap-2 mt-2">
          <div className="display-xxl text-[48px] md:text-[56px] tabular-nums leading-none">
            {daysRemaining}
          </div>
          <div className="text-sm text-muted">days</div>
        </div>
        <div className="text-sm text-muted mt-3">
          {examMonth ? `Exam · ${examMonth}` : "until exam day"}
        </div>
        {mockLabel && (
          <div
            className="text-xs mt-2 pt-2"
            style={{
              color: "hsl(var(--gold-ink))",
              borderTop: "1px solid hsl(var(--rule))",
            }}
          >
            {mockLabel}
          </div>
        )}
      </div>
    );
  }

  // No exam date → calendar tile
  return (
    <div
      className="card p-5 md:p-6 flex flex-col justify-between"
      style={{
        background:
          "linear-gradient(135deg, hsl(var(--liz) / .10) 0%, hsl(var(--surface) / .85) 60%)",
        borderColor: "hsl(var(--liz) / .25)",
      }}
    >
      <div className="label" style={{ color: "hsl(var(--liz-ink))" }}>
        Today
      </div>
      <div className="mt-2">
        <div className="text-[10px] tracking-[0.22em] uppercase text-muted mb-1">
          {monthShort}
        </div>
        <div className="display-xxl text-[48px] md:text-[56px] tabular-nums leading-none">
          {dayNum}
        </div>
        <div className="text-xs text-muted mt-1">{weekday}</div>
      </div>
      <button
        type="button"
        onClick={onSet}
        className="text-sm text-muted underline underline-offset-4 self-start mt-3"
        style={{ textDecorationColor: "hsl(var(--rule))" }}
      >
        {streakCount > 0
          ? `${streakCount}-day streak · set exam date`
          : "Set exam date"}
      </button>
      {mockLabel && (
        <div
          className="text-xs mt-2 pt-2"
          style={{
            color: "hsl(var(--gold-ink))",
            borderTop: "1px solid hsl(var(--rule))",
          }}
        >
          {mockLabel}
        </div>
      )}
    </div>
  );
}
