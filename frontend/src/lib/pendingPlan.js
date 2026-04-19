// Small utility for the signup → checkout handoff.
//
// When a logged-out user clicks a plan CTA on the pricing page, they end up
// at /signup?plan=weekly (etc). SignupBridge stashes the plan here so that
// after auth + onboarding completes we can bounce them to the right place
// instead of dropping them on /dashboard.

const KEY = 'testmaster_pending_plan';
const PAID = new Set(['weekly', 'monthly', 'exam']);

export function stashPendingPlan(plan) {
  if (!plan) return;
  if (plan !== 'free' && !PAID.has(plan)) return;
  try {
    window.localStorage.setItem(KEY, plan);
  } catch (_) { /* non-fatal */ }
}

export function consumePendingPlan() {
  try {
    const plan = window.localStorage.getItem(KEY);
    if (plan) window.localStorage.removeItem(KEY);
    return plan;
  } catch (_) {
    return null;
  }
}

export function peekPendingPlan() {
  try {
    return window.localStorage.getItem(KEY);
  } catch (_) {
    return null;
  }
}

export function pendingPlanRedirect(plan) {
  if (!plan) return null;
  if (plan === 'free') return '/dashboard';
  if (PAID.has(plan)) return `/pricing?plan=${plan}`;
  return null;
}
