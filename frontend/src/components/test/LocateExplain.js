import React, { useState } from 'react';
import { CheckCircle, XCircle, MapPin, Lightbulb, GraduationCap, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Locate & Explain Component
 * Shows where the answer is found in the passage and explains why it's correct/incorrect
 */
const LocateExplain = ({
  questionNumber,
  questionText,
  userAnswer,
  correctAnswer,
  isCorrect,
  passageExcerpt, // The relevant part of the passage
  explanation, // Why this answer is correct
  wrongExplanation, // If incorrect, why user's answer was wrong
  skillTip, // Learning tip for this question type
  language = 'en'
}) => {
  const [expanded, setExpanded] = useState(true);

  const labels = {
    en: {
      correct: 'CORRECT',
      incorrect: 'INCORRECT',
      question: 'Question',
      yourAnswer: 'Your answer',
      correctAnswer: 'Correct answer',
      locatedIn: 'Located in passage',
      explanation: 'Explanation',
      whyWrong: 'Why you got it wrong',
      skillTip: 'Skill Tip'
    },
    vi: {
      correct: 'ĐÚNG',
      incorrect: 'SAI',
      question: 'Câu hỏi',
      yourAnswer: 'Câu trả lời của bạn',
      correctAnswer: 'Đáp án đúng',
      locatedIn: 'Vị trí trong đoạn văn',
      explanation: 'Giải thích',
      whyWrong: 'Tại sao sai',
      skillTip: 'Mẹo làm bài'
    },
    tr: {
      correct: 'DOĞRU',
      incorrect: 'YANLIŞ',
      question: 'Soru',
      yourAnswer: 'Cevabınız',
      correctAnswer: 'Doğru cevap',
      locatedIn: 'Parçada yeri',
      explanation: 'Açıklama',
      whyWrong: 'Neden yanlış',
      skillTip: 'Beceri İpucu'
    }
  };

  const t = labels[language] || labels.en;

  return (
    <div className={`rounded-lg border-2 overflow-hidden mb-4 ${
      isCorrect ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30'
    }`}>
      {/* Header */}
      <div 
        className={`flex items-center justify-between px-4 py-3 cursor-pointer ${
          isCorrect ? 'bg-green-100' : 'bg-red-100'
        }`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          {isCorrect ? (
            <span className="flex items-center gap-1 text-green-700 text-sm font-bold">
              <CheckCircle className="w-5 h-5" />
              {t.correct}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-red-700 text-sm font-bold">
              <XCircle className="w-5 h-5" />
              {t.incorrect}
            </span>
          )}
          <span className="font-bold text-gray-800">{t.question} {questionNumber}</span>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </div>

      {/* Expandable Content */}
      {expanded && (
        <div className="p-4 space-y-4">
          {/* Question Text */}
          <p className="text-gray-700 font-medium">{questionText}</p>

          {/* Answer Display */}
          <div className="flex flex-wrap gap-4">
            {!isCorrect && (
              <div>
                <span className="text-sm text-gray-500">{t.yourAnswer}:</span>
                <span className="ml-2 text-red-600 line-through font-medium">{userAnswer}</span>
              </div>
            )}
            <div>
              <span className="text-sm text-gray-500">{t.correctAnswer}:</span>
              <span className="ml-2 text-green-600 font-bold">{correctAnswer}</span>
            </div>
          </div>

          {/* Located in Passage */}
          {passageExcerpt && (
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-1">
                <MapPin className="w-4 h-4 text-yellow-600" />
                {t.locatedIn}:
              </p>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 text-sm text-gray-700 italic">
                &ldquo;...{passageExcerpt}...&rdquo;
              </div>
            </div>
          )}

          {/* Explanation */}
          <div className="grid md:grid-cols-2 gap-4">
            {explanation && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-1">
                  <Lightbulb className="w-4 h-4 text-blue-600" />
                  {t.explanation}:
                </p>
                <div className="bg-blue-50 border-l-4 border-blue-400 p-3 text-sm text-blue-800">
                  {explanation}
                </div>
              </div>
            )}

            {!isCorrect && wrongExplanation && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-1">
                  <XCircle className="w-4 h-4 text-red-600" />
                  {t.whyWrong}:
                </p>
                <div className="bg-red-50 border-l-4 border-red-400 p-3 text-sm text-red-800">
                  {wrongExplanation}
                </div>
              </div>
            )}
          </div>

          {/* Skill Tip */}
          {skillTip && (
            <div className="bg-purple-50 rounded-lg p-3">
              <p className="text-sm text-purple-800 flex items-start gap-2">
                <GraduationCap className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span><strong>{t.skillTip}:</strong> {skillTip}</span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocateExplain;
