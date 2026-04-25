import React from 'react';

const WAVE_BARS = [
  30, 55, 80, 45, 70, 95, 60, 40, 75, 50, 85, 35, 65, 90, 55, 45,
  70, 40, 80, 50, 30, 60, 85, 45, 70, 55, 90, 35, 75, 50, 40, 65,
];

export default function ProcessingState() {
  return (
    <section style={{ maxWidth: 1320, margin: '0 auto', padding: '56px 32px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <span
          className="sp-font-mono"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 26,
            height: 26,
            borderRadius: 9999,
            border: '1.5px solid var(--sp-foreground)',
            fontWeight: 700,
            fontSize: 12,
          }}
        >
          L
        </span>
        <span className="sp-mono-label">State · Processing · Azure pipeline</span>
      </div>
      <div
        style={{
          background: 'var(--sp-card)',
          borderRadius: 'var(--sp-radius)',
          border: '1px solid var(--sp-border)',
          boxShadow: 'var(--sp-shadow-card)',
          padding: 40,
          textAlign: 'center',
        }}
      >
        {/* Waveform */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            gap: 5,
            height: 96,
          }}
        >
          {WAVE_BARS.map((h, i) => (
            <span
              key={i}
              className="sp-wave-bar"
              style={{ height: `${h}%`, animationDelay: `${(i % 16) * 60}ms` }}
            />
          ))}
        </div>
        <h3 className="sp-font-display" style={{ fontSize: 28, fontWeight: 600, marginTop: 32 }}>
          Analysing your response…
        </h3>
        <p style={{ color: 'var(--sp-muted-fg)', marginTop: 8, maxWidth: 420, margin: '8px auto 0' }}>
          Transcribing, scoring pronunciation, and comparing your sounds to a native baseline. About 5 seconds.
        </p>

        {/* Steps */}
        <div
          style={{
            marginTop: 32,
            maxWidth: 520,
            margin: '32px auto 0',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            textAlign: 'left',
          }}
        >
          <Step done label="Audio uploaded" time="1.8 s" />
          <Step done label="Transcribed · 214 words" time="0.9 s" />
          <Step active label="Scoring pronunciation…" time="~2 s" />
          <Step pending label="Preparing Liz's feedback" />
        </div>
      </div>
    </section>
  );
}

function Step({ done, active, pending, label, time }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14 }}>
      {done && (
        <span
          style={{
            width: 20,
            height: 20,
            borderRadius: 9999,
            background: 'var(--sp-primary)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
      )}
      {active && <span className="sp-spinner" style={{ flexShrink: 0 }} />}
      {pending && (
        <span
          style={{
            width: 20,
            height: 20,
            borderRadius: 9999,
            border: '1px solid var(--sp-border)',
            flexShrink: 0,
          }}
        />
      )}
      <span
        style={{
          color: pending ? 'var(--sp-muted-fg)' : 'var(--sp-foreground)',
          fontWeight: active ? 500 : 400,
        }}
      >
        {label}
      </span>
      {time && (
        <span
          className="sp-font-mono"
          style={{
            marginLeft: 'auto',
            fontSize: 11,
            color: 'var(--sp-muted-fg)',
          }}
        >
          {time}
        </span>
      )}
    </div>
  );
}
