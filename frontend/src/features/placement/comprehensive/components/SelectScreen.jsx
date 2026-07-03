import React from 'react';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import {
  Mic, ChevronRight, BookOpen, ArrowLeft, Target, Clock,
  Lightbulb, Headphones, PenTool,
} from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

// TEST MODE SELECTION SCREEN — extracted verbatim from the
// `stage === 'select'` block of pages/ComprehensiveLevelTest.js.
// Closed-over values became same-named props.
export default function SelectScreen({ language, navigate, selectTestMode }) {
    const testOptions = [
      {
        id: 'full',
        title: language === 'vi' ? 'Bài Kiểm Tra Đầy Đủ' : language === 'tr' ? 'Tam Test' : 'Full Test',
        description: language === 'vi' ? 'Tất cả 4 kỹ năng: Đọc, Nghe, Viết, Nói' : 
                     language === 'tr' ? 'Tüm 4 beceri: Okuma, Dinleme, Yazma, Konuşma' : 
                     'All 4 skills: Reading, Listening, Writing, Speaking',
        duration: '20-30 min',
        icon: Target,
        color: 'from-violet-500 to-purple-600',
        bgColor: 'from-violet-50 to-purple-50'
      },
      {
        id: 'reading',
        title: language === 'vi' ? 'Bài Kiểm Tra Đọc' : language === 'tr' ? 'Okuma Testi' : 'Reading Test',
        description: language === 'vi' ? 'Đánh giá khả năng đọc hiểu' : 
                     language === 'tr' ? 'Okuma anlama becerisini değerlendir' : 
                     'Assess your reading comprehension',
        duration: '5-7 min',
        icon: BookOpen,
        color: 'from-blue-500 to-indigo-600',
        bgColor: 'from-blue-50 to-indigo-50'
      },
      {
        id: 'listening',
        title: language === 'vi' ? 'Bài Kiểm Tra Nghe' : language === 'tr' ? 'Dinleme Testi' : 'Listening Test',
        description: language === 'vi' ? 'Đánh giá khả năng nghe hiểu' : 
                     language === 'tr' ? 'Dinleme anlama becerisini değerlendir' : 
                     'Assess your listening comprehension',
        duration: '5-7 min',
        icon: Headphones,
        color: 'from-cyan-500 to-teal-600',
        bgColor: 'from-cyan-50 to-teal-50'
      },
      {
        id: 'writing',
        title: language === 'vi' ? 'Bài Kiểm Tra Viết' : language === 'tr' ? 'Yazma Testi' : 'Writing Test',
        description: language === 'vi' ? 'Đánh giá khả năng viết' : 
                     language === 'tr' ? 'Yazma becerisini değerlendir' : 
                     'Assess your writing skills',
        duration: '8-12 min',
        icon: PenTool,
        color: 'from-amber-500 to-orange-600',
        bgColor: 'from-amber-50 to-orange-50'
      },
      {
        id: 'speaking',
        title: language === 'vi' ? 'Bài Kiểm Tra Nói' : language === 'tr' ? 'Konuşma Testi' : 'Speaking Test',
        description: language === 'vi' ? 'Đánh giá khả năng nói' : 
                     language === 'tr' ? 'Konuşma becerisini değerlendir' : 
                     'Assess your speaking skills',
        duration: '5-8 min',
        icon: Mic,
        color: 'from-purple-500 to-pink-600',
        bgColor: 'from-purple-50 to-pink-50'
      }
    ];

    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-blue-50 py-12 px-4">
        <LanguageSwitcher />
        <div className="max-w-4xl mx-auto">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {language === 'vi' ? 'Quay Lại Trang Chủ' : language === 'tr' ? 'Ana Sayfaya Dön' : 'Back to Home'}
          </Button>

          <Card className="p-8 bg-white shadow-xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 mb-4">
                <Target className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {language === 'vi' ? 'Chọn Loại Bài Kiểm Tra' :
                 language === 'tr' ? 'Test Türünü Seçin' :
                 'Select Test Type'}
              </h1>
              <p className="text-gray-600 text-lg">
                {language === 'vi' ? 'Chọn bài kiểm tra đầy đủ hoặc đánh giá từng kỹ năng riêng lẻ' :
                 language === 'tr' ? 'Tam test veya bireysel beceri değerlendirmesi seçin' :
                 'Choose full test or individual skill assessment'}
              </p>
            </div>

            {/* Full Test Option - Featured */}
            <div 
              onClick={() => selectTestMode('full')}
              className="mb-6 cursor-pointer group"
            >
              <Card className={`p-6 bg-gradient-to-br ${testOptions[0].bgColor} border-2 border-transparent hover:border-violet-400 transition-all duration-300 hover:shadow-lg`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${testOptions[0].color} flex items-center justify-center`}>
                      <Target className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-xl flex items-center gap-2">
                        {testOptions[0].title}
                        <span className="text-xs px-2 py-1 bg-violet-100 text-violet-700 rounded-full">
                          {language === 'vi' ? 'Khuyến nghị' : language === 'tr' ? 'Önerilen' : 'Recommended'}
                        </span>
                      </h3>
                      <p className="text-gray-600">{testOptions[0].description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {testOptions[0].duration}
                    </p>
                    <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-violet-600 transition-colors ml-auto mt-2" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">
                  {language === 'vi' ? 'hoặc chọn kỹ năng cụ thể' : 
                   language === 'tr' ? 'veya belirli bir beceri seçin' : 
                   'or select a specific skill'}
                </span>
              </div>
            </div>

            {/* Individual Skill Options */}
            <div className="grid md:grid-cols-2 gap-4">
              {testOptions.slice(1).map((option) => {
                const IconComponent = option.icon;
                return (
                  <div 
                    key={option.id}
                    onClick={() => selectTestMode(option.id)}
                    className="cursor-pointer group"
                  >
                    <Card className={`p-5 bg-gradient-to-br ${option.bgColor} border-2 border-transparent hover:border-gray-300 transition-all duration-300 hover:shadow-md h-full`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${option.color} flex items-center justify-center`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900">{option.title}</h3>
                          <p className="text-sm text-gray-600">{option.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {option.duration}
                          </p>
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors ml-auto mt-1" />
                        </div>
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>

            {/* Info Note */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 flex items-start gap-2">
                <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {language === 'vi' ? 'Mẹo: Bài kiểm tra đầy đủ cho kết quả chính xác nhất về trình độ tiếng Anh tổng thể của bạn.' :
                 language === 'tr' ? 'İpucu: Tam test, genel İngilizce seviyeniz hakkında en doğru sonucu verir.' :
                 'Tip: The full test gives the most accurate result for your overall English level.'}
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
}
