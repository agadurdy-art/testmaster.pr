import React, { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AlertTriangle, ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { registerUser, loginUser } from '../lib/api';
import { homePath } from '../lib/learningMode';

// Standalone auth page — replaces the old V1 LandingPage rendering at /login.
// Before this page existed, users clicking Sign-up / Log-in on the new V2
// landing were bounced to /login which rendered LandingPage V1 behind an
// auth modal (users experienced it as "going to the old site"). This page
// is a clean centered auth surface that reuses registerUser/loginUser from
// lib/api plus the Emergent-hosted Google OAuth redirect.
export default function LoginPage({ user, onLogin }) {
  const location = useLocation();
  const navigate = useNavigate();

  const initialMode = () => {
    const action = new URLSearchParams(location.search).get('action');
    return action === 'signup' ? 'signup' : 'signin';
  };

  // Honor ?next=<path> set by RedirectToLogin so users return to the page
  // they were trying to reach. Same-origin paths only — reject anything that
  // doesn't start with a single "/" to block open-redirect into //evil.com
  // or javascript: URLs.
  const safeNext = (() => {
    const raw = new URLSearchParams(location.search).get('next');
    if (!raw) return null;
    if (!raw.startsWith('/') || raw.startsWith('//')) return null;
    return raw;
  })();
  // Explicit per-visit product intent from the URL (?path=ielts|general),
  // e.g. set by a product-specific "Log in to IELTS Ace" / GE CTA. Unlike
  // `pathPick` below, this deliberately ignores the localStorage hint so a
  // stale hint from a previous session can't override fresh DB truth.
  const urlPath = (() => {
    const raw = (new URLSearchParams(location.search).get('path') || '').toLowerCase();
    if (raw === 'general' || raw === 'general_english' || raw === 'ge') return 'general';
    if (raw === 'ielts' || raw === 'ielts_ace') return 'ielts';
    return null;
  })();

  // Strict product routing. Priority:
  //   1. ?next=        — explicit deep-link return (RedirectToLogin)
  //   2. DB learning_mode — a RETURNING user always lands on THEIR product;
  //      a GE-branded login link can never drag an existing IELTS user into GE.
  //   3. brand-new account (no mode yet) → onboarding, carrying the product
  //      intent so the right IELTS/GE steps run and the right home is reached.
  // /dashboard = IELTS Ace, /ge/dashboard = General English.
  const landingFor = (u) => {
    if (safeNext) return safeNext;
    const mode = (u?.learning_mode || '').toLowerCase();
    if (mode === 'ielts') return '/dashboard';
    if (mode === 'general_english' || mode === 'general' || mode === 'ge') return '/ge/dashboard';
    if (mode === 'both') {
      if (urlPath === 'general') return '/ge/dashboard';
      if (urlPath === 'ielts') return '/dashboard';
      return homePath(u);
    }
    // No product on file → onboarding with the captured product intent.
    if (urlPath === 'general') return '/onboarding?path=general';
    if (urlPath === 'ielts') return '/onboarding?path=ielts';
    return '/onboarding';
  };

  // Branding: if the visitor came from PathPickerGate ?path=general OR
  // /signup?path=general we render the Ray English / General English brand
  // instead of the default IELTS Ace. Persist the choice into
  // localStorage so the bridge to /onboarding doesn't lose it.
  const pathPick = (() => {
    const raw = (new URLSearchParams(location.search).get('path') || '').toLowerCase();
    if (raw === 'general' || raw === 'general_english' || raw === 'ge') return 'general';
    if (raw === 'ielts' || raw === 'ielts_ace') return 'ielts';
    try {
      const stored = String(localStorage.getItem('testmaster_onboarding_path') || '').toLowerCase();
      if (stored === 'general') return 'general';
      if (stored === 'ielts') return 'ielts';
    } catch (_) { /* non-fatal */ }
    return null;
  })();
  const isGE = pathPick === 'general';
  const brandTitle = isGE ? 'General English' : 'IELTS Ace';
  const brandTagline = isGE ? 'by Ray · testmaster.pro' : 'by testmaster.pro';
  useEffect(() => {
    if (pathPick) {
      try { localStorage.setItem('testmaster_onboarding_path', pathPick); } catch (_) { /* non-fatal */ }
    }
  }, [pathPick]);

  const [mode, setMode] = useState(initialMode);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    setMode(initialMode());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  if (user) {
    return <Navigate to={landingFor(user)} replace />;
  }

  const handleGoogle = () => {
    // Own Google OAuth client (replaces auth.emergentagent.com proxy as of
    // 2026-05-08). Backend handles the consent dance and hands us back a
    // short-lived ticket in `#session_id=` for App.js to exchange.
    // Stash `next` in sessionStorage so the OAuth round-trip (which strips
    // the query string) can still return us to the originally requested
    // page after sign-in.
    if (safeNext) {
      try { window.sessionStorage.setItem('postLoginNext', safeNext); } catch (_) { /* non-fatal */ }
    }
    window.location.href = `${process.env.REACT_APP_BACKEND_URL}/api/auth/google/start`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'signup' && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'signup') {
        const { name, email, password } = formData;
        const userData = await registerUser({ name, email, password });
        onLogin(userData);
        toast.success('Welcome! Check your email to verify your account.', { duration: 5000 });
        navigate(landingFor(userData));
      } else {
        const { email, password } = formData;
        const userData = await loginUser({ email, password });
        onLogin(userData);
        toast.success('Welcome back!');
        navigate(landingFor(userData));
      }
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Authentication failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async () => {
    if (!formData.email) {
      toast.error('Enter your email first.');
      return;
    }
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });
      if (!res.ok) throw new Error('Reset failed');
      toast.success('Reset link sent to your email.');
    } catch (_) {
      toast.error('Failed to send reset link.');
    }
  };

  const passwordsMismatch =
    mode === 'signup' && formData.confirmPassword && formData.password !== formData.confirmPassword;
  const passwordsMatch =
    mode === 'signup' &&
    formData.confirmPassword &&
    formData.password === formData.confirmPassword &&
    formData.password.length >= 8;

  return (
    <div className={`lg-auth${isGE ? ' is-ge' : ''}`}>
      {/* Living aurora backdrop — GPU transform-only, paused under reduced-motion */}
      <div className="lg-aurora" aria-hidden="true"><i></i><i></i><i></i></div>

      <div className="lg-shell">
        <Link to="/" className="lg-back">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>

        <div className="lg-card">
          <div className="lg-brand">
            <img src="/brand/ielts-ace-logo.jpg" alt="IELTS Ace" style={{ width: 42, height: 42, borderRadius: 13, objectFit: 'cover', boxShadow: '0 6px 16px -4px rgba(16,185,129,.35)' }} />
            <div>
              <b>{brandTitle}</b>
              <small>{brandTagline}</small>
            </div>
          </div>

          <h1 className="lg-title">
            {mode === 'signup' ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="lg-sub">
            {mode === 'signup'
              ? 'Free to start. No credit card required.'
              : isGE
                ? 'Sign in to continue learning English with Ray.'
                : 'Sign in to continue your IELTS prep.'}
          </p>

          <button type="button" className="lg-google" onClick={handleGoogle} disabled={loading}>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <div className="lg-divider">
            {mode === 'signup' ? 'Or sign up with email' : 'Or sign in with email'}
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div className="lg-field">
                <input
                  id="lg-name"
                  type="text"
                  placeholder=" "
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  autoComplete="name"
                />
                <label htmlFor="lg-name">Full name</label>
              </div>
            )}

            <div className="lg-field">
              <input
                id="lg-email"
                type="email"
                placeholder=" "
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                autoComplete="email"
              />
              <label htmlFor="lg-email">Email address</label>
            </div>

            <div className="lg-field">
              <input
                id="lg-pwd"
                type={showPassword ? 'text' : 'password'}
                placeholder=" "
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={8}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              />
              <label htmlFor="lg-pwd">Password</label>
              <button type="button" className="lg-eye" onClick={() => setShowPassword((v) => !v)} tabIndex={-1} aria-label="Toggle password visibility">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {mode === 'signup' && (
              <div className={`lg-field${passwordsMismatch ? ' is-error' : ''}`}>
                <input
                  id="lg-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder=" "
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
                <label htmlFor="lg-confirm">Confirm password</label>
                <button type="button" className="lg-eye" onClick={() => setShowConfirm((v) => !v)} tabIndex={-1} aria-label="Toggle confirm password visibility">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            )}
            {passwordsMismatch && <p className="lg-hint err">Passwords do not match</p>}
            {passwordsMatch && (
              <p className="lg-hint ok"><CheckCircle className="w-3 h-3" /> Passwords match</p>
            )}

            {mode === 'signin' && (
              <div className="lg-forgot">
                <button type="button" onClick={handleForgot}>Forgot password?</button>
              </div>
            )}

            {mode === 'signup' && (
              <div className="lg-warn">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Use a real email — we send a verification link to unlock all features.</span>
              </div>
            )}

            <button type="submit" className="lg-cta" disabled={loading || passwordsMismatch}>
              {loading ? 'Working…' : mode === 'signup' ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <div className="lg-foot">
            <button type="button" onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}>
              {mode === 'signup' ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
            </button>
          </div>
        </div>

        <p className="lg-terms">
          By continuing, you agree to our{' '}
          <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
