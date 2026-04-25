/**
 * AudioContext — global lifecycle for every audio surface in the app.
 *
 * Why a context exists at all (instead of each player owning its lifecycle):
 *
 * 1. Route-change cleanup. Web Speech (`speechSynthesis`) and HTMLAudioElement
 *    instances both outlive their React component if you forget to stop them
 *    in unmount cleanup. A single `useLocation()` listener here kills every
 *    registered player on pathname change, so individual call sites can't get
 *    it wrong. (This is the fix for the landing speaking-sample bug.)
 *
 * 2. Single-active enforcement. Two simultaneous audio sources is almost
 *    always a bug — listening test playing while a vocab card auto-plays its
 *    word, etc. When any registered player calls `setActive(id)`, every other
 *    registered player is paused.
 *
 * 3. beforeunload safety. SpeechSynthesis on Chrome can keep speaking after
 *    a tab is closed if not cancelled; we kill it on unload.
 *
 * Players register themselves via `useAudioRegistry({ id, pause })`. The hook
 * returns `setActive(id)` which the player calls inside its `play()`. The
 * provider keeps a `Map<id, { pause }>` so it can pause everyone but the
 * active one — and stop everyone on route change.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
} from 'react';
import { useLocation } from 'react-router-dom';

const AudioCtx = createContext(null);

export function AudioProvider({ children }) {
  // Map<id, { pause: () => void }>
  const registry = useRef(new Map());
  const activeId = useRef(null);
  const location = useLocation();

  const register = useCallback((id, controls) => {
    registry.current.set(id, controls);
  }, []);

  const unregister = useCallback((id) => {
    registry.current.delete(id);
    if (activeId.current === id) activeId.current = null;
  }, []);

  const pauseAll = useCallback(() => {
    registry.current.forEach((controls) => {
      try {
        controls.pause?.();
      } catch (_) {
        // best-effort — never let one bad player break the others
      }
    });
    activeId.current = null;
    // Belt-and-braces: kill any in-flight TTS that didn't register cleanly.
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch (_) {}
    }
    // Safety net for legacy surfaces still using raw <audio>/<video> tags
    // (Cambridge / FullTest interfaces, etc.) — they aren't registered with
    // us, but we can still pause them on route change so the user doesn't
    // hear a sample monologue trailing them across the app.
    if (typeof document !== 'undefined') {
      try {
        document.querySelectorAll('audio, video').forEach((el) => {
          if (!el.paused) el.pause();
        });
      } catch (_) {}
    }
  }, []);

  const setActive = useCallback((id) => {
    if (activeId.current === id) return;
    registry.current.forEach((controls, otherId) => {
      if (otherId !== id) {
        try {
          controls.pause?.();
        } catch (_) {}
      }
    });
    activeId.current = id;
  }, []);

  // Stop everything on route change. Skip first run so we don't pause a
  // player that mounts on the same render.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    pauseAll();
  }, [location.pathname, pauseAll]);

  // Stop everything on tab unload. Captures the final-flush case.
  useEffect(() => {
    const handler = () => pauseAll();
    window.addEventListener('beforeunload', handler);
    window.addEventListener('pagehide', handler);
    return () => {
      window.removeEventListener('beforeunload', handler);
      window.removeEventListener('pagehide', handler);
    };
  }, [pauseAll]);

  const value = useMemo(
    () => ({ register, unregister, setActive, pauseAll }),
    [register, unregister, setActive, pauseAll],
  );

  return <AudioCtx.Provider value={value}>{children}</AudioCtx.Provider>;
}

/**
 * Internal — used by player hooks to register/unregister and signal "I am
 * the active player now". Generates a stable id automatically.
 *
 * Returns a stable callback that the player calls inside its `play()`.
 */
export function useAudioRegistry(controls) {
  const ctx = useContext(AudioCtx);
  const id = useId();
  // keep latest controls without re-running the register effect
  const controlsRef = useRef(controls);
  controlsRef.current = controls;

  useEffect(() => {
    if (!ctx) return undefined;
    ctx.register(id, {
      pause: () => controlsRef.current?.pause?.(),
    });
    return () => ctx.unregister(id);
  }, [ctx, id]);

  return useCallback(() => {
    ctx?.setActive(id);
  }, [ctx, id]);
}

/** Public hook for app code that wants to forcibly stop all audio. */
export function useStopAllAudio() {
  const ctx = useContext(AudioCtx);
  return ctx?.pauseAll || (() => {});
}
