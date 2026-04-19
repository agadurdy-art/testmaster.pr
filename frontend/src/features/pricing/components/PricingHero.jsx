import React from 'react';

export default function PricingHero() {
  return (
    <section className="hero">
      <div className="container hero-inner">
        <div className="eyebrow">
          <span className="dot"></span>
          Honest pricing
          <span className="sep">·</span>
          <span>No subscriptions locked to you</span>
        </div>
        <h1 className="headline">
          Pay for exactly the <span className="under">days you need.</span>
        </h1>
        <p className="hero-sub">
          Your exam is in <span className="days">X days</span>? Pay for X days.
          That's it — no annual contracts, no surprise renewals, no
          gym-membership energy.
        </p>
      </div>
    </section>
  );
}
