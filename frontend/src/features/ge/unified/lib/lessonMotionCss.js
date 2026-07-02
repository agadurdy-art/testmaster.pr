// ═══════ LESSON SURFACE MOTION ═══════
// Very subtle — the lesson page is for learning, not for showing off.
// Activities fade in when they switch; sidebar dots breathe; cards lift on
// hover. Honors prefers-reduced-motion in full.
export const LESSON_MOTION_CSS = `
.lesson-surface [data-testid="micro-reading"],
.lesson-surface [data-testid="listening-activity"],
.lesson-surface [data-testid="production-activity"],
.lesson-surface [data-testid="exit-ticket"],
.lesson-surface [data-testid="vocab-games-player"],
.lesson-surface [data-testid="grammar-games-player"],
.lesson-surface [data-testid="lesson-summary"] {
  animation: lessonFadeUp 0.36s cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes lessonFadeUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Soft hover lift on activity cards — kids feel they're interactive. */
.lesson-surface [data-testid="micro-reading"] [class*="rounded-xl"][class*="border-2"]:hover,
.lesson-surface [data-testid="listening-activity"] [class*="rounded-xl"][class*="border-2"]:hover,
.lesson-surface [data-testid="exit-ticket"] [class*="rounded-xl"][class*="border-2"]:hover {
  transform: translateY(-1px);
  transition: transform 0.18s ease;
}

/* Trophy + score breathe on Lesson Complete. */
.lesson-surface [data-testid="lesson-summary"] .lesson-trophy {
  animation: lessonTrophyPulse 2.6s ease-in-out infinite;
}
@keyframes lessonTrophyPulse {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.04); }
}

/* Score bars sweep in. */
.lesson-surface [data-testid="lesson-summary"] [role="progressbar"] > div {
  transition: width 0.9s cubic-bezier(0.22, 1, 0.36, 1);
}

/* Locate-in-text highlight pulses softly the first second. */
.lesson-surface mark.bg-amber-200 {
  animation: lessonLocate 1.4s ease-out 1;
}
@keyframes lessonLocate {
  0%   { background-color: #fde68a; box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.45); }
  60%  { background-color: #fcd34d; box-shadow: 0 0 0 8px rgba(245, 158, 11, 0); }
  100% { background-color: #fde68a; }
}

@media (prefers-reduced-motion: reduce) {
  .lesson-surface * {
    animation: none !important;
    transition: none !important;
  }
}
`;
