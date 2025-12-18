import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { 
  Trophy, TrendingUp, CheckCircle, XCircle, Home, ArrowLeft,
  Award, Target, BarChart3, Lightbulb, ChevronDown, ChevronUp
} from 'lucide-react';
import { getBandScoreColor, getBandScoreBg } from '../lib/utils';
import api from '../lib/api';

export default function Results({ user }) {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

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

  const getBandColorClass = (score) => {
    if (score >= 7) return 'text-green-400';
    if (score >= 6) return 'text-cyan-400';
    if (score >= 5) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getBandBgClass = (score) => {
    if (score >= 7) return 'from-green-500 to-emerald-600';
    if (score >= 6) return 'from-cyan-500 to-blue-600';
    if (score >= 5) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-pink-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="p-8 text-center bg-white/5 backdrop-blur-xl border-white/10">
          <p className="text-gray-400 mb-4">Results not found</p>
          <Button onClick={() => navigate('/dashboard')} className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white border-0">
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4 sm:px-6">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/dashboard')} 
          className="mb-6 text-gray-400 hover:text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className={`w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${getBandBgClass(result.band_score)} flex items-center justify-center shadow-2xl`}>
            <Trophy className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Test Complete!</h1>
          <p className="text-xl text-gray-400 capitalize">
            {result.test_type} Module Results
          </p>
        </div>

        {/* Main Score Card */}
        <Card className="p-8 mb-6 bg-white/5 backdrop-blur-xl border-white/10 text-center">
          <p className="text-gray-400 mb-2 text-lg">Your Band Score</p>
          <p className={`text-8xl font-bold mb-8 ${getBandColorClass(result.band_score)}`}>
            {result.band_score}
          </p>
          
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/10">
            <div>
              <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <p className="text-3xl font-bold text-white">{result.feedback?.correct || 0}</p>
              <p className="text-sm text-gray-400">Correct</p>
            </div>
            <div>
              <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-red-500/20 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-400" />
              </div>
              <p className="text-3xl font-bold text-white">
                {(result.feedback?.total || 0) - (result.feedback?.correct || 0)}
              </p>
              <p className="text-sm text-gray-400">Incorrect</p>
            </div>
            <div>
              <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-400" />
              </div>
              <p className="text-3xl font-bold text-white">
                {Math.round(result.score || 0)}%
              </p>
              <p className="text-sm text-gray-400">Score</p>
            </div>
          </div>
        </Card>

        {/* Skill Breakdown */}
        {(result.test_type === 'reading' || result.test_type === 'listening') && result.feedback?.skill_breakdown && (
          <Card className="p-6 mb-6 bg-white/5 backdrop-blur-xl border-white/10">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setShowDetails(!showDetails)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Skill Breakdown</h3>
                  <p className="text-sm text-gray-400">See your performance by question type</p>
                </div>
              </div>
              {showDetails ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </div>
            
            {showDetails && (
              <div className="mt-6 space-y-4">
                {Object.entries(result.feedback.skill_breakdown).map(([skill, data]) => (
                  <div key={skill} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div>
                      <p className="font-medium text-white capitalize">{skill.replace(/_/g, ' ')}</p>
                      <p className="text-sm text-gray-400">{data.correct}/{data.total} correct</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      data.correct/data.total >= 0.7 ? 'bg-green-500/20 text-green-400' :
                      data.correct/data.total >= 0.5 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {Math.round((data.correct/data.total) * 100)}%
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Feedback Card */}
        {result.feedback?.ai_feedback && (
          <Card className="p-6 mb-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl border-purple-500/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/30 flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">AI Feedback</h3>
            </div>
            <p className="text-gray-300 leading-relaxed whitespace-pre-line">
              {result.feedback.ai_feedback}
            </p>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="outline"
            className="flex-1 border-white/20 text-white hover:bg-white/10"
          >
            <Home className="w-4 h-4 mr-2" /> Dashboard
          </Button>
          <Button
            onClick={() => navigate(`/test/${result.test_type}`)}
            className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 text-white border-0"
          >
            <TrendingUp className="w-4 h-4 mr-2" /> Practice Again
          </Button>
        </div>
      </div>
    </div>
  );
}
