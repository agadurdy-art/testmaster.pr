import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { 
  ArrowLeft, Mail, Clock, RefreshCw, Send, 
  Lightbulb, CheckCircle, ChevronDown, ChevronUp, 
  Eye, EyeOff, Award, Layers, Star, FileText,
  User, Users, Heart
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * General Training Writing Task 1 - Letter Writing
 * =================================================
 * Three types of letters:
 * - Formal (Dear Sir/Madam)
 * - Semi-formal (Dear Mr/Mrs X)
 * - Informal (Dear [Friend])
 * 
 * With Band 6 and Band 8.5 model answers
 */

export default function GeneralTask1Practice() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlTopic = searchParams.get('topic');
  const urlBand = searchParams.get('band') || '5.5-6.5';
  
  const [prompts, setPrompts] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userResponse, setUserResponse] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [showTips, setShowTips] = useState(true);
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [selectedBand, setSelectedBand] = useState('band_8_5');
  const [timeRemaining, setTimeRemaining] = useState(20 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [selectedType, setSelectedType] = useState('all');
  const [modelAnswers, setModelAnswers] = useState(null);

  const letterTypes = [
    { id: 'all', name: 'Tümü', icon: FileText },
    { id: 'formal', name: 'Formal', icon: User, description: 'İş, şikayet, başvuru' },
    { id: 'semi_formal', name: 'Semi-Formal', icon: Users, description: 'Tanıdık ama resmi' },
    { id: 'informal', name: 'Informal', icon: Heart, description: 'Arkadaş, aile' },
  ];

  const tips = {
    formal: [
      'Use "Dear Sir or Madam" if you don\'t know the name',
      'End with "Yours faithfully" (if Dear Sir/Madam) or "Yours sincerely" (if named)',
      'Avoid contractions (use "I am" not "I\'m")',
      'Be polite but direct in stating your purpose',
      'Use formal vocabulary: "I am writing to enquire...", "I would be grateful if..."',
    ],
    semi_formal: [
      'Use "Dear Mr/Mrs [Name]" as the greeting',
      'End with "Yours sincerely" or "Kind regards"',
      'Can use some contractions but maintain professionalism',
      'Be polite while being reasonably direct',
      'Balance between formal and friendly tone',
    ],
    informal: [
      'Use first name: "Dear [Name]" or "Hi [Name]"',
      'End with "Best wishes", "Take care", "Love" (for close friends/family)',
      'Use contractions freely',
      'Include personal touches and emotions',
      'Can use informal expressions and idioms',
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
      const typeParam = selectedType !== 'all' ? `?letter_type=${selectedType}` : '';
      const response = await fetch(`${API_URL}/api/question-bank/writing/general/task1/prompts${typeParam}`);
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
      const response = await fetch(`${API_URL}/api/question-bank/writing/general/task1/prompt/${promptId}`);
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
    if (wordCount < 100) {
      toast.error('Please write at least 100 words');
      return;
    }
    
    setEvaluating(true);
    toast.info('AI evaluation in progress...');
    
    try {
      const response = await fetch(`${API_URL}/api/question-bank/writing/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          response: userResponse,
          task_type: 'task1',
          topic: selectedPrompt?.topic,
          band_level: urlBand || '5.5-6.5',
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

  const selectNewPrompt = async (prompt) => {
    setSelectedPrompt(prompt);
    setUserResponse('');
    setEvaluation(null);
    setShowModelAnswer(false);
    setModelAnswers(null);
    
    // Pre-fill with greeting
    if (prompt.addressee) {
      setUserResponse(`${prompt.addressee}\n\n`);
    }
    
    await loadModelAnswers(prompt.id);
  };

  const getTypeColor = (type) => {
    const colors = {
      formal: 'bg-blue-100 text-blue-700',
      semi_formal: 'bg-purple-100 text-purple-700',
      'semi-formal': 'bg-purple-100 text-purple-700',
      informal: 'bg-green-100 text-green-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const getTypeIcon = (type) => {
    const icons = {
      formal: User,
      semi_formal: Users,
      'semi-formal': Users,
      informal: Heart,
    };
    const Icon = icons[type] || FileText;
    return <Icon className="w-3 h-3" />;
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
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-4 md:px-6 sticky top-0 z-40">
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
                  <Mail className="w-5 h-5" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg font-bold">General Training - Task 1</h1>
                  <p className="text-white/80 text-xs">Letter Writing - 150+ words</p>
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
              
              {/* Letter Type Filter */}
              <Card className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Mektup Tipi</h3>
                <div className="flex flex-wrap gap-2">
                  {letterTypes.map(type => {
                    const Icon = type.icon;
                    return (
                      <Button
                        key={type.id}
                        variant={selectedType === type.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedType(type.id)}
                        className={`text-xs ${selectedType === type.id ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
                      >
                        <Icon className="w-3.5 h-3.5 mr-1" /> {type.name}
                      </Button>
                    );
                  })}
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-gray-500">
                  <div className="flex items-center gap-1"><User className="w-3 h-3" /> İş/Şikayet</div>
                  <div className="flex items-center gap-1"><Users className="w-3 h-3" /> Komşu/Kulüp</div>
                  <div className="flex items-center gap-1"><Heart className="w-3 h-3" /> Arkadaş</div>
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
                          ? 'bg-purple-50 border-2 border-purple-300' 
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={`text-xs ${getTypeColor(prompt.letter_type || prompt.type)}`}>
                          {getTypeIcon(prompt.letter_type || prompt.type)}
                          <span className="ml-1">{prompt.letter_type || prompt.type}</span>
                        </Badge>
                        <Badge variant="outline" className="text-xs">{prompt.topic}</Badge>
                      </div>
                      <p className="text-xs text-gray-700 line-clamp-2">{prompt.prompt?.split('\n')[0]}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Selected Prompt Display */}
              {selectedPrompt && (
                <Card className="p-4 bg-white border-2 border-purple-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className={getTypeColor(selectedPrompt.letter_type || selectedPrompt.type)}>
                      {getTypeIcon(selectedPrompt.letter_type || selectedPrompt.type)}
                      <span className="ml-1">{selectedPrompt.letter_type || selectedPrompt.type}</span>
                    </Badge>
                    <Badge variant="outline" className="text-xs">{selectedPrompt.topic}</Badge>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg mb-3">
                    <p className="text-sm text-gray-800 font-medium leading-relaxed whitespace-pre-line">
                      {selectedPrompt.prompt}
                    </p>
                  </div>

                  <p className="text-xs text-gray-500 mb-3">
                    <em>Write at least 150 words.</em>
                  </p>

                  {/* Letter Format Guide */}
                  <div className="p-3 bg-purple-50 rounded-lg mb-3">
                    <h4 className="font-semibold text-purple-800 mb-2 text-xs">📝 Mektup Formatı</h4>
                    <div className="text-xs text-purple-700 space-y-1">
                      <p><strong>Başlangıç:</strong> {selectedPrompt.addressee}</p>
                      <p><strong>Bitiş:</strong> {selectedPrompt.closing}</p>
                    </div>
                  </div>

                  {/* Key Points */}
                  {selectedPrompt.key_points?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 text-xs flex items-center gap-1">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Ele Alınması Gerekenler
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
                      <Lightbulb className="w-4 h-4 text-amber-500" /> Mektup Yazma İpuçları
                    </span>
                    {showTips ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  
                  {showTips && (
                    <div className="px-3 pb-3 border-t">
                      <ul className="mt-2 space-y-1">
                        {tips[selectedPrompt.letter_type?.replace('-', '_') || selectedPrompt.type]?.map((tip, idx) => (
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
                  <h3 className="font-semibold text-gray-900 text-sm">Mektubunuz</h3>
                  <div className={`text-sm font-medium ${
                    wordCount >= 150 ? 'text-green-600' : wordCount >= 100 ? 'text-amber-600' : 'text-red-500'
                  }`}>
                    {wordCount} words
                    {wordCount < 150 && (
                      <span className="text-gray-400 ml-1">
                        ({150 - wordCount} more needed)
                      </span>
                    )}
                  </div>
                </div>
                
                <Textarea
                  value={userResponse}
                  onChange={(e) => setUserResponse(e.target.value)}
                  placeholder={`${selectedPrompt?.addressee || 'Dear Sir or Madam,'}\n\nWrite your letter here...\n\n${selectedPrompt?.closing || 'Yours faithfully,'}\n[Your name]`}
                  className="min-h-[350px] text-sm leading-relaxed resize-none font-mono"
                />

                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={submitForEvaluation}
                    disabled={evaluating || wordCount < 100}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    {evaluating ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Evaluating...
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
                  >
                    {showModelAnswer ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                    Model Answers
                  </Button>
                </div>
              </Card>

              {/* Evaluation Results */}
              {evaluation && (
                <Card className="p-5 border-2 border-purple-200 bg-purple-50/50">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-purple-100 rounded-full mb-2">
                      <Award className="w-7 h-7 text-purple-600" />
                    </div>
                    <div className="text-3xl font-bold text-purple-600">
                      Band {evaluation.overall_band}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Genel Band Puanı</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[
                      { name: 'Task Achievement', data: evaluation.task_achievement },
                      { name: 'Coherence', data: evaluation.coherence_cohesion },
                      { name: 'Vocabulary', data: evaluation.lexical_resource },
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

              {/* Model Answers - Band 6 & Band 8.5 */}
              {showModelAnswer && modelAnswers && (
                <Card className="p-5 border-2 border-pink-200 bg-pink-50/30">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-pink-600" /> Model Mektuplar
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
                      <div className="bg-white p-4 rounded-lg border mb-3 font-mono">
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                          {modelAnswers[selectedBand].text}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <span>Kelime Sayısı: {modelAnswers[selectedBand].word_count}</span>
                        <Badge className={selectedBand === 'band_6' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}>
                          Band {modelAnswers[selectedBand].band}
                        </Badge>
                      </div>

                      {/* Characteristics */}
                      {modelAnswers[selectedBand].characteristics && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <h4 className="font-semibold text-gray-800 mb-2 text-xs">📋 Band Characteristics</h4>
                          <ul className="space-y-1">
                            {modelAnswers[selectedBand].characteristics.map((char, idx) => (
                              <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                                <CheckCircle className="w-3 h-3 text-purple-500 mt-0.5 flex-shrink-0" />
                                {char}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">Bu soru için model mektup henüz eklenmedi.</p>
                    </div>
                  )}
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
