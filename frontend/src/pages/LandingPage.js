import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { BookOpen, Headphones, Mic, PenTool, CheckCircle, Clock, Target, Trophy } from 'lucide-react';
import { registerUser, loginUser } from '../lib/api';
import { toast } from 'sonner';

export default function LandingPage({ onLogin, user }) {
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('signup');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (authMode === 'signup') {
        const { name, email, password } = formData;
        const userData = await registerUser({ name, email, password });
        onLogin(userData);
        toast.success('Account created! Welcome to IELTS Ace!');
        navigate('/dashboard');
      } else {
        const { email, password } = formData;
        const userData = await loginUser({ email, password });
        onLogin(userData);
        toast.success('Logged in successfully!');
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">IELTS Ace</h1>
          </div>
          <Button data-testid="get-started-btn" onClick={() => setShowAuth(true)} className="primary-gradient text-white">
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto animate-fade-in">
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Master IELTS with
              <span className="block mt-2 bg-gradient-to-r from-sky-500 to-cyan-500 bg-clip-text text-transparent">
                AI-Powered Practice
              </span>
            </h2>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-3xl mx-auto">
              Achieve your target band score with real-time AI evaluation, comprehensive practice tests, 
              and personalized feedback from our advanced learning platform.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button 
                data-testid="start-practicing-btn"
                onClick={() => setShowAuth(true)} 
                size="lg" 
                className="primary-gradient text-white px-8 py-6 text-lg"
              >
                Start Practicing Free
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8 py-6 text-lg border-2 border-sky-500 text-sky-600 hover:bg-sky-50"
              >
                View Sample Tests
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
            {[
              { icon: BookOpen, title: 'Reading', desc: '40 questions, 60 minutes', color: 'from-blue-500 to-indigo-500' },
              { icon: Headphones, title: 'Listening', desc: '40 questions, 40 minutes', color: 'from-purple-500 to-pink-500' },
              { icon: PenTool, title: 'Writing', desc: '2 tasks, AI evaluation', color: 'from-orange-500 to-red-500' },
              { icon: Mic, title: 'Speaking', desc: 'AI interviewer, instant feedback', color: 'from-green-500 to-teal-500' }
            ].map((module, idx) => (
              <Card 
                key={idx} 
                data-testid={`module-card-${module.title.toLowerCase()}`}
                className="p-6 hover-lift cursor-pointer group"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <module.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{module.title}</h3>
                <p className="text-gray-600">{module.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Why Choose IELTS Ace?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of students achieving their dream band scores
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: CheckCircle,
                title: 'AI-Powered Evaluation',
                desc: 'Get instant, detailed feedback on your writing and speaking with GPT-5 technology',
                color: 'text-green-600'
              },
              {
                icon: Clock,
                title: 'Real-Time Practice',
                desc: 'Simulate actual test conditions with timed practice and realistic question formats',
                color: 'text-blue-600'
              },
              {
                icon: Target,
                title: 'Personalized Learning',
                desc: 'Track your progress and focus on areas that need improvement with detailed analytics',
                color: 'text-purple-600'
              }
            ].map((benefit, idx) => (
              <div key={idx} data-testid={`benefit-card-${idx}`} className="text-center p-8 rounded-2xl hover:bg-slate-50 transition-colors">
                <div className={`w-16 h-16 mx-auto rounded-full bg-white shadow-lg flex items-center justify-center mb-6 ${benefit.color}`}>
                  <benefit.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="p-12 text-center primary-gradient">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Achieve Your Target Band Score?
            </h2>
            <p className="text-xl text-blue-50 mb-8">
              Start practicing today with our comprehensive IELTS preparation platform
            </p>
            <Button 
              data-testid="cta-start-btn"
              onClick={() => setShowAuth(true)}
              size="lg" 
              className="bg-white text-sky-600 hover:bg-blue-50 px-10 py-6 text-lg"
            >
              Start Your Free Practice
            </Button>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold">IELTS Ace</h3>
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
        <DialogContent data-testid="auth-dialog">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {authMode === 'signup' ? 'Create Account' : 'Welcome Back'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAuth} className="space-y-4">
            {authMode === 'signup' && (
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <Input
                  data-testid="name-input"
                  type="text"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required={authMode === 'signup'}
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input
                data-testid="email-input"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <Input
                data-testid="password-input"
                type="password"
                placeholder={authMode === 'signup' ? 'Create a password (min 8 characters)' : 'Enter your password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={8}
              />
              <p className="text-xs text-gray-500 mt-1">
                Use at least 8 characters. Letters and numbers recommended.
              </p>
            </div>
            {authMode === 'signin' && (
              <div className="text-right text-xs text-gray-500">
                <button
                  type="button"
                  className="text-sky-600 hover:underline"
                  onClick={async () => {
                    if (!formData.email) {
                      toast.error('Please enter your email first');
                      return;
                    }
                    try {
                      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/forgot-password`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: formData.email }),
                      });
                      toast.success('If this email exists, a reset link has been sent.');
                    } catch (err) {
                      toast.error('Failed to request password reset. Please try again.');
                    }
                  }}
                >
                  Forgot password?
                </button>
              </div>
            )}

              data-testid="submit-auth-btn"
              type="submit" 
              className="w-full primary-gradient text-white"
              disabled={loading}
            >
              {loading ? 'Please wait...' : authMode === 'signup' ? 'Create Account' : 'Sign In'}
            </Button>
          </form>
          <div className="text-center text-sm text-gray-600">
            <button
              onClick={() => setAuthMode(authMode === 'signup' ? 'signin' : 'signup')}
              className="text-sky-600 hover:underline"
            >
              {authMode === 'signup' ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
