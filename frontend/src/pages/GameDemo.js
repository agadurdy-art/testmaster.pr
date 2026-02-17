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

  // Get game info for selected game
  const selectedGameInfo = GAMES.find(g => g.id === selectedGame);
  const vocabGames = GAMES.filter(g => g.category === 'vocab');
  const grammarGames = GAMES.filter(g => g.category === 'grammar');

  // Vocab game icons and colors
  const vocabGameStyles = {
    'listen_choose_word': { icon: '🎧', color: 'from-cyan-400 to-cyan-600' },
    'listen_choose_picture': { icon: '🖼️', color: 'from-sky-400 to-sky-600' },
    'read_choose_picture': { icon: '📖', color: 'from-blue-400 to-blue-600' },
    'look_write': { icon: '👀', color: 'from-emerald-400 to-emerald-600' },
    'listen_write': { icon: '✍️', color: 'from-teal-400 to-teal-600' },
    'unscramble': { icon: '🔤', color: 'from-amber-400 to-amber-600' },
    'flashcard_match': { icon: '🃏', color: 'from-orange-400 to-orange-600' },
    'memory_game': { icon: '🧠', color: 'from-pink-400 to-pink-600' },
    'fill_gap': { icon: '📝', color: 'from-indigo-400 to-indigo-600' },
    'animal_sounds': { icon: '🐾', color: 'from-lime-400 to-lime-600' },
  };

  const grammarGameStyles = {
    'word_order': { icon: '🔀', color: 'from-violet-400 to-violet-600' },
    'fill_blank': { icon: '📋', color: 'from-purple-400 to-purple-600' },
    'error_hunter': { icon: '🔍', color: 'from-rose-400 to-rose-600' },
  };

  if (selectedGame) {
    return (
      <div className="min-h-screen bg-mesh p-4 sm:p-6">
        <div className="max-w-2xl mx-auto">
          <button 
            onClick={() => setSelectedGame(null)}
            className="glass-button px-4 py-2 flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-6 font-semibold"
            data-testid="back-to-games-btn"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Games
          </button>
          {renderGame()}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh p-4 sm:p-6" data-testid="game-demo-page">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="glass-button px-4 py-2 flex items-center gap-2 text-slate-600 hover:text-slate-800 font-semibold"
            data-testid="back-btn"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>

        {/* Hero Section */}
        <div className="glass-card p-8 mb-8 text-center relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br from-emerald-200/30 to-teal-200/30 blur-xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-gradient-to-br from-amber-200/30 to-orange-200/30 blur-xl" />
          
          <div className="relative z-10">
            <div className="w-24 h-24 mx-auto mb-5 rounded-3xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-emerald animate-float">
              <Gamepad2 className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3">Game Demo</h1>
            <p className="text-slate-500 text-lg max-w-md mx-auto">
              Test all vocabulary and grammar games with our iOS 26 inspired design
            </p>
          </div>
        </div>

        {/* Last Score */}
        {lastScore !== null && (
          <div className="glass-card p-5 mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <span className="text-2xl">⭐</span>
              </div>
              <div>
                <p className="text-sm text-slate-500">Last Score</p>
                <p className="text-2xl font-bold text-emerald-600">{lastScore}%</p>
              </div>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3].map(i => (
                <span key={i} className={`text-2xl ${lastScore >= i * 30 ? 'opacity-100' : 'opacity-30'}`}>⭐</span>
              ))}
            </div>
          </div>
        )}

        {/* Vocabulary Games */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
              <span className="text-xl">📚</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Vocabulary Games</h2>
              <p className="text-sm text-slate-500">{vocabGames.length} games available</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {vocabGames.map(game => {
              const style = vocabGameStyles[game.id] || { icon: '🎮', color: 'from-gray-400 to-gray-600' };
              return (
                <button 
                  key={game.id}
                  className="glass-card p-4 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 hover:-translate-y-1 text-center group"
                  onClick={() => setSelectedGame(game.id)}
                  data-testid={`game-${game.id}`}
                >
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-2xl bg-gradient-to-br ${style.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <span className="text-2xl">{style.icon}</span>
                  </div>
                  <h3 className="font-semibold text-slate-700 text-sm leading-tight">{game.name}</h3>
                </button>
              );
            })}
          </div>
        </div>

        {/* Grammar Games */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center">
              <span className="text-xl">📝</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Grammar Games</h2>
              <p className="text-sm text-slate-500">{grammarGames.length} games available</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {grammarGames.map(game => {
              const style = grammarGameStyles[game.id] || { icon: '🎮', color: 'from-gray-400 to-gray-600' };
              return (
                <button 
                  key={game.id}
                  className="glass-card p-4 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 hover:-translate-y-1 text-center group"
                  onClick={() => setSelectedGame(game.id)}
                  data-testid={`game-${game.id}`}
                >
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-2xl bg-gradient-to-br ${style.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <span className="text-2xl">{style.icon}</span>
                  </div>
                  <h3 className="font-semibold text-slate-700 text-sm leading-tight">{game.name}</h3>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Tip */}
        <div className="glass-card p-5 text-center">
          <p className="text-slate-500 text-sm">
            💡 <span className="font-medium">Tip:</span> Complete games to earn stars! Get 90%+ for 3 stars.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GameDemo;
