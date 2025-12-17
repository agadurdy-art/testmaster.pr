import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Trophy, TrendingUp, CheckCircle, XCircle, Home } from 'lucide-react';
import { getBandScoreColor, getBandScoreBg } from '../lib/utils';
import api from '../lib/api';

export default function Results({ user }) {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedbackMode, setFeedbackMode] = useState('short'); // 'short' | 'detailed'

  useEffect(() => {
    loadResults();
  }, [attemptId]);

  const loadResults = async () => {
    try {
      const response = await api.get(`/test_attempts/${attemptId}`);
      setResult(response.data || response);
    } catch (error) {
      console.error('Failed to load results', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-gray-600 mb-4">Results not found</p>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 py-8 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Test Complete!</h1>
          <p className="text-xl text-gray-600 capitalize">
            {result.test_type} Module Results
          </p>
        </div>

        {/* Score Card */}
        <Card className="p-8 mb-6 animate-slide-in">
          <div className="text-center">
            <p className="text-gray-600 mb-2">Your Band Score</p>
            <p className={`text-7xl font-bold mb-6 ${getBandScoreColor(result.band_score)}`}>
              {result.band_score}
            </p>
            <div className="grid grid-cols-3 gap-6 pt-6 border-t">
              <div>
                <p className="text-3xl font-bold text-gray-900">{result.feedback.correct}</p>
                <p className="text-sm text-gray-600">Correct Answers</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {result.feedback.total - result.feedback.correct}
                </p>
                <p className="text-sm text-gray-600">Incorrect</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {Math.round(result.score)}%
                </p>
                <p className="text-sm text-gray-600">Score</p>
              </div>
            </div>
          </div>
        {/* Skill-based Breakdown for Reading & Listening */}
        {(result.test_type === 'reading' || result.test_type === 'listening') && result.feedback && result.feedback.skill_breakdown && (
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">Skill Breakdown</h3>
                <p className="text-sm text-gray-600">
                  See which question types you are strong at and which ones need more practice.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 text-sm">
                <span className="text-gray-600">Feedback mode:</span>
                <div className="inline-flex rounded-full border border-gray-200 bg-gray-50 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setFeedbackMode('short')}
                    className={`px-3 py-1 text-xs font-medium transition-colors ${
                      feedbackMode === 'short'
                        ? 'bg-sky-500 text-white'
                        : 'text-gray-600 hover:bg-white'
                    }`}
                  >
                    Summary
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeedbackMode('detailed')}
                    className={`px-3 py-1 text-xs font-medium transition-colors ${
                      feedbackMode === 'detailed'
                        ? 'bg-sky-500 text-white'
                        : 'text-gray-600 hover:bg-white'
                    }`}
                  >
                    Tips for improvement
                  </button>
                </div>
              </div>
            </div>

            {/* Skill grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {result.feedback.skill_breakdown.map((skill) => {
                const ratio = skill.total > 0 ? skill.correct / skill.total : 0;
                const percent = Math.round(ratio * 100);
                let badgeColor = 'bg-yellow-100 text-yellow-800 border-yellow-200';
                let badgeLabel = 'OK';
                if (skill.level === 'strong') {
                  badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-200';
                  badgeLabel = 'Strong area';
                } else if (skill.level === 'needs_practice') {
                  badgeColor = 'bg-rose-100 text-rose-800 border-rose-200';
                  badgeLabel = 'Needs practice';
                }

                return (
                  <div
                    key={skill.skill_id}
                    className="border border-gray-100 rounded-xl p-4 bg-white/70 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 leading-snug">
                          {skill.label}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {skill.correct}/{skill.total} correct ({percent}%).
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${badgeColor}`}
                      >
                        {badgeLabel}
                      </span>
                    </div>
                    {skill.short_comment && (
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {skill.short_comment}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Teacher-style feedback */}
            <div className="mt-2 border-t pt-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Teacher feedback</h4>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {feedbackMode === 'short'
                  ? result.feedback.teacher_feedback?.short
                  : result.feedback.teacher_feedback?.detailed}
              </p>
            </div>
          </Card>
        )}

        </Card>

        {/* Feedback */}
        <Card className="p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Feedback</h3>
          <p className="text-gray-700 leading-relaxed">{result.feedback.message}</p>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => navigate('/dashboard')}
            className="primary-gradient text-white"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <Button
            onClick={() => navigate(`/test/${result.test_type}`)}
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
