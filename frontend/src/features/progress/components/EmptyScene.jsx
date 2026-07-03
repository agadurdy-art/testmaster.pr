// Extracted verbatim from pages/Progress.js (Faz1 refactor).
import React from 'react';
import { T, FONT_DISPLAY, SKILLS } from '../constants';
import { PageHead } from './primitives';

export default function EmptyScene({ scene, onChip, onStart, onLater }) {
  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 24px 48px' }}>
      <PageHead
        kicker="Progress"
        title="Nothing to show — yet."
        subtitle="Progress starts with a baseline. 10 minutes with Liz, and this page fills up with your band, trend, weak spots, and a plan tuned to your exam date."
        scene={scene}
        onChip={onChip}
      />

      <div style={{
        padding: '60px 28px', textAlign: 'center',
        borderRadius: 24, background: `hsl(${T.surface})`,
        border: `1px dashed hsl(${T.border})`,
      }}>
        <div style={{
          margin: '0 auto 14px', width: 80, height: 80, borderRadius: '50%',
          background: `linear-gradient(135deg, hsl(${T.brand}) 0%, hsl(${T.sky}) 100%)`,
          display: 'grid', placeItems: 'center', color: 'white',
          fontFamily: FONT_DISPLAY, fontSize: 34, fontWeight: 700,
          boxShadow: `0 6px 20px hsl(${T.brand} / 0.3)`,
        }}>L</div>
        <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 26, fontWeight: 600, margin: '0 0 8px' }}>
          Let me size you up first.
        </h2>
        <p style={{ color: `hsl(${T.muted})`, maxWidth: 440, margin: '0 auto 20px' }}>
          I'll give you one writing prompt and ask three speaking questions. That's all I need to estimate your current band and plan the rest.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={onStart}
            style={{
              padding: '10px 18px', borderRadius: 10,
              background: `hsl(${T.brand})`, color: 'white', fontWeight: 600,
              border: 0, cursor: 'pointer', boxShadow: `0 2px 0 hsl(${T.brandDark})`,
            }}
          >
            Start baseline · 10 min
          </button>
          <button
            onClick={onLater}
            style={{
              padding: '10px 18px', borderRadius: 10,
              background: 'transparent', color: `hsl(${T.muted})`, fontWeight: 500,
              border: 0, cursor: 'pointer',
            }}
          >
            I'll do it later
          </button>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12,
          margin: '28px auto 0', maxWidth: 720,
        }}>
          {SKILLS.map(({ id, label }) => (
            <div key={id} style={{
              padding: 14, borderRadius: 16,
              background: `hsl(${T.bg})`, border: `1px dashed hsl(${T.border})`,
              textAlign: 'center', color: `hsl(${T.fainter})`, fontSize: 13,
            }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, color: `hsl(${T.fainter})`, marginBottom: 4 }}>
                {label}
              </div>
              <div style={{ fontSize: 12, color: `hsl(${T.fainter})` }}>
                Take a test to see your trend
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
