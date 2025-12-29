import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  ArrowLeft, Award, CheckCircle, XCircle, TrendingUp,
  BookOpen, Headphones, PenTool, Mic, Download, Share2,
  ChevronDown, ChevronUp
} from 'lucide-react';

const SECTION_ICONS = {
  listening: Headphones,
  reading: BookOpen,
  writing: PenTool,
  speaking: Mic
};

export default function FullTestResults({ user }) {
  const { sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [results, setResults] = useState(location.state?.results || null);
  const [expandedSection, setExpandedSection] = useState(null);

  const getBandColor = (band) => {
    if (band >= 7.0) return 'text-green-600';
    if (band >= 5.5) return 'text-amber-600';
    return 'text-red-600';
  };

  const getBandBg = (band) => {
    if (band >= 7.0) return 'bg-green-50 border-green-200';
    if (band >= 5.5) return 'bg-amber-50 border-amber-200';
    return 'bg-red-50 border-red-200';
  };

  if (!results) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Results Not Available</h2>
          <p className="text-slate-600 mb-4">Unable to load test results.</p>
          <Button onClick={() => navigate('/full-test')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Tests
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/full-test')}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <div className="border-l pl-4">
              <h1 className="text-lg font-semibold text-slate-900">Test Results</h1>
              <p className="text-sm text-slate-500">IELTS-Style Full Test</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Overall Band Score */}
        <Card className="p-8 mb-8 text-center">
          <Award className="w-12 h-12 mx-auto text-slate-400 mb-4" />
          <p className="text-sm text-slate-500 uppercase tracking-wide mb-2">Overall Band Score</p>
          <p className={`text-6xl font-bold ${getBandColor(results.overall?.band)}`}>
            {results.overall?.band || 'N/A'}
          </p>
          {results.summary?.recommendation && (
            <p className="text-sm text-slate-600 mt-4 max-w-lg mx-auto">
              {results.summary.recommendation}
            </p>
          )}
        </Card>

        {/* Section Scores */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {['listening', 'reading', 'writing', 'speaking'].map((section) => {
            const sectionResult = results.sections?.[section];
            const Icon = SECTION_ICONS[section];
            const band = sectionResult?.band || 0;
            
            return (
              <Card key={section} className={`p-4 ${getBandBg(band)}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-slate-600" />
                  <span className="text-sm font-medium text-slate-700 capitalize">{section}</span>
                </div>
                <p className={`text-3xl font-bold ${getBandColor(band)}`}>
                  {band || '-'}
                </p>
                {sectionResult?.correct !== undefined && (
                  <p className="text-xs text-slate-500 mt-1">
                    {sectionResult.correct}/{sectionResult.total} correct
                  </p>
                )}
              </Card>
            );
          })}
        </div>

        {/* Detailed Results per Section */}
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Detailed Results</h2>
        
        <div className="space-y-4">
          {['listening', 'reading', 'writing', 'speaking'].map((section) => {
            const sectionResult = results.sections?.[section];
            if (!sectionResult) return null;
            
            const Icon = SECTION_ICONS[section];
            const isExpanded = expandedSection === section;
            
            return (
              <Card key={section} className="overflow-hidden">
                <button
                  onClick={() => setExpandedSection(isExpanded ? null : section)}
                  className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-slate-600" />
                    <span className="font-medium text-slate-900 capitalize">{section}</span>
                    <Badge className={getBandBg(sectionResult.band)}>
                      Band {sectionResult.band}
                    </Badge>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </button>
                
                {isExpanded && (
                  <div className="border-t p-4 bg-slate-50">
                    {/* Criteria breakdown for writing/speaking */}
                    {sectionResult.criteria && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-slate-700 mb-2">Criteria Scores</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(sectionResult.criteria).map(([key, value]) => (
                            <div key={key} className="flex justify-between p-2 bg-white rounded">
                              <span className="text-sm text-slate-600 capitalize">
                                {key.replace(/_/g, ' ')}
                              </span>
                              <span className="font-medium">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Feedback for writing/speaking */}
                    {sectionResult.feedback && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-slate-700 mb-2">Examiner Feedback</h4>
                        <p className="text-sm text-slate-600 bg-white p-3 rounded">
                          {sectionResult.feedback}
                        </p>
                      </div>
                    )}
                    
                    {/* Task results for writing */}
                    {sectionResult.tasks && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-slate-700 mb-2">Task Breakdown</h4>
                        {sectionResult.tasks.map((task) => (
                          <div key={task.task} className="bg-white p-3 rounded mb-2">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium">Task {task.task}</span>
                              <Badge>Band {task.band}</Badge>
                            </div>
                            {task.feedback && (
                              <p className="text-sm text-slate-600">{task.feedback}</p>
                            )}
                            {task.strengths && (
                              <div className="mt-2">
                                <span className="text-xs text-green-600">Strengths: </span>
                                <span className="text-xs text-slate-600">{task.strengths.join(', ')}</span>
                              </div>
                            )}
                            {task.weaknesses && (
                              <div className="mt-1">
                                <span className="text-xs text-red-600">Areas to improve: </span>
                                <span className="text-xs text-slate-600">{task.weaknesses.join(', ')}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Question details for listening/reading */}
                    {sectionResult.details && (
                      <div>
                        <h4 className="text-sm font-medium text-slate-700 mb-2">
                          Answer Review ({sectionResult.correct}/{sectionResult.total} correct)
                        </h4>
                        <div className="max-h-64 overflow-y-auto space-y-1">
                          {sectionResult.details.map((d, idx) => (
                            <div 
                              key={idx}
                              className={`flex items-center justify-between p-2 rounded text-sm ${
                                d.is_correct ? 'bg-green-50' : 'bg-red-50'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {d.is_correct ? (
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-red-600" />
                                )}
                                <span className="text-slate-700">Q{d.question_id.replace(/\D/g, '')}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-slate-600">Your: {d.user_answer || '-'}</span>
                                {!d.is_correct && (
                                  <span className="text-green-600 ml-2">
                                    Correct: {d.correct_answer}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Strengths & Weaknesses */}
                    {(sectionResult.strengths || sectionResult.weaknesses) && (
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        {sectionResult.strengths && (
                          <div className="bg-green-50 p-3 rounded">
                            <h5 className="text-sm font-medium text-green-700 mb-1">Strengths</h5>
                            <ul className="text-xs text-green-600 space-y-1">
                              {sectionResult.strengths.map((s, i) => (
                                <li key={i}>• {s}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {sectionResult.weaknesses && (
                          <div className="bg-red-50 p-3 rounded">
                            <h5 className="text-sm font-medium text-red-700 mb-1">Areas to Improve</h5>
                            <ul className="text-xs text-red-600 space-y-1">
                              {sectionResult.weaknesses.map((w, i) => (
                                <li key={i}>• {w}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-4 mt-8 justify-center">
          <Button variant="outline" onClick={() => navigate('/full-test')}>
            Take Another Test
          </Button>
          <Button className="bg-slate-900 hover:bg-slate-800">
            <Download className="w-4 h-4 mr-2" /> Download Report
          </Button>
        </div>
      </main>
    </div>
  );
}
