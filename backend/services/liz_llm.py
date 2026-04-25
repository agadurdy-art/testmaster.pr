"""
Liz LLM provider abstraction
============================
Unified async interface for Liz Teacher LLM calls. Supports Anthropic (Claude)
as primary provider with OpenAI (emergentintegrations) fallback, selected via
environment flag. Keeps call-site code identical regardless of backend.

Env:
  LIZ_LLM_PROVIDER         = "anthropic" | "openai"   (default: anthropic if
                             ANTHROPIC_API_KEY is set, else openai)
  ANTHROPIC_API_KEY        = Claude API key
  LIZ_DEFAULT_MODEL        = Haiku model id (chat/greet/light tasks)
  LIZ_DEEP_MODEL           = Sonnet model id (evaluation/deep tasks)
  EMERGENT_LLM_KEY         = OpenAI key (via emergentintegrations)
  LIZ_OPENAI_DEFAULT_MODEL = legacy OpenAI default (fallback)
  LIZ_OPENAI_DEEP_MODEL    = legacy OpenAI deep (fallback)

All model ids are overridable so we never have to edit this file to bump
versions.
"""
from __future__ import annotations

import os
import logging
from typing import AsyncIterator, Optional

logger = logging.getLogger(__name__)


# ─── Configuration ────────────────────────────────────────────────────────────

DEFAULT_ANTHROPIC_CHAT = "claude-haiku-4-5-20251001"
DEFAULT_ANTHROPIC_DEEP = "claude-sonnet-4-6"
DEFAULT_OPENAI_CHAT = "gpt-4o-mini"
DEFAULT_OPENAI_DEEP = "gpt-4o"

DEEP_KEYWORDS = (
    "study plan", "analyze my progress", "weekly plan", "band prediction",
    "evaluate my writing", "evaluate my speaking", "detailed feedback",
    "essay", "cue card", "part 3", "homework review",
)


def _active_provider() -> str:
    explicit = (os.environ.get("LIZ_LLM_PROVIDER") or "").strip().lower()
    if explicit in {"anthropic", "openai"}:
        return explicit
    return "anthropic" if os.environ.get("ANTHROPIC_API_KEY") else "openai"


def active_provider() -> str:
    """Public helper so callers/status endpoints can report the provider."""
    return _active_provider()


def default_model() -> str:
    if _active_provider() == "anthropic":
        return os.environ.get("LIZ_DEFAULT_MODEL", DEFAULT_ANTHROPIC_CHAT)
    return os.environ.get("LIZ_OPENAI_DEFAULT_MODEL", DEFAULT_OPENAI_CHAT)


def deep_model() -> str:
    if _active_provider() == "anthropic":
        return os.environ.get("LIZ_DEEP_MODEL", DEFAULT_ANTHROPIC_DEEP)
    return os.environ.get("LIZ_OPENAI_DEEP_MODEL", DEFAULT_OPENAI_DEEP)


def select_model(message: str, is_voice: bool = False, task: str = "chat") -> str:
    """Pick default vs deep model based on task type + heuristics."""
    if task in {"eval", "deep", "homework_review"}:
        return deep_model()
    normalized = (message or "").lower()
    if is_voice or any(kw in normalized for kw in DEEP_KEYWORDS):
        return deep_model()
    return default_model()


# ─── Async clients (lazy, cached) ─────────────────────────────────────────────

_anthropic_client = None


def _get_anthropic_client():
    global _anthropic_client
    if _anthropic_client is not None:
        return _anthropic_client
    try:
        from anthropic import AsyncAnthropic
    except ImportError as exc:
        raise RuntimeError(
            "anthropic SDK is not installed. Add `anthropic` to requirements.txt "
            "and redeploy, or set LIZ_LLM_PROVIDER=openai."
        ) from exc
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise RuntimeError("ANTHROPIC_API_KEY is not configured.")
    _anthropic_client = AsyncAnthropic(api_key=api_key)
    return _anthropic_client


def _get_openai_chat(system_message: str, model: str, session_id: str):
    """Build a fresh emergentintegrations LlmChat (OpenAI fallback)."""
    from emergentintegrations.llm.chat import LlmChat  # type: ignore
    api_key = os.environ.get("EMERGENT_LLM_KEY", "")
    if not api_key:
        raise RuntimeError("EMERGENT_LLM_KEY is not configured (OpenAI fallback).")
    return LlmChat(
        api_key=api_key, session_id=session_id, system_message=system_message
    ).with_model("openai", model)


# ─── Unified entry points ─────────────────────────────────────────────────────

async def complete(
    *,
    system: str,
    user_message: str,
    model: Optional[str] = None,
    session_id: str = "liz",
    max_tokens: int = 1500,
    is_voice: bool = False,
    task: str = "chat",
) -> str:
    """Non-streaming completion. Returns the assistant's full text."""
    chosen = model or select_model(user_message, is_voice=is_voice, task=task)
    provider = _active_provider()

    if provider == "anthropic":
        client = _get_anthropic_client()
        response = await client.messages.create(
            model=chosen,
            max_tokens=max_tokens,
            system=system,
            messages=[{"role": "user", "content": user_message}],
        )
        # Anthropic returns a list of content blocks; concatenate any text blocks
        parts = []
        for block in response.content:
            text = getattr(block, "text", None)
            if text:
                parts.append(text)
        return "".join(parts).strip()

    # openai fallback
    from emergentintegrations.llm.chat import UserMessage  # type: ignore
    chat = _get_openai_chat(system, chosen, session_id)
    return await chat.send_message(UserMessage(text=user_message))


async def stream(
    *,
    system: str,
    user_message: str,
    model: Optional[str] = None,
    max_tokens: int = 1500,
    is_voice: bool = False,
    task: str = "chat",
) -> AsyncIterator[str]:
    """Yield text deltas as they arrive. OpenAI fallback degrades to a single
    chunk since emergentintegrations does not expose token streaming here."""
    chosen = model or select_model(user_message, is_voice=is_voice, task=task)
    provider = _active_provider()

    if provider == "anthropic":
        client = _get_anthropic_client()
        async with client.messages.stream(
            model=chosen,
            max_tokens=max_tokens,
            system=system,
            messages=[{"role": "user", "content": user_message}],
        ) as stream_ctx:
            async for text_delta in stream_ctx.text_stream:
                if text_delta:
                    yield text_delta
        return

    # fallback: single-shot
    full = await complete(
        system=system, user_message=user_message, model=chosen,
        max_tokens=max_tokens, is_voice=is_voice, task=task,
    )
    if full:
        yield full


def health() -> dict:
    """Status helper for the Liz status endpoint."""
    provider = _active_provider()
    return {
        "provider": provider,
        "default_model": default_model(),
        "deep_model": deep_model(),
        "anthropic_configured": bool(os.environ.get("ANTHROPIC_API_KEY")),
        "openai_configured": bool(os.environ.get("EMERGENT_LLM_KEY")),
    }
