// Opaque session token storage (audit F01/F03). The backend mints this on
// login/register/OAuth; every authenticated request sends it as a Bearer token.
// Kept in localStorage alongside `user` so it survives reloads and is cleared
// together on logout.

const KEY = 'tm_auth_token';

export function getToken() {
  try {
    return window.localStorage.getItem(KEY) || null;
  } catch (_) {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) window.localStorage.setItem(KEY, token);
  } catch (_) {
    /* storage blocked — requests will 401 and bounce to login */
  }
}

export function clearToken() {
  try {
    window.localStorage.removeItem(KEY);
  } catch (_) {
    /* non-fatal */
  }
}

// Convenience for raw `fetch` callers of protected routes.
export function authHeader() {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

// Global fetch wrapper (audit Faz 2): the auth layer gates ~30 user/admin routes,
// and dozens of components call them via raw `fetch()` (not the axios `api`
// instance). Rather than wire each call site — and risk missing one, which would
// 401-break that feature for logged-in users — we monkey-patch window.fetch ONCE
// to attach the session token to same-origin /api/* requests. Auth endpoints are
// excluded (a 401 there is a normal credential error). axios calls are unaffected
// (they use XHR + their own interceptor). Idempotent: never overrides an
// Authorization header a caller already set, and only adds when a token exists.
let _fetchPatched = false;
export function installFetchAuth() {
  if (_fetchPatched || typeof window === 'undefined' || typeof window.fetch !== 'function') return;
  _fetchPatched = true;
  const orig = window.fetch.bind(window);
  const API = process.env.REACT_APP_BACKEND_URL || '';
  window.fetch = (input, init) => {
    try {
      const url = typeof input === 'string' ? input : (input && input.url) || '';
      const token = getToken();
      const isApi = url && (url.startsWith(`${API}/api/`) || url.startsWith('/api/'));
      if (token && isApi && !url.includes('/api/auth/')) {
        const next = init ? { ...init } : {};
        const h = next.headers;
        if (h instanceof Headers) {
          if (!h.has('Authorization')) h.set('Authorization', `Bearer ${token}`);
        } else {
          const obj = { ...(h || {}) };
          const hasAuth = Object.keys(obj).some((k) => k.toLowerCase() === 'authorization');
          if (!hasAuth) obj.Authorization = `Bearer ${token}`;
          next.headers = obj;
        }
        return orig(input, next);
      }
    } catch (_) {
      /* fall through to the original fetch */
    }
    return orig(input, init);
  };
}
