/**
 * useAudio — the only correct way to play an HTMLAudioElement in this app.
 *
 * Fixes the bug class where pause→resume restarts at 0:00 because the call
 * site does `new Audio(url)` on every play click. Here the Audio instance is
 * created once per `src` and lives in a ref; play/pause are toggles, never
 * recreations. currentTime is preserved across pauses by definition.
 *
 * Wires into AudioProvider so:
 *   - calling play() pauses every other registered player
 *   - route changes pause this one
 *   - persistKey, if given, saves currentTime to localStorage and restores
 *     on next mount (useful for long listening tests)
 *
 * Usage:
 *   const audio = useAudio(src, { persistKey: `listening:${setId}` });
 *   audio.toggle();
 *   audio.seek(120);
 *   audio.setRate(1.25);
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAudioRegistry } from '../contexts/AudioContext';

const PERSIST_PREFIX = 'audio-progress:';

function readPersisted(key) {
  if (!key) return 0;
  try {
    const raw = localStorage.getItem(PERSIST_PREFIX + key);
    return raw ? Math.max(0, parseFloat(raw) || 0) : 0;
  } catch (_) {
    return 0;
  }
}

function writePersisted(key, seconds) {
  if (!key) return;
  try {
    localStorage.setItem(PERSIST_PREFIX + key, String(seconds));
  } catch (_) {}
}

export function useAudio(src, options = {}) {
  const { persistKey, initialRate = 1, autoplay = false } = options;

  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rate, setRateState] = useState(initialRate);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  const announceActive = useAudioRegistry({
    pause: () => audioRef.current?.pause(),
  });

  // (Re)build the Audio element when src changes. Keeping it in a ref means
  // a re-render of the consumer doesn't recreate the element.
  useEffect(() => {
    if (!src) {
      audioRef.current = null;
      setIsReady(false);
      setDuration(0);
      setCurrentTime(0);
      return undefined;
    }

    const a = new Audio();
    a.preload = 'metadata';
    a.src = src;
    a.playbackRate = initialRate;
    audioRef.current = a;
    setError(null);
    setIsReady(false);
    setIsPlaying(false);

    const onLoaded = () => {
      setDuration(Number.isFinite(a.duration) ? a.duration : 0);
      setIsReady(true);
      // restore persisted position once metadata is known
      const persisted = readPersisted(persistKey);
      if (persisted > 0 && persisted < (a.duration || Infinity) - 1) {
        a.currentTime = persisted;
        setCurrentTime(persisted);
      }
    };
    const onTime = () => setCurrentTime(a.currentTime);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      writePersisted(persistKey, 0); // reset on natural end
    };
    const onErr = () => {
      setError('Audio failed to load');
      setIsPlaying(false);
    };

    a.addEventListener('loadedmetadata', onLoaded);
    a.addEventListener('timeupdate', onTime);
    a.addEventListener('play', onPlay);
    a.addEventListener('pause', onPause);
    a.addEventListener('ended', onEnded);
    a.addEventListener('error', onErr);

    if (autoplay) {
      // Autoplay is best-effort — browsers block without user gesture.
      a.play().catch(() => {});
    }

    return () => {
      a.removeEventListener('loadedmetadata', onLoaded);
      a.removeEventListener('timeupdate', onTime);
      a.removeEventListener('play', onPlay);
      a.removeEventListener('pause', onPause);
      a.removeEventListener('ended', onEnded);
      a.removeEventListener('error', onErr);
      // Persist whatever position we ended on, then stop the element.
      if (persistKey && a.currentTime > 0 && a.currentTime < a.duration - 1) {
        writePersisted(persistKey, a.currentTime);
      }
      a.pause();
      a.src = '';
      a.load();
    };
    // initialRate/autoplay deliberately left out — they're initial-only
    // intent. persistKey is intentionally a dep so swapping it rebinds.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, persistKey]);

  const play = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    announceActive();
    a.play().catch((err) => setError(err?.message || 'Playback blocked'));
  }, [announceActive]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const toggle = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) play();
    else pause();
  }, [play, pause]);

  const stop = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    a.pause();
    a.currentTime = 0;
    setCurrentTime(0);
    writePersisted(persistKey, 0);
  }, [persistKey]);

  const seek = useCallback((seconds) => {
    const a = audioRef.current;
    if (!a) return;
    const clamped = Math.max(0, Math.min(seconds, a.duration || seconds));
    a.currentTime = clamped;
    setCurrentTime(clamped);
  }, []);

  const skip = useCallback(
    (delta) => {
      const a = audioRef.current;
      if (!a) return;
      seek((a.currentTime || 0) + delta);
    },
    [seek],
  );

  const setRate = useCallback((next) => {
    const a = audioRef.current;
    if (!a) return;
    a.playbackRate = next;
    setRateState(next);
  }, []);

  return {
    isPlaying,
    currentTime,
    duration,
    rate,
    isReady,
    error,
    play,
    pause,
    toggle,
    stop,
    seek,
    skip,
    setRate,
  };
}
