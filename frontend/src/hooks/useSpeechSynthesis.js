/**
 * useSpeechSynthesis — Web Speech API wrapper that registers with
 * AudioProvider so it is stopped on route change just like an HTMLAudioElement.
 *
 * Why a separate hook: Web Speech is a global singleton on `window` and has
 * its own lifecycle quirks (Chrome's cancel-immediately-after-speak race,
 * utterances that outlive their component, no native pause across all
 * browsers). Wrapping it here means consumers can't forget to clean up.
 *
 * Pause/resume behaviour: where browsers support it (Chrome/Edge desktop)
 * we use speechSynthesis.pause()/resume(). Safari ignores pause for new
 * utterances — there we degrade to stop-and-restart-from-beginning, which
 * matches Safari's own behaviour and is documented in the browser.
 *
 * Usage:
 *   const speech = useSpeechSynthesis(SAMPLE_TEXT, { lang: 'en-GB', rate: 0.95 });
 *   speech.toggle();  // play/pause
 *   speech.stop();
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAudioRegistry } from '../contexts/AudioContext';

export function useSpeechSynthesis(text, options = {}) {
  const { lang = 'en-GB', rate = 1, pitch = 1, voice = null } = options;

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const utterRef = useRef(null);

  const stop = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
    } catch (_) {}
    utterRef.current = null;
    setIsPlaying(false);
    setIsPaused(false);
  }, []);

  const announceActive = useAudioRegistry({ pause: stop });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setIsSupported(false);
    }
    // No additional cleanup needed — useAudioRegistry will call stop on
    // unmount via the registry, and AudioProvider also clears speechSynthesis
    // on route change.
  }, []);

  const play = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    if (!text) return;
    // Always cancel before speak — avoids queue buildup if user spam-clicks.
    try {
      window.speechSynthesis.cancel();
    } catch (_) {}

    const u = new window.SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = rate;
    u.pitch = pitch;
    if (voice) u.voice = voice;

    u.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };
    u.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      utterRef.current = null;
    };
    u.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
      utterRef.current = null;
    };
    u.onpause = () => setIsPaused(true);
    u.onresume = () => setIsPaused(false);

    utterRef.current = u;
    announceActive();
    window.speechSynthesis.speak(u);
  }, [text, lang, rate, pitch, voice, announceActive]);

  const pause = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.pause();
    } catch (_) {}
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.resume();
    } catch (_) {}
    setIsPaused(false);
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
