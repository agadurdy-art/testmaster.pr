import { useState } from 'react';
import { API_URL } from '../constants';

// Speaking P2 fetchers — personalized drills + Band 7/8 model answers.
// Extracted verbatim from pages/CambridgeTestResults.js (Faz2 refactor).
export function useSpeakingExtras({ speakingEvaluations, bookId, testId }) {
  const [speakingDrills, setSpeakingDrills] = useState([]);
  const [modelAnswers, setModelAnswers] = useState({});
  const [loadingDrills, setLoadingDrills] = useState(false);
  const [loadingModels, setLoadingModels] = useState({});

  // Fetch speaking drills
  const fetchDrills = async () => {
    if (speakingDrills.length > 0) return;
    setLoadingDrills(true);
    try {
      const evals = Object.values(speakingEvaluations);
      if (evals.length === 0) return;

      const avgCriteria = {};
      let count = 0;
      evals.forEach(ev => {
        if (ev?.criteria) {
          count++;
          Object.entries(ev.criteria).forEach(([k, v]) => {
            avgCriteria[k] = (avgCriteria[k] || 0) + (v || 5);
          });
        }
      });
      if (count > 0) Object.keys(avgCriteria).forEach(k => avgCriteria[k] = Math.round(avgCriteria[k] / count));

      const weaknesses = evals.flatMap(ev => ev?.weaknesses || []).slice(0, 5);
      const transcript = evals.map(ev => ev?.transcript || '').join(' ').slice(0, 400);

      const res = await fetch(`${API_URL}/api/cambridge/speaking/generate-drills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ criteria: avgCriteria, weaknesses, transcript })
      });
      const data = await res.json();
      if (data.success) setSpeakingDrills(data.drills || []);
    } catch (e) {
      console.error('Drill fetch error:', e);
    } finally {
      setLoadingDrills(false);
    }
  };

  // Fetch model answers for a specific question
  const fetchModelAnswer = async (questionIdx, question, part) => {
    if (modelAnswers[questionIdx]) return;
    setLoadingModels(prev => ({ ...prev, [questionIdx]: true }));
    try {
      const res = await fetch(`${API_URL}/api/cambridge/speaking/model-answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, part, book_id: bookId, test_id: testId })
      });
      const data = await res.json();
      if (data.success || data.band7 || data.band8) {
        setModelAnswers(prev => ({ ...prev, [questionIdx]: data }));
      }
    } catch (e) {
      console.error('Model answer error:', e);
    } finally {
      setLoadingModels(prev => ({ ...prev, [questionIdx]: false }));
    }
  };

  return { speakingDrills, loadingDrills, fetchDrills, modelAnswers, loadingModels, fetchModelAnswer };
}
