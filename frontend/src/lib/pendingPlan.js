// Small utility for the signup → checkout handoff.
//
// When a logged-out user clicks a plan CTA on the pricing page, they end up
// at /signup?plan=weekly (etc). SignupBridge stashes the plan here so that
// after auth + onboarding completes we can bounce them to the right place
// instead of dropping them on /dashboard.

const KEY = 'testmaster_pending_plan';
const INTENT_KEY = 'testmaster_pending_intent';
const CUSTOM_META_KEY = 'testmaster_pending_custom_meta';
const PAID = new Set(['weekly', 'monthly', 'exam', 'custom']);
const INTENTS = new Set(['writing', 'speaking', 'liz']);

export function stashPendingPlan(plan) {
  if (!plan) return;
  if (plan !== 'free' && !PAID.has(plan)) return;
  try {
    window.localStorage.setItem(KEY, plan);
  } catch (_) { /* non-fatal */ }
}

// Custom plan needs extra price + duration that aren't part of the plan key.
// Stash them alongside the plan so the post-auth redirect can rebuild the
// correct slider state on /pricing.
export function stashPendingCustomMeta(price, days) {
  if (!price || !days) return;
  try {
    window.localStorage.setItem(
      CUSTOM_META_KEY,
      JSON.stringify({ price: String(price), days: Number(days) }),
    );
  } catch (_) { /* non-fatal */ }
}

export function consumePendingCustomMeta() {
  try {
    const raw = window.localStorage.getItem(CUSTOM_META_KEY);
    if (raw) window.localStorage.removeItem(CUSTOM_META_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

export function peekPendingCustomMeta() {
  try {
    const raw = window.localStorage.getItem(CUSTOM_META_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
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
  if (plan === 'custom') {
    // Pull stashed price/days back into the URL so PricingPageV2 can prime
    // the slider to the same selection the user made before signup.
    const meta = peekPendingCustomMeta();
    if (meta && meta.price && meta.days) {
      return `/pricing?plan=custom&price=${encodeURIComponent(meta.price)}&days=${meta.days}`;
    }
    return '/pricing?plan=custom';
  }
  if (PAID.has(plan)) return `/pricing?plan=${plan}`;
  return null;
}

// Intent handoff — parallels the plan handoff. Landing/sample CTAs pass
// `?intent=writing` (or `speaking`, or `liz`) so that after signup +
// onboarding we can drop the user straight onto the evaluator they came
// for, instead of a generic dashboard. Without this plumbing the intent
// was dropped and users landed on /dashboard with no obvious next step.
export function stashPendingIntent(intent) {
  if (!intent) return;
  const v = String(intent).trim().toLowerCase();
  if (!INTENTS.has(v)) return;
  try {
    window.localStorage.setItem(INTENT_KEY, v);
  } catch (_) { /* non-fatal */ }
}

export function consumePendingIntent() {
  try {
    const intent = window.localStorage.getItem(INTENT_KEY);
    if (intent) window.localStorage.removeItem(INTENT_KEY);
    return intent;
  } catch (_) {
    return null;
  }
}

export function pendingIntentRedirect(intent) {
  if (!intent) return null;
  // Writing intent lands in the Question Bank Task 2 page — that's the
  // real practice flow (model answers, timer, vocab packs, save drafts),
  // not the lighter /writing-practice sandbox. Sample pages preview Task 2
  // so Task 2 is the most contextual landing.
  if (intent === 'writing') return '/question-bank/writing/task2';
  if (intent === 'speaking') return '/speaking/v2';
  if (intent === 'liz') return '/liz';
  return null;
}
