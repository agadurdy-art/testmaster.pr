/**
 * useElevenLabsLiz
 * ----------------
 * Wraps @elevenlabs/react's useConversation hook and the two server endpoints
 * (/api/liz_eleven/token, /api/liz_eleven/finalize) into a single surface the
 * VoiceOverlay component can consume.
 *
 * Lifecycle:
 *   1. caller invokes start({ part, cueCard, part2Theme, part2Transcript })
 *   2. POST /api/liz_eleven/token — server validates plan + mints token
 *   3. parallel getUserMedia + MediaRecorder created — recorder waits for the
 *      SDK status='connected' tick so its t=0 lines up with ElevenLabs'
 *      time_in_call_secs origin (used later by extractUserAudio)
 *   4. SDK.startSession({ signedUrl|conversationToken, dynamicVariables })
 *   5. while live: track elapsedSeconds, surface mode/isSpeaking/isListening
 *      and frequency data for the visual orb/bars
 *   6. caller invokes stop() — recorder finalises, then SDK.endSession +
 *      POST /api/liz_eleven/finalize, then we slice the raw recording into a
 *      user-only WAV (extractUserAudio) and expose it as `userAudioBlob` so
 *      callers can ship it to /api/speaking/evaluate for word-level Azure
 *      pronunciation feedback.
 *
 * Why a thin wrapper instead of using SDK + fetch directly in VoiceOverlay:
 *   keeps the network/quota plumbing out of the visual component, and means
 *   future Liz surfaces (Cambridge full test, smart practice) can reuse it.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useConversation } from '@elevenlabs/react';

import { extractUserAudio, userTranscriptFromTurns } from '../lib/extractUserAudio';
import { authHeader } from '../../../lib/authToken';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const PHASES = Object.freeze({
  IDLE: 'idle',
  REQUESTING_TOKEN: 'requesting_token',
  CONNECTING: 'connecting',
  LIVE: 'live',
  FINALIZING: 'finalizing',
  ENDED: 'ended',
  ERROR: 'error',
});

function readError(payload, fallback) {
  if (!payload) return fallback;
  if (typeof payload === 'string') return payload;
  const detail = payload.detail || payload;
  if (typeof detail === 'string') return detail;
  return detail?.message || fallback;
}

function pickRecorderMime() {
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/ogg',
  ];
  if (typeof MediaRecorder === 'undefined') return '';
  for (const mime of candidates) {
    try {
      if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(mime)) return mime;
    } catch (_e) { /* keep trying */ }
  }
  return '';
}

export default function useElevenLabsLiz({ userId } = {}) {
  const conversation = useConversation();

  const [phase, setPhase] = useState(PHASES.IDLE);
  const [error, setError] = useState(null);
  const [errorCode, setErrorCode] = useState(null);
  const [quota, setQuota] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [transcriptTurns, setTranscriptTurns] = useState([]);
  const [part2Theme, setPart2Theme] = useState(null);
  const [activePart, setActivePart] = useState(null);
  // User-only audio derived from the raw mic recording + transcript turns.
  // Populated AFTER stop() resolves; callers that auto-submit an evaluation
  // should use the value returned by stop() to avoid an extra render tick.
  const [userAudioBlob, setUserAudioBlob] = useState(null);
  const [userTranscript, setUserTranscript] = useState('');

  // Refs that survive re-renders without retriggering effects.
  const startedAtRef = useRef(null);
  const tickRef = useRef(null);
  const conversationIdRef = useRef(null);
  const partRef = useRef(null);

  // Parallel-recorder refs. We keep the raw MediaStream so we can stop tracks
  // on cleanup; the chunks array is filled by recorder.ondataavailable.
  const micStreamRef = useRef(null);
  const recorderRef = useRef(null);
  const recorderChunksRef = useRef([]);
  const recorderMimeRef = useRef('');
  const recorderStartedRef = useRef(false);

  // Tick elapsed seconds while LIVE so the UI can render a duration counter
  // and we have a client-side fallback in case the ElevenLabs metadata.duration
  // is missing on finalize.
  useEffect(() => {
    if (phase !== PHASES.LIVE) {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
      return undefined;
    }
    startedAtRef.current = Date.now();
    tickRef.current = setInterval(() => {
      const started = startedAtRef.current;
      if (!started) return;
      setElapsedSeconds(Math.floor((Date.now() - started) / 1000));
    }, 1000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      tickRef.current = null;
    };
  }, [phase]);

  // Capture conversationId and START THE PARALLEL RECORDER once SDK status
  // flips to 'connected'. We start the recorder here (not earlier) so its
  // t=0 aligns with ElevenLabs' time_in_call_secs — that alignment is what
  // extractUserAudio relies on to slice user-only spans.
  useEffect(() => {
    if (conversation.status !== 'connected') return;
    if (conversationIdRef.current) return;
    let id = null;
    try {
      id = conversation.getId?.() || null;
    } catch (_e) {
      id = null;
    }
    if (id) {
      conversationIdRef.current = id;
      setConversationId(id);
    }
    // Kick the parallel recorder.
    const rec = recorderRef.current;
    if (rec && !recorderStartedRef.current && rec.state === 'inactive') {
      try {
        rec.start();
        recorderStartedRef.current = true;
      } catch (e) {
        // Recorder failed to start — eval pipeline degrades to transcript-only.
        // We log but don't fail the session.
        // eslint-disable-next-line no-console
        console.warn('[useElevenLabsLiz] parallel recorder failed to start:', e);
      }
    }
    setPhase(PHASES.LIVE);
  }, [conversation.status, conversation]);

  // Tear down mic + recorder. Safe to call multiple times. Resolves with the
  // raw recording blob (or null) once the recorder's final dataavailable
  // event has flushed.
  const stopParallelRecorder = useCallback(() => {
    return new Promise((resolve) => {
      const rec = recorderRef.current;
      if (!rec) {
        resolve(null);
        return;
      }
      const finalize = () => {
        const chunks = recorderChunksRef.current;
        const blob = chunks.length
          ? new Blob(chunks, { type: recorderMimeRef.current || 'audio/webm' })
          : null;
        // Free the mic.
        const stream = micStreamRef.current;
        if (stream) {
          try { stream.getTracks().forEach((t) => t.stop()); } catch (_e) {}
        }
        micStreamRef.current = null;
        recorderRef.current = null;
        recorderChunksRef.current = [];
        recorderStartedRef.current = false;
        resolve(blob);
      };
      if (rec.state === 'inactive') {
        finalize();
        return;
      }
      // onstop fires after the final dataavailable event, so the chunks ref is
      // complete by the time we build the blob.
      rec.onstop = finalize;
      try { rec.stop(); } catch (_e) { finalize(); }
    });
  }, []);

  const reset = useCallback(() => {
    // Best-effort cleanup if reset() is called without a prior stop().
    const stream = micStreamRef.current;
    if (stream) {
      try { stream.getTracks().forEach((t) => t.stop()); } catch (_e) {}
    }
    micStreamRef.current = null;
    recorderRef.current = null;
    recorderChunksRef.current = [];
    recorderStartedRef.current = false;

    setPhase(PHASES.IDLE);
    setError(null);
    setErrorCode(null);
    setConversationId(null);
    setElapsedSeconds(0);
    setTranscript('');
    setTranscriptTurns([]);
    setPart2Theme(null);
    setActivePart(null);
    setUserAudioBlob(null);
    setUserTranscript('');
    conversationIdRef.current = null;
    partRef.current = null;
    startedAtRef.current = null;
  }, []);

  const start = useCallback(async ({
    part = 'part1',
    cueCardTopic = '',
    cueCardBullets = [],
    part2Theme: incomingTheme = null,
    part2Transcript: incomingTranscript = null,
  } = {}) => {
    if (!userId) {
      setPhase(PHASES.ERROR);
      setError('Missing user id — please refresh and sign in again.');
      setErrorCode('no_user_id');
      return false;
    }

    setError(null);
    setErrorCode(null);
    setConversationId(null);
    conversationIdRef.current = null;
    setElapsedSeconds(0);
    setTranscript('');
    setTranscriptTurns([]);
    setPart2Theme(null);
    setUserAudioBlob(null);
    setUserTranscript('');
    partRef.current = part;
    setActivePart(part);
    setPhase(PHASES.REQUESTING_TOKEN);

    let tokenPayload = null;
    try {
      const res = await fetch(`${API_URL}/api/liz_eleven/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          part,
          cue_card_topic: cueCardTopic || null,
          cue_card_bullets: cueCardBullets?.length ? cueCardBullets : null,
          part2_theme: incomingTheme || null,
          part2_transcript: incomingTranscript || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const code = data?.detail?.code || 'token_failed';
        const msg = readError(data, 'Could not start a Liz session.');
        if (data?.detail?.quota) setQuota(data.detail.quota);
        setPhase(PHASES.ERROR);
        setError(msg);
        setErrorCode(code);
        return false;
      }
      tokenPayload = data;
      if (data.quota) setQuota(data.quota);
    } catch (e) {
      setPhase(PHASES.ERROR);
      setError('Network error reaching Liz. Please try again.');
      setErrorCode('network');
      return false;
    }

    // Spin up the parallel mic recorder BEFORE startSession so the stream is
    // ready by the time SDK status flips to 'connected'. We don't .start() the
    // recorder yet — that happens in the connected effect to keep its clock
    // origin aligned with ElevenLabs' time_in_call_secs.
    try {
      if (typeof MediaRecorder !== 'undefined' && navigator?.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        const mime = pickRecorderMime();
        const recorder = mime
          ? new MediaRecorder(stream, { mimeType: mime })
          : new MediaRecorder(stream);
        recorderChunksRef.current = [];
        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            recorderChunksRef.current.push(event.data);
          }
        };
        micStreamRef.current = stream;
        recorderRef.current = recorder;
        recorderMimeRef.current = recorder.mimeType || mime || 'audio/webm';
        recorderStartedRef.current = false;
      }
    } catch (e) {
      // Mic permission denied or device unavailable — still allow the live
      // session (Liz can hear via SDK), just without word-level eval.
      // eslint-disable-next-line no-console
      console.warn('[useElevenLabsLiz] parallel recorder unavailable:', e);
    }

    setPhase(PHASES.CONNECTING);
    try {
      const connectionType = tokenPayload.connection_type || 'websocket';
      const sessionArgs = {
        connectionType,
        dynamicVariables: tokenPayload.conversation_dynamic_variables || {},
      };
      if (connectionType === 'websocket' && tokenPayload.signed_url) {
        sessionArgs.signedUrl = tokenPayload.signed_url;
      } else if (tokenPayload.conversation_token) {
        sessionArgs.conversationToken = tokenPayload.conversation_token;
      } else if (tokenPayload.signed_url) {
        sessionArgs.connectionType = 'websocket';
        sessionArgs.signedUrl = tokenPayload.signed_url;
      }

      // Part 3 is a CONTINUATION — the candidate has already been greeted in
      // Part 1, so Liz must not re-greet or re-ask their name. Override the
      // agent's opening line to go straight into the discussion. (Part 1 keeps
      // the default greeting; Part 2 isn't a Liz conversation.) Guarded: if the
      // agent doesn't allow first-message overrides, retry without so the
      // session still connects.
      const firstMessageOverride =
        part === 'part3'
          ? "Thank you. Now I'd like to ask you some broader, more general questions related to that topic. Let's begin."
          : null;
      if (firstMessageOverride) {
        sessionArgs.overrides = { agent: { firstMessage: firstMessageOverride } };
      }

      try {
        await conversation.startSession(sessionArgs);
      } catch (overrideErr) {
        if (sessionArgs.overrides) {
          // Most likely the agent's first-message override isn't enabled in its
          // ElevenLabs security settings — fall back to the default opening.
          // eslint-disable-next-line no-console
          console.warn('[useElevenLabsLiz] first-message override rejected, retrying without:', overrideErr);
          delete sessionArgs.overrides;
          await conversation.startSession(sessionArgs);
        } else {
          throw overrideErr;
        }
      }
      // status='connected' effect will flip phase to LIVE, capture id, AND
      // start the parallel recorder so its clock matches the ElevenLabs call.
      return true;
    } catch (e) {
      setPhase(PHASES.ERROR);
      setError(e?.message || 'Could not connect to Liz.');
      setErrorCode('sdk_connect');
      return false;
    }
  }, [userId, conversation]);

  const stop = useCallback(async () => {
    const cid = conversationIdRef.current;
    const part = partRef.current || 'part1';
    const elapsed = startedAtRef.current
      ? Math.floor((Date.now() - startedAtRef.current) / 1000)
      : elapsedSeconds;

    setPhase(PHASES.FINALIZING);

    // Stop the parallel recorder first so it captures the trailing audio
    // before the SDK tears down the mic.
    const rawAudioBlob = await stopParallelRecorder();

    try {
      conversation.endSession?.();
    } catch (_e) {
      // SDK throws if already disconnected — ignore.
    }

    if (!cid) {
      // Connection never reached 'connected'. Nothing to finalize.
      setPhase(PHASES.ENDED);
      return {
        transcript: '',
        transcript_turns: [],
        part2_theme: null,
        user_audio_blob: null,
        user_transcript: '',
      };
    }

    let finalizeData = null;
    try {
      const res = await fetch(`${API_URL}/api/liz_eleven/finalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          conversation_id: cid,
          part,
          elapsed_seconds: elapsed,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPhase(PHASES.ERROR);
        setError(readError(data, 'Failed to save the conversation.'));
        setErrorCode(data?.detail?.code || 'finalize_failed');
        return null;
      }
      finalizeData = data;
      setTranscript(data.transcript || '');
      setTranscriptTurns(data.transcript_turns || []);
      setPart2Theme(data.part2_theme || null);
      if (data.quota) setQuota(data.quota);
    } catch (e) {
      setPhase(PHASES.ERROR);
      setError('Could not save the conversation transcript.');
      setErrorCode('finalize_network');
      return null;
    }

    // Build the user-only audio blob from the raw recording + turn timestamps.
    // The return value lets auto-submit flows POST evaluate immediately
    // without waiting on a re-render of userAudioBlob state.
    let userBlob = null;
    if (rawAudioBlob && finalizeData?.transcript_turns?.length) {
      try {
        userBlob = await extractUserAudio({
          rawBlob: rawAudioBlob,
          transcriptTurns: finalizeData.transcript_turns,
          durationSecs: elapsed,
        });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('[useElevenLabsLiz] extractUserAudio failed:', e);
        userBlob = null;
      }
    }
    // Safety net: if user-only extraction produced nothing (no turns, missing
    // timing, decode failure) but we DID record the conversation, ship the raw
    // recording so Part 1/3 are never silently lost. Better a noisier transcript
    // than no result. Only truly empty recordings stay null.
    if (!userBlob && rawAudioBlob && rawAudioBlob.size > 1200) {
      // eslint-disable-next-line no-console
      console.warn('[useElevenLabsLiz] using raw conversation audio (user-only extraction unavailable)');
      userBlob = rawAudioBlob;
    }
    setUserAudioBlob(userBlob);
    const userText = userTranscriptFromTurns(finalizeData?.transcript_turns || []);
    setUserTranscript(userText);

    setPhase(PHASES.ENDED);
    return {
      ...finalizeData,
      user_audio_blob: userBlob,
      user_transcript: userText,
    };
  }, [userId, conversation, elapsedSeconds, stopParallelRecorder]);

  /**
   * Fetch latest quota without starting a session — used by the composer chip
   * to show "12:34 left this week" before the user clicks Talk with Liz.
   */
  const refreshQuota = useCallback(async () => {
    if (!userId) return null;
    try {
      const res = await fetch(`${API_URL}/api/users/${userId}`, { headers: { ...authHeader() } });
      const u = await res.json().catch(() => null);
      if (u && typeof u.liz_live_seconds_remaining === 'number') {
        setQuota((prev) => ({
          ...(prev || {}),
          seconds_remaining: u.liz_live_seconds_remaining,
        }));
      }
      return quota;
    } catch (_e) {
      return null;
    }
  }, [userId, quota]);

  return {
    // lifecycle
    phase,
    isIdle: phase === PHASES.IDLE,
    isConnecting:
      phase === PHASES.REQUESTING_TOKEN || phase === PHASES.CONNECTING,
    isLive: phase === PHASES.LIVE,
    isFinalizing: phase === PHASES.FINALIZING,
    isEnded: phase === PHASES.ENDED,
    isError: phase === PHASES.ERROR,
    error,
    errorCode,
    // controls
    start,
    stop,
    reset,
    refreshQuota,
    // session metadata
    conversationId,
    elapsedSeconds,
    activePart,
    quota,
    transcript,
    transcriptTurns,
    part2Theme,
    // word-level eval inputs (populated after stop() resolves)
    userAudioBlob,
    userTranscript,
    // SDK passthrough — VoiceOverlay reads these for the orb / bars / mute UI
    sdkStatus: conversation.status, // 'disconnected' | 'connecting' | 'connected'
    mode: conversation.mode,         // 'speaking' | 'listening'
    isSpeaking: conversation.isSpeaking,
    isListening: conversation.isListening,
    isMuted: conversation.isMuted,
    setMuted: conversation.setMuted,
    getInputByteFrequencyData: conversation.getInputByteFrequencyData,
    getOutputByteFrequencyData: conversation.getOutputByteFrequencyData,
  };
}

export { PHASES as LIZ_PHASES };
