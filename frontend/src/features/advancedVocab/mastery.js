/**
 * Per-item mastery state for Advanced Vocabulary.
 *
 * Stored in localStorage so progress persists across sessions without a
 * server round-trip. The shape is:
 *
 *   { [moduleId]: { [itemKey]: 'new' | 'learning' | 'known' } }
 *
 * Keeping it scoped by moduleId means modules don't bleed mastery into each
 * other, and the entire object is small enough to write back on every change.
 */

const LS_KEY = 'advanced_vocab_mastery_v1';

export const MASTERY_LEVELS = ['new', 'learning', 'known'];

function safeRead() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function safeWrite(state) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {
    /* localStorage may be disabled — silently ignore */
  }
}

export function loadMastery(moduleId) {
  const all = safeRead();
  return all[moduleId] || {};
}

export function setMasteryLevel(moduleId, itemKey, level) {
  if (!moduleId || !itemKey) return;
  const all = safeRead();
  const forModule = { ...(all[moduleId] || {}) };
  if (!level || level === 'new') {
    delete forModule[itemKey];
  } else {
    forModule[itemKey] = level;
  }
  all[moduleId] = forModule;
  safeWrite(all);
}

export function masterySummary(map) {
  const summary = { new: 0, learning: 0, known: 0 };
  Object.values(map || {}).forEach((lvl) => {
    if (summary[lvl] !== undefined) summary[lvl] += 1;
  });
  return summary;
}
