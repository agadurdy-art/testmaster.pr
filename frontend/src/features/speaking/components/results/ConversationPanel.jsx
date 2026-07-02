import React from 'react';
import { ColoredTokens } from './Transcript';

/* Full conversation with Liz (Part 1/3 live) — examiner questions +
   the candidate's answers. Collapsed by default (it's long); native
   <details> keeps it hook-free below ResultsState's early return. */
export default function ConversationPanel({ turns, userTurnSlices }) {
  const CONVERSATION_TURNS = turns;
  const USER_TURN_SLICES = userTurnSlices;
  return (
    <details
      style={{
        background: 'var(--sp-card)',
        borderRadius: 'var(--sp-radius)',
        border: '1px solid var(--sp-border)',
        boxShadow: 'var(--sp-shadow-card)',
        padding: '20px 32px',
        marginBottom: 32,
      }}
    >
      <summary style={{ cursor: 'pointer', listStyle: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <span>
          <span className="sp-mono-label" style={{ display: 'block', marginBottom: 2 }}>Conversation with Liz</span>
          <span className="sp-font-display" style={{ fontSize: 20, fontWeight: 600 }}>
            Full exchange
          </span>
        </span>
        <span className="sp-mono-label" style={{ color: 'var(--sp-primary)' }}>
          {CONVERSATION_TURNS.filter((t) => t.role === 'user').length} answers · tap to expand
        </span>
      </summary>
      {USER_TURN_SLICES.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14, marginTop: 14, fontSize: 12, color: 'var(--sp-muted-fg)' }}>
          <span className="sp-mono-label">Pronunciation</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ display: 'inline-block', width: 20, height: 3, borderRadius: 2, background: 'var(--sp-primary)' }} /> Clear
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ display: 'inline-block', width: 20, height: 3, borderRadius: 2, background: 'var(--sp-warn)' }} /> Minor
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ display: 'inline-block', width: 20, height: 3, borderRadius: 2, background: 'repeating-linear-gradient(135deg, hsl(0 78% 55%) 0 2px, transparent 2px 4px)' }} /> Needs work
          </span>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 18 }}>
        {CONVERSATION_TURNS.map((t, i) => {
          const isLiz = t.role === 'agent';
          const userIdx = isLiz ? -1 : CONVERSATION_TURNS.slice(0, i).filter((x) => x.role === 'user').length;
          const slice = (!isLiz && USER_TURN_SLICES[userIdx]) || null;
          return (
            <div
              key={i}
              style={{
                alignSelf: isLiz ? 'flex-start' : 'flex-end',
                maxWidth: '80%',
                background: isLiz ? 'var(--sp-muted)' : 'var(--sp-primary-50)',
                border: '1px solid var(--sp-border)',
                borderRadius: 14,
                padding: '10px 14px',
              }}
            >
              <div
                className="sp-mono-label"
                style={{ fontSize: 10, marginBottom: 4, color: isLiz ? 'var(--sp-muted-fg)' : 'var(--sp-primary)' }}
              >
                {isLiz ? 'Liz' : 'You'}
              </div>
              <div style={{ fontSize: 15, lineHeight: 1.5, color: 'var(--sp-foreground)' }}>
                {slice && slice.length ? <ColoredTokens tokens={slice} /> : t.message}
              </div>
            </div>
          );
        })}
      </div>
    </details>
  );
}
