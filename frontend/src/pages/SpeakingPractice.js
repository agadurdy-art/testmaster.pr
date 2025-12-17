import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import {
  Mic, MicOff, ArrowLeft, Clock, CheckCircle, XCircle, Loader2,
  ChevronRight, Play, Pause, RotateCcw, Volume2, MessageSquare,
  Target, AlertCircle, Lightbulb, Award, Square, User, Bot
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Speaking Part Configurations
const SPEAKING_PARTS = [
  {
    id: 'part1',
    title: 'Part 1: Introduction',
    description: 'Answer questions about familiar topics',
    duration: '4-5 minutes',
    icon: MessageSquare,
    color: 'from-green-500 to-emerald-600',
    tips: 'Give extended answers (2-3 sentences). Use examples from your life.'
  },
  {
    id: 'part2',
    title: 'Part 2: Cue Card',
    description: 'Speak for 2 minutes on a given topic',
    duration: '3-4 minutes',
    icon: Target,
    color: 'from-blue-500 to-indigo-600',
    tips: '1 min to prepare, 2 mins to speak. Cover all bullet points on the card.'
  },
  {
    id: 'part3',
    title: 'Part 3: Discussion',
    description: 'Discuss abstract ideas related to Part 2',
    duration: '4-5 minutes',
    icon: Bot,
    color: 'from-purple-500 to-pink-600',
    tips: 'Give opinions with reasons. Discuss both sides of issues.'
  },
  {
    id: 'full_test',
    title: 'Full Mock Test',
    description: 'Complete all 3 parts in one session',
    duration: '11-14 minutes',
    icon: Award,
    color: 'from-orange-500 to-red-600',
    tips: 'Simulate real exam conditions. Take it seriously!'
  }
];

// Speaking Questions Database
const SPEAKING_QUESTIONS = {
  part1: [
    {
      topic: 'Home & Accommodation',
      questions: [
        "Let's talk about where you live. Do you live in a house or an apartment?",
        "What do you like most about your home?",
        "Is there anything you would like to change about your home?",
        "Do you plan to live there for a long time?"
      ]
    },
    {
      topic: 'Work & Studies',
      questions: [
        "Do you work or are you a student?",
        "What do you like about your work/studies?",
        "Is there anything you would like to change about your job/course?",
        "What are your future career plans?"
      ]
    },
    {
      topic: 'Daily Routine',
      questions: [
        "What time do you usually wake up?",
        "What do you usually do in the morning?",
        "Is your routine the same on weekdays and weekends?",
        "Would you like to change your daily routine?"
      ]
    },
    {
      topic: 'Hobbies & Free Time',
      questions: [
        "What do you enjoy doing in your free time?",
        "How did you become interested in this hobby?",
        "Do you think you'll continue this hobby in the future?",
        "Would you recommend this hobby to others?"
      ]
    }
  ],
  part2: [
    {
      id: 'cue1',
      topic: 'Describe a person who has influenced you',
      card: "Describe a person who has had a significant influence on your life.\n\nYou should say:\n• who this person is\n• how you know this person\n• what qualities this person has\n\nAnd explain why this person has influenced you.",
      followUp: "Is it easy to influence others?"
    },
    {
      id: 'cue2',
      topic: 'Describe a place you would like to visit',
      card: "Describe a place you would like to visit in the future.\n\nYou should say:\n• where this place is\n• how you know about it\n• what you would do there\n\nAnd explain why you want to visit this place.",
      followUp: "Do you prefer traveling alone or with others?"
    },
    {
      id: 'cue3',
      topic: 'Describe a skill you learned',
      card: "Describe a skill you learned that you are proud of.\n\nYou should say:\n• what the skill is\n• how you learned it\n• how long it took to learn\n\nAnd explain why you are proud of learning this skill.",
      followUp: "Do you think everyone should learn this skill?"
    },
    {
      id: 'cue4',
      topic: 'Describe a memorable event',
      card: "Describe a memorable event from your childhood.\n\nYou should say:\n• what the event was\n• when and where it happened\n• who was involved\n\nAnd explain why this event is memorable to you.",
      followUp: "Do you think childhood memories are important?"
    }
  ],
  part3: [
    {
      topic: 'Influence & Role Models',
      questions: [
        "Why do you think some people become role models?",
        "Do celebrities have too much influence on young people?",
        "How has the way people influence others changed with social media?",
        "Should parents be the main influence on children, or is it okay for others to influence them?"
      ]
    },
    {
      topic: 'Travel & Tourism',
      questions: [
        "What are the benefits of international travel?",
        "How has tourism affected local cultures around the world?",
        "Do you think people will travel more or less in the future?",
        "Should governments limit tourism to protect the environment?"
      ]
    },
    {
      topic: 'Skills & Education',
      questions: [
        "What skills do you think will be most important in the future?",
        "Should schools focus more on practical skills or academic knowledge?",
        "How has technology changed the way people learn new skills?",
        "Is it better to be a specialist in one area or have knowledge in many areas?"
      ]
    }
  ]
};

export default function SpeakingPractice({ user }) {
  const navigate = useNavigate();
  
  // State management
  const [view, setView] = useState('parts'); // parts, practice, feedback
  const [selectedPart, setSelectedPart] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordings, setRecordings] = useState([]); // Store all recordings for the session
  const [transcripts, setTranscripts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [prepTime, setPrepTime] = useState(0);
  const [speakTime, setSpeakTime] = useState(0);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [playingAudio, setPlayingAudio] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioRef = useRef(null);

  // Timer effect for prep and speaking time
  useEffect(() => {
    if (isPreparing && prepTime > 0) {
      timerRef.current = setInterval(() => {
        setPrepTime(prev => {
          if (prev <= 1) {
            setIsPreparing(false);
            toast.info('Preparation time is over. Start speaking!');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (isSpeaking && speakTime > 0) {
      timerRef.current = setInterval(() => {
        setSpeakTime(prev => {
          if (prev <= 1) {
            stopRecording();
            toast.info('Speaking time is over.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isPreparing, prepTime, isSpeaking, speakTime]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        setAudioBlob(blob);
        setRecording(false);
        setIsSpeaking(false);
        
        // Auto-transcribe
        await transcribeAudio(blob);
      };

      mediaRecorder.start();
      setRecording(true);
      setIsSpeaking(true);
      
      // Set speaking time based on part
      if (selectedPart === 'part2') {
        setSpeakTime(120); // 2 minutes for Part 2
      } else {
        setSpeakTime(60); // 1 minute for other parts
      }
      
      toast.info('Recording... Speak now!');
    } catch (error) {
      console.error('Microphone error:', error);
      toast.error('Failed to access microphone. Please allow microphone access.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
    }
  };

  // Transcribe audio
  const transcribeAudio = async (blob) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', new File([blob], 'recording.webm', { type: 'audio/webm' }));

      const response = await fetch(`${API_URL}/api/speaking/transcribe`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Transcription failed');

      const data = await response.json();
      const currentQuestion = getCurrentQuestion();
      
      // Save recording and transcript
      const newRecording = {
        question: currentQuestion,
        audioBlob: blob,
        transcript: data.text || '',
        timestamp: new Date().toISOString()
      };
      
      setRecordings(prev => [...prev, newRecording]);
      setTranscripts(prev => [...prev, {
        question: currentQuestion,
        answer: data.text || ''
      }]);
      
      toast.success('Recording saved!');
    } catch (error) {
      console.error('Transcription error:', error);
      toast.error('Failed to transcribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get current question
  const getCurrentQuestion = () => {
    if (selectedPart === 'part2') {
      return selectedTopic?.card || '';
    }
    return selectedTopic?.questions?.[currentQuestionIndex] || '';
  };

  // Get total questions for current part
  const getTotalQuestions = () => {
    if (selectedPart === 'part2') return 1;
    return selectedTopic?.questions?.length || 0;
  };

  // Move to next question
  const nextQuestion = () => {
    const total = getTotalQuestions();
    if (currentQuestionIndex < total - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setAudioBlob(null);
    } else {
      // All questions done, get feedback
      submitForFeedback();
    }
  };

  // Submit all responses for feedback
  const submitForFeedback = async () => {
    if (transcripts.length === 0) {
      toast.error('Please record at least one response.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/speaking-practice/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          part: selectedPart,
          topic: selectedTopic?.topic || selectedTopic?.card,
          responses: transcripts
        })
      });

      if (!response.ok) throw new Error('Evaluation failed');

      const data = await response.json();
      setFeedback(data);
      setView('feedback');
      toast.success('Speaking evaluated successfully!');
    } catch (error) {
      console.error('Evaluation error:', error);
      toast.error('Failed to evaluate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Start practice for a part
  const startPractice = (part, topic) => {
    setSelectedPart(part);
    setSelectedTopic(topic);
    setCurrentQuestionIndex(0);
    setRecordings([]);
    setTranscripts([]);
    setAudioBlob(null);
    setFeedback(null);
    
    if (part === 'part2') {
      setPrepTime(60); // 1 minute prep time
      setIsPreparing(true);
    }
    
    setView('practice');
  };

  // Reset practice
  const resetPractice = () => {
    setView('parts');
    setSelectedPart(null);
    setSelectedTopic(null);
    setCurrentQuestionIndex(0);
    setRecordings([]);
    setTranscripts([]);
    setAudioBlob(null);
    setFeedback(null);
    setIsPreparing(false);
    setIsSpeaking(false);
    setPrepTime(0);
    setSpeakTime(0);
  };

  // Play TTS for question
  const playQuestion = async (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      setPlayingAudio(text);
      utterance.onend = () => setPlayingAudio(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Render part selection
  const renderPartSelection = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Speaking Practice</h1>
        <p className="text-gray-600">Improve your IELTS Speaking with AI evaluation</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {SPEAKING_PARTS.map((part) => {
          const Icon = part.icon;
          return (
            <Card
              key={part.id}
              className="p-6 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1"
              onClick={() => {
                if (part.id === 'full_test') {
                  toast.info('Full mock test coming soon!');
                  return;
                }
                setSelectedPart(part.id);
              }}
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${part.color} flex items-center justify-center mb-4`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{part.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{part.description}</p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" /> {part.duration}
              </div>
              <p className="mt-3 text-xs text-sky-600 bg-sky-50 p-2 rounded">
                💡 {part.tips}
              </p>
            </Card>
          );
        })}
      </div>

      {/* Topic Selection Modal */}
      {selectedPart && selectedPart !== 'full_test' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Choose a topic for {SPEAKING_PARTS.find(p => p.id === selectedPart)?.title}
          </h3>
          <div className="grid gap-3">
            {SPEAKING_QUESTIONS[selectedPart]?.map((topic, idx) => (
              <Button
                key={idx}
                variant="outline"
                className="justify-start h-auto py-3 px-4 text-left"
                onClick={() => startPractice(selectedPart, topic)}
              >
                <span className="font-medium">{topic.topic}</span>
                <ChevronRight className="w-4 h-4 ml-auto" />
              </Button>
            ))}
          </div>
          <Button
            variant="ghost"
            className="mt-4"
            onClick={() => setSelectedPart(null)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </Card>
      )}
    </div>
  );

  // Render practice interface
  const renderPracticeInterface = () => {
    const part = SPEAKING_PARTS.find(p => p.id === selectedPart);
    const currentQuestion = getCurrentQuestion();
    const totalQuestions = getTotalQuestions();
    const hasRecordedCurrent = transcripts.length > currentQuestionIndex;

    return (
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={() => {
            if (window.confirm('Are you sure? Your progress will be lost.')) {
              resetPractice();
            }
          }}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Exit
          </Button>
          
          {/* Timer */}
          {(isPreparing || isSpeaking) && (
            <div className={`px-4 py-2 rounded-lg font-mono text-lg ${
              (isPreparing ? prepTime : speakTime) < 30 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
            }`}>
              <Clock className="w-4 h-4 inline mr-2" />
              {isPreparing ? `Prep: ${formatTime(prepTime)}` : `Speaking: ${formatTime(speakTime)}`}
            </div>
          )}
        </div>

        {/* Part Badge */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${part?.color} flex items-center justify-center`}>
            {part?.icon && <part.icon className="w-5 h-5 text-white" />}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{part?.title}</h2>
            <p className="text-sm text-gray-600">Topic: {selectedTopic?.topic}</p>
          </div>
        </div>

        {/* Progress */}
        {totalQuestions > 1 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Question {currentQuestionIndex + 1} of {totalQuestions}</span>
              <span className="text-sm text-gray-600">{transcripts.length} recorded</span>
            </div>
            <Progress value={((currentQuestionIndex + 1) / totalQuestions) * 100} className="h-2" />
          </div>
        )}

        {/* Question Card */}
        <Card className="p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-sky-600" />
              <span className="text-sm font-medium text-sky-600">Examiner</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => playQuestion(currentQuestion)}
              disabled={playingAudio === currentQuestion}
            >
              <Volume2 className="w-4 h-4" />
            </Button>
          </div>
          
          <p className="text-lg text-gray-800 whitespace-pre-line leading-relaxed">
            {currentQuestion}
          </p>

          {selectedPart === 'part2' && isPreparing && (
            <div className="mt-4 p-3 bg-amber-50 rounded-lg">
              <p className="text-sm text-amber-800">
                ⏱️ You have {formatTime(prepTime)} to prepare. Make notes if needed, then click "Start Speaking".
              </p>
            </div>
          )}
        </Card>

        {/* Recording Controls */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-600">Your Response</span>
          </div>

          <div className="flex flex-col items-center gap-4">
            {!recording ? (
              <Button
                size="lg"
                className={`w-full max-w-xs ${
                  hasRecordedCurrent 
                    ? 'bg-amber-500 hover:bg-amber-600' 
                    : 'primary-gradient'
                } text-white`}
                onClick={startRecording}
                disabled={loading || isPreparing}
              >
                <Mic className="w-5 h-5 mr-2" />
                {hasRecordedCurrent ? 'Re-record' : (selectedPart === 'part2' && prepTime > 0 ? 'Start Speaking' : 'Start Recording')}
              </Button>
            ) : (
              <Button
                size="lg"
                className="w-full max-w-xs bg-red-500 hover:bg-red-600 text-white"
                onClick={stopRecording}
              >
                <Square className="w-5 h-5 mr-2" />
                Stop Recording ({formatTime(speakTime)})
              </Button>
            )}

            {loading && (
              <div className="flex items-center gap-2 text-gray-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                Transcribing...
              </div>
            )}

            {/* Show transcript if available */}
            {hasRecordedCurrent && transcripts[currentQuestionIndex] && (
              <div className="w-full p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Your response:</p>
                <p className="text-gray-800">{transcripts[currentQuestionIndex].answer}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex gap-3">
          {currentQuestionIndex > 0 && (
            <Button
              variant="outline"
              onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Previous
            </Button>
          )}
          
          <div className="flex-1" />
          
          {hasRecordedCurrent && (
            currentQuestionIndex < totalQuestions - 1 ? (
              <Button
                className="primary-gradient text-white"
                onClick={nextQuestion}
              >
                Next Question <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                className="bg-green-500 hover:bg-green-600 text-white"
                onClick={submitForFeedback}
                disabled={loading}
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Evaluating...</>
                ) : (
                  <><Award className="w-4 h-4 mr-2" /> Get Feedback</>
                )}
              </Button>
            )
          )}
        </div>
      </div>
    );
  };

  // Render feedback view
  const renderFeedback = () => {
    if (!feedback) return null;

    const getBandColor = (band) => {
      if (band >= 7) return 'text-green-600 bg-green-100';
      if (band >= 6) return 'text-blue-600 bg-blue-100';
      if (band >= 5) return 'text-amber-600 bg-amber-100';
      return 'text-red-600 bg-red-100';
    };

    return (
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={resetPractice} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Parts
        </Button>

        {/* Overall Score */}
        <Card className="p-6 mb-6 text-center bg-gradient-to-br from-green-50 to-emerald-50">
          <Award className="w-12 h-12 mx-auto text-green-600 mb-3" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Estimated Band Score</h2>
          <div className={`inline-block px-6 py-3 rounded-full text-4xl font-bold ${getBandColor(feedback.overall_band)}`}>
            {feedback.overall_band}
          </div>
        </Card>

        {/* Criterion Scores */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Scores</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { key: 'fluency_coherence', label: 'Fluency & Coherence', desc: 'Speaking smoothly and logically' },
              { key: 'lexical_resource', label: 'Lexical Resource', desc: 'Vocabulary range and usage' },
              { key: 'grammar', label: 'Grammatical Range', desc: 'Grammar variety and accuracy' },
              { key: 'pronunciation', label: 'Pronunciation', desc: 'Clarity and natural speech patterns' }
            ].map((criterion) => (
              <div key={criterion.key} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900">{criterion.label}</span>
                  <span className={`px-2 py-1 rounded text-sm font-bold ${getBandColor(feedback.scores?.[criterion.key] || feedback.overall_band)}`}>
                    {feedback.scores?.[criterion.key] || feedback.overall_band}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{criterion.desc}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Detailed Feedback */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Feedback</h3>
          
          {/* Strengths */}
          <div className="mb-6">
            <h4 className="font-medium text-green-700 mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Strengths
            </h4>
            <ul className="space-y-2">
              {(feedback.strengths || []).map((strength, idx) => (
                <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>

          {/* Areas for Improvement */}
          <div className="mb-6">
            <h4 className="font-medium text-amber-700 mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Areas for Improvement
            </h4>
            <ul className="space-y-2">
              {(feedback.improvements || []).map((improvement, idx) => (
                <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  {improvement}
                </li>
              ))}
            </ul>
          </div>

          {/* Pronunciation Tips */}
          {feedback.pronunciation_tips && (
            <div className="mb-6">
              <h4 className="font-medium text-purple-700 mb-2 flex items-center gap-2">
                <Mic className="w-4 h-4" /> Pronunciation Tips
              </h4>
              <p className="text-sm text-gray-700">{feedback.pronunciation_tips}</p>
            </div>
          )}
        </Card>

        {/* Model Answer */}
        {feedback.model_answer && (
          <Card className="p-6 mb-6 bg-gradient-to-br from-sky-50 to-blue-50 border-sky-200">
            <h3 className="text-lg font-semibold text-sky-800 mb-3 flex items-center gap-2">
              <Lightbulb className="w-5 h-5" /> Sample Model Answer
            </h3>
            <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">
              {feedback.model_answer}
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={resetPractice} className="flex-1">
            <RotateCcw className="w-4 h-4 mr-2" /> Practice Another Topic
          </Button>
          <Button
            className="flex-1 primary-gradient text-white"
            onClick={() => {
              setView('practice');
              setFeedback(null);
              setCurrentQuestionIndex(0);
              setTranscripts([]);
              setRecordings([]);
            }}
          >
            <Mic className="w-4 h-4 mr-2" /> Try Again
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Dashboard
          </Button>
        </div>

        {view === 'parts' && renderPartSelection()}
        {view === 'practice' && renderPracticeInterface()}
        {view === 'feedback' && renderFeedback()}
      </div>
    </div>
  );
}
