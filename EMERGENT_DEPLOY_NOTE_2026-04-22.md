# Emergent Deploy Note — 2026-04-22

**Branch:** `feat/ielts-ace-pre-deploy-2026-04-19`
**Head commit:** `7f6fe2d4` — `feat(pre-deploy): landing redesign + sample flows + onboarding/pricing fixes`
**Repo:** https://github.com/agadurdy-art/testmaster.pr
**Scope:** Frontend-only. No backend/DB/schema changes. No new env vars. No dependency changes.

---

## What shipped in this push

### 1. Landing (`/`) — Liz-centric redesign wired up
- `/` now renders `LandingPageDemo` (PathPickerGate chooses IELTS vs General).
- Old V2 landing remains at `/landing/v1` for reference.
- Removed language navigator from landing footer.
- Dropped duplicate "which path fits you" section (PathPickerGate covers it).
- New components under `features/landing/components/`: `MeetLiz`, `LizAvatar` (canonical), `LizLauncher`, `LandingHeroDemo`, `LandingSampleCarousel`, `PricingTeaserDemo`. New `lib/brand.js` holds `LIZ_AVATAR_URL`.

### 2. Samples flow — public nav/footer cleanup
- Sample pages' public nav + footer route to actual sample pages (not auth-gated practice).
- Removed dead `#` Globe/EN button and Reading link (no Reading sample yet).
- New: `SampleReportSpeakingPart2.js` (speaking sample report).

### 3. Signup handoff — intent plumbing
- New helpers in `src/lib/pendingPlan.js`: `stashPendingIntent` / `consumePendingIntent` / `pendingIntentRedirect`.
- Intent map: `writing → /question-bank/writing/task2`, `speaking → /speaking/v2`, `liz → /liz`.
- `App.js` `SignupBridge` + `handleLogin` honor intent after plan.
- `OnboardingPageV2.handleFinish`: plan > intent > `/dashboard/v2`.
- "Submit your essay" in `ConversionBlock` now routes to `/signup?intent=writing&path=ielts` (previously dumped users on `/dashboard` with no next step).

### 4. Onboarding fixes
- Step 2 "Find a test center" → `https://ielts.idp.com/vietnam/book` (external, new tab).
- Step 3 "Take level test" → `/comprehensive-level-test` (was a dead button).
- Step 5 "Meet Liz":
  - Real Web Speech TTS with 12-language greeting templates (en/tr/vi/zh/ar/ko/th/ja/es/pt/ru/id).
  - Female-voice picker (Apple/Google/Microsoft name hints; pitch 1.25 fallback when no female voice found).
  - `voiceschanged` listener for async voice loading on Chrome.
  - Silent primer utterance on mount → warms Chrome's audio pipeline so first user tap plays instantly (was 1–3 s delay).
  - iOS Safari blocks autoplay primer silently — no breakage, just no warmup there. Full fix lands when we swap to ElevenLabs (see `memory/project_liz_voice_tts.md`).

### 5. Liz avatar consolidation
- All off-brand "L" letters / empty placeholders replaced with canonical `LizAvatar` (same portrait everywhere):
  - `Step5LizIntro`, speaking `LizCard` (both variants), evaluator `LizTakeCard`, dashboard `LizMessage`, dashboard `LizNote`.

### 6. Floating Liz button
- Now gated to `/dashboard*` routes only. Previously leaked onto landing where Liz is already in the top-right nav.

### 7. Pricing custom-plan slider fix
- Root cause: three different scales overlapping — native `<input type="range">` is linear, `fillPct` was log-scale, scale labels (3/30/90/180/365) were evenly-spaced flex spans. Result: at 91 days the thumb, green fill, and labels all said different things.
- Fix:
  - `usePricingSlider.js`: `fillPct` switched from log to linear.
  - `DaySlider.jsx`: scale labels now positioned at real linear % via `left: %`.
  - `pricing.css`: `.slider-scale` converted to relative container for absolute label positioning.

---

## Files changed (39)

Full diff: `git show 7f6fe2d4 --stat`

Key new files:
- `frontend/src/pages/LandingPageDemo.js`
- `frontend/src/pages/SampleReportSpeakingPart2.js`
- `frontend/src/features/landing/components/{MeetLiz,LizAvatar,LizLauncher,LandingHeroDemo,LandingSampleCarousel,PathPickerGate,PricingTeaserDemo}.jsx`
- `frontend/src/features/landing/landing-demo.css`
- `frontend/src/lib/brand.js`

---

## Deploy checklist for Emergent

- [ ] Pull `feat/ielts-ace-pre-deploy-2026-04-19` on the frontend.
- [ ] Build: `npm install --legacy-peer-deps && DISABLE_ESLINT_PLUGIN=true npm run build`.
- [ ] Verify `REACT_APP_BACKEND_URL` is set (no new env vars required).
- [ ] Smoke tests:
  - `/` renders `LandingPageDemo` with `PathPickerGate`; only one Liz (top-right).
  - `/pricing#custom`: slider thumb, green fill, "FOR N DAYS" readout, and CTA button all show the same number at multiple positions (3, 30, 91, 180, 365). Mobile too.
  - Sample Writing page → "Submit your essay" → `/signup?intent=writing` → after onboarding lands on `/question-bank/writing/task2`.
  - Onboarding Step 2 "Find a test center" opens IDP in new tab.
  - Onboarding Step 3 "Take level test" opens `/comprehensive-level-test`.
  - Onboarding Step 5: Liz portrait renders; play button starts near-instantly on desktop Chrome; female voice in EN/TR/VI.
  - Dashboard: floating Liz launcher appears; landing/samples: no floating Liz.
  - Liz avatar identical across: landing nav, Step 5, speaking LizCard, evaluator LizTakeCard, dashboard LizMessage/LizNote.

---

## Known follow-ups (not in this push)

- **ElevenLabs voice** replacing Web Speech TTS (memory: `project_liz_voice_tts.md`). Onboarding Step 5 + speaking sample monologue will switch to pre-rendered audio assets. iOS autoplay-warmup limitation disappears then.
- **LizFloatingButton icon** — currently uses `GraduationCap` icon, not a portrait. Decide if it should swap to `LizAvatar` too (deferred; icon style may be intentional for the launcher FAB).
- **Discount email capture** (memory: `project_discount_email_capture.md`) — ConversionBlock removed; replace with "25% off your first plan" lead magnet once Stripe coupon endpoint + transactional email are wired.

---

## Follow-up push — same day (2026-04-22 later)

Additional fixes pushed on top of `7f6fe2d4`:

### Mobile polish
- `AnnotatedEssayPanel.jsx`: highlight tooltip no longer spills past the left edge on mobile. Added viewport clamp via `requestAnimationFrame` re-measure + `marginLeft` nudge. Popover max-width now responsive: `min(320px, calc(100vw - 24px))` on mobile, full 320px on sm+.
- `LandingNav.jsx` + `landing.css`: language switcher no longer crowds `[Start]+[☰]` on narrow viewports — moved into the mobile drawer (`.mobile-drawer-lang`) on `<900px`, kept inline on desktop via new `.desktop-only` wrapper.

### Dashboard iOS-26-style tint (no layout changes)
- `dashboard.css`: replaced flat near-white `--bg: 210 40% 98%` with warmer base (`214 45% 96.5%`) + two radial gradient washes (cool blue top-left, emerald bottom-right).
- `.card`: solid surface → two-stop gradient, deeper shadow, stronger border.
- `.icon-tile`: 38→40px, radius 11→12px (squircle), solid fill → tinted gradient fill with inner highlight + colored outer glow. Hover states match.
- **No layout, no typography, no component changes** — purely chroma + surface texture. The dashboard no longer reads as "aşırı beyaz".

### /courses page rewrite
- `CoursesPage.js`: removed `getCourses()` API fetch (the backend still serves strategy-style modules there, which leaked the wrong content into the "Courses" section). Replaced with three curated cards linking to the real course routes:
  - Beginner Course → `/beginner-course` (Band 4→6)
  - Mastery Course → `/mastery-course` (Band 6→7.5)
  - Advanced → `/advanced-mastery` (Band 7.5→9)
- Each card: band-range chip, gradient icon tile (emerald/amber/violet), short tagline, CTA → course page. Matches the V2 visual vocabulary without hijacking the dashboard scope.

### Samples nav fix
- `PublicNav.jsx` "Samples" link: `/samples/writing/band-6-5-task2` → `/#samples`. Previously clicking "Samples" while already on a sample page navigated to itself (visible as no-op or error). Now always routes to the sample carousel on the landing page — the actual switcher.
- `PublicFooter.jsx` "All samples" link: same treatment.

### Dead links / dead buttons swept
- **DashboardMobileDrawer.jsx**: removed "Settings" entry — route `/settings` doesn't exist; account settings live in `/profile`.
- **DashboardPage.js**: `MockTestFrame` fallback `/practice-test` → `/full-test` (the non-existent route would 404 when API returns null `mockRec`).
- **DashboardTopBar.jsx** — avatar chip (top-right `{initials}{firstName}`) was a `<button>` with no `onClick`, giving no response on click. Converted to `<a href="/profile">` — now navigates + supports middle-click / right-click properly.
- **DashboardTopBar.jsx** — notifications bell removed. `onOpenNotifications` prop was never passed and no notifications feature exists. Unused `BellIcon` helper deleted.

### Honest CTA cleanup
- **`ConversionBlock`** at the bottom of `/samples/writing/*` and `/samples/speaking/part2` removed. The email input wasn't wired to any backend or local store — `onSubmitEmail` prop was never passed, so typed emails were silently dropped and the user re-entered them on `/signup`. Global "Try free" already lives in `PublicNav` + `MobileStickyCTA` + hero.
- `ConversionBlock.jsx` file left in place (unused) as a reference for the future discount-email lead magnet (see memory + follow-ups).

---

## Updated smoke test additions

- **Dashboard desktop**: click the avatar chip in top-right → lands on `/profile`. No notifications bell visible.
- **Dashboard mobile**: drawer list has no "Settings" row.
- **`/courses`**: three cards — Beginner / Mastery / Advanced. No API loading spinner. Each "Open course" routes to `/beginner-course`, `/mastery-course`, `/advanced-mastery`.
- **Samples nav (any sample page)**: clicking "Samples" → lands on `/#samples` (landing page carousel, scrolled into view). "Writing" and "Speaking" links still go to their specific pages.
- **Mobile sample writing page**: click any left-most highlighted word (e.g. "a lot of people" at sentence start). Tooltip appears fully inside the viewport with no left-edge clipping.
- **Landing mobile nav (<900px)**: no language `<select>` in the top bar. Open hamburger drawer → language selector visible inside drawer, full-width.
- **Dashboard visual**: background is tinted (not pure white), cards have visible glass depth, icon tiles have gradient fill + slight glow. Layout/content identical to previous push.
- **Samples footer**: "All samples" → `/#samples`. Writing/Speaking sample links still functional. No email-capture block at the bottom of any sample page.

---

## Second follow-up push — same day (2026-04-22 evening)

### New feature — anonymous essay evaluator (MVP)

Public "Score my own essay" lead magnet. Sample page visitors paste their own IELTS writing and get the same evaluator output logged-in users get, gated on a unique email (one evaluation per email, ever). View-only — no PDF, no download. sessionStorage keeps the report alive for 10 minutes so accidental refreshes don't discard it.

**Route:** `/score-my-essay`

**Backend changes (`backend/server.py`):**
- New `POST /api/public/evaluate-essay` route (next to the v2 writing evaluator). Email regex validation → atomic reservation insert into `anonymous_evaluations` with unique index on `email` → calls existing `evaluate_writing()` service → stores the result on the reservation doc. Race-safe: DuplicateKeyError returns the stored result; evaluator failures roll back the reservation so visitors can retry.
- Mongo unique index on `anonymous_evaluations.email` created in `startup_event`.
- Added `import re` (used by the email regex).
- Limits: essay 20k chars, prompt 4k chars, min 200 words for Task 2 (client-side, server only checks non-empty).

**Frontend changes:**
- New page `frontend/src/pages/PublicEssayEvaluator.js` — email + task-type dropdown + prompt + essay form → on submit renders the same `AnnotatedEssayPanel + PublicScoreCard` layout the sample pages use, but fed by the visitor's data.
- Route + lazy import in `App.js`.
- `SampleReportPage.jsx`'s `onScoreMyEssay` now routes to `/score-my-essay` (previously wired to `/signup` as an interim fix earlier today).

**What's intentionally NOT built (future work — see memory `project_anonymous_essay_evaluation.md`):**
- No transactional email — Aga's spec was "view-only, let it fade". Resend is already wired; can layer on a "we've saved your report, click to revisit" mail later.
- No CAPTCHA / IP rate limit — only email uniqueness. If abuse shows up, add disposable-email domain blocklist + IP throttle.
- No marketing drip — emails land in `anonymous_evaluations` collection; a welcome/discount sequence can be scheduled on top of this without schema changes.

### Writing Practice — "Custom question" mode for paid users

Paid users inside `/question-bank/writing/task2` can now submit their own task prompt instead of picking from the question bank.

**Change:** `frontend/src/pages/WritingTask2Practice.js` — new mode toggle at the top of the left panel: "Preset Questions" (existing flow) vs "My Own Question" (new). In custom mode:
- Left panel shows a single 4000-char Textarea for the user's own prompt (preset filters, prompt list, tips, model-answer toggle all hidden — they don't apply).
- Submit still uses the same `POST /api/writing-practice/evaluate/v2` endpoint the preset flow uses, sending the typed prompt instead of `selectedPrompt.prompt`.
- Submit button is disabled until both the custom prompt and ≥200-word essay are present.
- Evaluation result view reads the custom prompt correctly (no more empty string when the evaluator needs to echo the prompt).

**No backend changes** for this part — the v2 endpoint already accepted arbitrary prompts. Access control is by virtue of the route gating (`/question-bank/writing/task2` requires `user` in `App.js`). If stricter paid-tier gating is needed later, the existing `usage_tracking` service (server.py ~1717) is the place to hook it.

### Smoke tests for evaluator MVP

- **`/score-my-essay`** loads the input form. No PublicScoreCard/result view visible initially.
- Submit with bad email → inline error "Please enter a valid email address."
- Submit with a <200-word essay → inline error with the real word count.
- Submit a valid full-length Task 2 essay → loading spinner → `AnnotatedEssayPanel + PublicScoreCard` appear, page scrolls to the report. Inline highlights clickable, bands rendered, Liz card omitted (no lizMessage in public mode), radar chart visible.
- **One-per-email gate**: refresh the page (same tab) → sessionStorage restores the report. Close tab, reopen, submit the same email → 409 response in Network tab, friendly UI message.
- **Cache expiry**: wait 10+ minutes with the page open, refresh → cache cleared, form shown again.
- **Race / refresh during pending**: submit, immediately refresh before response returns → no duplicate LLM call (reservation row prevents it); second submit attempt with same email shows the completed result from the reservation.
- **Writing sample → "Score my own essay" button**: visit `/samples/writing/band-6-5-task2` → right-sidebar "Score my own essay" button now navigates to `/score-my-essay` (not `/signup` anymore).
- **Mongo verification** (Emergent side): `db.anonymous_evaluations.getIndexes()` should list a unique index on `email`. Successful submissions create one doc with `status: "complete"` and a `result` field.

### Smoke tests for Writing Practice custom mode

- Visit `/question-bank/writing/task2` as a logged-in user → new tab-bar pair "Preset Questions | My Own Question" visible at the top of the left panel.
- Click "My Own Question" → essay type filter / prompt list / selected prompt detail / tips all disappear, replaced by a single prompt Textarea + char counter.
- Paste a real Task 2 prompt + write 250+ words on the right → Submit enables. Click → evaluator runs, Results screen shows the custom prompt (not empty) in the header.
- Switch back to "Preset Questions" → the preset prompt selection UI returns intact, no state leak.
- Edge: empty custom prompt + full essay → Submit stays disabled. Essay <200 words → disabled in both modes.
- Model Answers button is hidden in custom mode (no model answers exist for user-supplied prompts).
