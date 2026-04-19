import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Sparkles, X, UserPlus, Gift, Zap, Trophy } from 'lucide-react';
import { useI18n } from '../lib/i18n';

// Multilingual CTA messages
const CTA_TEXT = {
  title: {
    en: "Enjoying this lesson?",
    vi: "Bạn thích bài học này?",
    tr: "Bu dersi beğendiniz mi?"
  },
  subtitle: {
    en: "Sign up for FREE to unlock all courses, AI feedback, and track your progress!",
    vi: "Đăng ký MIỄN PHÍ để mở khóa tất cả khóa học, phản hồi AI và theo dõi tiến trình!",
    tr: "Tüm kurslara, AI geri bildirimine erişmek ve ilerlemenizi takip etmek için ÜCRETSİZ kaydolun!"
  },
  button: {
    en: "Create Free Account",
    vi: "Tạo tài khoản miễn phí",
    tr: "Ücretsiz Hesap Oluştur"
  },
  features: {
    courses: {
      en: "All 4 courses",
      vi: "Tất cả 4 khóa học",
      tr: "Tüm 4 kurs"
    },
    ai: {
      en: "AI evaluation",
      vi: "Đánh giá AI",
      tr: "AI değerlendirme"
    },
    progress: {
      en: "Track progress",
      vi: "Theo dõi tiến trình",
      tr: "İlerleme takibi"
    }
  },
  laterText: {
    en: "Maybe later",
    vi: "Để sau",
    tr: "Belki sonra"
  }
};

export default function SignUpCTA({ variant = 'banner', onDismiss }) {
  const navigate = useNavigate();
  const { language } = useI18n();
  const [dismissed, setDismissed] = useState(false);

  const getText = (obj) => obj[language] || obj.en;

  const handleSignUp = () => {
    navigate('/?signup=true');
  };

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  if (dismissed) return null;

  // Floating banner at bottom
  if (variant === 'banner') {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 shadow-2xl border-t border-violet-400/30">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-white">
            <div className="hidden sm:flex w-12 h-12 rounded-full bg-white/20 items-center justify-center">
              <Sparkles className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{getText(CTA_TEXT.title)}</h3>
              <p className="text-violet-100 text-sm">{getText(CTA_TEXT.subtitle)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={handleDismiss}
              variant="ghost"
              className="text-violet-200 hover:text-white hover:bg-white/10"
            >
              {getText(CTA_TEXT.laterText)}
            </Button>
            <Button
              onClick={handleSignUp}
              className="bg-white text-violet-700 hover:bg-violet-50 font-bold px-6 shadow-lg"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              {getText(CTA_TEXT.button)}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Card variant for inline placement
  if (variant === 'card') {
    return (
      <Card className="relative overflow-hidden bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 border-0 p-6 my-6 shadow-xl">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-white/60 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-yellow-300" />
              <h3 className="text-xl font-bold">{getText(CTA_TEXT.title)}</h3>
            </div>
            <p className="text-violet-100 mb-4">{getText(CTA_TEXT.subtitle)}</p>
            
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex items-center gap-2 text-violet-100">
                <Gift className="w-4 h-4 text-yellow-300" />
                <span className="text-sm">{getText(CTA_TEXT.features.courses)}</span>
              </div>
              <div className="flex items-center gap-2 text-violet-100">
                <Zap className="w-4 h-4 text-yellow-300" />
                <span className="text-sm">{getText(CTA_TEXT.features.ai)}</span>
              </div>
              <div className="flex items-center gap-2 text-violet-100">
                <Trophy className="w-4 h-4 text-yellow-300" />
                <span className="text-sm">{getText(CTA_TEXT.features.progress)}</span>
              </div>
            </div>
          </div>
          
          <Button
            onClick={handleSignUp}
            size="lg"
            className="bg-white text-violet-700 hover:bg-violet-50 font-bold px-8 py-6 text-lg shadow-lg whitespace-nowrap"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            {getText(CTA_TEXT.button)}
          </Button>
        </div>
      </Card>
    );
  }

  return null;
}
