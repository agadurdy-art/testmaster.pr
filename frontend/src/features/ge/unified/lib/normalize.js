// ═══════ GAME ITEM NORMALIZATION ═══════
// Sonnet content writers emit different field names per game type
// (`audio_text` for listen, `scrambled` for unscramble, `correct` vs
// `correct_sentence`, etc). Components expect uniform fields. Normalize at
// dispatch so each component sees the shape it was authored for.
//
// Also strips author meta-comments that leak through to the student view —
// notes like "(Full 'there is/are' in Unit 3.)" the writer left for itself.

const META_COMMENT_REGEX = /\s*\([^)]*\bUnit\s+\d+[^)]*\)\s*/gi;

function stripMeta(value) {
  if (typeof value !== 'string') return value;
  return value.replace(META_COMMENT_REGEX, ' ').replace(/\s+/g, ' ').trim();
}

function synthesizeDistractors(correct, peerItems, fieldNames = ['answer', 'word', 'correct', 'correct_sentence']) {
  if (!correct) return [];
  const norm = String(correct).toLowerCase().trim();
  const pool = [];
  for (const peer of peerItems || []) {
    for (const f of fieldNames) {
      const v = peer?.[f];
      if (typeof v === 'string' && v.trim() && v.toLowerCase().trim() !== norm) {
        pool.push(v.trim());
      }
    }
  }
  const unique = Array.from(new Set(pool));
  return unique.slice(0, 3);
}

function normalizeGameItem(rawItem, gameType, peerItems) {
  if (!rawItem || typeof rawItem !== 'object') return rawItem;
  const item = { ...rawItem };

  // Strip meta-comments from every string field — catches sentence,
  // audio_text, prompt, hint, answer, correct_sentence, etc.
  for (const k of Object.keys(item)) {
    if (typeof item[k] === 'string') item[k] = stripMeta(item[k]);
  }

  // Uniform `word` field for components that expect it.
  if (!item.word) {
    if (gameType === 'listen_write') item.word = item.answer || item.audio_text;
    else if (gameType === 'unscramble') item.word = item.answer;
    else if (item.audio_text && (gameType === 'listen_choose_word' || gameType === 'flashcard_match')) {
      item.word = item.audio_text;
    }
  }
  // Uniform `answer` field (some components use `correct`).
  if (!item.answer && item.correct) item.answer = item.correct;
  // Word-order: support both camelCase + snake_case.
  if (!item.correctSentence && item.correct_sentence) item.correctSentence = item.correct_sentence;
  if (!item.correct_sentence && item.correctSentence) item.correct_sentence = item.correctSentence;

  // ListenChooseWord wants a `distractors` array; data ships `options` (which
  // already includes the correct answer). Map options → distractors minus
  // the correct word; synthesize from peers if there's only 1 option.
  if (gameType === 'listen_choose_word') {
    const correct = item.word || item.answer;
    let distractors = Array.isArray(item.options)
      ? item.options.filter(o => o && String(o).toLowerCase().trim() !== String(correct).toLowerCase().trim())
      : [];
    if (distractors.length < 2) {
      distractors = synthesizeDistractors(correct, peerItems, ['word', 'answer', 'audio_text']);
    }
    item.distractors = distractors;
  }

  // AudioMatch / multiple_choice_grammar: ensure 4 options total. Data
  // sometimes emits a single-option array which leaves the user with no
  // choice to make. Pull alternatives from peer items.
  if ((gameType === 'audio_match' || gameType === 'multiple_choice_grammar')
      && Array.isArray(item.options) && item.options.length < 4) {
    const correct = item.correct || item.answer;
    const extras = synthesizeDistractors(correct, peerItems, ['correct', 'answer', 'audio_text', 'sentence']);
    item.options = Array.from(new Set([...(item.options || []), ...extras])).slice(0, 4);
  }

  return item;
}

function normalizeItemsForGame(items, gameType) {
  if (!Array.isArray(items)) return [];
  return items.map((it) => normalizeGameItem(it, gameType, items));
}

// Hard cap so a lesson never shows more than this many mini-games per game
// step. Aga's pedagogy call (2026-05-19): "6 oyun olmasina gerek yok en
// fazla 4 oyun ve 3 ideal." Existing data still ships 6-packs; this caps at
// render time until the packer is updated.
const MAX_GAMES_PER_STEP = 3;

export { stripMeta, synthesizeDistractors, normalizeGameItem, normalizeItemsForGame, MAX_GAMES_PER_STEP };
