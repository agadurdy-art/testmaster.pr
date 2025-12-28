import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  BookOpen, Headphones, PenTool, Mic, BookMarked,
  Target, Clock, Shuffle, Brain, TrendingUp,
  ChevronRight, Play, Filter, BarChart3, 
  CheckCircle, ArrowLeft, Layers, Zap, X, FileText, Edit3
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function QuestionBank() {
  const navigate = useNavigate();
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

  useEffect(() => {
    loadData();
  }, []);

  // Reload topics when band changes (Topic Gating)
  useEffect(() => {
    loadTopicsForBand(selectedBand);
  }, [selectedBand]);

  const loadData = async () => {
    try {
      const [skillsRes, bandsRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/api/question-bank/skills`),
        fetch(`${API_URL}/api/question-bank/band-levels`),
        fetch(`${API_URL}/api/question-bank/stats`)
      ]);

      const [skillsData, bandsData, statsData] = await Promise.all([
        skillsRes.json(),
        bandsRes.json(),
        statsRes.json()
      ]);

      setSkills(skillsData.skills || []);
      setBandLevels(bandsData.band_levels || []);
      setStats(statsData);
      
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
              <h1 className="text-3xl md:text-4xl font-bold">IELTS Soru Bankası</h1>
              <p className="text-white/80 text-lg">Cambridge IELTS uyumlu, AI destekli soru bankası</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="text-2xl font-bold">{stats?.total_questions || 0}</div>
              <div className="text-white/70 text-sm">Total Questions</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="text-2xl font-bold">{stats?.full_tests || 0}</div>
              <div className="text-white/70 text-sm">Full Tests</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="text-2xl font-bold">4</div>
              <div className="text-white/70 text-sm">Skill Areas</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="text-2xl font-bold">18</div>
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
            { id: 'overview', label: 'Genel Bakış', icon: BarChart3 },
            { id: 'practice', label: 'Pratik Yap', icon: Target },
            { id: 'tests', label: 'Tam Testler', icon: Clock },
            { id: 'progress', label: 'İlerleme', icon: TrendingUp }
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
                <span className="text-sm text-gray-500">(İsteğe bağlı)</span>
              </div>
              
              {/* Band Levels - Horizontal */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Band Seviyesi:</p>
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
                    📚 {selectedBand === '4.0-5.0' ? 'Beginner Course konuları' : 
                        selectedBand === '5.5-6.5' ? 'Beginner + Mastery Course konuları' : 
                        'Tüm kurs konuları'} gösteriliyor ({topics.length} konu)
                  </p>
                )}
              </div>

              {/* Topics - Horizontal Scroll with Stage Info */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Konu ({topics.length}):</p>
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
                      title={topic.stages ? `Kurslar: ${topic.stages.join(', ')}` : ''}
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
                    <X className="w-4 h-4 mr-1" /> Temizle
                  </Button>
                </div>
              )}
            </div>

            {/* STEP 2: Skills Grid */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-gray-900">2. Beceri Seçin ve Başlayın</h2>
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
                        Başla <ChevronRight className="w-4 h-4 ml-1" />
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
                <Filter className="w-5 h-5" /> Beceri Seç
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
                <Zap className="w-5 h-5" /> Pratik Modu
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
                        <Play className="w-4 h-4 mr-2" /> Başla
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
                  <span className="text-sm text-gray-600">Aktif Filtreler:</span>
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
            <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
              <Clock className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Tam IELTS Testleri</h3>
              <p className="text-gray-500 mb-6">Gerçek sınav koşullarında tam test deneyimi</p>
              <Badge className="bg-amber-100 text-amber-700">Yakında Geliyor</Badge>
            </div>
          </div>
        )}

        {/* Progress Tab */}
        {activeTab === 'progress' && (
          <div className="space-y-6">
            <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
              <TrendingUp className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">İlerleme Analizi</h3>
              <p className="text-gray-500 mb-6">Performansınızı takip edin ve zayıf noktalarınızı keşfedin</p>
              <Badge className="bg-amber-100 text-amber-700">Yakında Geliyor</Badge>
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
            <p className="text-gray-500 mb-4">Hangi görevi pratik yapmak istiyorsunuz?</p>
            
            <div className="space-y-3">
              {/* ====== ACADEMIC WRITING SECTION ====== */}
              <div className="mb-2">
                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Academic IELTS
                </p>
                <p className="text-xs text-gray-500 mb-3">Kurs konularıyla ilişkili • Topic ve Band seçimi aktif</p>
              </div>
              
              {/* Active Filters for Academic - Only show for Academic */}
              {(selectedTopic || selectedBand) && (
                <div className="mb-3 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                  <p className="text-xs text-indigo-600 font-medium mb-1">Academic Writing Filtreleri:</p>
                  <div className="flex gap-2 flex-wrap">
                    {selectedBand && (
                      <Badge className="bg-indigo-100 text-indigo-700 text-xs">
                        Band: {bandLevels.find(b => b.id === selectedBand)?.name || selectedBand}
                      </Badge>
                    )}
                    {selectedTopic && (
                      <Badge className="bg-purple-100 text-purple-700 text-xs">
                        Konu: {topics.find(t => t.id === selectedTopic)?.name || selectedTopic}
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
                    <p className="text-sm text-gray-500">Grafik, tablo, süreç veya harita açıklaması</p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <Badge className="bg-green-100 text-green-700">150+ kelime</Badge>
                      <Badge className="bg-gray-100 text-gray-600">20 dakika</Badge>
                      {selectedTopic && <Badge className="bg-indigo-100 text-indigo-600">Konu Odaklı</Badge>}
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
                      <Badge className="bg-blue-100 text-blue-700">250+ kelime</Badge>
                      <Badge className="bg-gray-100 text-gray-600">40 dakika</Badge>
                      {selectedTopic && <Badge className="bg-indigo-100 text-indigo-600">Konu Odaklı</Badge>}
                    </div>
                  </div>
                </div>
              </Card>
              
              {/* ====== GENERAL TRAINING SECTION ====== */}
              <div className="mt-6 mb-2 pt-4 border-t border-gray-200">
                <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> General Training IELTS
                </p>
                <p className="text-xs text-gray-500 mb-3">Mektup yazma pratiği • Kurs konularından bağımsız</p>
              </div>
              
              {/* Note: No topic/band filters for General Training */}
              <div className="mb-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                <p className="text-xs text-purple-600">
                  ℹ️ General Training mektup yazma, kurs konularından bağımsızdır. 32 farklı mektup senaryosu (Formal, Semi-formal, Informal) içerir.
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
                    <p className="text-sm text-gray-500">Formal, Semi-formal, Informal mektup yazma</p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <Badge className="bg-purple-100 text-purple-700">150+ kelime</Badge>
                      <Badge className="bg-gray-100 text-gray-600">20 dakika</Badge>
                      <Badge className="bg-amber-100 text-amber-700">32 senaryo</Badge>
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
                      <Badge className="bg-pink-100 text-pink-700">250+ kelime</Badge>
                      <Badge className="bg-gray-100 text-gray-600">40 dakika</Badge>
                      <Badge className="bg-amber-100 text-amber-700">16 senaryo</Badge>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
