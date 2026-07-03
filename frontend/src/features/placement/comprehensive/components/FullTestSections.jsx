import React from 'react';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Progress } from '../../../../components/ui/progress';
import {
  Mic, CheckCircle, Award, BookOpen, Target, Sparkles, Clock, Brain, Zap,
  TrendingUp, Lightbulb, ChevronRight,
} from 'lucide-react';
import ProgressAnalytics from '../../../../components/test/ProgressAnalytics';

// Full-test-only results sections (detailed breakdown, strengths &
// weaknesses, comprehensive analysis, action plan, course recommendations,
// learning roadmap, immediate actions, performance analytics), extracted
// verbatim from the results screen of pages/ComprehensiveLevelTest.js.
// Every block keeps its original `!isSingleSkillTest` guard.
export default function FullTestSections({
  isSingleSkillTest,
  results,
  language,
  getBandColor,
  navigate,
}) {
  return (
    <>
          {/* Detailed Breakdown - Only show for full test */}
          {!isSingleSkillTest && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Reading Skills */}
            {results.reading && (
            <Card className="p-6 bg-white shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                {language === 'vi' ? 'Kết Quả Đọc' : language === 'tr' ? 'Okuma Performansı' : 'Reading Performance'}
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Score</span>
                    <span className="text-sm font-bold text-blue-600">
                      {results.reading.correct}/{results.reading.total} correct
                    </span>
                  </div>
                  <Progress value={(results.reading.correct / results.reading.total) * 100} className="h-2" />
                </div>
                
                <div className="pt-2 border-t">
                  <h4 className="font-semibold text-gray-700 mb-2 text-sm">Skill Breakdown:</h4>
                  <div className="space-y-2">
                    {Object.entries(results.reading.skill_breakdown).map(([skill, data]) => {
                      const percentage = (data.correct / data.total) * 100;
                      return (
                        <div key={skill} className="text-xs">
                          <div className="flex justify-between mb-1">
                            <span className="text-gray-600 capitalize">{skill.replace(/_/g, ' ')}</span>
                            <span className="font-medium">{data.correct}/{data.total}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className={`h-1.5 rounded-full ${percentage >= 70 ? 'bg-green-500' : percentage >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Card>
            )}

            {/* Speaking Skills */}
            {results.speaking && (
            <Card className="p-6 bg-white shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Mic className="w-5 h-5 text-purple-600" />
                {language === 'vi' ? 'Kết Quả Nói' : language === 'tr' ? 'Konuşma Performansı' : 'Speaking Performance'}
              </h3>
              {results.speaking ? (
                <div className="space-y-3">
                  {results.speaking.criteria_scores && Object.entries(results.speaking.criteria_scores).map(([criterion, score]) => (
                    <div key={criterion}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {criterion.replace(/_/g, ' ')}
                        </span>
                        <span className="text-sm font-bold text-purple-600">{score.toFixed(1)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full bg-gradient-to-r ${getBandColor(score)}`}
                          style={{ width: `${(score / 9) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-purple-600">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-600 border-t-transparent" />
                    <span className="text-sm font-medium">
                      {language === 'vi' ? 'Đang phân tích...' :
                       language === 'tr' ? 'Analiz ediliyor...' :
                       'Analyzing your speaking...'}
                    </span>
                  </div>
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="flex justify-between mb-1">
                        <div className="h-4 bg-gray-200 rounded w-32" />
                        <div className="h-4 bg-gray-200 rounded w-8" />
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2" />
                    </div>
                  ))}
                </div>
              )}
            </Card>
            )}
          </div>
          )}

          {/* Strengths & Weaknesses - Only show for full test */}
          {!isSingleSkillTest && results.speaking && (
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Strengths */}
              <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-0">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  {language === 'vi' ? 'Điểm Mạnh' : language === 'tr' ? 'Güçlü Yönler' : 'Your Strengths'}
                </h3>
                <ul className="space-y-3">
                  {results.speaking.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <Sparkles className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Areas for Improvement */}
              <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-0">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-amber-600" />
                  {language === 'vi' ? 'Cần Cải Thiện' : language === 'tr' ? 'Geliştirilecek Alanlar' : 'Areas to Improve'}
                </h3>
                <ul className="space-y-3">
                  {results.speaking.weaknesses.map((weakness, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <TrendingUp className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <span>{weakness}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          )}

          {/* Detailed Feedback - Only for full test */}
          {!isSingleSkillTest && results.speaking?.detailed_feedback && (
            <Card className="p-6 bg-white shadow-lg mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-600" />
                {language === 'vi' ? 'Phân Tích Toàn Diện' : language === 'tr' ? 'Kapsamlı Analiz' : 'Comprehensive Analysis'}
              </h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {results.speaking.detailed_feedback}
              </p>
            </Card>
          )}

          {/* Improvement Recommendations - Only for full test */}
          {!isSingleSkillTest && results.speaking?.improvement_recommendations && (
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-0 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-blue-600" />
                {language === 'vi' ? 'Kế Hoạch Hành Động' : language === 'tr' ? 'Eylem Planı' : 'Action Plan: How to Improve'}
              </h3>
              <div className="space-y-4">
                {results.speaking.improvement_recommendations.map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-white p-4 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                      {idx + 1}
                    </div>
                    <p className="text-gray-700 text-sm pt-1">{rec}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Course Recommendations - Only for full test */}
          {!isSingleSkillTest && results.recommendations && (
            <>
              <Card className="p-8 bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-2xl mb-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Award className="w-6 h-6" />
                  Recommended Courses for You
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {results.recommendations.recommended_courses.map((course, idx) => (
                    <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-bold">
                          {course.priority}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold mb-2">{course.name}</h3>
                      <p className="text-white/80 text-sm mb-2">{course.band_range}</p>
                      <p className="text-white/90 mb-4">{course.reason}</p>
                      <Button
                        onClick={() => {
                          // Navigate to the appropriate course page
                          const courseRoutes = {
                            'beginner': '/beginner-english',
                            'mastery': '/mastery-course',
                            'advanced': '/advanced-mastery'
                          };
                          const route = courseRoutes[course.id] || `/lesson-preview/${course.id}/1`;
                          navigate(route);
                        }}
                        className="w-full bg-white text-violet-600 hover:bg-gray-100"
                      >
                        Explore Course
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Learning Roadmap */}
              {results.recommendations.learning_roadmap && (
                <Card className="p-8 bg-white shadow-lg mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Target className="w-6 h-6 text-violet-600" />
                    Your Personalized Learning Roadmap
                  </h3>
                  
                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-violet-50 p-4 rounded-lg text-center">
                      <p className="text-sm text-gray-600 mb-1">Current Band</p>
                      <p className="text-3xl font-bold text-violet-600">{results.overall_band.toFixed(1)}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <p className="text-sm text-gray-600 mb-1">Target Band</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {results.recommendations.learning_roadmap.target_band?.toFixed(1) || (results.overall_band + 1.0).toFixed(1)}
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <p className="text-sm text-gray-600 mb-1">Timeline</p>
                      <p className="text-3xl font-bold text-green-600">
                        {results.recommendations.learning_roadmap.estimated_weeks || 12} weeks
                      </p>
                    </div>
                  </div>

                  {results.recommendations.learning_roadmap.milestone_goals && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">Milestone Goals:</h4>
                      {results.recommendations.learning_roadmap.milestone_goals.map((milestone, idx) => (
                        <div key={idx} className="flex items-start gap-4 border-l-4 border-violet-500 pl-4 py-2">
                          <div className="flex-shrink-0">
                            <Clock className="w-5 h-5 text-violet-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">Week {milestone.weeks}</p>
                            <p className="text-sm text-gray-600">{milestone.goal}</p>
                            <p className="text-sm font-semibold text-violet-600 mt-1">
                              Target: Band {milestone.band_target?.toFixed(1)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              )}

              {/* Immediate Actions */}
              <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-0 mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-green-600" />
                  Start Today: Immediate Actions
                </h3>
                <ul className="space-y-3">
                  {results.recommendations.immediate_actions.map((action, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{action}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </>
          )}

          {/* Progress Analytics Section - For Full Test */}
          {!isSingleSkillTest && results.overall_band && (
            <Card className="p-6 bg-white shadow-lg mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-violet-600" />
                {language === 'vi' ? 'Phân Tích Tiến Độ' : language === 'tr' ? 'İlerleme Analizi' : 'Performance Analytics'}
              </h3>
              <ProgressAnalytics
                overallBand={results.overall_band}
                skillScores={{
                  reading: results.reading?.band || 0,
                  listening: results.listening?.band_score || 0,
                  writing: results.writing?.overall_band || 0,
                  speaking: results.speaking?.overall_band || 0
                }}
                testsCompleted={1}
                studyTime="--"
                weakAreas={
                  results.reading?.skill_breakdown ? 
                  Object.entries(results.reading.skill_breakdown)
                    .filter(([_, data]) => data.correct < data.total)
                    .map(([skill]) => skill.replace(/_/g, ' '))
                    .slice(0, 3) : []
                }
                language={language}
              />
            </Card>
          )}
    </>
  );
}
