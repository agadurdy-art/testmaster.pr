import { toast } from 'sonner';
import { API_URL } from './constants';

// Evaluation pipeline for the comprehensive placement test, extracted
// verbatim from evaluateTest / blobToBase64 in
// pages/ComprehensiveLevelTest.js. Component state reads/writes became
// explicit parameters (the orchestrator passes its state + setters in);
// bodies are otherwise unchanged.

export const blobToBase64 = (blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('Failed to convert audio to base64'));
        return;
      }
      const [, base64Data = ''] = result.split(',');
      resolve(base64Data);
    };
    reader.onerror = () => reject(reader.error || new Error('Failed to read blob'));
    reader.readAsDataURL(blob);
  });

export async function runEvaluation({
  testMode,
  language,
  readingAnswers,
  listeningAnswers,
  writingTasks,
  writingResponses,
  speakingResponses,
  readingQuestions,
  setReadingQuestions,
  setResults,
  setStage,
  setEvaluating,
}) {
    // CRITICAL: stay on the 'evaluating' screen until results are computed.
    // Flipping to 'results' first meant the user saw a blank page whenever
    // the backend evaluations hadn't finished — the results screen guards
    // on `if (stage === 'results' && results)` and bails when results is
    // still null. Aga 2026-05-23: "user full test aldi ve blank page ile
    // karsilasti. sonuc: terk etti gitti".
    try {
      setStage('evaluating');
      setEvaluating(true);
      
      let readingBand = null;
      let readingCorrect = 0;
      let skillBreakdown = {};
      let listeningBand = null;
      let listeningResults = null;
      let writingBand = null;
      let writingResults = null;
      let speakingEval = null;
      
      // Evaluate Reading if applicable
      if (testMode === 'full' || testMode === 'reading') {
        try {
          const readingResponse = await fetch(`${API_URL}/api/comprehensive-level-test/evaluate-reading`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ answers: readingAnswers })
          });
          if (readingResponse.ok) {
            const readingResult = await readingResponse.json();
            readingCorrect = readingResult.correct_count;
            readingBand = readingResult.band;
            skillBreakdown = readingResult.skill_breakdown || {};
            // Enrich readingQuestions with server results for display
            setReadingQuestions(readingResult.questions || []);
          }
        } catch (e) {
          console.error('Reading evaluation error:', e);
          readingBand = 4.0;
        }
      }

      // Evaluate Listening if applicable
      if (testMode === 'full' || testMode === 'listening') {
        try {
          const listeningResponse = await fetch(`${API_URL}/api/level-test/evaluate-listening`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ answers: listeningAnswers, language })
          });
          if (listeningResponse.ok) {
            listeningResults = await listeningResponse.json();
            listeningBand = listeningResults.band_score;
          }
        } catch (e) {
          console.error('Listening evaluation error:', e);
          listeningBand = 4.0;
        }
      }
      
      // Evaluate Writing if applicable
      if (testMode === 'full' || testMode === 'writing') {
        try {
          // Only send writing tasks if we have responses
          const writingTasksToEvaluate = writingTasks.length > 0 ? 
            writingTasks.map(task => ({
              task_id: task.id,
              response_text: writingResponses[task.id] || ''
            })) : [];
          
          if (writingTasksToEvaluate.length > 0) {
            const writingResponse = await fetch(`${API_URL}/api/level-test/evaluate-writing`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                responses: writingTasksToEvaluate,
                language
              })
            });
            if (writingResponse.ok) {
              writingResults = await writingResponse.json();
              writingBand = writingResults.overall_band;
            }
          }
        } catch (e) {
          console.error('Writing evaluation error:', e);
          writingBand = 4.0;
        }
      }

      // Evaluate Speaking if applicable
      if (testMode === 'full' || testMode === 'speaking') {
        // Only evaluate if we have speaking responses
        if (speakingResponses.length > 0) {
          try {
            const speakingPayload = await Promise.all(
              speakingResponses.map(async (responseItem) => ({
                level: responseItem.level,
                prompt: responseItem.prompt,
                transcript: responseItem.transcript,
                audio_data: responseItem.audio instanceof Blob ? await blobToBase64(responseItem.audio) : null
              }))
            );
            const speakingEvaluationResponse = await fetch(`${API_URL}/api/level-test/evaluate-speaking`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                responses: speakingPayload,
                language: language
              })
            });
            if (speakingEvaluationResponse.ok) {
              speakingEval = await speakingEvaluationResponse.json();
            }
          } catch (e) {
            console.error('Speaking evaluation error:', e);
          }
        }
      }
      
      // Calculate overall band only for full test
      let overallBand = null;
      if (testMode === 'full') {
        const validBands = [readingBand, listeningBand, writingBand, speakingEval?.overall_band].filter(b => b !== null);
        overallBand = validBands.length > 0 ? validBands.reduce((a, b) => a + b, 0) / validBands.length : 4.0;
      }

      // Get course recommendations for full test
      let recommendations = null;
      if (testMode === 'full' && overallBand) {
        try {
          const recommendationsResponse = await fetch(`${API_URL}/api/level-test/recommend-courses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              overall_band: overallBand,
              reading_band: readingBand,
              listening_band: listeningBand,
              writing_band: writingBand,
              speaking_band: speakingEval?.overall_band,
              weaknesses: speakingEval?.weaknesses || [],
              skill_breakdown: skillBreakdown,
              language: language
            })
          });
          if (recommendationsResponse.ok) {
            recommendations = await recommendationsResponse.json();
          }
        } catch (e) {
          console.error('Recommendations error:', e);
        }
      }

      // Update with results based on test mode
      setResults({
        test_mode: testMode,
        overall_band: overallBand,
        reading: readingBand !== null ? {
          band: readingBand,
          correct: readingCorrect,
          total: readingQuestions.length,
          skill_breakdown: skillBreakdown
        } : null,
        listening: listeningResults,
        writing: writingResults,
        speaking: speakingEval,
        recommendations: recommendations
      });
      setStage('results');

    } catch (error) {
      console.error('Evaluation error:', error);
      // Still show results even if there's an error - use what we have
      setResults({
        test_mode: testMode,
        overall_band: null,
        reading: testMode === 'reading' || testMode === 'full' ? {
          band: 4.0,
          correct: 0,
          total: readingQuestions.length,
          skill_breakdown: {}
        } : null,
        listening: testMode === 'listening' || testMode === 'full' ? {
          band_score: 4.0,
          correct: 0,
          total: 10,
          percentage: 0,
          question_results: [],
          skill_breakdown: [],
          overall_feedback: 'Unable to evaluate. Please try again.'
        } : null,
        writing: null,
        speaking: null,
        recommendations: null
      });
      setStage('results');
      toast.error('Some evaluations failed. Showing available results.');
    } finally {
      setEvaluating(false);
    }
}
