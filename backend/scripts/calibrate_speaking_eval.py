"""Drift testing harness for the Speaking evaluator.

Loads every JSON sample under `data/speaking_calibration/test_set/`, runs each
through the live Sonnet evaluator in transcript-only mode (no Azure), and
compares predicted bands to expected bands. Emits a markdown report into
`data/speaking_calibration/reports/drift_<YYYY_MM_DD>_<seq>.md`.

Usage
-----
    python scripts/calibrate_speaking_eval.py
    python scripts/calibrate_speaking_eval.py --limit 10
    python scripts/calibrate_speaking_eval.py --filter part2
    python scripts/calibrate_speaking_eval.py --concurrency 3

Must-pass thresholds (printed at end with PASS/FAIL):
    - MAE per criterion ≤ 0.5 band
    - 90% of samples within ±0.5 band of expected_band_overall
    - 100% within ±1.0 band (zero outlier-by-2-bands)
    - Conservative bias: false positives (over) < false negatives (under)
"""
from __future__ import annotations

import argparse
import asyncio
import datetime as dt
import json
import statistics
import sys
from collections import Counter
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

# Make backend root importable.
ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

# Load backend .env so liz_llm sees the API keys (Sonnet/Emergent).
from dotenv import load_dotenv  # noqa: E402

load_dotenv(ROOT / ".env")

from schemas.speaking_evaluator import SpeakingEvaluationRequest, SpeakingPart  # noqa: E402
from services.speaking_evaluator import (  # noqa: E402
    _BASIC_AZURE_BLOCK,
    _BASIC_MODE_INSTRUCTION,
    _run_evaluator_llm,
    compute_fluency,
)

CALIB_DIR = ROOT / "data" / "speaking_calibration"
TEST_SET_DIR = CALIB_DIR / "test_set"
REPORTS_DIR = CALIB_DIR / "reports"

CRITERIA = ("fc", "lr", "gra", "pr")
PART_ENUM = {
    "part1": SpeakingPart.part1,
    "part2": SpeakingPart.part2,
    "part3": SpeakingPart.part3,
}


def load_test_set(filter_part: Optional[str], limit: Optional[int]) -> List[Dict[str, Any]]:
    if not TEST_SET_DIR.exists():
        print(f"no test set found at {TEST_SET_DIR}", file=sys.stderr)
        return []

    entries: List[Dict[str, Any]] = []
    for path in sorted(TEST_SET_DIR.glob("*.json")):
        try:
            entries.append(json.loads(path.read_text(encoding="utf-8")))
        except json.JSONDecodeError as exc:
            print(f"skip {path.name} — invalid JSON: {exc}", file=sys.stderr)

    if filter_part:
        entries = [e for e in entries if e.get("part") == filter_part]
    if limit:
        entries = entries[:limit]
    return entries


async def score_one(entry: Dict[str, Any]) -> Dict[str, Any]:
    part_str = entry["part"]
    transcript = entry["transcript"]
    duration = float(entry.get("duration_seconds") or 0.0)
    fluency = compute_fluency(transcript, duration)

    req = SpeakingEvaluationRequest(
        part=PART_ENUM[part_str],
        cue_card_prompt=entry.get("cue_card_prompt") or "",
        cue_card_bullets=entry.get("cue_card_bullets") or [],
        target_band=7.0,
        user_language="en",
        duration_seconds=duration,
    )

    try:
        result = await _run_evaluator_llm(
            req=req,
            transcript=transcript,
            fluency=fluency,
            azure_block=_BASIC_AZURE_BLOCK,
            mode_instruction=_BASIC_MODE_INSTRUCTION,
        )
        return {
            "id": entry["id"],
            "part": part_str,
            "expected_overall": float(entry["expected_band_overall"]),
            "predicted_overall": float(result.scores.overall),
            "expected_per_criterion": entry.get("expected_per_criterion") or {},
            "predicted_per_criterion": {
                "fc": float(result.scores.fc),
                "lr": float(result.scores.lr),
                "gra": float(result.scores.gra),
                "pr": float(result.scores.pr),
            },
            "error": None,
        }
    except Exception as exc:
        return {
            "id": entry["id"],
            "part": part_str,
            "expected_overall": float(entry["expected_band_overall"]),
            "predicted_overall": None,
            "expected_per_criterion": entry.get("expected_per_criterion") or {},
            "predicted_per_criterion": {},
            "error": f"{type(exc).__name__}: {exc}",
        }


async def run_all(entries: List[Dict[str, Any]], concurrency: int) -> List[Dict[str, Any]]:
    semaphore = asyncio.Semaphore(concurrency)

    async def guarded(entry):
        async with semaphore:
            outcome = await score_one(entry)
            tag = "OK" if outcome["error"] is None else "FAIL"
            pred = outcome["predicted_overall"]
            exp = outcome["expected_overall"]
            print(
                f"[{tag}] {entry['id']:<40} expected={exp} predicted={pred} "
                f"{outcome['error'] or ''}"
            )
            return outcome

    return await asyncio.gather(*(guarded(e) for e in entries))


def _delta_band(predicted: float, expected: float) -> float:
    return predicted - expected


def compute_metrics(outcomes: List[Dict[str, Any]]) -> Dict[str, Any]:
    successful = [o for o in outcomes if o["error"] is None]
    failed = [o for o in outcomes if o["error"] is not None]

    overall_deltas = [_delta_band(o["predicted_overall"], o["expected_overall"]) for o in successful]
    abs_deltas = [abs(d) for d in overall_deltas]

    within_half = sum(1 for d in abs_deltas if d <= 0.5)
    within_one = sum(1 for d in abs_deltas if d <= 1.0)
    over_count = sum(1 for d in overall_deltas if d > 0)
    under_count = sum(1 for d in overall_deltas if d < 0)

    per_crit_mae: Dict[str, Optional[float]] = {}
    for crit in CRITERIA:
        crit_deltas = []
        for o in successful:
            exp_val = o["expected_per_criterion"].get(crit)
            pred_val = o["predicted_per_criterion"].get(crit)
            if exp_val is None or pred_val is None:
                continue
            crit_deltas.append(abs(float(pred_val) - float(exp_val)))
        per_crit_mae[crit] = (
            statistics.mean(crit_deltas) if crit_deltas else None
        )

    return {
        "total_attempted": len(outcomes),
        "total_succeeded": len(successful),
        "total_failed": len(failed),
        "overall_mae": statistics.mean(abs_deltas) if abs_deltas else None,
        "overall_max_abs": max(abs_deltas) if abs_deltas else None,
        "within_half_count": within_half,
        "within_half_pct": (
            within_half / len(successful) if successful else 0.0
        ),
        "within_one_count": within_one,
        "within_one_pct": (
            within_one / len(successful) if successful else 0.0
        ),
        "over_count": over_count,
        "under_count": under_count,
        "per_criterion_mae": per_crit_mae,
        "outliers": [
            o for o in successful
            if abs(_delta_band(o["predicted_overall"], o["expected_overall"])) > 0.5
        ],
    }


def evaluate_must_pass(metrics: Dict[str, Any]) -> Tuple[bool, List[Tuple[str, bool, str]]]:
    """Return (overall_pass, [(label, pass, detail)])."""
    rows: List[Tuple[str, bool, str]] = []

    crit_pass = True
    for crit in CRITERIA:
        mae = metrics["per_criterion_mae"][crit]
        if mae is None:
            rows.append((f"per-criterion MAE ({crit})", True, "n/a (no expected_per_criterion)"))
            continue
        ok = mae <= 0.5
        crit_pass = crit_pass and ok
        rows.append((f"per-criterion MAE ({crit}) ≤ 0.5", ok, f"{mae:.3f}"))

    half_pass = metrics["within_half_pct"] >= 0.9 if metrics["total_succeeded"] else False
    rows.append((
        "≥90% within ±0.5 band of expected_overall",
        half_pass,
        f"{metrics['within_half_count']}/{metrics['total_succeeded']} = {metrics['within_half_pct']*100:.1f}%",
    ))

    one_pass = (
        metrics["within_one_pct"] == 1.0 if metrics["total_succeeded"] else False
    )
    rows.append((
        "100% within ±1.0 band of expected_overall",
        one_pass,
        f"{metrics['within_one_count']}/{metrics['total_succeeded']} = {metrics['within_one_pct']*100:.1f}%",
    ))

    over = metrics["over_count"]
    under = metrics["under_count"]
    if over + under == 0:
        bias_pass = True
        bias_detail = "no signed deltas (all predictions match)"
    else:
        bias_pass = over <= under
        bias_detail = f"over={over} under={under}"
    rows.append((
        "conservative bias (over ≤ under)",
        bias_pass,
        bias_detail,
    ))

    overall = all(ok for _, ok, _ in rows)
    return overall, rows


def render_report(
    outcomes: List[Dict[str, Any]],
    metrics: Dict[str, Any],
    must_pass_rows: List[Tuple[str, bool, str]],
    overall_pass: bool,
    started: dt.datetime,
) -> str:
    lines: List[str] = []
    lines.append(f"# Speaking evaluator drift report")
    lines.append("")
    lines.append(f"- Run started: {started.isoformat(timespec='seconds')}")
    lines.append(f"- Samples attempted: {metrics['total_attempted']}")
    lines.append(f"- Samples succeeded: {metrics['total_succeeded']}")
    lines.append(f"- Samples failed:    {metrics['total_failed']}")
    lines.append(f"- Overall verdict:   **{'PASS' if overall_pass else 'FAIL'}**")
    lines.append("")
    lines.append("## Must-pass thresholds")
    lines.append("")
    lines.append("| Check | Result | Detail |")
    lines.append("| --- | --- | --- |")
    for label, ok, detail in must_pass_rows:
        lines.append(f"| {label} | {'PASS' if ok else 'FAIL'} | {detail} |")
    lines.append("")

    if metrics["overall_mae"] is not None:
        lines.append("## Overall band drift")
        lines.append("")
        lines.append(f"- Mean absolute error: {metrics['overall_mae']:.3f}")
        lines.append(f"- Max absolute error:  {metrics['overall_max_abs']:.1f}")
        lines.append(
            f"- Direction: {metrics['over_count']} over / {metrics['under_count']} under"
        )
        lines.append("")

    if metrics["outliers"]:
        lines.append(f"## Outliers (|delta| > 0.5)")
        lines.append("")
        lines.append("| id | part | expected | predicted | delta |")
        lines.append("| --- | --- | --- | --- | --- |")
        for o in sorted(
            metrics["outliers"],
            key=lambda x: abs(_delta_band(x["predicted_overall"], x["expected_overall"])),
            reverse=True,
        ):
            delta = _delta_band(o["predicted_overall"], o["expected_overall"])
            lines.append(
                f"| {o['id']} | {o['part']} | {o['expected_overall']} | "
                f"{o['predicted_overall']} | {delta:+.1f} |"
            )
        lines.append("")
    else:
        lines.append("## Outliers")
        lines.append("")
        lines.append("None — all predictions within ±0.5 band.")
        lines.append("")

    failed = [o for o in outcomes if o["error"] is not None]
    if failed:
        lines.append("## Errors")
        lines.append("")
        for o in failed:
            lines.append(f"- `{o['id']}`: {o['error']}")
        lines.append("")

    by_band: Counter = Counter()
    for o in outcomes:
        if o["error"]:
            continue
        by_band[(o["expected_overall"], o["predicted_overall"])] += 1
    if by_band:
        lines.append("## Confusion (expected → predicted)")
        lines.append("")
        lines.append("| expected | predicted | count |")
        lines.append("| --- | --- | --- |")
        for (exp, pred), count in sorted(by_band.items()):
            lines.append(f"| {exp} | {pred} | {count} |")
        lines.append("")

    return "\n".join(lines)


def next_report_path(today: dt.date) -> Path:
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    stem = f"drift_{today.strftime('%Y_%m_%d')}"
    seq = 1
    while True:
        candidate = REPORTS_DIR / f"{stem}_b{seq}.md"
        if not candidate.exists():
            return candidate
        seq += 1


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=None)
    parser.add_argument(
        "--filter",
        choices=("part1", "part2", "part3"),
        default=None,
        help="restrict to one part",
    )
    parser.add_argument("--concurrency", type=int, default=2)
    args = parser.parse_args()

    entries = load_test_set(args.filter, args.limit)
    if not entries:
        print("test set is empty — drop validated samples into "
              f"{TEST_SET_DIR} and rerun.")
        return 1

    print(f"running drift on {len(entries)} samples (concurrency={args.concurrency})")
    started = dt.datetime.now()
    outcomes = asyncio.run(run_all(entries, args.concurrency))
    metrics = compute_metrics(outcomes)
    overall_pass, must_pass_rows = evaluate_must_pass(metrics)

    report_text = render_report(outcomes, metrics, must_pass_rows, overall_pass, started)
    report_path = next_report_path(started.date())
    report_path.write_text(report_text, encoding="utf-8")

    print()
    print(report_text)
    print()
    print(f"report written to {report_path}")
    return 0 if overall_pass else 2


if __name__ == "__main__":
    sys.exit(main())
