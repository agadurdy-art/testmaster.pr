import { useRef } from 'react';
import { toast } from 'sonner';
import {
  speakingAudioUrlTest1,
  speakingAudioUrlTest2,
  speakingAudioTest1PerQuestion,
  speakingAudioTest2PerQuestion,
  speakingQuestionTimingsTest1,
  speakingQuestionTimingsTest2,
} from '../lib/audio';

export default function useSpeakingQuestionAudio(test) {
  const speakingQuestionAudioRef = useRef(null);
  const speakingQuestionTimeoutRef = useRef(null);

  const playSpeakingQuestionAudio = (questionIndex, questionText) => {
    const qNumber = questionIndex + 1;
    const isTest2 = test?.title && test.title.includes('Test 2');

    // Prefer dedicated per-question audio when available
    if (speakingQuestionAudioRef.current) {
      const directSrc = isTest2
        ? speakingAudioTest2PerQuestion[qNumber]
        : speakingAudioTest1PerQuestion[qNumber];
      if (directSrc) {
        try {
          const audio = speakingQuestionAudioRef.current;
          audio.src = directSrc;
          if (speakingQuestionTimeoutRef.current) {
            clearTimeout(speakingQuestionTimeoutRef.current);
          }
          audio.currentTime = 0;
          audio.play();
          return;
        } catch (err) {
          console.error('Speaking question audio error (per-question):', err);
        }
      }
    }

    const timing = isTest2 ? speakingQuestionTimingsTest2[qNumber] : speakingQuestionTimingsTest1[qNumber];

    // If we have a timing, use pre-recorded audio for a natural British voice
    if (timing && speakingQuestionAudioRef.current) {
      try {
        const audio = speakingQuestionAudioRef.current;
        // Use the appropriate audio file based on selected speaking test
        audio.src = isTest2 ? speakingAudioUrlTest2 : speakingAudioUrlTest1;
        if (speakingQuestionTimeoutRef.current) {
          clearTimeout(speakingQuestionTimeoutRef.current);
        }
        audio.currentTime = timing.start;
        audio.play();
        const duration = (timing.end - timing.start) * 1000;
        speakingQuestionTimeoutRef.current = setTimeout(() => {
          audio.pause();
        }, duration);
        return;
      } catch (err) {
        console.error('Speaking question audio error:', err);
        toast.error('Could not play question audio');
      }
    }

    // Fallback: use browser text-to-speech for questions without pre-recorded audio
    try {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        toast.error('Question audio is not supported in this browser.');
        return;
      }
      if (!questionText) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(questionText);
      utterance.lang = 'en-GB';
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Speaking question TTS error:', err);
      toast.error('Could not play question audio');
    }
  };

  return { speakingQuestionAudioRef, playSpeakingQuestionAudio };
}
