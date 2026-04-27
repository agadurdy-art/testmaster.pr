import { useCallback, useEffect, useRef, useState } from 'react';
import { useAudioRegistry } from '../../../contexts/AudioContext';

/**
 * useLizLive — bidirectional voice session with Liz over the
 * /api/speaking/liz-live/ws proxy (Gemini 2.5 Flash Live native audio).
 *
 * Why a fresh hook instead of reusing `useSpeakingRecorder` + `useAudio`:
 *   - Recorder uses `MediaRecorder` (webm/opus blob). Live needs raw PCM16
 *     16 kHz mono streamed continuously to the WebSocket — no blob, no
 *     final stop, frames every ~20 ms.
 *   - useAudio wraps HTMLAudioElement around a known URL. Liz audio
 *     arrives as a stream of PCM16 24 kHz base64 chunks; we schedule them
 *     on a Web Audio context with a sample-accurate gap-free queue.
 *
 * State machine:
 *   idle → connecting → ready
 *                    ↘  examiner_speaking ↔ candidate_speaking
 *                                    ↓
 *                              evaluating (Faz 3.5, optional)
 *                                    ↓
 *                                  ended
 *                       (any) → error
 *
 *   `examiner_speaking` is set as soon as audio frames start flowing back
 *   from the server; `candidate_speaking` while the mic is open and
 *   sending. They overlap — IELTS examiners interrupt — so the UI should
 *   treat them as independent flags rather than mutually exclusive.
 *
 *   `evaluating` is the window between user-stop and server-closed when
 *   `userId` was passed: the WS stays open while the server runs the
 *   evaluator on accumulated candidate audio. With no userId, the session
 *   goes straight from `ready` → `ended`.
 *
 * Public surface:
 *   const live = useLizLive();
 *   await live.start({ part: 'part1', topic: 'Hometown',
 *                      userId, targetBand, userLanguage });
 *   live.examinerTranscript     // accumulating string
 *   live.candidateTranscript    // accumulating string
 *   live.state                  // 'idle'|'connecting'|'ready'|'evaluating'|'ended'|'error'
 *   live.isExaminerSpeaking
 *   live.isCandidateSpeaking
 *   live.error                  // friendly string when state === 'error'
 *   live.evaluationResult       // SpeakingEvaluationResult or null
 *   live.evaluationError        // string or null when eval failed
 *   live.stop()                 // close cleanly (sends {type:"close"})
 */

// Wire format constants — must match backend routes/liz_live.py contract.
const MIC_SAMPLE_RATE = 16000;       // Gemini Live realtime input rate
const PLAYBACK_SAMPLE_RATE = 24000;  // Gemini native-audio output rate
const SCRIPT_PROCESSOR_BUFFER = 4096; // ~85ms at 48kHz; cheap and universal

function buildWsUrl(path) {
  // Honor an explicit override if the app uses a separate API origin.
  const override = process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_BACKEND_URL;
  if (override) {
    try {
      const u = new URL(override);
      const proto = u.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${proto}//${u.host}${path}`;
    } catch (_) { /* fall through */ }
  }
  if (typeof window === 'undefined') return path;
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${window.location.host}${path}`;
}

function pcm16FromFloat32(float32) {
  const out = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    let s = float32[i];
    if (s > 1) s = 1;
    else if (s < -1) s = -1;
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return out;
}

// Linear-interpolation downsampler from `srcRate` (e.g. 48000) to MIC_SAMPLE_RATE.
// Good enough for speech; AudioContext on most browsers will not give us 16kHz
// directly so we do the conversion in JS.
function downsampleTo16k(float32, srcRate) {
  if (srcRate === MIC_SAMPLE_RATE) return float32;
  const ratio = srcRate / MIC_SAMPLE_RATE;
  const outLen = Math.floor(float32.length / ratio);
  const out = new Float32Array(outLen);
  for (let i = 0; i < outLen; i++) {
    const srcIdx = i * ratio;
    const lo = Math.floor(srcIdx);
    const hi = Math.min(lo + 1, float32.length - 1);
    const t = srcIdx - lo;
    out[i] = float32[lo] * (1 - t) + float32[hi] * t;
  }
  return out;
}

function int16ToBase64(int16) {
  // Little-endian PCM16 — Web Audio is LE on every platform we ship.
  const bytes = new Uint8Array(int16.buffer, int16.byteOffset, int16.byteLength);
  let bin = '';
  // Chunk to keep String.fromCharCode argument list small.
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
  }
  return btoa(bin);
}

function base64ToInt16(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  // Copy out into a properly-aligned Int16Array buffer.
  const aligned = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(aligned).set(bytes);
  return new Int16Array(aligned);
}

function int16ToFloat32(int16) {
  const out = new Float32Array(int16.length);
  for (let i = 0; i < int16.length; i++) {
    out[i] = int16[i] < 0 ? int16[i] / 0x8000 : int16[i] / 0x7fff;
  }
  return out;
}

function mapMicError(err) {
  if (!err) return 'Could not open microphone.';
  switch (err.name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return 'Microphone access was denied. Allow it in your browser settings, then try again.';
    case 'NotFoundError':
    case 'DevicesNotFoundError':
      return 'No microphone was found. Connect one and try again.';
    case 'NotReadableError':
    case 'TrackStartError':
      return 'Your microphone is being used by another app. Close it and try again.';
    default:
      return err.message || String(err);
  }
}

export function useLizLive() {
  const [state, setState] = useState('idle');
  const [error, setError] = useState(null);
  const [examinerTranscript, setExaminerTranscript] = useState('');
  const [candidateTranscript, setCandidateTranscript] = useState('');
  const [isExaminerSpeaking, setIsExaminerSpeaking] = useState(false);
  const [isCandidateSpeaking, setIsCandidateSpeaking] = useState(false);

  const wsRef = useRef(null);
  const micCtxRef = useRef(null);
  const micStreamRef = useRef(null);
  const micSourceRef = useRef(null);
  const micProcessorRef = useRef(null);
  const playCtxRef = useRef(null);
  // Monotonic clock for gap-free playback scheduling. Reset on each start().
  const playCursorRef = useRef(0);
  const examinerSpeakingTimerRef = useRef(null);
  const mountedRef = useRef(true);
  const sessionActiveRef = useRef(false);
  // Faz 3.5: when true, send {type:close} but keep the WS open so we can
  // receive {type:evaluation} + {type:closed} from the server, then finalize.
  const evalPendingRef = useRef(false);
  const evalFallbackTimerRef = useRef(null);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [evaluationError, setEvaluationError] = useState(null);

  // ---- teardown helpers --------------------------------------------------
  // Two-phase shutdown:
  //   tearDownMedia() — stop mic + playback graphs (safe to run early so we
  //     don't keep recording while the server is scoring).
  //   finalizeSession(reason) — drop the WS and flip state to 'ended'.

  const tearDownMedia = useCallback(() => {
    try { micProcessorRef.current?.disconnect(); } catch (_) {}
    try { micSourceRef.current?.disconnect(); } catch (_) {}
    micProcessorRef.current = null;
    micSourceRef.current = null;
    try {
      micStreamRef.current?.getTracks().forEach((t) => t.stop());
    } catch (_) {}
    micStreamRef.current = null;
    try { micCtxRef.current?.close(); } catch (_) {}
    micCtxRef.current = null;

    try { playCtxRef.current?.close(); } catch (_) {}
    playCtxRef.current = null;
    playCursorRef.current = 0;

    if (examinerSpeakingTimerRef.current) {
      clearTimeout(examinerSpeakingTimerRef.current);
      examinerSpeakingTimerRef.current = null;
    }
    if (mountedRef.current) {
      setIsExaminerSpeaking(false);
      setIsCandidateSpeaking(false);
    }
  }, []);

  const finalizeSession = useCallback((reason) => {
    sessionActiveRef.current = false;
    evalPendingRef.current = false;
    if (evalFallbackTimerRef.current) {
      clearTimeout(evalFallbackTimerRef.current);
      evalFallbackTimerRef.current = null;
    }

    try {
      const ws = wsRef.current;
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close(1000, reason || 'client_close');
      }
    } catch (_) { /* ignore */ }
    wsRef.current = null;

    tearDownMedia();

    if (mountedRef.current) {
      // Don't clobber 'error' — the caller may have set state='error' first.
      setState((prev) => (prev === 'error' ? 'error' : 'ended'));
    }
  }, [tearDownMedia]);

  // Public stop — tries the graceful path (give server time to evaluate),
  // falls back to immediate finalize if eval isn't expected or never lands.
  const stopInternal = useCallback((reason) => {
    if (!sessionActiveRef.current && !evalPendingRef.current) return;

    // Mic + speakers off immediately — no point recording while the server scores.
    tearDownMedia();

    const ws = wsRef.current;
    const canAwaitEval =
      evalPendingRef.current && ws && ws.readyState === WebSocket.OPEN;

    // Tell the server we're done either way.
    try {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'close' }));
      }
    } catch (_) { /* ignore */ }

    if (!canAwaitEval || reason === 'unmount' || reason === 'preempted') {
      // No eval expected (anonymous session, error path, or hard teardown).
      finalizeSession(reason);
      return;
    }

    // Eval is in flight — flip to 'evaluating' and wait for the server's
    // {type:evaluation} + {type:closed} frames. Fallback timer guards
    // against the server hanging on the LLM call.
    sessionActiveRef.current = false;  // no more outbound audio
    if (mountedRef.current) {
      setState((prev) => (prev === 'error' ? 'error' : 'evaluating'));
    }
    if (evalFallbackTimerRef.current) clearTimeout(evalFallbackTimerRef.current);
    evalFallbackTimerRef.current = setTimeout(() => {
      if (evalPendingRef.current && mountedRef.current) {
        setEvaluationError('Evaluator timed out.');
      }
      finalizeSession('eval_timeout');
    }, 60_000);
  }, [tearDownMedia, finalizeSession]);

  const announceActive = useAudioRegistry({
    pause: () => {
      // Other players asking us to yield — close the session.
      // (Used on route changes via AudioProvider.)
      if (sessionActiveRef.current) stopInternal('preempted');
    },
  });

  // Cleanup on unmount.
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopInternal('unmount');
    };
  }, [stopInternal]);

  // ---- playback queue ----------------------------------------------------

  const enqueuePlayback = useCallback((int16) => {
    const ctx = playCtxRef.current;
    if (!ctx) return;
    const float = int16ToFloat32(int16);
    const buf = ctx.createBuffer(1, float.length, PLAYBACK_SAMPLE_RATE);
    buf.getChannelData(0).set(float);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);

    const now = ctx.currentTime;
    const startAt = Math.max(now, playCursorRef.current);
    src.start(startAt);
    playCursorRef.current = startAt + buf.duration;

    // Flag examiner-speaking until the queue drains. Reset the timer
    // each chunk so it stays true through silent gaps shorter than 250ms.
    if (mountedRef.current) setIsExaminerSpeaking(true);
    if (examinerSpeakingTimerRef.current) {
      clearTimeout(examinerSpeakingTimerRef.current);
    }
    const remaining = Math.max(0, playCursorRef.current - now) * 1000 + 250;
    examinerSpeakingTimerRef.current = setTimeout(() => {
      if (mountedRef.current) setIsExaminerSpeaking(false);
    }, remaining);
  }, []);

  // ---- start -------------------------------------------------------------

  const start = useCallback(async ({
    part = 'part1',
    topic,
    userId,
    targetBand,
    userLanguage,
  } = {}) => {
    if (sessionActiveRef.current) return;
    if (part !== 'part1' && part !== 'part3') {
      setError('Liz Live only runs Part 1 or Part 3.');
      setState('error');
      return;
    }

    setError(null);
    setEvaluationResult(null);
    setEvaluationError(null);
    setExaminerTranscript('');
    setCandidateTranscript('');
    setState('connecting');
    sessionActiveRef.current = true;
    // Eval is opt-in: only when userId is supplied (matches backend gate
    // in routes/liz_live.py — anonymous sessions skip scoring).
    evalPendingRef.current = !!userId;
    announceActive();

    // 1) Open mic first — if perms are denied, no point in talking to the server.
    let stream;
    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        throw Object.assign(new Error('mediaDevices unavailable'), { name: 'NotSupportedError' });
      }
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 },
      });
    } catch (err) {
      sessionActiveRef.current = false;
      if (mountedRef.current) {
        setError(mapMicError(err));
        setState('error');
      }
      return;
    }
    if (!mountedRef.current) {
      stream.getTracks().forEach((t) => t.stop());
      sessionActiveRef.current = false;
      return;
    }
    micStreamRef.current = stream;

    // 2) Build the mic graph. Use AudioContext default rate (usually 48kHz)
    //    and downsample in the processor — most browsers ignore an explicit
    //    sampleRate of 16000 on AudioContext.
    const Ctor = window.AudioContext || window.webkitAudioContext;
    const micCtx = new Ctor();
    micCtxRef.current = micCtx;

    const source = micCtx.createMediaStreamSource(stream);
    micSourceRef.current = source;

    // ScriptProcessorNode is deprecated but universally supported and
    // sufficient for 16kHz speech. Worklet upgrade is a future task.
    const processor = micCtx.createScriptProcessor(SCRIPT_PROCESSOR_BUFFER, 1, 1);
    micProcessorRef.current = processor;

    let lastSendActive = 0;
    processor.onaudioprocess = (ev) => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) return;
      const input = ev.inputBuffer.getChannelData(0);
      const down = downsampleTo16k(input, ev.inputBuffer.sampleRate);
      const pcm = pcm16FromFloat32(down);
      // Cheap voice-activity hint: any non-trivial RMS counts as "speaking".
      let sumSq = 0;
      for (let i = 0; i < input.length; i++) sumSq += input[i] * input[i];
      const rms = Math.sqrt(sumSq / input.length);
      const now = Date.now();
      if (rms > 0.01) {
        if (mountedRef.current) setIsCandidateSpeaking(true);
        lastSendActive = now;
      } else if (now - lastSendActive > 500) {
        if (mountedRef.current) setIsCandidateSpeaking(false);
      }
      try {
        ws.send(JSON.stringify({ type: 'audio', data: int16ToBase64(pcm) }));
      } catch (_) { /* socket may have closed mid-frame */ }
    };

    source.connect(processor);
    // ScriptProcessorNode only fires `onaudioprocess` once it's connected to
    // a destination — tie it to a muted gain so we don't echo the mic.
    const sink = micCtx.createGain();
    sink.gain.value = 0;
    processor.connect(sink);
    sink.connect(micCtx.destination);

    // 3) Build the playback context (separate from mic so latency tuning is
    //    independent and we can resume() it on a user gesture if needed).
    const playCtx = new Ctor({ sampleRate: PLAYBACK_SAMPLE_RATE });
    playCtxRef.current = playCtx;
    playCursorRef.current = 0;

    // 4) Open the WebSocket.
    let ws;
    try {
      ws = new WebSocket(buildWsUrl('/api/speaking/liz-live/ws'));
    } catch (err) {
      sessionActiveRef.current = false;
      if (mountedRef.current) {
        setError(`Could not open Liz Live: ${err.message || err}`);
        setState('error');
      }
      stopInternal('ws_construct_failed');
      return;
    }
    wsRef.current = ws;

    ws.onopen = () => {
      try {
        ws.send(JSON.stringify({
          type: 'init',
          part,
          topic: topic || null,
          user_id: userId || null,
          user_language: userLanguage || 'en',
          target_band: typeof targetBand === 'number' ? targetBand : 7.0,
        }));
      } catch (_) { /* ignore */ }
    };

    ws.onmessage = (ev) => {
      let msg;
      try { msg = JSON.parse(ev.data); }
      catch (_) { return; }
      switch (msg.type) {
        case 'ready':
          if (mountedRef.current) setState('ready');
          break;
        case 'audio':
          if (msg.data) {
            try { enqueuePlayback(base64ToInt16(msg.data)); }
            catch (_) { /* skip malformed chunk */ }
          }
          break;
        case 'transcript': {
          const text = msg.text || '';
          if (!text) break;
          if (msg.role === 'examiner') {
            if (mountedRef.current) setExaminerTranscript((prev) => prev + text);
          } else if (msg.role === 'candidate') {
            if (mountedRef.current) setCandidateTranscript((prev) => prev + text);
          }
          break;
        }
        case 'turn_complete':
          // Examiner finished — UI can prompt the candidate. We leave the
          // mic open; the candidate replies whenever they want.
          break;
        case 'evaluation':
          // Faz 3.5: post-session score from the evaluator. Arrives after
          // the user clicks End and before the server's `closed` frame.
          evalPendingRef.current = false;
          if (msg.data && mountedRef.current) {
            setEvaluationResult(msg.data);
          }
          break;
        case 'evaluation_error':
          evalPendingRef.current = false;
          if (mountedRef.current) {
            setEvaluationError(msg.message || 'Evaluation failed.');
          }
          break;
        case 'closed':
          // Either the server initiated (e.g. Gemini eof) or it acked our
          // close request. Either way, finalize without going through the
          // graceful eval-wait path again.
          evalPendingRef.current = false;
          finalizeSession(msg.reason || 'server_closed');
          break;
        case 'error':
          if (mountedRef.current) {
            setError(msg.message || 'Liz Live error');
            setState('error');
          }
          evalPendingRef.current = false;
          finalizeSession('server_error');
          break;
        default:
          break;
      }
    };

    ws.onerror = () => {
      if (mountedRef.current) {
        setError('Liz Live connection error.');
        setState('error');
      }
      evalPendingRef.current = false;
      finalizeSession('ws_error');
    };

    ws.onclose = (ev) => {
      // If we initiated, finalize already ran; this is for unexpected closes.
      if (sessionActiveRef.current || evalPendingRef.current) {
        evalPendingRef.current = false;
        finalizeSession(ev?.reason || 'ws_closed');
      }
    };
  }, [announceActive, enqueuePlayback, stopInternal, finalizeSession]);

  const stop = useCallback(() => {
    stopInternal('user_stop');
  }, [stopInternal]);

  return {
    state,
    error,
    examinerTranscript,
    candidateTranscript,
    isExaminerSpeaking,
    isCandidateSpeaking,
    isActive: state === 'connecting' || state === 'ready',
    isEvaluating: state === 'evaluating',
    evaluationResult,
    evaluationError,
    start,
    stop,
  };
}

export default useLizLive;
