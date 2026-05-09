import React from 'react';
import { Link } from 'react-router-dom';
import LandingNav from '../features/landing/components/LandingNav';
import LandingFooter from '../features/landing/components/LandingFooter';
import '../features/landing/landing.css';

export default function AboutPage() {
  return (
    <div className="landing-scope">
      <LandingNav />
      <main className="container" style={{ paddingTop: 56, paddingBottom: 64, maxWidth: 720 }}>
        <h1 className="serif" style={{ fontSize: 40, fontWeight: 700, marginBottom: 8 }}>About IELTS Ace</h1>
        <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: 14, marginBottom: 32 }}>
          Made by a teacher, powered by students.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, lineHeight: 1.65, color: 'hsl(var(--foreground))' }}>
          <p>
            IELTS Ace (testmaster.pro) is built by an IELTS teacher based in Ho Chi Minh City. After watching
            students pay hundreds of dollars for generic test-prep, the goal became simple: give every learner the
            quality of feedback a good teacher would give — instantly, in their own language, at a price that isn't
            gatekept.
          </p>
          <p>
            Under the hood, every essay you submit is scored by an evaluator tuned on the four IELTS writing
            criteria — task response, coherence &amp; cohesion, lexical resource, grammar &amp; accuracy. Liz, our
            AI tutor, was prompt-engineered by a practicing teacher, not copy-pasted from a template.
          </p>
          <p>
            We ship deliberately. Features go live when they're actually useful, not when a roadmap says they
            should. If you hit a rough edge,{' '}
            <a href="mailto:support@testmaster.pro" style={{ color: 'hsl(var(--primary))' }}>tell us</a> — a real
            person reads every email.
          </p>
        </div>

        <div style={{ marginTop: 40 }}>
          <Link to="/" style={{ color: 'hsl(var(--muted-foreground))', fontSize: 14, textDecoration: 'none' }}>
            ← Back to home
          </Link>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
