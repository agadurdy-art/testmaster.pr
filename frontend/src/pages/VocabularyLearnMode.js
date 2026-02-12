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
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50/30 flex items-center justify-center" data-testid="learn-mode-loading">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  if (!data || !data.slides.length) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50/30 flex items-center justify-center text-gray-700">
        <p>No vocabulary data available.</p>
      </div>
    );
  }

  const slide = data.slides[currentSlide];
  const progress = ((currentSlide + 1) / data.slides.length) * 100;
  const allViewed = viewedSlides.size >= data.slides.length;

  const categoryColors = {
    'Advanced Term': 'bg-amber-100 text-amber-800 border-amber-300',
    'Idiom': 'bg-blue-100 text-blue-800 border-blue-300',
    'Phrasal Verb': 'bg-orange-100 text-orange-800 border-orange-300',
  };
  const catClass = Object.entries(categoryColors).find(([k]) => slide.category.includes(k))?.[1] 
    || 'bg-emerald-100 text-emerald-800 border-emerald-300';

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50/30 text-gray-900 flex flex-col" data-testid="vocabulary-learn-mode">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-amber-200/60 bg-white/80 backdrop-blur-sm">
        <button 
          onClick={() => navigate('/advanced-mastery')} 
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          data-testid="back-to-course-btn"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="text-center">
          <p className="text-xs text-gray-400">Module {data.module_number}</p>
          <p className="text-sm font-medium text-gray-700">{data.module_title}</p>
        </div>
        <div className="flex items-center gap-2">
          {data.word_formations?.length > 0 && (
            <button
              onClick={() => setShowWordFormation(true)}
              className="text-xs px-2 py-1 rounded bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 transition-colors"
              data-testid="word-formation-btn"
            >
              <Layers className="w-3 h-3 inline mr-1" />Forms
            </button>
          )}
          <span className="text-sm text-gray-400" data-testid="slide-counter">
            {currentSlide + 1}/{data.slides.length}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-amber-100">
        <div 
          className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-300 rounded-r-full"
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
            <div className={`rounded-2xl border p-8 transition-all duration-500 min-h-[380px] flex flex-col shadow-lg ${
              flipped 
                ? 'bg-white border-amber-200 shadow-amber-100/50' 
                : 'bg-gradient-to-br from-white to-amber-50/50 border-amber-200/60 shadow-amber-100/30'
            }`}>
              
              {/* Category badge */}
              <div className="flex items-center justify-between mb-6">
                <Badge className={`text-xs border ${catClass}`} data-testid="slide-category">
                  {slide.category}
                </Badge>
                <button 
                  onClick={(e) => { e.stopPropagation(); speakText(slide.word); }}
                  className="p-2 rounded-full hover:bg-amber-50 transition-colors"
                  data-testid="tts-button"
                >
                  <Volume2 className="w-5 h-5 text-gray-400 hover:text-amber-600" />
                </button>
              </div>

              {!flipped ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center" data-testid="slide-front">
                  <h1 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight text-gray-900">
                    {slide.word}
                  </h1>
                  {slide.ipa && (
                    <p className="text-lg text-gray-400 font-mono mb-2">{slide.ipa}</p>
                  )}
                  {slide.stress && (
                    <p className="text-sm text-amber-600">{slide.stress}</p>
                  )}
                  <p className="text-sm text-gray-400 mt-8">Tap to see details</p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col space-y-4 overflow-y-auto" data-testid="slide-back">
                  <h2 className="text-2xl font-bold text-amber-700">{slide.word}</h2>
                  
                  {slide.meaning && (
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Meaning</p>
                      <p className="text-gray-700 leading-relaxed">{slide.meaning}</p>
                    </div>
                  )}

                  {slide.example && (
                    <div className="bg-amber-50 rounded-lg p-3 border-l-2 border-amber-500">
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Example</p>
                      <p className="text-gray-600 italic text-sm leading-relaxed">"{slide.example}"</p>
                    </div>
                  )}

                  {slide.usage && (
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Usage</p>
                      <p className="text-sm text-gray-500">{slide.usage}</p>
                    </div>
                  )}

                  {slide.collocations?.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                        {slide.category.includes('Collocation') ? 'Alternatives' : 'Collocations'}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {slide.collocations.map((c, i) => (
                          <span key={i} className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {slide.common_mistake && (
                    <div className="bg-red-50 rounded-lg p-2 border border-red-200">
                      <p className="text-xs text-red-600">Common mistake: {slide.common_mistake}</p>
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
              className="border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30"
              data-testid="prev-slide-btn"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <div className="flex gap-1.5 items-center">
              {data.slides.length <= 12 ? (
                data.slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setCurrentSlide(i); setFlipped(false); setViewedSlides(prev => new Set([...prev, i])); }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === currentSlide ? 'bg-amber-500 w-6' : viewedSlides.has(i) ? 'bg-amber-300' : 'bg-gray-200'
                    }`}
                  />
                ))
              ) : (
                <span className="text-sm text-gray-400">{currentSlide + 1} of {data.slides.length}</span>
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
                className="border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30"
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
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" data-testid="word-formation-modal">
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-lg max-h-[80vh] overflow-auto p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-teal-700 flex items-center gap-2">
                <Layers className="w-5 h-5" /> Word Formation
              </h3>
              <button onClick={() => setShowWordFormation(false)} className="p-1 rounded hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-gray-500">Root</th>
                    <th className="text-left py-2 px-3 text-gray-500">Noun</th>
                    <th className="text-left py-2 px-3 text-gray-500">Verb</th>
                    <th className="text-left py-2 px-3 text-gray-500">Adj.</th>
                    <th className="text-left py-2 px-3 text-gray-500">Adv.</th>
                  </tr>
                </thead>
                <tbody>
                  {data.word_formations.map((wf, i) => (
                    <tr key={i} className="border-b border-gray-100 hover:bg-amber-50/50">
                      <td className="py-2 px-3 font-semibold text-teal-700">{wf.root}</td>
                      <td className="py-2 px-3 text-gray-600">{wf.noun}</td>
                      <td className="py-2 px-3 text-gray-600">{wf.verb}</td>
                      <td className="py-2 px-3 text-gray-600">{wf.adjective}</td>
                      <td className="py-2 px-3 text-gray-600">{wf.adverb}</td>
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
