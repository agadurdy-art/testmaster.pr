import React from 'react';

export default function HowItWorks() {
  return (
    <section>
      <div className="container">
        <div className="section-head">
          <div className="section-eyebrow">How it works</div>
          <h2 className="section-title">Three steps. Twelve seconds.</h2>
          <p className="section-sub">
            From blank page to band-level feedback — in less time than it takes to re-read your intro.
          </p>
        </div>
        <div className="how-grid">
          <div className="step">
            <span className="num">01</span>
            <div className="ico">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6M12 18v-6M9 15l3 3 3-3" />
              </svg>
            </div>
            <h4>Submit your essay</h4>
            <p>Paste or type. Task 1, Task 2, or General Training. No word-count games — just your writing.</p>
          </div>
          <div className="step">
            <span className="num">02</span>
            <div className="ico">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
              </svg>
            </div>
            <h4>Get 4-criterion feedback</h4>
            <p>Inline comments and a band estimate — translated into Vietnamese, Turkish, Chinese, or your language of choice.</p>
          </div>
          <div className="step liz-step">
            <span className="num">03</span>
            <div className="ico">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h4>Practice with Liz's guidance</h4>
            <p>Weekly focus areas, targeted drills, and rewrites on demand. Your writing coach, always on.</p>
            <div className="liz-tag"><span className="liz-avatar">L</span>Meet Liz, your AI guide</div>
          </div>
        </div>
      </div>
    </section>
  );
}
