import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  ArrowLeft, Headphones, BookOpen, PenTool, Mic,
  Clock, Play, Pause, Volume2, Settings, HelpCircle, EyeOff,
  ChevronRight, Timer, AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Section time limits in seconds
const SECTION_TIMES = {
  listening: 30 * 60 + 10 * 60, // 40 minutes (30 + 10 transfer)
  reading: 60 * 60, // 60 minutes
  writing: 60 * 60, // 60 minutes
  speaking: 14 * 60 // 14 minutes
};

export default function CambridgeTestInterface() {
  const { bookId, testId } = useParams();
  const navigate = useNavigate();
  
  // Test state
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState('listening');
  const [currentPart, setCurrentPart] = useState(0);
  const [answers, setAnswers] = useState({});
  
  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const audioRef = useRef(null);
  
  // Timer state
  const [sectionTimeLeft, setSectionTimeLeft] = useState(SECTION_TIMES.listening);
  const [testStarted, setTestStarted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  
  // UI state
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [completedSections, setCompletedSections] = useState([]);
  
  // Recording state (for Speaking)
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState({});
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    loadTest();
  }, [bookId, testId]);

  // Timer effect
  useEffect(() => {
    let interval;
    if (testStarted && !showInstructions && sectionTimeLeft > 0) {
      interval = setInterval(() => {
        setSectionTimeLeft(prev => {
          if (prev <= 1) {
            handleSectionTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [testStarted, showInstructions, sectionTimeLeft]);

  const loadTest = async () => {
    try {
      const res = await fetch(`${API_URL}/api/cambridge/test/${bookId}/${testId}`);
      const data = await res.json();
      
      if (data.success) {
        setTestData(data.test);
      } else {
        toast.error('Failed to load test');
      }
    } catch (error) {
      console.error('Error loading test:', error);
      toast.error('Error loading test data');
    } finally {
      setLoading(false);
    }
  };

  const handleSectionTimeUp = () => {
    toast.warning(`Time's up for ${currentSection}!`);
    handleSubmitSection();
  };

  const handleAnswerChange = (questionNum, value) => {
    setAnswers(prev => ({
      ...prev,
      [`${currentSection}_${questionNum}`]: value
    }));
  };

  const handleStartTest = () => {
    setShowInstructions(false);
    setTestStarted(true);
    setSectionTimeLeft(SECTION_TIMES[currentSection]);
  };

  const handleSubmitSection = () => {
    setCompletedSections(prev => [...prev, currentSection]);
    
    const sectionOrder = ['listening', 'reading', 'writing', 'speaking'];
    const currentIndex = sectionOrder.indexOf(currentSection);
    
    if (currentIndex < sectionOrder.length - 1) {
      const nextSection = sectionOrder[currentIndex + 1];
      setCurrentSection(nextSection);
      setCurrentPart(0);
      setSectionTimeLeft(SECTION_TIMES[nextSection]);
      setShowInstructions(true);
      setShowSubmitModal(false);
    } else {
      // All sections completed - show results
      navigate(`/cambridge-test/${bookId}/${testId}/results`, { 
        state: { answers, testData } 
      });
    }
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setAudioProgress(progress);
      setAudioCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleAudioLoaded = () => {
    if (audioRef.current) {
      setAudioDuration(audioRef.current.duration);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Recording functions for Speaking
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedAudio(prev => ({
          ...prev,
          [`part${currentPart + 1}`]: url
        }));
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      toast.error('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sections = [
    { id: 'listening', label: 'Listening', icon: Headphones, color: 'blue', time: '40 min' },
    { id: 'reading', label: 'Reading', icon: BookOpen, color: 'green', time: '60 min' },
    { id: 'writing', label: 'Writing', icon: PenTool, color: 'purple', time: '60 min' },
    { id: 'speaking', label: 'Speaking', icon: Mic, color: 'orange', time: '14 min' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading test...</p>
        </div>
      </div>
    );
  }

  if (!testData) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <AlertTriangle className="w-16 h-16 mx-auto text-amber-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">Test Not Found</h2>
          <p className="text-gray-500 mb-4">The requested test could not be loaded.</p>
          <Button onClick={() => navigate('/question-bank')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Question Bank
          </Button>
        </Card>
      </div>
    );
  }

  const sectionData = testData.sections[currentSection];

  // Instructions Screen
  if (showInstructions) {
    const sectionInfo = sections.find(s => s.id === currentSection);
    const Icon = sectionInfo?.icon || Headphones;
    
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full p-8">
          <div className="text-center mb-8">
            <div className={`w-20 h-20 rounded-full bg-${sectionInfo?.color}-100 flex items-center justify-center mx-auto mb-4`}>
              <Icon className={`w-10 h-10 text-${sectionInfo?.color}-600`} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              IELTS {currentSection.charAt(0).toUpperCase() + currentSection.slice(1)}
            </h1>
            <p className="text-gray-500">{testData.title}</p>
          </div>
          
          <div className="bg-slate-50 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {sectionData?.total_questions || sectionData?.total_tasks || sectionData?.total_parts || '-'}
                </p>
                <p className="text-sm text-gray-500">
                  {currentSection === 'writing' ? 'Tasks' : currentSection === 'speaking' ? 'Parts' : 'Questions'}
                </p>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{sectionInfo?.time}</p>
                <p className="text-sm text-gray-500">Time Limit</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3 mb-8">
            <h3 className="font-semibold text-gray-900">Instructions:</h3>
            {currentSection === 'listening' && (
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• You will hear the recording ONCE only</li>
                <li>• Answer all questions as you listen</li>
                <li>• You will have 10 minutes to transfer your answers</li>
                <li>• Write your answers in the gaps provided</li>
              </ul>
            )}
            {currentSection === 'reading' && (
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Read each passage carefully</li>
                <li>• Answer all 40 questions</li>
                <li>• You may write on the question paper</li>
                <li>• Manage your time - approximately 20 minutes per passage</li>
              </ul>
            )}
            {currentSection === 'writing' && (
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Task 1: Write at least 150 words (20 minutes recommended)</li>
                <li>• Task 2: Write at least 250 words (40 minutes recommended)</li>
                <li>• Answer both tasks</li>
                <li>• Write in formal academic style</li>
              </ul>
            )}
            {currentSection === 'speaking' && (
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Part 1: Introduction and interview (4-5 minutes)</li>
                <li>• Part 2: Individual long turn - speak for 1-2 minutes</li>
                <li>• Part 3: Two-way discussion (4-5 minutes)</li>
                <li>• Speak clearly and at a natural pace</li>
              </ul>
            )}
          </div>
          
          <Button 
            onClick={handleStartTest}
            className="w-full h-12 text-lg bg-red-600 hover:bg-red-700"
          >
            Start {currentSection.charAt(0).toUpperCase() + currentSection.slice(1)} Test
          </Button>
        </Card>
      </div>
    );
  }

  // Render Listening Section
  const renderListeningSection = () => {
    const parts = sectionData?.parts || [];
    const currentPartData = parts[currentPart];
    
    if (!currentPartData) return null;

    return (
      <div className="space-y-4">
        {/* Audio Player */}
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center gap-4">
            <Button
              onClick={toggleAudio}
              className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 flex-shrink-0"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
            </Button>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Part {currentPartData.part_number}: {currentPartData.title}</span>
                <span className="text-xs text-gray-500">{formatTime(audioCurrentTime)} / {formatTime(audioDuration)}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${audioProgress}%` }}
                />
              </div>
            </div>
            <Volume2 className="w-5 h-5 text-gray-400 flex-shrink-0" />
          </div>
          <audio
            ref={audioRef}
            src={`${API_URL}${currentPartData.audio_file}`}
            onTimeUpdate={handleAudioTimeUpdate}
            onLoadedMetadata={handleAudioLoaded}
            onEnded={() => setIsPlaying(false)}
          />
        </Card>

        {/* Part Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {parts.map((part, idx) => (
            <Button
              key={idx}
              variant={currentPart === idx ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentPart(idx)}
              className={`flex-shrink-0 ${currentPart === idx ? 'bg-blue-600' : ''}`}
            >
              Part {part.part_number}
            </Button>
          ))}
        </div>

        {/* Questions Card */}
        <Card className="p-6">
          <div className="mb-4">
            <Badge className="bg-blue-100 text-blue-700 mb-2">Questions {currentPartData.question_range}</Badge>
            <h3 className="font-bold text-lg text-gray-900">{currentPartData.title}</h3>
            {currentPartData.instructions && (
              <p className="text-sm text-gray-600 mt-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                {currentPartData.instructions}
              </p>
            )}
          </div>
          
          {/* Visual Notes */}
          {currentPartData.visual && currentPartData.visual.type === 'notes' && (
            <div className="bg-slate-50 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-gray-800 mb-3 border-b pb-2">{currentPartData.visual.title}</h4>
              {currentPartData.visual.sections?.map((section, sIdx) => (
                <div key={sIdx} className="mb-4">
                  <h5 className="font-medium text-gray-700 mb-2 text-sm uppercase tracking-wide">{section.heading}</h5>
                  {section.subsections?.map((sub, subIdx) => (
                    <div key={subIdx} className="ml-4 mb-3">
                      <span className="font-medium text-sm text-blue-700">{sub.name}</span>
                      <ul className="mt-1 space-y-2">
                        {sub.items?.map((item, itemIdx) => (
                          <li key={itemIdx} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-gray-400">•</span>
                            <span className="flex-1">
                              {item.includes('___') ? (
                                renderGapFill(item)
                              ) : item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  {section.items && !section.subsections && (
                    <ul className="ml-4 space-y-2">
                      {section.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-gray-400">•</span>
                          <span className="flex-1">
                            {item.includes('___') ? renderGapFill(item) : item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Multiple Choice Questions */}
          {currentPartData.questions?.filter(q => q.type === 'multiple_choice' && q.question).map((q, qIdx) => (
            <div key={qIdx} className="mb-6 p-4 bg-white border rounded-lg">
              <p className="font-medium mb-3 text-gray-900">{q.number}. {q.question}</p>
              <div className="space-y-2">
                {q.options?.map((opt, optIdx) => (
                  <label key={optIdx} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer border transition-colors">
                    <input
                      type="radio"
                      name={`listening_q${q.number}`}
                      value={opt.charAt(0)}
                      checked={answers[`listening_${q.number}`] === opt.charAt(0)}
                      onChange={(e) => handleAnswerChange(q.number, e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          {/* Multiple Selection Questions */}
          {currentPartData.questions?.filter(q => q.type === 'multiple_selection').map((q, qIdx) => (
            <div key={qIdx} className="mb-6 p-4 bg-white border rounded-lg">
              <p className="text-xs text-blue-600 font-medium mb-1">{q.instruction}</p>
              <p className="font-medium mb-3 text-gray-900">{q.number}. {q.question}</p>
              <div className="space-y-2">
                {q.options?.map((opt, optIdx) => (
                  <label key={optIdx} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer border transition-colors">
                    <input
                      type="checkbox"
                      value={opt.charAt(0)}
                      checked={(answers[`listening_${q.number}`] || []).includes(opt.charAt(0))}
                      onChange={(e) => {
                        const current = answers[`listening_${q.number}`] || [];
                        if (e.target.checked && current.length < (q.answer_count || 2)) {
                          handleAnswerChange(q.number, [...current, opt.charAt(0)]);
                        } else if (!e.target.checked) {
                          handleAnswerChange(q.number, current.filter(v => v !== opt.charAt(0)));
                        }
                      }}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-sm">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          {/* Matching Questions */}
          {currentPartData.questions?.filter(q => q.type === 'matching').map((q, qIdx) => (
            <div key={qIdx} className="mb-6 p-4 bg-white border rounded-lg">
              <p className="text-xs text-blue-600 font-medium mb-2">{q.instruction}</p>
              
              {q.options_box && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h5 className="font-semibold text-sm mb-3 text-blue-800">{q.options_box.title}</h5>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    {q.options_box.options?.map((opt, oIdx) => (
                      <div key={oIdx} className="text-gray-700">{opt}</div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                {q.items?.map((item, iIdx) => (
                  <div key={iIdx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <span className="font-bold text-blue-600 w-8">{item.number}.</span>
                    <span className="flex-1 text-sm font-medium">{item.item}</span>
                    <select
                      value={answers[`listening_${item.number}`] || ''}
                      onChange={(e) => handleAnswerChange(item.number, e.target.value)}
                      className="w-20 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">-</option>
                      {['A', 'B', 'C', 'D', 'E', 'F'].map(l => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </Card>
      </div>
    );
  };

  // Helper function for gap fill questions
  const renderGapFill = (text) => {
    const parts = text.split(/___(\d+)___/);
    return parts.map((part, idx) => {
      if (/^\d+$/.test(part)) {
        return (
          <input
            key={idx}
            type="text"
            value={answers[`${currentSection}_${part}`] || ''}
            onChange={(e) => handleAnswerChange(part, e.target.value)}
            className="w-32 mx-1 px-3 py-1 border-2 border-blue-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-200 outline-none bg-white text-center font-medium"
            placeholder={part}
          />
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  // Render Reading Section
  const renderReadingSection = () => {
    const passages = sectionData?.passages || [];
    const currentPassage = passages[currentPart];
    
    if (!currentPassage) return null;

    return (
      <div className="grid lg:grid-cols-2 gap-4 h-[calc(100vh-200px)]">
        {/* Passage */}
        <Card className="p-6 overflow-y-auto">
          <Badge className="bg-green-100 text-green-700 mb-3">Passage {currentPassage.passage_number}</Badge>
          <h3 className="font-bold text-xl mb-2 text-gray-900">{currentPassage.title}</h3>
          {currentPassage.subtitle && (
            <p className="text-sm text-gray-500 italic mb-4">{currentPassage.subtitle}</p>
          )}
          <div className="prose prose-sm max-w-none">
            {currentPassage.passage_text?.split('\n\n').map((para, idx) => (
              <p key={idx} className="mb-4 text-gray-700 leading-relaxed text-sm">{para}</p>
            ))}
          </div>
        </Card>

        {/* Questions */}
        <Card className="p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <Badge className="bg-green-100 text-green-700">Questions {currentPassage.question_range}</Badge>
            <div className="flex gap-1">
              {passages.map((_, idx) => (
                <Button
                  key={idx}
                  variant={currentPart === idx ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPart(idx)}
                  className={currentPart === idx ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  P{idx + 1}
                </Button>
              ))}
            </div>
          </div>

          {currentPassage.questions?.map((q, qIdx) => (
            <div key={qIdx} className="mb-6">
              {/* Note Completion */}
              {q.type === 'note_completion' && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700 font-medium mb-3">{q.instruction}</p>
                  {q.visual && (
                    <div className="space-y-4">
                      <h5 className="font-semibold text-gray-800">{q.visual.title}</h5>
                      {q.visual.sections?.map((section, sIdx) => (
                        <div key={sIdx}>
                          <h6 className="font-medium text-gray-700 text-sm mb-2">{section.heading}</h6>
                          <ul className="space-y-2">
                            {section.items?.map((item, itemIdx) => (
                              <li key={itemIdx} className="text-sm text-gray-700 flex items-start gap-2">
                                <span className="text-gray-400">•</span>
                                <span className="flex-1">
                                  {item.includes('___') ? renderGapFill(item) : item}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* True/False/Not Given */}
              {q.type === 'true_false_not_given' && (
                <div className="space-y-3">
                  <p className="text-sm text-green-700 font-medium">{q.instruction}</p>
                  {q.statements?.map((stmt, sIdx) => (
                    <div key={sIdx} className="p-4 bg-white border rounded-lg">
                      <p className="text-sm mb-3">{stmt.number}. {stmt.statement}</p>
                      <div className="flex gap-4">
                        {['TRUE', 'FALSE', 'NOT GIVEN'].map(opt => (
                          <label key={opt} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name={`reading_q${stmt.number}`}
                              value={opt}
                              checked={answers[`reading_${stmt.number}`] === opt}
                              onChange={(e) => handleAnswerChange(stmt.number, e.target.value)}
                              className="w-4 h-4 text-green-600"
                            />
                            <span className="text-sm font-medium">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Yes/No/Not Given */}
              {q.type === 'yes_no_not_given' && (
                <div className="space-y-3">
                  <p className="text-sm text-green-700 font-medium">{q.instruction}</p>
                  {q.statements?.map((stmt, sIdx) => (
                    <div key={sIdx} className="p-4 bg-white border rounded-lg">
                      <p className="text-sm mb-3">{stmt.number}. {stmt.statement}</p>
                      <div className="flex gap-4">
                        {['YES', 'NO', 'NOT GIVEN'].map(opt => (
                          <label key={opt} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name={`reading_q${stmt.number}`}
                              value={opt}
                              checked={answers[`reading_${stmt.number}`] === opt}
                              onChange={(e) => handleAnswerChange(stmt.number, e.target.value)}
                              className="w-4 h-4 text-green-600"
                            />
                            <span className="text-sm font-medium">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Section Matching */}
              {q.type === 'section_matching' && (
                <div className="space-y-3">
                  <p className="text-sm text-green-700 font-medium">{q.instruction}</p>
                  {q.items?.map((item, iIdx) => (
                    <div key={iIdx} className="p-3 bg-white border rounded-lg flex items-center gap-3">
                      <span className="font-bold text-green-600 w-8">{item.number}.</span>
                      <span className="text-sm flex-1">{item.item}</span>
                      <select
                        value={answers[`reading_${item.number}`] || ''}
                        onChange={(e) => handleAnswerChange(item.number, e.target.value)}
                        className="w-16 px-2 py-1 border rounded text-sm"
                      >
                        <option value="">-</option>
                        {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(l => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}

              {/* Sentence Completion */}
              {q.type === 'sentence_completion' && (
                <div className="space-y-3">
                  <p className="text-sm text-green-700 font-medium">{q.instruction}</p>
                  {q.title && <h5 className="font-semibold text-gray-800">{q.title}</h5>}
                  {q.sentences?.map((sent, sIdx) => (
                    <div key={sIdx} className="p-3 bg-white border rounded-lg">
                      <span className="text-sm">
                        {sent.text.includes('___') ? (
                          renderGapFill(sent.text.replace(`___${sent.number}___`, `___${sent.number}___`))
                        ) : (
                          <>
                            {sent.number}. {sent.text}
                            <input
                              type="text"
                              value={answers[`reading_${sent.number}`] || ''}
                              onChange={(e) => handleAnswerChange(sent.number, e.target.value)}
                              className="w-32 ml-2 px-2 py-1 border-b-2 border-green-300 focus:border-green-600 outline-none"
                              placeholder="answer"
                            />
                          </>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Summary Completion */}
              {q.type === 'summary_completion' && (
                <div className="space-y-3">
                  <p className="text-sm text-green-700 font-medium">{q.instruction}</p>
                  {q.options && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200 grid grid-cols-2 gap-2 text-sm">
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx}>{opt}</div>
                      ))}
                    </div>
                  )}
                  {q.summary && (
                    <div className="p-4 bg-white border rounded-lg">
                      <h5 className="font-semibold mb-2">{q.summary.title}</h5>
                      <p className="text-sm leading-relaxed">
                        {q.summary.text.split(/___(\d+)___/).map((part, pIdx) => {
                          if (/^\d+$/.test(part)) {
                            return (
                              <select
                                key={pIdx}
                                value={answers[`reading_${part}`] || ''}
                                onChange={(e) => handleAnswerChange(part, e.target.value)}
                                className="mx-1 px-2 py-1 border rounded text-sm"
                              >
                                <option value="">({part})</option>
                                {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].map(l => (
                                  <option key={l} value={l}>{l}</option>
                                ))}
                              </select>
                            );
                          }
                          return <span key={pIdx}>{part}</span>;
                        })}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Multiple Choice - Reading */}
              {q.type === 'multiple_choice' && q.questions && (
                <div className="space-y-4">
                  {q.questions.map((mcq, mIdx) => (
                    <div key={mIdx} className="p-4 bg-white border rounded-lg">
                      <p className="text-sm font-medium mb-3">{mcq.number}. {mcq.question}</p>
                      <div className="space-y-2">
                        {mcq.options?.map((opt, oIdx) => (
                          <label key={oIdx} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer">
                            <input
                              type="radio"
                              name={`reading_q${mcq.number}`}
                              value={opt.charAt(0)}
                              checked={answers[`reading_${mcq.number}`] === opt.charAt(0)}
                              onChange={(e) => handleAnswerChange(mcq.number, e.target.value)}
                              className="w-4 h-4 text-green-600"
                            />
                            <span className="text-sm">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Multiple Selection - Reading */}
              {q.type === 'multiple_selection' && (
                <div className="p-4 bg-white border rounded-lg">
                  <p className="text-xs text-green-600 font-medium mb-1">{q.instruction}</p>
                  <p className="text-sm font-medium mb-3">{q.number}. {q.question}</p>
                  <div className="space-y-2">
                    {q.options?.map((opt, oIdx) => (
                      <label key={oIdx} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          value={opt.charAt(0)}
                          checked={(answers[`reading_${q.number}`] || []).includes(opt.charAt(0))}
                          onChange={(e) => {
                            const current = answers[`reading_${q.number}`] || [];
                            if (e.target.checked && current.length < 2) {
                              handleAnswerChange(q.number, [...current, opt.charAt(0)]);
                            } else if (!e.target.checked) {
                              handleAnswerChange(q.number, current.filter(v => v !== opt.charAt(0)));
                            }
                          }}
                          className="w-4 h-4 text-green-600 rounded"
                        />
                        <span className="text-sm">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </Card>
      </div>
    );
  };

  // Render Writing Section
  const renderWritingSection = () => {
    const tasks = sectionData?.tasks || [];
    const currentTask = tasks[currentPart];
    
    if (!currentTask) return null;

    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          {tasks.map((task, idx) => (
            <Button
              key={idx}
              variant={currentPart === idx ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentPart(idx)}
              className={currentPart === idx ? 'bg-purple-600 hover:bg-purple-700' : ''}
            >
              Task {task.task_number}
            </Button>
          ))}
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Badge className="bg-purple-100 text-purple-700 mb-2">{currentTask.title}</Badge>
              <h3 className="font-bold text-lg text-gray-900">{currentTask.type === 'map_comparison' ? 'Map Description' : 'Essay'}</h3>
            </div>
            <div className="text-right text-sm text-gray-500">
              <div className="flex items-center gap-1"><Clock className="w-4 h-4" /> {currentTask.time_recommended}</div>
              <div>{currentTask.word_count}</div>
            </div>
          </div>

          <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-gray-700 whitespace-pre-line">{currentTask.prompt}</p>
          </div>

          {/* Dual Map Visual for Task 1 */}
          {currentTask.visual_data?.type === 'dual_map' && (
            <div className="mb-6 p-4 bg-white border rounded-lg">
              <h4 className="font-semibold text-center mb-4">{currentTask.visual_data.title}</h4>
              <div className="grid grid-cols-2 gap-4">
                {currentTask.visual_data.maps?.map((map, mapIdx) => (
                  <div key={mapIdx} className="border rounded-lg p-3 bg-slate-50">
                    <h5 className="font-medium text-center text-sm mb-3">{map.title}</h5>
                    <div className="relative bg-white rounded border aspect-[4/3] overflow-hidden">
                      {/* River */}
                      <div className="absolute top-0 left-0 right-0 h-6 bg-blue-300 flex items-center justify-center">
                        <span className="text-xs text-blue-800 font-medium">River</span>
                      </div>
                      {/* Farmland */}
                      <div className="absolute top-6 left-0 right-0 h-10 bg-green-200 flex items-center justify-center border-b border-green-400">
                        <span className="text-xs text-green-800">Farmland</span>
                      </div>
                      {/* Main area */}
                      <div className="absolute top-16 bottom-6 left-0 right-0 bg-gray-100 p-2">
                        {mapIdx === 0 ? (
                          // Current - Factories
                          <div className="h-full flex flex-wrap gap-1 items-center justify-center">
                            {[1,2,3,4].map(i => (
                              <div key={i} className="w-12 h-8 bg-red-300 border border-red-400 rounded flex items-center justify-center">
                                <span className="text-[8px] text-red-800">Factory</span>
                              </div>
                            ))}
                            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-300 border-2 border-gray-500"></div>
                          </div>
                        ) : (
                          // Planned - Housing + facilities
                          <div className="h-full relative">
                            <div className="absolute top-[-8px] left-1/2 transform -translate-x-1/2 w-8 h-3 bg-gray-500 text-[6px] text-white text-center">Bridge</div>
                            <div className="flex flex-wrap gap-1 items-start justify-center pt-2">
                              <div className="w-10 h-6 bg-yellow-200 border border-yellow-400 rounded text-[7px] text-center">Housing</div>
                              <div className="w-10 h-6 bg-yellow-200 border border-yellow-400 rounded text-[7px] text-center">Housing</div>
                              <div className="w-10 h-6 bg-purple-200 border border-purple-400 rounded text-[7px] text-center">Shops</div>
                            </div>
                            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-300 border-2 border-gray-500"></div>
                            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1">
                              <div className="w-12 h-5 bg-red-200 border border-red-300 rounded text-[6px] text-center">Medical</div>
                            </div>
                            <div className="absolute right-1 top-1 flex flex-col gap-1">
                              <div className="w-8 h-4 bg-blue-200 border border-blue-300 rounded text-[6px] text-center">School</div>
                              <div className="w-8 h-4 bg-green-300 border border-green-400 rounded text-[6px] text-center">Play</div>
                            </div>
                          </div>
                        )}
                      </div>
                      {/* Main Road */}
                      <div className="absolute bottom-0 left-0 right-0 h-6 bg-gray-400 flex items-center justify-center">
                        <span className="text-xs text-white font-medium">Main Road</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Response</label>
            <textarea
              value={answers[`writing_task${currentTask.task_number}`] || ''}
              onChange={(e) => setAnswers(prev => ({
                ...prev,
                [`writing_task${currentTask.task_number}`]: e.target.value
              }))}
              className="w-full h-80 p-4 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
              placeholder="Write your response here..."
            />
            <div className="flex justify-between mt-2 text-sm">
              <span className="text-gray-500">
                Word count: <span className="font-medium text-gray-700">
                  {(answers[`writing_task${currentTask.task_number}`] || '').split(/\s+/).filter(Boolean).length}
                </span>
              </span>
              <span className="text-gray-500">Target: {currentTask.word_count}</span>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  // Render Speaking Section
  const renderSpeakingSection = () => {
    const parts = sectionData?.parts || [];
    const currentSpeakingPart = parts[currentPart];
    
    if (!currentSpeakingPart) return null;

    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          {parts.map((part, idx) => (
            <Button
              key={idx}
              variant={currentPart === idx ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentPart(idx)}
              className={currentPart === idx ? 'bg-orange-600 hover:bg-orange-700' : ''}
            >
              Part {part.part_number}
            </Button>
          ))}
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Badge className="bg-orange-100 text-orange-700 mb-2">Part {currentSpeakingPart.part_number}</Badge>
              <h3 className="font-bold text-lg text-gray-900">{currentSpeakingPart.title}</h3>
            </div>
            <Badge className="bg-gray-100 text-gray-700">{currentSpeakingPart.duration}</Badge>
          </div>

          {currentSpeakingPart.topic && (
            <div className="mb-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <span className="text-sm font-medium text-orange-700">Topic: {currentSpeakingPart.topic}</span>
            </div>
          )}

          {/* Part 1 Questions */}
          {currentSpeakingPart.questions && (
            <div className="space-y-3 mb-6">
              <h4 className="font-medium text-gray-700">Sample Questions:</h4>
              {currentSpeakingPart.questions.map((q, qIdx) => (
                <div key={qIdx} className="p-4 bg-white border rounded-lg text-sm">
                  {q}
                </div>
              ))}
            </div>
          )}

          {/* Part 2 Task Card */}
          {currentSpeakingPart.task_card && (
            <div className="p-5 bg-amber-50 border-2 border-amber-300 rounded-lg mb-6">
              <h4 className="font-bold text-lg mb-3 text-amber-900">{currentSpeakingPart.task_card.topic}</h4>
              <p className="text-sm text-gray-600 mb-3">You should say:</p>
              <ul className="list-disc ml-5 space-y-2 text-sm">
                {currentSpeakingPart.task_card.points?.map((point, pIdx) => (
                  <li key={pIdx} className="text-gray-700">{point}</li>
                ))}
              </ul>
              <div className="mt-4 pt-3 border-t border-amber-300 flex gap-4 text-xs text-amber-700">
                <span>⏱ Preparation: {currentSpeakingPart.preparation_time}</span>
                <span>🎤 Speaking: {currentSpeakingPart.speaking_time}</span>
              </div>
            </div>
          )}

          {/* Part 3 Topics */}
          {currentSpeakingPart.topics && (
            <div className="space-y-4 mb-6">
              {currentSpeakingPart.topics.map((topic, tIdx) => (
                <div key={tIdx} className="p-4 bg-white border rounded-lg">
                  <h5 className="font-medium text-orange-700 mb-3">{topic.theme}</h5>
                  <ul className="space-y-2">
                    {topic.questions?.map((q, qIdx) => (
                      <li key={qIdx} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-orange-400">•</span>
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Recording Controls */}
          <div className="p-6 bg-gray-50 rounded-lg text-center">
            <p className="text-sm text-gray-600 mb-4">Record your response for this part</p>
            {!isRecording ? (
              <Button 
                onClick={startRecording}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Mic className="w-4 h-4 mr-2" /> Start Recording
              </Button>
            ) : (
              <Button 
                onClick={stopRecording}
                variant="destructive"
              >
                <Pause className="w-4 h-4 mr-2" /> Stop Recording
              </Button>
            )}
            
            {recordedAudio[`part${currentPart + 1}`] && (
              <div className="mt-4">
                <p className="text-sm text-green-600 mb-2">Recording saved!</p>
                <audio 
                  src={recordedAudio[`part${currentPart + 1}`]} 
                  controls 
                  className="mx-auto"
                />
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/question-bank')}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Exit
              </Button>
              <div className="h-8 w-px bg-gray-200" />
              <div>
                <h1 className="font-bold text-lg text-gray-900">{testData.title}</h1>
                <p className="text-xs text-gray-500">{testData.book} • {currentSection.charAt(0).toUpperCase() + currentSection.slice(1)}</p>
              </div>
            </div>
            
            {/* Timer */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              sectionTimeLeft < 300 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
            }`}>
              <Timer className="w-5 h-5" />
              <span className="font-mono font-bold text-lg">{formatTime(sectionTimeLeft)}</span>
            </div>

            {/* Section Tabs */}
            <div className="flex gap-1">
              {sections.map(section => {
                const Icon = section.icon;
                const isActive = currentSection === section.id;
                const isCompleted = completedSections.includes(section.id);
                return (
                  <Button
                    key={section.id}
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    disabled={!isCompleted && !isActive}
                    onClick={() => {
                      if (isCompleted || isActive) {
                        setCurrentSection(section.id);
                        setCurrentPart(0);
                      }
                    }}
                    className={`${isActive ? `bg-${section.color}-600 hover:bg-${section.color}-700` : ''} ${isCompleted ? 'opacity-50' : ''}`}
                  >
                    <Icon className="w-4 h-4 mr-1" />
                    <span className="hidden md:inline">{section.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 pb-24">
        {currentSection === 'listening' && renderListeningSection()}
        {currentSection === 'reading' && renderReadingSection()}
        {currentSection === 'writing' && renderWritingSection()}
        {currentSection === 'speaking' && renderSpeakingSection()}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Answered: <span className="font-medium text-gray-700">
              {Object.keys(answers).filter(k => k.startsWith(currentSection)).length}
            </span> questions
          </div>
          <Button 
            onClick={() => setShowSubmitModal(true)}
            className="bg-red-600 hover:bg-red-700"
          >
            Submit {currentSection.charAt(0).toUpperCase() + currentSection.slice(1)}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full p-6">
            <div className="text-center">
              <AlertTriangle className="w-16 h-16 mx-auto text-amber-500 mb-4" />
              <h3 className="text-xl font-bold mb-2">Submit {currentSection}?</h3>
              <p className="text-gray-500 mb-6">
                You cannot return to this section after submitting. Make sure you have answered all questions.
              </p>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowSubmitModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  onClick={handleSubmitSection}
                >
                  Submit
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
