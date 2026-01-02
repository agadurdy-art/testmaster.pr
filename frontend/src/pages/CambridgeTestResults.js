import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  CheckCircle, XCircle, ArrowLeft, BookOpen, Headphones, PenTool, Mic,
  TrendingUp, Award, Target, BarChart3, ChevronDown, ChevronUp, Lightbulb,
  BookMarked, GraduationCap, RefreshCw, MapPin, Eye, FileText, Home
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
  const [answerKey, setAnswerKey] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);
  const [writingViewTab, setWritingViewTab] = useState('feedback');
  
  // Get data from navigation state
  const { answers = {}, testData = {}, mode = 'full', skill = null, speakingEvaluations = {} } = location.state || {};

  useEffect(() => {
    if (!location.state) {
      toast.error('No test data found');
      navigate('/question-bank');
      return;
    }
    calculateResults();
  }, []);

  const calculateResults = async () => {
    setLoading(true);
    
    try {
      const res = await fetch(`${API_URL}/api/cambridge/answers/${bookId}/${testId}`);
      const data = await res.json();
      
      if (data.success) {
        setAnswerKey(data.answers);
      }
      
      const calculatedResults = {
        listening: calculateSectionScore('listening', answers, data.answers?.listening),
        reading: calculateSectionScore('reading', answers, data.answers?.reading),
        writing: { score: null, evaluated: false, tasks: [] },
        speaking: { score: null, evaluated: false, parts: [] },
        overall: null
      };
      
      const scores = [calculatedResults.listening.band, calculatedResults.reading.band].filter(s => s);
      if (scores.length > 0) {
        calculatedResults.overall = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 2) / 2;
      }
      
      setResults(calculatedResults);
      
    } catch (error) {
      console.error('Error calculating results:', error);
      toast.error('Could not load results');
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
    let band = 5.0;
    if (percentage >= 90) band = 9.0;
    else if (percentage >= 82) band = 8.5;
    else if (percentage >= 75) band = 8.0;
    else if (percentage >= 68) band = 7.5;
    else if (percentage >= 60) band = 7.0;
    else if (percentage >= 52) band = 6.5;
    else if (percentage >= 45) band = 6.0;
    else if (percentage >= 38) band = 5.5;
    else if (percentage >= 30) band = 5.0;
    else if (percentage >= 22) band = 4.5;
    else band = 4.0;
    
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
          <p className="text-gray-500">Calculating your results...</p>
        </div>
      </div>
    );
  }

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
          <p className={`text-8xl font-bold mb-8 ${getBandColorClass(results?.overall || 5)}`}>{results?.overall || '-'}</p>
          
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

        {/* Listening Results - Detailed with Locate & Explain */}
        {results?.listening?.details?.length > 0 && (
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
                  <h3 className="text-lg font-semibold text-gray-900">Listening Results</h3>
                  <p className="text-sm text-gray-500">
                    {results.listening.correct}/{results.listening.total} correct ({Math.round(results.listening.percentage)}%)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={`text-lg px-3 py-1 ${getBandLightBg(results.listening.band)}`}>
                  Band {results.listening.band}
                </Badge>
                {expandedSection === 'listening' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            </div>
            
            {expandedSection === 'listening' && (
              <div className="mt-6 space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {results.listening.details.map((q, idx) => (
                  <div 
                    key={idx} 
                    className={`p-4 rounded-xl border-l-4 ${
                      q.is_correct 
                        ? 'bg-green-50 border-green-500' 
                        : 'bg-red-50 border-red-500'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                            q.is_correct ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                          }`}>
                            {q.question_id}
                          </span>
                          {q.is_correct ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600" />
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
                            <span className="text-gray-500">Correct Answer: </span>
                            <span className="font-semibold text-green-700">
                              {Array.isArray(q.correct_answer) ? q.correct_answer.join(' / ') : q.correct_answer}
                            </span>
                          </div>
                        </div>
                        
                        {/* Explanation */}
                        {!q.is_correct && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                            <div className="flex items-start gap-2">
                              <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs font-semibold text-blue-700 mb-1">Explanation</p>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                  The correct answer is &ldquo;{Array.isArray(q.correct_answer) ? q.correct_answer[0] : q.correct_answer}&rdquo;. 
                                  Listen carefully to the audio for keywords and context clues related to this question.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Reading Results - Detailed with Locate & Explain */}
        {results?.reading?.details?.length > 0 && (
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
                  <h3 className="text-lg font-semibold text-gray-900">Reading Results</h3>
                  <p className="text-sm text-gray-500">
                    {results.reading.correct}/{results.reading.total} correct ({Math.round(results.reading.percentage)}%)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={`text-lg px-3 py-1 ${getBandLightBg(results.reading.band)}`}>
                  Band {results.reading.band}
                </Badge>
                {expandedSection === 'reading' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            </div>
            
            {expandedSection === 'reading' && (
              <div className="mt-6 space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {results.reading.details.map((q, idx) => (
                  <div 
                    key={idx} 
                    className={`p-4 rounded-xl border-l-4 ${
                      q.is_correct 
                        ? 'bg-green-50 border-green-500' 
                        : 'bg-red-50 border-red-500'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                            q.is_correct ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                          }`}>
                            {q.question_id}
                          </span>
                          {q.is_correct ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600" />
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
                            <span className="text-gray-500">Correct Answer: </span>
                            <span className="font-semibold text-green-700">
                              {Array.isArray(q.correct_answer) ? q.correct_answer.join(' / ') : q.correct_answer}
                            </span>
                          </div>
                        </div>
                        
                        {/* Locate in Passage */}
                        <div className="mt-3 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-semibold text-yellow-700 mb-1">Located in Passage</p>
                              <p className="text-sm text-gray-700 italic leading-relaxed">
                                This answer can be found in Passage {Math.ceil(parseInt(q.question_id) / 13)}. 
                                Look for keywords and synonyms related to the question.
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Explanation */}
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                          <div className="flex items-start gap-2">
                            <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-semibold text-blue-700 mb-1">Explanation</p>
                              <p className="text-sm text-gray-700 leading-relaxed">
                                {getExplanationText(q.correct_answer)}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Skill Tip */}
                        <div className="mt-3 p-3 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                          <div className="flex items-start gap-2">
                            <GraduationCap className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-semibold text-purple-700 mb-1">Skill Tip</p>
                              <p className="text-sm text-gray-700 leading-relaxed">
                                {getSkillTip(q.correct_answer)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
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
                  
                  {/* Vocabulary Notes */}
                  {task.feedback?.vocabulary_notes && (
                    <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-sm font-semibold text-blue-700 mb-1">Vocabulary Notes</p>
                      <p className="text-sm text-gray-600">{task.feedback.vocabulary_notes}</p>
                    </div>
                  )}
                  
                  {/* Grammar Notes */}
                  {task.feedback?.grammar_notes && (
                    <div className="mb-3 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                      <p className="text-sm font-semibold text-indigo-700 mb-1">Grammar Notes</p>
                      <p className="text-sm text-gray-600">{task.feedback.grammar_notes}</p>
                    </div>
                  )}

                  {/* Tab Navigation for Original Text & Samples */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex gap-2 mb-4">
                      <Button
                        variant={writingViewTab === 'original' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setWritingViewTab('original')}
                        className={writingViewTab === 'original' ? 'bg-cyan-500 text-white' : ''}
                      >
                        <Eye className="w-4 h-4 mr-1" /> Your Text
                      </Button>
                      <Button
                        variant={writingViewTab === 'sample' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setWritingViewTab('sample')}
                        className={writingViewTab === 'sample' ? 'bg-cyan-500 text-white' : ''}
                      >
                        <FileText className="w-4 h-4 mr-1" /> Sample Answers
                      </Button>
                    </div>
                    
                    {writingViewTab === 'original' && task.userResponse && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{task.userResponse}</p>
                      </div>
                    )}
                    
                    {writingViewTab === 'sample' && task.referenceSamples && (
                      <div className="space-y-4">
                        {task.referenceSamples.band_6 && (
                          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                            <p className="font-medium text-yellow-800 mb-2">Band 6 Sample</p>
                            <p className="text-sm text-gray-600 whitespace-pre-wrap mb-2">{task.referenceSamples.band_6.response}</p>
                            <p className="text-xs text-yellow-700 italic">{task.referenceSamples.band_6.examiner_comment}</p>
                          </div>
                        )}
                        {task.referenceSamples.band_8 && (
                          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <p className="font-medium text-green-800 mb-2">Band 8+ Sample</p>
                            <p className="text-sm text-gray-600 whitespace-pre-wrap mb-2">{task.referenceSamples.band_8.response}</p>
                            <p className="text-xs text-green-700 italic">{task.referenceSamples.band_8.examiner_comment}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Speaking Evaluation Section */}
        <Card className="p-6 mb-6 bg-white border-0 shadow-lg rounded-2xl">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setExpandedSection(expandedSection === 'speaking' ? null : 'speaking')}
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
                  {/* Response Header */}
                  <div className="flex justify-between items-center mb-4 pb-3 border-b border-emerald-100">
                    <span className="font-bold text-lg text-gray-900">Response {parseInt(questionIdx) + 1}</span>
                    <div className="flex items-center gap-2">
                      {evaluation.tier === 'premium' && (
                        <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs">
                          Premium Analysis
                        </Badge>
                      )}
                      <Badge className={`text-lg px-3 py-1 ${getBandLightBg(evaluation.overall_band || 5)}`}>
                        Band {evaluation.overall_band || 5}
                      </Badge>
                    </div>
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
                  
                  {/* Premium Azure Scores (if available) */}
                  {evaluation.azure_scores && (
                    <div className="mb-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                      <p className="text-xs font-bold text-amber-700 mb-3">Azure Pronunciation Analysis</p>
                      <div className="grid grid-cols-5 gap-2">
                        <div className="text-center">
                          <div className="text-lg font-bold text-amber-700">{Math.round(evaluation.azure_scores.pronunciation)}%</div>
                          <div className="text-xs text-gray-500">Overall</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">{Math.round(evaluation.azure_scores.accuracy)}%</div>
                          <div className="text-xs text-gray-500">Accuracy</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">{Math.round(evaluation.azure_scores.fluency)}%</div>
                          <div className="text-xs text-gray-500">Fluency</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-600">{Math.round(evaluation.azure_scores.completeness)}%</div>
                          <div className="text-xs text-gray-500">Completeness</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-pink-600">{Math.round(evaluation.azure_scores.prosody)}%</div>
                          <div className="text-xs text-gray-500">Prosody</div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Problem Words (Premium) */}
                  {evaluation.word_level_results && evaluation.word_level_results.length > 0 && (
                    <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-xs font-bold text-red-700 mb-2">Words to Practice</p>
                      <div className="flex flex-wrap gap-2">
                        {evaluation.word_level_results.slice(0, 10).map((word, i) => (
                          <span key={i} className="px-2 py-1 bg-white rounded text-sm text-red-700 border border-red-200">
                            {word.word} ({Math.round(word.accuracy_score)}%)
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Transcript */}
                  {evaluation.transcript && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs font-bold text-gray-700 mb-1">Your Response (Transcribed)</p>
                      <p className="text-sm text-gray-600 italic">{evaluation.transcript}</p>
                    </div>
                  )}
                  
                  {/* Feedback */}
                  {evaluation.feedback && (
                    <div className="mb-3 p-3 bg-emerald-50 rounded-lg border-l-4 border-emerald-500">
                      <p className="text-xs font-bold text-emerald-700 mb-1">Teacher&apos;s Feedback</p>
                      <p className="text-sm text-gray-700">{evaluation.feedback}</p>
                    </div>
                  )}
                  
                  {/* Mentor Notes (Premium) */}
                  {evaluation.mentor_notes && (
                    <div className="mb-3 p-3 bg-indigo-50 rounded-lg border-l-4 border-indigo-500">
                      <p className="text-xs font-bold text-indigo-700 mb-1">Mentor Notes</p>
                      <p className="text-sm text-gray-700">{evaluation.mentor_notes}</p>
                    </div>
                  )}
                  
                  {/* Strengths & Weaknesses */}
                  <div className="grid md:grid-cols-2 gap-3">
                    {evaluation.strengths && evaluation.strengths.length > 0 && (
                      <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                        <p className="text-xs font-bold text-green-700 mb-2 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Strengths
                        </p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {evaluation.strengths.map((s, i) => <li key={i}>• {s}</li>)}
                        </ul>
                      </div>
                    )}
                    {evaluation.weaknesses && evaluation.weaknesses.length > 0 && (
                      <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                        <p className="text-xs font-bold text-amber-700 mb-2 flex items-center gap-1">
                          <Target className="w-3 h-3" /> Areas to Improve
                        </p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {evaluation.weaknesses.map((w, i) => <li key={i}>• {w}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  {/* Tip */}
                  {evaluation.tip && (
                    <div className="mt-3 p-3 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                      <p className="text-xs font-bold text-purple-700 mb-1 flex items-center gap-1">
                        <Lightbulb className="w-3 h-3" /> Improvement Tip
                      </p>
                      <p className="text-sm text-gray-700">{evaluation.tip}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={() => navigate('/question-bank')} variant="outline" className="flex-1">
            <BookMarked className="w-4 h-4 mr-2" /> More Tests
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

// Helper functions for explanations
function getExplanationText(answer) {
  const ans = Array.isArray(answer) ? answer[0] : answer;
  if (ans === 'TRUE' || ans === 'YES') {
    return `The correct answer is "${ans}". The statement agrees with the information in the passage.`;
  }
  if (ans === 'FALSE' || ans === 'NO') {
    return `The correct answer is "${ans}". The statement contradicts information in the passage.`;
  }
  if (ans === 'NOT GIVEN') {
    return `The correct answer is "NOT GIVEN". There is no information in the passage about this statement.`;
  }
  return `The correct answer is "${ans}". This answer directly matches information provided in the text.`;
}

function getSkillTip(answer) {
  const ans = Array.isArray(answer) ? answer[0] : answer;
  if (ans === 'TRUE' || ans === 'FALSE' || ans === 'NOT GIVEN') {
    return 'For True/False/Not Given questions, focus on exact wording. If the passage says something similar but not exactly the same, consider if it truly matches or contradicts.';
  }
  if (ans === 'YES' || ans === 'NO') {
    return "Yes/No/Not Given questions test opinions and claims. Look for the writer's view, not just facts.";
  }
  return 'Read the question carefully and scan for synonyms and paraphrases in the passage.';
}
