/**
 * Review Games Index
 * Export all review/consolidation game components for Lesson 4
 */

export { default as Crossword } from './Crossword';
export { default as WordSearch } from './WordSearch';
export { default as BoardGame } from './BoardGame';

export const REVIEW_GAMES = [
  {
    id: 'crossword',
    name: 'Crossword',
    component: 'Crossword',
    description: 'Fill in the crossword puzzle with vocabulary clues',
    icon: 'Grid3X3'
  },
  {
    id: 'word_search',
    name: 'Word Search',
    component: 'WordSearch',
    description: 'Find hidden vocabulary words in the letter grid',
    icon: 'Search'
  },
  {
    id: 'board_game',
    name: 'Board Game',
    component: 'BoardGame',
    description: 'Roll dice, answer questions, reach the finish!',
    icon: 'Trophy'
  }
];
