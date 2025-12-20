import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { 
  BarChart3, TrendingUp, Target, Award, ChevronDown, ChevronUp,
  CheckCircle, XCircle, BookOpen, Headphones, PenTool
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Question type labels for better display
const QUESTION_TYPE_LABELS = {
  'true_false_ng': 'True/False/Not Given',
  'multiple_choice': 'Multiple Choice',
  'sentence_completion': 'Sentence Completion',
  'summary_completion': 'Summary Completion',
  'matching_info': 'Matching Information',
  'matching_features': 'Matching Features',
  'matching_headings': 'Matching Headings',
  'identify_view': 'Identify View/Claim',
  'vocabulary_match': 'Vocabulary Matching',
  'short_answer': 'Short Answer',
  'diagram_labeling': 'Diagram Labeling',
  'note_completion': 'Note Completion',
  'table_completion': 'Table Completion',
  'flow_chart': 'Flow Chart Completion'
};

// Get skill icon based on type
const getSkillIcon = (type) => {
  if (type.includes('match') || type.includes('vocabulary')) return <Target className="w-4 h-4" />;
  if (type.includes('completion')) return <PenTool className="w-4 h-4" />;
  if (type.includes('true_false') || type.includes('identify')) return <CheckCircle className="w-4 h-4" />;
  return <BookOpen className="w-4 h-4" />;
};

export default function SkillBreakdown({ 
  breakdown, 
  testType,
  showCumulative = false,
  userId,
  expanded: initialExpanded = false 
}) {
  const [expanded, setExpanded] = useState(initialExpanded);
  const [cumulativeData, setCumulativeData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showCumulative && userId) {
      loadCumulativeData();
    }
  }, [showCumulative, userId]);

  const loadCumulativeData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/skill-analytics/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setCumulativeData(data);
      }
    } catch (e) {
      console.error('Failed to load cumulative data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate performance percentage
  const getPercentage = (correct, total) => {
    if (total === 0) return 0;
    return Math.round((correct / total) * 100);
  };

  // Get color class based on percentage
  const getColorClass = (percentage) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 60) return 'text-blue-600 bg-blue-100';
    if (percentage >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  // Get progress bar color
  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Render single test breakdown
  const renderTestBreakdown = (data) => {
    if (!data || Object.keys(data).length === 0) {
      return (
        <p className="text-sm text-gray-400 text-center py-4">
          No skill data available
        </p>
      );
    }

    // Convert object to array and sort by performance
    const skills = Object.entries(data).map(([type, info]) => ({
      type,
      label: QUESTION_TYPE_LABELS[type] || type.replace(/_/g, ' '),
      ...info
    })).sort((a, b) => getPercentage(a.correct, a.total) - getPercentage(b.correct, b.total));

    return (
      <div className="space-y-3">
        {skills.map((skill) => {
          const percentage = getPercentage(skill.correct, skill.total);
          return (
            <div key={skill.type} className="p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getSkillIcon(skill.type)}
                  <span className="font-medium text-gray-900 text-sm capitalize">
                    {skill.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {skill.correct}/{skill.total}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getColorClass(percentage)}`}>
                    {percentage}%
                  </span>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getProgressColor(percentage)} transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              {/* Tip if available */}
              {skill.tip && (
                <p className="mt-2 text-xs text-gray-500 italic">
                  💡 {skill.tip}
                </p>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Render cumulative analytics
  const renderCumulativeAnalytics = () => {
    if (loading) {
      return (
        <div className="text-center py-4">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Loading analytics...</p>
        </div>
      );
    }

    if (!cumulativeData) {
      return (
        <p className="text-sm text-gray-400 text-center py-4">
          Complete more tests to see cumulative analytics
        </p>
      );
    }

    return (
      <div className="space-y-4">
        {/* Overall Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-blue-50 rounded-xl text-center">
            <p className="text-2xl font-bold text-blue-600">{cumulativeData.total_tests || 0}</p>
            <p className="text-xs text-gray-500">Tests Taken</p>
          </div>
          <div className="p-3 bg-green-50 rounded-xl text-center">
            <p className="text-2xl font-bold text-green-600">
              {cumulativeData.average_score ? Math.round(cumulativeData.average_score) : 0}%
            </p>
            <p className="text-xs text-gray-500">Avg Score</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-xl text-center">
            <p className="text-2xl font-bold text-purple-600">
              {cumulativeData.average_band || '-'}
            </p>
            <p className="text-xs text-gray-500">Avg Band</p>
          </div>
        </div>

        {/* Skill Performance Over Time */}
        {cumulativeData.skill_performance && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Performance by Question Type
            </h4>
            {renderTestBreakdown(cumulativeData.skill_performance)}
          </div>
        )}

        {/* Strengths */}
        {cumulativeData.strengths?.length > 0 && (
          <div className="p-4 bg-green-50 rounded-xl border border-green-100">
            <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
              <Award className="w-4 h-4" /> Your Strengths
            </h4>
            <ul className="space-y-1">
              {cumulativeData.strengths.map((s, i) => (
                <li key={i} className="text-sm text-green-700 flex items-center gap-2">
                  <CheckCircle className="w-3 h-3" />
                  {QUESTION_TYPE_LABELS[s] || s.replace(/_/g, ' ')}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Areas to Improve */}
        {cumulativeData.areas_to_improve?.length > 0 && (
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
            <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" /> Focus Areas
            </h4>
            <ul className="space-y-1">
              {cumulativeData.areas_to_improve.map((s, i) => (
                <li key={i} className="text-sm text-amber-700 flex items-center gap-2">
                  <XCircle className="w-3 h-3" />
                  {QUESTION_TYPE_LABELS[s] || s.replace(/_/g, ' ')}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="p-4 bg-white border-0 shadow-lg rounded-2xl">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {showCumulative ? 'Overall Skill Analytics' : 'Skill Breakdown'}
            </h3>
            <p className="text-sm text-gray-500">
              {showCumulative ? 'Performance across all tests' : 'Performance by question type'}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          {expanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </Button>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          {showCumulative ? renderCumulativeAnalytics() : renderTestBreakdown(breakdown)}
        </div>
      )}
    </Card>
  );
}
