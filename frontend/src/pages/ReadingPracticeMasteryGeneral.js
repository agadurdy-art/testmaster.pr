import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  ArrowLeft, Clock, FileText, HelpCircle, CheckCircle, 
  ChevronRight, Target, Lightbulb, Award, AlertCircle,
  Play, Pause, RotateCcw, Filter
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function ReadingPracticeMasteryGeneral({ user }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTopic = searchParams.get('topic');

  const [modules, setModules] = useState([]);
  const [questionTypes, setQuestionTypes] = useState({});
  const [topics, setTopics] = useState({});
  const [selectedModule, setSelectedModule] = useState(null);
  const [moduleContent, setModuleContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60 * 20);
  const [timerActive, setTimerActive] = useState(false);
  const [filterTopic, setFilterTopic] = useState(initialTopic || '');
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let interval;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const loadData = async () => {
    try {
      const [modulesRes, typesRes, topicsRes] = await Promise.all([
        fetch(`${API_URL}/api/courses/reading/mastery/general`),
        fetch(`${API_URL}/api/courses/reading/question-types`),
        fetch(`${API_URL}/api/courses/reading/topics`)
      ]);
      
      const modulesData = await modulesRes.json();
      const typesData = await typesRes.json();
      const topicsData = await topicsRes.json();
      
      if (modulesData.success) setModules(modulesData.modules);
      if (typesData.success) setQuestionTypes(typesData.question_types);
      if (topicsData.success) setTopics(topicsData.topics);
      
      if (modulesData.modules?.length > 0) {
        selectModule(modulesData.modules[0].module_id);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load reading modules');
    } finally {
      setLoading(false);
    }
  };

  const selectModule = async (moduleId) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/courses/reading/mastery/general/${moduleId}`);
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

  const submitAnswers = () => {
    if (!moduleContent?.questions) return;

    const questions = moduleContent.questions;
    let correct = 0;
    const questionResults = questions.map((q, idx) => {
      const userAnswer = answers[idx]?.toString().toLowerCase().trim();
      const correctAnswer = q.answer?.toString().toLowerCase().trim();
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
    const estimatedBand = percentage >= 90 ? 7.0 : percentage >= 75 ? 6.5 : percentage >= 60 ? 6.0 : 5.5;

    setResults({ correct, total: questions.length, percentage, estimatedBand, questionResults });
    setSubmitted(true);
    setTimerActive(false);
    toast.success('Answers submitted!');
  };

  const filteredModules = modules.filter(m => {
    if (filterTopic && m.topic !== filterTopic) return false;
    if (filterType && m.question_type !== filterType) return false;
    return true;
  });

  if (loading && !moduleContent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Mastery General Training...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/question-bank')}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Question Bank
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" /> Mastery General Training
                </h1>
                <p className="text-sm text-gray-500">Band 6.0-7.0 | Professional Documents</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${timeLeft < 300 ? 'bg-red-100 text-red-700' : 'bg-gray-100'}`}>
                <Clock className="w-4 h-4" />
                <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
                <Button size="sm" variant="ghost" onClick={() => setTimerActive(!timerActive)}>
                  {timerActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
              </div>
              <Badge className="bg-purple-600 text-white">GENERAL</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Filter:</span>
          </div>
          <select 
            className="px-3 py-2 border rounded-lg text-sm"
            value={filterTopic}
            onChange={(e) => setFilterTopic(e.target.value)}
          >
            <option value="">All Topics</option>
            {Object.entries(topics).map(([key, topic]) => (
              <option key={key} value={key}>{topic.icon} {topic.name}</option>
            ))}
          </select>
          <select 
            className="px-3 py-2 border rounded-lg text-sm"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">All Question Types</option>
            {Object.entries(questionTypes).map(([key, type]) => (
              <option key={key} value={key}>{type.name}</option>
            ))}
          </select>
        </div>

        {/* Module Selector */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-600 mb-3">Select Document Type ({filteredModules.length} modules):</p>
          <div className="flex gap-2 flex-wrap">
            {filteredModules.map((module) => (
              <Button
                key={module.module_id}
                variant={selectedModule === module.module_id ? 'default' : 'outline'}
                size="sm"
                onClick={() => selectModule(module.module_id)}
                className={selectedModule === module.module_id ? 'bg-purple-600' : ''}
              >
                <span className="mr-1">{topics[module.topic]?.icon}</span>
                {questionTypes[module.question_type]?.code || module.question_type}
              </Button>
            ))}
          </div>
        </div>

        {moduleContent && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left: Document */}
            <Card className="p-0 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge className="bg-white/20">{moduleContent.band_target}</Badge>
                  <Badge className="bg-purple-400/30">{moduleContent.text_type}</Badge>
                </div>
                <h2 className="text-lg font-bold">{moduleContent.title}</h2>
                {moduleContent.context && (
                  <p className="text-sm text-purple-100 mt-1 italic">{moduleContent.context}</p>
                )}
              </div>
              <div className="p-6 max-h-[600px] overflow-y-auto bg-gray-50">
                <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 leading-relaxed">
                  {moduleContent.passage}
                </pre>
              </div>
            </Card>

            {/* Right: Questions */}
            <div className="space-y-4">
              <Card className="p-4 bg-purple-50 border-purple-200">
                <h3 className="font-bold text-purple-800 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" /> {questionTypes[moduleContent.question_type]?.name}
                </h3>
                <p className="text-sm text-purple-600 mt-1">
                  {questionTypes[moduleContent.question_type]?.description}
                </p>
              </Card>

              {moduleContent.questions?.map((q, idx) => (
                <Card key={idx} className={`p-4 ${submitted ? (results?.questionResults[idx]?.isCorrect ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50') : ''}`}>
                  <div className="flex items-start justify-between mb-3">
                    <p className="font-medium text-gray-900">{idx + 1}. {q.question}</p>
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
                            value={opt.charAt(0)}
                            checked={answers[idx] === opt.charAt(0)}
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
                  ) : q.type === 'matching_information' ? (
                    <select 
                      className="w-full p-3 border rounded-lg text-sm"
                      value={answers[idx] || ''}
                      onChange={(e) => handleAnswerChange(idx, e.target.value)}
                      disabled={submitted}
                    >
                      <option value="">Select position...</option>
                      <option value="A">Position A</option>
                      <option value="B">Position B</option>
                      <option value="C">Position C</option>
                      <option value="D">Position D</option>
                      <option value="E">Position E</option>
                    </select>
                  ) : (
                    <input 
                      type="text" 
                      placeholder="Type your answer..."
                      value={answers[idx] || ''}
                      onChange={(e) => handleAnswerChange(idx, e.target.value)}
                      disabled={submitted}
                      className="w-full p-3 border rounded-lg text-sm focus:border-purple-500" 
                    />
                  )}

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
                        <p className="text-sm text-gray-700"><strong>Correct answer:</strong> {results.questionResults[idx].correctAnswer}</p>
                      )}
                      {q.explanation && <p className="text-sm text-gray-600 mt-1">{q.explanation}</p>}
                    </div>
                  )}
                </Card>
              ))}

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
                      <p className="text-2xl font-bold text-blue-600">{results?.percentage.toFixed(0)}%</p>
                      <p className="text-xs text-gray-500">Accuracy</p>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <p className="text-2xl font-bold text-indigo-600">{results?.estimatedBand}</p>
                      <p className="text-xs text-gray-500">Est. Band</p>
                    </div>
                  </div>

                  {/* Course Recommendation */}
                  <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-sm font-medium text-amber-800 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" /> Improve Your Skills
                    </p>
                    <p className="text-xs text-amber-600 mt-1">
                      Practice similar reading passages in our <strong>Mastery Course</strong> for targeted skill development.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 text-amber-700 border-amber-300"
                      onClick={() => navigate('/mastery-course')}
                    >
                      Go to Mastery Course <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
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

              {moduleContent.vocabulary_focus && (
                <Card className="p-4 bg-amber-50 border-amber-200">
                  <h4 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" /> Professional Terms
                  </h4>
                  <div className="grid gap-2">
                    {moduleContent.vocabulary_focus.map((v, vi) => (
                      <div key={vi} className="p-2 bg-white rounded border border-amber-100">
                        <p className="font-medium text-amber-700">{v.term}</p>
                        <p className="text-xs text-gray-600">{v.meaning}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {moduleContent.reading_tips && (
                <Card className="p-4 bg-blue-50 border-blue-200">
                  <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4" /> Document Reading Tips
                  </h4>
                  <ul className="space-y-1">
                    {moduleContent.reading_tips.map((tip, ti) => (
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
