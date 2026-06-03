import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * State machine for the Speaking Practice flow.
 *
 * States:
 *   'select'     → Part selector (S1)
 *   'prep'       → 60-second preparation countdown (S2)
 *   'recording'  → 2-minute monologue (S3)
 *   'processing' → Azure STT + scoring (Loading)
 *   'results'    → Two-panel feedback (S4)
 *   'error'      → Low audio / mic issue
 *
 * Real-mic capture + /api/speaking/evaluate submission is active when the
 * browser supports MediaRecorder. If capture is denied or unavailable,
 * the hook falls through to the previous simulated-counter behaviour so
 * designers can still preview the flow offline.
 */
export function useSpeakingFlow({ prepSeconds = 60, recordSeconds = 120 } = {}) {
  const [state, setState] = useState('select');
  const [selectedPart, setSelectedPart] = useState('part2');
  const [topics, setTopics] = useState(() => new Set(['Home & family', 'Travel']));
  const [prepRemaining, setPrepRemaining] = useState(prepSeconds);
  const [recordRemaining, setRecordRemaining] = useState(recordSeconds);
  const [spokenWordCount, setSpokenWordCount] = useState(0);

  // Real audio + scoring state
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioError, setAudioError] = useState(null);
  const [audioReady, setAudioReady] = useState(false);
  const [scoreResult, setScoreResult] = useState(null);
  const [scoreError, setScoreError] = useState(null);

  const prepTimerRef = useRef(null);
  const recordTimerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const chunksRef = useRef([]);
  const recordStartedAtRef = useRef(null);
  const recordedDurationRef = useRef(0);

  const clearTimers = useCallback(() => {
    if (prepTimerRef.current) { clearInterval(prepTimerRef.current); prepTimerRef.current = null; }
    if (recordTimerRef.current) { clearInterval(recordTimerRef.current); recordTimerRef.current = null; }
  }, []);

  const stopMediaRecorder = useCallback(() => {
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    } catch (_) { /* ignore */ }
    try {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
      }
    } catch (_) { /* ignore */ }
    mediaRecorderRef.current = null;
    mediaStreamRef.current = null;
  }, []);

  useEffect(() => () => {
    clearTimers();
    stopMediaRecorder();
  }, [clearTimers, stopMediaRecorder]);

  const startPrep = useCallback(() => {
    clearTimers();
    setPrepRemaining(prepSeconds);
    setAudioBlob(null);
    setAudioReady(false);
    setAudioError(null);
    setScoreResult(null);
    setScoreError(null);
    setState('prep');
  }, [prepSeconds, clearTimers]);

  const startRecording = useCallback(() => {
    clearTimers();
    setRecordRemaining(recordSeconds);
    setSpokenWordCount(0);
    setAudioBlob(null);
    setAudioReady(false);
    recordStartedAtRef.current = Date.now();
    recordedDurationRef.current = 0;
    setState('recording');
  }, [recordSeconds, clearTimers]);

  const startProcessing = useCallback(() => {
    clearTimers();
    if (recordStartedAtRef.current) {
      recordedDurationRef.current = (Date.now() - recordStartedAtRef.current) / 1000;
    }
    setState('processing');
  }, [clearTimers]);

  const showResults = useCallback(() => {
    clearTimers();
    setState('results');
  }, [clearTimers]);

  const showError = useCallback(() => {
    clearTimers();
    setState('error');
  }, [clearTimers]);

  const reset = useCallback(() => {
    clearTimers();
    stopMediaRecorder();
    setPrepRemaining(prepSeconds);
    setRecordRemaining(recordSeconds);
    setSpokenWordCount(0);
    setAudioBlob(null);
    setAudioReady(false);
    setAudioError(null);
    setScoreResult(null);
    setScoreError(null);
    recordStartedAtRef.current = null;
    recordedDurationRef.current = 0;
    setState('select');
  }, [prepSeconds, recordSeconds, clearTimers, stopMediaRecorder]);

  const toggleTopic = useCallback((topic) => {
    setTopics(prev => {
      const next = new Set(prev);
      if (next.has(topic)) next.delete(topic);
      else next.add(topic);
      return next;
    });
  }, []);

  const clearTopics = useCallback(() => setTopics(new Set()), []);

  const addPrepTime = useCallback((extra) => {
    setPrepRemaining(r => r + extra);
  }, []);

  // Prep countdown
  useEffect(() => {
    if (state !== 'prep') return undefined;
    prepTimerRef.current = setInterval(() => {
      setPrepRemaining(r => {
        if (r <= 1) {
          clearInterval(prepTimerRef.current);
          prepTimerRef.current = null;
          setTimeout(() => {
            setRecordRemaining(recordSeconds);
            setSpokenWordCount(0);
            recordStartedAtRef.current = Date.now();
            recordedDurationRef.current = 0;
            setState('recording');
          }, 0);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (prepTimerRef.current) {
        clearInterval(prepTimerRef.current);
        prepTimerRef.current = null;
      }
    };
  }, [state, recordSeconds]);

  // Recording countdown + simulated word streaming + MediaRecorder capture
  useEffect(() => {
    if (state !== 'recording') return undefined;

    // Kick off mic capture (best-effort — fallback silently if unsupported)
    let cancelled = false;
    (async () => {
      try {
        if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
          throw new Error('mediaDevices unavailable');
        }
        if (typeof window === 'undefined' || !('MediaRecorder' in window)) {
          throw new Error('MediaRecorder unavailable');
        }
        // Voice preset: AGC lifts quiet/distant speakers so Azure doesn't
        // return NoMatch ("couldn't catch your voice") on a soft monologue.
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        if (cancelled) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        mediaStreamRef.current = stream;
        const mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg'].find(
          (m) => window.MediaRecorder.isTypeSupported?.(m)
        ) || '';
        const rec = mime
          ? new window.MediaRecorder(stream, { mimeType: mime })
          : new window.MediaRecorder(stream);
        mediaRecorderRef.current = rec;
        chunksRef.current = [];
        rec.ondataavailable = (ev) => {
          if (ev.data && ev.data.size > 0) chunksRef.current.push(ev.data);
        };
        rec.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: rec.mimeType || 'audio/webm' });
          chunksRef.current = [];
          // Treat a tiny blob as "no real audio" — a webm container with no
          // voiced frames is a few hundred bytes and would NoMatch server-side.
          if (blob.size > 1200) {
            setAudioBlob(blob);
          } else {
            setAudioError('We couldn\'t hear your voice. Check your microphone is selected and not muted, then record again.');
          }
          // Always mark "audio finalised" — even if empty — so the submission
          // useEffect downstream knows it can stop waiting.
          setAudioReady(true);
        };
        // Timeslice so chunks flush every second instead of only at stop(): if
        // the final flush is ever dropped, we still have the earlier audio.
        rec.start(1000);
      } catch (err) {
        if (!cancelled) {
          const msg = err?.name === 'NotAllowedError'
            ? 'Microphone access was denied. Enable it in your browser settings to record a real answer — or view the sample result below.'
            : (err?.message || String(err));
          setAudioError(msg);
          // Transition out of the recording countdown so the user sees the
          // error immediately, instead of a silent 2-minute fake recording.
          clearInterval(recordTimerRef.current);
          recordTimerRef.current = null;
          setState('error');
        }
      }
    })();

    recordTimerRef.current = setInterval(() => {
      setRecordRemaining(r => {
        if (r <= 1) {
          clearInterval(recordTimerRef.current);
          recordTimerRef.current = null;
          setTimeout(() => {
            if (recordStartedAtRef.current) {
              recordedDurationRef.current =
                (Date.now() - recordStartedAtRef.current) / 1000;
            }
            stopMediaRecorder();
            setState('processing');
          }, 0);
          return 0;
        }
        return r - 1;
      });
      setSpokenWordCount(n => Math.min(n + 1, 18));
    }, 1000);

    return () => {
      cancelled = true;
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
        recordTimerRef.current = null;
      }
      stopMediaRecorder();
    };
  }, [state, stopMediaRecorder]);

  // Scoring submission — posts to the unified /api/speaking/evaluate endpoint
  // (Faz 2 / task #40). The legacy /api/speaking/score path is retired; QB,
  // Cambridge, Full Test and Smart Practice all flow through one shape now.
  const submitScoring = useCallback(async ({
    endpoint,
    cueCard,
    part,
    userLanguage,
    targetBand,
    userId,
    context,
    setId,
    questionId,
    bookId,
    testId,
    clientRequestId,
  }) => {
    setScoreError(null);
    if (!audioBlob) {
      // No audio → simulated preview path (keeps design mode working offline)
      await new Promise(r => setTimeout(r, 3000));
      setScoreResult(null);
      setState('results');
      return;
    }
    if (!userId) {
      // Authenticated endpoint requires user_id; SpeakingPractice mounts
      // under a `user ? ...` route guard so this should not normally fire,
      // but surface a clear error rather than a 422 from the backend.
      setScoreError('You must be logged in to score a speaking attempt.');
      setState('error');
      return;
    }
    try {
      const form = new FormData();
      form.append(
        'audio',
        audioBlob,
        `speaking-${Date.now()}.${audioBlob.type.includes('ogg') ? 'ogg' : 'webm'}`
      );
      form.append('user_id', userId);
      form.append('part', part || 'part2');
      form.append('cue_card_prompt', cueCard?.prompt || '');
      form.append('cue_card_bullets', (cueCard?.bullets || []).join('\n'));
      form.append('user_language', userLanguage || 'en');
      form.append('target_band', String(targetBand ?? 7.0));
      form.append('duration_seconds', String(recordedDurationRef.current || 0));
      if (context) form.append('context', context);
      if (clientRequestId) form.append('client_request_id', clientRequestId);
      if (setId) form.append('set_id', setId);
      if (questionId) form.append('question_id', questionId);
      if (bookId) form.append('book_id', bookId);
      if (testId) form.append('test_id', testId);

      const base = process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_API_URL || '';
      const url = endpoint || `${base}/api/speaking/evaluate`;
      const resp = await fetch(url, { method: 'POST', body: form });
      if (!resp.ok) {
        let detail;
        try { detail = await resp.json(); } catch (_) { detail = await resp.text(); }
        throw new Error(typeof detail === 'string' ? detail : (detail?.detail?.message || detail?.detail || `HTTP ${resp.status}`));
      }
      const data = await resp.json();
      setScoreResult(data);
      setState('results');
    } catch (err) {
      setScoreError(err?.message || String(err));
      setState('error');
    }
  }, [audioBlob]);

  return {
    state,
    selectedPart, setSelectedPart,
    topics, toggleTopic, clearTopics,
    prepRemaining, addPrepTime,
    recordRemaining, spokenWordCount,
    startPrep, startRecording, startProcessing, showResults, showError, reset,
    // real backend integration
    audioBlob, audioError, audioReady,
    scoreResult, scoreError,
    submitScoring,
  };
}

export function formatMMSS(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}
