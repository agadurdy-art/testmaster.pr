import React from 'react';
import { Button } from '../../../../../components/ui/button';
import { BookMarked, GraduationCap, RefreshCw } from 'lucide-react';

// Action Buttons — Retry Wrong Only / More Tests / Study Weak Areas /
// Retake Full Test row at the bottom of the results page.
// JSX extracted verbatim from pages/CambridgeTestResults.js (Faz2 refactor).

export default function ActionButtons({ questionResults, navigate, bookId, testId, testData }) {
  return (
        <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
          {/* Retry Wrong-Only Button - only show if there are wrong answers */}
          {(() => {
            const wrongCount = [...(questionResults.listening || []), ...(questionResults.reading || [])].filter(q => !q.is_correct).length;
            if (wrongCount > 0) {
              return (
                <Button
                  data-testid="retry-wrong-only-btn"
                  onClick={() => {
                    const wrongQuestions = {};
                    (questionResults.listening || []).forEach(q => {
                      if (!q.is_correct) wrongQuestions[`listening_${q.question_id}`] = true;
                    });
                    (questionResults.reading || []).forEach(q => {
                      if (!q.is_correct) wrongQuestions[`reading_${q.question_id}`] = true;
                    });
                    navigate(`/cambridge-test/${bookId}/${testId}`, {
                      state: { retryWrongOnly: true, wrongQuestions, testData }
                    });
                  }}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 shadow-lg"
                >
                  <RefreshCw className="w-4 h-4 mr-2" /> Retry Wrong Only ({wrongCount})
                </Button>
              );
            }
            return null;
          })()}
          <Button onClick={() => navigate('/question-bank')} variant="outline" className="flex-1">
            <BookMarked className="w-4 h-4 mr-2" /> More Tests
          </Button>
          <Button
            onClick={() => navigate('/mastery-course')}
            className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0 shadow-lg"
          >
            <GraduationCap className="w-4 h-4 mr-2" /> Study Weak Areas
          </Button>
          <Button
            onClick={() => navigate(`/cambridge-test/${bookId}/${testId}`)}
            className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-lg"
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Retake Full Test
          </Button>
        </div>
  );
}
