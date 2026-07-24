# Stemhouse Vercel → Cloudflare Workers (F2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move stemhousebenluc.com off Vercel entirely — hosting to CF Workers via OpenNext, portal storage from @vercel/blob to R2 bucket `stemhouse-portal`, analytics off @vercel/analytics — verified on workers.dev, with an Aga-gated NS cutover.

**Architecture:** Repo `~/stemhousebenluc-` (Next 15.1.7, App Router, next-intl 3.25 vi/en, npm). Work on a new branch `cf-migration` (the Vercel-tracked branch `claude/stemhouse-landing-page-YeWj3` keeps serving prod until cutover). madenvietnam is the proven template: `@opennextjs/cloudflare` + `wrangler.jsonc` + minimal `open-next.config.ts`, R2 via `getCloudflareContext()`. **Workers has NO filesystem** — the portal's `fs` fallback becomes bundled JSON imports; R2 is the only writable store.

**Tech Stack:** @opennextjs/cloudflare ^1.x, wrangler, R2 (`stemhouse-portal`), Workers secrets (`TEACHER_PASSWORD`).

**Spec:** `docs/superpowers/specs/2026-07-22-ray-english-cf-migration-design.md` (F2 section)

**Key recon facts:**
- Portal API: `src/app/api/portal/login/route.ts` (POST; teacher password / parent code; reads `data/students.json` + all reports) and `src/app/api/portal/report/[name]/route.ts` (GET/POST/DELETE; blob-first, fs-fallback). UI = static `public/portal.html` calling `/api/portal/*`. Response shapes MUST NOT change.
- Blob calls: `list({prefix})`, `put(key, json, {access:'private', addRandomSuffix:false, allowOverwrite:true})`, `del(url)`, reads via authorized fetch of blob url.
- `data/`: `students.json` (7 classes, 41 students, 16 payments) + `reports/{Cindy,Max,Jack,Kelly}.json`.
- Analytics: `<Analytics/>` + `<SpeedInsights/>` in `src/app/[locale]/layout.tsx`; `track()` in 8 files (ZaloDialog, Testimonials, ContactClient ×3, RayEnglishBanner, CallToAction, TrackedLink).
- `vercel.json` carries 3 security headers → move to `next.config.ts` `headers()`.
- No `export const runtime/dynamic/revalidate` anywhere. Middleware = next-intl only.
- Env: `BLOB_READ_WRITE_TOKEN`, `TEACHER_PASSWORD`, `NEXT_PUBLIC_FORMSPREE_ID` (client-side, keeps working).
- Account workers.dev subdomain: `madenvietnam` → deploy lands at `stemhousebenluc.madenvietnam.workers.dev`.
- CF account 314896334c46c9023e98ca9dfb89dedc; wrangler OAuth token in `~/.wrangler/config/default.toml`; zone token (`~/.secrets/cf-testmaster-zone.token`) covers testmaster zones only — NOT the new stemhousebenluc.com zone.

---

### Task 1: Branch + scaffolding

**Files:** Create `open-next.config.ts`, `wrangler.jsonc`, `.dev.vars`; modify `package.json`, `.gitignore`.

- [ ] **Step 1:** `cd /Users/aga/stemhousebenluc- && git checkout -b cf-migration` (from `claude/stemhouse-landing-page-YeWj3`, clean tree).
- [ ] **Step 2:** `npm install @opennextjs/cloudflare && npm install -D wrangler` (match madenvietnam: adapter as dependency).
- [ ] **Step 3:** Create `open-next.config.ts`:

```typescript
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig();
```

- [ ] **Step 4:** Create `wrangler.jsonc`:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "stemhousebenluc",
  "main": ".open-next/worker.js",
  "compatibility_date": "2025-03-25",
  "compatibility_flags": ["nodejs_compat"],
  "assets": { "directory": ".open-next/assets", "binding": "ASSETS" },
  "r2_buckets": [
    { "binding": "PORTAL", "bucket_name": "stemhouse-portal" }
  ],
  "observability": { "enabled": true }
}
```

- [ ] **Step 5:** package.json scripts — add:

```json
"cf:build": "opennextjs-cloudflare build",
"cf:preview": "opennextjs-cloudflare build && opennextjs-cloudflare preview",
"cf:deploy": "opennextjs-cloudflare build && opennextjs-cloudflare deploy"
```

- [ ] **Step 6:** Create `.dev.vars` with `TEACHER_PASSWORD=<value from .env.local>` (copy locally, never commit). Append to `.gitignore`: `.dev.vars`, `.open-next/`, `.wrangler/`.
- [ ] **Step 7:** `npm run build` (plain next build must still pass) → commit `chore(cf): OpenNext scaffolding — wrangler, config, scripts`.

### Task 2: Portal storage adapter (R2 primary, bundled-JSON fallback)

**Files:** Create `src/lib/portal-storage.ts`; rewrite `src/app/api/portal/login/route.ts` + `src/app/api/portal/report/[name]/route.ts`; remove `@vercel/blob`.

- [ ] **Step 1:** Read both route files fully; inventory every branch of the response shapes (teacher login, parent login, report GET/POST/DELETE, all error codes). The rewrite must be byte-compatible for portal.html.
- [ ] **Step 2:** Create `src/lib/portal-storage.ts`:

```typescript
import { getCloudflareContext } from "@opennextjs/cloudflare";
import studentsData from "../../data/students.json";
// Seed reports bundled at build time — READ-ONLY fallback so portal reads
// never hard-fail if R2 is briefly unreachable. R2 is the only writable store
// (Workers has no filesystem).
import reportCindy from "../../data/reports/Cindy.json";
import reportMax from "../../data/reports/Max.json";
import reportJack from "../../data/reports/Jack.json";
import reportKelly from "../../data/reports/Kelly.json";

type R2Bucket = {
  get(key: string): Promise<{ json<T>(): Promise<T> } | null>;
  put(key: string, value: string, opts?: { httpMetadata?: { contentType?: string } }): Promise<unknown>;
  delete(key: string): Promise<void>;
  list(opts?: { prefix?: string }): Promise<{ objects: { key: string }[] }>;
};

const SEED_REPORTS: Record<string, unknown> = {
  Cindy: reportCindy, Max: reportMax, Jack: reportJack, Kelly: reportKelly,
};

function bucket(): R2Bucket | null {
  try {
    const { env } = getCloudflareContext();
    return (env as unknown as { PORTAL?: R2Bucket }).PORTAL ?? null;
  } catch {
    return null; // plain Node context (next dev without wrangler)
  }
}

export function readStudents() {
  return studentsData;
}

export async function getReport(name: string): Promise<unknown | null> {
  const b = bucket();
  if (b) {
    try {
      const obj = await b.get(`reports/${name}.json`);
      if (obj) return await obj.json();
    } catch { /* fall through to seed */ }
  }
  return SEED_REPORTS[name] ?? null;
}

export async function putReport(name: string, report: unknown): Promise<boolean> {
  const b = bucket();
  if (!b) return false;
  await b.put(`reports/${name}.json`, JSON.stringify(report), {
    httpMetadata: { contentType: "application/json" },
  });
  return true;
}

export async function deleteReport(name: string): Promise<boolean> {
  const b = bucket();
  if (!b) return false;
  await b.delete(`reports/${name}.json`);
  return true;
}

export async function listReportNames(): Promise<Set<string>> {
  const names = new Set<string>(Object.keys(SEED_REPORTS));
  const b = bucket();
  if (b) {
    try {
      const { objects } = await b.list({ prefix: "reports/" });
      for (const o of objects) {
        const m = o.key.match(/^reports\/(.+)\.json$/);
        if (m) names.add(m[1]);
      }
    } catch { /* seed names only */ }
  }
  return names;
}
```

(Adjust import paths/types to what `tsc --noEmit` accepts — `resolveJsonModule` must be on in tsconfig; enable if not.)

**⚠️ Seed-vs-deleted semantics:** a DELETEd report must STAY deleted even though a seed exists. Implement tombstones: on DELETE also `put(\`tombstones/${name}\`, "1")`; `getReport` checks the tombstone before falling back to `SEED_REPORTS`; `putReport` clears the tombstone. `listReportNames` must exclude tombstoned seeds. Include this in the adapter (simple: read tombstone key alongside).

- [ ] **Step 3:** Rewrite both route files on the adapter. Preserve: request/response JSON shapes, status codes, `TEACHER_PASSWORD` check via `process.env.TEACHER_PASSWORD`, parent-code lookup logic. Delete all `@vercel/blob` imports and all `fs`/`path` usage.
- [ ] **Step 4:** `npm uninstall @vercel/blob` → `npm run build && npx tsc --noEmit` green → commit `feat(cf): portal storage on R2 with bundled seed fallback`.

### Task 3: Analytics swap

**Files:** Create `src/lib/analytics.ts`; modify `src/app/[locale]/layout.tsx` + the 8 track() files.

- [ ] **Step 1:** Create `src/lib/analytics.ts`:

```typescript
// Vercel Analytics was removed with the CF Workers migration (2026-07-25).
// Custom events are intentionally dropped for now — page analytics comes from
// Cloudflare Web Analytics; a GA4 decision is parked ([DECIDE] with Aga).
// Keeping the call sites wired through this no-op preserves the event names
// for whichever backend lands here later.
export function track(_event: string, _data?: Record<string, unknown>): void {}
```

- [ ] **Step 2:** In every file importing from `@vercel/analytics` (`grep -rln "@vercel/analytics" src/`): swap `import { track } from "@vercel/analytics"` → `import { track } from "@/lib/analytics"` (use the repo's alias convention — check tsconfig paths; use relative if no alias). In `src/app/[locale]/layout.tsx` remove the `<Analytics />` and `<SpeedInsights />` elements and their imports.
- [ ] **Step 3:** `npm uninstall @vercel/analytics @vercel/speed-insights` → build green → commit `feat(cf): drop Vercel analytics — no-op track(), CF Web Analytics later`.

### Task 4: Security headers into next.config

- [ ] **Step 1:** Add to `next.config.ts` (inside `nextConfig`):

```typescript
async headers() {
  return [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    },
  ];
},
```

Keep `vercel.json` unchanged (Vercel prod still serves until cutover; duplicate headers are harmless).

- [ ] **Step 2:** Build green → commit `feat(cf): security headers in next.config (portable off Vercel)`.

### Task 5: Local gates — cf:build + preview smoke

- [ ] **Step 1:** `npm run cf:build` → must produce `.open-next/worker.js`. Fix any adapter errors (report BLOCKED if OpenNext chokes on Next 15.1.7 in a non-obvious way).
- [ ] **Step 2:** `npm run cf:preview` (local workerd, local R2 simulation) → with curl or a browser check: `/` (vi home renders), `/en` (en home), `/portal.html` loads, `POST /api/portal/login` with `{"type":"teacher","password":"<from .dev.vars>"}` → `ok:true` + classes/codes/reports shape; parent code from data/students.json → `ok:true`; `POST/GET/DELETE /api/portal/report/TestStudent` round-trip (local R2). Kill preview.
- [ ] **Step 3:** Commit anything fixed.

### Task 6: R2 bucket + Blob report migration

- [ ] **Step 1:** `npx wrangler r2 bucket create stemhouse-portal` (wrangler OAuth; account has R2 already for madenvietnam).
- [ ] **Step 2:** Migrate every existing Vercel Blob report (there may be more than the 4 seeds): node script in `/tmp` using `BLOB_READ_WRITE_TOKEN` from `.env.local` — `list({prefix:'reports/'})`, download each blob, then `npx wrangler r2 object put stemhouse-portal/reports/<Name>.json --file <tmp>` per report. Print the migrated list.
- [ ] **Step 3:** Verify: `npx wrangler r2 object get stemhouse-portal/reports/<one>.json --pipe | head -c 200` shows JSON.

### Task 7: Secrets + deploy to workers.dev

- [ ] **Step 1:** `npx wrangler secret put TEACHER_PASSWORD` (value from `.env.local`).
- [ ] **Step 2:** `npm run cf:deploy` → note the URL (`https://stemhousebenluc.<account-subdomain>.workers.dev`).
- [ ] **Step 3:** Push branch: `git push -u origin cf-migration` (lands as Vercel Preview at most — production untouched). Verify remote SHA = local.

### Task 8: workers.dev full E2E + design-review

- [ ] **Step 1:** Browser E2E on the workers.dev URL: home vi + `/en` (hero, RayEnglishBanner CTA → https://ge.testmaster.pro/landing/ge), `/programs`, `/about`, `/contact` (Formspree form renders), `/summer-camp` ("Ended" badge), locale switcher, sitemap.xml + robots.txt, security headers present (`curl -sI` shows nosniff/referrer/permissions).
- [ ] **Step 2:** Portal E2E against real R2: teacher login (password) → classes/codes render; parent login (a real SH code) → report or "no report"; teacher saves a report for a REAL student without one → re-login shows it → GET returns it → DELETE removes it (and a re-login shows has_report false — tombstone check for seeds: delete a SEED student's report copy in R2 must not resurrect the bundled one).
- [ ] **Step 3:** Visual parity: screenshots desktop 1440 + mobile 390 of home vi/en vs live Vercel prod — layout/fonts/images identical (next/image must render; if `/_next/image` 404s or is unoptimized, fix per OpenNext image guidance before proceeding).
- [ ] **Step 4:** design-review pass on the rendered result (should be a no-op — same pixels; flag regressions only).

### Task 9: DNS cutover prep (Aga-gated NS change)

- [ ] **Step 1:** Enumerate current DNS truth: `npx vercel dns ls stemhousebenluc.com` (repo is Vercel-linked) + `dig +short stemhousebenluc.com A`, `www` CNAME, `dig +short stemhousebenluc.com MX TXT`. Save the record list.
- [ ] **Step 2:** Attempt zone creation via API with the wrangler OAuth token (`grep -m1 oauth_token ~/.wrangler/config/default.toml`): `POST /client/v4/zones {"name":"stemhousebenluc.com","account":{"id":"314896334c46c9023e98ca9dfb89dedc"}}`. If 403 → zone creation becomes Aga's dashboard step (Add site → Free plan → CF auto-scans records).
- [ ] **Step 3:** Once the zone exists (either path): create/verify ALL records from Step 1 in the CF zone BEFORE any NS change (apex + www pointing at Vercel initially = zero-downtime; they flip to the Worker in the final step). Record the CF-assigned NS pair.
- [ ] **Step 4:** Write `docs/dns-cutover.md` in the stemhouse repo: the record table, CF NS pair, registrar steps for Aga, propagation check commands (`dig NS stemhousebenluc.com +trace | tail -4`), and the post-NS steps (Task 10). Commit.
- [ ] **Step 5:** STOP — report to Aga: workers.dev verified, zone ready, NS change is yours. F2 pauses here until Aga flips NS.

### Task 10 (post-NS, Aga-gated): bind domain + retire Vercel

- [ ] **Step 1:** After NS propagates: add custom domains to the worker — `wrangler.jsonc` gains `"routes": [{ "pattern": "stemhousebenluc.com", "custom_domain": true }, { "pattern": "www.stemhousebenluc.com", "custom_domain": true }]` → `npm run cf:deploy`.
- [ ] **Step 2:** Live verify on stemhousebenluc.com: home vi/en, portal login + report read, headers, banner CTA. Merge `cf-migration` into the Vercel-tracked branch only if needed for history; production now = Worker.
- [ ] **Step 2b:** CF Web Analytics: create a Web Analytics site for `stemhousebenluc.com` (API: `POST /accounts/314896334c46c9023e98ca9dfb89dedc/rum/site_info` with the wrangler OAuth token; if 403, Aga toggles it in dashboard → Analytics → Web Analytics) → take the returned snippet token → add the beacon `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token":"<TOKEN>"}'></script>` to `src/app/[locale]/layout.tsx` → deploy → verify the beacon request fires on the live site.
- [ ] **Step 3:** Retire Vercel: pause/delete the Vercel project (dashboard, with Aga), delete `BLOB_READ_WRITE_TOKEN` usage, remove `vercel.json` + `.vercel/` in a cleanup commit. Only AFTER live verification.

---

## Rollback

Until NS changes, Vercel prod is untouched — rollback = do nothing. After NS: revert by re-pointing apex/www records at Vercel (records preserved from Task 9 Step 1) inside the CF zone; NS can stay on CF.

## Out of scope

- F3 (ge.stemhousebenluc.com CNAME + 301) — separate mini-plan after NS.
- GA4 / custom-event analytics ([DECIDE]).
- TEACHER_PASSWORD → hashed auth upgrade (security follow-up, [DECIDE]).
- Portal UI changes; content changes.
