import React, { useEffect } from 'react';
import Dashboard from './Dashboard';

/**
 * Dev-only page: render the General English (V1) Dashboard directly,
 * bypassing auth + onboarding + routing. Opens at /dev/ge.
 *
 * Stubs a learning_mode=general_english user into localStorage on mount
 * so child API calls / isIeltsMode() see GE everywhere. Useful for
 * eyeballing the GE UI locally without going through the broken
 * path-picker → onboarding → dashboard chain.
 */
const MOCK_GE_USER = {
  id: 'dev-ge-preview',
  email: 'dev-ge@testmaster.local',
  name: 'GE Preview',
  learning_mode: 'general_english',
  onboarding_complete: true,
  subscription_tier: 'free',
  is_verified: true,
  current_level: 'B1',
  target_level: 'B2',
};

export default function DevGePreview() {
  useEffect(() => {
    // Force a clean App.js mount with the mock user — otherwise App's
    // in-memory `user` state from a previous login still wins, and
    // /dashboard keeps rendering IELTS Ace.
    try {
      const current = localStorage.getItem('user');
      const desired = JSON.stringify(MOCK_GE_USER);
      if (current !== desired) {
        localStorage.setItem('user', desired);
        window.location.replace('/dev/ge?_=' + Date.now());
        return;
      }
    } catch (_) {
      /* non-fatal */
    }
  }, []);

  return <Dashboard user={MOCK_GE_USER} onLogout={() => {}} />;
}
