/**
 * Game Demo Page - Test vocabulary and grammar games
 */

import React, { useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  ListenChooseWord,
  ListenChoosePicture,
  ReadChoosePicture,
  LookWrite,
  ListenWrite,
  UnscrambleLetters,
  FlashcardMatch,
  MemoryGame,
  FillTheGap,
  AnimalSounds
} from '../components/games/vocab';
import {
  WordOrder,
  FillTheBlank,
  ErrorHunter
} from '../components/games/grammar';
import { ArrowLeft, Gamepad2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Sample vocabulary data for testing
const SAMPLE_VOCAB = [
  { word: 'cat', emoji: '🐱', distractors: [{ word: 'dog', emoji: '🐕' }, { word: 'bird', emoji: '🐦' }, { word: 'fish', emoji: '🐟' }] },
  { word: 'dog', emoji: '🐕', distractors: [{ word: 'cat', emoji: '🐱' }, { word: 'pig', emoji: '🐷' }, { word: 'cow', emoji: '🐄' }] },
  { word: 'bird', emoji: '🐦', distractors: [{ word: 'cat', emoji: '🐱' }, { word: 'dog', emoji: '🐕' }, { word: 'duck', emoji: '🦆' }] },
  { word: 'fish', emoji: '🐟', distractors: [{ word: 'frog', emoji: '🐸' }, { word: 'duck', emoji: '🦆' }, { word: 'bird', emoji: '🐦' }] },
];

const SAMPLE_SENTENCES = [
  { word: 'cat', emoji: '🐱', sentence: 'I have a ___.' },
  { word: 'dog', emoji: '🐕', sentence: 'My ___ is brown.' },
  { word: 'bird', emoji: '🐦', sentence: 'The ___ can fly.' },
];

const SAMPLE_GRAMMAR = {
  wordOrder: [
    { words: ['I', 'have', 'a', 'cat'], correctSentence: 'I have a cat' },
    { words: ['She', 'likes', 'dogs'], correctSentence: 'She likes dogs' },
    { words: ['The', 'bird', 'is', 'blue'], correctSentence: 'The bird is blue' },
  ],
  fillBlank: [
    { sentence: 'He ___ a cat.', answer: 'has', options: ['has', 'have', 'is', 'are'] },
    { sentence: 'She ___ dogs.', answer: 'likes', options: ['like', 'likes', 'liking', 'liked'] },
    { sentence: 'I ___ happy.', answer: 'am', options: ['am', 'is', 'are', 'be'] },
  ],
  errorHunter: [
    { sentence: 'He have a cat.', errorWord: 'have', correctWord: 'has' },
    { sentence: 'She like dogs.', errorWord: 'like', correctWord: 'likes' },
    { sentence: 'They is happy.', errorWord: 'is', correctWord: 'are' },
  ]
};

const GAMES = [
  { id: 'listen_choose_word', name: 'Listen & Choose Word', category: 'vocab' },
  { id: 'listen_choose_picture', name: 'Listen & Choose Picture', category: 'vocab' },
  { id: 'read_choose_picture', name: 'Read & Choose Picture', category: 'vocab' },
  { id: 'look_write', name: 'Look & Write', category: 'vocab' },
  { id: 'listen_write', name: 'Listen & Write', category: 'vocab' },
  { id: 'unscramble', name: 'Unscramble Letters', category: 'vocab' },
  { id: 'flashcard_match', name: 'Flashcard Match', category: 'vocab' },
  { id: 'memory_game', name: 'Memory Game', category: 'vocab' },
  { id: 'fill_gap', name: 'Fill the Gap', category: 'vocab' },
  { id: 'animal_sounds', name: 'Animal Sounds', category: 'vocab' },
  { id: 'word_order', name: 'Word Order', category: 'grammar' },
  { id: 'fill_blank', name: 'Fill the Blank', category: 'grammar' },
  { id: 'error_hunter', name: 'Error Hunter', category: 'grammar' },
];

const GameDemo = () => {
  const navigate = useNavigate();
  const [selectedGame, setSelectedGame] = useState(null);
  const [lastScore, setLastScore] = useState(null);

  const handleComplete = (score) => {
    setLastScore(score);
    setSelectedGame(null);
  };

  const handleSkip = () => {
    setSelectedGame(null);
  };

  const renderGame = () => {
    switch (selectedGame) {
      case 'listen_choose_word':
        return <ListenChooseWord items={SAMPLE_VOCAB} onComplete={handleComplete} onSkip={handleSkip} />;
      case 'listen_choose_picture':
        return <ListenChoosePicture items={SAMPLE_VOCAB} onComplete={handleComplete} onSkip={handleSkip} />;
      case 'read_choose_picture':
        return <ReadChoosePicture items={SAMPLE_VOCAB} onComplete={handleComplete} onSkip={handleSkip} />;
      case 'look_write':
        return <LookWrite items={SAMPLE_VOCAB} onComplete={handleComplete} onSkip={handleSkip} />;
      case 'listen_write':
        return <ListenWrite items={SAMPLE_VOCAB} onComplete={handleComplete} onSkip={handleSkip} />;
      case 'unscramble':
        return <UnscrambleLetters items={SAMPLE_VOCAB} onComplete={handleComplete} onSkip={handleSkip} />;
      case 'flashcard_match':
        return <FlashcardMatch items={SAMPLE_VOCAB.slice(0, 4)} matchType="text-picture" onComplete={handleComplete} onSkip={handleSkip} />;
      case 'memory_game':
        return <MemoryGame items={SAMPLE_VOCAB} onComplete={handleComplete} onSkip={handleSkip} />;
      case 'fill_gap':
        return <FillTheGap items={SAMPLE_SENTENCES} onComplete={handleComplete} onSkip={handleSkip} />;
      case 'animal_sounds':
        return <AnimalSounds items={SAMPLE_VOCAB} onComplete={handleComplete} onSkip={handleSkip} />;
      case 'word_order':
        return <WordOrder items={SAMPLE_GRAMMAR.wordOrder} onComplete={handleComplete} onSkip={handleSkip} />;
      case 'fill_blank':
        return <FillTheBlank items={SAMPLE_GRAMMAR.fillBlank} onComplete={handleComplete} onSkip={handleSkip} />;
      case 'error_hunter':
        return <ErrorHunter items={SAMPLE_GRAMMAR.errorHunter} onComplete={handleComplete} onSkip={handleSkip} />;
      default:
        return null;
    }
  };

  if (selectedGame) {
    return (
      <div className="min-h-screen bg-mesh p-6">
        <div className="max-w-2xl mx-auto">
          <button 
            onClick={() => setSelectedGame(null)}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Games
          </button>
          {renderGame()}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh p-6">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-emerald">
            <Gamepad2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Game Demo</h1>
          <p className="text-slate-500 text-lg">Test all vocabulary and grammar games</p>
        </div>

        {lastScore !== null && (
          <div className="glass-card p-4 mb-8 text-center">
            <p className="text-emerald-700 font-bold text-lg">
              Last Score: {lastScore}%
            </p>
          </div>
        )}

        {/* Vocabulary Games */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-slate-700 mb-5">Vocabulary Games</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {GAMES.filter(g => g.category === 'vocab').map(game => (
              <div 
                key={game.id}
                className="glass-card p-5 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 hover:-translate-y-1"
                onClick={() => setSelectedGame(game.id)}
              >
                <h3 className="font-bold text-slate-700">{game.name}</h3>
              </div>
            ))}
          </div>
        </div>

        {/* Grammar Games */}
        <div>
          <h2 className="text-2xl font-bold text-slate-700 mb-5">Grammar Games</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {GAMES.filter(g => g.category === 'grammar').map(game => (
              <div 
                key={game.id}
                className="glass-card p-5 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 hover:-translate-y-1 hover:border-violet-200"
                onClick={() => setSelectedGame(game.id)}
              >
                <h3 className="font-bold text-slate-700">{game.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDemo;
