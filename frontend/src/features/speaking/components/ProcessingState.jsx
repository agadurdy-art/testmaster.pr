import React, { useEffect, useRef, useState } from 'react';

const WAVE_BARS = [
  30, 55, 80, 45, 70, 95, 60, 40, 75, 50, 85, 35, 65, 90, 55, 45,
  70, 40, 80, 50, 30, 60, 85, 45, 70, 55, 90, 35, 75, 50, 40, 65,
];

function fmtTime(sec) {
  if (!Number.isFinite(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

const SPEEDS = [0.75, 1, 1.5];

function PlaybackPreview({ audioBlob }) {
  const [url, setUrl] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [total, setTotal] = useState(0);
  const [speedIdx, setSpeedIdx] = useState(1); // default 1x
  const audioRef = useRef(null);

  useEffect(() => {
    if (!audioBlob) { setUrl(null); return undefined; }
    const objectUrl = URL.createObjectURL(audioBlob);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [audioBlob]);

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
  }, [url]);

  useEffect(() => {
    const a = audioRef.current;
    if (a) a.playbackRate = SPEEDS[speedIdx];
  }, [speedIdx, url]);

  if (!audioBlob || !url) {
    return (
      <div
        className="sp-font-mono"
        style={{
          marginTop: 24,
          fontSize: 11,
          color: 'var(--sp-muted-fg)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}
      >
        Capturing audio…
      </div>
    );
  }

  const sizeKb = Math.max(1, Math.round(audioBlob.size / 1024));
  const pct = total > 0 ? Math.min(100, (current / total) * 100) : 0;
  const seek = (delta) => {
    const a = audioRef.current;
    if (!a || !total) return;
    a.currentTime = Math.max(0, Math.min(total, (a.currentTime || 0) + delta));
  };
  const onScrub = (e) => {
    const a = audioRef.current;
    if (!a || !total) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    a.currentTime = Math.max(0, Math.min(total, ratio * total));
  };

  return (
    <div
      style={{
        marginTop: 24,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        padding: '6px 12px 6px 6px',
        borderRadius: 9999,
        background: 'var(--sp-muted)',
        border: '1px solid var(--sp-border)',
      }}
    >
      <audio
        ref={audioRef}
        src={url}
        preload="metadata"
        style={{ display: 'none' }}
      />
      <button
        onClick={() => {
          const a = audioRef.current;
          if (!a) return;
          if (a.paused) a.play(); else a.pause();
        }}
        aria-label={playing ? 'Pause your recording' : 'Play your recording'}
        style={{
          width: 32, height: 32, borderRadius: 9999,
          background: 'var(--sp-primary)', color: 'white',
          border: 'none', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        {playing ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
            <rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
            <path d="M8 5v14l11-7L8 5z" />
          </svg>
        )}
      </button>
      <button
        onClick={() => seek(-5)}
        title="Back 5 seconds"
        aria-label="Back 5 seconds"
        style={{
          width: 26, height: 26, borderRadius: 9999,
          background: 'transparent',
          border: '1px solid var(--sp-border)',
          color: 'var(--sp-foreground)',
          fontSize: 10, fontWeight: 600,
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
          width: 26, height: 26, borderRadius: 9999,
          background: 'transparent',
          border: '1px solid var(--sp-border)',
          color: 'var(--sp-foreground)',
          fontSize: 10, fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        +5
      </button>
      <div
        onClick={onScrub}
        style={{
          width: 140, height: 4,
          background: 'hsl(222 47% 11% / 0.18)',
          borderRadius: 9999,
          cursor: 'pointer',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute', inset: 0,
            width: `${pct}%`,
            background: 'var(--sp-primary)',
            borderRadius: 9999,
          }}
        />
      </div>
      <span
        className="sp-font-mono"
        style={{
          fontSize: 11,
          color: 'var(--sp-muted-fg)',
          fontVariantNumeric: 'tabular-nums',
          minWidth: 64,
          textAlign: 'right',
        }}
      >
        {fmtTime(current)} / {total > 0 ? fmtTime(total) : '—'}
      </span>
      <button
        onClick={() => setSpeedIdx((i) => (i + 1) % SPEEDS.length)}
        title="Playback speed"
        aria-label={`Playback speed ${SPEEDS[speedIdx]}x`}
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
        {SPEEDS[speedIdx]}×
      </button>
      <span
        className="sp-font-mono"
        style={{
          fontSize: 10,
          color: 'var(--sp-muted-fg)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        {sizeKb} KB
      </span>
    </div>
  );
}

export default function ProcessingState({ audioBlob }) {
  // Live elapsed timer — ticks every 100ms so the user can see real progress
  // instead of a static "About 5 seconds" / "1.8 s / 0.9 s / ~2 s" lie.
  const [elapsedMs, setElapsedMs] = useState(0);
  const startedAtRef = useRef(Date.now());
  useEffect(() => {
    startedAtRef.current = Date.now();
    const id = setInterval(() => {
      setElapsedMs(Date.now() - startedAtRef.current);
    }, 100);
    return () => clearInterval(id);
  }, []);
  const elapsedLabel = `${(elapsedMs / 1000).toFixed(1)} s`;
  const sizeKb = audioBlob ? Math.max(1, Math.round(audioBlob.size / 1024)) : null;

  return (
    <section style={{ maxWidth: 1320, margin: '0 auto', padding: '56px 32px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <span
          className="sp-font-mono"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 26,
            height: 26,
            borderRadius: 9999,
            border: '1.5px solid var(--sp-foreground)',
            fontWeight: 700,
            fontSize: 12,
          }}
        >
          L
        </span>
        <span className="sp-mono-label">State · Processing</span>
      </div>
      <div
        style={{
          background: 'var(--sp-card)',
          borderRadius: 'var(--sp-radius)',
          border: '1px solid var(--sp-border)',
          boxShadow: 'var(--sp-shadow-card)',
          padding: 40,
          textAlign: 'center',
        }}
      >
        {/* Waveform */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            gap: 5,
            height: 96,
          }}
        >
          {WAVE_BARS.map((h, i) => (
            <span
              key={i}
              className="sp-wave-bar"
              style={{ height: `${h}%`, animationDelay: `${(i % 16) * 60}ms` }}
            />
          ))}
        </div>
        <h3 className="sp-font-display" style={{ fontSize: 28, fontWeight: 600, marginTop: 32 }}>
          Analysing your response…
        </h3>
        <p style={{ color: 'var(--sp-muted-fg)', marginTop: 8, maxWidth: 480, margin: '8px auto 0' }}>
          Sending your audio to Liz for grading. This usually takes 8–20 seconds depending on length.
        </p>

        {/* Real status — only steps the frontend actually knows about. */}
        <div
          style={{
            marginTop: 32,
            maxWidth: 520,
            margin: '32px auto 0',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            textAlign: 'left',
          }}
        >
          <Step
            done={!!audioBlob}
            active={!audioBlob}
            label={audioBlob ? `Recording captured · ${sizeKb} KB` : 'Finalising recording…'}
          />
          <Step
            active={!!audioBlob}
            pending={!audioBlob}
            label="Liz is grading"
            time={audioBlob ? elapsedLabel : null}
          />
        </div>

        <PlaybackPreview audioBlob={audioBlob} />
      </div>
    </section>
  );
}

function Step({ done, active, pending, label, time }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14 }}>
      {done && (
        <span
          style={{
            width: 20,
            height: 20,
            borderRadius: 9999,
            background: 'var(--sp-primary)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
      )}
      {active && <span className="sp-spinner" style={{ flexShrink: 0 }} />}
      {pending && (
        <span
          style={{
            width: 20,
            height: 20,
            borderRadius: 9999,
            border: '1px solid var(--sp-border)',
            flexShrink: 0,
          }}
        />
      )}
      <span
        style={{
          color: pending ? 'var(--sp-muted-fg)' : 'var(--sp-foreground)',
          fontWeight: active ? 500 : 400,
        }}
      >
        {label}
      </span>
      {time && (
        <span
          className="sp-font-mono"
          style={{
            marginLeft: 'auto',
            fontSize: 11,
            color: 'var(--sp-muted-fg)',
          }}
        >
          {time}
        </span>
      )}
    </div>
  );
}
