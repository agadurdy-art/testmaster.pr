import React from 'react';
import { Button } from '../../../../../components/ui/button';
import { X } from 'lucide-react';

// Slide-in answer review panel. Extracted verbatim from renderReviewPanel
// in pages/CambridgeTestInterface.js; visibility still driven by the
// showReviewPanel translate-x classes (panel always mounted, as before).
export default function ReviewPanel({
  showReviewPanel,
  setShowReviewPanel,
  answers,
  currentSection,
  getTotalQuestions,
  getAnsweredCount,
  highlights,
  notes,
  deleteHighlight,
  setCurrentPart,
  setShowSubmitModal,
}) {
    const currentSectionAnswers = Object.entries(answers)
      .filter(([key]) => key.startsWith(`${currentSection}_`))
      .map(([key, value]) => ({
        question: key.replace(`${currentSection}_`, ''),
        answer: value,
        answered: !!value
      }));

    return (
      <div className={`fixed right-0 top-0 h-full w-80 bg-white shadow-2xl transform transition-transform z-50 ${showReviewPanel ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 border-b flex items-center justify-between bg-slate-100">
          <h3 className="font-bold text-lg">Review Answers</h3>
          <Button variant="ghost" size="sm" onClick={() => setShowReviewPanel(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="p-4 overflow-auto h-[calc(100%-120px)]">
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: getTotalQuestions(currentSection) }, (_, i) => {
              const qKey = `${currentSection}_${i + 1}`;
              const isAnswered = !!answers[qKey];
              return (
                <div
                  key={i}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium cursor-pointer transition-all
                    ${isAnswered ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                  onClick={() => {
                    // Navigate to question
                    const partIndex = Math.floor(i / 10);
                    setCurrentPart(partIndex);
                  }}
                >
                  {i + 1}
                </div>
              );
            })}
          </div>
          
          {/* Highlights & Notes Summary */}
          {(highlights.length > 0 || notes.length > 0) && (
            <div className="mt-6 border-t pt-4">
              <h4 className="font-semibold text-sm text-gray-700 mb-3">Your Notes & Highlights</h4>
              <div className="space-y-2 max-h-48 overflow-auto">
                {highlights.filter(h => h.section === currentSection).map(h => {
                  const relatedNote = notes.find(n => n.id === h.id);
                  return (
                    <div key={h.id} className={`p-2 rounded text-xs ${h.color === 'blue' ? 'bg-blue-100' : 'bg-yellow-100'}`}>
                      <p className="font-medium truncate">{h.text.substring(0, 40)}...</p>
                      {relatedNote && <p className="text-gray-600 mt-1 italic">{relatedNote.note}</p>}
                      <button onClick={() => deleteHighlight(h.id)} className="text-red-500 text-xs mt-1 hover:underline">
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">Answered:</span>
            <span className="font-bold">{getAnsweredCount(currentSection)} / {getTotalQuestions(currentSection)}</span>
          </div>
          <Button className="w-full bg-red-600 hover:bg-red-700" onClick={() => setShowSubmitModal(true)}>
            Submit {currentSection.charAt(0).toUpperCase() + currentSection.slice(1)}
          </Button>
        </div>
      </div>
    );
}
