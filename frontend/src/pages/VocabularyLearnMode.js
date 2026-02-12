import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  ChevronLeft, ChevronRight, Volume2, 
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

  useEffect(() => { fetchSlides(); }, [moduleId]);

  const fetchSlides = async () => {
    try {
      const res = await fetch(`${API_URL}/api/vocabulary-engine/${moduleId}/slides`);
      if (res.ok) setData(await res.json());
      else { toast.error('Failed to load vocabulary'); navigate('/advanced-mastery'); }
    } catch { toast.error('Connection error'); }
    finally { setLoading(false); }
  };

  const speakText = useCallback((text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.85;
      window.speechSynthesis.speak(u);
    }
  }, []);

  const goNext = () => {
    if (!data || currentSlide >= data.slides.length - 1) return;
    const next = currentSlide + 1;
    setCurrentSlide(next);
    setFlipped(false);
    setViewedSlides(prev => new Set([...prev, next]));
  };
  const goPrev = () => { if (currentSlide > 0) { setCurrentSlide(currentSlide - 1); setFlipped(false); } };

  useEffect(() => {
    const h = (e) => {
      if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === ' ') { e.preventDefault(); setFlipped(f => !f); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [currentSlide, data]);

  const handleComplete = async () => {
    if (!user) return;
    try {
      await fetch(`${API_URL}/api/vocabulary-engine/progress`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, module_id: moduleId, section: 'learn', completed: true }),
      });
      toast.success('Learn Mode completed!');
      navigate(`/vocabulary/practice/${moduleId}`);
    } catch { toast.error('Failed to save progress'); }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center" data-testid="learn-mode-loading">
      <div className="animate-spin rounded-full h-8 w-8 border-[3px] border-gray-200 border-t-orange-500" />
    </div>
  );

  if (!data || !data.slides.length) return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center"><p className="text-[#86868B]">No vocabulary data available.</p></div>
  );

  const slide = data.slides[currentSlide];
  const progress = ((currentSlide + 1) / data.slides.length) * 100;
  const allViewed = viewedSlides.size >= data.slides.length;

  const catMap = {
    'Advanced Term': 'bg-orange-50 text-orange-600 border-orange-200',
    'Idiom': 'bg-sky-50 text-sky-600 border-sky-200',
    'Phrasal Verb': 'bg-violet-50 text-violet-600 border-violet-200',
  };
  const catClass = Object.entries(catMap).find(([k]) => slide.category.includes(k))?.[1] || 'bg-teal-50 text-teal-600 border-teal-200';

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col" data-testid="vocabulary-learn-mode">
      {/* iOS-style top bar */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-xl border-b border-black/[0.04]">
        <div className="flex items-center justify-between px-4 py-3 max-w-3xl mx-auto">
          <button onClick={() => navigate('/advanced-mastery')} className="flex items-center gap-1.5 text-sm text-orange-500 font-medium" data-testid="back-to-course-btn">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <div className="text-center">
            <p className="text-[11px] text-[#86868B] uppercase tracking-wide">Module {data.module_number}</p>
            <p className="text-[15px] font-semibold text-[#1D1D1F]">{data.module_title}</p>
          </div>
          <div className="flex items-center gap-2">
            {data.word_formations?.length > 0 && (
              <button onClick={() => setShowWordFormation(true)} className="text-[12px] px-2.5 py-1 rounded-full bg-[#F5F5F7] text-[#86868B] hover:bg-gray-200/60 transition-colors font-medium" data-testid="word-formation-btn">
                <Layers className="w-3 h-3 inline mr-1" />Forms
              </button>
            )}
            <span className="text-[13px] text-[#86868B] tabular-nums" data-testid="slide-counter">{currentSlide + 1}/{data.slides.length}</span>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-[3px] bg-black/[0.04]">
          <div className="h-full bg-orange-500 transition-all duration-300" style={{ width: `${progress}%` }} data-testid="learn-progress-bar" />
        </div>
      </div>

      {/* Main slide area */}
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-xl">
          <div className="relative cursor-pointer" onClick={() => setFlipped(!flipped)} data-testid="slide-card">
            <div className={`rounded-[20px] bg-white p-8 transition-all duration-400 min-h-[380px] flex flex-col shadow-[0_2px_15px_rgba(0,0,0,0.06)]`}>
              
              <div className="flex items-center justify-between mb-8">
                <Badge className={`text-[11px] font-semibold border px-2.5 py-0.5 rounded-full ${catClass}`} data-testid="slide-category">{slide.category}</Badge>
                <button onClick={(e) => { e.stopPropagation(); speakText(slide.word); }} className="w-9 h-9 rounded-full bg-[#F5F5F7] flex items-center justify-center hover:bg-gray-200/60 transition-colors" data-testid="tts-button">
                  <Volume2 className="w-[18px] h-[18px] text-[#86868B]" />
                </button>
              </div>

              {!flipped ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center" data-testid="slide-front">
                  <h1 className="text-[42px] sm:text-[52px] font-bold text-[#1D1D1F] tracking-tight leading-tight">{slide.word}</h1>
                  {slide.ipa && <p className="text-[17px] text-[#86868B] font-mono mt-3">{slide.ipa}</p>}
                  {slide.stress && <p className="text-[14px] text-orange-500 font-medium mt-1">{slide.stress}</p>}
                  <p className="text-[13px] text-[#AEAEB2] mt-10">Tap to reveal details</p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col space-y-5 overflow-y-auto" data-testid="slide-back">
                  <h2 className="text-[24px] font-bold text-[#1D1D1F]">{slide.word}</h2>
                  
                  {slide.meaning && (
                    <div>
                      <p className="text-[11px] text-[#AEAEB2] uppercase tracking-wider font-semibold mb-1">Definition</p>
                      <p className="text-[15px] text-[#3A3A3C] leading-relaxed">{slide.meaning}</p>
                    </div>
                  )}
                  {slide.example && (
                    <div className="bg-[#F5F5F7] rounded-2xl p-4">
                      <p className="text-[11px] text-[#AEAEB2] uppercase tracking-wider font-semibold mb-1">Example</p>
                      <p className="text-[14px] text-[#636366] italic leading-relaxed">"{slide.example}"</p>
                    </div>
                  )}
                  {slide.usage && (
                    <div>
                      <p className="text-[11px] text-[#AEAEB2] uppercase tracking-wider font-semibold mb-1">Usage</p>
                      <p className="text-[14px] text-[#86868B]">{slide.usage}</p>
                    </div>
                  )}
                  {slide.collocations?.length > 0 && (
                    <div>
                      <p className="text-[11px] text-[#AEAEB2] uppercase tracking-wider font-semibold mb-2">{slide.category.includes('Collocation') ? 'Alternatives' : 'Collocations'}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {slide.collocations.map((c, i) => (
                          <span key={i} className="text-[12px] px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 font-medium">{c}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {slide.common_mistake && (
                    <div className="bg-red-50 rounded-2xl p-3">
                      <p className="text-[12px] text-red-500 font-medium">Common mistake: {slide.common_mistake}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 px-2">
            <button onClick={goPrev} disabled={currentSlide === 0} className="w-11 h-11 rounded-full bg-white shadow-[0_1px_8px_rgba(0,0,0,0.08)] flex items-center justify-center disabled:opacity-25 transition-opacity" data-testid="prev-slide-btn">
              <ChevronLeft className="w-5 h-5 text-[#3A3A3C]" />
            </button>

            <div className="flex gap-[6px] items-center">
              {data.slides.length <= 12 ? data.slides.map((_, i) => (
                <button key={i} onClick={() => { setCurrentSlide(i); setFlipped(false); setViewedSlides(prev => new Set([...prev, i])); }}
                  className={`rounded-full transition-all duration-200 ${i === currentSlide ? 'w-6 h-2 bg-orange-500' : viewedSlides.has(i) ? 'w-2 h-2 bg-orange-300' : 'w-2 h-2 bg-[#D1D1D6]'}`} />
              )) : <span className="text-[13px] text-[#86868B] tabular-nums">{currentSlide + 1} of {data.slides.length}</span>}
            </div>

            {currentSlide === data.slides.length - 1 && allViewed ? (
              <Button onClick={handleComplete} className="h-11 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-[14px] font-semibold px-5 shadow-[0_2px_10px_rgba(234,88,12,0.3)]" data-testid="complete-learn-btn">
                Continue <ArrowLeft className="w-4 h-4 ml-1 rotate-180" />
              </Button>
            ) : (
              <button onClick={goNext} disabled={currentSlide === data.slides.length - 1} className="w-11 h-11 rounded-full bg-white shadow-[0_1px_8px_rgba(0,0,0,0.08)] flex items-center justify-center disabled:opacity-25 transition-opacity" data-testid="next-slide-btn">
                <ChevronRight className="w-5 h-5 text-[#3A3A3C]" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Word Formation modal */}
      {showWordFormation && data.word_formations?.length > 0 && (
        <div className="fixed inset-0 bg-black/25 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center" data-testid="word-formation-modal" onClick={() => setShowWordFormation(false)}>
          <div className="bg-white rounded-t-[20px] sm:rounded-[20px] w-full sm:max-w-lg max-h-[75vh] overflow-auto p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[17px] font-bold text-[#1D1D1F]">Word Formation</h3>
              <button onClick={() => setShowWordFormation(false)} className="w-8 h-8 rounded-full bg-[#F5F5F7] flex items-center justify-center"><X className="w-4 h-4 text-[#86868B]" /></button>
            </div>
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-[14px]">
                <thead><tr className="border-b border-black/[0.06]">
                  {['Root','Noun','Verb','Adj.','Adv.'].map(h => <th key={h} className="text-left py-2 px-3 text-[12px] text-[#AEAEB2] uppercase tracking-wider font-semibold">{h}</th>)}
                </tr></thead>
                <tbody>{data.word_formations.map((wf, i) => (
                  <tr key={i} className="border-b border-black/[0.04]">
                    <td className="py-2.5 px-3 font-semibold text-orange-600">{wf.root}</td>
                    <td className="py-2.5 px-3 text-[#3A3A3C]">{wf.noun}</td>
                    <td className="py-2.5 px-3 text-[#3A3A3C]">{wf.verb}</td>
                    <td className="py-2.5 px-3 text-[#3A3A3C]">{wf.adjective}</td>
                    <td className="py-2.5 px-3 text-[#3A3A3C]">{wf.adverb}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
