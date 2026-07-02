import React, { useState } from 'react';
import { RefreshCw, CheckCircle, X, ChevronRight } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Progress } from '../../../../components/ui/progress';
import FormattedQuestion from './FormattedQuestion';
import SkipButton from './SkipButton';

// ═══════ RETRIEVAL WARMUP ═══════
function RetrievalWarmup({ activity, onComplete, onSkip }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [correct, setCorrect] = useState(0);
  const questions = activity?.questions || [];
  const q = questions[currentIndex];

  const handleSelect = (option) => {
    if (showFeedback) return;
    setSelectedAnswer(option);
    setShowFeedback(true);
    const isRight = Array.isArray(q.correct_answer) ? q.correct_answer.includes(option) : option === q.correct_answer;
    if (isRight) setCorrect(c => c + 1);
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setShowFeedback(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      onComplete(Math.round((correct / questions.length) * 100));
    }
  };

  if (!q) return <div className="text-center text-gray-500 py-12">No warmup questions available</div>;

  return (
    <div className="max-w-2xl mx-auto" data-testid="retrieval-warmup">
      <div className="flex items-center justify-between mb-6">
        <Badge className="bg-orange-100 text-orange-700 border-0"><RefreshCw className="w-3 h-3 mr-1" /> Warm-up</Badge>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{currentIndex + 1} / {questions.length}</span>
          <SkipButton onSkip={onSkip} />
        </div>
      </div>
      <Progress value={((currentIndex + 1) / questions.length) * 100} className="mb-8" />
      <Card className="p-8">
        {/* Video embed */}
        {q.video_url && (
          <div className="mb-5 rounded-xl overflow-hidden aspect-video max-w-md mx-auto">
            <iframe
              src={q.video_url.replace('watch?v=', 'embed/')}
              title="Lesson Video"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
              allowFullScreen
            />
          </div>
        )}
        {/* Image hint */}
        {q.image_emoji && (
          <div className="flex justify-center mb-5">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-amber-50 rounded-2xl flex items-center justify-center border border-orange-200 shadow-sm">
              <span className="text-5xl">{q.image_emoji}</span>
            </div>
          </div>
        )}
        <h3 className="text-2xl font-bold text-gray-900 mb-4"><FormattedQuestion text={q.question_text} /></h3>
        {q.hint && !showFeedback && (
          <p className="text-base text-amber-600 italic mb-4">Hint: {q.hint}</p>
        )}
        <div className="space-y-3">
          {q.options?.map((option) => {
            const isSelected = selectedAnswer === option;
            const isCorrectOption = Array.isArray(q.correct_answer) ? q.correct_answer.includes(option) : option === q.correct_answer;
            let cls = 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30';
            if (showFeedback) {
              if (isCorrectOption) cls = 'border-green-500 bg-green-50 text-green-800';
              else if (isSelected && !isCorrectOption) cls = 'border-red-500 bg-red-50 text-red-800';
              else cls = 'border-gray-200 opacity-50';
            } else if (isSelected) cls = 'border-blue-500 bg-blue-50';
            return (
              <button key={option} className={`w-full p-5 rounded-xl text-left border-2 transition-all font-medium text-lg ${cls}`}
                onClick={() => handleSelect(option)} disabled={showFeedback}
                data-testid={`warmup-option-${option.substring(0,10).replace(/\s/g,'-')}`}>
                {option}
                {showFeedback && isCorrectOption && <CheckCircle className="inline w-5 h-5 ml-2 text-green-600" />}
                {showFeedback && isSelected && !isCorrectOption && <X className="inline w-5 h-5 ml-2 text-red-600" />}
              </button>
            );
          })}
        </div>
        {showFeedback && (
          <div className="mt-6 flex justify-end">
            <Button onClick={handleNext} data-testid="warmup-next-btn">
              {currentIndex < questions.length - 1 ? 'Next' : 'Continue'}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

export default RetrievalWarmup;
