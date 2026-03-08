/**
 * Multiple Choice Grammar Game
 * Choose the correct option to complete a grammar-focused question
 */

import React, { useState } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { ListChecks } from 'lucide-react';
import { GameWrapper, GameComplete, shuffleArray } from '../shared';

const MultipleChoiceGrammar = ({ 
  items, // Array of { question: "She ___ to school.", options: ["go", "goes", "going", "goed"], answer: "goes", explanation: "..." }
  onComplete,
  onSkip
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [isComplete, setIsComplete] = useState(false);

  if (!items?.length) return null;
  const currentItem = items[currentIdx];

  React.useEffect(() => {
    if (currentItem?.options) {
      setShuffledOptions(shuffleArray([...currentItem.options]));
    }
  }, [currentIdx, currentItem]);

  const handleSelect = (option) => {
    if (showFeedback) return;
    setSelectedAnswer(option);
    setShowFeedback(true);
    if (option.toLowerCase() === currentItem.answer.toLowerCase()) {
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

  if (isComplete) {
    return (
      <GameComplete
        score={score}
        totalQuestions={items.length}
        onContinue={() => onComplete(Math.round((score / items.length) * 100))}
        onRetry={() => { setCurrentIdx(0); setScore(0); setIsComplete(false); setSelectedAnswer(null); setShowFeedback(false); }}
        title="Grammar Champion!"
      />
    );
  }

  if (!currentItem) return null;

  const renderQuestion = () => {
    const parts = currentItem.question.split('___');
    if (parts.length < 2) {
      return <p className="text-2xl text-center font-medium text-gray-800">{currentItem.question}</p>;
    }
    return (
      <p className="text-2xl text-center font-medium text-gray-800 leading-relaxed">
        {parts[0]}
        <span className={`inline-block min-w-20 mx-2 px-4 py-1 rounded-lg border-2 font-bold ${
          showFeedback
            ? selectedAnswer?.toLowerCase() === currentItem.answer.toLowerCase()
              ? 'bg-green-100 border-green-400 text-green-700'
              : 'bg-red-100 border-red-400 text-red-700'
            : selectedAnswer
              ? 'bg-blue-100 border-blue-400 text-blue-700'
              : 'bg-yellow-50 border-yellow-300 border-dashed text-yellow-600'
        }`}>
          {showFeedback ? currentItem.answer : (selectedAnswer || '?')}
        </span>
        {parts[1]}
      </p>
    );
  };

  return (
    <GameWrapper
      title="Choose the Right Word"
      subtitle="Pick the correct grammar option"
      icon={ListChecks}
      iconColor="indigo"
      currentQuestion={currentIdx + 1}
      totalQuestions={items.length}
      onSkip={onSkip}
    >
      <Card className="p-8">
        <div className="bg-indigo-50 rounded-2xl p-8 mb-8 border border-indigo-100">
          {renderQuestion()}
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto mb-6">
          {shuffledOptions.map((option) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option.toLowerCase() === currentItem.answer.toLowerCase();
            let cls = 'bg-white border-2 border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer';
            if (showFeedback) {
              if (isCorrect) cls = 'bg-green-100 border-2 border-green-500 text-green-800 font-bold';
              else if (isSelected) cls = 'bg-red-100 border-2 border-red-500 text-red-800';
              else cls = 'bg-gray-50 border-2 border-gray-200 text-gray-400';
            } else if (isSelected) {
              cls = 'bg-indigo-100 border-2 border-indigo-500 text-indigo-800';
            }
            return (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                disabled={showFeedback}
                data-testid={`mc-option-${option}`}
                className={`p-5 rounded-xl text-xl font-medium transition-all ${cls}`}
              >
                {option}
              </button>
            );
          })}
        </div>

        {showFeedback && currentItem.explanation && (
          <div className="bg-blue-50 rounded-xl p-4 text-center mb-4">
            <p className="text-base text-blue-800">{currentItem.explanation}</p>
          </div>
        )}

        {showFeedback && (
          <div className="mt-4 text-center">
            <Button onClick={handleNext} data-testid="mc-next-btn">
              {currentIdx < items.length - 1 ? 'Next' : 'See Results'}
            </Button>
          </div>
        )}
      </Card>
    </GameWrapper>
  );
};

export default MultipleChoiceGrammar;
