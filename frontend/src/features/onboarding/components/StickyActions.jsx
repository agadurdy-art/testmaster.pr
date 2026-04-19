import React from 'react';

export default function StickyActions({ step, canContinue, onContinue }) {
  const label = step === 5 ? 'Meet my dashboard' : 'Continue';
  return (
    <div className="actions">
      <div className="actions-inner">
        <div className="hint">
          <span className="kbd">Tab</span> to move
          <span className="kbd">Enter</span> to continue
          <span className="kbd">Esc</span> to back out
        </div>
        <button
          type="button"
          className="btn btn-primary btn-lg"
          disabled={!canContinue}
          onClick={onContinue}
        >
          <span>{label}</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
