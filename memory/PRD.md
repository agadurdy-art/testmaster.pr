# IELTS Ace — Pre-deploy PRD (2026-04-22)

## Original Problem Statement
Full-stack IELTS prep platform (React + FastAPI + MongoDB). Prepare branch `feat/ielts-ace-pre-deploy-2026-04-19` for deployment per `EMERGENT_HANDOFF_2026-04-19.md`.

## Architecture
- Frontend: React (3000) with 12-language i18n, PathPickerGate (IELTS vs GE), Claude Design V2 dashboard
- Backend: FastAPI (8001) with modular routes, writing evaluator V2
- DB: MongoDB (`ielts_database`)

## Post-deploy audit fixes (2026-04-22, commit c9a18a0f — applied via raw GitHub fetch)
1. **TR i18n 41 keys** — `frontend/src/lib/i18n.js` — previously silent EN fallbacks (navDashboard, welcomeBack, practiceTests, sessionActive, task descriptions etc.). Verified EN=657, TR=658, missing=0.
2. **Turkish uppercase dotted-İ fix** — `frontend/src/index.css` — added `html[lang="tr"] * { text-transform: none !important }` override. Verified: computed uppercase count = 0 under TR locale.
3. **Legacy-user dashboard migration** — `backend/scripts/migrate_users_to_ielts_mode.py` — one-shot idempotent Mongo `updateMany` flipping all existing users to `learning_mode="ielts"`. Verified 3/3 users migrated, 2nd run = 0 updates. Legacy users now land on Claude Design DashboardPage.

## Verified at /app (smoke tests passed 2026-04-22)
- TR locale renders Günaydın/Mevcut band/Hedef/Kalan gün (no EN fallback, no dotted-İ)
- Legacy user tester@test.com → Claude Design dashboard (EditorialMasthead + LizMessage + MetricsTriptych + TodaysTask)
- Backend writing evaluator V2 returns real Band 6.5 (not stub)
- All 3 users have learning_mode="ielts" after migration

## Prior pre-deploy ship list (still shipped)
- 12-language i18n (ar, mandarin, ko, th, ja, es, pt, ru, id, en, vi, tr)
- V4 Evaluator UI + /score-my-essay anonymous flow
- Writing Practice custom mode toggle
- "Rate this evaluator" + Share
- Playwright E2E crawler: 0 critical errors, 0 warnings

## Pending (not a blocker for this deploy)
- ConversationalAI (ElevenLabs widget) CORS error on pricing — non-blocker, documented
- Landing redesign for Speaking/Reading/Listening visuals (P1 — future PR)
- ElevenLabs TTS for Liz (P1 — `project_liz_voice_tts.md`)
- Discount Email Capture flow (P2 — `project_discount_email_capture.md`)

## Critical Notes
- **Workspace sync caveat**: This pod has no external git remote. Post-audit commits were applied via `curl` raw-GitHub fetch from `c9a18a0f` (conflict_220426_1159) — do NOT re-trigger sync or the local patches may be overwritten.
- User communicates in Turkish
- DB_NAME = `ielts_database`
- EMERGENT_LLM_KEY format: `sk-emergent-*` (verified working)
- Plan normalization: starter→learner, booster→achiever, pro→master
- Migration script is idempotent — safe to re-run after deploy

## Key Files (post-audit)
- `frontend/src/lib/i18n.js` — 12-lang dictionary, TR now complete
- `frontend/src/index.css` — TR text-transform override at line 261
- `frontend/src/App.js:393-401` — `isIeltsMode` routing split (Dashboard vs DashboardPage)
- `frontend/src/lib/learningMode.js` — `isIeltsMode()` helper
- `backend/scripts/migrate_users_to_ielts_mode.py` — one-shot migration
- `backend/services/writing_evaluator_v2.py` — LLM evaluator (real, not stub)
- `EMERGENT_DEPLOY_NOTE_2026-04-22.md` — READ-BEFORE-DEPLOY checklist + rollback
