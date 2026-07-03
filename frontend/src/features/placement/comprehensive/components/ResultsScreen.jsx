import React from 'react';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import {
  Mic, ChevronRight, Award, BookOpen, Target, AlertCircle,
  Trophy, Headphones, PenTool,
} from 'lucide-react';
import { bandToCEFR } from '../constants';
import LanguageSwitcher from './LanguageSwitcher';
import SingleSkillFeedback from './SingleSkillFeedback';
import FullTestSections from './FullTestSections';

// RESULTS SCREEN — extracted verbatim from the `stage === 'results'` block
// of pages/ComprehensiveLevelTest.js. Band helpers stay here and are passed
// down; the per-skill feedback blocks live in SingleSkillFeedback and the
// full-test-only sections in FullTestSections. Closed-over values became
// same-named props (incl. the state setters used by the two reset CTAs).
export default function ResultsScreen({
  results,
  evaluating,
  testMode,
  isGE,
  language,
  user,
  navigate,
  readingQuestions,
  readingAnswers,
  setTestMode,
  setStage,
  setCurrentQuestion,
  setReadingAnswers,
  setListeningAnswers,
  setWritingResponses,
  setSpeakingResponses,
  setCurrentListeningSection,
  setCurrentWritingTask,
  setCurrentSpeakingPrompt,
  setResults,
}) {
    const getBandColor = (band) => {
      if (band >= 8.0) return 'from-green-500 to-emerald-600';
      if (band >= 7.0) return 'from-blue-500 to-cyan-600';
      if (band >= 6.0) return 'from-indigo-500 to-purple-600';
      if (band >= 5.0) return 'from-violet-500 to-purple-600';
      if (band >= 4.0) return 'from-amber-500 to-orange-600';
      return 'from-red-500 to-rose-600';
    };

    const getBandLabel = (band) => {
      if (language === 'vi') {
        if (band >= 8.0) return 'Xuất Sắc';
        if (band >= 7.0) return 'Rất Tốt';
        if (band >= 6.0) return 'Thành Thạo';
        if (band >= 5.0) return 'Trung Bình';
        if (band >= 4.0) return 'Hạn Chế';
        return 'Cơ Bản';
      }
      if (language === 'tr') {
        if (band >= 8.0) return 'Mükemmel';
        if (band >= 7.0) return 'Çok İyi';
        if (band >= 6.0) return 'Yetkin';
        if (band >= 5.0) return 'Orta';
        if (band >= 4.0) return 'Sınırlı';
        return 'Temel';
      }
      if (band >= 8.0) return 'Excellent';
      if (band >= 7.0) return 'Very Good';
      if (band >= 6.0) return 'Competent';
      if (band >= 5.0) return 'Modest';
      if (band >= 4.0) return 'Limited';
      return 'Basic';
    };

    // Get the skill name based on test mode
    const getSkillName = () => {
      if (testMode === 'reading') return language === 'vi' ? 'Đọc' : language === 'tr' ? 'Okuma' : 'Reading';
      if (testMode === 'listening') return language === 'vi' ? 'Nghe' : language === 'tr' ? 'Dinleme' : 'Listening';
      if (testMode === 'writing') return language === 'vi' ? 'Viết' : language === 'tr' ? 'Yazma' : 'Writing';
      if (testMode === 'speaking') return language === 'vi' ? 'Nói' : language === 'tr' ? 'Konuşma' : 'Speaking';
      return '';
    };

    // Get the skill band for single skill tests
    const getSkillBand = () => {
      if (testMode === 'reading') return results.reading?.band || 4.0;
      if (testMode === 'listening') return results.listening?.band_score || 4.0;
      if (testMode === 'writing') return results.writing?.overall_band || 4.0;
      if (testMode === 'speaking') return results.speaking?.overall_band || 4.0;
      return 4.0;
    };

    // Get skill icon
    const getSkillIcon = () => {
      if (testMode === 'reading') return BookOpen;
      if (testMode === 'listening') return Headphones;
      if (testMode === 'writing') return PenTool;
      if (testMode === 'speaking') return Mic;
      return Target;
    };

    const isStillEvaluating = evaluating;
    const isSingleSkillTest = testMode !== 'full';
    const SkillIconComponent = getSkillIcon();
    const shortTestNoticeTitle =
      language === 'vi' ? 'Lưu ý về bài kiểm tra ngắn' :
      language === 'tr' ? 'Kısa test notu' :
      'Short test note';
    const shortTestNoticeBody =
      language === 'vi'
        ? 'Đây là bài kiểm tra ngắn để ước tính nhanh trình độ hiện tại của bạn. Kết quả hữu ích để định hướng, nhưng không chính xác bằng bài Full Test.'
        : language === 'tr'
          ? 'Bu, mevcut seviyenizi hızlıca tahmin eden kısa bir testtir. Sonuç yön gösterir, ancak Full Test kadar kesin değildir.'
          : 'This is a short test designed to estimate your current level quickly. It is useful for direction, but it is less precise than the Full Test.';
    const shortTestNoticeCta =
      language === 'vi' ? 'Kết quả chính xác hơn? Hãy làm Full Test.' :
      language === 'tr' ? 'Daha doğru sonuç mu istiyorsunuz? Full Test yapın.' :
      'Want a more reliable result? Take the Full Test.';

    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-blue-50 py-12 px-4">
        <LanguageSwitcher />
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${isSingleSkillTest ? getBandColor(getSkillBand()) : 'from-violet-500 to-purple-600'} mb-4`}>
              {isSingleSkillTest ? <SkillIconComponent className="w-10 h-10 text-white" /> : <Trophy className="w-10 h-10 text-white" />}
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {isSingleSkillTest ? (
                language === 'vi' ? `Kết Quả Kiểm Tra ${getSkillName()}` :
                language === 'tr' ? `${getSkillName()} Testi Sonuçlarınız` :
                `Your ${getSkillName()} Test Results`
              ) : isGE ? (
                language === 'vi' ? 'Kết quả trình độ tiếng Anh' :
                language === 'tr' ? 'İngilizce seviye sonucun' :
                'Your English Level Results'
              ) : (
                language === 'vi' ? 'Kết Quả Đánh Giá Toàn Diện' :
                language === 'tr' ? 'Kapsamlı Değerlendirme Sonuçlarınız' :
                'Your Comprehensive Assessment Results'
              )}
            </h1>
            <p className="text-gray-600 text-lg">
              {isSingleSkillTest ? (
                language === 'vi' ? `Phân tích chi tiết kỹ năng ${getSkillName().toLowerCase()} của bạn` :
                language === 'tr' ? `${getSkillName()} becerinizin detaylı analizi` :
                `Detailed analysis of your ${getSkillName().toLowerCase()} skills`
              ) : (
                language === 'vi' ? 'Phân tích chi tiết trình độ tiếng Anh của bạn' :
                language === 'tr' ? 'İngilizce yeterlilik seviyenizin detaylı analizi' :
                'Detailed analysis of your English proficiency level'
              )}
            </p>
          </div>

          {/* Single Skill Result Display */}
          {isSingleSkillTest && !isStillEvaluating && (
            <div className="space-y-4 mb-8">
              <Card className={`p-8 bg-gradient-to-br ${getBandColor(getSkillBand())} text-white shadow-2xl`}>
                <div className="text-center">
                  <p className="text-white/90 text-lg mb-2">
                    {language === 'vi' ? `Band ${getSkillName()} Ước Tính` :
                     language === 'tr' ? `Tahmini ${getSkillName()} Bandınız` :
                     `Estimated ${getSkillName()} Band`}
                  </p>
                  <div className="text-7xl font-bold mb-2">
                    {getSkillBand().toFixed(1)}
                  </div>
                  <p className="text-2xl font-semibold text-white/95 mb-2">
                    {getBandLabel(getSkillBand())}
                  </p>
                  <p className="text-sm text-white/85 max-w-2xl mx-auto">
                    {shortTestNoticeBody}
                  </p>
                </div>
              </Card>

              <Card className="p-5 bg-amber-50 border-amber-200 shadow-sm">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-amber-900 mb-1">{shortTestNoticeTitle}</p>
                    <p className="text-sm text-amber-800 mb-3">{shortTestNoticeBody}</p>
                    <p className="text-sm font-medium text-amber-900">{shortTestNoticeCta}</p>
                  </div>
                  <Button
                    onClick={() => {
                      setTestMode('full');
                      setStage('intro');
                      setCurrentQuestion(0);
                      setReadingAnswers({});
                      setListeningAnswers({});
                      setWritingResponses({});
                      setSpeakingResponses([]);
                      setCurrentListeningSection(0);
                      setCurrentWritingTask(0);
                      setCurrentSpeakingPrompt(0);
                      setResults(null);
                    }}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    {language === 'vi' ? 'Làm Full Test' : language === 'tr' ? 'Full Test Yap' : 'Take Full Test'}
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Full Test Result Display - Overall Band Score */}
          {!isSingleSkillTest && results.overall_band ? (
            <Card className={`p-8 bg-gradient-to-br ${getBandColor(results.overall_band)} text-white shadow-2xl mb-8`}>
              <div className="text-center">
                <p className="text-white/90 text-lg mb-2">
                  {isGE
                    ? (language === 'vi' ? 'Trình độ tiếng Anh của bạn' :
                       language === 'tr' ? 'İngilizce seviyen' :
                       'Your English Level')
                    : (language === 'vi' ? 'Band IELTS Tổng Quát' :
                       language === 'tr' ? 'Genel IELTS Bandınız' :
                       'Your Overall IELTS Band')}
                </p>
                <div className="text-7xl font-bold mb-2">
                  {isGE ? bandToCEFR(results.overall_band).split(' · ')[0] : results.overall_band.toFixed(1)}
                </div>
                <p className="text-2xl font-semibold text-white/95 mb-4">
                  {isGE
                    ? bandToCEFR(results.overall_band).split(' · ')[1] || ''
                    : `${getBandLabel(results.overall_band)} - ${results.speaking?.cefr_level || 'B1'}`}
                </p>
                <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto mt-6">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                    <BookOpen className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-sm text-white/80">
                      {language === 'vi' ? 'Đọc' : language === 'tr' ? 'Okuma' : 'Reading'}
                    </p>
                    <p className="text-2xl font-bold">{results.reading?.band?.toFixed(1) || '4.0'}</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                    <Headphones className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-sm text-white/80">
                      {language === 'vi' ? 'Nghe' : language === 'tr' ? 'Dinleme' : 'Listening'}
                    </p>
                    <p className="text-2xl font-bold">{results.listening?.band_score?.toFixed(1) || '4.0'}</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                    <PenTool className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-sm text-white/80">
                      {language === 'vi' ? 'Viết' : language === 'tr' ? 'Yazma' : 'Writing'}
                    </p>
                    <p className="text-2xl font-bold">{results.writing?.overall_band?.toFixed(1) || '4.0'}</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                    <Mic className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-sm text-white/80">
                      {language === 'vi' ? 'Nói' : language === 'tr' ? 'Konuşma' : 'Speaking'}
                    </p>
                    <p className="text-2xl font-bold">{results.speaking?.overall_band?.toFixed(1) || '4.0'}</p>
                  </div>
                </div>
              </div>
            </Card>
          ) : !isSingleSkillTest && isStillEvaluating && (
            <Card className="p-8 bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-2xl mb-8">
              <div className="text-center">
                <p className="text-white/90 text-lg mb-2">
                  {language === 'vi' ? 'Đang đánh giá bài kiểm tra của bạn...' :
                   language === 'tr' ? 'Sınavınız değerlendiriliyor...' :
                   'Evaluating your test...'}
                </p>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <div className="w-3 h-3 bg-white rounded-full animate-bounce" />
                  <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            </Card>
          )}

          {/* Single Skill Specific Feedback */}
          {isSingleSkillTest && !isStillEvaluating && (
            <SingleSkillFeedback
              testMode={testMode}
              results={results}
              language={language}
              readingQuestions={readingQuestions}
              readingAnswers={readingAnswers}
            />
          )}

          {/* Full-test-only sections (each keeps its !isSingleSkillTest guard) */}
          <FullTestSections
            isSingleSkillTest={isSingleSkillTest}
            results={results}
            language={language}
            getBandColor={getBandColor}
            navigate={navigate}
          />

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* Take Another Test Button */}
            <Button
              onClick={() => {
                // Reset state and go back to selection
                setTestMode(null);
                setStage('select');
                setCurrentQuestion(0);
                setReadingAnswers({});
                setListeningAnswers({});
                setWritingResponses({});
                setSpeakingResponses([]);
                setCurrentListeningSection(0);
                setCurrentWritingTask(0);
                setCurrentSpeakingPrompt(0);
                setResults(null);
              }}
              size="lg"
              variant="outline"
              className="border-2 border-violet-600 text-violet-600 hover:bg-violet-50"
            >
              <Target className="w-5 h-5 mr-2" />
              {language === 'vi' ? 'Làm Bài Kiểm Tra Khác' : language === 'tr' ? 'Başka Bir Test Yap' : 'Take Another Test'}
            </Button>
            {!user && (
              <Button
                onClick={() => {
                  // Navigate to landing page with signup modal trigger
                  window.location.href = '/?action=signup';
                }}
                size="lg"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                <Award className="w-5 h-5 mr-2" />
                {language === 'vi' ? 'Đăng Ký Lưu Kết Quả' : language === 'tr' ? 'Sonuçları Kaydetmek için Üye Ol' : 'Sign Up to Save Your Results'}
              </Button>
            )}
            <Button
              onClick={() => {
                if (user) {
                  // GE placement → GE dashboard; everyone else → IELTS dashboard.
                  navigate(isGE ? '/ge/dashboard' : '/dashboard');
                } else {
                  // Navigate to landing page with signup modal trigger
                  window.location.href = '/?action=signup';
                }
              }}
              size="lg"
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
            >
              {user ? (language === 'vi' ? 'Đến Trang Cá Nhân' : language === 'tr' ? 'Panele Git' : 'Go to Dashboard') : (language === 'vi' ? 'Bắt Đầu Luyện Tập Miễn Phí' : language === 'tr' ? 'Ücretsiz Pratik Başlat' : 'Start Free Practice')}
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
}
