import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  BookOpen,
  Headphones,
  PenTool,
  Mic,
  Search,
  Sparkles,
  Check,
  Clock,
  PlayCircle,
  X,
  Filter,
  ArrowLeft,
  Plus,
  Wand2,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// ============ STATIC PROMPT CATALOG ============
// NOTE: Until /api/question-bank/prompts lands, these are surfaced statically.
// Each entry uses the existing sub-route launchers for the actual session.
const WRITING_PROMPTS = [
  {
    id: 'w-custom',
    custom: true,
    type: 'Custom',
    body: "Writing your own essay from class or a textbook?",
    bodyEm: "Paste the prompt, we'll score it the same way.",
    route: '/question-bank/writing/task2?mode=custom',
  },
  {
    id: 'w-tech-friendship',
    type: 'Task 2',
    difficulty: 'medium',
    body: 'Some people think technology is making friendships weaker. To what extent do you agree?',
    minutes: 40,
    attempts: 1342,
    tags: ['technology', 'society'],
    route: '/question-bank/writing/task2?promptId=w-tech-friendship',
  },
  {
    id: 'w-electricity-bar',
    type: 'Task 1 Academic',
    difficulty: 'easy',
    body: 'The bar chart shows electricity consumption by four countries from 2000 to 2020. Summarise the main features.',
    minutes: 20,
    attempts: 894,
    tags: ['bar chart', 'energy'],
    route: '/question-bank/writing/task1?promptId=w-electricity-bar',
  },
  {
    id: 'w-env-vs-growth',
    type: 'Task 2',
    difficulty: 'hard',
    body: 'Governments should prioritise environmental protection over economic growth. Discuss both views and give your opinion.',
    minutes: 40,
    attempts: 2108,
    tags: ['environment', 'government'],
    route: '/question-bank/writing/task2?promptId=w-env-vs-growth',
  },
  {
    id: 'w-study-abroad',
    type: 'Task 2',
    difficulty: 'medium',
    body: 'Many people believe studying abroad has more drawbacks than advantages. Do you agree?',
    minutes: 40,
    attempts: 1670,
    tags: ['education', 'travel'],
    route: '/question-bank/writing/task2?promptId=w-study-abroad',
  },
  {
    id: 'w-invite-letter',
    type: 'Task 1 General',
    difficulty: 'easy',
    body: 'Write a letter to your friend inviting them to a family celebration and explaining what to expect.',
    minutes: 20,
    attempts: 512,
    tags: ['informal letter'],
    route: '/question-bank/writing/task1?promptId=w-invite-letter&variant=general',
  },
  {
    id: 'w-health-policy',
    type: 'Task 2',
    difficulty: 'hard',
    body: 'Some argue that the best way to improve public health is through government regulation, others say individual choice matters more.',
    minutes: 40,
    attempts: 1018,
    tags: ['health', 'policy'],
    route: '/question-bank/writing/task2?promptId=w-health-policy',
  },
  {
    id: 'w-recycling-process',
    type: 'Task 1 Academic',
    difficulty: 'medium',
    body: 'The diagram shows the process of recycling plastic bottles. Summarise the steps and key features.',
    minutes: 20,
    attempts: 740,
    tags: ['process', 'recycling'],
    route: '/question-bank/writing/task1?promptId=w-recycling-process',
  },
  {
    id: 'w-bikes-cities',
    type: 'Task 2',
    difficulty: 'medium',
    body: 'In many cities, bicycles are replacing cars as the main mode of transport. What are the causes, and is this a positive development?',
    minutes: 40,
    attempts: 860,
    tags: ['transport', 'cities'],
    route: '/question-bank/writing/task2?promptId=w-bikes-cities',
  },
];

const SPEAKING_PROMPTS = [
  {
    id: 's-custom',
    custom: true,
    type: 'Custom',
    body: 'Have a cue card from your class?',
    bodyEm: "Paste it and practise with Liz's live pronunciation feedback.",
    route: '/question-bank/speaking?mode=custom',
  },
  {
    id: 's-cooking',
    type: 'Part 1',
    difficulty: 'easy',
    body: 'Do you enjoy cooking? Why or why not?',
    minutes: 2,
    tags: ['daily life'],
    route: '/question-bank/speaking?part=1&promptId=s-cooking',
  },
  {
    id: 's-person',
    type: 'Part 2',
    difficulty: 'medium',
    body: 'Describe a person who has influenced you. Who they are, how you know them, what they did, and why they influenced you.',
    minutes: 2,
    tags: ['people'],
    route: '/question-bank/speaking?part=2&promptId=s-person',
  },
  {
    id: 's-teachers',
    type: 'Part 3',
    difficulty: 'hard',
    body: 'How has the role of teachers changed in modern society? Is technology replacing human educators?',
    tags: ['education', 'abstract'],
    route: '/question-bank/speaking?part=3&promptId=s-teachers',
  },
  {
    id: 's-place',
    type: 'Part 2',
    difficulty: 'medium',
    body: 'Describe a place you have visited that had a strong impression on you. Where it was, when you went, and what made it memorable.',
    minutes: 2,
    tags: ['places'],
    route: '/question-bank/speaking?part=2&promptId=s-place',
  },
  {
    id: 's-music',
    type: 'Part 1',
    difficulty: 'easy',
    body: 'What kind of music do you like? Has it changed over the years?',
    minutes: 2,
    tags: ['hobbies'],
    route: '/question-bank/speaking?part=1&promptId=s-music',
  },
];

// ============ SMALL SUBCOMPONENTS ============

function Tab({ label, count, active, soon, onClick, icon: Icon }) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`px-5 py-3 relative flex items-center gap-2.5 whitespace-nowrap transition ${
        active
          ? 'text-emerald-700 font-semibold'
          : 'text-gray-500 hover:text-gray-900'
      }`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {label}
      {count != null && (
        <span className="text-xs text-gray-500 font-normal">{count} prompts</span>
      )}
      {soon && (
        <span className="text-[10px] uppercase font-semibold tracking-wide px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
          Soon
        </span>
      )}
      {active && (
        <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-emerald-500 rounded-full" />
      )}
    </button>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
        active
          ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
          : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300'
      }`}
    >
      {children}
    </button>
  );
}

function PromptCard({ prompt, onStart }) {
  if (prompt.custom) {
    return (
      <Card className="p-5 flex flex-col gap-3 bg-gradient-to-br from-amber-50/60 to-emerald-50/40 border-dashed border-emerald-300">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] uppercase font-semibold tracking-wide bg-amber-100 text-amber-700">
            {prompt.type}
          </span>
          <span className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">Your own prompt</span>
        </div>
        <div className="font-serif text-[16px] leading-snug text-gray-900">
          {prompt.body} <span className="text-gray-500">{prompt.bodyEm}</span>
        </div>
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-dashed border-gray-200">
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">paid</span>
          <Button size="sm" onClick={onStart} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            Open custom mode →
          </Button>
        </div>
      </Card>
    );
  }

  const diffDot =
    prompt.difficulty === 'hard' ? 'bg-rose-500' :
    prompt.difficulty === 'medium' ? 'bg-amber-500' : 'bg-emerald-500';

  return (
    <Card className="p-5 flex flex-col gap-3 hover:shadow-md hover:border-emerald-300 transition hover:-translate-y-0.5">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-semibold tracking-wide bg-emerald-50 text-emerald-700">
          {prompt.type}
        </span>
        <span className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${diffDot}`} />
          {prompt.difficulty}
        </span>
      </div>
      <div className="font-serif text-[16px] leading-snug text-gray-900">{prompt.body}</div>
      <div className="flex items-center gap-3 text-xs text-gray-500 pt-2 border-t border-dashed border-gray-200">
        {prompt.minutes && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{prompt.minutes} min</span>}
        {prompt.attempts != null && <><span className="w-1 h-1 rounded-full bg-gray-300" /><span>{prompt.attempts.toLocaleString()} attempts</span></>}
        {prompt.done && <><span className="w-1 h-1 rounded-full bg-gray-300" /><span className="text-emerald-700 font-semibold">✓ Done · Band {prompt.done.band}</span></>}
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          {(prompt.tags || []).map((t) => (
            <span key={t} className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{t}</span>
          ))}
        </div>
        <Button size="sm" onClick={onStart} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          {prompt.done ? 'Retry →' : 'Start →'}
        </Button>
      </div>
    </Card>
  );
}

function FullTestCard({ test, onStart }) {
  const sections = test.sections || { L: null, R: null, W: null, S: null };
  return (
    <Card className="p-5 flex flex-col gap-3 relative hover:shadow-md hover:border-emerald-300 transition hover:-translate-y-0.5">
      {test.band && (
        <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold tracking-wider">
          {test.band.toFixed(1)}
        </span>
      )}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-serif text-[13px] font-semibold text-gray-600 tracking-wide">{test.book}</span>
        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold tracking-wide ${
          test.module === 'general' ? 'bg-amber-50 text-amber-700' : 'bg-sky-50 text-sky-700'
        }`}>
          {test.module === 'general' ? 'General' : 'Academic'}
        </span>
      </div>
      <h4 className="font-serif text-[18px] font-semibold text-gray-900">{test.title}</h4>
      <div className="flex flex-wrap gap-1.5">
        {['L','R','W','S'].map((s) => {
          const st = sections[s];
          const base = 'px-2 py-0.5 rounded text-[11px] font-medium';
          const cls =
            st === 'done' ? `${base} bg-emerald-100 text-emerald-800 font-semibold` :
            st === 'in-progress' ? `${base} bg-amber-100 text-amber-800 font-semibold` :
            `${base} bg-gray-100 text-gray-500`;
          return <span key={s} className={cls}>{st === 'done' ? '✓ ' : ''}{s}</span>;
        })}
      </div>
      <div className="flex items-center gap-3 text-xs text-gray-500 pt-2 mt-auto border-t border-dashed border-gray-200">
        <span>{test.meta || '2h 45min · exam-timed'}</span>
        {test.attempts != null && <><span className="w-1 h-1 rounded-full bg-gray-300" /><span>{test.attempts.toLocaleString()} attempts</span></>}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {(test.tags || []).map((t) => (
            <span key={t} className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{t}</span>
          ))}
        </div>
        <Button
          size="sm"
          onClick={onStart}
          className={
            test.status === 'in-progress'
              ? 'bg-amber-500 hover:bg-amber-600 text-white'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }
        >
          {test.status === 'done' ? 'Review →' : test.status === 'in-progress' ? 'Resume →' : 'Start →'}
        </Button>
      </div>
    </Card>
  );
}

// ============ MAIN COMPONENT ============

export default function QuestionBank({ user }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('writing'); // writing | speaking | fulltests
  const [loading, setLoading] = useState(true);

  // Filter state (per tab)
  const [writingTypeFilter, setWritingTypeFilter] = useState('all'); // all | task1-academic | task1-general | task2
  const [bandFilter, setBandFilter] = useState('all'); // all | 5 | 6-7 | 7.5+
  const [doneFilter, setDoneFilter] = useState('all'); // all | new | reviewed
  const [speakingPartFilter, setSpeakingPartFilter] = useState('all');
  const [fullTestModule, setFullTestModule] = useState('all');
  const [fullTestStatus, setFullTestStatus] = useState('all');
  const [searchQ, setSearchQ] = useState('');

  // Liz's pick
  const [lizPick, setLizPick] = useState(null); // { prompt, reason } | null

  // Cambridge + AI full tests
  const [cambridgeTests, setCambridgeTests] = useState([]);
  const [aiTests, setAiTests] = useState([]);
  const [generatingAi, setGeneratingAi] = useState(false);

  // Waitlist modal
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [waitlistKind, setWaitlistKind] = useState('reading');
  const [waitlistEmail, setWaitlistEmail] = useState(user?.email || '');

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-open Cambridge test if redirected with ?openTest=ielts19_test1
  useEffect(() => {
    const openTest = searchParams.get('openTest');
    if (openTest) {
      const [book, test] = openTest.split('_');
      if (book && test) {
        navigate(`/cambridge-test/${book}/${test}`);
        searchParams.delete('openTest');
        setSearchParams(searchParams, { replace: true });
      }
    }
  }, [searchParams, setSearchParams, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [testsRes, cambridgeRes] = await Promise.all([
        fetch(`${API_URL}/api/full-test/sets`).catch(() => null),
        fetch(`${API_URL}/api/cambridge/books`).catch(() => null),
      ]);

      // AI-generated full tests from /api/full-test/sets (academic + general)
      if (testsRes?.ok) {
        const data = await testsRes.json();
        const ai = [
          ...(data.academic_sets || []).map((t, i) => ({
            id: t.test_id || `ai-ac-${i}`,
            source: 'ai',
            book: `Liz · AI #${String(i + 1).padStart(2, '0')}`,
            title: t.title || t.name || `Academic set ${i + 1}`,
            module: 'academic',
            sections: { L: null, R: null, W: null, S: null },
            meta: '2h 45min · AI-generated',
            attempts: t.attempts_count,
            testRaw: t,
          })),
          ...(data.general_sets || []).map((t, i) => ({
            id: t.test_id || `ai-gt-${i}`,
            source: 'ai',
            book: `Liz · AI #${String(i + 1).padStart(2, '0')}`,
            title: t.title || t.name || `General set ${i + 1}`,
            module: 'general',
            sections: { L: null, R: null, W: null, S: null },
            meta: '2h 45min · AI-generated',
            attempts: t.attempts_count,
            testRaw: t,
          })),
        ];
        setAiTests(ai);
      }

      // Cambridge
      if (cambridgeRes?.ok) {
        const data = await cambridgeRes.json();
        const books = data.books || [];
        const flat = [];
        books.forEach((book) => {
          (book.tests || []).forEach((t) => {
            flat.push({
              id: `${book.book_id}_${t.test_id}`,
              source: 'cambridge',
              book: `Cambridge ${book.number || book.book_id}`,
              title: t.title || `Test ${t.test_number || t.test_id}`,
              module: t.module || 'academic',
              sections: { L: null, R: null, W: null, S: null },
              meta: '2h 45min · exam-timed',
              attempts: t.attempts_count,
              bookId: book.book_id,
              testId: t.test_id,
            });
          });
        });
        setCambridgeTests(flat);
      }

      // Liz's pick — best-effort, optional endpoint
      if (user?.id) {
        try {
          const res = await fetch(`${API_URL}/api/question-bank/liz-pick/${user.id}`);
          if (res.ok) {
            const data = await res.json();
            if (data?.prompt_id) {
              const found = [...WRITING_PROMPTS, ...SPEAKING_PROMPTS].find((p) => p.id === data.prompt_id);
              if (found) setLizPick({ prompt: found, reason: data.reason });
            }
          }
        } catch (_) { /* no pick yet */ }
      }
    } catch (err) {
      console.error('Failed to load question bank:', err);
      toast.error('Could not load question bank — showing defaults');
    } finally {
      setLoading(false);
    }
  };

  // ============ NAVIGATION ============
  const startPrompt = (prompt) => {
    navigate(prompt.route);
  };

  const startFullTest = async (test) => {
    if (test.source === 'cambridge') {
      navigate(`/cambridge-test/${test.bookId}/${test.testId}`);
      return;
    }
    // AI full test
    try {
      const res = await fetch(`${API_URL}/api/full-test/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test_id: test.id, mode: 'full' }),
      });
      const data = await res.json();
      if (data.success) {
        navigate(`/full-test/take/${test.id}?session=${data.session.session_id}&mode=full`);
      } else {
        toast.error(data.message || 'Could not start test');
      }
    } catch (err) {
      toast.error('Failed to start test');
    }
  };

  const generateAiTest = async () => {
    setGeneratingAi(true);
    try {
      const res = await fetch(`${API_URL}/api/full-tests/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user?.id }),
      });
      if (res.ok) {
        toast.success('New AI test generated');
        loadData();
      } else if (res.status === 402) {
        toast.info('Paid feature — upgrade to generate AI tests');
      } else {
        toast.info('AI generation coming soon');
      }
    } catch (_) {
      toast.info('AI generation coming soon');
    } finally {
      setGeneratingAi(false);
    }
  };

  // ============ FILTERING ============
  const filteredWriting = useMemo(() => {
    return WRITING_PROMPTS.filter((p) => {
      if (p.custom) return true; // always show custom card
      if (writingTypeFilter !== 'all') {
        const match =
          (writingTypeFilter === 'task2' && p.type === 'Task 2') ||
          (writingTypeFilter === 'task1-academic' && p.type === 'Task 1 Academic') ||
          (writingTypeFilter === 'task1-general' && p.type === 'Task 1 General');
        if (!match) return false;
      }
      if (searchQ) {
        const q = searchQ.toLowerCase();
        if (!(p.body.toLowerCase().includes(q) || (p.tags || []).some((t) => t.includes(q)))) return false;
      }
      if (doneFilter === 'new' && p.done) return false;
      if (doneFilter === 'reviewed' && !p.done) return false;
      return true;
    });
  }, [writingTypeFilter, doneFilter, searchQ]);

  const filteredSpeaking = useMemo(() => {
    return SPEAKING_PROMPTS.filter((p) => {
      if (p.custom) return true;
      if (speakingPartFilter !== 'all' && p.type !== `Part ${speakingPartFilter}`) return false;
      if (searchQ) {
        const q = searchQ.toLowerCase();
        if (!(p.body.toLowerCase().includes(q) || (p.tags || []).some((t) => t.includes(q)))) return false;
      }
      return true;
    });
  }, [speakingPartFilter, searchQ]);

  const filteredFullTests = (list) =>
    list.filter((t) => {
      if (fullTestModule !== 'all' && t.module !== fullTestModule) return false;
      if (fullTestStatus === 'not-started' && t.status) return false;
      if (fullTestStatus === 'in-progress' && t.status !== 'in-progress') return false;
      if (fullTestStatus === 'completed' && t.status !== 'done') return false;
      return true;
    });

  const openWaitlist = (kind) => {
    setWaitlistKind(kind);
    setWaitlistOpen(true);
  };

  const submitWaitlist = async () => {
    if (!waitlistEmail) return toast.error('Email required');
    try {
      await fetch(`${API_URL}/api/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: waitlistEmail, kind: waitlistKind }),
      }).catch(() => null);
      toast.success(`You're on the ${waitlistKind} waitlist.`);
      setWaitlistOpen(false);
    } catch (_) {
      toast.success(`You're on the ${waitlistKind} waitlist.`);
      setWaitlistOpen(false);
    }
  };

  // ============ RENDER ============
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-sky-500" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">IELTS Ace</h1>
              <p className="text-[11px] text-gray-500 -mt-1">by testmaster.pro</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page head */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-5">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-emerald-700">Practice</div>
            <h2 className="text-4xl font-bold text-gray-900 mt-1">Question Bank</h2>
            <p className="text-gray-600 mt-2 max-w-xl">
              Hand-picked IELTS prompts with instant Liz feedback. Filter by topic, difficulty, or band level.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-gray-200 shadow-sm min-w-[280px]">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Search topics, keywords…"
              className="border-0 outline-none bg-transparent text-sm flex-1"
            />
          </div>
        </div>

        {/* Liz's pick */}
        {lizPick && (
          <div className="mb-5 flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-sky-50 border border-emerald-200">
            <div className="w-12 h-12 flex-shrink-0 rounded-full bg-gradient-to-br from-emerald-500 to-sky-500 grid place-items-center text-white font-serif text-lg font-bold shadow-md">
              L
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">Liz's pick for you</div>
              <h3 className="font-serif text-lg text-gray-900 mt-0.5">"{lizPick.prompt.body}"</h3>
              {lizPick.reason && <p className="text-sm text-gray-600 mt-0.5">{lizPick.reason}</p>}
            </div>
            <Button onClick={() => startPrompt(lizPick.prompt)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Start now →
            </Button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 mb-6 overflow-x-auto">
          <Tab label="Writing" icon={PenTool} count={WRITING_PROMPTS.filter(p=>!p.custom).length} active={activeTab === 'writing'} onClick={() => setActiveTab('writing')} />
          <Tab label="Speaking" icon={Mic} count={SPEAKING_PROMPTS.filter(p=>!p.custom).length} active={activeTab === 'speaking'} onClick={() => setActiveTab('speaking')} />
          <Tab label="Full Tests" icon={Sparkles} active={activeTab === 'fulltests'} onClick={() => setActiveTab('fulltests')} />
          <Tab label="Reading" icon={BookOpen} soon active={false} onClick={() => openWaitlist('reading')} />
          <Tab label="Listening" icon={Headphones} soon active={false} onClick={() => openWaitlist('listening')} />
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading…
          </div>
        )}

        {/* === WRITING === */}
        {!loading && activeTab === 'writing' && (
          <>
            <div className="flex flex-wrap gap-2 items-center mb-5">
              <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mr-1">Type</span>
              <Chip active={writingTypeFilter === 'all'} onClick={() => setWritingTypeFilter('all')}>All</Chip>
              <Chip active={writingTypeFilter === 'task1-academic'} onClick={() => setWritingTypeFilter('task1-academic')}>Task 1 Academic</Chip>
              <Chip active={writingTypeFilter === 'task1-general'} onClick={() => setWritingTypeFilter('task1-general')}>Task 1 General</Chip>
              <Chip active={writingTypeFilter === 'task2'} onClick={() => setWritingTypeFilter('task2')}>Task 2</Chip>
              <span className="w-3" />
              <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mr-1">Band</span>
              <Chip active={bandFilter === '5'} onClick={() => setBandFilter(bandFilter === '5' ? 'all' : '5')}>5.0</Chip>
              <Chip active={bandFilter === '6-7'} onClick={() => setBandFilter(bandFilter === '6-7' ? 'all' : '6-7')}>6.0–7.0</Chip>
              <Chip active={bandFilter === '7.5+'} onClick={() => setBandFilter(bandFilter === '7.5+' ? 'all' : '7.5+')}>7.5+</Chip>
              <span className="w-3" />
              <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mr-1">Done</span>
              <Chip active={doneFilter === 'new'} onClick={() => setDoneFilter(doneFilter === 'new' ? 'all' : 'new')}>New only</Chip>
              <Chip active={doneFilter === 'reviewed'} onClick={() => setDoneFilter(doneFilter === 'reviewed' ? 'all' : 'reviewed')}>Reviewed</Chip>
            </div>
            <div className="grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {filteredWriting.map((p) => (
                <PromptCard key={p.id} prompt={p} onStart={() => startPrompt(p)} />
              ))}
            </div>
            {/* Reading/Listening waitlist inline section */}
            <section className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="font-serif text-xl font-semibold text-gray-900 mb-1">Reading & Listening — coming soon</h3>
              <p className="text-sm text-gray-500 mb-5">We're building Reading and Listening modules next. Join the waitlist and we'll email you.</p>
              <div className="grid md:grid-cols-2 gap-3.5 max-w-2xl">
                {['reading', 'listening'].map((kind) => (
                  <div key={kind} className="p-5 rounded-xl bg-white/70 border border-dashed border-gray-300 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-gray-100 grid place-items-center font-serif font-bold text-gray-500">
                      {kind === 'reading' ? 'R' : 'L'}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 capitalize">{kind}</h4>
                      <p className="text-xs text-gray-500">
                        {kind === 'reading' ? 'Academic & General · passages with Liz review' : 'Section 1–4 · British, Australian, American accents'}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => openWaitlist(kind)}>Notify me</Button>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* === SPEAKING === */}
        {!loading && activeTab === 'speaking' && (
          <>
            <div className="flex flex-wrap gap-2 items-center mb-5">
              <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mr-1">Part</span>
              <Chip active={speakingPartFilter === 'all'} onClick={() => setSpeakingPartFilter('all')}>All</Chip>
              <Chip active={speakingPartFilter === '1'} onClick={() => setSpeakingPartFilter('1')}>Part 1</Chip>
              <Chip active={speakingPartFilter === '2'} onClick={() => setSpeakingPartFilter('2')}>Part 2</Chip>
              <Chip active={speakingPartFilter === '3'} onClick={() => setSpeakingPartFilter('3')}>Part 3</Chip>
            </div>
            <div className="grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {filteredSpeaking.map((p) => (
                <PromptCard key={p.id} prompt={p} onStart={() => startPrompt(p)} />
              ))}
            </div>
          </>
        )}

        {/* === FULL TESTS === */}
        {!loading && activeTab === 'fulltests' && (
          <>
            <div className="flex flex-wrap gap-2 items-center mb-5">
              <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mr-1">Module</span>
              <Chip active={fullTestModule === 'all'} onClick={() => setFullTestModule('all')}>All</Chip>
              <Chip active={fullTestModule === 'academic'} onClick={() => setFullTestModule('academic')}>Academic</Chip>
              <Chip active={fullTestModule === 'general'} onClick={() => setFullTestModule('general')}>General Training</Chip>
              <span className="w-3" />
              <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mr-1">Status</span>
              <Chip active={fullTestStatus === 'not-started'} onClick={() => setFullTestStatus(fullTestStatus === 'not-started' ? 'all' : 'not-started')}>Not started</Chip>
              <Chip active={fullTestStatus === 'in-progress'} onClick={() => setFullTestStatus(fullTestStatus === 'in-progress' ? 'all' : 'in-progress')}>In progress</Chip>
              <Chip active={fullTestStatus === 'completed'} onClick={() => setFullTestStatus(fullTestStatus === 'completed' ? 'all' : 'completed')}>Completed</Chip>
            </div>

            {/* Cambridge section */}
            <section className="mb-10">
              <div className="flex items-end justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-semibold tracking-wide bg-sky-50 text-sky-700">Official</span>
                    <h3 className="font-serif text-xl font-semibold text-gray-900">Cambridge IELTS Tests</h3>
                  </div>
                  <p className="text-sm text-gray-600">Real past papers — Cambridge books. All four sections, exam-timed, scored against official band descriptors.</p>
                </div>
                <span className="text-xs text-gray-500">{cambridgeTests.length} full tests</span>
              </div>
              {cambridgeTests.length === 0 ? (
                <p className="text-gray-500 text-sm">No Cambridge tests loaded.</p>
              ) : (
                <div className="grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
                  {filteredFullTests(cambridgeTests).map((t) => (
                    <FullTestCard key={t.id} test={t} onStart={() => startFullTest(t)} />
                  ))}
                </div>
              )}
            </section>

            {/* AI section */}
            <section>
              <div className="flex items-end justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-semibold tracking-wide bg-emerald-50 text-emerald-700">AI-generated</span>
                    <h3 className="font-serif text-xl font-semibold text-gray-900">AI Full Tests</h3>
                  </div>
                  <p className="text-sm text-gray-600">Fresh tests generated by Liz. Same structure, format, and timing as Cambridge — infinite variety tuned to your weak spots.</p>
                </div>
                <Button onClick={generateAiTest} disabled={generatingAi} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  {generatingAi ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Plus className="w-4 h-4 mr-1" />}
                  Generate new
                </Button>
              </div>
              {user && (
                <div className="flex items-center gap-3 p-4 mb-4 rounded-xl bg-gradient-to-r from-emerald-50 to-sky-50 border border-dashed border-emerald-200">
                  <div className="w-9 h-9 flex-shrink-0 rounded-full bg-gradient-to-br from-emerald-500 to-sky-500 grid place-items-center text-white font-serif font-bold text-sm">L</div>
                  <p className="text-sm text-gray-700">
                    Your next AI test focuses on <b className="text-emerald-700">Writing Task 2 argument essays</b> and <b className="text-emerald-700">Reading matching headings</b>.
                  </p>
                </div>
              )}
              {aiTests.length === 0 ? (
                <div className="p-8 rounded-xl bg-white border border-dashed border-gray-300 text-center">
                  <Wand2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                  <h4 className="font-semibold text-gray-900 mb-1">No AI tests yet</h4>
                  <p className="text-sm text-gray-500 mb-3">Generate your first one — Liz tunes it to your current weak spots.</p>
                  <Button onClick={generateAiTest} disabled={generatingAi} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    {generatingAi ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Plus className="w-4 h-4 mr-1" />}
                    Generate
                  </Button>
                </div>
              ) : (
                <div className="grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
                  {filteredFullTests(aiTests).map((t) => (
                    <FullTestCard key={t.id} test={t} onStart={() => startFullTest(t)} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {/* Waitlist modal */}
      {waitlistOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm grid place-items-center p-4"
          onClick={() => setWaitlistOpen(false)}
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setWaitlistOpen(false)}
              className="absolute top-3 right-3 w-8 h-8 grid place-items-center rounded-full hover:bg-gray-100"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
            <h3 className="font-serif text-xl font-semibold text-gray-900 mb-1 capitalize">{waitlistKind} — coming soon</h3>
            <p className="text-gray-500 text-sm mb-4">We'll email you the day it opens. No spam, unsubscribe anytime.</p>
            <input
              type="email"
              value={waitlistEmail}
              onChange={(e) => setWaitlistEmail(e.target.value)}
              placeholder="you@email.com"
              className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 mb-3"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setWaitlistOpen(false)}>Later</Button>
              <Button onClick={submitWaitlist} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Notify me
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
