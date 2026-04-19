import React from 'react';

export default function PricingNav() {
  return (
    <header className="nav">
      <div className="container nav-inner">
        <a href="/landing/v2" className="logo">
          testmaster<span className="pro">.pro</span>
        </a>
        <nav aria-label="Primary">
          <ul className="nav-links">
            <li><a href="/landing/v2#samples">Samples</a></li>
            <li><a href="/pricing/v2" aria-current="page">Pricing</a></li>
            <li><a href="/landing/v2#blog">Teacher Blog</a></li>
            <li><a href="/landing/v2#about">About</a></li>
          </ul>
        </nav>
        <div className="nav-right">
          <a href="/login" className="btn btn-ghost desktop-only">Log in</a>
          <a href="/signup" className="btn btn-primary">Start free</a>
          <button type="button" className="menu-btn" aria-label="Menu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
