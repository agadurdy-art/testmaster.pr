import React, { useMemo } from 'react';

/**
 * Procedurally placed amplitude bars around the orb.
 * Mirrors the HTML prototype: 44 bars, random heights 8-34px, random delays 0-900ms.
 * Seeded by a stable array to avoid re-renders jittering.
 */
const BARS = Array.from({ length: 44 }, (_, i) => ({
  h: 8 + Math.round(Math.random() * 26),
  delay: Math.round(Math.random() * 900),
  angle: (i / 44) * 360,
}));

export default function AmpRing({ radius = 130 }) {
  const bars = useMemo(() => BARS, []);
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {bars.map((b, i) => (
        <span
          key={i}
          className="sp-amp-bar"
          style={{
            height: `${b.h}px`,
            transform: `translate(-50%, -50%) rotate(${b.angle}deg) translateY(-${radius}px)`,
            animationDelay: `${b.delay}ms`,
          }}
        />
      ))}
    </div>
  );
}
