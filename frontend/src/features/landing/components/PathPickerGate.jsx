import React, { useEffect, useState } from 'react';
import LizAvatar from './LizAvatar';

/**
 * PathPickerGate — pre-signup overlay asking the visitor which exam track they
 * care about. Writes the choice to `localStorage.tm_demo_path` (so we don't
 * re-show the gate) AND `testmaster_onboarding_path` (so SignupBridge picks it
 * up post-signup).
 *
 * Both IELTS Ace and General English are live. Picking IELTS keeps the user
 * on the IELTS-flavored demo landing. Picking GE shortcuts directly into the
 * signup flow with `?path=general`, because we don't have a GE-flavored
 * landing yet (Faz 2 backlog).
 */

const STORAGE_KEY = 'tm_demo_path';
// Mirror useOnboardingState.PATH_STORAGE_KEY so SignupBridge / OnboardingPageV2
// can read the same hint without having to round-trip through /signup?path=...
const ONBOARDING_PATH_KEY = 'testmaster_onboarding_path';

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
    blurb: 'Everyday English — speak, write, play to fluency',
    available: true,
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
      // Hand the choice to the onboarding flow so SignupBridge doesn't need a
      // `?path=...` query param to know which product surface the user wants.
      localStorage.setItem(ONBOARDING_PATH_KEY, key);
    } catch (_) {
      // ignore write failures — user can still proceed this session
    }
    setChoice(key);
    // GE doesn't have a dedicated landing yet, and the IELTS-flavored landing
    // would be confusing. Shortcut straight into signup with the path hint.
    if (key === 'general' && typeof window !== 'undefined') {
      window.location.assign('/signup?path=general');
    }
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
                  onTouchEnd={(e) => {
                    // Mobile Safari occasionally swallows the synthetic
                    // click after a touch when the button also navigates
                    // away (Fix #C — GE path picker stuck on mobile).
                    // Treating touchend as the commit signal makes both
                    // tracks behave the same way on mobile.
                    if (!p.available) return;
                    e.preventDefault();
                    pick(p.key);
                  }}
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
