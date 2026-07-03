import React from 'react';
import { Button } from '../../../../components/ui/button';
import { Progress } from '../../../../components/ui/progress';
import { ChevronRight, ArrowLeft, Flag } from 'lucide-react';
import QuestionNavigation from '../../../../components/test/QuestionNavigation';
import SideBySideReader from '../../../../components/test/SideBySideReader';
import LanguageSwitcher from './LanguageSwitcher';

// READING SECTION — extracted verbatim from the `stage === 'reading'` block
// of pages/ComprehensiveLevelTest.js. Closed-over values became same-named
// props.
export default function ReadingSection({
  language,
  readingQuestions,
  currentQuestion,
  setCurrentQuestion,
  readingAnswers,
  flaggedQuestions,
  toggleFlagQuestion,
  handleReadingAnswer,
  nextReadingQuestion,
  getProgressPercentage,
}) {
    const currentQ = readingQuestions[currentQuestion];
    const questionIds = readingQuestions.map(q => q.id);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-4 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                {language === 'vi' ? `Đánh Giá Đọc - Câu ${currentQuestion + 1} / ${readingQuestions.length}` :
                 language === 'tr' ? `Okuma Değerlendirmesi - Soru ${currentQuestion + 1} / ${readingQuestions.length}` :
                 `Reading Assessment - Question ${currentQuestion + 1} of ${readingQuestions.length}`}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-blue-600">
                  {language === 'vi' ? 'Cấp độ' : language === 'tr' ? 'Seviye' : 'Level'}: {currentQ.level}
                </span>
                <LanguageSwitcher />
              </div>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </div>

          {/* Question Navigation Bar */}
          <QuestionNavigation
            totalQuestions={readingQuestions.length}
            currentQuestion={currentQuestion}
            answers={readingAnswers}
            flaggedQuestions={flaggedQuestions}
            onQuestionSelect={(index) => setCurrentQuestion(index)}
            questionIds={questionIds}
            className="mb-4"
          />

          {/* Side-by-Side Reader */}
          <SideBySideReader
            passage={currentQ.passage}
            passageTitle={language === 'vi' ? 'Đoạn Văn' : language === 'tr' ? 'Okuma Parçası' : 'Reading Passage'}
            defaultRatio={70}
          >
            {/* Questions Panel Content */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900">
                  {language === 'vi' ? `Câu ${currentQuestion + 1}` : 
                   language === 'tr' ? `Soru ${currentQuestion + 1}` :
                   `Question ${currentQuestion + 1}`}
                </h4>
                <button
                  onClick={() => toggleFlagQuestion(currentQ.id)}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-sm transition-colors ${
                    flaggedQuestions.has(currentQ.id) 
                      ? 'bg-yellow-100 text-yellow-700' 
                      : 'bg-gray-100 text-gray-500 hover:bg-yellow-50'
                  }`}
                >
                  <Flag className="w-4 h-4" />
                  {flaggedQuestions.has(currentQ.id) ? 
                    (language === 'tr' ? 'İşaretli' : 'Flagged') : 
                    (language === 'tr' ? 'İşaretle' : 'Flag')}
                </button>
              </div>

              <p className="text-gray-800 font-medium">{currentQ.question}</p>

              <div className="space-y-2">
                {currentQ.options.map((option) => {
                  const optionLetter = option.charAt(0);
                  const isSelected = readingAnswers[currentQ.id] === optionLetter;
                  
                  return (
                    <button
                      key={option}
                      onClick={() => handleReadingAnswer(currentQ.id, optionLetter)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all text-sm ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                      }`}
                    >
                      <span className={`font-medium ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                        {option}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-4 border-t">
                <Button
                  onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                  variant="outline"
                  size="sm"
                  disabled={currentQuestion === 0}
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  {language === 'tr' ? 'Önceki' : 'Previous'}
                </Button>
                <Button
                  onClick={nextReadingQuestion}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={!readingAnswers[currentQ.id]}
                >
                  {currentQuestion < readingQuestions.length - 1 ? 
                    (language === 'tr' ? 'Sonraki' : 'Next') : 
                    (language === 'tr' ? 'Dinlemeye Geç' : 'Continue to Listening')}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </SideBySideReader>
        </div>
      </div>
    );
}
