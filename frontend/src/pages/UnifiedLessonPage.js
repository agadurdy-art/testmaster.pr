import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, ChevronRight, CheckCircle, Clock, Zap, X,
  RefreshCw, BookOpen, Gamepad2, FileText, Edit3, Headphones, 
  Mic, MicOff, Repeat, Play, Star, Lock, Volume2, AlertCircle, ThumbsUp, ThumbsDown, Square
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// ═══════ STAGE THEMES ═══════
const STAGE_THEMES = {
  stage_1: { bg: 'from-amber-50 to-orange-50', accent: '#F59E0B', accentLight: '#FEF3C7', accentText: 'text-amber-700', headerBg: 'bg-gradient-to-r from-amber-400 to-orange-400', pathColor: '#F59E0B', cardBorder: 'border-amber-200', activeBg: 'bg-amber-50', activeRing: 'ring-amber-400', completedBg: 'bg-amber-500', badgeBg: 'bg-amber-100 text-amber-700', btnBg: 'bg-amber-500 hover:bg-amber-600' },
  stage_2: { bg: 'from-emerald-50 to-teal-50', accent: '#10B981', accentLight: '#D1FAE5', accentText: 'text-emerald-700', headerBg: 'bg-gradient-to-r from-emerald-400 to-teal-400', pathColor: '#10B981', cardBorder: 'border-emerald-200', activeBg: 'bg-emerald-50', activeRing: 'ring-emerald-400', completedBg: 'bg-emerald-500', badgeBg: 'bg-emerald-100 text-emerald-700', btnBg: 'bg-emerald-500 hover:bg-emerald-600' },
  stage_3: { bg: 'from-blue-50 to-indigo-50', accent: '#3B82F6', accentLight: '#DBEAFE', accentText: 'text-blue-700', headerBg: 'bg-gradient-to-r from-blue-400 to-indigo-400', pathColor: '#3B82F6', cardBorder: 'border-blue-200', activeBg: 'bg-blue-50', activeRing: 'ring-blue-400', completedBg: 'bg-blue-500', badgeBg: 'bg-blue-100 text-blue-700', btnBg: 'bg-blue-500 hover:bg-blue-600' },
  stage_4: { bg: 'from-violet-50 to-purple-50', accent: '#8B5CF6', accentLight: '#EDE9FE', accentText: 'text-violet-700', headerBg: 'bg-gradient-to-r from-violet-400 to-purple-400', pathColor: '#8B5CF6', cardBorder: 'border-violet-200', activeBg: 'bg-violet-50', activeRing: 'ring-violet-400', completedBg: 'bg-violet-500', badgeBg: 'bg-violet-100 text-violet-700', btnBg: 'bg-violet-500 hover:bg-violet-600' },
  stage_5: { bg: 'from-rose-50 to-pink-50', accent: '#F43F5E', accentLight: '#FFE4E6', accentText: 'text-rose-700', headerBg: 'bg-gradient-to-r from-rose-400 to-pink-400', pathColor: '#F43F5E', cardBorder: 'border-rose-200', activeBg: 'bg-rose-50', activeRing: 'ring-rose-400', completedBg: 'bg-rose-500', badgeBg: 'bg-rose-100 text-rose-700', btnBg: 'bg-rose-500 hover:bg-rose-600' },
};
const getTheme = (stageId) => STAGE_THEMES[stageId] || STAGE_THEMES.stage_1;

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

// ═══════ LESSON PATH SIDEBAR (Wavy Visual Path) ═══════
function LessonPath({ activities, currentActivity, completedActivities, onActivityClick, theme }) {
  const t = theme || STAGE_THEMES.stage_1;
  return (
    <div className={`rounded-2xl p-5 shadow-sm border ${t.cardBorder} bg-white`}>
      <h3 className="text-base font-bold text-gray-900 mb-5" data-testid="lesson-progress-title">Lesson Path</h3>
      <div className="relative">
        {/* Wavy path SVG background */}
        <svg className="absolute left-5 top-0 w-1 h-full" style={{ overflow: 'visible' }}>
          {activities.map((_, i) => i < activities.length - 1 && (
            <line key={i} x1="0" y1={i * 64 + 20} x2="0" y2={(i + 1) * 64 + 20}
              stroke={completedActivities.includes(activities[i].type) ? t.accent : '#E5E7EB'}
              strokeWidth="3" strokeDasharray={completedActivities.includes(activities[i].type) ? '0' : '6 4'} />
          ))}
        </svg>

        <div className="space-y-2 relative">
          {activities.map((activity, index) => {
            const Icon = ACTIVITY_ICONS[activity.type] || Play;
            const isCompleted = completedActivities.includes(activity.type);
            const isCurrent = currentActivity === activity.type;
            const isAccessible = true; // All activities accessible

            return (
              <div key={activity.activity_id} data-testid={`activity-step-${activity.type}`}>
                <button
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left ${
                    isCurrent ? `${t.activeBg} ring-2 ${t.activeRing}` :
                    isCompleted ? 'bg-green-50' :
                    isAccessible ? 'hover:bg-gray-50' : 'opacity-40 cursor-not-allowed'
                  }`}
                  onClick={() => isAccessible && onActivityClick(activity)}
                  disabled={!isAccessible}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    isCompleted ? 'bg-green-500 text-white shadow-md' :
                    isCurrent ? `${t.completedBg} text-white shadow-lg scale-110` :
                    isAccessible ? 'bg-gray-100 text-gray-500' : 'bg-gray-100 text-gray-300'
                  }`}>
                    {isCompleted ? <CheckCircle className="w-5 h-5" /> : !isAccessible ? <Lock className="w-4 h-4" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm font-medium truncate block ${isCurrent ? t.accentText : 'text-gray-900'}`}>{ACTIVITY_LABELS[activity.type] || activity.label}</span>
                    <span className="text-xs text-gray-400">{activity.duration_minutes} min</span>
                  </div>
                  {isCurrent && !isCompleted && <div className="w-2 h-2 rounded-full animate-pulse shrink-0" style={{ background: t.accent }} />}
                </button>
              </div>
            );
          })}
        </div>
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
        <h3 className="text-xl font-bold text-gray-900 mb-6">{q.question_text}</h3>
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

// ═══════ VOCABULARY MODULE (iSmart-style with Record & Check) ═══════
function VocabularyModule({ activity, onComplete, onSkip }) {
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState([]);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [recording, setRecording] = useState(false);
  const [pronResult, setPronResult] = useState(null);
  const [pronLoading, setPronLoading] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const words = activity?.words || [];
  const w = words[idx];

  const speakWord = (text) => { const u = new SpeechSynthesisUtterance(text); u.lang = 'en-US'; u.rate = 0.8; speechSynthesis.speak(u); };

  const check = () => {
    const ok = input.toLowerCase().trim() === w.word.toLowerCase();
    setFeedback(ok ? 'correct' : 'wrong');
    if (ok && !done.includes(w.word_id)) setDone([...done, w.word_id]);
  };

  const next = () => {
    setFeedback(null); setInput(''); setPronResult(null);
    if (idx < words.length - 1) setIdx(idx + 1);
    else onComplete(Math.round((done.length / words.length) * 100));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await checkPronunciation(blob);
      };
      mediaRecorder.start();
      setRecording(true);
      setPronResult(null);
    } catch {
      toast.error('Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const checkPronunciation = async (blob) => {
    setPronLoading(true);
    try {
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');
      formData.append('target_word', w.word);
      if (w.example_sentence) formData.append('target_sentence', w.example_sentence);
      const res = await fetch(`${API_URL}/api/unified/pronunciation/check`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setPronResult(data);
      if (data.is_correct && !done.includes(w.word_id)) setDone(prev => [...prev, w.word_id]);
    } catch {
      toast.error('Pronunciation check failed. Try again.');
    } finally {
      setPronLoading(false);
    }
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

      <div className="flex gap-5">
        {/* Word sidebar */}
        <div className="w-48 bg-white rounded-2xl border border-gray-100 p-3 hidden md:block shadow-sm">
          <h4 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider px-1">Words</h4>
          {words.map((word, i) => (
            <button key={word.word_id} onClick={() => { if (done.includes(word.word_id) || i === idx) { setIdx(i); setFeedback(null); setInput(''); setPronResult(null); } }}
              className={`w-full flex items-center gap-2 py-2 px-2.5 text-sm rounded-lg mb-1 transition-all text-left ${
                i === idx ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200' :
                done.includes(word.word_id) ? 'text-green-600 hover:bg-green-50' : 'text-gray-400'
              }`}>
              {done.includes(word.word_id) ? <CheckCircle className="w-4 h-4 text-green-500 shrink-0" /> :
               i === idx ? <div className="w-4 h-4 rounded-full bg-blue-500 shrink-0" /> :
               <div className="w-4 h-4 rounded-full border-2 border-gray-300 shrink-0" />}
              <span className="truncate">{word.word}</span>
            </button>
          ))}
        </div>

        {/* Main card - iSmart style */}
        <div className="flex-1 space-y-4">
          <Card className="p-6 bg-white shadow-sm">
            {/* Word display with image area */}
            <div className="flex flex-col md:flex-row gap-6 items-center mb-6">
              <div className="w-36 h-36 bg-gradient-to-br from-sky-100 to-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 shrink-0">
                <span className="text-5xl">{w.image_emoji || '📖'}</span>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-bold text-gray-900 mb-1" data-testid="current-word">{w.word}</h2>
                <button className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 mb-2 text-base" onClick={() => speakWord(w.word)}>
                  <Volume2 className="w-5 h-5" /><span className="font-medium">{w.ipa}</span>
                </button>
                <p className="text-gray-600 text-sm">{w.definition}</p>
              </div>
            </div>

            {/* Example sentence */}
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4 mb-5">
              <div className="flex-1">
                <p className="text-gray-700 italic text-sm">"{w.example_sentence}"</p>
              </div>
              <button className="shrink-0 w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-colors" onClick={() => speakWord(w.example_sentence)} data-testid="vocab-listen-sentence-btn">
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            {/* Type the word */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 block">Re-enter the vocabulary:</label>
              <div className="flex gap-2 items-center">
                <input type="text" value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !feedback && input.trim() && check()}
                  className={`flex-1 px-4 py-3 text-lg border-2 rounded-xl focus:outline-none transition-colors ${
                    feedback === 'correct' ? 'border-green-500 bg-green-50' :
                    feedback === 'wrong' ? 'border-red-500 bg-red-50' :
                    'border-gray-200 focus:border-blue-500'
                  }`}
                  placeholder="Type here..." disabled={!!feedback} autoFocus data-testid="vocab-input" />
                {!feedback && <Button onClick={check} disabled={!input.trim()} className="h-12 px-5" data-testid="vocab-check-btn">Check</Button>}
              </div>
              {feedback && <div className={`text-sm font-semibold ${feedback === 'correct' ? 'text-green-600' : 'text-red-600'}`}>{feedback === 'correct' ? 'Correct!' : `The answer is: ${w.word}`}</div>}
            </div>
          </Card>

          {/* Record & Check card */}
          <Card className="p-5 bg-white shadow-sm" data-testid="vocab-record-card">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-gray-700">Pronunciation Check</h4>
              <span className="text-xs text-gray-400">Say the word clearly</span>
            </div>

            <div className="flex flex-col items-center gap-4">
              {/* Record button */}
              <button
                onClick={recording ? stopRecording : startRecording}
                disabled={pronLoading}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg ${
                  recording ? 'bg-red-500 hover:bg-red-600 animate-pulse scale-110' :
                  pronLoading ? 'bg-gray-300 cursor-wait' :
                  'bg-blue-500 hover:bg-blue-600 hover:scale-105'
                } text-white`}
                data-testid="vocab-record-btn"
              >
                {pronLoading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /> :
                 recording ? <Square className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </button>
              <span className={`text-sm font-medium ${recording ? 'text-red-600' : 'text-gray-500'}`}>
                {pronLoading ? 'Checking...' : recording ? 'Recording... Click to stop' : 'Tap to record'}
              </span>

              {/* Pronunciation result */}
              {pronResult && (
                <div className={`w-full p-4 rounded-xl text-center ${pronResult.is_correct ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`} data-testid="vocab-pron-result">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    {pronResult.is_correct ? <CheckCircle className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
                    <span className={`font-bold ${pronResult.is_correct ? 'text-green-700' : 'text-red-700'}`}>{pronResult.feedback}</span>
                  </div>
                  <div className="flex items-center justify-center gap-4 mt-2">
                    <div className="text-center">
                      <span className="text-2xl font-bold" style={{ color: pronResult.similarity_score >= 70 ? '#16a34a' : '#dc2626' }}>{pronResult.similarity_score}%</span>
                      <p className="text-xs text-gray-500">Accuracy</p>
                    </div>
                    {pronResult.transcribed_text && (
                      <div className="text-center">
                        <span className="text-sm text-gray-700 font-medium">"{pronResult.transcribed_text}"</span>
                        <p className="text-xs text-gray-500">What we heard</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Next button */}
          {feedback && (
            <div className="flex justify-end">
              <Button onClick={next} className="px-6" data-testid="vocab-next-btn">{idx < words.length - 1 ? 'Next Word' : 'Complete'} <ChevronRight className="w-4 h-4 ml-1" /></Button>
            </div>
          )}
        </div>
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
  const questions = activity?.comprehension_questions || activity?.questions || [];
  const passageText = activity?.passage_text || activity?.passage || '';
  const q = questions[currentQ];

  const highlightText = (text) => {
    const words = activity?.highlighted_words;
    if (!words?.length) return text;
    let result = text;
    words.forEach(word => {
      const regex = new RegExp(`\\b(${word})\\b`, 'gi');
      result = result.replace(regex, `<mark class="bg-yellow-200 px-0.5 rounded">$1</mark>`);
    });
    return result;
  };

  const checkAnswer = (answer, correctAnswer) => {
    if (Array.isArray(correctAnswer)) return correctAnswer.some(a => a.toLowerCase().trim() === answer.toLowerCase().trim());
    return answer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
  };

  const handleAnswer = (answer) => {
    if (showFeedback) return;
    setSelectedAnswer(answer);
    setShowFeedback(true);
    if (checkAnswer(answer, q.correct_answer)) setCorrect(c => c + 1);
  };

  const handleNext = () => {
    setSelectedAnswer(null); setShowFeedback(false);
    if (currentQ < questions.length - 1) { setCurrentQ(i => i + 1); }
    else onComplete(Math.round((correct / questions.length) * 100));
  };

  const isCorrectOption = (option) => {
    if (Array.isArray(q.correct_answer)) return q.correct_answer.some(a => a.toLowerCase().trim() === option.toLowerCase().trim());
    return option === q.correct_answer;
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
          <p className="text-gray-800 leading-relaxed" dangerouslySetInnerHTML={{ __html: highlightText(passageText) }} />
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
              const optionIsCorrect = isCorrectOption(option);
              let cls = 'border-gray-200 hover:border-blue-300';
              if (showFeedback) {
                if (optionIsCorrect) cls = 'border-green-500 bg-green-50';
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

  // Normalize examples: handle both [{correct, incorrect}] and plain string arrays
  const normalizeExamples = (examples) => {
    if (!examples?.length) return [];
    if (typeof examples[0] === 'string') {
      return examples.map(ex => ({ correct: ex, incorrect: null }));
    }
    return examples;
  };

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
          <div className="text-center mb-6">
            <div className="inline-block bg-violet-100 text-violet-800 font-mono text-lg px-6 py-3 rounded-xl font-bold">
              {rule.pattern || activity?.pattern_highlight || ''}
            </div>
          </div>

          {/* Rule */}
          <div className="bg-blue-50 rounded-xl p-5 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{rule.rule_text || rule.title}</h3>
            <p className="text-sm text-gray-600 mb-2">{rule.explanation}</p>
            <code className="text-sm text-blue-700 bg-blue-100 px-2 py-1 rounded">{rule.pattern}</code>
          </div>

          {/* Examples */}
          <div className="space-y-3 mb-6">
            {normalizeExamples(rule.examples).map((ex, i) => (
              <div key={i} className={ex.incorrect ? 'grid grid-cols-2 gap-3' : ''}>
                <div className="flex items-center gap-2 bg-green-50 p-3 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                  <span className="text-sm font-medium text-green-800">{ex.correct}</span>
                </div>
                {ex.incorrect && (
                  <div className="flex items-center gap-2 bg-red-50 p-3 rounded-xl">
                    <X className="w-5 h-5 text-red-500 shrink-0" />
                    <span className="text-sm font-medium text-red-800 line-through">{ex.incorrect}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

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
    const correct = Array.isArray(item.correct_answer) ? item.correct_answer.includes(option) : option === item.correct_answer;
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
              const isCorrectOption = Array.isArray(item.correct_answer) ? item.correct_answer.includes(option) : option === item.correct_answer;
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
function ListeningActivity({ activity, onComplete, onSkip }) {
  const [showTranscript, setShowTranscript] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [phase, setPhase] = useState('listen'); // listen -> questions
  const questions = activity?.questions || [];
  const transcript = activity?.transcript || activity?.audio_script || '';
  const q = questions[currentQ];

  const speakText = (text) => { const u = new SpeechSynthesisUtterance(text); u.lang='en-US'; u.rate=0.85; speechSynthesis.speak(u); };

  const checkAnswer = (answer, correctAnswer) => {
    if (Array.isArray(correctAnswer)) return correctAnswer.some(a => a.toLowerCase().trim() === answer.toLowerCase().trim());
    return answer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
  };

  const handleAnswer = (answer) => {
    if (showFeedback) return;
    setSelectedAnswer(answer);
    setShowFeedback(true);
    if (checkAnswer(answer, q.correct_answer)) setCorrect(c => c + 1);
  };

  const handleNext = () => {
    setSelectedAnswer(null); setShowFeedback(false);
    if (currentQ < questions.length - 1) setCurrentQ(i => i + 1);
    else onComplete(Math.round((correct / questions.length) * 100));
  };

  const isCorrectOption = (option) => {
    if (Array.isArray(q.correct_answer)) return q.correct_answer.some(a => a.toLowerCase().trim() === option.toLowerCase().trim());
    return option === q.correct_answer;
  };

  return (
    <div data-testid="listening-activity">
      <div className="flex items-center justify-between mb-4">
        <Badge className="bg-cyan-100 text-cyan-700 border-0"><Headphones className="w-3 h-3 mr-1" /> Listening</Badge>
        <SkipButton onSkip={onSkip} />
      </div>

      {phase === 'listen' && (
        <Card className="p-8 text-center max-w-xl mx-auto">
          <div className="w-24 h-24 bg-cyan-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <Headphones className="w-12 h-12 text-cyan-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Listen carefully</h3>
          <p className="text-gray-600 mb-6 text-sm">Click the play button to hear the audio. You can listen multiple times.</p>
          <Button className="bg-cyan-600 hover:bg-cyan-700 mb-4" onClick={() => speakText(transcript)} data-testid="listening-play-btn">
            <Play className="w-5 h-5 mr-2" /> Play Audio
          </Button>
          <div>
            <button className="text-sm text-gray-500 underline" onClick={() => setShowTranscript(!showTranscript)}>
              {showTranscript ? 'Hide' : 'Show'} transcript
            </button>
            {showTranscript && (
              <div className="mt-3 bg-gray-50 rounded-xl p-4 text-left">
                <p className="text-sm text-gray-700">{transcript}</p>
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
              const optionIsCorrect = isCorrectOption(option);
              let cls = 'border-gray-200 hover:border-cyan-300';
              if (showFeedback) {
                if (optionIsCorrect) cls = 'border-green-500 bg-green-50';
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
function ProductionActivity({ activity, onComplete, onSkip }) {
  const [response, setResponse] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const criteria = activity?.evaluation_criteria || activity?.rubric || [];
  const exampleResponse = activity?.example_response || activity?.example_answer || '';

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
        <SkipButton onSkip={onSkip} />
      </div>

      <Card className="p-6 max-w-2xl mx-auto">
        <h3 className="text-lg font-bold text-gray-900 mb-4">{activity?.prompt || 'Practice task'}</h3>

        {criteria.length > 0 && (
          <div className="bg-gray-50 rounded-xl p-4 mb-5">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">What to include</h4>
            <ul className="space-y-1">
              {criteria.map((c, i) => (
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
              {exampleResponse && (
                <div className="bg-white rounded-lg p-3 border border-green-200">
                  <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Example response</h5>
                  <p className="text-sm text-gray-700 italic">"{exampleResponse}"</p>
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
function ExitTicket({ activity, onComplete, onSkip }) {
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
    questions.forEach(q => {
      const userAns = answers[q.question_id]?.toLowerCase().trim();
      if (Array.isArray(q.correct_answer)) {
        if (q.correct_answer.some(a => a.toLowerCase().trim() === userAns)) c++;
      } else {
        if (userAns === q.correct_answer.toLowerCase().trim()) c++;
      }
    });
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
            const isCorrect = Array.isArray(q.correct_answer)
              ? q.correct_answer.some(a => a.toLowerCase().trim() === userAnswer.toLowerCase().trim())
              : userAnswer.toLowerCase().trim() === q.correct_answer.toLowerCase().trim();
            const displayCorrect = Array.isArray(q.correct_answer) ? q.correct_answer.join(' / ') : q.correct_answer;
            return (
              <div key={q.question_id} className={`p-3 rounded-lg text-sm ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                <p className="font-medium text-gray-800">{i + 1}. {q.question_text}</p>
                <p className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                  Your answer: {userAnswer} {isCorrect ? <CheckCircle className="inline w-4 h-4" /> : <span> (Correct: {displayCorrect})</span>}
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
  const checkCorrect = (ans, correctAns) => {
    if (!ans) return false;
    if (Array.isArray(correctAns)) return correctAns.some(a => a.toLowerCase().trim() === ans.toLowerCase().trim());
    return ans.toLowerCase().trim() === correctAns.toLowerCase().trim();
  };
  const isCurrentCorrect = checkCorrect(currentAnswer, q.correct_answer);

  return (
    <div className="max-w-2xl mx-auto" data-testid="exit-ticket">
      <div className="flex items-center justify-between mb-4">
        <Badge className="bg-amber-100 text-amber-700 border-0"><CheckCircle className="w-3 h-3 mr-1" /> Exit Quiz</Badge>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{idx + 1} / {questions.length}</span>
          <SkipButton onSkip={onSkip} />
        </div>
      </div>
      <Progress value={(idx / questions.length) * 100} className="mb-6" />
      <Card className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-5">{q.question_text}</h3>
        {q.question_type === 'multiple_choice' && (
          <div className="space-y-2.5">
            {q.options?.map(option => {
              const isSelected = currentAnswer === option;
              const isCorrectOption = Array.isArray(q.correct_answer) ? q.correct_answer.includes(option) : option === q.correct_answer;
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
              <p className="text-sm text-red-600">Correct answer: <strong>{Array.isArray(q.correct_answer) ? q.correct_answer.join(' / ') : q.correct_answer}</strong></p>
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
  const [activityScores, setActivityScores] = useState({});
  const [lessonSummaryData, setLessonSummaryData] = useState({ words: [], grammarRules: [] });
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(false);

  useEffect(() => { loadLesson(); }, [lessonId]);

  const loadLesson = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/unified/lessons/${lessonId}`);
      const data = await res.json();
      setLesson(data);
      const first = data.activity_flow?.[0];
      if (first) { setCurrentActivityType(first.type); await loadActivityData(first.type); }
    } catch (error) { console.error('Error loading lesson:', error); } finally { setLoading(false); }
  };

  const loadActivityData = async (activityType) => {
    try {
      setActivityLoading(true);
      const res = await fetch(`${API_URL}/api/unified/lessons/${lessonId}/activity/${activityType}`);
      const data = res.ok ? await res.json() : null;
      setCurrentActivityData(data);
      // Cache data for lesson summary
      if (data && activityType === 'vocabulary' && data.words?.length) {
        setLessonSummaryData(prev => ({ ...prev, words: data.words }));
      }
      if (data && activityType === 'grammar_focus' && data.rules?.length) {
        setLessonSummaryData(prev => ({ ...prev, grammarRules: data.rules }));
      }
    } catch { setCurrentActivityData(null); } finally { setActivityLoading(false); }
  };

  const handleActivityComplete = useCallback(async (score, crownsOrPassed) => {
    if (!completedActivities.includes(currentActivityType)) {
      setCompletedActivities(prev => [...prev, currentActivityType]);
    }
    if (typeof score === 'number') {
      setActivityScores(prev => ({ ...prev, [currentActivityType]: score }));
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
    const nextActivity = activities[currentIndex + 1];
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
        return currentActivityData ? <RetrievalWarmup activity={currentActivityData} onComplete={handleActivityComplete} onSkip={handleActivitySkip} /> :
          <PlaceholderActivity type={currentActivityType} onComplete={handleActivityComplete} onSkip={handleActivitySkip} isSkippable />;
      case 'vocabulary':
        return currentActivityData ? <VocabularyModule activity={currentActivityData} onComplete={handleActivityComplete} onSkip={handleActivitySkip} /> :
          <PlaceholderActivity type={currentActivityType} onComplete={handleActivityComplete} onSkip={handleActivitySkip} isSkippable />;
      case 'micro_game_vocab':
        return currentActivityData ? <MatchingGame activity={currentActivityData} onComplete={handleActivityComplete} onSkip={handleActivitySkip} /> :
          <PlaceholderActivity type={currentActivityType} onComplete={handleActivityComplete} onSkip={handleActivitySkip} isSkippable />;
      case 'micro_reading':
        return currentActivityData ? <MicroReading activity={currentActivityData} onComplete={handleActivityComplete} onSkip={handleActivitySkip} /> :
          <PlaceholderActivity type={currentActivityType} onComplete={handleActivityComplete} onSkip={handleActivitySkip} isSkippable />;
      case 'grammar_focus':
        return currentActivityData ? <GrammarFocus activity={currentActivityData} onComplete={handleActivityComplete} onSkip={handleActivitySkip} /> :
          <PlaceholderActivity type={currentActivityType} onComplete={handleActivityComplete} onSkip={handleActivitySkip} isSkippable />;
      case 'micro_game_grammar':
        return currentActivityData ? <GrammarGame activity={currentActivityData} onComplete={handleActivityComplete} onSkip={handleActivitySkip} /> :
          <PlaceholderActivity type={currentActivityType} onComplete={handleActivityComplete} onSkip={handleActivitySkip} isSkippable />;
      case 'listening':
        return currentActivityData ? <ListeningActivity activity={currentActivityData} onComplete={handleActivityComplete} onSkip={handleActivitySkip} /> :
          <PlaceholderActivity type={currentActivityType} onComplete={handleActivityComplete} onSkip={handleActivitySkip} isSkippable />;
      case 'production':
        return currentActivityData ? <ProductionActivity activity={currentActivityData} onComplete={handleActivityComplete} onSkip={handleActivitySkip} /> :
          <PlaceholderActivity type={currentActivityType} onComplete={handleActivityComplete} onSkip={handleActivitySkip} isSkippable />;
      case 'exit_ticket':
        return currentActivityData ? <ExitTicket activity={currentActivityData} onComplete={(score) => handleActivityComplete(score)} onSkip={handleActivitySkip} /> :
          <PlaceholderActivity type={currentActivityType} onComplete={handleActivityComplete} onSkip={handleActivitySkip} isSkippable />;
      case 'auto_review':
        return <LessonSummary
          lesson={lesson}
          activityScores={activityScores}
          summaryData={lessonSummaryData}
          completedActivities={completedActivities}
          onFinish={() => handleActivityComplete(100)}
        />;
      default:
        return <PlaceholderActivity type={currentActivityType} onComplete={handleActivityComplete} onSkip={handleActivitySkip} isSkippable={activity?.is_skippable} />;
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" /></div>;
  if (!lesson) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-600">Lesson not found</p></div>;

  const totalActivities = lesson.activity_flow?.length || 0;
  const progressPercent = Math.round((completedActivities.length / totalActivities) * 100);
  const theme = getTheme(lesson.stage_id);

  return (
    <div className={`min-h-screen bg-gradient-to-b ${theme.bg}`} data-testid="unified-lesson-page">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b sticky top-0 z-40">
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
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: theme.accentLight }}>
                <Star className="w-3.5 h-3.5" style={{ color: theme.accent }} />
                <span className="text-xs font-semibold" style={{ color: theme.accent }}>{lesson.points_reward} pts</span>
              </div>
              <div className="w-28"><Progress value={progressPercent} /></div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <LessonPath activities={lesson.activity_flow || []} currentActivity={currentActivityType} completedActivities={completedActivities} onActivityClick={handleActivityClick} theme={theme} />
          </div>
          <div className="lg:col-span-3">{renderActivity()}</div>
        </div>
      </div>
    </div>
  );
}

// ═══════ LESSON SUMMARY ("What did you learn?") ═══════
function LessonSummary({ lesson, activityScores, summaryData, completedActivities, onFinish }) {
  const words = summaryData?.words || [];
  const grammarRules = summaryData?.grammarRules || [];
  const totalActivities = (lesson?.activity_flow || []).filter(a => a.type !== 'auto_review').length;
  const completedCount = completedActivities.filter(a => a !== 'auto_review').length;

  const scores = Object.values(activityScores).filter(s => typeof s === 'number');
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  const getMotivation = () => {
    if (avgScore >= 90) return { text: 'Amazing work!', emoji: 'trophy', color: 'text-amber-600', bg: 'bg-amber-50' };
    if (avgScore >= 70) return { text: 'Good job!', emoji: 'star', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (avgScore >= 50) return { text: 'Nice effort!', emoji: 'thumbsup', color: 'text-green-600', bg: 'bg-green-50' };
    return { text: 'Keep practicing!', emoji: 'muscle', color: 'text-purple-600', bg: 'bg-purple-50' };
  };
  const motivation = getMotivation();

  const scoreLabels = {
    'retrieval_warmup': 'Warm-up', 'micro_game_vocab': 'Vocab Game', 'micro_reading': 'Reading',
    'micro_game_grammar': 'Grammar Game', 'listening': 'Listening', 'production': 'Speaking', 'exit_ticket': 'Exit Quiz'
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5" data-testid="lesson-summary">
      {/* Header */}
      <Card className={`p-8 text-center ${motivation.bg} border-0`}>
        <div className="w-20 h-20 bg-white/80 rounded-full mx-auto mb-4 flex items-center justify-center shadow-sm">
          <Trophy className={`w-10 h-10 ${motivation.color}`} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Lesson Complete!</h2>
        <p className={`text-lg font-semibold ${motivation.color} mb-1`}>{motivation.text}</p>
        <p className="text-sm text-gray-500">{completedCount}/{totalActivities} activities completed</p>
        {avgScore > 0 && (
          <div className="mt-3 inline-flex items-center gap-2 bg-white/60 px-4 py-2 rounded-full">
            <Star className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-bold text-gray-700">Average Score: {avgScore}%</span>
          </div>
        )}
      </Card>

      {/* Words Learned */}
      {words.length > 0 && (
        <Card className="p-5" data-testid="summary-words">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5" /> Words You Learned
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {words.map((w, i) => (
              <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2.5">
                <span className="text-lg">{w.image_emoji || w.emoji}</span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{w.word}</p>
                  <p className="text-xs text-gray-400 truncate">{w.ipa}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Grammar Learned */}
      {grammarRules.length > 0 && (
        <Card className="p-5" data-testid="summary-grammar">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Edit3 className="w-3.5 h-3.5" /> Grammar Patterns
          </h3>
          <div className="space-y-2">
            {grammarRules.map((r, i) => (
              <div key={i} className="flex items-center gap-3 bg-violet-50 rounded-lg px-4 py-3">
                <code className="text-sm font-mono font-bold text-violet-700 bg-violet-100 px-2 py-0.5 rounded">{r.pattern}</code>
                <span className="text-sm text-gray-600">{r.title || r.rule_text}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Activity Scores */}
      {scores.length > 0 && (
        <Card className="p-5" data-testid="summary-scores">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Zap className="w-3.5 h-3.5" /> Your Scores
          </h3>
          <div className="space-y-2">
            {Object.entries(activityScores).map(([type, score]) => {
              const label = scoreLabels[type] || type;
              const barColor = score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-400';
              const Icon = ACTIVITY_ICONS[type] || Play;
              return (
                <div key={type} className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="text-sm text-gray-600 w-28 shrink-0">{label}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${score}%` }} />
                  </div>
                  <span className={`text-sm font-bold w-12 text-right ${score >= 80 ? 'text-green-600' : score >= 50 ? 'text-amber-600' : 'text-red-500'}`}>{score}%</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Finish Button */}
      <div className="text-center pt-2">
        <Button size="lg" onClick={onFinish} className="px-8" data-testid="lesson-summary-finish-btn">
          <Star className="w-5 h-5 mr-2" /> Finish Lesson
        </Button>
        <p className="text-xs text-gray-400 mt-2">Your vocabulary has been added to your review queue.</p>
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
