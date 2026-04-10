import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { uploadBankPayment } from '../lib/api';
import { useI18n, LANGUAGES } from '../lib/i18n';
import { getPlanLabel, normalizePlanName, planMeetsMinimum } from '../lib/planAccess';
import { PayPalButtons } from '@paypal/react-paypal-js';
import {
  ArrowLeft, Check, X, Compass, BookOpen, Award, Crown, Building2, Mail, Globe, QrCode, Upload
} from 'lucide-react';

import qrExplorer from '../assets/payments/Single exam 120k.png';
import qrLearner from '../assets/payments/Starter plan 220k.png';
import qrAchiever from '../assets/payments/Booster plan 460k.png';
import qrMaster from '../assets/payments/Pro plan 700k.png';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const paypalClientId = process.env.REACT_APP_PAYPAL_CLIENT_ID;
const SUPPORT_EMAIL = 'support@testmaster.pro';

const QR_IMAGES = {
  explorer: qrExplorer,
  learner: qrLearner,
  achiever: qrAchiever,
  master: qrMaster,
};

const PAYPAL_PLAN_IDS = {
  explorer: 'P-01067231X8887700NNGUZXZI',
  learner: 'P-8PA72532LU348322JNGUZYWY',
  achiever: 'P-0BT993836S704213PNGUZZJQ',
  master: 'P-06T688388Y238120JNGUZZ4I',
};

export default function PricingPage({ user }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, language, setLanguage } = useI18n();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const fromFeature = searchParams.get('from');
  const currentPlan = normalizePlanName(user?.plan || 'free');

  const plans = [
    {
      id: 'explorer', name: t('planExplorer'), price: '$4.99', period: t('perMonth'),
      icon: Compass, color: 'from-sky-500 to-blue-600', cardBorder: 'border-sky-200',
      features: [
        { text: t('featAllStages'), included: true },
        { text: t('featVocabGames'), included: true },
        { text: t('featGrammar'), included: true },
        { text: t('featListeningReading'), included: true },
        { text: t('featPregenAudio'), included: true },
        { text: t('featSpeaking1'), included: true },
        { text: t('featLizTeacher'), included: false },
        { text: t('featMastery'), included: false },
      ],
    },
    {
      id: 'learner', name: t('planLearner'), price: '$9', period: t('perMonth'),
      icon: BookOpen, color: 'from-violet-500 to-purple-600', cardBorder: 'border-violet-200',
      features: [
        { text: t('featEverythingExplorer'), included: true, bold: true },
        { text: t('featLizPersonal'), included: true },
        { text: t('featMasteryIELTS'), included: true },
        { text: t('featSpeaking5'), included: true },
        { text: t('featWritingEval'), included: true },
        { text: t('featStudyPlans'), included: true },
        { text: t('featAdvancedMastery'), included: false },
      ],
    },
    {
      id: 'achiever', name: t('planAchiever'), price: '$19', period: t('perMonth'),
      icon: Award, color: 'from-amber-500 to-orange-600', cardBorder: 'border-amber-200',
      highlight: true,
      features: [
        { text: t('featEverythingLearner'), included: true, bold: true },
        { text: t('featAdvancedMasteryCourse'), included: true },
        { text: t('featUnlimitedSpeaking'), included: true },
        { text: t('featPronunciation'), included: true },
        { text: t('featUnlimitedLiz'), included: true },
        { text: t('featPriorityFeedback'), included: true },
      ],
    },
    {
      id: 'master', name: t('planMaster'), price: '$29', period: t('perMonth'),
      icon: Crown, color: 'from-rose-500 to-red-600', cardBorder: 'border-rose-200',
      features: [
        { text: t('featEverythingAchiever'), included: true, bold: true },
        { text: t('featSpeakingAgent'), included: true },
        { text: t('featUnlimitedSessions'), included: true },
        { text: t('featMockExam'), included: true },
        { text: t('featPrioritySupport'), included: true },
        { text: t('featEarlyAccess'), included: true },
      ],
    },
  ];

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
        await uploadBankPayment(formData);
        const updatedUser = { ...user, plan: normalizePlanName(selectedPlan.id), subscription: selectedPlan.name };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        alert(t('paymentSubmitted'));
        setBankModalOpen(false);
        navigate('/dashboard');
      } catch { alert(t('uploadFailed')); }
    };
    fileInput.click();
  };

  const isCurrentPlan = (planId) => currentPlan === planId;
  const isDowngrade = (planId) => !planMeetsMinimum(planId, currentPlan);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <header className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-white">{t('pricingTitle')}</h1>
            <p className="text-xs text-gray-400">{t('pricingSubtitle')}</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="relative">
              <Button
                variant="ghost"
                onClick={() => setLangOpen(!langOpen)}
                className="text-gray-400 hover:text-white gap-1.5"
                data-testid="language-selector-btn"
              >
                <Globe className="w-4 h-4" />
                <span className="text-xs">{LANGUAGES[language]}</span>
              </Button>
              {langOpen && (
                <div className="absolute right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
                  {Object.entries(LANGUAGES).map(([code, label]) => (
                    <button
                      key={code}
                      onClick={() => { setLanguage(code); setLangOpen(false); }}
                      data-testid={`lang-${code}`}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-700 transition-colors ${language === code ? 'text-white bg-gray-700' : 'text-gray-300'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="text-gray-400 hover:text-white"
              data-testid="back-to-dashboard-btn"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />{t('backToDashboard')}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {fromFeature && (
          <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
              <Award className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm text-amber-200">
              {t('upgradeToUnlock')} <span className="font-semibold text-amber-100">{fromFeature}</span>
            </p>
          </div>
        )}

        <div className="text-center mb-10">
          <p className="text-gray-400 text-sm mb-2">
            {t('currentlyOn')}: <span className="font-semibold text-white capitalize">{currentPlan === 'free' ? t('freeStageOnly') : getPlanLabel(currentPlan)}</span>
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">{t('levelUpEnglish')}</h2>
          <p className="text-gray-400 max-w-xl mx-auto text-sm">{t('allPlansMonthlyCancelAnytime')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5" data-testid="pricing-grid">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrent = isCurrentPlan(plan.id);
            const isDown = isDowngrade(plan.id);
            return (
              <Card
                key={plan.id}
                data-testid={`plan-card-${plan.id}`}
                className={`relative flex flex-col bg-gray-900/80 border rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${plan.highlight ? 'ring-2 ring-amber-400/60 ' + plan.cardBorder : 'border-gray-800'} ${isCurrent ? 'ring-2 ring-green-500/50' : ''}`}
              >
                {plan.highlight && <div className="absolute -top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500" />}
                {isCurrent && (
                  <div className="absolute top-3 right-3 px-2 py-0.5 bg-green-500/20 border border-green-500/30 rounded-full text-[10px] text-green-400 font-medium">
                    {t('currentPlanBadge')}
                  </div>
                )}
                <div className="p-5 flex-1">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-3 shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  <div className="mt-2 mb-4">
                    <span className="text-3xl font-bold text-white">{plan.price}</span>
                    <span className="text-gray-500 text-sm">{plan.period}</span>
                  </div>
                  <ul className="space-y-2.5">
                    {plan.features.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        {f.included ? <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" /> : <X className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />}
                        <span className={`${f.included ? 'text-gray-300' : 'text-gray-600'} ${f.bold ? 'font-semibold text-white' : ''}`}>{f.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-5 pt-0 space-y-2.5">
                  {isCurrent ? (
                    <Button disabled className="w-full bg-gray-800 text-gray-500 border-0 cursor-default">{t('currentPlanBtn')}</Button>
                  ) : isDown ? (
                    <Button disabled className="w-full bg-gray-800 text-gray-500 border-0 cursor-default">{t('downgradePlan')}</Button>
                  ) : (
                    <>
                      <Button
                        className={`w-full bg-gradient-to-r ${plan.color} text-white border-0 shadow-lg hover:opacity-90`}
                        onClick={() => handleOpenBankModal(plan)}
                        data-testid={`pay-bank-${plan.id}`}
                      >
                        <Building2 className="w-4 h-4 mr-2" />{t('payByBank')}
                      </Button>
                      {paypalClientId && PAYPAL_PLAN_IDS[plan.id] && (
                        <div data-testid={`paypal-btn-${plan.id}`}>
                          <PayPalButtons
                            style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'subscribe', height: 36 }}
                            createSubscription={(data, actions) => {
                              if (!user) { alert(t('pleaseLogIn')); throw new Error('No user'); }
                              return actions.subscription.create({ plan_id: PAYPAL_PLAN_IDS[plan.id] });
                            }}
                            onApprove={async (data) => {
                              if (!user) return;
                              try {
                                const res = await fetch(`${API_URL}/api/payments/paypal/activate-subscription`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ subscriptionId: data.subscriptionID, planId: plan.id, email: user.email }),
                                });
                                const result = await res.json();
                                if (res.ok) {
                                  const updatedUser = { ...user, plan: normalizePlanName(result.plan), subscription: result.subscription };
                                  localStorage.setItem('user', JSON.stringify(updatedUser));
                                  alert(t('subscriptionActivated') + ' ' + plan.name + '!');
                                  navigate('/dashboard');
                                } else { alert(result.detail || t('activationFailed')); }
                              } catch { alert(t('activationError')); }
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

        <div className="mt-10 p-5 bg-gray-900/50 border border-gray-800 rounded-2xl" data-testid="free-tier-info">
          <h3 className="text-white font-semibold mb-2">{t('freeAccountTitle')}</h3>
          <p className="text-gray-400 text-sm">{t('freeAccountDesc')}</p>
        </div>

        <div className="mt-8 text-center">
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-gray-500 hover:text-gray-300 text-sm inline-flex items-center gap-1">
            <Mail className="w-4 h-4" />{t('needHelp')}
          </a>
        </div>
      </main>

      <Dialog open={bankModalOpen} onOpenChange={setBankModalOpen}>
        <DialogContent className="max-w-md bg-gray-900 border-gray-700 p-0 overflow-hidden" data-testid="bank-modal">
          <div className="p-5 pb-3">
            <DialogHeader>
              <DialogTitle className="text-white text-lg">{t('bankModalTitle')}</DialogTitle>
              <DialogDescription className="text-gray-400 text-xs">{t('bankModalDesc')}</DialogDescription>
            </DialogHeader>
          </div>
          {selectedPlan && (
            <div className="px-5 pb-5 space-y-4">
              {/* QR Code - centered and prominent */}
              {QR_IMAGES[selectedPlan.id] && (
                <div className="flex justify-center">
                  <div className="bg-white rounded-2xl p-3 shadow-lg" data-testid="bank-qr-code">
                    <img
                      src={QR_IMAGES[selectedPlan.id]}
                      alt={`QR code for ${selectedPlan.name}`}
                      className="w-48 h-48 object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Plan + Account info row */}
              <div className="flex items-center gap-3">
                <div className="bg-gray-800 rounded-xl px-4 py-2 text-center flex-shrink-0">
                  <p className="text-2xl font-bold text-white">{selectedPlan.price}</p>
                  <p className="text-[11px] text-gray-400">{selectedPlan.name}</p>
                </div>
                <div className="text-xs space-y-1 text-gray-300 min-w-0">
                  <p><span className="font-semibold text-white">{t('bankAccountName')}:</span> OVEZDURDYYEV AGAGELDI</p>
                  <p><span className="font-semibold text-white">{t('bankAccountNumber')}:</span> 700036356609</p>
                  <p><span className="font-semibold text-white">{t('bankName')}:</span> Shinhan Vietnam</p>
                </div>
              </div>

              {/* Upload button */}
              <Button
                onClick={handleUploadScreenshot}
                className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0 h-10"
                data-testid="bank-upload-btn"
              >
                <Upload className="w-4 h-4 mr-2" />
                {t('bankUploadReceipt')}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
