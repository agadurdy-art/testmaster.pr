# IELTS / GE Split Map

> Faz 1 tek-iş-tek-dosya refactor'unun çıktısı (2026-07-03). Roadmap Faz 3'ün
> (iki taze repo: IELTS + GE) girdisidir. Her modül ürün etiketi taşır:
> **IELTS** / **GE** / **SHARED** / **PUBLIC** / **ADMIN**.
> Split günü kural: her repo kendi etiketindeki dosyaları + SHARED kopyasını
> alır; karşı ürünün dosyalarını siler.

## 0. Kritik gerçek

GE ayrı bir modül değil, `user.learning_mode = "ielts" | "general_english"`
ile ayrılan bir MOD'dur. Tek kullanıcı havuzu, tek auth, tek ödeme
(`plan_access.py` iki ürünün tier'larını birden taşır). **Faz 3a'da karar
bekliyor:** kullanıcı + Mongo + ödeme ortak mı kalacak, tamamen mi ayrılacak.
Ayrılırsa GE kullanıcı/abonelik göç script'i + downtime planı gerekir.

## 1. Frontend

### Route grupları (src/app/routes/ — App.js 2026-07-03'te bölündü)
| Dosya | Etiket | Split günü |
|---|---|---|
| `publicRoutes.jsx` | PUBLIC | İki repoya da kopyalanır; `/landing/ge` + `/pricing/ge` GE'ye, IELTS landing'ler IELTS'e budanır |
| `adminRoutes.jsx` | ADMIN/SHARED | Karar 3a ile birlikte (tek admin mi ürün-başına mı) |
| `sharedRoutes.jsx` | SHARED | İki repoya kopya (profile, onboarding, checkout, placement testler, mode-branch'li /speaking-practice, legacy V1 platform) |
| `ieltsRoutes.jsx` | IELTS | GE repo'su siler |
| `geRoutes.jsx` | GE | IELTS repo'su siler |

### GE frontend (GE repo'suna gider)
- `features/ge/unified/` — UnifiedLessonPage orchestrator + 23 modül (GE lesson player)
- `pages/`: GEDashboard, LandingPageGE, RayTeacher, DevGePreview, GameBank, GameDemo, UnifiedCoursePage, UnifiedStagePage, DailyHabitPage, SpeakingPractice (GE dalı), PricingPage (GE legacy planlar)
- `features/placement/comprehensive/` — GE-primary SHARED (routes: /comprehensive-level-test + /ge/placement-test mode="ge")
- `features/dashboard/surfaces/legacy/` — mode-branch'li legacy dashboard (GE fallback)
- MobileBottomNav `detectGEMode` + GE tab seti; `lib/learningMode.js` (SHARED — 4-round chain-bug safety net içerir, dikkatli taşı)

### IELTS frontend (IELTS repo'sunda kalır)
- `features/`: speaking/ (qb+cambridge+fulltest surfaces), cambridge/surfaces/{interface,results}, questionbank/, fulltest/, tests_v1/ (legacy V1 — SHARED gibi davranabilir), legacy_courses/{mastery,advanced,beginner}, strategies/, liz/ (LizD8 + lizd8/), dashboard/surfaces/main/, progress/, results/ (+listening/ +reading/), placement (paylaşımlı), admin/visual_generator, landing/surfaces/v1
- `pages/` IELTS etiketli tüm sayfalar (QuickAssessment, FullTestResults, GrammarBlueprint, CoursesPage, AdaptiveLevelTest, PublicSpeakingTrial, Vocabulary*/Grammar* modları, ...)

### SHARED frontend çekirdek (iki repoya kopya)
`lib/` (i18n + locales/, learningMode, authToken/api, pendingPlan, analytics, languageLock, leakDetection), `contexts/`, `components/ui/*`, `components/` (MobileBottomNav, ErrorBoundary, QuotaExceededModal, BrandLogo, ProductSwitcher→cross-site link'e döner), `hooks/`, LoginPage, OnboardingPageV2 + features/onboarding, Profile→features/profile, PricingPageV2, BankTransferCheckout, Verify/Reset sayfaları, features/results/ (tests_v1 tüketiyor).

## 2. Backend

### GE backend (GE repo'suna gider)
- `routes/ge/` — beginner_english, tests_v1, evaluate_v1 (Ray tutor) [paket zaten toplu]
- `unified_learning_routes.py` (750) + `unified_learning_models.py`, `learning_platform_routes.py` + models (legacy)
- `routes/game_bank.py` + `content/game_bank_vocab.py`, `routes/beginner_pronunciation.py`, `routes/content_enrichment.py`, `services/ai_content_enricher.py`, `services/content_merger.py`, `services/tts_service.py`, `pronunciation_routes.py`
- `content/enriched`, `content/stage*`, GE seed'leri (seed_stage1_full, seed_unified_learning, seed_vocab_grammar*, seed_learning_platform, ...)
- `ai_content_generator.py`, `ai_generate_cache.py` (seed-time)

### IELTS backend (IELTS repo'sunda kalır)
- `routes/`: cambridge* (+services/cambridge_{scoring,feedback}), question_bank*, listening_qb*, reading_qb, speaking_* (unified split dahil), liz_* (teacher split + eleven), full_test*, level_test/ (SHARED-placement), writing_eval, writing_analysis, legacy_courses/ (Band-etiketli Mastery/Advanced/Vocab engine — IELTS!), dual_track (+content/dual_track/ — Academic vs GT, "General" adı yanıltıcı), grammar_engine*, grammar_blueprint, lesson_registry, strategies, visuals, recordings, full_test_audio, qa_admin, test_admin, worksheet_routes, speaking_helper, writing_helper, audio
- `services/`: speaking/, writing_evaluator_v2, ielts_evaluator, task generator'lar (+content/writing_task1_templates, enhanced_task_templates, writing_task2_prompts), chart_renderer + chart_data_generator, model_answer_*, practice_service, lesson_registry, audio_generator, test_normalizer, stats_aggregator, sonnet_qb_advisor, ielts_band_tables, evidence_pack_generator, qa_workflow_service, anon_eval_email, speaking_result_email, liz_eleven_quota, speaking/writing idempotency
- `level_test_quick/`, `adaptive_level_test_routes.py` + data, `writing_evaluator.py`, `full_sync.py` + `auto_sync.py` + IELTS seed'leri, `content/cambridge*`, `content/full_tests`, `content/strategies_guide|grammar|reading|listening|speaking`, `schemas/`, `models/`, `utils/`

### SHARED backend çekirdek (iki repoya kopya — drift riski!)
`auth_session.py`, `routes/auth*` (4 modül + shim), `security_utils.py`, `ratelimit.py`, **`plan_access.py` (İKİ ürünün tier'ları — split'te dikkatle bölünmeli)**, `services/`: tier_resolver, usage_tracking, plan_expiry, evaluation_quota, attempt_store, llm_compat, openai_compat, liz_llm, liz_tts, cost_telemetry, route_lifecycle, asset_cdn, recording_storage; `routes/`: payments* (6 modül — **ayrı ödeme linkleri kararı: fiyat tabloları ürün-başına ayrılacak**), admin, admin_analytics (learning_mode split endpoint'i!), admin_cost, admin_ops, feedback, testimonials, study_time, tts, speech_routes, notes_highlights, skill_analytics, speech_tts, tips_courses, user_completions, user_progress, dashboard_summary; `bootstrap.py`, `server.py` (770 — app kabuğu).

**DB kuplaj notu:** 17 modül `from server import db`, 14 modül `from server import persist_attempt` (lazy) kullanır — repo split'te `db.py` + `services/attempt_store` direkt import'una çevrilebilir (mekanik).

## 3. Bilinen kalanlar / opsiyonel
- 800 üstü kalan az sayıda dosya (tek-iş, kabul edildi): backend ge/tests_v1 1184 (dev submit_test fonksiyonu), full_sync 1000 (data-ops), model_answer_generator 861, liz_context 852, dual_track 851; frontend QuickAssessment 1049, FullTestResults 998, CambridgeSpeakingSection 995, GrammarBlueprint 910.
- 36 unused `components/ui/*` + use-toast kararı hâlâ açık.
- LandingPage v1 pricing butonunda pre-existing bug: `setIsLogin` tanımsız (tıklanınca console error; davranış eskisiyle aynı) — tek satırlık fix adayı.
- Backend testleri baseline: full pytest = **335 failed / 16 errors** (canlı BACKEND_URL bekleyen entegrasyon testleri; parite ölçütü bu sayının sabitliği). Route-set: **396 route** (byte-diff ile her adımda doğrulandı).
