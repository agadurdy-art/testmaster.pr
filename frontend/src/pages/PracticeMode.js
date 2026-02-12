import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { 
  ArrowLeft, CheckCircle, XCircle, ChevronRight,
  BookOpen, Headphones, Play, Pause,
  Loader2, Lightbulb, RotateCcw, Zap
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const SKILLS = {
  reading: { name: 'Reading', icon: BookOpen, color: 'from-sky-500 to-blue-500', accent: 'text-sky-700', bg: 'bg-sky-50' },
  listening: { name: 'Listening', icon: Headphones, color: 'from-amber-500 to-orange-500', accent: 'text-amber-700', bg: 'bg-amber-50' },
};

function normalizeAnswer(val) {
  if (!val) return '';
  return val.toString().trim().toLowerCase();
}

function extractOptionValue(opt) {
  if (!opt) return opt;
  const match = opt.match(/^([A-D])[\s\):.]/i);
  return match ? match[1].toUpperCase() : opt;
}

export default function PracticeMode({ user }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const skill = searchParams.get('skill') || 'reading';

  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [setStats, setSetStats] = useState({ correct: 0, total: 0 });
  const [setDone, setSetDone] = useState(false);
  const [totalSets, setTotalSets] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [slideDir, setSlideDir] = useState('');
  const [textAnswer, setTextAnswer] = useState('');

  // Audio
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const audioRef = useRef(null);

  const SkillIcon = SKILLS[skill]?.icon || BookOpen;

  // Redirect writing/speaking to their own pages
  useEffect(() => {
    if (skill === 'speaking') { navigate('/question-bank/speaking'); return; }
    if (skill === 'writing') { navigate('/writing-practice'); return; }
  }, [skill, navigate]);

  const loadNewSet = useCallback(async () => {
    setLoading(true);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setTextAnswer('');
    setRevealed(false);
    setSetDone(false);
    setSetStats({ correct: 0, total: 0 });
    setAudioUrl(null);
    if (audioRef.current) { audioRef.current.pause(); }

    try {
      const res = await fetch(`${API_URL}/api/question-bank/practice/random?skill=${skill}&count=3`);
      const data = await res.json();
      if (data.success && data.questions?.length > 0) {
        setQuestions(data.questions);
      }
    } catch (err) {
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  }, [skill]);

  useEffect(() => { loadNewSet(); }, [loadNewSet]);

  // Reset audio on question change
  useEffect(() => {
    setAudioUrl(null);
    setIsPlayingAudio(false);
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
  }, [currentIndex]);

  const generateAudio = async (text) => {
    if (!text) return;
    setAudioLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/vocab-grammar/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.substring(0, 500), voice: 'alloy', speed: 0.9 })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.audio) {
          const byteChars = atob(data.audio);
          const byteNumbers = new Array(byteChars.length);
          for (let i = 0; i < byteChars.length; i++) {
            byteNumbers[i] = byteChars.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'audio/mpeg' });
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
          return url;
        }
      }
    } catch {
      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(text.substring(0, 200));
        u.rate = 0.9; u.lang = 'en-US';
        window.speechSynthesis.speak(u);
      }
    } finally { setAudioLoading(false); }
  };

  const playAudio = async () => {
    const q = questions[currentIndex];
    if (!q?.audio_transcript) return;
    if (isPlayingAudio && audioRef.current) { audioRef.current.pause(); setIsPlayingAudio(false); return; }
    if (!audioUrl) {
      const url = await generateAudio(q.audio_transcript);
      if (url && audioRef.current) { audioRef.current.src = url; audioRef.current.play(); setIsPlayingAudio(true); }
    } else if (audioRef.current) { audioRef.current.currentTime = 0; audioRef.current.play(); setIsPlayingAudio(true); }
  };

  const handleSelect = (answer) => {
    if (revealed) return;
    setSelectedAnswer(answer);
  };

  const handleConfirm = () => {
    if (revealed) return;
    const answer = (questions[currentIndex]?.options?.length > 0) ? selectedAnswer : textAnswer;
    if (!answer) return;
    setRevealed(true);
    const correctVal = questions[currentIndex]?.correct;
    const isCorrect = normalizeAnswer(answer) === normalizeAnswer(correctVal);
    setSetStats(prev => ({ correct: prev.correct + (isCorrect ? 1 : 0), total: prev.total + 1 }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setSlideDir('slide-out-left');
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setTextAnswer('');
        setRevealed(false);
        setSlideDir('slide-in-right');
        setTimeout(() => setSlideDir(''), 300);
      }, 200);
    } else {
      setSetDone(true);
      setTotalSets(prev => prev + 1);
      setTotalCorrect(prev => prev + setStats.correct);
      setTotalAnswered(prev => prev + setStats.total);
    }
  };

  const q = questions[currentIndex];
  const hasOptions = q?.options?.length > 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center" data-testid="practice-loading">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-amber-500 mx-auto mb-3" />
          <p className="text-amber-700/60 text-sm">Loading questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex flex-col" data-testid="quick-practice">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-amber-200/60 bg-white/60 backdrop-blur-sm">
        <button onClick={() => navigate('/question-bank')} className="text-amber-800/60 hover:text-amber-900 flex items-center gap-1.5 text-sm" data-testid="back-to-qb">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-2">
          <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${SKILLS[skill]?.color} text-white text-xs font-semibold flex items-center gap-1.5`}>
            <SkillIcon className="w-3.5 h-3.5" />
            {SKILLS[skill]?.name}
          </div>
          {totalSets > 0 && (
            <span className="text-amber-700/50 text-xs">{totalCorrect}/{totalAnswered} total</span>
          )}
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">

          {/* Set Done Screen */}
          {setDone ? (
            <div className="text-center" data-testid="set-complete">
              <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-200">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-amber-900 mb-2">Set Complete!</h2>
              <p className="text-amber-700/60 text-sm mb-6">
                {setStats.correct}/{setStats.total} correct this round
              </p>

              <div className="flex justify-center gap-3 mb-8">
                {questions.map((qq, i) => (
                  <div key={i} className="w-16 h-16 rounded-xl bg-white border border-amber-200 shadow-sm flex flex-col items-center justify-center">
                    <span className="text-lg text-amber-900">{i + 1}</span>
                    <span className="text-[10px] text-amber-600/50">{qq.type?.split('-')[0]}</span>
                  </div>
                ))}
              </div>

              {totalSets > 0 && (
                <p className="text-amber-600/50 text-xs mb-6">
                  Session: {totalSets} sets - {totalCorrect}/{totalAnswered} overall ({totalAnswered > 0 ? Math.round((totalCorrect/totalAnswered)*100) : 0}%)
                </p>
              )}

              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => loadNewSet()}
                  className="w-full h-14 text-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl shadow-lg shadow-amber-200"
                  data-testid="next-set-btn"
                >
                  <Zap className="w-5 h-5 mr-2" /> Next Set
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/question-bank')}
                  className="text-amber-700/50 hover:text-amber-800"
                >
                  Done for now
                </Button>
              </div>
            </div>
          ) : q ? (
            /* Question Card */
            <div className={`transition-all duration-200 ${slideDir === 'slide-out-left' ? 'opacity-0 -translate-x-8' : slideDir === 'slide-in-right' ? 'opacity-100 translate-x-0' : ''}`}>

              {/* Progress dots */}
              <div className="flex items-center justify-center gap-2 mb-5">
                {questions.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === currentIndex ? 'w-8 bg-amber-500' :
                      i < currentIndex ? 'w-4 bg-amber-400/50' : 'w-4 bg-amber-300/30'
                    }`}
                  />
                ))}
              </div>

              {/* Card */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-amber-200/60 shadow-lg shadow-amber-100/50 overflow-hidden" data-testid="question-card">

                {/* Type badge + question number */}
                <div className="px-5 pt-4 pb-2 flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-600/50">
                    {q.type?.replace(/-/g, ' ')}
                  </span>
                  <span className="text-[11px] text-amber-500/40">{currentIndex + 1}/3</span>
                </div>

                {/* Audio Player for Listening */}
                {q.audio_transcript && (
                  <div className="mx-5 mb-3">
                    <audio ref={audioRef} onEnded={() => setIsPlayingAudio(false)} onPause={() => setIsPlayingAudio(false)} />
                    <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl p-3.5 flex items-center gap-3 border border-amber-200/50">
                      <button
                        onClick={playAudio}
                        disabled={audioLoading}
                        className="w-11 h-11 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 flex items-center justify-center shrink-0 transition-colors shadow-md shadow-amber-200"
                        data-testid="play-audio-btn"
                      >
                        {audioLoading ? <Loader2 className="w-5 h-5 text-white animate-spin" /> :
                         isPlayingAudio ? <Pause className="w-5 h-5 text-white" /> :
                         <Play className="w-5 h-5 text-white ml-0.5" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-amber-900 text-sm font-medium flex items-center gap-1.5">
                          <Headphones className="w-3.5 h-3.5" /> Listen to Audio
                        </p>
                        <p className="text-amber-600/50 text-xs truncate">
                          {isPlayingAudio ? 'Playing...' : 'Tap to play'}
                        </p>
                      </div>
                      {isPlayingAudio && (
                        <div className="flex items-end gap-[3px] h-5">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className="w-[3px] bg-amber-500/50 rounded-full animate-pulse"
                              style={{ height: `${8 + Math.random() * 12}px`, animationDelay: `${i * 0.15}s` }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Reading Passage */}
                {q.passage && (
                  <div className="mx-5 mb-3 max-h-40 overflow-y-auto">
                    <div className="bg-amber-50/70 rounded-2xl p-4 border border-amber-200/40">
                      {q.passage_title && <p className="text-amber-700/60 text-[11px] font-semibold uppercase tracking-wider mb-1.5">{q.passage_title}</p>}
                      <p className="text-amber-900/80 text-sm leading-relaxed">{q.passage}</p>
                    </div>
                  </div>
                )}

                {/* Question */}
                <div className="px-5 pb-3">
                  <h3 className="text-amber-950 text-base font-semibold leading-snug" data-testid="question-text">{q.text}</h3>
                </div>

                {/* Options or Text Input */}
                <div className="px-5 pb-5 space-y-2">
                  {hasOptions ? q.options.map((opt, idx) => {
                    const optVal = extractOptionValue(opt);
                    const isSelected = selectedAnswer === optVal;
                    const isCorrectOpt = normalizeAnswer(q.correct) === normalizeAnswer(optVal);

                    let optClass = 'bg-amber-50/50 border-amber-200/60 hover:bg-amber-100/70';
                    if (revealed) {
                      if (isCorrectOpt) optClass = 'bg-emerald-50 border-emerald-300';
                      else if (isSelected && !isCorrectOpt) optClass = 'bg-red-50 border-red-300';
                      else optClass = 'bg-gray-50 border-gray-200 opacity-50';
                    } else if (isSelected) {
                      optClass = 'bg-sky-50 border-sky-300 ring-1 ring-sky-300/50';
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelect(optVal)}
                        disabled={revealed}
                        className={`w-full p-3.5 text-left rounded-2xl border transition-all ${optClass}`}
                        data-testid={`option-${idx}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            revealed && isCorrectOpt ? 'bg-emerald-500 text-white' :
                            revealed && isSelected && !isCorrectOpt ? 'bg-red-400 text-white' :
                            isSelected ? 'bg-sky-500 text-white' :
                            'bg-amber-200/60 text-amber-700'
                          }`}>
                            {revealed && isCorrectOpt ? <CheckCircle className="w-4 h-4" /> :
                             revealed && isSelected && !isCorrectOpt ? <XCircle className="w-4 h-4" /> :
                             String.fromCharCode(65 + idx)}
                          </span>
                          <span className="text-amber-900/80 text-sm">{opt}</span>
                        </div>
                      </button>
                    );
                  }) : (
                    <input
                      type="text"
                      placeholder="Type your answer..."
                      value={textAnswer}
                      onChange={(e) => setTextAnswer(e.target.value)}
                      disabled={revealed}
                      className="w-full p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/60 text-amber-950 placeholder-amber-400/50 focus:border-sky-400 focus:ring-1 focus:ring-sky-300/50 outline-none text-sm"
                      data-testid="practice-answer-input"
                    />
                  )}
                </div>

                {/* Feedback (after reveal) */}
                {revealed && (
                  <div className="px-5 pb-5" data-testid="answer-feedback">
                    {normalizeAnswer(hasOptions ? selectedAnswer : textAnswer) === normalizeAnswer(q.correct) ? (
                      <div className="flex items-start gap-2.5 bg-emerald-50 rounded-2xl p-3.5 border border-emerald-200">
                        <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-emerald-700 text-sm font-semibold">Correct!</p>
                          {q.explanation && <p className="text-amber-700/60 text-xs mt-1">{q.explanation}</p>}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2.5 bg-red-50 rounded-2xl p-3.5 border border-red-200">
                        <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-red-600 text-sm font-semibold">Incorrect</p>
                          <p className="text-amber-700/60 text-xs mt-1">
                            Correct answer: <span className="text-emerald-600 font-medium">{q.correct}</span>
                          </p>
                          {q.explanation && <p className="text-amber-600/50 text-xs mt-1"><Lightbulb className="w-3 h-3 inline mr-1" />{q.explanation}</p>}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="mt-4">
                {!revealed ? (
                  <Button
                    onClick={handleConfirm}
                    disabled={hasOptions ? !selectedAnswer : !textAnswer}
                    className="w-full h-13 text-base bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl disabled:opacity-30 shadow-lg shadow-amber-200"
                    data-testid="confirm-answer-btn"
                  >
                    Confirm
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    className="w-full h-13 text-base bg-amber-900/10 hover:bg-amber-900/15 text-amber-900 rounded-2xl"
                    data-testid="next-question-btn"
                  >
                    {currentIndex < questions.length - 1 ? 'Next' : 'See Results'}
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center text-amber-700/50">
              <p>No questions available. Try again later.</p>
              <Button variant="ghost" onClick={loadNewSet} className="mt-3 text-amber-600">
                <RotateCcw className="w-4 h-4 mr-2" /> Retry
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
