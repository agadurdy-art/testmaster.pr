/**
 * Unscramble Letters Game
 * Player arranges scrambled letters to form the correct word
 */

import React, { useState, useEffect } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Shuffle, RotateCcw, CheckCircle, X } from 'lucide-react';
import { 
  GameWrapper, 
  GameComplete,
  shuffleArray 
} from '../shared';

const UnscrambleLetters = ({ 
  items, // Array of { word, emoji, hint? }
  onComplete,
  onSkip
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [scrambledLetters, setScrambledLetters] = useState([]);
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const currentItem = items[currentIdx];

  // Scramble letters when word changes
  useEffect(() => {
    if (currentItem) {
      const letters = currentItem.word.split('').map((letter, idx) => ({
        id: idx,
        letter: letter.toLowerCase(),
        used: false
      }));
      // Keep scrambling until it's different from the original
      let scrambled;
      do {
        scrambled = shuffleArray([...letters]);
      } while (
        scrambled.map(l => l.letter).join('') === currentItem.word.toLowerCase() && 
        letters.length > 2
      );
      setScrambledLetters(scrambled);
      setSelectedLetters([]);
    }
  }, [currentIdx, currentItem]);

  const handleLetterClick = (letterObj) => {
    if (letterObj.used || showFeedback) return;
    
    // Mark as used and add to selected
    setScrambledLetters(prev => 
      prev.map(l => l.id === letterObj.id ? { ...l, used: true } : l)
    );
    setSelectedLetters(prev => [...prev, letterObj]);
  };

  const handleSelectedClick = (letterObj, index) => {
    if (showFeedback) return;
    
    // Return letter to scrambled pool
    setScrambledLetters(prev => 
      prev.map(l => l.id === letterObj.id ? { ...l, used: false } : l)
    );
    setSelectedLetters(prev => prev.filter((_, i) => i !== index));
  };

  const handleCheck = () => {
    const answer = selectedLetters.map(l => l.letter).join('');
    const correct = answer === currentItem.word.toLowerCase();
    setIsCorrect(correct);
    setShowFeedback(true);
    
    if (correct) {
      setScore(s => s + 1);
    }
  };

  const handleClear = () => {
    setScrambledLetters(prev => prev.map(l => ({ ...l, used: false })));
    setSelectedLetters([]);
  };

  const handleNext = () => {
    setShowFeedback(false);
    setIsCorrect(false);
    
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
    setShowFeedback(false);
  };

  if (isComplete) {
    return (
      <GameComplete
        score={score}
        totalQuestions={items.length}
        onContinue={() => onComplete(Math.round((score / items.length) * 100))}
        onRetry={handleRetry}
        title="Unscramble Master!"
      />
    );
  }

  if (!currentItem) return null;

  const isWordComplete = selectedLetters.length === currentItem.word.length;

  return (
    <GameWrapper
      title="Unscramble"
      subtitle="Arrange the letters to make the word"
      icon={Shuffle}
      iconColor="orange"
      currentQuestion={currentIdx + 1}
      totalQuestions={items.length}
      onSkip={onSkip}
    >
      <Card className="p-8 text-center">
        {/* Emoji Hint */}
        <div className="mb-6">
          <div className="w-24 h-24 mx-auto bg-orange-50 rounded-2xl flex items-center justify-center text-5xl shadow-inner">
            {currentItem.emoji}
          </div>
        </div>

        {/* Selected Letters (Answer Area) */}
        <div className="mb-6 min-h-16">
          <div className="flex justify-center gap-2 flex-wrap">
            {selectedLetters.length > 0 ? (
              selectedLetters.map((letterObj, idx) => (
                <button
                  key={`selected-${idx}`}
                  onClick={() => handleSelectedClick(letterObj, idx)}
                  disabled={showFeedback}
                  className={`w-12 h-12 rounded-xl font-bold text-xl uppercase transition-all ${
                    showFeedback
                      ? isCorrect
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                      : 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer'
                  }`}
                >
                  {letterObj.letter}
                </button>
              ))
            ) : (
              // Empty placeholders
              Array.from({ length: currentItem.word.length }).map((_, idx) => (
                <div
                  key={`placeholder-${idx}`}
                  className="w-12 h-12 rounded-xl border-2 border-dashed border-gray-300"
                />
              ))
            )}
          </div>
        </div>

        {/* Scrambled Letters */}
        {!showFeedback && (
          <div className="mb-6">
            <div className="flex justify-center gap-2 flex-wrap">
              {scrambledLetters.map((letterObj) => (
                <button
                  key={letterObj.id}
                  onClick={() => handleLetterClick(letterObj)}
                  disabled={letterObj.used}
                  className={`w-12 h-12 rounded-xl font-bold text-xl uppercase transition-all ${
                    letterObj.used
                      ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                      : 'bg-white border-2 border-gray-300 hover:border-orange-400 hover:bg-orange-50'
                  }`}
                >
                  {letterObj.letter}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Feedback */}
        {showFeedback && (
          <div className={`mb-4 p-3 rounded-xl ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
            <div className="flex items-center justify-center gap-2">
              {isCorrect ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-700 font-semibold">Excellent!</span>
                </>
              ) : (
                <>
                  <X className="w-5 h-5 text-red-600" />
                  <span className="text-red-700">
                    The answer is: <strong className="uppercase tracking-wider">{currentItem.word}</strong>
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-center gap-3">
          {!showFeedback ? (
            <>
              <Button 
                variant="outline" 
                onClick={handleClear}
                disabled={selectedLetters.length === 0}
              >
                <RotateCcw className="w-4 h-4 mr-1" /> Clear
              </Button>
              <Button 
                onClick={handleCheck} 
                disabled={!isWordComplete}
                data-testid="check-button"
              >
                Check
              </Button>
            </>
          ) : (
            <Button onClick={handleNext} data-testid="next-button">
              {currentIdx < items.length - 1 ? 'Next' : 'See Results'}
            </Button>
          )}
        </div>
      </Card>
    </GameWrapper>
  );
};

export default UnscrambleLetters;
