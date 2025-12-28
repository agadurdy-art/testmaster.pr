import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  ArrowLeft, Clock, Edit3, Target, CheckCircle, 
  Lightbulb, BookOpen, Star, Award, Layers,
  Play, Pause, RotateCcw, Send, Eye, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * General Training Writing Task 2 Practice
 * =========================================
 * Essay writing for General Training IELTS
 * - Opinion, Discussion, Problem-Solution, Two-Part questions
 * - Model answers (Band 6 & Band 8.5)
 * - AI evaluation with feedback
 */

export default function GeneralTask2Practice() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlTopic = searchParams.get('topic');
  
  const [prompts, setPrompts] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userResponse, setUserResponse] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [showTips, setShowTips] = useState(true);
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [selectedBand, setSelectedBand] = useState('band_8_5');
  const [timeRemaining, setTimeRemaining] = useState(40 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [selectedType, setSelectedType] = useState(urlTopic || 'all');
  const [modelAnswers, setModelAnswers] = useState(null);

  const essayTypes = [
    { id: 'all', name: 'Tümü', color: 'gray' },
    { id: 'opinion', name: 'Opinion', color: 'blue', description: 'Agree/Disagree essays' },
    { id: 'discussion', name: 'Discussion', color: 'green', description: 'Discuss both views' },
    { id: 'problem_solution', name: 'Problem-Solution', color: 'orange', description: 'Problems and solutions' },
    { id: 'two_part', name: 'Two-Part', color: 'purple', description: 'Answer two questions' }
  ];

  useEffect(() => {
    loadPrompts();
  }, [selectedType]);

  useEffect(() => {
    // Word count
    const words = userResponse.trim().split(/\s+/).filter(w => w.length > 0);
    setWordCount(words.length);
  }, [userResponse]);

  useEffect(() => {
    // Timer
    let interval = null;
    if (isTimerRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeRemaining]);

  const loadPrompts = async () => {
    try {
      const url = selectedType === 'all' 
        ? `${API_URL}/api/question-bank/writing/general/task2/prompts`
        : `${API_URL}/api/question-bank/writing/general/task2/prompts?essay_type=${selectedType}`;
      
      const res = await fetch(url);
      const data = await res.json();
      setPrompts(data.prompts || []);
      
      // Auto-select first prompt if none selected
      if (data.prompts?.length > 0 && !selectedPrompt) {
        await selectPrompt(data.prompts[0]);
      }
    } catch (error) {
      console.error('Error loading prompts:', error);
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const selectPrompt = async (prompt) => {
    setSelectedPrompt(prompt);
    setUserResponse('');
    setEvaluation(null);
    setShowModelAnswer(false);
    setModelAnswers(null);
    
    // Load model answers
    try {
      const res = await fetch(`${API_URL}/api/question-bank/writing/general/task2/prompt/${prompt.id}`);
      const data = await res.json();
      setModelAnswers(data.model_answers);
    } catch (error) {
      console.error('Error loading model answers:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEvaluate = async () => {
    if (wordCount < 200) {
      toast.error('Minimum 250 words required. Current: ' + wordCount);
      return;
    }
    
    setEvaluating(true);
    setIsTimerRunning(false);
    toast.info('AI evaluation in progress...');
    
    try {
      const response = await fetch(`${API_URL}/api/question-bank/writing/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          response: userResponse,
          task_type: 'task2',
          topic: selectedPrompt?.topic || 'general',
          band_level: '5.5-6.5',
          task_description: selectedPrompt?.prompt || '',
          track: 'general'  // Dual-Track: General Training
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
          examiner_comment: data.evaluation.examiner_comment || '',
          recommended_lessons: data.recommended_lessons || []  // Dual-Track lesson recommendations
        });
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

  const getTypeColor = (type) => {
    const colors = {
      opinion: 'bg-blue-100 text-blue-700',
      discussion: 'bg-green-100 text-green-700',
      problem_solution: 'bg-orange-100 text-orange-700',
      two_part: 'bg-purple-100 text-purple-700'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white py-6 px-6">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="ghost"
            className="text-white/80 hover:text-white hover:bg-white/10 mb-4"
            onClick={() => navigate('/question-bank')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Soru Bankası
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2 flex items-center gap-3">
                <Edit3 className="w-7 h-7" />
                General Training - Task 2
              </h1>
              <p className="text-purple-200">Essay Writing - 250+ words</p>
            </div>
            
            {/* Timer */}
            <div className="flex items-center gap-4">
              <div className={`px-4 py-2 rounded-lg ${timeRemaining < 300 ? 'bg-red-500' : 'bg-white/20'}`}>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span className="text-xl font-mono font-bold">{formatTime(timeRemaining)}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                >
                  {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  onClick={() => setTimeRemaining(40 * 60)}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Prompt Selection & Writing Tips */}
          <div className="space-y-4">
            {/* Essay Type Filter */}
            <Card className="p-4">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-600" /> Essay Tipi
              </h3>
              <div className="flex flex-wrap gap-2">
                {essayTypes.map(type => (
                  <Badge
                    key={type.id}
                    className={`cursor-pointer px-3 py-1 ${
                      selectedType === type.id 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setSelectedType(type.id)}
                  >
                    {type.name}
                  </Badge>
                ))}
              </div>
            </Card>
            
            {/* Prompt List */}
            <Card className="p-4">
              <h3 className="font-bold text-gray-900 mb-3">Select Question</h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {prompts.map(prompt => (
                  <div
                    key={prompt.id}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      selectedPrompt?.id === prompt.id
                        ? 'bg-purple-100 border-2 border-purple-500'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                    onClick={() => selectPrompt(prompt)}
                  >
                    <div className="flex items-start gap-2">
                      <Badge className={`${getTypeColor(prompt.type)} text-xs`}>
                        {prompt.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                      {prompt.prompt.split('\n')[0]}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Writing Tips */}
            {showTips && (
              <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-amber-800 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" /> Essay İpuçları
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTips(false)}
                    className="text-amber-600"
                  >
                    Gizle
                  </Button>
                </div>
                <ul className="space-y-2 text-sm text-amber-900">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 text-amber-600" />
                    <span>Giriş paragrafında soruyu yeniden ifade edin</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 text-amber-600" />
                    <span>Her paragraf tek bir ana fikir içersin</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 text-amber-600" />
                    <span>Give examples from your own experience</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 text-amber-600" />
                    <span>Clarify your opinion in the conclusion paragraph</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 text-amber-600" />
                    <span>Use varied linking words (however, moreover, therefore)</span>
                  </li>
                </ul>
              </Card>
            )}
          </div>

          {/* Middle Column - Prompt & Writing Area */}
          <div className="lg:col-span-2 space-y-4">
            {selectedPrompt ? (
              <>
                {/* Task Prompt */}
                <Card className="p-5 border-l-4 border-l-purple-500">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className={getTypeColor(selectedPrompt.type)}>
                      {selectedPrompt.type.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <Badge className="bg-gray-100 text-gray-600">
                      40 minutes • 250+ words
                    </Badge>
                  </div>
                  
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-800 whitespace-pre-line leading-relaxed">
                      {selectedPrompt.prompt}
                    </p>
                  </div>
                  
                  {selectedPrompt.key_points && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs font-semibold text-gray-500 mb-2">KEY POINTS:</p>
                      <ul className="space-y-1">
                        {selectedPrompt.key_points.map((point, idx) => (
                          <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                            <ChevronRight className="w-3 h-3 mt-0.5 text-purple-500" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>

                {/* Writing Area */}
                <Card className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <Edit3 className="w-4 h-4 text-purple-600" /> Your Response
                    </h3>
                    <div className={`text-sm font-medium ${
                      wordCount >= 250 ? 'text-green-600' : 
                      wordCount >= 200 ? 'text-amber-600' : 'text-gray-500'
                    }`}>
                      {wordCount} words {wordCount < 250 && `(${250 - wordCount} more needed)`}
                    </div>
                  </div>
                  
                  <textarea
                    value={userResponse}
                    onChange={(e) => setUserResponse(e.target.value)}
                    className="w-full h-64 p-4 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none text-sm"
                    placeholder="Write your essay here..."
                  />
                  
                  <div className="flex gap-3 mt-4">
                    <Button
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                      onClick={handleEvaluate}
                      disabled={evaluating || wordCount < 200}
                    >
                      {evaluating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Evaluating...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" /> Evaluate
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowModelAnswer(!showModelAnswer)}
                      disabled={!modelAnswers}
                    >
                      <Eye className="w-4 h-4 mr-2" /> Model Answer
                    </Button>
                  </div>
                </Card>

                {/* Evaluation Results */}
                {evaluation && (
                  <Card className="p-5 border-2 border-green-200 bg-green-50/30">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-green-600" /> Değerlendirme Sonucu
                    </h3>
                    
                    {/* Overall Band */}
                    <div className="text-center p-4 bg-white rounded-xl mb-4">
                      <div className="text-4xl font-bold text-green-600 mb-1">
                        Band {evaluation.overall_band}
                      </div>
                      <p className="text-sm text-gray-500">{evaluation.examiner_comment}</p>
                    </div>
                    
                    {/* Criteria Scores */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {[
                        { key: 'task_achievement', label: 'Task Response', icon: Target },
                        { key: 'coherence_cohesion', label: 'Coherence', icon: Layers },
                        { key: 'lexical_resource', label: 'Vocabulary', icon: BookOpen },
                        { key: 'grammatical_range', label: 'Grammar', icon: CheckCircle }
                      ].map(({ key, label, icon: Icon }) => (
                        <div key={key} className="p-3 bg-white rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className="w-4 h-4 text-purple-600" />
                            <span className="text-xs text-gray-600">{label}</span>
                          </div>
                          <div className="text-xl font-bold text-gray-900">
                            {evaluation[key]?.score || '-'}
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-2">
                            {evaluation[key]?.feedback}
                          </p>
                        </div>
                      ))}
                    </div>
                    
                    {/* Strengths & Weaknesses */}
                    <div className="grid grid-cols-2 gap-3">
                      {evaluation.strengths?.length > 0 && (
                        <div className="bg-green-50 p-3 rounded-lg">
                          <h4 className="font-semibold text-green-800 mb-2 text-xs">✅ Strengths</h4>
                          <ul className="space-y-1">
                            {evaluation.strengths.slice(0, 3).map((s, idx) => (
                              <li key={idx} className="text-xs text-green-700">• {s}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {evaluation.weaknesses?.length > 0 && (
                        <div className="bg-amber-50 p-3 rounded-lg">
                          <h4 className="font-semibold text-amber-800 mb-2 text-xs">⚠️ Areas to Improve</h4>
                          <ul className="space-y-1">
                            {evaluation.weaknesses.slice(0, 3).map((w, idx) => (
                              <li key={idx} className="text-xs text-amber-700">• {w}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    {/* Recommended Lessons - General Training Track */}
                    {evaluation.recommended_lessons?.length > 0 && (
                      <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                        <h4 className="font-semibold text-indigo-800 mb-2 text-xs flex items-center gap-1">
                          📚 Recommended Lessons (General Training)
                        </h4>
                        <ul className="space-y-2">
                          {evaluation.recommended_lessons.map((lesson, idx) => (
                            <li 
                              key={idx} 
                              className="text-xs bg-white p-2 rounded border border-indigo-100 cursor-pointer hover:border-indigo-300 transition-colors"
                              onClick={() => navigate(`/courses/mastery/general/${lesson.lesson_id}`)}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-indigo-700">{lesson.title}</span>
                                <Badge className="bg-indigo-100 text-indigo-600 text-xs">
                                  {lesson.stage?.charAt(0).toUpperCase() + lesson.stage?.slice(1)}
                                </Badge>
                              </div>
                              <p className="text-gray-500 mt-1">{lesson.reason}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </Card>
                )}

                {/* Model Answers */}
                {showModelAnswer && modelAnswers && (
                  <Card className="p-5 border-2 border-purple-200 bg-purple-50/30">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Layers className="w-5 h-5 text-purple-600" /> Model Answerlar
                    </h3>
                    
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
                    
                    <div className="bg-white p-4 rounded-lg border">
                      <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                        {modelAnswers[selectedBand]?.essay || modelAnswers[selectedBand]?.text || 'Model answer not available.'}
                      </p>
                      
                      <div className="mt-3 pt-3 border-t flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {modelAnswers[selectedBand]?.word_count || '-'} words
                        </span>
                        <Badge className={selectedBand === 'band_8_5' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
                          {selectedBand === 'band_8_5' ? 'Band 8.5' : 'Band 6.0'}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                )}
              </>
            ) : (
              <Card className="p-8 text-center">
                <Edit3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Select an essay question from the left</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
