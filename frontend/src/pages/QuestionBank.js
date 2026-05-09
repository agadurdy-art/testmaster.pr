import React, { useState, useEffect, useRef } from 'react';
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
import { useGoBack } from '../hooks/useGoBack';
import AppShellNav from '../components/appshell/AppShellNav';
import LizAvatar from '../features/landing/components/LizAvatar';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// D9 handoff visual tokens — port-only, no data changes
const T = {
  brand: '160 84% 39%',
  brandDark: '160 84% 28%',
  sky: '199 89% 60%',
  gold: '43 96% 56%',
  rose: '350 70% 58%',
  ink: '220 25% 12%',
  muted: '220 10% 45%',
  fainter: '220 10% 65%',
  bg: '210 20% 98%',
  surface: '0 0% 100%',
  border: '220 15% 90%',
  borderSoft: '220 15% 94%',
};
const FONT_DISPLAY = '"Playfair Display", Georgia, serif';
const FONT_SANS = '"Inter", system-ui, sans-serif';

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
  // Tracks whether the currently-open skill picker modal was auto-opened from
  // a deep-link (e.g. dashboard ?writing=1 / ?reading=1 / ...). When true,
  // closing the modal pops history instead of leaving the user stranded on
  // /question-bank.
  const modalDeepLink = useRef(false);
  // Generic "back" that respects browser history; falls back to dashboard if
  // the user landed here directly (no history entry to pop).
  const goBack = useGoBack();
  const makeCloseModal = (setShow) => () => {
    if (modalDeepLink.current) {
      modalDeepLink.current = false;
      setShow(false);
      goBack();
    } else {
      setShow(false);
    }
  };
  const closeWritingModal = makeCloseModal(setShowWritingModal);
  const closeReadingModal = makeCloseModal(setShowReadingModal);
  const closeListeningModal = makeCloseModal(setShowListeningModal);
  const closeSpeakingModal = makeCloseModal(setShowSpeakingModal);
  const [fullTests, setFullTests] = useState([]);
  const [cambridgeBooks, setCambridgeBooks] = useState([]);
  const [selectedCambridgeBook, setSelectedCambridgeBook] = useState(null);
  // Reading + Listening question-type pickers (Cathoven-style dropdown).
  // Replaced the old all-visible card grid which users found confusing —
  // now it's a single dropdown with full IELTS-official names. The eight
  // reading + six listening type IDs mirror what /api/courses/reading/
  // question-types and /api/listening/question-types return; downstream
  // ReadingPracticeByType / ListeningPractice already filter on these IDs.
  const [selectedReadingQType, setSelectedReadingQType] = useState('');
  const [selectedListeningQType, setSelectedListeningQType] = useState('');
  const READING_QTYPES = [
    { id: 'multiple_choice', name: 'Multiple Choice' },
    { id: 'true_false_ng', name: 'True / False / Not Given' },
    { id: 'matching_headings', name: 'Matching Headings' },
    { id: 'matching_information', name: 'Matching Information' },
    { id: 'sentence_completion', name: 'Sentence Completion' },
    { id: 'summary_completion', name: 'Summary Completion' },
    { id: 'table_completion', name: 'Note / Table / Flow-chart Completion' },
    { id: 'short_answer', name: 'Short Answer Questions' },
  ];
  const LISTENING_QTYPES = [
    { id: 'multiple_choice', name: 'Multiple Choice' },
    { id: 'form_completion', name: 'Form / Note Completion' },
    { id: 'sentence_completion', name: 'Sentence Completion' },
    { id: 'matching', name: 'Matching' },
    { id: 'plan_map_labeling', name: 'Plan / Map Labelling' },
    { id: 'short_answer', name: 'Short Answer' },
  ];
  
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

  // D9 prompt search + Type filter + hide-done toggle
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [hideDone, setHideDone] = useState(false);
  // D9 active skill tab (writing/speaking/reading/listening)
  const [skillTab, setSkillTab] = useState('writing');
  // Advanced Mastery modules — used to deep-link writing prompt cards by topic
  // name to /advanced-mastery?lesson={module_number}&focus=writing
  const [advancedModules, setAdvancedModules] = useState([]);
  // D9 Topic dropdown — controlled by React state instead of DOM class toggle
  const [topicDropdownOpen, setTopicDropdownOpen] = useState(false);
  // Band/Topic filter visibility — collapsed by default; opens via Filters pill
  // (band-level filtering is a power-user feature, hidden until requested)
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // Deep-link support: `/question-bank?tab=practice` (from the Dashboard) opens
  // the Practice tab. Legacy `?tab=tests` and `?tab=progress` get redirected to
  // their standalone pages so those URLs keep working after the 4→2 consolidation.
  useEffect(() => {
    const requested = searchParams.get('tab');
    if (!requested) return;
    if (requested === 'tests') {
      navigate('/full-test', { replace: true });
      return;
    }
    if (requested === 'progress') {
      navigate('/progress', { replace: true });
      return;
    }
    if (requested === 'browse' || requested === 'overview') {
      setActiveTab('overview');
    } else if (requested === 'practice') {
      setActiveTab('practice');
    }
    // clean up the URL so refreshes don't re-trigger the redirect
    searchParams.delete('tab');
    setSearchParams(searchParams, { replace: true });
  }, [searchParams, setSearchParams, navigate]);

  // Open Full Tests tab when dashboard sends ?fulltests=cambridge|ai|picker.
  // 'cambridge' / 'ai' jump straight into the sub-list; anything else lands
  // the user on the "Choose Your Test Type" picker screen.
  useEffect(() => {
    const ft = searchParams.get('fulltests');
    if (!ft) return;
    setActiveTab('tests');
    if (ft === 'cambridge' || ft === 'ai') {
      setTestCategory(ft);
    } else {
      setTestCategory(null);
    }
    searchParams.delete('fulltests');
    setSearchParams(searchParams, { replace: true });
  }, [searchParams, setSearchParams]);

  // Auto-open a skill picker modal when dashboard sends a deep-link param
  // (?writing=1 / ?reading=1 / ?listening=1 / ?speaking=1). Sets
  // `modalDeepLink` so the modal close handler pops history instead of
  // stranding the user on /question-bank.
  useEffect(() => {
    const skill = ['writing', 'reading', 'listening', 'speaking'].find(
      (s) => searchParams.get(s) === '1'
    );
    if (!skill) return;
    if (skill === 'writing') setShowWritingModal(true);
    else if (skill === 'reading') setShowReadingModal(true);
    else if (skill === 'listening') setShowListeningModal(true);
    else if (skill === 'speaking') setShowSpeakingModal(true);
    modalDeepLink.current = true;
    searchParams.delete(skill);
    setSearchParams(searchParams, { replace: true });
  }, [searchParams, setSearchParams]);

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

      // Load Advanced Mastery modules for prompt-card deep-linking (writing)
      try {
        const amRes = await fetch(`${API_URL}/api/advanced-mastery/modules`);
        if (amRes.ok) {
          const amData = await amRes.json();
          setAdvancedModules(Array.isArray(amData) ? amData : []);
        }
      } catch (amErr) {
        console.error('Error loading advanced modules:', amErr);
      }
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
    
    // Navigate to practice page with params
    navigate(`/question-bank/practice?mode=${mode}&skill=${skill}${selectedTopic ? `&topic=${selectedTopic}` : ''}${selectedBand ? `&band=${selectedBand}` : ''}`);
  };

  if (loading) {
    return (
      <div className="appshell-page" style={{ fontFamily: FONT_SANS, color: `hsl(${T.ink})` }}>
        <AppShellNav currentPage="practice" user={user} />
        <div style={{ display: 'grid', placeItems: 'center', padding: '120px 24px' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            border: `2px solid hsl(${T.border})`, borderBottomColor: `hsl(${T.brand})`,
            animation: 'spin 0.9s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  const completionPct = completionStats?.total_full_available
    ? Math.round((completionStats.total_full_completed / completionStats.total_full_available) * 100)
    : 0;

  // D9: derive weakest skill from completion stats (lowest completion %).
  // completionStats.practice is { writing: count, ... } — use as a rough proxy
  // for "where the user has practised least". Falls back to 'writing'.
  const weakestSkill = (() => {
    const practice = completionStats?.practice || {};
    const candidates = ['writing', 'speaking', 'reading', 'listening'];
    let lowest = 'writing';
    let lowestCount = Infinity;
    for (const c of candidates) {
      const count = practice[c] ?? 0;
      if (count < lowestCount) {
        lowestCount = count;
        lowest = c;
      }
    }
    return lowest;
  })();

  // D9: pick a single Liz-recommended prompt from the topics list.
  // We don't have per-skill prompts wired here yet, so fall back to the
  // first available topic. This is purely cosmetic — clicking opens the
  // existing skill modal exactly like the skill cards already do.
  const lizPickTopic = topics[0] || null;
  const openSkillModal = (skillId) => {
    if (skillId === 'writing') setShowWritingModal(true);
    else if (skillId === 'reading') setShowReadingModal(true);
    else if (skillId === 'listening') setShowListeningModal(true);
    else if (skillId === 'speaking') setShowSpeakingModal(true);
  };

  // D9 Type filter options per skill tab. Only relevant chips are shown.
  const typeFiltersForSkill = (s) => {
    if (s === 'writing') return [
      { id: 'all', label: 'All' },
      { id: 'task1', label: 'Task 1' },
      { id: 'task2', label: 'Task 2' },
    ];
    if (s === 'speaking') return [
      { id: 'all', label: 'All' },
      { id: 'part1', label: 'Part 1' },
      { id: 'part2', label: 'Part 2' },
      { id: 'part3', label: 'Part 3' },
    ];
    return [{ id: 'all', label: 'All' }];
  };

  // D9 prompt grid — filters topics by search + selected topic + type filter.
  // Topic data shape comes from /api/lesson-registry/topics (id/name/icon/
  // description). Band filtering is already applied via loadTopicsForBand.
  // Type filter (task1/task2/part1/2/3) narrows by topic.type|task|part if
  // present in the payload, else by simple name/description keyword match.
  const typeKeywords = {
    task1: ['task 1', 'task1'],
    task2: ['task 2', 'task2', 'essay'],
    part1: ['part 1', 'part1'],
    part2: ['part 2', 'part2', 'cue card', 'long turn'],
    part3: ['part 3', 'part3', 'discussion'],
  };
  // Prompt grid is sourced from Advanced Mastery modules so each card is a
  // course title ("The Digital Frontier", "The Educational Paradigm", …)
  // and clicking it deep-links into that lesson's writing/reading/etc.
  // section via /advanced-mastery?lesson=N&focus={skillTab}. We map module
  // shape → the {id, name, description, module_number} the grid expects.
  const filteredPrompts = (advancedModules || [])
    .map((m) => ({
      id: `am-${m.module_number}`,
      name: m.title || '',
      description: m.subtitle || '',
      module_number: m.module_number,
      level: m.level,
    }))
    .filter((t) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const name = (t.name || '').toLowerCase();
        const desc = (t.description || '').toLowerCase();
        if (!name.includes(q) && !desc.includes(q)) return false;
      }
      if (typeFilter !== 'all') {
        const hay = `${t.name || ''} ${t.description || ''}`.toLowerCase();
        const kws = typeKeywords[typeFilter] || [typeFilter];
        if (!kws.some((k) => hay.includes(k))) return false;
      }
      return true;
    });

  return (
    <div className="appshell-page" style={{ fontFamily: FONT_SANS, color: `hsl(${T.ink})` }}>
      <AppShellNav currentPage="practice" user={user} />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 24px 48px' }}>

        {/* Back */}
        <button
          onClick={goBack}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 0', marginBottom: 14,
            background: 'none', border: 0, cursor: 'pointer',
            color: `hsl(${T.muted})`, fontSize: 13, fontWeight: 500,
          }}
        >
          <ArrowLeft style={{ width: 14, height: 14 }} /> Back
        </button>

        {/* Page Head */}
        <header style={{ marginBottom: 22 }}>
          {/* Title row — icon + kicker/title left, smaller stat chips right (same line) */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 20, flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 56, height: 56, flex: '0 0 56px',
                borderRadius: 16,
                background: `linear-gradient(135deg, hsl(${T.brand} / 0.18), hsl(${T.brand} / 0.08))`,
                border: `1px solid hsl(${T.brand} / 0.22)`,
                display: 'grid', placeItems: 'center',
                color: `hsl(${T.brandDark})`,
                boxShadow: `0 2px 6px hsl(${T.brand} / 0.10)`,
              }}>
                <Layers style={{ width: 26, height: 26 }} strokeWidth={1.8} />
              </div>
              <div>
                <div style={{ fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: `hsl(${T.brandDark})`, fontWeight: 600 }}>
                  Practice
                </div>
                <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 36, fontWeight: 600, letterSpacing: '-0.01em', margin: '4px 0 0' }}>
                  Question Bank
                </h1>
              </div>
            </div>

            {/* Stat chips — right side of title row, smaller iOS 26 style cool tint */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
              {[
                { label: 'Questions', value: stats?.total_questions || 0, testId: 'stat-total-questions' },
                { label: 'Full Tests', value: stats?.full_tests || 0, testId: 'stat-full-tests' },
                { label: 'Topics', value: stats?.topics_count || 0, testId: 'stat-topics' },
              ].map((chip) => (
                <div key={chip.label} data-testid={chip.testId} style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '7px 14px', borderRadius: 12,
                  background: 'hsl(210 70% 98%)',
                  border: '1px solid hsl(210 60% 90%)',
                  fontSize: 13,
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  boxShadow: '0 1px 2px hsl(210 30% 50% / 0.04)',
                }}>
                  <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, color: `hsl(${T.ink})`, fontSize: 13 }}>{chip.value}</span>
                  <span style={{ color: `hsl(${T.muted})` }}>{chip.label}</span>
                </div>
              ))}
              {completionStats && (
                <button
                  data-testid="stat-completion-rate"
                  onClick={() => setShowCompletionDetail(!showCompletionDetail)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '7px 14px', borderRadius: 12,
                    background: `hsl(${T.brand} / 0.08)`, border: `1px solid hsl(${T.brand} / 0.28)`,
                    fontSize: 13, cursor: 'pointer', color: `hsl(${T.brandDark})`,
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                  }}
                >
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: `hsl(${T.brand})`, boxShadow: `0 0 0 3px hsl(${T.brand} / 0.18)` }} />
                  <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 13 }}>
                    {completionStats.total_full_completed}/{completionStats.total_full_available}
                  </span>
                  <span>completed</span>
                </button>
              )}
            </div>
          </div>

          {/* Subtitle */}
          <p style={{ margin: '8px 0 0', color: `hsl(${T.muted})`, maxWidth: 620, fontSize: 14 }}>
            Hand-picked IELTS prompts with instant Liz feedback. Filter by topic, difficulty, or band level.
          </p>

          {/* Search bar + Filters pill */}
          <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 14px', borderRadius: 999,
              background: `hsl(${T.surface})`, border: `1px solid hsl(${T.border})`,
              boxShadow: `0 1px 2px hsl(220 15% 20% / 0.04)`,
              minWidth: 280, maxWidth: 420, flex: '1 1 280px',
            }}>
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{ width: 16, height: 16, color: `hsl(${T.muted})`, flex: '0 0 16px' }}>
                <circle cx="9" cy="9" r="6" />
                <path d="M14 14l4 4" />
              </svg>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics, keywords…"
                style={{ border: 0, outline: 0, width: '100%', background: 'transparent', fontSize: 14 }}
              />
            </div>
            {activeTab !== 'tests' && (
              <button
                onClick={() => setShowFilters(v => !v)}
                data-testid="qb-filters-toggle"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '10px 14px', borderRadius: 999,
                  background: (selectedBand || selectedTopic)
                    ? `hsl(${T.brand} / 0.08)`
                    : 'hsl(210 40% 97%)',
                  border: `1px solid ${(selectedBand || selectedTopic) ? `hsl(${T.brand} / 0.32)` : 'hsl(210 30% 92%)'}`,
                  fontSize: 13, fontWeight: 500,
                  color: (selectedBand || selectedTopic) ? `hsl(${T.brandDark})` : `hsl(${T.muted})`,
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <Filter style={{ width: 13, height: 13 }} />
                Filters
                {(selectedBand || selectedTopic) && (
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    padding: '1px 7px', borderRadius: 999,
                    background: `hsl(${T.brand})`, color: 'white',
                  }}>
                    {(selectedBand ? 1 : 0) + (selectedTopic ? 1 : 0)}
                  </span>
                )}
              </button>
            )}
          </div>
        </header>

        {/* Completion Breakdown Popup — preserved, restyled */}
        {showCompletionDetail && completionStats && (
          <div style={{
            background: `hsl(${T.surface})`, border: `1px solid hsl(${T.border})`,
            borderRadius: 16, padding: 18, marginBottom: 22,
            boxShadow: `0 4px 16px hsl(220 15% 20% / 0.06)`,
          }} data-testid="completion-breakdown">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 16, fontWeight: 600, margin: 0 }}>Completion Breakdown</h3>
              <button onClick={() => setShowCompletionDetail(false)} style={{ background: 'none', border: 0, color: `hsl(${T.muted})`, cursor: 'pointer', padding: 4 }}>
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 12 }}>
              {[
                { key: 'cambridge', label: 'Cambridge', icon: BookMarked, accent: T.sky },
                { key: 'ai_academic', label: 'AI Academic', icon: Zap, accent: T.brand },
                { key: 'ai_general', label: 'AI General', icon: Zap, accent: T.gold },
              ].map(({ key, label, icon: Icon, accent }) => {
                const c = completionStats[key];
                const pct = c?.total ? (c.completed / c.total) * 100 : 0;
                return (
                  <div key={key} style={{
                    padding: 12, borderRadius: 10,
                    background: `hsl(${T.borderSoft})`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <Icon style={{ width: 14, height: 14, color: `hsl(${accent})` }} />
                      <span style={{ fontSize: 12, fontWeight: 500, color: `hsl(${T.muted})` }}>{label}</span>
                    </div>
                    <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 600 }}>{c?.completed || 0}/{c?.total || 0}</div>
                    <div style={{ marginTop: 6, width: '100%', background: `hsl(${T.border})`, borderRadius: 999, height: 4 }}>
                      <div style={{ background: `hsl(${accent})`, height: 4, borderRadius: 999, width: `${pct}%`, transition: 'width 250ms' }} />
                    </div>
                  </div>
                );
              })}
            </div>
            {completionStats.practice && Object.keys(completionStats.practice).length > 0 && (
              <div style={{ borderTop: `1px solid hsl(${T.border})`, paddingTop: 12 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: `hsl(${T.fainter})`, letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 8px' }}>
                  Practice Sessions
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {Object.entries(completionStats.practice).map(([skill, count]) => (
                    <span key={skill} style={{
                      background: `hsl(${T.borderSoft})`, padding: '4px 10px', borderRadius: 999,
                      fontSize: 12, fontWeight: 500, color: `hsl(${T.muted})`,
                    }}>
                      {skill.charAt(0).toUpperCase() + skill.slice(1)}: {count}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {completionStats.total_full_completed === 0 && Object.keys(completionStats.practice || {}).length === 0 && (
              <p style={{ fontSize: 12, color: `hsl(${T.fainter})`, textAlign: 'center', margin: 0 }}>
                No tests completed yet. Start practicing to see your progress!
              </p>
            )}
          </div>
        )}

        {/* ===== D9 Liz's Pick hero (Practice only) ===== */}
        {activeTab !== 'tests' && lizPickTopic && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 16,
            padding: 18, borderRadius: 24,
            background: `linear-gradient(135deg, hsl(${T.brand} / 0.10), hsl(${T.sky} / 0.10))`,
            border: `1px solid hsl(${T.brand} / 0.22)`,
            marginBottom: 22,
            flexWrap: 'wrap',
          }}>
            <div style={{
              width: 54, height: 54, flex: '0 0 54px',
              borderRadius: '50%',
              boxShadow: `0 4px 14px hsl(${T.brand} / 0.3)`,
              overflow: 'hidden',
            }}>
              <LizAvatar size={54} alt="Liz" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600, color: `hsl(${T.brandDark})` }}>
                Liz's pick for you
              </div>
              <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 19, fontWeight: 600, margin: '2px 0 4px' }}>
                {lizPickTopic.icon ? `${lizPickTopic.icon} ` : ''}{lizPickTopic.name}
              </h3>
              <p style={{ margin: 0, color: `hsl(${T.ink} / 0.75)`, fontSize: 14 }}>
                {weakestSkill.charAt(0).toUpperCase() + weakestSkill.slice(1)} ·{' '}
                <em style={{ color: `hsl(${T.muted})`, fontStyle: 'normal' }}>
                  chosen because your last sessions skipped {weakestSkill} — let's fix that
                </em>
              </p>
            </div>
            <button
              onClick={() => { setSkillTab(weakestSkill); openSkillModal(weakestSkill); }}
              style={{
                padding: '10px 18px', borderRadius: 10,
                background: `hsl(${T.brand})`, color: 'white',
                fontWeight: 600, fontSize: 13, border: 0, cursor: 'pointer',
              }}
            >
              Start now →
            </button>
          </div>
        )}

        {/* ===== D9 Skill Tabs — centered iOS 26 segmented pill ===== */}
        {true && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
            <div style={{
              display: 'inline-flex', gap: 4,
              padding: 6, borderRadius: 20,
              background: 'hsl(210 40% 97%)',
              border: '1px solid hsl(210 30% 92%)',
              boxShadow: '0 1px 2px hsl(210 30% 50% / 0.04)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              maxWidth: '100%', overflowX: 'auto',
            }}>
              {[
                { id: 'writing', label: 'Writing', icon: PenTool, count: stats?.by_skill?.writing, suffix: 'prompts' },
                { id: 'speaking', label: 'Speaking', icon: Mic, count: stats?.by_skill?.speaking, suffix: 'prompts' },
                { id: 'reading', label: 'Reading', icon: BookOpen, count: stats?.by_skill?.reading, suffix: 'prompts' },
                { id: 'listening', label: 'Listening', icon: Headphones, count: stats?.by_skill?.listening, suffix: 'prompts' },
                { id: 'fulltests', label: 'Full Tests', icon: Award, subtitle: 'Cambridge + AI' },
              ].map(tab => {
                const Icon = tab.icon;
                const isFullTests = tab.id === 'fulltests';
                const selected = isFullTests ? activeTab === 'tests' : (activeTab !== 'tests' && skillTab === tab.id);
                return (
                  <button
                    key={tab.id}
                    data-testid={`d9-tab-${tab.id}`}
                    onClick={() => {
                      if (isFullTests) {
                        setActiveTab('tests');
                        return;
                      }
                      setActiveTab('overview');
                      setSkillTab(tab.id);
                      setTypeFilter('all');
                    }}
                    style={{
                      padding: '10px 18px',
                      borderRadius: 14,
                      fontSize: 15, fontWeight: selected ? 600 : 500,
                      color: selected ? `hsl(${T.brandDark})` : `hsl(${T.muted})`,
                      background: selected ? 'white' : 'transparent',
                      border: selected ? '1px solid hsl(210 30% 90%)' : '1px solid transparent',
                      cursor: 'pointer',
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      whiteSpace: 'nowrap',
                      boxShadow: selected ? '0 1px 3px hsl(210 30% 50% / 0.10), 0 0 0 1px hsl(210 30% 95%)' : 'none',
                      transition: 'all 180ms ease',
                    }}
                  >
                    <Icon style={{ width: 15, height: 15 }} strokeWidth={selected ? 2 : 1.8} /> {tab.label}
                    {tab.subtitle && (
                      <span style={{
                        fontSize: 12, fontWeight: 500,
                        color: `hsl(${T.muted})`,
                        marginLeft: 2,
                      }}>
                        {tab.subtitle}
                      </span>
                    )}
                    {tab.count != null && tab.count > 0 && (
                      <span style={{
                        fontSize: 11, fontWeight: 600,
                        padding: '2px 8px', borderRadius: 999,
                        background: selected ? `hsl(${T.brand} / 0.12)` : `hsl(210 30% 92%)`,
                        color: selected ? `hsl(${T.brandDark})` : `hsl(${T.muted})`,
                      }}>
                        {tab.count} {tab.suffix}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Overview Tab — Practice */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            {/* Filter Bar — D9 chip style (band + topic) — visible when toggled or active */}
            {(showFilters || selectedBand || selectedTopic) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: `hsl(${T.fainter})`, fontWeight: 600, marginRight: 4 }}>
                Band
              </span>
              {bandLevels.map(band => {
                const active = selectedBand === band.id;
                return (
                  <button
                    key={band.id}
                    onClick={() => { setSelectedBand(active ? null : band.id); setSelectedTopic(null); }}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '7px 12px', borderRadius: 999,
                      background: active ? `hsl(${T.brand} / 0.10)` : `hsl(${T.surface})`,
                      border: `1px solid ${active ? `hsl(${T.brand} / 0.5)` : `hsl(${T.border})`}`,
                      fontSize: 13, fontWeight: 500,
                      color: active ? `hsl(${T.brandDark})` : `hsl(${T.muted})`,
                      cursor: 'pointer', transition: 'all 150ms',
                    }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: band.color }} />
                    {band.name}
                  </button>
                );
              })}

              <span style={{ width: 8 }} />
              <span style={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: `hsl(${T.fainter})`, fontWeight: 600, marginRight: 4 }}>
                Topic
              </span>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setTopicDropdownOpen((v) => !v)}
                  data-testid="topic-filter-btn"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '7px 12px', borderRadius: 999,
                    background: selectedTopic ? `hsl(${T.brand} / 0.10)` : `hsl(${T.surface})`,
                    border: `1px solid ${selectedTopic ? `hsl(${T.brand} / 0.5)` : `hsl(${T.border})`}`,
                    fontSize: 13, fontWeight: 500,
                    color: selectedTopic ? `hsl(${T.brandDark})` : `hsl(${T.muted})`,
                    cursor: 'pointer',
                  }}
                >
                  {selectedTopic ? (topics.find(t => t.id === selectedTopic)?.name || 'Topic') : 'All Topics'}
                  <Filter style={{ width: 12, height: 12 }} />
                </button>
                {topicDropdownOpen && (
                  <>
                    {/* outside-click backdrop */}
                    <div
                      onClick={() => setTopicDropdownOpen(false)}
                      style={{ position: 'fixed', inset: 0, zIndex: 49 }}
                    />
                    <div data-testid="topic-dropdown" style={{
                      position: 'absolute', top: '100%', left: 0, marginTop: 4,
                      width: 288, background: `hsl(${T.surface})`,
                      borderRadius: 12, border: `1px solid hsl(${T.border})`,
                      boxShadow: `0 12px 40px hsl(220 15% 20% / 0.12)`,
                      zIndex: 50, padding: '8px 0', maxHeight: 256, overflowY: 'auto',
                    }}>
                      <button
                        onClick={() => { setSelectedTopic(null); setTopicDropdownOpen(false); }}
                        style={{
                          width: '100%', padding: '6px 12px', textAlign: 'left',
                          fontSize: 12, fontWeight: selectedTopic ? 500 : 600,
                          color: selectedTopic ? `hsl(${T.muted})` : `hsl(${T.brandDark})`,
                          background: selectedTopic ? 'none' : `hsl(${T.brand} / 0.08)`,
                          border: 0, cursor: 'pointer',
                        }}
                      >
                        All Topics
                      </button>
                      <div style={{ borderTop: `1px solid hsl(${T.borderSoft})`, margin: '4px 0' }} />
                      {topics.length === 0 && (
                        <div style={{ padding: '8px 12px', fontSize: 12, color: `hsl(${T.fainter})` }}>
                          No topics for this band.
                        </div>
                      )}
                      {topics.map(topic => {
                        const isSel = selectedTopic === topic.id;
                        return (
                          <button
                            key={topic.id}
                            onClick={() => { setSelectedTopic(topic.id); setTopicDropdownOpen(false); }}
                            style={{
                              width: '100%', padding: '6px 12px', textAlign: 'left',
                              fontSize: 12, color: isSel ? `hsl(${T.brandDark})` : `hsl(${T.muted})`,
                              background: isSel ? `hsl(${T.brand} / 0.08)` : 'none',
                              fontWeight: isSel ? 600 : 400,
                              border: 0, cursor: 'pointer',
                              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            }}
                          >
                            <span style={{ marginRight: 6 }}>{topic.icon}</span>{topic.name}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {(selectedBand || selectedTopic) && (
                <button
                  onClick={() => { setSelectedBand(null); setSelectedTopic(null); }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    fontSize: 12, color: `hsl(${T.fainter})`,
                    background: 'none', border: 0, cursor: 'pointer',
                    marginLeft: 8,
                  }}
                >
                  <X style={{ width: 12, height: 12 }} /> Clear
                </button>
              )}
            </div>
            )}

            {/* Inline skill content — renders the same tiles/links the per-skill
                modal has (Academic + GT Task 1/2 for Writing, Part 1/2/3 for
                Speaking, band tiers + question types for Listening, Academic/
                General passages + question types for Reading). No floating
                overlay — content is shown directly below the tabs/filters. */}

            {/* WRITING inline */}
            {skillTab === 'writing' && (
              <Card className="p-6" data-testid="inline-skill-writing">
                <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <PenTool className="w-5 h-5 text-green-600" /> Writing Practice
                </h2>
                <p className="text-gray-500 mb-4">Which task would you like to practice?</p>

                <div className="space-y-3">
                  <div className="mb-2">
                    <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" /> Academic IELTS
                    </p>
                    <p className="text-xs text-gray-500 mb-3">Course-aligned topics with band filtering</p>
                  </div>

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

                  <div className="mt-6 mb-2 pt-4 border-t border-gray-200">
                    <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> General Training IELTS
                    </p>
                    <p className="text-xs text-gray-500 mb-3">Letter writing practice, independent of course topics</p>
                  </div>

                  <div className="mb-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                    <p className="text-xs text-purple-600">
                      General Training letter writing is independent of course topics. It includes 32 different letter scenarios (Formal, Semi-formal, Informal).
                    </p>
                  </div>

                  <Card
                    className="p-4 cursor-pointer hover:shadow-md transition-all border-2 hover:border-purple-300"
                    onClick={() => navigate('/question-bank/writing/general/task1')}
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

                  <Card
                    className="p-4 cursor-pointer hover:shadow-md transition-all border-2 hover:border-pink-300"
                    onClick={() => navigate('/question-bank/writing/general/task2')}
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
            )}

            {/* READING inline */}
            {skillTab === 'reading' && (
              <Card className="p-6" data-testid="inline-skill-reading">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900">Reading Practice</h2>
                </div>

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
                      { id: 'matching_information', name: 'Matching Info', icon: '🔗' },
                    ].map(qtype => (
                      <Button
                        key={qtype.id}
                        variant="outline"
                        size="sm"
                        className="justify-start text-xs hover:bg-amber-100 hover:border-amber-300"
                        onClick={() => navigate(`/question-bank/reading/practice?type=${qtype.id}`)}
                      >
                        <span className="mr-1">{qtype.icon}</span> {qtype.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-bold text-blue-700 mb-3 flex items-center gap-2">
                    <BookMarked className="w-4 h-4" /> ACADEMIC IELTS
                  </h4>
                  <Card
                    className="p-4 cursor-pointer hover:shadow-md transition-all border-2 hover:border-blue-300"
                    onClick={() => {
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

                <div className="mb-4">
                  <h4 className="text-sm font-bold text-purple-700 mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4" /> GENERAL TRAINING IELTS
                  </h4>
                  <Card
                    className="p-4 cursor-pointer hover:shadow-md transition-all border-2 hover:border-purple-300"
                    onClick={() => {
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

                <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <h4 className="text-sm font-bold text-green-700 mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4" /> MASTERY LEVEL (Band 6-7)
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <Card
                      className="p-3 cursor-pointer hover:shadow-md transition-all border hover:border-green-300"
                      onClick={() => {
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
              </Card>
            )}

            {/* LISTENING inline */}
            {skillTab === 'listening' && (
              <Card className="p-6" data-testid="inline-skill-listening">
                <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Headphones className="w-5 h-5 text-purple-600" /> Listening Practice
                </h2>
                <p className="text-gray-500 mb-4">Select your band level and start practicing</p>

                <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-100">
                  <p className="text-xs text-purple-600">
                    🎧 IELTS Listening has ONE track for both Academic and General Training.
                    Practice with audio recordings covering Parts 1-4.
                  </p>
                </div>

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
                  <p className="text-sm font-semibold text-gray-700 mb-2">Practice by Band Level:</p>
                  {[
                    { id: '4.0-5.0', name: 'Band 4.0-5.0', desc: 'Foundation - Simple conversations', color: 'green', parts: 'Part 1-2' },
                    { id: '5.5-6.5', name: 'Band 5.5-6.5', desc: 'Intermediate - Discussions & talks', color: 'blue', parts: 'Part 2-3' },
                    { id: '7.0-9.0', name: 'Band 7.0-9.0', desc: 'Advanced - Academic lectures', color: 'purple', parts: 'Part 3-4' },
                  ].map(band => (
                    <Card
                      key={band.id}
                      className={`p-4 cursor-pointer hover:shadow-md transition-all border-2 hover:border-${band.color}-300`}
                      onClick={() => {
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

                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Or practice by Question Type:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'multiple_choice', name: 'Multiple Choice', icon: '🔘' },
                        { id: 'form_completion', name: 'Form Completion', icon: '📝' },
                        { id: 'sentence_completion', name: 'Sentence Completion', icon: '✏️' },
                        { id: 'matching', name: 'Matching', icon: '🔗' },
                      ].map(qtype => (
                        <Button
                          key={qtype.id}
                          variant="outline"
                          size="sm"
                          className="justify-start text-xs hover:bg-purple-50 hover:border-purple-300"
                          onClick={() => navigate(`/question-bank/listening?question_type=${qtype.id}`)}
                        >
                          <span className="mr-1">{qtype.icon}</span> {qtype.name}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button
                    className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600"
                    onClick={() => navigate('/question-bank/listening')}
                  >
                    <Headphones className="w-4 h-4 mr-2" /> View All Listening Practice
                  </Button>
                </div>
              </Card>
            )}

            {/* SPEAKING inline */}
            {skillTab === 'speaking' && (
              <Card className="p-6" data-testid="inline-skill-speaking">
                <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Mic className="w-5 h-5 text-orange-600" /> Speaking Practice
                </h2>
                <p className="text-gray-500 mb-4">IELTS Speaking test practice with AI evaluation</p>

                <div className="mb-4 p-3 bg-orange-50 rounded-lg border border-orange-100">
                  <p className="text-xs text-orange-600">
                    🎙️ IELTS Speaking practice includes Part 1 (Interview), Part 2 (Cue Card), and Part 3 (Discussion).
                    Record your answers and get AI-powered evaluation.
                  </p>
                </div>

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
                  <p className="text-sm font-semibold text-gray-700 mb-2">Select IELTS Track:</p>

                  <Card
                    className="p-4 cursor-pointer hover:shadow-md transition-all border-2 hover:border-orange-300"
                    onClick={() => {
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

                  <Card
                    className="p-4 cursor-pointer hover:shadow-md transition-all border-2 hover:border-yellow-300"
                    onClick={() => {
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

                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Or select by Band Level:</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: '4.0-5.0', name: 'Band 4-5', color: 'green', desc: 'Shows text' },
                        { id: '5.5-6.5', name: 'Band 5.5-6.5', color: 'blue', desc: 'Audio only' },
                        { id: '7.0-9.0', name: 'Band 7-9', color: 'purple', desc: 'Advanced' },
                      ].map(band => (
                        <Button
                          key={band.id}
                          variant="outline"
                          size="sm"
                          className={`flex-col h-auto py-3 hover:bg-${band.color}-50 hover:border-${band.color}-300`}
                          onClick={() => {
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

                  <Button
                    className="w-full mt-4 bg-gradient-to-r from-orange-600 to-amber-600"
                    onClick={() => navigate('/question-bank/speaking')}
                  >
                    <Mic className="w-4 h-4 mr-2" /> View All Speaking Practice
                  </Button>
                </div>
              </Card>
            )}

            {/* ===== D9 Prompt grid (search/type/done filtered) ===== */}
            {filteredPrompts.length > 0 && (
              <div>
                <div style={{
                  fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase',
                  color: `hsl(${T.fainter})`, fontWeight: 600, marginBottom: 10,
                }}>
                  Prompts · {skillTab.charAt(0).toUpperCase() + skillTab.slice(1)}
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: 14,
                }}>
                  {filteredPrompts.slice(0, 20).map((prompt) => {
                    const SkillIcon = skillIcons[skillTab] || BookOpen;
                    const accent = {
                      writing: T.brand, speaking: T.rose,
                      reading: T.sky, listening: T.gold,
                    }[skillTab] || T.brand;
                    const done = !!(completionStats?.practice?.[skillTab] && completionStats.practice[skillTab] > 0);
                    if (hideDone && done) return null;
                    // Each prompt card IS an Advanced Mastery module (data
                    // source above); deep-link straight into that lesson's
                    // active-skill section.
                    const handlePromptClick = () => {
                      if (prompt.module_number) {
                        navigate(`/advanced-mastery?lesson=${prompt.module_number}&focus=${skillTab}`);
                        return;
                      }
                      openSkillModal(skillTab);
                    };
                    return (
                      <button
                        key={prompt.id}
                        onClick={handlePromptClick}
                        data-testid={`d9-prompt-${prompt.id}`}
                        style={{
                          background: `hsl(${T.surface})`,
                          border: `1px solid hsl(${T.border})`,
                          borderRadius: 16, padding: 18,
                          display: 'flex', flexDirection: 'column', gap: 12,
                          textAlign: 'left', cursor: 'pointer',
                          transition: 'all 180ms',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = `hsl(${accent} / 0.5)`;
                          e.currentTarget.style.boxShadow = '0 4px 16px hsl(220 15% 20% / 0.08)';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = `hsl(${T.border})`;
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.transform = 'none';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: 8,
                            background: `hsl(${accent} / 0.12)`,
                            display: 'grid', placeItems: 'center',
                          }}>
                            <SkillIcon style={{ width: 14, height: 14, color: `hsl(${accent})` }} />
                          </div>
                          <span style={{
                            padding: '3px 9px', borderRadius: 6,
                            background: `hsl(${accent} / 0.12)`, color: `hsl(${accent})`,
                            fontSize: 11, fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase',
                          }}>{skillTab}</span>
                          {typeFilter !== 'all' && (
                            <span style={{
                              padding: '3px 9px', borderRadius: 6,
                              background: `hsl(${T.borderSoft})`, color: `hsl(${T.muted})`,
                              fontSize: 11, fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase',
                            }}>{typeFilter}</span>
                          )}
                          {done && (
                            <span style={{
                              marginLeft: 'auto',
                              padding: '3px 8px', borderRadius: 999,
                              background: `hsl(${T.brand} / 0.12)`, color: `hsl(${T.brandDark})`,
                              fontSize: 11, fontWeight: 600,
                            }}>✓ Done</span>
                          )}
                        </div>
                        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 17, lineHeight: 1.35, fontWeight: 500, color: `hsl(${T.ink})` }}>
                          {prompt.icon ? `${prompt.icon} ` : ''}{prompt.name}
                        </div>
                        {prompt.description && (
                          <div style={{ fontSize: 13, color: `hsl(${T.muted})`, lineHeight: 1.4 }}>
                            {prompt.description}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
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
                        isSelected ? 'bg-emerald-600 hover:bg-emerald-700' : ''
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

        {/* Tests Tab — visible on Full Tests scene */}
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
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-xl text-gray-900">AI Practice Tests</h2>
                    <p className="text-sm text-gray-500">Full tests with AI feedback & real exam visuals</p>
                  </div>
                </div>

                <div className="space-y-5">
                  {/* Academic IELTS */}
                  <Card className="p-6 border-2 border-emerald-100 bg-gradient-to-br from-white to-emerald-50/30 rounded-2xl">
                    <div className="flex items-start justify-between mb-5">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-lg text-gray-900">Academic IELTS</h3>
                          <Badge className="bg-emerald-100 text-emerald-700 text-xs">8 Sets</Badge>
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
                          className="p-4 bg-white rounded-xl border-2 border-emerald-200 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group"
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
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                              <span className="font-bold text-emerald-700 text-lg">{set.label}</span>
                            </div>
                            <PlayCircle className="w-5 h-5 text-emerald-400 group-hover:text-emerald-600 transition-colors" />
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
                  <Card className="p-6 border-2 border-sky-100 bg-gradient-to-br from-white to-sky-50/30 rounded-2xl">
                    <div className="flex items-start justify-between mb-5">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-lg text-gray-900">General Training IELTS</h3>
                          <Badge className="bg-sky-100 text-sky-700 text-xs">4 Sets</Badge>
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
                          className="p-4 bg-white rounded-xl border-2 border-sky-200 hover:border-sky-400 hover:shadow-md transition-all cursor-pointer group"
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
                            <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center group-hover:bg-sky-200 transition-colors">
                              <span className="font-bold text-sky-700 text-lg">{set.label}</span>
                            </div>
                            <PlayCircle className="w-5 h-5 text-sky-400 group-hover:text-sky-600 transition-colors" />
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
              onClick={closeWritingModal}
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
                <Button variant="ghost" size="sm" onClick={closeReadingModal}>
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

              {/* Question Type Based Practice — single dropdown (Cathoven-style).
                  Pre-2026-05-09 this rendered a 6-card grid that grew unwieldy
                  once we surfaced all 8 official IELTS reading types; users
                  reported it as "confusing — everything visible at once". */}
              <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                <h4 className="text-sm font-bold text-amber-700 mb-3 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" /> PRACTICE BY QUESTION TYPE
                </h4>
                <p className="text-xs text-amber-600 mb-3">Pick a specific question type to drill</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={selectedReadingQType}
                    onChange={(e) => setSelectedReadingQType(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm rounded-lg border border-amber-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="">— Select a question type —</option>
                    {READING_QTYPES.map(q => (
                      <option key={q.id} value={q.id}>{q.name}</option>
                    ))}
                  </select>
                  <Button
                    size="sm"
                    disabled={!selectedReadingQType}
                    className="bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50"
                    onClick={() => {
                      setShowReadingModal(false);
                      navigate(`/question-bank/reading/practice?type=${selectedReadingQType}`);
                    }}
                  >
                    Start Practice
                  </Button>
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
              onClick={closeListeningModal}
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

              {/* Question Type Based Practice — Cathoven-style dropdown.
                  Replaces the 4-card grid; surfaces all 6 official listening
                  types instead of the prior subset. See parallel change in
                  the Reading modal block above. */}
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-semibold text-gray-700 mb-2">Or practice by Question Type:</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={selectedListeningQType}
                    onChange={(e) => setSelectedListeningQType(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm rounded-lg border border-purple-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    <option value="">— Select a question type —</option>
                    {LISTENING_QTYPES.map(q => (
                      <option key={q.id} value={q.id}>{q.name}</option>
                    ))}
                  </select>
                  <Button
                    size="sm"
                    disabled={!selectedListeningQType}
                    className="bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
                    onClick={() => {
                      setShowListeningModal(false);
                      navigate(`/question-bank/listening?question_type=${selectedListeningQType}`);
                    }}
                  >
                    Start Practice
                  </Button>
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
              onClick={closeSpeakingModal}
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
