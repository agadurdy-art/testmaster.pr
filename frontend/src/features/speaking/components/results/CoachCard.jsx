import React from 'react';
import LizCard from '../LizCard';

/* Liz coach card with the action row (practice drill / retry / new card).
   Falls back to the canned /θ/ note when the evaluator sent no liz_note. */
export default function CoachCard({ lizNote, onRetryCard, onNewCard }) {
  return (
    <LizCard
      variant="coach"
      actions={(
        <>
          <button className="sp-btn-primary">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
            Practise /θ/ · 5‑minute drill
          </button>
          <button className="sp-btn-secondary" onClick={onRetryCard}>
            Try this cue card again
          </button>
          <button
            className="sp-btn-ghost"
            style={{ marginLeft: 'auto' }}
            onClick={onNewCard}
          >
            Draw a new cue card →
          </button>
        </>
      )}
    >
      {lizNote ? (
        lizNote
      ) : (
        <>
          Your pronunciation of{' '}
          <span
            className="sp-font-mono"
            style={{
              fontSize: 19,
              background: 'white',
              padding: '2px 6px',
              borderRadius: 4,
              border: '1px solid hsl(262 52% 55% / 0.2)',
            }}
          >
            /θ/
          </span>{' '}
          sounds like{' '}
          <span
            className="sp-font-mono"
            style={{
              fontSize: 19,
              background: 'white',
              padding: '2px 6px',
              borderRadius: 4,
              border: '1px solid hsl(262 52% 55% / 0.2)',
            }}
          >
            /t/
          </span>{' '}
          — a common pattern for Vietnamese speakers. The rest of your speech is smooth; fix this one sound and you jump to{' '}
          <span style={{ fontWeight: 700 }}>6.5 → 7.0</span> easily.
        </>
      )}
    </LizCard>
  );
}
