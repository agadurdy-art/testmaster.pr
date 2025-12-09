import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';


const plans = [
  {
    id: 'single',
    name: 'Single Exam',
    badge: 'Flexible',
    priceUsd: '$4.99',
    priceVnd: '120,000 VND',
    credits: '1 × 10-minute AI Speaking Exam',
    features: [
      'Instant scoring',
      'Band prediction',
      'Feedback summary',
    ],
    cta: 'Start Exam',
  },
  {
    id: 'starter',
    name: 'Starter Plan',
    badge: 'Flexible',
    priceUsd: '$9',
    priceVnd: '220,000 VND',
    credits: '2 Exam Credits / month',
    features: [
      'Monthly renewal',
      'Save 10% vs one-time',
    ],
    cta: 'Get Starter',
  },
  {
    id: 'booster',
    name: 'Booster Plan',
    badge: 'Best Value',
    priceUsd: '$19',
    priceVnd: '460,000 VND',
    credits: '5 Exam Credits / month',
    features: [
      'Priority feedback',
      'Detailed analytics',
    ],
    cta: 'Upgrade Now',
    highlight: true,
    highlightLabel: '⭐ Most Popular – Save 25%!',
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    badge: 'For Achievers',
    priceUsd: '$29',
    priceVnd: '700,000 VND',
    credits: '8 Exam Credits / month',
    features: [
      'Full mock test mode',
      'Speaking history tracking',
    ],
    cta: 'Go Pro',
  },
];

export default function PricingPage({ user }) {
  const navigate = useNavigate();
  const handleCheckout = (planId, amountVnd) => {
    if (!user) {
      navigate('/');
      return;
    }

    alert(
      'Bank transfer option is temporarily disabled. Please use PayPal for card payments, or contact admin for manual bank transfer.',
    );
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8]">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#05203C]">IELTS Ace Pricing</h1>
            <p className="text-sm text-gray-600">Choose the plan that fits your speaking goals.</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-[#05203C] mb-3">AI Speaking Exam Plans</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-2">
            Practice real IELTS-style speaking exams with AI examiner feedback. Prices shown in both USD and VND.
          </p>
          <p className="text-xs text-[#D90732] font-semibold uppercase tracking-wide">
            Pay by card or PayPal. Auto top-up is enabled when your PayPal email matches your IELTS Ace email.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative p-6 flex flex-col justify-between bg-white border ${
                plan.highlight ? 'border-[#D90732] shadow-lg scale-[1.02]' : 'border-gray-200 shadow-sm'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#D90732] text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                  ⭐ Most Popular – Save 25%!
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-[#05203C]">{plan.name}</h3>
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-[#F4F6F8] text-[#D90732]">
                    {plan.badge}
                  </span>
                </div>

                <div className="mb-2">
                  <p className="text-2xl font-bold text-[#05203C]">{plan.priceUsd}</p>
                  <p className="text-sm text-gray-600">{plan.priceVnd}</p>
                </div>

                <p className="text-sm font-semibold text-[#05203C] mb-2">{plan.credits}</p>

                <ul className="text-sm text-gray-600 space-y-1 mb-4">
                  {plan.features.map((f) => (
                    <li key={f}>• {f}</li>
                  ))}
                  <li>• Exam history & feedback reports</li>
                </ul>
              </div>

              <div className="space-y-2 mt-2">
                <Button
                  className="w-full bg-[#D90732] text-white rounded-full hover:bg-red-700 transition-colors"
                  onClick={() => handleCheckout(plan.id, parseInt(plan.priceVnd.replace(/[^0-9]/g, ''), 10))}
                >
                  Pay by Bank Transfer (Vietnam)
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-[#003087] text-[#003087] hover:bg-[#E6F0FF] rounded-full text-xs"
                  onClick={() => {
                    let url = '';
                    if (plan.id === 'single') {
                      url = 'https://www.paypal.com/ncp/payment/2DETEUHX9892L';
                    } else if (plan.id === 'starter') {
                      url = 'https://www.paypal.com/ncp/payment/6SY2PSQA8BW84';
                    } else if (plan.id === 'booster') {
                      url = 'https://www.paypal.com/ncp/payment/PWBH852KJJLS8';
                    } else if (plan.id === 'pro') {
                      url = 'https://www.paypal.com/ncp/payment/NUBF9QDT9RMBC';
                    }
                    if (url) {
                      window.open(url, '_blank', 'noopener,noreferrer');
                    }
                  }}
                >
                  Pay by Card / PayPal
                </Button>
                <p className="text-[10px] text-gray-500 text-center">
                  Please use the same email on PayPal as you used to register on IELTS Ace so your credits can be added automatically.
                </p>
              </div>
            </Card>
          ))}
        </div>
      </main>

    </div>
  );
}
