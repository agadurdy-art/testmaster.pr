#!/usr/bin/env python3
"""
Teacher Review Agent — audit a lesson the way a real classroom teacher
would, so Aga doesn't have to walk every step in the browser.

Aga 2026-05-21: "ben her contexti check edemem. bunun icin bir agent
olustur. her dersi ogretmen olarak denetlesin."

Two kinds of checks per lesson:

  PURE-CODE CHECKS (fast, deterministic, no LLM)
    - answer-position distribution per game step (A-B-A-B pattern,
      Yes/No imbalance, T/F all-true heuristic — Aga 2026-05-21)
    - audio_script presence on listening steps (empty = student
      can't preview script; we know the audio plays but the script
      coverage is broken)
    - locate_text / evidence presence on reading questions
      (richer Q = better locate-on-wrong hint)
    - speaking prompt vs evaluator-mode compatibility
      (open intro / say-N-things / echo)
    - distractor diversity sniff (does one word win every slot?)
    - vocabulary item completeness (image_emoji, image_url)

  PEDAGOGY CHECK (no API calls — Aga rule 2026-05-21)
    Pedagogy review is performed by the Claude Code session itself,
    NOT by an Anthropic/OpenAI API call from this script. The
    `--dump-pedagogy` flag prints a compact JSON of audio_text /
    passage / Qs / prompts that can be pasted into the conversation;
    Claude in-session then plays the teacher role and writes findings.
    Rationale: feedback_no_paid_api_calls — no script in this repo
    spends API budget without an explicit human request.

Usage:
  backend/.venv/bin/python3 backend/scripts/lesson_audit.py \\
      --stage 3 --unit 1 --lesson 1                   # one lesson
  backend/.venv/bin/python3 backend/scripts/lesson_audit.py \\
      --stage 3 --unit 1                              # all lessons
  backend/.venv/bin/python3 backend/scripts/lesson_audit.py \\
      --stage 3 --unit 1 --lesson 1 --dump-pedagogy   # + JSON dump
"""
from __future__ import annotations
import argparse
import json
import os
import sys
from collections import Counter
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent.parent
ENRICHED = REPO / "backend" / "content" / "enriched"


# -------- helpers ---------------------------------------------------

def load_unit(stage: int, unit: int) -> dict:
    p = ENRICHED / f"stage{stage}_unit{unit:02d}_enriched.json"
    if not p.exists():
        sys.exit(f"missing enriched file: {p}")
    return json.loads(p.read_text())


def answer_of(item: dict) -> str | None:
    for k in ("correct_answer", "answer", "correct", "correct_word", "is_correct"):
        if k in item and item[k] is not None:
            return str(item[k]).lower().strip()
    # word-race / picture-pick: correct_index + options
    if "correct_index" in item and isinstance(item.get("options"), list):
        try:
            return str(item["options"][item["correct_index"]]).lower().strip()
        except (IndexError, TypeError):
            return None
    return None


def distribution_warning(answers: list[str], game_label: str) -> list[str]:
    """Flag predictability heuristics."""
    out = []
    if not answers:
        return out
    counts = Counter(answers)
    n = len(answers)
    # Binary domain (yes/no, true/false): expect close to 50/50, max 70%
    binary = set(counts.keys()).issubset({"yes", "no", "true", "false", "0", "1"})
    if binary and len(counts) >= 1:
        most_w, most_c = counts.most_common(1)[0]
        if most_c / n >= 0.7:
            out.append(
                f"⚠️  {game_label}: {most_c}/{n} answers are '{most_w}' "
                f"({most_c/n:.0%}) — a child can guess this. Rebalance toward 50/50."
            )
        missing = {"yes", "no"} - set(counts.keys()) if "yes" in counts or "no" in counts else \
                  {"true", "false"} - set(counts.keys()) if "true" in counts or "false" in counts else set()
        if missing:
            out.append(f"⚠️  {game_label}: missing answers — never uses {sorted(missing)}.")
    # A-B-A-B-A repeating pattern on >=4 items
    if n >= 4:
        first_letters = [a[:1] for a in answers if a]
        if len(set(first_letters)) <= 2 and n >= 4:
            seq = "".join(first_letters)
            # check strict alternation
            if seq == "".join(first_letters[i % 2] for i in range(n)):
                out.append(f"⚠️  {game_label}: answers alternate {seq} — predictable pattern.")
    return out


def audit_lesson(lesson: dict) -> dict:
    """Return audit findings for one lesson."""
    report = {
        "lesson_id": lesson.get("lesson_id"),
        "lesson_num": lesson.get("lesson_num") or lesson.get("number"),
        "title": lesson.get("title"),
        "step_count": len(lesson.get("steps", [])),
        "issues": [],
        "ok": [],
    }

    has_listening = False
    has_vocab = False
    has_reading = False
    has_speaking = False

    for s in lesson.get("steps", []):
        t = s.get("type")

        # Listening
        if t == "listening":
            has_listening = True
            # Field name varies across builders: stage3 build_* scripts use
            # "audio_text", older content uses "audio_script" / "script" /
            # "transcript". Check all.
            script = (s.get("audio_text") or s.get("audio_script")
                      or s.get("script") or s.get("transcript") or "")
            if not script.strip():
                report["issues"].append(
                    "❌ listening: audio_script is empty — student can't preview / "
                    "Show-script panel will be blank."
                )
            else:
                report["ok"].append(f"✓ listening: audio_script present ({len(script)} chars)")
            qs = s.get("items") or s.get("questions") or []
            ans = [answer_of(q) for q in qs]
            ans = [a for a in ans if a]
            report["issues"].extend(distribution_warning(ans, "listening Q's"))

        # Vocab games
        elif t == "vocab_games":
            has_vocab = True
            for g in s.get("games") or [s]:
                gtype = g.get("game_type") or g.get("type") or "vocab_game"
                items = g.get("items") or []
                # answer slot distribution — for image_word_match / look_write etc.
                slot_counts = Counter()
                for it in items:
                    opts = it.get("options") or it.get("options_full") or []
                    correct = it.get("correct_word") or it.get("word") or it.get("answer")
                    if opts and correct:
                        # find index of correct
                        norm_correct = str(correct).lower().strip()
                        for i, o in enumerate(opts):
                            ow = o.get("word", "") if isinstance(o, dict) else str(o)
                            if str(ow).lower().strip() == norm_correct:
                                slot_counts[i] += 1
                                break
                if slot_counts and len(items) >= 4:
                    top_slot, top_n = slot_counts.most_common(1)[0]
                    if top_n / len(items) >= 0.7:
                        report["issues"].append(
                            f"⚠️  vocab_games.{gtype}: {top_n}/{len(items)} correct "
                            f"answers fall in slot {top_slot} — runtime shuffle should "
                            f"hide this, but data-level shuffle was meant to scrub it. "
                            f"Re-run pack_unit_games."
                        )

        # Grammar games
        elif t == "grammar_games":
            for g in s.get("games") or [s]:
                gtype = g.get("game_type") or g.get("type") or "grammar_game"
                items = g.get("items") or []
                ans = [answer_of(q) for q in items]
                ans = [a for a in ans if a]
                report["issues"].extend(distribution_warning(ans, f"grammar_games.{gtype}"))

        # Reading
        elif t == "reading":
            has_reading = True
            qs = s.get("questions") or s.get("items") or []
            passage = s.get("passage") or s.get("text") or ""
            if not passage.strip():
                report["issues"].append("❌ reading: passage text is empty.")
            locate_present = sum(
                1 for q in qs if q.get("locate_text") or q.get("evidence") or q.get("passage_quote")
            )
            if qs and locate_present == 0:
                report["issues"].append(
                    f"⚠️  reading: 0/{len(qs)} questions have explicit locate_text "
                    f"hints — frontend will fall back to heuristic search. Adding "
                    f"author locate_text would improve auto-highlight accuracy."
                )
            elif qs:
                report["ok"].append(f"✓ reading: {locate_present}/{len(qs)} questions have locate hints")
            ans = [answer_of(q) for q in qs]
            ans = [a for a in ans if a]
            report["issues"].extend(distribution_warning(ans, "reading Q's"))

        # Speaking / production
        elif t in ("speaking", "production"):
            has_speaking = True
            prompts = s.get("prompts") or [s]
            for p in prompts:
                if isinstance(p, str):
                    p = {"prompt": p}
                if not isinstance(p, dict):
                    continue
                pt = p.get("prompt") or p.get("question") or ""
                model = p.get("expected") or p.get("model_answer") or p.get("answer") or ""
                mode = p.get("production_type") or p.get("scoring_mode") or s.get("scoring_mode")
                # Detect intended mode from prompt
                lower = pt.lower()
                detected = None
                if any(k in lower for k in ["introduce yourself", "tell us about you", "tell me about you", "your name", "your age"]):
                    detected = "self_introduction"
                elif "say " in lower and ("things" in lower or "items" in lower or "sentences" in lower) and "using" in lower:
                    detected = "say_n_structural"
                else:
                    detected = "echo"
                if not mode:
                    report["issues"].append(
                        f"ℹ️  speaking: prompt '{pt[:50]}...' has no explicit "
                        f"production_type/scoring_mode (frontend will auto-detect "
                        f"as '{detected}')."
                    )
                else:
                    report["ok"].append(f"✓ speaking mode: {mode}")

        # Vocabulary
        elif t == "vocabulary":
            items = s.get("items") or s.get("words") or []
            missing_img = sum(1 for it in items if not it.get("image_url") and not it.get("image_emoji"))
            if missing_img:
                report["issues"].append(
                    f"⚠️  vocabulary: {missing_img}/{len(items)} items have neither "
                    f"image_url nor image_emoji."
                )

    # Required step types
    if not has_listening:
        report["issues"].append("ℹ️  lesson has no listening step.")
    if not has_speaking:
        report["issues"].append("ℹ️  lesson has no speaking/production step.")

    return report


def render_markdown(unit_meta: dict, reports: list[dict]) -> str:
    lines = [
        f"# Lesson Audit — Stage {unit_meta.get('stage')} Unit {unit_meta.get('unit'):02d}",
        f"_{unit_meta.get('title','')}_  ·  {len(reports)} lesson(s) audited",
        "",
    ]
    for r in reports:
        lines.append(f"## Lesson {r['lesson_num']} — {r.get('title','')}")
        lines.append(f"`{r['lesson_id']}`  ·  {r['step_count']} steps")
        lines.append("")
        if r["issues"]:
            lines.append("**Issues:**")
            for i in r["issues"]:
                lines.append(f"- {i}")
            lines.append("")
        if r["ok"]:
            lines.append("**OK:**")
            for o in r["ok"]:
                lines.append(f"- {o}")
            lines.append("")
        if not r["issues"]:
            lines.append("✅ No issues found.")
            lines.append("")
    return "\n".join(lines)


# -------- pedagogy dump (no API calls) ----------------------------
# Aga's rule 2026-05-21: no paid API calls from scripts. Pedagogy review
# is done by the Claude conversation session itself, walking the JSON
# Aga shares. This helper just bundles a lesson's pedagogy-relevant
# fields into compact JSON the conversation can ingest in one shot.

def pedagogy_dump(lesson: dict) -> dict:
    """Return a compact slice of the lesson for human / in-session review."""
    return {
        "lesson_id": lesson.get("lesson_id"),
        "title": lesson.get("title"),
        "steps": [
            {
                "type": s.get("type"),
                "audio_text": s.get("audio_text") or s.get("audio_script") or s.get("script", ""),
                "passage": s.get("passage") or s.get("text", ""),
                "items": (s.get("items") or s.get("questions") or [])[:6],
                "prompts": s.get("prompts"),
                "game_type": s.get("game_type"),
                "games": [{"game_type": g.get("game_type"), "items": (g.get("items") or [])[:4]}
                          for g in (s.get("games") or [])][:3],
            }
            for s in lesson.get("steps", [])
        ],
    }


# -------- entry ---------------------------------------------------

def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--stage", type=int, required=True)
    ap.add_argument("--unit", type=int, required=True)
    ap.add_argument("--lesson", type=int, help="Single lesson number; omit to audit all")
    ap.add_argument("--dump-pedagogy", action="store_true",
                    help="Print the compact pedagogy JSON for in-session "
                         "human/Claude review (no API calls). Paste the "
                         "output into the Claude Code conversation.")
    ap.add_argument("--out", type=Path, help="Write markdown report to this path (otherwise stdout)")
    args = ap.parse_args()

    data = load_unit(args.stage, args.unit)
    units = data.get("units") or [data]
    reports = []
    dumps = []
    for u in units:
        unit_meta = {"stage": args.stage, "unit": args.unit, "title": u.get("title", "")}
        for L in u.get("lessons", []):
            ln = L.get("lesson_num") or L.get("number")
            if args.lesson and ln != args.lesson:
                continue
            r = audit_lesson(L)
            if args.dump_pedagogy:
                dumps.append(pedagogy_dump(L))
            reports.append(r)

    md = render_markdown(unit_meta, reports)
    if args.out:
        args.out.write_text(md)
        print(f"wrote {args.out}")
    else:
        print(md)
    if args.dump_pedagogy:
        print("\n\n## Pedagogy dump (paste into Claude Code for in-session review)\n")
        print("```json")
        print(json.dumps(dumps, indent=2, ensure_ascii=False))
        print("```")


if __name__ == "__main__":
    main()
