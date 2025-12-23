import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { 
  Mic, Square, Play, ChevronRight, CheckCircle, Award, BookOpen, 
  MessageSquare, ArrowLeft, Target, Sparkles, Clock, Brain, Zap,
  Trophy, TrendingUp, AlertCircle, Lightbulb
} from 'lucide-react';
import { toast } from 'sonner';
import { useI18n } from '../lib/i18n';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// ENHANCED READING QUESTIONS - 10 questions covering Band 2.0 to 9.0
const readingQuestions = [
  // Band 2.0-3.0 (Elementary)
  {
    id: 1,
    level: 'A1',
    band: 2.5,
    passage: "My name is John. I am a teacher. I work at a school. I like my job. I have many students.",
    question: "What is John's job?",
    options: ["A) Doctor", "B) Teacher", "C) Student", "D) Driver"],
    correct: "B",
    skill: "basic_comprehension"
  },
  {
    id: 2,
    level: 'A1',
    band: 3.0,
    passage: "The library opens at 9:00 AM and closes at 6:00 PM every day except Sunday. On Sunday, it is closed.",
    question: "When is the library closed?",
    options: ["A) Monday", "B) Saturday", "C) Sunday", "D) Every day"],
    correct: "C",
    skill: "time_information"
  },
  
  // Band 3.5-4.5 (Pre-intermediate)
  {
    id: 3,
    level: 'A2',
    band: 4.0,
    passage: "Sarah goes to the gym three times a week to stay healthy. She usually runs for 30 minutes and then does some exercises. After her workout, she feels energetic and happy.",
    question: "How often does Sarah go to the gym?",
    options: ["A) Every day", "B) Once a week", "C) Three times a week", "D) Twice a month"],
    correct: "C",
    skill: "frequency_detail"
  },
  {
    id: 4,
    level: 'A2',
    band: 4.5,
    passage: "Scientists have discovered that regular exercise not only improves physical health but also has significant benefits for mental well-being. Studies show that just 30 minutes of moderate exercise can reduce stress and improve mood.",
    question: "According to the passage, what is one benefit of regular exercise?",
    options: ["A) It makes you taller", "B) It reduces stress", "C) It helps you sleep longer", "D) It increases appetite"],
    correct: "B",
    skill: "detail_comprehension"
  },
  
  // Band 5.0-5.5 (Intermediate)
  {
    id: 5,
    level: 'B1',
    band: 5.0,
    passage: "Remote work has become increasingly popular in recent years, offering employees flexibility and eliminating commute time. However, it also presents challenges such as maintaining work-life balance and staying connected with colleagues. Companies must adapt their management strategies to support remote teams effectively.",
    question: "What challenge does remote work present according to the passage?",
    options: [
      "A) Higher salary costs",
      "B) Difficulty maintaining work-life balance",
      "C) Increased office space needs",
      "D) More vacation time required"
    ],
    correct: "B",
    skill: "inference"
  },
  {
    id: 6,
    level: 'B1',
    band: 5.5,
    passage: "The proliferation of smartphones has fundamentally altered the way humans communicate and access information. While these devices offer unprecedented connectivity, critics argue that excessive screen time may be detrimental to interpersonal relationships and cognitive development, particularly among younger users.",
    question: "What concern do critics have about smartphones?",
    options: [
      "A) They are too expensive",
      "B) They may harm relationships and brain development",
      "C) They don't have enough features",
      "D) They are difficult to use"
    ],
    correct: "B",
    skill: "critical_analysis"
  },
  
  // Band 6.0-6.5 (Upper-intermediate)
  {
    id: 7,
    level: 'B2',
    band: 6.0,
    passage: "The phenomenon of confirmation bias—the tendency to seek out information that supports one's existing beliefs while dismissing contradictory evidence—poses a significant challenge to objective decision-making. This cognitive bias is particularly pronounced in politically charged discussions, where individuals often interpret ambiguous information in ways that reinforce their preconceptions.",
    question: "What does confirmation bias cause people to do?",
    options: [
      "A) Accept all information equally",
      "B) Favor information that supports their existing beliefs",
      "C) Avoid making any decisions",
      "D) Change their opinions frequently"
    ],
    correct: "B",
    skill: "complex_inference"
  },
  {
    id: 8,
    level: 'B2',
    band: 6.5,
    passage: "Contemporary urban planning faces the paradox of simultaneously accommodating population growth while preserving environmental sustainability. Innovative solutions such as vertical gardens, green roofs, and mixed-use developments represent attempts to reconcile these competing demands, though their long-term efficacy remains subject to empirical validation.",
    question: "What challenge do urban planners face?",
    options: [
      "A) Finding enough construction workers",
      "B) Balancing population growth with environmental protection",
      "C) Reducing traffic congestion",
      "D) Building taller buildings"
    ],
    correct: "B",
    skill: "paradox_understanding"
  },
  
  // Band 7.0-8.0 (Advanced)
  {
    id: 9,
    level: 'C1',
    band: 7.5,
    passage: "The epistemological implications of artificial intelligence have sparked considerable debate among philosophers and technologists alike. As machine learning algorithms demonstrate increasingly sophisticated pattern recognition capabilities, questions arise regarding the nature of understanding itself—whether computational processes can be said to 'comprehend' in any meaningful sense, or whether they merely simulate comprehension through statistical correlation.",
    question: "What philosophical question does AI raise according to the passage?",
    options: [
      "A) Whether computers will replace humans",
      "B) Whether machines can truly understand or just imitate understanding",
      "C) How to make AI more affordable",
      "D) When AI was first invented"
    ],
    correct: "B",
    skill: "abstract_reasoning"
  },
  {
    id: 10,
    level: 'C2',
    band: 8.5,
    passage: "The reification of abstract concepts in contemporary discourse often obscures rather than illuminates substantive analysis. When complex socioeconomic phenomena are reduced to simplistic metaphors or personified as autonomous agents, the resultant narrative frameworks can inadvertently perpetuate cognitive distortions that impede nuanced understanding and forestall pragmatic solutions.",
    question: "According to the passage, what problem occurs when complex ideas are oversimplified?",
    options: [
      "A) They become easier for everyone to understand",
      "B) They create misleading frameworks that prevent proper understanding",
      "C) They help people make better decisions",
      "D) They encourage more research"
    ],
    correct: "B",
    skill: "sophisticated_analysis"
  }
];

// ENHANCED SPEAKING PROMPTS - 3 questions covering A1 to C2
const speakingPrompts = [
  {
    id: 1,
    level: 'A1-A2',
    band: '2.0-4.5',
    prompt: "Tell me about yourself. What is your name? Where are you from? What do you do every day?",
    duration: 60,
    tip: "Speak naturally for about 45-60 seconds. Use simple sentences.",
    criteria: ['basic_fluency', 'pronunciation', 'basic_vocabulary']
  },
  {
    id: 2,
    level: 'B1-B2',
    band: '5.0-6.5',
    prompt: "Describe a place you like to visit in your city or country. Where is it? What can you do there? Why do you like it?",
    duration: 120,
    tip: "Try to speak for 1.5-2 minutes. Use descriptive language and explain your reasons.",
    criteria: ['fluency', 'vocabulary_range', 'grammar_accuracy', 'coherence']
  },
  {
    id: 3,
    level: 'C1-C2',
    band: '7.0-9.0',
    prompt: "Some people believe that technology is making us more isolated, while others think it brings us closer together. What is your opinion? Provide reasons and examples to support your view.",
    duration: 150,
    tip: "Speak for 2-2.5 minutes. Develop your argument with clear reasoning and examples.",
    criteria: ['fluency', 'advanced_vocabulary', 'complex_grammar', 'argumentation', 'cohesion']
  }
];

export default function ComprehensiveLevelTest({ user }) {
  const navigate = useNavigate();
  const { t, language } = useI18n();  // Get language from i18n context
  
  // Stage management
  const [stage, setStage] = useState('intro'); // intro, reading, speaking, evaluating, results
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [readingAnswers, setReadingAnswers] = useState({});
  const [currentSpeakingPrompt, setCurrentSpeakingPrompt] = useState(0);
  const [speakingResponses, setSpeakingResponses] = useState([]);
  
  // Recording state
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcribing, setTranscribing] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  
  // Results
  const [results, setResults] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  
  // Timer for speaking
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);

  // Speaking timer
  useEffect(() => {
    if (timerActive && timeRemaining > 0) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && timerActive) {
      if (recording) {
        stopRecording();
      }
    }
  }, [timerActive, timeRemaining, recording]);

  const handleReadingAnswer = (questionId, answer) => {
    setReadingAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const nextReadingQuestion = () => {
    if (!readingAnswers[readingQuestions[currentQuestion].id]) {
      toast.error('Please select an answer before continuing');
      return;
    }
    
    if (currentQuestion < readingQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setStage('speaking');
      setCurrentSpeakingPrompt(0);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      
      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        await transcribeAudio(blob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setRecording(true);
      setTimerActive(true);
      setTimeRemaining(speakingPrompts[currentSpeakingPrompt].duration);
      toast.success('Recording started...');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      setTimerActive(false);
    }
  };

  const transcribeAudio = async (blob) => {
    setTranscribing(true);
    const formData = new FormData();
    formData.append('file', blob, 'audio.webm');

    try {
      const response = await fetch(`${API_URL}/api/speaking/transcribe`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) throw new Error('Transcription failed');
      
      const data = await response.json();
      setCurrentTranscript(data.text);
      
      // Save response
      const updatedResponses = [...speakingResponses];
      updatedResponses[currentSpeakingPrompt] = {
        prompt: speakingPrompts[currentSpeakingPrompt].prompt,
        transcript: data.text,
        audio: blob,
        level: speakingPrompts[currentSpeakingPrompt].level
      };
      setSpeakingResponses(updatedResponses);
      
      toast.success('Transcription complete!');
    } catch (error) {
      console.error('Transcription error:', error);
      toast.error('Failed to transcribe audio. Please try again.');
    } finally {
      setTranscribing(false);
    }
  };

  const nextSpeakingPrompt = () => {
    if (!speakingResponses[currentSpeakingPrompt]) {
      toast.error('Please record your response before continuing');
      return;
    }
    
    if (currentSpeakingPrompt < speakingPrompts.length - 1) {
      setCurrentSpeakingPrompt(currentSpeakingPrompt + 1);
      setAudioBlob(null);
      setCurrentTranscript('');
    } else {
      evaluateTest();
    }
  };

  const evaluateTest = async () => {
    try {
      // Calculate reading score immediately
      let readingCorrect = 0;
      let totalReadingPoints = 0;
      let skillBreakdown = {};

      readingQuestions.forEach(q => {
        const userAnswer = readingAnswers[q.id];
        const isCorrect = userAnswer === q.correct;
        
        if (isCorrect) {
          readingCorrect++;
          totalReadingPoints += q.band;
        }
        
        if (!skillBreakdown[q.skill]) {
          skillBreakdown[q.skill] = { correct: 0, total: 0 };
        }
        skillBreakdown[q.skill].total++;
        if (isCorrect) skillBreakdown[q.skill].correct++;
      });

      const readingBand = totalReadingPoints / readingQuestions.length;

      // Show reading results immediately with loading state for speaking
      setResults({
        overall_band: null, // Will be calculated after speaking
        reading: {
          band: readingBand,
          correct: readingCorrect,
          total: readingQuestions.length,
          skill_breakdown: skillBreakdown
        },
        speaking: null, // Still evaluating
        recommendations: null // Still evaluating
      });
      
      setStage('results');
      setEvaluating(true);

      // Evaluate speaking in background
      const speakingEvaluationResponse = await fetch(`${API_URL}/api/level-test/evaluate-speaking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responses: speakingResponses.map(r => ({
            level: r.level,
            transcript: r.transcript
          })),
          language: language
        })
      });

      if (!speakingEvaluationResponse.ok) throw new Error('Speaking evaluation failed');
      
      const speakingEval = await speakingEvaluationResponse.json();
      const overallBand = (readingBand + speakingEval.overall_band) / 2;

      // Get course recommendations
      const recommendationsResponse = await fetch(`${API_URL}/api/level-test/recommend-courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          overall_band: overallBand,
          reading_band: readingBand,
          speaking_band: speakingEval.overall_band,
          weaknesses: speakingEval.weaknesses,
          skill_breakdown: skillBreakdown,
          language: language
        })
      });

      if (!recommendationsResponse.ok) throw new Error('Failed to get recommendations');
      
      const recommendations = await recommendationsResponse.json();

      // Update with complete results
      setResults({
        overall_band: overallBand,
        reading: {
          band: readingBand,
          correct: readingCorrect,
          total: readingQuestions.length,
          skill_breakdown: skillBreakdown
        },
        speaking: speakingEval,
        recommendations: recommendations
      });

    } catch (error) {
      console.error('Evaluation error:', error);
      toast.error('Failed to evaluate test. Please try again.');
      setStage('speaking');
    } finally {
      setEvaluating(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (stage === 'reading') {
      return ((currentQuestion + 1) / readingQuestions.length) * 50; // Reading is 50% of test
    } else if (stage === 'speaking') {
      return 50 + ((currentSpeakingPrompt + 1) / speakingPrompts.length) * 50; // Speaking is other 50%
    }
    return 0;
  };

  // INTRO SCREEN
  if (stage === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-blue-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          <Card className="p-8 bg-white shadow-xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 mb-4">
                <Target className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Comprehensive Level Assessment
              </h1>
              <p className="text-gray-600 text-lg">
                Discover your true English level in 10-15 minutes
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-0">
                <div className="flex items-center gap-3 mb-3">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                  <h3 className="font-bold text-gray-900">Reading Assessment</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>10 questions (5-7 minutes)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Progressive difficulty (Band 2.0-9.0)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Tests comprehension & analysis skills</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-0">
                <div className="flex items-center gap-3 mb-3">
                  <Mic className="w-6 h-6 text-purple-600" />
                  <h3 className="font-bold text-gray-900">Speaking Assessment</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>3 questions (5-8 minutes)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>AI-powered evaluation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Pronunciation, fluency, vocabulary & grammar</span>
                  </li>
                </ul>
              </Card>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-900">
                  <p className="font-semibold mb-1">What you'll receive:</p>
                  <ul className="space-y-1 ml-4 list-disc">
                    <li>Your IELTS band equivalent (2.0-9.0)</li>
                    <li>Detailed skill breakdown & weaknesses</li>
                    <li>Personalized course recommendations</li>
                    <li>Custom learning roadmap to reach your target</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setStage('reading')}
              size="lg"
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white py-6 text-lg"
            >
              Start Assessment
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // READING SECTION
  if (stage === 'reading') {
    const currentQ = readingQuestions[currentQuestion];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Reading Assessment - Question {currentQuestion + 1} of {readingQuestions.length}
              </span>
              <span className="text-sm font-medium text-blue-600">
                Level: {currentQ.level}
              </span>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </div>

          <Card className="p-8 bg-white shadow-xl">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-700">Reading Passage</h3>
              </div>
              <p className="text-gray-800 leading-relaxed text-lg">
                {currentQ.passage}
              </p>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                {currentQ.question}
              </h3>
              <div className="space-y-3">
                {currentQ.options.map((option) => {
                  const optionLetter = option.charAt(0);
                  const isSelected = readingAnswers[currentQ.id] === optionLetter;
                  
                  return (
                    <button
                      key={option}
                      onClick={() => handleReadingAnswer(currentQ.id, optionLetter)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                      }`}
                    >
                      <span className={`font-medium ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                        {option}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <Button
                onClick={nextReadingQuestion}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!readingAnswers[currentQ.id]}
              >
                {currentQuestion < readingQuestions.length - 1 ? 'Next Question' : 'Continue to Speaking'}
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // SPEAKING SECTION  
  if (stage === 'speaking') {
    const currentPrompt = speakingPrompts[currentSpeakingPrompt];
    const hasResponse = speakingResponses[currentSpeakingPrompt];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Speaking Assessment - Question {currentSpeakingPrompt + 1} of {speakingPrompts.length}
              </span>
              <span className="text-sm font-medium text-purple-600">
                Level: {currentPrompt.level}
              </span>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </div>

          <Card className="p-8 bg-white shadow-xl">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-700">Speaking Prompt</h3>
              </div>
              <p className="text-gray-900 text-lg leading-relaxed mb-4">
                {currentPrompt.prompt}
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-purple-50 p-3 rounded-lg">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>{currentPrompt.tip}</span>
              </div>
            </div>

            {recording && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-red-700 font-medium">Recording...</span>
                  </div>
                  <div className="flex items-center gap-2 text-red-700 font-mono">
                    <Clock className="w-4 h-4" />
                    {formatTime(timeRemaining)}
                  </div>
                </div>
              </div>
            )}

            {transcribing && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
                  <span className="text-blue-700 font-medium">Transcribing your response...</span>
                </div>
              </div>
            )}

            {currentTranscript && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Your Response:
                </h4>
                <p className="text-green-800 text-sm leading-relaxed">
                  {currentTranscript}
                </p>
              </div>
            )}

            <div className="flex gap-4">
              {!recording && !hasResponse && (
                <Button
                  onClick={startRecording}
                  size="lg"
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                >
                  <Mic className="w-5 h-5 mr-2" />
                  Start Recording
                </Button>
              )}
              
              {recording && (
                <Button
                  onClick={stopRecording}
                  size="lg"
                  className="flex-1 bg-gray-800 hover:bg-gray-900 text-white"
                >
                  <Square className="w-5 h-5 mr-2" />
                  Stop Recording
                </Button>
              )}

              {hasResponse && (
                <Button
                  onClick={nextSpeakingPrompt}
                  size="lg"
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {currentSpeakingPrompt < speakingPrompts.length - 1 ? 'Next Question' : 'Complete Assessment'}
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // EVALUATING SCREEN
  if (stage === 'evaluating') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-blue-50 flex items-center justify-center px-4">
        <Card className="p-12 max-w-md w-full bg-white shadow-2xl text-center relative overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-blue-500/10 animate-pulse" />
          
          <div className="relative z-10">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 mb-4 animate-pulse shadow-lg">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {language === 'vi' ? 'Đang phân tích kết quả của bạn' : 
                 language === 'tr' ? 'Performansınız analiz ediliyor' :
                 'Analyzing Your Performance'}
              </h2>
              <p className="text-gray-600">
                {language === 'vi' ? 'AI của chúng tôi đang đánh giá câu trả lời của bạn và chuẩn bị kết quả chi tiết...' :
                 language === 'tr' ? 'Yapay zekamız yanıtlarınızı değerlendiriyor ve kişiselleştirilmiş sonuçlarınızı hazırlıyor...' :
                 'Our AI is evaluating your responses and preparing your personalized results...'}
              </p>
            </div>
            
            {/* Progress indicator */}
            <div className="mb-6">
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div className="bg-gradient-to-r from-violet-500 to-purple-600 h-2 rounded-full animate-pulse" style={{ width: '75%' }} />
              </div>
            </div>
            
            <div className="space-y-3 text-left text-sm text-gray-600">
              <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span>
                  {language === 'vi' ? 'Tính điểm đọc hiểu' :
                   language === 'tr' ? 'Okuma puanı hesaplanıyor' :
                   'Calculating reading comprehension score'}
                </span>
              </div>
              <div className="flex items-center gap-3 bg-purple-50 p-3 rounded-lg">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
                <span>
                  {language === 'vi' ? 'Đánh giá độ trôi chảy và phát âm' :
                   language === 'tr' ? 'Akıcılık ve telaffuz değerlendiriliyor' :
                   'Evaluating speaking fluency & pronunciation'}
                </span>
              </div>
              <div className="flex items-center gap-3 bg-pink-50 p-3 rounded-lg">
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }} />
                <span>
                  {language === 'vi' ? 'Tạo đề xuất khóa học' :
                   language === 'tr' ? 'Kurs önerileri oluşturuluyor' :
                   'Generating course recommendations'}
                </span>
              </div>
            </div>
            
            <div className="mt-6 text-xs text-gray-500">
              {language === 'vi' ? 'Điều này có thể mất 30-60 giây...' :
               language === 'tr' ? 'Bu 30-60 saniye sürebilir...' :
               'This may take 30-60 seconds...'}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // RESULTS SCREEN
  if (stage === 'results' && results) {
    const getBandColor = (band) => {
      if (band >= 8.0) return 'from-green-500 to-emerald-600';
      if (band >= 7.0) return 'from-blue-500 to-cyan-600';
      if (band >= 6.0) return 'from-indigo-500 to-purple-600';
      if (band >= 5.0) return 'from-violet-500 to-purple-600';
      if (band >= 4.0) return 'from-amber-500 to-orange-600';
      return 'from-red-500 to-rose-600';
    };

    const getBandLabel = (band) => {
      if (band >= 8.0) return 'Excellent';
      if (band >= 7.0) return 'Very Good';
      if (band >= 6.0) return 'Competent';
      if (band >= 5.0) return 'Modest';
      if (band >= 4.0) return 'Limited';
      return 'Basic';
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-blue-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 mb-4">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Your Comprehensive Assessment Results
            </h1>
            <p className="text-gray-600 text-lg">
              Detailed analysis of your English proficiency level
            </p>
          </div>

          {/* Overall Band Score - Hero Card */}
          <Card className={`p-8 bg-gradient-to-br ${getBandColor(results.overall_band)} text-white shadow-2xl mb-8`}>
            <div className="text-center">
              <p className="text-white/90 text-lg mb-2">Your Overall IELTS Band</p>
              <div className="text-7xl font-bold mb-2">
                {results.overall_band.toFixed(1)}
              </div>
              <p className="text-2xl font-semibold text-white/95 mb-4">
                {getBandLabel(results.overall_band)} - {results.speaking.cefr_level || 'B1'}
              </p>
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mt-6">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                  <BookOpen className="w-6 h-6 mx-auto mb-2" />
                  <p className="text-sm text-white/80">Reading</p>
                  <p className="text-2xl font-bold">{results.reading.band.toFixed(1)}</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                  <Mic className="w-6 h-6 mx-auto mb-2" />
                  <p className="text-sm text-white/80">Speaking</p>
                  <p className="text-2xl font-bold">{results.speaking.overall_band.toFixed(1)}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Detailed Breakdown */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Reading Skills */}
            <Card className="p-6 bg-white shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Reading Performance
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Score</span>
                    <span className="text-sm font-bold text-blue-600">
                      {results.reading.correct}/{results.reading.total} correct
                    </span>
                  </div>
                  <Progress value={(results.reading.correct / results.reading.total) * 100} className="h-2" />
                </div>
                
                <div className="pt-2 border-t">
                  <h4 className="font-semibold text-gray-700 mb-2 text-sm">Skill Breakdown:</h4>
                  <div className="space-y-2">
                    {Object.entries(results.reading.skill_breakdown).map(([skill, data]) => {
                      const percentage = (data.correct / data.total) * 100;
                      return (
                        <div key={skill} className="text-xs">
                          <div className="flex justify-between mb-1">
                            <span className="text-gray-600 capitalize">{skill.replace(/_/g, ' ')}</span>
                            <span className="font-medium">{data.correct}/{data.total}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className={`h-1.5 rounded-full ${percentage >= 70 ? 'bg-green-500' : percentage >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Card>

            {/* Speaking Skills */}
            <Card className="p-6 bg-white shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Mic className="w-5 h-5 text-purple-600" />
                Speaking Performance
              </h3>
              <div className="space-y-3">
                {results.speaking.criteria_scores && Object.entries(results.speaking.criteria_scores).map(([criterion, score]) => (
                  <div key={criterion}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {criterion.replace(/_/g, ' ')}
                      </span>
                      <span className="text-sm font-bold text-purple-600">{score.toFixed(1)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full bg-gradient-to-r ${getBandColor(score)}`}
                        style={{ width: `${(score / 9) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Strengths */}
            <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-0">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Your Strengths
              </h3>
              <ul className="space-y-3">
                {results.speaking.strengths.map((strength, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                    <Sparkles className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Areas for Improvement */}
            <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-0">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-600" />
                Areas to Improve
              </h3>
              <ul className="space-y-3">
                {results.speaking.weaknesses.map((weakness, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                    <TrendingUp className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span>{weakness}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Detailed Feedback */}
          {results.speaking.detailed_feedback && (
            <Card className="p-6 bg-white shadow-lg mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-600" />
                Comprehensive Analysis
              </h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {results.speaking.detailed_feedback}
              </p>
            </Card>
          )}

          {/* Improvement Recommendations */}
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-0 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-blue-600" />
              Action Plan: How to Improve
            </h3>
            <div className="space-y-4">
              {results.speaking.improvement_recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-white p-4 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </div>
                  <p className="text-gray-700 text-sm pt-1">{rec}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Course Recommendations */}
          {results.recommendations && (
            <>
              <Card className="p-8 bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-2xl mb-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Award className="w-6 h-6" />
                  Recommended Courses for You
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {results.recommendations.recommended_courses.map((course, idx) => (
                    <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-bold">
                          {course.priority}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold mb-2">{course.name}</h3>
                      <p className="text-white/80 text-sm mb-2">{course.band_range}</p>
                      <p className="text-white/90 mb-4">{course.reason}</p>
                      <Button
                        onClick={() => navigate(`/lesson-preview/${course.id}`)}
                        className="w-full bg-white text-violet-600 hover:bg-gray-100"
                      >
                        Explore Course
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Learning Roadmap */}
              {results.recommendations.learning_roadmap && (
                <Card className="p-8 bg-white shadow-lg mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Target className="w-6 h-6 text-violet-600" />
                    Your Personalized Learning Roadmap
                  </h3>
                  
                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-violet-50 p-4 rounded-lg text-center">
                      <p className="text-sm text-gray-600 mb-1">Current Band</p>
                      <p className="text-3xl font-bold text-violet-600">{results.overall_band.toFixed(1)}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <p className="text-sm text-gray-600 mb-1">Target Band</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {results.recommendations.learning_roadmap.target_band?.toFixed(1) || (results.overall_band + 1.0).toFixed(1)}
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <p className="text-sm text-gray-600 mb-1">Timeline</p>
                      <p className="text-3xl font-bold text-green-600">
                        {results.recommendations.learning_roadmap.estimated_weeks || 12} weeks
                      </p>
                    </div>
                  </div>

                  {results.recommendations.learning_roadmap.milestone_goals && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">Milestone Goals:</h4>
                      {results.recommendations.learning_roadmap.milestone_goals.map((milestone, idx) => (
                        <div key={idx} className="flex items-start gap-4 border-l-4 border-violet-500 pl-4 py-2">
                          <div className="flex-shrink-0">
                            <Clock className="w-5 h-5 text-violet-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">Week {milestone.weeks}</p>
                            <p className="text-sm text-gray-600">{milestone.goal}</p>
                            <p className="text-sm font-semibold text-violet-600 mt-1">
                              Target: Band {milestone.band_target?.toFixed(1)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              )}

              {/* Immediate Actions */}
              <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-0 mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-green-600" />
                  Start Today: Immediate Actions
                </h3>
                <ul className="space-y-3">
                  {results.recommendations.immediate_actions.map((action, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{action}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!user && (
              <Button
                onClick={() => navigate('/register')}
                size="lg"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                <Award className="w-5 h-5 mr-2" />
                Sign Up to Save Your Results
              </Button>
            )}
            <Button
              onClick={() => navigate('/practice')}
              size="lg"
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
            >
              Start Practice Tests
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              onClick={() => navigate(user ? '/dashboard' : '/login')}
              size="lg"
              variant="outline"
              className="border-2 border-violet-600 text-violet-600 hover:bg-violet-50"
            >
              {user ? 'Go to Dashboard' : 'Login'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
