import React from 'react';

export default function PaymentRow() {
  return (
    <section style={{ paddingTop: 16 }}>
      <div className="container">
        <div className="pay-row">
          <div className="pay-methods">
            <div className="pay-method">
              <span className="pm-logo pm-paypal">
                Pay<b>Pal</b>
              </span>
              PayPal
            </div>
            <div className="pay-method">
              <span className="pm-logo pm-sepay">SE</span>
              SEPay · Vietnam bank transfer
            </div>
          </div>
          <div className="pay-note">
            <span className="lock">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
            <span>
              Secure checkout. Cancel anytime.
              <br />
              7-day money-back guarantee.
            </span>
          </div>
        </div>
        <div className="region-callout">
          <span className="flag">★</span>
          <span className="txt">
            <b>Paying from Vietnam?</b> Use SEPay to transfer directly from
            Vietcombank, Techcombank, MB Bank, and 30+ more — no FX fee, no card
            needed.
          </span>
        </div>
      </div>
    </section>
  );
}
