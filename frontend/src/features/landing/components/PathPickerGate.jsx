import React, { useEffect, useState } from 'react';
import LizAvatar from './LizAvatar';

/**
 * PathPickerGate — pre-signup overlay asking the visitor which exam track they
 * care about. Writes the choice to `localStorage.tm_demo_path` so we can:
 *   1) skip this gate on subsequent visits
 *   2) hand the choice to OnboardingPageV2 post-signup (follow-up PR)
 *
 * Currently wraps only `/landing/demo`. IELTS is the only active path; General
 * English is rendered as "soon" to telegraph roadmap without branching UX.
 */

const STORAGE_KEY = 'tm_demo_path';

const PATHS = [
  {
    key: 'ielts',
    label: 'IELTS',
    blurb: 'Academic · General · Band 4–9 with Liz',
    available: true,
  },
  {
    key: 'general',
    label: 'General English',
    blurb: 'Conversational practice — coming soon',
    available: false,
  },
];

export default function PathPickerGate({ children }) {
  const [resolved, setResolved] = useState(false);
  const [choice, setChoice] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setChoice(saved);
    } catch (_) {
      // localStorage blocked (private mode / SSR) — treat as first visit
    }
    setResolved(true);
  }, []);

  function pick(key) {
    try {
      localStorage.setItem(STORAGE_KEY, key);
    } catch (_) {
      // ignore write failures — user can still proceed this session
    }
    setChoice(key);
  }

  // Avoid flashing the gate before we've read storage.
  if (!resolved) return null;

  const showGate = !choice;

  return (
    <>
      {showGate && (
        <div className="path-gate" role="dialog" aria-modal="true" aria-labelledby="pathGateTitle">
          <div className="path-gate-card">
            <div className="path-gate-brand">
              <LizAvatar size={48} ring />
              <div>
                <div className="path-gate-eyebrow">Welcome · Powered by Liz</div>
                <h2 id="pathGateTitle" className="path-gate-title">Which path are you preparing for?</h2>
              </div>
            </div>
            <p className="path-gate-sub">
              Pick a track to see a tailored landing. You can change this later.
            </p>
            <div className="path-gate-options">
              {PATHS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  className={`path-gate-option ${p.available ? '' : 'is-soon'}`}
                  onClick={() => p.available && pick(p.key)}
                  disabled={!p.available}
                >
                  <span className="path-gate-option-label">
                    {p.label}
                    {!p.available && <span className="path-gate-soon">soon</span>}
                  </span>
                  <span className="path-gate-option-blurb">{p.blurb}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {children}
      {/* Dev/demo helper: clears the choice so you can re-test the gate. */}
      {choice && (
        <button
          type="button"
          className="path-gate-reset"
          onClick={() => {
            try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
            setChoice(null);
          }}
          aria-label="Reset demo path choice"
        >
          Reset demo
        </button>
      )}
    </>
  );
}
