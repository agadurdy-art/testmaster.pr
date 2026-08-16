import React, { useState } from 'react';
import { FileText, Map, ChevronRight } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { shuffleArray } from '../../../../components/games/shared';
import { stripMeta } from '../lib/normalize';
import FormattedQuestion from './FormattedQuestion';
import SkipButton from './SkipButton';

// ═══════ MICRO READING ═══════
function MicroReading({ activity, onComplete, onSkip }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [locateSpan, setLocateSpan] = useState(null); // text of the locate-in-text hint
  const rawQuestions = activity?.comprehension_questions || activity?.questions || [];
  // Strip author meta-comments like "(Full 'there is/are' in Unit 3.)" before
  // rendering — those notes are for the curriculum writer, not the student.
  const questions = rawQuestions.map(q => q ? ({
    ...q,
    question: stripMeta(q.question),
    question_text: stripMeta(q.question_text),
    options: Array.isArray(q.options) ? q.options.map(stripMeta) : q.options,
  }) : q);
  const passageText = stripMeta(activity?.passage_text || activity?.passage || activity?.text || '');
  const sceneImage = activity?.scene_image_url || activity?.scene_image || activity?.image_url;
  const q = questions[currentQ];

  // Shuffle options once per question index — dep on currentQ ONLY. q.options
  // is recomputed each render (stripMeta map above creates a new array every
  // time), so depending on it triggers an infinite re-shuffle loop that
  // visually flashed the buttons (Aga's 2026-05-20 catch).
  const shuffledOptions = React.useMemo(() => {
    if (!q?.options?.length) return [];
    return shuffleArray([...q.options]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQ]);

  // Locate-in-text: when learner gets a question wrong, highlight the
  // sentence in the passage that proves the answer so they can re-read.
  // Strategy stack (first hit wins):
  //   1. explicit author hint (locate_text / evidence / passage_quote)
  //   2. sentence containing the correct answer string (works for MCQ
  //      "Lana is Russian." — answer="Russian" appears in passage)
  //   3. sentence containing the most distinctive content word from the
  //      question (works for T/F "Martha is from the USA. True or false?"
  //      — passage has no "true"/"false", but does mention "Martha")
  const STOP_WORDS = new Set(['a','an','the','is','are','am','was','were','be','been','being','do','does','did','have','has','had','to','of','in','on','at','for','from','by','with','and','or','but','not','no','this','that','these','those','my','your','his','her','its','our','their','i','you','he','she','it','we','they','what','where','when','who','how','why','which','true','false','or','old','years','really']);

  const findLocateSentence = (question) => {
    if (!question || !passageText) return null;
    const explicit = question.locate_text || question.evidence || question.passage_quote;
    if (explicit && typeof explicit === 'string') return explicit;
    const sentences = passageText.match(/[^.!?]+[.!?]+/g) || [passageText];
    const sentList = sentences.map(s => s.trim()).filter(Boolean);

    // Tokenize the answer and the question once
    const ans = String(question.correct_answer || question.answer || '').trim();
    const qText = String(question.question || question.question_text || '');
    const qTokens = qText.split(/\s+/).map(t => t.replace(/[.,!?;:'"()]/g, ''))
      .filter(t => t && !STOP_WORDS.has(t.toLowerCase()) && t.length >= 2);
    qTokens.sort((a, b) => {
      const aCap = /^[A-Z]/.test(a) ? 1 : 0;
      const bCap = /^[A-Z]/.test(b) ? 1 : 0;
      if (aCap !== bCap) return bCap - aCap;
      return b.length - a.length;
    });
    const ansTokens = ans.split(/\s+/).map(t => t.replace(/[.,!?;:'"()]/g, ''))
      .filter(t => t && !STOP_WORDS.has(t.toLowerCase()) && t.length >= 2);

    // Score each sentence: +2 per qToken hit, +3 per ansToken hit, +5 if
    // the sentence contains the full answer string verbatim. Pronouns in
    // the *next* sentence (he/she/it/they/this) inherit score from the
    // sentence right before them so two-sentence proofs surface together
    // (Aga 2026-05-21: 'gerekirse iki cumlyi ayni anda gostermesi lazim.
    // bu durumda — Our teacher is Mr Brown. He is kind. — cumlelerini
    // gostermesi gerekirdi.').
    const scores = sentList.map((s) => {
      const lower = s.toLowerCase();
      let pts = 0;
      if (ans && lower.includes(ans.toLowerCase())) pts += 5;
      for (const tok of ansTokens) {
        const re = new RegExp(`\\b${tok.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (re.test(s)) pts += 3;
      }
      for (const tok of qTokens) {
        const re = new RegExp(`\\b${tok.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (re.test(s)) pts += 2;
      }
      return pts;
    });

    let bestIdx = -1;
    let bestScore = 0;
    scores.forEach((p, i) => { if (p > bestScore) { bestScore = p; bestIdx = i; } });
    if (bestIdx < 0) return null;

    const primary = sentList[bestIdx];

    // Pronoun-followup heuristic: if the very next sentence starts with a
    // pronoun (He/She/It/They/This/These/That), the answer probably spans
    // both sentences. Return them joined.
    const next = sentList[bestIdx + 1];
    if (next && /^(he|she|it|they|this|that|these|those)\b/i.test(next)) {
      return `${primary} ${next}`;
    }
    // Prev sentence with pronoun + current sentence carrying the noun the
    // pronoun refers to: rarer but symmetrical.
    const prev = sentList[bestIdx - 1];
    if (prev && /^(he|she|it|they|this|that)\b/i.test(primary) && scores[bestIdx - 1] === 0) {
      return `${prev} ${primary}`;
    }
    return primary;
  };

  const highlightText = (text) => {
    let result = text;
    // Locate-in-text wins (yellow) — wraps the full sentence carrying the
    // answer when the learner got it wrong.
    if (locateSpan) {
      const escaped = locateSpan.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(`(${escaped})`, 'i');
      result = result.replace(re, '<mark class="bg-amber-200 px-1 rounded shadow-sm">$1</mark>');
    }
    // Vocab pre-highlights (lighter yellow, only when no locate-in-text active)
    const words = activity?.highlighted_words;
    if (!locateSpan && words?.length) {
      words.forEach(word => {
        const regex = new RegExp(`\\b(${word})\\b`, 'gi');
        result = result.replace(regex, `<mark class="bg-yellow-100 px-0.5 rounded">$1</mark>`);
      });
    }
    // Multi-voice passages separate each speaker with a blank line — keep
    // the paragraphs visible (innerHTML collapses raw newlines).
    return result.replace(/\n\n/g, '<br/><br/>').replace(/\n/g, '<br/>');
  };

  const checkAnswer = (answer, correctAnswer) => {
    // Handle both 'correct_answer' and 'answer' field names from different content formats
    const correctAns = correctAnswer || q?.answer;
    if (!correctAns) return false;
    const ans = String(answer).toLowerCase().trim();
    if (Array.isArray(correctAns)) return correctAns.some(a => String(a).toLowerCase().trim() === ans);
    return ans === String(correctAns).toLowerCase().trim();
  };

  const handleAnswer = (answer) => {
    if (showFeedback) return;
    setSelectedAnswer(answer);
    setShowFeedback(true);
    const correctAns = q.correct_answer || q.answer;
    if (checkAnswer(answer, correctAns)) {
      setCorrect(c => c + 1);
    } else {
      // Auto-locate on wrong answer — kid shouldn't have to press a button
      // to see where the proof is in the passage. Aga 2026-05-21.
      const sentence = findLocateSentence(q);
      if (sentence) setLocateSpan(sentence);
    }
  };

  const handleNext = () => {
    setSelectedAnswer(null); setShowFeedback(false); setLocateSpan(null);
    if (currentQ < questions.length - 1) { setCurrentQ(i => i + 1); }
    else onComplete(Math.round((correct / questions.length) * 100));
  };

  const handleLocateInText = () => {
    const sentence = findLocateSentence(q);
    if (sentence) {
      setLocateSpan(sentence);
      // Passage is always visible now; just scroll it back into view.
      setTimeout(() => {
        document.querySelector('[data-testid="micro-reading"] mark')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    }
  };

  const isCorrectOption = (option) => {
    const correctAns = q.correct_answer || q.answer;
    const opt = String(option).toLowerCase().trim();
    if (Array.isArray(correctAns)) return correctAns.some(a => String(a).toLowerCase().trim() === opt);
    return opt === String(correctAns || '').toLowerCase().trim();
  };

  return (
    <div data-testid="micro-reading">
      <div className="flex items-center justify-between mb-4">
        <Badge className="bg-emerald-100 text-emerald-700 border-0"><FileText className="w-3 h-3 mr-1" /> Reading</Badge>
        <div className="flex items-center gap-3">
          {questions.length > 0 && <span className="text-sm text-gray-500">Question {currentQ + 1}/{questions.length}</span>}
          <SkipButton onSkip={onSkip} />
        </div>
      </div>

      {/* Passage stays visible while the learner answers — Aga 2026-05-20:
          kids shouldn't have to bounce between two screens to find a word. */}
      <Card className="p-6 mb-6 bg-amber-50/50 border-amber-200">
        <h4 className="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3">Read the passage</h4>
        {sceneImage && (
          <img
            src={sceneImage}
            alt="Scene"
            className="block w-full max-h-64 object-cover rounded-xl mb-4 border border-amber-100"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        )}
        <p className="text-xl text-gray-800 leading-relaxed" dangerouslySetInnerHTML={{ __html: highlightText(passageText) }} />
      </Card>

      {/* Questions appear right under the passage so the kid can re-read
          while choosing an answer. */}
      {q ? (
        <Card className="p-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-5"><FormattedQuestion text={q.question || q.question_text} /></h3>
          <div className="space-y-3">
            {(shuffledOptions.length ? shuffledOptions : (q.options || [])).map(option => {
              const isSelected = selectedAnswer === option;
              const optionIsCorrect = isCorrectOption(option);
              let cls = 'border-gray-200 hover:border-blue-300';
              if (showFeedback) {
                if (optionIsCorrect) cls = 'border-green-500 bg-green-50';
                else if (isSelected) cls = 'border-red-500 bg-red-50';
                else cls = 'border-gray-200 opacity-50';
              }
              return (
                <button key={option} className={`w-full p-5 rounded-xl text-left border-2 transition-all text-lg font-medium ${cls}`}
                  onClick={() => handleAnswer(option)} disabled={showFeedback}>
                  <FormattedQuestion text={option} />
                </button>
              );
            })}
          </div>
          {showFeedback && (
            <div className="mt-5 flex items-center justify-between gap-3 flex-wrap">
              {!isCorrectOption(selectedAnswer) && locateSpan && (
                <p className="text-sm text-amber-700 flex items-center gap-1.5" data-testid="reading-locate-hint">
                  <Map className="w-3.5 h-3.5" /> Look at the highlighted line above.
                </p>
              )}
              <Button className="ml-auto" onClick={handleNext}>{currentQ < questions.length - 1 ? 'Next' : 'Continue'} <ChevronRight className="w-4 h-4 ml-1" /></Button>
            </div>
          )}
        </Card>
      ) : (
        questions.length === 0 && <Button className="mt-4" onClick={() => onComplete(100)}>Continue</Button>
      )}
    </div>
  );
}

export default MicroReading;
