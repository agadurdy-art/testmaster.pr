import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  ArrowLeft, Clock, BookOpen, HelpCircle, CheckCircle, 
  ChevronRight, Target, Lightbulb, Award, AlertCircle,
  Play, Pause, RotateCcw, Filter, FileText
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function ReadingPracticeByType({ user }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type');

  const [allModules, setAllModules] = useState([]);
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
  const [selectedType, setSelectedType] = useState(initialType || '');
  const [selectedTrack, setSelectedTrack] = useState('all');

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
      const [academicRes, generalRes, advAcademicRes, advGeneralRes, typesRes, topicsRes] = await Promise.all([
        fetch(`${API_URL}/api/courses/reading/mastery/academic`),
        fetch(`${API_URL}/api/courses/reading/mastery/general`),
        fetch(`${API_URL}/api/courses/reading/academic/advanced`),
        fetch(`${API_URL}/api/courses/reading/general/advanced`),
        fetch(`${API_URL}/api/courses/reading/question-types`),
        fetch(`${API_URL}/api/courses/reading/topics`)
      ]);
      
      const academicData = await academicRes.json();
      const generalData = await generalRes.json();
      const advAcademicData = await advAcademicRes.json();
      const advGeneralData = await advGeneralRes.json();
      const typesData = await typesRes.json();
      const topicsData = await topicsRes.json();
      
      // Combine all modules with level info
      const combinedModules = [
        ...(academicData.modules || []).map(m => ({ ...m, level: 'mastery', track: 'academic' })),
        ...(generalData.modules || []).map(m => ({ ...m, level: 'mastery', track: 'general' })),
        ...(advAcademicData.modules || []).map(m => ({ ...m, level: 'advanced', track: 'academic' })),
        ...(advGeneralData.modules || []).map(m => ({ ...m, level: 'advanced', track: 'general' }))
      ];
      
      setAllModules(combinedModules);
      if (typesData.success) setQuestionTypes(typesData.question_types);
      if (topicsData.success) setTopics(topicsData.topics);
      
      // Auto-select first module matching the type
      if (initialType && combinedModules.length > 0) {
        const matchingModule = combinedModules.find(m => m.question_type === initialType);
        if (matchingModule) {
          selectModule(matchingModule);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load reading modules');
    } finally {
      setLoading(false);
    }
  };

  const selectModule = async (module) => {
    try {
      setLoading(true);
      const baseUrl = module.level === 'mastery' 
        ? `${API_URL}/api/courses/reading/mastery/${module.track}/${module.module_id}`
        : `${API_URL}/api/courses/reading/${module.track}/advanced/${module.module_id}`;
      
      const res = await fetch(baseUrl);
      const data = await res.json();
      if (data.success) {
        setSelectedModule(module);
        // Handle different response structures
        const content = data.module || data;
        setModuleContent(content);
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

  const getQuestions = () => {
    return moduleContent?.questions || moduleContent?.reading_scenario?.questions || [];
  };

  const getPassage = () => {
    return moduleContent?.passage || moduleContent?.reading_scenario?.passage || '';
  };

  const submitAnswers = () => {
    const questions = getQuestions();
    if (!questions.length) return;

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
    const estimatedBand = percentage >= 90 ? 8.0 : percentage >= 80 ? 7.0 : percentage >= 70 ? 6.5 : percentage >= 60 ? 6.0 : 5.5;

    setResults({ correct, total: questions.length, percentage, estimatedBand, questionResults });
    setSubmitted(true);
    setTimerActive(false);
    toast.success('Cevaplar gönderildi!');
  };

  const filteredModules = allModules.filter(m => {
    if (selectedType && m.question_type !== selectedType) return false;
    if (selectedTrack !== 'all' && m.track !== selectedTrack) return false;
    return true;
  });

  const currentTypeName = selectedType ? questionTypes[selectedType]?.name : 'Tüm Tipler';

  if (loading && !moduleContent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Soru tipine göre pratik yükleniyor...</p>
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
                  <HelpCircle className="w-5 h-5 text-amber-600" /> Soru Tipine Göre Pratik
                </h1>
                <p className="text-sm text-gray-500">{currentTypeName} | {filteredModules.length} modül</p>
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
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="mb-6 p-4 bg-white rounded-xl shadow-sm">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-600">Soru Tipi:</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedType === '' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType('')}
                className={selectedType === '' ? 'bg-amber-600' : ''}
              >
                Tümü
              </Button>
              {Object.entries(questionTypes).map(([key, type]) => (
                <Button
                  key={key}
                  variant={selectedType === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedType(key)}
                  className={selectedType === key ? 'bg-amber-600' : ''}
                >
                  {type.code}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-4 items-center mt-3">
            <span className="text-sm font-medium text-gray-600">Track:</span>
            <div className="flex gap-2">
              {['all', 'academic', 'general'].map(track => (
                <Button
                  key={track}
                  variant={selectedTrack === track ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTrack(track)}
                  className={selectedTrack === track ? 'bg-gray-700' : ''}
                >
                  {track === 'all' ? 'Tümü' : track === 'academic' ? 'Academic' : 'General'}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Module List */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-600 mb-3">Pasaj Seçin:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredModules.map((module) => (
              <Card
                key={`${module.level}-${module.track}-${module.module_id}`}
                className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedModule?.module_id === module.module_id && selectedModule?.track === module.track
                    ? 'border-2 border-amber-500 bg-amber-50'
                    : 'border hover:border-amber-300'
                }`}
                onClick={() => selectModule(module)}
              >
                <div className="flex items-start justify-between mb-2">
                  <Badge className={module.track === 'academic' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}>
                    {module.track === 'academic' ? 'Academic' : 'General'}
                  </Badge>
                  <Badge className={module.level === 'advanced' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}>
                    {module.level === 'advanced' ? 'Band 7-9' : 'Band 6-7'}
                  </Badge>
                </div>
                <h3 className="font-medium text-gray-900 text-sm mb-1">
                  {module.title?.substring(0, 40)}...
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{questionTypes[module.question_type]?.code || module.question_type}</span>
                  <span>•</span>
                  <span>{module.question_count || 6} soru</span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {moduleContent && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left: Passage */}
            <Card className="p-0 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white p-4">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge className="bg-white/20">{moduleContent.band_target}</Badge>
                  <Badge className="bg-amber-400/30">
                    {questionTypes[selectedModule?.question_type || moduleContent.question_type]?.name}
                  </Badge>
                </div>
                <h2 className="text-lg font-bold">{moduleContent.title || moduleContent.module_title}</h2>
                <p className="text-sm text-amber-100 mt-1">{moduleContent.text_type}</p>
              </div>
              <div className="p-6 max-h-[600px] overflow-y-auto">
                <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 leading-relaxed">
                  {getPassage()}
                </pre>
              </div>
            </Card>

            {/* Right: Questions */}
            <div className="space-y-4">
              <Card className="p-4 bg-amber-50 border-amber-200">
                <h3 className="font-bold text-amber-800 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" /> 
                  {questionTypes[selectedModule?.question_type || moduleContent.question_type]?.name}
                </h3>
                <p className="text-sm text-amber-600 mt-1">
                  {questionTypes[selectedModule?.question_type || moduleContent.question_type]?.description}
                </p>
              </Card>

              {getQuestions().map((q, idx) => (
                <Card key={idx} className={`p-4 ${submitted ? (results?.questionResults[idx]?.isCorrect ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50') : ''}`}>
                  <p className="font-medium text-gray-900 mb-3">{idx + 1}. {q.question}</p>

                  {q.options ? (
                    <div className="space-y-2 ml-4">
                      {q.options.map((opt, i) => (
                        <label key={i} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:text-amber-600">
                          <input 
                            type="radio" 
                            name={`q_${idx}`} 
                            value={typeof opt === 'string' && opt.includes(')') ? opt.charAt(0) : opt}
                            checked={answers[idx] === (typeof opt === 'string' && opt.includes(')') ? opt.charAt(0) : opt)}
                            onChange={(e) => handleAnswerChange(idx, e.target.value)}
                            disabled={submitted}
                            className="accent-amber-600" 
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  ) : q.type === 'true_false_ng' ? (
                    <div className="flex gap-4 ml-4">
                      {['True', 'False', 'Not Given'].map(opt => (
                        <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer hover:text-amber-600">
                          <input 
                            type="radio" 
                            name={`q_${idx}`} 
                            value={opt}
                            checked={answers[idx] === opt}
                            onChange={(e) => handleAnswerChange(idx, e.target.value)}
                            disabled={submitted}
                            className="accent-amber-600" 
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <input 
                      type="text" 
                      placeholder="Cevabınızı yazın..."
                      value={answers[idx] || ''}
                      onChange={(e) => handleAnswerChange(idx, e.target.value)}
                      disabled={submitted}
                      className="w-full p-3 border rounded-lg text-sm focus:border-amber-500" 
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
                          {results.questionResults[idx].isCorrect ? 'Doğru!' : 'Yanlış'}
                        </span>
                      </div>
                      {!results.questionResults[idx].isCorrect && (
                        <p className="text-sm text-gray-700"><strong>Doğru cevap:</strong> {results.questionResults[idx].correctAnswer}</p>
                      )}
                      {q.explanation && <p className="text-sm text-gray-600 mt-1">{q.explanation}</p>}
                    </div>
                  )}
                </Card>
              ))}

              {!submitted ? (
                <Button 
                  onClick={submitAnswers}
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white py-6"
                  disabled={Object.keys(answers).length === 0}
                >
                  <CheckCircle className="w-5 h-5 mr-2" /> Cevapları Gönder
                </Button>
              ) : (
                <Card className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Award className="w-6 h-6 text-amber-600" /> Sonuçlarınız
                  </h3>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-white rounded-lg">
                      <p className="text-2xl font-bold text-amber-600">{results?.correct}/{results?.total}</p>
                      <p className="text-xs text-gray-500">Doğru</p>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{results?.percentage.toFixed(0)}%</p>
                      <p className="text-xs text-gray-500">Başarı</p>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <p className="text-2xl font-bold text-indigo-600">{results?.estimatedBand}</p>
                      <p className="text-xs text-gray-500">Tahmini Band</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => selectModule(selectedModule)} className="flex-1">
                      <RotateCcw className="w-4 h-4 mr-1" /> Tekrar Dene
                    </Button>
                    <Button onClick={() => navigate('/question-bank')} className="flex-1 bg-amber-600">
                      Daha Fazla Pratik <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
