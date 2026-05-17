/**
 * Grammar Games Index
 * Export all grammar game components
 */

export { default as WordOrder } from './WordOrder';
export { default as FillTheBlank } from './FillTheBlank';
export { default as ErrorHunter } from './ErrorHunter';
export { default as TrueFalseGrammar } from './TrueFalseGrammar';
export { default as MultipleChoiceGrammar } from './MultipleChoiceGrammar';
export { default as TransformSentence } from './TransformSentence';
export { default as AudioMatch } from './AudioMatch';
export { default as SentenceBuilderTimed } from './SentenceBuilderTimed';

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
  },
  {
    id: 'true_false',
    name: 'True or False?',
    component: 'TrueFalseGrammar',
    difficulty: 1,
    description: 'Decide if the sentence is grammatically correct',
    icon: 'CheckCircle'
  },
  {
    id: 'multiple_choice_grammar',
    name: 'Choose the Right Word',
    component: 'MultipleChoiceGrammar',
    difficulty: 1,
    description: 'Pick the correct grammar option to complete the sentence',
    icon: 'ListChecks'
  }
];

// Select grammar games for a lesson
export const selectGrammarGamesForLesson = (unitNum, lessonNum) => {
  const gameCount = 5;
  const selected = [];
  
  for (let i = 0; i < gameCount; i++) {
    const idx = (unitNum + lessonNum + i) % GRAMMAR_GAMES.length;
    if (!selected.find(g => g.id === GRAMMAR_GAMES[idx].id)) {
      selected.push(GRAMMAR_GAMES[idx]);
    }
  }
  
  return selected.sort((a, b) => a.difficulty - b.difficulty);
};
