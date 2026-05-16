#!/usr/bin/env python3
"""
Migrate enriched content (backend/content/enriched/*.json) into the
unified_units + unified_lessons MongoDB collections.

Each JSON file under content/enriched/ holds ONE unit (with 4 lessons
inside) for either Stage 1 (Foundations) or Stage 2 (Starters).
The new "unified" routes read from unified_units and unified_lessons,
but the original migration to Atlas only seeded stage metadata — the
actual unit/lesson content (12 + 12 units, 96 lessons total) never
got copied across.

This script idempotently restores that content. Safe to re-run: each
unit/lesson is upserted by unit_id / lesson_id. Stage metadata
(total_units, total_lessons) is recomputed at the end so the frontend
shows correct counts.

Usage (locally with backend/.env loaded):
    python backend/scripts/migrate_enriched_to_unified.py
    python backend/scripts/migrate_enriched_to_unified.py --dry-run

In production we expose the same routine over an admin endpoint:
    POST /api/admin/migrate/enriched?admin_email=<allowlisted>
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional

from motor.motor_asyncio import AsyncIOMotorClient

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format="%(message)s")

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
CONTENT_DIR = REPO_ROOT / "backend" / "content" / "enriched"

# Stage number → unified_stages.stage_id used by seed_unified_learning.py
STAGE_ID_MAP = {
    1: "stage_1_foundations",
    2: "stage_2_starters",
}


def _load_units_from_disk() -> List[Dict[str, Any]]:
    """Read every enriched/*.json file and return a flat list of units.

    Stage number comes from the filename (`stage1_unit01_*.json`,
    `stage2_*`), not the JSON body — body's `stage` field is inconsistent
    across the dump (some files have `1`/`2` ints, others have the
    string `"stage_1"`).
    """
    import re

    if not CONTENT_DIR.exists():
        raise FileNotFoundError(f"Content dir not found: {CONTENT_DIR}")

    fname_pat = re.compile(r"^stage(\d+)_unit\d+_enriched\.json$")
    units: List[Dict[str, Any]] = []
    for json_file in sorted(CONTENT_DIR.glob("stage*_unit*_enriched.json")):
        m = fname_pat.match(json_file.name)
        if not m:
            logger.warning("Skipping %s: filename doesn't match pattern", json_file.name)
            continue
        stage_num = int(m.group(1))
        stage_id = STAGE_ID_MAP.get(stage_num)
        if not stage_id:
            logger.warning("Skipping %s: stage %d not in STAGE_ID_MAP", json_file.name, stage_num)
            continue
        with json_file.open("r", encoding="utf-8") as f:
            data = json.load(f)
        for unit in data.get("units", []):
            unit["__stage_id"] = stage_id
            unit["__source_file"] = json_file.name
            units.append(unit)
    return units


def _build_unit_doc(unit: Dict[str, Any]) -> Dict[str, Any]:
    """Translate the on-disk unit shape into a unified_units document."""
    return {
        "stage_id": unit["__stage_id"],
        "unit_id": unit["unit_id"],
        "unit_number": unit.get("unit_num"),
        "title": unit.get("title"),
        "subtitle": unit.get("subtitle"),
        "phonics_focus": unit.get("phonics_focus"),
        "grammar_focus": unit.get("grammar_focus"),
        "total_lessons": len(unit.get("lessons", [])),
        # Carry the original payload too — useful if the UI ever wants
        # to render unit-level metadata we don't model explicitly yet.
        "source_file": unit["__source_file"],
    }


def _build_lesson_doc(lesson: Dict[str, Any], unit: Dict[str, Any]) -> Dict[str, Any]:
    """Translate one on-disk lesson into a unified_lessons document."""
    return {
        "stage_id": unit["__stage_id"],
        "unit_id": unit["unit_id"],
        "lesson_id": lesson["lesson_id"],
        "lesson_number": lesson.get("lesson_num") or lesson.get("number"),
        "title": lesson.get("title"),
        "topic": lesson.get("topic"),
        "steps": lesson.get("steps", []),
        "extra_links": lesson.get("extra_links", []),
    }


async def run_migration(db, dry_run: bool = False) -> Dict[str, Any]:
    """Idempotent migration. Returns a summary dict for the API caller."""
    units = _load_units_from_disk()
    logger.info("Loaded %d unit files from disk.", len(units))

    unit_count = 0
    lesson_count = 0
    by_stage: Dict[str, Dict[str, int]] = {}

    for unit in units:
        stage_id = unit["__stage_id"]
        by_stage.setdefault(stage_id, {"units": 0, "lessons": 0})

        unit_doc = _build_unit_doc(unit)
        unit_id = unit_doc["unit_id"]

        if not dry_run:
            await db.unified_units.replace_one(
                {"unit_id": unit_id},
                unit_doc,
                upsert=True,
            )
        unit_count += 1
        by_stage[stage_id]["units"] += 1

        for lesson in unit.get("lessons", []):
            lesson_doc = _build_lesson_doc(lesson, unit)
            lesson_id = lesson_doc["lesson_id"]
            if not dry_run:
                await db.unified_lessons.replace_one(
                    {"lesson_id": lesson_id},
                    lesson_doc,
                    upsert=True,
                )
            lesson_count += 1
            by_stage[stage_id]["lessons"] += 1

    # Recompute stage totals so the frontend sees correct unit/lesson
    # counts (the old metadata claimed 12/48 even when 0 existed).
    if not dry_run:
        for stage_id, counts in by_stage.items():
            await db.unified_stages.update_one(
                {"stage_id": stage_id},
                {"$set": {
                    "total_units": counts["units"],
                    "total_lessons": counts["lessons"],
                }},
            )

    summary = {
        "dry_run": dry_run,
        "total_units": unit_count,
        "total_lessons": lesson_count,
        "by_stage": by_stage,
        "content_dir": str(CONTENT_DIR),
    }
    logger.info("Migration summary: %s", json.dumps(summary, indent=2))
    return summary


async def _cli_main(dry_run: bool) -> None:
    mongo_url = os.environ.get("MONGO_URL")
    db_name = os.environ.get("DB_NAME", "ielts_ace")
    if not mongo_url:
        # Fall back to backend/.env so the script works locally without
        # `set -a; source backend/.env`.
        env_path = REPO_ROOT / "backend" / ".env"
        if env_path.exists():
            for line in env_path.read_text().splitlines():
                if line.startswith("MONGO_URL="):
                    mongo_url = line.split("=", 1)[1].strip().strip('"').strip("'")
                if line.startswith("DB_NAME="):
                    db_name = line.split("=", 1)[1].strip().strip('"').strip("'")
    if not mongo_url:
        logger.error("MONGO_URL not set. Aborting.")
        sys.exit(1)

    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    try:
        await run_migration(db, dry_run=dry_run)
    finally:
        client.close()


if __name__ == "__main__":
    asyncio.run(_cli_main(dry_run="--dry-run" in sys.argv))
