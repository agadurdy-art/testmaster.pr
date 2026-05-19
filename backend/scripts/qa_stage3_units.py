#!/usr/bin/env python3
"""Stage 3 enriched JSON QA — validates shape + content quality."""
import json
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
PREP = json.loads((REPO / "content/cambridge_refs/prepare_lv1_unit_breakdowns.json").read_text())

errors_total = 0
warnings_total = 0


def err(msg):
    global errors_total
    errors_total += 1
    print(f"  ERROR {msg}")


def warn(msg):
    global warnings_total
    warnings_total += 1
    print(f"  WARN  {msg}")


def ok(msg):
    print(f"  OK    {msg}")


def get_prepare_unit(n):
    for u in PREP["units"]:
        if u["unit_num"] == n:
            return u
    return None


def all_prepare_words(unit_data):
    words = set()
    for section in unit_data.get("vocab_sections", {}).values():
        for item in section:
            if isinstance(item, str):
                words.add(item.lower())
            elif isinstance(item, dict):
                for v in item.values():
                    if isinstance(v, str):
                        words.add(v.lower())
    for g in unit_data.get("target_grammar", []):
        if isinstance(g, str) and ":" in g:
            tail = g.split(":", 1)[1]
            for tok in tail.split(","):
                tok = tok.strip().strip(".").lower()
                if tok and len(tok) <= 12:
                    words.add(tok)
    return words


def check_unit(unit_num):
    p = REPO / f"content/enriched/stage3_unit{unit_num:02d}_enriched.json"
    print(f"\n=== Unit {unit_num:02d} — {p.name} ===")
    if not p.exists():
        err(f"file missing: {p}")
        return
    try:
        data = json.loads(p.read_text())
    except Exception as e:
        err(f"JSON parse error: {e}")
        return
    units = data.get("units", [])
    if len(units) != 1:
        err(f"Expected 1 unit, got {len(units)}")
        return
    u = units[0]
    lessons = u.get("lessons", [])
    if len(lessons) != 4:
        err(f"Expected 4 lessons, got {len(lessons)}")
    ok(f"Title: {u.get('title')!r}")

    prep = get_prepare_unit(unit_num)
    prepare_words = all_prepare_words(prep) if prep else set()

    actual_vocab = set()
    for li, lesson in enumerate(lessons, 1):
        steps = lesson.get("steps", [])
        types = [s.get("type") for s in steps]
        for need in ("warm_up", "vocab_games", "micro_reading", "grammar_games",
                     "listening", "production", "exit_ticket"):
            if need not in types:
                err(f"L{li}: {need} missing")
        if "vocabulary" not in types and "vocabulary_review" not in types:
            err(f"L{li}: vocabulary/review missing")
        if "grammar_focus" not in types and "grammar_review" not in types:
            err(f"L{li}: grammar_focus/review missing")

        for s in steps:
            t = s.get("type")
            if t == "vocabulary":
                for it in s.get("items", []):
                    if isinstance(it, dict) and it.get("word"):
                        actual_vocab.add(it["word"].lower())
                        if not it.get("image_url"):
                            warn(f"L{li} vocab '{it['word']}': no image_url")
            if t == "vocabulary_review":
                for v in s.get("items", []):
                    if isinstance(v, str):
                        actual_vocab.add(v.lower())
            if t in ("vocab_games", "grammar_games"):
                games = s.get("games", [])
                if len(games) != 3:
                    err(f"L{li} {t}: expected 3 games, got {len(games)}")
                for g in games:
                    items = g.get("items", [])
                    if not items:
                        err(f"L{li} {t} {g.get('game_type')}: no items")
                    elif len(items) < 2:
                        warn(f"L{li} {t} {g.get('game_type')}: only {len(items)} items")
            if t == "micro_reading":
                wc = len(s.get("text", "").split())
                if wc < 50:
                    warn(f"L{li} reading: only {wc} words")
                if wc > 200:
                    warn(f"L{li} reading: {wc} words (A1 typical 60-150)")
                if len(s.get("questions", [])) < 3:
                    err(f"L{li} reading: only {len(s.get('questions', []))} questions")
            if t == "listening":
                wc = len(s.get("audio_text", "").split())
                if wc < 30:
                    warn(f"L{li} listening: only {wc} words")
                if len(s.get("questions", [])) < 3:
                    err(f"L{li} listening: only {len(s.get('questions', []))} questions")
            if t == "grammar_focus":
                if not s.get("rule_pattern"):
                    err(f"L{li} grammar_focus: no rule_pattern")
                if len(s.get("examples", [])) < 3:
                    warn(f"L{li} grammar_focus: only {len(s.get('examples', []))} examples")
            if t == "exit_ticket":
                if len(s.get("questions", [])) < 3:
                    err(f"L{li} exit_ticket: only {len(s.get('questions', []))} questions")

    if prepare_words:
        in_prep = actual_vocab & prepare_words
        out_of_prep = actual_vocab - prepare_words
        coverage = len(in_prep) / len(prepare_words) * 100
        ok(f"Vocab: {len(actual_vocab)} unique. Prepare list: {len(prepare_words)}. Coverage: {coverage:.0f}%")
        if coverage < 70:
            warn(f"Coverage <70%. Missing: {sorted(prepare_words - actual_vocab)[:10]}")
        if out_of_prep:
            warn(f"Out-of-scope: {sorted(out_of_prep)}")


for n in (1, 2, 3, 4):
    check_unit(n)

print(f"\n{'='*50}")
print(f"Errors: {errors_total}  Warnings: {warnings_total}")
sys.exit(1 if errors_total else 0)
