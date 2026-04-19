import React from 'react';

// IELTS word-count thresholds. Going under costs band points on Task Response,
// so the UI nudges users to hit the minimum before they submit.
const THRESHOLDS = {
  task1: { target: 150, warn: 120 },
  task2: { target: 250, warn: 200 },
};

function countWords(text) {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Live word counter with threshold-based colouring.
 *
 *   red    — below warn (way too short)
 *   amber  — between warn and target (close but not there)
 *   green  — at or above target
 *
 * Accepts either a pre-computed count (`count`) or raw `text` and computes it.
 * Pass `task="task1"` for 150-word tasks, `task="task2"` for 250-word tasks,
 * or custom `target` / `warn` to override.
 */
export default function WordCounter({
  text,
  count,
  task = 'task2',
  target,
  warn,
  className = '',
}) {
  const preset = THRESHOLDS[task] || THRESHOLDS.task2;
  const tgt = target ?? preset.target;
  const wrn = warn ?? preset.warn;
  const n = typeof count === 'number' ? count : countWords(text);

  let tone = 'text-red-500';
  if (n >= tgt) tone = 'text-green-600';
  else if (n >= wrn) tone = 'text-amber-600';

  const remaining = Math.max(0, tgt - n);

  return (
    <span
      className={`inline-flex items-baseline gap-1 text-sm font-medium ${tone} ${className}`}
      data-testid="word-counter"
      aria-live="polite"
    >
      <span>{n} words</span>
      {remaining > 0 ? (
        <span className="text-xs opacity-80">({remaining} more)</span>
      ) : (
        <span className="text-xs opacity-80">✓ target met</span>
      )}
    </span>
  );
}

export { countWords };
