import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { 
  PenTool, CheckCircle, XCircle, AlertTriangle, ChevronDown, ChevronUp,
  Sparkles, Eye, FileText, Award, Lightbulb
} from 'lucide-react';

export default function WritingResultsPanel({ 
  originalText, 
  feedback, 
  modelEssay,
  bandScore,
  showComparison = true 
}) {
  const [activeTab, setActiveTab] = useState('feedback');
  const [showMistakes, setShowMistakes] = useState(true);

  // Highlight mistakes in original text
  const renderTextWithMistakes = () => {
    if (!feedback?.grammar_errors || feedback.grammar_errors.length === 0) {
      return <p className="text-gray-700 leading-relaxed">{originalText}</p>;
    }

    // Sort errors by position
    const errors = [...feedback.grammar_errors].sort((a, b) => a.start - b.start);
    const elements = [];
    let lastIndex = 0;

    errors.forEach((error, idx) => {
      // Add text before error
      if (error.start > lastIndex) {
        elements.push(
          <span key={`text-${idx}`}>
            {originalText.substring(lastIndex, error.start)}
          </span>
        );
      }

      // Add error highlight with tooltip
      const errorTypeColor = error.type === 'grammar' 
        ? 'bg-red-100 border-b-2 border-red-400' 
        : error.type === 'spelling'
        ? 'bg-yellow-100 border-b-2 border-yellow-400'
        : 'bg-orange-100 border-b-2 border-orange-400';

      elements.push(
        <span
          key={`error-${idx}`}
          className={`${errorTypeColor} cursor-help relative group px-0.5 rounded`}
          title={`${error.type}: ${error.suggestion}`}
        >
          {originalText.substring(error.start, error.end)}
          {/* Tooltip */}
          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
            {error.suggestion}
          </span>
        </span>
      );

      lastIndex = error.end;
    });

    // Add remaining text
    if (lastIndex < originalText.length) {
      elements.push(
        <span key="text-end">{originalText.substring(lastIndex)}</span>
      );
    }

    return <div className="text-gray-700 leading-relaxed">{elements}</div>;
  };

  // Band score color
  const getBandColor = (score) => {
    if (score >= 7) return 'text-green-600 bg-green-100';
    if (score >= 6) return 'text-blue-600 bg-blue-100';
    if (score >= 5) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="space-y-4">
      {/* Band Score Header */}
      {bandScore && (
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center shadow-lg">
                <Award className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Estimated Band Score</p>
                <p className={`text-4xl font-bold ${getBandColor(bandScore).split(' ')[0]}`}>
                  {bandScore}
                </p>
              </div>
            </div>
            
            {/* Score breakdown */}
            {feedback?.criteria_scores && (
              <div className="grid grid-cols-4 gap-4 text-center">
                {[
                  { label: 'Task', key: 'task_response' },
                  { label: 'Coherence', key: 'coherence' },
                  { label: 'Lexical', key: 'lexical_resource' },
                  { label: 'Grammar', key: 'grammatical_range' }
                ].map(({ label, key }) => (
                  <div key={key}>
                    <p className={`text-lg font-bold ${getBandColor(feedback.criteria_scores[key]).split(' ')[0]}`}>
                      {feedback.criteria_scores[key] || '-'}
                    </p>
                    <p className="text-xs text-gray-500">{label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-100 pb-2">
        <Button
          variant={activeTab === 'feedback' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('feedback')}
          className={activeTab === 'feedback' ? 'bg-violet-500' : ''}
        >
          <Sparkles className="w-4 h-4 mr-1" /> Feedback
        </Button>
        <Button
          variant={activeTab === 'original' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('original')}
          className={activeTab === 'original' ? 'bg-violet-500' : ''}
        >
          <Eye className="w-4 h-4 mr-1" /> Your Text
        </Button>
        {showComparison && modelEssay && (
          <Button
            variant={activeTab === 'compare' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('compare')}
            className={activeTab === 'compare' ? 'bg-violet-500' : ''}
          >
            <FileText className="w-4 h-4 mr-1" /> Band 8 Sample
          </Button>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === 'feedback' && feedback && (
        <Card className="p-6 bg-white border-0 shadow-lg">
          {/* Overall Feedback */}
          {feedback.overall_feedback && (
            <div className="mb-6 p-4 bg-violet-50 rounded-xl">
              <p className="text-gray-700 leading-relaxed">{feedback.overall_feedback}</p>
            </div>
          )}

          {/* Strengths */}
          {feedback.strengths?.length > 0 && (
            <div className="mb-4 p-4 bg-green-50 rounded-xl border border-green-100">
              <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Strengths
              </h4>
              <ul className="space-y-1">
                {feedback.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-green-700 flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Areas to Improve */}
          {feedback.areas_to_improve?.length > 0 && (
            <div className="mb-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
              <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Areas to Improve
              </h4>
              <ul className="space-y-1">
                {feedback.areas_to_improve.map((s, i) => (
                  <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                    <span className="text-amber-500 mt-1">•</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Grammar Upgrades */}
          {feedback.grammar_upgrade_examples?.length > 0 && (
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
              <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Suggested Upgrades
              </h4>
              <div className="space-y-3">
                {feedback.grammar_upgrade_examples.map((ex, i) => (
                  <div key={i} className="p-3 bg-white rounded-lg">
                    <p className="text-sm text-red-600 line-through mb-1">
                      {ex.original}
                    </p>
                    <p className="text-sm text-green-600 font-medium">
                      → {ex.upgraded}
                    </p>
                    {ex.explanation && (
                      <p className="text-xs text-gray-500 mt-1">
                        💡 {ex.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {activeTab === 'original' && (
        <Card className="p-6 bg-white border-0 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
              <Eye className="w-4 h-4" /> Your Original Text
            </h4>
            {feedback?.grammar_errors?.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMistakes(!showMistakes)}
              >
                {showMistakes ? 'Hide Mistakes' : 'Show Mistakes'}
              </Button>
            )}
          </div>
          
          {/* Legend */}
          {showMistakes && feedback?.grammar_errors?.length > 0 && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg flex gap-4 text-sm">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-red-200 border-b-2 border-red-400"></span>
                Grammar
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-yellow-200 border-b-2 border-yellow-400"></span>
                Spelling
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-orange-200 border-b-2 border-orange-400"></span>
                Style
              </span>
            </div>
          )}

          <div className="p-4 bg-gray-50 rounded-xl">
            {showMistakes ? renderTextWithMistakes() : (
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{originalText}</p>
            )}
          </div>

          {/* Word count */}
          <div className="mt-3 text-sm text-gray-500 text-right">
            Word count: {originalText?.split(/\s+/).filter(w => w).length || 0}
          </div>
        </Card>
      )}

      {activeTab === 'compare' && modelEssay && (
        <Card className="p-6 bg-white border-0 shadow-lg">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Award className="w-4 h-4 text-yellow-500" /> Band 8+ Model Essay
          </h4>
          
          <div className="p-4 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border border-amber-100">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {modelEssay}
            </p>
          </div>

          {/* Analysis Tips */}
          <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <h5 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" /> What Makes This Band 8+
            </h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Uses sophisticated vocabulary (e.g., "steward," "beholden," "circumvent")</li>
              <li>• Demonstrates complex sentence structures with varied beginnings</li>
              <li>• Presents a clear, nuanced argument with logical progression</li>
              <li>• Includes academic collocations and formal register</li>
              <li>• Shows excellent cohesion with appropriate linking devices</li>
            </ul>
          </div>
        </Card>
      )}
    </div>
  );
}
