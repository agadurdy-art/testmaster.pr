import React from 'react';
import ArrowRightIcon from './ArrowRightIcon';

export default function PricingFinalBanner() {
  return (
    <section style={{ paddingTop: 16 }}>
      <div className="container">
        <div className="final-banner">
          <div className="fb-text">
            <h3>
              Not sure yet? <span className="em">Try a sample report first.</span>
            </h3>
            <p>
              See exactly what our feedback looks like on a real Band 6.5 Task 2
              essay — every comment, every rewrite, every criterion score.
            </p>
          </div>
          <a href="/samples/writing/band-6-5-task2" className="btn btn-primary btn-xl">
            View sample report
            <ArrowRightIcon />
          </a>
        </div>
      </div>
    </section>
  );
}
