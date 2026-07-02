import React from 'react';
import AudioPlayer from './AudioPlayer';
import Transcript from './Transcript';
import FluencyStats from './FluencyStats';
import VocabularyProfileBar from './VocabularyProfileBar';

/* LEFT panel: word-level pronunciation transcript (with audio player and
   legend) — or, when the conversation panel already carries the answers
   (redundantTranscript), just the delivery stats. Always followed by the
   fluency stats and CEFR vocabulary profile. */
export default function TranscriptPanel({
  redundantTranscript,
  audioSrc,
  fluency,
  transcriptTokens,
  vocabularyProfile,
}) {
  const FLUENCY = fluency;
  const TRANSCRIPT_TOKENS = transcriptTokens;
  return (
    <div
      style={{
        background: 'var(--sp-card)',
        borderRadius: 'var(--sp-radius)',
        border: '1px solid var(--sp-border)',
        boxShadow: 'var(--sp-shadow-card)',
        padding: 32,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="sp-mono-label">{redundantTranscript ? 'Delivery' : 'Your transcript'}</div>
          <h3 className="sp-font-display" style={{ fontSize: 22, fontWeight: 600, marginTop: 2 }}>
            {redundantTranscript ? 'Your speaking, measured' : 'Word‑level pronunciation'}
          </h3>
        </div>
        {!redundantTranscript && <AudioPlayer src={audioSrc} fallbackDurationLabel={FLUENCY.duration} />}
      </div>

      {redundantTranscript ? (
        <p style={{ fontSize: 13, color: 'var(--sp-muted-fg)', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--sp-border)' }}>
          Your full answers are shown in the conversation above. Here's how your delivery measured up.
        </p>
      ) : (
        <>
          {/* Legend */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 16,
              fontSize: 12,
              color: 'var(--sp-muted-fg)',
              marginBottom: 20,
              paddingBottom: 16,
              borderBottom: '1px solid var(--sp-border)',
            }}
          >
            <span className="sp-mono-label">Pronunciation</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span style={{ display: 'inline-block', width: 24, height: 3, borderRadius: 2, background: 'var(--sp-primary)' }} />
              Clear
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span style={{ display: 'inline-block', width: 24, height: 3, borderRadius: 2, background: 'var(--sp-warn)' }} />
              Minor issue
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  display: 'inline-block',
                  width: 24,
                  height: 3,
                  borderRadius: 2,
                  background: 'repeating-linear-gradient(135deg, hsl(0 78% 55%) 0 2px, transparent 2px 4px)',
                }}
              />
              Needs work
            </span>
            <span style={{ marginLeft: 'auto', fontSize: 12 }}>Tap any word to hear it</span>
          </div>

          <Transcript tokens={TRANSCRIPT_TOKENS} />
        </>
      )}

      <FluencyStats fluency={FLUENCY} />
      <VocabularyProfileBar profile={vocabularyProfile} />
    </div>
  );
}
