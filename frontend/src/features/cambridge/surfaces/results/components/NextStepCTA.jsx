import React from 'react';
import { Card } from '../../../../../components/ui/card';
import { Button } from '../../../../../components/ui/button';
import { Badge } from '../../../../../components/ui/badge';
import { ChevronRight } from 'lucide-react';
import { computeNextStepPlan } from '../computeNextStepPlan';

// ============ ONE NEXT STEP CTA ============
// JSX extracted verbatim from pages/CambridgeTestResults.js (Faz2 refactor);
// the `(activeTab === 'overview' || rlOnly) && results` guard stays in the
// orchestrator (originally an inline IIFE calling the closure-based planner).

export default function NextStepCTA({
  results,
  questionResults,
  speakingEvaluations,
  fluencyInsights,
  computedOverall,
  bookId,
  testId,
  testData,
  navigate,
}) {
          const plan = computeNextStepPlan({
            results,
            questionResults,
            speakingEvaluations,
            fluencyInsights,
            computedOverall,
            bookId,
            testId,
            testData,
          });
          if (!plan) return null;

          return (
            <Card data-testid="next-step-cta" className="p-6 mb-6 bg-gradient-to-br from-gray-900 to-gray-800 border-0 shadow-2xl rounded-2xl text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/20 to-transparent rounded-full -mr-8 -mt-8" />
              <div className="relative">
                <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-2">Your Next Step</p>
                <h3 data-testid="next-step-title" className="text-xl sm:text-2xl font-bold mb-2">{plan.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{plan.subtitle}</p>

                <div className="flex items-center gap-2 mb-5 flex-wrap">
                  <Badge className="bg-amber-400/20 text-amber-300 border-amber-400/30 text-xs">{plan.focus_area}</Badge>
                  <Badge className="bg-white/10 text-white/70 border-white/20 text-xs">15 min</Badge>
                </div>

                <Button
                  data-testid="next-step-start-btn"
                  onClick={() => navigate('/focus-plan', { state: { plan } })}
                  className="bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 font-bold border-0 shadow-lg px-8"
                  size="lg"
                >
                  Start Focus Plan <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </Card>
          );
}
