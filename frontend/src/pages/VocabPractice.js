import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import {
  ChevronLeft, CheckCircle2, XCircle, ArrowRight,
  Loader2, RefreshCw, BookOpen, Trophy, PenTool
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

function generateExercises(vocabulary) {
  const exercises = [];
  // From advanced_terms: type the word
  (vocabulary.advanced_terms || []).forEach(item => {
    exercises.push({
      type: 'type_word',
      prompt: item.meaning,
      answer: item.term.toLowerCase(),
      hint: item.term[0] + '...',
      category: 'Advanced Terms'
    });
  });
  // From collocations: fill in blank
  (vocabulary.collocations || []).forEach(item => {
    const words = item.collocation.split(' ');
    if (words.length >= 2) {
      const blankIdx = Math.floor(Math.random() * words.length);
      const answer = words[blankIdx].toLowerCase();
      const blanked = words.map((w, i) => i === blankIdx ? '______' : w).join(' ');
      exercises.push({
        type: 'fill_blank',
        prompt: `Complete the collocation: "${blanked}"`,
        context: item.example,
        answer,
        hint: answer[0] + '...',
        category: 'Collocations'
      });
    }
  });
  // From idioms: meaning match (MC)
  const idioms = vocabulary.idioms || [];
  idioms.forEach((item, i) => {
    const correct = item.meaning;
    const distractors = idioms
      .filter((_, j) => j !== i)
      .map(d => d.meaning)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    if (distractors.length >= 2) {
      const options = [correct, ...distractors].sort(() => Math.random() - 0.5);
      exercises.push({
        type: 'multiple_choice',
        prompt: `What does "${item.idiom}" mean?`,
        options,
        answer: correct,
        category: 'Idioms'
      });
    }
  });
  // From phrasal_verbs: match to formal alternative
  (vocabulary.phrasal_verbs || []).forEach(item => {
    if (item.formal_alternative) {
      exercises.push({
        type: 'type_word',
        prompt: `What is the phrasal verb for: "${item.meaning}"?`,
        answer: item.phrasal_verb.toLowerCase(),
        hint: item.phrasal_verb.split(' ')[0][0] + '... ' + (item.phrasal_verb.split(' ')[1]?.[0] || '') + '...',
        category: 'Phrasal Verbs'
      });
    }
  });
  // From word_formation: complete the family
  (vocabulary.word_formation || []).forEach(item => {
    ['noun', 'verb', 'adjective', 'adverb'].forEach(pos => {
      if (item[pos] && item[pos] !== item.root) {
        exercises.push({
          type: 'type_word',
          prompt: `What is the ${pos} form of "${item.root}"?`,
          answer: item[pos].toLowerCase(),
          hint: item[pos][0] + '...',
          category: 'Word Formation'
        });
      }
    });
  });
  return exercises.sort(() => Math.random() - 0.5).slice(0, 15);
}

function ExerciseCard({ exercise, onAnswer, answered, userAnswer, isCorrect }) {
  const [input, setInput] = useState('');

  useEffect(() => { setInput(''); }, [exercise]);

  const handleSubmit = () => {
    if (!input.trim()) return;
    onAnswer(input.trim());
  };

  if (exercise.type === 'multiple_choice') {
    return (
      <div className="space-y-4" data-testid="exercise-mc">
        <p className="text-base font-medium text-slate-800">{exercise.prompt}</p>
        <div className="grid gap-2">
          {exercise.options.map((opt, i) => {
            const isSelected = answered && userAnswer === opt;
            const isRight = answered && opt === exercise.answer;
            return (
              <button
                key={i}
                onClick={() => !answered && onAnswer(opt)}
                disabled={answered}
                className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                  isRight ? 'bg-emerald-50 border-emerald-400 text-emerald-800' :
                  isSelected && !isCorrect ? 'bg-red-50 border-red-400 text-red-800' :
                  answered ? 'bg-slate-50 border-slate-200 text-slate-400' :
                  'bg-white border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-700'
                }`}
                data-testid={`option-${i}`}
              >
                {opt}
                {isRight && answered && <CheckCircle2 className="w-4 h-4 inline ml-2 text-emerald-500" />}
                {isSelected && !isCorrect && <XCircle className="w-4 h-4 inline ml-2 text-red-500" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // type_word or fill_blank
  return (
    <div className="space-y-4" data-testid="exercise-type">
      <p className="text-base font-medium text-slate-800">{exercise.prompt}</p>
      {exercise.context && <p className="text-sm text-slate-500 italic">"{exercise.context}"</p>}
      {!answered ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder={exercise.hint || 'Type your answer...'}
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm focus:border-indigo-400 focus:ring-1 focus:ring-indigo-300 outline-none"
            autoFocus
            data-testid="answer-input"
          />
          <Button onClick={handleSubmit} disabled={!input.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6" data-testid="submit-answer-btn">
            Check
          </Button>
        </div>
      ) : (
        <div className={`px-4 py-3 rounded-xl border text-sm ${isCorrect ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-red-50 border-red-300 text-red-800'}`}>
          {isCorrect ? (
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Correct!</span>
          ) : (
            <span className="flex items-center gap-2"><XCircle className="w-4 h-4" /> Your answer: "{userAnswer}" → Correct: <strong>{exercise.answer}</strong></span>
          )}
        </div>
      )}
    </div>
  );
}

export default function VocabPractice() {
  const navigate = useNavigate();
  const { moduleId } = useParams();
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [answered, setAnswered] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/advanced-mastery/modules/${moduleId}`)
      .then(r => r.json())
      .then(d => { setModule(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [moduleId]);

  const exercises = useMemo(() => {
    if (!module?.vocabulary) return [];
    return generateExercises(module.vocabulary);
  }, [module]);

  const current = exercises[currentIdx];
  const total = exercises.length;
  const score = answers.filter(a => a.correct).length;

  const handleAnswer = (answer) => {
    const correct = answer.toLowerCase().trim() === (current.answer || '').toLowerCase().trim();
    setUserAnswer(answer);
    setIsCorrect(correct);
    setAnswered(true);
    setAnswers(prev => [...prev, { exercise: current, userAnswer: answer, correct }]);
  };

  const handleNext = () => {
    if (currentIdx < total - 1) {
      setCurrentIdx(i => i + 1);
      setAnswered(false);
      setUserAnswer('');
      setIsCorrect(false);
    } else {
      setFinished(true);
    }
  };

  const restart = () => {
    setCurrentIdx(0);
    setAnswers([]);
    setAnswered(false);
    setUserAnswer('');
    setIsCorrect(false);
    setFinished(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col" data-testid="vocab-practice-page">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-700" data-testid="back-btn">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-bold text-slate-900 text-sm">{module?.title || 'Practice'}</h1>
              <p className="text-xs text-slate-500">Vocabulary Practice · {total} exercises</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/vocab-learn/${moduleId}`)}
            className="text-xs"
            data-testid="go-learn-btn"
          >
            <BookOpen className="w-3.5 h-3.5 mr-1" /> Review
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white px-4 py-2 border-b border-slate-100">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Question {Math.min(currentIdx + 1, total)} of {total}</span>
            <span className="text-emerald-600 font-medium">{score} correct</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full transition-all duration-300" style={{ width: `${(Math.min(currentIdx + 1, total) / total) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Exercise Area */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-2xl w-full">
          {finished ? (
            <div className="text-center space-y-6" data-testid="results-screen">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${score / total >= 0.8 ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                <Trophy className={`w-10 h-10 ${score / total >= 0.8 ? 'text-emerald-500' : 'text-amber-500'}`} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">
                {score / total >= 0.8 ? 'Excellent!' : score / total >= 0.5 ? 'Good effort!' : 'Keep practicing!'}
              </h2>
              <p className="text-lg text-slate-600">{score} / {total} correct ({Math.round(score / total * 100)}%)</p>

              {/* Wrong answers review */}
              {answers.filter(a => !a.correct).length > 0 && (
                <div className="text-left bg-red-50 border border-red-200 rounded-xl p-4 space-y-2">
                  <p className="text-sm font-semibold text-red-700">Review your mistakes:</p>
                  {answers.filter(a => !a.correct).map((a, i) => (
                    <div key={i} className="text-xs text-red-600">
                      <span className="font-medium">{a.exercise.prompt.substring(0, 60)}...</span>
                      <br />Your answer: "{a.userAnswer}" → Correct: <strong>{a.exercise.answer}</strong>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3 justify-center">
                <Button onClick={restart} variant="outline" data-testid="restart-btn">
                  <RefreshCw className="w-4 h-4 mr-2" /> Try Again
                </Button>
                <Button onClick={() => navigate(`/vocab-learn/${moduleId}`)} className="bg-indigo-600 hover:bg-indigo-700 text-white" data-testid="back-to-learn-btn">
                  <BookOpen className="w-4 h-4 mr-2" /> Back to Slides
                </Button>
              </div>
            </div>
          ) : current ? (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-semibold uppercase">{current.category}</span>
                <span className="text-xs text-slate-400">{current.type === 'multiple_choice' ? 'Choose the correct answer' : 'Type your answer'}</span>
              </div>

              <ExerciseCard
                exercise={current}
                onAnswer={handleAnswer}
                answered={answered}
                userAnswer={userAnswer}
                isCorrect={isCorrect}
              />

              {answered && (
                <div className="flex justify-end">
                  <Button onClick={handleNext} className="bg-indigo-600 hover:bg-indigo-700 text-white" data-testid="next-exercise-btn">
                    {currentIdx < total - 1 ? 'Next' : 'See Results'} <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-slate-400 text-center">No exercises available for this module.</p>
          )}
        </div>
      </div>
    </div>
  );
}
