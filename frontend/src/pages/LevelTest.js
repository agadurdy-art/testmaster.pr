import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Mic, Square, Play, ChevronRight, CheckCircle, Award, BookOpen, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { useI18n } from '../lib/i18n';

// Reading questions of varying difficulty
const readingQuestions = [
  {
    id: 1,
    level: 'elementary',
    passage: "The weather today is sunny and warm. Many people are going to the park to enjoy the day. Children are playing on the grass while their parents sit on benches.",
    question: "What are the children doing in the park?",
    options: [
      "A) Sitting on benches",
      "B) Playing on the grass",
      "C) Going home",
      "D) Reading books"
    ],
    correct: "B"
  },
  {
    id: 2,
    level: 'pre-intermediate',
    passage: "Scientists have discovered that regular exercise not only improves physical health but also has significant benefits for mental well-being. Studies show that just 30 minutes of moderate exercise can reduce stress and improve mood.",
    question: "According to the passage, what is one benefit of regular exercise?",
    options: [
      "A) It makes you taller",
      "B) It reduces stress",
      "C) It helps you sleep longer",
      "D) It increases appetite"
    ],
    correct: "B"
  },
  {
    id: 3,
    level: 'intermediate',
    passage: "The proliferation of smartphones has fundamentally altered the way humans communicate and access information. While these devices offer unprecedented connectivity, critics argue that excessive screen time may be detrimental to interpersonal relationships and cognitive development, particularly among younger users.",
    question: "What concern do critics have about smartphones?",
    options: [
      "A) They are too expensive",
      "B) They may harm relationships and brain development",
      "C) They don't have enough features",
      "D) They are difficult to use"
    ],
    correct: "B"
  },
  {
    id: 4,
    level: 'upper-intermediate',
    passage: "The phenomenon of confirmation bias—the tendency to seek out information that supports one's existing beliefs while dismissing contradictory evidence—poses a significant challenge to objective decision-making. This cognitive bias is particularly pronounced in politically charged discussions, where individuals often interpret ambiguous information in ways that reinforce their preconceptions.",
    question: "What does confirmation bias cause people to do?",
    options: [
      "A) Accept all information equally",
      "B) Favor information that supports their existing beliefs",
      "C) Avoid making any decisions",
      "D) Change their opinions frequently"
    ],
    correct: "B"
  },
  {
    id: 5,
    level: 'advanced',
    passage: "The epistemological implications of artificial intelligence have sparked considerable debate among philosophers and technologists alike. As machine learning algorithms demonstrate increasingly sophisticated pattern recognition capabilities, questions arise regarding the nature of understanding itself—whether computational processes can be said to 'comprehend' in any meaningful sense, or whether they merely simulate comprehension through statistical correlation.",
    question: "What philosophical question does AI raise according to the passage?",
    options: [
      "A) Whether computers will replace humans",
      "B) Whether machines can truly understand or just imitate understanding",
      "C) How to make AI more affordable",
      "D) When AI was first invented"
    ],
    correct: "B"
  }
];

// Speaking prompts
const speakingPrompts = [
  {
    id: 1,
    level: 'general',
    prompt: "Please introduce yourself briefly. Tell me your name, where you're from, and what you do (work or study).",
    duration: 60,
    tip: "Speak naturally for about 30-60 seconds"
  },
  {
    id: 2,
    level: 'ielts',
    prompt: "Describe a skill you would like to learn. You should say: what the skill is, why you want to learn it, how you would learn it, and explain how this skill would benefit you.",
    duration: 120,
    tip: "Try to speak for 1-2 minutes, covering all points"
  }
];

export default function LevelTest({ user }) {
  const navigate = useNavigate();
  const { t } = useI18n();
  
  const [stage, setStage] = useState('intro'); // intro, reading, speaking, evaluating, results
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [readingAnswers, setReadingAnswers] = useState({});
  const [currentSpeakingPrompt, setCurrentSpeakingPrompt] = useState(0);
  const [speakingResponses, setSpeakingResponses] = useState([]);
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcribing, setTranscribing] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [results, setResults] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);

  const handleReadingAnswer = (questionId, answer) => {
    setReadingAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const nextReadingQuestion = () => {
    if (currentQuestion < readingQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setStage('speaking');
    }
  };

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
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
        
        // Transcribe the audio
        await transcribeAudio(blob);
      };

      mediaRecorder.start();
      setRecording(true);
      toast.info('Recording started... Speak now!');
    } catch (error) {
      console.error('Microphone error:', error);
      toast.error('Failed to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      toast.success('Recording stopped');
    }
  };

  const transcribeAudio = async (blob) => {
    setTranscribing(true);
    try {
      const formData = new FormData();
      formData.append('file', new File([blob], 'recording.webm', { type: 'audio/webm' }));
      
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/speaking/transcribe`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Transcription failed');
      
      const data = await response.json();
      setCurrentTranscript(data.text || '');
      toast.success('Audio transcribed!');
    } catch (error) {
      console.error('Transcription error:', error);
      toast.error('Failed to transcribe. You can type your response instead.');
    } finally {
      setTranscribing(false);
    }
  };

  const saveSpeakingResponse = () => {
    if (!currentTranscript.trim()) {
      toast.error('Please record or type your response first');
      return;
    }
    
    setSpeakingResponses(prev => [...prev, {
      promptId: speakingPrompts[currentSpeakingPrompt].id,
      prompt: speakingPrompts[currentSpeakingPrompt].prompt,
      response: currentTranscript
    }]);
    
    if (currentSpeakingPrompt < speakingPrompts.length - 1) {
      setCurrentSpeakingPrompt(currentSpeakingPrompt + 1);
      setCurrentTranscript('');
      setAudioBlob(null);
    } else {
      evaluateLevel();
    }
  };

  const evaluateLevel = async () => {
    setStage('evaluating');
    setEvaluating(true);
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/level-test/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          reading_answers: readingAnswers,
          reading_questions: readingQuestions.map(q => ({
            id: q.id,
            level: q.level,
            correct: q.correct
          })),
          speaking_responses: [...speakingResponses, {
            promptId: speakingPrompts[currentSpeakingPrompt].id,
            prompt: speakingPrompts[currentSpeakingPrompt].prompt,
            response: currentTranscript
          }]
        })
      });
      
      if (!response.ok) throw new Error('Evaluation failed');
      
      const data = await response.json();
      setResults(data);
      setStage('results');
    } catch (error) {
      console.error('Evaluation error:', error);
      toast.error('Failed to evaluate. Please try again.');
      setStage('speaking');
    } finally {
      setEvaluating(false);
    }
  };

  const getLevelColor = (level) => {
    const colors = {
      'Beginner': 'bg-gray-500',
      'Elementary': 'bg-blue-400',
      'Pre-Intermediate': 'bg-blue-500',
      'Intermediate': 'bg-green-500',
      'Upper-Intermediate': 'bg-yellow-500',
      'Advanced': 'bg-orange-500',
      'IELTS Ready': 'bg-red-500'
    };
    return colors[level] || 'bg-sky-500';
  };

  const getLevelBand = (level) => {
    const bands = {
      'Beginner': '3.0-3.5',
      'Elementary': '4.0-4.5',
      'Pre-Intermediate': '5.0-5.5',
      'Intermediate': '5.5-6.0',
      'Upper-Intermediate': '6.0-6.5',
      'Advanced': '7.0-7.5',
      'IELTS Ready': '7.5+'
    };
    return bands[level] || '5.0-6.0';
  };

  // Render different stages
  if (stage === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-sky-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">English Level Test</h1>
              <p className="text-gray-600">Discover your English proficiency level in just 5-7 minutes</p>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Reading Section</h3>
                  <p className="text-sm text-gray-600">5 questions of increasing difficulty</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg">
                <MessageSquare className="w-6 h-6 text-green-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Speaking Section</h3>
                  <p className="text-sm text-gray-600">2 speaking prompts to assess fluency</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-purple-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">AI Evaluation</h3>
                  <p className="text-sm text-gray-600">Get personalized recommendations based on your level</p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="flex-1"
              >
                Back to Dashboard
              </Button>
              <Button
                onClick={() => setStage('reading')}
                className="flex-1 primary-gradient text-white"
              >
                Start Test
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (stage === 'reading') {
    const question = readingQuestions[currentQuestion];
    const progress = ((currentQuestion + 1) / readingQuestions.length) * 50; // Reading is 50% of total
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Reading Section</span>
              <span className="text-sm text-gray-500">Question {currentQuestion + 1} of {readingQuestions.length}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          <Card className="p-6">
            <div className="mb-6">
              <span className="inline-block px-3 py-1 bg-sky-100 text-sky-700 text-xs font-medium rounded-full mb-4">
                {question.level.charAt(0).toUpperCase() + question.level.slice(1)} Level
              </span>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-gray-700 leading-relaxed">{question.passage}</p>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{question.question}</h3>
            </div>
            
            <div className="space-y-3 mb-6">
              {question.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleReadingAnswer(question.id, option.charAt(0))}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                    readingAnswers[question.id] === option.charAt(0)
                      ? 'border-sky-500 bg-sky-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => currentQuestion > 0 && setCurrentQuestion(currentQuestion - 1)}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>
              <Button
                onClick={nextReadingQuestion}
                disabled={!readingAnswers[question.id]}
                className="primary-gradient text-white"
              >
                {currentQuestion === readingQuestions.length - 1 ? 'Continue to Speaking' : 'Next Question'}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (stage === 'speaking') {
    const prompt = speakingPrompts[currentSpeakingPrompt];
    const progress = 50 + ((currentSpeakingPrompt + 1) / speakingPrompts.length) * 50; // Speaking is second 50%
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Speaking Section</span>
              <span className="text-sm text-gray-500">Prompt {currentSpeakingPrompt + 1} of {speakingPrompts.length}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          <Card className="p-6">
            <div className="mb-6">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{prompt.prompt}</h3>
                <p className="text-sm text-gray-600">💡 Tip: {prompt.tip}</p>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex gap-3 justify-center">
                {!recording ? (
                  <Button
                    onClick={startRecording}
                    className="primary-gradient text-white"
                    disabled={transcribing}
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    Start Recording
                  </Button>
                ) : (
                  <Button
                    onClick={stopRecording}
                    className="bg-red-500 text-white hover:bg-red-600"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    Stop Recording
                  </Button>
                )}
                
                {audioBlob && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (audioRef.current) {
                        audioRef.current.src = URL.createObjectURL(audioBlob);
                        audioRef.current.play();
                      }
                    }}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Play Back
                  </Button>
                )}
              </div>
              
              <audio ref={audioRef} className="hidden" />
              
              {transcribing && (
                <div className="text-center text-gray-600">
                  <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  Transcribing your response...
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your response (you can also type or edit):
                </label>
                <textarea
                  value={currentTranscript}
                  onChange={(e) => setCurrentTranscript(e.target.value)}
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  placeholder="Your spoken response will appear here, or you can type directly..."
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button
                onClick={saveSpeakingResponse}
                disabled={!currentTranscript.trim() || transcribing}
                className="primary-gradient text-white"
              >
                {currentSpeakingPrompt === speakingPrompts.length - 1 ? 'Finish & Get Results' : 'Next Prompt'}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (stage === 'evaluating') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Analyzing Your Responses</h2>
          <p className="text-gray-600">Our AI is evaluating your reading comprehension and speaking skills...</p>
        </Card>
      </div>
    );
  }

  if (stage === 'results' && results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8">
            <div className="text-center mb-8">
              <div className={`w-24 h-24 ${getLevelColor(results.level)} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <Award className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Your English Level</h1>
              <div className={`inline-block px-6 py-2 ${getLevelColor(results.level)} text-white text-xl font-bold rounded-full mb-2`}>
                {results.level}
              </div>
              <p className="text-gray-600">Estimated IELTS Band: {getLevelBand(results.level)}</p>
            </div>
            
            <div className="space-y-6 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">📖 Reading Score</h3>
                <p className="text-blue-800">{results.reading_score}/5 correct</p>
                <p className="text-sm text-blue-700 mt-1">{results.reading_feedback}</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">🎤 Speaking Assessment</h3>
                <p className="text-sm text-green-800 whitespace-pre-line">{results.speaking_feedback}</p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-2">📚 Recommended Tests</h3>
                <ul className="space-y-2">
                  {results.recommendations?.map((rec, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-purple-800">
                      <CheckCircle className="w-4 h-4 text-purple-600" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  setStage('intro');
                  setCurrentQuestion(0);
                  setReadingAnswers({});
                  setCurrentSpeakingPrompt(0);
                  setSpeakingResponses([]);
                  setCurrentTranscript('');
                  setResults(null);
                }}
                className="flex-1"
              >
                Take Test Again
              </Button>
              <Button
                onClick={() => navigate('/dashboard')}
                className="flex-1 primary-gradient text-white"
              >
                Go to Dashboard
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}
