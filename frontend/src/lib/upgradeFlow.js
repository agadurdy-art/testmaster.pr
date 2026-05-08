// Resume-after-upgrade plumbing for the paywall flow.
//
// When a logged-in user hits a 402 mid-task (out of Liz messages, writing
// credits, speaking evals, full-test gate), we want them to:
//   1. Get bounced to /pricing with the stash of where they were.
//   2. Pick a plan and pay.
//   3. After PayPal onApprove, return *to the task they came from* —
//      not /dashboard.
//
// sessionStorage (not localStorage) because this is a single-tab session
// continuation; if the user opens a new tab and starts fresh we don't
// want a stale resume URL hijacking that flow.
//
// Companion to lib/pendingPlan.js, but distinct: pendingPlan is the
// signup → checkout handoff for *logged-out* users; upgradeFlow is the
// logged-in mid-task → pricing → checkout → resume loop.

const KEY = 'testmaster_upgrade_resume';

// Allow-list of "kind" values. Used by the 402 broadcast so the toast
// copy and post-checkout return path can be tailored. Keep in sync with
// backend `kind` field in structured 402 payloads.
const KINDS = new Set(['liz', 'writing', 'speaking', 'full_test', 'mocks']);

export function stashUpgradeResume({ from, kind, label } = {}) {
  if (!from) return;
  const safeKind = KINDS.has(kind) ? kind : null;
  try {
    window.sessionStorage.setItem(
      KEY,
      JSON.stringify({
        from: String(from),
        kind: safeKind,
        label: label ? String(label) : null,
        stashed_at: new Date().toISOString(),
      }),
    );
  } catch (_) { /* private mode etc — non-fatal */ }
}

export function peekUpgradeResume() {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

export function consumeUpgradeResume() {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (raw) window.sessionStorage.removeItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

// Resolve where the post-checkout flow should land. Falls back to
// /dashboard if no stash is present (cold pricing visit).
export function resolvePostCheckoutDestination() {
  const resume = consumeUpgradeResume();
  if (resume && resume.from && typeof resume.from === 'string' && resume.from.startsWith('/')) {
    return resume.from;
  }
  return '/dashboard';
}
