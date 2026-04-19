import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { 
  ArrowLeft, PenTool, Clock, RefreshCw, Send, 
  BarChart2, PieChart, LineChart, Table2, 
  GitBranch, Map, Lightbulb, CheckCircle,
  ChevronDown, ChevronUp, Eye, EyeOff, ZoomIn, ZoomOut,
  BookOpen, MessageSquare, Layers, Award, AlertCircle,
  ToggleLeft, ToggleRight
} from 'lucide-react';
import { toast } from 'sonner';
import { getRecommendedLessonPath } from '../lib/recommendationRouting';
import { useI18n } from '../lib/i18n';

const API_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * ULTRA MASTER PROMPT - Writing Task 1 Practice
 * =============================================
 * UX RULES (NON-NEGOTIABLE):
 * - Desktop: Left panel (40-45%) Visual | Right panel (55-60%) Task + Writing
 * - Mobile: Toggle mode between "View Visual" and "Write Answer"
 * - Visual auto-scales, no forced zoom
 * - Writing box scrolls independently
 * - Model answer hidden during writing (controlled reveal)
 */

export default function WritingTask1Practice() {
  const navigate = useNavigate();
  const { languageWireCode } = useI18n();
  const [searchParams] = useSearchParams();
  const topic = searchParams.get('topic') || 'participation';
  const bandLevel = searchParams.get('band') || '5.5-6.5';

  // Core state
  const [visualType, setVisualType] = useState('line_graph');
  const [svgContent, setSvgContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [modelTab, setModelTab] = useState('band8');
  const [taskData, setTaskData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userResponse, setUserResponse] = useState('');
  const [wordCount, setWordCount] = useState(0);
  
  // Timer state
  const [timeRemaining, setTimeRemaining] = useState(20 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  
  // UI state
  const [showTips, setShowTips] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [mobileView, setMobileView] = useState('visual'); // 'visual' or 'write'
  
  // Evaluation state
  const [evaluation, setEvaluation] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [recommendedLessons, setRecommendedLessons] = useState([]);
  
  // Model Answer state (controlled reveal)
  const [modelAnswerStep, setModelAnswerStep] = useState(0); // 0=hidden, 1=band, 2=reasoning, 3=full
  const [modelAnswer, setModelAnswer] = useState(null);

  const visualTypes = [
    { id: 'line_graph', name: 'Line Graph', icon: LineChart },
    { id: 'bar_chart', name: 'Bar Chart', icon: BarChart2 },
    { id: 'pie_chart', name: 'Pie Chart', icon: PieChart },
    { id: 'table', name: 'Table', icon: Table2 },
    { id: 'process', name: 'Process', icon: GitBranch },
    { id: 'map', name: 'Map', icon: Map },
  ];

  // Academic tips by visual type
  const academicTips = {
    line_graph: [
      'Identify the overall trend first - is it generally upward, downward, or mixed?',
      'Note significant changes: sharp rises, sudden drops, or periods of stability',
      'Compare different lines at key points (start, end, crossover points)',
      'Use precise academic vocabulary: "rose steadily", "fluctuated", "peaked at"',
      'Don\'t describe every data point - select the most significant features'
    ],
    bar_chart: [
      'Compare the highest and lowest values across categories',
      'Look for patterns or groupings in the data',
      'Note any significant differences between time periods (if multiple bars)',
      'Use comparison language: "considerably higher", "nearly double", "roughly equal"',
      'Group similar data together in your description'
    ],
    pie_chart: [
      'Start with the largest segment - it\'s the most important',
      'Group smaller segments if they represent similar proportions',
      'Use fraction/percentage language: "just under a quarter", "approximately half"',
      'Compare segments to each other, not just to the whole',
      'Note if any segment dominates or if distribution is even'
    ],
    table: [
      'Identify the key patterns across rows AND columns',
      'Highlight the highest and lowest figures with context',
      'Look for trends: increasing, decreasing, or stable patterns',
      'Don\'t try to describe every number - be selective',
      'Make meaningful comparisons between categories'
    ],
    process: [
      'Use passive voice throughout: "The materials are collected..."',
      'Describe stages in logical order with sequencing words',
      'Note the number of stages in your overview',
      'Highlight any cyclical elements or branching points',
      'Use verbs: "is processed", "are transported", "is converted"'
    ],
    map: [
      'Describe changes chronologically OR by geographical area',
      'Use location language: "to the north of", "adjacent to", "in the centre"',
      'Focus on the most significant developments',
      'Compare the two time periods clearly',
      'Note what was added, removed, or modified'
    ],
  };

  // Generate visual on mount and when params change
  useEffect(() => {
    generateVisual();
  }, [visualType, topic, bandLevel]);

  // Word count calculation
  useEffect(() => {
    const words = userResponse.trim().split(/\s+/).filter(w => w.length > 0);
    setWordCount(words.length);
  }, [userResponse]);

  // Timer logic
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
    setTaskData(null);
    setSvgContent('');
    setImageUrl('');
    setModelAnswer(null);
    setModelAnswerStep(0);
    setEvaluation(null);
    setRecommendedLessons([]);
    
    try {
      const response = await fetch(
        `${API_URL}/api/question-bank/writing/task1/generate-authentic?visual_type=${visualType}&topic=${topic}&band_level=${bandLevel}`
      );
      const data = await response.json();
      
      if (data.svg || data.image_url) {
        setSvgContent(data.svg || '');
        setImageUrl(data.image_url ? `${API_URL}/api${data.image_url}` : '');
        setTaskData(data);
        
        // Generate model answer in background
        if (data.task_id) {
          fetchModelAnswer(data.task_id);
        }
      }
    } catch (error) {
      console.error('Error generating visual:', error);
      toast.error('Could not generate visual');
      
      // Fallback to old endpoint for generated chart types only
      if (!['process', 'map'].includes(visualType)) {
        try {
          const fallbackResponse = await fetch(
            `${API_URL}/api/question-bank/writing/task1/generate-visual?visual_type=${visualType}&topic=${topic}&band_level=${bandLevel}`
          );
          const fallbackData = await fallbackResponse.json();
          if (fallbackData.svg) {
            setSvgContent(fallbackData.svg);
            setTaskData(fallbackData);
          }
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchModelAnswer = async (taskId) => {
    try {
      const response = await fetch(`${API_URL}/api/question-bank/writing/task1/model-answer/${taskId}`);
      const data = await response.json();
      if (data.success) {
        setModelAnswer(data.model_answer);
      }
    } catch (error) {
      console.error('Error fetching model answer:', error);
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
    setIsTimerRunning(false);
    toast.info('AI evaluation in progress...');
    
    try {
      const response = await fetch(`${API_URL}/api/question-bank/writing/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          response: userResponse,
          task_type: 'task1',
          visual_type: visualType,
          topic: topic,
          band_level: bandLevel,
          task_description: taskData?.task_description || '',
          user_language: languageWireCode
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setEvaluation(data.evaluation);
        // Store recommended lessons from ULTRA MASTER PROMPT
        if (data.recommended_lessons && data.recommended_lessons.length > 0) {
          setRecommendedLessons(data.recommended_lessons);
        }
        setModelAnswerStep(1); // Show band result first
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

  const handleZoom = (delta) => {
    setZoomLevel(prev => Math.min(150, Math.max(50, prev + delta)));
  };

  // Mobile toggle handler
  const toggleMobileView = () => {
    setMobileView(prev => prev === 'visual' ? 'write' : 'visual');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50">
      {/* Header - Fixed */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-4 md:px-6 sticky top-0 z-40">
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
                  <h1 className="text-lg font-bold">Writing Task 1</h1>
                  <p className="text-white/80 text-xs">Academic - Visual Description</p>
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
                {isTimerRunning ? 'Pause' : 'Start'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Toggle - Only visible on mobile */}
      <div className="lg:hidden sticky top-[72px] z-30 bg-white border-b shadow-sm">
        <div className="flex">
          <button
            onClick={() => setMobileView('visual')}
            className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              mobileView === 'visual' 
                ? 'bg-green-50 text-green-700 border-b-2 border-green-600' 
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Eye className="w-4 h-4" /> View Visual
          </button>
          <button
            onClick={() => setMobileView('write')}
            className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              mobileView === 'write' 
                ? 'bg-green-50 text-green-700 border-b-2 border-green-600' 
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <PenTool className="w-4 h-4" /> Write Answer
          </button>
        </div>
      </div>

      {/* Main Content - Side by Side Layout */}
      <div className="max-w-[1600px] mx-auto">
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-120px)]">
          
          {/* LEFT PANEL - Visual (40-45%) */}
          <div className={`lg:w-[45%] lg:border-r border-gray-200 lg:sticky lg:top-[72px] lg:h-[calc(100vh-72px)] lg:overflow-y-auto ${
            mobileView === 'visual' ? 'block' : 'hidden lg:block'
          }`}>
            <div className="p-4 md:p-6 space-y-4">
              {/* Visual Type Selector */}
              <div className="bg-white rounded-xl p-4 shadow-sm border">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Visual Type</h3>
                <div className="flex flex-wrap gap-2">
                  {visualTypes.map(type => {
                    const Icon = type.icon;
                    return (
                      <Button
                        key={type.id}
                        variant={visualType === type.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setVisualType(type.id)}
                        className={`text-xs ${visualType === type.id ? 'bg-green-600 hover:bg-green-700' : ''}`}
                      >
                        <Icon className="w-3.5 h-3.5 mr-1" /> {type.name}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Visual Display */}
              <div className="bg-white rounded-xl p-4 shadow-sm border">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 text-sm">Task 1 Visual</h3>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleZoom(-10)}
                      className="h-8 w-8 p-0"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <span className="text-xs text-gray-500 w-10 text-center">{zoomLevel}%</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleZoom(10)}
                      className="h-8 w-8 p-0"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={generateVisual}
                      disabled={loading}
                      className="ml-2"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
                      New
                    </Button>
                  </div>
                </div>
                
                <div 
                  className="bg-gray-50 border rounded-lg p-4 overflow-auto"
                  style={{ maxHeight: 'calc(100vh - 400px)' }}
                >
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                      <p className="text-gray-500 text-sm">Generating visual...</p>
                    </div>
                  ) : imageUrl ? (
                    <div className="transition-transform duration-200" style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top left' }}>
                      <img
                        src={imageUrl}
                        alt={taskData?.title || `${visualType} visual`}
                        className="max-w-full h-auto rounded border bg-white"
                      />
                    </div>
                  ) : svgContent ? (
                    <div 
                      className="transition-transform duration-200"
                      style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top left' }}
                      dangerouslySetInnerHTML={{ __html: svgContent }}
                    />
                  ) : (
                    <p className="text-gray-400 text-center py-12">No visual generated</p>
                  )}
                </div>
              </div>

              {/* Tips Section - Collapsible */}
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <button
                  className="w-full p-4 flex items-center justify-between text-left"
                  onClick={() => setShowTips(!showTips)}
                >
                  <span className="flex items-center gap-2 font-semibold text-gray-900 text-sm">
                    <Lightbulb className="w-4 h-4 text-amber-500" /> Academic Writing Tips
                  </span>
                  {showTips ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                
                {showTips && (
                  <div className="px-4 pb-4 border-t">
                    <ul className="mt-3 space-y-2">
                      {academicTips[visualType]?.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                          <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL - Task + Writing Area (55-60%) */}
          <div className={`lg:w-[55%] ${
            mobileView === 'write' ? 'block' : 'hidden lg:block'
          }`}>
            <div className="p-4 md:p-6 space-y-4">
              
              {/* Task Description - AUTHENTIC */}
              <div className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-green-200">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-4 h-4 text-green-700" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-2">Task</h3>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                      {taskData?.task_description || 
                        `The ${visualType.replace('_', ' ')} above shows information about ${topic}. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.`
                      }
                    </p>
                    {taskData?.band_calibration && (
                      <div className="mt-3 flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Target Band: {taskData.band_calibration.target_band}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Complexity: {taskData.band_calibration.complexity}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Writing Area */}
              <div className="bg-white rounded-xl p-4 md:p-5 shadow-sm border">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 text-sm">Your Response</h3>
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
                  placeholder="Start with an overview of the main features. Then describe the key data points and make comparisons where relevant..."
                  className="min-h-[300px] md:min-h-[350px] text-sm leading-relaxed resize-none"
                />

                <div className="mt-4 flex flex-col sm:flex-row gap-3">
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
                        <Send className="w-4 h-4 mr-2" /> Evaluate
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Evaluation Results - Step-based reveal */}
              {evaluation && (
                <div className="space-y-4">
                  {/* Step 1: Band Result */}
                  <Card className="p-5 border-2 border-green-200 bg-green-50/50">
                    <div className="text-center mb-4">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-2">
                        <Award className="w-8 h-8 text-green-600" />
                      </div>
                      <div className="text-4xl font-bold text-green-600">
                        Band {evaluation.overall_band}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Overall Band Score</p>
                    </div>

                    {/* Criteria Breakdown - Collapsible */}
                    <details className="mt-4">
                      <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                        Criteria Details
                      </summary>
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        {[
                          { name: 'Task Achievement', key: 'task_achievement' },
                          { name: 'Coherence & Cohesion', key: 'coherence_cohesion' },
                          { name: 'Lexical Resource', key: 'lexical_resource' },
                          { name: 'Grammar', key: 'grammatical_range' },
                        ].map(criterion => (
                          <div key={criterion.key} className="bg-white p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-gray-600">{criterion.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {evaluation[criterion.key]?.score || '-'}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-2">
                              {evaluation[criterion.key]?.feedback}
                            </p>
                          </div>
                        ))}
                      </div>
                    </details>
                  </Card>

                  {/* Step 2: Academic Reasoning Feedback */}
                  {modelAnswerStep >= 1 && (
                    <Card className="p-5 border">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-blue-600" /> Academic Feedback
                      </h3>
                      
                      {/* Strengths */}
                      {evaluation.strengths?.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-green-700 mb-2">✅ Strengths</h4>
                          <ul className="space-y-1">
                            {evaluation.strengths.map((s, idx) => (
                              <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                                <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Areas for Improvement */}
                      {evaluation.weaknesses?.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-amber-700 mb-2">⚠️ Areas for Improvement</h4>
                          <ul className="space-y-1">
                            {evaluation.weaknesses.map((w, idx) => (
                              <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                                <AlertCircle className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                                {w}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {evaluation.high_priority_fixes?.length > 0 && (
                        <div className="mb-4 p-3 bg-rose-50 rounded-lg">
                          <h4 className="text-sm font-semibold text-rose-700 mb-2">Highest-Priority Fixes</h4>
                          <ul className="space-y-1">
                            {evaluation.high_priority_fixes.map((fix, idx) => (
                              <li key={idx} className="text-xs text-gray-700">• {fix}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Examiner Comment */}
                      {evaluation.examiner_comment && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
                          <p className="text-xs text-gray-700 italic">{evaluation.examiner_comment}</p>
                        </div>
                      )}

                      {/* Response Diagnosis */}
                      {evaluation.response_diagnosis?.main_issue && (
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                          <h4 className="font-semibold text-blue-800 mb-2 text-xs">Response Diagnosis</h4>
                          <div className="space-y-1 text-xs text-blue-700">
                            <p><strong>Main Issue:</strong> {evaluation.response_diagnosis.main_issue}</p>
                            <p><strong>Band Ceiling:</strong> {evaluation.response_diagnosis.band_ceiling_reason}</p>
                            <p><strong>Quick Win:</strong> {evaluation.response_diagnosis.quick_win}</p>
                          </div>
                        </div>
                      )}

                      {/* Rewrite Guidance */}
                      {evaluation.rewrite_guidance?.weakest_paragraph && (
                        <div className="mb-4 p-3 bg-violet-50 rounded-lg border border-violet-100">
                          <h4 className="font-semibold text-violet-800 mb-2 text-xs">Rewrite Guidance</h4>
                          <div className="space-y-1 text-xs text-violet-700">
                            <p><strong>Weakest Paragraph:</strong> {evaluation.rewrite_guidance.weakest_paragraph}</p>
                            <p><strong>Suggested Opening:</strong> {evaluation.rewrite_guidance.suggested_opening}</p>
                            <p><strong>Key Linking Phrases:</strong> {evaluation.rewrite_guidance.key_linking_phrases}</p>
                          </div>
                        </div>
                      )}

                      {/* Improvement Suggestions */}
                      {evaluation.suggestions?.length > 0 && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <h4 className="text-sm font-semibold text-blue-700 mb-2">💡 Improvement Suggestions</h4>
                          <ul className="space-y-1">
                            {evaluation.suggestions.map((sug, idx) => (
                              <li key={idx} className="text-xs text-gray-600">• {sug}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {evaluation.band_justification && (
                        <div className="mt-4 p-3 bg-slate-50 rounded-lg border">
                          <h4 className="text-sm font-semibold text-slate-700 mb-2">📏 Band Justification</h4>
                          <p className="text-xs text-gray-700">{evaluation.band_justification}</p>
                        </div>
                      )}

                      {evaluation.response_diagnosis && Object.keys(evaluation.response_diagnosis).length > 0 && (
                        <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                          <h4 className="text-sm font-semibold text-indigo-700 mb-2">🧭 Response Diagnosis</h4>
                          <div className="space-y-2">
                            {Object.entries(evaluation.response_diagnosis).map(([key, value]) => (
                              <div key={key} className="bg-white rounded border p-2">
                                <p className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                                  {key.replace(/_/g, ' ')}
                                </p>
                                <p className="text-xs text-gray-700 mt-1">{value}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {evaluation.line_by_line_corrections?.length > 0 && (
                        <div className="mt-4 p-3 bg-white rounded-lg border">
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">✍️ Line-by-Line Corrections</h4>
                          <div className="space-y-3">
                            {evaluation.line_by_line_corrections.map((item, idx) => (
                              <div key={idx} className="rounded-lg border p-3 bg-gray-50">
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
                          <h4 className="text-sm font-semibold text-green-700 mb-2">🔁 Rewrite Guidance</h4>
                          <div className="space-y-3">
                            {Object.entries(evaluation.rewrite_guidance).map(([key, value]) => (
                              Array.isArray(value) ? (
                                <div key={key}>
                                  <p className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide mb-1">
                                    {key.replace(/_/g, ' ')}
                                  </p>
                                  <ul className="space-y-1">
                                    {value.map((item, idx) => <li key={idx} className="text-xs text-gray-700">• {item}</li>)}
                                  </ul>
                                </div>
                              ) : (
                                <div key={key} className="bg-white rounded border p-2">
                                  <p className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                                    {key.replace(/_/g, ' ')}
                                  </p>
                                  <p className="text-xs text-gray-700 mt-1">{value}</p>
                                </div>
                              )
                            ))}
                          </div>
                        </div>
                      )}

                      {/* ULTRA MASTER PROMPT: Recommended Lessons */}
                      {recommendedLessons.length > 0 && (
                        <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                          <h4 className="text-sm font-semibold text-purple-700 mb-2 flex items-center gap-2">
                            📚 Recommended Lessons
                            <Badge className="bg-purple-100 text-purple-600 text-xs">Course Focused</Badge>
                          </h4>
                          <p className="text-xs text-purple-600 mb-2">
                            Study these lessons to improve your weak areas:
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
                                  <div className="text-right">
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
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Expand to see more */}
                      <Button
                        variant="outline"
                        className="w-full mt-4"
                        onClick={() => setModelAnswerStep(3)}
                      >
                        {modelAnswerStep < 3 ? 'Show Model Answer' : 'Model Answer Shown'}
                      </Button>
                    </Card>
                  )}

                  {/* Step 3: Model Answer (Controlled Reveal) */}
                  {modelAnswerStep >= 3 && (
                    <Card className="p-5 border-2 border-blue-200 bg-blue-50/30">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Layers className="w-5 h-5 text-blue-600" /> Model Answer
                      </h3>
                      
                      {modelAnswer ? (
                        <>
                          {/* Tab buttons for different band samples */}
                          <div className="flex gap-2 mb-4">
                            <Badge 
                              className={`cursor-pointer ${modelTab === 'band8' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                              onClick={() => setModelTab('band8')}
                              data-testid="model-tab-band8"
                            >Band 8 Example</Badge>
                            <Badge 
                              className={`cursor-pointer ${modelTab === 'band6' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}
                              onClick={() => setModelTab('band6')}
                              data-testid="model-tab-band6"
                            >Band 6 Example</Badge>
                            <Badge 
                              className={`cursor-pointer ${modelTab === 'notes' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
                              onClick={() => setModelTab('notes')}
                              data-testid="model-tab-notes"
                            >Academic Notes</Badge>
                          </div>

                          {/* Band 8 Model Answer */}
                          {modelTab === 'band8' && (
                            <div className="bg-white p-4 rounded-lg border">
                              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                                {modelAnswer?.layer_a_examiner_model?.full_text || 
                                 modelAnswer?.text ||
                                 'Loading model answer...'}
                              </p>
                              <div className="mt-3 pt-3 border-t flex items-center justify-between">
                                <span className="text-xs text-gray-500">
                                  Word Count: {modelAnswer?.layer_a_examiner_model?.word_count || modelAnswer?.word_count || '-'}
                                </span>
                                <Badge className="bg-green-100 text-green-700">
                                  Estimated Band: {modelAnswer?.layer_a_examiner_model?.estimated_band || '8.0'}
                                </Badge>
                              </div>
                            </div>
                          )}

                          {/* Band 6 Model Answer */}
                          {modelTab === 'band6' && (
                            <div className="bg-white p-4 rounded-lg border">
                              {modelAnswer?.layer_a6_band6_model?.full_text ? (
                                <>
                                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                                    {modelAnswer.layer_a6_band6_model.full_text}
                                  </p>
                                  <div className="mt-3 pt-3 border-t flex items-center justify-between">
                                    <span className="text-xs text-gray-500">
                                      Word Count: {modelAnswer.layer_a6_band6_model.word_count || '-'}
                                    </span>
                                    <Badge className="bg-amber-100 text-amber-700">
                                      Band {modelAnswer.layer_a6_band6_model.estimated_band || '6.0'}
                                    </Badge>
                                  </div>
                                  {modelAnswer.layer_a6_band6_model.band_characteristics?.length > 0 && (
                                    <div className="mt-3 pt-3 border-t">
                                      <p className="text-xs font-semibold text-gray-700 mb-1">Typical Band 6 Issues in This Response:</p>
                                      <ul className="text-xs text-gray-600 space-y-0.5 list-disc pl-4">
                                        {modelAnswer.layer_a6_band6_model.band_characteristics.map((c, i) => (
                                          <li key={i}>{c}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <p className="text-sm text-gray-500">Band 6 example loading or not available for this task.</p>
                              )}
                            </div>
                          )}

                          {/* Academic Notes */}
                          {modelTab === 'notes' && (
                            <div className="bg-white p-4 rounded-lg border space-y-4">
                              {modelAnswer?.layer_b_reasoning_notes ? (
                                <div className="space-y-3">
                                  {Object.entries(modelAnswer.layer_b_reasoning_notes).map(([key, value]) => (
                                    <div key={key} className="p-3 bg-gray-50 rounded-lg">
                                      <h5 className="text-xs font-semibold text-gray-800 mb-1">{value.question}</h5>
                                      <p className="text-xs text-gray-600">{value.explanation}</p>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500">Academic notes not available for this task.</p>
                              )}
                              {modelAnswer?.layer_c_alternatives && (
                                <div>
                                  <p className="text-xs font-semibold text-gray-700 mb-2">Alternative Expressions</p>
                                  <div className="flex flex-wrap gap-2">
                                    {modelAnswer.layer_c_alternatives.overview_alternatives?.slice(0, 6).map((alt, idx) => (
                                      <Badge key={idx} variant="outline" className="text-xs">{alt}</Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-center py-6">
                          <p className="text-sm text-gray-500">Loading model answer...</p>
                          <p className="text-xs text-gray-400 mt-2">Please wait, AI is preparing the model answer.</p>
                        </div>
                      )}
                    </Card>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
