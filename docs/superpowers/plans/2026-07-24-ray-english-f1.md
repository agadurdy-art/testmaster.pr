# Ray English Standalone Repo (F1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create `~/ray-english` — a pure General English app copied from `~/testmaster-fresh` with every IELTS surface deleted — and ship it live to the existing CF Pages project `ge-testmaster` (ge.testmaster.pro).

**Architecture:** Copy the working tree with fresh git history. Purge order keeps the build green after every commit: first flip the mode library to GE-always, then unwire route groups, then rebrand auth/onboarding/shell, then bulk-delete the now-unreferenced IELTS files. `yarn build` is the regression gate after each task; a bundle-grep + live E2E gate closes the phase.

**Tech Stack:** React 19 + Vite 7 (CRA-compatible `REACT_APP_*` env inlining), react-router 7, yarn 1.22. Backend: FastAPI + Motor, Dockerfile build, deployed to a **new dedicated Railway project `ray-english`** (spec amendment 2026-07-24). `api.testmaster.pro` stays live as instant rollback.

**Spec:** `docs/superpowers/specs/2026-07-22-ray-english-cf-migration-design.md` (incl. 2026-07-24 amendment)

**⚠️ Standing landmine:** never run `railway up` against service `testmaster.pr` (project `sublime-celebration`). The ONLY permitted contact with it in this plan is `railway variables --json` (read-only) in Task 14. The new `ray-english` Railway project is a separate blast radius — `railway up` there is safe and expected.

---

### Task 1: Create `~/ray-english` with fresh git history

**Files:** entire tree copy (no modifications yet).

- [ ] **Step 1: Copy the working tree (exclude git history, deps, build artifacts)**

```bash
rsync -a --exclude='.git' --exclude='node_modules' --exclude='build' \
  --exclude='e2e/reports' --exclude='sast' --exclude='.venv' --exclude='__pycache__' \
  /Users/aga/testmaster-fresh/ /Users/aga/ray-english/
```

- [ ] **Step 2: Init fresh repo on `main` and make the initial commit**

```bash
cd /Users/aga/ray-english
git init -b main
git add -A
git commit -m "chore: import GE snapshot from testmaster-fresh (branch split/ielts, a8a42347 working tree)"
```

Expected: one commit, `git log --oneline` shows exactly 1 line.

- [ ] **Step 3: Sanity check — no nested .git, spec + plan docs came along**

```bash
find /Users/aga/ray-english -name ".git" -maxdepth 3 -not -path "*/ray-english/.git"
ls /Users/aga/ray-english/docs/superpowers/specs/2026-07-22-ray-english-cf-migration-design.md
```

Expected: find prints nothing extra; spec file exists.

### Task 2: READMEs — Ray English identity + backend deployment warning

**Files:**
- Create: `/Users/aga/ray-english/backend/README.md`
- Overwrite: `/Users/aga/ray-english/README.md`

- [ ] **Step 1: Write `backend/README.md`**

```markdown
# Ray English backend

FastAPI + Motor backend, deployed to the **dedicated Railway project
`ray-english`** (Dockerfile build, healthcheck `/api/health`). This directory
IS the deploy source for that project — `railway up` from here (linked to
`ray-english`) is the normal deploy path.

⚠️ **NEVER deploy to the OLD backend.** `https://api.testmaster.pro` = Railway
project `sublime-celebration`, service `testmaster.pr` — a 2026-07-03 monolith
snapshot kept as rollback. `railway up` into THAT service replaces the
snapshot and **deletes the GE endpoints**. Before any `railway up`, run
`railway status` and confirm the linked project is `ray-english`, not
`sublime-celebration`.

Env vars (same Mongo as the old backend → same users/content/tokens):
`MONGO_URL`, `DB_NAME`, `STATIC_BASE_URL`, `CORS_ORIGINS` (GE origins), plus
the AI keys the snapshot uses. Rollback: rebuild the frontend with
`REACT_APP_BACKEND_URL=https://api.testmaster.pro`.
```

- [ ] **Step 2: Overwrite root `README.md`**

```markdown
# Ray English

General English learning app (Ray, the AI tutor) — the standalone GE product
split out of testmaster-fresh on 2026-07-24.

- **Live:** https://ge.testmaster.pro (CF Pages project `ge-testmaster`)
- **Backend:** `backend/` → Railway project **`ray-english`** (own service +
  domain). See `backend/README.md` — NEVER deploy to the old
  `testmaster.pr` service (rollback snapshot).
- **Frontend:** `frontend/` — React 19 + Vite. Build:
  `cd frontend && REACT_APP_BACKEND_URL=<ray-english Railway URL> yarn build`
- **Deploy:** `npx wrangler pages deploy build --project-name ge-testmaster`
  (from `frontend/`), then purge ge.testmaster.pro index in CF.

This repo contains **no IELTS product**. IELTS Ace lives in `~/ielts`
(ieltsace.app) and must never be touched from here.
```

- [ ] **Step 3: Commit**

```bash
cd /Users/aga/ray-english && git add README.md backend/README.md && git commit -m "docs: Ray English identity + backend do-not-deploy warning"
```

### Task 3: Baseline install + build (green before purge)

- [ ] **Step 1: Install and build**

```bash
cd /Users/aga/ray-english/frontend
yarn install
yarn build
```

Expected: build succeeds, output in `frontend/build/`. If install/build fails here, STOP — the copy is broken; fix before purging anything.

- [ ] **Step 2: Baseline test run (record, don't fix)**

```bash
yarn test 2>&1 | tail -20
```

Expected: note pass/fail counts. The two known test files (`src/pages/__tests__/FullTestInterface.parse.test.js`, `src/features/speaking/lib/adaptSpeakingResult.fulltest.test.js`) cover IELTS full-test code and will be deleted in Task 12.

### Task 4: `learningMode.js` — GE always

**Files:**
- Modify: `frontend/src/lib/learningMode.js`

Keep every export name (many files import them) but hard-wire GE. This single change flips `sharedRoutes` speaking branch, App.js Liz-button condition, `homePath()` etc. to GE behavior before any deletion.

- [ ] **Step 1: Replace the mode functions' bodies**

In `frontend/src/lib/learningMode.js`, keep the file's exports but make them constant:

```javascript
// Ray English is a single-product app: every user is a General English user.
// learning_mode from the shared backend is ignored on purpose (spec F1:
// "login always lands on /ge/dashboard regardless of learning_mode").
export function isIeltsMode(_user) {
  return false;
}

export function isGeneralEnglishMode(_user) {
  return true;
}

export function homePath(_user) {
  return '/ge/dashboard';
}
```

Leave `normalizeProduct` (and any other helper exports the file has) in place unchanged — `publicRoutes.jsx` imports it. Delete only the internal `readPathHint` logic if it becomes unreferenced.

- [ ] **Step 2: Build**

```bash
cd /Users/aga/ray-english/frontend && yarn build
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
cd /Users/aga/ray-english && git add frontend/src/lib/learningMode.js && git commit -m "feat: hard-wire learning mode to General English"
```

### Task 5: Unwire IELTS routes + Liz floating button from App.js

**Files:**
- Modify: `frontend/src/App.js` (imports ~line 37, ~line 41, routes ~line 382, Liz block ~lines 389–391)
- Delete: `frontend/src/app/routes/ieltsRoutes.jsx`

- [ ] **Step 1: Edit App.js**

Remove these lines:

```javascript
import { ieltsRoutes } from './app/routes/ieltsRoutes';
```

```javascript
const LizFloatingButton = lazy(() => import('./components/LizFloatingButton'));
```

```javascript
        {ieltsRoutes({ user, handleLogout })}
```

```javascript
      {user && isIeltsMode(user) && location.pathname.startsWith('/dashboard') && (
        <Suspense fallback={null}><LizFloatingButton user={user} /></Suspense>
      )}
```

If `isIeltsMode` is now unused in App.js, remove it from the `import { isIeltsMode, homePath } from './lib/learningMode';` line (keep `homePath` if still used).

- [ ] **Step 2: Delete the route group**

```bash
cd /Users/aga/ray-english && git rm frontend/src/app/routes/ieltsRoutes.jsx
```

- [ ] **Step 3: Build**

```bash
cd /Users/aga/ray-english/frontend && yarn build
```

Expected: PASS (deleted file was only imported by App.js).

- [ ] **Step 4: Commit**

```bash
cd /Users/aga/ray-english && git add -A && git commit -m "feat: remove IELTS route group and Liz floating button from app shell"
```

### Task 6: publicRoutes — GE-only marketing surface

**Files:**
- Modify: `frontend/src/app/routes/publicRoutes.jsx`

- [ ] **Step 1: Rewrite the route list**

Keep: `/login`, `/start`, `/signup` (SignupBridge), `/privacy`, `/terms`, `/contact`, `/status`, `/about`, `/verify-email`, `/reset-password`, `/share-your-story`, `/pricing/ge`, `/landing/ge`, `/dev/ge` (dev-gated).

Replace/redirect:

```jsx
<Route path="/" element={<Navigate to="/landing/ge" replace />} />
<Route path="/pricing" element={<Navigate to="/pricing/ge" replace />} />
```

Delete these routes AND their lazy imports at the top of the file:
`/landing/v1` (LandingPage + top-level import), `/landing/v2` (LandingPageV2), `/landing/demo` (LandingPageDemo), `/pricing/v1`, `/pricing/v2` (PricingPageV2), all `/samples/*` routes (SampleReportBand65Task2, SampleReportBand80Task2, SampleReportBand50Task2, SampleReportSpeakingPart2), `/score-my-essay` (PublicEssayEvaluator), `/r/:token` (AnonEvalReportPage), `/score-my-speaking` (PublicSpeakingTrial), `/lesson-preview/:courseType/:lessonId` (LessonPreview), `/feature-showcase` (FeatureShowcase), `/dev/evaluator-result` (EvaluatorResultPreview), and the four `/demo/writing-task1|writing-task2|general-task1|general-task2` routes (WritingTask1Practice, WritingTask2Practice, GeneralTask1Practice, GeneralTask2Practice).

In `SignupBridge` no logic change is required (`normalizeProduct`/`homePath` now resolve GE), but the `?path=` product param becomes vestigial — leave it; it still writes `testmaster_onboarding_path` harmlessly.

- [ ] **Step 2: Build**

```bash
cd /Users/aga/ray-english/frontend && yarn build
```

Expected: PASS. If Vite reports an unused-import error it will actually just tree-shake — the real check is no *missing* import.

- [ ] **Step 3: Commit**

```bash
cd /Users/aga/ray-english && git add frontend/src/app/routes/publicRoutes.jsx && git commit -m "feat: GE-only public routes — root and /pricing redirect to GE surfaces, IELTS marketing routes removed"
```

### Task 7: sharedRoutes — speaking practice always GE

**Files:**
- Modify: `frontend/src/app/routes/sharedRoutes.jsx:12,20,58-67`

- [ ] **Step 1: Edit**

Remove:

```javascript
import { isIeltsMode } from '../../lib/learningMode';
const SpeakingPracticeV2 = lazy(() => import('../../pages/SpeakingPracticeV2'));
```

Replace the `/speaking-practice` route element with:

```jsx
<Route
  path="/speaking-practice"
  element={user ? <SpeakingPractice user={user} /> : <RedirectToLogin />}
/>
```

- [ ] **Step 2: Build + commit**

```bash
cd /Users/aga/ray-english/frontend && yarn build && cd .. && git add frontend/src/app/routes/sharedRoutes.jsx && git commit -m "feat: /speaking-practice always renders the GE speaking surface"
```

### Task 8: Auth surfaces — Ray English branding + GE-only login routing

**Files:**
- Modify: `frontend/src/pages/LoginPage.js` (landingFor ~51-66, brand ~82-84, logo ~186)
- Modify: `frontend/src/pages/StartLanding.js:108-110`
- Modify: `frontend/src/pages/ResetPasswordPage.js:60`
- Modify: `frontend/src/components/BrandLogo.jsx`

The GE logo asset already exists: `frontend/public/brand/ray-english-logo.png`.

- [ ] **Step 1: LoginPage — landing always GE**

Replace the whole `landingFor` function with:

```javascript
  // Ray English is single-product: any account with a learning_mode on file
  // (even 'ielts' — shared backend) lands on the GE dashboard. Only brand-new
  // accounts with no mode go to onboarding.
  const landingFor = (u) => {
    if (safeNext) return safeNext;
    const mode = (u?.learning_mode || '').toLowerCase();
    const hasMode = ['ielts', 'general_english', 'general', 'ge', 'both'].includes(mode);
    if (hasMode || u?.onboarding_complete) return '/ge/dashboard';
    return '/onboarding';
  };
```

- [ ] **Step 2: LoginPage — brand always Ray English**

Replace lines defining `isGE`/`brandTitle`/`brandTagline` with:

```javascript
  const brandTitle = 'Ray English';
  const brandTagline = 'General English · by testmaster.pro';
```

(Leave the `pathPick` localStorage effect intact if other code references `pathPick`; if `isGE` was its only consumer besides branding, delete `pathPick` and its `useEffect` too.)

Replace the logo `<img>` (line ~186):

```jsx
<img src="/brand/ray-english-logo.png" alt="Ray English" style={{ width: 42, height: 42, borderRadius: 13, objectFit: 'cover', boxShadow: '0 6px 16px -4px rgba(16,185,129,.35)' }} />
```

- [ ] **Step 3: StartLanding + ResetPasswordPage logo/wordmark**

In both files, swap the `<img src="/brand/ielts-ace-logo.jpg" alt="IELTS Ace" .../>` to the same Ray English `<img>` as above. In `StartLanding.js:110` change `<b>IELTS Ace</b>` to `<b>Ray English</b>`.

- [ ] **Step 4: BrandLogo.jsx — Ray English lockup**

Change: `img src` → `/brand/ray-english-logo.png`; remove the `variant` branching — set `const wordmark = 'Ray English';` and `const ariaLabel = 'Ray English home';` (keep the `variant` prop accepted so existing call sites don't break); default `href = '/ge/dashboard'`. Update the file's doc comment to say Ray English.

- [ ] **Step 5: Build + grep + commit**

```bash
cd /Users/aga/ray-english/frontend && yarn build
grep -rn "ielts-ace-logo" src/ ; # expected: no matches
cd /Users/aga/ray-english && git add -A && git commit -m "feat: Ray English branding on login, start, reset-password, BrandLogo; login always lands on GE"
```

### Task 9: Onboarding — GE flow only (steps 4→5, "Meet Ray")

**Files:**
- Modify: `frontend/src/features/onboarding/hooks/useOnboardingState.js`
- Modify: `frontend/src/features/onboarding/components/OnboardingQuiz.jsx`
- Modify: `frontend/src/features/onboarding/constants.js:20-26`
- Modify: all 12 `frontend/src/locales/*.js` (`onbStepName5`)
- Delete (after grep check): `Step1Path.jsx`, `Step2TargetDate.jsx`, `Step3CurrentLevel.jsx`, and `BandLadder.jsx`/`Calendar.jsx` if orphaned

- [ ] **Step 1: useOnboardingState.js — force GE path**

Replace `readInitialPath` with:

```javascript
// Ray English: single product — the path is always 'general' and the flow
// starts at Step 4 (language). Steps 1–3 (path pick, band target, level)
// were IELTS-only and are deleted.
function readInitialPath() {
  return 'general';
}
```

In `back()`, replace `if (s.step <= 1) return s;` with `if (s.step <= 4) return s;` and delete the now-dead line `if (s.step === 4 && s.path === 'general') prev = 1;`.

In `skip()`, change `path: s.path || 'ielts',` to `path: 'general',`.

- [ ] **Step 2: OnboardingQuiz.jsx — remove steps 1–3**

Delete the imports of `Step1Path`, `Step2TargetDate`, `Step3CurrentLevel` and their `{step === 1 && (...)}`, `{step === 2 && (...)}`, `{step === 3 && (...)}` render blocks. Find the back-button render condition (`grep -n "back\|step > 1" frontend/src/features/onboarding/components/OnboardingQuiz.jsx frontend/src/features/onboarding/components/NavRow.jsx frontend/src/features/onboarding/components/StickyActions.jsx frontend/src/features/onboarding/components/TopBar.jsx`) and change its threshold from `step > 1` to `step > 4` so no inert Back button shows on Step 4.

- [ ] **Step 3: Delete orphaned step components**

```bash
cd /Users/aga/ray-english/frontend
grep -rln "Step1Path\|Step2TargetDate\|Step3CurrentLevel\|BandLadder\|Calendar" src/ --include="*.jsx" --include="*.js" | grep -v locales
```

Delete each of `Step1Path.jsx`, `Step2TargetDate.jsx`, `Step3CurrentLevel.jsx` once its only referencer is itself; delete `BandLadder.jsx` and `Calendar.jsx` only if the grep shows no surviving importer.

- [ ] **Step 4: "Meet Ray" step name — constants + 12 locales**

`constants.js`: `5: 'Meet Liz'` → `5: 'Meet Ray'`. (Steps 1–3 names may stay; harmless dead keys.)

Locales (`onbStepName5`), translated in-session:

| file | new value |
|---|---|
| en.js | `'Meet Ray'` |
| tr.js | `"Ray'le tanış"` |
| vi.js | `'Gặp Ray'` |
| pt.js | `'Conhecer o Ray'` |
| ko.js | `'Ray 만나기'` |
| th.js | `'พบกับ Ray'` |
| ru.js | `'Знакомство с Рэем'` |
| mandarin.js | `'认识 Ray'` |
| ja.js | `'Ray に会う'` |
| id.js | `'Kenalan sama Ray'` |
| es.js | `'Conoce a Ray'` |
| ar.js | `'تعرّف على Ray'` |

- [ ] **Step 5: Build + commit**

```bash
cd /Users/aga/ray-english/frontend && yarn build
cd /Users/aga/ray-english && git add -A && git commit -m "feat: GE-only onboarding — starts at language step, Meet Ray label in 12 locales"
```

### Task 10: App shell — GE side rail + GE mobile nav

**Files:**
- Modify: `frontend/src/features/dashboard/components/DashboardSideNav.jsx`
- Modify: `frontend/src/components/MobileBottomNav.js`

- [ ] **Step 1: DashboardSideNav — GE navigation groups**

Add `Gamepad2` to the lucide import line. Replace the `GROUPS` constant with:

```javascript
const GROUPS = [
  {
    items: [
      { label: "Dashboard", href: "/ge/dashboard", icon: LayoutGrid, match: ["/ge/dashboard", "/dashboard"] },
      { label: "Course map", href: "/unified", icon: BookOpen, match: ["/unified"] },
      { label: "Daily habit", href: "/unified/daily-habit", icon: ClipboardCheck, match: ["/unified/daily-habit"] },
    ],
  },
  {
    title: "Practice",
    items: [
      { label: "Speaking", href: "/speaking-practice", icon: Mic, match: ["/speaking-practice"] },
      { label: "Games", href: "/game-bank", icon: Gamepad2, match: ["/game-bank", "/game-demo"] },
      { label: "Ray · coach", href: "/ray", icon: Sparkles, match: ["/ray"], badge: "Live" },
    ],
  },
  {
    title: "You",
    items: [
      { label: "Placement test", href: "/ge/placement-test", icon: ClipboardList, match: ["/ge/placement-test"] },
      { label: "Plans & pricing", href: "/pricing/ge", icon: CreditCard, match: ["/pricing"] },
    ],
  },
];
```

Change the brand `<Link to="/dashboard" ...>` (line ~105) to `<Link to="/ge/dashboard" ...>`. The expandable-children branch becomes dead code (no `children` items) — leave it; it compiles.

- [ ] **Step 2: MobileBottomNav — GE tabs only**

Delete `IELTS_TABS`, `detectGEMode`, the `LIZ_AVATAR_URL` import (keep `RAY_AVATAR_URL`), and the `void Gamepad2;` line + `Gamepad2` import if unused. Replace the component's mode logic:

```javascript
export default function MobileBottomNav({ currentPath = '' }) {
  const navigate = useNavigate();
  const TABS = GE_TABS;
  const coachGradient = 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)';
  const coachShadow = '0 8px 20px -4px rgba(234, 88, 12, 0.45)';
```

(Rest of the JSX unchanged.)

- [ ] **Step 3: Build + commit**

```bash
cd /Users/aga/ray-english/frontend && yarn build
cd /Users/aga/ray-english && git add -A && git commit -m "feat: GE app shell — Ray side rail and GE-only mobile bottom nav"
```

### Task 11: GE landing cleanup + index.html rebrand

**Files:**
- Modify: `frontend/src/pages/LandingPageGE.js:521-527`
- Modify: `frontend/index.html`

- [ ] **Step 1: Remove the IELTS switch link**

Delete this block from LandingPageGE.js:

```jsx
          <p className="relative z-10 mt-4 text-[12px] text-violet-200">
            Preparing for IELTS instead?{' '}
            <a href="/" className="underline hover:text-white">
              Switch to the IELTS path
            </a>
            .
          </p>
```

- [ ] **Step 2: index.html — Ray English metadata**

Replace title/description/og/twitter tags:

```html
<meta name="description" content="Ray English — learn General English with Ray, your AI tutor. Structured stages, daily habits, games and speaking practice." />
<meta property="og:title" content="Ray English — Learn English with Ray" />
<meta property="og:description" content="Structured General English stages, daily habits, games and speaking practice with Ray, your AI tutor." />
<meta property="og:site_name" content="Ray English" />
<meta property="og:image" content="https://ge.testmaster.pro/brand/ray-english-logo.png" />
<meta name="twitter:title" content="Ray English — Learn English with Ray" />
<meta name="twitter:description" content="Structured General English stages, daily habits, games and speaking practice with Ray, your AI tutor." />
<meta name="twitter:image" content="https://ge.testmaster.pro/brand/ray-english-logo.png" />
...
<title>Ray English — Learn English with Ray</title>
```

Also rename the hidden helper div ids `ielts-ace-examiner` → `ray-english-examiner` and `ielts-level-test-agent` → `ray-level-test-agent` **only after** grepping `src/` for those ids and updating any reference (`grep -rn "ielts-ace-examiner\|ielts-level-test-agent" src/`). If referenced by deleted IELTS code only, delete the divs instead.

- [ ] **Step 3: Build + commit**

```bash
cd /Users/aga/ray-english/frontend && yarn build
cd /Users/aga/ray-english && git add -A && git commit -m "feat: remove IELTS switch link; Ray English document metadata"
```

### Task 12: Bulk-delete unreferenced IELTS pages, features, tests, assets

**Files:** deletions only. Everything below became unreferenced in Tasks 5–11. Work in the four batches, **building after each batch** so a hidden reference is caught immediately.

- [ ] **Step 1: Batch A — IELTS pages**

```bash
cd /Users/aga/ray-english/frontend/src/pages
git rm -f DashboardPage.js MyResults.js CoursesPage.js CourseDetail.js QuickAssessment.js \
  WritingPractice.js SampleReportsHub.jsx SpeakingPracticeV2.js SpeakingPremium.js Progress.js \
  BeginnerCourse.js MasteryCourse.js AdvancedMasteryCourse.js QuestionBank.js \
  WritingTask1Practice.js WritingTask2Practice.js GeneralTask1Practice.js GeneralTask2Practice.js \
  ReadingPracticeAcademic.js ReadingPracticeGeneral.js ReadingPracticeMasteryAcademic.js \
  ReadingPracticeMasteryGeneral.js ReadingPracticeByType.js ListeningPractice.js SpeakingPracticeQB.js \
  PracticeMode.js FullTestMode.js FullTestInterface.js FullTestResults.js \
  CambridgeTestInterface.js CambridgeTestResults.js FocusPlan.js LizTeacher.js \
  VocabularyLearnMode.js VocabularyPracticeMode.js VocabularyQuizMode.js VocabularyProductionMode.js VocabularyBrowse.js \
  GrammarLearnMode.js GrammarPracticeMode.js GrammarQuizMode.js GrammarProductionMode.js GrammarSmartReview.js GrammarBlueprint.js \
  ReviewBank.js LandingPage.js LandingPageV2.js LandingPageDemo.js PricingPageV2.js \
  SampleReportBand65Task2.js SampleReportBand80Task2.js SampleReportBand50Task2.js SampleReportSpeakingPart2.js \
  PublicEssayEvaluator.js AnonEvalReportPage.js PublicSpeakingTrial.js LessonPreview.js \
  FeatureShowcase.js EvaluatorResultPreview.js
git rm -rf __tests__/FullTestInterface.parse.test.js
cd /Users/aga/ray-english/frontend && yarn build
```

Expected: PASS. If a build error names one of these files, a survivor still imports it — find with `grep -rn "<name>" src/` and remove that import first (it is dead IELTS wiring by definition).

- [ ] **Step 2: Batch B — IELTS feature directories (grep-guarded)**

For each candidate dir, delete only if no survivor references it:

```bash
cd /Users/aga/ray-english/frontend
for d in cambridge legacy_courses liz strategies questionbank fulltest advancedVocab; do
  echo "== $d =="; grep -rln "features/$d" src/ | grep -v "src/features/$d" || echo "ORPHAN — safe to delete"
done
```

For every dir printing `ORPHAN`: `git rm -rf src/features/<dir>`. For any dir still referenced, list the referencing file — if the referencer is itself IELTS-dead code, delete that too; if it is a GE/shared survivor, STOP and keep the dir (report in the task summary).

Then components:

```bash
git rm -f src/components/LizFloatingButton.js
grep -rln "ProductSwitcher" src/ | grep -v ProductSwitcher.jsx
```

If `ProductSwitcher` is referenced (likely `features/profile/`), remove the import + render from the referencing file (it is the IELTS↔GE switcher — meaningless in a single-product app), then `git rm -f src/components/ProductSwitcher.jsx`.

```bash
yarn build
```

Expected: PASS.

- [ ] **Step 3: Batch C — dead IELTS test + speaking lib check**

```bash
grep -rln "adaptSpeakingResult.fulltest" src/ | grep -v test
```

If only the test references it: `git rm -f src/features/speaking/lib/adaptSpeakingResult.fulltest.test.js`. Then:

```bash
yarn test 2>&1 | tail -5
```

Expected: remaining tests PASS (or zero tests found — also fine).

- [ ] **Step 4: Batch D — brand asset + orphan sweep of features/dashboard and features/landing**

```bash
grep -rn "ielts-ace-logo" src/ index.html   # expected: no matches
git rm -f public/brand/ielts-ace-logo.jpg
# Orphan check for the two mixed dirs — delete only clearly-orphaned IELTS files:
for f in src/features/dashboard/components/*.jsx src/features/landing/components/*.jsx; do
  n=$(basename "$f" | sed 's/\.[^.]*$//'); c=$(grep -rln "$n" src/ | grep -v "$f" | wc -l | tr -d ' ');
  [ "$c" = "0" ] && echo "ORPHAN: $f"
done
```

Review the ORPHAN list by name: delete Liz/IELTS-named orphans (e.g. `MeetLiz.jsx`, `LizAvatar.jsx`, `DashboardBottomNav.jsx` if orphaned); keep anything GE-named or ambiguous. This is best-effort dead-code trim — invisible leftovers are acceptable in F1; user-visible purge is the gate.

```bash
yarn build
cd /Users/aga/ray-english && git add -A && git commit -m "chore: delete IELTS pages, features, tests and brand asset (~160 files)"
```

### Task 13: Bundle purge gate

- [ ] **Step 1: Production build with the live backend URL**

```bash
cd /Users/aga/ray-english/frontend
REACT_APP_BACKEND_URL=https://api.testmaster.pro yarn build
```

- [ ] **Step 2: Hard greps (must be zero)**

```bash
grep -rl "ielts-ace-logo" build/ || echo OK-logo
grep -rl "Switch to the IELTS path" build/ || echo OK-switch
grep -rl "Meet Liz" build/ || echo OK-meetliz
```

Expected: three OK lines. `Meet Liz` may still match if a locale key besides `onbStepName5` carries it (e.g. `landingV2HowLizTag`) — those keys' pages are deleted, so if it matches, delete the dead locale keys (`grep -n "Meet Liz" src/locales/*.js`) and rebuild until clean.

- [ ] **Step 3: Soft grep (record, justify)**

```bash
grep -o "IELTS Ace" build/assets/*.js | wc -l
```

Expected: small residue from locale strings for deleted pages is acceptable (never rendered — no surviving component reads those keys). Record the count in the task summary. If the count is large (>50), do a locale dead-key pass on the worst offenders.

- [ ] **Step 4: Commit anything changed**

```bash
cd /Users/aga/ray-english && git add -A && git diff --cached --quiet || git commit -m "chore: purge dead IELTS locale strings flagged by bundle gate"
```

### Task 14: Provision the `ray-english` Railway backend

**Goal:** GE gets its own backend service; `testmaster.pr` becomes rollback-only.

- [ ] **Step 1: Read the old service's env vars (READ-ONLY contact)**

```bash
mkdir -p /tmp/railway-peek && cd /tmp/railway-peek
railway link   # interactive: choose project "sublime-celebration", service "testmaster.pr"
railway variables --json > /Users/aga/.secrets/testmaster-pr-vars.json
chmod 600 /Users/aga/.secrets/testmaster-pr-vars.json
cd / && rm -rf /tmp/railway-peek   # unlink dir so no future `railway up` can target it
```

Expected: JSON with at least `MONGO_URL`, `DB_NAME`, `CORS_ORIGINS`, `STATIC_BASE_URL`. ⚠️ Do NOT run any other railway command while linked to testmaster.pr.

- [ ] **Step 2: Create the new Railway project from `backend/`**

```bash
cd /Users/aga/ray-english/backend
railway init --name ray-english   # creates a NEW project; confirm prompt shows "ray-english"
railway status                    # MUST print project: ray-english (not sublime-celebration)
```

- [ ] **Step 3: Set env vars on the new service**

From the saved JSON, set each needed var (values from the file — never paste into the plan/commits):

```bash
railway variables --set "MONGO_URL=<from json>" --set "DB_NAME=<from json>" \
  --set "STATIC_BASE_URL=<from json>" \
  --set "CORS_ORIGINS=https://ge.testmaster.pro,https://ge-testmaster.pages.dev"
```

Also copy any AI/eval keys present in the JSON that `server.py`/`bootstrap.py` read (`EMERGENT_LLM_KEY`, `OPENAI_API_KEY`, `UNIFIED_SPEAKING_EVAL_ENABLED`, …) — existing product config, not new paid-API usage.

- [ ] **Step 4: Deploy + generate domain**

```bash
railway status && railway up --detach   # SAFE: linked to ray-english (verified in Step 2)
railway domain                          # generate <something>.up.railway.app; record it as RAY_API
```

Watch build logs (`railway logs --build`) until the Dockerfile build passes healthcheck `/api/health`.

- [ ] **Step 5: Smoke the new backend**

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://$RAY_API/api/health          # expect 200
curl -s -o /dev/null -w "%{http_code}\n" https://$RAY_API/api/unified/stages  # expect 200 or 401 — NOT 404 (route exists)
```

If `/api/unified/stages` returns 404, the repo backend has drifted from the snapshot — STOP, report, do not switch the frontend (rollback stance: frontend keeps api.testmaster.pro).

- [ ] **Step 6: Document the deploy target**

Append to `backend/README.md`: the actual Railway project id + generated domain. Commit:

```bash
cd /Users/aga/ray-english && git add backend/README.md && git commit -m "docs: ray-english Railway project + domain"
```

### Task 15: Point the frontend at the new backend

- [ ] **Step 1: Rebuild with the new URL**

```bash
cd /Users/aga/ray-english/frontend
REACT_APP_BACKEND_URL=https://$RAY_API yarn build
```

- [ ] **Step 2: Confirm the bundle calls the new backend and gate greps still pass**

```bash
grep -rl "api.testmaster.pro" build/assets/ || echo OK-old-url-gone
grep -rl "$RAY_API" build/assets/ && echo OK-new-url-present
grep -rl "ielts-ace-logo" build/ || echo OK-logo
```

Expected: three OK lines. (If any doc/config string still mentions api.testmaster.pro in the bundle, find the hardcoded site — `grep -rn "api.testmaster.pro" src/` — and route it through `process.env.REACT_APP_BACKEND_URL`.)

- [ ] **Step 3: Commit any changes**

```bash
cd /Users/aga/ray-english && git add -A && git diff --cached --quiet || git commit -m "fix: route all backend URLs through REACT_APP_BACKEND_URL"
```

### Task 16: Push to private GitHub `agadurdy-art/ray-english`

- [ ] **Step 1: Create + push**

```bash
cd /Users/aga/ray-english
gh repo create agadurdy-art/ray-english --private --source . --push
```

- [ ] **Step 2: Verify remote matches local**

```bash
git ls-remote origin main | awk '{print $1}'
git rev-parse main
```

Expected: identical SHAs. (Deploy claims only after this check — standing rule.)

### Task 17: Deploy to CF Pages `ge-testmaster` + cache purge

- [ ] **Step 1: Deploy the Task-15 build (new backend URL baked in)**

```bash
cd /Users/aga/ray-english/frontend
npx wrangler pages deploy build --project-name ge-testmaster
```

Expected: deployment URL printed; project already has ge.testmaster.pro attached (no domain work in F1).

- [ ] **Step 2: Targeted cache purge (stale-shell landmine)**

```bash
TOKEN=$(cat ~/.secrets/cf-testmaster-zone.token)
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/f2ac50418c78f9b42e622971f7a7d05c/purge_cache" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  --data '{"files":["https://ge.testmaster.pro/","https://ge.testmaster.pro/index.html","https://ge.testmaster.pro/brand/ray-english-logo.png"]}'
```

Expected: `"success":true`.

- [ ] **Step 3: Served-HTML smoke**

```bash
curl -s https://ge.testmaster.pro/ -H 'Cache-Control: no-cache' | grep -o "<title>[^<]*</title>"
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" https://ge.testmaster.pro/
```

Expected: title contains `Ray English`; root serves the app (SPA `_redirects` 302 → `/landing/ge` acceptable at either HTTP or router level). Also confirm noindex still on: `curl -sI https://ge.testmaster.pro/ | grep -i x-robots-tag` → `noindex, nofollow`.

### Task 18: Live E2E + IELTS-absence + design-review

- [ ] **Step 1: IELTS routes are gone (live)**

Open in browser (chrome-devtools/playwright MCP) and confirm each renders the 404 page or redirects to a GE surface — never an IELTS surface: `/dashboard`, `/liz`, `/courses`, `/question-bank`, `/full-test`, `/vocabulary`, `/grammar`, `/tips`, `/pricing` (→ `/pricing/ge`), `/landing/v2`, `/score-my-essay`.

- [ ] **Step 2: Fresh-signup GE flow (live)**

Sign up `uatest-ray-0724@testmaster.pro` (password `UatRay#2026x`, deletable). Verify: login page shows **Ray English** brand + ray logo → onboarding starts at the **language** step (no path/band steps, no Back button, step label "Meet Ray") → lands on `/ge/dashboard` (8 stages) → Lesson 1 opens with content → `/ge/placement-test` loads Q1 → `/pricing/ge` renders. Also log in with the existing `uatest-ge-0722@testmaster.pro` (`UatGe#2026x`) → must land on `/ge/dashboard`. **In the browser Network tab confirm every `/api/*` call goes to the `ray-english` Railway domain (not api.testmaster.pro) and succeeds** — this is the backend-parity gate. If GE flows fail against the new backend, rollback: rebuild frontend with `REACT_APP_BACKEND_URL=https://api.testmaster.pro`, redeploy, report the drift.

- [ ] **Step 3: Shell checks**

Desktop ≥1280: left rail shows the GE groups (Dashboard/Course map/Daily habit/Speaking/Games/Ray/Placement/Pricing) with Ray English lockup. Mobile 390px: bottom nav shows Home/Review/Ray/Stages/Profile with Ray avatar center tab.

- [ ] **Step 4: design-review pass (mandatory gate)**

Invoke the `design-review` skill on the changed surfaces: login page, onboarding (language + Meet Ray steps), GE side rail, desktop + mobile screenshots. Fix violations, redeploy (repeat Task 17 steps), re-verify.

- [ ] **Step 5: Final commit + push**

```bash
cd /Users/aga/ray-english && git add -A && git diff --cached --quiet || git commit -m "fix: design-review follow-ups from live E2E"
git push origin main
git ls-remote origin main | awk '{print $1}'; git rev-parse main
```

Expected: SHAs match. F1 done — report to Aga; F2 (stemhouse → CF Workers) gets its own plan next.

---

## Out of scope for this plan (per spec + 2026-07-24 amendment)

- Retiring `testmaster.pr` / api.testmaster.pro (kept as rollback; Aga decides later).
- Custom domain for the new backend (Railway domain is fine for F1; [DECIDE] later).
- noindex removal, ge.stemhousebenluc.com, 301s (F3).
- stemhouse repo changes (F2).
- GE content/pedagogy changes; locale dead-key deep-clean beyond the bundle gate.
