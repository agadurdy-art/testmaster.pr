#!/usr/bin/env python3
"""
Update Advanced Mastery modules with Chris-authored Band 5.5 vs Band 7.5+
grammar pairs.

Replaces the old `band_65_example` / `band_80_example` fields (which leaked a
generic technology fallback string into every lesson) with hand-authored,
lesson-specific pairs from `backend/content/grammar_band_pairs.py`.

Schema written to each module document under `grammar`:
    band_55_example   str
    band_75_example   str
    coach_note        str  (rendered with "— Chris" signature on the client)

Match key: `module_number`. Old fields are unset to avoid stale data
re-appearing if rendering code is rolled back.

Usage:
    python -m backend.scripts.update_grammar_band_pairs
or
    python backend/scripts/update_grammar_band_pairs.py
"""

import asyncio
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

# Allow running both as a module and directly
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

load_dotenv(ROOT / "backend" / ".env")

from backend.content.grammar_band_pairs import GRAMMAR_BAND_PAIRS  # noqa: E402

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "ielts_database")


async def main() -> int:
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    coll = db.advanced_mastery_modules

    matched = 0
    updated = 0
    missing = []

    for pair in GRAMMAR_BAND_PAIRS:
        n = pair["module_number"]
        result = await coll.update_one(
            {"module_number": n},
            {
                "$set": {
                    "grammar.band_55_example": pair["band_55_example"],
                    "grammar.band_75_example": pair["band_75_example"],
                    "grammar.coach_note": pair["coach_note"],
                },
                "$unset": {
                    "grammar.band_65_example": "",
                    "grammar.band_80_example": "",
                },
            },
        )
        matched += result.matched_count
        updated += result.modified_count
        if result.matched_count == 0:
            missing.append(n)
        print(
            f"  module_number={n:2d}  matched={result.matched_count}  "
            f"modified={result.modified_count}"
        )

    print()
    print(f"Done. matched={matched}/{len(GRAMMAR_BAND_PAIRS)}  modified={updated}")
    if missing:
        print(f"  No document for module_number(s): {missing}")
    client.close()
    return 0 if not missing else 1


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
