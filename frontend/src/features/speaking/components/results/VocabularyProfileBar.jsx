import React from 'react';

/**
 * CEFR vocabulary distribution (task #137). Renders a stacked horizontal
 * bar of A1→C2 percentages plus chips of B2 / C1+ example words from the
 * candidate's transcript. Returns null when the LLM declined to estimate
 * (all-zero profile or undefined) so we don't show an empty bar.
 */
export default function VocabularyProfileBar({ profile }) {
  if (!profile) return null;
  const levels = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];
  const total = levels.reduce((s, k) => s + (Number(profile[k]) || 0), 0);
  if (total <= 0) return null;
  const colors = {
    a1: 'hsl(200 70% 70%)',
    a2: 'hsl(200 70% 60%)',
    b1: 'hsl(160 55% 50%)',
    b2: 'hsl(140 60% 45%)',
    c1: 'hsl(40 90% 55%)',
    c2: 'hsl(20 85% 55%)',
  };
  const b2Examples = Array.isArray(profile.b2_examples) ? profile.b2_examples : [];
  const cExamples = Array.isArray(profile.c1_c2_examples) ? profile.c1_c2_examples : [];
  return (
    <div
      style={{
        marginTop: 24,
        paddingTop: 20,
        borderTop: '1px solid var(--sp-border)',
      }}
    >
      <div className="sp-mono-label" style={{ marginBottom: 8 }}>
        Vocabulary range (CEFR)
      </div>
      <div
        role="img"
        aria-label={`Vocabulary distribution: ${levels
          .map((k) => `${k.toUpperCase()} ${Math.round(profile[k] || 0)}%`)
          .join(', ')}`}
        style={{
          display: 'flex',
          height: 14,
          borderRadius: 7,
          overflow: 'hidden',
          border: '1px solid var(--sp-border)',
          background: 'var(--sp-muted-bg, #f4f4f5)',
        }}
      >
        {levels.map((k) => {
          const pct = Math.max(0, Number(profile[k]) || 0);
          if (pct <= 0) return null;
          return (
            <div
              key={k}
              title={`${k.toUpperCase()} ${Math.round(pct)}%`}
              style={{ width: `${(pct / total) * 100}%`, background: colors[k] }}
            />
          );
        })}
      </div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          marginTop: 8,
          fontSize: 12,
          color: 'var(--sp-muted-fg)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {levels.map((k) => (
          <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: colors[k],
                display: 'inline-block',
              }}
            />
            {k.toUpperCase()} {Math.round(profile[k] || 0)}%
          </span>
        ))}
      </div>
      {(b2Examples.length > 0 || cExamples.length > 0) && (
        <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {b2Examples.map((w) => (
            <span
              key={`b2-${w}`}
              style={{
                fontSize: 12,
                padding: '2px 8px',
                borderRadius: 999,
                background: 'hsl(140 60% 95%)',
                color: 'hsl(140 60% 28%)',
                border: '1px solid hsl(140 60% 80%)',
              }}
            >
              B2 · {w}
            </span>
          ))}
          {cExamples.map((w) => (
            <span
              key={`c-${w}`}
              style={{
                fontSize: 12,
                padding: '2px 8px',
                borderRadius: 999,
                background: 'hsl(30 90% 95%)',
                color: 'hsl(20 85% 30%)',
                border: '1px solid hsl(30 90% 80%)',
              }}
            >
              C1/C2 · {w}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
