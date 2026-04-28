"""Liz Live — WebSocket proxy bridging the browser and Gemini Live API.

Why a proxy and not a direct browser → Gemini connection:
  - Keeps GEMINI_API_KEY server-side (no ephemeral-token plumbing for MVP)
  - Lets us inject the IELTS-examiner system prompt per part/topic without
    trusting the client
  - Future hook for telemetry, quota gating, recording (turn audio is
    accumulated server-side so Faz 2 evaluation can run after the session)

Wire protocol — JSON frames over a single WebSocket:

  Browser → Backend:
    {"type": "init", "part": "part1"|"part3", "topic": "...",
     "user_language": "en", "user_id": "...",
     "target_band": 7.0}                           (REQUIRED first frame;
                                                    user_id triggers Faz 3.5
                                                    post-session evaluation)
    {"type": "audio", "data": "<base64 PCM16 16kHz mono>"}  (streaming)
    {"type": "audio_end"}                          (optional: explicit turn end;
                                                    server uses VAD otherwise)
    {"type": "close"}                              (graceful end)

  Backend → Browser:
    {"type": "ready"}
    {"type": "audio", "data": "<base64 PCM16 24kHz mono>"}
    {"type": "transcript", "role": "examiner"|"candidate", "text": "..."}
    {"type": "turn_complete"}
    {"type": "error", "message": "..."}
    {"type": "evaluation", "data": <SpeakingEvaluationResult>}  (Faz 3.5,
                                                    post-session, optional)
    {"type": "evaluation_error", "message": "..."} (eval failed, session
                                                    still closes cleanly)
    {"type": "closed", "reason": "..."}

Architecture is two asyncio tasks pumping each direction. The session ends
when either side closes; both pumps cancel cleanly.
"""
from __future__ import annotations

import asyncio
import base64
import io
import json
import logging
import os
import wave
from typing import Any, Optional

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/speaking/liz-live", tags=["Liz Live"])

# Confirmed via client.models.list() bidiGenerateContent filter (2026-04-27):
#   - gemini-2.5-flash-native-audio-latest         (stable alias — DEFAULT)
#   - gemini-2.5-flash-native-audio-preview-09-2025
#   - gemini-2.5-flash-native-audio-preview-12-2025
#   - gemini-3.1-flash-live-preview                (next-gen preview)
DEFAULT_LIVE_MODEL = "gemini-2.5-flash-native-audio-latest"


# ---------------------------------------------------------------------------
# Examiner system prompt builder
# ---------------------------------------------------------------------------
# Memory project_speaking_per_part_architecture.md — Liz Live aktif Part 1 +
# Part 3'te. Part 2 monologue, Live wire'lanmaz. Examiner persona:
# - Warm but professional (real IELTS examiners do NOT coach during the test)
# - Asks follow-up questions naturally based on what the candidate said
# - Does NOT give feedback during the session (evaluation runs after)


_PART1_GUIDANCE = """\
This is **Part 1** of the IELTS Speaking test (4–5 minutes total).

Your job:
  • Open with "Good morning. Could you tell me your full name, please?" then
    "And what shall I call you?" then "Where are you from?" — one at a time,
    waiting for the candidate's response between each.
  • After the warm-up, move to questions on familiar topics: home, work or
    study, hobbies, daily routine, food. Pick ONE topic at a time and ask
    3–4 short follow-up questions on it, then move to the next topic.
  • Keep questions concrete and personal ("Do you live in a house or a flat?",
    "What do you usually have for breakfast?").
  • You may briefly acknowledge an answer ("OK", "I see", "Mm-hm") but do
    NOT give feedback or correction.
"""

_PART3_GUIDANCE = """\
This is **Part 3** of the IELTS Speaking test (4–5 minutes total).

Your job:
  • The candidate has just finished a Part 2 monologue on a topic. Move into
    a two-way discussion of related abstract questions.
  • Ask questions that require analysis, comparison, prediction, or
    evaluation — not personal narrative.
  • Push for development: if a candidate gives a short answer, ask "Why do
    you think that is?" or "Could you give me an example?".
  • Stay neutral; do NOT volunteer your own opinion at length, and do NOT
    correct or coach the candidate.
"""

_BASE_SYSTEM_PROMPT = """\
You are Liz, an IELTS Speaking examiner. You are conducting a live oral
exam with the candidate. You speak British-English at a natural,
conversational pace.

CRITICAL RULES:
  1. You are an EXAMINER, not a tutor. Do NOT give feedback, scores, hints,
     vocabulary suggestions, or grammar corrections during the session. The
     candidate's performance is evaluated after the session ends.
  2. Ask ONE question per turn and then wait for the candidate to answer.
  3. Keep your turns short — usually 1 sentence, occasionally 2.
  4. Do NOT explain that you are an AI, do NOT break the IELTS frame.
  5. If the candidate asks the meaning of a word or for help, respond with
     a polite redirect: "I'm afraid I can't help with that during the test —
     just answer as best you can."
"""


def build_system_prompt(part: str, topic: str | None) -> str:
    """Build the Liz examiner system prompt for the requested part."""
    section = _PART1_GUIDANCE if part == "part1" else _PART3_GUIDANCE
    parts = [_BASE_SYSTEM_PROMPT, section]
    if topic:
        parts.append(
            f"\nThe candidate has chosen the topic seed **{topic}** — work this "
            "in naturally, but follow the IELTS Part {n} structure above.".format(
                n=1 if part == "part1" else 3
            )
        )
    return "\n".join(parts)


# ---------------------------------------------------------------------------
# Faz 3.5 — candidate audio → evaluator wiring
# ---------------------------------------------------------------------------
# Browser sends PCM16 16kHz mono. We accumulate it server-side, then on close
# wrap it in a WAV header and feed it to the existing speaking evaluator
# (transcode_to_wav re-encodes through ffmpeg anyway, but giving it a real
# WAV avoids any fmt-detection ambiguity). Eval runs only when user_id is
# present in the init frame — anonymous Liz Live sessions still work for
# unauthenticated browser smoke tests.

# Below this many bytes (PCM16 16kHz mono = 32000 B/sec) we don't bother
# scoring — too short for a reliable IELTS estimate. 5 seconds.
_MIN_AUDIO_BYTES_FOR_EVAL = 32_000 * 5


def _pcm16_mono_to_wav(chunks: list[bytes], sample_rate: int = 16_000) -> bytes:
    """Concatenate PCM16 mono chunks and wrap in a WAV container."""
    buf = io.BytesIO()
    with wave.open(buf, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)  # PCM16
        wf.setframerate(sample_rate)
        wf.writeframes(b"".join(chunks))
    return buf.getvalue()


async def _evaluate_candidate(
    *,
    part: str,
    topic: str | None,
    audio_chunks: list[bytes],
    user_language: str,
    target_band: float,
) -> dict[str, Any]:
    """Run the speaking evaluator on the accumulated candidate audio.

    Mirrors the slim path of `routes/speaking_unified.evaluate` — just the
    LLM scoring, no quota check / persistence (those belong to Faz 3.6).
    Lazy-imports so this module loads even when the evaluator deps are
    missing.
    """
    from schemas.speaking_evaluator import SpeakingEvaluationRequest, SpeakingPart
    from services.speaking_evaluator import evaluate_speaking

    try:
        part_enum = SpeakingPart(part)
    except ValueError:
        part_enum = SpeakingPart.part1

    # Liz Live has no cue-card monologue prompt — surface the topic seed (or
    # a generic Part-N description) so the evaluator prompt has something to
    # ground criteria against.
    cue_prompt = (
        f"IELTS Speaking {part_enum.value.upper()} — conversational session"
        + (f" on the topic of {topic}" if topic else "")
    )

    audio_wav = _pcm16_mono_to_wav(audio_chunks)
    duration_seconds = sum(len(c) for c in audio_chunks) / (16_000 * 2)

    req = SpeakingEvaluationRequest(
        part=part_enum,
        cue_card_prompt=cue_prompt,
        cue_card_bullets=[],
        user_language=user_language or "en",
        target_band=float(target_band) if target_band else 7.0,
        duration_seconds=duration_seconds,
    )
    result = await evaluate_speaking(req, audio_wav)
    dump = result.model_dump()
    dump["part"] = req.part.value
    dump["cue_card_prompt"] = req.cue_card_prompt
    return dump


# ---------------------------------------------------------------------------
# WebSocket endpoint
# ---------------------------------------------------------------------------


async def _send_json(ws: WebSocket, payload: dict[str, Any]) -> None:
    try:
        await ws.send_text(json.dumps(payload))
    except Exception:
        # Browser likely disconnected; let the outer pump handle teardown.
        logger.debug("send_json failed (client likely closed)")


async def _pump_browser_to_gemini(
    ws: WebSocket,
    session: Any,
    candidate_audio_chunks: list[bytes],
) -> str:
    """Forward client audio frames (and optional control messages) to Gemini.
    Returns the close reason ('client_close' | 'client_disconnect')."""
    while True:
        try:
            text = await ws.receive_text()
        except WebSocketDisconnect:
            return "client_disconnect"

        try:
            msg = json.loads(text)
        except json.JSONDecodeError:
            await _send_json(ws, {"type": "error", "message": "invalid_json"})
            continue

        mtype = msg.get("type")
        if mtype == "audio":
            b64 = msg.get("data")
            if not isinstance(b64, str) or not b64:
                continue
            try:
                pcm = base64.b64decode(b64, validate=True)
            except (ValueError, TypeError):
                await _send_json(ws, {"type": "error", "message": "audio_decode_failed"})
                continue
            candidate_audio_chunks.append(pcm)
            # Stream to Gemini using realtime input (PCM 16kHz mono 16-bit).
            await session.send_realtime_input(
                audio=_make_blob(pcm, mime_type="audio/pcm;rate=16000")
            )
        elif mtype == "audio_end":
            # Optional explicit end-of-turn signal from the client.
            await session.send_realtime_input(audio_stream_end=True)
        elif mtype == "text":
            text_content = msg.get("text") or ""
            if text_content:
                await session.send_client_content(
                    turns={"role": "user", "parts": [{"text": text_content}]},
                    turn_complete=True,
                )
        elif mtype == "close":
            return "client_close"
        else:
            await _send_json(ws, {"type": "error", "message": f"unknown_type:{mtype}"})


def _make_blob(data: bytes, *, mime_type: str):
    """Wrap raw PCM in a google-genai Blob. Imported lazily so the module
    loads even when google-genai is missing (route just becomes unavailable
    rather than crashing the server startup)."""
    from google.genai import types as gtypes

    return gtypes.Blob(data=data, mime_type=mime_type)


async def _pump_gemini_to_browser(ws: WebSocket, session: Any) -> str:
    """Forward Gemini audio + transcripts to the browser. Returns the close
    reason ('gemini_eof' | 'gemini_error:<...>')."""
    audio_chunks_sent = 0
    transcript_frames_sent = 0
    turns_completed = 0
    try:
        async for response in session.receive():
            sc = response.server_content
            if sc and sc.model_turn:
                for part in sc.model_turn.parts or []:
                    inline = getattr(part, "inline_data", None)
                    if inline and inline.data:
                        await _send_json(
                            ws,
                            {
                                "type": "audio",
                                "data": base64.b64encode(inline.data).decode("ascii"),
                            },
                        )
                        audio_chunks_sent += 1
            if sc and sc.input_transcription and sc.input_transcription.text:
                await _send_json(
                    ws,
                    {
                        "type": "transcript",
                        "role": "candidate",
                        "text": sc.input_transcription.text,
                    },
                )
                transcript_frames_sent += 1
            if sc and sc.output_transcription and sc.output_transcription.text:
                await _send_json(
                    ws,
                    {
                        "type": "transcript",
                        "role": "examiner",
                        "text": sc.output_transcription.text,
                    },
                )
                transcript_frames_sent += 1
            if sc and sc.turn_complete:
                await _send_json(ws, {"type": "turn_complete"})
                turns_completed += 1
            # `go_away` is Gemini Live's early-disconnect signal (often
            # session token expiry or quota). Surface it so the client knows
            # the close was server-side, not user-initiated.
            go_away = getattr(sc, "go_away", None) if sc else None
            if go_away is not None:
                logger.warning(
                    "Liz Live: Gemini sent go_away (time_left=%s) — "
                    "audio_chunks=%d transcripts=%d turns=%d",
                    getattr(go_away, "time_left", "?"),
                    audio_chunks_sent, transcript_frames_sent, turns_completed,
                )
        logger.info(
            "Liz Live: Gemini stream ended cleanly — audio_chunks=%d "
            "transcripts=%d turns=%d",
            audio_chunks_sent, transcript_frames_sent, turns_completed,
        )
        return "gemini_eof"
    except asyncio.CancelledError:
        raise
    except Exception as exc:  # noqa: BLE001
        logger.warning(
            "Gemini pump error: %s — audio_chunks=%d transcripts=%d turns=%d",
            exc, audio_chunks_sent, transcript_frames_sent, turns_completed,
        )
        await _send_json(ws, {"type": "error", "message": f"gemini_error:{exc.__class__.__name__}"})
        return f"gemini_error:{exc.__class__.__name__}"


@router.websocket("/ws")
async def liz_live_ws(ws: WebSocket) -> None:
    """Single-session Liz Live WebSocket. First client frame must be `init`."""
    await ws.accept()

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        await _send_json(ws, {"type": "error", "message": "gemini_api_key_missing"})
        await ws.close(code=1011)
        return

    # Lazy import — keeps import-time failures from breaking server startup.
    try:
        from google import genai
        from google.genai import types as gtypes
    except ImportError:
        await _send_json(ws, {"type": "error", "message": "google_genai_not_installed"})
        await ws.close(code=1011)
        return

    # First frame: init
    try:
        init_text = await asyncio.wait_for(ws.receive_text(), timeout=10.0)
    except (asyncio.TimeoutError, WebSocketDisconnect):
        await ws.close(code=4000)
        return
    try:
        init = json.loads(init_text)
    except json.JSONDecodeError:
        await _send_json(ws, {"type": "error", "message": "invalid_init_json"})
        await ws.close(code=4001)
        return

    if init.get("type") != "init":
        await _send_json(ws, {"type": "error", "message": "expected_init_frame"})
        await ws.close(code=4002)
        return

    part = init.get("part") or "part1"
    if part not in ("part1", "part3"):
        # Memory: Liz Live aktif Part 1 + Part 3'te. Part 2 monologue.
        await _send_json(ws, {"type": "error", "message": f"part_not_supported:{part}"})
        await ws.close(code=4003)
        return

    topic = init.get("topic")
    model = init.get("model") or os.environ.get("LIZ_LIVE_MODEL", DEFAULT_LIVE_MODEL)
    system_prompt = build_system_prompt(part=part, topic=topic)

    # Faz 3.5: optional evaluator wiring. Eval runs only when user_id is
    # supplied; anonymous sessions stream audio + transcripts without scoring.
    user_id = init.get("user_id") or None
    user_language = init.get("user_language") or "en"
    try:
        target_band = float(init.get("target_band") or 7.0)
    except (TypeError, ValueError):
        target_band = 7.0

    client = genai.Client(api_key=api_key, http_options={"api_version": "v1beta"})

    # Tune VAD for IELTS candidates: Part 1/3 examinees take 1–2s thinking
    # pauses mid-answer. With Gemini's default VAD (~500 ms silence ⇒ turn
    # end), Liz interrupts and the session can collapse after a single turn.
    # Lower the sensitivity and stretch silence_duration_ms so a thoughtful
    # pause doesn't get classified as end-of-speech.
    realtime_input_cfg = None
    try:
        realtime_input_cfg = gtypes.RealtimeInputConfig(
            automatic_activity_detection=gtypes.AutomaticActivityDetection(
                disabled=False,
                start_of_speech_sensitivity=gtypes.StartSensitivity.START_SENSITIVITY_LOW,
                end_of_speech_sensitivity=gtypes.EndSensitivity.END_SENSITIVITY_LOW,
                prefix_padding_ms=200,
                silence_duration_ms=1500,
            ),
        )
    except Exception as exc:  # pragma: no cover — older SDKs without these types
        logger.warning("Liz Live: VAD config unavailable (%s) — falling back to default", exc)

    config_kwargs: dict[str, Any] = dict(
        response_modalities=[gtypes.Modality.AUDIO],
        input_audio_transcription=gtypes.AudioTranscriptionConfig(),
        output_audio_transcription=gtypes.AudioTranscriptionConfig(),
        system_instruction=gtypes.Content(
            parts=[gtypes.Part(text=system_prompt)],
        ),
    )
    if realtime_input_cfg is not None:
        config_kwargs["realtime_input_config"] = realtime_input_cfg
    config = gtypes.LiveConnectConfig(**config_kwargs)

    candidate_audio_chunks: list[bytes] = []  # accumulated for downstream eval
    close_reason: str = "unknown"

    try:
        async with client.aio.live.connect(model=model, config=config) as session:
            await _send_json(ws, {"type": "ready"})

            # Kick off the examiner: send a synthetic "begin" turn so Liz
            # speaks first per the system prompt's opening protocol.
            await session.send_client_content(
                turns=gtypes.Content(
                    parts=[gtypes.Part(text="(Begin the test. Greet the candidate and ask the first question.)")],
                    role="user",
                ),
                turn_complete=True,
            )

            client_pump = asyncio.create_task(
                _pump_browser_to_gemini(ws, session, candidate_audio_chunks),
                name="liz-live-client-pump",
            )
            gemini_pump = asyncio.create_task(
                _pump_gemini_to_browser(ws, session),
                name="liz-live-gemini-pump",
            )

            done, pending = await asyncio.wait(
                {client_pump, gemini_pump}, return_when=asyncio.FIRST_COMPLETED
            )
            for task in pending:
                task.cancel()
            for task in done:
                # propagate first reason
                if close_reason == "unknown":
                    try:
                        close_reason = task.result() or "unknown"
                    except Exception as exc:  # noqa: BLE001
                        close_reason = f"pump_error:{exc.__class__.__name__}"
            # Wait for cancellations to settle so we don't leak the live session
            for task in pending:
                try:
                    await task
                except (asyncio.CancelledError, Exception):  # noqa: BLE001
                    pass
    except Exception as exc:  # noqa: BLE001
        logger.exception("liz_live_ws fatal error")
        await _send_json(ws, {"type": "error", "message": f"fatal:{exc.__class__.__name__}"})
        close_reason = f"fatal:{exc.__class__.__name__}"
    finally:
        audio_bytes_total = sum(len(c) for c in candidate_audio_chunks)

        # Faz 3.5: opportunistic post-session evaluation. Skipped silently
        # when no user_id, audio too short, or evaluator dependencies are
        # unavailable — the WS still closes cleanly so the UI can recap.
        if user_id and audio_bytes_total >= _MIN_AUDIO_BYTES_FOR_EVAL:
            try:
                eval_result = await _evaluate_candidate(
                    part=part,
                    topic=topic,
                    audio_chunks=candidate_audio_chunks,
                    user_language=user_language,
                    target_band=target_band,
                )
                await _send_json(ws, {"type": "evaluation", "data": eval_result})
            except Exception as exc:  # noqa: BLE001
                logger.warning("liz_live evaluation failed: %s", exc)
                await _send_json(
                    ws,
                    {
                        "type": "evaluation_error",
                        "message": f"{exc.__class__.__name__}: {exc}",
                    },
                )

        await _send_json(
            ws,
            {
                "type": "closed",
                "reason": close_reason,
                "candidate_audio_bytes": audio_bytes_total,
            },
        )
        try:
            await ws.close()
        except Exception:
            pass
