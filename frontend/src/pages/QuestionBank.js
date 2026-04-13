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

export default function QuestionBank({ user }) {
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
  
  // Completion tracking
  const [completionStats, setCompletionStats] = useState(null);
  const [showCompletionDetail, setShowCompletionDetail] = useState(false);

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
      
      // Load completion stats if user is logged in
      if (user?.id) {
        try {
          const compRes = await fetch(`${API_URL}/api/user/${user.id}/completion-stats`);
          if (compRes.ok) {
            const compData = await compRes.json();
            setCompletionStats(compData);
          }
        } catch (err) {
          console.error('Error loading completion stats:', err);
        }
      }
      
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
      id: 'random',
      name: 'Quick Practice',
      icon: Shuffle,
      description: '3 questions per set, swipe through like Shorts',
      color: 'from-indigo-500 to-purple-600',
      badge: 'Shorts'
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
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4" data-testid="stat-total-questions">
              <div className="text-2xl font-bold">{stats?.total_questions || 0}</div>
              <div className="text-white/70 text-sm">Total Questions</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4" data-testid="stat-full-tests">
              <div className="text-2xl font-bold">{stats?.full_tests || 0}</div>
              <div className="text-white/70 text-sm">Full Tests</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4" data-testid="stat-skill-areas">
              <div className="text-2xl font-bold">{stats?.practice_sets || 4}</div>
              <div className="text-white/70 text-sm">Skill Areas</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4" data-testid="stat-topics">
              <div className="text-2xl font-bold">{stats?.topics_count || 0}</div>
              <div className="text-white/70 text-sm">Topics</div>
            </div>
            {/* Completion Rate - 5th stat box */}
            <div 
              className="bg-white/20 backdrop-blur rounded-xl p-4 cursor-pointer hover:bg-white/25 transition-colors relative"
              data-testid="stat-completion-rate"
              onClick={() => setShowCompletionDetail(!showCompletionDetail)}
            >
              <div className="text-2xl font-bold">
                {completionStats ? `${completionStats.total_full_completed}/${completionStats.total_full_available}` : '0/20'}
              </div>
              <div className="text-white/70 text-sm">Completed</div>
              {completionStats?.total_full_completed > 0 && (
                <div className="mt-1.5 w-full bg-white/20 rounded-full h-1.5">
                  <div 
                    className="bg-emerald-400 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.round((completionStats.total_full_completed / completionStats.total_full_available) * 100)}%` }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Completion Breakdown Popup */}
          {showCompletionDetail && completionStats && (
            <div className="mt-4 bg-white/15 backdrop-blur-lg rounded-xl p-5 border border-white/20" data-testid="completion-breakdown">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">Completion Breakdown</h3>
                <button onClick={() => setShowCompletionDetail(false)} className="text-white/60 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <BookMarked className="w-4 h-4 text-red-300" />
                    <span className="text-xs font-medium text-white/80">Cambridge</span>
                  </div>
                  <div className="text-lg font-bold">{completionStats.cambridge.completed}/{completionStats.cambridge.total}</div>
                  <div className="mt-1 w-full bg-white/20 rounded-full h-1">
                    <div className="bg-red-400 h-1 rounded-full" style={{ width: `${(completionStats.cambridge.completed / completionStats.cambridge.total) * 100}%` }} />
                  </div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-indigo-300" />
                    <span className="text-xs font-medium text-white/80">AI Academic</span>
                  </div>
                  <div className="text-lg font-bold">{completionStats.ai_academic.completed}/{completionStats.ai_academic.total}</div>
                  <div className="mt-1 w-full bg-white/20 rounded-full h-1">
                    <div className="bg-indigo-400 h-1 rounded-full" style={{ width: `${(completionStats.ai_academic.completed / completionStats.ai_academic.total) * 100}%` }} />
                  </div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-purple-300" />
                    <span className="text-xs font-medium text-white/80">AI General</span>
                  </div>
                  <div className="text-lg font-bold">{completionStats.ai_general.completed}/{completionStats.ai_general.total}</div>
                  <div className="mt-1 w-full bg-white/20 rounded-full h-1">
                    <div className="bg-purple-400 h-1 rounded-full" style={{ width: `${(completionStats.ai_general.completed / completionStats.ai_general.total) * 100}%` }} />
                  </div>
                </div>
              </div>
              {/* Practice Stats */}
              {completionStats.practice && Object.keys(completionStats.practice).length > 0 && (
                <div className="border-t border-white/15 pt-3">
                  <p className="text-xs font-medium text-white/60 mb-2">Practice Sessions</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(completionStats.practice).map(([skill, count]) => (
                      <span key={skill} className="bg-white/10 rounded-lg px-3 py-1.5 text-xs font-medium">
                        {skill.charAt(0).toUpperCase() + skill.slice(1)}: {count}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {completionStats.total_full_completed === 0 && Object.keys(completionStats.practice || {}).length === 0 && (
                <p className="text-xs text-white/50 text-center">No tests completed yet. Start practicing to see your progress!</p>
              )}
            </div>
          )}
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
          <div className="space-y-6">
            {/* Compact Filter Bar */}
            <div className="flex flex-wrap items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm border border-slate-100">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Filter</span>
              <div className="h-5 w-px bg-slate-200" />
              {/* Band pills */}
              <div className="flex gap-1.5">
                {bandLevels.map(band => (
                  <button
                    key={band.id}
                    onClick={() => { setSelectedBand(selectedBand === band.id ? null : band.id); setSelectedTopic(null); }}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      selectedBand === band.id
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: band.color }} />
                    {band.name}
                  </button>
                ))}
              </div>
              <div className="h-5 w-px bg-slate-200" />
              {/* Topic dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    const el = document.getElementById('topic-dropdown');
                    if (el) el.classList.toggle('hidden');
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                    selectedTopic
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  data-testid="topic-filter-btn"
                >
                  {selectedTopic ? (topics.find(t => t.id === selectedTopic)?.name || 'Topic') : 'All Topics'}
                  <Filter className="w-3 h-3" />
                </button>
                <div id="topic-dropdown" className="hidden absolute top-full left-0 mt-1 w-72 bg-white rounded-xl border border-slate-200 shadow-xl z-50 py-2 max-h-64 overflow-y-auto" data-testid="topic-dropdown">
                  <button
                    onClick={() => { setSelectedTopic(null); document.getElementById('topic-dropdown')?.classList.add('hidden'); }}
                    className="w-full px-3 py-1.5 text-left text-xs hover:bg-indigo-50 text-slate-600 font-medium"
                  >
                    All Topics
                  </button>
                  <div className="border-t border-slate-100 my-1" />
                  {topics.map(topic => (
                    <button
                      key={topic.id}
                      onClick={() => { setSelectedTopic(topic.id); document.getElementById('topic-dropdown')?.classList.add('hidden'); }}
                      className={`w-full px-3 py-1.5 text-left text-xs hover:bg-indigo-50 truncate ${
                        selectedTopic === topic.id ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-600'
                      }`}
                    >
                      <span className="mr-1.5">{topic.icon}</span>{topic.name}
                    </button>
                  ))}
                </div>
              </div>
              {/* Clear */}
              {(selectedBand || selectedTopic) && (
                <>
                  <div className="h-5 w-px bg-slate-200" />
                  <button
                    onClick={() => { setSelectedBand(null); setSelectedTopic(null); }}
                    className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                  >
                    <X className="w-3 h-3" /> Clear
                  </button>
                </>
              )}
            </div>

            {/* Skills Grid - compact */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {skills.map(skill => {
                const Icon = skillIcons[skill.id] || BookOpen;
                const colors = {
                  reading: { bg: 'bg-blue-500', light: 'bg-blue-50 hover:bg-blue-100 border-blue-200', text: 'text-blue-600' },
                  listening: { bg: 'bg-purple-500', light: 'bg-purple-50 hover:bg-purple-100 border-purple-200', text: 'text-purple-600' },
                  writing: { bg: 'bg-emerald-500', light: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200', text: 'text-emerald-600' },
                  speaking: { bg: 'bg-orange-500', light: 'bg-orange-50 hover:bg-orange-100 border-orange-200', text: 'text-orange-600' },
                  grammar_vocab: { bg: 'bg-pink-500', light: 'bg-pink-50 hover:bg-pink-100 border-pink-200', text: 'text-pink-600' }
                };
                const c = colors[skill.id] || colors.reading;
                return (
                  <button
                    key={skill.id}
                    onClick={() => {
                      if (skill.id === 'writing') setShowWritingModal(true);
                      else if (skill.id === 'reading') setShowReadingModal(true);
                      else if (skill.id === 'listening') setShowListeningModal(true);
                      else if (skill.id === 'speaking') setShowSpeakingModal(true);
                      else { setSelectedSkill(skill.id); setActiveTab('practice'); }
                    }}
                    className={`${c.light} border rounded-xl p-4 text-left transition-all hover:shadow-md group`}
                    data-testid={`skill-${skill.id}`}
                  >
                    <div className={`${c.bg} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-800">{skill.name}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{skill.description}</p>
                    <div className={`flex items-center ${c.text} text-xs font-medium mt-2 group-hover:gap-1 transition-all`}>
                      Start <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </button>
                );
              })}
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
            
            {/* Selection Screen - Choose Cambridge or AI */}
            {!testCategory && (
              <div data-testid="test-category-selection">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Test Type</h2>
                  <p className="text-gray-500">Select a category to view available practice tests</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                  {/* Cambridge Card */}
                  <div 
                    data-testid="category-cambridge-card"
                    className="relative overflow-hidden rounded-2xl border-2 border-red-200 bg-gradient-to-br from-white via-red-50/40 to-orange-50/30 p-8 cursor-pointer transition-all duration-300 hover:border-red-400 hover:shadow-xl hover:-translate-y-1 group"
                    onClick={() => setTestCategory('cambridge')}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-100/50 rounded-full -translate-y-8 translate-x-8 group-hover:scale-110 transition-transform" />
                    <div className="relative">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg mb-5">
                        <BookMarked className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Cambridge IELTS</h3>
                      <p className="text-gray-500 text-sm mb-4 leading-relaxed">Official Cambridge practice tests from real past exams. The gold standard for IELTS preparation.</p>
                      <div className="flex items-center gap-3 mb-5">
                        <Badge className="bg-red-100 text-red-700">IELTS 17</Badge>
                        <Badge className="bg-red-100 text-red-700">IELTS 18</Badge>
                        <Badge className="bg-gray-100 text-gray-500">+2 coming</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span className="font-semibold text-red-600">{stats?.cambridge_tests || 0} Tests Available</span>
                        <span>&middot;</span>
                        <span>4 Sections Each</span>
                      </div>
                      <div className="mt-4 flex items-center gap-2 text-red-600 font-semibold text-sm group-hover:gap-3 transition-all">
                        View Tests <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* AI Practice Card */}
                  <div 
                    data-testid="category-ai-card"
                    className="relative overflow-hidden rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-white via-indigo-50/40 to-purple-50/30 p-8 cursor-pointer transition-all duration-300 hover:border-indigo-400 hover:shadow-xl hover:-translate-y-1 group"
                    onClick={() => setTestCategory('ai')}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100/50 rounded-full -translate-y-8 translate-x-8 group-hover:scale-110 transition-transform" />
                    <div className="relative">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg mb-5">
                        <Zap className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">AI Practice Tests</h3>
                      <p className="text-gray-500 text-sm mb-4 leading-relaxed">AI-generated full tests with real exam visuals, detailed feedback, and smart scoring analysis.</p>
                      <div className="flex items-center gap-3 mb-5">
                        <Badge className="bg-indigo-100 text-indigo-700">Academic</Badge>
                        <Badge className="bg-purple-100 text-purple-700">General Training</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span className="font-semibold text-indigo-600">{(stats?.ai_academic_tests || 0) + (stats?.ai_general_tests || 0)} Tests Available</span>
                        <span>&middot;</span>
                        <span>AI Feedback</span>
                      </div>
                      <div className="mt-4 flex items-center gap-2 text-indigo-600 font-semibold text-sm group-hover:gap-3 transition-all">
                        View Tests <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Cambridge Tests Detail View */}
            {testCategory === 'cambridge' && (
              <div data-testid="cambridge-tests-view">
                <button 
                  data-testid="back-to-categories-btn"
                  onClick={() => setTestCategory(null)} 
                  className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm font-medium transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Test Types
                </button>

                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                    <BookMarked className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-xl text-gray-900">Cambridge IELTS</h2>
                    <p className="text-sm text-gray-500">Official past exam papers</p>
                  </div>
                </div>

                <div className="space-y-5">
                  {/* IELTS 17 */}
                  <Card className="p-6 border-2 border-red-100 bg-gradient-to-br from-white to-red-50/50 rounded-2xl">
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
                        <span className="text-sm text-gray-500"> tests</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[1, 2, 3, 4].map(testNum => (
                        <div 
                          key={testNum}
                          className="p-4 bg-white rounded-xl border-2 border-red-200 hover:border-red-400 hover:shadow-md transition-all cursor-pointer group"
                          onClick={() => {
                            setSelectedCambridgeTest({ book: 'ielts17', test: `test${testNum}`, title: `IELTS 17 - Test ${testNum}` });
                            setShowCambridgeTestModal(true);
                          }}
                          data-testid={`cambridge-test-ielts17-test${testNum}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-gray-900">Test {testNum}</span>
                            <PlayCircle className="w-5 h-5 text-red-400 group-hover:text-red-600 transition-colors" />
                          </div>
                          <div className="flex items-center gap-1.5 mt-2">
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
                  
                  {/* IELTS 18 */}
                  <Card className="p-6 border-2 border-blue-100 bg-gradient-to-br from-white to-blue-50/50 rounded-2xl">
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
                        <span className="text-sm text-gray-500"> tests</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[1, 2, 3, 4].map(testNum => (
                        <div 
                          key={testNum}
                          className="p-4 bg-white rounded-xl border-2 border-blue-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
                          onClick={() => {
                            setSelectedCambridgeTest({ book: 'ielts18', test: `test${testNum}`, title: `IELTS 18 - Test ${testNum}` });
                            setShowCambridgeTestModal(true);
                          }}
                          data-testid={`cambridge-test-ielts18-test${testNum}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-gray-900">Test {testNum}</span>
                            <PlayCircle className="w-5 h-5 text-blue-400 group-hover:text-blue-600 transition-colors" />
                          </div>
                          <div className="flex items-center gap-1.5 mt-2">
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

                  {/* Coming Soon */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {['IELTS 16', 'IELTS 19'].map(book => (
                      <Card key={book} className="p-5 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                            <BookMarked className="w-5 h-5 text-gray-400" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-400">Cambridge {book}</h4>
                            <Badge className="bg-amber-100 text-amber-600 text-xs mt-1">Coming Soon</Badge>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* AI Practice Tests Detail View */}
            {testCategory === 'ai' && (
              <div data-testid="ai-tests-view">
                <button 
                  data-testid="back-to-categories-btn-ai"
                  onClick={() => setTestCategory(null)} 
                  className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm font-medium transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Test Types
                </button>

                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-xl text-gray-900">AI Practice Tests</h2>
                    <p className="text-sm text-gray-500">Full tests with AI feedback & real exam visuals</p>
                  </div>
                </div>

                <div className="space-y-5">
                  {/* Academic IELTS */}
                  <Card className="p-6 border-2 border-indigo-100 bg-gradient-to-br from-white to-indigo-50/30 rounded-2xl">
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
                  <Card className="p-6 border-2 border-purple-100 bg-gradient-to-br from-white to-purple-50/30 rounded-2xl">
                    <div className="flex items-start justify-between mb-5">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-lg text-gray-900">General Training IELTS</h3>
                          <Badge className="bg-purple-100 text-purple-700 text-xs">4 Sets</Badge>
                        </div>
                        <p className="text-sm text-gray-500">Practice tests for General Training module</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        {id: 'general_set_a_01', label: 'A', topic: 'Daily Life'},
                        {id: 'general_set_b_01', label: 'B', topic: 'Work & Social'},
                        {id: 'general_set_c_01', label: 'C', topic: 'Training'},
                        {id: 'general_set_d_01', label: 'D', topic: 'General Topics'}
                      ].map(set => (
                        <div 
                          key={set.id}
                          data-testid={`general-set-${set.label.toLowerCase()}-card`}
                          className="p-4 bg-white rounded-xl border-2 border-purple-200 hover:border-purple-400 hover:shadow-md transition-all cursor-pointer group"
                          onClick={() => {
                            const fullTest = fullTests.find(t => t.test_id === set.id);
                            if (fullTest) {
                              openTestModal(fullTest);
                            } else {
                              navigate(`/full-test?type=general&set=${set.id}`);
                            }
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                              <span className="font-bold text-purple-700 text-lg">{set.label}</span>
                            </div>
                            <PlayCircle className="w-5 h-5 text-purple-400 group-hover:text-purple-600 transition-colors" />
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
                </div>
              </div>
            )}
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
