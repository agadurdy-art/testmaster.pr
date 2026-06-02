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
