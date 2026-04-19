import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { 
  ArrowLeft, PenTool, Clock, RefreshCw, Send, 
  MessageSquare, HelpCircle, Scale, AlertTriangle,
  Lightbulb, CheckCircle, ChevronDown, ChevronUp, 
  Eye, EyeOff, BookOpen, Award, Layers, Star
} from 'lucide-react';
import { toast } from 'sonner';
import { getRecommendedLessonPath } from '../lib/recommendationRouting';

const API_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * ULTRA MASTER PROMPT - Writing Task 2 Practice
 * =============================================
 * Features:
 * - Academic vs General Training selection
 * - Band 6 and Band 8.5 model answers
 * - Three-layer evaluation system
 * - Side-by-side prompt and writing area
 * - Course-driven lesson recommendations
 */

export default function WritingTask2Practice() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const examType = searchParams.get('type') || 'academic'; // academic or general
  const urlTopic = searchParams.get('topic');
  const urlBand = searchParams.get('band') || '5.5-6.5';
  
  const [prompts, setPrompts] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userResponse, setUserResponse] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [showTips, setShowTips] = useState(true);
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [selectedBand, setSelectedBand] = useState('band_8_5'); // band_6 or band_8_5
  const [timeRemaining, setTimeRemaining] = useState(40 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [selectedType, setSelectedType] = useState(urlTopic || 'all');
  const [targetBand, setTargetBand] = useState(urlBand);
  const [modelAnswers, setModelAnswers] = useState(null);
  const [recommendedLessons, setRecommendedLessons] = useState([]);

  const essayTypes = [
    { id: 'all', name: 'All', icon: BookOpen },
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
    two_part: [
      'Address both parts of the question equally',
      'Structure your essay clearly with separate sections',
      'Provide balanced arguments for each part',
      'Make sure your conclusion addresses both parts',
    ],
  };

  useEffect(() => {
    loadPrompts();
  }, [selectedType, examType]);

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
        selectNewPrompt(data.prompts[0]);
      }
    } catch (error) {
      console.error('Error loading prompts:', error);
      toast.error('Failed to load prompts');
    } finally {
      setLoading(false);
    }
  };

  const loadModelAnswers = async (promptId) => {
    try {
      const response = await fetch(`${API_URL}/api/question-bank/writing/task2/prompt/${promptId}`);
      const data = await response.json();
      if (data.model_answers) {
        setModelAnswers(data.model_answers);
      }
    } catch (error) {
      console.error('Error loading model answers:', error);
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
          band_level: selectedPrompt?.band_level || '5.5-6.5',
          task_description: selectedPrompt?.prompt || ''
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
          high_priority_fixes: data.evaluation.high_priority_fixes || [],
          response_diagnosis: data.evaluation.response_diagnosis || {},
          band_justification: data.evaluation.band_justification || '',
          line_by_line_corrections: data.evaluation.line_by_line_corrections || [],
          rewrite_guidance: data.evaluation.rewrite_guidance || {},
          vocabulary_to_use: data.evaluation.vocabulary_to_use || [],
          grammar_corrections: data.evaluation.grammar_corrections || [],
          examiner_comment: data.evaluation.examiner_comment || ''
        });
        // Store recommended lessons from ULTRA MASTER PROMPT
        if (data.recommended_lessons && data.recommended_lessons.length > 0) {
          setRecommendedLessons(data.recommended_lessons);
        }
        toast.success('Evaluation complete!');
      } else {
        toast.error(data.error || 'Evaluation failed');
      }
    } catch (error) {
      console.error('Evaluation error:', error);
      toast.error('Error during evaluation');
    } finally {
      setEvaluating(false);
    }
  };

  const selectNewPrompt = async (prompt) => {
    setSelectedPrompt(prompt);
    setUserResponse('');
    setEvaluation(null);
    setRecommendedLessons([]);
    setShowModelAnswer(false);
    setModelAnswers(null);
    
    // Load model answers for this prompt
    await loadModelAnswers(prompt.id);
  };

  const getTypeColor = (type) => {
    const colors = {
      opinion: 'bg-blue-100 text-blue-700',
      discussion: 'bg-purple-100 text-purple-700',
      advantage_disadvantage: 'bg-green-100 text-green-700',
      problem_solution: 'bg-orange-100 text-orange-700',
      two_part: 'bg-pink-100 text-pink-700',
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
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-4 md:px-6 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/question-bank')}
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <PenTool className="w-5 h-5" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg font-bold">Writing Task 2</h1>
                  <p className="text-white/80 text-xs">Essay Writing - 250+ words</p>
                </div>
              </div>
            </div>
            
            {/* Timer */}
            <div className="flex items-center gap-2 md:gap-4">
              <div className={`px-3 py-1.5 rounded-lg text-sm md:text-base ${
                timeRemaining < 300 ? 'bg-red-500/30' : 'bg-white/20'
              }`}>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="font-mono font-bold">{formatTime(timeRemaining)}</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => setIsTimerRunning(!isTimerRunning)}
              >
                {isTimerRunning ? 'Durdur' : 'Başlat'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Side by Side */}
      <div className="max-w-[1600px] mx-auto">
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)]">
          
          {/* LEFT PANEL - Prompt Selection (40%) */}
          <div className="lg:w-[40%] lg:border-r border-gray-200 lg:sticky lg:top-[80px] lg:h-[calc(100vh-80px)] lg:overflow-y-auto">
            <div className="p-4 md:p-6 space-y-4">
              
              {/* Essay Type Filter */}
              <Card className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Essay Tipi</h3>
                <div className="flex flex-wrap gap-2">
                  {essayTypes.map(type => {
                    const Icon = type.icon;
                    return (
                      <Button
                        key={type.id}
                        variant={selectedType === type.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedType(type.id)}
                        className={`text-xs ${selectedType === type.id ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                      >
                        <Icon className="w-3.5 h-3.5 mr-1" /> {type.name}
                      </Button>
                    );
                  })}
                </div>
              </Card>

              {/* Prompt Selection */}
              <Card className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Select Question</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
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
                        <Badge className={`text-xs ${getTypeColor(prompt.type)}`}>{prompt.type}</Badge>
                      </div>
                      <p className="text-xs text-gray-700 line-clamp-2">{prompt.prompt}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Selected Prompt Display */}
              {selectedPrompt && (
                <Card className="p-4 bg-white border-2 border-blue-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className={getTypeColor(selectedPrompt.type)}>{selectedPrompt.type}</Badge>
                    <Badge variant="outline" className="text-xs">{selectedPrompt.topic}</Badge>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg mb-3">
                    <p className="text-sm text-gray-800 font-medium leading-relaxed">
                      {selectedPrompt.prompt}
                    </p>
                  </div>

                  <p className="text-xs text-gray-500 mb-3">
                    <em>Write at least 250 words.</em>
                  </p>

                  {/* Key Points */}
                  {selectedPrompt.key_points?.length > 0 && (
                    <div className="mb-3">
                      <h4 className="font-semibold text-gray-900 mb-2 text-xs flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5 text-blue-500" /> Ele Alınması Gerekenler
                      </h4>
                      <ul className="space-y-1">
                        {selectedPrompt.key_points.map((point, idx) => (
                          <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                            <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Useful Vocabulary */}
                  {selectedPrompt.useful_vocabulary?.length > 0 && (
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <h4 className="font-semibold text-purple-800 mb-1 text-xs">📚 Faydalı Kelimeler</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedPrompt.useful_vocabulary.map((word, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                            {word}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              )}

              {/* Tips - Collapsible */}
              {selectedPrompt && (
                <Card className="overflow-hidden">
                  <button
                    className="w-full p-3 flex items-center justify-between text-left"
                    onClick={() => setShowTips(!showTips)}
                  >
                    <span className="flex items-center gap-2 font-semibold text-gray-900 text-sm">
                      <Lightbulb className="w-4 h-4 text-amber-500" /> Yazma İpuçları
                    </span>
                    {showTips ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  
                  {showTips && (
                    <div className="px-3 pb-3 border-t">
                      <ul className="mt-2 space-y-1">
                        {tips[selectedPrompt.type]?.map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-1 text-xs text-gray-600">
                            <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>
              )}
            </div>
          </div>

          {/* RIGHT PANEL - Writing Area (60%) */}
          <div className="lg:w-[60%]">
            <div className="p-4 md:p-6 space-y-4">
              
              {/* Writing Area */}
              <Card className="p-4 md:p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 text-sm">Yanıtınız</h3>
                  <div className={`text-sm font-medium ${
                    wordCount >= 250 ? 'text-green-600' : wordCount >= 200 ? 'text-amber-600' : 'text-red-500'
                  }`}>
                    {wordCount} kelime
                    {wordCount < 250 && (
                      <span className="text-gray-400 ml-1">
                        ({250 - wordCount} daha gerekli)
                      </span>
                    )}
                  </div>
                </div>
                
                <Textarea
                  value={userResponse}
                  onChange={(e) => setUserResponse(e.target.value)}
                  placeholder="Essay'inizi buraya yazın. Giriş paragrafıyla başlayın, ana argümanlarınızı geliştirin ve güçlü bir sonuçla bitirin..."
                  className="min-h-[300px] text-sm leading-relaxed resize-none"
                />

                <div className="mt-4 flex flex-col sm:flex-row gap-3">
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
                    Model Yanıtlar
                  </Button>
                </div>
              </Card>

              {/* Evaluation Results */}
              {evaluation && (
                <Card className="p-5 border-2 border-blue-200 bg-blue-50/50">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-full mb-2">
                      <Award className="w-7 h-7 text-blue-600" />
                    </div>
                    <div className="text-3xl font-bold text-blue-600">
                      Band {evaluation.overall_band}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Overall Band Score</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[
                      { name: 'Task Response', data: evaluation.task_achievement },
                      { name: 'Coherence', data: evaluation.coherence_cohesion },
                      { name: 'Lexical', data: evaluation.lexical_resource },
                      { name: 'Grammar', data: evaluation.grammatical_range },
                    ].map(criterion => (
                      <div key={criterion.name} className="bg-white p-2 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600">{criterion.name}</span>
                          <Badge variant="outline" className="text-xs">{criterion.data?.score}</Badge>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-2">{criterion.data?.feedback}</p>
                      </div>
                    ))}
                  </div>

                  {/* Suggestions & Feedback */}
                  <div className="grid grid-cols-2 gap-3">
                    {evaluation.strengths?.length > 0 && (
                      <div className="bg-green-50 p-3 rounded-lg">
                        <h4 className="font-semibold text-green-800 mb-2 text-xs">✅ Güçlü Yönler</h4>
                        <ul className="space-y-1">
                          {evaluation.strengths.slice(0, 3).map((s, idx) => (
                            <li key={idx} className="text-xs text-green-700">• {s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {evaluation.weaknesses?.length > 0 && (
                      <div className="bg-amber-50 p-3 rounded-lg">
                        <h4 className="font-semibold text-amber-800 mb-2 text-xs">⚠️ Geliştirilecek</h4>
                        <ul className="space-y-1">
                          {evaluation.weaknesses.slice(0, 3).map((w, idx) => (
                            <li key={idx} className="text-xs text-amber-700">• {w}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {/* ULTRA MASTER PROMPT: Recommended Lessons */}
                    {recommendedLessons.length > 0 && (
                      <div className="bg-purple-50 p-3 rounded-lg border border-purple-200 col-span-2">
                        <h4 className="font-semibold text-purple-800 mb-2 text-xs flex items-center gap-2">
                          Recommended Lessons
                          <Badge className="bg-purple-100 text-purple-600 text-xs">Kurs Odaklı</Badge>
                        </h4>
                        <p className="text-xs text-purple-600 mb-2">
                          Zayıf noktalarınızı geliştirmek için bu dersleri çalışın:
                        </p>
                        <div className="space-y-2">
                          {recommendedLessons.map((lesson, idx) => (
                            <div 
                              key={idx}
                              className="p-2 bg-white rounded-lg border border-purple-100 cursor-pointer hover:border-purple-300 transition-colors"
                              onClick={() => navigate(getRecommendedLessonPath(lesson))}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-800">{lesson.title}</p>
                                  <p className="text-xs text-gray-500">{lesson.reason}</p>
                                </div>
                                <Badge 
                                  className={`text-xs ${
                                    lesson.stage === 'beginner' ? 'bg-green-100 text-green-700' :
                                    lesson.stage === 'mastery' ? 'bg-blue-100 text-blue-700' :
                                    'bg-amber-100 text-amber-700'
                                  }`}
                                >
                                  {lesson.band_level}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {evaluation.band_justification && (
                    <div className="mt-4 p-3 bg-slate-50 rounded-lg border">
                      <h4 className="font-semibold text-slate-800 mb-2 text-xs">📏 Band Justification</h4>
                      <p className="text-xs text-gray-700">{evaluation.band_justification}</p>
                    </div>
                  )}

                  {evaluation.high_priority_fixes?.length > 0 && (
                    <div className="mt-4 p-3 bg-rose-50 rounded-lg">
                      <h4 className="font-semibold text-rose-800 mb-2 text-xs">🚨 Highest-Priority Fixes</h4>
                      <ul className="space-y-1">
                        {evaluation.high_priority_fixes.map((fix, idx) => (
                          <li key={idx} className="text-xs text-rose-700">• {fix}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {evaluation.response_diagnosis && Object.keys(evaluation.response_diagnosis).length > 0 && (
                    <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                      <h4 className="font-semibold text-indigo-800 mb-2 text-xs">🧭 Response Diagnosis</h4>
                      <div className="space-y-2">
                        {Object.entries(evaluation.response_diagnosis).map(([key, value]) => (
                          <div key={key} className="bg-white rounded border p-2">
                            <p className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">{key.replace(/_/g, ' ')}</p>
                            <p className="text-xs text-gray-700 mt-1">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {evaluation.line_by_line_corrections?.length > 0 && (
                    <div className="mt-4 p-3 bg-white rounded-lg border">
                      <h4 className="font-semibold text-gray-900 mb-2 text-xs">✍️ Line-by-Line Corrections</h4>
                      <div className="space-y-2">
                        {evaluation.line_by_line_corrections.map((item, idx) => (
                          <div key={idx} className="rounded border p-2 bg-gray-50">
                            <p className="text-xs text-red-700"><strong>Original:</strong> {item.original_line || item.original}</p>
                            <p className="text-xs text-amber-700 mt-1"><strong>Issue:</strong> {item.issue}</p>
                            <p className="text-xs text-green-700 mt-1"><strong>Corrected:</strong> {item.corrected_line || item.improved}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {evaluation.rewrite_guidance && Object.keys(evaluation.rewrite_guidance).length > 0 && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-100">
                      <h4 className="font-semibold text-green-800 mb-2 text-xs">🔁 Rewrite Guidance</h4>
                      <div className="space-y-2">
                        {Object.entries(evaluation.rewrite_guidance).map(([key, value]) => (
                          Array.isArray(value) ? (
                            <div key={key}>
                              <p className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide mb-1">{key.replace(/_/g, ' ')}</p>
                              <ul className="space-y-1">
                                {value.map((item, idx) => <li key={idx} className="text-xs text-gray-700">• {item}</li>)}
                              </ul>
                            </div>
                          ) : (
                            <div key={key} className="bg-white rounded border p-2">
                              <p className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">{key.replace(/_/g, ' ')}</p>
                              <p className="text-xs text-gray-700 mt-1">{value}</p>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              )}

              {/* Model Answers - Band 6 & Band 8.5 */}
              {showModelAnswer && modelAnswers && (
                <Card className="p-5 border-2 border-indigo-200 bg-indigo-50/30">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-600" /> Model Yanıtlar
                  </h3>
                  
                  {/* Band Selection Tabs */}
                  <div className="flex gap-2 mb-4">
                    <Button
                      variant={selectedBand === 'band_6' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedBand('band_6')}
                      className={selectedBand === 'band_6' ? 'bg-amber-500 hover:bg-amber-600' : ''}
                    >
                      <Star className="w-4 h-4 mr-1" /> Band 6.0
                    </Button>
                    <Button
                      variant={selectedBand === 'band_8_5' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedBand('band_8_5')}
                      className={selectedBand === 'band_8_5' ? 'bg-green-600 hover:bg-green-700' : ''}
                    >
                      <Award className="w-4 h-4 mr-1" /> Band 8.5
                    </Button>
                  </div>

                  {/* Model Answer Content */}
                  {modelAnswers[selectedBand] ? (
                    <div>
                      <div className="bg-white p-4 rounded-lg border mb-3">
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                          {modelAnswers[selectedBand].text}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <span>Word Count: {modelAnswers[selectedBand].word_count}</span>
                        <Badge className={selectedBand === 'band_6' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}>
                          Band {modelAnswers[selectedBand].band}
                        </Badge>
                      </div>

                      {/* Characteristics */}
                      {modelAnswers[selectedBand].characteristics && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <h4 className="font-semibold text-gray-800 mb-2 text-xs">Band Characteristics</h4>
                          <ul className="space-y-1">
                            {modelAnswers[selectedBand].characteristics.map((char, idx) => (
                              <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                                <CheckCircle className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                                {char}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">Model answer not available for this prompt.</p>
                    </div>
                  )}

                  {/* Comparison Note */}
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-1 text-xs">Band 6 vs Band 8 Differences</h4>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>- <strong>Band 6:</strong> Basic structures, adequate vocabulary, some errors</li>
                      <li>- <strong>Band 8:</strong> Sophisticated structures, wide vocabulary, minimal errors</li>
                      <li>- Compare both examples to identify your areas for improvement</li>
                    </ul>
                  </div>
                </Card>
              )}

              {/* Show generic model if no specific model answers loaded */}
              {showModelAnswer && !modelAnswers && selectedPrompt && (
                <Card className="p-5 border-2 border-indigo-200 bg-indigo-50/30">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-indigo-600" /> Model Answer Structure
                  </h3>
                  <div className="text-sm text-gray-700 leading-relaxed space-y-3">
                    <p><strong>Introduction:</strong> Paraphrase the topic and state your thesis.</p>
                    <p><strong>Body Paragraph 1:</strong> Support your first main argument with examples and evidence.</p>
                    <p><strong>Body Paragraph 2:</strong> Discuss your second argument or the opposing view.</p>
                    <p><strong>Conclusion:</strong> Summarise your main points and restate your position.</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-3 italic">
                    Note: Select a different prompt to see specific model answers.
                  </p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
