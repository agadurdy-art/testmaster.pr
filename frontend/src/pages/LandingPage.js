import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { 
  BookOpen, Headphones, Mic, PenTool, CheckCircle, Target, Trophy,
  Sparkles, GraduationCap, Award, ArrowRight, Star, Users, Zap, Play, AlertTriangle,
  Brain, ShieldCheck, TrendingUp, XCircle, ChevronRight, Eye, MessageSquare,
  BarChart3, Lightbulb, Clock, FileText
} from 'lucide-react';
import { registerUser, loginUser } from '../lib/api';
import { toast } from 'sonner';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useI18n } from '../lib/i18n';

export default function LandingPage({ onLogin, user }) {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('signup');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [processingSocial, setProcessingSocial] = useState(false);
  
  const handleStartFreePractice = () => {
    navigate('/level-test');
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (authMode === 'signup') {
        const { name, email, password } = formData;
        await registerUser({ name, email, password });
        toast.success('Account created! Please check your email to verify your account.');
        setAuthMode('signin');
      } else {
        const { email, password } = formData;
        const userData = await loginUser({ email, password });
        onLogin(userData);
        toast.success('Welcome back!');
        navigate('/dashboard');
      }
    } catch (error) {
      const message = error?.response?.data?.detail || 'Authentication failed. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-violet-50/20 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-200">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">IELTS Ace</h1>
              <p className="text-xs text-gray-500">Cambridge-Aligned AI</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher compact />
            <Button variant="ghost" className="text-gray-600 hover:text-violet-600 hidden sm:flex" onClick={() => { setAuthMode('signin'); setShowAuth(true); }}>
              Sign In
            </Button>
            <Button data-testid="get-started-btn" onClick={() => setShowAuth(true)} className="bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white shadow-lg shadow-purple-200 border-0">
              {t('getStarted')}
            </Button>
          </div>
        </div>
      </header>

      {/* HERO SECTION - Philosophy First */}
      <section className="pt-20 pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 text-violet-700 text-sm font-medium mb-8">
              <Brain className="w-4 h-4" />
              <span>AI Trained Like a Real Cambridge Examiner</span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
              Prepare for IELTS with an AI that
              <span className="block mt-2 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                thinks like a real examiner
              </span>
            </h2>
            
            <p className="text-xl text-gray-600 mb-4 leading-relaxed max-w-3xl mx-auto">
              Not just scores. <span className="font-semibold text-gray-800">Real examiner-style evaluation</span>, 
              honest feedback, and a clear path to improvement.
            </p>
            
            <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto">
              Most platforms only tell you what band you got. We explain <span className="text-violet-600 font-medium">why</span> you received that band, 
              what stopped you from scoring higher, and exactly what to study next.
            </p>

            <div className="flex flex-wrap gap-4 justify-center mb-12">
              <Button 
                data-testid="start-practicing-btn"
                onClick={handleStartFreePractice} 
                size="lg" 
                className="bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white px-8 py-6 text-lg shadow-xl shadow-purple-200 border-0"
              >
                Start Free Level Check
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                variant="outline"
                size="lg" 
                onClick={() => navigate('/speaking-practice')}
                className="px-8 py-6 text-lg border-2 border-violet-200 text-violet-700 hover:bg-violet-50"
              >
                <Mic className="w-5 h-5 mr-2" />
                Try AI Speaking Examiner
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US - Core Differentiation */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why learners choose IELTS Ace
            </h2>
            <p className="text-lg text-gray-500">What makes our AI different from generic scoring tools</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Brain,
                title: 'Examiner-based AI',
                desc: 'Our AI is trained with official IELTS band descriptors and examiner logic — not generic scoring patterns.',
                color: 'bg-violet-500',
                lightBg: 'bg-violet-50'
              },
              {
                icon: ShieldCheck,
                title: 'No Band Inflation',
                desc: 'Fluent but irrelevant answers are capped. Just like the real IELTS exam.',
                color: 'bg-red-500',
                lightBg: 'bg-red-50'
              },
              {
                icon: Lightbulb,
                title: 'Teaching, Not Just Testing',
                desc: "We don't stop at scores. We explain decisions and guide your next steps.",
                color: 'bg-amber-500',
                lightBg: 'bg-amber-50'
              },
              {
                icon: TrendingUp,
                title: 'Personal Learning Path',
                desc: 'Every result leads to targeted practice based on your specific weaknesses.',
                color: 'bg-emerald-500',
                lightBg: 'bg-emerald-50'
              }
            ].map((feature, idx) => (
              <Card key={idx} className={`p-6 ${feature.lightBg} border-0 rounded-2xl hover:shadow-lg transition-all duration-300`}>
                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* THE METHODOLOGY - Test → Diagnose → Study → Retry */}
      <section className="py-20 px-6 bg-gradient-to-r from-violet-600 to-purple-700">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Our Learning Methodology
            </h2>
            <p className="text-lg text-violet-100">A proven cycle that builds real IELTS skills, not false confidence</p>
          </div>

          {/* Methodology Flow */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                step: '1', 
                title: 'TEST', 
                icon: FileText,
                desc: 'Take a real exam-style test under timed conditions',
                color: 'bg-blue-500'
              },
              { 
                step: '2', 
                title: 'DIAGNOSE', 
                icon: Brain,
                desc: 'AI identifies your exact weaknesses and limiting factors',
                color: 'bg-amber-500'
              },
              { 
                step: '3', 
                title: 'STUDY', 
                icon: BookOpen,
                desc: 'Learn targeted lessons designed to fix your specific gaps',
                color: 'bg-emerald-500'
              },
              { 
                step: '4', 
                title: 'RETRY', 
                icon: TrendingUp,
                desc: 'Practice again with focused improvement until you master it',
                color: 'bg-pink-500'
              }
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <Card className="p-6 bg-white/10 backdrop-blur border border-white/20 rounded-2xl text-center h-full">
                  <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-xs font-bold text-violet-200 mb-1">STEP {item.step}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-violet-100 text-sm">{item.desc}</p>
                </Card>
                {idx < 3 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ChevronRight className="w-6 h-6 text-white/50" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Loop indicator */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-violet-100">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Repeat until you reach your target band</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3-WAY COMPARISON - Traditional vs Other AI vs IELTS Ace */}
      <section className="py-20 px-6 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Compare the Methods
            </h2>
            <p className="text-lg text-gray-400">Traditional classes, Generic AI, and Cambridge-trained AI</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Traditional Methods */}
            <Card className="p-6 bg-gray-800 border border-gray-700 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                  <Users className="w-5 h-5 text-gray-300" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Traditional Classes</h3>
                  <span className="text-xs text-gray-400">Books & Teachers</span>
                </div>
              </div>
              <ul className="space-y-3 mb-6">
                {[
                  { text: 'Limited practice time', bad: true },
                  { text: 'Expensive private tutors', bad: true },
                  { text: 'Generic group feedback', bad: true },
                  { text: 'Fixed schedule required', bad: true },
                  { text: 'No instant evaluation', bad: true }
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-300 text-sm">
                    <XCircle className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-4 border-t border-gray-700">
                <p className="text-gray-400 text-xs">Best for: Learners who need in-person motivation</p>
              </div>
            </Card>

            {/* Other AI Platforms */}
            <Card className="p-6 bg-gray-800 border border-gray-700 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Other AI Platforms</h3>
                  <span className="text-xs text-gray-400">Generic AI Scoring</span>
                </div>
              </div>
              <ul className="space-y-3 mb-6">
                {[
                  { text: 'Instant feedback', good: true },
                  { text: 'Inflated scores for engagement', bad: true },
                  { text: 'Generic encouraging comments', bad: true },
                  { text: 'No examiner logic', bad: true },
                  { text: 'No clear improvement path', bad: true }
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-300 text-sm">
                    {item.good ? (
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                    )}
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-4 border-t border-gray-700">
                <p className="text-gray-400 text-xs">Best for: Quick practice without accuracy</p>
              </div>
            </Card>

            {/* IELTS Ace */}
            <Card className="p-6 bg-gradient-to-br from-violet-600/20 to-purple-600/20 border-2 border-violet-500 rounded-2xl relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="px-3 py-1 bg-violet-500 text-white text-xs font-bold rounded-full">RECOMMENDED</span>
              </div>
              <div className="flex items-center gap-3 mb-6 mt-2">
                <div className="w-10 h-10 rounded-full bg-violet-500 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">IELTS Ace</h3>
                  <span className="text-xs text-violet-300">Cambridge-Trained AI</span>
                </div>
              </div>
              <ul className="space-y-3 mb-6">
                {[
                  'Real examiner evaluation logic',
                  'Honest band scores (no inflation)',
                  'Explains WHY you got each band',
                  'Diagnoses your exact weaknesses',
                  'Test → Study → Retry pathway'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-white text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-4 border-t border-violet-500/30">
                <p className="text-violet-200 text-xs">Best for: Serious learners who want real improvement</p>
              </div>
            </Card>
          </div>

          {/* Quote */}
          <div className="mt-12 text-center">
            <p className="text-xl text-gray-300 italic">
              "We don't train you to sound fluent.<br/>
              <span className="text-white font-semibold">We train you to think, respond, and perform like an IELTS candidate.</span>"
            </p>
          </div>
        </div>
      </section>

      {/* PRACTICAL COURSES - Real-Life Application */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Practical Learning
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Learn Skills You'll Actually Use
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Every lesson is designed for real-world application. After each module, you'll have skills you can use immediately — in exams and in life.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: MessageSquare,
                title: 'Speaking Confidence',
                desc: 'Learn how to express complex ideas clearly. Use these skills in job interviews, presentations, and daily conversations.',
                example: 'Part 3: Discuss abstract topics with examiner-level fluency'
              },
              {
                icon: PenTool,
                title: 'Academic Writing',
                desc: 'Master essay structure and argumentation. Apply these skills in university assignments, reports, and professional emails.',
                example: 'Task 2: Build arguments that persuade and inform'
              },
              {
                icon: BookOpen,
                title: 'Critical Reading',
                desc: 'Develop skimming, scanning, and inference skills. Use them to quickly understand contracts, articles, and research papers.',
                example: 'Passage analysis: Extract key information efficiently'
              },
              {
                icon: Headphones,
                title: 'Active Listening',
                desc: 'Train your ear for different accents and speeds. Apply in meetings, lectures, and international communication.',
                example: 'Section 4: Academic lecture comprehension'
              },
              {
                icon: Brain,
                title: 'Vocabulary Mastery',
                desc: 'Learn topic-specific vocabulary with real usage. Use sophisticated language naturally in any context.',
                example: 'Collocations and synonyms for precise expression'
              },
              {
                icon: Target,
                title: 'Time Management',
                desc: 'Practice under timed conditions. Develop skills to work efficiently under pressure in any situation.',
                example: 'Complete tasks within strict time limits'
              }
            ].map((item, idx) => (
              <Card key={idx} className="p-6 bg-gray-50 border-0 rounded-2xl hover:bg-white hover:shadow-lg transition-all">
                <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center mb-4 shadow-lg">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{item.desc}</p>
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <p className="text-emerald-700 text-xs font-medium">📚 {item.example}</p>
                </div>
              </Card>
            ))}
          </div>

          {/* Course Value Highlight */}
          <div className="mt-12 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
                  <Award className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Guaranteed Real-World Application</h3>
                  <p className="text-gray-600">Each lesson ends with a practical exercise you can apply immediately. No theoretical knowledge that sits unused.</p>
                </div>
              </div>
              <Button onClick={() => setShowAuth(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white whitespace-nowrap">
                Start Learning <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* HOW OUR AI WORKS - Trust Section */}
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-gray-300">
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* IELTS Ace */}
            <Card className="p-8 bg-gradient-to-br from-violet-500/20 to-purple-500/20 backdrop-blur border border-violet-400/30 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white">IELTS Ace</h3>
              </div>
              <ul className="space-y-4">
                {[
                  'Explains band decisions with examiner logic',
                  'Diagnoses your key weaknesses precisely',
                  'Connects tests directly to study materials',
                  'Applies strict Cambridge band caps',
                  'Builds long-term improvement, not false confidence'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-white">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Quote */}
          <div className="mt-12 text-center">
            <p className="text-xl text-violet-200 italic">
              "We don't train you to sound fluent.<br/>
              <span className="text-white font-semibold">We train you to perform like an IELTS candidate.</span>"
            </p>
          </div>
        </div>
      </section>

      {/* HOW OUR AI WORKS - Trust Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-sm font-medium mb-6">
                <Eye className="w-4 h-4" />
                How Real Examiners Think
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Our AI evaluates like a Cambridge examiner
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Our AI evaluates your performance using the exact same logic that real IELTS examiners use:
              </p>
              
              <div className="space-y-4">
                {[
                  { num: '1', title: 'Question Relevance', desc: 'Did you actually answer the question asked?' },
                  { num: '2', title: 'Task Fulfilment', desc: 'Did you complete all parts of the task?' },
                  { num: '3', title: 'Language Control', desc: 'How accurate is your grammar and vocabulary?' },
                  { num: '4', title: 'Band Evidence', desc: 'Is there clear evidence for the band score?' }
                ].map((step, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">{step.num}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{step.title}</h4>
                      <p className="text-sm text-gray-600">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-amber-800 text-sm">
                  <strong>Key Rule:</strong> If a response does not answer the question, the score is capped — regardless of fluency.
                  <span className="block mt-1 text-amber-600">This is how real examiners think. And this is how progress actually happens.</span>
                </p>
              </div>
            </div>

            {/* Screenshot Preview */}
            <div className="relative">
              <div className="bg-gradient-to-br from-violet-100 to-purple-100 rounded-2xl p-6 shadow-xl">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  {/* Mock Feedback Screenshot */}
                  <div className="p-4 border-b bg-gradient-to-r from-violet-50 to-purple-50">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-violet-600" />
                      <span className="font-semibold text-gray-900">AI Evaluation Result</span>
                    </div>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Overall Band</span>
                      <span className="text-2xl font-bold text-violet-600">5.5</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="p-2 bg-gray-50 rounded-lg">
                        <span className="text-gray-500">Task Achievement</span>
                        <span className="block font-semibold">5.0</span>
                      </div>
                      <div className="p-2 bg-gray-50 rounded-lg">
                        <span className="text-gray-500">Coherence</span>
                        <span className="block font-semibold">5.5</span>
                      </div>
                      <div className="p-2 bg-gray-50 rounded-lg">
                        <span className="text-gray-500">Vocabulary</span>
                        <span className="block font-semibold">6.0</span>
                      </div>
                      <div className="p-2 bg-gray-50 rounded-lg">
                        <span className="text-gray-500">Grammar</span>
                        <span className="block font-semibold">5.5</span>
                      </div>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                      <p className="text-sm text-red-800 font-medium">Main Limiting Factor:</p>
                      <p className="text-sm text-red-600">Response does not fully address all parts of the question.</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-sm text-blue-800 font-medium">Next Step:</p>
                      <p className="text-sm text-blue-600">Focus on task response strategies in Module 2.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-violet-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium">
                Real examiner-style feedback
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHO IS THIS FOR */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Who is IELTS Ace for?
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Target, title: 'Students stuck at Band 4–5', desc: 'Breaking through the intermediate ceiling' },
              { icon: TrendingUp, title: 'Aiming for Band 6–7+', desc: 'Need precise feedback to reach your goal' },
              { icon: BookOpen, title: 'Self-study learners', desc: 'Need clear guidance without a tutor' },
              { icon: MessageSquare, title: 'Tired of vague feedback', desc: 'Want honest, actionable advice' }
            ].map((item, idx) => (
              <Card key={idx} className="p-6 bg-white border-0 rounded-2xl hover:shadow-lg transition-all text-center">
                <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-violet-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT'S INSIDE - Features Preview */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Complete IELTS Preparation
            </h2>
            <p className="text-lg text-gray-500">All four skills with AI-powered evaluation</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: BookOpen, title: 'Reading', desc: 'Academic & General • Full passages • 12 question types', color: 'bg-blue-500', shadow: 'shadow-blue-100' },
              { icon: Headphones, title: 'Listening', desc: '4 sections • Real audio • Timed practice', color: 'bg-purple-500', shadow: 'shadow-purple-100' },
              { icon: PenTool, title: 'Writing', desc: 'Task 1 & 2 • AI scoring • Band 8+ samples', color: 'bg-orange-500', shadow: 'shadow-orange-100' },
              { icon: Mic, title: 'Speaking', desc: '3 parts • AI examiner • Model answers', color: 'bg-emerald-500', shadow: 'shadow-emerald-100' }
            ].map((module, idx) => (
              <Card key={idx} className={`p-6 bg-white border-0 shadow-lg ${module.shadow} hover:shadow-xl cursor-pointer group transition-all duration-300 hover:-translate-y-2 rounded-2xl`}>
                <div className={`w-14 h-14 rounded-2xl ${module.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <module.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{module.title}</h3>
                <p className="text-gray-500 text-sm">{module.desc}</p>
              </Card>
            ))}
          </div>

          {/* Advanced Course Preview */}
          <div className="mt-12 p-6 bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl border border-violet-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap className="w-5 h-5 text-violet-600" />
                  <span className="font-semibold text-violet-700">Advanced IELTS Mastery Course</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Band 6.0 → 9.0 Pathway</h3>
                <p className="text-gray-600">20 comprehensive modules with vocabulary, grammar, reading passages, writing prompts, and speaking practice — all with Cambridge-aligned content.</p>
              </div>
              <Button onClick={() => setShowAuth(true)} className="bg-violet-600 hover:bg-violet-700 text-white whitespace-nowrap">
                Explore Course <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* TRANSPARENCY & HONESTY */}
      <section className="py-20 px-6 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-violet-600 flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Our Honesty Promise
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            We do <span className="text-red-400 font-semibold">not</span> promise instant Band 7.
          </p>
          <div className="grid sm:grid-cols-3 gap-6 mb-10">
            {[
              { icon: CheckCircle, text: 'Honest evaluation' },
              { icon: FileText, text: 'Clear explanations' },
              { icon: TrendingUp, text: 'Structured improvement path' }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-center gap-3 text-white">
                <item.icon className="w-5 h-5 text-green-400" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
          <p className="text-violet-300 text-lg">
            That's how real results are built.
          </p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 px-6 bg-gradient-to-br from-violet-600 to-purple-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to see how an examiner really thinks?
          </h2>
          <p className="text-xl text-violet-100 mb-8">
            Start with one test. Let IELTS Ace guide your journey.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button 
              onClick={handleStartFreePractice}
              size="lg" 
              className="bg-white text-violet-700 hover:bg-gray-100 px-10 py-6 text-lg shadow-xl border-0"
            >
              Start Free Level Check
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white">IELTS Ace</h3>
          </div>
          <p className="text-gray-400 mb-2">Your Cambridge-aligned IELTS AI examiner</p>
          <p className="text-violet-400 text-sm mb-4">Think like an examiner. Perform like a candidate.</p>
          <p className="text-gray-500 text-sm">© 2025 IELTS Ace. All rights reserved.</p>
        </div>
      </footer>

      {/* Auth Dialog */}
      <Dialog open={showAuth} onOpenChange={setShowAuth}>
        <DialogContent data-testid="auth-dialog" className="bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-2xl text-gray-900">
              {authMode === 'signup' ? 'Create Account' : 'Welcome Back'}
            </DialogTitle>
          </DialogHeader>
          
          {authMode === 'signup' && (
            <>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 py-5" 
                disabled={loading || processingSocial} 
                onClick={() => { window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(window.location.origin)}`; }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Sign up with Google (Recommended)
              </Button>
              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400">Or sign up with email</span></div>
              </div>
            </>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {authMode === 'signup' && (
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Name</label>
                <Input data-testid="name-input" type="text" placeholder="Enter your name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required={authMode === 'signup'} className="border-gray-300" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Email</label>
              <Input data-testid="email-input" type="email" placeholder="Enter your email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required className="border-gray-300" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Password</label>
              <Input data-testid="password-input" type="password" placeholder={authMode === 'signup' ? 'Create a password (min 8 characters)' : 'Enter your password'} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required minLength={8} className="border-gray-300" />
            </div>
            {authMode === 'signin' && (
              <div className="text-right text-xs">
                <button type="button" className="text-violet-600 hover:underline" onClick={async () => {
                  if (!formData.email) { toast.error('Please enter your email first'); return; }
                  try {
                    const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/forgot-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: formData.email }) });
                    if (!res.ok) throw new Error('Reset failed');
                    toast.success('Reset link sent to your email.');
                  } catch (err) { toast.error('Failed to send reset link.'); }
                }}>Forgot password?</button>
              </div>
            )}
            
            {authMode === 'signup' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">
                  <strong>Important:</strong> After signing up, please check your <strong>Spam</strong> or <strong>Promotions</strong> folder for the verification email.
                </p>
              </div>
            )}
            
            <Button data-testid="submit-auth-btn" type="submit" className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0" disabled={loading}>
              {loading ? 'Please wait...' : authMode === 'signup' ? 'Create Account' : 'Sign In'}
            </Button>
          </form>
          <div className="text-center text-sm text-gray-500">
            <button onClick={() => setAuthMode(authMode === 'signup' ? 'signin' : 'signup')} className="text-violet-600 hover:underline">
              {authMode === 'signup' ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
            </button>
          </div>
          
          {authMode === 'signin' && (
            <>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400">Or continue with</span></div>
              </div>
              <Button type="button" variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2" disabled={loading || processingSocial} onClick={() => { window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(window.location.origin)}`; }}>
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Continue with Google
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
