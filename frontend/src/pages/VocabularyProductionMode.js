import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { 
  ArrowLeft, ArrowRight, Send, CheckCircle, XCircle, 
  Star, Lightbulb, RotateCcw, PenTool, Volume2, Sparkles
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

  // Only use advanced terms (main words) for production mode
  const words = slides.filter(s => s.category === 'Advanced Term');

  useEffect(() => {
    fetchData();
  }, [moduleId]);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/api/vocabulary-engine/${moduleId}/slides`);
      if (res.ok) {
        const d = await res.json();
        setSlides(d.slides);
        setModuleTitle(d.module_title);
      } else {
        toast.error('Failed to load vocabulary');
        navigate('/advanced-mastery');
      }
    } catch {
      toast.error('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.85;
      window.speechSynthesis.speak(u);
    }
  };

  const handleEvaluate = async () => {
    if (!sentence.trim()) {
      toast.error('Please write a sentence first');
      return;
    }
    const word = words[currentWordIdx];
    setEvaluating(true);
    setFeedback(null);
    try {
      const res = await fetch(`${API_URL}/api/vocabulary-engine/evaluate-sentence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: word.word,
          sentence: sentence.trim(),
          word_meaning: word.meaning,
          module_title: moduleTitle,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setFeedback(data);
        setResults(prev => [...prev, { word: word.word, score: data.overall_score, correct: data.grammar_correct && data.word_usage_correct }]);
      } else {
        toast.error('Evaluation failed');
      }
    } catch {
      toast.error('Connection error');
    } finally {
      setEvaluating(false);
    }
  };

  const goNextWord = () => {
    if (currentWordIdx < words.length - 1) {
      setCurrentWordIdx(prev => prev + 1);
      setSentence('');
      setFeedback(null);
    } else {
      setCompleted(true);
    }
  };

  const handleFinish = async () => {
    if (user) {
      try {
        await fetch(`${API_URL}/api/vocabulary-engine/progress`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id, module_id: moduleId, section: 'production', completed: true }),
        });
      } catch {}
    }
    toast.success('Production Mode completed!');
    navigate('/advanced-mastery');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-blue-50/30 flex items-center justify-center" data-testid="production-mode-loading">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (!words.length) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-blue-50/30 flex items-center justify-center text-gray-700">
        <p>No words available for production practice.</p>
      </div>
    );
  }

  // Completion screen
  if (completed) {
    const avgScore = results.length ? (results.reduce((a, r) => a + r.score, 0) / results.length).toFixed(1) : 0;
    const correctCount = results.filter(r => r.correct).length;
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-blue-50/30 flex items-center justify-center p-4" data-testid="production-complete-screen">
        <div className="w-full max-w-md text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-indigo-100 flex items-center justify-center">
            <Sparkles className="w-12 h-12 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Production Complete!</h2>
          <p className="text-gray-500 mb-6">{moduleTitle}</p>

          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-3xl font-bold text-indigo-600" data-testid="production-avg-score">{avgScore}</p>
                <p className="text-xs text-gray-400">Avg. Score (out of 5)</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-emerald-600">{correctCount}/{results.length}</p>
                <p className="text-xs text-gray-400">Correct Usage</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {results.map((r, i) => (
                <div key={i} className={`px-2 py-1 rounded text-xs ${r.correct ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                  {r.word}: {r.score}/5
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={handleFinish}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
            data-testid="finish-production-btn"
          >
            Back to Course
          </Button>
        </div>
      </div>
    );
  }

  const word = words[currentWordIdx];
  const progress = ((currentWordIdx + 1) / words.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-blue-50/30 text-gray-900 flex flex-col" data-testid="vocabulary-production-mode">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-indigo-200/60 bg-white/80 backdrop-blur-sm">
        <button 
          onClick={() => navigate('/advanced-mastery')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          data-testid="back-from-production"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <p className="text-sm font-medium text-gray-700">Production Mode (AI)</p>
        <span className="text-sm text-gray-400" data-testid="production-counter">
          {currentWordIdx + 1}/{words.length}
        </span>
      </div>

      <div className="h-1.5 bg-indigo-100">
        <div 
          className="h-full bg-gradient-to-r from-indigo-400 to-blue-500 transition-all duration-300 rounded-r-full"
          style={{ width: `${progress}%` }}
          data-testid="production-progress-bar"
        />
      </div>

      {/* Main area */}
      <div className="flex-1 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-2xl">
          {/* Word card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div>
                <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 mb-2">Target Word</Badge>
                <h2 className="text-2xl font-bold text-gray-900">{word.word}</h2>
                {word.ipa && <p className="text-sm text-gray-400 font-mono">{word.ipa}</p>}
              </div>
              <button 
                onClick={() => speakText(word.word)}
                className="p-2 rounded-full hover:bg-indigo-50 transition-colors"
                data-testid="production-tts-btn"
              >
                <Volume2 className="w-5 h-5 text-gray-400 hover:text-indigo-600" />
              </button>
            </div>
            <p className="text-gray-600 text-sm mb-2">{word.meaning}</p>
            <div className="bg-indigo-50 rounded-lg p-2 border-l-2 border-indigo-400">
              <p className="text-xs text-indigo-600 italic">Example: "{word.example}"</p>
            </div>
          </div>

          {/* Writing area */}
          <div className="mb-4">
            <label className="text-sm text-gray-500 mb-2 flex items-center gap-1">
              <PenTool className="w-3 h-3" /> Write a sentence using "<span className="font-semibold text-indigo-700">{word.word}</span>"
            </label>
            <Textarea
              value={sentence}
              onChange={(e) => setSentence(e.target.value)}
              placeholder={`Write a sentence using "${word.word}"...`}
              className="bg-white border-gray-200 text-gray-700 placeholder-gray-400 min-h-[100px] focus:border-indigo-400 focus:ring-indigo-200"
              disabled={evaluating}
              data-testid="production-sentence-input"
            />
          </div>

          {/* Evaluate button */}
          {!feedback && (
            <Button
              onClick={handleEvaluate}
              disabled={evaluating || !sentence.trim()}
              className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white disabled:opacity-40"
              data-testid="evaluate-sentence-btn"
            >
              {evaluating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Evaluating...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" /> Evaluate with AI
                </>
              )}
            </Button>
          )}

          {/* Feedback */}
          {feedback && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4" data-testid="production-feedback">
              {/* Score */}
              <div className="flex items-center gap-3">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`w-5 h-5 ${s <= feedback.overall_score ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                  ))}
                </div>
                <span className="text-lg font-bold text-gray-700">{feedback.overall_score}/5</span>
              </div>

              {/* Grammar & Usage indicators */}
              <div className="flex gap-3">
                <div className={`flex items-center gap-1 text-sm px-3 py-1 rounded-full ${feedback.grammar_correct ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                  {feedback.grammar_correct ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  Grammar
                </div>
                <div className={`flex items-center gap-1 text-sm px-3 py-1 rounded-full ${feedback.word_usage_correct ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                  {feedback.word_usage_correct ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  Word Usage
                </div>
              </div>

              {/* Feedback text */}
              <p className="text-gray-700 text-sm leading-relaxed">{feedback.feedback}</p>

              {/* Improved sentence */}
              {feedback.improved_sentence && feedback.improved_sentence !== sentence && (
                <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                  <p className="text-xs text-emerald-600 uppercase tracking-wider mb-1">Improved Version</p>
                  <p className="text-sm text-emerald-800 italic">"{feedback.improved_sentence}"</p>
                </div>
              )}

              {/* Tip */}
              {feedback.tip && (
                <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                  <p className="text-xs text-amber-700 flex items-center gap-1">
                    <Lightbulb className="w-3 h-3" /> {feedback.tip}
                  </p>
                </div>
              )}

              {/* Next button */}
              <Button
                onClick={goNextWord}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                data-testid="next-word-production-btn"
              >
                {currentWordIdx === words.length - 1 ? 'See Results' : 'Next Word'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
