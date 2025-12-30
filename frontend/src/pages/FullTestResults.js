import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  ArrowLeft, Trophy, BookOpen, Headphones, PenTool, Mic,
  CheckCircle, XCircle, TrendingUp, TrendingDown, Target,
  Lightbulb, ChevronDown, ChevronUp, Loader2
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const SECTION_ICONS = {
  listening: Headphones,
  reading: BookOpen,
  writing: PenTool,
  speaking: Mic
};

const BAND_COLORS = {
  excellent: 'bg-green-500',
  good: 'bg-blue-500',
  moderate: 'bg-amber-500',
  needs_improvement: 'bg-red-500'
};

const getBandLevel = (band) => {
  if (band >= 7.5) return { level: 'excellent', label: 'Excellent' };
  if (band >= 6.0) return { level: 'good', label: 'Good' };
  if (band >= 5.0) return { level: 'moderate', label: 'Competent' };
  return { level: 'needs_improvement', label: 'Needs Improvement' };
};

export default function FullTestResults() {
  const { sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [results, setResults] = useState(location.state?.results || null);
  const [loading, setLoading] = useState(!location.state?.results);
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    if (!results) {
      loadResults();
    }
  }, [sessionId]);

  const loadResults = async () => {
    try {
      const res = await fetch(`${API_URL}/api/full-test/results/${sessionId}`);
      const data = await res.json();
      if (data.success) {
        setResults(data.results);
      }
    } catch (error) {
      console.error('Error loading results:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Results Not Available</h2>
          <p className="text-slate-600 mb-6">The results for this test session could not be found.</p>
          <Button onClick={() => navigate('/full-test')}>Back to Tests</Button>
        </Card>
      </div>
    );
  }

  const overallBand = results.overall?.band || 0;
  const bandLevel = getBandLevel(overallBand);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/question-bank')}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Question Bank
            </Button>
          </div>
          <Badge variant="outline">Test Results</Badge>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Overall Score Card */}
        <Card className="p-8 mb-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Trophy className="w-16 h-16 text-amber-400" />
            </div>
            <h1 className="text-2xl font-bold mb-2">IELTS-Style Test Complete</h1>
            <p className="text-slate-400 mb-6">Your estimated band score</p>
            
            <div className="inline-flex items-center gap-4 bg-white/10 rounded-2xl px-8 py-6">
              <div>
                <div className="text-6xl font-bold text-amber-400">{overallBand}</div>
                <div className="text-sm text-slate-400 mt-1">Overall Band</div>
              </div>
              <Badge className={`${BAND_COLORS[bandLevel.level]} text-white px-4 py-1`}>
                {bandLevel.label}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Section Scores Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {['listening', 'reading', 'writing', 'speaking'].map((section) => {
            const sectionResult = results.sections?.[section];
            const Icon = SECTION_ICONS[section];
            const band = sectionResult?.band || 0;
            const sectionBandLevel = getBandLevel(band);
            
            return (
              <Card key={section} className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-slate-600" />
                  </div>
                  <span className="font-medium text-slate-900 capitalize">{section}</span>
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-1">{band}</div>
                {sectionResult?.correct !== undefined && (
                  <div className="text-sm text-slate-500">
                    {sectionResult.correct}/{sectionResult.total} correct
                  </div>
                )}
                <Badge 
                  variant="outline" 
                  className={`mt-2 text-xs ${sectionBandLevel.level === 'excellent' ? 'border-green-500 text-green-600' : 
                    sectionBandLevel.level === 'good' ? 'border-blue-500 text-blue-600' : 
                    sectionBandLevel.level === 'moderate' ? 'border-amber-500 text-amber-600' : 
                    'border-red-500 text-red-600'}`}
                >
                  {sectionBandLevel.label}
                </Badge>
              </Card>
            );
          })}
        </div>

        {/* Detailed Section Results */}
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Detailed Results</h2>
        
        <div className="space-y-4">
          {/* Listening & Reading Details */}
          {['listening', 'reading'].map((section) => {
            const sectionResult = results.sections?.[section];
            const Icon = SECTION_ICONS[section];
            const isExpanded = expandedSections[section];
            
            if (!sectionResult?.details) return null;
            
            return (
              <Card key={section} className="overflow-hidden">
                <button
                  onClick={() => toggleSection(section)}
                  className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-slate-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-slate-900 capitalize">{section}</h3>
                      <p className="text-sm text-slate-500">
                        Band {sectionResult.band} • {sectionResult.correct}/{sectionResult.total} correct ({sectionResult.percentage}%)
                      </p>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </button>
                
                {isExpanded && (
                  <div className="border-t p-4 bg-slate-50">
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {sectionResult.details.map((detail, idx) => (
                        <div 
                          key={detail.question_id || idx} 
                          className={`p-3 rounded-lg flex items-start gap-3 ${detail.is_correct ? 'bg-green-50' : 'bg-red-50'}`}
                        >
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${detail.is_correct ? 'bg-green-500' : 'bg-red-500'}`}>
                            {detail.is_correct ? 
                              <CheckCircle className="w-4 h-4 text-white" /> : 
                              <XCircle className="w-4 h-4 text-white" />
                            }
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-slate-900">
                              Question {detail.question_id?.replace(/[^\d]/g, '') || idx + 1}
                            </div>
                            <div className="text-sm text-slate-600">
                              Your answer: <span className={detail.is_correct ? 'text-green-600' : 'text-red-600'}>{detail.user_answer || '(blank)'}</span>
                            </div>
                            {!detail.is_correct && (
                              <div className="text-sm text-slate-600">
                                Correct answer: <span className="text-green-600 font-medium">{detail.correct_answer}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}

          {/* Writing Results */}
          {results.sections?.writing && (
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <PenTool className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Writing</h3>
                  <p className="text-sm text-slate-500">Band {results.sections.writing.band}</p>
                </div>
              </div>
              
              {results.sections.writing.tasks?.map((task) => (
                <div key={task.task} className="mb-4 p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-medium text-slate-900 mb-2">Task {task.task}</h4>
                  <div className="text-2xl font-bold text-slate-900 mb-2">Band {task.band}</div>
                  
                  {task.criteria && (
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {Object.entries(task.criteria).map(([key, value]) => (
                        <div key={key} className="text-sm">
                          <span className="text-slate-500 capitalize">{key.replace(/_/g, ' ')}: </span>
                          <span className="font-medium text-slate-900">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {task.strengths && (
                    <div className="mb-2">
                      <p className="text-sm font-medium text-green-600 mb-1">Strengths:</p>
                      <ul className="text-sm text-slate-600 list-disc list-inside">
                        {task.strengths.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  )}
                  
                  {task.weaknesses && (
                    <div className="mb-2">
                      <p className="text-sm font-medium text-amber-600 mb-1">Areas for Improvement:</p>
                      <ul className="text-sm text-slate-600 list-disc list-inside">
                        {task.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                      </ul>
                    </div>
                  )}
                  
                  {task.feedback && (
                    <div className="p-3 bg-white rounded border">
                      <p className="text-sm text-slate-700">{task.feedback}</p>
                    </div>
                  )}
                </div>
              ))}
            </Card>
          )}

          {/* Speaking Results */}
          {results.sections?.speaking && (
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Mic className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Speaking</h3>
                  <p className="text-sm text-slate-500">Band {results.sections.speaking.band}</p>
                </div>
              </div>
              
              {results.sections.speaking.criteria && (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {Object.entries(results.sections.speaking.criteria).map(([key, value]) => (
                    <div key={key} className="p-3 bg-slate-50 rounded-lg">
                      <div className="text-xs text-slate-500 capitalize mb-1">{key.replace(/_/g, ' ')}</div>
                      <div className="text-xl font-bold text-slate-900">{value}</div>
                    </div>
                  ))}
                </div>
              )}
              
              {results.sections.speaking.strengths && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-green-600 mb-1">Strengths:</p>
                  <ul className="text-sm text-slate-600 list-disc list-inside">
                    {results.sections.speaking.strengths.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}
              
              {results.sections.speaking.weaknesses && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-amber-600 mb-1">Areas for Improvement:</p>
                  <ul className="text-sm text-slate-600 list-disc list-inside">
                    {results.sections.speaking.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
              )}
              
              {results.sections.speaking.feedback && (
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-700">{results.sections.speaking.feedback}</p>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Summary & Recommendations */}
        {results.summary && (
          <Card className="p-6 mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Mentor Notes</h3>
                <p className="text-blue-800 mb-4">{results.summary.recommendation}</p>
                
                {results.summary.recommended_lessons && (
                  <div>
                    <p className="text-sm font-medium text-blue-700 mb-2">Recommended Lessons:</p>
                    <div className="flex flex-wrap gap-2">
                      {results.summary.recommended_lessons.map((lesson, idx) => (
                        <Badge key={idx} variant="outline" className="bg-white border-blue-300 text-blue-700">
                          {lesson.title || lesson}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <Button variant="outline" onClick={() => navigate('/full-test')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tests
          </Button>
          <Button 
            className="bg-slate-900 hover:bg-slate-800"
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard
          </Button>
        </div>
      </main>
    </div>
  );
}
