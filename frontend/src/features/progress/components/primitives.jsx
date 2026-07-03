// Shared presentational primitives extracted verbatim from pages/Progress.js (Faz1 refactor).
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { T, FONT_DISPLAY } from '../constants';

// Was a demo "Scene" switcher (Active learner / New user / Edit goal). The state
// previews are gone — the page derives the real state from the user's data — so
// only the genuine action remains: edit your goal / weekly pace.
function SceneBar({ onChip }) {
  return (
    <button
      type="button"
      onClick={() => onChip('edit')}
      data-testid="progress-edit-goal"
      style={{
        flex: '0 0 auto',
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '10px 18px', borderRadius: 999,
        border: `1px solid hsl(${T.brand} / 0.35)`,
        background: `hsl(${T.brand} / 0.08)`,
        color: `hsl(${T.brandDark})`,
        fontWeight: 600, fontSize: 14, cursor: 'pointer',
      }}
    >
      Edit goal
    </button>
  );
}

/* -------- helper components -------- */

function BackLink({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '6px 0', marginBottom: 14,
        background: 'none', border: 0, cursor: 'pointer',
        color: `hsl(${T.muted})`, fontSize: 13, fontWeight: 500,
      }}
    >
      <ArrowLeft style={{ width: 14, height: 14 }} /> Back to Dashboard
    </button>
  );
}

function PageHead({ kicker, title, subtitle, scene, onChip }) {
  return (
    <header style={{ marginBottom: 22, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: 280 }}>
        <div style={{ fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: `hsl(${T.brandDark})`, fontWeight: 600 }}>
          {kicker}
        </div>
        <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 36, fontWeight: 600, letterSpacing: '-0.01em', margin: '4px 0 0' }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ margin: '6px 0 0', color: `hsl(${T.muted})`, maxWidth: 560 }}>
            {subtitle}
          </p>
        )}
      </div>
      {scene && onChip && <SceneBar scene={scene} onChip={onChip} />}
    </header>
  );
}

function Panel({ children }) {
  return (
    <section style={{
      background: `hsl(${T.surface})`, border: `1px solid hsl(${T.border})`,
      borderRadius: 24, padding: 22,
      boxShadow: `0 1px 2px hsl(220 15% 20% / 0.04), 0 1px 3px hsl(220 15% 20% / 0.06)`,
    }}>
      {children}
    </section>
  );
}

function Kicker({ children }) {
  return (
    <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: `hsl(${T.muted})`, fontWeight: 600 }}>
      {children}
    </div>
  );
}

function Insight({ kind, title, children }) {
  const palette = kind === 'win'
    ? { bg: `hsl(${T.brand} / 0.14)`, fg: `hsl(${T.brandDark})`, glyph: '✓' }
    : kind === 'gap'
      ? { bg: `hsl(${T.gold} / 0.18)`, fg: `hsl(35 70% 30%)`, glyph: '!' }
      : { bg: `hsl(${T.sky} / 0.18)`, fg: `hsl(199 90% 30%)`, glyph: '→' };
  return (
    <div style={{
      display: 'flex', gap: 12, padding: 14, borderRadius: 16,
      background: `hsl(${T.bg})`, border: `1px solid hsl(${T.border})`,
    }}>
      <div style={{
        flex: '0 0 34px', width: 34, height: 34, borderRadius: 10,
        display: 'grid', placeItems: 'center', fontSize: 16,
        background: palette.bg, color: palette.fg,
      }}>
        {palette.glyph}
      </div>
      <div>
        <h4 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 600 }}>{title}</h4>
        <p style={{ margin: 0, fontSize: 13, color: `hsl(${T.ink} / 0.8)` }}>{children}</p>
      </div>
    </div>
  );
}

function Milestone({ done, next, label, date }) {
  const dotBg = done
    ? `hsl(${T.brand})`
    : next
      ? `hsl(${T.gold} / 0.2)`
      : `hsl(${T.surface})`;
  const dotBorder = done
    ? `hsl(${T.brand})`
    : next
      ? `hsl(${T.gold})`
      : `hsl(${T.border})`;
  const shadow = next ? `0 0 0 3px hsl(${T.gold} / 0.15)` : 'none';
  return (
    <li style={{
      display: 'flex', gap: 10, padding: '10px 0',
      borderTop: `1px dashed hsl(${T.border})`, fontSize: 13,
    }}>
      <span style={{
        flex: '0 0 18px', width: 18, height: 18, borderRadius: '50%',
        background: dotBg, border: `2px solid ${dotBorder}`,
        boxShadow: shadow, marginTop: 2,
      }} />
      <div>
        <b style={{ fontWeight: 600 }}>{label}</b>
        <div style={{ color: `hsl(${T.muted})`, fontSize: 12 }}>{date}</div>
      </div>
    </li>
  );
}

export { SceneBar, BackLink, PageHead, Panel, Kicker, Insight, Milestone };
