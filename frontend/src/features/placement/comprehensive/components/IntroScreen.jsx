import React from 'react';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import {
  Mic, ChevronRight, CheckCircle, BookOpen, ArrowLeft, Target,
  AlertCircle, Headphones, PenTool,
} from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

// INTRO SCREEN (after test mode is selected) — extracted verbatim from the
// `stage === 'intro'` block of pages/ComprehensiveLevelTest.js.
// Closed-over values became same-named props.
export default function IntroScreen({ language, testMode, setStage, startTest }) {
    // Get title and description based on test mode
    const getTestTitle = () => {
      if (testMode === 'full') return language === 'vi' ? 'Bài Kiểm Tra Đầy Đủ' : language === 'tr' ? 'Tam Test' : 'Full Assessment Test';
      if (testMode === 'reading') return language === 'vi' ? 'Bài Kiểm Tra Đọc' : language === 'tr' ? 'Okuma Testi' : 'Reading Assessment';
      if (testMode === 'listening') return language === 'vi' ? 'Bài Kiểm Tra Nghe' : language === 'tr' ? 'Dinleme Testi' : 'Listening Assessment';
      if (testMode === 'writing') return language === 'vi' ? 'Bài Kiểm Tra Viết' : language === 'tr' ? 'Yazma Testi' : 'Writing Assessment';
      if (testMode === 'speaking') return language === 'vi' ? 'Bài Kiểm Tra Nói' : language === 'tr' ? 'Konuşma Testi' : 'Speaking Assessment';
      return 'Level Assessment';
    };

    const getTestDescription = () => {
      if (testMode === 'full') return language === 'vi' ? 'Đánh giá 4 kỹ năng: Đọc, Nghe, Viết, Nói' : language === 'tr' ? '4 beceriyi değerlendir: Okuma, Dinleme, Yazma, Konuşma' : 'Assess all 4 skills: Reading, Listening, Writing, Speaking';
      if (testMode === 'reading') return language === 'vi' ? 'Đánh giá khả năng đọc hiểu của bạn' : language === 'tr' ? 'Okuma anlama becerinizi değerlendirin' : 'Assess your reading comprehension skills';
      if (testMode === 'listening') return language === 'vi' ? 'Đánh giá khả năng nghe hiểu của bạn' : language === 'tr' ? 'Dinleme anlama becerinizi değerlendirin' : 'Assess your listening comprehension skills';
      if (testMode === 'writing') return language === 'vi' ? 'Đánh giá khả năng viết của bạn' : language === 'tr' ? 'Yazma becerinizi değerlendirin' : 'Assess your writing skills';
      if (testMode === 'speaking') return language === 'vi' ? 'Đánh giá khả năng nói của bạn' : language === 'tr' ? 'Konuşma becerinizi değerlendirin' : 'Assess your speaking skills';
      return '';
    };

    const getIconComponent = () => {
      if (testMode === 'reading') return BookOpen;
      if (testMode === 'listening') return Headphones;
      if (testMode === 'writing') return PenTool;
      if (testMode === 'speaking') return Mic;
      return Target;
    };

    const getIconColor = () => {
      if (testMode === 'reading') return 'from-blue-500 to-indigo-600';
      if (testMode === 'listening') return 'from-cyan-500 to-teal-600';
      if (testMode === 'writing') return 'from-amber-500 to-orange-600';
      if (testMode === 'speaking') return 'from-purple-500 to-pink-600';
      return 'from-violet-500 to-purple-600';
    };

    const IconComponent = getIconComponent();

    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-blue-50 py-12 px-4">
        <LanguageSwitcher />
        <div className="max-w-4xl mx-auto">
          <Button
            onClick={() => setStage('select')}
            variant="ghost"
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {language === 'vi' ? 'Quay Lại Chọn Bài Kiểm Tra' : language === 'tr' ? 'Test Seçimine Dön' : 'Back to Test Selection'}
          </Button>

          <Card className="p-8 bg-white shadow-xl">
            <div className="text-center mb-8">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${getIconColor()} mb-4`}>
                <IconComponent className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {getTestTitle()}
              </h1>
              <p className="text-gray-600 text-lg">
                {getTestDescription()}
              </p>
            </div>

            {/* Show relevant skill cards based on test mode */}
            {testMode === 'full' ? (
              <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-0">
                <div className="flex items-center gap-3 mb-3">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                  <h3 className="font-bold text-gray-900">Reading Assessment</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>10 questions (5-7 minutes)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Progressive difficulty (Band 2.0-9.0)</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-cyan-50 to-teal-50 border-0">
                <div className="flex items-center gap-3 mb-3">
                  <Headphones className="w-6 h-6 text-cyan-600" />
                  <h3 className="font-bold text-gray-900">Listening Assessment</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>10 questions (5-7 minutes)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>UK native speaker audio</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-0">
                <div className="flex items-center gap-3 mb-3">
                  <PenTool className="w-6 h-6 text-amber-600" />
                  <h3 className="font-bold text-gray-900">Writing Assessment</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>3 progressive tasks (8-12 minutes)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>AI-powered rubric evaluation</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-0">
                <div className="flex items-center gap-3 mb-3">
                  <Mic className="w-6 h-6 text-purple-600" />
                  <h3 className="font-bold text-gray-900">Speaking Assessment</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>3 questions (5-8 minutes)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Pronunciation & fluency analysis</span>
                  </li>
                </ul>
              </Card>
            </div>
            ) : (
              /* Single skill intro - show specific details */
              <div className="mb-8">
                {testMode === 'reading' && (
                  <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-0">
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{language === 'vi' ? '10 câu hỏi với độ khó tăng dần' : language === 'tr' ? 'Artan zorluk seviyesinde 10 soru' : '10 questions with progressive difficulty'}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{language === 'vi' ? 'Đánh giá từ Band 2.0 đến 9.0' : language === 'tr' ? 'Band 2.0 ile 9.0 arası değerlendirme' : 'Band 2.0 to 9.0 assessment'}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{language === 'vi' ? 'Phân tích kỹ năng chi tiết' : language === 'tr' ? 'Detaylı beceri analizi' : 'Detailed skill breakdown'}</span>
                      </li>
                    </ul>
                  </Card>
                )}
                {testMode === 'listening' && (
                  <Card className="p-6 bg-gradient-to-br from-cyan-50 to-teal-50 border-0">
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{language === 'vi' ? '5 phần nghe với 10 câu hỏi' : language === 'tr' ? '10 soru ile 5 dinleme bölümü' : '5 listening sections with 10 questions'}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{language === 'vi' ? 'Giọng UK bản địa (Anh Quốc)' : language === 'tr' ? 'UK ana dili konuşmacıları' : 'UK native speaker audio'}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{language === 'vi' ? 'Độ khó từ Band 2.0 đến 9.0' : language === 'tr' ? 'Band 2.0 ile 9.0 arası zorluk' : 'Band 2.0 to 9.0 difficulty'}</span>
                      </li>
                    </ul>
                  </Card>
                )}
                {testMode === 'writing' && (
                  <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-0">
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{language === 'vi' ? '3 bài viết với độ khó tăng dần' : language === 'tr' ? 'Artan zorluk seviyesinde 3 yazma görevi' : '3 progressive writing tasks'}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{language === 'vi' ? 'Đánh giá theo tiêu chí IELTS' : language === 'tr' ? 'IELTS kriterlerine göre değerlendirme' : 'IELTS rubric-based evaluation'}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{language === 'vi' ? 'Phản hồi và gợi ý cải thiện' : language === 'tr' ? 'Geri bildirim ve iyileştirme ipuçları' : 'Feedback and improvement tips'}</span>
                      </li>
                    </ul>
                  </Card>
                )}
                {testMode === 'speaking' && (
                  <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-0">
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{language === 'vi' ? '3 câu hỏi nói với độ khó tăng dần' : language === 'tr' ? 'Artan zorluk seviyesinde 3 konuşma sorusu' : '3 speaking questions with progressive difficulty'}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{language === 'vi' ? 'Đánh giá phát âm và lưu loát' : language === 'tr' ? 'Telaffuz ve akıcılık değerlendirmesi' : 'Pronunciation & fluency analysis'}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{language === 'vi' ? 'Phân tích ngữ pháp và từ vựng' : language === 'tr' ? 'Dilbilgisi ve kelime analizi' : 'Grammar & vocabulary assessment'}</span>
                      </li>
                    </ul>
                  </Card>
                )}
              </div>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-900">
                  <p className="font-semibold mb-1">
                    {language === 'vi' ? 'Bạn sẽ nhận được:' : language === 'tr' ? 'Ne alacaksınız:' : 'What you\'ll receive:'}
                  </p>
                  <ul className="space-y-1 ml-4 list-disc">
                    <li>{language === 'vi' ? 'Điểm Band IELTS (2.0-9.0)' : language === 'tr' ? 'IELTS band puanı (2.0-9.0)' : 'Your IELTS band equivalent (2.0-9.0)'}</li>
                    {testMode === 'full' && (
                      <>
                        <li>{language === 'vi' ? 'Phân tích kỹ năng chi tiết' : language === 'tr' ? 'Detaylı beceri analizi' : 'Detailed skill breakdown & weaknesses'}</li>
                        <li>{language === 'vi' ? 'Gợi ý khóa học phù hợp' : language === 'tr' ? 'Kişiselleştirilmiş kurs önerileri' : 'Personalized course recommendations'}</li>
                      </>
                    )}
                    <li>{language === 'vi' ? 'Phản hồi và gợi ý cải thiện' : language === 'tr' ? 'Geri bildirim ve iyileştirme ipuçları' : 'Feedback and improvement tips'}</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button
              onClick={startTest}
              size="lg"
              className={`w-full bg-gradient-to-r ${getIconColor()} hover:opacity-90 text-white py-6 text-lg`}
            >
              {language === 'vi' ? 'Bắt Đầu Kiểm Tra' : language === 'tr' ? 'Teste Başla' : 'Start Assessment'}
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </Card>
        </div>
      </div>
    );
}
