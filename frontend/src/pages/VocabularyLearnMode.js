import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  ChevronLeft, ChevronRight, Volume2, BookOpen, 
  ArrowLeft, Layers, Award, X
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function VocabularyLearnMode({ user }) {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [flipped, setFlipped] = useState(false);
  const [viewedSlides, setViewedSlides] = useState(new Set([0]));
  const [showWordFormation, setShowWordFormation] = useState(false);

  useEffect(() => {
    fetchSlides();
  }, [moduleId]);

  const fetchSlides = async () => {
    try {
      const res = await fetch(`${API_URL}/api/vocabulary-engine/${moduleId}/slides`);
      if (res.ok) {
        const d = await res.json();
        setData(d);
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

  const speakText = useCallback((text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.85;
      u.pitch = 1;
      window.speechSynthesis.speak(u);
    }
  }, []);

  const goNext = () => {
    if (!data) return;
    if (currentSlide < data.slides.length - 1) {
      const next = currentSlide + 1;
      setCurrentSlide(next);
      setFlipped(false);
      setViewedSlides(prev => new Set([...prev, next]));
    }
  };

  const goPrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
      setFlipped(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === ' ') { e.preventDefault(); setFlipped(f => !f); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentSlide, data]);

  const handleComplete = async () => {
    if (!user) return;
    try {
      await fetch(`${API_URL}/api/vocabulary-engine/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          module_id: moduleId,
          section: 'learn',
          completed: true,
        }),
      });
      toast.success('Learn Mode completed!');
      navigate(`/vocabulary/practice/${moduleId}`);
    } catch {
      toast.error('Failed to save progress');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center" data-testid="learn-mode-loading">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-amber-400 border-t-transparent" />
      </div>
    );
  }

  if (!data || !data.slides.length) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <p>No vocabulary data available.</p>
      </div>
    );
  }

  const slide = data.slides[currentSlide];
  const progress = ((currentSlide + 1) / data.slides.length) * 100;
  const allViewed = viewedSlides.size >= data.slides.length;

  const categoryColors = {
    'Advanced Term': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    'Idiom': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    'Phrasal Verb': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  };
  const catClass = Object.entries(categoryColors).find(([k]) => slide.category.includes(k))?.[1] 
    || 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col" data-testid="vocabulary-learn-mode">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-slate-900/80 backdrop-blur-sm">
        <button 
          onClick={() => navigate('/advanced-mastery')} 
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          data-testid="back-to-course-btn"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="text-center">
          <p className="text-xs text-slate-500">Module {data.module_number}</p>
          <p className="text-sm font-medium text-slate-300">{data.module_title}</p>
        </div>
        <div className="flex items-center gap-2">
          {data.word_formations?.length > 0 && (
            <button
              onClick={() => setShowWordFormation(true)}
              className="text-xs px-2 py-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors"
              data-testid="word-formation-btn"
            >
              <Layers className="w-3 h-3 inline mr-1" />Forms
            </button>
          )}
          <span className="text-sm text-slate-500" data-testid="slide-counter">
            {currentSlide + 1}/{data.slides.length}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-slate-800">
        <div 
          className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
          data-testid="learn-progress-bar"
        />
      </div>

      {/* Main slide area */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          {/* Card */}
          <div 
            className="relative cursor-pointer group"
            onClick={() => setFlipped(!flipped)}
            data-testid="slide-card"
          >
            <div className={`rounded-2xl border border-white/10 p-8 transition-all duration-500 min-h-[380px] flex flex-col ${
              flipped 
                ? 'bg-gradient-to-br from-slate-800 to-slate-900' 
                : 'bg-gradient-to-br from-slate-900 to-slate-800'
            }`}>
              
              {/* Category badge */}
              <div className="flex items-center justify-between mb-6">
                <Badge className={`text-xs border ${catClass}`} data-testid="slide-category">
                  {slide.category}
                </Badge>
                <button 
                  onClick={(e) => { e.stopPropagation(); speakText(slide.word); }}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                  data-testid="tts-button"
                >
                  <Volume2 className="w-5 h-5 text-slate-400 hover:text-amber-400" />
                </button>
              </div>

              {!flipped ? (
                /* Front: Word + pronunciation */
                <div className="flex-1 flex flex-col items-center justify-center text-center" data-testid="slide-front">
                  <h1 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight">
                    {slide.word}
                  </h1>
                  {slide.ipa && (
                    <p className="text-lg text-slate-400 font-mono mb-2">{slide.ipa}</p>
                  )}
                  {slide.stress && (
                    <p className="text-sm text-amber-400/70">{slide.stress}</p>
                  )}
                  <p className="text-sm text-slate-600 mt-8">Tap to see details</p>
                </div>
              ) : (
                /* Back: Full details */
                <div className="flex-1 flex flex-col space-y-4 overflow-y-auto" data-testid="slide-back">
                  <h2 className="text-2xl font-bold text-amber-400">{slide.word}</h2>
                  
                  {slide.meaning && (
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Meaning</p>
                      <p className="text-slate-200 leading-relaxed">{slide.meaning}</p>
                    </div>
                  )}

                  {slide.example && (
                    <div className="bg-white/5 rounded-lg p-3 border-l-2 border-amber-500">
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Example</p>
                      <p className="text-slate-300 italic text-sm leading-relaxed">"{slide.example}"</p>
                    </div>
                  )}

                  {slide.usage && (
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Usage</p>
                      <p className="text-sm text-slate-400">{slide.usage}</p>
                    </div>
                  )}

                  {slide.collocations?.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                        {slide.category.includes('Collocation') ? 'Alternatives' : 'Collocations'}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {slide.collocations.map((c, i) => (
                          <span key={i} className="text-xs px-2 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {slide.common_mistake && (
                    <div className="bg-red-500/10 rounded-lg p-2 border border-red-500/20">
                      <p className="text-xs text-red-400">Common mistake: {slide.common_mistake}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="outline"
              onClick={goPrev}
              disabled={currentSlide === 0}
              className="border-white/10 text-slate-300 hover:bg-white/10 disabled:opacity-30"
              data-testid="prev-slide-btn"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            {/* Dot indicators (show up to 10 at a time) */}
            <div className="flex gap-1.5 items-center">
              {data.slides.length <= 12 ? (
                data.slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setCurrentSlide(i); setFlipped(false); setViewedSlides(prev => new Set([...prev, i])); }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === currentSlide ? 'bg-amber-400 w-6' : viewedSlides.has(i) ? 'bg-amber-400/40' : 'bg-slate-700'
                    }`}
                  />
                ))
              ) : (
                <span className="text-sm text-slate-500">{currentSlide + 1} of {data.slides.length}</span>
              )}
            </div>

            {currentSlide === data.slides.length - 1 && allViewed ? (
              <Button
                onClick={handleComplete}
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                data-testid="complete-learn-btn"
              >
                <Award className="w-4 h-4 mr-1" /> Continue to Practice
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={goNext}
                disabled={currentSlide === data.slides.length - 1}
                className="border-white/10 text-slate-300 hover:bg-white/10 disabled:opacity-30"
                data-testid="next-slide-btn"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Word Formation modal */}
      {showWordFormation && data.word_formations?.length > 0 && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" data-testid="word-formation-modal">
          <div className="bg-slate-900 rounded-2xl border border-white/10 w-full max-w-lg max-h-[80vh] overflow-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-cyan-300 flex items-center gap-2">
                <Layers className="w-5 h-5" /> Word Formation
              </h3>
              <button onClick={() => setShowWordFormation(false)} className="p-1 rounded hover:bg-white/10">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 px-3 text-slate-400">Root</th>
                    <th className="text-left py-2 px-3 text-slate-400">Noun</th>
                    <th className="text-left py-2 px-3 text-slate-400">Verb</th>
                    <th className="text-left py-2 px-3 text-slate-400">Adj.</th>
                    <th className="text-left py-2 px-3 text-slate-400">Adv.</th>
                  </tr>
                </thead>
                <tbody>
                  {data.word_formations.map((wf, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-2 px-3 font-semibold text-cyan-300">{wf.root}</td>
                      <td className="py-2 px-3 text-slate-300">{wf.noun}</td>
                      <td className="py-2 px-3 text-slate-300">{wf.verb}</td>
                      <td className="py-2 px-3 text-slate-300">{wf.adjective}</td>
                      <td className="py-2 px-3 text-slate-300">{wf.adverb}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
