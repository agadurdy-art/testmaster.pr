import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { 
  Clock, AlertCircle, ChevronRight, Volume2, VolumeX,
  Loader2, CheckCircle, Play, Pause, ArrowRight, ArrowLeft, Send, 
  Mic, MicOff, Square, SkipForward, Eye, EyeOff
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// ============ TEST CONFIGURATION ============
const SECTION_CONFIG = {
  listening: {
    totalTime: 40 * 60, // 40 minutes
    questions: 40,
    parts: 4,
    icon: Volume2,
    color: 'blue',
    rules: [
      'Audio plays ONCE only',
      'No rewinding or seeking allowed',
      'Answer questions as you listen',
      'Transfer answers before time ends'
    ]
  },
  reading: {
    totalTime: 60 * 60, // 60 minutes
    questions: 40,
    passages: 3,
    icon: null,
    color: 'green',
    rules: [
      'You have 60 minutes for all passages',
      'Suggested time: 20 minutes per passage',
      'All answers must be submitted before time ends'
    ]
  },
  writing: {
    totalTime: 60 * 60, // 60 minutes
    tasks: 2,
    icon: null,
    color: 'purple',
    rules: [
      'Task 1: 20 minutes, minimum 150 words',
      'Task 2: 40 minutes, minimum 250 words',
      'Task 2 counts twice as much as Task 1'
    ]
  },
  speaking: {
    totalTime: 14 * 60, // 14 minutes max
    parts: 3,
    icon: Mic,
    color: 'orange',
    rules: [
      'Part 1: Answer questions about familiar topics (4-5 min)',
      'Part 2: Speak on a topic for 2 minutes with 1 min prep',
      'Part 3: Discussion on abstract topics (4-5 min)'
    ]
  }
};

// ============ SPEAKING TIMING ============
const SPEAKING_TIMING = {
  part1: { questionTime: 25, questions: 9 }, // 25s per question, hard cap
  part2: { prepTime: 60, speakTime: 120 }, // 60s prep, 120s speak
  part3: { questionTime: 75, questions: 5 } // 75s per question, hard cap
};

export default function FullTestInterface({ user }) {
  const { testId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session');
  const mode = searchParams.get('mode') || 'full';

  // ============ STATE ============
  const [loading, setLoading] = useState(true);
  const [testData, setTestData] = useState(null);
  const [currentSection, setCurrentSection] = useState('listening');
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [answers, setAnswers] = useState({});
  const [sectionAnswers, setSectionAnswers] = useState({
    listening: {},
    reading: {},
    writing: { task1: '', task2: '' },
    speaking: {}
  });
  const [completedSections, setCompletedSections] = useState([]);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Listening specific
  const [listeningPart, setListeningPart] = useState(1);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioEnded, setAudioEnded] = useState(false);
  const audioRef = useRef(null);

  // Reading specific
  const [currentPassage, setCurrentPassage] = useState(0);

  // Writing specific
  const [writingTask, setWritingTask] = useState(1);
  const [wordCount, setWordCount] = useState({ task1: 0, task2: 0 });

  // Speaking specific
  const [speakingPart, setSpeakingPart] = useState(1);
  const [speakingQuestion, setSpeakingQuestion] = useState(0);
  const [speakingState, setSpeakingState] = useState('IDLE'); // IDLE, PROMPT_PLAYING, RECORDING, PROCESSING, READY_NEXT
  const [prepTimeRemaining, setPrepTimeRemaining] = useState(0);
  const [questionTimeRemaining, setQuestionTimeRemaining] = useState(0);
  const [showQuestionText, setShowQuestionText] = useState(true);
  const [recordings, setRecordings] = useState({});
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const questionAudioRef = useRef(null);

  // Section order - for full test mode
  const sectionOrder = ['listening', 'reading', 'writing', 'speaking'];
  
  // Check if single section mode
  const isSingleSectionMode = ['listening', 'reading', 'writing', 'speaking'].includes(mode);
  const activeSections = isSingleSectionMode ? [mode] : sectionOrder;

  // ============ LOAD TEST DATA ============
  useEffect(() => {
    loadTestData();
  }, [testId]);

  // Set initial section based on mode
  useEffect(() => {
    if (isSingleSectionMode) {
      setCurrentSection(mode);
      setCurrentSectionIndex(0);
    }
  }, [mode, isSingleSectionMode]);

  const loadTestData = async () => {
    try {
      const res = await fetch(`${API_URL}/api/full-test/set/${testId}`);
      const data = await res.json();
      if (data.success) {
        setTestData(data.test);
        // Set time based on mode
        const initialSection = isSingleSectionMode ? mode : 'listening';
        setCurrentSection(initialSection);
        setTimeRemaining(SECTION_CONFIG[initialSection].totalTime);
      } else {
        toast.error('Failed to load test');
        navigate('/full-test');
      }
    } catch (error) {
      console.error('Error loading test:', error);
      toast.error('Error loading test data');
    } finally {
      setLoading(false);
    }
  };

  // ============ TIMER ============
  useEffect(() => {
    let interval;
    if (timerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSectionTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeRemaining]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSectionTimeUp = () => {
    setTimerActive(false);
    toast.warning(`Time's up! ${currentSection.charAt(0).toUpperCase() + currentSection.slice(1)} section ended.`);
    submitCurrentSection();
  };

  // ============ SECTION NAVIGATION ============
  const startSection = () => {
    setTimerActive(true);
    if (currentSection === 'listening') {
      playListeningAudio();
    }
  };

  const submitCurrentSection = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/full-test/submit-section`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          section: currentSection,
          answers: sectionAnswers[currentSection],
          time_taken: SECTION_CONFIG[currentSection].totalTime - timeRemaining
        })
      });

      const data = await res.json();
      if (data.success) {
        setCompletedSections([...completedSections, currentSection]);
        
        // In single section mode, complete immediately
        if (isSingleSectionMode) {
          completeTest();
          return;
        }
        
        // Move to next section or complete test
        const nextIndex = currentSectionIndex + 1;
        if (nextIndex < activeSections.length) {
          const nextSection = activeSections[nextIndex];
          setCurrentSection(nextSection);
          setCurrentSectionIndex(nextIndex);
          setTimeRemaining(SECTION_CONFIG[nextSection].totalTime);
          setTimerActive(false);
          toast.success(`${currentSection} completed. Starting ${nextSection}.`);
        } else {
          // All sections complete
          completeTest();
        }
      }
    } catch (error) {
      console.error('Error submitting section:', error);
      toast.error('Error submitting section');
    } finally {
      setSubmitting(false);
      setShowConfirmSubmit(false);
    }
  };

  const completeTest = async () => {
    try {
      const res = await fetch(`${API_URL}/api/full-test/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          test_id: testId,
          mode: mode,
          all_answers: sectionAnswers,
          section_times: activeSections.reduce((acc, section, idx) => {
            acc[section] = completedSections.includes(section) 
              ? SECTION_CONFIG[section].totalTime 
              : (idx === currentSectionIndex ? SECTION_CONFIG[section].totalTime - timeRemaining : 0);
            return acc;
          }, {})
        })
      });

      const data = await res.json();
      if (data.success) {
        navigate(`/full-test/results/${sessionId}`, { state: { results: data.results } });
      }
    } catch (error) {
      console.error('Error completing test:', error);
      toast.error('Error completing test');
    }
  };

  // ============ LISTENING HANDLERS ============
  const playListeningAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setAudioPlaying(true);
    }
  };

  const handleAudioEnded = () => {
    setAudioPlaying(false);
    setAudioEnded(true);
    
    if (listeningPart < 4) {
      setListeningPart(prev => prev + 1);
      setAudioEnded(false);
      // Small delay before playing next part
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play();
          setAudioPlaying(true);
        }
      }, 2000);
    }
  };

  const updateListeningAnswer = (questionId, value) => {
    setSectionAnswers(prev => ({
      ...prev,
      listening: {
        ...prev.listening,
        [questionId]: value
      }
    }));
  };

  // ============ READING HANDLERS ============
  const updateReadingAnswer = (questionId, value) => {
    setSectionAnswers(prev => ({
      ...prev,
      reading: {
        ...prev.reading,
        [questionId]: value
      }
    }));
  };

  // ============ WRITING HANDLERS ============
  const updateWritingResponse = (task, text) => {
    setSectionAnswers(prev => ({
      ...prev,
      writing: {
        ...prev.writing,
        [`task${task}`]: text
      }
    }));
    setWordCount(prev => ({
      ...prev,
      [`task${task}`]: text.trim().split(/\s+/).filter(Boolean).length
    }));
  };

  // ============ SPEAKING HANDLERS ============
  const startSpeakingRecording = async () => {
    try {
      // Release any previous stream
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      
      // Create new MediaRecorder instance for isolation
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      
      // Clear previous chunks
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const answerId = `${speakingPart}_${speakingQuestion}`;
        
        // Store recording with unique ID
        setRecordings(prev => ({
          ...prev,
          [answerId]: {
            blob: audioBlob,
            url: URL.createObjectURL(audioBlob),
            timestamp: Date.now()
          }
        }));
        
        // Update section answers
        setSectionAnswers(prev => ({
          ...prev,
          speaking: {
            ...prev.speaking,
            [answerId]: { audioBlob, timestamp: Date.now() }
          }
        }));
        
        // Release stream
        stream.getTracks().forEach(track => track.stop());
        
        setSpeakingState('READY_NEXT');
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setSpeakingState('RECORDING');
      
      // Set up auto-stop timer based on part
      const maxTime = speakingPart === 1 ? SPEAKING_TIMING.part1.questionTime :
                     speakingPart === 2 ? SPEAKING_TIMING.part2.speakTime :
                     SPEAKING_TIMING.part3.questionTime;
      
      setQuestionTimeRemaining(maxTime);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Could not access microphone');
    }
  };

  const stopSpeakingRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setSpeakingState('PROCESSING');
    }
  };

  const moveToNextSpeakingQuestion = () => {
    const currentPart = testData?.sections?.speaking?.parts?.[speakingPart - 1];
    const questions = currentPart?.questions || [];
    
    if (speakingQuestion < questions.length - 1) {
      setSpeakingQuestion(prev => prev + 1);
      setSpeakingState('IDLE');
    } else if (speakingPart < 3) {
      setSpeakingPart(prev => prev + 1);
      setSpeakingQuestion(0);
      setSpeakingState('IDLE');
    } else {
      // Speaking section complete
      setShowConfirmSubmit(true);
    }
  };

  // Speaking timer
  useEffect(() => {
    let interval;
    if (speakingState === 'RECORDING' && questionTimeRemaining > 0) {
      interval = setInterval(() => {
        setQuestionTimeRemaining(prev => {
          if (prev <= 1) {
            stopSpeakingRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [speakingState, questionTimeRemaining]);

  // ============ RENDER FUNCTIONS ============

  const renderSectionStart = () => {
    const config = SECTION_CONFIG[currentSection];
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <Badge className="mb-4 bg-slate-100 text-slate-700">
          Section {currentSectionIndex + 1} of {sectionOrder.length}
        </Badge>
        
        <h2 className="text-3xl font-bold text-slate-900 mb-4 capitalize">
          {currentSection}
        </h2>
        
        <div className="text-slate-600 mb-8">
          <p className="text-lg mb-2">
            Time: {formatTime(config.totalTime)} | 
            {config.questions && ` ${config.questions} questions`}
            {config.tasks && ` ${config.tasks} tasks`}
          </p>
        </div>

        <Card className="p-6 mb-8 text-left bg-amber-50 border-amber-200">
          <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Section Rules
          </h3>
          <ul className="space-y-2">
            {config.rules.map((rule, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-amber-800">
                <CheckCircle className="w-4 h-4 mt-0.5 text-amber-600" />
                {rule}
              </li>
            ))}
          </ul>
        </Card>

        <Button 
          size="lg" 
          className="bg-slate-900 hover:bg-slate-800"
          onClick={startSection}
        >
          <Play className="w-5 h-5 mr-2" />
          Start {currentSection.charAt(0).toUpperCase() + currentSection.slice(1)}
        </Button>
      </div>
    );
  };

  const renderListeningSection = () => {
    const listening = testData?.sections?.listening;
    const currentPartData = listening?.parts?.[listeningPart - 1];
    
    // Handle play button click
    const handlePlayAudio = () => {
      if (audioRef.current) {
        if (audioPlaying) {
          audioRef.current.pause();
        } else {
          audioRef.current.play();
        }
      }
    };
    
    return (
      <div className="space-y-6">
        {/* Audio Player - NO SEEKING */}
        <Card className="p-4 bg-slate-900 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${audioPlaying ? 'bg-green-500 animate-pulse' : 'bg-slate-700'}`}>
                {audioPlaying ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </div>
              <div>
                <p className="font-medium">Part {listeningPart}: {currentPartData?.title}</p>
                <p className="text-sm text-slate-400">{currentPartData?.context}</p>
              </div>
            </div>
            <Badge className={audioPlaying ? 'bg-green-500' : audioEnded ? 'bg-amber-500' : 'bg-slate-600'}>
              {audioPlaying ? 'Playing' : audioEnded ? 'Ended' : 'Ready'}
            </Badge>
          </div>
          
          {/* Play/Pause Button */}
          <div className="flex items-center justify-center gap-4 py-4">
            <Button
              size="lg"
              onClick={handlePlayAudio}
              disabled={audioEnded}
              className={`${audioPlaying ? 'bg-amber-500 hover:bg-amber-600' : 'bg-green-500 hover:bg-green-600'} text-white px-8`}
            >
              {audioPlaying ? (
                <>
                  <Pause className="w-5 h-5 mr-2" />
                  Pause Audio
                </>
              ) : audioEnded ? (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Audio Completed
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Play Audio
                </>
              )}
            </Button>
          </div>
          
          {/* Hidden audio element - NO CONTROLS for seeking prevention */}
          <audio
            ref={audioRef}
            src={`${API_URL}/api/full-test/audio/stream/${testId}/listening/${listeningPart}`}
            onEnded={handleAudioEnded}
            onPlay={() => setAudioPlaying(true)}
            onPause={() => setAudioPlaying(false)}
            style={{ display: 'none' }}
          />
          
          <p className="text-xs text-slate-500 mt-2 text-center">
            ⚠️ Audio plays once only. No rewinding allowed.
          </p>
        </Card>

        {/* Questions */}
        <div className="space-y-4">
          {currentPartData?.questions?.map((q, idx) => {
            // Calculate absolute question number based on part
            const partOffset = (listeningPart - 1) * 10;
            const questionNum = partOffset + idx + 1;
            return (
            <Card key={q.id} className="p-4">
              <div className="flex gap-3">
                <span className="font-bold text-slate-900 min-w-[32px]">
                  {questionNum}.
                </span>
                <div className="flex-1">
                  <p className="text-slate-700 mb-2">{q.question}</p>
                  {q.instruction && (
                    <p className="text-xs text-slate-500 mb-2 italic">{q.instruction}</p>
                  )}
                  
                  {q.type === 'multiple_choice' ? (
                    <div className="space-y-2">
                      {q.options?.map((opt, optIdx) => (
                        <label key={optIdx} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={q.id}
                            value={opt.charAt(0)}
                            checked={sectionAnswers.listening[q.id] === opt.charAt(0)}
                            onChange={(e) => updateListeningAnswer(q.id, e.target.value)}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <input
                      type="text"
                      className="w-full p-2 border rounded text-sm"
                      placeholder="Your answer..."
                      value={sectionAnswers.listening[q.id] || ''}
                      onChange={(e) => updateListeningAnswer(q.id, e.target.value)}
                    />
                  )}
                </div>
              </div>
            </Card>
          );
          })}
        </div>

        {/* Part Navigation */}
        <Card className="p-4 bg-slate-50 sticky bottom-0">
          <div className="flex items-center justify-between">
            {/* Part Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600 font-medium">Part:</span>
              {[1, 2, 3, 4].map((part) => (
                <Button
                  key={part}
                  variant={listeningPart === part ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setListeningPart(part)}
                  className={listeningPart === part ? 'bg-slate-900' : ''}
                >
                  {part}
                </Button>
              ))}
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setListeningPart(prev => Math.max(1, prev - 1))}
                disabled={listeningPart === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Previous
              </Button>
              
              {listeningPart < 4 ? (
                <Button
                  onClick={() => setListeningPart(prev => Math.min(4, prev + 1))}
                  className="bg-slate-900 hover:bg-slate-800"
                >
                  Next Part <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button 
                  onClick={() => setShowConfirmSubmit(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Submit Listening <CheckCircle className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
          
          <div className="mt-2 text-center text-xs text-slate-500">
            Part {listeningPart} of 4 • Questions {(listeningPart - 1) * 10 + 1}-{listeningPart * 10}
          </div>
        </Card>
      </div>
    );
  };

  const renderReadingSection = () => {
    const reading = testData?.sections?.reading;
    const passage = reading?.passages?.[currentPassage];
    
    return (
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Passage */}
        <Card className="p-6 max-h-[calc(100vh-300px)] overflow-y-auto">
          <h3 className="font-bold text-lg text-slate-900 mb-2">
            Passage {currentPassage + 1}: {passage?.title}
          </h3>
          <div className="prose prose-sm max-w-none">
            {passage?.text?.split('\n\n').map((para, idx) => (
              <p key={idx} className="text-slate-700 mb-3">
                {para.startsWith(/^[A-Z]$/) ? (
                  <><strong>{para.charAt(0)}</strong>{para.slice(1)}</>
                ) : para}
              </p>
            ))}
          </div>
        </Card>

        {/* Questions */}
        <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
          {passage?.questions?.map((q, idx) => (
            <Card key={q.id} className="p-4">
              <div className="flex gap-3">
                <span className="font-bold text-slate-900 min-w-[32px]">
                  {q.id.replace(/[^\d]/g, '') || idx + 1}.
                </span>
                <div className="flex-1">
                  <p className="text-slate-700 mb-2">{q.question}</p>
                  {q.instruction && (
                    <p className="text-xs text-slate-500 mb-2 italic">{q.instruction}</p>
                  )}
                  
                  {q.type === 'multiple_choice' || q.type === 'true_false_ng' || q.type === 'yes_no_ng' ? (
                    <div className="space-y-2">
                      {(q.options || (q.type === 'true_false_ng' ? ['TRUE', 'FALSE', 'NOT GIVEN'] : ['YES', 'NO', 'NOT GIVEN'])).map((opt, optIdx) => (
                        <label key={optIdx} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={q.id}
                            value={typeof opt === 'string' && opt.includes(')') ? opt.charAt(0) : opt}
                            checked={sectionAnswers.reading[q.id] === (typeof opt === 'string' && opt.includes(')') ? opt.charAt(0) : opt)}
                            onChange={(e) => updateReadingAnswer(q.id, e.target.value)}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : q.type === 'matching_headings' || q.type === 'matching_info' || q.type === 'matching_features' ? (
                    <select
                      className="w-full p-2 border rounded text-sm"
                      value={sectionAnswers.reading[q.id] || ''}
                      onChange={(e) => updateReadingAnswer(q.id, e.target.value)}
                    >
                      <option value="">Select...</option>
                      {(q.options || q.paragraph_options || q.feature_options)?.map((opt, optIdx) => (
                        <option key={optIdx} value={typeof opt === 'string' ? (opt.match(/^[ivx]+\)|^[A-C]\)/)?.[0]?.replace(')', '') || opt) : opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      className="w-full p-2 border rounded text-sm"
                      placeholder="Your answer..."
                      value={sectionAnswers.reading[q.id] || ''}
                      onChange={(e) => updateReadingAnswer(q.id, e.target.value)}
                    />
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Passage Navigation */}
        <div className="lg:col-span-2 flex justify-between items-center pt-4 border-t">
          <div className="flex gap-2">
            {reading?.passages?.map((_, idx) => (
              <Button
                key={idx}
                variant={currentPassage === idx ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPassage(idx)}
              >
                Passage {idx + 1}
              </Button>
            ))}
          </div>
          {currentPassage === 2 && (
            <Button onClick={() => setShowConfirmSubmit(true)}>
              Submit Reading <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    );
  };

  const renderWritingSection = () => {
    const writing = testData?.sections?.writing;
    const task = writing?.tasks?.[writingTask - 1];
    
    return (
      <div className="space-y-6">
        {/* Task Tabs */}
        <div className="flex gap-2">
          <Button
            variant={writingTask === 1 ? 'default' : 'outline'}
            onClick={() => setWritingTask(1)}
          >
            Task 1 (20 min)
          </Button>
          <Button
            variant={writingTask === 2 ? 'default' : 'outline'}
            onClick={() => setWritingTask(2)}
          >
            Task 2 (40 min)
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Task Prompt */}
          <Card className="p-6">
            <h3 className="font-bold text-lg text-slate-900 mb-4">
              Task {writingTask}
            </h3>
            <div className="prose prose-sm max-w-none">
              <p className="text-slate-700 whitespace-pre-wrap">{task?.prompt}</p>
            </div>
            
            {task?.visual_data && (
              <div className="mt-4 p-4 bg-slate-50 rounded">
                <p className="text-sm text-slate-600 mb-2">Visual: {task.visual_data.title}</p>
                {/* Render visual based on type */}
              </div>
            )}
            
            <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-blue-700">
              <strong>Word limit:</strong> Minimum {task?.word_limit?.min} words, 
              recommended {task?.word_limit?.recommended} words
            </div>
          </Card>

          {/* Writing Area */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Your Response</span>
              <Badge variant={wordCount[`task${writingTask}`] >= (task?.word_limit?.min || 150) ? 'success' : 'secondary'}>
                {wordCount[`task${writingTask}`]} words
              </Badge>
            </div>
            <Textarea
              className="min-h-[400px] text-sm"
              placeholder="Write your response here..."
              value={sectionAnswers.writing[`task${writingTask}`]}
              onChange={(e) => updateWritingResponse(writingTask, e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={() => setShowConfirmSubmit(true)}>
            Submit Writing <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  };

  const renderSpeakingSection = () => {
    const speaking = testData?.sections?.speaking;
    const currentPartData = speaking?.parts?.[speakingPart - 1];
    const currentQ = currentPartData?.questions?.[speakingQuestion];
    
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Part Info */}
        <Card className="p-4 bg-slate-900 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Part {speakingPart}: {currentPartData?.title}</p>
              <p className="text-sm text-slate-400">{currentPartData?.description}</p>
            </div>
            <Badge className="bg-slate-700">
              {speakingPart === 1 && `Question ${speakingQuestion + 1} of ${currentPartData?.questions?.length || 0}`}
              {speakingPart === 2 && 'Individual Long Turn'}
              {speakingPart === 3 && `Question ${speakingQuestion + 1} of ${currentPartData?.questions?.length || 0}`}
            </Badge>
          </div>
        </Card>

        {/* Question Display */}
        <Card className="p-6">
          {/* Toggle for showing question text (band 5.5+) */}
          <div className="flex justify-end mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowQuestionText(!showQuestionText)}
              className="text-slate-500"
            >
              {showQuestionText ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
              {showQuestionText ? 'Hide Text' : 'Show Text'}
            </Button>
          </div>

          {/* Part 2 Cue Card - Always visible */}
          {speakingPart === 2 && currentPartData?.cue_card && (
            <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-lg mb-6">
              <h4 className="font-bold text-amber-900 mb-2">Cue Card</h4>
              <p className="text-slate-800 font-medium mb-3">{currentPartData.cue_card.topic}</p>
              <p className="text-sm text-slate-600 mb-2">You should say:</p>
              <ul className="list-disc list-inside space-y-1">
                {currentPartData.cue_card.points?.map((point, idx) => (
                  <li key={idx} className="text-sm text-slate-700">{point}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Question (Parts 1 & 3) */}
          {(speakingPart === 1 || speakingPart === 3) && currentQ && (
            <div className="text-center">
              {showQuestionText && (
                <p className="text-xl text-slate-800 mb-4">{currentQ.text}</p>
              )}
              
              {/* Play question audio button */}
              <Button
                variant="outline"
                onClick={() => {
                  if (questionAudioRef.current) {
                    questionAudioRef.current.play();
                    setSpeakingState('PROMPT_PLAYING');
                  }
                }}
                disabled={speakingState !== 'IDLE'}
                className="mb-6"
              >
                <Volume2 className="w-4 h-4 mr-2" />
                Play Question
              </Button>
              
              <audio
                ref={questionAudioRef}
                src={`${API_URL}/api/full-test/audio/stream/${testId}/speaking/speaking_p${speakingPart}_${currentQ.id}`}
                onEnded={() => setSpeakingState('IDLE')}
                style={{ display: 'none' }}
              />
            </div>
          )}
        </Card>

        {/* Recording Controls */}
        <Card className="p-6">
          <div className="text-center space-y-4">
            {/* Timer */}
            {speakingState === 'RECORDING' && (
              <div className="text-3xl font-mono font-bold text-red-600">
                {formatTime(questionTimeRemaining)}
              </div>
            )}

            {/* State Indicator */}
            <div className="flex justify-center items-center gap-2">
              {speakingState === 'IDLE' && <Badge>Ready</Badge>}
              {speakingState === 'PROMPT_PLAYING' && <Badge className="bg-blue-500">Listening...</Badge>}
              {speakingState === 'RECORDING' && <Badge className="bg-red-500 animate-pulse">Recording</Badge>}
              {speakingState === 'PROCESSING' && <Badge className="bg-amber-500">Processing...</Badge>}
              {speakingState === 'READY_NEXT' && <Badge className="bg-green-500">Recorded</Badge>}
            </div>

            {/* Control Buttons */}
            <div className="flex justify-center gap-4">
              {speakingState === 'IDLE' && (
                <Button
                  size="lg"
                  className="bg-red-500 hover:bg-red-600"
                  onClick={startSpeakingRecording}
                >
                  <Mic className="w-5 h-5 mr-2" />
                  Start Recording
                </Button>
              )}

              {speakingState === 'RECORDING' && (
                <Button
                  size="lg"
                  variant="destructive"
                  onClick={stopSpeakingRecording}
                >
                  <Square className="w-5 h-5 mr-2" />
                  Stop Recording
                </Button>
              )}

              {speakingState === 'READY_NEXT' && (
                <Button
                  size="lg"
                  className="bg-slate-900 hover:bg-slate-800"
                  onClick={moveToNextSpeakingQuestion}
                >
                  <SkipForward className="w-5 h-5 mr-2" />
                  Next Question
                </Button>
              )}
            </div>

            {/* Playback of recording */}
            {recordings[`${speakingPart}_${speakingQuestion}`] && (
              <div className="mt-4">
                <audio
                  controls
                  src={recordings[`${speakingPart}_${speakingQuestion}`].url}
                  className="mx-auto"
                />
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  };

  // ============ MAIN RENDER ============
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Fixed Header with Timer */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-slate-900">
              {isSingleSectionMode ? `${currentSection.charAt(0).toUpperCase() + currentSection.slice(1)} Practice` : 'IELTS-Style Full Test'}
            </h1>
            <Badge variant="outline" className="capitalize">
              {currentSection}
            </Badge>
          </div>

          {/* Section Progress - only show for full test */}
          {!isSingleSectionMode && (
            <div className="flex items-center gap-1">
              {activeSections.map((section, idx) => (
                <div
                  key={section}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                    ${completedSections.includes(section) ? 'bg-green-500 text-white' : 
                      idx === currentSectionIndex ? 'bg-slate-900 text-white' : 
                      'bg-slate-200 text-slate-500'}`}
                >
                  {completedSections.includes(section) ? '✓' : idx + 1}
                </div>
              ))}
            </div>
          )}

          {/* Timer */}
          {timerActive && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg
              ${timeRemaining < 300 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-900'}`}>
              <Clock className="w-5 h-5" />
              {formatTime(timeRemaining)}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {!timerActive && !completedSections.includes(currentSection) ? (
          renderSectionStart()
        ) : (
          <>
            {currentSection === 'listening' && renderListeningSection()}
            {currentSection === 'reading' && renderReadingSection()}
            {currentSection === 'writing' && renderWritingSection()}
            {currentSection === 'speaking' && renderSpeakingSection()}
          </>
        )}
      </main>

      {/* Submit Confirmation Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Submit {currentSection.charAt(0).toUpperCase() + currentSection.slice(1)}?
            </h3>
            <p className="text-slate-600 mb-6">
              Once submitted, you cannot return to this section. 
              Make sure you have reviewed all your answers.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowConfirmSubmit(false)}>
                Review Answers
              </Button>
              <Button 
                className="bg-slate-900 hover:bg-slate-800"
                onClick={submitCurrentSection}
                disabled={submitting}
              >
                {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                Submit
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
