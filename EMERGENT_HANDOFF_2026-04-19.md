# Emergent Deploy Handoff — 2026-04-19

**Branch to pull:** `feat/ielts-ace-pre-deploy-2026-04-19`
**Base:** `deployed-app-12042026`
**Commits:** 7 · **Files:** 157 · **Diff:** +19,760 / −413
**Env vars:** keep as-is — backend `.env`, frontend `.env` are NOT in the diff; Emergent preserves them across pulls.

---

## 1. What the user asked for (session goals)

User: Agageldi (IELTS teacher + testmaster.pro founder, HCMC). Commands in Turkish, output in English. Directives in this session:

1. **Task #73 — Admin analytics**
   - "Liz analytics, onboarding analytics, learning-mode × plan" görünürlüğü istedi.
   - 3 backend endpoint + 3 admin frontend sayfası.

2. **Task #74 — Testimonials system (kendi tasarımımızla)**
   - Kullanıcı landing'de testimonial paylaşabilsin, admin onaylayana kadar yayınlanmasın.
   - Submit form + admin moderation paneli + landing rail.

3. **Task #75 — GE-side simplification**
   - General English kullanıcılarının dashboard'unda IELTS-özel bölümler görünmesin.
   - Payments ve Liz GE tarafında çalışmaya devam etsin.
   - Not: Full GE configuration (FAZ 7, GE.1–GE.6) ACTION_PLAN'e göre IELTS Ace stabil olana kadar ertelenmiş — bu session'da sadece kozmetik filtreleme yapıldı, FAZ 7 yapılmadı.

4. **Deploy readiness audit**
   - "ielts ace tarafı tamamen çalışır durumda mı, deploy hazır mı?" sorusuna karşı P0/P1 kritik işleri gözden geçirdim.
   - P1.11 (course-embedded evaluator upgrade) known debt olarak ertelendi — blocking değil.

5. **Git workflow**
   - "env hepsini emergent saklıyor ve github'dan çekince o kendini tamamlar. geri kalanını tamamla. sonra yeni branch açıp dikkatli koy."
   - "verilen branch emergent tarafından çekilecek, ona göre yeni branche koy yani option 1."
   - → Yeni branch oluşturuldu, 7 semantic commit, merge edilmedi. Emergent pull etsin diye.

---

## 2. What was built / changed

### 2.1 Backend (FastAPI + Motor)

| File | Change | Purpose |
|---|---|---|
| `backend/routes/admin_analytics.py` | NEW | 3 endpoints under `/api/admin` gated by `x-admin-email` header + `is_admin_user()`: `/liz-analytics`, `/onboarding-analytics`, `/learning-mode-stats`. |
| `backend/routes/testimonials.py` | NEW | Public `POST /api/testimonials` (rate-limited: one pending per email) + public `GET /api/testimonials` (approved only, cap 50). Admin list/approve/reject/delete under `/api/admin/testimonials`. `_public_shape()` strips email. |
| `backend/server.py` | MODIFIED | Wired the two new routers after the payments router. |

Plus the feature bundles committed earlier on the branch: payments v2, Liz upgrades (Haiku/Sonnet), Azure TTS foundation.

### 2.2 Frontend (React 19 + React Router v6)

**New admin pages (`x-admin-email` header, allowlist email gating):**
- `pages/AdminLizAnalytics.js` — 4 stat cards + top users table.
- `pages/AdminOnboardingAnalytics.js` — completion funnel + path distribution bars.
- `pages/AdminLearningMode.js` — Mode × Plan matrix with totals.
- `pages/AdminTestimonials.js` — tabs: pending / approved / rejected / all; approve / reject / delete actions.

**New public testimonial surface:**
- `components/TestimonialSubmitForm.js` — stars, optional `band_achieved`, 10-char min quote, autofills from `user`.
- `components/TestimonialWall.js` — fetches `/api/testimonials?limit=...`; **returns `null` when empty** so landing stays tight.
- `pages/ShareYourStoryPage.js` — standalone `/share-your-story` route.

**Routing and nav:**
- `App.js` — lazy routes added for the 4 new admin pages + `/share-your-story`.
- `pages/AdminDashboard.js` — 4 new tiles in `ADMIN_MODULES` (Liz Analytics, Onboarding Analytics, Learning Mode × Plan, Testimonials).
- `pages/LandingPageV2.js` — `<TestimonialWall title="More student stories" />` inserted between static `<Testimonials />` and `<HowItWorks />`.

**Task #75 — GE cosmetic filtering in `pages/Dashboard.js`:**
- Section 1 "Practice & Test" wrapped in `{learningMode !== 'general_english' && (...)}`.
- Learning Path banner subtitle branches: GE → "Pre-A1 → ... → Advanced"; IELTS → "... → IELTS Mastery".
- Mobile menu Tests group hidden for GE.
- `learningMode` fallback chain: `userDetails?.learning_mode || user?.learning_mode || null`. Unknown → full set (safe default).

Plus feature bundles committed earlier: shared lib / components (mode routing, quotas, Liz), evaluator V4, landing D1, pricing D4, speaking D7, and the new V2 pages D1 / D3 / D4 / D6 / D7.

---

## 3. Commit map (chronological on the branch)

```
82f758d7  feat(backend): AI services foundation — Claude Haiku/Sonnet + Azure TTS
51622ec0  feat(backend): payments v2, admin analytics, testimonials, Liz upgrades
af30291d  feat(frontend): shared lib + components for mode routing, quotas, Liz
deeb9a75  feat(frontend): feature bundles — evaluator V4, landing D1, pricing D4, speaking D7
69191989  feat(frontend): new IELTS Ace V2 pages (D1/D3/D4/D6/D7 + samples)
6698ba71  feat(frontend/admin): analytics + testimonials moderation pages
0fcb3169  feat(frontend): mode routing, Dashboard GE simplification, QB 2-tab, Liz NAVIGATE
```

---

## 4. Deploy readiness checklist (at branch time)

| Area | Status |
|---|---|
| Payments (PayPal webhook verify + SePay VN + VietQR) | Shipped |
| Admin allowlist (`aga.durdy`, `admin@ieltsace.com`, `stemhousebenluc@gmail.com`) | Wired on both admin pages and backend `is_admin_user()` |
| Admin analytics endpoints | Shipped |
| Testimonials end-to-end (submit → moderate → landing) | Shipped |
| GE Dashboard simplification (cosmetic, per plan) | Shipped |
| Liz (Haiku/Sonnet + Azure TTS + NAVIGATE intent) | Shipped |
| Mode-aware routing | Shipped |
| P1.11 course-embedded evaluator upgrade | **Deferred** — known debt, not blocking |
| FAZ 7 full GE configuration (GE.1–GE.6) | **Deferred** — per ACTION_PLAN, after IELTS Ace stability |
| Mobile QA pass, E2E smoke, band accuracy regression, testimonial seed content | **Deferred** post-deploy |

---

## 5. Known local artifact — do not touch

`memory/TEST_CREDENTIALS.md` shows as locally modified. Root cause: macOS case-insensitive FS plus git tracking both `TEST_CREDENTIALS.md` and `test_credentials.md` (filesystem only has lowercase). Pre-existing; not part of this session. Deliberately left out of commits.

---

## 6. What Emergent needs to do

1. Pull `feat/ielts-ace-pre-deploy-2026-04-19`.
2. Keep existing `backend/.env` and `frontend/.env` as-is — diff does not touch them.
3. Redeploy backend + frontend. New admin routes and `/share-your-story` will be live.
4. Smoke check: `GET /api/testimonials` returns `[]` (or approved rows) and the four `/admin/*` pages load behind the allowlist.

---

## 7. Post-deploy backlog (owned by Aga, not in this branch)

- P1.11 course-embedded evaluator upgrade.
- FAZ 7 GE.1–GE.6 (full GE curriculum + GE-specific onboarding + GE content).
- Seed testimonials (3–5 approved rows) so `TestimonialWall` renders on landing from day one.
- Mobile QA on dashboard + admin panels.
- Band accuracy regression suite.
