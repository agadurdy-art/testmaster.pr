import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Input } from '../components/ui/input';
import { 
  BookOpen, Volume2, Mic, Square, Play, ChevronLeft, ChevronRight, 
  CheckCircle, XCircle, RotateCcw, Shuffle, Trophy, Star, GraduationCap,
  ArrowLeft, Loader2, Image
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Band level configuration
const BAND_LEVELS = [
  { id: 'beginner', label: 'Band 4.5 & Below', color: 'from-green-500 to-emerald-600', icon: '🌱' },
  { id: 'intermediate', label: 'Band 4.5 - 6.5', color: 'from-yellow-500 to-orange-500', icon: '📚' },
  { id: 'advanced', label: 'Band 6.5+', color: 'from-red-500 to-pink-600', icon: '🎯' }
];

// Vocabulary illustration URLs (using Unsplash for high-quality free images)
const getVocabImage = (word) => {
  const imageMap = {
    'usually': 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=400&h=300&fit=crop',
    'schedule': 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=300&fit=crop',
    'convenient': 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
    'prefer': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop',
    'regularly': 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop',
    'close': 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=300&fit=crop',
    'supportive': 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=400&h=300&fit=crop',
    'relative': 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&h=300&fit=crop',
    'spacious': 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop',
    'cozy': 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400&h=300&fit=crop',
    'neighborhood': 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400&h=300&fit=crop',
    'attend': 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=300&fit=crop',
    'graduate': 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=300&fit=crop',
    'improve': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop',
    'knowledge': 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=300&fit=crop',
    'colleague': 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop',
    'salary': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop',
    'rewarding': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
    'challenging': 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=300&fit=crop',
    'sustainable': 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=300&fit=crop',
    'emissions': 'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=400&h=300&fit=crop',
    'renewable': 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop',
    'biodiversity': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
    'revolutionize': 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop',
    'technology': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop',
    'unprecedented': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop',
    'exacerbate': 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=400&h=300&fit=crop',
    'ubiquitous': 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop',
    'paradigm': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
  };
  
  // Return specific image or a default based on word type
  if (imageMap[word.toLowerCase()]) {
    return imageMap[word.toLowerCase()];
  }
  
  // Default images by category
  return 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=300&fit=crop';
};

export default function VocabGrammarCourse({ user }) {
  const navigate = useNavigate();
  
  // ALL HOOKS MUST BE AT TOP LEVEL - NEVER INSIDE CONDITIONS
  const [selectedBand, setSelectedBand] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('bands');
  const [practiceMode, setPracticeMode] = useState(null);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [playingAudio, setPlayingAudio] = useState(null);
  const [recording, setRecording] = useState(false);
  const [pronunciationResult, setPronunciationResult] = useState(null);
  const [practiceAnswers, setPracticeAnswers] = useState({});
  const [practiceScore, setPracticeScore] = useState({ correct: 0, total: 0 });
  const [showResults, setShowResults] = useState(false);
  
  // States for practice modes - MUST be at top level
  const [fillBlankInput, setFillBlankInput] = useState('');
  const [matchingSelectedWord, setMatchingSelectedWord] = useState(null);
  const [matchingMatches, setMatchingMatches] = useState({});
  const [shuffledDefs, setShuffledDefs] = useState([]);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Fetch lessons for selected band
  useEffect(() => {
    if (selectedBand) {
      fetchLessons();
    }
  }, [selectedBand]);

  // Initialize shuffled definitions when entering matching mode
  useEffect(() => {
    if (practiceMode === 'matching' && selectedLesson?.items) {
      setShuffledDefs([...selectedLesson.items].sort(() => Math.random() - 0.5));
    }
  }, [practiceMode, selectedLesson]);

  // Reset fill blank input when question changes
  useEffect(() => {
    setFillBlankInput('');
  }, [currentItemIndex]);

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/vocab-grammar/lessons?band_level=${selectedBand}`);
      const data = await response.json();
      setLessons(data);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      toast.error('Failed to load lessons');
    } finally {
      setLoading(false);
    }
  };

  const fetchLessonDetail = async (lessonId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/vocab-grammar/lessons/${lessonId}`);
      const data = await response.json();
      setSelectedLesson(data);
      setView('lesson');
    } catch (error) {
      console.error('Error fetching lesson:', error);
      toast.error('Failed to load lesson');
    } finally {
      setLoading(false);
    }
  };

  // Text-to-Speech using browser's built-in speech synthesis as fallback
  const playPronunciation = async (text) => {
    setPlayingAudio(text);
    
    // Try browser's built-in speech synthesis first (more reliable)
    if ('speechSynthesis' in window) {
      try {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.8; // Slightly slower for learning
        utterance.pitch = 1;
        
        utterance.onend = () => setPlayingAudio(null);
        utterance.onerror = () => {
          setPlayingAudio(null);
          toast.error('Failed to play audio');
        };
        
        window.speechSynthesis.speak(utterance);
        return;
      } catch (error) {
        console.error('Speech synthesis error:', error);
      }
    }
    
    // Fallback to API TTS
    try {
      const response = await fetch(`${API_URL}/api/vocab-grammar/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      
      if (!response.ok) throw new Error('TTS failed');
      
      const data = await response.json();
      const audio = new Audio(`data:audio/mp3;base64,${data.audio}`);
      audio.onended = () => setPlayingAudio(null);
      audio.onerror = () => {
        setPlayingAudio(null);
        toast.error('Failed to play audio');
      };
      audio.play();
    } catch (error) {
      console.error('TTS error:', error);
      toast.error('Failed to play audio');
      setPlayingAudio(null);
    }
  };

  // Recording for pronunciation practice
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
        await evaluatePronunciation(blob);
      };

      mediaRecorder.start();
      setRecording(true);
      toast.info('Recording... Speak now!');
    } catch (error) {
      console.error('Microphone error:', error);
      toast.error('Failed to access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const evaluatePronunciation = async (audioBlob) => {
    const currentItem = selectedLesson?.items[currentItemIndex];
    if (!currentItem) return;

    toast.info('Analyzing your pronunciation...');
    
    try {
      const formData = new FormData();
      formData.append('file', new File([audioBlob], 'recording.webm', { type: 'audio/webm' }));
      
      const transcribeResponse = await fetch(`${API_URL}/api/speaking/transcribe`, {
        method: 'POST',
        body: formData
      });
      
      if (!transcribeResponse.ok) throw new Error('Transcription failed');
      const transcribeData = await transcribeResponse.json();
      
      const evalResponse = await fetch(`${API_URL}/api/vocab-grammar/evaluate-pronunciation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: currentItem.word,
          user_transcript: transcribeData.text || ''
        })
      });
      
      const evalData = await evalResponse.json();
      setPronunciationResult(evalData);
      
      if (evalData.score === 'correct') {
        toast.success('Excellent pronunciation! 🎉');
      } else if (evalData.score === 'partially_correct') {
        toast.info('Good try! Keep practicing.');
      } else {
        toast.warning('Let\'s try again!');
      }
    } catch (error) {
      console.error('Evaluation error:', error);
      toast.error('Failed to evaluate pronunciation');
    }
  };

  // Practice mode handlers
  const startPractice = (mode) => {
    setPracticeMode(mode);
    setCurrentItemIndex(0);
    setFlipped(false);
    setPracticeAnswers({});
    setPracticeScore({ correct: 0, total: 0 });
    setShowResults(false);
    setFillBlankInput('');
    setMatchingSelectedWord(null);
    setMatchingMatches({});
    if (mode === 'matching' && selectedLesson?.items) {
      setShuffledDefs([...selectedLesson.items].sort(() => Math.random() - 0.5));
    }
    setView('practice');
  };

  const checkMCQAnswer = (itemId, answer, correctAnswer) => {
    const isCorrect = answer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
    setPracticeAnswers(prev => ({ ...prev, [itemId]: { answer, isCorrect } }));
    setPracticeScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));
    return isCorrect;
  };

  const handleFillBlankSubmit = (currentItem) => {
    const isCorrect = fillBlankInput.toLowerCase().trim() === currentItem.word.toLowerCase().trim();
    setPracticeAnswers(prev => ({ ...prev, [currentItem.id]: { answer: fillBlankInput, isCorrect } }));
    setPracticeScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));
  };

  const handleMatchingSelect = (defItem) => {
    if (!matchingSelectedWord) return;
    
    const isCorrect = matchingSelectedWord.id === defItem.id;
    setMatchingMatches(prev => ({
      ...prev,
      [matchingSelectedWord.id]: { matched: defItem.id, isCorrect }
    }));
    
    setPracticeScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));
    
    setMatchingSelectedWord(null);
    
    // Check if all items matched
    const newMatchCount = Object.keys(matchingMatches).length + 1;
    if (newMatchCount === selectedLesson?.items?.length) {
      setTimeout(() => setShowResults(true), 500);
    }
  };

  // Render band selection
  const renderBandSelection = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Vocabulary & Grammar Course</h1>
        <p className="text-gray-600">Choose your level to start learning</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        {BAND_LEVELS.map((band) => (
          <Card 
            key={band.id}
            className={`p-6 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 border-2 ${
              selectedBand === band.id ? 'border-sky-500' : 'border-transparent'
            }`}
            onClick={() => {
              setSelectedBand(band.id);
              setView('lessons');
            }}
          >
            <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${band.color} flex items-center justify-center text-3xl mb-4`}>
              {band.icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{band.label}</h3>
            <p className="text-sm text-gray-600">
              {band.id === 'beginner' && 'Essential vocabulary and basic grammar for foundations'}
              {band.id === 'intermediate' && 'Academic vocabulary and complex structures'}
              {band.id === 'advanced' && 'Sophisticated expressions for Band 7+'}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );

  // Render lessons list
  const renderLessonsList = () => (
    <div className="max-w-4xl mx-auto">
      <Button 
        variant="ghost" 
        onClick={() => { setView('bands'); setSelectedBand(null); }}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Levels
      </Button>
      
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
          BAND_LEVELS.find(b => b.id === selectedBand)?.color
        } flex items-center justify-center text-2xl`}>
          {BAND_LEVELS.find(b => b.id === selectedBand)?.icon}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {BAND_LEVELS.find(b => b.id === selectedBand)?.label}
          </h2>
          <p className="text-gray-600">{lessons.length} lessons available</p>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-sky-500" />
        </div>
      ) : (
        <div className="space-y-4">
          {lessons.map((lesson) => (
            <Card 
              key={lesson.id}
              className="p-5 cursor-pointer hover:shadow-md transition-all hover:border-sky-300"
              onClick={() => fetchLessonDetail(lesson.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    lesson.type === 'vocabulary' ? 'bg-blue-100 text-blue-600' :
                    lesson.type === 'grammar' ? 'bg-purple-100 text-purple-600' :
                    lesson.type === 'idioms' ? 'bg-green-100 text-green-600' :
                    lesson.type === 'phrasal_verbs' ? 'bg-orange-100 text-orange-600' :
                    'bg-pink-100 text-pink-600'
                  }`}>
                    {lesson.type === 'grammar' ? <GraduationCap className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
                    <p className="text-sm text-gray-600">{lesson.description}</p>
                    <span className="text-xs text-gray-500 capitalize">{lesson.type?.replace('_', ' ')} • {lesson.items?.length || 0} items</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  // Render lesson detail with vocabulary items
  const renderLessonDetail = () => {
    if (!selectedLesson) return null;
    const currentItem = selectedLesson.items[currentItemIndex];
    const vocabImage = getVocabImage(currentItem?.word || '');
    
    return (
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => { setView('lessons'); setSelectedLesson(null); setCurrentItemIndex(0); }}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Lessons
        </Button>
        
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{selectedLesson.title}</h2>
              <p className="text-sm text-gray-600">{selectedLesson.description}</p>
            </div>
            <span className="px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-sm font-medium capitalize">
              {selectedLesson.type?.replace('_', ' ')}
            </span>
          </div>
          
          <Progress value={((currentItemIndex + 1) / selectedLesson.items.length) * 100} className="h-2 mb-2" />
          <p className="text-xs text-gray-500 text-right">{currentItemIndex + 1} of {selectedLesson.items.length}</p>
        </Card>
        
        {/* Current Item Card */}
        <Card className="p-8 mb-6">
          {/* Vocabulary Image */}
          {selectedLesson.type !== 'grammar' && (
            <div className="mb-6 rounded-lg overflow-hidden">
              <img 
                src={vocabImage} 
                alt={currentItem.word}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
          
          <div className="text-center mb-6">
            <h3 className="text-3xl font-bold text-gray-900 mb-2">{currentItem.word}</h3>
            
            {/* IPA Pronunciation & Part of Speech */}
            <div className="flex flex-wrap justify-center gap-2 mb-2">
              {currentItem.ipa && (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-mono">
                  {currentItem.ipa}
                </span>
              )}
              {currentItem.part_of_speech && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm capitalize">
                  {currentItem.part_of_speech}
                </span>
              )}
            </div>
            
            {/* Stress Pattern */}
            {currentItem.stress_pattern && currentItem.stress_pattern !== 'N/A' && (
              <p className="text-sm text-gray-500 italic mb-4">
                🔊 Stress: {currentItem.stress_pattern}
              </p>
            )}
            
            {/* Audio Button */}
            <Button
              variant="outline"
              size="lg"
              onClick={() => playPronunciation(currentItem.word)}
              disabled={playingAudio === currentItem.word}
              className="mb-4"
            >
              {playingAudio === currentItem.word ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Volume2 className="w-5 h-5 mr-2" />
              )}
              Listen to Pronunciation
            </Button>
          </div>
          
          {/* Definition */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-sm font-medium text-gray-500 mb-1">Definition</p>
            <p className="text-gray-900">{currentItem.definition}</p>
          </div>
          
          {/* Grammar Formula (for grammar items) */}
          {currentItem.grammar_formula && (
            <div className="bg-purple-50 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium text-purple-700 mb-1">📐 Formula</p>
              <p className="text-purple-900 font-mono text-sm">{currentItem.grammar_formula}</p>
            </div>
          )}
          
          {/* Examples */}
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-500 mb-2">Examples</p>
            <ul className="space-y-2">
              {currentItem.examples.map((ex, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-sky-500">•</span>
                  <span className="text-gray-700">{ex}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Collocations */}
          {currentItem.collocations && currentItem.collocations.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-500 mb-2">Common Collocations</p>
              <div className="flex flex-wrap gap-2">
                {currentItem.collocations.map((col, idx) => (
                  <span key={idx} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm border border-green-200">
                    {col}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Common Mistakes (for grammar) */}
          {currentItem.common_mistakes && currentItem.common_mistakes.length > 0 && (
            <div className="bg-red-50 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium text-red-700 mb-2">⚠️ Common Mistakes</p>
              <ul className="space-y-1">
                {currentItem.common_mistakes.map((mistake, idx) => (
                  <li key={idx} className="text-sm text-red-800">{mistake}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* IELTS Tip */}
          {(currentItem.ielts_tip || currentItem.ielts_band_impact) && (
            <div className="bg-sky-50 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium text-sky-700 mb-1">💡 IELTS Tip</p>
              <p className="text-sm text-sky-800">{currentItem.ielts_tip || currentItem.ielts_band_impact}</p>
            </div>
          )}
          
          {/* Pronunciation Practice */}
          <div className="border-t pt-6">
            <p className="text-sm font-medium text-gray-700 mb-3">🎤 Practice Your Pronunciation</p>
            <div className="flex gap-3 justify-center">
              {!recording ? (
                <Button onClick={startRecording} className="primary-gradient text-white">
                  <Mic className="w-4 h-4 mr-2" /> Record
                </Button>
              ) : (
                <Button onClick={stopRecording} className="bg-red-500 text-white hover:bg-red-600">
                  <Square className="w-4 h-4 mr-2" /> Stop
                </Button>
              )}
            </div>
            
            {pronunciationResult && (
              <div className={`mt-4 p-4 rounded-lg ${
                pronunciationResult.score === 'correct' ? 'bg-green-50 border border-green-200' :
                pronunciationResult.score === 'partially_correct' ? 'bg-yellow-50 border border-yellow-200' :
                'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {pronunciationResult.score === 'correct' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : pronunciationResult.score === 'partially_correct' ? (
                    <Star className="w-5 h-5 text-yellow-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className="font-medium">{pronunciationResult.score_percent}% Match</span>
                </div>
                <p className="text-sm text-gray-700">{pronunciationResult.feedback}</p>
                <p className="text-sm text-gray-600 mt-1">💡 Tip: {pronunciationResult.tip}</p>
              </div>
            )}
          </div>
        </Card>
        
        {/* Navigation */}
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="outline"
            onClick={() => { setCurrentItemIndex(Math.max(0, currentItemIndex - 1)); setPronunciationResult(null); }}
            disabled={currentItemIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" /> Previous
          </Button>
          
          <Button
            onClick={() => { setCurrentItemIndex(Math.min(selectedLesson.items.length - 1, currentItemIndex + 1)); setPronunciationResult(null); }}
            disabled={currentItemIndex === selectedLesson.items.length - 1}
            className="primary-gradient text-white"
          >
            Next <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
        
        {/* Practice Modes */}
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">🎮 Practice Modes</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" onClick={() => startPractice('flashcard')} className="flex-col h-auto py-4">
              <RotateCcw className="w-6 h-6 mb-2" />
              <span className="text-sm">Flashcards</span>
            </Button>
            <Button variant="outline" onClick={() => startPractice('fillblank')} className="flex-col h-auto py-4">
              <BookOpen className="w-6 h-6 mb-2" />
              <span className="text-sm">Fill Blanks</span>
            </Button>
            <Button variant="outline" onClick={() => startPractice('mcq')} className="flex-col h-auto py-4">
              <CheckCircle className="w-6 h-6 mb-2" />
              <span className="text-sm">Quiz</span>
            </Button>
            <Button variant="outline" onClick={() => startPractice('matching')} className="flex-col h-auto py-4">
              <Shuffle className="w-6 h-6 mb-2" />
              <span className="text-sm">Matching</span>
            </Button>
          </div>
        </Card>
      </div>
    );
  };

  // Render practice modes
  const renderPractice = () => {
    if (!selectedLesson || !practiceMode) return null;
    
    // Results screen
    if (showResults) {
      return (
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Practice Complete!</h2>
            <p className="text-4xl font-bold text-sky-600 mb-4">
              {practiceScore.correct} / {practiceScore.total}
            </p>
            <p className="text-gray-600 mb-6">
              {practiceScore.correct === practiceScore.total ? '🎉 Perfect score!' :
               practiceScore.correct >= practiceScore.total * 0.7 ? '👍 Great job!' :
               'Keep practicing!'}
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => startPractice(practiceMode)}>
                <RotateCcw className="w-4 h-4 mr-2" /> Try Again
              </Button>
              <Button onClick={() => setView('lesson')} className="primary-gradient text-white">
                Back to Lesson
              </Button>
            </div>
          </Card>
        </div>
      );
    }
    
    const items = selectedLesson.items;
    const currentItem = items[currentItemIndex];
    
    // Flashcard mode - IMPROVED with definition on back
    if (practiceMode === 'flashcard') {
      const vocabImage = getVocabImage(currentItem?.word || '');
      
      return (
        <div className="max-w-2xl mx-auto">
          <Button variant="ghost" onClick={() => setView('lesson')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Lesson
          </Button>
          
          <Card 
            className={`p-8 min-h-[400px] cursor-pointer transition-all transform ${flipped ? 'bg-gradient-to-br from-sky-50 to-blue-50' : 'bg-white'}`}
            onClick={() => setFlipped(!flipped)}
          >
            <div className="text-center h-full flex flex-col justify-center">
              <p className="text-sm text-gray-500 mb-4">Click to flip • {currentItemIndex + 1}/{items.length}</p>
              
              {!flipped ? (
                // FRONT SIDE - Word + Image
                <div>
                  {selectedLesson.type !== 'grammar' && (
                    <div className="mb-4 rounded-lg overflow-hidden max-w-xs mx-auto">
                      <img 
                        src={vocabImage} 
                        alt={currentItem.word}
                        className="w-full h-32 object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  )}
                  <h2 className="text-4xl font-bold text-gray-900 mb-3">{currentItem.word}</h2>
                  {currentItem.ipa && (
                    <p className="text-lg text-purple-600 font-mono mb-2">{currentItem.ipa}</p>
                  )}
                  {currentItem.part_of_speech && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm capitalize">
                      {currentItem.part_of_speech}
                    </span>
                  )}
                  <p className="text-gray-400 mt-4 text-sm">Tap to see definition →</p>
                </div>
              ) : (
                // BACK SIDE - Definition + Example + Collocations
                <div className="text-left">
                  <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 mb-1">Definition</p>
                    <p className="text-xl text-gray-900">{currentItem.definition}</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 mb-1">Example</p>
                    <p className="text-gray-700 italic">"{currentItem.examples[0]}"</p>
                  </div>
                  
                  {currentItem.collocations && currentItem.collocations.length > 0 && (
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-sm font-medium text-gray-500 mb-2">Collocations</p>
                      <div className="flex flex-wrap gap-2">
                        {currentItem.collocations.slice(0, 3).map((col, idx) => (
                          <span key={idx} className="px-2 py-1 bg-green-50 text-green-700 rounded text-sm">
                            {col}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <p className="text-gray-400 mt-4 text-sm text-center">← Tap to see word</p>
                </div>
              )}
            </div>
          </Card>
          
          <div className="flex justify-between mt-4">
            <Button
              variant="outline"
              onClick={() => { setCurrentItemIndex(Math.max(0, currentItemIndex - 1)); setFlipped(false); }}
              disabled={currentItemIndex === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            {currentItemIndex === items.length - 1 ? (
              <Button onClick={() => setShowResults(true)} className="primary-gradient text-white">
                Finish
              </Button>
            ) : (
              <Button
                onClick={() => { setCurrentItemIndex(currentItemIndex + 1); setFlipped(false); }}
                className="primary-gradient text-white"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      );
    }
    
    // Multiple Choice Quiz
    if (practiceMode === 'mcq') {
      const answered = practiceAnswers[currentItem.id];
      const otherItems = items.filter(i => i.id !== currentItem.id);
      const wrongOptions = otherItems.slice(0, 3).map(i => i.definition);
      const allOptions = [currentItem.definition, ...wrongOptions];
      // Shuffle options (but keep them stable for this question)
      const shuffledOptions = useMemo(() => 
        [...allOptions].sort(() => 0.5 - Math.random()), 
        [currentItem.id]
      );
      
      return (
        <div className="max-w-2xl mx-auto">
          <Button variant="ghost" onClick={() => setView('lesson')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Lesson
          </Button>
          
          <Card className="p-6">
            <p className="text-sm text-gray-500 mb-4">Question {currentItemIndex + 1} of {items.length}</p>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">What does "{currentItem.word}" mean?</h2>
            
            <div className="space-y-3">
              {shuffledOptions.map((option, idx) => (
                <button
                  key={idx}
                  disabled={!!answered}
                  onClick={() => checkMCQAnswer(currentItem.id, option, currentItem.definition)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                    answered
                      ? option === currentItem.definition
                        ? 'border-green-500 bg-green-50'
                        : answered.answer === option
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200'
                      : 'border-gray-200 hover:border-sky-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            
            {answered && (
              <div className={`mt-4 p-3 rounded-lg ${answered.isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                {answered.isCorrect ? (
                  <p className="text-green-700 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" /> Correct!
                  </p>
                ) : (
                  <p className="text-red-700 flex items-center gap-2">
                    <XCircle className="w-5 h-5" /> The correct answer is: {currentItem.definition}
                  </p>
                )}
              </div>
            )}
          </Card>
          
          <div className="flex justify-end mt-4">
            {answered && (
              currentItemIndex === items.length - 1 ? (
                <Button onClick={() => setShowResults(true)} className="primary-gradient text-white">
                  See Results
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrentItemIndex(currentItemIndex + 1)}
                  className="primary-gradient text-white"
                >
                  Next <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )
            )}
          </div>
        </div>
      );
    }
    
    // Fill in the blank - FIXED (no useState inside condition)
    if (practiceMode === 'fillblank') {
      const answered = practiceAnswers[currentItem.id];
      
      return (
        <div className="max-w-2xl mx-auto">
          <Button variant="ghost" onClick={() => setView('lesson')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Lesson
          </Button>
          
          <Card className="p-6">
            <p className="text-sm text-gray-500 mb-4">Question {currentItemIndex + 1} of {items.length}</p>
            <p className="text-gray-600 mb-2">Definition:</p>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{currentItem.definition}</h2>
            <p className="text-gray-600 mb-2">Example:</p>
            <p className="text-gray-700 italic mb-6">
              "{currentItem.examples[0].replace(new RegExp(currentItem.word, 'gi'), '_____')}"
            </p>
            
            <div className="flex gap-3">
              <Input
                value={fillBlankInput}
                onChange={(e) => setFillBlankInput(e.target.value)}
                placeholder="Type the word..."
                disabled={!!answered}
                className="flex-1"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !answered) {
                    handleFillBlankSubmit(currentItem);
                  }
                }}
              />
              {!answered && (
                <Button onClick={() => handleFillBlankSubmit(currentItem)} className="primary-gradient text-white">
                  Check
                </Button>
              )}
            </div>
            
            {answered && (
              <div className={`mt-4 p-3 rounded-lg ${answered.isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                {answered.isCorrect ? (
                  <p className="text-green-700 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" /> Correct!
                  </p>
                ) : (
                  <p className="text-red-700 flex items-center gap-2">
                    <XCircle className="w-5 h-5" /> The correct answer is: <strong>{currentItem.word}</strong>
                  </p>
                )}
              </div>
            )}
          </Card>
          
          <div className="flex justify-end mt-4">
            {answered && (
              currentItemIndex === items.length - 1 ? (
                <Button onClick={() => setShowResults(true)} className="primary-gradient text-white">
                  See Results
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    setCurrentItemIndex(currentItemIndex + 1);
                    setFillBlankInput('');
                  }}
                  className="primary-gradient text-white"
                >
                  Next <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )
            )}
          </div>
        </div>
      );
    }
    
    // Matching mode - FIXED (no useState inside condition)
    if (practiceMode === 'matching') {
      return (
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={() => setView('lesson')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Lesson
          </Button>
          
          <Card className="p-6">
            <p className="text-sm text-gray-500 mb-4">Match words with definitions</p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="font-medium text-gray-700 mb-2">Words</p>
                {items.map((item) => (
                  <button
                    key={item.id}
                    disabled={!!matchingMatches[item.id]}
                    onClick={() => setMatchingSelectedWord(item)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                      matchingMatches[item.id]
                        ? matchingMatches[item.id].isCorrect
                          ? 'border-green-500 bg-green-50'
                          : 'border-red-500 bg-red-50'
                        : matchingSelectedWord?.id === item.id
                          ? 'border-sky-500 bg-sky-50'
                          : 'border-gray-200 hover:border-sky-300'
                    }`}
                  >
                    {item.word}
                  </button>
                ))}
              </div>
              
              <div className="space-y-2">
                <p className="font-medium text-gray-700 mb-2">Definitions</p>
                {shuffledDefs.map((item) => (
                  <button
                    key={item.id}
                    disabled={Object.values(matchingMatches).some(m => m.matched === item.id)}
                    onClick={() => handleMatchingSelect(item)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-colors text-sm ${
                      Object.values(matchingMatches).some(m => m.matched === item.id)
                        ? 'border-gray-300 bg-gray-100 text-gray-400'
                        : 'border-gray-200 hover:border-sky-300'
                    }`}
                  >
                    {item.definition}
                  </button>
                ))}
              </div>
            </div>
            
            {Object.keys(matchingMatches).length === items.length && (
              <div className="mt-6 text-center">
                <Button onClick={() => setShowResults(true)} className="primary-gradient text-white">
                  See Results
                </Button>
              </div>
            )}
          </Card>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Dashboard
          </Button>
        </div>
        
        {view === 'bands' && renderBandSelection()}
        {view === 'lessons' && renderLessonsList()}
        {view === 'lesson' && renderLessonDetail()}
        {view === 'practice' && renderPractice()}
      </div>
    </div>
  );
}
