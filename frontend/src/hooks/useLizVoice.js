/**
 * useLizVoice — ElevenLabs-backed Liz voice with Web Speech fallback.
 *
 * Same public surface as useSpeechSynthesis ({ isSupported, isPlaying,
 * isPaused, play, pause, resume, stop, toggle }) so existing consumers can
 * migrate by changing only the import.
 *
 * Strategy:
 *   1. Call POST /api/tts/generate → { audio_url, cached } (backend caches
 *      results in /app/backend/static/audio/tts_cache/<hash>.mp3 — see
 *      backend/routes/tts.py).
 *   2. Play the returned MP3 via HTMLAudioElement, registered with
 *      AudioProvider for global pause/route-change cleanup.
 *   3. If the API call fails (no key, network, 5xx) fall back to Web Speech
 *      so the surface still works locally and on Emergent during rollout.
 *
 * The fetch is debounced per (text, voice_id) inside the hook — repeated
 * play() calls reuse the same Audio object and the cached MP3.
 *
 * Pause/resume: HTMLAudioElement supports both natively, so unlike the Web
 * Speech wrapper there is no Safari degradation here.
 *
 * Usage:
 *   const liz = useLizVoice(SAMPLE_TEXT, { lang: 'en-GB', rate: 0.95 });
 *   liz.toggle();
 *   liz.stop();
 *
 *   // Imperative one-shot for surfaces that speak many different prompts:
 *   import { speakOnce } from '../hooks/useLizVoice';
 *   const handle = await speakOnce(text, { onEnd: () => startRecording() });
 *   handle.stop();
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAudioRegistry } from '../contexts/AudioContext';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

// Empty default → backend picks (LIZ_VOICE_ID env or its own DEFAULT_VOICE_ID).
// Lets free-tier ElevenLabs accounts swap to a premade voice without a
// frontend deploy. Override per call site if a different Liz voice is desired.
const DEFAULT_VOICE_ID = '';

// Module-level cache of resolved audio URLs keyed by `${voiceId}::${text}`.
// Same component re-rendering doesn't re-hit the API; different components
// requesting the same line also benefit.
const urlCache = new Map();

// Read current logged-in user email from localStorage. Pre-launch audit
// (2026-05-16) requires cost-bomb endpoints to be soft-auth gated; backend
// rejects empty/unknown emails with 401.
function getCurrentEmail() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null')?.email || null;
  } catch {
    return null;
  }
}

async function resolveAudioUrl(text, voiceId) {
  if (!text) return null;
  const key = `${voiceId}::${text}`;
  if (urlCache.has(key)) return urlCache.get(key);

  // Only include voice_id when caller passed one; empty string lets the
  // backend apply its LIZ_VOICE_ID env default.
  const email = getCurrentEmail();
  const body = voiceId ? { text, voice_id: voiceId, email } : { text, email };
  const res = await fetch(`${API_URL}/api/tts/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`TTS generate failed: ${res.status}`);
  }
  const data = await res.json();
  if (!data?.audio_url) throw new Error('TTS response missing audio_url');
  // Backend returns a relative /api/... path; prefix with backend host so
  // the <audio> element loads from the API origin.
  const fullUrl = data.audio_url.startsWith('http')
    ? data.audio_url
    : `${API_URL}${data.audio_url}`;
  urlCache.set(key, fullUrl);
  return fullUrl;
}

// Names of common female-sounding system voices, by platform. Used to pick a
// fallback voice when ElevenLabs is unreachable so Liz never accidentally
// reads with the default male voice (e.g. Daniel on macOS, Mark on Windows).
// We match case-insensitively against `voice.name`.
const FEMALE_VOICE_HINTS = [
  // macOS / iOS
  'Samantha', 'Karen', 'Moira', 'Tessa', 'Kate', 'Susan', 'Allison',
  'Ava', 'Serena', 'Veena', 'Fiona', 'Victoria',
  // Windows
  'Zira', 'Hazel', 'Susan',
  // Google Chrome
  'Google UK English Female', 'Google US English',
  // Android
  'female',
];

function pickFemaleVoice(lang) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices() || [];
  if (!voices.length) return null;

  const langPrefix = (lang || 'en').slice(0, 2).toLowerCase();
  const matchingLang = voices.filter((v) =>
    (v.lang || '').toLowerCase().startsWith(langPrefix),
  );
  const pool = matchingLang.length ? matchingLang : voices;

  // Prefer a voice whose name matches our female-name hints. Falls back to
  // any voice whose name contains "female" (Android/Linux pattern). Last
  // resort: first matching-language voice (better than nothing).
  const byName = pool.find((v) =>
    FEMALE_VOICE_HINTS.some((h) => v.name.toLowerCase().includes(h.toLowerCase())),
  );
  if (byName) return byName;
  const byKeyword = pool.find((v) => /female/i.test(v.name));
  if (byKeyword) return byKeyword;
  return pool[0] || null;
}

function speakViaWebSpeech(text, { lang, rate, pitch, onStart, onEnd, onError }) {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    onError?.(new Error('Web Speech not supported'));
    return { stop: () => {} };
  }
  try {
    window.speechSynthesis.cancel();
  } catch (_) {}

  const speakNow = () => {
    const u = new window.SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = rate;
    u.pitch = pitch;
    const voice = pickFemaleVoice(lang);
    if (voice) u.voice = voice;
    u.onstart = () => onStart?.();
    u.onend = () => onEnd?.();
    u.onerror = (e) => onError?.(e);
    window.speechSynthesis.speak(u);
  };

  // On Chrome/Safari getVoices() may return [] until the voiceschanged event
  // fires. If that's the case, wait one tick before speaking so we can pick a
  // proper female voice instead of the engine default.
  const voices = window.speechSynthesis.getVoices() || [];
  if (!voices.length && typeof window.speechSynthesis.addEventListener === 'function') {
    let spoken = false;
    const onReady = () => {
      if (spoken) return;
      spoken = true;
      window.speechSynthesis.removeEventListener('voiceschanged', onReady);
      speakNow();
    };
    window.speechSynthesis.addEventListener('voiceschanged', onReady);
    // Safety net — speak after 250ms even if voiceschanged never fires.
    setTimeout(onReady, 250);
  } else {
    speakNow();
  }

  return {
    stop: () => {
      try {
        window.speechSynthesis.cancel();
      } catch (_) {}
    },
  };
}

export function useLizVoice(text, options = {}) {
  const {
    lang = 'en-GB',
    rate = 1,
    pitch = 1,
    voiceId = DEFAULT_VOICE_ID,
  } = options;

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const audioRef = useRef(null);
  const fallbackHandleRef = useRef(null);

  const stop = useCallback(() => {
    const a = audioRef.current;
    if (a) {
      try {
        a.pause();
        a.currentTime = 0;
      } catch (_) {}
    }
    if (fallbackHandleRef.current) {
      try {
        fallbackHandleRef.current.stop();
      } catch (_) {}
      fallbackHandleRef.current = null;
    }
    setIsPlaying(false);
    setIsPaused(false);
  }, []);

  const announceActive = useAudioRegistry({ pause: stop });

  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsSupported(false);
    }
    return () => {
      // Stop on unmount — AudioProvider also cleans up on route change.
      stop();
    };
    // stop is stable (useCallback with []) but listing it satisfies lint.
  }, [stop]);

  // When the bound text changes, drop any in-flight playback so the next
  // play() fetches fresh audio.
  useEffect(() => {
    stop();
  }, [text, voiceId, stop]);

  const play = useCallback(async () => {
    if (!text) return;
    announceActive();
    try {
      const url = await resolveAudioUrl(text, voiceId);
      if (!url) throw new Error('No audio URL');
      // Reuse the same <audio> if it's the same source; otherwise build new.
      let a = audioRef.current;
      if (!a || a.src !== url) {
        a = new Audio(url);
        a.preload = 'auto';
        audioRef.current = a;
      }
      a.onplay = () => {
        setIsPlaying(true);
        setIsPaused(false);
      };
      a.onpause = () => {
        // Only mark paused if not at end; ended fires its own handler.
        if (!a.ended) setIsPaused(true);
      };
      a.onended = () => {
        setIsPlaying(false);
        setIsPaused(false);
      };
      a.onerror = () => {
        setIsPlaying(false);
        setIsPaused(false);
      };
      // Honor rate/pitch where supported; ElevenLabs already shapes the
      // delivery so default 1.0 is usually best.
      try {
        a.playbackRate = rate;
      } catch (_) {}
      await a.play();
    } catch (err) {
      // Fallback to Web Speech so the page keeps working when the backend
      // key is missing or the request errors. This is the documented
      // local-dev path (see feedback_local_env_keys_empty.md).
      // eslint-disable-next-line no-console
      console.warn('[useLizVoice] falling back to Web Speech:', err?.message);
      fallbackHandleRef.current = speakViaWebSpeech(text, {
        lang,
        rate,
        pitch,
        onStart: () => {
          setIsPlaying(true);
          setIsPaused(false);
        },
        onEnd: () => {
          setIsPlaying(false);
          setIsPaused(false);
          fallbackHandleRef.current = null;
        },
        onError: () => {
          setIsPlaying(false);
          setIsPaused(false);
          fallbackHandleRef.current = null;
        },
      });
    }
  }, [text, voiceId, lang, rate, pitch, announceActive]);

  const pause = useCallback(() => {
    const a = audioRef.current;
    if (a && !a.paused) {
      try {
        a.pause();
      } catch (_) {}
      setIsPaused(true);
    }
  }, []);

  const resume = useCallback(() => {
    const a = audioRef.current;
    if (a && a.paused && !a.ended) {
      try {
        a.play();
      } catch (_) {}
      setIsPaused(false);
    }
  }, []);

  const toggle = useCallback(() => {
    if (!isPlaying) {
      play();
      return;
    }
    if (isPaused) resume();
    else pause();
  }, [isPlaying, isPaused, play, pause, resume]);

  return {
    isSupported,
    isPlaying,
    isPaused,
    play,
    pause,
    resume,
    stop,
    toggle,
  };
}

/**
 * One-shot imperative speak for surfaces that speak many different prompts
 * (e.g. SpeakingPractice question reader). Returns a handle with `.stop()`
 * for the caller to abort early.
 *
 * Resolves immediately with the handle once playback starts (or fallback is
 * in flight). The optional `onEnd` callback fires when audio finishes —
 * use it to chain auto-record behavior.
 */
export async function speakOnce(text, options = {}) {
  const {
    lang = 'en-GB',
    rate = 1,
    pitch = 1,
    voiceId = DEFAULT_VOICE_ID,
    onStart,
    onEnd,
    onError,
  } = options;

  if (!text) {
    onError?.(new Error('No text'));
    return { stop: () => {} };
  }

  // Stop any prior speakOnce playback so calls don't stack.
  if (speakOnce._current) {
    try {
      speakOnce._current.stop();
    } catch (_) {}
    speakOnce._current = null;
  }

  const fallback = () =>
    speakViaWebSpeech(text, {
      lang,
      rate,
      pitch,
      onStart,
      onEnd,
      onError,
    });

  try {
    const url = await resolveAudioUrl(text, voiceId);
    if (!url) throw new Error('No audio URL');
    const a = new Audio(url);
    a.preload = 'auto';
    try {
      a.playbackRate = rate;
    } catch (_) {}
    a.onplay = () => onStart?.();
    a.onended = () => {
      onEnd?.();
      if (speakOnce._current?._audio === a) speakOnce._current = null;
    };
    a.onerror = (e) => {
      onError?.(e);
      if (speakOnce._current?._audio === a) speakOnce._current = null;
    };
    const handle = {
      _audio: a,
      stop: () => {
        try {
          a.pause();
          a.currentTime = 0;
        } catch (_) {}
      },
    };
    speakOnce._current = handle;
    await a.play();
    return handle;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[speakOnce] falling back to Web Speech:', err?.message);
    const handle = fallback();
    speakOnce._current = handle;
    return handle;
  }
}
