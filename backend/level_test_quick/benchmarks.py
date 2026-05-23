"""
Loader + comparison helpers for Cambridge research benchmarks.

The numbers in cambridge_benchmarks.json are public Cambridge English
Profile / Cambridge Assessment IELTS research / Council of Europe CEFR
data — every comparison string surfaced to the user must be attributable
to a real published source (no invented stats).
"""
from __future__ import annotations
import json
from pathlib import Path


_BENCHMARKS_PATH = Path(__file__).parent / "content" / "cambridge_benchmarks.json"
_BENCHMARKS = None


def _load() -> dict:
    global _BENCHMARKS
    if _BENCHMARKS is None:
        with _BENCHMARKS_PATH.open("r", encoding="utf-8") as f:
            _BENCHMARKS = json.load(f)
    return _BENCHMARKS


def _band_str(band: float) -> str:
    """Return the closest band-key string available in the benchmark table."""
    # Round to nearest 0.5 then format like '6.0', '6.5'
    rounded = round(band * 2) / 2
    return f"{rounded:.1f}"


def compare_to_cambridge(skill_band: float, metrics: dict, skill: str) -> list[dict]:
    """
    Build a list of Cambridge-attributable comparison strings for the
    results page.

    Each item:
        { "label": str, "expected": str, "actual": str, "verdict": "above"|"on"|"below" }

    Args:
        skill_band: the user's computed band for this skill
        metrics: the per-skill metrics dict returned by the heuristic scorer
        skill: 'writing' | 'speaking' | 'reading' | 'listening'
    """
    bm = _load()
    comparisons: list[dict] = []

    target_key = _band_str(skill_band)

    if skill == "writing":
        wt = bm.get("writing_task2", {})

        # Word count
        by_band = wt.get("by_band", {})
        expected_words = by_band.get(target_key, {}).get("typical_word_count_micro_5min")
        actual_words = metrics.get("word_count")
        if expected_words and actual_words:
            verdict = (
                "above" if actual_words > expected_words * 1.1 else
                "below" if actual_words < expected_words * 0.9 else "on"
            )
            comparisons.append({
                "label": f"Word count for a 5-min micro task",
                "expected": f"{expected_words}w (Cambridge band-{target_key} avg)",
                "actual": f"{actual_words}w",
                "verdict": verdict,
                "source": "Cambridge Assessment IELTS research",
            })

        # Cohesion markers
        cohesion_table = wt.get("cohesion_markers_distinct", {})
        expected_cohesion = cohesion_table.get(target_key)
        actual_cohesion = metrics.get("cohesion_markers")
        if expected_cohesion is not None and actual_cohesion is not None:
            verdict = (
                "above" if actual_cohesion > expected_cohesion else
                "below" if actual_cohesion < expected_cohesion - 1 else "on"
            )
            comparisons.append({
                "label": "Distinct cohesive devices used",
                "expected": f"{expected_cohesion} (Cambridge band-{target_key})",
                "actual": str(actual_cohesion),
                "verdict": verdict,
                "source": "Cambridge English Profile",
            })

        # Type-token ratio
        ttr_table = wt.get("type_token_ratio", {})
        expected_ttr = ttr_table.get(target_key)
        actual_ttr = metrics.get("type_token_ratio")
        if expected_ttr and actual_ttr:
            verdict = (
                "above" if actual_ttr > expected_ttr + 0.03 else
                "below" if actual_ttr < expected_ttr - 0.03 else "on"
            )
            comparisons.append({
                "label": "Vocabulary diversity (type-token ratio)",
                "expected": f"{expected_ttr:.2f} (band-{target_key} avg)",
                "actual": f"{actual_ttr:.2f}",
                "verdict": verdict,
                "source": "Cambridge English Profile",
            })

    elif skill == "speaking":
        sp = bm.get("speaking", {})

        # WPM
        expected_wpm = sp.get("wpm_by_band", {}).get(target_key)
        actual_wpm = metrics.get("wpm")
        if expected_wpm and actual_wpm:
            verdict = (
                "above" if actual_wpm > expected_wpm + 10 else
                "below" if actual_wpm < expected_wpm - 10 else "on"
            )
            comparisons.append({
                "label": "Speaking pace",
                "expected": f"{expected_wpm} WPM (band-{target_key} avg)",
                "actual": f"{actual_wpm:.0f} WPM",
                "verdict": verdict,
                "source": "Cambridge English Speak Out research",
            })

        # Filler ratio
        expected_filler = sp.get("filler_ratio_by_band", {}).get(target_key)
        actual_filler = metrics.get("filler_ratio")
        if expected_filler is not None and actual_filler is not None:
            verdict = (
                "above" if actual_filler > expected_filler + 0.02 else
                "below" if actual_filler < expected_filler - 0.02 else "on"
            )
            # "below" filler ratio is actually GOOD — flip the verdict for UX
            verdict_user = {"below": "above", "above": "below", "on": "on"}.get(verdict, "on")
            comparisons.append({
                "label": "Filler word ratio (lower is better)",
                "expected": f"{expected_filler*100:.0f}% (band-{target_key} avg)",
                "actual": f"{actual_filler*100:.1f}%",
                "verdict": verdict_user,
                "source": "Cambridge English Speak Out research",
            })

    return comparisons


def exam_date_milestones(current_band: float, target_band: float, exam_date_iso: str | None) -> list[dict]:
    """
    Build a list of date-stamped milestone targets.
    If exam_date is missing, milestones use "from today" framing.
    """
    from datetime import date, timedelta
    today = date.today()

    if exam_date_iso:
        try:
            exam = date.fromisoformat(exam_date_iso)
            weeks_remaining = max(1, (exam - today).days // 7)
        except (ValueError, TypeError):
            exam = None
            weeks_remaining = 12
    else:
        exam = None
        weeks_remaining = 12

    if current_band is None or target_band is None:
        return []

    gap = target_band - current_band
    if gap <= 0:
        return [{
            "label": "Maintain",
            "date": exam.isoformat() if exam else None,
            "target_band": target_band,
            "note": "You're already at or above your target. Focus on consistency.",
        }]

    # Three checkpoints: 1/3, 2/3, 3/3 of the way
    milestones = []
    for i in (1, 2, 3):
        chk_weeks = weeks_remaining * i // 3
        chk_date = (today + timedelta(weeks=chk_weeks)) if chk_weeks > 0 else today
        chk_band = round((current_band + gap * (i / 3)) * 2) / 2
        milestones.append({
            "label": f"Week {chk_weeks}" if chk_weeks > 0 else "Today",
            "date": chk_date.isoformat(),
            "target_band": chk_band,
            "is_exam_day": exam is not None and chk_date >= exam,
        })

    return milestones
