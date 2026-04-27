"""
Anthropic-backed shim that mimics the slice of `emergentintegrations.llm.chat`
we still depend on (`LlmChat` + `UserMessage`).

Why this exists
---------------
Multiple evaluators / route handlers were written against the
`emergentintegrations` SDK, which proxies to OpenAI/Anthropic via the
`EMERGENT_LLM_KEY`. We want all evaluation + content-generation calls to go
straight to Claude Sonnet (per the project rule that examiner-style feedback
must be Sonnet-calibrated), without rewriting every call site.

This shim keeps the call sites identical:

    from services.llm_compat import LlmChat, UserMessage
    chat = LlmChat(api_key=..., session_id=..., system_message=...)\
        .with_model("anthropic", "claude-sonnet-4-5")
    text = await chat.send_message(UserMessage(text=prompt))

…but routes the request through the official `anthropic` SDK using
`ANTHROPIC_API_KEY`. Any caller that previously asked for an OpenAI model is
silently upgraded to Sonnet — that is the desired behaviour.

Supported call shapes
---------------------
* `LlmChat(api_key=..., session_id=..., system_message=...)` (Liz pattern)
* `LlmChat(api_key=..., model="gpt-4o")`                     (legacy pattern)
* `.with_model(provider, model)`                              (chainable)
* `await chat.send_message(UserMessage(text=...))`
* `await chat.chat([UserMessage(content=...)])`               (legacy verb)

Anything else falls through to a plain Sonnet call.
"""
from __future__ import annotations

import os
from typing import Iterable, Optional


# Default model picks. `_DEFAULT_MODEL` is the one we land on when the caller
# did not explicitly ask for an Anthropic model.
_DEFAULT_MODEL = "claude-sonnet-4-5"
_DEFAULT_MAX_TOKENS = 4096


class UserMessage:
    """Drop-in replacement for `emergentintegrations.llm.chat.UserMessage`.

    The original accepted either `text=` (newer code paths) or
    `content=` (older `.chat([...])` paths). We accept both and expose them
    on the same attributes, so call sites do not need to change.
    """

    def __init__(self, text: Optional[str] = None, content: Optional[str] = None):
        body = text if text is not None else content
        self.text = body or ""
        self.content = self.text

    def __repr__(self) -> str:  # pragma: no cover - debug aid
        snippet = (self.text or "")[:40].replace("\n", " ")
        return f"UserMessage({snippet!r}…)"


def _extract_text(response) -> str:
    """Concatenate all text blocks on an Anthropic message response."""
    parts = []
    for block in getattr(response, "content", []) or []:
        text = getattr(block, "text", None)
        if text:
            parts.append(text)
    return "".join(parts).strip()


class LlmChat:
    """Compatibility wrapper that targets Anthropic Sonnet by default."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        session_id: Optional[str] = None,
        system_message: str = "",
        model: Optional[str] = None,
    ):
        # `api_key` and `session_id` are accepted for signature compatibility
        # but ignored — we always use ANTHROPIC_API_KEY because the shim's
        # whole purpose is to bypass the Emergent proxy.
        self._system = system_message or ""
        self._model = _DEFAULT_MODEL
        self._max_tokens = _DEFAULT_MAX_TOKENS
        if model:
            # Legacy ctor form: `LlmChat(api_key=..., model="gpt-4o")`. We
            # only honour the model id if it looks like a Claude model;
            # OpenAI ids fall back to the Sonnet default.
            self._model = model if model.startswith("claude") else _DEFAULT_MODEL
        self._client = None  # lazy

    # ─── chainable config ──────────────────────────────────────────────
    def with_model(self, provider: str, model: str) -> "LlmChat":
        """Mirror the original chainable API.

        - provider == "anthropic": honour the requested model id
        - any other provider: pin to Sonnet (the project standard)
        """
        if provider == "anthropic" and model:
            self._model = model
        else:
            self._model = _DEFAULT_MODEL
        return self

    def with_max_tokens(self, max_tokens: int) -> "LlmChat":
        try:
            self._max_tokens = int(max_tokens)
        except Exception:
            pass
        return self

    # ─── client plumbing ───────────────────────────────────────────────
    def _get_client(self):
        if self._client is not None:
            return self._client
        try:
            from anthropic import AsyncAnthropic
        except ImportError as exc:  # pragma: no cover
            raise RuntimeError(
                "anthropic SDK is required for services.llm_compat — add "
                "`anthropic` to requirements.txt and redeploy."
            ) from exc
        api_key = os.environ.get("ANTHROPIC_API_KEY")
        if not api_key:
            raise RuntimeError("ANTHROPIC_API_KEY is not configured.")
        self._client = AsyncAnthropic(api_key=api_key)
        return self._client

    async def _create(self, prompt: str) -> str:
        client = self._get_client()
        response = await client.messages.create(
            model=self._model,
            max_tokens=self._max_tokens,
            system=self._system or "You are a helpful assistant.",
            messages=[{"role": "user", "content": prompt}],
        )
        return _extract_text(response)

    # ─── public verbs (compatibility) ──────────────────────────────────
    async def send_message(self, message) -> str:
        """Newer call shape used by Liz / enricher / generator code."""
        text = getattr(message, "text", None) or getattr(message, "content", "")
        return await self._create(text or "")

    async def chat(self, messages: Iterable) -> str:
        """Legacy call shape: `await llm.chat([UserMessage(content=...)])`.

        We only forward the most recent user message — the older callers
        never built multi-turn histories, they always sent a single prompt.
        """
        latest = None
        for msg in messages:
            latest = msg
        if latest is None:
            return ""
        text = getattr(latest, "content", None) or getattr(latest, "text", "")
        return await self._create(text or "")
