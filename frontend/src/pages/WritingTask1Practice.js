import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { 
  ArrowLeft, PenTool, Clock, RefreshCw, Send, 
  BarChart2, PieChart, LineChart, Table2, 
  GitBranch, Map, Mail, Lightbulb, CheckCircle,
  ChevronDown, ChevronUp, Eye, EyeOff
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function WritingTask1Practice() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const topic = searchParams.get('topic') || 'education';
  const bandLevel = searchParams.get('band') || '5.5-6.5';

  const [visualType, setVisualType] = useState('line_graph');
  const [svgContent, setSvgContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [userResponse, setUserResponse] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [showTips, setShowTips] = useState(true);
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(20 * 60); // 20 minutes
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [evaluating, setEvaluating] = useState(false);

  const visualTypes = [
    { id: 'line_graph', name: 'Line Graph', icon: LineChart },
    { id: 'bar_chart', name: 'Bar Chart', icon: BarChart2 },
    { id: 'pie_chart', name: 'Pie Chart', icon: PieChart },
    { id: 'table', name: 'Table', icon: Table2 },
    { id: 'process', name: 'Process', icon: GitBranch },
    { id: 'map', name: 'Map', icon: Map },
  ];

  const tips = {
    line_graph: [
      'Describe the overall trend first (increase, decrease, fluctuate)',
      'Mention specific data points for key changes',
      'Use trend vocabulary: rose, fell, peaked, declined, remained stable',
      'Compare different lines if multiple are present',
    ],
    bar_chart: [
      'Compare categories and highlight the highest/lowest values',
      'Group similar data together in your description',
      'Use comparison language: more than, less than, twice as much',
      'Mention any significant differences between groups',
    ],
    pie_chart: [
      'Start with the largest segment',
      'Group smaller segments together if appropriate',
      'Use fraction/percentage language: a quarter, nearly half, the majority',
      'Compare segments to each other',
    ],
    table: [
      'Identify the key trends or patterns across rows/columns',
      'Highlight the highest and lowest figures',
      'Make meaningful comparisons between data points',
      'Dont try to describe every single number',
    ],
    process: [
      'Use passive voice: "The materials are collected..."',
      'Describe stages in order using sequencing words',
      'Use: firstly, then, next, following this, finally',
      'Mention the number of stages at the beginning',
    ],
    map: [
      'Describe changes chronologically or by area',
      'Use location language: in the north, to the east of',
      'Highlight significant changes or developments',
      'Compare before/after clearly',
    ],
  };

  useEffect(() => {
    generateVisual();
  }, [visualType, topic, bandLevel]);

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

  const generateVisual = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/question-bank/writing/task1/generate-visual?visual_type=${visualType}&topic=${topic}&band_level=${bandLevel}`
      );
      const data = await response.json();
      if (data.svg) {
        setSvgContent(data.svg);
      }
    } catch (error) {
      console.error('Error generating visual:', error);
      toast.error('Failed to generate visual');
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
    if (wordCount < 100) {
      toast.error('Please write at least 100 words');
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
          task_type: 'task1',
          visual_type: visualType,
          topic: topic,
          band_level: bandLevel
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-6 px-6">
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
                <h1 className="text-2xl font-bold">Writing Task 1</h1>
                <p className="text-white/80">Academic - Visual Description</p>
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
                {isTimerRunning ? 'Pause' : 'Start'} Timer
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Visual */}
          <div className="space-y-4">
            {/* Visual Type Selector */}
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Görsel Tipi</h3>
              <div className="flex flex-wrap gap-2">
                {visualTypes.map(type => {
                  const Icon = type.icon;
                  return (
                    <Button
                      key={type.id}
                      variant={visualType === type.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setVisualType(type.id)}
                      className={visualType === type.id ? 'bg-green-600 hover:bg-green-700' : ''}
                    >
                      <Icon className="w-4 h-4 mr-1" /> {type.name}
                    </Button>
                  );
                })}
              </div>
            </Card>

            {/* Visual Display */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Task 1 Visual</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateVisual}
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                  Yeni Görsel
                </Button>
              </div>
              
              <div className="bg-white border rounded-lg p-4 min-h-[300px] flex items-center justify-center">
                {loading ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                    <p className="text-gray-500 text-sm">Generating visual...</p>
                  </div>
                ) : svgContent ? (
                  <div 
                    className="w-full"
                    dangerouslySetInnerHTML={{ __html: svgContent }}
                  />
                ) : (
                  <p className="text-gray-400">No visual generated</p>
                )}
              </div>

              {/* Task Instructions */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Task:</strong> The {visualType.replace('_', ' ')} above shows information about {topic}. 
                  Summarise the information by selecting and reporting the main features, and make comparisons where relevant.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  <em>Write at least 150 words.</em>
                </p>
              </div>
            </Card>

            {/* Tips */}
            <Card className="p-4">
              <Button
                variant="ghost"
                className="w-full flex items-center justify-between"
                onClick={() => setShowTips(!showTips)}
              >
                <span className="flex items-center gap-2 font-semibold text-gray-900">
                  <Lightbulb className="w-5 h-5 text-amber-500" /> Writing Tips
                </span>
                {showTips ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
              
              {showTips && (
                <ul className="mt-3 space-y-2">
                  {tips[visualType]?.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          {/* Right Panel - Writing */}
          <div className="space-y-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Your Response</h3>
                <div className={`text-sm font-medium ${wordCount >= 150 ? 'text-green-600' : 'text-amber-600'}`}>
                  {wordCount} words {wordCount < 150 && `(${150 - wordCount} more needed)`}
                </div>
              </div>
              
              <Textarea
                value={userResponse}
                onChange={(e) => setUserResponse(e.target.value)}
                placeholder="Write your Task 1 response here. Start with an overview of the main features, then describe the key data points..."
                className="min-h-[400px] text-base leading-relaxed"
              />

              <div className="mt-4 flex gap-3">
                <Button
                  onClick={submitForEvaluation}
                  disabled={evaluating || wordCount < 100}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {evaluating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Evaluating...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" /> Submit for Evaluation
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowModelAnswer(!showModelAnswer)}
                >
                  {showModelAnswer ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                  Model Answer
                </Button>
              </div>
            </Card>

            {/* Evaluation Results */}
            {evaluation && (
              <Card className="p-6 border-2 border-green-200 bg-green-50/50">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" /> Evaluation Results
                </h3>
                
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-green-600 mb-1">
                    Band {evaluation.overall_band}
                  </div>
                  <p className="text-sm text-gray-500">Overall Band Score</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    { name: 'Task Achievement', data: evaluation.task_achievement },
                    { name: 'Coherence & Cohesion', data: evaluation.coherence_cohesion },
                    { name: 'Lexical Resource', data: evaluation.lexical_resource },
                    { name: 'Grammar', data: evaluation.grammatical_range },
                  ].map(criterion => (
                    <div key={criterion.name} className="bg-white p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">{criterion.name}</span>
                        <Badge variant="outline">{criterion.data.score}</Badge>
                      </div>
                      <p className="text-xs text-gray-500">{criterion.data.feedback}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">İyileştirme Önerileri</h4>
                  <ul className="space-y-2">
                    {evaluation.suggestions?.map((sug, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-amber-500">•</span> {sug}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-2 gap-4 mt-4">
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
                      <h4 className="font-semibold text-red-800 mb-2 text-sm">⚠️ Geliştirilecek Alanlar</h4>
                      <ul className="space-y-1">
                        {evaluation.weaknesses.map((w, idx) => (
                          <li key={idx} className="text-xs text-red-700">• {w}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Vocabulary Suggestions */}
                {evaluation.vocabulary_to_use?.length > 0 && (
                  <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-800 mb-2 text-sm">📚 Kullanılabilecek Kelimeler</h4>
                    <div className="flex flex-wrap gap-2">
                      {evaluation.vocabulary_to_use.map((word, idx) => (
                        <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Grammar Corrections */}
                {evaluation.grammar_corrections?.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2 text-sm">✏️ Dilbilgisi Düzeltmeleri</h4>
                    <div className="space-y-2">
                      {evaluation.grammar_corrections.map((corr, idx) => (
                        <div key={idx} className="text-xs">
                          <span className="text-red-600 line-through">{corr.original}</span>
                          {' → '}
                          <span className="text-green-600 font-medium">{corr.corrected}</span>
                          {corr.explanation && (
                            <p className="text-gray-500 mt-1 italic">{corr.explanation}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Examiner Comment */}
                {evaluation.examiner_comment && (
                  <div className="mt-4 p-4 bg-gray-100 rounded-lg border-l-4 border-green-500">
                    <h4 className="font-semibold text-gray-800 mb-1 text-sm">💬 Sınav Görevlisi Yorumu</h4>
                    <p className="text-sm text-gray-700">{evaluation.examiner_comment}</p>
                  </div>
                )}
              </Card>
            )}

            {/* Model Answer */}
            {showModelAnswer && (
              <Card className="p-6 border-2 border-blue-200 bg-blue-50/50">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-600" /> Band 9 Model Answer
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  The {visualType.replace('_', ' ')} illustrates data regarding {topic} over a specific period. 
                  Overall, it is evident that there are significant variations in the figures presented, 
                  with some notable trends emerging throughout the timeframe.
                  <br/><br/>
                  Looking at the details, [specific data analysis would go here based on the actual visual generated]. 
                  The most striking feature is [key observation]. In contrast, [comparison point] shows a different pattern.
                  <br/><br/>
                  In summary, while [main trend 1], [main trend 2] demonstrates [concluding observation].
                </p>
                <p className="text-xs text-gray-500 mt-3 italic">
                  Note: This is a template model answer. Actual model answers are generated based on the specific visual data.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
