/**
 * useElevenLabsLiz
 * ----------------
 * Wraps @elevenlabs/react's useConversation hook and the two server endpoints
 * (/api/liz_eleven/token, /api/liz_eleven/finalize) into a single surface the
 * VoiceOverlay component can consume.
 *
 * Lifecycle:
 *   1. caller invokes start({ part, cueCard, part2Theme, part2Transcript })
 *   2. POST /api/liz_eleven/token — server validates plan + mints WebRTC token
 *   3. SDK.startSession({ conversationToken, connectionType: 'webrtc',
 *                          dynamicVariables })
 *   4. while live: track elapsedSeconds, surface mode/isSpeaking/isListening
 *      and frequency data for the visual orb/bars
 *   5. caller invokes stop() — SDK.endSession + POST /api/liz_eleven/finalize
 *   6. resolved transcript + part2_theme + new quota returned to consumer
 *
 * Why a thin wrapper instead of using SDK + fetch directly in VoiceOverlay:
 *   keeps the network/quota plumbing out of the visual component, and means
 *   future Liz surfaces (Cambridge full test, smart practice) can reuse it.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useConversation } from '@elevenlabs/react';

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

  // Refs that survive re-renders without retriggering effects.
  const startedAtRef = useRef(null);
  const tickRef = useRef(null);
  const conversationIdRef = useRef(null);
  const partRef = useRef(null);

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

  // Capture conversationId once SDK status flips to 'connected'.
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
    setPhase(PHASES.LIVE);
  }, [conversation.status, conversation]);

  const reset = useCallback(() => {
    setPhase(PHASES.IDLE);
    setError(null);
    setErrorCode(null);
    setConversationId(null);
    setElapsedSeconds(0);
    setTranscript('');
    setTranscriptTurns([]);
    setPart2Theme(null);
    setActivePart(null);
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
        // Fallback: only signed_url available — force WebSocket.
        sessionArgs.connectionType = 'websocket';
        sessionArgs.signedUrl = tokenPayload.signed_url;
      }
      await conversation.startSession(sessionArgs);
      // status='connected' effect will flip phase to LIVE and capture id
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
    try {
      conversation.endSession?.();
    } catch (_e) {
      // SDK throws if already disconnected — ignore.
    }

    if (!cid) {
      // Connection never reached 'connected'. Nothing to finalize.
      setPhase(PHASES.ENDED);
      return { transcript: '', transcript_turns: [], part2_theme: null };
    }

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
      setTranscript(data.transcript || '');
      setTranscriptTurns(data.transcript_turns || []);
      setPart2Theme(data.part2_theme || null);
      if (data.quota) setQuota(data.quota);
      setPhase(PHASES.ENDED);
      return data;
    } catch (e) {
      setPhase(PHASES.ERROR);
      setError('Could not save the conversation transcript.');
      setErrorCode('finalize_network');
      return null;
    }
  }, [userId, conversation, elapsedSeconds]);

  /**
   * Fetch latest quota without starting a session — used by the composer chip
   * to show "12:34 left this week" before the user clicks Talk with Liz.
   */
  const refreshQuota = useCallback(async () => {
    if (!userId) return null;
    try {
      const res = await fetch(`${API_URL}/api/users/${userId}`);
      const u = await res.json().catch(() => null);
      // Lightweight: derive from user.liz_live_seconds_remaining if exposed,
      // otherwise rely on the value baked into the last token/finalize call.
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
