import React from 'react';
import ArrowRightIcon from './ArrowRightIcon';

export default function FinalCTA() {
  return (
    <section className="final">
      <div className="container final-inner">
        <h2>
          Your IELTS band is <span className="em">0.5–1.0 lower</span> than it could be.
          Let's fix that.
        </h2>
        <p>One free evaluation. No signup. No credit card. Just your essay and an honest, band-level response.</p>
        <a href="/evaluate/sample" className="btn btn-primary btn-xl">
          Try free
          <ArrowRightIcon size={16} />
        </a>
      </div>
    </section>
  );
}
