# GE Revival (ge.testmaster.pro) + Stemhouse Ray English Banner — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Put the GE (General English / Ray) product back online at `ge.testmaster.pro` from this repo, then replace stemhousebenluc.com's stale SummerBanner with a RayEnglishBanner linking to it.

**Architecture:** Project A deploys `frontend/` (Vite SPA, branch `split/ielts`) as a new Cloudflare Pages project against the still-live `api.testmaster.pro` Railway backend (old monolith commit — GE endpoints verified 200). No backend code deploy; only the `CORS_ORIGINS` env var changes. Project B is a single new section component in the stemhouse Next.js site with VI/EN copy in `messages/*.json`, deployed via Vercel. B ships only after A is live-verified (no dead CTA).

**Tech Stack:** Vite + React (GE frontend), Cloudflare Pages + wrangler, Railway env vars, Next.js 15 + next-intl + framer-motion + Tailwind (stemhouse), Vercel.

**Verified facts (recon 2026-07-22):**
- G1 (Bearer): PASS by code inspection — `frontend/src/lib/api.js:16-23` axios interceptor attaches `Authorization: Bearer` from localStorage key `tm_auth_token`; `src/lib/authToken.js:47-75` fetch wrapper does the same for `/api/*`. Live login still tested in Task A7.
- G2 (content): PASS pre-probe — `GET https://api.testmaster.pro/api/unified/stages` → 200 with stage data; `GET /api/beginner-english/lessons` → 200 with lessons.
- G3 (build): PASS — `vite build` succeeds in ~5s (recon run).
- `/landing/ge` route exists: `frontend/src/app/routes/publicRoutes.jsx:163`.
- CORS: preflight from Origin `https://ge.testmaster.pro` currently returns **400 with no `access-control-allow-origin`** → CORS_ORIGINS update is REQUIRED. Backend reads comma-split `CORS_ORIGINS` env (`backend/server.py:737-757`).
- ⚠️ **Landmine:** never run `railway up` — from `~/ielts/backend` it would DELETE the GE routes; from here it would overwrite the live IELTS-era backend. This plan only sets an env var.
- Vite env: `loadEnv` merges `.env` files + shell `REACT_APP_*` vars (vite.config.js:26-31); values are inlined into the bundle at build time.
- Stemhouse: SummerBanner used only in `src/app/[locale]/page.tsx` (import line 4, render line 28). i18n namespace `summerBanner` at `messages/{vi,en}.json` lines 49-61. External-link pattern: plain `<a target="_blank" rel="noopener noreferrer" onClick={() => track(...)}` (see `CallToAction.tsx:46-50`).

---

## Project A — GE live at ge.testmaster.pro

### Task A1: Deploy-config files + noindex

**Files:**
- Create: `frontend/public/_redirects`
- Create: `frontend/public/_headers`
- Create: `frontend/public/robots.txt`
- Modify: `frontend/index.html` (head)

- [ ] **Step 1: Create `frontend/public/_redirects`**

```
/  /landing/ge  302
```

(Exact-path match only; Cloudflare Pages still serves the SPA fallback for all other client routes.)

- [ ] **Step 2: Create `frontend/public/_headers`**

```
/*
  X-Robots-Tag: noindex, nofollow
```

- [ ] **Step 3: Create `frontend/public/robots.txt`**

```
User-agent: *
Disallow: /
```

- [ ] **Step 4: Add robots meta to `frontend/index.html`**

Directly after the `<meta name="viewport" ...>` line in `<head>`, add:

```html
    <meta name="robots" content="noindex, nofollow" />
```

- [ ] **Step 5: Check `frontend/.env` backend URL**

Run: `grep REACT_APP_BACKEND_URL frontend/.env`
Expected: `https://api.testmaster.pro`. If different or missing, do NOT edit `.env`; the build step passes the var via shell (shell merges with files per vite.config.js:26-31).

### Task A2: Build + verify output (gate G3 final)

**Files:** none (build output only)

- [ ] **Step 1: Build with production backend URL**

```bash
cd /Users/aga/testmaster-fresh/frontend
REACT_APP_BACKEND_URL=https://api.testmaster.pro npm run build
```

Expected: `✓ built in ~5s`, no errors (locale duplicate-key warnings are known/OK).

- [ ] **Step 2: Verify the bundle points at the live API**

```bash
grep -rl "https://api.testmaster.pro" build/assets/ | head -3
```

Expected: at least one JS chunk listed. If empty: STOP — env inlining failed; inspect `build/assets/index-*.js` for the actual baseURL before proceeding.

- [ ] **Step 3: Verify config files copied into build/**

```bash
ls build/_redirects build/_headers build/robots.txt && grep -c noindex build/index.html
```

Expected: all three files exist; grep prints `1`.

- [ ] **Step 4: Commit**

```bash
cd /Users/aga/testmaster-fresh
git add frontend/public/_redirects frontend/public/_headers frontend/public/robots.txt frontend/index.html
git commit -m "feat(ge): deploy config for ge.testmaster.pro — root redirect to /landing/ge, noindex everywhere"
```

(No push — this repo's push policy is decided by Aga; deploy is direct-upload, not git-integrated.)

### Task A3: Create Cloudflare Pages project + first deploy (pages.dev)

**Files:** none (infra)

- [ ] **Step 1: Create the Pages project**

```bash
cd /Users/aga/testmaster-fresh/frontend
npx wrangler pages project create ge-testmaster --production-branch split/ielts
```

Expected: "Successfully created the 'ge-testmaster' project". If name taken, use `ge-testmaster-pro` and substitute below.

- [ ] **Step 2: Deploy the build**

```bash
npx wrangler pages deploy build --project-name ge-testmaster --branch split/ielts --commit-dirty=true
```

Expected: a `https://<hash>.ge-testmaster.pages.dev` deployment URL; production alias `https://ge-testmaster.pages.dev`.

- [ ] **Step 3: Verify redirect + noindex + SPA on pages.dev**

```bash
curl -sI https://ge-testmaster.pages.dev/ | grep -i "location\|x-robots"
curl -s -o /dev/null -w "%{http_code}\n" https://ge-testmaster.pages.dev/landing/ge
curl -s https://ge-testmaster.pages.dev/robots.txt
```

Expected: `location: /landing/ge` + `x-robots-tag: noindex, nofollow`; `/landing/ge` → 200; robots.txt shows `Disallow: /`.

### Task A4: Railway CORS_ORIGINS update (env only — NO deploy)

**Files:** none (Railway env)

- [ ] **Step 1: Verify the Railway link points at the live api.testmaster.pro service**

```bash
cd /Users/aga/testmaster-fresh/backend
railway status
```

Expected: the project/service that serves api.testmaster.pro. If it is NOT linked or points elsewhere: STOP and report — do not `railway link` blindly, ask Aga.

- [ ] **Step 2: Read current CORS_ORIGINS**

```bash
railway variables --json | python3 -c "import json,sys; print(json.load(sys.stdin).get('CORS_ORIGINS'))"
```

Record the exact current value `<OLD>`.

- [ ] **Step 3: Append the two new origins (keep every existing one)**

```bash
railway variables --set "CORS_ORIGINS=<OLD>,https://ge.testmaster.pro,https://ge-testmaster.pages.dev"
```

⚠️ NEVER run `railway up` here. Setting a variable restarts the service with the existing image only.

- [ ] **Step 4: Verify service came back healthy AND GE endpoints survived**

```bash
sleep 45
curl -s -o /dev/null -w "%{http_code}\n" https://api.testmaster.pro/api/unified/stages
curl -s -o /dev/null -w "%{http_code}\n" https://api.testmaster.pro/api/beginner-english/lessons
curl -s -D - -o /dev/null -X OPTIONS https://api.testmaster.pro/api/unified/stages -H "Origin: https://ge-testmaster.pages.dev" -H "Access-Control-Request-Method: GET" -H "Access-Control-Request-Headers: authorization" | grep -i "HTTP/\|access-control-allow-origin"
```

Expected: 200, 200, and preflight `HTTP/2 200` with `access-control-allow-origin: https://ge-testmaster.pages.dev`. Also verify old origins still work (`-H "Origin: https://testmaster.pro"` → allowed). If endpoints 404/5xx after restart: report immediately (do not iterate silently).

### Task A5: Custom domain ge.testmaster.pro

**Files:** none (DNS + Pages domain)

- [ ] **Step 1: Attach the domain to the Pages project (CF API via wrangler token or account token)**

Get account id from `npx wrangler whoami`. Try:

```bash
ACCT=<account_id>
TOKEN=$(cat ~/.secrets/cf-testmaster-zone.token)
curl -s -X POST "https://api.cloudflare.com/client/v4/accounts/$ACCT/pages/projects/ge-testmaster/domains" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  --data '{"name":"ge.testmaster.pro"}'
```

If `success: false` (zone token lacks Pages scope — likely), check `ls ~/.secrets/` for an account-scoped CF token and retry with it. If none works: fall back to asking Aga to add `ge.testmaster.pro` under CF Dashboard → Workers & Pages → ge-testmaster → Custom domains (30-second manual step), then continue.

- [ ] **Step 2: DNS CNAME via zone token**

Find zone id for testmaster.pro, then create the record (skip if Step 1's dashboard flow auto-created it):

```bash
ZID=$(curl -s "https://api.cloudflare.com/client/v4/zones?name=testmaster.pro" -H "Authorization: Bearer $TOKEN" | python3 -c "import json,sys; print(json.load(sys.stdin)['result'][0]['id'])")
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZID/dns_records" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  --data '{"type":"CNAME","name":"ge","content":"ge-testmaster.pages.dev","proxied":true}'
```

Expected: `"success": true` (or "record already exists" if auto-created).

- [ ] **Step 3: Verify the custom domain end-to-end (poll until cert issued, up to ~5 min)**

```bash
curl -sI https://ge.testmaster.pro/ | grep -i "HTTP/\|location\|x-robots"
curl -s https://ge.testmaster.pro/landing/ge -o /dev/null -w "%{http_code}\n"
```

Expected: `HTTP/2 302` + `location: /landing/ge` + `x-robots-tag: noindex, nofollow`; then 200.

### Task A6: Live E2E — GE product works (gate before Project B)

**Files:** none (browser verification via chrome-devtools/playwright MCP)

- [ ] **Step 1: Landing renders** — open `https://ge.testmaster.pro/` in the browser tool; confirm it lands on `/landing/ge` showing the Ray/GE landing (not IELTS shell, not blank). Check console: no CORS errors, no failed chunk loads.
- [ ] **Step 2: Signup/login** — create a fresh test account (e.g. `uatest-ge-0722@testmaster.pro` / strong password) via the GE signup flow (path `general_english` mode). Confirm the network tab shows `Authorization: Bearer` on post-login API calls (gate G1 live confirmation) and you land on `/ge/dashboard`.
- [ ] **Step 3: Dashboard data** — `/ge/dashboard` shows the 8 unified stages (from `/api/unified/stages`), no skeleton stuck/empty state.
- [ ] **Step 4: Open one unified lesson** — navigate to the first lesson via the dashboard; lesson content loads.
- [ ] **Step 5: Placement test loads** — `/ge/placement-test` renders its first question.
- [ ] **Step 6: Payments surface** — open GE pricing; do NOT purchase. If anything is broken, REPORT it (spec: report, don't silently patch).
- [ ] **Step 7: Record results** — note any console errors/broken flows verbatim for the final report. If Steps 1–5 pass, Project A is LIVE-VERIFIED → Project B may proceed.

---

## Project B — stemhousebenluc.com Ray English banner

Repo: `/Users/aga/stemhousebenluc-`, branch `claude/stemhouse-landing-page-YeWj3` (verify with `git branch --show-current` before ANY edit).

### Task B1: Housekeeping + Ray logo asset

**Files:**
- Modify: `.gitignore` (already locally modified — commit it)
- Create: `public/materials/ray-english-logo.png`

- [ ] **Step 1: Commit the pending .gitignore change**

```bash
cd /Users/aga/stemhousebenluc-
git add .gitignore && git commit -m "chore: ignore .env files"
```

- [ ] **Step 2: Copy + downscale the Ray logo (source is 2688×1520, 1.4 MB)**

```bash
cp /Users/aga/testmaster-fresh/frontend/public/brand/ray-english-logo.png /tmp/ray-logo-src.png
sips -Z 1200 /tmp/ray-logo-src.png --out public/materials/ray-english-logo.png
sips -g pixelWidth -g pixelHeight public/materials/ray-english-logo.png
```

Expected: width 1200, height 679. Visually inspect the file (Read tool) — confirm it's the Ray English mark, note whether background is white/transparent (the component places it on a white card either way).

### Task B2: i18n — remove `summerBanner`, add `rayEnglish` (in-session translation)

**Files:**
- Modify: `messages/en.json` (replace `summerBanner` block, lines ~49-61)
- Modify: `messages/vi.json` (same)

- [ ] **Step 1: In `messages/en.json`, replace the entire `"summerBanner": { ... }` block with:**

```json
  "rayEnglish": {
    "eyebrow": "New · Online",
    "title": "Ray English — learn General English online",
    "description": "Our online platform for teens and adults: an 8-stage journey from complete beginner to confident speaker (Pre-A1 → C1). Interactive lessons, vocabulary games, and a placement test that finds your exact starting point.",
    "highlights": [
      "8 stages · Pre-A1 → C1",
      "Placement test included",
      "Interactive lessons & games",
      "Learn anywhere, anytime"
    ],
    "cta": "Try Ray English",
    "note": "Opens ge.testmaster.pro — our online learning platform"
  },
```

- [ ] **Step 2: In `messages/vi.json`, replace the entire `"summerBanner": { ... }` block with:**

```json
  "rayEnglish": {
    "eyebrow": "Mới · Học trực tuyến",
    "title": "Ray English — học tiếng Anh tổng quát trực tuyến",
    "description": "Nền tảng học trực tuyến dành cho thanh thiếu niên và người lớn: lộ trình 8 chặng từ mất gốc đến giao tiếp tự tin (Pre-A1 → C1). Bài học tương tác, trò chơi từ vựng và bài kiểm tra xếp lớp giúp bạn bắt đầu đúng trình độ.",
    "highlights": [
      "8 chặng · Pre-A1 → C1",
      "Có bài kiểm tra xếp lớp",
      "Bài học & trò chơi tương tác",
      "Học mọi lúc, mọi nơi"
    ],
    "cta": "Trải nghiệm Ray English",
    "note": "Mở ge.testmaster.pro — nền tảng học trực tuyến của chúng tôi"
  },
```

- [ ] **Step 3: Verify no orphaned keys**

```bash
grep -rn "summerBanner" src messages
```

Expected after Task B3 completes: zero hits. (At this point `SummerBanner.tsx` still references it — that's next.)

### Task B3: Component swap — delete SummerBanner, create RayEnglishBanner

**Files:**
- Delete: `src/components/sections/SummerBanner.tsx`
- Create: `src/components/sections/RayEnglishBanner.tsx`
- Modify: `src/app/[locale]/page.tsx` (lines 4 and 28)

- [ ] **Step 1: Create `src/components/sections/RayEnglishBanner.tsx`** (green counterpart of the removed orange banner; same motion grammar; external CTA with analytics per site pattern):

```tsx
"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { track } from "@vercel/analytics";
import { Reveal } from "@/components/motion/Reveal";

const GE_URL = "https://ge.testmaster.pro/landing/ge";

export function RayEnglishBanner() {
  const t = useTranslations("rayEnglish");
  const highlights = t.raw("highlights") as string[];

  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className="container-x">
        <Reveal>
          <div
            className="relative overflow-hidden rounded-[28px] p-8 text-white md:rounded-[40px] md:p-14 lg:p-20"
            style={{
              backgroundImage:
                "linear-gradient(135deg, #1F7A44 0%, #166534 45%, #14532D 100%)",
              boxShadow:
                "0 1px 0 rgba(255,255,255,0.3) inset, 0 -1px 0 rgba(0,0,0,0.08) inset, 0 30px 80px -30px rgba(22,101,52,0.5)",
            }}
          >
            <BannerDecor />

            <div className="relative grid gap-10 md:grid-cols-[1.4fr_1fr] md:items-center">
              <div>
                <span className="pill-dark border-white/30 bg-white/10 text-white">
                  {t("eyebrow")}
                </span>
                <h2 className="mt-6 max-w-[18ch] font-display text-display-lg text-balance">
                  {t("title")}
                </h2>
                <p className="mt-6 max-w-xl text-balance text-lg text-white/90">
                  {t("description")}
                </p>

                <ul className="mt-8 grid max-w-xl grid-cols-2 gap-3 text-sm md:text-base">
                  {highlights.map((h, i) => (
                    <motion.li
                      key={h}
                      initial={{ opacity: 0, y: 14 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-60px" }}
                      transition={{ duration: 0.7, delay: 0.1 * i, ease: [0.16, 1, 0.3, 1] }}
                      className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur"
                    >
                      {h}
                    </motion.li>
                  ))}
                </ul>

                <div className="mt-10 flex flex-wrap items-center gap-4">
                  <a
                    href={GE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => track("ray_english_click", { location: "home_banner" })}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-brand-green transition-all hover:bg-brand-ink hover:text-white"
                  >
                    {t("cta")}
                    <ArrowUpRight size={16} />
                  </a>
                  <span className="text-sm font-medium text-white/70">{t("note")}</span>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                className="relative mx-auto w-full max-w-sm"
              >
                <div className="glint relative overflow-hidden rounded-[24px] bg-white p-6 shadow-2xl md:rounded-[28px]">
                  <Image
                    src="/materials/ray-english-logo.png"
                    alt="Ray English"
                    width={1200}
                    height={679}
                    sizes="(max-width: 768px) 80vw, 384px"
                    className="h-auto w-full"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function BannerDecor() {
  return (
    <>
      <motion.div
        aria-hidden
        animate={{ rotate: 360 }}
        transition={{ duration: 60, ease: "linear", repeat: Infinity }}
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/20 md:h-96 md:w-96"
      />
      <motion.div
        aria-hidden
        animate={{ rotate: -360 }}
        transition={{ duration: 90, ease: "linear", repeat: Infinity }}
        className="pointer-events-none absolute -bottom-24 -left-16 h-60 w-60 rounded-full border border-white/15 md:h-80 md:w-80"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-25 mix-blend-overlay grid-lines"
      />
    </>
  );
}
```

Notes: `text-brand-green` exists in the Tailwind palette (`brand.green: #166534`). `.glint` and `.pill-dark` come from globals.css. Rotating decor + grid-lines mirror the removed banner so the home rhythm is preserved. Check `Reveal`'s import path matches other sections (it does: `@/components/motion/Reveal`).

- [ ] **Step 2: Update `src/app/[locale]/page.tsx`**

Line 4: `import { SummerBanner } from "@/components/sections/SummerBanner";` → `import { RayEnglishBanner } from "@/components/sections/RayEnglishBanner";`
Line 28: `<SummerBanner />` → `<RayEnglishBanner />`

- [ ] **Step 3: Delete the old component**

```bash
rm src/components/sections/SummerBanner.tsx
grep -rn "SummerBanner\|summerBanner" src messages
```

Expected: zero hits. (`summerPage` namespace and `sections/summer/*` stay — the `/summer-camp` page itself is out of scope.)

### Task B4: Typecheck + build

- [ ] **Step 1:** `npm run typecheck` → Expected: clean (0 errors).
- [ ] **Step 2:** `npm run build` → Expected: build succeeds, all routes compile, no missing-message warnings for `rayEnglish`.
- [ ] **Step 3: Commit**

```bash
git add -A src messages public/materials/ray-english-logo.png
git commit -m "feat(home): replace SummerBanner with RayEnglishBanner linking to ge.testmaster.pro"
```

### Task B5: Local visual verification (both locales)

- [ ] **Step 1:** `npm run dev` (port 3000, background). Open `http://localhost:3000/` (VI) and `http://localhost:3000/en` (EN) in the browser tool.
- [ ] **Step 2:** Confirm: banner renders between Marquee and Programs; green gradient card; VI/EN copy correct (no raw keys); logo card visible; CTA hover works; no console errors; check 375px viewport (mobile) — grid stacks, no overflow.
- [ ] **Step 3:** Click CTA → opens `https://ge.testmaster.pro/landing/ge` in new tab (live, from Project A).

### Task B6: Deploy to Vercel prod + live verify

- [ ] **Step 1: Push the branch**

```bash
git push origin claude/stemhouse-landing-page-YeWj3 && git ls-remote origin claude/stemhouse-landing-page-YeWj3
```

Verify remote SHA matches local HEAD.

- [ ] **Step 2: Deploy.** If Vercel auto-deploys this branch (check: live HTML changes within ~3 min), done. Otherwise run `npx vercel --prod` from repo root.
- [ ] **Step 3: Live verify**

```bash
curl -s https://stemhousebenluc.com | grep -c "Ray English"
curl -s https://stemhousebenluc.com/en | grep -c "Ray English"
curl -s https://stemhousebenluc.com | grep -c "summerBanner\|Trại hè 2026"
```

Expected: ≥1, ≥1, 0. Then open live home in browser tool: banner renders, CTA opens live GE landing. Per rule: only claim "deployed" after this passes.

### Task B7: design-review pass (mandatory gate)

- [ ] **Step 1:** Invoke the `design-review` skill on the live home page — screenshot desktop AND mobile, check type scale/8px spacing/alignment/contrast (white-on-green AA)/consistency, focus states on the CTA, reduced-motion behavior.
- [ ] **Step 2:** Fix any findings, re-deploy (repeat B6 verify), re-screenshot.

### Task B8: Final sweep + reporting

- [ ] **Step 1: Stemhouse coherence check** — with the camp over, these still link to `/summer-camp`: `SiteHeader.tsx:27,87,122`, `Hero.tsx:64`, `SiteFooter.tsx:53`, `sitemap.ts:4`. DO NOT change them (out of scope) — list them in the final report as a [DECIDE] for Aga (keep camp page as archive vs. retire it).
- [ ] **Step 2: GE report** — any broken payment/flow findings from Task A6 Step 6, verbatim.
- [ ] **Step 3: Memory update** — update `~/.claude/projects/-Users-aga/memory/project_ge_stemhouse_revival.md`: statuses (A live, B live), the Railway CORS value change, Pages project name, test account used, and re-state the ielts-backend-deploy landmine.

## Out of scope (do not touch)

- `/summer-camp` page + `sections/summer/*` + `summerPage` i18n namespace (stays live as archive until Aga decides).
- Programs roadmap SVG, any `~/ielts` code, any backend code deploy, GE pricing redesign.
