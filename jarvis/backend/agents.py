"""Parse the project's .claude/agents/*.md subagent definitions into a roster
the JARVIS control room can render. Source of truth = the markdown files, so the
UI always reflects whatever agents exist."""
from __future__ import annotations

import re
from pathlib import Path

# jarvis/backend/agents.py -> repo root is two parents up.
REPO_ROOT = Path(__file__).resolve().parent.parent.parent
AGENTS_DIR = REPO_ROOT / ".claude" / "agents"

# Squad + role classification (by agent name). Anything not listed falls back to
# the "product" squad with role "specialist" so new agents still appear.
PRODUCT = {
    "release-captain", "frontend-builder", "backend-builder", "content-author",
    "audio-producer", "media-pipeline", "pedagogy-reviewer", "student-walkthrough",
    "content-auditor", "security-auditor", "cost-guardian", "deploy-verifier",
}
MARKETING = {
    "marketing-lead", "copywriter", "seo-strategist", "social-media-manager",
    "email-marketer", "growth-analyst", "brand-compliance",
    # localization squad (under marketing)
    "localization-lead", "loc-vi", "loc-zh", "loc-ar", "loc-es", "loc-pt",
    "loc-tr", "loc-ko", "loc-th", "loc-ja", "loc-ru", "loc-id",
}
LOCALIZATION = {
    "loc-vi", "loc-zh", "loc-ar", "loc-es", "loc-pt",
    "loc-tr", "loc-ko", "loc-th", "loc-ja", "loc-ru", "loc-id",
}
ORCHESTRATORS = {"release-captain", "marketing-lead", "localization-lead"}
GATES = {"pedagogy-reviewer", "student-walkthrough", "brand-compliance"}
BUILD = {
    "frontend-builder", "backend-builder", "content-author", "audio-producer",
    "media-pipeline", "copywriter", "seo-strategist", "social-media-manager",
    "email-marketer",
}


def _role(name: str) -> str:
    if name in ORCHESTRATORS:
        return "orchestrator"
    if name in LOCALIZATION:
        return "localization"
    if name in GATES:
        return "gate"
    if name in {"content-auditor", "security-auditor", "cost-guardian",
                "deploy-verifier", "growth-analyst"}:
        return "audit"
    if name in BUILD:
        return "build"
    return "specialist"


def _squad(name: str) -> str:
    return "marketing" if name in MARKETING else "product"


def _parse_frontmatter(text: str) -> dict:
    """Minimal YAML frontmatter parse for our known fields, including the folded
    multi-line `description: >` block."""
    if not text.startswith("---"):
        return {}
    end = text.find("\n---", 3)
    if end == -1:
        return {}
    block = text[3:end].strip("\n")
    lines = block.split("\n")
    out: dict = {}
    i = 0
    while i < len(lines):
        line = lines[i]
        m = re.match(r"^(\w[\w-]*):\s*(.*)$", line)
        if not m:
            i += 1
            continue
        key, val = m.group(1), m.group(2).strip()
        if val in (">", "|", ">-", "|-"):  # folded/literal block scalar
            collected = []
            i += 1
            while i < len(lines) and (lines[i].startswith((" ", "\t")) or lines[i] == ""):
                collected.append(lines[i].strip())
                i += 1
            out[key] = " ".join(c for c in collected if c).strip()
            continue
        out[key] = val.strip().strip('"')
        i += 1
    return out


def load_roster() -> list[dict]:
    agents: list[dict] = []
    if not AGENTS_DIR.exists():
        return agents
    for md in sorted(AGENTS_DIR.glob("*.md")):
        if md.name == "README.md":
            continue
        fm = _parse_frontmatter(md.read_text(encoding="utf-8"))
        name = fm.get("name") or md.stem
        agents.append({
            "name": name,
            "description": fm.get("description", ""),
            "model": fm.get("model", "inherit"),
            "tools": fm.get("tools", ""),
            "squad": _squad(name),
            "role": _role(name),
            "file": str(md.relative_to(REPO_ROOT)),
        })
    return agents


if __name__ == "__main__":
    import json
    print(json.dumps(load_roster(), indent=2))
