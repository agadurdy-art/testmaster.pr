"""Split a bulk calibration JSON array into per-id files.

Usage
-----
    python scripts/split_calibration_extracts.py <input.json> [<input2.json> ...]

Input: a JSON array of objects matching `data/speaking_calibration/SCHEMA.md`.

Output:
- Each entry with `expected_band_overall` set is written to
  `data/speaking_calibration/test_set/<id>.json`.
- Entries missing `expected_band_overall` (but with a transcript) are written
  to `data/speaking_calibration/reference_pool/<id>.json`.
- A stdout summary lists counts, skipped entries, and any schema violations.

The splitter is idempotent — re-running with the same input overwrites the
per-id files. To reset, delete the target dirs before running.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from typing import Any, Dict, List, Tuple

ROOT = Path(__file__).resolve().parent.parent
CALIB_DIR = ROOT / "data" / "speaking_calibration"
TEST_SET_DIR = CALIB_DIR / "test_set"
REF_POOL_DIR = CALIB_DIR / "reference_pool"

VALID_PARTS = {"part1", "part2", "part3"}
VALID_CRITERIA = ("fc", "lr", "gra", "pr")
ID_RE = re.compile(r"^[A-Za-z0-9_\-]+$")


def _is_half_step(value: Any) -> bool:
    if not isinstance(value, (int, float)):
        return False
    if value < 4.0 or value > 9.0:
        return False
    return abs((float(value) * 2) - round(float(value) * 2)) < 1e-6


def validate_entry(entry: Dict[str, Any]) -> Tuple[List[str], bool]:
    """Return (errors, has_expected_band_overall)."""
    errors: List[str] = []

    sample_id = entry.get("id")
    if not isinstance(sample_id, str) or not ID_RE.match(sample_id or ""):
        errors.append("id missing or contains invalid characters")

    part = entry.get("part")
    if part not in VALID_PARTS:
        errors.append(f"part must be one of {sorted(VALID_PARTS)}, got {part!r}")

    transcript = entry.get("transcript")
    if not isinstance(transcript, str) or not transcript.strip():
        errors.append("transcript missing or empty")

    overall = entry.get("expected_band_overall")
    has_overall = overall is not None
    if has_overall and not _is_half_step(overall):
        errors.append(
            f"expected_band_overall must be 0.5-step in [4.0, 9.0], got {overall!r}"
        )
        has_overall = False

    per_crit = entry.get("expected_per_criterion") or {}
    if per_crit:
        if not isinstance(per_crit, dict):
            errors.append("expected_per_criterion must be an object")
        else:
            for crit in VALID_CRITERIA:
                value = per_crit.get(crit)
                if value is not None and not _is_half_step(value):
                    errors.append(
                        f"expected_per_criterion.{crit} must be 0.5-step in "
                        f"[4.0, 9.0], got {value!r}"
                    )

    duration = entry.get("duration_seconds")
    if duration is not None and (
        not isinstance(duration, (int, float)) or duration < 0
    ):
        errors.append(f"duration_seconds must be a non-negative number, got {duration!r}")

    return errors, has_overall


def split_array(entries: List[Dict[str, Any]]) -> Dict[str, Any]:
    TEST_SET_DIR.mkdir(parents=True, exist_ok=True)
    REF_POOL_DIR.mkdir(parents=True, exist_ok=True)

    summary = {
        "test_set_written": 0,
        "reference_pool_written": 0,
        "skipped": 0,
        "errors": [],
    }

    for index, entry in enumerate(entries):
        if not isinstance(entry, dict):
            summary["errors"].append(f"[{index}] not an object")
            summary["skipped"] += 1
            continue

        errors, has_overall = validate_entry(entry)
        if errors:
            summary["errors"].append(f"[{index}] id={entry.get('id')!r}: {errors}")
            summary["skipped"] += 1
            continue

        target_dir = TEST_SET_DIR if has_overall else REF_POOL_DIR
        out_path = target_dir / f"{entry['id']}.json"
        out_path.write_text(
            json.dumps(entry, ensure_ascii=False, indent=2), encoding="utf-8"
        )
        if has_overall:
            summary["test_set_written"] += 1
        else:
            summary["reference_pool_written"] += 1

    return summary


def main(argv: List[str]) -> int:
    if len(argv) < 2:
        print(__doc__)
        return 2

    overall: Dict[str, Any] = {
        "test_set_written": 0,
        "reference_pool_written": 0,
        "skipped": 0,
        "errors": [],
    }

    for input_path_str in argv[1:]:
        input_path = Path(input_path_str)
        if not input_path.exists():
            print(f"input not found: {input_path}", file=sys.stderr)
            return 1

        try:
            data = json.loads(input_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            print(f"{input_path}: invalid JSON — {exc}", file=sys.stderr)
            return 1

        if not isinstance(data, list):
            print(f"{input_path}: expected JSON array at top level", file=sys.stderr)
            return 1

        result = split_array(data)
        print(
            f"{input_path.name}: "
            f"test_set+={result['test_set_written']} "
            f"reference_pool+={result['reference_pool_written']} "
            f"skipped={result['skipped']}"
        )
        for line in result["errors"]:
            print(f"  ! {line}")

        overall["test_set_written"] += result["test_set_written"]
        overall["reference_pool_written"] += result["reference_pool_written"]
        overall["skipped"] += result["skipped"]
        overall["errors"].extend(result["errors"])

    print()
    print(f"TOTAL test_set: {overall['test_set_written']}")
    print(f"TOTAL reference_pool: {overall['reference_pool_written']}")
    print(f"TOTAL skipped: {overall['skipped']}")
    if overall["errors"]:
        print(f"({len(overall['errors'])} validation issues — see above)")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
