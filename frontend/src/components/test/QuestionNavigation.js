import React, { useRef, useEffect } from 'react';

/**
 * Question Navigation Bar Component - Responsive Design
 * Desktop: Single row at top, all questions visible
 * Mobile: Horizontally scrollable single row
 * Colors: Green = Answered, Yellow = Flagged, Gray = Unanswered, Purple = Current
 */
const QuestionNavigation = ({
  totalQuestions,
  currentQuestion,
  answers = {},
  flaggedQuestions = new Set(),
  onQuestionSelect,
  questionIds = [],
  className = '',
  compact = false // For smaller displays
}) => {
  const scrollContainerRef = useRef(null);

  // Auto-scroll to current question on mobile
  useEffect(() => {
    if (scrollContainerRef.current && currentQuestion >= 0) {
      const container = scrollContainerRef.current;
      const buttons = container.querySelectorAll('button');
      const currentBtn = buttons[currentQuestion];
      if (currentBtn) {
        const containerRect = container.getBoundingClientRect();
        const buttonRect = currentBtn.getBoundingClientRect();
        const scrollLeft = buttonRect.left - containerRect.left - (containerRect.width / 2) + (buttonRect.width / 2);
        container.scrollBy({ left: scrollLeft, behavior: 'smooth' });
      }
    }
  }, [currentQuestion]);

  const getButtonStyle = (index) => {
    const questionId = questionIds[index] || index + 1;
    const isCurrent = index === currentQuestion;
    const isAnswered = answers[questionId] !== undefined;
    const isFlagged = flaggedQuestions.has(questionId);

    if (isCurrent) {
      return 'bg-violet-600 text-white ring-2 ring-violet-300 ring-offset-1 scale-110';
    }
    if (isFlagged) {
      return 'bg-yellow-400 text-gray-800 hover:bg-yellow-500';
    }
    if (isAnswered) {
      return 'bg-green-500 text-white hover:bg-green-600';
    }
    return 'bg-gray-200 text-gray-600 hover:bg-gray-300';
  };

  const answeredCount = questionIds.filter((id, idx) => answers[id] || answers[idx + 1]).length || 
    Object.keys(answers).length;
  const flaggedCount = flaggedQuestions.size;

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Header - Compact on mobile */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-700">Questions</span>
          <span className="text-xs text-gray-500">
            {answeredCount}/{totalQuestions}
          </span>
        </div>
        
        {/* Legend - Hidden on very small screens, compact on mobile */}
        <div className="hidden sm:flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 bg-green-500 rounded"></div>
            <span className="text-gray-500 hidden md:inline">Answered</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 bg-yellow-400 rounded"></div>
            <span className="text-gray-500 hidden md:inline">Flagged</span>
            {flaggedCount > 0 && <span className="text-yellow-600">({flaggedCount})</span>}
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 bg-gray-200 rounded"></div>
            <span className="text-gray-500 hidden md:inline">Unanswered</span>
          </div>
        </div>
      </div>

      {/* Question Numbers - Horizontally scrollable single row */}
      <div 
        ref={scrollContainerRef}
        className="flex overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 py-2 px-2 gap-1"
        style={{ 
          scrollbarWidth: 'thin',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {Array.from({ length: totalQuestions }, (_, i) => (
          <button
            key={i}
            onClick={() => onQuestionSelect(i)}
            className={`flex-shrink-0 ${compact ? 'w-7 h-7 text-xs' : 'w-8 h-8 text-sm'} rounded font-medium transition-all cursor-pointer 
              flex items-center justify-center ${getButtonStyle(i)}`}
            title={`Question ${i + 1}`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Mobile Legend - Only visible on small screens */}
      <div className="flex sm:hidden items-center justify-center gap-3 px-3 py-1.5 border-t bg-gray-50 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded"></div>
          <span className="text-gray-500">{answeredCount}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-yellow-400 rounded"></div>
          <span className="text-gray-500">{flaggedCount}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-violet-600 rounded"></div>
          <span className="text-gray-500">Current</span>
        </div>
      </div>
    </div>
  );
};

export default QuestionNavigation;
