# Emergent Deploy Note — 2026-04-22

**Branch:** `feat/ielts-ace-pre-deploy-2026-04-19`
**Repo:** https://github.com/agadurdy-art/testmaster.pr
**Scope:** Frontend + one-shot backend migration script. No new backend routes, no env vars, no dependency changes.

---

## READ-BEFORE-DEPLOY — action checklist for Emergent

Three separate pushes landed on this branch on 2026-04-22. The **third push** (post-deploy audit fixes) adds a **one-shot Mongo migration** that MUST be run on the server after the code deploy, or legacy users will continue to see the wrong dashboard. Please do not skip it.

**Step 1 — Pull & build as usual.**
- Frontend: standard `yarn build` / `npm run build` with the env you already use. No new env vars. No new deps.
- Backend: no code changes to `server.py` in the third push — only the startup index creation added in the second push (`anonymous_evaluations.email` unique, `evaluator_ratings` collection is auto-created on first write). Still no migrations baked into startup.

**Step 2 — Run the user-mode migration (REQUIRED, one-time).**
```sh
cd backend
python scripts/migrate_users_to_ielts_mode.py
```
- Flips every existing user's `learning_mode` to `"ielts"` so they land on the Claude Design IELTS dashboard at `/dashboard` instead of the old `Dashboard.js`.
- Idempotent — safe to run multiple times; a second run reports `To migrate: 0`.
- Does NOT touch onboarding logic: new users who pick General English during `/onboarding/v2` will still be stored as `learning_mode="general_english"` and correctly land on the old Dashboard.
- Prints a 5-user sample + before/after counts for audit.

**Step 3 — Smoke test the three audit fixes** (detailed steps in the "Third follow-up push" section below):
- Turkish locale: no dotted-İ, missing keys render in TR.
- `/dashboard` renders the Claude Design dashboard for existing users.
- New-user onboarding GE path still lands on the old Dashboard (proof that the routing split still works — migration didn't break future GE users).

**Step 4 — If you run into anything unexpected**, the third-push changes are isolated to:
- `frontend/src/lib/i18n.js` (TR dictionary additions — no logic change)
- `frontend/src/index.css` (single `html[lang="tr"] *` override at EOF)
- `backend/scripts/migrate_users_to_ielts_mode.py` (new, not imported by any runtime code)
All three are independently revertible without affecting the first two pushes.

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

### Rate + Share — PublicScoreCard sidebar actions

**Change:** `frontend/src/features/samples/components/PublicScoreCard.jsx` — the two sidebar secondary buttons were "PDF report" and "Share", both dead-wired (no parent ever passed `onDownloadPdf` / `onShare`). Replaced with:

- **Rate this evaluator** — inline 1-5 star form with optional ≤500-char comment. Opens below the action pair on click, POSTs to `/api/public/evaluator-rating`, flips to a disabled "Thanks!" pill after submit. `localStorage.evaluatorRated_v1` prevents re-rating on the same device.
- **Share** — calls `navigator.share()` when available (iOS Safari, Android Chrome) with `{title, text, url}`; falls back to `navigator.clipboard.writeText(url)` and briefly shows "Link copied". Shares the current page URL so sample pages and `/score-my-essay` both share themselves.

**Backend:** new `POST /api/public/evaluator-rating` route (server.py, next to `/public/evaluate-essay`) — validates stars 1–5, stores `{stars, comment, page_url, created_at, user_agent}` in a new `evaluator_ratings` collection. No auth; client-side localStorage gate is the only dedupe.

**Prop cleanup:** removed `onDownloadPdf` and `onShare` from `PublicScoreCard` signature (neither was ever passed). Nothing else was using them.

### Smoke tests for Rate + Share

- On any sample writing page (`/samples/writing/band-6-5-task2`) right sidebar: click **Rate this evaluator** → inline form appears. Pick 3 stars, type a short comment, Submit → spinner → button flips to green "Thanks!" pill, disabled.
- Refresh the same page → button stays "Thanks!" (localStorage persisted). Clear site data → button comes back as "Rate this evaluator".
- Without picking any stars, Submit button stays disabled.
- Click **Share** on desktop Chrome → URL copied to clipboard, button says "Link copied" briefly.
- Click **Share** on iOS Safari or Android Chrome → native share sheet opens; cancel → no state change; confirm → button says "Shared" briefly.
- Mongo check: `db.evaluator_ratings.find().sort({created_at: -1}).limit(5)` shows submitted ratings with correct stars/comment/page_url.
- Repeat the rate test on `/score-my-essay` after running a real evaluation — same behavior, same localStorage gate.

### Smoke tests for Writing Practice custom mode

- Visit `/question-bank/writing/task2` as a logged-in user → new tab-bar pair "Preset Questions | My Own Question" visible at the top of the left panel.
- Click "My Own Question" → essay type filter / prompt list / selected prompt detail / tips all disappear, replaced by a single prompt Textarea + char counter.
- Paste a real Task 2 prompt + write 250+ words on the right → Submit enables. Click → evaluator runs, Results screen shows the custom prompt (not empty) in the header.
- Switch back to "Preset Questions" → the preset prompt selection UI returns intact, no state leak.
- Edge: empty custom prompt + full essay → Submit stays disabled. Essay <200 words → disabled in both modes.
- Model Answers button is hidden in custom mode (no model answers exist for user-supplied prompts).

---

## Third follow-up push — post-deploy audit fixes (2026-04-22)

### Issue A: 41 missing Turkish i18n keys

`frontend/src/lib/i18n.js` — added 41 Turkish translations that existed in EN (and all 10 other languages) but were missing from the `tr` block, silently falling back to English in production. Inserted before the closing `},` of the `tr` block.

Keys covered: dashboard nav/metrics (`navDashboard`, `welcomeBack`, `readyToContinue`, `currentPlan`, `speakingCredits`, `viewUpgradePlan`, `adminTopUpCredits`, `practiceTests`, `learningTools`, `recentActivity`, `noRecentActivity`, `startFirstTest`, `testsCompleted`, `avgBand`, `streak`, `days`), task-type descriptions (`taskTrueFalseNotGivenDesc`, `taskYesNoNotGiven*`, `taskMultipleChoiceDesc`, `taskSentenceCompletionDesc`, `taskSummaryCompletionDesc`, `taskMatchingHeadingsDesc`, `taskMatchingInfoDesc`, `taskNoteCompletion*`, `taskFormCompletion*`, `taskMapLabeling*`, `taskMatching*`), writing task descriptions (`writingTask1AcademicDesc`, `writingTask1GeneralDesc`, `writingTask2EssayDesc`), and speaking/paywall messages (`sessionActive`, `paywallNeedProOrCredits`, `paywallSpeakingNoCredits`, `speakingFreeTrialAvailable`, `speakingFreeTrialStarted`, `speakingSessionStarted`).

Verification: `node` script walking the `tr` vs `en` key sets now reports `Missing in TR: 0`.

### Issue B: Turkish `text-transform: uppercase` producing dotted-İ

`frontend/src/index.css` — added a single global override at the end of the file:

```css
html[lang="tr"] * {
  text-transform: none !important;
}
```

**Why:** browsers use the document's `lang` attribute to pick Unicode casing rules. When `html lang="tr"`, `text-transform: uppercase` maps the Latin letter `i` to `İ` (dotted capital I — correct Turkish rule but visually wrong on English labels like "PRACTİCE", "WRİTİNG"). This is the only reliable CSS-only fix that doesn't require touching 30+ individual `text-transform: uppercase` rules across 6 feature CSS files.

**Effect:** Turkish users see labels in their natural case as stored in the i18n dictionary (no forced uppercase), dotted-İ-free. Other 11 locales unaffected.

**Safety check:** grep confirms zero `text-transform: lowercase` / `capitalize` uses in the codebase, so the `!important` override doesn't clobber any other transform.

### Smoke tests for post-deploy fixes

- Switch language to Turkish (`TR` in language picker) → Dashboard V2 card labels ("Mevcut band", "Hedef", "Kalan gün") remain Turkish; nav labels like "Panel", "Deneme Sınavları", "Öğrenme Araçları" render (not their English fallbacks).
- On any page that previously showed "PRACTİCE" / "WRİTİNG" (uppercased English label in Turkish locale) → label now renders in sentence/title case from the TR dictionary, no dotted-İ.
- Switch to EN / ZH / AR → uppercase labels still render as uppercase (scoped fix doesn't affect non-TR).
- Speaking session entry flow in Turkish → "Ücretsiz deneme konuşma oturumu başladı…" / "Konuşma oturumu başladı. Kalan kredi: N" render from TR dictionary (previously English).

### Issue E: /dashboard showing old `Dashboard.js` instead of Claude Design `DashboardPage.js`

**Symptom:** Aga's own account (and likely other legacy accounts) hit `/dashboard` and saw the old General-English-flavoured dashboard (5 stat cards, "Continue building your English", "Complete Learning Path Pre-A1 → A1 → ...") instead of the Claude Design IELTS dashboard (EditorialMasthead, LizMessage, MetricsTriptych, TodaysTask, SkillsTable, MockTestFrame).

**Root cause:** `App.js:392-401` routes `user ? (isIeltsMode(user) ? <DashboardPage/> : <Dashboard/>) : ...`. Users whose `learning_mode` was missing or set to `general_english` / `general` / `ge` fell through to the old `Dashboard`. IELTS Ace is the primary product, so legacy users with non-IELTS modes were getting the wrong experience.

**Fix:** one-shot Mongo migration — every existing user is flipped to `learning_mode="ielts"`. Routing code is unchanged; new users who explicitly pick "General English" during onboarding (`/users/{id}/onboarding` with `path="general_english"`) will still get `learning_mode="general_english"` and land on the old Dashboard as designed.

**Script:** `backend/scripts/migrate_users_to_ielts_mode.py` — idempotent, uses single `updateMany`, prints before/after counts and a 5-user sample.

### How to run the user-mode migration on Emergent

```sh
cd backend
python scripts/migrate_users_to_ielts_mode.py
```

Expected output shape:
```
Database: ielts_database
Total users:        N
Already IELTS mode: M
To migrate:         N-M
Sample of users being migrated: ...
Updated K user(s) to learning_mode='ielts'.
Post-migration counts:
  learning_mode=ielts           : N
  learning_mode=general_english : 0
  learning_mode unset           : 0
```

Second run on same DB reports `To migrate: 0` and exits without writes.

### Smoke tests for /dashboard restoration

- After migration: log in as Aga → `/dashboard` now renders the Claude Design `DashboardPage` (Liz welcome card, band/target/days triptych, Today's Task, Skills table, Mock Test frame, Recent Sessions, Quick Access tiles).
- Create a new test account → onboarding → pick **General English** path → `/dashboard` correctly shows the old `Dashboard.js` (Lessons & Courses, Learning Tools, Quick Games, etc.).
- Create a new test account → onboarding → pick **IELTS** path → `/dashboard` shows Claude Design `DashboardPage`.
- Admin analytics at `/admin/learning-mode-stats` reflects the migration (GE count → 0 for pre-migration users).

---

## Addendum — 2026-04-23 · Grammar Blueprint + Vocabulary nav (no-migration push)

Greenfield addition. No DB migration required, no env vars, no new dependencies. The retired band-tiered Vocab/Grammar course has been removed in favour of:
- **Grammar** → new hand-curated *IELTS 8 Grammar Blueprint* (17 topics × 3 modules + cross-cutting Common Errors), at `/grammar`.
- **Vocabulary** → navigation layer at `/vocabulary` that deep-links into the existing 20 Advanced Mastery themes (no new vocabulary content — reuses the curated terms already inside Advanced Mastery).

### What's new
- `backend/content/grammar/blueprint_seed.json` + `backend/content/grammar/topics/*.json` — 18 static JSON files. Loaded in-memory at startup; read-only.
- `backend/routes/grammar_blueprint.py` — FastAPI router mounted under `/api/grammar-blueprint`:
  - `GET /modules` course meta + module list
  - `GET /topics` compact list for landing
  - `GET /topics/{slug}` full topic detail
  - `POST /topics/{slug}/practice/score` stateless scoring (no DB write)
  - `POST /_internal/reload` dev-only reload from disk
- `frontend/src/pages/GrammarBlueprint.js` — single-file landing + topic detail + stateless practice runner (modes: `error_detection`, `gap_fill`, `mcq`, `sentence_transformation`, `band8_ranking`).
- `frontend/src/pages/VocabularyBrowse.js` — 20-theme grid linking to `/advanced-mastery?lesson=N&focus=vocabulary`.
- `frontend/src/pages/AdvancedMasteryCourse.js` — reads `?focus=vocabulary`, auto-scrolls to the vocabulary card (new `id="vocabulary-section"` anchor + `scroll-mt-24`).
- `frontend/src/App.js` — lazy imports + routes: `/grammar`, `/grammar/:slug`, `/vocabulary`. Engine routes (`/grammar/learn/:moduleId`, etc.) precede `/grammar/:slug`, so React Router matches specific paths first.
- `QuickAccessTiles.jsx`, `Dashboard.js`, `LearningToolsIndex.js`, `QuestionBank.js`, `LandingPage.js` — now point at `/vocabulary` and `/grammar`. QuestionBank `grammar_vocab` filter redirects to `/grammar`.

### What's removed
- `frontend/src/pages/VocabGrammarCourse.js` and `frontend/src/pages/VocabGrammarQuiz.js` — deleted.
- `App.js` routes `/vocab-grammar` and `/vocab-grammar/quiz` — removed.
- `server.py` routes: `GET /api/vocab-grammar/lessons`, `GET /api/vocab-grammar/lessons/{lesson_id}`, `POST /api/vocab-grammar/progress`, `GET /api/vocab-grammar/progress/{user_id}`, and the four `/api/question-bank/grammar-vocab/*` endpoints — all removed.
- Startup seed call `seed_vocab_grammar_v2.py` — removed from `server.py` lifespan block. Seed scripts themselves remain in `backend/` but are no longer auto-invoked.
- MongoDB collections `vocab_grammar_lessons`, `vocab_grammar_progress`, `vocab_grammar_quizzes`, `vocab_grammar_quiz_progress` — no longer written or read by the app. **You may leave them in place** — nothing references them at runtime. Drop them manually if you want a tidy DB.

### Endpoint rename — generic TTS
- `POST /api/vocab-grammar/tts` → **`POST /api/speech/tts`**. Callers updated: `BeginnerCourse.js`, `MasteryCourse.js`, `PracticeMode.js`, plus the `backend/tests/test_bug_fixes_iter29.py` smoke test. The request/response contract is unchanged (`{ text, voice?, speed? }` → `{ audio, format }`).
- `POST /api/vocab-grammar/evaluate-pronunciation` — **deleted**. No frontend caller existed; it was dead code.

### Question Bank — grammar_vocab skill removed
- `GET /api/question-bank/skills` no longer returns `grammar_vocab`. `by_skill` stats in `GET /api/question-bank/stats` drop the `grammar_vocab` key.
- Frontend `QuestionBank.js`: selector icon, color, tile, and `grammar_vocab` branch removed. The four remaining skills (reading, listening, writing, speaking) are the only practice paths.
- Quick Practice (`/quick-practice`) continues to serve reading + listening via `PracticeMode.js`; writing and speaking redirect to their dedicated pages. Grammar/Vocabulary practice is exclusively reached via `/grammar` and `/vocabulary`.
- `backend/models/question_bank.py`: `Skill.GRAMMAR_VOCAB` enum value and `UserAnalytics.grammar_vocab_stats` field removed.

### Liz Teacher profile — one less signal
- `backend/routes/liz_teacher.py` previously read `vocab_grammar_quiz_progress` to surface `grammar_quizzes_completed` + `avg_grammar_score` in Liz's student profile. That section is now a no-op — Grammar Blueprint practice is stateless, so there is no per-user quiz history to aggregate. All other signals (scores, skill averages, days_inactive, completed_lessons, etc.) unchanged.

### Admin Panel cleanup
- The "Vocabulary & Grammar Course" stats card in `/admin/users/:userId` was removed (it showed `lessons_started`, `quiz_progress.accuracy`, weak units, recent_lessons — all sourced from the retired collections). The "Vocabulary & Grammar Engines" card for the real engines stays.

### Smoke tests
1. `GET /api/grammar-blueprint/modules` returns 3 modules + `cross_cutting`.
2. `GET /api/grammar-blueprint/topics` returns 19 summaries (17 module topics + common-errors + any future additions).
3. `GET /api/grammar-blueprint/topics/tenses-overview` returns full topic JSON.
4. Visit `/grammar` (logged in or out) — renders 3-module landing + Common Errors card.
5. Click a topic → `/grammar/:slug` renders intro/rules/examples/practice tiles. Start a practice → submit → per-item feedback + aggregate score.
6. Visit `/vocabulary` → 20-theme grid. Click theme 1 → `/advanced-mastery?lesson=1&focus=vocabulary` → auto-scrolls to the Advanced Vocabulary card inside Advanced Mastery Lesson 1.
7. Dashboard → Quick Access tiles "Vocabulary" and "Grammar" open `/vocabulary` and `/grammar` respectively.
8. QuestionBank → pick "Grammar & Vocabulary" skill → redirects to `/grammar` (no longer to the removed `/vocab-grammar/quiz`).

### No migration required
Content is file-backed (JSON on disk, loaded at import). No writes, no indexes, no env vars. If Emergent picks the branch up on a read-only FS, the app will still serve Grammar Blueprint content — only the `/_internal/reload` dev endpoint touches disk, and it only reads.
