import React from 'react';
import ArrowRightIcon from './ArrowRightIcon';

export default function PricingTeaser() {
  return (
    <section id="pricing" style={{ paddingTop: 0 }}>
      <div className="container">
        <div className="price-teaser">
          <div>
            <div className="headline-sm">
              Starts at <span className="amt">$2.99</span>/week.
            </div>
            <div className="sub-sm">
              Unlimited evaluations, mock tests, and Liz coaching. Cancel anytime.
            </div>
            <span className="compare-chip">Less than half the price of leading AI IELTS platforms</span>
          </div>
          <a href="/pricing" className="btn btn-outline btn-lg">
            See all plans
            <ArrowRightIcon size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}
