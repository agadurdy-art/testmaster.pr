/**
 * Advanced Vocabulary — cluster configuration.
 *
 * The original "Advanced Vocabulary" section in AdvancedMasteryCourse rendered
 * 11 parallel sub-sections in a single long scroll, each with its own colour
 * gradient. With 30–40 items per module the screen turned into a wall of
 * cards that competed for attention and tired the student before they had
 * actually learned anything.
 *
 * To keep deep-learning ergonomics without dropping any existing data, we
 * group those 11 sub-sections into 4 cognitive clusters. Each cluster gets a
 * single accent colour so the eye has somewhere to rest, and the cards are
 * normalised into a common front/back shape so a single component can render
 * any of them.
 *
 * "category" values map 1:1 to keys on `selectedModule.vocabulary` (or to the
 * pseudo-key `examiner_tips` which lives at module root). The normaliser
 * below converts each shape into the canonical card record consumed by
 * VocabCard / VocabFlashcards.
 */

export const CLUSTERS = [
  {
    id: 'core',
    label: 'Core Lexicon',
    blurb: 'Topic words and band-7+ terms — the vocabulary you are expected to recognise and use.',
    accent: 'amber',
    sections: [
      { category: 'nouns', title: 'Nouns', icon: '📚' },
      { category: 'verbs', title: 'Verbs', icon: '⚡' },
      { category: 'adjectives', title: 'Adjectives', icon: '🎨' },
      { category: 'adverbs', title: 'Adverbs', icon: '💫' },
      { category: 'advanced_terms', title: 'Advanced terms', icon: '✨' },
    ],
  },
  {
    id: 'word_power',
    label: 'Word Power',
    blurb: 'Build words from roots and paraphrase precisely — the engine room of lexical resource.',
    accent: 'indigo',
    sections: [
      { category: 'word_formation', title: 'Word formation', icon: '🔄' },
      { category: 'synonym_groups', title: 'Paraphrase groups', icon: '🔁' },
    ],
  },
  {
    id: 'natural',
    label: 'Natural English',
    blurb: 'Word partnerships and idiomatic phrasing — what makes writing sound native.',
    accent: 'emerald',
    sections: [
      { category: 'collocations', title: 'Collocations', icon: '🔗' },
      { category: 'phrasal_verbs', title: 'Phrasal verbs', icon: '🧩' },
      { category: 'idioms', title: 'Idioms', icon: '💬' },
    ],
  },
  {
    id: 'sound_style',
    label: 'Sound & Style',
    blurb: 'Pronounce confidently and write to the examiner — the spoken and stylistic layer.',
    accent: 'rose',
    sections: [
      { category: 'pronunciation_guide', title: 'Pronunciation', icon: '🎯' },
      { category: 'examiner_tips', title: 'Examiner tips', icon: '💡' },
    ],
  },
];

/**
 * Tailwind class fragments per accent. Inlined here so JIT picks them up.
 * Keeping each accent in one object makes it easy to retune the palette later
 * without hunting through component files.
 */
export const ACCENT_STYLES = {
  amber: {
    border: 'border-l-amber-500',
    chip: 'bg-amber-500 text-white',
    chipSoft: 'bg-amber-100 text-amber-800',
    text: 'text-amber-700',
    textStrong: 'text-amber-800',
    pill: 'bg-amber-500 text-white',
    ring: 'ring-amber-300',
    headerTint: 'from-amber-100/80 via-amber-50 to-white',
    bodyTint: 'bg-amber-50/60',
    hoverTint: 'bg-amber-50',
    divider: 'border-amber-100',
    exampleBg: 'bg-amber-50',
    exampleText: 'text-amber-900',
    sectionDot: 'bg-amber-500',
    tabActiveBg: 'bg-amber-500',
    tabActiveText: 'text-white',
  },
  indigo: {
    border: 'border-l-indigo-500',
    chip: 'bg-indigo-500 text-white',
    chipSoft: 'bg-indigo-100 text-indigo-800',
    text: 'text-indigo-700',
    textStrong: 'text-indigo-800',
    pill: 'bg-indigo-500 text-white',
    ring: 'ring-indigo-300',
    headerTint: 'from-indigo-100/80 via-indigo-50 to-white',
    bodyTint: 'bg-indigo-50/60',
    hoverTint: 'bg-indigo-50',
    divider: 'border-indigo-100',
    exampleBg: 'bg-indigo-50',
    exampleText: 'text-indigo-900',
    sectionDot: 'bg-indigo-500',
    tabActiveBg: 'bg-indigo-500',
    tabActiveText: 'text-white',
  },
  emerald: {
    border: 'border-l-emerald-500',
    chip: 'bg-emerald-500 text-white',
    chipSoft: 'bg-emerald-100 text-emerald-800',
    text: 'text-emerald-700',
    textStrong: 'text-emerald-800',
    pill: 'bg-emerald-500 text-white',
    ring: 'ring-emerald-300',
    headerTint: 'from-emerald-100/80 via-emerald-50 to-white',
    bodyTint: 'bg-emerald-50/60',
    hoverTint: 'bg-emerald-50',
    divider: 'border-emerald-100',
    exampleBg: 'bg-emerald-50',
    exampleText: 'text-emerald-900',
    sectionDot: 'bg-emerald-500',
    tabActiveBg: 'bg-emerald-500',
    tabActiveText: 'text-white',
  },
  rose: {
    border: 'border-l-rose-500',
    chip: 'bg-rose-500 text-white',
    chipSoft: 'bg-rose-100 text-rose-800',
    text: 'text-rose-700',
    textStrong: 'text-rose-800',
    pill: 'bg-rose-500 text-white',
    ring: 'ring-rose-300',
    headerTint: 'from-rose-100/80 via-rose-50 to-white',
    bodyTint: 'bg-rose-50/60',
    hoverTint: 'bg-rose-50',
    divider: 'border-rose-100',
    exampleBg: 'bg-rose-50',
    exampleText: 'text-rose-900',
    sectionDot: 'bg-rose-500',
    tabActiveBg: 'bg-rose-500',
    tabActiveText: 'text-white',
  },
};

/**
 * Pull the raw item array for a given category from the module shape.
 * `examiner_tips` lives on the module root, every other category lives
 * under `vocabulary.<category>`. Keeping the lookup in one place isolates
 * the component code from the storage shape.
 */
function rawItemsFor(module, category) {
  if (!module) return [];
  if (category === 'examiner_tips') {
    return Array.isArray(module.examiner_tips) ? module.examiner_tips : [];
  }
  const v = module.vocabulary || {};
  return Array.isArray(v[category]) ? v[category] : [];
}

/**
 * Generate a stable identifier for an item, used both for React keys and
 * for the localStorage mastery map. The headword (or the first 32 chars of
 * a tip) plus the category is unique enough — collisions across modules are
 * acceptable because mastery state is keyed by module too.
 */
function makeItemKey(category, raw) {
  const headword =
    raw.term ||
    raw.word ||
    raw.idiom ||
    raw.collocation ||
    raw.phrasal_verb ||
    raw.root ||
    raw.base ||
    (typeof raw === 'string' ? raw : '') ||
    '';
  const tail = headword.toString().slice(0, 48).toLowerCase().replace(/\s+/g, '_');
  return `${category}::${tail}`;
}

/**
 * Convert a raw record into the canonical VocabCard shape. The component
 * only knows about these fields, so any future data tweaks are isolated to
 * this function.
 */
function normaliseItem(category, raw) {
  // examiner_tips and synonym_groups arrive as strings or {base, synonyms}
  if (category === 'examiner_tips') {
    const text = typeof raw === 'string' ? raw : raw?.tip || '';
    return {
      key: makeItemKey(category, text),
      headword: text,
      subtitle: 'Examiner tip',
      meaning: '',
      example: '',
      extras: [],
      pronounceable: false,
    };
  }

  if (category === 'synonym_groups') {
    const synonyms = Array.isArray(raw?.synonyms) ? raw.synonyms : [];
    return {
      key: makeItemKey(category, raw),
      headword: raw?.base || '—',
      subtitle: `${synonyms.length} alternatives`,
      meaning: synonyms.length ? `Use instead: ${synonyms.join(', ')}` : '',
      example: '',
      extras: [],
      pronounceable: true,
    };
  }

  if (category === 'word_formation') {
    const forms = [
      raw?.noun && { label: 'noun', value: raw.noun },
      raw?.verb && { label: 'verb', value: raw.verb },
      raw?.adjective && { label: 'adj', value: raw.adjective },
      raw?.adverb && { label: 'adv', value: raw.adverb },
    ].filter(Boolean);
    return {
      key: makeItemKey(category, raw),
      headword: raw?.root || '—',
      subtitle: 'Root word',
      meaning: forms.map((f) => `${f.label}: ${f.value}`).join('  ·  '),
      example: '',
      extras: forms,
      pronounceable: true,
    };
  }

  if (category === 'pronunciation_guide') {
    return {
      key: makeItemKey(category, raw),
      headword: raw?.word || '—',
      subtitle: raw?.ipa || '',
      meaning: raw?.stress ? `Stress: ${raw.stress}` : '',
      example: raw?.audio_tip || '',
      extras: raw?.common_mistake
        ? [{ label: 'Common mistake', value: raw.common_mistake }]
        : [],
      pronounceable: true,
    };
  }

  if (category === 'idioms') {
    return {
      key: makeItemKey(category, raw),
      headword: raw?.idiom || '—',
      subtitle: raw?.usage_context || 'Idiomatic',
      meaning: raw?.meaning || '',
      example: raw?.example || '',
      extras: [],
      pronounceable: false,
    };
  }

  if (category === 'collocations') {
    const alts = Array.isArray(raw?.alternatives) ? raw.alternatives : [];
    return {
      key: makeItemKey(category, raw),
      headword: raw?.collocation || '—',
      subtitle: raw?.type || 'Collocation',
      meaning: '',
      example: raw?.example || '',
      extras: alts.length ? [{ label: 'Also', value: alts.join(', ') }] : [],
      pronounceable: false,
    };
  }

  if (category === 'phrasal_verbs') {
    return {
      key: makeItemKey(category, raw),
      headword: raw?.phrasal_verb || '—',
      subtitle: 'Phrasal verb',
      meaning: raw?.meaning || '',
      example: raw?.example || '',
      extras: raw?.formal_alternative
        ? [{ label: 'Formal', value: raw.formal_alternative }]
        : [],
      pronounceable: true,
    };
  }

  if (category === 'advanced_terms') {
    return {
      key: makeItemKey(category, raw),
      headword: raw?.term || '—',
      subtitle: raw?.usage || 'Advanced term',
      meaning: raw?.meaning || '',
      example: raw?.example || '',
      extras: [],
      pronounceable: true,
    };
  }

  // nouns / verbs / adjectives / adverbs share a shape: { word, meaning, example }
  return {
    key: makeItemKey(category, raw),
    headword: raw?.word || '—',
    subtitle: category.replace(/s$/, ''),
    meaning: raw?.meaning || '',
    example: raw?.example || '',
    extras: [],
    pronounceable: true,
  };
}

/**
 * Build the per-section render plan for a given module + cluster.
 * Returns sections with normalised items and skips empty ones so the UI
 * doesn't show empty headers.
 */
export function buildClusterSections(module, cluster) {
  return cluster.sections
    .map((section) => {
      const raw = rawItemsFor(module, section.category);
      const items = raw.map((r) => normaliseItem(section.category, r));
      return { ...section, items };
    })
    .filter((s) => s.items.length > 0);
}

/**
 * Total item count for a cluster — drives the sidebar tab count badges
 * and the "Study these N items" CTA in the flashcard mode.
 */
export function countClusterItems(module, cluster) {
  return buildClusterSections(module, cluster).reduce((acc, s) => acc + s.items.length, 0);
}
