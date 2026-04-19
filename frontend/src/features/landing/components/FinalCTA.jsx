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
        <p>See three real student essays evaluated at band 5, 6.5, and 8 — every comment, every rewrite, exactly what students receive.</p>
        <a href="/samples/writing/band-6-5-task2" className="btn btn-primary btn-xl">
          See a sample evaluation
          <ArrowRightIcon size={16} />
        </a>
      </div>
    </section>
  );
}
