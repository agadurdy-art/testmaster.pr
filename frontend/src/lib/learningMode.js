// Small helpers for the IELTS-vs-General-English split.
//
// After 2026-04-19 the IELTS side gets the new D1/D3/D4/D7 designs (V2 pages),
// while General English users keep the existing pre-redesign pages. We route
// off the user's `learning_mode` field ("ielts" | "general_english") which is
// set during onboarding.
//
// Fallback chain (in order):
//   1. user.learning_mode if explicitly set
//   2. localStorage.testmaster_onboarding_path / tm_demo_path — the
//      PathPickerGate hint. This is the safety net: if anything in the
//      onboarding chain silently fails to persist learning_mode (backend
//      404, response parse, race between setUser + navigate, etc.), the
//      path the user originally picked still wins. Without this fallback,
//      GE users got dropped onto the IELTS dashboard after onboarding —
//      a critical regression that survived 4 rounds of "fix the chain"
//      work, so we now hard-code the safety net instead.
//   3. Default to IELTS (primary brand) for logged-out visitors and
//      legacy users with no path hint at all.

function readPathHint() {
  if (typeof window === 'undefined') return null;
  try {
    const v = (
      window.localStorage.getItem('testmaster_onboarding_path') ||
      window.localStorage.getItem('tm_demo_path') ||
      ''
    ).trim().toLowerCase();
    if (!v) return null;
    if (v === 'ielts' || v === 'ielts_ace' || v === 'ielts-ace') return 'ielts';
    if (v === 'general' || v === 'general_english' || v === 'general-english' || v === 'ge') return 'general_english';
  } catch (_) {
    /* localStorage blocked — fall through */
  }
  return null;
}

export function isIeltsMode(user) {
  if (!user) return true; // logged-out visitors see IELTS (primary brand)
  const mode = (user.learning_mode || '').toLowerCase();
  if (mode === 'general_english' || mode === 'general' || mode === 'ge') return false;
  if (mode === 'ielts') return true;
  // learning_mode is null/missing — fall back to PathPickerGate hint.
  const hint = readPathHint();
  if (hint === 'general_english') return false;
  return true;
}

export function isGeneralEnglishMode(user) {
  return !isIeltsMode(user);
}
