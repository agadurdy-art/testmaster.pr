import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { uploadBankPayment } from '../lib/api';
import { useI18n } from '../lib/i18n';
import { PayPalButtons } from '@paypal/react-paypal-js';
import {
  ArrowLeft, Check, X, Compass, BookOpen, Award, Crown, Building2, Mail
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const paypalClientId = process.env.REACT_APP_PAYPAL_CLIENT_ID;
const SUPPORT_EMAIL = 'support@testmaster.pro';

// PayPal Subscription Plan IDs
const PAYPAL_PLAN_IDS = {
  explorer: 'P-01067231X8887700NNGUZXZI',
  learner: 'P-8PA72532LU348322JNGUZYWY',
  achiever: 'P-0BT993836S704213PNGUZZJQ',
  master: 'P-06T688388Y238120JNGUZZ4I',
};

const plans = [
  {
    id: 'explorer',
    name: 'Explorer',
    price: '$4.99',
    period: '/mo',
    icon: Compass,
    color: 'from-sky-500 to-blue-600',
    cardBorder: 'border-sky-200',
    features: [
      { text: 'All 8 Learning Stages (Pre-A1 to IELTS)', included: true },
      { text: 'Vocabulary games & flashcards', included: true },
      { text: 'Grammar exercises', included: true },
      { text: 'Listening & reading activities', included: true },
      { text: 'Pre-generated audio (ElevenLabs)', included: true },
      { text: '1 AI Speaking test / month', included: true },
      { text: 'Liz AI Teacher', included: false },
      { text: 'Mastery Course', included: false },
    ],
  },
  {
    id: 'learner',
    name: 'Learner',
    price: '$9',
    period: '/mo',
    icon: BookOpen,
    color: 'from-violet-500 to-purple-600',
    cardBorder: 'border-violet-200',
    features: [
      { text: 'Everything in Explorer', included: true, bold: true },
      { text: 'Liz AI Teacher (personal tutor)', included: true },
      { text: 'Mastery Course (IELTS prep)', included: true },
      { text: '5 AI Speaking tests / month', included: true },
      { text: 'Writing evaluation with AI', included: true },
      { text: 'Personalized study plans', included: true },
      { text: 'Advanced Mastery', included: false },
    ],
  },
  {
    id: 'achiever',
    name: 'Achiever',
    price: '$19',
    period: '/mo',
    icon: Award,
    color: 'from-amber-500 to-orange-600',
    cardBorder: 'border-amber-200',
    highlight: true,
    features: [
      { text: 'Everything in Learner', included: true, bold: true },
      { text: 'Advanced Mastery Course', included: true },
      { text: 'Unlimited AI Speaking tests', included: true },
      { text: 'Detailed pronunciation feedback', included: true },
      { text: 'Unlimited Liz AI messages', included: true },
      { text: 'Priority feedback', included: true },
    ],
  },
  {
    id: 'master',
    name: 'Master',
    price: '$29',
    period: '/mo',
    icon: Crown,
    color: 'from-rose-500 to-red-600',
    cardBorder: 'border-rose-200',
    features: [
      { text: 'Everything in Achiever', included: true, bold: true },
      { text: 'AI Speaking Agent (real-time)', included: true },
      { text: 'Unlimited speaking sessions', included: true },
      { text: 'Full mock exam mode', included: true },
      { text: 'Priority support', included: true },
      { text: 'Early access to new stages', included: true },
    ],
  },
];

export default function PricingPage({ user }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, language } = useI18n();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [bankModalOpen, setBankModalOpen] = useState(false);

  const fromFeature = searchParams.get('from');
  const currentPlan = user?.plan || 'free';

  const handleOpenBankModal = (plan) => {
    if (!user) { navigate('/'); return; }
    setSelectedPlan(plan);
    setBankModalOpen(true);
  };

  const handleUploadScreenshot = async () => {
    if (!user || !selectedPlan) return;
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = async () => {
      if (!fileInput.files || fileInput.files.length === 0) return;
      const file = fileInput.files[0];
      const formData = new FormData();
      formData.append('plan_id', selectedPlan.id);
      formData.append('email', user.email);
      formData.append('screenshot', file);
      try {
        const res = await uploadBankPayment(formData);
        const updatedUser = { ...user, plan: res.plan ?? selectedPlan.id, subscription: res.subscription ?? selectedPlan.name };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        alert('Payment submitted successfully!');
        setBankModalOpen(false);
        navigate('/dashboard');
      } catch (err) { alert('Upload failed. Please try again.'); }
    };
    fileInput.click();
  };

  const planTier = { free: 0, explorer: 1, learner: 2, achiever: 3, master: 4 };
  const isCurrentPlan = (planId) => currentPlan === planId;
  const isDowngrade = (planId) => (planTier[planId] || 0) < (planTier[currentPlan] || 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-white">Testmaster Plans</h1>
            <p className="text-xs text-gray-400">Choose the plan that fits your learning goals</p>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="text-gray-400 hover:text-white"
            data-testid="back-to-dashboard-btn"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />Back
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Upgrade prompt if coming from locked feature */}
        {fromFeature && (
          <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
              <Award className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm text-amber-200">
              Upgrade your plan to unlock <span className="font-semibold text-amber-100">{fromFeature}</span>
            </p>
          </div>
        )}

        {/* Free tier info */}
        <div className="text-center mb-10">
          <p className="text-gray-400 text-sm mb-2">
            Currently on: <span className="font-semibold text-white capitalize">{currentPlan === 'free' ? 'Free (Stage 1 only)' : currentPlan}</span>
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Level Up Your English</h2>
          <p className="text-gray-400 max-w-xl mx-auto text-sm">
            All plans include monthly billing. Cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5" data-testid="pricing-grid">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrent = isCurrentPlan(plan.id);
            const isDown = isDowngrade(plan.id);

            return (
              <Card
                key={plan.id}
                data-testid={`plan-card-${plan.id}`}
                className={`
                  relative flex flex-col bg-gray-900/80 border rounded-2xl overflow-hidden
                  transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl
                  ${plan.highlight ? 'ring-2 ring-amber-400/60 ' + plan.cardBorder : 'border-gray-800'}
                  ${isCurrent ? 'ring-2 ring-green-500/50' : ''}
                `}
              >
                {plan.highlight && (
                  <div className="absolute -top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
                )}
                {isCurrent && (
                  <div className="absolute top-3 right-3 px-2 py-0.5 bg-green-500/20 border border-green-500/30 rounded-full text-[10px] text-green-400 font-medium">
                    Current
                  </div>
                )}

                <div className="p-5 flex-1">
                  {/* Plan header */}
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-3 shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  <div className="mt-2 mb-4">
                    <span className="text-3xl font-bold text-white">{plan.price}</span>
                    <span className="text-gray-500 text-sm">{plan.period}</span>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2.5">
                    {plan.features.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        {f.included ? (
                          <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                        )}
                        <span className={`${f.included ? 'text-gray-300' : 'text-gray-600'} ${f.bold ? 'font-semibold text-white' : ''}`}>
                          {f.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action buttons */}
                <div className="p-5 pt-0 space-y-2.5">
                  {isCurrent ? (
                    <Button disabled className="w-full bg-gray-800 text-gray-500 border-0 cursor-default">
                      Current Plan
                    </Button>
                  ) : isDown ? (
                    <Button disabled className="w-full bg-gray-800 text-gray-500 border-0 cursor-default">
                      Downgrade
                    </Button>
                  ) : (
                    <>
                      <Button
                        className={`w-full bg-gradient-to-r ${plan.color} text-white border-0 shadow-lg hover:opacity-90`}
                        onClick={() => handleOpenBankModal(plan)}
                        data-testid={`pay-bank-${plan.id}`}
                      >
                        <Building2 className="w-4 h-4 mr-2" />Pay by Bank
                      </Button>
                      {paypalClientId && PAYPAL_PLAN_IDS[plan.id] && (
                        <div data-testid={`paypal-btn-${plan.id}`}>
                          <PayPalButtons
                            style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'subscribe', height: 36 }}
                            createSubscription={(data, actions) => {
                              if (!user) { alert('Please log in.'); throw new Error('No user'); }
                              return actions.subscription.create({
                                plan_id: PAYPAL_PLAN_IDS[plan.id],
                              });
                            }}
                            onApprove={async (data) => {
                              if (!user) return;
                              try {
                                const res = await fetch(`${API_URL}/api/payments/paypal/activate-subscription`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    subscriptionId: data.subscriptionID,
                                    planId: plan.id,
                                    email: user.email,
                                  }),
                                });
                                const result = await res.json();
                                if (res.ok) {
                                  const updatedUser = { ...user, plan: result.plan, subscription: result.subscription };
                                  localStorage.setItem('user', JSON.stringify(updatedUser));
                                  alert('Subscription activated! Welcome to ' + plan.name + '!');
                                  navigate('/dashboard');
                                } else {
                                  alert(result.detail || 'Activation failed');
                                }
                              } catch (err) {
                                alert('Error activating subscription. Please contact support.');
                              }
                            }}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Free tier comparison */}
        <div className="mt-10 p-5 bg-gray-900/50 border border-gray-800 rounded-2xl" data-testid="free-tier-info">
          <h3 className="text-white font-semibold mb-2">Free Account</h3>
          <p className="text-gray-400 text-sm">
            Everyone gets <span className="text-white font-medium">Stage 1 (Foundations)</span> completely free.
            Create an account and start learning immediately - no credit card required.
          </p>
        </div>

        <div className="mt-8 text-center">
          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=Help%20choosing%20a%20plan`}
            className="text-gray-500 hover:text-gray-300 text-sm inline-flex items-center gap-1"
          >
            <Mail className="w-4 h-4" />Need help? Contact support
          </a>
        </div>
      </main>

      {/* Bank Transfer Modal */}
      <Dialog open={bankModalOpen} onOpenChange={setBankModalOpen}>
        <DialogContent className="max-w-lg bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Bank Transfer</DialogTitle>
            <DialogDescription className="text-gray-400">Transfer the amount and upload your receipt</DialogDescription>
          </DialogHeader>
          {selectedPlan && (
            <div className="space-y-4 mt-2">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="w-full md:w-1/2 flex justify-center">
                  <div className="bg-gray-800 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-white">{selectedPlan.price}<span className="text-sm text-gray-400">/mo</span></p>
                    <p className="text-sm text-gray-400 mt-1">{selectedPlan.name} Plan</p>
                  </div>
                </div>
                <div className="w-full md:w-1/2 text-sm space-y-2 text-gray-300">
                  <p><span className="font-semibold text-white">Account:</span> OVEZDURDYYEV AGAGELDI</p>
                  <p><span className="font-semibold text-white">Number:</span> 700036356609</p>
                  <p><span className="font-semibold text-white">Bank:</span> Shinhan Vietnam</p>
                </div>
              </div>
              <div className="pt-2 flex justify-end">
                <Button
                  onClick={handleUploadScreenshot}
                  className="bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0"
                  data-testid="bank-upload-btn"
                >
                  Upload Payment Receipt
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
