import React from 'react';

export default function FluencyStats({ fluency }) {
  const [pausesValue, ...pausesRest] = String(fluency.pauses || '').split(' · ');
  const [fillersValue, ...fillersRest] = String(fluency.fillers || '').split(' · ');
  const [uniqueValue, ...uniqueRest] = String(fluency.unique || '').split(' / ');
  const items = [
    { label: 'Speaking rate', value: fluency.wpm, unit: 'wpm' },
    { label: 'Pauses', value: pausesValue || '—', unit: pausesRest.length ? `· ${pausesRest.join(' · ')}` : '' },
    { label: 'Fillers', value: fillersValue || '—', unit: fillersRest.length ? `· ${fillersRest.join(' · ')}` : '' },
    { label: 'Unique words', value: uniqueValue || '—', unit: uniqueRest.length ? `/ ${uniqueRest.join(' / ')}` : '' },
  ];
  return (
    <div
      style={{
        marginTop: 24,
        paddingTop: 20,
        borderTop: '1px solid var(--sp-border)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 20,
        fontSize: 13,
      }}
    >
      {items.map(it => (
        <div key={it.label}>
          <div className="sp-mono-label">{it.label}</div>
          <div style={{ fontSize: 17, fontWeight: 500, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>
            {it.value}{' '}
            <span style={{ color: 'var(--sp-muted-fg)', fontSize: 13, fontWeight: 400 }}>
              {it.unit}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
