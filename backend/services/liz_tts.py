"""
Liz TTS service
===============
Azure Neural Speech (en-GB-SoniaNeural) as primary provider for Liz's voice,
with OpenAI `tts-1 / nova` fallback to preserve behaviour when AZURE_SPEECH_KEY
is missing. Returns base64-encoded MP3 in every case so the frontend contract
doesn't change.

Env:
  AZURE_SPEECH_KEY, AZURE_SPEECH_REGION    (required for Azure path)
  LIZ_TTS_VOICE     (default en-GB-SoniaNeural)
  LIZ_TTS_STYLE     (optional mstts style, e.g. "chat" / "friendly")
  EMERGENT_LLM_KEY  (fallback path)
"""
from __future__ import annotations

import os
import base64
import logging
from typing import Optional

logger = logging.getLogger(__name__)

DEFAULT_VOICE = "en-GB-SoniaNeural"
MAX_TTS_CHARS = 500  # keep requests tight so free tier quota is predictable


def _azure_configured() -> bool:
    return bool(os.environ.get("AZURE_SPEECH_KEY") and os.environ.get("AZURE_SPEECH_REGION"))


def _escape_xml(text: str) -> str:
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("'", "&apos;")
    )


def _build_ssml(text: str, voice: str, style: Optional[str]) -> str:
    safe = _escape_xml(text)
    body = f"<prosody rate=\"-4%\">{safe}</prosody>"
    if style:
        body = (
            f"<mstts:express-as style=\"{style}\" styledegree=\"1\">{body}"
            f"</mstts:express-as>"
        )
    return (
        "<speak version=\"1.0\" xmlns=\"http://www.w3.org/2001/10/synthesis\" "
        "xmlns:mstts=\"http://www.w3.org/2001/mstts\" xml:lang=\"en-GB\">"
        f"<voice name=\"{voice}\">{body}</voice></speak>"
    )


async def _synthesize_azure(text: str, voice: str, style: Optional[str]) -> Optional[str]:
    """Return base64 MP3 via Azure SDK, or None if synthesis failed."""
    try:
        import azure.cognitiveservices.speech as speechsdk  # type: ignore
    except ImportError:
        logger.warning("azure-cognitiveservices-speech not installed")
        return None

    key = os.environ["AZURE_SPEECH_KEY"]
    region = os.environ["AZURE_SPEECH_REGION"]
    ssml = _build_ssml(text, voice, style)

    def _run_sync() -> Optional[bytes]:
        config = speechsdk.SpeechConfig(subscription=key, region=region)
        config.set_speech_synthesis_output_format(
            speechsdk.SpeechSynthesisOutputFormat.Audio24Khz160KBitRateMonoMp3
        )
        synth = speechsdk.SpeechSynthesizer(speech_config=config, audio_config=None)
        result = synth.speak_ssml_async(ssml).get()
        if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
            return result.audio_data
        detail = getattr(result, "cancellation_details", None)
        logger.warning("Azure TTS did not complete: reason=%s detail=%s",
                       result.reason, getattr(detail, "error_details", ""))
        return None

    import asyncio
    audio_bytes = await asyncio.to_thread(_run_sync)
    if not audio_bytes:
        return None
    return base64.b64encode(audio_bytes).decode("ascii")


async def _synthesize_openai_fallback(text: str) -> Optional[str]:
    """Legacy OpenAI `nova` voice so deployments without Azure keys still work."""
    try:
        from services.openai_compat import OpenAITextToSpeech  # type: ignore
    except ImportError:
        return None
    api_key = os.environ.get("OPENAI_API_KEY") or os.environ.get("EMERGENT_LLM_KEY", "")
    if not api_key:
        return None
    try:
        tts = OpenAITextToSpeech(api_key=api_key)
        return await tts.generate_speech_base64(
            text=text, voice="nova", model="tts-1"
        )
    except Exception:
        logger.exception("OpenAI fallback TTS failed")
        return None


async def synthesize(
    text: str,
    *,
    voice: Optional[str] = None,
    style: Optional[str] = None,
) -> dict:
    """Return `{audio: base64 or None, format: 'mp3', provider: 'azure'|'openai'|'none'}`.

    Accepts arbitrary text; truncates to MAX_TTS_CHARS for safety. Never raises —
    callers treat `None` as "no voice this turn".
    """
    cleaned = (text or "").strip()[:MAX_TTS_CHARS]
    if not cleaned:
        return {"audio": None, "format": "mp3", "provider": "none"}

    voice_name = voice or os.environ.get("LIZ_TTS_VOICE", DEFAULT_VOICE)
    style_name = style or os.environ.get("LIZ_TTS_STYLE") or None

    if _azure_configured():
        audio = await _synthesize_azure(cleaned, voice_name, style_name)
        if audio:
            return {"audio": audio, "format": "mp3", "provider": "azure"}

    audio = await _synthesize_openai_fallback(cleaned)
    return {
        "audio": audio,
        "format": "mp3",
        "provider": "openai" if audio else "none",
    }


def health() -> dict:
    return {
        "azure_configured": _azure_configured(),
        "voice": os.environ.get("LIZ_TTS_VOICE", DEFAULT_VOICE),
        "style": os.environ.get("LIZ_TTS_STYLE") or None,
        "openai_fallback": bool(os.environ.get("EMERGENT_LLM_KEY")),
    }
