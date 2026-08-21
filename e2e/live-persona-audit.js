#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const BASE_URL = (process.env.BASE_URL || "https://testmaster.pro").replace(/\/+$/, "");
const API_URL = (process.env.API_URL || "https://api.testmaster.pro").replace(/\/+$/, "");
const CHROME = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const RUN_ID = process.env.RUN_ID || new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
const TIMEOUT_MS = Number(process.env.TIMEOUT_MS || 25000);
const OUT_DIR = path.join(__dirname, "reports");

const personas = [
  { key: "beginner", name: "Codex Beginner IELTS", current: 4.5, target: 6.0, native: ["vi", "Vietnamese"], weak: ["reading", "listening"], viewport: [1366, 900], routes: ["/dashboard", "/quick-assessment", "/beginner-course", "/learning-tools"] },
  { key: "writing", name: "Codex Writing Focus", current: 5.5, target: 7.0, native: ["tr", "Turkish"], weak: ["writing"], viewport: [1440, 960], routes: ["/writing-practice", "/question-bank/writing/task2", "/question-bank/writing/task1", "/sample-reports"] },
  { key: "speaking", name: "Codex Speaking Focus", current: 6.0, target: 7.5, native: ["ko", "Korean"], weak: ["speaking"], viewport: [1366, 900], routes: ["/speaking-practice", "/speaking/v2", "/full-mock", "/liz"] },
  { key: "reading", name: "Codex Reading Focus", current: 5.0, target: 6.5, native: ["ar", "Arabic"], weak: ["reading"], viewport: [1366, 900], routes: ["/question-bank", "/question-bank/reading/academic", "/question-bank/reading/general", "/question-bank/reading/practice"] },
  { key: "listening", name: "Codex Listening Focus", current: 5.5, target: 7.0, native: ["ja", "Japanese"], weak: ["listening"], viewport: [1366, 900], routes: ["/question-bank/listening", "/test/listening", "/full-test", "/progress"] },
  { key: "mock", name: "Codex Mock Test", current: 6.5, target: 8.0, native: ["es", "Spanish"], weak: ["writing", "speaking"], viewport: [1536, 960], routes: ["/full-test", "/test/reading", "/test/writing", "/my-results"] },
  { key: "vocab", name: "Codex Vocab Grammar", current: 5.0, target: 7.0, native: ["pt", "Portuguese"], weak: ["writing", "reading"], viewport: [1366, 900], routes: ["/grammar", "/vocabulary", "/mastery-course", "/advanced-mastery"] },
  { key: "pricing", name: "Codex Buyer Intent", current: 6.0, target: 7.0, native: ["ru", "Russian"], weak: ["speaking"], viewport: [1366, 900], routes: ["/pricing", "/profile", "/checkout/bank/monthly", "/contact"] },
  { key: "mobile", name: "Codex Mobile Student", current: 4.0, target: 6.5, native: ["th", "Thai"], weak: ["listening", "speaking"], viewport: [390, 844], routes: ["/", "/dashboard", "/question-bank", "/pricing"] },
  { key: "returning", name: "Codex Returning User", current: 7.0, target: 8.0, native: ["id", "Indonesian"], weak: ["writing"], viewport: [1280, 800], routes: ["/dashboard/v2", "/courses", "/review-bank", "/learning"] },
];

const publicRoutes = [
  "/", "/score-my-essay", "/score-my-speaking", "/ielts-band-score-calculator",
  "/ielts-faq", "/pricing", "/samples/writing/band-5-0-task2",
  "/samples/writing/band-6-5-task2", "/samples/writing/band-8-0-task2",
  "/samples/speaking/band-6-5-part2", "/about", "/contact", "/privacy", "/terms",
];

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

async function api(pathname, options = {}) {
  const res = await fetch(`${API_URL}${pathname}`, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  if (!res.ok) {
    const err = new Error(`API ${res.status} ${pathname}: ${typeof body === "string" ? body : JSON.stringify(body)}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

async function registerOrLogin(persona) {
  const email = `codex.${RUN_ID}.${persona.key}@testmaster.pro`;
  const password = `Codex-${RUN_ID}!`;
  try {
    const user = await api("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name: persona.name, email, password }),
    });
    return { user, email, password, created: true };
  } catch (err) {
    if (err.status !== 400 || !String(JSON.stringify(err.body)).includes("already registered")) throw err;
    const user = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    return { user, email, password, created: false };
  }
}

async function onboard(account, persona) {
  const [code, name] = persona.native;
  return api(`/api/users/${encodeURIComponent(account.user.id)}/onboarding`, {
    method: "POST",
    headers: { authorization: `Bearer ${account.user.token}` },
    body: JSON.stringify({
      path: "ielts",
      targetBand: persona.target,
      currentBand: persona.current,
      examDate: "2026-10-15",
      language: { code: "en", name: "English" },
      nativeLanguage: { code, name },
      motivation: `${persona.key} persona audit`,
      weakSkills: persona.weak,
    }),
  });
}

async function seedAuth(context, account, onboardedUser) {
  const user = { ...account.user, ...onboardedUser, token: account.user.token };
  await context.addInitScript(({ user, token }) => {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("tm_auth_token", token);
    localStorage.setItem("testmaster_onboarding_path", "ielts");
  }, { user, token: account.user.token });
}

async function probe(page, route, label) {
  const url = `${BASE_URL}${route}`;
  const consoleErrors = [];
  const failedResponses = [];
  const pageErrors = [];
  const onConsole = (msg) => {
    if (msg.type() === "error") consoleErrors.push(cleanText(msg.text()).slice(0, 240));
  };
  const onResponse = (res) => {
    const status = res.status();
    if (status >= 400 && !/google-analytics|googletagmanager|clarity|posthog|\.map/.test(res.url())) {
      failedResponses.push({ status, url: res.url().replace(BASE_URL, "").replace(API_URL, "") });
    }
  };
  const onPageError = (err) => pageErrors.push(cleanText(err.message).slice(0, 240));
  page.on("console", onConsole);
  page.on("response", onResponse);
  page.on("pageerror", onPageError);
  const result = { label, route, url, status: null, finalUrl: null, bodyLen: 0, h1: "", title: "", consoleErrors, failedResponses, pageErrors, ok: false, error: "" };
  try {
    const resp = await page.goto(url, { waitUntil: "load", timeout: TIMEOUT_MS });
    result.status = resp ? resp.status() : null;
    await page.waitForTimeout(1800);
    result.finalUrl = page.url().replace(BASE_URL, "");
    result.title = await page.title().catch(() => "");
    result.h1 = await page.locator("h1").first().innerText({ timeout: 1000 }).catch(() => "");
    const body = await page.locator("body").innerText({ timeout: 3000 }).catch(() => "");
    result.bodyLen = cleanText(body).length;
    result.ok = !result.error && result.bodyLen > 30 && !pageErrors.length && !failedResponses.some((r) => r.status >= 500);
  } catch (err) {
    result.error = cleanText(err.message).slice(0, 300);
  } finally {
    page.off("console", onConsole);
    page.off("response", onResponse);
    page.off("pageerror", onPageError);
  }
  return result;
}

async function seoAudit() {
  const robots = await fetch(`${BASE_URL}/robots.txt`).then((r) => r.text()).catch((e) => `ERROR ${e.message}`);
  const sitemapXml = await fetch(`${BASE_URL}/sitemap.xml`).then((r) => r.text()).catch((e) => `ERROR ${e.message}`);
  const sitemapUrls = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const rows = [];
  for (const url of sitemapUrls) {
    const res = await fetch(url);
    const html = await res.text();
    rows.push({
      url,
      status: res.status,
      title: cleanText((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1]),
      description: cleanText((html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)/i) || [])[1]),
      canonical: cleanText((html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']*)/i) || [])[1]),
      h1InHtml: /<h1[\s>]/i.test(html),
      rawTextLen: cleanText(html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ")).length,
      jsShell: /You need to enable JavaScript to run this app/i.test(html),
    });
  }
  return { robots, sitemapUrls, rows };
}

async function smokePublicEssay(page, email) {
  const result = { route: "/score-my-essay", ok: false, detail: "" };
  try {
    await page.goto(`${BASE_URL}/score-my-essay`, { waitUntil: "load", timeout: TIMEOUT_MS });
    await page.waitForTimeout(1500);
    await page.locator('input[type="email"]').first().fill(email);
    const textareas = await page.locator("textarea").count();
    if (textareas < 2) {
      result.detail = `Expected 2 textareas, found ${textareas}`;
      return result;
    }
    await page.locator("textarea").nth(0).fill("Some people believe online learning is better than classroom learning. To what extent do you agree or disagree?");
    const essay = "Online learning has become a normal part of education, and I partly agree that it can be better than classroom learning. The main advantage is flexibility. Students can review recorded lessons, study from any location, and use digital resources immediately when they do not understand a concept. This is especially helpful for people who work, travel, or live far from good schools.\n\nHowever, classroom learning still has clear strengths. A teacher can notice confusion quickly, classmates can discuss ideas in real time, and the routine of going to class helps many students stay disciplined. Some learners also feel isolated online, which can reduce motivation over a long course.\n\nIn my view, the best model combines both methods. Online tools should provide practice, feedback, and revision, while classroom time should focus on discussion, speaking, and problem solving. Therefore, online learning is not always better, but it can be extremely effective when it is designed as part of a balanced learning system.";
    await page.locator("textarea").nth(1).fill(essay);
    await Promise.all([
      page.waitForResponse((r) => r.url().includes("/api/public/evaluate-essay/async"), { timeout: TIMEOUT_MS }).catch(() => null),
      page.locator('button[type="submit"], button:has-text("Score"), button:has-text("Send")').last().click(),
    ]);
    await page.waitForTimeout(2500);
    const body = await page.locator("body").innerText();
    result.ok = /email|queued|minutes|sent|check/i.test(body);
    result.detail = cleanText(body).slice(0, 300);
  } catch (err) {
    result.detail = cleanText(err.message).slice(0, 300);
  }
  return result;
}

function summarize(results) {
  const all = results.flatMap((p) => p.probes);
  return {
    personas: results.length,
    routeChecks: all.length,
    ok: all.filter((r) => r.ok).length,
    hardFailures: all.filter((r) => r.error || r.pageErrors.length || r.failedResponses.some((x) => x.status >= 500)).length,
    clientWarnings: all.filter((r) => r.consoleErrors.length || r.failedResponses.some((x) => x.status >= 400 && x.status < 500)).length,
  };
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const seo = await seoAudit();
  const browser = await chromium.launch({ headless: true, executablePath: CHROME });
  const personaResults = [];

  for (const persona of personas) {
    const account = await registerOrLogin(persona);
    const onboarded = await onboard(account, persona);
    const [width, height] = persona.viewport;
    const context = await browser.newContext({ viewport: { width, height } });
    await seedAuth(context, account, onboarded);
    const page = await context.newPage();
    const probes = [];
    for (const route of persona.routes) {
      probes.push(await probe(page, route, persona.key));
    }
    await context.close();
    personaResults.push({ persona: persona.key, email: account.email, created: account.created, userId: account.user.id, viewport: persona.viewport, probes });
  }

  const publicContext = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const publicPage = await publicContext.newPage();
  const publicProbes = [];
  for (const route of publicRoutes) publicProbes.push(await probe(publicPage, route, "public"));
  const essaySmoke = await smokePublicEssay(publicPage, `codex.${RUN_ID}.essay@testmaster.pro`);
  await publicContext.close();
  await browser.close();

  const report = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    apiUrl: API_URL,
    runId: RUN_ID,
    seo,
    personas: personaResults,
    publicProbes,
    essaySmoke,
    summary: summarize([...personaResults, { probes: publicProbes }]),
  };

  const jsonPath = path.join(OUT_DIR, `live-persona-audit-${RUN_ID}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));

  const lines = [];
  lines.push(`# Live Persona Audit — ${RUN_ID}`);
  lines.push("");
  lines.push(`Base: ${BASE_URL}`);
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`- Personas created/tested: ${report.summary.personas}`);
  lines.push(`- Route checks: ${report.summary.routeChecks}`);
  lines.push(`- OK: ${report.summary.ok}`);
  lines.push(`- Hard failures: ${report.summary.hardFailures}`);
  lines.push(`- Client/API warnings: ${report.summary.clientWarnings}`);
  lines.push(`- Public essay async smoke: ${essaySmoke.ok ? "OK" : "FAIL"} — ${essaySmoke.detail}`);
  lines.push("");
  lines.push("## SEO/GEO Raw HTML");
  lines.push("");
  lines.push(`- Sitemap URLs: ${seo.sitemapUrls.length}`);
  lines.push(`- JS shell pages in sitemap: ${seo.rows.filter((r) => r.jsShell).length}/${seo.rows.length}`);
  lines.push(`- Pages with raw HTML H1: ${seo.rows.filter((r) => r.h1InHtml).length}/${seo.rows.length}`);
  lines.push(`- Unique raw titles: ${new Set(seo.rows.map((r) => r.title)).size}`);
  lines.push(`- Unique raw descriptions: ${new Set(seo.rows.map((r) => r.description)).size}`);
  lines.push("");
  lines.push("| URL | Status | Title | Raw H1 | JS shell | Raw text len |");
  lines.push("|---|---:|---|---:|---:|---:|");
  for (const row of seo.rows) {
    lines.push(`| ${row.url.replace(BASE_URL, "") || "/"} | ${row.status} | ${row.title || "(none)"} | ${row.h1InHtml ? "yes" : "no"} | ${row.jsShell ? "yes" : "no"} | ${row.rawTextLen} |`);
  }
  lines.push("");
  lines.push("## Persona Route Findings");
  lines.push("");
  for (const p of personaResults) {
    lines.push(`### ${p.persona} — ${p.email}`);
    for (const r of p.probes) {
      const flags = [];
      if (r.error) flags.push(`nav: ${r.error}`);
      if (r.pageErrors.length) flags.push(`pageerror: ${r.pageErrors[0]}`);
      if (r.failedResponses.length) flags.push(`responses: ${r.failedResponses.map((x) => `${x.status} ${x.url}`).join(", ")}`);
      if (r.consoleErrors.length) flags.push(`console: ${r.consoleErrors[0]}`);
      lines.push(`- ${r.ok ? "OK" : "CHECK"} ${r.route} -> ${r.finalUrl || "?"}; body ${r.bodyLen}; h1 "${cleanText(r.h1)}"${flags.length ? `; ${flags.join("; ")}` : ""}`);
    }
    lines.push("");
  }
  lines.push("## Public Route Findings");
  lines.push("");
  for (const r of publicProbes) {
    const flags = [];
    if (r.error) flags.push(`nav: ${r.error}`);
    if (r.pageErrors.length) flags.push(`pageerror: ${r.pageErrors[0]}`);
    if (r.failedResponses.length) flags.push(`responses: ${r.failedResponses.map((x) => `${x.status} ${x.url}`).join(", ")}`);
    if (r.consoleErrors.length) flags.push(`console: ${r.consoleErrors[0]}`);
    lines.push(`- ${r.ok ? "OK" : "CHECK"} ${r.route} -> ${r.finalUrl || "?"}; body ${r.bodyLen}; h1 "${cleanText(r.h1)}"${flags.length ? `; ${flags.join("; ")}` : ""}`);
  }
  lines.push("");
  lines.push(`JSON: ${jsonPath}`);
  const mdPath = path.join(OUT_DIR, `live-persona-audit-${RUN_ID}.md`);
  fs.writeFileSync(mdPath, lines.join("\n"));
  console.log(`Wrote ${mdPath}`);
  console.log(`Wrote ${jsonPath}`);
  console.log(JSON.stringify(report.summary, null, 2));
  process.exit(report.summary.hardFailures > 0 || !essaySmoke.ok ? 1 : 0);
})().catch((err) => {
  console.error(err);
  process.exit(2);
});
