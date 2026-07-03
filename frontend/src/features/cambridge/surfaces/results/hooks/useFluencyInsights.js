import { useState, useEffect } from 'react';

// ============ SPEAKING P2: Fluency Analysis (client-side) ============
// Extracted verbatim from pages/CambridgeTestResults.js (Faz2 refactor).
export function useFluencyInsights(speakingEvaluations) {
  const [fluencyInsights, setFluencyInsights] = useState(null);

  useEffect(() => {
    if (Object.keys(speakingEvaluations).length === 0) return;

    const FILLER_WORDS = ['um', 'uh', 'er', 'ah', 'like', 'you know', 'i mean', 'sort of', 'kind of', 'basically', 'actually', 'literally', 'right', 'so yeah'];

    let totalFillers = 0;
    let totalWords = 0;
    let totalSelfCorrections = 0;
    const fillerDetails = {};
    let hasTranscript = false;

    Object.values(speakingEvaluations).forEach(ev => {
      const transcript = ev?.transcript || '';
      if (!transcript || transcript === '[Could not transcribe audio]') return;
      hasTranscript = true;

      const words = transcript.toLowerCase().split(/\s+/).filter(Boolean);
      totalWords += words.length;

      // Count fillers
      const textLower = transcript.toLowerCase();
      FILLER_WORDS.forEach(filler => {
        const regex = new RegExp(`\\b${filler}\\b`, 'gi');
        const matches = textLower.match(regex);
        if (matches) {
          totalFillers += matches.length;
          fillerDetails[filler] = (fillerDetails[filler] || 0) + matches.length;
        }
      });

      // Self-corrections (patterns like "I went... I mean I go")
      const corrections = (transcript.match(/\.\.\.|—|I mean,|no,? wait|sorry,?/gi) || []).length;
      totalSelfCorrections += corrections;
    });

    if (!hasTranscript) {
      setFluencyInsights({ available: false, reason: 'No transcript available. Record speaking responses to get fluency analytics.' });
      return;
    }

    // Estimate speaking time (~130 words per minute for IELTS)
    const estimatedMinutes = totalWords / 130;
    const fillerPerMinute = estimatedMinutes > 0 ? (totalFillers / estimatedMinutes) : 0;

    // Confidence: high for fillers (text-based), low for pauses (no timestamps)
    setFluencyInsights({
      available: true,
      filler_count: totalFillers,
      filler_per_minute: Math.round(fillerPerMinute * 10) / 10,
      filler_details: fillerDetails,
      total_words: totalWords,
      self_correction_count: totalSelfCorrections,
      pause_data: { available: false, reason: 'Requires audio timestamps (available in Premium tier)' },
      confidence: { fillers: 'high', pauses: 'low' }
    });
  }, [speakingEvaluations]);

  return fluencyInsights;
}
