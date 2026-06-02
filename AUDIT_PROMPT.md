# TestMaster / IELTS Ace — Full Code & Architecture Audit Prompt

> Paste this whole file as the task into Codex **and** Claude Code (separately).
> Both run read-only and produce a findings report. Use each tool's own
> search/read abilities — do not assume any specific commands.

---

## ROLE
You are a senior staff engineer doing a rigorous, read-only audit of a live
production codebase. Your goal is to find **real, verifiable** defects and
architectural weaknesses — not style nits, not speculation. Every finding must
be backed by exact `file:line` evidence you have actually read.

## REPO
- Root: `/Users/aga/testmaster-fresh`
- Frontend: React (CRA + craco), `frontend/src/**` (lazy-loaded routes, react-router)
- Backend: FastAPI, `backend/` — `server.py` + `backend/routes/*.py` + `backend/services/*.py`
- Data: MongoDB Atlas, Cloudflare R2 (assets/audio)
- Email: Resend. TTS: Edge TTS (default) + ElevenLabs (premium). STT/pron: Azure.
- LLM: Anthropic (Sonnet for evaluations, Haiku for helpers) + OpenAI. **No Gemini.**
- Deploy: Vercel (frontend, `api.testmaster.pro` baked as `REACT_APP_BACKEND_URL`)
  + Railway (backend) + Atlas + R2. `vercel.json` rewrites SPA; `/api/*` is NOT
  proxied — the frontend calls `api.testmaster.pro` directly.

## TWO-PRODUCT MODEL (critical invariants — verify they hold everywhere)
- **IELTS Ace** (tutor "Liz") home = `/dashboard` — must ALWAYS render IELTS.
- **General English / GE** (tutor "Ray") home = `/ge/dashboard` — must ALWAYS render GE.
- A user's product = `user.learning_mode` (`'ielts' | 'general_english' | 'both' | null`).
- Helper `homePath(user)` in `frontend/src/lib/learningMode.js` is the single
  source of truth for "which home". Product intent flows through the URL
  (`?path=ielts|general`) → DB `learning_mode` → localStorage hint → IELTS default.
- The cross-product switcher (`components/ProductSwitcher.jsx`) is **admin-only**
  (`isAdminUser` from `lib/planAccess.js`).
- Tier quotas are LOCKED: Free $0 (5 Listening / 1 Writing / 1 Speaking),
  Weekly $2.99 (20/3/2), Monthly $9.99 (100/10/10), Exam $19.99 (200/25/15).
- Payments: PayPal (Subscriptions for Weekly/Monthly via plan IDs in env;
  Orders for Exam/Custom) + SePay (VND). V1 GE pricing is a separate source.
- Anonymous trials are intentionally limited (e.g. speaking = 1 part then login;
  essay eval = one-per-email; anon TTS = cache-only). These limits MUST hold.

## HOW TO WORK
1. **Map first.** Before judging, build a mental model: routing table, auth flow
   (email + Google OAuth), the request/response contract between frontend and
   backend, the data models, and where money/quotas/secrets are touched.
2. **Verify before reporting.** Open and read the actual code for every claim.
   If you cannot confirm it by reading the code, label it `UNVERIFIED` and say
   what you'd need to check. Do NOT report plausible-but-unconfirmed issues as
   real. Zero false positives is the bar.
3. **Trace end-to-end** for the risky flows (below), not just single files.
4. **Do not modify any files.** Read-only.

## AUDIT DIMENSIONS (work through each; use the project-specific checks)

### A. Correctness & logic bugs
- Off-by-one, wrong conditionals, inverted booleans, mishandled null/undefined,
  wrong async/await (missing `await`, unhandled promise), stale closures,
  `useEffect` dependency bugs, state set from non-reference-stable values.
- Scoring/band math (e.g. level test, evaluators) producing wrong numbers.

### B. Security & secrets
- Secrets leaking into the **frontend bundle** (`build/static/js/*`): any API
  key, token, or private string that should be server-side only. (Note: the
  backend base URL and PUBLIC PayPal client/plan IDs are expected; private keys
  are NOT.)
- Hardcoded credentials in source or committed `.env*` (vs gitignored local `.env`).
- Auth bypass, missing authz checks on backend endpoints (especially anything
  under `/api/admin/*`, user-data mutation, payment confirmation, credit grants).
- `is_admin_email` / `ADMIN_EMAILS` gating: any admin endpoint that accepts an
  `admin_email` query param with no real proof of identity (impersonation risk).
- IDOR: endpoints taking `user_id` in the path/body without verifying the caller
  owns it (e.g. `/api/users/{id}/...`, onboarding, usage, credits).
- Prompt injection into LLM calls from user content; missing input sanitization.
- CORS config, open redirects, SSRF in any URL-fetching code, file-upload checks.

### C. Auth, authorization & product separation
- Trace login (email + Google OAuth) and signup end-to-end. Confirm post-auth
  redirects are deterministic and never land a user in the wrong product.
- Confirm `/dashboard` ALWAYS renders IELTS and `/ge/dashboard` ALWAYS GE; find
  any remaining `learning_mode`/`isIeltsMode` branch that could leak products.
- Find any "Back to Dashboard"/home link that sends a GE user to `/dashboard`
  (should be `homePath(user)` or `/ge/dashboard`), or an IELTS user to GE.
- Find bare `/login` or `/signup` CTAs that drop product intent (`?path=`).
- JWT/session: expiry, refresh, storage (localStorage vs httpOnly), logout
  fully clearing per-user state on shared devices.

### D. Payments & billing
- PayPal: correct plan-ID → tier mapping from env; subscription vs order flow
  used for the right tiers; webhook/return verification; double-charge or
  free-upgrade paths; what happens if the capture call fails after redirect.
- SePay (VND): amount correctness, idempotency, monthly_usage reset logic.
- Can a user reach a paid tier without a verified successful payment? Trace it.

### E. Quotas / tiers / access control
- Verify the LOCKED quota numbers are actually enforced server-side (not just
  shown in UI). Find any client-only gate that the API doesn't also enforce.
- Anonymous trial limits (speaking 1 part, essay one-per-email, anon TTS
  cache-only): confirm they can't be bypassed by replaying requests or clearing
  client storage.

### F. Data integrity & DB
- Mongo writes without validation; missing indexes on hot queries; unbounded
  `.to_list(N)` truncation that silently drops data; inconsistent field names
  between writers and readers; partial-update races.

### G. LLM usage (cost & policy)
- Evaluations MUST use Sonnet (calibration); helpers use Haiku. Flag any
  evaluator silently using a weaker/stronger model, or GPT-4o left in a hot path.
- **No Gemini** in any live path; **no paid image-generation APIs** called from
  scripts/runtime (OpenAI gpt-image-1, Replicate, Stability). Flag any such call.
- Missing prompt caching, unbounded token usage, retries that re-bill, requests
  without timeouts.

### H. API contracts (frontend ↔ backend)
- Frontend calling endpoints that don't exist / wrong method / wrong shape;
  backend returning a shape the frontend doesn't handle; `[object Object]` /
  unparsed-JSON rendering; error responses surfaced as broken UI.

### I. Error handling & resilience
- Swallowed exceptions that hide failures; missing fallbacks on third-party
  calls (Resend/ElevenLabs/Azure/R2/LLM); user-facing flows that dead-end on
  error instead of degrading gracefully.

### J. Concurrency / races / idempotency
- Payment confirmation, credit grants, quota decrements, onboarding writes:
  are they idempotent and race-safe? Double-submit, retry, and parallel-tab cases.

### K. Frontend state & routing
- `useEffect` + `navigate` races; redirect loops; flashes of the wrong surface;
  protected routes reachable while logged out (or vice-versa); lazy-chunk load
  failures with no boundary.

### L. Performance
- N+1 backend queries; large synchronous work on the request path; oversized
  frontend bundles / unnecessary eager imports; images served unoptimized.

### M. i18n (12 languages)
- Missing keys (raw key shown to user), hardcoded English strings in translated
  surfaces, wrong locale wiring (e.g. `mandarin` vs `zh`).

### N. Dead code, config drift & deploy
- Unused/duplicate components, two helpers doing the same thing (drift risk),
  stale routes, hardcoded paths that fail in the Railway/Vercel container,
  `vercel.json` / build-config mismatches.

## OUTPUT FORMAT
Produce a single Markdown report:

1. **Summary table** — every finding as one row:
   `ID | Severity | Confidence | Area | file:line | One-line title`
   Severity: `P0` (security/data-loss/payment/auth/wrong-product), `P1` (broken
   feature), `P2` (degraded/edge), `P3` (minor/cleanup). Confidence: `High |
   Medium | Low`.
2. **Findings (detailed)** — for each:
   - **What**: the bug, in one or two sentences.
   - **Where**: exact `file:line` + a short quoted code excerpt you read.
   - **Why it's wrong / impact**: concrete consequence.
   - **Repro / trace**: the path that triggers it.
   - **Suggested fix**: minimal-diff direction (don't rewrite the world).
3. **Architecture observations** — systemic issues (coupling, missing layers,
   fragile patterns like over-reliance on localStorage, duplicated sources of
   truth) even if no single line is "the bug".
4. **What I could NOT verify** — list anything you flagged `UNVERIFIED` and why.

## RULES
- Read-only. Cite real `file:line`. No invented paths or symbols.
- Prefer fewer, high-confidence findings over a long speculative list.
- If two findings share a root cause, group them.
- Call out explicitly when something you expected to be a bug is actually fine.
