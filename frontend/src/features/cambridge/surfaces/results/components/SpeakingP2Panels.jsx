import React from 'react';
import { Card } from '../../../../../components/ui/card';
import { Button } from '../../../../../components/ui/button';
import { Badge } from '../../../../../components/ui/badge';
import { Eye, Info, Activity, Dumbbell, MessageCircle, Loader2 } from 'lucide-react';

// ============ SPEAKING P2 FEATURES ============
// Fluency Insights + Personalized Drills + Model Answer Compare cards.
// JSX extracted verbatim from pages/CambridgeTestResults.js (Faz2 refactor);
// the `{activeTab === 'speaking' && Object.keys(speakingEvaluations).length > 0
// && (...)}` guard stays in the orchestrator.

export default function SpeakingP2Panels({
  speakingEvaluations,
  testData,
  fluencyInsights,
  speakingDrills,
  loadingDrills,
  fetchDrills,
  modelAnswers,
  loadingModels,
  fetchModelAnswer,
}) {
  return (
          <>
            {/* 1. Fluency Insights Card */}
            <Card data-testid="fluency-insights-card" className="p-6 mb-6 bg-white border-0 shadow-lg rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Fluency Insights</h3>
                  <p className="text-sm text-gray-500">Objective metrics from your speaking responses</p>
                </div>
              </div>

              {fluencyInsights?.available ? (
                <div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    <div data-testid="metric-filler-count" className="p-3 rounded-xl bg-cyan-50 border border-cyan-200 text-center">
                      <p className="text-2xl font-bold text-cyan-700">{fluencyInsights.filler_count}</p>
                      <p className="text-xs text-cyan-600 font-medium">Filler Words</p>
                      <p className="text-[10px] text-cyan-500 mt-0.5">confidence: high</p>
                    </div>
                    <div data-testid="metric-filler-rate" className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-center">
                      <p className="text-2xl font-bold text-blue-700">{fluencyInsights.filler_per_minute}</p>
                      <p className="text-xs text-blue-600 font-medium">Fillers/min</p>
                      <p className="text-[10px] text-blue-500 mt-0.5">{fluencyInsights.filler_per_minute < 2 ? 'Good' : fluencyInsights.filler_per_minute < 4 ? 'Average' : 'Needs work'}</p>
                    </div>
                    <div data-testid="metric-word-count" className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-center">
                      <p className="text-2xl font-bold text-indigo-700">{fluencyInsights.total_words}</p>
                      <p className="text-xs text-indigo-600 font-medium">Total Words</p>
                    </div>
                    <div data-testid="metric-self-corrections" className="p-3 rounded-xl bg-violet-50 border border-violet-200 text-center">
                      <p className="text-2xl font-bold text-violet-700">{fluencyInsights.self_correction_count}</p>
                      <p className="text-xs text-violet-600 font-medium">Self-Corrections</p>
                    </div>
                  </div>

                  {/* Top fillers */}
                  {Object.keys(fluencyInsights.filler_details || {}).length > 0 && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-xl">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Top Filler Words</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(fluencyInsights.filler_details)
                          .sort(([,a],[,b]) => b - a)
                          .slice(0, 6)
                          .map(([word, count]) => (
                          <span key={word} className="px-2 py-1 rounded-full bg-white border text-sm">
                            "{word}" <span className="font-bold text-cyan-600">{count}x</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pause disclaimer */}
                  {!fluencyInsights.pause_data?.available && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5" />
                        Pause analytics: {fluencyInsights.pause_data?.reason}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div data-testid="fluency-not-available" className="p-4 bg-gray-50 rounded-xl text-center">
                  <p className="text-sm text-gray-500">{fluencyInsights?.reason || 'Requires transcript. Record speaking responses to see fluency analytics.'}</p>
                </div>
              )}
            </Card>

            {/* 2. Personalized Drills */}
            <Card data-testid="speaking-drills-card" className="p-6 mb-6 bg-white border-0 shadow-lg rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg">
                    <Dumbbell className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Your Practice Drills</h3>
                    <p className="text-sm text-gray-500">Personalized exercises for your weak areas</p>
                  </div>
                </div>
                {speakingDrills.length === 0 && (
                  <Button
                    data-testid="generate-drills-btn"
                    onClick={fetchDrills}
                    disabled={loadingDrills}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                    size="sm"
                  >
                    {loadingDrills ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Dumbbell className="w-4 h-4 mr-1" />}
                    {loadingDrills ? 'Generating...' : 'Get Drills'}
                  </Button>
                )}
              </div>

              {speakingDrills.length > 0 ? (
                <div className="space-y-4">
                  {speakingDrills.map((drill, idx) => (
                    <div key={idx} data-testid={`drill-${drill.criterion}`} className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 text-sm">{drill.title}</h4>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-amber-100 text-amber-700 text-xs">{drill.duration}</Badge>
                          <Badge className={`text-xs ${drill.band_score < 6 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            Band {drill.band_score}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{drill.description}</p>
                      <ol className="space-y-1.5 mb-3">
                        {drill.steps?.map((step, i) => (
                          <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-800 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{i+1}</span>
                            {step}
                          </li>
                        ))}
                      </ol>
                      {drill.personalized_tip && (
                        <div className="p-3 bg-white rounded-lg border-l-4 border-orange-400">
                          <p className="text-xs font-semibold text-orange-700 mb-1">Personalized for you</p>
                          <p className="text-sm text-gray-700">{drill.personalized_tip}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : !loadingDrills ? (
                <p className="text-sm text-gray-400 text-center py-4">Click "Get Drills" to generate exercises based on your weak areas</p>
              ) : null}
            </Card>

            {/* 3. Model Answer Compare */}
            <Card data-testid="model-answers-card" className="p-6 mb-6 bg-white border-0 shadow-lg rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Model Answer Compare</h3>
                  <p className="text-sm text-gray-500">See how Band 7 and Band 8 speakers would answer</p>
                </div>
              </div>

              <div className="space-y-4">
                {Object.entries(speakingEvaluations).map(([qIdx, ev]) => {
                  const question = ev?.question || testData?.sections?.speaking?.parts?.[Math.floor(parseInt(qIdx)/3)]?.questions?.[parseInt(qIdx) % 3]?.question || `Speaking Question ${parseInt(qIdx) + 1}`;
                  const part = ev?.part || Math.floor(parseInt(qIdx) / 3) + 1;
                  const ma = modelAnswers[qIdx];
                  const isLoading = loadingModels[qIdx];

                  return (
                    <div key={qIdx} className="border rounded-xl overflow-hidden">
                      <div className="p-3 bg-gray-50 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Response {parseInt(qIdx) + 1} (Part {part})</span>
                        {!ma && (
                          <Button
                            data-testid={`get-model-${qIdx}`}
                            size="sm"
                            variant="outline"
                            onClick={() => fetchModelAnswer(qIdx, typeof question === 'string' ? question : JSON.stringify(question), part)}
                            disabled={isLoading}
                            className="text-xs"
                          >
                            {isLoading ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Eye className="w-3 h-3 mr-1" />}
                            {isLoading ? 'Generating...' : 'Show Model Answers'}
                          </Button>
                        )}
                      </div>

                      {ma && (
                        <div className="p-4 space-y-4">
                          {/* Band 7 */}
                          <div data-testid={`model-band7-${qIdx}`} className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className="bg-blue-200 text-blue-800">Band 7</Badge>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed italic">
                              {ma.band7?.answer || ma.band7?.structure || 'Not available'}
                            </p>
                            {ma.band7?.key_features?.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {ma.band7.key_features.map((f, i) => (
                                  <span key={i} className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">{f}</span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Band 8 */}
                          <div data-testid={`model-band8-${qIdx}`} className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className="bg-emerald-200 text-emerald-800">Band 8</Badge>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed italic">
                              {ma.band8?.answer || ma.band8?.structure || 'Not available'}
                            </p>
                            {ma.band8?.key_features?.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {ma.band8.key_features.map((f, i) => (
                                  <span key={i} className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded">{f}</span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Differences */}
                          {ma.differences?.length > 0 && (
                            <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
                              <p className="text-xs font-semibold text-purple-700 mb-1.5">Key Differences (7 vs 8)</p>
                              <ul className="space-y-1">
                                {ma.differences.map((d, i) => (
                                  <li key={i} className="text-sm text-gray-700 flex items-start gap-1.5">
                                    <span className="text-purple-500 mt-0.5">-</span> {d}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </>
  );
}
