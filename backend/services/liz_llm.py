"""
Liz LLM provider abstraction
============================
Unified async interface for Liz Teacher LLM calls. Supports Anthropic (Claude)
and Gemini as interchangeable backends, selected via environment flag. Keeps
call-site code identical regardless of backend.

(The legacy OpenAI/`emergentintegrations` branch was retired 2026-05-14 along
with the migration off Emergent — Anthropic is now the production provider and
Gemini stays available as an alternate. Plain-OpenAI evaluation/eval calls now
go directly through `services.openai_compat` / `services.llm_compat` instead
of this module.)

Env:
  LIZ_LLM_PROVIDER         = "anthropic" | "gemini"
                             (default: anthropic if ANTHROPIC_API_KEY is set,
                             else gemini if GEMINI_API_KEY is set)
  ANTHROPIC_API_KEY        = Claude API key
  GEMINI_API_KEY           = Gemini API key (also used by Liz Live)
  LIZ_DEFAULT_MODEL        = Haiku model id (chat/greet/light tasks)
  LIZ_DEEP_MODEL           = Sonnet model id (evaluation/deep tasks)
  LIZ_GEMINI_DEFAULT_MODEL = Gemini fast-chat model id
  LIZ_GEMINI_DEEP_MODEL    = Gemini deep model id

All model ids are overridable so we never have to edit this file to bump
versions.
"""
from __future__ import annotations

import asyncio
import os
import time
import logging
from typing import AsyncIterator, Optional

logger = logging.getLogger(__name__)


# ─── Configuration ────────────────────────────────────────────────────────────

DEFAULT_ANTHROPIC_CHAT = "claude-haiku-4-5-20251001"
DEFAULT_ANTHROPIC_DEEP = "claude-sonnet-4-6"
DEFAULT_GEMINI_CHAT = "gemini-2.5-flash"
DEFAULT_GEMINI_DEEP = "gemini-2.5-pro"

DEEP_KEYWORDS = (
    "study plan", "analyze my progress", "weekly plan", "band prediction",
    "evaluate my writing", "evaluate my speaking", "detailed feedback",
    "essay", "cue card", "part 3", "homework review",
)


def _active_provider() -> str:
    explicit = (os.environ.get("LIZ_LLM_PROVIDER") or "").strip().lower()
    if explicit in {"anthropic", "gemini"}:
        return explicit
    if os.environ.get("ANTHROPIC_API_KEY"):
        return "anthropic"
    if os.environ.get("GEMINI_API_KEY"):
        return "gemini"
    raise RuntimeError(
        "No Liz LLM provider configured: set ANTHROPIC_API_KEY or GEMINI_API_KEY "
        "(or LIZ_LLM_PROVIDER explicitly)."
    )


def active_provider() -> str:
    """Public helper so callers/status endpoints can report the provider."""
    return _active_provider()


def default_model() -> str:
    provider = _active_provider()
    if provider == "gemini":
        return os.environ.get("LIZ_GEMINI_DEFAULT_MODEL", DEFAULT_GEMINI_CHAT)
    return os.environ.get("LIZ_DEFAULT_MODEL", DEFAULT_ANTHROPIC_CHAT)


def deep_model() -> str:
    provider = _active_provider()
    if provider == "gemini":
        return os.environ.get("LIZ_GEMINI_DEEP_MODEL", DEFAULT_GEMINI_DEEP)
    return os.environ.get("LIZ_DEEP_MODEL", DEFAULT_ANTHROPIC_DEEP)


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
    scope: Optional[str] = None,
    user_id: Optional[str] = None,
    request_id: Optional[str] = None,
) -> str:
    """Non-streaming completion. Returns the assistant's full text.

    `cache_system=True` opts the system prompt into Anthropic's prompt-cache
    (5-min ephemeral). Use it for long, stable system prompts that are reused
    across many calls (e.g. the writing evaluator's 230-line rubric). Other
    providers ignore the flag — they pass the system prompt through unchanged.

    `scope`/`user_id`/`request_id` are passed through to cost telemetry so the
    admin dashboard can attribute spend to a feature/user/request. Optional —
    omitting them just produces an unattributed cost event.
    """
    chosen = model or select_model(user_message, is_voice=is_voice, task=task)
    provider = _active_provider()
    started = time.monotonic()

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

        # Fire-and-forget cost telemetry. Anthropic exposes usage as
        # response.usage.{input_tokens, output_tokens, cache_creation_input_tokens,
        # cache_read_input_tokens}. cache_read_input_tokens billed at the
        # cached rate; everything else at the standard rate.
        _emit_cost(
            provider="anthropic",
            model=chosen,
            usage=getattr(response, "usage", None),
            scope=scope,
            user_id=user_id,
            request_id=request_id,
            started=started,
            success=True,
        )
        return "".join(parts).strip()

    # gemini
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


def _emit_cost(
    *,
    provider: str,
    model: str,
    usage,
    scope: Optional[str],
    user_id: Optional[str],
    request_id: Optional[str],
    started: float,
    success: bool,
) -> None:
    """Fire-and-forget telemetry emit. Never raises into the caller."""
    if not scope:
        # Untagged call sites get a generic bucket so they still show up in the
        # admin total — easier to spot leakage than to silently drop them.
        scope = "untagged"
    try:
        from services import cost_telemetry  # local import to avoid cycle
        input_tokens = int(getattr(usage, "input_tokens", 0) or 0)
        output_tokens = int(getattr(usage, "output_tokens", 0) or 0)
        cached_input = int(getattr(usage, "cache_read_input_tokens", 0) or 0)
        duration_ms = int((time.monotonic() - started) * 1000)
        asyncio.create_task(cost_telemetry.record_llm_call(
            provider=provider,
            model=model,
            scope=scope,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            cached_input_tokens=cached_input,
            duration_ms=duration_ms,
            user_id=user_id,
            request_id=request_id,
            success=success,
        ))
    except Exception as e:
        logger.debug("cost telemetry emit skipped: %s", e)


async def stream(
    *,
    system: str,
    user_message: str,
    model: Optional[str] = None,
    max_tokens: int = 1500,
    is_voice: bool = False,
    task: str = "chat",
) -> AsyncIterator[str]:
    """Yield text deltas as they arrive."""
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
    }
