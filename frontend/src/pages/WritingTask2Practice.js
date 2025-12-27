import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { 
  ArrowLeft, PenTool, Clock, RefreshCw, Send, 
  MessageSquare, HelpCircle, Scale, AlertTriangle,
  Lightbulb, CheckCircle, ChevronDown, ChevronUp, 
  Eye, EyeOff, BookOpen
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function WritingTask2Practice() {
  const navigate = useNavigate();
  
  const [prompts, setPrompts] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userResponse, setUserResponse] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [showTips, setShowTips] = useState(true);
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(40 * 60); // 40 minutes
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [selectedType, setSelectedType] = useState('all');

  const essayTypes = [
    { id: 'all', name: 'Tümü', icon: BookOpen },
    { id: 'opinion', name: 'Opinion', icon: MessageSquare },
    { id: 'discussion', name: 'Discussion', icon: Scale },
    { id: 'advantage_disadvantage', name: 'Advantage/Disadvantage', icon: Scale },
    { id: 'problem_solution', name: 'Problem/Solution', icon: AlertTriangle },
  ];

  const tips = {
    opinion: [
      'Clearly state your opinion in the introduction',
      'Support each main point with examples or evidence',
      'Use phrases like "I believe", "In my view", "From my perspective"',
      'Acknowledge the opposing view briefly before refuting it',
    ],
    discussion: [
      'Present both sides of the argument fairly',
      'Use clear topic sentences for each paragraph',
      'Give your own opinion in the conclusion',
      'Use linking words: "On the one hand", "However", "In contrast"',
    ],
    advantage_disadvantage: [
      'Discuss advantages and disadvantages in separate paragraphs',
      'Use specific examples to support each point',
      'Balance the discussion - don\'t focus too much on one side',
      'State which outweighs the other in your opinion',
    ],
    problem_solution: [
      'Clearly identify the problems in one section',
      'Propose realistic and specific solutions',
      'Explain how each solution addresses the problem',
      'Consider who should implement the solutions (government, individuals, etc.)',
    ],
  };

  useEffect(() => {
    loadPrompts();
  }, [selectedType]);

  useEffect(() => {
    const words = userResponse.trim().split(/\s+/).filter(w => w.length > 0);
    setWordCount(words.length);
  }, [userResponse]);

  useEffect(() => {
    let interval;
    if (isTimerRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeRemaining]);

  const loadPrompts = async () => {
    setLoading(true);
    try {
      const typeParam = selectedType !== 'all' ? `&essay_type=${selectedType}` : '';
      const response = await fetch(`${API_URL}/api/question-bank/writing/task2/prompts?${typeParam}`);
      const data = await response.json();
      setPrompts(data.prompts || []);
      if (data.prompts?.length > 0 && !selectedPrompt) {
        setSelectedPrompt(data.prompts[0]);
      }
    } catch (error) {
      console.error('Error loading prompts:', error);
      toast.error('Failed to load prompts');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const submitForEvaluation = async () => {
    if (wordCount < 200) {
      toast.error('En az 200 kelime yazmalısınız');
      return;
    }
    
    setEvaluating(true);
    toast.info('AI değerlendirmesi yapılıyor...');
    
    try {
      const response = await fetch(`${API_URL}/api/question-bank/writing/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          response: userResponse,
          task_type: 'task2',
          topic: selectedPrompt?.topic,
          band_level: selectedPrompt?.band_level || '5.5-6.5'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setEvaluation({
          overall_band: data.evaluation.overall_band,
          task_achievement: data.evaluation.task_achievement,
          coherence_cohesion: data.evaluation.coherence_cohesion,
          lexical_resource: data.evaluation.lexical_resource,
          grammatical_range: data.evaluation.grammatical_range,
          strengths: data.evaluation.strengths || [],
          weaknesses: data.evaluation.weaknesses || [],
          suggestions: data.evaluation.improvement_suggestions || [],
          vocabulary_to_use: data.evaluation.vocabulary_to_use || [],
          grammar_corrections: data.evaluation.grammar_corrections || [],
          examiner_comment: data.evaluation.examiner_comment || ''
        });
        toast.success('Değerlendirme tamamlandı!');
      } else {
        toast.error(data.error || 'Değerlendirme başarısız');
      }
    } catch (error) {
      console.error('Evaluation error:', error);
      toast.error('Değerlendirme sırasında hata oluştu');
    } finally {
      setEvaluating(false);
    }
  };

  const selectNewPrompt = (prompt) => {
    setSelectedPrompt(prompt);
    setUserResponse('');
    setEvaluation(null);
    setShowModelAnswer(false);
  };

  const getTypeColor = (type) => {
    const colors = {
      opinion: 'bg-blue-100 text-blue-700',
      discussion: 'bg-purple-100 text-purple-700',
      advantage_disadvantage: 'bg-green-100 text-green-700',
      problem_solution: 'bg-orange-100 text-orange-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-6 px-6">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/question-bank')}
            className="text-white/80 hover:text-white hover:bg-white/10 mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Soru Bankasına Dön
          </Button>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <PenTool className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Writing Task 2</h1>
                <p className="text-white/80">Essay Writing - 250+ words</p>
              </div>
            </div>
            
            {/* Timer */}
            <div className="flex items-center gap-4">
              <div className={`px-4 py-2 rounded-lg ${timeRemaining < 300 ? 'bg-red-500/20' : 'bg-white/20'}`}>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span className="text-xl font-mono font-bold">{formatTime(timeRemaining)}</span>
                </div>
              </div>
              <Button
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => setIsTimerRunning(!isTimerRunning)}
              >
                {isTimerRunning ? 'Durdur' : 'Başlat'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Prompt Selection */}
          <div className="space-y-4">
            {/* Essay Type Filter */}
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Essay Tipi</h3>
              <div className="flex flex-wrap gap-2">
                {essayTypes.map(type => {
                  const Icon = type.icon;
                  return (
                    <Button
                      key={type.id}
                      variant={selectedType === type.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedType(type.id)}
                      className={selectedType === type.id ? 'bg-blue-600 hover:bg-blue-700' : ''}
                    >
                      <Icon className="w-4 h-4 mr-1" /> {type.name}
                    </Button>
                  );
                })}
              </div>
            </Card>

            {/* Prompt Selection */}
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Soru Seçin</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {prompts.map(prompt => (
                  <div
                    key={prompt.id}
                    onClick={() => selectNewPrompt(prompt)}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      selectedPrompt?.id === prompt.id 
                        ? 'bg-blue-50 border-2 border-blue-300' 
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getTypeColor(prompt.type)}>{prompt.type}</Badge>
                      <Badge variant="outline">{prompt.band_level}</Badge>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2">{prompt.prompt}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Selected Prompt Display */}
            {selectedPrompt && (
              <Card className="p-6 bg-white">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={getTypeColor(selectedPrompt.type)}>{selectedPrompt.type}</Badge>
                  <Badge variant="outline">{selectedPrompt.band_level}</Badge>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg mb-4">
                  <p className="text-gray-800 font-medium leading-relaxed">
                    {selectedPrompt.prompt}
                  </p>
                </div>

                <p className="text-sm text-gray-500 mb-4">
                  <em>Write at least 250 words.</em>
                </p>

                {/* Key Points */}
                {selectedPrompt.key_points && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-blue-500" /> Ele Alınması Gereken Noktalar
                    </h4>
                    <ul className="space-y-1">
                      {selectedPrompt.key_points.map((point, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Useful Vocabulary */}
                {selectedPrompt.useful_vocabulary && (
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-800 mb-2 text-sm">📚 Faydalı Kelimeler</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPrompt.useful_vocabulary.map((word, idx) => (
                        <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Tips */}
            {selectedPrompt && (
              <Card className="p-4">
                <Button
                  variant="ghost"
                  className="w-full flex items-center justify-between"
                  onClick={() => setShowTips(!showTips)}
                >
                  <span className="flex items-center gap-2 font-semibold text-gray-900">
                    <Lightbulb className="w-5 h-5 text-amber-500" /> Yazma İpuçları
                  </span>
                  {showTips ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
                
                {showTips && (
                  <ul className="mt-3 space-y-2">
                    {tips[selectedPrompt.type]?.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            )}
          </div>

          {/* Right Panel - Writing */}
          <div className="space-y-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Yanıtınız</h3>
                <div className={`text-sm font-medium ${wordCount >= 250 ? 'text-green-600' : 'text-amber-600'}`}>
                  {wordCount} kelime {wordCount < 250 && `(${250 - wordCount} daha gerekli)`}
                </div>
              </div>
              
              <Textarea
                value={userResponse}
                onChange={(e) => setUserResponse(e.target.value)}
                placeholder="Essay'inizi buraya yazın. Giriş paragrafıyla başlayın, ana argümanlarınızı geliştirin ve güçlü bir sonuçla bitirin..."
                className="min-h-[400px] text-base leading-relaxed"
              />

              <div className="mt-4 flex gap-3">
                <Button
                  onClick={submitForEvaluation}
                  disabled={evaluating || wordCount < 200}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {evaluating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Değerlendiriliyor...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" /> Değerlendir
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowModelAnswer(!showModelAnswer)}
                >
                  {showModelAnswer ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                  Model Yanıt
                </Button>
              </div>
            </Card>

            {/* Evaluation Results */}
            {evaluation && (
              <Card className="p-6 border-2 border-blue-200 bg-blue-50/50">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" /> Değerlendirme Sonuçları
                </h3>
                
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-blue-600 mb-1">
                    Band {evaluation.overall_band}
                  </div>
                  <p className="text-sm text-gray-500">Genel Band Puanı</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    { name: 'Task Response', data: evaluation.task_achievement },
                    { name: 'Coherence & Cohesion', data: evaluation.coherence_cohesion },
                    { name: 'Lexical Resource', data: evaluation.lexical_resource },
                    { name: 'Grammar', data: evaluation.grammatical_range },
                  ].map(criterion => (
                    <div key={criterion.name} className="bg-white p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">{criterion.name}</span>
                        <Badge variant="outline">{criterion.data?.score}</Badge>
                      </div>
                      <p className="text-xs text-gray-500">{criterion.data?.feedback}</p>
                    </div>
                  ))}
                </div>

                {/* Suggestions */}
                {evaluation.suggestions?.length > 0 && (
                  <div className="bg-white p-4 rounded-lg mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">İyileştirme Önerileri</h4>
                    <ul className="space-y-2">
                      {evaluation.suggestions.map((sug, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                          <span className="text-amber-500">•</span> {sug}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-2 gap-4">
                  {evaluation.strengths?.length > 0 && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2 text-sm">✅ Güçlü Yönler</h4>
                      <ul className="space-y-1">
                        {evaluation.strengths.map((s, idx) => (
                          <li key={idx} className="text-xs text-green-700">• {s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {evaluation.weaknesses?.length > 0 && (
                    <div className="bg-red-50 p-3 rounded-lg">
                      <h4 className="font-semibold text-red-800 mb-2 text-sm">⚠️ Geliştirilecek</h4>
                      <ul className="space-y-1">
                        {evaluation.weaknesses.map((w, idx) => (
                          <li key={idx} className="text-xs text-red-700">• {w}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Examiner Comment */}
                {evaluation.examiner_comment && (
                  <div className="mt-4 p-4 bg-gray-100 rounded-lg border-l-4 border-blue-500">
                    <h4 className="font-semibold text-gray-800 mb-1 text-sm">💬 Sınav Görevlisi Yorumu</h4>
                    <p className="text-sm text-gray-700">{evaluation.examiner_comment}</p>
                  </div>
                )}
              </Card>
            )}

            {/* Model Answer */}
            {showModelAnswer && selectedPrompt && (
              <Card className="p-6 border-2 border-indigo-200 bg-indigo-50/50">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-indigo-600" /> Model Yanıt (Band 9)
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {selectedPrompt.type === 'opinion' ? `The question of whether [topic] is a subject that has generated considerable debate in recent years. While some argue that [view 1], others contend that [view 2]. In my opinion, [your clear stance].

There are several compelling reasons why [main argument 1]. Firstly, [supporting point with evidence]. Furthermore, [additional supporting point]. This clearly demonstrates that [conclusion of paragraph].

On the other hand, some people believe that [opposing view]. They argue that [opposing argument]. However, this perspective fails to consider [counter-argument].

In addition, [main argument 2]. Research has shown that [evidence]. This is particularly significant because [explanation].

In conclusion, while there are valid arguments on both sides, I firmly believe that [restate opinion]. It is essential that [recommendation or call to action].` : 
                  `This essay would provide a detailed model answer for a ${selectedPrompt.type} essay on the topic of ${selectedPrompt.topic}.`}
                </p>
                <p className="text-xs text-gray-500 mt-3 italic">
                  Not: Bu şablon bir model yanıttır. Gerçek model yanıtlar spesifik soruya göre oluşturulur.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
