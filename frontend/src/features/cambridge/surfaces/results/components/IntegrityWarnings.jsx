import React from 'react';
import { AlertTriangle } from 'lucide-react';

// Submission Alert banner (integrity warnings from the evaluator).
// JSX extracted verbatim from pages/CambridgeTestResults.js (Faz2 refactor);
// the `(activeTab === 'overview' || rlOnly) && integrityWarnings.length > 0`
// guard stays in the orchestrator.

export default function IntegrityWarnings({ integrityWarnings }) {
  return (
          <div
            data-testid="integrity-warnings"
            className="p-4 mb-6 rounded-2xl border border-orange-300/30"
            style={{
              background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.15), rgba(245, 101, 101, 0.15))',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 20px rgba(251, 146, 60, 0.1)',
            }}
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm mb-2">Submission Alert</h3>
                <div className="space-y-1 mb-3">
                  {integrityWarnings.map((w, idx) => (
                    <p key={idx} className="text-white/90 text-sm">{w.message}</p>
                  ))}
                </div>
                <div className="p-3 bg-white/10 rounded-xl">
                  <p className="text-xs text-white/80">
                    💡 <strong>Pro tip:</strong> Always review unanswered questions before submitting. Even a guess is better than blank.
                  </p>
                </div>
              </div>
            </div>
          </div>
  );
}
