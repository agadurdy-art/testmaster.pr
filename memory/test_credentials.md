# Test Credentials

## Tester Account (Persistent)
- **Email:** geldiaga67@gmail.com
- **Password:** geldiaga67
- **Purpose:** Primary tester account. Keep registered across all forks.
- **User ID:** 104ba26f-2d37-436b-8fac-fda0de803098 (current DB id)
- **Plan:** `free` (default).
  IELTS plans available for upgrade testing: `weekly` / `monthly` / `exam`.
  `master`, `learner`, `achiever`, `explorer` are LEGACY General-English (GE) plans only — DO NOT use them on IELTS-side test flows.
- **Last password re-seed:** 2026-02 (fork iteration_75 fix)

## Notes
- This account should be used for all future testing
- If the DB is reset, re-register with the same credentials
- To upgrade plan for premium-gated tests:
  ```python
  db.users.update_one({"email":"geldiaga67@gmail.com"}, {"$set":{"plan":"monthly"}})
  ```
  (Restore to `free` after testing.)
