import React from 'react';
import { Button } from '../../../components/ui/button';
import { toast } from 'sonner';

export default function TestSelectors({
  testType,
  availableTests,
  test,
  user,
  t,
  setTest,
  setTimeLeft,
  setAnswers,
  setCurrentQuestion,
}) {
  return (
    <>
      {/* NOTE: Payments not live yet – mark extra tests as coming soon but do not block.
          Once SePay/MoMo is integrated, Test 2+ can be hard-gated based on user subscription/credits.
       */}
      {/* Listening test selector when multiple tests are available */}
      {testType === 'listening' && availableTests && availableTests.length > 1 && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <div className="mb-2 text-xs font-medium text-gray-700 uppercase tracking-wide">
            Select Listening Test
          </div>
          <div className="mb-4 flex items-center space-x-2 text-sm overflow-x-auto pb-1">
            {availableTests.map((testOption) => {
              const isPremium = testOption.title && /Test\s*(\d+)/i.test(testOption.title) &&
                parseInt(testOption.title.match(/Test\s*(\d+)/i)[1], 10) >= 2;
              const premiumLocked = isPremium && !(user?.plan === 'pro' || (user?.examCredits ?? 0) > 0);
              return (
                <Button
                  key={testOption.id}
                  variant={testOption.id === test?.id ? 'default' : 'outline'}
                  size="sm"
                  disabled={premiumLocked}
                  onClick={() => {
                    if (premiumLocked) {
                      toast.error(t('paywallNeedProOrCredits'));
                      return;
                    }
                    setTest(testOption);
                    setTimeLeft(testOption.duration * 60);
                    const initial = {};
                    (testOption.questions || []).forEach((q) => {
                      initial[q.id] = '';
                    });
                    setAnswers(initial);
                  }}
                >
                  {testOption.title || 'Listening Test'}{premiumLocked ? ' 🔒' : ''}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Reading test selector when multiple tests are available */}
      {testType === 'reading' && availableTests && availableTests.length > 1 && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <div className="mb-2 text-xs font-medium text-gray-700 uppercase tracking-wide">
            Select Reading Test
          </div>
          <div className="mb-4 flex items-center space-x-2 text-sm overflow-x-auto pb-1">
            {availableTests.map((testOption) => {
              const isPremium = testOption.title && /Test\s*(\d+)/i.test(testOption.title) &&
                parseInt(testOption.title.match(/Test\s*(\d+)/i)[1], 10) >= 2;
              const premiumLocked = isPremium && !(user?.plan === 'pro' || (user?.examCredits ?? 0) > 0);
              return (
                <Button
                  key={testOption.id}
                  variant={testOption.id === test?.id ? 'default' : 'outline'}
                  size="sm"
                  disabled={premiumLocked}
                  onClick={() => {
                    if (premiumLocked) {
                      toast.error(t('paywallNeedProOrCredits'));
                      return;
                    }
                    setTest(testOption);
                    setTimeLeft(testOption.duration * 60);
                    const initial = {};
                    (testOption.questions || []).forEach((q) => {
                      initial[q.id] = '';
                    });
                    setAnswers(initial);
                    setCurrentQuestion(0);
                  }}
                >
                  {testOption.title || 'Reading Test'}{premiumLocked ? ' 🔒' : ''}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Speaking test selector when multiple tests are available */}
      {testType === 'speaking' && availableTests && availableTests.length > 1 && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <div className="mb-2 text-xs font-medium text-gray-700 uppercase tracking-wide">
            Select Speaking Test
          </div>
          <div className="mb-4 flex items-center space-x-2 text-sm overflow-x-auto pb-1">
            {availableTests.map((testOption) => {
              const isPremium = testOption.title && /Test\s*(\d+)/i.test(testOption.title) &&
                parseInt(testOption.title.match(/Test\s*(\d+)/i)[1], 10) >= 2;
              const premiumLocked = isPremium && !(user?.plan === 'pro' || (user?.examCredits ?? 0) > 0);
              return (
                <Button
                  key={testOption.id}
                  variant={testOption.id === test?.id ? 'default' : 'outline'}
                  size="sm"
                  disabled={premiumLocked}
                  onClick={() => {
                    if (premiumLocked) {
                      toast.error(t('paywallNeedProOrCredits'));
                      return;
                    }
                    setTest(testOption);
                    setTimeLeft(testOption.duration * 60);
                    const initial = {};
                    const allQuestions = testOption.parts?.flatMap(part => part.questions || []) || [];
                    const meta = testOption.questions || [];
                    allQuestions.forEach((_, idx) => {
                      const metaId = meta[idx]?.id ?? idx + 1;
                      initial[metaId] = '';
                    });
                    setAnswers(initial);
                    setCurrentQuestion(0);
                  }}
                >
                  {testOption.title || 'Speaking Test'}{premiumLocked ? ' 🔒' : ''}
                </Button>
              );
            })}
          </div>
        </div>
      )}
      {/* Writing test selector when multiple tests are available */}
      {testType === 'writing' && availableTests && availableTests.length > 1 && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <div className="mb-2 text-xs font-medium text-gray-700 uppercase tracking-wide">
            Select Writing Test
          </div>
          <div className="mb-4 flex items-center space-x-2 text-sm overflow-x-auto pb-1">
            {availableTests.map((testOption) => {
              const isPremium = testOption.title && /Test\s*(\d+)/i.test(testOption.title) &&
                parseInt(testOption.title.match(/Test\s*(\d+)/i)[1], 10) >= 2;
              const premiumLocked = isPremium && !(user?.plan === 'pro' || (user?.examCredits ?? 0) > 0);
              return (
                <Button
                  key={testOption.id}
                  variant={testOption.id === test?.id ? 'default' : 'outline'}
                  size="sm"
                  disabled={premiumLocked}
                  onClick={() => {
                    if (premiumLocked) {
                      toast.error(t('paywallNeedProOrCredits'));
                      return;
                    }
                    setTest(testOption);
                    setTimeLeft(testOption.duration * 60);
                    const initial = {};
                    (testOption.questions || []).forEach((q) => {
                      initial[q.id] = '';
                    });
                    setAnswers(initial);
                    setCurrentQuestion(0);
                  }}
                >
                  {testOption.title || 'Writing Test'}{premiumLocked ? ' 🔒' : ''}
                </Button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
