import React from 'react';
import { Card } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { RotateCcw, ChevronRight } from 'lucide-react';
import { ResultsState as SpeakingResultsState, adaptSpeakingResult } from '../../index';
import StructuredResultsLayout from '../../components/StructuredResultsLayout';

/**
 * Results surface for the QB page. Two shapes:
 * - structured per-question results (Part 1/3 pipeline) → StructuredResultsLayout
 * - legacy/adapted results → D7 ResultsState + QB-specific overflow cards
 *
 * `onRetryPart` re-runs the same part with a clean slate; `onChooseAnother`
 * bounces back to the part picker for this module (no re-fetch).
 */
export default function ResultsPanel({ results, user, navigate, onRetryPart, onChooseAnother }) {
  if (Array.isArray(results.questions) && results.questions.length > 0) {
    return (
      <div className="speaking-scope">
        <StructuredResultsLayout
          feedback={results}
          onPracticeAnother={onChooseAnother}
          onTryAgain={onRetryPart}
        />
      </div>
    );
  }

  const adapted = adaptSpeakingResult(results, {
    targetBand: user?.target_band,
    durationSeconds: results.metrics?.total_duration,
  });
  return (
    <div className="space-y-4">
      {/* Tier / credits chip strip — kept outside D7 for app-level context */}
      <div className="flex items-center justify-end gap-2">
        {results.remaining_credits !== undefined && (
          <Badge className="bg-gray-100 text-gray-600 text-xs">
            {results.remaining_credits} credit{results.remaining_credits !== 1 ? 's' : ''} left
          </Badge>
        )}
        {results.tier && (
          <Badge className={results.tier === 'premium' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}>
            {results.tier === 'premium' ? '⭐ Premium' : '🎯 Basic'}
          </Badge>
        )}
      </div>

      {/* Unified D7 ResultsState */}
      {adapted ? (
        <div className="speaking-scope rounded-2xl overflow-hidden border border-indigo-100 shadow-sm">
          <SpeakingResultsState
            data={adapted}
            onRetryCard={onRetryPart}
            onNewCard={onChooseAnother}
          />
        </div>
      ) : (
        <Card className="p-6 text-center text-gray-500">No evaluation data returned.</Card>
      )}

      {/* QB-specific overflow info that doesn't fit the D7 layout */}
      {results.per_part_summary && (
        <Card className="p-4">
          <h3 className="font-semibold text-gray-800 mb-2">Part-by-part</h3>
          <div className="space-y-1 text-sm">
            {Object.entries(results.per_part_summary).map(([p, s]) => (
              <div key={p}><span className="font-medium capitalize">{p}: </span><span className="text-gray-600">{s}</span></div>
            ))}
          </div>
        </Card>
      )}

      {results.upgrade_prompt && (
        <Card className="p-4 bg-gradient-to-r from-purple-100 to-indigo-100 border-purple-200">
          <p className="text-sm text-purple-700">{results.upgrade_prompt}</p>
        </Card>
      )}

      {results.recommended_lessons?.length > 0 && (
        <Card className="p-4">
          <h4 className="font-semibold text-gray-800 mb-3">Recommended Lessons</h4>
          <div className="space-y-2">
            {results.recommended_lessons.map((l, i) => (
              <div key={i} className="flex items-center justify-between bg-white p-3 rounded-lg border">
                <div><p className="font-medium text-gray-900">{l.title}</p><p className="text-xs text-gray-500">{l.track} • {l.stage}</p></div>
                <Button variant="outline" size="sm" onClick={() => navigate(l.url || '/mastery-course')}>Go <ChevronRight className="w-3 h-3 ml-1" /></Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onRetryPart}
          className="flex-1"
        >
          <RotateCcw className="w-4 h-4 mr-2" /> Try this part again
        </Button>
        <Button
          onClick={onChooseAnother}
          className="flex-1 bg-indigo-600"
        >
          Choose another part <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
