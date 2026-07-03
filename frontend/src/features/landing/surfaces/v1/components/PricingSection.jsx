// PricingSection — the Pricing section, verbatim from pages/LandingPage.js lines 930-1003
// (Faz1 wave 10). Closed-over values arrive as same-named props. NOTE: `setIsLogin` is a
// pre-existing dangling reference in the original (no such state exists on the page —
// vestigial from an older [isLogin, setIsLogin] state shape; the plan-button click threw
// in the original too, after setShowAuth(true) opened the dialog). Kept verbatim; it
// arrives as an always-undefined prop.
import React from 'react';
import { Button } from '../../../../../components/ui/button';
import { Target, BookOpen, Award, Trophy, CheckCircle } from 'lucide-react';

export default function PricingSection({ getText, setShowAuth, setIsLogin }) {
  return (
      <section id="pricing" className="py-20 px-6 bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              {getText('Choose Your Learning Plan', 'Chọn gói học tập', 'Öğrenme Planınızı Seçin')}
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              {getText('Start free with Stage 1. Upgrade anytime to unlock more.', 'Bắt đầu miễn phí với Giai đoạn 1.', 'Stage 1 ile ücretsiz başlayın. Daha fazlası için yükseltin.')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { name: 'Explorer', price: '$4.99', period: '/mo', color: 'from-sky-500 to-blue-600', border: 'border-sky-500/30', features: [
                getText('All 8 Learning Stages', 'Tất cả 8 giai đoạn', 'Tüm 8 Öğrenme Aşaması'),
                getText('Vocabulary & grammar games', 'Trò chơi từ vựng', 'Kelime & dilbilgisi oyunları'),
                getText('Listening & reading', 'Nghe & đọc', 'Dinleme & okuma'),
                getText('1 AI Speaking test/mo', '1 bài kiểm tra nói AI', '1 AI Konuşma testi/ay'),
              ]},
              { name: 'Learner', price: '$9', period: '/mo', color: 'from-violet-500 to-purple-600', border: 'border-violet-500/30', features: [
                getText('Everything in Explorer', 'Tất cả trong Explorer', 'Explorer dahil'),
                getText('Liz AI Teacher', 'Giáo viên AI Liz', 'Liz AI Öğretmen'),
                getText('Mastery Course (IELTS)', 'Khóa Mastery', 'Mastery Kursu (IELTS)'),
                getText('5 AI Speaking tests/mo', '5 bài kiểm tra nói AI', '5 AI Konuşma testi/ay'),
              ]},
              { name: 'Achiever', price: '$19', period: '/mo', color: 'from-amber-500 to-orange-600', border: 'border-amber-400/40', highlight: true, features: [
                getText('Everything in Learner', 'Tất cả trong Learner', 'Learner dahil'),
                getText('Advanced Mastery', 'Mastery nâng cao', 'İleri Mastery'),
                getText('Unlimited Speaking tests', 'Không giới hạn nói', 'Sınırsız Konuşma testi'),
                getText('Unlimited Liz messages', 'Tin nhắn Liz không giới hạn', 'Sınırsız Liz mesajı'),
              ]},
              { name: 'Master', price: '$29', period: '/mo', color: 'from-rose-500 to-red-600', border: 'border-rose-500/30', features: [
                getText('Everything in Achiever', 'Tất cả trong Achiever', 'Achiever dahil'),
                getText('AI Speaking Agent', 'Tác nhân nói AI', 'AI Konuşma Ajanı'),
                getText('Full mock exam mode', 'Chế độ thi thử', 'Tam sınav modu'),
                getText('Priority support', 'Hỗ trợ ưu tiên', 'Öncelikli destek'),
              ]},
            ].map((plan, idx) => (
              <div
                key={idx}
                className={`relative bg-gray-900/80 border rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-2xl ${plan.highlight ? 'ring-2 ring-amber-400/60 ' + plan.border : 'border-gray-800'}`}
              >
                {plan.highlight && <div className="absolute -top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-t-2xl" />}
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-3`}>
                  {idx === 0 ? <Target className="w-5 h-5 text-white" /> : idx === 1 ? <BookOpen className="w-5 h-5 text-white" /> : idx === 2 ? <Award className="w-5 h-5 text-white" /> : <Trophy className="w-5 h-5 text-white" />}
                </div>
                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                <div className="mt-1 mb-4">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-500 text-sm">{plan.period}</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f, fi) => (
                    <li key={fi} className="flex items-start gap-2 text-sm text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => { setShowAuth(true); setIsLogin(false); }}
                  className={`w-full bg-gradient-to-r ${plan.color} text-white border-0 hover:opacity-90`}
                  data-testid={`landing-plan-${plan.name.toLowerCase()}`}
                >
                  {getText('Get Started', 'Bắt đầu', 'Başla')}
                </Button>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-500 text-sm mt-6">
            {getText('Stage 1 is always free. No credit card required.', 'Giai đoạn 1 luôn miễn phí.', 'Stage 1 her zaman ücretsiz. Kredi kartı gerekmez.')}
          </p>
        </div>
      </section>
  );
}
