// Simple trilingual (EN/VI/TR) i18n helper for the app
import React from 'react';


export const LANGUAGES = {
  en: 'English',
  vi: 'Tiếng Việt',
  tr: 'Türkçe',
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
    landingPracticalLearningBadge: 'Practical Learning',
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
    
    // Try Our Lessons
    landingTryOurLessons: 'Try Our Lessons',
    landingChooseCourse: 'Choose Your Level',
    landingChooseCourseDesc: 'Select a course based on your current band level. Try 3 free lessons from each course to find the best fit for you.',
    landingTryLessonsBadge: 'Free Preview',
    landingTryLessonsTitle: 'Try Our Lessons — No Sign Up Required',
    landingTryLessonsDesc: 'Experience our Cambridge-aligned lessons before you commit. Each module includes advanced vocabulary, grammar structures, and AI-powered practice.',
    landingFreePreview: 'FREE',
    landingLessonVocab: 'Advanced Vocabulary',
    landingLessonGrammar: 'Grammar Structures',
    landingLessonWriting: 'Writing Practice',
    landingStartLesson: 'Start Lesson',
    landingSignUpToUnlock: 'Sign up to unlock all lessons',
    landingMoreLessons: 'Get access to 20+ comprehensive modules covering all IELTS themes',
    landingMoreLessonsAvailable: 'Many more lessons available!',
    landingSignUpForMore: 'Sign up to unlock all lessons across all courses.',
    landingUnlockAll: 'Unlock All Lessons',
    
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
    
    // Grammar Practice (Beginner Course)
    grammarRule: 'Grammar Rule',
    moreExamples: 'More Examples',
    commonMistake: 'Common Mistake',
    grammarPractice: 'Grammar Practice',
    fillInBlanks: 'Fill in the blanks with the correct word:',
    checkAnswers: 'Check Answers',
    tryAgain: 'Try Again',
    perfectScore: '🎉 Perfect! You mastered this grammar!',
    goodJob: '👍 Good job! Review the mistakes above.',
    example: 'Example',
    vocabulary: 'Vocabulary',
    grammar: 'Grammar',
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

    // Landing Page
    landingBadge: 'AI được huấn luyện như giám khảo Cambridge thực thụ',
    landingHeroTitle1: 'Luyện thi IELTS với AI',
    landingHeroTitle2: 'tư duy như giám khảo thật',
    landingHeroSubtitle: 'Không chỉ cho điểm. Đánh giá theo chuẩn giám khảo, phản hồi trung thực, và lộ trình cải thiện rõ ràng.',
    landingHeroDesc: "Hầu hết các nền tảng chỉ cho bạn biết bạn đạt band bao nhiêu. Chúng tôi giải thích TẠI SAO bạn nhận điểm đó, điều gì cản trở bạn đạt điểm cao hơn, và chính xác cần học gì tiếp theo.",
    landingStartLevelCheck: 'Kiểm tra trình độ miễn phí',
    landingWhyChooseUs: 'Tại sao học viên chọn IELTS Ace',
    landingWhyChooseUsDesc: 'Điều gì khiến AI của chúng tôi khác biệt với công cụ chấm điểm thông thường',
    landingExaminerAI: 'AI theo chuẩn giám khảo',
    landingExaminerAIDesc: 'AI của chúng tôi được huấn luyện với band descriptors chính thức và logic giám khảo — không phải mô hình chấm điểm chung chung.',
    landingNoBandInflation: 'Không thổi phồng điểm',
    landingNoBandInflationDesc: 'Câu trả lời trôi chảy nhưng không liên quan sẽ bị giới hạn điểm. Giống như kỳ thi IELTS thực.',
    landingTeaching: 'Dạy học, không chỉ kiểm tra',
    landingTeachingDesc: 'Chúng tôi không dừng lại ở điểm số. Chúng tôi giải thích quyết định và hướng dẫn bước tiếp theo.',
    landingPersonalPath: 'Lộ trình học cá nhân',
    landingPersonalPathDesc: 'Mỗi kết quả dẫn đến bài luyện tập nhắm đúng vào điểm yếu cụ thể của bạn.',
    
    // Methodology
    landingMethodology: 'Phương pháp học tập',
    landingMethodologyDesc: 'Chu trình đã được chứng minh giúp xây dựng kỹ năng IELTS thực sự, không phải sự tự tin giả',
    landingStepTest: 'THI THỬ',
    landingStepTestDesc: 'Làm bài thi theo chuẩn đề thi thật có tính thời gian',
    landingStepDiagnose: 'CHẨN ĐOÁN',
    landingStepDiagnoseDesc: 'AI xác định chính xác điểm yếu và yếu tố hạn chế của bạn',
    landingStepStudy: 'HỌC TẬP',
    landingStepStudyDesc: 'Học các bài học được thiết kế để khắc phục lỗ hổng cụ thể của bạn',
    landingStepRetry: 'LUYỆN LẠI',
    landingStepRetryDesc: 'Luyện tập lại với mục tiêu cải thiện tập trung cho đến khi thành thạo',
    landingRepeatUntil: 'Lặp lại cho đến khi đạt band mục tiêu',
    
    // Comparison
    landingCompareTitle: 'So sánh các phương pháp',
    landingCompareDesc: 'Lớp học truyền thống, AI thông thường, và AI được huấn luyện theo Cambridge',
    landingTraditional: 'Lớp học truyền thống',
    landingTraditionalSub: 'Sách & Giáo viên',
    landingTraditionalBestFor: 'Phù hợp cho: Người cần động lực trực tiếp',
    landingOtherAI: 'Nền tảng AI khác',
    landingOtherAISub: 'Chấm điểm AI chung chung',
    landingOtherAIBestFor: 'Phù hợp cho: Luyện tập nhanh không cần độ chính xác',
    landingIELTSAce: 'IELTS Ace',
    landingIELTSAceSub: 'AI được huấn luyện theo Cambridge',
    landingIELTSAceBestFor: 'Phù hợp cho: Người học nghiêm túc muốn tiến bộ thực sự',
    landingRecommended: 'KHUYÊN DÙNG',
    landingQuote1: 'Chúng tôi không dạy bạn nói trôi chảy.',
    landingQuote2: 'Chúng tôi dạy bạn tư duy, phản hồi và thể hiện như một thí sinh IELTS.',
    
    // Traditional comparison items
    landingTradItem1: 'Thời gian luyện tập hạn chế',
    landingTradItem2: 'Gia sư riêng đắt đỏ',
    landingTradItem3: 'Phản hồi chung chung cho cả nhóm',
    landingTradItem4: 'Phải theo lịch cố định',
    landingTradItem5: 'Không có đánh giá ngay lập tức',
    
    // Other AI comparison items
    landingOtherAIItem1: 'Phản hồi nhanh',
    landingOtherAIItem2: 'Thổi phồng điểm để giữ người dùng',
    landingOtherAIItem3: 'Nhận xét khích lệ chung chung',
    landingOtherAIItem4: 'Không có logic giám khảo',
    landingOtherAIItem5: 'Không có lộ trình cải thiện rõ ràng',
    
    // IELTS Ace comparison items
    landingAceItem1: 'Logic đánh giá giám khảo thực',
    landingAceItem2: 'Điểm band trung thực (không thổi phồng)',
    landingAceItem3: 'Giải thích TẠI SAO bạn được band đó',
    landingAceItem4: 'Chẩn đoán chính xác điểm yếu của bạn',
    landingAceItem5: 'Lộ trình Thi → Học → Luyện lại',
    
    // Practical Skills
    landingPracticalLearningBadge: 'Học tập thực hành',
    landingPracticalTitle: 'Học kỹ năng bạn thực sự sử dụng được',
    landingPracticalDesc: 'Mỗi bài học được thiết kế để áp dụng thực tế. Sau mỗi module, bạn sẽ có kỹ năng có thể sử dụng ngay — trong kỳ thi và trong cuộc sống.',
    landingSpeakingConfidence: 'Tự tin khi nói',
    landingSpeakingConfidenceDesc: 'Học cách diễn đạt ý tưởng phức tạp một cách rõ ràng. Sử dụng kỹ năng này trong phỏng vấn xin việc, thuyết trình, và giao tiếp hàng ngày.',
    landingAcademicWriting: 'Viết học thuật',
    landingAcademicWritingDesc: 'Thành thạo cấu trúc bài luận và lập luận. Áp dụng trong bài tập đại học, báo cáo, và email chuyên nghiệp.',
    landingCriticalReading: 'Đọc phản biện',
    landingCriticalReadingDesc: 'Phát triển kỹ năng đọc lướt, quét và suy luận. Sử dụng để nhanh chóng hiểu hợp đồng, bài báo, và nghiên cứu.',
    landingActiveListening: 'Nghe chủ động',
    landingActiveListeningDesc: 'Rèn luyện tai nghe các giọng và tốc độ khác nhau. Áp dụng trong cuộc họp, bài giảng, và giao tiếp quốc tế.',
    landingVocabMastery: 'Làm chủ từ vựng',
    landingVocabMasteryDesc: 'Học từ vựng theo chủ đề với cách sử dụng thực tế. Sử dụng ngôn ngữ tinh tế một cách tự nhiên trong mọi ngữ cảnh.',
    landingTimeManagement: 'Quản lý thời gian',
    landingTimeManagementDesc: 'Luyện tập có tính thời gian. Phát triển kỹ năng làm việc hiệu quả dưới áp lực trong mọi tình huống.',
    landingGuaranteed: 'Cam kết áp dụng thực tế',
    landingGuaranteedDesc: 'Mỗi bài học kết thúc bằng bài tập thực hành bạn có thể áp dụng ngay. Không có kiến thức lý thuyết bị bỏ không sử dụng.',
    landingStartLearning: 'Bắt đầu học',
    
    // How AI Works
    landingHowAIWorks: 'Giám khảo thật suy nghĩ như thế nào',
    landingHowAIWorksTitle: 'AI của chúng tôi đánh giá như giám khảo Cambridge',
    landingHowAIWorksDesc: 'AI của chúng tôi đánh giá bài làm của bạn bằng chính xác logic mà giám khảo IELTS thực sử dụng:',
    landingAIStep1: 'Độ liên quan câu hỏi',
    landingAIStep1Desc: 'Bạn có thực sự trả lời đúng câu hỏi được hỏi không?',
    landingAIStep2: 'Hoàn thành yêu cầu',
    landingAIStep2Desc: 'Bạn có hoàn thành tất cả các phần của bài không?',
    landingAIStep3: 'Kiểm soát ngôn ngữ',
    landingAIStep3Desc: 'Ngữ pháp và từ vựng của bạn chính xác đến mức nào?',
    landingAIStep4: 'Bằng chứng cho band',
    landingAIStep4Desc: 'Có bằng chứng rõ ràng cho điểm band được cho không?',
    landingKeyRule: 'Quy tắc quan trọng:',
    landingKeyRuleDesc: 'Nếu câu trả lời không đúng câu hỏi, điểm sẽ bị giới hạn — bất kể độ trôi chảy.',
    landingKeyRuleDesc2: 'Đây là cách giám khảo thật suy nghĩ. Và đây là cách tiến bộ thực sự diễn ra.',
    
    // Who is this for
    landingWhoFor: 'IELTS Ace dành cho ai?',
    landingWhoFor1: 'Học viên bị mắc kẹt ở Band 4–5',
    landingWhoFor1Desc: 'Phá vỡ rào cản trình độ trung bình',
    landingWhoFor2: 'Hướng đến Band 6–7+',
    landingWhoFor2Desc: 'Cần phản hồi chính xác để đạt mục tiêu',
    landingWhoFor3: 'Người tự học',
    landingWhoFor3Desc: 'Cần hướng dẫn rõ ràng mà không cần gia sư',
    landingWhoFor4: 'Chán ngấy phản hồi mơ hồ',
    landingWhoFor4Desc: 'Muốn lời khuyên trung thực, có thể hành động',
    
    // Complete Features
    landingCompletePrep: 'Luyện thi IELTS toàn diện',
    landingCompletePrepDesc: 'Cả 4 kỹ năng với đánh giá bằng AI',
    landingReadingFeature: 'Academic & General • Bài đọc đầy đủ • 12 loại câu hỏi',
    landingListeningFeature: '4 phần • Audio thật • Luyện có tính giờ',
    landingWritingFeature: 'Task 1 & 2 • Chấm bằng AI • Mẫu Band 8+',
    landingSpeakingFeature: '3 phần • Giám khảo AI • Câu trả lời mẫu',
    landingAdvancedCourse: 'Khóa học IELTS Nâng cao',
    landingAdvancedCourseDesc: '20 module toàn diện với từ vựng, ngữ pháp, bài đọc, đề viết, và luyện nói — tất cả theo chuẩn Cambridge.',
    landingBand6to9: 'Lộ trình Band 6.0 → 9.0',
    landingExploreCourse: 'Khám phá khóa học',
    
    // Try Our Lessons
    landingTryOurLessons: 'Thử bài học',
    landingChooseCourse: 'Chọn trình độ của bạn',
    landingChooseCourseDesc: 'Chọn khóa học phù hợp với band hiện tại của bạn. Thử 3 bài học miễn phí từ mỗi khóa để tìm khóa phù hợp nhất.',
    landingTryLessonsBadge: 'Xem trước miễn phí',
    landingTryLessonsTitle: 'Thử bài học của chúng tôi — Không cần đăng ký',
    landingTryLessonsDesc: 'Trải nghiệm bài học theo chuẩn Cambridge trước khi quyết định. Mỗi module bao gồm từ vựng nâng cao, cấu trúc ngữ pháp, và luyện tập với AI.',
    landingFreePreview: 'MIỄN PHÍ',
    landingLessonVocab: 'Từ vựng nâng cao',
    landingLessonGrammar: 'Cấu trúc ngữ pháp',
    landingLessonWriting: 'Luyện viết',
    landingStartLesson: 'Bắt đầu bài học',
    landingSignUpToUnlock: 'Đăng ký để mở khóa tất cả bài học',
    landingMoreLessons: 'Truy cập hơn 20 module toàn diện bao gồm tất cả chủ đề IELTS',
    landingMoreLessonsAvailable: 'Còn nhiều bài học hơn nữa!',
    landingSignUpForMore: 'Đăng ký để mở khóa tất cả bài học của mọi khóa học.',
    landingUnlockAll: 'Mở khóa tất cả bài học',
    
    // Honesty Promise
    landingHonestyTitle: 'Cam kết trung thực',
    landingNoPromise: 'Chúng tôi KHÔNG hứa Band 7 ngay lập tức.',
    landingWePromise1: 'Đánh giá trung thực',
    landingWePromise2: 'Giải thích rõ ràng',
    landingWePromise3: 'Lộ trình cải thiện có cấu trúc',
    landingHonestyEnd: 'Đó là cách đạt kết quả thực sự.',
    
    // Final CTA
    landingFinalCTA: 'Sẵn sàng xem giám khảo thật suy nghĩ như thế nào?',
    landingFinalCTADesc: 'Bắt đầu với một bài thi. Để IELTS Ace đồng hành cùng bạn.',
    
    // Footer
    landingFooterTagline: 'Giám khảo IELTS AI theo chuẩn Cambridge',
    landingFooterMotto: 'Tư duy như giám khảo. Thể hiện như thí sinh.',
    
    // Auth
    landingSignIn: 'Đăng nhập',
    landingCreateAccount: 'Tạo tài khoản',
    landingWelcomeBack: 'Chào mừng trở lại',
    landingSignUpGoogle: 'Đăng ký bằng Google (Khuyên dùng)',
    landingSignUpEmail: 'Hoặc đăng ký bằng email',
    landingEnterName: 'Nhập tên của bạn',
    landingEnterEmail: 'Nhập email của bạn',
    landingCreatePassword: 'Tạo mật khẩu (tối thiểu 8 ký tự)',
    landingEnterPassword: 'Nhập mật khẩu của bạn',
    landingForgotPassword: 'Quên mật khẩu?',
    landingEmailWarning: 'Sau khi đăng ký, hãy kiểm tra thư mục Spam hoặc Quảng cáo để tìm email xác nhận.',
    landingAlreadyAccount: 'Đã có tài khoản? Đăng nhập',
    landingNeedAccount: 'Chưa có tài khoản? Đăng ký',
    landingContinueWith: 'Hoặc tiếp tục với',
    landingContinueGoogle: 'Tiếp tục với Google',
    
    // Grammar Practice (Beginner Course)
    grammarRule: 'Quy tắc ngữ pháp',
    moreExamples: 'Thêm ví dụ',
    commonMistake: 'Lỗi thường gặp',
    grammarPractice: 'Luyện ngữ pháp',
    fillInBlanks: 'Điền vào chỗ trống với từ đúng:',
    checkAnswers: 'Kiểm tra đáp án',
    tryAgain: 'Thử lại',
    perfectScore: '🎉 Hoàn hảo! Bạn đã thành thạo ngữ pháp này!',
    goodJob: '👍 Tốt lắm! Xem lại các lỗi ở trên.',
    example: 'Ví dụ',
    vocabulary: 'Từ vựng',
    grammar: 'Ngữ pháp',
  },
  tr: {
    languageLabel: 'Dil',
    // Landing / global
    appName: 'IELTS Ace',
    getStarted: 'Başla',
    startPracticingFree: 'Ücretsiz Pratiğe Başla',
    startYourFreePractice: 'Ücretsiz Pratiğe Başla',

    // Dashboard
    navTips: 'İpuçları',
    navCourses: 'Kurslar',
    navPricing: 'Fiyatlandırma',
    navProfile: 'Profil',
    navLogout: 'Çıkış Yap',
    dashboardTitle: 'Gösterge Paneli',

    // Test skills
    reading: 'Okuma',
    readingDesc: 'Okuma becerilerini geliştir',
    listening: 'Dinleme',
    listeningDesc: 'Dinleme becerilerini geliştir',
    writing: 'Yazma',
    writingDesc: 'Yazma görevleri pratiği yap',
    speaking: 'Konuşma',
    speakingDesc: 'Yapay Zeka ile konuşma pratiği yap',
    startTest: 'Teste Başla',
    continueTest: 'Teste Devam Et',

    // Learning tools
    vocabGrammar: 'Kelime & Dilbilgisi',
    vocabGrammarDesc: 'Kelime ve dilbilgisi becerilerini geliştir',
    writingPractice: 'Yazma Pratiği',
    writingPracticeDesc: 'AI geri bildirimi ile yazma pratiği yap',
    speakingPractice: 'Konuşma Pratiği',
    speakingPracticeDesc: 'AI sınav değerlendiricisi ile konuşma pratiği yap',
    levelTest: 'Seviye Testi',
    levelTestDesc: 'Mevcut seviyenizi değerlendirin',

    // Test interface
    timeRemaining: 'Kalan Süre',
    passage: 'Paragraf',
    part: 'Bölüm',
    question: 'Soru',
    questions: 'Sorular',
    previous: 'Önceki',
    next: 'Sonraki',
    submit: 'Gönder',
    submitTest: 'Testi Gönder',
    exit: 'Çıkış',
    typeYourAnswer: 'Cevabınızı yazın...',

    // Task descriptions
    taskTrueFalseNotGiven: 'DOĞRU / YANLIŞ / BELİRTİLMEMİŞ',
    taskMultipleChoice: 'Çoktan Seçmeli',
    taskSentenceCompletion: 'Cümle Tamamlama',
    taskSummaryCompletion: 'Özet Tamamlama',
    taskMatchingHeadings: 'Başlık Eşleştirme',
    taskMatchingInfo: 'Bilgi Eşleştirme',

    // Results page
    testResults: 'Test Sonuçları',
    yourScore: 'Puanınız',
    bandScore: 'Band Puanı',
    correct: 'Doğru',
    incorrect: 'Yanlış',
    accuracy: 'Doğruluk',
    personalFeedback: 'Kişisel Geri Bildiriminiz',
    aiFeedback: 'Performansınızın AI destekli analizi',
    yourStrengths: 'Güçlü Yönleriniz',
    areasToImprove: 'Geliştirilecek Alanlar',
    tipsToImprove: 'Gelişim İpuçları',
    answerReview: 'Cevap İncelemesi',
    yourAnswer: 'Cevabınız',
    correctAnswer: 'Doğru cevap',
    noAnswer: '(cevap yok)',
    practiceRecommendations: 'Odaklı Pratik Önerileri',
    keepPracticing: 'Güçlü yönlerinizi belirlemek için pratik yapmaya devam edin!',
    greatJob: 'Harika iş! Büyük zayıflık tespit edilmedi.',
    practiceAgain: 'Tekrar Pratik Yap',

    // Writing Practice
    writingTask1Academic: 'Görev 1 Akademik',
    writingTask1General: 'Görev 1 Genel',
    writingTask2Essay: 'Görev 2 Makale',
    selectTaskType: 'Görev Türünü Seç',
    selectPrompt: 'Bir Konu Seç',
    startWriting: 'Yazmaya Başla',
    wordCount: 'Kelime Sayısı',
    minWords: 'min kelime',
    saveDraft: 'Taslağı Kaydet',
    submitForReview: 'AI İncelemesi İçin Gönder',
    writingFeedback: 'Yazma Geri Bildirimi',
    taskResponse: 'Görev Yanıtı',
    coherenceCohesion: 'Tutarlılık & Bütünlük',
    lexicalResource: 'Kelime Kaynağı',
    grammaticalRange: 'Dilbilgisi Aralığı',

    // Speaking Practice  
    aiExaminerActive: 'AI Değerlendirici Aktif',
    liveAiExaminer: 'Canlı AI Konuşma Değerlendiricisi',
    practiceWithAi: 'Anında geri bildirim veren gerçek zamanlı AI değerlendiricisi ile pratik yapın',
    startAiInterview: 'AI Mülakatını Başlat',
    creditsRemaining: 'kalan',
    freeTrialAvailable: '3 dakika ÜCRETSİZ deneme mevcut!',
    getCredits: 'Pratik yapmaya devam etmek için kredi alın',

    // Pricing page
    pricingTitle: 'IELTS Ace Fiyatlandırma',
    pricingSubtitle: 'Konuşma hedeflerinize uygun planı seçin.',
    backToDashboard: 'Panele Dön',

    // Auth basics
    email: 'E-posta',
    password: 'Şifre',
    login: 'Giriş Yap',
    register: 'Kayıt Ol',
    forgotPassword: 'Şifrenizi mi Unuttunuz?',
    orContinueWith: 'Veya şununla devam et',
    alreadyHaveAccount: 'Zaten hesabınız var mı?',
    dontHaveAccount: 'Hesabınız yok mu?',

    // Common
    loading: 'Yükleniyor...',
    error: 'Hata',
    success: 'Başarı',
    cancel: 'İptal',
    save: 'Kaydet',
    delete: 'Sil',
    edit: 'Düzenle',
    view: 'Görüntüle',
    close: 'Kapat',
    back: 'Geri',
    home: 'Anasayfa',

    // Landing Page
    landingBadge: 'Gerçek Cambridge Değerlendiricisi Gibi Eğitilmiş AI',
    landingHeroTitle1: 'Bir sınav değerlendiricisi gibi düşünen',
    landingHeroTitle2: 'AI ile IELTS\'e Hazırlanın',
    landingHeroSubtitle: 'Sadece puanlar değil. Gerçek değerlendirici tarzı değerlendirme, dürüst geri bildirim ve gelişim için net bir yol.',
    landingHeroDesc: 'Çoğu platform sadece hangi bandı aldığınızı söyler. Biz neden o bandı aldığınızı, daha yüksek puan almanızı neyin engellediğini ve tam olarak ne çalışmanız gerektiğini açıklıyoruz.',
    landingStartLevelCheck: 'Ücretsiz Seviye Kontrolü Başlat',
    landingWhyChooseUs: 'Öğrenciler Neden IELTS Ace\'i Seçiyor',
    landingWhyChooseUsDesc: 'AI\'mızı genel puanlama araçlarından farklı kılan nedir',
    landingExaminerAI: 'Değerlendirici Temelli AI',
    landingExaminerAIDesc: 'AI\'mız resmi IELTS band tanımlayıcıları ve değerlendirici mantığıyla eğitilmiştir.',
    landingNoBandInflation: 'Band Şişirmesi Yok',
    landingNoBandInflationDesc: 'Akıcı ama alakasız cevaplar sınırlandırılır. Gerçek IELTS sınavı gibi.',
    landingTeaching: 'Sadece Test Değil, Öğretim',
    landingTeachingDesc: 'Sadece puanlarla yetinmiyoruz. Kararları açıklıyor ve sonraki adımlarınızı yönlendiriyoruz.',
    landingPersonalPath: 'Kişisel Öğrenim Yolu',
    landingPersonalPathDesc: 'Her sonuç, belirli zayıflıklarınıza göre hedeflenmiş pratiğe yönlendirir.',
    
    // Methodology
    landingMethodology: 'Öğrenme Metodolojimiz',
    landingMethodologyDesc: 'Yanlış güven değil, gerçek IELTS becerileri oluşturan kanıtlanmış döngü',
    landingStepTest: 'TEST',
    landingStepTestDesc: 'Süreli koşullarda gerçek sınav tarzı bir test yapın',
    landingStepDiagnose: 'TEŞHİS',
    landingStepDiagnoseDesc: 'AI tam zayıflıklarınızı ve sınırlayıcı faktörleri belirler',
    landingStepStudy: 'ÇALIŞMA',
    landingStepStudyDesc: 'Belirli boşluklarınızı gidermek için tasarlanmış hedefli dersler öğrenin',
    landingStepRetry: 'TEKRAR',
    landingStepRetryDesc: 'Ustalaşana kadar odaklı gelişimle tekrar pratik yapın',
    landingRepeatUntil: 'Hedef bandınıza ulaşana kadar tekrarlayın',
    
    // Comparison
    landingCompareTitle: 'Yöntemleri Karşılaştırın',
    landingCompareDesc: 'Geleneksel dersler, Genel AI ve Cambridge eğitimli AI',
    landingTraditional: 'Geleneksel Dersler',
    landingTraditionalSub: 'Kitaplar & Öğretmenler',
    landingTraditionalBestFor: 'En iyi: Yüz yüze motivasyon ihtiyacı olanlar için',
    landingOtherAI: 'Diğer AI Platformları',
    landingOtherAISub: 'Genel AI Puanlama',
    landingOtherAIBestFor: 'En iyi: Doğruluk olmadan hızlı pratik için',
    landingIELTSAce: 'IELTS Ace',
    landingIELTSAceSub: 'Cambridge Eğitimli AI',
    landingIELTSAceBestFor: 'En iyi: Gerçek gelişim isteyen ciddi öğrenciler için',
    landingRecommended: 'ÖNERİLEN',
    
    // Comparison Items - Traditional
    landingTradItem1: 'Sınırlı pratik süresi',
    landingTradItem2: 'Pahalı özel öğretmenler',
    landingTradItem3: 'Grup için genel geri bildirim',
    landingTradItem4: 'Sabit program gerekli',
    landingTradItem5: 'Anında değerlendirme yok',
    
    // Comparison Items - Other AI
    landingOtherAIItem1: 'Anında geri bildirim',
    landingOtherAIItem2: 'Etkileşim için şişirilmiş puanlar',
    landingOtherAIItem3: 'Genel teşvik edici yorumlar',
    landingOtherAIItem4: 'Sınav görevlisi mantığı yok',
    landingOtherAIItem5: 'Net gelişim yolu yok',
    
    // Comparison Items - IELTS Ace
    landingAceItem1: 'Gerçek sınav görevlisi değerlendirme mantığı',
    landingAceItem2: 'Dürüst band puanları (şişirme yok)',
    landingAceItem3: 'NEDEN o bandı aldığınızı açıklar',
    landingAceItem4: 'Tam olarak zayıf noktalarınızı teşhis eder',
    landingAceItem5: 'Test → Çalış → Tekrar Dene yolu',
    
    landingQuote1: 'Sizi akıcı konuşmanız için eğitmiyoruz.',
    landingQuote2: 'Sizi bir IELTS adayı gibi düşünmeniz, yanıt vermeniz ve performans göstermeniz için eğitiyoruz.',
    
    // Practical Skills
    landingPracticalLearningBadge: 'Pratik Öğrenme',
    landingPracticalTitle: 'Gerçekten Kullanacağınız Becerileri Öğrenin',
    landingPracticalDesc: 'Her ders gerçek dünya uygulaması için tasarlanmıştır. Her modülden sonra hemen kullanabileceğiniz becerileriniz olacak — sınavlarda ve hayatta.',
    landingSpeakingConfidence: 'Konuşma Güveni',
    landingSpeakingConfidenceDesc: 'Karmaşık fikirleri net bir şekilde ifade etmeyi öğrenin.',
    landingAcademicWriting: 'Akademik Yazma',
    landingAcademicWritingDesc: 'Makale yapısı ve argümantasyonda ustalaşın.',
    landingCriticalReading: 'Eleştirel Okuma',
    landingCriticalReadingDesc: 'Tarama, gözden geçirme ve çıkarım becerilerini geliştirin.',
    landingActiveListening: 'Aktif Dinleme',
    landingActiveListeningDesc: 'Kulağınızı farklı aksanlar ve hızlar için eğitin.',
    landingGuaranteed: 'Garantili Gerçek Dünya Uygulaması',
    landingGuaranteedDesc: 'Her ders hemen uygulayabileceğiniz pratik bir alıştırmayla biter.',
    landingStartLearning: 'Öğrenmeye Başla',
    
    // Vocabulary & Skills
    landingVocabMastery: 'Kelime Ustalığı',
    landingVocabMasteryDesc: 'Gerçek kullanımla konuya özel kelime öğrenin. Her bağlamda doğal olarak sofistike dil kullanın.',
    landingTimeManagement: 'Zaman Yönetimi',
    landingTimeManagementDesc: 'Zamanlı koşullarda pratik yapın. Her durumda baskı altında verimli çalışma becerileri geliştirin.',
    
    // Who is it for
    landingWhoFor: 'IELTS Ace kimler için?',
    landingWhoFor1: 'Band 4-5\'te takılan öğrenciler',
    landingWhoFor1Desc: 'Orta seviye tavanını kırmak',
    landingWhoFor2: 'Band 6-7+ hedefleyenler',
    landingWhoFor2Desc: 'Hedefinize ulaşmak için kesin geri bildirime ihtiyacınız var',
    landingWhoFor3: 'Kendi kendine öğrenenler',
    landingWhoFor3Desc: 'Öğretmen olmadan net rehberliğe ihtiyacınız var',
    landingWhoFor4: 'Belirsiz geri bildirimden bıkanlar',
    landingWhoFor4Desc: 'Dürüst, uygulanabilir tavsiye isteyenler',
    
    // Complete Prep
    landingCompletePrep: 'Eksiksiz IELTS Hazırlığı',
    landingCompletePrepDesc: 'AI destekli değerlendirme ile dört beceri',
    
    // Try Our Lessons
    landingTryOurLessons: 'Derslerimizi Deneyin',
    landingChooseCourse: 'Seviyenizi Seçin',
    landingChooseCourseDesc: 'Mevcut band seviyenize göre bir kurs seçin. Size en uygun olanı bulmak için her kurstan 3 ücretsiz ders deneyin.',
    landingAdvancedCourse: 'İleri IELTS Ustalık Kursu',
    landingAdvancedCourseDesc: 'Kelime, dilbilgisi, okuma pasajları, yazma ödevleri ve konuşma pratiği içeren 20 kapsamlı modül — hepsi Cambridge uyumlu içerikle.',
    landingExploreCourse: 'Kursu Keşfet',
    landingBand6to9: 'Band 6.0 → 9.0 Yol Haritası',
    landingTryLessonsBadge: 'Ücretsiz Önizleme',
    landingTryLessonsTitle: 'Derslerimizi Deneyin — Kayıt Gerekmez',
    landingTryLessonsDesc: 'Karar vermeden önce Cambridge uyumlu derslerimizi deneyimleyin. Her modül gelişmiş kelime, dilbilgisi yapıları ve AI destekli pratik içerir.',
    landingFreePreview: 'ÜCRETSİZ',
    landingLessonVocab: 'Gelişmiş Kelime Bilgisi',
    landingLessonGrammar: 'Dilbilgisi Yapıları',
    landingLessonWriting: 'Yazma Pratiği',
    landingStartLesson: 'Derse Başla',
    landingSignUpToUnlock: 'Tüm derslerin kilidini açmak için kayıt olun',
    landingMoreLessons: 'Tüm IELTS temalarını kapsayan 20+ kapsamlı modüle erişin',
    landingMoreLessonsAvailable: 'Daha birçok ders mevcut!',
    landingSignUpForMore: 'Tüm kurslardaki tüm derslerin kilidini açmak için kayıt olun.',
    landingUnlockAll: 'Tüm Derslerin Kilidini Aç',
    
    // Complete Prep Skills
    landingReadingFeature: 'Akademik & Genel • Tam pasajlar • 12 soru tipi',
    landingListeningFeature: '4 bölüm • Gerçek ses • Zamanlı pratik',
    landingWritingFeature: 'Görev 1 & 2 • AI puanlama • Band 8+ örnekler',
    landingSpeakingFeature: '3 bölüm • AI sınav görevlisi • Model cevaplar',
    
    // Honesty Promise
    landingHonestyTitle: 'Dürüstlük Sözümüz',
    landingNoPromise: 'Anında Band 7 vaat etmiyoruz.',
    landingWePromise1: 'Dürüst değerlendirme',
    landingWePromise2: 'Net açıklamalar',
    landingWePromise3: 'Yapılandırılmış gelişim yolu',
    landingHonestyEnd: 'Gerçek sonuçlar böyle elde edilir.',
    
    // Final CTA
    landingFinalCTA: 'Bir değerlendiricinin gerçekten nasıl düşündüğünü görmeye hazır mısınız?',
    landingFinalCTADesc: 'Bir testle başlayın. IELTS Ace yolculuğunuza rehberlik etsin.',
    
    // Footer
    landingFooterTagline: 'Cambridge uyumlu IELTS AI değerlendiriciniz',
    landingFooterMotto: 'Bir değerlendirici gibi düşün. Bir aday gibi performans göster.',
    
    // How AI Works
    landingHowAIWorks: 'Gerçek Değerlendiriciler Nasıl Düşünür',
    landingHowAIWorksTitle: 'AI\'mız Cambridge sınav görevlisi gibi değerlendirir',
    landingHowAIWorksDesc: 'AI\'mız performansınızı gerçek IELTS sınav görevlilerinin kullandığı mantıkla değerlendirir:',
    landingAIStep1: 'Soru İlgisi',
    landingAIStep1Desc: 'Sorulan soruyu gerçekten cevapladınız mı?',
    landingAIStep2: 'Görev Tamamlama',
    landingAIStep2Desc: 'Görevin tüm bölümlerini tamamladınız mı?',
    landingAIStep3: 'Dil Kontrolü',
    landingAIStep3Desc: 'Dilbilginiz ve kelime bilginiz ne kadar doğru?',
    landingAIStep4: 'Band Kanıtı',
    landingAIStep4Desc: 'Band puanı için net bir kanıt var mı?',
    landingKeyRule: 'Temel Kural:',
    landingKeyRuleDesc: 'Bir cevap soruyu cevaplamıyorsa, akıcılığa bakılmaksızın puan sınırlandırılır.',
    landingKeyRuleDesc2: 'Gerçek sınav görevlileri böyle düşünür. Ve gerçek ilerleme böyle olur.',
    
    // Auth
    landingSignIn: 'Giriş Yap',
    landingCreateAccount: 'Hesap Oluştur',
    landingWelcomeBack: 'Tekrar Hoş Geldiniz',
    landingSignUpGoogle: 'Google ile Kaydol (Önerilen)',
    landingSignUpEmail: 'Veya e-posta ile kaydol',
    landingEnterName: 'Adınızı girin',
    landingEnterEmail: 'E-postanızı girin',
    landingCreatePassword: 'Şifre oluşturun (min 8 karakter)',
    landingEnterPassword: 'Şifrenizi girin',
    landingForgotPassword: 'Şifrenizi mi unuttunuz?',
    landingEmailWarning: 'Kaydolduktan sonra, doğrulama e-postası için Spam veya Promosyonlar klasörünüzü kontrol edin.',
    landingAlreadyAccount: 'Zaten hesabınız var mı? Giriş yapın',
    landingNeedAccount: 'Hesabınız yok mu? Kaydolun',
    landingContinueWith: 'Veya şununla devam et',
    landingContinueGoogle: 'Google ile Devam Et',
    
    // Grammar Practice (Beginner Course)
    grammarRule: 'Dilbilgisi Kuralı',
    moreExamples: 'Daha Fazla Örnek',
    commonMistake: 'Sık Yapılan Hata',
    grammarPractice: 'Dilbilgisi Pratiği',
    fillInBlanks: 'Boşlukları doğru kelimeyle doldurun:',
    checkAnswers: 'Cevapları Kontrol Et',
    tryAgain: 'Tekrar Dene',
    perfectScore: '🎉 Mükemmel! Bu dilbilgisi konusunda ustalaştınız!',
    goodJob: '👍 İyi iş! Yukarıdaki hataları gözden geçirin.',
    example: 'Örnek',
    vocabulary: 'Kelime',
    grammar: 'Dilbilgisi',
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
    return ['en', 'vi', 'tr'].includes(stored) ? stored : 'en';
  });

  // Always use English translations regardless of selected language
  const t = React.useCallback(
    (key) => {
      return translations.en[key] || key;
    },
    []
  );

  const value = React.useMemo(
    () => ({ language, setLanguage: (lng) => {
      const next = ['en', 'vi', 'tr'].includes(lng) ? lng : 'en';
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
