/**
 * Word Order Game
 * Arrange words to form correct sentences
 */

import React, { useState, useEffect } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { ArrowRightLeft, RotateCcw, CheckCircle, X } from 'lucide-react';
import { 
  GameWrapper, 
  GameComplete,
  shuffleArray 
} from '../shared';

const WordOrder = ({ 
  items, // Array of { words: [...], correctSentence: "..." }
  onComplete,
  onSkip
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [availableWords, setAvailableWords] = useState([]);
  const [selectedWords, setSelectedWords] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const currentItem = items[currentIdx];

  // Shuffle words when item changes
  useEffect(() => {
    if (currentItem) {
      const words = currentItem.words.map((word, idx) => ({
        id: idx,
        word,
        used: false
      }));
      setAvailableWords(shuffleArray(words));
      setSelectedWords([]);
    }
  }, [currentIdx, currentItem]);

  const handleWordClick = (wordObj) => {
    if (wordObj.used || showFeedback) return;
    
    setAvailableWords(prev => 
      prev.map(w => w.id === wordObj.id ? { ...w, used: true } : w)
    );
    setSelectedWords(prev => [...prev, wordObj]);
  };

  const handleSelectedClick = (wordObj, index) => {
    if (showFeedback) return;
    
    setAvailableWords(prev => 
      prev.map(w => w.id === wordObj.id ? { ...w, used: false } : w)
    );
    setSelectedWords(prev => prev.filter((_, i) => i !== index));
  };

  const handleCheck = () => {
    const normalize = (s) => s.replace(/[.!?,;:]+$/g, '').trim().toLowerCase();
    const answer = normalize(selectedWords.map(w => w.word).join(' '));
    const correct = answer === normalize(currentItem.correctSentence || '');
    setIsCorrect(correct);
    setShowFeedback(true);
    
    if (correct) {
      setScore(s => s + 1);
    }
  };

  const handleClear = () => {
    setAvailableWords(prev => prev.map(w => ({ ...w, used: false })));
    setSelectedWords([]);
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
        title="Sentence Builder!"
      />
    );
  }

  if (!currentItem) return null;

  const isAllWordsUsed = selectedWords.length === currentItem.words.length;

  return (
    <GameWrapper
      title="Word Order"
      subtitle="Arrange the words to make a sentence"
      icon={ArrowRightLeft}
      iconColor="blue"
      currentQuestion={currentIdx + 1}
      totalQuestions={items.length}
      onSkip={onSkip}
    >
      <Card className="p-8">
        {/* Selected Words Area */}
        <div className="min-h-20 mb-6 p-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <div className="flex flex-wrap gap-2 justify-center">
            {selectedWords.length > 0 ? (
              selectedWords.map((wordObj, idx) => (
                <button
                  key={`selected-${idx}`}
                  onClick={() => handleSelectedClick(wordObj, idx)}
                  disabled={showFeedback}
                  className={`px-5 py-3 rounded-lg font-medium text-lg transition-all ${
                    showFeedback
                      ? isCorrect
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                      : 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer'
                  }`}
                >
                  {wordObj.word}
                </button>
              ))
            ) : (
              <p className="text-gray-400 text-base">Tap words below to build your sentence</p>
            )}
          </div>
        </div>

        {/* Available Words */}
        {!showFeedback && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 justify-center">
              {availableWords.map((wordObj) => (
                <button
                  key={wordObj.id}
                  onClick={() => handleWordClick(wordObj)}
                  disabled={wordObj.used}
                  className={`px-5 py-3 rounded-lg font-medium text-lg transition-all ${
                    wordObj.used
                      ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                      : 'bg-white border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  {wordObj.word}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Feedback */}
        {showFeedback && (
          <div className={`mb-4 p-4 rounded-xl ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              {isCorrect ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-700 font-semibold">Perfect!</span>
                </>
              ) : (
                <>
                  <X className="w-5 h-5 text-red-600" />
                  <span className="text-red-700 font-semibold">Not quite!</span>
                </>
              )}
            </div>
            {!isCorrect && (
              <p className="text-center text-gray-700">
                Correct: <strong>{currentItem.correctSentence}</strong>
              </p>
            )}
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-center gap-3">
          {!showFeedback ? (
            <>
              <Button 
                variant="outline" 
                onClick={handleClear}
                disabled={selectedWords.length === 0}
              >
                <RotateCcw className="w-4 h-4 mr-1" /> Clear
              </Button>
              <Button 
                onClick={handleCheck} 
                disabled={!isAllWordsUsed}
              >
                Check
              </Button>
            </>
          ) : (
            <Button onClick={handleNext}>
              {currentIdx < items.length - 1 ? 'Next' : 'See Results'}
            </Button>
          )}
        </div>
      </Card>
    </GameWrapper>
  );
};

export default WordOrder;
