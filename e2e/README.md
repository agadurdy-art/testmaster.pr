# TestMaster — Link & Workflow Crawler

Automated auditor for the TestMaster / IELTS Ace frontend. Logs in as a test
user, walks every declared route in `routes.js`, then follows every in-app
link it discovers on the hub pages. Produces a severity-ranked `REPORT.md`
plus a stdout summary.

## What it catches

- 🔴 **Critical** — page failed to load, empty body, or any backend 5xx.
- 🟡 **Warning** — 4xx API, JS console errors, suspicious body text ("Not Found").
- 🟢 **OK** — page rendered and no errors observed on load.

It does **not** test form submissions, payments, Liz AI streaming, or TTS —
only page load + read-only API calls that fire on mount.

## Prerequisites

Both servers must be running locally:

```bash
# Terminal 1 — backend
cd backend && uvicorn server:app --reload --port 8001

# Terminal 2 — frontend
cd frontend && npm start   # CRA dev server on :3000
```

Default test account (already seeded): `tester@test.com` / `tester123`

## Usage

```bash
cd e2e
npm run setup       # installs playwright + chromium (once)
npm run crawl       # runs the audit
```

Verbose mode (per-route logs):

```bash
npm run crawl:verbose
```

Watch the browser work (for debugging the crawler itself):

```bash
HEADFUL=1 npm run crawl
```

## Configuration

Environment variables (all optional):

| Var | Default | Purpose |
|---|---|---|
| `BASE_URL` | `http://localhost:3000` | Frontend dev server URL |
| `TEST_EMAIL` | `tester@test.com` | Login email |
| `TEST_PASSWORD` | `tester123` | Login password |
| `TIMEOUT_MS` | `20000` | Per-page timeout |
| `FOLLOW_LINKS` | `1` | Set `0` to skip Phase 2 |
| `MAX_FOLLOWED` | `150` | Cap on Phase 2 URLs |
| `HEADFUL` | `0` | Set `1` to show the browser window |
| `VERBOSE` | `0` | Set `1` for per-route stdout lines |

## Output

- `REPORT.md` — committed-friendly markdown, grouped by severity.
- Stdout — compact table per route, final counts, path to the report.
- Exit code — `0` if no criticals, `1` if any critical, `2` on crawler crash.

## Adding / updating routes

`routes.js` is the inventory. Whenever a new route is added to
`frontend/src/App.js`:

1. Add an entry with `path`, `label`, and `auth` (`public` / `free` /
   `paid` / `admin`).
2. If the route takes URL params, add it with `skip: "parametric"` — the
   crawler will still exercise it via Phase 2 once a real data link is
   discovered on a hub page.

## Known limitations

- **Cannot click into parametric routes directly.** `routes.js` only holds
  path templates for them; Phase 2 reaches them via real links.
- **Cannot test paid-tier gating.** Tester account is free-tier; any route
  marked `auth: "paid"` expects the paywall to render (which counts as OK).
- **Cannot test admin-only pages.** Admin routes should redirect to home
  for the tester; that redirect counts as OK.
- **Form submissions not tested.** Side-effect flows (checkout, create, delete)
  are deliberately out of scope to keep the audit idempotent.
