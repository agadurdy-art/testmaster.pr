import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Trophy, TrendingUp, CheckCircle, XCircle, Home, ArrowLeft, Award, Target, BarChart3, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../lib/api';
import { useI18n } from '../lib/i18n';

export default function Results({ user }) {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const { t, language } = useI18n();
  const isVi = language === 'vi';
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

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

        {/* Skill Breakdown */}
        {(result.test_type === 'reading' || result.test_type === 'listening') && result.feedback?.skill_breakdown && (
          <Card className="p-6 mb-6 bg-white border-0 shadow-lg rounded-2xl">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowDetails(!showDetails)}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500 flex items-center justify-center shadow-lg"><BarChart3 className="w-5 h-5 text-white" /></div>
                <div><h3 className="text-lg font-semibold text-gray-900">Skill Breakdown</h3><p className="text-sm text-gray-500">See performance by question type</p></div>
              </div>
              {showDetails ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </div>
            {showDetails && (
              <div className="mt-6 space-y-4">
                {Object.entries(result.feedback.skill_breakdown).map(([skill, data]) => (
                  <div key={skill} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div><p className="font-medium text-gray-900 capitalize">{skill.replace(/_/g, ' ')}</p><p className="text-sm text-gray-500">{data.correct}/{data.total} correct</p></div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${data.correct/data.total >= 0.7 ? 'bg-green-100 text-green-700' : data.correct/data.total >= 0.5 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{Math.round((data.correct/data.total) * 100)}%</div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Teacher Feedback Card - For Reading/Listening */}
        {(result.test_type === 'reading' || result.test_type === 'listening') && result.feedback?.teacher_feedback && (
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
                  <h4 className="font-semibold text-green-800">Your Strengths</h4>
                </div>
                <div className="space-y-2">
                  {result.feedback.skill_breakdown?.filter(s => (s.correct / s.total) >= 0.7).slice(0, 3).map((skill, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-green-700 capitalize">{skill.label || skill.skill_id?.replace(/_/g, ' ')}</span>
                      <span className="font-medium text-green-800">{Math.round((skill.correct / skill.total) * 100)}%</span>
                    </div>
                  ))}
                  {(!result.feedback.skill_breakdown || result.feedback.skill_breakdown.filter(s => (s.correct / s.total) >= 0.7).length === 0) && (
                    <p className="text-sm text-green-600">Keep practicing to identify your strengths!</p>
                  )}
                </div>
              </div>

              {/* Areas to Improve */}
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-amber-600" />
                  <h4 className="font-semibold text-amber-800">Areas to Improve</h4>
                </div>
                <div className="space-y-2">
                  {result.feedback.skill_breakdown?.filter(s => (s.correct / s.total) < 0.5).slice(0, 3).map((skill, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-amber-700 capitalize">{skill.label || skill.skill_id?.replace(/_/g, ' ')}</span>
                      <span className="font-medium text-amber-800">{Math.round((skill.correct / skill.total) * 100)}%</span>
                    </div>
                  ))}
                  {(!result.feedback.skill_breakdown || result.feedback.skill_breakdown.filter(s => (s.correct / s.total) < 0.5).length === 0) && (
                    <p className="text-sm text-amber-600">Great job! No major weaknesses detected.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Detailed Tips */}
            <div className="bg-violet-50 rounded-xl p-4 border border-violet-100">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-violet-600" />
                <h4 className="font-semibold text-violet-800">💡 Tips to Improve</h4>
              </div>
              <p className="text-gray-700 leading-relaxed text-sm">{result.feedback.teacher_feedback.detailed}</p>
            </div>

            {/* Skill-specific Tips */}
            {result.feedback.skill_breakdown?.filter(s => s.tip && (s.correct / s.total) < 0.7).length > 0 && (
              <div className="mt-4 space-y-3">
                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Focused Practice Recommendations
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

        {/* AI Feedback Card - For Writing/Speaking */}
        {result.feedback?.ai_feedback && (
          <Card className="p-6 mb-6 bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-violet-500 flex items-center justify-center shadow-lg"><Lightbulb className="w-5 h-5 text-white" /></div>
              <h3 className="text-lg font-semibold text-violet-900">AI Feedback</h3>
            </div>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{result.feedback.ai_feedback}</p>
          </Card>
        )}

        {/* Question-by-Question Results - For Reading/Listening */}
        {(result.test_type === 'reading' || result.test_type === 'listening') && result.feedback?.question_results?.length > 0 && (
          <Card className="p-6 mb-6 bg-white border-0 shadow-lg rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">📝 Answer Review</h3>
                  <p className="text-sm text-gray-500">
                    {result.feedback.correct} correct / {result.feedback.total} total
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <span className="flex items-center gap-1 text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                  <CheckCircle className="w-3 h-3" /> Correct
                </span>
                <span className="flex items-center gap-1 text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
                  <XCircle className="w-3 h-3" /> Incorrect
                </span>
              </div>
            </div>
            
            {/* Questions List */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {result.feedback.question_results.map((q, idx) => (
                <div 
                  key={idx} 
                  className={`p-4 rounded-xl border-l-4 ${
                    q.is_correct 
                      ? 'bg-green-50 border-green-500' 
                      : 'bg-red-50 border-red-500'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                          q.is_correct ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}>
                          {q.question_id}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-gray-200 text-gray-600 capitalize">
                          {q.question_type?.replace(/_/g, ' ') || 'Question'}
                        </span>
                        {q.is_correct ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-800 mb-3">{q.question_text}</p>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Your answer: </span>
                          <span className={`font-semibold ${q.is_correct ? 'text-green-700' : 'text-red-700'}`}>
                            {q.user_answer || '(no answer)'}
                          </span>
                        </div>
                        {!q.is_correct && (
                          <div>
                            <span className="text-gray-500">Correct answer: </span>
                            <span className="font-semibold text-green-700">{q.correct_answer}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Stats */}
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{result.feedback.question_results.filter(q => q.is_correct).length}</p>
                <p className="text-xs text-green-700">Correct</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">{result.feedback.question_results.filter(q => !q.is_correct).length}</p>
                <p className="text-xs text-red-700">Incorrect</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{Math.round(result.feedback.percentage)}%</p>
                <p className="text-xs text-blue-700">Accuracy</p>
              </div>
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={() => navigate('/dashboard')} variant="outline" className="flex-1"><Home className="w-4 h-4 mr-2" /> Dashboard</Button>
          <Button onClick={() => navigate(`/test/${result.test_type}`)} className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0 shadow-lg shadow-purple-200"><TrendingUp className="w-4 h-4 mr-2" /> Practice Again</Button>
        </div>
      </div>
    </div>
  );
}
