import React from 'react';

export default function ErrorState({ onRetry, onBack, errorMessage }) {
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
          E
        </span>
        <span className="sp-mono-label">State · Error · low‑audio / mic</span>
      </div>

      <div
        style={{
          background: 'var(--sp-card)',
          borderRadius: 'var(--sp-radius)',
          border: '1px solid var(--sp-border)',
          boxShadow: 'var(--sp-shadow-card)',
          padding: 40,
          display: 'flex',
          alignItems: 'center',
          gap: 32,
          maxWidth: 840,
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            width: 112,
            height: 112,
            borderRadius: 'var(--sp-radius)',
            background: 'hsl(30 80% 96%)',
            border: '1px solid hsl(30 80% 88%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
               stroke="hsl(25 95% 48%)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <line x1="2" y1="2" x2="22" y2="22" />
            <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2" />
            <path d="M5 10v2a7 7 0 0 0 12 5" />
            <path d="M15 9.34V5a3 3 0 0 0-5.68-1.33" />
            <path d="M9 9v3a3 3 0 0 0 5.12 2.12" />
            <line x1="12" y1="19" x2="12" y2="23" />
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div
            className="sp-font-mono"
            style={{
              fontSize: 11,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--sp-warn-dark)',
            }}
          >
            Mic issue
          </div>
          <h3 className="sp-font-display" style={{ fontSize: 26, fontWeight: 600, marginTop: 4, lineHeight: 1.2 }}>
            We couldn't hear you well.
          </h3>
          <p style={{ color: 'var(--sp-muted-fg)', marginTop: 8, maxWidth: 520 }}>
            {errorMessage
              || 'Your audio came through very quiet. Check your microphone is selected and not muted, then try again. Your cue card is saved.'}
          </p>
          <div
            style={{
              marginTop: 20,
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <button className="sp-btn-primary" onClick={onRetry}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-3-6.7" />
                <polyline points="21 3 21 9 15 9" />
              </svg>
              Try again
            </button>
            <a
              href="/score-my-speaking"
              className="sp-btn-secondary"
              style={{ textDecoration: 'none' }}
            >
              Try a Part 2 prompt
            </a>
            <button className="sp-btn-ghost" onClick={onBack}>
              Switch to text practice instead
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
