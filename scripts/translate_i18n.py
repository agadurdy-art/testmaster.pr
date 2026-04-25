#!/usr/bin/env python3
"""Auto-translate the i18n dictionary in frontend/src/lib/i18n.js.

Mirrors scripts/translate-i18n.mjs but goes through the Emergent LLM gateway
(emergentintegrations + EMERGENT_LLM_KEY) instead of a direct Anthropic key,
so it runs on the same credentials the rest of the app already uses.

Usage (from the repo root, with backend venv active):

    python scripts/translate_i18n.py

Environment:
    EMERGENT_LLM_KEY          required (loaded from backend/.env by default)
    LANGS=ar,ko,th            optional — comma list of target language codes
    DRY=1                     preview only, don't write the file
    FORCE=1                   retranslate non-empty blocks too
    MODEL=claude-sonnet-4-6   override model (default matches liz_llm)

The script enforces the same IELTS-domain hard rules as the Node version:
product name "IELTS Ace" and coach "Liz" stay unchanged, IELTS terminology
remains in English, placeholders are preserved, output is strict JSON.
"""

from __future__ import annotations

import asyncio
import json
import os
import re
import sys
from pathlib import Path
from typing import Iterable

# Repo layout: scripts/ is a sibling of backend/ and frontend/.
REPO_ROOT = Path(__file__).resolve().parent.parent
I18N_PATH = REPO_ROOT / "frontend" / "src" / "lib" / "i18n.js"
BACKEND_ENV = REPO_ROOT / "backend" / ".env"

BATCH_SIZE = 80
MODEL = os.environ.get("MODEL", "claude-sonnet-4-5-20250929")
DRY = os.environ.get("DRY") == "1"
FORCE = os.environ.get("FORCE") == "1"
MAX_RETRIES = 3

LANG_NAMES = {
    "mandarin": "Mandarin Chinese (Simplified, 简体中文)",
    "ar": "Arabic (Modern Standard Arabic, العربية)",
    "ko": "Korean (한국어)",
    "th": "Thai (ภาษาไทย)",
    "ja": "Japanese (日本語)",
    "es": "Spanish (neutral Latin American, Español)",
    "pt": "Portuguese (Brazilian, Português do Brasil)",
    "ru": "Russian (Русский)",
    "id": "Indonesian (Bahasa Indonesia)",
}


# ---------------------------------------------------------------------------
# .env loader — minimal, no python-dotenv dependency required
# ---------------------------------------------------------------------------

def load_env_file(path: Path) -> None:
    if not path.exists():
        return
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        # Don't overwrite variables already in the shell.
        os.environ.setdefault(key, value)


load_env_file(BACKEND_ENV)

EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "")
if not EMERGENT_LLM_KEY and not DRY:
    sys.exit("EMERGENT_LLM_KEY is not set (checked shell env + backend/.env). "
             "Run with DRY=1 to preview without calling the API.")


# ---------------------------------------------------------------------------
# i18n.js parsing — single-line key entries, balanced-brace block finder
# ---------------------------------------------------------------------------

ENTRY_RE = re.compile(
    r"^\s*([A-Za-z_][A-Za-z0-9_]*):\s*(['\"])((?:\\.|(?!\2).)*)\2,?\s*$"
)


def find_block(source: str, lang_key: str) -> tuple[int, int, str]:
    """Return (start, end, body) covering the full `  <lang_key>: { ... },` block.

    `start` points at the two-space indent before `<lang_key>:` and `end` is one
    past the trailing comma (if present). `body` is the content between braces,
    excluding them. This way callers can do
    `source[:start] + format_dict_block(...) + source[end:]` without creating
    duplicate `  lang:` prefixes or double commas.
    """
    marker = f"  {lang_key}: {{"
    start = source.find(marker)
    if start == -1:
        raise ValueError(f"Block not found: {lang_key}")
    brace_start = source.index("{", start)
    depth = 0
    for i in range(brace_start, len(source)):
        ch = source[i]
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                end = i + 1
                if end < len(source) and source[end] == ",":
                    end += 1
                return start, end, source[brace_start + 1 : i]
    raise ValueError(f"Unbalanced braces for {lang_key}")


def unescape_js(s: str) -> str:
    return (s.replace("\\n", "\n")
             .replace("\\t", "\t")
             .replace("\\'", "'")
             .replace('\\"', '"')
             .replace("\\\\", "\\"))


def escape_js_single(s: str) -> str:
    return s.replace("\\", "\\\\").replace("'", "\\'")


def parse_dict_body(body: str) -> list[tuple[str, str]]:
    entries: list[tuple[str, str]] = []
    for line in body.splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("//"):
            continue
        m = ENTRY_RE.match(line)
        if not m:
            continue
        key, _, value = m.group(1), m.group(2), m.group(3)
        entries.append((key, unescape_js(value)))
    return entries


def format_dict_block(lang_key: str, entries: Iterable[tuple[str, str]]) -> str:
    lines = [f"  {lang_key}: {{"]
    for key, value in entries:
        lines.append(f"    {key}: '{escape_js_single(value)}',")
    lines.append("  },")
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# LLM call via emergentintegrations
# ---------------------------------------------------------------------------

def build_system_prompt(lang_code: str) -> str:
    lang_name = LANG_NAMES[lang_code]
    return "\n".join([
        "You are a professional IELTS-domain localizer.",
        f"Translate the following UI strings from English into {lang_name}.",
        "",
        "HARD RULES:",
        '1. Keep the product name "IELTS Ace" and the coach name "Liz" unchanged.',
        "2. Keep IELTS terminology in English: band descriptors, Task 1, Task 2, "
        "Task Response, Task Achievement, Coherence & Cohesion, Lexical Resource, "
        "Grammatical Range & Accuracy, Speaking Parts 1/2/3, CEFR labels "
        "(A2/B1/B2/C1).",
        "3. Numbers, punctuation, and emoji stay as-is.",
        "4. Preserve placeholders like {name}, {{count}}, {0}, %s, and HTML tags.",
        "5. Do NOT add or remove keys. Output the SAME keys you receive.",
        "6. Respond with ONLY a valid JSON object: "
        '{"key": "translation", ...}.',
        "   No markdown fences, no commentary.",
    ])


async def translate_batch(
    lang_code: str,
    batch: list[tuple[str, str]],
    batch_index: int,
) -> list[tuple[str, str]]:
    # Import locally so DRY runs don't require the library to be installed.
    from emergentintegrations.llm.chat import LlmChat, UserMessage  # type: ignore

    payload = dict(batch)
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"translate-i18n-{lang_code}-b{batch_index}",
        system_message=build_system_prompt(lang_code),
    ).with_model("anthropic", MODEL)

    response = await chat.send_message(UserMessage(text=json.dumps(payload)))

    text = (response or "").strip()
    # Defensive strip of accidental code fences.
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.IGNORECASE)
        text = re.sub(r"\s*```$", "", text, flags=re.IGNORECASE)

    try:
        parsed = json.loads(text)
    except json.JSONDecodeError as e:
        preview = text[:500].replace("\n", " ")
        raise RuntimeError(
            f"JSON parse failed for {lang_code} batch {batch_index}: {e}\n"
            f"preview: {preview}"
        ) from e

    out: list[tuple[str, str]] = []
    for key, _ in batch:
        value = parsed.get(key)
        if not isinstance(value, str):
            raise RuntimeError(
                f"Missing/invalid key in {lang_code} batch {batch_index}: {key}"
            )
        out.append((key, value))
    return out


_PERMANENT_ERROR_MARKERS = (
    "budget",
    "insufficient",
    "quota",
    "unauthorized",
    "forbidden",
    "invalid api key",
    "401",
    "402",
    "403",
)


def _is_permanent_error(err: BaseException) -> bool:
    msg = str(err).lower()
    return any(marker in msg for marker in _PERMANENT_ERROR_MARKERS)


async def translate_batch_with_retry(
    lang_code: str,
    batch: list[tuple[str, str]],
    batch_index: int,
) -> list[tuple[str, str]]:
    """Retry transient failures (502 Bad Gateway, network flaps) up to MAX_RETRIES.

    Permanent failures — budget exceeded, auth errors — re-raise immediately so
    we don't burn the remaining budget on doomed calls.
    """
    delay = 2.0
    last_err: BaseException | None = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            return await translate_batch(lang_code, batch, batch_index)
        except BaseException as err:  # noqa: BLE001 — gateway raises broad types
            last_err = err
            if _is_permanent_error(err):
                raise
            if attempt == MAX_RETRIES:
                break
            print(
                f"\n  retry {attempt}/{MAX_RETRIES - 1} after {delay:.0f}s: {err}",
                flush=True,
            )
            await asyncio.sleep(delay)
            delay *= 2
    assert last_err is not None
    raise last_err


async def translate_all(
    lang_code: str,
    en_entries: list[tuple[str, str]],
) -> list[tuple[str, str]]:
    batches = [
        en_entries[i : i + BATCH_SIZE]
        for i in range(0, len(en_entries), BATCH_SIZE)
    ]
    print(f"[{lang_code}] {len(en_entries)} keys in {len(batches)} batches…")
    results: list[tuple[str, str]] = []
    for idx, batch in enumerate(batches, start=1):
        print(f"  batch {idx}/{len(batches)} … ", end="", flush=True)
        # Sequential — avoids Emergent rate-limit issues and keeps order stable.
        part = await translate_batch_with_retry(lang_code, batch, idx)
        results.extend(part)
        print("ok")
    return results


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

async def main() -> None:
    source = I18N_PATH.read_text(encoding="utf-8")
    _, _, en_body = find_block(source, "en")
    en_entries = parse_dict_body(en_body)
    print(f"Parsed {len(en_entries)} EN keys from {I18N_PATH}")

    env_langs = [s.strip() for s in os.environ.get("LANGS", "").split(",") if s.strip()]
    candidates = env_langs if env_langs else list(LANG_NAMES.keys())

    targets: list[str] = []
    for lang in candidates:
        if lang not in LANG_NAMES:
            print(f"Skip unknown language: {lang}")
            continue
        _, _, body = find_block(source, lang)
        existing = parse_dict_body(body)
        if existing and not FORCE:
            print(f"Skip {lang} (already has {len(existing)} keys; set FORCE=1 to overwrite).")
            continue
        targets.append(lang)

    if not targets:
        print("Nothing to translate.")
        return

    mutated = source
    completed: list[str] = []
    failed: list[tuple[str, str]] = []
    for lang in targets:
        if DRY:
            print(f"[DRY] would translate {lang} ({len(en_entries)} keys).")
            continue
        try:
            entries = await translate_all(lang, en_entries)
        except BaseException as err:  # noqa: BLE001
            print(f"[{lang}] ✗ {err}")
            failed.append((lang, str(err)))
            if _is_permanent_error(err):
                print("Permanent error — stopping further languages.")
                break
            continue
        start, end, _ = find_block(mutated, lang)
        mutated = mutated[:start] + format_dict_block(lang, entries) + mutated[end:]
        # Incremental write: persist after each language so a later failure
        # doesn't throw away progress already made.
        I18N_PATH.write_text(mutated, encoding="utf-8")
        completed.append(lang)
        print(f"[{lang}] ✓ {len(entries)} keys written + file flushed.")

    if DRY:
        print("DRY run — no file changes.")
        return

    print(f"\nDone. Completed: {completed or '∅'}")
    if failed:
        print("Failed:")
        for lang, msg in failed:
            print(f"  - {lang}: {msg}")
    print(f"File: {I18N_PATH}")


if __name__ == "__main__":
    asyncio.run(main())
