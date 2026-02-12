import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  BookOpen, Headphones, PenTool, Mic, BookMarked,
  Target, Clock, Shuffle, Brain, TrendingUp,
  ChevronRight, Play, Filter, BarChart3, 
  CheckCircle, ArrowLeft, Layers, Zap, X, FileText, Edit3,
  HelpCircle, Award, PlayCircle, AlertCircle, Loader2
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Section times and questions for Full Test modal
const SECTION_TIMES = {
  listening: '40 minutes',
  reading: '60 minutes',
  writing: '60 minutes',
  speaking: '11-14 minutes'
};

const SECTION_QUESTIONS = {
  listening: '40 questions',
  reading: '40 questions',
  writing: '2 tasks',
  speaking: '3 parts'
};

const SECTION_COLORS = {
  listening: { bg: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-600' },
  reading: { bg: 'bg-green-500', light: 'bg-green-50', text: 'text-green-600' },
  writing: { bg: 'bg-purple-500', light: 'bg-purple-50', text: 'text-purple-600' },
  speaking: { bg: 'bg-orange-500', light: 'bg-orange-50', text: 'text-orange-600' }
};

export default function QuestionBank() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedBand, setSelectedBand] = useState(null);
  const [skills, setSkills] = useState([]);
  const [topics, setTopics] = useState([]);
  const [bandLevels, setBandLevels] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWritingModal, setShowWritingModal] = useState(false);
  const [showReadingModal, setShowReadingModal] = useState(false);
  const [showListeningModal, setShowListeningModal] = useState(false);
  const [showSpeakingModal, setShowSpeakingModal] = useState(false);
  const [fullTests, setFullTests] = useState([]);
  const [cambridgeBooks, setCambridgeBooks] = useState([]);
  const [selectedCambridgeBook, setSelectedCambridgeBook] = useState(null);
  
  // Full Test Modal State
  const [selectedTest, setSelectedTest] = useState(null);
  const [showTestModal, setShowTestModal] = useState(false);
  const [startingTest, setStartingTest] = useState(false);
  
  // Cambridge Test Selection Modal State
  const [showCambridgeTestModal, setShowCambridgeTestModal] = useState(false);
  const [selectedCambridgeTest, setSelectedCambridgeTest] = useState(null);
  
  // Full Tests sub-category: null (selection screen), 'cambridge', 'ai'
  const [testCategory, setTestCategory] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  // Auto-open Cambridge test modal when returning from a test via openTest param
  useEffect(() => {
    const openTest = searchParams.get('openTest');
    if (openTest) {
      const [book, test] = openTest.split('_');
      if (book && test) {
        const bookNum = book.replace('ielts', '');
        const testNum = test.replace('test', '');
        setSelectedCambridgeTest({ book, test, title: `IELTS ${bookNum} - Test ${testNum}` });
        setShowCambridgeTestModal(true);
        searchParams.delete('openTest');
        setSearchParams(searchParams, { replace: true });
      }
    }
  }, [searchParams, setSearchParams]);

  // Reload topics when band changes (Topic Gating)
  useEffect(() => {
    loadTopicsForBand(selectedBand);
  }, [selectedBand]);

  const loadData = async () => {
    try {
      const [skillsRes, bandsRes, statsRes, testsRes, cambridgeRes] = await Promise.all([
        fetch(`${API_URL}/api/question-bank/skills`),
        fetch(`${API_URL}/api/question-bank/band-levels`),
        fetch(`${API_URL}/api/question-bank/stats`),
        fetch(`${API_URL}/api/full-test/sets`),
        fetch(`${API_URL}/api/cambridge/books`)
      ]);

      const [skillsData, bandsData, statsData, testsData, cambridgeData] = await Promise.all([
        skillsRes.json(),
        bandsRes.json(),
        statsRes.json(),
        testsRes.json(),
        cambridgeRes.ok ? cambridgeRes.json() : { books: [] }
      ]);

      setSkills(skillsData.skills || []);
      setBandLevels(bandsData.band_levels || []);
      setStats(statsData);
      // Merge academic and general tests
      const allTests = [
        ...(testsData.academic_sets || []).map(t => ({ ...t, test_type: 'academic' })),
        ...(testsData.general_sets || []).map(t => ({ ...t, test_type: 'general' }))
      ];
      setFullTests(allTests);
      setCambridgeBooks(cambridgeData.books || []);
      
      // Load all topics initially (from Lesson Registry)
      await loadTopicsForBand(null);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load question bank data');
    } finally {
      setLoading(false);
    }
  };

  // Load topics from Lesson Registry with band filtering
  const loadTopicsForBand = async (bandLevel) => {
    try {
      const url = bandLevel 
        ? `${API_URL}/api/lesson-registry/topics?band_level=${bandLevel}`
        : `${API_URL}/api/lesson-registry/topics`;
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.success) {
        setTopics(data.topics || []);
      }
    } catch (error) {
      console.error('Error loading topics:', error);
    }
  };

  const skillIcons = {
    reading: BookOpen,
    listening: Headphones,
    writing: PenTool,
    speaking: Mic,
    grammar_vocab: BookMarked
  };

  // Start Full Test
  const startFullTest = async (mode) => {
    if (!selectedTest) return;
    
    setStartingTest(true);
    try {
      const res = await fetch(`${API_URL}/api/full-test/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          test_id: selectedTest.test_id,
          mode: mode
        })
      });
      const data = await res.json();
      if (data.success) {
        navigate(`/full-test/take/${selectedTest.test_id}?session=${data.session.session_id}&mode=${mode}`);
      }
    } catch (error) {
      console.error('Error starting test:', error);
      toast.error('Failed to start test session');
    } finally {
      setStartingTest(false);
    }
  };

  // Open test modal
  const openTestModal = (test) => {
    setSelectedTest(test);
    setShowTestModal(true);
  };

  // Close test modal
  const closeTestModal = () => {
    setSelectedTest(null);
    setShowTestModal(false);
  };

  const skillColors = {
    reading: 'from-blue-500 to-blue-600',
    listening: 'from-purple-500 to-purple-600',
    writing: 'from-green-500 to-green-600',
    speaking: 'from-orange-500 to-orange-600',
    grammar_vocab: 'from-pink-500 to-pink-600'
  };

  const practiceModesConfig = [
    {
      id: 'timed',
      name: 'Timed Practice',
      icon: Clock,
      description: 'Simulate real IELTS exam conditions',
      color: 'from-red-500 to-orange-500',
      badge: 'Exam Mode'
    },
    {
      id: 'random',
      name: 'Random Practice',
      icon: Shuffle,
      description: 'Fresh questions every attempt',
      color: 'from-blue-500 to-cyan-500',
      badge: 'Variety'
    },
    {
      id: 'smart',
      name: 'Smart Practice',
      icon: Brain,
      description: 'AI-powered focus on your weak areas',
      color: 'from-purple-500 to-pink-500',
      badge: 'AI Powered'
    }
  ];

  const startPractice = (mode, skill) => {
    if (!skill) {
      toast.error('Please select a skill first');
      return;
    }
    
    // Special handling for Grammar & Vocabulary - redirect to dedicated quiz page
    if (skill === 'grammar_vocab') {
      navigate(`/vocab-grammar/quiz${selectedBand ? `?band=${selectedBand}` : ''}`);
      return;
    }
    
    // Navigate to practice page with params
    navigate(`/question-bank/practice?mode=${mode}&skill=${skill}${selectedTopic ? `&topic=${selectedTopic}` : ''}${selectedBand ? `&band=${selectedBand}` : ''}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="text-white/80 hover:text-white hover:bg-white/10 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Layers className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">IELTS Question Bank</h1>
              <p className="text-white/80 text-lg">Cambridge IELTS compatible, AI-powered question bank</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="text-2xl font-bold">{stats?.total_questions || 185}</div>
              <div className="text-white/70 text-sm">Total Questions</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="text-2xl font-bold">{stats?.full_tests || 4}</div>
              <div className="text-white/70 text-sm">Full Tests</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="text-2xl font-bold">{stats?.practice_sets || 4}</div>
              <div className="text-white/70 text-sm">Skill Areas</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="text-2xl font-bold">{stats?.topics_count || 18}</div>
              <div className="text-white/70 text-sm">Topics</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'practice', label: 'Practice', icon: Target },
            { id: 'tests', label: 'Full Tests', icon: Clock },
            { id: 'progress', label: 'Progress', icon: TrendingUp }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'outline'}
                onClick={() => setActiveTab(tab.id)}
                className={activeTab === tab.id ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
              >
                <Icon className="w-4 h-4 mr-2" /> {tab.label}
              </Button>
            );
          })}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* STEP 1: Filter Selection (Band & Topics at TOP) */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-indigo-100">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-gray-900">1. First, Select Filters</h2>
                <span className="text-sm text-gray-500">(Optional)</span>
              </div>
              
              {/* Band Levels - Horizontal */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Band Level:</p>
                <div className="flex flex-wrap gap-2">
                  {bandLevels.map(band => (
                    <Button
                      key={band.id}
                      variant={selectedBand === band.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        const newBand = selectedBand === band.id ? null : band.id;
                        setSelectedBand(newBand);
                        // Clear topic when band changes (it might not be available)
                        setSelectedTopic(null);
                      }}
                      className={selectedBand === band.id ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
                      style={{ borderColor: band.color }}
                    >
                      <div 
                        className="w-2 h-2 rounded-full mr-2"
                        style={{ backgroundColor: band.color }}
                      ></div>
                      {band.name}
                      {selectedBand === band.id && <CheckCircle className="w-3 h-3 ml-2" />}
                    </Button>
                  ))}
                </div>
                {selectedBand && (
                  <p className="text-xs text-indigo-600 mt-2">
                    📚 {selectedBand === '4.0-5.0' ? 'Beginner Course topics' : 
                        selectedBand === '5.5-6.5' ? 'Beginner + Mastery Course topics' : 
                        'All course topics'} showing ({topics.length} topics)
                  </p>
                )}
              </div>

              {/* Topics - Horizontal Scroll with Stage Info */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Topic ({topics.length}):</p>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {topics.map(topic => (
                    <Badge
                      key={topic.id}
                      variant={selectedTopic === topic.id ? 'default' : 'outline'}
                      className={`cursor-pointer py-1.5 px-3 text-sm ${
                        selectedTopic === topic.id 
                          ? 'bg-indigo-600 hover:bg-indigo-700' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={() => setSelectedTopic(selectedTopic === topic.id ? null : topic.id)}
                      title={topic.stages ? `Courses: ${topic.stages.join(', ')}` : ''}
                    >
                      <span className="mr-1">{topic.icon}</span> {topic.name}
                      {topic.stages && topic.stages.length > 1 && (
                        <span className="ml-1 text-xs opacity-70">+{topic.stages.length - 1}</span>
                      )}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Active Filters Summary */}
              {(selectedBand || selectedTopic) && (
                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-indigo-700">
                    <CheckCircle className="w-4 h-4" />
                    <span>
                      {selectedBand && bandLevels.find(b => b.id === selectedBand)?.name}
                      {selectedBand && selectedTopic && ' • '}
                      {selectedTopic && topics.find(t => t.id === selectedTopic)?.name}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setSelectedBand(null); setSelectedTopic(null); }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-4 h-4 mr-1" /> Clear
                  </Button>
                </div>
              )}
            </div>

            {/* STEP 2: Skills Grid */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-gray-900">2. Select Skill and Start</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {skills.map(skill => {
                  const Icon = skillIcons[skill.id] || BookOpen;
                  const colorClass = skillColors[skill.id] || 'from-gray-500 to-gray-600';
                  return (
                    <Card
                      key={skill.id}
                      className="p-5 cursor-pointer hover:shadow-lg transition-all border-0 shadow-md overflow-hidden relative group"
                      onClick={() => {
                        if (skill.id === 'writing') {
                          setShowWritingModal(true);
                        } else if (skill.id === 'reading') {
                          setShowReadingModal(true);
                        } else if (skill.id === 'listening') {
                          setShowListeningModal(true);
                        } else if (skill.id === 'speaking') {
                          setShowSpeakingModal(true);
                        } else {
                          setSelectedSkill(skill.id);
                          setActiveTab('practice');
                        }
                      }}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${colorClass} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
                      <div className={`w-12 h-12 bg-gradient-to-br ${colorClass} rounded-xl flex items-center justify-center mb-3`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-bold text-gray-900 mb-1">{skill.name}</h3>
                      <p className="text-sm text-gray-500 mb-3">{skill.description}</p>
                      
                      {/* Show selected filters on card */}
                      {(selectedBand || selectedTopic) && (
                        <div className="mb-2 flex flex-wrap gap-1">
                          {selectedBand && (
                            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
                              {bandLevels.find(b => b.id === selectedBand)?.name}
                            </span>
                          )}
                          {selectedTopic && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                              {topics.find(t => t.id === selectedTopic)?.icon}
                            </span>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center text-indigo-600 text-sm font-medium">
                        Start <ChevronRight className="w-4 h-4 ml-1" />
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Practice Tab */}
        {activeTab === 'practice' && (
          <div className="space-y-8">
            {/* Skill Selection */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5" /> Select Skill
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {skills.map(skill => {
                  const Icon = skillIcons[skill.id] || BookOpen;
                  const isSelected = selectedSkill === skill.id;
                  return (
                    <Button
                      key={skill.id}
                      variant={isSelected ? 'default' : 'outline'}
                      onClick={() => setSelectedSkill(skill.id)}
                      className={`h-auto py-4 flex flex-col items-center gap-2 ${
                        isSelected ? 'bg-indigo-600 hover:bg-indigo-700' : ''
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                      <span className="text-sm">{skill.name}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Practice Modes */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5" /> Practice Mode
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {practiceModesConfig.map(mode => {
                  const Icon = mode.icon;
                  return (
                    <Card
                      key={mode.id}
                      className="p-6 cursor-pointer hover:shadow-xl transition-all border-0 shadow-lg overflow-hidden relative group"
                      onClick={() => startPractice(mode.id, selectedSkill)}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${mode.color} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
                      <Badge className="mb-3 bg-white/80 text-gray-700">{mode.badge}</Badge>
                      <div className={`w-14 h-14 bg-gradient-to-br ${mode.color} rounded-2xl flex items-center justify-center mb-4`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{mode.name}</h3>
                      <p className="text-sm text-gray-500 mb-4">{mode.description}</p>
                      <Button className={`w-full bg-gradient-to-r ${mode.color} border-0`}>
                        <Play className="w-4 h-4 mr-2" /> Start
                      </Button>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Active Filters */}
            {(selectedSkill || selectedTopic || selectedBand) && (
              <div className="p-4 bg-indigo-50 rounded-xl">
                <div className="flex items-center flex-wrap gap-2">
                  <span className="text-sm text-gray-600">Active Filters:</span>
                  {selectedSkill && (
                    <Badge variant="secondary" className="cursor-pointer" onClick={() => setSelectedSkill(null)}>
                      {skills.find(s => s.id === selectedSkill)?.name} ✕
                    </Badge>
                  )}
                  {selectedTopic && (
                    <Badge variant="secondary" className="cursor-pointer" onClick={() => setSelectedTopic(null)}>
                      {topics.find(t => t.id === selectedTopic)?.name} ✕
                    </Badge>
                  )}
                  {selectedBand && (
                    <Badge variant="secondary" className="cursor-pointer" onClick={() => setSelectedBand(null)}>
                      {bandLevels.find(b => b.id === selectedBand)?.name} ✕
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tests Tab */}
        {activeTab === 'tests' && (
          <div className="space-y-6">
            {/* Cambridge IELTS Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                  <BookMarked className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-xl text-gray-900">Cambridge IELTS</h2>
                  <p className="text-sm text-gray-500">Official Cambridge practice tests</p>
                </div>
              </div>
              
              {/* IELTS 17 */}
              <Card className="p-6 border-2 border-red-100 bg-gradient-to-br from-white to-red-50">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg text-gray-900">Cambridge IELTS 17</h3>
                      <Badge className="bg-green-100 text-green-700 text-xs">Available</Badge>
                    </div>
                    <p className="text-sm text-gray-500">Official Academic practice tests</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-red-600">4</span>
                    <span className="text-sm text-gray-500">/4 tests</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {/* Test 1 - Available */}
                  <div 
                    className="p-4 bg-white rounded-xl border-2 border-green-200 hover:border-green-400 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => {
                      setSelectedCambridgeTest({ book: 'ielts17', test: 'test1', title: 'IELTS 17 - Test 1' });
                      setShowCambridgeTestModal(true);
                    }}
                    data-testid="cambridge-test-ielts17-test1"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-gray-900">Test 1</span>
                      <PlayCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Headphones className="w-3 h-3" /> Listening
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <BookOpen className="w-3 h-3" /> Reading
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <PenTool className="w-3 h-3" /> Writing
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Mic className="w-3 h-3" /> Speaking
                      </div>
                    </div>
                  </div>
                  
                  {/* Test 2 - Active */}
                  <div 
                    className="p-4 bg-white rounded-xl border-2 border-green-200 hover:border-green-400 cursor-pointer transition-all hover:shadow-md"
                    onClick={() => {
                      setSelectedCambridgeTest({ book: 'ielts17', test: 'test2', title: 'IELTS 17 - Test 2' });
                      setShowCambridgeTestModal(true);
                    }}
                    data-testid="cambridge-test-ielts17-test2"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-gray-900">Test 2</span>
                      <PlayCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Headphones className="w-3 h-3" /> Listening
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <BookOpen className="w-3 h-3" /> Reading
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <PenTool className="w-3 h-3" /> Writing
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Mic className="w-3 h-3" /> Speaking
                      </div>
                    </div>
                  </div>
                  
                  {/* Test 3 - Active */}
                  <div 
                    className="p-4 bg-white rounded-xl border-2 border-green-200 hover:border-green-400 cursor-pointer transition-all hover:shadow-md"
                    onClick={() => {
                      setSelectedCambridgeTest({ book: 'ielts17', test: 'test3', title: 'IELTS 17 - Test 3' });
                      setShowCambridgeTestModal(true);
                    }}
                    data-testid="cambridge-test-ielts17-test3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-gray-900">Test 3</span>
                      <PlayCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Headphones className="w-3 h-3" /> Listening
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <BookOpen className="w-3 h-3" /> Reading
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <PenTool className="w-3 h-3" /> Writing
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Mic className="w-3 h-3" /> Speaking
                      </div>
                    </div>
                  </div>
                  
                  {/* Test 4 - Active */}
                  <div 
                    className="p-4 bg-white rounded-xl border-2 border-emerald-200 cursor-pointer transition-all hover:shadow-md"
                    onClick={() => {
                      setSelectedCambridgeTest({ book: 'ielts17', test: 'test4', title: 'IELTS 17 - Test 4' });
                      setShowCambridgeTestModal(true);
                    }}
                    data-testid="cambridge-test-ielts17-test4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-gray-900">Test 4</span>
                      <PlayCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Headphones className="w-3 h-3" /> Listening
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <BookOpen className="w-3 h-3" /> Reading
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <PenTool className="w-3 h-3" /> Writing
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Mic className="w-3 h-3" /> Speaking
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
              
              {/* IELTS 18 */}
              <Card className="p-6 border-2 border-blue-100 bg-gradient-to-br from-white to-blue-50">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg text-gray-900">Cambridge IELTS 18</h3>
                      <Badge className="bg-green-100 text-green-700 text-xs">Available</Badge>
                    </div>
                    <p className="text-sm text-gray-500">Official Academic practice tests</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-blue-600">4</span>
                    <span className="text-sm text-gray-500">/4 tests</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {[1, 2, 3, 4].map(testNum => (
                    <div 
                      key={testNum}
                      className="p-4 bg-white rounded-xl border-2 border-green-200 hover:border-green-400 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => {
                        setSelectedCambridgeTest({ book: 'ielts18', test: `test${testNum}`, title: `IELTS 18 - Test ${testNum}` });
                        setShowCambridgeTestModal(true);
                      }}
                      data-testid={`cambridge-test-ielts18-test${testNum}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-gray-900">Test {testNum}</span>
                        <PlayCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Headphones className="w-3 h-3" /> Listening
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <BookOpen className="w-3 h-3" /> Reading
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <PenTool className="w-3 h-3" /> Writing
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Mic className="w-3 h-3" /> Speaking
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              
              {/* Coming Soon Books */}
              <div className="grid md:grid-cols-2 gap-4">
                {['IELTS 16', 'IELTS 19'].map(book => (
                  <Card key={book} className="p-5 bg-gray-50 border-2 border-dashed border-gray-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                        <BookMarked className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-400">Cambridge {book}</h4>
                        <Badge className="bg-amber-100 text-amber-600 text-xs mt-1">Coming Soon</Badge>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">4 Academic Tests</div>
                  </Card>
                ))}
              </div>
            </div>
            
            {/* AI-Generated Tests Section */}
            <div className="space-y-4 pt-6 border-t">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-xl text-gray-900">IELTS Practice Tests</h2>
                  <p className="text-sm text-gray-500">AI-generated full tests with real exam visuals</p>
                </div>
              </div>

              {/* Academic IELTS */}
              <Card className="p-6 border-2 border-indigo-100 bg-gradient-to-br from-white to-indigo-50/30">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg text-gray-900">Academic IELTS</h3>
                      <Badge className="bg-indigo-100 text-indigo-700 text-xs">8 Sets</Badge>
                    </div>
                    <p className="text-sm text-gray-500">Complete practice tests with Listening, Reading, Writing & Speaking</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    {id: 'academic_set_a_01', label: 'A', topic: 'Urbanisation'},
                    {id: 'academic_set_b_01', label: 'B', topic: 'US Households'},
                    {id: 'academic_set_c_01', label: 'C', topic: 'Diagrams & Maps'},
                    {id: 'academic_set_d_01', label: 'D', topic: 'Floor Plans'},
                    {id: 'academic_set_e_01', label: 'E', topic: 'Airport Maps'},
                    {id: 'academic_set_f_01', label: 'F', topic: 'Metal Prices'},
                    {id: 'academic_set_g_01', label: 'G', topic: 'Appliances'},
                    {id: 'academic_set_h_01', label: 'H', topic: 'Sugar Production'}
                  ].map(set => (
                    <div 
                      key={set.id}
                      data-testid={`academic-set-${set.label.toLowerCase()}-card`}
                      className="p-4 bg-white rounded-xl border-2 border-indigo-200 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group"
                      onClick={() => {
                        const fullTest = fullTests.find(t => t.test_id === set.id);
                        if (fullTest) {
                          openTestModal(fullTest);
                        } else {
                          navigate(`/full-test?type=academic&set=${set.id}`);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                          <span className="font-bold text-indigo-700 text-lg">{set.label}</span>
                        </div>
                        <PlayCircle className="w-5 h-5 text-indigo-400 group-hover:text-indigo-600 transition-colors" />
                      </div>
                      <h4 className="font-semibold text-gray-900 text-sm">Set {set.label}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{set.topic}</p>
                      <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-gray-100">
                        <Headphones className="w-3 h-3 text-blue-400" />
                        <BookOpen className="w-3 h-3 text-green-400" />
                        <PenTool className="w-3 h-3 text-purple-400" />
                        <Mic className="w-3 h-3 text-orange-400" />
                        <span className="text-[10px] text-gray-400 ml-auto">4 sections</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* General Training */}
              <Card 
                className="p-5 bg-white border-2 border-purple-100 hover:border-purple-300 hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => navigate('/full-test?type=general')}
                data-testid="general-training-card"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      <span className="font-bold text-purple-700 text-lg">GT</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-gray-900">General Training IELTS</h4>
                        <Badge className="bg-purple-100 text-purple-700 text-xs">4 Sets</Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">Practice tests for General Training module</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-purple-400 group-hover:text-purple-600 transition-colors" />
                </div>
              </Card>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> Cambridge IELTS tests provide authentic exam practice. Complete all 4 sections for the most realistic experience.
              </p>
            </div>
          </div>
        )}

        {/* Progress Tab */}
        {activeTab === 'progress' && (
          <div className="space-y-6">
            <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
              <TrendingUp className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Progress Analysis</h3>
              <p className="text-gray-500 mb-6">Track your performance and discover weak areas</p>
              <Badge className="bg-amber-100 text-amber-700">Coming Soon</Badge>
            </div>
          </div>
        )}
      </div>

      {/* Writing Task Selection Modal */}
      {showWritingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4"
              onClick={() => setShowWritingModal(false)}
            >
              <X className="w-4 h-4" />
            </Button>
            
            <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <PenTool className="w-5 h-5 text-green-600" /> Writing Practice
            </h2>
            <p className="text-gray-500 mb-4">Which task would you like to practice?</p>
            
            <div className="space-y-3">
              {/* ====== ACADEMIC WRITING SECTION ====== */}
              <div className="mb-2">
                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Academic IELTS
                </p>
                <p className="text-xs text-gray-500 mb-3">Course-aligned topics with band filtering</p>
              </div>
              
              {/* Active Filters for Academic - Only show for Academic */}
              {(selectedTopic || selectedBand) && (
                <div className="mb-3 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                  <p className="text-xs text-indigo-600 font-medium mb-1">Academic Writing Filters:</p>
                  <div className="flex gap-2 flex-wrap">
                    {selectedBand && (
                      <Badge className="bg-indigo-100 text-indigo-700 text-xs">
                        Band: {bandLevels.find(b => b.id === selectedBand)?.name || selectedBand}
                      </Badge>
                    )}
                    {selectedTopic && (
                      <Badge className="bg-purple-100 text-purple-700 text-xs">
                        Topic: {topics.find(t => t.id === selectedTopic)?.name || selectedTopic}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              
              <Card 
                className="p-4 cursor-pointer hover:shadow-md transition-all border-2 hover:border-green-300"
                onClick={() => {
                  setShowWritingModal(false);
                  const params = new URLSearchParams();
                  if (selectedTopic) params.set('topic', selectedTopic);
                  if (selectedBand) params.set('band', selectedBand);
                  navigate(`/question-bank/writing/task1${params.toString() ? '?' + params.toString() : ''}`);
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">Task 1 - Academic</h3>
                    <p className="text-sm text-gray-500">Graph, table, process or map description</p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <Badge className="bg-green-100 text-green-700">150+ words</Badge>
                      <Badge className="bg-gray-100 text-gray-600">20 minutes</Badge>
                      {selectedTopic && <Badge className="bg-indigo-100 text-indigo-600">Topic Focused</Badge>}
                    </div>
                  </div>
                </div>
              </Card>
              
              <Card 
                className="p-4 cursor-pointer hover:shadow-md transition-all border-2 hover:border-blue-300"
                onClick={() => {
                  setShowWritingModal(false);
                  const params = new URLSearchParams();
                  if (selectedTopic) params.set('topic', selectedTopic);
                  if (selectedBand) params.set('band', selectedBand);
                  navigate(`/question-bank/writing/task2${params.toString() ? '?' + params.toString() : ''}`);
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Edit3 className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">Task 2 - Essay</h3>
                    <p className="text-sm text-gray-500">Opinion, Discussion, Problem-Solution essay</p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <Badge className="bg-blue-100 text-blue-700">250+ words</Badge>
                      <Badge className="bg-gray-100 text-gray-600">40 minutes</Badge>
                      {selectedTopic && <Badge className="bg-indigo-100 text-indigo-600">Topic Focused</Badge>}
                    </div>
                  </div>
                </div>
              </Card>
              
              {/* ====== GENERAL TRAINING SECTION ====== */}
              <div className="mt-6 mb-2 pt-4 border-t border-gray-200">
                <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> General Training IELTS
                </p>
                <p className="text-xs text-gray-500 mb-3">Letter writing practice, independent of course topics</p>
              </div>
              
              {/* Note: No topic/band filters for General Training */}
              <div className="mb-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                <p className="text-xs text-purple-600">
                  General Training letter writing is independent of course topics. It includes 32 different letter scenarios (Formal, Semi-formal, Informal).
                </p>
              </div>
              
              <Card 
                className="p-4 cursor-pointer hover:shadow-md transition-all border-2 hover:border-purple-300"
                onClick={() => {
                  setShowWritingModal(false);
                  // No topic/band params for General Training
                  navigate('/question-bank/writing/general/task1');
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">Task 1 - Letter Writing</h3>
                    <p className="text-sm text-gray-500">Formal, Semi-formal, Informal letter writing</p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <Badge className="bg-purple-100 text-purple-700">150+ words</Badge>
                      <Badge className="bg-gray-100 text-gray-600">20 minutes</Badge>
                      <Badge className="bg-amber-100 text-amber-700">32 scenarios</Badge>
                    </div>
                  </div>
                </div>
              </Card>
              
              {/* General Training Task 2 - Essay */}
              <Card 
                className="p-4 cursor-pointer hover:shadow-md transition-all border-2 hover:border-pink-300"
                onClick={() => {
                  setShowWritingModal(false);
                  navigate('/question-bank/writing/general/task2');
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Edit3 className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">Task 2 - Essay (General)</h3>
                    <p className="text-sm text-gray-500">Opinion, Discussion, Problem-Solution essays</p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <Badge className="bg-pink-100 text-pink-700">250+ words</Badge>
                      <Badge className="bg-gray-100 text-gray-600">40 minutes</Badge>
                      <Badge className="bg-amber-100 text-amber-700">16 scenarios</Badge>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </Card>
        </div>
      )}

      {/* Reading Task Selection Modal */}
      {showReadingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl bg-white shadow-2xl rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" /> Reading Practice
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowReadingModal(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Show selected filters */}
              {(selectedBand || selectedTopic) && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-600 font-medium mb-1">Active Filters:</p>
                  <div className="flex gap-2 flex-wrap">
                    {selectedBand && (
                      <Badge className="bg-blue-100 text-blue-700">
                        {bandLevels.find(b => b.id === selectedBand)?.name}
                      </Badge>
                    )}
                    {selectedTopic && (
                      <Badge className="bg-purple-100 text-purple-700">
                        {topics.find(t => t.id === selectedTopic)?.icon} {topics.find(t => t.id === selectedTopic)?.name}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <p className="text-sm text-gray-500 mb-6">Select an IELTS Reading type or question type:</p>

              {/* Question Type Based Practice - NEW */}
              <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                <h4 className="text-sm font-bold text-amber-700 mb-3 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" /> PRACTICE BY QUESTION TYPE
                </h4>
                <p className="text-xs text-amber-600 mb-3">Choose a specific question type to master</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'multiple_choice', name: 'Multiple Choice', icon: '🔘' },
                    { id: 'true_false_ng', name: 'True/False/NG', icon: '✓✗' },
                    { id: 'matching_headings', name: 'Matching Headings', icon: '📑' },
                    { id: 'sentence_completion', name: 'Sentence Completion', icon: '✏️' },
                    { id: 'summary_completion', name: 'Summary Completion', icon: '📝' },
                    { id: 'matching_information', name: 'Matching Info', icon: '🔗' }
                  ].map(qtype => (
                    <Button
                      key={qtype.id}
                      variant="outline"
                      size="sm"
                      className="justify-start text-xs hover:bg-amber-100 hover:border-amber-300"
                      onClick={() => {
                        setShowReadingModal(false);
                        navigate(`/question-bank/reading/practice?type=${qtype.id}`);
                      }}
                    >
                      <span className="mr-1">{qtype.icon}</span> {qtype.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Academic Reading Section */}
              <div className="mb-4">
                <h4 className="text-sm font-bold text-blue-700 mb-3 flex items-center gap-2">
                  <BookMarked className="w-4 h-4" /> ACADEMIC IELTS
                </h4>
                
                <Card 
                  className="p-4 cursor-pointer hover:shadow-md transition-all border-2 hover:border-blue-300"
                  onClick={() => {
                    setShowReadingModal(false);
                    const params = new URLSearchParams();
                    if (selectedTopic) params.append('topic', selectedTopic);
                    if (selectedBand) params.append('band', selectedBand);
                    navigate(`/question-bank/reading/academic${params.toString() ? '?' + params.toString() : ''}`);
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">Academic Reading</h3>
                      <p className="text-sm text-gray-500">Research articles, journals, academic texts</p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <Badge className="bg-blue-100 text-blue-700">Band 7-9</Badge>
                        <Badge className="bg-gray-100 text-gray-600">5 Modules</Badge>
                        <Badge className="bg-indigo-100 text-indigo-700">Advanced</Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* General Training Reading Section */}
              <div className="mb-4">
                <h4 className="text-sm font-bold text-purple-700 mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4" /> GENERAL TRAINING IELTS
                </h4>
                
                <Card 
                  className="p-4 cursor-pointer hover:shadow-md transition-all border-2 hover:border-purple-300"
                  onClick={() => {
                    setShowReadingModal(false);
                    const params = new URLSearchParams();
                    if (selectedTopic) params.append('topic', selectedTopic);
                    if (selectedBand) params.append('band', selectedBand);
                    navigate(`/question-bank/reading/general${params.toString() ? '?' + params.toString() : ''}`);
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">General Training Reading</h3>
                      <p className="text-sm text-gray-500">Policy documents, contracts, workplace notices</p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <Badge className="bg-purple-100 text-purple-700">Band 7-9</Badge>
                        <Badge className="bg-gray-100 text-gray-600">5 Modules</Badge>
                        <Badge className="bg-pink-100 text-pink-700">Advanced</Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Mastery Level Section - NEW */}
              <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <h4 className="text-sm font-bold text-green-700 mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4" /> MASTERY LEVEL (Band 6-7)
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <Card 
                    className="p-3 cursor-pointer hover:shadow-md transition-all border hover:border-green-300"
                    onClick={() => {
                      setShowReadingModal(false);
                      const params = new URLSearchParams();
                      if (selectedTopic) params.append('topic', selectedTopic);
                      navigate(`/question-bank/reading/mastery/academic${params.toString() ? '?' + params.toString() : ''}`);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-sm text-gray-900">Academic</p>
                        <p className="text-xs text-gray-500">5 Modules</p>
                      </div>
                    </div>
                  </Card>
                  <Card 
                    className="p-3 cursor-pointer hover:shadow-md transition-all border hover:border-green-300"
                    onClick={() => {
                      setShowReadingModal(false);
                      const params = new URLSearchParams();
                      if (selectedTopic) params.append('topic', selectedTopic);
                      navigate(`/question-bank/reading/mastery/general${params.toString() ? '?' + params.toString() : ''}`);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-sm text-gray-900">General</p>
                        <p className="text-xs text-gray-500">4 Modules</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

            </div>
          </Card>
        </div>
      )}

      {/* Listening Practice Modal */}
      {showListeningModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4"
              onClick={() => setShowListeningModal(false)}
            >
              <X className="w-4 h-4" />
            </Button>
            
            <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Headphones className="w-5 h-5 text-purple-600" /> Listening Practice
            </h2>
            <p className="text-gray-500 mb-4">Select your band level and start practicing</p>
            
            {/* Info Box */}
            <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-100">
              <p className="text-xs text-purple-600">
                🎧 IELTS Listening has ONE track for both Academic and General Training. 
                Practice with audio recordings covering Parts 1-4.
              </p>
            </div>

            {/* Active Filters */}
            {(selectedTopic || selectedBand) && (
              <div className="mb-4 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                <p className="text-xs text-indigo-600 font-medium mb-1">Selected Filters:</p>
                <div className="flex gap-2 flex-wrap">
                  {selectedBand && (
                    <Badge className="bg-indigo-100 text-indigo-700 text-xs">
                      Band: {bandLevels.find(b => b.id === selectedBand)?.name || selectedBand}
                    </Badge>
                  )}
                  {selectedTopic && (
                    <Badge className="bg-purple-100 text-purple-700 text-xs">
                      Topic: {topics.find(t => t.id === selectedTopic)?.name || selectedTopic}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-3">
              {/* Band-based Practice Options */}
              <p className="text-sm font-semibold text-gray-700 mb-2">Practice by Band Level:</p>
              
              {[
                { id: '4.0-5.0', name: 'Band 4.0-5.0', desc: 'Foundation - Simple conversations', color: 'green', parts: 'Part 1-2' },
                { id: '5.5-6.5', name: 'Band 5.5-6.5', desc: 'Intermediate - Discussions & talks', color: 'blue', parts: 'Part 2-3' },
                { id: '7.0-9.0', name: 'Band 7.0-9.0', desc: 'Advanced - Academic lectures', color: 'purple', parts: 'Part 3-4' }
              ].map(band => (
                <Card 
                  key={band.id}
                  className={`p-4 cursor-pointer hover:shadow-md transition-all border-2 hover:border-${band.color}-300`}
                  onClick={() => {
                    setShowListeningModal(false);
                    const params = new URLSearchParams();
                    params.set('band', band.id);
                    if (selectedTopic) params.set('topic', selectedTopic);
                    navigate(`/question-bank/listening?${params.toString()}`);
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 bg-gradient-to-br from-${band.color}-500 to-${band.color}-600 rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <Headphones className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{band.name}</h3>
                      <p className="text-sm text-gray-500">{band.desc}</p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <Badge className={`bg-${band.color}-100 text-${band.color}-700`}>{band.parts}</Badge>
                        <Badge className="bg-gray-100 text-gray-600">3-4 sets</Badge>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </Card>
              ))}

              {/* Question Type Based Practice */}
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-semibold text-gray-700 mb-2">Or practice by Question Type:</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'multiple_choice', name: 'Multiple Choice', icon: '🔘' },
                    { id: 'form_completion', name: 'Form Completion', icon: '📝' },
                    { id: 'sentence_completion', name: 'Sentence Completion', icon: '✏️' },
                    { id: 'matching', name: 'Matching', icon: '🔗' }
                  ].map(qtype => (
                    <Button
                      key={qtype.id}
                      variant="outline"
                      size="sm"
                      className="justify-start text-xs hover:bg-purple-50 hover:border-purple-300"
                      onClick={() => {
                        setShowListeningModal(false);
                        navigate(`/question-bank/listening?question_type=${qtype.id}`);
                      }}
                    >
                      <span className="mr-1">{qtype.icon}</span> {qtype.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* All Practice Button */}
              <Button 
                className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600"
                onClick={() => {
                  setShowListeningModal(false);
                  navigate('/question-bank/listening');
                }}
              >
                <Headphones className="w-4 h-4 mr-2" /> View All Listening Practice
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Full Test Selection Modal */}
      {showTestModal && selectedTest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <Badge className={`mb-2 ${selectedTest.test_type === 'academic' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                    {selectedTest.test_type === 'academic' ? 'Academic' : 'General Training'}
                  </Badge>
                  <h2 className="text-xl font-semibold text-slate-900">{selectedTest.title}</h2>
                  <p className="text-sm text-slate-500 mt-1">{selectedTest.description}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={closeTestModal}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Test Structure */}
              <div>
                <h3 className="font-medium text-slate-900 mb-3">Test Structure</h3>
                <div className="grid grid-cols-2 gap-3">
                  {['listening', 'reading', 'writing', 'speaking'].map((section) => {
                    const colors = SECTION_COLORS[section];
                    const Icon = section === 'listening' ? Headphones : 
                                 section === 'reading' ? BookOpen :
                                 section === 'writing' ? PenTool : Mic;
                    return (
                      <div key={section} className={`p-3 rounded-lg ${colors.light}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className={`w-4 h-4 ${colors.text}`} />
                          <span className="font-medium capitalize text-slate-900">{section}</span>
                        </div>
                        <div className="text-xs text-slate-600">
                          {SECTION_TIMES[section]} • {SECTION_QUESTIONS[section]}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Test Rules */}
              <div>
                <h3 className="font-medium text-slate-900 mb-3">Test Rules</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    You must complete each section within the time limit
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    Once a section is submitted, you cannot return to it
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    Results will only be shown after completing all sections
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    Ensure you have a stable internet connection
                  </li>
                </ul>
              </div>

              {/* Mode Selection */}
              <div>
                <h3 className="font-medium text-slate-900 mb-3">Choose How to Start</h3>
                
                {/* Full Test Option */}
                <button
                  onClick={() => startFullTest('full')}
                  disabled={startingTest}
                  className="w-full p-4 mb-3 border-2 border-slate-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      {startingTest ? (
                        <Loader2 className="w-5 h-5 text-green-600 animate-spin" />
                      ) : (
                        <Play className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">Full Test (All Sections)</div>
                      <div className="text-sm text-slate-500">
                        Complete Listening → Reading → Writing → Speaking (~3 hours)
                      </div>
                    </div>
                  </div>
                </button>
                
                {/* Individual Section Selection */}
                <div className="border-2 border-slate-200 rounded-lg p-4">
                  <div className="font-medium text-slate-900 mb-3">Or Start a Single Section:</div>
                  <div className="grid grid-cols-2 gap-3">
                    {['listening', 'reading', 'writing', 'speaking'].map((section) => {
                      const Icon = section === 'listening' ? Headphones : 
                                   section === 'reading' ? BookOpen :
                                   section === 'writing' ? PenTool : Mic;
                      const colors = {
                        listening: 'bg-blue-50 border-blue-200 hover:border-blue-500 text-blue-700',
                        reading: 'bg-green-50 border-green-200 hover:border-green-500 text-green-700',
                        writing: 'bg-purple-50 border-purple-200 hover:border-purple-500 text-purple-700',
                        speaking: 'bg-orange-50 border-orange-200 hover:border-orange-500 text-orange-700'
                      };
                      return (
                        <button
                          key={section}
                          onClick={() => startFullTest(section)}
                          disabled={startingTest}
                          className={`p-3 border-2 rounded-lg transition-all text-left disabled:opacity-50 ${colors[section]}`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className="w-4 h-4" />
                            <span className="font-medium capitalize">{section}</span>
                          </div>
                          <div className="text-xs opacity-80">
                            {SECTION_TIMES[section]} • {SECTION_QUESTIONS[section]}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t bg-slate-50 flex justify-end gap-3">
              <Button variant="outline" onClick={closeTestModal}>
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Speaking Practice Modal */}
      {showSpeakingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4"
              onClick={() => setShowSpeakingModal(false)}
            >
              <X className="w-4 h-4" />
            </Button>
            
            <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Mic className="w-5 h-5 text-orange-600" /> Speaking Practice
            </h2>
            <p className="text-gray-500 mb-4">IELTS Speaking test practice with AI evaluation</p>
            
            {/* Info Box */}
            <div className="mb-4 p-3 bg-orange-50 rounded-lg border border-orange-100">
              <p className="text-xs text-orange-600">
                🎙️ IELTS Speaking practice includes Part 1 (Interview), Part 2 (Cue Card), and Part 3 (Discussion). 
                Record your answers and get AI-powered evaluation.
              </p>
            </div>

            {/* Active Filters */}
            {(selectedTopic || selectedBand) && (
              <div className="mb-4 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                <p className="text-xs text-indigo-600 font-medium mb-1">Selected Filters:</p>
                <div className="flex gap-2 flex-wrap">
                  {selectedBand && (
                    <Badge className="bg-indigo-100 text-indigo-700 text-xs">
                      Band: {bandLevels.find(b => b.id === selectedBand)?.name || selectedBand}
                    </Badge>
                  )}
                  {selectedTopic && (
                    <Badge className="bg-purple-100 text-purple-700 text-xs">
                      Topic: {topics.find(t => t.id === selectedTopic)?.name || selectedTopic}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-3">
              {/* Track Selection */}
              <p className="text-sm font-semibold text-gray-700 mb-2">Select IELTS Track:</p>
              
              {/* Academic Speaking */}
              <Card 
                className="p-4 cursor-pointer hover:shadow-md transition-all border-2 hover:border-orange-300"
                onClick={() => {
                  setShowSpeakingModal(false);
                  const params = new URLSearchParams();
                  params.set('track', 'academic');
                  if (selectedBand) params.set('band', selectedBand);
                  if (selectedTopic) params.set('topic', selectedTopic);
                  navigate(`/question-bank/speaking?${params.toString()}`);
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">Academic Speaking</h3>
                    <p className="text-sm text-gray-500">Academic topics and formal discussion</p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <Badge className="bg-orange-100 text-orange-700">Part 1-2-3</Badge>
                      <Badge className="bg-gray-100 text-gray-600">11-14 min</Badge>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </Card>

              {/* General Training Speaking */}
              <Card 
                className="p-4 cursor-pointer hover:shadow-md transition-all border-2 hover:border-yellow-300"
                onClick={() => {
                  setShowSpeakingModal(false);
                  const params = new URLSearchParams();
                  params.set('track', 'general');
                  if (selectedBand) params.set('band', selectedBand);
                  if (selectedTopic) params.set('topic', selectedTopic);
                  navigate(`/question-bank/speaking?${params.toString()}`);
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">General Training Speaking</h3>
                    <p className="text-sm text-gray-500">Everyday topics and casual discussion</p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <Badge className="bg-yellow-100 text-yellow-700">Part 1-2-3</Badge>
                      <Badge className="bg-gray-100 text-gray-600">11-14 min</Badge>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </Card>

              {/* Band Level Selection */}
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-semibold text-gray-700 mb-2">Or select by Band Level:</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: '4.0-5.0', name: 'Band 4-5', color: 'green', desc: 'Shows text' },
                    { id: '5.5-6.5', name: 'Band 5.5-6.5', color: 'blue', desc: 'Audio only' },
                    { id: '7.0-9.0', name: 'Band 7-9', color: 'purple', desc: 'Advanced' }
                  ].map(band => (
                    <Button
                      key={band.id}
                      variant="outline"
                      size="sm"
                      className={`flex-col h-auto py-3 hover:bg-${band.color}-50 hover:border-${band.color}-300`}
                      onClick={() => {
                        setShowSpeakingModal(false);
                        const params = new URLSearchParams();
                        params.set('band', band.id);
                        navigate(`/question-bank/speaking?${params.toString()}`);
                      }}
                    >
                      <span className="font-medium">{band.name}</span>
                      <span className="text-xs text-gray-500 mt-1">{band.desc}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* All Practice Button */}
              <Button 
                className="w-full mt-4 bg-gradient-to-r from-orange-600 to-amber-600"
                onClick={() => {
                  setShowSpeakingModal(false);
                  navigate('/question-bank/speaking');
                }}
              >
                <Mic className="w-4 h-4 mr-2" /> View All Speaking Practice
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Cambridge Test Selection Modal */}
      {showCambridgeTestModal && selectedCambridgeTest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4"
              onClick={() => {
                setShowCambridgeTestModal(false);
                setSelectedCambridgeTest(null);
              }}
            >
              <X className="w-4 h-4" />
            </Button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookMarked className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{selectedCambridgeTest.title}</h2>
              <p className="text-gray-500">How would you like to practice?</p>
            </div>
            
            <div className="space-y-4">
              {/* Full Test Mode */}
              <Card 
                className="p-4 cursor-pointer hover:shadow-lg transition-all border-2 hover:border-red-300 bg-gradient-to-r from-red-50 to-orange-50"
                onClick={() => {
                  setShowCambridgeTestModal(false);
                  navigate(`/cambridge-test/${selectedCambridgeTest.book}/${selectedCambridgeTest.test}`);
                }}
                data-testid="select-full-test"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">Full Test Mode</h3>
                    <p className="text-sm text-gray-600 mb-3">Complete all 4 sections in order - just like the real exam</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 text-xs text-gray-500 bg-white rounded-lg px-2 py-1">
                        <Headphones className="w-3 h-3 text-blue-500" /> Listening (40 min)
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 bg-white rounded-lg px-2 py-1">
                        <BookOpen className="w-3 h-3 text-green-500" /> Reading (60 min)
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 bg-white rounded-lg px-2 py-1">
                        <PenTool className="w-3 h-3 text-purple-500" /> Writing (60 min)
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 bg-white rounded-lg px-2 py-1">
                        <Mic className="w-3 h-3 text-orange-500" /> Speaking (14 min)
                      </div>
                    </div>
                    <Badge className="mt-3 bg-red-100 text-red-700">~2 hours 45 minutes</Badge>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>
              </Card>

              <div className="flex items-center gap-4 my-2">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-sm text-gray-400">or practice individual skills</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              {/* Skill Selection */}
              <div className="grid grid-cols-2 gap-3">
                {/* Listening */}
                <Card 
                  className="p-4 cursor-pointer hover:shadow-md transition-all border-2 hover:border-blue-300"
                  onClick={() => {
                    setShowCambridgeTestModal(false);
                    navigate(`/cambridge-test/${selectedCambridgeTest.book}/${selectedCambridgeTest.test}?skill=listening`);
                  }}
                  data-testid="select-listening-skill"
                >
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <Headphones className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900">Listening</h4>
                    <p className="text-xs text-gray-500">40 questions</p>
                    <Badge className="bg-blue-100 text-blue-700 text-xs">40 min</Badge>
                  </div>
                </Card>

                {/* Reading */}
                <Card 
                  className="p-4 cursor-pointer hover:shadow-md transition-all border-2 hover:border-green-300"
                  onClick={() => {
                    setShowCambridgeTestModal(false);
                    navigate(`/cambridge-test/${selectedCambridgeTest.book}/${selectedCambridgeTest.test}?skill=reading`);
                  }}
                  data-testid="select-reading-skill"
                >
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900">Reading</h4>
                    <p className="text-xs text-gray-500">40 questions</p>
                    <Badge className="bg-green-100 text-green-700 text-xs">60 min</Badge>
                  </div>
                </Card>

                {/* Writing */}
                <Card 
                  className="p-4 cursor-pointer hover:shadow-md transition-all border-2 hover:border-purple-300"
                  onClick={() => {
                    setShowCambridgeTestModal(false);
                    navigate(`/cambridge-test/${selectedCambridgeTest.book}/${selectedCambridgeTest.test}?skill=writing`);
                  }}
                  data-testid="select-writing-skill"
                >
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <PenTool className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900">Writing</h4>
                    <p className="text-xs text-gray-500">2 tasks</p>
                    <Badge className="bg-purple-100 text-purple-700 text-xs">60 min</Badge>
                  </div>
                </Card>

                {/* Speaking */}
                <Card 
                  className="p-4 cursor-pointer hover:shadow-md transition-all border-2 hover:border-orange-300"
                  onClick={() => {
                    setShowCambridgeTestModal(false);
                    navigate(`/cambridge-test/${selectedCambridgeTest.book}/${selectedCambridgeTest.test}?skill=speaking`);
                  }}
                  data-testid="select-speaking-skill"
                >
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                      <Mic className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900">Speaking</h4>
                    <p className="text-xs text-gray-500">3 parts</p>
                    <Badge className="bg-orange-100 text-orange-700 text-xs">14 min</Badge>
                  </div>
                </Card>
              </div>

              <p className="text-xs text-center text-gray-400 mt-4">
                Tip: Skill practice mode lets you focus on one section at a time
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
