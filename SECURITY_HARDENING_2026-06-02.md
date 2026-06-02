# Security hardening — backlog #5 (2026-06-02)

Status of the four hardening items from the pre-launch audit, plus the dependency
vulnerability scan (item C). Branch `conflict_280426_1612`.

## A) Rate limiting — ✅ DONE + tested
In-memory, IP-based sliding-window limiter. No new deps, no Redis (single Railway
instance). Fail-open (limiter errors never block requests).
- File: `backend/ratelimit.py`; wired as HTTP middleware in `backend/server.py`.
- Buckets (per client IP; X-Forwarded-For aware; OPTIONS skipped):
  | surface | limit | window | why |
  |---|---|---|---|
  | `evaluate-anonymous` | 12 | 1h | unauthenticated LLM eval — quota can't protect it |
  | auth email senders (forgot/reset/resend/verify) | 6 | 15m | email-bomb |
  | auth (login/register/facebook/google-session) | 12 | 5m | brute-force |
  | `/evaluate*` (LLM-backed) | 45 | 5m | burst/cost (per-user quota still applies) |
  | study-time heartbeat | 150 | 1m | flood cap |
- Tunable via env `RATE_LIMIT_FACTOR` (scales all limits; 0 = disable).
- Tested: unit (counts + per-IP isolation) + ASGI integration (12×200 then 429,
  Retry-After header present) for both auth and anonymous-eval buckets.
- ⚠️ If the backend is ever scaled to multiple instances, move the store to Redis.

## C) Dependency vulnerabilities — ✅ DONE (scanned + bumped + tested)
**Shipped:** backend bumped pymongo 4.6.3, pillow 12.2.0, python-multipart 0.0.27,
Werkzeug 3.1.6, lxml 6.1.0, PyJWT 2.13.0, idna 3.15, python-dotenv 1.2.2, pyasn1 0.6.3,
Pygments 2.20.0 (all import-tested clean in a fresh venv). Frontend axios → 1.16.1 (fixes
the SSRF + prototype-pollution highs + transitive follow-redirects/form-data).
**Left intentionally:** `litellm` stays 1.79.3 — bumping to 1.83.7 forces aiohttp 3.13.5,
and litellm is NOT used by the live service (only offline content scripts via
`emergentintegrations`, which isn't even in requirements.txt). Bump litellm+aiohttp
together only when those scripts are next touched — or better, remove
emergentintegrations+litellm as dead weight (see dead-code cleanup task).
Note: local full `pip install -r` fails on grpcio-status under Python 3.14 (no cp314
wheel) — that's a LOCAL env quirk; Railway's Python has wheels.

### (original scan detail below)
`pip-audit` (backend) + `npm audit --registry=npmjs.org` (frontend). Bumping these
touches production, so do it as ONE tested batch (boot backend + smoke-test evals/DB),
NOT a blind push.

**Backend (pip) — prioritized:**
- 🔴 HIGH / core (test before ship):
  - `litellm` 1.79.3 → 1.83.7 — LLM gateway, whole eval pipeline. 4 CVEs. Biggest break risk.
  - `pymongo` 4.5.0 → 4.6.3 — DB driver (CVE-2024-5629).
  - `pillow` 12.0.0 → 12.2.0 — 6 CVEs, image processing.
- 🟡 MED (low break risk):
  - `python-multipart` 0.0.20 → 0.0.27 — form/upload DoS (3 CVEs).
  - `werkzeug` 3.1.4 → 3.1.6, `lxml` 6.0.2 → 6.1.0, `PyJWT` 2.10.1 → 2.13.0
    (auth uses opaque DB tokens, not JWT — verify JWT isn't in the OAuth path first).
- 🟢 LOW / patch (safe): `idna` 3.11→3.15, `python-dotenv` 1.2.1→1.2.2,
  `pyasn1` 0.6.1→0.6.3, `Pygments` 2.19.2→2.20.0, `pytest` (dev only).

**Frontend (npm) — prioritized:**
- 🔴 `axios` ^1.8.4 → ≥1.13 — HIGH: SSRF via no_proxy bypass + prototype-pollution
  credential injection. axios carries every API call. Bump + re-run build/login.
- 🟡 transitive: `follow-redirects`, `@tootallnate/once` (resolve via `npm update`).
- Note: repo's npm registry is npmmirror (no audit endpoint) — audit ran against npmjs.

## B) Token → httpOnly cookie — ⏳ pending (auth-flow change, needs care)
Today: opaque DB token in `localStorage` (`tm_auth_token`) + Bearer header. Moving to
an httpOnly cookie reduces XSS token theft but adds CSRF handling (SameSite + CSRF token
or strict same-site) and changes both `backend/auth_session.py` issuance and the frontend
fetch/axios wiring. Moderate risk; must be tested end-to-end (login, 401-redirect,
study-time sendBeacon). Recommend doing it as its own focused change.

## D) GE per-plan quota — ⏳ blocked on product decision
GE plans (explorer/learner/achiever/master) have speaking-quota *fallbacks* in
`services/usage_tracking.py`, but a full per-plan GE quota matrix (listening/writing/
speaking counts per GE tier) isn't defined/locked the way IELTS tiers are. Need the GE
quota numbers from Aga before wiring `increment_usage` across all GE evaluator endpoints.
Not inventing numbers (founder rule).

## Suggested order to finish
1. Ship A (rate-limiting) — safe, high value. ← ready now
2. C remediation as a tested batch (boot backend, bump, smoke-test) — start with axios
   (frontend) + litellm/pymongo (backend).
3. B httpOnly cookie — own change, fully tested.
4. D — once Aga provides the GE per-plan quota matrix.
Also pending (not #5): `#6` key rotation (Faz 6) / JWT (Faz 7); ElevenLabs `sk_6d53…`
revocation (Aga's dashboard action).
