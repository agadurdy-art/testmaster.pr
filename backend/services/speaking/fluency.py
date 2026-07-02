"""
Local fluency metrics for the speaking evaluator.

WPM, pauses, fillers, unique/total word counts. Split out of
services/speaking_evaluator.py (2026-07-02 refactor); behavior unchanged.
"""
from __future__ import annotations

import re
from collections import Counter
from typing import Any, Dict, Tuple

# Each entry is (display label, regex pattern). Patterns tolerate trailing
# repetitions ("uhm", "ahhh", "errr") that Whisper / Azure occasionally leave
# in transcripts. Single-token fillers stay anchored with \b; multi-word ones
# match the whole phrase.
FILLER_PATTERNS: Tuple[Tuple[str, str], ...] = (
    ("um",         r"\bu+m+\b"),
    ("uh",         r"\bu+h+\b"),
    ("uhm",        r"\bu+h+m+\b"),
    ("er",         r"\be+r+\b"),
    ("erm",        r"\be+r+m+\b"),
    ("ah",         r"\ba+h+\b"),
    ("hmm",        r"\bh+m+\b"),
    ("well",       r"\bwell\b"),
    ("like",       r"\blike\b"),
    ("you know",   r"\byou know\b"),
    ("i mean",     r"\bi mean\b"),
    ("actually",   r"\bactually\b"),
    ("basically",  r"\bbasically\b"),
    ("sort of",    r"\bsort of\b"),
    ("kind of",    r"\bkind of\b"),
)


# ─── Local fluency metrics ───────────────────────────────────────────────────


def compute_fluency(transcript: str, duration_seconds: float) -> Dict[str, Any]:
    """Compute simple fluency metrics. Duration in seconds (float)."""
    duration_seconds = max(0.0, float(duration_seconds or 0.0))
    cleaned = (transcript or "").strip()
    words = re.findall(r"[A-Za-z'']+", cleaned.lower())
    words_total = len(words)

    minutes = duration_seconds / 60.0 if duration_seconds > 0 else 0.0
    wpm = int(round(words_total / minutes)) if minutes > 0 else 0

    lowered = cleaned.lower()
    filler_hits: Counter[str] = Counter()
    for label, pattern in FILLER_PATTERNS:
        count = len(re.findall(pattern, lowered))
        if count:
            filler_hits[label] += count
    filler_total = sum(filler_hits.values())

    # Pauses: count runs of ".", "…", "--" and long comma breaks.
    pauses = len(re.findall(r"\.{2,}|…|—|--", cleaned))
    # Rough heuristic: each sentence-ending period ≈ 1 pause.
    pauses += len(re.findall(r"[.!?](?=\s|$)", cleaned))
    filled_pauses = filler_total

    unique_count = len({w for w in words})

    mm = int(duration_seconds // 60)
    ss = int(round(duration_seconds - mm * 60))
    duration_str = f"{mm} min {ss:02d} s"

    fillers_label = ", ".join(f'"{w}"' for w, _ in filler_hits.most_common(3))
    fillers_display = (
        f"{filler_total} · {fillers_label}" if filler_total else "0"
    )

    return {
        "wpm": wpm,
        "words_total": words_total,
        "unique_count": unique_count,
        "pauses": pauses,
        "filled_pauses": filled_pauses,
        "fillers_detected": list(filler_hits.keys()),
        "pauses_display": f"{pauses} · {filled_pauses} filled",
        "fillers_display": fillers_display,
        "unique_display": f"{unique_count} / {words_total}",
        "duration_display": duration_str,
    }
