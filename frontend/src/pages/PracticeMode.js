import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { 
  ArrowLeft, CheckCircle, XCircle, ChevronRight,
  BookOpen, Headphones, Play, Pause, Volume2,
  Loader2, Lightbulb, RotateCcw, Zap
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const SKILLS = {
  reading: { name: 'Reading', icon: BookOpen, color: 'from-blue-500 to-cyan-500', accent: 'text-blue-600', bg: 'bg-blue-50' },
  listening: { name: 'Listening', icon: Headphones, color: 'from-purple-500 to-indigo-500', accent: 'text-purple-600', bg: 'bg-purple-50' },
};

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
    if (skill === 'writing') { navigate('/writing-practice/task1'); return; }
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
        body: JSON.stringify({ text, voice: 'alloy', speed: 0.9 })
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        return url;
      }
    } catch {
      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(text);
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
    const isCorrect = answer === questions[currentIndex]?.correct;
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
      // Set complete
      setSetDone(true);
      setTotalSets(prev => prev + 1);
      setTotalCorrect(prev => prev + setStats.correct);
      setTotalAnswered(prev => prev + setStats.total);
    }
  };

  const handleNextSet = () => {
    loadNewSet();
  };

  const q = questions[currentIndex];
  const hasOptions = q?.options?.length > 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-white/60 mx-auto mb-3" />
          <p className="text-white/40 text-sm">Loading questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col" data-testid="quick-practice">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <button onClick={() => navigate('/question-bank')} className="text-white/60 hover:text-white flex items-center gap-1.5 text-sm" data-testid="back-to-qb">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-2">
          <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${SKILLS[skill]?.color} text-white text-xs font-semibold flex items-center gap-1.5`}>
            <SkillIcon className="w-3.5 h-3.5" />
            {SKILLS[skill]?.name}
          </div>
          {totalSets > 0 && (
            <span className="text-white/40 text-xs">{totalCorrect}/{totalAnswered} total</span>
          )}
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">

          {/* Set Done Screen */}
          {setDone ? (
            <div className="text-center" data-testid="set-complete">
              <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Set Complete!</h2>
              <p className="text-white/50 text-sm mb-6">
                {setStats.correct}/{setStats.total} correct this round
              </p>

              {/* Mini score cards */}
              <div className="flex justify-center gap-3 mb-8">
                {questions.map((qq, i) => {
                  const isCorrect = setStats.total > i; // simplified
                  return (
                    <div key={i} className="w-16 h-16 rounded-xl bg-white/10 flex flex-col items-center justify-center">
                      <span className="text-lg">{i + 1}</span>
                      <span className="text-[10px] text-white/40">{qq.type?.split('-')[0]}</span>
                    </div>
                  );
                })}
              </div>

              {totalSets > 0 && (
                <p className="text-white/30 text-xs mb-6">
                  Session: {totalSets} sets - {totalCorrect}/{totalAnswered} overall ({totalAnswered > 0 ? Math.round((totalCorrect/totalAnswered)*100) : 0}%)
                </p>
              )}

              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleNextSet}
                  className="w-full h-14 text-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-2xl"
                  data-testid="next-set-btn"
                >
                  <Zap className="w-5 h-5 mr-2" /> Next Set
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/question-bank')}
                  className="text-white/40 hover:text-white/70"
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
                      i === currentIndex ? 'w-8 bg-white' :
                      i < currentIndex ? 'w-4 bg-white/40' : 'w-4 bg-white/15'
                    }`}
                  />
                ))}
              </div>

              {/* Card */}
              <div className="bg-white/[0.07] backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden" data-testid="question-card">

                {/* Type badge + question number */}
                <div className="px-5 pt-4 pb-2 flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-white/30">
                    {q.type?.replace(/-/g, ' ')}
                  </span>
                  <span className="text-[11px] text-white/20">{currentIndex + 1}/3</span>
                </div>

                {/* Audio Player for Listening */}
                {q.audio_transcript && (
                  <div className="mx-5 mb-3">
                    <audio ref={audioRef} onEnded={() => setIsPlayingAudio(false)} onPause={() => setIsPlayingAudio(false)} />
                    <div className="bg-gradient-to-r from-purple-600/40 to-indigo-600/40 rounded-2xl p-3.5 flex items-center gap-3">
                      <button
                        onClick={playAudio}
                        disabled={audioLoading}
                        className="w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center shrink-0 transition-colors"
                        data-testid="play-audio-btn"
                      >
                        {audioLoading ? <Loader2 className="w-5 h-5 text-white animate-spin" /> :
                         isPlayingAudio ? <Pause className="w-5 h-5 text-white" /> :
                         <Play className="w-5 h-5 text-white ml-0.5" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium flex items-center gap-1.5">
                          <Headphones className="w-3.5 h-3.5" /> Listen
                        </p>
                        <p className="text-white/40 text-xs truncate">
                          {isPlayingAudio ? 'Playing...' : 'Tap to play'}
                        </p>
                      </div>
                      {isPlayingAudio && (
                        <div className="flex items-end gap-[3px] h-5">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className="w-[3px] bg-white/50 rounded-full animate-pulse"
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
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                      {q.passage_title && <p className="text-white/50 text-[11px] font-semibold uppercase tracking-wider mb-1.5">{q.passage_title}</p>}
                      <p className="text-white/70 text-sm leading-relaxed">{q.passage}</p>
                    </div>
                  </div>
                )}

                {/* Question */}
                <div className="px-5 pb-3">
                  <h3 className="text-white text-base font-semibold leading-snug" data-testid="question-text">{q.text}</h3>
                </div>

                {/* Options or Text Input */}
                <div className="px-5 pb-5 space-y-2">
                  {hasOptions ? q.options.map((opt, idx) => {
                    const optVal = (opt.match(/^[A-D]\)/) ? opt.charAt(0) : opt);
                    const isSelected = selectedAnswer === optVal;
                    const isCorrectOpt = q.correct === optVal;

                    let optClass = 'bg-white/[0.05] border-white/10 hover:bg-white/[0.1]';
                    if (revealed) {
                      if (isCorrectOpt) optClass = 'bg-emerald-500/20 border-emerald-400/40';
                      else if (isSelected && !isCorrectOpt) optClass = 'bg-red-500/20 border-red-400/40';
                      else optClass = 'bg-white/[0.03] border-white/5 opacity-50';
                    } else if (isSelected) {
                      optClass = 'bg-indigo-500/20 border-indigo-400/50 ring-1 ring-indigo-400/30';
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
                            revealed && isCorrectOpt ? 'bg-emerald-400 text-white' :
                            revealed && isSelected && !isCorrectOpt ? 'bg-red-400 text-white' :
                            isSelected ? 'bg-indigo-500 text-white' :
                            'bg-white/10 text-white/50'
                          }`}>
                            {revealed && isCorrectOpt ? <CheckCircle className="w-4 h-4" /> :
                             revealed && isSelected && !isCorrectOpt ? <XCircle className="w-4 h-4" /> :
                             String.fromCharCode(65 + idx)}
                          </span>
                          <span className="text-white/80 text-sm">{opt}</span>
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
                      className="w-full p-3.5 rounded-2xl bg-white/[0.05] border border-white/10 text-white placeholder-white/30 focus:border-indigo-400/50 focus:ring-1 focus:ring-indigo-400/30 outline-none text-sm"
                      data-testid="practice-answer-input"
                    />
                  )}
                </div>

                {/* Feedback (after reveal) */}
                {revealed && (
                  <div className="px-5 pb-5" data-testid="answer-feedback">
                    {(hasOptions ? selectedAnswer : textAnswer) === q.correct ? (
                      <div className="flex items-start gap-2.5 bg-emerald-500/10 rounded-2xl p-3.5 border border-emerald-400/20">
                        <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-emerald-400 text-sm font-semibold">Correct!</p>
                          {q.explanation && <p className="text-white/50 text-xs mt-1">{q.explanation}</p>}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2.5 bg-red-500/10 rounded-2xl p-3.5 border border-red-400/20">
                        <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-red-400 text-sm font-semibold">Incorrect</p>
                          <p className="text-white/50 text-xs mt-1">
                            Correct answer: <span className="text-emerald-400 font-medium">{q.correct}</span>
                          </p>
                          {q.explanation && <p className="text-white/40 text-xs mt-1"><Lightbulb className="w-3 h-3 inline mr-1" />{q.explanation}</p>}
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
                    className="w-full h-13 text-base bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-2xl disabled:opacity-30"
                    data-testid="confirm-answer-btn"
                  >
                    Confirm
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    className="w-full h-13 text-base bg-white/10 hover:bg-white/15 text-white rounded-2xl"
                    data-testid="next-question-btn"
                  >
                    {currentIndex < questions.length - 1 ? 'Next' : 'See Results'}
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center text-white/40">
              <p>No questions available. Try again later.</p>
              <Button variant="ghost" onClick={loadNewSet} className="mt-3 text-white/50">
                <RotateCcw className="w-4 h-4 mr-2" /> Retry
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
