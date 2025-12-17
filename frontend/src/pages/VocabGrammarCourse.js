import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Input } from '../components/ui/input';
import { 
  BookOpen, Volume2, Mic, Square, Play, ChevronLeft, ChevronRight, 
  CheckCircle, XCircle, RotateCcw, Shuffle, Trophy, Star, GraduationCap,
  ArrowLeft, Loader2
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Band level configuration
const BAND_LEVELS = [
  { id: 'beginner', label: 'Band 4.5 & Below', color: 'from-green-500 to-emerald-600', icon: '🌱' },
  { id: 'intermediate', label: 'Band 4.5 - 6.5', color: 'from-yellow-500 to-orange-500', icon: '📚' },
  { id: 'advanced', label: 'Band 6.5+', color: 'from-red-500 to-pink-600', icon: '🎯' }
];

export default function VocabGrammarCourse({ user }) {
  const navigate = useNavigate();
  const [selectedBand, setSelectedBand] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('bands'); // bands, lessons, lesson, practice
  const [practiceMode, setPracticeMode] = useState(null); // flashcard, fillblank, mcq, matching
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [userProgress, setUserProgress] = useState({});
  const [playingAudio, setPlayingAudio] = useState(null);
  const [recording, setRecording] = useState(false);
  const [pronunciationResult, setPronunciationResult] = useState(null);
  const [practiceAnswers, setPracticeAnswers] = useState({});
  const [practiceScore, setPracticeScore] = useState({ correct: 0, total: 0 });
  const [showResults, setShowResults] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);

  // Fetch lessons for selected band
  useEffect(() => {
    if (selectedBand) {
      fetchLessons();
    }
  }, [selectedBand]);

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

  // Text-to-Speech
  const playPronunciation = async (text) => {
    setPlayingAudio(text);
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
      // First, transcribe the audio
      const formData = new FormData();
      formData.append('file', new File([audioBlob], 'recording.webm', { type: 'audio/webm' }));
      
      const transcribeResponse = await fetch(`${API_URL}/api/speaking/transcribe`, {
        method: 'POST',
        body: formData
      });
      
      if (!transcribeResponse.ok) throw new Error('Transcription failed');
      const transcribeData = await transcribeResponse.json();
      
      // Then evaluate pronunciation
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
    setView('practice');
  };

  const checkAnswer = (itemId, answer, correctAnswer) => {
    const isCorrect = answer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
    setPracticeAnswers(prev => ({ ...prev, [itemId]: { answer, isCorrect } }));
    setPracticeScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));
    return isCorrect;
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
                    <span className="text-xs text-gray-500 capitalize">{lesson.type.replace('_', ' ')} • {lesson.items?.length || 0} items</span>
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
              {selectedLesson.type.replace('_', ' ')}
            </span>
          </div>
          
          <Progress value={((currentItemIndex + 1) / selectedLesson.items.length) * 100} className="h-2 mb-2" />
          <p className="text-xs text-gray-500 text-right">{currentItemIndex + 1} of {selectedLesson.items.length}</p>
        </Card>
        
        {/* Current Item Card */}
        <Card className="p-8 mb-6">
          <div className="text-center mb-6">
            <h3 className="text-3xl font-bold text-gray-900 mb-2">{currentItem.word}</h3>
            <p className="text-lg text-gray-500 italic mb-4">{currentItem.pronunciation}</p>
            
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
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm font-medium text-gray-500 mb-1">Definition</p>
            <p className="text-gray-900">{currentItem.definition}</p>
            {currentItem.grammar_note && (
              <p className="text-sm text-sky-600 mt-2 italic">💡 {currentItem.grammar_note}</p>
            )}
          </div>
          
          <div className="mb-6">
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
    
    // Flashcard mode
    if (practiceMode === 'flashcard') {
      return (
        <div className="max-w-2xl mx-auto">
          <Button variant="ghost" onClick={() => setView('lesson')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Lesson
          </Button>
          
          <Card 
            className={`p-8 min-h-[300px] cursor-pointer transition-all transform ${flipped ? 'bg-sky-50' : ''}`}
            onClick={() => setFlipped(!flipped)}
          >
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-4">Click to flip • {currentItemIndex + 1}/{items.length}</p>
              
              {!flipped ? (
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{currentItem.word}</h2>
                  <p className="text-gray-500 italic">{currentItem.pronunciation}</p>
                </div>
              ) : (
                <div>
                  <p className="text-xl text-gray-900 mb-4">{currentItem.definition}</p>
                  <p className="text-gray-600 italic">"{currentItem.examples[0]}"</p>
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
      const options = [currentItem.definition, ...wrongOptions].sort(() => Math.random() - 0.5);
      
      return (
        <div className="max-w-2xl mx-auto">
          <Button variant="ghost" onClick={() => setView('lesson')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Lesson
          </Button>
          
          <Card className="p-6">
            <p className="text-sm text-gray-500 mb-4">Question {currentItemIndex + 1} of {items.length}</p>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">What does "{currentItem.word}" mean?</h2>
            
            <div className="space-y-3">
              {options.map((option, idx) => (
                <button
                  key={idx}
                  disabled={!!answered}
                  onClick={() => checkAnswer(currentItem.id, option, currentItem.definition)}
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
    
    // Fill in the blank
    if (practiceMode === 'fillblank') {
      const answered = practiceAnswers[currentItem.id];
      const [userInput, setUserInput] = useState('');
      
      const handleSubmit = () => {
        const isCorrect = userInput.toLowerCase().trim() === currentItem.word.toLowerCase().trim();
        setPracticeAnswers(prev => ({ ...prev, [currentItem.id]: { answer: userInput, isCorrect } }));
        setPracticeScore(prev => ({
          correct: prev.correct + (isCorrect ? 1 : 0),
          total: prev.total + 1
        }));
      };
      
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
            <p className="text-gray-700 italic mb-6">"{currentItem.examples[0].replace(new RegExp(currentItem.word, 'gi'), '_____')}"</p>
            
            <div className="flex gap-3">
              <Input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type the word..."
                disabled={!!answered}
                className="flex-1"
              />
              {!answered && (
                <Button onClick={handleSubmit} className="primary-gradient text-white">
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
                  onClick={() => { setCurrentItemIndex(currentItemIndex + 1); setUserInput(''); }}
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
    
    // Matching mode
    if (practiceMode === 'matching') {
      const [selectedWord, setSelectedWord] = useState(null);
      const [matches, setMatches] = useState({});
      const [shuffledDefs, setShuffledDefs] = useState([]);
      
      useEffect(() => {
        setShuffledDefs([...items].sort(() => Math.random() - 0.5));
      }, []);
      
      const handleMatch = (defItem) => {
        if (!selectedWord) return;
        
        const isCorrect = selectedWord.id === defItem.id;
        setMatches(prev => ({
          ...prev,
          [selectedWord.id]: { matched: defItem.id, isCorrect }
        }));
        
        setPracticeScore(prev => ({
          correct: prev.correct + (isCorrect ? 1 : 0),
          total: prev.total + 1
        }));
        
        setSelectedWord(null);
        
        if (Object.keys(matches).length + 1 === items.length) {
          setTimeout(() => setShowResults(true), 500);
        }
      };
      
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
                    disabled={!!matches[item.id]}
                    onClick={() => setSelectedWord(item)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                      matches[item.id]
                        ? matches[item.id].isCorrect
                          ? 'border-green-500 bg-green-50'
                          : 'border-red-500 bg-red-50'
                        : selectedWord?.id === item.id
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
                    disabled={Object.values(matches).some(m => m.matched === item.id)}
                    onClick={() => handleMatch(item)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-colors text-sm ${
                      Object.values(matches).some(m => m.matched === item.id)
                        ? 'border-gray-300 bg-gray-100 text-gray-400'
                        : 'border-gray-200 hover:border-sky-300'
                    }`}
                  >
                    {item.definition}
                  </button>
                ))}
              </div>
            </div>
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
