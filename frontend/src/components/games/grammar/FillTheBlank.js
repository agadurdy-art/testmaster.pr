/**
 * Fill the Blank (Grammar) Game
 * Choose correct grammar form to complete sentences
 */

import React, { useState } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { PenTool } from 'lucide-react';
import { 
  GameWrapper, 
  OptionButton,
  GameComplete,
  shuffleArray 
} from '../shared';

const FillTheBlank = ({ 
  items, // Array of { sentence: "He ___ a cat.", answer: "has", options: ["has", "have", "is"] }
  onComplete,
  onSkip
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [isComplete, setIsComplete] = useState(false);

  const currentItem = items[currentIdx];

  // Shuffle options when item changes
  React.useEffect(() => {
    if (currentItem?.options) {
      setShuffledOptions(shuffleArray([...currentItem.options]));
    }
  }, [currentIdx, currentItem]);

  const handleSelect = (option) => {
    if (showFeedback) return;
    
    setSelectedAnswer(option);
    setShowFeedback(true);
    
    const isCorrect = option.toLowerCase() === currentItem.answer.toLowerCase();
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
        title="Grammar Star!"
      />
    );
  }

  if (!currentItem) return null;

  // Render sentence with blank
  const renderSentence = () => {
    const parts = currentItem.sentence.split('___');
    return (
      <p className="text-2xl text-gray-800 leading-relaxed text-center">
        {parts[0]}
        <span className={`inline-block min-w-20 mx-2 px-3 py-1 rounded-lg border-2 ${
          showFeedback
            ? selectedAnswer?.toLowerCase() === currentItem.answer.toLowerCase()
              ? 'bg-green-100 border-green-400 text-green-700 font-bold'
              : 'bg-red-100 border-red-400 text-red-700 font-bold'
            : 'bg-blue-50 border-blue-300 border-dashed'
        }`}>
          {showFeedback ? currentItem.answer : (selectedAnswer || '______')}
        </span>
        {parts[1]}
      </p>
    );
  };

  return (
    <GameWrapper
      title="Fill the Blank"
      subtitle="Choose the correct word"
      icon={PenTool}
      iconColor="purple"
      currentQuestion={currentIdx + 1}
      totalQuestions={items.length}
      onSkip={onSkip}
    >
      <Card className="p-8">
        {/* Sentence */}
        <div className="mb-8 px-4">
          {renderSentence()}
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
          {shuffledOptions.map((option) => (
            <OptionButton
              key={option}
              onClick={() => handleSelect(option)}
              isSelected={selectedAnswer === option}
              isCorrect={option.toLowerCase() === currentItem.answer.toLowerCase()}
              showFeedback={showFeedback}
            >
              {option}
            </OptionButton>
          ))}
        </div>

        {/* Hint if available */}
        {currentItem.hint && !showFeedback && (
          <p className="text-center text-sm text-gray-500 mt-4">
            Hint: {currentItem.hint}
          </p>
        )}

        {/* Next Button */}
        {showFeedback && (
          <div className="mt-6 text-center">
            <Button onClick={handleNext}>
              {currentIdx < items.length - 1 ? 'Next' : 'See Results'}
            </Button>
          </div>
        )}
      </Card>
    </GameWrapper>
  );
};

export default FillTheBlank;
