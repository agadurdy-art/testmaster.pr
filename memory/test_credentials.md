# Test Credentials
- Email: tester@test.com
- Password: tester123
- Name: Tester
- User ID: 447962cd-2aa6-472f-ab42-89e73197d77c
- learning_mode: ielts (post-migration 2026-04-22)

## Admin Accounts
- Email: aga.durdy@gmail.com (master plan, learning_mode=ielts post-migration)
- Email: admin@ieltsace.com (master plan)
- Email: stemhousebenluc@gmail.com (master plan)

## Post-migration note (2026-04-22)
Running `backend/scripts/migrate_users_to_ielts_mode.py` flipped all 3 existing users to `learning_mode="ielts"`.
New users picking "General English" during onboarding still get `learning_mode="general_english"` (unchanged flow).
