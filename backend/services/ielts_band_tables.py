"""
Official IELTS raw-score → band tables.

Why this module exists
----------------------
Reading and Listening band scores are NOT linear functions of percentage. The
official Cambridge tables map a 40-question raw score to a half-band, and the
breakpoints are NOT equal-width buckets. Earlier code in `cambridge.py`,
`listening_qb.py`, and `reading_qb.py` each carried its own
`calculate_band_from_percentage` / `calculate_listening_band` /
`_fallback_reading_band` — all percentage-based and all wrong by ~one full band
in the 22-29 raw range (e.g. 26/40 Academic Reading was emitting 7.0 instead
of 6.0).

This module is the single source of truth. Call the `band_for_*_raw()`
functions when the test has 40 questions (Cambridge full tests). Use the
`band_for_*_pct()` helpers for non-40-question sets — they project the
percentage onto the nearest 40-question equivalent and look up the table.

Sources: Cambridge IELTS 17/18 candidate guidance + IDP/British Council
public band conversion tables. Tables locked 2026-05-01.
"""

from __future__ import annotations

from typing import List, Tuple


# Each entry: (minimum raw score for this band, band score). Sorted DESCENDING
# by raw, so the first row whose `raw >= min_raw` matches.

_LISTENING_TABLE: List[Tuple[int, float]] = [
    (39, 9.0),
    (37, 8.5),
    (35, 8.0),
    (32, 7.5),
    (30, 7.0),
    (26, 6.5),
    (23, 6.0),
    (18, 5.5),
    (16, 5.0),
    (13, 4.5),
    (10, 4.0),
    (8, 3.5),
    (6, 3.0),
    (4, 2.5),
    (0, 2.0),
]


_READING_ACADEMIC_TABLE: List[Tuple[int, float]] = [
    (39, 9.0),
    (37, 8.5),
    (35, 8.0),
    (33, 7.5),
    (30, 7.0),
    (27, 6.5),
    (23, 6.0),
    (19, 5.5),
    (15, 5.0),
    (13, 4.5),
    (10, 4.0),
    (8, 3.5),
    (6, 3.0),
    (4, 2.5),
    (0, 2.0),
]


# General Training reading is graded harder — same raw needs more correct
# answers for the same band.
_READING_GENERAL_TABLE: List[Tuple[int, float]] = [
    (40, 9.0),
    (39, 8.5),
    (37, 8.0),
    (36, 7.5),
    (34, 7.0),
    (32, 6.5),
    (30, 6.0),
    (27, 5.5),
    (23, 5.0),
    (19, 4.5),
    (15, 4.0),
    (12, 3.5),
    (9, 3.0),
    (6, 2.5),
    (0, 2.0),
]


def _lookup(raw: int, table: List[Tuple[int, float]]) -> float:
    raw = max(0, int(raw))
    for min_raw, band in table:
        if raw >= min_raw:
            return band
    return 0.0


def band_for_listening_raw(correct: int) -> float:
    """Official IELTS Listening band for a 40-question raw score."""
    return _lookup(correct, _LISTENING_TABLE)


def band_for_reading_academic_raw(correct: int) -> float:
    """Official IELTS Academic Reading band for a 40-question raw score."""
    return _lookup(correct, _READING_ACADEMIC_TABLE)


def band_for_reading_general_raw(correct: int) -> float:
    """Official IELTS General Training Reading band for 40-question raw."""
    return _lookup(correct, _READING_GENERAL_TABLE)


def _project_to_40(correct: int, total: int) -> int:
    """Scale a raw score from an arbitrary-length test onto the 40-question
    table. Used for QB / mastery sets that have, say, 13 questions."""
    if total <= 0:
        return 0
    if total == 40:
        return int(correct)
    return round((correct / total) * 40)


def band_for_listening(correct: int, total: int = 40) -> float:
    return band_for_listening_raw(_project_to_40(correct, total))


def band_for_reading(correct: int, total: int = 40, track: str = "academic") -> float:
    if track and track.lower() in {"general", "general_training", "gt"}:
        return band_for_reading_general_raw(_project_to_40(correct, total))
    return band_for_reading_academic_raw(_project_to_40(correct, total))


# Backwards-compatibility shim so older callers that still pass percentage
# (e.g. `_fallback_reading_band(percentage)`) keep working but route through
# the official table.
def band_for_reading_pct(percentage: float, track: str = "academic") -> float:
    return band_for_reading(round(percentage / 100 * 40), 40, track)


def band_for_listening_pct(percentage: float) -> float:
    return band_for_listening(round(percentage / 100 * 40), 40)


__all__ = [
    "band_for_listening_raw",
    "band_for_reading_academic_raw",
    "band_for_reading_general_raw",
    "band_for_listening",
    "band_for_reading",
    "band_for_listening_pct",
    "band_for_reading_pct",
]
