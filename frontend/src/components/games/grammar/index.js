/**
 * Grammar Games Index
 * Export all grammar game components
 */

export { default as WordOrder } from './WordOrder';
export { default as FillTheBlank } from './FillTheBlank';
export { default as ErrorHunter } from './ErrorHunter';

// Grammar game metadata
export const GRAMMAR_GAMES = [
  {
    id: 'word_order',
    name: 'Word Order',
    component: 'WordOrder',
    difficulty: 2,
    description: 'Arrange words to form correct sentences',
    icon: 'ArrowRightLeft'
  },
  {
    id: 'fill_blank',
    name: 'Fill the Blank',
    component: 'FillTheBlank',
    difficulty: 1,
    description: 'Choose the correct grammar form',
    icon: 'PenTool'
  },
  {
    id: 'error_hunter',
    name: 'Error Hunter',
    component: 'ErrorHunter',
    difficulty: 2,
    description: 'Find and fix grammar mistakes',
    icon: 'Search'
  }
];

// Select grammar games for a lesson
export const selectGrammarGamesForLesson = (unitNum, lessonNum) => {
  // Return 2-3 games per lesson based on rotation
  const gameCount = lessonNum % 2 === 0 ? 3 : 2;
  const selected = [];
  
  for (let i = 0; i < gameCount; i++) {
    const idx = (unitNum + lessonNum + i) % GRAMMAR_GAMES.length;
    if (!selected.find(g => g.id === GRAMMAR_GAMES[idx].id)) {
      selected.push(GRAMMAR_GAMES[idx]);
    }
  }
  
  // Sort by difficulty
  return selected.sort((a, b) => a.difficulty - b.difficulty);
};
