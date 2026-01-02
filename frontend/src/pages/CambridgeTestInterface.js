import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  ArrowLeft, ArrowRight, Headphones, BookOpen, PenTool, Mic,
  Clock, Play, Pause, CheckCircle, AlertCircle, Volume2,
  ChevronLeft, ChevronRight, SkipForward
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function CambridgeTestInterface() {
  const { bookId, testId } = useParams();
  const navigate = useNavigate();
  
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState('listening');
  const [currentPart, setCurrentPart] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [showResults, setShowResults] = useState(false);
  
  const audioRef = useRef(null);

  useEffect(() => {
    loadTest();
  }, [bookId, testId]);

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

  const handleAnswerChange = (questionNum, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionNum]: value
    }));
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
    }
  };

  const sections = [
    { id: 'listening', label: 'Listening', icon: Headphones, color: 'blue' },
    { id: 'reading', label: 'Reading', icon: BookOpen, color: 'green' },
    { id: 'writing', label: 'Writing', icon: PenTool, color: 'purple' },
    { id: 'speaking', label: 'Speaking', icon: Mic, color: 'orange' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!testData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
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

  const renderListeningSection = () => {
    const parts = sectionData?.parts || [];
    const currentPartData = parts[currentPart];
    
    if (!currentPartData) return null;

    return (
      <div className="space-y-6">
        {/* Audio Player */}
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-4">
            <Button
              onClick={toggleAudio}
              className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
            </Button>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Part {currentPartData.part_number}</span>
                <span className="text-xs text-gray-500">Questions {currentPartData.question_range}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${audioProgress}%` }}
                />
              </div>
            </div>
            <Volume2 className="w-5 h-5 text-gray-400" />
          </div>
          <audio
            ref={audioRef}
            src={`${API_URL}${currentPartData.audio_file}`}
            onTimeUpdate={handleAudioTimeUpdate}
            onEnded={() => setIsPlaying(false)}
          />
        </Card>

        {/* Part Navigation */}
        <div className="flex gap-2">
          {parts.map((part, idx) => (
            <Button
              key={idx}
              variant={currentPart === idx ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentPart(idx)}
              className={currentPart === idx ? 'bg-blue-600' : ''}
            >
              Part {part.part_number}
            </Button>
          ))}
        </div>

        {/* Questions */}
        <Card className="p-6">
          <h3 className="font-bold text-lg mb-4">{currentPartData.title}</h3>
          <p className="text-sm text-gray-600 mb-4">{currentPartData.instructions}</p>
          
          {/* Render Visual if exists */}
          {currentPartData.visual && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-3">{currentPartData.visual.title}</h4>
              {currentPartData.visual.sections?.map((section, sIdx) => (
                <div key={sIdx} className="mb-4">
                  <h5 className="font-medium text-gray-700 mb-2">{section.heading}</h5>
                  {section.subsections?.map((sub, subIdx) => (
                    <div key={subIdx} className="ml-4 mb-2">
                      <span className="font-medium text-sm text-gray-600">{sub.name}</span>
                      <ul className="list-disc ml-4 text-sm">
                        {sub.items?.map((item, itemIdx) => (
                          <li key={itemIdx} className="text-gray-700">
                            {item.includes('___') ? (
                              <span>
                                {item.split(/___(\d+)___/).map((part, pIdx) => {
                                  if (/^\d+$/.test(part)) {
                                    return (
                                      <input
                                        key={pIdx}
                                        type="text"
                                        value={answers[part] || ''}
                                        onChange={(e) => handleAnswerChange(part, e.target.value)}
                                        className="w-32 mx-1 px-2 py-1 border-b-2 border-blue-300 focus:border-blue-600 outline-none bg-white text-center"
                                        placeholder={part}
                                      />
                                    );
                                  }
                                  return part;
                                })}
                              </span>
                            ) : item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  {section.items && !section.subsections && (
                    <ul className="list-disc ml-4 text-sm">
                      {section.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="text-gray-700 my-1">
                          {item.includes('___') ? (
                            <span>
                              {item.split(/___(\d+)___/).map((part, pIdx) => {
                                if (/^\d+$/.test(part)) {
                                  return (
                                    <input
                                      key={pIdx}
                                      type="text"
                                      value={answers[part] || ''}
                                      onChange={(e) => handleAnswerChange(part, e.target.value)}
                                      className="w-32 mx-1 px-2 py-1 border-b-2 border-blue-300 focus:border-blue-600 outline-none bg-white text-center"
                                      placeholder={part}
                                    />
                                  );
                                }
                                return part;
                              })}
                            </span>
                          ) : item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Multiple Choice Questions */}
          {currentPartData.questions?.filter(q => q.type === 'multiple_choice').map((q, qIdx) => (
            <div key={qIdx} className="mb-6 p-4 bg-white border rounded-lg">
              <p className="font-medium mb-3">{q.number}. {q.question}</p>
              <div className="space-y-2">
                {q.options?.map((opt, optIdx) => (
                  <label key={optIdx} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name={`q${q.number}`}
                      value={opt.charAt(0)}
                      checked={answers[q.number] === opt.charAt(0)}
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
              <p className="text-xs text-blue-600 mb-1">{q.instruction}</p>
              <p className="font-medium mb-3">{q.number}. {q.question}</p>
              <div className="space-y-2">
                {q.options?.map((opt, optIdx) => (
                  <label key={optIdx} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      value={opt.charAt(0)}
                      onChange={(e) => {
                        const current = answers[q.number] || [];
                        if (e.target.checked) {
                          handleAnswerChange(q.number, [...current, opt.charAt(0)]);
                        } else {
                          handleAnswerChange(q.number, current.filter(v => v !== opt.charAt(0)));
                        }
                      }}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </Card>
      </div>
    );
  };

  const renderReadingSection = () => {
    const passages = sectionData?.passages || [];
    const currentPassage = passages[currentPart];
    
    if (!currentPassage) return null;

    return (
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Passage */}
        <Card className="p-6 max-h-[70vh] overflow-y-auto">
          <h3 className="font-bold text-lg mb-2">{currentPassage.title}</h3>
          {currentPassage.subtitle && (
            <p className="text-sm text-gray-500 italic mb-4">{currentPassage.subtitle}</p>
          )}
          <div className="prose prose-sm max-w-none">
            {currentPassage.passage_text?.split('\n\n').map((para, idx) => (
              <p key={idx} className="mb-4 text-gray-700 leading-relaxed">{para}</p>
            ))}
          </div>
        </Card>

        {/* Questions */}
        <Card className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold">Questions {currentPassage.question_range}</h4>
            <div className="flex gap-2">
              {passages.map((_, idx) => (
                <Button
                  key={idx}
                  variant={currentPart === idx ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPart(idx)}
                  className={currentPart === idx ? 'bg-green-600' : ''}
                >
                  Passage {idx + 1}
                </Button>
              ))}
            </div>
          </div>

          {currentPassage.questions?.map((q, qIdx) => (
            <div key={qIdx} className="mb-6">
              {q.type === 'note_completion' && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-green-600 mb-2">{q.instruction}</p>
                  {q.visual && (
                    <div className="space-y-3">
                      <h5 className="font-semibold">{q.visual.title}</h5>
                      {q.visual.sections?.map((section, sIdx) => (
                        <div key={sIdx}>
                          <h6 className="font-medium text-gray-700">{section.heading}</h6>
                          <ul className="list-disc ml-4 text-sm space-y-1">
                            {section.items?.map((item, itemIdx) => (
                              <li key={itemIdx}>
                                {item.includes('___') ? (
                                  <span>
                                    {item.split(/___(\d+)___/).map((part, pIdx) => {
                                      if (/^\d+$/.test(part)) {
                                        return (
                                          <input
                                            key={pIdx}
                                            type="text"
                                            value={answers[part] || ''}
                                            onChange={(e) => handleAnswerChange(part, e.target.value)}
                                            className="w-28 mx-1 px-2 py-0.5 border-b-2 border-green-300 focus:border-green-600 outline-none bg-white text-center text-sm"
                                            placeholder={part}
                                          />
                                        );
                                      }
                                      return part;
                                    })}
                                  </span>
                                ) : item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {q.type === 'true_false_not_given' && (
                <div className="space-y-3">
                  <p className="text-sm text-green-600">{q.instruction}</p>
                  {q.statements?.map((stmt, sIdx) => (
                    <div key={sIdx} className="p-3 bg-white border rounded-lg">
                      <p className="text-sm mb-2">{stmt.number}. {stmt.statement}</p>
                      <div className="flex gap-4">
                        {['TRUE', 'FALSE', 'NOT GIVEN'].map(opt => (
                          <label key={opt} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name={`q${stmt.number}`}
                              value={opt}
                              checked={answers[stmt.number] === opt}
                              onChange={(e) => handleAnswerChange(stmt.number, e.target.value)}
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

              {q.type === 'section_matching' && (
                <div className="space-y-3">
                  <p className="text-sm text-green-600">{q.instruction}</p>
                  {q.items?.map((item, iIdx) => (
                    <div key={iIdx} className="p-3 bg-white border rounded-lg flex items-center gap-3">
                      <span className="text-sm flex-1">{item.number}. {item.item}</span>
                      <select
                        value={answers[item.number] || ''}
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

              {q.type === 'multiple_choice' && q.questions && (
                <div className="space-y-4">
                  {q.questions.map((mcq, mIdx) => (
                    <div key={mIdx} className="p-3 bg-white border rounded-lg">
                      <p className="text-sm font-medium mb-2">{mcq.number}. {mcq.question}</p>
                      <div className="space-y-1">
                        {mcq.options?.map((opt, oIdx) => (
                          <label key={oIdx} className="flex items-center gap-2 p-1 rounded hover:bg-gray-50 cursor-pointer">
                            <input
                              type="radio"
                              name={`q${mcq.number}`}
                              value={opt.charAt(0)}
                              checked={answers[mcq.number] === opt.charAt(0)}
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
            </div>
          ))}
        </Card>
      </div>
    );
  };

  const renderWritingSection = () => {
    const tasks = sectionData?.tasks || [];
    const currentTask = tasks[currentPart];
    
    if (!currentTask) return null;

    return (
      <div className="space-y-6">
        <div className="flex gap-2">
          {tasks.map((task, idx) => (
            <Button
              key={idx}
              variant={currentPart === idx ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentPart(idx)}
              className={currentPart === idx ? 'bg-purple-600' : ''}
            >
              Task {task.task_number}
            </Button>
          ))}
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">{currentTask.title}</h3>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span><Clock className="w-4 h-4 inline mr-1" />{currentTask.time_recommended}</span>
              <span>{currentTask.word_count}</span>
            </div>
          </div>

          <div className="mb-6 p-4 bg-purple-50 rounded-lg">
            <p className="text-gray-700 whitespace-pre-line">{currentTask.prompt}</p>
          </div>

          {/* Visual Data Description for Task 1 */}
          {currentTask.visual_data && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">{currentTask.visual_data.description}</h4>
              {currentTask.visual_data.maps && (
                <div className="grid md:grid-cols-2 gap-4">
                  {currentTask.visual_data.maps.map((map, mIdx) => (
                    <div key={mIdx} className="p-3 bg-white rounded border">
                      <h5 className="font-medium text-sm mb-2">{map.title}</h5>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {map.features?.map((f, fIdx) => (
                          <li key={fIdx}>• {f}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-amber-600 mt-3">
                Note: Visual image will be displayed here. Currently showing description.
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Response</label>
            <textarea
              value={answers[`writing_task${currentTask.task_number}`] || ''}
              onChange={(e) => handleAnswerChange(`writing_task${currentTask.task_number}`, e.target.value)}
              className="w-full h-64 p-4 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Write your response here..."
            />
            <div className="flex justify-between mt-2 text-sm text-gray-500">
              <span>Word count: {(answers[`writing_task${currentTask.task_number}`] || '').split(/\s+/).filter(Boolean).length}</span>
              <span>Target: {currentTask.word_count}</span>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderSpeakingSection = () => {
    const parts = sectionData?.parts || [];
    const currentSpeakingPart = parts[currentPart];
    
    if (!currentSpeakingPart) return null;

    return (
      <div className="space-y-6">
        <div className="flex gap-2">
          {parts.map((part, idx) => (
            <Button
              key={idx}
              variant={currentPart === idx ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentPart(idx)}
              className={currentPart === idx ? 'bg-orange-600' : ''}
            >
              Part {part.part_number}
            </Button>
          ))}
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">{currentSpeakingPart.title}</h3>
            <Badge className="bg-orange-100 text-orange-700">{currentSpeakingPart.duration}</Badge>
          </div>

          {currentSpeakingPart.topic && (
            <div className="mb-4 p-3 bg-orange-50 rounded-lg">
              <span className="text-sm font-medium text-orange-700">Topic: {currentSpeakingPart.topic}</span>
            </div>
          )}

          {/* Part 1 Questions */}
          {currentSpeakingPart.questions && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-700">Sample Questions:</h4>
              <ul className="space-y-2">
                {currentSpeakingPart.questions.map((q, qIdx) => (
                  <li key={qIdx} className="p-3 bg-white border rounded-lg text-sm">
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Part 2 Task Card */}
          {currentSpeakingPart.task_card && (
            <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-lg">
              <h4 className="font-bold mb-3">{currentSpeakingPart.task_card.topic}</h4>
              <p className="text-sm text-gray-600 mb-3">You should say:</p>
              <ul className="list-disc ml-5 space-y-1 text-sm">
                {currentSpeakingPart.task_card.points?.map((point, pIdx) => (
                  <li key={pIdx}>{point}</li>
                ))}
              </ul>
              <div className="mt-4 text-xs text-amber-700">
                Preparation time: {currentSpeakingPart.preparation_time} | Speaking time: {currentSpeakingPart.speaking_time}
              </div>
            </div>
          )}

          {/* Part 3 Topics */}
          {currentSpeakingPart.topics && (
            <div className="space-y-4">
              {currentSpeakingPart.topics.map((topic, tIdx) => (
                <div key={tIdx} className="p-4 bg-white border rounded-lg">
                  <h5 className="font-medium text-orange-700 mb-2">{topic.theme}</h5>
                  <ul className="space-y-2">
                    {topic.questions?.map((q, qIdx) => (
                      <li key={qIdx} className="text-sm text-gray-700">• {q}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-sm text-gray-600 mb-3">Practice speaking by recording yourself</p>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Mic className="w-4 h-4 mr-2" /> Start Recording
            </Button>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/question-bank')}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <div>
                <h1 className="font-bold text-lg">{testData.title}</h1>
                <p className="text-xs text-gray-500">{testData.book}</p>
              </div>
            </div>
            
            {/* Section Tabs */}
            <div className="flex gap-1">
              {sections.map(section => {
                const Icon = section.icon;
                const isActive = currentSection === section.id;
                return (
                  <Button
                    key={section.id}
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => {
                      setCurrentSection(section.id);
                      setCurrentPart(0);
                    }}
                    className={isActive ? `bg-${section.color}-600` : ''}
                  >
                    <Icon className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">{section.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {currentSection === 'listening' && renderListeningSection()}
        {currentSection === 'reading' && renderReadingSection()}
        {currentSection === 'writing' && renderWritingSection()}
        {currentSection === 'speaking' && renderSpeakingSection()}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Answered: {Object.keys(answers).length} questions
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowResults(true)}>
              Submit Test
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
