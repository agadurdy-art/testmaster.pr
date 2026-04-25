#!/usr/bin/env python3
"""
One-shot migration: flip every existing user to learning_mode="ielts".

Why (2026-04-22): the Claude Design IELTS dashboard (`DashboardPage.js`) only
renders at /dashboard when `isIeltsMode(user)` returns true. Users whose
learning_mode was missing or set to "general_english" were getting the old
Dashboard.js instead, even though IELTS Ace is the primary product.

This script sets learning_mode="ielts" for ALL existing user docs.
Going forward, new users who explicitly pick "General English" during
onboarding will still get learning_mode="general_english" via the unchanged
/users/{id}/onboarding route — this migration does not affect that flow.

Run on Emergent:
    cd backend && python scripts/migrate_users_to_ielts_mode.py

Idempotent: a second run reports 0 updates.

Safe to run while the app is live — uses a single updateMany with a filter
that excludes already-migrated docs.
"""

import asyncio
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

BACKEND_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BACKEND_DIR / ".env")


async def main() -> int:
    mongo_url = os.environ.get("MONGO_URL")
    if not mongo_url:
        print("ERROR: MONGO_URL not set in environment", file=sys.stderr)
        return 1
    db_name = os.environ.get("DB_NAME", "ielts_database").strip('"')

    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]

    total_users = await db.users.count_documents({})
    already_ielts = await db.users.count_documents({"learning_mode": "ielts"})
    to_migrate = total_users - already_ielts

    print(f"Database: {db_name}")
    print(f"Total users:        {total_users}")
    print(f"Already IELTS mode: {already_ielts}")
    print(f"To migrate:         {to_migrate}")

    if to_migrate == 0:
        print("Nothing to migrate — exiting.")
        return 0

    # Sample a few non-IELTS docs for the audit log before we flip them.
    sample = (
        await db.users.find(
            {"learning_mode": {"$ne": "ielts"}},
            {"_id": 0, "id": 1, "email": 1, "learning_mode": 1},
        )
        .limit(5)
        .to_list(5)
    )
    print("\nSample of users being migrated:")
    for u in sample:
        print(
            f"  - id={u.get('id')!r} email={u.get('email')!r} "
            f"learning_mode={u.get('learning_mode')!r}"
        )

    result = await db.users.update_many(
        {"learning_mode": {"$ne": "ielts"}},
        {"$set": {"learning_mode": "ielts"}},
    )
    print(f"\nUpdated {result.modified_count} user(s) to learning_mode='ielts'.")

    # Post-migration sanity check.
    post_ielts = await db.users.count_documents({"learning_mode": "ielts"})
    post_ge = await db.users.count_documents(
        {"learning_mode": {"$in": ["general_english", "general", "ge"]}}
    )
    post_unset = await db.users.count_documents({"learning_mode": {"$exists": False}})
    print("\nPost-migration counts:")
    print(f"  learning_mode=ielts           : {post_ielts}")
    print(f"  learning_mode=general_english : {post_ge}")
    print(f"  learning_mode unset           : {post_unset}")

    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
