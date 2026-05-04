// D7 Speaking Practice — static fixture/constants.

export const PARTS = [
  {
    id: 'part1',
    label: 'Part 1',
    title: 'Familiar questions',
    description: 'Short warm‑up exchanges about home, work, studies. 4–5 questions, no preparation.',
    duration: '4–5 min',
    avgTime: '4 min',
    tone: 'secondary',
  },
  {
    id: 'part2',
    label: 'Part 2',
    title: 'Cue card',
    description: "1 minute to prepare, then a 2‑minute monologue from a written prompt. The long turn.",
    duration: '3–4 min',
    avgTime: '3 min 30 s',
    tone: 'primary',
    recommended: true,
  },
  {
    id: 'part3',
    label: 'Part 3',
    title: 'Abstract discussion',
    description: "Opinions, speculation, comparison. Connected to Part 2's theme but goes wider.",
    duration: '4–5 min',
    avgTime: '4 min 30 s',
    tone: 'accent',
  },
  {
    id: 'fulltest',
    label: 'Full Test',
    title: 'All three parts',
    description: 'Part 1 → Part 2 → Part 3 on a connected theme. Exam-style flow with one holistic Liz feedback at the end.',
    duration: '12–14 min',
    avgTime: '13 min',
    tone: 'primary',
    premium: true,
  },
];

export const TOPICS = [
  'Home & family',
  'Work & study',
  'Travel',
  'Technology',
  'Food & culture',
  'Media & arts',
  'Health & sport',
  'Environment',
  'Hobbies',
  'Society',
];

export const DEFAULT_TOPICS_ON = new Set(['Home & family', 'Travel']);

export const CUE_CARD = {
  id: 'cc-006',
  stamp: 'Cambridge · Part 2 · 006',
  topic: 'People',
  prompt: 'Describe a person who has influenced you.',
  bullets: [
    'who this person is',
    'how you know them',
    'what they are like',
  ],
  andExplain: 'why they have influenced you.',
};

// Transcript with pronunciation quality tiers (good/ok/bad).
// "bad" = needs work (dashed red), "ok" = minor issue (orange), undefined = clear (no underline).
export const TRANSCRIPT_TOKENS = [
  { t: 'The person who has ' },
  { t: 'influenced', pron: 'bad', ipa: '/ˈɪnfluənst/', note: 'You said /ˈɪnfluənst/ — the /θ/ sound came out as /t/.' },
  { t: ' me the most is my aunt Mai. She lives in Ha Noi and I have known her since I was a child. My aunt is a ' },
  { t: 'primary', pron: 'ok' },
  { t: ' school teacher and she used to take care of me every summer when my parents were working. She is ' },
  { t: 'thoughtful', pron: 'bad', ipa: '/ˈθɔːtfəl/', note: 'You said /ˈtɔːtfəl/ — the /θ/ sound came out as /t/.' },
  { t: ', patient, and a little bit stubborn — qualities I try to copy.\n\nWhat I admire most is how she listens. When I was fifteen, I failed a maths exam and I was too ' },
  { t: 'embarrassed', pron: 'ok' },
  { t: ' to tell my parents. I called her first. She didn\'t judge me, she just asked, "What do you want to do ' },
  { t: 'through', pron: 'bad', ipa: '/θruː/' },
  { t: ' this?" That ' },
  { t: 'thought', pron: 'bad', ipa: '/θɔːt/' },
  { t: ' stayed with me. From that moment, I learned to face difficulty instead of hiding from it.\n\nShe has also influenced the way I teach my younger brother. I don\'t give him the answer — I ask him questions, the same way she did with me. Because of her, I ' },
  { t: 'believe', pron: 'ok' },
  { t: ' that real teaching is a kind of patience, not a kind of knowledge.' },
];

export const LIVE_TRANSCRIPT_WORDS = [
  'The person who has',
  'influenced',
  'me the most is my',
  'aunt',
  'Mai.',
  'She',
  'lives',
  'in',
  'Ha Noi',
  'and',
  "I've",
  'known',
  'her',
  'since',
  'I',
  'was',
  'a',
  'child',
];

export const SCORES = {
  overall: 6.5,
  target: 7.0,
  fc: 6.5,
  lr: 6.5,
  gra: 6.5,
  pr: 6.0,
};

export const FLUENCY = {
  wpm: 107,
  pauses: '11 · 2 filled',
  fillers: '4 · "um", "like"',
  unique: '118 / 214',
  duration: '2 min 00 s',
  words: 214,
};
