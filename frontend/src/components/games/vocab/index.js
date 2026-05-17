/**
 * Vocabulary Games Index
 * Export all vocabulary game components
 */

export { default as ListenChooseWord } from './ListenChooseWord';
export { default as ListenChoosePicture } from './ListenChoosePicture';
export { default as ReadChoosePicture } from './ReadChoosePicture';
export { default as LookWrite } from './LookWrite';
export { default as ListenWrite } from './ListenWrite';
export { default as UnscrambleLetters } from './UnscrambleLetters';
export { default as FlashcardMatch } from './FlashcardMatch';
export { default as MemoryGame } from './MemoryGame';
export { default as FillTheGap } from './FillTheGap';
export { default as AnimalSounds } from './AnimalSounds';
export { default as WordRace } from './WordRace';
export { default as WordLadder } from './WordLadder';
export { default as CumulativeRace } from './CumulativeRace';
export { default as ImageWordMatch } from './ImageWordMatch';

// Game metadata for dynamic selection
export const VOCAB_GAMES = [
  {
    id: 'listen_choose_word',
    name: 'Listen & Choose Word',
    component: 'ListenChooseWord',
    difficulty: 1,
    description: 'Listen to the word and choose the correct spelling',
    icon: 'Headphones'
  },
  {
    id: 'listen_choose_picture',
    name: 'Listen & Choose Picture',
    component: 'ListenChoosePicture',
    difficulty: 1,
    description: 'Listen to the word and choose the matching picture',
    icon: 'Headphones'
  },
  {
    id: 'read_choose_picture',
    name: 'Read & Choose Picture',
    component: 'ReadChoosePicture',
    difficulty: 1,
    description: 'Read the word and find the matching picture',
    icon: 'BookOpen'
  },
  {
    id: 'look_write',
    name: 'Look & Write',
    component: 'LookWrite',
    difficulty: 2,
    description: 'Look at the picture and type the word',
    icon: 'Eye'
  },
  {
    id: 'listen_write',
    name: 'Listen & Write',
    component: 'ListenWrite',
    difficulty: 2,
    description: 'Listen carefully and type what you hear',
    icon: 'Headphones'
  },
  {
    id: 'unscramble',
    name: 'Unscramble Letters',
    component: 'UnscrambleLetters',
    difficulty: 2,
    description: 'Arrange the scrambled letters to make the word',
    icon: 'Shuffle'
  },
  {
    id: 'flashcard_match',
    name: 'Flashcard Match',
    component: 'FlashcardMatch',
    difficulty: 1,
    description: 'Match words with their pictures',
    icon: 'Layers'
  },
  {
    id: 'memory_game',
    name: 'Memory Game',
    component: 'MemoryGame',
    difficulty: 2,
    description: 'Find the matching pairs',
    icon: 'Brain'
  },
  {
    id: 'fill_the_gap',
    name: 'Fill the Gap',
    component: 'FillTheGap',
    difficulty: 2,
    description: 'Complete the sentence with the correct word',
    icon: 'Edit3'
  },
  {
    id: 'animal_sounds',
    name: 'Animal Sounds',
    component: 'AnimalSounds',
    difficulty: 1,
    description: 'Listen to the animal sound and find the animal',
    icon: 'Volume2',
    special: true // Only for units with animals
  }
];

// Select games for a lesson based on difficulty progression
export const selectGamesForLesson = (unitNum, lessonNum, hasAnimals = false) => {
  const availableGames = VOCAB_GAMES.filter(g => !g.special || (g.special && hasAnimals));
  
  // Sort by difficulty
  const easyGames = availableGames.filter(g => g.difficulty === 1);
  const mediumGames = availableGames.filter(g => g.difficulty === 2);
  
  // Select 3 games: 1 easy, 1-2 medium based on lesson
  const selected = [];
  
  // First game: always easy (rotation based on lesson)
  selected.push(easyGames[lessonNum % easyGames.length]);
  
  // Second game: medium
  selected.push(mediumGames[(unitNum + lessonNum) % mediumGames.length]);
  
  // Third game: mix
  const remaining = availableGames.filter(g => !selected.find(s => s.id === g.id));
  selected.push(remaining[(unitNum * lessonNum) % remaining.length]);
  
  return selected;
};
