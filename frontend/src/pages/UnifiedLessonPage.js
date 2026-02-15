import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, ChevronRight, CheckCircle, Clock, Zap, X,
  RefreshCw, BookOpen, Gamepad2, FileText, Edit3, Headphones, 
  Mic, Repeat, Play, Star, Lock, Volume2, AlertCircle, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ACTIVITY_ICONS = {
  'retrieval_warmup': RefreshCw, 'vocabulary': BookOpen, 'micro_game_vocab': Gamepad2,
  'micro_reading': FileText, 'grammar_focus': Edit3, 'micro_game_grammar': Gamepad2,
  'listening': Headphones, 'production': Mic, 'exit_ticket': CheckCircle, 'auto_review': Repeat
};

const ACTIVITY_LABELS = {
  'retrieval_warmup': 'Warm-up', 'vocabulary': 'Vocabulary', 'micro_game_vocab': 'Vocab Game',
  'micro_reading': 'Reading', 'grammar_focus': 'Grammar', 'micro_game_grammar': 'Grammar Game',
  'listening': 'Listening', 'production': 'Speaking', 'exit_ticket': 'Exit Quiz', 'auto_review': 'Review'
};

// ═══════ LESSON PATH SIDEBAR ═══════
function LessonPath({ activities, currentActivity, completedActivities, onActivityClick }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <h3 className="text-base font-bold text-gray-900 mb-4" data-testid="lesson-progress-title">Lesson Progress</h3>
      <div className="space-y-1">
        {activities.map((activity, index) => {
          const Icon = ACTIVITY_ICONS[activity.type] || Play;
          const isCompleted = completedActivities.includes(activity.type);
          const isCurrent = currentActivity === activity.type;
          const isAccessible = index === 0 || completedActivities.includes(activities[index - 1]?.type);
          if (activity.duration_minutes === 0 && activity.is_skippable) return null;

          return (
            <div key={activity.activity_id} className="relative" data-testid={`activity-step-${activity.type}`}>
              {index > 0 && <div className="absolute left-5 -top-1 w-0.5 h-1 bg-gray-200" />}
              <button
                className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left ${
                  isCurrent ? 'bg-blue-50 ring-2 ring-blue-400' :
                  isCompleted ? 'bg-green-50' :
                  isAccessible ? 'hover:bg-gray-50' : 'opacity-40 cursor-not-allowed'
                }`}
                onClick={() => isAccessible && onActivityClick(activity)}
                disabled={!isAccessible}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  isCompleted ? 'bg-green-500 text-white' :
                  isCurrent ? 'bg-blue-500 text-white' :
                  isAccessible ? 'bg-gray-100 text-gray-500' : 'bg-gray-100 text-gray-300'
                }`}>
                  {isCompleted ? <CheckCircle className="w-5 h-5" /> : !isAccessible ? <Lock className="w-4 h-4" /> : <Icon className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-gray-900 truncate">{ACTIVITY_LABELS[activity.type] || activity.label}</span>
                    {activity.is_skippable && <Badge variant="outline" className="text-[10px] px-1.5 py-0">Optional</Badge>}
                  </div>
                  <span className="text-xs text-gray-400">{activity.duration_minutes} min</span>
                </div>
                {isCurrent && !isCompleted && <ChevronRight className="w-4 h-4 text-blue-500 shrink-0" />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════ SKIP BUTTON ═══════
function SkipButton({ onSkip, label = 'Skip' }) {
  return (
    <button onClick={onSkip} className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1" data-testid="activity-skip-btn">
      {label} <ChevronRight className="w-3 h-3" />
    </button>
  );
}

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
    if (option === q.correct_answer) setCorrect(c => c + 1);
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
        <h3 className="text-xl font-bold text-gray-900 mb-6">{q.question_text}</h3>
        <div className="space-y-3">
          {q.options?.map((option) => {
            const isSelected = selectedAnswer === option;
            const isCorrectOption = option === q.correct_answer;
            let cls = 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30';
            if (showFeedback) {
              if (isCorrectOption) cls = 'border-green-500 bg-green-50 text-green-800';
              else if (isSelected && !isCorrectOption) cls = 'border-red-500 bg-red-50 text-red-800';
              else cls = 'border-gray-200 opacity-50';
            } else if (isSelected) cls = 'border-blue-500 bg-blue-50';
            return (
              <button key={option} className={`w-full p-4 rounded-xl text-left border-2 transition-all font-medium ${cls}`}
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

// ═══════ VOCABULARY MODULE ═══════
function VocabularyModule({ activity, onComplete, onSkip }) {
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState([]);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong'
  const words = activity?.words || [];
  const w = words[idx];

  const speakWord = (text) => { const u = new SpeechSynthesisUtterance(text); u.lang='en-US'; u.rate=0.8; speechSynthesis.speak(u); };

  const check = () => {
    const ok = input.toLowerCase().trim() === w.word.toLowerCase();
    setFeedback(ok ? 'correct' : 'wrong');
    if (ok && !done.includes(w.word_id)) setDone([...done, w.word_id]);
  };

  const next = () => {
    setFeedback(null); setInput('');
    if (idx < words.length - 1) setIdx(idx + 1);
    else onComplete(Math.round((done.length / words.length) * 100));
  };

  if (!w) return <div className="text-center text-gray-500 py-12">No vocabulary data</div>;

  return (
    <div data-testid="vocabulary-module">
      <div className="flex items-center justify-between mb-4">
        <Badge className="bg-blue-100 text-blue-700 border-0"><BookOpen className="w-3 h-3 mr-1" /> Vocabulary</Badge>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">Word {idx + 1} of {words.length}</span>
          <SkipButton onSkip={onSkip} />
        </div>
      </div>
      <Progress value={(idx / words.length) * 100} className="mb-6" />

      <div className="flex gap-6">
        {/* Word sidebar */}
        <div className="w-44 bg-gray-50 rounded-xl p-3 hidden md:block">
          <h4 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Words</h4>
          {words.map((word, i) => (
            <div key={word.word_id} className={`flex items-center gap-2 py-1.5 text-sm ${i === idx ? 'text-blue-600 font-semibold' : done.includes(word.word_id) ? 'text-green-600' : 'text-gray-500'}`}>
              {done.includes(word.word_id) ? <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" /> : i === idx ? <div className="w-3.5 h-3.5 rounded-full bg-blue-500 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 shrink-0" />}
              <span className="truncate">{word.word}</span>
            </div>
          ))}
        </div>

        {/* Main card */}
        <Card className="flex-1 p-8 text-center">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl mx-auto mb-5 flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-blue-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-1" data-testid="current-word">{w.word}</h2>
          <button className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 mb-3" onClick={() => speakWord(w.word)}>
            <Volume2 className="w-4 h-4" /><span className="text-sm">{w.ipa}</span>
          </button>
          <p className="text-gray-600 mb-3 text-sm">{w.definition}</p>
          <div className="bg-gray-50 rounded-xl p-3 mb-5">
            <p className="text-gray-700 italic text-sm">"{w.example_sentence}"</p>
            <button className="mt-1 text-xs text-blue-600 inline-flex items-center gap-1" onClick={() => speakWord(w.example_sentence)}><Volume2 className="w-3 h-3" /> Listen</button>
          </div>
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-600 block">Type the word:</label>
            <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !feedback && input.trim() && check()}
              className={`w-full max-w-xs mx-auto px-4 py-3 text-center text-lg border-2 rounded-xl focus:outline-none ${feedback === 'correct' ? 'border-green-500 bg-green-50' : feedback === 'wrong' ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'}`}
              placeholder="Type here..." disabled={!!feedback} autoFocus data-testid="vocab-input" />
            {feedback && <div className={`text-base font-semibold ${feedback === 'correct' ? 'text-green-600' : 'text-red-600'}`}>{feedback === 'correct' ? 'Correct!' : `The answer is: ${w.word}`}</div>}
            <div className="flex justify-center gap-3">
              {!feedback ? <Button onClick={check} disabled={!input.trim()} data-testid="vocab-check-btn">Check</Button> : <Button onClick={next} data-testid="vocab-next-btn">{idx < words.length - 1 ? 'Next Word' : 'Complete'}</Button>}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ═══════ MATCHING GAME (Vocab) ═══════
function MatchingGame({ activity, onComplete, onSkip }) {
  const [items] = useState(() => [...(activity?.items || [])].sort(() => Math.random() - 0.5));
  const [shuffledMatches] = useState(() => [...(activity?.items || [])].sort(() => Math.random() - 0.5));
  const [selectedWord, setSelectedWord] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [wrongPair, setWrongPair] = useState(false);
  const [lastCorrect, setLastCorrect] = useState(null);

  useEffect(() => {
    if (!selectedWord || !selectedMatch) return;
    const item = items.find(i => i.word === selectedWord);
    if (item && item.match === selectedMatch) {
      setLastCorrect(true);
      setMatchedPairs(prev => {
        const newMatched = [...prev, selectedWord];
        if (newMatched.length === items.length) {
          setTimeout(() => onComplete(100, 3), 400);
        }
        return newMatched;
      });
      setTimeout(() => { setSelectedWord(null); setSelectedMatch(null); setLastCorrect(null); }, 400);
    } else {
      setWrongPair(true);
      setLastCorrect(false);
      setTimeout(() => { setWrongPair(false); setSelectedWord(null); setSelectedMatch(null); setLastCorrect(null); }, 600);
    }
  }, [selectedWord, selectedMatch, items, onComplete]);

  return (
    <div data-testid="matching-game">
      <div className="flex items-center justify-between mb-6">
        <Badge className="bg-purple-100 text-purple-700 border-0"><Gamepad2 className="w-3 h-3 mr-1" /> Vocab Game</Badge>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{matchedPairs.length} / {items.length} matched</span>
          <SkipButton onSkip={onSkip} />
        </div>
      </div>
      <div className="text-center mb-6">
        <h3 className="text-lg font-bold text-gray-900">Match the Words</h3>
        <p className="text-sm text-gray-500">Connect words with their definitions</p>
        {lastCorrect === true && <p className="text-green-600 font-semibold text-sm mt-1">Correct match!</p>}
        {lastCorrect === false && <p className="text-red-600 font-semibold text-sm mt-1">Try again!</p>}
      </div>
      <div className="grid grid-cols-2 gap-6 max-w-3xl mx-auto">
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Words</h4>
          {items.map(item => (
            <button key={item.word} disabled={matchedPairs.includes(item.word)}
              className={`w-full p-3.5 rounded-xl text-left font-medium transition-all text-sm ${
                matchedPairs.includes(item.word) ? 'bg-green-100 text-green-700' :
                selectedWord === item.word ? (wrongPair ? 'bg-red-100 border-2 border-red-400' : 'bg-blue-500 text-white shadow-md') :
                'bg-white border-2 border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => !matchedPairs.includes(item.word) && setSelectedWord(item.word)}
              data-testid={`match-word-${item.word}`}>
              {item.word} {matchedPairs.includes(item.word) && <CheckCircle className="inline w-4 h-4 ml-1" />}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Definitions</h4>
          {shuffledMatches.map(item => (
            <button key={item.match} disabled={matchedPairs.includes(item.word)}
              className={`w-full p-3.5 rounded-xl text-left text-sm transition-all ${
                matchedPairs.includes(item.word) ? 'bg-green-100 text-green-700' :
                selectedMatch === item.match ? (wrongPair ? 'bg-red-100 border-2 border-red-400' : 'bg-blue-500 text-white shadow-md') :
                'bg-white border-2 border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => !matchedPairs.includes(item.word) && setSelectedMatch(item.match)}
              data-testid={`match-def-${item.word}`}>
              {item.match} {matchedPairs.includes(item.word) && <CheckCircle className="inline w-4 h-4 ml-1" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════ MICRO READING ═══════
function MicroReading({ activity, onComplete, onSkip }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [showPassage, setShowPassage] = useState(true);
  const questions = activity?.comprehension_questions || [];
  const q = questions[currentQ];

  const highlightText = (text) => {
    if (!activity?.highlighted_words?.length) return text;
    let result = text;
    activity.highlighted_words.forEach(word => {
      const regex = new RegExp(`\\b(${word})\\b`, 'gi');
      result = result.replace(regex, `<mark class="bg-yellow-200 px-0.5 rounded">$1</mark>`);
    });
    return result;
  };

  const handleAnswer = (answer) => {
    if (showFeedback) return;
    setSelectedAnswer(answer);
    setShowFeedback(true);
    if (answer === q.correct_answer) setCorrect(c => c + 1);
  };

  const handleNext = () => {
    setSelectedAnswer(null); setShowFeedback(false);
    if (currentQ < questions.length - 1) { setCurrentQ(i => i + 1); }
    else onComplete(Math.round((correct / questions.length) * 100));
  };

  return (
    <div data-testid="micro-reading">
      <div className="flex items-center justify-between mb-4">
        <Badge className="bg-emerald-100 text-emerald-700 border-0"><FileText className="w-3 h-3 mr-1" /> Reading</Badge>
        <div className="flex items-center gap-3">
          {questions.length > 0 && <span className="text-sm text-gray-500">Question {currentQ + 1}/{questions.length}</span>}
          <SkipButton onSkip={onSkip} />
        </div>
      </div>

      {/* Passage */}
      {showPassage && (
        <Card className="p-6 mb-6 bg-amber-50/50 border-amber-200">
          <h4 className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-3">Read the passage</h4>
          <p className="text-gray-800 leading-relaxed" dangerouslySetInnerHTML={{ __html: highlightText(activity?.passage_text || '') }} />
          {questions.length > 0 && (
            <Button variant="outline" size="sm" className="mt-4" onClick={() => setShowPassage(false)} data-testid="reading-answer-questions-btn">
              Answer Questions <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          )}
          {questions.length === 0 && <Button className="mt-4" onClick={() => onComplete(100)}>Continue</Button>}
        </Card>
      )}

      {/* Questions */}
      {!showPassage && q && (
        <Card className="p-6">
          <button className="text-sm text-blue-600 mb-4 flex items-center gap-1" onClick={() => setShowPassage(true)}>
            <ArrowLeft className="w-3 h-3" /> Show passage
          </button>
          <h3 className="text-lg font-bold text-gray-900 mb-5">{q.question || q.question_text}</h3>
          <div className="space-y-2.5">
            {(q.options || []).map(option => {
              const isSelected = selectedAnswer === option;
              const isCorrectOption = option === q.correct_answer;
              let cls = 'border-gray-200 hover:border-blue-300';
              if (showFeedback) {
                if (isCorrectOption) cls = 'border-green-500 bg-green-50';
                else if (isSelected) cls = 'border-red-500 bg-red-50';
                else cls = 'border-gray-200 opacity-50';
              }
              return (
                <button key={option} className={`w-full p-3.5 rounded-xl text-left border-2 transition-all text-sm font-medium ${cls}`}
                  onClick={() => handleAnswer(option)} disabled={showFeedback}>
                  {option}
                </button>
              );
            })}
          </div>
          {showFeedback && (
            <div className="mt-5 flex justify-end">
              <Button onClick={handleNext}>{currentQ < questions.length - 1 ? 'Next' : 'Continue'} <ChevronRight className="w-4 h-4 ml-1" /></Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

// ═══════ GRAMMAR FOCUS ═══════
function GrammarFocus({ activity, onComplete, onSkip }) {
  const [ruleIdx, setRuleIdx] = useState(0);
  const rules = activity?.rules || [];
  const rule = rules[ruleIdx];

  return (
    <div data-testid="grammar-focus">
      <div className="flex items-center justify-between mb-4">
        <Badge className="bg-violet-100 text-violet-700 border-0"><Edit3 className="w-3 h-3 mr-1" /> Grammar</Badge>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">Rule {ruleIdx + 1}/{rules.length}</span>
          <SkipButton onSkip={onSkip} />
        </div>
      </div>
      <Progress value={((ruleIdx + 1) / rules.length) * 100} className="mb-6" />

      {rule && (
        <Card className="p-8">
          {/* Pattern highlight */}
          {activity?.pattern_highlight && (
            <div className="text-center mb-6">
              <div className="inline-block bg-violet-100 text-violet-800 font-mono text-lg px-6 py-3 rounded-xl font-bold">
                {activity.pattern_highlight}
              </div>
            </div>
          )}

          {/* Rule */}
          <div className="bg-blue-50 rounded-xl p-5 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{rule.rule_text}</h3>
            <code className="text-sm text-blue-700 bg-blue-100 px-2 py-1 rounded">{rule.pattern}</code>
          </div>

          {/* Examples */}
          <div className="space-y-3 mb-6">
            {rule.examples?.map((ex, i) => (
              <div key={i} className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 bg-green-50 p-3 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                  <span className="text-sm font-medium text-green-800">{ex.correct}</span>
                </div>
                <div className="flex items-center gap-2 bg-red-50 p-3 rounded-xl">
                  <X className="w-5 h-5 text-red-500 shrink-0" />
                  <span className="text-sm font-medium text-red-800 line-through">{ex.incorrect}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Example sentences */}
          {ruleIdx === rules.length - 1 && activity?.example_sentences && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Practice sentences</h4>
              <ul className="space-y-1.5">
                {activity.example_sentences.map((s, i) => (
                  <li key={i} className="text-sm text-gray-700 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />{s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end gap-3">
            {ruleIdx > 0 && <Button variant="outline" onClick={() => setRuleIdx(i => i - 1)}>Previous</Button>}
            {ruleIdx < rules.length - 1 ? (
              <Button onClick={() => setRuleIdx(i => i + 1)} data-testid="grammar-next-btn">Next Rule <ChevronRight className="w-4 h-4 ml-1" /></Button>
            ) : (
              <Button onClick={() => onComplete(100)} data-testid="grammar-complete-btn">Got it! <ThumbsUp className="w-4 h-4 ml-1" /></Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

// ═══════ GRAMMAR GAME (Multi-type) ═══════
function GrammarGame({ activity, onComplete, onSkip }) {
  const allItems = React.useMemo(() => {
    const errorHunterItems = (activity?.items || []).map(item => ({ ...item, gameType: 'error_hunter' }));
    const wordOrderItems = (activity?.word_order_items || []).map(item => ({ ...item, gameType: 'word_order' }));
    const fillBlankItems = (activity?.fill_blank_items || []).map(item => ({ ...item, gameType: 'fill_blank' }));
    const combined = [...errorHunterItems, ...wordOrderItems, ...fillBlankItems];
    return combined.length > 0 ? combined.sort(() => Math.random() - 0.5) : errorHunterItems;
  }, [activity]);

  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  // Word order state
  const [selectedWords, setSelectedWords] = useState([]);
  const [shuffledWords, setShuffledWords] = useState([]);
  // Fill blank state
  const [selectedOption, setSelectedOption] = useState(null);
  // Error hunter state
  const [userChoice, setUserChoice] = useState(null);

  const item = allItems[idx];

  useEffect(() => {
    if (item?.gameType === 'word_order') {
      setShuffledWords([...(item.words || item.correct_sentence?.split(' ') || [])].sort(() => Math.random() - 0.5));
    }
  }, [idx, item]);

  const resetForNext = () => {
    setShowFeedback(false);
    setIsCorrect(false);
    setSelectedWords([]);
    setSelectedOption(null);
    setUserChoice(null);
  };

  const handleNext = () => {
    resetForNext();
    if (idx < allItems.length - 1) setIdx(i => i + 1);
    else {
      const pct = Math.round((score / allItems.length) * 100);
      const crowns = pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 50 ? 1 : 0;
      onComplete(pct, crowns);
    }
  };

  // Error Hunter
  const handleErrorHunter = (hasError) => {
    if (showFeedback) return;
    setUserChoice(hasError);
    const correct = hasError === item.has_error;
    setIsCorrect(correct);
    if (correct) setScore(s => s + 1);
    setShowFeedback(true);
  };

  // Word Order
  const handleWordSelect = (word, fromIdx) => {
    if (showFeedback) return;
    setSelectedWords(prev => [...prev, word]);
    setShuffledWords(prev => prev.filter((_, i) => i !== fromIdx));
  };

  const handleWordRemove = (word, fromIdx) => {
    if (showFeedback) return;
    setShuffledWords(prev => [...prev, word]);
    setSelectedWords(prev => prev.filter((_, i) => i !== fromIdx));
  };

  const checkWordOrder = () => {
    const userSentence = selectedWords.join(' ');
    const correct = userSentence === item.correct_sentence;
    setIsCorrect(correct);
    if (correct) setScore(s => s + 1);
    setShowFeedback(true);
  };

  // Fill Blank
  const handleFillBlank = (option) => {
    if (showFeedback) return;
    setSelectedOption(option);
    const correct = option === item.correct_answer;
    setIsCorrect(correct);
    if (correct) setScore(s => s + 1);
    setShowFeedback(true);
  };

  if (!item) return null;

  return (
    <div data-testid="grammar-game">
      <div className="flex items-center justify-between mb-4">
        <Badge className="bg-pink-100 text-pink-700 border-0"><Gamepad2 className="w-3 h-3 mr-1" /> Grammar Game</Badge>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{idx + 1} / {allItems.length}</span>
          <SkipButton onSkip={onSkip} />
        </div>
      </div>
      <Progress value={(idx / allItems.length) * 100} className="mb-6" />

      {/* ── Error Hunter ── */}
      {item.gameType === 'error_hunter' && (
        <Card className="p-8 text-center max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 bg-pink-50 text-pink-600 text-xs font-semibold px-3 py-1 rounded-full mb-4">
            <AlertCircle className="w-3 h-3" /> Find the Error
          </div>
          <div className="bg-gray-50 rounded-2xl p-6 mb-6">
            <p className="text-xl font-bold text-gray-900">{item.sentence}</p>
          </div>
          {!showFeedback ? (
            <div className="flex justify-center gap-4">
              <Button className="bg-green-600 hover:bg-green-700 px-8" onClick={() => handleErrorHunter(false)} data-testid="error-correct-btn">
                <ThumbsUp className="w-5 h-5 mr-2" /> Correct
              </Button>
              <Button variant="destructive" className="px-8" onClick={() => handleErrorHunter(true)} data-testid="error-wrong-btn">
                <ThumbsDown className="w-5 h-5 mr-2" /> Has Error
              </Button>
            </div>
          ) : (
            <div>
              <div className={`p-4 rounded-xl mb-4 ${isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                <p className="font-semibold mb-1">{isCorrect ? 'You got it right!' : 'Not quite!'}</p>
                {item.has_error ? <p className="text-sm">Correct: <strong>{item.correct_sentence}</strong></p> : <p className="text-sm">This sentence is correct!</p>}
              </div>
              <Button onClick={handleNext} data-testid="game-next-btn">{idx < allItems.length - 1 ? 'Next' : 'See Results'} <ChevronRight className="w-4 h-4 ml-1" /></Button>
            </div>
          )}
        </Card>
      )}

      {/* ── Word Order ── */}
      {item.gameType === 'word_order' && (
        <Card className="p-8 max-w-xl mx-auto">
          <div className="text-center mb-5">
            <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-600 text-xs font-semibold px-3 py-1 rounded-full mb-3">
              <Repeat className="w-3 h-3" /> Build the Sentence
            </div>
            {item.hint && <p className="text-sm text-gray-500">{item.hint}</p>}
          </div>

          {/* Answer area */}
          <div className="min-h-[56px] bg-blue-50 border-2 border-dashed border-blue-200 rounded-xl p-3 mb-4 flex flex-wrap gap-2" data-testid="word-order-answer">
            {selectedWords.map((word, i) => (
              <button key={`sel-${i}`} onClick={() => handleWordRemove(word, i)} disabled={showFeedback}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${showFeedback ? (isCorrect ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800') : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                data-testid={`selected-word-${i}`}>
                {word}
              </button>
            ))}
            {selectedWords.length === 0 && <span className="text-sm text-blue-300">Tap words below to build the sentence</span>}
          </div>

          {/* Word bank */}
          <div className="flex flex-wrap gap-2 justify-center mb-5" data-testid="word-bank">
            {shuffledWords.map((word, i) => (
              <button key={`bank-${i}`} onClick={() => handleWordSelect(word, i)} disabled={showFeedback}
                className="px-3 py-1.5 bg-white border-2 border-gray-200 rounded-lg text-sm font-medium hover:border-blue-400 hover:bg-blue-50 transition-all"
                data-testid={`bank-word-${i}`}>
                {word}
              </button>
            ))}
          </div>

          {!showFeedback ? (
            <div className="flex justify-center">
              <Button onClick={checkWordOrder} disabled={shuffledWords.length > 0} data-testid="word-order-check-btn">
                Check Answer
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <div className={`p-3 rounded-xl mb-4 text-sm ${isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                <p className="font-semibold">{isCorrect ? 'Perfect!' : 'Not quite!'}</p>
                {!isCorrect && <p>Correct: <strong>{item.correct_sentence}</strong></p>}
              </div>
              <Button onClick={handleNext} data-testid="game-next-btn">{idx < allItems.length - 1 ? 'Next' : 'See Results'} <ChevronRight className="w-4 h-4 ml-1" /></Button>
            </div>
          )}
        </Card>
      )}

      {/* ── Fill in the Blank ── */}
      {item.gameType === 'fill_blank' && (
        <Card className="p-8 max-w-xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-600 text-xs font-semibold px-3 py-1 rounded-full mb-5">
            <Edit3 className="w-3 h-3" /> Fill in the Blank
          </div>
          <div className="bg-gray-50 rounded-2xl p-6 mb-6">
            <p className="text-xl font-bold text-gray-900">{item.sentence}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
            {(item.options || []).map(option => {
              const isSelected = selectedOption === option;
              const isCorrectOption = option === item.correct_answer;
              let cls = 'border-gray-200 hover:border-amber-400 hover:bg-amber-50';
              if (showFeedback) {
                if (isCorrectOption) cls = 'border-green-500 bg-green-50 text-green-800';
                else if (isSelected) cls = 'border-red-500 bg-red-50 text-red-800';
                else cls = 'border-gray-200 opacity-40';
              }
              return (
                <button key={option} onClick={() => handleFillBlank(option)} disabled={showFeedback}
                  className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${cls}`}
                  data-testid={`fill-option-${option}`}>
                  {option}
                  {showFeedback && isCorrectOption && <CheckCircle className="inline w-4 h-4 ml-1 text-green-600" />}
                </button>
              );
            })}
          </div>
          {showFeedback && (
            <div className="mt-5">
              <p className={`text-sm font-semibold mb-3 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>{isCorrect ? 'Correct!' : 'Incorrect!'}</p>
              <Button onClick={handleNext} data-testid="game-next-btn">{idx < allItems.length - 1 ? 'Next' : 'See Results'} <ChevronRight className="w-4 h-4 ml-1" /></Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

// ═══════ LISTENING ACTIVITY ═══════
function ListeningActivity({ activity, onComplete }) {
  const [showTranscript, setShowTranscript] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [phase, setPhase] = useState('listen'); // listen -> questions
  const questions = activity?.questions || [];
  const q = questions[currentQ];

  const speakText = (text) => { const u = new SpeechSynthesisUtterance(text); u.lang='en-US'; u.rate=0.85; speechSynthesis.speak(u); };

  const handleAnswer = (answer) => {
    if (showFeedback) return;
    setSelectedAnswer(answer);
    setShowFeedback(true);
    if (answer === q.correct_answer) setCorrect(c => c + 1);
  };

  const handleNext = () => {
    setSelectedAnswer(null); setShowFeedback(false);
    if (currentQ < questions.length - 1) setCurrentQ(i => i + 1);
    else onComplete(Math.round((correct / questions.length) * 100));
  };

  return (
    <div data-testid="listening-activity">
      <div className="flex items-center justify-between mb-4">
        <Badge className="bg-cyan-100 text-cyan-700 border-0"><Headphones className="w-3 h-3 mr-1" /> Listening</Badge>
      </div>

      {phase === 'listen' && (
        <Card className="p-8 text-center max-w-xl mx-auto">
          <div className="w-24 h-24 bg-cyan-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <Headphones className="w-12 h-12 text-cyan-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Listen carefully</h3>
          <p className="text-gray-600 mb-6 text-sm">Click the play button to hear the audio. You can listen multiple times.</p>
          <Button className="bg-cyan-600 hover:bg-cyan-700 mb-4" onClick={() => speakText(activity?.transcript || '')} data-testid="listening-play-btn">
            <Play className="w-5 h-5 mr-2" /> Play Audio
          </Button>
          <div>
            <button className="text-sm text-gray-500 underline" onClick={() => setShowTranscript(!showTranscript)}>
              {showTranscript ? 'Hide' : 'Show'} transcript
            </button>
            {showTranscript && (
              <div className="mt-3 bg-gray-50 rounded-xl p-4 text-left">
                <p className="text-sm text-gray-700">{activity?.transcript}</p>
              </div>
            )}
          </div>
          {questions.length > 0 && (
            <Button className="mt-6" onClick={() => setPhase('questions')} data-testid="listening-answer-btn">
              Answer Questions <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
          {questions.length === 0 && <Button className="mt-6" onClick={() => onComplete(100)}>Continue</Button>}
        </Card>
      )}

      {phase === 'questions' && q && (
        <Card className="p-6 max-w-xl mx-auto">
          <button className="text-sm text-blue-600 mb-4 flex items-center gap-1" onClick={() => setPhase('listen')}>
            <ArrowLeft className="w-3 h-3" /> Listen again
          </button>
          <Progress value={((currentQ + 1) / questions.length) * 100} className="mb-5" />
          <h3 className="text-lg font-bold text-gray-900 mb-5">{q.question || q.question_text}</h3>
          <div className="space-y-2.5">
            {(q.options || []).map(option => {
              const isSelected = selectedAnswer === option;
              const isCorrectOption = option === q.correct_answer;
              let cls = 'border-gray-200 hover:border-cyan-300';
              if (showFeedback) {
                if (isCorrectOption) cls = 'border-green-500 bg-green-50';
                else if (isSelected) cls = 'border-red-500 bg-red-50';
                else cls = 'border-gray-200 opacity-50';
              }
              return (
                <button key={option} className={`w-full p-3.5 rounded-xl text-left border-2 transition-all text-sm font-medium ${cls}`}
                  onClick={() => handleAnswer(option)} disabled={showFeedback}>
                  {option}
                </button>
              );
            })}
          </div>
          {showFeedback && <div className="mt-5 flex justify-end"><Button onClick={handleNext}>{currentQ < questions.length - 1 ? 'Next' : 'Continue'}</Button></div>}
        </Card>
      )}
    </div>
  );
}

// ═══════ PRODUCTION (Speaking/Writing) ═══════
function ProductionActivity({ activity, onComplete }) {
  const [response, setResponse] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!response.trim()) return;
    setSubmitted(true);
  };

  return (
    <div data-testid="production-activity">
      <div className="flex items-center justify-between mb-4">
        <Badge className="bg-rose-100 text-rose-700 border-0">
          <Mic className="w-3 h-3 mr-1" /> {activity?.production_type === 'writing' ? 'Writing' : 'Speaking'}
        </Badge>
      </div>

      <Card className="p-6 max-w-2xl mx-auto">
        <h3 className="text-lg font-bold text-gray-900 mb-4">{activity?.prompt || 'Practice task'}</h3>

        {activity?.evaluation_criteria?.length > 0 && (
          <div className="bg-gray-50 rounded-xl p-4 mb-5">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">What to include</h4>
            <ul className="space-y-1">
              {activity.evaluation_criteria.map((c, i) => (
                <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-gray-400 shrink-0" />{c}
                </li>
              ))}
            </ul>
          </div>
        )}

        {!submitted ? (
          <div className="space-y-4">
            <textarea
              value={response} onChange={e => setResponse(e.target.value)}
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 min-h-[120px] text-sm"
              placeholder={activity?.production_type === 'writing' ? 'Write your answer here...' : 'Type what you would say...'}
              data-testid="production-textarea"
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">{response.split(/\s+/).filter(Boolean).length} words</span>
              <Button onClick={handleSubmit} disabled={!response.trim()} data-testid="production-submit-btn">Submit</Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="bg-green-50 rounded-xl p-5 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold text-green-800">Nice work!</h4>
              </div>
              <p className="text-sm text-green-700 mb-3">Your response has been recorded.</p>
              {activity?.example_response && (
                <div className="bg-white rounded-lg p-3 border border-green-200">
                  <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Example response</h5>
                  <p className="text-sm text-gray-700 italic">"{activity.example_response}"</p>
                </div>
              )}
            </div>
            <Button onClick={() => onComplete(80)} data-testid="production-continue-btn">Continue</Button>
          </div>
        )}
      </Card>
    </div>
  );
}

// ═══════ EXIT TICKET ═══════
function ExitTicket({ activity, onComplete }) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [fillBlankValue, setFillBlankValue] = useState('');
  const questions = activity?.questions || [];
  const q = questions[idx];

  const handleAnswer = (answer) => {
    if (showFeedback) return;
    const newAnswers = { ...answers, [q.question_id]: answer };
    setAnswers(newAnswers);
    setShowFeedback(true);
  };

  const handleNext = () => {
    setShowFeedback(false);
    setFillBlankValue('');
    if (idx < questions.length - 1) setIdx(i => i + 1);
    else setShowResults(true);
  };

  const calcScore = () => {
    let c = 0;
    questions.forEach(q => { if (answers[q.question_id]?.toLowerCase().trim() === q.correct_answer.toLowerCase().trim()) c++; });
    return Math.round((c / questions.length) * 100);
  };

  const handleRetry = () => {
    setIdx(0);
    setAnswers({});
    setShowResults(false);
    setShowFeedback(false);
    setFillBlankValue('');
  };

  if (showResults) {
    const score = calcScore();
    const passed = score >= (activity?.pass_threshold || 70);
    return (
      <Card className="p-8 text-center max-w-lg mx-auto" data-testid="exit-ticket-results">
        <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${passed ? 'bg-green-100' : 'bg-red-100'}`}>
          {passed ? <CheckCircle className="w-10 h-10 text-green-600" /> : <AlertCircle className="w-10 h-10 text-red-600" />}
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{passed ? 'Great Job!' : 'Keep Practicing'}</h3>
        <p className="text-4xl font-bold mb-4" style={{ color: passed ? '#16a34a' : '#dc2626' }}>{score}%</p>

        {/* Show answer review */}
        <div className="text-left mb-6 space-y-2">
          {questions.map((q, i) => {
            const userAnswer = answers[q.question_id] || '';
            const isCorrect = userAnswer.toLowerCase().trim() === q.correct_answer.toLowerCase().trim();
            return (
              <div key={q.question_id} className={`p-3 rounded-lg text-sm ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                <p className="font-medium text-gray-800">{i + 1}. {q.question_text}</p>
                <p className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                  Your answer: {userAnswer} {isCorrect ? <CheckCircle className="inline w-4 h-4" /> : <span> (Correct: {q.correct_answer})</span>}
                </p>
              </div>
            );
          })}
        </div>

        <p className="text-gray-600 mb-6 text-sm">
          {passed ? 'You passed! Moving to the next step.' : `You need ${activity?.pass_threshold || 70}% to pass. Try again!`}
        </p>
        {passed ? (
          <Button onClick={() => onComplete(score)} data-testid="exit-ticket-continue-btn">Continue <ChevronRight className="w-4 h-4 ml-1" /></Button>
        ) : (
          <Button onClick={handleRetry} data-testid="exit-ticket-retry-btn">Try Again <RefreshCw className="w-4 h-4 ml-1" /></Button>
        )}
      </Card>
    );
  }

  if (!q) return null;

  const currentAnswer = answers[q.question_id];
  const isCurrentCorrect = currentAnswer?.toLowerCase().trim() === q.correct_answer.toLowerCase().trim();

  return (
    <div className="max-w-2xl mx-auto" data-testid="exit-ticket">
      <div className="flex items-center justify-between mb-4">
        <Badge className="bg-amber-100 text-amber-700 border-0"><CheckCircle className="w-3 h-3 mr-1" /> Exit Quiz</Badge>
        <span className="text-sm text-gray-500">{idx + 1} / {questions.length}</span>
      </div>
      <Progress value={(idx / questions.length) * 100} className="mb-6" />
      <Card className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-5">{q.question_text}</h3>
        {q.question_type === 'multiple_choice' && (
          <div className="space-y-2.5">
            {q.options?.map(option => {
              const isSelected = currentAnswer === option;
              const isCorrectOption = option === q.correct_answer;
              let cls = 'border-gray-200 hover:border-blue-300';
              if (showFeedback) {
                if (isCorrectOption) cls = 'border-green-500 bg-green-50 text-green-800';
                else if (isSelected && !isCorrectOption) cls = 'border-red-500 bg-red-50 text-red-800';
                else cls = 'border-gray-200 opacity-50';
              } else if (isSelected) cls = 'border-blue-500 bg-blue-50';
              return (
                <button key={option} className={`w-full p-3.5 rounded-xl text-left border-2 transition-all text-sm font-medium ${cls}`}
                  onClick={() => handleAnswer(option)} disabled={showFeedback}
                  data-testid={`exit-option-${option.substring(0,15).replace(/\s/g,'-')}`}>
                  {option}
                  {showFeedback && isCorrectOption && <CheckCircle className="inline w-4 h-4 ml-2 text-green-600" />}
                  {showFeedback && isSelected && !isCorrectOption && <X className="inline w-4 h-4 ml-2 text-red-600" />}
                </button>
              );
            })}
          </div>
        )}
        {q.question_type === 'fill_blank' && (
          <div className="space-y-3">
            <input type="text" value={fillBlankValue}
              onChange={e => setFillBlankValue(e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none text-sm ${showFeedback ? (isCurrentCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50') : 'focus:border-blue-500 border-gray-200'}`}
              placeholder="Type your answer..."
              onKeyDown={e => { if (e.key === 'Enter' && fillBlankValue.trim() && !showFeedback) handleAnswer(fillBlankValue.trim()); }}
              disabled={showFeedback} autoFocus data-testid="exit-fill-blank-input" />
            {!showFeedback && <p className="text-xs text-gray-400">Press Enter to submit</p>}
            {!showFeedback && fillBlankValue.trim() && (
              <Button onClick={() => handleAnswer(fillBlankValue.trim())} size="sm" data-testid="exit-fill-blank-submit">Submit</Button>
            )}
            {showFeedback && !isCurrentCorrect && (
              <p className="text-sm text-red-600">Correct answer: <strong>{q.correct_answer}</strong></p>
            )}
          </div>
        )}
        {q.question_type === 'true_false' && (
          <div className="flex justify-center gap-4">
            <Button className="px-8" variant={currentAnswer === 'true' ? 'default' : 'outline'} onClick={() => handleAnswer('true')} disabled={showFeedback}>True</Button>
            <Button className="px-8" variant={currentAnswer === 'false' ? 'default' : 'outline'} onClick={() => handleAnswer('false')} disabled={showFeedback}>False</Button>
          </div>
        )}
        {showFeedback && (
          <div className="mt-5 flex items-center justify-between">
            <span className={`text-sm font-semibold ${isCurrentCorrect ? 'text-green-600' : 'text-red-600'}`}>
              {isCurrentCorrect ? 'Correct!' : 'Incorrect'}
            </span>
            <Button onClick={handleNext} data-testid="exit-next-btn">
              {idx < questions.length - 1 ? 'Next' : 'See Results'} <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

// ═══════ MAIN LESSON PAGE ═══════
export default function UnifiedLessonPage({ user }) {
  const navigate = useNavigate();
  const { lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [currentActivityType, setCurrentActivityType] = useState(null);
  const [currentActivityData, setCurrentActivityData] = useState(null);
  const [completedActivities, setCompletedActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(false);

  useEffect(() => { loadLesson(); }, [lessonId]);

  const loadLesson = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/unified/lessons/${lessonId}`);
      const data = await res.json();
      setLesson(data);
      const first = data.activity_flow?.find(a => !a.is_skippable || a.duration_minutes > 0);
      if (first) { setCurrentActivityType(first.type); await loadActivityData(first.type); }
    } catch (error) { console.error('Error loading lesson:', error); } finally { setLoading(false); }
  };

  const loadActivityData = async (activityType) => {
    try {
      setActivityLoading(true);
      const res = await fetch(`${API_URL}/api/unified/lessons/${lessonId}/activity/${activityType}`);
      setCurrentActivityData(res.ok ? await res.json() : null);
    } catch { setCurrentActivityData(null); } finally { setActivityLoading(false); }
  };

  const handleActivityComplete = useCallback(async (score, crownsOrPassed) => {
    if (!completedActivities.includes(currentActivityType)) {
      setCompletedActivities(prev => [...prev, currentActivityType]);
    }
    if (user?.id) {
      try {
        await fetch(`${API_URL}/api/unified/progress/activity`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id, lesson_id: lessonId, activity_type: currentActivityType, score, crowns: typeof crownsOrPassed === 'number' ? crownsOrPassed : null, time_spent_seconds: 0 })
        });
      } catch (e) { console.error('Error saving progress:', e); }
    }
    moveToNextActivity();
  }, [currentActivityType, completedActivities, user, lessonId]);

  const handleActivitySkip = useCallback(() => {
    if (!completedActivities.includes(currentActivityType)) setCompletedActivities(prev => [...prev, currentActivityType]);
    moveToNextActivity();
  }, [currentActivityType, completedActivities]);

  const moveToNextActivity = useCallback(() => {
    const activities = lesson?.activity_flow || [];
    const currentIndex = activities.findIndex(a => a.type === currentActivityType);
    let nextActivity = null;
    for (let i = currentIndex + 1; i < activities.length; i++) {
      const a = activities[i];
      if (!a.is_skippable || a.duration_minutes > 0) { nextActivity = a; break; }
      else { setCompletedActivities(prev => prev.includes(a.type) ? prev : [...prev, a.type]); }
    }
    if (nextActivity) { setCurrentActivityType(nextActivity.type); loadActivityData(nextActivity.type); }
    else handleLessonComplete();
  }, [lesson, currentActivityType]);

  const handleLessonComplete = async () => {
    if (user?.id) {
      try {
        await fetch(`${API_URL}/api/unified/progress/lesson`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id, lesson_id: lessonId })
        });
        toast.success('Lesson completed! Points awarded.');
      } catch (e) { console.error('Error completing lesson:', e); }
    }
    navigate(`/unified/stage/${lesson?.stage_id}`);
  };

  const handleActivityClick = (activity) => { setCurrentActivityType(activity.type); loadActivityData(activity.type); };

  const renderActivity = () => {
    if (activityLoading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>;
    const activity = lesson?.activity_flow?.find(a => a.type === currentActivityType);

    switch (currentActivityType) {
      case 'retrieval_warmup':
        return currentActivityData ? <RetrievalWarmup activity={currentActivityData} onComplete={handleActivityComplete} /> :
          <PlaceholderActivity type={currentActivityType} onComplete={handleActivityComplete} onSkip={handleActivitySkip} isSkippable={activity?.is_skippable} />;
      case 'vocabulary':
        return currentActivityData ? <VocabularyModule activity={currentActivityData} onComplete={handleActivityComplete} /> :
          <PlaceholderActivity type={currentActivityType} onComplete={handleActivityComplete} onSkip={handleActivitySkip} isSkippable={activity?.is_skippable} />;
      case 'micro_game_vocab':
        return currentActivityData ? <MatchingGame activity={currentActivityData} onComplete={handleActivityComplete} /> :
          <PlaceholderActivity type={currentActivityType} onComplete={handleActivityComplete} onSkip={handleActivitySkip} isSkippable={activity?.is_skippable} />;
      case 'micro_reading':
        return currentActivityData ? <MicroReading activity={currentActivityData} onComplete={handleActivityComplete} /> :
          <PlaceholderActivity type={currentActivityType} onComplete={handleActivityComplete} onSkip={handleActivitySkip} isSkippable={activity?.is_skippable} />;
      case 'grammar_focus':
        return currentActivityData ? <GrammarFocus activity={currentActivityData} onComplete={handleActivityComplete} /> :
          <PlaceholderActivity type={currentActivityType} onComplete={handleActivityComplete} onSkip={handleActivitySkip} isSkippable={activity?.is_skippable} />;
      case 'micro_game_grammar':
        return currentActivityData ? <ErrorHunterGame activity={currentActivityData} onComplete={handleActivityComplete} /> :
          <PlaceholderActivity type={currentActivityType} onComplete={handleActivityComplete} onSkip={handleActivitySkip} isSkippable={activity?.is_skippable} />;
      case 'listening':
        return currentActivityData ? <ListeningActivity activity={currentActivityData} onComplete={handleActivityComplete} /> :
          <PlaceholderActivity type={currentActivityType} onComplete={handleActivityComplete} onSkip={handleActivitySkip} isSkippable={activity?.is_skippable} />;
      case 'production':
        return currentActivityData ? <ProductionActivity activity={currentActivityData} onComplete={handleActivityComplete} /> :
          <PlaceholderActivity type={currentActivityType} onComplete={handleActivityComplete} onSkip={handleActivitySkip} isSkippable={activity?.is_skippable} />;
      case 'exit_ticket':
        return currentActivityData ? <ExitTicket activity={currentActivityData} onComplete={(score) => handleActivityComplete(score)} /> :
          <PlaceholderActivity type={currentActivityType} onComplete={handleActivityComplete} onSkip={handleActivitySkip} isSkippable={activity?.is_skippable} />;
      case 'auto_review':
        return (
          <Card className="p-12 text-center max-w-lg mx-auto" data-testid="auto-review-complete">
            <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Lesson Complete!</h3>
            <p className="text-gray-500 mb-2 text-sm">Your vocabulary has been added to your review queue.</p>
            <p className="text-gray-400 text-xs mb-6">Spaced repetition will help you remember these words.</p>
            <Button onClick={() => handleActivityComplete(100)} data-testid="auto-review-finish-btn">
              <Star className="w-4 h-4 mr-2" /> Finish Lesson
            </Button>
          </Card>
        );
      default:
        return <PlaceholderActivity type={currentActivityType} onComplete={handleActivityComplete} onSkip={handleActivitySkip} isSkippable={activity?.is_skippable} />;
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" /></div>;
  if (!lesson) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-600">Lesson not found</p></div>;

  const totalActivities = lesson.activity_flow?.filter(a => !a.is_skippable || a.duration_minutes > 0).length || 0;
  const progressPercent = Math.round((completedActivities.length / totalActivities) * 100);

  return (
    <div className="min-h-screen bg-gray-50" data-testid="unified-lesson-page">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate(`/unified/stage/${lesson.stage_id}`)} data-testid="lesson-back-btn"><X className="w-5 h-5" /></Button>
              <div>
                <h1 className="font-bold text-gray-900 text-sm">{lesson.title}</h1>
                <p className="text-xs text-gray-500">Lesson {lesson.number}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-xs text-gray-500"><Clock className="w-3.5 h-3.5" />{lesson.estimated_duration_minutes} min</span>
              <span className="flex items-center gap-1 text-xs text-gray-500"><Zap className="w-3.5 h-3.5" />{lesson.points_reward} pts</span>
              <div className="w-28"><Progress value={progressPercent} /></div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <LessonPath activities={lesson.activity_flow || []} currentActivity={currentActivityType} completedActivities={completedActivities} onActivityClick={handleActivityClick} />
          </div>
          <div className="lg:col-span-3">{renderActivity()}</div>
        </div>
      </div>
    </div>
  );
}

// ═══════ PLACEHOLDER ═══════
function PlaceholderActivity({ type, onComplete, onSkip, isSkippable }) {
  return (
    <Card className="p-12 text-center max-w-lg mx-auto" data-testid="placeholder-activity">
      <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
        {React.createElement(ACTIVITY_ICONS[type] || Play, { className: 'w-8 h-8 text-gray-400' })}
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{ACTIVITY_LABELS[type] || type}</h3>
      <p className="text-gray-500 mb-6 text-sm">This activity module is coming soon.</p>
      <div className="flex justify-center gap-3">
        {isSkippable && <Button variant="outline" onClick={onSkip} data-testid="placeholder-skip-btn">Skip</Button>}
        <Button onClick={() => onComplete(100)} data-testid="placeholder-complete-btn">Mark Complete</Button>
      </div>
    </Card>
  );
}
