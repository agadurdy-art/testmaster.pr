import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { 
  Mic, Square, Play, ChevronRight, CheckCircle, Award, BookOpen, 
  MessageSquare, ArrowLeft, Target, Sparkles, Clock, Brain, Zap,
  Trophy, TrendingUp, AlertCircle, Lightbulb, Globe, Headphones, 
  PenTool, Volume2, Pause, Flag
} from 'lucide-react';
import { toast } from 'sonner';
import { useI18n } from '../lib/i18n';
import QuestionNavigation from '../components/test/QuestionNavigation';
import SideBySideReader from '../components/test/SideBySideReader';
import LocateExplain from '../components/test/LocateExplain';
import ProgressAnalytics from '../components/test/ProgressAnalytics';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Language Switcher Component
const LanguageSwitcher = () => {
  const { language, setLanguage } = useI18n();
  
  return (
    <div className="flex items-center gap-1 bg-white/70 backdrop-blur-sm rounded-full shadow-sm px-2 py-1 text-xs">
      <Globe className="w-3 h-3 text-gray-400" />
      <button
        onClick={() => setLanguage('en')}
        className={`px-1.5 py-0.5 rounded-full font-medium transition-colors ${
          language === 'en' 
            ? 'bg-violet-600 text-white' 
            : 'text-gray-500 hover:bg-gray-100'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('vi')}
        className={`px-1.5 py-0.5 rounded-full font-medium transition-colors ${
          language === 'vi' 
            ? 'bg-violet-600 text-white' 
            : 'text-gray-500 hover:bg-gray-100'
        }`}
      >
        VI
      </button>
      <button
        onClick={() => setLanguage('tr')}
        className={`px-1.5 py-0.5 rounded-full font-medium transition-colors ${
          language === 'tr' 
            ? 'bg-violet-600 text-white' 
            : 'text-gray-500 hover:bg-gray-100'
        }`}
      >
        TR
      </button>
    </div>
  );
};

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
    skill: "basic_comprehension",
    passageExcerpt: "I am a teacher",
    explanation: "The passage directly states 'I am a teacher.' This is a straightforward factual question.",
    skillTip: "For 'What is/are' questions, look for direct statements using 'is', 'am', or 'are'."
  },
  {
    id: 2,
    level: 'A1',
    band: 3.0,
    passage: "The library opens at 9:00 AM and closes at 6:00 PM every day except Sunday. On Sunday, it is closed.",
    question: "When is the library closed?",
    options: ["A) Monday", "B) Saturday", "C) Sunday", "D) Every day"],
    correct: "C",
    skill: "time_information",
    passageExcerpt: "On Sunday, it is closed",
    explanation: "The passage explicitly states 'On Sunday, it is closed.' The word 'except' indicates Sunday is different from other days.",
    skillTip: "Pay attention to words like 'except', 'but', 'however' - they often indicate exceptions or important information."
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
    skill: "frequency_detail",
    passageExcerpt: "goes to the gym three times a week",
    explanation: "The frequency 'three times a week' is stated directly at the beginning of the passage.",
    skillTip: "Frequency questions often contain phrases like 'times a week/month', 'every day', 'once', 'twice', etc."
  },
  {
    id: 4,
    level: 'A2',
    band: 4.5,
    passage: "Scientists have discovered that regular exercise not only improves physical health but also has significant benefits for mental well-being. Studies show that just 30 minutes of moderate exercise can reduce stress and improve mood.",
    question: "According to the passage, what is one benefit of regular exercise?",
    options: ["A) It makes you taller", "B) It reduces stress", "C) It helps you sleep longer", "D) It increases appetite"],
    correct: "B",
    skill: "detail_comprehension",
    passageExcerpt: "can reduce stress and improve mood",
    explanation: "The passage states exercise 'can reduce stress and improve mood.' Option B matches this information directly.",
    skillTip: "When asked for 'one benefit', scan for positive outcome words like 'improve', 'reduce (negative)', 'help', 'benefit'."
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
    skill: "inference",
    passageExcerpt: "it also presents challenges such as maintaining work-life balance",
    explanation: "The passage lists 'maintaining work-life balance' as one of the challenges. The word 'However' signals a contrast between benefits and drawbacks.",
    skillTip: "Words like 'However', 'but', 'although' often introduce contrasting information - pay attention to what follows them."
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
    skill: "critical_analysis",
    passageExcerpt: "may be detrimental to interpersonal relationships and cognitive development",
    explanation: "'Detrimental' means harmful. The passage states critics worry about harm to relationships and cognitive (brain) development.",
    skillTip: "Learn to recognize formal vocabulary: 'detrimental' = harmful, 'cognitive' = related to thinking/brain."
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
    skill: "complex_inference",
    passageExcerpt: "the tendency to seek out information that supports one's existing beliefs",
    explanation: "The passage defines confirmation bias in the dash—this is the key information. 'Seek out' means 'favor' or 'look for'.",
    skillTip: "Information between dashes (—) or parentheses often provides definitions or explanations of difficult terms."
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
    skill: "paradox_understanding",
    passageExcerpt: "simultaneously accommodating population growth while preserving environmental sustainability",
    explanation: "The 'paradox' is described as needing to do two things at once: grow (population) while protecting (environment). This is the 'balance' mentioned in option B.",
    skillTip: "The word 'paradox' indicates a conflict between two things. Look for what these two conflicting elements are."
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
    skill: "abstract_reasoning",
    passageExcerpt: "whether computational processes can be said to 'comprehend' in any meaningful sense, or whether they merely simulate comprehension",
    explanation: "The passage asks whether AI truly 'comprehends' (understands) or just 'simulates' (imitates) comprehension. Option B captures this distinction.",
    skillTip: "In advanced passages, look for philosophical questions often framed as 'whether X or Y' constructions."
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
    skill: "sophisticated_analysis",
    passageExcerpt: "resultant narrative frameworks can inadvertently perpetuate cognitive distortions that impede nuanced understanding",
    explanation: "'Cognitive distortions that impede understanding' = misleading frameworks that prevent understanding. 'Obscures rather than illuminates' reinforces this negative outcome.",
    skillTip: "In complex texts, identify the main verb direction: 'obscures' (negative), 'illuminates' (positive). Here the text favors the negative outcome."
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
  
  // Test mode selection: "full" | "reading" | "listening" | "writing" | "speaking"
  const [testMode, setTestMode] = useState(null);
  
  // Stage management - supports both full and individual tests
  const [stage, setStage] = useState('select'); // select, intro, reading, listening, writing, speaking, evaluating, results
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [readingAnswers, setReadingAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set()); // For question navigation
  const [currentSpeakingPrompt, setCurrentSpeakingPrompt] = useState(0);
  const [speakingResponses, setSpeakingResponses] = useState([]);
  
  // Listening state
  const [listeningQuestions, setListeningQuestions] = useState([]);
  const [currentListeningSection, setCurrentListeningSection] = useState(0);
  const [listeningAnswers, setListeningAnswers] = useState({});
  const [flaggedListeningQuestions, setFlaggedListeningQuestions] = useState(new Set()); // For listening navigation
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioPlayed, setAudioPlayed] = useState({});
  const listeningAudioRef = useRef(null);
  
  // Writing state
  const [writingTasks, setWritingTasks] = useState([]);
  const [currentWritingTask, setCurrentWritingTask] = useState(0);
  const [writingResponses, setWritingResponses] = useState({});
  
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

  // Toggle flag for a question
  const toggleFlagQuestion = (questionId) => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  // Toggle flag for listening question
  const toggleFlagListeningQuestion = (questionId) => {
    setFlaggedListeningQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

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

  // Handle test mode selection
  const selectTestMode = (mode) => {
    setTestMode(mode);
    setStage('intro');
  };

  // Start the selected test
  const startTest = () => {
    if (testMode === 'full') {
      // Full test starts with reading
      setStage('reading');
      setCurrentQuestion(0);
    } else if (testMode === 'reading') {
      setStage('reading');
      setCurrentQuestion(0);
    } else if (testMode === 'listening') {
      loadListeningQuestions();
      setStage('listening');
      setCurrentListeningSection(0);
    } else if (testMode === 'writing') {
      loadWritingTasks();
      setStage('writing');
      setCurrentWritingTask(0);
    } else if (testMode === 'speaking') {
      setStage('speaking');
      setCurrentSpeakingPrompt(0);
    }
  };

  // Get next stage based on test mode
  const getNextStage = (currentStage) => {
    if (testMode === 'full') {
      const fullOrder = ['reading', 'listening', 'writing', 'speaking', 'evaluating'];
      const currentIdx = fullOrder.indexOf(currentStage);
      return currentIdx < fullOrder.length - 1 ? fullOrder[currentIdx + 1] : 'results';
    }
    // Single skill tests go directly to evaluating after completion
    return 'evaluating';
  };

  const nextReadingQuestion = () => {
    if (!readingAnswers[readingQuestions[currentQuestion].id]) {
      toast.error('Please select an answer before continuing');
      return;
    }
    
    if (currentQuestion < readingQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Check test mode for next stage
      if (testMode === 'full') {
        loadListeningQuestions();
        setStage('listening');
        setCurrentListeningSection(0);
      } else {
        // Single reading test - go to evaluation
        evaluateTest();
      }
    }
  };
  
  // Load listening questions from API
  const loadListeningQuestions = async () => {
    try {
      const response = await fetch(`${API_URL}/api/level-test/listening-questions`);
      if (response.ok) {
        const data = await response.json();
        if (data.questions && data.questions.length > 0) {
          setListeningQuestions(data.questions);
          return;
        }
      }
    } catch (error) {
      console.error('Failed to load listening questions:', error);
    }
    
    // Fallback static questions if API fails
    setListeningQuestions([
      {
        id: 'q1', section_id: 'listening_1', section_title: 'Daily Schedule',
        audio_url: '/audio/listening/listening_1.mp3', level: 'A1-A2', band_range: '2.0-3.5',
        type: 'mcq', question: "What time does Sarah wake up?",
        options: ["A) 6 o'clock", "B) 7 o'clock", "C) 8 o'clock", "D) 9 o'clock"], correct: 'B'
      },
      {
        id: 'q2', section_id: 'listening_1', section_title: 'Daily Schedule',
        audio_url: '/audio/listening/listening_1.mp3', level: 'A1-A2', band_range: '2.0-3.5',
        type: 'mcq', question: "What does Sarah have for breakfast?",
        options: ["A) Eggs and coffee", "B) Cereal and milk", "C) Toast and tea", "D) Fruit and juice"], correct: 'C'
      },
      {
        id: 'q3', section_id: 'listening_2', section_title: 'At the Train Station',
        audio_url: '/audio/listening/listening_2.mp3', level: 'A2', band_range: '3.5-4.5',
        type: 'mcq', question: "Which platform does the train to London leave from?",
        options: ["A) Platform 1", "B) Platform 2", "C) Platform 3", "D) Platform 4"], correct: 'C'
      },
      {
        id: 'q4', section_id: 'listening_2', section_title: 'At the Train Station',
        audio_url: '/audio/listening/listening_2.mp3', level: 'A2', band_range: '3.5-4.5',
        type: 'mcq', question: "How long does the journey take?",
        options: ["A) 1 hour", "B) 1 hour 20 minutes", "C) 2 hours", "D) 2 hours 15 minutes"], correct: 'B'
      }
    ]);
  };
  
  // Load writing tasks from API
  const loadWritingTasks = async () => {
    try {
      const response = await fetch(`${API_URL}/api/level-test/writing-tasks`);
      if (response.ok) {
        const data = await response.json();
        setWritingTasks(data.tasks || []);
      }
    } catch (error) {
      console.error('Failed to load writing tasks:', error);
      // Use default tasks
      setWritingTasks([
        {
          id: 'writing_task_1',
          level: 'Band 2-4',
          type: 'guided',
          title: 'Introduce Yourself',
          instruction: 'Complete the sentences about yourself. Write 3-5 simple sentences.',
          min_words: 20,
          max_words: 50,
          time_minutes: 5
        },
        {
          id: 'writing_task_2',
          level: 'Band 4-6',
          type: 'paragraph',
          title: 'Describe Your Daily Routine',
          instruction: 'Write a short paragraph (60-90 words) describing what you do on a typical day.',
          min_words: 60,
          max_words: 90,
          time_minutes: 8
        },
        {
          id: 'writing_task_3',
          level: 'Band 6-7+',
          type: 'essay',
          title: 'Opinion Essay',
          instruction: 'Some people believe that technology makes our lives easier, while others think it creates more problems. What is your opinion? Write a short essay (120-180 words).',
          min_words: 120,
          max_words: 200,
          time_minutes: 12
        }
      ]);
    }
  };
  
  // Handle listening audio play
  const playListeningAudio = (sectionId, audioUrl) => {
    if (listeningAudioRef.current) {
      listeningAudioRef.current.pause();
    }
    
    const audio = new Audio(audioUrl);
    listeningAudioRef.current = audio;
    
    audio.onplay = () => setAudioPlaying(true);
    audio.onpause = () => setAudioPlaying(false);
    audio.onended = () => {
      setAudioPlaying(false);
      setAudioPlayed(prev => ({ ...prev, [sectionId]: true }));
    };
    audio.onerror = () => {
      setAudioPlaying(false);
      // Allow continuing even if audio fails
      setAudioPlayed(prev => ({ ...prev, [sectionId]: true }));
      toast.info('Audio not available. You can still answer the questions.');
    };
    
    audio.play().catch(() => {
      setAudioPlayed(prev => ({ ...prev, [sectionId]: true }));
      toast.info('Audio playback not available in this browser.');
    });
  };
  
  const pauseListeningAudio = () => {
    if (listeningAudioRef.current) {
      listeningAudioRef.current.pause();
    }
  };
  
  // Handle listening answer selection
  const handleListeningAnswer = (questionId, answer) => {
    setListeningAnswers(prev => ({ ...prev, [questionId]: answer }));
  };
  
  // Get unique sections from listening questions
  const getListeningSections = () => {
    const sectionsMap = {};
    listeningQuestions.forEach(q => {
      if (!sectionsMap[q.section_id]) {
        sectionsMap[q.section_id] = {
          id: q.section_id,
          title: q.section_title,
          audio_url: q.audio_url,
          level: q.level,
          band_range: q.band_range,
          questions: []
        };
      }
      sectionsMap[q.section_id].questions.push(q);
    });
    return Object.values(sectionsMap);
  };
  
  // Navigate to next listening section
  const nextListeningSection = () => {
    const sections = getListeningSections();
    
    // Safety check - if no sections, move to writing
    if (!sections || sections.length === 0) {
      loadWritingTasks();
      setStage('writing');
      setCurrentWritingTask(0);
      return;
    }
    
    const currentSection = sections[currentListeningSection];
    
    // Safety check for current section
    if (!currentSection || !currentSection.questions) {
      // Skip to writing if section data is invalid
      loadWritingTasks();
      setStage('writing');
      setCurrentWritingTask(0);
      return;
    }
    
    // Check if all questions in current section are answered
    const unanswered = currentSection.questions.find(q => !listeningAnswers[q.id]);
    if (unanswered) {
      toast.error('Please answer all questions before continuing');
      return;
    }
    
    if (currentListeningSection < sections.length - 1) {
      setCurrentListeningSection(currentListeningSection + 1);
    } else {
      // Check test mode for next stage
      if (testMode === 'full') {
        loadWritingTasks();
        setStage('writing');
        setCurrentWritingTask(0);
      } else {
        // Single listening test - go to evaluation
        evaluateTest();
      }
    }
  };
  
  // Handle writing response change
  const handleWritingChange = (taskId, text) => {
    setWritingResponses(prev => ({ ...prev, [taskId]: text }));
  };
  
  // Get word count for writing response
  const getWordCount = (text) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(w => w).length;
  };
  
  // Navigate to next writing task
  const nextWritingTask = () => {
    const currentTask = writingTasks[currentWritingTask];
    const response = writingResponses[currentTask.id] || '';
    const wordCount = getWordCount(response);
    
    if (wordCount < 5) {
      toast.error('Please write at least a few words before continuing');
      return;
    }
    
    if (currentWritingTask < writingTasks.length - 1) {
      setCurrentWritingTask(currentWritingTask + 1);
    } else {
      // Check test mode for next stage
      if (testMode === 'full') {
        setStage('speaking');
        setCurrentSpeakingPrompt(0);
      } else {
        // Single writing test - go to evaluation
        evaluateTest();
      }
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      // Try to use high-quality audio format
      const options = { mimeType: 'audio/webm;codecs=opus' };
      let mediaRecorder;
      
      try {
        mediaRecorder = new MediaRecorder(stream, options);
      } catch (e) {
        // Fallback to default if opus not supported
        mediaRecorder = new MediaRecorder(stream);
      }
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        
        console.log('Audio recorded:', {
          size: blob.size,
          type: blob.type,
          chunks: audioChunksRef.current.length
        });
        
        setAudioBlob(blob);
        await transcribeAudio(blob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      // Request data every 1 second to ensure we capture everything
      mediaRecorder.start(1000);
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
    
    // Show size for debugging
    console.log('Transcribing audio blob:', {
      size: blob.size,
      type: blob.type,
      sizeMB: (blob.size / 1024 / 1024).toFixed(2) + ' MB'
    });
    
    if (blob.size < 1000) {
      toast.error('Recording too short. Please try again and speak for longer.');
      setTranscribing(false);
      return;
    }
    
    const formData = new FormData();
    formData.append('file', blob, 'audio.webm');

    try {
      const response = await fetch(`${API_URL}/api/speaking/transcribe`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || 'Transcription failed';
        
        // Check if it's a language detection error
        if (errorMessage.includes('speak in English') || errorMessage.includes('Detected language')) {
          toast.error('🌐 Please speak in English only. This is an English proficiency test.', {
            duration: 5000
          });
          setTranscribing(false);
          return;
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      console.log('Transcription result:', {
        text: data.text,
        length: data.text?.length,
        language: data.language
      });
      
      if (!data.text || data.text.trim().length < 10) {
        toast.error('Could not transcribe audio clearly. Please speak louder and try again.');
        setTranscribing(false);
        return;
      }
      
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
      
      toast.success(`Transcribed: ${data.text.split(' ').length} words`);
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
      setStage('results');
      setEvaluating(true);
      
      let readingBand = null;
      let readingCorrect = 0;
      let skillBreakdown = {};
      let listeningBand = null;
      let listeningResults = null;
      let writingBand = null;
      let writingResults = null;
      let speakingEval = null;
      
      // Evaluate Reading if applicable
      if (testMode === 'full' || testMode === 'reading') {
        let totalReadingPoints = 0;
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
        readingBand = totalReadingPoints / readingQuestions.length;
      }

      // Evaluate Listening if applicable
      if (testMode === 'full' || testMode === 'listening') {
        try {
          const listeningResponse = await fetch(`${API_URL}/api/level-test/evaluate-listening`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ answers: listeningAnswers, language })
          });
          if (listeningResponse.ok) {
            listeningResults = await listeningResponse.json();
            listeningBand = listeningResults.band_score;
          }
        } catch (e) {
          console.error('Listening evaluation error:', e);
          listeningBand = 4.0;
        }
      }
      
      // Evaluate Writing if applicable
      if (testMode === 'full' || testMode === 'writing') {
        try {
          // Only send writing tasks if we have responses
          const writingTasksToEvaluate = writingTasks.length > 0 ? 
            writingTasks.map(task => ({
              task_id: task.id,
              response_text: writingResponses[task.id] || ''
            })) : [];
          
          if (writingTasksToEvaluate.length > 0) {
            const writingResponse = await fetch(`${API_URL}/api/level-test/evaluate-writing`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                responses: writingTasksToEvaluate,
                language
              })
            });
            if (writingResponse.ok) {
              writingResults = await writingResponse.json();
              writingBand = writingResults.overall_band;
            }
          }
        } catch (e) {
          console.error('Writing evaluation error:', e);
          writingBand = 4.0;
        }
      }

      // Evaluate Speaking if applicable
      if (testMode === 'full' || testMode === 'speaking') {
        // Only evaluate if we have speaking responses
        if (speakingResponses.length > 0) {
          try {
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
            if (speakingEvaluationResponse.ok) {
              speakingEval = await speakingEvaluationResponse.json();
            }
          } catch (e) {
            console.error('Speaking evaluation error:', e);
          }
        }
      }
      
      // Calculate overall band only for full test
      let overallBand = null;
      if (testMode === 'full') {
        const validBands = [readingBand, listeningBand, writingBand, speakingEval?.overall_band].filter(b => b !== null);
        overallBand = validBands.length > 0 ? validBands.reduce((a, b) => a + b, 0) / validBands.length : 4.0;
      }

      // Get course recommendations for full test
      let recommendations = null;
      if (testMode === 'full' && overallBand) {
        try {
          const recommendationsResponse = await fetch(`${API_URL}/api/level-test/recommend-courses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              overall_band: overallBand,
              reading_band: readingBand,
              listening_band: listeningBand,
              writing_band: writingBand,
              speaking_band: speakingEval?.overall_band,
              weaknesses: speakingEval?.weaknesses || [],
              skill_breakdown: skillBreakdown,
              language: language
            })
          });
          if (recommendationsResponse.ok) {
            recommendations = await recommendationsResponse.json();
          }
        } catch (e) {
          console.error('Recommendations error:', e);
        }
      }

      // Update with results based on test mode
      setResults({
        test_mode: testMode,
        overall_band: overallBand,
        reading: readingBand !== null ? {
          band: readingBand,
          correct: readingCorrect,
          total: readingQuestions.length,
          skill_breakdown: skillBreakdown
        } : null,
        listening: listeningResults,
        writing: writingResults,
        speaking: speakingEval,
        recommendations: recommendations
      });

    } catch (error) {
      console.error('Evaluation error:', error);
      // Still show results even if there's an error - use what we have
      setResults({
        test_mode: testMode,
        overall_band: null,
        reading: testMode === 'reading' || testMode === 'full' ? {
          band: 4.0,
          correct: 0,
          total: readingQuestions.length,
          skill_breakdown: {}
        } : null,
        listening: testMode === 'listening' || testMode === 'full' ? {
          band_score: 4.0,
          correct: 0,
          total: 10,
          percentage: 0,
          question_results: [],
          skill_breakdown: [],
          overall_feedback: 'Unable to evaluate. Please try again.'
        } : null,
        writing: null,
        speaking: null,
        recommendations: null
      });
      toast.error('Some evaluations failed. Showing available results.');
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
    // For single skill tests, progress is 0-100% for that skill only
    if (testMode !== 'full') {
      if (stage === 'reading') {
        return ((currentQuestion + 1) / readingQuestions.length) * 100;
      } else if (stage === 'listening') {
        const sections = getListeningSections();
        return ((currentListeningSection + 1) / Math.max(sections.length, 1)) * 100;
      } else if (stage === 'writing') {
        return ((currentWritingTask + 1) / Math.max(writingTasks.length, 1)) * 100;
      } else if (stage === 'speaking') {
        return ((currentSpeakingPrompt + 1) / speakingPrompts.length) * 100;
      }
      return 0;
    }
    
    // Full test: reading (25%) → listening (25%) → writing (25%) → speaking (25%)
    if (stage === 'reading') {
      return ((currentQuestion + 1) / readingQuestions.length) * 25;
    } else if (stage === 'listening') {
      const sections = getListeningSections();
      return 25 + ((currentListeningSection + 1) / Math.max(sections.length, 1)) * 25;
    } else if (stage === 'writing') {
      return 50 + ((currentWritingTask + 1) / Math.max(writingTasks.length, 1)) * 25;
    } else if (stage === 'speaking') {
      return 75 + ((currentSpeakingPrompt + 1) / speakingPrompts.length) * 25;
    }
    return 0;
  };

  // TEST MODE SELECTION SCREEN
  if (stage === 'select') {
    const testOptions = [
      {
        id: 'full',
        title: language === 'vi' ? 'Bài Kiểm Tra Đầy Đủ' : language === 'tr' ? 'Tam Test' : 'Full Test',
        description: language === 'vi' ? 'Tất cả 4 kỹ năng: Đọc, Nghe, Viết, Nói' : 
                     language === 'tr' ? 'Tüm 4 beceri: Okuma, Dinleme, Yazma, Konuşma' : 
                     'All 4 skills: Reading, Listening, Writing, Speaking',
        duration: '20-30 min',
        icon: Target,
        color: 'from-violet-500 to-purple-600',
        bgColor: 'from-violet-50 to-purple-50'
      },
      {
        id: 'reading',
        title: language === 'vi' ? 'Bài Kiểm Tra Đọc' : language === 'tr' ? 'Okuma Testi' : 'Reading Test',
        description: language === 'vi' ? 'Đánh giá khả năng đọc hiểu' : 
                     language === 'tr' ? 'Okuma anlama becerisini değerlendir' : 
                     'Assess your reading comprehension',
        duration: '5-7 min',
        icon: BookOpen,
        color: 'from-blue-500 to-indigo-600',
        bgColor: 'from-blue-50 to-indigo-50'
      },
      {
        id: 'listening',
        title: language === 'vi' ? 'Bài Kiểm Tra Nghe' : language === 'tr' ? 'Dinleme Testi' : 'Listening Test',
        description: language === 'vi' ? 'Đánh giá khả năng nghe hiểu' : 
                     language === 'tr' ? 'Dinleme anlama becerisini değerlendir' : 
                     'Assess your listening comprehension',
        duration: '5-7 min',
        icon: Headphones,
        color: 'from-cyan-500 to-teal-600',
        bgColor: 'from-cyan-50 to-teal-50'
      },
      {
        id: 'writing',
        title: language === 'vi' ? 'Bài Kiểm Tra Viết' : language === 'tr' ? 'Yazma Testi' : 'Writing Test',
        description: language === 'vi' ? 'Đánh giá khả năng viết' : 
                     language === 'tr' ? 'Yazma becerisini değerlendir' : 
                     'Assess your writing skills',
        duration: '8-12 min',
        icon: PenTool,
        color: 'from-amber-500 to-orange-600',
        bgColor: 'from-amber-50 to-orange-50'
      },
      {
        id: 'speaking',
        title: language === 'vi' ? 'Bài Kiểm Tra Nói' : language === 'tr' ? 'Konuşma Testi' : 'Speaking Test',
        description: language === 'vi' ? 'Đánh giá khả năng nói' : 
                     language === 'tr' ? 'Konuşma becerisini değerlendir' : 
                     'Assess your speaking skills',
        duration: '5-8 min',
        icon: Mic,
        color: 'from-purple-500 to-pink-600',
        bgColor: 'from-purple-50 to-pink-50'
      }
    ];

    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-blue-50 py-12 px-4">
        <LanguageSwitcher />
        <div className="max-w-4xl mx-auto">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {language === 'vi' ? 'Quay Lại Trang Chủ' : language === 'tr' ? 'Ana Sayfaya Dön' : 'Back to Home'}
          </Button>

          <Card className="p-8 bg-white shadow-xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 mb-4">
                <Target className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {language === 'vi' ? 'Chọn Loại Bài Kiểm Tra' :
                 language === 'tr' ? 'Test Türünü Seçin' :
                 'Select Test Type'}
              </h1>
              <p className="text-gray-600 text-lg">
                {language === 'vi' ? 'Chọn bài kiểm tra đầy đủ hoặc đánh giá từng kỹ năng riêng lẻ' :
                 language === 'tr' ? 'Tam test veya bireysel beceri değerlendirmesi seçin' :
                 'Choose full test or individual skill assessment'}
              </p>
            </div>

            {/* Full Test Option - Featured */}
            <div 
              onClick={() => selectTestMode('full')}
              className="mb-6 cursor-pointer group"
            >
              <Card className={`p-6 bg-gradient-to-br ${testOptions[0].bgColor} border-2 border-transparent hover:border-violet-400 transition-all duration-300 hover:shadow-lg`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${testOptions[0].color} flex items-center justify-center`}>
                      <Target className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-xl flex items-center gap-2">
                        {testOptions[0].title}
                        <span className="text-xs px-2 py-1 bg-violet-100 text-violet-700 rounded-full">
                          {language === 'vi' ? 'Khuyến nghị' : language === 'tr' ? 'Önerilen' : 'Recommended'}
                        </span>
                      </h3>
                      <p className="text-gray-600">{testOptions[0].description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {testOptions[0].duration}
                    </p>
                    <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-violet-600 transition-colors ml-auto mt-2" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">
                  {language === 'vi' ? 'hoặc chọn kỹ năng cụ thể' : 
                   language === 'tr' ? 'veya belirli bir beceri seçin' : 
                   'or select a specific skill'}
                </span>
              </div>
            </div>

            {/* Individual Skill Options */}
            <div className="grid md:grid-cols-2 gap-4">
              {testOptions.slice(1).map((option) => {
                const IconComponent = option.icon;
                return (
                  <div 
                    key={option.id}
                    onClick={() => selectTestMode(option.id)}
                    className="cursor-pointer group"
                  >
                    <Card className={`p-5 bg-gradient-to-br ${option.bgColor} border-2 border-transparent hover:border-gray-300 transition-all duration-300 hover:shadow-md h-full`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${option.color} flex items-center justify-center`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900">{option.title}</h3>
                          <p className="text-sm text-gray-600">{option.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {option.duration}
                          </p>
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors ml-auto mt-1" />
                        </div>
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>

            {/* Info Note */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 flex items-start gap-2">
                <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {language === 'vi' ? 'Mẹo: Bài kiểm tra đầy đủ cho kết quả chính xác nhất về trình độ tiếng Anh tổng thể của bạn.' :
                 language === 'tr' ? 'İpucu: Tam test, genel İngilizce seviyeniz hakkında en doğru sonucu verir.' :
                 'Tip: The full test gives the most accurate result for your overall English level.'}
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // INTRO SCREEN (after test mode is selected)
  if (stage === 'intro') {
    // Get title and description based on test mode
    const getTestTitle = () => {
      if (testMode === 'full') return language === 'vi' ? 'Bài Kiểm Tra Đầy Đủ' : language === 'tr' ? 'Tam Test' : 'Full Assessment Test';
      if (testMode === 'reading') return language === 'vi' ? 'Bài Kiểm Tra Đọc' : language === 'tr' ? 'Okuma Testi' : 'Reading Assessment';
      if (testMode === 'listening') return language === 'vi' ? 'Bài Kiểm Tra Nghe' : language === 'tr' ? 'Dinleme Testi' : 'Listening Assessment';
      if (testMode === 'writing') return language === 'vi' ? 'Bài Kiểm Tra Viết' : language === 'tr' ? 'Yazma Testi' : 'Writing Assessment';
      if (testMode === 'speaking') return language === 'vi' ? 'Bài Kiểm Tra Nói' : language === 'tr' ? 'Konuşma Testi' : 'Speaking Assessment';
      return 'Level Assessment';
    };

    const getTestDescription = () => {
      if (testMode === 'full') return language === 'vi' ? 'Đánh giá 4 kỹ năng: Đọc, Nghe, Viết, Nói' : language === 'tr' ? '4 beceriyi değerlendir: Okuma, Dinleme, Yazma, Konuşma' : 'Assess all 4 skills: Reading, Listening, Writing, Speaking';
      if (testMode === 'reading') return language === 'vi' ? 'Đánh giá khả năng đọc hiểu của bạn' : language === 'tr' ? 'Okuma anlama becerinizi değerlendirin' : 'Assess your reading comprehension skills';
      if (testMode === 'listening') return language === 'vi' ? 'Đánh giá khả năng nghe hiểu của bạn' : language === 'tr' ? 'Dinleme anlama becerinizi değerlendirin' : 'Assess your listening comprehension skills';
      if (testMode === 'writing') return language === 'vi' ? 'Đánh giá khả năng viết của bạn' : language === 'tr' ? 'Yazma becerinizi değerlendirin' : 'Assess your writing skills';
      if (testMode === 'speaking') return language === 'vi' ? 'Đánh giá khả năng nói của bạn' : language === 'tr' ? 'Konuşma becerinizi değerlendirin' : 'Assess your speaking skills';
      return '';
    };

    const getIconComponent = () => {
      if (testMode === 'reading') return BookOpen;
      if (testMode === 'listening') return Headphones;
      if (testMode === 'writing') return PenTool;
      if (testMode === 'speaking') return Mic;
      return Target;
    };

    const getIconColor = () => {
      if (testMode === 'reading') return 'from-blue-500 to-indigo-600';
      if (testMode === 'listening') return 'from-cyan-500 to-teal-600';
      if (testMode === 'writing') return 'from-amber-500 to-orange-600';
      if (testMode === 'speaking') return 'from-purple-500 to-pink-600';
      return 'from-violet-500 to-purple-600';
    };

    const IconComponent = getIconComponent();

    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-blue-50 py-12 px-4">
        <LanguageSwitcher />
        <div className="max-w-4xl mx-auto">
          <Button
            onClick={() => setStage('select')}
            variant="ghost"
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {language === 'vi' ? 'Quay Lại Chọn Bài Kiểm Tra' : language === 'tr' ? 'Test Seçimine Dön' : 'Back to Test Selection'}
          </Button>

          <Card className="p-8 bg-white shadow-xl">
            <div className="text-center mb-8">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${getIconColor()} mb-4`}>
                <IconComponent className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {getTestTitle()}
              </h1>
              <p className="text-gray-600 text-lg">
                {getTestDescription()}
              </p>
            </div>

            {/* Show relevant skill cards based on test mode */}
            {testMode === 'full' ? (
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
                </ul>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-cyan-50 to-teal-50 border-0">
                <div className="flex items-center gap-3 mb-3">
                  <Headphones className="w-6 h-6 text-cyan-600" />
                  <h3 className="font-bold text-gray-900">Listening Assessment</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>10 questions (5-7 minutes)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>UK native speaker audio</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-0">
                <div className="flex items-center gap-3 mb-3">
                  <PenTool className="w-6 h-6 text-amber-600" />
                  <h3 className="font-bold text-gray-900">Writing Assessment</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>3 progressive tasks (8-12 minutes)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>AI-powered rubric evaluation</span>
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
                    <span>Pronunciation & fluency analysis</span>
                  </li>
                </ul>
              </Card>
            </div>
            ) : (
              /* Single skill intro - show specific details */
              <div className="mb-8">
                {testMode === 'reading' && (
                  <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-0">
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{language === 'vi' ? '10 câu hỏi với độ khó tăng dần' : language === 'tr' ? 'Artan zorluk seviyesinde 10 soru' : '10 questions with progressive difficulty'}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{language === 'vi' ? 'Đánh giá từ Band 2.0 đến 9.0' : language === 'tr' ? 'Band 2.0 ile 9.0 arası değerlendirme' : 'Band 2.0 to 9.0 assessment'}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{language === 'vi' ? 'Phân tích kỹ năng chi tiết' : language === 'tr' ? 'Detaylı beceri analizi' : 'Detailed skill breakdown'}</span>
                      </li>
                    </ul>
                  </Card>
                )}
                {testMode === 'listening' && (
                  <Card className="p-6 bg-gradient-to-br from-cyan-50 to-teal-50 border-0">
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{language === 'vi' ? '5 phần nghe với 10 câu hỏi' : language === 'tr' ? '10 soru ile 5 dinleme bölümü' : '5 listening sections with 10 questions'}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{language === 'vi' ? 'Giọng UK bản địa (Anh Quốc)' : language === 'tr' ? 'UK ana dili konuşmacıları' : 'UK native speaker audio'}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{language === 'vi' ? 'Độ khó từ Band 2.0 đến 9.0' : language === 'tr' ? 'Band 2.0 ile 9.0 arası zorluk' : 'Band 2.0 to 9.0 difficulty'}</span>
                      </li>
                    </ul>
                  </Card>
                )}
                {testMode === 'writing' && (
                  <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-0">
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{language === 'vi' ? '3 bài viết với độ khó tăng dần' : language === 'tr' ? 'Artan zorluk seviyesinde 3 yazma görevi' : '3 progressive writing tasks'}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{language === 'vi' ? 'Đánh giá theo tiêu chí IELTS' : language === 'tr' ? 'IELTS kriterlerine göre değerlendirme' : 'IELTS rubric-based evaluation'}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{language === 'vi' ? 'Phản hồi và gợi ý cải thiện' : language === 'tr' ? 'Geri bildirim ve iyileştirme ipuçları' : 'Feedback and improvement tips'}</span>
                      </li>
                    </ul>
                  </Card>
                )}
                {testMode === 'speaking' && (
                  <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-0">
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{language === 'vi' ? '3 câu hỏi nói với độ khó tăng dần' : language === 'tr' ? 'Artan zorluk seviyesinde 3 konuşma sorusu' : '3 speaking questions with progressive difficulty'}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{language === 'vi' ? 'Đánh giá phát âm và lưu loát' : language === 'tr' ? 'Telaffuz ve akıcılık değerlendirmesi' : 'Pronunciation & fluency analysis'}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{language === 'vi' ? 'Phân tích ngữ pháp và từ vựng' : language === 'tr' ? 'Dilbilgisi ve kelime analizi' : 'Grammar & vocabulary assessment'}</span>
                      </li>
                    </ul>
                  </Card>
                )}
              </div>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-900">
                  <p className="font-semibold mb-1">
                    {language === 'vi' ? 'Bạn sẽ nhận được:' : language === 'tr' ? 'Ne alacaksınız:' : 'What you\'ll receive:'}
                  </p>
                  <ul className="space-y-1 ml-4 list-disc">
                    <li>{language === 'vi' ? 'Điểm Band IELTS (2.0-9.0)' : language === 'tr' ? 'IELTS band puanı (2.0-9.0)' : 'Your IELTS band equivalent (2.0-9.0)'}</li>
                    {testMode === 'full' && (
                      <>
                        <li>{language === 'vi' ? 'Phân tích kỹ năng chi tiết' : language === 'tr' ? 'Detaylı beceri analizi' : 'Detailed skill breakdown & weaknesses'}</li>
                        <li>{language === 'vi' ? 'Gợi ý khóa học phù hợp' : language === 'tr' ? 'Kişiselleştirilmiş kurs önerileri' : 'Personalized course recommendations'}</li>
                      </>
                    )}
                    <li>{language === 'vi' ? 'Phản hồi và gợi ý cải thiện' : language === 'tr' ? 'Geri bildirim ve iyileştirme ipuçları' : 'Feedback and improvement tips'}</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button
              onClick={startTest}
              size="lg"
              className={`w-full bg-gradient-to-r ${getIconColor()} hover:opacity-90 text-white py-6 text-lg`}
            >
              {language === 'vi' ? 'Bắt Đầu Kiểm Tra' : language === 'tr' ? 'Teste Başla' : 'Start Assessment'}
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
    const questionIds = readingQuestions.map(q => q.id);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-4 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                {language === 'vi' ? `Đánh Giá Đọc - Câu ${currentQuestion + 1} / ${readingQuestions.length}` :
                 language === 'tr' ? `Okuma Değerlendirmesi - Soru ${currentQuestion + 1} / ${readingQuestions.length}` :
                 `Reading Assessment - Question ${currentQuestion + 1} of ${readingQuestions.length}`}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-blue-600">
                  {language === 'vi' ? 'Cấp độ' : language === 'tr' ? 'Seviye' : 'Level'}: {currentQ.level}
                </span>
                <LanguageSwitcher />
              </div>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </div>

          {/* Question Navigation Bar */}
          <QuestionNavigation
            totalQuestions={readingQuestions.length}
            currentQuestion={currentQuestion}
            answers={readingAnswers}
            flaggedQuestions={flaggedQuestions}
            onQuestionSelect={(index) => setCurrentQuestion(index)}
            questionIds={questionIds}
            className="mb-4"
          />

          {/* Side-by-Side Reader */}
          <SideBySideReader
            passage={currentQ.passage}
            passageTitle={language === 'vi' ? 'Đoạn Văn' : language === 'tr' ? 'Okuma Parçası' : 'Reading Passage'}
            defaultRatio={70}
          >
            {/* Questions Panel Content */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900">
                  {language === 'vi' ? `Câu ${currentQuestion + 1}` : 
                   language === 'tr' ? `Soru ${currentQuestion + 1}` :
                   `Question ${currentQuestion + 1}`}
                </h4>
                <button
                  onClick={() => toggleFlagQuestion(currentQ.id)}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-sm transition-colors ${
                    flaggedQuestions.has(currentQ.id) 
                      ? 'bg-yellow-100 text-yellow-700' 
                      : 'bg-gray-100 text-gray-500 hover:bg-yellow-50'
                  }`}
                >
                  <Flag className="w-4 h-4" />
                  {flaggedQuestions.has(currentQ.id) ? 
                    (language === 'tr' ? 'İşaretli' : 'Flagged') : 
                    (language === 'tr' ? 'İşaretle' : 'Flag')}
                </button>
              </div>

              <p className="text-gray-800 font-medium">{currentQ.question}</p>

              <div className="space-y-2">
                {currentQ.options.map((option) => {
                  const optionLetter = option.charAt(0);
                  const isSelected = readingAnswers[currentQ.id] === optionLetter;
                  
                  return (
                    <button
                      key={option}
                      onClick={() => handleReadingAnswer(currentQ.id, optionLetter)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all text-sm ${
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

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-4 border-t">
                <Button
                  onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                  variant="outline"
                  size="sm"
                  disabled={currentQuestion === 0}
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  {language === 'tr' ? 'Önceki' : 'Previous'}
                </Button>
                <Button
                  onClick={nextReadingQuestion}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={!readingAnswers[currentQ.id]}
                >
                  {currentQuestion < readingQuestions.length - 1 ? 
                    (language === 'tr' ? 'Sonraki' : 'Next') : 
                    (language === 'tr' ? 'Dinlemeye Geç' : 'Continue to Listening')}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </SideBySideReader>
        </div>
      </div>
    );
  }

  // LISTENING SECTION
  if (stage === 'listening') {
    const sections = getListeningSections();
    const currentSection = sections[currentListeningSection] || { questions: [], title: 'Loading...' };
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-emerald-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                {language === 'vi' ? `Đánh Giá Nghe - Phần ${currentListeningSection + 1} / ${sections.length}` :
                 language === 'tr' ? `Dinleme Değerlendirmesi - Bölüm ${currentListeningSection + 1} / ${sections.length}` :
                 `Listening Assessment - Section ${currentListeningSection + 1} of ${sections.length}`}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-cyan-600">
                  {language === 'vi' ? 'Cấp độ' : language === 'tr' ? 'Seviye' : 'Level'}: {currentSection.level}
                </span>
                <LanguageSwitcher />
              </div>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </div>

          <Card className="p-8 bg-white shadow-xl">
            {/* Section Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Headphones className="w-5 h-5 text-cyan-600" />
                <h3 className="font-semibold text-gray-700">{currentSection.title}</h3>
                <span className="text-xs px-2 py-1 bg-cyan-100 text-cyan-700 rounded-full">
                  {currentSection.band_range}
                </span>
              </div>
              
              {/* Audio Player */}
              <div className="bg-cyan-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-600 mb-3">
                  {language === 'vi' ? 'Nghe đoạn ghi âm và trả lời các câu hỏi bên dưới:' :
                   language === 'tr' ? 'Ses kaydını dinleyin ve aşağıdaki soruları cevaplayın:' :
                   'Listen to the recording and answer the questions below:'}
                </p>
                <div className="flex items-center gap-4">
                  {!audioPlaying ? (
                    <Button
                      onClick={() => playListeningAudio(currentSection.id, currentSection.audio_url)}
                      className="bg-cyan-600 hover:bg-cyan-700"
                    >
                      <Volume2 className="w-4 h-4 mr-2" />
                      {audioPlayed[currentSection.id] ? 'Play Again' : 'Play Audio'}
                    </Button>
                  ) : (
                    <Button
                      onClick={pauseListeningAudio}
                      variant="outline"
                      className="border-cyan-600 text-cyan-600"
                    >
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </Button>
                  )}
                  {audioPlayed[currentSection.id] && (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Audio played
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-6">
              {currentSection.questions.map((q, idx) => (
                <div key={q.id} className="border-b pb-6 last:border-b-0">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    {idx + 1}. {q.question}
                  </h4>
                  <div className="space-y-2">
                    {q.options.map((option) => {
                      const optionLetter = option.charAt(0);
                      const isSelected = listeningAnswers[q.id] === optionLetter;
                      
                      return (
                        <button
                          key={option}
                          onClick={() => handleListeningAnswer(q.id, optionLetter)}
                          className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                            isSelected
                              ? 'border-cyan-500 bg-cyan-50'
                              : 'border-gray-200 hover:border-cyan-300 hover:bg-cyan-50/50'
                          }`}
                        >
                          <span className={`font-medium ${isSelected ? 'text-cyan-700' : 'text-gray-700'}`}>
                            {option}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-end">
              <Button
                onClick={nextListeningSection}
                size="lg"
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                {currentListeningSection < sections.length - 1 ? 'Next Section' : 'Continue to Writing'}
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // WRITING SECTION
  if (stage === 'writing') {
    const currentTask = writingTasks[currentWritingTask] || {
      id: 'default',
      title: 'Writing Task',
      instruction: 'Write your response below.',
      min_words: 20,
      max_words: 100,
      level: 'Band 4-6'
    };
    const currentResponse = writingResponses[currentTask.id] || '';
    const wordCount = getWordCount(currentResponse);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                {language === 'vi' ? `Đánh Giá Viết - Bài ${currentWritingTask + 1} / ${writingTasks.length}` :
                 language === 'tr' ? `Yazma Değerlendirmesi - Görev ${currentWritingTask + 1} / ${writingTasks.length}` :
                 `Writing Assessment - Task ${currentWritingTask + 1} of ${writingTasks.length}`}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-amber-600">
                  {currentTask.level}
                </span>
                <LanguageSwitcher />
              </div>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </div>

          <Card className="p-8 bg-white shadow-xl">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <PenTool className="w-5 h-5 text-amber-600" />
                <h3 className="font-semibold text-gray-900 text-lg">{currentTask.title}</h3>
              </div>
              
              <div className="bg-amber-50 p-4 rounded-lg mb-4">
                <p className="text-gray-800 leading-relaxed">
                  {currentTask.instruction}
                </p>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {currentTask.time_minutes} {language === 'vi' ? 'phút' : language === 'tr' ? 'dakika' : 'minutes'}
                </span>
                <span>
                  {language === 'vi' ? 'Mục tiêu' : language === 'tr' ? 'Hedef' : 'Target'}: {currentTask.min_words}-{currentTask.max_words} {language === 'vi' ? 'từ' : language === 'tr' ? 'kelime' : 'words'}
                </span>
              </div>
            </div>

            {/* Writing Area */}
            <div className="relative">
              <textarea
                value={currentResponse}
                onChange={(e) => handleWritingChange(currentTask.id, e.target.value)}
                placeholder={
                  language === 'vi' ? 'Viết câu trả lời của bạn ở đây...' :
                  language === 'tr' ? 'Cevabınızı buraya yazın...' :
                  'Write your response here...'
                }
                className="w-full h-64 p-4 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 resize-none text-gray-800"
              />
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <span className={`text-sm font-medium ${
                  wordCount < currentTask.min_words ? 'text-red-500' :
                  wordCount > currentTask.max_words ? 'text-amber-500' :
                  'text-green-500'
                }`}>
                  {wordCount} / {currentTask.min_words}-{currentTask.max_words} words
                </span>
              </div>
            </div>
            
            {wordCount < currentTask.min_words && wordCount > 0 && (
              <p className="text-sm text-amber-600 mt-2">
                {language === 'vi' ? `Cần thêm ${currentTask.min_words - wordCount} từ nữa` :
                 language === 'tr' ? `${currentTask.min_words - wordCount} kelime daha gerekli` :
                 `Need ${currentTask.min_words - wordCount} more words`}
              </p>
            )}

            <div className="mt-8 flex justify-end">
              <Button
                onClick={nextWritingTask}
                size="lg"
                className="bg-amber-600 hover:bg-amber-700"
                disabled={wordCount < 5}
              >
                {currentWritingTask < writingTasks.length - 1 ? 'Next Task' : 'Continue to Speaking'}
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
                {language === 'vi' ? `Đánh Giá Nói - Câu ${currentSpeakingPrompt + 1} / ${speakingPrompts.length}` :
                 language === 'tr' ? `Konuşma Değerlendirmesi - Soru ${currentSpeakingPrompt + 1} / ${speakingPrompts.length}` :
                 `Speaking Assessment - Question ${currentSpeakingPrompt + 1} of ${speakingPrompts.length}`}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-purple-600">
                  {language === 'vi' ? 'Cấp độ' : language === 'tr' ? 'Seviye' : 'Level'}: {currentPrompt.level}
                </span>
                <LanguageSwitcher />
              </div>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </div>

          <Card className="p-8 bg-white shadow-xl">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-700">
                  {language === 'vi' ? 'Câu Hỏi Nói' : language === 'tr' ? 'Konuşma Sorusu' : 'Speaking Prompt'}
                </h3>
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
                    <span className="text-red-700 font-medium">
                      {language === 'vi' ? 'Đang ghi...' : language === 'tr' ? 'Kaydediliyor...' : 'Recording...'}
                    </span>
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
                  <span className="text-blue-700 font-medium">
                    {language === 'vi' ? 'Đang chuyển đổi câu trả lời...' : language === 'tr' ? 'Yanıtınız yazıya çevriliyor...' : 'Transcribing your response...'}
                  </span>
                </div>
              </div>
            )}

            {currentTranscript && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  {language === 'vi' ? 'Câu trả lời của bạn:' :
                   language === 'tr' ? 'Cevabınız:' :
                   'Your Response:'}
                </h4>
                <p className="text-green-800 text-sm leading-relaxed mb-3">
                  {currentTranscript}
                </p>
                <div className="flex items-center gap-2 text-xs text-green-700">
                  <span>
                    {language === 'vi' ? `${currentTranscript.split(' ').length} từ` :
                     language === 'tr' ? `${currentTranscript.split(' ').length} kelime` :
                     `${currentTranscript.split(' ').length} words`}
                  </span>
                </div>
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
                  {language === 'vi' ? 'Bắt đầu ghi âm' :
                   language === 'tr' ? 'Kaydı Başlat' :
                   'Start Recording'}
                </Button>
              )}
              
              {recording && (
                <Button
                  onClick={stopRecording}
                  size="lg"
                  className="flex-1 bg-gray-800 hover:bg-gray-900 text-white"
                >
                  <Square className="w-5 h-5 mr-2" />
                  {language === 'vi' ? 'Dừng ghi âm' :
                   language === 'tr' ? 'Kaydı Durdur' :
                   'Stop Recording'}
                </Button>
              )}

              {hasResponse && (
                <>
                  <Button
                    onClick={() => {
                      setAudioBlob(null);
                      setCurrentTranscript('');
                      const updatedResponses = [...speakingResponses];
                      updatedResponses[currentSpeakingPrompt] = null;
                      setSpeakingResponses(updatedResponses);
                    }}
                    size="lg"
                    variant="outline"
                    className="border-2 border-red-500 text-red-600 hover:bg-red-50"
                  >
                    {language === 'vi' ? 'Ghi lại' :
                     language === 'tr' ? 'Tekrar Kaydet' :
                     'Record Again'}
                  </Button>
                  <Button
                    onClick={nextSpeakingPrompt}
                    size="lg"
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    {currentSpeakingPrompt < speakingPrompts.length - 1 ? 
                      (language === 'vi' ? 'Câu tiếp theo' :
                       language === 'tr' ? 'Sonraki Soru' :
                       'Next Question') : 
                      (language === 'vi' ? 'Hoàn thành đánh giá' :
                       language === 'tr' ? 'Değerlendirmeyi Tamamla' :
                       'Complete Assessment')}
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </>
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
        <LanguageSwitcher />
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
      if (language === 'vi') {
        if (band >= 8.0) return 'Xuất Sắc';
        if (band >= 7.0) return 'Rất Tốt';
        if (band >= 6.0) return 'Thành Thạo';
        if (band >= 5.0) return 'Trung Bình';
        if (band >= 4.0) return 'Hạn Chế';
        return 'Cơ Bản';
      }
      if (language === 'tr') {
        if (band >= 8.0) return 'Mükemmel';
        if (band >= 7.0) return 'Çok İyi';
        if (band >= 6.0) return 'Yetkin';
        if (band >= 5.0) return 'Orta';
        if (band >= 4.0) return 'Sınırlı';
        return 'Temel';
      }
      if (band >= 8.0) return 'Excellent';
      if (band >= 7.0) return 'Very Good';
      if (band >= 6.0) return 'Competent';
      if (band >= 5.0) return 'Modest';
      if (band >= 4.0) return 'Limited';
      return 'Basic';
    };

    // Get the skill name based on test mode
    const getSkillName = () => {
      if (testMode === 'reading') return language === 'vi' ? 'Đọc' : language === 'tr' ? 'Okuma' : 'Reading';
      if (testMode === 'listening') return language === 'vi' ? 'Nghe' : language === 'tr' ? 'Dinleme' : 'Listening';
      if (testMode === 'writing') return language === 'vi' ? 'Viết' : language === 'tr' ? 'Yazma' : 'Writing';
      if (testMode === 'speaking') return language === 'vi' ? 'Nói' : language === 'tr' ? 'Konuşma' : 'Speaking';
      return '';
    };

    // Get the skill band for single skill tests
    const getSkillBand = () => {
      if (testMode === 'reading') return results.reading?.band || 4.0;
      if (testMode === 'listening') return results.listening?.band_score || 4.0;
      if (testMode === 'writing') return results.writing?.overall_band || 4.0;
      if (testMode === 'speaking') return results.speaking?.overall_band || 4.0;
      return 4.0;
    };

    // Get skill icon
    const getSkillIcon = () => {
      if (testMode === 'reading') return BookOpen;
      if (testMode === 'listening') return Headphones;
      if (testMode === 'writing') return PenTool;
      if (testMode === 'speaking') return Mic;
      return Target;
    };

    const isStillEvaluating = evaluating;
    const isSingleSkillTest = testMode !== 'full';
    const SkillIconComponent = getSkillIcon();

    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-blue-50 py-12 px-4">
        <LanguageSwitcher />
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${isSingleSkillTest ? getBandColor(getSkillBand()) : 'from-violet-500 to-purple-600'} mb-4`}>
              {isSingleSkillTest ? <SkillIconComponent className="w-10 h-10 text-white" /> : <Trophy className="w-10 h-10 text-white" />}
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {isSingleSkillTest ? (
                language === 'vi' ? `Kết Quả Kiểm Tra ${getSkillName()}` :
                language === 'tr' ? `${getSkillName()} Testi Sonuçlarınız` :
                `Your ${getSkillName()} Test Results`
              ) : (
                language === 'vi' ? 'Kết Quả Đánh Giá Toàn Diện' :
                language === 'tr' ? 'Kapsamlı Değerlendirme Sonuçlarınız' :
                'Your Comprehensive Assessment Results'
              )}
            </h1>
            <p className="text-gray-600 text-lg">
              {isSingleSkillTest ? (
                language === 'vi' ? `Phân tích chi tiết kỹ năng ${getSkillName().toLowerCase()} của bạn` :
                language === 'tr' ? `${getSkillName()} becerinizin detaylı analizi` :
                `Detailed analysis of your ${getSkillName().toLowerCase()} skills`
              ) : (
                language === 'vi' ? 'Phân tích chi tiết trình độ tiếng Anh của bạn' :
                language === 'tr' ? 'İngilizce yeterlilik seviyenizin detaylı analizi' :
                'Detailed analysis of your English proficiency level'
              )}
            </p>
          </div>

          {/* Single Skill Result Display */}
          {isSingleSkillTest && !isStillEvaluating && (
            <Card className={`p-8 bg-gradient-to-br ${getBandColor(getSkillBand())} text-white shadow-2xl mb-8`}>
              <div className="text-center">
                <p className="text-white/90 text-lg mb-2">
                  {language === 'vi' ? `Band ${getSkillName()} Của Bạn` :
                   language === 'tr' ? `${getSkillName()} Bandınız` :
                   `Your ${getSkillName()} Band`}
                </p>
                <div className="text-7xl font-bold mb-2">
                  {getSkillBand().toFixed(1)}
                </div>
                <p className="text-2xl font-semibold text-white/95 mb-4">
                  {getBandLabel(getSkillBand())}
                </p>
              </div>
            </Card>
          )}

          {/* Full Test Result Display - Overall Band Score */}
          {!isSingleSkillTest && results.overall_band ? (
            <Card className={`p-8 bg-gradient-to-br ${getBandColor(results.overall_band)} text-white shadow-2xl mb-8`}>
              <div className="text-center">
                <p className="text-white/90 text-lg mb-2">
                  {language === 'vi' ? 'Band IELTS Tổng Quát' :
                   language === 'tr' ? 'Genel IELTS Bandınız' :
                   'Your Overall IELTS Band'}
                </p>
                <div className="text-7xl font-bold mb-2">
                  {results.overall_band.toFixed(1)}
                </div>
                <p className="text-2xl font-semibold text-white/95 mb-4">
                  {getBandLabel(results.overall_band)} - {results.speaking?.cefr_level || 'B1'}
                </p>
                <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto mt-6">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                    <BookOpen className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-sm text-white/80">
                      {language === 'vi' ? 'Đọc' : language === 'tr' ? 'Okuma' : 'Reading'}
                    </p>
                    <p className="text-2xl font-bold">{results.reading?.band?.toFixed(1) || '4.0'}</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                    <Headphones className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-sm text-white/80">
                      {language === 'vi' ? 'Nghe' : language === 'tr' ? 'Dinleme' : 'Listening'}
                    </p>
                    <p className="text-2xl font-bold">{results.listening?.band_score?.toFixed(1) || '4.0'}</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                    <PenTool className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-sm text-white/80">
                      {language === 'vi' ? 'Viết' : language === 'tr' ? 'Yazma' : 'Writing'}
                    </p>
                    <p className="text-2xl font-bold">{results.writing?.overall_band?.toFixed(1) || '4.0'}</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                    <Mic className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-sm text-white/80">
                      {language === 'vi' ? 'Nói' : language === 'tr' ? 'Konuşma' : 'Speaking'}
                    </p>
                    <p className="text-2xl font-bold">{results.speaking?.overall_band?.toFixed(1) || '4.0'}</p>
                  </div>
                </div>
              </div>
            </Card>
          ) : !isSingleSkillTest && isStillEvaluating && (
            <Card className="p-8 bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-2xl mb-8">
              <div className="text-center">
                <p className="text-white/90 text-lg mb-2">
                  {language === 'vi' ? 'Đang đánh giá bài kiểm tra của bạn...' :
                   language === 'tr' ? 'Sınavınız değerlendiriliyor...' :
                   'Evaluating your test...'}
                </p>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <div className="w-3 h-3 bg-white rounded-full animate-bounce" />
                  <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            </Card>
          )}

          {/* Single Skill Specific Feedback */}
          {isSingleSkillTest && !isStillEvaluating && (
            <div className="mb-8">
              {/* Reading specific feedback */}
              {testMode === 'reading' && results.reading && (
                <div className="space-y-6">
                  {/* Score Overview */}
                  <Card className="p-6 bg-white shadow-lg">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      {language === 'vi' ? 'Kết Quả Chi Tiết' : language === 'tr' ? 'Detaylı Sonuçlar' : 'Detailed Results'}
                    </h3>
                    <div className="mb-4">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          {language === 'vi' ? 'Điểm' : language === 'tr' ? 'Puan' : 'Score'}
                        </span>
                        <span className="text-sm font-bold text-blue-600">
                          {results.reading.correct}/{results.reading.total} {language === 'vi' ? 'đúng' : language === 'tr' ? 'doğru' : 'correct'}
                        </span>
                      </div>
                      <Progress value={(results.reading.correct / results.reading.total) * 100} className="h-2" />
                    </div>
                    {results.reading.skill_breakdown && Object.keys(results.reading.skill_breakdown).length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          {language === 'vi' ? 'Phân tích kỹ năng:' : language === 'tr' ? 'Beceri Dağılımı:' : 'Skill Breakdown:'}
                        </p>
                        {Object.entries(results.reading.skill_breakdown).map(([skill, data]) => (
                          <div key={skill} className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 capitalize">{skill.replace(/_/g, ' ')}</span>
                            <span className={`font-medium ${data.correct === data.total ? 'text-green-600' : 'text-amber-600'}`}>
                              {data.correct}/{data.total}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>

                  {/* Locate & Explain - Question by Question Review */}
                  <Card className="p-6 bg-white shadow-lg">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      {language === 'vi' ? 'Đáp Án Chi Tiết' : language === 'tr' ? 'Detaylı Cevap İncelemesi' : 'Answer Review - Locate & Explain'}
                    </h3>
                    <div className="space-y-2">
                      {readingQuestions.map((q, idx) => {
                        const userAnswer = readingAnswers[q.id];
                        const isCorrect = userAnswer === q.correct;
                        const userAnswerText = q.options.find(opt => opt.startsWith(userAnswer))?.substring(3) || userAnswer;
                        const correctAnswerText = q.options.find(opt => opt.startsWith(q.correct))?.substring(3) || q.correct;
                        
                        return (
                          <LocateExplain
                            key={q.id}
                            questionNumber={idx + 1}
                            questionText={q.question}
                            userAnswer={userAnswerText}
                            correctAnswer={correctAnswerText}
                            isCorrect={isCorrect}
                            passageExcerpt={q.passageExcerpt}
                            explanation={q.explanation}
                            wrongExplanation={!isCorrect ? `You selected "${userAnswerText}" but the passage indicates "${correctAnswerText}".` : null}
                            skillTip={q.skillTip}
                            language={language}
                          />
                        );
                      })}
                    </div>
                  </Card>
                </div>
              )}

              {/* Listening specific feedback */}
              {testMode === 'listening' && results.listening && (
                <div className="space-y-6">
                  {/* Overall Feedback */}
                  <Card className="p-6 bg-white shadow-lg">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Headphones className="w-5 h-5 text-cyan-600" />
                      {language === 'vi' ? 'Kết Quả Chi Tiết' : language === 'tr' ? 'Detaylı Sonuçlar' : 'Detailed Results'}
                    </h3>
                    
                    {/* Score Overview */}
                    <div className="mb-4">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          {language === 'vi' ? 'Điểm' : language === 'tr' ? 'Puan' : 'Score'}
                        </span>
                        <span className="text-sm font-bold text-cyan-600">
                          {results.listening.correct}/{results.listening.total} {language === 'vi' ? 'đúng' : language === 'tr' ? 'doğru' : 'correct'} ({results.listening.percentage?.toFixed(0)}%)
                        </span>
                      </div>
                      <Progress value={results.listening.percentage || 0} className="h-2" />
                    </div>
                    
                    {/* Overall Feedback Message */}
                    {results.listening.overall_feedback && (
                      <p className="text-sm text-gray-700 bg-cyan-50 p-3 rounded-lg mb-4">
                        {results.listening.overall_feedback}
                      </p>
                    )}
                    
                    {/* Skill Breakdown */}
                    {results.listening.skill_breakdown && results.listening.skill_breakdown.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          {language === 'vi' ? 'Phân tích kỹ năng:' : language === 'tr' ? 'Beceri Dağılımı:' : 'Skill Breakdown:'}
                        </p>
                        <div className="space-y-2">
                          {results.listening.skill_breakdown.map((skill, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">{skill.label}</span>
                              <span className={`font-medium ${skill.correct === skill.total ? 'text-green-600' : skill.correct > 0 ? 'text-amber-600' : 'text-red-500'}`}>
                                {skill.correct}/{skill.total}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>

                  {/* Question-by-Question Review */}
                  {results.listening.question_results && results.listening.question_results.length > 0 && (
                    <Card className="p-6 bg-white shadow-lg">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-cyan-600" />
                        {language === 'vi' ? 'Đáp Án Chi Tiết' : language === 'tr' ? 'Detaylı Cevaplar' : 'Answer Review'}
                      </h3>
                      <div className="space-y-4">
                        {results.listening.question_results.map((q, idx) => (
                          <div key={idx} className={`p-4 rounded-lg border-l-4 ${q.is_correct ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
                            <div className="flex items-start justify-between mb-2">
                              <p className="font-medium text-gray-900 text-sm flex-1">{idx + 1}. {q.question_text}</p>
                              <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${q.is_correct ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                                {q.is_correct ? (language === 'vi' ? 'Đúng' : language === 'tr' ? 'Doğru' : 'Correct') : (language === 'vi' ? 'Sai' : language === 'tr' ? 'Yanlış' : 'Incorrect')}
                              </span>
                            </div>
                            <div className="text-sm space-y-1">
                              <p className="text-gray-600">
                                <span className="font-medium">{language === 'vi' ? 'Câu trả lời của bạn:' : language === 'tr' ? 'Cevabınız:' : 'Your answer:'}</span> 
                                <span className={q.is_correct ? 'text-green-700' : 'text-red-700'}> {q.user_answer}</span>
                              </p>
                              {!q.is_correct && (
                                <p className="text-gray-600">
                                  <span className="font-medium">{language === 'vi' ? 'Đáp án đúng:' : language === 'tr' ? 'Doğru cevap:' : 'Correct answer:'}</span> 
                                  <span className="text-green-700"> {q.correct_option_text || q.correct_answer}</span>
                                </p>
                              )}
                              {q.explanation && (
                                <div className="mt-2 p-2 bg-white rounded border">
                                  <p className="text-xs text-gray-500 font-medium mb-1">
                                    {language === 'vi' ? 'Giải thích:' : language === 'tr' ? 'Açıklama:' : 'Explanation:'}
                                  </p>
                                  <p className="text-xs text-gray-700">{q.explanation}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* Skill Improvement Guidance */}
                  {results.listening.skill_guidance && results.listening.skill_guidance.length > 0 && (
                    <Card className="p-6 bg-white shadow-lg">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-amber-500" />
                        {language === 'vi' ? 'Hướng Dẫn Cải Thiện' : language === 'tr' ? 'İyileştirme Rehberi' : 'Improvement Guidance'}
                      </h3>
                      <div className="space-y-3">
                        {results.listening.skill_guidance.map((item, idx) => (
                          <div key={idx} className="p-3 bg-amber-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900 text-sm">{item.skill}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${item.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                {item.priority === 'high' ? (language === 'vi' ? 'Ưu tiên' : language === 'tr' ? 'Öncelikli' : 'Priority') : (language === 'vi' ? 'Khuyến nghị' : language === 'tr' ? 'Önerilen' : 'Recommended')}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{item.tip}</p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* Course Recommendations */}
                  {results.listening.course_recommendations && results.listening.course_recommendations.length > 0 && (
                    <Card className="p-6 bg-gradient-to-br from-cyan-50 to-teal-50 border-0">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-cyan-600" />
                        {language === 'vi' ? 'Khóa Học Đề Xuất' : language === 'tr' ? 'Önerilen Kurslar' : 'Recommended Courses'}
                      </h3>
                      <div className="space-y-3">
                        {results.listening.course_recommendations.map((course, idx) => (
                          <div key={idx} className="p-4 bg-white rounded-lg shadow-sm">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium text-gray-900">{course.name}</h4>
                                <p className="text-sm text-gray-600 mt-1">{course.description}</p>
                                <p className="text-xs text-gray-500 mt-2">
                                  {language === 'vi' ? 'Thời lượng:' : language === 'tr' ? 'Süre:' : 'Duration:'} {course.duration}
                                </p>
                              </div>
                              <span className={`text-xs px-2 py-1 rounded-full ${course.priority === 'recommended' ? 'bg-cyan-100 text-cyan-700' : 'bg-gray-100 text-gray-600'}`}>
                                {course.priority === 'recommended' ? (language === 'vi' ? 'Đề xuất' : language === 'tr' ? 'Önerilen' : 'Recommended') : (language === 'vi' ? 'Bổ sung' : language === 'tr' ? 'Ek' : 'Supplementary')}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </div>
              )}

              {/* Writing specific feedback */}
              {testMode === 'writing' && results.writing && (
                <Card className="p-6 bg-white shadow-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <PenTool className="w-5 h-5 text-amber-600" />
                    {language === 'vi' ? 'Kết Quả Chi Tiết' : language === 'tr' ? 'Detaylı Sonuçlar' : 'Detailed Results'}
                  </h3>
                  {results.writing.task_evaluations && results.writing.task_evaluations.map((task, idx) => (
                    <div key={idx} className="mb-4 p-4 bg-amber-50 rounded-lg">
                      <p className="font-medium text-gray-900 mb-2">
                        {language === 'vi' ? `Bài ${idx + 1}` : language === 'tr' ? `Görev ${idx + 1}` : `Task ${idx + 1}`}: Band {task.band_score?.toFixed(1)}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">{task.feedback}</p>
                      <p className="text-xs text-gray-500">
                        {language === 'vi' ? 'Số từ' : language === 'tr' ? 'Kelime sayısı' : 'Word count'}: {task.word_count}
                      </p>
                    </div>
                  ))}
                  {results.writing.top_tips && results.writing.top_tips.length > 0 && (
                    <div className="mt-4">
                      <p className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-600" />
                        {language === 'vi' ? 'Gợi ý cải thiện:' : language === 'tr' ? 'İyileştirme ipuçları:' : 'Improvement Tips:'}
                      </p>
                      <ul className="space-y-1">
                        {results.writing.top_tips.map((tip, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-amber-500">•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>
              )}

              {/* Speaking specific feedback */}
              {testMode === 'speaking' && results.speaking && (
                <Card className="p-6 bg-white shadow-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Mic className="w-5 h-5 text-purple-600" />
                    {language === 'vi' ? 'Kết Quả Chi Tiết' : language === 'tr' ? 'Detaylı Sonuçlar' : 'Detailed Results'}
                  </h3>
                  {results.speaking.criteria_breakdown && (
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {Object.entries(results.speaking.criteria_breakdown).map(([criterion, score]) => (
                        <div key={criterion} className="p-3 bg-purple-50 rounded-lg">
                          <p className="text-xs text-gray-500 capitalize">{criterion.replace(/_/g, ' ')}</p>
                          <p className="text-lg font-bold text-purple-600">{score?.toFixed(1) || 'N/A'}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {results.speaking.feedback && (
                    <p className="text-sm text-gray-600 mb-4">{results.speaking.feedback}</p>
                  )}
                  {results.speaking.weaknesses && results.speaking.weaknesses.length > 0 && (
                    <div>
                      <p className="font-medium text-gray-900 mb-2">
                        {language === 'vi' ? 'Điểm cần cải thiện:' : language === 'tr' ? 'Geliştirilecek alanlar:' : 'Areas to Improve:'}
                      </p>
                      <ul className="space-y-1">
                        {results.speaking.weaknesses.map((weakness, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                            {weakness}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>
              )}
            </div>
          )}

          {/* Detailed Breakdown - Only show for full test */}
          {!isSingleSkillTest && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Reading Skills */}
            {results.reading && (
            <Card className="p-6 bg-white shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                {language === 'vi' ? 'Kết Quả Đọc' : language === 'tr' ? 'Okuma Performansı' : 'Reading Performance'}
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
            )}

            {/* Speaking Skills */}
            {results.speaking && (
            <Card className="p-6 bg-white shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Mic className="w-5 h-5 text-purple-600" />
                {language === 'vi' ? 'Kết Quả Nói' : language === 'tr' ? 'Konuşma Performansı' : 'Speaking Performance'}
              </h3>
              {results.speaking ? (
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
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-purple-600">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-600 border-t-transparent" />
                    <span className="text-sm font-medium">
                      {language === 'vi' ? 'Đang phân tích...' :
                       language === 'tr' ? 'Analiz ediliyor...' :
                       'Analyzing your speaking...'}
                    </span>
                  </div>
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="flex justify-between mb-1">
                        <div className="h-4 bg-gray-200 rounded w-32" />
                        <div className="h-4 bg-gray-200 rounded w-8" />
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2" />
                    </div>
                  ))}
                </div>
              )}
            </Card>
            )}
          </div>
          )}

          {/* Strengths & Weaknesses - Only show for full test */}
          {!isSingleSkillTest && results.speaking && (
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Strengths */}
              <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-0">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  {language === 'vi' ? 'Điểm Mạnh' : language === 'tr' ? 'Güçlü Yönler' : 'Your Strengths'}
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
                  {language === 'vi' ? 'Cần Cải Thiện' : language === 'tr' ? 'Geliştirilecek Alanlar' : 'Areas to Improve'}
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
          )}

          {/* Detailed Feedback - Only for full test */}
          {!isSingleSkillTest && results.speaking?.detailed_feedback && (
            <Card className="p-6 bg-white shadow-lg mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-600" />
                {language === 'vi' ? 'Phân Tích Toàn Diện' : language === 'tr' ? 'Kapsamlı Analiz' : 'Comprehensive Analysis'}
              </h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {results.speaking.detailed_feedback}
              </p>
            </Card>
          )}

          {/* Improvement Recommendations - Only for full test */}
          {!isSingleSkillTest && results.speaking?.improvement_recommendations && (
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-0 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-blue-600" />
                {language === 'vi' ? 'Kế Hoạch Hành Động' : language === 'tr' ? 'Eylem Planı' : 'Action Plan: How to Improve'}
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
          )}

          {/* Course Recommendations - Only for full test */}
          {!isSingleSkillTest && results.recommendations && (
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
            {/* Take Another Test Button */}
            <Button
              onClick={() => {
                // Reset state and go back to selection
                setTestMode(null);
                setStage('select');
                setCurrentQuestion(0);
                setReadingAnswers({});
                setListeningAnswers({});
                setWritingResponses({});
                setSpeakingResponses([]);
                setCurrentListeningSection(0);
                setCurrentWritingTask(0);
                setCurrentSpeakingPrompt(0);
                setResults(null);
              }}
              size="lg"
              variant="outline"
              className="border-2 border-violet-600 text-violet-600 hover:bg-violet-50"
            >
              <Target className="w-5 h-5 mr-2" />
              {language === 'vi' ? 'Làm Bài Kiểm Tra Khác' : language === 'tr' ? 'Başka Bir Test Yap' : 'Take Another Test'}
            </Button>
            {!user && (
              <Button
                onClick={() => {
                  // Navigate to landing page with signup modal trigger
                  window.location.href = '/?action=signup';
                }}
                size="lg"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                <Award className="w-5 h-5 mr-2" />
                {language === 'vi' ? 'Đăng Ký Lưu Kết Quả' : language === 'tr' ? 'Sonuçları Kaydetmek için Üye Ol' : 'Sign Up to Save Your Results'}
              </Button>
            )}
            <Button
              onClick={() => {
                if (user) {
                  navigate('/dashboard');
                } else {
                  // Navigate to landing page with signup modal trigger
                  window.location.href = '/?action=signup';
                }
              }}
              size="lg"
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
            >
              {user ? (language === 'vi' ? 'Đến Trang Cá Nhân' : language === 'tr' ? 'Panele Git' : 'Go to Dashboard') : (language === 'vi' ? 'Bắt Đầu Luyện Tập Miễn Phí' : language === 'tr' ? 'Ücretsiz Pratik Başlat' : 'Start Free Practice')}
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
