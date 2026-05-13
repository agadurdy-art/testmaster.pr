/**
 * Stable client-request-id minting for idempotent backend calls.
 *
 * Why: the writing evaluator (and Smart Practice speaking eval) bill us
 * per Sonnet/Azure call. A flaky network triggering a browser-level
 * fetch retry — or a user mashing Submit — used to double-bill us and
 * produce two distinct evaluations. The backend now caches a successful
 * response for 10 minutes keyed by (user, client_request_id). Frontend's
 * job: include the id on the POST and keep it stable across retries of
 * the *same* submission.
 *
 * Usage:
 *   const idRef = useRef(null);
 *   // on submit start:
 *   if (!idRef.current) idRef.current = mintClientRequestId();
 *   fetch(..., body: JSON.stringify({ ...payload, client_request_id: idRef.current }))
 *   // on success OR after the user navigates away / starts a new essay:
 *   idRef.current = null;
 *
 * A fresh submission (different essay) should rotate the id — otherwise
 * the cache could return last attempt's result. The 10-min TTL bounds
 * stale risk; a manual rotate-on-new-essay is the safe pattern.
 */

export function mintClientRequestId() {
  // Modern browsers + Node 19+ have crypto.randomUUID. Vercel runtime
  // supports it. Fallback exists only for very old contexts; it's not
  // cryptographically strong but is fine for cache keys (collision is
  // astronomically unlikely either way).
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {
    // fall through
  }
  // RFC4122 v4-ish fallback
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
