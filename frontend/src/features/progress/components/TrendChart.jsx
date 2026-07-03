// Extracted verbatim from pages/Progress.js (Faz1 refactor).
import React from 'react';
import { T, FONT_MONO } from '../constants';

export default function TrendChart({ points, target }) {
  const W = 560;
  const H = 120;
  const padX = 16;
  const padY = 16;
  // y axis: 4.0 → 9.0 mapped to H-padY → padY
  const minBand = 4.0;
  const maxBand = 9.0;
  const yFor = (band) => H - padY - ((band - minBand) / (maxBand - minBand)) * (H - 2 * padY);
  const xFor = (i) => padX + (i / Math.max(1, points.length - 1)) * (W - 2 * padX);

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i).toFixed(1)},${yFor(p.band).toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L ${xFor(points.length - 1).toFixed(1)},${(H - padY).toFixed(1)} L ${xFor(0).toFixed(1)},${(H - padY).toFixed(1)} Z`;

  const targetY = yFor(target);

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ height: 120, width: '100%', marginTop: 4 }}>
        {/* grid lines at bands 5, 6, 7, 8 */}
        {[5, 6, 7, 8].map((b) => (
          <line
            key={b}
            x1={0} y1={yFor(b)} x2={W} y2={yFor(b)}
            stroke={`hsl(${T.borderSoft})`} strokeWidth={1} strokeDasharray="2 4"
          />
        ))}
        {/* target line */}
        <line x1={0} y1={targetY} x2={W} y2={targetY}
          stroke={`hsl(${T.gold})`} strokeWidth={1.5} strokeDasharray="4 4" />
        {/* area + line */}
        <path d={areaPath} fill={`hsl(${T.brand} / 0.12)`} />
        <path d={linePath} stroke={`hsl(${T.brand})`} strokeWidth={2.5} fill="none"
          strokeLinecap="round" strokeLinejoin="round" />
        {/* dots */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={xFor(i)} cy={yFor(p.band)} r={4}
            fill={`hsl(${T.brand})`}
            stroke={`hsl(${T.surface})`} strokeWidth={2}
          />
        ))}
        {/* y labels */}
        <text x={4} y={yFor(target) - 4} style={{ fontSize: 10, fontFamily: FONT_MONO, fontWeight: 600, fill: `hsl(43 60% 40%)` }}>
          {target.toFixed(1)} target
        </text>
      </svg>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        fontSize: 11, color: `hsl(${T.muted})`,
        fontFamily: FONT_MONO, marginTop: 4,
      }}>
        <span>{points[0].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        <span>{points[points.length - 1].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · today</span>
      </div>
    </div>
  );
}
