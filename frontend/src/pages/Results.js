import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Trophy, TrendingUp, CheckCircle, XCircle, Home, ArrowLeft, Award, Target, BarChart3, Lightbulb, Eye, FileText, MapPin, GraduationCap } from 'lucide-react';
import api from '../lib/api';
import { useI18n } from '../lib/i18n';
import SkillBreakdown from '../components/SkillBreakdown';
import LocateExplain from '../components/test/LocateExplain';
import ProgressAnalytics from '../components/test/ProgressAnalytics';
import { ResultsState as SpeakingResultsState, adaptSpeakingResult } from '../features/speaking';
import { ReadingListeningDrilldown, ReadingResultsLayout } from '../features/results';
import '../features/speaking/speaking.css';

export default function Results({ user }) {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const { t, language } = useI18n();
  
  // Trilingual helper
  const getText = (en, vi, tr) => {
    if (language === 'vi') return vi;
    if (language === 'tr') return tr;
    return en;
  };
  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [writingViewTab, setWritingViewTab] = useState('feedback'); // 'feedback', 'original', 'sample'

  useEffect(() => { loadResults(); }, [attemptId]);

  const loadResults = async () => {
    try {
      const response = await api.get(`/test_attempts/${attemptId}`);
      setResult(response.data || response);
    } catch (error) { console.error('Failed to load results', error); }
    finally { setLoading(false); }
  };

  const getBandColorClass = (score) => score >= 7 ? 'text-green-600' : score >= 6 ? 'text-blue-600' : score >= 5 ? 'text-yellow-600' : 'text-red-600';
  const getBandBgClass = (score) => score >= 7 ? 'bg-green-500' : score >= 6 ? 'bg-blue-500' : score >= 5 ? 'bg-yellow-500' : 'bg-red-500';
  const getBandLightBg = (score) => score >= 7 ? 'bg-green-100 text-green-700' : score >= 6 ? 'bg-blue-100 text-blue-700' : score >= 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-violet-50/30 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-violet-50/30 to-gray-100 flex items-center justify-center">
        <Card className="p-8 text-center bg-white border-0 shadow-lg rounded-2xl">
          <p className="text-gray-500 mb-4">Results not found</p>
          <Button onClick={() => navigate('/dashboard')} className="bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0">Back to Dashboard</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-violet-50/30 to-gray-100 py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-6 text-gray-600 hover:text-violet-600">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className={`w-24 h-24 mx-auto mb-6 rounded-3xl ${getBandBgClass(result.band_score)} flex items-center justify-center shadow-2xl`}>
            <Trophy className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Test Complete!</h1>
          <p className="text-xl text-gray-500 capitalize">{result.test_type} Module Results</p>
        </div>

        {/* Main Score Card */}
        <Card className="p-8 mb-6 bg-white border-0 shadow-lg rounded-2xl text-center">
          <p className="text-gray-500 mb-2 text-lg">Your Band Score</p>
          <p className={`text-8xl font-bold mb-8 ${getBandColorClass(result.band_score)}`}>{result.band_score}</p>
          
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-100">
            <div>
              <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-green-500 flex items-center justify-center shadow-lg"><CheckCircle className="w-6 h-6 text-white" /></div>
              <p className="text-3xl font-bold text-gray-900">{result.feedback?.correct || 0}</p>
              <p className="text-sm text-gray-500">Correct</p>
            </div>
            <div>
              <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-red-500 flex items-center justify-center shadow-lg"><XCircle className="w-6 h-6 text-white" /></div>
              <p className="text-3xl font-bold text-gray-900">{(result.feedback?.total || 0) - (result.feedback?.correct || 0)}</p>
              <p className="text-sm text-gray-500">Incorrect</p>
            </div>
            <div>
              <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-purple-500 flex items-center justify-center shadow-lg"><Target className="w-6 h-6 text-white" /></div>
              <p className="text-3xl font-bold text-gray-900">{Math.round(result.score || 0)}%</p>
              <p className="text-sm text-gray-500">Score</p>
            </div>
          </div>
        </Card>

        {/* Teacher Feedback Card - Listening only.
            Reading uses ReadingResultsLayout which includes a Liz tutor card. */}
        {result.test_type === 'listening' && result.feedback?.teacher_feedback && (
          <Card className="p-6 mb-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900">🎓 {t('personalFeedback')}</h3>
                <p className="text-sm text-blue-600">{t('aiFeedback')}</p>
              </div>
            </div>
            
            {/* AI Beta Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 flex items-start gap-2">
              <span className="text-amber-500 text-sm">🧪</span>
              <p className="text-xs text-amber-700">
                {getText(
                  'This feedback is generated by AI and is continuously improving.',
                  'Phản hồi này được tạo bởi AI và đang được cải thiện liên tục.',
                  'Bu geri bildirim yapay zeka tarafından oluşturulmaktadır ve sürekli geliştirilmektedir.'
                )}
              </p>
            </div>
            
            {/* Quick Summary */}
            <div className="bg-white/60 rounded-xl p-4 mb-4">
              <p className="text-gray-800 leading-relaxed">{result.feedback.teacher_feedback.short}</p>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              {/* Strengths */}
              <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-green-800">{t('yourStrengths')}</h4>
                </div>
                <div className="space-y-2">
                  {result.feedback.skill_breakdown?.filter(s => (s.correct / s.total) >= 0.7).slice(0, 3).map((skill, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-green-700 capitalize">{skill.label || skill.skill_id?.replace(/_/g, ' ')}</span>
                      <span className="font-medium text-green-800">{Math.round((skill.correct / skill.total) * 100)}%</span>
                    </div>
                  ))}
                  {(!result.feedback.skill_breakdown || result.feedback.skill_breakdown.filter(s => (s.correct / s.total) >= 0.7).length === 0) && (
                    <p className="text-sm text-green-600">{t('keepPracticing')}</p>
                  )}
                </div>
              </div>

              {/* Areas to Improve */}
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-amber-600" />
                  <h4 className="font-semibold text-amber-800">{t('areasToImprove')}</h4>
                </div>
                <div className="space-y-2">
                  {result.feedback.skill_breakdown?.filter(s => (s.correct / s.total) < 0.5).slice(0, 3).map((skill, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-amber-700 capitalize">{skill.label || skill.skill_id?.replace(/_/g, ' ')}</span>
                      <span className="font-medium text-amber-800">{Math.round((skill.correct / skill.total) * 100)}%</span>
                    </div>
                  ))}
                  {(!result.feedback.skill_breakdown || result.feedback.skill_breakdown.filter(s => (s.correct / s.total) < 0.5).length === 0) && (
                    <p className="text-sm text-amber-600">{t('greatJob')}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Detailed Tips */}
            <div className="bg-violet-50 rounded-xl p-4 border border-violet-100">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-violet-600" />
                <h4 className="font-semibold text-violet-800">💡 {t('tipsToImprove')}</h4>
              </div>
              <p className="text-gray-700 leading-relaxed text-sm">{result.feedback.teacher_feedback.detailed}</p>
            </div>

            {/* Skill-specific Tips */}
            {result.feedback.skill_breakdown?.filter(s => s.tip && (s.correct / s.total) < 0.7).length > 0 && (
              <div className="mt-4 space-y-3">
                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> {t('practiceRecommendations')}
                </h4>
                {result.feedback.skill_breakdown.filter(s => s.tip && (s.correct / s.total) < 0.7).slice(0, 3).map((skill, idx) => (
                  <div key={idx} className="bg-white/60 rounded-lg p-3 border border-gray-100">
                    <p className="font-medium text-gray-800 capitalize text-sm mb-1">{skill.label || skill.skill_id?.replace(/_/g, ' ')}</p>
                    <p className="text-gray-600 text-sm">{skill.tip}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Writing Test Feedback - Detailed Teacher-Style */}
        {result.test_type === 'writing' && result.feedback?.writing_feedback && (
          <div className="space-y-6 mb-6">
            {/* Task 1 Feedback */}
            {result.feedback.task1 && (
              <Card className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-orange-900">Task 1 - Graph/Chart Description</h3>
                      <p className="text-sm text-orange-600">Academic Writing Task 1</p>
                    </div>
                  </div>
                  {result.feedback.task1.band_score && (
                    <div className={`px-4 py-2 rounded-xl font-bold text-xl ${getBandLightBg(result.feedback.task1.band_score)}`}>
                      Band {result.feedback.task1.band_score}
                    </div>
                  )}
                </div>
                
                {/* Overall Feedback */}
                {result.feedback.task1.overall_feedback && (
                  <div className="mb-4 p-4 bg-white rounded-xl">
                    <h4 className="font-semibold text-gray-900 mb-2">🎓 Teacher&apos;s Feedback</h4>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {typeof result.feedback.task1.overall_feedback === 'string' 
                        ? result.feedback.task1.overall_feedback.replace(/```json|```/g, '').trim()
                        : ''}
                    </p>
                  </div>
                )}
                
                {/* Criteria Scores */}
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    { key: 'task_achievement', label: 'Task Achievement' },
                    { key: 'coherence_cohesion', label: 'Coherence & Cohesion' },
                    { key: 'lexical_resource', label: 'Lexical Resource' },
                    { key: 'grammatical_accuracy', label: 'Grammar' }
                  ].map(crit => {
                    const critData = result.feedback.task1[crit.key];
                    if (!critData) return null;
                    return (
                      <div key={crit.key} className="p-3 bg-white rounded-lg">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-gray-900">{crit.label}</span>
                          {critData.score && <span className={`px-2 py-0.5 rounded text-sm font-bold ${getBandLightBg(critData.score)}`}>Band {critData.score}</span>}
                        </div>
                        {critData.feedback && (
                          <p className="text-sm text-gray-600 mt-1">{critData.feedback.replace(/```json|```/g, '').trim()}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
            
            {/* Task 2 Feedback */}
            {result.feedback.task2 && (
              <Card className="p-6 bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-500 flex items-center justify-center shadow-lg">
                      <Lightbulb className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-violet-900">Task 2 - Essay</h3>
                      <p className="text-sm text-violet-600">Academic Writing Task 2</p>
                    </div>
                  </div>
                  {result.feedback.task2.band_score && (
                    <div className={`px-4 py-2 rounded-xl font-bold text-xl ${getBandLightBg(result.feedback.task2.band_score)}`}>
                      Band {result.feedback.task2.band_score}
                    </div>
                  )}
                </div>
                
                {/* Overall Feedback */}
                {result.feedback.task2.overall_feedback && (
                  <div className="mb-4 p-4 bg-white rounded-xl">
                    <h4 className="font-semibold text-gray-900 mb-2">🎓 Teacher&apos;s Feedback</h4>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {typeof result.feedback.task2.overall_feedback === 'string' 
                        ? result.feedback.task2.overall_feedback.replace(/```json|```/g, '').trim()
                        : ''}
                    </p>
                  </div>
                )}
                
                {/* Criteria Scores */}
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    { key: 'task_achievement', label: 'Task Achievement' },
                    { key: 'coherence_cohesion', label: 'Coherence & Cohesion' },
                    { key: 'lexical_resource', label: 'Lexical Resource' },
                    { key: 'grammatical_accuracy', label: 'Grammar' }
                  ].map(crit => {
                    const critData = result.feedback.task2[crit.key];
                    if (!critData) return null;
                    return (
                      <div key={crit.key} className="p-3 bg-white rounded-lg">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-gray-900">{crit.label}</span>
                          {critData.score && <span className={`px-2 py-0.5 rounded text-sm font-bold ${getBandLightBg(critData.score)}`}>Band {critData.score}</span>}
                        </div>
                        {critData.feedback && (
                          <p className="text-sm text-gray-600 mt-1">{critData.feedback.replace(/```json|```/g, '').trim()}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Phase 3: View Original Writing & Band 8+ Sample */}
            {result.answers && result.answers.length > 0 && (
              <Card className="p-6 bg-white border-0 shadow-lg rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Your Writing Submissions</h3>
                    <p className="text-sm text-gray-500">Review your original text and compare with samples</p>
                  </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2 mb-4 border-b border-gray-100 pb-3">
                  <Button
                    variant={writingViewTab === 'original' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setWritingViewTab('original')}
                    className={writingViewTab === 'original' ? 'bg-cyan-500 text-white' : ''}
                  >
                    <Eye className="w-4 h-4 mr-1" /> Your Text
                  </Button>
                  <Button
                    variant={writingViewTab === 'sample' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setWritingViewTab('sample')}
                    className={writingViewTab === 'sample' ? 'bg-cyan-500 text-white' : ''}
                  >
                    <FileText className="w-4 h-4 mr-1" /> Band 8+ Samples
                  </Button>
                </div>

                {/* Original Text Tab */}
                {writingViewTab === 'original' && (
                  <div className="space-y-4">
                    {result.answers.map((answer, idx) => {
                      const questionIdStr = String(answer.question_id || '');
                      const isTask1 = questionIdStr.toLowerCase().includes('task1') || idx === 0;
                      const answerText = answer.answer || answer.response || '';
                      const wordCount = answerText ? answerText.trim().split(/\s+/).filter(w => w).length : 0;
                      
                      return (
                        <div key={idx} className="p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-700">
                              {isTask1 ? 'Task 1 - Graph/Chart Description' : 'Task 2 - Essay'}
                            </span>
                            <span className="text-xs text-gray-400">
                              {wordCount} words
                            </span>
                          </div>
                          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {answerText || 'No response submitted'}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Band 8+ Sample Tab - Both Task 1 and Task 2 */}
                {writingViewTab === 'sample' && (
                  <div className="space-y-6">
                    {/* Task 1 Sample */}
                    <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-100">
                      <h4 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" /> Band 8+ Task 1 Model Answer
                      </h4>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm mb-4">
                        {"The line graph illustrates the percentage of households with internet access in three countries—the USA, the UK, and Japan—over a twenty-year period from 2000 to 2020.\n\nOverall, all three countries experienced significant growth in internet penetration, with the USA maintaining the highest rates throughout the period, while Japan showed the most dramatic increase.\n\nIn 2000, the USA led with approximately 45% of households connected to the internet, compared to roughly 30% in the UK and merely 15% in Japan. Over the following decade, all three nations saw substantial growth. By 2010, American households with internet access had risen to approximately 75%, whilst the UK had reached around 70%. Japan's growth was particularly noteworthy, climbing to approximately 65%.\n\nBetween 2010 and 2020, growth continued but at a slower pace as markets approached saturation. By 2020, the USA had reached approximately 90%, with the UK close behind at 88%. Japan had largely caught up with its counterparts, achieving roughly 85% household internet penetration.\n\nIn conclusion, while initial adoption rates varied considerably, all three countries converged toward near-universal household internet access by 2020."}
                      </p>
                      <div className="p-3 bg-white rounded-lg border border-orange-100">
                        <h5 className="font-medium text-orange-700 mb-2 text-sm">Why This Scores Band 8+:</h5>
                        <ul className="text-xs text-gray-600 space-y-1">
                          <li>• <strong>Clear overview:</strong> States the main trend immediately</li>
                          <li>• <strong>Logical organization:</strong> Groups data by time periods</li>
                          <li>• <strong>Precise data:</strong> Uses specific figures with appropriate approximation</li>
                          <li>• <strong>Comparison language:</strong> Effectively compares countries</li>
                          <li>• <strong>Varied vocabulary:</strong> penetration, noteworthy, converged, saturation</li>
                        </ul>
                      </div>
                    </div>

                    {/* Task 2 Sample */}
                    <div className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-100">
                      <h4 className="font-semibold text-violet-800 mb-3 flex items-center gap-2">
                        <Award className="w-4 h-4" /> Band 8+ Task 2 Model Essay
                      </h4>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm mb-4">
                        {"In today's rapidly evolving world, the question of whether governments should prioritize environmental protection over economic growth has become increasingly pertinent. While some argue that economic development should take precedence, I firmly believe that environmental sustainability must be our primary focus.\n\nFirstly, environmental degradation poses existential threats that no amount of economic prosperity can mitigate. Climate change, for instance, leads to rising sea levels, extreme weather events, and biodiversity loss, which ultimately undermine the very foundations of economic activity. The 2022 floods in Pakistan, which caused over $30 billion in damages, exemplify how environmental neglect can devastate economies.\n\nFurthermore, sustainable practices often stimulate innovation and create new economic opportunities. The renewable energy sector, for example, has generated millions of jobs worldwide while reducing carbon emissions. Countries like Denmark and Germany have demonstrated that environmental leadership can coexist with economic competitiveness.\n\nCritics may argue that developing nations cannot afford to prioritize the environment over growth. However, this perspective ignores the long-term costs of environmental degradation, which disproportionately affect the poorest populations. Moreover, international cooperation and green financing mechanisms can help bridge the gap.\n\nIn conclusion, environmental protection and economic development are not mutually exclusive but rather interdependent. Governments must adopt sustainable policies that ensure both present prosperity and future viability. Only by recognizing this symbiotic relationship can we build truly resilient societies."}
                      </p>
                      <div className="p-3 bg-white rounded-lg border border-violet-100">
                        <h5 className="font-medium text-violet-700 mb-2 text-sm">Why This Scores Band 8+:</h5>
                        <ul className="text-xs text-gray-600 space-y-1">
                          <li>• <strong>Clear thesis:</strong> Position stated in introduction and maintained throughout</li>
                          <li>• <strong>Sophisticated vocabulary:</strong> pertinent, existential, symbiotic, mitigate</li>
                          <li>• <strong>Complex sentences:</strong> Varied structures with subordinate clauses</li>
                          <li>• <strong>Real examples:</strong> Pakistan floods, Denmark, Germany - specific evidence</li>
                          <li>• <strong>Addresses counterarguments:</strong> Shows critical thinking</li>
                          <li>• <strong>Strong cohesion:</strong> Smooth paragraph transitions</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            )}
          </div>
        )}

        {/* Speaking Test Feedback — D7 unified ResultsState (adapts legacy shapes via adaptSpeakingResult) */}
        {result.test_type === 'speaking' && (result.feedback?.speaking_feedback || result.feedback?.scores) && (() => {
          // Pick the canonical payload first (newer attempts), fall back to legacy speaking_feedback dict.
          const source = result.feedback?.scores ? result.feedback : result;
          const adapted = adaptSpeakingResult(source, {
            targetBand: result.target_band ?? user?.target_band,
            durationSeconds: result.duration_seconds,
          });
          if (!adapted) return null;
          return (
            <div className="speaking-scope mb-6 rounded-2xl overflow-hidden border border-emerald-100 shadow-sm">
              <SpeakingResultsState
                data={adapted}
                onRetryCard={() => navigate(-1)}
                onNewCard={() => navigate('/speaking-practice')}
              />
            </div>
          );
        })()}

        {/* Legacy AI Feedback Card - For older attempts */}
        {result.feedback?.ai_feedback && !result.feedback?.writing_feedback && !result.feedback?.speaking_feedback && (
          <Card className="p-6 mb-6 bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-violet-500 flex items-center justify-center shadow-lg"><Lightbulb className="w-5 h-5 text-white" /></div>
              <h3 className="text-lg font-semibold text-violet-900">AI Feedback</h3>
            </div>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{result.feedback.ai_feedback}</p>
          </Card>
        )}

        {/* Question-by-Question Results.
            Reading → rich ReadingResultsLayout (greeting + insight tiles + scrollable drilldown + Liz card).
            Listening → simple drilldown (Cambridge/Full Test paths handle their own listening UI). */}
        {result.test_type === 'reading' && (
          <ReadingResultsLayout
            feedback={result.feedback}
            band={result.band_score}
            user={user}
            testMeta={{
              title: result.test_name || 'Practice Test',
              subtitle: result.attempt_label || '',
              durationMin: result.duration_minutes,
              allowedMin: 60,
              targetBand: user?.target_band || 7.0,
            }}
            insights={{
              rootCauseAnalysis: result.feedback?.root_cause_analysis,
              fastestGain: result.feedback?.fastest_gain,
              reasonSummary: result.feedback?.reason_summary,
              recommendedLessons: result.feedback?.recommended_lessons,
            }}
            backHref="/dashboard"
          />
        )}
        {result.test_type === 'listening' && (
          <ReadingListeningDrilldown testType="listening" feedback={result.feedback} />
        )}

        {/* Skill Breakdown - Phase 4 */}
        {result.feedback?.skill_breakdown && Object.keys(result.feedback.skill_breakdown).length > 0 && (
          <div className="mb-6">
            <SkillBreakdown
              breakdown={result.feedback.skill_breakdown}
              testType={result.test_type}
              expanded={true}
            />
          </div>
        )}
        
        {/* Progress Analytics */}
        <Card className="p-6 mb-6 bg-white border-0 shadow-lg rounded-2xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-violet-600" />
            {getText('Performance Analytics', 'Phân Tích Hiệu Suất', 'Performans Analizi')}
          </h3>
          <ProgressAnalytics
            overallBand={result.band_score}
            skillScores={{
              [result.test_type]: result.band_score
            }}
            testsCompleted={1}
            studyTime="--"
            weakAreas={
              result.feedback?.skill_breakdown ? 
              Object.entries(result.feedback.skill_breakdown)
                .filter(([_, data]) => {
                  const ratio = data.correct !== undefined ? data.correct / data.total : 0;
                  return ratio < 0.5;
                })
                .map(([skill]) => skill.replace(/_/g, ' '))
                .slice(0, 3) : []
            }
            language={language}
          />
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={() => navigate('/dashboard')} variant="outline" className="flex-1"><Home className="w-4 h-4 mr-2" /> Dashboard</Button>
          <Button onClick={() => navigate(`/test/${result.test_type}`)} className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0 shadow-lg shadow-purple-200"><TrendingUp className="w-4 h-4 mr-2" /> Practice Again</Button>
        </div>
      </div>
    </div>
  );
}
