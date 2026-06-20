import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  ArrowLeft, Clock, FileText, HelpCircle, CheckCircle, 
  ChevronRight, Target, Lightbulb, Award, AlertCircle,
  Play, Pause, RotateCcw, BookOpen
} from 'lucide-react';
import { toast } from 'sonner';
import { usePassageHighlighter, HighlightMenu } from '../components/reading/PassageHighlighter';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function ReadingPracticeGeneral({ user }) {
  const navigate = useNavigate();
  const hl = usePassageHighlighter();
  const [searchParams] = useSearchParams();
  const topic = searchParams.get('topic');
  const band = searchParams.get('band');

  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [moduleContent, setModuleContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60 * 20); // 20 minutes
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    loadModules();
  }, []);

  useEffect(() => {
    let interval;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const loadModules = async () => {
    try {
      const res = await fetch(`${API_URL}/api/courses/reading/general/advanced`);
      const data = await res.json();
      if (data.success) {
        setModules(data.modules);
        // Auto-select first module
        if (data.modules.length > 0) {
          selectModule(data.modules[0].module_id);
        }
      }
    } catch (error) {
      console.error('Error loading modules:', error);
      toast.error('Failed to load reading modules');
    } finally {
      setLoading(false);
    }
  };

  const selectModule = async (moduleId) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/courses/reading/general/advanced/${moduleId}`);
      const data = await res.json();
      if (data.success) {
        setSelectedModule(moduleId);
        setModuleContent(data.module);
        setAnswers({});
        setSubmitted(false);
        setResults(null);
        setTimeLeft(60 * 20);
        setTimerActive(false);
      }
    } catch (error) {
      console.error('Error loading module:', error);
      toast.error('Failed to load module content');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionIndex, answer) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: answer }));
  };

  const submitAnswers = async () => {
    if (!moduleContent?.reading_scenario?.questions) return;

    const questions = moduleContent.reading_scenario.questions;
    let correct = 0;
    const questionResults = questions.map((q, idx) => {
      const userAnswer = answers[idx]?.toLowerCase().trim();
      const correctAnswer = q.answer?.toLowerCase().trim();
      const isCorrect = userAnswer === correctAnswer;
      if (isCorrect) correct++;
      return {
        question: q.question,
        userAnswer: answers[idx] || 'No answer',
        correctAnswer: q.answer,
        isCorrect,
        explanation: q.explanation,
        skillTested: q.skill_tested
      };
    });

    const percentage = (correct / questions.length) * 100;
    const estimatedBand = percentage >= 90 ? 9.0 : percentage >= 80 ? 8.0 : percentage >= 70 ? 7.0 : percentage >= 60 ? 6.0 : 5.0;

    setResults({
      correct,
      total: questions.length,
      percentage,
      estimatedBand,
      questionResults
    });
    setSubmitted(true);
    setTimerActive(false);
    toast.success('Answers submitted! Review your results below.');
  };

  if (loading && !moduleContent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading General Training Reading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/question-bank')}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Question Bank
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" /> General Training Reading
                </h1>
                <p className="text-sm text-gray-500">Policy documents, contracts & workplace notices</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Timer */}
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${timeLeft < 300 ? 'bg-red-100 text-red-700' : 'bg-gray-100'}`}>
                <Clock className="w-4 h-4" />
                <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setTimerActive(!timerActive)}
                >
                  {timerActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
              </div>
              <Badge className="bg-purple-600 text-white">GENERAL TRAINING</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Module Selector */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-600 mb-3">Select Document Type:</p>
          <div className="flex gap-2 flex-wrap">
            {modules.map((module) => (
              <Button
                key={module.module_id}
                variant={selectedModule === module.module_id ? 'default' : 'outline'}
                size="sm"
                onClick={() => selectModule(module.module_id)}
                className={selectedModule === module.module_id ? 'bg-purple-600' : ''}
              >
                {module.module_title?.split(':')[0] || module.module_id}
              </Button>
            ))}
          </div>
        </div>

        {moduleContent && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left: Document/Passage */}
            <Card className="p-0 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-white/20">{moduleContent.band_target}</Badge>
                  <Badge className="bg-purple-400/30">{moduleContent.reading_scenario?.text_type}</Badge>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold">{moduleContent.reading_scenario?.title}</h2>
                    <p className="text-sm text-purple-100 mt-1 italic">{moduleContent.reading_scenario?.context}</p>
                  </div>
                  <button
                    type="button"
                    onClick={hl.clearAll}
                    className="shrink-0 inline-flex items-center gap-1.5 text-[11px] font-medium bg-white/15 hover:bg-white/25 rounded-full px-3 py-1.5 transition-colors"
                    title="Select text in the passage to highlight it. Click here to clear all highlights."
                  >
                    <span className="w-3 h-3 rounded-sm bg-yellow-300 inline-block" />
                    Clear highlights
                  </button>
                </div>
              </div>
              <div className="p-6 max-h-[600px] overflow-y-auto bg-gray-50">
                {/* Paragraph render avoids Safari/iOS Reader Mode auto-engage. */}
                <div
                  ref={hl.ref}
                  onMouseUp={hl.onMouseUp}
                  className="font-sans text-sm text-gray-700 leading-relaxed space-y-3 select-text"
                >
                  {String(moduleContent.reading_scenario?.passage || '')
                    .split(/\n\s*\n/)
                    .filter((p) => p.trim().length > 0)
                    .map((para, i) => (
                      <p key={i}>{para.trim()}</p>
                    ))}
                </div>
              </div>
              <HighlightMenu hl={hl} />
            </Card>

            {/* Right: Questions */}
            <div className="space-y-4">
              <Card className="p-4 bg-purple-50 border-purple-200">
                <h3 className="font-bold text-purple-800 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" /> Document Comprehension
                </h3>
                <p className="text-sm text-purple-600 mt-1">
                  Answer all {moduleContent.reading_scenario?.questions?.length || 0} questions based on the document.
                </p>
              </Card>

              {moduleContent.reading_scenario?.questions?.map((q, idx) => (
                <Card key={idx} className={`p-4 ${submitted ? (results?.questionResults[idx]?.isCorrect ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50') : ''}`}>
                  <div className="flex items-start justify-between mb-3">
                    <p className="font-medium text-gray-900">
                      {idx + 1}. {q.question}
                    </p>
                    {q.skill_tested && (
                      <div className="flex gap-1 flex-wrap">
                        {q.skill_tested.map((skill, si) => (
                          <Badge key={si} className="bg-purple-100 text-purple-700 text-xs">{skill}</Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {q.options ? (
                    <div className="space-y-2 ml-4">
                      {q.options.map((opt, i) => (
                        <label key={i} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:text-purple-600">
                          <input 
                            type="radio" 
                            name={`q_${idx}`} 
                            value={opt}
                            checked={answers[idx] === opt}
                            onChange={(e) => handleAnswerChange(idx, e.target.value)}
                            disabled={submitted}
                            className="accent-purple-600" 
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  ) : q.type === 'true_false_ng' ? (
                    <div className="flex gap-4 ml-4">
                      {['True', 'False', 'Not Given'].map(opt => (
                        <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer hover:text-purple-600">
                          <input 
                            type="radio" 
                            name={`q_${idx}`} 
                            value={opt}
                            checked={answers[idx] === opt}
                            onChange={(e) => handleAnswerChange(idx, e.target.value)}
                            disabled={submitted}
                            className="accent-purple-600" 
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <input 
                      type="text" 
                      placeholder="Type your answer..."
                      value={answers[idx] || ''}
                      onChange={(e) => handleAnswerChange(idx, e.target.value)}
                      disabled={submitted}
                      className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500" 
                    />
                  )}

                  {/* Show result after submission */}
                  {submitted && results?.questionResults[idx] && (
                    <div className={`mt-3 p-3 rounded-lg ${results.questionResults[idx].isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        {results.questionResults[idx].isCorrect ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-600" />
                        )}
                        <span className={`font-medium text-sm ${results.questionResults[idx].isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                          {results.questionResults[idx].isCorrect ? 'Correct!' : 'Incorrect'}
                        </span>
                      </div>
                      {!results.questionResults[idx].isCorrect && (
                        <p className="text-sm text-gray-700">
                          <strong>Correct answer:</strong> {results.questionResults[idx].correctAnswer}
                        </p>
                      )}
                      {q.explanation && (
                        <p className="text-sm text-gray-600 mt-1">{q.explanation}</p>
                      )}
                    </div>
                  )}
                </Card>
              ))}

              {/* Submit / Results */}
              {!submitted ? (
                <Button 
                  onClick={submitAnswers}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-6"
                  disabled={Object.keys(answers).length === 0}
                >
                  <CheckCircle className="w-5 h-5 mr-2" /> Submit Answers
                </Button>
              ) : (
                <Card className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Award className="w-6 h-6 text-purple-600" /> Your Results
                  </h3>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-white rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">{results?.correct}/{results?.total}</p>
                      <p className="text-xs text-gray-500">Correct</p>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{results?.percentage.toFixed(0)}%</p>
                      <p className="text-xs text-gray-500">Accuracy</p>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <p className="text-2xl font-bold text-indigo-600">{results?.estimatedBand}</p>
                      <p className="text-xs text-gray-500">Est. Band</p>
                    </div>
                  </div>

                  {/* Module-specific Course Recommendation */}
                  <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-sm font-medium text-amber-800 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" /> İlgili Dersi İncele
                    </p>
                    <p className="text-xs text-amber-600 mt-1">
                      <strong>{moduleContent?.module_title?.split(':')[0]}</strong> modülünde benzer belgeler okuyarak becerilerinizi geliştirin.
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-amber-700 border-amber-300"
                        onClick={() => navigate('/advanced-mastery')}
                      >
                        Advanced Mastery → Reading <ChevronRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 italic">
                      💡 Derste &quot;General Training&quot; toggle&apos;ını seçerek profesyonel belge okuma pratiği yapabilirsiniz.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => selectModule(selectedModule)} className="flex-1">
                      <RotateCcw className="w-4 h-4 mr-1" /> Try Again
                    </Button>
                    <Button onClick={() => navigate('/question-bank')} className="flex-1 bg-purple-600">
                      More Practice <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </Card>
              )}

              {/* Vocabulary & Tips */}
              {moduleContent.reading_scenario?.vocabulary_focus && (
                <Card className="p-4 bg-amber-50 border-amber-200">
                  <h4 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> Key Professional Vocabulary
                  </h4>
                  <div className="grid gap-2">
                    {moduleContent.reading_scenario.vocabulary_focus.slice(0, 4).map((v, vi) => (
                      <div key={vi} className="p-2 bg-white rounded border border-amber-100">
                        <p className="font-medium text-amber-700">{v.term}</p>
                        <p className="text-xs text-gray-600">{v.meaning}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Reading Tips */}
              {moduleContent.reading_scenario?.reading_tips && (
                <Card className="p-4 bg-blue-50 border-blue-200">
                  <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4" /> Tips for This Document Type
                  </h4>
                  <ul className="space-y-1">
                    {moduleContent.reading_scenario.reading_tips.slice(0, 3).map((tip, ti) => (
                      <li key={ti} className="text-sm text-gray-700 flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
