import React from 'react';
import { Flag } from 'lucide-react';

/**
 * Question Navigation Bar Component
 * Shows numbered buttons (1-40) for quick navigation between questions
 * Colors: Green = Answered, Yellow = Flagged, Gray = Unanswered, Purple = Current
 */
const QuestionNavigation = ({
  totalQuestions,
  currentQuestion,
  answers = {},
  flaggedQuestions = new Set(),
  onQuestionSelect,
  questionIds = [],
  className = ''
}) => {
  const getButtonStyle = (index) => {
    const questionId = questionIds[index] || index + 1;
    const isCurrent = index === currentQuestion;
    const isAnswered = answers[questionId] !== undefined;
    const isFlagged = flaggedQuestions.has(questionId);

    if (isCurrent) {
      return 'bg-violet-600 text-white ring-2 ring-violet-300 ring-offset-1';
    }
    if (isFlagged) {
      return 'bg-yellow-400 text-gray-800 hover:bg-yellow-500';
    }
    if (isAnswered) {
      return 'bg-green-500 text-white hover:bg-green-600';
    }
    return 'bg-gray-200 text-gray-600 hover:bg-gray-300';
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-3 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-500">Question Navigator</span>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-gray-500">Answered</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-400 rounded"></div>
            <span className="text-gray-500">Flagged</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-200 rounded"></div>
            <span className="text-gray-500">Unanswered</span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-1 justify-center">
        {Array.from({ length: totalQuestions }, (_, i) => (
          <button
            key={i}
            onClick={() => onQuestionSelect(i)}
            className={`w-8 h-8 rounded text-sm font-medium transition-all cursor-pointer 
              flex items-center justify-center ${getButtonStyle(i)}`}
            title={`Go to question ${i + 1}`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuestionNavigation;
