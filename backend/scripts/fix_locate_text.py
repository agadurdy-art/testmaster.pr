#!/usr/bin/env python3
"""
Backfill `locate_text` for every reading question that's missing it.

Strategy: for each reading question, find the sentence in the passage
that contains the correct answer verbatim. If the answer spans two
sentences (because the proof needs a pronoun antecedent), join them.
If we can't find the answer string in the passage, leave the question
alone and surface it in the unresolved list so the human can hand-author
the locate_text.

This is mechanical, no LLM, in-session-safe per Aga's no-paid-API rule.

Run:
  backend/.venv/bin/python3 backend/scripts/fix_locate_text.py --stage 3
"""
from __future__ import annotations
import argparse
import json
import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent.parent
ENRICHED = REPO / "backend" / "content" / "enriched"

PRONOUN_START = re.compile(r"^(he|she|it|they|this|that|these|those)\b", re.I)


def split_sentences(text: str) -> list[str]:
    raw = re.findall(r"[^.!?]+[.!?]+", text) or [text]
    return [s.strip() for s in raw if s.strip()]


def find_locate(passage: str, question: dict) -> str | None:
    """Pick the best sentence (or pair) that supports the answer.

    For T/F questions the correct_answer is just "true"/"false", which
    doesn't appear in the passage as a literal — we fall back to scoring
    the question's content words instead.
    """
    sentences = split_sentences(passage)
    if not sentences:
        return None
    ans = str(question.get("correct_answer") or question.get("answer") or "").strip()
    qtext = str(question.get("question") or question.get("question_text") or "")

    # Skip T/F shortcut — for true/false the proof is via the question's
    # proper nouns / content words, not the literal answer.
    if ans.lower() not in ("true", "false", "yes", "no", ""):
        # Direct verbatim hit
        for i, s in enumerate(sentences):
            if ans.lower() in s.lower():
                nxt = sentences[i + 1] if i + 1 < len(sentences) else None
                if nxt and PRONOUN_START.match(nxt):
                    return f"{s} {nxt}"
                return s

    # Score by content-word overlap with the question
    stop = {"a","an","the","is","are","am","was","were","be","do","does",
            "did","have","has","had","to","of","in","on","at","for","from",
            "by","with","and","or","but","not","no","what","where","when",
            "who","how","why","which","true","false","yes","this","that",
            "his","her","my","your","our","their","i","you","he","she",
            "it","we","they"}
    qtokens = [t.strip(".,!?;:'\"()") for t in qtext.split()]
    qtokens = [t for t in qtokens if t and t.lower() not in stop and len(t) >= 2]
    qtokens.sort(key=lambda t: (-(1 if t[0].isupper() else 0), -len(t)))

    best, best_score = None, 0
    for i, s in enumerate(sentences):
        score = 0
        for t in qtokens:
            if re.search(rf"\b{re.escape(t)}\b", s, re.I):
                score += 3 if t[0].isupper() else 2
        if ans.lower() in ("true", "false"):
            # T/F false sentences often imply the opposite — the proof
            # sentence is the one that states the truth of the matter
            pass
        if score > best_score:
            best, best_score = i, score

    if best is None:
        return None
    primary = sentences[best]
    nxt = sentences[best + 1] if best + 1 < len(sentences) else None
    if nxt and PRONOUN_START.match(nxt):
        return f"{primary} {nxt}"
    return primary


def fix_unit(stage: int, unit: int) -> tuple[int, int]:
    """Returns (filled_count, unresolved_count)."""
    p = ENRICHED / f"stage{stage}_unit{unit:02d}_enriched.json"
    if not p.exists():
        return 0, 0
    data = json.loads(p.read_text())
    filled = 0
    unresolved = []
    for U in data.get("units") or [data]:
        for L in U.get("lessons", []):
            for s in L.get("steps", []):
                if s.get("type") not in ("reading", "micro_reading"):
                    continue
                passage = s.get("text") or s.get("passage") or ""
                qs = s.get("questions") or s.get("items") or []
                for q in qs:
                    if q.get("locate_text") or q.get("evidence") or q.get("passage_quote"):
                        continue
                    locate = find_locate(passage, q)
                    if locate:
                        q["locate_text"] = locate
                        filled += 1
                    else:
                        unresolved.append((L.get("lesson_id"), q.get("question", "?")))
    if filled:
        p.write_text(json.dumps(data, indent=2, ensure_ascii=False))
        print(f"  ✏️  {p.name}: +{filled} locate_text")
    return filled, len(unresolved)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--stage", type=int, required=True)
    ap.add_argument("--unit", type=int, help="omit to fix all units in the stage")
    args = ap.parse_args()

    units = [args.unit] if args.unit else []
    if not units:
        for p in sorted(ENRICHED.glob(f"stage{args.stage}_unit*_enriched.json")):
            units.append(int(p.stem.split("_unit")[1].split("_")[0]))

    total_filled = 0
    total_unresolved = 0
    for u in units:
        f, n = fix_unit(args.stage, u)
        total_filled += f
        total_unresolved += n
    print(f"\nDone. {total_filled} locate_text filled, {total_unresolved} unresolved.")


if __name__ == "__main__":
    main()
