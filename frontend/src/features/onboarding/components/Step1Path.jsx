import React from 'react';

const CHECK_ICON = (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function Step1Path({ direction, path, onSelect }) {
  return (
    <section className={`step${direction === 'rev' ? ' rev' : ''}`}>
      <h1 className="step-title">
        Let's personalize your plan.{' '}
        <span className="ital">What's your goal?</span>
      </h1>
      <p className="step-sub">
        Pick the track that matches where you're headed. You can always switch
        later — we'll bring your progress with you.
      </p>

      <div className="path-grid">
        <button
          type="button"
          className={`path-card a${path === 'ielts' ? ' selected' : ''}`}
          onClick={() => onSelect('ielts')}
        >
          <span className="corner-check" aria-hidden="true">{CHECK_ICON}</span>
          <div className="path-icon">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M22 10L12 4 2 10l10 6 10-6z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
          <h3>I'm preparing for IELTS</h3>
          <p className="desc">
            Band-calibrated feedback on all four skills. Mock tests, speaking
            practice with follow-ups, and a dated study plan built around your
            exam.
          </p>
          <div className="meta-row">
            <span>Avg. gain <b>+1.3 bands</b></span>
            <span className="dot"></span>
            <span><b>45-day</b> plan included</span>
          </div>
        </button>

        <button
          type="button"
          className={`path-card b${path === 'general' ? ' selected' : ''}`}
          onClick={() => onSelect('general')}
        >
          <span className="corner-check" aria-hidden="true">{CHECK_ICON}</span>
          <div className="path-icon">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M2 3h7a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-7a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h8z" />
            </svg>
          </div>
          <h3>I want to improve my General English</h3>
          <p className="desc">
            Cambridge-pathway lessons at your pace. Vocabulary games,
            pronunciation coaching, and a weekly focus — no test calendar
            required.
          </p>
          <div className="meta-row">
            <span>Levels <b>A1 → C2</b></span>
            <span className="dot"></span>
            <span><b>No exam</b> pressure</span>
          </div>
        </button>
      </div>
    </section>
  );
}
