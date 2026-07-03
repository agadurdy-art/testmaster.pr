// ComparisonSection — the 3-WAY COMPARISON section, verbatim from pages/LandingPage.js
// lines 553-657 (Faz1 wave 10). Closed-over values arrive as same-named props.
import React from 'react';
import { Card } from '../../../../../components/ui/card';
import { Users, Zap, Trophy, CheckCircle, XCircle } from 'lucide-react';

export default function ComparisonSection({ t }) {
  return (
      <section className="py-20 px-6 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              {t('landingCompareTitle')}
            </h2>
            <p className="text-lg text-gray-400">{t('landingCompareDesc')}</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Traditional Methods */}
            <Card className="p-6 bg-gray-800 border border-gray-700 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                  <Users className="w-5 h-5 text-gray-300" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{t('landingTraditional')}</h3>
                  <span className="text-xs text-gray-400">{t('landingTraditionalSub')}</span>
                </div>
              </div>
              <ul className="space-y-3 mb-6">
                {[t('landingTradItem1'), t('landingTradItem2'), t('landingTradItem3'), t('landingTradItem4'), t('landingTradItem5')].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-300 text-sm">
                    <XCircle className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-4 border-t border-gray-700">
                <p className="text-gray-400 text-xs">{t('landingTraditionalBestFor')}</p>
              </div>
            </Card>

            {/* Other AI Platforms */}
            <Card className="p-6 bg-gray-800 border border-gray-700 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{t('landingOtherAI')}</h3>
                  <span className="text-xs text-gray-400">{t('landingOtherAISub')}</span>
                </div>
              </div>
              <ul className="space-y-3 mb-6">
                {[
                  { text: t('landingOtherAIItem1'), good: true },
                  { text: t('landingOtherAIItem2'), good: false },
                  { text: t('landingOtherAIItem3'), good: false },
                  { text: t('landingOtherAIItem4'), good: false },
                  { text: t('landingOtherAIItem5'), good: false }
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-300 text-sm">
                    {item.good ? (
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                    )}
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-4 border-t border-gray-700">
                <p className="text-gray-400 text-xs">{t('landingOtherAIBestFor')}</p>
              </div>
            </Card>

            {/* IELTS Ace */}
            <Card className="p-6 bg-gradient-to-br from-violet-600/20 to-purple-600/20 border-2 border-violet-500 rounded-2xl relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="px-3 py-1 bg-violet-500 text-white text-xs font-bold rounded-full">{t('landingRecommended')}</span>
              </div>
              <div className="flex items-center gap-3 mb-6 mt-2">
                <div className="w-10 h-10 rounded-full bg-violet-500 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{t('landingIELTSAce')}</h3>
                  <span className="text-xs text-violet-300">{t('landingIELTSAceSub')}</span>
                </div>
              </div>
              <ul className="space-y-3 mb-6">
                {[t('landingAceItem1'), t('landingAceItem2'), t('landingAceItem3'), t('landingAceItem4'), t('landingAceItem5')].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-white text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-4 border-t border-violet-500/30">
                <p className="text-violet-200 text-xs">{t('landingIELTSAceBestFor')}</p>
              </div>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <p className="text-xl text-gray-300 italic">
              "{t('landingQuote1')}<br/>
              <span className="text-white font-semibold">{t('landingQuote2')}</span>"
            </p>
          </div>
        </div>
      </section>
  );
}
