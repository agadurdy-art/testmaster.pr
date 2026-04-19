import React from 'react';
import ArrowRightIcon from './ArrowRightIcon';

export default function DualPathCards() {
  return (
    <section>
      <div className="container">
        <div className="section-head">
          <div className="section-eyebrow">Choose your path</div>
          <h2 className="section-title">Which path fits you?</h2>
          <p className="section-sub">
            Two programs, one platform. Start where you are — switch whenever you're ready.
          </p>
        </div>
        <div className="paths">
          <PathCard
            variant="a"
            badge="IELTS Ace"
            icon={
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 10L12 4 2 10l10 6 10-6z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            }
            title="For IELTS & Cambridge prep"
            desc="Master all four skills with band-level scoring, detailed rewrites, and mock tests calibrated to real examiner rubrics."
            features={[
              '4-criterion AI feedback per essay',
              '1,420+ question bank (Task 1 & 2)',
              'Full-length mock tests with timing',
              'Speaking practice with examiner follow-ups',
            ]}
            ctaLabel="Start IELTS prep"
            ctaClass="btn btn-primary btn-lg"
            ctaHref="/signup?path=ielts"
            lizBubble="I'll guide you through it →"
          />
          <PathCard
            variant="b"
            badge="General English"
            icon={
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M2 3h7a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-7a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h8z" />
              </svg>
            }
            title="For everyday improvement"
            desc="Cambridge-pathway lessons, interactive games, and speaking practice — paced for your level, not the test calendar."
            features={[
              'Beginner to advanced tracks (A1 → C2)',
              'Interactive lessons & vocabulary games',
              'Teacher-guided weekly focus',
              'Speaking & pronunciation coach',
            ]}
            ctaLabel="Start learning"
            ctaClass="btn btn-secondary btn-lg"
            ctaHref="/signup?path=general"
            lizBubble="I'll pick your first lesson →"
          />
        </div>
      </div>
    </section>
  );
}

function PathCard({ variant, badge, icon, title, desc, features, ctaLabel, ctaClass, ctaHref, lizBubble }) {
  return (
    <div className={`path-card ${variant}`}>
      <div className="badge">
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
          <circle cx="5" cy="5" r="5" fill="currentColor" />
        </svg>
        {badge}
      </div>
      <div className="path-icon">{icon}</div>
      <h3>{title}</h3>
      <p className="desc">{desc}</p>
      <ul className="feat-list">
        {features.map((f) => (
          <li key={f}><span className="fcheck">✓</span>{f}</li>
        ))}
      </ul>
      <a href={ctaHref} className={ctaClass}>
        {ctaLabel}
        <ArrowRightIcon size={14} />
      </a>
      <div className="liz-peek">
        <div className="liz-bubble">
          <span className="liz-avatar" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 6 }}>L</span>
          {lizBubble}
        </div>
      </div>
    </div>
  );
}
