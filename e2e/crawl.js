#!/usr/bin/env node
// =============================================================================
// TestMaster / IELTS Ace — link & workflow crawler
//
// Walks every route declared in routes.js (Phase 1), then follows every
// <a href> it discovers on those pages (Phase 2, depth-limited) and reports:
//
//   * HTTP status of the final page / redirect chain
//   * JS console errors (filtered: ignores ResizeObserver, dev warnings)
//   * Failed network requests (4xx / 5xx) issued by the page
//   * Empty / error-looking pages (body text too short, contains "404" etc.)
//   * Broken in-app <a href="/…"> targets (hrefs that end up 4xx/5xx)
//
// Results are written to ./REPORT.md (grouped by severity) and also printed
// to stdout as a compact summary.
//
// Environment variables (all optional — sensible defaults for local dev):
//   BASE_URL         default http://localhost:3000
//   TEST_EMAIL       default tester@test.com
//   TEST_PASSWORD    default tester123
//   TIMEOUT_MS       default 20000 (per page)
//   FOLLOW_LINKS     default 1 — set to 0 to skip Phase 2
//   MAX_FOLLOWED     default 150 — safety cap for Phase 2
//   HEADFUL          default 0 — set to 1 to watch the browser
//   VERBOSE          default 0 — set to 1 for per-route logs
//
// Usage:
//   npm run setup       (once)
//   npm run crawl       (each audit)
// =============================================================================

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");
const ROUTES = require("./routes");

// ---------- config ----------
const BASE_URL      = (process.env.BASE_URL || "http://localhost:3000").replace(/\/+$/, "");
const TEST_EMAIL    = process.env.TEST_EMAIL    || "tester@test.com";
const TEST_PASSWORD = process.env.TEST_PASSWORD || "tester123";
const TIMEOUT_MS    = parseInt(process.env.TIMEOUT_MS || "20000", 10);
const FOLLOW_LINKS  = process.env.FOLLOW_LINKS !== "0";
const MAX_FOLLOWED  = parseInt(process.env.MAX_FOLLOWED || "150", 10);
const HEADFUL       = process.env.HEADFUL === "1";
const VERBOSE       = process.env.VERBOSE === "1";

// Console messages we can ignore (framework noise, dev-only warnings)
const CONSOLE_IGNORE = [
  /ResizeObserver loop/i,
  /Download the React DevTools/i,
  /React Router Future Flag/i,
  /\[HMR\]/i,
  /Warning: validateDOMNesting/i,
  /Warning: Each child in a list/i, // noisy but non-blocking
];

// Network requests we can ignore (telemetry, 3rd-party probes)
const NETWORK_IGNORE = [
  /google-analytics\.com/,
  /googletagmanager\.com/,
  /sentry\.io/,
  /datadoghq\.com/,
  /hotjar\.com/,
  /\.map$/,
];

// ---------- helpers ----------
function shortUrl(u) {
  try { return new URL(u, BASE_URL).pathname + (new URL(u, BASE_URL).search || ""); }
  catch { return u; }
}

function isSameOriginHref(href) {
  if (!href) return false;
  if (href.startsWith("/") && !href.startsWith("//")) return true;
  try { return new URL(href, BASE_URL).origin === new URL(BASE_URL).origin; }
  catch { return false; }
}

function shouldIgnoreConsole(msg) {
  return CONSOLE_IGNORE.some((rx) => rx.test(msg));
}

function shouldIgnoreNetwork(url) {
  return NETWORK_IGNORE.some((rx) => rx.test(url));
}

// ---------- per-page probe ----------
async function probe(page, targetUrl, { label, auth, note } = {}) {
  const consoleErrors = [];
  const networkErrors = [];
  const onConsole = (msg) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    if (shouldIgnoreConsole(text)) return;
    consoleErrors.push(text.slice(0, 300));
  };
  const onResponse = (res) => {
    const status = res.status();
    if (status < 400) return;
    const url = res.url();
    if (shouldIgnoreNetwork(url)) return;
    networkErrors.push({ status, url: shortUrl(url) });
  };
  page.on("console", onConsole);
  page.on("response", onResponse);

  const result = {
    label, auth, note, url: targetUrl,
    httpStatus: null,
    finalUrl: null,
    consoleErrors,
    networkErrors,
    bodyLen: 0,
    bodyHint: "",
    navError: null,
  };

  try {
    const resp = await page.goto(targetUrl, { waitUntil: "networkidle", timeout: TIMEOUT_MS });
    result.httpStatus = resp ? resp.status() : null;
    // give SPA a moment to render after networkidle
    await page.waitForTimeout(400);
    result.finalUrl = shortUrl(page.url());
    const body = (await page.evaluate(() => document.body?.innerText || "")).trim();
    result.bodyLen = body.length;
    result.bodyHint = body.slice(0, 120).replace(/\s+/g, " ");
  } catch (err) {
    result.navError = err.message.slice(0, 200);
  } finally {
    page.off("console", onConsole);
    page.off("response", onResponse);
  }
  return result;
}

// Collect all same-origin <a href> on the current page.
async function collectLinks(page) {
  return page.$$eval("a[href]", (as) =>
    as.map((a) => a.getAttribute("href")).filter((h) => h && h.length > 0)
  );
}

// ---------- login ----------
async function login(page) {
  if (VERBOSE) console.log(`→ logging in as ${TEST_EMAIL}`);
  await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle", timeout: TIMEOUT_MS });
  // Try common input selectors — falls back gracefully if DOM differs.
  const emailSel = 'input[type="email"], input[name="email"], input[data-testid="email"]';
  const passSel  = 'input[type="password"], input[name="password"], input[data-testid="password"]';
  const submitSel= 'button[type="submit"], button[data-testid="login-submit"], button:has-text("Log in"), button:has-text("Sign in")';

  const emailEl = await page.$(emailSel);
  if (!emailEl) throw new Error("Login page: could not find email input (selectors tried: " + emailSel + ")");
  await emailEl.fill(TEST_EMAIL);
  const passEl = await page.$(passSel);
  if (!passEl) throw new Error("Login page: could not find password input");
  await passEl.fill(TEST_PASSWORD);
  const btn = await page.$(submitSel);
  if (!btn) throw new Error("Login page: could not find submit button");
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle", timeout: TIMEOUT_MS }).catch(() => null),
    btn.click(),
  ]);
  // Confirm we're no longer on /login.
  await page.waitForTimeout(800);
  const final = shortUrl(page.url());
  if (final.startsWith("/login")) {
    throw new Error(`Login did not advance past /login (final: ${final}). Check credentials or auth flow.`);
  }
  if (VERBOSE) console.log(`  ← logged in, landed on ${final}`);
}

// ---------- severity classifier ----------
function classify(r) {
  // Critical: nav failed OR body empty OR any failed API 5xx
  if (r.navError) return "critical";
  if (r.networkErrors.some((e) => e.status >= 500)) return "critical";
  if (r.bodyLen < 20) return "critical";
  // Warning: 4xx API, console errors, suspicious body (matches "Not Found" etc.)
  if (r.networkErrors.length > 0) return "warning";
  if (r.consoleErrors.length > 0) return "warning";
  if (/not found|something went wrong|error loading/i.test(r.bodyHint)) return "warning";
  return "ok";
}

// ---------- report writer ----------
function buildReport(results, followedResults) {
  const lines = [];
  lines.push(`# TestMaster — Crawl Report`);
  lines.push(``);
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`Base URL: ${BASE_URL}`);
  lines.push(`Test user: ${TEST_EMAIL}`);
  lines.push(``);

  const bucket = { critical: [], warning: [], ok: [] };
  for (const r of results) bucket[classify(r)].push(r);
  const fbucket = { critical: [], warning: [], ok: [] };
  for (const r of followedResults) fbucket[classify(r)].push(r);

  const totals = {
    p1: results.length,
    p1Crit: bucket.critical.length,
    p1Warn: bucket.warning.length,
    p1Ok: bucket.ok.length,
    p2: followedResults.length,
    p2Crit: fbucket.critical.length,
    p2Warn: fbucket.warning.length,
    p2Ok: fbucket.ok.length,
  };

  lines.push(`## Summary`);
  lines.push(``);
  lines.push(`| Phase | 🔴 Critical | 🟡 Warning | 🟢 OK | Total |`);
  lines.push(`|---|---:|---:|---:|---:|`);
  lines.push(`| 1. Declared routes | ${totals.p1Crit} | ${totals.p1Warn} | ${totals.p1Ok} | ${totals.p1} |`);
  lines.push(`| 2. Followed links  | ${totals.p2Crit} | ${totals.p2Warn} | ${totals.p2Ok} | ${totals.p2} |`);
  lines.push(``);

  function dump(heading, rows) {
    if (rows.length === 0) return;
    lines.push(`### ${heading}`);
    lines.push(``);
    for (const r of rows) {
      lines.push(`- **${r.label || r.url}** — \`${r.url}\``);
      if (r.finalUrl && r.finalUrl !== shortUrl(r.url)) lines.push(`  - redirected → \`${r.finalUrl}\``);
      if (r.httpStatus) lines.push(`  - HTTP ${r.httpStatus}`);
      if (r.navError) lines.push(`  - ❌ nav error: ${r.navError}`);
      if (r.bodyLen < 20) lines.push(`  - ❌ empty body (length ${r.bodyLen})`);
      if (/not found|something went wrong|error loading/i.test(r.bodyHint)) lines.push(`  - ⚠︎ body text: "${r.bodyHint}"`);
      for (const e of r.networkErrors) lines.push(`  - ${e.status >= 500 ? "❌" : "⚠︎"} API ${e.status} \`${e.url}\``);
      for (const c of r.consoleErrors) lines.push(`  - ⚠︎ console: ${c}`);
      if (r.note) lines.push(`  - ℹ︎ note: ${r.note}`);
      lines.push(``);
    }
  }

  lines.push(`## Phase 1 — Declared routes`);
  lines.push(``);
  dump("🔴 Critical", bucket.critical);
  dump("🟡 Warnings", bucket.warning);
  if (bucket.ok.length) {
    lines.push(`### 🟢 OK (${bucket.ok.length})`);
    lines.push(``);
    for (const r of bucket.ok) lines.push(`- ${r.label} — \`${r.url}\``);
    lines.push(``);
  }

  if (followedResults.length > 0) {
    lines.push(`## Phase 2 — Links discovered and followed`);
    lines.push(``);
    dump("🔴 Critical", fbucket.critical);
    dump("🟡 Warnings", fbucket.warning);
    if (fbucket.ok.length) {
      lines.push(`### 🟢 OK (${fbucket.ok.length})`);
      lines.push(``);
      for (const r of fbucket.ok) lines.push(`- ${r.label || r.url} — \`${r.url}\``);
      lines.push(``);
    }
  }

  lines.push(`## Skipped (parametric / flow-only)`);
  lines.push(``);
  for (const r of ROUTES.filter((x) => x.skip)) {
    lines.push(`- \`${r.path}\` — ${r.skip}`);
  }
  lines.push(``);
  return lines.join("\n");
}

// ---------- main ----------
(async () => {
  const startedAt = Date.now();
  console.log(`\n▶ TestMaster crawl`);
  console.log(`  base: ${BASE_URL}`);
  console.log(`  user: ${TEST_EMAIL}`);
  console.log(`  follow: ${FOLLOW_LINKS ? "yes" : "no"} (cap ${MAX_FOLLOWED})`);
  console.log(``);

  const browser = await chromium.launch({ headless: !HEADFUL });
  const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const page = await context.newPage();

  // ---- Phase 0: login so we can see auth-gated pages ----
  try {
    await login(page);
  } catch (err) {
    console.error(`❌ LOGIN FAILED: ${err.message}`);
    console.error(`   Public routes will still be tested, but auth-gated routes will bounce.`);
  }

  // ---- Phase 1: declared routes ----
  const phase1 = [];
  const phase1Routes = ROUTES.filter((r) => !r.skip);
  for (let i = 0; i < phase1Routes.length; i++) {
    const r = phase1Routes[i];
    const url = `${BASE_URL}${r.path}`;
    if (VERBOSE) console.log(`[${i + 1}/${phase1Routes.length}] ${r.path}`);
    const res = await probe(page, url, r);
    phase1.push(res);
    const sev = classify(res);
    const tag = sev === "critical" ? "🔴" : sev === "warning" ? "🟡" : "🟢";
    console.log(`  ${tag} ${r.path.padEnd(45)} — ${res.httpStatus || "?"} — body ${res.bodyLen}b` +
                (res.networkErrors.length ? ` — api err ${res.networkErrors.length}` : "") +
                (res.consoleErrors.length ? ` — console ${res.consoleErrors.length}` : ""));
  }

  // ---- Phase 2: follow in-app links discovered on Phase 1 pages ----
  const phase2 = [];
  if (FOLLOW_LINKS) {
    const seen = new Set(phase1Routes.map((r) => r.path));
    const queue = [];

    console.log(`\n▶ Phase 2: collecting discovered links...`);
    // Re-visit a handful of hub pages quickly to scrape their hrefs.
    const hubs = ["/dashboard", "/courses", "/learning", "/question-bank", "/mastery-course",
                  "/beginner-course", "/vocab-grammar", "/full-test", "/unified"];
    for (const hub of hubs) {
      try {
        await page.goto(`${BASE_URL}${hub}`, { waitUntil: "networkidle", timeout: TIMEOUT_MS });
        const hrefs = await collectLinks(page);
        for (const h of hrefs) {
          if (!isSameOriginHref(h)) continue;
          const rel = h.startsWith("/") ? h.split("#")[0] : new URL(h, BASE_URL).pathname;
          if (seen.has(rel)) continue;
          seen.add(rel);
          queue.push(rel);
          if (queue.length >= MAX_FOLLOWED) break;
        }
        if (queue.length >= MAX_FOLLOWED) break;
      } catch { /* hub failed earlier, skip */ }
    }
    console.log(`  found ${queue.length} new URLs to follow`);

    for (let i = 0; i < queue.length; i++) {
      const rel = queue[i];
      const url = `${BASE_URL}${rel}`;
      if (VERBOSE) console.log(`[${i + 1}/${queue.length}] ${rel}`);
      const res = await probe(page, url, { label: `(followed) ${rel}`, auth: "discovered" });
      phase2.push(res);
      const sev = classify(res);
      const tag = sev === "critical" ? "🔴" : sev === "warning" ? "🟡" : "🟢";
      console.log(`  ${tag} ${rel.padEnd(45)} — ${res.httpStatus || "?"} — body ${res.bodyLen}b`);
    }
  }

  await browser.close();

  // ---- Write report ----
  const report = buildReport(phase1, phase2);
  const outPath = path.join(__dirname, "REPORT.md");
  fs.writeFileSync(outPath, report);

  const crit = phase1.filter((r) => classify(r) === "critical").length
             + phase2.filter((r) => classify(r) === "critical").length;
  const warn = phase1.filter((r) => classify(r) === "warning").length
             + phase2.filter((r) => classify(r) === "warning").length;
  const ok   = phase1.filter((r) => classify(r) === "ok").length
             + phase2.filter((r) => classify(r) === "ok").length;

  console.log(`\n───────────────────────────────────`);
  console.log(`  🔴 critical: ${crit}`);
  console.log(`  🟡 warning : ${warn}`);
  console.log(`  🟢 ok      : ${ok}`);
  console.log(`  ⏱  elapsed : ${((Date.now() - startedAt) / 1000).toFixed(1)}s`);
  console.log(`  📄 report  : ${outPath}`);
  console.log(`───────────────────────────────────\n`);

  process.exit(crit > 0 ? 1 : 0);
})().catch((err) => {
  console.error("\n💥 crawler crashed:", err);
  process.exit(2);
});
