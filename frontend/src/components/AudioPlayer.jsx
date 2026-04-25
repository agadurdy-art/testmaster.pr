/**
 * AudioPlayer — the canonical audio UI for IELTS Ace.
 *
 * Drop-in replacement for inline `<audio>` tags and `new Audio()` calls
 * sprinkled through course pages and listening tests. Built on top of
 * `useAudio`, so:
 *   - pause→resume keeps position (the listening-test bug)
 *   - navigating away kills playback (the landing-sample bug)
 *   - only one player can sound at a time
 *
 * Features (Option C scope):
 *   • Play/Pause toggle button
 *   • Scrubber with current/duration display
 *   • -10s / +10s skip
 *   • Speed picker (0.75 / 1 / 1.25 / 1.5 / 2)
 *   • Optional persisted progress via persistKey
 *   • Keyboard shortcuts when focused: Space (toggle), ←/→ (±5s),
 *     Shift+←/→ (±10s), 0…9 (jump to 0%, 10%, … 90%)
 *
 * Variants:
 *   <AudioPlayer src=… title=… />            → full editorial card
 *   <AudioPlayer src=… compact />            → single-row inline strip
 *
 * Theming: uses the dashboard token system (`hsl(var(--primary))`,
 * `hsl(var(--surface))`, etc.) so it adapts to light / dark / night-shift
 * automatically when nested under `.dashboard-scope`.
 */

import React, { useCallback, useRef } from 'react';
import { Pause, Play, RotateCcw, RotateCw, Volume2, AlertCircle } from 'lucide-react';
import { useAudio } from '../hooks/useAudio';

const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5, 2];

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function AudioPlayer({
  src,
  title,
  subtitle,
  persistKey,
  compact = false,
  className = '',
  onEnded,
  showSpeed = true,
}) {
  const audio = useAudio(src, { persistKey });
  const containerRef = useRef(null);

  const handleScrub = useCallback(
    (e) => {
      const value = Number(e.target.value);
      if (Number.isFinite(value)) audio.seek(value);
    },
    [audio],
  );

  const handleKey = useCallback(
    (e) => {
      // Don't hijack typing when player is focused via tab from a transcript
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          audio.toggle();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          audio.skip(e.shiftKey ? -10 : -5);
          break;
        case 'ArrowRight':
          e.preventDefault();
          audio.skip(e.shiftKey ? 10 : 5);
          break;
        default:
          if (/^[0-9]$/.test(e.key) && audio.duration > 0) {
            e.preventDefault();
            audio.seek((audio.duration * Number(e.key)) / 10);
          }
      }
    },
    [audio],
  );

  const playedFraction = audio.duration > 0 ? audio.currentTime / audio.duration : 0;
  const Icon = audio.isPlaying ? Pause : Play;

  const surfaceStyle = {
    background: 'hsl(var(--surface) / 0.92)',
    border: '1px solid hsl(var(--fg) / 0.08)',
    color: 'hsl(var(--fg))',
    boxShadow: '0 1px 2px hsl(var(--fg) / 0.04), 0 12px 28px -16px hsl(var(--fg) / 0.14)',
  };
  const primaryBtnStyle = {
    background: 'linear-gradient(180deg, hsl(var(--primary) / 0.95) 0%, hsl(var(--primary)) 100%)',
    color: 'white',
    boxShadow: '0 6px 16px -8px hsl(var(--primary) / 0.55)',
  };
  const trackStyle = {
    background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${
      playedFraction * 100
    }%, hsl(var(--fg) / 0.12) ${playedFraction * 100}%, hsl(var(--fg) / 0.12) 100%)`,
  };

  // Hidden onEnded forwarding — avoids extra event wiring at call sites.
  React.useEffect(() => {
    if (!onEnded) return undefined;
    if (!audio.isPlaying && audio.duration > 0 && audio.currentTime >= audio.duration - 0.25) {
      onEnded();
    }
  }, [audio.isPlaying, audio.currentTime, audio.duration, onEnded]);

  if (compact) {
    return (
      <div
        ref={containerRef}
        tabIndex={0}
        onKeyDown={handleKey}
        className={`flex items-center gap-3 px-3 py-2 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${className}`}
        style={{ ...surfaceStyle, focusRingColor: 'hsl(var(--primary))' }}
        role="region"
        aria-label={title || 'Audio player'}
      >
        <button
          type="button"
          onClick={audio.toggle}
          disabled={!src || !!audio.error}
          aria-label={audio.isPlaying ? 'Pause' : 'Play'}
          className="w-9 h-9 rounded-full flex items-center justify-center disabled:opacity-50"
          style={primaryBtnStyle}
        >
          <Icon className="w-4 h-4" fill="currentColor" />
        </button>
        <input
          type="range"
          min={0}
          max={audio.duration || 0}
          step={0.1}
          value={audio.currentTime}
          onChange={handleScrub}
          disabled={!audio.isReady}
          aria-label="Seek"
          className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer disabled:cursor-not-allowed"
          style={trackStyle}
        />
        <span
          className="text-xs tabular-nums font-medium"
          style={{ color: 'hsl(var(--muted-fg))' }}
        >
          {formatTime(audio.currentTime)} / {formatTime(audio.duration)}
        </span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKey}
      className={`p-4 rounded-2xl outline-none focus-visible:ring-2 ${className}`}
      style={surfaceStyle}
      role="region"
      aria-label={title || 'Audio player'}
    >
      {(title || subtitle) && (
        <div className="mb-3">
          {title && (
            <div className="text-sm font-semibold" style={{ color: 'hsl(var(--fg))' }}>
              {title}
            </div>
          )}
          {subtitle && (
            <div className="text-xs mt-0.5" style={{ color: 'hsl(var(--muted-fg))' }}>
              {subtitle}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => audio.skip(-10)}
          disabled={!audio.isReady}
          aria-label="Back 10 seconds"
          className="w-9 h-9 rounded-full flex items-center justify-center disabled:opacity-40 hover:opacity-90 transition"
          style={{
            background: 'hsl(var(--fg) / 0.06)',
            color: 'hsl(var(--fg))',
          }}
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={audio.toggle}
          disabled={!src || !!audio.error}
          aria-label={audio.isPlaying ? 'Pause' : 'Play'}
          className="w-12 h-12 rounded-full flex items-center justify-center disabled:opacity-50 hover:scale-105 transition"
          style={primaryBtnStyle}
        >
          <Icon className="w-5 h-5" fill="currentColor" />
        </button>

        <button
          type="button"
          onClick={() => audio.skip(10)}
          disabled={!audio.isReady}
          aria-label="Forward 10 seconds"
          className="w-9 h-9 rounded-full flex items-center justify-center disabled:opacity-40 hover:opacity-90 transition"
          style={{
            background: 'hsl(var(--fg) / 0.06)',
            color: 'hsl(var(--fg))',
          }}
        >
          <RotateCw className="w-4 h-4" />
        </button>

        <div className="flex-1 flex flex-col gap-1.5 min-w-0">
          <input
            type="range"
            min={0}
            max={audio.duration || 0}
            step={0.1}
            value={audio.currentTime}
            onChange={handleScrub}
            disabled={!audio.isReady}
            aria-label="Seek"
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer disabled:cursor-not-allowed"
            style={trackStyle}
          />
          <div
            className="flex justify-between text-xs tabular-nums"
            style={{ color: 'hsl(var(--muted-fg))' }}
          >
            <span>{formatTime(audio.currentTime)}</span>
            <span>{formatTime(audio.duration)}</span>
          </div>
        </div>

        {showSpeed && (
          <div className="relative">
            <select
              value={audio.rate}
              onChange={(e) => audio.setRate(Number(e.target.value))}
              aria-label="Playback speed"
              disabled={!audio.isReady}
              className="text-xs font-medium pl-2 pr-6 py-1.5 rounded-md cursor-pointer disabled:opacity-40 appearance-none"
              style={{
                background: 'hsl(var(--fg) / 0.06)',
                color: 'hsl(var(--fg))',
                border: '1px solid hsl(var(--fg) / 0.08)',
              }}
            >
              {SPEED_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s === 1 ? '1×' : `${s}×`}
                </option>
              ))}
            </select>
            <Volume2
              className="w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'hsl(var(--muted-fg))' }}
            />
          </div>
        )}
      </div>

      {audio.error && (
        <div
          className="mt-3 px-3 py-2 rounded-md text-xs flex items-center gap-2"
          style={{
            background: 'hsl(var(--destruct, 0 84% 60%) / 0.08)',
            color: 'hsl(var(--destruct, 0 84% 60%))',
          }}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{audio.error}</span>
        </div>
      )}
    </div>
  );
}
