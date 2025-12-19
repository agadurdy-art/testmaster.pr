import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { uploadBankPayment, createPaypalOrder, capturePaypalOrder } from '../lib/api';
import { useI18n } from '../lib/i18n';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { ArrowLeft, Check, Sparkles, Crown, Zap, Star, Building2, Mic } from 'lucide-react';

const paypalClientId = process.env.REACT_APP_PAYPAL_CLIENT_ID;

const plans = [
  { id: 'single', name: 'Single Exam', nameVi: 'Một bài thi lẻ', badge: 'Flexible', badgeVi: 'Linh hoạt', priceUsd: '$4.99', priceVnd: '120,000 VND', credits: '1 × 10-minute AI Speaking Exam', creditsVi: '1 lần thi nói AI (10 phút)', features: ['Instant scoring', 'Band prediction', 'Feedback summary'], featuresVi: ['Chấm điểm ngay', 'Dự đoán band điểm', 'Tóm tắt phản hồi'], cta: 'Start Exam', ctaVi: 'Bắt đầu thi', color: 'bg-blue-500', lightBg: 'bg-blue-50', icon: Zap, qrUrl: 'https://customer-assets.emergentagent.com/job_examprep-ai-14/artifacts/cofsn5nj_Single%20exam%20120k.png' },
  { id: 'starter', name: 'Starter Plan', nameVi: 'Gói Starter', badge: 'Popular', badgeVi: 'Phổ biến', priceUsd: '$9', priceVnd: '220,000 VND', credits: '2 Exam Credits / month', creditsVi: '2 lượt thi / tháng', features: ['Monthly renewal', 'Save 10% vs one-time'], featuresVi: ['Gia hạn hàng tháng', 'Tiết kiệm 10% so với mua lẻ'], cta: 'Get Starter', ctaVi: 'Chọn gói Starter', color: 'bg-purple-500', lightBg: 'bg-purple-50', icon: Star, qrUrl: 'https://customer-assets.emergentagent.com/job_examprep-ai-14/artifacts/e8sxtdif_Starter%20plan%20220k.png' },
  { id: 'booster', name: 'Booster Plan', nameVi: 'Gói Booster', badge: 'Best Value', badgeVi: 'Tiết kiệm nhất', priceUsd: '$19', priceVnd: '460,000 VND', credits: '5 Exam Credits / month', creditsVi: '5 lượt thi / tháng', features: ['Priority feedback', 'Detailed analytics', 'Save 25%'], featuresVi: ['Ưu tiên phản hồi', 'Phân tích chi tiết', 'Tiết kiệm 25%'], cta: 'Upgrade Now', ctaVi: 'Nâng cấp ngay', highlight: true, color: 'bg-gradient-to-r from-violet-500 to-purple-600', lightBg: 'bg-violet-50', icon: Crown, qrUrl: 'https://customer-assets.emergentagent.com/job_examprep-ai-14/artifacts/5x2l7ngl_Booster%20plan%20460k.png' },
  { id: 'pro', name: 'Pro Plan', nameVi: 'Gói Pro', badge: 'Premium', badgeVi: 'Cao cấp', priceUsd: '$29', priceVnd: '700,000 VND', credits: '8 Exam Credits / month', creditsVi: '8 lượt thi / tháng', features: ['Full mock test mode', 'Speaking history tracking', 'Priority support'], featuresVi: ['Chế độ thi thử đầy đủ', 'Theo dõi lịch sử thi nói', 'Hỗ trợ ưu tiên'], cta: 'Go Pro', ctaVi: 'Chọn gói Pro', color: 'bg-orange-500', lightBg: 'bg-orange-50', icon: Sparkles, qrUrl: 'https://customer-assets.emergentagent.com/job_examprep-ai-14/artifacts/8b84xnt3_Pro%20plan%20700k.png' }
];

export default function PricingPage({ user }) {
  const navigate = useNavigate();
  const { t, language } = useI18n();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [bankModalOpen, setBankModalOpen] = useState(false);

  const handleOpenBankModal = (plan) => { if (!user) { navigate('/'); return; } setSelectedPlan(plan); setBankModalOpen(true); };

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
        const updatedUser = { ...user, examCredits: res.examCredits, plan: res.plan ?? user.plan, subscription: res.subscription ?? user.subscription };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        alert(t('bankUploadSuccess'));
        setBankModalOpen(false);
      } catch (err) { alert(t('bankUploadError')); }
    };
    fileInput.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-violet-50/30 to-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('pricingTitle')}</h1>
            <p className="text-sm text-gray-500">{t('pricingSubtitle')}</p>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher compact />
            <Button variant="ghost" onClick={() => navigate('/dashboard')} className="text-gray-600 hover:text-violet-600"><ArrowLeft className="w-4 h-4 mr-2" />{t('backToDashboard')}</Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Title */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 text-violet-700 text-sm font-medium mb-6"><Crown className="w-4 h-4" /><span>Unlock Premium Features</span></div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('aiSpeakingPlansTitle')}</h2>
          <p className="text-gray-500 max-w-2xl mx-auto mb-4">{t('aiSpeakingPlansSubtitle')}</p>
          <p className="text-sm text-violet-600 font-medium">{t('paypalBannerNote')}</p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const isVi = language === 'vi';
            const displayName = isVi ? plan.nameVi : plan.name;
            const displayBadge = isVi ? plan.badgeVi : plan.badge;
            const displayCredits = isVi ? plan.creditsVi : plan.credits;
            const Icon = plan.icon;
            return (
              <Card key={plan.id} className={`relative p-6 flex flex-col justify-between bg-white border-0 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl rounded-2xl ${plan.highlight ? 'ring-2 ring-violet-400 scale-[1.02]' : ''}`}>
                {plan.highlight && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-semibold px-4 py-1 rounded-full shadow-lg">⭐ Most Popular</div>}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl ${plan.color} flex items-center justify-center shadow-lg`}><Icon className="w-6 h-6 text-white" /></div>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-600">{displayBadge}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{displayName}</h3>
                  <div className="mb-4"><p className="text-3xl font-bold text-gray-900">{plan.priceUsd}</p><p className="text-sm text-gray-500">{plan.priceVnd}</p></div>
                  <p className="text-sm font-medium text-violet-600 mb-4">{displayCredits}</p>
                  <ul className="space-y-2 mb-6">
                    {(isVi ? plan.featuresVi : plan.features).map((f, idx) => <li key={idx} className="flex items-center gap-2 text-sm text-gray-600"><Check className="w-4 h-4 text-green-500 flex-shrink-0" />{f}</li>)}
                    <li className="flex items-center gap-2 text-sm text-gray-600"><Check className="w-4 h-4 text-green-500" />Exam history &amp; feedback</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <Button className={`w-full ${plan.highlight ? 'bg-gradient-to-r from-violet-500 to-purple-600' : plan.color} text-white border-0 shadow-lg`} onClick={() => handleOpenBankModal(plan)}><Building2 className="w-4 h-4 mr-2" />{t('payByBank')}</Button>
                  {paypalClientId && !bankModalOpen && (
                    <PayPalButtons style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'paypal', height: 40 }}
                      createOrder={async () => { if (!user) { alert(isVi ? 'Vui lòng đăng nhập.' : 'Please log in.'); throw new Error('No user'); } const res = await createPaypalOrder({ planId: plan.id, email: user.email }); return res.orderId; }}
                      onApprove={async (data) => { if (!user) return; const res = await capturePaypalOrder({ orderId: data.orderID, planId: plan.id, email: user.email }); const updatedUser = { ...user, examCredits: res.examCredits, plan: res.plan ?? user.plan }; localStorage.setItem('user', JSON.stringify(updatedUser)); alert(isVi ? 'Thanh toán thành công!' : 'Payment successful!'); }}
                    />
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center"><p className="text-gray-500 text-sm">Need help choosing? <button className="text-violet-600 hover:underline">Contact support</button></p></div>
      </main>

      {/* Bank Modal */}
      <Dialog open={bankModalOpen} onOpenChange={setBankModalOpen}>
        <DialogContent className="max-w-lg bg-white border-gray-200">
          <DialogHeader><DialogTitle className="text-gray-900">{t('bankModalTitle')}</DialogTitle><DialogDescription className="text-gray-500">{t('bankInstructions')}</DialogDescription></DialogHeader>
          {selectedPlan && (
            <div className="space-y-4 mt-2">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="w-full md:w-1/2 flex justify-center"><img src={selectedPlan.qrUrl} alt={`QR ${selectedPlan.name}`} className="max-h-64 w-auto rounded-lg border border-gray-200 bg-white p-2" /></div>
                <div className="w-full md:w-1/2 text-sm space-y-2 text-gray-600">
                  <p><span className="font-semibold text-gray-900">{t('bankPlan')}:</span> {language === 'vi' ? selectedPlan.nameVi : selectedPlan.name}</p>
                  <p><span className="font-semibold text-gray-900">{t('bankAmount')}:</span> {selectedPlan.priceVnd}</p>
                  <p><span className="font-semibold text-gray-900">{t('bankAccountName')}:</span> OVEZDURDYYEV AGAGELDI</p>
                  <p><span className="font-semibold text-gray-900">{t('bankAccountNumber')}:</span> 700036356609</p>
                  <p><span className="font-semibold text-gray-900">{t('bankName')}:</span> Ngân hàng TNHH MTV Shinhan Việt Nam</p>
                </div>
              </div>
              <div className="pt-2 flex justify-end"><Button onClick={handleUploadScreenshot} className="bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0">{t('bankIHavePaid')}</Button></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
