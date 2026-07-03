// Extracted verbatim from pages/Dashboard.js (Faz1 refactor). Closed-over values
// from the Dashboard component body arrive as same-named props.
import React from 'react';
import { Gamepad2, ChevronRight } from 'lucide-react';
import { Button } from '../../../../../components/ui/button';
import { Card } from '../../../../../components/ui/card';

export default function PlayFunSection({
  bgCard,
  isDark,
  textPrimary,
  textSecondary,
  getText,
  navigate,
}) {
  return (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-5 bg-purple-500 rounded-full" />
            <h2 className={`text-sm font-bold uppercase tracking-wide ${textPrimary}`}>{getText('Play & Fun', 'Chơi & Vui', 'Oyna & Eğlen')}</h2>
          </div>
          {/* Quick Games Section */}
          <Card className={`p-5 ${bgCard} border shadow-lg rounded-2xl transition-colors duration-300 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="flex items-center justify-between mb-4 relative">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-200 animate-pulse">
                  <Gamepad2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className={`text-lg font-bold ${textPrimary}`}>{getText('Quick Games', 'Trò chơi nhanh', 'Hızlı Oyunlar')}</h2>
                  <p className={`text-xs ${textSecondary}`}>{getText('Learn vocabulary while having fun!', 'Học từ vựng vui vẻ!', 'Eğlenerek kelime öğren!')}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/game-bank')}
                className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
              >
                {getText('See All', 'Xem tất cả', 'Tümünü Gör')} <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-3 relative">
              {[
                { type: 'matching_pairs', name: getText('Matching', 'Ghép cặp', 'Eşleştirme'), icon: '🎯', color: 'from-blue-500 to-cyan-500', topic: 'family' },
                { type: 'spelling_bee', name: getText('Spelling', 'Đánh vần', 'Heceleme'), icon: '🐝', color: 'from-amber-500 to-yellow-500', topic: 'animals' },
                { type: 'word_race', name: getText('Word Race', 'Đua từ', 'Kelime Yarışı'), icon: '🏎️', color: 'from-green-500 to-emerald-500', topic: 'food' },
              ].map((game) => (
                <div
                  key={game.type}
                  onClick={() => navigate(`/game-bank?game=${game.type}&topic=${game.topic}`)}
                  className={`p-4 ${isDark ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gradient-to-br from-gray-50 to-white'} rounded-xl cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 group text-center border ${isDark ? 'border-gray-600' : 'border-gray-100'}`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${game.color} flex items-center justify-center text-2xl mx-auto mb-2 group-hover:scale-110 transition-transform shadow-lg`}>
                    {game.icon}
                  </div>
                  <p className={`font-semibold text-sm ${textPrimary}`}>{game.name}</p>
                </div>
              ))}
            </div>
            <div 
              onClick={() => navigate('/game-bank')}
              className={`mt-4 p-3 ${isDark ? 'bg-gradient-to-r from-purple-900/50 to-pink-900/50' : 'bg-gradient-to-r from-purple-50 to-pink-50'} rounded-xl cursor-pointer hover:shadow-md transition-all group flex items-center justify-between`}
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">🎮</div>
                <div>
                  <p className={`font-semibold text-sm ${textPrimary}`}>{getText('Daily Challenge', 'Thử thách hàng ngày', 'Günlük Meydan Okuma')}</p>
                  <p className={`text-xs ${textSecondary}`}>{getText('Complete 3 games to earn bonus XP!', 'Hoàn thành 3 trò chơi để nhận XP thưởng!', '3 oyun tamamla, bonus XP kazan!')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1">
                  <div className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center text-xs">⭐</div>
                  <div className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center text-xs">⭐</div>
                  <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs">⭐</div>
                </div>
                <ChevronRight className={`w-5 h-5 ${textSecondary} group-hover:translate-x-1 transition-transform`} />
              </div>
            </div>
          </Card>
        </div>
  );
}
