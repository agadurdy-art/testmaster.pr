import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import {
  ArrowLeft, ChevronRight, CheckCircle, XCircle,
  PenTool, Eye, RefreshCw, Lightbulb, Award
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

function RecognitionSection({ items, onComplete }) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const scoreRef = React.useRef(0);

  if (!items?.length) return <p className="text-gray-500">No exercises available.</p>;
  const item = items[idx];
  if (!item) return <p className="text-gray-500">Loading...</p>;

  const handleSelect = (optIdx) => {
    if (showFeedback) return;
    setSelected(optIdx);
    setShowFeedback(true);
    if (optIdx === item.correct_index) scoreRef.current += 1;
  };

  const handleNext = () => {
    if (idx < items.length - 1) {
      setSelected(null);
      setShowFeedback(false);
      setIdx(i => i + 1);
    } else {
      const pct = items.length > 0 ? Math.round((scoreRef.current / items.length) * 100) : 0;
      onComplete(pct);
    }
  };

  return (
    <div data-testid="practice-recognition">
      <div className="mb-4 flex justify-between items-center">
        <Badge className="bg-blue-100 text-blue-700 border-0"><Eye className="w-3 h-3 mr-1" /> {idx + 1}/{items.length}</Badge>
      </div>
      <p className="text-gray-600 mb-4 font-medium">Which sentence is correct?</p>
      <div className="space-y-3">
        {item.options?.map((opt, oi) => {
          const isCorrect = oi === item.correct_index;
          let cls = 'border-gray-200 hover:border-blue-400 hover:bg-blue-50';
          if (showFeedback) {
            if (isCorrect) cls = 'border-green-500 bg-green-50';
            else if (oi === selected) cls = 'border-red-500 bg-red-50';
            else cls = 'border-gray-200 opacity-50';
          }
          return (
            <button key={oi} onClick={() => handleSelect(oi)} disabled={showFeedback}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${cls}`}
              data-testid={`rec-option-${oi}`}>
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold">{String.fromCharCode(65 + oi)}</span>
                <span className="text-gray-800">{opt}</span>
                {showFeedback && isCorrect && <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />}
                {showFeedback && oi === selected && !isCorrect && <XCircle className="w-5 h-5 text-red-500 ml-auto" />}
              </div>
            </button>
          );
        })}
      </div>
      {showFeedback && (
        <div className={`mt-4 p-3 rounded-lg text-sm ${selected === item.correct_index ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
          {item.explanation}
        </div>
      )}
      {showFeedback && (
        <div className="mt-4 text-center">
          <Button onClick={handleNext} data-testid="rec-next-btn">{idx < items.length - 1 ? 'Next' : 'Continue'} <ChevronRight className="w-4 h-4 ml-1" /></Button>
        </div>
      )}
    </div>
  );
}

function GapFillSection({ items, onComplete }) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const scoreRef = React.useRef(0);

  if (!items?.length) return <p className="text-gray-500">No exercises available.</p>;
  const item = items[idx];
  if (!item) return <p className="text-gray-500">Loading...</p>;

  const handleSelect = (opt) => {
    if (showFeedback) return;
    setSelected(opt);
    setShowFeedback(true);
    if (opt.toLowerCase().trim() === item.correct?.toLowerCase().trim()) scoreRef.current += 1;
  };

  const handleNext = () => {
    if (idx < items.length - 1) {
      setSelected(null);
      setShowFeedback(false);
      setIdx(i => i + 1);
    } else {
      const pct = items.length > 0 ? Math.round((scoreRef.current / items.length) * 100) : 0;
      onComplete(pct);
    }
  };

  const renderSentence = () => {
    const parts = (item.sentence || '').split('___');
    if (parts.length < 2) return <p className="text-xl text-gray-800">{item.sentence}</p>;
    return (
      <p className="text-xl text-gray-800 leading-relaxed">
        {parts[0]}
        <span className={`inline-block min-w-[80px] mx-1 px-3 py-1 rounded-lg border-2 font-bold ${
          showFeedback
            ? selected?.toLowerCase().trim() === item.correct?.toLowerCase().trim()
              ? 'bg-green-100 border-green-400 text-green-700'
              : 'bg-red-100 border-red-400 text-red-700'
            : 'bg-indigo-50 border-indigo-300 border-dashed text-indigo-600'
        }`}>
          {showFeedback ? item.correct : (selected || '______')}
        </span>
        {parts[1]}
      </p>
    );
  };

  return (
    <div data-testid="practice-gap-fill">
      <div className="mb-4 flex justify-between items-center">
        <Badge className="bg-purple-100 text-purple-700 border-0"><PenTool className="w-3 h-3 mr-1" /> {idx + 1}/{items.length}</Badge>
      </div>
      <div className="bg-gray-50 rounded-xl p-6 mb-4">{renderSentence()}</div>
      {item.hint && !showFeedback && (
        <p className="text-sm text-amber-600 mb-3 flex items-center gap-1"><Lightbulb className="w-3.5 h-3.5" /> {item.hint}</p>
      )}
      <div className="grid grid-cols-2 gap-3">
        {item.options?.map((opt) => {
          const isCorrect = opt.toLowerCase().trim() === item.correct?.toLowerCase().trim();
          let cls = 'border-gray-200 hover:border-purple-400 hover:bg-purple-50';
          if (showFeedback) {
            if (isCorrect) cls = 'border-green-500 bg-green-50 font-bold';
            else if (opt === selected) cls = 'border-red-500 bg-red-50';
            else cls = 'border-gray-200 opacity-50';
          }
          return (
            <button key={opt} onClick={() => handleSelect(opt)} disabled={showFeedback}
              className={`p-4 rounded-xl border-2 text-center text-lg transition-all ${cls}`}
              data-testid={`gap-option-${opt}`}>{opt}</button>
          );
        })}
      </div>
      {showFeedback && (
        <div className="mt-4 text-center">
          <Button onClick={handleNext} data-testid="gap-next-btn">{idx < items.length - 1 ? 'Next' : 'Continue'} <ChevronRight className="w-4 h-4 ml-1" /></Button>
        </div>
      )}
    </div>
  );
}

function ErrorCorrectionSection({ items, onComplete }) {
  const [idx, setIdx] = useState(0);
  const [selectedWord, setSelectedWord] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const scoreRef = React.useRef(0);

  if (!items?.length) return <p className="text-gray-500">No exercises available.</p>;
  const item = items[idx];
  if (!item) return <p className="text-gray-500">Loading...</p>;
  const words = (item.sentence || '').split(/\s+/);

  const handleWordClick = (word) => {
    if (showFeedback) return;
    setSelectedWord(word);
    setShowFeedback(true);
    const clean = (s) => s.toLowerCase().replace(/[.,!?;:'"]/g, '');
    if (clean(word) === clean(item.error_word || '')) scoreRef.current += 1;
  };

  const handleNext = () => {
    if (idx < items.length - 1) {
      setSelectedWord(null);
      setShowFeedback(false);
      setIdx(i => i + 1);
    } else {
      const pct = items.length > 0 ? Math.round((scoreRef.current / items.length) * 100) : 0;
      onComplete(pct);
    }
  };

  const clean = (s) => s.toLowerCase().replace(/[.,!?;:'"]/g, '');
  const isCorrectSelection = selectedWord && clean(selectedWord) === clean(item.error_word || '');

  return (
    <div data-testid="practice-error-correction">
      <div className="mb-4 flex justify-between items-center">
        <Badge className="bg-red-100 text-red-700 border-0"><XCircle className="w-3 h-3 mr-1" /> {idx + 1}/{items.length}</Badge>
      </div>
      <p className="text-gray-600 mb-4 font-medium">Tap the word with the grammar error:</p>
      <div className="bg-gray-50 rounded-xl p-6 mb-4">
        <div className="flex flex-wrap gap-2 justify-center">
          {words.map((word, wi) => {
            const isError = clean(word) === clean(item.error_word || '');
            const isSelected = word === selectedWord;
            let cls = 'bg-white border-2 border-gray-200 hover:border-red-400 hover:bg-red-50 cursor-pointer';
            if (showFeedback) {
              if (isSelected && isCorrectSelection) cls = 'bg-red-200 text-red-800 border-2 border-red-400 line-through';
              else if (isSelected && !isCorrectSelection) cls = 'bg-yellow-200 text-yellow-800 border-2 border-yellow-400';
              else if (isError) cls = 'bg-red-100 text-red-600 border-2 border-red-300';
              else cls = 'bg-gray-100 text-gray-400 border-2 border-gray-200';
            }
            return (
              <button key={wi} onClick={() => handleWordClick(word)} disabled={showFeedback}
                className={`px-4 py-2 rounded-lg font-medium text-lg transition-all ${cls}`}
                data-testid={`err-word-${wi}`}>{word}</button>
            );
          })}
        </div>
      </div>
      {showFeedback && (
        <div className={`p-4 rounded-xl ${isCorrectSelection ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <p className="font-bold mb-1">{isCorrectSelection ? 'Correct!' : 'Not quite!'}</p>
          <p><span className="text-red-600 line-through">{item.error_word}</span> <span className="mx-1">&rarr;</span> <span className="text-green-600 font-bold">{item.correct_word}</span></p>
          {item.explanation && <p className="text-sm text-gray-600 mt-1">{item.explanation}</p>}
        </div>
      )}
      {showFeedback && (
        <div className="mt-4 text-center">
          <Button onClick={handleNext} data-testid="err-next-btn">{idx < items.length - 1 ? 'Next' : 'Continue'} <ChevronRight className="w-4 h-4 ml-1" /></Button>
        </div>
      )}
    </div>
  );
}

const SECTION_ORDER = ['recognition', 'gap_fill', 'transformation', 'error_correction'];
const SECTION_LABELS = { recognition: 'Spot the Grammar', gap_fill: 'Fill the Gap', transformation: 'Transform', error_correction: 'Fix the Mistake' };
const SECTION_ICONS = { recognition: Eye, gap_fill: PenTool, transformation: RefreshCw, error_correction: XCircle };

export default function GrammarPracticeMode({ user }) {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [sectionScores, setSectionScores] = useState({});
  const [allDone, setAllDone] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/grammar-engine/${moduleId}/practice`);
        if (res.ok) setData(await res.json());
        else toast.error('Failed to load practice');
      } catch { toast.error('Connection error'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [moduleId]);

  const sections = data?.sections || [];
  const orderedSections = SECTION_ORDER.map(type => sections.find(s => s.type === type)).filter(Boolean);
  const currentSection = orderedSections[currentSectionIdx];

  const handleSectionComplete = (score) => {
    const newScores = { ...sectionScores, [currentSection.type]: score };
    setSectionScores(newScores);

    if (currentSectionIdx < orderedSections.length - 1) {
      setCurrentSectionIdx(i => i + 1);
    } else {
      setAllDone(true);
      if (user) {
        const avgScore = Math.round(Object.values(newScores).reduce((a, b) => a + b, 0) / Object.values(newScores).length);
        fetch(`${API_URL}/api/grammar-engine/progress`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id, module_id: moduleId, stage: 'practice', completed: true, score: avgScore }),
        }).catch(() => {});
      }
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center" data-testid="grammar-practice-loading">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-gray-200 border-t-purple-500 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Loading practice exercises...</p>
      </div>
    </div>
  );

  if (allDone) {
    const avgScore = Math.round(Object.values(sectionScores).reduce((a, b) => a + b, 0) / Object.values(sectionScores).length);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" data-testid="grammar-practice-complete">
        <Card className="p-8 text-center max-w-md w-full shadow-lg border-0">
          <Award className="w-16 h-16 mx-auto text-purple-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Practice Complete!</h2>
          <p className="text-gray-500 mb-6">Average Score: {avgScore}%</p>
          <div className="space-y-2 mb-6">
            {Object.entries(sectionScores).map(([type, score]) => (
              <div key={type} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">{SECTION_LABELS[type] || type}</span>
                <Badge className={score >= 70 ? 'bg-green-100 text-green-700 border-0' : 'bg-amber-100 text-amber-700 border-0'}>{score}%</Badge>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate(-1)} className="flex-1">Back</Button>
            <Button onClick={() => navigate(`/grammar/quiz/${moduleId}`)} className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600" data-testid="go-to-quiz-btn">
              Checkpoint Quiz <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!currentSection) return null;

  const renderSection = () => {
    if (!currentSection?.items?.length) return <p className="text-gray-500 text-center">No exercises available for this section.</p>;
    const sectionKey = `${currentSection.type}-${currentSectionIdx}`;
    switch (currentSection.type) {
      case 'recognition': return <RecognitionSection key={sectionKey} items={currentSection.items} onComplete={handleSectionComplete} />;
      case 'gap_fill': return <GapFillSection key={sectionKey} items={currentSection.items} onComplete={handleSectionComplete} />;
      case 'error_correction': return <ErrorCorrectionSection key={sectionKey} items={currentSection.items} onComplete={handleSectionComplete} />;
      case 'transformation':
        const transformItems = (currentSection.items || []).map(item => {
          // Deduplicate options and ensure model_answer is included
          const allOpts = [item.model_answer, ...(item.acceptable_answers || [])].filter(Boolean);
          const uniqueOpts = [...new Set(allOpts.map(o => o.trim()))];
          // Add distractors if needed to reach 4 options
          const distractors = ['None of these'];
          const finalOpts = [...uniqueOpts, ...distractors].slice(0, 4);
          // Shuffle options so correct isn't always first
          const shuffled = finalOpts.sort(() => Math.random() - 0.5);
          return {
            ...item,
            sentence: (item.original || '') + ' ___',
            options: shuffled,
            correct: item.model_answer || '',
            hint: item.target_hint || '',
          };
        });
        return <GapFillSection key={sectionKey} items={transformItems} onComplete={handleSectionComplete} />;
      default: return <GapFillSection key={sectionKey} items={currentSection.items} onComplete={handleSectionComplete} />;
    }
  };

  const SIcon = SECTION_ICONS[currentSection.type] || PenTool;

  return (
    <div className="min-h-screen bg-gray-50" data-testid="grammar-practice-page">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-600 hover:text-gray-900" data-testid="grammar-practice-back">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="text-center">
            <p className="text-sm font-bold text-gray-900">{data?.title || 'Grammar Practice'}</p>
            <p className="text-xs text-gray-500">Stage 2: Controlled Practice</p>
          </div>
          <Badge className="bg-purple-100 text-purple-700 border-0">
            {currentSectionIdx + 1} / {orderedSections.length}
          </Badge>
        </div>
        <Progress value={((currentSectionIdx + 1) / orderedSections.length) * 100} className="h-1" />
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Section header */}
        <div className="flex items-center gap-2 mb-4">
          <SIcon className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900">{currentSection.title}</h3>
        </div>
        <p className="text-gray-500 text-sm mb-6">{currentSection.instruction}</p>

        <Card className="p-6 shadow-lg border-0">
          {renderSection()}
        </Card>
      </div>
    </div>
  );
}
