// Module-level constants + pure helpers extracted verbatim from pages/Progress.js (Faz1 refactor).
import { BookOpen, Headphones, Mic, PenTool } from 'lucide-react';

// D10 handoff visual tokens — port-only
const T = {
  brand: '160 84% 39%',
  brandDark: '160 84% 28%',
  sky: '199 89% 60%',
  gold: '43 96% 56%',
  rose: '350 70% 58%',
  ink: '220 25% 12%',
  muted: '220 10% 45%',
  fainter: '220 10% 65%',
  bg: '210 20% 98%',
  surface: '0 0% 100%',
  border: '220 15% 90%',
  borderSoft: '220 15% 94%',
};
const FONT_DISPLAY = '"Playfair Display", Georgia, serif';
const FONT_SANS = '"Inter", system-ui, sans-serif';
const FONT_MONO = '"JetBrains Mono", ui-monospace, monospace';

const SKILLS = [
  { id: 'reading', label: 'Reading', Icon: BookOpen },
  { id: 'writing', label: 'Writing', Icon: PenTool },
  { id: 'listening', label: 'Listening', Icon: Headphones },
  { id: 'speaking', label: 'Speaking', Icon: Mic },
];

// Emoji + short descriptor used in the Strengths card. Per D10 handoff —
// readable at a glance, evokes the skill without re-rendering Lucide glyphs.
const STRENGTH_DESCRIPTORS = {
  reading:   { emoji: '📖', text: 'Strong comprehension' },
  listening: { emoji: '🎧', text: 'Sharp ear for detail' },
  writing:   { emoji: '✍️', text: 'Clear structure' },
  speaking:  { emoji: '🎤', text: 'Confident delivery' },
};

// Map a band score (0..9) to a percentage of the 0..9 axis (radar/bar fill)
const bandPct = (band) => Math.max(0, Math.min(100, (band / 9) * 100));

// Convert a (label-index, value) on a 4-axis radar to (x,y).
// Order: 0=top (Writing), 1=right (Speaking), 2=bottom (Reading), 3=left (Listening)
const radarPoint = (idx, value, radius = 140) => {
  const r = (value / 9) * radius;
  const angle = (idx * 90 - 90) * (Math.PI / 180); // start at top
  return { x: r * Math.cos(angle), y: r * Math.sin(angle) };
};

const PACE_OPTIONS = [
  { id: 'light', name: 'Light · 2 sessions/week', sub: 'Maintenance mode', sessions: 2 },
  { id: 'steady', name: 'Steady · 3 sessions/week', sub: 'On pace for your target band by exam', sessions: 3, lizPick: true },
  { id: 'intense', name: 'Intense · 5 sessions/week', sub: 'Exam in under 30 days', sessions: 5 },
];

export {
  T,
  FONT_DISPLAY,
  FONT_SANS,
  FONT_MONO,
  SKILLS,
  STRENGTH_DESCRIPTORS,
  bandPct,
  radarPoint,
  PACE_OPTIONS,
};
