import React from "react";

/**
 * Minimal inline-SVG radar chart for the four IELTS criteria.
 * No chart library: we only need 4 axes, and a library would ship kilobytes
 * of abstractions for what is ~30 lines of geometry.
 *
 * Props:
 *   values: [{ code: "TA"|"CC"|"LR"|"GRA", value: number }]  (0..9)
 *   size: number (px, default 180)
 *   color: CSS color for the data polygon (default emerald brand token)
 *   benchmark: optional number (0..9) — draws a dashed ghost polygon
 *   benchmarkLabel: legend label for the benchmark (default "Band 7")
 *   showLegend: show a tiny legend row at the bottom (default false)
 */
export default function BandRadarChart({
  values,
  size = 180,
  color = "hsl(160 84% 39%)",
  benchmark,
  benchmarkLabel = "Band 7",
  showLegend = false,
}) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.36;
  const n = values.length;
  const max = 9;

  const pointAt = (i, magnitude) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return [cx + Math.cos(angle) * magnitude, cy + Math.sin(angle) * magnitude];
  };

  const rings = [3, 5, 7, 9].map((v) => {
    const rr = (v / max) * r;
    const pts = Array.from({ length: n }, (_, i) => pointAt(i, rr));
    return (
      <polygon
        key={v}
        points={pts.map((p) => p.join(",")).join(" ")}
        fill="none"
        stroke="hsl(215 16% 47% / 0.35)"
        strokeWidth="1"
        strokeDasharray={v === 9 ? "0" : "2 3"}
      />
    );
  });

  const spokes = Array.from({ length: n }, (_, i) => {
    const [x, y] = pointAt(i, r);
    return (
      <line
        key={i}
        x1={cx}
        y1={cy}
        x2={x}
        y2={y}
        stroke="hsl(215 16% 47% / 0.3)"
        strokeWidth="1"
        strokeDasharray="1 3"
      />
    );
  });

  const dataPts = values.map((v, i) => pointAt(i, (v.value / max) * r));

  const benchmarkPts =
    typeof benchmark === "number"
      ? Array.from({ length: n }, (_, i) => pointAt(i, (benchmark / max) * r))
      : null;

  const labels = values.map((v, i) => {
    const [lx, ly] = pointAt(i, r + 20);
    return (
      <g key={v.code}>
        <text
          x={lx}
          y={ly - 3}
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="Inter, sans-serif"
          fontSize="10"
          fontWeight="600"
          letterSpacing="1.1"
          fill="hsl(215 16% 47%)"
        >
          {v.code}
        </text>
        <text
          x={lx}
          y={ly + 10}
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="'Playfair Display', serif"
          fontSize="13"
          fontWeight="700"
          fill="hsl(160 84% 32%)"
        >
          {v.value.toFixed(1)}
        </text>
      </g>
    );
  });

  const dots = dataPts.map(([x, y], i) => (
    <circle
      key={i}
      cx={x}
      cy={y}
      r="3.5"
      fill="white"
      stroke={color}
      strokeWidth="2"
    />
  ));

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      role="img"
      aria-label="Band score radar across four IELTS criteria"
    >
      {rings}
      {spokes}
      {benchmarkPts && (
        <polygon
          points={benchmarkPts.map((p) => p.join(",")).join(" ")}
          fill="none"
          stroke={color}
          strokeOpacity="0.45"
          strokeWidth="1.5"
          strokeDasharray="3 4"
        />
      )}
      <polygon
        points={dataPts.map((p) => p.join(",")).join(" ")}
        fill={color}
        fillOpacity="0.18"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {dots}
      {labels}
      {showLegend && (
        <g
          fontFamily="Inter, sans-serif"
          fontSize="10"
          fill="hsl(215 16% 47%)"
        >
          <rect x={cx - 60} y={size - 14} width="9" height="2" fill={color} />
          <text x={cx - 46} y={size - 11}>
            Your score
          </text>
          {benchmarkPts && (
            <>
              <line
                x1={cx + 10}
                y1={size - 13}
                x2={cx + 19}
                y2={size - 13}
                stroke={color}
                strokeOpacity="0.45"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              <text x={cx + 24} y={size - 11}>
                {benchmarkLabel}
              </text>
            </>
          )}
        </g>
      )}
    </svg>
  );
}
