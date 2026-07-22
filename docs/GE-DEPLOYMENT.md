# GE deployment (ge.testmaster.pro) — operational notes

**Since 2026-07-22** the GE frontend from this repo (branch `split/ielts`) is live at
https://ge.testmaster.pro (Cloudflare Pages project `ge-testmaster`, direct-upload
deploys via `npx wrangler pages deploy build --project-name ge-testmaster`).

- Backend: the **live old-monolith Railway service** `testmaster.pr` (project
  `sublime-celebration`) at `api.testmaster.pro`. GE endpoints exist only there.
- Build: `cd frontend && REACT_APP_BACKEND_URL=https://api.testmaster.pro npm run build`
- `/` 302-redirects to `/landing/ge` (`frontend/public/_redirects`); the whole
  deployment is `noindex` (`_headers`, `robots.txt`, meta).

## ⚠️ LANDMINE — do not kill GE by deploying a backend

- `railway up` from `~/ielts/backend` (service `ielts-backend`, project `ielts`)
  does NOT serve api.testmaster.pro — but `railway up` from ANY repo into the
  `testmaster.pr` service replaces the old monolith and **deletes the GE
  endpoints** (`routes/ge`, unified learning, …) unless the uploaded code still
  contains them.
- Env-var changes on `testmaster.pr` are safe: Railway rebuilds the **stored
  snapshot** (verified 2026-07-22: CORS_ORIGINS change + rebuild kept GE 200).
- CORS_ORIGINS on `testmaster.pr` now includes `https://ge.testmaster.pro` and
  `https://ge-testmaster.pages.dev` — keep them when editing.
