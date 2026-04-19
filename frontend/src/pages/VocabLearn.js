import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import {
  ArrowLeft, ArrowRight, ChevronLeft, Volume2, BookOpen,
  Loader2, Lightbulb, Globe, Brain, PenTool, Mic
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const CATEGORIES = [
  { id: 'advanced_terms', label: 'Terms', icon: BookOpen },
  { id: 'idioms', label: 'Idioms', icon: Lightbulb },
  { id: 'collocations', label: 'Collocations', icon: Globe },
  { id: 'phrasal_verbs', label: 'Phrasal Verbs', icon: Brain },
  { id: 'pronunciation_guide', label: 'Pronunciation', icon: Mic },
  { id: 'word_formation', label: 'Word Families', icon: PenTool },
];

function normalizeSlide(item, category) {
  switch (category) {
    case 'advanced_terms':
      return { word: item.term, definition: item.meaning, example: item.usage, extra: null };
    case 'idioms':
      return { word: item.idiom, definition: item.meaning, example: item.example, extra: item.usage_context ? `Context: ${item.usage_context}` : null };
    case 'collocations':
      return { word: item.collocation, definition: item.type, example: item.example, extra: item.alternatives?.length ? `Alternatives: ${item.alternatives.join(', ')}` : null };
    case 'phrasal_verbs':
      return { word: item.phrasal_verb, definition: item.meaning, example: item.example, extra: item.formal_alternative ? `Formal: ${item.formal_alternative}` : null };
    case 'pronunciation_guide':
      return { word: item.word, ipa: item.ipa, stress: item.stress, definition: item.common_mistake ? `Common mistake: ${item.common_mistake}` : '', example: item.audio_tip || '', extra: null };
    case 'word_formation':
      return { word: item.root, definition: 'Word Family', forms: { Noun: item.noun, Verb: item.verb, Adj: item.adjective, Adv: item.adverb }, extra: null };
    default:
      return { word: item.term || item.word || '', definition: item.meaning || '', example: item.example || '', extra: null };
  }
}

function SlideCard({ slide, category, onSpeak, speaking }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 py-8 max-w-2xl mx-auto w-full" data-testid="slide-card">
      {/* Word */}
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 text-center">{slide.word}</h1>
        <button
          onClick={() => onSpeak(slide.word)}
          disabled={speaking}
          className="p-2 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors disabled:opacity-40"
          data-testid="tts-btn"
        >
          {speaking ? <Loader2 className="w-5 h-5 animate-spin" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>

      {/* IPA / Stress for pronunciation */}
      {slide.ipa && (
        <p className="text-lg text-indigo-500 font-mono mb-1">{slide.ipa}</p>
      )}
      {slide.stress && (
        <p className="text-sm text-slate-500 mb-4">Stress: <span className="font-semibold text-indigo-600">{slide.stress}</span></p>
      )}

      {/* Definition */}
      {slide.definition && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-6 py-4 mb-4 w-full text-center">
          <p className="text-base text-slate-700 leading-relaxed">{slide.definition}</p>
        </div>
      )}

      {/* Example */}
      {slide.example && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-6 py-4 mb-4 w-full">
          <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide mb-1">Example</p>
          <p className="text-sm text-slate-700 italic leading-relaxed">"{slide.example}"</p>
        </div>
      )}

      {/* Word Formation table */}
      {slide.forms && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full mb-4">
          {Object.entries(slide.forms).map(([pos, form]) => form && (
            <div key={pos} className="bg-white border border-slate-200 rounded-lg p-3 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase">{pos}</p>
              <p className="text-sm font-semibold text-slate-800 mt-1">{form}</p>
            </div>
          ))}
        </div>
      )}

      {/* Extra info */}
      {slide.extra && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 w-full">
          <p className="text-xs text-amber-700">{slide.extra}</p>
        </div>
      )}
    </div>
  );
}

export default function VocabLearn() {
  const navigate = useNavigate();
  const { moduleId } = useParams();
  const [searchParams] = useSearchParams();
  const initCat = searchParams.get('cat') || 'advanced_terms';

  const [module, setModule] = useState(null);
  const [category, setCategory] = useState(initCat);
  const [slideIndex, setSlideIndex] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [loading, setLoading] = useState(true);
  const audioRef = React.useRef(null);

  useEffect(() => {
    fetch(`${API_URL}/api/advanced-mastery/modules/${moduleId}`)
      .then(r => r.json())
      .then(d => { setModule(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [moduleId]);

  const items = module?.vocabulary?.[category] || [];
  const slides = items.map(item => normalizeSlide(item, category));
  const currentSlide = slides[slideIndex];
  const total = slides.length;

  const goNext = useCallback(() => { if (slideIndex < total - 1) setSlideIndex(i => i + 1); }, [slideIndex, total]);
  const goPrev = useCallback(() => { if (slideIndex > 0) setSlideIndex(i => i - 1); }, [slideIndex]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); goNext(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev]);

  // Reset slide index when category changes
  useEffect(() => { setSlideIndex(0); }, [category]);

  const speak = async (text) => {
    setSpeaking(true);
    try {
      const res = await fetch(`${API_URL}/api/liz/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      if (data.audio) {
        const bytes = atob(data.audio);
        const arr = new Uint8Array(bytes.length);
        for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
        const blob = new Blob([arr], { type: 'audio/mpeg' });
        const url = URL.createObjectURL(blob);
        if (audioRef.current) audioRef.current.pause();
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => { setSpeaking(false); URL.revokeObjectURL(url); };
        audio.play();
      } else { setSpeaking(false); }
    } catch { setSpeaking(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
    </div>
  );

  if (!module) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-slate-500">Module not found</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col" data-testid="vocab-learn-page">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-700" data-testid="back-btn">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-bold text-slate-900 text-sm">{module.title}</h1>
              <p className="text-xs text-slate-500">Vocabulary · Slide Mode</p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => navigate(`/vocabulary/practice/${moduleId}`)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs"
            data-testid="go-practice-btn"
          >
            <PenTool className="w-3.5 h-3.5 mr-1" /> Practice
          </Button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="border-b border-slate-100 bg-white/80 px-4 py-2 overflow-x-auto">
        <div className="max-w-4xl mx-auto flex gap-1.5">
          {CATEGORIES.map(cat => {
            const count = module.vocabulary?.[cat.id]?.length || 0;
            if (count === 0) return null;
            return (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  category === cat.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                data-testid={`cat-${cat.id}`}
              >
                <cat.icon className="w-3.5 h-3.5" />
                {cat.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Slide Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        {currentSlide ? (
          <>
            <SlideCard slide={currentSlide} category={category} onSpeak={speak} speaking={speaking} />

            {/* Navigation */}
            <div className="flex items-center gap-6 pb-6">
              <button
                onClick={goPrev}
                disabled={slideIndex === 0}
                className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-20 shadow-sm transition-all"
                data-testid="prev-btn"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="text-center">
                <p className="text-sm font-bold text-slate-800">{slideIndex + 1} / {total}</p>
                <div className="w-32 h-1.5 bg-slate-200 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                    style={{ width: `${((slideIndex + 1) / total) * 100}%` }}
                  />
                </div>
              </div>

              <button
                onClick={goNext}
                disabled={slideIndex === total - 1}
                className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-20 shadow-sm transition-all"
                data-testid="next-btn"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </>
        ) : (
          <p className="text-slate-400 text-sm">No vocabulary items in this category</p>
        )}
      </div>
    </div>
  );
}
