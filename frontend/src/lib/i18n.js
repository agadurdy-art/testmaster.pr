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
    navProfile: 'Profile',
    navDashboard: 'Dashboard',
    welcomeBack: 'Welcome back',
    readyToContinue: 'Ready to continue your IELTS preparation journey?',
    currentPlan: 'Current Plan',
    speakingCredits: 'Speaking Credits',
    viewUpgradePlan: 'View / Upgrade Plan',
    adminTopUpCredits: 'Admin: Top Up Credits',
    practiceTests: 'Practice Tests',
    learningTools: 'Learning Tools',
    recentActivity: 'Recent Activity',
    noRecentActivity: 'No recent test attempts yet',
    startFirstTest: 'Start your first test to see your progress here',
    testsCompleted: 'Tests Completed',
    avgBand: 'Avg. Band',
    streak: 'Streak',
    days: 'days',

    // Test modules
    reading: 'Reading',
    listening: 'Listening',
    writing: 'Writing',
    speaking: 'Speaking',
    readingDesc: 'Practice reading comprehension',
    listeningDesc: 'Practice listening skills',
    writingDesc: 'Practice writing tasks',
    speakingDesc: 'Practice speaking with AI',
    startTest: 'Start Test',
    continueTest: 'Continue Test',

    // Learning tools
    vocabGrammar: 'Vocab & Grammar',
    vocabGrammarDesc: 'Build vocabulary and grammar skills',
    writingPractice: 'Writing Practice',
    writingPracticeDesc: 'Practice writing with AI feedback',
    speakingPractice: 'Speaking Practice',
    speakingPracticeDesc: 'Practice speaking with AI examiner',
    levelTest: 'Level Test',
    levelTestDesc: 'Assess your current level',

    // Test interface
    timeRemaining: 'Time Remaining',
    passage: 'Passage',
    part: 'Part',
    question: 'Question',
    questions: 'Questions',
    previous: 'Previous',
    next: 'Next',
    submit: 'Submit',
    submitTest: 'Submit Test',
    exit: 'Exit',
    typeYourAnswer: 'Type your answer...',

    // Task descriptions
    taskTrueFalseNotGiven: 'TRUE / FALSE / NOT GIVEN',
    taskTrueFalseNotGivenDesc: 'Do the following statements agree with the information given in the passage? Write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, NOT GIVEN if there is no information on this.',
    taskYesNoNotGiven: 'YES / NO / NOT GIVEN',
    taskYesNoNotGivenDesc: 'Do the following statements agree with the claims of the writer? Write YES if the statement agrees with the claims, NO if the statement contradicts the claims, NOT GIVEN if it is impossible to say what the writer thinks.',
    taskMultipleChoice: 'Multiple Choice',
    taskMultipleChoiceDesc: 'Choose the correct letter, A, B, C or D.',
    taskSentenceCompletion: 'Sentence Completion',
    taskSentenceCompletionDesc: 'Complete the sentences below. Choose NO MORE THAN THREE WORDS from the passage for each answer.',
    taskSummaryCompletion: 'Summary Completion',
    taskSummaryCompletionDesc: 'Complete the summary below. Choose NO MORE THAN TWO WORDS from the passage for each answer.',
    taskMatchingHeadings: 'Matching Headings',
    taskMatchingHeadingsDesc: 'Choose the correct heading for each paragraph from the list of headings below.',
    taskMatchingInfo: 'Matching Information',
    taskMatchingInfoDesc: 'Which paragraph contains the following information? You may use any letter more than once.',
    taskNoteCompletion: 'Note Completion',
    taskNoteCompletionDesc: 'Complete the notes below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.',
    taskFormCompletion: 'Form Completion',
    taskFormCompletionDesc: 'Complete the form below. Write NO MORE THAN THREE WORDS AND/OR A NUMBER for each answer.',
    taskMapLabeling: 'Map/Plan Labeling',
    taskMapLabelingDesc: 'Label the map/plan below. Write the correct letter A-H next to each question.',
    taskMatching: 'Matching',
    taskMatchingDesc: 'Choose the correct letter A-H from the list.',

    // Results page
    testResults: 'Test Results',
    yourScore: 'Your Score',
    bandScore: 'Band Score',
    correct: 'Correct',
    incorrect: 'Incorrect',
    accuracy: 'Accuracy',
    personalFeedback: 'Your Personal Feedback',
    aiFeedback: 'AI-powered analysis of your performance',
    yourStrengths: 'Your Strengths',
    areasToImprove: 'Areas to Improve',
    tipsToImprove: 'Tips to Improve',
    answerReview: 'Answer Review',
    yourAnswer: 'Your answer',
    correctAnswer: 'Correct answer',
    noAnswer: '(no answer)',
    practiceRecommendations: 'Focused Practice Recommendations',
    keepPracticing: 'Keep practicing to identify your strengths!',
    greatJob: 'Great job! No major weaknesses detected.',
    practiceAgain: 'Practice Again',

    // Writing Practice
    writingTask1Academic: 'Task 1 Academic',
    writingTask1AcademicDesc: 'Describe a graph, table, chart or diagram',
    writingTask1General: 'Task 1 General',
    writingTask1GeneralDesc: 'Write a letter (formal, semi-formal or informal)',
    writingTask2Essay: 'Task 2 Essay',
    writingTask2EssayDesc: 'Write an essay on a given topic',
    selectTaskType: 'Select Task Type',
    selectPrompt: 'Select a Prompt',
    startWriting: 'Start Writing',
    wordCount: 'Word Count',
    minWords: 'min words',
    saveDraft: 'Save Draft',
    submitForReview: 'Submit for AI Review',
    writingFeedback: 'Writing Feedback',
    taskResponse: 'Task Response',
    coherenceCohesion: 'Coherence & Cohesion',
    lexicalResource: 'Lexical Resource',
    grammaticalRange: 'Grammatical Range',

    // Speaking Practice  
    aiExaminerActive: 'AI Examiner Active',
    liveAiExaminer: 'Live AI Speaking Examiner',
    practiceWithAi: 'Practice with a real-time AI examiner that gives instant feedback',
    startAiInterview: 'Start AI Interview',
    sessionActive: 'Session Active',
    creditsRemaining: 'remaining',
    freeTrialAvailable: '3 minutes FREE trial available!',
    getCredits: 'Get credits to continue practicing',

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
    login: 'Log In',
    register: 'Register',
    forgotPassword: 'Forgot Password?',
    orContinueWith: 'Or continue with',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",

    // Common
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    close: 'Close',
    back: 'Back',
    home: 'Home',

    // Landing Page
    landingBadge: 'AI Trained Like a Real Cambridge Examiner',
    landingHeroTitle1: 'Prepare for IELTS with an AI that',
    landingHeroTitle2: 'thinks like a real examiner',
    landingHeroSubtitle: 'Not just scores. Real examiner-style evaluation, honest feedback, and a clear path to improvement.',
    landingHeroDesc: "Most platforms only tell you what band you got. We explain why you received that band, what stopped you from scoring higher, and exactly what to study next.",
    landingStartLevelCheck: 'Start Free Level Check',
    landingWhyChooseUs: 'Why learners choose IELTS Ace',
    landingWhyChooseUsDesc: 'What makes our AI different from generic scoring tools',
    landingExaminerAI: 'Examiner-based AI',
    landingExaminerAIDesc: 'Our AI is trained with official IELTS band descriptors and examiner logic — not generic scoring patterns.',
    landingNoBandInflation: 'No Band Inflation',
    landingNoBandInflationDesc: 'Fluent but irrelevant answers are capped. Just like the real IELTS exam.',
    landingTeaching: 'Teaching, Not Just Testing',
    landingTeachingDesc: "We don't stop at scores. We explain decisions and guide your next steps.",
    landingPersonalPath: 'Personal Learning Path',
    landingPersonalPathDesc: 'Every result leads to targeted practice based on your specific weaknesses.',
    
    // Methodology
    landingMethodology: 'Our Learning Methodology',
    landingMethodologyDesc: 'A proven cycle that builds real IELTS skills, not false confidence',
    landingStepTest: 'TEST',
    landingStepTestDesc: 'Take a real exam-style test under timed conditions',
    landingStepDiagnose: 'DIAGNOSE',
    landingStepDiagnoseDesc: 'AI identifies your exact weaknesses and limiting factors',
    landingStepStudy: 'STUDY',
    landingStepStudyDesc: 'Learn targeted lessons designed to fix your specific gaps',
    landingStepRetry: 'RETRY',
    landingStepRetryDesc: 'Practice again with focused improvement until you master it',
    landingRepeatUntil: 'Repeat until you reach your target band',
    
    // Comparison
    landingCompareTitle: 'Compare the Methods',
    landingCompareDesc: 'Traditional classes, Generic AI, and Cambridge-trained AI',
    landingTraditional: 'Traditional Classes',
    landingTraditionalSub: 'Books & Teachers',
    landingTraditionalBestFor: 'Best for: Learners who need in-person motivation',
    landingOtherAI: 'Other AI Platforms',
    landingOtherAISub: 'Generic AI Scoring',
    landingOtherAIBestFor: 'Best for: Quick practice without accuracy',
    landingIELTSAce: 'IELTS Ace',
    landingIELTSAceSub: 'Cambridge-Trained AI',
    landingIELTSAceBestFor: 'Best for: Serious learners who want real improvement',
    landingRecommended: 'RECOMMENDED',
    landingQuote1: "We don't train you to sound fluent.",
    landingQuote2: 'We train you to think, respond, and perform like an IELTS candidate.',
    
    // Traditional comparison items
    landingTradItem1: 'Limited practice time',
    landingTradItem2: 'Expensive private tutors',
    landingTradItem3: 'Generic group feedback',
    landingTradItem4: 'Fixed schedule required',
    landingTradItem5: 'No instant evaluation',
    
    // Other AI comparison items
    landingOtherAIItem1: 'Instant feedback',
    landingOtherAIItem2: 'Inflated scores for engagement',
    landingOtherAIItem3: 'Generic encouraging comments',
    landingOtherAIItem4: 'No examiner logic',
    landingOtherAIItem5: 'No clear improvement path',
    
    // IELTS Ace comparison items
    landingAceItem1: 'Real examiner evaluation logic',
    landingAceItem2: 'Honest band scores (no inflation)',
    landingAceItem3: 'Explains WHY you got each band',
    landingAceItem4: 'Diagnoses your exact weaknesses',
    landingAceItem5: 'Test → Study → Retry pathway',
    
    // Practical Skills
    landingPracticalTitle: 'Learn Skills You\'ll Actually Use',
    landingPracticalDesc: 'Every lesson is designed for real-world application. After each module, you\'ll have skills you can use immediately — in exams and in life.',
    landingSpeakingConfidence: 'Speaking Confidence',
    landingSpeakingConfidenceDesc: 'Learn how to express complex ideas clearly. Use these skills in job interviews, presentations, and daily conversations.',
    landingAcademicWriting: 'Academic Writing',
    landingAcademicWritingDesc: 'Master essay structure and argumentation. Apply these skills in university assignments, reports, and professional emails.',
    landingCriticalReading: 'Critical Reading',
    landingCriticalReadingDesc: 'Develop skimming, scanning, and inference skills. Use them to quickly understand contracts, articles, and research papers.',
    landingActiveListening: 'Active Listening',
    landingActiveListeningDesc: 'Train your ear for different accents and speeds. Apply in meetings, lectures, and international communication.',
    landingVocabMastery: 'Vocabulary Mastery',
    landingVocabMasteryDesc: 'Learn topic-specific vocabulary with real usage. Use sophisticated language naturally in any context.',
    landingTimeManagement: 'Time Management',
    landingTimeManagementDesc: 'Practice under timed conditions. Develop skills to work efficiently under pressure in any situation.',
    landingGuaranteed: 'Guaranteed Real-World Application',
    landingGuaranteedDesc: 'Each lesson ends with a practical exercise you can apply immediately. No theoretical knowledge that sits unused.',
    landingStartLearning: 'Start Learning',
    
    // How AI Works
    landingHowAIWorks: 'How Real Examiners Think',
    landingHowAIWorksTitle: 'Our AI evaluates like a Cambridge examiner',
    landingHowAIWorksDesc: 'Our AI evaluates your performance using the exact same logic that real IELTS examiners use:',
    landingAIStep1: 'Question Relevance',
    landingAIStep1Desc: 'Did you actually answer the question asked?',
    landingAIStep2: 'Task Fulfilment',
    landingAIStep2Desc: 'Did you complete all parts of the task?',
    landingAIStep3: 'Language Control',
    landingAIStep3Desc: 'How accurate is your grammar and vocabulary?',
    landingAIStep4: 'Band Evidence',
    landingAIStep4Desc: 'Is there clear evidence for the band score?',
    landingKeyRule: 'Key Rule:',
    landingKeyRuleDesc: 'If a response does not answer the question, the score is capped — regardless of fluency.',
    landingKeyRuleDesc2: 'This is how real examiners think. And this is how progress actually happens.',
    
    // Who is this for
    landingWhoFor: 'Who is IELTS Ace for?',
    landingWhoFor1: 'Students stuck at Band 4–5',
    landingWhoFor1Desc: 'Breaking through the intermediate ceiling',
    landingWhoFor2: 'Aiming for Band 6–7+',
    landingWhoFor2Desc: 'Need precise feedback to reach your goal',
    landingWhoFor3: 'Self-study learners',
    landingWhoFor3Desc: 'Need clear guidance without a tutor',
    landingWhoFor4: 'Tired of vague feedback',
    landingWhoFor4Desc: 'Want honest, actionable advice',
    
    // Complete Features
    landingCompletePrep: 'Complete IELTS Preparation',
    landingCompletePrepDesc: 'All four skills with AI-powered evaluation',
    landingReadingFeature: 'Academic & General • Full passages • 12 question types',
    landingListeningFeature: '4 sections • Real audio • Timed practice',
    landingWritingFeature: 'Task 1 & 2 • AI scoring • Band 8+ samples',
    landingSpeakingFeature: '3 parts • AI examiner • Model answers',
    landingAdvancedCourse: 'Advanced IELTS Mastery Course',
    landingAdvancedCourseDesc: '20 comprehensive modules with vocabulary, grammar, reading passages, writing prompts, and speaking practice — all with Cambridge-aligned content.',
    landingBand6to9: 'Band 6.0 → 9.0 Pathway',
    landingExploreCourse: 'Explore Course',
    
    // Honesty Promise
    landingHonestyTitle: 'Our Honesty Promise',
    landingNoPromise: 'We do not promise instant Band 7.',
    landingWePromise1: 'Honest evaluation',
    landingWePromise2: 'Clear explanations',
    landingWePromise3: 'Structured improvement path',
    landingHonestyEnd: "That's how real results are built.",
    
    // Final CTA
    landingFinalCTA: 'Ready to see how an examiner really thinks?',
    landingFinalCTADesc: 'Start with one test. Let IELTS Ace guide your journey.',
    
    // Footer
    landingFooterTagline: 'Your Cambridge-aligned IELTS AI examiner',
    landingFooterMotto: 'Think like an examiner. Perform like a candidate.',
    
    // Auth
    landingSignIn: 'Sign In',
    landingCreateAccount: 'Create Account',
    landingWelcomeBack: 'Welcome Back',
    landingSignUpGoogle: 'Sign up with Google (Recommended)',
    landingSignUpEmail: 'Or sign up with email',
    landingEnterName: 'Enter your name',
    landingEnterEmail: 'Enter your email',
    landingCreatePassword: 'Create a password (min 8 characters)',
    landingEnterPassword: 'Enter your password',
    landingForgotPassword: 'Forgot password?',
    landingEmailWarning: 'After signing up, please check your Spam or Promotions folder for the verification email.',
    landingAlreadyAccount: 'Already have an account? Sign in',
    landingNeedAccount: "Need an account? Sign up",
    landingContinueWith: 'Or continue with',
    landingContinueGoogle: 'Continue with Google',
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
    navProfile: 'Hồ sơ',
    navDashboard: 'Bảng điều khiển',
    welcomeBack: 'Chào mừng trở lại',
    readyToContinue: 'Sẵn sàng tiếp tục hành trình luyện thi IELTS của bạn?',
    currentPlan: 'Gói hiện tại',
    speakingCredits: 'Số lượt thi Speaking',
    viewUpgradePlan: 'Xem / Nâng cấp gói',
    adminTopUpCredits: 'Admin: Nạp lượt thi',
    practiceTests: 'Bài thi thực hành',
    learningTools: 'Công cụ học tập',
    recentActivity: 'Hoạt động gần đây',
    noRecentActivity: 'Chưa có bài thi nào gần đây',
    startFirstTest: 'Bắt đầu bài thi đầu tiên để xem tiến độ của bạn',
    testsCompleted: 'Bài thi hoàn thành',
    avgBand: 'Band TB',
    streak: 'Chuỗi',
    days: 'ngày',

    // Test modules
    reading: 'Đọc hiểu',
    listening: 'Nghe hiểu',
    writing: 'Viết',
    speaking: 'Nói',
    readingDesc: 'Luyện kỹ năng đọc hiểu',
    listeningDesc: 'Luyện kỹ năng nghe hiểu',
    writingDesc: 'Luyện kỹ năng viết',
    speakingDesc: 'Luyện nói với AI',
    startTest: 'Bắt đầu thi',
    continueTest: 'Tiếp tục thi',

    // Learning tools
    vocabGrammar: 'Từ vựng & Ngữ pháp',
    vocabGrammarDesc: 'Xây dựng vốn từ và ngữ pháp',
    writingPractice: 'Luyện viết',
    writingPracticeDesc: 'Luyện viết với phản hồi AI',
    speakingPractice: 'Luyện nói',
    speakingPracticeDesc: 'Luyện nói với giám khảo AI',
    levelTest: 'Kiểm tra trình độ',
    levelTestDesc: 'Đánh giá trình độ hiện tại',

    // Test interface
    timeRemaining: 'Thời gian còn lại',
    passage: 'Bài đọc',
    part: 'Phần',
    question: 'Câu hỏi',
    questions: 'Câu hỏi',
    previous: 'Trước',
    next: 'Tiếp',
    submit: 'Nộp bài',
    submitTest: 'Nộp bài thi',
    exit: 'Thoát',
    typeYourAnswer: 'Nhập câu trả lời...',

    // Task descriptions
    taskTrueFalseNotGiven: 'ĐÚNG / SAI / KHÔNG CÓ THÔNG TIN',
    taskTrueFalseNotGivenDesc: 'Các phát biểu sau đây có phù hợp với thông tin trong bài đọc không? Viết ĐÚNG nếu phát biểu phù hợp với thông tin, SAI nếu phát biểu trái ngược với thông tin, KHÔNG CÓ THÔNG TIN nếu không có thông tin về điều này.',
    taskYesNoNotGiven: 'CÓ / KHÔNG / KHÔNG CÓ THÔNG TIN',
    taskYesNoNotGivenDesc: 'Các phát biểu sau có phù hợp với quan điểm của tác giả không? Viết CÓ nếu phù hợp, KHÔNG nếu trái ngược, KHÔNG CÓ THÔNG TIN nếu không thể xác định quan điểm của tác giả.',
    taskMultipleChoice: 'Trắc nghiệm',
    taskMultipleChoiceDesc: 'Chọn đáp án đúng A, B, C hoặc D.',
    taskSentenceCompletion: 'Hoàn thành câu',
    taskSentenceCompletionDesc: 'Hoàn thành các câu dưới đây. Chọn KHÔNG QUÁ BA TỪ từ bài đọc cho mỗi câu trả lời.',
    taskSummaryCompletion: 'Hoàn thành tóm tắt',
    taskSummaryCompletionDesc: 'Hoàn thành phần tóm tắt dưới đây. Chọn KHÔNG QUÁ HAI TỪ từ bài đọc cho mỗi câu trả lời.',
    taskMatchingHeadings: 'Nối tiêu đề',
    taskMatchingHeadingsDesc: 'Chọn tiêu đề phù hợp cho mỗi đoạn văn từ danh sách các tiêu đề dưới đây.',
    taskMatchingInfo: 'Nối thông tin',
    taskMatchingInfoDesc: 'Đoạn văn nào chứa thông tin sau? Bạn có thể sử dụng bất kỳ chữ cái nào nhiều lần.',
    taskNoteCompletion: 'Hoàn thành ghi chú',
    taskNoteCompletionDesc: 'Hoàn thành các ghi chú dưới đây. Viết KHÔNG QUÁ HAI TỪ VÀ/HOẶC MỘT SỐ cho mỗi câu trả lời.',
    taskFormCompletion: 'Hoàn thành biểu mẫu',
    taskFormCompletionDesc: 'Hoàn thành biểu mẫu dưới đây. Viết KHÔNG QUÁ BA TỪ VÀ/HOẶC MỘT SỐ cho mỗi câu trả lời.',
    taskMapLabeling: 'Điền nhãn bản đồ/Sơ đồ',
    taskMapLabelingDesc: 'Điền nhãn cho bản đồ/sơ đồ dưới đây. Viết chữ cái đúng A-H bên cạnh mỗi câu hỏi.',
    taskMatching: 'Nối đáp án',
    taskMatchingDesc: 'Chọn chữ cái đúng A-H từ danh sách.',

    // Results page
    testResults: 'Kết quả bài thi',
    yourScore: 'Điểm của bạn',
    bandScore: 'Điểm Band',
    correct: 'Đúng',
    incorrect: 'Sai',
    accuracy: 'Độ chính xác',
    personalFeedback: 'Phản hồi cá nhân',
    aiFeedback: 'Phân tích kết quả bằng AI',
    yourStrengths: 'Điểm mạnh của bạn',
    areasToImprove: 'Cần cải thiện',
    tipsToImprove: 'Mẹo để cải thiện',
    answerReview: 'Xem lại đáp án',
    yourAnswer: 'Đáp án của bạn',
    correctAnswer: 'Đáp án đúng',
    noAnswer: '(không trả lời)',
    practiceRecommendations: 'Khuyến nghị luyện tập',
    keepPracticing: 'Hãy tiếp tục luyện tập để phát hiện điểm mạnh!',
    greatJob: 'Tuyệt vời! Không có điểm yếu đáng kể.',
    practiceAgain: 'Luyện tập lại',

    // Writing Practice
    writingTask1Academic: 'Task 1 Học thuật',
    writingTask1AcademicDesc: 'Mô tả biểu đồ, bảng, đồ thị hoặc sơ đồ',
    writingTask1General: 'Task 1 Tổng quát',
    writingTask1GeneralDesc: 'Viết thư (trang trọng, bán trang trọng hoặc thân mật)',
    writingTask2Essay: 'Task 2 Bài luận',
    writingTask2EssayDesc: 'Viết bài luận về một chủ đề cho sẵn',
    selectTaskType: 'Chọn loại bài',
    selectPrompt: 'Chọn đề bài',
    startWriting: 'Bắt đầu viết',
    wordCount: 'Số từ',
    minWords: 'từ tối thiểu',
    saveDraft: 'Lưu nháp',
    submitForReview: 'Gửi để AI chấm điểm',
    writingFeedback: 'Phản hồi bài viết',
    taskResponse: 'Hoàn thành yêu cầu',
    coherenceCohesion: 'Mạch lạc & Liên kết',
    lexicalResource: 'Vốn từ vựng',
    grammaticalRange: 'Ngữ pháp',

    // Speaking Practice  
    aiExaminerActive: 'Giám khảo AI đang hoạt động',
    liveAiExaminer: 'Giám khảo nói AI trực tiếp',
    practiceWithAi: 'Luyện tập với giám khảo AI thời gian thực và nhận phản hồi ngay',
    startAiInterview: 'Bắt đầu phỏng vấn AI',
    sessionActive: 'Phiên đang hoạt động',
    creditsRemaining: 'lượt còn lại',
    freeTrialAvailable: '3 phút dùng thử MIỄN PHÍ!',
    getCredits: 'Mua thêm lượt để tiếp tục luyện tập',

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
    login: 'Đăng nhập',
    register: 'Đăng ký',
    forgotPassword: 'Quên mật khẩu?',
    orContinueWith: 'Hoặc tiếp tục với',
    alreadyHaveAccount: 'Đã có tài khoản?',
    dontHaveAccount: 'Chưa có tài khoản?',

    // Common
    loading: 'Đang tải...',
    error: 'Lỗi',
    success: 'Thành công',
    cancel: 'Hủy',
    save: 'Lưu',
    delete: 'Xóa',
    edit: 'Sửa',
    view: 'Xem',
    close: 'Đóng',
    back: 'Quay lại',
    home: 'Trang chủ',
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
