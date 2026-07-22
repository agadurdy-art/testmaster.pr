# GE (General English) → stemhousebenluc.com — Design Spec

**Date:** 2026-07-22
**Status:** Approved direction (Aga), pending spec review
**Scope:** Two sub-projects, executed in order: (A) bring the GE product back online from this repo; (B) add a Ray English promo section to stemhousebenluc.com linking to it.

---

## Background / verified current state

- The GE product (dashboard, unified lesson system, Ray tutor, placement test,
  vocab games, Explorer/Learner/Achiever/Master pricing) lives **only in this
  repo** (`~/testmaster-fresh`, GitHub `agadurdy-art/testmaster.pr`). Current
  local branch: `split/ielts` (post-Vite-migration).
- The live domain `testmaster.pro` now serves the **new IELTS app**
  (`~/ielts`, Cloudflare Pages). GE frontend routes were deleted there at
  repo-split time. Verified live: `/landing/ge` returns the IELTS Ace shell
  (route does not exist client-side).
- **The live backend still serves GE endpoints.** `api.testmaster.pro` (Railway)
  runs a pre-split monolith commit; verified live:
  `GET /api/beginner-english/lessons` → 200.
- Decision (Aga): do **not** port GE into `~/ielts`. GE stays in this repo;
  we deploy its frontend directly from here "for now". A separate GE repo +
  `ge.stemhousebenluc.com` binding is a **later phase, out of scope here**.

## Project A — GE live again at `ge.testmaster.pro`

### What

Build `frontend/` from this repo (branch: `split/ielts`, Vite) and deploy it
as a **new Cloudflare Pages project** with custom domain `ge.testmaster.pro`
(DNS via existing CF zone token `~/.secrets/cf-testmaster-zone.token`).
Backend stays the existing live `api.testmaster.pro`.

### Constraints / decisions

1. **Entry narrowing:** on this deployment, `/` redirects to `/landing/ge`.
   Purpose: the old IELTS surfaces in this build must not become a parallel
   public IELTS site.
2. **`noindex` everywhere** on this deployment (robots meta + `X-Robots-Tag`
   header + robots.txt disallow). No SEO competition with ieltsace.app.
3. **No backend deploy** in this project. Railway is not touched except env:
   `CORS_ORIGINS` gains `https://ge.testmaster.pro`.
4. **Payments:** GE V1 pricing flows (PayPal/VietQR) ship as-is; if a flow is
   found broken during verification it is reported, not silently patched.

### Pre-implementation verification gates (before any deploy)

- **G1 — Auth compat:** the F03 backend hardening (mandatory Bearer token)
  broke the mobile app. Verify this frontend sends the Bearer token on authed
  calls (code inspection + live login test). If it does not, fix in this repo.
- **G2 — DB content:** verify live Mongo still has the unified
  stages/lessons/vocab collections the GE dashboard needs (probe via live GE
  API endpoints, not direct DB access).
- **G3 — Build health:** `npm run build` (Vite) passes on `split/ielts`;
  smoke-test the GE routes locally against `api.testmaster.pro`.

### ⚠️ Operational landmine (must be recorded in memory)

The next `railway up` from `~/ielts/backend` **deletes the GE backend routes**
(that repo has no `routes/ge`). Until GE gets its own repo/backend, every
ielts backend deploy must first confirm GE endpoints won't be lost, or GE goes
down silently. → Write a memory file + note in both repos' docs.

### Acceptance (Project A)

- `https://ge.testmaster.pro` → 301/302 → `/landing/ge`, renders GE landing.
- Full E2E on live: GE signup → path lands on `/ge/dashboard` → open one
  unified lesson → placement test loads. (Per global rule: no "deployed"
  claim before push/deploy is verified live.)
- `noindex` verified in response headers/meta.
- CORS: no console CORS errors on live GE flows.

## Project B — stemhousebenluc.com: Ray English section

Repo: `~/stemhousebenluc-` (Next.js 15 App Router + next-intl VI/EN, Vercel,
branch `claude/stemhouse-landing-page-YeWj3`).

### What

1. **Remove `SummerBanner`** from the home page (summer course is over):
   component usage removed, component file + its i18n keys deleted from
   `messages/vi.json` / `messages/en.json`.
2. **Add `RayEnglishBanner`** section in its place
   (`src/components/sections/RayEnglishBanner.tsx`):
   - Stemhouse design language (brand orange/cream/green tokens, Fraunces/
     Inter, glass morphism per site rule for new surfaces, site motion
     grammar: 0.85–0.9s, cubic-bezier(0.16,1,0.3,1), viewport once/-80px,
     reduced-motion respected).
   - Content: "Ray English — online General English" promo; Ray logo asset
     (`ray-english-logo.png` from this repo, copied into stemhouse
     `/public/materials/`). Naming decision: **Ray English** (not "Aga
     English" — public-content naming rule).
   - Copy written in EN, translated to VI **in-session** into
     `messages/{vi,en}.json` (no hardcoded strings).
3. **CTA:** button → `https://ge.testmaster.pro/landing/ge` (external,
   `target="_blank" rel="noopener"`). Programs roadmap (5-stop SVG) is NOT
   touched.
4. **Order gate:** Project B deploys only after Project A is live-verified —
   never a dead CTA.
5. **Design gate:** mandatory `design-review` pass (screenshots desktop +
   mobile) before "done".

### Acceptance (Project B)

- Home no longer renders SummerBanner; no orphaned i18n keys; build passes.
- RayEnglishBanner renders in VI and EN; CTA opens live GE landing.
- Deployed to Vercel prod on the project's branch; verified live.
- design-review pass completed.

## Out of scope (explicit)

- Separate GE repo / `ge.stemhousebenluc.com` subdomain (later phase).
- Any port of GE code into `~/ielts`.
- Backend redeploy, GE pricing redesign, GE content changes.
- Stemhouse `/programs` page changes beyond what home requires.

## Risks

| Risk | Mitigation |
|---|---|
| F03 Bearer hardening breaks old frontend auth | Gate G1 before deploy; fix token wiring in this repo if needed |
| GE Mongo content missing/stale | Gate G2 probe; if missing, stop and report (content migration is a separate decision) |
| ielts backend deploy wipes GE endpoints later | Memory note + docs note in both repos (the landmine) |
| Old IELTS surfaces leak from ge.testmaster.pro | `/`→`/landing/ge` redirect + noindex |
| Payments on V1 GE flows may be stale | Verify during E2E; report findings, no silent fixes |
