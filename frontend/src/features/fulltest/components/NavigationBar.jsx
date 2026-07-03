import React from 'react';
import { ArrowRight, ArrowLeft, ChevronRight } from 'lucide-react';

// ============ IELTS-STYLE NAVIGATION BAR ============
export default function NavigationBar({
  currentSection,
  currentQuestion,
  setCurrentQuestion,
  sectionAnswers,
  reviewedQuestions,
  toggleReview,
  setListeningPart,
  setCurrentPassage,
  setShowConfirmSubmit,
}) {
  const getQuestionNumbers = () => {
    if (currentSection === 'listening') {
      return {
        parts: [
          { label: 'Part 1', questions: Array.from({length: 10}, (_, i) => i + 1) },
          { label: 'Part 2', questions: Array.from({length: 10}, (_, i) => i + 11) },
          { label: 'Part 3', questions: Array.from({length: 10}, (_, i) => i + 21) },
          { label: 'Part 4', questions: Array.from({length: 10}, (_, i) => i + 31) }
        ]
      };
    } else if (currentSection === 'reading') {
      return {
        parts: [
          { label: 'Part 1', questions: Array.from({length: 13}, (_, i) => i + 1) },
          { label: 'Part 2', questions: Array.from({length: 13}, (_, i) => i + 14) },
          { label: 'Part 3', questions: Array.from({length: 14}, (_, i) => i + 27) }
        ]
      };
    }
    return { parts: [] };
  };

  const navData = getQuestionNumbers();

  return (
    <div className="bg-slate-100 border-t-2 border-slate-300 px-4 py-2">
      <div className="flex items-center gap-2 overflow-x-auto">
        {/* Review checkbox */}
        <label className="flex items-center gap-1 text-sm text-slate-600 mr-2">
          <input
            type="checkbox"
            checked={reviewedQuestions[currentQuestion] || false}
            onChange={() => toggleReview(currentQuestion)}
            className="w-4 h-4"
          />
          Review
        </label>

        {navData.parts.map((part, partIdx) => (
          <div key={part.label} className="flex items-center gap-1">
            <span className="text-xs font-medium text-slate-700 bg-slate-300 px-2 py-1 rounded">
              {part.label}
            </span>
            {part.questions.map(qNum => {
              const isAnswered = currentSection === 'listening'
                ? !!sectionAnswers.listening[`L${Math.ceil(qNum/10)}Q${qNum}`]
                : !!sectionAnswers.reading[`R${partIdx+1}Q${qNum}`];
              const isCurrent = currentQuestion === qNum;
              const isReviewed = reviewedQuestions[qNum];

              return (
                <button
                  key={qNum}
                  onClick={() => {
                    setCurrentQuestion(qNum);
                    if (currentSection === 'listening') {
                      setListeningPart(Math.ceil(qNum / 10));
                    } else if (currentSection === 'reading') {
                      setCurrentPassage(partIdx);
                    }
                  }}
                  className={`w-7 h-7 text-xs font-medium rounded transition-all
                    ${isCurrent ? 'bg-blue-500 text-white' :
                      isAnswered ? 'bg-slate-700 text-white' :
                      'bg-slate-200 text-slate-700 hover:bg-slate-300'}
                    ${isReviewed ? 'ring-2 ring-yellow-400' : ''}
                  `}
                >
                  {qNum}
                </button>
              );
            })}
          </div>
        ))}

        {/* Next/Previous arrows and Submit Button */}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setCurrentQuestion(prev => Math.max(1, prev - 1))}
            className="w-8 h-8 bg-slate-700 text-white rounded-full flex items-center justify-center hover:bg-slate-600"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentQuestion(prev => Math.min(40, prev + 1))}
            className="w-8 h-8 bg-slate-700 text-white rounded-full flex items-center justify-center hover:bg-slate-600"
          >
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Submit Section Button */}
          <button
            onClick={() => setShowConfirmSubmit(true)}
            className="ml-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            Submit {currentSection} <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
