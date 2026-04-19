// =============================================================================
// Route inventory for the crawler.
//
// Source of truth: frontend/src/App.js <Routes>.
// Keep this list in sync whenever routes are added/removed.
//
// Each entry:
//   path        — URL to visit (must be fully-qualified relative URL)
//   label       — human-readable name for the report
//   auth        — "free" (default), "paid", "admin", "public"
//   skip        — reason string if the route should be skipped (flow-only pages,
//                 destructive actions, payment sandboxes, etc.)
//   note        — freeform hint for the reviewer
// =============================================================================

module.exports = [
  // ---------- Public / marketing ----------
  { path: "/",                           label: "Root (redirect/landing)",       auth: "public" },
  { path: "/landing/v1",                 label: "Landing V1",                    auth: "public" },
  { path: "/landing/v2",                 label: "Landing V2 (current)",          auth: "public" },
  { path: "/pricing",                    label: "Pricing",                       auth: "public" },
  { path: "/pricing/v1",                 label: "Pricing V1",                    auth: "public" },
  { path: "/pricing/v2",                 label: "Pricing V2",                    auth: "public" },
  { path: "/privacy",                    label: "Privacy policy",                auth: "public" },
  { path: "/terms",                      label: "Terms of service",              auth: "public" },
  { path: "/contact",                    label: "Contact",                       auth: "public" },
  { path: "/blog",                       label: "Blog",                          auth: "public" },
  { path: "/about",                      label: "About",                         auth: "public" },
  { path: "/status",                     label: "Status",                        auth: "public" },
  { path: "/login",                      label: "Login",                         auth: "public" },
  { path: "/signup",                     label: "Signup",                        auth: "public" },
  { path: "/samples/writing/band-6-5-task2", label: "Sample: Band 6.5 Task 2",    auth: "public" },
  { path: "/samples/writing/band-5-0-task2", label: "Sample: Band 5 Task 2",      auth: "public" },
  { path: "/samples/writing/band-8-0-task2", label: "Sample: Band 8 Task 2",      auth: "public" },
  { path: "/404-does-not-exist",         label: "404 catch-all",                 auth: "public", note: "should render NotFoundPage" },

  // ---------- Auth-gated: core ----------
  { path: "/dashboard",                  label: "Dashboard",                     auth: "free" },
  { path: "/dashboard/v2",               label: "Dashboard V2",                  auth: "free" },
  { path: "/onboarding",                 label: "Onboarding",                    auth: "free" },
  { path: "/onboarding/v2",              label: "Onboarding V2",                 auth: "free" },
  { path: "/profile",                    label: "Profile",                       auth: "free" },
  { path: "/progress",                   label: "Progress",                      auth: "free" },
  { path: "/focus-plan",                 label: "Focus plan",                    auth: "free" },

  // ---------- Learning platform ----------
  { path: "/learning",                   label: "Learning hub",                  auth: "free" },
  { path: "/courses",                    label: "Courses list",                  auth: "free" },
  { path: "/beginner-course",            label: "Beginner course",               auth: "free" },
  { path: "/mastery-course",             label: "Mastery course",                auth: "free" },
  { path: "/advanced-mastery",           label: "Advanced mastery",              auth: "paid", note: "expected paywall for tester@test.com" },
  { path: "/learning-tools",             label: "Learning tools",                auth: "free" },
  { path: "/vocab-grammar",              label: "Vocab + Grammar hub",           auth: "free" },
  { path: "/vocab-grammar/quiz",         label: "Vocab+Grammar quiz",            auth: "free" },

  // ---------- Tests ----------
  { path: "/level-test",                 label: "Level test",                    auth: "free" },
  { path: "/comprehensive-level-test",   label: "Comprehensive level test",      auth: "free" },
  { path: "/full-test",                  label: "Full test hub",                 auth: "free" },
  { path: "/test/reading",               label: "Test: reading",                 auth: "free" },
  { path: "/test/listening",             label: "Test: listening",               auth: "free" },
  { path: "/test/writing",               label: "Test: writing",                 auth: "free" },
  { path: "/test/speaking",              label: "Test: speaking",                auth: "free" },

  // ---------- Question bank ----------
  { path: "/question-bank",              label: "Question bank hub",             auth: "free" },
  { path: "/question-bank/practice",     label: "QB practice",                   auth: "free" },
  { path: "/question-bank/reading/practice", label: "QB reading practice",       auth: "free" },
  { path: "/question-bank/reading/academic", label: "QB reading academic",       auth: "free" },
  { path: "/question-bank/reading/general",  label: "QB reading general",        auth: "free" },
  { path: "/question-bank/reading/mastery/academic", label: "QB reading mastery academic", auth: "paid" },
  { path: "/question-bank/reading/mastery/general",  label: "QB reading mastery general",  auth: "paid" },
  { path: "/question-bank/listening",    label: "QB listening",                  auth: "free" },
  { path: "/question-bank/speaking",     label: "QB speaking",                   auth: "free" },
  { path: "/question-bank/writing/task1",        label: "QB writing task 1",     auth: "free" },
  { path: "/question-bank/writing/task2",        label: "QB writing task 2",     auth: "free" },
  { path: "/question-bank/writing/general/task1", label: "QB writing GT task 1", auth: "free" },
  { path: "/question-bank/writing/general/task2", label: "QB writing GT task 2", auth: "free" },

  // ---------- Unified / habit ----------
  { path: "/unified",                    label: "Unified hub",                   auth: "free" },
  { path: "/unified/daily-habit",        label: "Unified daily habit",           auth: "free" },
  { path: "/unified/stage/stage_1_foundations", label: "Unified stage 1",        auth: "free" },

  // ---------- Misc ----------
  { path: "/game-bank",                  label: "Game bank",                     auth: "free" },
  { path: "/review-bank",                label: "Review bank",                   auth: "free" },
  { path: "/writing-practice",           label: "Writing practice",              auth: "free" },
  { path: "/quick-practice",             label: "Quick practice",                auth: "free" },
  { path: "/liz",                        label: "Liz AI",                        auth: "free" },

  // ---------- Admin (tester is NOT admin; expect redirect/paywall) ----------
  { path: "/admin",                      label: "Admin dashboard",               auth: "admin", note: "expected redirect for non-admin" },
  { path: "/admin/users",                label: "Admin users",                   auth: "admin" },
  { path: "/admin/feedback",             label: "Admin feedback",                auth: "admin" },
  { path: "/admin/credits",              label: "Admin credits",                 auth: "admin" },
  { path: "/admin/liz-analytics",        label: "Admin Liz analytics",           auth: "admin" },
  { path: "/admin/onboarding-analytics", label: "Admin onboarding analytics",    auth: "admin" },
  { path: "/admin/learning-mode",        label: "Admin learning mode",           auth: "admin" },
  { path: "/admin/testimonials",         label: "Admin testimonials",            auth: "admin" },
  { path: "/admin/content",              label: "Admin content",                 auth: "admin" },
  { path: "/admin/visual-generator",     label: "Admin visual generator",        auth: "admin" },
  { path: "/admin/vocabulary-images",    label: "Admin vocabulary images",       auth: "admin" },

  // ---------- Parametric routes — SKIPPED by default ----------
  // These require real data IDs (modules, lessons, attempts, etc.) which depend
  // on the seeded database. The crawler's Phase 2 (follow-links) will exercise
  // them by clicking into real list items on the hub pages above.
  { path: "/courses/:courseId",                       label: "Course detail",              skip: "parametric" },
  { path: "/learning/level/:levelId",                 label: "Learning level detail",      skip: "parametric" },
  { path: "/learning/unit/:unitId",                   label: "Learning unit detail",       skip: "parametric" },
  { path: "/learning/lesson/:lessonId",               label: "Learning lesson detail",     skip: "parametric" },
  { path: "/unified/stage/:stageId",                  label: "Unified stage detail",       skip: "parametric" },
  { path: "/unified/lesson/:lessonId",                label: "Unified lesson detail",      skip: "parametric" },
  { path: "/vocabulary/learn/:moduleId",              label: "Vocabulary learn",           skip: "parametric" },
  { path: "/vocabulary/practice/:moduleId",           label: "Vocabulary practice",        skip: "parametric" },
  { path: "/vocabulary/quiz/:moduleId",               label: "Vocabulary quiz",            skip: "parametric" },
  { path: "/vocabulary/production/:moduleId",         label: "Vocabulary production",      skip: "parametric" },
  { path: "/grammar/learn/:moduleId",                 label: "Grammar learn",              skip: "parametric" },
  { path: "/grammar/practice/:moduleId",              label: "Grammar practice",           skip: "parametric" },
  { path: "/grammar/quiz/:moduleId",                  label: "Grammar quiz",               skip: "parametric" },
  { path: "/grammar/guided/:moduleId",                label: "Grammar guided",             skip: "parametric" },
  { path: "/grammar/free/:moduleId",                  label: "Grammar free",               skip: "parametric" },
  { path: "/grammar/smart-review/:moduleId",          label: "Grammar smart review",       skip: "parametric" },
  { path: "/cambridge-test/:bookId/:testId",          label: "Cambridge test runner",      skip: "parametric" },
  { path: "/cambridge-test/:bookId/:testId/results",  label: "Cambridge test results",     skip: "parametric" },
  { path: "/full-test/take/:testId",                  label: "Full test runner",           skip: "parametric" },
  { path: "/full-test/results/:sessionId",            label: "Full test results",          skip: "parametric" },
  { path: "/test/:testType",                          label: "Test runner",                skip: "parametric (covered by /test/reading etc. above)" },
  { path: "/results/:attemptId",                      label: "Attempt results",            skip: "parametric" },
  { path: "/checkout/bank/:plan",                     label: "Bank checkout",              skip: "flow with side effect" },
];
