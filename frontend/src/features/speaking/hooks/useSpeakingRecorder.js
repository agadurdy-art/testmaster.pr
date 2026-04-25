import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Reusable speaking recorder for the unified `/api/speaking/evaluate`
 * surface. Owns the MediaRecorder + getUserMedia lifecycle, auto-stop
 * at a configurable max duration, friendly error mapping, and
 * deterministic blob/duration outputs that the route uploads expect.
 *
 *   const rec = useSpeakingRecorder({ maxDurationSec: 120 });
 *   rec.start();
 *   ...
 *   rec.stop();   // or auto-stop fires via maxDurationSec
 *   if (rec.blob) submit({ audio: rec.blob, durationSec: rec.durationSec });
 *
 * State machine:
 *   idle → starting → recording → stopped
 *                              └→ error
 *
 * Why a fresh hook instead of reusing `useSpeakingFlow`:
 *   `useSpeakingFlow` is a full state machine for V1 SpeakingPractice
 *   (prep → record → process → results). The D7 surfaces (QB, Cambridge,
 *   Full Test) own their own outer states and only need the mic plumbing.
 */

const PREFERRED_MIME_TYPES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/ogg;codecs=opus',
  'audio/ogg',
];

function pickMimeType() {
  if (typeof window === 'undefined' || !('MediaRecorder' in window)) return '';
  const isSupported = window.MediaRecorder.isTypeSupported;
  if (typeof isSupported !== 'function') return '';
  for (const mt of PREFERRED_MIME_TYPES) {
    try {
      if (isSupported.call(window.MediaRecorder, mt)) return mt;
    } catch (_) { /* ignore */ }
  }
  return '';
}

function mapMicError(err) {
  if (!err) return 'Could not start recording.';
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

export function useSpeakingRecorder({
  maxDurationSec = 120,
  audioConstraints,
} = {}) {
  const [state, setState] = useState('idle');
  const [blob, setBlob] = useState(null);
  const [mimeType, setMimeType] = useState('');
  const [durationSec, setDurationSec] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [error, setError] = useState(null);

  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const startedAtRef = useRef(0);
  const tickRef = useRef(null);
  const autoStopRef = useRef(null);
  const mountedRef = useRef(true);

  const cleanupTimers = useCallback(() => {
    if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
    if (autoStopRef.current) { clearTimeout(autoStopRef.current); autoStopRef.current = null; }
  }, []);

  const releaseStream = useCallback(() => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    } catch (_) { /* ignore */ }
    streamRef.current = null;
  }, []);

  const reset = useCallback(() => {
    cleanupTimers();
    try {
      const rec = recorderRef.current;
      if (rec && rec.state !== 'inactive') rec.stop();
    } catch (_) { /* ignore */ }
    recorderRef.current = null;
    releaseStream();
    chunksRef.current = [];
    startedAtRef.current = 0;
    if (mountedRef.current) {
      setState('idle');
      setBlob(null);
      setMimeType('');
      setDurationSec(0);
      setElapsedSec(0);
      setError(null);
    }
  }, [cleanupTimers, releaseStream]);

  // Best-effort cleanup on unmount so the mic indicator turns off when
  // the user navigates away mid-record.
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      cleanupTimers();
      try {
        const rec = recorderRef.current;
        if (rec && rec.state !== 'inactive') rec.stop();
      } catch (_) { /* ignore */ }
      releaseStream();
    };
  }, [cleanupTimers, releaseStream]);

  const stop = useCallback(() => {
    cleanupTimers();
    const rec = recorderRef.current;
    if (rec && rec.state !== 'inactive') {
      // The actual blob is assembled in `onstop`; just trigger it here.
      try { rec.stop(); } catch (_) { /* ignore */ }
    }
  }, [cleanupTimers]);

  const start = useCallback(async () => {
    if (state === 'recording' || state === 'starting') return;
    setError(null);
    setBlob(null);
    setDurationSec(0);
    setElapsedSec(0);
    setState('starting');

    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        throw Object.assign(new Error('mediaDevices unavailable'), { name: 'NotSupportedError' });
      }
      if (typeof window === 'undefined' || !('MediaRecorder' in window)) {
        throw Object.assign(new Error('MediaRecorder unavailable'), { name: 'NotSupportedError' });
      }

      const constraints = audioConstraints || {
        echoCancellation: true,
        noiseSuppression: true,
      };
      const stream = await navigator.mediaDevices.getUserMedia({ audio: constraints });
      if (!mountedRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      streamRef.current = stream;

      const mt = pickMimeType();
      const rec = mt
        ? new window.MediaRecorder(stream, { mimeType: mt })
        : new window.MediaRecorder(stream);
      recorderRef.current = rec;
      chunksRef.current = [];

      rec.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) chunksRef.current.push(ev.data);
      };
      rec.onerror = (ev) => {
        if (!mountedRef.current) return;
        cleanupTimers();
        releaseStream();
        setError(mapMicError(ev?.error));
        setState('error');
      };
      rec.onstop = () => {
        const finalDuration = startedAtRef.current
          ? (Date.now() - startedAtRef.current) / 1000
          : 0;
        const effectiveType = rec.mimeType || mt || 'audio/webm';
        const out = new Blob(chunksRef.current, { type: effectiveType });
        chunksRef.current = [];
        cleanupTimers();
        releaseStream();
        if (!mountedRef.current) return;
        if (out.size === 0) {
          setError('No audio was captured. Check your microphone and try again.');
          setState('error');
          return;
        }
        setBlob(out);
        setMimeType(effectiveType);
        setDurationSec(finalDuration);
        setElapsedSec(Math.floor(finalDuration));
        setState('stopped');
      };

      startedAtRef.current = Date.now();
      rec.start();
      setMimeType(rec.mimeType || mt || '');
      setState('recording');

      tickRef.current = setInterval(() => {
        if (!mountedRef.current) return;
        const sec = (Date.now() - startedAtRef.current) / 1000;
        setElapsedSec(Math.floor(sec));
      }, 250);

      if (maxDurationSec && maxDurationSec > 0) {
        autoStopRef.current = setTimeout(() => {
          try {
            if (recorderRef.current && recorderRef.current.state !== 'inactive') {
              recorderRef.current.stop();
            }
          } catch (_) { /* ignore */ }
        }, maxDurationSec * 1000);
      }
    } catch (err) {
      cleanupTimers();
      releaseStream();
      recorderRef.current = null;
      if (!mountedRef.current) return;
      setError(mapMicError(err));
      setState('error');
    }
  }, [state, audioConstraints, maxDurationSec, cleanupTimers, releaseStream]);

  return {
    state,
    blob,
    mimeType,
    durationSec,
    elapsedSec,
    error,
    isRecording: state === 'recording',
    start,
    stop,
    reset,
  };
}

export default useSpeakingRecorder;
