import React, { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Eye, EyeOff, Sparkles, BarChart3, Target } from 'lucide-react';
import { registerUser } from '../lib/api';
import { homePath } from '../lib/learningMode';
import { captureUtm, track } from '../lib/analytics';

// Dedicated paid-social conversion landing (route: /start).
//
// Why this exists: cold TikTok traffic was being dropped on the generic "/"
// homepage — which first interrupts with the IELTS-vs-GE PathPickerGate modal
// — and bounced in ~9s with effectively zero signups (GA4, 2026-06-16). This
// page is single-purpose: one promise, the signup form inline above the fold,
// no global nav / no path picker / no footer clutter. It forces the IELTS
// product (the ad's subject) and reuses the working registerUser + Google
// OAuth flow so there's no new auth surface to maintain.
//
// Visual language: rides the existing .lg-auth liquid-glass tokens (aurora +
// frosted card) for consistency with the redesigned login, plus a premium
// spinning conic-gradient border on the signup card (pattern #9) to pull the
// eye to the single CTA. All motion is CSS-only and stops under
// prefers-reduced-motion.
export default function StartLanding({ user, onLogin }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [startedFiring, setStartedFiring] = useState(false);
  const nameRef = useRef(null);

  // Mobile sticky CTA → bring the form into view and focus it so a
  // ready-to-convert visitor doesn't have to scroll past the benefits first.
  const jumpToForm = () => {
    onFirstInput();
    try {
      nameRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => nameRef.current?.focus({ preventScroll: true }), 350);
    } catch (_) {
      nameRef.current?.focus();
    }
  };

  // Persist UTM for the session + pin the IELTS path so onboarding runs the
  // right steps and the PathPickerGate never gets a say.
  useEffect(() => {
    captureUtm();
    try { localStorage.setItem('testmaster_onboarding_path', 'ielts'); } catch (_) { /* non-fatal */ }
  }, []);

  if (user) {
    return <Navigate to={homePath(user)} replace />;
  }

  // Mid-funnel signal: fire once when the visitor first engages the form, so
  // we can see "landed → started signup → completed" drop-off in GA4.
  const onFirstInput = () => {
    if (!startedFiring) {
      setStartedFiring(true);
      track('signup_start', { method: 'email' });
    }
  };

  const handleGoogle = () => {
    track('signup_start', { method: 'google' });
    // UTM already lives in sessionStorage (captureUtm); App.js can attribute
    // the post-redirect signup. Force IELTS via the persisted path hint above.
    window.location.href = `${process.env.REACT_APP_BACKEND_URL}/api/auth/google/start`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { name, email, password } = formData;
      const userData = await registerUser({ name, email, password });
      track('sign_up', { method: 'email' });
      onLogin(userData);
      toast.success('Welcome! Check your email to verify your account.', { duration: 5000 });
      // Brand-new accounts have no learning_mode yet → onboarding (IELTS path
      // pinned above). onLogin may already navigate; this is the safety net.
      const mode = (userData?.learning_mode || '').toLowerCase();
      if (mode === 'ielts' || mode === 'both') navigate('/dashboard');
      else navigate('/onboarding?path=ielts');
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Sign-up failed. Please try again.';
      toast.error(typeof msg === 'string' ? msg : 'Sign-up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const BENEFITS = [
    { icon: BarChart3, title: 'Instant band scores', body: 'Speaking & writing graded the moment you finish — by Liz, our AI examiner.' },
    { icon: Sparkles, title: 'Full Cambridge practice', body: 'Real past-paper mocks plus thousands of questions across all four skills.' },
    { icon: Target, title: 'A plan built around you', body: 'We find your weakest skill and target it, so every session moves your band.' },
  ];

  return (
    <div className="lg-auth tt-land">
      <div className="lg-aurora" aria-hidden="true"><i></i><i></i><i></i></div>

      <div className="tt-shell">
        <div className="tt-hero">
          {/* Left: the promise + proof */}
          <div className="tt-copy">
            <div className="lg-brand">
              <div className="lg-logo">IA</div>
              <div>
                <b>IELTS Ace</b>
                <small>by testmaster.pro</small>
              </div>
            </div>

            <h1 className="tt-h1">
              Get the IELTS band you need — with an AI examiner in your pocket.
            </h1>
            <p className="tt-lead">
              Practise every skill, get a real band score in seconds, and follow a plan
              that targets exactly what's holding you back. Free to start.
            </p>

            <ul className="tt-benefits">
              {BENEFITS.map((b) => {
                const Icon = b.icon;
                return (
                  <li key={b.title}>
                    <span className="tt-bicon"><Icon className="w-[18px] h-[18px]" /></span>
                    <span>
                      <b>{b.title}</b>
                      <small>{b.body}</small>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Right: the single goal — signup, inline */}
          <div className="tt-cardwrap">
            <div className="lg-card tt-card">
              <h2 className="tt-cardtitle">Create your free account</h2>
              <p className="tt-cardsub">No credit card. Takes 20 seconds.</p>

              <button type="button" className="lg-google" onClick={handleGoogle} disabled={loading}>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>

              <div className="lg-divider">Or sign up with email</div>

              <form onSubmit={handleSubmit}>
                <div className="lg-field">
                  <input id="tt-name" ref={nameRef} type="text" placeholder=" " value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    onFocus={onFirstInput} required autoComplete="name" />
                  <label htmlFor="tt-name">Full name</label>
                </div>
                <div className="lg-field">
                  <input id="tt-email" type="email" placeholder=" " value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    onFocus={onFirstInput} required autoComplete="email" />
                  <label htmlFor="tt-email">Email address</label>
                </div>
                <div className="lg-field">
                  <input id="tt-pwd" type={showPassword ? 'text' : 'password'} placeholder=" "
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    onFocus={onFirstInput} required minLength={8} autoComplete="new-password" />
                  <label htmlFor="tt-pwd">Password (min 8 characters)</label>
                  <button type="button" className="lg-eye" onClick={() => setShowPassword((v) => !v)} tabIndex={-1} aria-label="Toggle password visibility">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <button type="submit" className="lg-cta" disabled={loading}>
                  {loading ? 'Creating your account…' : 'Start free →'}
                </button>
              </form>

              <div className="lg-foot">
                Already have an account?{' '}
                <Link to="/login" className="tt-signin">Sign in</Link>
              </div>
            </div>
          </div>
        </div>

        <p className="tt-terms">
          By continuing you agree to our <Link to="/terms">Terms</Link> and{' '}
          <Link to="/privacy">Privacy Policy</Link>.
        </p>
      </div>

      {/* Mobile-only sticky CTA — jumps a ready visitor straight to the form */}
      <button type="button" className="tt-sticky" onClick={jumpToForm}>
        Start free →
      </button>
    </div>
  );
}
