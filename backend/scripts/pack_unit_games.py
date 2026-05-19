#!/usr/bin/env python3
"""
Pack each game step in a Stage 3 unit's enriched JSON with 2-3 sibling
game variants (Stage 1+2 pattern), instead of 1 game per step.

Reads:  backend/content/enriched/stage3_unit{NN}_enriched.json
Writes: same file, in-place, expanded game arrays.

Per lesson, after packing:
  step 3 (vocab_games):   3 games from VOCAB_POOL
  step 4 (vocab_games):   3 different games from VOCAB_POOL
  step 7 (grammar_games): 3 games from GRAMMAR_POOL
  step 8 (grammar_games): 3 different games from GRAMMAR_POOL

Game items reuse the lesson's existing vocab + grammar examples; we
just transform them into the shape each game_type expects.
"""

import argparse
import json
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent.parent

# Rotation tables — 12 unique game variants per lesson, no duplicates
# Each lesson uses 4 vocab variants + 4 grammar variants from these pools.
VOCAB_ROTATION = {
    1: [  # L1
        ["image_word_match", "listen_choose_picture", "look_write"],   # step 3
        ["unscramble", "flashcard_match", "listen_write"],             # step 4
    ],
    2: [  # L2
        ["word_race", "read_choose_picture", "memory_game"],           # step 3
        ["look_write", "flashcard_match", "image_word_match"],         # step 4
    ],
    3: [  # L3
        ["listen_write", "listen_choose_word", "flashcard_match"],     # step 3
        ["look_write", "memory_game", "unscramble"],                   # step 4
    ],
    4: [  # L4 review
        ["word_ladder", "cumulative_race", "flashcard_match"],         # step 3
        ["memory_game", "image_word_match", "look_write"],             # step 4
    ],
}

GRAMMAR_ROTATION = {
    1: [
        ["multiple_choice_grammar", "fill_blank", "true_false"],       # step 7
        ["word_order", "error_hunter", "audio_match"],                 # step 8
    ],
    2: [
        ["error_hunter", "true_false", "multiple_choice_grammar"],
        ["audio_match", "word_order", "fill_blank"],
    ],
    3: [
        ["fill_blank", "multiple_choice_grammar", "error_hunter"],
        ["transform_sentence", "word_order", "audio_match"],
    ],
    4: [
        ["true_false", "fill_blank", "multiple_choice_grammar"],
        ["sentence_builder_timed", "transform_sentence", "word_order"],
    ],
}


# ─── Item-shape transformers for each game type ───────────────────────────────

def shuffle_distractors(target, pool, n=3):
    """Pick n other vocab words as distractors from the lesson pool."""
    others = [w for w in pool if w["word"] != target["word"]]
    return others[:n]


def build_image_word_match(vocab):
    items = []
    for w in vocab[:6]:
        distractors = [
            {"word": d["word"], "emoji": d.get("image_emoji", "📦"), "image_url": d.get("image_url", "")}
            for d in shuffle_distractors(w, vocab, 3)
        ]
        items.append({
            "word": w["word"],
            "emoji": w.get("image_emoji", "📦"),
            "image_url": w.get("image_url", ""),
            "distractors": distractors,
        })
    return {"game_type": "image_word_match", "instruction": "Match each picture with the right word.", "items": items}


def build_listen_choose_picture(vocab):
    # Same shape as image_word_match — frontend listens then picks picture
    g = build_image_word_match(vocab)
    g["game_type"] = "listen_choose_picture"
    g["instruction"] = "Listen to the word and tap the right picture."
    return g


def build_read_choose_picture(vocab):
    g = build_image_word_match(vocab)
    g["game_type"] = "read_choose_picture"
    g["instruction"] = "Read the word and tap the right picture."
    return g


def build_listen_choose_word(vocab):
    items = []
    for w in vocab[:6]:
        opts = [w["word"]] + [d["word"] for d in shuffle_distractors(w, vocab, 3)]
        items.append({
            "audio_text": w["word"],
            "word": w["word"],
            "options": opts,
            "correct": w["word"],
        })
    return {"game_type": "listen_choose_word", "instruction": "Listen and tap the right word.", "items": items}


def build_look_write(vocab):
    items = [
        {"word": w["word"], "emoji": w.get("image_emoji", "📦"), "image_url": w.get("image_url", "")}
        for w in vocab[:6]
    ]
    return {"game_type": "look_write", "instruction": "Look at the picture and type the word.", "items": items}


def build_listen_write(vocab):
    items = [{"audio_text": w["word"], "answer": w["word"]} for w in vocab[:6]]
    return {"game_type": "listen_write", "instruction": "Listen to the word, then type it.", "items": items}


def build_unscramble(vocab):
    items = []
    for w in vocab[:6]:
        word = w["word"].replace(" ", "")
        scrambled = "".join(sorted(word.upper(), key=lambda c: (ord(c) * 31 + 7) % 13))
        if scrambled == word.upper() and len(word) > 2:
            scrambled = word[::-1].upper()
        items.append({
            "scrambled": scrambled,
            "answer": word.upper(),
            "hint": w.get("definition", "")[:60],
        })
    return {"game_type": "unscramble", "instruction": "Unscramble the letters.", "items": items}


def build_flashcard_match(vocab):
    items = [{"word": w["word"], "emoji": w.get("image_emoji", "📦"), "image_url": w.get("image_url", "")} for w in vocab[:6]]
    return {"game_type": "flashcard_match", "instruction": "Match pairs: word ↔ picture.", "items": items}


def build_memory_game(vocab):
    items = [
        {"word": w["word"], "emoji": w.get("image_emoji", "📦"), "image_url": w.get("image_url", "")}
        for w in vocab[:6]
    ]
    return {"game_type": "memory_game", "instruction": "Flip the cards and find the pairs.", "items": items}


def _picture_options(w, vocab, n):
    """Build a list of {emoji, image_url, word} option dicts (correct first)."""
    pool = [w] + shuffle_distractors(w, vocab, n)
    return [
        {
            "emoji": x.get("image_emoji", "📦"),
            "image_url": x.get("image_url", ""),
            "word": x["word"],
        }
        for x in pool
    ]


def build_word_race(vocab):
    items = []
    for w in vocab[:6]:
        opts = _picture_options(w, vocab, 3)
        correct = opts[0]["emoji"]
        items.append({
            "prompt": w["word"],
            "correct_emoji": correct,
            "correct_image_url": w.get("image_url", ""),
            "options": [o["emoji"] for o in opts],
            "options_full": opts,  # renderer can read image_url here
        })
    return {"game_type": "word_race", "instruction": "60 seconds! Tap the right picture for each word.", "time_limit_seconds": 60, "items": items}


def build_word_ladder(vocab):
    items = []
    for w in vocab[:5]:
        opts = [w["word"]] + [d["word"] for d in shuffle_distractors(w, vocab, 2)]
        items.append({"prompt": f"Which word matches: {w.get('definition','')[:60]}", "options": opts, "correct": w["word"]})
    return {"game_type": "word_ladder", "instruction": "Climb the ladder! Choose the right word for each step.", "items": items}


def build_cumulative_race(vocab):
    g = build_word_race(vocab)
    g["game_type"] = "cumulative_race"
    g["time_limit_seconds"] = 90
    g["instruction"] = "90 seconds! Race through all the words you learned."
    # Use up to 10 items
    g["items"] = []
    for w in vocab[:10]:
        opts = _picture_options(w, vocab, 3)
        g["items"].append({
            "prompt": w["word"],
            "correct_emoji": opts[0]["emoji"],
            "correct_image_url": w.get("image_url", ""),
            "options": [o["emoji"] for o in opts],
            "options_full": opts,
        })
    return g


VOCAB_BUILDERS = {
    "image_word_match": build_image_word_match,
    "listen_choose_picture": build_listen_choose_picture,
    "read_choose_picture": build_read_choose_picture,
    "listen_choose_word": build_listen_choose_word,
    "look_write": build_look_write,
    "listen_write": build_listen_write,
    "unscramble": build_unscramble,
    "flashcard_match": build_flashcard_match,
    "memory_game": build_memory_game,
    "word_race": build_word_race,
    "word_ladder": build_word_ladder,
    "cumulative_race": build_cumulative_race,
}


# ─── Grammar item synthesis from grammar_focus.examples ──────────────────────

BE_FORMS = ["am", "is", "are"]
HAVE_FORMS = ["have", "has", "haven't", "hasn't", "'ve", "'s"]
# Verb tokens that can be blanked / swapped for the synth fallback. The
# extended set lets pack_unit_games handle Unit 4 ('have got') and beyond
# without falling back to empty grammar packs.
TARGET_VERB_TOKENS = BE_FORMS + ["have", "has", "haven't", "hasn't"]


def _options_for(verb):
    """Distractor set for a target verb token. BE-forms get the BE_FORMS
    set; have/has variants get the have-family set so distractors stay in
    the same paradigm."""
    v = (verb or "").lower().strip()
    if v in HAVE_FORMS:
        return ["have", "has", "haven't", "hasn't"]
    return BE_FORMS

def _split_words(sent):
    return re.findall(r"[A-Za-z']+|[.?!,]", sent)

def synthesize_grammar_items(examples):
    """Generate per-game-type item lists from grammar example sentences."""
    out = {
        "multiple_choice_grammar": [],
        "fill_blank": [],
        "true_false": [],
        "error_hunter": [],
        "word_order": [],
    }
    for idx, ex in enumerate(examples):
        clean = ex.strip()
        if not clean or clean.startswith("("):
            continue
        words = clean.split()
        # MCQ + fill_blank: blank a be-form if present
        be_at = next((i for i, w in enumerate(words) if w.lower().strip(".,!?") in TARGET_VERB_TOKENS), -1)
        if be_at >= 0:
            be_word = words[be_at].strip(".,!?")
            blanked = " ".join(["___" if i == be_at else w for i, w in enumerate(words)])
            mcq_item = {"sentence": blanked, "options": list(_options_for(be_word)), "correct": be_word.lower()}
            out["multiple_choice_grammar"].append(mcq_item)
            out["fill_blank"].append({"sentence": blanked, "answer": be_word.lower(), "options": list(_options_for(be_word))})
        # true_false: alternate true / false (false = swap be-form)
        if be_at >= 0 and idx % 2 == 1:
            be_word = words[be_at].strip(".,!?").lower()
            wrong = next((b for b in _options_for(be_word) if b != be_word), "is")
            twisted = " ".join([wrong if i == be_at else w for i, w in enumerate(words)])
            out["true_false"].append({
                "sentence": twisted,
                "correct": "false",
                "is_correct": False,  # frontend reads boolean form
                "corrected": clean,
            })
        else:
            out["true_false"].append({
                "sentence": clean,
                "correct": "true",
                "is_correct": True,
            })
        # error_hunter: deliberately wrong be-form
        if be_at >= 0:
            be_word = words[be_at].strip(".,!?").lower()
            wrong = next((b for b in _options_for(be_word) if b != be_word), "is")
            twisted_words = list(words)
            twisted_words[be_at] = wrong
            out["error_hunter"].append({
                "sentence": " ".join(twisted_words),
                "errorWord": wrong,
                "alternateErrors": [],
            })
        # word_order: drop punctuation, split words
        clean_words = [w.strip(".,!?") for w in words if w.strip(".,!?")]
        if 3 <= len(clean_words) <= 8:
            out["word_order"].append({"words": clean_words, "correct_sentence": clean.rstrip(".") + "."})
    return out


# ─── Grammar builders use the lesson's existing grammar items if present ──────

def build_multiple_choice_grammar(grammar_examples, fallback_items):
    """Reuse fallback_items if they have {sentence, options, correct} shape."""
    if fallback_items and all("options" in it and "correct" in it for it in fallback_items[:1]):
        items = [it for it in fallback_items if "sentence" in it][:6]
        return {"game_type": "multiple_choice_grammar", "instruction": "Choose the correct word.", "items": items}
    # Otherwise build from examples
    return {"game_type": "multiple_choice_grammar", "instruction": "Choose the correct word.", "items": []}


def build_fill_blank(fallback_items):
    items = []
    for it in fallback_items:
        if "sentence" in it:
            sent = it["sentence"]
            # If it already has a single ___ blank, reuse
            if "___" in sent:
                items.append({"sentence": sent, "answer": it.get("correct") or it.get("answer") or "", "options": it.get("options")})
    return {"game_type": "fill_blank", "instruction": "Fill the blank with the right word.", "items": items[:6]}


def build_true_false(grammar_examples):
    """Convert grammar examples into T/F items: half correct, half twisted."""
    items = []
    for i, ex in enumerate(grammar_examples[:6]):
        if i % 2 == 0:
            items.append({"sentence": ex, "correct": "true"})
        else:
            # Twist: make a known-wrong variant
            wrong = ex.replace(" is ", " are ", 1) if " is " in ex else ex.replace(" are ", " is ", 1)
            if wrong == ex:
                wrong = ex.replace(" am ", " is ", 1)
            items.append({"sentence": wrong, "correct": "false"})
    return {"game_type": "true_false", "instruction": "Is the grammar correct?", "items": items}


def build_error_hunter(fallback_items):
    """Convert error_hunter fallback or generate from examples."""
    items = []
    for it in fallback_items:
        if "wrong_word" in it:
            items.append({"sentence": it["sentence"], "errorWord": it["wrong_word"], "alternateErrors": []})
        elif "errorWord" in it:
            items.append(it)
    return {"game_type": "error_hunter", "instruction": "Tap the wrong word.", "items": items[:6]}


def build_word_order(fallback_items, more_words):
    items = list(fallback_items)[:6]
    if not items:
        # Build from more_words pairs if provided as list of (words, correct)
        for ws, cs in more_words:
            items.append({"words": ws, "correct_sentence": cs})
    return {"game_type": "word_order", "instruction": "Drag the words to build the sentence.", "items": items[:6]}


def build_audio_match(fallback_items):
    items = []
    for it in fallback_items:
        if "audio_text" in it and "options" in it and "correct" in it:
            items.append(it)
    return {"game_type": "audio_match", "instruction": "Listen and tap the sentence you hear.", "items": items[:6]}


def build_transform_sentence(fallback_items):
    items = [it for it in fallback_items if "sentence" in it and "answer" in it][:6]
    return {"game_type": "transform_sentence", "instruction": "Transform the sentence.", "items": items}


def build_sentence_builder_timed(fallback_items):
    items = [it for it in fallback_items if "words" in it and "correct_sentence" in it][:6]
    return {"game_type": "sentence_builder_timed", "instruction": "45 seconds! Build each sentence.", "time_limit_seconds": 45, "items": items}


GRAMMAR_BUILDERS = {
    "multiple_choice_grammar": build_multiple_choice_grammar,
    "fill_blank": build_fill_blank,
    "true_false": build_true_false,
    "error_hunter": build_error_hunter,
    "word_order": build_word_order,
    "audio_match": build_audio_match,
    "transform_sentence": build_transform_sentence,
    "sentence_builder_timed": build_sentence_builder_timed,
}


def pack_lesson(lesson, lesson_num):
    """Mutate the lesson's steps in place: pack step 3, 4 with vocab games and 7, 8 with grammar games."""
    # Gather vocab from step 2
    vocab = []
    for s in lesson["steps"]:
        if s.get("type") == "vocabulary":
            vocab = s.get("items", [])
            break
        if s.get("type") == "vocabulary_review":
            # Review lesson — vocab pool is the list of strings; we need to expand to objects with image_emoji
            # Use a thin fallback shape; the renderer will resolve via vocab_pool server-side anyway.
            vocab = []
            for w in s.get("items", []):
                if isinstance(w, str):
                    vocab.append({"word": w, "image_emoji": "📦"})
                elif isinstance(w, dict):
                    vocab.append(w)
            break

    if not vocab:
        return

    # Existing grammar examples — from grammar_focus.examples OR
    # grammar_review.patterns (review lessons store patterns, not examples).
    examples = []
    for s in lesson["steps"]:
        if s.get("type") == "grammar_focus":
            examples = s.get("examples", []) or []
            break
        if s.get("type") == "grammar_review":
            # Convert pattern strings into example sentences using vocab pool
            # so synth has material to work with.
            patterns = s.get("patterns", []) or []
            examples = [p for p in patterns if isinstance(p, str)]
            # Add some canonical be-verb examples to seed synth
            sample_be = [
                "I am Vietnamese.",
                "She is my friend.",
                "He is my brother.",
                "We are classmates.",
                "They are from different countries.",
                "Mai is nine.",
                "I am not American.",
                "She isn't from Brazil.",
            ]
            examples = examples + sample_be
            break

    # Existing grammar game items (we'll reuse them across game types where shape matches)
    existing_items_step7 = []
    existing_items_step8 = []
    word_order_seed = []
    audio_match_seed = []
    transform_seed = []
    builder_timed_seed = []
    for s in lesson["steps"]:
        st = s.get("type")
        if st == "grammar_games":
            for g in s.get("games", []):
                existing_items_step7.extend(g.get("items", []))
        if st == "grammar_game":
            existing_items_step8.extend(s.get("items", []))
            mode = s.get("mode")
            if mode == "word_order":
                word_order_seed.extend(s.get("items", []))
            elif mode == "audio_match":
                audio_match_seed.extend(s.get("items", []))
            elif mode == "transform_sentence":
                transform_seed.extend(s.get("items", []))
            elif mode == "sentence_builder_timed":
                builder_timed_seed.extend(s.get("items", []))

    rot_v = VOCAB_ROTATION.get(lesson_num, VOCAB_ROTATION[1])
    rot_g = GRAMMAR_ROTATION.get(lesson_num, GRAMMAR_ROTATION[1])

    # Build new game packs
    def vocab_pack(slug_list):
        return [VOCAB_BUILDERS[s](vocab) for s in slug_list if s in VOCAB_BUILDERS]

    synth = synthesize_grammar_items(examples)

    def grammar_pack(slug_list):
        out = []
        for slug in slug_list:
            if slug == "multiple_choice_grammar":
                # Harvest only sentence-shaped MCQ items; audio_match items
                # also have options+correct but their renderer expects
                # `sentence`, so {audio_text,...} entries crash MCQ.
                harvested = [
                    it for it in existing_items_step7
                    if "sentence" in it and "options" in it and "correct" in it
                    and "audio_text" not in it
                ]
                items = harvested + synth["multiple_choice_grammar"]
                g = {"game_type": "multiple_choice_grammar", "instruction": "Choose the correct word.", "items": items[:6]}
            elif slug == "fill_blank":
                items = build_fill_blank(existing_items_step7 + existing_items_step8)["items"] + synth["fill_blank"]
                g = {"game_type": "fill_blank", "instruction": "Fill the gap.", "items": items[:6]}
            elif slug == "true_false":
                g = {"game_type": "true_false", "instruction": "Is the grammar correct?", "items": synth["true_false"][:6]}
            elif slug == "error_hunter":
                items = build_error_hunter(existing_items_step7)["items"] + synth["error_hunter"]
                g = {"game_type": "error_hunter", "instruction": "Tap the wrong word.", "items": items[:6]}
            elif slug == "word_order":
                items = list(word_order_seed) + synth["word_order"]
                g = {"game_type": "word_order", "instruction": "Drag the words.", "items": items[:6]}
            elif slug == "audio_match":
                items = list(audio_match_seed) or [
                    {"audio_text": it.get("correct_sentence") or "", "options": [it.get("correct_sentence") or ""], "correct": it.get("correct_sentence") or ""}
                    for it in word_order_seed or []
                ]
                if not items:
                    # Build from examples if needed
                    items = []
                    for ex in examples[:5]:
                        if ex and not ex.startswith("("):
                            items.append({"audio_text": ex.strip(), "options": [ex.strip()], "correct": ex.strip()})
                g = {"game_type": "audio_match", "instruction": "Listen and tap the sentence you hear.", "items": items[:6]}
            elif slug == "transform_sentence":
                items = list(transform_seed)
                # Synth fallback: turn each affirmative example into a question
                if len(items) < 3:
                    for ex in examples[:6]:
                        if not ex or ex.startswith("("):
                            continue
                        clean = ex.strip().rstrip(".?!,")
                        # Naive: swap "X is Y" → "Is X Y?"; "X are Y" → "Are X Y?"
                        m = re.match(r"^([A-Za-z']+)\s+(is|are|am)\s+(.+)$", clean)
                        if m:
                            subject, verb, rest = m.group(1), m.group(2).capitalize(), m.group(3)
                            items.append({
                                "sentence": clean + ".",
                                "task": "Make it a question.",
                                "answer": f"{verb} {subject.lower()} {rest}?".capitalize(),
                            })
                g = {"game_type": "transform_sentence", "instruction": "Transform the sentence.", "items": items[:6]}
            elif slug == "sentence_builder_timed":
                items = list(builder_timed_seed or word_order_seed) + synth["word_order"]
                g = {"game_type": "sentence_builder_timed", "instruction": "45 seconds! Build each sentence.", "time_limit_seconds": 45, "items": items[:6]}
            else:
                continue
            if g.get("items"):
                out.append(g)
        return out

    # Pedagogy call 2026-05-19 (Aga): max 4 mini-games per step, ideal 3.
    # We now ship just the first rotation row (3 games) per game step.
    # Each lesson's rotation table starts with a different lineup, so
    # variety across lessons is preserved without burning kids out on a
    # 6-pack. The second row stays in the table for future use but is not
    # packed into shipped content.
    new_step_vocab = {
        "step": 3,
        "type": "vocab_games",
        "games": vocab_pack(rot_v[0]),
    }
    new_step_grammar = {
        "step": 7,
        "type": "grammar_games",
        "games": grammar_pack(rot_g[0]),
    }

    # Walk original steps. Replace step 3 with the merged vocab pack,
    # replace step 7 with the merged grammar pack, drop the old step 4
    # and step 8 entirely (their games moved into 3/7).
    new_steps = []
    for s in lesson["steps"]:
        st_num = s.get("step")
        if st_num == 3:
            new_steps.append(new_step_vocab)
        elif st_num == 4:
            continue
        elif st_num == 7:
            new_steps.append(new_step_grammar)
        elif st_num == 8:
            continue
        else:
            new_steps.append(s)
    # Re-number steps so `step` is contiguous after removing 4 and 8.
    for i, s in enumerate(new_steps):
        s["step"] = i + 1
    lesson["steps"] = new_steps


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--unit", required=True, help="Unit number (e.g. 01, 02)")
    args = parser.parse_args()
    path = REPO_ROOT / "backend" / "content" / "enriched" / f"stage3_unit{args.unit}_enriched.json"
    if not path.exists():
        print(f"ERROR: {path} not found", file=sys.stderr)
        sys.exit(1)
    data = json.loads(path.read_text())
    for unit in data.get("units", []):
        for lesson in unit.get("lessons", []):
            pack_lesson(lesson, lesson.get("lesson_num", 1))
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
    print(f"✓ Packed games into {path.name}")

    # Validate counts
    for unit in data.get("units", []):
        for lesson in unit.get("lessons", []):
            counts = {}
            for s in lesson["steps"]:
                t = s.get("type")
                if t in ("vocab_games", "grammar_games"):
                    counts[f"step{s['step']}"] = len(s.get("games", []))
            print(f"  L{lesson['lesson_num']}: " + ", ".join(f"{k}={v}games" for k, v in counts.items()))


if __name__ == "__main__":
    main()
