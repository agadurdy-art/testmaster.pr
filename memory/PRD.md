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
- **Workspace sync caveat**: This pod has NO external git remote. Commits c9a18a0f + bc51335e were applied via raw-GitHub `curl` fetch. If Emergent pull/sync reruns, confirm these commits remain — else re-apply.
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
