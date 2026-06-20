# Frontend cleanup note — 2026-06-20

Audit baseline: commit `46029970e8862ea63a1fe2257b67bb0dee2115fd`.

## Confirmed findings

- 49 production frontend files are unreachable from the `frontend/src/index.js`
  import graph.
- 36 of these are unused `components/ui/*` primitives. Keep these as a separate
  cleanup decision because they may be retained intentionally for future UI work.
- The remaining 13 files are higher-confidence cleanup candidates:
  - 6 ordinary components
  - 1 feature component
  - 3 hooks
  - 3 library helpers
- `/daily-practice`, linked from `RayTeacher.js`, is a confirmed user-facing dead
  route. It should be redirected to the intended active route, likely
  `/unified/daily-habit`, rather than merely removed.
- The crawler inventory contains three stale routes:
  - `/blog`
  - `/vocab-grammar`
  - `/vocab-grammar/quiz`

## Expected impact

Removing unreachable files mainly improves repository clarity, maintenance, and
auditability. It should have negligible production bundle or runtime performance
impact because unreachable modules are not included in the active bundle.

## Safe execution order

1. Fix the `/daily-practice` destination.
2. Remove the 13 high-confidence candidates in a dedicated commit.
3. Run frontend build, tests, and route smoke tests.
4. Review the 36 unused UI primitives separately.
5. Synchronize `e2e/routes.js` with `frontend/src/App.js`.
