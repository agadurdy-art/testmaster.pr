import React from 'react';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { AlertCircle } from 'lucide-react';

// "Results aren't ready yet" defensive fallback — extracted verbatim from
// the final return of pages/ComprehensiveLevelTest.js (the surface Aga
// reported as "blank page → terk etti gitti" on 2026-05-23).
export default function NotReadyFallback({ language, user, navigate }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-blue-50 flex items-center justify-center px-4">
      <Card className="p-10 max-w-md w-full bg-white shadow-xl text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-4">
          <AlertCircle className="w-8 h-8 text-amber-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {language === 'vi'
            ? 'Kết quả chưa sẵn sàng'
            : language === 'tr'
              ? 'Sonuçlar henüz hazır değil'
              : "Results aren't ready yet"}
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          {language === 'vi'
            ? 'Đánh giá có thể đang xử lý. Thử lại hoặc về trang chủ — kết quả sẽ được lưu khi bạn đăng ký.'
            : language === 'tr'
              ? 'Değerlendirme hâlâ işleniyor olabilir. Tekrar dene veya panele dön — kayıt olduğunda sonuç saklanacak.'
              : 'Evaluation may still be running. Retry, or jump in — your work is preserved when you sign up.'}
        </p>
        <div className="flex flex-col gap-2">
          <Button
            onClick={() => window.location.reload()}
            className="bg-violet-600 hover:bg-violet-700 text-white"
          >
            {language === 'vi' ? 'Thử lại' : language === 'tr' ? 'Tekrar dene' : 'Try again'}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              if (user) navigate('/dashboard');
              else window.location.href = '/?action=signup';
            }}
          >
            {user
              ? language === 'vi'
                ? 'Về trang chủ'
                : language === 'tr'
                  ? 'Panele dön'
                  : 'Back to dashboard'
              : language === 'vi'
                ? 'Đăng ký miễn phí'
                : language === 'tr'
                  ? 'Ücretsiz kayıt ol'
                  : 'Sign up free'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
