// Simple bilingual (EN/VI) i18n helper for the app
import React from 'react';


export const LANGUAGES = {
  en: 'English',
  vi: 'Tiếng Việt',
};

// Translation keys used across the app. Keep keys stable.
export const translations = {
  en: {
    languageLabel: 'Language',
    // Landing / global
    appName: 'IELTS Ace',
    getStarted: 'Get Started',
    startPracticingFree: 'Start Practicing Free',
    startYourFreePractice: 'Start Your Free Practice',

    // Dashboard
    navTips: 'Tips',
    navCourses: 'Courses',
    navPricing: 'Pricing',
    navLogout: 'Logout',
    welcomeBack: 'Welcome back',
    readyToContinue: 'Ready to continue your IELTS preparation journey?',
    currentPlan: 'Current Plan',
    speakingCredits: 'Speaking Credits',
    viewUpgradePlan: 'View / Upgrade Plan',
    adminTopUpCredits: 'Admin: Top Up Credits',

    // Pricing page
    pricingTitle: 'IELTS Ace Pricing',
    pricingSubtitle: 'Choose the plan that fits your speaking goals.',
    aiSpeakingPlansTitle: 'AI Speaking Exam Plans',
    aiSpeakingPlansSubtitle:
      'Practice real IELTS-style speaking exams with AI examiner feedback. Prices shown in both USD and VND.',
    paypalBannerNote:
      'Pay by card or PayPal. Auto top-up is enabled when your PayPal email matches your IELTS Ace email.',
    paypalNote:
      'Please use the same email on PayPal as you used to register on IELTS Ace so your credits can be added automatically.',
    payByBank: 'Pay by QR/Bank Transfer',
    payByCardPaypal: 'Pay by Card / PayPal',
    backToDashboard: 'Back to Dashboard',

    // Bank transfer modal
    bankModalTitle: 'Pay by Bank Transfer',
    bankInstructions:
      'Scan the QR code with your banking app or use the bank details below. After you transfer the correct amount, upload a screenshot so we can add your credits automatically.',
    bankAccountName: 'Account holder',
    bankAccountNumber: 'Account number',
    bankName: 'Bank',
    bankAmount: 'Amount',
    bankPlan: 'Plan',
    bankIHavePaid: "I've paid – Upload screenshot",
    bankUploadSuccess:
      'Thank you! Your bank transfer screenshot was uploaded and your credits have been updated.',
    bankUploadError: 'Could not process bank transfer. Please contact support.',

    // Paywall / speaking messages
    paywallNeedProOrCredits: 'This practice test is part of Test 2+. Please upgrade to Pro or add speaking credits to unlock it.',
    paywallSpeakingNoCredits: 'You have no speaking credits left and your free trial is used. Please purchase a plan on the Pricing page.',
    speakingFreeTrialAvailable: 'You still have a free AI speaking trial – your first session will be free.',
    speakingFreeTrialStarted: 'Free trial speaking session started. Enjoy your first AI interview!',
    speakingSessionStarted: 'Speaking session started. Credits left:',

    // Auth basics
    email: 'Email',
    password: 'Password',
  },
  vi: {
    languageLabel: 'Ngôn ngữ',
    // Landing / global
    appName: 'IELTS Ace',
    getStarted: 'Bắt đầu',
    startPracticingFree: 'Bắt đầu luyện tập miễn phí',
    startYourFreePractice: 'Bắt đầu luyện tập miễn phí',

    // Dashboard
    navTips: 'Mẹo học',
    navCourses: 'Khoá học',
    navPricing: 'Gói thi',
    navLogout: 'Đăng xuất',
    welcomeBack: 'Chào mừng trở lại',
    readyToContinue: 'Sẵn sàng tiếp tục hành trình luyện thi IELTS của bạn?',
    currentPlan: 'Gói hiện tại',
    speakingCredits: 'Số lượt thi Speaking',
    viewUpgradePlan: 'Xem / Nâng cấp gói',
    adminTopUpCredits: 'Admin: Nạp lượt thi',

    // Pricing page
    pricingTitle: 'Bảng giá IELTS Ace',
    pricingSubtitle: 'Chọn gói phù hợp với mục tiêu Speaking của bạn.',
    aiSpeakingPlansTitle: 'Các gói thi nói AI',
    aiSpeakingPlansSubtitle:
      'Luyện thi nói IELTS với giám khảo AI. Giá hiển thị bằng USD và VND.',
    paypalBannerNote:
      'Thanh toán bằng thẻ hoặc PayPal. Hệ thống tự động cộng lượt khi email PayPal trùng với email IELTS Ace.',
    paypalNote:
      'Hãy dùng cùng một email PayPal với email đăng ký IELTS Ace để hệ thống tự động cộng lượt thi.',
    payByBank: 'Thanh toán bằng QR/Chuyển khoản',
    payByCardPaypal: 'Thanh toán bằng thẻ / PayPal',
    backToDashboard: 'Quay lại Bảng điều khiển',

    // Bank transfer modal
    bankModalTitle: 'Thanh toán bằng chuyển khoản ngân hàng',
    bankInstructions:
      'Quét mã QR bằng ứng dụng ngân hàng HOẶC nhập thông tin chuyển khoản bên dưới. Sau khi chuyển đúng số tiền, hãy tải ảnh chụp màn hình để hệ thống tự động cộng lượt thi.',
    bankAccountName: 'Chủ tài khoản',
    bankAccountNumber: 'Số tài khoản',
    bankName: 'Ngân hàng',
    bankAmount: 'Số tiền',
    bankPlan: 'Gói',
    bankIHavePaid: 'Tôi đã chuyển khoản – Tải ảnh xác nhận',
    bankUploadSuccess: 'Cảm ơn! Ảnh chuyển khoản đã được tải lên và lượt thi của bạn đã được cập nhật.',
    bankUploadError: 'Không thể xử lý chuyển khoản. Vui lòng liên hệ hỗ trợ.',

    // Paywall / speaking messages
    paywallNeedProOrCredits: 'Bài luyện này thuộc Test 2 trở lên. Hãy nâng cấp gói Pro hoặc mua thêm lượt thi để mở khóa.',
    paywallSpeakingNoCredits: 'Bạn không còn lượt thi nói và đã dùng hết lượt thử miễn phí. Vui lòng mua gói ở trang Giá.',
    speakingFreeTrialAvailable: 'Bạn vẫn còn lượt thử miễn phí với giám khảo AI – phiên phỏng vấn đầu tiên sẽ miễn phí.',
    speakingFreeTrialStarted: 'Đã bắt đầu phiên thử miễn phí. Chúc bạn có một buổi phỏng vấn AI hiệu quả!',
    speakingSessionStarted: 'Đã bắt đầu phiên thi nói. Lượt còn lại:',

    // Auth basics
    email: 'Email',
    password: 'Mật khẩu',
  },
};

export const I18nContext = React.createContext({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key,
});

export function I18nProvider({ children }) {
  const [language, setLanguage] = React.useState(() => {
    if (typeof window === 'undefined') return 'en';
    const stored = window.localStorage.getItem('ieltsace_language');
    return stored === 'vi' ? 'vi' : 'en';
  });

  const t = React.useCallback(
    (key) => {
      const dict = translations[language] || translations.en;
      return dict[key] || translations.en[key] || key;
    },
    [language]
  );

  const value = React.useMemo(
    () => ({ language, setLanguage: (lng) => {
      const next = lng === 'vi' ? 'vi' : 'en';
      setLanguage(next);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('ieltsace_language', next);
      }
    }, t }),
    [language, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = React.useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return ctx;
}
