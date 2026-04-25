"""
IELTS 8 Grammar Blueprint \u2014 Backend Routes

Serves the hand-curated grammar curriculum (17 module topics + 1 cross-cutting
Common Errors reference). Content lives in
`backend/content/grammar/blueprint_seed.json` + `backend/content/grammar/topics/*.json`.

Endpoints (mounted under /api/grammar-blueprint):
  GET  /modules                      \u2192 course meta + module definitions
  GET  /topics                       \u2192 compact list of all topics (for the /grammar landing page)
  GET  /topics/{slug}                \u2192 full topic detail (intro, rules, examples, practice)
  POST /topics/{slug}/practice/score \u2192 stateless scoring of a submitted practice block

No database writes. Content is read from disk at startup. Safe to run on a
read-only filesystem except for the initial import.
"""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/grammar-blueprint", tags=["Grammar Blueprint"])

# ---------------------------------------------------------------------------
# Content loader
# ---------------------------------------------------------------------------

_BACKEND_DIR = Path(__file__).resolve().parent.parent
_CONTENT_DIR = _BACKEND_DIR / "content" / "grammar"
_MANIFEST_PATH = _CONTENT_DIR / "blueprint_seed.json"
_TOPICS_DIR = _CONTENT_DIR / "topics"

_manifest: Dict[str, Any] = {}
_topics: Dict[str, Dict[str, Any]] = {}


def _load_content() -> None:
    """Load manifest + all topic files into memory. Idempotent."""
    global _manifest, _topics

    if not _MANIFEST_PATH.exists():
        logger.warning("Grammar Blueprint manifest not found at %s", _MANIFEST_PATH)
        _manifest = {}
        _topics = {}
        return

    with _MANIFEST_PATH.open("r", encoding="utf-8") as fh:
        _manifest = json.load(fh)

    loaded: Dict[str, Dict[str, Any]] = {}
    for slug in _manifest.get("topic_slugs", []):
        topic_path = _TOPICS_DIR / f"{slug}.json"
        if not topic_path.exists():
            logger.warning("Grammar Blueprint topic file missing: %s", topic_path)
            continue
        try:
            with topic_path.open("r", encoding="utf-8") as fh:
                loaded[slug] = json.load(fh)
        except (OSError, json.JSONDecodeError) as exc:
            logger.error("Failed to load grammar topic %s: %s", slug, exc)

    _topics = loaded
    logger.info("Grammar Blueprint loaded: %d topics", len(_topics))


_load_content()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _topic_summary(topic: Dict[str, Any]) -> Dict[str, Any]:
    """Compact entry for the landing-page topic list."""
    return {
        "slug": topic.get("slug"),
        "module": topic.get("module"),
        "order": topic.get("order"),
        "title": topic.get("title"),
        "subtitle": topic.get("subtitle"),
        "target_band": topic.get("target_band"),
    }


def _practice_block(topic: Dict[str, Any], mode: str) -> Optional[Dict[str, Any]]:
    for block in topic.get("practice", []) or []:
        if block.get("mode") == mode:
            return block
    return None


def _normalise(answer: Any) -> str:
    """Lowercase, collapse whitespace, strip punctuation used only for format."""
    if answer is None:
        return ""
    text = str(answer).strip().lower()
    # Treat multiple accepted answers separated by "/" as alternatives \u2014
    # caller handles list compare; here we only normalise one token.
    for ch in ".,;:!?\"\u201c\u201d\u2018\u2019":
        text = text.replace(ch, "")
    return " ".join(text.split())


def _gap_fill_accepts(correct: Any, submitted: Any) -> bool:
    """Accept if submitted matches any of the '/'-separated alternatives."""
    sub = _normalise(submitted)
    if not sub:
        return False
    for alt in str(correct or "").split("/"):
        if _normalise(alt) == sub:
            return True
    return False


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class PracticeAnswer(BaseModel):
    index: int           # 0-based item index inside the block
    value: Any           # string for gap_fill/transformation, int for mcq/ranking, str label for error_detection (e.g., "A")


class PracticeSubmission(BaseModel):
    mode: str
    answers: List[PracticeAnswer]


class ItemResult(BaseModel):
    index: int
    correct: bool
    expected: Any
    explanation: Optional[str] = None


class PracticeResult(BaseModel):
    slug: str
    mode: str
    total: int
    correct: int
    score_pct: float
    items: List[ItemResult]


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.get("/modules")
async def get_modules() -> Dict[str, Any]:
    """Course metadata + module list + cross-cutting reference."""
    if not _manifest:
        raise HTTPException(status_code=503, detail="Grammar Blueprint content not loaded")
    return {
        "course_title": _manifest.get("course_title"),
        "course_subtitle": _manifest.get("course_subtitle"),
        "pedagogical_note": _manifest.get("pedagogical_note"),
        "modules": _manifest.get("modules", []),
        "cross_cutting": _manifest.get("cross_cutting"),
    }


@router.get("/topics")
async def list_topics() -> Dict[str, Any]:
    """Compact list of all topics grouped by module."""
    if not _topics:
        raise HTTPException(status_code=503, detail="Grammar Blueprint content not loaded")

    summaries = [_topic_summary(t) for t in _topics.values()]
    summaries.sort(key=lambda s: (s.get("module") or 99, s.get("order") or 99))
    return {"topics": summaries, "count": len(summaries)}


@router.get("/topics/{slug}")
async def get_topic(slug: str) -> Dict[str, Any]:
    """Full topic detail including practice items."""
    topic = _topics.get(slug)
    if not topic:
        raise HTTPException(status_code=404, detail=f"Topic '{slug}' not found")
    return topic


@router.post("/topics/{slug}/practice/score", response_model=PracticeResult)
async def score_practice(slug: str, submission: PracticeSubmission) -> PracticeResult:
    """Stateless scoring \u2014 no DB write. Accepts the user's answers for one practice
    block and returns per-item feedback + aggregate score."""
    topic = _topics.get(slug)
    if not topic:
        raise HTTPException(status_code=404, detail=f"Topic '{slug}' not found")

    block = _practice_block(topic, submission.mode)
    if not block:
        raise HTTPException(
            status_code=400,
            detail=f"Practice mode '{submission.mode}' not available for topic '{slug}'",
        )

    items = block.get("items", []) or []
    mode = submission.mode
    submitted_by_index: Dict[int, Any] = {a.index: a.value for a in submission.answers}

    results: List[ItemResult] = []
    for idx, item in enumerate(items):
        expected = item.get("answer")
        submitted = submitted_by_index.get(idx)
        correct = False

        if submitted is None:
            correct = False
        elif mode in ("mcq", "band8_ranking"):
            # Numeric option index; also accept string form.
            try:
                correct = int(submitted) == int(expected)
            except (TypeError, ValueError):
                correct = False
        elif mode == "error_detection":
            # Expected is a letter ("A"/"B"/"C"/"D") or None for "no error".
            if expected is None:
                # A "no error" item \u2014 allow the client to send None, "", or a
                # dedicated sentinel like "NONE".
                correct = submitted in (None, "", "NONE", "none")
            else:
                correct = str(submitted).strip().upper() == str(expected).strip().upper()
        elif mode in ("gap_fill", "sentence_transformation"):
            correct = _gap_fill_accepts(expected, submitted)
        else:
            # Fallback: strict-normalised equality.
            correct = _normalise(submitted) == _normalise(expected)

        results.append(ItemResult(
            index=idx,
            correct=correct,
            expected=expected,
            explanation=item.get("explanation"),
        ))

    total = len(items)
    correct_count = sum(1 for r in results if r.correct)
    pct = round(100 * correct_count / total, 1) if total else 0.0

    return PracticeResult(
        slug=slug,
        mode=mode,
        total=total,
        correct=correct_count,
        score_pct=pct,
        items=results,
    )


@router.post("/_internal/reload")
async def reload_content() -> Dict[str, Any]:
    """Admin/dev helper \u2014 re-read JSON files from disk without a server restart."""
    _load_content()
    return {
        "reloaded": True,
        "topics": len(_topics),
        "modules": len(_manifest.get("modules", [])),
    }
