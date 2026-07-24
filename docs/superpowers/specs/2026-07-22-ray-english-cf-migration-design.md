# Ray English standalone repo + stemhouse Cloudflare migration — Design

Date: 2026-07-22
Status: Approved by Aga (design presented in session, "onay")
Amended: 2026-07-24 — Aga: "railway içinde ayrı GE için yeni yer aç" → the copied
backend IS deployed, to a **new dedicated Railway project** (`ray-english`).
This defuses the testmaster.pr landmine for GE permanently.
Predecessor: `2026-07-22-ge-stemhouse-design.md` (GE revival — shipped, live)

## Problem

1. **IELTS leaks into the GE product.** ge.testmaster.pro is a build of the full
   testmaster-fresh frontend. GE pages render inside the IELTS Ace app shell
   (sidebar, logo, "Meet Liz" onboarding label), and `LoginPage.js:53-58` routes
   users with `learning_mode=ielts` to the IELTS `/dashboard`. Users end up in
   the wrong product.
2. **stemhousebenluc.com is on Vercel** and Aga wants off it entirely: hosting,
   portal storage (@vercel/blob), analytics, and DNS (nameservers are
   ns1/ns2.vercel-dns.com). Recurring deploy trap: branch pushes sometimes build
   only a Preview, silently leaving production stale.
3. **Final addressing:** GE should live at `ge.stemhousebenluc.com` under the
   stemhouse brand, with ge.testmaster.pro redirecting there.

## Decisions (Aga, 2026-07-22)

- Copy **frontend + backend** into the new repo. **(Amended 2026-07-24)** The
  backend IS deployed — to a **new dedicated Railway project `ray-english`**
  (own service, own domain), so GE never depends on the fragile
  `testmaster.pr` snapshot again. `api.testmaster.pro` stays untouched and
  serves as instant rollback (rebuild frontend with the old URL) until the new
  backend is live-verified.
- **Delete IELTS completely** from the new repo — pure GE app. Login always lands
  on `/ge/dashboard` regardless of `learning_mode`.
- **Full migration** of stemhouse to Cloudflare Workers via OpenNext, including
  storage (R2) — not a partial/hosting-only move.
- Repo name **`ray-english`** (GitHub `agadurdy-art/ray-english`, private).
  Final public address **`ge.stemhousebenluc.com`**.

## Phase F1 — `~/ray-english` repo (pure GE app)

**Source:** copy of `~/testmaster-fresh` working tree (frontend + backend), fresh
git history, pushed to private GitHub `agadurdy-art/ray-english`.

**Deletions / rewiring (frontend):**
- Remove all IELTS routes, pages, and components: IELTS dashboard, test modules
  (Listening/Reading/Writing/Speaking IELTS surfaces), Liz IELTS surfaces,
  IELTS pricing/landing variants, IELTS sidebar entries.
- Login/signup flow: always redirect to `/ge/dashboard`; delete the
  `learning_mode=ielts` branch (`LoginPage.js:53-58` behavior).
- Branding: Ray-English-only. Replace IELTS Ace logo on signup/login, fix the
  "Meet Liz" onboarding step label, purge IELTS copy from shared shell
  (sidebar/header/footer). Remove the "Switch to the IELTS path" landing link.
- Keep: GE landing (`/landing/ge`), GE dashboard, lessons, placement, pricing/ge,
  auth (Bearer token via localStorage `tm_auth_token`), i18n as-is.
- App root `/` redirects to `/landing/ge` (as today via `_redirects`).

**Backend (amended 2026-07-24):** copied into the repo (`backend/`) untouched
and **deployed to a new Railway project `ray-english`** (Dockerfile build,
healthcheck `/api/health`, Railway-generated domain). Env vars are copied
read-only from `testmaster.pr` (`railway variables --json` — never `railway
up` there): `MONGO_URL`, `DB_NAME`, `STATIC_BASE_URL`, `CORS_ORIGINS` (set to
the GE origins), plus any AI keys the snapshot uses (existing product
behavior, not a new paid-API call site). Same Mongo → same users/content/auth
tokens. The frontend's `REACT_APP_BACKEND_URL` points at the new domain only
after the new backend passes smoke + live E2E; `api.testmaster.pro` remains
the instant-rollback URL. A README warning in `backend/` still forbids ever
touching `testmaster.pr` with `railway up`.

**Deploy:** same CF Pages project `ge-testmaster` (direct upload:
`REACT_APP_BACKEND_URL=https://api.testmaster.pro npm run build && npx wrangler
pages deploy build --project-name ge-testmaster`). ge.testmaster.pro is
immediately cleaned of IELTS surfaces. noindex stays for now (removed in F3 on
the new domain).

**Verification:** build green; live E2E on ge.testmaster.pro — signup →
onboarding → /ge/dashboard → Lesson 1 → placement → /pricing/ge; grep the served
bundle for IELTS surface strings (must be absent from user-visible routes);
existing GE test account still works; design-review pass on changed surfaces.

## Phase F2 — stemhouse Vercel → Cloudflare Workers

**Hosting:** `@opennextjs/cloudflare` (same setup as madenvietnam: wrangler,
Workers, R2). Repo stays `~/stemhousebenluc-`.

**Portal storage:** `src/app/api/portal/{login,report/[name]}/route.ts` currently
use `@vercel/blob` (list/put/del) + `BLOB_READ_WRITE_TOKEN`, with `data/*.json`
fallback. Replace with a small storage adapter interface; R2 implementation
(bucket `stemhouse-portal`) as primary, keep the bundled `data/*.json` fallback.
Migrate any existing Vercel Blob reports into R2 during cutover.
`TEACHER_PASSWORD` becomes a Workers secret.

**Analytics:** drop `@vercel/analytics`; add CF Web Analytics beacon. `track()`
becomes a no-op wrapper (custom-event loss accepted; GA4 later = [DECIDE]).

**DNS / cutover:**
1. Deploy + full E2E on `*.workers.dev` first (home VI/EN, all pages, portal
   login + report upload/read/delete against R2, contact form, sitemap/robots).
2. Add `stemhousebenluc.com` zone to Cloudflare account.
3. **Registrar NS change = Aga's manual step** — prepare exact instructions
   (current NS → CF-assigned NS pair).
4. After NS propagation: bind custom domain to the Worker, verify live, then
   retire the Vercel project (delete only after live verification).

## Phase F3 — ge.stemhousebenluc.com + redirect

- CNAME `ge.stemhousebenluc.com` → `ge-testmaster.pages.dev`; attach as second
  custom domain on CF Pages project `ge-testmaster` (wrangler OAuth token —
  zone token lacks Pages scope).
- Add `https://ge.stemhousebenluc.com` to `CORS_ORIGINS` on the **`ray-english`
  Railway project** (GE's own backend after the F1 amendment — no
  `testmaster.pr` involvement at all).
- Remove noindex for the new domain (host-conditional: ge.testmaster.pro keeps
  noindex, or becomes moot once redirected).
- ge.testmaster.pro 301 → ge.stemhousebenluc.com (CF Redirect Rule on
  testmaster.pro zone; zone token has Redirect scope).
- Update stemhouse RayEnglishBanner CTA + any GE i18n URLs to the new domain.
- E2E on the new domain: full signup→lesson flow, CORS preflights, redirect
  chain, noindex/indexability check.

## Order & dependencies

F1 → F2 → F3. F1 is independent. F3 needs the stemhousebenluc.com zone on CF
(created in F2) and benefits from F2's NS cutover being done; the NS change
timing is Aga-gated, so F3 waits on it.

## Error handling / risks

- **Railway landmine:** never `railway up` to `testmaster.pr`. Env-only, and
  after the F1 amendment not even that — GE runs on its own project. Reading
  its variables (`railway variables --json`) is the only permitted contact.
- **Backend parity risk (new):** the repo backend may have drifted from the
  2026-07-03 `testmaster.pr` snapshot. Gate: smoke (`/api/health`, GE route
  existence) + full live E2E against the new backend BEFORE the frontend
  switches to it. Rollback = rebuild frontend with
  `REACT_APP_BACKEND_URL=https://api.testmaster.pro`.
- **CF Pages stale shell:** after each deploy run the targeted purge
  (verify-assets pattern) and hard-reload check — stable-name assets aren't
  purged automatically.
- **Vercel Preview trap (until F2 completes):** verify live strings after every
  stemhouse push; `npx vercel promote` if stuck in Preview.
- **NS cutover risk:** zero-downtime path — import all existing DNS records into
  the CF zone before Aga changes NS; verify with `dig` after propagation.
- **R2 adapter:** keep `data/*.json` fallback so portal reads never hard-fail if
  R2 is briefly unreachable.

## Testing

Each phase gates on live E2E (not just build green): F1 = GE flow on
ge.testmaster.pro + IELTS-absence grep; F2 = workers.dev full-site E2E incl.
portal/R2 round-trip, then post-NS live re-verify; F3 = new-domain E2E + CORS +
redirect. UI-touching changes get a design-review pass.

## Out of scope

- Retiring `testmaster.pr` / api.testmaster.pro (kept as rollback; retirement
  is a later Aga decision once the new backend has run clean).
- A custom domain for the new backend (Railway domain is fine for F1;
  `api.rayenglish...` naming = [DECIDE] later).
- GE content/pedagogy changes; new features. This is a re-homing + purge.
- GA4 / custom event analytics ([DECIDE] later).
- testmaster-fresh repo itself (untouched; 6 unpushed local commits remain
  Aga's decision).
