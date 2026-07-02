import React from 'react';

/* Examiner's rubric — hidden by ResultsState when premium detail is present
   (the static copy below is fixture-band leftover that conflicts with real
   numbers from the premium endpoint). */
export default function ExaminerRubric() {
  return (
    <details
      style={{
        marginTop: 24,
        background: 'hsl(210 40% 96% / 0.4)',
        border: '1px solid var(--sp-border)',
        borderRadius: 'var(--sp-radius)',
        padding: 20,
      }}
    >
      <summary
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          listStyle: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="sp-mono-label">Examiner's rubric</span>
          <span style={{ fontSize: 14 }}>Why Liz scored Pronunciation 6.0 and not 6.5</span>
        </div>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>
      <div
        style={{
          marginTop: 16,
          fontSize: 14.5,
          color: 'hsl(222 47% 11% / 0.85)',
          lineHeight: 1.6,
          maxWidth: 780,
        }}
      >
        <p>
          Your word stress and intonation are natural (a 6.5 trait), but the consistent /θ/ → /t/ substitution is a phoneme‑level issue that Cambridge descriptors flag at Band 6. Lexical stress on multi‑syllable words (<em>in‑<strong>flu</strong>‑enced</em>) came through clearly — that's why FC and LR held their line.
        </p>
      </div>
    </details>
  );
}
