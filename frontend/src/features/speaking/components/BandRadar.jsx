import React from 'react';

// Scale point = cx + (val/9) * 100 — so each dot is (value/9) * 100 away from center 130.
// top = FC, right = LR, bottom = GRA, left = PR
function pointFor(axis, value) {
  const r = (value / 9) * 100;
  if (axis === 'top')    return { x: 130, y: 130 - r };
  if (axis === 'right')  return { x: 130 + r, y: 130 };
  if (axis === 'bottom') return { x: 130, y: 130 + r };
  return { x: 130 - r, y: 130 };
}

export default function BandRadar({ fc, lr, gra, pr }) {
  const top = pointFor('top', fc);
  const right = pointFor('right', lr);
  const bottom = pointFor('bottom', gra);
  const left = pointFor('left', pr);
  const poly = [top, right, bottom, left].map(p => `${p.x},${p.y}`).join(' ');

  return (
    <svg viewBox="0 0 260 260" width="260" height="260">
      {/* Rings */}
      <g fill="none" stroke="hsl(214 32% 85%)" strokeDasharray="2 3">
        <polygon points="130,60 200,130 130,200 60,130" />
        <polygon points="130,30 230,130 130,230 30,130" />
      </g>
      <polygon points="130,85 175,130 130,175 85,130" fill="none" stroke="hsl(214 32% 91%)" strokeDasharray="2 3" />
      <polygon points="130,110 150,130 130,150 110,130" fill="none" stroke="hsl(214 32% 95%)" strokeDasharray="2 3" />
      {/* Spokes */}
      <g stroke="hsl(214 32% 88%)" strokeDasharray="1 3">
        <line x1="130" y1="130" x2="130" y2="30" />
        <line x1="130" y1="130" x2="230" y2="130" />
        <line x1="130" y1="130" x2="130" y2="230" />
        <line x1="130" y1="130" x2="30" y2="130" />
      </g>
      {/* Data polygon */}
      <polygon
        points={poly}
        fill="hsl(160 84% 39% / 0.18)"
        stroke="hsl(160 84% 39%)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Dots */}
      {[top, right, bottom, left].map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4"
                fill="hsl(160 84% 39%)" stroke="white" strokeWidth="1.5" />
      ))}
      {/* Axis labels */}
      <text x="130" y="20" textAnchor="middle" className="sp-radar-label">FC</text>
      <text x="130" y="248" textAnchor="middle" className="sp-radar-label">GRA</text>
      <text x="248" y="134" textAnchor="middle" className="sp-radar-label">LR</text>
      <text x="12" y="134" textAnchor="middle" className="sp-radar-label">PR</text>
      {/* Values */}
      <text x="130" y="36" textAnchor="middle" fontFamily="Playfair Display" fontSize="14" fontWeight="700" fill="hsl(160 82% 27%)">{fc.toFixed(1)}</text>
      <text x="226" y="146" textAnchor="middle" fontFamily="Playfair Display" fontSize="14" fontWeight="700" fill="hsl(160 82% 27%)">{lr.toFixed(1)}</text>
      <text x="130" y="224" textAnchor="middle" fontFamily="Playfair Display" fontSize="14" fontWeight="700" fill="hsl(160 82% 27%)">{gra.toFixed(1)}</text>
      <text x="34" y="146" textAnchor="middle" fontFamily="Playfair Display" fontSize="14" fontWeight="700" fill="hsl(160 82% 27%)">{pr.toFixed(1)}</text>
      <text x="130" y="134" textAnchor="middle" className="sp-radar-label" style={{ fill: 'hsl(215 16% 70%)' }}>9.0 max</text>
    </svg>
  );
}
