// lib — plan label/tone constants and date/initials helpers, verbatim from
// pages/Profile.js lines 63-126 (Faz1 wave 10).
export const PLAN_LABELS = {
  free: 'Free',
  weekly: 'Weekly',
  monthly: 'Monthly',
  exam: 'Exam Pack',
  exam_pack: 'Exam Pack',
  custom: 'Custom',
};

// Legacy V1 plan IDs → V2 tier so the badge always reads as a current tier.
export const LEGACY_PLAN_ALIAS = {
  explorer: 'free',
  learner: 'weekly',
  achiever: 'monthly',
  master: 'monthly',
  pro: 'monthly',
};

export const PLAN_TONE = {
  free: { bg: 'hsl(220 14% 96%)', fg: 'hsl(220 12% 30%)', border: 'hsl(220 13% 88%)' },
  weekly: { bg: 'hsl(217 100% 96%)', fg: 'hsl(217 76% 38%)', border: 'hsl(217 85% 88%)' },
  monthly: { bg: 'hsl(262 95% 96%)', fg: 'hsl(262 70% 40%)', border: 'hsl(262 85% 88%)' },
  exam: { bg: 'hsl(38 95% 94%)', fg: 'hsl(28 72% 38%)', border: 'hsl(38 80% 84%)' },
  custom: { bg: 'hsl(187 90% 94%)', fg: 'hsl(187 70% 30%)', border: 'hsl(187 75% 84%)' },
};

export const SKILL_TONE = {
  Writing: 'var(--writing, 25 95% 53%)',
  Reading: 'var(--reading, 217 91% 60%)',
  Listening: 'var(--listening, 262 83% 58%)',
  Speaking: 'var(--speaking, 142 71% 45%)',
};

export function formatDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatISODate(input) {
  if (!input) return '';
  try {
    const d = new Date(input);
    if (Number.isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 10);
  } catch {
    return '';
  }
}

export function initialsOf(name, email) {
  const seed = (name || email || '').trim();
  if (!seed) return '?';
  const parts = seed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return seed[0].toUpperCase();
}
