// Extracted verbatim from pages/Progress.js (Faz1 refactor).
import React from 'react';
import { T, FONT_DISPLAY, PACE_OPTIONS } from '../constants';

export default function PaceModal({ targetBand, pacePending, setPacePending, onSave, onCancel }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 60,
      background: `hsl(${T.ink} / 0.4)`, backdropFilter: 'blur(4px)',
      display: 'grid', placeItems: 'center', padding: 20,
    }}>
      <div style={{
        maxWidth: 440, width: '100%',
        background: `hsl(${T.surface})`, borderRadius: 24, padding: 28,
        boxShadow: `0 12px 40px hsl(220 15% 20% / 0.12)`,
      }}>
        <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 600, margin: '0 0 6px' }}>
          This week's pace
        </h3>
        <p style={{ color: `hsl(${T.muted})`, fontSize: 13, margin: '0 0 18px' }}>
          Liz will adjust feedback intensity and drill difficulty based on what you pick.
        </p>
        {PACE_OPTIONS.map((opt) => {
          const sel = pacePending === opt.id;
          const sub = opt.id === 'steady'
            ? `On pace for Band ${targetBand.toFixed(1)} by exam`
            : opt.sub;
          return (
            <label
              key={opt.id}
              onClick={() => setPacePending(opt.id)}
              data-selected={sel ? 'true' : undefined}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px',
                border: `1.5px solid ${sel ? `hsl(${T.brand})` : `hsl(${T.border})`}`,
                background: sel ? `hsl(${T.brand} / 0.06)` : 'transparent',
                borderRadius: 16, marginBottom: 8, cursor: 'pointer',
                transition: 'all 150ms',
              }}
            >
              <span style={{
                width: 18, height: 18, borderRadius: '50%',
                border: `2px solid ${sel ? `hsl(${T.brand})` : `hsl(${T.border})`}`,
                flex: '0 0 18px',
                background: sel ? `radial-gradient(circle, hsl(${T.brand}) 40%, transparent 42%)` : 'transparent',
              }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{opt.name}</div>
                <div style={{ fontSize: 12, color: `hsl(${T.muted})` }}>{sub}</div>
              </div>
              {opt.lizPick && (
                <span style={{
                  marginLeft: 'auto', fontSize: 11, padding: '3px 8px', borderRadius: 999,
                  background: `hsl(${T.brand} / 0.12)`, color: `hsl(${T.brandDark})`,
                  fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase',
                }}>
                  Liz picks
                </span>
              )}
            </label>
          );
        })}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
          <button
            onClick={onCancel}
            style={{
              padding: '10px 16px', borderRadius: 10,
              background: 'transparent', color: `hsl(${T.muted})`, fontWeight: 500,
              border: 0, cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            style={{
              padding: '10px 16px', borderRadius: 10,
              background: `hsl(${T.brand})`, color: 'white', fontWeight: 600,
              border: 0, cursor: 'pointer', boxShadow: `0 2px 0 hsl(${T.brandDark})`,
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
