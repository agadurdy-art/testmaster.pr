import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

/**
 * SpeakingHeader
 * --------------
 * Functional header for the Speaking surfaces. Keeps the speaking design
 * language (sp-header / sp-logo / sp-nav classes from speaking.css, already
 * loaded) but wires every control so the page feels part of the app instead
 * of a standalone landing page:
 *   - brand logo  → /dashboard
 *   - skill nav   → the four Question Bank surfaces
 *   - avatar      → /profile (real user initial)
 *
 * It deliberately does NOT import the app-wide AppShellNav: pulling appshell.css
 * into the speaking bundle (which also loads liz.css) creates a mini-css-extract
 * "Conflicting order" warning that fails the CI build. Reusing speaking.css
 * classes keeps the bundle's CSS order stable.
 */
function initialFor(user) {
  const src = user?.full_name || user?.name || user?.email || 'A';
  return String(src).trim().charAt(0).toUpperCase() || 'A';
}

export default function SpeakingHeader({ user }) {
  const navigate = useNavigate();
  return (
    <header className="sp-header">
      <div className="sp-header-inner">
        <Link to="/dashboard" className="sp-logo">
          IELTS Ace<span className="sp-logo-tld">.pro</span>
        </Link>
        <nav className="sp-nav">
          <Link className="sp-nav-link" to="/question-bank/writing">Writing</Link>
          <Link className="sp-nav-link active" to="/question-bank/speaking">Speaking</Link>
          <Link className="sp-nav-link" to="/question-bank/reading">Reading</Link>
          <Link className="sp-nav-link" to="/question-bank/listening">Listening</Link>
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link
            to="/dashboard"
            className="sp-nav-link"
            style={{ fontSize: 13 }}
          >
            ← Dashboard
          </Link>
          <button
            type="button"
            className="sp-avatar"
            aria-label="Account"
            onClick={() => navigate('/profile')}
            style={{ border: 'none', cursor: 'pointer' }}
          >
            {initialFor(user)}
          </button>
        </div>
      </div>
    </header>
  );
}
