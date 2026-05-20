#!/usr/bin/env python3
"""
Fix color-word distractor leakage in vocab games.

Aga 2026-05-21 (Image #80): on stage_2_unit_02_lesson_03 "New Colors",
the read_choose_picture distractors for `grey` were `silver` (⚙️), `cloud`
(☁️), `rock` (🪨) — all grey-tinted objects, so the kid can't tell which
one is "grey". Same problem hits any color word whose distractors are
non-color objects that happen to share the colour.

This script rewrites distractors for color-word items so the kid picks
between COLOR SWATCHES (other colors), not random objects. We also
overwrite the target item's emoji + image with a clean colour swatch so
the surface reads "match the word `grey` to the grey square" rather than
"match `grey` to ambiguous grey-ish object".

Run:  python backend/scripts/fix_color_distractors.py
Then: trigger /api/admin/content/merge-and-seed (or push for auto-seed).
"""
from __future__ import annotations
import json
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent.parent
ENRICHED = REPO / "backend" / "content" / "enriched"

# Canonical colour-swatch emojis. These are the ONLY emojis we'll use for
# colour words across games, so distractor and target read consistently.
COLOR_EMOJI = {
    "red": "🟥",
    "orange": "🟧",
    "yellow": "🟨",
    "green": "🟩",
    "blue": "🟦",
    "purple": "🟪",
    "pink": "🩷",
    "brown": "🟫",
    "black": "⬛",
    "white": "⬜",
    "grey": "🩶",
    "gray": "🩶",
    "silver": "🩶",  # silver shown as grey swatch — close enough at A1 level
    "gold": "🟨",    # likewise
    "rainbow": "🌈",
}

COLOR_SET = set(COLOR_EMOJI.keys())


def is_color_lesson(lesson: dict) -> bool:
    """True if at least 2 vocab words in the lesson are colour names."""
    for step in lesson.get("steps", []):
        if step.get("type") == "vocabulary":
            words = [w.get("word", "").lower() for w in (step.get("items") or step.get("words") or [])]
            return sum(1 for w in words if w in COLOR_SET) >= 2
    return False


def collect_lesson_colors(lesson: dict) -> list[str]:
    """All colour words taught in this lesson (lowercased, deduped, in order)."""
    for step in lesson.get("steps", []):
        if step.get("type") == "vocabulary":
            words = [w.get("word", "").lower() for w in (step.get("items") or step.get("words") or [])]
            return [w for w in words if w in COLOR_SET]
    return []


def color_pool(lesson_colors: list[str]) -> list[dict]:
    """Build distractor pool from in-lesson colours. Fallback to a global
    7-colour rainbow if the lesson has too few."""
    pool = [{"word": c, "emoji": COLOR_EMOJI[c]} for c in lesson_colors]
    backup = ["red", "blue", "green", "yellow", "purple", "orange", "pink", "brown", "black", "white"]
    for c in backup:
        if not any(p["word"] == c for p in pool):
            pool.append({"word": c, "emoji": COLOR_EMOJI[c]})
        if len(pool) >= 8:
            break
    return pool


def fix_vocabulary_step(step: dict, lesson_colors: list[str]) -> int:
    """Normalize the emoji on color-word vocab items to a clean swatch."""
    changed = 0
    items = step.get("items") or step.get("words") or []
    for it in items:
        w = it.get("word", "").lower()
        if w in COLOR_SET:
            want = COLOR_EMOJI[w]
            if it.get("image_emoji") != want:
                it["image_emoji"] = want
                changed += 1
            # leave image_url alone — Codex/FLUX images of colour swatches
            # are fine; the renderer falls back to emoji if image_url 404s
    return changed


def fix_game_item(it: dict, target_word: str, pool: list[dict]) -> int:
    """Rewrite distractors of one color-word item to other colours."""
    changed = 0
    want_emoji = COLOR_EMOJI[target_word]
    if it.get("emoji") != want_emoji:
        it["emoji"] = want_emoji
        changed += 1
    distractors = it.get("distractors")
    if isinstance(distractors, list) and distractors and isinstance(distractors[0], dict):
        new_distractors = []
        seen = {target_word}
        for p in pool:
            if p["word"] in seen:
                continue
            seen.add(p["word"])
            new_distractors.append({"word": p["word"], "emoji": p["emoji"], "image_url": ""})
            if len(new_distractors) >= len(distractors):
                break
        # If pool too small, leave extras out
        if new_distractors != distractors:
            it["distractors"] = new_distractors
            changed += 1
    # options / options_full (word_race shape)
    options_full = it.get("options_full")
    if isinstance(options_full, list) and options_full:
        new_opts = [{"word": target_word, "emoji": want_emoji, "image_url": it.get("image_url", "")}]
        for p in pool:
            if p["word"] == target_word:
                continue
            new_opts.append({"word": p["word"], "emoji": p["emoji"], "image_url": ""})
            if len(new_opts) >= len(options_full):
                break
        # Don't bother shuffling here — pack_unit_games shuffles on regen,
        # and the renderer (WordRace) has belt-and-suspenders useMemo shuffle.
        it["options_full"] = new_opts
        it["options"] = [o["emoji"] for o in new_opts]
        it["correct_emoji"] = want_emoji
        changed += 1
    return changed


def fix_game_step(step: dict, pool: list[dict]) -> int:
    games = step.get("games") if step.get("games") else [step]
    changed = 0
    for g in games:
        for it in g.get("items", []):
            target = (it.get("word") or it.get("prompt") or "").lower()
            if target in COLOR_SET:
                changed += fix_game_item(it, target, pool)
    return changed


def main() -> None:
    total = 0
    touched_files: list[str] = []
    for fp in sorted(ENRICHED.glob("stage[123]_*.json")):
        data = json.load(open(fp))
        file_changed = 0
        for u in data.get("units", []):
            for l in u.get("lessons", []):
                if not is_color_lesson(l):
                    continue
                lesson_colors = collect_lesson_colors(l)
                pool = color_pool(lesson_colors)
                for s in l.get("steps", []):
                    if s.get("type") == "vocabulary":
                        file_changed += fix_vocabulary_step(s, lesson_colors)
                    elif s.get("type") in ("vocab_games", "vocab_practice"):
                        file_changed += fix_game_step(s, pool)
        if file_changed:
            with open(fp, "w") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
                f.write("\n")
            print(f"  ✏️  {fp.name}: {file_changed} edits")
            touched_files.append(fp.name)
            total += file_changed
    print(f"\nDone. {total} edits across {len(touched_files)} files.")
    if touched_files:
        print("Next: push + Railway auto-seed, or hit /api/admin/content/merge-and-seed.")


if __name__ == "__main__":
    main()
