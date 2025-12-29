import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  ArrowLeft, Clock, Headphones, HelpCircle, CheckCircle, 
  ChevronRight, Target, Lightbulb, Award, AlertCircle,
  Play, Pause, RotateCcw, Volume2, VolumeX, FileText,
  ChevronDown, ChevronUp, SkipBack, SkipForward
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function ListeningPractice({ user }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialBand = searchParams.get('band');
  const initialTopic = searchParams.get('topic');
  const initialSetId = searchParams.get('set');

  // State
  const [modules, setModules] = useState([]);
  const [topics, setTopics] = useState([]);
  const [bandLevels, setBandLevels] = useState([]);
  const [questionTypes, setQuestionTypes] = useState({});
  const [selectedModule, setSelectedModule] = useState(null);
  const [moduleContent, setModuleContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60 * 30); // 30 minutes
  const [timerActive, setTimerActive] = useState(false);
  const [filterBand, setFilterBand] = useState(initialBand || '');
  const [filterTopic, setFilterTopic] = useState(initialTopic || '');
  
  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const audioRef = useRef(null);

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
      const [modulesRes, bandsRes, topicsRes, typesRes] = await Promise.all([
        fetch(`${API_URL}/api/listening/modules${initialBand ? `?band=${initialBand}` : ''}`),
        fetch(`${API_URL}/api/listening/band-levels`),
        fetch(`${API_URL}/api/listening/topics`),
        fetch(`${API_URL}/api/listening/question-types`)
      ]);
      
      const [modulesData, bandsData, topicsData, typesData] = await Promise.all([
        modulesRes.json(),
        bandsRes.json(),
        topicsRes.json(),
        typesRes.json()
      ]);
      
      if (modulesData.success) setModules(modulesData.modules);
      if (bandsData.success) setBandLevels(bandsData.band_levels);
      if (topicsData.success) setTopics(topicsData.topics);
      if (typesData.success) setQuestionTypes(typesData.question_types);
      
      // Auto-select first module or specific set
      if (initialSetId) {
        selectModule(initialSetId);
      } else if (modulesData.modules?.length > 0) {
        selectModule(modulesData.modules[0].set_id);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load listening modules');
    } finally {
      setLoading(false);
    }
  };

  const selectModule = async (setId) => {
    try {
      setLoading(true);
      setAudioError(false);
      
      // First load WITHOUT audio for fast response
      const res = await fetch(`${API_URL}/api/listening/set/${setId}?include_audio=false`);
      const data = await res.json();
      
      if (data.success) {
        setSelectedModule(setId);
        setModuleContent(data.set);
        setAnswers({});
        setSubmitted(false);
        setResults(null);
        setTimeLeft(60 * 30);
        setTimerActive(false);
        setShowTranscript(false);
        setIsPlaying(false);
        setAudioProgress(0);
        setLoading(false);
        
        // Then load audio asynchronously in background
        setLoadingAudio(true);
        try {
          const audioRes = await fetch(`${API_URL}/api/listening/set/${setId}?include_audio=true`);
          const audioData = await audioRes.json();
          if (audioData.success && audioData.set.audio_url) {
            setModuleContent(prev => ({
              ...prev,
              audio_url: audioData.set.audio_url,
              has_audio: true
            }));
          } else {
            setAudioError(true);
          }
        } catch {
          setAudioError(true);
        } finally {
          setLoadingAudio(false);
        }
      }
    } catch (error) {
      console.error('Error loading module:', error);
      toast.error('Failed to load listening set');
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleMatchingChange = (questionId, item, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] || {}),
        [item]: value
      }
    }));
  };

  // Audio controls
  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      setAudioProgress(audioRef.current.currentTime);
      setAudioDuration(audioRef.current.duration || moduleContent?.duration_seconds || 180);
    }
  };

  const handleSeek = (e) => {
    const seekTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
      setAudioProgress(seekTime);
    }
  };

  const skipTime = (seconds) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(
        audioRef.current.currentTime + seconds,
        audioRef.current.duration
      ));
    }
  };

  const submitAnswers = async () => {
    if (!moduleContent?.questions) return;

    try {
      const responses = Object.entries(answers).map(([questionId, answer]) => ({
        question_id: questionId,
        answer: answer
      }));

      const res = await fetch(`${API_URL}/api/listening/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          set_id: selectedModule,
          responses: responses,
          band_range: filterBand || moduleContent.band_range
        })
      });

      const data = await res.json();
      
      if (data.success) {
        setResults(data);
        setSubmitted(true);
        setTimerActive(false);
        toast.success('Answers submitted!');
      } else {
        toast.error('Failed to evaluate answers');
      }
    } catch (error) {
      console.error('Error submitting:', error);
      toast.error('Could not evaluate. Try again.');
    }
  };

  // Filter modules
  const filteredModules = modules.filter(m => {
    if (filterBand && m.band_range !== filterBand) return false;
    if (filterTopic && m.topic !== filterTopic) return false;
    return true;
  });

  if (loading && !moduleContent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Listening Practice...</p>
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
                  <Headphones className="w-5 h-5 text-purple-600" /> Listening Practice
                </h1>
                <p className="text-sm text-gray-500">IELTS Listening Question Bank</p>
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
              {moduleContent && (
                <Badge className="bg-purple-600 text-white">{moduleContent.part?.toUpperCase()}</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Filter:</span>
          </div>
          <select 
            className="px-3 py-2 border rounded-lg text-sm"
            value={filterBand}
            onChange={(e) => setFilterBand(e.target.value)}
          >
            <option value="">All Bands</option>
            {bandLevels.map(band => (
              <option key={band.id} value={band.id}>{band.name}</option>
            ))}
          </select>
          <select 
            className="px-3 py-2 border rounded-lg text-sm"
            value={filterTopic}
            onChange={(e) => setFilterTopic(e.target.value)}
          >
            <option value="">All Topics</option>
            {topics.map(topic => (
              <option key={topic.id} value={topic.id}>{topic.icon} {topic.name}</option>
            ))}
          </select>
        </div>

        {/* Module Selector */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-600 mb-3">Select Practice Set ({filteredModules.length} available):</p>
          <div className="flex gap-2 flex-wrap">
            {filteredModules.map((module) => (
              <Button
                key={module.set_id}
                variant={selectedModule === module.set_id ? 'default' : 'outline'}
                size="sm"
                onClick={() => selectModule(module.set_id)}
                className={selectedModule === module.set_id ? 'bg-purple-600' : ''}
              >
                <span className="mr-1">{topics.find(t => t.id === module.topic)?.icon || '📝'}</span>
                {module.title.length > 20 ? module.title.substring(0, 20) + '...' : module.title}
              </Button>
            ))}
          </div>
        </div>

        {moduleContent && (
          <div className="space-y-6">
            {/* Audio Player Card */}
            <Card className="p-0 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge className="bg-white/20">{moduleContent.band_range}</Badge>
                  <Badge className="bg-purple-400/30">{moduleContent.part?.replace('part', 'Part ')}</Badge>
                  {moduleContent.question_types?.map(qt => (
                    <Badge key={qt} className="bg-indigo-400/30">
                      {questionTypes[qt]?.code || qt}
                    </Badge>
                  ))}
                </div>
                <h2 className="text-lg font-bold">{moduleContent.title}</h2>
                <p className="text-sm text-purple-100 mt-1">
                  {moduleContent.speakers?.length || 1} speaker(s) • {formatTime(moduleContent.duration_seconds || 180)}
                </p>
              </div>
              
              {/* Audio Controls */}
              <div className="p-4 bg-gray-50">
                {loadingAudio ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span className="text-gray-600">Generating audio...</span>
                  </div>
                ) : audioError || !moduleContent.audio_url ? (
                  <div className="text-center py-4">
                    <VolumeX className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Audio not available. Use transcript below.</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => setShowTranscript(true)}
                    >
                      <FileText className="w-4 h-4 mr-1" /> Show Transcript
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Hidden audio element */}
                    <audio
                      ref={audioRef}
                      src={moduleContent.audio_url}
                      onTimeUpdate={handleAudioTimeUpdate}
                      onEnded={() => setIsPlaying(false)}
                      onError={() => setAudioError(true)}
                    />
                    
                    {/* Play controls */}
                    <div className="flex items-center justify-center gap-4">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => skipTime(-10)}
                      >
                        <SkipBack className="w-5 h-5" />
                      </Button>
                      <Button 
                        className="w-14 h-14 rounded-full bg-purple-600 hover:bg-purple-700"
                        onClick={togglePlayPause}
                      >
                        {isPlaying ? (
                          <Pause className="w-6 h-6 text-white" />
                        ) : (
                          <Play className="w-6 h-6 text-white ml-1" />
                        )}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => skipTime(10)}
                      >
                        <SkipForward className="w-5 h-5" />
                      </Button>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-12">{formatTime(Math.floor(audioProgress))}</span>
                      <input
                        type="range"
                        min="0"
                        max={audioDuration || moduleContent.duration_seconds || 180}
                        value={audioProgress}
                        onChange={handleSeek}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                      />
                      <span className="text-xs text-gray-500 w-12">{formatTime(Math.floor(audioDuration || moduleContent.duration_seconds || 180))}</span>
                    </div>
                    
                    {/* Transcript toggle - only show after submit or for lower bands */}
                    {(submitted || filterBand === '4.0-5.0') && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full"
                        onClick={() => setShowTranscript(!showTranscript)}
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        {showTranscript ? 'Hide' : 'Show'} Transcript
                        {showTranscript ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
                      </Button>
                    )}
                  </div>
                )}
              </div>
              
              {/* Transcript (collapsible) */}
              {showTranscript && moduleContent.transcript && (
                <div className="p-4 border-t bg-white max-h-64 overflow-y-auto">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 leading-relaxed">
                    {moduleContent.transcript}
                  </pre>
                </div>
              )}
            </Card>

            {/* Questions */}
            <div className="space-y-4">
              <Card className="p-4 bg-purple-50 border-purple-200">
                <h3 className="font-bold text-purple-800 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" /> Questions ({moduleContent.questions?.length})
                </h3>
                <p className="text-sm text-purple-600 mt-1">
                  Answer all questions based on the audio recording.
                </p>
              </Card>

              {moduleContent.questions?.map((q, idx) => (
                <Card 
                  key={q.id} 
                  className={`p-4 ${
                    submitted 
                      ? (results?.detailed_results?.find(r => r.question_id === q.id)?.is_correct 
                          ? 'border-green-300 bg-green-50' 
                          : 'border-red-300 bg-red-50')
                      : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <p className="font-medium text-gray-900">{idx + 1}. {q.question}</p>
                    <Badge className="bg-purple-100 text-purple-700 text-xs">
                      {questionTypes[q.type]?.code || q.type}
                    </Badge>
                  </div>

                  {/* Multiple Choice */}
                  {q.options && q.type !== 'matching' && (
                    <div className="space-y-2 ml-4">
                      {q.options.map((opt, i) => (
                        <label key={i} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:text-purple-600">
                          <input 
                            type="radio" 
                            name={`q_${q.id}`} 
                            value={opt.charAt(0)}
                            checked={answers[q.id] === opt.charAt(0)}
                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                            disabled={submitted}
                            className="accent-purple-600" 
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Matching */}
                  {q.type === 'matching' && q.items && (
                    <div className="space-y-2 ml-4">
                      {q.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-sm text-gray-700 w-32">{item}</span>
                          <select
                            className="px-3 py-2 border rounded-lg text-sm flex-1"
                            value={answers[q.id]?.[item] || ''}
                            onChange={(e) => handleMatchingChange(q.id, item, e.target.value)}
                            disabled={submitted}
                          >
                            <option value="">Select...</option>
                            {q.match_options?.map((opt, oi) => (
                              <option key={oi} value={opt.charAt(0)}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Form/Sentence Completion */}
                  {(q.type === 'form_completion' || q.type === 'sentence_completion' || q.type === 'short_answer') && !q.options && (
                    <input 
                      type="text" 
                      placeholder="Type your answer..."
                      value={answers[q.id] || ''}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      disabled={submitted}
                      className="w-full p-3 border rounded-lg text-sm focus:border-purple-500 ml-4" 
                    />
                  )}

                  {/* Show result after submit */}
                  {submitted && results?.detailed_results && (
                    <div className={`mt-3 p-3 rounded-lg ${
                      results.detailed_results.find(r => r.question_id === q.id)?.is_correct 
                        ? 'bg-green-100' 
                        : 'bg-red-100'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        {results.detailed_results.find(r => r.question_id === q.id)?.is_correct ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-600" />
                        )}
                        <span className={`font-medium text-sm ${
                          results.detailed_results.find(r => r.question_id === q.id)?.is_correct 
                            ? 'text-green-700' 
                            : 'text-red-700'
                        }`}>
                          {results.detailed_results.find(r => r.question_id === q.id)?.is_correct ? 'Correct!' : 'Incorrect'}
                        </span>
                      </div>
                      {!results.detailed_results.find(r => r.question_id === q.id)?.is_correct && (
                        <p className="text-sm text-gray-700">
                          <strong>Correct answer:</strong> {results.detailed_results.find(r => r.question_id === q.id)?.correct_answer}
                        </p>
                      )}
                      {results.mistakes?.find(m => m.question_id === q.id)?.explanation && (
                        <p className="text-sm text-gray-600 mt-1 italic">
                          {results.mistakes.find(m => m.question_id === q.id).explanation}
                        </p>
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
              ) : results && (
                <Card className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Award className="w-6 h-6 text-purple-600" /> Your Results
                  </h3>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-white rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">{results.score?.correct}/{results.score?.total}</p>
                      <p className="text-xs text-gray-500">Correct</p>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{results.score?.percentage}%</p>
                      <p className="text-xs text-gray-500">Accuracy</p>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <p className="text-2xl font-bold text-indigo-600">{results.estimated_band}</p>
                      <p className="text-xs text-gray-500">Est. Band</p>
                    </div>
                  </div>

                  {/* Feedback */}
                  <div className="mb-4 p-3 bg-white rounded-lg border">
                    <p className="text-sm text-gray-700">{results.feedback}</p>
                  </div>

                  {/* Weak Skills */}
                  {results.weak_skills?.length > 0 && (
                    <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-sm font-medium text-amber-800 flex items-center gap-2">
                        <Target className="w-4 h-4" /> Areas to Improve
                      </p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {results.weak_skills.map((skill, i) => (
                          <Badge key={i} className="bg-amber-100 text-amber-700">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Course Recommendations */}
                  {results.recommended_lessons?.length > 0 && (
                    <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm font-medium text-green-800 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" /> Recommended Lessons
                      </p>
                      <div className="space-y-2 mt-2">
                        {results.recommended_lessons.slice(0, 3).map((lesson, i) => (
                          <div key={i} className="flex items-center justify-between bg-white p-2 rounded border">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{lesson.title}</p>
                              <p className="text-xs text-gray-500">{lesson.stage} • {lesson.band_level}</p>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(lesson.url || '/mastery-course')}
                            >
                              Go to Lesson <ChevronRight className="w-3 h-3 ml-1" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

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

              {/* Tips */}
              {moduleContent.tips?.length > 0 && (
                <Card className="p-4 bg-blue-50 border-blue-200">
                  <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" /> Listening Tips
                  </h4>
                  <ul className="space-y-1">
                    {moduleContent.tips.map((tip, ti) => (
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
