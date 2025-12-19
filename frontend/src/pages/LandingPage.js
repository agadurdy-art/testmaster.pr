import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { 
  BookOpen, Headphones, Mic, PenTool, CheckCircle, Clock, Target, Trophy,
  Sparkles, GraduationCap, Award, ArrowRight, Star, Users, Zap, Play, X, AlertTriangle
} from 'lucide-react';
import { registerUser, loginUser } from '../lib/api';
import { toast } from 'sonner';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useI18n } from '../lib/i18n';

const LEVEL_TEST_STORAGE_KEY = 'ielts_ace_level_test_used';
const MAX_SESSION_SECONDS = 240; // 4 minutes

export default function LandingPage({ onLogin, user }) {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('signup');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [processingSocial, setProcessingSocial] = useState(false);
  
  // Level Test Widget States
  const [showLevelTest, setShowLevelTest] = useState(false);
  const [levelTestUsed, setLevelTestUsed] = useState(false);
  const [showUsedWarning, setShowUsedWarning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(MAX_SESSION_SECONDS);
  const [timerActive, setTimerActive] = useState(false);
  const timerIntervalRef = useRef(null);
  const widgetContainerRef = useRef(null);

  // Check if device has already used the free level test
  // TEMPORARILY DISABLED for testing - will re-enable once confirmed working
  useEffect(() => {
    // const used = localStorage.getItem(LEVEL_TEST_STORAGE_KEY);
    // if (used === 'true') {
    //   setLevelTestUsed(true);
    // }
    // For now, always allow testing
    setLevelTestUsed(false);
  }, []);

  // Timer countdown effect
  useEffect(() => {
    if (timerActive && timerSeconds > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [timerActive]);

  // When timer reaches 0 or widget closes, redirect to registration
  const handleLevelTestEnd = useCallback(() => {
    setShowLevelTest(false);
    setTimerActive(false);
    // TEMPORARILY DISABLED for testing
    // localStorage.setItem(LEVEL_TEST_STORAGE_KEY, 'true');
    // setLevelTestUsed(true);
    // Redirect to registration
    setAuthMode('signup');
    setShowAuth(true);
  }, []);

  // Handle "Start Free Practice" - navigates to in-app level test
  const handleStartFreePractice = () => {
    // Navigate to the in-app Level Test (10 questions from starter to IELTS level)
    navigate('/level-test');
  };

  // Handle "Try Free Level Test" - opens ElevenLabs AI examiner widget
  const handleStartAILevelTest = () => {
    if (levelTestUsed) {
      setShowUsedWarning(true);
      return;
    }
    setTimerSeconds(MAX_SESSION_SECONDS);
    setShowLevelTest(true);
    setTimerActive(true);
  };

  // Format timer display
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Create ElevenLabs widget when modal opens
  useEffect(() => {
    if (showLevelTest && widgetContainerRef.current) {
      // Insert the widget AND script exactly as provided by ElevenLabs
      widgetContainerRef.current.innerHTML = `
        <elevenlabs-convai agent-id="agent_8701kctavvxafxk90czptrbg2p4r"></elevenlabs-convai>
        <script src="https://unpkg.com/@elevenlabs/convai-widget-embed" async type="text/javascript"></script>
      `;
      
      // Also load script in head if not already there (for reinitializing)
      if (!document.querySelector('script[src*="elevenlabs/convai-widget-embed"]')) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
        script.async = true;
        script.type = 'text/javascript';
        document.head.appendChild(script);
      }

      return () => {
        if (widgetContainerRef.current) {
          widgetContainerRef.current.innerHTML = '';
        }
      };
    }
  }, [showLevelTest]);

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

  // Redirect to dashboard if user is logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-orange-50/30 to-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-200">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">IELTS Ace</h1>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher compact />
            <Button 
              variant="ghost" 
              className="text-gray-600 hover:text-violet-600 hidden sm:flex"
              onClick={() => setShowAuth(true)}
            >
              Sign In
            </Button>
            <Button 
              data-testid="get-started-btn" 
              onClick={() => setShowAuth(true)} 
              className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg shadow-purple-200 border-0"
            >
              {t('getStarted')}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 text-violet-700 text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered IELTS Preparation</span>
            </div>

            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
              Achieve Your Dream
              <span className="block mt-2 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                IELTS Score
              </span>
            </h2>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
              Practice with real exam questions, get instant AI feedback, and track your progress 
              towards your target band score.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button 
                data-testid="start-practicing-btn"
                onClick={handleStartFreePractice} 
                size="lg" 
                className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white px-8 py-6 text-lg shadow-xl shadow-purple-200 border-0"
              >
                Start Free Practice
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8 py-6 text-lg border-2 border-violet-200 text-violet-700 hover:bg-violet-50"
                onClick={handleStartAILevelTest}
              >
                <Mic className="w-5 h-5 mr-2" />
                Try AI Level Test
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-8 mt-12 text-gray-500 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Users className="w-4 h-4 text-green-600" />
                </div>
                <span className="font-medium">10,000+ Students</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Star className="w-4 h-4 text-yellow-600" />
                </div>
                <span className="font-medium">4.9/5 Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-purple-600" />
                </div>
                <span className="font-medium">Instant AI Feedback</span>
              </div>
            </div>
          </div>

          {/* Module Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mt-20">
            {[
              { icon: BookOpen, title: 'Reading', desc: '3 passages • 40 questions', color: 'bg-blue-500', lightBg: 'bg-blue-50', lightText: 'text-blue-600', shadow: 'shadow-blue-100' },
              { icon: Headphones, title: 'Listening', desc: '4 sections • 40 questions', color: 'bg-purple-500', lightBg: 'bg-purple-50', lightText: 'text-purple-600', shadow: 'shadow-purple-100' },
              { icon: PenTool, title: 'Writing', desc: '2 tasks • AI scoring', color: 'bg-orange-500', lightBg: 'bg-orange-50', lightText: 'text-orange-600', shadow: 'shadow-orange-100' },
              { icon: Mic, title: 'Speaking', desc: '3 parts • AI examiner', color: 'bg-emerald-500', lightBg: 'bg-emerald-50', lightText: 'text-emerald-600', shadow: 'shadow-emerald-100' }
            ].map((module, idx) => (
              <Card 
                key={idx} 
                data-testid={`module-card-${module.title.toLowerCase()}`}
                className={`p-6 bg-white border-0 shadow-lg ${module.shadow} hover:shadow-xl cursor-pointer group transition-all duration-300 hover:-translate-y-2 rounded-2xl`}
              >
                <div className={`w-14 h-14 rounded-2xl ${module.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <module.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{module.title}</h3>
                <p className="text-gray-500">{module.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Why Choose IELTS Ace?
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              Everything you need to achieve your target band score
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Sparkles,
                title: 'AI-Powered Feedback',
                desc: 'Get instant, detailed feedback on your writing and speaking with advanced AI technology',
                color: 'bg-violet-500',
                lightBg: 'bg-violet-50'
              },
              {
                icon: Target,
                title: 'Personalized Learning',
                desc: 'Adaptive practice that focuses on your weak areas to maximize improvement',
                color: 'bg-pink-500',
                lightBg: 'bg-pink-50'
              },
              {
                icon: Award,
                title: 'Real Exam Experience',
                desc: 'Practice with authentic test formats and timed conditions',
                color: 'bg-amber-500',
                lightBg: 'bg-amber-50'
              }
            ].map((feature, idx) => (
              <Card 
                key={idx} 
                data-testid={`benefit-card-${idx}`} 
                className="p-8 bg-gray-50 border-0 rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-300 group"
              >
                <div className={`w-16 h-16 rounded-2xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-violet-500 to-purple-600">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '10K+', label: 'Active Students', icon: Users },
              { value: '50K+', label: 'Tests Completed', icon: CheckCircle },
              { value: '7.5', label: 'Avg. Band Score', icon: Award },
              { value: '95%', label: 'Satisfaction Rate', icon: Star }
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-4xl sm:text-5xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-violet-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="p-12 text-center bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200 rounded-3xl">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-purple-200">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Ready to Start Your IELTS Journey?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of successful students achieving their dream scores
            </p>
            <Button 
              data-testid="cta-start-btn"
              onClick={() => setShowAuth(true)}
              size="lg" 
              className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white px-10 py-6 text-lg shadow-xl shadow-purple-200 border-0"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Card>
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
          <p className="text-gray-400 mb-4">Your AI-powered IELTS preparation partner</p>
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
          
          {/* Google Sign Up - Now at TOP for signup mode */}
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
                <Input
                  data-testid="name-input"
                  type="text"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required={authMode === 'signup'}
                  className="border-gray-300"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Email</label>
              <Input
                data-testid="email-input"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="border-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Password</label>
              <Input
                data-testid="password-input"
                type="password"
                placeholder={authMode === 'signup' ? 'Create a password (min 8 characters)' : 'Enter your password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={8}
                className="border-gray-300"
              />
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
            
            {/* Spam Warning for Email Signup */}
            {authMode === 'signup' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">
                  <strong>Important:</strong> After signing up, please check your <strong>Spam</strong> or <strong>Promotions</strong> folder for the verification email to activate your account.
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
          
          {/* Google Sign In - For signin mode only */}
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

      {/* AI Speaking Level Test Modal (ElevenLabs) */}
      <Dialog open={showLevelTest} onOpenChange={(open) => {
        if (!open) {
          handleLevelTestEnd();
        }
      }}>
        <DialogContent className="bg-white border-gray-200 sm:max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Mic className="w-5 h-5 text-white" />
                </div>
                AI Speaking Test
              </DialogTitle>
              <div className="flex items-center gap-2 bg-emerald-100 px-4 py-2 rounded-full">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span className={`font-bold ${timerSeconds <= 60 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {formatTimer(timerSeconds)}
                </span>
              </div>
            </div>
          </DialogHeader>
          
          <div className="mt-4">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 mb-4">
              <p className="text-gray-600 mb-4">
                <strong>Speak with our AI examiner</strong> to discover your English speaking level. 
                The conversation will last up to 4 minutes.
              </p>
              <div className="flex items-center gap-2 text-sm text-emerald-600">
                <Sparkles className="w-4 h-4" />
                <span>Powered by ElevenLabs • Real-time conversation</span>
              </div>
            </div>
            
            {/* ElevenLabs Widget Container */}
            <div 
              ref={widgetContainerRef} 
              className="min-h-[350px] flex items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 overflow-hidden"
            >
              <div className="text-center text-gray-500">
                <Mic className="w-12 h-12 mx-auto mb-3 text-emerald-400 animate-pulse" />
                <p className="font-medium">AI Examiner Loading...</p>
                <p className="text-sm mt-1">The widget will appear here shortly</p>
                <p className="text-xs mt-2 text-gray-400">Click the microphone button when it appears to start</p>
              </div>
            </div>
            
            <p className="text-xs text-gray-400 text-center mt-4">
              After the test, you'll be redirected to create an account and access more features.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Already Used Warning Modal */}
      <Dialog open={showUsedWarning} onOpenChange={setShowUsedWarning}>
        <DialogContent className="bg-white border-gray-200 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              Free Trial Used
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-4">
            <p className="text-gray-600 mb-6">
              You've already used your free level test on this device. 
              Create an account to access unlimited level tests and many more features!
            </p>
            
            <div className="space-y-3">
              <Button 
                className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white border-0 py-5"
                onClick={() => {
                  setShowUsedWarning(false);
                  setAuthMode('signup');
                  setShowAuth(true);
                }}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24"><path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Sign up with Google
              </Button>
              <Button 
                variant="outline"
                className="w-full border-gray-300"
                onClick={() => {
                  setShowUsedWarning(false);
                  setAuthMode('signup');
                  setShowAuth(true);
                }}
              >
                Sign up with Email
              </Button>
            </div>
            
            <p className="text-xs text-gray-400 text-center mt-4">
              Already have an account?{' '}
              <button 
                className="text-violet-600 hover:underline"
                onClick={() => {
                  setShowUsedWarning(false);
                  setAuthMode('signin');
                  setShowAuth(true);
                }}
              >
                Sign in
              </button>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
