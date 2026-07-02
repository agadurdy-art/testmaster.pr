import React from 'react';
import PremiumPronunciationDrawer from './PremiumPronunciationDrawer';
import { resolveAudioSrc } from './results/AudioPlayer';
import { splitTokensByTurns } from './results/Transcript';
import ConversationPanel from './results/ConversationPanel';
import TranscriptPanel from './results/TranscriptPanel';
import ScorecardAside from './results/ScorecardAside';
import MetaStrip from './results/MetaStrip';
import CoachCard from './results/CoachCard';
import ExaminerRubric from './results/ExaminerRubric';

/**
 * ResultsState — composition root for the D7 speaking results surface.
 *
 * Faz 2 split (2026-07-02): the 1,064-line monolith moved into
 * ./results/ single-responsibility components with byte-identical rendering:
 *   AudioPlayer (+resolveAudioSrc), Transcript (+ColoredTokens,
 *   splitTokensByTurns), FluencyStats, VocabularyProfileBar → composed by
 *   TranscriptPanel (LEFT); CriterionBar → ScorecardAside (RIGHT);
 *   ConversationPanel (Liz Live full exchange); MetaStrip (scored badge +
 *   share); CoachCard (Liz note + actions); ExaminerRubric (static rubric).
 * This file keeps ONLY the data derivation and layout. Its default export,
 * props contract and output are unchanged — consumers (MockExamFlow,
 * PublicSpeakingTrial, SpeakingPractice, Results.js, qb/cambridge surfaces)
 * need no edits.
 */
export default function ResultsState({ data, onRetryCard, onNewCard }) {
  // Guard against missing evaluation data. Pre-launch audit (2026-05-16)
  // flagged that the previous `data?.scores || FIXTURE_SCORES` fallback was
  // rendering hardcoded "Aunt Mai" demo scores (see ../constants.js) whenever
  // the speaking evaluator returned null — which looked like a real result
  // to the user. Render an error UI instead so the caller can retry.
  if (!data?.scores || !data?.fluency) {
    return (
      <section style={{ background: 'white', borderTop: '1px solid var(--sp-border)', borderBottom: '1px solid var(--sp-border)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '56px 32px 80px', textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>We couldn't load your results.</div>
          <div style={{ fontSize: 14, color: 'var(--sp-muted)', marginBottom: 24 }}>
            The evaluator didn't return scores for this attempt. Please try recording again.
          </div>
          {onRetryCard && (
            <button
              type="button"
              onClick={onRetryCard}
              style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid var(--sp-border)', background: 'white', cursor: 'pointer' }}
            >
              Try this card again
            </button>
          )}
        </div>
      </section>
    );
  }
  const SCORES = data.scores;
  const FLUENCY = data.fluency;
  // Empty array when transcript missing rather than the FIXTURE Vietnamese
  // demo tokens (constants.js:77) that previously leaked in as "real" data.
  const TRANSCRIPT_TOKENS = Array.isArray(data?.transcript_tokens) ? data.transcript_tokens : [];
  // Full back-and-forth from a Liz Live conversation (Part 1/3): [{role,message}].
  // Display-only — grading uses the user-only transcript.
  const CONVERSATION_TURNS = (Array.isArray(data?.conversation_turns) ? data.conversation_turns : [])
    .filter((t) => t && (t.message || '').trim());
  const lizNote = data?.liz_note;
  const audioSrc = resolveAudioSrc(data?.audio_url);
  // Word-level pronunciation only carries real signal when there's audio /
  // per-token pron data. For a Liz Live conversation graded from the transcript
  // (no audio), the "transcript" block is just the candidate's words again —
  // identical to what the conversation panel already shows — so suppress that
  // redundant text and let the conversation BE the transcript (keep the
  // delivery stats + vocabulary, which aren't shown anywhere else).
  const hasPron = TRANSCRIPT_TOKENS.some((t) => t && t.pron);
  // When there's a conversation, it BECOMES the transcript — the candidate's
  // answers are shown there (with word-level pronunciation colouring mapped
  // onto each turn), so the separate transcript block collapses to delivery
  // stats only. Without a conversation (Part 2 cue card), keep the classic
  // word-level transcript panel.
  const redundantTranscript = CONVERSATION_TURNS.length > 0;
  const USER_TURN_SLICES = (hasPron && CONVERSATION_TURNS.length > 0)
    ? splitTokensByTurns(
        TRANSCRIPT_TOKENS,
        CONVERSATION_TURNS.filter((t) => t.role === 'user').map((t) => t.message),
      )
    : [];
  // Premium QB submit returns Azure pronunciation detail + Liz's practice
  // plan. When present we surface them in a dedicated drawer and hide the
  // fixture-band rubric block (it shows hardcoded "Pronunciation 6.0" text
  // that's misleading next to the real numbers).
  const hasPremiumDetail = Boolean(
    data?.pronunciation_analysis?.azure_scores ||
      (Array.isArray(data?.word_level_results) && data.word_level_results.length > 0) ||
      (Array.isArray(data?.practice_focus) && data.practice_focus.length > 0) ||
      (Array.isArray(data?.try_this_next) && data.try_this_next.length > 0),
  );
  return (
    <section style={{ background: 'white', borderTop: '1px solid var(--sp-border)', borderBottom: '1px solid var(--sp-border)' }}>
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '56px 32px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <span
            className="sp-font-mono"
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 26, height: 26, borderRadius: 9999,
              border: '1.5px solid var(--sp-foreground)',
              fontWeight: 700, fontSize: 12,
            }}
          >
            4
          </span>
          <span className="sp-mono-label">State · Results · two‑panel</span>
        </div>

        <MetaStrip data={data} fluency={FLUENCY} scores={SCORES} />

        {CONVERSATION_TURNS.length > 0 && (
          <ConversationPanel turns={CONVERSATION_TURNS} userTurnSlices={USER_TURN_SLICES} />
        )}

        {/* Two-panel layout */}
        <div
          className="sp-results-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr)',
            gap: 32,
            alignItems: 'start',
          }}
        >
          <TranscriptPanel
            redundantTranscript={redundantTranscript}
            audioSrc={audioSrc}
            fluency={FLUENCY}
            transcriptTokens={TRANSCRIPT_TOKENS}
            vocabularyProfile={data?.vocabulary_profile}
          />

          <ScorecardAside scores={SCORES} />
        </div>

        <CoachCard lizNote={lizNote} onRetryCard={onRetryCard} onNewCard={onNewCard} />

        {hasPremiumDetail && (
          <PremiumPronunciationDrawer
            pronunciationAnalysis={data.pronunciation_analysis}
            wordLevelResults={data.word_level_results}
            practiceFocus={data.practice_focus}
            tryThisNext={data.try_this_next}
            strengths={data.strengths}
            weaknesses={data.weaknesses}
          />
        )}

        {/* Examiner's rubric — hidden when premium detail is present (the
            static copy inside is fixture-band leftover that conflicts with
            real numbers from the premium endpoint). */}
        {!hasPremiumDetail && <ExaminerRubric />}

        <style>{`
          @media (min-width: 1024px) {
            .speaking-scope .sp-results-grid { grid-template-columns: 1fr 440px !important; }
            .speaking-scope .sp-results-aside { position: sticky; top: 96px; }
          }
          .speaking-scope details > summary::-webkit-details-marker { display: none; }
        `}</style>
      </div>
    </section>
  );
}
