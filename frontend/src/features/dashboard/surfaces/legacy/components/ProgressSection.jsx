// Extracted verbatim from pages/Dashboard.js (Faz1 refactor). Closed-over values
// from the Dashboard component body arrive as same-named props.
import React from 'react';
import {
  Trophy, History, TrendingUp, ChevronRight, GraduationCap, BookOpen,
} from 'lucide-react';
import { Button } from '../../../../../components/ui/button';
import { Card } from '../../../../../components/ui/card';
import SkillBreakdown from '../../../../../components/SkillBreakdown';

export default function ProgressSection({
  progress,
  hasProgress,
  isDark,
  bgCard,
  textPrimary,
  textSecondary,
  getText,
  navigate,
  testModules,
  user,
}) {
  return (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-5 bg-emerald-500 rounded-full" />
            <h2 className={`text-sm font-bold uppercase tracking-wide ${textPrimary}`}>{getText('Your Progress', 'Tiến độ của bạn', 'İlerlemeniz')}</h2>
          </div>
          {/* Badges Section */}
          {progress?.badges?.length > 0 && (
            <Card className={`p-4 mb-4 ${isDark ? 'bg-gradient-to-r from-amber-900/30 to-yellow-900/30 border-amber-700' : 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200'} rounded-2xl transition-colors duration-300`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className={`font-semibold ${textPrimary} flex items-center gap-2`}>
                  <Trophy className="w-5 h-5 text-amber-500" />
                  {getText('Your Achievements', 'Thành tích của bạn', 'Başarılarınız')}
                </h3>
                <span className={`text-sm ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>{progress.badges.length} {getText('badges', 'huy hiệu', 'rozet')}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {progress.badges.slice(0, 8).map((badge, idx) => (
                  <div key={idx} className={`flex items-center gap-2 ${isDark ? 'bg-gray-700' : 'bg-white'} px-3 py-2 rounded-lg shadow-sm`} title={badge.description}>
                    <span className="text-xl">{badge.icon}</span>
                    <span className={`text-sm font-medium ${textPrimary}`}>{badge.name}</span>
                  </div>
                ))}
                {progress.badges.length > 8 && (
                  <button onClick={() => navigate('/progress')} className={`text-sm ${isDark ? 'text-amber-400 hover:text-amber-300' : 'text-amber-700 hover:text-amber-800'} font-medium px-3 py-2`}>
                    +{progress.badges.length - 8} {getText('more', 'khác', 'daha fazla')}
                  </button>
                )}
              </div>
            </Card>
          )}
          <div className="grid lg:grid-cols-2 gap-4">
          <Card className={`p-5 ${bgCard} border shadow-lg rounded-2xl transition-colors duration-300`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-200">
                  <History className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className={`text-lg font-bold ${textPrimary}`}>{getText('Recent Tests', 'Bài thi gần đây', 'Son Testler')}</h2>
                  <p className={`text-xs ${textSecondary}`}>{getText('Review your results', 'Xem lại kết quả', 'Sonuçlarınızı inceleyin')}</p>
                </div>
              </div>
              {hasProgress && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/progress')}
                  className={`text-violet-600 ${isDark ? 'hover:bg-violet-900/30' : 'hover:bg-violet-50'} text-xs`}
                >
                  {getText('View All', 'Xem tất cả', 'Tümünü Gör')}
                </Button>
              )}
            </div>
            
            {hasProgress && progress.recent_attempts?.length > 0 ? (
              <div className="space-y-2">
                {progress.recent_attempts.slice(0, 4).map((attempt, idx) => {
                  const moduleConfig = testModules.find(m => m.type === attempt.test_type);
                  const Icon = moduleConfig?.icon || BookOpen;
                  return (
                    <div 
                      key={idx}
                      onClick={() => attempt.id && navigate(`/results/${attempt.id}`)}
                      className={`p-3 ${isDark ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'} rounded-xl flex items-center justify-between cursor-pointer transition-colors`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg ${moduleConfig?.color || 'bg-gray-500'} flex items-center justify-center`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className={`font-medium ${textPrimary} text-sm capitalize`}>{attempt.test_type}</p>
                          <p className={`text-xs ${textSecondary}`}>{attempt.completed_at ? new Date(attempt.completed_at).toLocaleDateString() : 'Recently'}</p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-lg text-sm font-bold ${
                        attempt.band_score >= 7 ? 'bg-green-100 text-green-700' :
                        attempt.band_score >= 6 ? 'bg-blue-100 text-blue-700' :
                        attempt.band_score >= 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {attempt.band_score?.toFixed(1) || '-'}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className={`w-16 h-16 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center mx-auto mb-3`}>
                  <GraduationCap className={`w-8 h-8 ${textSecondary}`} />
                </div>
                <p className={`${textSecondary} text-sm mb-3`}>{getText('No tests yet', 'Chưa có bài thi nào', 'Henüz test yok')}</p>
                <Button onClick={() => navigate('/test/reading')} size="sm" className="bg-violet-600 hover:bg-violet-700 text-white">
                  {getText('Take Your First Test', 'Làm bài thi đầu tiên', 'İlk Testinizi Yapın')}
                </Button>
              </div>
            )}
          </Card>
          <Card 
            className="p-5 bg-gradient-to-r from-violet-600 to-purple-600 border-0 shadow-xl rounded-2xl cursor-pointer hover:shadow-2xl transition-all"
            onClick={() => navigate('/progress')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{getText('View Full Progress', 'Xem tiến độ đầy đủ', 'Tüm İlerlemeyi Gör')}</h3>
                  <p className="text-violet-200 text-sm">{getText('Detailed analytics & AI feedback', 'Phân tích chi tiết & phản hồi AI', 'Detaylı analitik & AI geri bildirimi')}</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-white" />
            </div>
          </Card>
          </div>
        {/* Skill Breakdown (if user has enough tests) */}
        {hasProgress && progress.total_tests > 2 && (
          <div className="mt-6">
            <SkillBreakdown
              showCumulative={true}
              userId={user?.id}
              expanded={false}
            />
          </div>
        )}
        
        </div>
  );
}
