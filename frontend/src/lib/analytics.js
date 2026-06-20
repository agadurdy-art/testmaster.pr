// Lightweight analytics shim. GA4 (gtag) + PostHog are both loaded in
// public/index.html; this wraps them so call sites don't have to null-check
// window.gtag / window.posthog or worry about either being blocked by an ad
// blocker. Every call is best-effort and never throws.
//
// Primary use: measure the paid-social funnel (TikTok ad → /start landing →
// account signup). Mark `sign_up` as a Key Event in GA4 to read the real
// conversion rate against /start page_views.

// Capture UTM params on first paid-social arrival and persist them for the
// length of the browser session, so a signup that happens after a redirect
// round-trip (e.g. Google OAuth, which strips the query string) can still be
// attributed back to the campaign that drove it.
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

export function captureUtm() {
  try {
    const sp = new URLSearchParams(window.location.search);
    const found = {};
    UTM_KEYS.forEach((k) => {
      const v = sp.get(k);
      if (v) found[k] = v;
    });
    if (Object.keys(found).length) {
      window.sessionStorage.setItem('tm_utm', JSON.stringify(found));
    }
  } catch (_) { /* non-fatal */ }
}

export function getUtm() {
  try {
    return JSON.parse(window.sessionStorage.getItem('tm_utm') || '{}') || {};
  } catch (_) {
    return {};
  }
}

export function track(event, params = {}) {
  const payload = { ...getUtm(), ...params };
  try { if (typeof window !== 'undefined' && window.gtag) window.gtag('event', event, payload); } catch (_) { /* non-fatal */ }
  try { if (typeof window !== 'undefined' && window.posthog) window.posthog.capture(event, payload); } catch (_) { /* non-fatal */ }
}
