"""
OpenAI-backed shim that mimics the slice of `emergentintegrations.llm.openai`
the codebase uses (OpenAISpeechToText, OpenAITextToSpeech).

Why: `emergentintegrations` is not on PyPI, so Railway/any non-Emergent host
can't install it. This shim reproduces the call sites' surface area using the
official `openai` SDK directly. EMERGENT_LLM_KEY-aware: if OPENAI_API_KEY is
not set, we fall back to EMERGENT_LLM_KEY (which is also an OpenAI key when
the user is on Emergent).
"""

from __future__ import annotations

import base64
import os
from typing import Any

try:
    from openai import AsyncOpenAI  # type: ignore
except Exception:  # pragma: no cover
    AsyncOpenAI = None  # noqa: N816


def _resolve_key(api_key: str | None) -> str:
    return (
        api_key
        or os.getenv("OPENAI_API_KEY")
        or os.getenv("EMERGENT_LLM_KEY")
        or ""
    )


class OpenAISpeechToText:
    """Drop-in replacement for emergentintegrations OpenAISpeechToText.

    Original interface used by call sites:
        stt = OpenAISpeechToText(api_key=...)
        response = await stt.transcribe(
            file=<file-like>,
            model="whisper-1",
            response_format="json" | "verbose_json",
            language=...,
            temperature=...,
            prompt=...,
        )
        # response.text, optionally response.language (verbose_json)
    """

    def __init__(self, api_key: str | None = None) -> None:
        if AsyncOpenAI is None:
            raise RuntimeError("openai package not installed")
        self._client = AsyncOpenAI(api_key=_resolve_key(api_key))

    async def transcribe(
        self,
        *,
        file: Any,
        model: str = "whisper-1",
        response_format: str = "json",
        language: str | None = None,
        temperature: float | None = None,
        prompt: str | None = None,
    ) -> Any:
        kwargs: dict[str, Any] = {
            "file": file,
            "model": model,
            "response_format": response_format,
        }
        if language is not None:
            kwargs["language"] = language
        if temperature is not None:
            kwargs["temperature"] = temperature
        if prompt is not None:
            kwargs["prompt"] = prompt
        return await self._client.audio.transcriptions.create(**kwargs)


class OpenAITextToSpeech:
    """Drop-in replacement for emergentintegrations OpenAITextToSpeech.

    Original interface:
        tts = OpenAITextToSpeech(api_key=...)
        b64 = await tts.generate_speech_base64(text=..., voice="alloy", model="tts-1")
    """

    def __init__(self, api_key: str | None = None) -> None:
        if AsyncOpenAI is None:
            raise RuntimeError("openai package not installed")
        self._client = AsyncOpenAI(api_key=_resolve_key(api_key))

    async def generate_speech_base64(
        self,
        *,
        text: str,
        voice: str = "alloy",
        model: str = "tts-1",
        response_format: str = "mp3",
    ) -> str:
        resp = await self._client.audio.speech.create(
            model=model,
            voice=voice,
            input=text,
            response_format=response_format,
        )
        # New SDK returns a streaming response; .read() gives raw bytes.
        if hasattr(resp, "read"):
            audio_bytes = await resp.read()  # type: ignore[func-returns-value]
        elif hasattr(resp, "content"):
            audio_bytes = resp.content  # type: ignore[assignment]
        else:
            audio_bytes = bytes(resp)  # last resort
        return base64.b64encode(audio_bytes).decode("ascii")
