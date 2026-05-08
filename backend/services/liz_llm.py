"""
Liz LLM provider abstraction
============================
Unified async interface for Liz Teacher LLM calls. Supports Anthropic (Claude),
Gemini, and OpenAI (emergentintegrations) as interchangeable backends, selected
via environment flag. Keeps call-site code identical regardless of backend.

Env:
  LIZ_LLM_PROVIDER         = "anthropic" | "gemini" | "openai"
                             (default: anthropic if ANTHROPIC_API_KEY is set,
                             else gemini if GEMINI_API_KEY is set, else openai)
  ANTHROPIC_API_KEY        = Claude API key
  GEMINI_API_KEY           = Gemini API key (also used by Liz Live)
  LIZ_DEFAULT_MODEL        = Haiku model id (chat/greet/light tasks)
  LIZ_DEEP_MODEL           = Sonnet model id (evaluation/deep tasks)
  LIZ_GEMINI_DEFAULT_MODEL = Gemini fast-chat model id
  LIZ_GEMINI_DEEP_MODEL    = Gemini deep model id
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
DEFAULT_GEMINI_CHAT = "gemini-2.5-flash"
DEFAULT_GEMINI_DEEP = "gemini-2.5-pro"
DEFAULT_OPENAI_CHAT = "gpt-4o-mini"
DEFAULT_OPENAI_DEEP = "gpt-4o"

DEEP_KEYWORDS = (
    "study plan", "analyze my progress", "weekly plan", "band prediction",
    "evaluate my writing", "evaluate my speaking", "detailed feedback",
    "essay", "cue card", "part 3", "homework review",
)


def _active_provider() -> str:
    explicit = (os.environ.get("LIZ_LLM_PROVIDER") or "").strip().lower()
    if explicit in {"anthropic", "gemini", "openai"}:
        return explicit
    if os.environ.get("ANTHROPIC_API_KEY"):
        return "anthropic"
    if os.environ.get("GEMINI_API_KEY"):
        return "gemini"
    return "openai"


def active_provider() -> str:
    """Public helper so callers/status endpoints can report the provider."""
    return _active_provider()


def default_model() -> str:
    provider = _active_provider()
    if provider == "anthropic":
        return os.environ.get("LIZ_DEFAULT_MODEL", DEFAULT_ANTHROPIC_CHAT)
    if provider == "gemini":
        return os.environ.get("LIZ_GEMINI_DEFAULT_MODEL", DEFAULT_GEMINI_CHAT)
    return os.environ.get("LIZ_OPENAI_DEFAULT_MODEL", DEFAULT_OPENAI_CHAT)


def deep_model() -> str:
    provider = _active_provider()
    if provider == "anthropic":
        return os.environ.get("LIZ_DEEP_MODEL", DEFAULT_ANTHROPIC_DEEP)
    if provider == "gemini":
        return os.environ.get("LIZ_GEMINI_DEEP_MODEL", DEFAULT_GEMINI_DEEP)
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
_gemini_client = None


def _get_gemini_client():
    """Returns a cached google-genai async client. Used for both chat and
    streaming via `aio.models.generate_content` / `generate_content_stream`."""
    global _gemini_client
    if _gemini_client is not None:
        return _gemini_client
    try:
        from google import genai  # type: ignore
    except ImportError as exc:
        raise RuntimeError(
            "google-genai SDK is not installed. Add `google-genai` to "
            "requirements.txt and redeploy, or set LIZ_LLM_PROVIDER=anthropic."
        ) from exc
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not configured.")
    _gemini_client = genai.Client(api_key=api_key)
    return _gemini_client


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
    cache_system: bool = False,
) -> str:
    """Non-streaming completion. Returns the assistant's full text.

    `cache_system=True` opts the system prompt into Anthropic's prompt-cache
    (5-min ephemeral). Use it for long, stable system prompts that are reused
    across many calls (e.g. the writing evaluator's 230-line rubric). Other
    providers ignore the flag — they pass the system prompt through unchanged.
    """
    chosen = model or select_model(user_message, is_voice=is_voice, task=task)
    provider = _active_provider()

    if provider == "anthropic":
        client = _get_anthropic_client()
        # Caching: send `system` as a content-block list with `cache_control`
        # on the (single) text block so the SDK marks it cacheable. Plain str
        # works too but skips the cache. Cached input tokens cost ~10% of
        # uncached, so a 230-line rubric reused across calls saves ~$0.07/eval.
        system_payload = (
            [{"type": "text", "text": system, "cache_control": {"type": "ephemeral"}}]
            if cache_system
            else system
        )
        response = await client.messages.create(
            model=chosen,
            max_tokens=max_tokens,
            system=system_payload,
            messages=[{"role": "user", "content": user_message}],
        )
        # Anthropic returns a list of content blocks; concatenate any text blocks
        parts = []
        for block in response.content:
            text = getattr(block, "text", None)
            if text:
                parts.append(text)
        return "".join(parts).strip()

    if provider == "gemini":
        from google.genai import types as gtypes  # type: ignore
        client = _get_gemini_client()
        response = await client.aio.models.generate_content(
            model=chosen,
            contents=user_message,
            config=gtypes.GenerateContentConfig(
                system_instruction=system,
                max_output_tokens=max_tokens,
            ),
        )
        return (response.text or "").strip()

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

    if provider == "gemini":
        from google.genai import types as gtypes  # type: ignore
        client = _get_gemini_client()
        async for chunk in await client.aio.models.generate_content_stream(
            model=chosen,
            contents=user_message,
            config=gtypes.GenerateContentConfig(
                system_instruction=system,
                max_output_tokens=max_tokens,
            ),
        ):
            text = getattr(chunk, "text", None)
            if text:
                yield text
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
        "gemini_configured": bool(os.environ.get("GEMINI_API_KEY")),
        "openai_configured": bool(os.environ.get("EMERGENT_LLM_KEY")),
    }
