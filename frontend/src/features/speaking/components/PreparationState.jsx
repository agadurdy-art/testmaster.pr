import React from 'react';
import CueCard from './CueCard';
import { formatMMSS } from '../hooks/useSpeakingFlow';

export default function PreparationState({
  prepRemaining,
  prepTotal,
  onAddThirty,
  onSkipPrep,
  onStartRecording,
  onExit,
}) {
  const pct = Math.round((prepRemaining / prepTotal) * 100);
  const lowTime = prepRemaining <= 10;

  return (
    <section
      style={{
        background: 'hsl(40 45% 97%)',
        borderTop: '1px solid hsl(40 30% 90%)',
        borderBottom: '1px solid hsl(40 30% 90%)',
      }}
    >
      <div
        style={{
          maxWidth: 1320,
          margin: '0 auto',
          padding: '56px 32px 80px',
        }}
      >
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
            2
          </span>
          <span className="sp-mono-label">State · Preparation · 1 minute countdown</span>
        </div>

        {/* Top strip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 24,
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: 'var(--sp-muted-fg)' }}>
            <button
              className="sp-btn-ghost"
              onClick={onExit}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              Exit practice
            </button>
            <span>·</span>
            <span>Part 2 · Cue card</span>
            <span>·</span>
            <span>Topic: <span style={{ color: 'var(--sp-foreground)' }}>People</span></span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              color: 'var(--sp-muted-fg)',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: 8,
                height: 8,
                borderRadius: 9999,
                background: 'var(--sp-secondary)',
              }}
            />
            Mic ready · built‑in microphone
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr)',
            gap: 40,
            alignItems: 'start',
          }}
          className="sp-prep-grid"
        >
          <div className="sp-prep-main">
            <CueCard variant="full" />

            {/* Actions */}
            <div
              style={{
                maxWidth: 720,
                margin: '40px auto 0',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
              }}
            >
              <button className="sp-btn-ghost" onClick={onSkipPrep}>
                Skip prep — start now
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button className="sp-btn-secondary" onClick={onAddThirty}>+ 30 s</button>
                <button
                  className="sp-btn-primary"
                  onClick={onStartRecording}
                  style={{ height: 48, padding: '0 28px' }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 9999,
                      background: 'rgba(255,255,255,0.9)',
                    }}
                  />
                  I'm ready — start recording
                </button>
              </div>
            </div>
          </div>

          {/* Side column */}
          <aside
            className="sp-prep-aside"
            style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
          >
            {/* Timer */}
            <div
              style={{
                background: 'white',
                borderRadius: 'var(--sp-radius)',
                border: '1px solid var(--sp-border)',
                padding: 24,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div className="sp-mono-label">Preparation time</div>
                <span
                  className="sp-font-mono"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 11,
                    color: 'var(--sp-secondary-700)',
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 9999,
                      background: 'var(--sp-secondary)',
                    }}
                  />
                  running
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 12 }}>
                <div
                  className="sp-font-display"
                  style={{
                    fontWeight: 700,
                    fontSize: 76,
                    lineHeight: 1,
                    color: lowTime ? 'var(--sp-destructive)' : 'var(--sp-secondary-700)',
                    fontVariantNumeric: 'tabular-nums',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {formatMMSS(prepRemaining)}
                </div>
                <div style={{ color: 'var(--sp-muted-fg)', fontSize: 14, marginBottom: 8 }}>
                  / {formatMMSS(prepTotal)}
                </div>
              </div>
              <div className="sp-progress-bar" style={{ marginTop: 16 }}>
                <div
                  className={'sp-progress-bar-fill' + (lowTime ? ' sp-danger' : '')}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div style={{ marginTop: 12, fontSize: 13, color: 'var(--sp-muted-fg)', lineHeight: 1.4 }}>
                The bar turns{' '}
                <span style={{ color: 'var(--sp-destructive)', fontWeight: 500 }}>red</span> in the last 10 seconds.
                Recording starts automatically when the timer hits zero.
              </div>
            </div>

            {/* Notepad */}
            <div className="sp-notepad" style={{ padding: 20 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                }}
              >
                <div className="sp-mono-label">Notes — optional</div>
                <span style={{ fontSize: 11, color: 'var(--sp-muted-fg)' }}>3 lines used</span>
              </div>
              <div
                className="sp-font-hand"
                style={{
                  fontSize: 20,
                  lineHeight: '28px',
                  color: 'hsl(222 40% 22%)',
                  minHeight: 196,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <div>• my aunt Mai — Ha Noi, 2018</div>
                <div>• kind, stubborn, honest</div>
                <div>• taught me to teach my brother</div>
                <div style={{ color: 'var(--sp-muted-fg)', opacity: 0.6 }}>
                  •<span className="sp-caret" />
                </div>
              </div>
              <div
                style={{
                  marginTop: 12,
                  fontSize: 12,
                  color: 'var(--sp-muted-fg)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <path d="M9 9h6v6H9z" />
                </svg>
                Notes stay on this screen. You won't see them while recording (IELTS rules).
              </div>
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .speaking-scope .sp-prep-grid { grid-template-columns: 1fr 380px !important; }
          .speaking-scope .sp-prep-aside { position: sticky; top: 96px; }
        }
      `}</style>
    </section>
  );
}
