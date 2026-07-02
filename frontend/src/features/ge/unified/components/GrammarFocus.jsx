import React, { useState } from 'react';
import { Edit3, CheckCircle, X, ChevronRight, ThumbsUp } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Progress } from '../../../../components/ui/progress';
import SkipButton from './SkipButton';

// ═══════ GRAMMAR FOCUS ═══════
function GrammarFocus({ activity, onComplete, onSkip }) {
  const [ruleIdx, setRuleIdx] = useState(0);
  
  // Support both 'rules' array (old format) and single rule (enriched format)
  const rules = activity?.rules || (activity?.rule ? [{
    pattern: activity.rule,
    rule_text: activity.rule,
    explanation: activity.explanation || '',
    examples: activity.examples || []
  }] : []);
  
  const rule = rules[ruleIdx];

  // Normalize examples: handle both [{correct, incorrect}] and plain string arrays
  const normalizeExamples = (examples) => {
    if (!examples?.length) return [];
    if (typeof examples[0] === 'string') {
      return examples.map(ex => ({ correct: ex, incorrect: null }));
    }
    return examples;
  };

  return (
    <div data-testid="grammar-focus">
      <div className="flex items-center justify-between mb-4">
        <Badge className="bg-violet-100 text-violet-700 border-0"><Edit3 className="w-3 h-3 mr-1" /> Grammar</Badge>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">Rule {ruleIdx + 1}/{rules.length}</span>
          <SkipButton onSkip={onSkip} />
        </div>
      </div>
      <Progress value={((ruleIdx + 1) / rules.length) * 100} className="mb-6" />

      {rule && (
        <Card className="p-8">
          {/* Pattern highlight */}
          <div className="text-center mb-6">
            <div className="inline-block bg-violet-100 text-violet-800 font-mono text-2xl px-6 py-3 rounded-xl font-bold">
              {rule.pattern || activity?.pattern_highlight || ''}
            </div>
          </div>

          {/* Rule */}
          <div className="bg-blue-50 rounded-xl p-5 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{rule.rule_text || rule.title}</h3>
            <p className="text-base text-gray-600 mb-2">{rule.explanation}</p>
            <code className="text-base text-blue-700 bg-blue-100 px-2 py-1 rounded">{rule.pattern}</code>
          </div>

          {/* Examples */}
          <div className="space-y-3 mb-6">
            {normalizeExamples(rule.examples).map((ex, i) => (
              <div key={i} className={ex.incorrect ? 'grid grid-cols-2 gap-3' : ''}>
                <div className="flex items-center gap-2 bg-green-50 p-4 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                  <span className="text-lg font-medium text-green-800">{ex.correct}</span>
                </div>
                {ex.incorrect && (
                  <div className="flex items-center gap-2 bg-red-50 p-4 rounded-xl">
                    <X className="w-5 h-5 text-red-500 shrink-0" />
                    <span className="text-lg font-medium text-red-800 line-through">{ex.incorrect}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3">
            {ruleIdx > 0 && <Button variant="outline" onClick={() => setRuleIdx(i => i - 1)}>Previous</Button>}
            {ruleIdx < rules.length - 1 ? (
              <Button onClick={() => setRuleIdx(i => i + 1)} data-testid="grammar-next-btn">Next Rule <ChevronRight className="w-4 h-4 ml-1" /></Button>
            ) : (
              <Button onClick={() => onComplete(100)} data-testid="grammar-complete-btn">Got it! <ThumbsUp className="w-4 h-4 ml-1" /></Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

export default GrammarFocus;
