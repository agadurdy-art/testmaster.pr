// primitives — the small shared building blocks of the profile cards, verbatim from
// pages/Profile.js (Faz1 wave 10): QuotaTile (625-675), Field (798-807),
// ReadTile (809-827), Row (902-909), Card (1051-1076), Skeleton (1078-1090).
import React from 'react';

export function QuotaTile({ icon, label, counter, accent = 'violet' }) {
  const accentMap = {
    violet: { bg: 'hsl(262 95% 97%)', fg: 'hsl(262 70% 40%)', border: 'hsl(262 85% 90%)' },
    amber: { bg: 'hsl(38 95% 96%)', fg: 'hsl(28 72% 38%)', border: 'hsl(38 80% 86%)' },
    rose: { bg: 'hsl(347 89% 96%)', fg: 'hsl(347 76% 40%)', border: 'hsl(347 80% 86%)' },
    emerald: { bg: 'hsl(155 84% 95%)', fg: 'hsl(155 70% 30%)', border: 'hsl(155 76% 84%)' },
  };
  const tone = accentMap[accent] || accentMap.violet;

  let display;
  let sub;
  if (!counter) {
    display = '—';
    sub = 'Not tracked on this plan';
  } else if (counter.unlimited) {
    display = '∞';
    sub = 'Unlimited';
  } else {
    const used = counter.used ?? 0;
    const quota = counter.quota ?? 0;
    const remaining = counter.remaining ?? Math.max(0, quota - used);
    display = `${remaining}`;
    sub = `${used} of ${quota} used`;
  }

  const pct =
    counter && !counter.unlimited && counter.quota
      ? Math.min(100, ((counter.used ?? 0) / counter.quota) * 100)
      : null;

  return (
    <div
      className="rounded-xl p-4 border"
      style={{ background: tone.bg, borderColor: tone.border }}
    >
      <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider" style={{ color: tone.fg }}>
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="text-3xl font-display leading-none" style={{ color: 'hsl(var(--fg))' }}>{display}</span>
      </div>
      <div className="text-xs mt-1.5" style={{ color: tone.fg, opacity: 0.85 }}>{sub}</div>
      {pct !== null && (
        <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.6)' }}>
          <div className="h-full transition-all" style={{ width: `${pct}%`, background: tone.fg }} />
        </div>
      )}
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: 'hsl(var(--muted-fg))' }}>
        {label}
      </span>
      {children}
    </label>
  );
}

export function ReadTile({ label, value, icon, tone }) {
  return (
    <div
      className="rounded-lg p-3 hairline border"
      style={{
        borderColor: 'hsl(var(--rule))',
        background: tone ? `hsl(${tone} / 0.06)` : 'hsl(var(--bg))',
      }}
    >
      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider" style={{ color: 'hsl(var(--muted-fg))' }}>
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-1 text-lg font-display leading-tight" style={{ color: tone ? `hsl(${tone})` : 'hsl(var(--fg))' }}>
        {value}
      </div>
    </div>
  );
}

export function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className="text-sm" style={{ color: 'hsl(var(--muted-fg))' }}>{label}</span>
      <div className="flex-1 flex justify-end">{children}</div>
    </div>
  );
}

// ─── Card primitive ────────────────────────────────────────────────────────

export function Card({ title, subtitle, action, children }) {
  return (
    <section
      className="rounded-2xl p-6 hairline border"
      style={{
        borderColor: 'hsl(var(--rule))',
        background: 'hsl(var(--bg))',
      }}
    >
      <header className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="font-display text-[20px] leading-tight" style={{ color: 'hsl(var(--fg))' }}>
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs mt-1" style={{ color: 'hsl(var(--muted-fg))' }}>{subtitle}</p>
          )}
        </div>
        {action}
      </header>
      <div>{children}</div>
    </section>
  );
}

export function Skeleton({ rows = 2 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-12 rounded-lg animate-pulse"
          style={{ background: 'hsl(var(--rule))' }}
        />
      ))}
    </div>
  );
}
