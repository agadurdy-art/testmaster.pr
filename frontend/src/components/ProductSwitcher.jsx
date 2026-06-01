import React, { useState } from 'react';

/**
 * ProductSwitcher — flips the user between the two strictly-separated product
 * surfaces (2026-06-01):
 *   IELTS Ace  → /dashboard      (Liz)
 *   General EN → /ge/dashboard   (Ray)
 *
 * It persists the choice to the user's `learning_mode` (so future bare logins
 * land on the right home) AND to the localStorage path hint, then HARD-navigates
 * to the target home so the app re-reads `user` from localStorage and mounts the
 * target surface cleanly — no stale in-memory learning_mode.
 *
 * `user` is required to persist the choice server-side; `to` is the product to
 * switch INTO ('ielts' | 'general').
 */

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function ProductSwitcher({ user, to, className = '', children }) {
  const [busy, setBusy] = useState(false);
  const wireMode = to === 'general' ? 'general_english' : 'ielts';
  const target = to === 'general' ? '/ge/dashboard' : '/dashboard';
  const label =
    children || (to === 'general' ? 'Switch to General English' : 'Switch to IELTS Ace');

  const persistLocal = (mode) => {
    try {
      localStorage.setItem('testmaster_onboarding_path', to === 'general' ? 'general' : 'ielts');
      if (user) {
        localStorage.setItem('user', JSON.stringify({ ...user, learning_mode: mode }));
      }
    } catch (_) {
      /* non-fatal — hard nav below still carries the path hint where possible */
    }
  };

  const handleClick = async () => {
    if (busy) return;
    setBusy(true);
    persistLocal(wireMode);
    try {
      if (user?.id) {
        const res = await fetch(
          `${API_URL}/api/users/${encodeURIComponent(user.id)}/onboarding`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: wireMode }),
          }
        );
        if (res.ok) {
          const updated = await res.json();
          try {
            localStorage.setItem(
              'user',
              JSON.stringify({ ...user, ...updated, learning_mode: wireMode })
            );
          } catch (_) {
            /* non-fatal */
          }
        }
      }
    } catch (_) {
      /* non-fatal — local hint already set, surface still switches */
    }
    window.location.assign(target);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className={className}
      data-testid={`switch-to-${to}`}
      aria-label={typeof label === 'string' ? label : `Switch to ${to}`}
    >
      {busy ? 'Switching…' : label}
    </button>
  );
}
