"""Slice 1 smoke: verify Gemini Live SDK reaches the API end-to-end.

Connects with text modality, sends a single examiner-style turn, prints the
text response, closes. No audio yet — that's Slice 2. Purpose is to catch
auth/SDK/version issues before we wire the WebSocket proxy.
"""
from __future__ import annotations

import asyncio
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from dotenv import load_dotenv  # noqa: E402

load_dotenv(ROOT / ".env")

from google import genai  # noqa: E402
from google.genai import types  # noqa: E402


# Live API models confirmed via client.models.list() bidiGenerateContent filter:
# - gemini-2.5-flash-native-audio-latest         (stable alias — DEFAULT)
# - gemini-2.5-flash-native-audio-preview-09-2025
# - gemini-2.5-flash-native-audio-preview-12-2025
# - gemini-3.1-flash-live-preview                (next-gen preview)
# Memory note: Aga chose "Gemini 2.5 Flash Live" (cheap + native audio).
MODEL = os.environ.get("LIZ_LIVE_MODEL", "gemini-2.5-flash-native-audio-latest")


async def main() -> int:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("GEMINI_API_KEY not set", file=sys.stderr)
        return 2

    client = genai.Client(api_key=api_key, http_options={"api_version": "v1beta"})

    # Native-audio models only return audio (server rejects text-only mode with
    # error 1007 "Cannot extract voices from a non-audio request"). We request
    # AUDIO + output_audio_transcription so we get the audio bytes plus the
    # examiner's transcribed question — both are needed downstream.
    config = types.LiveConnectConfig(
        response_modalities=[types.Modality.AUDIO],
        output_audio_transcription=types.AudioTranscriptionConfig(),
        system_instruction=types.Content(
            parts=[
                types.Part(
                    text=(
                        "You are an IELTS Speaking Part 1 examiner. Ask one short, "
                        "warm-up question (single sentence) on the topic the candidate "
                        "names. Do NOT add commentary."
                    )
                )
            ]
        ),
    )

    try:
        async with client.aio.live.connect(model=MODEL, config=config) as session:
            await session.send_client_content(
                turns=types.Content(
                    parts=[types.Part(text="Topic: Hometown")],
                    role="user",
                ),
                turn_complete=True,
            )
            audio_bytes_total = 0
            transcript_chunks: list[str] = []
            async for response in session.receive():
                sc = response.server_content
                if sc and sc.model_turn:
                    for part in sc.model_turn.parts or []:
                        inline = getattr(part, "inline_data", None)
                        if inline and inline.data:
                            audio_bytes_total += len(inline.data)
                if sc and sc.output_transcription and sc.output_transcription.text:
                    transcript_chunks.append(sc.output_transcription.text)
                if sc and sc.turn_complete:
                    break
            transcript = "".join(transcript_chunks).strip()
            print(f"[liz-live audio smoke] model={MODEL}")
            print(f"[audio bytes received] {audio_bytes_total}")
            print(f"[examiner Q transcript] {transcript or '(no transcript)'}")
            if audio_bytes_total <= 0:
                print("No audio returned — likely auth/model mismatch", file=sys.stderr)
                return 3
            return 0
    except Exception as exc:  # noqa: BLE001
        print(f"Live API connection failed: {type(exc).__name__}: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
