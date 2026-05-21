#!/usr/bin/env python3
"""
Break consecutive same-answer streaks in grammar_games MC/fill items.

Aga 2026-05-21: items 1+2 both 'is', or answers alternating
is-is-is-is — predictable. The fix is "smart shuffle": find an ordering
where no two adjacent items share an answer, if one exists.

If the set has > 60% of items with the same answer, no ordering can
satisfy the rule — those need content rewrite, not reordering. Flagged.

In-session, deterministic, no LLM, no paid API.

Run:
  backend/.venv/bin/python3 backend/scripts/fix_grammar_shuffle.py --stage 3
"""
from __future__ import annotations
import argparse
import json
from collections import Counter
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent.parent
ENRICHED = REPO / "backend" / "content" / "enriched"


def item_answer(it: dict) -> str:
    a = it.get("answer") or it.get("correct_answer") or it.get("correct") or ""
    return str(a).lower().strip()


def smart_reorder(items: list[dict]) -> list[dict] | None:
    """Reorder so adjacent items differ in answer. Greedy: at each step
    take the answer with the highest remaining count that isn't the
    previous one. If impossible, return None — the set needs rewrite."""
    if not items:
        return items
    buckets: dict[str, list[dict]] = {}
    for it in items:
        buckets.setdefault(item_answer(it), []).append(it)
    counts = {k: len(v) for k, v in buckets.items()}
    # Theoretical possibility check: if any single answer count > ceil(n/2),
    # no valid arrangement exists.
    n = len(items)
    max_count = max(counts.values()) if counts else 0
    if max_count > (n + 1) // 2:
        return None
    out = []
    prev = None
    while sum(counts.values()) > 0:
        # pick the answer with the most remaining that isn't prev
        candidates = sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))
        chosen = None
        for k, c in candidates:
            if c == 0:
                continue
            if k != prev:
                chosen = k
                break
        if chosen is None:
            return None
        out.append(buckets[chosen].pop())
        counts[chosen] -= 1
        prev = chosen
    return out


def fix_unit(stage: int, unit: int) -> tuple[int, list[str]]:
    p = ENRICHED / f"stage{stage}_unit{unit:02d}_enriched.json"
    if not p.exists():
        return 0, []
    data = json.loads(p.read_text())
    reordered = 0
    needs_rewrite = []
    for U in data.get("units") or [data]:
        for L in U.get("lessons", []):
            for s in L.get("steps", []):
                if s.get("type") != "grammar_games":
                    continue
                for g in s.get("games") or [s]:
                    gtype = g.get("game_type") or g.get("type", "")
                    if gtype not in ("multiple_choice_grammar", "fill_blank"):
                        continue
                    items = g.get("items") or []
                    # Already alternating? Check current state
                    answers = [item_answer(it) for it in items]
                    if all(a != b for a, b in zip(answers, answers[1:])):
                        continue  # already good
                    new = smart_reorder(items)
                    if new is None:
                        c = Counter(answers)
                        top, top_n = c.most_common(1)[0]
                        needs_rewrite.append(
                            f"{L.get('lesson_id')}.{gtype}: {top_n}/{len(items)} "
                            f"items are '{top}' — content rewrite needed"
                        )
                        continue
                    g["items"] = new
                    reordered += 1
    if reordered or needs_rewrite:
        p.write_text(json.dumps(data, indent=2, ensure_ascii=False))
        if reordered:
            print(f"  ✏️  {p.name}: {reordered} game(s) reordered")
    return reordered, needs_rewrite


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--stage", type=int, required=True)
    args = ap.parse_args()

    total = 0
    unfixable = []
    for p in sorted(ENRICHED.glob(f"stage{args.stage}_unit*_enriched.json")):
        u = int(p.stem.split("_unit")[1].split("_")[0])
        r, nr = fix_unit(args.stage, u)
        total += r
        unfixable.extend(nr)
    print(f"\nDone. {total} game(s) reordered.")
    if unfixable:
        print(f"\n⚠️  {len(unfixable)} game(s) need CONTENT REWRITE (>50% same answer):")
        for m in unfixable:
            print(f"  • {m}")


if __name__ == "__main__":
    main()
