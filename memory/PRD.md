# IELTS Ace — Pre-deploy PRD (2026-04-23, last updated 2026-02 fork iter76)

## Latest fork (commit eb5e4e9d + audit fixes — applied + verified 2026-02 fork iter78)

### Plan terminology audit — IELTS plans only (`free` / `weekly` / `monthly` / `exam`)
User clarified: **IELTS has NO `master` plan** — `master` is GE-legacy only. Removed `master` from every IELTS-side gate:
- `services/tier_resolver.py:158` — `FULL_TEST_PLANS = {"monthly", "exam"}` (was `{..., "master"}`)
- `routes/speaking_unified.py:748` — `is_plan_locked = decision.plan not in {"monthly", "exam"}`
- `frontend/src/features/speaking/components/SpeakingPractice.jsx:26` — `FULL_TEST_PLANS = new Set(['monthly', 'exam'])`
- `tier_resolver.py:UPGRADE_TARGETS["master"]` now suggests `["monthly", "exam"]` instead of `[]` so legacy GE master users get a clear path to IELTS top tier.
- `memory/test_credentials.md` updated — no longer lists `master` as an upgrade option.
- DB user `aga.durdy@gmail.com` (admin) migrated `master` → `monthly` (admins bypass quota anyway via `is_admin_user` check at tier_resolver.py:190).

Legacy GE refs intentionally KEPT for backward compat: `payments.py` (PayPal plan IDs + bank checkout for GE), `usage_tracking.py` (GE plan limits), `pages/PricingPage.js` (legacy `/pricing/ge` route), Profile.js `LEGACY_PLAN_KEYS`, planAccess.js `pro: 'master'` alias.

### Cambridge content audit (raw assets reachable)
| Book | test*.py modules | Audio files | Visual images |
|------|---|---|---|
| **ielts17** | ✅ test1-test4 (4/4) | ✅ 16/16 LOCAL pod (`/api/audio/cambridge/ielts17/...` → 200) | ✅ 3/3 PNG (test2/3/4 writing task1) → 200 |
| **ielts18** | ✅ test1-test4 (4/4) | ✅ 16/16 `customer-assets.emergentagent.com` CDN → 200 (6.9MB MP3 verified) | ✅ 6/6 PNG CDN → 200 |
| **ielts19** | ⚠️ Only `audioscripts.py` (T1+T2) | Served via DB-stored tests + `server.py:986 get_cambridge_listening_transcripts` runtime attachment | (Per user: dashboard listening flow works locally with this setup) |

`/api/cambridge/books` exposes `ielts17 + ielts18` only (ielts19 is intentionally not in `CAMBRIDGE_TESTS` registry — handled by separate dashboard listening flow per user).

### Earlier eb5e4e9d fixes (still active)
- `db.full_test_results` MongoDB collection — `routes/full_test.py:complete_test` upserts payload by `session_id` (uuid4 = share token).
- `GET /api/full-test/results/{session_id}` — real DB lookup, 404 if missing.
- `App.js` `/full-test/results/:sessionId` is PUBLIC.
- "Copy share link" button (`copy-share-link-btn`) in `FullTestResults.js`.
- `evaluate_writing_section` runs Task1+Task2 via `asyncio.gather` (~46s wall-clock vs ~70s serial).
- `schemas/speaking_evaluator.py:Fluency.wpm` — `mode="before"` validator clamps to [0, 400].

## Latest fork (commit eb5e4e9d — applied + verified 2026-02 fork iter77)
- **NEW** `db.full_test_results` MongoDB collection — `routes/full_test.py:complete_test` now upserts the full payload by `session_id` (uuid4 = share token). Auto-created, no manual seed.
- **NEW** `GET /api/full-test/results/{session_id}` — replaced stub with real DB lookup; returns 404 if missing. Refresh / bookmark / share now restore the 5-tab UI.
- **NEW** `App.js` route `/full-test/results/:sessionId` is now PUBLIC (no auth gate). Anonymous viewers can open shared result links.
- **NEW** "Copy share link" button (`data-testid="copy-share-link-btn"`) in `FullTestResults.js` header — clipboard copy + 2.2s "Link copied" feedback.
- **PERF** `routes/full_test.py:evaluate_writing_section` — Task1+Task2 now run via `asyncio.gather` (parallel). Wall-clock ~46s for both tasks vs ~50–70s serial — comfortably inside K8s 60s ingress.
- **FIX** `schemas/speaking_evaluator.py:Fluency.wpm` — `mode="before"` validator clamps to [0, 400] so Sonnet's hallucinated 1240 wpm no longer 422s. Unit-tested: 1240→400, -50→0, 180→180.

### Latest fork (commit 10d69bc6 — applied + verified 2026-02)
- **NEW** Cambridge audioscripts: Cam17 T1-T4, Cam18 T1-T4 attached to test*.py modules; Cam19 T1+T2 audioscripts shipped as `content/cambridge_tests/ielts19/audioscripts.py` and runtime-attached via `server.py:986 get_cambridge_listening_transcripts` (no static BOOKS entry — by design).
- **NEW** Backend writing evaluator V4 ("Liz's Margin") integrated at `routes/full_test.py:917 evaluate_writing_section` — emits `evaluator_v2` payload per task with: overall_band, criteria{TA/CC/LR/GRA}, inline_annotations, improved_version, response_diagnosis, highest_priority_fixes, rewrite_guidance, recommended_lesson, feedback_language.
- **NEW** FullTestResults page redesigned: 5-tab SceneBar (Overview / Reading / Listening / Writing / Speaking) at `frontend/src/pages/FullTestResults.js`; tabs lazy-render `ReadingResultsLayout`, `ListeningResultsLayout`, `WritingEvaluatorResult`, `SpeakingResultsState`.
- **NEW** `frontend/src/features/results/` — ListeningResultsLayout.jsx + ReadingResultsLayout.jsx + ReadingListeningDrilldown.jsx (P1-P4 drilldowns).
- **REMOVED** Liz Live (Gemini Live WS) pipeline: liz_live.py, LizLivePanel.jsx, useLizLive.js, smoke_liz_live_ws.py — confirmed intentional by user.

### Iter75/76 fixes
- FIXED `routes/full_test.py:626` — dropped erroneous `await` on sync `generate_lesson_recommendations` (was 500'ing every full-test completion).
- FIXED tester password — re-seeded bcrypt for geldiaga67@gmail.com → 'geldiaga67' so /api/auth/login returns 200.
- INSTALLED `@elevenlabs/react@^1.2.1` (was missing in node_modules causing 3 frontend compile errors in LizD8.jsx, useElevenLabsLiz.js, SpeakingPractice.jsx).
- VERIFIED 5 mobile polish fixes survived overlay: LandingNav drawer outside <header>, landing.css hero-grid minmax(0,1.05fr), AnnotatedEssayPanel marginRight flip, App.js has-mobile-bottom-nav body-class, server.py speaking_unified mounted before speaking_qb.
- VERIFIED `services/llm_compat.py` Anthropic-only (claude-sonnet-4-5, AsyncAnthropic, ANTHROPIC_API_KEY) — no GPT-4o fallback.

### Known/non-blocker
- `GET /api/full-test/results/{session_id}` is a stub (success:false). FullTestResults.js falls back to navigation-state — refresh loses results. Pre-existing.
- K8s ingress 60s hard timeout: full Task1+Task2 writing eval (~80–90s LLM) returns 502 at proxy in synthetic backend tests; real browser UI awaits the full call.

---

# IELTS Ace — Pre-deploy PRD (2026-04-23)

## Original Problem Statement
Full-stack IELTS prep platform (React + FastAPI + MongoDB). Prepare branch `feat/ielts-ace-pre-deploy-2026-04-19` for deployment.

## Architecture
- Frontend: React (3000) with 12-language i18n, PathPickerGate (IELTS vs GE), Claude Design V2 dashboard, Grammar Blueprint + Vocabulary nav, Writing Evaluator V2 with CoachingPanel
- Backend: FastAPI (8001) modular routes, Grammar Blueprint API, writing evaluator V2 coaching schema
- DB: MongoDB (`ielts_database`)

## Latest push applied & verified (commit bc51335e — 2026-04-23)

### Grammar & Vocabulary restructure
- **NEW** `/grammar` + `/grammar/:slug` (GrammarBlueprint.js) — hand-curated "IELTS 8 Grammar Blueprint": 3 modules, 17 topics + Common Errors cross-cutting
- **NEW** `backend/routes/grammar_blueprint.py` under `/api/grammar-blueprint/*` — modules, topics, topic detail, practice scoring
- **NEW** `backend/content/grammar/` — blueprint_seed.json + 19 topic JSON files
- **NEW** `/vocabulary` (VocabularyBrowse.js) — 20 themes grid linking to Advanced Mastery vocab activities
- **REMOVED** entirely: `/vocab-grammar` route + VocabGrammarCourse.js + VocabGrammarQuiz.js + backend CRUD + Skill.GRAMMAR_VOCAB enum + UserAnalytics.grammar_vocab_stats + QuestionBank tile + Admin card + Liz teacher signal + landing card
- **RENAMED** `/api/vocab-grammar/tts` → `/api/speech/tts` (Beginner/Mastery/PracticeMode clients already updated)

### Writing Evaluator V2 — Coaching fields restored
- Schema: `response_diagnosis` / `highest_priority_fixes` / `rewrite_guidance` / `recommended_lesson` — all optional
- `backend/prompts/writing-evaluator-v2.md` updated to request them
- `frontend/src/features/evaluator/schemas/writingResult.js` + new `CoachingPanel.jsx` render 4-card grid below AnnotatedEssay
- Teacher's Margin UI (ScoreStrip + AnnotatedEssay + MarginNotes + LizTake) unchanged — additive only
- Graceful degradation: missing fields hide silently

### Bug fixes
- Turkish hardcodes in `WritingTask2Practice.js` / `GeneralTask1Practice.js` / `GeneralTask2Practice.js` → i18n (EN/TR/VI keys added; 9 remaining languages need `scripts/translate_i18n.py` post-deploy)
- Mobile Dashboard quick-stats: `grid-cols-2 sm:grid-cols-3 lg:grid-cols-5` — no overflow at 390px
- Profile name leak fix: `useOnboardingState.INITIAL_STATE.name = null`; `DashboardTopBar` + `DashboardMobileDrawer` now use `user?.firstName || user?.name?.split(' ')[0] || "Student"`

## Prior audit fixes (commit c9a18a0f — 2026-04-22)
- TR i18n 41 keys (EN=657, TR=658, missing=0)
- `html[lang="tr"] * { text-transform: none !important }` CSS override — no more dotted-İ
- `backend/scripts/migrate_users_to_ielts_mode.py` — one-shot idempotent Mongo updateMany
- Verified: migration flipped 3/3 existing users to `learning_mode="ielts"`; 2nd run = 0 updates

## Verified at /app via smoke tests (2026-04-23)
- `/grammar` renders 3 modules + topic cards ✅
- `/vocabulary` renders 20 theme grid ✅
- Writing Evaluator V2 API returns all 4 coaching fields ✅
- `/api/speech/tts` exists, `/api/vocab-grammar/tts` 404 ✅
- Mobile 390px dashboard — no horizontal overflow ✅
- Profile name: "Tester" shown, no "Aga" leak ✅
- TR locale: dotted-İ issue fixed, 41 keys translated ✅
- Backend writing evaluator returns real Band (not stub) ✅

## Pending post-deploy actions (in EMERGENT_DEPLOY_NOTE_2026-04-22.md)
1. Run `cd backend && python scripts/migrate_users_to_ielts_mode.py` on prod DB (idempotent)
2. Run `scripts/translate_i18n.py` to propagate new EN/TR/VI keys to the other 9 languages

## Future / Backlog (not blocking deploy)
- P1: Landing redesign — Speaking/Reading/Listening visuals (currently Writing-only)
- P1: ElevenLabs TTS for Liz (`project_liz_voice_tts.md`)
- P2: Discount Email Capture (Stripe coupon + transactional email) — `project_discount_email_capture.md`
- Non-blocker: ElevenLabs widget CORS fail on /pricing (known)

## Critical Notes
- **Workspace sync caveat**: This pod has NO external git remote. Commits c9a18a0f + bc51335e + 697066de + 73b55485 + a02618a5 + ec6f8aec were applied via raw-GitHub `curl` fetch. If Emergent pull/sync reruns, confirm these commits remain — else re-apply.
- **Future deploy branches: branch from the LATEST live deploy commit (e.g. `deploy-2026-04-25`), NOT from the original April 12 base.** Branching from `deployed-app-12042026` lost session-applied mobile polish fixes (LandingNav drawer, hero-grid minmax, AnnotatedEssayPanel margin, App.js body-class effect) requiring re-application. Document this in deploy notes.
- User communicates in Turkish
- DB_NAME = `ielts_database`
- EMERGENT_LLM_KEY format: `sk-emergent-*` (working)
- Plan normalization: starter→learner, booster→achiever, pro→master

## Key Files (current)
- `backend/routes/grammar_blueprint.py` — prefix `/api/grammar-blueprint`
- `backend/content/grammar/` — seed JSON (3 modules + 19 topics)
- `backend/schemas/writing_evaluator.py` — +4 coaching fields
- `backend/prompts/writing-evaluator-v2.md` — coaching prompt additions
- `backend/scripts/migrate_users_to_ielts_mode.py` — idempotent migration
- `frontend/src/pages/GrammarBlueprint.js` — /grammar & /grammar/:slug
- `frontend/src/pages/VocabularyBrowse.js` — /vocabulary
- `frontend/src/features/evaluator/components/CoachingPanel.jsx` — 4-card coaching UI
- `frontend/src/features/evaluator/schemas/writingResult.js` — +coaching schema
- `frontend/src/lib/i18n.js` — 12 langs, TR complete, Writing practice keys added (EN/TR/VI)
- `frontend/src/index.css` — html[lang="tr"] text-transform override
- `frontend/src/App.js` — `isIeltsMode` routing split + new /grammar + /vocabulary routes
- `frontend/src/lib/learningMode.js` — `isIeltsMode()` helper
- `EMERGENT_DEPLOY_NOTE_2026-04-22.md` — READ-BEFORE-DEPLOY checklist (2026-04-23 addendum included)
