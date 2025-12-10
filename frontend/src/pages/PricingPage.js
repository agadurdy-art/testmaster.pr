import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import LanguageSwitcher from '../components/LanguageSwitcher';

import { uploadBankPayment, createPaypalOrder, capturePaypalOrder } from '../lib/api';
import { useI18n } from '../lib/i18n';
import { PayPalButtons } from '@paypal/react-paypal-js';

const paypalClientId = process.env.REACT_APP_PAYPAL_CLIENT_ID;

const plans = [
  {
    id: 'single',
    name: 'Single Exam',
    nameVi: 'Một bài thi lẻ',
    badge: 'Flexible',
    badgeVi: 'Linh hoạt',
    priceUsd: '$4.99',
    priceVnd: '120,000 VND',
    credits: '1 × 10-minute AI Speaking Exam',
    creditsVi: '1 lần thi nói AI (10 phút)',
    features: ['Instant scoring', 'Band prediction', 'Feedback summary'],
    featuresVi: ['Chấm điểm ngay', 'Dự đoán band điểm', 'Tóm tắt phản hồi'],
    cta: 'Start Exam',
    ctaVi: 'Bắt đầu thi',
    qrUrl:
      'https://customer-assets.emergentagent.com/job_examprep-ai-14/artifacts/cofsn5nj_Single%20exam%20120k.png',
  },
  {
    id: 'starter',
    name: 'Starter Plan',
    nameVi: 'Gói Starter',
    badge: 'Flexible',
    badgeVi: 'Linh hoạt',
    priceUsd: '$9',
    priceVnd: '220,000 VND',
    credits: '2 Exam Credits / month',
    creditsVi: '2 lượt thi / tháng',
    features: ['Monthly renewal', 'Save 10% vs one-time'],
    featuresVi: ['Gia hạn hàng tháng', 'Tiết kiệm 10% so với mua lẻ'],
    cta: 'Get Starter',
    ctaVi: 'Chọn gói Starter',
    qrUrl:
      'https://customer-assets.emergentagent.com/job_examprep-ai-14/artifacts/e8sxtdif_Starter%20plan%20220k.png',
  },
  {
    id: 'booster',
    name: 'Booster Plan',
    nameVi: 'Gói Booster',
    badge: 'Best Value',
    badgeVi: 'Tiết kiệm nhất',
    priceUsd: '$19',
    priceVnd: '460,000 VND',
    credits: '5 Exam Credits / month',
    creditsVi: '5 lượt thi / tháng',
    features: ['Priority feedback', 'Detailed analytics'],
    featuresVi: ['Ưu tiên phản hồi', 'Phân tích chi tiết'],
    cta: 'Upgrade Now',
    ctaVi: 'Nâng cấp ngay',
    highlight: true,
    highlightLabel: '⭐ Most Popular – Save 25%!',
    highlightLabelVi: '⭐ Phổ biến nhất – Tiết kiệm 25%!',
    qrUrl:
      'https://customer-assets.emergentagent.com/job_examprep-ai-14/artifacts/5x2l7ngl_Booster%20plan%20460k.png',
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    nameVi: 'Gói Pro',
    badge: 'For Achievers',
    badgeVi: 'Cho người đặt mục tiêu cao',
    priceUsd: '$29',
    priceVnd: '700,000 VND',
    credits: '8 Exam Credits / month',
    creditsVi: '8 lượt thi / tháng',
    features: ['Full mock test mode', 'Speaking history tracking'],
    featuresVi: ['Chế độ thi thử đầy đủ', 'Theo dõi lịch sử thi nói'],
    cta: 'Go Pro',
    ctaVi: 'Chọn gói Pro',
    qrUrl:
      'https://customer-assets.emergentagent.com/job_examprep-ai-14/artifacts/8b84xnt3_Pro%20plan%20700k.png',
  },
];

export default function PricingPage({ user }) {
  const navigate = useNavigate();
  const { t, language } = useI18n();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [bankModalOpen, setBankModalOpen] = useState(false);

  const handleOpenBankModal = (plan) => {
    if (!user) {
      navigate('/');
      return;
    }
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
        const updatedUser = {
          ...user,
          examCredits: res.examCredits,
          plan: res.plan ?? user.plan,
          subscription: res.subscription ?? user.subscription,
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        alert(t('bankUploadSuccess'));
        setBankModalOpen(false);
      } catch (err) {
        console.error('Bank upload error', err);
        alert(t('bankUploadError'));
      }
    };

    fileInput.click();
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8]">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#05203C]">{t('pricingTitle')}</h1>
            <p className="text-sm text-gray-600">{t('pricingSubtitle')}</p>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher compact />
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              {t('backToDashboard')}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-[#05203C] mb-3">{t('aiSpeakingPlansTitle')}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-2">
            {t('aiSpeakingPlansSubtitle')}
          </p>
          <p className="text-xs text-[#D90732] font-semibold uppercase tracking-wide">
            {t('paypalBannerNote')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const isVi = language === 'vi';
            const displayName = isVi ? plan.nameVi : plan.name;
            const displayBadge = isVi ? plan.badgeVi : plan.badge;
            const displayCredits = isVi ? plan.creditsVi : plan.credits;
            const displayCta = isVi ? plan.ctaVi : plan.cta;
            const highlightLabel = isVi && plan.highlightLabelVi ? plan.highlightLabelVi : plan.highlightLabel;

            return (
              <Card
                key={plan.id}
                className={`relative p-6 flex flex-col justify-between bg-white border ${
                  plan.highlight ? 'border-[#D90732] shadow-lg scale-[1.02]' : 'border-gray-200 shadow-sm'
                }`}
              >
                {plan.highlight && highlightLabel && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#D90732] text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                    {highlightLabel}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-[#05203C]">{displayName}</h3>
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-[#F4F6F8] text-[#D90732]">
                      {displayBadge}
                    </span>
                  </div>

                  <div className="mb-2">
                    <p className="text-2xl font-bold text-[#05203C]">{plan.priceUsd}</p>
                    <p className="text-sm text-gray-600">{plan.priceVnd}</p>
                  </div>

                  <p className="text-sm font-semibold text-[#05203C] mb-2">{displayCredits}</p>

                  <ul className="text-sm text-gray-600 space-y-1 mb-4">
                    {(language === 'vi' ? plan.featuresVi : plan.features).map((f) => (
                      <li key={f}>• {f}</li>
                    ))}
                    <li>• Exam history &amp; feedback reports</li>
                  </ul>
                </div>

                <div className="space-y-2 mt-2">
                  <Button
                    className="w-full bg-[#D90732] text-white rounded-full hover:bg-red-700 transition-colors"
                    onClick={() => handleOpenBankModal(plan)}
                  >
                    {t('payByBank')}
                  </Button>

                  {paypalClientId ? (
                    !bankModalOpen && (
                      <div className="w-full space-y-2">
                      {/* Pay with PayPal button */}
                      <PayPalButtons
                        fundingSource="paypal"
                        style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'paypal' }}
                        createOrder={async () => {
                          if (!user) {
                            alert(
                              language === 'vi'
                                ? 'Vui lòng đăng nhập trước khi thanh toán bằng PayPal.'
                                : 'Please log in before completing a PayPal payment.',
                            );
                            throw new Error('No user for PayPal payment');
                          }
                          try {
                            const res = await createPaypalOrder({
                              planId: plan.id,
                              email: user.email,
                            });
                            return res.orderId;
                          } catch (err) {
                            console.error('PayPal create-order error', err);
                            alert(
                              language === 'vi'
                                ? 'Không thể khởi tạo thanh toán PayPal. Vui lòng thử lại hoặc dùng chuyển khoản ngân hàng.'
                                : 'Could not start PayPal payment. Please try again or use bank transfer.',
                            );
                            throw err;
                          }
                        }}
                        onApprove={async (data) => {
                          if (!user) return;
                          try {
                            const res = await capturePaypalOrder({
                              orderId: data.orderID,
                              planId: plan.id,
                              email: user.email,
                            });
                            const updatedUser = {
                              ...user,
                              examCredits: res.examCredits,
                              plan: res.plan ?? user.plan,
                              subscription: res.subscription ?? user.subscription,
                            };
                            localStorage.setItem('user', JSON.stringify(updatedUser));
                            alert(
                              language === 'vi'
                                ? 'Thanh toán PayPal thành công. Lượt thi của bạn đã được cập nhật.'
                                : 'PayPal payment successful. Your speaking credits have been updated.',
                            );
                          } catch (err) {
                            console.error('PayPal capture error', err);
                            alert(
                              language === 'vi'
                                ? 'Không thể xử lý thanh toán PayPal. Vui lòng thử lại hoặc dùng chuyển khoản ngân hàng.'
                                : 'Could not process PayPal payment. Please try again or use bank transfer.',
                            );
                          }
                        }}
                      />

                      {/* Debit or Credit Card button (still via PayPal) */}
                      <PayPalButtons
                        fundingSource="card"
                        style={{ layout: 'vertical', color: 'black', shape: 'rect', label: 'pay' }}
                        createOrder={async () => {
                          if (!user) {
                            alert(
                              language === 'vi'
                                ? 'Vui lòng đăng nhập trước khi thanh toán bằng PayPal.'
                                : 'Please log in before completing a PayPal payment.',
                            );
                            throw new Error('No user for PayPal payment');
                          }
                          try {
                            const res = await createPaypalOrder({
                              planId: plan.id,
                              email: user.email,
                            });
                            return res.orderId;
                          } catch (err) {
                            console.error('PayPal create-order error', err);
                            alert(
                              language === 'vi'
                                ? 'Không thể khởi tạo thanh toán PayPal. Vui lòng thử lại hoặc dùng chuyển khoản ngân hàng.'
                                : 'Could not start PayPal payment. Please try again or use bank transfer.',
                            );
                            throw err;
                          }
                        }}
                        onApprove={async (data) => {
                          if (!user) return;
                          try {
                            const res = await capturePaypalOrder({
                              orderId: data.orderID,
                              planId: plan.id,
                              email: user.email,
                            });
                            const updatedUser = {
                              ...user,
                              examCredits: res.examCredits,
                              plan: res.plan ?? user.plan,
                              subscription: res.subscription ?? user.subscription,
                            };
                            localStorage.setItem('user', JSON.stringify(updatedUser));
                            alert(
                              language === 'vi'
                                ? 'Thanh toán bằng thẻ thành công. Lượt thi của bạn đã được cập nhật.'
                                : 'Card payment successful. Your speaking credits have been updated.',
                            );
                          } catch (err) {
                            console.error('PayPal card capture error', err);
                            alert(
                              language === 'vi'
                                ? 'Không thể xử lý thanh toán thẻ. Vui lòng thử lại hoặc dùng chuyển khoản ngân hàng.'
                                : 'Could not process card payment. Please try again or use bank transfer.',
                            );
                          }
                        }}
                      />

                      <p className="text-[10px] text-gray-500 text-center">
                        {t('paypalNote')}<br />
                        <span className="font-medium">Powered by PayPal. International cards accepted.</span>
                      </p>
                    </div>
                  ) : (
                    <>
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
                        {t('payByCardPaypal')}
                      </Button>
                      <p className="text-[10px] text-gray-500 text-center">{t('paypalNote')}</p>
                    </>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </main>

      <Dialog open={bankModalOpen} onOpenChange={setBankModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('bankModalTitle')}</DialogTitle>
            <DialogDescription>{t('bankInstructions')}</DialogDescription>
          </DialogHeader>
          {selectedPlan && (
            <div className="space-y-4 mt-2">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="w-full md:w-1/2 flex justify-center">
                  <img
                    src={selectedPlan.qrUrl}
                    alt={`QR ${selectedPlan.name}`}
                    className="max-h-64 w-auto rounded-md border border-gray-200 bg-white"
                  />
                </div>
                <div className="w-full md:w-1/2 text-sm space-y-1">
                  <p>
                    <span className="font-semibold">{t('bankPlan')}:</span>{' '}
                    {language === 'vi' ? selectedPlan.nameVi : selectedPlan.name}
                  </p>
                  <p>
                    <span className="font-semibold">{t('bankAmount')}:</span> {selectedPlan.priceVnd}
                  </p>
                  <p>
                    <span className="font-semibold">{t('bankAccountName')}:</span> OVEZDURDYYEV AGAGELDI
                  </p>
                  <p>
                    <span className="font-semibold">{t('bankAccountNumber')}:</span> 700036356609
                  </p>
                  <p>
                    <span className="font-semibold">{t('bankName')}:</span> Ngân hàng TNHH MTV Shinhan Việt Nam
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button onClick={handleUploadScreenshot} className="bg-[#D90732] text-white hover:bg-red-700">
                  {t('bankIHavePaid')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
