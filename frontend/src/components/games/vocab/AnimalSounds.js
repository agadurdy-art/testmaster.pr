/**
 * Animal Sounds Game
 * Listen to animal sound and identify the animal (Unit 9 special)
 */

import React, { useState, useEffect } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Volume2 } from 'lucide-react';
import { 
  GameWrapper, 
  EmojiCard,
  GameComplete,
  shuffleArray 
} from '../shared';

// Animal sounds using Web Audio API or placeholder sounds
const ANIMAL_SOUNDS = {
  dog: { text: 'Woof! Woof!', emoji: '🐕' },
  cat: { text: 'Meow! Meow!', emoji: '🐱' },
  bird: { text: 'Tweet! Tweet!', emoji: '🐦' },
  cow: { text: 'Moo! Moo!', emoji: '🐄' },
  pig: { text: 'Oink! Oink!', emoji: '🐷' },
  duck: { text: 'Quack! Quack!', emoji: '🦆' },
  sheep: { text: 'Baa! Baa!', emoji: '🐑' },
  lion: { text: 'Roar!', emoji: '🦁' },
  frog: { text: 'Ribbit! Ribbit!', emoji: '🐸' },
  chicken: { text: 'Cluck! Cluck!', emoji: '🐔' },
  horse: { text: 'Neigh!', emoji: '🐴' },
  mouse: { text: 'Squeak! Squeak!', emoji: '🐭' }
};

const playAnimalSound = (animal) => {
  const sound = ANIMAL_SOUNDS[animal.toLowerCase()];
  if (sound && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(sound.text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = animal === 'mouse' ? 1.5 : animal === 'lion' ? 0.7 : 1;
    window.speechSynthesis.speak(utterance);
  }
};

const AnimalSounds = ({ 
  items, // Array of { word (animal name), emoji }
  onComplete,
  onSkip
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [options, setOptions] = useState([]);
  const [isComplete, setIsComplete] = useState(false);

  const currentItem = items[currentIdx];

  // Generate options
  useEffect(() => {
    if (currentItem) {
      const correctOption = { 
        word: currentItem.word, 
        emoji: currentItem.emoji || ANIMAL_SOUNDS[currentItem.word.toLowerCase()]?.emoji || '🐾'
      };
      
      // Get distractors from other animals
      const otherAnimals = items
        .filter(i => i.word.toLowerCase() !== currentItem.word.toLowerCase())
        .map(i => ({
          word: i.word,
          emoji: i.emoji || ANIMAL_SOUNDS[i.word.toLowerCase()]?.emoji || '🐾'
        }));
      
      const allOptions = [correctOption, ...shuffleArray(otherAnimals).slice(0, 3)];
      setOptions(shuffleArray(allOptions));
      
      // Auto-play sound
      setTimeout(() => playAnimalSound(currentItem.word), 500);
    }
  }, [currentIdx, currentItem, items]);

  const handlePlaySound = () => {
    if (currentItem) {
      playAnimalSound(currentItem.word);
    }
  };

  const handleSelect = (option) => {
    if (showFeedback) return;
    
    setSelectedAnswer(option.word);
    setShowFeedback(true);
    
    const isCorrect = option.word.toLowerCase() === currentItem.word.toLowerCase();
    if (isCorrect) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setShowFeedback(false);
    
    if (currentIdx < items.length - 1) {
      setCurrentIdx(i => i + 1);
    } else {
      setIsComplete(true);
    }
  };

  const handleRetry = () => {
    setCurrentIdx(0);
    setScore(0);
    setIsComplete(false);
    setSelectedAnswer(null);
    setShowFeedback(false);
  };

  if (isComplete) {
    return (
      <GameComplete
        score={score}
        totalQuestions={items.length}
        onContinue={() => onComplete(Math.round((score / items.length) * 100))}
        onRetry={handleRetry}
        title="Animal Expert!"
      />
    );
  }

  if (!currentItem) return null;

  const soundInfo = ANIMAL_SOUNDS[currentItem.word.toLowerCase()];

  return (
    <GameWrapper
      title="Animal Sounds"
      subtitle="Listen to the sound and find the animal"
      icon={Volume2}
      iconColor="orange"
      currentQuestion={currentIdx + 1}
      totalQuestions={items.length}
      onSkip={onSkip}
    >
      <Card className="p-8 text-center">
        {/* Sound Button */}
        <div className="mb-8">
          <button
            onClick={handlePlaySound}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-white flex items-center justify-center mx-auto hover:scale-105 active:scale-95 transition-all shadow-xl"
            data-testid="play-sound-button"
          >
            <Volume2 className="w-12 h-12" />
          </button>
          <p className="text-sm text-gray-500 mt-3">
            Tap to hear the sound again
          </p>
          {soundInfo && (
            <p className="text-lg font-bold text-orange-600 mt-2 animate-pulse">
              "{soundInfo.text}"
            </p>
          )}
        </div>

        {/* Animal Options Grid */}
        <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
          {options.map((option) => (
            <EmojiCard
              key={option.word}
              emoji={option.emoji}
              label={showFeedback ? option.word : undefined}
              onClick={() => handleSelect(option)}
              isSelected={selectedAnswer === option.word}
              isCorrect={option.word.toLowerCase() === currentItem.word.toLowerCase()}
              showFeedback={showFeedback}
              size="lg"
            />
          ))}
        </div>

        {/* Feedback */}
        {showFeedback && (
          <div className={`mt-6 p-3 rounded-xl ${
            selectedAnswer?.toLowerCase() === currentItem.word.toLowerCase()
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {selectedAnswer?.toLowerCase() === currentItem.word.toLowerCase() ? (
              <p className="font-semibold">Yes! A {currentItem.word} says "{soundInfo?.text}"</p>
            ) : (
              <p>That's a {currentItem.word}! It says "{soundInfo?.text}"</p>
            )}
          </div>
        )}

        {/* Next Button */}
        {showFeedback && (
          <div className="mt-6">
            <Button onClick={handleNext} data-testid="next-button">
              {currentIdx < items.length - 1 ? 'Next' : 'See Results'}
            </Button>
          </div>
        )}
      </Card>
    </GameWrapper>
  );
};

export default AnimalSounds;
