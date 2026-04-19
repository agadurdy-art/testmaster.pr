import React from 'react';
import { CUE_CARD } from '../constants';

/**
 * Cue card in two layouts:
 *   variant="full"   — S2 preparation (big prompt, bullets, andExplain)
 *   variant="mini"   — S3 recording reference (compact inline bullets)
 */
export default function CueCard({ variant = 'full', style }) {
  if (variant === 'mini') {
    return (
      <div
        className="sp-cue-paper"
        style={{ padding: 24, borderRadius: 16, opacity: 0.92, ...style }}
      >
        <p
          className="sp-font-display sp-cue-ink-heading"
          style={{ fontSize: 19, fontWeight: 500, lineHeight: 1.2 }}
        >
          {CUE_CARD.prompt}
        </p>
        <p className="sp-cue-ink-meta" style={{ marginTop: 12 }}>
          You should say
        </p>
        <div
          className="sp-cue-ink-body"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '4px 20px',
            marginTop: 4,
            fontSize: 14.5,
          }}
        >
          {CUE_CARD.bullets.map(b => (
            <span key={b}>— {b}</span>
          ))}
          <span>— and {CUE_CARD.andExplain.replace(/\.$/, '')}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="sp-cue-paper"
      style={{
        padding: '40px 48px',
        maxWidth: 720,
        margin: '0 auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
        }}
      >
        <span className="sp-cue-stamp">{CUE_CARD.stamp}</span>
        <span
          className="sp-font-mono"
          style={{
            fontSize: 10,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'hsl(30 30% 40%)',
          }}
        >
          Cue card
        </span>
      </div>

      <p
        className="sp-font-display sp-cue-ink-heading"
        style={{ fontSize: 30, lineHeight: 1.25, fontWeight: 500 }}
      >
        Describe a person who has <span style={{ fontStyle: 'italic' }}>influenced</span> you.
      </p>

      <p className="sp-cue-ink-meta" style={{ marginTop: 32 }}>
        You should say
      </p>
      <ul
        className="sp-cue-ink-body"
        style={{ marginTop: 12, listStyle: 'none', padding: 0, fontSize: 18, lineHeight: 1.55 }}
      >
        {CUE_CARD.bullets.map(b => (
          <li key={b} style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
            <span className="sp-cue-ink-dash" style={{ marginTop: 2 }}>—</span>
            {b}
          </li>
        ))}
      </ul>
      <div style={{ marginTop: 20 }}>
        <span
          className="sp-cue-ink-meta"
          style={{ display: 'block', marginBottom: 4 }}
        >
          And explain
        </span>
        <span className="sp-cue-ink-body" style={{ fontSize: 18, lineHeight: 1.55 }}>
          {CUE_CARD.andExplain}
        </span>
      </div>

      <div
        style={{
          marginTop: 40,
          paddingTop: 24,
          borderTop: '1px dashed hsl(30 30% 60% / 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span className="sp-cue-ink-meta">Talk for 1–2 minutes</span>
        <span className="sp-cue-ink-meta">No notes during speaking</span>
      </div>
    </div>
  );
}
