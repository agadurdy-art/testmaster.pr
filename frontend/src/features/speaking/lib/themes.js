/**
 * Speaking themes — Full Test "ayni konular" bridge across Part 1/2/3.
 *
 * IELTS examiners traditionally pick Part 1 from a generic stock (home, work,
 * studies, hometown, hobbies) and Part 3 from Part 2's theme. For the Full
 * Test surface Aga wants stronger coupling: a single theme threads through
 * all three parts so the candidate stays in one cognitive lane.
 *
 * Theme strategy:
 *   1. Pick a theme (random or user-chosen) before Part 1 starts.
 *   2. Part 1: agent receives the theme as a `cue_card_topic` dynamic var
 *      plus a `cue_card_bullets` brief (familiar-question hints scoped to
 *      the theme). Agent's Part 1 prompt asks 4-5 short questions about
 *      it. No Part-1-specific question pool is needed — the agent prompt
 *      handles generation given the brief.
 *   3. Part 2: pick a cue card from the same theme bucket via
 *      pickRandomCueCard({ theme }). Standard 1-min prep + 2-min monologue.
 *   4. Part 3: agent receives the same theme + the cue-card prompt + the
 *      Part 2 transcript so it can ask abstract / opinion-style questions
 *      that connect to what the candidate just said.
 *
 * Theme buckets mirror the Cambridge cue-card topics already in
 * data/part2_cue_cards.json so we can guarantee at least a handful of cue
 * cards per theme.
 */

export const SPEAKING_THEMES = [
  {
    id: 'People',
    label: 'People',
    description: 'Family, friends, role models, teachers, colleagues.',
    part1Brief: [
      'where you live and who you live with',
      'a person you spend time with regularly',
      'how often you meet new people',
      'someone who has helped you recently',
    ],
  },
  {
    id: 'Places',
    label: 'Places',
    description: 'Hometown, neighbourhoods, places to relax or study.',
    part1Brief: [
      'where you live now and what it is like',
      'a place you go to relax',
      'a place in your city you would recommend',
      'whether you prefer cities or the countryside',
    ],
  },
  {
    id: 'Events',
    label: 'Events',
    description: 'Celebrations, milestones, memorable days.',
    part1Brief: [
      'a celebration you enjoy in your country',
      'a recent event that you attended',
      'how you usually celebrate your birthday',
      'whether you prefer big or small gatherings',
    ],
  },
  {
    id: 'Activities',
    label: 'Activities',
    description: 'Hobbies, sport, daily routines, leisure.',
    part1Brief: [
      'something you do to stay active',
      'a hobby you started recently',
      'how you usually spend weekends',
      'whether you prefer doing things alone or with others',
    ],
  },
  {
    id: 'Objects',
    label: 'Objects',
    description: 'Useful gadgets, gifts, things you own.',
    part1Brief: [
      'an object you use every day',
      'a gift you have received recently',
      'something you would like to buy',
      'whether you prefer new or second-hand things',
    ],
  },
  {
    id: 'Abstract',
    label: 'Ideas',
    description: 'Time, change, learning, decisions — broader concepts.',
    part1Brief: [
      'how you usually plan your week',
      'whether you find it easy to make decisions',
      'something new you have learned recently',
      'how you keep track of time during the day',
    ],
  },
];

const BY_ID = Object.fromEntries(SPEAKING_THEMES.map((t) => [t.id, t]));

/** Pick a random theme. Optional `exclude` avoids the listed ids. */
export function pickRandomTheme({ exclude } = {}) {
  const skip = new Set(exclude || []);
  const pool = SPEAKING_THEMES.filter((t) => !skip.has(t.id));
  const scope = pool.length ? pool : SPEAKING_THEMES;
  return scope[Math.floor(Math.random() * scope.length)];
}

export function getThemeById(id) {
  return BY_ID[id] || null;
}

/**
 * Brief lines the ElevenLabs agent should use to anchor Part 1 questions to
 * the theme. Joined into the `cue_card_bullets` dynamic var the agent prompt
 * already templates from.
 */
export function part1BulletsForTheme(theme) {
  const t = typeof theme === 'string' ? getThemeById(theme) : theme;
  if (!t) return [];
  return t.part1Brief.slice();
}

/**
 * Short label for the agent's `cue_card_topic` dynamic var. The agent system
 * prompt uses this to keep both Part 1 and Part 3 on-theme.
 */
export function topicLabelForTheme(theme) {
  const t = typeof theme === 'string' ? getThemeById(theme) : theme;
  return t ? t.label : '';
}
