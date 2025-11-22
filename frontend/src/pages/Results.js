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

  useEffect(() => {
    loadResults();
  }, [attemptId]);

  const loadResults = async () => {
    try {
      // For demo purposes, creating mock result
      setResult({
        id: attemptId,
        test_type: 'reading',
        score: 75,
        band_score: 7.0,
        feedback: {
          correct: 30,
          total: 40,
          percentage: 75,
          message: 'Great job! You got 30 out of 40 correct.'
        },
        time_taken: 3400,
        completed_at: new Date()
      });
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
