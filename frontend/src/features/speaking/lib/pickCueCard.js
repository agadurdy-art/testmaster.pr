// Part 2 cue-card picker. Reads the static pool in
// data/part2_cue_cards.json and returns one card in the shape
// SpeakingPractice / ResultsState already expect (id, stamp, topic,
// prompt, bullets, andExplain). The pool replaces the single hardcoded
// CUE_CARD that the Aunt-Mai demo card was leaking into Smart Practice.
import POOL from '../data/part2_cue_cards.json';

const stampFor = (id) => {
  // 'cc-006' → 'IELTS · Part 2 · 006'
  const num = String(id || '').replace(/\D+/g, '').padStart(3, '0') || '000';
  return `IELTS · Part 2 · ${num}`;
};

const decorate = (card) => ({
  id: card.id,
  stamp: stampFor(card.id),
  topic: card.topic,
  prompt: card.prompt,
  bullets: Array.isArray(card.bullets) ? card.bullets : [],
  andExplain: card.andExplain,
});

/** Pick a random Part 2 cue card. Optional excludeId avoids repeats; optional
 * theme restricts to a single topic bucket (used by Full Test so Part 1 / 2 / 3
 * stay tematik bağlantılı). Falls back to the full pool if the theme has no
 * cards (defensive — should not happen with the seeded JSON). */
export function pickRandomCueCard({ excludeId, theme } = {}) {
  if (!POOL.length) return null;
  let scope = POOL;
  if (theme) {
    const themed = POOL.filter((c) => c.topic === theme);
    if (themed.length) scope = themed;
  }
  const filtered = excludeId
    ? scope.filter((c) => c.id !== excludeId)
    : scope;
  const pool = filtered.length ? filtered : scope;
  const card = pool[Math.floor(Math.random() * pool.length)];
  return decorate(card);
}

/** Look up a specific card by id. Returns null if not found. */
export function getCueCardById(id) {
  const card = POOL.find((c) => c.id === id);
  return card ? decorate(card) : null;
}

/** Read-only access to the full pool (decorated). For pickers / debug. */
export function listCueCards() {
  return POOL.map(decorate);
}
