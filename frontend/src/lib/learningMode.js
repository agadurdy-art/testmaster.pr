// Small helpers for the IELTS-vs-General-English split.
//
// After 2026-04-19 the IELTS side gets the new D1/D3/D4/D7 designs (V2 pages),
// while General English users keep the existing pre-redesign pages. We route
// off the user's `learning_mode` field ("ielts" | "general_english") which is
// set during onboarding.
//
// Fallback: if learning_mode is missing (legacy users pre-schema or users who
// haven't finished onboarding yet), treat them as IELTS — that's the primary
// product, and LandingPageV2 + the dual-path cards on the dashboard give GE
// users a path to switch modes.

export function isIeltsMode(user) {
  if (!user) return true; // logged-out visitors see IELTS (primary brand)
  const mode = (user.learning_mode || '').toLowerCase();
  if (mode === 'general_english' || mode === 'general' || mode === 'ge') return false;
  return true;
}

export function isGeneralEnglishMode(user) {
  return !isIeltsMode(user);
}
