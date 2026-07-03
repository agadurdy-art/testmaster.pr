import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// IELTS-style bottom question navigation bar (listening/reading only).
// Extracted verbatim from renderNavigationBar in
// pages/CambridgeTestInterface.js; closed-over values became props.
export default function QuestionNavigationBar({
  currentSection,
  currentQuestion,
  setCurrentQuestion,
  reviewedQuestions,
  toggleReview,
  answers,
  retryWrongOnly,
  wrongQuestions,
  setCurrentPart,
  setShowSubmitModal,
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
    
    // Only show for listening and reading
    if (currentSection !== 'listening' && currentSection !== 'reading') {
      return null;
    }
    
    return (
      <div className="bg-slate-100 border-t-2 border-slate-300 px-4 py-2 fixed bottom-0 left-0 right-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto">
          {/* Review checkbox */}
          <label className="flex items-center gap-1 text-sm text-slate-600 mr-2 shrink-0">
            <input 
              type="checkbox" 
              checked={reviewedQuestions[currentQuestion] || false}
              onChange={() => toggleReview(currentQuestion)}
              className="w-4 h-4"
            />
            Review
          </label>
          
          {navData.parts.map((part, partIdx) => (
            <div key={part.label} className="flex items-center gap-1 shrink-0">
              <span className="text-xs font-medium text-slate-700 bg-slate-300 px-2 py-1 rounded">
                {part.label}
              </span>
              {part.questions.map(qNum => {
                const answerKey = currentSection === 'listening' 
                  ? `listening_${qNum}`
                  : `reading_${qNum}`;
                const isAnswered = !!answers[answerKey];
                const isCurrent = currentQuestion === qNum;
                const isReviewed = reviewedQuestions[qNum];
                const isWrongRetry = retryWrongOnly && wrongQuestions[answerKey];
                const isSkippedInRetry = retryWrongOnly && !wrongQuestions[answerKey];
                
                return (
                  <button
                    key={qNum}
                    onClick={() => {
                      setCurrentQuestion(qNum);
                      // Navigate to correct part
                      if (currentSection === 'listening') {
                        setCurrentPart(Math.ceil(qNum / 10) - 1);
                      } else if (currentSection === 'reading') {
                        if (qNum <= 13) setCurrentPart(0);
                        else if (qNum <= 26) setCurrentPart(1);
                        else setCurrentPart(2);
                      }
                      // Scroll to question after state update
                      setTimeout(() => {
                        // First try exact match
                        let el = document.getElementById(`question-${qNum}`);
                        // If not found, try to find group question (e.g., question-24-26 for Q24)
                        if (!el) {
                          const allQuestionDivs = document.querySelectorAll('[id^="question-"]');
                          for (const div of allQuestionDivs) {
                            const idParts = div.id.replace('question-', '').split('-');
                            if (idParts.length === 2) {
                              const start = parseInt(idParts[0]);
                              const end = parseInt(idParts[1]);
                              if (qNum >= start && qNum <= end) {
                                el = div;
                                break;
                              }
                            }
                          }
                        }
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                      }, 100);
                    }}
                    className={`w-7 h-7 text-xs font-medium rounded transition-all
                      ${isSkippedInRetry ? 'bg-green-200 text-green-600 opacity-50' :
                        isCurrent ? 'bg-blue-500 text-white' : 
                        isAnswered ? 'bg-slate-700 text-white' : 
                        isWrongRetry ? 'bg-amber-200 text-amber-800 ring-1 ring-amber-400' :
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
          
          {/* Navigation arrows and Submit */}
          <div className="ml-auto flex items-center gap-2 shrink-0">
            <button 
              onClick={() => setCurrentQuestion(prev => Math.max(1, prev - 1))}
              className="w-8 h-8 bg-slate-700 text-white rounded-full flex items-center justify-center hover:bg-slate-600"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setCurrentQuestion(prev => Math.min(40, prev + 1))}
              className="w-8 h-8 bg-slate-700 text-white rounded-full flex items-center justify-center hover:bg-slate-600"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            
            <button 
              onClick={() => setShowSubmitModal(true)}
              className="ml-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              Submit {currentSection} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
}
