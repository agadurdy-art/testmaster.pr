import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { 
  BookOpen, Headphones, Mic, PenTool, CheckCircle, Clock, Target, Trophy,
  Sparkles, GraduationCap, Globe2, Award, ArrowRight, Star, Users, Zap
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

  if (user) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <header className="relative z-50 border-b border-white/10 backdrop-blur-xl bg-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">IELTS Ace</h1>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher compact />
            <Button 
              variant="ghost" 
              className="text-white/80 hover:text-white hover:bg-white/10 hidden sm:flex"
              onClick={() => setShowAuth(true)}
            >
              Sign In
            </Button>
            <Button 
              data-testid="get-started-btn" 
              onClick={() => setShowAuth(true)} 
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white border-0 shadow-lg shadow-purple-500/30"
            >
              {t('getStarted')}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-cyan-300 text-sm mb-8">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered IELTS Preparation</span>
            </div>

            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
              Achieve Your Dream
              <span className="block mt-2 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                IELTS Score
              </span>
            </h2>
            <p className="text-xl text-gray-300 mb-10 leading-relaxed max-w-2xl mx-auto">
              Practice with real exam questions, get instant AI feedback, and track your progress 
              towards your target band score.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button 
                data-testid="start-practicing-btn"
                onClick={() => setShowAuth(true)} 
                size="lg" 
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white px-8 py-6 text-lg shadow-xl shadow-purple-500/30 border-0"
              >
                Start Free Practice
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8 py-6 text-lg border-2 border-white/30 text-white hover:bg-white/10 bg-transparent"
              >
                View Sample Tests
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-gray-400 text-sm">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>10,000+ Students</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <span>4.9/5 Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-400" />
                <span>Instant AI Feedback</span>
              </div>
            </div>
          </div>

          {/* Module Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mt-20">
            {[
              { icon: BookOpen, title: 'Reading', desc: '3 passages • 40 questions', color: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/20' },
              { icon: Headphones, title: 'Listening', desc: '4 sections • 40 questions', color: 'from-purple-500 to-pink-600', shadow: 'shadow-purple-500/20' },
              { icon: PenTool, title: 'Writing', desc: '2 tasks • AI scoring', color: 'from-orange-500 to-red-600', shadow: 'shadow-orange-500/20' },
              { icon: Mic, title: 'Speaking', desc: '3 parts • AI examiner', color: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/20' }
            ].map((module, idx) => (
              <Card 
                key={idx} 
                data-testid={`module-card-${module.title.toLowerCase()}`}
                className={`p-6 bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 cursor-pointer group transition-all duration-300 hover:-translate-y-2 ${module.shadow} hover:shadow-xl`}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${module.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <module.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{module.title}</h3>
                <p className="text-gray-400">{module.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 px-6 bg-white/5 backdrop-blur-sm border-y border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Why Choose IELTS Ace?
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Everything you need to achieve your target band score
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Sparkles,
                title: 'AI-Powered Feedback',
                desc: 'Get instant, detailed feedback on your writing and speaking with advanced AI technology',
                gradient: 'from-cyan-500 to-blue-600'
              },
              {
                icon: Target,
                title: 'Personalized Learning',
                desc: 'Adaptive practice that focuses on your weak areas to maximize improvement',
                gradient: 'from-purple-500 to-pink-600'
              },
              {
                icon: Award,
                title: 'Real Exam Experience',
                desc: 'Practice with authentic test formats and timed conditions',
                gradient: 'from-orange-500 to-red-600'
              }
            ].map((feature, idx) => (
              <Card 
                key={idx} 
                data-testid={`benefit-card-${idx}`} 
                className="p-8 bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 transition-all duration-300 group"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '10K+', label: 'Active Students' },
              { value: '50K+', label: 'Tests Completed' },
              { value: '7.5', label: 'Avg. Band Score' },
              { value: '95%', label: 'Satisfaction Rate' }
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="p-12 text-center bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-xl border-white/20 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10"></div>
            <div className="relative z-10">
              <GraduationCap className="w-16 h-16 mx-auto text-white mb-6" />
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to Start Your IELTS Journey?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Join thousands of successful students achieving their dream scores
              </p>
              <Button 
                data-testid="cta-start-btn"
                onClick={() => setShowAuth(true)}
                size="lg" 
                className="bg-white text-purple-600 hover:bg-gray-100 px-10 py-6 text-lg font-semibold shadow-xl"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/10 py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white">IELTS Ace</h3>
          </div>
          <p className="text-gray-400 mb-4">
            Your AI-powered IELTS preparation partner
          </p>
          <p className="text-gray-500 text-sm">
            © 2025 IELTS Ace. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Auth Dialog */}
      <Dialog open={showAuth} onOpenChange={setShowAuth}>
        <DialogContent data-testid="auth-dialog" className="bg-slate-900 border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white">
              {authMode === 'signup' ? 'Create Account' : 'Welcome Back'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAuth} className="space-y-4">
            {authMode === 'signup' && (
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Name</label>
                <Input
                  data-testid="name-input"
                  type="text"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required={authMode === 'signup'}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Email</label>
              <Input
                data-testid="email-input"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Password</label>
              <Input
                data-testid="password-input"
                type="password"
                placeholder={authMode === 'signup' ? 'Create a password (min 8 characters)' : 'Enter your password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={8}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
              />
              {authMode === 'signup' && (
                <p className="text-xs text-gray-500 mt-1">
                  Use at least 8 characters.
                </p>
              )}
            </div>
            {authMode === 'signin' && (
              <div className="text-right text-xs">
                <button
                  type="button"
                  className="text-cyan-400 hover:underline"
                  onClick={async () => {
                    if (!formData.email) {
                      toast.error('Please enter your email first');
                      return;
                    }
                    try {
                      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/forgot-password`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: formData.email }),
                      });
                      if (!res.ok) {
                        const data = await res.json().catch(() => ({}));
                        throw new Error(data.detail || 'Reset failed');
                      }
                      toast.success('If this email exists, we\'ve sent a reset link.');
                    } catch (err) {
                      toast.error(err.message || 'Failed to start reset.');
                    }
                  }}
                >
                  Forgot password?
                </button>
              </div>
            )}
            <Button 
              data-testid="submit-auth-btn"
              type="submit" 
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white border-0"
              disabled={loading}
            >
              {loading ? 'Please wait...' : authMode === 'signup' ? 'Create Account' : 'Sign In'}
            </Button>
          </form>
          <div className="text-center text-sm text-gray-400">
            <button
              onClick={() => setAuthMode(authMode === 'signup' ? 'signin' : 'signup')}
              className="text-cyan-400 hover:underline"
            >
              {authMode === 'signup' ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
            </button>
          </div>
          
          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/20" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900 px-2 text-gray-500">Or continue with</span>
            </div>
          </div>
          
          <Button
            type="button"
            variant="outline"
            className="w-full border-white/20 text-white hover:bg-white/10 flex items-center justify-center gap-2"
            disabled={loading || processingSocial}
            onClick={() => {
              const redirectUrl = window.location.origin;
              window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
            }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {processingSocial ? 'Processing...' : 'Continue with Google'}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
