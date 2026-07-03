// Extracted verbatim from pages/DashboardPage.js (Faz1 refactor).
import React, { useRef } from "react";
import { SKILL_ICON, SKILL_TONE } from "../constants";

export default function MockTestFrameWith4Grid({
  navigate,
  lastMockLabel,
  eyebrow,
  title,
  description,
  durationLabel,
  ctaLabel,
  mockExamDate,
  onSetMockDate,
  languageWireCode,
}) {
  const mockDateInputRef = useRef(null);
  const mockDateObj = mockExamDate ? new Date(mockExamDate) : null;
  const mockLabel =
    mockDateObj && !Number.isNaN(mockDateObj.getTime())
      ? mockDateObj.toLocaleDateString(languageWireCode || "en-US", {
          month: "short",
          day: "numeric",
        })
      : null;
  const todayIso = new Date().toISOString().slice(0, 10);
  const cambridge = [
    { key: "Reading", route: "/test/reading" },
    { key: "Listening", route: "/test/listening" },
    { key: "Writing", route: "/test/writing" },
    { key: "Speaking", route: "/test/speaking" },
  ];
  return (
    <section className="mock-frame p-8 md:p-10">
      <div className="max-w-[58ch] mb-8">
        <div className="eyebrow mb-3" style={{ color: "hsl(var(--gold-ink))" }}>
          {eyebrow}
        </div>
        <h2 className="display-xl text-[32px] md:text-[40px]">{title}</h2>
        {description && <p className="mt-4 editorial-body">{description}</p>}
        <div className="mt-5 text-sm text-muted flex flex-wrap items-center">
          <span>{durationLabel}</span>
          {lastMockLabel && (
            <>
              <span className="divider-dot" />
              <span>
                Last mock · <span className="text-fg">{lastMockLabel}</span>
              </span>
            </>
          )}
        </div>
      </div>

      <div className="text-xs text-muted mb-3 tracking-wide uppercase">
        Cambridge 19 · Test 1 &amp; Test 2
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {cambridge.map((c) => {
          const tone = SKILL_TONE[c.key];
          const Icon = SKILL_ICON[c.key];
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => navigate(c.route)}
              className="aspect-square p-4 text-left transition-transform hover:-translate-y-0.5 relative overflow-hidden"
              style={{
                background: `linear-gradient(160deg, hsl(${tone} / .10) 0%, hsl(var(--surface) / .9) 70%)`,
                border: `1px solid hsl(${tone} / .25)`,
                borderRadius: "1rem",
              }}
            >
              {Icon && (
                <Icon
                  aria-hidden="true"
                  className="absolute pointer-events-none"
                  style={{
                    color: `hsl(${tone})`,
                    opacity: 0.18,
                    top: "18%",
                    right: "-12%",
                    width: "62%",
                    height: "62%",
                    strokeWidth: 1.4,
                  }}
                />
              )}
              <div className="flex flex-col h-full justify-between relative">
                <div className="label" style={{ color: `hsl(${tone})` }}>
                  {c.key}
                </div>
                <div>
                  <div className="font-display text-[22px] leading-none">
                    Cambridge 19
                  </div>
                  <div className="text-xs text-muted mt-1">Test 1 · Test 2</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="btn btn-gold"
          onClick={() => navigate("/question-bank?fulltests=picker")}
        >
          {ctaLabel}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => {
            const el = mockDateInputRef.current;
            if (!el) return;
            // Modern browsers: showPicker() opens the native date picker.
            // Fallback to .click() for older Safari.
            if (typeof el.showPicker === "function") el.showPicker();
            else el.click();
          }}
          className="text-sm text-muted hover:text-fg underline underline-offset-4"
          style={{ textDecorationColor: "hsl(var(--rule))" }}
        >
          {mockLabel ? `Mock day · ${mockLabel}` : "Schedule mock day"}
        </button>
        {mockLabel && (
          <button
            type="button"
            onClick={() => onSetMockDate && onSetMockDate(null)}
            className="text-xs text-muted hover:text-fg"
            aria-label="Clear mock day"
          >
            Clear
          </button>
        )}
        <input
          ref={mockDateInputRef}
          type="date"
          min={todayIso}
          value={mockExamDate || ""}
          onChange={(e) => onSetMockDate && onSetMockDate(e.target.value || null)}
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>
    </section>
  );
}
