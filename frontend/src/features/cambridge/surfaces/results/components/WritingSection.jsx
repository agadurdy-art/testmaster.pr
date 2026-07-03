import React from 'react';
import { Card } from '../../../../../components/ui/card';
import { Button } from '../../../../../components/ui/button';
import { Badge } from '../../../../../components/ui/badge';
import { CheckCircle, PenTool, Target, BarChart3, Lightbulb, RefreshCw } from 'lucide-react';
import { getBandLightBg } from '../constants';

// Writing Evaluation Section — evaluate CTA + task-by-task AI feedback.
// JSX extracted verbatim from pages/CambridgeTestResults.js (Faz2 refactor);
// the `{activeTab === 'writing' && (...)}` guard stays in the orchestrator.

export default function WritingSection({ results, evaluating, evaluateWriting }) {
  return (
        <Card className="p-6 mb-6 bg-white border-0 shadow-lg rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center shadow-lg">
                <PenTool className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Writing Evaluation</h3>
                <p className="text-sm text-gray-500">
                  {results?.writing?.evaluated ? 'AI Evaluated' : 'Click to get detailed AI feedback'}
                </p>
              </div>
            </div>
            {results?.writing?.evaluated ? (
              <Badge className={`text-lg px-3 py-1 ${getBandLightBg(results.writing.score || 5)}`}>
                Band {results.writing.score}
              </Badge>
            ) : (
              <Button
                className="bg-purple-600 hover:bg-purple-700"
                onClick={evaluateWriting}
                disabled={evaluating}
              >
                {evaluating ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <BarChart3 className="w-4 h-4 mr-2" />}
                {evaluating ? 'Evaluating...' : 'Evaluate Writing'}
              </Button>
            )}
          </div>

          {/* Writing Results - Task by Task */}
          {results?.writing?.evaluated && results.writing.tasks.length > 0 && (
            <div className="space-y-6">
              {results.writing.tasks.map((task, idx) => (
                <div key={idx} className={`p-5 rounded-xl ${task.taskNumber === 1 ? 'bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200' : 'bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${task.taskNumber === 1 ? 'bg-orange-500' : 'bg-violet-500'} flex items-center justify-center shadow-lg`}>
                        {task.taskNumber === 1 ? <BarChart3 className="w-5 h-5 text-white" /> : <Lightbulb className="w-5 h-5 text-white" />}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Task {task.taskNumber} - {task.taskNumber === 1 ? 'Report/Description' : 'Essay'}</h4>
                        <p className="text-sm text-gray-500">{task.wordCount} words (min: {task.minimumWords})</p>
                      </div>
                    </div>
                    <Badge className={`text-lg px-3 py-1 ${getBandLightBg(task.overallBand)}`}>
                      Band {task.overallBand}
                    </Badge>
                  </div>

                  {/* Criteria Scores */}
                  <div className="grid md:grid-cols-2 gap-3 mb-4">
                    {[
                      { key: 'task_achievement', label: 'Task Achievement' },
                      { key: 'coherence_cohesion', label: 'Coherence & Cohesion' },
                      { key: 'lexical_resource', label: 'Lexical Resource' },
                      { key: 'grammatical_range', label: 'Grammar' }
                    ].map(crit => {
                      const score = task.criteria?.[crit.key];
                      if (!score) return null;
                      return (
                        <div key={crit.key} className="p-3 bg-white rounded-lg">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-gray-900">{crit.label}</span>
                            <span className={`px-2 py-0.5 rounded text-sm font-bold ${getBandLightBg(score)}`}>Band {score}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Examiner Comment */}
                  {task.feedback?.examiner_comment && (
                    <div className="mb-4 p-4 bg-white rounded-xl">
                      <h5 className="font-semibold text-gray-900 mb-2">Teacher&apos;s Feedback</h5>
                      <p className="text-gray-700 leading-relaxed">{task.feedback.examiner_comment}</p>
                    </div>
                  )}

                  {/* Strengths */}
                  {task.feedback?.strengths?.length > 0 && (
                    <div className="mb-3 p-3 bg-green-50 rounded-lg border border-green-100">
                      <p className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Strengths
                      </p>
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        {task.feedback.strengths.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  )}

                  {/* Areas for Improvement */}
                  {task.feedback?.improvements?.length > 0 && (
                    <div className="mb-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                      <p className="text-sm font-semibold text-amber-700 mb-2 flex items-center gap-1">
                        <Target className="w-4 h-4" /> Areas to Improve
                      </p>
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        {task.feedback.improvements.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
  );
}
