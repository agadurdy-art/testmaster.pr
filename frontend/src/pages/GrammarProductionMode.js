import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Textarea } from '../components/ui/textarea';
import {
  ArrowLeft, ChevronRight, CheckCircle, Loader2,
  Award, PenTool, Send, Lightbulb, Star, Globe
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

function PromptCard({ prompt, grammarTitle, moduleId, onEvaluated }) {
  const [text, setText] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [showModel, setShowModel] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim() || text.trim().split(/\s+/).length < 3) {
      toast.error('Please write at least 3 words');
      return;
    }
    setEvaluating(true);
    try {
      const res = await fetch(`${API_URL}/api/grammar-engine/${moduleId}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sentence: text.trim(),
          grammar_title: grammarTitle,
          grammar_focus: prompt.grammar_focus || '',
          model_answer: prompt.model_answer || '',
          prompt_text: prompt.prompt || prompt.question || '',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setEvaluation(data);
        onEvaluated(data.score || 0);
      }
    } catch { toast.error('Evaluation failed'); }
    finally { setEvaluating(false); }
  };

  return (
    <div className="space-y-4" data-testid={`prompt-${prompt.id}`}>
      <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
        <p className="font-medium text-indigo-900">{prompt.prompt || prompt.question}</p>
        {prompt.scenario && <p className="text-sm text-indigo-700 mt-1 italic">{prompt.scenario}</p>}
        {prompt.starter && (
          <div className="mt-2 bg-white rounded-lg p-3 border">
            <p className="text-sm text-gray-500">Start with:</p>
            <p className="font-medium text-gray-800">{prompt.starter}</p>
          </div>
        )}
      </div>

      {prompt.word_bank?.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase mb-2">Word Bank</p>
          <div className="flex flex-wrap gap-2">
            {prompt.word_bank.map((w, i) => (
              <button key={i} onClick={() => setText(prev => prev ? `${prev} ${w}` : w)}
                className="px-3 py-1.5 bg-white border rounded-lg text-sm hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                data-testid={`word-bank-${i}`}>{w}</button>
            ))}
          </div>
        </div>
      )}

      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={prompt.starter || 'Write your sentence here...'}
        className="min-h-[100px] text-lg"
        disabled={!!evaluation}
        data-testid="production-textarea"
      />

      {!evaluation ? (
        <Button onClick={handleSubmit} disabled={evaluating || !text.trim()} className="w-full" data-testid="submit-production-btn">
          {evaluating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Evaluating...</> : <><Send className="w-4 h-4 mr-2" /> Submit</>}
        </Button>
      ) : (
        <div className="space-y-3">
          <div className={`p-4 rounded-xl border ${evaluation.score >= 4 ? 'bg-green-50 border-green-200' : evaluation.score >= 3 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(s => <Star key={s} className={`w-4 h-4 ${s <= evaluation.score ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />)}
              </div>
              <div className="flex gap-2">
                {evaluation.grammar_correct && <Badge className="bg-green-100 text-green-700 border-0 text-xs">Grammar OK</Badge>}
                {evaluation.target_grammar_used && <Badge className="bg-blue-100 text-blue-700 border-0 text-xs">Target Used</Badge>}
              </div>
            </div>
            <p className="text-sm font-medium">{evaluation.feedback}</p>
            {evaluation.corrected_sentence && evaluation.corrected_sentence !== text.trim() && (
              <div className="mt-2 bg-white rounded-lg p-2">
                <p className="text-xs text-gray-500">Suggested:</p>
                <p className="text-green-700 font-medium">{evaluation.corrected_sentence}</p>
              </div>
            )}
            {evaluation.improvement_tip && (
              <p className="text-xs text-gray-600 mt-2 flex items-start gap-1"><Lightbulb className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-amber-500" /> {evaluation.improvement_tip}</p>
            )}
          </div>

          <button onClick={() => setShowModel(!showModel)} className="text-sm text-indigo-600 hover:text-indigo-800" data-testid="show-model-btn">
            {showModel ? 'Hide' : 'Show'} model answer
          </button>
          {showModel && prompt.model_answer && (
            <div className="bg-indigo-50 rounded-lg p-3 text-sm text-indigo-800 border border-indigo-200">
              <p className="font-medium mb-1">Model Answer:</p>
              <p>{prompt.model_answer}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function GrammarProductionMode({ user, stage = 'guided' }) {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [scores, setScores] = useState([]);
  const [allDone, setAllDone] = useState(false);

  const isGuided = stage === 'guided';
  const endpoint = isGuided ? 'guided-prompts' : 'free-prompts';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/grammar-engine/${moduleId}/${endpoint}`);
        if (res.ok) setData(await res.json());
        else toast.error('Failed to load prompts');
      } catch { toast.error('Connection error'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [moduleId, endpoint]);

  const prompts = data?.prompts || [];
  const prompt = prompts[currentIdx];

  const handleEvaluated = (score) => {
    setScores(prev => [...prev, score]);
  };

  const handleNext = () => {
    if (currentIdx < prompts.length - 1) {
      setCurrentIdx(i => i + 1);
    } else {
      setAllDone(true);
      if (user) {
        const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
        fetch(`${API_URL}/api/grammar-engine/progress`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id, module_id: moduleId, stage, completed: true, score: avgScore * 20 }),
        }).catch(() => {});
      }
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center" data-testid={`grammar-${stage}-loading`}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-gray-200 border-t-green-500 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Loading {isGuided ? 'guided' : 'free'} production...</p>
      </div>
    </div>
  );

  if (allDone) {
    const avgScore = scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 20) : 0;
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" data-testid={`grammar-${stage}-complete`}>
        <Card className="p-8 text-center max-w-md w-full shadow-lg border-0">
          <Award className="w-16 h-16 mx-auto text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{isGuided ? 'Guided' : 'Free'} Production Complete!</h2>
          <p className="text-gray-500 mb-4">Average Score: {avgScore}%</p>
          <div className="flex justify-center gap-1 mb-6">
            {[1, 2, 3, 4, 5].map(s => {
              const avgStars = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
              return <Star key={s} className={`w-8 h-8 ${s <= avgStars ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />;
            })}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate(-1)} className="flex-1">Back</Button>
            {isGuided ? (
              <Button onClick={() => navigate(`/grammar/free/${moduleId}`)} className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600" data-testid="go-to-free-btn">
                Free Production <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={() => navigate(-2)} className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600" data-testid="finish-grammar-btn">
                <CheckCircle className="w-4 h-4 mr-1" /> Finish
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  if (!prompt) return null;

  return (
    <div className="min-h-screen bg-gray-50" data-testid={`grammar-${stage}-page`}>
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-600 hover:text-gray-900" data-testid={`grammar-${stage}-back`}>
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="text-center">
            <p className="text-sm font-bold text-gray-900">{data?.title || `${isGuided ? 'Guided' : 'Free'} Production`}</p>
            <p className="text-xs text-gray-500">Stage {isGuided ? '4' : '5'}: {isGuided ? 'Guided' : 'Free'} Production</p>
          </div>
          <Badge className="bg-green-100 text-green-700 border-0">{currentIdx + 1}/{prompts.length}</Badge>
        </div>
        <Progress value={((currentIdx + 1) / prompts.length) * 100} className="h-1" />
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 pb-24">
        <Card className="p-6 shadow-lg border-0">
          <PromptCard
            key={prompt.id}
            prompt={prompt}
            grammarTitle={data?.title || ''}
            moduleId={moduleId}
            onEvaluated={handleEvaluated}
          />
        </Card>
      </div>

      {scores.length > currentIdx && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
          <div className="max-w-3xl mx-auto text-center">
            <Button onClick={handleNext} data-testid={`${stage}-next-btn`}>
              {currentIdx < prompts.length - 1 ? 'Next Prompt' : 'See Results'} <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
