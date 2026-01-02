import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  CheckCircle, XCircle, ArrowLeft, BookOpen, Headphones, PenTool, Mic,
  TrendingUp, Award, Target, Clock, BarChart3, ChevronRight, Lightbulb,
  BookMarked, GraduationCap, RefreshCw
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
  const [recommendations, setRecommendations] = useState([]);
  
  // Get data from navigation state
  const { answers = {}, testData = {}, mode = 'full', skill = null } = location.state || {};

  useEffect(() => {
    if (!location.state) {
      // No state - redirect back
      toast.error('No test data found');
      navigate('/question-bank');
      return;
    }
    
    calculateResults();
  }, []);

  const calculateResults = async () => {
    setLoading(true);
    
    try {
      // Fetch answer key from backend
      const res = await fetch(`${API_URL}/api/cambridge/answers/${bookId}/${testId}`);
      const data = await res.json();
      
      if (data.success) {
        setAnswerKey(data.answers);
      }
      
      // Calculate scores based on answers
      const calculatedResults = {
        listening: calculateSectionScore('listening', answers, data.answers?.listening),
        reading: calculateSectionScore('reading', answers, data.answers?.reading),
        writing: { score: null, evaluated: false, tasks: [] },
        speaking: { score: null, evaluated: false, parts: [] },
        overall: null
      };
      
      // Calculate overall band (only for L & R initially)
      const scores = [calculatedResults.listening.band, calculatedResults.reading.band].filter(s => s);
      if (scores.length > 0) {
        calculatedResults.overall = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 2) / 2;
      }
      
      setResults(calculatedResults);
      
      // Generate recommendations
      generateRecommendations(calculatedResults);
      
    } catch (error) {
      console.error('Error calculating results:', error);
      toast.error('Could not load results');
    } finally {
      setLoading(false);
    }
  };

  const calculateSectionScore = (section, userAnswers, correctAnswers) => {
    if (!correctAnswers) {
      return { correct: 0, total: 0, band: 5.0, details: [] };
    }
    
    let correct = 0;
    let total = Object.keys(correctAnswers).length;
    const details = [];
    
    Object.entries(correctAnswers).forEach(([key, correctAns]) => {
      const userAns = userAnswers[`${section}_${key}`];
      const isCorrect = compareAnswers(userAns, correctAns);
      
      if (isCorrect) correct++;
      
      details.push({
        question: key,
        userAnswer: userAns || '-',
        correctAnswer: correctAns,
        isCorrect
      });
    });
    
    // Convert raw score to band (simplified)
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
    
    // Handle array answers (multiple correct options)
    if (Array.isArray(correctAns)) {
      return correctAns.some(ans => normalize(ans) === normalize(userAns));
    }
    
    // Handle answers with alternatives (e.g., "answer1/answer2")
    if (correctAns.includes('/')) {
      return correctAns.split('/').some(ans => normalize(ans) === normalize(userAns));
    }
    
    return normalize(userAns) === normalize(correctAns);
  };

  const generateRecommendations = (results) => {
    const recs = [];
    
    // Based on Listening performance
    if (results.listening.band < 6.5) {
      recs.push({
        icon: Headphones,
        title: 'Improve Listening Skills',
        description: 'Practice with more listening exercises to improve comprehension',
        link: '/question-bank?tab=listening',
        priority: 'high'
      });
    }
    
    // Based on Reading performance
    if (results.reading.band < 6.5) {
      recs.push({
        icon: BookOpen,
        title: 'Reading Practice Needed',
        description: 'Work on reading speed and comprehension strategies',
        link: '/question-bank?tab=reading',
        priority: 'high'
      });
    }
    
    // General recommendations
    recs.push({
      icon: GraduationCap,
      title: 'IELTS Mastery Course',
      description: 'Complete our structured course for comprehensive preparation',
      link: '/mastery',
      priority: 'medium'
    });
    
    recs.push({
      icon: Target,
      title: 'Practice More Tests',
      description: 'Try another full test to track your progress',
      link: '/question-bank?tab=fullTests',
      priority: 'low'
    });
    
    setRecommendations(recs);
  };

  const evaluateWriting = async () => {
    setEvaluating(true);
    toast.info('Evaluating writing responses...');
    
    try {
      const tasks = [];
      
      // Evaluate Task 1 if available
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
            referenceSamples: data1.reference_samples
          });
        }
      }
      
      // Evaluate Task 2 if available
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
            referenceSamples: data2.reference_samples
          });
        }
      }
      
      // Calculate overall writing band (Task 2 weighted more)
      let overallWritingBand = null;
      if (tasks.length > 0) {
        if (tasks.length === 2) {
          // Task 2 counts double
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

  const getBandColor = (band) => {
    if (band >= 7.5) return 'text-green-600 bg-green-100';
    if (band >= 6.5) return 'text-blue-600 bg-blue-100';
    if (band >= 5.5) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Calculating your results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/question-bank')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Question Bank
          </Button>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center">
              <Award className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Test Results</h1>
              <p className="text-gray-500">{testData.title || `IELTS ${bookId.toUpperCase()} - ${testId}`}</p>
            </div>
          </div>
        </div>

        {/* Overall Score Card */}
        {results?.overall && (
          <Card className="p-6 mb-6 bg-gradient-to-br from-red-500 to-red-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">Estimated Overall Band</p>
                <p className="text-5xl font-bold">{results.overall}</p>
                <p className="text-red-100 text-sm mt-1">Based on Listening & Reading</p>
              </div>
              <div className="text-right">
                <BarChart3 className="w-16 h-16 text-red-200" />
              </div>
            </div>
          </Card>
        )}

        {/* Section Scores */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Listening */}
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Headphones className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Listening</h3>
                <p className="text-sm text-gray-500">
                  {results?.listening?.correct || 0}/{results?.listening?.total || 40} correct
                </p>
              </div>
              <Badge className={`ml-auto text-lg px-3 py-1 ${getBandColor(results?.listening?.band || 5)}`}>
                {results?.listening?.band || '-'}
              </Badge>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${results?.listening?.percentage || 0}%` }}
              />
            </div>
          </Card>

          {/* Reading */}
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Reading</h3>
                <p className="text-sm text-gray-500">
                  {results?.reading?.correct || 0}/{results?.reading?.total || 40} correct
                </p>
              </div>
              <Badge className={`ml-auto text-lg px-3 py-1 ${getBandColor(results?.reading?.band || 5)}`}>
                {results?.reading?.band || '-'}
              </Badge>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${results?.reading?.percentage || 0}%` }}
              />
            </div>
          </Card>

          {/* Writing */}
          <Card className="p-5 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <PenTool className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Writing</h3>
                <p className="text-sm text-gray-500">
                  {results?.writing?.evaluated ? 'AI Evaluated' : 'Click to get detailed AI feedback'}
                </p>
              </div>
              {results?.writing?.evaluated ? (
                <Badge className={`ml-auto text-lg px-3 py-1 ${getBandColor(results?.writing?.score || 5)}`}>
                  {results?.writing?.score || '-'}
                </Badge>
              ) : (
                <Button 
                  size="sm" 
                  className="ml-auto bg-purple-600 hover:bg-purple-700"
                  onClick={evaluateWriting}
                  disabled={evaluating}
                >
                  {evaluating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : 'Get AI Feedback'}
                </Button>
              )}
            </div>
            
            {/* Detailed Writing Feedback */}
            {results?.writing?.evaluated && results?.writing?.tasks?.length > 0 && (
              <div className="space-y-6 mt-4">
                {results.writing.tasks.map((task, idx) => (
                  <div key={idx} className="border rounded-lg p-4 bg-purple-50/50">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-purple-900">
                        Task {task.taskNumber} Evaluation
                      </h4>
                      <Badge className={`${getBandColor(task.overallBand)}`}>
                        Band {task.overallBand}
                      </Badge>
                    </div>
                    
                    {/* Word Count */}
                    <p className="text-sm text-gray-600 mb-3">
                      Word Count: {task.wordCount} / {task.minimumWords} minimum
                      {task.wordCount < task.minimumWords && (
                        <span className="text-red-600 ml-2">(Under minimum!)</span>
                      )}
                    </p>
                    
                    {/* Criteria Scores */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                      {task.criteria && Object.entries(task.criteria).map(([criterion, score]) => (
                        <div key={criterion} className="text-center p-2 bg-white rounded border">
                          <p className="text-xs text-gray-500 capitalize">
                            {criterion.replace(/_/g, ' ')}
                          </p>
                          <p className={`font-bold ${score >= 6.5 ? 'text-green-600' : score >= 5 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {score}
                          </p>
                        </div>
                      ))}
                    </div>
                    
                    {/* Examiner Comment */}
                    {task.feedback?.examiner_comment && (
                      <div className="bg-white rounded-lg p-3 border mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Examiner&apos;s Comment:</p>
                        <p className="text-sm text-gray-600 italic">{task.feedback.examiner_comment}</p>
                      </div>
                    )}
                    
                    {/* Strengths */}
                    {task.feedback?.strengths?.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-green-700 mb-1">Strengths:</p>
                        <ul className="text-sm text-gray-600 list-disc list-inside">
                          {task.feedback.strengths.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                      </div>
                    )}
                    
                    {/* Areas for Improvement */}
                    {task.feedback?.improvements?.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-orange-700 mb-1">Areas for Improvement:</p>
                        <ul className="text-sm text-gray-600 list-disc list-inside">
                          {task.feedback.improvements.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                      </div>
                    )}
                    
                    {/* Vocabulary Notes */}
                    {task.feedback?.vocabulary_notes && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-blue-700 mb-1">Vocabulary Notes:</p>
                        <p className="text-sm text-gray-600">{task.feedback.vocabulary_notes}</p>
                      </div>
                    )}
                    
                    {/* Grammar Notes */}
                    {task.feedback?.grammar_notes && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-indigo-700 mb-1">Grammar Notes:</p>
                        <p className="text-sm text-gray-600">{task.feedback.grammar_notes}</p>
                      </div>
                    )}
                    
                    {/* Reference Samples Toggle */}
                    {task.referenceSamples && (task.referenceSamples.band_6 || task.referenceSamples.band_8) && (
                      <details className="mt-3 border-t pt-3">
                        <summary className="text-sm font-medium text-purple-700 cursor-pointer hover:text-purple-900">
                          View Sample Answers (Band 6 and Band 8)
                        </summary>
                        <div className="mt-3 space-y-4">
                          {task.referenceSamples.band_6 && (
                            <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                              <p className="text-sm font-medium text-yellow-800 mb-2">
                                Band 6 Sample (Score: {task.referenceSamples.band_6.score})
                              </p>
                              <p className="text-xs text-gray-600 mb-2 whitespace-pre-wrap">{task.referenceSamples.band_6.response}</p>
                              <p className="text-xs text-yellow-700 italic">{task.referenceSamples.band_6.examiner_comment}</p>
                            </div>
                          )}
                          {task.referenceSamples.band_8 && (
                            <div className="bg-green-50 p-3 rounded border border-green-200">
                              <p className="text-sm font-medium text-green-800 mb-2">
                                Band 8 Sample (Score: {task.referenceSamples.band_8.score})
                              </p>
                              <p className="text-xs text-gray-600 mb-2 whitespace-pre-wrap">{task.referenceSamples.band_8.response}</p>
                              <p className="text-xs text-green-700 italic">{task.referenceSamples.band_8.examiner_comment}</p>
                            </div>
                          )}
                        </div>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Speaking */}
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Mic className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Speaking</h3>
                <p className="text-sm text-gray-500">
                  {results?.speaking?.evaluated ? 'AI Evaluated' : 'Evaluate recordings'}
                </p>
              </div>
              {results?.speaking?.evaluated ? (
                <Badge className={`ml-auto text-lg px-3 py-1 ${getBandColor(results?.speaking?.score || 5)}`}>
                  {results?.speaking?.score || '-'}
                </Badge>
              ) : (
                <Badge className="ml-auto bg-gray-100 text-gray-500">
                  Pending
                </Badge>
              )}
            </div>
          </Card>
        </div>

        {/* Answer Details */}
        <Card className="p-6 mb-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-gray-600" />
            Answer Details
          </h3>
          
          {/* Listening Answers - Expandable */}
          {results?.listening?.details?.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Headphones className="w-4 h-4 text-blue-600" /> Listening Answers
                <span className="text-sm text-gray-400">
                  ({results.listening.correct}/{results.listening.total} correct)
                </span>
              </h4>
              <div className="space-y-2">
                {results.listening.details.map((item, idx) => (
                  <details 
                    key={idx}
                    className={`rounded-lg border ${
                      item.isCorrect 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <summary className="p-3 cursor-pointer flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-sm">Q{item.question}</span>
                        {item.isCorrect ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                        <span className={`text-sm ${item.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                          {item.userAnswer || '-'}
                        </span>
                        {!item.isCorrect && (
                          <span className="text-sm text-gray-500">
                            → {Array.isArray(item.correctAnswer) ? item.correctAnswer.join(' / ') : item.correctAnswer}
                          </span>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </summary>
                    <div className="px-3 pb-3 pt-1 border-t border-gray-200">
                      {/* Explanation placeholder - would come from test data */}
                      <div className="p-2 bg-blue-50 rounded text-sm">
                        <p className="text-blue-700 font-medium text-xs mb-1">Explanation:</p>
                        <p className="text-gray-600 text-xs">
                          The correct answer is "{Array.isArray(item.correctAnswer) ? item.correctAnswer[0] : item.correctAnswer}". 
                          Listen carefully to the audio for keywords and context clues.
                        </p>
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          )}

          {/* Reading Answers - Expandable with Locate & Explain */}
          {results?.reading?.details?.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-green-600" /> Reading Answers
                <span className="text-sm text-gray-400">
                  ({results.reading.correct}/{results.reading.total} correct)
                </span>
              </h4>
              <div className="space-y-2">
                {results.reading.details.map((item, idx) => (
                  <details 
                    key={idx}
                    className={`rounded-lg border ${
                      item.isCorrect 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <summary className="p-3 cursor-pointer flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-sm">Q{item.question}</span>
                        {item.isCorrect ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                        <span className={`text-sm ${item.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                          {Array.isArray(item.userAnswer) ? item.userAnswer.join(', ') : (item.userAnswer || '-')}
                        </span>
                        {!item.isCorrect && (
                          <span className="text-sm text-gray-500">
                            → {Array.isArray(item.correctAnswer) ? item.correctAnswer.join(' / ') : item.correctAnswer}
                          </span>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </summary>
                    <div className="px-3 pb-3 pt-1 border-t border-gray-200 space-y-2">
                      {/* Locate in Passage */}
                      <div className="p-2 bg-yellow-50 rounded border-l-4 border-yellow-400">
                        <p className="text-yellow-700 font-medium text-xs mb-1 flex items-center gap-1">
                          <Target className="w-3 h-3" /> Located in Passage:
                        </p>
                        <p className="text-gray-600 text-xs italic">
                          "...The answer can be found in Passage {Math.ceil(parseInt(item.question) / 13)}. 
                          Look for keywords related to the question..."
                        </p>
                      </div>
                      
                      {/* Explanation */}
                      <div className="p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                        <p className="text-blue-700 font-medium text-xs mb-1 flex items-center gap-1">
                          <Lightbulb className="w-3 h-3" /> Explanation:
                        </p>
                        <p className="text-gray-600 text-xs">
                          The correct answer is "{Array.isArray(item.correctAnswer) ? item.correctAnswer[0] : item.correctAnswer}". 
                          {item.correctAnswer === 'TRUE' || item.correctAnswer === 'YES' 
                            ? ' The statement agrees with the information in the passage.'
                            : item.correctAnswer === 'FALSE' || item.correctAnswer === 'NO'
                            ? ' The statement contradicts information in the passage.'
                            : item.correctAnswer === 'NOT GIVEN'
                            ? ' There is no information in the passage about this statement.'
                            : ' This answer directly matches information provided in the text.'}
                        </p>
                      </div>
                      
                      {/* Skill Tip */}
                      <div className="p-2 bg-purple-50 rounded border-l-4 border-purple-400">
                        <p className="text-purple-700 font-medium text-xs mb-1 flex items-center gap-1">
                          <GraduationCap className="w-3 h-3" /> Skill Tip:
                        </p>
                        <p className="text-gray-600 text-xs">
                          {item.correctAnswer === 'TRUE' || item.correctAnswer === 'FALSE' || item.correctAnswer === 'NOT GIVEN'
                            ? 'For True/False/Not Given questions, focus on exact wording. If the passage says something similar but not exactly the same, consider if it truly matches or contradicts.'
                            : item.correctAnswer === 'YES' || item.correctAnswer === 'NO'
                            ? 'Yes/No/Not Given questions test opinions and claims. Look for the writer\'s view, not just facts.'
                            : 'Read the question carefully and scan for synonyms and paraphrases in the passage.'}
                        </p>
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Recommendations */}
        <Card className="p-6 mb-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Recommended Next Steps
          </h3>
          <div className="space-y-3">
            {recommendations.map((rec, idx) => {
              const Icon = rec.icon;
              return (
                <div 
                  key={idx}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-all"
                  onClick={() => navigate(rec.link)}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    rec.priority === 'high' ? 'bg-red-100' :
                    rec.priority === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      rec.priority === 'high' ? 'text-red-600' :
                      rec.priority === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{rec.title}</h4>
                    <p className="text-sm text-gray-500">{rec.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              );
            })}
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button 
            variant="outline"
            onClick={() => navigate('/question-bank')}
          >
            <BookMarked className="w-4 h-4 mr-2" /> More Tests
          </Button>
          <Button 
            className="bg-red-600 hover:bg-red-700"
            onClick={() => navigate(`/cambridge-test/${bookId}/${testId}`)}
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Retake Test
          </Button>
        </div>
      </div>
    </div>
  );
}
