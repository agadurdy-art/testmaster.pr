import React from 'react';
import { Card } from '../../../../../components/ui/card';
import { Button } from '../../../../../components/ui/button';
import { ArrowLeft, Mic } from 'lucide-react';
import {
  ResultsState as SpeakingResultsState,
  adaptSpeakingResult,
  LegacySpeakingDetailDrawer,
} from '../../../../speaking';

// Skill-mode speaking only — render the D7 SpeakingResultsState alone,
// no listening/reading/writing cards, no full-test header.
// Extracted verbatim from pages/CambridgeTestResults.js (Faz2 refactor).

export default function SpeakingSkillResults({ speakingEvaluations, testData, bookId, testId, navigate }) {
    const evalEntries = Object.entries(speakingEvaluations || {});
    const hasEvals = evalEntries.length > 0;

    let speakingBody;
    if (!hasEvals) {
      speakingBody = (
        <Card className="p-8 bg-white border-0 shadow-lg rounded-2xl text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
            <Mic className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Speaking submitted</h2>
          <p className="text-gray-500">No evaluations were returned. Try recording again or contact support.</p>
        </Card>
      );
    } else {
      const overallBand =
        Math.round(
          (evalEntries.reduce((sum, [, e]) => sum + (e?.overall_band || 5), 0) /
            evalEntries.length) * 2,
        ) / 2;
      const criteriaAvg = (key) => {
        const values = evalEntries
          .map(([, e]) => e?.criteria?.[key])
          .filter((v) => typeof v === 'number');
        if (!values.length) return null;
        return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 2) / 2;
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

      speakingBody = (
        <>
          {adapted ? (
            <div className="speaking-scope rounded-2xl overflow-hidden border border-orange-100 shadow-lg">
              <SpeakingResultsState
                data={adapted}
                onRetryCard={() => navigate(`/cambridge-test/${bookId}/${testId}?skill=speaking`)}
                onNewCard={() => navigate('/question-bank')}
              />
            </div>
          ) : (
            <Card className="p-6 bg-white border-0 shadow-lg rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                  <Mic className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Speaking</h3>
                  <p className="text-sm text-gray-500">
                    Band {overallBand} · {evalEntries.length} responses evaluated
                  </p>
                </div>
              </div>
            </Card>
          )}
          <div className="mt-4">
            <LegacySpeakingDetailDrawer responses={responses} />
          </div>
        </>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-violet-50/30 to-gray-100 py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/question-bank')}
            className="mb-6 text-gray-600 hover:text-violet-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Question Bank
          </Button>
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Speaking Results</h1>
            <p className="text-gray-500">{testData.title || `Cambridge IELTS ${bookId?.toUpperCase()} - ${testId}`}</p>
          </div>
          {speakingBody}
        </div>
      </div>
    );
}
