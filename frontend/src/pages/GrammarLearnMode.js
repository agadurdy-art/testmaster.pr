import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGoBack } from '../hooks/useGoBack';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import {
  ChevronLeft, ChevronRight, ArrowLeft, BookOpen,
  CheckCircle, XCircle, Lightbulb, AlertTriangle,
  Globe, Volume2, Layers, Award, Search, Clock
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const LANGUAGES = {
  vi: 'Tiếng Việt', tr: 'Türkçe', ko: '한국어',
  zh: '中文', ja: '日本語', th: 'ไทย',
  ar: 'العربية', es: 'Español', pt: 'Português',
  fr: 'Français', de: 'Deutsch', id: 'Bahasa Indonesia',
};

function TranslationToggle({ text, context = "grammar explanation" }) {
  const [showLangs, setShowLangs] = useState(false);
  const [translation, setTranslation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedLang, setSelectedLang] = useState(null);

  const translate = async (lang) => {
    setLoading(true);
    setSelectedLang(lang);
    setShowLangs(false);
    try {
      const res = await fetch(`${API_URL}/api/grammar-engine/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, target_language: lang, context }),
      });
      if (res.ok) {
        const data = await res.json();
        setTranslation(data.translation);
      }
    } catch { toast.error('Translation failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => { if (translation) { setTranslation(null); setSelectedLang(null); } else setShowLangs(!showLangs); }}
        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
        data-testid="translate-toggle"
      >
        <Globe className="w-3.5 h-3.5" />
        {translation ? 'English' : 'Translate'}
      </button>
      {showLangs && (
        <div className="absolute z-50 mt-1 right-0 bg-white border rounded-lg shadow-lg p-2 min-w-[140px]">
          {Object.entries(LANGUAGES).map(([code, name]) => (
            <button key={code} onClick={() => translate(code)}
              className="block w-full text-left px-3 py-1.5 text-sm hover:bg-blue-50 rounded"
              data-testid={`lang-${code}`}
            >{name}</button>
          ))}
        </div>
      )}
      {loading && <span className="text-xs text-gray-400 ml-2">Translating...</span>}
      {translation && (
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900" data-testid="translation-result">
          <span className="text-xs font-semibold text-blue-600 uppercase">{LANGUAGES[selectedLang]}</span>
          <p className="mt-1">{translation}</p>
        </div>
      )}
    </div>
  );
}

// Slide renderers
function ContextDiscoverySlide({ slide }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="space-y-6" data-testid="slide-context-discovery">
      <p className="text-gray-600 font-medium">{slide.instruction}</p>
      <div className="space-y-3">
        {slide.sentences?.map((s, i) => (
          <div key={i} className="p-4 bg-white rounded-xl border-l-4 border-indigo-400 shadow-sm">
            <p className="text-lg text-gray-800" dangerouslySetInnerHTML={{ __html: s.replace(/\*\*(.*?)\*\*/g, '<strong class="text-indigo-700 underline decoration-indigo-300 decoration-2">$1</strong>') }} />
          </div>
        ))}
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="font-semibold text-amber-800 flex items-center gap-2"><Search className="w-4 h-4" /> {slide.discovery_question}</p>
        {!revealed ? (
          <Button variant="outline" size="sm" className="mt-3" onClick={() => setRevealed(true)} data-testid="reveal-answer-btn">
            Show Answer
          </Button>
        ) : (
          <p className="mt-2 text-amber-700" data-testid="discovery-answer">{slide.answer}</p>
        )}
      </div>
    </div>
  );
}

function FormSlide({ slide }) {
  return (
    <div className="space-y-5" data-testid="slide-form">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl p-5 text-center">
        <p className="text-xs uppercase tracking-wider opacity-80 mb-1">Formula</p>
        <p className="text-xl font-bold font-mono">{slide.formula}</p>
      </div>
      <div className="grid gap-3">
        {[{ label: 'Positive (+)', text: slide.positive, color: 'green' },
          { label: 'Negative (−)', text: slide.negative, color: 'red' },
          { label: 'Question (?)', text: slide.question, color: 'blue' }
        ].map((item) => (
          <div key={item.label} className={`p-4 bg-${item.color}-50 rounded-xl border border-${item.color}-200`}>
            <span className={`text-xs font-bold text-${item.color}-600 uppercase`}>{item.label}</span>
            <p className="text-gray-800 mt-1 text-lg">{item.text}</p>
          </div>
        ))}
      </div>
      {slide.notes?.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs font-bold text-gray-500 uppercase mb-2">Notes</p>
          <ul className="space-y-1">
            {slide.notes.map((n, i) => <li key={i} className="text-sm text-gray-700 flex items-start gap-2"><span className="text-indigo-500 mt-0.5">&#8226;</span>{n}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

function MeaningSlide({ slide }) {
  return (
    <div className="space-y-5" data-testid="slide-meaning">
      <div className="flex justify-between items-start">
        <p className="text-gray-700 text-lg leading-relaxed">{slide.explanation}</p>
        <TranslationToggle text={slide.explanation} context="grammar meaning explanation" />
      </div>
      {slide.when_to_use?.length > 0 && (
        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
          <p className="text-xs font-bold text-emerald-600 uppercase mb-2">When to Use</p>
          <ul className="space-y-2">
            {slide.when_to_use.map((u, i) => (
              <li key={i} className="flex items-start gap-2 text-gray-700">
                <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />{u}
              </li>
            ))}
          </ul>
        </div>
      )}
      {slide.signal_words?.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase mb-2">Signal Words</p>
          <div className="flex flex-wrap gap-2">
            {slide.signal_words.map((w, i) => (
              <Badge key={i} className="bg-indigo-100 text-indigo-700 border-0 px-3 py-1">{w}</Badge>
            ))}
          </div>
        </div>
      )}
      {slide.time_reference && (
        <div className="bg-blue-50 rounded-xl p-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-500" />
          <p className="text-sm text-blue-800">{slide.time_reference}</p>
        </div>
      )}
    </div>
  );
}

function ExamplesSlide({ slide }) {
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.85;
      window.speechSynthesis.speak(u);
    }
  };
  return (
    <div className="space-y-4" data-testid="slide-examples">
      {slide.examples?.map((ex, i) => (
        <div key={i} className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="p-4 flex items-start gap-3">
            <span className="bg-indigo-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">{i + 1}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-lg text-gray-800 font-medium">{ex.sentence}</p>
                <button onClick={() => speak(ex.sentence)} className="text-gray-400 hover:text-indigo-500" data-testid={`speak-example-${i}`}>
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              {ex.explanation && <p className="text-sm text-gray-500 mt-1">{ex.explanation}</p>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CommonMistakesSlide({ slide }) {
  return (
    <div className="space-y-4" data-testid="slide-mistakes">
      <TranslationToggle
        text={slide.mistakes?.map(m => `Wrong: ${m.wrong}\nCorrect: ${m.correct}\nWhy: ${m.explanation}`).join('\n\n')}
        context="common grammar mistakes"
      />
      {slide.mistakes?.map((m, i) => (
        <div key={i} className="bg-white rounded-xl border shadow-sm p-4">
          <div className="flex items-start gap-3 mb-2">
            <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-red-700 line-through text-lg">{m.wrong}</p>
          </div>
          <div className="flex items-start gap-3 mb-2">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <p className="text-green-700 font-medium text-lg">{m.correct}</p>
          </div>
          <p className="text-sm text-gray-600 ml-8 bg-gray-50 p-2 rounded">{m.explanation}</p>
        </div>
      ))}
    </div>
  );
}

function IeltsTipSlide({ slide }) {
  return (
    <div className="space-y-4" data-testid="slide-ielts-tip">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 bg-amber-50 rounded-xl border-l-4 border-amber-400">
          <p className="text-xs font-bold text-amber-600 uppercase mb-2">Band 5.5-6.0</p>
          <p className="text-gray-700 italic">{slide.band_55_example}</p>
          <p className="text-xs text-amber-600 mt-2">Simple but correct</p>
        </div>
        <div className="p-4 bg-green-50 rounded-xl border-l-4 border-green-500">
          <p className="text-xs font-bold text-green-600 uppercase mb-2">Band 7.0+</p>
          <p className="text-gray-700 italic">{slide.band_70_example}</p>
          <p className="text-xs text-green-600 mt-2">Complex structure + vocabulary</p>
        </div>
      </div>
      {slide.tip && (
        <div className="bg-purple-50 rounded-xl p-4 flex items-start gap-3 border border-purple-200">
          <Lightbulb className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-purple-800 text-sm">IELTS Pro Tip</p>
            <p className="text-purple-700 text-sm mt-1">{slide.tip}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ConceptCheckSlide({ slide, onAllCorrect }) {
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);

  const handleAnswer = (i, val) => {
    if (checked) return;
    setAnswers(prev => ({ ...prev, [i]: val }));
  };

  const handleCheck = () => {
    setChecked(true);
    const allCorrect = slide.questions?.every((q, i) => answers[i] === q.answer);
    if (allCorrect && onAllCorrect) onAllCorrect();
  };

  const allAnswered = slide.questions?.every((_, i) => answers[i] !== undefined);

  return (
    <div className="space-y-4" data-testid="slide-concept-check">
      <p className="text-gray-600">Answer these quick questions to check your understanding:</p>
      {slide.questions?.map((q, i) => {
        const userAnswer = answers[i];
        const isCorrect = checked && userAnswer === q.answer;
        const isWrong = checked && userAnswer !== undefined && userAnswer !== q.answer;
        return (
          <div key={i} className={`p-4 rounded-xl border-2 transition-colors ${isCorrect ? 'border-green-400 bg-green-50' : isWrong ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}`}>
            <p className="font-medium text-gray-800 mb-3">{q.question}</p>
            <div className="flex gap-3">
              {[true, false].map(val => (
                <button
                  key={String(val)}
                  onClick={() => handleAnswer(i, val)}
                  disabled={checked}
                  data-testid={`ccq-${i}-${val}`}
                  className={`px-6 py-2 rounded-lg font-medium text-sm transition-all ${
                    userAnswer === val
                      ? checked
                        ? val === q.answer ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        : 'bg-indigo-500 text-white'
                      : checked && val === q.answer
                        ? 'bg-green-100 text-green-700 border-2 border-green-400'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {val ? 'Yes' : 'No'}
                </button>
              ))}
            </div>
          </div>
        );
      })}
      {!checked && (
        <Button onClick={handleCheck} disabled={!allAnswered} className="w-full" data-testid="check-ccq-btn">
          Check Answers
        </Button>
      )}
      {checked && (
        <div className={`p-3 rounded-lg text-center text-sm font-medium ${slide.questions?.every((q, i) => answers[i] === q.answer) ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
          {slide.questions?.every((q, i) => answers[i] === q.answer) ? 'All correct! You understand this grammar well.' : 'Review the incorrect answers. You can revisit the previous slides.'}
        </div>
      )}
    </div>
  );
}

const SLIDE_ICONS = {
  context_discovery: Search, form: Layers, meaning: BookOpen,
  examples: Award, common_mistakes: AlertTriangle,
  ielts_tip: Lightbulb, concept_check: CheckCircle,
};

const SLIDE_COLORS = {
  context_discovery: 'indigo', form: 'purple', meaning: 'emerald',
  examples: 'blue', common_mistakes: 'red',
  ielts_tip: 'amber', concept_check: 'teal',
};

export default function GrammarLearnMode({ user }) {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const goBack = useGoBack();
  const [data, setData] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/grammar-engine/${moduleId}/learn`);
        if (res.ok) setData(await res.json());
        else toast.error('Failed to load grammar content');
      } catch { toast.error('Connection error'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [moduleId]);

  const goNext = useCallback(() => {
    if (data && currentSlide < data.slides.length - 1) setCurrentSlide(s => s + 1);
  }, [data, currentSlide]);

  const goPrev = useCallback(() => {
    if (currentSlide > 0) setCurrentSlide(s => s - 1);
  }, [currentSlide]);

  useEffect(() => {
    const h = (e) => {
      if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [goNext, goPrev]);

  const handleComplete = async () => {
    if (user) {
      try {
        await fetch(`${API_URL}/api/grammar-engine/progress`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id, module_id: moduleId, stage: 'learn', completed: true }),
        });
      } catch {}
    }
    toast.success('Learn stage complete!');
    navigate(`/grammar/practice/${moduleId}`);
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center" data-testid="grammar-learn-loading">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-gray-200 border-t-indigo-500 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Preparing grammar lesson...</p>
      </div>
    </div>
  );

  if (!data?.slides?.length) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center" data-testid="grammar-learn-empty">
      <Card className="p-8 text-center max-w-md">
        <p className="text-gray-500 mb-4">No grammar content available.</p>
        <Button onClick={goBack}>Go Back</Button>
      </Card>
    </div>
  );

  const slide = data.slides[currentSlide];
  const isLast = currentSlide === data.slides.length - 1;
  const Icon = SLIDE_ICONS[slide.type] || BookOpen;
  const color = SLIDE_COLORS[slide.type] || 'gray';

  const renderSlide = () => {
    switch (slide.type) {
      case 'context_discovery': return <ContextDiscoverySlide slide={slide} />;
      case 'form': return <FormSlide slide={slide} />;
      case 'meaning': return <MeaningSlide slide={slide} />;
      case 'examples': return <ExamplesSlide slide={slide} />;
      case 'common_mistakes': return <CommonMistakesSlide slide={slide} />;
      case 'ielts_tip': return <IeltsTipSlide slide={slide} />;
      case 'concept_check': return <ConceptCheckSlide slide={slide} />;
      default: return <p className="text-gray-500">{JSON.stringify(slide)}</p>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="grammar-learn-page">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={goBack} className="flex items-center gap-1 text-gray-600 hover:text-gray-900" data-testid="grammar-learn-back">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="text-center">
            <p className="text-sm font-bold text-gray-900">{data.title}</p>
            <p className="text-xs text-gray-500">{data.module_topic}</p>
          </div>
          <Badge className="bg-indigo-100 text-indigo-700 border-0">
            {currentSlide + 1} / {data.slides.length}
          </Badge>
        </div>
        <Progress value={((currentSlide + 1) / data.slides.length) * 100} className="h-1" />
      </div>

      {/* Slide Navigation Dots */}
      <div className="max-w-3xl mx-auto px-4 pt-4">
        <div className="flex gap-1 justify-center mb-4">
          {data.slides.map((s, i) => {
            const SIcon = SLIDE_ICONS[s.type] || BookOpen;
            return (
              <button key={i} onClick={() => setCurrentSlide(i)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${i === currentSlide ? 'bg-indigo-500 text-white scale-110' : i < currentSlide ? 'bg-indigo-200 text-indigo-600' : 'bg-gray-200 text-gray-400'}`}
                data-testid={`slide-dot-${i}`}
              >
                <SIcon className="w-3.5 h-3.5" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Slide Content */}
      <div className="max-w-3xl mx-auto px-4 pb-32">
        <Card className="p-6 shadow-lg border-0">
          <div className="flex items-center gap-2 mb-5">
            <div className={`w-9 h-9 rounded-lg bg-${color}-100 flex items-center justify-center`}>
              <Icon className={`w-5 h-5 text-${color}-600`} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{slide.title}</h2>
          </div>
          {renderSlide()}
        </Card>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <Button variant="outline" onClick={goPrev} disabled={currentSlide === 0} data-testid="prev-slide-btn">
            <ChevronLeft className="w-4 h-4 mr-1" /> Previous
          </Button>
          {isLast ? (
            <Button onClick={handleComplete} className="bg-gradient-to-r from-indigo-500 to-purple-600" data-testid="complete-learn-btn">
              Continue to Practice <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={goNext} data-testid="next-slide-btn">
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
