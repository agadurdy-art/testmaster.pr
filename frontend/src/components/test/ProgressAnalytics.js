import React from 'react';
import { TrendingUp, Target, Clock, Award, AlertTriangle, BookOpen, Headphones, PenTool, Mic } from 'lucide-react';
import { Card } from '../ui/card';

/**
 * Enhanced Progress Analytics Component
 * Shows detailed performance analytics with charts and recommendations
 */
const ProgressAnalytics = ({
  overallBand,
  skillScores = {}, // { reading: 6.5, listening: 7.0, writing: 6.0, speaking: 6.5 }
  testsCompleted = 0,
  studyTime = '0h',
  weakAreas = [], // ['True/False/Not Given', 'Matching Headings']
  bandTrend = [], // [{ week: 'W1', score: 5.5 }, ...]
  questionTypePerformance = {}, // { 'MCQ': 85, 'Fill in blank': 65 }
  language = 'en'
}) => {
  const labels = {
    en: {
      overallBand: 'Overall Band Score',
      testsCompleted: 'Tests Completed',
      studyTime: 'Study Time',
      thisMonth: 'This month',
      thisWeek: 'This week',
      skillsBreakdown: 'Skills Breakdown',
      areasToImprove: 'Areas to Improve',
      bandScoreTrend: 'Band Score Trend',
      questionTypes: 'Performance by Question Type',
      reading: 'Reading',
      listening: 'Listening',
      writing: 'Writing',
      speaking: 'Speaking',
      fromLastMonth: 'from last month'
    },
    vi: {
      overallBand: 'Điểm Band Tổng',
      testsCompleted: 'Bài Test Hoàn Thành',
      studyTime: 'Thời Gian Học',
      thisMonth: 'Tháng này',
      thisWeek: 'Tuần này',
      skillsBreakdown: 'Phân Tích Kỹ Năng',
      areasToImprove: 'Cần Cải Thiện',
      bandScoreTrend: 'Xu Hướng Điểm Band',
      questionTypes: 'Hiệu Suất Theo Loại Câu Hỏi',
      reading: 'Đọc',
      listening: 'Nghe',
      writing: 'Viết',
      speaking: 'Nói',
      fromLastMonth: 'so với tháng trước'
    },
    tr: {
      overallBand: 'Genel Band Puanı',
      testsCompleted: 'Tamamlanan Testler',
      studyTime: 'Çalışma Süresi',
      thisMonth: 'Bu ay',
      thisWeek: 'Bu hafta',
      skillsBreakdown: 'Beceri Analizi',
      areasToImprove: 'Geliştirilecek Alanlar',
      bandScoreTrend: 'Band Puanı Trendi',
      questionTypes: 'Soru Tipine Göre Performans',
      reading: 'Okuma',
      listening: 'Dinleme',
      writing: 'Yazma',
      speaking: 'Konuşma',
      fromLastMonth: 'geçen aya göre'
    }
  };

  const t = labels[language] || labels.en;

  const skillIcons = {
    reading: BookOpen,
    listening: Headphones,
    writing: PenTool,
    speaking: Mic
  };

  const skillColors = {
    reading: 'bg-blue-500',
    listening: 'bg-cyan-500',
    writing: 'bg-amber-500',
    speaking: 'bg-purple-500'
  };

  const getBandColor = (band) => {
    if (band >= 7) return 'text-green-600';
    if (band >= 6) return 'text-blue-600';
    if (band >= 5) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Overall Band */}
        <Card className="p-6 bg-gradient-to-br from-violet-50 to-purple-50 border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t.overallBand}</p>
              <p className={`text-4xl font-bold mt-1 ${getBandColor(overallBand)}`}>
                {overallBand?.toFixed(1) || '—'}
              </p>
              <p className="text-xs text-green-600 mt-1">↑ 0.5 {t.fromLastMonth}</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-violet-100 flex items-center justify-center">
              <Award className="w-7 h-7 text-violet-600" />
            </div>
          </div>
        </Card>

        {/* Tests Completed */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t.testsCompleted}</p>
              <p className="text-4xl font-bold mt-1 text-blue-600">{testsCompleted}</p>
              <p className="text-xs text-gray-500 mt-1">{t.thisMonth}</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
              <Target className="w-7 h-7 text-blue-600" />
            </div>
          </div>
        </Card>

        {/* Study Time */}
        <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t.studyTime}</p>
              <p className="text-4xl font-bold mt-1 text-green-600">{studyTime}</p>
              <p className="text-xs text-gray-500 mt-1">{t.thisWeek}</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
              <Clock className="w-7 h-7 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Skills Breakdown */}
      <Card className="p-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-violet-600" />
          {t.skillsBreakdown}
        </h3>
        <div className="space-y-4">
          {Object.entries(skillScores).map(([skill, score]) => {
            const IconComponent = skillIcons[skill] || BookOpen;
            const colorClass = skillColors[skill] || 'bg-gray-500';
            const skillLabel = t[skill] || skill;
            
            return (
              <div key={skill} className="flex items-center gap-4">
                <div className="flex items-center gap-2 w-24">
                  <IconComponent className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{skillLabel}</span>
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-4">
                  <div
                    className={`${colorClass} h-4 rounded-full transition-all duration-500`}
                    style={{ width: `${(score / 9) * 100}%` }}
                  ></div>
                </div>
                <span className="font-bold text-gray-800 w-12 text-right">
                  {score?.toFixed(1) || '—'}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Areas to Improve */}
      {weakAreas.length > 0 && (
        <Card className="p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            {t.areasToImprove}
          </h3>
          <div className="flex flex-wrap gap-2">
            {weakAreas.map((area, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-sm font-medium"
              >
                {area}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Band Score Trend */}
      {bandTrend.length > 0 && (
        <Card className="p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            {t.bandScoreTrend}
          </h3>
          <div className="flex items-end justify-around h-40 border-b border-gray-200 pb-2">
            {bandTrend.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div
                  className="w-12 bg-gradient-to-t from-violet-600 to-purple-500 rounded-t transition-all duration-500"
                  style={{ height: `${(item.score / 9) * 120}px` }}
                ></div>
                <span className="text-xs text-gray-500 mt-2">{item.week}</span>
                <span className="text-xs font-bold text-gray-700">{item.score}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Question Type Performance */}
      {Object.keys(questionTypePerformance).length > 0 && (
        <Card className="p-6">
          <h3 className="font-bold text-gray-800 mb-4">{t.questionTypes}</h3>
          <div className="space-y-3">
            {Object.entries(questionTypePerformance).map(([type, percentage]) => (
              <div key={type} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-40">{type}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      percentage >= 70 ? 'bg-green-500' :
                      percentage >= 50 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-700 w-12 text-right">
                  {percentage}%
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default ProgressAnalytics;
