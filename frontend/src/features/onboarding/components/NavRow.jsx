import React from 'react';

export default function NavRow({ step, onBack, onSkip }) {
  return (
    <div className="nav-row">
      <button
        type="button"
        className="back-btn"
        disabled={step === 1}
        onClick={onBack}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M19 12H5M11 18l-6-6 6-6" />
        </svg>
        Back
      </button>
      <button type="button" className="skip-link" onClick={onSkip}>
        Skip onboarding (not recommended)
      </button>
    </div>
  );
}
