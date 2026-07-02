import React, { useEffect, useRef, useState } from 'react';

const API_BASE = process.env.REACT_APP_BACKEND_URL || '';

export function resolveAudioSrc(audioUrl) {
  if (!audioUrl) return null;
  if (/^https?:\/\//i.test(audioUrl)) return audioUrl;
  // Relative paths come back as `/static/recordings/...` from the backend.
  return `${API_BASE}${audioUrl}`;
}

function fmtMMSS(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

const PLAYER_SPEEDS = [0.75, 1, 1.5];

export default function AudioPlayer({ src, fallbackDurationLabel }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [total, setTotal] = useState(0);
  const [speedIdx, setSpeedIdx] = useState(1); // default 1x

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return undefined;
    const onTime = () => setCurrent(a.currentTime || 0);
    const onMeta = () => setTotal(Number.isFinite(a.duration) ? a.duration : 0);
    const onEnd = () => setPlaying(false);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    a.addEventListener('timeupdate', onTime);
    a.addEventListener('loadedmetadata', onMeta);
    a.addEventListener('ended', onEnd);
    a.addEventListener('play', onPlay);
    a.addEventListener('pause', onPause);
    return () => {
      a.removeEventListener('timeupdate', onTime);
      a.removeEventListener('loadedmetadata', onMeta);
      a.removeEventListener('ended', onEnd);
      a.removeEventListener('play', onPlay);
      a.removeEventListener('pause', onPause);
    };
  }, [src]);

  useEffect(() => {
    const a = audioRef.current;
    if (a) a.playbackRate = PLAYER_SPEEDS[speedIdx];
  }, [speedIdx, src]);

  if (!src) {
    return (
      <span
        className="sp-font-mono"
        style={{ fontSize: 11, color: 'var(--sp-muted-fg)' }}
      >
        Audio not available
      </span>
    );
  }

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) a.play();
    else a.pause();
  };

  const seek = (delta) => {
    const a = audioRef.current;
    if (!a || !total) return;
    a.currentTime = Math.max(0, Math.min(total, (a.currentTime || 0) + delta));
  };

  const pct = total > 0 ? Math.min(100, (current / total) * 100) : 0;
  const totalLabel = total > 0 ? fmtMMSS(total) : (fallbackDurationLabel || '—');

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: 'var(--sp-muted)',
        borderRadius: 9999,
        padding: '4px 12px 4px 4px',
        border: '1px solid var(--sp-border)',
      }}
    >
      <audio ref={audioRef} src={src} preload="metadata" style={{ display: 'none' }} />
      <button
        onClick={toggle}
        aria-label={playing ? 'Pause recording' : 'Play recording'}
        style={{
          width: 28,
          height: 28,
          borderRadius: 9999,
          background: 'var(--sp-primary)',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        {playing ? (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="white">
            <rect x="6" y="5" width="4" height="14" rx="1" />
            <rect x="14" y="5" width="4" height="14" rx="1" />
          </svg>
        ) : (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="white">
            <path d="M8 5v14l11-7L8 5z" />
          </svg>
        )}
      </button>
      <button
        onClick={() => seek(-5)}
        title="Back 5 seconds"
        aria-label="Back 5 seconds"
        style={{
          width: 24, height: 24, borderRadius: 9999,
          background: 'transparent',
          border: '1px solid var(--sp-border)',
          color: 'var(--sp-foreground)',
          fontSize: 9, fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        −5
      </button>
      <button
        onClick={() => seek(5)}
        title="Forward 5 seconds"
        aria-label="Forward 5 seconds"
        style={{
          width: 24, height: 24, borderRadius: 9999,
          background: 'transparent',
          border: '1px solid var(--sp-border)',
          color: 'var(--sp-foreground)',
          fontSize: 9, fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        +5
      </button>
      <div
        onClick={(e) => {
          const a = audioRef.current;
          if (!a || !total) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const ratio = (e.clientX - rect.left) / rect.width;
          a.currentTime = Math.max(0, Math.min(total, ratio * total));
        }}
        style={{
          width: 120,
          height: 4,
          background: 'hsl(222 47% 11% / 0.18)',
          borderRadius: 9999,
          cursor: 'pointer',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            width: `${pct}%`,
            background: 'var(--sp-primary)',
            borderRadius: 9999,
          }}
        />
      </div>
      <span
        className="sp-font-mono"
        style={{ fontSize: 11, color: 'var(--sp-muted-fg)', fontVariantNumeric: 'tabular-nums', minWidth: 64, textAlign: 'right' }}
      >
        {fmtMMSS(current)} / {totalLabel}
      </span>
      <button
        onClick={() => setSpeedIdx((i) => (i + 1) % PLAYER_SPEEDS.length)}
        title="Playback speed"
        aria-label={`Playback speed ${PLAYER_SPEEDS[speedIdx]}x`}
        className="sp-font-mono"
        style={{
          padding: '3px 8px', borderRadius: 9999,
          background: 'transparent',
          border: '1px solid var(--sp-border)',
          color: 'var(--sp-foreground)',
          fontSize: 11,
          cursor: 'pointer',
          minWidth: 38,
        }}
      >
        {PLAYER_SPEEDS[speedIdx]}×
      </button>
    </div>
  );
}
