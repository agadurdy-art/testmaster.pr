import React, { useState } from 'react';
import CueCard from './CueCard';
import AmpRing from './AmpRing';
import { formatMMSS } from '../hooks/useSpeakingFlow';

export default function RecordingState({
  recordRemaining,
  spokenWordCount, // currently unused — live STT not yet streamed to UI
  onStopEarly,
  cueCard,
}) {
  const [cueOpen, setCueOpen] = useState(true);
  // Live transcript is intentionally empty: there is no real-time STT wired
  // here yet, and showing canned mock words ("aunt Mai…") makes it look like
  // the mic isn't capturing. Real transcript appears in ResultsState after
  // /api/speaking/evaluate returns.
  const visibleWords = [];

  return (
    <section
      style={{
        maxWidth: 1320,
        margin: '0 auto',
        padding: '40px 32px 80px',
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
          3
        </span>
        <span className="sp-mono-label">State · Recording · focus mode</span>
      </div>

      <div className="sp-focus-dim" style={{ minHeight: 820, padding: 0 }}>
        <div className="sp-dots-bg" />

        {/* Top bar */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '32px 32px 0',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span
              className="sp-font-mono"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 12,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.7)',
                padding: '6px 12px',
                borderRadius: 9999,
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              <span style={{ position: 'relative', display: 'inline-flex' }}>
                <span
                  style={{
                    width: 8, height: 8, borderRadius: 9999,
                    background: 'var(--sp-destructive)',
                  }}
                />
                <span
                  style={{
                    position: 'absolute', inset: 0,
                    width: 8, height: 8, borderRadius: 9999,
                    background: 'var(--sp-destructive)',
                    animation: 'sp-ping 1.2s cubic-bezier(0,0,0.2,1) infinite',
                    opacity: 0.75,
                  }}
                />
              </span>
              Recording
            </span>
            <span
              className="sp-font-mono"
              style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}
            >
              Part 2 · Cue card
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ textAlign: 'right' }}>
              <div
                className="sp-font-mono"
                style={{
                  fontSize: 10,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.4)',
                }}
              >
                Remaining
              </div>
              <div
                className="sp-font-display"
                style={{
                  fontWeight: 700,
                  fontSize: 28,
                  lineHeight: 1,
                  color: 'white',
                  fontVariantNumeric: 'tabular-nums',
                  marginTop: 4,
                }}
              >
                {formatMMSS(recordRemaining)}
              </div>
            </div>
            <button
              onClick={onStopEarly}
              style={{
                padding: '8px 16px',
                borderRadius: 9999,
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'transparent',
                color: 'rgba(255,255,255,0.8)',
                fontSize: 13,
                transition: 'background 120ms',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              Stop early
            </button>
          </div>
        </div>

        {/* Minified cue card */}
        <div style={{ position: 'relative', marginTop: 28, padding: '0 32px' }}>
          <button
            onClick={() => setCueOpen(o => !o)}
            style={{
              background: 'transparent',
              border: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 12,
              cursor: 'pointer',
            }}
          >
            <span
              className="sp-cue-stamp"
              style={{
                background: 'hsl(40 60% 94% / 0.15)',
                color: 'hsl(40 60% 85%)',
                borderColor: 'hsl(40 60% 85% / 0.35)',
              }}
            >
              Cue card · {cueOpen ? 'tap to minimise' : 'tap to show'}
            </span>
          </button>
          {cueOpen && <CueCard variant="mini" style={{ maxWidth: 820 }} card={cueCard} />}
        </div>

        {/* Orb */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 48,
            paddingBottom: 32,
          }}
        >
          <div
            style={{
              position: 'relative',
              width: 340,
              height: 340,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div className="sp-orb-ring" />
            <div className="sp-orb-ring sp-orb-ring-2" />
            <AmpRing radius={130} />
            <div
              className="sp-orb-core"
              style={{ width: 180, height: 180 }}
            >
              <svg width="54" height="54" viewBox="0 0 24 24" fill="none"
                   stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="3" width="6" height="13" rx="3" />
                <path d="M5 11a7 7 0 0 0 14 0" />
                <path d="M12 18v3" />
              </svg>
            </div>
          </div>

          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <div
              className="sp-font-mono"
              style={{
                fontSize: 10,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.5)',
              }}
            >
              Listening
            </div>
            <div
              className="sp-font-display"
              style={{ fontSize: 22, color: 'white', marginTop: 4 }}
            >
              Keep going — you have {formatMMSS(recordRemaining)} left.
            </div>
          </div>

          {/* Live transcript */}
          <div style={{ marginTop: 32, maxWidth: 820, width: '100%', padding: '0 32px' }}>
            <div
              className="sp-font-mono"
              style={{
                textAlign: 'center',
                fontSize: 10,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.4)',
                marginBottom: 12,
              }}
            >
              Live transcript · auto
            </div>
            <p
              style={{
                textAlign: 'center',
                fontSize: 22,
                lineHeight: 1.55,
                color: 'rgba(255,255,255,0.9)',
                fontWeight: 300,
                minHeight: 60,
              }}
            >
              {visibleWords.map((w, i) => (
                <span
                  key={i}
                  className="sp-word-new"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  {w}{' '}
                </span>
              ))}
              <span className="sp-caret sp-caret-white" />
            </p>
          </div>

          {/* Pronunciation hint chip */}
          <div
            style={{
              marginTop: 32,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 20px',
              borderRadius: 9999,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                 stroke="hsl(43 96% 70%)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" />
            </svg>
            <span style={{ fontSize: 14 }}>
              <span style={{ color: 'var(--sp-accent-500)', fontWeight: 500 }}>influenced</span>{' '}
              — try <span className="sp-font-mono">/ˈɪnfluənst/</span>
            </span>
            <button
              title="Hear pronunciation"
              style={{
                width: 28, height: 28,
                borderRadius: 9999,
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginLeft: 4,
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="white">
                <path d="M8 5v14l11-7L8 5z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div
            className="sp-font-mono"
            style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}
          >
            Speak naturally · we only use the audio to score you, nothing else
          </div>
          <button
            style={{
              padding: '8px 16px',
              borderRadius: 9999,
              background: 'transparent',
              border: 'none',
              color: 'rgba(255,255,255,0.7)',
              fontSize: 13,
            }}
          >
            Pause (spacebar)
          </button>
        </div>
      </div>

      <div
        style={{
          marginTop: 16,
          fontSize: 14,
          color: 'var(--sp-muted-fg)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
          maxWidth: 720,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginTop: 4, flexShrink: 0 }}>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4m0 4h.01" />
        </svg>
        <span>
          The orb breathes at 2.8s cycle (calm), but scales with voice amplitude in real use.
          Words fade in as Azure STT streams — no retroactive re‑alignment on screen; corrections happen after recording.
        </span>
      </div>

      <style>{`
        @keyframes sp-ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </section>
  );
}
