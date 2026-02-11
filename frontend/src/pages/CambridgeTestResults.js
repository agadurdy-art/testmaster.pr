import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  CheckCircle, XCircle, ArrowLeft, BookOpen, Headphones, PenTool, Mic,
  TrendingUp, Award, Target, BarChart3, ChevronDown, ChevronUp, Lightbulb,
  BookMarked, GraduationCap, RefreshCw, MapPin, Eye, FileText, Home, ChevronRight,
  AlertTriangle, Zap, Info
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function CambridgeTestResults() {
  const { bookId, testId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [results, setResults] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);
  const [writingViewTab, setWritingViewTab] = useState('feedback');
  
  // AI Feedback state
  const [skillBreakdown, setSkillBreakdown] = useState([]);
  const [teacherFeedback, setTeacherFeedback] = useState(null);
  const [recommendedLessons, setRecommendedLessons] = useState([]);
  const [questionResults, setQuestionResults] = useState({ listening: [], reading: [] });
  const [fastestGain, setFastestGain] = useState([]);
  const [integrityWarnings, setIntegrityWarnings] = useState([]);
  const [showBandTooltip, setShowBandTooltip] = useState(null);
  const [reasonSummary, setReasonSummary] = useState({});
  
  // Get data from navigation state
  const { answers = {}, testData = {}, mode = 'full', skill = null, speakingEvaluations = {} } = location.state || {};

  useEffect(() => {
    if (!location.state) {
      toast.error('No test data found');
      navigate('/question-bank');
      return;
    }
    evaluateFullTest();
  }, []);

  const evaluateFullTest = async () => {
    setLoading(true);
    
    try {
      // Call the comprehensive evaluation endpoint
      const res = await fetch(`${API_URL}/api/cambridge/evaluate/full-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          book_id: bookId,
          test_id: testId,
          answers: answers,
          user_plan: 'free'
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        // Set scores
        setResults({
          listening: {
            correct: data.scores.listening.correct,
            total: data.scores.listening.total,
            band: data.scores.listening.band,
            percentage: data.scores.listening.percentage
          },
          reading: {
            correct: data.scores.reading.correct,
            total: data.scores.reading.total,
            band: data.scores.reading.band,
            percentage: data.scores.reading.percentage
          },
          writing: { score: null, evaluated: false, tasks: [] },
          speaking: { score: null, evaluated: false, parts: [] },
          overall: data.scores.overall.band
        });
        
        // Set AI feedback data
        setSkillBreakdown(data.skill_breakdown || []);
        setTeacherFeedback(data.teacher_feedback || null);
        setRecommendedLessons(data.recommended_lessons || []);
        setQuestionResults(data.question_results || { listening: [], reading: [] });
        setFastestGain(data.fastest_gain || []);
        setIntegrityWarnings(data.integrity_warnings || []);
        setReasonSummary(data.reason_summary || {});
        
      } else {
        toast.error('Could not evaluate test');
      }
      
    } catch (error) {
      console.error('Error evaluating test:', error);
      toast.error('Could not load results');
      
      // Fallback to basic calculation
      try {
        const ansRes = await fetch(`${API_URL}/api/cambridge/answers/${bookId}/${testId}`);
        const ansData = await ansRes.json();
        
        if (ansData.success) {
          const listeningResult = calculateSectionScore('listening', answers, ansData.answers?.listening);
          const readingResult = calculateSectionScore('reading', answers, ansData.answers?.reading);
          
          const scores = [listeningResult.band, readingResult.band].filter(s => s);
          const overall = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 2) / 2 : null;
          
          setResults({
            listening: listeningResult,
            reading: readingResult,
            writing: { score: null, evaluated: false, tasks: [] },
            speaking: { score: null, evaluated: false, parts: [] },
            overall
          });
        }
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateSectionScore = (section, userAnswers, correctAnswers) => {
    if (!correctAnswers) {
      return { correct: 0, total: 0, band: 5.0, percentage: 0, details: [] };
    }
    
    let correct = 0;
    let total = Object.keys(correctAnswers).length;
    const details = [];
    
    Object.entries(correctAnswers).forEach(([key, correctAns]) => {
      const userAns = userAnswers[`${section}_${key}`];
      const isCorrect = compareAnswers(userAns, correctAns);
      
      if (isCorrect) correct++;
      
      details.push({
        question_id: key,
        user_answer: userAns || '-',
        correct_answer: correctAns,
        is_correct: isCorrect
      });
    });
    
    const percentage = total > 0 ? (correct / total) * 100 : 0;
    const band = calculateBand(percentage);
    
    return { correct, total, band, percentage, details };
  };

  const compareAnswers = (userAns, correctAns) => {
    if (!userAns || !correctAns) return false;
    const normalize = (str) => String(str).toLowerCase().trim().replace(/[.,!?]/g, '');
    if (Array.isArray(correctAns)) {
      return correctAns.some(ans => normalize(ans) === normalize(userAns));
    }
    if (String(correctAns).includes('/')) {
      return correctAns.split('/').some(ans => normalize(ans) === normalize(userAns));
    }
    return normalize(userAns) === normalize(correctAns);
  };

  const calculateBand = (percentage) => {
    if (percentage >= 90) return 9.0;
    if (percentage >= 82) return 8.5;
    if (percentage >= 75) return 8.0;
    if (percentage >= 68) return 7.5;
    if (percentage >= 60) return 7.0;
    if (percentage >= 52) return 6.5;
    if (percentage >= 45) return 6.0;
    if (percentage >= 38) return 5.5;
    if (percentage >= 30) return 5.0;
    if (percentage >= 22) return 4.5;
    return 4.0;
  };

  const getBandColorClass = (score) => score >= 7 ? 'text-green-600' : score >= 6 ? 'text-blue-600' : score >= 5 ? 'text-yellow-600' : 'text-red-600';
  const getBandBgClass = (score) => score >= 7 ? 'bg-green-500' : score >= 6 ? 'bg-blue-500' : score >= 5 ? 'bg-yellow-500' : 'bg-red-500';
  const getBandLightBg = (score) => score >= 7 ? 'bg-green-100 text-green-700' : score >= 6 ? 'bg-blue-100 text-blue-700' : score >= 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';

  const evaluateWriting = async () => {
    setEvaluating(true);
    toast.info('Evaluating writing responses...');
    
    try {
      const tasks = [];
      
      const task1Response = answers['writing_task1'] || '';
      if (task1Response.trim()) {
        const res1 = await fetch(`${API_URL}/api/cambridge/evaluate/writing`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            book_id: bookId,
            test_id: testId,
            task_number: 1,
            response: task1Response
          })
        });
        const data1 = await res1.json();
        if (data1.success) {
          tasks.push({
            taskNumber: 1,
            wordCount: data1.word_count,
            minimumWords: data1.minimum_words,
            overallBand: data1.overall_band,
            criteria: data1.criteria,
            feedback: data1.feedback,
            referenceSamples: data1.reference_samples,
            userResponse: task1Response
          });
        }
      }
      
      const task2Response = answers['writing_task2'] || '';
      if (task2Response.trim()) {
        const res2 = await fetch(`${API_URL}/api/cambridge/evaluate/writing`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            book_id: bookId,
            test_id: testId,
            task_number: 2,
            response: task2Response
          })
        });
        const data2 = await res2.json();
        if (data2.success) {
          tasks.push({
            taskNumber: 2,
            wordCount: data2.word_count,
            minimumWords: data2.minimum_words,
            overallBand: data2.overall_band,
            criteria: data2.criteria,
            feedback: data2.feedback,
            referenceSamples: data2.reference_samples,
            userResponse: task2Response
          });
        }
      }
      
      let overallWritingBand = null;
      if (tasks.length > 0) {
        if (tasks.length === 2) {
          overallWritingBand = Math.round(((tasks[0].overallBand + tasks[1].overallBand * 2) / 3) * 2) / 2;
        } else {
          overallWritingBand = tasks[0].overallBand;
        }
      }
      
      setResults(prev => ({
        ...prev,
        writing: {
          score: overallWritingBand,
          evaluated: true,
          tasks: tasks
        }
      }));
      
      toast.success('Writing evaluation complete!');
      
    } catch (error) {
      console.error('Writing evaluation error:', error);
      toast.error('Could not evaluate writing');
    } finally {
      setEvaluating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-violet-50/30 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-16 h-16 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Analyzing your performance...</p>
        </div>
      </div>
    );
  }

  // Calculate strengths and weaknesses from skill breakdown
  const strengths = skillBreakdown.filter(s => s.total > 0 && (s.correct / s.total) >= 0.7);
  const weaknesses = skillBreakdown.filter(s => s.total > 0 && (s.correct / s.total) < 0.5);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-violet-50/30 to-gray-100 py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate('/question-bank')} className="mb-6 text-gray-600 hover:text-violet-600">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Question Bank
        </Button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className={`w-24 h-24 mx-auto mb-6 rounded-3xl ${getBandBgClass(results?.overall || 5)} flex items-center justify-center shadow-2xl`}>
            <Award className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Test Complete!</h1>
          <p className="text-xl text-gray-500">{testData.title || `Cambridge IELTS ${bookId?.toUpperCase()} - ${testId}`}</p>
        </div>

        {/* Main Score Card */}
        <Card className="p-8 mb-6 bg-white border-0 shadow-lg rounded-2xl text-center">
          <p className="text-gray-500 mb-2 text-lg">Your Estimated Band Score</p>
          <p className={`text-8xl font-bold mb-4 ${getBandColorClass(results?.overall || 5)}`}>{results?.overall || '-'}</p>
          
          {/* Band Calculation Tooltip */}
          <div className="mb-6">
            <button 
              data-testid="band-transparency-toggle"
              onClick={() => setShowBandTooltip(!showBandTooltip)} 
              className="text-sm text-gray-400 hover:text-violet-600 transition-colors flex items-center gap-1 mx-auto"
            >
              <Info className="w-3.5 h-3.5" /> How is this calculated?
            </button>
            {showBandTooltip && (
              <div data-testid="band-calculation-breakdown" className="mt-3 mx-auto max-w-md bg-gray-50 rounded-xl p-4 text-left border">
                <h4 className="font-semibold text-gray-800 text-sm mb-3">Band Score Mapping</h4>
                <div className="space-y-2 text-sm">
                  {results?.listening && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 flex items-center gap-1.5"><Headphones className="w-3.5 h-3.5 text-blue-500" /> Listening</span>
                      <span className="text-gray-800">{results.listening.correct}/{results.listening.total} ({Math.round(results.listening.percentage)}%) <span className="font-bold text-blue-600 ml-1">= Band {results.listening.band}</span></span>
                    </div>
                  )}
                  {results?.reading && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5 text-green-500" /> Reading</span>
                      <span className="text-gray-800">{results.reading.correct}/{results.reading.total} ({Math.round(results.reading.percentage)}%) <span className="font-bold text-green-600 ml-1">= Band {results.reading.band}</span></span>
                    </div>
                  )}
                  {results?.writing?.evaluated && results.writing.score && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 flex items-center gap-1.5"><PenTool className="w-3.5 h-3.5 text-purple-500" /> Writing</span>
                      <span className="font-bold text-purple-600">Band {results.writing.score}</span>
                    </div>
                  )}
                  <div className="pt-2 mt-2 border-t border-gray-200 flex justify-between items-center">
                    <span className="text-gray-800 font-medium">Overall (average, rounded to nearest 0.5)</span>
                    <span className={`font-bold text-lg ${getBandColorClass(results?.overall || 5)}`}>Band {results?.overall}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-3">Based on official IELTS band descriptors and raw score conversion tables.</p>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-4 gap-4 pt-6 border-t border-gray-100">
            <div>
              <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg">
                <Headphones className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{results?.listening?.band || '-'}</p>
              <p className="text-sm text-gray-500">Listening</p>
            </div>
            <div>
              <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-green-500 flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{results?.reading?.band || '-'}</p>
              <p className="text-sm text-gray-500">Reading</p>
            </div>
            <div>
              <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-purple-500 flex items-center justify-center shadow-lg">
                <PenTool className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{results?.writing?.score || '-'}</p>
              <p className="text-sm text-gray-500">Writing</p>
            </div>
            <div>
              <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg">
                <Mic className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{results?.speaking?.score || '-'}</p>
              <p className="text-sm text-gray-500">Speaking</p>
            </div>
          </div>
        </Card>

        {/* Integrity Warnings */}
        {integrityWarnings.length > 0 && (
          <Card data-testid="integrity-warnings" className="p-4 mb-6 bg-amber-50 border border-amber-200 rounded-2xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-amber-800 text-sm">Submission Integrity</h3>
                <div className="mt-1 space-y-1">
                  {integrityWarnings.map((w, idx) => (
                    <p key={idx} className="text-sm text-amber-700">{w.message}</p>
                  ))}
                </div>
                <p className="text-xs text-amber-500 mt-2">Tip: Always review unanswered questions before submitting. Even a guess is better than blank.</p>
              </div>
            </div>
          </Card>
        )}

        {/* Fastest Score Gain Card */}
        {fastestGain.length > 0 && (
          <Card data-testid="fastest-gain-card" className="p-6 mb-6 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-emerald-900">Fastest Score Gain</h3>
                <p className="text-sm text-emerald-600">Fix these areas for the biggest improvement</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {fastestGain.map((item, idx) => (
                <div key={idx} className="p-4 bg-white rounded-xl border border-emerald-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                        idx === 0 ? 'bg-red-500' : idx === 1 ? 'bg-amber-500' : 'bg-blue-500'
                      }`}>{idx + 1}</span>
                      <span className="font-medium text-gray-900 text-sm">{item.label}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-red-600 font-bold text-sm">+{item.wrong_count} possible</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          item.accuracy >= 70 ? 'bg-green-500' : item.accuracy >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${item.accuracy}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-8">{item.accuracy}%</span>
                  </div>
                  {item.tip && <p className="text-xs text-gray-600 leading-relaxed">{item.tip}</p>}
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-emerald-100/50 rounded-lg">
              <p className="text-sm text-emerald-800 font-medium flex items-center gap-1.5">
                <Target className="w-4 h-4" />
                Focus on #{1}: fixing {fastestGain[0]?.wrong_count || 0} questions here could boost your band by ~0.5
              </p>
            </div>
          </Card>
        )}

        {/* AI Teacher Feedback Card */}
        {teacherFeedback && (
          <Card className="p-6 mb-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900">Your Personal Feedback</h3>
                <p className="text-sm text-blue-600">AI-powered analysis of your performance</p>
              </div>
            </div>
            
            {/* Quick Summary */}
            <div className="bg-white/60 rounded-xl p-4 mb-4">
              <p className="text-gray-800 leading-relaxed">{teacherFeedback.short}</p>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              {/* Strengths */}
              <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-green-800">Your Strengths</h4>
                </div>
                <div className="space-y-2">
                  {strengths.slice(0, 3).map((skill, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-green-700">{skill.label}</span>
                      <span className="font-medium text-green-800">{Math.round((skill.correct / skill.total) * 100)}%</span>
                    </div>
                  ))}
                  {strengths.length === 0 && (
                    <p className="text-sm text-green-600">Keep practicing to identify your strengths!</p>
                  )}
                </div>
              </div>

              {/* Areas to Improve */}
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-amber-600" />
                  <h4 className="font-semibold text-amber-800">Areas to Improve</h4>
                </div>
                <div className="space-y-2">
                  {weaknesses.slice(0, 3).map((skill, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-amber-700">{skill.label}</span>
                      <span className="font-medium text-amber-800">{Math.round((skill.correct / skill.total) * 100)}%</span>
                    </div>
                  ))}
                  {weaknesses.length === 0 && (
                    <p className="text-sm text-amber-600">Great job! No major weaknesses identified.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Detailed Tips */}
            <div className="bg-violet-50 rounded-xl p-4 border border-violet-100">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-violet-600" />
                <h4 className="font-semibold text-violet-800">Tips to Improve</h4>
              </div>
              <p className="text-gray-700 leading-relaxed text-sm">{teacherFeedback.detailed}</p>
            </div>

            {/* Skill-specific Tips */}
            {skillBreakdown.filter(s => s.tip && s.total > 0 && (s.correct / s.total) < 0.7).length > 0 && (
              <div className="mt-4 space-y-3">
                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Practice Recommendations
                </h4>
                {skillBreakdown.filter(s => s.tip && s.total > 0 && (s.correct / s.total) < 0.7).slice(0, 3).map((skill, idx) => (
                  <div key={idx} className="bg-white/60 rounded-lg p-3 border border-gray-100">
                    <p className="font-medium text-gray-800 text-sm mb-1">{skill.label}</p>
                    <p className="text-gray-600 text-sm">{skill.tip}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Recommended Lessons Card */}
        {recommendedLessons.length > 0 && (
          <Card className="p-6 mb-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-indigo-900">Recommended Lessons</h3>
                <p className="text-sm text-indigo-600">Based on your weak areas</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {recommendedLessons.map((lesson, idx) => (
                <div 
                  key={idx}
                  className="flex items-center gap-4 p-4 bg-white rounded-xl hover:bg-indigo-50 cursor-pointer transition-all border border-indigo-100"
                  onClick={() => navigate(lesson.route || '/mastery')}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    lesson.priority === 'high' ? 'bg-red-100' : 'bg-indigo-100'
                  }`}>
                    <BookOpen className={`w-5 h-5 ${
                      lesson.priority === 'high' ? 'text-red-600' : 'text-indigo-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                    <p className="text-sm text-gray-500">{lesson.reason}</p>
                    <p className="text-xs text-indigo-600 mt-1">{lesson.course}</p>
                  </div>
                  {lesson.priority === 'high' && (
                    <Badge className="bg-red-100 text-red-700 text-xs">Priority</Badge>
                  )}
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Listening Results - Detailed with Explanations */}
        {questionResults.listening?.length > 0 && (
          <Card className="p-6 mb-6 bg-white border-0 shadow-lg rounded-2xl">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setExpandedSection(expandedSection === 'listening' ? null : 'listening')}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                  <Headphones className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Listening - Answer Review</h3>
                  <p className="text-sm text-gray-500">
                    {results?.listening?.correct}/{results?.listening?.total} correct ({Math.round(results?.listening?.percentage || 0)}%)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={`text-lg px-3 py-1 ${getBandLightBg(results?.listening?.band || 5)}`}>
                  Band {results?.listening?.band || '-'}
                </Badge>
                {expandedSection === 'listening' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            </div>
            
            {expandedSection === 'listening' && (
              <div className="mt-6 space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {questionResults.listening.map((q, idx) => (
                  <div 
                    key={idx} 
                    className={`p-4 rounded-xl border-l-4 ${
                      q.is_correct 
                        ? 'bg-green-50 border-green-500' 
                        : 'bg-red-50 border-red-500'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                        q.is_correct ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {q.question_id}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-200 text-gray-600">
                        {q.question_type?.replace(/_/g, ' ') || 'Question'}
                      </span>
                      {q.is_correct ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      {q.reason_code && !q.is_correct && (
                        <span data-testid={`reason-badge-listening-${q.question_id}`} className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          q.reason_code === 'UNANSWERED' ? 'bg-gray-200 text-gray-700' :
                          q.reason_code === 'TFNG_CONFUSION' || q.reason_code === 'YNNG_CONFUSION' ? 'bg-orange-100 text-orange-700' :
                          q.reason_code === 'SPELLING_ERROR' ? 'bg-amber-100 text-amber-700' :
                          q.reason_code === 'DISTRACTOR_TRAP' ? 'bg-rose-100 text-rose-700' :
                          q.reason_code === 'NEAR_MISS' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {q.reason_label}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm mb-2">
                      <div>
                        <span className="text-gray-500">Your Answer: </span>
                        <span className={`font-semibold ${q.is_correct ? 'text-green-700' : 'text-red-700'}`}>
                          {q.user_answer || 'No answer'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Correct: </span>
                        <span className="font-semibold text-green-700">{q.correct_answer}</span>
                      </div>
                    </div>
                    
                    {/* Explanation */}
                    {q.explanation && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                        <div className="flex items-start gap-2">
                          <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-blue-700 mb-1">Explanation</p>
                            <p className="text-sm text-gray-700 leading-relaxed">{q.explanation}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Skill Tip */}
                    {q.skill_tip && !q.is_correct && (
                      <div className="mt-3 p-3 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                        <div className="flex items-start gap-2">
                          <GraduationCap className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-purple-700 mb-1">Skill Tip</p>
                            <p className="text-sm text-gray-700 leading-relaxed">{q.skill_tip}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Reading Results - Detailed with Locate & Explain */}
        {questionResults.reading?.length > 0 && (
          <Card className="p-6 mb-6 bg-white border-0 shadow-lg rounded-2xl">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setExpandedSection(expandedSection === 'reading' ? null : 'reading')}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Reading - Answer Review</h3>
                  <p className="text-sm text-gray-500">
                    {results?.reading?.correct}/{results?.reading?.total} correct ({Math.round(results?.reading?.percentage || 0)}%)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={`text-lg px-3 py-1 ${getBandLightBg(results?.reading?.band || 5)}`}>
                  Band {results?.reading?.band || '-'}
                </Badge>
                {expandedSection === 'reading' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            </div>
            
            {expandedSection === 'reading' && (
              <div className="mt-6 space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {questionResults.reading.map((q, idx) => (
                  <div 
                    key={idx} 
                    className={`p-4 rounded-xl border-l-4 ${
                      q.is_correct 
                        ? 'bg-green-50 border-green-500' 
                        : 'bg-red-50 border-red-500'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                        q.is_correct ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {q.question_id}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-200 text-gray-600">
                        {q.question_type?.replace(/_/g, ' ') || 'Question'}
                      </span>
                      {q.is_correct ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      {q.reason_code && !q.is_correct && (
                        <span data-testid={`reason-badge-reading-${q.question_id}`} className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          q.reason_code === 'UNANSWERED' ? 'bg-gray-200 text-gray-700' :
                          q.reason_code === 'TFNG_CONFUSION' || q.reason_code === 'YNNG_CONFUSION' ? 'bg-orange-100 text-orange-700' :
                          q.reason_code === 'SPELLING_ERROR' ? 'bg-amber-100 text-amber-700' :
                          q.reason_code === 'DISTRACTOR_TRAP' ? 'bg-rose-100 text-rose-700' :
                          q.reason_code === 'NEAR_MISS' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {q.reason_label}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm mb-2">
                      <div>
                        <span className="text-gray-500">Your Answer: </span>
                        <span className={`font-semibold ${q.is_correct ? 'text-green-700' : 'text-red-700'}`}>
                          {q.user_answer || 'No answer'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Correct: </span>
                        <span className="font-semibold text-green-700">{q.correct_answer}</span>
                      </div>
                    </div>
                    
                    {/* Evidence from Passage */}
                    {q.evidence_text && !q.is_correct && (
                      <div data-testid={`evidence-reading-${q.question_id}`} className="mt-3 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                        <div className="flex items-start gap-2">
                          <Eye className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-yellow-700 mb-1">Evidence in Passage</p>
                            <p className="text-sm text-gray-700 italic leading-relaxed">"...{q.evidence_text}..."</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {!q.evidence_text && !q.is_correct && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300">
                        <div className="flex items-start gap-2">
                          <Eye className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-gray-500">Evidence not available for this question</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Explanation */}
                    {q.explanation && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                        <div className="flex items-start gap-2">
                          <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-blue-700 mb-1">Explanation</p>
                            <p className="text-sm text-gray-700 leading-relaxed">{q.explanation}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Skill Tip */}
                    {q.skill_tip && !q.is_correct && (
                      <div className="mt-3 p-3 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                        <div className="flex items-start gap-2">
                          <GraduationCap className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-purple-700 mb-1">Skill Tip</p>
                            <p className="text-sm text-gray-700 leading-relaxed">{q.skill_tip}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Writing Evaluation Section */}
        <Card className="p-6 mb-6 bg-white border-0 shadow-lg rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center shadow-lg">
                <PenTool className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Writing Evaluation</h3>
                <p className="text-sm text-gray-500">
                  {results?.writing?.evaluated ? 'AI Evaluated' : 'Click to get detailed AI feedback'}
                </p>
              </div>
            </div>
            {results?.writing?.evaluated ? (
              <Badge className={`text-lg px-3 py-1 ${getBandLightBg(results.writing.score || 5)}`}>
                Band {results.writing.score}
              </Badge>
            ) : (
              <Button 
                className="bg-purple-600 hover:bg-purple-700"
                onClick={evaluateWriting}
                disabled={evaluating}
              >
                {evaluating ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <BarChart3 className="w-4 h-4 mr-2" />}
                {evaluating ? 'Evaluating...' : 'Evaluate Writing'}
              </Button>
            )}
          </div>
          
          {/* Writing Results - Task by Task */}
          {results?.writing?.evaluated && results.writing.tasks.length > 0 && (
            <div className="space-y-6">
              {results.writing.tasks.map((task, idx) => (
                <div key={idx} className={`p-5 rounded-xl ${task.taskNumber === 1 ? 'bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200' : 'bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${task.taskNumber === 1 ? 'bg-orange-500' : 'bg-violet-500'} flex items-center justify-center shadow-lg`}>
                        {task.taskNumber === 1 ? <BarChart3 className="w-5 h-5 text-white" /> : <Lightbulb className="w-5 h-5 text-white" />}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Task {task.taskNumber} - {task.taskNumber === 1 ? 'Report/Description' : 'Essay'}</h4>
                        <p className="text-sm text-gray-500">{task.wordCount} words (min: {task.minimumWords})</p>
                      </div>
                    </div>
                    <Badge className={`text-lg px-3 py-1 ${getBandLightBg(task.overallBand)}`}>
                      Band {task.overallBand}
                    </Badge>
                  </div>
                  
                  {/* Criteria Scores */}
                  <div className="grid md:grid-cols-2 gap-3 mb-4">
                    {[
                      { key: 'task_achievement', label: 'Task Achievement' },
                      { key: 'coherence_cohesion', label: 'Coherence & Cohesion' },
                      { key: 'lexical_resource', label: 'Lexical Resource' },
                      { key: 'grammatical_range', label: 'Grammar' }
                    ].map(crit => {
                      const score = task.criteria?.[crit.key];
                      if (!score) return null;
                      return (
                        <div key={crit.key} className="p-3 bg-white rounded-lg">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-gray-900">{crit.label}</span>
                            <span className={`px-2 py-0.5 rounded text-sm font-bold ${getBandLightBg(score)}`}>Band {score}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Examiner Comment */}
                  {task.feedback?.examiner_comment && (
                    <div className="mb-4 p-4 bg-white rounded-xl">
                      <h5 className="font-semibold text-gray-900 mb-2">Teacher&apos;s Feedback</h5>
                      <p className="text-gray-700 leading-relaxed">{task.feedback.examiner_comment}</p>
                    </div>
                  )}
                  
                  {/* Strengths */}
                  {task.feedback?.strengths?.length > 0 && (
                    <div className="mb-3 p-3 bg-green-50 rounded-lg border border-green-100">
                      <p className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Strengths
                      </p>
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        {task.feedback.strengths.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  )}
                  
                  {/* Areas for Improvement */}
                  {task.feedback?.improvements?.length > 0 && (
                    <div className="mb-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                      <p className="text-sm font-semibold text-amber-700 mb-2 flex items-center gap-1">
                        <Target className="w-4 h-4" /> Areas to Improve
                      </p>
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        {task.feedback.improvements.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Speaking Section */}
        <Card className="p-6 mb-6 bg-white border-0 shadow-lg rounded-2xl">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => Object.keys(speakingEvaluations).length > 0 && setExpandedSection(expandedSection === 'speaking' ? null : 'speaking')}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                <Mic className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Speaking Evaluation</h3>
                <p className="text-sm text-gray-500">
                  {Object.keys(speakingEvaluations).length > 0 
                    ? `${Object.keys(speakingEvaluations).length} responses evaluated` 
                    : 'Speaking responses will be evaluated upon submission'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {Object.keys(speakingEvaluations).length > 0 ? (
                <>
                  <Badge className={`text-lg px-3 py-1 ${getBandLightBg(
                    Math.round(Object.values(speakingEvaluations).reduce((sum, e) => sum + (e.overall_band || 5), 0) / Object.keys(speakingEvaluations).length * 2) / 2
                  )}`}>
                    Band {Math.round(Object.values(speakingEvaluations).reduce((sum, e) => sum + (e.overall_band || 5), 0) / Object.keys(speakingEvaluations).length * 2) / 2}
                  </Badge>
                  {expandedSection === 'speaking' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </>
              ) : (
                <Badge className="bg-gray-100 text-gray-500">Pending</Badge>
              )}
            </div>
          </div>
          
          {/* Speaking Results - Expandable */}
          {expandedSection === 'speaking' && Object.keys(speakingEvaluations).length > 0 && (
            <div className="mt-6 space-y-4">
              {Object.entries(speakingEvaluations).map(([questionIdx, evaluation]) => (
                <div key={questionIdx} className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                  <div className="flex justify-between items-center mb-4 pb-3 border-b border-emerald-100">
                    <span className="font-bold text-lg text-gray-900">Response {parseInt(questionIdx) + 1}</span>
                    <Badge className={`text-lg px-3 py-1 ${getBandLightBg(evaluation.overall_band || 5)}`}>
                      Band {evaluation.overall_band || 5}
                    </Badge>
                  </div>
                  
                  {/* Criteria Scores */}
                  {evaluation.criteria && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      {evaluation.criteria.fluency_coherence && (
                        <div className="p-3 bg-blue-50 rounded-lg text-center">
                          <div className="text-xs text-blue-600 font-medium">Fluency</div>
                          <div className={`text-lg font-bold ${getBandColorClass(evaluation.criteria.fluency_coherence)}`}>
                            {evaluation.criteria.fluency_coherence}
                          </div>
                        </div>
                      )}
                      {evaluation.criteria.lexical_resource && (
                        <div className="p-3 bg-purple-50 rounded-lg text-center">
                          <div className="text-xs text-purple-600 font-medium">Vocabulary</div>
                          <div className={`text-lg font-bold ${getBandColorClass(evaluation.criteria.lexical_resource)}`}>
                            {evaluation.criteria.lexical_resource}
                          </div>
                        </div>
                      )}
                      {evaluation.criteria.grammatical_range && (
                        <div className="p-3 bg-green-50 rounded-lg text-center">
                          <div className="text-xs text-green-600 font-medium">Grammar</div>
                          <div className={`text-lg font-bold ${getBandColorClass(evaluation.criteria.grammatical_range)}`}>
                            {evaluation.criteria.grammatical_range}
                          </div>
                        </div>
                      )}
                      {evaluation.criteria.pronunciation && (
                        <div className="p-3 bg-amber-50 rounded-lg text-center">
                          <div className="text-xs text-amber-600 font-medium">Pronunciation</div>
                          <div className={`text-lg font-bold ${getBandColorClass(evaluation.criteria.pronunciation)}`}>
                            {evaluation.criteria.pronunciation}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Feedback */}
                  {evaluation.feedback && (
                    <div className="mb-3 p-3 bg-emerald-50 rounded-lg border-l-4 border-emerald-500">
                      <p className="text-xs font-bold text-emerald-700 mb-1">Teacher&apos;s Feedback</p>
                      <p className="text-sm text-gray-700">{evaluation.feedback}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Skill Breakdown Chart */}
        {skillBreakdown.length > 0 && (
          <Card className="p-6 mb-6 bg-white border-0 shadow-lg rounded-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-violet-600" />
              Skill Breakdown
            </h3>
            <div className="space-y-3">
              {skillBreakdown.map((skill, idx) => {
                const accuracy = skill.total > 0 ? (skill.correct / skill.total) * 100 : 0;
                return (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-48 text-sm text-gray-700 truncate">{skill.label}</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all ${
                          accuracy >= 70 ? 'bg-green-500' : accuracy >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${accuracy}%` }}
                      />
                    </div>
                    <div className="w-16 text-right text-sm font-medium">
                      {skill.correct}/{skill.total}
                    </div>
                    <div className={`w-12 text-right text-sm font-bold ${
                      accuracy >= 70 ? 'text-green-600' : accuracy >= 50 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {Math.round(accuracy)}%
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={() => navigate('/question-bank')} variant="outline" className="flex-1">
            <BookMarked className="w-4 h-4 mr-2" /> More Tests
          </Button>
          <Button 
            onClick={() => navigate('/mastery')} 
            className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0 shadow-lg"
          >
            <GraduationCap className="w-4 h-4 mr-2" /> Study Weak Areas
          </Button>
          <Button 
            onClick={() => navigate(`/cambridge-test/${bookId}/${testId}`)} 
            className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-lg"
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Retake Test
          </Button>
        </div>
      </div>
    </div>
  );
}
