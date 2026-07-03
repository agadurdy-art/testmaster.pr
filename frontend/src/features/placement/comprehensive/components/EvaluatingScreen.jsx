import React from 'react';
import { Card } from '../../../../components/ui/card';
import { Brain } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

// EVALUATING SCREEN — extracted verbatim from the `stage === 'evaluating'`
// block of pages/ComprehensiveLevelTest.js.
export default function EvaluatingScreen({ language }) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-blue-50 flex items-center justify-center px-4">
        <LanguageSwitcher />
        <Card className="p-12 max-w-md w-full bg-white shadow-2xl text-center relative overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-blue-500/10 animate-pulse" />
          
          <div className="relative z-10">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 mb-4 animate-pulse shadow-lg">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {language === 'vi' ? 'Đang phân tích kết quả của bạn' : 
                 language === 'tr' ? 'Performansınız analiz ediliyor' :
                 'Analyzing Your Performance'}
              </h2>
              <p className="text-gray-600">
                {language === 'vi' ? 'AI của chúng tôi đang đánh giá câu trả lời của bạn và chuẩn bị kết quả chi tiết...' :
                 language === 'tr' ? 'Yapay zekamız yanıtlarınızı değerlendiriyor ve kişiselleştirilmiş sonuçlarınızı hazırlıyor...' :
                 'Our AI is evaluating your responses and preparing your personalized results...'}
              </p>
            </div>
            
            {/* Progress indicator */}
            <div className="mb-6">
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div className="bg-gradient-to-r from-violet-500 to-purple-600 h-2 rounded-full animate-pulse" style={{ width: '75%' }} />
              </div>
            </div>
            
            <div className="space-y-3 text-left text-sm text-gray-600">
              <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span>
                  {language === 'vi' ? 'Tính điểm đọc hiểu' :
                   language === 'tr' ? 'Okuma puanı hesaplanıyor' :
                   'Calculating reading comprehension score'}
                </span>
              </div>
              <div className="flex items-center gap-3 bg-purple-50 p-3 rounded-lg">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
                <span>
                  {language === 'vi' ? 'Đánh giá độ trôi chảy và phát âm' :
                   language === 'tr' ? 'Akıcılık ve telaffuz değerlendiriliyor' :
                   'Evaluating speaking fluency & pronunciation'}
                </span>
              </div>
              <div className="flex items-center gap-3 bg-pink-50 p-3 rounded-lg">
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }} />
                <span>
                  {language === 'vi' ? 'Tạo đề xuất khóa học' :
                   language === 'tr' ? 'Kurs önerileri oluşturuluyor' :
                   'Generating course recommendations'}
                </span>
              </div>
            </div>
            
            <div className="mt-6 text-xs text-gray-500">
              {language === 'vi' ? 'Điều này có thể mất 30-60 giây...' :
               language === 'tr' ? 'Bu 30-60 saniye sürebilir...' :
               'This may take 30-60 seconds...'}
            </div>
          </div>
        </Card>
      </div>
    );
}
