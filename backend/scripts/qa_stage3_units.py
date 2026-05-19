#!/usr/bin/env python3
"""Stage 3 enriched JSON QA — validates shape + content quality."""
import json
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
PREP = json.loads((REPO / "content/cambridge_refs/prepare_lv1_unit_breakdowns.json").read_text())

EXPECTED_STEPS = {
    "warm_up", "vocabulary", "vocabulary_review",
    "vocab_games", "grammar_games",
    "micro_reading", "grammar_focus", "grammar_review",
    "listening", "production", "exit_ticket",
}

errors_total = 0
warnings_total = 0

def err(msg):
    global errors_total
    errors_total += 1
    print(f"  ❌ {msg}")

def warn(msg):
    global warnings_total
    warnings_total += 1
    print(f"  ⚠️  {msg}")

def ok(msg):
    print(f"  ✓ {msg}")

def get_prepare_unit(n):
    for u in PREP["units"]:
        if u["unit_num"] == n:
            return u
    return None

def all_prepare_words(unit_data):
    """Flatten Prepare wordlist for a unit, including grammar-target tokens
    that may be taught as vocab cards (e.g., prepositions in/on/under)."""
    words = set()
    for section_name, section in unit_data.get("vocab_sections", {}).items():
        for item in section:
            if isinstance(item, str):
                words.add(item.lower())
            elif isinstance(item, dict):
                for v in item.values():
                    if isinstance(v, str):
                        words.add(v.lower())
    # Grammar target may surface tokens (e.g., "in, on, under, behind, next to")
    for g in unit_data.get("target_grammar", []):
        if isinstance(g, str):
            # crude tokeniser: pull comma-separated items after a colon
            if ":" in g:
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
    ok(f"Title: {u.get('title')!r}, subtitle present: {bool(u.get('subtitle'))}")

    prep = get_prepare_unit(unit_num)
    prepare_words = all_prepare_words(prep) if prep else set()

    # Collect actual vocab taught across all lessons
    actual_vocab = set()
    for li, lesson in enumerate(lessons, 1):
        steps = lesson.get("steps", [])
        step_types = [s.get("type") for s in steps]
        if "warm_up" not in step_types:        err(f"L{li}: warm_up missing")
        if "vocabulary" not in step_types and "vocabulary_review" not in step_types:
            err(f"L{li}: vocabulary/review missing")
        if "vocab_games" not in step_types:    err(f"L{li}: vocab_games missing")
        if "micro_reading" not in step_types:  err(f"L{li}: micro_reading missing")
        if "grammar_focus" not in step_types and "grammar_review" not in step_types:
            err(f"L{li}: grammar_focus/review missing")
        if "grammar_games" not in step_types:  err(f"L{li}: grammar_games missing")
        if "listening" not in step_types:      err(f"L{li}: listening missing")
        if "production" not in step_types:     err(f"L{li}: production missing")
        if "exit_ticket" not in step_types:    err(f"L{li}: exit_ticket missing")

        for s in steps:
            t = s.get("type")
            # vocab
            if t == "vocabulary":
                items = s.get("items", [])
                for it in items:
                    if isinstance(it, dict) and it.get("word"):
                        actual_vocab.add(it["word"].lower())
                        if not it.get("definition"): warn(f"L{li} vocab '{it['word']}': no definition")
                        if not it.get("example_sentence"): warn(f"L{li} vocab '{it['word']}': no example_sentence")
                        # image_url check (post Pollinations populate)
            if t == "vocabulary_review":
                for v in s.get("items", []):
                    if isinstance(v, str):
                        actual_vocab.add(v.lower())
            # games
            if t in ("vocab_games", "grammar_games"):
                games = s.get("games", [])
                if len(games) != 3:
                    err(f"L{li} {t}: expected 3 games, got {len(games)}")
                game_types = [g.get("game_type") for g in games]
                if len(set(game_types)) != len(game_types):
                    warn(f"L{li} {t}: duplicate game types {game_types}")
                for g in games:
                    if not g.get("items"):
                        err(f"L{li} {t} {g.get('game_type')}: no items")
            # reading
            if t == "micro_reading":
                txt = s.get("text", "")
                wc = len(txt.split())
                if wc < 50:  warn(f"L{li} reading: only {wc} words (A1 typical 60-150)")
                if wc > 200: warn(f"L{li} reading: {wc} words (A1 typical 60-150)")
                qs = s.get("questions", [])
                if len(qs) < 3: err(f"L{li} reading: only {len(qs)} questions (need ≥3)")
                for q in qs:
                    if not (q.get("question") or q.get("question_text")):
                        err(f"L{li} reading question: text missing")
                    if not q.get("options"):
                        err(f"L{li} reading question: options missing")
                    if not q.get("correct_answer"):
                        err(f"L{li} reading question: correct_answer missing")
            # listening
            if t == "listening":
                at = s.get("audio_text", "")
                wc = len(at.split())
                if wc < 30: warn(f"L{li} listening: only {wc} words")
                if wc > 200: warn(f"L{li} listening: {wc} words")
                qs = s.get("questions", [])
                if len(qs) < 3: err(f"L{li} listening: only {len(qs)} questions")
            # grammar_focus
            if t == "grammar_focus":
                if not s.get("rule_pattern"): err(f"L{li} grammar_focus: no rule_pattern")
                if not s.get("explanation"): err(f"L{li} grammar_focus: no explanation")
                ex = s.get("examples", [])
                if len(ex) < 3: warn(f"L{li} grammar_focus: only {len(ex)} examples")
            # production
            if t == "production":
                if not s.get("prompt"): err(f"L{li} production: no prompt")
                if not s.get("prompts"): warn(f"L{li} production: no scaffold prompts")
            # exit_ticket
            if t == "exit_ticket":
                qs = s.get("questions", [])
                if len(qs) < 3: err(f"L{li} exit_ticket: only {len(qs)} questions")
                for q in qs:
                    if not (q.get("question") or q.get("question_text")):
                        err(f"L{li} exit_ticket: missing question text")
                    if not q.get("options"):
                        err(f"L{li} exit_ticket: missing options")

    # Prepare alignment coverage
    if prepare_words:
        in_prep = actual_vocab & prepare_words
        out_of_prep = actual_vocab - prepare_words
        coverage = len(in_prep) / len(prepare_words) * 100 if prepare_words else 0
        ok(f"Actual vocab: {len(actual_vocab)} unique. Prepare list: {len(prepare_words)}. Coverage: {coverage:.0f}%")
        if coverage < 70:
            warn(f"Prepare coverage <70%. Missing words: {sorted(prepare_words - actual_vocab)[:10]}")
        if out_of_prep:
            warn(f"Out-of-Prepare-scope words taught: {sorted(out_of_prep)}")


for n in (1, 2, 3):
    check_unit(n)

print(f"\n{'='*50}")
print(f"Total errors: {errors_total}")
print(f"Total warnings: {warnings_total}")
sys.exit(1 if errors_total else 0)
