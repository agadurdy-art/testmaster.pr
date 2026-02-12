import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { 
  ChevronLeft, ChevronRight, Send, CheckCircle, XCircle, 
  Star, Lightbulb, Volume2, Sparkles, PenTool
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function VocabularyProductionMode({ user }) {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [slides, setSlides] = useState([]);
  const [moduleTitle, setModuleTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [sentence, setSentence] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [results, setResults] = useState([]);
  const [completed, setCompleted] = useState(false);

  const words = slides.filter(s => s.category === 'Advanced Term');

  useEffect(() => { fetchData(); }, [moduleId]);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/api/vocabulary-engine/${moduleId}/slides`);
      if (res.ok) { const d = await res.json(); setSlides(d.slides); setModuleTitle(d.module_title); }
      else { toast.error('Failed to load vocabulary'); navigate('/advanced-mastery'); }
    } catch { toast.error('Connection error'); }
    finally { setLoading(false); }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) { window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.rate = 0.85; window.speechSynthesis.speak(u); }
  };

  const handleEvaluate = async () => {
    if (!sentence.trim()) { toast.error('Please write a sentence first'); return; }
    const word = words[currentWordIdx];
    setEvaluating(true); setFeedback(null);
    try {
      const res = await fetch(`${API_URL}/api/vocabulary-engine/evaluate-sentence`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: word.word, sentence: sentence.trim(), word_meaning: word.meaning, module_title: moduleTitle }),
      });
      if (res.ok) {
        const data = await res.json();
        setFeedback(data);
        setResults(p => [...p, { word: word.word, score: data.overall_score, correct: data.grammar_correct && data.word_usage_correct }]);
      } else toast.error('Evaluation failed');
    } catch { toast.error('Connection error'); }
    finally { setEvaluating(false); }
  };

  const goNextWord = () => {
    if (currentWordIdx < words.length - 1) { setCurrentWordIdx(p => p + 1); setSentence(''); setFeedback(null); }
    else setCompleted(true);
  };

  const handleFinish = async () => {
    if (user) { try { await fetch(`${API_URL}/api/vocabulary-engine/progress`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: user.id, module_id: moduleId, section: 'production', completed: true }) }); } catch {} }
    toast.success('Production Mode completed!');
    navigate('/advanced-mastery');
  };

  if (loading) return <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center" data-testid="production-mode-loading"><div className="animate-spin rounded-full h-8 w-8 border-[3px] border-gray-200 border-t-sky-500" /></div>;
  if (!words.length) return <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center"><p className="text-[#86868B]">No words available.</p></div>;

  if (completed) {
    const avg = results.length ? (results.reduce((a, r) => a + r.score, 0) / results.length).toFixed(1) : 0;
    const correctCount = results.filter(r => r.correct).length;
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-4" data-testid="production-complete-screen">
        <div className="w-full max-w-sm text-center">
          <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-sky-50 flex items-center justify-center"><Sparkles className="w-10 h-10 text-sky-500" /></div>
          <h2 className="text-[22px] font-bold text-[#1D1D1F] mb-1">Production Complete!</h2>
          <p className="text-[14px] text-[#86868B] mb-6">{moduleTitle}</p>
          <div className="bg-white rounded-[20px] p-6 mb-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div><p className="text-[32px] font-bold text-sky-500 tabular-nums" data-testid="production-avg-score">{avg}</p><p className="text-[12px] text-[#AEAEB2]">Avg. Score /5</p></div>
              <div><p className="text-[32px] font-bold text-green-500 tabular-nums">{correctCount}/{results.length}</p><p className="text-[12px] text-[#AEAEB2]">Correct Usage</p></div>
            </div>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {results.map((r, i) => <span key={i} className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${r.correct ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>{r.word}: {r.score}/5</span>)}
            </div>
          </div>
          <button onClick={handleFinish} className="w-full h-12 rounded-full bg-orange-500 shadow-[0_2px_10px_rgba(234,88,12,0.3)] text-[14px] font-semibold text-white" data-testid="finish-production-btn">Back to Course</button>
        </div>
      </div>
    );
  }

  const word = words[currentWordIdx];
  const prog = ((currentWordIdx + 1) / words.length) * 100;

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col" data-testid="vocabulary-production-mode">
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-xl border-b border-black/[0.04]">
        <div className="flex items-center justify-between px-4 py-3 max-w-3xl mx-auto">
          <button onClick={() => navigate('/advanced-mastery')} className="flex items-center gap-1.5 text-sm text-orange-500 font-medium" data-testid="back-from-production"><ChevronLeft className="w-4 h-4" /> Back</button>
          <p className="text-[15px] font-semibold text-[#1D1D1F]">AI Writing</p>
          <span className="text-[13px] text-[#86868B] tabular-nums" data-testid="production-counter">{currentWordIdx + 1}/{words.length}</span>
        </div>
        <div className="h-[3px] bg-black/[0.04]"><div className="h-full bg-sky-500 transition-all duration-300" style={{ width: `${prog}%` }} data-testid="production-progress-bar" /></div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-xl">
          {/* Word card */}
          <div className="bg-white rounded-[20px] p-5 mb-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <div className="flex items-start justify-between mb-3">
              <div>
                <Badge className="bg-sky-50 text-sky-600 border-sky-200 text-[11px] font-semibold mb-2">Target Word</Badge>
                <h2 className="text-[24px] font-bold text-[#1D1D1F]">{word.word}</h2>
                {word.ipa && <p className="text-[14px] text-[#AEAEB2] font-mono">{word.ipa}</p>}
              </div>
              <button onClick={() => speakText(word.word)} className="w-9 h-9 rounded-full bg-[#F5F5F7] flex items-center justify-center hover:bg-gray-200/60" data-testid="production-tts-btn"><Volume2 className="w-[18px] h-[18px] text-[#86868B]" /></button>
            </div>
            <p className="text-[14px] text-[#3A3A3C] mb-2">{word.meaning}</p>
            <div className="bg-[#F5F5F7] rounded-2xl p-3"><p className="text-[13px] text-[#636366] italic">"{word.example}"</p></div>
          </div>

          {/* Writing area */}
          <div className="mb-4">
            <p className="text-[13px] text-[#86868B] mb-2 flex items-center gap-1"><PenTool className="w-3.5 h-3.5" /> Write a sentence using "<span className="font-semibold text-sky-600">{word.word}</span>"</p>
            <Textarea value={sentence} onChange={(e) => setSentence(e.target.value)} placeholder={`Use "${word.word}" in a sentence...`}
              className="bg-white border-black/[0.06] text-[#1D1D1F] placeholder-[#AEAEB2] min-h-[100px] rounded-2xl text-[15px] focus:border-sky-400 focus:ring-sky-200 shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
              disabled={evaluating} data-testid="production-sentence-input" />
          </div>

          {!feedback && (
            <button onClick={handleEvaluate} disabled={evaluating || !sentence.trim()}
              className="w-full h-12 rounded-full bg-sky-500 hover:bg-sky-600 text-white text-[14px] font-semibold shadow-[0_2px_10px_rgba(14,165,233,0.3)] disabled:opacity-35 flex items-center justify-center gap-2 transition-colors"
              data-testid="evaluate-sentence-btn">
              {evaluating ? <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> Evaluating...</> : <><Send className="w-4 h-4" /> Evaluate with AI</>}
            </button>
          )}

          {feedback && (
            <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] space-y-4" data-testid="production-feedback">
              <div className="flex items-center gap-3">
                <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <Star key={s} className={`w-5 h-5 ${s <= feedback.overall_score ? 'text-amber-400 fill-amber-400' : 'text-[#E5E5EA]'}`} />)}</div>
                <span className="text-[17px] font-bold text-[#1D1D1F] tabular-nums">{feedback.overall_score}/5</span>
              </div>
              <div className="flex gap-2">
                <span className={`inline-flex items-center gap-1 text-[13px] font-medium px-3 py-1 rounded-full ${feedback.grammar_correct ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>{feedback.grammar_correct ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />} Grammar</span>
                <span className={`inline-flex items-center gap-1 text-[13px] font-medium px-3 py-1 rounded-full ${feedback.word_usage_correct ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>{feedback.word_usage_correct ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />} Usage</span>
              </div>
              <p className="text-[14px] text-[#3A3A3C] leading-relaxed">{feedback.feedback}</p>
              {feedback.improved_sentence && feedback.improved_sentence !== sentence && (
                <div className="bg-green-50 rounded-2xl p-3.5"><p className="text-[11px] text-green-600 uppercase tracking-wider font-semibold mb-1">Improved</p><p className="text-[14px] text-green-700 italic">"{feedback.improved_sentence}"</p></div>
              )}
              {feedback.tip && (
                <div className="bg-orange-50 rounded-2xl p-3.5"><p className="text-[13px] text-orange-600 flex items-center gap-1"><Lightbulb className="w-3.5 h-3.5" /> {feedback.tip}</p></div>
              )}
              <button onClick={goNextWord} className="w-full h-12 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-[14px] font-semibold shadow-[0_2px_10px_rgba(234,88,12,0.3)] flex items-center justify-center gap-2 transition-colors" data-testid="next-word-production-btn">
                {currentWordIdx === words.length - 1 ? 'See Results' : 'Next Word'} <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
