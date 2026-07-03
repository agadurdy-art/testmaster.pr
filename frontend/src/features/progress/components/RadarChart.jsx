// Extracted verbatim from pages/Progress.js (Faz1 refactor).
import React from 'react';
import { T, radarPoint } from '../constants';

export default function RadarChart({ skills, actual, target }) {
  // Polygon points for actual + target
  const actualPts = skills
    .map((_, idx) => {
      const v = actual[idx] || 0;
      const { x, y } = radarPoint(idx, v);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  const targetPts = skills
    .map((_, idx) => {
      const { x, y } = radarPoint(idx, target);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const labelPos = [
    { x: 0, y: -160, anchor: 'middle' },   // top
    { x: 165, y: 4, anchor: 'middle' },    // right
    { x: 0, y: 172, anchor: 'middle' },    // bottom
    { x: -165, y: 4, anchor: 'middle' },   // left
  ];

  return (
    <svg viewBox="-180 -180 360 360" style={{ width: 280, height: 280 }} aria-label="Band skill radar">
      {/* concentric grids — 9, 7, 5, 3 */}
      {[9, 7, 5, 3].map((b) => (
        <circle
          key={b}
          cx={0}
          cy={0}
          r={(b / 9) * 140}
          fill={`hsl(${T.bg})`}
          fillOpacity={0.5}
          stroke={`hsl(${T.border})`}
          strokeWidth={1}
        />
      ))}
      {/* axes */}
      <line x1={0} y1={0} x2={0} y2={-140} stroke={`hsl(${T.border})`} strokeWidth={1} />
      <line x1={0} y1={0} x2={140} y2={0} stroke={`hsl(${T.border})`} strokeWidth={1} />
      <line x1={0} y1={0} x2={0} y2={140} stroke={`hsl(${T.border})`} strokeWidth={1} />
      <line x1={0} y1={0} x2={-140} y2={0} stroke={`hsl(${T.border})`} strokeWidth={1} />

      {/* target polygon */}
      <polygon
        points={targetPts}
        fill={`hsl(${T.gold} / 0.18)`}
        stroke={`hsl(${T.gold})`}
        strokeWidth={1.5}
        strokeDasharray="4 3"
      />
      {/* actual polygon */}
      <polygon
        points={actualPts}
        fill={`hsl(${T.brand} / 0.25)`}
        stroke={`hsl(${T.brand})`}
        strokeWidth={2}
      />

      {/* labels */}
      {skills.map((s, idx) => (
        <g key={s.id}>
          <text
            x={labelPos[idx].x}
            y={labelPos[idx].y}
            textAnchor={labelPos[idx].anchor}
            style={{ fontSize: 13, fontWeight: 600, fill: `hsl(${T.ink})` }}
          >
            {s.label}
          </text>
          <text
            x={labelPos[idx].x}
            y={labelPos[idx].y + (idx === 2 ? 16 : -16)}
            textAnchor={labelPos[idx].anchor}
            style={{ fontSize: 11, fill: `hsl(${T.muted})`, fontWeight: 500 }}
          >
            {actual[idx] > 0 ? `${actual[idx].toFixed(1)} → ${target.toFixed(1)}` : `— → ${target.toFixed(1)}`}
          </text>
        </g>
      ))}
    </svg>
  );
}
