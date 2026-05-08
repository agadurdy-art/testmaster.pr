import React, { useEffect } from 'react';
import useOnboardingState from '../hooks/useOnboardingState';
import TopBar from './TopBar';
import NavRow from './NavRow';
import StickyActions from './StickyActions';
import Step1Path from './Step1Path';
import Step2TargetDate from './Step2TargetDate';
import Step3CurrentLevel from './Step3CurrentLevel';
import Step4Language from './Step4Language';
import Step5LizIntro from './Step5LizIntro';

export default function OnboardingQuiz({ onFinish }) {
  const { state, update, next, back, skip, canContinue } = useOnboardingState();

  // Keyboard shortcuts: Enter → continue, Esc → back
  useEffect(() => {
    const onKey = (e) => {
      const target = e.target;
      if (target.matches && target.matches('input, textarea, select')) return;
      if (e.key === 'Enter' && canContinue) {
        e.preventDefault();
        handleContinue();
      } else if (e.key === 'Escape' && state.step > 1) {
        e.preventDefault();
        back();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canContinue, state.step]);

  const handleContinue = () => {
    if (state.step === 5) {
      if (onFinish) onFinish(state);
      return;
    }
    next();
  };

  const { step, direction } = state;

  return (
    <>
      <TopBar step={step} />
      <NavRow step={step} onBack={back} onSkip={skip} />

      <main>
        {step === 1 && (
          <Step1Path
            direction={direction}
            path={state.path}
            onSelect={(path) => update({ path })}
          />
        )}
        {step === 2 && (
          <Step2TargetDate
            direction={direction}
            targetBand={state.targetBand}
            examDate={state.examDate}
            onTargetChange={(targetBand) => update({ targetBand })}
            onDateChange={(examDate) => update({ examDate })}
          />
        )}
        {step === 3 && (
          <Step3CurrentLevel
            direction={direction}
            currentBand={state.currentBand}
            onChange={(currentBand) => update({ currentBand })}
            weakSkills={state.weakSkills}
            onWeakSkillsChange={(weakSkills) => update({ weakSkills })}
          />
        )}
        {step === 4 && (
          <Step4Language
            direction={direction}
            language={state.language}
            onSelect={(language) => update({ language })}
            nativeLanguage={state.nativeLanguage}
            onSelectNative={(nativeLanguage) => update({ nativeLanguage })}
          />
        )}
        {step === 5 && (
          <Step5LizIntro
            direction={direction}
            state={state}
            onMotivationChange={(motivation) => update({ motivation })}
          />
        )}
      </main>

      <StickyActions
        step={step}
        canContinue={canContinue}
        onContinue={handleContinue}
      />
    </>
  );
}
