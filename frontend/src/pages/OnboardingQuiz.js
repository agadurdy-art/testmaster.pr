import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LIZ_AVATAR = 'https://api.dicebear.com/7.x/personas/svg?seed=Liz&backgroundColor=b6e3f4';

const IELTS_STEPS = [
  {
    id: 'current_band',
    lizSays: "Let me understand where you are right now.",
    question: "What's your current IELTS level?",
    options: [
      { value: '4-5', label: 'Band 4.0 – 5.0', sub: 'Basic to Limited' },
      { value: '5-6', label: 'Band 5.0 – 6.0', sub: 'Limited to Competent' },
      { value: '6-7', label: 'Band 6.0 – 7.0', sub: 'Competent to Good' },
      { value: 'unknown', label: "I don't know yet", sub: "We'll find out together" },
    ],
  },
  {
    id: 'target_band',
    lizSays: "What band score do you need?",
    question: "What's your target?",
    options: [
      { value: '6.0', label: 'Band 6.0' },
      { value: '6.5', label: 'Band 6.5' },
      { value: '7.0', label: 'Band 7.0' },
      { value: '7.5+', label: 'Band 7.5 or higher' },
    ],
  },
  {
    id: 'exam_date',
    lizSays: "This helps me plan your study schedule.",
    question: "When is your exam?",
    options: [
      { value: '1month', label: 'Within 1 month' },
      { value: '2-3months', label: '2 – 3 months' },
      { value: '3-6months', label: '3 – 6 months' },
      { value: 'undecided', label: 'Not decided yet' },
    ],
  },
  {
    id: 'weakest_skill',
    lizSays: "I'll focus extra attention here.",
    question: "Which skill do you struggle with most?",
    options: [
      { value: 'writing', label: 'Writing' },
      { value: 'speaking', label: 'Speaking' },
      { value: 'reading', label: 'Reading' },
      { value: 'listening', label: 'Listening' },
    ],
  },
];

const GENERAL_STEPS = [
  {
    id: 'english_level',
    lizSays: "Let me understand your current level.",
    question: "What's your English level?",
    options: [
      { value: 'beginner', label: 'Beginner', sub: 'Just starting out' },
      { value: 'elementary', label: 'Elementary', sub: 'Basic conversations' },
      { value: 'intermediate', label: 'Intermediate', sub: 'Comfortable in most situations' },
      { value: 'upper-intermediate', label: 'Upper-Intermediate', sub: 'Nearly fluent' },
    ],
  },
  {
    id: 'english_goal',
    lizSays: "This helps me tailor your learning path.",
    question: "What's your main goal?",
    options: [
      { value: 'daily', label: 'Daily conversations' },
      { value: 'business', label: 'Business English' },
      { value: 'exam', label: 'Exam preparation' },
      { value: 'general', label: 'General improvement' },
    ],
  },
];

function recommendPlan(answers) {
  const { current_band, target_band, exam_date, weakest_skill, learning_mode } = answers;
  if (learning_mode === 'general') return 'explorer';
  if (exam_date === '1month' && ['7.0', '7.5+'].includes(target_band)) return 'achiever';
  if (weakest_skill === 'speaking') return 'learner';
  if (current_band === '4-5' && ['7.0', '7.5+'].includes(target_band)) return 'achiever';
  if (['7.0', '7.5+'].includes(target_band)) return 'learner';
  if (['6.5'].includes(target_band)) return 'learner';
  return 'explorer';
}

const PLAN_INFO = {
  explorer: { name: 'Explorer', price: '$4.99/mo', highlight: false },
  learner: { name: 'Learner', price: '$9.99/mo', highlight: false },
  achiever: { name: 'Achiever', price: '$19.99/mo', highlight: true },
  master: { name: 'Master', price: '$29.99/mo', highlight: false },
};

export default function OnboardingQuiz({ user, onComplete }) {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('mode'); // 'mode' | 'questions' | 'result'
  const [learningMode, setLearningMode] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [saving, setSaving] = useState(false);

  const steps = learningMode === 'ielts' ? IELTS_STEPS : GENERAL_STEPS;
  const currentStep = steps[stepIndex];
  const progress = Math.round(((stepIndex) / steps.length) * 100);

  function handleModeSelect(mode) {
    setLearningMode(mode);
    setAnswers({ learning_mode: mode });
    setPhase('questions');
    setStepIndex(0);
  }

  function handleOptionSelect(value) {
    const newAnswers = { ...answers, [currentStep.id]: value };
    setAnswers(newAnswers);
    if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      setPhase('result');
    }
  }

  async function handleSave(planOverride) {
    setSaving(true);
    const recommended = planOverride || recommendPlan(answers);
    try {
      if (user?.id) {
        await axios.post('/api/onboarding/quiz', {
          user_id: user.id,
          learning_mode: answers.learning_mode,
          current_band: answers.current_band,
          target_band: answers.target_band,
          exam_date: answers.exam_date,
          weakest_skill: answers.weakest_skill,
          english_level: answers.english_level,
          english_goal: answers.english_goal,
          recommended_plan: recommended,
        });
      } else {
        localStorage.setItem('onboarding_quiz', JSON.stringify({ ...answers, recommended_plan: recommended }));
      }
      if (onComplete) onComplete();
      else navigate('/dashboard');
    } catch {
      navigate('/dashboard');
    }
  }

  function handleStartFree() {
    if (!user) {
      localStorage.setItem('onboarding_quiz', JSON.stringify(answers));
      navigate('/?signup=true');
    } else {
      handleSave();
    }
  }

  function handleUpgrade() {
    const plan = recommendPlan(answers);
    if (!user) {
      localStorage.setItem('onboarding_quiz', JSON.stringify(answers));
      navigate(`/?signup=true`);
    } else {
      handleSave(plan);
      navigate(`/pricing?recommended=${plan}`);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-white flex flex-col items-center justify-center px-4 py-10">

      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white font-bold text-lg">A</div>
        <span className="text-xl font-bold text-gray-900">IELTS Ace</span>
      </div>

      <div className="w-full max-w-md">

        {/* MODE SELECTION */}
        {phase === 'mode' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-violet-100 mx-auto mb-4 overflow-hidden">
              <img src="/liz-avatar.png" alt="Liz" className="w-full h-full object-cover"
                onError={e => { e.target.style.display = 'none'; }} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Hi! I'm Liz 👋</h2>
            <p className="text-gray-500 mb-8">Your personal AI English teacher. What brings you here?</p>
            <div className="flex flex-col gap-4">
              <button
                onClick={() => handleModeSelect('ielts')}
                className="w-full py-4 px-6 rounded-xl border-2 border-violet-600 bg-violet-600 text-white font-semibold text-left hover:bg-violet-700 transition"
              >
                <div className="text-lg">🎯 IELTS Exam Preparation</div>
                <div className="text-sm opacity-80 mt-1">I need to reach a specific band score</div>
              </button>
              <button
                onClick={() => handleModeSelect('general')}
                className="w-full py-4 px-6 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold text-left hover:border-violet-300 hover:bg-violet-50 transition"
              >
                <div className="text-lg">📚 Learn General English</div>
                <div className="text-sm text-gray-500 mt-1">I want to improve my English from any level</div>
              </button>
            </div>
          </div>
        )}

        {/* QUESTIONS */}
        {phase === 'questions' && currentStep && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Step {stepIndex + 1} of {steps.length}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-violet-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Liz says */}
            <div className="flex items-start gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-violet-100 flex-shrink-0 overflow-hidden">
                <img src="/liz-avatar.png" alt="Liz" className="w-full h-full object-cover"
                  onError={e => { e.target.style.display = 'none'; }} />
              </div>
              <div className="bg-violet-50 rounded-xl rounded-tl-none px-4 py-3 text-sm text-violet-800">
                {currentStep.lizSays}
              </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-4">{currentStep.question}</h3>

            <div className="flex flex-col gap-3">
              {currentStep.options.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleOptionSelect(opt.value)}
                  className="w-full py-3 px-5 rounded-xl border-2 border-gray-200 text-left hover:border-violet-500 hover:bg-violet-50 transition group"
                >
                  <div className="font-semibold text-gray-800 group-hover:text-violet-700">{opt.label}</div>
                  {opt.sub && <div className="text-sm text-gray-400 mt-0.5">{opt.sub}</div>}
                </button>
              ))}
            </div>

            {stepIndex > 0 && (
              <button
                onClick={() => setStepIndex(stepIndex - 1)}
                className="mt-4 text-sm text-gray-400 hover:text-gray-600"
              >
                ← Back
              </button>
            )}
          </div>
        )}

        {/* RESULT */}
        {phase === 'result' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-4xl mb-3">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your plan is ready!</h2>
            <p className="text-gray-500 mb-6">
              {answers.learning_mode === 'ielts'
                ? `Based on your goals, here's what Liz recommends for reaching Band ${answers.target_band || '7.0'}.`
                : "Liz has prepared a personalized English learning path for you."}
            </p>

            {/* Recommended plan highlight */}
            {(() => {
              const recommended = recommendPlan(answers);
              const plan = PLAN_INFO[recommended];
              return (
                <div className="bg-violet-50 border-2 border-violet-500 rounded-xl p-4 mb-6 text-left">
                  <div className="text-xs font-semibold text-violet-500 uppercase tracking-wider mb-1">Recommended for you</div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-bold text-gray-900">{plan.name} Plan</div>
                      <div className="text-sm text-gray-500">{plan.price}</div>
                    </div>
                    <div className="text-2xl">⭐</div>
                  </div>
                </div>
              );
            })()}

            <div className="flex flex-col gap-3">
              <button
                onClick={handleStartFree}
                disabled={saving}
                className="w-full py-3 px-6 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 transition disabled:opacity-50"
              >
                {saving ? 'Setting up...' : 'Start Free — No credit card'}
              </button>
              <button
                onClick={handleUpgrade}
                disabled={saving}
                className="w-full py-3 px-6 rounded-xl border-2 border-violet-200 text-violet-700 font-semibold hover:bg-violet-50 transition disabled:opacity-50"
              >
                Unlock Full Plan →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
