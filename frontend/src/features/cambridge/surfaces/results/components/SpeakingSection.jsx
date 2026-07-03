import React from 'react';
import { Card } from '../../../../../components/ui/card';
import { Badge } from '../../../../../components/ui/badge';
import { Mic } from 'lucide-react';
import {
  ResultsState as SpeakingResultsState,
  adaptSpeakingResult,
  LegacySpeakingDetailDrawer,
} from '../../../../speaking';

// Speaking Section — D7 ResultsState header + drawer with legacy
// per-response detail. Pending state shown when no evaluations yet.
// Extracted verbatim from pages/CambridgeTestResults.js (Faz2 refactor);
// the `{activeTab === 'speaking' && (...)}` guard stays in the orchestrator
// (originally an inline IIFE).

export default function SpeakingSection({ speakingEvaluations, navigate }) {
          const evalEntries = Object.entries(speakingEvaluations || {});
          const hasEvals = evalEntries.length > 0;

          if (!hasEvals) {
            return (
              <Card className="p-6 mb-6 bg-white border-0 shadow-lg rounded-2xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                    <Mic className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Speaking Evaluation
                    </h3>
                    <p className="text-sm text-gray-500">
                      Speaking responses will be evaluated upon submission.
                    </p>
                  </div>
                  <Badge className="bg-gray-100 text-gray-500">Pending</Badge>
                </div>
              </Card>
            );
          }

          // Aggregate per-response criteria + band into a single object the
          // D7 ResultsState adapter understands. Rounded to nearest 0.5.
          const overallBand =
            Math.round(
              (evalEntries.reduce(
                (sum, [, e]) => sum + (e.overall_band || 5),
                0,
              ) /
                evalEntries.length) *
                2,
            ) / 2;

          const criteriaAvg = (key) => {
            const values = evalEntries
              .map(([, e]) => e?.criteria?.[key])
              .filter((v) => typeof v === 'number');
            if (!values.length) return null;
            return (
              Math.round(
                (values.reduce((a, b) => a + b, 0) / values.length) * 2,
              ) / 2
            );
          };

          const aggregated = {
            band: overallBand,
            criteria: {
              fluency_coherence: criteriaAvg('fluency_coherence'),
              lexical_resource: criteriaAvg('lexical_resource'),
              grammatical_range: criteriaAvg('grammatical_range'),
              pronunciation: criteriaAvg('pronunciation'),
            },
          };
          const adapted = adaptSpeakingResult(aggregated);

          const responses = evalEntries.map(([idx, evaluation]) => ({
            id: idx,
            label: `Response ${parseInt(idx, 10) + 1}`,
            ...evaluation,
          }));

          return (
            <div className="mb-6">
              {adapted ? (
                <div className="speaking-scope rounded-2xl overflow-hidden border border-orange-100 shadow-lg">
                  <SpeakingResultsState
                    data={adapted}
                    onRetryCard={() => navigate('/speaking-practice')}
                    onNewCard={() => navigate('/dashboard')}
                  />
                </div>
              ) : (
                <Card className="p-6 bg-white border-0 shadow-lg rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                      <Mic className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Speaking
                      </h3>
                      <p className="text-sm text-gray-500">
                        Band {overallBand} · {evalEntries.length} responses
                        evaluated
                      </p>
                    </div>
                  </div>
                </Card>
              )}
              <LegacySpeakingDetailDrawer responses={responses} />
            </div>
          );
}
