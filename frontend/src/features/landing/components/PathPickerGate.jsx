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
  // GE redirects to /signup, which on mobile can take 100–500ms to start.
  // Keep the gate visible with a loading state during that window so the
  // tap registers a visible commit instead of a brief blank screen
  // (Fix #C — Aga's "confirm yok / ilerleme yok" mobile observation).
  const [loadingPath, setLoadingPath] = useState(null);

  useEffect(() => {
    // Always start with an empty choice. Aga's earlier complaint was
    // "testmaster.pro yazinca path picker cikmali, ielts landpage degil"
    // — the cached sessionStorage choice kept the modal hidden on revisits
    // within the same tab. Picker should always show on root for
    // unauthenticated visitors. The localStorage `testmaster_onboarding_path`
    // hint is still written on pick() so SignupBridge / onboarding pick it
    // up post-signup.
    setResolved(true);
  }, []);

  function pick(key) {
    if (loadingPath) return; // ignore double-taps while redirecting
    try {
      sessionStorage.setItem(STORAGE_KEY, key);
      // Hand the choice to the onboarding flow so SignupBridge doesn't need a
      // `?path=...` query param to know which product surface the user wants.
      // Onboarding hint still lives in localStorage because the signup
      // round-trip can outlast a session.
      localStorage.setItem(ONBOARDING_PATH_KEY, key);
    } catch (_) {
      // ignore write failures — user can still proceed this session
    }
    if (key === 'general' && typeof window !== 'undefined') {
      // Show "Loading General English…" inside the modal so the tap has
      // visible feedback before the browser navigates away. GE goes to
      // its own landing (/landing/ge — Ray-centric, GE-flavoured), not
      // the IELTS landing or straight to signup.
      setLoadingPath(key);
      window.location.assign('/landing/ge');
      return;
    }
    setChoice(key);
  }

  // Avoid flashing the gate before we've read storage.
  if (!resolved) return null;

  const showGate = !choice || loadingPath;

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
              {loadingPath === 'general'
                ? 'Opening General English with Ray…'
                : 'Pick a track to see a tailored landing. You can change this later.'}
            </p>
            <div className="path-gate-options">
              {PATHS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  className={`path-gate-option ${p.available ? '' : 'is-soon'} ${loadingPath === p.key ? 'is-loading' : ''}`}
                  onClick={() => p.available && pick(p.key)}
                  onTouchEnd={(e) => {
                    // Mobile Safari occasionally swallows the synthetic
                    // click after a touch when the button also navigates
                    // away (Fix #C — GE path picker stuck on mobile).
                    // Treating touchend as the commit signal makes both
                    // tracks behave the same way on mobile.
                    if (!p.available || loadingPath) return;
                    e.preventDefault();
                    pick(p.key);
                  }}
                  disabled={!p.available || !!loadingPath}
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
            try { sessionStorage.removeItem(STORAGE_KEY); } catch (_) {}
            setChoice(null);
          }}
          aria-label="Switch path"
        >
          Switch path
        </button>
      )}
    </>
  );
}
