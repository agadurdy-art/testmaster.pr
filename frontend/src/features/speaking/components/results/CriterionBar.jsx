import React from 'react';

export default function CriterionBar({ name, abbr, value, orange }) {
  const pct = Math.round((value / 9) * 100);
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', fontSize: 14 }}>
        <div>
          <span style={{ fontWeight: 500 }}>{name}</span>{' '}
          <span className="sp-font-mono" style={{ fontSize: 11, color: 'var(--sp-muted-fg)', letterSpacing: '0.05em' }}>{abbr}</span>
        </div>
        <div
          className="sp-font-display"
          style={{
            fontWeight: 700,
            color: orange ? 'var(--sp-warn-dark)' : 'var(--sp-primary-700)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {value.toFixed(1)}
        </div>
      </div>
      <div style={{ marginTop: 6, height: 8, background: 'var(--sp-muted)', borderRadius: 9999, overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: orange ? 'var(--sp-warn)' : 'var(--sp-primary)',
            borderRadius: 9999,
          }}
        />
      </div>
    </div>
  );
}
