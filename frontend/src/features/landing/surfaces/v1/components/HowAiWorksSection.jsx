// HowAiWorksSection — the HOW OUR AI WORKS section, verbatim from pages/LandingPage.js
// lines 713-803 (Faz1 wave 10). Closed-over values arrive as same-named props.
import React from 'react';
import { Eye, BarChart3 } from 'lucide-react';

export default function HowAiWorksSection({ t }) {
  return (
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-sm font-medium mb-6">
                <Eye className="w-4 h-4" />
                {t('landingHowAIWorks')}
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                {t('landingHowAIWorksTitle')}
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                {t('landingHowAIWorksDesc')}
              </p>
              
              <div className="space-y-4">
                {[
                  { num: '1', title: t('landingAIStep1'), desc: t('landingAIStep1Desc') },
                  { num: '2', title: t('landingAIStep2'), desc: t('landingAIStep2Desc') },
                  { num: '3', title: t('landingAIStep3'), desc: t('landingAIStep3Desc') },
                  { num: '4', title: t('landingAIStep4'), desc: t('landingAIStep4Desc') }
                ].map((step, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">{step.num}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{step.title}</h4>
                      <p className="text-sm text-gray-600">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-amber-800 text-sm">
                  <strong>{t('landingKeyRule')}</strong> {t('landingKeyRuleDesc')}
                  <span className="block mt-1 text-amber-600">{t('landingKeyRuleDesc2')}</span>
                </p>
              </div>
            </div>

            {/* Screenshot Preview */}
            <div className="relative">
              <div className="bg-gradient-to-br from-violet-100 to-purple-100 rounded-2xl p-6 shadow-xl">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="p-4 border-b bg-gradient-to-r from-violet-50 to-purple-50">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-violet-600" />
                      <span className="font-semibold text-gray-900">AI Evaluation Result</span>
                    </div>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Overall Band</span>
                      <span className="text-2xl font-bold text-violet-600">5.5</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="p-2 bg-gray-50 rounded-lg">
                        <span className="text-gray-500">Task Achievement</span>
                        <span className="block font-semibold">5.0</span>
                      </div>
                      <div className="p-2 bg-gray-50 rounded-lg">
                        <span className="text-gray-500">Coherence</span>
                        <span className="block font-semibold">5.5</span>
                      </div>
                      <div className="p-2 bg-gray-50 rounded-lg">
                        <span className="text-gray-500">Vocabulary</span>
                        <span className="block font-semibold">6.0</span>
                      </div>
                      <div className="p-2 bg-gray-50 rounded-lg">
                        <span className="text-gray-500">Grammar</span>
                        <span className="block font-semibold">5.5</span>
                      </div>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                      <p className="text-sm text-red-800 font-medium">Main Limiting Factor:</p>
                      <p className="text-sm text-red-600">Response does not fully address all parts of the question.</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-sm text-blue-800 font-medium">Next Step:</p>
                      <p className="text-sm text-blue-600">Focus on task response strategies in Module 2.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
  );
}
