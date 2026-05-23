"""
Deterministic scoring for the quick assessment — zero LLM calls.

Reading + Listening: Cambridge raw→band table lookup (reuses
services/ielts_band_tables.py). Writing + Speaking: heuristic scorers
parameterised by Cambridge research baselines (cambridge_benchmarks.json).
"""
from __future__ import annotations
import re
from typing import Iterable

# Reuse the existing Cambridge raw→band tables. These ship with the
# backend already and are the authoritative conversion the IELTS test
# scoring should have been using from day one.
try:
    from services.ielts_band_tables import (
        band_for_reading_academic_raw,
        band_for_listening_raw,
    )
except ImportError:  # pragma: no cover — local-only fallback for type-check
    def band_for_reading_academic_raw(raw_40):  # noqa: D401
        # Approximate Cambridge Academic Reading raw → band lookup
        # (used as fallback if services.ielts_band_tables isn't on path).
        table = [
            (39, 9.0), (37, 8.5), (35, 8.0), (33, 7.5), (30, 7.0),
            (27, 6.5), (23, 6.0), (19, 5.5), (15, 5.0), (12, 4.5),
            (9, 4.0), (6, 3.5), (3, 3.0), (0, 2.5),
        ]
        for threshold, band in table:
            if raw_40 >= threshold:
                return band
        return 2.5

    def band_for_listening_raw(raw_40):  # noqa: D401
        table = [
            (39, 9.0), (37, 8.5), (35, 8.0), (32, 7.5), (30, 7.0),
            (26, 6.5), (23, 6.0), (18, 5.5), (16, 5.0), (13, 4.5),
            (10, 4.0), (7, 3.5), (4, 3.0), (0, 2.5),
        ]
        for threshold, band in table:
            if raw_40 >= threshold:
                return band
        return 2.5


# ── Reading + Listening ───────────────────────────────────────────────

def score_reading_raw(correct: int, total: int = 4) -> float:
    """Stage 1+2 reading is 4 items. Scale linearly to Cambridge's 40-Q table."""
    if total <= 0:
        return 4.0
    raw_40 = round(correct * 40 / total)
    return band_for_reading_academic_raw(raw_40)


def score_listening_raw(correct: int, total: int = 4) -> float:
    if total <= 0:
        return 4.0
    raw_40 = round(correct * 40 / total)
    return band_for_listening_raw(raw_40)


# ── Writing heuristic ─────────────────────────────────────────────────

_COHESION_MARKERS = [
    "however", "moreover", "in addition", "on the other hand",
    "therefore", "for example", "such as", "while", "although",
    "furthermore", "consequently", "as a result", "in contrast",
    "nevertheless", "in particular",
]
_COMPLEX_SUBORDINATORS = [
    "because", "since", "even though", "if", "when",
    "which", "whose", "whereas", "unless", "until",
]
# Simple subject-verb agreement traps frequent in L2 writers.
_SVA_PATTERNS = [
    re.compile(r"\bpeople (is|has|was)\b", re.IGNORECASE),
    re.compile(r"\bhe (don't|have|do)\b", re.IGNORECASE),
    re.compile(r"\bshe (don't|have|do)\b", re.IGNORECASE),
    re.compile(r"\bthey (is|was|has)\b", re.IGNORECASE),
    re.compile(r"\bit (are|were|have)\b", re.IGNORECASE),
]


def _count_any(text_lower: str, phrases: Iterable[str]) -> int:
    return sum(1 for p in phrases if p in text_lower)


def _word_tokens(text: str) -> list[str]:
    return re.findall(r"[a-zA-Z']+", text.lower())


def _sentence_count(text: str) -> int:
    parts = re.split(r"[.!?]+", text)
    return sum(1 for p in parts if p.strip())


def score_writing_heuristic(text: str, target_words: tuple[int, int] = (60, 100)) -> dict:
    """
    Pure-Python heuristic scorer for the quick assessment writing micro-task.

    Returns:
        {
            "band": float,
            "metrics": {...},
            "strengths": [str, ...],
            "weaknesses": [str, ...],
        }
    """
    text = (text or "").strip()
    if not text:
        return {
            "band": 2.0,
            "metrics": {"word_count": 0},
            "strengths": [],
            "weaknesses": ["No response provided."],
        }

    text_lower = text.lower()
    tokens = _word_tokens(text)
    W = len(tokens)
    U = len(set(tokens))
    ratio_unique = (U / W) if W else 0

    S = _sentence_count(text) or 1
    avg_sent_len = W / S

    cohesion = _count_any(text_lower, _COHESION_MARKERS)
    complexity = _count_any(text_lower, _COMPLEX_SUBORDINATORS)

    sva_errors = sum(1 for pat in _SVA_PATTERNS if pat.search(text))

    # Word-count ceiling (the strongest single signal)
    min_w, _max_w = target_words
    if W < min_w * 0.3:
        max_band = 3.0
    elif W < min_w * 0.5:
        max_band = 4.0
    elif W < min_w * 0.8:
        max_band = 5.0
    elif W < min_w:
        max_band = 5.5
    elif W < min_w * 1.5:
        max_band = 7.0
    else:
        max_band = 7.5

    band = max_band

    # Vocabulary
    if ratio_unique > 0.65: band += 0.5
    if ratio_unique < 0.40: band -= 0.5

    # Cohesion
    if cohesion >= 2:  band += 0.5
    if cohesion == 0:  band -= 0.5

    # Complexity
    if complexity >= 2: band += 0.5
    if avg_sent_len < 6: band -= 0.5

    # Accuracy proxies
    if sva_errors >= 2: band -= 0.5

    band = max(2.0, min(max_band, band))
    band = round(band * 2) / 2  # nearest 0.5

    # Strengths / weaknesses surface
    strengths: list[str] = []
    weaknesses: list[str] = []

    if ratio_unique > 0.65:
        strengths.append("Strong vocabulary variety.")
    if cohesion >= 2:
        strengths.append(f"Good use of cohesive devices ({cohesion} distinct markers).")
    if complexity >= 2:
        strengths.append("Mix of complex sentence structures.")
    if W >= min_w:
        strengths.append("Met the word-count target.")

    if W < min_w:
        weaknesses.append(f"Response too short ({W}w) — aim for {min_w}+ words.")
    if cohesion == 0:
        weaknesses.append("Use more linking words (however, in addition, on the other hand…).")
    if complexity == 0:
        weaknesses.append("Try complex sentences with because / although / which.")
    if avg_sent_len < 6:
        weaknesses.append(f"Sentences too short (avg {avg_sent_len:.1f} words) — combine ideas.")
    if sva_errors >= 2:
        weaknesses.append("Subject-verb agreement issues detected.")

    return {
        "band": band,
        "metrics": {
            "word_count": W,
            "unique_words": U,
            "type_token_ratio": round(ratio_unique, 3),
            "sentence_count": S,
            "avg_sentence_length": round(avg_sent_len, 1),
            "cohesion_markers": cohesion,
            "complex_subordinators": complexity,
            "sva_errors": sva_errors,
        },
        "strengths": strengths,
        "weaknesses": weaknesses,
    }


# ── Speaking heuristic ────────────────────────────────────────────────

_FILLER_WORDS = ["um", "uh", "er", "like", "you know", "i mean", "uhm", "erm"]


def score_speaking_heuristic(transcript: str, duration_sec: float | None = None) -> dict:
    """
    Score a single speaking prompt response on transcript only.
    duration_sec is required for WPM; if missing we estimate from word count.
    """
    transcript = (transcript or "").strip()
    if not transcript:
        return {
            "band": 2.0,
            "metrics": {"word_count": 0},
            "strengths": [],
            "weaknesses": ["No spoken response captured."],
        }

    tokens = _word_tokens(transcript)
    W = len(tokens)
    if W == 0:
        return {
            "band": 2.0,
            "metrics": {"word_count": 0},
            "strengths": [],
            "weaknesses": ["No spoken response captured."],
        }

    # WPM
    if duration_sec and duration_sec > 0:
        wpm = W / (duration_sec / 60.0)
    else:
        # Fallback estimate: assume the user used the full prompt duration.
        wpm = W * 60 / 45  # 45s default per prompt

    # Filler ratio
    text_lower = transcript.lower()
    filler_count = sum(text_lower.count(f) for f in _FILLER_WORDS)
    filler_ratio = filler_count / W if W else 0

    # Vocab
    U = len(set(tokens))
    ratio_unique = U / W

    # Initial band by WPM band (Cambridge English Speak Out reference)
    if wpm < 60:     band = 3.5
    elif wpm < 90:   band = 4.5
    elif wpm < 110:  band = 5.0
    elif wpm < 130:  band = 6.0
    elif wpm < 150:  band = 6.5
    elif wpm < 165:  band = 7.0
    else:            band = 7.0  # > 165 wpm too fast = clarity penalty

    # Filler adjustment
    if filler_ratio < 0.02:  band += 0.5
    elif filler_ratio > 0.05: band -= 0.5
    if filler_ratio > 0.10:   band -= 0.5  # cumulative

    # Vocab range
    if ratio_unique > 0.55:  band += 0.5
    if ratio_unique < 0.30:  band -= 0.5

    band = max(2.0, min(8.0, band))
    band = round(band * 2) / 2

    strengths: list[str] = []
    weaknesses: list[str] = []

    if wpm >= 130:
        strengths.append(f"Natural speaking pace ({wpm:.0f} WPM).")
    if filler_ratio < 0.03:
        strengths.append(f"Few filler words ({filler_ratio*100:.1f}%).")
    if ratio_unique > 0.55:
        strengths.append("Wide vocabulary range.")

    if wpm < 90:
        weaknesses.append(f"Slow delivery ({wpm:.0f} WPM) — band-6 speakers average 130.")
    if filler_ratio > 0.05:
        weaknesses.append(f"High filler ratio ({filler_ratio*100:.1f}%) — practise pausing silently.")
    if ratio_unique < 0.35:
        weaknesses.append("Vocabulary repeats — try synonyms.")
    if W < 30:
        weaknesses.append("Response too short — develop ideas with examples.")

    return {
        "band": band,
        "metrics": {
            "word_count": W,
            "unique_words": U,
            "type_token_ratio": round(ratio_unique, 3),
            "wpm": round(wpm, 1),
            "filler_count": filler_count,
            "filler_ratio": round(filler_ratio, 3),
            "duration_sec": duration_sec,
        },
        "strengths": strengths,
        "weaknesses": weaknesses,
    }


# ── Aggregate ─────────────────────────────────────────────────────────

def aggregate_band(
    reading: float | None,
    listening: float | None,
    writing: float | None,
    speaking: float | None,
) -> dict:
    """Mean of available skill bands, rounded to nearest 0.5."""
    bands = [b for b in (reading, listening, writing, speaking) if b is not None]
    if not bands:
        return {"band": None, "confidence_low": None, "confidence_high": None}
    overall = sum(bands) / len(bands)
    overall_rounded = round(overall * 2) / 2

    # Confidence interval — wider when fewer skills measured.
    # Quick test reliability ≈ ±0.5 with all 4 skills, ±0.75 with 3, ±1.0 with 2.
    spread = {4: 0.5, 3: 0.75, 2: 1.0, 1: 1.5}.get(len(bands), 1.5)
    return {
        "band": overall_rounded,
        "confidence_low": max(2.0, overall_rounded - spread),
        "confidence_high": min(9.0, overall_rounded + spread),
        "components": {
            "reading": reading,
            "listening": listening,
            "writing": writing,
            "speaking": speaking,
        },
    }
