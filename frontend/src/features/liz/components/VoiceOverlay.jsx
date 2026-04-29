/**
 * VoiceOverlay
 * ------------
 * Full-screen overlay shown while a Liz live conversation is active. Mirrors
 * the D8 design: animated orb (state-driven by `mode`), 7 audio bars driven
 * from the SDK's input frequency data, live transcript caret, and three
 * controls (Mute / Pause / End).
 *
 * Drives off useElevenLabsLiz — pure presentation + thin animation loop.
 */
import React, { useEffect, useRef, useState } from 'react';

function formatClock(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function VoiceOverlay({
  liz,
  onClose,
  caption = '',
}) {
  const {
    isLive,
    isConnecting,
    isFinalizing,
    isError,
    error,
    elapsedSeconds,
    quota,
    mode,
    isMuted,
    setMuted,
    isSpeaking,
    isListening,
    getOutputByteFrequencyData,
    stop,
  } = liz;

  const barRefs = useRef([]);
  const rafRef = useRef(null);
  const [paused, setPaused] = useState(false);

  // Drive the 7 audio bars from Liz's output volume (so they pulse when she
  // speaks, not when the user does — matches the D8 aesthetic of "Liz is
  // talking" feedback).
  useEffect(() => {
    if (!isLive || paused) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return undefined;
    }
    const tick = () => {
      let data = null;
      try {
        data = getOutputByteFrequencyData?.();
      } catch (_e) {
        data = null;
      }
      if (data && data.length && barRefs.current.length) {
        const buckets = barRefs.current.length;
        const step = Math.floor(data.length / buckets) || 1;
        for (let i = 0; i < buckets; i += 1) {
          const idx = i * step;
          // 0..255 → 8..40px height range
          const v = data[idx] || 0;
          const h = 8 + Math.round((v / 255) * 32);
          const el = barRefs.current[i];
          if (el) el.style.height = `${h}px`;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isLive, paused, getOutputByteFrequencyData]);

  const orbState = isSpeaking ? 'speaking' : isListening ? 'listening' : 'idle';

  const handleEnd = async () => {
    await stop();
    onClose?.();
  };

  const togglePause = () => {
    // Pause = mute mic AND stop the bar animation. Reuses setMuted under the
    // hood so the agent literally stops hearing us; resuming unmutes.
    if (paused) {
      setPaused(false);
      try { setMuted?.(false); } catch (_e) { /* noop */ }
    } else {
      setPaused(true);
      try { setMuted?.(true); } catch (_e) { /* noop */ }
    }
  };

  const toggleMute = () => {
    try { setMuted?.(!isMuted); } catch (_e) { /* noop */ }
  };

  const seconds = Number(quota?.seconds_remaining ?? 0);
  const remainingLabel = quota
    ? `${formatClock(Math.max(seconds - elapsedSeconds, 0))} left this period`
    : '';

  return (
    <div className="voice-overlay" role="dialog" aria-label="Liz live conversation">
      <div className="voice-orb" data-state={orbState} aria-hidden="true">L</div>

      <div className="voice-bars" data-paused={paused ? 'true' : 'false'} aria-hidden="true">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <span
            key={i}
            ref={(el) => { barRefs.current[i] = el; }}
          />
        ))}
      </div>

      <p className="voice-status" aria-live="polite">
        {isError && <span className="voice-error">{error}</span>}
        {!isError && isConnecting && 'Connecting to Liz…'}
        {!isError && isLive && (mode === 'speaking' ? 'Liz is speaking' : 'Liz is listening')}
        {!isError && isFinalizing && 'Saving the conversation…'}
      </p>

      {caption ? <p className="voice-transcript">{caption}<span className="caret" /></p> : null}

      <div className="voice-meta">
        <span className="voice-clock">{formatClock(elapsedSeconds)}</span>
        {remainingLabel && <span className="voice-quota">{remainingLabel}</span>}
      </div>

      <div className="voice-controls">
        <button
          type="button"
          className="liz-btn liz-btn-ghost"
          onClick={toggleMute}
          disabled={!isLive}
        >
          {isMuted ? 'Unmute mic' : 'Mute mic'}
        </button>
        <button
          type="button"
          className="liz-btn liz-btn-ghost"
          onClick={togglePause}
          disabled={!isLive}
        >
          {paused ? 'Resume' : 'Pause'}
        </button>
        <button
          type="button"
          className="liz-btn liz-btn-primary"
          onClick={handleEnd}
        >
          End session
        </button>
      </div>
    </div>
  );
}
