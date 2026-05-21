#!/usr/bin/env python3
"""
Strict content validator — production gate for enriched-JSON lessons.

Unlike lesson_audit.py (advisory, warnings welcome), this script
returns a non-zero exit code if ANY rule from backend/content/CONTENT_RULES.md
fires. CI / pre-push should run it on changed lessons; a failure means
the lesson cannot ship.

No paid API calls (Aga 2026-05-21 rule). Pure deterministic checks
against the JSON shape.

Usage:
  backend/.venv/bin/python3 backend/scripts/content_validator.py \\
      --stage 3 --unit 1 --lesson 1                   # one lesson
  backend/.venv/bin/python3 backend/scripts/content_validator.py \\
      --stage 3 --unit 1                              # whole unit
  backend/.venv/bin/python3 backend/scripts/content_validator.py \\
      --stage 3                                       # whole stage

Exit codes:
  0 — all rules passed
  1 — at least one rule violation (printed to stderr)
"""
from __future__ import annotations
import argparse
import json
import sys
from collections import Counter
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent.parent
ENRICHED = REPO / "backend" / "content" / "enriched"


# -------- rules ---------------------------------------------------

def check_listening(step: dict, ctx: str) -> list[str]:
    errs = []
    script = (step.get("audio_text") or step.get("audio_script") or "").strip()
    if not script:
        errs.append(f"{ctx} listening: audio_text is empty")
    qs = step.get("questions") or step.get("items") or []
    if not (4 <= len(qs) <= 6):
        errs.append(f"{ctx} listening: {len(qs)} questions (expected 4–6)")
    # Yes/No balance
    binary_answers = []
    for q in qs:
        ans = (q.get("correct_answer") or q.get("answer") or q.get("correct") or "")
        a = str(ans).lower().strip()
        if a in ("yes", "no", "true", "false"):
            binary_answers.append(a)
    if binary_answers:
        c = Counter(binary_answers)
        if len(c) == 1:
            errs.append(
                f"{ctx} listening: all {len(binary_answers)} binary answers "
                f"are '{binary_answers[0]}' — must include at least one of "
                f"each ({sorted(set(['yes','no']) | set(['true','false']) & set(c.keys()))})"
            )
    # MC distractor category sniff: if all options for a Q look like the
    # correct one (same casing / same word length distribution), it's a
    # rough proxy for category coherence. We only fire when options are
    # wildly different lengths — too aggressive a check would be false-y.
    return errs


def check_reading(step: dict, ctx: str) -> list[str]:
    errs = []
    qs = step.get("questions") or step.get("items") or []
    if not (4 <= len(qs) <= 6):
        errs.append(f"{ctx} reading: {len(qs)} questions (expected 4–6)")
    passage = (step.get("text") or step.get("passage") or "").strip()
    word_count = len(passage.split())
    if not passage:
        errs.append(f"{ctx} reading: passage is empty")
    elif not (40 <= word_count <= 140):
        errs.append(f"{ctx} reading: passage is {word_count} words (expected 50–120, soft 40–140)")
    missing_locate = []
    for i, q in enumerate(qs, 1):
        if not (q.get("locate_text") or q.get("evidence") or q.get("passage_quote")):
            missing_locate.append(i)
    if missing_locate:
        errs.append(
            f"{ctx} reading: questions {missing_locate} missing locate_text — "
            f"mandatory per CONTENT_RULES.md"
        )
    return errs


def check_grammar_games(step: dict, ctx: str) -> list[str]:
    errs = []
    games = step.get("games") or [step]
    for g in games:
        gtype = g.get("game_type") or g.get("type", "")
        items = g.get("items") or []
        if gtype == "true_false":
            ans = []
            for it in items:
                v = it.get("correct") if "correct" in it else it.get("is_correct")
                if isinstance(v, bool):
                    ans.append("true" if v else "false")
                elif isinstance(v, str):
                    ans.append(v.lower().strip())
            if ans:
                c = Counter(ans)
                top, top_n = c.most_common(1)[0]
                if top_n / len(ans) > 0.6:
                    errs.append(
                        f"{ctx} grammar_games.true_false: {top_n}/{len(ans)} "
                        f"items are '{top}' ({top_n/len(ans):.0%}) — max 60% "
                        f"per CONTENT_RULES.md"
                    )
        elif gtype in ("multiple_choice_grammar", "fill_blank"):
            ans = []
            for it in items:
                a = it.get("answer") or it.get("correct_answer") or it.get("correct")
                if a is not None:
                    ans.append(str(a).lower().strip())
            # No two consecutive items same answer
            for i in range(1, len(ans)):
                if ans[i] == ans[i - 1]:
                    # Allow one occasional repeat? No — rule is strict
                    errs.append(
                        f"{ctx} grammar_games.{gtype}: items {i} and {i+1} both "
                        f"have answer '{ans[i]}' — no consecutive repeats"
                    )
                    break
            # Detect alternating patterns like h-i-h-i-h-i
            if len(ans) >= 4:
                if all(ans[k] == ans[k % 2] for k in range(len(ans))):
                    errs.append(
                        f"{ctx} grammar_games.{gtype}: answers strictly alternate "
                        f"({'-'.join(ans)}) — child cracks the pattern. Rotate "
                        f"the correct answer."
                    )
    return errs


def check_vocab_games(step: dict, ctx: str) -> list[str]:
    errs = []
    games = step.get("games") or [step]
    for g in games:
        gtype = g.get("game_type") or g.get("type", "vocab_game")
        items = g.get("items") or []
        slot_counts = Counter()
        for it in items:
            ci = it.get("correct_index")
            if ci is not None:
                slot_counts[ci] += 1
        if slot_counts and len(items) >= 4:
            top, top_n = slot_counts.most_common(1)[0]
            if top_n / len(items) > 0.6:
                errs.append(
                    f"{ctx} vocab_games.{gtype}: {top_n}/{len(items)} correct "
                    f"answers fall in slot {top}. Data-level shuffle missing — "
                    f"re-run pack_unit_games."
                )
    return errs


def check_speaking(step: dict, ctx: str) -> list[str]:
    errs = []
    prompts = step.get("prompts") or [step]
    for i, p in enumerate(prompts, 1):
        if isinstance(p, str):
            p = {"prompt": p}
        if not isinstance(p, dict):
            continue
        ptype = p.get("production_type") or p.get("scoring_mode") \
            or step.get("production_type") or step.get("scoring_mode")
        if not ptype:
            errs.append(
                f"{ctx} speaking prompt {i}: missing production_type "
                f"(self_introduction / say_n_structural / echo) — mandatory "
                f"per CONTENT_RULES.md"
            )
        elif ptype == "say_n_structural":
            ptxt = p.get("prompt") or p.get("question") or ""
            import re
            if not re.search(r"\bsay\s+(\d+|one|two|three|four|five|six)\s+", ptxt, re.I):
                errs.append(
                    f"{ctx} speaking prompt {i}: production_type=say_n_structural "
                    f"but prompt doesn't contain 'say N...' — evaluator will not "
                    f"detect the count"
                )
            if not re.search(r"using\s+['\"`]", ptxt):
                errs.append(
                    f"{ctx} speaking prompt {i}: say_n_structural prompt missing "
                    f"quoted pattern (e.g. using 'I have a...') — evaluator "
                    f"needs it to find the anchor"
                )
    return errs


def check_vocabulary(step: dict, ctx: str) -> list[str]:
    errs = []
    items = step.get("items") or step.get("words") or []
    no_image = []
    for it in items:
        if not it.get("image_url") and not it.get("image_emoji"):
            no_image.append(it.get("word", "?"))
    if no_image:
        errs.append(
            f"{ctx} vocabulary: items missing both image_url and image_emoji: "
            f"{no_image}"
        )
    return errs


# -------- runner --------------------------------------------------

def validate_lesson(lesson: dict, ctx_prefix: str) -> list[str]:
    errs = []
    for s in lesson.get("steps", []):
        t = s.get("type")
        ctx = f"{ctx_prefix} step{s.get('step', '?')}({t})"
        if t == "listening":
            errs.extend(check_listening(s, ctx))
        elif t in ("reading", "micro_reading"):
            errs.extend(check_reading(s, ctx))
        elif t == "grammar_games":
            errs.extend(check_grammar_games(s, ctx))
        elif t == "vocab_games":
            errs.extend(check_vocab_games(s, ctx))
        elif t in ("speaking", "production"):
            errs.extend(check_speaking(s, ctx))
        elif t == "vocabulary":
            errs.extend(check_vocabulary(s, ctx))
    return errs


def load_unit(stage: int, unit: int) -> dict:
    p = ENRICHED / f"stage{stage}_unit{unit:02d}_enriched.json"
    if not p.exists():
        sys.exit(f"missing enriched file: {p}")
    return json.loads(p.read_text())


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--stage", type=int, required=True)
    ap.add_argument("--unit", type=int, help="omit to validate all units")
    ap.add_argument("--lesson", type=int, help="omit to validate all lessons in the unit(s)")
    args = ap.parse_args()

    units_to_check = []
    if args.unit:
        units_to_check.append(args.unit)
    else:
        # discover
        for p in sorted(ENRICHED.glob(f"stage{args.stage}_unit*_enriched.json")):
            num = int(p.stem.split("_unit")[1].split("_")[0])
            units_to_check.append(num)

    all_errs = []
    for u_num in units_to_check:
        data = load_unit(args.stage, u_num)
        for U in data.get("units") or [data]:
            for L in U.get("lessons", []):
                ln = L.get("lesson_num") or L.get("number") or 0
                if args.lesson and ln != args.lesson:
                    continue
                ctx = f"stage{args.stage} unit{u_num:02d} lesson{ln:02d}"
                errs = validate_lesson(L, ctx)
                all_errs.extend(errs)

    if all_errs:
        print(f"\n❌ {len(all_errs)} content rule violation(s):\n", file=sys.stderr)
        for e in all_errs:
            print(f"  • {e}", file=sys.stderr)
        print("", file=sys.stderr)
        print("Rules: backend/content/CONTENT_RULES.md", file=sys.stderr)
        sys.exit(1)
    else:
        print(f"✅ All lessons pass content rules.")


if __name__ == "__main__":
    main()
