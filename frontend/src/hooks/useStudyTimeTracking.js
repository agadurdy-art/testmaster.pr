/**
 * useStudyTimeTracking
 * --------------------
 * Mounted once at the top of the app. Sends a 30s heartbeat to the backend
 * for the *current route* whenever the tab is visible AND the user has been
 * active in the last 60s (mouse / key / touch / scroll).
 *
 * The clock pauses (no heartbeat fires, no seconds accumulate) when:
 *   - document is hidden (background tab, screen off)
 *   - no input event in 60s (fell asleep, walked away)
 *
 * On `pagehide` / unmount we flush whatever partial seconds were accumulated.
 *
 * Backend caps each heartbeat at 120s and total/day at 8h, so honest
 * over-reporting from a stuck client is bounded.
 */
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const HEARTBEAT_MS = 30_000;       // send every 30s
const IDLE_TIMEOUT_MS = 60_000;    // pause after 60s of no input
const API_URL = process.env.REACT_APP_BACKEND_URL || '';

export default function useStudyTimeTracking(userId) {
  const location = useLocation();
  const lastTickRef = useRef(Date.now());
  const lastActivityRef = useRef(Date.now());
  const accumulatedRef = useRef(0); // seconds buffered, not yet flushed
  const routeRef = useRef(location.pathname);

  // Track current route in a ref so the interval handler always sees the
  // latest path without restarting the timer.
  useEffect(() => {
    // When the route changes, flush whatever we accumulated for the old one.
    if (accumulatedRef.current > 0 && userId) {
      sendHeartbeat(userId, routeRef.current, accumulatedRef.current);
      accumulatedRef.current = 0;
    }
    routeRef.current = location.pathname;
    lastTickRef.current = Date.now();
  }, [location.pathname, userId]);

  // Activity listeners — any of these resets the idle clock.
  useEffect(() => {
    const onActivity = () => {
      lastActivityRef.current = Date.now();
    };
    const opts = { passive: true };
    window.addEventListener('mousemove', onActivity, opts);
    window.addEventListener('mousedown', onActivity, opts);
    window.addEventListener('keydown', onActivity, opts);
    window.addEventListener('touchstart', onActivity, opts);
    window.addEventListener('scroll', onActivity, opts);
    return () => {
      window.removeEventListener('mousemove', onActivity);
      window.removeEventListener('mousedown', onActivity);
      window.removeEventListener('keydown', onActivity);
      window.removeEventListener('touchstart', onActivity);
      window.removeEventListener('scroll', onActivity);
    };
  }, []);

  // Reset the tick clock when the tab becomes visible — we do NOT want to
  // count the time the tab was hidden.
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        lastTickRef.current = Date.now();
        lastActivityRef.current = Date.now();
      } else if (accumulatedRef.current > 0 && userId) {
        // Flush on hide so we don't lose buffered seconds if the user
        // closes the tab.
        sendHeartbeat(userId, routeRef.current, accumulatedRef.current);
        accumulatedRef.current = 0;
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [userId]);

  // Main heartbeat loop.
  useEffect(() => {
    if (!userId) return undefined;

    const id = setInterval(() => {
      const now = Date.now();
      const delta = now - lastTickRef.current;
      lastTickRef.current = now;

      const visible = document.visibilityState === 'visible';
      const idleFor = now - lastActivityRef.current;
      const active = idleFor < IDLE_TIMEOUT_MS;

      if (!visible || !active) return; // pause: don't add seconds

      // Cap delta to a single tick window so a long pause (e.g. system
      // sleep that didn't fire visibilitychange in time) can't dump a
      // huge number into the bucket.
      const seconds = Math.min(Math.round(delta / 1000), HEARTBEAT_MS / 1000 + 5);
      accumulatedRef.current += seconds;

      // Flush whenever the buffer reaches the heartbeat threshold.
      if (accumulatedRef.current >= HEARTBEAT_MS / 1000) {
        sendHeartbeat(userId, routeRef.current, accumulatedRef.current);
        accumulatedRef.current = 0;
      }
    }, HEARTBEAT_MS);

    return () => clearInterval(id);
  }, [userId]);

  // Best-effort flush on full unmount / hard navigation.
  useEffect(() => {
    const onPageHide = () => {
      if (accumulatedRef.current > 0 && userId) {
        sendHeartbeat(userId, routeRef.current, accumulatedRef.current, true);
        accumulatedRef.current = 0;
      }
    };
    window.addEventListener('pagehide', onPageHide);
    return () => window.removeEventListener('pagehide', onPageHide);
  }, [userId]);
}

function sendHeartbeat(userId, route, seconds, useBeacon = false) {
  if (!userId || !seconds || seconds < 1) return;
  const body = JSON.stringify({ user_id: userId, route, seconds });
  const url = `${API_URL}/api/study-time/heartbeat`;
  if (useBeacon && navigator.sendBeacon) {
    // sendBeacon fires reliably during pagehide/unload.
    navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }));
    return;
  }
  // Fire-and-forget — failures are not surfaced to the user.
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {});
}
