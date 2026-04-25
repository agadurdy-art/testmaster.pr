import React, { useEffect, useRef, useState } from 'react';
import LizAvatar from './LizAvatar';

/**
 * LizLauncher — sticky bottom-right pill. Expands into a 320px panel with a
 * few quick actions. The primary "Open Liz full screen" action routes anon
 * users to /signup?intent=liz (no /liz deep link for anonymous users because
 * that route already redirects to pricing via canAccessLiz).
 *
 * Kept visual-only (no live chat here); the panel is a fast tease that hands
 * off to the real Liz experience once signed in.
 */

const QUICK_ACTIONS = [
  { label: 'Estimate my writing band', href: '/signup?intent=writing' },
  { label: 'Try a speaking drill',     href: '/speaking/v2' },
  { label: 'Show me a sample report',  href: '/samples/writing/band-6-5-task2' },
];

export default function LizLauncher() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const buttonRef = useRef(null);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return undefined;
    function onDoc(e) {
      if (panelRef.current?.contains(e.target)) return;
      if (buttonRef.current?.contains(e.target)) return;
      setOpen(false);
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="liz-launcher">
      {open && (
        <div ref={panelRef} className="liz-launcher-panel" role="dialog" aria-label="Chat with Liz">
          <div className="liz-launcher-panel-head">
            <LizAvatar size={40} ring />
            <div>
              <div className="liz-launcher-panel-title">Liz</div>
              <div className="liz-launcher-panel-sub">Your AI IELTS coach</div>
            </div>
          </div>
          <p className="liz-launcher-panel-body">
            I can estimate your band, practice speaking with you, or plan your next study session.
            What would you like to do?
          </p>
          <div className="liz-launcher-actions">
            {QUICK_ACTIONS.map((a) => (
              <a key={a.href} href={a.href} className="liz-launcher-action">
                {a.label}
              </a>
            ))}
          </div>
          <a href="/signup?intent=liz" className="btn btn-primary liz-launcher-fullscreen">
            Open Liz full screen
          </a>
        </div>
      )}

      <button
        ref={buttonRef}
        type="button"
        className={`liz-launcher-pill ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? 'Close Liz' : 'Open Liz'}
      >
        <LizAvatar size={32} alt="" />
        <span className="liz-launcher-label">Ask Liz</span>
      </button>
    </div>
  );
}
