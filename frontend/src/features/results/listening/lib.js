import {
  Edit3, ListChecks, Shuffle, CheckSquare, Headphones,
} from 'lucide-react';

// =============================================================================
// HELPERS — listening: part stats, skill counts, fallback insights
// =============================================================================

const SKILL_LABELS = {
  note:    { name: 'Note / Form Completion', icon: Edit3 },
  mc:      { name: 'Multiple Choice',         icon: ListChecks },
  match:   { name: 'Matching',                icon: Shuffle },
  multi:   { name: 'Multi-Select',            icon: CheckSquare },
  short:   { name: 'Short Answer',            icon: Edit3 },
  other:   { name: 'Other',                   icon: Headphones },
};

function categorizeSkill(question_type) {
  const t = String(question_type || '').toLowerCase();
  if (t.includes('multi_select') || t.includes('multi-select') || t.includes('multiselect') || t.includes('select_two') || t.includes('select_three')) return 'multi';
  if (t.includes('multiple') || t === 'mc' || t === 'mcq') return 'mc';
  if (t.includes('match')) return 'match';
  if (t.includes('short_answer') || t.includes('short-answer')) return 'short';
  if (t.includes('note') || t.includes('form') || t.includes('table') || t.includes('flow') || t.includes('summary') || t.includes('completion') || t.includes('fill') || t.includes('blank')) return 'note';
  return 'other';
}

function bandTier(band) {
  const b = Number(band) || 0;
  if (b >= 9)   return 'Expert User';
  if (b >= 8)   return 'Very Good User';
  if (b >= 7)   return 'Good User';
  if (b >= 6)   return 'Competent User';
  if (b >= 5)   return 'Modest User';
  if (b >= 4)   return 'Limited User';
  return 'Extremely Limited';
}

// IELTS listening: 4 parts, 10 questions each (Q1-10, Q11-20, Q21-30, Q31-40)
function resolvePartNumber(q, total) {
  if (q.part != null && !Number.isNaN(Number(q.part))) return Number(q.part);
  if (q.part_number != null) return Number(q.part_number);
  const qid = Number(q.question_id ?? q.question_number ?? 0);
  if (!qid) return 1;
  const t = Number(total) || 40;
  const quarter = Math.ceil(t / 4);
  if (qid <= quarter)     return 1;
  if (qid <= 2 * quarter) return 2;
  if (qid <= 3 * quarter) return 3;
  return 4;
}

function computePartStats(question_results) {
  const total = question_results.length;
  const groups = new Map();
  question_results.forEach((q) => {
    const k = resolvePartNumber(q, total);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(q);
  });
  const sortedKeys = [...groups.keys()].sort(
    (a, b) => (Number(a) || 99) - (Number(b) || 99)
  );
  return sortedKeys.map((k, idx) => {
    const items = groups.get(k);
    const correct = items.filter((q) => q.is_correct).length;
    const tot = items.length;
    const skills = {};
    items.forEach((q) => {
      const sk = categorizeSkill(q.question_type);
      if (!skills[sk]) skills[sk] = { correct: 0, total: 0 };
      skills[sk].total += 1;
      if (q.is_correct) skills[sk].correct += 1;
    });
    return {
      n: k,
      idx,
      correct,
      total: tot,
      percent: tot ? Math.round((correct / tot) * 100) : 0,
      skills,
    };
  });
}

function computeSkillCounts(question_results) {
  const counts = {};
  question_results.forEach((q) => {
    const k = categorizeSkill(q.question_type);
    if (!counts[k]) counts[k] = { correct: 0, wrong: 0, total: 0 };
    counts[k].total += 1;
    if (q.is_correct) counts[k].correct += 1;
    else counts[k].wrong += 1;
  });
  return counts;
}

function priorityFromCounts(skillCounts) {
  const sorted = Object.entries(skillCounts)
    .filter(([k]) => k !== 'other')
    .sort((a, b) => b[1].wrong - a[1].wrong);
  if (!sorted.length || sorted[0][1].wrong === 0) return null;
  const [key, c] = sorted[0];
  return { key, ...SKILL_LABELS[key], wrong: c.wrong, total: c.total };
}

function fastestGainEstimate(question_results, skillCounts, currentBand) {
  const priority = priorityFromCounts(skillCounts);
  if (!priority) return null;
  const wrong = priority.wrong;
  const recoverable = Math.max(1, Math.round(wrong * 0.7));
  const newCorrect = (question_results.filter((q) => q.is_correct).length) + recoverable;
  const lift = Math.min(2, Math.max(0.5, recoverable * 0.1));
  const projected = Math.min(9, Math.max(4, Number(currentBand || 6) + lift));
  return {
    skillName: priority.name,
    recoverable,
    projectedBand: Math.round(projected * 2) / 2,
    newCorrect,
    totalQuestions: question_results.length,
  };
}

// Per-part color tones — listening sample mockup uses emerald/amber/orange/red
// for parts 1-4 to signal increasing difficulty.
const PART_COLOR_KEYS = ['emerald', 'amber', 'orange', 'rose'];

const PART_TONES = {
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', num: 'text-emerald-700', text: 'text-emerald-900', chipBg: 'bg-emerald-100', chipText: 'text-emerald-800', chip: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  amber:   { bg: 'bg-amber-50',   border: 'border-amber-200',   num: 'text-amber-700',   text: 'text-amber-900',   chipBg: 'bg-amber-100',   chipText: 'text-amber-800',   chip: 'bg-amber-100 text-amber-700 border-amber-200' },
  orange:  { bg: 'bg-orange-50',  border: 'border-orange-200',  num: 'text-orange-700',  text: 'text-orange-900',  chipBg: 'bg-orange-100',  chipText: 'text-orange-800',  chip: 'bg-orange-100 text-orange-700 border-orange-200' },
  rose:    { bg: 'bg-rose-50',    border: 'border-rose-200',    num: 'text-rose-700',    text: 'text-rose-900',    chipBg: 'bg-rose-100',    chipText: 'text-rose-800',    chip: 'bg-rose-100 text-rose-700 border-rose-200' },
};

const PART_TOPICS = {
  1: 'Conversation · everyday context',
  2: 'Monologue · social context',
  3: 'Discussion · academic/training',
  4: 'Lecture · academic',
};

export {
  SKILL_LABELS,
  categorizeSkill,
  bandTier,
  resolvePartNumber,
  computePartStats,
  computeSkillCounts,
  priorityFromCounts,
  fastestGainEstimate,
  PART_COLOR_KEYS,
  PART_TONES,
  PART_TOPICS,
};
