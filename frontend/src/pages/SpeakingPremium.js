import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Sparkles, MessageCircle, ArrowRight, Minus, Plus } from 'lucide-react';
import { PayPalButtons } from '@paypal/react-paypal-js';
import MockExamFlow from '../features/speaking/components/MockExamFlow';
import { isAdminUser } from '../lib/planAccess';
import '../features/speaking/speaking.css';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const paypalClientId = process.env.REACT_APP_PAYPAL_CLIENT_ID;
const MOCK_CREDIT_PRICE = 3; // USD per Full Mock Test credit

/**
 * Full Mock Test — one continuous ElevenLabs conversation with Liz, graded
 * holistically. Credit-gated: each mock costs one $3 credit (admins run free).
 * No credits → a $3-package purchase panel (buy as many as you want).
 * (Renamed from "Liz Examiner" / speaking-premium; mounted at /full-mock.)
 */
export default function SpeakingPremium({ user }) {
  const navigate = useNavigate();

  if (!user) {
    navigate('/');
    return null;
  }

  const credits = Number(user?.mockCredits || 0);
  const canRun = isAdminUser(user) || credits >= 1;

  if (canRun) {
    return (
      <div className="speaking-scope">
        <MockExamFlow user={user} onExit={() => navigate('/dashboard')} />
      </div>
    );
  }

  return <MockCreditPurchase user={user} onBack={() => navigate('/dashboard')} />;
}

function MockCreditPurchase({ user, onBack }) {
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const clamp = (n) => Math.max(1, Math.min(50, n));
  const total = (qty * MOCK_CREDIT_PRICE).toFixed(2);

  return (
    <div className="min-h-screen bg-slate-50 px-5 sm:px-8 py-12 md:py-20">
      <div className="mx-auto max-w-2xl">
        <button type="button" onClick={onBack} className="text-[13px] text-slate-500 hover:text-slate-700 mb-6">
          ← Back
        </button>

        <div className="rounded-3xl border border-slate-200 bg-white shadow-[0_24px_48px_-32px_rgba(15,23,42,0.25)] overflow-hidden">
          <div className="relative bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 px-6 sm:px-10 py-10 text-white">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-3 py-1 text-[12px] font-medium">
              <Sparkles className="w-3.5 h-3.5" /> Full Mock Test · ElevenLabs
            </div>
            <h1 className="mt-4 text-[28px] sm:text-[34px] leading-tight font-semibold tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              A full IELTS Speaking mock with Liz.
            </h1>
            <p className="mt-3 max-w-xl text-white/85 text-[15px] leading-relaxed">
              One continuous 12–14 minute exam — Parts 1, 2 and 3 live with Liz,
              then a holistic band with full feedback. Each mock is one credit.
            </p>
          </div>

          <div className="px-6 sm:px-10 py-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
              <Feature icon={<MessageCircle className="w-4 h-4" />} title="Live exam" desc="Liz runs all three parts back-to-back, like the real test." />
              <Feature icon={<Mic className="w-4 h-4" />} title="Holistic band" desc="One calibrated band across the whole performance." />
              <Feature icon={<Sparkles className="w-4 h-4" />} title="Full feedback" desc="Strengths, fixes and the transcript, saved to My results." />
            </div>

            {/* Quantity → $3 each */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 px-5 py-5">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="text-[12px] uppercase tracking-wider text-slate-500 font-medium">Full Mock credits</div>
                  <div className="text-[15px] font-medium text-slate-800">${MOCK_CREDIT_PRICE} each · 1 credit = 1 mock</div>
                </div>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setQty((n) => clamp(n - 1))} className="w-9 h-9 grid place-items-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50" aria-label="Fewer">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center text-lg font-bold text-slate-900">{qty}</span>
                  <button type="button" onClick={() => setQty((n) => clamp(n + 1))} className="w-9 h-9 grid place-items-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50" aria-label="More">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-[13px] text-slate-500">Total</span>
                <span className="text-xl font-bold text-slate-900">${total}</span>
              </div>

              <div className="mt-5">
                {paypalClientId ? (
                  <PayPalButtons
                    style={{ layout: 'vertical', color: 'gold', shape: 'pill', label: 'pay', height: 42 }}
                    disabled={busy}
                    forceReRender={[qty]}
                    createOrder={async () => {
                      const res = await fetch(`${API_URL}/api/payments/paypal/create-order`, {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ planId: 'mock_credits', email: user.email, quantity: qty }),
                      });
                      const data = await res.json();
                      if (!res.ok) throw new Error(data.detail || 'Failed to create order');
                      return data.orderId;
                    }}
                    onApprove={async (data) => {
                      setBusy(true);
                      const res = await fetch(`${API_URL}/api/payments/paypal/capture-order`, {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ orderId: data.orderID, planId: 'mock_credits', email: user.email, quantity: qty }),
                      });
                      const result = await res.json();
                      setBusy(false);
                      if (res.ok) {
                        const bal = result.mock_credits_balance ?? ((Number(user?.mockCredits || 0)) + qty);
                        try {
                          const u = { ...user, mockCredits: bal };
                          localStorage.setItem('user', JSON.stringify(u));
                        } catch (_) { /* non-fatal */ }
                        alert(`${qty} Full Mock credit${qty !== 1 ? 's' : ''} added. Starting your mock…`);
                        window.location.reload();
                      } else {
                        alert(result.detail || 'Payment capture failed');
                      }
                    }}
                  />
                ) : (
                  <button type="button" onClick={() => (window.location.href = '/pricing/v2')} className="w-full inline-flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-[14px] px-5 py-3 rounded-xl">
                    See plans & pricing <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="mt-6 text-center text-[13px] text-slate-500">
              Just want to practise?{' '}
              <a href="/question-bank/speaking" className="text-slate-700 underline underline-offset-2 hover:text-slate-900">
                Parts-based Speaking Practice is included →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, title, desc }) {
  return (
    <div>
      <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 mb-2">
        {icon}
      </div>
      <div className="text-[14px] font-semibold text-slate-900">{title}</div>
      <div className="mt-1 text-[13px] text-slate-600 leading-relaxed">{desc}</div>
    </div>
  );
}
