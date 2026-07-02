import React from 'react';
import BandRadar from '../BandRadar';
import CriterionBar from './CriterionBar';

/* RIGHT scorecard: Overall Band hero card + radar with the four
   criterion bars. */
export default function ScorecardAside({ scores }) {
  const SCORES = scores;
  return (
    <aside
      className="sp-results-aside"
      style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
    >
      {/* Overall */}
      <div
        style={{
          background: 'var(--sp-card)',
          borderRadius: 'var(--sp-radius)',
          border: '1px solid var(--sp-border)',
          boxShadow: 'var(--sp-shadow-lift)',
          padding: 28,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: 'radial-gradient(600px 240px at 50% -20%, hsl(160 60% 92% / 0.8), transparent 60%)',
          }}
        />
        <div style={{ position: 'relative' }}>
          <div
            className="sp-font-mono"
            style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--sp-primary-700)' }}
          >
            Overall Band
          </div>
          <div
            className="sp-font-display"
            style={{
              fontWeight: 700,
              fontSize: 120,
              lineHeight: 1,
              letterSpacing: '-0.04em',
              color: 'var(--sp-primary-700)',
              fontVariantNumeric: 'tabular-nums',
              marginTop: 8,
            }}
          >
            {SCORES.overall.toFixed(1)}
          </div>
          <div style={{ fontSize: 16, marginTop: 8 }}>
            Competent User ·{' '}
            <span style={{ color: 'var(--sp-muted-fg)' }}>
              you're {(SCORES.target - SCORES.overall).toFixed(1)} from your target of {SCORES.target.toFixed(1)}
            </span>
          </div>
          <div
            style={{
              marginTop: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            {[
              { bg: 'var(--sp-primary-200)' },
              { bg: 'var(--sp-primary-200)' },
              { bg: 'var(--sp-primary)' },
              { bg: 'var(--sp-muted)' },
              { bg: 'var(--sp-muted)' },
            ].map((s, i) => (
              <span
                key={i}
                style={{
                  width: 48,
                  height: 6,
                  borderRadius: 9999,
                  background: s.bg,
                }}
              />
            ))}
          </div>
          <div
            className="sp-font-mono"
            style={{
              marginTop: 8,
              fontSize: 10,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--sp-muted-fg)',
            }}
          >
            5.5&nbsp;&nbsp;6.0&nbsp;&nbsp;
            <span style={{ color: 'var(--sp-primary-700)' }}>6.5</span>
            &nbsp;&nbsp;7.0&nbsp;&nbsp;7.5
          </div>
        </div>
      </div>

      {/* Radar + bars */}
      <div
        style={{
          background: 'var(--sp-card)',
          borderRadius: 'var(--sp-radius)',
          border: '1px solid var(--sp-border)',
          padding: 24,
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <div className="sp-mono-label">Four criteria</div>
          <div className="sp-font-display" style={{ fontSize: 18, fontWeight: 600, marginTop: 2 }}>
            Where the points came from
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <BandRadar fc={SCORES.fc} lr={SCORES.lr} gra={SCORES.gra} pr={SCORES.pr} />
        </div>

        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <CriterionBar name="Fluency & Coherence" abbr="FC" value={SCORES.fc} />
          <CriterionBar name="Lexical Resource" abbr="LR" value={SCORES.lr} />
          <CriterionBar name="Grammatical Range & Accuracy" abbr="GRA" value={SCORES.gra} />
          <CriterionBar name="Pronunciation" abbr="PR" value={SCORES.pr} orange />
        </div>
      </div>
    </aside>
  );
}
