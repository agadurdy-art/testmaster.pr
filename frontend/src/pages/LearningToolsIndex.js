import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoBack } from '../hooks/useGoBack';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  ArrowLeft,
  BookMarked,
  FileText,
  MessageSquare,
  Lightbulb,
  LayoutDashboard,
  Zap,
  Target,
  TrendingUp,
} from 'lucide-react';
import { getUser } from '../lib/api';
import { useI18n } from '../lib/i18n';
import { useTheme, THEME_MODES } from '../contexts/ThemeContext';

/**
 * /learning-tools — single-page index of every practice tool the app offers,
 * filtered by the learner's onboarding mode. IELTS-only tools are hidden for
 * General English users; pre-onboarding users see everything (safer default).
 *
 * Keep this thin: it is a router surface, not a data view. Cards navigate to
 * the real tool pages which own their own state and API calls.
 */
export default function LearningToolsIndex({ user }) {
  const navigate = useNavigate();
  const goBack = useGoBack();
  const { language } = useI18n();
  const { activeTheme } = useTheme();
  const isDark = activeTheme === THEME_MODES.DARK;

  const [profile, setProfile] = useState(user);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const fresh = await getUser(user.id);
        if (!cancelled && fresh) setProfile(fresh);
      } catch (_) {
        // non-fatal — fall back to the prop
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const t = (en, vi, tr) => {
    if (language === 'vi') return vi;
    if (language === 'tr') return tr;
    return en;
  };

  const mode = profile?.learning_mode || user?.learning_mode || null;

  const tools = [
    {
      id: 'question-bank',
      name: t('Question Bank', 'Ngân hàng câu hỏi', 'Soru Bankası'),
      description: t(
        '1,420+ real IELTS questions sorted by skill and difficulty.',
        '1.420+ câu hỏi IELTS thật theo kỹ năng và độ khó.',
        '1.420+ gerçek IELTS sorusu — beceriye ve zorluğa göre.'
      ),
      icon: LayoutDashboard,
      color: 'from-indigo-500 to-purple-600',
      route: '/question-bank',
      ieltsOnly: true,
    },
    {
      id: 'quick-practice',
      name: t('Quick Practice', 'Luyện nhanh', 'Hızlı Pratik'),
      description: t(
        '5–10 minute focused sets. Best for filling a short gap in your day.',
        'Bài tập tập trung 5–10 phút. Phù hợp cho thời gian ngắn.',
        '5–10 dakikalık kısa pratik setleri — günün boşluğuna birebir.'
      ),
      icon: Zap,
      color: 'from-purple-500 to-pink-600',
      route: '/quick-practice',
    },
    {
      id: 'vocabulary',
      name: t('Vocabulary', 'Từ vựng', 'Kelime'),
      description: t(
        'Twenty IELTS themes — Band 8 terms, collocations, idioms.',
        '20 chủ đề IELTS — từ vựng, cụm từ, thành ngữ Band 8.',
        '20 IELTS teması — Band 8 kelime, collocation ve deyim.'
      ),
      icon: BookMarked,
      color: 'from-amber-500 to-orange-600',
      route: '/vocabulary',
    },
    {
      id: 'grammar',
      name: t('Grammar', 'Ngữ pháp', 'Dilbilgisi'),
      description: t(
        'The IELTS 8 Grammar Blueprint — 17 topics across 3 modules.',
        'Bản kế hoạch Ngữ pháp IELTS 8 — 17 chủ đề, 3 mô-đun.',
        'IELTS 8 Grammar Blueprint — 3 modül, 17 konu.'
      ),
      icon: BookMarked,
      color: 'from-emerald-500 to-teal-600',
      route: '/grammar',
    },
    {
      id: 'writing',
      name: t('Writing Practice', 'Luyện viết', 'Yazma Pratiği'),
      description: t(
        'Submit an essay, get band-level feedback from Liz in minutes.',
        'Gửi bài luận, nhận phản hồi theo band từ Liz trong vài phút.',
        'Denemeni gönder, Liz dakikalar içinde band bazlı geri bildirim versin.'
      ),
      icon: FileText,
      color: 'from-orange-500 to-amber-600',
      route: '/writing-practice',
    },
    {
      id: 'speaking',
      name: t('Speaking Practice', 'Luyện nói', 'Konuşma Pratiği'),
      description: t(
        'AI interview with fluency, pronunciation and lexical scoring.',
        'Phỏng vấn AI với đánh giá fluency, phát âm và từ vựng.',
        'AI mülakatı — akıcılık, telaffuz ve kelime puanlaması.'
      ),
      icon: MessageSquare,
      color: 'from-violet-500 to-purple-600',
      route: '/speaking-practice',
    },
    {
      id: 'progress',
      name: t('Progress', 'Tiến trình', 'İlerleme'),
      description: t(
        'See your band trend, weakest skill, and distance to target.',
        'Xem xu hướng band, kỹ năng yếu nhất và khoảng cách đến mục tiêu.',
        'Band trendini, en zayıf beceriyi ve hedefe kalan farkı gör.'
      ),
      icon: TrendingUp,
      color: 'from-sky-500 to-blue-600',
      route: '/progress',
    },
    {
      id: 'tips',
      name: t('Tips & Strategies', 'Mẹo & Chiến lược', 'İpuçları & Stratejiler'),
      description: t(
        'Exam-day tactics by section, written for non-native test-takers.',
        'Chiến thuật ngày thi theo phần, viết cho người không bản xứ.',
        'Bölüm bölüm sınav günü taktikleri — yabancı dil sınav adayları için.'
      ),
      icon: Lightbulb,
      color: 'from-pink-500 to-rose-600',
      route: '/tips',
      ieltsOnly: true,
    },
  ];

  const visibleTools =
    mode === 'general_english' ? tools.filter((tool) => !tool.ieltsOnly) : tools;

  const bgMain = isDark
    ? 'bg-gray-900'
    : 'bg-gradient-to-br from-slate-50 to-purple-50';
  const textPrimary = isDark ? 'text-gray-100' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const cardBg = isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';

  return (
    <div className={`min-h-screen ${bgMain} transition-colors duration-300`}>
      <header className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-6">
        <Button
          variant="ghost"
          className={`mb-4 ${textSecondary} hover:${textPrimary}`}
          onClick={goBack}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('Back to Dashboard', 'Quay lại Dashboard', 'Panele Dön')}
        </Button>
        <h1 className={`text-3xl sm:text-4xl font-bold ${textPrimary} mb-2`}>
          {mode === 'general_english'
            ? t('Your English Tools', 'Công cụ tiếng Anh', 'İngilizce Araçların')
            : t('Your IELTS Tools', 'Công cụ IELTS', 'IELTS Araçların')}
        </h1>
        <p className={`${textSecondary} max-w-2xl`}>
          {t(
            'Every practice surface in one place. Pick a tool and Liz will pick up where you left off.',
            'Mọi công cụ luyện tập ở một nơi. Chọn một công cụ và Liz sẽ tiếp tục từ nơi bạn dừng lại.',
            'Tüm pratik araçları tek yerde. Birini seç; Liz kaldığın yerden devam etsin.'
          )}
        </p>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Card
                key={tool.id}
                className={`p-5 ${cardBg} rounded-2xl cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all`}
                onClick={() => navigate(tool.route)}
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-3`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h2 className={`text-lg font-semibold ${textPrimary} mb-1`}>{tool.name}</h2>
                <p className={`${textSecondary} text-sm`}>{tool.description}</p>
              </Card>
            );
          })}
        </div>

        {visibleTools.length === 0 && (
          <Card className={`p-8 ${cardBg} rounded-2xl text-center`}>
            <Target className={`w-8 h-8 ${textSecondary} mx-auto mb-2`} />
            <p className={textPrimary}>
              {t('No tools available.', 'Chưa có công cụ.', 'Henüz araç yok.')}
            </p>
          </Card>
        )}
      </main>
    </div>
  );
}
