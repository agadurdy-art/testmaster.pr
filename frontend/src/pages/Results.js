import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Trophy, TrendingUp, CheckCircle, XCircle, Home, ArrowLeft, Award, Target, BarChart3, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../lib/api';

export default function Results({ user }) {
  const { attemptId } = useParams();
  const navigate = useNavigate();
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
          <p className="text-gray-500">Loading results...</p>
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

        {/* Feedback Card */}
        {result.feedback?.ai_feedback && (
          <Card className="p-6 mb-6 bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-violet-500 flex items-center justify-center shadow-lg"><Lightbulb className="w-5 h-5 text-white" /></div>
              <h3 className="text-lg font-semibold text-violet-900">AI Feedback</h3>
            </div>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{result.feedback.ai_feedback}</p>
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
