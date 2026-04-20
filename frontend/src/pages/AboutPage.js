import React from 'react';
import { Link } from 'react-router-dom';
import LandingNav from '../features/landing/components/LandingNav';
import '../features/landing/landing.css';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="landing-scope">
        <LandingNav />
      </div>
      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">About IELTS Ace</h1>
        <p className="text-sm text-gray-500 mb-8">Made by a teacher, powered by students.</p>

        <div className="space-y-5 text-gray-700 leading-relaxed">
          <p>
            IELTS Ace (testmaster.pro) is built by <strong>Agageldi Durdyyev</strong>, an IELTS teacher based in Ho Chi
            Minh City. After watching students pay hundreds of dollars for generic test-prep, the goal became simple:
            give every learner the quality of feedback a good teacher would give — instantly, in their own language,
            at a price that isn't gatekept.
          </p>
          <p>
            Under the hood, every essay you submit is scored by an evaluator tuned on the four IELTS writing criteria —
            task response, coherence & cohesion, lexical resource, grammar & accuracy. Liz, our AI tutor, was prompt-
            engineered by a practicing teacher, not copy-pasted from a template.
          </p>
          <p>
            We ship deliberately. Features go live when they're actually useful, not when a roadmap says they should.
            If you hit a rough edge, <a href="mailto:support@testmaster.pro" className="text-violet-600 hover:underline">tell us</a> —
            a real person reads every email.
          </p>
        </div>

        <div className="mt-10">
          <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
