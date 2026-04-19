import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  ArrowLeft, Clock, Mic, Play, Square, 
  CheckCircle, ChevronRight, Target, Lightbulb, Award,
  Volume2, Eye, EyeOff, SkipForward, RotateCcw,
  User, MessageSquare, FileText, Loader2
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const STATES = {
  IDLE: 'IDLE',
  PROMPT_PLAYING: 'PROMPT_PLAYING',
  RECORDING: 'RECORDING',
  PROCESSING: 'PROCESSING',
  READY_NEXT: 'READY_NEXT',
  COMPLETED: 'COMPLETED'
};

export default function SpeakingPracticeQB({ user }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTrack = searchParams.get('track') || 'academic';
  const initialBand = searchParams.get('band');
  const initialSetId = searchParams.get('set');
  const mode = searchParams.get('mode') || 'test';

  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [moduleContent, setModuleContent] = useState(null);
  const [currentPart, setCurrentPart] = useState(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [recordingState, setRecordingState] = useState(STATES.IDLE);
  const [answers, setAnswers] = useState([]);
  const [results, setResults] = useState(null);
  const [showText, setShowText] = useState(false);
  const [showTierModal, setShowTierModal] = useState(false);
  
  const [timeLeft, setTimeLeft] = useState(0);
  const [prepTime, setPrepTime] = useState(60);
  const [speakingTime, setSpeakingTime] = useState(0);
  const [isPrepPhase, setIsPrepPhase] = useState(false);
  
  const [filterTrack, setFilterTrack] = useState(initialTrack);
  const [filterBand, setFilterBand] = useState(initialBand || '');
  const [userCredits, setUserCredits] = useState(0);
  
  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioBlobsRef = useRef({}); // Store audio blobs for premium evaluation
  
  // Fetch user credits on mount
  useEffect(() => {
    const fetchUserCredits = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch(`${API_URL}/api/users/${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setUserCredits(data.examCredits || 0);
        }
      } catch (error) {
        console.error('Error fetching user credits:', error);
      }
    };
    fetchUserCredits();
  }, [user?.id]);
  
  useEffect(() => {
    loadModules();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [filterTrack, filterBand]);

  const loadModules = async () => {
    try {
      let url = `${API_URL}/api/speaking/modules?track=${filterTrack}`;
      if (filterBand) url += `&band=${filterBand}`;
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.success) {
        setModules(data.modules);
        if (initialSetId) {
          selectModule(initialSetId);
        }
      }
    } catch (error) {
      console.error('Error loading modules:', error);
      toast.error('Failed to load speaking modules');
    } finally {
      setLoading(false);
    }
  };

  const selectModule = async (setId) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/speaking/set/${setId}?include_audio=true&mode=${mode}`);
      const data = await res.json();
      
      if (data.success) {
        setSelectedModule(setId);
        setModuleContent(data.set);
        setCurrentPart(1);
        setCurrentQuestionIndex(0);
        setRecordingState(STATES.IDLE);
        setAnswers([]);
        setResults(null);
        audioBlobsRef.current = {}; // Clear stored audio blobs
        setShowText(data.set.show_text || mode === 'practice');
        setTimeLeft(data.set.part1?.answer_time_max || 25);
      }
    } catch (error) {
      console.error('Error loading module:', error);
      toast.error('Failed to load speaking set');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentQuestion = useCallback(() => {
    if (!moduleContent) return null;
    if (currentPart === 1) return moduleContent.part1?.questions?.[currentQuestionIndex];
    if (currentPart === 2) return { id: 'part2', cue_card: moduleContent.part2?.cue_card };
    if (currentPart === 3) return moduleContent.part3?.questions?.[currentQuestionIndex];
    return null;
  }, [moduleContent, currentPart, currentQuestionIndex]);

  const playQuestionAudio = useCallback(async () => {
    const question = getCurrentQuestion();
    if (!question) return;
    
    setRecordingState(STATES.PROMPT_PLAYING);
    
    let audioUrl = null;
    if (currentPart === 1) audioUrl = question.audio_url;
    else if (currentPart === 2) audioUrl = moduleContent.part2?.audio_url;
    else if (currentPart === 3) audioUrl = question.audio_url;
    
    if (audioUrl && audioRef.current) {
      const fullUrl = audioUrl.startsWith('/api') ? `${API_URL}${audioUrl}` : audioUrl;
      audioRef.current.src = fullUrl;
      audioRef.current.play();
    } else {
      setTimeout(() => {
        if (currentPart === 2) startPrepPhase();
        else startRecording();
      }, 500);
    }
  }, [getCurrentQuestion, currentPart, moduleContent]);

  const handleAudioEnded = () => {
    if (currentPart === 2) startPrepPhase();
    else setTimeout(() => startRecording(), 500);
  };

  const startPrepPhase = () => {
    setIsPrepPhase(true);
    setPrepTime(60);
    setRecordingState(STATES.IDLE);
    
    timerRef.current = setInterval(() => {
      setPrepTime(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setIsPrepPhase(false);
          startRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      
      mediaRecorder.onstop = () => stream.getTracks().forEach(track => track.stop());
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setRecordingState(STATES.RECORDING);
      
      const maxTime = currentPart === 2 ? 120 : (currentPart === 3 ? 75 : 25);
      setTimeLeft(maxTime);
      setSpeakingTime(0);
      
      timerRef.current = setInterval(() => {
        setSpeakingTime(prev => prev + 1);
        setTimeLeft(prev => {
          if (prev <= 1) { stopRecording(); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Could not access microphone');
      setRecordingState(STATES.IDLE);
    }
  };

  const stopRecording = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      setRecordingState(STATES.PROCESSING);
      mediaRecorderRef.current.stop();
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const question = getCurrentQuestion();
      const questionId = question?.id || `part${currentPart}`;
      const transcript = await transcribeAudio(audioBlob, questionId, String(currentPart));
      
      // Store audio blob for premium evaluation
      audioBlobsRef.current[questionId] = audioBlob;
      
      const answer = {
        part: String(currentPart),
        question_id: questionId,
        question: currentPart === 2 ? moduleContent.part2?.cue_card?.topic : question?.text,
        transcript: transcript || '[No speech detected]',
        duration: speakingTime
      };
      
      setAnswers(prev => [...prev, answer]);
      audioChunksRef.current = [];
      mediaRecorderRef.current = null;
      setRecordingState(STATES.READY_NEXT);
    }
  }, [getCurrentQuestion, currentPart, moduleContent, speakingTime]);

  const transcribeAudio = async (blob, questionId, part) => {
    try {
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');
      formData.append('question_id', questionId);
      formData.append('part', part);
      
      const res = await fetch(`${API_URL}/api/speaking/transcribe`, { method: 'POST', body: formData });
      const data = await res.json();
      return data.success ? data.transcript : null;
    } catch (error) {
      console.error('Transcription error:', error);
      return null;
    }
  };

  const moveToNext = () => {
    if (currentPart === 1) {
      if (currentQuestionIndex < (moduleContent.part1?.questions?.length || 0) - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setRecordingState(STATES.IDLE);
      } else {
        setCurrentPart(2);
        setCurrentQuestionIndex(0);
        setRecordingState(STATES.IDLE);
      }
    } else if (currentPart === 2) {
      setCurrentPart(3);
      setCurrentQuestionIndex(0);
      setRecordingState(STATES.IDLE);
    } else if (currentPart === 3) {
      if (currentQuestionIndex < (moduleContent.part3?.questions?.length || 0) - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setRecordingState(STATES.IDLE);
      } else {
        setRecordingState(STATES.COMPLETED);
        // Show tier selection modal instead of auto-submit
        setShowTierModal(true);
      }
    }
  };

  // Convert blob to base64
  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result.split(',')[1]; // Remove data:audio/webm;base64, prefix
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const submitTest = async (tier = 'free') => {
    try {
      setLoading(true);
      setShowTierModal(false);
      
      // Prepare answers with audio data for premium tier
      let preparedAnswers = [...answers];
      
      if (tier === 'premium') {
        // Add audio_data (base64) for each answer if available
        toast.info('Preparing audio for Azure analysis...');
        preparedAnswers = await Promise.all(answers.map(async (answer) => {
          const audioBlob = audioBlobsRef.current[answer.question_id];
          if (audioBlob) {
            const audioBase64 = await blobToBase64(audioBlob);
            return {
              ...answer,
              audio_data: audioBase64
            };
          }
          return answer;
        }));
      }
      
      const res = await fetch(`${API_URL}/api/speaking/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          set_id: selectedModule,
          track: filterTrack,
          band_range: filterBand || moduleContent?.band_range,
          answers: preparedAnswers,
          evaluation_tier: tier,
          user_id: user?.id
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setResults(data);
        // Clear stored audio blobs after submission
        audioBlobsRef.current = {};
        
        // Update user credits if premium
        if (tier === 'premium' && data.remaining_credits !== undefined) {
          setUserCredits(data.remaining_credits);
        }
        
        toast.success(tier === 'premium' ? '⭐ Premium evaluation complete!' : '✅ Basic evaluation complete!');
      } else {
        if (data.error === 'Insufficient credits for premium evaluation') {
          toast.error(`Need ${data.credits_needed} credit. You have ${data.current_credits}.`);
        } else {
          toast.error(data.error || 'Evaluation failed');
        }
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Could not submit test');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    let total = 0, current = 0;
    if (moduleContent) {
      const p1 = moduleContent.part1?.questions?.length || 0;
      const p3 = moduleContent.part3?.questions?.length || 0;
      total = p1 + 1 + p3;
      if (currentPart === 1) current = currentQuestionIndex;
      else if (currentPart === 2) current = p1;
      else if (currentPart === 3) current = p1 + 1 + currentQuestionIndex;
    }
    return { current: current + 1, total };
  };

  if (loading && !moduleContent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading Speaking Practice...</p>
        </div>
      </div>
    );
  }

  const question = getCurrentQuestion();
  const progress = getProgress();

  return (
    <div className="min-h-screen bg-gray-50">
      <audio ref={audioRef} onEnded={handleAudioEnded} />
      
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/question-bank')}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <div>
                <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Mic className="w-5 h-5 text-indigo-600" /> 
                  {filterTrack === 'academic' ? 'Academic' : 'General'} Speaking
                </h1>
                <p className="text-sm text-gray-500">{mode === 'practice' ? 'Practice' : 'Test'} • {moduleContent?.band_range}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">{progress.current}/{progress.total}</span>
              <Badge className={`${currentPart === 1 ? 'bg-green-600' : currentPart === 2 ? 'bg-blue-600' : 'bg-purple-600'} text-white`}>
                Part {currentPart}
              </Badge>
              {!moduleContent?.show_text && (
                <Button variant="ghost" size="sm" onClick={() => setShowText(!showText)}>
                  {showText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {!moduleContent && (
          <div className="space-y-6">
            <div className="flex gap-3 flex-wrap">
              <select className="px-3 py-2 border rounded-lg text-sm" value={filterTrack} onChange={(e) => setFilterTrack(e.target.value)}>
                <option value="academic">Academic</option>
                <option value="general">General Training</option>
              </select>
              <select className="px-3 py-2 border rounded-lg text-sm" value={filterBand} onChange={(e) => setFilterBand(e.target.value)}>
                <option value="">All Bands</option>
                <option value="4.0-5.0">Band 4.0-5.0</option>
                <option value="5.5-6.5">Band 5.5-6.5</option>
                <option value="7.0-9.0">Band 7.0-9.0</option>
              </select>
            </div>
            <div className="grid gap-3">
              {modules.map(m => (
                <Card key={m.set_id} className="p-4 cursor-pointer hover:shadow-md" onClick={() => selectModule(m.set_id)}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{m.title}</h3>
                      <p className="text-sm text-gray-500">{m.topic} • {m.band_range}</p>
                    </div>
                    <Badge className={m.audio_cached === m.total_questions ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                      {m.audio_cached === m.total_questions ? 'Ready' : 'Loading...'}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {moduleContent && !results && (
          <div className="space-y-6">
            <Card className={`p-4 ${recordingState === STATES.RECORDING ? 'bg-red-50 border-red-200' : isPrepPhase ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {recordingState === STATES.RECORDING && <><div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" /><span className="text-red-700 font-medium">Recording</span></>}
                  {isPrepPhase && <><Clock className="w-5 h-5 text-yellow-600" /><span className="text-yellow-700 font-medium">Preparation</span></>}
                  {recordingState === STATES.PROMPT_PLAYING && <><Volume2 className="w-5 h-5 text-blue-600 animate-pulse" /><span className="text-blue-700 font-medium">Listening...</span></>}
                  {recordingState === STATES.PROCESSING && <><Loader2 className="w-5 h-5 text-indigo-600 animate-spin" /><span className="text-indigo-700 font-medium">Processing...</span></>}
                </div>
                <div className={`text-2xl font-mono font-bold ${timeLeft < 10 && recordingState === STATES.RECORDING ? 'text-red-600' : ''}`}>
                  {isPrepPhase ? formatTime(prepTime) : formatTime(timeLeft)}
                </div>
              </div>
            </Card>

            <Card className="p-6">
              {currentPart === 2 ? (
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" /> Cue Card
                  </h2>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="font-semibold text-blue-900 mb-3">{moduleContent.part2?.cue_card?.topic}</p>
                    <p className="text-sm text-blue-700 mb-2">You should say:</p>
                    <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                      {moduleContent.part2?.cue_card?.bullets?.map((b, i) => <li key={i}>{b}</li>)}
                    </ul>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-indigo-600" /> Question {currentQuestionIndex + 1}
                  </h2>
                  {(showText || moduleContent.show_text) && question?.text && <p className="text-lg text-gray-800 mb-4">{question.text}</p>}
                  {!showText && !moduleContent.show_text && (
                    <div className="text-center py-4 text-gray-500">
                      <Volume2 className="w-8 h-8 mx-auto mb-2 text-indigo-400" />
                      <p className="text-sm">Listen to the question</p>
                    </div>
                  )}
                </div>
              )}
            </Card>

            <div className="flex gap-3 justify-center">
              {recordingState === STATES.IDLE && <Button onClick={playQuestionAudio} className="bg-indigo-600 hover:bg-indigo-700 px-8"><Play className="w-5 h-5 mr-2" /> Start</Button>}
              {recordingState === STATES.RECORDING && <Button onClick={stopRecording} className="bg-red-600 hover:bg-red-700 px-8"><Square className="w-5 h-5 mr-2" /> Stop</Button>}
              {recordingState === STATES.READY_NEXT && <Button onClick={moveToNext} className="bg-green-600 hover:bg-green-700 px-8"><SkipForward className="w-5 h-5 mr-2" /> Next</Button>}
              {isPrepPhase && <Button onClick={() => { clearInterval(timerRef.current); setIsPrepPhase(false); startRecording(); }} className="bg-blue-600 hover:bg-blue-700 px-8"><Mic className="w-5 h-5 mr-2" /> Start Speaking</Button>}
            </div>

            <Card className="p-4 bg-gray-50">
              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div className={currentPart === 1 ? 'font-bold text-green-700' : 'text-gray-500'}><p>Part 1</p><p className="text-xs">Introduction</p></div>
                <div className={currentPart === 2 ? 'font-bold text-blue-700' : 'text-gray-500'}><p>Part 2</p><p className="text-xs">Long Turn</p></div>
                <div className={currentPart === 3 ? 'font-bold text-purple-700' : 'text-gray-500'}><p>Part 3</p><p className="text-xs">Discussion</p></div>
              </div>
            </Card>
          </div>
        )}

        {/* Evaluation Tier Selection Modal */}
        {showTierModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg p-6 bg-white">
              <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" /> Test Completed! 🎉
              </h2>
              <p className="text-gray-500 mb-4">Choose your evaluation type:</p>
              
              {/* User Credits Display */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                <span className="text-sm text-gray-600">Your Credits:</span>
                <Badge className={userCredits > 0 ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'}>
                  {userCredits} credit{userCredits !== 1 ? 's' : ''}
                </Badge>
              </div>
              
              <div className="space-y-4">
                {/* Free Tier */}
                <Card 
                  className="p-4 cursor-pointer hover:shadow-md transition-all border-2 hover:border-green-400 bg-green-50/50"
                  onClick={() => submitTest('free')}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Mic className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900">Basic Evaluation</h3>
                        <Badge className="bg-green-100 text-green-700">FREE</Badge>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">AI-powered analysis with Whisper + GPT-4o</p>
                      <ul className="text-xs text-gray-500 space-y-1">
                        <li className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-500" /> Band estimation</li>
                        <li className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-500" /> Strengths & weaknesses</li>
                        <li className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-500" /> General feedback</li>
                      </ul>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 mt-4" />
                  </div>
                </Card>

                {/* Premium Tier */}
                <Card 
                  className={`p-4 cursor-pointer hover:shadow-md transition-all border-2 bg-gradient-to-r from-purple-50 to-indigo-50 ${userCredits > 0 ? 'hover:border-purple-400' : 'opacity-75'}`}
                  onClick={() => userCredits > 0 ? submitTest('premium') : toast.error('You need at least 1 credit for premium evaluation')}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900">Premium Evaluation</h3>
                        <Badge className="bg-purple-100 text-purple-700">1 Token</Badge>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">Azure Pronunciation Assessment + Advanced AI</p>
                      <ul className="text-xs text-gray-500 space-y-1">
                        <li className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-purple-500" /> Word-level accuracy scores</li>
                        <li className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-purple-500" /> Phoneme analysis (ses yutma tespiti)</li>
                        <li className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-purple-500" /> Missing endings detection</li>
                        <li className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-purple-500" /> Fluency & prosody scores</li>
                        <li className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-purple-500" /> Mentor notes & practice focus</li>
                      </ul>
                      {userCredits === 0 && (
                        <p className="text-xs text-red-500 mt-2">⚠️ You need at least 1 credit</p>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 mt-4" />
                  </div>
                </Card>
              </div>
              
              <p className="text-xs text-gray-400 mt-4 text-center">
                1 Credit = 5 Tokens • Premium gives detailed pronunciation feedback
              </p>
            </Card>
          </div>
        )}

        {results && (
          <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Award className="w-6 h-6 text-indigo-600" /> Results
              </h2>
              <div className="flex items-center gap-2">
                {results.remaining_credits !== undefined && (
                  <Badge className="bg-gray-100 text-gray-600 text-xs">
                    {results.remaining_credits} credit{results.remaining_credits !== 1 ? 's' : ''} left
                  </Badge>
                )}
                {results.tier && (
                  <Badge className={results.tier === 'premium' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}>
                    {results.tier === 'premium' ? '⭐ Premium' : '🎯 Basic'}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="text-center mb-6">
              <p className="text-5xl font-bold text-indigo-600">{results.overall_band}</p>
              <p className="text-gray-500">Overall Band</p>
            </div>
            
            {/* Premium: Azure Pronunciation Scores */}
            {results.pronunciation_analysis?.azure_scores && (
              <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                  <Mic className="w-4 h-4" /> Pronunciation Analysis (Azure)
                </h4>
                <div className="grid grid-cols-5 gap-2 text-center">
                  {Object.entries(results.pronunciation_analysis.azure_scores).map(([k, v]) => (
                    <div key={k} className="bg-white p-2 rounded">
                      <p className="text-lg font-bold text-purple-700">{v}</p>
                      <p className="text-xs text-gray-500 capitalize">{k}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Premium: Pronunciation Issues */}
            {results.pronunciation_analysis?.main_issues?.length > 0 && (
              <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-800 mb-2">⚠️ Pronunciation Issues</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {results.pronunciation_analysis.main_issues.map((issue, i) => (
                    <li key={i}>• {issue}</li>
                  ))}
                </ul>
                {results.pronunciation_analysis.swallowed_sounds?.length > 0 && (
                  <p className="mt-2 text-xs text-red-600">
                    <strong>Swallowed sounds:</strong> {results.pronunciation_analysis.swallowed_sounds.join(', ')}
                  </p>
                )}
                {results.pronunciation_analysis.missing_endings?.length > 0 && (
                  <p className="text-xs text-red-600">
                    <strong>Missing endings:</strong> {results.pronunciation_analysis.missing_endings.join(', ')}
                  </p>
                )}
              </div>
            )}
            
            {/* Premium: Word-level Results */}
            {results.word_level_results?.length > 0 && (
              <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <h4 className="font-semibold text-orange-800 mb-2">🔤 Problem Words</h4>
                <div className="flex flex-wrap gap-2">
                  {results.word_level_results.slice(0, 10).map((word, i) => (
                    <span key={i} className="px-2 py-1 bg-white rounded text-sm border border-orange-200">
                      <span className="font-medium">{word.word}</span>
                      <span className="text-orange-600 ml-1">({word.accuracy_score}%)</span>
                      {word.error_type !== 'None' && (
                        <span className="text-xs text-red-500 ml-1">[{word.error_type}]</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              {results.criteria && Object.entries(results.criteria).map(([k, v]) => (
                <div key={k} className="bg-white p-3 rounded-lg">
                  <p className="text-sm text-gray-500 capitalize">{k.replace('_', ' ')}</p>
                  <p className="text-xl font-bold text-gray-900">{v}</p>
                </div>
              ))}
            </div>
            
            {/* Free tier metrics */}
            {results.metrics && (
              <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                  <div>
                    <p className="text-xl font-bold text-gray-700">{results.metrics.total_words}</p>
                    <p className="text-xs text-gray-500">Words Spoken</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-700">{results.metrics.words_per_minute}</p>
                    <p className="text-xs text-gray-500">Words/Min</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-700">{Math.round(results.metrics.total_duration)}s</p>
                    <p className="text-xs text-gray-500">Duration</p>
                  </div>
                </div>
              </div>
            )}
            
            {results.per_part_summary && (
              <div className="mb-6 space-y-2">
                <h3 className="font-semibold text-gray-800">Part Analysis</h3>
                {Object.entries(results.per_part_summary).map(([p, s]) => (
                  <div key={p} className="bg-white p-3 rounded-lg text-sm">
                    <span className="font-medium capitalize">{p}: </span><span className="text-gray-600">{s}</span>
                  </div>
                ))}
              </div>
            )}
            
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Strengths</h4>
                <ul className="text-sm text-green-700 space-y-1">{results.strengths?.map((s, i) => <li key={i}>• {s}</li>)}</ul>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg">
                <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2"><Target className="w-4 h-4" /> Improve</h4>
                <ul className="text-sm text-amber-700 space-y-1">{results.weaknesses?.map((w, i) => <li key={i}>• {w}</li>)}</ul>
              </div>
            </div>
            
            {results.mentor_notes && (
              <div className="bg-white p-4 rounded-lg border mb-6">
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2"><User className="w-4 h-4" /> Mentor Notes</h4>
                <p className="text-sm text-gray-600 italic">{results.mentor_notes}</p>
              </div>
            )}
            
            {/* Premium: Practice Focus */}
            {results.practice_focus?.length > 0 && (
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200 mb-6">
                <h4 className="font-semibold text-indigo-800 mb-2 flex items-center gap-2">🎯 Practice Focus</h4>
                <ul className="text-sm text-indigo-700 space-y-1">{results.practice_focus.map((p, i) => <li key={i}>• {p}</li>)}</ul>
              </div>
            )}
            
            {results.try_this_next?.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2"><Lightbulb className="w-4 h-4" /> Try This Next</h4>
                <ul className="text-sm text-blue-700 space-y-1">{results.try_this_next.map((t, i) => <li key={i}>• {t}</li>)}</ul>
              </div>
            )}
            
            {/* Free tier upgrade prompt */}
            {results.upgrade_prompt && (
              <div className="bg-gradient-to-r from-purple-100 to-indigo-100 p-4 rounded-lg border border-purple-200 mb-6">
                <p className="text-sm text-purple-700">{results.upgrade_prompt}</p>
              </div>
            )}
            
            {results.recommended_lessons?.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-3">Recommended Lessons</h4>
                <div className="space-y-2">
                  {results.recommended_lessons.map((l, i) => (
                    <div key={i} className="flex items-center justify-between bg-white p-3 rounded-lg border">
                      <div><p className="font-medium text-gray-900">{l.title}</p><p className="text-xs text-gray-500">{l.track} • {l.stage}</p></div>
                      <Button variant="outline" size="sm" onClick={() => navigate(l.url || '/mastery-course')}>Go <ChevronRight className="w-3 h-3 ml-1" /></Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => selectModule(selectedModule)} className="flex-1"><RotateCcw className="w-4 h-4 mr-2" /> Again</Button>
              <Button onClick={() => navigate('/question-bank')} className="flex-1 bg-indigo-600">More <ChevronRight className="w-4 h-4 ml-1" /></Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
